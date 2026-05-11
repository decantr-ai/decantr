import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  parseStudioArgs,
  type StudioServerHandle,
  startStudioServer,
} from '../src/commands/studio.js';

let testDir = '';
let handle: StudioServerHandle | null = null;

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeMinimalProject(): void {
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
  writeJson(join(testDir, 'decantr.essence.json'), {
    version: '4.0.0',
    dna: {
      theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
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
      routes: { '/': { section: 'marketing', page: 'home' } },
    },
    meta: {
      archetype: 'marketing',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  });
}

function projectHealthReport(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    $schema: 'https://decantr.ai/schemas/project-health-report.v1.json',
    generatedAt: '2026-05-11T00:00:00.000Z',
    projectRoot: testDir,
    status: 'error',
    score: 72,
    summary: {
      errorCount: 1,
      warnCount: 1,
      infoCount: 0,
      findingCount: 2,
      workflowMode: 'greenfield-scaffold',
      adoptionMode: 'decantr-css',
      essenceVersion: '4.0.0',
      pageCount: 3,
      runtimeAuditChecked: true,
      runtimePassed: false,
      packManifestPresent: true,
      reviewPackPresent: true,
    },
    routes: {
      declared: ['/', '/dashboard'],
      runtimeChecked: ['/'],
      runtimeMatched: 1,
      runtimeCoverageOk: false,
      issues: ['Dashboard route missing from built output.'],
    },
    packs: {
      manifestPresent: true,
      reviewPackPresent: true,
      scaffoldPackPresent: true,
      sectionPackCount: 1,
      pagePackCount: 3,
      mutationPackCount: 0,
      generatedAt: '2026-05-11T00:00:00.000Z',
    },
    ci: {
      recommendedCommand: 'decantr health --ci --fail-on error',
      failOn: 'error',
    },
    findings: [
      {
        id: 'check-interactions',
        source: 'interaction',
        category: 'Contract Check',
        severity: 'error',
        message: 'Declared interaction is missing.',
        evidence: ['Rule: interactions'],
        rule: 'interactions',
        suggestedFix: 'Implement declared interaction handlers.',
        remediation: {
          summary: 'Implement declared interaction handlers.',
          commands: ['decantr check --strict', 'decantr health'],
          prompt: 'Fix the declared interaction.',
        },
      },
      {
        id: 'runtime-route-hints',
        source: 'runtime',
        category: 'Runtime Verification',
        severity: 'warn',
        message: 'Route hints are incomplete.',
        evidence: ['Matched 1/2 route hints.'],
        suggestedFix: 'Rebuild and confirm route generation.',
        remediation: {
          summary: 'Rebuild and confirm route generation.',
          commands: ['npm run build', 'decantr health'],
          prompt: 'Fix route hints.',
        },
      },
    ],
    ...overrides,
  };
}

describe('Decantr Studio server', () => {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'decantr-studio-'));
    writeMinimalProject();
  });

  afterEach(async () => {
    if (handle) {
      await new Promise<void>((resolve) => handle?.server.close(() => resolve()));
      handle = null;
    }
    rmSync(testDir, { recursive: true, force: true });
  });

  it('serves the dashboard and health endpoints without external dependencies', async () => {
    handle = await startStudioServer(testDir, { port: 0 });

    const html = await fetch(handle.url).then((response) => response.text());
    const health = await fetch(`${handle.url}/api/health`).then((response) => response.json());
    const refreshed = await fetch(`${handle.url}/api/refresh`, { method: 'POST' }).then(
      (response) => response.json(),
    );

    expect(html).toContain('Decantr Project Health');
    expect(html).toContain('Recommended path');
    expect(html).toContain('AI Prompt');
    expect(html).toContain('Manual Fix');
    expect(html).toContain('Finding details');
    expect(html).toContain('Verification');
    expect(html).toContain('Copy AI prompt');
    expect(html).toContain('does not edit files');
    expect(html).toContain('Project details');
    expect(html).toContain('function esc');
    expect(health.$schema).toBe('https://decantr.ai/schemas/project-health-report.v1.json');
    expect(refreshed.$schema).toBe('https://decantr.ai/schemas/project-health-report.v1.json');
  });

  it('serves a read-only Project Health JSON artifact in report mode', async () => {
    writeJson(join(testDir, 'decantr-health.json'), projectHealthReport());
    handle = await startStudioServer(testDir, { port: 0, report: 'decantr-health.json' });

    const html = await fetch(handle.url).then((response) => response.text());
    const health = await fetch(`${handle.url}/api/health`).then((response) => response.json());

    expect(html).toContain('Report mode');
    expect(health.score).toBe(72);
    expect(health.findings).toHaveLength(2);
  });

  it('re-reads the report artifact on refresh', async () => {
    const reportPath = join(testDir, 'decantr-health.json');
    writeJson(reportPath, projectHealthReport({ score: 72 }));
    handle = await startStudioServer(testDir, { port: 0, report: reportPath });

    const first = await fetch(`${handle.url}/api/health`).then((response) => response.json());
    writeJson(reportPath, projectHealthReport({ score: 91, status: 'warning' }));
    const refreshed = await fetch(`${handle.url}/api/refresh`, { method: 'POST' }).then(
      (response) => response.json(),
    );

    expect(first.score).toBe(72);
    expect(refreshed.score).toBe(91);
    expect(refreshed.status).toBe('warning');
  });

  it('returns a friendly error for invalid report JSON', async () => {
    writeFileSync(join(testDir, 'decantr-health.json'), 'not-json', 'utf-8');
    handle = await startStudioServer(testDir, { port: 0, report: 'decantr-health.json' });

    const response = await fetch(`${handle.url}/api/health`);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('health_report_failed');
    expect(body.message).toContain('Unexpected token');
  });

  it('parses report mode arguments', () => {
    expect(parseStudioArgs(['studio', '--report', 'decantr-health.json'])).toMatchObject({
      report: 'decantr-health.json',
    });
    expect(parseStudioArgs(['studio', '--report=decantr-health.json'])).toMatchObject({
      report: 'decantr-health.json',
    });
    expect(() => parseStudioArgs(['studio', '--report'])).toThrow(/Missing --report value/);
  });
});
