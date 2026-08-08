#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { release as osRelease } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const harnessPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(harnessPath), '..');
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
  'verify-full-json': 45_000,
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
    repeat: 1,
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
    } else if (arg === '--repeat') {
      const value = argv[++index];
      options.repeat = value === undefined ? Number.NaN : Number(value);
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
  if (!Number.isInteger(options.repeat) || options.repeat <= 0) {
    throw new Error('--repeat must be a positive integer');
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
  node scripts/run-realworld-corpus.mjs --config corpus.json --repeat 20

Config shape:
  {
    "candidates": [
      {
        "id": "dub",
        "repo": "https://github.com/dubinc/dub.git",
        "ref": "0123456789abcdef0123456789abcdef01234567",
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
  console.log('--repeat N runs every target N times in isolated fresh checkouts.');
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
    ref: typeof candidate.ref === 'string' ? candidate.ref : null,
    projectPath: typeof candidate.projectPath === 'string' ? candidate.projectPath : null,
    route: typeof candidate.route === 'string' ? candidate.route : null,
    runtimeProof: Boolean(candidate.runtimeProof),
    kind: String(candidate.kind ?? 'unknown'),
    expected: String(candidate.expected ?? 'unknown'),
    notes: String(candidate.notes ?? ''),
  }));
}

function assertUniqueCandidateIds(candidates) {
  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate.id) throw new Error('Every corpus candidate must have a non-empty id');
    if (seen.has(candidate.id)) {
      throw new Error(`Corpus candidate ids must be unique: ${candidate.id}`);
    }
    seen.add(candidate.id);
  }
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
  if (existsSync(repoDir) && !options.forceClone && options.repeat === 1) {
    return {
      ok: true,
      reused: true,
      status: 0,
      durationMs: 0,
      stdout: '',
      stderr: '',
      commands: [],
    };
  }
  rmSync(repoDir, { recursive: true, force: true });
  mkdirSync(dirname(repoDir), { recursive: true });
  if (candidate.ref) {
    const steps = [
      ['init', repoDir],
      ['-C', repoDir, 'remote', 'add', 'origin', candidate.repo],
      ['-C', repoDir, 'fetch', '--depth', '1', 'origin', candidate.ref],
      ['-C', repoDir, 'checkout', '--detach', 'FETCH_HEAD'],
    ];
    const results = [];
    for (const args of steps) {
      const result = runProcess('git', args, dirname(repoDir), options.cloneTimeoutMs);
      results.push({ ...result, argv: ['git', ...args], cwd: dirname(repoDir) });
      if (result.status !== 0) break;
    }
    const failed = results.find((result) => result.status !== 0);
    return {
      ok: !failed,
      reused: false,
      status: failed?.status ?? 0,
      signal: failed?.signal ?? null,
      timedOut: results.some((result) => result.timedOut),
      durationMs: results.reduce((sum, result) => sum + result.durationMs, 0),
      stdout: results.map((result) => result.stdout).filter(Boolean).join('\n'),
      stderr: results.map((result) => result.stderr).filter(Boolean).join('\n'),
      error: failed?.error ?? '',
      commands: results.map(({ argv, cwd }) => ({ argv, cwd })),
    };
  }
  const args = ['clone', '--depth', '1', '--single-branch', candidate.repo, repoDir];
  const result = runProcess(
    'git',
    args,
    dirname(repoDir),
    options.cloneTimeoutMs,
  );
  return {
    ...result,
    ok: result.status === 0,
    reused: false,
    commands: [{ argv: ['git', ...args], cwd: dirname(repoDir) }],
  };
}

const JSON_SCHEMA_EXPECTATIONS = {
  'scan-json': 'ScanReportV2',
  'workspace-list-json': 'workspace list report',
  'graph-json': 'graph summary',
  'graph-route-json': 'route graph summary',
  'task-json': 'task context',
  'verify-json': 'Change Assurance report',
  'verify-full-json': 'Project Health report',
  'ci-json': 'CI report',
};

function parseJsonOutput(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) return { ok: false, value: null, error: 'stdout was empty' };

  const candidates = [trimmed];
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const objectCandidate = stdout.slice(start, end + 1);
    if (objectCandidate !== trimmed) candidates.push(objectCandidate);
  }

  let lastError = 'stdout did not contain a JSON object';
  for (const candidate of candidates) {
    try {
      return { ok: true, value: JSON.parse(candidate), error: null };
    } catch (error) {
      lastError = String(error?.message ?? error);
    }
  }
  return { ok: false, value: null, error: lastError };
}

function parseJsonFromOutput(stdout) {
  const parsed = parseJsonOutput(stdout);
  return parsed.ok ? parsed.value : null;
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateJsonSchema(id, value) {
  const errors = [];
  if (!isRecord(value)) return ['output must be a JSON object'];

  const requireRecord = (field) => {
    if (!isRecord(value[field])) errors.push(`${field} must be an object`);
  };
  const requireArray = (field) => {
    if (!Array.isArray(value[field])) errors.push(`${field} must be an array`);
  };
  const requireString = (field) => {
    if (typeof value[field] !== 'string' || value[field].length === 0) {
      errors.push(`${field} must be a non-empty string`);
    }
  };

  if (id === 'scan-json') {
    if (value.schemaVersion !== 'scan-report.v2') {
      errors.push('schemaVersion must equal scan-report.v2');
    }
    requireRecord('project');
    requireRecord('routes');
    if (isRecord(value.routes) && !Array.isArray(value.routes.items)) {
      errors.push('routes.items must be an array');
    }
  } else if (id === 'workspace-list-json') {
    requireArray('projects');
    requireArray('candidates');
  } else if (id === 'graph-json' || id === 'graph-route-json') {
    requireRecord('snapshot');
    if (isRecord(value.snapshot) && typeof value.snapshot.id !== 'string') {
      errors.push('snapshot.id must be a string');
    }
    if (value.wrote !== true) errors.push('wrote must equal true');
    if (id === 'graph-route-json') {
      if (!isRecord(value.routeContext)) {
        errors.push('routeContext must be an object');
      } else {
        if (typeof value.routeContext.route !== 'string') {
          errors.push('routeContext.route must be a string');
        }
        if (value.routeContext.found !== true) {
          errors.push('routeContext.found must equal true');
        }
      }
    }
  } else if (id === 'task-json') {
    requireString('route');
    requireArray('read');
    requireRecord('loop');
    requireString('verifyCommand');
    if (isRecord(value.loop) && typeof value.loop.state !== 'string') {
      errors.push('loop.state must be a string');
    }
  } else if (id === 'verify-json') {
    requireString('$schema');
    requireString('version');
    requireString('status');
    requireRecord('project');
    requireRecord('comparisonScope');
    requireRecord('changeBase');
    requireRecord('authority');
    requireRecord('surfaces');
    requireArray('findings');
    requireArray('limitations');
    requireRecord('summary');
    if (value.$schema !== 'https://decantr.ai/schemas/change-assurance-report.v1.json') {
      errors.push('$schema must identify change-assurance-report.v1.json');
    }
    if (!['pass', 'attention', 'not_proven'].includes(value.status)) {
      errors.push('status must equal pass, attention, or not_proven');
    }
  } else if (id === 'verify-full-json') {
    requireString('$schema');
    requireString('status');
    if (typeof value.score !== 'number' || !Number.isFinite(value.score)) {
      errors.push('score must be a finite number');
    }
    requireRecord('summary');
    requireArray('findings');
    requireRecord('loop');
    if (isRecord(value.loop) && typeof value.loop.state !== 'string') {
      errors.push('loop.state must be a string');
    }
  } else if (id === 'ci-json') {
    requireString('$schema');
    requireString('mode');
    requireString('status');
    requireRecord('loop');
    if (isRecord(value.loop) && typeof value.loop.state !== 'string') {
      errors.push('loop.state must be a string');
    }
    if (value.mode === 'project') {
      requireRecord('health');
      if (isRecord(value.health)) {
        if (typeof value.health.status !== 'string') {
          errors.push('health.status must be a string');
        }
        if (typeof value.health.score !== 'number' || !Number.isFinite(value.health.score)) {
          errors.push('health.score must be a finite number');
        }
        if (!Array.isArray(value.health.findings)) {
          errors.push('health.findings must be an array');
        }
      }
    } else if (value.mode === 'workspace') requireRecord('workspace');
    else errors.push('mode must equal project or workspace');
  }

  return errors;
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
  const health = isRecord(parsed?.health) ? parsed.health : parsed;
  const findings = Array.isArray(health?.findings) ? health.findings : [];
  const changeAssurance =
    parsed?.$schema === 'https://decantr.ai/schemas/change-assurance-report.v1.json';
  const ruleCounts = new Map();
  for (const finding of findings) {
    const key = String(
      finding.rule ?? finding.code ?? finding.id ?? finding.occurrence?.code ?? 'unknown',
    );
    ruleCounts.set(key, (ruleCounts.get(key) ?? 0) + 1);
  }
  return {
    schema: parsed?.$schema ?? null,
    status: parsed?.status ?? null,
    score: changeAssurance ? null : (health?.score ?? null),
    loopState: parsed?.loop?.state ?? health?.loop?.state ?? null,
    graphReady: health?.graph?.ready ?? health?.graph?.current ?? null,
    changedFileCount: changeAssurance ? (parsed?.summary?.changedFileCount ?? null) : null,
    impactedSurfaceCount: changeAssurance ? (parsed?.summary?.impactedSurfaceCount ?? null) : null,
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
  const exitExpectationMet = expectNonzero
    ? Number.isInteger(result.status) && result.status !== 0
    : result.status === 0;
  const schemaExpectation = expectNonzero ? null : (JSON_SCHEMA_EXPECTATIONS[id] ?? null);
  const functionalFailureReasons = [];
  let jsonValid = null;
  let jsonError = null;
  let schemaValid = null;
  let schemaErrors = [];

  if (!exitExpectationMet) {
    functionalFailureReasons.push(expectNonzero ? 'expected-nonzero-exit' : 'nonzero-exit');
  }
  if (schemaExpectation && result.status === 0) {
    const parsed = parseJsonOutput(result.stdout);
    jsonValid = parsed.ok;
    jsonError = parsed.error;
    if (!parsed.ok) {
      functionalFailureReasons.push('invalid-json');
    } else {
      schemaErrors = validateJsonSchema(id, parsed.value);
      schemaValid = schemaErrors.length === 0;
      if (!schemaValid) functionalFailureReasons.push('schema-expectation');
    }
  }

  const ok = exitExpectationMet && functionalFailureReasons.length === 0;
  const budgetMs = commandBudgetMs(options, id);
  const command = {
    id,
    args,
    argv: [spec.cmd, ...spec.args],
    cwd,
    scope,
    command: [spec.cmd, ...spec.args].join(' '),
    expectNonzero,
    ok,
    status: result.status,
    signal: result.signal,
    timedOut: result.timedOut,
    durationMs: result.durationMs,
    budgetMs,
    slow: result.durationMs > budgetMs,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
    crashSignatures: crashSignatures(combinedOutput),
    schemaExpectation,
    jsonValid,
    jsonError,
    schemaValid,
    schemaErrors,
    functionalFailure: !ok,
    functionalFailureReasons,
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
    argv: [],
    cwd: null,
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
    schemaExpectation: null,
    jsonValid: null,
    jsonError: null,
    schemaValid: null,
    schemaErrors: [],
    functionalFailure: true,
    functionalFailureReasons: ['preflight-failure'],
  };
  return {
    ...command,
    failureCategory: classifyFailureCategory(id, command),
  };
}

function runProject(candidate, options, roots, runNumber = 1) {
  const repoDir =
    options.repeat === 1
      ? join(roots.reposDir, candidate.id)
      : join(roots.reposDir, candidate.id, `run-${runNumber}`);
  const projectLogDir =
    options.repeat === 1
      ? join(roots.logsDir, candidate.id)
      : join(roots.logsDir, candidate.id, `run-${runNumber}`);
  rmSync(projectLogDir, { recursive: true, force: true });
  mkdirSync(projectLogDir, { recursive: true });

  const clone = cloneRepo(candidate, repoDir, options);
  const project = {
    ...candidate,
    targetId: candidate.id,
    runNumber,
    runId: `${candidate.id}:run-${runNumber}`,
    repoDir,
    clone,
    selectedRoute: candidate.route ?? null,
    scanRouteCount: 0,
    commands: [],
    verify: null,
    fullVerify: null,
    ci: null,
    unexpectedFailures: [],
    functionalFailures: [],
    crashSignatures: [],
  };

  if (!clone.ok) {
    project.unexpectedFailures.push('clone');
    writeFileSync(join(projectLogDir, 'clone.stderr.txt'), clone.stderr || clone.error, 'utf-8');
    return project;
  }

  const head = runProcess(
    'git',
    ['-C', repoDir, 'rev-parse', 'HEAD'],
    dirname(repoDir),
    options.cloneTimeoutMs,
  );
  project.resolvedCommit = head.status === 0 ? head.stdout.trim() : null;

  if (candidate.projectPath && !existsSync(join(repoDir, candidate.projectPath))) {
    const command = syntheticFailureCommand(
      options,
      'project-path-preflight',
      `Configured projectPath does not exist: ${candidate.projectPath}`,
    );
    project.commands.push(command);
    writeCommandLog(projectLogDir, command);
    project.unexpectedFailures = [command.id];
    project.functionalFailures = [command.id];
    project.unexpectedFailureDetails = [
      {
        id: command.id,
        scope: command.scope,
        failureCategory: command.failureCategory,
        status: command.status,
        durationMs: command.durationMs,
        functionalFailureReasons: command.functionalFailureReasons,
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
    [
      'verify-full-json',
      withProject(candidate, ['verify', '--full', '--json']),
      false,
      'app-scoped',
    ],
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
    if (id === 'verify-full-json') {
      project.fullVerify = summarizeVerify(parseJsonFromOutput(command.stdout));
    }
    if (id === 'ci-json') project.ci = summarizeVerify(parseJsonFromOutput(command.stdout));
  }

  project.unexpectedFailures = project.commands
    .filter((command) => !command.ok)
    .map((command) => command.id);
  project.functionalFailures = project.commands
    .filter((command) => command.functionalFailure)
    .map((command) => command.id);
  project.unexpectedFailureDetails = project.commands
    .filter((command) => !command.ok)
    .map((command) => ({
      id: command.id,
      scope: command.scope,
      failureCategory: command.failureCategory,
      status: command.status,
      durationMs: command.durationMs,
      functionalFailureReasons: command.functionalFailureReasons,
    }));
  project.crashSignatures = [
    ...new Set(project.commands.flatMap((command) => command.crashSignatures)),
  ];

  return project;
}

function aggregate(projects, repeat = 1) {
  const targetIds = [...new Set(projects.map((project) => project.targetId ?? project.id))];
  const commandCount = projects.reduce((sum, project) => sum + project.commands.length, 0);
  const unexpectedFailures = projects.reduce(
    (sum, project) => sum + project.unexpectedFailures.length,
    0,
  );
  const crashProjects = projects.filter((project) => project.crashSignatures.length > 0);
  const routeMisses = projects.filter((project) => project.scanRouteCount === 0);
  const commands = projects.flatMap((project) =>
    project.commands.map((command) => ({
      ...command,
      projectId: project.targetId ?? project.id,
      runNumber: project.runNumber ?? 1,
    })),
  );
  const failureCategories = Object.fromEntries(FAILURE_CATEGORIES.map((category) => [category, 0]));
  for (const command of commands) {
    if (!command.ok && command.failureCategory) {
      failureCategories[command.failureCategory] =
        (failureCategories[command.failureCategory] ?? 0) + 1;
    }
  }
  const promotedRuns = projects.filter(
    (project) =>
      project.clone.ok &&
      project.scanRouteCount > 0 &&
      project.crashSignatures.length === 0 &&
      project.unexpectedFailures.length === 0,
  );
  const promotedTargets = targetIds.filter((targetId) => {
    const runs = projects.filter((project) => (project.targetId ?? project.id) === targetId);
    return runs.length === repeat && runs.every((project) => promotedRuns.includes(project));
  });
  const functionalFailureCount = commands.filter((command) => command.functionalFailure).length;

  return {
    projectCount: targetIds.length,
    targetCount: targetIds.length,
    runCount: projects.length,
    repeat,
    commandCount,
    unexpectedFailures,
    functionalFailureCount,
    failedRunCount: projects.filter((project) => project.unexpectedFailures.length > 0).length,
    batchStatus: unexpectedFailures > 0 ? 'failed' : 'passed',
    crashProjectCount: crashProjects.length,
    crashRunCount: crashProjects.length,
    routeMissCount: routeMisses.length,
    rootSmokeCommandCount: commands.filter((command) => command.scope === 'root-smoke').length,
    appScopedCommandCount: commands.filter((command) => command.scope === 'app-scoped').length,
    slowCommandCount: commands.filter((command) => command.slow).length,
    failureCategories,
    promotedProjectCount: promotedTargets.length,
    promotedRunCount: promotedRuns.length,
  };
}

function nearestRankPercentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function summarizeTimings(projects) {
  const commands = projects.flatMap((project) =>
    project.commands.map((command) => ({
      ...command,
      targetId: project.targetId ?? project.id,
      runNumber: project.runNumber ?? 1,
    })),
  );
  const byTargetCommand = new Map();
  for (const command of commands) {
    const key = JSON.stringify([command.targetId, command.id]);
    const current = byTargetCommand.get(key) ?? [];
    current.push(command);
    byTargetCommand.set(key, current);
  }
  const commandDurations = [...byTargetCommand.values()]
    .map((entries) => {
      const entryDurations = entries.map((entry) => entry.durationMs);
      return {
        targetId: entries[0].targetId,
        id: entries[0].id,
        scope: entries[0].scope,
        count: entries.length,
        budgetMs: entries[0]?.budgetMs ?? null,
        samplesMs: entryDurations,
        samples: entries.map((entry) => ({
          runNumber: entry.runNumber,
          durationMs: entry.durationMs,
          status: entry.status,
          ok: entry.ok,
          slow: entry.slow,
        })),
        p50Ms: nearestRankPercentile(entryDurations, 50),
        p95Ms: nearestRankPercentile(entryDurations, 95),
        maxMs: Math.max(...entryDurations),
        slowCount: entries.filter((entry) => entry.slow).length,
        failureCount: entries.filter((entry) => !entry.ok).length,
      };
    })
    .sort((a, b) => a.targetId.localeCompare(b.targetId) || a.id.localeCompare(b.id));

  return {
    totalMs: commands.reduce((sum, command) => sum + command.durationMs, 0),
    percentileMethod: 'nearest-rank',
    grouping: 'target-command',
    pooledAcrossTargets: false,
    byTargetCommand: commandDurations,
    // Kept as an unpooled compatibility alias for existing report consumers.
    byCommand: commandDurations,
    slowCommands: commands
      .filter((command) => command.slow)
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 20)
      .map((command) => ({
        project: command.targetId,
        runNumber: command.runNumber,
        id: command.id,
        scope: command.scope,
        durationMs: command.durationMs,
        budgetMs: command.budgetMs,
      })),
  };
}

function fileSha256(path) {
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    return null;
  }
}

function findPackageManifest(artifactPath) {
  let current = dirname(resolve(artifactPath));
  while (true) {
    const packagePath = join(current, 'package.json');
    if (existsSync(packagePath)) {
      try {
        return { path: packagePath, value: JSON.parse(readFileSync(packagePath, 'utf-8')) };
      } catch {
        return { path: packagePath, value: null };
      }
    }
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function collectToolVersion(name, cmd, args) {
  const result = runProcess(cmd, args, repoRoot, 10_000);
  const version = (result.stdout || result.stderr).trim().split('\n')[0] || null;
  return {
    name,
    argv: [cmd, ...args],
    cwd: repoRoot,
    status: result.status,
    version,
    error: result.error || null,
  };
}

function cliArtifactIdentity(options) {
  const artifactPath = resolve(options.resolvedCliPath ?? options.cliPath);
  const packageManifest = findPackageManifest(artifactPath);
  const versionResult = runProcess(
    process.execPath,
    [artifactPath, '--version'],
    repoRoot,
    options.commandTimeoutMs,
  );
  const sha256 = fileSha256(artifactPath);
  const reportedVersion = (versionResult.stdout || versionResult.stderr).trim().split('\n')[0] || null;
  const packageName = packageManifest?.value?.name ?? null;
  const packageVersion = packageManifest?.value?.version ?? null;
  return {
    source: options.cliPackage ? 'npm-package' : 'file',
    requested: options.cliPackage ?? resolve(options.cliPath),
    resolvedPath: artifactPath,
    sha256,
    identity: `${packageName ?? 'file'}@${packageVersion ?? reportedVersion ?? 'unknown'}#sha256:${sha256 ?? 'unavailable'}`,
    reportedVersion,
    packageName,
    packageVersion,
    packageManifestPath: packageManifest?.path ?? null,
    packageManifestSha256: packageManifest ? fileSha256(packageManifest.path) : null,
    versionCommand: {
      argv: [process.execPath, artifactPath, '--version'],
      cwd: repoRoot,
      status: versionResult.status,
      stderr: versionResult.stderr || null,
      error: versionResult.error || null,
    },
  };
}

function buildReproducibilityManifest(options, candidates, projects, generatedAt) {
  const cli = cliArtifactIdentity(options);
  return {
    schemaVersion: 1,
    generatedAt,
    repeat: options.repeat,
    harness: {
      path: harnessPath,
      sha256: fileSha256(harnessPath),
      cwd: process.cwd(),
      argv: [process.execPath, harnessPath, ...process.argv.slice(2)],
    },
    cli,
    runtime: {
      platform: process.platform,
      arch: process.arch,
      osRelease: osRelease(),
      node: {
        version: process.version,
        executable: process.execPath,
        argv: [process.execPath, '--version'],
      },
    },
    tools: [
      collectToolVersion('git', 'git', ['--version']),
      collectToolVersion('npm', 'npm', ['--version']),
      collectToolVersion('pnpm', 'pnpm', ['--version']),
    ],
    targets: candidates.map((candidate) => {
      const runs = projects.filter(
        (project) => (project.targetId ?? project.id) === candidate.id,
      );
      return {
        id: candidate.id,
        repository: candidate.repo,
        requestedRef: candidate.ref,
        resolvedRefs: [...new Set(runs.map((run) => run.resolvedCommit).filter(Boolean))],
        projectPath: candidate.projectPath,
        configuredRoute: candidate.route,
        runs: runs.map((run) => ({
          runNumber: run.runNumber,
          runId: run.runId,
          resolvedRef: run.resolvedCommit ?? null,
          selectedRoute: run.selectedRoute,
          repositoryReused: run.clone.reused,
          repositoryCommands: run.clone.commands ?? [],
          cliCommands: run.commands.map((command) => ({
            id: command.id,
            scope: command.scope,
            argv: command.argv,
            cwd: command.cwd,
            expectedExit: command.expectNonzero ? 'nonzero' : 'zero',
            schemaExpectation: command.schemaExpectation,
            status: command.status,
            durationMs: command.durationMs,
          })),
        })),
      };
    }),
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
    `- Targets: ${report.summary.targetCount}`,
    `- Repeats per target: ${report.summary.repeat}`,
    `- Isolated runs: ${report.summary.runCount}`,
    `- Commands: ${report.summary.commandCount}`,
    `- Root-smoke commands: ${report.summary.rootSmokeCommandCount}`,
    `- App-scoped commands: ${report.summary.appScopedCommandCount}`,
    `- Unexpected failures: ${report.summary.unexpectedFailures}`,
    `- Crash projects: ${report.summary.crashProjectCount}`,
    `- Route misses: ${report.summary.routeMissCount}`,
    `- Slow commands: ${report.summary.slowCommandCount}`,
    `- Promoted corpus candidates: ${report.summary.promotedProjectCount}`,
    `- Functional batch status: ${report.summary.batchStatus}`,
    `- Functional command failures: ${report.summary.functionalFailureCount}`,
    `- Recommended next version: ${report.honesty.recommendedNextVersion}`,
    '',
    '## Timing',
    '',
    `- Total command time: ${report.timings.totalMs}ms`,
    '- Percentile method: nearest-rank.',
    '- Grouping: target x command; samples are never pooled across targets.',
    '',
    '| Target | Command | Samples | Raw ms | Budget | p50 | p95 | Max | Slow | Failures |',
    '| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const command of report.timings.byTargetCommand) {
    lines.push(
      `| ${command.targetId} | \`${command.id}\` | ${command.count} | ${command.samplesMs.join(', ')} | ${command.budgetMs ?? 'n/a'} | ${command.p50Ms} | ${command.p95Ms} | ${command.maxMs} | ${command.slowCount} | ${command.failureCount} |`,
    );
  }

  lines.push('', '### Slow Commands', '');
  if (report.timings.slowCommands.length === 0) {
    lines.push('- None exceeded the configured performance budget.');
  } else {
    for (const command of report.timings.slowCommands.slice(0, 10)) {
      lines.push(
        `- ${command.project} run ${command.runNumber} \`${command.id}\` (${command.scope}) took ${command.durationMs}ms; budget ${command.budgetMs}ms.`,
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
    '| Project | Run | Ref | Project Path | Kind | Route Count | Selected Route | Unexpected Failures | Verify | Findings | Crash Signatures |',
    '| --- | ---: | --- | --- | --- | ---: | --- | --- | --- | ---: | --- |',
  );

  for (const project of report.projects) {
    lines.push(
      `| ${project.id} | ${project.runNumber} | \`${project.ref ?? 'default branch'}\` | ${project.projectPath ? `\`${project.projectPath}\`` : 'root'} | ${project.kind} | ${project.scanRouteCount} | \`${project.selectedRoute ?? 'n/a'}\` | ${project.unexpectedFailures.join(', ') || 'none'} | ${project.verify?.status ?? 'n/a'} / ${project.verify?.score ?? 'n/a'} | ${project.verify?.findingCount ?? 0} | ${project.crashSignatures.join(', ') || 'none'} |`,
    );
  }

  lines.push('', '## Notes', '');
  for (const project of report.projects) {
    lines.push(`### ${project.id} run ${project.runNumber}`, '');
    lines.push(`- Repo: ${project.repo}`);
    lines.push(`- Requested ref: ${project.ref ?? 'default branch'}`);
    lines.push(`- Resolved commit: ${project.resolvedCommit ?? 'unavailable'}`);
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

  lines.push(
    '## Reproducibility',
    '',
    `- Manifest: ${report.reproducibilityManifestPath}`,
    `- CLI artifact: ${report.reproducibilityManifest.cli.resolvedPath}`,
    `- CLI SHA-256: ${report.reproducibilityManifest.cli.sha256 ?? 'unavailable'}`,
    `- CLI reported version: ${report.reproducibilityManifest.cli.reportedVersion ?? 'unavailable'}`,
    `- Runtime: Node ${report.reproducibilityManifest.runtime.node.version} on ${report.reproducibilityManifest.runtime.platform}/${report.reproducibilityManifest.runtime.arch}`,
    '',
  );

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
  assertUniqueCandidateIds(candidates);
  const cliLabel = options.cliPackage ?? resolve(options.cliPath);
  const projects = [];
  for (const candidate of candidates) {
    for (let runNumber = 1; runNumber <= options.repeat; runNumber += 1) {
      console.log(
        `[realworld-corpus] ${candidate.id} run ${runNumber}/${options.repeat}: cloning/running`,
      );
      const project = runProject(candidate, options, roots, runNumber);
      projects.push(project);
      console.log(
        `[realworld-corpus] ${candidate.id} run ${runNumber}/${options.repeat}: routes=${project.scanRouteCount} failures=${project.unexpectedFailures.length}`,
      );
    }
  }

  const summary = aggregate(projects, options.repeat);
  const timings = summarizeTimings(projects);
  const generatedAt = new Date().toISOString();
  const reproducibilityManifestPath = join(
    roots.reportsDir,
    'reproducibility-manifest.json',
  );
  const reproducibilityManifest = buildReproducibilityManifest(
    options,
    candidates,
    projects,
    generatedAt,
  );
  const report = {
    schemaVersion: 3,
    generatedAt,
    cliLabel,
    outDir,
    summary,
    timings,
    reproducibilityManifestPath,
    reproducibilityManifest,
    honesty: {
      recommendedNextVersion: recommendation(summary),
      knownLimitations: [
        summary.routeMissCount > 0
          ? `${summary.routeMissCount} isolated run(s) produced no taskable routes in scan.`
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
    reproducibilityManifestPath,
    `${JSON.stringify(reproducibilityManifest, null, 2)}\n`,
    'utf-8',
  );
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
  console.log(`Wrote ${reproducibilityManifestPath}`);
  if (summary.batchStatus === 'failed') process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === harnessPath) {
  try {
    main();
  } catch (error) {
    console.error((error && error.stack) || error);
    process.exit(1);
  }
}

export { summarizeVerify, validateJsonSchema };
