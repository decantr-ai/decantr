import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');
const roots: string[] = [];

function write(root: string, path: string, contents: string): void {
  const absolutePath = join(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents, 'utf-8');
}

function createWorkspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'decantr-verify-diff-'));
  roots.push(root);
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'test@decantr.ai'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Decantr Test'], { cwd: root });
  write(root, 'pnpm-workspace.yaml', 'packages:\n  - apps/*\n');
  write(root, 'package.json', JSON.stringify({ private: true }));
  write(
    root,
    'apps/web/package.json',
    JSON.stringify({ name: 'web', dependencies: { react: '^19.0.0' } }),
  );
  write(
    root,
    'apps/web/src/components/ui/Button.tsx',
    'export function Button() { return <button type="button" />; }\n',
  );
  write(
    root,
    'apps/web/src/pages/Home.tsx',
    'export function Home() { return <main>Home</main>; }\n',
  );
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'initial'], { cwd: root });
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('verify diff workflow', () => {
  it('auto-selects an unadopted changed app and emits the verifier assurance report', () => {
    const root = createWorkspace();
    write(
      root,
      'apps/web/src/pages/Home.tsx',
      'export function Home() { return <button type="button">Save</button>; }\n',
    );

    let output = '';
    try {
      output = execFileSync('node', [cliPath, 'verify', '--json'], {
        cwd: root,
        encoding: 'utf-8',
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
      });
      throw new Error('Expected the default warn gate to return a non-zero exit code.');
    } catch (error) {
      output = (error as { stdout?: Buffer }).stdout?.toString() ?? '';
    }

    const report = JSON.parse(output) as {
      $schema: string;
      project: { selectedAppRoot: string; selection: { strategy: string } };
      findings: Array<{ occurrence: { code: string; file: string } }>;
    };
    expect(report.$schema).toBe('https://decantr.ai/schemas/change-assurance-report.v1.json');
    expect(report.project).toMatchObject({
      selectedAppRoot: 'apps/web',
      selection: { strategy: 'changed-files' },
    });
    expect(report.findings[0]?.occurrence).toMatchObject({
      code: 'COMP010',
      file: 'src/pages/Home.tsx',
    });
    expect(existsSync(join(root, 'apps', 'web', 'decantr.essence.json'))).toBe(false);
    expect(existsSync(join(root, 'apps', 'web', '.decantr'))).toBe(false);
  });

  it('retains explicit full Project Health behavior', () => {
    const root = createWorkspace();

    let output = '';
    try {
      output = execFileSync('node', [cliPath, 'verify', '--project', 'apps/web', '--full'], {
        cwd: root,
        encoding: 'utf-8',
        env: { ...process.env, DECANTR_OFFLINE: 'true' },
      });
    } catch (error) {
      output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
    }

    expect(output).toContain('Decantr Verify');
    expect(output).toContain('Project Health');
    expect(output).toContain('No decantr.essence.json file was found');
  });

  it('keeps JSON machine-readable while emitting GitHub annotations on stderr', () => {
    const root = createWorkspace();
    write(
      root,
      'apps/web/src/pages/Home.tsx',
      'export function Home() { return <button type="button">Save</button>; }\n',
    );

    const result = spawnSync('node', [cliPath, 'verify', '--json', '--ci', '--fail-on', 'none'], {
      cwd: root,
      encoding: 'utf-8',
      env: { ...process.env, DECANTR_OFFLINE: 'true', GITHUB_ACTIONS: 'true' },
    });

    expect(result.status).toBe(0);
    expect(() => JSON.parse(result.stdout)).not.toThrow();
    expect(result.stderr).toContain(
      '::warning file=src/pages/Home.tsx,line=1,title=Decantr COMP010::',
    );
  });
});
