import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function runCli(cwd: string, args: string[]): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');
  return execFileSync('node', [cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 10_000,
    env: { ...process.env, DECANTR_OFFLINE: 'true' },
  });
}

describe('brownfield monorepo onboarding', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-monorepo-onboarding-'));
    mkdirSync(join(testDir, 'apps', 'web', 'src'), { recursive: true });
    writeFileSync(join(testDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n', 'utf-8');
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({ private: true, devDependencies: { '@decantr/cli': '^2.8.0' } }, null, 2),
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'apps', 'web', 'package.json'),
      JSON.stringify({ name: 'web', dependencies: { react: '^19.0.0' } }, null, 2),
      'utf-8',
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('guides setup from the workspace root without writing files', () => {
    const output = runCli(testDir, ['setup']);

    expect(output).toContain('This looks like a monorepo.');
    expect(output).toContain('decantr workspace list');
    expect(output).toContain('decantr adopt --project apps/web --yes');
    expect(output).toContain('Optional visual evidence');
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
    expect(existsSync(join(testDir, '.decantr'))).toBe(false);
  });

  it('requires an app path for brownfield adoption from the workspace root', () => {
    try {
      runCli(testDir, ['adopt', '--yes']);
      throw new Error('Expected adopt to require --project.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Brownfield adoption needs an app path.');
      expect(output).toContain('decantr adopt --project apps/web --yes');
      expect(output).toContain(
        'decantr verify --project apps/web --base-url http://localhost:3000 --evidence',
      );
    }
  });

  it('lists unattached app candidates before Decantr projects exist', () => {
    const output = runCli(testDir, ['workspace', 'list', '--json']);
    const payload = JSON.parse(output) as {
      projects: unknown[];
      candidates: Array<{ path: string; attached: boolean; suggestedAdoptCommand: string }>;
    };

    expect(payload.projects).toEqual([]);
    expect(payload.candidates).toEqual([
      {
        path: 'apps/web',
        attached: false,
        suggestedAdoptCommand: 'decantr adopt --project apps/web --yes',
      },
    ]);
  });

  it('keeps cold adoption local in offline mode and writes app-scoped artifacts', () => {
    writeFileSync(join(testDir, 'apps', 'web', 'src', 'page.tsx'), 'export default function Page() { return <main />; }\n');

    const output = runCli(testDir, ['adopt', '--project', 'apps/web', '--yes']);

    expect(output).toContain('Skipping hosted pack hydration in offline mode.');
    expect(existsSync(join(testDir, 'apps', 'web', 'decantr.essence.json'))).toBe(true);
    expect(existsSync(join(testDir, 'apps', 'web', '.decantr', 'project.json'))).toBe(true);
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
  });
});
