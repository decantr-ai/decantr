import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createRegistryClient, createResolver } from '@decantr/registry';
import { success, error, heading, info, warn, bold, dim, cyan } from '../output.js';

function parseSubcommand(): { sub: string; args: string[] } {
  // positionals: ["registry", subcommand, ...rest]
  const all = process.argv.slice(2);
  const sub = all[1] ?? 'help';
  const rest = all.slice(2);
  return { sub, args: rest };
}

async function readManifest(cwd: string): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await readFile(join(cwd, 'decantr.registry.json'), 'utf-8'));
  } catch {
    return { installed: {} };
  }
}

async function writeManifest(cwd: string, manifest: Record<string, unknown>): Promise<void> {
  await writeFile(join(cwd, 'decantr.registry.json'), JSON.stringify(manifest, null, 2) + '\n');
}

export async function run(): Promise<void> {
  const { sub, args } = parseSubcommand();

  switch (sub) {
    case 'search':
      return handleSearch(args);
    case 'add':
      return handleAdd(args);
    case 'list':
      return handleList();
    default:
      console.log(`
  ${bold('decantr registry')} — community content management

  ${bold('Subcommands:')}
    search <query>        Search for patterns, archetypes, recipes, styles
    add <type>/<name>     Install content from the registry
    list                  List installed registry content

  ${bold('Examples:')}
    decantr registry search kanban
    decantr registry add pattern/kanban-board
    decantr registry add recipe/neon
    decantr registry list
`);
  }
}

async function handleSearch(args: string[]): Promise<void> {
  const query = args.filter((a) => !a.startsWith('--')).join(' ');
  if (!query) {
    console.error(error('Usage: decantr registry search <query>'));
    process.exitCode = 1;
    return;
  }

  // Parse optional --type flag
  const typeFlag = args.find((a) => a.startsWith('--type='))?.split('=')[1];

  console.log(heading(`Searching registry for "${query}"...`));
  try {
    const client = createRegistryClient();
    const results = await client.search(query, typeFlag);

    if (results.length === 0) {
      console.log(info('No results found.'));
      return;
    }

    for (const result of results) {
      console.log(`  ${bold(result.id)} ${dim(`(${result.type})`)}`);
      if (result.description) console.log(`    ${result.description}`);
      console.log(`    ${cyan(`decantr registry add ${result.type}/${result.id}`)}`);
      console.log('');
    }
    console.log(info(`${results.length} result(s)`));
  } catch (e) {
    console.error(error(`Search failed: ${(e as Error).message}`));
    process.exitCode = 1;
  }
}

async function handleAdd(args: string[]): Promise<void> {
  const spec = args[0];
  if (!spec || !spec.includes('/')) {
    console.error(error('Usage: decantr registry add <type>/<name>'));
    console.error(info('Example: decantr registry add pattern/kanban-board'));
    process.exitCode = 1;
    return;
  }

  const [type, nameWithVersion] = spec.split('/');
  const [name, version] = nameWithVersion.split('@');
  const cwd = process.cwd();

  console.log(heading(`Installing ${type}/${name}...`));

  try {
    const client = createRegistryClient();
    const data = await client.fetch(type, name, version);

    if (!data || typeof data !== 'object') {
      console.error(error(`Content not found: ${type}/${name}`));
      process.exitCode = 1;
      return;
    }

    const artifact = data as Record<string, unknown>;
    const content = artifact.content ?? JSON.stringify(artifact, null, 2);

    // Determine install path
    const installPaths: Record<string, string> = {
      pattern: `src/registry-content/patterns/${name}.json`,
      archetype: `src/registry-content/archetypes/${name}.json`,
      recipe: `src/registry-content/recipes/${name}.json`,
      style: `src/registry-content/styles/${name}.js`,
    };
    const relPath = installPaths[type];
    if (!relPath) {
      console.error(error(`Unknown content type: ${type}`));
      process.exitCode = 1;
      return;
    }

    const absPath = join(cwd, relPath);
    await mkdir(dirname(absPath), { recursive: true });
    await writeFile(absPath, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    console.log(success(relPath));

    // Update manifest
    const manifest = await readManifest(cwd);
    const installed = (manifest.installed ?? {}) as Record<string, Record<string, unknown>>;
    const plural = type.endsWith('s') ? type : type + 's';
    if (!installed[plural]) installed[plural] = {};
    (installed[plural] as Record<string, unknown>)[name] = {
      version: version ?? (artifact as any).version ?? 'latest',
      source: 'registry',
      file: relPath,
    };
    manifest.installed = installed;
    await writeManifest(cwd, manifest);
    console.log(success('Updated decantr.registry.json'));

    console.log(heading(`Installed ${type}/${name}`));
  } catch (e) {
    console.error(error(`Install failed: ${(e as Error).message}`));
    process.exitCode = 1;
  }
}

async function handleList(): Promise<void> {
  const cwd = process.cwd();
  const manifest = await readManifest(cwd);
  const installed = (manifest.installed ?? {}) as Record<string, Record<string, Record<string, string>>>;

  console.log(heading('Installed registry content'));

  let total = 0;
  for (const [type, entries] of Object.entries(installed)) {
    if (!entries || typeof entries !== 'object') continue;
    const names = Object.keys(entries);
    if (names.length === 0) continue;
    console.log(`  ${bold(type)}`);
    for (const name of names) {
      const entry = entries[name];
      console.log(`    ${name} ${dim(`v${entry.version ?? '?'}`)}`);
      total++;
    }
    console.log('');
  }

  if (total === 0) {
    console.log(info('No registry content installed.'));
    console.log(info('Run "decantr registry search <query>" to find content.'));
  } else {
    console.log(info(`${total} item(s) installed`));
  }
}
