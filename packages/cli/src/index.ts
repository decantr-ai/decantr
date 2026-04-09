import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEssence, evaluateGuard, isV3 } from '@decantr/essence-spec';
import type { EssenceFile, EssenceV3 } from '@decantr/essence-spec';
import {
  RegistryAPIClient,
  CONTENT_TYPES as GET_CONTENT_TYPES,
  API_CONTENT_TYPES as LIST_CONTENT_TYPES,
  CONTENT_TYPE_TO_API_CONTENT_TYPE,
  isContentType as isGetContentType,
  isApiContentType,
} from '@decantr/registry';
import type {
  ApiContentType,
  Blueprint as RegistryBlueprint,
  ComposeEntry,
  ShowcaseManifestResponse,
  ShowcaseShortlistReport,
  ShowcaseShortlistResponse,
} from '@decantr/registry';
import { detectProject, formatDetection } from './detect.js';
import { runInteractivePrompts, runSimplifiedInit, parseFlags, mergeWithDefaults, confirm } from './prompts.js';
import {
  scaffoldProject,
  scaffoldMinimal,
  refreshDerivedFiles,
  composeArchetypes,
  composeSections,
  generateSectionContext,
  generateScaffoldContext,
  deriveZones,
  deriveTransitions,
  generateTopologySection,
  mapRegistryArchetypeToArchetypeData,
  mapRegistryThemeToThemeData,
  mapRegistryPatternToPatternSpecSummary,
  collectPatternIdsFromItems,
  type ThemeData,
  type LayoutItem,
  type ZoneInput,
  type TopologyData,
  type ComposeSectionsResult,
  type PatternSpecSummary,
  type BlueprintOverrides,
  type RefreshResult,
} from './scaffold.js';
import { RegistryClient, syncRegistry } from './registry.js';
import {
  createTheme,
  listCustomThemes,
  deleteTheme,
  importTheme,
  validateCustomTheme
} from './theme-commands.js';
import { saveCredentials, clearCredentials, getCredentials } from './auth.js';
import {
  auditProject,
  critiqueFile as critiqueProjectFile,
  type FileCritiqueReport,
  type ProjectAuditReport,
  type VerificationFinding,
} from '@decantr/verifier';
import { cmdPublish } from './commands/publish.js';
import { cmdCreate } from './commands/create.js';
import { cmdMigrate } from './commands/migrate.js';
import { cmdSyncDrift, resolveDriftEntries } from './commands/sync-drift.js';
import { cmdRefresh } from './commands/refresh.js';
import { cmdAddSection, cmdAddPage, cmdAddFeature } from './commands/add.js';
import { cmdRemoveSection, cmdRemovePage, cmdRemoveFeature } from './commands/remove.js';
import { cmdThemeSwitch } from './commands/theme-switch.js';
import { cmdAnalyze } from './commands/analyze.js';
import { cmdMagic } from './commands/magic.js';
import { cmdExport } from './commands/export.js';
import type { ExportTarget } from './commands/export.js';
import { cmdRegistryMirror } from './commands/registry-mirror.js';
import { cmdNewProject } from './commands/new-project.js';

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

  lines.push('Build this application using the Decantr design system.');
  lines.push('');
  lines.push('Read DECANTR.md for the design spec, CSS approach, and guard rules.');
  lines.push('Read .decantr/context/scaffold-pack.md for the compact compiled shell and route contract.');
  lines.push('Read .decantr/context/page-*-pack.md for route-local compiled page contracts.');
  lines.push('Read .decantr/context/scaffold.md for the app overview, topology, routes, and voice guidance.');
  lines.push('Read each .decantr/context/section-*-pack.md file for the compact section contract.');
  lines.push('Read each .decantr/context/section-*.md file before building that section\'s pages.');
  lines.push('Import src/styles/global.css, src/styles/tokens.css, and src/styles/treatments.css.');
  lines.push('');
  lines.push('Start with the shell layouts, then build each section\'s pages.');

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

function getPublicAPIClient(): RegistryAPIClient {
  return new RegistryAPIClient({
    baseUrl: process.env.DECANTR_API_URL || undefined,
  });
}

async function getShowcaseBenchmarkView(
  view: 'manifest' | 'shortlist' | 'verification' = 'shortlist',
) {
  const client = getPublicAPIClient();

  if (view === 'manifest') {
    return client.getShowcaseManifest();
  }

  if (view === 'verification') {
    return client.getShowcaseShortlistVerification();
  }

  return client.getShowcaseShortlist();
}

async function printShowcaseBenchmarks(
  view: 'manifest' | 'shortlist' | 'verification',
  jsonOutput: boolean,
) {
  const data = await getShowcaseBenchmarkView(view);

  if (jsonOutput) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (view === 'manifest') {
    const manifest = data as ShowcaseManifestResponse;
    console.log(heading('Showcase Corpus'));
    console.log(`  Active apps: ${manifest.total}`);
    console.log(`  Shortlisted apps: ${manifest.shortlisted}`);
    console.log('');
    for (const entry of manifest.apps) {
      const verification = entry.verification;
      const verificationSummary = verification
        ? ` | ${verification.verificationStatus} | drift ${verification.drift.signal}`
        : '';
      console.log(`  ${cyan(entry.slug)}  class ${entry.classification}${verificationSummary}`);
    }
    return;
  }

  if (view === 'verification') {
    const report = data as ShowcaseShortlistReport;
    console.log(heading('Showcase Verification'));
    if (report.generatedAt) {
      console.log(`  Generated: ${report.generatedAt}`);
    }
    if (report.summary) {
      console.log(`  Passed builds: ${report.summary.passedBuilds}/${report.summary.appCount}`);
      console.log(`  Avg build: ${report.summary.averageDurationMs} ms`);
      console.log(`  Passed smokes: ${report.summary.passedSmokes}/${report.summary.appCount}`);
      console.log(`  Avg smoke: ${report.summary.averageSmokeDurationMs} ms`);
      console.log(`  Drift: lower ${report.summary.lowerDriftCount}, moderate ${report.summary.moderateDriftCount}, elevated ${report.summary.elevatedDriftCount}`);
      console.log(`  Pack manifests: ${report.summary.withPackManifestCount}/${report.summary.appCount}`);
      console.log('');
    }
    for (const entry of report.results) {
      console.log(`  ${cyan(entry.slug)}  ${entry.verificationStatus} | smoke ${entry.smoke.passed ? 'green' : entry.build.passed ? 'red' : 'pending'} | drift ${entry.drift.signal} | build ${entry.build.durationMs} ms | smoke ${entry.smoke.durationMs} ms`);
    }
    return;
  }

  const shortlist = data as ShowcaseShortlistResponse;

  console.log(heading('Showcase Shortlist'));
  if (shortlist.generatedAt) {
    console.log(`  Generated: ${shortlist.generatedAt}`);
  }
  if (shortlist.summary) {
    console.log(`  Passed builds: ${shortlist.summary.passedBuilds}/${shortlist.summary.appCount}`);
    console.log(`  Passed smokes: ${shortlist.summary.passedSmokes}/${shortlist.summary.appCount}`);
    console.log(`  Drift mix: lower ${shortlist.summary.lowerDriftCount}, moderate ${shortlist.summary.moderateDriftCount}, elevated ${shortlist.summary.elevatedDriftCount}`);
    console.log('');
  }
  for (const entry of shortlist.apps) {
    const verification = entry.verification;
    const verificationSummary = verification
      ? `${verification.verificationStatus} | smoke ${verification.smoke.passed ? 'green' : verification.build.passed ? 'red' : 'pending'} | drift ${verification.drift.signal}`
      : 'verification pending';
    console.log(`  ${cyan(entry.slug)}  class ${entry.classification} | ${verificationSummary}`);
  }
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
  if (!isGetContentType(type)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${GET_CONTENT_TYPES.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const apiType = CONTENT_TYPE_TO_API_CONTENT_TYPE[type];

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
  if (!isApiContentType(type)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${LIST_CONTENT_TYPES.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const registryClient = new RegistryClient({
    cacheDir: join(process.cwd(), '.decantr', 'cache'),
  });

  const result = await registryClient.fetchContentList(type);
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

  // Fetch registry content for scaffold (sequential to avoid overwhelming the API)
  const archetypesResult = await registryClient.fetchArchetypes();
  const blueprintsResult = await registryClient.fetchBlueprints();
  const themesResult = await registryClient.fetchThemes();

  if (archetypesResult.source.type === 'api') {
    registrySource = 'api';
  }

  const archetypes = archetypesResult.data.items;
  const blueprints = blueprintsResult.data.items;
  const themes = themesResult.data.items;

  let options;

  // Track which flags the user explicitly provided (before defaults are merged in)
  const userExplicit = {
    theme: Boolean(args.theme),
    mode: Boolean(args.mode),
    shape: Boolean(args.shape),
    personality: Boolean(args.personality),
  };

  if (args.yes || selectedBlueprint !== 'default') {
    // Non-interactive mode or simplified selection: use flags with defaults
    const flags = parseFlags(args as Record<string, unknown>, detected);
    flags.blueprint = selectedBlueprint !== 'default' ? selectedBlueprint : flags.blueprint;
    options = mergeWithDefaults(flags, detected);
  } else {
    // Full interactive mode (default blueprint selected)
    options = await runInteractivePrompts(detected, archetypes, blueprints, themes);
    // In interactive mode, all choices are explicit
    userExplicit.theme = true;
    userExplicit.mode = true;
    userExplicit.shape = true;
    userExplicit.personality = true;
  }

  // Topology markdown (populated when blueprint has composition)
  let topologyMarkdown = '';

  // Fetch blueprint/archetype data
  let archetypeData: {
    id: string;
    pages?: Array<{ id: string; shell: string; default_layout: LayoutItem[]; patterns?: Array<{ pattern: string; preset?: string; as?: string }> }>;
    features?: string[];
  } | undefined;

  // V3.1 composition data (populated when blueprint has compose entries)
  let composedSections: ComposeSectionsResult | undefined;
  let routeMap: Record<string, { section: string; page: string }> | undefined;
  let patternSpecs: Record<string, PatternSpecSummary> | undefined;
  let blueprintData: RegistryBlueprint | undefined;

  if (options.blueprint) {
    // Fetch the blueprint to get its primary archetype and theme
    const blueprintResult = await registryClient.fetchBlueprint(options.blueprint);
    if (blueprintResult) {
      const blueprint = blueprintResult.data as RegistryBlueprint;

      // Apply blueprint theme settings (unless user explicitly provided flags)
      if (blueprint.theme) {
        if (!userExplicit.theme && blueprint.theme.id) {
          options.theme = blueprint.theme.id;
        }
        if (!userExplicit.mode && blueprint.theme.mode) {
          options.mode = blueprint.theme.mode as 'dark' | 'light' | 'auto';
        }
        if (!userExplicit.shape && blueprint.theme.shape) {
          options.shape = blueprint.theme.shape as 'rounded' | 'sharp' | 'pill';
        }
      }

      // Apply blueprint personality (unless user explicitly provided --personality)
      // Personality can be a string (narrative) or string[] (traits) — normalize to string[]
      if (!userExplicit.personality && blueprint.personality) {
        options.personality = typeof blueprint.personality === 'string'
          ? [blueprint.personality]
          : blueprint.personality;
      }

      if (blueprint.compose && blueprint.compose.length > 0) {
        // Fetch all archetypes in parallel
        const entries = blueprint.compose;
        // Fetch archetypes sequentially to avoid overwhelming the API
        const results: Array<readonly [string, ReturnType<typeof mapRegistryArchetypeToArchetypeData> | null]> = [];
        for (const entry of entries) {
          const id = typeof entry === 'string' ? entry : entry.archetype;
          const r = await registryClient.fetchArchetype(id);
          results.push([id, r?.data ? mapRegistryArchetypeToArchetypeData(r.data) : null] as const);
        }
        const archetypeMap = new Map(results);

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

        // Compose sections (v3.1 style — keeps pages grouped by archetype)
        composedSections = composeSections(entries, archetypeMap, blueprint.overrides);

        // Store blueprint data for V3.1 essence enrichment
        blueprintData = blueprint;

        // Map blueprint routes to section pages
        routeMap = {};
        if (blueprint.routes) {
          for (const [path, entry] of Object.entries(blueprint.routes)) {
            const archId = entry.archetype;
            const pageId = entry.page;
            if (archId && pageId) {
              routeMap[path] = { section: archId, page: pageId };
              // Set route on the page in the composed section
              const section = composedSections.sections.find(s => s.id === archId);
              const page = section?.pages.find(p => p.id === pageId);
              if (page) page.route = path;
            }
          }
        }

        // Fetch pattern specs for inlining in section contexts
        const allPatternIds = new Set<string>();
        for (const section of composedSections.sections) {
          for (const page of section.pages) {
            if (page.patterns) {
              for (const ref of page.patterns) allPatternIds.add(ref.pattern);
            }
            for (const patternId of collectPatternIdsFromItems(page.layout)) allPatternIds.add(patternId);
          }
        }

        patternSpecs = {};
        if (allPatternIds.size > 0) {
          // Fetch patterns sequentially to avoid overwhelming the API
          for (const pid of allPatternIds) {
            try {
              const result = await registryClient.fetchPattern(pid);
              if (result) {
                patternSpecs[pid] = mapRegistryPatternToPatternSpecSummary(result.data, undefined, false);
              }
            } catch { /* pattern not found — skip */ }
          }
        }

        // Collect zone inputs for topology
        const zoneInputs: ZoneInput[] = [];
        for (const entry of entries) {
          const arcId = typeof entry === 'string' ? entry : entry.archetype;
          const explicitRole = typeof entry === 'string' ? undefined : entry.role;
          const archData = archetypeMap.get(arcId);
          if (archData) {
            zoneInputs.push({
              archetypeId: arcId,
              role: explicitRole || archData.role || 'auxiliary',
              shell: archData.pages?.[0]?.shell || options.shell || 'sidebar-main',
              features: archData.features || [],
              description: archData.description || '',
            });
          }
        }

        // Derive topology
        const zones = deriveZones(zoneInputs);
        const transitions = deriveTransitions(zones);
        const primaryZonePages = archetypeData?.pages?.filter(p =>
          !p.shell || p.shell === composed.defaultShell
        ) || [];
        topologyMarkdown = zones.length > 0
          ? generateTopologySection(
              {
                intent: archetypeMap.get(primaryId)?.description || options.blueprint || 'Application',
                zones,
                transitions,
                entryPoints: {
                  anonymous: '/',
                  authenticated: `/${primaryZonePages[0]?.id || archetypeData?.pages?.[0]?.id || 'home'}`,
                },
              },
              options.personality || [],
            )
          : '';
      }
    } else {
      console.log(`${YELLOW}  Warning: Could not fetch blueprint "${options.blueprint}". Using defaults.${RESET}`);
    }
  } else if (options.archetype) {
    // Direct archetype selection
    const archetypeResult = await registryClient.fetchArchetype(options.archetype);
    if (archetypeResult) {
      archetypeData = mapRegistryArchetypeToArchetypeData(archetypeResult.data);
    } else {
      console.log(`${YELLOW}  Warning: Could not fetch archetype "${options.archetype}". Using defaults.${RESET}`);
    }
  }

  // Fetch theme data — single fetch, theme now contains all visual treatment data
  let themeData: ThemeData | undefined;

  if (options.theme) {
    const themeResult = await registryClient.fetchTheme(options.theme);
    if (themeResult) {
      themeData = mapRegistryThemeToThemeData(themeResult.data);
    } else {
      console.log(`${YELLOW}  Warning: Could not fetch theme "${options.theme}". Using defaults.${RESET}`);
    }
  }

  // Scaffold the project
  console.log(heading('Scaffolding project...'));

  const result = await scaffoldProject(
    projectRoot,
    options,
    detected,
    registryClient,
    archetypeData,
    registrySource as 'api' | 'cache',
    themeData,
    topologyMarkdown,
    // V3.1 composition data:
    composedSections,
    routeMap,
    patternSpecs,
    blueprintData,
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
  console.log('    2. Read .decantr/context/scaffold-pack.md for the compiled shell and route plan');
  console.log('    3. Read .decantr/context/page-*-pack.md for route-local contracts');
  console.log('    4. Explore more at decantr.ai/registry');
  console.log('');
  console.log('  Commands:');
  console.log(`    ${cyan('decantr status')}     Project health`);
  console.log(`    ${cyan('decantr search')}     Search registry`);
  console.log(`    ${cyan('decantr get')}        Fetch content details`);
  console.log(`    ${cyan('decantr validate')}   Check essence file`);
  console.log(`    ${cyan('decantr upgrade')}    Update to latest patterns`);
  console.log(`    ${cyan('decantr check')}      Detect drift issues`);
  console.log(`    ${cyan('decantr migrate')}    Migrate v2 essence to v3`);

  // Validate (skip for V3.1 — the V1/V2 validator produces false oneOf warnings)
  const essenceContent = readFileSync(result.essencePath, 'utf-8');
  const essence = JSON.parse(essenceContent);
  if (essence.version !== '3.1.0') {
    const validation = validateEssence(essence);
    if (!validation.valid) {
      console.log(error(`\nValidation warnings: ${validation.errors.join(', ')}`));
    }
  }

  console.log('');

  // Generate curated prompt
  let promptPages: PromptContext['pages'];
  if (isV3(essence)) {
    const allPages = essence.blueprint.sections
      ? essence.blueprint.sections.flatMap((s: any) => s.pages.map((p: any) => ({ ...p, _shell: s.shell })))
      : essence.blueprint.pages || [];
    promptPages = allPages.map((p: { id: string; shell_override?: string | null; layout: unknown[]; _shell?: string }) => ({
      id: p.id,
      shell: p.shell_override ?? p._shell ?? essence.blueprint.shell,
      layout: (p.layout || []).map((item: unknown) => typeof item === 'string' ? item : extractPatternName(item)),
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
  console.log('');
  console.log(`${BOLD}Prompt for your AI assistant:${RESET}`);
  console.log(dim('─'.repeat(50)));
  console.log('');
  console.log(curatedPrompt);
  console.log('');
  console.log(dim('─'.repeat(50)));
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
      console.log(`    Theme: ${v3.dna.theme.id} (${v3.dna.theme.mode})`);
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
      console.log(`  Theme: ${theme?.id || 'unknown'} (${theme?.mode || 'unknown'})`);
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

function printVerificationFindings(findings: VerificationFinding[]) {
  if (findings.length === 0) {
    console.log(success('No findings.'));
    return;
  }

  for (const finding of findings) {
    const color = finding.severity === 'error'
      ? RED
      : finding.severity === 'warn'
        ? YELLOW
        : CYAN;
    console.log(`  ${color}[${finding.severity.toUpperCase()}]${RESET} ${finding.category}: ${finding.message}`);
    for (const evidence of finding.evidence) {
      console.log(`    ${DIM}${evidence}${RESET}`);
    }
    if (finding.suggestedFix) {
      console.log(`    ${DIM}Fix: ${finding.suggestedFix}${RESET}`);
    }
  }
}

function printProjectAuditReport(report: ProjectAuditReport) {
  if (report.valid) {
    console.log(success('Project contract is valid.'));
  } else {
    console.log(`${RED}Project audit found blocking issues.${RESET}`);
  }

  console.log('');
  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  Essence version: ${report.summary.essenceVersion ?? 'missing'}`);
  console.log(`  Pages defined: ${report.summary.pageCount}`);
  console.log(`  Pack manifest: ${report.summary.packManifestPresent ? 'present' : 'missing'}`);
  console.log(`  Review pack: ${report.summary.reviewPackPresent ? 'present' : 'missing'}`);
  console.log(`  Findings: ${report.summary.errorCount} error(s), ${report.summary.warnCount} warn(s), ${report.summary.infoCount} info`);

  console.log('');
  console.log(`${BOLD}Findings:${RESET}`);
  printVerificationFindings(report.findings);
}

function printFileCritiqueReport(report: FileCritiqueReport) {
  console.log(success(`Critiqued ${report.file}`));
  console.log('');
  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  Overall score: ${report.overall}/5`);
  console.log(`  Focus areas: ${report.focusAreas.join(', ')}`);
  console.log(`  Review pack: ${report.reviewPack ? 'present' : 'missing'}`);

  console.log('');
  console.log(`${BOLD}Scores:${RESET}`);
  for (const score of report.scores) {
    console.log(`  ${cyan(score.category.padEnd(20))} ${score.score}/5  ${dim(score.details)}`);
  }

  console.log('');
  console.log(`${BOLD}Findings:${RESET}`);
  printVerificationFindings(report.findings);
}

async function cmdAudit(filePath?: string) {
  const projectRoot = process.cwd();

  try {
    if (filePath) {
      console.log(heading(`Critiquing ${filePath}...`));
      const report = await critiqueProjectFile(filePath, projectRoot);
      printFileCritiqueReport(report);
      if (report.findings.some(finding => finding.severity === 'error')) {
        process.exitCode = 1;
      }
      return;
    }

    console.log(heading('Auditing project...'));
    const report = await auditProject(projectRoot);
    printProjectAuditReport(report);

    if (!report.valid) {
      process.exitCode = 1;
      return;
    }

    if (report.findings.length > 0) {
      console.log('');
      console.log(dim('Project audit completed with advisory findings.'));
    }
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
        console.log(`Use in essence: ${cyan(`"id": "custom:${name}"`)}`);
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

    case 'switch': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme switch <themeName> [--shape <s>] [--mode <m>]'));
        process.exitCode = 1;
        return;
      }
      await cmdThemeSwitch(name, args.slice(1), projectRoot);
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
  decantr new <name> [--blueprint=X] [--archetype=X] [--theme=X]
  decantr magic <prompt> [--dry-run]
  decantr init [options]
  decantr status
  decantr sync
  decantr audit [file]
  decantr migrate
  decantr check
  decantr sync-drift
  decantr search <query> [--type <type>]
  decantr suggest <query> [--type <type>]
  decantr get <type> <id>
  decantr list <type>
  decantr showcase [manifest|shortlist|verification] [--json]
  decantr validate [path]
  decantr theme <subcommand>
  decantr create <type> <name>
  decantr publish <type> <name>
  decantr analyze
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
  ${cyan('new')}         Create a new project with Vite + React + Decantr
  ${cyan('magic')}       One-liner scaffold from a natural language prompt
  ${cyan('init')}        Initialize Decantr in an existing project (v3 essence by default)
  ${cyan('status')}      Show project status, DNA axioms, and blueprint info
  ${cyan('sync')}        Sync registry content from API
  ${cyan('audit')}       Audit the project or critique a specific file against compiled packs
  ${cyan('migrate')}     Migrate v2 essence to v3 format (with .v2.backup.json backup)
  ${cyan('check')}       Detect drift issues (validate + guard rules) [--telemetry]
  ${cyan('sync-drift')}  Review and resolve drift log entries
  ${cyan('search')}      Search the registry
  ${cyan('suggest')}     Suggest patterns or alternatives for a query
  ${cyan('get')}         Get full details of a registry item
  ${cyan('list')}        List items by type
  ${cyan('showcase')}    Inspect audited showcase benchmark metadata
  ${cyan('validate')}    Validate essence file (v2 and v3)
  ${cyan('theme')}       Manage custom themes (create, list, validate, delete, import)
  ${cyan('create')}      Create a custom content item (pattern, theme, blueprint, etc.)
  ${cyan('publish')}     Publish a custom content item to the community registry
  ${cyan('login')}       Authenticate with the Decantr registry
  ${cyan('logout')}      Remove stored credentials
  ${cyan('analyze')}     Scan existing project and produce analysis report
  ${cyan('export')}      Export design tokens to framework format (shadcn, tailwind, css-vars)
  ${cyan('registry')}    Registry management (mirror)
  ${cyan('upgrade')}     Check for content updates from registry
  ${cyan('help')}        Show this help

${BOLD}Examples:${RESET}
  decantr new my-app --blueprint=carbon-ai-portal
  decantr magic "AI chatbot with dark cyber theme — bold and futuristic"
  decantr init
  decantr init --blueprint=saas-dashboard --theme=luminarum --yes
  decantr status
  decantr audit
  decantr audit src/pages/HomePage.tsx
  decantr migrate
  decantr check
  decantr sync-drift
  decantr search dashboard
  decantr suggest leaderboard
  decantr list patterns
  decantr showcase shortlist
  decantr showcase verification --json
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
    case 'new': {
      const newName = args[1];
      if (!newName) {
        console.error(error('Usage: decantr new <project-name> [--blueprint=X] [--archetype=X] [--theme=X]'));
        process.exitCode = 1;
        break;
      }
      const newOpts: Record<string, string | boolean> = {};
      for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--offline') {
          newOpts.offline = true;
        } else if (arg.startsWith('--')) {
          const [key, value] = arg.slice(2).split('=');
          if (value) {
            newOpts[key] = value;
          } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
            newOpts[key] = args[++i];
          }
        }
      }
      await cmdNewProject(newName, {
        blueprint: newOpts.blueprint as string | undefined,
        archetype: newOpts.archetype as string | undefined,
        theme: newOpts.theme as string | undefined,
        mode: newOpts.mode as string | undefined,
        shape: newOpts.shape as string | undefined,
        offline: newOpts.offline === true,
        registry: newOpts.registry as string | undefined,
      });
      break;
    }

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
      const applyFlag = args.includes('--apply');
      await cmdUpgrade(process.cwd(), { apply: applyFlag });
      break;
    }

    case 'check':
    case 'heal': {
      // `heal` is deprecated, aliased to `check`
      if (command === 'heal') {
        console.log(`${YELLOW}Note: \`decantr heal\` is deprecated. Use \`decantr check\` instead.${RESET}`);
      }
      const { cmdHeal } = await import('./commands/heal.js');
      const telemetryFlag = args.includes('--telemetry');
      await cmdHeal(process.cwd(), { telemetry: telemetryFlag });
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
      await cmdAudit(args[1]);
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

    case 'showcase': {
      const requestedView = args[1];
      const view = (requestedView === 'manifest' || requestedView === 'shortlist' || requestedView === 'verification')
        ? requestedView
        : 'shortlist';
      const jsonOutput = args.includes('--json');

      if (requestedView && requestedView.startsWith('--')) {
        await printShowcaseBenchmarks('shortlist', jsonOutput);
        break;
      }

      if (requestedView && !['manifest', 'shortlist', 'verification'].includes(requestedView)) {
        console.error(error('Usage: decantr showcase [manifest|shortlist|verification] [--json]'));
        process.exitCode = 1;
        break;
      }

      await printShowcaseBenchmarks(view, jsonOutput);
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
        console.error(dim('Types: pattern, theme, blueprint, archetype, shell'));
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
        console.error(dim('Types: pattern, theme, blueprint, archetype, shell'));
        process.exitCode = 1;
        break;
      }
      await cmdPublish(type, name);
      break;
    }

    case 'refresh': {
      const refreshOffline = args.includes('--offline');
      await cmdRefresh(process.cwd(), { offline: refreshOffline });
      break;
    }

    case 'registry': {
      const subcommand = args[1];
      if (subcommand === 'mirror') {
        const typeIdx = args.indexOf('--type');
        const mirrorType = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
        await cmdRegistryMirror(process.cwd(), { type: mirrorType });
      } else {
        console.error(`${RED}Usage: decantr registry mirror [--type <type>]${RESET}`);
        process.exitCode = 1;
      }
      break;
    }

    case 'add': {
      const subcommand = args[1];
      if (!subcommand) {
        console.error(error('Usage: decantr add <section|page|feature> <target>'));
        process.exitCode = 1;
        break;
      }
      switch (subcommand) {
        case 'section': {
          const id = args[2];
          if (!id) {
            console.error(error('Usage: decantr add section <archetypeId>'));
            process.exitCode = 1;
            break;
          }
          await cmdAddSection(id, args, process.cwd());
          break;
        }
        case 'page': {
          const pagePath = args[2];
          if (!pagePath) {
            console.error(error('Usage: decantr add page <section>/<page>'));
            process.exitCode = 1;
            break;
          }
          await cmdAddPage(pagePath, args, process.cwd());
          break;
        }
        case 'feature': {
          const feature = args[2];
          if (!feature) {
            console.error(error('Usage: decantr add feature <feature> [--section <id>]'));
            process.exitCode = 1;
            break;
          }
          await cmdAddFeature(feature, args, process.cwd());
          break;
        }
        default:
          console.error(error(`Unknown add subcommand: ${subcommand}. Use section, page, or feature.`));
          process.exitCode = 1;
      }
      break;
    }

    case 'remove': {
      const subcommand = args[1];
      if (!subcommand) {
        console.error(error('Usage: decantr remove <section|page|feature> <target>'));
        process.exitCode = 1;
        break;
      }
      switch (subcommand) {
        case 'section': {
          const id = args[2];
          if (!id) {
            console.error(error('Usage: decantr remove section <sectionId>'));
            process.exitCode = 1;
            break;
          }
          await cmdRemoveSection(id, args, process.cwd());
          break;
        }
        case 'page': {
          const pagePath = args[2];
          if (!pagePath) {
            console.error(error('Usage: decantr remove page <section>/<page>'));
            process.exitCode = 1;
            break;
          }
          await cmdRemovePage(pagePath, args, process.cwd());
          break;
        }
        case 'feature': {
          const feature = args[2];
          if (!feature) {
            console.error(error('Usage: decantr remove feature <feature> [--section <id>]'));
            process.exitCode = 1;
            break;
          }
          await cmdRemoveFeature(feature, args, process.cwd());
          break;
        }
        default:
          console.error(error(`Unknown remove subcommand: ${subcommand}. Use section, page, or feature.`));
          process.exitCode = 1;
      }
      break;
    }

    case 'analyze': {
      cmdAnalyze(process.cwd());
      break;
    }

    case 'magic': {
      // Collect all non-flag args after 'magic' as the prompt
      const magicFlags: {
        dryRun?: boolean;
        offline?: boolean;
        registry?: string;
      } = {};
      const promptParts: string[] = [];
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--dry-run') {
          magicFlags.dryRun = true;
        } else if (args[i] === '--offline') {
          magicFlags.offline = true;
        } else if (args[i].startsWith('--registry=')) {
          magicFlags.registry = args[i].split('=')[1];
        } else if (args[i].startsWith('--registry') && args[i + 1]) {
          magicFlags.registry = args[++i];
        } else {
          promptParts.push(args[i]);
        }
      }
      const magicPrompt = promptParts.join(' ').trim();
      if (!magicPrompt) {
        console.error(error('Usage: decantr magic <prompt> [--dry-run] [--offline]'));
        console.error('');
        console.error('  Example:');
        console.error(`    ${CYAN}decantr magic "AI agent dashboard — dark, neon, confident"${RESET}`);
        process.exitCode = 1;
        break;
      }
      await cmdMagic(magicPrompt, process.cwd(), {
        dryRun: magicFlags.dryRun,
        offline: magicFlags.offline,
        registry: magicFlags.registry,
      });
      break;
    }

    case 'export': {
      let exportTarget: string | undefined;
      let exportOutput: string | undefined;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--to' && args[i + 1]) {
          exportTarget = args[++i];
        } else if (args[i].startsWith('--to=')) {
          exportTarget = args[i].split('=')[1];
        } else if (args[i] === '--output' && args[i + 1]) {
          exportOutput = args[++i];
        } else if (args[i].startsWith('--output=')) {
          exportOutput = args[i].split('=')[1];
        }
      }
      const validTargets = ['shadcn', 'tailwind', 'css-vars'];
      if (!exportTarget || !validTargets.includes(exportTarget)) {
        console.error(error(`Usage: decantr export --to <${validTargets.join('|')}>`));
        process.exitCode = 1;
        break;
      }
      await cmdExport(exportTarget as ExportTarget, process.cwd(), { output: exportOutput });
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
  if ((e as Error).stack) console.error((e as Error).stack);
  process.exitCode = 1;
});
