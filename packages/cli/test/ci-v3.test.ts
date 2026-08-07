import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cmdCi } from '../src/commands/ci.js';

function writeJson(path: string, value: unknown): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeProject(root: string, name: string): void {
  const projectRoot = join(root, 'apps', name);
  mkdirSync(join(projectRoot, 'src'), { recursive: true });
  writeJson(join(projectRoot, 'package.json'), {
    name: `@test/${name}`,
    dependencies: { react: '^19.0.0' },
  });
  writeJson(join(projectRoot, 'decantr.essence.json'), {
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
      personality: ['observed app'],
    },
    blueprint: {
      sections: [
        {
          id: 'app',
          role: 'primary',
          shell: 'observed-shell',
          features: [],
          description: 'Test app',
          pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
        },
      ],
      features: [],
      routes: { '/': { section: 'app', page: 'home' } },
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'history' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  });
  writeJson(join(projectRoot, '.decantr', 'project.json'), {
    initialized: {
      version: '3.9.0',
      workflowMode: 'brownfield-attach',
      adoptionMode: 'contract-only',
      projectScope: 'workspace-app',
    },
  });
  writeFileSync(join(projectRoot, 'DECANTR.md'), '# Decantr\n', 'utf-8');
  writeFileSync(
    join(projectRoot, 'src', 'App.tsx'),
    'export function App() { return <main>Test</main>; }\n',
    'utf-8',
  );
}

async function captureStdout(
  args: string[],
  root: string,
): Promise<{ output: string; exitCode: number }> {
  let output = '';
  process.exitCode = undefined;
  const write = vi.spyOn(process.stdout, 'write').mockImplementation(((chunk: unknown) => {
    output += String(chunk);
    return true;
  }) as typeof process.stdout.write);
  try {
    await cmdCi(args, root);
    return { output, exitCode: Number(process.exitCode ?? 0) };
  } finally {
    write.mockRestore();
    process.exitCode = undefined;
  }
}

describe('Decantr CI v3 opt-in', () => {
  let root = '';
  let baseSha = '';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T16:00:00.000Z'));
    root = mkdtempSync(join(tmpdir(), 'decantr-ci-v3-'));
    writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n', 'utf-8');
    writeJson(join(root, 'package.json'), {
      private: true,
      packageManager: 'pnpm@10.0.0',
      devDependencies: { '@decantr/cli': '3.9.0' },
    });
    writeProject(root, 'alpha');
    writeProject(root, 'zeta');
    execFileSync('git', ['init', '-q'], { cwd: root });
    execFileSync('git', ['config', 'user.email', 'ci@example.com'], { cwd: root });
    execFileSync('git', ['config', 'user.name', 'CI Test'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['commit', '-qm', 'base'], { cwd: root });
    baseSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf-8' }).trim();
    writeFileSync(
      join(root, 'apps', 'alpha', 'src', 'App.tsx'),
      'export function App() { return <main>Changed</main>; }\n',
      'utf-8',
    );
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['commit', '-qm', 'change alpha'], { cwd: root });
  });

  afterEach(() => {
    vi.useRealTimers();
    process.exitCode = undefined;
    rmSync(root, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('keeps default output byte-identical to explicit v2 and rejects unsupported versions', async () => {
    const defaultReport = await captureStdout(['ci', '--project', 'apps/alpha', '--json'], root);
    const explicitV2 = await captureStdout(
      ['ci', '--project', 'apps/alpha', '--json', '--report-version', 'v2'],
      root,
    );
    expect(explicitV2.output).toBe(defaultReport.output);
    expect(JSON.parse(defaultReport.output).$schema).toBe(
      'https://decantr.ai/schemas/decantr-ci-report.v2.json',
    );

    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await cmdCi(['ci', '--report-version', 'v4'], root);
    expect(process.exitCode).toBe(1);
    expect(error.mock.calls.flat().join(' ')).toContain('Use v2 or v3');
  });

  it('emits project v3 proof and honors --since as the Git base', async () => {
    const result = await captureStdout(
      ['ci', '--project', 'apps/alpha', '--report-version', 'v3', '--since', baseSha, '--json'],
      root,
    );
    const report = JSON.parse(result.output);

    expect(report.$schema).toBe('https://decantr.ai/schemas/decantr-ci-report.v3.json');
    expect(report.adoptionTruth.project.selectedAppRoot).toBe('apps/alpha');
    expect(report.governanceDelta.changeBase.baseRef).toBe(baseSha);
    expect(report.governanceDelta.changeBase.changedFiles).toContain('src/App.tsx');
    expect(report.changeAssurance).toMatchObject({
      $schema: 'https://decantr.ai/schemas/change-assurance-report.v1.json',
      surfaces: { uiFiles: ['src/App.tsx'] },
    });
    expect(report.changeAssurance.changeBase.changedFiles).toEqual(
      report.governanceDelta.changeBase.changedFiles,
    );
    expect(report.governanceDelta.gate.result).toBe('not_proven');
    expect(report.governanceDelta.findings.new).toEqual([]);
    expect(result.exitCode).toBe(1);
  });

  it('marks Angular governance proof incomplete when production route authority is unresolved', async () => {
    const projectRoot = join(root, 'apps', 'alpha');
    writeJson(join(projectRoot, 'package.json'), {
      name: '@test/alpha',
      dependencies: {
        '@angular/core': '^21.0.0',
        '@angular/router': '^21.0.0',
      },
    });
    writeJson(join(projectRoot, 'angular.json'), {
      version: 1,
      projects: {
        alpha: {
          root: '',
          sourceRoot: 'src',
          architect: { build: { options: { browser: 'src/main.ts' } } },
        },
      },
    });
    writeFileSync(
      join(projectRoot, 'src', 'main.ts'),
      "import { bootstrapApplication } from '@angular/platform-browser';\nbootstrapApplication(class App {});\n",
      'utf-8',
    );
    writeFileSync(
      join(projectRoot, 'src', 'routes.ts'),
      "import type { Routes } from '@angular/router';\nexport const routes: Routes = [{ path: '', component: Page }];\n",
      'utf-8',
    );

    const result = await captureStdout(
      ['ci', '--project', 'apps/alpha', '--report-version', 'v3', '--json'],
      root,
    );
    const report = JSON.parse(result.output);

    expect(report.governanceDelta.gate.result).toBe('not_proven');
    expect(report.governanceDelta.current.graph.completeness).toBe('incomplete');
    expect(report.governanceDelta.current.graph.limitations.join('\n')).toContain(
      'Discovery sufficiency:',
    );
    expect(report.governanceDelta.limitations.join('\n')).toContain(
      'Discovery sufficiency: Route authority is inferred, not proven.',
    );
    expect(result.exitCode).toBe(1);
  });

  it('keeps current governance identity stable across report timestamps', async () => {
    const first = JSON.parse(
      (
        await captureStdout(
          ['ci', '--project', 'apps/alpha', '--report-version', 'v3', '--json'],
          root,
        )
      ).output,
    );
    vi.setSystemTime(new Date('2026-07-16T16:05:00.000Z'));
    const second = JSON.parse(
      (
        await captureStdout(
          ['ci', '--project', 'apps/alpha', '--report-version', 'v3', '--json'],
          root,
        )
      ).output,
    );

    expect(second.generatedAt).not.toBe(first.generatedAt);
    expect(second.governanceDelta.current.health).toEqual(first.governanceDelta.current.health);
    expect(second.governanceDelta.current.evidence).toEqual(first.governanceDelta.current.evidence);
  });

  it('recognizes legacy v1 debt but rejects identity-less and cross-project v2 baselines', async () => {
    const baselinePath = join(root, 'apps', 'alpha', '.decantr', 'health-baseline.json');
    const commonBaseline = {
      generatedAt: '2026-07-15T12:00:00.000Z',
      status: 'warning',
      score: 90,
      findings: [],
      routes: ['/'],
      packs: { generatedAt: '2026-07-15T12:00:00.000Z' },
      screenshots: [],
      changedFilesCommand: 'git diff --name-only + --cached',
    };
    writeJson(baselinePath, { version: 1, ...commonBaseline });

    const legacy = JSON.parse(
      (
        await captureStdout(
          ['ci', '--project', 'apps/alpha', '--report-version', 'v3', '--json'],
          root,
        )
      ).output,
    );
    expect(legacy.governanceDelta.debtBaseline).toMatchObject({
      compatibility: 'unknown',
      completeness: 'incomplete',
    });
    expect(legacy.governanceDelta.debtBaseline.identity).toMatch(/^health-baseline:v1:/);
    expect(legacy.governanceDelta.limitations.join(' ')).toContain(
      'Legacy health baseline v1 is recognized for 3.8 compatibility',
    );

    writeJson(baselinePath, { version: 2, ...commonBaseline });
    const missingIdentity = JSON.parse(
      (
        await captureStdout(
          ['ci', '--project', 'apps/alpha', '--report-version', 'v3', '--json'],
          root,
        )
      ).output,
    );
    expect(missingIdentity.governanceDelta.debtBaseline).toMatchObject({
      projectIdentity: null,
      compatibility: 'incompatible',
      completeness: 'incomplete',
    });

    writeJson(baselinePath, {
      version: 2,
      projectIdentity: `project:v1:sha256:${'0'.repeat(64)}`,
      ...commonBaseline,
    });
    const crossProject = JSON.parse(
      (
        await captureStdout(
          ['ci', '--project', 'apps/alpha', '--report-version', 'v3', '--json'],
          root,
        )
      ).output,
    );
    expect(crossProject.governanceDelta.debtBaseline).toMatchObject({
      projectIdentity: `project:v1:sha256:${'0'.repeat(64)}`,
      compatibility: 'incompatible',
      completeness: 'incomplete',
    });
  });

  it('emits sorted per-project contracts and a deterministic workspace gate', async () => {
    const result = await captureStdout(
      ['ci', '--workspace', '--report-version', 'v3', '--since', baseSha, '--json'],
      root,
    );
    const report = JSON.parse(result.output);

    expect(report.projects.map((project: { projectPath: string }) => project.projectPath)).toEqual([
      'apps/alpha',
      'apps/zeta',
    ]);
    expect(
      report.projects.every(
        (project: Record<string, unknown>) => project.adoptionTruth && project.governanceDelta,
      ),
    ).toBe(true);
    expect(report.gate).toMatchObject({
      result: 'not_proven',
      status: 'incomplete',
      projectCount: 2,
      notProvenProjectCount: 2,
    });
    expect(result.exitCode).toBe(1);
  });

  it('generates explicit v3 GitHub and generic workflows without changing the v2 default', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await cmdCi(['ci', 'init', '--project', 'apps/alpha', '--force'], root);
    const v2Workflow = readFileSync(join(root, '.github', 'workflows', 'decantr-ci.yml'), 'utf-8');
    expect(v2Workflow).not.toContain('fetch-depth: 0');
    expect(v2Workflow).not.toContain('--report-version');

    await cmdCi(
      ['ci', 'init', '--project', 'apps/alpha', '--report-version', 'v3', '--force'],
      root,
    );
    const v3Workflow = readFileSync(join(root, '.github', 'workflows', 'decantr-ci.yml'), 'utf-8');
    expect(v3Workflow).toContain('fetch-depth: 0');
    expect(v3Workflow).toContain('Resolve Decantr change base');
    // biome-ignore lint/suspicious/noTemplateCurlyInString: this is a literal GitHub Actions expression.
    expect(v3Workflow).toContain('--since "${{ steps.decantr-base.outputs.ref }}"');
    expect(v3Workflow).toContain('--report-version v3');

    await cmdCi(
      [
        'ci',
        'init',
        '--project',
        'apps/alpha',
        '--provider',
        'generic',
        '--report-version',
        'v3',
        '--force',
      ],
      root,
    );
    const generic = readFileSync(join(root, '.decantr', 'ci', 'decantr-ci.sh'), 'utf-8');
    expect(generic).toContain('--report-version v3');
    expect(log).toHaveBeenCalled();
  });
});
