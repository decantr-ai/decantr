/**
 * Decantr Compiler - unused-variable lint rule
 *
 * Flags top-level declarations that are never referenced after their
 * declaration point within the same module source.
 * Skips framework modules and exported declarations.
 */

export function unusedVariable(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource, topLevel } = mod.ast || {};
    if (!topLevel || !rawSource) continue;
    for (const decl of topLevel) {
      if (decl.exported) continue;
      const name = decl.name;
      const declEnd = decl.loc?.end || 0;
      const afterDecl = rawSource.slice(declEnd);
      const usagePattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (!usagePattern.test(afterDecl)) {
        mod._lintIssues = mod._lintIssues || [];
        mod._lintIssues.push({
          rule: 'unused-variable',
          name,
          loc: decl.loc,
          message: `'${name}' is declared but never used`,
          severity: 'warn',
        });
      }
    }
  }
}
