import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jiraEnvPath = path.join(__dirname, '.env.jira');
if (fs.existsSync(jiraEnvPath)) process.loadEnvFile(jiraEnvPath);

const boardOutputPath = path.join(__dirname, 'QA_System_Audit_Report', 'jira_board_status.json');
const auditReportPath = path.join(__dirname, 'QA_System_Audit_Report', '02_Full_Test_Execution_Report.md');
const statePath = path.join(__dirname, 'QA_System_Audit_Report', 'jira_sync_state.json');

const inProgressDefaults = [
  'F-003',
  'F-013',
  'SEC-021',
  'SEC-022',
  'SEC-025',
  'SEC-029',
  'AI-062',
  'AI-067',
  'HW-099',
  'REG-122'
];

function parseAuditStatuses(reportPath) {
  const text = fs.readFileSync(reportPath, 'utf8');
  const matches = [...text.matchAll(/Test ID: ([A-Z]+-\d+)[\s\S]*?Status: (PASSED|FAILED)/g)];
  const passed = [];
  const failed = [];

  for (const [, id, status] of matches) {
    if (status === 'PASSED') {
      passed.push(id);
    } else {
      failed.push(id);
    }
  }

  return { passed, failed };
}

function buildBoard() {
  const { passed, failed } = parseAuditStatuses(auditReportPath);
  const inProgress = failed.filter((id) => inProgressDefaults.includes(id));
  const toDo = failed.filter((id) => !inProgressDefaults.includes(id));

  return {
    summary: {
      total: passed.length + failed.length,
      done: passed.length,
      inProgress: inProgress.length,
      toDo: toDo.length,
      fixed: 0,
      blocked: 0,
      failed: failed.length
    },
    done: passed,
    in_progress: inProgress,
    to_do: toDo,
    fixed: [],
    blocked: [],
    source: 'QA_System_Audit_Report/02_Full_Test_Execution_Report.md'
  };
}

function writeBoardFile() {
  const board = buildBoard();
  fs.writeFileSync(boardOutputPath, JSON.stringify(board, null, 2));
  console.log('Board file created at:', boardOutputPath);
  console.log(JSON.stringify(board.summary, null, 2));
  return board;
}

function readIssueMap() {
  if (!fs.existsSync(statePath)) return new Map();

  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const entries = [...(state.succeeded || []), ...(state.fixed || [])];
  return new Map(entries.filter((item) => item.id && item.issueKey).map((item) => [item.id, item.issueKey]));
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

const statusAliases = {
  'To Do': ['to do', 'open', 'backlog', 'new'],
  'In Progress': ['in progress', 'in development', 'started'],
  Done: ['done', 'resolved', 'closed']
};

function matchesStatus(status, target) {
  return (statusAliases[target] || [target.toLowerCase()]).includes(String(status || '').toLowerCase());
}

async function syncIssue({ issueKey, targetStatus, domain, email, token, apply }) {
  const issueResponse = await apiRequest(domain, email, token, `/rest/api/3/issue/${issueKey}?fields=status`, 'GET');
  if (issueResponse.statusCode < 200 || issueResponse.statusCode >= 300) {
    return { issueKey, targetStatus, result: 'lookup-failed', detail: issueResponse.body };
  }

  const currentStatus = issueResponse.body?.fields?.status?.name || 'Unknown';
  if (matchesStatus(currentStatus, targetStatus)) {
    return { issueKey, targetStatus, currentStatus, result: 'already-correct' };
  }
  if (!apply) {
    return { issueKey, targetStatus, currentStatus, result: 'preview-only' };
  }

  const transitionsResponse = await apiRequest(domain, email, token, `/rest/api/3/issue/${issueKey}/transitions`, 'GET');
  if (transitionsResponse.statusCode < 200 || transitionsResponse.statusCode >= 300) {
    return { issueKey, targetStatus, currentStatus, result: 'transition-lookup-failed', detail: transitionsResponse.body };
  }

  const transition = (transitionsResponse.body?.transitions || []).find((item) => matchesStatus(item.to?.name, targetStatus));
  if (!transition) {
    return { issueKey, targetStatus, currentStatus, result: 'transition-unavailable' };
  }

  const result = await apiRequest(domain, email, token, `/rest/api/3/issue/${issueKey}/transitions`, 'POST', {
    transition: { id: String(transition.id) }
  });
  return {
    issueKey,
    targetStatus,
    currentStatus,
    result: result.statusCode >= 200 && result.statusCode < 300 ? 'updated' : 'update-failed',
    ...(result.statusCode >= 300 ? { detail: result.body } : {})
  };
}

async function main() {
  const board = writeBoardFile();
  const { JIRA_EMAIL: email, JIRA_API_TOKEN: token, JIRA_DOMAIN: configuredDomain } = process.env;
  const domain = configuredDomain?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const apply = process.env.JIRA_APPLY === '1';

  if (!email || !token || !domain) {
    console.log('Jira was not changed: set JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_DOMAIN in this terminal.');
    return;
  }

  const issueMap = readIssueMap();
  const groups = [
    ['Done', board.done],
    ['In Progress', board.in_progress],
    ['To Do', board.to_do]
  ];
  const tasks = groups.flatMap(([targetStatus, ids]) => ids
    .filter((id) => issueMap.has(id))
    .map((id) => ({ issueKey: issueMap.get(id), targetStatus })));
  const unmappedCount = board.summary.total - tasks.length;

  console.log(`${apply ? 'Applying' : 'Previewing'} Jira status updates for ${tasks.length} mapped issues; ${unmappedCount} audit IDs have no Jira issue mapping.`);
  if (!apply) console.log('Preview only. Set JIRA_APPLY=1 to apply transitions after reviewing this mapping.');

  const results = [];
  for (const task of tasks) {
    try {
      results.push(await syncIssue({ ...task, domain, email, token, apply }));
    } catch (error) {
      results.push({ ...task, result: 'request-error', detail: error.message });
    }
  }

  const counts = results.reduce((summary, item) => {
    summary[item.result] = (summary[item.result] || 0) + 1;
    return summary;
  }, {});
  console.log('Jira sync result:', JSON.stringify({ counts, unmappedCount }, null, 2));
  const exceptions = results.filter((item) => !['updated', 'already-correct', 'preview-only'].includes(item.result));
  if (exceptions.length) console.log('Issues needing attention:', JSON.stringify(exceptions, null, 2));
}

main().catch((error) => {
  console.error('Jira sync failed:', error.message);
  process.exitCode = 1;
});
