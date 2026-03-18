/**
 * CLI: `decantr registry` — Community content registry commands.
 *
 * Subcommands: search, add, remove, update, list, info, publish
 *
 * @module cli/commands/registry
 */

import { readFile, writeFile, unlink, mkdir, access, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  readManifest, writeManifest, getEntry, setEntry, removeEntry,
  listEntries, isEmpty, createEmptyManifest, CONTENT_TYPES,
} from '../../tools/registry-manifest.js';
import {
  computeChecksum, verifyChecksum, validateId, validateVersion,
  validateArtifact, validateForPublish, compareSemver, VALID_TYPES,
} from '../../tools/registry-validator.js';
import { createClient } from '../../src/registry/content-registry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Helpers ──────────────────────────────────────────────────────

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

/** Map singular type to plural for manifest keys. */
function pluralType(type) {
  if (type.endsWith('s')) return type;
  return type + 's';
}

/** Map plural type to singular for API paths. */
function singularType(type) {
  if (type.endsWith('s')) return type.slice(0, -1);
  return type;
}

/** Parse `type/name[@version]` specifier. */
function parseSpec(spec) {
  const match = spec.match(/^([a-z]+)\/([a-z0-9@-]+?)(?:@(.+))?$/);
  if (!match) return null;
  return { type: singularType(match[1]), name: match[2], version: match[3] || null };
}

/** File placement map — where each content type is installed. */
function getInstallPath(type, name) {
  switch (type) {
    case 'style': return `src/css/styles/community/${name}.js`;
    case 'recipe': return `src/registry/recipe-${name}.json`;
    case 'pattern': return `src/registry/patterns/${name}.json`;
    case 'archetype': return `src/registry/archetypes/${name}.json`;
    case 'plugin': return `plugins/${name}.js`;
    case 'template': return `tools/starter-templates/${name}/`;
    default: return null;
  }
}

async function fileExists(path) {
  try { await access(path); return true; } catch { return false; }
}

// ── Post-install index updates ───────────────────────────────────

async function updatePatternIndex(cwd, name, action) {
  const indexPath = join(cwd, 'src', 'registry', 'patterns', 'index.json');
  try {
    const index = JSON.parse(await readFile(indexPath, 'utf-8'));
    if (action === 'add') {
      if (!index.patterns) index.patterns = {};
      index.patterns[name] = { file: `${name}.json`, name, source: 'registry' };
    } else if (action === 'remove') {
      delete index.patterns?.[name];
    }
    await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
  } catch { /* index doesn't exist or is invalid — skip */ }
}

async function updateArchetypeIndex(cwd, name, action) {
  const indexPath = join(cwd, 'src', 'registry', 'archetypes', 'index.json');
  try {
    const index = JSON.parse(await readFile(indexPath, 'utf-8'));
    if (action === 'add') {
      if (!index.archetypes) index.archetypes = {};
      index.archetypes[name] = { file: `${name}.json`, name, source: 'registry' };
    } else if (action === 'remove') {
      delete index.archetypes?.[name];
    }
    await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n');
  } catch { /* skip */ }
}

async function updatePluginConfig(cwd, name, action) {
  const configPath = join(cwd, 'decantr.config.json');
  try {
    const config = JSON.parse(await readFile(configPath, 'utf-8'));
    if (!config.plugins) config.plugins = [];
    const pluginPath = `./plugins/${name}.js`;
    if (action === 'add') {
      if (!config.plugins.includes(pluginPath)) {
        config.plugins.push(pluginPath);
      }
    } else if (action === 'remove') {
      config.plugins = config.plugins.filter(p =>
        p !== pluginPath && !(Array.isArray(p) && p[0] === pluginPath)
      );
    }
    await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
  } catch { /* skip */ }
}

async function postInstall(cwd, type, name, action) {
  switch (type) {
    case 'pattern': await updatePatternIndex(cwd, name, action); break;
    case 'archetype': await updateArchetypeIndex(cwd, name, action); break;
    case 'plugin': await updatePluginConfig(cwd, name, action); break;
  }
}

// ── Subcommands ──────────────────────────────────────────────────

async function cmdSearch(args) {
  const query = args.positionals[0] || '';
  if (!query) {
    console.log(red('  Usage: decantr registry search <query> [--type=style] [--character=bold] [--json]'));
    process.exitCode = 1;
    return;
  }

  const client = await createClient({ cwd: process.cwd() });
  const params = { q: query };
  if (args.values.type) params.type = args.values.type;
  if (args.values.character) params.character = args.values.character;
  if (args.values.terroir) params.terroir = args.values.terroir;

  try {
    const data = await client.search(params);

    if (args.values.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    if (!data.results?.length) {
      console.log(dim(`  No results for "${query}"`));
      return;
    }

    console.log(`\n  ${bold('Registry search:')} ${data.total} result(s) for "${query}"\n`);
    for (const item of data.results) {
      const tags = item.tags?.length ? dim(` [${item.tags.join(', ')}]`) : '';
      console.log(`  ${cyan(item.type)}/${bold(item.id)} ${dim('v' + item.version)}${tags}`);
      if (item.description) console.log(`    ${item.description}`);
      if (item.ai_summary) console.log(`    ${dim(item.ai_summary)}`);
    }
    console.log('');
  } catch (err) {
    console.error(red(`  Search failed: ${err.message}`));
    process.exitCode = 1;
  }
}

async function cmdAdd(args) {
  const spec = args.positionals[0];
  if (!spec) {
    console.log(red('  Usage: decantr registry add <type>/<name>[@version] [--force]'));
    process.exitCode = 1;
    return;
  }

  const parsed = parseSpec(spec);
  if (!parsed) {
    console.log(red(`  Invalid specifier: "${spec}". Expected format: type/name[@version]`));
    process.exitCode = 1;
    return;
  }

  const { type, name, version } = parsed;
  const force = args.values.force || false;
  const cwd = process.cwd();
  const manifest = await readManifest(cwd);

  // Determine install path
  const relPath = getInstallPath(type, name);
  if (!relPath) {
    console.log(red(`  Unknown content type: "${type}"`));
    process.exitCode = 1;
    return;
  }
  const absPath = join(cwd, relPath);

  // Check for conflicts
  const existingEntry = getEntry(manifest, pluralType(type), name);
  if (await fileExists(absPath)) {
    if (existingEntry) {
      // File exists with manifest entry — check if locally modified
      const checksumMatch = await verifyChecksum(absPath, existingEntry.checksum);
      if (!checksumMatch && !force) {
        console.log(yellow(`  Local modifications detected in ${relPath}.`));
        console.log(dim('  Use --force to overwrite.'));
        process.exitCode = 1;
        return;
      }
    } else if (!force) {
      // File exists without manifest entry — local file
      console.log(yellow(`  File ${relPath} already exists (not from registry).`));
      console.log(dim('  Use --force to overwrite.'));
      process.exitCode = 1;
      return;
    }
  }

  // Fetch content from registry
  const client = await createClient({ cwd });
  let data;
  try {
    data = await client.getContent(type, name, version);
  } catch (err) {
    console.error(red(`  Failed to fetch ${type}/${name}: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  const content = data.artifact?.content;
  if (!content) {
    console.error(red(`  No artifact content returned for ${type}/${name}`));
    process.exitCode = 1;
    return;
  }

  // Validate artifact
  const validation = validateArtifact(type, content);
  if (!validation.valid) {
    console.error(red(`  Artifact validation failed:`));
    for (const e of validation.errors) console.error(`    ${red(e)}`);
    process.exitCode = 1;
    return;
  }
  for (const w of validation.warnings) {
    console.log(`  ${yellow('warning:')} ${w}`);
  }

  // Verify checksum
  const localChecksum = computeChecksum(content);
  if (data.artifact.checksum && data.artifact.checksum !== localChecksum) {
    console.error(red(`  Checksum mismatch — artifact may be corrupted`));
    process.exitCode = 1;
    return;
  }

  // Write file
  await mkdir(dirname(absPath), { recursive: true });
  await writeFile(absPath, content);

  // Update manifest
  setEntry(manifest, pluralType(type), name, {
    version: data.version,
    source: 'registry',
    checksum: localChecksum,
    file: relPath,
  });
  await writeManifest(cwd, manifest);

  // Post-install index updates
  await postInstall(cwd, type, name, 'add');

  console.log(green(`  Installed ${type}/${name}@${data.version} → ${relPath}`));
}

async function cmdRemove(args) {
  const spec = args.positionals[0];
  if (!spec) {
    console.log(red('  Usage: decantr registry remove <type>/<name>'));
    process.exitCode = 1;
    return;
  }

  const parsed = parseSpec(spec);
  if (!parsed) {
    console.log(red(`  Invalid specifier: "${spec}". Expected format: type/name`));
    process.exitCode = 1;
    return;
  }

  const { type, name } = parsed;
  const cwd = process.cwd();
  const manifest = await readManifest(cwd);
  const entry = getEntry(manifest, pluralType(type), name);

  if (!entry) {
    console.log(yellow(`  ${type}/${name} is not installed via registry`));
    process.exitCode = 1;
    return;
  }

  // Check if referenced in essence
  try {
    const essence = JSON.parse(await readFile(join(cwd, 'decantr.essence.json'), 'utf-8'));
    const essenceStr = JSON.stringify(essence);
    if (essenceStr.includes(`"${name}"`)) {
      console.log(yellow(`  Warning: "${name}" appears to be referenced in decantr.essence.json`));
    }
  } catch { /* no essence */ }

  // Delete file
  const absPath = join(cwd, entry.file);
  try {
    await unlink(absPath);
  } catch {
    console.log(dim(`  File ${entry.file} already removed`));
  }

  // Update manifest
  removeEntry(manifest, pluralType(type), name);
  await writeManifest(cwd, manifest);

  // Post-remove index updates
  await postInstall(cwd, type, name, 'remove');

  console.log(green(`  Removed ${type}/${name}`));
}

async function cmdUpdate(args) {
  const spec = args.positionals[0];
  const dryRun = args.values['dry-run'] || false;
  const force = args.values.force || false;
  const cwd = process.cwd();
  const manifest = await readManifest(cwd);

  // Determine which entries to update
  let entries;
  if (spec) {
    const parsed = parseSpec(spec);
    if (!parsed) {
      console.log(red(`  Invalid specifier: "${spec}"`));
      process.exitCode = 1;
      return;
    }
    const entry = getEntry(manifest, pluralType(parsed.type), parsed.name);
    if (!entry) {
      console.log(yellow(`  ${parsed.type}/${parsed.name} is not installed`));
      process.exitCode = 1;
      return;
    }
    entries = [{ type: parsed.type, name: parsed.name, ...entry }];
  } else {
    entries = listEntries(manifest).map(e => ({
      ...e,
      type: singularType(e.type),
    }));
  }

  if (entries.length === 0) {
    console.log(dim('  No installed registry content to update'));
    return;
  }

  const client = await createClient({ cwd });
  let updated = 0;

  for (const entry of entries) {
    try {
      const data = await client.getContent(entry.type, entry.name);
      if (!data.version) continue;

      if (compareSemver(data.version, entry.version) <= 0) {
        if (!dryRun) continue; // Already latest
        console.log(dim(`  ${entry.type}/${entry.name} ${entry.version} — up to date`));
        continue;
      }

      if (dryRun) {
        console.log(`  ${cyan(entry.type)}/${bold(entry.name)} ${entry.version} → ${green(data.version)}`);
        updated++;
        continue;
      }

      // Check for local modifications
      const absPath = join(cwd, entry.file);
      if (await fileExists(absPath)) {
        const checksumMatch = await verifyChecksum(absPath, entry.checksum);
        if (!checksumMatch && !force) {
          console.log(yellow(`  ${entry.type}/${entry.name}: local modifications, skipping (use --force)`));
          continue;
        }
      }

      // Write updated content
      const content = data.artifact?.content;
      if (!content) continue;

      await mkdir(dirname(absPath), { recursive: true });
      await writeFile(absPath, content);

      const checksum = computeChecksum(content);
      setEntry(manifest, pluralType(entry.type), entry.name, {
        version: data.version,
        source: 'registry',
        checksum,
        file: entry.file,
      });

      console.log(green(`  Updated ${entry.type}/${entry.name} ${entry.version} → ${data.version}`));
      updated++;
    } catch (err) {
      console.log(yellow(`  ${entry.type}/${entry.name}: ${err.message}`));
    }
  }

  if (!dryRun && updated > 0) {
    await writeManifest(cwd, manifest);
  }

  if (dryRun) {
    console.log(updated > 0 ? `\n  ${updated} update(s) available` : dim('\n  Everything is up to date'));
  } else {
    console.log(updated > 0 ? `\n  ${green(updated + ' package(s) updated')}` : dim('\n  Everything is up to date'));
  }
}

async function cmdList(args) {
  const json = args.values.json || false;
  const check = args.values.check || false;
  const cwd = process.cwd();
  const manifest = await readManifest(cwd);
  const entries = listEntries(manifest);

  if (json) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  if (entries.length === 0) {
    console.log(dim('  No registry content installed'));
    console.log(dim('  Run `decantr registry search <query>` to discover content'));
    return;
  }

  console.log(`\n  ${bold('Installed registry content:')}\n`);

  for (const entry of entries) {
    const type = singularType(entry.type);
    let status = '';
    if (check) {
      const absPath = join(cwd, entry.file);
      const ok = await verifyChecksum(absPath, entry.checksum);
      status = ok ? green(' [ok]') : yellow(' [modified]');
    }
    const date = entry.installedAt ? dim(` (${new Date(entry.installedAt).toLocaleDateString()})`) : '';
    console.log(`  ${cyan(type)}/${bold(entry.name)} ${dim('v' + entry.version)}${status}${date}`);
    console.log(`    ${dim(entry.file)}`);
  }
  console.log(`\n  ${entries.length} item(s) total\n`);
}

async function cmdInfo(args) {
  const spec = args.positionals[0];
  if (!spec) {
    console.log(red('  Usage: decantr registry info <type>/<name> [--json] [--version=1.0.0]'));
    process.exitCode = 1;
    return;
  }

  const parsed = parseSpec(spec);
  if (!parsed) {
    console.log(red(`  Invalid specifier: "${spec}"`));
    process.exitCode = 1;
    return;
  }

  const client = await createClient({ cwd: process.cwd() });
  try {
    const data = await client.getContent(parsed.type, parsed.name, args.values.version);

    if (args.values.json) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log(`\n  ${cyan(data.type)}/${bold(data.id)} ${dim('v' + data.version)}`);
    if (data.metadata) {
      if (data.metadata.character?.length) {
        console.log(`  Character: ${data.metadata.character.join(', ')}`);
      }
      if (data.metadata.terroir_affinity?.length) {
        console.log(`  Terroir affinity: ${data.metadata.terroir_affinity.join(', ')}`);
      }
      if (data.metadata.pairings) {
        const pairs = [];
        for (const [k, v] of Object.entries(data.metadata.pairings)) {
          if (v?.length) pairs.push(`${k}: ${v.join(', ')}`);
        }
        if (pairs.length) console.log(`  Pairings: ${pairs.join(' | ')}`);
      }
    }
    if (data.versions?.length) {
      console.log(`  Versions: ${data.versions.map(v => v.version).join(', ')}`);
    }
    console.log('');
  } catch (err) {
    console.error(red(`  Failed to fetch info: ${err.message}`));
    process.exitCode = 1;
  }
}

async function cmdPublish(args) {
  const dryRun = args.values['dry-run'] || false;
  const type = args.values.type;
  const file = args.values.file;

  if (!type || !VALID_TYPES.includes(type)) {
    console.log(red(`  Usage: decantr registry publish --type=<${VALID_TYPES.join('|')}> --file=<path> [--dry-run]`));
    process.exitCode = 1;
    return;
  }

  if (!file) {
    console.log(red('  --file is required'));
    process.exitCode = 1;
    return;
  }

  const cwd = process.cwd();
  let content;
  try {
    content = await readFile(join(cwd, file), 'utf-8');
  } catch {
    console.error(red(`  Cannot read file: ${file}`));
    process.exitCode = 1;
    return;
  }

  // Extract ID and version from artifact
  let id, version;
  if (type === 'style' || type === 'plugin') {
    // JS artifact — extract id from export
    const idMatch = content.match(/id\s*:\s*['"]([^'"]+)['"]/);
    const versionMatch = content.match(/version\s*:\s*['"]([^'"]+)['"]/);
    id = idMatch?.[1];
    version = versionMatch?.[1] || '1.0.0';
  } else {
    // JSON artifact
    try {
      const data = JSON.parse(content);
      id = data.id;
      version = data.version || '1.0.0';
    } catch {
      console.error(red('  Cannot parse JSON artifact'));
      process.exitCode = 1;
      return;
    }
  }

  if (!id) {
    console.error(red('  Cannot extract "id" from artifact'));
    process.exitCode = 1;
    return;
  }

  // Validate
  const result = validateForPublish(type, id, version, content);
  if (!result.valid) {
    console.error(red('  Validation failed:'));
    for (const e of result.errors) console.error(`    ${red(e)}`);
    process.exitCode = 1;
    return;
  }
  for (const w of result.warnings) {
    console.log(`  ${yellow('warning:')} ${w}`);
  }

  if (dryRun) {
    console.log(green(`\n  Dry run passed for ${type}/${id}@${version}`));
    console.log(`  Checksum: ${computeChecksum(content)}`);
    console.log(`  Size: ${Buffer.byteLength(content)} bytes\n`);
    return;
  }

  // Authenticate
  const { authenticate } = await import('../../tools/registry-auth.js');
  let token;
  try {
    token = await authenticate();
  } catch (err) {
    console.error(red(`  Authentication failed: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  // Publish
  const client = await createClient({ cwd, token });
  try {
    const response = await client.publish({
      type,
      id,
      version,
      artifact: {
        content,
        checksum: computeChecksum(content),
      },
    });
    console.log(green(`\n  Published ${type}/${id}@${version}`));
    if (response.url) console.log(`  ${dim(response.url)}`);
  } catch (err) {
    console.error(red(`  Publish failed: ${err.message}`));
    process.exitCode = 1;
  }
}

// ── Main dispatcher ──────────────────────────────────────────────

export async function run() {
  const rawArgs = process.argv.slice(3);
  const subcommand = rawArgs[0];
  const subArgs = rawArgs.slice(1);

  // Parse remaining args
  const { values, positionals } = parseArgs({
    args: subArgs,
    allowPositionals: true,
    strict: false,
    options: {
      type: { type: 'string', short: 't' },
      json: { type: 'boolean' },
      force: { type: 'boolean', short: 'f' },
      check: { type: 'boolean' },
      'dry-run': { type: 'boolean' },
      character: { type: 'string' },
      terroir: { type: 'string' },
      version: { type: 'string' },
      file: { type: 'string' },
    },
  });

  const parsed = { values, positionals };

  switch (subcommand) {
    case 'search': await cmdSearch(parsed); break;
    case 'add':    await cmdAdd(parsed); break;
    case 'remove': await cmdRemove(parsed); break;
    case 'update': await cmdUpdate(parsed); break;
    case 'list':   await cmdList(parsed); break;
    case 'info':   await cmdInfo(parsed); break;
    case 'publish': await cmdPublish(parsed); break;
    default:
      console.log(`
  ${bold('decantr registry')} — Community content registry

  ${bold('Commands:')}
    search <query>           Search the registry
    add <type>/<name>        Install content from registry
    remove <type>/<name>     Remove installed content
    update [<type>/<name>]   Update installed content
    list                     List installed content
    info <type>/<name>       Show content details
    publish                  Publish content to registry

  ${bold('Types:')} style, recipe, pattern, archetype, plugin, template

  ${bold('Examples:')}
    decantr registry search neon
    decantr registry add style/neon
    decantr registry add pattern/kanban@1.2.0
    decantr registry remove style/neon
    decantr registry update --dry-run
    decantr registry list --check
    decantr registry publish --type=style --file=src/css/styles/community/neon.js
`);
      break;
  }
}
