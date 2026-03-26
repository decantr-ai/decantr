import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { createResolver, createRegistryClient } from '@decantr/registry';

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

function getContentRoot(): string {
  // Bundled content relative to this package (monorepo dev)
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

  // Try local content first, fall back to API
  const resolver = getResolver();
  let result = await resolver.resolve(type as any, id);

  if (!result) {
    // Fall back to live registry API
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
    } catch { /* API unavailable, fall through */ }

    console.error(error(`${type} "${id}" not found.`));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(result.item, null, 2));
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

  // Run guard rules
  try {
    const violations = evaluateGuard(essence, {});
    if (violations.length > 0) {
      console.log(heading('Guard violations:'));
      for (const v of violations) {
        const vr = v as Record<string, string>;
        console.log(`  ${YELLOW}[${vr.rule}]${RESET} ${vr.message}`);
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

  // Try local content first
  const { readdirSync } = await import('node:fs');
  const dir = join(getContentRoot(), type);
  let found = false;

  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.json'));
    if (files.length > 0) {
      found = true;
      console.log(heading(`${files.length} ${type}`));
      for (const f of files) {
        const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
        console.log(`  ${cyan(data.id || f.replace('.json', ''))}  ${dim(data.description || data.name || '')}`);
      }
    }
  } catch { /* local not available */ }

  if (!found) {
    // Fall back to live registry API
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
}

// ── Interactive prompts ──

function ask(question: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const prompt = defaultValue ? `${question} ${dim(`(${defaultValue})`)}: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || '');
    });
  });
}

async function select(question: string, options: string[], defaultIdx = 0): Promise<string> {
  console.log(`\n${BOLD}${question}${RESET}`);
  for (let i = 0; i < options.length; i++) {
    const marker = i === defaultIdx ? `${GREEN}>${RESET}` : ' ';
    console.log(`  ${marker} ${i + 1}. ${options[i]}`);
  }
  const answer = await ask(`Choose (1-${options.length})`, String(defaultIdx + 1));
  const idx = parseInt(answer, 10) - 1;
  return options[Math.max(0, Math.min(idx, options.length - 1))];
}

// ── Init command ──

async function cmdInit() {
  console.log(heading('Create a new Decantr project'));

  // Check if essence already exists
  const essencePath = join(process.cwd(), 'decantr.essence.json');
  if (existsSync(essencePath)) {
    const overwrite = await ask('decantr.essence.json already exists. Overwrite?', 'n');
    if (overwrite.toLowerCase() !== 'y') {
      console.log(dim('Cancelled.'));
      return;
    }
  }

  // Fetch available archetypes from API
  let archetypes: Array<{ id: string; name?: string; description?: string }> = [];
  try {
    const res = await fetch('https://decantr-registry.fly.dev/v1/archetypes');
    if (res.ok) {
      const data = await res.json() as { items: typeof archetypes };
      archetypes = data.items;
    }
  } catch { /* offline fallback below */ }

  if (archetypes.length === 0) {
    archetypes = [
      { id: 'saas-dashboard', description: 'Analytics dashboard with KPIs and data tables' },
      { id: 'ecommerce', description: 'Online store with product catalog' },
      { id: 'portfolio', description: 'Personal or agency portfolio site' },
      { id: 'marketing-landing', description: 'Product marketing landing page' },
      { id: 'gaming-platform', description: 'Gaming community hub' },
      { id: 'content-site', description: 'Blog or content site' },
    ];
  }

  // Select archetype
  const archetypeOptions = archetypes.map(a => `${a.id} ${dim(`— ${a.description || ''}`)}`);
  const selectedArchetype = await select('What are you building?', archetypeOptions);
  const archetypeId = selectedArchetype.split(' ')[0];

  // Fetch available themes from API
  let themes: Array<{ id: string; description?: string }> = [];
  try {
    const res = await fetch('https://decantr-registry.fly.dev/v1/themes');
    if (res.ok) {
      const data = await res.json() as { items: typeof themes };
      themes = data.items;
    }
  } catch { /* offline fallback */ }

  if (themes.length === 0) {
    themes = [
      { id: 'luminarum', description: 'Dark geometric canvas with vibrant accents' },
      { id: 'clean', description: 'Professional, minimal, universal' },
      { id: 'glassmorphism', description: 'Frosted glass aesthetic' },
    ];
  }

  const themeOptions = themes.map(t => `${t.id} ${dim(`— ${t.description || ''}`)}`);
  const selectedTheme = await select('Choose a theme', themeOptions);
  const themeId = selectedTheme.split(' ')[0];

  // Mode
  const mode = await select('Mode', ['dark', 'light'], 0);

  // Shape
  const shape = await select('Shape', ['pill', 'rounded', 'sharp'], 0);

  // Target framework
  const target = await select('Target framework', ['react', 'vue', 'svelte', 'html'], 0);

  // Fetch archetype to get page structure
  let pages: Array<{ id: string; shell: string; default_layout: string[] }> = [];
  try {
    const res = await fetch(`https://decantr-registry.fly.dev/v1/archetypes/${archetypeId}`);
    if (res.ok) {
      const data = await res.json() as { pages?: typeof pages };
      if (data.pages) pages = data.pages;
    }
  } catch { /* use empty */ }

  const structure = pages.length > 0
    ? pages.map(p => ({
        id: p.id,
        shell: p.shell || 'sidebar-main',
        layout: p.default_layout || [],
      }))
    : [{ id: 'home', shell: 'full-bleed', layout: ['hero-split'] }];

  // Fetch archetype features
  let features: string[] = [];
  try {
    const res = await fetch(`https://decantr-registry.fly.dev/v1/archetypes/${archetypeId}`);
    if (res.ok) {
      const data = await res.json() as { features?: string[] };
      if (data.features) features = data.features;
    }
  } catch { /* empty */ }

  // Build essence
  const essence = {
    version: '2.0.0',
    archetype: archetypeId,
    theme: {
      style: themeId,
      mode,
      recipe: themeId,
      shape,
    },
    personality: ['professional'],
    platform: { type: 'spa', routing: 'hash' },
    structure,
    features,
    guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' },
    density: { level: 'comfortable', content_gap: '_gap4' },
    target,
  };

  // Write file
  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n');
  console.log(success(`\nCreated decantr.essence.json`));
  console.log(dim(`  Archetype: ${archetypeId}`));
  console.log(dim(`  Theme: ${themeId} (${mode})`));
  console.log(dim(`  Pages: ${structure.map(s => s.id).join(', ')}`));
  console.log(dim(`  Target: ${target}`));

  // Validate
  const validation = validateEssence(essence);
  if (validation.valid) {
    console.log(success('  Validation: passed'));
  } else {
    console.log(error(`  Validation: ${validation.errors.join(', ')}`));
  }

  console.log(heading('Next steps'));
  console.log(`  1. Open your AI assistant (Claude, Cursor, etc.)`);
  console.log(`  2. Tell it to read ${cyan('decantr.essence.json')} before generating code`);
  console.log(`  3. The essence file defines your theme, pages, and patterns`);
  console.log(`  4. Run ${cyan('decantr validate')} after changes to check for drift\n`);
}

function cmdHelp() {
  console.log(`
${BOLD}decantr${RESET} — Design intelligence for AI-generated UI

${BOLD}Usage:${RESET}
  decantr init
  decantr search <query> [--type pattern|archetype|recipe|theme]
  decantr get <type> <id>
  decantr list <type>
  decantr validate [path]
  decantr help

${BOLD}Commands:${RESET}
  ${cyan('init')}      Create a new decantr.essence.json — pick an archetype, theme, and target
  ${cyan('search')}    Search the registry for patterns, archetypes, recipes, themes
  ${cyan('get')}       Get full details of a registry item as JSON
  ${cyan('list')}      List all items of a type (patterns, archetypes, recipes, themes, blueprints)
  ${cyan('validate')}  Validate a decantr.essence.json file against the schema and guard rules
  ${cyan('help')}      Show this help message

${BOLD}Examples:${RESET}
  decantr init
  decantr search dashboard
  decantr search kpi --type pattern
  decantr get pattern kpi-grid
  decantr get recipe luminarum
  decantr list patterns
  decantr validate
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
      await cmdInit();
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
