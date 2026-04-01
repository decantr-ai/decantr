import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isV3 } from '@decantr/essence-spec';
import type { EssenceV3, EssenceDNA, EssenceBlueprint, EssenceMeta, BlueprintPage, EssenceV31Section, RouteEntry } from '@decantr/essence-spec';
import type { ComposeEntry, ArchetypeRole } from '@decantr/registry';
import type { DetectedProject } from './detect.js';
import type { InitOptions } from './prompts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * A layout item can be:
 * - A string (pattern name): "kpi-grid"
 * - A pattern object: { pattern: "hero", preset: "landing", as?: "guild-hero" }
 * - A column layout: { cols: ["a", "b"], at: "lg" }
 */
export type LayoutItem = string | Record<string, unknown>;

/**
 * V2 EssenceFile shape (kept for backward compatibility of buildEssence signature).
 * New code generates v3 EssenceV3 via buildEssenceV3().
 */
export interface EssenceFile {
  version: string;
  archetype: string;
  blueprint?: string;
  theme: {
    style: string;
    mode: string;
    recipe: string;
    shape: string;
  };
  personality: string[];
  platform: {
    type: string;
    routing: string;
  };
  structure: Array<{
    id: string;
    shell: string;
    layout: LayoutItem[];
  }>;
  features: string[];
  guard: {
    enforce_style: boolean;
    enforce_recipe: boolean;
    mode: string;
  };
  density: {
    level: string;
    content_gap: string;
  };
  target: string;
  accessibility?: {
    wcag_level?: string;
    cvd_preference?: string;
  };
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
    patterns?: Array<{
      pattern: string;
      preset?: string;
      as?: string;
    }>;
  }>;
  features?: string[];
  seo_hints?: {
    schema_org?: string[];
    meta_priorities?: string[];
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
          layout: (page.default_layout?.length ? page.default_layout : ['hero']) as LayoutItem[],
          ...(page.shell !== defaultShell ? { shell_override: page.shell } : {}),
        });
      }
    } else {
      const prefix = typeof entry === 'string' ? entry : entry.prefix;
      for (const page of data.pages) {
        allPages.push({
          id: `${prefix}-${page.id}`,
          layout: (page.default_layout?.length ? page.default_layout : ['hero']) as LayoutItem[],
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
        layout: (page.default_layout?.length ? page.default_layout : ['hero']) as LayoutItem[],
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

    if (personality.length > 0) {
      lines.push(`  Tone: ${personality.join(', ')}`);
    }

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
 * Theme data for populating DECANTR.md theme quick reference.
 */
export interface ThemeData {
  seed?: Record<string, string>;
  palette?: Record<string, Record<string, string>>;
  cvd_support?: string[];
  tokens?: {
    base?: Record<string, string>;
    cvd?: Record<string, Record<string, string>>;
  };
  typography_hints?: { scale?: string; heading_weight?: number; body_weight?: number };
  motion_hints?: { preference?: string; reduce_motion_default?: boolean };
}

/**
 * Recipe data for populating DECANTR.md decorators reference.
 */
export interface RecipeData {
  decorators?: Record<string, string>;
  spatial_hints?: { density_bias?: string; content_gap_shift?: number; section_padding?: string | null; card_wrapping?: string; surface_override?: string };
  radius_hints?: { philosophy: string; base: number };
}

/**
 * Generate tokens.css from theme data.
 */
function generateTokensCSS(themeData: ThemeData | undefined, mode: string): string {
  if (!themeData) {
    return `/* No theme data available */
:root {
  --d-primary: #6366f1;
  --d-secondary: #a1a1aa;
  --d-accent: #f59e0b;
  --d-bg: #18181b;
  --d-surface: #1f1f23;
  --d-surface-raised: #27272a;
  --d-border: #3f3f46;
  --d-text: #fafafa;
  --d-text-muted: #a1a1aa;
}
`;
  }

  const seed = themeData.seed || {};
  const palette = themeData.palette || {};

  // When mode is 'auto', use 'dark' as the :root default
  const resolvedMode = mode === 'auto' ? 'dark' : mode;

  function buildTokens(tokenMode: string): Record<string, string> {
    return {
      // Seed colors
      '--d-primary': seed.primary || '#6366f1',
      '--d-secondary': seed.secondary || '#a1a1aa',
      '--d-accent': seed.accent || '#f59e0b',

      // Palette colors (mode-aware)
      '--d-bg': palette.background?.[tokenMode] || '#18181b',
      '--d-surface': palette.surface?.[tokenMode] || '#1f1f23',
      '--d-surface-raised': palette['surface-raised']?.[tokenMode] || '#27272a',
      '--d-border': palette.border?.[tokenMode] || '#3f3f46',
      '--d-text': palette.text?.[tokenMode] || '#fafafa',
      '--d-text-muted': palette['text-muted']?.[tokenMode] || '#a1a1aa',
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

      // Shadows
      '--d-shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
      '--d-shadow': '0 1px 3px rgba(0,0,0,0.1)',
      '--d-shadow-md': '0 4px 6px rgba(0,0,0,0.1)',
      '--d-shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',

      // Status colors
      '--d-success': themeData.tokens?.base?.success || '#22c55e',
      '--d-error': themeData.tokens?.base?.danger || '#ef4444',
      '--d-warning': themeData.tokens?.base?.warning || '#f59e0b',
      '--d-info': '#3b82f6',
    };
  }

  const tokens = buildTokens(resolvedMode);
  const lines = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  let css = `/* Generated by @decantr/cli */
:root {
${lines}
}
`;

  // When mode is 'auto', add a light-mode media query block
  if (mode === 'auto') {
    const lightTokens = buildTokens('light');
    // Only emit palette tokens that differ between modes
    const paletteKeys = ['--d-bg', '--d-surface', '--d-surface-raised', '--d-border', '--d-text', '--d-text-muted', '--d-primary-hover'];
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

  return css;
}

/**
 * Generate decorators.css from recipe data.
 */
function generateDecoratorsCSS(recipeData: RecipeData | undefined, themeName: string): string {
  if (!recipeData?.decorators) {
    return `/* No recipe decorators available */`;
  }

  const decorators = recipeData.decorators;
  const css: string[] = [
    `/* Generated by @decantr/cli from recipe: ${themeName} */`,
    '',
  ];

  for (const [name, description] of Object.entries(decorators)) {
    css.push(generateDecoratorRule(name, description));
    css.push('');
  }

  // Add keyframes for animations
  css.push(`/* Animation keyframes */
@keyframes decantr-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes decantr-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`);

  return css.join('\n');
}

/**
 * Generate a CSS rule from a decorator name and description.
 */
function generateDecoratorRule(name: string, description: string): string {
  const rules: string[] = [];
  const descLower = description.toLowerCase();

  // Background patterns
  if (descLower.includes('surface background') || descLower.includes('surface elevation')) {
    rules.push('background: var(--d-surface)');
  } else if (descLower.includes('background') && descLower.includes('theme')) {
    rules.push('background: var(--d-bg)');
  } else if (descLower.includes('primary-tinted') || descLower.includes('primary background')) {
    rules.push('background: color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))');
  }

  // Border patterns
  if (descLower.includes('1px border') || descLower.includes('subtle border')) {
    rules.push('border: 1px solid var(--d-border)');
  } else if (descLower.includes('border') && !descLower.includes('radius')) {
    rules.push('border: 1px solid var(--d-border)');
  }

  // Border radius patterns
  const radiusMatch = descLower.match(/(\d+)px radius/);
  if (radiusMatch) {
    rules.push(`border-radius: ${radiusMatch[1]}px`);
  } else if (descLower.includes('radius') || descLower.includes('rounded')) {
    rules.push('border-radius: var(--d-radius)');
  }

  // Shadow patterns
  if (descLower.includes('hover shadow') || descLower.includes('shadow transition')) {
    rules.push('transition: box-shadow 0.15s ease');
  }
  if (descLower.includes('elevation') || descLower.includes('shadow')) {
    rules.push('box-shadow: var(--d-shadow)');
  }

  // Animation patterns
  if (descLower.includes('entrance animation') || descLower.includes('fade')) {
    rules.push('animation: decantr-fade-in 0.2s ease-out');
  }
  if (descLower.includes('pulse animation') || descLower.includes('skeleton')) {
    rules.push('animation: decantr-pulse 1.5s ease-in-out infinite');
  }

  // Backdrop blur
  if (descLower.includes('blur') || descLower.includes('glass')) {
    rules.push('backdrop-filter: blur(8px)');
  }

  // Text alignment for bubbles
  if (descLower.includes('right-aligned')) {
    rules.push('margin-left: auto');
  } else if (descLower.includes('left-aligned')) {
    rules.push('margin-right: auto');
  }

  // Message bubbles
  if (descLower.includes('message bubble') || descLower.includes('bubble')) {
    rules.push('padding: var(--d-gap-3) var(--d-gap-4)');
    rules.push('border-radius: var(--d-radius-lg)');
    rules.push('max-width: 80%');
  }

  // Fallback if no rules matched
  if (rules.length === 0) {
    return `/* .${name}: ${description} */`;
  }

  return `.${name} {\n  ${rules.join(';\n  ')};\n}`;
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
 * Build the essence file from options and blueprint data.
 */
export function buildEssence(options: InitOptions, archetypeData?: ArchetypeData): EssenceFile {
  // Default structure if no archetype - must have at least one pattern in layout
  let structure: EssenceFile['structure'] = [
    { id: 'home', shell: options.shell, layout: ['hero'] }
  ];
  let features: string[] = options.features;

  // Use archetype structure if available
  if (archetypeData?.pages) {
    structure = archetypeData.pages.map(p => {
      // Resolve aliases to actual pattern IDs
      const resolvedLayout = (p.default_layout?.length ? p.default_layout : ['hero'])
        .map(item => resolvePatternAlias(item, p.patterns));

      return {
        id: p.id,
        shell: p.shell || options.shell,
        layout: resolvedLayout,
      };
    });
  }

  if (archetypeData?.features) {
    features = [...new Set([...features, ...archetypeData.features])];
  }

  // Map density to content gap
  const contentGapMap: Record<string, string> = {
    compact: '_gap2',
    comfortable: '_gap4',
    spacious: '_gap6',
  };

  // Use resolved archetype (from blueprint's compose or direct selection)
  const archetype = options.archetype || 'custom';

  const essence: EssenceFile = {
    version: '2.0.0',
    archetype,
    theme: {
      style: options.theme,
      mode: options.mode,
      recipe: options.theme, // Recipe defaults to theme
      shape: options.shape,
    },
    personality: options.personality,
    platform: {
      type: 'spa',
      routing: 'hash',
    },
    structure,
    features,
    guard: {
      enforce_style: true,
      enforce_recipe: true,
      mode: options.guard,
    },
    density: {
      level: options.density,
      content_gap: contentGapMap[options.density] || '_gap4',
    },
    target: options.target,
  };

  // Add accessibility if specified in options
  if (options.accessibility) {
    essence.accessibility = options.accessibility;
  }

  return essence;
}

/**
 * Build a v3 essence from options, producing DNA/Blueprint/Meta structure.
 */
export function buildEssenceV3(
  options: InitOptions,
  archetypeData?: ArchetypeData,
  themeHints?: ThemeData,
  recipeHints?: RecipeData & { animation?: { preference?: string } }
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
      style: options.theme,
      mode: options.mode,
      recipe: options.theme,
      shape: options.shape as 'sharp' | 'rounded' | 'pill',
    },
    spacing: {
      base_unit: 4,
      scale: 'linear',
      density: options.density,
      content_gap: densityLevelMap[options.density] || '_gap4',
    },
    typography: {
      scale: themeHints?.typography_hints?.scale || 'modular',
      heading_weight: themeHints?.typography_hints?.heading_weight || 600,
      body_weight: themeHints?.typography_hints?.body_weight || 400,
    },
    color: {
      palette: 'semantic',
      accent_count: 1,
      cvd_preference: options.accessibility?.cvd_preference || 'auto',
    },
    radius: {
      philosophy: (recipeHints?.radius_hints?.philosophy || options.shape) as 'sharp' | 'rounded' | 'pill',
      base: recipeHints?.radius_hints?.base || shapeRadiusMap[options.shape] || 8,
    },
    elevation: {
      system: 'layered',
      max_levels: 3,
    },
    motion: {
      preference: (recipeHints?.animation?.preference || themeHints?.motion_hints?.preference || 'subtle') as 'none' | 'subtle' | 'expressive',
      duration_scale: 1.0,
      reduce_motion: themeHints?.motion_hints?.reduce_motion_default ?? true,
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
    platform: {
      type: 'spa',
      routing: 'hash',
    },
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
 * Generate the accessibility section for DECANTR.md.
 */
function generateAccessibilitySection(
  essence: EssenceFile,
  themeData?: ThemeData
): string {
  const accessibility = essence.accessibility;

  if (!accessibility?.wcag_level || accessibility.wcag_level === 'none') {
    return '';
  }

  const wcagLevel = accessibility.wcag_level;
  const cvdPreference = accessibility.cvd_preference || 'none';
  const cvdSupport = themeData?.cvd_support || [];

  let section = `---

## Accessibility

**WCAG Level:** ${wcagLevel}
`;

  if (cvdSupport.length > 0) {
    section += `**CVD Support:** Theme supports ${cvdSupport.join(', ')}
**CVD Preference:** ${cvdPreference}
`;
  }

  section += `
### What This Means

This project requires WCAG 2.1 Level ${wcagLevel} compliance. You already know these rules — apply them:

- Semantic HTML structure
- Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigability for all interactive elements
- Visible focus indicators
- Meaningful alt text for images
- Proper heading hierarchy
`;

  if (cvdSupport.length > 0) {
    section += `
### CVD Implementation

The theme provides these data attributes:

\`\`\`html
<html data-theme="${essence.theme.style}" data-mode="${essence.theme.mode}" data-cvd="none">
\`\`\`

Valid \`data-cvd\` values for this theme: \`none\`, ${cvdSupport.map(m => `\`${m}\``).join(', ')}
`;

    if (cvdPreference === 'auto') {
      section += `
Detect user preference via \`prefers-contrast\` or user settings and apply accordingly.
`;
    }
  }

  section += `
---
`;

  return section;
}

/**
 * Generate the SEO guidance section for DECANTR.md.
 */
function generateSeoSection(
  essence: EssenceFile,
  archetypeData?: ArchetypeData
): string {
  const seoHints = archetypeData?.seo_hints;

  if (!seoHints) {
    return '';
  }

  const schemaOrg = seoHints.schema_org || [];
  const metaPriorities = seoHints.meta_priorities || [];

  if (schemaOrg.length === 0 && metaPriorities.length === 0) {
    return '';
  }

  let section = `---

## SEO Guidance

This archetype (\`${essence.archetype}\`) typically benefits from:

`;

  if (schemaOrg.length > 0) {
    section += `- **Schema.org:** ${schemaOrg.join(', ')}
`;
  }

  if (metaPriorities.length > 0) {
    section += `- **Meta priorities:** ${metaPriorities.join(', ')}
`;
  }

  section += `
These are suggestions, not requirements. Apply where appropriate for the page content.

---
`;

  return section;
}

/**
 * Generate the DECANTR.md file from template and essence.
 */
function generateDecantrMd(
  essence: EssenceFile,
  detected: DetectedProject,
  themeData?: ThemeData,
  recipeData?: RecipeData,
  archetypeData?: ArchetypeData,
  topologyMarkdown?: string
): string {
  const template = loadTemplate('DECANTR.md.template');

  // Build pages table with proper serialization of layout items
  const pagesTable = essence.structure.map(p => {
    const layoutStr = p.layout.map(serializeLayoutItem).join(', ') || 'none';
    return `| ${p.id} | ${p.shell} | ${layoutStr} |`;
  }).join('\n');

  // Build patterns list - extract unique pattern names
  const allPatternNames = [...new Set(essence.structure.flatMap(p => p.layout.flatMap(extractPatternNames)))];
  const patternsList = allPatternNames.length > 0
    ? allPatternNames.map(p => `- \`${p}\``).join('\n')
    : '- No patterns specified yet';

  // Build project summary
  const projectSummary = [
    `**Archetype:** ${essence.archetype || 'custom'}`,
    `**Target:** ${essence.target}`,
    `**Theme:** ${essence.theme.style} (${essence.theme.mode} mode)`,
    `**Guard Mode:** ${essence.guard.mode}`,
    `**Pages:** ${essence.structure.map(s => s.id).join(', ')}`,
  ].join('\n');

  // Shell structure description
  const shellStructures: Record<string, string> = {
    'sidebar-main': 'nav (left) | header (top) | body (scrollable)',
    'top-nav-main': 'header (full width) | body (scrollable)',
    'centered': 'body (centered card)',
    'full-bleed': 'header (floating) | body (full page sections)',
    'minimal-header': 'header (slim) | body (centered)',
  };

  const defaultShell = essence.structure[0]?.shell || 'sidebar-main';
  const shellStructure = shellStructures[defaultShell] || 'Custom shell layout';

  // Build theme quick reference
  let themeQuickRef = '';
  if (themeData?.seed) {
    const colors = Object.entries(themeData.seed)
      .map(([name, hex]) => `- **${name}:** \`${hex}\``)
      .join('\n');
    themeQuickRef = `**Seed Colors:**\n${colors}`;
  }

  // Add recipe decorators
  if (recipeData?.decorators) {
    const decorators = Object.entries(recipeData.decorators)
      .slice(0, 5)  // Top 5 decorators
      .map(([name, desc]) => `- \`${name}\` — ${desc}`)
      .join('\n');
    if (themeQuickRef) {
      themeQuickRef += `\n\n**Key Decorators:**\n${decorators}`;
    } else {
      themeQuickRef = `**Key Decorators:**\n${decorators}`;
    }
  }

  // Default if no theme/recipe data
  if (!themeQuickRef) {
    themeQuickRef = `See \`decantr get theme ${essence.theme.style}\` for details.`;
  }

  const accessibilitySection = generateAccessibilitySection(essence, themeData);
  const seoSection = generateSeoSection(essence, archetypeData);

  const vars: Record<string, string> = {
    GUARD_MODE: essence.guard.mode,
    PROJECT_SUMMARY: projectSummary,
    THEME_STYLE: essence.theme.style,
    THEME_MODE: essence.theme.mode,
    THEME_RECIPE: essence.theme.recipe,
    TARGET: essence.target,
    PAGES_TABLE: `| Page | Shell | Layout |\n|------|-------|--------|\n${pagesTable}`,
    PATTERNS_LIST: patternsList,
    DEFAULT_SHELL: defaultShell,
    SHELL_STRUCTURE: shellStructure,
    PERSONALITY: essence.personality.join(', '),
    DENSITY: essence.density.level,
    AVAILABLE_PATTERNS: '(See registry or .decantr/cache/patterns/)',
    AVAILABLE_THEMES: '(See registry or .decantr/cache/themes/)',
    AVAILABLE_SHELLS: 'sidebar-main, top-nav-main, centered, full-bleed, minimal-header',
    VERSION: CLI_VERSION,
    THEME_QUICK_REFERENCE: themeQuickRef,
    ACCESSIBILITY_SECTION: accessibilitySection,
    SEO_SECTION: seoSection,
    COMPOSITION_TOPOLOGY: topologyMarkdown || '',
  };

  return renderTemplate(template, vars);
}

/**
 * CSS methodology section for DECANTR.md (extracted from the v3.0 template).
 * This content is passed as {{CSS_APPROACH}} in the v3.1 simplified template.
 */
const CSS_APPROACH_CONTENT = `## CSS Implementation

This project uses **@decantr/css** for layout atoms and the generated CSS files for theme tokens and recipe decorators.

### Setup

\`\`\`javascript
// 1. Import the atoms runtime
import { css } from '@decantr/css';

// 2. Import generated CSS files (created by decantr init)
import './styles/tokens.css';      // Theme tokens (--d-primary, --d-surface, etc.)
import './styles/decorators.css';  // Recipe decorators
\`\`\`

### Using Atoms

The \`css()\` function processes atom strings and injects CSS at runtime:

\`\`\`jsx
// Layout atoms
<div className={css('_flex _col _gap4 _p4')}>
  <h1 className={css('_heading1')}>Title</h1>
  <p className={css('_textsm _fgmuted')}>Description</p>
</div>

// Responsive prefixes (mobile-first)
<div className={css('_gc1 _sm:gc2 _lg:gc4')}>
  {/* 1 col -> 2 cols at 640px -> 4 cols at 1024px */}
</div>
\`\`\`

### Common Atoms

| Category | Atoms | Description |
|----------|-------|-------------|
| Display | \`_flex\`, \`_grid\`, \`_block\`, \`_none\` | Display types |
| Flexbox | \`_col\`, \`_row\`, \`_wrap\`, \`_flex1\` | Flex direction/behavior |
| Alignment | \`_aic\`, \`_jcc\`, \`_jcsb\` | Align/justify content |
| Spacing | \`_gap{n}\`, \`_p{n}\`, \`_m{n}\`, \`_px{n}\` | Gap, padding, margin |
| Sizing | \`_wfull\`, \`_hfull\`, \`_w{n}\`, \`_h{n}\` | Width, height |
| Typography | \`_textsm\`, \`_textlg\`, \`_heading1\`-\`_heading6\` | Font sizes |
| Colors | \`_bgprimary\`, \`_bgsurface\`, \`_fgmuted\` | Background, foreground |

### CSS Architecture

The CSS is organized into two parts:

1. **Atoms (@decantr/css)** - Layout utilities injected at runtime into \`@layer d.atoms\`
2. **Generated CSS files** - Theme tokens and recipe decorators created during scaffold

\`\`\`
src/styles/
  tokens.css      # :root { --d-primary: #...; --d-surface: #...; }
  decorators.css  # .recipe-card { ... }
\`\`\`

### Variable Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| \`--d-\` | Core Decantr tokens | \`--d-primary\`, \`--d-bg\` |
| \`--d-gap-{n}\` | Spacing tokens | \`--d-gap-4\`, \`--d-gap-8\` |
| \`--d-radius\` | Border radius | \`--d-radius\`, \`--d-radius-lg\` |`;

/**
 * Generate DECANTR.md for v3.1 essences.
 *
 * The v3.1 template is a simplified ~200-line methodology primer that contains
 * NO project-specific data. All project-specific content lives in section
 * context files (.decantr/context/section-{name}.md).
 *
 * Only two template variables: GUARD_MODE and CSS_APPROACH.
 */
function generateDecantrMdV31(guardMode: string, cssApproach: string): string {
  const template = loadTemplate('DECANTR.md.template');
  return renderTemplate(template, {
    GUARD_MODE: guardMode,
    CSS_APPROACH: cssApproach,
  });
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

  const data = {
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
        recipes: [],
      },
    },
    initialized: {
      at: now,
      via: 'cli',
      version: CLI_VERSION,
      flags: buildFlagsString(options),
    },
  };

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
 * Generate a task context file.
 */
function generateTaskContext(
  templateName: string,
  essence: EssenceFile
): string {
  const template = loadTemplate(templateName);

  const defaultShell = essence.structure[0]?.shell || 'sidebar-main';
  const layout = essence.structure[0]?.layout.map(serializeLayoutItem).join(', ') || 'none';

  // Build scaffold structure description
  const scaffoldStructure = essence.structure.map(p => {
    const patterns = p.layout.length > 0
      ? `\n  - Patterns: ${p.layout.map(serializeLayoutItem).join(', ')}`
      : '';
    return `- **${p.id}** (${p.shell})${patterns}`;
  }).join('\n');

  const vars: Record<string, string> = {
    TARGET: essence.target,
    THEME_STYLE: essence.theme.style,
    THEME_MODE: essence.theme.mode,
    THEME_RECIPE: essence.theme.recipe,
    DEFAULT_SHELL: defaultShell,
    GUARD_MODE: essence.guard.mode,
    LAYOUT: layout,
    DENSITY: essence.density.level,
    CONTENT_GAP: essence.density.content_gap,
    SCAFFOLD_STRUCTURE: scaffoldStructure,
  };

  return renderTemplate(template, vars);
}

/**
 * Generate essence summary markdown.
 */
function generateEssenceSummary(essence: EssenceFile): string {
  const template = loadTemplate('essence-summary.md.template');

  // Build pages table with proper serialization
  const pagesTable = `| Page | Shell | Layout |
|------|-------|--------|
${essence.structure.map(p => `| ${p.id} | ${p.shell} | ${p.layout.map(serializeLayoutItem).join(', ') || 'none'} |`).join('\n')}`;

  // Build features list
  const featuresList = essence.features.length > 0
    ? essence.features.map(f => `- ${f}`).join('\n')
    : '- No features specified';

  const vars: Record<string, string> = {
    ARCHETYPE: essence.archetype || 'custom',
    BLUEPRINT: essence.blueprint || 'none',
    PERSONALITY: essence.personality.join(', '),
    TARGET: essence.target,
    THEME_STYLE: essence.theme.style,
    THEME_MODE: essence.theme.mode,
    THEME_RECIPE: essence.theme.recipe,
    SHAPE: essence.theme.shape,
    PAGES_TABLE: pagesTable,
    FEATURES_LIST: featuresList,
    GUARD_MODE: essence.guard.mode,
    ENFORCE_STYLE: String(essence.guard.enforce_style),
    ENFORCE_RECIPE: String(essence.guard.enforce_recipe),
    DENSITY: essence.density.level,
    CONTENT_GAP: essence.density.content_gap,
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
 */
export function scaffoldProject(
  projectRoot: string,
  options: InitOptions,
  detected: DetectedProject,
  archetypeData?: ArchetypeData,
  registrySource: 'api' | 'cache' = 'cache',
  themeData?: ThemeData,
  recipeData?: RecipeData,
  topologyMarkdown?: string,
  composedSections?: ComposeSectionsResult,
  routeMap?: Record<string, { section: string; page: string }>,
  patternSpecs?: Record<string, PatternSpecSummary>,
  blueprintData?: Record<string, any>,
): ScaffoldResult {
  // Build v3 essence by default, but keep a v2-compatible view for template rendering
  const essenceV3 = buildEssenceV3(options, archetypeData, themeData, recipeData);
  // Build the v2 shape for backward-compatible template rendering
  const essence = buildEssence(options, archetypeData);

  // Create directories
  const decantrDir = join(projectRoot, '.decantr');
  const contextDir = join(decantrDir, 'context');
  const cacheDir = join(decantrDir, 'cache');

  mkdirSync(contextDir, { recursive: true });
  mkdirSync(cacheDir, { recursive: true });

  // Write v3 essence file
  const essencePath = join(projectRoot, 'decantr.essence.json');
  writeFileSync(essencePath, JSON.stringify(essenceV3, null, 2) + '\n');

  // Write DECANTR.md — use the simplified v3.1 template (methodology primer only,
  // project-specific data lives in section context files)
  const decantrMdPath = join(projectRoot, 'DECANTR.md');
  const guardMode = essenceV3.meta.guard.mode;
  writeFileSync(decantrMdPath, generateDecantrMdV31(guardMode, CSS_APPROACH_CONTENT));

  // Write project.json
  const projectJsonPath = join(decantrDir, 'project.json');
  writeFileSync(projectJsonPath, generateProjectJson(detected, options, registrySource));

  // Write context files
  const contextFiles: string[] = [];

  const scaffoldPath = join(contextDir, 'task-scaffold.md');
  writeFileSync(scaffoldPath, generateTaskContext('task-scaffold.md.template', essence));
  contextFiles.push(scaffoldPath);

  const addPagePath = join(contextDir, 'task-add-page.md');
  writeFileSync(addPagePath, generateTaskContext('task-add-page.md.template', essence));
  contextFiles.push(addPagePath);

  const modifyPath = join(contextDir, 'task-modify.md');
  writeFileSync(modifyPath, generateTaskContext('task-modify.md.template', essence));
  contextFiles.push(modifyPath);

  const summaryPath = join(contextDir, 'essence-summary.md');
  writeFileSync(summaryPath, generateEssenceSummary(essence));
  contextFiles.push(summaryPath);

  // Generate CSS files
  const stylesDir = join(projectRoot, 'src', 'styles');
  mkdirSync(stylesDir, { recursive: true });

  const tokensPath = join(stylesDir, 'tokens.css');
  writeFileSync(tokensPath, generateTokensCSS(themeData, essenceV3.dna.theme.mode));

  const decoratorsPath = join(stylesDir, 'decorators.css');
  writeFileSync(decoratorsPath, generateDecoratorsCSS(recipeData, essenceV3.dna.theme.style as string));

  // V3.1 upgrade: if composedSections is provided, upgrade the essence and generate context files
  if (composedSections) {
    // Upgrade essence to V3.1 with sections + routes
    essenceV3.version = '3.1.0' as any;
    essenceV3.blueprint = {
      sections: composedSections.sections,
      features: composedSections.features,
      routes: routeMap || {},
    };
    if (blueprintData?.personality?.length) {
      essenceV3.dna.personality = blueprintData.personality;
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

    // Read generated tokens.css for inlining in section contexts
    const themeTokensCss = existsSync(tokensPath) ? readFileSync(tokensPath, 'utf-8') : '';

    // Build decorator list from recipe data
    const decoratorList: Array<{ name: string; description: string }> = [];
    if (recipeData?.decorators) {
      for (const [name, desc] of Object.entries(recipeData.decorators)) {
        decoratorList.push({ name, description: desc as string });
      }
    }

    // Generate section context files
    for (const section of composedSections.sections) {
      // Build zone context for this section from topology
      const zoneLabel = section.role === 'primary' || section.role === 'auxiliary' ? 'App' : section.role.charAt(0).toUpperCase() + section.role.slice(1);
      const zoneContext = `This section is in the **${zoneLabel}** zone (${section.shell} shell).` + (topologyMarkdown ? '\n\n' + topologyMarkdown : '');

      // Collect pattern specs for this section's pages
      const sectionPatterns: Record<string, PatternSpecSummary> = {};
      if (patternSpecs) {
        for (const page of section.pages) {
          for (const item of page.layout) {
            const pid = typeof item === 'string' ? item : '';
            if (pid && patternSpecs[pid]) {
              sectionPatterns[pid] = patternSpecs[pid];
            }
          }
        }
      }

      const contextContent = generateSectionContext({
        section,
        themeTokens: themeTokensCss,
        decorators: decoratorList,
        guardConfig: {
          mode: options.guard || 'strict',
          dna_enforcement: 'error',
          blueprint_enforcement: 'warn',
        },
        personality: options.personality || [],
        themeName: options.theme,
        recipeName: options.theme,
        zoneContext,
        patternSpecs: sectionPatterns,
        constraints: blueprintData?.design_constraints,
      });

      const sectionContextPath = join(contextDir, `section-${section.id}.md`);
      writeFileSync(sectionContextPath, contextContent);
      contextFiles.push(sectionContextPath);
    }

    // Generate scaffold.md
    const scaffoldContent = generateScaffoldContext({
      appName: options.blueprint || options.archetype || 'Application',
      blueprintId: options.blueprint || '',
      themeName: options.theme,
      recipeName: options.theme,
      personality: options.personality || [],
      topologyMarkdown: topologyMarkdown || '',
      sections: composedSections.sections,
      routes: routeMap || {},
      constraints: blueprintData?.design_constraints,
      seo: blueprintData?.seo_hints,
      navigation: blueprintData?.navigation,
    });

    const scaffoldMdPath = join(contextDir, 'scaffold.md');
    writeFileSync(scaffoldMdPath, scaffoldContent);
    contextFiles.push(scaffoldMdPath);
  }

  // Update .gitignore
  const gitignoreUpdated = updateGitignore(projectRoot);

  return {
    essencePath,
    decantrMdPath,
    projectJsonPath,
    contextFiles,
    cssFiles: [tokensPath, decoratorsPath],
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
  const contentTypes = ['patterns', 'recipes', 'themes', 'blueprints', 'archetypes', 'shells'];
  for (const type of contentTypes) {
    mkdirSync(join(customDir, type), { recursive: true });
  }

  // Create minimal v3 decantr.essence.json
  const essence: EssenceV3 = {
    version: '3.0.0',
    dna: {
      theme: {
        style: 'default',
        mode: 'dark',
        recipe: 'default',
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
      platform: {
        type: 'spa',
        routing: 'hash',
      },
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
        recipes: [],
      },
    },
    initialized: {
      at: now,
      via: 'cli',
      version: CLI_VERSION,
      flags: '--offline --minimal',
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

// ── Context Generation ──

export interface PatternSpecSummary {
  description: string;
  components: string[];
  slots: Record<string, string>;
  code: string;
}

export interface SectionContextInput {
  section: EssenceV31Section;
  themeTokens: string;
  decorators: Array<{ name: string; description: string }>;
  guardConfig: { mode: string; dna_enforcement: string; blueprint_enforcement: string };
  personality: string[];
  themeName: string;
  recipeName: string;
  zoneContext: string;
  patternSpecs: Record<string, PatternSpecSummary>;
  recipeHints?: { preferred?: string[]; compositions?: string; spatialHints?: string };
  constraints?: Record<string, string>;
}

export interface ScaffoldContextInput {
  appName: string;
  blueprintId: string;
  themeName: string;
  recipeName: string;
  personality: string[];
  topologyMarkdown: string;
  sections: EssenceV31Section[];
  routes: Record<string, RouteEntry>;
  constraints?: Record<string, string>;
  seo?: { schema_org?: string[]; meta_priorities?: string[] };
  navigation?: { hotkeys?: unknown[]; command_palette?: boolean };
}

/**
 * Generate a self-contained markdown context file for a single section.
 * Includes all guard rules, theme tokens, decorators, pattern specs,
 * zone context, features, and personality — everything an AI assistant
 * needs to generate code for this section.
 */
export function generateSectionContext(input: SectionContextInput): string {
  const { section, themeTokens, decorators, guardConfig, personality, themeName, recipeName, zoneContext, patternSpecs, recipeHints, constraints } = input;
  const lines: string[] = [];

  // Header
  lines.push(`# Section: ${section.id}`);
  lines.push('');
  lines.push(`**Role:** ${section.role} | **Shell:** ${section.shell} | **Archetype:** ${section.id}`);
  lines.push(`**Description:** ${section.description}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Guard Rules
  lines.push('## Guard Rules');
  lines.push('');
  lines.push(`| Rule | Scope | Severity | Description |`);
  lines.push(`|------|-------|----------|-------------|`);
  lines.push(`| Style guard | DNA | ${guardConfig.dna_enforcement} | Code must use the ${themeName} theme |`);
  lines.push(`| Recipe guard | DNA | ${guardConfig.dna_enforcement} | Visual recipe must match ${recipeName} |`);
  lines.push(`| Density guard | DNA | ${guardConfig.dna_enforcement} | Content gap must match essence density |`);
  lines.push(`| Accessibility guard | DNA | ${guardConfig.dna_enforcement} | Must meet WCAG level from essence |`);
  lines.push(`| Structure guard | Blueprint | ${guardConfig.blueprint_enforcement} | Pages must exist in essence structure |`);
  lines.push(`| Layout guard | Blueprint | ${guardConfig.blueprint_enforcement} | Pattern order must match essence layout |`);
  lines.push(`| Pattern existence | Blueprint | ${guardConfig.blueprint_enforcement} | All patterns must exist in registry |`);
  lines.push('');
  lines.push(`**Guard mode:** ${guardConfig.mode}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Theme
  lines.push(`## Theme: ${themeName}`);
  lines.push('');
  lines.push('```css');
  lines.push(themeTokens);
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Decorators
  lines.push(`## Decorators (${recipeName} recipe)`);
  lines.push('');
  if (decorators.length > 0) {
    lines.push('| Decorator | Description |');
    lines.push('|-----------|-------------|');
    for (const dec of decorators) {
      lines.push(`| ${dec.name} | ${dec.description} |`);
    }
  } else {
    lines.push('No decorators defined.');
  }
  lines.push('');
  if (recipeHints) {
    if (recipeHints.preferred && recipeHints.preferred.length > 0) {
      lines.push(`**Preferred:** ${recipeHints.preferred.join(', ')}`);
    }
    if (recipeHints.compositions) {
      lines.push(`**Compositions:** ${recipeHints.compositions}`);
    }
    if (recipeHints.spatialHints) {
      lines.push(`**Spatial hints:** ${recipeHints.spatialHints}`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Zone Context
  if (zoneContext) {
    lines.push('## Zone Context');
    lines.push('');
    lines.push(zoneContext);
    lines.push('');
    lines.push('---');
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

  // Personality
  if (personality.length > 0) {
    lines.push('## Personality');
    lines.push('');
    lines.push(personality.join(', '));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Constraints
  if (constraints && Object.keys(constraints).length > 0) {
    lines.push('## Constraints');
    lines.push('');
    for (const [key, value] of Object.entries(constraints)) {
      lines.push(`- **${key}:** ${value}`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Pages
  lines.push('## Pages');
  lines.push('');
  for (const page of section.pages) {
    const route = page.route || `/${section.id}/${page.id}`;
    const layoutStr = page.layout.map(serializeLayoutItem).join(' → ');
    lines.push(`### ${page.id} (${route})`);
    lines.push('');
    lines.push(`Layout: ${layoutStr}`);
    lines.push('');

    // Collect pattern names from layout items
    const patternNames = page.layout.flatMap(extractPatternNames);

    for (const patternName of patternNames) {
      const spec = patternSpecs[patternName];
      if (!spec) continue;

      lines.push(`#### Pattern: ${patternName}`);
      lines.push('');
      lines.push(spec.description);
      lines.push('');
      lines.push(`**Components:** ${spec.components.join(', ')}`);
      lines.push('');
      lines.push('**Layout slots:**');
      for (const [slot, desc] of Object.entries(spec.slots)) {
        lines.push(`- \`${slot}\`: ${desc}`);
      }
      lines.push('');
      if (spec.code) {
        lines.push('**Code example:**');
        lines.push('```');
        lines.push(spec.code);
        lines.push('```');
        lines.push('');
      }
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
  const { appName, blueprintId, themeName, recipeName, personality, topologyMarkdown, sections, routes, constraints, seo, navigation } = input;
  const lines: string[] = [];

  // Header
  lines.push(`# Scaffold: ${appName}`);
  lines.push('');
  lines.push(`**Blueprint:** ${blueprintId}`);
  lines.push(`**Theme:** ${themeName} | **Recipe:** ${recipeName}`);
  lines.push(`**Personality:** ${personality.join(', ')}`);
  lines.push('**Guard mode:** creative (no enforcement during initial scaffolding)');
  lines.push('');

  // Topology
  lines.push('## App Topology');
  lines.push('');
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

  // Design Constraints
  if (constraints && Object.keys(constraints).length > 0) {
    lines.push('## Design Constraints');
    lines.push('');
    for (const [key, value] of Object.entries(constraints)) {
      lines.push(`- **${key}:** ${value}`);
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
    }
    if (navigation.hotkeys && navigation.hotkeys.length > 0) {
      lines.push(`- Hotkeys: ${navigation.hotkeys.length} configured`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export { loadTemplate, renderTemplate };
