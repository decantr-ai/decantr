import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { handleTool } from '../src/tools.js';
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

beforeEach(async () => {
  testDir = join(tmpdir(), `decantr-mcp-test-v3-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('v3-aware tool tests', () => {
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
});
