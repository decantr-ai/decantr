import type {
  Essence,
  SectionedEssence,
  EssenceV3,
  EssenceFile,
  EssenceDNA,
  EssenceBlueprint,
  EssenceMeta,
  ThemeShape,
  DensityLevel,
  GuardMode,
} from './types.js';
import { isSimple, isSectioned, isV3 } from './types.js';

/**
 * Migrate a v2 EssenceFile to v3 format (DNA/Blueprint/Meta split).
 * If already v3, returns unchanged. SectionedEssence uses first section's theme.
 */
export function migrateV2ToV3(essence: EssenceFile): EssenceV3 {
  if (isV3(essence)) return essence;

  if (isSectioned(essence)) {
    return migrateSectionedToV3(essence);
  }

  if (isSimple(essence)) {
    return migrateSimpleToV3(essence);
  }

  throw new Error('Unknown EssenceFile type — cannot migrate');
}

function migrateSimpleToV3(essence: Essence): EssenceV3 {
  const dna = buildDNA(essence);
  const blueprint = buildBlueprintFromSimple(essence);
  const meta = buildMeta(essence);

  return {
    version: '3.0.0',
    dna,
    blueprint,
    meta,
    ...(essence._impression ? { _impression: essence._impression } : {}),
  };
}

function migrateSectionedToV3(essence: SectionedEssence): EssenceV3 {
  // Use first section's theme as the DNA theme (sectioned essences have per-section themes)
  const firstSection = essence.sections[0];
  const syntheticSimple: Partial<Essence> = {
    theme: firstSection.theme,
    density: essence.density,
    guard: essence.guard,
    accessibility: essence.accessibility,
  };

  const dna = buildDNA(syntheticSimple as Essence);
  // Override personality from the sectioned root
  dna.personality = essence.personality;

  // Flatten all sections' pages into the blueprint
  const pages = essence.sections.flatMap(section =>
    section.structure.map(page => ({
      id: page.id,
      shell_override: page.shell as string | null,
      layout: page.layout,
      ...(page.surface ? { surface: page.surface } : {}),
    }))
  );

  const allFeatures = [
    ...(essence.shared_features ?? []),
    ...essence.sections.flatMap(s => s.features ?? []),
  ];

  const blueprint: EssenceBlueprint = {
    shell: firstSection.structure[0]?.shell ?? 'top-nav-main',
    pages,
    features: [...new Set(allFeatures)],
  };

  const meta: EssenceMeta = {
    archetype: firstSection.archetype,
    target: essence.target,
    platform: essence.platform,
    guard: migrateGuard(essence.guard.mode),
  };

  return {
    version: '3.0.0',
    dna,
    blueprint,
    meta,
    ...(essence._impression ? { _impression: essence._impression } : {}),
  };
}

function buildDNA(essence: Essence): EssenceDNA {
  const shape = essence.theme.shape ?? 'rounded';
  const radiusBase = inferRadiusBase(shape);

  return {
    theme: {
      style: essence.theme.style,
      mode: essence.theme.mode,
      recipe: essence.theme.recipe,
      ...(essence.theme.shape ? { shape: essence.theme.shape } : {}),
    },
    spacing: {
      base_unit: 4,
      scale: 'linear',
      density: (essence.density?.level ?? 'comfortable') as DensityLevel,
      content_gap: essence.density?.content_gap ?? '4',
    },
    typography: {
      scale: 'modular',
      heading_weight: 600,
      body_weight: 400,
    },
    color: {
      palette: 'semantic',
      accent_count: 1,
      cvd_preference: essence.accessibility?.cvd_preference ?? 'auto',
    },
    radius: {
      philosophy: shape,
      base: radiusBase,
    },
    elevation: {
      system: 'layered',
      max_levels: 3,
    },
    motion: {
      preference: 'subtle',
      duration_scale: 1.0,
      reduce_motion: true,
    },
    accessibility: {
      wcag_level: essence.accessibility?.wcag_level ?? 'AA',
      focus_visible: true,
      skip_nav: true,
    },
    personality: essence.personality ?? ['professional'],
  };
}

function buildBlueprintFromSimple(essence: Essence): EssenceBlueprint {
  const defaultShell = essence.structure[0]?.shell ?? 'top-nav-main';

  return {
    shell: defaultShell,
    pages: essence.structure.map(page => ({
      id: page.id,
      ...(page.shell !== defaultShell ? { shell_override: page.shell } : {}),
      layout: page.layout,
      ...(page.surface ? { surface: page.surface } : {}),
    })),
    features: essence.features ?? [],
  };
}

function buildMeta(essence: Essence): EssenceMeta {
  return {
    archetype: essence.archetype,
    target: essence.target,
    platform: essence.platform,
    guard: migrateGuard(essence.guard.mode),
  };
}

function migrateGuard(mode: GuardMode): EssenceMeta['guard'] {
  switch (mode) {
    case 'strict':
      return { mode: 'strict', dna_enforcement: 'error', blueprint_enforcement: 'warn' };
    case 'guided':
      return { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'off' };
    case 'creative':
    default:
      return { mode: 'creative', dna_enforcement: 'off', blueprint_enforcement: 'off' };
  }
}

function inferRadiusBase(shape: ThemeShape | string): number {
  switch (shape) {
    case 'pill': return 12;
    case 'rounded': return 8;
    case 'sharp': return 2;
    default: return 8;
  }
}
