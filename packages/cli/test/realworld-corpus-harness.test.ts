import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function seedGitRepo(repoDir: string): void {
  mkdirSync(join(repoDir, 'src'), { recursive: true });
  writeFileSync(
    join(repoDir, 'package.json'),
    JSON.stringify({ name: repoDir.split('/').pop(), dependencies: { react: '^19.0.0' } }, null, 2),
    'utf-8',
  );
  writeFileSync(join(repoDir, 'src', 'App.tsx'), 'export function App() { return <main />; }\n');
  execFileSync('git', ['init'], { cwd: repoDir });
  execFileSync('git', ['add', '.'], { cwd: repoDir });
  execFileSync(
    'git',
    ['-c', 'user.email=test@example.com', '-c', 'user.name=Test', 'commit', '-m', 'fixture'],
    { cwd: repoDir },
  );
}

describe('real-world corpus harness', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-realworld-harness-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('emits v3 timing, scope, and failure-taxonomy summaries', () => {
    const repoDir = join(testDir, 'source-app');
    seedGitRepo(repoDir);

    const fakeCli = join(testDir, 'fake-decantr-cli.mjs');
    writeFileSync(
      fakeCli,
      `#!/usr/bin/env node
const args = process.argv.slice(2);
const has = (value) => args.includes(value);
if (has('--version')) {
  console.log('3.6.0-test');
  process.exit(0);
}
if (has('--help')) {
  console.log('Usage: decantr scan adopt task verify ci');
  process.exit(0);
}
const command = args[0];
if (command === 'scan' && has('--json')) {
  console.log(JSON.stringify({
    schemaVersion: 'scan-report.v2',
    project: { framework: 'react' },
    routes: { items: [{ path: '/', file: 'src/App.tsx' }] },
  }));
  process.exit(0);
}
if (command === 'scan') {
  console.log('Decantr Scan');
  process.exit(0);
}
if (command === 'workspace') {
  console.log(JSON.stringify({ projects: [], candidates: [] }));
  process.exit(0);
}
if (command === 'task' && args.includes('/definitely-missing-route')) {
  console.error('Route not found: /definitely-missing-route');
  process.exit(2);
}
if (command === 'doctor' && args.includes('./definitely-missing-app')) {
  console.error('Project path does not exist. Pass --project apps/web.');
  process.exit(2);
}
if (command === 'graph' && has('--json')) {
  console.log(JSON.stringify({
    snapshot: { id: 'graph:test' },
    routeContext: has('--route') ? { route: '/', found: true } : null,
    wrote: true,
  }));
  process.exit(0);
}
if (command === 'verify' && has('--json')) {
  if (!has('--full')) {
    console.log(JSON.stringify({
      $schema: 'https://decantr.ai/schemas/change-assurance-report.v1.json',
      version: '1.0.0',
      status: 'pass',
      project: {},
      comparisonScope: {},
      changeBase: {},
      authority: {},
      surfaces: {},
      findings: [],
      limitations: [],
      summary: { changedFileCount: 0, impactedSurfaceCount: 0 },
    }));
    process.exit(0);
  }
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/project-health-report.v2.json',
    status: 'healthy',
    score: 100,
    summary: {},
    loop: { state: 'verified' },
    graph: { ready: true },
    findings: [],
  }));
  process.exit(0);
}
if (command === 'ci' && has('--json')) {
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/ci-report.v2.json',
    mode: 'project',
    status: 'healthy',
    loop: { state: 'verified' },
    health: { status: 'healthy', score: 100, graph: { ready: true }, findings: [] },
  }));
  process.exit(0);
}
if (command === 'task' && has('--json')) {
  console.log(JSON.stringify({
    route: '/',
    read: ['src/App.tsx'],
    loop: { state: 'ready_to_edit' },
    verifyCommand: 'decantr verify',
  }));
  process.exit(0);
}
console.log('ok');
process.exit(0);
`,
      'utf-8',
    );

    const configPath = join(testDir, 'corpus.json');
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          candidates: [
            {
              id: 'fixture',
              repo: repoDir,
              projectPath: null,
              route: '/',
              kind: 'test-react-app',
              expected: 'easy',
              notes: 'local fixture',
            },
          ],
        },
        null,
        2,
      ),
      'utf-8',
    );
    const outDir = join(testDir, 'out');
    const script = resolve(__dirname, '..', '..', '..', 'scripts', 'run-realworld-corpus.mjs');
    execFileSync('node', [
      script,
      '--config',
      configPath,
      '--out',
      outDir,
      '--cli',
      fakeCli,
      '--limit',
      '1',
      '--budget-multiplier',
      '0.0001',
    ]);

    const report = JSON.parse(
      readFileSync(join(outDir, 'reports', 'aggregate-summary.json'), 'utf-8'),
    ) as {
      schemaVersion: number;
      summary: {
        repeat: number;
        runCount: number;
        batchStatus: string;
        functionalFailureCount: number;
        rootSmokeCommandCount: number;
        appScopedCommandCount: number;
        failureCategories: Record<string, number>;
        slowCommandCount: number;
      };
      timings: {
        percentileMethod: string;
        byTargetCommand: Array<{
          targetId: string;
          id: string;
          p95Ms: number;
          samplesMs: number[];
        }>;
        slowCommands: unknown[];
      };
      reproducibilityManifest: {
        cli: { sha256: string; reportedVersion: string };
        runtime: { node: { version: string } };
        tools: Array<{ name: string; argv: string[]; version: string }>;
        targets: Array<{ requestedRef: string | null; runs: Array<{ resolvedRef: string }> }>;
      };
      projects: Array<{ commands: Array<{ id: string; scope: string; budgetMs: number }> }>;
    };

    expect(report.schemaVersion).toBe(3);
    expect(report.summary).toMatchObject({
      repeat: 1,
      runCount: 1,
      batchStatus: 'passed',
      functionalFailureCount: 0,
    });
    expect(report.summary.rootSmokeCommandCount).toBeGreaterThan(0);
    expect(report.summary.appScopedCommandCount).toBeGreaterThan(0);
    expect(report.summary.failureCategories).toHaveProperty('missing_project_scope');
    expect(report.summary.failureCategories).toHaveProperty('route_context_failure');
    expect(report.summary.slowCommandCount).toBeGreaterThan(0);
    expect(report.timings.percentileMethod).toBe('nearest-rank');
    expect(
      report.timings.byTargetCommand.some(
        (entry) =>
          entry.targetId === 'fixture' && entry.id === 'scan-json' && entry.samplesMs.length === 1,
      ),
    ).toBe(true);
    expect(report.timings.slowCommands.length).toBeGreaterThan(0);
    expect(report.reproducibilityManifest.cli.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(report.reproducibilityManifest.cli.reportedVersion).toBe('3.6.0-test');
    expect(report.reproducibilityManifest.runtime.node.version).toBe(process.version);
    expect(report.reproducibilityManifest.tools.find((tool) => tool.name === 'git')?.argv).toEqual([
      'git',
      '--version',
    ]);
    expect(report.reproducibilityManifest.targets[0]?.runs[0]?.resolvedRef).toMatch(
      /^[a-f0-9]{40}$/,
    );
    expect(report.projects[0]?.commands.some((command) => command.scope === 'root-smoke')).toBe(
      true,
    );
    expect(report.projects[0]?.commands.some((command) => command.scope === 'app-scoped')).toBe(
      true,
    );
  }, 30_000);

  it('repeats targets in isolated checkouts and records nearest-rank raw samples', () => {
    const repoDir = join(testDir, 'repeat-source');
    seedGitRepo(repoDir);

    const fakeCli = join(testDir, 'fake-repeat-cli.mjs');
    writeFileSync(
      fakeCli,
      `#!/usr/bin/env node
import { existsSync, writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
const has = (value) => args.includes(value);
const command = args[0];
if (has('--version')) {
  console.log('3.9.0-repeat-test');
  process.exit(0);
}
if (has('--help')) {
  console.log('Usage: decantr scan adopt task verify ci');
  process.exit(0);
}
if (command === 'scan' && has('--json')) {
  if (existsSync('.adopted-by-harness')) {
    console.error('repeat reused an adopted worktree');
    process.exit(9);
  }
  console.log(JSON.stringify({
    schemaVersion: 'scan-report.v2',
    project: { framework: 'react' },
    routes: { items: [{ path: '/', file: 'src/App.tsx' }] },
  }));
  process.exit(0);
}
if (command === 'scan') {
  console.log('scan ok');
  process.exit(0);
}
if (command === 'workspace') {
  console.log(JSON.stringify({ projects: [], candidates: [] }));
  process.exit(0);
}
if (command === 'adopt') {
  writeFileSync('.adopted-by-harness', 'adopted\\n');
  console.log('adopted');
  process.exit(0);
}
if (command === 'doctor' && args.includes('./definitely-missing-app')) {
  console.error('Project path does not exist. Pass --project apps/web.');
  process.exit(2);
}
if (command === 'task' && args.includes('/definitely-missing-route')) {
  console.error('Route not found: /definitely-missing-route');
  process.exit(2);
}
if (command === 'graph' && has('--json')) {
  console.log(JSON.stringify({
    snapshot: { id: 'graph:repeat-test' },
    routeContext: has('--route') ? { route: '/', found: true } : null,
    wrote: true,
  }));
  process.exit(0);
}
if (command === 'task' && has('--json')) {
  console.log(JSON.stringify({
    route: '/',
    read: ['src/App.tsx'],
    loop: { state: 'ready_to_edit' },
    verifyCommand: 'decantr verify',
  }));
  process.exit(0);
}
if (command === 'verify' && has('--json')) {
  if (!has('--full')) {
    console.log(JSON.stringify({
      $schema: 'https://decantr.ai/schemas/change-assurance-report.v1.json',
      version: '1.0.0',
      status: 'pass',
      project: {},
      comparisonScope: {},
      changeBase: {},
      authority: {},
      surfaces: {},
      findings: [],
      limitations: [],
      summary: { changedFileCount: 0, impactedSurfaceCount: 0 },
    }));
    process.exit(0);
  }
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/project-health-report.v2.json',
    status: 'healthy',
    score: 100,
    summary: {},
    loop: { state: 'verified' },
    findings: [],
  }));
  process.exit(0);
}
if (command === 'ci' && has('--json')) {
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/ci-report.v2.json',
    mode: 'project',
    status: 'healthy',
    loop: { state: 'verified' },
    health: { status: 'healthy', score: 100, findings: [] },
  }));
  process.exit(0);
}
console.log('ok');
process.exit(0);
`,
      'utf-8',
    );

    const configPath = join(testDir, 'repeat-corpus.json');
    writeFileSync(
      configPath,
      JSON.stringify({
        candidates: [
          {
            id: 'repeat-fixture',
            repo: repoDir,
            route: '/',
            kind: 'test-app',
            expected: 'easy',
            notes: 'repeat isolation fixture',
          },
        ],
      }),
      'utf-8',
    );

    const outDir = join(testDir, 'repeat-out');
    const script = resolve(__dirname, '..', '..', '..', 'scripts', 'run-realworld-corpus.mjs');
    execFileSync('node', [
      script,
      '--config',
      configPath,
      '--out',
      outDir,
      '--cli',
      fakeCli,
      '--repeat',
      '3',
      '--keep-repos',
    ]);

    const report = JSON.parse(
      readFileSync(join(outDir, 'reports', 'aggregate-summary.json'), 'utf-8'),
    ) as {
      summary: {
        targetCount: number;
        runCount: number;
        repeat: number;
        batchStatus: string;
      };
      timings: {
        byTargetCommand: Array<{
          targetId: string;
          id: string;
          count: number;
          samplesMs: number[];
          p50Ms: number;
          p95Ms: number;
          maxMs: number;
        }>;
      };
      projects: Array<{
        runNumber: number;
        repoDir: string;
        clone: { reused: boolean };
      }>;
      reproducibilityManifest: {
        repeat: number;
        targets: Array<{
          resolvedRefs: string[];
          runs: Array<{ repositoryReused: boolean; cliCommands: unknown[] }>;
        }>;
      };
    };

    expect(report.summary).toMatchObject({
      targetCount: 1,
      runCount: 3,
      repeat: 3,
      batchStatus: 'passed',
    });
    expect(report.projects.map((project) => project.runNumber)).toEqual([1, 2, 3]);
    expect(new Set(report.projects.map((project) => project.repoDir)).size).toBe(3);
    expect(report.projects.every((project) => project.clone.reused === false)).toBe(true);
    for (const project of report.projects) {
      expect(existsSync(join(project.repoDir, '.adopted-by-harness'))).toBe(true);
      expect(
        existsSync(
          join(
            outDir,
            'logs',
            'repeat-fixture',
            `run-${project.runNumber}`,
            'scan-json.stdout.txt',
          ),
        ),
      ).toBe(true);
    }

    const scanTiming = report.timings.byTargetCommand.find(
      (entry) => entry.targetId === 'repeat-fixture' && entry.id === 'scan-json',
    );
    expect(scanTiming).toBeDefined();
    expect(scanTiming?.count).toBe(3);
    expect(scanTiming?.samplesMs).toHaveLength(3);
    const sortedSamples = [...(scanTiming?.samplesMs ?? [])].sort((a, b) => a - b);
    expect(scanTiming?.p50Ms).toBe(sortedSamples[1]);
    expect(scanTiming?.p95Ms).toBe(sortedSamples[2]);
    expect(scanTiming?.maxMs).toBe(sortedSamples[2]);

    expect(report.reproducibilityManifest.repeat).toBe(3);
    expect(report.reproducibilityManifest.targets[0]?.resolvedRefs).toHaveLength(1);
    expect(report.reproducibilityManifest.targets[0]?.runs).toHaveLength(3);
    expect(
      report.reproducibilityManifest.targets[0]?.runs.every(
        (run) => run.repositoryReused === false && run.cliCommands.length > 0,
      ),
    ).toBe(true);
    expect(
      JSON.parse(readFileSync(join(outDir, 'reports', 'reproducibility-manifest.json'), 'utf-8')),
    ).toEqual(report.reproducibilityManifest);
  }, 45_000);

  it('fails the batch for happy-path exit, JSON parse, and schema expectation failures', () => {
    const repoDir = join(testDir, 'functional-source');
    seedGitRepo(repoDir);

    const fakeCli = join(testDir, 'fake-functional-failure-cli.mjs');
    writeFileSync(
      fakeCli,
      `#!/usr/bin/env node
const args = process.argv.slice(2);
const has = (value) => args.includes(value);
const command = args[0];
if (has('--version')) {
  console.log('3.9.0-functional-test');
  process.exit(0);
}
if (has('--help')) {
  console.log('Usage: decantr scan adopt task verify ci');
  process.exit(0);
}
if (command === 'scan' && has('--json')) {
  console.log(JSON.stringify({
    schemaVersion: 'scan-report.v2',
    project: { framework: 'react' },
    routes: { items: [{ path: '/', file: 'src/App.tsx' }] },
  }));
  process.exit(0);
}
if (command === 'scan') {
  console.log('scan ok');
  process.exit(0);
}
if (command === 'workspace') {
  console.log(JSON.stringify({ projects: [], candidates: [] }));
  process.exit(0);
}
if (command === 'doctor' && args.includes('./definitely-missing-app')) {
  console.error('Project path does not exist. Pass --project apps/web.');
  process.exit(2);
}
if (command === 'task' && args.includes('/definitely-missing-route')) {
  console.error('Route not found: /definitely-missing-route');
  process.exit(2);
}
if (command === 'graph' && has('--json')) {
  console.log(has('--route') ? JSON.stringify({}) : 'not-json');
  process.exit(0);
}
if (command === 'task' && has('--json')) {
  console.log(JSON.stringify({
    route: '/',
    read: ['src/App.tsx'],
    loop: { state: 'ready_to_edit' },
    verifyCommand: 'decantr verify',
  }));
  process.exit(7);
}
if (command === 'verify' && has('--json')) {
  if (!has('--full')) {
    console.log(JSON.stringify({
      $schema: 'https://decantr.ai/schemas/change-assurance-report.v1.json',
      version: '1.0.0',
      status: 'pass',
      project: {},
      comparisonScope: {},
      changeBase: {},
      authority: {},
      surfaces: {},
      findings: [],
      limitations: [],
      summary: { changedFileCount: 0, impactedSurfaceCount: 0 },
    }));
    process.exit(0);
  }
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/project-health-report.v2.json',
    status: 'healthy',
    score: 100,
    summary: {},
    loop: { state: 'verified' },
    findings: [],
  }));
  process.exit(0);
}
if (command === 'ci' && has('--json')) {
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/ci-report.v2.json',
    mode: 'project',
    status: 'healthy',
    loop: { state: 'verified' },
    health: { status: 'healthy', score: 100, findings: [] },
  }));
  process.exit(0);
}
console.log('ok');
process.exit(0);
`,
      'utf-8',
    );

    const configPath = join(testDir, 'functional-corpus.json');
    writeFileSync(
      configPath,
      JSON.stringify({
        candidates: [
          {
            id: 'functional-fixture',
            repo: repoDir,
            route: '/',
            kind: 'test-app',
            expected: 'easy',
            notes: 'functional failure fixture',
          },
        ],
      }),
      'utf-8',
    );

    const outDir = join(testDir, 'functional-out');
    const script = resolve(__dirname, '..', '..', '..', 'scripts', 'run-realworld-corpus.mjs');
    const result = spawnSync(
      'node',
      [script, '--config', configPath, '--out', outDir, '--cli', fakeCli],
      { encoding: 'utf-8' },
    );
    expect(result.status).toBe(1);

    const report = JSON.parse(
      readFileSync(join(outDir, 'reports', 'aggregate-summary.json'), 'utf-8'),
    ) as {
      summary: {
        batchStatus: string;
        unexpectedFailures: number;
        functionalFailureCount: number;
      };
      projects: Array<{
        commands: Array<{
          id: string;
          status: number;
          jsonValid: boolean | null;
          schemaValid: boolean | null;
          schemaErrors: string[];
          functionalFailureReasons: string[];
        }>;
      }>;
    };

    expect(report.summary).toMatchObject({
      batchStatus: 'failed',
      unexpectedFailures: 3,
      functionalFailureCount: 3,
    });
    const commands = report.projects[0]?.commands ?? [];
    expect(commands.find((command) => command.id === 'graph-json')).toMatchObject({
      status: 0,
      jsonValid: false,
      schemaValid: null,
      functionalFailureReasons: ['invalid-json'],
    });
    expect(commands.find((command) => command.id === 'graph-route-json')).toMatchObject({
      status: 0,
      jsonValid: true,
      schemaValid: false,
      functionalFailureReasons: ['schema-expectation'],
    });
    expect(commands.find((command) => command.id === 'graph-route-json')?.schemaErrors).toContain(
      'snapshot must be an object',
    );
    expect(commands.find((command) => command.id === 'task-json')).toMatchObject({
      status: 7,
      functionalFailureReasons: ['nonzero-exit'],
    });
  }, 30_000);

  it.each(['0', '-1', '1.5', 'not-a-number'])('rejects invalid --repeat value %s', (repeat) => {
    const script = resolve(__dirname, '..', '..', '..', 'scripts', 'run-realworld-corpus.mjs');
    const result = spawnSync('node', [script, '--repeat', repeat], { encoding: 'utf-8' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--repeat must be a positive integer');
  });

  it('runs every configured candidate by default and falls back from invalid configured routes', () => {
    const repoA = join(testDir, 'source-a');
    const repoB = join(testDir, 'source-b');
    seedGitRepo(repoA);
    seedGitRepo(repoB);

    const fakeCli = join(testDir, 'fake-route-fallback-cli.mjs');
    writeFileSync(
      fakeCli,
      `#!/usr/bin/env node
const args = process.argv.slice(2);
const has = (value) => args.includes(value);
const command = args[0];
if (has('--version')) {
  console.log('3.6.1-test');
  process.exit(0);
}
if (has('--help')) {
  console.log('Usage: decantr scan adopt task verify ci');
  process.exit(0);
}
if (command === 'scan' && has('--json')) {
  console.log(JSON.stringify({
    schemaVersion: 'scan-report.v2',
    project: { framework: 'react' },
    routes: { items: [{ path: '/docs/changelog', file: 'src/App.tsx' }] },
  }));
  process.exit(0);
}
if (command === 'scan') {
  console.log('scan ok');
  process.exit(0);
}
if (command === 'workspace') {
  console.log(JSON.stringify({ projects: [], candidates: [] }));
  process.exit(0);
}
if (command === 'doctor' && args.includes('./definitely-missing-app')) {
  console.error('Project path does not exist. Pass --project apps/web.');
  process.exit(2);
}
if (command === 'task' && args.includes('/definitely-missing-route')) {
  console.error('Route not found: /definitely-missing-route');
  process.exit(2);
}
if ((command === 'graph' || command === 'task') && args.includes('/docs')) {
  console.error('Route not found: /docs');
  process.exit(2);
}
if (command === 'graph' && has('--json')) {
  console.log(JSON.stringify({
    snapshot: { id: 'graph:test' },
    routeContext: has('--route') ? { route: '/docs/changelog', found: true } : null,
    wrote: true,
  }));
  process.exit(0);
}
if (command === 'verify' && has('--json')) {
  if (!has('--full')) {
    console.log(JSON.stringify({
      $schema: 'https://decantr.ai/schemas/change-assurance-report.v1.json',
      version: '1.0.0',
      status: 'pass',
      project: {},
      comparisonScope: {},
      changeBase: {},
      authority: {},
      surfaces: {},
      findings: [],
      limitations: [],
      summary: { changedFileCount: 0, impactedSurfaceCount: 0 },
    }));
    process.exit(0);
  }
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/project-health-report.v2.json',
    status: 'healthy',
    score: 100,
    summary: {},
    loop: { state: 'verified' },
    graph: { ready: true },
    findings: [],
  }));
  process.exit(0);
}
if (command === 'ci' && has('--json')) {
  console.log(JSON.stringify({
    $schema: 'https://schemas.decantr.ai/ci-report.v2.json',
    mode: 'project',
    status: 'healthy',
    loop: { state: 'verified' },
    health: { status: 'healthy', score: 100, graph: { ready: true }, findings: [] },
  }));
  process.exit(0);
}
if (command === 'task' && has('--json')) {
  console.log(JSON.stringify({
    route: '/docs/changelog',
    read: ['src/App.tsx'],
    loop: { state: 'ready_to_edit' },
    verifyCommand: 'decantr verify',
  }));
  process.exit(0);
}
console.log('ok');
process.exit(0);
`,
      'utf-8',
    );

    const configPath = join(testDir, 'fallback-corpus.json');
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          candidates: [
            {
              id: 'fixture-a',
              repo: repoA,
              route: '/docs',
              kind: 'test-app',
              expected: 'easy',
              notes: 'route fallback fixture',
            },
            {
              id: 'fixture-b',
              repo: repoB,
              kind: 'test-app',
              expected: 'easy',
              notes: 'default limit fixture',
            },
          ],
        },
        null,
        2,
      ),
      'utf-8',
    );

    const outDir = join(testDir, 'fallback-out');
    const script = resolve(__dirname, '..', '..', '..', 'scripts', 'run-realworld-corpus.mjs');
    execFileSync('node', [script, '--config', configPath, '--out', outDir, '--cli', fakeCli]);

    const report = JSON.parse(
      readFileSync(join(outDir, 'reports', 'aggregate-summary.json'), 'utf-8'),
    ) as {
      summary: { projectCount: number; unexpectedFailures: number };
      projects: Array<{ id: string; selectedRoute: string; routeFallback?: { selected: string } }>;
      timings: {
        byTargetCommand: Array<{ targetId: string; id: string; count: number }>;
      };
    };

    expect(report.summary.projectCount).toBe(2);
    expect(report.summary.unexpectedFailures).toBe(0);
    expect(report.projects.find((project) => project.id === 'fixture-a')?.selectedRoute).toBe(
      '/docs/changelog',
    );
    expect(
      report.projects.find((project) => project.id === 'fixture-a')?.routeFallback?.selected,
    ).toBe('/docs/changelog');
    expect(
      report.timings.byTargetCommand
        .filter((entry) => entry.id === 'scan-json')
        .map((entry) => ({ targetId: entry.targetId, count: entry.count })),
    ).toEqual([
      { targetId: 'fixture-a', count: 1 },
      { targetId: 'fixture-b', count: 1 },
    ]);
  }, 30_000);

  it('preflights missing project paths as a single missing-project-scope failure', () => {
    const repoDir = join(testDir, 'source-monorepo');
    seedGitRepo(repoDir);

    const fakeCli = join(testDir, 'fake-preflight-cli.mjs');
    writeFileSync(fakeCli, 'console.log("unused");\n', 'utf-8');

    const configPath = join(testDir, 'preflight-corpus.json');
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          candidates: [
            {
              id: 'missing-project',
              repo: repoDir,
              projectPath: 'apps/web',
              route: '/',
              kind: 'bad-config',
              expected: 'bad',
              notes: 'missing project path fixture',
            },
          ],
        },
        null,
        2,
      ),
      'utf-8',
    );

    const outDir = join(testDir, 'preflight-out');
    const script = resolve(__dirname, '..', '..', '..', 'scripts', 'run-realworld-corpus.mjs');
    const result = spawnSync(
      'node',
      [script, '--config', configPath, '--out', outDir, '--cli', fakeCli],
      { encoding: 'utf-8' },
    );
    expect(result.status).toBe(1);

    const report = JSON.parse(
      readFileSync(join(outDir, 'reports', 'aggregate-summary.json'), 'utf-8'),
    ) as {
      summary: {
        batchStatus: string;
        functionalFailureCount: number;
        failureCategories: Record<string, number>;
        unexpectedFailures: number;
      };
      projects: Array<{ commands: Array<{ id: string; failureCategory: string }> }>;
    };

    expect(report.summary.unexpectedFailures).toBe(1);
    expect(report.summary.batchStatus).toBe('failed');
    expect(report.summary.functionalFailureCount).toBe(1);
    expect(report.summary.failureCategories.missing_project_scope).toBe(1);
    expect(report.projects[0]?.commands).toHaveLength(1);
    expect(report.projects[0]?.commands[0]).toMatchObject({
      id: 'project-path-preflight',
      failureCategory: 'missing_project_scope',
    });
  }, 30_000);
});
