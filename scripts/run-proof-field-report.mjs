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
    prepareGraph: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') {
      continue;
    } else if (arg === '--config') {
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
    } else if (arg === '--no-graph') {
      options.prepareGraph = false;
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
        "healthArgs": ["--browser", "--base-url", "http://127.0.0.1:3000"],
        "expectedRules": ["style-bridge-arbitrary-value"],
        "allowedBaselineRules": ["runtime-dist-missing"],
        "mutations": [
          {
            "id": "missing-label",
            "file": "src/app/settings/page.tsx",
            "marker": "{/* decantr-proof:label */}",
            "mode": "insert-after",
            "with": "<input aria-label=\\"\\" />"
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
    allowedBaselineRules: Array.isArray(app.allowedBaselineRules)
      ? app.allowedBaselineRules.map(String)
      : [],
    mutations: Array.isArray(app.mutations) ? app.mutations : [],
    healthArgs: Array.isArray(app.healthArgs) ? app.healthArgs.map(String) : [],
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
        healthArgs: [],
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
    healthArgs: [],
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

function runHealth(cliPath, cwd, healthArgs = []) {
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

  const result = spawnSync(process.execPath, [cliPath, 'health', '--json', ...healthArgs], {
    cwd,
    encoding: 'utf-8',
    timeout: 120_000,
  });
  const parsed = parseJsonFromStdout(result.stdout);
  return {
    ok: result.status === 0 && Boolean(parsed),
    status: parsed?.status ?? null,
    score: parsed?.score ?? null,
    schema: parsed?.$schema ?? null,
    loopState: parsed?.loop?.state ?? null,
    evidenceStage: parsed?.evidenceTier?.stage ?? null,
    graphAnchorCount: Array.isArray(parsed?.findings)
      ? parsed.findings.filter((finding) => finding?.graph).length
      : 0,
    repairPlanCount: Array.isArray(parsed?.findings)
      ? parsed.findings.filter((finding) => finding?.repairPlan).length
      : 0,
    findings: Array.isArray(parsed?.findings) ? parsed.findings : [],
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function runGraph(cliPath, cwd) {
  if (!existsSync(cliPath)) {
    return {
      ok: false,
      stdout: '',
      stderr: `CLI not found at ${cliPath}. Run pnpm build:packages or pass --cli.`,
    };
  }

  const result = spawnSync(process.execPath, [cliPath, 'graph', '--json'], {
    cwd,
    encoding: 'utf-8',
    timeout: 120_000,
  });
  return {
    ok: result.status === 0,
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

function ruleKey(finding) {
  return String(finding.rule ?? finding.code ?? 'unknown');
}

function severityRank(finding) {
  const severity = String(finding.severity ?? '').toLowerCase();
  if (severity === 'error' || severity === 'blocker') return 3;
  if (severity === 'warn' || severity === 'warning') return 2;
  if (severity === 'info') return 1;
  return 0;
}

function unexpectedBaselineFindings(findings, allowedRules = []) {
  const allowed = new Set(allowedRules.map(String));
  return findings
    .filter((finding) => severityRank(finding) >= 2)
    .filter((finding) => !allowed.has(ruleKey(finding)));
}

function applyMutations(appRoot, mutations) {
  const results = [];
  for (const mutation of mutations) {
    const id = String(mutation.id ?? mutation.file ?? 'mutation');
    const file = String(mutation.file ?? '');
    const replace = String(mutation.replace ?? '');
    const withValue = String(mutation.with ?? '');
    const marker = typeof mutation.marker === 'string' ? mutation.marker : '';
    const mode = typeof mutation.mode === 'string' ? mutation.mode : 'replace';
    const absolutePath = join(appRoot, file);

    if (!file || !existsSync(absolutePath)) {
      results.push({ id, file, applied: false, reason: 'file-missing' });
      continue;
    }
    if (!replace && !marker) {
      results.push({ id, file, applied: false, reason: 'replace-empty' });
      continue;
    }

    const before = readFileSync(absolutePath, 'utf-8');
    if (marker) {
      if (!before.includes(marker)) {
        results.push({ id, file, applied: false, reason: 'marker-not-found' });
        continue;
      }
      let after = before;
      if (mode === 'insert-before') {
        after = before.replace(marker, `${withValue}\n${marker}`);
      } else if (mode === 'insert-after') {
        after = before.replace(marker, `${marker}\n${withValue}`);
      } else {
        after = before.replace(marker, withValue);
      }
      writeFileSync(absolutePath, after, 'utf-8');
      results.push({ id, file, applied: true, mode, marker });
      continue;
    }
    if (!before.includes(replace)) {
      results.push({ id, file, applied: false, reason: 'replace-not-found' });
      continue;
    }
    writeFileSync(absolutePath, before.replace(replace, withValue), 'utf-8');
    results.push({ id, file, applied: true });
  }
  return results;
}

function ratio(numerator, denominator) {
  return denominator > 0 ? Number((numerator / denominator).toFixed(3)) : 0;
}

function proofMetrics(apps) {
  const expected = apps.flatMap((app) => app.expectedRules);
  const mutatedFindings = apps.reduce((sum, app) => sum + app.mutated.findingCount, 0);
  const graphAnchors = apps.reduce((sum, app) => sum + app.mutated.graphAnchorCount, 0);
  const repairPlans = apps.reduce((sum, app) => sum + app.mutated.repairPlanCount, 0);
  const unexpectedBaselineApps = apps.filter((app) => app.baseline.unexpectedFindingCount > 0);
  return {
    adversarialCatchRate: ratio(
      expected.filter((entry) => entry.observed).length,
      expected.length,
    ),
    falsePositiveRate: ratio(
      unexpectedBaselineApps.length,
      apps.length,
    ),
    graphAnchorCoverage: ratio(graphAnchors, mutatedFindings),
    repairPlanCoverage: ratio(repairPlans, mutatedFindings),
    loopVerdictQuality: ratio(
      apps.filter((app) =>
        ['repair_required', 'human_resolution_required', 'blocked_missing_graph', 'verified'].includes(
          String(app.mutated.loopState ?? app.baseline.loopState ?? ''),
        ),
      ).length,
      apps.length,
    ),
  };
}

function evaluateExpectedRules(findings, expectedRules) {
  const observed = new Set(findings.map((finding) => ruleKey(finding)));
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
    '| App | Baseline | Unexpected baseline | Mutated | Findings | Expected Rules |',
    '| --- | --- | ---: | --- | ---: | --- |',
  ];

  for (const app of report.apps) {
    const expected = app.expectedRules.length
      ? app.expectedRules.map((entry) => `${entry.observed ? 'pass' : 'miss'} ${entry.rule}`).join('<br>')
      : 'n/a';
    lines.push(
      `| ${app.id} | ${app.baseline.status ?? 'failed'} / ${app.baseline.score ?? 'n/a'} | ${app.baseline.unexpectedFindingCount ?? 0} | ${app.mutated.status ?? 'n/a'} / ${app.mutated.score ?? 'n/a'} | ${app.mutated.findingCount} | ${expected} |`,
    );
  }

  lines.push('', '## Rule Counts', '');
  for (const app of report.apps) {
    lines.push(`### ${app.id}`, '');
    if (app.baseline.unexpectedRuleCounts?.length > 0) {
      lines.push('Unexpected baseline findings:');
      for (const entry of app.baseline.unexpectedRuleCounts) {
        lines.push(`- ${entry.rule}: ${entry.count}`);
      }
      lines.push('');
    }
    if (app.mutated.ruleCounts.length === 0) {
      lines.push('- No findings emitted.', '');
      continue;
    }
    for (const entry of app.mutated.ruleCounts) {
      lines.push(`- ${entry.rule}: ${entry.count}`);
    }
    lines.push('');
  }

  lines.push('## Metrics', '');
  for (const [key, value] of Object.entries(report.metrics)) {
    lines.push(`- ${key}: ${value}`);
  }
  lines.push('', '## Honesty', '');
  lines.push(`- pass: ${report.honesty.pass}`);
  lines.push(
    `- recommendedNextVersion: ${report.honesty.recommendedNextVersion ?? 'none'}`,
  );
  if (report.honesty.knownLimitations.length > 0) {
    for (const limitation of report.honesty.knownLimitations) {
      lines.push(`- ${limitation}`);
    }
  } else {
    lines.push('- No known limitations crossed the configured threshold.');
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
    $schema: 'https://decantr.ai/schemas/proof-field-report.v2.json',
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    cliPath: resolve(options.cliPath),
    workDir,
    summary: {
      appCount: 0,
      mutationCount: 0,
      expectedRuleCount: 0,
      proofClasses: [
        'route drift',
        'component reuse drift',
        'style/local-law drift',
        'behavior/accessibility drift',
        'stale graph/context',
        'visual/runtime evidence',
      ],
    },
    apps: [],
    metrics: {
      adversarialCatchRate: 0,
      falsePositiveRate: 0,
      graphAnchorCoverage: 0,
      repairPlanCoverage: 0,
      loopVerdictQuality: 0,
    },
    honesty: {
      pass: false,
      knownLimitations: [],
      recommendedNextVersion: null,
    },
  };

  for (const entry of entries.slice(0, options.limit)) {
    const appWorkDir = join(workDir, entry.id);
    copyApp(entry.path, appWorkDir);
    const baselineGraph = options.prepareGraph ? runGraph(report.cliPath, appWorkDir) : null;
    const baseline = runHealth(report.cliPath, appWorkDir, entry.healthArgs);
    const baselineUnexpected = unexpectedBaselineFindings(
      baseline.findings,
      entry.allowedBaselineRules,
    );
    const mutations = applyMutations(appWorkDir, entry.mutations);
    const mutatedGraph =
      options.prepareGraph && entry.mutations.length > 0 ? runGraph(report.cliPath, appWorkDir) : null;
    const mutated =
      entry.mutations.length > 0 ? runHealth(report.cliPath, appWorkDir, entry.healthArgs) : baseline;
    const expectedRules = evaluateExpectedRules(mutated.findings, entry.expectedRules);
    report.apps.push({
      id: entry.id,
      sourcePath: entry.path,
      workPath: appWorkDir,
      mutations,
      healthArgs: entry.healthArgs,
      graphPreparation: {
        enabled: options.prepareGraph,
        baselineOk: baselineGraph?.ok ?? null,
        mutatedOk: mutatedGraph?.ok ?? null,
        baselineStderr: baselineGraph?.stderr?.trim() ?? '',
        mutatedStderr: mutatedGraph?.stderr?.trim() ?? '',
      },
      expectedRules,
      allowedBaselineRules: entry.allowedBaselineRules,
      baseline: {
        ok: baseline.ok,
        schema: baseline.schema,
        status: baseline.status,
        score: baseline.score,
        loopState: baseline.loopState,
        evidenceStage: baseline.evidenceStage,
        findingCount: baseline.findings.length,
        unexpectedFindingCount: baselineUnexpected.length,
        unexpectedRuleCounts: summarizeFindings(baselineUnexpected),
        graphAnchorCount: baseline.graphAnchorCount,
        repairPlanCount: baseline.repairPlanCount,
        ruleCounts: summarizeFindings(baseline.findings),
        stderr: baseline.stderr.trim(),
      },
      mutated: {
        ok: mutated.ok,
        schema: mutated.schema,
        status: mutated.status,
        score: mutated.score,
        loopState: mutated.loopState,
        evidenceStage: mutated.evidenceStage,
        findingCount: mutated.findings.length,
        graphAnchorCount: mutated.graphAnchorCount,
        repairPlanCount: mutated.repairPlanCount,
        ruleCounts: summarizeFindings(mutated.findings),
        stderr: mutated.stderr.trim(),
      },
    });
  }
  report.summary.appCount = report.apps.length;
  report.summary.mutationCount = report.apps.reduce((sum, app) => sum + app.mutations.length, 0);
  report.summary.expectedRuleCount = report.apps.reduce(
    (sum, app) => sum + app.expectedRules.length,
    0,
  );
  report.metrics = proofMetrics(report.apps);
  report.honesty = {
    pass:
      report.apps.length >= 5 &&
      report.metrics.adversarialCatchRate >= 0.6 &&
      report.metrics.falsePositiveRate <= 0.4 &&
      report.metrics.graphAnchorCoverage >= 0.5 &&
      report.metrics.repairPlanCoverage >= 0.5,
    knownLimitations: [
      report.apps.length < 5
        ? 'Official proof corpus has fewer than five apps in this run.'
        : null,
      report.metrics.adversarialCatchRate < 0.6
        ? 'Adversarial catch rate is below the 3.5 target threshold.'
        : null,
      report.metrics.graphAnchorCoverage < 0.5
        ? 'Graph-anchor coverage is still incomplete.'
        : null,
      report.metrics.falsePositiveRate > 0.4
        ? 'Unexpected baseline warning/error rate is above the 3.5 target threshold.'
        : null,
      report.metrics.repairPlanCoverage < 0.5
        ? 'Repair-plan coverage is still incomplete.'
        : null,
    ].filter(Boolean),
    recommendedNextVersion:
      report.metrics.adversarialCatchRate < 0.6 ||
      report.metrics.graphAnchorCoverage < 0.5 ||
      report.metrics.falsePositiveRate > 0.4
        ? '3.5.x'
        : null,
  };

  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, 'proof-field-report.json');
  const jsonV2Path = join(outDir, 'proof-field-report.v2.json');
  const markdownPath = join(outDir, 'proof-field-report.md');
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
  writeFileSync(jsonV2Path, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
  writeFileSync(markdownPath, renderMarkdown(report), 'utf-8');

  if (!options.keepWorkdir) {
    for (const app of report.apps) {
      app.workPath = '(removed; rerun with --keep-workdir to inspect)';
    }
    writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
    writeFileSync(jsonV2Path, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
    rmSync(workDir, { recursive: true, force: true });
  }

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${jsonV2Path}`);
  console.log(`Wrote ${markdownPath}`);
}

try {
  main();
} catch (error) {
  console.error((error && error.stack) || error);
  process.exit(1);
}
