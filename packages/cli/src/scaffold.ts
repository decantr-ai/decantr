import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isV3 } from '@decantr/essence-spec';
import type { EssenceV3, EssenceDNA, EssenceBlueprint, EssenceMeta } from '@decantr/essence-spec';
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
  archetypeData?: ArchetypeData
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
  };

  return renderTemplate(template, vars);
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
  recipeData?: RecipeData
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

  // Write DECANTR.md
  const decantrMdPath = join(projectRoot, 'DECANTR.md');
  writeFileSync(decantrMdPath, generateDecantrMd(essence, detected, themeData, recipeData, archetypeData));

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

- \`decantr status\` — Project health and DNA/Blueprint overview
- \`decantr validate\` — Validate essence file
- \`decantr check\` — Detect drift issues
- \`decantr migrate\` — Migrate v2 essence to v3
- \`decantr sync-drift\` — Review and resolve drift entries
- \`decantr search\` — Search the registry
- \`decantr sync\` — Sync registry content

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

export { loadTemplate, renderTemplate };
