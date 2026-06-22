#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultCli = join(repoRoot, 'packages', 'cli', 'dist', 'index.js');

function parseArgs(argv) {
  const options = {
    appPaths: [],
    configPath: null,
    discoverRoot: null,
    limit: 5,
    outDir: join('/tmp', 'decantr-proof-field-report'),
    cliPath: defaultCli,
    keepWorkdir: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--config') {
      options.configPath = argv[++index] ?? null;
    } else if (arg === '--discover') {
      options.discoverRoot = argv[++index] ?? null;
    } else if (arg === '--limit') {
      options.limit = Number(argv[++index] ?? options.limit);
    } else if (arg === '--out') {
      options.outDir = argv[++index] ?? options.outDir;
    } else if (arg === '--cli') {
      options.cliPath = argv[++index] ?? options.cliPath;
    } else if (arg === '--keep-workdir') {
      options.keepWorkdir = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.appPaths.push(arg);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node scripts/run-proof-field-report.mjs [app ...]
  node scripts/run-proof-field-report.mjs --discover /tmp --limit 5
  node scripts/run-proof-field-report.mjs --config proof-apps.json --out /tmp/proof-report

Config shape:
  {
    "apps": [
      {
        "id": "hybrid-next-product",
        "path": "/tmp/hybrid-next-product",
        "expectedRules": ["style-bridge-arbitrary-value"],
        "mutations": [
          {
            "id": "missing-label",
            "file": "src/app/settings/page.tsx",
            "replace": "<label htmlFor=\\"email\\">Email</label>",
            "with": ""
          }
        ]
      }
    ]
  }`);
}

function readConfig(configPath) {
  if (!configPath) return [];
  const absolutePath = resolve(configPath);
  const parsed = JSON.parse(readFileSync(absolutePath, 'utf-8'));
  if (!Array.isArray(parsed.apps)) {
    throw new Error(`${configPath} must contain an apps array`);
  }
  return parsed.apps.map((app) => ({
    id: String(app.id ?? basename(String(app.path ?? 'app'))),
    path: String(app.path ?? ''),
    expectedRules: Array.isArray(app.expectedRules) ? app.expectedRules.map(String) : [],
    mutations: Array.isArray(app.mutations) ? app.mutations : [],
  }));
}

function discoverApps(root, limit) {
  if (!root) return [];
  const discovered = [];
  const start = resolve(root);
  const ignored = new Set(['.git', '.next', 'dist', 'build', 'coverage', 'node_modules']);

  function walk(dir, depth) {
    if (discovered.length >= limit || depth > 3) return;
    let entries = [];
    try {
      entries = readDirNames(dir);
    } catch {
      return;
    }

    if (entries.includes('package.json') && looksLikeFrontendProject(dir, entries)) {
      discovered.push({
        id: basename(dir).replace(/[^A-Za-z0-9_-]+/g, '-'),
        path: dir,
        expectedRules: [],
        mutations: [],
      });
      return;
    }

    for (const entry of entries) {
      if (ignored.has(entry) || entry.startsWith('.')) continue;
      const child = join(dir, entry);
      try {
        if (statSync(child).isDirectory()) walk(child, depth + 1);
      } catch {
        // Ignore unreadable candidates.
      }
      if (discovered.length >= limit) return;
    }
  }

  walk(start, 0);
  return discovered;
}

function readDirNames(dir) {
  return readdirSync(dir);
}

function looksLikeFrontendProject(dir, entries) {
  if (entries.includes('next.config.js') || entries.includes('next.config.ts')) return true;
  if (entries.includes('vite.config.js') || entries.includes('vite.config.ts')) return true;
  return ['src', 'app', 'pages'].some((entry) => existsSync(join(dir, entry)));
}

function appEntries(options) {
  const configured = readConfig(options.configPath);
  const positional = options.appPaths.map((appPath) => ({
    id: basename(resolve(appPath)).replace(/[^A-Za-z0-9_-]+/g, '-'),
    path: resolve(appPath),
    expectedRules: [],
    mutations: [],
  }));
  const discovered = discoverApps(options.discoverRoot, options.limit);
  const entries = [...configured, ...positional, ...discovered];
  const seen = new Set();
  return entries.filter((entry) => {
    const resolvedPath = resolve(entry.path);
    if (!entry.path || seen.has(resolvedPath)) return false;
    seen.add(resolvedPath);
    entry.path = resolvedPath;
    return true;
  });
}

function copyApp(sourceRoot, targetRoot) {
  const ignored = new Set(['.git', '.next', 'dist', 'build', 'coverage', 'node_modules']);
  cpSync(sourceRoot, targetRoot, {
    recursive: true,
    filter(source) {
      const rel = relative(sourceRoot, source).replace(/\\/g, '/');
      if (!rel) return true;
      return !rel.split('/').some((part) => ignored.has(part));
    },
  });
}

function runHealth(cliPath, cwd) {
  if (!existsSync(cliPath)) {
    return {
      ok: false,
      status: null,
      score: null,
      findings: [],
      stdout: '',
      stderr: `CLI not found at ${cliPath}. Run pnpm build:packages or pass --cli.`,
    };
  }

  const result = spawnSync(process.execPath, [cliPath, 'health', '--json'], {
    cwd,
    encoding: 'utf-8',
    timeout: 120_000,
  });
  const parsed = parseJsonFromStdout(result.stdout);
  return {
    ok: result.status === 0 && Boolean(parsed),
    status: parsed?.status ?? null,
    score: parsed?.score ?? null,
    findings: Array.isArray(parsed?.findings) ? parsed.findings : [],
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function parseJsonFromStdout(stdout) {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(stdout.slice(start, end + 1));
  } catch {
    return null;
  }
}

function summarizeFindings(findings) {
  const rules = new Map();
  for (const finding of findings) {
    const rule = String(finding.rule ?? finding.code ?? 'unknown');
    rules.set(rule, (rules.get(rule) ?? 0) + 1);
  }
  return [...rules.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([rule, count]) => ({ rule, count }));
}

function applyMutations(appRoot, mutations) {
  const results = [];
  for (const mutation of mutations) {
    const id = String(mutation.id ?? mutation.file ?? 'mutation');
    const file = String(mutation.file ?? '');
    const replace = String(mutation.replace ?? '');
    const withValue = String(mutation.with ?? '');
    const absolutePath = join(appRoot, file);

    if (!file || !existsSync(absolutePath)) {
      results.push({ id, file, applied: false, reason: 'file-missing' });
      continue;
    }
    if (!replace) {
      results.push({ id, file, applied: false, reason: 'replace-empty' });
      continue;
    }

    const before = readFileSync(absolutePath, 'utf-8');
    if (!before.includes(replace)) {
      results.push({ id, file, applied: false, reason: 'replace-not-found' });
      continue;
    }
    writeFileSync(absolutePath, before.replace(replace, withValue), 'utf-8');
    results.push({ id, file, applied: true });
  }
  return results;
}

function evaluateExpectedRules(findings, expectedRules) {
  const observed = new Set(findings.map((finding) => String(finding.rule ?? finding.code ?? '')));
  return expectedRules.map((rule) => ({
    rule,
    observed: observed.has(rule),
  }));
}

function renderMarkdown(report) {
  const lines = [
    '# Decantr Proof Field Report',
    '',
    `Generated: ${report.generatedAt}`,
    `CLI: ${report.cliPath}`,
    `Workdir: ${report.workDir}`,
    '',
    '| App | Baseline | Mutated | Findings | Expected Rules |',
    '| --- | --- | --- | ---: | --- |',
  ];

  for (const app of report.apps) {
    const expected = app.expectedRules.length
      ? app.expectedRules.map((entry) => `${entry.observed ? 'pass' : 'miss'} ${entry.rule}`).join('<br>')
      : 'n/a';
    lines.push(
      `| ${app.id} | ${app.baseline.status ?? 'failed'} / ${app.baseline.score ?? 'n/a'} | ${app.mutated.status ?? 'n/a'} / ${app.mutated.score ?? 'n/a'} | ${app.mutated.findingCount} | ${expected} |`,
    );
  }

  lines.push('', '## Rule Counts', '');
  for (const app of report.apps) {
    lines.push(`### ${app.id}`, '');
    if (app.mutated.ruleCounts.length === 0) {
      lines.push('- No findings emitted.', '');
      continue;
    }
    for (const entry of app.mutated.ruleCounts) {
      lines.push(`- ${entry.rule}: ${entry.count}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const entries = appEntries(options);
  if (entries.length === 0) {
    throw new Error('No apps supplied. Pass app paths, --discover /tmp, or --config proof-apps.json.');
  }

  const outDir = resolve(options.outDir);
  const workDir = join(outDir, 'work');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });

  const report = {
    generatedAt: new Date().toISOString(),
    cliPath: resolve(options.cliPath),
    workDir,
    apps: [],
  };

  for (const entry of entries.slice(0, options.limit)) {
    const appWorkDir = join(workDir, entry.id);
    copyApp(entry.path, appWorkDir);
    const baseline = runHealth(report.cliPath, appWorkDir);
    const mutations = applyMutations(appWorkDir, entry.mutations);
    const mutated = entry.mutations.length > 0 ? runHealth(report.cliPath, appWorkDir) : baseline;
    const expectedRules = evaluateExpectedRules(mutated.findings, entry.expectedRules);
    report.apps.push({
      id: entry.id,
      sourcePath: entry.path,
      workPath: appWorkDir,
      mutations,
      expectedRules,
      baseline: {
        ok: baseline.ok,
        status: baseline.status,
        score: baseline.score,
        findingCount: baseline.findings.length,
        ruleCounts: summarizeFindings(baseline.findings),
        stderr: baseline.stderr.trim(),
      },
      mutated: {
        ok: mutated.ok,
        status: mutated.status,
        score: mutated.score,
        findingCount: mutated.findings.length,
        ruleCounts: summarizeFindings(mutated.findings),
        stderr: mutated.stderr.trim(),
      },
    });
  }

  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, 'proof-field-report.json');
  const markdownPath = join(outDir, 'proof-field-report.md');
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
  writeFileSync(markdownPath, renderMarkdown(report), 'utf-8');

  if (!options.keepWorkdir) {
    for (const app of report.apps) {
      app.workPath = '(removed; rerun with --keep-workdir to inspect)';
    }
    writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
    rmSync(workDir, { recursive: true, force: true });
  }

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${markdownPath}`);
}

try {
  main();
} catch (error) {
  console.error((error && error.stack) || error);
  process.exit(1);
}
