/**
 * Decantr Compiler Lint Rule — unused-assignment
 *
 * Detects assignments of the form `x = expr` where the variable `x` is never
 * read after the assignment point within the same module source.
 * Scans for bare assignment statements (not declarations) using a simple
 * identifier-then-equals pattern, then checks whether the name appears
 * after the match.
 */

// Matches `identifier =` that is NOT preceded by let/const/var/function/class
// and is NOT `==`, `!=`, `<=`, `>=`, `=>`, `+=`, `-=`, `*=`, `/=`, etc.
// Group 1: identifier, capture position via match.index
const ASSIGNMENT_PATTERN = /(?<![let|const|var|.])\b([A-Za-z_$][\w$]*)\s*=(?!=)/g;

// Tokens that indicate a declaration, not a plain assignment
const DECLARATION_KEYWORDS = /\b(?:let|const|var|function|class)\s+$/;

export function unusedAssignment(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource } = mod.ast || {};
    if (!rawSource) continue;

    ASSIGNMENT_PATTERN.lastIndex = 0;
    let match;
    while ((match = ASSIGNMENT_PATTERN.exec(rawSource)) !== null) {
      const name = match[1];
      const assignStart = match.index;

      // Skip if this is part of a variable declaration
      const before = rawSource.slice(0, assignStart);
      if (DECLARATION_KEYWORDS.test(before)) continue;

      // The assignment value starts after the `=`; find end of statement (`;` or newline)
      const afterAssign = rawSource.slice(assignStart + match[0].length);
      const stmtEnd = afterAssign.search(/;|\n/);
      const assignEnd =
        assignStart + match[0].length + (stmtEnd >= 0 ? stmtEnd + 1 : afterAssign.length);

      const afterAssignment = rawSource.slice(assignEnd);
      const usagePattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (!usagePattern.test(afterAssignment)) {
        mod._lintIssues = mod._lintIssues || [];
        mod._lintIssues.push({
          rule: 'unused-assignment',
          name,
          loc: { start: assignStart },
          message: `Value assigned to '${name}' is never read after this assignment`,
          severity: 'warn',
        });
      }
    }
  }
}
