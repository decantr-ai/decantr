import type {
  BlueprintPage,
  ColumnLayout,
  EssenceFile,
  EssenceV4,
  LayoutItem,
  PatternRef,
  StructurePage,
} from '@decantr/essence-spec';
import { computeDensity, isV4 } from '@decantr/essence-spec';
import type {
  ContentResolver,
  Pattern,
  Theme as RegistryTheme,
  ResolvedPreset,
} from '@decantr/registry';
import { detectWirings, resolvePatternPreset } from '@decantr/registry';
import type {
  IRNavItem,
  IRRoute,
  IRShellConfig,
  IRTheme,
  IRThemeDecoration,
  IRVisualEffect,
  IRWiring,
  IRWiringSignal,
} from './types.js';
import { pascalCase } from './utils.js';

export interface ResolvedPage {
  page: ResolvedStructurePage;
  patterns: Map<string, { pattern: Pattern; preset: ResolvedPreset }>;
  wiring: IRWiring | null;
}

type ResolvedStructurePage = StructurePage & {
  sectionId?: string;
  route?: string;
};

export interface ResolvedEssence {
  essence: EssenceFile;
  pages: ResolvedPage[];
  registryTheme: RegistryTheme | null;
  density: { gap: string; level: string };
  theme: IRTheme;
  shell: IRShellConfig;
  routes: IRRoute[];
  features: string[];
  /** True when the source essence uses the active DNA/Blueprint/Meta contract. */
  isBlueprintSource: boolean;
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

function extractLayoutRefs(
  layout: LayoutItem[],
): { id: string; explicitPreset?: string; alias?: string }[] {
  const refs: { id: string; explicitPreset?: string; alias?: string }[] = [];
  for (const item of layout) {
    if (typeof item === 'string') {
      refs.push({ id: item });
    } else if (isPatternRef(item)) {
      refs.push({ id: item.pattern, explicitPreset: item.preset, alias: item.as });
    } else if (isColumnLayout(item)) {
      // cols can mix string ids and PatternRef objects per the schema.
      // Normalize each entry so downstream resolvers always see a string id.
      for (const col of item.cols) {
        if (typeof col === 'string') {
          refs.push({ id: col });
        } else {
          refs.push({ id: col.pattern, explicitPreset: col.preset, alias: col.as });
        }
      }
    }
  }
  return refs;
}

/** Flatten a layout array so column children are promoted to top-level for wiring detection */
function flattenLayoutForWiring(layout: LayoutItem[]): LayoutItem[] {
  const flat: LayoutItem[] = [];
  for (const item of layout) {
    if (typeof item === 'string') {
      flat.push(item);
    } else if (isPatternRef(item)) {
      flat.push(item);
    } else if (isColumnLayout(item)) {
      // Promote column children as string refs
      for (const col of item.cols) {
        flat.push(col);
      }
    }
  }
  return flat;
}

function routePath(pageId: string, index: number): string {
  if (index === 0) return '/';
  // AUTO: Pages ending in "-detail" get a dynamic :id route parameter
  if (pageId.endsWith('-detail')) {
    return `/${pageId}/:id`;
  }
  return `/${pageId}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildNavItems(pages: ResolvedStructurePage[], routes?: IRRoute[]): IRNavItem[] {
  const routeLookup = new Map<string, string>(
    (routes ?? []).map((route) => [routeIdentity(route.pageId, route.sectionId), route.path]),
  );
  return pages.map((page, i) => ({
    href: routeLookup.get(routeIdentity(page.id, page.sectionId)) ?? routePath(page.id, i),
    icon: NAV_ICONS[page.id] || 'circle',
    label: capitalize(page.id.replace(/-/g, ' ')),
  }));
}

function buildThemeDecoration(theme: RegistryTheme): IRThemeDecoration | null {
  const shell = theme.shell;
  if (!shell) return null;
  // The JSON may have additional fields not in the strict type
  const shellAny = shell as unknown as Record<string, unknown>;
  return {
    root: shell.root || '',
    nav: shell.nav || '',
    header: shell.header || '',
    brand: (shellAny.brand as string) || '',
    navLabel: (shellAny.navLabel as string) || '',
    // AUTO: default nav style is 'pill' when the theme does not declare one
    navStyle: shell.nav_style || 'pill',
    defaultNavState: (shellAny.default_nav_state as string) || 'expanded',
    dimensions: shell.dimensions || null,
  };
}

function buildThemeFromV4(essence: EssenceV4, isAddon: boolean): IRTheme {
  const dna = essence.dna;
  return {
    id: dna.theme.id,
    mode: dna.theme.mode,
    shape: dna.radius.philosophy || dna.theme.shape || null,
    isAddon,
  };
}

/** Convert a BlueprintPage to the StructurePage shape used by the resolver pipeline */
function blueprintPageToStructurePage(
  page: BlueprintPage,
  defaultShell: string,
  sectionId?: string,
): ResolvedStructurePage {
  return {
    id: page.id,
    shell: page.shell_override ?? defaultShell,
    layout: page.layout,
    ...(sectionId ? { sectionId } : {}),
    ...(page.route ? { route: page.route } : {}),
    ...(page.surface ? { surface: page.surface } : {}),
  };
}

function routeIdentity(pageId: string, sectionId?: string): string {
  return sectionId ? `${sectionId}:${pageId}` : pageId;
}

function buildV4Routes(essence: EssenceV4, structurePages: ResolvedStructurePage[]): IRRoute[] {
  const explicitRoutes = new Map<string, string>();

  for (const [path, entry] of Object.entries(essence.blueprint.routes ?? {})) {
    if (!entry?.page) continue;
    const key = routeIdentity(entry.page, entry.section);
    if (!explicitRoutes.has(key)) {
      explicitRoutes.set(key, path);
    }
  }

  for (const page of structurePages) {
    const key = routeIdentity(page.id, page.sectionId);
    if (page.route && !explicitRoutes.has(key)) {
      explicitRoutes.set(key, page.route);
    }
  }

  if (explicitRoutes.size > 0) {
    return structurePages.flatMap((page) => {
      const path = explicitRoutes.get(routeIdentity(page.id, page.sectionId));
      return path
        ? [
            {
              path,
              pageId: page.id,
              shell: page.shell,
              ...(page.sectionId ? { sectionId: page.sectionId } : {}),
            },
          ]
        : [];
    });
  }

  return structurePages.map((page, i) => ({
    path: routePath(page.id, i),
    pageId: page.id,
    shell: page.shell,
    ...(page.sectionId ? { sectionId: page.sectionId } : {}),
  }));
}

function convertWiring(wiringResults: ReturnType<typeof detectWirings>): IRWiring | null {
  if (wiringResults.length === 0) return null;

  const signals: IRWiringSignal[] = [];
  const props: Record<string, Record<string, string>> = {};
  const hookProps: Record<string, Record<string, string>> = {};
  const hookSet = new Set<IRWiringSignal['hookType']>();

  for (const result of wiringResults) {
    for (const signal of result.signals) {
      // Avoid duplicate signals
      if (!signals.some((s) => s.name === signal.name)) {
        const setter = 'set' + signal.name.charAt(0).toUpperCase() + signal.name.slice(1);
        signals.push({
          name: signal.name,
          setter,
          init: signal.init,
          hookType: signal.hookType,
        });
        hookSet.add(signal.hookType);
      }
    }
    for (const [alias, aliasProps] of Object.entries(result.props)) {
      props[alias] = { ...props[alias], ...aliasProps };
    }
    // AUTO: Merge hook-based prop mappings
    for (const [alias, aliasHookProps] of Object.entries(result.hookProps)) {
      hookProps[alias] = { ...hookProps[alias], ...aliasHookProps };
    }
  }

  return { signals, props, hooks: [...hookSet], hookProps };
}

// ─── Visual Effects Resolution ────────────────────────────────

export function resolveVisualEffects(
  theme: RegistryTheme,
  pattern: Pattern,
  _slot?: string,
): IRVisualEffect | null {
  const effects = theme.effects;
  if (!effects?.enabled) return null;

  const typeMapping = effects.type_mapping || {};
  const componentFallback = effects.component_fallback || {};
  const intensity = effects.intensity || 'medium';
  const intensityValues = effects.intensity_values || {};

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
  if (!isV4(essence)) {
    throw new Error(
      'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.',
    );
  }

  return resolveV4Essence(essence, resolver);
}

// ─── V4 Resolution ──────────────────────────────────────────

async function resolveV4Essence(
  essence: EssenceV4,
  resolver: ContentResolver,
): Promise<ResolvedEssence> {
  const { dna, blueprint, meta } = essence;

  // 1. Theme resolution (replaces former recipe resolution)
  let registryTheme: RegistryTheme | null = null;
  const themeResult = await resolver.resolve('theme', dna.theme.id);
  if (themeResult) {
    registryTheme = themeResult.item;
  }

  // 2. Density — v4 carries density directly in dna.spacing
  const themeSpatial = registryTheme?.spatial;
  const density = computeDensity(
    dna.personality,
    themeSpatial
      ? {
          density_bias: themeSpatial.density_bias,
          content_gap_shift: themeSpatial.content_gap_shift,
        }
      : undefined,
  );
  // V4 dna.spacing is authoritative; override computed density with DNA values
  const densityResult = {
    gap: dna.spacing.content_gap || density.content_gap,
    level: dna.spacing.density || density.level,
  };

  // 3. Theme from DNA layer
  const themeId = dna.theme.id;
  const isAddon = themeId.startsWith('custom:') || !CORE_STYLES.has(themeId);
  const theme = buildThemeFromV4(essence, isAddon);

  // 4. Convert sectioned blueprint pages to StructurePage and resolve
  const defaultShell = blueprint.shell ?? blueprint.sections[0]?.shell ?? 'sidebar-main';
  const structurePages: ResolvedStructurePage[] = blueprint.sections.flatMap((section) =>
    section.pages.map((page) =>
      blueprintPageToStructurePage(page, section.shell ?? defaultShell, section.id),
    ),
  );
  const resolvedPages = await resolvePages(structurePages, resolver, registryTheme);

  // 5. Shell config from blueprint
  const shellType = defaultShell;
  const brand = pascalCase(meta.archetype);
  const routes = buildV4Routes(essence, structurePages);
  const nav = buildNavItems(structurePages, routes);
  const decoration = registryTheme ? buildThemeDecoration(registryTheme) : null;

  const shell: IRShellConfig = {
    type: shellType,
    brand,
    nav,
    inset: false,
    decoration,
  };

  return {
    essence,
    pages: resolvedPages,
    registryTheme,
    density: densityResult,
    theme,
    shell,
    routes,
    features: blueprint.features ?? [],
    isBlueprintSource: true,
  };
}

// ─── Shared page resolution ────────────────────────────────

async function resolvePages(
  pages: ResolvedStructurePage[],
  resolver: ContentResolver,
  registryTheme: RegistryTheme | null,
): Promise<ResolvedPage[]> {
  const resolvedPages: ResolvedPage[] = [];
  for (const page of pages) {
    const refs = extractLayoutRefs(page.layout);
    const patterns = new Map<string, { pattern: Pattern; preset: ResolvedPreset }>();

    for (const ref of refs) {
      const patternResult = await resolver.resolve('pattern', ref.id);
      if (patternResult) {
        const preset = resolvePatternPreset(
          patternResult.item,
          ref.explicitPreset,
          registryTheme?.pattern_preferences?.default_presets,
        );
        const key = ref.alias || ref.id;
        patterns.set(key, { pattern: patternResult.item, preset });
      }
    }

    // Detect wiring (flatten cols so column children are visible)
    const wiringResults = detectWirings(flattenLayoutForWiring(page.layout));
    const wiring = convertWiring(wiringResults);

    resolvedPages.push({ page, patterns, wiring });
  }
  return resolvedPages;
}
