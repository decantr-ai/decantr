import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { VERSION } from '../../tools/version.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(__dirname, '..', '..', 'src');
const registryDir = join(srcRoot, 'registry');

// ─── Registry data (loaded once at startup) ────────────────────

let components, patternsIndex, archetypesIndex, tokens, icons, skeletons;
const patternCache = new Map();
const archetypeCache = new Map();
const recipeCache = new Map();

// Atom categories for get_atom_reference
const ATOM_CATEGORIES = {
  layout: ['_flex', '_grid', '_col', '_row', '_wrap', '_flex1', '_none', '_block', '_inline', '_inlineFlex'],
  alignment: ['_aic', '_aifs', '_aife', '_ais', '_aibs', '_jcc', '_jcsb', '_jcsa', '_jcse', '_jcfs', '_jcfe', '_center'],
  spacing: ['_gap1', '_gap2', '_gap3', '_gap4', '_gap6', '_gap8', '_p1', '_p2', '_p3', '_p4', '_p6', '_p8', '_px4', '_px6', '_py3', '_py4', '_m0', '_mt4', '_mb4', '_mxa'],
  grid: ['_gc1', '_gc2', '_gc3', '_gc4', '_gc6', '_gc12', '_span2', '_span3', '_span4', '_gcaf280'],
  sizing: ['_wfull', '_hfull', '_minhscreen', '_flex1'],
  typography: ['_heading1', '_heading2', '_heading3', '_heading4', '_heading5', '_heading6', '_body', '_bodylg', '_caption', '_label', '_overline', '_bold', '_tc', '_textxs', '_textsm', '_textbase', '_textlg', '_textxl', '_text2xl', '_truncate'],
  color: ['_fgfg', '_fgmuted', '_fgmutedfg', '_fgprimary', '_fgsuccess', '_fgerror', '_fgwarning', '_bgbg', '_bgmuted', '_bgprimary', '_bgsuccess', '_bgerror', '_bgwarning', '_bgprimarysub'],
  border: ['_b1', '_r2', '_r4', '_rfull', '_bcborder', '_bcprimary', '_bcsuccess', '_bcerror', '_borderB', '_borderR', '_borderT'],
  effects: ['_shadow', '_shadowmd', '_trans', '_transfast', '_transslow', '_pointer', '_ohidden', '_relative', '_absolute', '_fixed', '_nounder'],
  position: ['_relative', '_absolute', '_fixed', '_sticky', '_top0', '_left0', '_right0', '_bottom0'],
};

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

async function getRecipe(id) {
  if (recipeCache.has(id)) return recipeCache.get(id);
  try {
    const data = await loadJSON(join(registryDir, `recipe-${id}.json`));
    recipeCache.set(id, data);
    return data;
  } catch {
    return null;
  }
}

// ─── Atom resolver (imported dynamically to stay ESM-clean) ────

let resolveAtomDecl;
async function loadAtomResolver() {
  const mod = await import(pathToFileURL(join(srcRoot, 'css', 'atoms.js')).href);
  resolveAtomDecl = mod.resolveAtomDecl;
}

// ─── Validation logic (extracted from validate.js) ─────────────

const KNOWN_ARCHETYPES = ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'financial-dashboard', 'recipe-community', 'gaming-platform'];
const KNOWN_STYLES = ['auradecantism', 'clean', 'retro', 'glassmorphism'];

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
  {
    name: 'get_component_signature',
    title: 'Get Component Signature',
    description: 'Get a concise component signature: required/optional props with types. Lighter than lookup_component — returns only what you need to use the component.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Component name (e.g. "Button", "DataTable", "Shell")' },
      },
      required: ['name'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'get_pattern_code',
    title: 'Get Pattern Code',
    description: 'Get a pattern\'s code snippet with optional recipe decorators applied. Returns the pattern blend, components, and code with recipe-specific wrapper classes.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Pattern ID (e.g. "kpi-grid", "data-table", "hero")' },
        recipe: { type: 'string', description: 'Optional recipe ID to apply decorators (e.g. "auradecantism", "clean")' },
        preset: { type: 'string', description: 'Optional preset name (e.g. "product", "content", "icon" for card-grid)' },
      },
      required: ['pattern'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'get_atom_reference',
    title: 'Get Atom Reference',
    description: 'Get atom class names for a specific category. Categories: layout, alignment, spacing, grid, sizing, typography, color, border, effects, position. Omit category to list all categories.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Atom category (e.g. "layout", "spacing", "color"). Omit to list all categories with atom counts.' },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'get_recipe_decorators',
    title: 'Get Recipe Decorators',
    description: 'Get a recipe\'s decorator classes, pattern overrides, and composition examples. Returns everything needed to apply a recipe\'s visual language.',
    inputSchema: {
      type: 'object',
      properties: {
        recipe: { type: 'string', description: 'Recipe ID (e.g. "auradecantism", "clean", "clay", "gaming-guild")' },
      },
      required: ['recipe'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'search_content_registry',
    title: 'Search Content Registry',
    description: 'Search the Decantr community content registry for styles, recipes, patterns, archetypes, plugins, and templates. Returns matching content with metadata and install instructions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (e.g. "neon", "kanban", "brutalist")' },
        type: { type: 'string', description: 'Filter by content type: style, recipe, pattern, archetype, plugin, template' },
        character: { type: 'string', description: 'Filter by character trait (e.g. "bold", "minimal", "playful")' },
        terroir: { type: 'string', description: 'Filter by terroir affinity (e.g. "portfolio", "saas-dashboard")' },
      },
      required: ['query'],
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'get_content_recommendations',
    title: 'Get Content Recommendations',
    description: 'Get AI-native content recommendations based on project terroir, character, and style. Used during the Decantation Process (SETTLE/CLARIFY) to discover complementary community content.',
    inputSchema: {
      type: 'object',
      properties: {
        terroir: { type: 'string', description: 'Project terroir/archetype (e.g. "saas-dashboard")' },
        character: { type: 'string', description: 'Comma-separated character traits (e.g. "bold,dramatic")' },
        style: { type: 'string', description: 'Current style (e.g. "glassmorphism")' },
        existing: { type: 'string', description: 'Comma-separated list of already-installed content IDs' },
      },
    },
    annotations: READ_ONLY_ANNOTATIONS,
  },
  {
    name: 'install_from_registry',
    title: 'Install from Content Registry',
    description: 'Install community content (style, recipe, pattern, etc.) from the registry into the project. Writes the artifact file, updates the manifest, and runs post-install index updates.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Content type: style, recipe, pattern, archetype, plugin' },
        name: { type: 'string', description: 'Content ID (e.g. "neon", "kanban")' },
        version: { type: 'string', description: 'Optional specific version' },
      },
      required: ['type', 'name'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
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

    case 'get_component_signature': {
      const err = validateStringArg(args, 'name');
      if (err) return { error: err };
      const compName = args.name;
      let key = Object.keys(components.components).find(k => k === compName);
      if (!key) key = Object.keys(components.components).find(k => k.toLowerCase() === compName.toLowerCase());
      if (!key) {
        const similar = Object.keys(components.components).filter(k => fuzzyMatch(compName, k)).slice(0, 5);
        return { found: false, message: `Component "${compName}" not found.`, suggestions: similar };
      }
      const comp = components.components[key];
      const props = comp.props || {};
      const signature = {};
      for (const [propName, propDef] of Object.entries(props)) {
        signature[propName] = {
          type: propDef.type,
          required: propDef.required || false,
          ...(propDef.reactive ? { reactive: true } : {}),
          ...(propDef.default !== undefined ? { default: propDef.default } : {}),
        };
      }
      return {
        found: true,
        name: key,
        description: comp.description || null,
        props: signature,
        children: comp.children || null,
        subComponents: comp.subComponents ? Object.keys(comp.subComponents) : null,
      };
    }

    case 'get_pattern_code': {
      const err = validateStringArg(args, 'pattern');
      if (err) return { error: err };
      const patternId = args.pattern;
      const pattern = await getPattern(patternId);
      if (!pattern) {
        const similar = Object.keys(patternsIndex.patterns).filter(k => fuzzyMatch(patternId, k)).slice(0, 5);
        return { found: false, message: `Pattern "${patternId}" not found.`, suggestions: similar };
      }

      // Resolve preset
      const presetId = args.preset || pattern.default_preset;
      const preset = presetId && pattern.presets?.[presetId] ? pattern.presets[presetId] : null;
      const resolved = preset ? {
        blend: preset.blend || preset.default_blend || pattern.default_blend,
        components: preset.components || pattern.components,
        code: preset.code || pattern.code,
      } : {
        blend: pattern.default_blend,
        components: pattern.components,
        code: pattern.code,
      };

      // Apply recipe decorators
      let recipeDecorators = null;
      if (args.recipe) {
        const recipe = await getRecipe(args.recipe);
        if (recipe) {
          recipeDecorators = {
            recipe: recipe.id,
            decorators: recipe.decorators || {},
            patternOverride: recipe.pattern_overrides?.[patternId] || null,
          };
        }
      }

      return {
        found: true,
        id: patternId,
        name: pattern.name,
        preset: presetId || null,
        availablePresets: pattern.presets ? Object.keys(pattern.presets) : [],
        blend: resolved.blend,
        components: resolved.components,
        code: resolved.code || null,
        recipeDecorators,
      };
    }

    case 'get_atom_reference': {
      const category = args?.category;
      if (!category) {
        const summary = {};
        for (const [cat, atoms] of Object.entries(ATOM_CATEGORIES)) {
          summary[cat] = { count: atoms.length, examples: atoms.slice(0, 5) };
        }
        return { categories: summary, total_categories: Object.keys(ATOM_CATEGORIES).length };
      }
      const atoms = ATOM_CATEGORIES[category];
      if (!atoms) {
        return {
          found: false,
          message: `Category "${category}" not found.`,
          available: Object.keys(ATOM_CATEGORIES),
        };
      }
      // Resolve each atom to its CSS
      const resolved = atoms.map(atom => {
        const css = resolveAtomDecl(atom);
        return { atom, css: css || null };
      });
      return { found: true, category, count: atoms.length, atoms: resolved };
    }

    case 'get_recipe_decorators': {
      const err = validateStringArg(args, 'recipe');
      if (err) return { error: err };
      const recipeId = args.recipe;
      const recipe = await getRecipe(recipeId);
      if (!recipe) {
        const available = ['auradecantism', 'clean', 'clay', 'gaming-guild'];
        return { found: false, message: `Recipe "${recipeId}" not found.`, available };
      }
      return {
        found: true,
        id: recipe.id,
        name: recipe.name,
        style: recipe.style,
        mode: recipe.mode,
        description: recipe.description,
        setup: recipe.setup || null,
        decorators: recipe.decorators || {},
        pattern_overrides: recipe.pattern_overrides || {},
        compositions: recipe.compositions || [],
      };
    }

    case 'search_content_registry': {
      const err = validateStringArg(args, 'query');
      if (err) return { error: err };
      try {
        const { createClient } = await import('../../src/registry/content-registry.js');
        const client = await createClient({ cwd: process.cwd() });
        const params = { q: args.query };
        if (args.type) params.type = args.type;
        if (args.character) params.character = args.character;
        if (args.terroir) params.terroir = args.terroir;
        const data = await client.search(params);
        return {
          total: data.total || 0,
          results: (data.results || []).map(r => ({
            type: r.type,
            id: r.id,
            version: r.version,
            description: r.description,
            ai_summary: r.ai_summary,
            character: r.character,
            install: `decantr registry add ${r.type}/${r.id}`,
          })),
        };
      } catch (err) {
        return { error: `Registry search failed: ${err.message}` };
      }
    }

    case 'get_content_recommendations': {
      try {
        const { createClient } = await import('../../src/registry/content-registry.js');
        const client = await createClient({ cwd: process.cwd() });
        const params = {};
        if (args.terroir) params.terroir = args.terroir;
        if (args.character) params.character = args.character;
        if (args.style) params.style = args.style;
        if (args.existing) params.existing = args.existing;
        const data = await client.getRecommendations(params);
        return data;
      } catch (err) {
        return { error: `Recommendations failed: ${err.message}` };
      }
    }

    case 'install_from_registry': {
      const typeErr = validateStringArg(args, 'type');
      if (typeErr) return { error: typeErr };
      const nameErr = validateStringArg(args, 'name');
      if (nameErr) return { error: nameErr };

      try {
        const { createClient } = await import('../../src/registry/content-registry.js');
        const { readManifest, writeManifest, setEntry } = await import('../../tools/registry-manifest.js');
        const { computeChecksum, validateArtifact } = await import('../../tools/registry-validator.js');
        const { writeFile, mkdir } = await import('node:fs/promises');
        const { join, dirname } = await import('node:path');

        const cwd = process.cwd();
        const client = await createClient({ cwd });
        const data = await client.getContent(args.type, args.name, args.version);

        if (!data?.artifact?.content) {
          return { error: `No artifact content for ${args.type}/${args.name}` };
        }

        const validation = validateArtifact(args.type, data.artifact.content);
        if (!validation.valid) {
          return { error: `Validation failed: ${validation.errors.join(', ')}` };
        }

        // Determine install path
        const pathMap = {
          style: `src/css/styles/community/${args.name}.js`,
          recipe: `src/registry/recipe-${args.name}.json`,
          pattern: `src/registry/patterns/${args.name}.json`,
          archetype: `src/registry/archetypes/${args.name}.json`,
          plugin: `plugins/${args.name}.js`,
        };
        const relPath = pathMap[args.type];
        if (!relPath) return { error: `Unknown content type: ${args.type}` };

        const absPath = join(cwd, relPath);
        await mkdir(dirname(absPath), { recursive: true });
        await writeFile(absPath, data.artifact.content);

        const checksum = computeChecksum(data.artifact.content);
        const plural = args.type.endsWith('s') ? args.type : args.type + 's';
        const manifest = await readManifest(cwd);
        setEntry(manifest, plural, args.name, {
          version: data.version,
          source: 'registry',
          checksum,
          file: relPath,
        });
        await writeManifest(cwd, manifest);

        return {
          installed: true,
          type: args.type,
          name: args.name,
          version: data.version,
          file: relPath,
          warnings: validation.warnings,
        };
      } catch (err) {
        return { error: `Install failed: ${err.message}` };
      }
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
    { name: 'decantr', version: VERSION },
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
