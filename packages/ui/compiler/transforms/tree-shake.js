/**
 * Transform: Tree Shake
 *
 * Eliminate unused exports from modules.
 */

/**
 * @param {import('../graph.js').ModuleGraph} graph
 */
export function treeShake(graph) {
  for (const mod of graph.modules.values()) {
    // Skip entry point
    if (mod.id === graph.entryId) continue;

    // Skip side-effect modules
    if (mod.usedExports.has('*side-effect*')) continue;

    // Check if module has any used exports
    const hasUsedExports = Array.from(mod.usedExports).some(
      name => name !== '*side-effect*'
    );

    // If no exports are used but module is a dependency, keep minimal
    if (!hasUsedExports && mod.dependents.length > 0) {
      // Mark for minimal output (just side effects)
      mod._treeshake = 'minimal';
    }

    // Mark unused exports for removal
    const unusedExports = [];
    for (const name of Object.keys(mod.resolvedExports)) {
      if (name !== '*' && !mod.usedExports.has(name)) {
        unusedExports.push(name);
      }
    }

    if (unusedExports.length > 0) {
      mod._unusedExports = unusedExports;
    }
  }

  // Remove completely unused modules
  const usedModules = new Set();
  collectUsedModules(graph, graph.entryId, usedModules);

  for (const [id, mod] of graph.modules) {
    if (!usedModules.has(id)) {
      graph.modules.delete(id);
      graph.pathToId.delete(mod.file);

      // Remove from chunks
      for (const [chunkName, moduleIds] of graph.chunks) {
        const index = moduleIds.indexOf(id);
        if (index !== -1) {
          moduleIds.splice(index, 1);
        }
      }
    }
  }

  // Update order
  graph.order = graph.order.filter(id => usedModules.has(id));
}

/**
 * Collect all modules reachable from entry, skipping re-export-only
 * dependencies whose target module has no used exports.
 */
function collectUsedModules(graph, id, used) {
  if (used.has(id)) return;
  used.add(id);

  const mod = graph.modules.get(id);
  if (!mod) return;

  for (const dep of mod.dependencies) {
    if (isReExportOnlyDependency(mod, dep)) {
      const depMod = graph.modules.get(dep.moduleId);
      if (depMod && depMod.usedExports.size === 0) {
        continue; // Skip — no exports from this sub-module are used
      }
    }
    collectUsedModules(graph, dep.moduleId, used);
  }
}

/**
 * Check if a dependency exists ONLY because of re-exports
 * (not because the module itself imports and uses values from it)
 */
function isReExportOnlyDependency(mod, dep) {
  const hasDirectImport = mod.ast.imports.some(
    imp => imp.source === dep.specifier
  );
  if (hasDirectImport) return false;

  // Check if dependency is from a re-export-all (export * from '...').
  // These are conservative — we can't determine which names come from which
  // source module, so always follow these edges.
  const hasReExportAll = mod.ast.exports.some(
    exp => exp.type === 'all' && exp.source === dep.specifier
  );
  if (hasReExportAll) return false;

  const hasReExport = mod.ast.exports.some(
    exp => exp.source === dep.specifier
  );
  return hasReExport;
}
