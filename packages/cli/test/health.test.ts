import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createProjectHealthReport,
  formatProjectHealthMarkdown,
  shouldFailHealth,
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

function writeEssence(routes: Record<string, { section: string; page: string }> = {
  '/': { section: 'marketing', page: 'home' },
}): void {
  writeJson(join(testDir, 'decantr.essence.json'), {
    version: '3.1.0',
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
    mutations: [{ id: 'mutation-add-page', markdown: 'mutation.md', json: 'mutation.json', mutationType: 'add-page' }],
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
    writeFileSync(join(testDir, 'src', 'app', 'dashboard', 'page.tsx'), 'export default function Page() { return null; }\n');

    const report = await createProjectHealthReport(testDir);

    expect(report.findings.some((finding) => finding.rule === 'brownfield-route-drift')).toBe(true);
    expect(report.routes.issues.some((issue) => issue.includes('Observed routes'))).toBe(true);
  });

  it('surfaces missing pack manifest in the health report', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);

    expect(report.packs.manifestPresent).toBe(false);
    expect(report.findings.some((finding) => finding.id === 'pack-pack-manifest-missing')).toBe(true);
  });

  it('renders markdown and scoped remediation prompts', async () => {
    writeRegistryCache();
    writeEssence();

    const report = await createProjectHealthReport(testDir);
    const markdown = formatProjectHealthMarkdown(report);
    const finding = report.findings[0];

    expect(markdown).toContain('# Decantr Project Health');
    expect(markdown).toContain('## Findings');
    expect(finding.remediation.prompt).toContain('You are fixing one Decantr Project Health finding');
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
});
