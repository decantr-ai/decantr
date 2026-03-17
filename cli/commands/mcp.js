import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(__dirname, '..', '..', 'src');
const registryDir = join(srcRoot, 'registry');

// ─── Registry data (loaded once at startup) ────────────────────

let components, patternsIndex, archetypesIndex, tokens, icons, skeletons;
const patternCache = new Map();
const archetypeCache = new Map();

async function loadJSON(path) {
  return JSON.parse(await readFile(path, 'utf-8'));
}

async function loadRegistry() {
  [components, patternsIndex, archetypesIndex, tokens, icons, skeletons] = await Promise.all([
    loadJSON(join(registryDir, 'components.json')),
    loadJSON(join(registryDir, 'patterns', 'index.json')),
    loadJSON(join(registryDir, 'archetypes', 'index.json')),
    loadJSON(join(registryDir, 'tokens.json')),
    loadJSON(join(registryDir, 'icons.json')),
    loadJSON(join(registryDir, 'skeletons.json')),
  ]);
}

async function getPattern(id) {
  if (patternCache.has(id)) return patternCache.get(id);
  const entry = patternsIndex.patterns[id];
  if (!entry) return null;
  const data = await loadJSON(join(registryDir, 'patterns', entry.file));
  patternCache.set(id, data);
  return data;
}

async function getArchetype(id) {
  if (archetypeCache.has(id)) return archetypeCache.get(id);
  const entry = archetypesIndex.archetypes[id];
  if (!entry) return null;
  const data = await loadJSON(join(registryDir, 'archetypes', entry.file));
  archetypeCache.set(id, data);
  return data;
}

// ─── Atom resolver (imported dynamically to stay ESM-clean) ────

let resolveAtomDecl;
async function loadAtomResolver() {
  const mod = await import(pathToFileURL(join(srcRoot, 'css', 'atoms.js')).href);
  resolveAtomDecl = mod.resolveAtomDecl;
}

// ─── Validation logic (extracted from validate.js) ─────────────

const KNOWN_ARCHETYPES = ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'financial-dashboard', 'recipe-community', 'gaming-platform'];
const KNOWN_STYLES = ['auradecantism', 'clean', 'retro', 'glassmorphism', 'command-center'];

function validateEssence(essence) {
  const errors = [];
  const warnings = [];

  const isSectioned = Array.isArray(essence.sections);
  const isSimple = typeof essence.terroir === 'string' || essence.terroir === null;

  if (!isSectioned && !isSimple) {
    errors.push('Essence must have either "terroir" (simple) or "sections" (sectioned)');
  }

  function validateVintage(vintage, prefix) {
    if (!vintage) return;
    if (vintage.style && !KNOWN_STYLES.includes(vintage.style)) {
      warnings.push(`${prefix}vintage.style "${vintage.style}" is not a built-in style. Built-in: ${KNOWN_STYLES.join(', ')}`);
    }
    if (vintage.mode && !['light', 'dark', 'auto'].includes(vintage.mode)) {
      errors.push(`${prefix}vintage.mode must be light|dark|auto, got "${vintage.mode}"`);
    }
  }

  function validateStructure(structure, prefix) {
    if (!Array.isArray(structure)) return;
    for (const page of structure) {
      if (!page.id) errors.push(`${prefix}structure entry missing "id"`);
      if (!page.skeleton) warnings.push(`${prefix}structure entry "${page.id || '?'}" missing "skeleton"`);
      if (!page.blend && !page.patterns) warnings.push(`${prefix}structure entry "${page.id || '?'}" missing "blend"`);
    }
  }

  if (isSectioned) {
    const sectionPaths = new Set();
    for (const section of essence.sections) {
      if (!section.id) errors.push('Section missing "id"');
      if (!section.path) errors.push(`Section "${section.id || '?'}" missing "path"`);
      if (section.path && sectionPaths.has(section.path)) {
        errors.push(`Duplicate section path: "${section.path}"`);
      }
      if (section.path) sectionPaths.add(section.path);
      if (section.terroir && !KNOWN_ARCHETYPES.includes(section.terroir)) {
        errors.push(`Section "${section.id}": terroir "${section.terroir}" is not a known archetype`);
      }
      validateVintage(section.vintage, `Section "${section.id || '?'}": `);
      validateStructure(section.structure, `Section "${section.id || '?'}": `);
    }
    if (Array.isArray(essence.shared_tannins)) {
      for (const section of essence.sections) {
        if (Array.isArray(section.tannins)) {
          for (const t of section.tannins) {
            if (essence.shared_tannins.includes(t)) {
              warnings.push(`Tannin "${t}" is in both shared_tannins and section "${section.id}"`);
            }
          }
        }
      }
    }
  } else {
    if (essence.terroir && !KNOWN_ARCHETYPES.includes(essence.terroir)) {
      errors.push(`terroir "${essence.terroir}" is not a known archetype. Known: ${KNOWN_ARCHETYPES.join(', ')}`);
    }
    validateVintage(essence.vintage, '');
    validateStructure(essence.structure, '');
  }

  if (essence.vessel) {
    if (essence.vessel.type && !['spa', 'mpa'].includes(essence.vessel.type)) {
      warnings.push(`vessel.type "${essence.vessel.type}" is unusual (expected spa|mpa)`);
    }
    if (essence.vessel.routing && !['hash', 'history'].includes(essence.vessel.routing)) {
      errors.push(`vessel.routing must be hash|history, got "${essence.vessel.routing}"`);
    }
  }

  if (essence.cork && typeof essence.cork !== 'object') {
    errors.push('cork must be an object');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Fuzzy search ──────────────────────────────────────────────

function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  // Simple subsequence match
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function fuzzyScore(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;
  // Subsequence scoring
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 60 : 0;
}

// ─── Tool definitions ──────────────────────────────────────────

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const TOOLS = [
  {
    name: 'lookup_component',
    title: 'Look Up Component',
    description: 'Look up a decantr component by name. Returns props, types, reactive flags, examples, and showcase data.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Component name (e.g. "Button", "Card", "Modal")' },
      },
      required: ['name'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'lookup_pattern',
    title: 'Look Up Pattern',
    description: 'Look up an experience pattern by ID. Returns blend specs, components used, recipe overrides, and example code.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Pattern ID (e.g. "hero", "data-table", "kpi-grid")' },
      },
      required: ['name'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'lookup_archetype',
    title: 'Look Up Archetype',
    description: 'Look up a domain archetype by ID. Returns pages, skeletons, tannins, suggested vintage, and default blends.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Archetype ID (e.g. "saas-dashboard", "ecommerce", "portfolio")' },
      },
      required: ['name'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'resolve_atoms',
    title: 'Resolve Atoms',
    description: 'Resolve space-separated decantr atom class names to their CSS declarations. Returns validity and CSS for each atom.',
    inputSchema: {
      type: 'object',
      properties: {
        atoms: { type: 'string', description: 'Space-separated atom names (e.g. "_flex _col _gap4 _p4 _bgprimary")' },
      },
      required: ['atoms'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'lookup_tokens',
    title: 'Look Up Tokens',
    description: 'Look up decantr design tokens. Returns token names, values, and organization by group.',
    inputSchema: {
      type: 'object',
      properties: {
        group: { type: 'string', description: 'Optional group filter (palette, neutral, surfaces, typography, spacing, elevation, motion, chart)' },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'lookup_icon',
    title: 'Look Up Icon',
    description: 'Check if a decantr icon exists by name, or list all available icons.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Icon name to check (e.g. "arrow-left", "check"). Omit to list all icons.' },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'search_registry',
    title: 'Search Registry',
    description: 'Fuzzy search across all decantr registry entries — components, patterns, archetypes, and icons.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (e.g. "table", "auth", "chart")' },
      },
      required: ['query'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'validate_essence',
    title: 'Validate Essence',
    description: 'Validate a decantr.essence.json file. Returns errors and warnings.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json in the current working directory.' },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'lookup_skeleton',
    title: 'Look Up Skeleton',
    description: 'Look up a page skeleton layout by name, or list all available skeletons. Returns layout specs, atoms, and code examples.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Skeleton name (e.g. "sidebar-main", "top-nav-main"). Omit to list all skeletons.' },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
];

// ─── Tool handlers ─────────────────────────────────────────────

const MAX_INPUT_LENGTH = 1000;

function validateStringArg(args, field) {
  const val = args[field];
  if (!val || typeof val !== 'string') {
    return `Required parameter "${field}" must be a non-empty string.`;
  }
  if (val.length > MAX_INPUT_LENGTH) {
    return `Parameter "${field}" exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`;
  }
  return null;
}

async function handleTool(name, args) {
  switch (name) {
    case 'lookup_component': {
      const err = validateStringArg(args, 'name');
      if (err) return { error: err };
      const compName = args.name;
      const comp = components.components[compName];
      if (!comp) {
        // Try case-insensitive search
        const key = Object.keys(components.components).find(
          k => k.toLowerCase() === compName.toLowerCase()
        );
        if (key) {
          return { found: true, name: key, ...components.components[key] };
        }
        // Suggest similar names
        const similar = Object.keys(components.components)
          .filter(k => fuzzyMatch(compName, k))
          .slice(0, 5);
        return { found: false, message: `Component "${compName}" not found.`, suggestions: similar };
      }
      return { found: true, name: compName, ...comp };
    }

    case 'lookup_pattern': {
      const err = validateStringArg(args, 'name');
      if (err) return { error: err };
      const patternId = args.name;
      const pattern = await getPattern(patternId);
      if (!pattern) {
        const similar = Object.keys(patternsIndex.patterns)
          .filter(k => fuzzyMatch(patternId, k))
          .slice(0, 5);
        return { found: false, message: `Pattern "${patternId}" not found.`, suggestions: similar };
      }
      return { found: true, ...pattern };
    }

    case 'lookup_archetype': {
      const err = validateStringArg(args, 'name');
      if (err) return { error: err };
      const archId = args.name;
      const arch = await getArchetype(archId);
      if (!arch) {
        const similar = Object.keys(archetypesIndex.archetypes)
          .filter(k => fuzzyMatch(archId, k))
          .slice(0, 5);
        return { found: false, message: `Archetype "${archId}" not found.`, suggestions: similar };
      }
      return { found: true, ...arch };
    }

    case 'resolve_atoms': {
      const err = validateStringArg(args, 'atoms');
      if (err) return { error: err };
      const atomNames = args.atoms.trim().split(/\s+/);
      const results = atomNames.map(atom => {
        const css = resolveAtomDecl(atom);
        return { atom, css: css || null, valid: css !== null };
      });
      const valid = results.filter(r => r.valid).length;
      const invalid = results.filter(r => !r.valid).length;
      return { total: results.length, valid, invalid, atoms: results };
    }

    case 'lookup_tokens': {
      const group = args?.group;
      if (group) {
        const g = tokens.groups[group];
        if (!g) {
          return {
            found: false,
            message: `Token group "${group}" not found.`,
            available_groups: Object.keys(tokens.groups),
          };
        }
        return { found: true, group, ...g };
      }
      // Return all groups with summary
      const summary = {};
      for (const [key, val] of Object.entries(tokens.groups)) {
        summary[key] = { label: val.label };
        if (val.tokens) summary[key].count = val.tokens.length;
        if (val.roles) summary[key].roles = val.roles;
        if (val.levels) summary[key].levels = val.levels;
        if (val.count) summary[key].count = val.count;
      }
      return { groups: summary };
    }

    case 'lookup_icon': {
      const iconName = args?.name;
      const allIcons = icons.essential || [];
      if (!iconName) {
        return { total: allIcons.length, icons: allIcons };
      }
      const exists = allIcons.includes(iconName);
      if (exists) {
        return { found: true, name: iconName, usage: `icon('${iconName}')` };
      }
      const similar = allIcons.filter(i => fuzzyMatch(iconName, i)).slice(0, 10);
      return { found: false, message: `Icon "${iconName}" not found.`, suggestions: similar };
    }

    case 'search_registry': {
      const err = validateStringArg(args, 'query');
      if (err) return { error: err };
      const query = args.query;
      const results = [];

      // Search components
      for (const name of Object.keys(components.components)) {
        const score = fuzzyScore(query, name);
        if (score > 0) results.push({ type: 'component', name, score });
      }

      // Search patterns
      for (const [id, entry] of Object.entries(patternsIndex.patterns)) {
        const score = Math.max(fuzzyScore(query, id), fuzzyScore(query, entry.name));
        if (score > 0) results.push({ type: 'pattern', id, name: entry.name, score });
      }

      // Search archetypes
      for (const [id, entry] of Object.entries(archetypesIndex.archetypes)) {
        const score = Math.max(fuzzyScore(query, id), fuzzyScore(query, entry.name), fuzzyScore(query, entry.description));
        if (score > 0) results.push({ type: 'archetype', id, name: entry.name, score });
      }

      // Search icons
      const allIcons = icons.essential || [];
      for (const name of allIcons) {
        const score = fuzzyScore(query, name);
        if (score > 0) results.push({ type: 'icon', name, score });
      }

      // Search skeletons
      for (const [id, skel] of Object.entries(skeletons.skeletons)) {
        const score = Math.max(fuzzyScore(query, id), fuzzyScore(query, skel.name));
        if (score > 0) results.push({ type: 'skeleton', id, name: skel.name, score });
      }

      // Sort by score descending, limit to 20
      results.sort((a, b) => b.score - a.score);
      return { query, total: results.length, results: results.slice(0, 20) };
    }

    case 'validate_essence': {
      const essencePath = args?.path || join(process.cwd(), 'decantr.essence.json');
      let essence;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return { valid: false, errors: [`Could not read essence file at "${essencePath}": ${e.message}`], warnings: [] };
      }
      return validateEssence(essence);
    }

    case 'lookup_skeleton': {
      const skelName = args?.name;
      if (!skelName) {
        const summary = {};
        for (const [id, skel] of Object.entries(skeletons.skeletons)) {
          summary[id] = { name: skel.name, description: skel.description, layout: skel.layout, atoms: skel.atoms };
        }
        return { skeletons: summary };
      }
      const skel = skeletons.skeletons[skelName];
      if (!skel) {
        const similar = Object.keys(skeletons.skeletons).filter(k => fuzzyMatch(skelName, k));
        return { found: false, message: `Skeleton "${skelName}" not found.`, suggestions: similar };
      }
      return { found: true, id: skelName, ...skel };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ─── Server setup ──────────────────────────────────────────────

export async function run() {
  // Load all data before starting
  await Promise.all([loadRegistry(), loadAtomResolver()]);

  const server = new Server(
    { name: 'decantr', version: '0.4.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const result = await handleTool(name, args || {});
      const response = {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
      if (result && result.error) {
        response.isError = true;
      }
      return response;
    } catch (err) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
