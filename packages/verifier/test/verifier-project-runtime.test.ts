import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditProject, critiqueSource } from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-verifier-'));
}

function validV4Essence(): Record<string, unknown> {
  return {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
      typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
      color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'existing', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
      personality: ['observed brownfield app'],
    },
    blueprint: {
      shell: 'observed-existing-shell',
      features: [],
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
      routes: { '/': { section: 'app', page: 'home' } },
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'history' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  };
}

describe('verifier project and runtime evidence', () => {
  it('audits project contract and reports missing review packs', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(report.valid).toBe(true);
      expect(report.summary.reviewPackPresent).toBe(false);
      expect(report.summary.runtimeAuditChecked).toBe(false);
      expect(report.runtimeAudit.distPresent).toBe(false);
      expect(report.findings.some((finding) => finding.id === 'review-pack-file-missing')).toBe(
        true,
      );
      expect(report.findings.some((finding) => finding.id === 'pack-manifest-missing')).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'runtime-dist-missing')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('recognizes Next build output when dist is absent', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, '.next', 'server', 'app'), { recursive: true });
      mkdirSync(join(projectRoot, '.next', 'static', 'chunks'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '3.0.0',
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              pages: [{ id: 'home', route: '/', layout: ['hero'] }],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'next', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(join(projectRoot, '.next', 'BUILD_ID'), 'next-build\n');
      writeFileSync(join(projectRoot, '.next', 'build-manifest.json'), '{}\n');
      writeFileSync(
        join(projectRoot, '.next', 'server', 'app', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>Next App</title></head><body></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, '.next', 'static', 'chunks', 'app.js'),
        'console.log("next");\n',
      );

      const report = await auditProject(projectRoot);
      expect(report.summary.runtimeAuditChecked).toBe(true);
      expect(report.runtimeAudit.distPresent).toBe(true);
      expect(report.runtimeAudit.indexPresent).toBe(true);
      expect(report.runtimeAudit.assetCount).toBe(1);
      expect(report.findings.some((finding) => finding.id === 'runtime-dist-missing')).toBe(false);
      expect(report.findings.some((finding) => finding.id === 'runtime-index-missing')).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not require a Vite-style root mount for Next static document output', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', '_next', 'static'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'package.json'),
        JSON.stringify(
          {
            dependencies: { next: '^16.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(validV4Essence(), null, 2),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>Next App</title><script src="/_next/static/app.js"></script></head><body><main>Rendered by Next</main></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', '_next', 'static', 'app.js'),
        'console.log("next");\n',
      );

      const report = await auditProject(projectRoot);

      expect(report.summary.runtimeAuditChecked).toBe(true);
      expect(report.runtimeAudit.rootDocumentOk).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-root-document-invalid'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('accepts semantic static app roots without a framework mount point', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'package.json'),
        JSON.stringify({ name: 'todo-static', dependencies: { jquery: '^3.7.1' } }, null, 2),
      );
      const essence = validV4Essence();
      essence.meta = {
        archetype: 'observed-brownfield',
        target: 'html',
        platform: { type: 'static', routing: 'hash' },
        guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
      };
      writeFileSync(join(projectRoot, 'decantr.essence.json'), JSON.stringify(essence, null, 2));
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>TodoMVC</title><script src="/assets/app.js"></script></head><body><section id="todoapp" class="todoapp"><header><h1>todos</h1></header></section></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.js'), 'console.log("/");\n');

      const report = await auditProject(projectRoot);

      expect(report.summary.runtimeAuditChecked).toBe(true);
      expect(report.runtimeAudit.rootDocumentOk).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-root-document-invalid'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports missing or invalid essence contracts during project audit', async () => {
    const missingEssenceRoot = createProjectRoot();
    const invalidJsonRoot = createProjectRoot();
    const invalidSchemaRoot = createProjectRoot();
    try {
      const missingEssenceReport = await auditProject(missingEssenceRoot);
      expect(missingEssenceReport.valid).toBe(false);
      expect(
        missingEssenceReport.findings.some((finding) => finding.id === 'essence-missing'),
      ).toBe(true);

      writeFileSync(join(invalidJsonRoot, 'decantr.essence.json'), '{ not-valid-json }\n');
      const invalidJsonReport = await auditProject(invalidJsonRoot);
      expect(invalidJsonReport.valid).toBe(false);
      expect(
        invalidJsonReport.findings.some((finding) => finding.id === 'essence-parse-error'),
      ).toBe(true);

      writeFileSync(
        join(invalidSchemaRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: 'yes', skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      const invalidSchemaReport = await auditProject(invalidSchemaRoot);
      expect(invalidSchemaReport.valid).toBe(false);
      expect(
        invalidSchemaReport.findings.some((finding) => finding.id === 'essence-validation'),
      ).toBe(true);
    } finally {
      await rm(missingEssenceRoot, { recursive: true, force: true });
      await rm(invalidJsonRoot, { recursive: true, force: true });
      await rm(invalidSchemaRoot, { recursive: true, force: true });
    }
  });

  it('reports incomplete execution pack manifests during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, '.decantr', 'context'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
        JSON.stringify(
          {
            $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
            version: '1.0.0',
            generatedAt: '2026-04-09T00:00:00.000Z',
            scaffold: null,
            review: null,
            sections: [],
            pages: [],
            mutations: [],
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(report.findings.some((finding) => finding.id === 'scaffold-pack-missing')).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'review-pack-missing')).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'mutation-packs-missing')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports manifest-referenced pack files that are missing on disk', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, '.decantr', 'context'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(validV4Essence(), null, 2),
      );
      writeFileSync(
        join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
        JSON.stringify(
          {
            $schema: 'https://decantr.ai/schemas/pack-manifest.v1.json',
            version: '1.0.0',
            generatedAt: '2026-05-14T00:00:00.000Z',
            scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
            review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
            sections: [],
            pages: [
              {
                id: 'home',
                markdown: 'page-home-pack.md',
                json: 'page-home-pack.json',
                sectionId: 'app',
                sectionRole: 'primary',
              },
            ],
            mutations: [],
          },
          null,
          2,
        ),
      );
      writeFileSync(join(projectRoot, '.decantr', 'context', 'scaffold-pack.md'), '# Scaffold\n');
      writeFileSync(join(projectRoot, '.decantr', 'context', 'scaffold-pack.json'), '{}\n');
      writeFileSync(join(projectRoot, '.decantr', 'context', 'review-pack.md'), '# Review\n');
      writeFileSync(
        join(projectRoot, '.decantr', 'context', 'review-pack.json'),
        JSON.stringify(
          {
            data: { focusAreas: ['route-topology'], routes: [] },
            antiPatterns: [],
            successChecks: [],
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);

      const finding = report.findings.find(
        (entry) => entry.id === 'pack-manifest-referenced-files-missing',
      );
      expect(finding).toBeTruthy();
      expect(finding?.evidence.join('\n')).toContain('.decantr/context/page-home-pack.md');
      expect(finding?.evidence.join('\n')).toContain('.decantr/context/page-home-pack.json');
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not score contract-only critiques against Decantr treatments or decorators', () => {
    const report = critiqueSource({
      filePath: 'Button.tsx',
      code: 'export function Button() { return <button className="btn btn-primary">Save</button>; }',
      adoptionMode: 'contract-only',
    });

    expect(report.findings.some((finding) => finding.id === 'treatment-usage-missing')).toBe(false);
    expect(report.findings.some((finding) => finding.id === 'theme-consistency-weak')).toBe(false);
    expect(
      report.scores.find((score) => score.category === 'Styling Authority')?.details,
    ).toContain('Contract-only/style-bridge adoption');
  });

  it('does not recurse indefinitely while auditing Brownfield TSX source', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'app', 'intelligence'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(validV4Essence(), null, 2),
      );
      writeFileSync(
        join(projectRoot, 'app', 'intelligence', 'intelligence-handoff-builder.tsx'),
        `
          'use client';
          import { useEffect, useMemo, useState } from 'react';

          const handoffDispositions = [
            { id: 'ready', label: 'Ready', copy: 'Push to the next step' },
            { id: 'hold', label: 'Hold', copy: 'Keep refining' },
          ];

          function buildQuery(params: Record<string, string>) {
            const urlParams = new URLSearchParams({
              ...params,
              disposition: handoffDispositions.find((entry) => entry.id === params.mode)?.label ?? 'Ready',
            });
            return urlParams.toString();
          }

          export function IntelligenceHandoffBuilder() {
            const [goal, setGoal] = useState('');
            const selectedDisposition = handoffDispositions.find((entry) => entry.id === 'ready') ?? handoffDispositions[0];
            const readinessChecks = useMemo(() => [
              { id: 'goal', ready: goal.trim().length > 8 },
              { id: 'handoff', ready: selectedDisposition.label.length > 0 },
            ], [goal, selectedDisposition.label]);
            const activeCheck = readinessChecks.find((entry) => !entry.ready) ?? readinessChecks[0];

            useEffect(() => {
              const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                  window.location.assign('/handoff?' + buildQuery({
                    goal,
                    mode: selectedDisposition.id,
                    active: activeCheck.id,
                  }));
                }
              };
              window.addEventListener('keydown', handleKeyDown);
              return () => window.removeEventListener('keydown', handleKeyDown);
            }, [activeCheck.id, goal, selectedDisposition.id, selectedDisposition.label]);

            return <button onClick={() => setGoal(goal + '!')}>{selectedDisposition.copy}</button>;
          }
        `,
      );

      await expect(auditProject(projectRoot)).resolves.toBeTruthy();
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('audits built dist output and reports runtime title failures', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html><head></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.js'), 'console.log("/dashboard");\n');

      const report = await auditProject(projectRoot);
      expect(report.summary.runtimeAuditChecked).toBe(true);
      expect(report.runtimeAudit.distPresent).toBe(true);
      expect(report.runtimeAudit.indexPresent).toBe(true);
      expect(report.runtimeAudit.passed).toBe(false);
      expect(report.runtimeAudit.routeHintsCoverageOk).toBe(true);
      expect(report.runtimeAudit.routeDocumentsCoverageOk).toBe(true);
      expect(report.runtimeAudit.fullRouteCoverageOk).toBe(true);
      expect(report.runtimeAudit.langOk).toBe(false);
      expect(report.runtimeAudit.viewportOk).toBe(false);
      expect(report.runtimeAudit.jsAssetBytes).toBeGreaterThan(0);
      expect(report.runtimeAudit.totalAssetBytes).toBeGreaterThan(0);
      expect(report.findings.some((finding) => finding.id === 'runtime-title-missing')).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'runtime-lang-missing')).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'runtime-viewport-missing')).toBe(
        true,
      );
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-route-document-hardening-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports missing runtime index documents during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.distPresent).toBe(true);
      expect(report.runtimeAudit.indexPresent).toBe(false);
      expect(report.findings.some((finding) => finding.id === 'runtime-index-missing')).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports broken built runtime baselines when the entry document omits assets, mount roots, and route surfaces', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><title>Broken App</title></head><body><main>Fallback shell only</main></body></html>\n',
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-root-document-invalid'),
      ).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'runtime-assets-missing')).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'runtime-route-hints-missing')).toBe(
        true,
      );
      expect(
        report.findings.some((finding) => finding.id === 'runtime-route-documents-missing'),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-route-document-hardening-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports referenced asset fetch failures during runtime verification', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Asset Failure</title><link rel="stylesheet" href="/assets/app.css"><link rel="stylesheet" href="/assets/missing.css"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script><script type="module" src="/assets/missing.js"></script></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.css'), '.app{color:#111;}\n');
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.js'), 'console.log("/dashboard");\n');
      writeFileSync(join(projectRoot, 'dist', 'assets', 'missing.js'), '');

      const report = await auditProject(projectRoot);
      expect(report.findings.some((finding) => finding.id === 'runtime-assets-fetch-failed')).toBe(
        true,
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports oversized built JavaScript bundles', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html><head><title>Large App</title><link rel="stylesheet" href="/assets/app.css"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.css'),
        `.app{color:#111;}\n${'y'.repeat(200_000)}`,
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        `console.log("/dashboard");\n${'x'.repeat(1_400_000)}`,
      );

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.largestAssetPath).toBe('/assets/app.js');
      expect(report.runtimeAudit.largestAssetBytes).toBeGreaterThan(350_000);
      expect(report.runtimeAudit.jsAssetBytes).toBeGreaterThan(350_000);
      expect(report.runtimeAudit.cssAssetBytes).toBeGreaterThan(150_000);
      expect(report.runtimeAudit.totalAssetBytes).toBeGreaterThan(1_500_000);
      expect(report.findings.some((finding) => finding.id === 'runtime-js-bundle-large')).toBe(
        true,
      );
      expect(report.findings.some((finding) => finding.id === 'runtime-css-bundle-large')).toBe(
        true,
      );
      expect(report.findings.some((finding) => finding.id === 'runtime-total-assets-large')).toBe(
        true,
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports document hardening risks in the built root document', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Secure-ish App</title><link rel="stylesheet" href="http://cdn.example.com/widget.css"><link rel="stylesheet" href="https://cdn.example.com/widget-safe.css" integrity="sha384-stylehash"><script>window.__BOOTSTRAP__ = true;</script><script src="http://cdn.example.com/widget.js"></script><script src="https://cdn.example.com/widget-safe.js" integrity="sha384-scripthash"></script></head><body onload="bootLegacy()"><a href="https://external.example.com" target="_blank">Docs</a><iframe src="http://legacy.example.com/embed" title="Legacy analytics"></iframe><img srcset="http://cdn.example.com/hero@2x.jpg 2x, https://cdn.example.com/hero.jpg 1x" alt="Legacy hero"><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        'eval("boot()"); document.write("<p>unsafe</p>"); fetch("http://legacy.example.com/api"); const devBase = "http://localhost:3000/api"; const leaked = "SUPABASE_SERVICE_ROLE_KEY"; const stripe = "sk_live_1234567890"; console.log("/");\n',
      );

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.charsetOk).toBe(false);
      expect(report.runtimeAudit.cspSignalOk).toBe(false);
      expect(report.runtimeAudit.inlineScriptCount).toBe(1);
      expect(report.runtimeAudit.inlineEventHandlerCount).toBe(1);
      expect(report.runtimeAudit.externalScriptsWithoutIntegrityCount).toBe(1);
      expect(report.runtimeAudit.externalScriptsWithIntegrityMissingCrossoriginCount).toBe(1);
      expect(report.runtimeAudit.externalStylesheetsWithoutIntegrityCount).toBe(1);
      expect(report.runtimeAudit.externalStylesheetsWithIntegrityMissingCrossoriginCount).toBe(1);
      expect(report.runtimeAudit.externalScriptsWithInsecureTransportCount).toBe(1);
      expect(report.runtimeAudit.externalStylesheetsWithInsecureTransportCount).toBe(1);
      expect(report.runtimeAudit.externalMediaSourcesWithInsecureTransportCount).toBe(1);
      expect(report.runtimeAudit.externalBlankLinksWithoutRelCount).toBe(1);
      expect(report.runtimeAudit.externalIframesWithoutSandboxCount).toBe(1);
      expect(report.runtimeAudit.externalIframesWithInsecureTransportCount).toBe(1);
      expect(report.runtimeAudit.jsEvalSignalCount).toBe(1);
      expect(report.runtimeAudit.jsHtmlInjectionSignalCount).toBe(1);
      expect(report.runtimeAudit.jsInsecureTransportSignalCount).toBe(2);
      expect(report.runtimeAudit.jsSecretSignalCount).toBe(2);
      expect(report.findings.some((finding) => finding.id === 'runtime-charset-missing')).toBe(
        true,
      );
      expect(
        report.findings.some((finding) => finding.id === 'runtime-inline-scripts-present'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-inline-event-handlers-present'),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-scripts-without-integrity',
        ),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-scripts-crossorigin-missing',
        ),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-stylesheets-without-integrity',
        ),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-stylesheets-crossorigin-missing',
        ),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-scripts-insecure-transport',
        ),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-stylesheets-insecure-transport',
        ),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-media-insecure-transport',
        ),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-external-links-noopener-missing'),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-iframes-sandbox-missing',
        ),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-external-iframes-insecure-transport',
        ),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-js-dynamic-code-signals'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-js-html-injection-signals'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-js-insecure-transport-signals'),
      ).toBe(true);
      expect(report.findings.some((finding) => finding.id === 'runtime-js-secret-signals')).toBe(
        true,
      );
      expect(report.findings.some((finding) => finding.id === 'runtime-csp-signal-missing')).toBe(
        true,
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('suppresses built-js risk markers when source files are present but do not corroborate them', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      mkdirSync(join(projectRoot, 'src'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'carbon-neon', mode: 'dark', shape: 'rounded' },
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              sections: [
                {
                  id: 'workspace',
                  role: 'primary',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Workspace',
                  pages: [{ id: 'agents', route: '/agents', layout: ['hero'] }],
                },
              ],
              features: [],
              routes: {
                '/agents': { section: 'workspace', page: 'agents' },
              },
            },
            meta: {
              archetype: 'agent-marketplace',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'App.tsx'),
        'export function App() { return <main id="main-content">ok</main>; }\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>App</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        'const vendorNoise = "innerHTML http://www.w3.org/2000/svg http://www.w3.org/1999/xlink localhost"; console.log("/agents");\n',
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-js-html-injection-signals'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-js-insecure-transport-signals'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports partial runtime route coverage when only some compiled routes survive the build output', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [
                    { id: 'home', route: '/', layout: ['hero'] },
                    { id: 'dashboard', route: '/dashboard', layout: ['hero'] },
                    { id: 'settings', route: '/settings', layout: ['hero'] },
                  ],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Partial Routes</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        'console.log("/"); console.log("/dashboard");\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'dashboard'),
        '<!doctype html><html><body><p>bad route shell</p></body></html>\n',
      );

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.routeHintsChecked).toEqual(['/', '/dashboard', '/settings']);
      expect(report.runtimeAudit.routeHintsMatched).toBe(2);
      expect(report.runtimeAudit.routeHintsCoverageOk).toBe(false);
      expect(report.runtimeAudit.routeDocumentsPassed).toBe(2);
      expect(report.runtimeAudit.routeDocumentsCoverageOk).toBe(false);
      expect(report.runtimeAudit.fullRouteCoverageOk).toBe(false);
      expect(report.findings.some((finding) => finding.id === 'runtime-route-hints-partial')).toBe(
        true,
      );
      expect(
        report.findings.some((finding) => finding.id === 'runtime-route-documents-partial'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports auth-specific runtime route failures when gateway and primary routes do not return valid documents', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Auth Routes</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        'console.log("/login"); console.log("/dashboard");\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'login'),
        '<!doctype html><html><body><p>broken login route</p></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'dashboard'),
        '<!doctype html><html><body><p>broken dashboard route</p></body></html>\n',
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-auth-gateway-routes-failed'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'runtime-auth-primary-routes-failed'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('aggregates source-level risk findings during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          'use client';

          export function Home() {
            const leaked = "sk_live_1234567890";
            const serviceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
            localStorage.setItem('auth_token', token);
            document.cookie = \`auth_token=\${token}; path=/\`;
            fetch('/api/me', { headers: { Authorization: \`Bearer \${token}\` } });
            return (
              <form>
                <button>Save</button>
                <a href="#">Broken</a>
                <img src="/hero.png" />
                <div dangerouslySetInnerHTML={{ __html: html }} style={{ color: '#ff00ff' }} />
                <input type="password" />
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(report.findings.some((finding) => finding.id === 'source-inline-styles-present')).toBe(
        true,
      );
      expect(
        report.findings.some((finding) => finding.id === 'source-security-risk-patterns-present'),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-placeholder-route-targets-present',
        ),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-storage-writes-present'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-cookie-writes-present'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-header-writes-present'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-guard-signals-missing'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-signals-missing'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-accessibility-issues-present'),
      ).toBe(true);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-interaction-safety-issues-present',
        ),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-input-hints-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not report server-only auth headers as client-side header writes', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'app', 'dashboard', 'settings'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '3.0.0',
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'app', 'dashboard', 'settings', 'actions.ts'),
        `
          'use server';

          export async function updateProfile(session: { access_token: string }) {
            const headers: Record<string, string> = {};
            headers.Authorization = \`Bearer \${session.access_token}\`;
            await fetch('/api/profile', { method: 'PATCH', headers });
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-header-writes-present'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('treats escaped JSON-LD script injection as a reviewed structured-data exception', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'components', 'JsonLd.tsx'),
        `
          export function JsonLd({ data }: { data: unknown }) {
            return (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(data).replace(/</g, '\\\\u003c'),
                }}
              />
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-security-risk-patterns-present'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports insecure source transport endpoints before runtime review', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            fetch('http://legacy.example.com/api/profile');
            const realtime = new WebSocket('ws://legacy.example.com/live');
            return <main id="main">Home {String(realtime.readyState)}</main>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-security-risk-patterns-present'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports local css runtime stubs and atoms.css fallbacks in source audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'lib'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'carbon-neon', mode: 'dark', shape: 'rounded' },
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['operational'],
            },
            blueprint: {
              sections: [
                {
                  id: 'workspace',
                  role: 'primary',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Workspace',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
              routes: {
                '/': { section: 'workspace', page: 'home' },
              },
            },
            meta: {
              archetype: 'agent-marketplace',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'lib', 'css.js'),
        '/** Lightweight @decantr/css atom runtime for scaffold builds. */\nexport function css(...parts) { return parts.filter(Boolean).join(" "); }\n',
      );
      writeFileSync(join(projectRoot, 'src', 'styles', 'atoms.css'), '._flex{display:flex}\n');

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-local-css-runtime-stub-present'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('allows Decantr CSS-variable writes and dynamic geometry in inline style audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'clean', mode: 'light', shape: 'rounded' },
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['polished'],
            },
            blueprint: {
              sections: [
                {
                  id: 'workspace',
                  role: 'primary',
                  shell: 'top-nav-main',
                  features: [],
                  description: 'Workspace',
                  pages: [{ id: 'home', route: '/', layout: ['card-grid'] }],
                },
              ],
              features: [],
              routes: {
                '/': { section: 'workspace', page: 'home' },
              },
            },
            meta: {
              archetype: 'marketplace',
              target: 'react',
              platform: { type: 'spa', routing: 'history' },
              guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'AllowedStyles.tsx'),
        `
          export function AllowedStyles({ index, pos, scale }) {
            return (
              <main>
                <div style={{ ['--d-stagger-index' as never]: index } as React.CSSProperties} />
                <div style={{ left: \`\${pos.x}%\`, top: \`\${pos.y}%\`, transform: \`translate(\${pos.x}px, \${pos.y}px) scale(\${scale})\` }} />
              </main>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(report.findings.some((finding) => finding.id === 'source-inline-styles-present')).toBe(
        false,
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('still reports static inline visual styles in source audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'clean', mode: 'light', shape: 'rounded' },
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['polished'],
            },
            blueprint: {
              sections: [
                {
                  id: 'workspace',
                  role: 'primary',
                  shell: 'top-nav-main',
                  features: [],
                  description: 'Workspace',
                  pages: [{ id: 'home', route: '/', layout: ['card-grid'] }],
                },
              ],
              features: [],
              routes: {
                '/': { section: 'workspace', page: 'home' },
              },
            },
            meta: {
              archetype: 'marketplace',
              target: 'react',
              platform: { type: 'spa', routing: 'history' },
              guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'StaticStyles.tsx'),
        `
          export function StaticStyles() {
            return <main><div style={{ padding: '1rem', color: 'red' }} /></main>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(report.findings.some((finding) => finding.id === 'source-inline-styles-present')).toBe(
        true,
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports localhost-style source endpoints before runtime review', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              features: [],
              sections: [
                {
                  id: 'marketing',
                  role: 'public',
                  shell: 'sidebar-main',
                  features: [],
                  description: 'Marketing surface',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              routes: { '/': { section: 'marketing', page: 'home' } },
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            const apiBase = 'http://localhost:3000/api';
            const streamBase = 'ws://127.0.0.1:4000/live';
            return <main id="main">{apiBase + streamBase}</main>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-localhost-endpoints-present'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not treat colocated test files as production source-audit drift', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(validV4Essence(), null, 2),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'route.test.ts'),
        `
          export async function exercisesDevEndpoints() {
            document.write('<p>fixture</p>');
            eval('fixture()');
            return fetch('http://localhost:3000/api/test');
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            return <main id="main">Production surface</main>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-security-risk-patterns-present'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-localhost-endpoints-present'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports auth forms that default to GET semantics during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'supplementary',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Login.tsx'),
        `
          export function Login() {
            return (
              <form>
                <input type="email" name="email" autoComplete="email" />
                <input type="password" name="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-security-risk-patterns-present'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags missing skip navigation signals when the essence contract requires skip nav', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            return <main id="main-content">Hello</main>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-skip-nav-signals-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag skip navigation when the source tree includes a skip link signal', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            return (
              <>
                <a href="#main-content" className="skip-nav">Skip to content</a>
                <main id="main-content">Hello</main>
              </>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-skip-nav-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags missing main landmarks when skip navigation is required but no main target is present', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            return (
              <>
                <a href="#main-content" className="skip-nav">Skip to content</a>
                <div id="main-content">Hello</div>
              </>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-skip-nav-signals-missing'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-main-landmark-signals-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag main landmarks when skip navigation targets a main region', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            return (
              <>
                <a href="#main-content" className="skip-nav">Skip to content</a>
                <section role="main" id="main-content">Hello</section>
              </>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-main-landmark-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags skip-link targets that do not match the main landmark id', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            return (
              <>
                <a href="#main-content" className="skip-nav">Skip to content</a>
                <main id="primary-content">Hello</main>
              </>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-skip-nav-target-mismatch'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag skip-link targets when the main landmark id matches', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'pages'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'pages', 'Home.tsx'),
        `
          export function Home() {
            return (
              <>
                <a href="#main-content" className="skip-nav">Skip to content</a>
                <main id="main-content">Hello</main>
              </>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-skip-nav-target-mismatch'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags missing focus-visible style signals when the essence contract requires visible keyboard focus', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'styles', 'global.css'),
        'button { outline: none; }\n',
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'style-focus-visible-signals-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag focus-visible styles when the project CSS defines a focus-visible treatment', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'styles', 'global.css'),
        ':focus-visible { outline: 2px solid var(--d-primary); outline-offset: 2px; }\n',
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'style-focus-visible-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags missing reduced-motion style signals when the essence contract requires reduced motion', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'styles', 'global.css'),
        ':focus-visible { outline: 2px solid var(--d-primary); outline-offset: 2px; }\n',
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'style-reduced-motion-signals-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag reduced-motion styles when the project CSS defines a reduce-motion path', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [{ id: 'home', route: '/', layout: ['hero'] }],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'styles', 'global.css'),
        `
          :focus-visible { outline: 2px solid var(--d-primary); outline-offset: 2px; }
          @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; transition: none !important; }
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'style-reduced-motion-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports missing auth topology surfaces from the essence contract', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(report.findings.some((finding) => finding.id === 'auth-gateway-section-missing')).toBe(
        true,
      );
      expect(report.findings.some((finding) => finding.id === 'auth-entry-route-missing')).toBe(
        true,
      );
      expect(report.findings.some((finding) => finding.id === 'auth-primary-section-missing')).toBe(
        false,
      );
      expect(report.findings.some((finding) => finding.id === 'auth-primary-routes-missing')).toBe(
        false,
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports gateway sections whose pages do not declare explicit routes', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(report.findings.some((finding) => finding.id === 'auth-gateway-routes-missing')).toBe(
        true,
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports suspicious auth route placement in gateway and primary sections', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'entry', route: '/dashboard', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'auth-gateway-routes-look-protected'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'auth-gateway-routes-not-auth-like'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'auth-primary-routes-look-auth-only'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'auth-primary-routes-not-app-like'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports overlapping auth routes between gateway and primary sections', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'login-app', route: '/login', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'auth-gateway-primary-route-overlap'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag app-like primary routes such as /agents as missing post-auth destinations', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'carbon-neon', mode: 'dark', shape: 'rounded' },
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['operational'],
            },
            blueprint: {
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  shell: 'centered',
                  features: ['auth'],
                  description: 'Auth entry',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'agents',
                  role: 'primary',
                  shell: 'sidebar-main',
                  features: ['auth'],
                  description: 'Agent workspace',
                  pages: [{ id: 'agents', route: '/agents', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
              routes: {
                '/login': { section: 'gateway', page: 'login' },
                '/agents': { section: 'agents', page: 'agents' },
              },
            },
            meta: {
              archetype: 'agent-marketplace',
              target: 'react',
              platform: { type: 'spa', routing: 'hash' },
              guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'auth-primary-routes-not-app-like'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag marketplace primary routes as missing post-auth destinations', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'clean', mode: 'light', shape: 'rounded' },
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['marketplace'],
            },
            blueprint: {
              sections: [
                {
                  id: 'auth-full',
                  role: 'gateway',
                  shell: 'centered',
                  features: ['auth'],
                  description: 'Auth entry',
                  pages: [{ id: 'login', route: '/login', layout: ['auth-form'] }],
                },
                {
                  id: 'listing-browser',
                  role: 'primary',
                  shell: 'top-nav-main',
                  features: ['search', 'filters'],
                  description: 'Marketplace discovery',
                  pages: [
                    { id: 'browse', route: '/browse', layout: ['search-filter-bar', 'card-grid'] },
                    { id: 'listing-detail', route: '/listings/:id', layout: ['detail-header'] },
                    { id: 'search', route: '/search', layout: ['search-filter-bar'] },
                  ],
                },
              ],
              features: ['auth', 'search', 'filters'],
              routes: {
                '/login': { section: 'auth-full', page: 'login' },
                '/browse': { section: 'listing-browser', page: 'browse' },
                '/listings/:id': { section: 'listing-browser', page: 'listing-detail' },
                '/search': { section: 'listing-browser', page: 'search' },
              },
            },
            meta: {
              archetype: 'two-sided-marketplace',
              target: 'react',
              platform: { type: 'spa', routing: 'history' },
              guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'auth-primary-routes-not-app-like'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag missing auth guard signals when the source tree shows route protection behavior', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'ProtectedRoute.tsx'),
        `
          export function ProtectedRoute({ user, children }: { user: unknown; children: React.ReactNode }) {
            if (!user) {
              return redirect('/login');
            }
            return <>{children}</>;
          }

          export async function signOutUser() {
            await auth.signOut();
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-guard-signals-missing'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-signals-missing'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth exit redirect gaps when logout returns users to an anonymous route', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      mkdirSync(join(projectRoot, 'lib'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'middleware.ts'),
        `
          export function middleware(request: { auth?: { user?: unknown } }) {
            if (!request.auth?.user) {
              return redirect('/login');
            }
            return NextResponse.next();
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'lib', 'auth.ts'),
        `
          export async function logout() {
            await auth.signOut();
            return redirect('/login');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-signals-missing'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth exit flows that redirect away without tearing down the session', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      mkdirSync(join(projectRoot, 'lib'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'UserMenu.tsx'),
        `
          export function UserMenu() {
            async function handleLogout() {
              return redirect('/login');
            }

            return <button onClick={handleLogout}>Logout</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-teardown-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth exit teardown gaps when logout explicitly signs out the session', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      mkdirSync(join(projectRoot, 'lib'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'lib', 'auth.ts'),
        `
          export async function logout() {
            await auth.signOut();
            return redirect('/login');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-teardown-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags client-managed auth persistence that is never cleared during project sign-out flows', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'Session.tsx'),
        `
          export function SessionActions({ token }) {
            localStorage.setItem('auth_token', token);
            document.cookie = \`auth_token=\${token}; path=/\`;
            fetch('/api/me', { headers: { Authorization: \`Bearer \${token}\` } });

            async function handleLogout() {
              await auth.signOut();
              return redirect('/login');
            }

            return <button onClick={handleLogout}>Logout</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-storage-teardown-missing'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-cookie-teardown-missing'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-header-teardown-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags client data caches that are never cleared during project sign-out flows', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'Session.tsx'),
        `
          import { useQueryClient } from '@tanstack/react-query';

          export function SessionActions() {
            const queryClient = useQueryClient();
            const { data: session } = useSession();

            async function handleLogout() {
              await auth.signOut();
              return redirect('/login');
            }

            if (!session) {
              return null;
            }

            return <button onClick={handleLogout}>Logout</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-cache-teardown-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth refresh timers that are never torn down during project sign-out flows', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'Session.tsx'),
        `
          export function SessionActions() {
            const { data: session } = useSession();

            setInterval(() => auth.refreshSession(), 60_000);

            async function handleLogout() {
              await auth.signOut();
              return redirect('/login');
            }

            if (!session) {
              return null;
            }

            return <button onClick={handleLogout}>Logout</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-refresh-teardown-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags realtime channels that are never torn down during project sign-out flows', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'Session.tsx'),
        `
          export function SessionActions() {
            const realtime = new WebSocket('wss://example.com/live');
            const { data: session } = useSession();

            async function handleLogout() {
              await auth.signOut();
              return redirect('/login');
            }

            if (!session) {
              return null;
            }

            return <button onClick={handleLogout}>Logout</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-realtime-teardown-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags cross-tab auth coordination that is never torn down during project sign-out flows', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'Session.tsx'),
        `
          export function SessionActions() {
            const authChannel = new BroadcastChannel('auth');
            window.addEventListener('storage', syncSession);
            const { data: session } = useSession();

            async function handleLogout() {
              await auth.signOut();
              return redirect('/login');
            }

            if (!session) {
              return null;
            }

            return <button onClick={handleLogout}>Logout</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-coordination-teardown-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags protected session-aware surfaces that never branch on unauthenticated state during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-handling-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags protected session-aware surfaces that branch on auth loss but never return users to an anonymous route during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return null;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-redirect-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags protected session-aware surfaces that render protected shells inside loading branches during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <DashboardShell path="/dashboard" pendingSession={session} />;
            }

            if (!session) {
              return redirect('/login');
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth/session loading branches that return nothing during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return null;
            }

            if (!session) {
              return redirect('/login');
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-blank-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth/session loading branches that redirect to anonymous routes during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return redirect('/login');
            }

            if (!session) {
              return redirect('/login');
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-anonymous-redirect'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still render protected shells during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <DashboardShell path="/dashboard" />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags protected-looking unauthenticated shell renders even without explicit route props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <DashboardShell />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags protected-looking unauthenticated child renders even without explicit route props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <DashboardSummary />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still return outlet-like protected content during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Outlet />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that pass auth-scoped props into generic components during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <SummaryPanel currentUser={session?.user} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that pass auth-scoped props into generic components during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <SummaryPanel currentUser={session?.user} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still interpolate auth-scoped data into generic jsx during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <section>{session?.user?.email}</section>;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still interpolate auth-scoped data into generic jsx during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <section>{session?.user?.email}</section>;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected route links inside generic markup during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section>
                  <a href="/dashboard">Continue to dashboard</a>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected route links inside generic markup during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <a href="/dashboard">Continue to dashboard</a>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected route actions inside generic markup during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section>
                  <button onClick={() => navigate('/dashboard')}>Continue to dashboard</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected route actions inside generic markup during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <button onClick={() => navigate('/dashboard')}>Continue to dashboard</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected form actions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section>
                  <form action="/dashboard">
                    <button type="submit">Continue to dashboard</button>
                  </form>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected form actions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <form action="/dashboard">
                    <button type="submit">Continue to dashboard</button>
                  </form>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected browser redirects inside generic markup during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section>
                  <button onClick={() => window.location.assign('/dashboard')}>Continue to dashboard</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected browser redirects inside generic markup during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <button onClick={() => window.location.assign('/dashboard')}>Continue to dashboard</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still stash protected hidden redirects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section>
                  <input type="hidden" name="redirectTo" value="/dashboard" />
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still stash protected hidden redirects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <input type="hidden" name="redirectTo" value="/dashboard" />
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still stash protected redirect metadata during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section data-redirect="/dashboard">
                  <p>Loading account context...</p>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still stash protected redirect metadata during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section data-next="/dashboard">
                  <p>Sign in again.</p>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still pass protected redirect props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard redirectTo="/dashboard" />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still pass protected redirect props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard returnTo="/dashboard" />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still pass protected redirect object props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard state={{ redirectTo: '/dashboard' }} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still pass protected redirect object props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard options={{ returnTo: '/dashboard' }} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still pass protected generic route objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard config={{ to: '/dashboard' }} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still pass protected generic route objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard config={{ path: '/dashboard' }} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still serialize protected route payloads during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard payload={JSON.stringify({ redirectTo: '/dashboard' })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still serialize protected route payloads during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={JSON.stringify({ path: '/dashboard' })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still encode protected route payloads with URLSearchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard payload={new URLSearchParams({ next: '/dashboard' }).toString()} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose raw URLSearchParams next payload objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard payload={new URLSearchParams({ next: '/dashboard' })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still encode protected route payloads with URLSearchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={new URLSearchParams({ path: '/dashboard' }).toString()} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose raw URLSearchParams route payload objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={new URLSearchParams({ path: '/dashboard' })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still encode protected route payloads with createSearchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard payload={createSearchParams({ next: '/dashboard' }).toString()} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still encode protected route payloads with createSearchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={createSearchParams({ path: '/dashboard' }).toString()} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose raw createSearchParams route payload objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard payload={createSearchParams({ next: '/dashboard' })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose raw createSearchParams path payload objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={createSearchParams({ path: '/dashboard' })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still encode auth-scoped payloads with JSON.stringify during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard payload={JSON.stringify({ label: session?.user?.email })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still encode auth-scoped payloads with createSearchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={createSearchParams({ email: currentUser?.email }).toString()} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose raw createSearchParams auth payload objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={createSearchParams({ email: currentUser?.email })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose URLSearchParams payload objects in route arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ payload: new URLSearchParams({ next: '/dashboard' }), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose raw URLSearchParams route payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ payload: new URLSearchParams({ path: '/dashboard' }), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose direct URLSearchParams auth payload objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard payload={new URLSearchParams({ email: currentUser?.email })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose raw URLSearchParams auth payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ payload: new URLSearchParams({ email: session?.user?.email }), href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose raw URLSearchParams auth payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ payload: new URLSearchParams({ email: currentUser?.email }), href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose raw URLSearchParams auth payload objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <StatusCard payload={new URLSearchParams({ email: session?.user?.email })} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected route props through JSX expressions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Navigate to={'/dashboard'} replace />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected route arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ to: '/dashboard', label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose helper-generated protected route arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { generatePath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ to: generatePath('/dashboard'), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose helper-prop route arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ redirectTo: '/dashboard', label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose nested redirect state arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ state: { redirectTo: '/dashboard' }, label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose serialized redirect payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ payload: JSON.stringify({ redirectTo: '/dashboard' }), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose auth-scoped data arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ label: session?.user?.email, href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose nested auth-scoped data arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ meta: { label: session?.user?.email }, href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose encoded auth-scoped payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ payload: JSON.stringify({ label: session?.user?.email }), href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected helper props through JSX expressions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard redirectTo={\`/dashboard\`} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected route arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ href: '/dashboard', label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose helper-generated protected route arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createPath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ pathname: createPath({ pathname: '/dashboard' }), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose helper-generated helper-prop route arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { generatePath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ returnTo: generatePath('/dashboard'), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose nested redirect state arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ options: { returnTo: '/dashboard' }, label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose encoded redirect payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ payload: createSearchParams({ path: '/dashboard' }).toString(), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose raw createSearchParams route payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ payload: createSearchParams({ path: '/dashboard' }), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose raw createSearchParams next payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <QuickNav items={[{ payload: createSearchParams({ next: '/dashboard' }), label: 'Dashboard' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose auth-scoped data arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ label: currentUser?.email, href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose nested auth-scoped data arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ details: { subtitle: currentUser?.email }, href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose encoded auth-scoped payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ payload: createSearchParams({ email: currentUser?.email }).toString(), href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose raw createSearchParams auth payload arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createSearchParams } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();
            const currentUser = session?.user;

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <Sidebar links={[{ payload: createSearchParams({ email: currentUser?.email }), href: '/login' }]} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected route objects through pathname props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Navigate to={{ pathname: '/dashboard' }} replace />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected route objects through pathname props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard redirect={{ pathname: '/dashboard' }} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose protected route objects through callback navigation during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section>
                  <button onClick={() => navigate({ pathname: '/dashboard' })}>Continue</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose protected route objects through callback navigation during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <button onClick={() => navigate({ pathname: '/dashboard' })}>Continue</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose helper-generated protected route props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { generatePath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Navigate to={generatePath('/dashboard')} replace />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose helper-generated protected route props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { generatePath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return <StatusCard redirectTo={generatePath('/dashboard')} />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose helper-generated protected callback destinations during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createPath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return (
                <section>
                  <button onClick={() => navigate(createPath({ pathname: '/dashboard' }))}>Continue</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose helper-generated protected callback destinations during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createPath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <button onClick={() => navigate(createPath({ pathname: '/dashboard' }))}>Continue</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth-loading branches that still expose helper-generated protected route objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { generatePath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Navigate to={{ pathname: generatePath('/dashboard') }} replace />;
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-protected-render'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags unauthenticated branches that still expose helper-generated protected route objects through callback navigation during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          import { createPath } from 'react-router-dom';

          export function DashboardGate() {
            const { status, data: session } = useSession();

            if (status === 'loading') {
              return <Spinner />;
            }

            if (!session) {
              return (
                <section>
                  <button onClick={() => navigate({ pathname: createPath({ pathname: '/dashboard' }) })}>Continue</button>
                </section>
              );
            }

            return <DashboardShell session={session} path="/dashboard" />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-session-loss-protected-render',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags missing auth entry signals when auth gateway routes exist but no entry surface is implemented', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            if (status === 'loading') {
              return <Spinner />;
            }
            if (!session) {
              return redirect('/login');
            }
            return <Dashboard />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-entry-signals-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags protected surfaces that are not colocated with auth checks', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            return (
              <form method="post">
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'middleware.ts'),
        `
          export function middleware(request: { auth?: { user?: unknown } }) {
            if (!request.auth?.user) {
              return redirect('/login');
            }
            return NextResponse.next();
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardPage.tsx'),
        `
          export function DashboardPage() {
            return <a href="/dashboard">Open dashboard</a>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-guard-signals-missing'),
      ).toBe(false);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-protected-surface-auth-checks-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag Next App Router surfaces covered by guarded layouts', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'app', '(public)'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'app', 'dashboard'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'app', 'admin', 'moderation'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '3.0.0',
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'app', '(public)', 'nav-header.tsx'),
        `
          export function NavHeader() {
            return <a href="/dashboard">Dashboard</a>;
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'app', 'dashboard', 'layout.tsx'),
        `
          export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
            const session = await getServerSession();
            if (!session) {
              redirect('/login');
            }
            return <>{children}</>;
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'app', 'dashboard', 'page.tsx'),
        `
          export default function DashboardPage() {
            return <a href="/dashboard/settings">Settings</a>;
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'app', 'admin', 'layout.tsx'),
        `
          export default async function AdminLayout({ children }: { children: React.ReactNode }) {
            const session = await getServerSession();
            if (!session) {
              redirect('/login');
            }
            if (!isAdmin(session.user.email)) {
              notFound();
            }
            return <>{children}</>;
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'app', 'admin', 'moderation', 'actions.ts'),
        `
          'use server';

          export async function approveSubmission() {
            await requireAdminRequestContext();
            revalidatePath('/admin/moderation');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-guard-signals-missing'),
      ).toBe(false);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-protected-surface-auth-checks-missing',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('keeps router guards and non-production callback/cookie helpers out of auth findings', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, '.decantr'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'hooks'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'testing'), { recursive: true });
      mkdirSync(join(projectRoot, 'src', 'components', 'ui'), { recursive: true });
      const essence = validV4Essence() as {
        blueprint: {
          features: string[];
          sections: Array<Record<string, unknown>>;
          routes: Record<string, unknown>;
        };
      };
      essence.blueprint.features = ['auth'];
      essence.blueprint.sections = [
        {
          id: 'gateway',
          role: 'gateway',
          shell: 'observed-existing-shell',
          features: ['auth'],
          description: 'Sign in',
          pages: [{ id: 'login', route: '/login', layout: ['form'] }],
        },
        {
          id: 'app',
          role: 'primary',
          shell: 'observed-existing-shell',
          features: ['auth'],
          description: 'Protected app',
          pages: [{ id: 'dashboard', route: '/dashboard', layout: ['existing-surface'] }],
        },
      ];
      essence.blueprint.routes = {
        '/login': { section: 'gateway', page: 'login' },
        '/dashboard': { section: 'app', page: 'dashboard' },
      };
      writeFileSync(join(projectRoot, 'decantr.essence.json'), JSON.stringify(essence));
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'router.tsx'),
        'export const routes = [{ path: "/dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute> }];\n',
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardPage.tsx'),
        'export function DashboardPage() { return <a href="/dashboard">Dashboard</a>; }\n',
      );
      writeFileSync(
        join(projectRoot, 'src', 'hooks', 'use-callback-ref.ts'),
        'export function useCallbackRef() { const error = null; return error; }\n',
      );
      writeFileSync(
        join(projectRoot, 'src', 'testing', 'cookies.ts'),
        'document.cookie = "auth_token=test-only";\n',
      );
      writeFileSync(
        join(projectRoot, 'src', 'components', 'ui', 'field.tsx'),
        'export function Field() { return <span className="absolute inset-0">remove</span>; }\n',
      );
      writeFileSync(
        join(projectRoot, 'src', 'components', 'Dialog.tsx'),
        'export function Dialog() { return <dialog><h2>Delete item</h2><button>Cancel</button></dialog>; }\n',
      );
      writeFileSync(
        join(projectRoot, 'src', 'components', 'file-uploader.tsx'),
        'export function FileUploader() { function upload() { toast.error("Upload failed"); } return <button onClick={upload}>Upload</button>; }\n',
      );
      writeFileSync(
        join(projectRoot, 'src', 'components', 'icons.tsx'),
        'export const icons = { logout: IconLogout, signOut: IconSignOut };\n',
      );
      writeFileSync(
        join(projectRoot, '.decantr', 'local-patterns.json'),
        JSON.stringify({
          version: 2,
          status: 'accepted',
          patterns: [
            {
              id: 'confirmation-dialog',
              componentPaths: ['src/components/Dialog.tsx'],
              behavior_obligations: {
                pattern_role: 'confirmation-dialog',
                obligations: [
                  { id: 'accessible-name', label: 'Dialog has a name', severity: 'error' },
                ],
              },
            },
          ],
        }),
      );

      const report = await auditProject(projectRoot);

      expect(
        report.findings.some(
          (finding) => finding.id === 'source-protected-surface-auth-checks-missing',
        ),
      ).toBe(false);
      expect(report.findings.some((finding) => finding.id.includes('auth-callback'))).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-teardown-missing'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-cookie-writes-present'),
      ).toBe(false);
      expect(
        report.findings.some(
          (finding) => finding.file?.endsWith('field.tsx') && finding.code === 'A11Y010',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth guards that redirect to protected destinations during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGuard.tsx'),
        `
          export function DashboardGuard() {
            const { data: session } = useSession();
            if (!session) {
              return redirect('/dashboard');
            }
            return <Dashboard />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-guard-protected-redirect'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth flows that trust raw redirect query params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            return redirect(searchParams.get('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth flows that trust raw URLSearchParams redirect params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            return redirect(new URLSearchParams(window.location.search).get('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth flows that trust aliased raw URLSearchParams redirect params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const next = new URLSearchParams(window.location.search).get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags link-driven query-param redirects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { Link } from 'react-router-dom';

          export function LoginRedirect({ searchParams }) {
            return <Link to={searchParams.get('next') ?? '/dashboard'}>Continue</Link>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags link-driven raw URLSearchParams redirects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { Link } from 'react-router-dom';

          export function LoginRedirect() {
            return <Link to={new URLSearchParams(window.location.search).get('next') ?? '/dashboard'}>Continue</Link>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags link-driven aliased raw URLSearchParams redirects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { Link } from 'react-router-dom';

          export function LoginRedirect() {
            const next = new URLSearchParams(window.location.search).get('next');
            return <Link to={next ?? '/dashboard'}>Continue</Link>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags browser-native auth redirects sourced from raw URLSearchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            window.location.assign(new URLSearchParams(window.location.search).get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags aliased browser-native auth redirects sourced from raw URLSearchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const next = new URLSearchParams(window.location.search).get('next');
            window.location.href = next ?? '/dashboard';
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that alias the URLSearchParams container during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const params = new URLSearchParams(window.location.search);
            const next = params.get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that alias a URL object searchParams carrier during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const url = new URL(window.location.href);
            const next = url.searchParams.get('next');
            window.location.assign(next ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that destructure location search carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const { search } = window.location;
            const next = new URLSearchParams(search).get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that destructure location href URL carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const { href } = window.location;
            const url = new URL(href);
            const next = url.searchParams.get('next');
            window.location.assign(next ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust globalThis location carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const next = new URLSearchParams(globalThis.location.search).get('next');
            globalThis.location.assign(next ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that destructure globalThis location bases during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const { location } = globalThis;
            const { href } = location;
            const url = new URL(href);
            const next = url.searchParams.get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased location objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const browserLocation = window.location;
            const next = new URLSearchParams(browserLocation.search).get('next');
            browserLocation.assign(next ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased global location href assignments during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const browserLocation = globalThis.location;
            const url = new URL(browserLocation.href);
            const next = url.searchParams.get('next');
            browserLocation.href = next ?? '/dashboard';
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust document location carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const next = new URLSearchParams(document.location.search).get('next');
            document.location.assign(next ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased document location objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const browserLocation = document.location;
            const next = new URLSearchParams(browserLocation.search).get('next');
            browserLocation.href = next ?? '/dashboard';
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust self location carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const next = new URLSearchParams(self.location.search).get('next');
            self.location.assign(next ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased parent location objects during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const frameLocation = parent.location;
            const next = new URLSearchParams(frameLocation.search).get('next');
            frameLocation.href = next ?? '/dashboard';
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bracketed self location carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
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
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const next = new URLSearchParams(self['location']['search']).get('next');
            self['location']['assign'](next ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});
