import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isV3, computeSpatialTokens } from '@decantr/essence-spec';
import type { EssenceV3, EssenceDNA, EssenceBlueprint, EssenceMeta, BlueprintPage, EssenceV31Section, RouteEntry, DNAOverrides } from '@decantr/essence-spec';
import { generateTreatmentCSS } from './treatments.js';
import type { ComposeEntry, ArchetypeRole } from '@decantr/registry';
import type { DetectedProject } from './detect.js';
import type { InitOptions } from './prompts.js';
import type { RegistryClient } from './registry.js';

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
  spatial_hints?: { density_bias?: number; content_gap_shift?: number; section_padding?: string | null; card_wrapping?: string; surface_override?: string };
  radius_hints?: { philosophy: string; base: number };
  treatment_overrides?: Record<string, Record<string, string>>;
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
  const lines = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  const spatialLines = spatialTokens
    ? '\n' + Object.entries(spatialTokens).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    : '';

  let css = `/* Generated by @decantr/cli */
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

  return css;
}

/**
 * Generate decorators.css from recipe data.
 */
export function generateDecoratorsCSS(recipeData: RecipeData | undefined, themeName: string): string {
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
 * Generate a global.css with reset, body styles, and utility classes.
 * Uses personality array to extract font family hints.
 */
export function generateGlobalCSS(personality: string[]): string {
  const personalityText = personality.join(' ').toLowerCase();
  let fontBody = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  if (personalityText.includes('inter')) {
    fontBody = `'Inter', ${fontBody}`;
  } else if (personalityText.includes('geist')) {
    fontBody = `'Geist', ${fontBody}`;
  }

  return `/* Generated by @decantr/cli — global reset + body styles */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  color-scheme: dark;
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

img, picture, video, canvas, svg {
  display: block;
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
`;
}

/**
 * Generate a dedicated decorators.md context file with full decorator table and usage examples.
 */
function generateDecoratorsContext(recipeData: RecipeData | undefined, recipeName: string): string {
  const lines: string[] = [];
  lines.push(`# Recipe Decorators: ${recipeName}`);
  lines.push('');
  lines.push('## Available Classes');
  lines.push('');

  if (recipeData?.decorators && Object.keys(recipeData.decorators).length > 0) {
    lines.push('| Decorator | Description |');
    lines.push('|-----------|-------------|');
    for (const [name, description] of Object.entries(recipeData.decorators)) {
      lines.push(`| ${name} | ${description} |`);
    }
  } else {
    lines.push('No decorators defined.');
  }

  lines.push('');
  lines.push('## Usage');
  lines.push('');
  lines.push('Decorators are plain CSS class names from `src/styles/decorators.css`. Combine with atoms:');
  lines.push('');
  lines.push('```tsx');
  lines.push("<div className={css('_flex _col _gap4') + ' " + recipeName + "-card'}>");
  lines.push("  <pre className={css('_p3') + ' " + recipeName + "-code'}>{code}</pre>");
  lines.push('</div>');
  lines.push('```');
  lines.push('');
  lines.push('Atoms use `css()` function. Decorators are plain class strings. Combined via string concatenation.');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate a CSS rule from a decorator name and description.
 */
export function generateDecoratorRule(name: string, description: string): string {
  const rules: string[] = [];
  const descLower = description.toLowerCase();

  // Detect semantic type for interactive state generation (check both name and description)
  const nameLower = name.toLowerCase();
  const isCard = descLower.includes('card') || descLower.includes('panel') || nameLower.includes('card') || nameLower.includes('panel');
  const isInput = descLower.includes('input') || descLower.includes('field') || descLower.includes('textarea') || nameLower.includes('input') || nameLower.includes('textarea');
  const isGlass = descLower.includes('glassmorphic') || descLower.includes('glass') || nameLower.includes('glass');
  const isInteractive = isCard || isInput || isGlass;
  const isNonInteractive = descLower.includes('divider') || descLower.includes('skeleton')
    || descLower.includes('keyframe') || descLower.includes('canvas')
    || nameLower.includes('divider') || nameLower.includes('skeleton') || nameLower.includes('canvas');

  // Font patterns
  if (descLower.includes('monospace') || descLower.includes('mono font')) {
    rules.push("font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace");
  }

  // Background patterns
  if (descLower.includes('surface-raised') || descLower.includes('surface raised')) {
    rules.push('background: var(--d-surface-raised)');
  } else if (descLower.includes('surface background') || descLower.includes('surface elevation')) {
    rules.push('background: var(--d-surface)');
  } else if (descLower.includes('background') && descLower.includes('theme')) {
    rules.push('background: var(--d-bg)');
  } else if (descLower.includes('primary-tinted') || descLower.includes('primary background')) {
    rules.push('background: color-mix(in srgb, var(--d-primary) 15%, var(--d-surface))');
  }

  // Input base styles: always add bg, padding, radius, color
  if (isInput) {
    if (!rules.some(r => r.startsWith('background'))) {
      rules.push('background: var(--d-surface)');
    }
    rules.push('color: var(--d-text)');
    rules.push('padding: 0.5rem 0.75rem');
    rules.push('border-radius: var(--d-radius)');
    rules.push('width: 100%');
    rules.push('outline: none');
  }

  // Border patterns (specific before generic)
  const leftBorderMatch = descLower.match(/(\d+)px\s+left\s+border/);
  if (leftBorderMatch) {
    rules.push(`border-left: ${leftBorderMatch[1]}px solid var(--d-primary)`);
  } else if (descLower.includes('left border')) {
    rules.push('border-left: 3px solid var(--d-primary)');
  } else if (descLower.includes('1px border') || descLower.includes('subtle border')) {
    rules.push('border: 1px solid var(--d-border)');
  } else if (descLower.includes('border') && !descLower.includes('radius')) {
    rules.push('border: 1px solid var(--d-border)');
  }

  // Border radius patterns
  const radiusMatch = descLower.match(/(\d+)px radius/);
  if (radiusMatch) {
    rules.push(`border-radius: ${radiusMatch[1]}px`);
  } else if ((descLower.includes('radius') || descLower.includes('rounded')) && !isInput) {
    rules.push('border-radius: var(--d-radius)');
  }

  // Shadow patterns
  if (descLower.includes('elevation') || descLower.includes('shadow')) {
    rules.push('box-shadow: var(--d-shadow)');
  }

  // Transition for interactive elements
  if (isInteractive && !isNonInteractive) {
    rules.push('transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease');
  }

  // Animation patterns
  if (descLower.includes('entrance animation') || descLower.includes('fade')) {
    rules.push('animation: decantr-fade-in 0.2s ease-out');
  }
  if (descLower.includes('pulse animation') || descLower.includes('skeleton')) {
    rules.push('animation: decantr-pulse 1.5s ease-in-out infinite');
  }

  // Backdrop blur — detect explicit blur size or glassmorphic keyword
  const blurMatch = descLower.match(/blur\((\d+)px\)/);
  if (blurMatch) {
    rules.push(`backdrop-filter: blur(${blurMatch[1]}px)`);
    rules.push(`-webkit-backdrop-filter: blur(${blurMatch[1]}px)`);
  } else if (isGlass) {
    rules.push('backdrop-filter: blur(12px)');
    rules.push('-webkit-backdrop-filter: blur(12px)');
  } else if (descLower.includes('blur')) {
    rules.push('backdrop-filter: blur(8px)');
    rules.push('-webkit-backdrop-filter: blur(8px)');
  }

  // Semi-transparent background for glassmorphic panels
  if (descLower.includes('semi-transparent') || descLower.includes('glassmorphic')) {
    const bgIdx = rules.findIndex(r => r.startsWith('background:'));
    const rgbaBg = 'background: rgba(31, 31, 35, 0.8)';
    if (bgIdx !== -1) {
      rules[bgIdx] = rgbaBg;
    } else {
      rules.push(rgbaBg);
    }
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

  // Code blocks
  if (descLower.includes('monospace') || descLower.includes('code')) {
    if (!rules.some(r => r.startsWith('padding'))) {
      rules.push('padding: 0.75rem 1rem');
    }
    if (!rules.some(r => r.startsWith('border-radius'))) {
      rules.push('border-radius: var(--d-radius-sm)');
    }
    rules.push('overflow-x: auto');
  }

  // Fallback if no rules matched
  if (rules.length === 0) {
    return `/* .${name}: ${description} */`;
  }

  // Build base rule
  let css = `.${name} {\n  ${rules.join(';\n  ')};\n}`;

  // Interactive state rules (only for interactive decorators)
  if (isInteractive && !isNonInteractive) {
    const stateRules: string[] = [];

    if (isCard || isGlass) {
      stateRules.push(`.${name}:hover {\n  border-color: var(--d-primary-hover, var(--d-border));\n  box-shadow: var(--d-shadow-md);\n}`);
    }

    if (isInput) {
      stateRules.push(`.${name}:focus {\n  border-color: var(--d-primary);\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--d-primary) 25%, transparent);\n}`);
      stateRules.push(`.${name}::placeholder {\n  color: var(--d-text-muted);\n}`);
      stateRules.push(`.${name}:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}`);
    }

    css += '\n\n' + stateRules.join('\n\n');
  }

  return css;
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

  // Add key treatments (base treatments + recipe decorators)
  const baseTreatments = '- `d-interactive`, `d-surface`, `d-data`, `d-control`, `d-section`, `d-annotation`';
  if (recipeData?.decorators) {
    const recipeDecorators = Object.entries(recipeData.decorators)
      .slice(0, 5)  // Top 5 recipe decorators
      .map(([name, desc]) => `- \`${name}\` — ${desc}`)
      .join('\n');
    const treatments = `${baseTreatments}\n${recipeDecorators}`;
    if (themeQuickRef) {
      themeQuickRef += `\n\n**Key Treatments:**\n${treatments}`;
    } else {
      themeQuickRef = `**Key Treatments:**\n${treatments}`;
    }
  } else {
    if (themeQuickRef) {
      themeQuickRef += `\n\n**Key Treatments:**\n${baseTreatments}`;
    } else {
      themeQuickRef = `**Key Treatments:**\n${baseTreatments}`;
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

This project uses **@decantr/css** for layout atoms, **visual treatments** for semantic styling, and **recipe decorators** for theme-specific decoration.

### Three File Setup

\`\`\`
src/styles/
  tokens.css       # Design tokens: --d-primary, --d-surface, --d-bg, etc.
  treatments.css   # Visual treatments (d-interactive, d-surface, ...) + recipe decorators
  global.css       # Resets, base typography, sr-only
\`\`\`

\`\`\`javascript
import { css } from '@decantr/css';         // Atoms runtime
import './styles/tokens.css';                // Theme tokens
import './styles/treatments.css';            // Treatments + recipe decorators
import './styles/global.css';                // Resets
\`\`\`

### Visual Treatments

Six base treatment classes provide semantic styling. Combine with atoms for layout:

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Interactive Surface** | \`d-interactive\` | \`data-variant="primary\\|ghost\\|danger"\`, hover/focus-visible/disabled states |
| **Container Surface** | \`d-surface\` | \`data-variant="raised\\|overlay"\`, optional \`data-interactive\` for hover |
| **Data Display** | \`d-data\`, \`d-data-header\`, \`d-data-row\`, \`d-data-cell\` | Row hover highlight |
| **Form Control** | \`d-control\` | Focus ring, placeholder, disabled, error via \`aria-invalid\` |
| **Section Rhythm** | \`d-section\` | Auto-spacing between adjacent sections, density-aware |
| **Inline Annotation** | \`d-annotation\` | \`data-status="success\\|error\\|warning\\|info"\` |

### Composition

Atoms + treatment + recipe decorator:

\`\`\`tsx
<button className={css('_px4 _py2') + ' d-interactive'} data-variant="primary">Deploy</button>
<div className={css('_flex _col _gap4') + ' d-surface carbon-glass'}>Card</div>
<span className="d-annotation" data-status="success">Active</span>
\`\`\`

- **Atoms:** \`css('_flex _col _gap4')\` — processed by @decantr/css runtime
- **Treatments:** \`d-interactive\`, \`d-surface\` — semantic base styles from treatments.css
- **Recipe decorators:** \`carbon-glass\`, \`carbon-code\` — theme-specific decoration from treatments.css
- **Combined:** \`css('_flex _col') + ' d-surface carbon-card'\`

### Atoms Quick Reference

| Category | Examples | Purpose |
|----------|----------|---------|
| Layout | \`_flex\`, \`_col\`, \`_row\`, \`_wrap\`, \`_grid\` | Flex/grid containers |
| Spacing | \`_gap4\`, \`_p4\`, \`_px4\`, \`_py2\`, \`_m0\` | Gaps, padding, margin |
| Sizing | \`_w100\`, \`_h100\`, \`_minw0\`, \`_maxwfull\` | Width, height |
| Text | \`_textlg\`, \`_text2xl\`, \`_fontbold\`, \`_textc\` | Typography |
| Alignment | \`_aic\`, \`_jcc\`, \`_jcsb\`, \`_pic\` | Flex/grid alignment |
| Position | \`_rel\`, \`_abs\`, \`_sticky\`, \`_z10\` | Positioning |
| Visual | \`_rounded\`, \`_shadow\`, \`_trans\`, \`_op50\` | Decoration |
| Color | \`_bgprimary\`, \`_fgtext\`, \`_fgmuted\`, \`_bcborder\` | Theme colors |
| Responsive | \`_md:gc2\`, \`_lg:gc4\`, \`_sm:flex\` | Breakpoint prefixes |

Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24. Example: \`_gap4\` = \`gap:1rem\`.

### Design Tokens

| Token | Purpose |
|-------|---------|
| \`--d-primary\` | Primary brand color |
| \`--d-surface\`, \`--d-surface-raised\` | Surface backgrounds |
| \`--d-bg\` | Page background |
| \`--d-border\` | Border color |
| \`--d-text\`, \`--d-text-muted\` | Text colors |
| \`--d-success\`, \`--d-error\`, \`--d-warning\`, \`--d-info\` | Status colors |
| \`--d-shadow\`, \`--d-shadow-lg\` | Elevation shadows |
| \`--d-radius\`, \`--d-radius-lg\` | Border radii |

### Routing

Check \`decantr.essence.json\` → \`meta.platform.routing\` for the routing strategy:
- \`"hash"\` → use \`HashRouter\` (e.g., for static hosting, GitHub Pages)
- \`"history"\` → use \`BrowserRouter\` (e.g., for server-rendered apps)

Routes are defined in \`decantr.essence.json\` → \`blueprint.routes\` and listed in \`.decantr/context/scaffold.md\`.`;

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
 * Generate task context from a V3 essence (used by refreshDerivedFiles).
 * Extracts the same template variables as the v2 version.
 */
function generateTaskContextV3(templateName: string, essence: EssenceV3): string {
  const template = loadTemplate(templateName);

  const pages = essence.blueprint.sections && essence.blueprint.sections.length > 0
    ? essence.blueprint.sections.flatMap(s => s.pages)
    : essence.blueprint.pages || [];
  const defaultShell = essence.blueprint.sections?.[0]?.shell
    || (essence.blueprint as any).shell
    || 'sidebar-main';
  const layout = pages[0]?.layout?.map(serializeLayoutItem).join(', ') || 'none';

  const scaffoldStructure = pages.map(p => {
    const patterns = p.layout.length > 0
      ? `\n  - Patterns: ${p.layout.map(serializeLayoutItem).join(', ')}`
      : '';
    return `- **${p.id}** (${defaultShell})${patterns}`;
  }).join('\n');

  const densityLevel = essence.dna.spacing?.density || 'comfortable';
  const contentGap = essence.dna.spacing?.content_gap || '_gap4';

  const vars: Record<string, string> = {
    TARGET: essence.meta.target || 'react',
    THEME_STYLE: essence.dna.theme.style,
    THEME_MODE: essence.dna.theme.mode,
    THEME_RECIPE: essence.dna.theme.recipe || essence.dna.theme.style,
    DEFAULT_SHELL: defaultShell as string,
    GUARD_MODE: essence.meta.guard.mode,
    LAYOUT: layout,
    DENSITY: densityLevel,
    CONTENT_GAP: contentGap,
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

  // Derive enforcement levels from guard config
  // V2 essences have enforce_style/enforce_recipe booleans, map to v3 enforcement strings
  const dnaEnforcement = essence.guard.enforce_style ? 'error' : 'off';
  const blueprintEnforcement = essence.guard.enforce_recipe ? 'warn' : 'off';

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
    DNA_ENFORCEMENT: dnaEnforcement,
    BLUEPRINT_ENFORCEMENT: blueprintEnforcement,
    DENSITY: essence.density.level,
    CONTENT_GAP: essence.density.content_gap,
    LAST_UPDATED: new Date().toISOString(),
  };

  return renderTemplate(template, vars);
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
    THEME_STYLE: essence.dna.theme.style as string,
    THEME_MODE: essence.dna.theme.mode as string,
    THEME_RECIPE: (essence.dna.theme.recipe ?? '') as string,
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
  recipeData?: RecipeData,
  topologyMarkdown?: string,
  composedSections?: ComposeSectionsResult,
  routeMap?: Record<string, { section: string; page: string }>,
  patternSpecs?: Record<string, PatternSpecSummary>,
  blueprintData?: Record<string, any>,
): Promise<ScaffoldResult> {
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

  // Write project.json
  const projectJsonPath = join(decantrDir, 'project.json');
  writeFileSync(projectJsonPath, generateProjectJson(detected, options, registrySource));

  // Write legacy task context files (v2-compatible)
  // Note: task-modify.md and task-add-page.md are skipped during initial scaffold
  // (0% token usage during scaffolding). They are generated on first refresh/add/remove.
  const contextFiles: string[] = [];

  const scaffoldPath = join(contextDir, 'task-scaffold.md');
  writeFileSync(scaffoldPath, generateTaskContext('task-scaffold.md.template', essence));
  contextFiles.push(scaffoldPath);

  // V3.1 upgrade: if composedSections is provided, upgrade the essence
  if (composedSections) {
    essenceV3.version = '3.1.0' as any;
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
  const refreshResult = await refreshDerivedFiles(projectRoot, essenceV3, registry, themeData, recipeData, { isInitialScaffold: true });

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

// ── Refresh Derived Files ──

export interface RefreshResult {
  decantrMdPath: string;
  contextFiles: string[];
  cssFiles: string[];
}

/**
 * Regenerate all derived files from an existing essence + registry.
 *
 * This is the standalone function that `decantr refresh` will call.
 * It reads everything it needs from the essence JSON (theme name from
 * dna.theme.style, recipe from dna.theme.recipe, sections from
 * blueprint.sections, etc.) and fetches theme/recipe/pattern data
 * from the RegistryClient.
 *
 * Works with both V3.0 (flat pages, no sections) and V3.1 (sectioned).
 */
export async function refreshDerivedFiles(
  projectRoot: string,
  essence: EssenceV3,
  registry: RegistryClient,
  prefetchedThemeData?: ThemeData,
  prefetchedRecipeData?: RecipeData,
  options?: { isInitialScaffold?: boolean },
): Promise<RefreshResult> {
  const decantrDir = join(projectRoot, '.decantr');
  const contextDir = join(decantrDir, 'context');
  mkdirSync(contextDir, { recursive: true });

  // ── Extract info from essence ──
  const themeName = essence.dna.theme.style as string;
  const recipeName = (essence.dna.theme.recipe ?? themeName) as string;
  const mode = essence.dna.theme.mode as string;
  const guardMode = essence.meta.guard.mode;
  const guardConfig = {
    mode: guardMode,
    dna_enforcement: essence.meta.guard.dna_enforcement || 'error',
    blueprint_enforcement: essence.meta.guard.blueprint_enforcement || 'warn',
  };
  const personality = essence.dna.personality || [];

  // ── Fetch theme & recipe from registry (use prefetched if available) ──
  let themeData: ThemeData | undefined = prefetchedThemeData;
  let recipeData: RecipeData | undefined = prefetchedRecipeData;

  if (!themeData) try {
    const themeResult = await registry.fetchTheme(themeName);
    if (themeResult?.data) {
      // Unwrap API wrapper: actual theme content is in .data
      const raw = themeResult.data as Record<string, unknown>;
      const t = (raw.data ?? raw) as Record<string, unknown>;
      themeData = {
        seed: t.seed as ThemeData['seed'],
        palette: t.palette as ThemeData['palette'],
        cvd_support: t.cvd_support as ThemeData['cvd_support'],
        tokens: t.tokens as ThemeData['tokens'],
        typography_hints: t.typography_hints as ThemeData['typography_hints'],
        motion_hints: t.motion_hints as ThemeData['motion_hints'],
      };
    }
  } catch { /* continue without theme data */ }

  if (!recipeData) try {
    const recipeResult = await registry.fetchRecipe(recipeName);
    if (recipeResult?.data) {
      // Unwrap API wrapper: actual recipe content is in .data
      const raw = recipeResult.data as Record<string, unknown>;
      const r = (raw.data ?? raw) as Record<string, unknown>;
      recipeData = {
        decorators: r.decorators as RecipeData['decorators'],
        spatial_hints: r.spatial_hints as RecipeData['spatial_hints'],
        radius_hints: r.radius_hints as RecipeData['radius_hints'],
        treatment_overrides: r.treatment_overrides as RecipeData['treatment_overrides'],
      };

      // If cache had abbreviated data (no decorators), the recipe content
      // might be in the outer data field from the single-item API response
      if (!recipeData.decorators && raw.data) {
        const inner = raw.data as Record<string, unknown>;
        if (inner.decorators) {
          recipeData.decorators = inner.decorators as RecipeData['decorators'];
          recipeData.spatial_hints = inner.spatial_hints as RecipeData['spatial_hints'];
          recipeData.radius_hints = inner.radius_hints as RecipeData['radius_hints'];
        }
      }
    }
  } catch { /* continue without recipe data */ }

  // If recipe data still has no decorators, try a direct API fetch as last resort
  if (!recipeData?.decorators || Object.keys(recipeData.decorators).length === 0) {
    try {
      const apiUrl = (registry as any).apiUrl || 'https://api.decantr.ai/v1';
      const resp = await fetch(`${apiUrl}/recipes/@official/${recipeName}`);
      if (resp.ok) {
        const apiData = await resp.json() as Record<string, unknown>;
        const inner = (apiData.data ?? apiData) as Record<string, unknown>;
        if (inner.decorators && Object.keys(inner.decorators as object).length > 0) {
          recipeData = {
            decorators: inner.decorators as RecipeData['decorators'],
            spatial_hints: inner.spatial_hints as RecipeData['spatial_hints'],
            radius_hints: inner.radius_hints as RecipeData['radius_hints'],
            treatment_overrides: inner.treatment_overrides as RecipeData['treatment_overrides'],
          };
        }
      }
    } catch { /* API unavailable — continue without decorators */ }
  }

  // Same for theme data
  if (!themeData?.seed?.primary) {
    try {
      const apiUrl = (registry as any).apiUrl || 'https://api.decantr.ai/v1';
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
            typography_hints: inner.typography_hints as ThemeData['typography_hints'],
            motion_hints: inner.motion_hints as ThemeData['motion_hints'],
          };
        }
      }
    } catch { /* API unavailable */ }
  }

  // ── Generate CSS files ──
  const stylesDir = join(projectRoot, 'src', 'styles');
  mkdirSync(stylesDir, { recursive: true });

  // Compute spatial tokens from density + recipe hints
  const densityLevel = (options.density || 'comfortable') as 'compact' | 'comfortable' | 'spacious';
  const spatialTokens = computeSpatialTokens(densityLevel, recipeData?.spatial_hints ? {
    section_padding: recipeData.spatial_hints.section_padding ?? undefined,
    density_bias: typeof recipeData.spatial_hints.density_bias === 'number' ? recipeData.spatial_hints.density_bias : undefined,
    content_gap_shift: recipeData.spatial_hints.content_gap_shift,
  } : undefined);

  const tokensPath = join(stylesDir, 'tokens.css');
  // Only overwrite tokens.css if we have meaningful theme data (seed colors present);
  // preserve existing file if theme fetch returned empty/incomplete data
  const hasRealThemeData = themeData?.seed?.primary || themeData?.palette?.background;
  if (hasRealThemeData || !existsSync(tokensPath)) {
    writeFileSync(tokensPath, generateTokensCSS(themeData, mode, spatialTokens));
  }

  // Write treatments.css (replaces decorators.css)
  const treatmentsPath = join(stylesDir, 'treatments.css');
  writeFileSync(treatmentsPath, generateTreatmentCSS(
    spatialTokens,
    recipeData?.treatment_overrides,
    recipeData?.decorators,
    themeName,
  ));

  const globalPath = join(stylesDir, 'global.css');
  // Only generate global.css if it doesn't exist (don't overwrite user customizations)
  if (!existsSync(globalPath)) {
    writeFileSync(globalPath, generateGlobalCSS(personality));
  }

  const cssFiles = [tokensPath, treatmentsPath, globalPath];

  // ── Generate decorators.md context file (full table + usage examples) ──
  const decoratorsMdPath = join(contextDir, 'decorators.md');
  writeFileSync(decoratorsMdPath, generateDecoratorsContext(recipeData, recipeName));

  // ── Generate DECANTR.md ──
  const decantrMdPath = join(projectRoot, 'DECANTR.md');
  writeFileSync(decantrMdPath, generateDecantrMdV31(guardMode, CSS_APPROACH_CONTENT));

  // ── Generate essence-summary.md only for V3.0 flat projects ──
  // For V3.1 (sectioned), scaffold.md covers the same overview — skip to save tokens.
  const hasSections = essence.blueprint.sections && essence.blueprint.sections.length > 0;
  const contextFiles: string[] = [decoratorsMdPath];

  if (!hasSections) {
    const summaryPath = join(contextDir, 'essence-summary.md');
    writeFileSync(summaryPath, generateEssenceSummaryV3(essence));
    contextFiles.push(summaryPath);
  }

  // ── Generate mutation task contexts (skipped during init, generated on refresh/add/remove) ──
  if (!options?.isInitialScaffold) {
    const addPagePath = join(contextDir, 'task-add-page.md');
    writeFileSync(addPagePath, generateTaskContextV3('task-add-page.md.template', essence));
    contextFiles.push(addPagePath);

    const modifyPath = join(contextDir, 'task-modify.md');
    writeFileSync(modifyPath, generateTaskContextV3('task-modify.md.template', essence));
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

    // ── Fetch pattern specs for all patterns in all sections ──
    const patternSpecs: Record<string, PatternSpecSummary> = {};
    const seenPatterns = new Set<string>();

    for (const section of sections) {
      for (const page of section.pages) {
        for (const item of page.layout) {
          const names = extractPatternNames(item);
          for (const name of names) {
            if (!seenPatterns.has(name)) {
              seenPatterns.add(name);
              try {
                const patResult = await registry.fetchPattern(name);
                if (patResult?.data) {
                  const raw = patResult.data as Record<string, unknown>;
                  const inner = ((raw.data ?? raw) as Record<string, any>);
                  const defaultPreset = inner.default_preset || 'standard';
                  const preset = inner.presets?.[defaultPreset];
                  let slots = preset?.layout?.slots || {};

                  // If no slots defined, generate synthetic ones from the pattern name and description
                  if (Object.keys(slots).length === 0) {
                    const synthetic = generateSyntheticSlots(name, (inner.description as string) || '');
                    if (Object.keys(synthetic).length > 0) {
                      slots = synthetic;
                    }
                  }

                  const spec: PatternSpecSummary = {
                    description: (inner.description as string) || '',
                    components: (inner.components as string[]) || [],
                    slots,
                  };
                  // Enrich empty components with synthetic inference
                  if (!spec.components || spec.components.length === 0) {
                    const syntheticComps = generateSyntheticComponents(name, spec.description);
                    if (syntheticComps.length > 0) spec.components = syntheticComps;
                  }
                  patternSpecs[name] = spec;
                } else {
                  // Pattern not in registry — generate synthetic spec from name alone
                  const synthetic = generateSyntheticSlots(name, '');
                  const syntheticComps = generateSyntheticComponents(name, '');
                  if (Object.keys(synthetic).length > 0 || syntheticComps.length > 0) {
                    patternSpecs[name] = { description: '', components: syntheticComps, slots: synthetic };
                  }
                }
              } catch {
                // Pattern fetch failed — generate synthetic spec from name alone
                const synthetic = generateSyntheticSlots(name, '');
                const syntheticComps = generateSyntheticComponents(name, '');
                if (Object.keys(synthetic).length > 0 || syntheticComps.length > 0) {
                  patternSpecs[name] = { description: '', components: syntheticComps, slots: synthetic };
                }
              }
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

    // ── Build decorator list from recipe data or existing CSS ──
    const decoratorList: Array<{ name: string; description: string }> = [];
    if (recipeData?.decorators) {
      for (const [name, desc] of Object.entries(recipeData.decorators)) {
        decoratorList.push({ name, description: desc as string });
      }
    } else if (existsSync(decoratorsPath)) {
      // Fallback: parse decorator class names from existing decorators.css
      const decoratorsCss = readFileSync(decoratorsPath, 'utf-8');
      const classRegex = /\/\*\s*(.+?)\s*\*\/\s*\n\s*\.([\w-]+)\s*\{/g;
      let match: RegExpExecArray | null;
      while ((match = classRegex.exec(decoratorsCss)) !== null) {
        decoratorList.push({ name: match[2], description: match[1] });
      }
      // Also catch classes without preceding comments
      if (decoratorList.length === 0) {
        const simpleClassRegex = /^\.([\w-]+)\s*\{/gm;
        while ((match = simpleClassRegex.exec(decoratorsCss)) !== null) {
          decoratorList.push({ name: match[1], description: '' });
        }
      }
    }

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
            const raw = shellResult.data as Record<string, unknown>;
            const inner = ((raw.data ?? raw) as Record<string, any>);
            shellInfoCache[shellId] = {
              description: (inner.description as string) || '',
              regions: (inner.config?.regions as string[]) || [],
              layout: (inner.layout as string) || undefined,
            };
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

      const contextContent = generateSectionContext({
        section,
        themeTokens: themeTokensCss,
        decorators: decoratorList,
        guardConfig,
        personality,
        themeName,
        recipeName,
        zoneContext,
        patternSpecs: sectionPatterns,
        constraints: essence.dna.constraints as Record<string, unknown> | undefined,
        shellInfo: shellInfoCache[section.shell as string],
      });

      const sectionContextPath = join(contextDir, `section-${section.id}.md`);
      writeFileSync(sectionContextPath, contextContent);
      contextFiles.push(sectionContextPath);
    }

    // ── Generate scaffold.md ──
    const routes = blueprint.routes || {};
    const scaffoldContent = generateScaffoldContext({
      appName: essence.meta.archetype || 'Application',
      blueprintId: '',
      themeName,
      recipeName,
      personality,
      topologyMarkdown,
      sections,
      routes,
      constraints: essence.dna.constraints as Record<string, unknown> | undefined,
      seo: essence.meta.seo as { schema_org?: string[]; meta_priorities?: string[] } | undefined,
      navigation: essence.meta.navigation as { hotkeys?: unknown[]; command_palette?: boolean } | undefined,
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

    // Fetch pattern specs
    const patternSpecs: Record<string, PatternSpecSummary> = {};
    const seenPatterns = new Set<string>();
    for (const page of pages) {
      for (const item of page.layout) {
        const names = extractPatternNames(item);
        for (const name of names) {
          if (!seenPatterns.has(name)) {
            seenPatterns.add(name);
            try {
              const patResult = await registry.fetchPattern(name);
              if (patResult?.data) {
                const raw = patResult.data as Record<string, unknown>;
                const inner = ((raw.data ?? raw) as Record<string, any>);
                const defaultPreset = inner.default_preset || 'standard';
                const preset = inner.presets?.[defaultPreset];
                let slots = preset?.layout?.slots || {};

                // If no slots defined, generate synthetic ones from the pattern name and description
                if (Object.keys(slots).length === 0) {
                  const synthetic = generateSyntheticSlots(name, (inner.description as string) || '');
                  if (Object.keys(synthetic).length > 0) {
                    slots = synthetic;
                  }
                }

                const spec: PatternSpecSummary = {
                  description: (inner.description as string) || '',
                  components: (inner.components as string[]) || [],
                  slots,
                };
                // Enrich empty components with synthetic inference
                if (!spec.components || spec.components.length === 0) {
                  const syntheticComps = generateSyntheticComponents(name, spec.description);
                  if (syntheticComps.length > 0) spec.components = syntheticComps;
                }
                patternSpecs[name] = spec;
              } else {
                // Pattern not in registry — generate synthetic spec from name alone
                const synthetic = generateSyntheticSlots(name, '');
                const syntheticComps = generateSyntheticComponents(name, '');
                if (Object.keys(synthetic).length > 0 || syntheticComps.length > 0) {
                  patternSpecs[name] = { description: '', components: syntheticComps, slots: synthetic };
                }
              }
            } catch {
              // Pattern fetch failed — generate synthetic spec from name alone
              const synthetic = generateSyntheticSlots(name, '');
              const syntheticComps = generateSyntheticComponents(name, '');
              if (Object.keys(synthetic).length > 0 || syntheticComps.length > 0) {
                patternSpecs[name] = { description: '', components: syntheticComps, slots: synthetic };
              }
            }
          }
        }
      }
    }

    const themeTokensCss = existsSync(tokensPath) ? readFileSync(tokensPath, 'utf-8') : '';
    const decoratorList: Array<{ name: string; description: string }> = [];
    if (recipeData?.decorators) {
      for (const [name, desc] of Object.entries(recipeData.decorators)) {
        decoratorList.push({ name, description: desc as string });
      }
    } else if (existsSync(decoratorsPath)) {
      // Fallback: parse decorator class names from existing decorators.css
      const decoratorsCss = readFileSync(decoratorsPath, 'utf-8');
      const classRegex = /\/\*\s*(.+?)\s*\*\/\s*\n\s*\.([\w-]+)\s*\{/g;
      let match: RegExpExecArray | null;
      while ((match = classRegex.exec(decoratorsCss)) !== null) {
        decoratorList.push({ name: match[2], description: match[1] });
      }
      if (decoratorList.length === 0) {
        const simpleClassRegex = /^\.([\w-]+)\s*\{/gm;
        while ((match = simpleClassRegex.exec(decoratorsCss)) !== null) {
          decoratorList.push({ name: match[1], description: '' });
        }
      }
    }

    // Fetch shell info for V3.0 flat pages
    let v30ShellInfo: ShellInfo | undefined;
    try {
      const shellResult = await registry.fetchShell(shell);
      if (shellResult?.data) {
        const raw = shellResult.data as Record<string, unknown>;
        const inner = ((raw.data ?? raw) as Record<string, any>);
        v30ShellInfo = {
          description: (inner.description as string) || '',
          regions: (inner.config?.regions as string[]) || [],
          layout: (inner.layout as string) || undefined,
        };
      }
    } catch { /* continue without shell info */ }

    const contextContent = generateSectionContext({
      section: syntheticSection,
      themeTokens: themeTokensCss,
      decorators: decoratorList,
      guardConfig,
      personality,
      themeName,
      recipeName,
      zoneContext: `This is the primary section (${shell} shell).`,
      patternSpecs,
      constraints: essence.dna.constraints as Record<string, unknown> | undefined,
      shellInfo: v30ShellInfo,
    });

    const sectionContextPath = join(contextDir, `section-${syntheticSection.id}.md`);
    writeFileSync(sectionContextPath, contextContent);
    contextFiles.push(sectionContextPath);
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
  // code field removed — patterns are framework-agnostic
}

export interface ShellInfo {
  description: string;
  regions: string[];
  layout?: string;
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
  constraints?: Record<string, unknown>;
  shellInfo?: ShellInfo;
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
  constraints?: Record<string, unknown>;
  seo?: { schema_org?: string[]; meta_priorities?: string[] };
  navigation?: { hotkeys?: unknown[]; command_palette?: boolean };
}

/**
 * Generate a compact markdown context file for a single section.
 * Includes guard mode, zone context, decorators, pattern specs,
 * features, and personality. Topology and theme tokens are referenced
 * from scaffold.md and src/styles/tokens.css respectively.
 */
export function generateSectionContext(input: SectionContextInput): string {
  const { section, decorators, guardConfig, personality, themeName, recipeName, zoneContext, patternSpecs, recipeHints, constraints, shellInfo } = input;
  const lines: string[] = [];

  // Header
  lines.push(`# Section: ${section.id}`);
  lines.push('');
  lines.push(`**Role:** ${section.role} | **Shell:** ${section.shell} | **Archetype:** ${section.id}`);
  lines.push(`**Description:** ${section.description}`);
  if (shellInfo) {
    lines.push(`**Shell structure:** ${shellInfo.description}`);
    lines.push(`**Regions:** ${shellInfo.regions.join(', ')}`);
  }
  if (section.dna_overrides) {
    const parts: string[] = [];
    if (section.dna_overrides.density) parts.push(`density: ${section.dna_overrides.density}`);
    if (section.dna_overrides.mode) parts.push(`mode: ${section.dna_overrides.mode}`);
    if (parts.length > 0) {
      lines.push(`**DNA Overrides:** ${parts.join(', ')}`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Guard Rules (compact — full rules in scaffold.md)
  lines.push(`**Guard:** ${guardConfig.mode} mode | DNA violations = ${guardConfig.dna_enforcement} | Blueprint violations = ${guardConfig.blueprint_enforcement}`);
  lines.push('');

  // Theme (reference only — full tokens in src/styles/tokens.css)
  lines.push(`**Theme tokens:** see \`src/styles/tokens.css\` — use \`var(--d-primary)\`, \`var(--d-bg)\`, etc.`);
  lines.push('');

  // Decorators (compact reference with usage pattern; full table in .decantr/context/decorators.md)
  if (decorators.length > 0) {
    const names = decorators.map(d => `\`${d.name}\``).join(', ');
    lines.push(`**Decorators:** ${names} (see \`src/styles/decorators.css\`)`);
    lines.push("Usage: `className={css('_flex _col') + ' carbon-card'}` — atoms via css(), decorators as plain class strings.");
  } else {
    lines.push('**Decorators:** none defined.');
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

  // Personality — reference only, full text lives in scaffold.md
  if (personality.length > 0) {
    lines.push('**Personality:** See scaffold.md for personality and visual direction.');
    lines.push('');
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
    for (const [patternName, spec] of uniquePatterns) {
      lines.push(`### ${patternName}`);
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
    }
    if (navigation.hotkeys && navigation.hotkeys.length > 0) {
      lines.push(`- Hotkeys: ${navigation.hotkeys.length} configured`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export { loadTemplate, renderTemplate };
