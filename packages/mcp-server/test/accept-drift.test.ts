import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { handleTool } from '../src/tools.js';
import type { EssenceV3 } from '@decantr/essence-spec';

function makeV3Essence(): EssenceV3 {
  return {
    version: '3.0.0',
    dna: {
      theme: { style: 'auradecantism', mode: 'dark', recipe: 'auradecantism', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '4' },
      typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
      color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'layered', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1.0, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
      personality: ['professional'],
    },
    blueprint: {
      shell: 'sidebar-main',
      pages: [
        { id: 'overview', layout: ['kpi-grid', 'chart-grid'] },
        { id: 'settings', layout: ['form-sections'] },
      ],
      features: ['auth', 'search'],
    },
    meta: {
      archetype: 'saas-dashboard',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  };
}

let testDir: string;

beforeEach(async () => {
  testDir = join(tmpdir(), `decantr-mcp-test-drift-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('decantr_accept_drift', () => {
  it('should reject when violations array is empty', async () => {
    const result = await handleTool('decantr_accept_drift', {
      violations: [],
      resolution: 'accept',
    }) as { error: string };
    expect(result.error).toBeDefined();
  });

  it('should reject with invalid resolution', async () => {
    const result = await handleTool('decantr_accept_drift', {
      violations: [{ rule: 'style' }],
      resolution: 'invalid',
    }) as { error: string };
    expect(result.error).toBeDefined();
  });

  it('should require confirm_dna for DNA violations', async () => {
    const result = await handleTool('decantr_accept_drift', {
      violations: [{ rule: 'style', details: 'glassmorphism' }],
      resolution: 'accept',
    }) as { error: string; requires_confirmation: boolean };
    expect(result.error).toBeDefined();
    expect(result.requires_confirmation).toBe(true);
  });

  it('should allow reject without confirm_dna', async () => {
    const result = await handleTool('decantr_accept_drift', {
      violations: [{ rule: 'style', details: 'glassmorphism' }],
      resolution: 'reject',
    }) as { status: string };
    expect(result.status).toBe('rejected');
  });

  it('should accept blueprint violations and update essence', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = await handleTool('decantr_accept_drift', {
      violations: [{ rule: 'structure', page_id: 'billing' }],
      resolution: 'accept',
      path: essencePath,
    }) as { status: string; path: string };

    expect(result.status).toBe('accepted');

    // Verify the page was added
    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    const billingPage = updated.blueprint.pages.find(p => p.id === 'billing');
    expect(billingPage).toBeDefined();
  });

  it('should accept DNA violations with confirm_dna', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = await handleTool('decantr_accept_drift', {
      violations: [{ rule: 'style', details: 'glassmorphism' }],
      resolution: 'accept',
      path: essencePath,
      confirm_dna: true,
    }) as { status: string };

    expect(result.status).toBe('accepted');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    expect(updated.dna.theme.style).toBe('glassmorphism');
  });

  it('should defer violations to drift log', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = await handleTool('decantr_accept_drift', {
      violations: [
        { rule: 'layout', page_id: 'overview', details: 'reordered patterns' },
        { rule: 'page-exists', page_id: 'billing' },
      ],
      resolution: 'defer',
      path: essencePath,
    }) as { status: string; total_deferred: number; log_path: string };

    expect(result.status).toBe('deferred');
    expect(result.total_deferred).toBe(2);

    // Read the drift log
    const logRaw = await readFile(result.log_path, 'utf-8');
    const log = JSON.parse(logRaw);
    expect(log).toHaveLength(2);
    expect(log[0].rule).toBe('layout');
    expect(log[0].resolution).toBe('deferred');
    expect(log[0].timestamp).toBeDefined();
  });

  it('should accept_scoped with scope parameter', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = await handleTool('decantr_accept_drift', {
      violations: [{ rule: 'structure', page_id: 'billing' }],
      resolution: 'accept_scoped',
      scope: 'overview',
      path: essencePath,
    }) as { status: string; scope: string };

    expect(result.status).toBe('accepted_scoped');
    expect(result.scope).toBe('overview');
  });
});
