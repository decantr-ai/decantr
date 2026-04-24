import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isV3, computeSpatialTokens } from '@decantr/essence-spec';
import type { EssenceV3, EssenceDNA, EssenceBlueprint, EssenceMeta, BlueprintPage, EssenceV31Section, RouteEntry, DNAOverrides, SpatialTokenHints } from '@decantr/essence-spec';
import { compileExecutionPackBundle } from '@decantr/core';
import type { ExecutionPackBase, ExecutionPackBundle, ExecutionPackManifest, ScaffoldExecutionPack } from '@decantr/core';
import { generateTreatmentCSS, generatePersonalityCSS } from './treatments.js';
import type {
  ComposeEntry,
  ArchetypeRole,
  Archetype as RegistryArchetype,
  Blueprint as RegistryBlueprint,
  Theme as RegistryTheme,
  Pattern as RegistryPattern,
  Shell as RegistryShell,
  PatternReference,
  PatternReferenceObject,
  LayoutItem as RegistryLayoutItem,
} from '@decantr/registry';
import type { DetectedProject } from './detect.js';
import type { InitOptions } from './prompts.js';
import type { RegistryClient } from './registry.js';
import { API_CONTENT_TYPES } from '@decantr/registry';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * A layout item can be:
 * - A string (pattern name): "kpi-grid"
 * - A pattern object: { pattern: "hero", preset: "landing", as?: "guild-hero" }
 * - A column layout: { cols: ["a", "b"], at: "lg" }
 */
export type LayoutItem = RegistryLayoutItem | Record<string, unknown>;

export interface ArchetypeNavigationItem {
  label: string;
  route: string;
  icon?: string;
  hotkey?: string;
  active_match?: string;
  badge?: string;
}

export interface ArchetypeData {
  id: string;
  name?: string;
  role?: ArchetypeRole;
  description?: string;
  pages?: Array<{
    id: string;
    shell: string;
    default_layout: LayoutItem[];
    patterns?: PatternReferenceObject[];
    /**
     * Per-page execution directives that propagate to
     * essence.blueprint.sections[].pages[].directives.
     */
    directives?: string[];
  }>;
  features?: string[];
  seo_hints?: {
    schema_org?: string[];
    meta_priorities?: string[];
  };
  /**
   * Items rendered in the shell's primary navigation when this archetype is
   * composed as a section. Propagated to essence.blueprint.sections[].navigation_items.
   */
  navigation_items?: ArchetypeNavigationItem[];
  /**
   * Execution-level directives emitted into the section-pack contract.
   * Short imperative rules every page in this section must obey.
   * Propagated to essence.blueprint.sections[].directives.
   */
  directives?: string[];
}

function getPlatformMeta(target: string) {
  const normalized = (target || 'react').toLowerCase();
  // Default to 'history' for modern SPA scaffolds: Vite dev server, Vercel,
  // Netlify, Cloudflare Pages, and most modern hosts handle SPA fallback
  // natively. 'hash' is correct only for static-only hosts without fallback
  // (e.g., vanilla GitHub Pages) — blueprints that need that can declare
  // routing explicitly.
  const routing = normalized === 'nextjs' ? 'pathname' : 'history';

  return {
    type: 'spa' as const,
    routing,
  };
}

type LegacyMetaCompat = EssenceV3['meta'] & {
  blueprint?: string;
};

function getLegacyBlueprintId(meta: EssenceV3['meta']): string | undefined {
  return (meta as LegacyMetaCompat).blueprint;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function toPatternReferenceObject(ref: PatternReference): PatternReferenceObject {
  return typeof ref === 'string' ? { pattern: ref } : ref;
}

function collectPatternIdsFromValue(value: unknown, ids: Set<string>): void {
  if (typeof value === 'string') {
    ids.add(value);
    return;
  }

  if (!value || typeof value !== 'object') return;

  if ('pattern' in value && typeof value.pattern === 'string') {
    ids.add(value.pattern);
  }

  if ('cols' in value && Array.isArray(value.cols)) {
    for (const col of value.cols) collectPatternIdsFromValue(col, ids);
  }
}

export function collectPatternIdsFromItems(items: unknown[]): string[] {
  const ids = new Set<string>();
  for (const item of items) collectPatternIdsFromValue(item, ids);
  return [...ids];
}

export function mapRegistryArchetypeToArchetypeData(archetype: RegistryArchetype): ArchetypeData {
  // Registry type may not yet declare navigation_items / directives; read defensively.
  const registryExtras = archetype as {
    navigation_items?: ArchetypeNavigationItem[];
    directives?: string[];
  };
  const registryNavigation = registryExtras.navigation_items;
  const registryDirectives = registryExtras.directives;
  return {
    id: archetype.id,
    name: archetype.name,
    role: archetype.role,
    description: archetype.description,
    pages: archetype.pages?.map(page => {
      const pageExtras = page as { directives?: string[] };
      return {
        id: page.id,
        shell: page.shell,
        default_layout: page.default_layout?.length ? page.default_layout : ['hero'],
        patterns: page.patterns?.map(toPatternReferenceObject),
        ...(Array.isArray(pageExtras.directives) && pageExtras.directives.length > 0
          ? { directives: pageExtras.directives }
          : {}),
      };
    }),
    features: archetype.features,
    seo_hints: archetype.seo_hints,
    ...(Array.isArray(registryNavigation) && registryNavigation.length > 0
      ? { navigation_items: registryNavigation }
      : {}),
    ...(Array.isArray(registryDirectives) && registryDirectives.length > 0
      ? { directives: registryDirectives }
      : {}),
  };
}

/**
 * Compose pages and features from multiple archetypes.
 *
 * compose[0] is the primary archetype -- its pages get NO prefix, and its
 * first page's shell becomes the defaultShell.
 *
 * compose[1+] are secondary archetypes -- their pages get prefixed:
 *   - plain string entry: prefix = archetype ID
 *   - object entry: prefix = entry.prefix
 *
 * Features from all archetypes are merged and deduplicated.
 */
export function composeArchetypes(
  composeEntries: ComposeEntry[],
  archetypeResults: Map<string, ArchetypeData | null>,
): { pages: BlueprintPage[]; features: string[]; defaultShell: string } {
  if (composeEntries.length === 0) {
    return {
      pages: [{ id: 'home', layout: ['hero'] }],
      features: [],
      defaultShell: 'sidebar-main',
    };
  }

  const allPages: BlueprintPage[] = [];
  const allFeatures: string[] = [];
  let defaultShell = 'sidebar-main';

  for (let i = 0; i < composeEntries.length; i++) {
    const entry = composeEntries[i];
    const archetypeId = typeof entry === 'string' ? entry : entry.archetype;
    const data = archetypeResults.get(archetypeId);
    if (!data?.pages) continue;

    const isPrimary = i === 0;

    if (isPrimary) {
      defaultShell = data.pages[0]?.shell || defaultShell;
      for (const page of data.pages) {
        allPages.push({
          id: page.id,
          layout: (page.default_layout?.length ? page.default_layout : ['hero'])
            .map((item) => resolvePatternAlias(item, page.patterns)) as LayoutItem[],
          ...(page.shell !== defaultShell ? { shell_override: page.shell } : {}),
        });
      }
    } else {
      const prefix = typeof entry === 'string' ? entry : entry.prefix;
      for (const page of data.pages) {
        allPages.push({
          id: `${prefix}-${page.id}`,
          layout: (page.default_layout?.length ? page.default_layout : ['hero'])
            .map((item) => resolvePatternAlias(item, page.patterns)) as LayoutItem[],
          ...(page.shell !== defaultShell ? { shell_override: page.shell } : {}),
        });
      }
    }

    if (data.features) {
      allFeatures.push(...data.features);
    }
  }

  // If no pages were added (all archetypes missing), fall back to default
  if (allPages.length === 0) {
    allPages.push({ id: 'home', layout: ['hero'] });
  }

  return {
    pages: allPages,
    features: [...new Set(allFeatures)],
    defaultShell,
  };
}

// ── Section-based Composition ──

export interface BlueprintOverrides {
  features_add?: string[];
  features_remove?: string[];
  pages_remove?: string[];
  pages?: Record<string, Partial<BlueprintPage>>;
  section_dna_overrides?: Record<string, DNAOverrides>;
}

export interface ComposeSectionsResult {
  sections: EssenceV31Section[];
  features: string[];
  defaultShell: string;
}

/**
 * Compose archetypes into section-based grouping (v3.1 style).
 *
 * Unlike `composeArchetypes` which flattens all pages into one array with
 * prefixed IDs, this keeps pages grouped within their archetype's section,
 * preserving original page IDs.
 *
 * The FIRST archetype is the primary — its first page's shell becomes
 * `defaultShell`.
 *
 * Each archetype becomes a section with: id, role, shell, features,
 * description, pages.
 *
 * Optional `overrides` allow adding/removing features and removing pages.
 */
export function composeSections(
  composeEntries: ComposeEntry[],
  archetypeResults: Map<string, ArchetypeData | null>,
  overrides?: BlueprintOverrides,
): ComposeSectionsResult {
  if (composeEntries.length === 0) {
    return {
      sections: [{
        id: 'default',
        role: 'primary',
        shell: 'sidebar-main',
        features: [],
        description: 'Default section',
        pages: [{ id: 'home', layout: ['hero'] }],
      }],
      features: [],
      defaultShell: 'sidebar-main',
    };
  }

  const sections: EssenceV31Section[] = [];
  const allFeatures: string[] = [];
  let defaultShell = 'sidebar-main';
  const pagesRemoveSet = new Set(overrides?.pages_remove ?? []);

  for (let i = 0; i < composeEntries.length; i++) {
    const entry = composeEntries[i];
    const archetypeId = typeof entry === 'string' ? entry : entry.archetype;
    const data = archetypeResults.get(archetypeId);
    if (!data?.pages) continue;

    const isPrimary = i === 0;
    if (isPrimary) {
      defaultShell = data.pages[0]?.shell || defaultShell;
    }

    const pages: BlueprintPage[] = [];
    for (const page of data.pages) {
      if (pagesRemoveSet.has(page.id)) continue;

      const overriddenPage = overrides?.pages?.[page.id];
      pages.push({
        id: page.id,
        layout: (page.default_layout?.length ? page.default_layout : ['hero'])
          .map((item) => resolvePatternAlias(item, page.patterns)) as LayoutItem[],
        // Propagate per-page directives from the archetype so cold LLMs
        // see execution-level rules in the page-pack contract instead of
        // having to read the section narrative.
        ...(Array.isArray(page.directives) && page.directives.length > 0
          ? { directives: page.directives }
          : {}),
        ...overriddenPage,
      });
    }

    sections.push({
      id: archetypeId,
      role: data.role ?? 'primary',
      shell: data.pages[0]?.shell || 'sidebar-main',
      features: data.features ?? [],
      description: data.description ?? '',
      pages,
      // Propagate navigation_items from the archetype so the shell renders
      // the correct primary-nav list instead of the LLM improvising one.
      ...(Array.isArray(data.navigation_items) && data.navigation_items.length > 0
        ? { navigation_items: data.navigation_items }
        : {}),
      // Propagate section-level directives from the archetype into the
      // essence so the section-pack renderer can surface them in the
      // pack contract.
      ...(Array.isArray(data.directives) && data.directives.length > 0
        ? { directives: data.directives }
        : {}),
    });

    if (data.features) {
      allFeatures.push(...data.features);
    }
  }

  // If no sections were added (all archetypes missing), fall back to default
  if (sections.length === 0) {
    sections.push({
      id: 'default',
      role: 'primary',
      shell: 'sidebar-main',
      features: [],
      description: 'Default section',
      pages: [{ id: 'home', layout: ['hero'] }],
    });
  }

  // Apply per-section DNA overrides from blueprint overrides
  if (overrides?.section_dna_overrides) {
    for (const section of sections) {
      const sectionOverrides = overrides.section_dna_overrides[section.id];
      if (sectionOverrides) {
        section.dna_overrides = { ...section.dna_overrides, ...sectionOverrides };
      }
    }
  }

  // After all sections are built, resolve "inherit" shell
  const primaryShell = sections.find(s => s.role === 'primary')?.shell || defaultShell;
  for (const section of sections) {
    if (section.shell === 'inherit') {
      section.shell = primaryShell;
    }
  }

  // Deduplicate features then apply overrides
  let features = [...new Set(allFeatures)];
  if (overrides?.features_add) {
    for (const f of overrides.features_add) {
      if (!features.includes(f)) features.push(f);
    }
  }
  if (overrides?.features_remove) {
    const removeSet = new Set(overrides.features_remove);
    features = features.filter(f => !removeSet.has(f));
  }

  return { sections, features, defaultShell };
}

// ── Topology Derivation ──

export interface ZoneInput {
  archetypeId: string;
  role: ArchetypeRole;
  shell: string;
  features: string[];
  description: string;
}

export interface ComposedZone {
  role: ArchetypeRole;
  archetypes: string[];
  shell: string;
  features: string[];
  descriptions: string[];
}

export interface ZoneTransition {
  from: string;
  to: string;
  type: string;
  trigger: string;
}

const ZONE_ORDER: ArchetypeRole[] = ['public', 'gateway', 'primary', 'auxiliary'];

export function deriveZones(inputs: ZoneInput[]): ComposedZone[] {
  const zoneMap = new Map<ArchetypeRole, ComposedZone>();

  for (const input of inputs) {
    const existing = zoneMap.get(input.role);
    if (existing) {
      existing.archetypes.push(input.archetypeId);
      existing.features.push(...input.features);
      existing.descriptions.push(input.description);
    } else {
      zoneMap.set(input.role, {
        role: input.role,
        archetypes: [input.archetypeId],
        shell: input.shell,
        features: [...input.features],
        descriptions: [input.description],
      });
    }
  }

  for (const zone of zoneMap.values()) {
    zone.features = [...new Set(zone.features)];
  }

  return ZONE_ORDER
    .filter(role => zoneMap.has(role))
    .map(role => zoneMap.get(role)!);
}

const GATEWAY_TRIGGER_MAP: Record<string, string> = {
  auth: 'authentication',
  login: 'authentication',
  mfa: 'authentication',
  payment: 'payment',
  subscription: 'payment',
  checkout: 'payment',
  onboarding: 'onboarding',
  'setup-wizard': 'onboarding',
  welcome: 'onboarding',
  invite: 'invitation',
  'access-code': 'invitation',
};

function resolveGatewayTrigger(features: string[]): string {
  for (const feature of features) {
    const trigger = GATEWAY_TRIGGER_MAP[feature];
    if (trigger) return trigger;
  }
  return 'authentication';
}

export function deriveTransitions(zones: ComposedZone[]): ZoneTransition[] {
  const transitions: ZoneTransition[] = [];
  const roles = new Set(zones.map(z => z.role));
  const gateway = zones.find(z => z.role === 'gateway');
  const gatewayTrigger = gateway ? resolveGatewayTrigger(gateway.features) : 'authentication';

  const hasApp = roles.has('primary') || roles.has('auxiliary');
  const hasGateway = roles.has('gateway');
  const hasPublic = roles.has('public');

  if (hasPublic && hasGateway) {
    transitions.push({ from: 'public', to: 'gateway', type: 'conversion', trigger: gatewayTrigger });
  }
  if (hasPublic && hasApp && !hasGateway) {
    transitions.push({ from: 'public', to: 'app', type: 'conversion', trigger: 'navigation' });
  }
  if (hasGateway && hasApp) {
    transitions.push({ from: 'gateway', to: 'app', type: 'gate-pass', trigger: gatewayTrigger });
    transitions.push({ from: 'app', to: 'gateway', type: 'gate-return', trigger: gatewayTrigger });
  }
  if (hasApp && hasPublic) {
    transitions.push({ from: 'app', to: 'public', type: 'navigation', trigger: 'external' });
  }

  return transitions;
}

export interface TopologyData {
  intent: string;
  zones: ComposedZone[];
  transitions: ZoneTransition[];
  entryPoints: {
    anonymous: string;
    authenticated: string;
  };
}

const ZONE_LABELS: Record<string, string> = {
  public: 'Public',
  gateway: 'Gateway',
  primary: 'App',
  auxiliary: 'App (auxiliary)',
};

export function generateTopologySection(data: TopologyData, personality: string[]): string {
  const lines: string[] = [];

  lines.push('## Composition Topology');
  lines.push('');
  lines.push(`**Intent:** ${data.intent}`);
  lines.push('');
  lines.push('### Zones');
  lines.push('');

  for (const zone of data.zones) {
    const label = ZONE_LABELS[zone.role] || zone.role;
    lines.push(`**${label}** — ${zone.shell} shell`);
    lines.push(`  Archetypes: ${zone.archetypes.join(', ')}`);
    lines.push(`  Purpose: ${zone.descriptions.join(' ')}`);

    if (zone.features.length > 0) {
      lines.push(`  Features: ${zone.features.join(', ')}`);
    }

    lines.push('');
  }

  if (data.transitions.length > 0) {
    lines.push('### Zone Transitions');
    lines.push('');

    for (const t of data.transitions) {
      const fromLabel = t.from.charAt(0).toUpperCase() + t.from.slice(1);
      const toLabel = t.to.charAt(0).toUpperCase() + t.to.slice(1);
      lines.push(`  ${fromLabel} → ${toLabel}: ${t.type} (${t.trigger})`);
    }

    lines.push('');
  }

  lines.push('### Default Entry Points');
  lines.push('');
  lines.push(`  Anonymous users enter: ${data.entryPoints.anonymous}`);
  lines.push(`  Authenticated users enter: ${data.entryPoints.authenticated}`);
  lines.push(`  Auth redirect target: ${data.entryPoints.authenticated}`);
  lines.push('');

  return lines.join('\n');
}

export interface ScaffoldResult {
  essencePath: string;
  decantrMdPath: string;
  projectJsonPath: string;
  contextFiles: string[];
  cssFiles: string[];
  gitignoreUpdated: boolean;
}

const CLI_VERSION = '1.0.0';

/**
 * Unified theme data — includes color, typography, motion, and visual treatment fields.
 * Previously split across ThemeData + RecipeData; now a single interface.
 */
export interface ThemeData {
  // Color
  seed?: Record<string, string>;
  palette?: Record<string, Record<string, string>>;
  tokens?: { base?: Record<string, string>; cvd?: Record<string, Record<string, string>> };
  cvd_support?: string[];
  // Typography
  typography?: { scale?: string; heading_weight?: number; body_weight?: number; mono?: string };
  // Motion
  motion?: { preference?: string; reduce_motion?: boolean; entrance?: string; timing?: string; durations?: Record<string, string> };
  // Visual treatment (formerly RecipeData)
  decorators?: Record<string, string>;
  decorator_definitions?: Record<string, {
    description?: string;
    intent?: string;
    suggested_properties?: Record<string, string>;
    // State-variant CSS. Emitter generates `.{name}:hover` / `:focus-visible` /
    // `:active` rules when these fields are present. Optional and additive —
    // themes without them keep current behavior.
    hover_properties?: Record<string, string>;
    focus_properties?: Record<string, string>;
    active_properties?: Record<string, string>;
    pairs_with?: string[];
    usage?: string[];
  }>;
  treatments?: Record<string, Record<string, string>>;
  spatial?: { density_bias?: number; content_gap_shift?: number; section_padding?: string | null; card_wrapping?: string; surface_override?: string };
  radius?: { philosophy?: string; base?: number };
  // Layout hints
  shell?: { preferred?: string[]; nav_style?: string; root?: string; nav?: string };
  effects?: { enabled?: boolean; intensity?: string; type_mapping?: Record<string, string[]> };
  compositions?: Record<string, unknown>;
  pattern_preferences?: { prefer?: string[]; avoid?: string[] };
}

export function mapRegistryThemeToThemeData(theme: RegistryTheme): ThemeData {
  return {
    seed: theme.seed,
    palette: theme.palette,
    tokens: theme.tokens,
    cvd_support: theme.cvd_support,
    typography: theme.typography,
    motion: theme.motion,
    decorators: theme.decorators,
    decorator_definitions: theme.decorator_definitions,
    treatments: theme.treatments,
    spatial: theme.spatial,
    radius: theme.radius,
    shell: theme.shell,
    effects: theme.effects,
    compositions: theme.compositions,
    pattern_preferences: theme.pattern_preferences,
  };
}

/**
 * Generate tokens.css from theme data.
 */
export function generateTokensCSS(themeData: ThemeData | undefined, mode: string, spatialTokens?: Record<string, string>): string {
  if (!themeData) {
    const spatialLines = spatialTokens
      ? '\n' + Object.entries(spatialTokens).map(([k, v]) => `  ${k}: ${v};`).join('\n')
      : '';
    return `/* No theme data available */
@layer tokens {
:root {
  --d-primary: #6366f1;
  --d-secondary: #a1a1aa;
  --d-accent: #f59e0b;
  --d-bg: #18181b;
  --d-surface: #1f1f23;
  --d-surface-raised: #27272a;
  --d-border: #3f3f46;
  --d-text: #fafafa;
  --d-text-muted: #a1a1aa;${spatialLines}
}
}
`;
  }

  const seed = themeData.seed || {};
  const palette = themeData.palette || {};

  // When mode is 'auto', use 'dark' as the :root default
  const resolvedMode = mode === 'auto' ? 'dark' : mode;

  // Mode-aware hardcoded fallbacks for when a theme's palette doesn't
  // define the requested mode. Previously every fallback was a dark hex
  // (e.g., --d-bg: #18181b), so a light-mode blueprint against a
  // dark-only theme would silently get a dark scaffold — a High-severity
  // finding from the ecommerce harness run. These fallbacks at least
  // produce a legible scaffold in the requested mode even if the theme
  // doesn't carry its own values for that mode.
  const FALLBACKS: Record<string, { light: string; dark: string }> = {
    bg: { light: '#ffffff', dark: '#18181b' },
    surface: { light: '#f9fafb', dark: '#1f1f23' },
    'surface-raised': { light: '#ffffff', dark: '#27272a' },
    border: { light: '#e5e7eb', dark: '#3f3f46' },
    text: { light: '#111827', dark: '#fafafa' },
    'text-muted': { light: '#6b7280', dark: '#a1a1aa' },
    secondary: { light: '#6b7280', dark: '#A1A1AA' },
  };

  function buildTokens(tokenMode: string): Record<string, string> {
    const tokenModeKey: 'light' | 'dark' = tokenMode === 'light' ? 'light' : 'dark';
    const pickFb = (key: string) => {
      const fallbacks = FALLBACKS[key];
      if (!fallbacks) return tokenModeKey === 'light' ? '#ffffff' : '#18181b';
      return fallbacks[tokenModeKey];
    };

    return {
      // Seed colors
      '--d-primary': seed.primary || '#6366f1',
      '--d-secondary': palette.secondary?.[tokenMode] || pickFb('secondary'),
      '--d-accent': seed.accent || '#f59e0b',

      // Palette colors (mode-aware with mode-aware fallbacks)
      '--d-bg': palette.background?.[tokenMode] || pickFb('bg'),
      '--d-surface': palette.surface?.[tokenMode] || pickFb('surface'),
      '--d-surface-raised': palette['surface-raised']?.[tokenMode] || pickFb('surface-raised'),
      '--d-border': palette.border?.[tokenMode] || pickFb('border'),
      '--d-text': palette.text?.[tokenMode] || pickFb('text'),
      '--d-text-muted': palette['text-muted']?.[tokenMode] || pickFb('text-muted'),
      '--d-primary-hover': palette['primary-hover']?.[tokenMode] || seed.primary || '#6366f1',

      // Spacing scale
      '--d-gap-1': '0.25rem',
      '--d-gap-2': '0.5rem',
      '--d-gap-3': '0.75rem',
      '--d-gap-4': '1rem',
      '--d-gap-6': '1.5rem',
      '--d-gap-8': '2rem',
      '--d-gap-12': '3rem',

      // Radii
      '--d-radius': '0.5rem',
      '--d-radius-sm': '0.25rem',
      '--d-radius-lg': '0.75rem',
      '--d-radius-xl': '1rem',
      '--d-radius-full': '9999px',

      // Shadows — dark mode needs higher opacity to be visible on dark backgrounds
      '--d-shadow-sm': tokenMode === 'light'
        ? '0 1px 2px rgba(0,0,0,0.05)'
        : '0 1px 2px rgba(0,0,0,0.2)',
      '--d-shadow': tokenMode === 'light'
        ? '0 1px 3px rgba(0,0,0,0.1)'
        : '0 1px 3px rgba(0,0,0,0.25)',
      '--d-shadow-md': tokenMode === 'light'
        ? '0 4px 6px rgba(0,0,0,0.1)'
        : '0 4px 6px rgba(0,0,0,0.3)',
      '--d-shadow-lg': tokenMode === 'light'
        ? '0 10px 15px rgba(0,0,0,0.1)'
        : '0 10px 15px rgba(0,0,0,0.4)',

      // Status colors
      '--d-success': themeData.tokens?.base?.success || '#22c55e',
      '--d-error': themeData.tokens?.base?.danger || '#ef4444',
      '--d-warning': themeData.tokens?.base?.warning || '#f59e0b',
      '--d-info': '#3b82f6',
    };
  }

  const tokens = buildTokens(resolvedMode);

  // Emit additional tokens from theme data when present
  if (themeData?.typography?.mono) {
    tokens['--d-font-mono'] = themeData.typography.mono;
  }
  if (themeData?.palette?.['accent-glow']?.[resolvedMode]) {
    tokens['--d-accent-glow'] = themeData.palette['accent-glow'][resolvedMode];
  }
  if (themeData?.motion?.durations?.hover) {
    tokens['--d-duration-hover'] = themeData.motion.durations.hover;
  }
  if (themeData?.motion?.durations?.entrance) {
    tokens['--d-duration-entrance'] = themeData.motion.durations.entrance;
  }
  if (themeData?.motion?.timing) {
    tokens['--d-easing'] = themeData.motion.timing;
  }

  const lines = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  const spatialLines = spatialTokens
    ? '\n' + Object.entries(spatialTokens).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    : '';

  let css = `/* Generated by @decantr/cli */
@layer tokens {
:root {
${lines}${spatialLines}
}
`;

  // When mode is 'auto', add a light-mode media query block
  if (mode === 'auto') {
    const lightTokens = buildTokens('light');
    // Only emit palette tokens that differ between modes
    const paletteKeys = [
      '--d-bg', '--d-surface', '--d-surface-raised', '--d-border',
      '--d-text', '--d-text-muted', '--d-primary-hover',
      '--d-shadow-sm', '--d-shadow', '--d-shadow-md', '--d-shadow-lg',
    ];
    const lightLines = Object.entries(lightTokens)
      .filter(([key]) => paletteKeys.includes(key))
      .map(([key, value]) => `    ${key}: ${value};`)
      .join('\n');

    css += `
@media (prefers-color-scheme: light) {
  :root {
${lightLines}
  }
}
`;
  }

  css += `}
`;

  return css;
}

/**
 * Generate decorators.css from theme data.
 * Decorator CSS is now AI-generated from structured definitions in section context files.
 */
export function generateDecoratorsCSS(themeData: ThemeData | undefined, themeName: string): string {
  if (!themeData?.decorators) {
    return `/* No theme decorators available */`;
  }

  const names = Object.keys(themeData.decorators);
  const css: string[] = [
    `/* Generated by @decantr/cli from theme: ${themeName} */`,
    `/* Decorator CSS is AI-generated from structured definitions in section context files. */`,
    `/* Available decorators: ${names.join(', ')} */`,
    '',
  ];

  return css.join('\n');
}

/**
 * Generate a global.css with reset, body styles, and utility classes.
 * Uses personality array to extract font family hints.
 */
export function generateGlobalCSS(personality: string[], essence?: EssenceV3): string {
  const personalityText = personality.join(' ').toLowerCase();
  let fontBody = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  if (personalityText.includes('inter')) {
    fontBody = `'Inter', ${fontBody}`;
  } else if (personalityText.includes('geist')) {
    fontBody = `'Geist', ${fontBody}`;
  }

  const mode = essence?.dna?.theme?.mode || 'dark';
  const colorScheme = mode === 'auto' ? 'light dark' : mode;

  return `/* Generated by @decantr/cli — global reset + body styles */
@layer reset, tokens, treatments, decorators, utilities, app;

@layer reset {

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  color-scheme: ${colorScheme};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: ${fontBody};
  background: var(--d-bg);
  color: var(--d-text);
  line-height: 1.6;
  min-height: 100dvh;
}

.skip-link {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 100;
  padding: 0.5rem 0.75rem;
  border-radius: var(--d-radius);
  background: var(--d-surface-raised);
  color: var(--d-text);
  text-decoration: none;
  border: 1px solid var(--d-border);
  transform: translateY(-150%);
  transition: transform 0.15s ease;
}

.skip-link:focus,
.skip-link:focus-visible {
  transform: translateY(0);
}

img, picture, video, canvas {
  display: block;
  max-width: 100%;
}

svg {
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--d-primary);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

}
`;
}

/**
 * Serialize a layout item to a readable string.
 * Handles strings, pattern objects, and column layouts.
 */
export function serializeLayoutItem(item: unknown): string {
  if (typeof item === 'string') {
    return item;
  }
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;

    // Pattern with preset: "hero (landing)" or "hero (landing) as guild-hero"
    if (typeof obj.pattern === 'string') {
      const preset = obj.preset ? ` (${obj.preset})` : '';
      const alias = obj.as ? ` as ${obj.as}` : '';
      return `${obj.pattern}${preset}${alias}`;
    }

    // Column layout: "[activity-feed | top-players] @lg"
    if (Array.isArray(obj.cols)) {
      const cols = obj.cols.map(serializeLayoutItem).join(' | ');
      const breakpoint = obj.at ? ` @${obj.at}` : '';
      return `[${cols}]${breakpoint}`;
    }
  }
  return 'custom';
}

/**
 * Extract the pattern name from a layout item (for patterns list).
 */
function extractPatternNames(item: unknown): string[] {
  if (typeof item === 'string') {
    return [item];
  }
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;

    // Pattern object: extract pattern name
    if (typeof obj.pattern === 'string') {
      return [obj.pattern];
    }

    // Column layout: extract names from nested items
    if (Array.isArray(obj.cols)) {
      return obj.cols.flatMap(extractPatternNames);
    }
  }
  return [];
}

/**
 * Load a template file from the templates directory.
 */
function loadTemplate(name: string): string {
  // When running from dist/, templates are at ../src/templates/
  const fromDist = join(__dirname, '..', 'src', 'templates', name);
  if (existsSync(fromDist)) {
    return readFileSync(fromDist, 'utf-8');
  }
  // When running from src/ in dev, templates are at ./templates/
  const fromSrc = join(__dirname, 'templates', name);
  if (existsSync(fromSrc)) {
    return readFileSync(fromSrc, 'utf-8');
  }
  throw new Error(`Template not found: ${name}`);
}

/**
 * Replace template variables with actual values.
 */
function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Resolve pattern aliases to actual pattern IDs.
 * Given a layout item (which may be an alias like "header") and a patterns array,
 * returns the actual pattern ID (like "chat-header").
 */
function resolvePatternAlias(
  item: LayoutItem,
  patterns?: Array<{ pattern: string; preset?: string; as?: string }>
): LayoutItem {
  if (!patterns) return item;

  // Handle string items (simple pattern names or aliases)
  if (typeof item === 'string') {
    // Check if this is an alias that needs resolving
    const patternDef = patterns.find(p => p.as === item);
    if (patternDef) {
      // Return the actual pattern ID, optionally with preset
      if (patternDef.preset) {
        return { pattern: patternDef.pattern, preset: patternDef.preset };
      }
      return patternDef.pattern;
    }
    return item;
  }

  // Handle object items (pattern with preset, or column layouts)
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;

    // Column layout: resolve each column item
    if (Array.isArray(obj.cols)) {
      return {
        ...obj,
        cols: obj.cols.map(col => resolvePatternAlias(col, patterns)),
      };
    }
  }

  return item;
}

/**
 * Build a v3 essence from options, producing DNA/Blueprint/Meta structure.
 */
export function buildEssenceV3(
  options: InitOptions,
  archetypeData?: ArchetypeData,
  themeHints?: ThemeData,
): EssenceV3 {
  // Resolve structure from archetype or defaults
  let pages: EssenceBlueprint['pages'] = [
    { id: 'home', layout: ['hero'] }
  ];
  let features: string[] = options.features;
  let defaultShell = options.shell || 'sidebar-main';

  if (archetypeData?.pages) {
    defaultShell = archetypeData.pages[0]?.shell || defaultShell;
    pages = archetypeData.pages.map(p => {
      const resolvedLayout = (p.default_layout?.length ? p.default_layout : ['hero'])
        .map(item => resolvePatternAlias(item, p.patterns));
      return {
        id: p.id,
        ...(p.shell !== defaultShell ? { shell_override: p.shell } : {}),
        layout: resolvedLayout,
      };
    });
  }

  if (archetypeData?.features) {
    features = [...new Set([...features, ...archetypeData.features])];
  }

  const densityLevelMap: Record<string, string> = {
    compact: '_gap2',
    comfortable: '_gap4',
    spacious: '_gap6',
  };

  const shapeRadiusMap: Record<string, number> = {
    pill: 12,
    rounded: 8,
    sharp: 2,
  };

  const guardModeMap: Record<string, EssenceMeta['guard']> = {
    strict: { mode: 'strict' as const, dna_enforcement: 'error' as const, blueprint_enforcement: 'warn' as const },
    guided: { mode: 'guided' as const, dna_enforcement: 'error' as const, blueprint_enforcement: 'off' as const },
    creative: { mode: 'creative' as const, dna_enforcement: 'off' as const, blueprint_enforcement: 'off' as const },
  };

  const dna: EssenceDNA = {
    theme: {
      id: options.theme,
      mode: options.mode,
      shape: options.shape as 'sharp' | 'rounded' | 'pill',
    },
    spacing: {
      base_unit: 4,
      scale: 'linear',
      density: options.density,
      content_gap: densityLevelMap[options.density] || '_gap4',
    },
    typography: {
      scale: themeHints?.typography?.scale || 'modular',
      heading_weight: themeHints?.typography?.heading_weight || 600,
      body_weight: themeHints?.typography?.body_weight || 400,
    },
    color: {
      palette: 'semantic',
      accent_count: 1,
      cvd_preference: options.accessibility?.cvd_preference || 'auto',
    },
    radius: {
      philosophy: (themeHints?.radius?.philosophy || options.shape) as 'sharp' | 'rounded' | 'pill',
      base: themeHints?.radius?.base || shapeRadiusMap[options.shape] || 8,
    },
    elevation: {
      system: 'layered',
      max_levels: 3,
    },
    motion: {
      preference: (themeHints?.motion?.preference || 'subtle') as 'none' | 'subtle' | 'expressive',
      duration_scale: 1.0,
      reduce_motion: themeHints?.motion?.reduce_motion ?? true,
    },
    accessibility: {
      wcag_level: (options.accessibility?.wcag_level as 'none' | 'A' | 'AA' | 'AAA') || 'AA',
      focus_visible: true,
      skip_nav: true,
    },
    personality: options.personality,
  };

  const blueprint: EssenceBlueprint = {
    shell: defaultShell,
    pages,
    features,
  };

  const meta: EssenceMeta = {
    archetype: options.archetype || 'custom',
    target: options.target,
    platform: getPlatformMeta(options.target),
    guard: guardModeMap[options.guard] || guardModeMap.guided,
  };

  return {
    version: '3.0.0',
    dna,
    blueprint,
    meta,
  };
}

/**
 * CSS methodology section for DECANTR.md (extracted from the v3.0 template).
 * This content is passed as {{CSS_APPROACH}} in the v3.1 simplified template.
 */
const CSS_APPROACH_CONTENT = `## CSS Implementation

This project uses **@decantr/css** for layout atoms, **visual treatments** for semantic styling, and **theme decorators** for theme-specific decoration.

### Three File Setup

\`\`\`
src/styles/
  tokens.css       # Design tokens: --d-primary, --d-surface, --d-bg, etc.
  treatments.css   # Visual treatments (d-interactive, d-surface, ...) + theme decorators
  global.css       # Resets, base typography, sr-only
\`\`\`

\`\`\`javascript
import { css } from '@decantr/css';         // Atoms runtime
import './styles/tokens.css';                // Theme tokens
import './styles/treatments.css';            // Treatments + theme decorators
import './styles/global.css';                // Resets
\`\`\`

### Runtime Rules

- Use the real \`@decantr/css\` runtime for atoms. If \`package.json\` does not already depend on \`@decantr/css\`, add it before building.
- If \`package.json\`, app entry files, or router/runtime files are absent, create them explicitly for the declared target instead of assuming a hidden starter already exists.
- Do **not** create local atom-runtime substitutes such as \`src/lib/css.js\`, \`src/lib/css.ts\`, or hand-written \`src/styles/atoms.css\` files unless the task explicitly asks for a fallback runtime.
- Keep atoms in \`css(...)\`, treatments as semantic classes, and theme decorators as additive classes. Do not blur those roles together.
- Do **not** use inline visual style values or component-scoped \`<style>\` tags as the primary styling path. Colors, spacing, borders, shadows, gradients, and transitions should come from atoms, treatments, decorators, or CSS variables. Inline styles are only acceptable for truly dynamic geometry that cannot be expressed through the contract.
- Use \`d-control\` as the default semantic treatment for inputs, selects, and textareas. Theme decorators such as \`carbon-input\` are additive and should only layer on when the section or theme contract explicitly calls for them.
- Use loading decorators such as \`carbon-skeleton\` as optional enhancement on top of a structurally correct loading state — they do not replace the need for a real loading/skeleton branch.
- Shells own spacing, centering, and scroll containers. Pages should not duplicate shell responsibilities with extra full-height wrappers, max-width wrappers, or page-local padding unless the route contract explicitly requires it.
- If a required decorator class is referenced in the generated contract but missing from generated CSS, report that contract gap instead of inventing a parallel visual system.

### Visual Treatments

Decantr ships semantic treatment classes that cover the recurring UI idioms. Combine with atoms for layout — don't hand-roll equivalent CSS classes.

**Core treatments (every app uses these):**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Interactive Surface** | \`d-interactive\` | \`data-variant="primary\\|ghost\\|danger"\`, \`data-size="sm\\|md\\|lg"\`, hover/focus-visible/disabled states |
| **Container Surface** | \`d-surface\` | \`data-variant="raised\\|overlay"\`, optional \`data-interactive\` for hover |
| **Data Display** | \`d-data\`, \`d-data-header\`, \`d-data-row\`, \`d-data-cell\` | Row hover highlight |
| **Form Control** | \`d-control\` | Focus ring, placeholder, disabled, error via \`aria-invalid\` |
| **Section Rhythm** | \`d-section\` | Auto-spacing between adjacent sections, density-aware |
| **Inline Annotation** | \`d-annotation\` | \`data-status="success\\|error\\|warning\\|info"\` |
| **Section Label** | \`d-label\` | \`data-anchor\` for accent-border section headers |

**Common UI idioms (use these before hand-rolling):**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Text Link** | \`d-link\` | \`data-variant="subtle\\|strong"\`, active state via \`aria-current="page"\` or \`data-active="true"\` |
| **Icon Button** | \`d-icon-btn\` | \`data-size="sm\\|lg"\`, \`data-variant="primary"\`, hover/focus-visible/disabled |
| **Nav Link** | \`d-nav-link\` | Active state via \`aria-current="page"\` or \`data-active="true"\` (accent left-border pill) |
| **Stepper Chip** | \`d-step-chip\` | \`data-step-state="pending\\|active\\|done"\` |
| **Divider utilities** | \`d-divider-top\`, \`d-divider-bottom\`, \`d-divider-left\`, \`d-divider-right\`, \`d-divider\` | Single-side border rule, or standalone \`<hr className="d-divider">\` |

**Spatial / graph patterns (for canvases with positioned nodes):**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Agent Node** | \`d-agent-node\` | Card sized for graph canvases (200-260px wide). \`data-status="active\\|error"\` for highlights (error adds red border-glow shadow, active adds accent border). Pair with absolute positioning on the canvas parent. |
| **Connection Port** | \`d-port\` | \`data-side="left\\|right\\|top\\|bottom"\` positions the 8px dot on the node edge. \`data-active="true"\` colors it with accent. Use as a slot inside \`d-agent-node\` so SVG connection paths can anchor to predictable element coordinates via \`getBoundingClientRect\`. |

**Banners / prominent CTAs:**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **CTA Banner** | \`d-cta-banner\` | \`data-size="compact\\|hero"\` (default is between). Gradient wash from primary to accent. Theme can override via \`--d-cta-gradient\` / \`--d-cta-text\` CSS vars. |
| **Dark-Pill Button** | \`d-interactive\` + \`data-variant="dark"\` | Pill-shaped dark-on-accent CTA for use inside \`d-cta-banner\`. Theme can override via \`--d-cta-pill-bg\` / \`--d-cta-pill-text\`. |

**Shell layouts (do NOT hand-roll these):**

| Treatment | Class | Purpose / States |
|-----------|-------|------------------|
| **Shell root** | \`d-shell\` | Full-viewport root container. \`data-layout="sidebar-main\\|centered"\` switches the layout model (default is top-nav-footer-style: vertical flex with sticky header). |
| **Sidebar** | \`d-shell-sidebar\` | Left 240px nav column. \`data-collapsed="true"\` switches to a 64px rail. Below \`_mdmax:\` auto-becomes an off-canvas drawer — toggle via \`data-mobile-open="true"\`. |
| **Main** | \`d-shell-main\` | Remaining-width column to the right of the sidebar (or the full content area in top-nav shells). Handles scroll internally. |
| **Header** | \`d-shell-header\` | 52px sticky top bar with horizontal flex layout. Use inside \`d-shell-main\` (sidebar-main shells) or at the top of \`d-shell\` (top-nav shells). |
| **Body** | \`d-shell-body\` | Scrollable main region. \`data-padding="compact\\|spacious\\|none"\` overrides the default 1rem padding. |
| **Footer** | \`d-shell-footer\` | Narrow band below the body with top border. |
| **Centered card** | \`d-shell-centered-card\` | The content parent inside \`d-shell[data-layout="centered"]\`. Caps width at 28rem. |

**Auth / confirmation layouts use \`d-shell[data-layout="centered"] + d-shell-centered-card\`. Dashboard-style layouts use \`d-shell[data-layout="sidebar-main"] + d-shell-sidebar + d-shell-main (> d-shell-header + d-shell-body)\`. Marketing / public pages use \`d-shell\` (default) with \`d-shell-header\` at the top and \`d-shell-body\` + \`d-shell-footer\`.**

Do NOT hand-roll \`.shell-sidebar\`, \`.shell-centered\`, \`.shell-tnf\`, \`.sidebar-main-layout\`, or similar class names. They exist as treatments.

**Modal / palette chrome:**

| Treatment | Class | Purpose / States |
|-----------|-------|------------------|
| **Modal root** | \`d-modal\` | Fixed-position overlay covering the viewport. \`data-align="top"\` shifts content to top 15vh (common for command palettes). |
| **Modal backdrop** | \`d-modal-backdrop\` | Scrim with backdrop-blur. Place as a sibling inside \`d-modal\` with \`onClick\` to close. |
| **Modal panel** | \`d-modal-panel\` | The actual dialog content. \`data-size="sm\\|lg"\` adjusts max-width (default 32rem). |
| **Command palette** | \`d-palette\` | Specialized modal-panel variant for command palettes — 40rem wide, 60vh max-height. |
| **Palette input** | \`d-palette-input\` | Search input at top of palette. |
| **Palette list** | \`d-palette-list\` | Scrollable command list. |
| **Palette row** | \`d-palette-row\` | Individual command row. \`data-active="true"\` for keyboard-highlighted row. |
| **Palette section** | \`d-palette-section\` | Uppercase section label inside palette (e.g., "Navigation"). |
| **Keyboard chip** | \`d-kbd\` | Mono-font key hint. Use inside \`<kbd>\` for accessibility. |

Composition pattern for a command palette:
\`\`\`tsx
<div className="d-modal" data-align="top">
  <div className="d-modal-backdrop" onClick={close} />
  <div className="d-palette">
    <input className="d-palette-input" placeholder="Type a command..." />
    <ul className="d-palette-list">
      <li className="d-palette-section">Navigation</li>
      <li className="d-palette-row" data-active={i === selectedIndex}>
        <Bot /> Go to Agents
        <kbd className="d-kbd">g a</kbd>
      </li>
    </ul>
  </div>
</div>
\`\`\`

**Guidance for cold scaffolds:**
- If your component is an icon-only action trigger, it's a \`d-icon-btn\`, not a stripped-down \`d-interactive\`.
- Breadcrumb / footer / inline body-copy links use \`d-link\`.
- Sidebar and top-nav route links use \`d-nav-link\`. Match active state by setting \`aria-current="page"\` (preferred — accessible) or \`data-active="true"\`.
- Checkout / onboarding stepper position indicators use \`d-step-chip\`.
- Horizontal rules between card sections use \`d-divider-top\` / \`d-divider-bottom\` as a container modifier, or \`<hr className="d-divider">\` as a standalone element.
- Do NOT create \`.nav-link\`, \`.icon-btn\`, \`.sidebar-link\`, \`.step-chip\`, \`.divider-top\` (or similar) as custom classes. They exist as treatments.

### Icons — use Lucide

Decantr scaffolds ship with \`lucide-react\` pre-installed. When personality prose says "Lucide icons" (or the section/pattern contract references icon names), import them from there:

\`\`\`tsx
import { Bot, ShoppingBag, Settings, Activity, Gauge, Cpu } from 'lucide-react';

<Bot className={css('_w5 _h5')} aria-hidden="true" />
\`\`\`

- Tree-shaking keeps the bundle at ~1.5-3 KB per icon used.
- Do NOT inline SVGs or import an alternative icon library without an explicit contract directive.
- When a navigation item declares an \`icon\` field (see section \`navigation_items\`), the value is the Lucide icon name in kebab-case — e.g., \`"shopping-bag"\` → \`import { ShoppingBag } from 'lucide-react'\`.
- Default sizing: \`_w5 _h5\` (20px) for inline icons, \`_w4 _h4\` (16px) inside dense chrome, \`_w6 _h6\` (24px) for primary slots.

### Composition

Atoms + treatment + theme decorator:

\`\`\`tsx
<button className={css('_px4 _py2') + ' d-interactive'} data-variant="primary">Deploy</button>
<div className={css('_flex _col _gap4') + ' d-surface carbon-glass'}>Card</div>
<span className="d-annotation" data-status="success">Active</span>
\`\`\`

- **Atoms:** \`css('_flex _col _gap4')\` — processed by @decantr/css runtime
- **Treatments:** \`d-interactive\`, \`d-surface\` — semantic base styles from treatments.css
- **Theme decorators:** \`carbon-glass\`, \`carbon-code\` — theme-specific decoration from treatments.css
- **Combined:** \`css('_flex _col') + ' d-surface carbon-card'\`

\`\`\`tsx
// Responsive prefix — applies at breakpoint and above:
css('_col _sm:row')

// Pseudo prefix:
css('_bgprimary _h:bgprimary/80')
\`\`\`

### Prefix and Arbitrary Value Syntax

- Responsive prefixes are part of the atom token itself: \`_sm:gc2\`, \`_md:flex\`, \`_lg:row\`.
- Pseudo prefixes are also token-prefixed: \`_h:bgprimary/80\`, \`_f:borderprimary\`, \`_fv:shadowmd\`.
- Arbitrary values use square brackets when the standard scale is not enough: \`_w[512px]\`, \`_h[100vh]\`, \`_p[clamp(1rem,3vw,2rem)]\`, \`_z[40]\`.
- When you see bracket atoms in shell or page contracts, treat them as first-class Decantr syntax, not as an error or a cue to fall back to inline styles.

### Responsive Breakpoint Atoms

Decantr ships two families of responsive prefixes. Use them directly inside \`css(...)\` — no \`matchMedia\` JS needed for simple responsive switches.

**Mobile-first (min-width):**
| Prefix | Breakpoint | Meaning |
|--------|-----------|---------|
| \`_sm:\` | ≥ 640px | small tablet / large phone landscape and up |
| \`_md:\` | ≥ 768px | tablet portrait and up |
| \`_lg:\` | ≥ 1024px | tablet landscape / small desktop and up |
| \`_xl:\` | ≥ 1280px | desktop and up |

**Desktop-first (max-width, for "hide below" / "swap at small" expressions):**
| Prefix | Breakpoint | Meaning |
|--------|-----------|---------|
| \`_smmax:\` | < 640px | phone only |
| \`_mdmax:\` | < 768px | phone + small tablet |
| \`_lgmax:\` | < 1024px | below tablet-landscape |
| \`_xlmax:\` | < 1280px | below desktop |

Pseudo-class stacking works with both (e.g., \`_mdmax:h:bgmuted\`, \`_sm:fv:ring2\`).

**Example:**
\`\`\`
// 1-column on phone, 2-column from tablet, 3-column from desktop
css('_grid _gc1 _sm:gc2 _lg:gc3')

// Hide the minimap below tablet portrait
css('_block _mdmax:none')

// Show the hamburger below tablet portrait, hide it above
css('_none _mdmax:block')
\`\`\`

Prefer these atoms over \`window.matchMedia\` in JS. Reserve JS responsive checks for cases where the component tree ITSELF must change shape (e.g., rendering a different React component), not just styling.

### Atom Reference

#### Display
| Atom | CSS |
|------|-----|
| \`_flex\` | \`display:flex\` |
| \`_grid\` | \`display:grid\` |
| \`_block\` | \`display:block\` |
| \`_inline\` | \`display:inline\` |
| \`_inlineflex\` | \`display:inline-flex\` |
| \`_none\` | \`display:none\` |
| \`_contents\` | \`display:contents\` |

#### Flexbox
| Atom | CSS |
|------|-----|
| \`_col\` | \`flex-direction:column\` |
| \`_row\` | \`flex-direction:row\` |
| \`_colrev\` | \`flex-direction:column-reverse\` |
| \`_wrap\` | \`flex-wrap:wrap\` |
| \`_nowrap\` | \`flex-wrap:nowrap\` |
| \`_flex1\` | \`flex:1\` |
| \`_flex0\` | \`flex:none\` |
| \`_flexauto\` | \`flex:auto\` |
| \`_grow\` | \`flex-grow:1\` |
| \`_grow0\` | \`flex-grow:0\` |
| \`_shrink0\` | \`flex-shrink:0\` |

#### Alignment
| Atom | CSS |
|------|-----|
| \`_aic\` | \`align-items:center\` |
| \`_aifs\` | \`align-items:flex-start\` |
| \`_aife\` | \`align-items:flex-end\` |
| \`_aist\` | \`align-items:stretch\` |
| \`_aibl\` | \`align-items:baseline\` |
| \`_jcc\` | \`justify-content:center\` |
| \`_jcfs\` | \`justify-content:flex-start\` |
| \`_jcfe\` | \`justify-content:flex-end\` |
| \`_jcsb\` | \`justify-content:space-between\` |
| \`_jcsa\` | \`justify-content:space-around\` |
| \`_jcse\` | \`justify-content:space-evenly\` |
| \`_pic\` | \`place-items:center\` |
| \`_pcc\` | \`place-content:center\` |

#### Spacing (scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, ...)
| Atom | CSS | Notes |
|------|-----|-------|
| \`_gap{n}\` | \`gap:{scale}\` | e.g. \`_gap4\` = \`gap:1rem\` |
| \`_gx{n}\` | \`column-gap:{scale}\` | horizontal gap |
| \`_gy{n}\` | \`row-gap:{scale}\` | vertical gap |
| \`_p{n}\` | \`padding:{scale}\` | all sides |
| \`_pt{n}\`, \`_pr{n}\`, \`_pb{n}\`, \`_pl{n}\` | directional padding | top/right/bottom/left |
| \`_px{n}\` | \`padding-inline:{scale}\` | horizontal |
| \`_py{n}\` | \`padding-block:{scale}\` | vertical |
| \`_m{n}\` | \`margin:{scale}\` | same as padding variants |
| \`_mx{n}\`, \`_my{n}\` | inline/block margin | horizontal/vertical |
| \`_mauto\` | \`margin:auto\` | center in flex/grid |
| \`_mtauto\`, \`_mbauto\` | \`margin-top:auto\` / \`margin-bottom:auto\` | pin to bottom/top of flex column |
| \`_mlauto\`, \`_mrauto\` | \`margin-left:auto\` / \`margin-right:auto\` | pin to right/left in a row |
| \`_mxauto\`, \`_myauto\` | inline/block margin: auto | center horizontally/vertically |

#### Sizing
| Atom | CSS |
|------|-----|
| \`_wfull\` / \`_w100\` | \`width:100%\` |
| \`_hfull\` / \`_h100\` | \`height:100%\` |
| \`_wscreen\` | \`width:100vw\` |
| \`_hscreen\` | \`height:100vh\` |
| \`_wfit\` | \`width:fit-content\` |
| \`_hfit\` | \`height:fit-content\` |
| \`_wauto\` | \`width:auto\` |
| \`_minw0\` | \`min-width:0\` |
| \`_minh0\` | \`min-height:0\` |
| \`_w{n}\`, \`_h{n}\` | width/height from spacing scale |
| \`_minw{n}\`, \`_maxw{n}\` | min/max width from scale |

#### Text Size
| Atom | Size | Line-height |
|------|------|-------------|
| \`_textxs\` | 0.75rem | 1rem |
| \`_textsm\` | 0.875rem | 1.25rem |
| \`_textbase\` | 1rem | 1.5rem |
| \`_textlg\` | 1.125rem | 1.75rem |
| \`_textxl\` | 1.25rem | 1.75rem |
| \`_text2xl\` | 1.5rem | 2rem |
| \`_text3xl\` | 1.875rem | 2.25rem |
| \`_heading1\`-\`_heading6\` | Heading presets (size + weight) |

#### Text Style
| Atom | CSS |
|------|-----|
| \`_fontbold\` | \`font-weight:700\` |
| \`_fontsemi\` | \`font-weight:600\` |
| \`_fontmedium\` | \`font-weight:500\` |
| \`_fontlight\` | \`font-weight:300\` |
| \`_italic\` | \`font-style:italic\` |
| \`_underline\` | \`text-decoration:underline\` |
| \`_uppercase\` | \`text-transform:uppercase\` |
| \`_truncate\` | overflow ellipsis + nowrap |
| \`_textl\`, \`_textc\`, \`_textr\` | text-align left/center/right |

#### Color (theme variable based)
| Atom | CSS |
|------|-----|
| \`_bgprimary\` | \`background:var(--d-primary)\` |
| \`_bgaccent\` | \`background:var(--d-accent)\` |
| \`_bgsecondary\` | \`background:var(--d-secondary)\` |
| \`_bgsurface\` | \`background:var(--d-surface)\` |
| \`_bgsurface0\`-\`_bgsurface2\` | surface elevation layers |
| \`_bgmuted\` | \`background:var(--d-muted)\` |
| \`_bgbg\` | \`background:var(--d-bg)\` |
| \`_bgtransparent\` | \`background:transparent\` |
| \`_bgsuccess\`, \`_bgerror\`, \`_bgwarning\`, \`_bginfo\` | status backgrounds |
| \`_fgprimary\` | \`color:var(--d-primary)\` |
| \`_fgaccent\` | \`color:var(--d-accent)\` |
| \`_fgsecondary\` | \`color:var(--d-secondary)\` |
| \`_fgtext\` | \`color:var(--d-text)\` |
| \`_fgmuted\` | \`color:var(--d-text-muted)\` |
| \`_fgwhite\`, \`_fgblack\`, \`_fginherit\` | absolute/inherited text colors |
| \`_fgsuccess\`, \`_fgerror\`, \`_fgwarning\`, \`_fginfo\` | status text |
| \`_bcprimary\` | \`border-color:var(--d-primary)\` |
| \`_bcaccent\` | \`border-color:var(--d-accent)\` |
| \`_bcborder\` | \`border-color:var(--d-border)\` |
| \`_bcmuted\` | \`border-color:var(--d-muted)\` |
| \`_bctransparent\` | \`border-color:transparent\` |

#### Overflow & Whitespace
| Atom | CSS |
|------|-----|
| \`_overhidden\` | \`overflow:hidden\` |
| \`_overauto\` | \`overflow:auto\` |
| \`_overscroll\` | \`overflow:scroll\` |
| \`_overxauto\`, \`_overyauto\` | axis-specific overflow |
| \`_nowraptext\` | \`white-space:nowrap\` |
| \`_prewrap\` | \`white-space:pre-wrap\` |
| \`_breakword\` | \`overflow-wrap:break-word\` |

#### Cursor & Interaction
| Atom | CSS |
|------|-----|
| \`_pointer\` | \`cursor:pointer\` |
| \`_cursordefault\` | \`cursor:default\` |
| \`_notallowed\` | \`cursor:not-allowed\` |
| \`_grab\` | \`cursor:grab\` |
| \`_selectnone\` | \`user-select:none\` |
| \`_ptrnone\` | \`pointer-events:none\` |

#### Position & Layout
| Atom | CSS |
|------|-----|
| \`_rel\` | \`position:relative\` |
| \`_abs\` | \`position:absolute\` |
| \`_fixed\` | \`position:fixed\` |
| \`_sticky\` | \`position:sticky\` |
| \`_inset0\` | \`inset:0\` |
| \`_top0\`, \`_right0\`, \`_bottom0\`, \`_left0\` | edge positioning |
| \`_z10\`-\`_z50\` | z-index scale |

#### Grid
| Atom | CSS |
|------|-----|
| \`_gc1\`-\`_gc12\` | \`grid-template-columns:repeat(N,...)\` |
| \`_gr1\`-\`_gr6\` | \`grid-template-rows:repeat(N,...)\` |
| \`_span1\`-\`_span12\`, \`_spanfull\` | column span |
| \`_rowspan1\`-\`_rowspan6\` | row span |

#### Visual
| Atom | CSS |
|------|-----|
| \`_rounded\` | \`border-radius:var(--d-radius)\` |
| \`_roundedfull\` | \`border-radius:9999px\` |
| \`_roundedsm\`, \`_roundedlg\`, \`_roundedxl\` | radius variants |
| \`_shadow\`, \`_shadowmd\`, \`_shadowlg\` | box-shadow presets |
| \`_bordernone\` | \`border:none\` |
| \`_bw{n}\` | \`border-width:{n}px\` |
| \`_op0\`-\`_op100\` | opacity (0, 25, 50, 75, 100) |
| \`_trans\` | \`transition:all 0.15s ease\` |
| \`_visible\`, \`_invisible\` | visibility |

Responsive prefixes: \`_sm:\`, \`_md:\`, \`_lg:\`, \`_xl:\` (e.g. \`_sm:gc2\`, \`_md:flex\`, \`_lg:row\`).

### Section Labels

Use the d-label class for uppercase section headings.
Anchor with a left accent border: \`border-left: 2px solid var(--d-accent); padding-left: 0.5rem\`.

### Empty States

Every data-driven section should handle zero-data gracefully.
Pattern: centered 48px muted icon + descriptive message + optional CTA button.

### Page Transitions

If the theme provides motion tokens, apply the \`entrance-fade\` class to page content containers for smooth page-to-page transitions.

### Navigation Shortcuts

If the essence defines hotkeys or command_palette, implement as keyboard event listeners (useEffect + keydown) — not as visible UI text.
Missing declared navigation features are contract drift, not optional polish.

### Design Tokens

| Token | Purpose | Use for |
|-------|---------|---------|
| \`--d-primary\` | Primary brand color | Buttons, links, focus rings |
| \`--d-surface\`, \`--d-surface-raised\` | Surface backgrounds | Cards, panels |
| \`--d-bg\` | Page background | Body, main container |
| \`--d-border\` | Border color | Dividers, card borders |
| \`--d-text\`, \`--d-text-muted\` | Text colors | Body text, secondary text |
| \`--d-success\`, \`--d-error\`, \`--d-warning\`, \`--d-info\` | Status colors | Alerts, badges, toasts |
| \`--d-shadow\`, \`--d-shadow-lg\` | Elevation shadows | Cards, overlays |
| \`--d-radius\`, \`--d-radius-lg\` | Border radii | Buttons, cards |
| \`--d-font-mono\` | Monospace font stack | Code, metrics, data |
| \`--d-duration-hover\` | Hover transition | Interactive elements |
| \`--d-easing\` | Animation easing | All transitions |
| \`--d-accent-glow\` | Glow color | Hover effects, focus rings |

### Routing

Check \`decantr.essence.json\` → \`meta.platform.routing\` for the routing strategy. The value is also rendered at the top of \`.decantr/context/scaffold-pack.md\` with a mechanical router-name hint — trust the pack.

- \`"history"\` (modern SPA default) → use \`BrowserRouter\` from \`react-router-dom\`. Regular URLs like \`/login\`, \`/agents\`. Works on Vite dev, Vercel, Netlify, Cloudflare Pages, and most modern hosts (SPA fallback is automatic on those platforms).
- \`"hash"\` → use \`HashRouter\` from \`react-router-dom\`. URLs are prefixed with \`/#\` (e.g., \`/#/login\`). Only needed when deploying to a static host without SPA fallback (e.g., vanilla GitHub Pages).
- \`"pathname"\` → framework-native file-based routing (Next.js App Router).

Do **not** pick a router based on personal preference. Match the declared \`routing\` value exactly — it's the contract.

Routes are defined in \`decantr.essence.json\` → \`blueprint.routes\` and listed in \`.decantr/context/scaffold.md\`.

### SEO Expectations by Platform

- For hash-routed SPA scaffolds, focus SEO work on the root document: document title, description, Open Graph/Twitter meta, and any root-level JSON-LD that the contract calls for.
- Do **not** invent SSR-only per-route metadata systems for a clearly hash-routed scaffold.
- For history-mode SPAs and SSR-style projects, per-route metadata can be richer (set \`document.title\` and meta tags via a route-level effect on SPA; use framework primitives on SSR), but it still needs to follow the declared route contract instead of introducing off-contract marketing pages.

### Layout Rules

1. **Never nest d-surface inside d-surface.** Inner sections use plain containers with padding atoms.
2. **Shell regions are frames, not surfaces.** Sidebar and header use var(--d-surface) or var(--d-bg) directly. Apply d-surface only to content cards within the body region.
3. **One scroll container per region.** Body has overflow-y-auto. Sidebar nav has its own overflow-y-auto. Never nest additional scrollable wrappers.
4. **d-section spacing is self-contained.** Each d-section owns its padding. The d-section + d-section rule adds a separator. Do NOT add extra margin between adjacent sections.
5. **Responsive nav rules.** Hamburger menus appear ONLY below the shell collapse breakpoint. Full nav shows above it.

### Responsive Breakpoints

The \`@decantr/css\` atom breakpoints are the canonical defaults. See the "Responsive Breakpoint Atoms" section below for the full table. Shell-level guidance:

- **\`_smmax:\` (< 640px — phone):** hamburger drawer, single-column stack, full-bleed content. Pattern-level content stacks vertically unless the pattern explicitly declares otherwise.
- **\`_mdmax:\` (< 768px — phone + small tablet):** most patterns should use this as the "stack to a single column / hide secondary chrome" breakpoint. This is the level where \`top-nav-footer\` mid-nav links should collapse to a hamburger.
- **\`_lgmax:\` (< 1024px — below tablet-landscape):** \`sidebar-main\` shells should collapse the persistent sidebar into a drawer here. Do **not** keep the sidebar open below \`_lg:\` — at 768-1023px it leaves the main canvas too cramped for data-dense mission-control content.
- **\`_lg:\` (≥ 1024px — tablet-landscape / small desktop):** full \`sidebar-main\` layout; responsive multi-column grids.
- **\`_xl:\` (≥ 1280px — desktop):** canonical layout.

Implementation: prefer the \`@decantr/css\` breakpoint atoms (\`_sm:\`, \`_md:\`, \`_lg:\`, \`_xl:\`, \`_smmax:\`, \`_mdmax:\`, \`_lgmax:\`, \`_xlmax:\`) or structured \`responsive\` fields on patterns. Use \`window.matchMedia\` only when the React component tree itself must change shape per viewport (e.g., rendering a different component), not just styling.

**High-density content patterns** (swarm canvases, trace-waterfall, data tables with 8+ columns) should declare explicit mobile-reflow behavior — stack vertically, collapse to a list, or define a \`desktop-only\` directive and render a lighter alternative pattern below \`_md:\`. Without this, horizontal overflow on phone viewports is the default failure mode.

### Accessibility Defaults

- If \`dna.accessibility.skip_nav = true\`, add a visible-on-focus skip link such as \`<a href="#main-content" className="skip-link">Skip to content</a>\`.
- Pair that skip link with a real main landmark target such as \`<main id="main-content">\`.
- Keep keyboard focus visible with \`:focus-visible\` treatments on custom interactive surfaces, not just browser defaults.
- Implement shell-level accessibility and routing behaviors as reusable structure or shared helpers, not one-off inline patches. Compact header sizing, responsive sidebar collapse, and skip-nav targets should be consistent across the shell, not re-solved page by page.

### Motion Philosophy

Every interaction should feel responsive and polished. Apply motion by default, not as an afterthought:

- **Page transitions:** Apply entrance-fade (or the personality entrance animation) to the main content area on route change
- **Stagger children:** Lists, grids, and card groups should stagger-animate on mount (50-100ms delay per item)
- **Data visualization:** Charts, gauges, progress bars, and counters should animate to their values on mount — never render static
- **Micro-interactions:** All interactive elements (buttons, toggles, cards, nav items) need hover/press transitions. Use the motion tokens (--d-duration-hover, --d-easing) for consistency.
- **Scroll reveals:** Sections below the fold should fade-in on scroll intersection (IntersectionObserver, once)
- **Reduced motion:** Wrap all animations in a \`@media (prefers-reduced-motion: reduce)\` media query — skip animation, keep state changes instant. The media query is the correct gate at any time regardless of the DNA \`reduce_motion\` flag — it hands control to the user's OS-level preference.

**\`dna.motion.reduce_motion = true\` does NOT mean "disable motion in all code."** It means: the generated CSS must include a reviewed \`@media (prefers-reduced-motion: reduce)\` block (the scaffold already emits one in \`global.css\`). Do not branch component code on the DNA flag to unconditionally suppress animations — that would kill the personality's explicit motion directives (e.g., "pulse animations", "fade-in reveals") even for users whose OS allows motion. Always gate at the CSS level via the media query, never at the TS/JS level via a hardcoded constant.

### Interactivity Philosophy

Build for wow factor. When a pattern describes a canvas, graph, map, or spatial visualization, implement it as a **fully interactive surface**, not a static illustration:

- **Drag and drop:** Nodes, cards, and items on spatial canvases should be draggable. Use pointer events with proper grab/grabbing cursors.
- **Pan and zoom:** Canvases and large visualizations should support pan (click-drag on background) and zoom (scroll wheel or pinch). Show zoom level indicator.
- **Connections:** When nodes exist in a graph/topology view, they should have visible connection lines. Implement click-to-select + click-target for connecting nodes.
- **Live state:** Data-driven visualizations should update in real-time with simulated data. Status changes should animate (color transitions, pulse effects).
- **Direct manipulation:** Prefer drag-to-reorder over dropdown menus. Prefer inline editing over modal forms. Prefer resize handles over fixed layouts.
- **Hover reveals:** Show contextual information (tooltips, expanded cards, action menus) on hover — don't require clicks to discover functionality.`;

/**
 * Generate DECANTR.md for v3.1 essences.
 *
 * Prepends a project brief section with key design identity,
 * then appends the methodology primer from the template.
 */
function generateDecantrMdV31(params: {
  guardMode: string;
  cssApproach: string;
  workflowMode?: 'greenfield-scaffold' | 'brownfield-attach';
  blueprintId?: string;
  themeName?: string;
  themeMode?: string;
  themeShape?: string;
  personality?: string[];
  sections?: Array<{ id: string; role: string }>;
  features?: string[];
  decorators?: Array<{ name: string; description: string }>;
  decoratorDefinitions?: Record<string, {
    intent?: string;
    css?: Record<string, string>;
    suggested_properties?: Record<string, string>;
    hover_properties?: Record<string, string>;
    focus_properties?: Record<string, string>;
    active_properties?: Record<string, string>;
    pairs_with?: string[] | string;
    usage?: string[];
  }>;
}): string {
  const template = loadTemplate('DECANTR.md.template');
  const body = renderTemplate(template, {
    GUARD_MODE: params.guardMode,
    CSS_APPROACH: params.cssApproach,
    WORKFLOW_MODE: params.workflowMode === 'brownfield-attach' ? 'brownfield attach' : 'greenfield scaffold',
    WORKFLOW_GUIDANCE: params.workflowMode === 'brownfield-attach'
      ? `This project is using Decantr in **brownfield attach** mode.\n\nRead \`.decantr/analysis.json\` first for the detected framework, routes, styling, layout, and dependency facts.\nThen read \`.decantr/init-seed.json\` for the recommended attach defaults.\nThen read \`.decantr/context/scaffold-pack.md\` and \`.decantr/context/scaffold.md\` to understand the Decantr contract you are layering onto the existing app.\n\nPreserve the current framework, package manager, router, and working runtime structure unless the contract gives you a reviewed reason to change them. Map existing routes and components onto the declared Decantr sections/pages before creating new files. Registry content is optional in this workflow unless the task explicitly asks for it.`
      : `This project is using Decantr in **greenfield scaffold** mode.\n\nTreat the compiled execution-pack files as the primary source of truth.\nUse narrative docs only as secondary explanation when the compiled packs are not enough.\nUse only files present in this workspace as the source of truth. If local scaffold files disagree, stop and report the mismatch instead of relying on external Decantr assumptions or prior examples.\n\nRead \`.decantr/context/scaffold-pack.md\` first for the compact compiled shell, theme, feature, and route contract.\nThen read \`.decantr/context/scaffold.md\` for the fuller app overview, topology, route map, and voice guidance.\nStart implementation from the shell layouts and shared route structure before filling in section pages.`,
  });

  // Build project brief
  const briefLines: string[] = [];
  briefLines.push('## Project Brief');
  briefLines.push('');
  briefLines.push(`- **Blueprint:** ${params.blueprintId || 'custom'}`);
  const themeDesc = `${params.themeName || 'default'} (${params.themeMode || 'dark'} mode${params.themeShape ? `, ${params.themeShape} shape` : ''})`;
  briefLines.push(`- **Theme:** ${themeDesc}`);
  briefLines.push(`- **Workflow:** ${params.workflowMode === 'brownfield-attach' ? 'brownfield attach' : 'greenfield scaffold'}`);
  if (params.personality && params.personality.length > 0) {
    briefLines.push(`- **Personality:** ${params.personality.join('. ')}`);
  }
  if (params.sections && params.sections.length > 0) {
    const sectionList = params.sections.map(s => `${s.id} [${s.role}]`).join(', ');
    briefLines.push(`- **Sections:** ${params.sections.length} (${sectionList})`);
  }
  if (params.features && params.features.length > 0) {
    briefLines.push(`- **Features:** ${params.features.join(', ')}`);
  }
  briefLines.push(`- **Guard mode:** ${params.guardMode}`);
  briefLines.push('');

  if (params.decoratorDefinitions && Object.keys(params.decoratorDefinitions).length > 0) {
    briefLines.push('### Decorator Quick Reference');
    briefLines.push('| Class | Intent | Key CSS |');
    briefLines.push('|-------|--------|---------|');
    for (const [name, def] of Object.entries(params.decoratorDefinitions)) {
      const intent = def.intent || '';
      // P0-5 fix: theme JSONs use `suggested_properties` (plus hover/focus/
      // active variants), not a `css` key. Prior logic read `def.css` which
      // was always undefined, leaving the column empty for every decorator.
      // Compose a concise summary preferring suggested_properties, falling
      // back to `css` for legacy content, and summarizing state-variants.
      const props = def.suggested_properties ?? def.css ?? {};
      const base = Object.entries(props)
        .map(([p, v]) => `${p}: ${v}`)
        .join('; ');
      const hasHover = def.hover_properties && Object.keys(def.hover_properties).length > 0;
      const hasFocus = def.focus_properties && Object.keys(def.focus_properties).length > 0;
      const hasActive = def.active_properties && Object.keys(def.active_properties).length > 0;
      const stateMarkers = [hasHover && ':hover', hasFocus && ':focus-visible', hasActive && ':active']
        .filter((m): m is string => Boolean(m));
      const stateSuffix = stateMarkers.length > 0 ? ` _(+ ${stateMarkers.join(', ')})_` : '';
      briefLines.push(`| \`.${name}\` | ${intent} | ${base}${stateSuffix} |`);
    }
    briefLines.push('');
  } else if (params.decorators && params.decorators.length > 0) {
    briefLines.push('### Decorator Quick Reference');
    briefLines.push('| Class | Purpose |');
    briefLines.push('|-------|---------|');
    for (const d of params.decorators) {
      briefLines.push(`| \`.${d.name}\` | ${d.description} |`);
    }
    briefLines.push('');
  }

  // Development Workflow section
  briefLines.push('## Development Workflow');
  briefLines.push('');
  briefLines.push('The essence file (`decantr.essence.json`) is the source of truth for your project\'s structure. Context files in `.decantr/context/` are derived from it. When you need to add, remove, or modify pages, sections, or features:');
  briefLines.push('');
  briefLines.push('**1. Update the essence** (use CLI commands for consistency):');
  briefLines.push('- `decantr add page {section}/{page} --route /{path}`');
  briefLines.push('- `decantr add section {archetype}`');
  briefLines.push('- `decantr add feature {name}` (or `--section {id}` for scoped)');
  briefLines.push('- `decantr remove page {section}/{page}`');
  briefLines.push('- `decantr remove section {id}`');
  briefLines.push('- `decantr remove feature {name}`');
  briefLines.push('- `decantr theme switch {name}`');
  briefLines.push('');
  briefLines.push('**2. Regenerate context:** `decantr refresh`');
  briefLines.push('');
  briefLines.push('**3. Read the updated context files**, then build.');
  briefLines.push('');
  briefLines.push('**Rules:**');
  briefLines.push('- Never create page components for routes that don\'t exist in the essence');
  briefLines.push('- Never delete pages without removing them from the essence');
  briefLines.push('- Always refresh after mutations — stale context files lead to drift');
  briefLines.push('- If you edit the essence directly, run `decantr refresh` before building');
  briefLines.push('');
  briefLines.push('---');
  briefLines.push('');

  return briefLines.join('\n') + body;
}

/**
 * Generate project.json from detection results.
 */
function generateProjectJson(
  detected: DetectedProject,
  options: InitOptions,
  registrySource: 'api' | 'cache'
): string {
  const now = new Date().toISOString();

  const data: Record<string, unknown> = {
    detected: {
      framework: detected.framework,
      version: detected.version || null,
      packageManager: detected.packageManager,
      hasTypeScript: detected.hasTypeScript,
      hasTailwind: detected.hasTailwind,
      existingRuleFiles: detected.existingRuleFiles,
    },
    overrides: {
      framework: options.target !== detected.framework ? options.target : null,
    },
    sync: {
      status: registrySource === 'api' ? 'synced' : 'needs-sync',
      lastSync: now,
      registrySource,
      cachedContent: {
        archetypes: [],
        patterns: [],
        themes: [],
      },
    },
    initialized: {
      at: now,
      via: 'cli',
      version: CLI_VERSION,
      flags: buildFlagsString(options),
      workflowMode: options.workflowMode || 'greenfield-scaffold',
    },
  };

  // Store blueprint ID for later use by refreshDerivedFiles
  if (options.blueprint) {
    data.blueprintId = options.blueprint;
  }

  return JSON.stringify(data, null, 2);
}

function buildFlagsString(options: InitOptions): string {
  const flags: string[] = [];
  if (options.blueprint) flags.push(`--blueprint=${options.blueprint}`);
  if (options.theme) flags.push(`--theme=${options.theme}`);
  if (options.mode) flags.push(`--mode=${options.mode}`);
  if (options.guard) flags.push(`--guard=${options.guard}`);
  return flags.join(' ');
}

/**
 * Generate task context from a V3 essence (used by refreshDerivedFiles).
 * Extracts the same template variables as the v2 version.
 */
function generateTaskContextV3(templateName: string, essence: EssenceV3): string {
  const template = loadTemplate(templateName);

  const sections = essence.blueprint.sections && essence.blueprint.sections.length > 0
    ? essence.blueprint.sections
    : [];
  const pages = sections.length > 0
    ? sections.flatMap(s => s.pages)
    : essence.blueprint.pages || [];
  const defaultShell = sections[0]?.shell
    || essence.blueprint.shell
    || 'sidebar-main';
  const layout = pages[0]?.layout?.map(serializeLayoutItem).join(', ') || 'none';

  // Build a page-to-shell map from sections so each page shows its section's shell
  const pageShellMap = new Map<string, string>();
  for (const s of sections) {
    for (const p of s.pages) {
      pageShellMap.set(p.id, s.shell as string);
    }
  }

  const scaffoldStructure = pages.map(p => {
    const shell = pageShellMap.get(p.id) || defaultShell;
    const patterns = p.layout.length > 0
      ? `\n  - Patterns: ${p.layout.map(serializeLayoutItem).join(', ')}`
      : '';
    return `- **${p.id}** (${shell})${patterns}`;
  }).join('\n');

  const densityLevel = essence.dna.spacing?.density || 'comfortable';
  const contentGap = essence.dna.spacing?.content_gap || '_gap4';

  const vars: Record<string, string> = {
    TARGET: essence.meta.target || 'react',
    THEME_ID: essence.dna.theme.id || '',
    THEME_MODE: essence.dna.theme.mode,
    DEFAULT_SHELL: defaultShell as string,
    GUARD_MODE: essence.meta.guard.mode,
    LAYOUT: layout,
    DENSITY: densityLevel,
    CONTENT_GAP: contentGap,
    SCAFFOLD_STRUCTURE: scaffoldStructure,
  };

  return renderTemplate(template, vars);
}

function renderPackReferenceList(
  title: string,
  entries: string[],
  fallback: string,
  summaryPath = '.decantr/context/pack-manifest.json',
): string {
  if (entries.length === 0) {
    return `### ${title}\n\n- ${fallback}`;
  }

  if (entries.length <= 6) {
    return `### ${title}\n\n${entries.map(entry => `- ${entry}`).join('\n')}`;
  }

  return `### ${title}\n\n- ${entries.length} compiled references available. Use \`${summaryPath}\` to resolve the exact files for this scope.`;
}

function generateScaffoldTaskContext(
  essence: EssenceV3,
  scaffoldPack: ScaffoldExecutionPack | null,
  manifest: PackManifest | null,
): string {
  if (!scaffoldPack) {
    return generateTaskContextV3('task-scaffold.md.template', essence);
  }

  const themeShape = scaffoldPack.data.theme.shape || 'default';
  const features = scaffoldPack.data.features.length > 0
    ? scaffoldPack.data.features.join(', ')
    : 'none';
  const routePlan = scaffoldPack.data.routes.length > 0
    ? scaffoldPack.data.routes.map(route => {
        const patternSummary = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
        return `- \`${route.path}\` -> \`${route.pageId}\` [${patternSummary}]`;
      }).join('\n')
    : '- No routes declared';
  const successChecks = scaffoldPack.successChecks.map(check => `- [${check.severity}] ${check.label}`).join('\n');
  const tokenStrategy = scaffoldPack.tokenBudget.strategy.map(item => `- ${item}`).join('\n');
  const sectionRefs = manifest?.sections.map(section =>
    `Section \`${section.id}\` -> \`.decantr/context/${section.markdown}\``
  ) ?? [];
  const pageRefs = manifest?.pages.map(page =>
    `Page \`${page.id}\` -> \`.decantr/context/${page.markdown}\``
  ) ?? [];

  return `# Task Context: Scaffolding

**Enforcement Tier: Creative** — Guard rules are advisory during initial scaffolding.

## Primary Compiled Contract

- Start with \`.decantr/context/scaffold-pack.md\` for the compact route, shell, and theme contract.
- Use \`.decantr/context/scaffold.md\` only as secondary detail when the compiled pack is not enough.
- Read the route-local page packs before building each page so layout and wiring stay aligned with the compiled plan.

## Generate This Application

- Target: \`${scaffoldPack.target.adapter}\` (${scaffoldPack.target.framework || 'unknown framework'})
- Shell: \`${scaffoldPack.data.shell}\`
- Theme: \`${scaffoldPack.data.theme.id}\` (${scaffoldPack.data.theme.mode}, ${themeShape})
- Routing: \`${scaffoldPack.data.routing}\`
- Features: ${features}

## Route Plan

${routePlan}

${renderPackReferenceList('Section Packs', sectionRefs, 'No section packs were generated for this scaffold.')}

${renderPackReferenceList('Page Packs', pageRefs, 'No page packs were generated for this scaffold.')}

## Success Checks

${successChecks}

## Token Budget

- Target: ${scaffoldPack.tokenBudget.target} tokens
- Max: ${scaffoldPack.tokenBudget.max} tokens
${tokenStrategy}

Post-scaffold enforcement mode: **${essence.meta.guard.mode.toUpperCase()}**.

---

*Task context generated from Decantr execution packs*`;
}

function generateAddPageTaskContext(
  essence: EssenceV3,
  scaffoldPack: ScaffoldExecutionPack | null,
  manifest: PackManifest | null,
): string {
  if (!scaffoldPack) {
    return generateTaskContextV3('task-add-page.md.template', essence);
  }

  const routePlan = scaffoldPack.data.routes.length > 0
    ? scaffoldPack.data.routes.map(route => {
        const patternSummary = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
        return `- \`${route.path}\` -> \`${route.pageId}\` [${patternSummary}]`;
      }).join('\n')
    : '- No routes declared';
  const sectionRefs = manifest?.sections.map(section =>
    `Section \`${section.id}\` -> \`.decantr/context/${section.markdown}\``
  ) ?? [];
  const pageRefs = manifest?.pages.map(page =>
    `Page \`${page.id}\` -> \`.decantr/context/${page.markdown}\``
  ) ?? [];

  return `# Task Context: Adding Pages

**Enforcement Tier: Guided**

## Primary Compiled Contract

- Start with \`.decantr/context/mutation-add-page-pack.md\` for the add-page workflow contract.
- Use \`.decantr/context/scaffold-pack.md\` for the current route, shell, and theme contract.
- Use \`.decantr/context/pack-manifest.json\` to choose the target section before you add a route.
- After updating the essence, run \`npx @decantr/cli refresh\` so the new section/page packs exist before code generation.

## Current Scaffold Contract

- Target: \`${scaffoldPack.target.adapter}\` (${scaffoldPack.target.framework || 'unknown framework'})
- Shell: \`${scaffoldPack.data.shell}\`
- Theme: \`${scaffoldPack.data.theme.id}\` (${scaffoldPack.data.theme.mode})
- Existing routes: ${scaffoldPack.data.routes.length}

## Existing Routes

${routePlan}

${renderPackReferenceList('Section Packs', sectionRefs, 'No section packs were generated for this scaffold.')}

${renderPackReferenceList('Page Packs', pageRefs, 'No page packs were generated for this scaffold.')}

## Required Workflow

1. Add the new page to the essence before generating any code.
2. Keep the new page inside a declared section and shell contract.
3. Refresh derived files so Decantr recompiles the section and page packs.
4. Read the relevant section pack and the new page pack before implementation.

## Guided Checks

- [error] Theme identity remains \`${scaffoldPack.data.theme.id}\` until the essence changes.
- [error] The new page exists in the essence before code generation begins.
- [error] New layouts only use registry-backed patterns.
- [warn] New routes should fit the current shell and section topology instead of creating off-contract filler pages.

---

*Task context generated from Decantr execution packs*`;
}

function generateModifyTaskContext(
  essence: EssenceV3,
  scaffoldPack: ScaffoldExecutionPack | null,
  manifest: PackManifest | null,
): string {
  if (!scaffoldPack) {
    return generateTaskContextV3('task-modify.md.template', essence);
  }

  const routePlan = scaffoldPack.data.routes.length > 0
    ? scaffoldPack.data.routes.map(route => {
        const patternSummary = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
        return `- \`${route.path}\` -> \`${route.pageId}\` [${patternSummary}]`;
      }).join('\n')
    : '- No routes declared';
  const pageRefs = manifest?.pages.map(page =>
    `Page \`${page.id}\` -> \`.decantr/context/${page.markdown}\``
  ) ?? [];
  const successChecks = scaffoldPack.successChecks.map(check => `- [${check.severity}] ${check.label}`).join('\n');

  return `# Task Context: Modifying Code

**Enforcement Tier: Strict**

## Primary Compiled Contract

- Start with \`.decantr/context/mutation-modify-pack.md\` for the strict modification workflow contract.
- Start with \`decantr_get_page_context\` or the matching \`.decantr/context/page-*-pack.md\` file for the route you are editing.
- Use \`decantr_get_section_context\` when you need the richer section contract behind that route.
- If a change would alter route identity, shell identity, theme identity, or pattern contract, update the essence first and then refresh the packs.

## Current Route Topology

${routePlan}

${renderPackReferenceList('Page Packs', pageRefs, 'No page packs were generated for this scaffold.')}

## Strict Workflow

1. Identify the target page and read its compiled page pack first.
2. Compare the planned edit against the compiled route, shell, and pattern contract.
3. If the edit changes that contract, stop and update the essence before writing code.
4. Run \`npx @decantr/cli validate\` and \`npx @decantr/cli check\` after the modification.

## Strict Checks

${successChecks}
- [error] The page you modify must already exist in the compiled topology.
- [error] Pattern order and shell usage should stay aligned with the page pack unless the essence changes first.
- [warn] Use section context only as supporting detail; the page pack is the primary contract for route-local work.

---

*Task context generated from Decantr execution packs*`;
}

/**
 * Generate essence summary markdown from a V3 essence.
 * Used by refreshDerivedFiles to keep the summary in sync.
 */
function generateEssenceSummaryV3(essence: EssenceV3): string {
  const template = loadTemplate('essence-summary.md.template');

  const blueprint = essence.blueprint;
  const sections = blueprint.sections || [];
  const flatPages = blueprint.pages || [];

  // Build pages table
  let pagesTable: string;
  if (sections.length > 0) {
    const rows = sections.flatMap(s =>
      s.pages.map(p => `| ${p.id} | ${s.shell} | ${p.layout.map(serializeLayoutItem).join(', ') || 'none'} |`)
    );
    pagesTable = `| Page | Shell | Layout |\n|------|-------|--------|\n${rows.join('\n')}`;
  } else {
    const shell = (blueprint.shell ?? 'sidebar-main') as string;
    const rows = flatPages.map(p => `| ${p.id} | ${shell} | ${p.layout.map(serializeLayoutItem).join(', ') || 'none'} |`);
    pagesTable = `| Page | Shell | Layout |\n|------|-------|--------|\n${rows.join('\n')}`;
  }

  // Build features list
  const features = blueprint.features || [];
  const featuresList = features.length > 0
    ? features.map(f => `- ${f}`).join('\n')
    : '- No features specified';

  const vars: Record<string, string> = {
    ARCHETYPE: essence.meta.archetype || 'custom',
    BLUEPRINT: '',
    PERSONALITY: (essence.dna.personality || []).join(', '),
    TARGET: (essence.meta.target ?? '') as string,
    THEME_ID: (essence.dna.theme.id ?? '') as string,
    THEME_MODE: essence.dna.theme.mode as string,
    SHAPE: (essence.dna.theme.shape ?? '') as string,
    PAGES_TABLE: pagesTable,
    FEATURES_LIST: featuresList,
    GUARD_MODE: essence.meta.guard.mode,
    ENFORCE_STYLE: essence.meta.guard.dna_enforcement || 'error',
    ENFORCE_RECIPE: essence.meta.guard.blueprint_enforcement || 'warn',
    DNA_ENFORCEMENT: essence.meta.guard.dna_enforcement || 'error',
    BLUEPRINT_ENFORCEMENT: essence.meta.guard.blueprint_enforcement || 'warn',
    DENSITY: (essence.dna.spacing?.density as string) || 'comfortable',
    CONTENT_GAP: (essence.dna.spacing?.content_gap as string) || '_gap4',
    LAST_UPDATED: new Date().toISOString(),
  };

  return renderTemplate(template, vars);
}

/**
 * Update .gitignore to exclude .decantr/cache/
 */
function updateGitignore(projectRoot: string): boolean {
  const gitignorePath = join(projectRoot, '.gitignore');
  const cacheEntry = '.decantr/cache/';

  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, 'utf-8');
    if (!content.includes(cacheEntry)) {
      appendFileSync(gitignorePath, `\n# Decantr cache\n${cacheEntry}\n`);
      return true;
    }
    return false;
  } else {
    writeFileSync(gitignorePath, `# Decantr cache\n${cacheEntry}\n`);
    return true;
  }
}

/**
 * Scaffold a new Decantr project.
 *
 * Builds the essence file, writes project metadata, then delegates
 * derived file generation (DECANTR.md, section contexts, scaffold.md,
 * CSS) to `refreshDerivedFiles`.
 */
export async function scaffoldProject(
  projectRoot: string,
  options: InitOptions,
  detected: DetectedProject,
  registry: RegistryClient,
  archetypeData?: ArchetypeData,
  registrySource: 'api' | 'cache' = 'cache',
  themeData?: ThemeData,
  topologyMarkdown?: string,
  composedSections?: ComposeSectionsResult,
  routeMap?: Record<string, { section: string; page: string }>,
  patternSpecs?: Record<string, PatternSpecSummary>,
  blueprintData?: RegistryBlueprint,
): Promise<ScaffoldResult> {
  // Build v3 essence (v2 build removed — Spec 5.9)
  const essenceV3 = buildEssenceV3(options, archetypeData, themeData);

  // Create directories
  const decantrDir = join(projectRoot, '.decantr');
  const contextDir = join(decantrDir, 'context');
  const cacheDir = join(decantrDir, 'cache');

  mkdirSync(contextDir, { recursive: true });
  mkdirSync(cacheDir, { recursive: true });

  // Write v3 essence file
  const essencePath = join(projectRoot, 'decantr.essence.json');
  writeFileSync(essencePath, JSON.stringify(essenceV3, null, 2) + '\n');

  // Write project.json
  const projectJsonPath = join(decantrDir, 'project.json');
  const projectJsonStr = generateProjectJson(detected, options, registrySource);
  const projectJsonObj = JSON.parse(projectJsonStr);
  // Store voice from blueprint for use by refreshDerivedFiles
  if (blueprintData?.voice) {
    projectJsonObj.voice = blueprintData.voice;
  }
  writeFileSync(projectJsonPath, JSON.stringify(projectJsonObj, null, 2));

  // Derived task/context files are generated during refreshDerivedFiles so the
  // scaffold task can incorporate compiled execution packs after blueprint upgrades.
  const contextFiles: string[] = [];

  // V3.1 upgrade: if composedSections is provided, upgrade the essence
  if (composedSections) {
    essenceV3.version = '3.1.0';
    essenceV3.blueprint = {
      sections: composedSections.sections,
      features: composedSections.features,
      routes: routeMap || {},
    };
    if (blueprintData?.personality?.length) {
      essenceV3.dna.personality = typeof blueprintData.personality === 'string'
        ? [blueprintData.personality]
        : blueprintData.personality;
    }
    if (blueprintData?.design_constraints) {
      essenceV3.dna.constraints = blueprintData.design_constraints;
    }
    if (blueprintData?.seo_hints) {
      essenceV3.meta.seo = blueprintData.seo_hints;
    }
    if (blueprintData?.navigation) {
      essenceV3.meta.navigation = blueprintData.navigation;
    }

    // Re-write the essence file with V3.1 data
    writeFileSync(essencePath, JSON.stringify(essenceV3, null, 2) + '\n');
  }

  // Delegate derived file generation to refreshDerivedFiles
  // Pass patternSpecs through to avoid double-fetching from registry (Spec 1.8)
  const refreshResult = await refreshDerivedFiles(projectRoot, essenceV3, registry, themeData, { isInitialScaffold: true, patternSpecs });

  // Merge context files from refresh into our list
  contextFiles.push(...refreshResult.contextFiles);

  // Update .gitignore
  const gitignoreUpdated = updateGitignore(projectRoot);

  return {
    essencePath,
    decantrMdPath: refreshResult.decantrMdPath,
    projectJsonPath,
    contextFiles,
    cssFiles: refreshResult.cssFiles,
    gitignoreUpdated,
  };
}

/**
 * Scaffold a minimal offline project when no blueprint is specified and the registry is unavailable.
 * Creates the bare-minimum files needed to start working with Decantr.
 */
export function scaffoldMinimal(projectRoot: string): ScaffoldResult {
  const decantrDir = join(projectRoot, '.decantr');
  const customDir = join(decantrDir, 'custom');

  // Create .decantr/custom/ directories for all 6 content types
  const contentTypes = API_CONTENT_TYPES;
  for (const type of contentTypes) {
    mkdirSync(join(customDir, type), { recursive: true });
  }

  // Create minimal v3 decantr.essence.json
  const essence: EssenceV3 = {
    version: '3.0.0',
    dna: {
      theme: {
        id: 'default',
        mode: 'dark',
        shape: 'rounded',
      },
      spacing: {
        base_unit: 4,
        scale: 'linear',
        density: 'comfortable',
        content_gap: '_gap4',
      },
      typography: {
        scale: 'modular',
        heading_weight: 600,
        body_weight: 400,
      },
      color: {
        palette: 'semantic',
        accent_count: 1,
        cvd_preference: 'auto',
      },
      radius: {
        philosophy: 'rounded',
        base: 8,
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
        wcag_level: 'AA',
        focus_visible: true,
        skip_nav: true,
      },
      personality: ['clean', 'modern'],
    },
    blueprint: {
      shell: 'sidebar-main',
      pages: [
        { id: 'home', layout: ['hero'] },
      ],
      features: [],
    },
    meta: {
      archetype: 'custom',
      target: 'react',
      platform: getPlatformMeta('react'),
      guard: {
        mode: 'guided',
        dna_enforcement: 'error',
        blueprint_enforcement: 'off',
      },
    },
  };

  const essencePath = join(projectRoot, 'decantr.essence.json');
  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');

  // Create .decantr/project.json
  const now = new Date().toISOString();
  const projectJson = {
    detected: {
      framework: 'unknown',
      version: null,
      packageManager: 'npm',
      hasTypeScript: false,
      hasTailwind: false,
      existingRuleFiles: [],
    },
    overrides: {
      framework: null,
    },
    sync: {
      status: 'needs-sync',
      lastSync: now,
      registrySource: 'cache',
      cachedContent: {
        archetypes: [],
        patterns: [],
        themes: [],
      },
    },
    initialized: {
      at: now,
      via: 'cli',
      version: CLI_VERSION,
      flags: '--offline --minimal',
      workflowMode: 'greenfield-scaffold',
    },
  };

  const projectJsonPath = join(decantrDir, 'project.json');
  writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2));

  // Create DECANTR.md
  const decantrMdPath = join(projectRoot, 'DECANTR.md');
  const decantrMdContent = `# DECANTR.md

> This file was generated by \`decantr init\` in offline/minimal mode.
> Run \`decantr upgrade\` when online to pull full registry content.

## Two-Layer Model

This project uses the v3 Essence format with two layers:

### DNA (Immutable Design Axioms)
DNA defines the foundational design rules that must never be violated. DNA violations are **errors**.

- **Theme:** default (dark mode)
- **Spacing:** comfortable density, _gap4
- **Radius:** rounded (8px base)
- **Accessibility:** WCAG AA
- **Personality:** clean, modern

### Blueprint (Structural Layout)
Blueprint defines pages, shells, and patterns. Blueprint deviations are **warnings**.

| Page | Shell | Layout |
|------|-------|--------|
| home | sidebar-main | hero |

## Guard Mode: guided

- **DNA enforcement:** error (violations block generation)
- **Blueprint enforcement:** off (deviations are advisory)

## MCP Tools

When available, use these tools:
- \`decantr_read_essence\` — Read the current essence
- \`decantr_check_drift\` — Check for guard violations
- \`decantr_accept_drift\` — Accept a detected drift as intentional
- \`decantr_update_essence\` — Update the essence spec

## Quick Start

1. Edit \`decantr.essence.json\` to define your project structure.
2. Run \`decantr sync\` when online to fetch registry content.
3. Use \`decantr create <type> <name>\` to create custom content.
4. Use \`decantr validate\` to check your essence file.

## Commands

- \`decantr init\` — Initialize a new Decantr project
- \`decantr status\` — Project health and DNA/Blueprint overview
- \`decantr sync\` — Sync registry content
- \`decantr audit\` — Audit project for issues
- \`decantr migrate\` — Migrate v2 essence to v3
- \`decantr check\` — Detect drift issues
- \`decantr sync-drift\` — Review and resolve drift entries
- \`decantr validate\` — Validate essence file
- \`decantr search\` — Search the registry
- \`decantr suggest\` — Suggest patterns or alternatives
- \`decantr get\` — Get full details of a registry item
- \`decantr list\` — List items by type
- \`decantr theme\` — Manage custom themes
- \`decantr create\` — Create custom content items
- \`decantr publish\` — Publish custom content to registry
- \`decantr login\` — Authenticate with registry
- \`decantr logout\` — Remove stored credentials
- \`decantr upgrade\` — Check for content updates

---

*Generated by @decantr/cli v${CLI_VERSION}*
`;
  writeFileSync(decantrMdPath, decantrMdContent);

  // Update .gitignore
  const gitignoreUpdated = updateGitignore(projectRoot);

  return {
    essencePath,
    decantrMdPath,
    projectJsonPath,
    contextFiles: [],
    cssFiles: [],
    gitignoreUpdated,
  };
}

// ── Refresh Derived Files ──

export interface RefreshResult {
  decantrMdPath: string;
  contextFiles: string[];
  cssFiles: string[];
}

export interface WrittenPackBundleArtifacts {
  paths: string[];
  scaffoldPackPath: string;
  reviewPackPath: string;
  manifestPath: string;
}

function writeExecutionPackArtifacts(
  basePathWithoutExtension: string,
  pack: ExecutionPackBase<unknown>,
): string {
  const markdownPath = `${basePathWithoutExtension}.md`;
  const jsonPath = `${basePathWithoutExtension}.json`;
  writeFileSync(markdownPath, pack.renderedMarkdown);
  writeFileSync(jsonPath, JSON.stringify(pack, null, 2) + '\n');
  return markdownPath;
}

export function writeExecutionPackBundleArtifacts(
  contextDir: string,
  bundle: ExecutionPackBundle,
): WrittenPackBundleArtifacts {
  mkdirSync(contextDir, { recursive: true });

  const outputPaths: string[] = [];
  const scaffoldPackPath = writeExecutionPackArtifacts(join(contextDir, 'scaffold-pack'), bundle.scaffold);
  outputPaths.push(scaffoldPackPath);

  const reviewPackPath = writeExecutionPackArtifacts(join(contextDir, 'review-pack'), bundle.review);
  outputPaths.push(reviewPackPath);

  for (const sectionPack of bundle.sections) {
    const sectionPackPath = writeExecutionPackArtifacts(
      join(contextDir, `section-${sectionPack.data.sectionId}-pack`),
      sectionPack,
    );
    outputPaths.push(sectionPackPath);
  }

  for (const pagePack of bundle.pages) {
    const pagePackPath = writeExecutionPackArtifacts(
      join(contextDir, `page-${pagePack.data.pageId}-pack`),
      pagePack,
    );
    outputPaths.push(pagePackPath);
  }

  for (const mutationPack of bundle.mutations) {
    const mutationPackPath = writeExecutionPackArtifacts(
      join(contextDir, `mutation-${mutationPack.data.mutationType}-pack`),
      mutationPack,
    );
    outputPaths.push(mutationPackPath);
  }

  const manifestPath = join(contextDir, 'pack-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(bundle.manifest, null, 2) + '\n');
  outputPaths.push(manifestPath);

  return {
    paths: outputPaths,
    scaffoldPackPath,
    reviewPackPath,
    manifestPath,
  };
}

interface GeneratedPackContexts {
  paths: string[];
  scaffoldPack: ScaffoldExecutionPack | null;
  manifest: ExecutionPackManifest | null;
}

async function generatePackContexts(
  projectRoot: string,
  contextDir: string,
  essence: EssenceV3,
): Promise<GeneratedPackContexts> {
  const emptyResult: GeneratedPackContexts = {
    paths: [],
    scaffoldPack: null,
    manifest: null,
  };

  const cacheRoot = join(projectRoot, '.decantr', 'cache', '@official');
  if (!existsSync(cacheRoot)) return emptyResult;

  const customRoot = join(projectRoot, '.decantr', 'custom');
  const overridePaths = existsSync(customRoot) ? [customRoot] : undefined;

  try {
    const bundle: ExecutionPackBundle = await compileExecutionPackBundle(essence, {
      contentRoot: cacheRoot,
      overridePaths,
    });

    const writtenArtifacts = writeExecutionPackBundleArtifacts(contextDir, bundle);

    return {
      paths: writtenArtifacts.paths,
      scaffoldPack: bundle.scaffold,
      manifest: bundle.manifest,
    };
  } catch (err) {
    // P0-A1 fix: log the compilation failure instead of silently falling
    // through to narrative-only output. The cloud-platform harness run
    // (2026-04-24) found a 200-inline-style drift directly caused by
    // pack files being silently absent. The user now sees the actual
    // reason (essence validation failed, pattern resolution failed, etc.)
    // and can fix it instead of guessing why packs are missing.
    const YELLOW = '\x1b[33m';
    const DIM = '\x1b[2m';
    const RESET = '\x1b[0m';
    const message = err instanceof Error ? err.message : String(err);
    // Trim AJV-style long validation messages to something an LLM / user
    // can scan. Keep the first sentence, drop the repeated " , ..." joins.
    const short = message.length > 240
      ? message.slice(0, 220) + '… (truncated)'
      : message;
    console.warn(`${YELLOW}⚠  Execution pack compilation failed — scaffold will ship narrative-only context.${RESET}`);
    console.warn(`${DIM}   Reason: ${short}${RESET}`);
    console.warn(`${DIM}   Cold-scaffolding LLMs won't get scaffold-pack.md / section-*-pack.md / page-*-pack.md.${RESET}`);
    console.warn(`${DIM}   This is a known drift source — fix the underlying issue and re-run \`decantr refresh\`.${RESET}`);
    return emptyResult;
  }
}

/**
 * Resolve a single pattern spec: use prefetched data if available and complete,
 * otherwise fetch from registry and enrich. Falls back to synthetic generation.
 *
 * A prefetched spec is considered "complete" if it already has layout_hints or
 * visual_brief fields — the enriched fields that cmdInit's fetch omits.
 */
async function resolvePatternSpec(
  name: string,
  registry: RegistryClient,
  prefetched?: PatternSpecSummary,
  includeExtendedFields = true,
): Promise<PatternSpecSummary | null> {
  // If prefetched spec has extended fields, use it directly
  if (prefetched && (prefetched.layout_hints || prefetched.visual_brief || !includeExtendedFields)) {
    // Ensure synthetic enrichment for empty components
    if (!prefetched.components || prefetched.components.length === 0) {
      const syntheticComps = generateSyntheticComponents(name, prefetched.description);
      if (syntheticComps.length > 0) prefetched.components = syntheticComps;
    }
    // Ensure synthetic slots if empty
    if (!prefetched.slots || Object.keys(prefetched.slots).length === 0) {
      const synthetic = generateSyntheticSlots(name, prefetched.description);
      if (Object.keys(synthetic).length > 0) prefetched.slots = synthetic;
    }
    return prefetched;
  }

  // Fetch from registry (full spec with extended fields)
  try {
    const patResult = await registry.fetchPattern(name);
    if (patResult?.data) {
      return mapRegistryPatternToPatternSpecSummary(patResult.data, prefetched, includeExtendedFields);
    }
  } catch { /* fetch failed */ }

  // Use prefetched even if incomplete (better than nothing)
  if (prefetched) {
    if (!prefetched.components || prefetched.components.length === 0) {
      const syntheticComps = generateSyntheticComponents(name, prefetched.description);
      if (syntheticComps.length > 0) prefetched.components = syntheticComps;
    }
    if (!prefetched.slots || Object.keys(prefetched.slots).length === 0) {
      const synthetic = generateSyntheticSlots(name, prefetched.description);
      if (Object.keys(synthetic).length > 0) prefetched.slots = synthetic;
    }
    return prefetched;
  }

  // No prefetched, no registry — generate synthetic
  const syntheticSlots = generateSyntheticSlots(name, '');
  const syntheticComps = generateSyntheticComponents(name, '');
  if (Object.keys(syntheticSlots).length > 0 || syntheticComps.length > 0) {
    return { description: '', components: syntheticComps, slots: syntheticSlots };
  }
  return null;
}

/**
 * Regenerate all derived files from an existing essence + registry.
 *
 * This is the standalone function that `decantr refresh` will call.
 * It reads everything it needs from the essence JSON (theme name from
 * dna.theme.id, sections from
 * blueprint.sections, etc.) and fetches theme/pattern data
 * from the RegistryClient.
 *
 * Works with both V3.0 (flat pages, no sections) and V3.1 (sectioned).
 */
export async function refreshDerivedFiles(
  projectRoot: string,
  essence: EssenceV3,
  registry: RegistryClient,
  prefetchedThemeData?: ThemeData,
  options?: { isInitialScaffold?: boolean; patternSpecs?: Record<string, PatternSpecSummary> },
): Promise<RefreshResult> {
  const decantrDir = join(projectRoot, '.decantr');
  const contextDir = join(decantrDir, 'context');
  mkdirSync(contextDir, { recursive: true });

  // ── Read project.json for stored metadata (blueprintId, voice) ──
  type StoredProjectJson = {
    blueprintId?: string;
    voice?: RegistryBlueprint['voice'];
    initialized?: {
      workflowMode?: 'greenfield-scaffold' | 'brownfield-attach';
    };
    [key: string]: unknown;
  };

  let storedBlueprintId: string | undefined;
  let storedVoice: ScaffoldContextInput['voice'] | undefined;
  let storedWorkflowMode: 'greenfield-scaffold' | 'brownfield-attach' | undefined;
  const projectJsonFilePath = join(decantrDir, 'project.json');
  let projectJsonData: StoredProjectJson = {};
  if (existsSync(projectJsonFilePath)) {
    try {
      projectJsonData = JSON.parse(readFileSync(projectJsonFilePath, 'utf-8')) as StoredProjectJson;
      if (projectJsonData.blueprintId) storedBlueprintId = projectJsonData.blueprintId;
      if (projectJsonData.voice) storedVoice = projectJsonData.voice;
      if (projectJsonData.initialized?.workflowMode) storedWorkflowMode = projectJsonData.initialized.workflowMode;
    } catch { /* ignore parse errors */ }
  }

  // If voice is missing but blueprintId is available, fetch from blueprint
  if (!storedVoice && storedBlueprintId) {
    try {
      const bpResult = await registry.fetchBlueprint(storedBlueprintId);
      if (bpResult?.data) {
        if (bpResult.data.voice) {
          storedVoice = bpResult.data.voice;
          // Persist voice to project.json for future refreshes
          projectJsonData.voice = bpResult.data.voice;
          writeFileSync(projectJsonFilePath, JSON.stringify(projectJsonData, null, 2));
        }
      }
    } catch { /* blueprint fetch failed — continue without voice */ }
  }

  // ── Extract info from essence ──
  const themeName = essence.dna.theme.id || 'default';
  const mode = essence.dna.theme.mode as string;
  const guardMode = essence.meta.guard.mode;
  const guardConfig = {
    mode: guardMode,
    dna_enforcement: essence.meta.guard.dna_enforcement || 'error',
    blueprint_enforcement: essence.meta.guard.blueprint_enforcement || 'warn',
  };
  const personality = essence.dna.personality || [];

  // ── Fetch theme from registry (use prefetched if available) ──
  // The theme now contains ALL data: seed, palette, decorators, spatial, treatments, etc.
  let themeData: ThemeData | undefined = prefetchedThemeData;

  if (!themeData) try {
    const themeResult = await registry.fetchTheme(themeName);
    if (themeResult?.data) {
      themeData = mapRegistryThemeToThemeData(themeResult.data);
    }
  } catch { /* continue without theme data */ }

  // Fallback: direct API fetch if registry client returned incomplete data
  if (!themeData?.seed?.primary) {
    try {
      const apiUrl = registry.getApiUrl();
      const resp = await fetch(`${apiUrl}/themes/@official/${themeName}`);
      if (resp.ok) {
        const apiData = await resp.json() as Record<string, unknown>;
        const inner = (apiData.data ?? apiData) as Record<string, unknown>;
        if (inner.seed) {
          themeData = {
            seed: inner.seed as ThemeData['seed'],
            palette: inner.palette as ThemeData['palette'],
            cvd_support: inner.cvd_support as ThemeData['cvd_support'],
            tokens: inner.tokens as ThemeData['tokens'],
            typography: inner.typography as ThemeData['typography'],
            motion: inner.motion as ThemeData['motion'],
            decorators: inner.decorators as ThemeData['decorators'],
            treatments: inner.treatments as ThemeData['treatments'],
            spatial: inner.spatial as ThemeData['spatial'],
            radius: inner.radius as ThemeData['radius'],
            shell: inner.shell as ThemeData['shell'],
            effects: inner.effects as ThemeData['effects'],
            compositions: inner.compositions as ThemeData['compositions'],
            pattern_preferences: inner.pattern_preferences as ThemeData['pattern_preferences'],
          };
        }
      }
    } catch { /* API unavailable */ }
  }

  // ── Generate CSS files ──
  const stylesDir = join(projectRoot, 'src', 'styles');
  mkdirSync(stylesDir, { recursive: true });

  // Compute spatial tokens from density + theme spatial hints
  const densityLevel = (essence.dna?.spacing?.density || 'comfortable') as 'compact' | 'comfortable' | 'spacious';
  const spatialTokens = computeSpatialTokens(densityLevel, themeData?.spatial ? {
    section_padding: themeData.spatial.section_padding ?? undefined,
    density_bias: typeof themeData.spatial.density_bias === 'number' ? themeData.spatial.density_bias : undefined,
    content_gap_shift: themeData.spatial.content_gap_shift,
  } : undefined);

  const tokensPath = join(stylesDir, 'tokens.css');
  // Only overwrite tokens.css if we have meaningful theme data (seed colors present);
  // preserve existing file if theme fetch returned empty/incomplete data
  const hasRealThemeData = themeData?.seed?.primary || themeData?.palette?.background;
  if (hasRealThemeData || !existsSync(tokensPath)) {
    // Warn loudly when the blueprint asks for a theme-mode the theme doesn't
    // carry palette values for. Previously this was silent and scaffolds got
    // the "wrong" visual mode vs. their personality directive. The token
    // emitter falls back to mode-aware defaults, but the user should know.
    if (themeData?.palette && mode && mode !== 'auto') {
      const paletteEntries = Object.values(themeData.palette) as Array<Record<string, string> | undefined>;
      const modeDefined = paletteEntries.some((entry) => entry && typeof entry === 'object' && entry[mode]);
      if (!modeDefined) {
        const supportedModes = Array.from(new Set(
          paletteEntries.flatMap((entry) => (entry && typeof entry === 'object') ? Object.keys(entry) : []),
        )).sort();
        const YELLOW = '\x1b[33m';
        const RESET = '\x1b[0m';
        console.warn(`${YELLOW}⚠  Theme "${themeName}" does not define a "${mode}" palette variant.${RESET}`);
        console.warn(`${YELLOW}   Supported modes in palette: ${supportedModes.join(', ') || 'none'}.${RESET}`);
        console.warn(`${YELLOW}   Tokens will use mode-aware defaults so the scaffold still renders a legible "${mode}" UI,`);
        console.warn(`${YELLOW}   but the theme's personality may not land. Consider picking a different theme or adding`);
        console.warn(`${YELLOW}   "${mode}" keys to the theme's palette in decantr-content.${RESET}`);
      }
    }
    writeFileSync(tokensPath, generateTokensCSS(themeData, mode, spatialTokens));
  }

  // Write treatments.css (replaces decorators.css)
  const treatmentsPath = join(stylesDir, 'treatments.css');
  let treatmentCSS = generateTreatmentCSS(
    spatialTokens,
    themeData?.treatments,
    themeData?.decorators,
    themeName,
    themeData?.decorator_definitions,
  );
  const personalityCSS = generatePersonalityCSS(personality || [], themeData || {});
  treatmentCSS += personalityCSS;
  writeFileSync(treatmentsPath, treatmentCSS);

  const globalPath = join(stylesDir, 'global.css');
  // Only generate global.css if it doesn't exist (don't overwrite user customizations)
  if (!existsSync(globalPath)) {
    writeFileSync(globalPath, generateGlobalCSS(personality, essence));
  }

  const cssFiles = [tokensPath, treatmentsPath, globalPath];

  // ── Build decorator list for DECANTR.md and section contexts ──
  const earlyDecoratorList: Array<{ name: string; description: string }> = [];
  if (themeData?.decorators) {
    for (const [name, desc] of Object.entries(themeData.decorators)) {
      earlyDecoratorList.push({ name, description: desc as string });
    }
  }

  // ── Collect all features across sections ──
  const allFeatures: string[] = [];
  const sectionSummaries: Array<{ id: string; role: string }> = [];
  if (essence.blueprint.sections && essence.blueprint.sections.length > 0) {
    for (const s of essence.blueprint.sections) {
      sectionSummaries.push({ id: s.id, role: s.role });
      if (s.features) {
        for (const f of s.features) {
          if (!allFeatures.includes(f)) allFeatures.push(f);
        }
      }
    }
  }
  if (essence.blueprint.features) {
    for (const f of essence.blueprint.features) {
      if (!allFeatures.includes(f)) allFeatures.push(f);
    }
  }

  // ── Generate DECANTR.md ──
  const decantrMdPath = join(projectRoot, 'DECANTR.md');
  writeFileSync(decantrMdPath, generateDecantrMdV31({
    guardMode,
    cssApproach: CSS_APPROACH_CONTENT,
    workflowMode: storedWorkflowMode,
    blueprintId: storedBlueprintId || getLegacyBlueprintId(essence.meta) || undefined,
    themeName,
    themeMode: mode,
    themeShape: essence.dna.theme.shape || undefined,
    personality,
    sections: sectionSummaries.length > 0 ? sectionSummaries : undefined,
    features: allFeatures.length > 0 ? allFeatures : undefined,
    decorators: earlyDecoratorList.length > 0 ? earlyDecoratorList : undefined,
    decoratorDefinitions: themeData?.decorator_definitions as Record<string, { intent?: string; css?: Record<string, string>; pairs_with?: string; usage?: string[] }> | undefined,
  }));

  // ── Generate essence-summary.md only for V3.0 flat projects ──
  // For V3.1 (sectioned), scaffold.md covers the same overview — skip to save tokens.
  const hasSections = essence.blueprint.sections && essence.blueprint.sections.length > 0;
  const contextFiles: string[] = [];

  if (!hasSections) {
    const summaryPath = join(contextDir, 'essence-summary.md');
    writeFileSync(summaryPath, generateEssenceSummaryV3(essence));
    contextFiles.push(summaryPath);
  }

  const packContexts = await generatePackContexts(projectRoot, contextDir, essence);

  const scaffoldTaskPath = join(contextDir, 'task-scaffold.md');
  writeFileSync(
    scaffoldTaskPath,
    generateScaffoldTaskContext(essence, packContexts.scaffoldPack, packContexts.manifest),
  );
  contextFiles.push(scaffoldTaskPath);

  // ── Generate mutation task contexts (skipped during init, generated on refresh/add/remove) ──
  if (!options?.isInitialScaffold) {
    const addPagePath = join(contextDir, 'task-add-page.md');
    writeFileSync(
      addPagePath,
      generateAddPageTaskContext(essence, packContexts.scaffoldPack, packContexts.manifest),
    );
    contextFiles.push(addPagePath);

    const modifyPath = join(contextDir, 'task-modify.md');
    writeFileSync(
      modifyPath,
      generateModifyTaskContext(essence, packContexts.scaffoldPack, packContexts.manifest),
    );
    contextFiles.push(modifyPath);
  }

  const blueprint = essence.blueprint;

  // V3.1: has sections array
  const sections: EssenceV31Section[] = blueprint.sections && blueprint.sections.length > 0
    ? blueprint.sections
    : [];

  if (sections.length > 0) {
    // ── Resolve "inherit" shell to actual primary shell ──
    const primarySectionShell = sections.find(s => s.role === 'primary')?.shell || 'sidebar-main';
    for (const section of sections) {
      if (section.shell === 'inherit') {
        section.shell = primarySectionShell;
      }
    }

    // ── Resolve pattern specs for all patterns in all sections ──
    // Uses prefetched specs from cmdInit when available (Spec 1.8),
    // enriching with extended fields from registry as needed.
    const prefetchedSpecs = options?.patternSpecs;
    const patternSpecs: Record<string, PatternSpecSummary> = {};
    const seenPatterns = new Set<string>();

    for (const section of sections) {
      for (const page of section.pages) {
        for (const item of page.layout) {
          const names = extractPatternNames(item);
          for (const name of names) {
            if (!seenPatterns.has(name)) {
              seenPatterns.add(name);
              const spec = await resolvePatternSpec(name, registry, prefetchedSpecs?.[name], true);
              if (spec) patternSpecs[name] = spec;
            }
          }
        }
      }
    }

    // ── Derive topology ──
    const zoneInputs: ZoneInput[] = sections.map(s => ({
      archetypeId: s.id,
      role: s.role,
      shell: s.shell as string,
      features: s.features,
      description: s.description,
    }));

    const zones = deriveZones(zoneInputs);
    const transitions = deriveTransitions(zones);

    const hasPublic = zones.some(z => z.role === 'public');
    const hasPrimary = zones.some(z => z.role === 'primary');

    const topologyData: TopologyData = {
      intent: sections.map(s => s.id).join(' + '),
      zones,
      transitions,
      entryPoints: {
        anonymous: hasPublic ? 'public zone' : 'gateway',
        authenticated: hasPrimary ? 'primary zone' : 'first section',
      },
    };

    const topologyMarkdown = generateTopologySection(topologyData, personality);

    // ── Read generated tokens.css for inlining in section contexts ──
    const themeTokensCss = existsSync(tokensPath) ? readFileSync(tokensPath, 'utf-8') : '';

    // ── Build decorator list from theme data or existing CSS ──
    const decoratorList: Array<{ name: string; description: string }> = [];
    if (themeData?.decorators) {
      for (const [name, desc] of Object.entries(themeData.decorators)) {
        decoratorList.push({ name, description: desc as string });
      }
    }
    // Decorator data comes from themeData.decorators; no file fallback needed

    // ── Fetch shell specs for structural info ──
    const shellInfoCache: Record<string, ShellInfo> = {};
    const seenShells = new Set<string>();
    for (const section of sections) {
      const shellId = section.shell as string;
      if (!seenShells.has(shellId)) {
        seenShells.add(shellId);
        try {
          const shellResult = await registry.fetchShell(shellId);
          if (shellResult?.data) {
            shellInfoCache[shellId] = mapRegistryShellToShellInfo(shellResult.data);
          }
        } catch { /* continue without shell info */ }
      }
    }

    // ── Generate section context files ──
    for (const section of sections) {
      const zoneLabel = section.role === 'primary' || section.role === 'auxiliary'
        ? 'App' : section.role === 'gateway' ? 'Gateway' : 'Public';
      let zoneContext = `**Zone:** ${zoneLabel} (${section.role}) — ${section.shell} shell`;
      if (section.role === 'gateway') {
        zoneContext += '\nAuth success → enters App zone. Sign out returns here.';
      } else if (section.role === 'primary') {
        zoneContext += '\nAuthenticated users land here. Sign out → Gateway (/login).';
      } else if (section.role === 'public') {
        zoneContext += '\nAnonymous visitors. CTAs lead to Gateway (/login, /register).';
      } else if (section.role === 'auxiliary') {
        zoneContext += '\nSupporting section within App zone. Shares navigation with primary.';
      }

      // Collect pattern specs for this section
      const sectionPatterns: Record<string, PatternSpecSummary> = {};
      for (const page of section.pages) {
        for (const item of page.layout) {
          const names = extractPatternNames(item);
          for (const name of names) {
            if (patternSpecs[name]) {
              sectionPatterns[name] = patternSpecs[name];
            }
          }
        }
      }

      const sectionSpatialHints = themeData?.spatial ? {
        section_padding: themeData.spatial.section_padding ?? undefined,
        density_bias: typeof themeData.spatial.density_bias === 'number' ? themeData.spatial.density_bias : undefined,
        content_gap_shift: themeData.spatial.content_gap_shift,
        label_content_gap: themeData.spatial.label_content_gap ?? undefined,
      } : undefined;

      const contextContent = generateSectionContext({
        section,
        themeTokens: themeTokensCss,
        decorators: decoratorList,
        guardConfig,
        personality,
        themeName,
        zoneContext,
        patternSpecs: sectionPatterns,
        themeHints: themeData ? {
          preferred: themeData.pattern_preferences?.prefer,
          compositions: themeData.compositions
            ? Object.entries(themeData.compositions)
                .map(([k, v]: [string, any]) => `**${k}:** ${v.description || v}`)
                .join('\n')
            : undefined,
          spatialHints: themeData.spatial
            ? `Density bias: ${themeData.spatial.density_bias || 'none'}. Section padding: ${themeData.spatial.section_padding || 'default'}. Card wrapping: ${themeData.spatial.card_wrapping || 'default'}.`
            : undefined,
        } : undefined,
        constraints: essence.dna.constraints as Record<string, unknown> | undefined,
        shellInfo: shellInfoCache[section.shell as string],
        themeData,
        themeMode: mode,
        voiceTone: storedVoice?.tone ? storedVoice.tone.split('.')[0] + '.' : undefined,
        spatialHints: sectionSpatialHints,
      });

      const sectionContextPath = join(contextDir, `section-${section.id}.md`);
      writeFileSync(sectionContextPath, contextContent);
      contextFiles.push(sectionContextPath);
    }

    // ── Generate scaffold.md ──
    const routes = blueprint.routes || {};
    const scaffoldContent = generateScaffoldContext({
      appName: essence.meta.archetype || 'Application',
      blueprintId: storedBlueprintId || getLegacyBlueprintId(essence.meta) || '',
      themeName,
      personality,
      topologyMarkdown,
      sections,
      routes,
      constraints: essence.dna.constraints as Record<string, unknown> | undefined,
      seo: essence.meta.seo as { schema_org?: string[]; meta_priorities?: string[] } | undefined,
      navigation: essence.meta.navigation as { hotkeys?: unknown[]; command_palette?: boolean } | undefined,
      voice: storedVoice,
    });

    const scaffoldMdPath = join(contextDir, 'scaffold.md');
    writeFileSync(scaffoldMdPath, scaffoldContent);
    contextFiles.push(scaffoldMdPath);

  } else {
    // ── V3.0 flat pages: generate a single section context ──
    const pages = blueprint.pages || [{ id: 'home', layout: ['hero'] }];
    const shell = (blueprint.shell ?? 'sidebar-main') as string;

    // Build a synthetic section from the flat pages
    const syntheticSection: EssenceV31Section = {
      id: essence.meta.archetype || 'default',
      role: 'primary',
      shell,
      features: blueprint.features || [],
      description: `${essence.meta.archetype || 'Application'} section`,
      pages,
    };

    // Resolve pattern specs (uses prefetched when available — Spec 1.8)
    const prefetchedSpecs = options?.patternSpecs;
    const patternSpecs: Record<string, PatternSpecSummary> = {};
    const seenPatterns = new Set<string>();
    for (const page of pages) {
      for (const item of page.layout) {
        const names = extractPatternNames(item);
        for (const name of names) {
          if (!seenPatterns.has(name)) {
            seenPatterns.add(name);
            const spec = await resolvePatternSpec(name, registry, prefetchedSpecs?.[name], false);
            if (spec) patternSpecs[name] = spec;
          }
        }
      }
    }

    const themeTokensCss = existsSync(tokensPath) ? readFileSync(tokensPath, 'utf-8') : '';
    const decoratorList: Array<{ name: string; description: string }> = [];
    if (themeData?.decorators) {
      for (const [name, desc] of Object.entries(themeData.decorators)) {
        decoratorList.push({ name, description: desc as string });
      }
    }
    // Decorator data comes from themeData.decorators; no file fallback needed

    // Fetch shell info for V3.0 flat pages
    let v30ShellInfo: ShellInfo | undefined;
    try {
      const shellResult = await registry.fetchShell(shell);
      if (shellResult?.data) {
        v30ShellInfo = mapRegistryShellToShellInfo(shellResult.data);
      }
    } catch { /* continue without shell info */ }

    const v30SpatialHints = themeData?.spatial ? {
      section_padding: themeData.spatial.section_padding ?? undefined,
      density_bias: typeof themeData.spatial.density_bias === 'number' ? themeData.spatial.density_bias : undefined,
      content_gap_shift: themeData.spatial.content_gap_shift,
      label_content_gap: themeData.spatial.label_content_gap ?? undefined,
    } : undefined;

    const contextContent = generateSectionContext({
      section: syntheticSection,
      themeTokens: themeTokensCss,
      decorators: decoratorList,
      guardConfig,
      personality,
      themeName,
      zoneContext: `This is the primary section (${shell} shell).`,
      patternSpecs,
      themeHints: themeData ? {
        preferred: themeData.pattern_preferences?.prefer,
        compositions: themeData.compositions
          ? Object.entries(themeData.compositions)
              .map(([k, v]: [string, any]) => `**${k}:** ${v.description || v}`)
              .join('\n')
          : undefined,
        spatialHints: themeData.spatial
          ? `Density bias: ${themeData.spatial.density_bias || 'none'}. Section padding: ${themeData.spatial.section_padding || 'default'}. Card wrapping: ${themeData.spatial.card_wrapping || 'default'}.`
          : undefined,
      } : undefined,
      constraints: essence.dna.constraints as Record<string, unknown> | undefined,
      shellInfo: v30ShellInfo,
      themeData,
      themeMode: mode,
      voiceTone: storedVoice?.tone ? storedVoice.tone.split('.')[0] + '.' : undefined,
      spatialHints: v30SpatialHints,
    });

    const sectionContextPath = join(contextDir, `section-${syntheticSection.id}.md`);
    writeFileSync(sectionContextPath, contextContent);
    contextFiles.push(sectionContextPath);
  }

  if (packContexts.paths.length > 0) {
    contextFiles.push(...packContexts.paths);
  }

  return {
    decantrMdPath,
    contextFiles,
    cssFiles,
  };
}

// ── Synthetic Slot Generation ──

/**
 * Generate synthetic slot descriptions for patterns that lack explicit slot definitions.
 * Uses the pattern ID and description to infer common slot structures.
 */
function generateSyntheticSlots(patternId: string, description: string): Record<string, string> {
  const desc = description.toLowerCase();
  const syntheticSlots: Record<string, string> = {};

  if (patternId.includes('feature') || desc.includes('feature')) {
    syntheticSlots['grid'] = 'Grid of feature cards (icon + title + description)';
    syntheticSlots['feature-card'] = 'Individual feature with icon, heading, and description text';
  }
  if (patternId.includes('pricing') || desc.includes('pricing')) {
    syntheticSlots['tiers'] = 'Pricing tier cards (name, price, features list, CTA button)';
    syntheticSlots['toggle'] = 'Monthly/annual billing toggle (optional)';
  }
  if (patternId.includes('testimonial') || desc.includes('testimonial')) {
    syntheticSlots['quotes'] = 'Testimonial cards (quote text, author name, role, avatar)';
  }
  if (patternId.includes('cta') || desc.includes('call-to-action') || desc.includes('call to action')) {
    syntheticSlots['headline'] = 'CTA headline text';
    syntheticSlots['description'] = 'Supporting description text';
    syntheticSlots['actions'] = 'CTA button(s)';
  }
  if (patternId.includes('how-it-works') || desc.includes('how it works') || desc.includes('timeline') || desc.includes('steps')) {
    syntheticSlots['steps'] = 'Numbered steps (step number, title, description)';
  }
  if (patternId.includes('team') || desc.includes('team')) {
    syntheticSlots['members'] = 'Team member cards (avatar, name, role)';
  }
  if (patternId.includes('story') || desc.includes('story') || desc.includes('about')) {
    syntheticSlots['content'] = 'Story/about narrative text content';
  }
  if (patternId.includes('values') || desc.includes('values')) {
    syntheticSlots['values'] = 'Value cards (icon/emoji, title, description)';
  }
  if (patternId.includes('form') || desc.includes('form') || desc.includes('contact')) {
    syntheticSlots['fields'] = 'Form fields (name, email, message, etc.)';
    syntheticSlots['submit'] = 'Submit button';
  }
  if (patternId.includes('content') || desc.includes('legal') || desc.includes('privacy') || desc.includes('policy')) {
    syntheticSlots['body'] = 'Long-form text content with headings and paragraphs';
    syntheticSlots['toc'] = 'Table of contents sidebar (optional)';
  }
  if (patternId.includes('settings') || desc.includes('settings') || desc.includes('preferences')) {
    syntheticSlots['sections'] = 'Settings sections (label, description, input/toggle)';
  }
  if (patternId.includes('security') || desc.includes('security') || desc.includes('password')) {
    syntheticSlots['sections'] = 'Security sections (password change, MFA toggle, session list)';
  }
  if (patternId.includes('session') || desc.includes('session')) {
    syntheticSlots['list'] = 'Active sessions list (device, location, last active, revoke button)';
  }
  if (patternId.includes('message') || desc.includes('message') || desc.includes('chat')) {
    syntheticSlots['messages'] = 'Message bubbles (user/assistant, content, timestamp)';
  }
  if (patternId.includes('input') && desc.includes('chat')) {
    syntheticSlots['textarea'] = 'Auto-expanding message input';
    syntheticSlots['actions'] = 'Attach file button, send button';
  }
  if (patternId.includes('empty') || desc.includes('empty')) {
    syntheticSlots['illustration'] = 'Empty state illustration or icon';
    syntheticSlots['message'] = 'Welcome/empty state message';
    syntheticSlots['suggestions'] = 'Suggested actions or prompts';
  }
  if (patternId.includes('header') && desc.includes('chat')) {
    syntheticSlots['title'] = 'Conversation title or model name';
    syntheticSlots['actions'] = 'Header action buttons (new chat, settings)';
  }

  return syntheticSlots;
}

/**
 * Generate synthetic component lists for patterns that lack explicit component definitions.
 * Uses the pattern ID and description to infer common component needs.
 */
function generateSyntheticComponents(patternId: string, description: string): string[] {
  const desc = description.toLowerCase();
  const syntheticComponents: string[] = [];

  if (patternId.includes('hero')) syntheticComponents.push('Button', 'Icon', 'Image');
  if (patternId.includes('feature')) syntheticComponents.push('Card', 'Icon', 'Text');
  if (patternId.includes('pricing')) syntheticComponents.push('Card', 'Button', 'Badge');
  if (patternId.includes('testimonial')) syntheticComponents.push('Card', 'Avatar', 'Text');
  if (patternId.includes('cta')) syntheticComponents.push('Button', 'Text');
  if (patternId.includes('form') || patternId.includes('contact')) syntheticComponents.push('Input', 'Textarea', 'Button', 'Label');
  if (patternId.includes('team')) syntheticComponents.push('Card', 'Avatar', 'Text');
  if (patternId.includes('settings') || patternId.includes('security')) syntheticComponents.push('Card', 'Toggle', 'Input', 'Button');
  if (patternId.includes('message') || patternId.includes('chat')) syntheticComponents.push('Avatar', 'Text', 'CodeBlock');
  if (patternId.includes('input') && desc.includes('chat')) syntheticComponents.push('Textarea', 'Button', 'Icon');
  if (patternId.includes('header') && desc.includes('chat')) syntheticComponents.push('Button', 'Icon', 'Text');
  if (patternId.includes('content') || patternId.includes('legal')) syntheticComponents.push('Heading', 'Text', 'List');
  if (patternId.includes('how-it-works') || patternId.includes('steps')) syntheticComponents.push('Card', 'Icon', 'Text', 'Badge');
  if (patternId.includes('values')) syntheticComponents.push('Card', 'Icon', 'Text');
  if (patternId.includes('story') || patternId.includes('about')) syntheticComponents.push('Text', 'Image');
  if (patternId.includes('empty') || patternId.includes('new')) syntheticComponents.push('Icon', 'Text', 'Button');

  return [...new Set(syntheticComponents)];
}

// ── Context Generation ──

export interface PatternSpecSummary {
  description: string;
  components: string[];
  slots: Record<string, string>;
  layout_hints?: Record<string, string>;
  // code field removed — patterns are framework-agnostic
  visual_brief?: string;
  composition?: Record<string, string>;
  motion?: { micro?: Record<string, string>; transitions?: Record<string, string>; ambient?: Record<string, string> };
  responsive?: { mobile?: string; tablet?: string; desktop?: string };
  accessibility?: { role?: string; keyboard?: string[]; announcements?: string[]; focus_management?: string };
}

export function mapRegistryPatternToPatternSpecSummary(
  pattern: RegistryPattern,
  prefetched?: PatternSpecSummary,
  includeExtendedFields = true,
): PatternSpecSummary {
  const defaultPreset = pattern.default_preset || 'standard';
  const preset = pattern.presets?.[defaultPreset];
  let slots = preset?.layout?.slots || pattern.default_layout?.slots || prefetched?.slots || {};

  if (Object.keys(slots).length === 0) {
    const synthetic = generateSyntheticSlots(pattern.id, pattern.description || prefetched?.description || '');
    if (Object.keys(synthetic).length > 0) slots = synthetic;
  }

  const spec: PatternSpecSummary = {
    description: pattern.description || prefetched?.description || '',
    components: pattern.components || prefetched?.components || [],
    slots,
    layout_hints: pattern.layout_hints,
    ...(includeExtendedFields ? {
      visual_brief: pattern.visual_brief,
      composition: pattern.composition,
      motion: pattern.motion,
      responsive: pattern.responsive,
      accessibility: pattern.accessibility ? {
        role: pattern.accessibility.role,
        keyboard: pattern.accessibility.keyboard,
        announcements: pattern.accessibility.announcements,
        focus_management: pattern.accessibility.focus_management,
      } : undefined,
    } : {}),
  };

  if (!spec.components || spec.components.length === 0) {
    const syntheticComps = generateSyntheticComponents(pattern.id, spec.description);
    if (syntheticComps.length > 0) spec.components = syntheticComps;
  }

  return spec;
}

export interface ShellInfo {
  description: string;
  regions: string[];
  layout?: string;
  guidance?: Record<string, string>;
  atoms?: string;
  config?: {
    grid?: { areas?: string[][] };
    nav?: { position?: string; width?: string; collapseTo?: string; collapseBelow?: string; defaultState?: string };
    header?: { height?: string; sticky?: boolean };
    body?: { scroll?: boolean; inputAnchored?: boolean };
    footer?: { height?: string; sticky?: boolean };
  };
  internal_layout?: Record<string, unknown>;
}

export function mapRegistryShellToShellInfo(shell: RegistryShell): ShellInfo {
  const config = isRecord(shell.config) ? shell.config : undefined;
  return {
    description: shell.description || '',
    regions: getStringArray(config?.regions),
    layout: shell.layout || undefined,
    guidance: shell.guidance,
    atoms: shell.atoms,
    config: config as ShellInfo['config'] | undefined,
    internal_layout: isRecord(shell.internal_layout) ? shell.internal_layout : undefined,
  };
}

export interface SectionContextInput {
  section: EssenceV31Section;
  themeTokens: string;
  decorators: Array<{ name: string; description: string }>;
  guardConfig: { mode: string; dna_enforcement: string; blueprint_enforcement: string };
  personality: string[];
  themeName: string;
  zoneContext: string;
  patternSpecs: Record<string, PatternSpecSummary>;
  themeHints?: { preferred?: string[]; compositions?: string; spatialHints?: string };
  constraints?: Record<string, unknown>;
  shellInfo?: ShellInfo;
  themeData?: ThemeData;
  themeMode?: string;
  voiceTone?: string;
  spatialHints?: SpatialTokenHints;
}

export interface ScaffoldContextInput {
  appName: string;
  blueprintId: string;
  themeName: string;
  personality: string[];
  topologyMarkdown: string;
  sections: EssenceV31Section[];
  routes: Record<string, RouteEntry>;
  constraints?: Record<string, unknown>;
  seo?: { schema_org?: string[]; meta_priorities?: string[] };
  navigation?: { hotkeys?: unknown[]; command_palette?: boolean };
  voice?: RegistryBlueprint['voice'];
}

// ── Shell Implementation Generator ──

/**
 * Generate a shell implementation block from internal_layout.
 * For each region, outputs its semantic properties as a structured list.
 * Handles nested sub-regions (e.g., sidebar.brand, sidebar.nav).
 * Ends with anti-patterns block.
 */
function generateShellImplementation(shellId: string, shellInfo: ShellInfo): string[] {
  const lines: string[] = [];

  lines.push(`## Shell Implementation (${shellId})`);
  lines.push('');

  if (shellInfo.internal_layout && Object.keys(shellInfo.internal_layout).length > 0) {
    for (const [region, props] of Object.entries(shellInfo.internal_layout)) {
      lines.push(`### ${region}`);
      lines.push('');
      if (isRecord(props)) {
        for (const [key, value] of Object.entries(props)) {
          if (isRecord(value)) {
            // Nested sub-region (e.g., sidebar.brand, sidebar.nav)
            lines.push(`- **${key}:**`);
            for (const [subKey, subValue] of Object.entries(value)) {
              lines.push(`  - ${subKey}: ${subValue}`);
            }
          } else {
            lines.push(`- **${key}:** ${value}`);
          }
        }
      } else {
        lines.push(`- ${props}`);
      }
      lines.push('');
    }

    // Anti-patterns
    lines.push('### Anti-patterns');
    lines.push('');
    lines.push('- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.');
    lines.push('- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.');
    lines.push('- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.');
    lines.push('');
  } else {
    // Fallback: basic info from layout/atoms/config
    if (shellInfo.layout) {
      lines.push(`**Layout:** ${shellInfo.layout}`);
      lines.push('');
    }
    if (shellInfo.atoms) {
      lines.push(`**Atoms:** \`${shellInfo.atoms}\``);
      lines.push('');
    }
    if (shellInfo.config) {
      const cfg = shellInfo.config;
      if (cfg.nav) {
        const navParts: string[] = [];
        if (cfg.nav.position) navParts.push(`position: ${cfg.nav.position}`);
        if (cfg.nav.width) navParts.push(`width: ${cfg.nav.width}`);
        if (cfg.nav.collapseTo) navParts.push(`collapses to: ${cfg.nav.collapseTo}`);
        if (cfg.nav.collapseBelow) navParts.push(`below: ${cfg.nav.collapseBelow}`);
        if (navParts.length > 0) lines.push(`**Nav:** ${navParts.join(', ')}`);
      }
      if (cfg.header) {
        const headerParts: string[] = [];
        if (cfg.header.height) headerParts.push(`height: ${cfg.header.height}`);
        if (cfg.header.sticky) headerParts.push('sticky');
        if (headerParts.length > 0) lines.push(`**Header:** ${headerParts.join(', ')}`);
      }
      if (cfg.body) {
        const bodyParts: string[] = [];
        if (cfg.body.scroll) bodyParts.push('overflow-y: auto');
        if (cfg.body.inputAnchored) bodyParts.push('input anchored to bottom');
        if (bodyParts.length > 0) lines.push(`**Body:** ${bodyParts.join(', ')}`);
      }
      if (cfg.footer) {
        const footerParts: string[] = [];
        if (cfg.footer.height) footerParts.push(`height: ${cfg.footer.height}`);
        if (cfg.footer.sticky) footerParts.push('sticky');
        if (footerParts.length > 0) lines.push(`**Footer:** ${footerParts.join(', ')}`);
      }
      lines.push('');
    }
  }

  return lines;
}

// ── Quick Start Generator ──

/**
 * Generate an 8-line summary for the section context.
 * Shell with dimensions, page count + names, key patterns,
 * CSS classes, density level, voice tone first sentence.
 */
function generateQuickStart(input: SectionContextInput): string[] {
  const { section, shellInfo, decorators, personality, voiceTone } = input;
  const lines: string[] = [];

  lines.push('## Quick Start');
  lines.push('');

  // Shell with dimensions
  const shellDesc = shellInfo?.description || `${section.shell} shell`;
  const dims: string[] = [];
  if (shellInfo?.config?.nav?.width) dims.push(`nav: ${shellInfo.config.nav.width}`);
  if (shellInfo?.config?.header?.height) dims.push(`header: ${shellInfo.config.header.height}`);
  lines.push(`**Shell:** ${shellDesc}${dims.length > 0 ? ` (${dims.join(', ')})` : ''}`);

  // Page count + names
  const pageNames = section.pages.map(p => p.id);
  lines.push(`**Pages:** ${section.pages.length} (${pageNames.join(', ')})`);

  // Key patterns (complex=8+ components, moderate=4-7)
  const patternLabels: string[] = [];
  const specEntries = Object.entries(input.patternSpecs);
  for (const [name, spec] of specEntries) {
    const count = spec.components.length;
    if (count >= 8) patternLabels.push(`${name} [complex]`);
    else if (count >= 4) patternLabels.push(`${name} [moderate]`);
    else patternLabels.push(name);
  }
  if (patternLabels.length > 0) {
    lines.push(`**Key patterns:** ${patternLabels.join(', ')}`);
  }

  // CSS classes (top 3 decorators + personality utilities)
  const cssClasses: string[] = [];
  const topDecorators = decorators.slice(0, 3).map(d => d.name);
  cssClasses.push(...topDecorators);
  const pLower = personality.join(' ').toLowerCase();
  if (pLower.includes('neon') || pLower.includes('glow')) cssClasses.push('neon-glow');
  if (pLower.includes('mono') || pLower.includes('monospace')) cssClasses.push('mono-data');
  if (cssClasses.length > 0) {
    lines.push(`**CSS classes:** ${cssClasses.map(c => `\`.${c}\``).join(', ')}`);
  }

  // Density level
  const density = section.dna_overrides?.density || 'comfortable';
  lines.push(`**Density:** ${density}`);

  // Voice tone first sentence
  if (voiceTone) {
    lines.push(`**Voice:** ${voiceTone}`);
  }

  lines.push('');
  return lines;
}

// ── Spacing Guide Generator ──

/**
 * Generate a spacing guide from density level.
 * Computes actual token values and renders as a markdown table.
 */
function generateSpacingGuide(density: string, spatialHints?: SpatialTokenHints): string[] {
  const lines: string[] = [];
  const level = (density === 'compact' || density === 'spacious') ? density : 'comfortable';
  const tokens = computeSpatialTokens(level as 'compact' | 'comfortable' | 'spacious', spatialHints);

  lines.push('## Spacing Guide');
  lines.push('');
  lines.push('| Context | Token | Value | Usage |');
  lines.push('|---------|-------|-------|-------|');
  lines.push(`| Content gap | \`--d-content-gap\` | \`${tokens['--d-content-gap']}\` | Gap between sibling elements |`);
  lines.push(`| Section padding | \`--d-section-py\` | \`${tokens['--d-section-py']}\` | Vertical padding on d-section |`);
  lines.push(`| Surface padding | \`--d-surface-p\` | \`${tokens['--d-surface-p']}\` | Inner padding for d-surface |`);
  lines.push(`| Interactive V | \`--d-interactive-py\` | \`${tokens['--d-interactive-py']}\` | Vertical padding on buttons |`);
  lines.push(`| Interactive H | \`--d-interactive-px\` | \`${tokens['--d-interactive-px']}\` | Horizontal padding on buttons |`);
  lines.push(`| Control | \`--d-control-py\` | \`${tokens['--d-control-py']}\` | Vertical padding on inputs |`);
  lines.push(`| Data row | \`--d-data-py\` | \`${tokens['--d-data-py']}\` | Vertical padding on table rows |`);
  lines.push(`| Label gap | \`--d-label-mb\` | \`${tokens['--d-label-mb']}\` | Gap below d-label section headers |`);
  lines.push(`| Label indent | \`--d-label-px\` | \`${tokens['--d-label-px']}\` | Anchor indent for d-label[data-anchor] |`);
  lines.push(`| Section gap | \`--d-section-gap\` | \`${tokens['--d-section-gap']}\` | Gap between adjacent d-sections |`);
  lines.push(`| Annotation gap | \`--d-annotation-mt\` | \`${tokens['--d-annotation-mt']}\` | Top margin on d-annotation |`);
  lines.push('');

  return lines;
}

/**
 * Generate a compact markdown context file for a single section.
 * Includes guard mode, zone context, decorators, pattern specs,
 * features, and personality. Topology and theme tokens are referenced
 * from scaffold.md and src/styles/tokens.css respectively.
 */
export function generateSectionContext(input: SectionContextInput): string {
  const { section, decorators, guardConfig, personality, themeName, zoneContext, patternSpecs, themeHints, constraints, shellInfo, spatialHints } = input;
  const lines: string[] = [];

  // Header
  lines.push(`# Section: ${section.id}`);
  lines.push('');
  lines.push(`**Role:** ${section.role} | **Shell:** ${section.shell} | **Archetype:** ${section.id}`);
  lines.push(`**Description:** ${section.description}`);
  if (section.dna_overrides) {
    const parts: string[] = [];
    if (section.dna_overrides.density) parts.push(`density: ${section.dna_overrides.density}`);
    if (section.dna_overrides.mode) parts.push(`mode: ${section.dna_overrides.mode}`);
    if (parts.length > 0) {
      lines.push(`**DNA Overrides:** ${parts.join(', ')}`);
    }
  }
  lines.push('');

  // Quick Start
  lines.push(...generateQuickStart(input));

  // Shell Implementation
  if (shellInfo) {
    lines.push(...generateShellImplementation(section.shell as string, shellInfo));
  }

  // Shell Notes — guidance from the shell definition
  if (shellInfo?.guidance && Object.keys(shellInfo.guidance).length > 0) {
    // Structured section label treatment (takes precedence over prose)
    const labelTreatment = shellInfo.guidance.section_label_treatment;
    const sectionDensity = shellInfo.guidance.section_density;

    if (labelTreatment) {
      lines.push('## Section Label Treatment');
      lines.push('');
      lines.push(`Apply \`${labelTreatment}\` to section headers in this shell.`);
      lines.push('- Uppercase monospace label typography (d-label base treatment)');
      if (labelTreatment.includes('[data-anchor]')) {
        lines.push('- Left accent border anchor (data-anchor variant)');
      }
      lines.push('- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`');
      if (sectionDensity) {
        const scaleMap: Record<string, string> = { compact: '0.65', comfortable: '1', spacious: '1.4' };
        lines.push('');
        lines.push(`Section density: ${sectionDensity} (--d-density-scale: ${scaleMap[sectionDensity] || '1'})`);
      }
      lines.push('');
    }

    // Remaining prose guidance (skip structured fields already emitted)
    const structuredKeys = new Set(['section_label_treatment', 'section_density']);
    lines.push(`## Shell Notes (${section.shell})`);
    lines.push('');
    for (const [key, value] of Object.entries(shellInfo.guidance)) {
      if (structuredKeys.has(key)) continue;
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      lines.push(`- **${label}:** ${value}`);
    }
    lines.push('');
  }

  // Theme reference — compact. Full palette, spacing guide, and decorator
  // tables live in DECANTR.md (root) to avoid ~160 lines of duplication per
  // section file. Only DNA-override deltas and decorator usage hints filtered
  // to this section's patterns are emitted locally.
  const sectionDensityOverride = section.dna_overrides?.density as string | undefined;
  const effectiveDensity = sectionDensityOverride || 'comfortable';

  lines.push('## Theme Reference');
  lines.push('');
  lines.push(`**Theme:** ${themeName} (${input.themeMode || 'dark'}) · **Density:** ${effectiveDensity}${sectionDensityOverride ? ' _(DNA override)_' : ''}`);
  lines.push('');
  lines.push('Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.');
  if (sectionDensityOverride) {
    // If the section overrides density, emit JUST the spacing guide to make
    // the override actionable without re-reading DECANTR.md.
    lines.push('');
    lines.push('Because this section overrides density, the spacing guide is emitted below:');
    lines.push('');
    lines.push(...generateSpacingGuide(effectiveDensity, spatialHints));
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Guard Rules (compact — full rules in scaffold.md)
  lines.push(`**Guard:** ${guardConfig.mode} mode | DNA violations = ${guardConfig.dna_enforcement} | Blueprint violations = ${guardConfig.blueprint_enforcement}`);
  lines.push('');

  // Decorator usage guide — filtered to section-relevant decorators only.
  // The exhaustive table stays in DECANTR.md; here we just surface the ones
  // the LLM actually needs for this section's patterns.
  const decoratorDefs = input.themeData?.decorator_definitions as Record<string, { intent?: string; css?: Record<string, string>; pairs_with?: string; usage?: string[] }> | undefined;
  if (decoratorDefs && Object.keys(decoratorDefs).length > 0) {
    const usageEntries = Object.entries(decoratorDefs).filter(([, def]) => def.usage && def.usage.length > 0);
    if (usageEntries.length > 0) {
      lines.push('**Section decorators (usage hints):**');
      for (const [name, def] of usageEntries) {
        lines.push(`- \`.${name}\`: ${(def.usage || []).join(', ')}`);
      }
      lines.push('');
    }
  } else if (decorators.length > 0) {
    lines.push('**Section decorators:**');
    for (const d of decorators) {
      lines.push(`- \`.${d.name}\` — ${d.description}`);
    }
    lines.push('');
  }
  if (themeHints) {
    if (themeHints.preferred && themeHints.preferred.length > 0) {
      // Filter to patterns relevant to this section
      const sectionPatterns = new Set(section.pages.flatMap(p => p.layout.flatMap(extractPatternNames)));
      const relevant = themeHints.preferred.filter(p => sectionPatterns.has(p));
      if (relevant.length > 0) {
        lines.push(`**Preferred:** ${relevant.join(', ')}`);
      }
    }
    if (themeHints.compositions) {
      lines.push(`**Compositions:** ${themeHints.compositions}`);
    }
    if (themeHints.spatialHints) {
      lines.push(`**Spatial hints:** ${themeHints.spatialHints}`);
    }
    lines.push('');
  }
  const themePrefix = themeName.split('-')[0] || themeName;
  lines.push('');
  lines.push(`Usage: \`className={css('_flex _col _gap4') + ' d-surface ${themePrefix}-glass'}\` — atoms via css(), treatments and theme decorators as plain class strings.`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Zone Context
  if (zoneContext) {
    lines.push(zoneContext);
    lines.push('For full app topology, see `.decantr/context/scaffold.md`');
    lines.push('');
  }

  // Features
  if (section.features.length > 0) {
    lines.push('## Features');
    lines.push('');
    lines.push(section.features.join(', '));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Personality — materialized inline with utility hints
  if (personality.length > 0) {
    const personalityText = personality.join('. ');
    lines.push('## Visual Direction');
    lines.push('');
    lines.push(`**Personality:** ${personalityText}`);
    lines.push('');
    const pLower = personalityText.toLowerCase();
    const utils: string[] = [];
    if (pLower.includes('neon') || pLower.includes('glow'))
      utils.push('`neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis');
    if (pLower.includes('mono') || pLower.includes('monospace'))
      utils.push('`mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps');
    if (pLower.includes('pulse') || pLower.includes('ring') || pLower.includes('status'))
      utils.push('`status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation');
    if (utils.length > 0) {
      lines.push('**Personality utilities available in treatments.css:**');
      for (const u of utils) lines.push(`- ${u}`);
      lines.push('');
    }
  }

  // Constraints
  if (constraints && Object.keys(constraints).length > 0) {
    lines.push('## Constraints');
    lines.push('');
    for (const [key, value] of Object.entries(constraints)) {
      lines.push(`- **${key}:** ${typeof value === 'object' && value !== null ? JSON.stringify(value) : value}`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Collect unique patterns across all pages in this section
  const uniquePatterns = new Map<string, PatternSpecSummary>();
  for (const page of section.pages) {
    const patternNames = page.layout.flatMap(extractPatternNames);
    for (const name of patternNames) {
      if (patternSpecs[name] && !uniquePatterns.has(name)) {
        uniquePatterns.set(name, patternSpecs[name]);
      }
    }
  }

  // Pattern Reference — each pattern spec listed once
  if (uniquePatterns.size > 0) {
    lines.push('## Pattern Reference');
    lines.push('');
    lines.push('Scaffold-tier rule: implement the core visual structure, states, and required slots first.');
    lines.push('Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.');
    lines.push('');
    for (const [patternName, spec] of uniquePatterns) {
      lines.push(`### ${patternName}`);
      lines.push('');
      lines.push(spec.description);
      lines.push('');
      if (spec.visual_brief) {
        lines.push(`**Visual brief:** ${spec.visual_brief}`);
        lines.push('');
      }
      lines.push(`**Components:** ${spec.components.join(', ')}`);
      lines.push('');
      if (spec.composition && Object.keys(spec.composition).length > 0) {
        lines.push('**Composition:**');
        lines.push('```');
        for (const [name, expr] of Object.entries(spec.composition)) {
          lines.push(`${name} = ${expr}`);
        }
        lines.push('```');
        lines.push('');
      }
      lines.push('**Layout slots:**');
      for (const [slot, desc] of Object.entries(spec.slots)) {
        lines.push(`- \`${slot}\`: ${desc}`);
      }
      if (spec.layout_hints && Object.keys(spec.layout_hints).length > 0) {
        lines.push(`  **Layout guidance:**`);
        for (const [key, value] of Object.entries(spec.layout_hints)) {
          lines.push(`  - ${key}: ${value}`);
        }
      }
      if (spec.motion) {
        const entries: Array<[string, string]> = [];
        const isObj = (v: unknown): v is Record<string, string> => typeof v === 'object' && v !== null && !Array.isArray(v);
        if (isObj(spec.motion.micro)) for (const [k, v] of Object.entries(spec.motion.micro)) entries.push([k, v]);
        else if (typeof spec.motion.micro === 'string') entries.push(['micro', spec.motion.micro]);
        if (isObj(spec.motion.transitions)) for (const [k, v] of Object.entries(spec.motion.transitions)) entries.push([k, v]);
        else if (typeof spec.motion.transitions === 'string') entries.push(['transitions', spec.motion.transitions]);
        if (isObj(spec.motion.ambient)) for (const [k, v] of Object.entries(spec.motion.ambient)) entries.push([k, v]);
        else if (typeof spec.motion.ambient === 'string') entries.push(['ambient', spec.motion.ambient]);
        if (entries.length > 0) {
          lines.push('**Motion:**');
          lines.push('| Interaction | Animation |');
          lines.push('|-------------|-----------|');
          for (const [k, v] of entries) lines.push(`| ${k} | ${v} |`);
          lines.push('');
        }
      }
      if (spec.responsive) {
        lines.push('**Responsive:**');
        if (spec.responsive.mobile) lines.push(`- **Mobile (<640px):** ${spec.responsive.mobile}`);
        if (spec.responsive.tablet) lines.push(`- **Tablet (640-1024px):** ${spec.responsive.tablet}`);
        if (spec.responsive.desktop) lines.push(`- **Desktop (>1024px):** ${spec.responsive.desktop}`);
        lines.push('');
      }
      if (spec.accessibility) {
        lines.push('**Accessibility:**');
        if (spec.accessibility.role) lines.push(`- Role: \`${spec.accessibility.role}\``);
        if (Array.isArray(spec.accessibility.keyboard) && spec.accessibility.keyboard.length) lines.push(`- Keyboard: ${spec.accessibility.keyboard.join('; ')}`);
        if (Array.isArray(spec.accessibility.announcements) && spec.accessibility.announcements.length) lines.push(`- Announcements: ${spec.accessibility.announcements.join('; ')}`);
        if (spec.accessibility.focus_management) lines.push(`- Focus: ${spec.accessibility.focus_management}`);
        lines.push('');
      }
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Pages — layout and mapping only, pattern specs referenced above
  lines.push('## Pages');
  lines.push('');
  for (const page of section.pages) {
    const route = page.route || `/${section.id}/${page.id}`;
    const layoutStr = page.layout.map(serializeLayoutItem).join(' → ');
    lines.push(`### ${page.id} (${route})`);
    lines.push('');
    lines.push(`Layout: ${layoutStr}`);
    lines.push('');

    // Pattern mapping table: show alias → pattern ID → preset
    if (page.patterns && page.patterns.length > 0) {
      lines.push('**Pattern mapping:**');
      lines.push('| Alias | Pattern | Preset |');
      lines.push('|-------|---------|--------|');
      for (const ref of page.patterns) {
        const alias = ref.as || ref.pattern;
        const preset = ref.preset || 'standard';
        lines.push(`| ${alias} | ${ref.pattern} | ${preset} |`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate a scaffold overview markdown for the full application.
 * Provides a high-level view of all sections, routes, and topology
 * for the initial scaffolding task.
 */
export function generateScaffoldContext(input: ScaffoldContextInput): string {
  const { appName, blueprintId, themeName, personality, topologyMarkdown, sections, routes, constraints, seo, navigation } = input;
  const lines: string[] = [];

  // Header
  lines.push(`# Scaffold: ${appName}`);
  lines.push('');
  lines.push(`**Blueprint:** ${blueprintId}`);
  lines.push(`**Theme:** ${themeName}`);
  lines.push(`**Personality:** ${personality.join(', ')}`);
  lines.push('**Guard mode:** creative (no enforcement during initial scaffolding)');
  lines.push('');

  // Voice & Copy
  if (input.voice) {
    lines.push('## Voice & Copy');
    lines.push('');
    if (input.voice.tone) lines.push(`**Tone:** ${input.voice.tone}`);
    if (input.voice.cta_verbs?.length) lines.push(`**CTA verbs:** ${input.voice.cta_verbs.join(', ')}`);
    if (input.voice.avoid?.length) lines.push(`**Avoid:** ${input.voice.avoid.join(', ')}`);
    if (input.voice.empty_states) lines.push(`**Empty states:** ${input.voice.empty_states}`);
    if (input.voice.errors) lines.push(`**Errors:** ${input.voice.errors}`);
    if (input.voice.loading) lines.push(`**Loading states:** ${input.voice.loading}`);
    if (input.voice.metrics_format) lines.push(`**Metrics format:** ${input.voice.metrics_format}`);
    lines.push('');
  }

  // Development Mode
  lines.push('## Development Mode');
  lines.push('');
  lines.push('For local development and showcases, wire all zone transitions with mock data:');
  lines.push('');
  lines.push('- **Auth bypass:** Auth pages should accept any input and redirect to the primary section\'s default route');
  lines.push('- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.');
  lines.push('- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development');
  lines.push('- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.');
  lines.push('');

  // Topology
  lines.push(topologyMarkdown);
  lines.push('');

  // Sections Overview
  lines.push('## Sections Overview');
  lines.push('');
  lines.push('| Section | Role | Shell | Pages | Features |');
  lines.push('|---------|------|-------|-------|----------|');
  for (const section of sections) {
    const pageIds = section.pages.map(p => p.id).join(', ');
    const feats = section.features.join(', ') || 'none';
    lines.push(`| ${section.id} | ${section.role} | ${section.shell} | ${pageIds} | ${feats} |`);
  }
  lines.push('');

  // Route Map
  lines.push('## Route Map');
  lines.push('');
  lines.push('| Route | Section | Page |');
  lines.push('|-------|---------|------|');
  for (const [route, entry] of Object.entries(routes)) {
    lines.push(`| ${route} | ${entry.section} | ${entry.page} |`);
  }
  lines.push('');

  // Section Context references
  lines.push('## Section Contexts');
  lines.push('');
  lines.push('For detailed pattern specs per section, read:');
  for (const section of sections) {
    lines.push(`- .decantr/context/section-${section.id}.md`);
  }
  lines.push('');

  // Shared Components — patterns appearing on 2+ pages
  const patternUsage: Record<string, string[]> = {};
  for (const section of sections) {
    for (const page of section.pages) {
      const names = page.layout.flatMap(extractPatternNames);
      for (const name of names) {
        if (!patternUsage[name]) patternUsage[name] = [];
        const pageLabel = sections.length > 1 ? `${section.id}/${page.id}` : page.id;
        patternUsage[name].push(pageLabel);
      }
    }
  }
  const sharedPatterns = Object.entries(patternUsage).filter(([, pages]) => pages.length >= 2);
  if (sharedPatterns.length > 0) {
    lines.push('## Shared Components');
    lines.push('');
    lines.push('These patterns appear on multiple pages. Consider creating shared components:');
    lines.push('');
    lines.push('| Pattern | Used by |');
    lines.push('|---------|---------|');
    for (const [pattern, pages] of sharedPatterns) {
      lines.push(`| ${pattern} | ${pages.join(', ')} |`);
    }
    lines.push('');
  }

  // Design Constraints
  if (constraints && Object.keys(constraints).length > 0) {
    lines.push('## Design Constraints');
    lines.push('');
    for (const [key, value] of Object.entries(constraints)) {
      lines.push(`- **${key}:** ${typeof value === 'object' && value !== null ? JSON.stringify(value) : value}`);
    }
    lines.push('');
  }

  // SEO Hints
  if (seo && (seo.schema_org?.length || seo.meta_priorities?.length)) {
    lines.push('## SEO Hints');
    lines.push('');
    if (seo.schema_org && seo.schema_org.length > 0) {
      lines.push(`**Schema.org types:** ${seo.schema_org.join(', ')}`);
    }
    if (seo.meta_priorities && seo.meta_priorities.length > 0) {
      lines.push(`**Meta priorities:** ${seo.meta_priorities.join(', ')}`);
    }
    lines.push('');
  }

  // Navigation
  if (navigation && (navigation.hotkeys?.length || navigation.command_palette)) {
    lines.push('## Navigation');
    lines.push('');
    if (navigation.command_palette) {
      lines.push('- Command palette: enabled');
      lines.push('- Requirement: implement a real keyboard-triggered command palette, not just placeholder UI text.');
    }
    if (navigation.hotkeys && navigation.hotkeys.length > 0) {
      lines.push(`- Hotkeys: ${navigation.hotkeys.length} configured`);
      for (const hotkey of navigation.hotkeys) {
        if (typeof hotkey === 'object' && hotkey !== null && typeof hotkey.key === 'string') {
          const target = [hotkey.label, hotkey.route || hotkey.action].filter(Boolean).join(' — ');
          lines.push(`  - \`${hotkey.key}\`${target ? `: ${target}` : ''}`);
        }
      }
      lines.push('- Requirement: implement these bindings as real keyboard shortcuts, not as decorative text.');
      lines.push('- Presentation rule: do not append hotkey text to persistent nav labels, breadcrumbs, or page titles unless the shell or route contract explicitly requests visible shortcut hints.');
    }
    lines.push('');
  }

  return lines.join('\n');
}

export { loadTemplate, renderTemplate };
