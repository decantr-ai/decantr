/**
 * Decantr Compiler - Optimizer
 *
 * Prepares IR for efficient output.
 */

/**
 * Optimize the module graph
 * @param {import('./graph.js').ModuleGraph} graph
 * @param {Object} options
 * @param {boolean} [options.minify=true]
 */
export function optimize(graph, options = {}) {
  const { minify = true } = options;

  if (minify) {
    // Shorten module IDs
    shortenModuleIds(graph);

    // Mangle identifiers (scope-aware)
    // Note: Full identifier mangling would require proper scope analysis
    // For now, we leave this to the existing minifier
  }

  // Constant folding
  foldConstants(graph);

  // Icon pruning (Decantr-specific)
  pruneIcons(graph);
}

/**
 * Shorten module IDs for smaller output
 */
function shortenModuleIds(graph) {
  const idMap = new Map();
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let index = 0;

  // Generate short IDs
  function nextId() {
    let id = '';
    let n = index++;

    do {
      id = chars[n % chars.length] + id;
      n = Math.floor(n / chars.length) - 1;
    } while (n >= 0);

    return id;
  }

  // Map old IDs to new
  for (const id of graph.order) {
    idMap.set(id, nextId());
  }

  // Update all references
  const newModules = new Map();
  const newPathToId = new Map();
  const newChunks = new Map();

  for (const [oldId, mod] of graph.modules) {
    const newId = idMap.get(oldId);
    mod.id = newId;

    // Update dependencies
    for (const dep of mod.dependencies) {
      dep.moduleId = idMap.get(dep.moduleId) || dep.moduleId;
    }

    // Update dependents
    mod.dependents = mod.dependents.map(id => idMap.get(id) || id);

    // Update resolved exports (re-export references)
    for (const [name, exp] of Object.entries(mod.resolvedExports)) {
      if (exp.from) {
        exp.from = idMap.get(exp.from) || exp.from;
      }
      // Handle re-export-all array
      if (Array.isArray(exp)) {
        for (const reexp of exp) {
          if (reexp.from) {
            reexp.from = idMap.get(reexp.from) || reexp.from;
          }
        }
      }
    }

    newModules.set(newId, mod);
  }

  for (const [path, oldId] of graph.pathToId) {
    newPathToId.set(path, idMap.get(oldId) || oldId);
  }

  for (const [chunk, ids] of graph.chunks) {
    newChunks.set(chunk, ids.map(id => idMap.get(id) || id));
  }

  graph.modules = newModules;
  graph.pathToId = newPathToId;
  graph.chunks = newChunks;
  graph.entryId = idMap.get(graph.entryId) || graph.entryId;
  graph.order = graph.order.map(id => idMap.get(id) || id);
}

/**
 * Fold constant expressions
 */
function foldConstants(graph) {
  for (const mod of graph.modules.values()) {
    if (!mod._processedSource && !mod.ast.rawSource) continue;

    let source = mod._processedSource || mod.ast.rawSource;

    // Fold simple cases
    // true && x → x
    source = source.replace(/\btrue\s*&&\s*/g, '');

    // false || x → x
    source = source.replace(/\bfalse\s*\|\|\s*/g, '');

    // NOTE: String concatenation folding disabled - regex-based approach
    // incorrectly matches across string boundaries (e.g., treats '+' inside
    // a string as the concatenation operator). Would need proper parsing.
    // source = source.replace(/'([^']*)'\s*\+\s*'([^']*)'/g, "'$1$2'");
    // source = source.replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, '"$1$2"');

    mod._processedSource = source;
  }
}

/**
 * Prune unused icons (Decantr-specific optimization)
 */
function pruneIcons(graph) {
  // Collect all icon references
  const usedIcons = new Set();

  for (const mod of graph.modules.values()) {
    const source = mod._processedSource || mod.ast.rawSource;
    if (!source) continue;

    // Match Icon component usage: Icon({ name: 'x' })
    const iconMatches = source.matchAll(/Icon\s*\(\s*\{\s*name:\s*['"]([^'"]+)['"]/g);
    for (const match of iconMatches) {
      usedIcons.add(match[1]);
    }

    // Match icon references in data
    const dataMatches = source.matchAll(/icon:\s*['"]([^'"]+)['"]/g);
    for (const match of dataMatches) {
      usedIcons.add(match[1]);
    }
  }

  // Store for use by icon extraction
  graph._usedIcons = usedIcons;
}

/**
 * Get shortest identifier that doesn't conflict
 */
function generateShortId(index) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_';
  let id = '';
  let n = index;

  do {
    id = chars[n % chars.length] + id;
    n = Math.floor(n / chars.length) - 1;
  } while (n >= 0);

  // Avoid reserved words
  const reserved = new Set(['do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'this', 'true', 'void', 'with']);
  if (reserved.has(id)) {
    return generateShortId(index + 52); // Skip ahead
  }

  return id;
}
