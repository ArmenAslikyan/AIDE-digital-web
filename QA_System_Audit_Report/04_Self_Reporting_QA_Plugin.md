# Self-Reporting QA Plugin Guide

## Ներածություն

Այս 프로젝트ում հիմնված QA report-ing plugin-ների համար առկա չէ专门 համայնքային կամ project-specific plugin, որը ինքնաբերաբար Jira կամ Markdown report պատրաստի։ Search-ի արդյունքը ցույց է տալիս, որ repo-ում կա միայն Vite plugin և ESLint plugin, բայց ոչ QA/Jira self-reporting plugin։

Գտված relevant evidence-ներ՝

- [vite.config.ts](../vite.config.ts) imports `@vitejs/plugin-react-swc`
- [eslint.config.js](../eslint.config.js) configures ESLint plugins
- Repo-ում չկա dedicated QA report plugin, issue reporter, or Jira sync extension

## Կարճ պատասխանը

- Ոչ՝ այս codebase-ում հիմա գոյություն չունի QA self-reporting plugin։
- Այո՝ կարելի է ավելացնել lightweight self-reporting workflow, որը ավտոմատ հավաքում է failed test cases, security findings, և Jira-ready issues։

## Կա՞ plugin, որը կարող է ինքն իրեն report անել

«Self-reporting» բառի իմաստը կարող է լինել երկու բան.

1. Plugin, որը ավտոմատ հավաքում է bugs և ստեղծում report։
2. Plugin, որը կարող է issue-ներ ուղարկել Jira / Markdown / JSON ձևաչափով։

Այս project-ի համար ամենահարմար տարբերակը հետևյալն է՝

- Frontend/QA runner: Playwright or Cypress
- Reporting layer: custom script or plugin that reads test results and writes Markdown/JSON
- Jira integration: custom exporter that converts findings into Jira-ready issue objects

## Ռекомендуված architecture

### 1. Test collector

- Runs smoke, regression, security checks
- Captures failed cases, stack traces, screenshots, URLs, timestamps
- Writes structured results to JSON

### 2. Report generator

- Reads result JSON
- Sorts by Severity, Priority, Category
- Exports to Markdown and Jira payload

### 3. Jira uploader

- Pushes issue records to Jira using REST API
- Adds Summary, Description, Labels, Environment, Affected Area

## Օրինակ QA self-report workflow

- Run tests
- Save raw results to `qa-results.json`
- Process results with `qa-report-generator`
- Output `QA_System_Audit_Report/03_Jira_Failed_Bugs_Report.md`
- Optionally send issues to Jira automatically

## Ներքին recommendation

Եթե ուզում եք աշխատել այս project-ի վրա, ապա լավագույն տարբերակը ոչ թե plugin install անելն է, այլ lightweight custom report tool։

Այն ունի հետևյալ առավելությունները՝

- codebase-ի վրա չի լինում risky dependency bloat
- չի խանգարում app-ի runtime-ին
- կարող է export անել Markdown, JSON, Jira payload
- կարող է reuse անել current QA report structure

## Practical suggestion for this repository

Recommended next step:

- add a script folder such as `qa-tools/`
- add a `qa-report-generator.mjs` script
- read `test-results.json`
- create Markdown and Jira objects automatically
- optionally submit to Jira with API token

## Non-technical explanation

Այս project-ը չունի պատրաստի QA reporting plugin, բայց ինչ-որ մեկը հեշտությամբ կարող է ստեղծել such tool, որը ինքն իրեն անում է report: գնում է test failures, դասավորում է ըստ կարևորության, և պատրաստում Jira issue-ներ։ Սա շատ ավելի օգտակար է, քան ձեռքով copy-paste անել, որովհետև դա նվազեցնում է սխալները և արագացնում QA գործընթացը։

## Final verdict

- Existing project plugin: No dedicated QA self-reporting plugin found
- Recommended approach: custom lightweight reporting tool with Jira export
- Suitable for this repo: Yes
