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

function parseArgs(argv) {
  const options = {
    configPath: null,
    outDir: join('/tmp', `decantr-realworld-corpus-${Date.now()}`),
    limit: DEFAULT_CANDIDATES.length,
    cliPath: existsSync(defaultCli) ? defaultCli : null,
    cliPackage: null,
    keepRepos: false,
    forceClone: false,
    commandTimeoutMs: 120_000,
    cloneTimeoutMs: 240_000,
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

Config shape:
  {
    "candidates": [
      {
        "id": "cypress-realworld-app",
        "repo": "https://github.com/cypress-io/cypress-realworld-app.git",
        "route": "/transaction/new",
        "kind": "react-payment-app",
        "expected": "medium",
        "notes": "Why this target matters"
      }
    ]
  }`);
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
    route: typeof candidate.route === 'string' ? candidate.route : null,
    kind: String(candidate.kind ?? 'unknown'),
    expected: String(candidate.expected ?? 'unknown'),
    notes: String(candidate.notes ?? ''),
  }));
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
  if (candidate.route) return candidate.route;
  const routes = extractRoutes(scanJson);
  return (
    routes.find((route) => route !== '/' && !route.includes('*') && !route.includes(':')) ??
    routes.find((route) => route !== '/' && !route.includes('*')) ??
    routes[0] ??
    '/'
  );
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

function runDecantrCommand(options, cwd, id, args, expectNonzero = false) {
  const spec = commandSpec(options, args);
  const result = runProcess(spec.cmd, spec.args, cwd, options.commandTimeoutMs);
  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  const ok = expectNonzero ? result.status !== 0 : result.status === 0;
  return {
    id,
    args,
    command: [spec.cmd, ...spec.args].join(' '),
    expectNonzero,
    ok,
    status: result.status,
    signal: result.signal,
    timedOut: result.timedOut,
    durationMs: result.durationMs,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
    crashSignatures: crashSignatures(combinedOutput),
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

  const preCommands = [
    ['version', ['--version'], false],
    ['help', ['--help'], false],
    ['scan-json', ['scan', '--json'], false],
    ['scan-text', ['scan'], false],
    ['setup-pre', ['setup'], false],
    ['workspace-list-json', ['workspace', 'list', '--json'], false],
  ];

  let scanJson = null;
  for (const [id, args, expectNonzero] of preCommands) {
    const command = runDecantrCommand(options, repoDir, id, args, expectNonzero);
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

  const postCommands = [
    ['adopt', ['adopt', '--yes', '--no-packs'], false],
    ['doctor', ['doctor'], false],
    ['graph-json', ['graph', '--json'], false],
    ['graph-route-json', ['graph', '--route', project.selectedRoute, '--json'], false],
    [
      'task-json',
      ['task', project.selectedRoute, 'Review this route before editing', '--json'],
      false,
    ],
    ['verify-json', ['verify', '--json'], false],
    ['ci-json', ['ci', '--json'], false],
    ['resolve', ['resolve'], false],
    ['refresh-check', ['refresh', '--check'], false],
    ['graph-check', ['graph', '--check'], false],
    ['bad-doctor-missing-project', ['doctor', '--project', './definitely-missing-app'], true],
    [
      'bad-task-route',
      ['task', '/definitely-missing-route', 'Bad route smoke', '--json'],
      true,
    ],
  ];

  for (const [id, args, expectNonzero] of postCommands) {
    const command = runDecantrCommand(options, repoDir, id, args, expectNonzero);
    project.commands.push(command);
    writeCommandLog(projectLogDir, command);
    if (id === 'verify-json') project.verify = summarizeVerify(parseJsonFromOutput(command.stdout));
    if (id === 'ci-json') project.ci = summarizeVerify(parseJsonFromOutput(command.stdout));
  }

  project.unexpectedFailures = project.commands
    .filter((command) => !command.ok)
    .map((command) => command.id);
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
  return {
    projectCount: projects.length,
    commandCount,
    unexpectedFailures,
    crashProjectCount: crashProjects.length,
    routeMissCount: routeMisses.length,
    promotedProjectCount: projects.filter(
      (project) =>
        project.clone.ok &&
        project.scanRouteCount > 0 &&
        project.crashSignatures.length === 0 &&
        project.unexpectedFailures.length === 0,
    ).length,
  };
}

function recommendation(summary) {
  if (summary.crashProjectCount > 0 || summary.routeMissCount > 1) return '3.5.x';
  if (summary.unexpectedFailures > 0) return '3.5.x';
  return '3.6.0-planning';
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
    `- Unexpected failures: ${report.summary.unexpectedFailures}`,
    `- Crash projects: ${report.summary.crashProjectCount}`,
    `- Route misses: ${report.summary.routeMissCount}`,
    `- Promoted corpus candidates: ${report.summary.promotedProjectCount}`,
    `- Recommended next version: ${report.honesty.recommendedNextVersion}`,
    '',
    '## Projects',
    '',
    '| Project | Kind | Route Count | Selected Route | Unexpected Failures | Verify | Findings | Crash Signatures |',
    '| --- | --- | ---: | --- | --- | --- | ---: | --- |',
  ];

  for (const project of report.projects) {
    lines.push(
      `| ${project.id} | ${project.kind} | ${project.scanRouteCount} | \`${project.selectedRoute ?? 'n/a'}\` | ${project.unexpectedFailures.join(', ') || 'none'} | ${project.verify?.status ?? 'n/a'} / ${project.verify?.score ?? 'n/a'} | ${project.verify?.findingCount ?? 0} | ${project.crashSignatures.join(', ') || 'none'} |`,
    );
  }

  lines.push('', '## Notes', '');
  for (const project of report.projects) {
    lines.push(`### ${project.id}`, '');
    lines.push(`- Repo: ${project.repo}`);
    lines.push(`- Expected setup burden: ${project.expected}`);
    lines.push(`- Notes: ${project.notes || 'n/a'}`);
    lines.push(`- Clone: ${project.clone.ok ? 'pass' : 'fail'}`);
    if (project.detectedRoutes?.length) {
      lines.push(`- First routes: ${project.detectedRoutes.map((route) => `\`${route}\``).join(', ')}`);
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

  const candidates = readCandidates(options.configPath).slice(0, options.limit);
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
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    cliLabel,
    outDir,
    summary,
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
