/**
 * Transform: Mark Hoistable
 *
 * Flag modules that can be scope-hoisted (no wrapping needed).
 */

/**
 * @param {import('../graph.js').ModuleGraph} graph
 */
export function markHoistable(graph) {
  // Check for circular dependencies
  const circular = graph.detectCircularDependencies();
  const circularModules = new Set();

  for (const cycle of circular) {
    for (const id of cycle) {
      circularModules.add(id);
    }
  }

  // Add warnings for circular deps
  for (const cycle of circular) {
    const paths = cycle.map(id => graph.modules.get(id)?.relPath).filter(Boolean);
    graph.warnings.push({
      type: 'circular',
      message: `Circular dependency: ${paths.join(' → ')}`,
      cycle: paths
    });
  }

  for (const mod of graph.modules.values()) {
    // Can't hoist if:
    // 1. Has top-level await
    // 2. Part of circular dependency
    // 3. Uses eval or with
    // 4. Has side effects in top-level code that depend on import order

    mod.hoistable = true;

    // Top-level await
    if (mod.ast.hasTopLevelAwait) {
      mod.hoistable = false;
      mod.needsAsyncIIFE = true;
    }

    // Circular dependency
    if (circularModules.has(mod.id)) {
      mod.hoistable = false;
      mod._circular = true;
    }

    // Check for eval/with (basic detection)
    if (mod.ast.rawSource) {
      if (/\beval\s*\(/.test(mod.ast.rawSource) ||
          /\bwith\s*\(/.test(mod.ast.rawSource)) {
        mod.hoistable = false;
      }
    }

    // Framework modules are generally hoistable
    if (mod.isFramework) {
      // Already set above, but confirm
      mod.hoistable = mod.hoistable && !mod.ast.hasTopLevelAwait;
    }
  }

  // Propagate non-hoistability up through dependents
  let changed = true;
  while (changed) {
    changed = false;

    for (const mod of graph.modules.values()) {
      if (!mod.hoistable) continue;

      // If any dependency needs async IIFE, we might need to wait for it
      for (const dep of mod.dependencies) {
        const depMod = graph.modules.get(dep.moduleId);
        if (depMod?.needsAsyncIIFE && dep.type === 'static') {
          // Static dependency with TLA - we need async IIFE too
          mod.needsAsyncIIFE = true;
          mod.hoistable = false;
          changed = true;
        }
      }
    }
  }
}
