import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  gitignoreUpdated: boolean;
}

const CLI_VERSION = '1.0.0';

/**
 * Theme data for populating DECANTR.md theme quick reference.
 */
export interface ThemeData {
  seed?: Record<string, string>;
  palette?: Record<string, string>;
  cvd_support?: string[];
  tokens?: {
    base?: Record<string, string>;
    cvd?: Record<string, Record<string, string>>;
  };
}

/**
 * Recipe data for populating DECANTR.md decorators reference.
 */
export interface RecipeData {
  decorators?: Record<string, string>;
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
    structure = archetypeData.pages.map(p => ({
      id: p.id,
      shell: p.shell || options.shell,
      // Ensure layout has at least one item (schema requires minItems: 1)
      layout: p.default_layout?.length ? p.default_layout : ['hero'],
    }));
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
 * Generate the DECANTR.md file from template and essence.
 */
function generateDecantrMd(
  essence: EssenceFile,
  detected: DetectedProject,
  themeData?: ThemeData,
  recipeData?: RecipeData
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
  };

  return renderTemplate(template, vars);
}

/**
 * Generate project.json from detection results.
 */
function generateProjectJson(
  detected: DetectedProject,
  options: InitOptions,
  registrySource: 'api' | 'bundled'
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
  registrySource: 'api' | 'bundled' = 'bundled',
  themeData?: ThemeData,
  recipeData?: RecipeData
): ScaffoldResult {
  // Build essence
  const essence = buildEssence(options, archetypeData);

  // Create directories
  const decantrDir = join(projectRoot, '.decantr');
  const contextDir = join(decantrDir, 'context');
  const cacheDir = join(decantrDir, 'cache');

  mkdirSync(contextDir, { recursive: true });
  mkdirSync(cacheDir, { recursive: true });

  // Write essence file
  const essencePath = join(projectRoot, 'decantr.essence.json');
  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');

  // Write DECANTR.md
  const decantrMdPath = join(projectRoot, 'DECANTR.md');
  writeFileSync(decantrMdPath, generateDecantrMd(essence, detected, themeData, recipeData));

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

  // Update .gitignore
  const gitignoreUpdated = updateGitignore(projectRoot);

  return {
    essencePath,
    decantrMdPath,
    projectJsonPath,
    contextFiles,
    gitignoreUpdated,
  };
}

export { loadTemplate, renderTemplate };
