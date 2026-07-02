import type {
  DensityLevel,
  Essence,
  EssenceBlueprint,
  EssenceDNA,
  EssenceMeta,
  EssenceSection,
  EssenceV4,
  GuardMode,
  LegacyEssenceV3,
  SectionedEssence,
  ThemeShape,
} from './types.js';
import { isLegacyV3, isSectioned, isSimple, isV4 } from './types.js';

/**
 * Explicit legacy-to-v4 migration path used by `decantr migrate --to v4`.
 * Active Decantr V2 commands do not call this implicitly.
 */
export function migrateToV4(input: unknown): EssenceV4 {
  if (isV4(input)) return normalizeV4(input);
  if (isLegacyV3(input)) return migrateLegacyV3ToV4(input);
  if (isSectioned(input)) return migrateSectionedToV4(input);
  if (isSimple(input)) return migrateSimpleToV4(input);

  throw new Error('Unknown essence format. Only Essence v2, v3.0, v3.1, and v4 can migrate to v4.');
}

function migrateSimpleToV4(essence: Essence): EssenceV4 {
  const dna = buildDNA(essence);
  const defaultShell = essence.structure[0]?.shell ?? 'top-nav-main';
  const pages = essence.structure.map((page, index) => ({
    id: page.id,
    route: page.id === 'home' || index === 0 ? '/' : `/${page.id}`,
    ...(page.shell !== defaultShell ? { shell_override: page.shell } : {}),
    layout: page.layout,
    ...(page.surface ? { surface: page.surface } : {}),
  }));
  const section: EssenceSection = {
    id: essence.archetype,
    role: 'primary',
    shell: defaultShell,
    features: essence.features ?? [],
    description: `${essence.archetype} primary section`,
    pages,
  };

  return {
    version: '4.0.0',
    dna,
    blueprint: buildSectionedBlueprint([section], essence.features ?? []),
    meta: buildMeta(essence),
    ...(essence._impression ? { _impression: essence._impression } : {}),
  };
}

function migrateSectionedToV4(essence: SectionedEssence): EssenceV4 {
  const firstSection = essence.sections[0];
  if (!firstSection) {
    throw new Error('Cannot migrate a sectioned essence with no sections.');
  }

  const syntheticSimple: Partial<Essence> = {
    theme: firstSection.theme,
    density: essence.density,
    guard: essence.guard,
    accessibility: essence.accessibility,
    personality: essence.personality,
  };

  const sections: EssenceSection[] = essence.sections.map((section) => {
    const defaultShell = section.structure[0]?.shell ?? 'top-nav-main';
    return {
      id: section.id,
      role: 'primary',
      shell: defaultShell,
      features: section.features ?? [],
      description: `${section.archetype} section`,
      pages: section.structure.map((page, index) => ({
        id: page.id,
        route:
          index === 0 && section.path
            ? section.path
            : `${section.path}/${page.id}`.replace(/\/+/g, '/'),
        ...(page.shell !== defaultShell ? { shell_override: page.shell } : {}),
        layout: page.layout,
        ...(page.surface ? { surface: page.surface } : {}),
      })),
    };
  });

  const features = [
    ...(essence.shared_features ?? []),
    ...essence.sections.flatMap((section) => section.features ?? []),
  ];

  return {
    version: '4.0.0',
    dna: buildDNA(syntheticSimple as Essence),
    blueprint: buildSectionedBlueprint(sections, [...new Set(features)]),
    meta: {
      archetype: firstSection.archetype,
      target: essence.target,
      platform: essence.platform,
      guard: migrateGuard(essence.guard.mode),
    },
    ...(essence._impression ? { _impression: essence._impression } : {}),
  };
}

function migrateLegacyV3ToV4(essence: LegacyEssenceV3): EssenceV4 {
  const sections =
    essence.blueprint.sections && essence.blueprint.sections.length > 0
      ? essence.blueprint.sections
      : [
          {
            id: essence.meta.archetype,
            role: 'primary' as const,
            shell: essence.blueprint.shell ?? 'top-nav-main',
            features: essence.blueprint.features,
            description: `${essence.meta.archetype} primary section`,
            pages: essence.blueprint.pages ?? [],
          },
        ];

  return normalizeV4({
    ...essence,
    version: '4.0.0',
    blueprint: buildSectionedBlueprint(
      sections,
      essence.blueprint.features,
      essence.blueprint.routes,
    ),
  });
}

function normalizeV4(essence: EssenceV4): EssenceV4 {
  return {
    ...essence,
    version: '4.0.0',
    blueprint: buildSectionedBlueprint(
      essence.blueprint.sections,
      essence.blueprint.features,
      essence.blueprint.routes,
      essence.blueprint.shell,
    ),
  };
}

function buildSectionedBlueprint(
  sections: EssenceSection[],
  features: string[],
  existingRoutes?: EssenceBlueprint['routes'],
  shell?: string,
): EssenceBlueprint {
  const routes: NonNullable<EssenceBlueprint['routes']> = { ...(existingRoutes ?? {}) };

  for (const section of sections) {
    for (const page of section.pages) {
      if (!page.route || routes[page.route]) continue;
      routes[page.route] = { section: section.id, page: page.id };
    }
  }

  return {
    ...(shell ? { shell } : {}),
    sections,
    features: [...new Set(features)],
    routes,
  };
}

function buildDNA(essence: Essence): EssenceDNA {
  const shape = essence.theme.shape ?? 'rounded';

  return {
    theme: {
      id: essence.theme.id,
      mode: essence.theme.mode,
      ...(essence.theme.shape ? { shape: essence.theme.shape } : {}),
    },
    spacing: {
      base_unit: 4,
      scale: 'linear',
      density: (essence.density?.level ?? 'comfortable') as DensityLevel,
      content_gap: essence.density?.content_gap ?? '_gap4',
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
      base: inferRadiusBase(shape),
    },
    elevation: {
      system: 'layered',
      max_levels: 3,
    },
    motion: {
      preference: 'subtle',
      duration_scale: 1,
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
    default:
      return { mode: 'creative', dna_enforcement: 'off', blueprint_enforcement: 'off' };
  }
}

function inferRadiusBase(shape: ThemeShape | string): number {
  switch (shape) {
    case 'pill':
      return 12;
    case 'rounded':
      return 8;
    case 'sharp':
      return 2;
    default:
      return 8;
  }
}
