/**
 * Decantr Compiler Lint Rule — superfluous-arguments
 *
 * Detects function call sites where more arguments are passed than the
 * function declaration accepts. Uses `topLevel` declarations that include
 * a `params` count, then scans the module source for call sites.
 *
 * Only covers top-level named functions declared within the same module.
 * Does not handle rest parameters (...args) — those accept any arity.
 */

/**
 * Count the arguments in a call argument list string.
 * Handles nested parens/brackets/braces by tracking depth.
 * Returns 0 for an empty argument list.
 * @param {string} argsStr - content between the outer parentheses of the call
 * @returns {number}
 */
function countArguments(argsStr) {
  const trimmed = argsStr.trim();
  if (!trimmed) return 0;

  let count = 1;
  let depth = 0;
  for (const ch of trimmed) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ',' && depth === 0) count++;
  }
  return count;
}

/**
 * Extract the argument list string for a call site found at `callStart` in
 * `source`. Scans forward from the `(` after the function name.
 * @param {string} source
 * @param {number} callStart - index of the opening `(`
 * @returns {string|null}
 */
function extractArgList(source, callStart) {
  let depth = 0;
  let i = callStart;
  let start = -1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '(' && depth === 0) {
      start = i + 1;
      depth++;
    } else if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) {
        return source.slice(start, i);
      }
    }
    i++;
  }
  return null;
}

export function superfluousArguments(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource, topLevel } = mod.ast || {};
    if (!rawSource || !topLevel) continue;

    for (const decl of topLevel) {
      // Only consider function declarations with known param counts
      if (decl.kind !== 'function') continue;
      if (typeof decl.params !== 'number') continue;
      // Rest parameters accept any arity — skip
      if (decl.hasRest) continue;

      const name = decl.name;
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match call sites: name followed by optional whitespace then `(`
      const callPattern = new RegExp(`\\b${escapedName}\\s*(\\()`, 'g');

      let callMatch;
      while ((callMatch = callPattern.exec(rawSource)) !== null) {
        // The opening paren is at callMatch.index + (callMatch[0].length - 1)
        const parenIndex = callMatch.index + callMatch[0].length - 1;
        const argStr = extractArgList(rawSource, parenIndex);
        if (argStr === null) continue;

        const argCount = countArguments(argStr);
        if (argCount > decl.params) {
          mod._lintIssues = mod._lintIssues || [];
          mod._lintIssues.push({
            rule: 'superfluous-arguments',
            name,
            loc: { start: callMatch.index },
            message: `'${name}' called with ${argCount} argument${argCount !== 1 ? 's' : ''} but only accepts ${decl.params}`,
            severity: 'warn',
          });
        }
      }
    }
  }
}
