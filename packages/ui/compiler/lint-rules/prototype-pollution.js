/**
 * Decantr Compiler Lint Rule — prototype-pollution
 *
 * Detects dynamic bracket-notation property assignments (obj[variable] = value)
 * where the bracket content is a variable identifier rather than a string or
 * numeric literal. An attacker-controlled key such as "__proto__" or
 * "constructor" can pollute Object.prototype.
 */

// Matches word[word] = but NOT word['...'] = or word["..."] = or word[digit] =
const DYNAMIC_ASSIGN = /(\w+)\[(\w+)\]\s*=/g;
// Reject if the key is purely numeric (array index)
const NUMERIC = /^\d+$/;

export function prototypePollution(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource } = mod.ast;
    if (!rawSource) continue;

    DYNAMIC_ASSIGN.lastIndex = 0;
    let match;
    while ((match = DYNAMIC_ASSIGN.exec(rawSource)) !== null) {
      const key = match[2];
      // Skip numeric literals (e.g. arr[0] = x)
      if (NUMERIC.test(key)) continue;

      // The regex already excludes quoted strings because quotes are not \w
      mod._lintIssues = mod._lintIssues || [];
      mod._lintIssues.push({
        rule: 'prototype-pollution',
        loc: { start: match.index },
        message: `Dynamic property assignment 'obj[${key}] = ...' may allow prototype pollution. Use a Map or validate the key against an allowlist.`,
        severity: 'error',
      });
    }
  }
}
