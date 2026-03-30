/**
 * Decantr Compiler Lint Rule — redos
 *
 * Lightweight detection of regex patterns that can cause catastrophic
 * backtracking (ReDoS). Flags regexes containing nested quantifiers such as
 * (a+)+, (a*)*, (a|b+)+ etc. where an outer quantifier wraps a group that
 * itself contains a quantifier.
 *
 * This is a heuristic — it catches the most common dangerous patterns without
 * full automata analysis.
 */

// Matches regex literals in JS source: /body/flags
// Skips division operators by requiring a non-word/non-digit/non-) char before /
const REGEX_LITERAL = /(?:^|[=(:,[!&|?+\-*~])\s*\/((?:[^/\\\n]|\\.)+)\/([gimsuy]*)/g;

/**
 * Check whether a regex body contains nested quantifiers.
 * Looks for patterns where a group `(...)` with an inner quantifier is itself
 * followed by a quantifier: `(X+)+`, `(X*)*`, `(X+)*`, `(X|Y+)+`, etc.
 * @param {string} body
 * @returns {boolean}
 */
function hasNestedQuantifiers(body) {
  // Pattern: closing paren of a group followed by a quantifier (+, *, {n,})
  // where the group itself contains a quantifier (+, *, {n,}, ?)
  // We scan for )+, )*, ){n,} and then check if the group interior has a quantifier
  const OUTER_QUANT = /\)([+*]|\{[0-9]+,[0-9]*\})/g;
  let m;
  while ((m = OUTER_QUANT.exec(body)) !== null) {
    // Find the matching open paren for this close paren
    const closeIdx = m.index;
    let depth = 0;
    let openIdx = -1;
    for (let i = closeIdx; i >= 0; i--) {
      if (body[i] === ')') depth++;
      else if (body[i] === '(') {
        depth--;
        if (depth === 0) {
          openIdx = i;
          break;
        }
      }
    }
    if (openIdx === -1) continue;
    const groupInterior = body.slice(openIdx + 1, closeIdx);
    // Check if there's a quantifier inside the group
    if (/[+*?]|\{[0-9]/.test(groupInterior)) {
      return true;
    }
  }
  return false;
}

export function redos(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource } = mod.ast || {};
    if (!rawSource) continue;

    REGEX_LITERAL.lastIndex = 0;
    let match;
    while ((match = REGEX_LITERAL.exec(rawSource)) !== null) {
      const body = match[1];
      if (hasNestedQuantifiers(body)) {
        mod._lintIssues = mod._lintIssues || [];
        mod._lintIssues.push({
          rule: 'redos',
          loc: { start: match.index },
          message: `Regex '/${body}/${match[2]}' contains nested quantifiers that may cause catastrophic backtracking (ReDoS)`,
          severity: 'error',
        });
      }
    }
  }
}
