import type {
  EssenceFile, Essence, SectionedEssence, StructurePage,
  LayoutItem, PatternRef, ColumnLayout,
} from '@decantr/essence-spec';
import { isSimple, isSectioned, computeDensity } from '@decantr/essence-spec';
import type { ContentResolver, Pattern, Recipe, ResolvedPreset } from '@decantr/registry';
import { resolvePatternPreset, detectWirings } from '@decantr/registry';
import type {
  IRWiring, IRWiringSignal, IRShellConfig, IRNavItem,
  IRRecipeDecoration, IRTheme, IRRoute, IRVisualEffect,
} from './types.js';

export interface ResolvedPage {
  page: StructurePage;
  patterns: Map<string, { pattern: Pattern; preset: ResolvedPreset }>;
  wiring: IRWiring | null;
}

export interface ResolvedEssence {
  essence: EssenceFile;
  pages: ResolvedPage[];
  recipe: Recipe | null;
  density: { gap: string; level: string };
  theme: IRTheme;
  shell: IRShellConfig;
  routes: IRRoute[];
}

// ─── Icon Mapping ─────────────────────────────────────────────

const NAV_ICONS: Record<string, string> = {
  overview: 'layout-dashboard',
  dashboard: 'layout-dashboard',
  home: 'home',
  analytics: 'bar-chart-3',
  settings: 'settings',
  users: 'users',
  billing: 'credit-card',
  reports: 'file-text',
  catalog: 'grid',
  products: 'package',
  orders: 'shopping-cart',
  messages: 'message-square',
  notifications: 'bell',
  activity: 'activity',
  search: 'search',
  profile: 'user',
  team: 'users',
  integrations: 'puzzle',
  api: 'code',
  docs: 'book-open',
  help: 'help-circle',
  projects: 'folder',
  workflows: 'git-branch',
  monitoring: 'monitor',
  security: 'shield',
  storage: 'database',
  deployments: 'rocket',
  logs: 'scroll-text',
};

// ─── Core styles that don't need explicit addon registration ──

const CORE_STYLES = new Set(['auradecantism']);

// ─── Helpers ──────────────────────────────────────────────────

function isPatternRef(item: LayoutItem): item is PatternRef {
  return typeof item === 'object' && 'pattern' in item;
}

function isColumnLayout(item: LayoutItem): item is ColumnLayout {
  return typeof item === 'object' && 'cols' in item;
}

function extractBlendRefs(layout: LayoutItem[]): { id: string; explicitPreset?: string; alias?: string }[] {
  const refs: { id: string; explicitPreset?: string; alias?: string }[] = [];
  for (const item of layout) {
    if (typeof item === 'string') {
      refs.push({ id: item });
    } else if (isPatternRef(item)) {
      refs.push({ id: item.pattern, explicitPreset: item.preset, alias: item.as });
    } else if (isColumnLayout(item)) {
      for (const col of item.cols) {
        refs.push({ id: col });
      }
    }
  }
  return refs;
}

function routePath(pageId: string, index: number): string {
  if (index === 0) return '/';
  return `/${pageId}`;
}

function pascalCase(str: string): string {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildNavItems(pages: StructurePage[]): IRNavItem[] {
  return pages.map((page, i) => ({
    href: routePath(page.id, i),
    icon: NAV_ICONS[page.id] || 'circle',
    label: capitalize(page.id.replace(/-/g, ' ')),
  }));
}

function buildRecipeDecoration(recipe: Recipe): IRRecipeDecoration {
  const carafe = recipe.carafe;
  // The JSON may have additional fields not in the strict type
  const carafeAny = carafe as unknown as Record<string, unknown>;
  return {
    root: carafe.root || '',
    nav: carafe.nav || '',
    header: carafe.header || '',
    brand: (carafeAny['brand'] as string) || '',
    navLabel: (carafeAny['navLabel'] as string) || '',
    navStyle: carafe.nav_style || 'minimal',
    defaultNavState: (carafeAny['default_nav_state'] as string) || 'expanded',
    dimensions: carafe.dimensions || null,
  };
}

function buildTheme(essence: Essence, isAddon: boolean): IRTheme {
  return {
    style: essence.theme.style,
    mode: essence.theme.mode,
    shape: essence.theme.shape || null,
    recipe: essence.theme.recipe,
    isAddon,
  };
}

function convertWiring(wiringResults: ReturnType<typeof detectWirings>): IRWiring | null {
  if (wiringResults.length === 0) return null;

  const signals: IRWiringSignal[] = [];
  const props: Record<string, Record<string, string>> = {};

  for (const result of wiringResults) {
    for (const signal of result.signals) {
      // Avoid duplicate signals
      if (!signals.some(s => s.name === signal.name)) {
        const setter = 'set' + signal.name.charAt(0).toUpperCase() + signal.name.slice(1);
        signals.push({
          name: signal.name,
          setter,
          init: signal.init,
        });
      }
    }
    for (const [alias, aliasProps] of Object.entries(result.props)) {
      props[alias] = { ...props[alias], ...aliasProps };
    }
  }

  return { signals, props };
}

// ─── Visual Effects Resolution ────────────────────────────────

export function resolveVisualEffects(
  recipe: Recipe,
  pattern: Pattern,
  _slot?: string,
): IRVisualEffect | null {
  if (!recipe.visual_effects?.enabled) return null;

  const typeMapping = recipe.visual_effects.type_mapping || {};
  const componentFallback = recipe.visual_effects.component_fallback || {};
  const intensity = recipe.visual_effects.intensity || 'medium';
  const intensityValues = recipe.visual_effects.intensity_values || {};

  // Check pattern tags / components against type_mapping
  let decorators: string[] = [];

  // Check if any pattern components match the component_fallback
  for (const comp of pattern.components || []) {
    const effectType = componentFallback[comp];
    if (effectType && typeMapping[effectType]) {
      decorators = [...decorators, ...typeMapping[effectType]];
    }
  }

  if (decorators.length === 0) return null;

  // Deduplicate
  decorators = [...new Set(decorators)];

  return {
    decorators,
    intensity: intensityValues[intensity] || {},
  };
}

// ─── Main Resolution ─────────────────────────────────────────

/** Resolve all external references in an Essence file */
export async function resolveEssence(
  essence: EssenceFile,
  resolver: ContentResolver,
): Promise<ResolvedEssence> {
  // Extract the simple essence (handle sectioned by flattening first section for now)
  let simpleEssence: Essence;
  if (isSimple(essence)) {
    simpleEssence = essence;
  } else if (isSectioned(essence)) {
    const sectioned = essence as SectionedEssence;
    const firstSection = sectioned.sections[0];
    simpleEssence = {
      version: sectioned.version,
      archetype: firstSection.archetype,
      theme: firstSection.theme,
      character: sectioned.character,
      platform: sectioned.platform,
      structure: firstSection.structure,
      features: firstSection.features || [],
      density: sectioned.density,
      guard: sectioned.guard,
      target: sectioned.target,
    };
  } else {
    throw new Error('Invalid essence format');
  }

  // 1. Recipe resolution
  let recipe: Recipe | null = null;
  const recipeResult = await resolver.resolve('recipe', simpleEssence.theme.recipe);
  if (recipeResult) {
    recipe = recipeResult.item;
  }

  // 2. Density computation
  const recipeSpatial = recipe?.spatial_hints;
  const density = computeDensity(simpleEssence.character, recipeSpatial ? {
    density_bias: recipeSpatial.density_bias,
    content_gap_shift: recipeSpatial.content_gap_shift,
  } : undefined);

  // 3. Theme
  const isAddon = !CORE_STYLES.has(simpleEssence.theme.style);
  const theme = buildTheme(simpleEssence, isAddon);

  // 4. Resolve each page
  const resolvedPages: ResolvedPage[] = [];
  for (const page of simpleEssence.structure) {
    const refs = extractBlendRefs(page.layout);
    const patterns = new Map<string, { pattern: Pattern; preset: ResolvedPreset }>();

    for (const ref of refs) {
      const patternResult = await resolver.resolve('pattern', ref.id);
      if (patternResult) {
        const preset = resolvePatternPreset(
          patternResult.item,
          ref.explicitPreset,
          recipe?.pattern_preferences?.default_presets,
        );
        const key = ref.alias || ref.id;
        patterns.set(key, { pattern: patternResult.item, preset });
      }
    }

    // Detect wiring
    const wiringResults = detectWirings(page.layout);
    const wiring = convertWiring(wiringResults);

    resolvedPages.push({ page, patterns, wiring });
  }

  // 5. Shell config
  const shellType = simpleEssence.structure[0]?.shell || 'sidebar-main';
  const brand = pascalCase(simpleEssence.archetype);
  const nav = buildNavItems(simpleEssence.structure);
  const recipeDecoration = recipe ? buildRecipeDecoration(recipe) : null;

  const shell: IRShellConfig = {
    type: shellType,
    brand,
    nav,
    inset: false,
    recipe: recipeDecoration,
  };

  // 6. Routes
  const routes: IRRoute[] = simpleEssence.structure.map((page, i) => ({
    path: routePath(page.id, i),
    pageId: page.id,
  }));

  return {
    essence,
    pages: resolvedPages,
    recipe,
    density: { gap: density.content_gap, level: density.level },
    theme,
    shell,
    routes,
  };
}
