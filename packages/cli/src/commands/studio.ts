import { existsSync, readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { isAbsolute, join, resolve } from 'node:path';
import { PROJECT_HEALTH_REPORT_V2_SCHEMA_URL, type ProjectHealthReport } from '@decantr/verifier';
import { sendStudioHealthRefreshedTelemetry, sendStudioStartedTelemetry } from '../telemetry.js';
import { createProjectHealthReport } from './health.js';
import { createWorkspaceHealthReport } from './workspace.js';

const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const PROJECT_HEALTH_SCHEMA_URL = PROJECT_HEALTH_REPORT_V2_SCHEMA_URL;

export interface StudioCommandOptions {
  host?: string;
  port?: number;
  report?: string;
  workspace?: boolean;
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

function resolveReportPath(
  projectRoot: string,
  reportPath: string | undefined,
): string | undefined {
  if (!reportPath) return undefined;
  return isAbsolute(reportPath) ? reportPath : resolve(projectRoot, reportPath);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readProjectHealthReport(reportPath: string): ProjectHealthReport {
  const parsed = JSON.parse(readFileSync(reportPath, 'utf-8')) as unknown;
  if (!isRecord(parsed) || parsed.$schema !== PROJECT_HEALTH_SCHEMA_URL) {
    throw new Error('Report file is not a Decantr Project Health v2 JSON document.');
  }
  if (
    typeof parsed.generatedAt !== 'string' ||
    typeof parsed.projectRoot !== 'string' ||
    !['healthy', 'warning', 'error'].includes(String(parsed.status)) ||
    typeof parsed.score !== 'number' ||
    !isRecord(parsed.summary) ||
    !isRecord(parsed.routes) ||
    !isRecord(parsed.packs) ||
    !isRecord(parsed.loop) ||
    !isRecord(parsed.authority) ||
    !isRecord(parsed.evidenceTier) ||
    !isRecord(parsed.ci) ||
    !Array.isArray(parsed.findings)
  ) {
    throw new Error('Report file is not a Decantr Project Health JSON document.');
  }
  return parsed as ProjectHealthReport;
}

function studioHtml(reportMode = false): string {
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
      --panel: #171821;
      --panel-2: #20212b;
      --panel-soft: #13141a;
      --line: rgba(245,242,235,0.12);
      --line-soft: rgba(245,242,235,0.07);
      --text: #f5f2eb;
      --muted: #ada7bd;
      --muted-2: #817b90;
      --good: #5ee2a0;
      --warn: #f2bd61;
      --bad: #ff6f7d;
      --accent: #8ed3ff;
      --ink: #0c0c10;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    button, input { font: inherit; }
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--line);
      background: rgba(16,16,20,0.84);
      backdrop-filter: blur(18px);
      position: sticky;
      top: 0;
      z-index: 2;
    }
    h1 { margin: 0; font-size: 1rem; letter-spacing: 0; }
    .subtle { color: var(--muted); font-size: 0.875rem; }
    .meta-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
    .button {
      border: 1px solid var(--line-soft);
      background: rgba(245,242,235,0.045);
      color: var(--text);
      border-radius: 8px;
      padding: 0.55rem 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }
    .button.strong {
      border-color: rgba(142,211,255,0.42);
      background: linear-gradient(120deg, rgba(142,211,255,0.16), rgba(142,211,255,0.04));
    }
    .button:hover { border-color: var(--accent); }
    .button:focus-visible, .tab:focus-visible, .action-tab:focus-visible, .finding-choice:focus-visible, input:focus-visible, select:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
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
      padding: 0.7rem 0.8rem;
      color: var(--muted);
      background: transparent;
      cursor: pointer;
    }
    .tab[aria-selected="true"] {
      color: var(--text);
      border-color: transparent;
      background: rgba(245,242,235,0.06);
    }
    .content { padding: 1.15rem 1rem; overflow: auto; }
    #overview.stack { gap: 1.15rem; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.6rem; }
    .status-strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border-top: 1px solid var(--line-soft);
      border-bottom: 1px solid var(--line-soft);
    }
    .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
    .card {
      border: 1px solid var(--line-soft);
      background: rgba(245,242,235,0.025);
      border-radius: 8px;
      padding: 1rem;
    }
    .panel {
      border: 1px solid var(--line-soft);
      background: rgba(245,242,235,0.018);
      border-radius: 8px;
      padding: 0.95rem;
    }
    .hero {
      border: 0;
      border-left: 4px solid var(--line);
      background: linear-gradient(110deg, rgba(245,242,235,0.055), rgba(245,242,235,0.015) 62%, transparent);
      border-radius: 8px;
      padding: 1.15rem;
      display: grid;
      gap: 0.85rem;
    }
    .hero-error { border-left-color: var(--bad); }
    .hero-warning { border-left-color: var(--warn); }
    .hero-healthy { border-left-color: var(--good); }
    .hero h2 { margin: 0; font-size: 1.55rem; line-height: 1.18; letter-spacing: 0; }
    .hero p { margin: 0; color: var(--muted); max-width: 72rem; }
    .hero-summary {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 1rem;
      align-items: end;
    }
    .hero-primary { display: grid; gap: 0.75rem; }
    .hero-priority {
      min-width: min(26rem, 100%);
      border-left: 1px solid var(--line);
      padding-left: 1rem;
      display: grid;
      gap: 0.25rem;
    }
    .hero-priority strong { font-size: 0.98rem; }
    .stat {
      min-height: 4rem;
      border: 0;
      border-left: 1px solid var(--line-soft);
      background: transparent;
      border-radius: 0;
      padding: 0.7rem 0.9rem;
      display: grid;
      align-content: center;
      gap: 0.25rem;
    }
    .stat:first-child { border-left: 0; }
    .tone-error {
      border-color: rgba(255,111,125,0.24);
      background:
        linear-gradient(110deg, rgba(255,111,125,0.105), rgba(255,111,125,0.035) 38%, rgba(255,111,125,0) 74%),
        var(--panel);
    }
    .tone-warn {
      border-color: rgba(242,189,97,0.24);
      background:
        linear-gradient(110deg, rgba(242,189,97,0.105), rgba(242,189,97,0.034) 38%, rgba(242,189,97,0) 74%),
        var(--panel);
    }
    .tone-info {
      border-color: rgba(142,211,255,0.18);
      background:
        linear-gradient(110deg, rgba(142,211,255,0.07), rgba(142,211,255,0.024) 38%, rgba(142,211,255,0) 74%),
        var(--panel);
    }
    .stat.tone-error, .stat.tone-warn, .stat.tone-info {
      background: transparent;
    }
    .stat.tone-error { --tone-bg: linear-gradient(110deg, rgba(255,111,125,0.12), rgba(255,111,125,0.02) 70%, transparent); }
    .stat.tone-warn { --tone-bg: linear-gradient(110deg, rgba(242,189,97,0.12), rgba(242,189,97,0.02) 70%, transparent); }
    .stat.tone-info { --tone-bg: linear-gradient(110deg, rgba(142,211,255,0.08), rgba(142,211,255,0.02) 70%, transparent); }
    .metric { font-size: 1.42rem; font-weight: 720; line-height: 1.05; }
    .label { color: var(--muted-2); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0; }
    .icon {
      width: 1rem;
      height: 1rem;
      flex: 0 0 auto;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }
    .icon-title {
      display: inline-flex;
      align-items: center;
      gap: 0.42rem;
    }
    .stat .label, .section-title, .action-title {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }
    .button .icon, .action-tab .icon {
      width: 0.95rem;
      height: 0.95rem;
    }
    .section-title { margin: 0; font-size: 0.95rem; letter-spacing: 0; }
    .section-kicker { color: var(--muted-2); font-size: 0.8rem; margin: 0.1rem 0 0; }
    .section-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.1rem;
    }
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
      background: var(--ink);
      overflow: auto;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: 0;
      border-radius: 999px;
      padding: 0.2rem 0.55rem;
      color: var(--text);
      background: rgba(255,255,255,0.045);
      font-size: 0.78rem;
    }
    .pill-error { border-color: rgba(255,111,125,0.48); color: var(--bad); }
    .pill-warn { border-color: rgba(242,189,97,0.48); color: var(--warn); }
    .pill-info { border-color: rgba(142,211,255,0.48); color: var(--accent); }
    .stack { display: grid; gap: 0.75rem; align-content: start; }
    .split { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(28rem, 1.05fr); gap: 1.35rem; align-items: start; }
    .finding-list { display: grid; gap: 0.5rem; }
    .finding-card { display: grid; gap: 0.5rem; }
    .finding-card.compact { gap: 0.45rem; }
    .finding-card.compact .finding-message {
      color: var(--muted);
      font-size: 0.9rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .finding-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
    .finding-title {
      margin: 0;
      font-size: 0.95rem;
      letter-spacing: 0;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .finding-message {
      margin: 0;
      color: var(--text);
      max-width: 82ch;
    }
    .finding-fix { margin: 0; color: var(--muted); font-size: 0.88rem; }
    .finding-choice {
      width: 100%;
      text-align: left;
      color: var(--text);
      border: 0;
      border-left: 3px solid transparent;
      border-bottom: 1px solid var(--line-soft);
      background: transparent;
      border-radius: 0;
      padding: 0.78rem 0.35rem 0.78rem 0.75rem;
      display: grid;
      gap: 0.45rem;
      cursor: pointer;
    }
    .finding-choice[aria-pressed="true"] {
      border-color: rgba(142,211,255,0.58);
      background: rgba(142,211,255,0.045);
      box-shadow: none;
    }
    .finding-choice.tone-error, .finding-choice.tone-warn, .finding-choice.tone-info { background: transparent; }
    .finding-choice.tone-error { border-left-color: rgba(255,111,125,0.58); }
    .finding-choice.tone-warn { border-left-color: rgba(242,189,97,0.58); }
    .finding-choice.tone-info { border-left-color: rgba(142,211,255,0.5); }
    .finding-choice[aria-pressed="true"].tone-error,
    .finding-choice[aria-pressed="true"].tone-warn,
    .finding-choice[aria-pressed="true"].tone-info { background: rgba(142,211,255,0.045); }
    .finding-choice p {
      margin: 0;
      color: var(--muted);
      font-size: 0.88rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .choice-action { color: var(--accent); font-size: 0.82rem; }
    .toolbar { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .action-panel {
      padding: 0;
      overflow: hidden;
      border: 0;
      background: transparent;
    }
    .action-step {
      display: grid;
      gap: 0.55rem;
      padding: 0;
      border-top: 0;
    }
    .action-step:first-child { border-top: 0; }
    .action-title { margin: 0; font-size: 0.98rem; letter-spacing: 0; }
    .action-tabs {
      display: flex;
      gap: 0.2rem;
      border-bottom: 1px solid var(--line-soft);
      background: transparent;
    }
    .action-tab {
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--muted);
      border-radius: 0;
      padding: 0.5rem 0.7rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .action-tab[aria-selected="true"] {
      border-bottom-color: var(--accent);
      background: transparent;
      color: var(--text);
    }
    .action-body { display: grid; gap: 0.75rem; }
    .action-copy { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .action-copy .copy-status { min-width: 3.5rem; }
    .prompt-preview {
      max-height: 18rem;
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.5;
      background: rgba(12,12,16,0.62);
      border: 0;
      border-radius: 8px;
      padding: 0.85rem;
      overflow: auto;
      display: grid;
      gap: 0.8rem;
    }
    .prompt-section {
      display: grid;
      gap: 0.4rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--line-soft);
    }
    .prompt-section:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
    .prompt-heading {
      color: var(--muted-2);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0;
    }
    .prompt-preview p {
      margin: 0;
      color: var(--muted);
    }
    .prompt-meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.45rem;
    }
    .prompt-meta-item {
      border-top: 1px solid var(--line-soft);
      border-radius: 0;
      padding: 0.5rem 0;
      background: transparent;
    }
    .prompt-meta-item strong {
      display: block;
      color: var(--muted-2);
      font-size: 0.7rem;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
    }
    .prompt-message {
      grid-column: 1 / -1;
    }
    .prompt-preview ul {
      margin: 0;
      padding-left: 1.1rem;
      color: var(--muted);
    }
    .prompt-preview li + li { margin-top: 0.35rem; }
    .prompt-preview code {
      border: 1px solid var(--line-soft);
      border-radius: 5px;
      background: rgba(245,242,235,0.06);
      padding: 0.08rem 0.28rem;
      color: var(--text);
    }
    .prompt-command-list {
      list-style: none;
      padding: 0;
      display: grid;
      gap: 0.45rem;
    }
    .prompt-command-list code {
      display: block;
      padding: 0.45rem 0.55rem;
      background: var(--ink);
      overflow-wrap: anywhere;
    }
    .explain-block {
      border: 0;
      border-left: 2px solid var(--line-soft);
      border-radius: 0;
      padding: 0.35rem 0 0.35rem 0.75rem;
      background: transparent;
      display: grid;
      gap: 0.35rem;
    }
    .explain-block p { margin: 0; color: var(--muted); }
    .verify-list { display: grid; gap: 0.45rem; }
    .verify-list code {
      display: block;
      border: 1px solid var(--line-soft);
      border-radius: 8px;
      background: rgba(12,12,16,0.72);
      padding: 0.45rem 0.55rem;
      overflow-wrap: anywhere;
    }
    input, select {
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      border-radius: 8px;
      padding: 0.55rem 0.65rem;
      min-height: 2.35rem;
    }
    input { min-width: min(22rem, 100%); }
    details {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.7rem;
      background: rgba(255,255,255,0.02);
    }
    summary { cursor: pointer; color: var(--muted); }
    .command-block { display: grid; gap: 0.35rem; }
    .command-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .command-row code {
      flex: 1 1 18rem;
      min-width: 0;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--ink);
      padding: 0.45rem 0.55rem;
      overflow-wrap: anywhere;
    }
    .command-help { margin: 0; color: var(--muted-2); font-size: 0.82rem; }
    .overview-rail {
      position: sticky;
      top: 5rem;
      background: rgba(245,242,235,0.026);
      border-left: 1px solid var(--line-soft);
      border-radius: 8px;
      padding: 0.85rem 0.9rem 0.95rem;
    }
    .quick-line {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.6rem;
    }
    .signal {
      border-top: 1px solid var(--line-soft);
      padding-top: 0.65rem;
      display: grid;
      gap: 0.2rem;
    }
    .signal strong { font-size: 1rem; }
    .mini-map { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; }
    .source-item {
      min-height: 4.25rem;
      border: 1px solid var(--line-soft);
      border-radius: 8px;
      padding: 0.7rem;
      display: grid;
      gap: 0.2rem;
      align-content: start;
      background: rgba(245,242,235,0.02);
    }
    .details-band {
      border: 0;
      border-top: 1px solid var(--line-soft);
      border-radius: 0;
      padding: 0.85rem 0 0;
      background: transparent;
    }
    .details-band summary { color: var(--text); }
    .details-content { margin-top: 0.75rem; display: grid; gap: 0.75rem; }
    .copy-status { min-height: 1.2rem; }
    .empty { color: var(--muted); }
    .hidden { display: none; }
    @media (max-width: 1100px) {
      .split { grid-template-columns: 1fr; }
      .overview-rail { position: static; }
    }
    @media (max-width: 760px) {
      main { grid-template-columns: 1fr; }
      nav { border-right: 0; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.35rem; }
      .grid, .grid-2, .grid-3, .split, .mini-map, .quick-line, .status-strip, .hero-summary, .action-tabs { grid-template-columns: 1fr; }
      .overview-rail { position: static; }
      .hero-priority { border-left: 0; border-top: 1px solid var(--line); padding-left: 0; padding-top: 0.85rem; }
      .finding-head { display: grid; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div>
        <h1>Decantr Project Health</h1>
        <div class="meta-row">
          <span id="mode" class="pill">Loading mode</span>
          <span id="project" class="subtle">Loading local contract state...</span>
        </div>
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
    let remediationFindingId = null;
    let overviewFindingId = null;
    let overviewActionMode = 'ai';
    const studioMode = ${JSON.stringify(reportMode ? 'report' : 'project')};
    const findingFilters = { severity: 'all', source: 'all', query: '' };
    const SEVERITY_ORDER = { error: 0, warn: 1, info: 2 };
    const SOURCE_ORDER = { check: 0, interaction: 1, runtime: 2, pack: 3, brownfield: 4, audit: 5 };
    const SOURCE_LABELS = {
      check: 'Contract',
      interaction: 'Interactions',
      runtime: 'Runtime',
      pack: 'Packs',
      brownfield: 'Brownfield',
      audit: 'Audit'
    };
    const SOURCE_DESCRIPTIONS = {
      check: 'Essence and guard rules',
      interaction: 'Declared UI behaviors',
      runtime: 'Built app evidence',
      pack: 'Generated context files',
      brownfield: 'Observed app drift',
      audit: 'Verifier audit findings'
    };
    const ICONS = {
      alert: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
      warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
      info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
      list: '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6"></path><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="14" y2="17"></line>',
      sparkles: '<path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9Z"></path><path d="M5 3v4"></path><path d="M3 5h4"></path><path d="M19 17v4"></path><path d="M17 19h4"></path>',
      pencil: '<path d="M21.2 6.8 17.2 2.8a2 2 0 0 0-2.8 0L3 14.2V21h6.8L21.2 9.6a2 2 0 0 0 0-2.8Z"></path><path d="m14 5 5 5"></path>',
      terminal: '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
      check: '<path d="M20 6 9 17l-5-5"></path>',
      route: '<circle cx="6" cy="19" r="3"></circle><circle cx="18" cy="5" r="3"></circle><path d="M6 16V8a3 3 0 0 1 3-3h6"></path>',
      package: '<path d="m21 8-9-5-9 5 9 5 9-5Z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path>',
      copy: '<rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
      target: '<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="M2 12h3"></path><path d="M19 12h3"></path>'
    };
    const tabs = [...document.querySelectorAll('.tab')];
    const views = [...document.querySelectorAll('.view')];
    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    }
    function attr(value) {
      return esc(value).replace(/\\n/g, '&#10;');
    }
    function icon(name) {
      return '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">' + (ICONS[name] || ICONS.info) + '</svg>';
    }
    function iconLabel(name, label) {
      return '<span class="icon-title">' + icon(name) + esc(label) + '</span>';
    }
    function severityIcon(severity) {
      return severity === 'error' ? 'alert' : severity === 'warn' ? 'warning' : 'info';
    }
    function metric(label, value, cls = '', iconName = '') {
      const tone = cls.includes('status-error')
        ? ' tone-error'
        : cls.includes('status-warning')
          ? ' tone-warn'
          : cls.includes('status-healthy')
            ? ' tone-info'
            : '';
      return '<div class="stat' + tone + '"><div class="label">' + (iconName ? iconLabel(iconName, label) : esc(label)) + '</div><div class="metric ' + cls + '">' + esc(value) + '</div></div>';
    }
    function table(headers, rows) {
      if (!rows.length) return '<div class="card empty">No rows to show.</div>';
      return '<table><thead><tr>' + headers.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map((row) => '<tr>' + row.map((cell) => '<td>' + cell + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
    }
    function findings() {
      return Array.isArray(report?.findings) ? report.findings : [];
    }
    function sortedFindings() {
      return [...findings()].sort((a, b) => {
        const severity = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
        if (severity !== 0) return severity;
        const source = (SOURCE_ORDER[a.source] ?? 9) - (SOURCE_ORDER[b.source] ?? 9);
        if (source !== 0) return source;
        return String(a.id).localeCompare(String(b.id));
      });
    }
    function countBySource() {
      return findings().reduce((counts, finding) => {
        counts[finding.source] = (counts[finding.source] || 0) + 1;
        return counts;
      }, {});
    }
    function severityPill(severity) {
      return '<span class="pill pill-' + esc(severity) + '">' + esc(severity) + '</span>';
    }
    function statusNarrative() {
      const errors = report.summary.errorCount || 0;
      const warnings = report.summary.warnCount || 0;
      if (report.status === 'error') {
        return {
          title: errors + ' blocking issue' + (errors === 1 ? '' : 's') + ' will fail the default CI gate.',
          body: 'Fix the highest-severity finding first, then rerun Project Health to confirm the contract, runtime, and generated packs agree.'
        };
      }
      if (report.status === 'warning') {
        return {
          title: warnings + ' warning' + (warnings === 1 ? '' : 's') + ' need review before this feels production-clean.',
          body: 'The default error-only CI gate can pass, but the project still has drift or incomplete evidence worth resolving.'
        };
      }
      return {
        title: 'No blocking drift detected.',
        body: 'Project Health found no errors or warnings. Keep the CI gate active so future changes stay aligned with the Decantr contract.'
      };
    }
    function runtimeStatus() {
      if (!report.summary.runtimeAuditChecked) return 'not checked';
      return report.summary.runtimePassed ? 'passed' : 'failed';
    }
    function formatAge(value) {
      if (!value) return 'unknown';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
      if (seconds < 60) return seconds + 's ago';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return minutes + 'm ago';
      const hours = Math.floor(minutes / 60);
      if (hours < 48) return hours + 'h ago';
      return Math.floor(hours / 24) + 'd ago';
    }
    function promptCommandFor(finding) {
      return 'decantr health --prompt ' + finding.id;
    }
    function commandCard(label, command, copyKind, copyId, options = {}) {
      const help = options.help ? '<p class="command-help">' + esc(options.help) + '</p>' : '';
      const buttonText = options.buttonText || 'Copy command';
      return '<div class="command-block"><div class="label">' + esc(label) + '</div><div class="command-row"><code>' + esc(command) + '</code><button class="button" type="button" data-copy-' + copyKind + '="' + attr(copyId) + '">' + icon('copy') + esc(buttonText) + '</button><span class="subtle copy-status" aria-live="polite"></span></div>' + help + '</div>';
    }
    function toneClassFor(finding) {
      return finding.severity === 'error' ? ' tone-error' : finding.severity === 'warn' ? ' tone-warn' : ' tone-info';
    }
    function copyPromptButtons(finding, compact = false) {
      return '<div class="action-copy">' +
        '<button class="button strong" type="button" data-copy-prompt="' + attr(finding.id) + '">' + icon('sparkles') + 'Copy AI prompt</button>' +
        '<button class="button" type="button" data-copy-command="' + attr(finding.id) + '">' + icon('terminal') + (compact ? 'Copy command' : 'Copy terminal command') + '</button>' +
        '<span class="subtle copy-status" aria-live="polite"></span>' +
      '</div>';
    }
    function remediationText(finding) {
      return finding.remediation?.summary || finding.suggestedFix || 'Resolve this finding and rerun Project Health.';
    }
    function verifyList(finding) {
      const commands = Array.isArray(finding.remediation?.commands) && finding.remediation.commands.length
        ? finding.remediation.commands
        : ['decantr health'];
      return '<div class="verify-list">' + commands.map((command) => '<code>' + esc(command) + '</code>').join('') + '</div>';
    }
    function selectedOverviewFinding(ordered) {
      if (!ordered.length) return null;
      if (!overviewFindingId || !ordered.some((finding) => finding.id === overviewFindingId)) {
        overviewFindingId = ordered[0].id;
      }
      return ordered.find((finding) => finding.id === overviewFindingId) || ordered[0];
    }
    function findingChoice(finding, selected) {
      return '<button class="finding-choice' + toneClassFor(finding) + '" type="button" data-select-finding="' + attr(finding.id) + '" aria-pressed="' + String(selected) + '">' +
        '<div class="finding-head"><div><div class="meta-row">' + severityPill(finding.severity) + '<span class="pill">' + esc(SOURCE_LABELS[finding.source] || finding.source) + '</span></div><h3 class="finding-title">' + icon(severityIcon(finding.severity)) + esc(finding.id) + '</h3></div><span class="choice-action">' + (selected ? 'Selected' : 'Review fix') + '</span></div>' +
        '<p>' + esc(finding.message) + '</p>' +
      '</button>';
    }
    function actionTabs() {
      const tabs = [
        ['ai', 'AI Prompt', 'sparkles'],
        ['manual', 'Manual Fix', 'pencil'],
        ['commands', 'Commands', 'terminal']
      ];
      return '<div class="action-tabs" role="tablist" aria-label="Fix methods">' + tabs.map(([id, label, iconName]) =>
        '<button class="action-tab" type="button" data-action-mode="' + attr(id) + '" aria-selected="' + String(overviewActionMode === id) + '">' + icon(iconName) + esc(label) + '</button>'
      ).join('') + '</div>';
    }
    function inlineCode(value) {
      const tick = String.fromCharCode(96);
      const codeSpanPattern = new RegExp('(' + tick + '[^' + tick + ']*' + tick + ')', 'g');
      return String(value ?? '').split(codeSpanPattern).map((part) => {
        if (part.startsWith(tick) && part.endsWith(tick)) {
          return '<code>' + esc(part.slice(1, -1)) + '</code>';
        }
        return esc(part);
      }).join('');
    }
    function promptList(items, commandList = false) {
      if (!items.length) return '';
      return '<ul' + (commandList ? ' class="prompt-command-list"' : '') + '>' + items.map((item) => '<li>' + (commandList ? '<code>' + esc(item) + '</code>' : inlineCode(item)) + '</li>').join('') + '</ul>';
    }
    function promptParagraphs(lines) {
      return lines.map((line) => '<p>' + inlineCode(line) + '</p>').join('');
    }
    function formatPromptPreview(prompt) {
      const lines = String(prompt || '').split(/\\r?\\n/).map((line) => line.trim());
      const purpose = [];
      const details = [];
      const evidence = [];
      const guidance = [];
      const commands = [];
      let mode = 'purpose';
      for (const line of lines) {
        if (!line) continue;
        if (line === 'Evidence:') {
          mode = 'evidence';
          continue;
        }
        if (line === 'After the fix, run:') {
          mode = 'commands';
          continue;
        }
        if (/^(Finding|Source|Severity|Category|Message|Suggested fix):/.test(line)) {
          mode = 'details';
          details.push(line);
          continue;
        }
        if (mode === 'evidence' && line.startsWith('- ')) {
          evidence.push(line.slice(2));
          continue;
        }
        if (mode === 'commands' && line.startsWith('- ')) {
          commands.push(line.slice(2));
          continue;
        }
        if (mode === 'details') mode = 'guidance';
        if (mode === 'purpose') purpose.push(line);
        else guidance.push(line);
      }
      const detailHtml = details.map((line) => {
        const separator = line.indexOf(':');
        const key = separator === -1 ? 'Detail' : line.slice(0, separator);
        const value = separator === -1 ? line : line.slice(separator + 1).trim();
        const messageClass = key === 'Message' || key === 'Suggested fix' ? ' prompt-message' : '';
        return '<div class="prompt-meta-item' + messageClass + '"><strong>' + esc(key) + '</strong><span>' + inlineCode(value) + '</span></div>';
      }).join('');
      return '<div class="prompt-preview">' +
        (purpose.length ? '<section class="prompt-section"><div class="prompt-heading">Purpose</div>' + promptParagraphs(purpose) + '</section>' : '') +
        (details.length ? '<section class="prompt-section"><div class="prompt-heading">Finding details</div><div class="prompt-meta">' + detailHtml + '</div></section>' : '') +
        (evidence.length ? '<section class="prompt-section"><div class="prompt-heading">Evidence</div>' + promptList(evidence) + '</section>' : '') +
        (guidance.length ? '<section class="prompt-section"><div class="prompt-heading">Instructions</div>' + promptParagraphs(guidance) + '</section>' : '') +
        (commands.length ? '<section class="prompt-section"><div class="prompt-heading">Verification</div>' + promptList(commands, true) + '</section>' : '') +
      '</div>';
    }
    function aiPromptPanel(finding) {
      const prompt = finding.remediation?.prompt || 'No AI repair prompt is available for this finding.';
      return '<div class="action-body"><p class="subtle">Review the prompt first. Copy it into the assistant that will edit the project.</p>' + formatPromptPreview(prompt) + copyPromptButtons(finding) + commandCard('Generate in terminal', promptCommandFor(finding), 'command', finding.id, { help: 'This command prints the same prompt. It does not edit files.', buttonText: 'Copy command' }) + '</div>';
    }
    function manualFixPanel(finding) {
      const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
      return '<div class="action-body"><div class="explain-block"><div class="label">What happened</div><p>' + esc(finding.message) + '</p></div><div class="explain-block"><div class="label">Suggested fix</div><p>' + esc(remediationText(finding)) + '</p></div>' +
        (evidence.length ? '<details><summary>Evidence (' + evidence.length + ')</summary><ul>' + evidence.slice(0, 5).map((entry) => '<li>' + esc(entry) + '</li>').join('') + (evidence.length > 5 ? '<li>' + esc('+' + (evidence.length - 5) + ' more') + '</li>' : '') + '</ul></details>' : '') +
      '</div>';
    }
    function commandPanel(finding, defaultGateFails) {
      return '<div class="action-body">' +
        commandCard('Print AI prompt', promptCommandFor(finding), 'command', finding.id, { help: 'Use this when you want the prompt in your terminal instead of copying it from Studio.' }) +
        '<div class="explain-block"><div class="label">Check your work</div>' + verifyList(finding) + '<p>Run these after the source edit, then refresh Studio.</p></div>' +
        '<div class="explain-block"><div class="label">Will CI pass?</div><p>' + (defaultGateFails ? 'Not yet. The default error-only gate will fail until blocking findings are resolved.' : 'Yes for the default error-only gate, based on this report.') + '</p></div>' +
      '</div>';
    }
    function actionBody(finding, defaultGateFails) {
      if (overviewActionMode === 'manual') return manualFixPanel(finding);
      if (overviewActionMode === 'commands') return commandPanel(finding, defaultGateFails);
      return aiPromptPanel(finding);
    }
    function actionDock(finding, defaultGateFails) {
      if (!finding) {
        return '<div class="panel action-panel">' +
          '<div class="action-step"><div class="label">No active fix</div><h3 class="action-title">No remediation needed.</h3><p class="subtle">Keep the CI gate active so future changes stay aligned with the Decantr contract.</p>' + commandCard('CI gate', report.ci.recommendedCommand, 'literal', report.ci.recommendedCommand) + '</div>' +
        '</div>';
      }
      return '<div class="panel action-panel">' +
        '<div class="action-step"><h3 class="action-title">' + icon('target') + 'Start with ' + esc(finding.id) + '.</h3>' + actionTabs() + actionBody(finding, defaultGateFails) + '</div>' +
      '</div>';
    }
    function findingSummary(finding, options = {}) {
      const promptCommand = promptCommandFor(finding);
      const evidence = Array.isArray(finding.evidence) ? finding.evidence : [];
      const toneClass = toneClassFor(finding);
      const frameClass = (options.compact ? 'panel finding-card compact' : 'card finding-card') + toneClass;
      return '<div class="' + frameClass + '">' +
        '<div class="finding-head"><div><div class="meta-row">' + severityPill(finding.severity) + '<span class="pill">' + esc(SOURCE_LABELS[finding.source] || finding.source) + '</span></div><h3 class="finding-title">' + esc(finding.id) + '</h3></div>' +
        (options.compact ? '' : copyPromptButtons(finding)) +
        '</div>' +
        '<p class="finding-message">' + esc(finding.message) + '</p>' +
        (finding.suggestedFix ? '<p class="finding-fix">Fix: ' + esc(finding.suggestedFix) + '</p>' : '') +
        (!options.compact && evidence.length ? '<details><summary>Evidence (' + evidence.length + ')</summary><ul>' + evidence.map((entry) => '<li>' + esc(entry) + '</li>').join('') + '</ul></details>' : '') +
        (options.compact ? copyPromptButtons(finding, true) : commandCard('AI prompt command', promptCommand, 'command', finding.id, { help: 'Prints a scoped prompt for your coding assistant; it does not edit files.' })) +
        '</div>';
    }
    function renderOverview() {
      const narrative = statusNarrative();
      const ordered = sortedFindings();
      const topBlockers = ordered.slice(0, 5);
      const selected = selectedOverviewFinding(ordered);
      const hasFindings = Boolean(selected);
      const sourceCounts = countBySource();
      const defaultGateFails = (report.summary.errorCount || 0) > 0;
      const sourceCards = Object.keys(SOURCE_LABELS).map((source) =>
        '<div class="card source-item"><div class="label">' + esc(SOURCE_LABELS[source]) + '</div><div class="metric">' + esc(sourceCounts[source] || 0) + '</div><div class="subtle">' + esc(SOURCE_DESCRIPTIONS[source]) + '</div></div>'
      ).join('');
      document.getElementById('overview').innerHTML =
        '<section class="hero hero-' + esc(report.status) + '">' +
          '<div class="hero-summary"><div class="hero-primary"><div class="meta-row">' + severityPill(report.status === 'healthy' ? 'info' : report.status === 'warning' ? 'warn' : 'error') + '<span class="pill">' + esc(report.score) + '/100</span><span class="pill">Generated ' + esc(formatAge(report.generatedAt)) + '</span></div>' +
          '<h2>' + esc(narrative.title) + '</h2><p>' + esc(narrative.body) + '</p></div>' +
          '<div class="hero-priority"><div class="label">' + (hasFindings ? 'Fix first' : 'Status') + '</div><strong>' + esc(selected?.id || 'All clear') + '</strong><span class="subtle">' + (selected ? esc(SOURCE_LABELS[selected.source] || selected.source) : 'Keep the CI gate active') + '</span></div></div>' +
        '</section>' +
        '<div class="status-strip">' +
          metric('Errors', report.summary.errorCount, 'status-error', 'alert') +
          metric('Warnings', report.summary.warnCount, 'status-warning', 'warning') +
          metric('Findings', report.summary.findingCount, '', 'list') +
          metric('Pages', report.summary.pageCount, '', 'file') +
        '</div>' +
        '<div class="split">' +
          '<section class="stack"><div class="section-head"><div><h2 class="section-title">' + icon(hasFindings ? 'target' : 'check') + (hasFindings ? 'Fix first' : 'All clear') + '</h2><p class="section-kicker">' + (hasFindings ? 'Pick one issue; the guide updates on the right.' : 'No findings need remediation right now.') + '</p></div><span class="pill">' + esc(topBlockers.length) + ' shown</span></div>' +
            (topBlockers.length ? '<div class="finding-list">' + topBlockers.map((finding) => findingChoice(finding, selected?.id === finding.id)).join('') + '</div>' : '<div class="panel">No blockers. Project is healthy.</div>') +
          '</section>' +
          '<aside class="overview-rail stack"><div class="section-head"><div><h2 class="section-title">' + icon(hasFindings ? 'target' : 'check') + (hasFindings ? 'Recommended path' : 'Keep watch') + '</h2><p class="section-kicker">' + (hasFindings ? 'Review, copy, then verify.' : 'No remediation needed.') + '</p></div></div>' + actionDock(selected, defaultGateFails) + '</aside>' +
        '</div>' +
        '<details class="details-band"><summary>' + iconLabel('info', 'Project details') + '</summary><div class="details-content"><div class="quick-line"><div class="signal"><span class="label">' + iconLabel('route', 'Routes') + '</span><strong>' + esc((report.routes.declared || []).length) + '</strong><span class="subtle">declared</span></div><div class="signal"><span class="label">' + iconLabel('check', 'Runtime') + '</span><strong>' + esc(runtimeStatus()) + '</strong><span class="subtle">' + esc(report.routes.runtimeMatched) + ' matched</span></div><div class="signal"><span class="label">' + iconLabel('package', 'Packs') + '</span><strong>' + esc(report.packs.manifestPresent ? 'present' : 'missing') + '</strong><span class="subtle">' + esc(formatAge(report.packs.generatedAt)) + '</span></div></div><div><h2 class="section-title">' + icon('list') + 'Health map</h2><div class="mini-map">' + sourceCards + '</div></div><div class="panel"><div class="label">Workflow</div><p>' + esc(report.summary.workflowMode || 'unknown') + ' / ' + esc(report.summary.adoptionMode || 'unknown') + '</p><p class="subtle">Essence ' + esc(report.summary.essenceVersion || 'missing') + ' | packs generated ' + esc(formatAge(report.packs.generatedAt)) + '</p></div></div></details>';
    }
    function renderRoutes() {
      const declared = report.routes.declared || [];
      const checked = report.routes.runtimeChecked || [];
      const coverage = report.routes.runtimeCoverageOk === null ? 'not checked' : report.routes.runtimeCoverageOk ? 'covered' : 'needs attention';
      document.getElementById('routes').innerHTML =
        '<div class="grid-3">' +
          metric('Declared', declared.length) +
          metric('Runtime checked', checked.length) +
          metric('Matched', report.routes.runtimeMatched) +
        '</div>' +
        '<div class="card"><div class="label">Coverage</div><p>' + esc(coverage) + '</p><p class="subtle">Runtime audit: ' + esc(runtimeStatus()) + '</p></div>' +
        (report.routes.issues.length ? '<div class="card"><div class="label">Route Issues</div><ul>' + report.routes.issues.map((issue) => '<li>' + esc(issue) + '</li>').join('') + '</ul></div>' : '<div class="card">No route-specific issues.</div>') +
        table(['Declared Route'], declared.map((route) => ['<code>' + esc(route) + '</code>']));
    }
    function renderDrift() {
      const drift = findings().filter((finding) => finding.source === 'brownfield' || finding.id.includes('drift'));
      document.getElementById('drift').innerHTML = drift.length
        ? table(['Severity', 'Source', 'Message'], drift.map((finding) => [severityPill(finding.severity), esc(SOURCE_LABELS[finding.source] || finding.source), esc(finding.message)]))
        : '<div class="card">No drift findings.</div>';
    }
    function filteredFindings() {
      const query = findingFilters.query.trim().toLowerCase();
      return sortedFindings().filter((finding) => {
        if (findingFilters.severity !== 'all' && finding.severity !== findingFilters.severity) return false;
        if (findingFilters.source !== 'all' && finding.source !== findingFilters.source) return false;
        if (!query) return true;
        return [finding.id, finding.message, finding.category, finding.source].some((value) => String(value || '').toLowerCase().includes(query));
      });
    }
    function renderFindings() {
      const rows = filteredFindings();
      document.getElementById('findings').innerHTML =
        '<div class="toolbar"><input id="finding-search" type="search" placeholder="Search findings" value="' + attr(findingFilters.query) + '"><select id="finding-severity"><option value="all">All severities</option><option value="error">Errors</option><option value="warn">Warnings</option><option value="info">Info</option></select><select id="finding-source"><option value="all">All sources</option>' + Object.keys(SOURCE_LABELS).map((source) => '<option value="' + attr(source) + '">' + esc(SOURCE_LABELS[source]) + '</option>').join('') + '</select></div>' +
        (rows.length ? '<div class="finding-list">' + rows.map((finding) => findingSummary(finding)).join('') + '</div>' : '<div class="card">No findings match the current filters.</div>');
      const severity = document.getElementById('finding-severity');
      const source = document.getElementById('finding-source');
      const search = document.getElementById('finding-search');
      severity.value = findingFilters.severity;
      source.value = findingFilters.source;
      search.addEventListener('input', () => { findingFilters.query = search.value; renderFindings(); });
      severity.addEventListener('change', () => { findingFilters.severity = severity.value; renderFindings(); });
      source.addEventListener('change', () => { findingFilters.source = source.value; renderFindings(); });
    }
    function renderRemediation() {
      const ordered = sortedFindings();
      if (!ordered.length) {
        document.getElementById('remediation').innerHTML = '<div class="card">No remediation needed.</div>';
        return;
      }
      if (!remediationFindingId || !ordered.some((finding) => finding.id === remediationFindingId)) {
        remediationFindingId = ordered[0].id;
      }
      const active = ordered.find((finding) => finding.id === remediationFindingId) || ordered[0];
      document.getElementById('remediation').innerHTML =
        '<div class="toolbar"><select id="remediation-select">' + ordered.map((finding) => '<option value="' + attr(finding.id) + '">' + esc(finding.severity + ' - ' + finding.id) + '</option>').join('') + '</select>' + copyPromptButtons(active) + '</div>' +
        '<div class="card stack"><div class="meta-row">' + severityPill(active.severity) + '<span class="pill">' + esc(SOURCE_LABELS[active.source] || active.source) + '</span></div><h2 class="section-title">' + esc(active.id) + '</h2><p>' + esc(remediationText(active)) + '</p><p class="subtle">This is the full AI repair prompt. Copy it into the assistant doing the implementation, or run the terminal command to print it.</p>' + commandCard('Terminal command', promptCommandFor(active), 'command', active.id, { help: 'The command only prints this prompt; it does not modify source files.' }) + '<pre>' + esc(active.remediation?.prompt || '') + '</pre></div>';
      const select = document.getElementById('remediation-select');
      select.value = active.id;
      select.addEventListener('change', () => { remediationFindingId = select.value; renderRemediation(); });
    }
    function renderCi() {
      document.getElementById('ci').innerHTML =
        '<div class="grid-3">' +
          metric('Default gate', report.ci.failOn) +
          metric('Would fail', (report.summary.errorCount || 0) > 0 ? 'yes' : 'no', (report.summary.errorCount || 0) > 0 ? 'status-error' : 'status-healthy') +
          metric('Status', report.status, 'status-' + report.status) +
        '</div>' +
        '<div class="card stack"><div class="label">Local command</div>' + commandCard('Local', 'decantr health', 'literal', 'decantr health') + '</div>' +
        '<div class="card stack"><div class="label">Pull request gate</div>' + commandCard('CI', report.ci.recommendedCommand, 'literal', report.ci.recommendedCommand) + '</div>' +
        '<div class="card stack"><div class="label">JSON artifact</div><p class="subtle">Use this artifact with <code>decantr studio --report decantr-health.json</code> for customer-controlled reporting.</p>' + commandCard('Artifact', 'decantr health --json --output decantr-health.json', 'literal', 'decantr health --json --output decantr-health.json') + '</div>';
    }
    function renderPacks() {
      document.getElementById('packs').innerHTML =
        '<div class="grid">' +
        metric('Manifest', report.packs.manifestPresent ? 'present' : 'missing', report.packs.manifestPresent ? '' : 'status-error') +
        metric('Review', report.packs.reviewPackPresent ? 'present' : 'missing', report.packs.reviewPackPresent ? '' : 'status-warning') +
        metric('Scaffold', report.packs.scaffoldPackPresent ? 'present' : 'missing', report.packs.scaffoldPackPresent ? '' : 'status-warning') +
        metric('Pages', report.packs.pagePackCount) +
        '</div><div class="grid-3">' +
        metric('Sections', report.packs.sectionPackCount) +
        metric('Mutations', report.packs.mutationPackCount) +
        metric('Generated', formatAge(report.packs.generatedAt)) +
        '</div>';
    }
    function render() {
      if (!report) return;
      document.getElementById('project').textContent = report.projectRoot;
      document.getElementById('mode').textContent = studioMode === 'report' ? 'Report mode' : 'Project mode';
      renderOverview();
      renderRoutes();
      renderDrift();
      renderFindings();
      renderRemediation();
      renderCi();
      renderPacks();
    }
    async function copyText(value, target) {
      const status = target.parentElement?.querySelector('.copy-status') || target.closest('.command-block, .action-copy, .card, .panel')?.querySelector('.copy-status');
      const fallbackCopy = () => {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        return copied;
      };
      let copied = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
          copied = true;
        } else {
          copied = fallbackCopy();
        }
      } catch {
        try {
          copied = fallbackCopy();
        } catch {
          copied = false;
        }
      }
      if (status) status.textContent = copied ? 'Copied' : 'Copy failed';
    }
    async function load(refresh = false) {
      const response = await fetch(refresh ? '/api/refresh' : '/api/health', { method: refresh ? 'POST' : 'GET' });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to load health report');
      report = await response.json();
      render();
    }
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      views.forEach((view) => view.classList.toggle('hidden', view.id !== tab.dataset.tab));
    }));
    document.getElementById('refresh').addEventListener('click', () => load(true));
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.copyCommand) {
        copyText('decantr health --prompt ' + button.dataset.copyCommand, button);
      } else if (button.dataset.copyPrompt) {
        const finding = findings().find((item) => item.id === button.dataset.copyPrompt);
        copyText(finding?.remediation?.prompt || '', button);
      } else if (button.dataset.copyLiteral) {
        copyText(button.dataset.copyLiteral, button);
      } else if (button.dataset.selectFinding) {
        overviewFindingId = button.dataset.selectFinding;
        overviewActionMode = 'ai';
        renderOverview();
      } else if (button.dataset.actionMode) {
        overviewActionMode = button.dataset.actionMode;
        renderOverview();
      }
    });
    load().catch((error) => {
      document.getElementById('overview').innerHTML = '<div class="card status-error">Failed to load health report: ' + esc(error.message) + '</div>';
    });
  </script>
</body>
</html>`;
}

function workspaceStudioHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Decantr Workspace Health</title>
  <style>
    body { margin: 0; background: #101014; color: #f5f2eb; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    header { padding: 1rem; border-bottom: 1px solid rgba(245,242,235,.12); display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
    h1 { margin: 0; font-size: 1rem; }
    main { padding: 1rem; display: grid; gap: .75rem; }
    button { border: 1px solid rgba(245,242,235,.14); border-radius: 8px; background: rgba(245,242,235,.06); color: inherit; padding: .55rem .8rem; cursor: pointer; }
    .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border: 1px solid rgba(245,242,235,.1); border-radius: 8px; overflow: hidden; }
    .cell { padding: .7rem; border-bottom: 1px solid rgba(245,242,235,.08); }
    .head { color: #ada7bd; font-size: .75rem; text-transform: uppercase; }
    .healthy { color: #5ee2a0; } .warning { color: #f2bd61; } .error, .failed { color: #ff6f7d; }
    .card { border: 1px solid rgba(245,242,235,.1); border-radius: 8px; padding: 1rem; background: rgba(245,242,235,.025); }
  </style>
</head>
<body>
  <header><h1>Decantr Workspace Health</h1><button id="refresh">Refresh</button></header>
  <main id="root"><div class="card">Loading workspace health...</div></main>
  <script>
    const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
    async function load(refresh = false) {
      const res = await fetch(refresh ? '/api/workspace/refresh' : '/api/workspace', { method: refresh ? 'POST' : 'GET' });
      const report = await res.json();
      if (!res.ok) throw new Error(report.message || report.error || 'failed');
      const summary = report.summary || {};
      const rows = (report.projects || []).map((p) => '<div class="cell"><strong>' + esc(p.path) + '</strong></div><div class="cell ' + esc(p.status) + '">' + esc(p.status) + '</div><div class="cell">' + esc(p.score) + '</div><div class="cell">' + esc(p.findingCount) + '</div><div class="cell">' + esc(p.source) + '</div>').join('');
      document.getElementById('root').innerHTML =
        '<div class="card">Projects checked: <strong>' + esc(summary.checkedCount) + '/' + esc(summary.projectCount) + '</strong> · Healthy ' + esc(summary.healthyCount) + ' · Warnings ' + esc(summary.warningCount) + ' · Errors ' + esc(summary.errorCount) + ' · Failed ' + esc(summary.failedCount) + '</div>' +
        '<div class="grid"><div class="cell head">Project</div><div class="cell head">Status</div><div class="cell head">Score</div><div class="cell head">Findings</div><div class="cell head">Source</div>' + rows + '</div>';
    }
    document.getElementById('refresh').addEventListener('click', () => load(true).catch((e) => alert(e.message)));
    load().catch((e) => document.getElementById('root').innerHTML = '<div class="card error">' + esc(e.message) + '</div>');
  </script>
</body>
</html>`;
}

function studioControlRoomPayload(report: ProjectHealthReport) {
  return {
    generatedAt: report.generatedAt,
    projectRoot: report.projectRoot,
    status: report.status,
    score: report.score,
    summary: report.summary,
    loop: report.loop,
    authority: report.authority,
    evidenceTier: report.evidenceTier,
    graph: report.graph,
    blockingFindings: report.findings
      .filter((finding) => finding.severity === 'error' || finding.loopVerdict !== 'verified')
      .slice(0, 12)
      .map((finding) => ({
        id: finding.id,
        severity: finding.severity,
        source: finding.source,
        category: finding.category,
        message: finding.message,
        graph: finding.graph,
        authorityLane: finding.authorityLane,
        loopVerdict: finding.loopVerdict,
        commands: finding.repairPlan?.commands ?? finding.remediation.commands,
      })),
  };
}

function studioTaskPreview(projectRoot: string, route: string | null, intent: string | null) {
  return {
    route,
    intent,
    command:
      route && intent
        ? `decantr task ${JSON.stringify(route)} ${JSON.stringify(intent)}`
        : 'decantr task <route> "<intent>"',
    notes: [
      'Run this before editing a route.',
      'If runtime source and Decantr context disagree, stop and report drift.',
    ],
    projectRoot,
  };
}

function readStudioProofReport(projectRoot: string): unknown {
  const candidates = [
    join(projectRoot, '.decantr', 'benchmarks', 'proof-field-report.v2.json'),
    join(projectRoot, '.decantr', 'proof-field-report.v2.json'),
    join(projectRoot, 'docs', 'benchmarks', 'decantr-3-5-proof-field-report.json'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, 'utf-8')) as unknown;
    }
  }
  return {
    $schema: 'https://decantr.ai/schemas/proof-field-report.v2.json',
    schemaVersion: 2,
    status: 'missing',
    message: 'No local proof field report was found for this project.',
    searched: candidates,
  };
}

function controlRoomHtml(
  reportMode = false,
  legacyRenderer?: (reportMode: boolean) => string,
): string {
  void legacyRenderer;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Decantr Control Room</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #111315;
      --surface: #181b1f;
      --surface-2: #20242a;
      --line: rgba(238, 241, 238, 0.13);
      --text: #eef1ee;
      --muted: #a9b1ac;
      --good: #6ae3a1;
      --warn: #f4c768;
      --bad: #ff7782;
      --accent: #8fd7ff;
      --ink: #0b0d0f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    button { font: inherit; }
    code {
      display: inline-block;
      max-width: 100%;
      overflow-wrap: anywhere;
      border: 1px solid var(--line);
      background: #0e1012;
      color: var(--accent);
      padding: 0.25rem 0.4rem;
      border-radius: 6px;
    }
    .shell { min-height: 100vh; display: grid; grid-template-columns: minmax(220px, 280px) 1fr; }
    .rail { border-right: 1px solid var(--line); padding: 1rem; background: #14171a; position: sticky; top: 0; height: 100vh; }
    .brand { display: grid; gap: 0.2rem; margin-bottom: 1rem; }
    .brand h1 { font-size: 1.15rem; margin: 0; letter-spacing: 0; }
    .brand p { margin: 0; color: var(--muted); font-size: 0.85rem; }
    .tabs { display: grid; gap: 0.3rem; }
    .tab {
      width: 100%;
      min-height: 40px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--muted);
      text-align: left;
      padding: 0.6rem 0.7rem;
      border-radius: 7px;
      cursor: pointer;
    }
    .tab.active, .tab:hover { color: var(--text); background: var(--surface-2); border-color: var(--line); }
    .main { padding: 1rem; display: grid; gap: 1rem; align-content: start; }
    .topbar { display: flex; justify-content: space-between; gap: 1rem; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 1rem; }
    .topbar h2 { margin: 0; font-size: 1.25rem; letter-spacing: 0; }
    .topbar p { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.9rem; }
    .refresh {
      min-height: 38px;
      border: 1px solid var(--line);
      background: var(--surface-2);
      color: var(--text);
      border-radius: 7px;
      padding: 0 0.8rem;
      cursor: pointer;
    }
    .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 0.8rem; }
    .panel {
      grid-column: span 6;
      border: 1px solid var(--line);
      background: var(--surface);
      border-radius: 8px;
      padding: 0.9rem;
      min-width: 0;
    }
    .panel.wide { grid-column: 1 / -1; }
    .panel h3 { margin: 0 0 0.6rem; font-size: 0.95rem; letter-spacing: 0; }
    .metric { display: flex; align-items: baseline; gap: 0.45rem; margin: 0.2rem 0; }
    .metric strong { font-size: 1.65rem; letter-spacing: 0; }
    .muted { color: var(--muted); }
    .status-healthy { color: var(--good); }
    .status-warning { color: var(--warn); }
    .status-error, .status-blocked { color: var(--bad); }
    .list { display: grid; gap: 0.55rem; }
    .row { border-top: 1px solid var(--line); padding-top: 0.55rem; min-width: 0; }
    .row:first-child { border-top: 0; padding-top: 0; }
    .row-title { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: 0.1rem 0.45rem; color: var(--muted); font-size: 0.78rem; }
    .pre { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--muted); margin: 0; }
    .hide { display: none; }
    @media (max-width: 820px) {
      .shell { grid-template-columns: 1fr; }
      .rail { position: static; height: auto; }
      .tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .panel { grid-column: 1 / -1; }
      .topbar { align-items: stretch; flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="rail">
      <div class="brand">
        <h1>Decantr Control Room</h1>
        <p>${reportMode ? 'Report artifact' : 'Local project'}</p>
      </div>
      <nav class="tabs" aria-label="Studio views">
        <button class="tab active" data-view="control">Control</button>
        <button class="tab" data-view="routes">Routes</button>
        <button class="tab" data-view="graph">Graph</button>
        <button class="tab" data-view="authority">Authority</button>
        <button class="tab" data-view="evidence">Evidence</button>
        <button class="tab" data-view="repairs">Repairs</button>
        <button class="tab" data-view="ci">CI</button>
      </nav>
    </aside>
    <main class="main">
      <header class="topbar">
        <div>
          <h2 id="title">Control</h2>
          <p id="subtitle">Loading local health state...</p>
        </div>
        <button class="refresh" id="refresh" type="button">Refresh</button>
      </header>
      <section id="content" class="grid" aria-live="polite"></section>
    </main>
  </div>
  <script>
    const state = { view: 'control', health: null, control: null, resolve: null, evidence: null, graph: null, proof: null };
    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const cls = (status) => 'status-' + String(status || 'warning').replace(/_/g, '-');
    async function getJson(path, options) {
      const response = await fetch(path, options);
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    }
    async function load(refresh = false) {
      state.health = await getJson(refresh ? '/api/refresh' : '/api/health', refresh ? { method: 'POST' } : undefined);
      state.control = await getJson('/api/control-room');
      state.resolve = await getJson('/api/resolve');
      state.evidence = await getJson('/api/evidence');
      state.graph = await getJson('/api/graph-impact');
      state.proof = await getJson('/api/proof');
      render();
    }
    function panel(title, body, wide = false) {
      return '<article class="panel' + (wide ? ' wide' : '') + '"><h3>' + esc(title) + '</h3>' + body + '</article>';
    }
    function rows(items, empty) {
      if (!items || items.length === 0) return '<p class="muted">' + esc(empty) + '</p>';
      return '<div class="list">' + items.map((item) => '<div class="row">' + item + '</div>').join('') + '</div>';
    }
    function renderControl() {
      const report = state.health;
      const loop = report.loop || {};
      return [
        panel('Project Health', '<div class="metric"><strong class="' + cls(report.status) + '">' + esc(report.score) + '</strong><span>/100</span></div><p class="muted">' + esc(report.status) + ' | ' + esc(report.summary.findingCount) + ' finding(s)</p>'),
        panel('Loop State', '<div class="metric"><strong class="' + cls(loop.status) + '">' + esc(loop.state) + '</strong></div><p class="muted">' + esc(loop.nextActions?.[0] || loop.verdict) + '</p>'),
        panel('Authority Lane', '<p><strong>' + esc(report.authority?.activeLane) + '</strong></p><p class="muted">' + esc(report.authority?.summary) + '</p>', true),
        panel('Blocking Findings', rows(state.control?.blockingFindings?.map((finding) => '<div class="row-title"><strong>' + esc(finding.id) + '</strong><span class="pill">' + esc(finding.severity) + '</span><span class="pill">' + esc(finding.authorityLane) + '</span></div><p class="muted">' + esc(finding.message) + '</p>'), 'No blocking findings.'), true)
      ].join('');
    }
    function renderRoutes() {
      const routes = state.health.routes || {};
      const items = (routes.declared || []).map((route) => '<div class="row-title"><strong>' + esc(route) + '</strong><code>decantr task ' + esc(JSON.stringify(route)) + ' "&lt;intent&gt;"</code></div>');
      return [
        panel('Declared Routes', rows(items, 'No declared routes.'), true),
        panel('Runtime Coverage', '<p class="muted">Checked ' + esc((routes.runtimeChecked || []).length) + ' route(s), matched ' + esc(routes.runtimeMatched) + '.</p><pre class="pre">' + esc((routes.issues || []).join('\\n')) + '</pre>', true)
      ].join('');
    }
    function renderGraph() {
      const graph = state.graph?.graph || state.health.graph || {};
      const findings = state.graph?.findings || [];
      return [
        panel('Graph Impact', '<p><strong>' + esc(graph.current === false ? 'stale' : graph.ready ? 'ready' : 'missing') + '</strong></p><p class="muted">Snapshot ' + esc(graph.snapshotId || 'none') + ' | sources ' + esc(graph.sourceArtifactCount || 0) + '</p>'),
        panel('Anchored Findings', rows(findings.map((finding) => '<strong>' + esc(finding.id) + '</strong><p class="muted">' + esc(finding.graph?.node_type) + ' ' + esc(finding.graph?.node_id) + '</p>'), 'No graph-anchored findings.'))
      ].join('');
    }
    function renderAuthority() {
      const resolution = state.resolve || {};
      return [
        panel('Order', rows((resolution.order || []).map((item) => '<strong>' + esc(item.rank) + '. ' + item.label + '</strong><p class="muted">' + esc(item.role) + '</p>'), 'No authority order.'), true),
        panel('Conflicts', rows((resolution.conflicts || []).map((item) => '<div class="row-title"><strong>' + esc(item.id) + '</strong><span class="pill">' + esc(item.status) + '</span></div><p class="muted">' + esc(item.message) + '</p><pre class="pre">' + esc((item.recommendedActions || []).map((action) => action.kind + (action.command ? ' -> ' + action.command : '')).join('\\n')) + '</pre>'), 'No authority conflicts.'), true)
      ].join('');
    }
    function renderEvidence() {
      const tier = state.evidence?.evidenceTier || state.health.evidenceTier || {};
      return [
        panel('Evidence Tier', '<div class="metric"><strong>' + esc(tier.stage) + '</strong><span>' + esc(tier.confidence?.level) + ' ' + esc(tier.confidence?.score) + '</span></div><p class="muted">' + esc((tier.capabilities || []).join(', ')) + '</p>'),
        panel('Coverage', '<pre class="pre">' + esc(JSON.stringify(tier.coverage || {}, null, 2)) + '</pre>'),
        panel('Evidence Findings', rows((state.evidence?.findings || []).map((finding) => '<strong>' + esc(finding.id) + '</strong><p class="muted">' + esc(finding.source) + ' | ' + esc(finding.severity) + '</p>'), 'No evidence findings.'), true)
      ].join('');
    }
    function renderRepairs() {
      return panel('Repair Plans', rows((state.health.findings || []).map((finding) => '<div class="row-title"><strong>' + esc(finding.id) + '</strong><span class="pill">' + esc(finding.severity) + '</span></div><p class="muted">' + esc(finding.remediation?.summary || finding.message) + '</p><pre class="pre">' + esc((finding.repairPlan?.commands || finding.remediation?.commands || []).join('\\n')) + '</pre>'), 'No repair plans.'), true);
    }
    function renderCi() {
      const proof = state.proof || {};
      return [
        panel('CI Command', '<code>' + esc(state.health.ci?.recommendedCommand) + '</code><p class="muted">Loop verify: ' + esc(state.health.loop?.verifyCommand) + '</p>', true),
        panel('Proof Report', '<pre class="pre">' + esc(JSON.stringify(proof.summary || proof.message || proof, null, 2)) + '</pre>', true)
      ].join('');
    }
    function render() {
      const titles = { control: 'Control', routes: 'Routes', graph: 'Graph Impact', authority: 'Authority Resolver', evidence: 'Evidence', repairs: 'Repairs', ci: 'CI / Benchmarks' };
      document.getElementById('title').textContent = titles[state.view] || 'Control';
      document.getElementById('subtitle').textContent = (state.health?.projectRoot || '') + ' | ' + (state.health?.generatedAt || '');
      const renderers = { control: renderControl, routes: renderRoutes, graph: renderGraph, authority: renderAuthority, evidence: renderEvidence, repairs: renderRepairs, ci: renderCi };
      document.getElementById('content').innerHTML = (renderers[state.view] || renderControl)();
    }
    for (const button of document.querySelectorAll('.tab')) {
      button.addEventListener('click', () => {
        state.view = button.dataset.view;
        for (const tab of document.querySelectorAll('.tab')) tab.classList.toggle('active', tab === button);
        render();
      });
    }
    document.getElementById('refresh').addEventListener('click', () => load(true).catch((error) => alert(error.message)));
    load().catch((error) => {
      document.getElementById('subtitle').textContent = 'Load failed';
      document.getElementById('content').innerHTML = panel('Error', '<pre class="pre">' + esc(error.message) + '</pre>', true);
    });
  </script>
</body>
</html>`;
}

export function createStudioRequestHandler(
  projectRoot: string,
  options: StudioCommandOptions = {},
) {
  const reportPath = resolveReportPath(projectRoot, options.report);
  const loadReport = () =>
    reportPath ? readProjectHealthReport(reportPath) : createProjectHealthReport(projectRoot);
  const loadWorkspaceReport = () => createWorkspaceHealthReport(projectRoot);

  return async function handleStudioRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        if (options.workspace) {
          sendHtml(res, workspaceStudioHtml());
          return;
        }
        sendHtml(res, controlRoomHtml(Boolean(reportPath), studioHtml));
        return;
      }
      if (options.workspace && req.method === 'GET' && url.pathname === '/api/workspace') {
        sendJson(res, 200, await loadWorkspaceReport());
        return;
      }
      if (options.workspace && req.method === 'POST' && url.pathname === '/api/workspace/refresh') {
        sendJson(res, 200, await loadWorkspaceReport());
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/health') {
        sendJson(res, 200, await loadReport());
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/control-room') {
        sendJson(res, 200, studioControlRoomPayload(await loadReport()));
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/resolve') {
        const report = await loadReport();
        sendJson(res, 200, report.authority);
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/evidence') {
        const report = await loadReport();
        sendJson(res, 200, {
          evidenceTier: report.evidenceTier,
          findings: report.findings.map((finding) => ({
            id: finding.id,
            severity: finding.severity,
            source: finding.source,
            graph: finding.graph,
            evidenceTier: finding.evidenceTier,
            repairPlan: finding.repairPlan,
          })),
        });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/graph-impact') {
        const report = await loadReport();
        sendJson(res, 200, {
          graph: report.graph,
          loopImpact: report.loop.graphImpact,
          findings: report.findings
            .filter((finding) => finding.graph)
            .map((finding) => ({
              id: finding.id,
              severity: finding.severity,
              message: finding.message,
              graph: finding.graph,
            })),
        });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/task-preview') {
        sendJson(
          res,
          200,
          studioTaskPreview(
            projectRoot,
            url.searchParams.get('route'),
            url.searchParams.get('intent'),
          ),
        );
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/proof') {
        sendJson(res, 200, readStudioProofReport(projectRoot));
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/refresh') {
        const startedAt = Date.now();
        const report = await loadReport();
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
  const server = createServer(createStudioRequestHandler(projectRoot, options));

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
  if (options.report) {
    console.log('Report mode enabled. Refresh re-reads the local Project Health JSON file.');
  }
  if (options.workspace) {
    console.log('Workspace mode enabled. Studio aggregates Decantr project health locally.');
  }
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
    } else if (arg === '--report') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('Missing --report value.');
      options.report = value;
      index += 1;
    } else if (arg.startsWith('--report=')) {
      const value = arg.slice('--report='.length);
      if (!value) throw new Error('Missing --report value.');
      options.report = value;
    } else if (arg === '--workspace') {
      options.workspace = true;
    }
  }

  if (options.port !== undefined && (!Number.isInteger(options.port) || options.port < 0)) {
    throw new Error('Invalid --port value.');
  }

  return options;
}
