#!/usr/bin/env node
/**
 * Auto-generates src/registry/ from JSDoc annotations across all source files.
 * Run: node tools/registry.js
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERSION } from './version.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src');

function readFile(path) {
  return readFileSync(path, 'utf-8');
}

// --- JSDoc parser ---

/**
 * Extract JSDoc blocks paired with their export function declarations.
 * Two-pass: find export functions, then look backwards for the nearest JSDoc block.
 */
function extractFunctions(source) {
  const results = [];
  const funcRe = /export\s+function\s+(\w+)/g;
  let m;
  while ((m = funcRe.exec(source)) !== null) {
    // Look backwards from the export function for the nearest JSDoc end
    const before = source.slice(0, m.index);
    const lastClose = before.lastIndexOf('*/');
    if (lastClose === -1) continue;

    // Find the matching opening /**
    const chunk = before.slice(0, lastClose + 2);
    const lastOpen = chunk.lastIndexOf('/**');
    if (lastOpen === -1) continue;

    // Verify only whitespace between JSDoc end and export function
    const gap = before.slice(lastClose + 2);
    if (gap.trim() !== '') continue;

    results.push({ name: m[1], jsdoc: chunk.slice(lastOpen) });
  }
  return results;
}

/**
 * Extract a brace-balanced type from a string starting at the opening {.
 * Returns { type, endIndex } or null.
 */
function extractBracedType(str, startIndex) {
  if (str[startIndex] !== '{') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') { depth--; if (depth === 0) return { type: str.slice(startIndex + 1, i).trim(), endIndex: i }; }
  }
  return null;
}

/**
 * Parse a single JSDoc block into structured param/returns data.
 */
function parseJSDoc(jsdoc) {
  const params = [];
  let returns = null;
  let description = null;

  // Extract description: lines after /** that don't start with @tag
  const lines = jsdoc.split('\n').map(l => l.replace(/^\s*\*?\s?/, '').trim()).filter(Boolean);
  const descLines = [];
  for (const line of lines) {
    if (line.startsWith('/**') || line === '*/') continue;
    if (line.startsWith('@')) break;
    if (line && !line.startsWith('*')) descLines.push(line);
  }
  description = descLines.join(' ').trim() || null;

  // Extract @param tags with brace-balanced type extraction
  const tagRe = /@param\s*/g;
  let tm;
  while ((tm = tagRe.exec(jsdoc)) !== null) {
    const afterTag = jsdoc.slice(tm.index + tm[0].length);
    const braceIdx = afterTag.indexOf('{');
    if (braceIdx === -1 || braceIdx > 2) continue;

    const extracted = extractBracedType(afterTag, braceIdx);
    if (!extracted) continue;

    const type = extracted.type;
    const rest = afterTag.slice(extracted.endIndex + 1).trimStart();

    // Parse name: optional [name] or required name
    const nameMatch = rest.match(/^(\[?)([^\]\s,\-]+)\]?\s*(?:-\s*(.*))?/);
    if (!nameMatch) continue;

    const optional = nameMatch[1] === '[';
    const name = nameMatch[2].trim();
    const desc = nameMatch[3] ? nameMatch[3].trim() : null;

    const param = { name, type, optional };

    // Extract enum values from description: word|word|word
    if (desc) {
      const enumMatch = desc.match(/^('?[a-z][\w'-]*'?(?:\|'?[a-z][\w'-]*'?)+)/);
      if (enumMatch) {
        param.enum = enumMatch[1].split('|').map(v => v.replace(/'/g, ''));
      }
      const defMatch = desc.match(/\(default:\s*([^)]+)\)/);
      if (defMatch) {
        param.default = defMatch[1].trim();
      }
      if (type.includes('Function') && type !== 'Function') {
        param.reactive = true;
      }
      param.description = desc;
    } else if (type.includes('Function') && type !== 'Function') {
      param.reactive = true;
    }

    params.push(param);
  }

  // Extract @returns with brace-balanced type
  const retIdx = jsdoc.search(/@returns?\s*\{/);
  if (retIdx !== -1) {
    const afterRet = jsdoc.slice(retIdx);
    const braceStart = afterRet.indexOf('{');
    if (braceStart !== -1) {
      const extracted = extractBracedType(afterRet, braceStart);
      if (extracted) returns = extracted.type;
    }
  }

  return { params, returns, description };
}

/**
 * For component functions: separate props.* params from top-level params.
 */
function buildComponentEntry(parsed) {
  const entry = {};
  const props = {};
  let hasChildren = false;
  let childrenType = null;

  for (const p of parsed.params) {
    // Skip the root props object param
    if (p.name === 'props' && (p.type === 'Object' || p.type.startsWith('{'))) continue;

    if (p.name.startsWith('props.')) {
      const propName = p.name.slice(6);
      const prop = { type: p.type };
      if (p.enum) prop.enum = p.enum;
      if (p.default) prop.default = p.default;
      if (p.reactive) prop.reactive = true;
      if (!p.optional) prop.required = true;
      props[propName] = prop;
    } else if (p.name === 'children') {
      hasChildren = true;
      childrenType = p.type;
    }
  }

  if (Object.keys(props).length > 0) entry.props = props;
  if (hasChildren) entry.children = childrenType || true;
  if (parsed.returns) entry.returns = parsed.returns;

  return entry;
}

/**
 * For non-component functions: list params directly.
 */
function buildFunctionEntry(parsed) {
  const entry = {};
  const params = [];

  for (const p of parsed.params) {
    const param = { name: p.name, type: p.type };
    if (p.optional) param.optional = true;
    if (p.enum) param.enum = p.enum;
    if (p.default) param.default = p.default;
    if (p.description) param.description = p.description;
    params.push(param);
  }

  if (params.length > 0) entry.params = params;
  if (parsed.returns) entry.returns = parsed.returns;
  if (parsed.description) entry.description = parsed.description;

  return entry;
}

// --- Module scanners ---

function scanComponents() {
  const dir = join(src, 'components');
  const files = readdirSync(dir).filter(f => f.endsWith('.js') && !f.startsWith('_'));
  const components = {};

  for (const file of files) {
    const source = readFile(join(dir, file));
    const fns = extractFunctions(source);

    for (const fn of fns) {
      // Skip internal helpers like resetToasts
      if (fn.name === 'resetToasts') continue;

      const parsed = parseJSDoc(fn.jsdoc);

      // icon() and toast() are functions, not prop-based components
      if (fn.name === 'icon' || fn.name === 'toast') {
        components[fn.name] = buildFunctionEntry(parsed);
        components[fn.name]._type = 'function';
      } else {
        components[fn.name] = buildComponentEntry(parsed);
      }
    }

    // Scan for static methods like Card.Header
    const staticRe = /\/\*\*[\s\S]*?\*\/\s*\n\s*(\w+)\.(\w+)\s*=\s*function/g;
    let sm;
    while ((sm = staticRe.exec(source)) !== null) {
      const parentName = sm[1];
      const methodName = sm[2];
      const jsdocMatch = source.substring(0, sm.index).match(/(\/\*\*[\s\S]*?\*\/)\s*$/);
      // Sub-components are simple wrappers — note their existence
      if (components[parentName]) {
        if (!components[parentName].subComponents) components[parentName].subComponents = [];
        components[parentName].subComponents.push(methodName);
      }
    }
  }

  return components;
}

function scanCore() {
  const source = readFile(join(src, 'core', 'index.js'));
  const lifecycle = readFile(join(src, 'core', 'lifecycle.js'));
  const functions = {};

  for (const fn of extractFunctions(source)) {
    functions[fn.name] = buildFunctionEntry(parseJSDoc(fn.jsdoc));
  }

  // Add lifecycle exports
  for (const fn of extractFunctions(lifecycle)) {
    if (fn.name === 'onMount' || fn.name === 'onDestroy') {
      functions[fn.name] = buildFunctionEntry(parseJSDoc(fn.jsdoc));
    }
  }

  return functions;
}

function scanState() {
  const source = readFile(join(src, 'state', 'index.js'));
  const scheduler = readFile(join(src, 'state', 'scheduler.js'));
  const functions = {};

  for (const fn of extractFunctions(source)) {
    functions[fn.name] = buildFunctionEntry(parseJSDoc(fn.jsdoc));
  }

  // batch is exported from scheduler
  for (const fn of extractFunctions(scheduler)) {
    if (fn.name === 'batch') {
      functions[fn.name] = buildFunctionEntry(parseJSDoc(fn.jsdoc));
    }
  }

  return functions;
}

function scanRouter() {
  const source = readFile(join(src, 'router', 'index.js'));
  const functions = {};

  for (const fn of extractFunctions(source)) {
    // compileRoute is internal, skip it
    if (fn.name === 'compileRoute') continue;
    functions[fn.name] = buildFunctionEntry(parseJSDoc(fn.jsdoc));
  }

  return functions;
}

function scanCSS() {
  const indexSource = readFile(join(src, 'css', 'index.js'));
  const registrySource = readFile(join(src, 'css', 'theme-registry.js'));
  const functions = {};

  for (const fn of extractFunctions(indexSource)) {
    functions[fn.name] = buildFunctionEntry(parseJSDoc(fn.jsdoc));
  }

  for (const fn of extractFunctions(registrySource)) {
    // Skip deprecated and internal functions
    if (fn.jsdoc.includes('@deprecated')) continue;
    if (fn.name.startsWith('_') || fn.name === 'buildCSS') continue;
    functions[fn.name] = buildFunctionEntry(parseJSDoc(fn.jsdoc));
  }

  return functions;
}

// --- Architect validator ---

function scanArchitect() {
  const archDir = join(src, 'registry', 'architect');
  if (!existsSync(archDir)) return;

  const indexPath = join(archDir, 'index.json');
  if (!existsSync(indexPath)) return;

  const archIndex = JSON.parse(readFile(indexPath));

  // Load cross-cutting for component validation
  const crossPath = join(archDir, archIndex.cross_cutting || 'cross-cutting.json');
  let crossCutting = {};
  if (existsSync(crossPath)) {
    crossCutting = JSON.parse(readFile(crossPath));
  }

  // Load component registry for validation
  const compPath = join(src, 'registry', 'components.json');
  let knownComponents = new Set();
  if (existsSync(compPath)) {
    const compData = JSON.parse(readFile(compPath));
    knownComponents = new Set(Object.keys(compData.components || {}));
  }

  const errors = [];

  // Validate cross-cutting component references
  for (const [id, concern] of Object.entries(crossCutting)) {
    if (concern.components) {
      for (const comp of concern.components) {
        if (comp !== 'toast' && comp !== 'notification' && comp !== 'message' && !knownComponents.has(comp)) {
          errors.push(`cross-cutting "${id}" references unknown component: ${comp}`);
        }
      }
    }
  }

  // Validate each domain
  for (const [domainId, domainMeta] of Object.entries(archIndex.domains || {})) {
    const domainPath = join(archDir, domainMeta.file);
    if (!existsSync(domainPath)) {
      errors.push(`Domain "${domainId}" file not found: ${domainMeta.file}`);
      continue;
    }

    const domain = JSON.parse(readFile(domainPath));
    const featureIds = new Set(Object.keys(domain.features || {}));

    for (const [fid, feature] of Object.entries(domain.features || {})) {
      // Validate tier
      if (!['core', 'should', 'nice'].includes(feature.t)) {
        errors.push(`${domainId}.${fid}: invalid tier "${feature.t}"`);
      }

      // Validate weight
      if (typeof feature.w !== 'number' || feature.w < 0 || feature.w > 1) {
        errors.push(`${domainId}.${fid}: weight must be 0.0-1.0, got ${feature.w}`);
      }

      // Validate requires/implies point to valid feature IDs
      for (const dep of (feature.requires || [])) {
        if (!featureIds.has(dep)) {
          errors.push(`${domainId}.${fid}: requires unknown feature "${dep}"`);
        }
      }
      for (const dep of (feature.implies || [])) {
        if (!featureIds.has(dep)) {
          errors.push(`${domainId}.${fid}: implies unknown feature "${dep}"`);
        }
      }

      // Validate component references
      if (feature.decantr && feature.decantr.components) {
        for (const comp of feature.decantr.components) {
          if (!knownComponents.has(comp)) {
            errors.push(`${domainId}.${fid}: references unknown component "${comp}"`);
          }
        }
      }
    }

    // DAG acyclicity check via topological sort (Kahn's algorithm)
    const inDegree = new Map();
    const adjList = new Map();
    for (const fid of featureIds) {
      inDegree.set(fid, 0);
      adjList.set(fid, []);
    }
    for (const [fid, feature] of Object.entries(domain.features || {})) {
      for (const dep of (feature.requires || [])) {
        if (featureIds.has(dep)) {
          adjList.get(dep).push(fid);
          inDegree.set(fid, (inDegree.get(fid) || 0) + 1);
        }
      }
    }
    const queue = [];
    for (const [fid, deg] of inDegree) {
      if (deg === 0) queue.push(fid);
    }
    let visited = 0;
    while (queue.length > 0) {
      const node = queue.shift();
      visited++;
      for (const neighbor of (adjList.get(node) || [])) {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) queue.push(neighbor);
      }
    }
    if (visited !== featureIds.size) {
      errors.push(`${domainId}: dependency cycle detected in requires graph`);
    }

    // Validate cross_cutting references
    for (const cc of (domain.cross_cutting || [])) {
      if (!crossCutting[cc]) {
        errors.push(`${domainId}: references unknown cross-cutting concern "${cc}"`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('\nArchitect validation errors:');
    for (const err of errors) console.error(`  ✗ ${err}`);
    process.exitCode = 1;
  } else {
    const domainCount = Object.keys(archIndex.domains || {}).length;
    console.log(`\nArchitect validated: ${domainCount} domain(s), ${Object.keys(crossCutting).length} cross-cutting concerns`);
  }
}

// --- Build registry ---

const generated = new Date().toISOString().split('T')[0];
const outDir = join(src, 'registry');
mkdirSync(outDir, { recursive: true });

// Remove old monolithic registry if it exists
const oldPath = join(src, 'registry.json');
if (existsSync(oldPath)) unlinkSync(oldPath);

// --- Showcase auto-population ---

/**
 * Auto-populate showcase metadata from prop analysis.
 * Fills sections, states, and labelProp for components missing them.
 * Never overwrites manually-curated data (defaults, examples, labelProp).
 */
function autoPopulateShowcase(components) {
  const LABEL_CANDIDATES = ['label', 'title', 'placeholder', 'name', 'heading'];
  const SKIP_STATE_PROPS = new Set(['class', 'style', 'ref', 'children']);

  for (const [name, comp] of Object.entries(components)) {
    if (comp._type === 'function') continue;
    const props = comp.props || {};
    const showcase = comp.showcase || {};
    const sections = new Set(showcase.sections || []);

    // Auto-detect variant/size sections from enums
    if (props.variant?.enum?.length > 0) sections.add('variants');
    if (props.size?.enum?.length > 0) sections.add('sizes');

    // Auto-detect boolean props → states (only if not manually curated)
    if (!showcase.states) {
      const booleans = {};
      for (const [pName, meta] of Object.entries(props)) {
        if (meta.type === 'boolean' && !SKIP_STATE_PROPS.has(pName)) {
          booleans[pName] = true;
        }
      }
      if (Object.keys(booleans).length > 0) {
        showcase.states = booleans;
        sections.add('states');
      }
    } else {
      sections.add('states');
    }

    // Auto-detect labelProp (only if not manually set)
    if (!showcase.labelProp) {
      for (const candidate of LABEL_CANDIDATES) {
        if (props[candidate]?.type === 'string') {
          showcase.labelProp = candidate;
          break;
        }
      }
    }

    // Always include interactive
    sections.add('interactive');

    showcase.sections = [...sections];
    comp.showcase = showcase;
  }
}

// Scan all modules
const components = scanComponents();
autoPopulateShowcase(components);

const modules = {
  core: { description: 'DOM engine — hyperscript rendering, conditional, list, mount, lifecycle', functions: scanCore() },
  state: { description: 'Reactive primitives — signals, effects, memos, stores, batch', functions: scanState() },
  router: { description: 'Client-side routing — hash or history mode', functions: scanRouter() },
  css: { description: 'Atomic CSS engine + theme management', functions: scanCSS() },
  components: { description: 'UI components — all return HTMLElement, all accept inline styles', components },
};


function writeJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

// Write per-module detail files (preserving manually-added keys like showcase, groups)
for (const [name, data] of Object.entries(modules)) {
  const exportKey = data.functions ? 'functions' : 'components';
  const fileName = name.includes('/') ? name.replace('/', '-') : name;
  const outPath = join(outDir, `${fileName}.json`);

  // Read existing file to preserve extra keys not generated by this script
  let existing = {};
  if (existsSync(outPath)) {
    try { existing = JSON.parse(readFile(outPath)); } catch { /* ignore */ }
  }

  const output = {
    $schema: 'https://decantr.ai/schemas/module.v1.json',
    module: `decantr/${name}`,
    description: data.description,
    [exportKey]: data[exportKey]
  };

  // Preserve top-level keys we don't generate (e.g. groups in components.json)
  const generatedKeys = new Set(['$schema', 'module', 'description', exportKey]);
  for (const [key, val] of Object.entries(existing)) {
    if (!generatedKeys.has(key)) output[key] = val;
  }

  // For components: merge per-component showcase keys (manual data wins, but sections are unioned)
  if (exportKey === 'components' && existing.components) {
    for (const [compName, compData] of Object.entries(output.components)) {
      const oldComp = existing.components[compName];
      if (oldComp?.showcase) {
        const autoSections = compData.showcase?.sections || [];
        const oldSections = oldComp.showcase.sections || [];
        // Merge: old manually-curated fields override auto-populated ones
        compData.showcase = { ...(compData.showcase || {}), ...oldComp.showcase };
        // Union sections so auto-populated entries (sizes, variants) are not lost
        compData.showcase.sections = [...new Set([...oldSections, ...autoSections])];
      }
    }
  }

  writeJSON(outPath, output);
}

// Write index with summaries + export counts (preserving non-modules sections)
const indexPath = join(outDir, 'index.json');
let existingIndex = {};
if (existsSync(indexPath)) {
  try { existingIndex = JSON.parse(readFile(indexPath)); } catch { /* ignore */ }
}

const index = {
  $schema: 'https://decantr.ai/schemas/registry.v1.json',
  version: VERSION,
  generated,
  modules: {}
};

for (const [name, data] of Object.entries(modules)) {
  const exportKey = data.functions ? 'functions' : 'components';
  index.modules[`decantr/${name}`] = {
    description: data.description,
    file: `${name}.json`,
    exports: Object.keys(data[exportKey]).length
  };
}

index.modules['decantr/tags'] = {
  description: 'Proxy-based tag functions for concise markup',
  usage: 'import { tags } from \'decantr/tags\'; const { div, p } = tags; div({ class: \'card\' }, p(\'Content\'))'
};

// Include icons catalog if it exists
const iconsPath = join(outDir, 'icons.json');
if (existsSync(iconsPath)) {
  const iconData = JSON.parse(readFile(iconsPath));
  index.modules['decantr/icons'] = {
    description: `First-party icon suite — ${iconData.total} Lucide icons via CSS mask-image`,
    file: 'icons.json',
    exports: iconData.total
  };
}

// Preserve non-modules sections (archetypes, patterns, recipes, atoms, tokens, foundations)
const preservedKeys = ['archetypes', 'patterns', 'recipes', 'atoms', 'tokens', 'foundations'];
for (const key of preservedKeys) {
  if (existingIndex[key]) index[key] = existingIndex[key];
}

writeJSON(indexPath, index);

// Summary
const counts = Object.entries(modules).map(([name, data]) => {
  const exportKey = data.functions ? 'functions' : 'components';
  return [name, Object.keys(data[exportKey]).length];
});
const total = counts.reduce((sum, [, n]) => sum + n, 0);

console.log(`Registry generated: src/registry/ (${counts.length + 1} files)`);
for (const [name, count] of counts) {
  const type = name.startsWith('kit/') || name === 'components' ? 'components' : 'functions';
  const pad = Math.max(1, 20 - name.length);
  console.log(`  decantr/${name}:${' '.repeat(pad)}${count} ${type}`);
}
console.log(`  decantr/tags:${' '.repeat(15)}proxy (any HTML tag)`);
console.log(`  Total: ${total} exports`);

// Validate architect data
scanArchitect();

// Validate essence if present in project
const essencePath = join(root, 'decantr.essence.json');
if (existsSync(essencePath)) {
  try {
    const essence = JSON.parse(readFile(essencePath));
    const essenceErrors = [];

    const KNOWN_STYLES = ['auradecantism', 'clean', 'retro', 'glassmorphism', 'command-center'];

    if (essence.vintage?.style && !KNOWN_STYLES.includes(essence.vintage.style)) {
      essenceErrors.push(`vintage.style "${essence.vintage.style}" is not a registered style`);
    }
    if (essence.vintage?.mode && !['light', 'dark', 'auto'].includes(essence.vintage.mode)) {
      essenceErrors.push(`vintage.mode "${essence.vintage.mode}" is invalid`);
    }
    if (essence.vessel?.routing && !['hash', 'history'].includes(essence.vessel.routing)) {
      essenceErrors.push(`vessel.routing "${essence.vessel.routing}" is invalid`);
    }

    if (essenceErrors.length > 0) {
      console.warn('\nEssence validation warnings:');
      for (const err of essenceErrors) console.warn(`  ⚠ ${err}`);
    } else {
      console.log('Essence validated: OK');
    }
  } catch (e) {
    console.warn(`\nEssence validation: could not parse decantr.essence.json — ${e.message}`);
  }
}
