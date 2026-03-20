/**
 * Transform: Mark Used Exports
 *
 * Analyze what's actually imported from each module.
 */

/**
 * @param {import('../graph.js').ModuleGraph} graph
 */
export function markUsed(graph) {
  // Start from entry point - everything exported is "used"
  const entryMod = graph.modules.get(graph.entryId);
  if (!entryMod) return;

  // Entry point exports are used
  for (const name of Object.keys(entryMod.resolvedExports)) {
    entryMod.usedExports.add(name);
  }

  // Walk imports and mark usage
  for (const mod of graph.modules.values()) {
    for (const imp of mod.ast.imports) {
      const depId = findDependency(mod, imp.source);
      if (!depId) continue;

      const depMod = graph.modules.get(depId);
      if (!depMod) continue;

      switch (imp.type) {
        case 'default':
          depMod.usedExports.add('default');
          break;

        case 'named':
          for (const { imported } of imp.names) {
            depMod.usedExports.add(imported);
          }
          break;

        case 'namespace':
          // Namespace import uses everything
          for (const name of Object.keys(depMod.resolvedExports)) {
            depMod.usedExports.add(name);
          }
          break;

        case 'side-effect':
          // Side-effect imports mark module as needed but no specific exports
          depMod.usedExports.add('*side-effect*');
          break;

        case 'dynamic':
          // Dynamic imports - treat as using default or all exports
          depMod.usedExports.add('default');
          break;
      }
    }
  }

  // Propagate through re-exports
  propagateUsage(graph);
}

/**
 * Propagate usage through re-export chains
 */
function propagateUsage(graph) {
  let changed = true;
  let iterations = 0;
  const maxIterations = graph.modules.size * 2;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const mod of graph.modules.values()) {
      for (const [name, exp] of Object.entries(mod.resolvedExports)) {
        if (!mod.usedExports.has(name)) continue;

        if (exp.kind === 're-export' && exp.from) {
          const fromMod = graph.modules.get(exp.from);
          if (fromMod && !fromMod.usedExports.has(exp.name)) {
            fromMod.usedExports.add(exp.name);
            changed = true;
          }
        }

        // Handle re-export-all
        if (name === '*' && Array.isArray(exp)) {
          for (const reexp of exp) {
            if (reexp.from) {
              const fromMod = graph.modules.get(reexp.from);
              if (fromMod) {
                // Mark all exports as used
                for (const expName of Object.keys(fromMod.resolvedExports)) {
                  if (!fromMod.usedExports.has(expName)) {
                    fromMod.usedExports.add(expName);
                    changed = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
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
