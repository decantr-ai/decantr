import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { createResolver, createRegistryClient } from '@decantr/registry';
import { detectProject, formatDetection } from './detect.js';
import { runInteractivePrompts, parseFlags, mergeWithDefaults, confirm } from './prompts.js';
import { scaffoldProject } from './scaffold.js';
import { RegistryClient, syncRegistry } from './registry.js';

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

function getContentRoot(): string {
  const bundled = join(import.meta.dirname, '..', '..', '..', 'content');
  return process.env.DECANTR_CONTENT_ROOT || bundled;
}

function getResolver() {
  return createResolver({ contentRoot: getContentRoot() });
}

// ── Commands ──

async function cmdSearch(query: string, type?: string) {
  const client = createRegistryClient();
  const results = await client.search(query, type);

  if (results.length === 0) {
    console.log(dim(`No results for "${query}"`));
    return;
  }

  console.log(heading(`${results.length} result(s) for "${query}"`));
  for (const r of results) {
    console.log(`  ${cyan(r.type.padEnd(12))} ${BOLD}${r.id}${RESET}`);
    console.log(`  ${dim(r.description || '')}`);
    console.log('');
  }
}

async function cmdGet(type: string, id: string) {
  const validTypes = ['pattern', 'archetype', 'recipe', 'theme', 'blueprint'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const resolver = getResolver();
  let result = await resolver.resolve(type as any, id);

  if (!result) {
    const apiType = type === 'blueprint' ? 'blueprints' : `${type}s`;
    try {
      const res = await fetch(`https://decantr-registry.fly.dev/v1/${apiType}/${id}`);
      if (res.ok) {
        const item = await res.json();
        if (!item.error) {
          console.log(JSON.stringify(item, null, 2));
          return;
        }
      }
    } catch { /* API unavailable */ }

    console.error(error(`${type} "${id}" not found.`));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(result.item, null, 2));
}

function buildRegistryContext(): { themeRegistry: Map<string, { modes: string[] }>; patternRegistry: Map<string, unknown> } {
  const { readdirSync } = require('node:fs');
  const themeRegistry = new Map<string, { modes: string[] }>();
  const patternRegistry = new Map<string, unknown>();
  const contentRoot = getContentRoot();

  // Load themes from main and core directories
  const themeDirs = [join(contentRoot, 'themes'), join(contentRoot, 'core', 'themes')];
  for (const dir of themeDirs) {
    try {
      if (existsSync(dir)) {
        for (const f of readdirSync(dir).filter((f: string) => f.endsWith('.json'))) {
          const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
          if (data.id && !themeRegistry.has(data.id)) {
            themeRegistry.set(data.id, { modes: data.modes || ['light', 'dark'] });
          }
        }
      }
    } catch { /* skip if unavailable */ }
  }

  // Load patterns from main and core directories
  const patternDirs = [join(contentRoot, 'patterns'), join(contentRoot, 'core', 'patterns')];
  for (const dir of patternDirs) {
    try {
      if (existsSync(dir)) {
        for (const f of readdirSync(dir).filter((f: string) => f.endsWith('.json'))) {
          const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
          if (data.id && !patternRegistry.has(data.id)) {
            patternRegistry.set(data.id, data);
          }
        }
      }
    } catch { /* skip if unavailable */ }
  }

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

  const result = validateEssence(essence);

  if (result.valid) {
    console.log(success('Essence is valid.'));
  } else {
    console.error(error('Validation failed:'));
    for (const err of result.errors) {
      console.error(`  ${RED}${err}${RESET}`);
    }
    process.exitCode = 1;
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
  const validTypes = ['patterns', 'archetypes', 'recipes', 'themes', 'blueprints'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const { readdirSync, existsSync } = await import('node:fs');
  const contentRoot = getContentRoot();
  const mainDir = join(contentRoot, type);
  const coreDir = join(contentRoot, 'core', type);
  const items: Array<{ id: string; description?: string; name?: string }> = [];

  // Load from main directory
  try {
    if (existsSync(mainDir)) {
      const files = readdirSync(mainDir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        const data = JSON.parse(readFileSync(join(mainDir, f), 'utf-8'));
        items.push({ id: data.id || f.replace('.json', ''), description: data.description, name: data.name });
      }
    }
  } catch { /* local not available */ }

  // Load from core directory (don't duplicate if id already exists)
  try {
    if (existsSync(coreDir)) {
      const files = readdirSync(coreDir).filter(f => f.endsWith('.json'));
      const existingIds = new Set(items.map(i => i.id));
      for (const f of files) {
        const data = JSON.parse(readFileSync(join(coreDir, f), 'utf-8'));
        const itemId = data.id || f.replace('.json', '');
        if (!existingIds.has(itemId)) {
          items.push({ id: itemId, description: data.description, name: data.name });
        }
      }
    }
  } catch { /* core not available */ }

  if (items.length > 0) {
    console.log(heading(`${items.length} ${type}`));
    for (const item of items) {
      console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
    }
    return;
  }

  // Fallback to API if no local content found
  try {
    const res = await fetch(`https://decantr-registry.fly.dev/v1/${type}`);
    if (res.ok) {
      const data = await res.json() as { total: number; items: Array<{ id: string; name?: string; description?: string }> };
      console.log(heading(`${data.total} ${type}`));
      for (const item of data.items) {
        console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
      }
      return;
    }
  } catch { /* API unavailable */ }
  console.log(dim(`No ${type} found.`));
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

  // Fetch registry content
  console.log(dim('Fetching registry content...'));

  const [archetypesResult, blueprintsResult, themesResult] = await Promise.all([
    registryClient.fetchArchetypes(),
    registryClient.fetchBlueprints(),
    registryClient.fetchThemes(),
  ]);

  const registrySource = archetypesResult.source.type;
  if (registrySource === 'bundled') {
    console.log(dim('Using bundled content (API unavailable)'));
  }

  const archetypes = archetypesResult.data.items;
  const blueprints = blueprintsResult.data.items;
  const themes = themesResult.data.items;

  let options;

  if (args.yes) {
    // Non-interactive mode: use flags with defaults
    const flags = parseFlags(args as Record<string, unknown>, detected);
    options = mergeWithDefaults(flags, detected);
  } else {
    // Interactive mode
    options = await runInteractivePrompts(detected, archetypes, blueprints, themes);
  }

  // Fetch blueprint/archetype data
  let archetypeData: {
    id: string;
    pages?: Array<{ id: string; shell: string; default_layout: string[] }>;
    features?: string[];
  } | undefined;

  if (options.blueprint) {
    // Fetch the blueprint to get its primary archetype
    const blueprintResult = await registryClient.fetchBlueprint(options.blueprint);
    if (blueprintResult) {
      const blueprint = blueprintResult.data as {
        id: string;
        compose?: string[];
        features?: string[];
      };
      // Get the primary archetype from compose array
      const primaryArchetype = blueprint.compose?.[0];
      if (primaryArchetype) {
        // Fetch the archetype to get its pages
        const archetypeResult = await registryClient.fetchArchetype(primaryArchetype);
        if (archetypeResult) {
          archetypeData = archetypeResult.data as typeof archetypeData;
          // Override archetype in options with the resolved one
          options.archetype = primaryArchetype;
        }
      }
    }
  } else if (options.archetype) {
    // Direct archetype selection
    const archetypeResult = await registryClient.fetchArchetype(options.archetype);
    if (archetypeResult) {
      archetypeData = archetypeResult.data as typeof archetypeData;
    }
  }

  // Scaffold the project
  console.log(heading('Scaffolding project...'));

  const result = scaffoldProject(
    projectRoot,
    options,
    detected,
    archetypeData,
    registrySource as 'api' | 'bundled'
  );

  // Output summary
  console.log(success('\nProject scaffolded successfully!'));
  console.log('');
  console.log(`  ${cyan('decantr.essence.json')}  Design specification`);
  console.log(`  ${cyan('DECANTR.md')}            LLM instructions`);
  console.log(`  ${cyan('.decantr/project.json')} Project state`);
  console.log(`  ${cyan('.decantr/context/')}     Task-specific guides`);

  if (result.gitignoreUpdated) {
    console.log(`  ${dim('.gitignore updated to exclude .decantr/cache/')}`);
  }

  // Validate
  const essenceContent = readFileSync(result.essencePath, 'utf-8');
  const essence = JSON.parse(essenceContent);
  const validation = validateEssence(essence);

  if (validation.valid) {
    console.log(success('\nValidation passed.'));
  } else {
    console.log(error(`\nValidation warnings: ${validation.errors.join(', ')}`));
  }

  // Next steps
  console.log(heading('Next steps'));
  console.log('1. Review DECANTR.md to understand the methodology');
  console.log('2. Copy the prompt below and share it with your AI assistant');
  console.log('3. Start building! The AI will follow the essence spec.');
  console.log('');

  // Generate curated prompt
  const promptCtx: PromptContext = {
    archetype: options.archetype || 'custom',
    blueprint: options.blueprint,
    theme: options.theme,
    mode: options.mode,
    target: options.target,
    pages: essence.structure || [{ id: 'home', shell: options.shell, layout: ['hero'] }],
    personality: options.personality,
    features: options.features,
    guard: options.guard,
  };

  const curatedPrompt = generateCuratedPrompt(promptCtx);
  console.log(boxedPrompt(curatedPrompt, 'Copy this prompt for your AI assistant'));
  console.log('');

  if (registrySource === 'bundled') {
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
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8'));
    const validation = validateEssence(essence);

    console.log(`${BOLD}Essence:${RESET}`);
    if (validation.valid) {
      console.log(`  ${GREEN}Valid${RESET}`);
    } else {
      console.log(`  ${RED}Invalid: ${validation.errors.join(', ')}${RESET}`);
    }

    console.log(`  Theme: ${essence.theme?.style || 'unknown'} (${essence.theme?.mode || 'unknown'})`);
    console.log(`  Guard: ${essence.guard?.mode || 'unknown'}`);
    console.log(`  Pages: ${(essence.structure || []).length}`);
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

  if (result.source === 'api') {
    console.log(success('Sync completed successfully.'));
    if (result.synced.length > 0) {
      console.log(`  Synced: ${result.synced.join(', ')}`);
    }
    if (result.failed.length > 0) {
      console.log(`  ${YELLOW}Failed: ${result.failed.join(', ')}${RESET}`);
    }
  } else {
    console.log(`${YELLOW}Could not sync: API unavailable${RESET}`);
    console.log(dim('Using bundled content.'));
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

// ── Help ──

function cmdHelp() {
  console.log(`
${BOLD}decantr${RESET} — Design intelligence for AI-generated UI

${BOLD}Usage:${RESET}
  decantr init [options]
  decantr status
  decantr sync
  decantr audit
  decantr search <query> [--type <type>]
  decantr get <type> <id>
  decantr list <type>
  decantr validate [path]
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
  ${cyan('init')}      Initialize a new Decantr project with full scaffolding
  ${cyan('status')}    Show project status and sync state
  ${cyan('sync')}      Sync registry content from API
  ${cyan('audit')}     Validate essence and check for drift
  ${cyan('search')}    Search the registry
  ${cyan('get')}       Get full details of a registry item
  ${cyan('list')}      List items by type
  ${cyan('validate')}  Validate essence file
  ${cyan('help')}      Show this help

${BOLD}Examples:${RESET}
  decantr init
  decantr init --blueprint=saas-dashboard --theme=luminarum --yes
  decantr status
  decantr sync
  decantr audit
  decantr search dashboard
  decantr list patterns
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
