import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createProjectHealthReport,
  formatProjectHealthMarkdown,
  parseHealthArgs,
  renderProjectHealthCiWorkflow,
  shouldFailHealth,
  writeProjectHealthCiWorkflow,
} from '../src/commands/health.js';

let testDir = '';

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeRegistryCache(): void {
  mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'patterns'), { recursive: true });
  mkdirSync(join(testDir, '.decantr', 'cache', '@official', 'themes'), { recursive: true });
  writeJson(join(testDir, '.decantr', 'cache', '@official', 'patterns', 'hero.json'), {
    id: 'hero',
    name: 'Hero',
    version: '1.0.0',
  });
  writeJson(join(testDir, '.decantr', 'cache', '@official', 'themes', 'luminarum.json'), {
    id: 'luminarum',
    modes: ['dark', 'light'],
    version: '1.0.0',
  });
}

function writeEssence(
  routes: Record<string, { section: string; page: string }> = {
    '/': { section: 'marketing', page: 'home' },
  },
): void {
  writeJson(join(testDir, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
      spacing: {
        base_unit: 4,
        scale: 'linear',
        density: 'comfortable',
        content_gap: '_gap4',
      },
      typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
      color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'layered', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: false },
      accessibility: { wcag_level: 'AA', focus_visible: false, skip_nav: false },
      personality: ['clean'],
    },
    blueprint: {
      sections: [
        {
          id: 'marketing',
          role: 'public',
          shell: 'top-nav-footer',
          features: [],
          description: 'Marketing surface',
          pages: [{ id: 'home', route: '/', layout: ['hero'] }],
        },
      ],
      features: [],
      routes,
    },
    meta: {
      archetype: 'marketing',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  });
}

function writePacks(): void {
  mkdirSync(join(testDir, '.decantr', 'context'), { recursive: true });
  writeJson(join(testDir, '.decantr', 'context', 'pack-manifest.json'), {
    $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
    version: '1.0.0',
    generatedAt: '2026-05-08T14:00:00.000Z',
    scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
    review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
    sections: [],
    pages: [
      {
        id: 'page-home',
        markdown: 'page-home-pack.md',
        json: 'page-home-pack.json',
        sectionId: 'marketing',
        sectionRole: 'public',
      },
    ],
    mutations: [
      {
        id: 'mutation-add-page',
        markdown: 'mutation.md',
        json: 'mutation.json',
        mutationType: 'add-page',
      },
    ],
  });
  writeJson(join(testDir, '.decantr', 'context', 'review-pack.json'), {
    $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
    packVersion: '1.0.0',
    packType: 'review',
    objective: 'Review generated output against the compiled Decantr contract.',
    target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
    preset: null,
    scope: { appId: 'app', pageIds: ['home'], patternIds: ['hero'] },
    requiredSetup: [],
    allowedVocabulary: [],
    examples: [],
    antiPatterns: [],
    successChecks: [],
    tokenBudget: { target: 1400, max: 2200, strategy: [] },
    data: {
      reviewType: 'app',
      shell: 'top-nav-footer',
      theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
      routing: 'hash',
      features: [],
      routes: [{ pageId: 'home', path: '/', patternIds: ['hero'] }],
      focusAreas: ['route-topology', 'accessibility'],
      workflow: [],
    },
    renderedMarkdown: '# Review Pack\n',
  });
}

describe('Project Health report', () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-health-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('produces a healthy report for a greenfield project with current packs', async () => {
    writeRegistryCache();
    writeEssence();
    writePacks();

    const report = await createProjectHealthReport(testDir);

    expect(report.$schema).toBe('https://decantr.ai/schemas/project-health-report.v1.json');
    expect(report.status).toBe('healthy');
    expect(report.score).toBeGreaterThanOrEqual(99);
    expect(report.routes.declared).toContain('/');
    expect(report.packs.manifestPresent).toBe(true);
  });

  it('reports missing or invalid essence as a CI-blocking error', async () => {
    writeFileSync(join(testDir, 'decantr.essence.json'), '{ invalid json', 'utf-8');

    const report = await createProjectHealthReport(testDir);

    expect(report.status).toBe('error');
    expect(report.summary.errorCount).toBeGreaterThan(0);
    expect(shouldFailHealth(report, 'error')).toBe(true);
  });

  it('surfaces brownfield route drift when the project is attached as brownfield', async () => {
    mkdirSync(join(testDir, '.decantr'), { recursive: true });
    mkdirSync(join(testDir, 'src', 'app', 'dashboard'), { recursive: true });
    writeRegistryCache();
    writeEssence();
    writePacks();
    writeJson(join(testDir, '.decantr', 'project.json'), {
      initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
    });
    writeJson(join(testDir, 'package.json'), {
      dependencies: { next: '^16.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
    });
    writeFileSync(
      join(testDir, 'src', 'app', 'dashboard', 'page.tsx'),
      'export default function Page() { return null; }\n',
    );

    const report = await createProjectHealthReport(testDir);

    expect(report.findings.some((finding) => finding.rule === 'brownfield-route-drift')).toBe(true);
    expect(report.routes.issues.some((issue) => issue.includes('Observed routes'))).toBe(true);
  });

  it('surfaces missing pack manifest in the health report', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);

    expect(report.packs.manifestPresent).toBe(false);
    expect(report.findings.some((finding) => finding.id === 'pack-pack-manifest-missing')).toBe(
      true,
    );
  });

  it('renders markdown and scoped remediation prompts', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);
    const markdown = formatProjectHealthMarkdown(report);
    const finding = report.findings[0];

    expect(markdown).toContain('# Decantr Project Health');
    expect(markdown).toContain('## Findings');
    expect(finding.remediation.prompt).toContain(
      'You are fixing one Decantr Project Health finding',
    );
    expect(finding.remediation.prompt).toContain(`Finding: ${finding.id}`);
  });

  it('supports warning-sensitive CI gating', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);

    expect(report.summary.errorCount).toBe(0);
    expect(report.summary.warnCount).toBeGreaterThan(0);
    expect(shouldFailHealth(report, 'error')).toBe(false);
    expect(shouldFailHealth(report, 'warn')).toBe(true);
  });

  it('renders a GitHub Actions Project Health workflow', () => {
    const workflow = renderProjectHealthCiWorkflow({
      failOn: 'warn',
      cliVersion: '2.0.0',
      reportPath: 'reports/decantr-health.md',
      jsonPath: 'reports/decantr-health.json',
    });

    expect(workflow).toContain('name: Decantr Project Health');
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 health --json --output reports/decantr-health.json',
    );
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 health --ci --fail-on warn --markdown --output reports/decantr-health.md',
    );
    expect(workflow).toContain('actions/upload-artifact@v6');
  });

  it('renders a monorepo-aware Project Health workflow', () => {
    const workflow = renderProjectHealthCiWorkflow({
      cliVersion: '2.0.0',
      projectPath: 'apps/registry',
      reportPath: 'reports/decantr-health.md',
      jsonPath: 'reports/decantr-health.json',
    });

    expect(workflow).toContain('working-directory: apps/registry');
    expect(workflow).toContain(
      'npx --yes @decantr/cli@2.0.0 health --json --output reports/decantr-health.json',
    );
    expect(workflow).toContain('apps/registry/reports/decantr-health.json');
    expect(workflow).toContain('apps/registry/reports/decantr-health.md');
  });

  it('writes the Project Health CI workflow without clobbering by default', () => {
    const result = writeProjectHealthCiWorkflow(testDir, { cliVersion: 'latest' });
    const workflowPath = join(testDir, '.github', 'workflows', 'decantr-health.yml');

    expect(result.created).toBe(true);
    expect(result.path).toBe('.github/workflows/decantr-health.yml');
    expect(existsSync(workflowPath)).toBe(true);
    expect(readFileSync(workflowPath, 'utf-8')).toContain('@decantr/cli@latest');
    expect(() => writeProjectHealthCiWorkflow(testDir)).toThrow(/already exists/);

    const updated = writeProjectHealthCiWorkflow(testDir, { force: true, failOn: 'warn' });
    expect(updated.created).toBe(false);
    expect(readFileSync(workflowPath, 'utf-8')).toContain('--fail-on warn');
  });

  it('parses health init-ci options', () => {
    const parsed = parseHealthArgs([
      'health',
      'init-ci',
      '--force',
      '--fail-on=warn',
      '--cli-version',
      '2.0.0',
      '--workflow-path',
      '.github/workflows/custom-health.yml',
      '--report-path=reports/health.md',
      '--json-path=reports/health.json',
      '--project',
      'apps/registry',
    ]);

    expect(parsed.initCi).toEqual({
      force: true,
      failOn: 'warn',
      cliVersion: '2.0.0',
      workflowPath: '.github/workflows/custom-health.yml',
      reportPath: 'reports/health.md',
      jsonPath: 'reports/health.json',
      projectPath: 'apps/registry',
    });
  });

  it('rejects unsafe Project Health CI template inputs', () => {
    expect(() => renderProjectHealthCiWorkflow({ cliVersion: 'latest && echo bad' })).toThrow(
      /Invalid --cli-version/,
    );
    expect(() => renderProjectHealthCiWorkflow({ reportPath: 'reports/health report.md' })).toThrow(
      /Invalid --report-path/,
    );
    expect(() => writeProjectHealthCiWorkflow(testDir, { workflowPath: '../ci.yml' })).toThrow(
      /Invalid --workflow-path/,
    );
    expect(() => renderProjectHealthCiWorkflow({ projectPath: '../apps/registry' })).toThrow(
      /Invalid --project/,
    );
    expect(() => renderProjectHealthCiWorkflow({ failOn: 'always' as unknown as 'error' })).toThrow(
      /Invalid --fail-on/,
    );
  });
});
