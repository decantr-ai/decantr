#!/usr/bin/env node
// Blueprint harness CLI — orchestrates the scaffold-test pipeline.

import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

import { prepWorkspace } from './lib/prep.mjs';
import { runMobileSmoke } from './lib/mobile-smoke.mjs';
import { synthesizeReport } from './lib/synthesize.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '../..');
const COLD_PROMPT_TEMPLATE = resolve(__dirname, 'templates/cold-prompt.md');

const USAGE = `Usage:
  blueprint-harness run <blueprint>
  blueprint-harness prep <blueprint> [--workspace=<dir>]
  blueprint-harness prompt <workspace>
  blueprint-harness smoke <workspace> [--port=5173] [--output=<dir>]
  blueprint-harness synthesize <workspace> --subagent-report=<file> [--output=<dir>]

Options:
  --workspace=<dir>          Workspace path (default: /tmp/harness-<date>-<blueprint>/my-app)
  --output=<dir>             Output dir for artifacts (default: .claude/harness-runs/<date>-<blueprint>)
  --port=<n>                 Dev server port (default: 5173)
  --subagent-report=<file>   Path to the cold-subagent report markdown
`;

// Blueprint slug reliably lives at `.decantr/project.json#blueprintId`.
// essence.json's `blueprint` key is an object of (sections, features, routes)
// without its own slug — another docs-vs-reality gap worth noting.
function detectBlueprintSlug(workspace) {
  const projectPath = join(workspace, '.decantr/project.json');
  if (existsSync(projectPath)) {
    const p = JSON.parse(readFileSync(projectPath, 'utf8'));
    if (typeof p.blueprintId === 'string') return p.blueprintId;
    if (typeof p.blueprint === 'string') return p.blueprint;
  }
  const essencePath = join(workspace, 'decantr.essence.json');
  if (existsSync(essencePath)) {
    const e = JSON.parse(readFileSync(essencePath, 'utf8'));
    if (typeof e.blueprint === 'string') return e.blueprint;
    if (typeof e.blueprint_id === 'string') return e.blueprint_id;
    if (typeof e?.meta?.blueprint === 'string') return e.meta.blueprint;
  }
  return 'unknown';
}

function parseArgs(argv) {
  const out = { _: [] };
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      out[k] = v ?? true;
    } else {
      out._.push(a);
    }
  }
  return out;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultWorkspace(blueprint) {
  return `/tmp/harness-${today()}-${blueprint}/my-app`;
}

function defaultOutputDir(blueprint) {
  return resolve(MONOREPO_ROOT, `.claude/harness-runs/${today()}-${blueprint}`);
}

function renderColdPrompt({ blueprint, workspace }) {
  const template = readFileSync(COLD_PROMPT_TEMPLATE, 'utf8');
  return template
    .replaceAll('{{BLUEPRINT}}', blueprint)
    .replaceAll('{{WORKSPACE}}', workspace);
}

async function waitForDevServer({ port, timeoutMs = 15000 }) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function startDevServer(workspace, port) {
  const child = spawn('npm', ['run', 'dev', '--', '--port', String(port), '--strictPort'], {
    cwd: workspace,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  const ok = await waitForDevServer({ port });
  if (!ok) {
    child.kill('SIGTERM');
    throw new Error(`Dev server did not come up on :${port} within timeout.`);
  }
  return child;
}

function prompt(question) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (a) => {
      rl.close();
      res(a);
    });
  });
}

async function cmdPrep(args) {
  const blueprint = args._[0];
  if (!blueprint) throw new Error('missing blueprint slug');
  const workspace = args.workspace ?? defaultWorkspace(blueprint);
  console.log(`Preparing workspace at ${workspace}...`);
  const result = prepWorkspace({ blueprint, workspace });
  console.log(`✓ Scaffold ready at ${workspace}`);
  console.log(`  contract shape:    ${result.contractShape}`);
  console.log(`  context files:     ${result.contextFileCount}`);
  console.log(`  scaffold-pack.md:  ${result.hasScaffoldPack ? 'yes' : 'NO'}`);
  console.log(`  pack-manifest:     ${result.hasPackManifest ? 'yes' : 'NO'}`);
  console.log(`  section packs:     ${result.hasAnySectionPack ? 'yes' : 'NO'}`);
  console.log(`  page packs:        ${result.hasAnyPagePack ? 'yes' : 'NO'}`);
  if (result.contractShape !== 'pack-style') {
    console.log(
      `\n⚠  This blueprint did NOT compile execution packs. The cold-prompt's` +
        `\n   "treat compiled execution-pack files as primary source of truth"` +
        `\n   instruction will not apply as written. Record this as a finding.`,
    );
  }
  return { workspace, blueprint, ...result };
}

async function cmdPrompt(args) {
  const workspace = args._[0];
  if (!workspace) throw new Error('missing workspace path');
  const blueprint = detectBlueprintSlug(workspace);
  const text = renderColdPrompt({ blueprint, workspace });
  const harnessDir = join(workspace, '_harness');
  mkdirSync(harnessDir, { recursive: true });
  const file = join(harnessDir, 'cold-prompt.md');
  writeFileSync(file, text);
  console.log(text);
  console.log(`\n✓ Prompt written to ${file}`);
  console.log(`\nNext: dispatch a cold Agent (general-purpose, model: opus, background) with the prompt above.`);
  console.log(`When the agent returns, save its full report to:\n  ${join(harnessDir, 'subagent-report.md')}`);
  return { file, blueprint };
}

async function cmdSmoke(args) {
  const workspace = args._[0];
  if (!workspace) throw new Error('missing workspace path');
  const port = Number(args.port ?? 5173);
  const outputDir = args.output ?? join(workspace, '_harness/mobile-shots');

  console.log(`Starting dev server on :${port}...`);
  const dev = await startDevServer(workspace, port);
  console.log(`✓ Dev server up. Running mobile smoke...`);
  try {
    const results = await runMobileSmoke({ baseUrl: `http://localhost:${port}`, outputDir });
    console.log(`✓ ${results.filter((r) => r.ok).length}/${results.length} shots captured`);
    writeFileSync(
      join(dirname(outputDir), 'smoke-results.json'),
      JSON.stringify(results, null, 2),
    );
    return { results, outputDir };
  } finally {
    dev.kill('SIGTERM');
  }
}

async function cmdSynthesize(args) {
  const workspace = args._[0];
  if (!workspace) throw new Error('missing workspace path');
  const subagentReportPath =
    args['subagent-report'] ?? join(workspace, '_harness/subagent-report.md');
  const harnessDir = join(workspace, '_harness');
  const smokeResultsPath = join(harnessDir, 'smoke-results.json');
  const smokeResults = existsSync(smokeResultsPath)
    ? JSON.parse(readFileSync(smokeResultsPath, 'utf8'))
    : [];
  const blueprint = detectBlueprintSlug(workspace);

  const outputDir = args.output ?? defaultOutputDir(blueprint);
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'report.md');

  const result = synthesizeReport({
    workspace,
    blueprint,
    subagentReportPath,
    mobileShotsDir: join(harnessDir, 'mobile-shots'),
    smokeResults,
    outputPath,
  });

  console.log(`✓ Report: ${outputPath}`);
  console.log(`  Source files: ${result.src.files} (${result.src.lines} lines)`);
  console.log(`  Inline styles (auto-counted): ${result.inlineStyles}`);
  return result;
}

async function cmdRun(args) {
  const blueprint = args._[0];
  if (!blueprint) throw new Error('missing blueprint slug');
  const workspace = args.workspace ?? defaultWorkspace(blueprint);

  await cmdPrep({ _: [blueprint], workspace });
  await cmdPrompt({ _: [workspace] });

  console.log('\n' + '─'.repeat(60));
  console.log('OPERATOR STEP: dispatch the cold subagent now.');
  console.log('─'.repeat(60));
  console.log(`  1. Copy the prompt from ${join(workspace, '_harness/cold-prompt.md')}`);
  console.log(`  2. Invoke Agent tool: subagent_type=general-purpose, model=opus, run_in_background=true`);
  console.log(`  3. When it returns, save the full response to ${join(workspace, '_harness/subagent-report.md')}`);

  const answer = await prompt('\nPress [Enter] when the subagent report is saved, or type "skip" to stop here: ');
  if (String(answer).trim().toLowerCase() === 'skip') {
    console.log('Stopped. Run `blueprint-harness smoke` and `synthesize` later.');
    return;
  }

  await cmdSmoke({ _: [workspace] });
  await cmdSynthesize({ _: [workspace] });
  console.log('\n✓ Harness run complete.');
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd || cmd === '-h' || cmd === '--help') {
    console.log(USAGE);
    return;
  }
  const args = parseArgs(rest);
  const dispatch = {
    run: cmdRun,
    prep: cmdPrep,
    prompt: cmdPrompt,
    smoke: cmdSmoke,
    synthesize: cmdSynthesize,
  };
  const fn = dispatch[cmd];
  if (!fn) {
    console.error(`unknown command: ${cmd}\n\n${USAGE}`);
    process.exit(2);
  }
  try {
    await fn(args);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }
}

main();
