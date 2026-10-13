import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jiraEnvPath = path.join(__dirname, '.env.jira');
if (fs.existsSync(jiraEnvPath)) process.loadEnvFile(jiraEnvPath);

const reportPath = path.join(__dirname, 'QA_System_Audit_Report', '02_Full_Test_Execution_Report.md');
const statePath = path.join(__dirname, 'QA_System_Audit_Report', 'jira_sync_state.json');
const reportDirectory = path.dirname(reportPath);
const inProgressDefaults = new Set([
  'F-003', 'F-013', 'SEC-021', 'SEC-022', 'SEC-025',
  'SEC-029', 'AI-062', 'AI-067', 'HW-099', 'REG-122'
]);

function parseCases() {
  const text = fs.readFileSync(reportPath, 'utf8');
  const headers = [...text.matchAll(/^### Test ID: ([A-Z]+-\d+)\s*$/gm)];
  return headers.map((header, index) => {
    const end = headers[index + 1]?.index ?? text.length;
    const block = text.slice(header.index, end);
    const getField = (name) => block.match(new RegExp(`^- ${name}:\\s*(.*)$`, 'm'))?.[1]?.trim() || '';
    const stepsBlock = block.match(/^- Steps Taken:\s*\n([\s\S]*?)(?=^- Status:)/m)?.[1] || '';
    const steps = stepsBlock.split('\n').map((line) => line.trim()).filter(Boolean);
    const status = getField('Status');

    if (!['PASSED', 'FAILED'].includes(status)) {
      throw new Error(`Test case ${header[1]} has an unsupported status: ${status || 'missing'}`);
    }

    return {
      id: header[1],
      category: getField('Category'),
      title: getField('Description'),
      steps,
      status,
      outcome: getField('Outcome Explanation'),
      targetStatus: status === 'PASSED' ? 'Done' : inProgressDefaults.has(header[1]) ? 'In Progress' : 'To Do'
    };
  });
}

function groupSummary(cases) {
  return cases.reduce((summary, item) => {
    summary[item.targetStatus] += 1;
    return summary;
  }, { Done: 0, 'In Progress': 0, 'To Do': 0 });
}

function apiRequest(domain, email, token, endpoint, method, body) {
  const payload = body ? JSON.stringify(body) : null;
  const headers = {
    Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString('base64')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

  return new Promise((resolve, reject) => {
    const request = https.request({ hostname: domain, port: 443, path: endpoint, method, headers }, (response) => {
      let raw = '';
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => {
        let responseBody = {};
        try {
          responseBody = raw ? JSON.parse(raw) : {};
        } catch {
          responseBody = raw;
        }
        resolve({ statusCode: response.statusCode || 0, body: responseBody });
      });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

function requireOk(response, label) {
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`${label} failed (${response.statusCode}): ${JSON.stringify(response.body)}`);
  }
  return response.body;
}

async function getCurrentUser({ domain, email, token }) {
  const response = await apiRequest(domain, email, token, '/rest/api/3/myself', 'GET');
  return requireOk(response, 'Jira credential check');
}

async function getProject({ domain, email, token, projectKey }) {
  const response = await apiRequest(domain, email, token, `/rest/api/3/project/${projectKey}`, 'GET');
  return requireOk(response, 'Jira project lookup');
}

async function getPermissions({ domain, email, token, projectKey }) {
  const query = new URLSearchParams({
    projectKey,
    permissions: 'BROWSE_PROJECTS,CREATE_ISSUES,DELETE_ISSUES,TRANSITION_ISSUES'
  });
  const response = await apiRequest(domain, email, token, `/rest/api/3/mypermissions?${query}`, 'GET');
  return requireOk(response, 'Jira permission lookup').permissions || {};
}

async function getIssueTypes({ domain, email, token, projectKey }) {
  const query = new URLSearchParams({
    projectKeys: projectKey,
    expand: 'projects.issuetypes'
  });
  const response = await apiRequest(domain, email, token, `/rest/api/3/issue/createmeta?${query}`, 'GET');
  const body = requireOk(response, 'Jira issue type lookup');
  return body.projects?.[0]?.issuetypes || [];
}

async function getProjectIssues({ domain, email, token, projectKey }) {
  const issues = [];
  let nextPageToken;
  const maxResults = 100;

  while (true) {
    const query = new URLSearchParams({
      jql: `project = "${projectKey}" ORDER BY key ASC`,
      maxResults: String(maxResults),
      fields: 'summary,status,issuetype,labels,description,priority,assignee,reporter'
    });
    if (nextPageToken) query.set('nextPageToken', nextPageToken);

    const response = await apiRequest(domain, email, token, `/rest/api/3/search/jql?${query}`, 'GET');
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(`Jira issue search failed (${response.statusCode}): ${JSON.stringify(response.body)}`);
    }
    const page = response.body.issues || [];
    issues.push(...page);
    nextPageToken = response.body.nextPageToken;
    if (!page.length || response.body.isLast || !nextPageToken) break;
  }

  return issues;
}

function writeBackup(issues, projectKey) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(reportDirectory, `jira_${projectKey}_backup_${timestamp}.json`);
  const syncState = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
  fs.writeFileSync(backupPath, JSON.stringify({ projectKey, exportedAt: new Date().toISOString(), issues, syncState }, null, 2), { mode: 0o600 });
  return backupPath;
}

function verifyBackup(backupPath, expectedCount) {
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const actualCount = Array.isArray(backup.issues) ? backup.issues.length : -1;
  if (actualCount !== expectedCount) {
    throw new Error(`Backup verification failed: expected ${expectedCount} issues, found ${actualCount}.`);
  }
  return {
    projectKey: backup.projectKey,
    exportedAt: backup.exportedAt,
    issues: actualCount
  };
}

function adfDescription(item) {
  const lines = [
    `Audit ID: ${item.id}`,
    `Category: ${item.category}`,
    `Audit result: ${item.status}`,
    '',
    `Description: ${item.title}`,
    'Steps Taken:',
    ...item.steps,
    '',
    `Outcome: ${item.outcome}`
  ];

  return {
    type: 'doc',
    version: 1,
    content: lines.map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : []
    }))
  };
}

function writeState(imported) {
  fs.writeFileSync(statePath, JSON.stringify({ succeeded: imported, failed: [], fixed: [] }, null, 2));
}

function countIssueStatuses(issues) {
  return issues.reduce((summary, issue) => {
    const status = issue.fields?.status?.name || 'Unknown';
    summary[status] = (summary[status] || 0) + 1;
    return summary;
  }, {});
}

function isTargetStatus(status, target) {
  const aliases = {
    Done: ['done', 'resolved', 'closed'],
    'In Progress': ['in progress', 'in development', 'started'],
    'To Do': ['to do', 'open', 'backlog', 'new']
  };
  return (aliases[target] || []).includes(String(status || '').toLowerCase());
}

async function moveIssueToStatus({ domain, email, token, issueKey, targetStatus }) {
  const transitionsResponse = await apiRequest(domain, email, token, `/rest/api/3/issue/${issueKey}/transitions`, 'GET');
  if (transitionsResponse.statusCode < 200 || transitionsResponse.statusCode >= 300) {
    return 'transition-lookup-failed';
  }
  const transition = (transitionsResponse.body.transitions || []).find((candidate) => isTargetStatus(candidate.to?.name, targetStatus));
  if (!transition) return 'transition-unavailable';

  const response = await apiRequest(domain, email, token, `/rest/api/3/issue/${issueKey}/transitions`, 'POST', {
    transition: { id: String(transition.id) }
  });
  return response.statusCode >= 200 && response.statusCode < 300 ? 'updated' : 'transition-failed';
}

async function getAvailableTransitions({ domain, email, token, issueKey }) {
  if (!issueKey) return [];
  const response = await apiRequest(domain, email, token, `/rest/api/3/issue/${issueKey}/transitions`, 'GET');
  const body = requireOk(response, `Jira transition lookup for ${issueKey}`);
  return (body.transitions || []).map((transition) => ({
    id: String(transition.id),
    name: transition.name,
    to: transition.to?.name || ''
  }));
}

async function main() {
  const cases = parseCases();
  const summary = groupSummary(cases);
  const { JIRA_EMAIL: email, JIRA_API_TOKEN: token, JIRA_DOMAIN: configuredDomain } = process.env;
  const domain = configuredDomain?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const projectKey = process.env.JIRA_PROJECT || 'AIDE';
  const apply = process.env.JIRA_APPLY === '1';

  if (!/^[A-Z][A-Z0-9]+$/.test(projectKey)) {
    throw new Error('JIRA_PROJECT must be a valid uppercase Jira project key.');
  }

  console.log(JSON.stringify({ cases: cases.length, statuses: summary }, null, 2));
  if (!email || !token || !domain) {
    console.log('Preview only: set JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_DOMAIN in .env.jira to inspect Jira and make a backup.');
    return;
  }
  if (/^(replace|your-|todo|changeme|placeholder)/i.test(token.trim())) {
    throw new Error('JIRA_API_TOKEN still looks like a placeholder. Put a new private token in .env.jira.');
  }

  const currentUser = await getCurrentUser({ domain, email, token });
  const project = await getProject({ domain, email, token, projectKey });
  const issueTypes = await getIssueTypes({ domain, email, token, projectKey });
  const issueType = process.env.JIRA_ISSUE_TYPE || 'Bug';
  const issueTypeNames = issueTypes.map((item) => item.name).sort();
  if (!issueTypeNames.includes(issueType)) {
    throw new Error(`Issue type "${issueType}" is not available in ${projectKey}. Available: ${issueTypeNames.join(', ') || 'none'}`);
  }

  const permissions = await getPermissions({ domain, email, token, projectKey });
  const permissionSummary = Object.fromEntries(Object.entries(permissions).map(([key, value]) => [key, Boolean(value.havePermission)]));
  const missingPermissions = Object.entries(permissionSummary)
    .filter(([, allowed]) => !allowed)
    .map(([key]) => key);
  if (missingPermissions.length) {
    throw new Error(`Missing Jira permissions in ${projectKey}: ${missingPermissions.join(', ')}`);
  }

  const issues = await getProjectIssues({ domain, email, token, projectKey });
  const backupPath = writeBackup(issues, projectKey);
  const verifiedBackup = verifyBackup(backupPath, issues.length);
  const transitions = await getAvailableTransitions({ domain, email, token, issueKey: issues[0]?.key });
  console.log(JSON.stringify({
    jira: {
      domain,
      accountId: currentUser.accountId,
      project: { key: project.key, name: project.name, id: project.id },
      issueType,
      availableIssueTypes: issueTypeNames,
      permissions: permissionSummary,
      sampleIssueTransitions: issues[0] ? { issueKey: issues[0].key, transitions } : 'no existing issues to sample'
    },
    deletionPreview: {
      scope: `Every issue in project ${projectKey}, including unrelated issues`,
      issueCount: issues.length,
      backupPath,
      verifiedBackup
    }
  }, null, 2));

  const requiredConfirmation = `DELETE_${issues.length}_${projectKey}_ISSUES`;
  if (!apply || process.env.JIRA_CONFIRM_DELETE !== requiredConfirmation) {
    console.log('No Jira issues were deleted. Review the backup and preview, then set:');
    console.log(`JIRA_APPLY=1 JIRA_CONFIRM_DELETE=${requiredConfirmation}`);
    return;
  }

  console.log(`Deleting all ${issues.length} issues in project ${projectKey} as explicitly requested.`);
  writeState([]);
  for (const issue of issues) {
    const result = await apiRequest(domain, email, token, `/rest/api/3/issue/${issue.key}?deleteSubtasks=true`, 'DELETE');
    if (result.statusCode < 200 || result.statusCode >= 300) {
      throw new Error(`Deletion stopped at ${issue.key} (${result.statusCode}): ${JSON.stringify(result.body)}`);
    }
  }
  const imported = [];
  for (const item of cases) {
    const response = await apiRequest(domain, email, token, '/rest/api/3/issue', 'POST', {
      fields: {
        project: { key: projectKey },
        summary: `[${item.id}] ${item.title}`.slice(0, 255),
        issuetype: { name: issueType },
        labels: ['qa-audit', 'test-case', `audit-${item.status.toLowerCase()}`],
        description: adfDescription(item)
      }
    });
    if (response.statusCode < 200 || response.statusCode >= 300 || !response.body.key) {
      writeState(imported);
      throw new Error(`Import stopped at ${item.id}; ${imported.length} issues created: ${JSON.stringify(response.body)}`);
    }

    const record = { id: item.id, title: item.title, issueKey: response.body.key, mode: 'reset-import', targetStatus: item.targetStatus };
    imported.push(record);
    writeState(imported);

    if (item.targetStatus !== 'To Do') {
      record.transition = await moveIssueToStatus({ domain, email, token, issueKey: response.body.key, targetStatus: item.targetStatus });
      writeState(imported);
    }
  }

  const finalIssues = await getProjectIssues({ domain, email, token, projectKey });
  const transitionSummary = imported.reduce((result, item) => {
    const status = item.transition || 'not-needed';
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});
  console.log(JSON.stringify({
    importFinished: {
      created: imported.length,
      intendedStatusGroups: summary,
      transitionSummary,
      liveIssueCount: finalIssues.length,
      liveStatusCounts: countIssueStatuses(finalIssues)
    }
  }, null, 2));
}

main().catch((error) => {
  console.error('Jira reset/import stopped:', error.message);
  process.exitCode = 1;
});
