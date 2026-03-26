import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DetectedProject } from './detect.js';
import type { InitOptions } from './prompts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface EssenceFile {
  version: string;
  archetype?: string;
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
    layout: string[];
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
}

export interface BlueprintData {
  id: string;
  name?: string;
  archetypes?: string[];
  theme?: string;
  personality?: string[];
  pages?: Array<{
    id: string;
    shell: string;
    default_layout: string[];
  }>;
  features?: string[];
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
export function buildEssence(options: InitOptions, blueprint?: BlueprintData): EssenceFile {
  // Default structure if no blueprint
  let structure: EssenceFile['structure'] = [
    { id: 'home', shell: options.shell, layout: [] }
  ];
  let features: string[] = options.features;

  // Use blueprint structure if available
  if (blueprint?.pages) {
    structure = blueprint.pages.map(p => ({
      id: p.id,
      shell: p.shell || options.shell,
      layout: p.default_layout || [],
    }));
  }

  if (blueprint?.features) {
    features = [...new Set([...features, ...blueprint.features])];
  }

  // Map density to content gap
  const contentGapMap: Record<string, string> = {
    compact: '_gap2',
    comfortable: '_gap4',
    spacious: '_gap6',
  };

  return {
    version: '2.0.0',
    archetype: options.archetype,
    blueprint: options.blueprint,
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
}

/**
 * Generate the DECANTR.md file from template and essence.
 */
function generateDecantrMd(essence: EssenceFile, detected: DetectedProject): string {
  const template = loadTemplate('DECANTR.md.template');

  // Build pages table
  const pagesTable = essence.structure.map(p =>
    `| ${p.id} | ${p.shell} | ${p.layout.join(', ') || 'none'} |`
  ).join('\n');

  // Build patterns list
  const allPatterns = [...new Set(essence.structure.flatMap(p => p.layout))];
  const patternsList = allPatterns.length > 0
    ? allPatterns.map(p => `- \`${p}\``).join('\n')
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
  const layout = essence.structure[0]?.layout.join(', ') || 'none';

  // Build scaffold structure description
  const scaffoldStructure = essence.structure.map(p => {
    const patterns = p.layout.length > 0
      ? `\n  - Patterns: ${p.layout.join(', ')}`
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

  // Build pages table
  const pagesTable = `| Page | Shell | Layout |
|------|-------|--------|
${essence.structure.map(p => `| ${p.id} | ${p.shell} | ${p.layout.join(', ') || 'none'} |`).join('\n')}`;

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
  blueprint?: BlueprintData,
  registrySource: 'api' | 'bundled' = 'bundled'
): ScaffoldResult {
  // Build essence
  const essence = buildEssence(options, blueprint);

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
  writeFileSync(decantrMdPath, generateDecantrMd(essence, detected));

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
