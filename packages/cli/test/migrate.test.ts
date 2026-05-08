import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrateEssenceFile } from '../src/commands/migrate.js';

describe('migrateEssenceFile', () => {
  const testDir = join(process.cwd(), 'test-migrate-project');
  const essencePath = join(testDir, 'decantr.essence.json');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  const validV2Essence = {
    version: '2.0.0',
    archetype: 'dashboard',
    theme: {
      id: 'luminarum',
      mode: 'dark',
      shape: 'rounded',
    },
    personality: ['professional', 'clean'],
    platform: { type: 'spa', routing: 'hash' },
    structure: [
      { id: 'home', shell: 'sidebar-main', layout: ['hero', 'kpi-grid'] },
      { id: 'settings', shell: 'sidebar-main', layout: ['form'] },
    ],
    features: ['auth', 'search'],
    guard: { enforce_style: true, mode: 'guided' },
    density: { level: 'comfortable', content_gap: '_gap4' },
    target: 'react',
  };

  it('migrates a valid V2 essence to V4 format', () => {
    writeFileSync(essencePath, JSON.stringify(validV2Essence, null, 2));

    const result = migrateEssenceFile(essencePath);

    expect(result.success).toBe(true);
    expect(result.alreadyV4).toBeUndefined();
    expect(result.backupPath).toBeDefined();

    // Check the migrated file
    const migrated = JSON.parse(readFileSync(essencePath, 'utf-8'));
    expect(migrated.version).toBe('4.0.0');
    expect(migrated.dna).toBeDefined();
    expect(migrated.blueprint).toBeDefined();
    expect(migrated.meta).toBeDefined();
    expect(migrated.dna.theme.id).toBe('luminarum');
    expect(migrated.blueprint.sections).toHaveLength(1);
    expect(migrated.blueprint.sections[0].pages).toHaveLength(2);
    expect(migrated.meta.archetype).toBe('dashboard');
  });

  it('creates a .pre-v4.backup.json backup file', () => {
    writeFileSync(essencePath, JSON.stringify(validV2Essence, null, 2));

    const result = migrateEssenceFile(essencePath);

    expect(result.success).toBe(true);
    const backupPath = essencePath.replace(/\.json$/, '.pre-v4.backup.json');
    expect(existsSync(backupPath)).toBe(true);

    // Backup should contain the original v2 content
    const backup = JSON.parse(readFileSync(backupPath, 'utf-8'));
    expect(backup.version).toBe('2.0.0');
    expect(backup.archetype).toBe('dashboard');
  });

  it('returns alreadyV4 for V4 essence files', () => {
    const v4Essence = {
      version: '4.0.0',
      dna: {
        theme: { id: 'test', mode: 'dark' },
        spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
        typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
        color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
        radius: { philosophy: 'rounded', base: 8 },
        elevation: { system: 'layered', max_levels: 3 },
        motion: { preference: 'subtle', duration_scale: 1.0, reduce_motion: true },
        accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
        personality: ['clean'],
      },
      blueprint: {
        shell: 'sidebar-main',
        sections: [
          {
            id: 'custom',
            role: 'primary',
            shell: 'sidebar-main',
            features: [],
            description: 'Custom section',
            pages: [{ id: 'home', route: '/', layout: ['hero'] }],
          },
        ],
        features: [],
        routes: { '/': { section: 'custom', page: 'home' } },
      },
      meta: {
        archetype: 'custom',
        target: 'react',
        platform: { type: 'spa', routing: 'hash' },
        guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'off' },
      },
    };
    writeFileSync(essencePath, JSON.stringify(v4Essence, null, 2));

    const result = migrateEssenceFile(essencePath);

    expect(result.success).toBe(true);
    expect(result.alreadyV4).toBe(true);
  });

  it('returns error for non-existent file', () => {
    const result = migrateEssenceFile(join(testDir, 'nonexistent.json'));

    expect(result.success).toBe(false);
    expect(result.error).toContain('File not found');
  });

  it('returns error for invalid JSON', () => {
    writeFileSync(essencePath, 'not valid json {{{');

    const result = migrateEssenceFile(essencePath);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid JSON');
  });

  it('preserves structure fields correctly in V4', () => {
    writeFileSync(essencePath, JSON.stringify(validV2Essence, null, 2));

    migrateEssenceFile(essencePath);

    const migrated = JSON.parse(readFileSync(essencePath, 'utf-8'));

    // DNA should have all required axiom sections
    expect(migrated.dna.spacing).toBeDefined();
    expect(migrated.dna.typography).toBeDefined();
    expect(migrated.dna.color).toBeDefined();
    expect(migrated.dna.radius).toBeDefined();
    expect(migrated.dna.elevation).toBeDefined();
    expect(migrated.dna.motion).toBeDefined();
    expect(migrated.dna.accessibility).toBeDefined();
    expect(migrated.dna.personality).toEqual(['professional', 'clean']);

    // Blueprint should map structure correctly
    expect(migrated.blueprint.features).toEqual(['auth', 'search']);
    expect(migrated.blueprint.sections[0]).toMatchObject({
      id: 'dashboard',
      role: 'primary',
      shell: 'sidebar-main',
    });
    expect(migrated.blueprint.routes).toMatchObject({
      '/': { section: 'dashboard', page: 'home' },
      '/settings': { section: 'dashboard', page: 'settings' },
    });

    // Meta should carry over archetype, target, platform
    expect(migrated.meta.target).toBe('react');
    expect(migrated.meta.platform.type).toBe('spa');
    expect(migrated.meta.guard.mode).toBe('guided');
    expect(migrated.meta.guard.dna_enforcement).toBe('error');
  });

  it('migrates guard modes correctly', () => {
    // Test strict mode
    const strictEssence = { ...validV2Essence, guard: { ...validV2Essence.guard, mode: 'strict' } };
    writeFileSync(essencePath, JSON.stringify(strictEssence, null, 2));
    migrateEssenceFile(essencePath);
    let migrated = JSON.parse(readFileSync(essencePath, 'utf-8'));
    expect(migrated.meta.guard.mode).toBe('strict');
    expect(migrated.meta.guard.dna_enforcement).toBe('error');
    expect(migrated.meta.guard.blueprint_enforcement).toBe('warn');

    // Test creative mode
    const creativeEssence = {
      ...validV2Essence,
      guard: { ...validV2Essence.guard, mode: 'creative' },
    };
    writeFileSync(essencePath, JSON.stringify(creativeEssence, null, 2));
    migrateEssenceFile(essencePath);
    migrated = JSON.parse(readFileSync(essencePath, 'utf-8'));
    expect(migrated.meta.guard.mode).toBe('creative');
    expect(migrated.meta.guard.dna_enforcement).toBe('off');
    expect(migrated.meta.guard.blueprint_enforcement).toBe('off');
  });
});
