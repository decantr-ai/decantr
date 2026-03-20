/**
 * Transform: Dead Code Elimination
 *
 * Remove if(false){}, dev guards, etc.
 */

/**
 * @param {import('../graph.js').ModuleGraph} graph
 */
export function deadCode(graph) {
  for (const mod of graph.modules.values()) {
    if (!mod.ast.rawSource) continue;

    let source = mod.ast.rawSource;

    // Remove if(false) blocks
    source = removeIfFalse(source);

    // Remove if(process.env.NODE_ENV === 'development') blocks in production
    source = removeDevGuards(source);

    // Remove console.* in production (optional, controlled by config)
    // source = removeConsole(source);

    mod._processedSource = source;
  }
}

/**
 * Remove if(false) { ... } blocks
 */
function removeIfFalse(source) {
  // Simple pattern matching - not full parsing
  // Matches: if (false) { ... } or if(false){ ... }
  const pattern = /if\s*\(\s*false\s*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  return source.replace(pattern, '/* [removed: if(false)] */');
}

/**
 * Remove development-only code blocks
 */
function removeDevGuards(source) {
  // Match: if (process.env.NODE_ENV === 'development') { ... }
  const patterns = [
    /if\s*\(\s*process\.env\.NODE_ENV\s*===?\s*['"]development['"]\s*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,
    /if\s*\(\s*['"]development['"]\s*===?\s*process\.env\.NODE_ENV\s*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,
  ];

  for (const pattern of patterns) {
    source = source.replace(pattern, '/* [removed: dev-only] */');
  }

  return source;
}

/**
 * Remove console.* calls (optional)
 */
function removeConsole(source) {
  // Match console.log(...), console.warn(...), etc.
  const pattern = /console\.(log|warn|info|debug|trace)\s*\([^)]*\)\s*;?/g;
  return source.replace(pattern, '/* [removed: console] */');
}
