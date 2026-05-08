import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { createProjectHealthReport } from './health.js';
import { sendStudioHealthRefreshedTelemetry, sendStudioStartedTelemetry } from '../telemetry.js';

const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

export interface StudioCommandOptions {
  host?: string;
  port?: number;
}

export interface StudioServerHandle {
  server: Server;
  url: string;
}

function sendJson(res: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendHtml(res: ServerResponse, body: string): void {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendNotFound(res: ServerResponse): void {
  sendJson(res, 404, { error: 'not_found' });
}

function studioHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Decantr Project Health</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #101014;
      --panel: #181820;
      --panel-2: #20202a;
      --line: #343442;
      --text: #f5f2eb;
      --muted: #ada7bd;
      --good: #5ee2a0;
      --warn: #f2bd61;
      --bad: #ff6f7d;
      --accent: #8ed3ff;
      --coral: #ff8b6a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at 20% 0%, rgba(255,139,106,0.16), transparent 26rem), var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.4;
    }
    button, input { font: inherit; }
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--line);
      background: rgba(16,16,20,0.84);
      backdrop-filter: blur(18px);
      position: sticky;
      top: 0;
      z-index: 2;
    }
    h1 { margin: 0; font-size: 1rem; letter-spacing: 0; }
    .subtle { color: var(--muted); font-size: 0.875rem; }
    .button {
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      border-radius: 8px;
      padding: 0.55rem 0.8rem;
      cursor: pointer;
    }
    .button:hover { border-color: var(--accent); }
    main { display: grid; grid-template-columns: 15rem 1fr; min-height: 0; }
    nav {
      border-right: 1px solid var(--line);
      padding: 1rem;
      background: rgba(24,24,32,0.66);
    }
    .tab {
      width: 100%;
      text-align: left;
      margin: 0 0 0.35rem;
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 0.65rem 0.7rem;
      color: var(--muted);
      background: transparent;
      cursor: pointer;
    }
    .tab[aria-selected="true"] {
      color: var(--text);
      border-color: var(--line);
      background: var(--panel-2);
    }
    .content { padding: 1rem; overflow: auto; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
    .card {
      border: 1px solid var(--line);
      background: linear-gradient(180deg, var(--panel), rgba(24,24,32,0.74));
      border-radius: 8px;
      padding: 1rem;
    }
    .metric { font-size: 1.85rem; font-weight: 720; }
    .label { color: var(--muted); font-size: 0.78rem; text-transform: uppercase; }
    .status-healthy { color: var(--good); }
    .status-warning { color: var(--warn); }
    .status-error { color: var(--bad); }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid var(--line); padding: 0.7rem; text-align: left; vertical-align: top; }
    th { color: var(--muted); font-size: 0.78rem; text-transform: uppercase; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    pre {
      white-space: pre-wrap;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1rem;
      background: #0c0c10;
      overflow: auto;
    }
    .pill { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 0.2rem 0.55rem; }
    .stack { display: grid; gap: 0.75rem; }
    .hidden { display: none; }
    @media (max-width: 760px) {
      main { grid-template-columns: 1fr; }
      nav { border-right: 0; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.35rem; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div>
        <h1>Decantr Project Health</h1>
        <div id="project" class="subtle">Loading local contract state...</div>
      </div>
      <button id="refresh" class="button" type="button">Refresh</button>
    </header>
    <main>
      <nav aria-label="Project Health Views">
        <button class="tab" type="button" data-tab="overview" aria-selected="true">Overview</button>
        <button class="tab" type="button" data-tab="routes">Routes</button>
        <button class="tab" type="button" data-tab="drift">Drift</button>
        <button class="tab" type="button" data-tab="findings">Findings</button>
        <button class="tab" type="button" data-tab="remediation">Remediation</button>
        <button class="tab" type="button" data-tab="ci">CI</button>
        <button class="tab" type="button" data-tab="packs">Packs</button>
      </nav>
      <section class="content">
        <div id="overview" class="view stack"></div>
        <div id="routes" class="view stack hidden"></div>
        <div id="drift" class="view stack hidden"></div>
        <div id="findings" class="view stack hidden"></div>
        <div id="remediation" class="view stack hidden"></div>
        <div id="ci" class="view stack hidden"></div>
        <div id="packs" class="view stack hidden"></div>
      </section>
    </main>
  </div>
  <script>
    let report = null;
    const tabs = [...document.querySelectorAll('.tab')];
    const views = [...document.querySelectorAll('.view')];
    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    }
    function metric(label, value, cls = '') {
      return '<div class="card"><div class="label">' + esc(label) + '</div><div class="metric ' + cls + '">' + esc(value) + '</div></div>';
    }
    function table(headers, rows) {
      return '<table><thead><tr>' + headers.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map((row) => '<tr>' + row.map((cell) => '<td>' + cell + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
    }
    function render() {
      if (!report) return;
      document.getElementById('project').textContent = report.projectRoot;
      document.getElementById('overview').innerHTML =
        '<div class="grid">' +
        metric('Status', report.status, 'status-' + report.status) +
        metric('Score', report.score + '/100') +
        metric('Errors', report.summary.errorCount, 'status-error') +
        metric('Warnings', report.summary.warnCount, 'status-warning') +
        '</div><div class="card"><div class="label">Workflow</div><p>' + esc(report.summary.workflowMode || 'unknown') + ' / ' + esc(report.summary.adoptionMode || 'unknown') + '</p><p class="subtle">Generated ' + esc(report.generatedAt) + '</p></div>';
      document.getElementById('routes').innerHTML =
        '<div class="card"><div class="label">Route Coverage</div><p>Declared routes: ' + report.routes.declared.length + ' | runtime checked: ' + report.routes.runtimeChecked.length + ' | matched: ' + report.routes.runtimeMatched + '</p></div>' +
        table(['Declared Route'], report.routes.declared.map((route) => ['<code>' + esc(route) + '</code>'])) +
        (report.routes.issues.length ? '<div class="card"><div class="label">Route Issues</div><ul>' + report.routes.issues.map((issue) => '<li>' + esc(issue) + '</li>').join('') + '</ul></div>' : '');
      const drift = report.findings.filter((finding) => finding.source === 'brownfield' || finding.id.includes('drift'));
      document.getElementById('drift').innerHTML = drift.length
        ? table(['Severity', 'Source', 'Message'], drift.map((finding) => [esc(finding.severity), esc(finding.source), esc(finding.message)]))
        : '<div class="card">No drift findings.</div>';
      document.getElementById('findings').innerHTML = report.findings.length
        ? table(['Severity', 'Source', 'Finding', 'Prompt'], report.findings.map((finding) => [
            '<span class="pill">' + esc(finding.severity) + '</span>',
            esc(finding.source),
            '<strong>' + esc(finding.id) + '</strong><br><span class="subtle">' + esc(finding.message) + '</span>',
            '<code>decantr health --prompt ' + esc(finding.id) + '</code>'
          ]))
        : '<div class="card">No findings. Project is healthy.</div>';
      document.getElementById('remediation').innerHTML = report.findings.length
        ? report.findings.map((finding) => '<div class="card"><div class="label">' + esc(finding.id) + '</div><p>' + esc(finding.remediation.summary) + '</p><pre>' + esc(finding.remediation.prompt) + '</pre></div>').join('')
        : '<div class="card">No remediation needed.</div>';
      document.getElementById('ci').innerHTML = '<div class="card"><div class="label">Recommended CI Gate</div><pre>' + esc(report.ci.recommendedCommand) + '</pre></div>';
      document.getElementById('packs').innerHTML =
        '<div class="grid">' +
        metric('Manifest', report.packs.manifestPresent ? 'present' : 'missing') +
        metric('Review', report.packs.reviewPackPresent ? 'present' : 'missing') +
        metric('Sections', report.packs.sectionPackCount) +
        metric('Pages', report.packs.pagePackCount) +
        '</div><div class="card"><div class="label">Generated</div><p>' + esc(report.packs.generatedAt || 'unknown') + '</p></div>';
    }
    async function load(refresh = false) {
      const response = await fetch(refresh ? '/api/refresh' : '/api/health', { method: refresh ? 'POST' : 'GET' });
      report = await response.json();
      render();
    }
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      views.forEach((view) => view.classList.toggle('hidden', view.id !== tab.dataset.tab));
    }));
    document.getElementById('refresh').addEventListener('click', () => load(true));
    load().catch((error) => {
      document.getElementById('overview').innerHTML = '<div class="card status-error">Failed to load health report: ' + esc(error.message) + '</div>';
    });
  </script>
</body>
</html>`;
}

export function createStudioRequestHandler(projectRoot: string) {
  return async function handleStudioRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        sendHtml(res, studioHtml());
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/health') {
        sendJson(res, 200, await createProjectHealthReport(projectRoot));
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/refresh') {
        const startedAt = Date.now();
        const report = await createProjectHealthReport(projectRoot);
        void sendStudioHealthRefreshedTelemetry({
          durationMs: Date.now() - startedAt,
          projectRoot,
          report,
          trigger: 'api-refresh',
        });
        sendJson(res, 200, report);
        return;
      }
      sendNotFound(res);
    } catch (e) {
      sendJson(res, 500, { error: 'health_report_failed', message: (e as Error).message });
    }
  };
}

export async function startStudioServer(
  projectRoot: string = process.cwd(),
  options: StudioCommandOptions = {},
): Promise<StudioServerHandle> {
  const host = options.host ?? '127.0.0.1';
  const port = options.port ?? 4319;
  const server = createServer(createStudioRequestHandler(projectRoot));

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve();
    });
  });

  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  return { server, url: `http://${host}:${actualPort}` };
}

export async function cmdStudio(
  projectRoot: string = process.cwd(),
  options: StudioCommandOptions = {},
): Promise<void> {
  const handle = await startStudioServer(projectRoot, options);
  const url = new URL(handle.url);
  void sendStudioStartedTelemetry({
    host: url.hostname,
    port: Number.parseInt(url.port, 10),
    projectRoot,
  });
  console.log(`${GREEN}Decantr Studio is running.${RESET}`);
  console.log(`${CYAN}${handle.url}${RESET}`);
  console.log('Press Ctrl+C to stop.');
}

export function parseStudioArgs(args: string[]): StudioCommandOptions {
  const options: StudioCommandOptions = {};

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--host' && args[index + 1]) {
      options.host = args[++index];
    } else if (arg.startsWith('--host=')) {
      options.host = arg.split('=')[1];
    } else if (arg === '--port' && args[index + 1]) {
      options.port = Number.parseInt(args[++index], 10);
    } else if (arg.startsWith('--port=')) {
      options.port = Number.parseInt(arg.split('=')[1], 10);
    }
  }

  if (options.port !== undefined && (!Number.isInteger(options.port) || options.port < 0)) {
    throw new Error('Invalid --port value.');
  }

  return options;
}
