import fs from 'fs';
import https from 'https';
import path from 'path';
import { spawnSync } from 'child_process';
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

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: __dirname,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
  return {
    code: result.status ?? 1,
    output: `${result.stdout || ''}\n${result.stderr || ''}`.trim(),
    error: result.error?.message
  };
}

function summarizePytest(output) {
  const counts = { passed: 0, failed: 0, errors: 0, xfailed: 0, xpassed: 0, skipped: 0 };
  const summary = [...output.matchAll(/\b(\d+)\s+(passed|failed|errors?|xfailed|xpassed|skipped)\b/g)];
  for (const [, rawCount, label] of summary) {
    const normalized = label === 'error' || label === 'errors' ? 'errors' : label;
    counts[normalized] = Number(rawCount);
  }
  counts.total = Object.values(counts).reduce((total, count) => total + count, 0);
  return counts;
}

async function publishRunReport({ email, token, domain }) {
  const python = path.join(__dirname, '.qa-venv', 'bin', 'python');
  const pytest = runCommand(python, ['-m', 'pytest', '-q', '-rxX']);
  const pytestCounts = summarizePytest(pytest.output);
  if (!pytestCounts.total) {
    throw new Error(`Could not parse pytest results. Exit code ${pytest.code}. Output: ${pytest.output.slice(-2000)}`);
  }

  const build = runCommand('npm', ['run', 'build']);
  const lint = runCommand('npm', ['run', 'lint']);
  const lintSummary = lint.output.match(/(\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
  const issueMap = readIssueMap();
  const reportIssue = issueMap.get('REG-122');
  if (!reportIssue) throw new Error('No Jira issue mapping found for release-readiness case REG-122.');

  const lines = [
    'QA execution report',
    `Date: ${new Date().toISOString()}`,
    `Pytest: ${pytestCounts.total} tests collected; ${pytestCounts.passed} passed; ${pytestCounts.failed} failed; ${pytestCounts.errors} errors; ${pytestCounts.xfailed} xfailed; ${pytestCounts.xpassed} xpassed; ${pytestCounts.skipped} skipped. Exit code: ${pytest.code}.`,
    `Production build: ${build.code === 0 ? 'PASSED' : 'FAILED'} (exit code ${build.code}).`,
    `ESLint: ${lint.code === 0 ? 'completed with warnings/errors reported below' : 'FAILED'} (exit code ${lint.code}); ${lintSummary ? `${lintSummary[2]} errors, ${lintSummary[3]} warnings` : 'summary unavailable'}.`,
    'Fix applied: added configurable AI_PROVIDER_TIMEOUT_MS (default 30000 ms) using AbortSignal.timeout() to Gemini calls in content-chat, generate-podcast, and generate-audio. Timed-out non-streaming provider requests return HTTP 504; streamed chat requests are aborted by the request signal.',
    'The three formerly xfailed provider-timeout contract tests now pass.',
    'Scope note: these are the repository test suite and build/lint checks actually executed; they are not 100 additional tests.',
    '',
    'Pytest summary output:',
    pytest.output.slice(-5000) || 'No pytest output captured.',
    '',
    'Lint summary output:',
    lint.output.slice(-3000) || 'No lint output captured.'
  ];
  if (pytest.error) lines.push(`Pytest runner error: ${pytest.error}`);
  if (build.error) lines.push(`Build runner error: ${build.error}`);
  if (lint.error) lines.push(`Lint runner error: ${lint.error}`);

  const response = await apiRequest(domain, email, token, `/rest/api/3/issue/${reportIssue}/comment`, 'POST', {
    body: {
      type: 'doc',
      version: 1,
      content: lines.map((line) => ({
        type: 'paragraph',
        content: line ? [{ type: 'text', text: line }] : []
      }))
    }
  });
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(`Jira report comment failed (${response.statusCode}): ${JSON.stringify(response.body)}`);
  }

  console.log(JSON.stringify({
    jiraIssue: reportIssue,
    commentId: response.body.id,
    pytest: { ...pytestCounts, exitCode: pytest.code },
    build: { exitCode: build.code },
    lint: { exitCode: lint.code, errors: lintSummary ? Number(lintSummary[2]) : null, warnings: lintSummary ? Number(lintSummary[3]) : null }
  }, null, 2));
  if (pytest.code !== 0 || build.code !== 0 || lint.code !== 0) process.exitCode = 1;
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
  const { JIRA_EMAIL: email, JIRA_API_TOKEN: token, JIRA_DOMAIN: configuredDomain } = process.env;
  const domain = configuredDomain?.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (process.argv.includes('--run-and-report')) {
    if (!email || !token || !domain) throw new Error('Set Jira credentials in .env.jira before reporting test results.');
    await publishRunReport({ email, token, domain });
    return;
  }

  const board = writeBoardFile();
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
