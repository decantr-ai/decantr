import type { Essence, SectionedEssence, EssenceFile, EssenceV3, StructurePage, GuardMode } from './types.js';

export function normalizeEssence(input: Record<string, unknown>): EssenceFile {
  // v3: version-based detection only (no structural fallback to avoid false positives)
  if (input.version === '3.0.0') {
    return input as unknown as EssenceV3;
  }

  // Detect v2: has 'theme' and 'platform' (normalized terms)
  if (input.theme && input.platform) {
    return input as unknown as EssenceFile;
  }

  if (input.sections) {
    return normalizeSectioned(input);
  }

  return normalizeSimple(input);
}

function normalizeSimple(v1: Record<string, unknown>): Essence {
  // v1 field names (wine terms) → v2 normalized names:
  //   vintage → theme, vessel → platform, clarity → density,
  //   cork → guard, terroir/vignette → archetype, tannins → features,
  //   carafe → shell, blend → layout, character → personality
  const vintage = v1.vintage as Record<string, string> | undefined;
  const vessel = v1.vessel as Record<string, string> | undefined;
  const clarity = v1.clarity as Record<string, string> | undefined;
  const cork = v1.cork as Record<string, unknown> | undefined;
  const structure = v1.structure as Array<Record<string, unknown>> | undefined;

  return {
    version: '2.0.0',
    archetype: (v1.terroir ?? v1.vignette ?? v1.archetype) as string,
    theme: {
      style: vintage?.style ?? '',
      mode: (vintage?.mode ?? 'dark') as 'light' | 'dark' | 'auto',
      recipe: vintage?.recipe ?? '',
      ...(vintage?.shape ? { shape: vintage.shape as 'sharp' | 'rounded' | 'pill' } : {}),
    },
    // Accept both old 'character' and new 'personality' field names
    personality: (v1.character ?? v1.personality) as string[],
    platform: {
      type: (vessel?.type ?? 'spa') as 'spa' | 'ssr' | 'static',
      routing: (vessel?.routing ?? 'hash') as 'hash' | 'history',
    },
    structure: (structure ?? []).map(normalizeStructurePage),
    features: (v1.tannins ?? v1.features ?? []) as string[],
    density: {
      level: (clarity?.density ?? 'comfortable') as 'compact' | 'comfortable' | 'spacious',
      content_gap: stripGapPrefix(clarity?.content_gap ?? '4'),
    },
    guard: normalizeGuard(cork),
    target: (v1.target as string) ?? 'decantr',
    ...(v1._impression ? { _impression: v1._impression as Essence['_impression'] } : {}),
  };
}

function normalizeSectioned(v1: Record<string, unknown>): SectionedEssence {
  // v1 field names (wine terms) → v2 normalized names:
  //   vessel → platform, clarity → density, cork → guard,
  //   terroir/vignette → archetype, tannins → features,
  //   shared_tannins → shared_features, character → personality
  const vessel = v1.vessel as Record<string, string> | undefined;
  const clarity = v1.clarity as Record<string, string> | undefined;
  const cork = v1.cork as Record<string, unknown> | undefined;
  const sections = v1.sections as Array<Record<string, unknown>>;

  return {
    version: '2.0.0',
    platform: {
      type: (vessel?.type ?? 'spa') as 'spa' | 'ssr' | 'static',
      routing: (vessel?.routing ?? 'hash') as 'hash' | 'history',
    },
    // Accept both old 'character' and new 'personality' field names
    personality: (v1.character ?? v1.personality) as string[],
    sections: sections.map(section => ({
      id: section.id as string,
      path: section.path as string,
      archetype: (section.terroir ?? section.vignette ?? section.archetype) as string,
      theme: {
        style: (section.vintage as Record<string, string>)?.style ?? '',
        mode: ((section.vintage as Record<string, string>)?.mode ?? 'dark') as 'light' | 'dark' | 'auto',
        recipe: (section.vintage as Record<string, string>)?.recipe ?? '',
      },
      structure: ((section.structure as Array<Record<string, unknown>>) ?? []).map(normalizeStructurePage),
      ...(section.tannins ? { features: section.tannins as string[] } : {}),
    })),
    ...(v1.shared_tannins ? { shared_features: v1.shared_tannins as string[] } : {}),
    density: {
      level: (clarity?.density ?? 'comfortable') as 'compact' | 'comfortable' | 'spacious',
      content_gap: stripGapPrefix(clarity?.content_gap ?? '4'),
    },
    guard: normalizeGuard(cork),
    target: (v1.target as string) ?? 'decantr',
  };
}

function normalizeStructurePage(page: Record<string, unknown>): StructurePage {
  // Accept v1 wine terms (carafe → shell, blend → layout) for backward compatibility
  return {
    id: page.id as string,
    shell: (page.carafe ?? page.shell) as string,
    layout: (page.blend ?? page.layout) as StructurePage['layout'],
    ...(page.surface ? { surface: page.surface as string } : {}),
  };
}

// Accept v1 'cork' object and normalize to v2 'guard'
function normalizeGuard(cork: Record<string, unknown> | undefined): Essence['guard'] {
  if (!cork) return { mode: 'creative' };

  const modeMap: Record<string, GuardMode> = {
    creative: 'creative',
    maintenance: 'strict',
    strict: 'strict',
    guided: 'guided',
  };

  return {
    ...(cork.enforce_style !== undefined ? { enforce_style: cork.enforce_style as boolean } : {}),
    ...(cork.enforce_recipe !== undefined ? { enforce_recipe: cork.enforce_recipe as boolean } : {}),
    mode: modeMap[(cork.mode as string) ?? 'creative'] ?? 'creative',
  };
}

function stripGapPrefix(gap: string): string {
  const match = gap.match(/^_gap(\d+)$/);
  return match ? match[1] : gap;
}
