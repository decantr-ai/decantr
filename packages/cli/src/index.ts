import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEssence, evaluateGuard, isV3 } from '@decantr/essence-spec';
import type { EssenceFile, EssenceV3 } from '@decantr/essence-spec';
import { RegistryAPIClient } from '@decantr/registry';
import type { ApiContentType, ComposeEntry } from '@decantr/registry';
import { detectProject, formatDetection } from './detect.js';
import { runInteractivePrompts, runSimplifiedInit, parseFlags, mergeWithDefaults, confirm } from './prompts.js';
import { scaffoldProject, scaffoldMinimal, composeArchetypes, type ThemeData, type RecipeData, type LayoutItem } from './scaffold.js';
import { RegistryClient, syncRegistry } from './registry.js';
import {
  createTheme,
  listCustomThemes,
  deleteTheme,
  importTheme,
  validateCustomTheme
} from './theme-commands.js';
import { saveCredentials, clearCredentials, getCredentials } from './auth.js';
import { cmdPublish } from './commands/publish.js';
import { cmdCreate } from './commands/create.js';
import { cmdMigrate } from './commands/migrate.js';
import { cmdSyncDrift, resolveDriftEntries } from './commands/sync-drift.js';

// ── Helpers ──

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

function heading(text: string): string { return `\n${BOLD}${text}${RESET}\n`; }
function success(text: string): string { return `${GREEN}${text}${RESET}`; }
function error(text: string): string { return `${RED}${text}${RESET}`; }
function dim(text: string): string { return `${DIM}${text}${RESET}`; }
function cyan(text: string): string { return `${CYAN}${text}${RESET}`; }

interface PromptContext {
  archetype: string;
  blueprint?: string;
  theme: string;
  mode: string;
  target: string;
  pages: Array<{ id: string; shell: string; layout: string[] }>;
  personality: string[];
  features: string[];
  guard: string;
}

function extractPatternName(item: unknown): string {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    if (typeof obj.pattern === 'string') return obj.pattern;
    // Handle column layouts
    if (Array.isArray(obj.cols)) {
      return obj.cols.map(extractPatternName).join(' | ');
    }
  }
  return 'custom';
}

function generateCuratedPrompt(ctx: PromptContext): string {
  const lines: string[] = [];

  lines.push(`I'm building a ${ctx.archetype} application using ${ctx.target}.`);
  lines.push('');

  if (ctx.blueprint) {
    lines.push(`Blueprint: ${ctx.blueprint}`);
  }
  lines.push(`Theme: ${ctx.theme} (${ctx.mode} mode)`);
  lines.push(`Personality: ${ctx.personality.join(', ')}`);
  lines.push(`Guard mode: ${ctx.guard}`);
  lines.push('');

  lines.push('Pages to build:');
  for (const page of ctx.pages) {
    const patternNames = page.layout.map(extractPatternName);
    const patterns = patternNames.length > 0 ? patternNames.join(', ') : 'custom';
    lines.push(`  - ${page.id}: ${page.shell} shell with ${patterns}`);
  }

  if (ctx.features.length > 0) {
    lines.push('');
    lines.push(`Features: ${ctx.features.join(', ')}`);
  }

  lines.push('');
  lines.push('Please read DECANTR.md for the full design spec and methodology.');
  lines.push('Follow the guard rules and use the patterns from decantr.essence.json.');

  return lines.join('\n');
}

function boxedPrompt(content: string, title: string): string {
  const lines = content.split('\n');
  const maxLen = Math.max(...lines.map(l => l.length), title.length + 4);
  const width = maxLen + 4;

  const top = `┌${'─'.repeat(width - 2)}┐`;
  const titleLine = `│ ${BOLD}${title}${RESET}${' '.repeat(width - title.length - 4)} │`;
  const sep = `├${'─'.repeat(width - 2)}┤`;
  const bottom = `└${'─'.repeat(width - 2)}┘`;

  const body = lines.map(line => {
    const padding = ' '.repeat(width - line.length - 4);
    return `│ ${line}${padding} │`;
  }).join('\n');

  return `${top}\n${titleLine}\n${sep}\n${body}\n${bottom}`;
}

function getAPIClient(): RegistryAPIClient {
  return new RegistryAPIClient({
    baseUrl: process.env.DECANTR_API_URL || undefined,
    apiKey: process.env.DECANTR_API_KEY || undefined,
  });
}

// ── Commands ──

async function cmdSearch(query: string, type?: string) {
  const apiClient = getAPIClient();
  try {
    const response = await apiClient.search({ q: query, type });
    const results = response.results;

    if (results.length === 0) {
      console.log(dim(`No results for "${query}"`));
      return;
    }

    console.log(heading(`${results.length} result(s) for "${query}"`));
    for (const r of results) {
      console.log(`  ${cyan(r.type.padEnd(12))} ${BOLD}${r.slug}${RESET}`);
      console.log(`  ${dim(r.description || '')}`);
      console.log('');
    }
  } catch {
    console.log(dim(`Search failed. API may be unavailable.`));
  }
}

async function cmdSuggest(query: string, type?: string) {
  const apiClient = getAPIClient();
  const searchType = type || 'pattern';
  try {
    const response = await apiClient.search({ q: query, type: searchType });
    const results = response.results;

    if (results.length === 0) {
      console.log(dim(`No suggestions for "${query}"`));
      console.log('');
      console.log('Try:');
      console.log(`  ${cyan('decantr list patterns')} - see all patterns`);
      console.log(`  ${cyan('decantr search <broader-term>')} - broaden your search`);
      return;
    }

    console.log(heading(`Suggestions for "${query}"`));

    // Group by relevance: exact matches vs related
    const queryLower = query.toLowerCase();
    const exact = results.filter(r => r.slug.toLowerCase().includes(queryLower));
    const related = results.filter(r => !r.slug.toLowerCase().includes(queryLower));

    if (exact.length > 0) {
      console.log(`${BOLD}Direct matches:${RESET}`);
      for (const r of exact.slice(0, 3)) {
        console.log(`  ${cyan(r.slug)} - ${r.description || ''}`);
      }
      console.log('');
    }

    if (related.length > 0) {
      console.log(`${BOLD}Related:${RESET}`);
      for (const r of related.slice(0, 5)) {
        console.log(`  ${cyan(r.slug)} - ${r.description || ''}`);
      }
      console.log('');
    }

    console.log(dim(`Use "decantr get pattern <id>" for full details`));
  } catch {
    console.log(dim(`Suggestion search failed. API may be unavailable.`));
  }
}

async function cmdGet(type: string, id: string) {
  const validTypes = ['pattern', 'archetype', 'recipe', 'theme', 'blueprint', 'shell'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  // Map singular type names to API plural form
  const typeMap: Record<string, string> = {
    pattern: 'patterns',
    archetype: 'archetypes',
    recipe: 'recipes',
    theme: 'themes',
    blueprint: 'blueprints',
    shell: 'shells',
  };
  const apiType = typeMap[type] as ApiContentType;

  const registryClient = new RegistryClient({
    cacheDir: join(process.cwd(), '.decantr', 'cache'),
  });
  const result = await registryClient.fetchContentItem(apiType, id);
  if (result) {
    console.log(JSON.stringify(result.data, null, 2));
    return;
  }

  // Fallback to bundled content — check multiple resolution paths
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const bundledCandidates = [
    join(currentDir, 'bundled', apiType, `${id}.json`),         // Running from src/
    join(currentDir, '..', 'src', 'bundled', apiType, `${id}.json`), // Running from dist/
    join(currentDir, '..', 'bundled', apiType, `${id}.json`),   // Alternative dist layout
  ];
  const bundledPath = bundledCandidates.find(p => existsSync(p)) || null;
  if (bundledPath) {
    const data = JSON.parse(readFileSync(bundledPath, 'utf-8'));
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.error(error(`${type} "${id}" not found.`));
  process.exitCode = 1;
  return;
}

function buildRegistryContext(): { themeRegistry: Map<string, { modes: string[] }>; patternRegistry: Map<string, unknown> } {
  const themeRegistry = new Map<string, { modes: string[] }>();
  const patternRegistry = new Map<string, unknown>();
  const projectRoot = process.cwd();
  const cacheDir = join(projectRoot, '.decantr', 'cache');
  const customDir = join(projectRoot, '.decantr', 'custom');

  // Load themes from cache (organized by namespace)
  const cachedThemesDir = join(cacheDir, '@official', 'themes');
  try {
    if (existsSync(cachedThemesDir)) {
      for (const f of readdirSync(cachedThemesDir).filter((f: string) => f.endsWith('.json') && f !== 'index.json')) {
        const data = JSON.parse(readFileSync(join(cachedThemesDir, f), 'utf-8'));
        if (data.id && !themeRegistry.has(data.id)) {
          themeRegistry.set(data.id, { modes: data.modes || ['light', 'dark'] });
        }
      }
    }
  } catch { /* skip if unavailable */ }

  // Load custom themes
  const customThemesDir = join(customDir, 'themes');
  try {
    if (existsSync(customThemesDir)) {
      for (const f of readdirSync(customThemesDir).filter((f: string) => f.endsWith('.json'))) {
        const data = JSON.parse(readFileSync(join(customThemesDir, f), 'utf-8'));
        if (data.id) {
          // Register with custom: prefix
          themeRegistry.set(`custom:${data.id}`, { modes: data.modes || ['light', 'dark'] });
        }
      }
    }
  } catch { /* skip if unavailable */ }

  // Load patterns from cache
  const cachedPatternsDir = join(cacheDir, '@official', 'patterns');
  try {
    if (existsSync(cachedPatternsDir)) {
      for (const f of readdirSync(cachedPatternsDir).filter((f: string) => f.endsWith('.json') && f !== 'index.json')) {
        const data = JSON.parse(readFileSync(join(cachedPatternsDir, f), 'utf-8'));
        if (data.id && !patternRegistry.has(data.id)) {
          patternRegistry.set(data.id, data);
        }
      }
    }
  } catch { /* skip if unavailable */ }

  return { themeRegistry, patternRegistry };
}

async function cmdValidate(path?: string) {
  const essencePath = path || join(process.cwd(), 'decantr.essence.json');
  let raw: string;

  try {
    raw = readFileSync(essencePath, 'utf-8');
  } catch {
    console.error(error(`Could not read ${essencePath}`));
    process.exitCode = 1;
    return;
  }

  let essence: EssenceFile;
  try {
    essence = JSON.parse(raw);
  } catch (e) {
    console.error(error(`Invalid JSON: ${(e as Error).message}`));
    process.exitCode = 1;
    return;
  }

  // Detect and report version
  const detectedVersion = isV3(essence) ? 'v3' : 'v2';
  console.log(`${DIM}Detected essence version: ${detectedVersion}${RESET}`);

  const result = validateEssence(essence);

  if (result.valid) {
    console.log(success(`Essence is valid (${detectedVersion}).`));
  } else {
    console.error(error('Validation failed:'));
    for (const err of result.errors) {
      console.error(`  ${RED}${err}${RESET}`);
    }
    process.exitCode = 1;
  }

  // For v2 essences, suggest migration
  if (detectedVersion === 'v2' && result.valid) {
    console.log(`${YELLOW}Tip: Run \`decantr migrate\` to upgrade to v3 format.${RESET}`);
  }

  try {
    // Build registry context for guard validation
    const { themeRegistry, patternRegistry } = buildRegistryContext();
    const violations = evaluateGuard(essence, { themeRegistry, patternRegistry });
    if (violations.length > 0) {
      console.log(heading('Guard violations:'));
      for (const v of violations) {
        const vr = v as Record<string, string>;
        console.log(`  ${YELLOW}[${vr.rule}]${RESET} ${vr.message}`);
        if (vr.suggestion) {
          console.log(`    ${DIM}Suggestion: ${vr.suggestion}${RESET}`);
        }
      }
    } else if (result.valid) {
      console.log(success('No guard violations.'));
    }
  } catch { /* guard is optional */ }
}

async function cmdList(type: string) {
  const validTypes = ['patterns', 'archetypes', 'recipes', 'themes', 'blueprints', 'shells'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const registryClient = new RegistryClient({
    cacheDir: join(process.cwd(), '.decantr', 'cache'),
  });

  const result = await registryClient.fetchContentList(type as ApiContentType);
  const items = result.data.items;

  if (items.length === 0) {
    console.log(dim(`No ${type} found.`));
    return;
  }

  // For themes, show custom items separately
  if (type === 'themes') {
    const customItems = registryClient.listCustomContent('themes');
    const customIds = new Set(customItems.map(c => c.id));
    const registryItems = items.filter(i => !customIds.has(i.id));

    console.log(heading(`Registry themes (${registryItems.length}):`));
    for (const item of registryItems) {
      console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
    }
    if (customItems.length > 0) {
      console.log('');
      console.log(heading(`Custom themes (${customItems.length}):`));
      for (const item of customItems) {
        console.log(`  ${cyan(`custom:${item.id}`)}  ${dim(item.description || item.name || '')}`);
      }
    } else {
      console.log('');
      console.log(dim('Custom themes (0):'));
      console.log(dim('  Run "decantr theme create <name>" to create a custom theme.'));
    }
  } else {
    console.log(heading(`${items.length} ${type} found`));
    for (const item of items) {
      console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
    }
  }
}

// ── Init command (updated) ──

interface InitArgs {
  blueprint?: string;
  archetype?: string;
  theme?: string;
  mode?: string;
  shape?: string;
  target?: string;
  guard?: string;
  density?: string;
  shell?: string;
  personality?: string;
  features?: string;
  existing?: boolean;
  offline?: boolean;
  yes?: boolean;
  registry?: string;
}

async function cmdInit(args: InitArgs) {
  const projectRoot = process.cwd();

  console.log(heading('Decantr Project Setup'));

  // Detect project configuration
  const detected = detectProject(projectRoot);

  // Check for existing essence
  if (detected.existingEssence && !args.existing) {
    console.log(`${YELLOW}Warning: decantr.essence.json already exists.${RESET}`);
    const overwrite = await confirm('Overwrite existing configuration?', false);
    if (!overwrite) {
      console.log(dim('Cancelled.'));
      return;
    }
  }

  // Create registry client
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
  });

  // Check connectivity
  const apiAvailable = await registryClient.checkApiAvailability();

  let selectedBlueprint = 'default';
  let registrySource: 'api' | 'cache' = 'cache';

  if (args.yes) {
    // Non-interactive: use --blueprint flag or default
    selectedBlueprint = args.blueprint || 'default';
  } else if (!apiAvailable) {
    // Offline mode with no blueprint specified: use minimal scaffold
    if (!args.blueprint) {
      console.log(`\n${YELLOW}You're offline. Scaffolding minimal Decantr project.${RESET}`);
      console.log(dim('Run `decantr sync` or `decantr upgrade` when online to pull full registry content.\n'));

      const result = scaffoldMinimal(projectRoot);

      console.log(success('\nProject scaffolded (minimal/offline)!\n'));
      console.log('  Files created:');
      console.log(`    ${cyan('decantr.essence.json')}    Design specification`);
      console.log(`    ${cyan('DECANTR.md')}              LLM instructions`);
      console.log(`    ${cyan('.decantr/')}               Project state & custom content dirs`);
      if (result.gitignoreUpdated) {
        console.log(`    ${dim('.gitignore updated')}`);
      }
      console.log('');
      console.log('  Next steps:');
      console.log(`    1. Run ${cyan('decantr sync')} when online`);
      console.log(`    2. Use ${cyan('decantr create <type> <name>')} to create custom content`);
      console.log(`    3. Review DECANTR.md for methodology`);
      return;
    }

    console.log(`\n${YELLOW}You're offline. Scaffolding Decantr default.${RESET}`);
    console.log(dim('Run `decantr upgrade` when online, or visit decantr.ai/registry\n'));
    selectedBlueprint = 'default';
  } else {
    // Online: fetch blueprints and show simplified prompt
    console.log(dim('Fetching registry content...'));
    const blueprintsResult = await registryClient.fetchBlueprints();
    registrySource = blueprintsResult.source.type === 'api' ? 'api' : 'cache';

    const { selectedBlueprint: selected } = await runSimplifiedInit(
      blueprintsResult.data.items
    );

    selectedBlueprint = selected || 'default';
  }

  // Fetch registry content for scaffold
  const [archetypesResult, blueprintsResult, themesResult] = await Promise.all([
    registryClient.fetchArchetypes(),
    registryClient.fetchBlueprints(),
    registryClient.fetchThemes(),
  ]);

  if (archetypesResult.source.type === 'api') {
    registrySource = 'api';
  }

  const archetypes = archetypesResult.data.items;
  const blueprints = blueprintsResult.data.items;
  const themes = themesResult.data.items;

  let options;

  if (args.yes || selectedBlueprint !== 'default') {
    // Non-interactive mode or simplified selection: use flags with defaults
    const flags = parseFlags(args as Record<string, unknown>, detected);
    flags.blueprint = selectedBlueprint !== 'default' ? selectedBlueprint : flags.blueprint;
    options = mergeWithDefaults(flags, detected);
  } else {
    // Full interactive mode (default blueprint selected)
    options = await runInteractivePrompts(detected, archetypes, blueprints, themes);
  }

  // Track blueprint recipe name if specified
  let blueprintRecipeName: string | undefined;

  // Fetch blueprint/archetype data
  let archetypeData: {
    id: string;
    pages?: Array<{ id: string; shell: string; default_layout: LayoutItem[]; patterns?: Array<{ pattern: string; preset?: string; as?: string }> }>;
    features?: string[];
  } | undefined;

  if (options.blueprint) {
    // Fetch the blueprint to get its primary archetype and theme
    const blueprintResult = await registryClient.fetchBlueprint(options.blueprint);
    if (blueprintResult) {
      // API/cache returns wrapper {id, type, slug, data: {...actual content...}}
      // Unwrap: use inner .data if present, otherwise treat as direct content
      const rawBlueprint = blueprintResult.data as Record<string, unknown>;
      const blueprint = (rawBlueprint.data ?? rawBlueprint) as {
        id: string;
        compose?: ComposeEntry[];
        features?: string[];
        theme?: {
          style?: string;
          mode?: string;
          recipe?: string;
          shape?: string;
        };
      };

      // Apply blueprint theme settings (unless explicitly overridden by flags)
      if (blueprint.theme) {
        if (blueprint.theme.style && options.theme === 'luminarum') {
          options.theme = blueprint.theme.style;
        }
        if (blueprint.theme.mode && options.mode === 'dark') {
          options.mode = blueprint.theme.mode as 'dark' | 'light' | 'auto';
        }
        if (blueprint.theme.shape && options.shape === 'rounded') {
          options.shape = blueprint.theme.shape as 'rounded' | 'sharp' | 'pill';
        }
      }

      // Remember the blueprint recipe name for recipe fetch
      blueprintRecipeName = blueprint.theme?.recipe;

      if (blueprint.compose && blueprint.compose.length > 0) {
        // Fetch all archetypes in parallel
        const entries = blueprint.compose;
        const fetchPromises = entries.map(entry => {
          const id = typeof entry === 'string' ? entry : entry.archetype;
          return registryClient.fetchArchetype(id).then(r => {
            // Unwrap API wrapper: actual archetype content is in .data
            const raw = r?.data as Record<string, unknown> | undefined;
            const inner = raw?.data ?? raw;
            return [id, inner] as const;
          });
        });
        const results = await Promise.all(fetchPromises);
        const archetypeMap = new Map(results.map(([id, data]) => [id, (data || null) as any]));

        // Compose pages from all archetypes
        const composed = composeArchetypes(entries, archetypeMap);
        const primaryId = typeof entries[0] === 'string' ? entries[0] : entries[0].archetype;
        archetypeData = {
          id: primaryId,
          pages: composed.pages.map(p => ({
            id: p.id,
            shell: p.shell_override || composed.defaultShell,
            default_layout: p.layout,
          })),
          features: composed.features,
        };
        options.archetype = primaryId;
        options.shell = composed.defaultShell;
      }
    } else {
      console.log(`${YELLOW}  Warning: Could not fetch blueprint "${options.blueprint}". Using defaults.${RESET}`);
    }
  } else if (options.archetype) {
    // Direct archetype selection
    const archetypeResult = await registryClient.fetchArchetype(options.archetype);
    if (archetypeResult) {
      const rawArch = archetypeResult.data as Record<string, unknown>;
      archetypeData = (rawArch.data ?? rawArch) as typeof archetypeData;
    } else {
      console.log(`${YELLOW}  Warning: Could not fetch archetype "${options.archetype}". Using defaults.${RESET}`);
    }
  }

  // Fetch theme data for DECANTR.md quick reference and CSS generation
  let themeData: ThemeData | undefined;
  let recipeData: RecipeData | undefined;

  if (options.theme) {
    const themeResult = await registryClient.fetchTheme(options.theme);
    if (themeResult) {
      const rawTheme = themeResult.data as Record<string, unknown>;
      const theme = (rawTheme.data ?? rawTheme) as {
        seed?: Record<string, string>;
        palette?: Record<string, Record<string, string>>;
        tokens?: { base?: Record<string, string> };
        decorators?: Record<string, string>;
        cvd_support?: string[];
        typography_hints?: { scale?: string; heading_weight?: number; body_weight?: number };
        motion_hints?: { preference?: string; reduce_motion_default?: boolean };
      };
      themeData = {
        seed: theme.seed,
        palette: theme.palette,
        tokens: theme.tokens,
        cvd_support: theme.cvd_support,
        typography_hints: theme.typography_hints,
        motion_hints: theme.motion_hints,
      };
      // Some themes include decorators (recipe data)
      if (theme.decorators) {
        recipeData = { decorators: theme.decorators };
      }
    } else {
      console.log(`${YELLOW}  Warning: Could not fetch theme "${options.theme}". Using defaults.${RESET}`);
    }

    // Fetch recipe data (recipe is authoritative for decorators, spatial_hints, radius_hints)
    const recipeName = blueprintRecipeName || options.theme;
    const recipeResult = await registryClient.fetchRecipe(recipeName);
    if (recipeResult) {
      const rawRecipe = recipeResult.data as Record<string, unknown>;
      const recipe = (rawRecipe.data ?? rawRecipe) as {
        decorators?: Record<string, string>;
        spatial_hints?: { density_bias?: string; content_gap_shift?: number; section_padding?: string | null; card_wrapping?: string; surface_override?: string };
        radius_hints?: { philosophy: string; base: number };
      };
      recipeData = {
        decorators: recipe.decorators || recipeData?.decorators,
        spatial_hints: recipe.spatial_hints,
        radius_hints: recipe.radius_hints,
      };
    }
  }

  // Scaffold the project
  console.log(heading('Scaffolding project...'));

  const result = scaffoldProject(
    projectRoot,
    options,
    detected,
    archetypeData,
    registrySource as 'api' | 'cache',
    themeData,
    recipeData
  );

  // Output summary
  console.log(success('\nProject scaffolded!\n'));
  console.log('  Files created:');
  console.log(`    ${cyan('decantr.essence.json')}    Design specification`);
  console.log(`    ${cyan('DECANTR.md')}              LLM instructions`);
  console.log(`    ${cyan('.decantr/')}               Project state & cache`);

  if (result.gitignoreUpdated) {
    console.log(`    ${dim('.gitignore updated')}`);
  }

  console.log('');
  console.log('  Next steps:');
  console.log('    1. Review DECANTR.md for methodology');
  console.log('    2. Explore more at decantr.ai/registry');
  console.log('');
  console.log('  Commands:');
  console.log(`    ${cyan('decantr status')}     Project health`);
  console.log(`    ${cyan('decantr search')}     Search registry`);
  console.log(`    ${cyan('decantr get')}        Fetch content details`);
  console.log(`    ${cyan('decantr validate')}   Check essence file`);
  console.log(`    ${cyan('decantr upgrade')}    Update to latest patterns`);
  console.log(`    ${cyan('decantr check')}      Detect drift issues`);
  console.log(`    ${cyan('decantr migrate')}    Migrate v2 essence to v3`);

  // Validate
  const essenceContent = readFileSync(result.essencePath, 'utf-8');
  const essence = JSON.parse(essenceContent);
  const validation = validateEssence(essence);

  if (!validation.valid) {
    console.log(error(`\nValidation warnings: ${validation.errors.join(', ')}`));
  }

  console.log('');

  // Generate curated prompt
  let promptPages: PromptContext['pages'];
  if (isV3(essence)) {
    promptPages = essence.blueprint.pages.map((p: { id: string; shell_override?: string | null; layout: unknown[] }) => ({
      id: p.id,
      shell: p.shell_override ?? essence.blueprint.shell,
      layout: p.layout.map((item: unknown) => typeof item === 'string' ? item : extractPatternName(item)),
    }));
  } else {
    promptPages = essence.structure || [{ id: 'home', shell: options.shell, layout: ['hero'] }];
  }

  const promptCtx: PromptContext = {
    archetype: options.archetype || 'custom',
    blueprint: options.blueprint,
    theme: options.theme,
    mode: options.mode,
    target: options.target,
    pages: promptPages,
    personality: options.personality,
    features: options.features,
    guard: options.guard,
  };

  const curatedPrompt = generateCuratedPrompt(promptCtx);
  console.log(boxedPrompt(curatedPrompt, 'Copy this prompt for your AI assistant'));
  console.log('');

  if (registrySource === 'cache') {
    console.log(dim('Run "decantr sync" when online to get the latest registry content.'));
  }
}

// ── Status command ──

async function cmdStatus() {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');

  console.log(heading('Decantr Project Status'));

  // Check essence
  if (!existsSync(essencePath)) {
    console.log(`${RED}No decantr.essence.json found.${RESET}`);
    console.log(dim('Run "decantr init" to create one.'));
    return;
  }

  // Validate essence
  try {
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
    const validation = validateEssence(essence);

    const essenceVersion = isV3(essence) ? 'v3' : 'v2';
    console.log(`${BOLD}Essence:${RESET}`);
    if (validation.valid) {
      console.log(`  ${GREEN}Valid${RESET} (${essenceVersion})`);
    } else {
      console.log(`  ${RED}Invalid: ${validation.errors.join(', ')}${RESET}`);
    }

    if (isV3(essence)) {
      const v3 = essence as EssenceV3;
      // DNA axioms
      console.log(`  ${BOLD}DNA:${RESET}`);
      console.log(`    Theme: ${v3.dna.theme.style} (${v3.dna.theme.mode})`);
      console.log(`    Spacing: ${v3.dna.spacing.density} density, ${v3.dna.spacing.content_gap} gap`);
      console.log(`    Typography: ${v3.dna.typography.scale} scale`);
      console.log(`    Radius: ${v3.dna.radius.philosophy} (base ${v3.dna.radius.base}px)`);
      console.log(`    Motion: ${v3.dna.motion.preference} (reduce: ${v3.dna.motion.reduce_motion})`);
      console.log(`    Accessibility: WCAG ${v3.dna.accessibility.wcag_level}`);
      console.log(`    Personality: ${v3.dna.personality.join(', ')}`);
      // Blueprint
      console.log(`  ${BOLD}Blueprint:${RESET}`);
      console.log(`    Shell: ${v3.blueprint.shell}`);
      console.log(`    Pages: ${v3.blueprint.pages.length}`);
      console.log(`    Features: ${v3.blueprint.features.length > 0 ? v3.blueprint.features.join(', ') : 'none'}`);
      // Meta
      console.log(`  ${BOLD}Meta:${RESET}`);
      console.log(`    Archetype: ${v3.meta.archetype}`);
      console.log(`    Target: ${v3.meta.target}`);
      console.log(`    Guard: ${v3.meta.guard.mode} (DNA: ${v3.meta.guard.dna_enforcement}, Blueprint: ${v3.meta.guard.blueprint_enforcement})`);
    } else {
      // v2 display
      const e = essence as Record<string, unknown>;
      const theme = e.theme as Record<string, string> | undefined;
      const guard = e.guard as Record<string, string> | undefined;
      const structure = e.structure as unknown[] | undefined;
      console.log(`  Theme: ${theme?.style || 'unknown'} (${theme?.mode || 'unknown'})`);
      console.log(`  Guard: ${guard?.mode || 'unknown'}`);
      console.log(`  Pages: ${(structure || []).length}`);
      console.log(`  ${YELLOW}Tip: Run \`decantr migrate\` to upgrade to v3.${RESET}`);
    }
  } catch (e) {
    console.log(`  ${RED}Error reading essence: ${(e as Error).message}${RESET}`);
  }

  // Check project.json
  console.log('');
  console.log(`${BOLD}Sync Status:${RESET}`);

  if (existsSync(projectJsonPath)) {
    try {
      const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
      const syncStatus = projectJson.sync?.status || 'unknown';
      const lastSync = projectJson.sync?.lastSync || 'never';
      const source = projectJson.sync?.registrySource || 'unknown';

      const statusColor = syncStatus === 'synced' ? GREEN : YELLOW;
      console.log(`  Status: ${statusColor}${syncStatus}${RESET}`);
      console.log(`  Last sync: ${dim(lastSync)}`);
      console.log(`  Source: ${dim(source)}`);
    } catch {
      console.log(`  ${YELLOW}Could not read project.json${RESET}`);
    }
  } else {
    console.log(`  ${YELLOW}No .decantr/project.json found${RESET}`);
    console.log(dim('  Run "decantr init" to create project files.'));
  }
}

// ── Sync command ──

async function cmdSync() {
  const projectRoot = process.cwd();
  const cacheDir = join(projectRoot, '.decantr', 'cache');

  console.log(heading('Syncing registry content...'));

  const result = await syncRegistry(cacheDir);

  if (result.synced.length > 0) {
    console.log(success('Sync completed successfully.'));
    console.log(`  Synced: ${result.synced.join(', ')}`);
    if (result.failed.length > 0) {
      console.log(`  ${YELLOW}Failed: ${result.failed.join(', ')}${RESET}`);
    }
  } else {
    console.log(`${YELLOW}Could not sync: API unavailable${RESET}`);
    if (result.failed.length > 0) {
      console.log(`  ${YELLOW}Failed: ${result.failed.join(', ')}${RESET}`);
    }
  }
}

// ── Audit command ──

async function cmdAudit() {
  const projectRoot = process.cwd();
  const essencePath = join(projectRoot, 'decantr.essence.json');

  console.log(heading('Auditing project...'));

  if (!existsSync(essencePath)) {
    console.log(`${RED}No decantr.essence.json found.${RESET}`);
    process.exitCode = 1;
    return;
  }

  try {
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;

    // Validate essence
    const validation = validateEssence(essence);
    if (!validation.valid) {
      console.log(`${RED}Essence validation failed:${RESET}`);
      for (const err of validation.errors) {
        console.log(`  ${RED}${err}${RESET}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log(success('Essence is valid.'));

    // Build registry context for guard validation
    const { themeRegistry, patternRegistry } = buildRegistryContext();
    const violations = evaluateGuard(essence, { themeRegistry, patternRegistry });
    if (violations.length > 0) {
      console.log('');
      console.log(`${YELLOW}Guard violations:${RESET}`);
      for (const v of violations) {
        const vr = v as Record<string, string>;
        console.log(`  ${YELLOW}[${vr.rule}]${RESET} ${vr.message}`);
        if (vr.suggestion) {
          console.log(`    ${DIM}Suggestion: ${vr.suggestion}${RESET}`);
        }
      }
    } else {
      console.log(success('No guard violations.'));
    }

    // Summary
    console.log('');
    console.log(`${BOLD}Summary:${RESET}`);
    console.log(`  Pages defined: ${(essence.structure as Array<unknown>).length}`);
    console.log(`  Guard mode: ${(essence.guard as Record<string, string>).mode}`);
    console.log(`  Theme: ${(essence.theme as Record<string, string>).style}`);

  } catch (e) {
    console.log(`${RED}Error: ${(e as Error).message}${RESET}`);
    process.exitCode = 1;
  }
}

// ── Theme subcommand ──

async function cmdTheme(args: string[]) {
  const subcommand = args[0];
  const projectRoot = process.cwd();

  if (!subcommand || subcommand === 'help') {
    console.log(`
${BOLD}decantr theme${RESET} — Manage custom themes

${BOLD}Commands:${RESET}
  ${cyan('create')} <name>        Create a new custom theme
  ${cyan('create')} <name> --guided   Interactive theme creation
  ${cyan('list')}                 List custom themes
  ${cyan('validate')} <name>      Validate a custom theme
  ${cyan('delete')} <name>        Delete a custom theme
  ${cyan('import')} <path>        Import theme from JSON file

${BOLD}Examples:${RESET}
  decantr theme create mytheme
  decantr theme list
  decantr theme validate mytheme
  decantr theme import ./external-theme.json
`);
    return;
  }

  switch (subcommand) {
    case 'create': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme create <name>'));
        process.exitCode = 1;
        return;
      }
      // Convert to display name (capitalize first letter)
      const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
      const result = createTheme(projectRoot, name, displayName);
      if (result.success) {
        console.log(success(`Created custom theme "${name}"`));
        console.log(dim(`  Path: ${result.path}`));
        console.log('');
        console.log(`Use in essence: ${cyan(`"style": "custom:${name}"`)}`);
      } else {
        console.error(error(result.error || 'Failed to create theme'));
        process.exitCode = 1;
      }
      break;
    }

    case 'list': {
      const themes = listCustomThemes(projectRoot);
      if (themes.length === 0) {
        console.log(dim('No custom themes found.'));
        console.log(dim('Run "decantr theme create <name>" to create one.'));
      } else {
        console.log(heading(`${themes.length} custom theme(s)`));
        for (const theme of themes) {
          console.log(`  ${cyan(`custom:${theme.id}`)}  ${dim(theme.description || theme.name)}`);
        }
      }
      break;
    }

    case 'validate': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme validate <name>'));
        process.exitCode = 1;
        return;
      }
      const themePath = join(projectRoot, '.decantr', 'custom', 'themes', `${name}.json`);
      if (!existsSync(themePath)) {
        console.error(error(`Theme "${name}" not found at ${themePath}`));
        process.exitCode = 1;
        return;
      }
      try {
        const theme = JSON.parse(readFileSync(themePath, 'utf-8'));
        const result = validateCustomTheme(theme);
        if (result.valid) {
          console.log(success(`Custom theme "${name}" is valid`));
        } else {
          console.error(error('Validation failed:'));
          for (const err of result.errors) {
            console.error(`  ${RED}${err}${RESET}`);
          }
          process.exitCode = 1;
        }
      } catch (e) {
        console.error(error(`Invalid JSON: ${(e as Error).message}`));
        process.exitCode = 1;
      }
      break;
    }

    case 'delete': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme delete <name>'));
        process.exitCode = 1;
        return;
      }
      const result = deleteTheme(projectRoot, name);
      if (result.success) {
        console.log(success(`Deleted custom theme "${name}"`));
      } else {
        console.error(error(result.error || 'Failed to delete theme'));
        process.exitCode = 1;
      }
      break;
    }

    case 'import': {
      const sourcePath = args[1];
      if (!sourcePath) {
        console.error(error('Usage: decantr theme import <path>'));
        process.exitCode = 1;
        return;
      }
      const result = importTheme(projectRoot, sourcePath);
      if (result.success) {
        console.log(success('Theme imported successfully'));
        console.log(dim(`  Path: ${result.path}`));
      } else {
        console.error(error('Import failed:'));
        for (const err of result.errors || []) {
          console.error(`  ${RED}${err}${RESET}`);
        }
        process.exitCode = 1;
      }
      break;
    }

    default:
      console.error(error(`Unknown theme command: ${subcommand}`));
      process.exitCode = 1;
  }
}

// ── Help ──

function cmdHelp() {
  console.log(`
${BOLD}decantr${RESET} — Design intelligence for AI-generated UI

${BOLD}Usage:${RESET}
  decantr init [options]
  decantr status
  decantr sync
  decantr audit
  decantr migrate
  decantr check
  decantr sync-drift
  decantr search <query> [--type <type>]
  decantr suggest <query> [--type <type>]
  decantr get <type> <id>
  decantr list <type>
  decantr validate [path]
  decantr theme <subcommand>
  decantr create <type> <name>
  decantr publish <type> <name>
  decantr login
  decantr logout
  decantr help

${BOLD}Init Options:${RESET}
  --blueprint, -b    Blueprint ID
  --theme            Theme ID
  --mode             Color mode: dark | light | auto
  --shape            Border shape: pill | rounded | sharp
  --target           Framework: react | vue | svelte | nextjs | html
  --guard            Guard mode: creative | guided | strict
  --density          Spacing: compact | comfortable | spacious
  --shell            Default shell layout
  --existing         Initialize in existing project
  --offline          Force offline mode
  --yes, -y          Accept defaults, skip confirmations
  --registry         Custom registry URL

${BOLD}Commands:${RESET}
  ${cyan('init')}        Initialize a new Decantr project (v3 essence by default)
  ${cyan('status')}      Show project status, DNA axioms, and blueprint info
  ${cyan('sync')}        Sync registry content from API
  ${cyan('audit')}       Validate essence and check for drift
  ${cyan('migrate')}     Migrate v2 essence to v3 format (with .v2.backup.json backup)
  ${cyan('check')}       Detect drift issues (validate + guard rules)
  ${cyan('sync-drift')}  Review and resolve drift log entries
  ${cyan('search')}      Search the registry
  ${cyan('suggest')}     Suggest patterns or alternatives for a query
  ${cyan('get')}         Get full details of a registry item
  ${cyan('list')}        List items by type
  ${cyan('validate')}    Validate essence file (v2 and v3)
  ${cyan('theme')}       Manage custom themes (create, list, validate, delete, import)
  ${cyan('create')}      Create a custom content item (pattern, recipe, theme, etc.)
  ${cyan('publish')}     Publish a custom content item to the community registry
  ${cyan('login')}       Authenticate with the Decantr registry
  ${cyan('logout')}      Remove stored credentials
  ${cyan('upgrade')}     Check for content updates from registry
  ${cyan('help')}        Show this help

${BOLD}Examples:${RESET}
  decantr init
  decantr init --blueprint=saas-dashboard --theme=luminarum --yes
  decantr status
  decantr migrate
  decantr check
  decantr sync-drift
  decantr search dashboard
  decantr suggest leaderboard
  decantr list patterns
  decantr create pattern my-card
`);
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    cmdHelp();
    return;
  }

  switch (command) {
    case 'init': {
      // Parse init flags
      const initArgs: InitArgs = {};
      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--yes' || arg === '-y') {
          initArgs.yes = true;
        } else if (arg === '--offline') {
          initArgs.offline = true;
        } else if (arg === '--existing') {
          initArgs.existing = true;
        } else if (arg.startsWith('--')) {
          const [key, value] = arg.slice(2).split('=');
          if (value) {
            (initArgs as Record<string, string>)[key] = value;
          } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
            (initArgs as Record<string, string>)[key] = args[++i];
          }
        } else if (arg.startsWith('-')) {
          const key = arg.slice(1);
          if (key === 'b' && args[i + 1]) initArgs.blueprint = args[++i];
          if (key === 'y') initArgs.yes = true;
        }
      }
      await cmdInit(initArgs);
      break;
    }

    case 'status': {
      await cmdStatus();
      break;
    }

    case 'sync': {
      await cmdSync();
      break;
    }

    case 'upgrade': {
      const { cmdUpgrade } = await import('./commands/upgrade.js');
      await cmdUpgrade(process.cwd());
      break;
    }

    case 'check':
    case 'heal': {
      // `heal` is deprecated, aliased to `check`
      if (command === 'heal') {
        console.log(`${YELLOW}Note: \`decantr heal\` is deprecated. Use \`decantr check\` instead.${RESET}`);
      }
      const { cmdHeal } = await import('./commands/heal.js');
      await cmdHeal(process.cwd());
      break;
    }

    case 'migrate': {
      await cmdMigrate(process.cwd());
      break;
    }

    case 'sync-drift': {
      // Handle flags
      const resolveAllFlag = args.includes('--resolve-all');
      const clearFlag = args.includes('--clear');
      const resolveIdx = args.indexOf('--resolve');
      const resolveNum = resolveIdx !== -1 ? parseInt(args[resolveIdx + 1], 10) : undefined;

      if (resolveAllFlag || clearFlag || resolveNum !== undefined) {
        const result = resolveDriftEntries(process.cwd(), {
          resolveAll: resolveAllFlag,
          clear: clearFlag,
          resolveIndex: resolveNum,
        });
        if (result.success) {
          console.log(success(clearFlag ? 'Drift log cleared.' : 'Entries resolved.'));
        } else {
          console.error(error(result.error || 'Failed'));
          process.exitCode = 1;
        }
      } else {
        await cmdSyncDrift(process.cwd());
      }
      break;
    }

    case 'audit': {
      await cmdAudit();
      break;
    }

    case 'search': {
      const query = args[1];
      if (!query) {
        console.error(error('Usage: decantr search <query> [--type <type>]'));
        process.exitCode = 1;
        return;
      }
      const typeIdx = args.indexOf('--type');
      const type = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
      await cmdSearch(query, type);
      break;
    }

    case 'suggest': {
      const query = args[1];
      if (!query) {
        console.error(error('Usage: decantr suggest <query> [--type <type>]'));
        process.exitCode = 1;
        return;
      }
      const typeIdx = args.indexOf('--type');
      const type = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
      await cmdSuggest(query, type);
      break;
    }

    case 'get': {
      const type = args[1];
      const id = args[2];
      if (!type || !id) {
        console.error(error('Usage: decantr get <type> <id>'));
        process.exitCode = 1;
        return;
      }
      await cmdGet(type, id);
      break;
    }

    case 'list': {
      const type = args[1];
      if (!type) {
        console.error(error('Usage: decantr list <type>'));
        process.exitCode = 1;
        return;
      }
      await cmdList(type);
      break;
    }

    case 'validate': {
      await cmdValidate(args[1]);
      break;
    }

    case 'theme': {
      await cmdTheme(args.slice(1));
      break;
    }

    case 'login': {
      const apiKeyArg = args[1];
      if (apiKeyArg && apiKeyArg.startsWith('--api-key=')) {
        const key = apiKeyArg.split('=')[1];
        saveCredentials({ access_token: key, api_key: key });
        console.log(success('API key saved.'));
      } else {
        console.log(heading('Decantr Login'));
        console.log('  To authenticate, get your API key from the Decantr dashboard:');
        console.log('');
        console.log(`    ${cyan('https://decantr.ai/dashboard/api-keys')}`);
        console.log('');
        console.log('  Then run:');
        console.log(`    ${cyan('decantr login --api-key=<your-key>')}`);
        console.log('');
        console.log('  Or set the environment variable:');
        console.log(`    ${cyan('export DECANTR_API_KEY=<your-key>')}`);

        const existingCreds = getCredentials();
        if (existingCreds) {
          console.log('');
          console.log(dim('You are currently authenticated.'));
        }
      }
      break;
    }

    case 'logout': {
      clearCredentials();
      console.log(success('Logged out. Credentials removed.'));
      break;
    }

    case 'create': {
      const type = args[1];
      const name = args[2];
      if (!type || !name) {
        console.error(error('Usage: decantr create <type> <name>'));
        console.error(dim('Types: pattern, recipe, theme, blueprint, archetype, shell'));
        process.exitCode = 1;
        break;
      }
      cmdCreate(type, name);
      break;
    }

    case 'publish': {
      const type = args[1];
      const name = args[2];
      if (!type || !name) {
        console.error(error('Usage: decantr publish <type> <name>'));
        console.error(dim('Types: pattern, recipe, theme, blueprint, archetype, shell'));
        process.exitCode = 1;
        break;
      }
      await cmdPublish(type, name);
      break;
    }

    default:
      console.error(error(`Unknown command: ${command}`));
      cmdHelp();
      process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(error((e as Error).message));
  process.exitCode = 1;
});
