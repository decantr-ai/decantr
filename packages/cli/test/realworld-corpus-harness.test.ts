import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

  it('emits v2 timing, scope, and failure-taxonomy summaries', () => {
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
  console.log(JSON.stringify({ routes: [{ path: '/', file: 'src/App.tsx' }], project: { framework: 'react' } }));
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
if ((command === 'verify' || command === 'ci') && has('--json')) {
  console.log(JSON.stringify({ status: 'healthy', score: 100, loop: { state: 'verified' }, graph: { ready: true }, findings: [] }));
  process.exit(0);
}
if (command === 'task' && has('--json')) {
  console.log(JSON.stringify({ route: '/', read: ['src/App.tsx'] }));
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
        rootSmokeCommandCount: number;
        appScopedCommandCount: number;
        failureCategories: Record<string, number>;
        slowCommandCount: number;
      };
      timings: { byCommand: Array<{ id: string; p95Ms: number }>; slowCommands: unknown[] };
      projects: Array<{ commands: Array<{ id: string; scope: string; budgetMs: number }> }>;
    };

    expect(report.schemaVersion).toBe(2);
    expect(report.summary.rootSmokeCommandCount).toBeGreaterThan(0);
    expect(report.summary.appScopedCommandCount).toBeGreaterThan(0);
    expect(report.summary.failureCategories).toHaveProperty('missing_project_scope');
    expect(report.summary.failureCategories).toHaveProperty('route_context_failure');
    expect(report.summary.slowCommandCount).toBeGreaterThan(0);
    expect(report.timings.byCommand.some((entry) => entry.id === 'scan-json')).toBe(true);
    expect(report.timings.slowCommands.length).toBeGreaterThan(0);
    expect(report.projects[0]?.commands.some((command) => command.scope === 'root-smoke')).toBe(
      true,
    );
    expect(report.projects[0]?.commands.some((command) => command.scope === 'app-scoped')).toBe(
      true,
    );
  }, 30_000);

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
  console.log(JSON.stringify({ routes: [{ path: '/docs/changelog', file: 'src/App.tsx' }] }));
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
if ((command === 'verify' || command === 'ci') && has('--json')) {
  console.log(JSON.stringify({ status: 'healthy', score: 100, loop: { state: 'verified' }, graph: { ready: true }, findings: [] }));
  process.exit(0);
}
if (command === 'task' && has('--json')) {
  console.log(JSON.stringify({ route: '/docs/changelog', read: ['src/App.tsx'] }));
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
    };

    expect(report.summary.projectCount).toBe(2);
    expect(report.summary.unexpectedFailures).toBe(0);
    expect(report.projects.find((project) => project.id === 'fixture-a')?.selectedRoute).toBe(
      '/docs/changelog',
    );
    expect(
      report.projects.find((project) => project.id === 'fixture-a')?.routeFallback?.selected,
    ).toBe('/docs/changelog');
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
    execFileSync('node', [script, '--config', configPath, '--out', outDir, '--cli', fakeCli]);

    const report = JSON.parse(
      readFileSync(join(outDir, 'reports', 'aggregate-summary.json'), 'utf-8'),
    ) as {
      summary: { failureCategories: Record<string, number>; unexpectedFailures: number };
      projects: Array<{ commands: Array<{ id: string; failureCategory: string }> }>;
    };

    expect(report.summary.unexpectedFailures).toBe(1);
    expect(report.summary.failureCategories.missing_project_scope).toBe(1);
    expect(report.projects[0]?.commands).toHaveLength(1);
    expect(report.projects[0]?.commands[0]).toMatchObject({
      id: 'project-path-preflight',
      failureCategory: 'missing_project_scope',
    });
  }, 30_000);
});
