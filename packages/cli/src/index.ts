import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
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

function cmdHelp() {
  console.log(`
${BOLD}decantr${RESET} — Design intelligence for AI-generated UI

${BOLD}Usage:${RESET}
  decantr search <query> [--type pattern|archetype|recipe|theme]
  decantr get <type> <id>
  decantr list <type>
  decantr validate [path]
  decantr help

${BOLD}Commands:${RESET}
  ${cyan('search')}    Search the registry for patterns, archetypes, recipes, themes
  ${cyan('get')}       Get full details of a registry item as JSON
  ${cyan('list')}      List all items of a type (patterns, archetypes, recipes, themes, blueprints)
  ${cyan('validate')}  Validate a decantr.essence.json file against the schema and guard rules
  ${cyan('help')}      Show this help message

${BOLD}Examples:${RESET}
  decantr search dashboard
  decantr search kpi --type pattern
  decantr get pattern kpi-grid
  decantr get recipe luminarum
  decantr get theme luminarum
  decantr list patterns
  decantr list themes
  decantr validate
  decantr validate ./my-project/decantr.essence.json
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
