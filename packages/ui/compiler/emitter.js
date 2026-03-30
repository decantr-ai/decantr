/**
 * Decantr Compiler - Emitter
 *
 * Generates JavaScript from IR.
 * Only place that produces output strings.
 */

import { SourceMapGenerator } from './utils/source-map.js';
import { chunkFileName } from './utils/hash.js';

/**
 * @typedef {Object} EmitOutput
 * @property {string} file - Output filename
 * @property {string} code - Generated JavaScript
 * @property {string} [map] - Source map JSON
 */

/**
 * Emit JavaScript from module graph
 * @param {import('./graph.js').ModuleGraph} graph
 * @param {Object} options
 * @param {boolean} [options.sourceMaps=true]
 * @param {boolean} [options.minify=false]
 * @returns {EmitOutput[]}
 */
export function emit(graph, options = {}) {
  const { sourceMaps = true, minify = false } = options;
  const outputs = [];

  // First, emit all dynamic chunks to get their hashed filenames
  const chunkUrlMap = {};
  const chunkOutputs = [];

  for (const [chunkName, moduleIds] of graph.chunks) {
    if (chunkName === 'main') continue;
    if (moduleIds.length === 0) continue;

    const chunkOutput = emitChunk(graph, chunkName, { sourceMaps, minify, isAsync: true });
    chunkOutputs.push(chunkOutput);
    chunkUrlMap[chunkName] = `./${chunkOutput.file}`;
  }

  // Now emit main bundle with the correct chunk URLs
  const mainOutput = emitChunk(graph, 'main', { sourceMaps, minify, chunkUrlMap });
  outputs.push(mainOutput);

  // Add chunk outputs
  outputs.push(...chunkOutputs);

  return outputs;
}

/**
 * Emit a single chunk
 */
function emitChunk(graph, chunkName, options) {
  const { sourceMaps, minify, isAsync = false, chunkUrlMap = {} } = options;
  const moduleIds = graph.chunks.get(chunkName) || [];

  // Get modules in topological order
  const modules = graph.order
    .filter(id => moduleIds.includes(id))
    .map(id => graph.modules.get(id))
    .filter(Boolean);

  const sourceMap = sourceMaps ? new SourceMapGenerator({ file: `${chunkName}.js` }) : null;

  let code = '';
  let line = 0;

  // Chunk loader for main bundle
  if (chunkName === 'main') {
    code += emitChunkLoader(chunkUrlMap);
    line += countLines(code);
  }

  // Check if any module needs async IIFE
  const needsAsyncWrapper = modules.some(m => m.needsAsyncIIFE) || isAsync;

  // Start wrapper - async chunks assign the Promise to window.__decantrChunks
  if (isAsync) {
    // Async chunks: assign the IIFE promise directly so loader can await it
    code += `window.__decantrChunks["${chunkName}"] = (async function() {\n`;
    line++;
  } else if (needsAsyncWrapper) {
    code += '(async function() {\n';
    line++;
  } else if (chunkName === 'main') {
    code += '(function() {\n';
    line++;
  }

  // Module registry - main bundle creates global, chunks use it
  if (chunkName === 'main') {
    code += 'window.__modules = {};\n';
    code += 'const __modules = window.__modules;\n';
    line += 2;
  } else {
    code += 'const __modules = window.__modules;\n';
    line++;
  }

  // Emit each module
  for (const mod of modules) {
    const moduleCode = emitModule(mod, graph, sourceMap, line);
    code += moduleCode.code;
    line += moduleCode.lines;
  }

  // Export chunk if not main - return the exports from the async IIFE
  if (isAsync) {
    const chunkExports = getChunkExports(modules);
    code += `\nreturn { ${chunkExports} };\n`;
    line += 2;
  }

  // End wrapper
  if (isAsync) {
    // Async chunks: close the IIFE that's assigned to window.__decantrChunks
    code += '})();\n';
  } else if (needsAsyncWrapper) {
    code += '})();\n';
  } else if (chunkName === 'main') {
    // Run entry point
    const entryMod = graph.modules.get(graph.entryId);
    if (entryMod) {
      code += `\n__modules["${entryMod.id}"];\n`;
      line += 2;
    }
    code += '})();\n';
  }

  // Generate filename
  const fileName = minify
    ? chunkFileName(chunkName, code)
    : `${chunkName}.js`;

  return {
    file: fileName,
    code,
    map: sourceMap ? sourceMap.toString() : null
  };
}

/**
 * Emit chunk loader code
 * @param {Object<string, string>} chunkUrlMap - Map of chunk names to their hashed URLs
 */
function emitChunkLoader(chunkUrlMap = {}) {
  return `
// Chunk loader
window.__decantrChunks = {};
window.__decantrLoadChunk = function(name) {
  if (window.__decantrChunks[name]) {
    // Chunk may be a Promise (async chunks) - always resolve it
    return Promise.resolve(window.__decantrChunks[name]);
  }
  return new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.src = ${JSON.stringify(chunkUrlMap)}[name] || ('./' + name + '.js');
    script.onload = function() {
      // Chunk may be a Promise (async chunks) - resolve through it
      Promise.resolve(window.__decantrChunks[name]).then(resolve, reject);
    };
    script.onerror = function() {
      reject(new Error('Chunk load failed: ' + name));
    };
    document.head.appendChild(script);
  });
};

`;
}

/**
 * Emit a single module
 */
function emitModule(mod, graph, sourceMap, startLine) {
  const source = mod._processedSource || mod.ast.rawSource;
  const transformed = transformSource(source, mod, graph);

  // Add source map entry
  if (sourceMap) {
    const srcIndex = sourceMap.addSource(mod.relPath, source);
    sourceMap.addMapping({
      genLine: startLine,
      genCol: 0,
      srcIndex,
      srcLine: 0,
      srcCol: 0
    });
  }

  let code = '';

  // Module wrapper - always use IIFE for isolation
  // (hoisting without scope analysis would cause variable conflicts)
  if (mod.needsAsyncIIFE) {
    code += `// ${mod.relPath}\n`;
    code += `__modules["${mod.id}"] = await (async function() {\n`;
    code += transformed;
    code += `\nreturn { ${getModuleExports(mod)} };\n`;
    code += `})();\n\n`;
  } else {
    // IIFE wrapper for all modules
    code += `// ${mod.relPath}\n`;
    code += `__modules["${mod.id}"] = (function() {\n`;
    code += transformed;
    code += `\nreturn { ${getModuleExports(mod)} };\n`;
    code += `})();\n\n`;
  }

  return {
    code,
    lines: countLines(code)
  };
}

/**
 * Transform source - rewrite imports/exports using AST byte offsets
 */
function transformSource(source, mod, graph) {
  const replacements = [];

  // Rewrite imports
  for (const imp of mod.ast.imports) {
    if (imp.start === undefined || imp.end === undefined) continue;

    const depId = findDependency(mod, imp.source);
    let replacement = '';

    switch (imp.type) {
      case 'default':
        replacement = `const ${imp.name} = __modules["${depId}"].default;`;
        break;

      case 'named': {
        const bindings = imp.names.map(n =>
          n.imported === n.local ? n.local : `${n.imported}: ${n.local}`
        ).join(', ');
        replacement = `const { ${bindings} } = __modules["${depId}"];`;
        break;
      }

      case 'namespace':
        replacement = `const ${imp.name} = __modules["${depId}"];`;
        break;

      case 'side-effect':
        replacement = `__modules["${depId}"];`;
        break;

      case 'dynamic': {
        const chunkName = getChunkForModule(graph, depId);
        replacement = `__decantrLoadChunk("${chunkName}")`;
        break;
      }
    }

    replacements.push({ start: imp.start, end: imp.end, replacement });
  }

  // Rewrite exports
  for (const exp of mod.ast.exports) {
    if (exp.start === undefined || exp.end === undefined) continue;

    if (exp.type === 'named' && exp.source) {
      // Re-export: export { x } from './other' → remove entirely
      replacements.push({ start: exp.start, end: exp.end, replacement: '' });
    } else if (exp.type === 'all') {
      // export * from './other' → remove entirely
      replacements.push({ start: exp.start, end: exp.end, replacement: '' });
    } else if (exp.type === 'named' && !exp.source) {
      // export { x, y } → remove entirely
      replacements.push({ start: exp.start, end: exp.end, replacement: '' });
    } else if (exp.type === 'declaration' && exp.declStart !== undefined) {
      // export const x = 1 → const x = 1 (strip 'export ')
      replacements.push({ start: exp.start, end: exp.declStart, replacement: '' });
    } else if (exp.type === 'default' && exp.declStart !== undefined) {
      // export default function/class/expr → strip 'export default '
      replacements.push({ start: exp.start, end: exp.declStart, replacement: '' });
    }
  }

  // Deduplicate overlapping replacements (e.g., multi-binding exports)
  const seen = new Set();
  const uniqueReplacements = replacements.filter(r => {
    const key = `${r.start}:${r.end}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Apply replacements in reverse order (so offsets stay valid)
  uniqueReplacements.sort((a, b) => b.start - a.start);

  let result = source;
  for (const { start, end, replacement } of uniqueReplacements) {
    result = result.slice(0, start) + replacement + result.slice(end);
  }

  return result;
}

/**
 * Get exports object entries
 */
function getModuleExports(mod) {
  const entries = [];

  for (const [name, exp] of Object.entries(mod.resolvedExports)) {
    if (name === '*') continue;

    if (exp.kind === 'default') {
      entries.push(`default: ${exp.name || 'undefined'}`);
    } else if (exp.kind === 'local' || exp.kind === 'declaration') {
      if (name === exp.name) {
        entries.push(name);
      } else {
        entries.push(`${name}: ${exp.name}`);
      }
    } else if (exp.kind === 're-export' && exp.from) {
      entries.push(`get ${name}() { return __modules["${exp.from}"].${exp.name}; }`);
    }
  }

  return entries.join(', ');
}

/**
 * Get chunk exports for dynamic imports
 */
function getChunkExports(modules) {
  const entries = [];

  for (const mod of modules) {
    for (const [name] of Object.entries(mod.resolvedExports)) {
      if (name === '*') continue;
      entries.push(`${name}: __modules["${mod.id}"].${name}`);
    }
  }

  return entries.join(', ');
}

/**
 * Find dependency by specifier
 */
function findDependency(mod, specifier) {
  for (const dep of mod.dependencies) {
    if (dep.specifier === specifier) {
      return dep.moduleId;
    }
  }
  return null;
}

/**
 * Get chunk name for a module
 */
function getChunkForModule(graph, moduleId) {
  for (const [chunkName, ids] of graph.chunks) {
    if (ids.includes(moduleId)) {
      return chunkName;
    }
  }
  return 'main';
}

/**
 * Count lines in string
 */
function countLines(str) {
  return (str.match(/\n/g) || []).length + 1;
}
