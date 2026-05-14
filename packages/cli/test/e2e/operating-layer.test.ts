import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

function runCli(cwd: string, args: string[]): string {
  const cliPath = join(__dirname, '..', '..', 'dist', 'index.js');
  return execFileSync('node', [cliPath, ...args], {
    cwd,
    encoding: 'utf-8',
    timeout: 15_000,
    env: { ...process.env, DECANTR_OFFLINE: 'true' },
  });
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeEssence(root: string): void {
  writeJson(join(root, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
      typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
      color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'existing', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: false },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
      personality: ['observed brownfield app'],
    },
    blueprint: {
      sections: [
        {
          id: 'app',
          role: 'primary',
          shell: 'observed-existing-shell',
          features: [],
          description: 'Existing app',
          pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
        },
      ],
      features: [],
      routes: { '/': { section: 'app', page: 'home' } },
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'unknown' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  });
}

describe('operating layer commands', () => {
  let testDir = '';

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-operating-layer-'));
    mkdirSync(join(testDir, 'apps', 'web', '.decantr', 'context'), { recursive: true });
    mkdirSync(join(testDir, 'packages', 'ui'), { recursive: true });
    writeFileSync(join(testDir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n  - packages/*\n');
    writeJson(join(testDir, 'package.json'), {
      private: true,
      packageManager: 'pnpm@10.0.0',
      devDependencies: { '@decantr/cli': '2.9.0' },
    });
    writeJson(join(testDir, 'apps', 'web', 'package.json'), {
      name: 'web',
      dependencies: { react: '^19.0.0' },
    });
    writeEssence(join(testDir, 'apps', 'web'));
    writeJson(join(testDir, 'apps', 'web', '.decantr', 'project.json'), {
      sync: { status: 'not-required', registrySource: 'cache' },
      initialized: {
        version: '2.9.0',
        workflowMode: 'brownfield-attach',
        adoptionMode: 'contract-only',
        projectScope: 'workspace-app',
      },
    });
    writeFileSync(join(testDir, 'apps', 'web', 'DECANTR.md'), '# Decantr\n');
    writeFileSync(
      join(testDir, 'apps', 'web', '.decantr', 'context', 'scaffold.md'),
      '# Scaffold\n',
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('explains monorepo project state and design authority', () => {
    const output = runCli(testDir, ['doctor', '--project', 'apps/web']);

    expect(output).toContain('Decantr Doctor');
    expect(output).toContain('Workflow: brownfield-attach | adoption contract-only');
    expect(output).toContain('packages/ui');
    expect(output).toContain('Next:');
  });

  it('explains workspace state without requiring an essence at the root', () => {
    const output = runCli(testDir, ['doctor', '--workspace']);

    expect(output).toContain('Decantr Doctor');
    expect(output).toContain('Attached projects: 1');
    expect(output).not.toContain('No decantr.essence.json found');
    expect(output).toContain('decantr ci init --workspace');
  });

  it('orients monorepo roots toward app-scoped doctor instead of root setup', () => {
    const output = runCli(testDir, ['doctor']);

    expect(output).toContain('This is a monorepo root');
    expect(output).toContain('decantr doctor --project apps/web');
    expect(output).not.toContain('No decantr.essence.json found');
  });

  it('requires --project for ci from a monorepo root', () => {
    try {
      runCli(testDir, ['ci']);
      throw new Error('Expected ci to require --project.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Decantr CI needs an app path');
      expect(output).toContain('decantr ci --project apps/web');
    }
  });

  it('requires --project or --workspace when initializing CI from a monorepo root', () => {
    try {
      runCli(testDir, ['ci', 'init']);
      throw new Error('Expected ci init to require --project.');
    } catch (error) {
      const output = `${(error as { stdout?: Buffer }).stdout?.toString() ?? ''}\n${
        (error as { stderr?: Buffer }).stderr?.toString() ?? ''
      }`;
      expect(output).toContain('Decantr CI init needs an app path');
      expect(output).toContain('--project apps/web');
    }
  });

  it('generates root GitHub CI with the pinned package-manager command', () => {
    const output = runCli(testDir, ['ci', 'init', '--project', 'apps/web']);
    const workflow = readFileSync(join(testDir, '.github', 'workflows', 'decantr-ci.yml'), 'utf-8');

    expect(output).toContain('Created Decantr CI workflow');
    expect(workflow).toContain('pnpm exec decantr ci --project apps/web');
    expect(workflow).not.toContain('@decantr/cli@latest');
    expect(workflow).not.toContain('npx --yes');
  });

  it('still writes monorepo CI at the workspace root when invoked inside an app', () => {
    const appRoot = join(testDir, 'apps', 'web');

    runCli(appRoot, ['ci', 'init']);

    const workflowPath = join(testDir, '.github', 'workflows', 'decantr-ci.yml');
    const appWorkflowPath = join(appRoot, '.github', 'workflows', 'decantr-ci.yml');
    const workflow = readFileSync(workflowPath, 'utf-8');

    expect(existsSync(workflowPath)).toBe(true);
    expect(existsSync(appWorkflowPath)).toBe(false);
    expect(workflow).toContain('pnpm exec decantr ci --project apps/web');
  });

  it('writes a portable generic CI snippet', () => {
    runCli(testDir, ['ci', 'init', '--provider', 'generic', '--project', 'apps/web']);
    const snippetPath = join(testDir, '.decantr', 'ci', 'decantr-ci.sh');
    const snippet = readFileSync(snippetPath, 'utf-8');

    expect(existsSync(snippetPath)).toBe(true);
    expect(snippet).toContain('pnpm exec decantr ci --project apps/web');
  });

  it('checks refresh freshness without writing files', () => {
    const output = runCli(testDir, ['refresh', '--project', 'apps/web', '--check']);

    expect(output).toContain('Generated Decantr context looks fresh');
  });
});
