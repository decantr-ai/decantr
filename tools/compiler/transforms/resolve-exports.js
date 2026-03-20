/**
 * Transform: Resolve Exports
 *
 * Wire up export resolution across modules.
 */

/**
 * @param {import('../graph.js').ModuleGraph} graph
 */
export function resolveExports(graph) {
  for (const mod of graph.modules.values()) {
    const exports = mod.ast.exports;

    for (const exp of exports) {
      switch (exp.type) {
        case 'default':
          mod.resolvedExports['default'] = {
            kind: 'default',
            name: exp.name,
            loc: exp.loc
          };
          break;

        case 'named':
          for (const { local, exported } of exp.names) {
            if (exp.source) {
              // Re-export: export { x } from './other'
              const depId = findDependency(mod, exp.source);
              mod.resolvedExports[exported] = {
                kind: 're-export',
                from: depId,
                name: local,
                loc: exp.loc
              };
            } else {
              // Local export: export { x }
              mod.resolvedExports[exported] = {
                kind: 'local',
                name: local,
                loc: exp.loc
              };
            }
          }
          break;

        case 'all':
          // export * from './other'
          const depId = findDependency(mod, exp.source);
          if (depId) {
            // Mark as re-export-all
            mod.resolvedExports['*'] = mod.resolvedExports['*'] || [];
            mod.resolvedExports['*'].push({
              kind: 're-export-all',
              from: depId,
              as: exp.name, // null or namespace name
              loc: exp.loc
            });
          }
          break;

        case 'declaration':
          // export const/function/class
          mod.resolvedExports[exp.name] = {
            kind: 'declaration',
            name: exp.name,
            loc: exp.loc
          };
          break;
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
