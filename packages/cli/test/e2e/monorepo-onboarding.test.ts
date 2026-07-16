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
    expect(payload.candidates).toMatchObject([
      {
        path: 'apps/web',
        attached: false,
        suggestedAdoptCommand: 'decantr adopt --project apps/web --yes',
        rank: 1,
        category: 'product-ui',
      },
    ]);
  });

  it('ranks product UI apps above docs, Storybook, and helper packages', () => {
    mkdirSync(join(testDir, 'apps', 'docs', 'src'), { recursive: true });
    mkdirSync(join(testDir, 'apps', 'storybook', 'src'), { recursive: true });
    mkdirSync(join(testDir, 'apps', 'remix', 'app'), { recursive: true });
    mkdirSync(join(testDir, 'packages', 'workbench', 'src'), { recursive: true });
    mkdirSync(join(testDir, 'packages', 'mcp-apps', 'src'), { recursive: true });
    writeFileSync(
      join(testDir, 'apps', 'docs', 'package.json'),
      JSON.stringify({ name: 'docs', dependencies: { next: '^16.0.0', react: '^19.0.0' } }),
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'apps', 'storybook', 'package.json'),
      JSON.stringify({ name: 'storybook', dependencies: { react: '^19.0.0' } }),
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'apps', 'remix', 'package.json'),
      JSON.stringify({ name: 'remix', dependencies: { '@remix-run/react': '^3.0.0' } }),
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'packages', 'workbench', 'package.json'),
      JSON.stringify({ name: 'workbench', dependencies: { react: '^19.0.0' } }),
      'utf-8',
    );
    writeFileSync(
      join(testDir, 'packages', 'mcp-apps', 'package.json'),
      JSON.stringify({ name: 'mcp-apps', dependencies: { react: '^19.0.0' } }),
      'utf-8',
    );

    const payload = JSON.parse(runCli(testDir, ['workspace', 'list', '--json'])) as {
      candidates: Array<{ path: string; rank: number; category: string; score: number }>;
    };

    expect(payload.candidates.map((candidate) => candidate.path).slice(0, 2)).toEqual([
      'apps/remix',
      'apps/web',
    ]);
    expect(
      payload.candidates.find((candidate) => candidate.path === 'apps/docs')?.rank,
    ).toBeGreaterThan(2);
    expect(
      payload.candidates.find((candidate) => candidate.path === 'apps/storybook')?.rank,
    ).toBeGreaterThan(2);
    expect(payload.candidates.some((candidate) => candidate.path.startsWith('packages/'))).toBe(
      false,
    );
  });

  it('keeps cold adoption local in offline mode and writes app-scoped artifacts', () => {
    writeFileSync(
      join(testDir, 'apps', 'web', 'src', 'page.tsx'),
      'export default function Page() { return <main />; }\n',
    );

    const output = runCli(testDir, ['adopt', '--project', 'apps/web', '--yes']);

    expect(output).toContain('Skipping official content-pack hydration in offline mode.');
    expect(output).toContain('decantr init --project apps/web --existing --accept-proposal');
    expect(output).toContain('Generated Decantr typed graph artifacts:');
    expect(output).toContain('Brownfield operating loop');
    expect(output).toContain('decantr codify --from-audit --style-bridge --project apps/web');
    expect(output).not.toContain('decantr check --brownfield --project apps/web');
    expect(existsSync(join(testDir, 'apps', 'web', 'decantr.essence.json'))).toBe(true);
    expect(existsSync(join(testDir, 'apps', 'web', '.decantr', 'project.json'))).toBe(true);
    expect(
      existsSync(join(testDir, 'apps', 'web', '.decantr', 'graph', 'graph.snapshot.json')),
    ).toBe(true);
    expect(
      existsSync(join(testDir, 'apps', 'web', '.decantr', 'graph', 'contract-capsule.json')),
    ).toBe(true);
    expect(existsSync(join(testDir, 'decantr.essence.json'))).toBe(false);
  });
});
