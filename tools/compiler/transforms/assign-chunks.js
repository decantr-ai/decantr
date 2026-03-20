/**
 * Transform: Assign Chunks
 *
 * Group dynamic imports into separate chunks.
 */

/**
 * @param {import('../graph.js').ModuleGraph} graph
 */
export function assignChunks(graph) {
  // Find all dynamic import targets
  const dynamicTargets = new Set();

  for (const mod of graph.modules.values()) {
    for (const dep of mod.dependencies) {
      if (dep.type === 'dynamic') {
        dynamicTargets.add(dep.moduleId);
      }
    }
  }

  // Each dynamic target becomes a chunk
  for (const targetId of dynamicTargets) {
    const targetMod = graph.modules.get(targetId);
    if (!targetMod) continue;

    // Generate chunk name from file path
    const chunkName = generateChunkName(targetMod.relPath);

    // Collect all modules reachable from this target
    // that aren't already in main chunk
    const chunkModules = [];
    collectChunkModules(graph, targetId, chunkModules, dynamicTargets);

    if (chunkModules.length > 0) {
      // Register chunk
      graph.chunks.set(chunkName, chunkModules);

      // Update module chunk assignments
      for (const id of chunkModules) {
        const mod = graph.modules.get(id);
        if (mod) {
          mod.chunk = chunkName;
        }
      }

      // Remove from main chunk
      const mainChunk = graph.chunks.get('main');
      graph.chunks.set('main', mainChunk.filter(id => !chunkModules.includes(id)));
    }
  }
}

/**
 * Generate chunk name from file path
 */
function generateChunkName(relPath) {
  return relPath
    .replace(/^src\//, '')
    .replace(/\.js$/, '')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '');
}

/**
 * Collect modules for a chunk
 * Stops at other dynamic import boundaries
 */
function collectChunkModules(graph, id, collected, dynamicBoundaries) {
  if (collected.includes(id)) return;

  const mod = graph.modules.get(id);
  if (!mod) return;

  // Skip if already in main chunk and also imported statically by main
  const mainChunk = graph.chunks.get('main');
  if (mainChunk.includes(id)) {
    // Check if this is also statically imported
    // If so, keep in main, don't add to chunk
    const isStaticallyImportedByMain = hasStaticPathFromEntry(graph, id);
    if (isStaticallyImportedByMain) {
      return;
    }
  }

  collected.push(id);

  // Follow static dependencies only
  for (const dep of mod.dependencies) {
    if (dep.type === 'static') {
      // Don't cross into other dynamic boundaries
      if (!dynamicBoundaries.has(dep.moduleId)) {
        collectChunkModules(graph, dep.moduleId, collected, dynamicBoundaries);
      }
    }
  }
}

/**
 * Check if module has static path from entry
 */
function hasStaticPathFromEntry(graph, targetId) {
  const visited = new Set();

  function visit(id) {
    if (id === targetId) return true;
    if (visited.has(id)) return false;
    visited.add(id);

    const mod = graph.modules.get(id);
    if (!mod) return false;

    for (const dep of mod.dependencies) {
      if (dep.type === 'static' && visit(dep.moduleId)) {
        return true;
      }
    }

    return false;
  }

  return visit(graph.entryId);
}
