import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { handleTool } from '../src/tools.js';
import { resetAPIClient } from '../src/helpers.js';
import type { EssenceV3 } from '@decantr/essence-spec';

function makeV3Essence(overrides?: Partial<EssenceV3>): EssenceV3 {
  return {
    version: '3.0.0',
    dna: {
      theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
      typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
      color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'layered', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1.0, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
      personality: ['professional'],
      ...overrides?.dna,
    },
    blueprint: {
      shell: 'sidebar-main',
      pages: [
        { id: 'overview', layout: ['kpi-grid', 'chart-grid'] },
        { id: 'settings', layout: ['form-sections'] },
      ],
      features: ['auth', 'search'],
      ...overrides?.blueprint,
    },
    meta: {
      archetype: 'saas-dashboard',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      ...overrides?.meta,
    },
  };
}

function makeV2Essence() {
  return {
    version: '2.0.0',
    archetype: 'saas-dashboard',
    theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
    personality: ['professional'],
    platform: { type: 'spa', routing: 'hash' },
    structure: [
      { id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid', 'chart-grid'] },
      { id: 'settings', shell: 'sidebar-main', layout: ['form-sections'] },
    ],
    features: ['auth', 'search'],
    density: { level: 'comfortable', content_gap: '4' },
    guard: { enforce_style: true, mode: 'strict' },
    target: 'react',
  };
}

let testDir: string;
const originalCwd = process.cwd();

beforeEach(async () => {
  testDir = join(tmpdir(), `decantr-mcp-test-v3-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  process.chdir(originalCwd);
  resetAPIClient();
  vi.restoreAllMocks();
  await rm(testDir, { recursive: true, force: true });
});

describe('v3-aware tool tests', () => {
  describe('verification tools', () => {
    it('returns a schema-backed project audit report', async () => {
      await writeFile(join(testDir, 'decantr.essence.json'), JSON.stringify(makeV3Essence()));

      process.chdir(testDir);
      const result = await handleTool('decantr_audit_project', {}) as {
        $schema: string;
        summary: { reviewPackPresent: boolean };
        findings: Array<{ id: string }>;
      };

      expect(result.$schema).toBe('https://decantr.ai/schemas/project-audit-report.v1.json');
      expect(result.summary.reviewPackPresent).toBe(false);
      expect(result.findings.some(finding => finding.id === 'review-pack-file-missing')).toBe(true);
    });

    it('returns a schema-backed file critique report', async () => {
      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await mkdir(join(testDir, 'src', 'styles'), { recursive: true });
      await writeFile(join(testDir, '.decantr', 'context', 'review-pack.json'), JSON.stringify({
        $schema: 'https://decantr.ai/schemas/review-pack.v1.json',
        packVersion: '1.0.0',
        packType: 'review',
        objective: 'Review generated output against the compiled Decantr contract.',
        target: { platform: 'web', framework: 'react', runtime: 'spa', adapter: 'react-vite' },
        preset: null,
        scope: { appId: 'app', pageIds: ['overview'], patternIds: ['hero'] },
        requiredSetup: [],
        allowedVocabulary: [],
        examples: [],
        antiPatterns: [],
        successChecks: [],
        tokenBudget: { target: 1400, max: 2200, strategy: [] },
        data: {
          reviewType: 'app',
          shell: 'sidebar-main',
          theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
          routing: 'hash',
          features: [],
          routes: [{ pageId: 'overview', path: '/', patternIds: ['hero'] }],
          focusAreas: ['theme-consistency', 'responsive-design'],
          workflow: [],
        },
        renderedMarkdown: '# Review Pack\n',
      }));
      await writeFile(join(testDir, 'src', 'styles', 'treatments.css'), '.brand-accent { color: var(--d-primary); }\n');
      const filePath = join(testDir, 'Overview.tsx');
      await writeFile(filePath, '<section className="plain-panel">Overview</section>\n');

      process.chdir(testDir);
      const result = await handleTool('decantr_critique', { file_path: filePath }) as {
        $schema: string;
        focusAreas: string[];
        findings: Array<{ id: string }>;
      };

      expect(result.$schema).toBe('https://decantr.ai/schemas/file-critique-report.v1.json');
      expect(result.focusAreas).toContain('theme-consistency');
      expect(result.findings.some(finding => finding.id === 'theme-consistency-weak')).toBe(true);
    });

    it('returns showcase shortlist verification data', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({
          $schema: 'https://decantr.ai/schemas/showcase-shortlist-report.v1.json',
          generatedAt: '2026-04-09T00:00:00.000Z',
          dryRun: false,
          summary: {
            appCount: 1,
            passedBuilds: 1,
            failedBuilds: 0,
            averageDurationMs: 1100,
            passedSmokes: 1,
            failedSmokes: 0,
            averageSmokeDurationMs: 4,
            appsWithTitleOkCount: 1,
            appsWithRouteCoverageCount: 1,
            lowerDriftCount: 1,
            moderateDriftCount: 0,
            elevatedDriftCount: 0,
            withPackManifestCount: 0,
          },
          results: [
            {
              slug: 'portfolio',
              target: 'react-vite',
              classification: 'B',
              verificationStatus: 'smoke-green',
              build: { passed: true, durationMs: 1100 },
              smoke: {
                passed: true,
                durationMs: 4,
                rootDocumentOk: true,
                titleOk: true,
                assetCount: 2,
                assetsPassed: 2,
                routeHintsChecked: ['/'],
                routeHintsMatched: 1,
                routeDocumentsChecked: 1,
                routeDocumentsPassed: 1,
                failures: [],
              },
              drift: {
                signal: 'lower',
                penalty: 100,
                inlineStyleCount: 12,
                hardcodedColorCount: 3,
                utilityLeakageCount: 0,
                decantrTreatmentCount: 42,
                hasPackManifest: true,
                hasDist: true,
              },
            },
          ],
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      process.chdir(testDir);
      const result = await handleTool('decantr_get_showcase_benchmarks', {
        view: 'verification',
      }) as {
        $schema: string;
        summary: { passedBuilds: number; passedSmokes: number };
        results: Array<{ slug: string }>;
      };

      expect(result.$schema).toBe('https://decantr.ai/schemas/showcase-shortlist-report.v1.json');
      expect(result.summary.passedBuilds).toBeGreaterThan(0);
      expect(result.summary.passedSmokes).toBeGreaterThan(0);
      expect(result.results.some(entry => entry.slug === 'portfolio')).toBe(true);
    });
  });

  describe('decantr_read_essence — v3 layer filtering', () => {
    it('should return full v3 essence by default', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_read_essence', { path: essencePath }) as EssenceV3;
      expect(result.version).toBe('3.0.0');
      expect(result.dna).toBeDefined();
      expect(result.blueprint).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('should return only dna layer when requested', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_read_essence', { path: essencePath, layer: 'dna' }) as Record<string, unknown>;
      expect(result.theme).toBeDefined();
      expect(result.spacing).toBeDefined();
      expect((result as unknown as EssenceV3).blueprint).toBeUndefined();
    });

    it('should return only blueprint layer when requested', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_read_essence', { path: essencePath, layer: 'blueprint' }) as Record<string, unknown>;
      expect(result.pages).toBeDefined();
      expect(result.shell).toBeDefined();
      expect((result as unknown as EssenceV3).dna).toBeUndefined();
    });

    it('should ignore layer param for v2 essences', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV2Essence()));

      const result = await handleTool('decantr_read_essence', { path: essencePath, layer: 'dna' }) as Record<string, unknown>;
      expect(result.version).toBe('2.0.0');
      expect(result.archetype).toBeDefined();
    });
  });

  describe('decantr_validate — v3 layer separation', () => {
    it('should report format v3 for v3 essences', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_validate', { path: essencePath }) as Record<string, unknown>;
      // If schema validates, check for v3 format field
      if (result.valid) {
        expect(result.format).toBe('v3');
        expect(result.dna_violations).toBeDefined();
        expect(result.blueprint_violations).toBeDefined();
      }
    });
  });

  describe('decantr_check_drift — v3 separated response', () => {
    it('should return dna_violations and blueprint_drift for v3', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_check_drift', { path: essencePath }) as Record<string, unknown>;
      expect(result.dna_violations).toBeDefined();
      expect(result.blueprint_drift).toBeDefined();
      expect(result.drifted).toBe(false);
    });

    it('should detect theme drift for v3 with layer annotation', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_check_drift', {
        path: essencePath,
        theme_used: 'glassmorphism',
      }) as { drifted: boolean; dna_violations: Array<{ rule: string; layer: string }> };

      expect(result.drifted).toBe(true);
      expect(result.dna_violations.length).toBeGreaterThan(0);
      expect(result.dna_violations[0].layer).toBe('dna');
    });

    it('should detect missing page for v3 with autoFixable flag', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_check_drift', {
        path: essencePath,
        page_id: 'nonexistent-page',
      }) as { drifted: boolean; blueprint_drift: Array<{ rule: string; autoFixable: boolean }> };

      expect(result.drifted).toBe(true);
      expect(result.blueprint_drift.length).toBeGreaterThan(0);
      const pageViolation = result.blueprint_drift.find(v => v.rule === 'page-exists');
      expect(pageViolation?.autoFixable).toBe(true);
    });

    it('should return flat violations for v2', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV2Essence()));

      const result = await handleTool('decantr_check_drift', { path: essencePath }) as Record<string, unknown>;
      expect(result.violations).toBeDefined();
      expect(result.dna_violations).toBeUndefined();
    });

    it('should check components_used against page layout', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence()));

      const result = await handleTool('decantr_check_drift', {
        path: essencePath,
        page_id: 'overview',
        components_used: ['kpi-grid', 'unknown-widget'],
      }) as { drifted: boolean; blueprint_drift: Array<{ rule: string; message: string }> };

      expect(result.drifted).toBe(true);
      const compViolation = result.blueprint_drift.find(v => v.rule === 'component-pattern-match');
      expect(compViolation).toBeDefined();
      expect(compViolation?.message).toContain('unknown-widget');
    });
  });

  describe('decantr_create_essence — v3 format', () => {
    it('should generate v3 format essence', async () => {
      const result = await handleTool('decantr_create_essence', {
        description: 'SaaS dashboard with analytics',
      }) as { essence: EssenceV3; format: string };

      expect(result.format).toBe('v3');
      expect(result.essence.version).toBe('3.0.0');
      expect(result.essence.dna).toBeDefined();
      expect(result.essence.blueprint).toBeDefined();
      expect(result.essence.meta).toBeDefined();
    });

    it('should use matched archetype in meta', async () => {
      const result = await handleTool('decantr_create_essence', {
        description: 'ecommerce shop',
      }) as { essence: EssenceV3; archetype: string };

      expect(result.archetype).toContain('ecommerce');
      expect(result.essence.meta.archetype).toContain('ecommerce');
    });
  });

  describe('decantr_get_execution_pack', () => {
    it('returns scaffold task, scaffold overview, and compiled pack together', async () => {
      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await writeFile(join(contextDir, 'task-scaffold.md'), '# Task Context: Scaffolding\n');
      await writeFile(join(contextDir, 'scaffold.md'), '# Scaffold Context\n');
      await writeFile(join(contextDir, 'scaffold-pack.md'), '# Scaffold Pack\n');
      await writeFile(join(contextDir, 'review-pack.md'), '# Review Pack\n');
      await writeFile(join(contextDir, 'scaffold-pack.json'), JSON.stringify({
        packType: 'scaffold',
        data: { shell: 'sidebar-main' },
      }));
      await writeFile(join(contextDir, 'review-pack.json'), JSON.stringify({
        packType: 'review',
        data: { reviewType: 'app' },
      }));
      await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify({
        version: '1.0.0',
        generatedAt: '2026-04-08T00:00:00.000Z',
        scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
        review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
        mutations: [
          { id: 'add-page', markdown: 'mutation-add-page-pack.md', json: 'mutation-add-page-pack.json', mutationType: 'add-page' },
        ],
        sections: [
          { id: 'dashboard', markdown: 'section-dashboard-pack.md', json: 'section-dashboard-pack.json', pageIds: ['overview'] },
        ],
        pages: [
          { id: 'overview', markdown: 'page-overview-pack.md', json: 'page-overview-pack.json', sectionId: 'dashboard', sectionRole: 'primary' },
        ],
      }));

      process.chdir(testDir);
      const result = await handleTool('decantr_get_scaffold_context', {}) as {
        task_context: string;
        scaffold_context: string;
        execution_pack: { markdown: string; json: { packType: string } };
        review_pack: { markdown: string; json: { packType: string } };
        pack_manifest: { version: string };
        available_sections: Array<{ id: string; page_ids: string[] }>;
        available_pages: Array<{ id: string; section_id: string | null }>;
        available_mutations: Array<{ id: string; mutation_type: string }>;
      };

      expect(result.task_context).toContain('# Task Context: Scaffolding');
      expect(result.scaffold_context).toContain('# Scaffold Context');
      expect(result.execution_pack.markdown).toContain('# Scaffold Pack');
      expect(result.execution_pack.json.packType).toBe('scaffold');
      expect(result.review_pack.markdown).toContain('# Review Pack');
      expect(result.review_pack.json.packType).toBe('review');
      expect(result.pack_manifest.version).toBe('1.0.0');
      expect(result.available_sections).toEqual([{ id: 'dashboard', page_ids: ['overview'] }]);
      expect(result.available_pages).toEqual([{ id: 'overview', section_id: 'dashboard' }]);
      expect(result.available_mutations).toEqual([{ id: 'add-page', mutation_type: 'add-page' }]);
    });

    it('returns the pack manifest by default', async () => {
      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify({
        version: '1.0.0',
        generatedAt: '2026-04-08T00:00:00.000Z',
        scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
        review: null,
        mutations: [],
        sections: [],
        pages: [],
      }));

      process.chdir(testDir);
      const result = await handleTool('decantr_get_execution_pack', {}) as { version: string; scaffold: { id: string } };

      expect(result.version).toBe('1.0.0');
      expect(result.scaffold.id).toBe('scaffold');
    });

    it('returns a page pack together with parent section context when available', async () => {
      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify({
        version: '1.0.0',
        generatedAt: '2026-04-08T00:00:00.000Z',
        scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
        review: null,
        mutations: [],
        sections: [
          {
            id: 'dashboard',
            markdown: 'section-dashboard-pack.md',
            json: 'section-dashboard-pack.json',
            pageIds: ['overview'],
          },
        ],
        pages: [
          {
            id: 'overview',
            markdown: 'page-overview-pack.md',
            json: 'page-overview-pack.json',
            sectionId: 'dashboard',
            sectionRole: 'primary',
          },
        ],
      }));
      await writeFile(join(contextDir, 'page-overview-pack.md'), '# Page Pack\n\n- Page: overview\n');
      await writeFile(join(contextDir, 'page-overview-pack.json'), JSON.stringify({
        packType: 'page',
        data: { pageId: 'overview', path: '/' },
      }));
      await writeFile(join(contextDir, 'section-dashboard-pack.md'), '# Section Pack\n\n- Section: dashboard\n');
      await writeFile(join(contextDir, 'section-dashboard-pack.json'), JSON.stringify({
        packType: 'section',
        data: { sectionId: 'dashboard' },
      }));
      await writeFile(join(contextDir, 'section-dashboard.md'), '# Section Context\n');

      process.chdir(testDir);
      const result = await handleTool('decantr_get_page_context', { page_id: 'overview' }) as {
        page_id: string;
        section_id: string;
        section_role: string;
        execution_pack: { markdown: string; json: { packType: string } };
        section_execution_pack: { markdown: string; json: { packType: string } };
        section_context: string;
        manifest: { page: { id: string }; section: { id: string } };
      };

      expect(result.page_id).toBe('overview');
      expect(result.section_id).toBe('dashboard');
      expect(result.section_role).toBe('primary');
      expect(result.execution_pack.markdown).toContain('# Page Pack');
      expect(result.execution_pack.json.packType).toBe('page');
      expect(result.section_execution_pack.markdown).toContain('# Section Pack');
      expect(result.section_execution_pack.json.packType).toBe('section');
      expect(result.section_context).toContain('# Section Context');
      expect(result.manifest.page.id).toBe('overview');
      expect(result.manifest.section.id).toBe('dashboard');
    });

    it('returns a specific page pack in markdown and json', async () => {
      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify({
        version: '1.0.0',
        generatedAt: '2026-04-08T00:00:00.000Z',
        scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
        review: null,
        mutations: [],
        sections: [],
        pages: [
          {
            id: 'overview',
            markdown: 'page-overview-pack.md',
            json: 'page-overview-pack.json',
            sectionId: 'dashboard',
            sectionRole: 'primary',
          },
        ],
      }));
      await writeFile(join(contextDir, 'page-overview-pack.md'), '# Page Pack\n\n- Page: overview\n');
      await writeFile(join(contextDir, 'page-overview-pack.json'), JSON.stringify({
        packType: 'page',
        data: { pageId: 'overview', path: '/' },
      }));

      process.chdir(testDir);
      const result = await handleTool('decantr_get_execution_pack', {
        pack_type: 'page',
        id: 'overview',
      }) as {
        pack_type: string;
        id: string;
        markdown: string;
        json: { packType: string; data: { pageId: string } };
      };

      expect(result.pack_type).toBe('page');
      expect(result.id).toBe('overview');
      expect(result.markdown).toContain('# Page Pack');
      expect(result.json.packType).toBe('page');
      expect(result.json.data.pageId).toBe('overview');
    });

    it('returns a specific mutation pack in markdown and json', async () => {
      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify({
        version: '1.0.0',
        generatedAt: '2026-04-08T00:00:00.000Z',
        scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
        review: null,
        mutations: [
          {
            id: 'modify',
            markdown: 'mutation-modify-pack.md',
            json: 'mutation-modify-pack.json',
            mutationType: 'modify',
          },
        ],
        sections: [],
        pages: [],
      }));
      await writeFile(join(contextDir, 'mutation-modify-pack.md'), '# Mutation Pack\n\n- Operation: modify\n');
      await writeFile(join(contextDir, 'mutation-modify-pack.json'), JSON.stringify({
        packType: 'mutation',
        data: { mutationType: 'modify' },
      }));

      process.chdir(testDir);
      const result = await handleTool('decantr_get_execution_pack', {
        pack_type: 'mutation',
        id: 'modify',
      }) as {
        pack_type: string;
        id: string;
        markdown: string;
        json: { packType: string; data: { mutationType: string } };
      };

      expect(result.pack_type).toBe('mutation');
      expect(result.id).toBe('modify');
      expect(result.markdown).toContain('# Mutation Pack');
      expect(result.json.packType).toBe('mutation');
      expect(result.json.data.mutationType).toBe('modify');
    });

    it('returns the review pack in markdown and json', async () => {
      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await writeFile(join(contextDir, 'pack-manifest.json'), JSON.stringify({
        version: '1.0.0',
        generatedAt: '2026-04-08T00:00:00.000Z',
        scaffold: { id: 'scaffold', markdown: 'scaffold-pack.md', json: 'scaffold-pack.json' },
        review: { id: 'review', markdown: 'review-pack.md', json: 'review-pack.json' },
        mutations: [],
        sections: [],
        pages: [],
      }));
      await writeFile(join(contextDir, 'review-pack.md'), '# Review Pack\n\n- Review Type: app\n');
      await writeFile(join(contextDir, 'review-pack.json'), JSON.stringify({
        packType: 'review',
        data: { reviewType: 'app' },
      }));

      process.chdir(testDir);
      const result = await handleTool('decantr_get_execution_pack', {
        pack_type: 'review',
      }) as {
        pack_type: string;
        id: string;
        markdown: string;
        json: { packType: string; data: { reviewType: string } };
      };

      expect(result.pack_type).toBe('review');
      expect(result.id).toBe('review');
      expect(result.markdown).toContain('# Review Pack');
      expect(result.json.packType).toBe('review');
      expect(result.json.data.reviewType).toBe('app');
    });
  });

  describe('decantr_get_section_context', () => {
    it('includes compiled section pack data when available', async () => {
      const essencePath = join(testDir, 'decantr.essence.json');
      await writeFile(essencePath, JSON.stringify(makeV3Essence({
        blueprint: {
          features: ['auth'],
          sections: [
            {
              id: 'dashboard',
              role: 'primary',
              shell: 'sidebar-main',
              features: ['auth'],
              description: 'Primary dashboard section',
              pages: [
                { id: 'overview', layout: ['kpi-grid'] },
              ],
            },
          ],
        },
      })));

      const contextDir = join(testDir, '.decantr', 'context');
      await mkdir(contextDir, { recursive: true });
      await writeFile(join(contextDir, 'section-dashboard.md'), '# Section: dashboard\n');
      await writeFile(join(contextDir, 'section-dashboard-pack.md'), '# Section Pack\n\n- Section: dashboard\n');
      await writeFile(join(contextDir, 'section-dashboard-pack.json'), JSON.stringify({
        packType: 'section',
        data: { sectionId: 'dashboard' },
      }));

      process.chdir(testDir);
      const result = await handleTool('decantr_get_section_context', {
        section_id: 'dashboard',
      }) as {
        section_id: string;
        context: string;
        execution_pack: {
          markdown: string;
          json: { packType: string; data: { sectionId: string } };
        };
      };

      expect(result.section_id).toBe('dashboard');
      expect(result.context).toContain('# Section: dashboard');
      expect(result.execution_pack.markdown).toContain('# Section Pack');
      expect(result.execution_pack.json.packType).toBe('section');
      expect(result.execution_pack.json.data.sectionId).toBe('dashboard');
    });
  });
});
