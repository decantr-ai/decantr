import { describe, it, expect } from 'vitest';
import { migrateV2ToV3, migrateV30ToV31 } from '../src/migrate.js';
import { isV3 } from '../src/types.js';
import type { EssenceV3 } from '../src/types.js';
import { validateEssence } from '../src/validate.js';
import { VALID_V2_SIMPLE, VALID_V2_SECTIONED, VALID_V3 } from './fixtures.js';

describe('migrateV2ToV3', () => {
  it('produces valid v3 from simple v2', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(isV3(v3)).toBe(true);
    expect(v3.version).toBe('3.0.0');

    const validation = validateEssence(v3);
    expect(validation.valid).toBe(true);
  });

  it('maps theme fields to dna.theme', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.dna.theme.id).toBe('auradecantism');
    expect(v3.dna.theme.mode).toBe('dark');
    expect(v3.dna.theme.shape).toBe('rounded');
  });

  it('maps density to dna.spacing', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.dna.spacing.density).toBe('comfortable');
    expect(v3.dna.spacing.content_gap).toBe('4');
  });

  it('maps structure to blueprint.pages', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.blueprint.pages).toHaveLength(1);
    expect(v3.blueprint.pages[0].id).toBe('overview');
    expect(v3.blueprint.pages[0].layout).toEqual(['kpi-grid', 'chart-grid']);
  });

  it('maps features to blueprint.features', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.blueprint.features).toEqual(['auth']);
  });

  it('maps archetype, target, platform to meta', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.meta.archetype).toBe('saas-dashboard');
    expect(v3.meta.target).toBe('react');
    expect(v3.meta.platform).toEqual({ type: 'spa', routing: 'hash' });
  });

  it('maps strict guard mode to correct v3 enforcement', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.meta.guard.mode).toBe('strict');
    expect(v3.meta.guard.dna_enforcement).toBe('error');
    expect(v3.meta.guard.blueprint_enforcement).toBe('warn');
  });

  it('maps guided guard mode correctly', () => {
    const guided = { ...VALID_V2_SIMPLE, guard: { mode: 'guided' as const } };
    const v3 = migrateV2ToV3(guided);
    expect(v3.meta.guard.mode).toBe('guided');
    expect(v3.meta.guard.dna_enforcement).toBe('error');
    expect(v3.meta.guard.blueprint_enforcement).toBe('off');
  });

  it('maps creative guard mode correctly', () => {
    const creative = { ...VALID_V2_SIMPLE, guard: { mode: 'creative' as const } };
    const v3 = migrateV2ToV3(creative);
    expect(v3.meta.guard.mode).toBe('creative');
    expect(v3.meta.guard.dna_enforcement).toBe('off');
    expect(v3.meta.guard.blueprint_enforcement).toBe('off');
  });

  it('infers radius from theme shape', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.dna.radius.philosophy).toBe('rounded');
    expect(v3.dna.radius.base).toBe(8);
  });

  it('infers radius for pill shape', () => {
    const pill = { ...VALID_V2_SIMPLE, theme: { ...VALID_V2_SIMPLE.theme, shape: 'pill' as const } };
    const v3 = migrateV2ToV3(pill);
    expect(v3.dna.radius.base).toBe(12);
  });

  it('preserves personality', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.dna.personality).toEqual(['professional', 'data-rich']);
  });

  it('provides sensible defaults for new DNA fields', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.dna.typography.scale).toBe('modular');
    expect(v3.dna.color.palette).toBe('semantic');
    expect(v3.dna.elevation.system).toBe('layered');
    expect(v3.dna.motion.preference).toBe('subtle');
  });

  it('preserves _impression if present', () => {
    const withImpression = {
      ...VALID_V2_SIMPLE,
      _impression: { vibe: ['modern'], references: [], density_intent: 'comfortable', layout_intent: 'sidebar-main', novel_elements: [] },
    };
    const v3 = migrateV2ToV3(withImpression);
    expect(v3._impression?.vibe).toEqual(['modern']);
  });

  it('returns v3 unchanged', () => {
    const result = migrateV2ToV3(VALID_V3);
    expect(result).toEqual(VALID_V3);
  });

  it('migrates sectioned essence using first section theme', () => {
    const v3 = migrateV2ToV3(VALID_V2_SECTIONED);
    expect(isV3(v3)).toBe(true);
    expect(v3.dna.theme.id).toBe('glassmorphism');
    expect(v3.meta.archetype).toBe('portfolio');
    expect(v3.blueprint.pages).toHaveLength(1);
    expect(v3.blueprint.pages[0].id).toBe('home');
  });

  it('deduplicates features from sectioned essence', () => {
    const sectioned = {
      ...VALID_V2_SECTIONED,
      shared_features: ['auth'],
      sections: [{
        ...VALID_V2_SECTIONED.sections[0],
        features: ['auth', 'analytics'],
      }],
    };
    const v3 = migrateV2ToV3(sectioned);
    expect(v3.blueprint.features).toEqual(['auth', 'analytics']);
  });

  it('sets shell from first page when migrating', () => {
    const v3 = migrateV2ToV3(VALID_V2_SIMPLE);
    expect(v3.blueprint.shell).toBe('sidebar-main');
  });

  it('uses shell_override for pages with different shells', () => {
    const multiShell = {
      ...VALID_V2_SIMPLE,
      structure: [
        { id: 'main', shell: 'sidebar-main', layout: ['kpi-grid'] },
        { id: 'landing', shell: 'full-bleed', layout: ['hero'] },
      ],
    };
    const v3 = migrateV2ToV3(multiShell);
    expect(v3.blueprint.shell).toBe('sidebar-main');
    expect(v3.blueprint.pages[0].shell_override).toBeUndefined();
    expect(v3.blueprint.pages[1].shell_override).toBe('full-bleed');
  });
});

describe('migrateV30ToV31', () => {
  it('wraps flat pages into a single section', () => {
    const v30: EssenceV3 = {
      version: '3.0.0',
      dna: VALID_V3.dna,
      blueprint: {
        shell: 'sidebar-main',
        pages: [
          { id: 'main', layout: ['kpi-grid', 'chart-grid'] },
          { id: 'news', layout: ['filter-bar', 'post-list'] },
        ],
        features: ['auth', 'realtime-data'],
      },
      meta: {
        archetype: 'saas-dashboard',
        target: 'react',
        platform: { type: 'spa', routing: 'hash' },
        guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      },
    };

    const v31 = migrateV30ToV31(v30);

    expect(v31.version).toBe('3.1.0');
    expect(v31.blueprint.sections).toHaveLength(1);
    expect(v31.blueprint.sections![0].id).toBe('saas-dashboard');
    expect(v31.blueprint.sections![0].role).toBe('primary');
    expect(v31.blueprint.sections![0].shell).toBe('sidebar-main');
    expect(v31.blueprint.sections![0].features).toEqual(['auth', 'realtime-data']);
    expect(v31.blueprint.sections![0].pages).toEqual([
      { id: 'main', layout: ['kpi-grid', 'chart-grid'] },
      { id: 'news', layout: ['filter-bar', 'post-list'] },
    ]);
    expect(v31.blueprint.pages).toBeUndefined();
    expect(v31.blueprint.routes).toEqual({});
  });

  it('preserves existing V3.1 essence unchanged', () => {
    const v31: EssenceV3 = {
      version: '3.1.0',
      dna: VALID_V3.dna,
      blueprint: {
        sections: [
          {
            id: 'dashboard',
            role: 'primary',
            shell: 'sidebar-main',
            features: ['auth'],
            description: 'Main dashboard section',
            pages: [{ id: 'overview', layout: ['kpi-grid'] }],
          },
        ],
        features: ['auth'],
        routes: { '/overview': { section: 'dashboard', page: 'overview' } },
      },
      meta: {
        archetype: 'saas-dashboard',
        target: 'react',
        platform: { type: 'spa', routing: 'hash' },
        guard: { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
      },
    };

    const result = migrateV30ToV31(v31);
    expect(result).toEqual(v31);
  });
});
