#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultCli = join(repoRoot, 'packages', 'cli', 'dist', 'index.js');

const DEFAULT_CANDIDATES = [
  {
    id: 'cypress-realworld-app',
    repo: 'https://github.com/cypress-io/cypress-realworld-app.git',
    kind: 'react-payment-app',
    expected: 'medium',
    notes: 'Realistic React app with routing, tests, and Brownfield product surface.',
  },
  {
    id: 'jira-clone',
    repo: 'https://github.com/oldboyxx/jira_clone.git',
    kind: 'legacy-react-app',
    expected: 'medium',
    notes: 'Older React brownfield app with issue-tracker UI and legacy conventions.',
  },
  {
    id: 'saas-boilerplate',
    repo: 'https://github.com/ixartz/SaaS-Boilerplate.git',
    kind: 'next-saas-app',
    expected: 'medium-hard',
    notes: 'Modern Next/Tailwind/shadcn SaaS surface with app-router conventions.',
  },
  {
    id: 'open-saas',
    repo: 'https://github.com/wasp-lang/open-saas.git',
    kind: 'wasp-react-saas-app',
    expected: 'hard',
    notes: 'Framework-adjacent SaaS app; useful only if Decantr fails clearly or finds UI routes.',
  },
  {
    id: 'daedalos',
    repo: 'https://github.com/DustinBrett/daedalOS.git',
    kind: 'complex-web-desktop',
    expected: 'hard',
    notes: 'Complex desktop-like TypeScript UI; high route/context stress target.',
  },
];

const DEFAULT_PERFORMANCE_BUDGETS_MS = {
  version: 5_000,
  help: 5_000,
  'scan-json': 20_000,
  'scan-text': 20_000,
  'setup-pre': 10_000,
  'workspace-list-json': 10_000,
  adopt: 60_000,
  doctor: 20_000,
  'graph-json': 45_000,
  'graph-route-json': 45_000,
  'task-json': 30_000,
  'verify-json': 45_000,
  'ci-json': 45_000,
  resolve: 45_000,
  'refresh-check': 20_000,
  'graph-check': 20_000,
  'bad-doctor-missing-project': 10_000,
  'bad-task-route': 20_000,
};

const FAILURE_CATEGORIES = [
  'setup_friction',
  'missing_project_scope',
  'route_context_failure',
  'decantr_command_failure',
  'runtime_proof_gap',
];

function parseArgs(argv) {
  const options = {
    configPath: null,
    outDir: join('/tmp', `decantr-realworld-corpus-${Date.now()}`),
    limit: null,
    cliPath: existsSync(defaultCli) ? defaultCli : null,
    cliPackage: null,
    keepRepos: false,
    forceClone: false,
    commandTimeoutMs: 120_000,
    cloneTimeoutMs: 240_000,
    budgetMultiplier: 1,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') {
      continue;
    } else if (arg === '--config') {
      options.configPath = argv[++index] ?? null;
    } else if (arg === '--out') {
      options.outDir = argv[++index] ?? options.outDir;
    } else if (arg === '--limit') {
      options.limit = Number(argv[++index] ?? options.limit);
    } else if (arg === '--cli') {
      options.cliPath = argv[++index] ?? null;
      options.cliPackage = null;
    } else if (arg === '--cli-package') {
      options.cliPackage = argv[++index] ?? null;
      options.cliPath = null;
    } else if (arg === '--keep-repos') {
      options.keepRepos = true;
    } else if (arg === '--force-clone') {
      options.forceClone = true;
    } else if (arg === '--command-timeout-ms') {
      options.commandTimeoutMs = Number(argv[++index] ?? options.commandTimeoutMs);
    } else if (arg === '--clone-timeout-ms') {
      options.cloneTimeoutMs = Number(argv[++index] ?? options.cloneTimeoutMs);
    } else if (arg === '--budget-multiplier') {
      options.budgetMultiplier = Number(argv[++index] ?? options.budgetMultiplier);
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!options.cliPath && !options.cliPackage) {
    options.cliPackage = '@decantr/cli@latest';
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node scripts/run-realworld-corpus.mjs
  node scripts/run-realworld-corpus.mjs --cli-package @decantr/cli@3.5.5 --out /tmp/decantr-realworld-corpus
  node scripts/run-realworld-corpus.mjs --config corpus.json --keep-repos
  node scripts/run-realworld-corpus.mjs --config scripts/realworld-corpus.hard-mode.json --budget-multiplier 1.5
  node scripts/run-realworld-corpus.mjs --config corpus.json --limit 5

Config shape:
  {
    "candidates": [
      {
        "id": "dub",
        "repo": "https://github.com/dubinc/dub.git",
        "projectPath": "apps/web",
        "route": "/dashboard",
        "runtimeProof": false,
        "kind": "link-management-saas-monorepo",
        "expected": "very-hard",
        "notes": "Why this target matters"
      }
    ]
  }`);
  console.log('\nCustom configs run every candidate by default; pass --limit to sample.');
}

function readCandidates(configPath) {
  if (!configPath) return DEFAULT_CANDIDATES;
  const parsed = JSON.parse(readFileSync(resolve(configPath), 'utf-8'));
  if (!Array.isArray(parsed.candidates)) {
    throw new Error(`${configPath} must contain a candidates array`);
  }
  return parsed.candidates.map((candidate) => ({
    id: safeId(candidate.id ?? basename(String(candidate.repo ?? 'repo'), '.git')),
    repo: String(candidate.repo ?? ''),
    projectPath: typeof candidate.projectPath === 'string' ? candidate.projectPath : null,
    route: typeof candidate.route === 'string' ? candidate.route : null,
    runtimeProof: Boolean(candidate.runtimeProof),
    kind: String(candidate.kind ?? 'unknown'),
    expected: String(candidate.expected ?? 'unknown'),
    notes: String(candidate.notes ?? ''),
  }));
}

function commandBudgetMs(options, id) {
  const base = DEFAULT_PERFORMANCE_BUDGETS_MS[id] ?? options.commandTimeoutMs;
  return Math.max(1, Math.round(base * options.budgetMultiplier));
}

function classifyFailureCategory(id, command) {
  const output = `${command.stdout}\n${command.stderr}\n${command.error}`.toLowerCase();
  if (id === 'project-path-preflight') {
    return 'missing_project_scope';
  }
  if (output.includes('needs an app path') || output.includes('--project')) {
    return 'missing_project_scope';
  }
  if (
    id.includes('task') ||
    id.includes('route') ||
    output.includes('route') ||
    output.includes('no taskable routes')
  ) {
    return 'route_context_failure';
  }
  if (
    output.includes('playwright') ||
    output.includes('browser evidence') ||
    output.includes('base-url') ||
    output.includes('screenshot')
  ) {
    return 'runtime_proof_gap';
  }
  if (id === 'clone' || output.includes('npm error') || output.includes('pnpm error')) {
    return 'setup_friction';
  }
  return 'decantr_command_failure';
}

function safeId(value) {
  return String(value)
    .replace(/\.git$/u, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function commandSpec(options, extraArgs) {
  return {
    cmd: process.execPath,
    args: [resolve(options.resolvedCliPath ?? options.cliPath), ...extraArgs],
  };
}

function materializeCliPackage(options, outDir) {
  if (!options.cliPackage) return options.cliPath;
  const toolsDir = join(outDir, 'tools');
  const install = runProcess(
    'npm',
    ['install', '--prefix', toolsDir, '--no-package-lock', '--no-audit', '--no-fund', options.cliPackage],
    outDir,
    options.cloneTimeoutMs,
  );
  if (install.status !== 0) {
    throw new Error(`Failed to install ${options.cliPackage} for harness use:\n${install.stderr}`);
  }
  const binPath = join(toolsDir, 'node_modules', '@decantr', 'cli', 'dist', 'bin.js');
  if (!existsSync(binPath)) {
    throw new Error(`Installed ${options.cliPackage}, but Decantr CLI bin was not found at ${binPath}`);
  }
  return binPath;
}

function runProcess(cmd, args, cwd, timeoutMs) {
  const startedAt = Date.now();
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf-8',
    timeout: timeoutMs,
    shell: false,
    maxBuffer: 20 * 1024 * 1024,
  });
  return {
    status: result.status,
    signal: result.signal ?? null,
    timedOut: result.error?.code === 'ETIMEDOUT',
    durationMs: Date.now() - startedAt,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? String(result.error.message ?? result.error) : '',
  };
}

function cloneRepo(candidate, repoDir, options) {
  if (existsSync(repoDir) && !options.forceClone) {
    return {
      ok: true,
      reused: true,
      status: 0,
      durationMs: 0,
      stdout: '',
      stderr: '',
    };
  }
  rmSync(repoDir, { recursive: true, force: true });
  mkdirSync(dirname(repoDir), { recursive: true });
  const result = runProcess(
    'git',
    ['clone', '--depth', '1', '--single-branch', candidate.repo, repoDir],
    dirname(repoDir),
    options.cloneTimeoutMs,
  );
  return {
    ...result,
    ok: result.status === 0,
    reused: false,
  };
}

function parseJsonFromOutput(stdout) {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(stdout.slice(start, end + 1));
  } catch {
    return null;
  }
}

function extractRoutes(scanJson) {
  const candidates = [
    scanJson?.routes,
    scanJson?.routes?.items,
    scanJson?.analysis?.routes,
    scanJson?.analysis?.routes?.items,
    scanJson?.project?.routes,
  ];
  const routes = [];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    for (const route of candidate) {
      const path = typeof route === 'string' ? route : route?.path;
      if (typeof path === 'string' && path.startsWith('/')) routes.push(path);
    }
  }
  return [...new Set(routes)];
}

function chooseRoute(candidate, scanJson) {
  const routes = extractRoutes(scanJson);
  if (candidate.route && (routes.length === 0 || routes.includes(candidate.route))) {
    return candidate.route;
  }
  return (
    routes.find((route) => route !== '/' && !route.includes('*') && !route.includes(':')) ??
    routes.find((route) => route !== '/' && !route.includes('*')) ??
    routes[0] ??
    '/'
  );
}

function routeFallback(candidate, selectedRoute, scanJson) {
  if (!candidate.route || candidate.route === selectedRoute) return null;
  return {
    configured: candidate.route,
    selected: selectedRoute,
    reason: 'configured route was not present in scan output',
    knownRoutes: extractRoutes(scanJson).slice(0, 20),
  };
}

function withProject(candidate, args) {
  return candidate.projectPath ? [...args, '--project', candidate.projectPath] : args;
}

function crashSignatures(output) {
  const text = output.toLowerCase();
  const signatures = [
    'cannot read properties',
    'typeerror',
    'referenceerror',
    'syntaxerror',
    'unhandled',
    'eisdir',
    'enoent:',
    'maximum call stack',
  ];
  return signatures.filter((signature) => text.includes(signature));
}

function summarizeVerify(parsed) {
  const findings = Array.isArray(parsed?.findings) ? parsed.findings : [];
  const ruleCounts = new Map();
  for (const finding of findings) {
    const key = String(finding.rule ?? finding.code ?? finding.id ?? 'unknown');
    ruleCounts.set(key, (ruleCounts.get(key) ?? 0) + 1);
  }
  return {
    status: parsed?.status ?? null,
    score: parsed?.score ?? null,
    loopState: parsed?.loop?.state ?? null,
    graphReady: parsed?.graph?.ready ?? null,
    findingCount: findings.length,
    ruleCounts: [...ruleCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rule, count]) => ({ rule, count })),
  };
}

function runDecantrCommand(options, cwd, id, args, expectNonzero = false, scope = 'app-scoped') {
  const spec = commandSpec(options, args);
  const result = runProcess(spec.cmd, spec.args, cwd, options.commandTimeoutMs);
  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  const ok = expectNonzero ? result.status !== 0 : result.status === 0;
  const command = {
    id,
    args,
    scope,
    command: [spec.cmd, ...spec.args].join(' '),
    expectNonzero,
    ok,
    status: result.status,
    signal: result.signal,
    timedOut: result.timedOut,
    durationMs: result.durationMs,
    budgetMs: commandBudgetMs(options, id),
    slow: result.durationMs > commandBudgetMs(options, id),
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
    crashSignatures: crashSignatures(combinedOutput),
  };
  return {
    ...command,
    failureCategory: ok ? null : classifyFailureCategory(id, command),
  };
}

function writeCommandLog(projectLogDir, command) {
  const prefix = command.id.replace(/[^A-Za-z0-9_-]+/g, '-');
  writeFileSync(
    join(projectLogDir, `${prefix}.stdout.txt`),
    command.stdout || '',
    'utf-8',
  );
  writeFileSync(
    join(projectLogDir, `${prefix}.stderr.txt`),
    command.stderr || '',
    'utf-8',
  );
}

function syntheticFailureCommand(options, id, message, scope = 'app-scoped') {
  const command = {
    id,
    args: [],
    scope,
    command: '(harness preflight)',
    expectNonzero: false,
    ok: false,
    status: 1,
    signal: null,
    timedOut: false,
    durationMs: 0,
    budgetMs: commandBudgetMs(options, id),
    slow: false,
    stdout: '',
    stderr: message,
    error: message,
    crashSignatures: [],
  };
  return {
    ...command,
    failureCategory: classifyFailureCategory(id, command),
  };
}

function runProject(candidate, options, roots) {
  const repoDir = join(roots.reposDir, candidate.id);
  const projectLogDir = join(roots.logsDir, candidate.id);
  mkdirSync(projectLogDir, { recursive: true });

  const clone = cloneRepo(candidate, repoDir, options);
  const project = {
    ...candidate,
    repoDir,
    clone,
    selectedRoute: candidate.route ?? null,
    scanRouteCount: 0,
    commands: [],
    verify: null,
    ci: null,
    unexpectedFailures: [],
    crashSignatures: [],
  };

  if (!clone.ok) {
    project.unexpectedFailures.push('clone');
    writeFileSync(join(projectLogDir, 'clone.stderr.txt'), clone.stderr || clone.error, 'utf-8');
    return project;
  }

  if (candidate.projectPath && !existsSync(join(repoDir, candidate.projectPath))) {
    const command = syntheticFailureCommand(
      options,
      'project-path-preflight',
      `Configured projectPath does not exist: ${candidate.projectPath}`,
    );
    project.commands.push(command);
    writeCommandLog(projectLogDir, command);
    project.unexpectedFailures = [command.id];
    project.unexpectedFailureDetails = [
      {
        id: command.id,
        scope: command.scope,
        failureCategory: command.failureCategory,
        status: command.status,
        durationMs: command.durationMs,
      },
    ];
    return project;
  }

  const preCommands = [
    ['version', ['--version'], false, 'root-smoke'],
    ['help', ['--help'], false, 'root-smoke'],
    ['scan-json', withProject(candidate, ['scan', '--json']), false, candidate.projectPath ? 'app-scoped' : 'root-smoke'],
    ['scan-text', withProject(candidate, ['scan']), false, candidate.projectPath ? 'app-scoped' : 'root-smoke'],
    ['setup-pre', ['setup'], false, 'root-smoke'],
    ['workspace-list-json', ['workspace', 'list', '--json'], false, 'root-smoke'],
  ];

  let scanJson = null;
  for (const [id, args, expectNonzero, scope] of preCommands) {
    const command = runDecantrCommand(options, repoDir, id, args, expectNonzero, scope);
    project.commands.push(command);
    writeCommandLog(projectLogDir, command);
    if (id === 'scan-json') {
      scanJson = parseJsonFromOutput(command.stdout);
      const routes = extractRoutes(scanJson);
      project.scanRouteCount = routes.length;
      project.detectedRoutes = routes.slice(0, 20);
    }
  }

  project.selectedRoute = chooseRoute(candidate, scanJson);
  project.routeFallback = routeFallback(candidate, project.selectedRoute, scanJson);

  const postCommands = [
    ['adopt', withProject(candidate, ['adopt', '--yes', '--no-packs']), false, 'app-scoped'],
    ['doctor', withProject(candidate, ['doctor']), false, 'app-scoped'],
    ['graph-json', withProject(candidate, ['graph', '--json']), false, 'app-scoped'],
    [
      'graph-route-json',
      withProject(candidate, ['graph', '--route', project.selectedRoute, '--json']),
      false,
      'app-scoped',
    ],
    [
      'task-json',
      withProject(candidate, [
        'task',
        project.selectedRoute,
        'Review this route before editing',
        '--json',
      ]),
      false,
      'app-scoped',
    ],
    ['verify-json', withProject(candidate, ['verify', '--json']), false, 'app-scoped'],
    ['ci-json', withProject(candidate, ['ci', '--json']), false, 'app-scoped'],
    ['resolve', withProject(candidate, ['resolve']), false, 'app-scoped'],
    ['refresh-check', withProject(candidate, ['refresh', '--check']), false, 'app-scoped'],
    ['graph-check', withProject(candidate, ['graph', '--check']), false, 'app-scoped'],
    [
      'bad-doctor-missing-project',
      ['doctor', '--project', './definitely-missing-app'],
      true,
      'root-smoke',
    ],
    [
      'bad-task-route',
      withProject(candidate, ['task', '/definitely-missing-route', 'Bad route smoke', '--json']),
      true,
      'app-scoped',
    ],
  ];

  for (const [id, args, expectNonzero, scope] of postCommands) {
    const command = runDecantrCommand(options, repoDir, id, args, expectNonzero, scope);
    project.commands.push(command);
    writeCommandLog(projectLogDir, command);
    if (id === 'verify-json') project.verify = summarizeVerify(parseJsonFromOutput(command.stdout));
    if (id === 'ci-json') project.ci = summarizeVerify(parseJsonFromOutput(command.stdout));
  }

  project.unexpectedFailures = project.commands
    .filter((command) => !command.ok)
    .map((command) => command.id);
  project.unexpectedFailureDetails = project.commands
    .filter((command) => !command.ok)
    .map((command) => ({
      id: command.id,
      scope: command.scope,
      failureCategory: command.failureCategory,
      status: command.status,
      durationMs: command.durationMs,
    }));
  project.crashSignatures = [
    ...new Set(project.commands.flatMap((command) => command.crashSignatures)),
  ];

  return project;
}

function aggregate(projects) {
  const commandCount = projects.reduce((sum, project) => sum + project.commands.length, 0);
  const unexpectedFailures = projects.reduce(
    (sum, project) => sum + project.unexpectedFailures.length,
    0,
  );
  const crashProjects = projects.filter((project) => project.crashSignatures.length > 0);
  const routeMisses = projects.filter((project) => project.scanRouteCount === 0);
  const commands = projects.flatMap((project) =>
    project.commands.map((command) => ({ ...command, projectId: project.id })),
  );
  const failureCategories = Object.fromEntries(FAILURE_CATEGORIES.map((category) => [category, 0]));
  for (const command of commands) {
    if (!command.ok && command.failureCategory) {
      failureCategories[command.failureCategory] =
        (failureCategories[command.failureCategory] ?? 0) + 1;
    }
  }
  return {
    projectCount: projects.length,
    commandCount,
    unexpectedFailures,
    crashProjectCount: crashProjects.length,
    routeMissCount: routeMisses.length,
    rootSmokeCommandCount: commands.filter((command) => command.scope === 'root-smoke').length,
    appScopedCommandCount: commands.filter((command) => command.scope === 'app-scoped').length,
    slowCommandCount: commands.filter((command) => command.slow).length,
    failureCategories,
    promotedProjectCount: projects.filter(
      (project) =>
        project.clone.ok &&
        project.scanRouteCount > 0 &&
        project.crashSignatures.length === 0 &&
        project.unexpectedFailures.length === 0,
    ).length,
  };
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function summarizeTimings(projects) {
  const commands = projects.flatMap((project) =>
    project.commands.map((command) => ({ ...command, projectId: project.id })),
  );
  const durations = commands.map((command) => command.durationMs);
  const byCommand = new Map();
  for (const command of commands) {
    const current = byCommand.get(command.id) ?? [];
    current.push(command);
    byCommand.set(command.id, current);
  }
  const commandDurations = [...byCommand.entries()]
    .map(([id, entries]) => {
      const entryDurations = entries.map((entry) => entry.durationMs);
      return {
        id,
        count: entries.length,
        budgetMs: entries[0]?.budgetMs ?? null,
        p50Ms: percentile(entryDurations, 50),
        p95Ms: percentile(entryDurations, 95),
        maxMs: Math.max(...entryDurations),
        slowCount: entries.filter((entry) => entry.slow).length,
      };
    })
    .sort((a, b) => b.p95Ms - a.p95Ms || a.id.localeCompare(b.id));

  return {
    totalMs: durations.reduce((sum, value) => sum + value, 0),
    p50Ms: percentile(durations, 50),
    p95Ms: percentile(durations, 95),
    maxMs: durations.length > 0 ? Math.max(...durations) : 0,
    byCommand: commandDurations,
    slowCommands: commands
      .filter((command) => command.slow)
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 20)
      .map((command) => ({
        project: command.projectId,
        id: command.id,
        scope: command.scope,
        durationMs: command.durationMs,
        budgetMs: command.budgetMs,
      })),
  };
}

function recommendation(summary) {
  if (summary.crashProjectCount > 0 || summary.routeMissCount > 1) return '3.5.x';
  if (summary.unexpectedFailures > 0) return '3.5.x';
  if (summary.slowCommandCount > 0) return '3.6.x-performance-review';
  return 'no-compatibility-patch-needed';
}

function renderMarkdown(report) {
  const lines = [
    '# Decantr Real-World Corpus Report',
    '',
    `Generated: ${report.generatedAt}`,
    `CLI: ${report.cliLabel}`,
    `Out dir: ${report.outDir}`,
    '',
    '## Summary',
    '',
    `- Projects: ${report.summary.projectCount}`,
    `- Commands: ${report.summary.commandCount}`,
    `- Root-smoke commands: ${report.summary.rootSmokeCommandCount}`,
    `- App-scoped commands: ${report.summary.appScopedCommandCount}`,
    `- Unexpected failures: ${report.summary.unexpectedFailures}`,
    `- Crash projects: ${report.summary.crashProjectCount}`,
    `- Route misses: ${report.summary.routeMissCount}`,
    `- Slow commands: ${report.summary.slowCommandCount}`,
    `- Promoted corpus candidates: ${report.summary.promotedProjectCount}`,
    `- Recommended next version: ${report.honesty.recommendedNextVersion}`,
    '',
    '## Timing',
    '',
    `- Total command time: ${report.timings.totalMs}ms`,
    `- Command p50: ${report.timings.p50Ms}ms`,
    `- Command p95: ${report.timings.p95Ms}ms`,
    `- Command max: ${report.timings.maxMs}ms`,
    '',
    '| Command | Count | Budget | p50 | p95 | Max | Slow |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const command of report.timings.byCommand.slice(0, 12)) {
    lines.push(
      `| \`${command.id}\` | ${command.count} | ${command.budgetMs ?? 'n/a'} | ${command.p50Ms} | ${command.p95Ms} | ${command.maxMs} | ${command.slowCount} |`,
    );
  }

  lines.push('', '### Slow Commands', '');
  if (report.timings.slowCommands.length === 0) {
    lines.push('- None exceeded the configured performance budget.');
  } else {
    for (const command of report.timings.slowCommands.slice(0, 10)) {
      lines.push(
        `- ${command.project} \`${command.id}\` (${command.scope}) took ${command.durationMs}ms; budget ${command.budgetMs}ms.`,
      );
    }
  }

  lines.push(
    '',
    '## Failure Categories',
    '',
    '| Category | Count |',
    '| --- | ---: |',
  );
  for (const category of FAILURE_CATEGORIES) {
    lines.push(`| \`${category}\` | ${report.summary.failureCategories[category] ?? 0} |`);
  }

  lines.push(
    '',
    '## Projects',
    '',
    '| Project | Project Path | Kind | Route Count | Selected Route | Unexpected Failures | Verify | Findings | Crash Signatures |',
    '| --- | --- | --- | ---: | --- | --- | --- | ---: | --- |',
  );

  for (const project of report.projects) {
    lines.push(
      `| ${project.id} | ${project.projectPath ? `\`${project.projectPath}\`` : 'root'} | ${project.kind} | ${project.scanRouteCount} | \`${project.selectedRoute ?? 'n/a'}\` | ${project.unexpectedFailures.join(', ') || 'none'} | ${project.verify?.status ?? 'n/a'} / ${project.verify?.score ?? 'n/a'} | ${project.verify?.findingCount ?? 0} | ${project.crashSignatures.join(', ') || 'none'} |`,
    );
  }

  lines.push('', '## Notes', '');
  for (const project of report.projects) {
    lines.push(`### ${project.id}`, '');
    lines.push(`- Repo: ${project.repo}`);
    lines.push(`- Project path: ${project.projectPath ?? 'root'}`);
    lines.push(`- Expected setup burden: ${project.expected}`);
    lines.push(`- Notes: ${project.notes || 'n/a'}`);
    lines.push(`- Clone: ${project.clone.ok ? 'pass' : 'fail'}`);
    if (project.detectedRoutes?.length) {
      lines.push(`- First routes: ${project.detectedRoutes.map((route) => `\`${route}\``).join(', ')}`);
    }
    if (project.routeFallback) {
      lines.push(
        `- Route fallback: configured \`${project.routeFallback.configured}\` was not found; used \`${project.routeFallback.selected}\`.`,
      );
    }
    if (project.verify?.ruleCounts?.length) {
      lines.push(
        `- Verify rules: ${project.verify.ruleCounts
          .map((entry) => `${entry.rule}=${entry.count}`)
          .join(', ')}`,
      );
    }
    lines.push('');
  }

  lines.push('## Honesty', '');
  for (const limitation of report.honesty.knownLimitations) {
    lines.push(`- ${limitation}`);
  }
  if (report.honesty.knownLimitations.length === 0) {
    lines.push('- No blocking limitations were observed by the command matrix.');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const outDir = resolve(options.outDir);
  const roots = {
    outDir,
    reposDir: join(outDir, 'repos'),
    logsDir: join(outDir, 'logs'),
    reportsDir: join(outDir, 'reports'),
  };
  rmSync(roots.reportsDir, { recursive: true, force: true });
  mkdirSync(roots.reposDir, { recursive: true });
  mkdirSync(roots.logsDir, { recursive: true });
  mkdirSync(roots.reportsDir, { recursive: true });
  options.resolvedCliPath = materializeCliPackage(options, outDir);

  const allCandidates = readCandidates(options.configPath);
  const candidates =
    typeof options.limit === 'number' && Number.isFinite(options.limit)
      ? allCandidates.slice(0, options.limit)
      : allCandidates;
  const cliLabel = options.cliPackage ?? resolve(options.cliPath);
  const projects = [];
  for (const candidate of candidates) {
    console.log(`[realworld-corpus] ${candidate.id}: cloning/running`);
    const project = runProject(candidate, options, roots);
    projects.push(project);
    console.log(
      `[realworld-corpus] ${candidate.id}: routes=${project.scanRouteCount} failures=${project.unexpectedFailures.length}`,
    );
  }

  const summary = aggregate(projects);
  const timings = summarizeTimings(projects);
  const report = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    cliLabel,
    outDir,
    summary,
    timings,
    honesty: {
      recommendedNextVersion: recommendation(summary),
      knownLimitations: [
        summary.routeMissCount > 0
          ? `${summary.routeMissCount} project(s) produced no taskable routes in scan.`
          : null,
        summary.unexpectedFailures > 0
          ? `${summary.unexpectedFailures} unexpected command failure(s) need triage.`
          : null,
        summary.crashProjectCount > 0
          ? `${summary.crashProjectCount} project(s) emitted crash-like output signatures.`
          : null,
        summary.slowCommandCount > 0
          ? `${summary.slowCommandCount} command(s) exceeded the configured performance budget.`
          : null,
      ].filter(Boolean),
    },
    projects,
  };

  writeFileSync(
    join(roots.reportsDir, 'aggregate-summary.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf-8',
  );
  writeFileSync(join(roots.reportsDir, 'realworld-corpus.md'), renderMarkdown(report), 'utf-8');

  if (!options.keepRepos) {
    rmSync(roots.reposDir, { recursive: true, force: true });
    report.projects = report.projects.map((project) => ({
      ...project,
      repoDir: '(removed; rerun with --keep-repos to inspect)',
    }));
    writeFileSync(
      join(roots.reportsDir, 'aggregate-summary.json'),
      `${JSON.stringify(report, null, 2)}\n`,
      'utf-8',
    );
  }

  console.log(`Wrote ${join(roots.reportsDir, 'aggregate-summary.json')}`);
  console.log(`Wrote ${join(roots.reportsDir, 'realworld-corpus.md')}`);
}

try {
  main();
} catch (error) {
  console.error((error && error.stack) || error);
  process.exit(1);
}
