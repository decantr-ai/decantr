import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { EssenceV3 } from '@decantr/essence-spec';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleTool } from '../src/tools.js';

function makeV3Essence(): EssenceV3 {
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

function makeV2Essence() {
  return {
    version: '2.0.0',
    archetype: 'saas-dashboard',
    theme: { id: 'auradecantism', mode: 'dark', shape: 'rounded' },
    personality: ['professional'],
    platform: { type: 'spa', routing: 'hash' },
    structure: [{ id: 'overview', shell: 'sidebar-main', layout: ['kpi-grid', 'chart-grid'] }],
    features: ['auth'],
    density: { level: 'comfortable', content_gap: '4' },
    guard: { enforce_style: true, mode: 'strict' },
    target: 'react',
  };
}

let testDir: string;

beforeEach(async () => {
  testDir = join(
    tmpdir(),
    `decantr-mcp-test-update-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await mkdir(testDir, { recursive: true });
});

afterEach(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe('decantr_update_essence', () => {
  it('should add a page', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'add_page',
      payload: { id: 'billing', layout: ['form-sections', 'data-table'] },
      path: essencePath,
    })) as { status: string; summary: string };

    expect(result.status).toBe('updated');
    expect(result.summary).toContain('billing');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    const billing = updated.blueprint.pages.find((p) => p.id === 'billing');
    expect(billing).toBeDefined();
    expect(billing?.layout).toEqual(['form-sections', 'data-table']);
  });

  it('should error when adding duplicate page', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'add_page',
      payload: { id: 'overview' },
      path: essencePath,
    })) as { error: string };

    expect(result.error).toContain('already exists');
  });

  it('should remove a page', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'remove_page',
      payload: { id: 'settings' },
      path: essencePath,
    })) as { status: string };

    expect(result.status).toBe('updated');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    expect(updated.blueprint.pages.find((p) => p.id === 'settings')).toBeUndefined();
    expect(updated.blueprint.pages).toHaveLength(1);
  });

  it('should error when removing nonexistent page', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'remove_page',
      payload: { id: 'nonexistent' },
      path: essencePath,
    })) as { error: string };

    expect(result.error).toContain('not found');
  });

  it('should update page layout', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const newLayout = ['hero', 'kpi-grid', 'activity-feed'];
    const result = (await handleTool('decantr_update_essence', {
      operation: 'update_page_layout',
      payload: { id: 'overview', layout: newLayout },
      path: essencePath,
    })) as { status: string };

    expect(result.status).toBe('updated');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    const overview = updated.blueprint.pages.find((p) => p.id === 'overview');
    expect(overview?.layout).toEqual(newLayout);
  });

  it('should update DNA fields', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'update_dna',
      payload: { theme: { id: 'glassmorphism' }, personality: ['playful', 'bold'] },
      path: essencePath,
    })) as { status: string };

    expect(result.status).toBe('updated');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    expect(updated.dna.theme.id).toBe('glassmorphism');
    // Should merge, keeping other theme fields
    expect(updated.dna.theme.mode).toBe('dark');
    expect(updated.dna.personality).toEqual(['playful', 'bold']);
  });

  it('should add a feature', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'add_feature',
      payload: { feature: 'payments' },
      path: essencePath,
    })) as { status: string };

    expect(result.status).toBe('updated');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    expect(updated.blueprint.features).toContain('payments');
    expect(updated.blueprint.features).toHaveLength(3);
  });

  it('should remove a feature', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV3Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'remove_feature',
      payload: { feature: 'search' },
      path: essencePath,
    })) as { status: string };

    expect(result.status).toBe('updated');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    expect(updated.blueprint.features).not.toContain('search');
    expect(updated.blueprint.features).toHaveLength(1);
  });

  it('should auto-migrate v2 to v3 on mutation', async () => {
    const essencePath = join(testDir, 'decantr.essence.json');
    await writeFile(essencePath, JSON.stringify(makeV2Essence()));

    const result = (await handleTool('decantr_update_essence', {
      operation: 'add_feature',
      payload: { feature: 'payments' },
      path: essencePath,
    })) as { status: string };

    expect(result.status).toBe('updated');

    const updated = JSON.parse(await readFile(essencePath, 'utf-8')) as EssenceV3;
    expect(updated.version).toBe('3.0.0');
    expect(updated.dna).toBeDefined();
    expect(updated.blueprint.features).toContain('payments');
  });

  it('should reject invalid operation', async () => {
    const result = (await handleTool('decantr_update_essence', {
      operation: 'invalid_op',
      payload: {},
    })) as { error: string };

    expect(result.error).toContain('Invalid operation');
  });

  it('should reject missing payload', async () => {
    const result = (await handleTool('decantr_update_essence', {
      operation: 'add_page',
    })) as { error: string };

    expect(result.error).toContain('payload');
  });
});
