/**
 * Decantr Compiler Lint Rule — incomplete-sanitization
 *
 * Detects `.replace(regex, ...)` calls where the regex literal targets special
 * HTML/URL characters (<, >, &, ", ') but lacks the `g` (global) flag.
 * Without the `g` flag only the first occurrence is replaced, leaving the
 * string partially sanitized and still potentially dangerous.
 */

// Matches .replace(/.../, ...) — captures the regex body and flags
const REPLACE_PATTERN = /\.replace\(\s*\/((?:[^/\\]|\\.)*)\/(([gimsuy]*))[\s,)]/g;

// Characters that suggest sanitization intent
const SANITIZATION_CHARS = /[<>&"']/;

export function incompleteSanitization(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource } = mod.ast || {};
    if (!rawSource) continue;

    REPLACE_PATTERN.lastIndex = 0;
    let match;
    while ((match = REPLACE_PATTERN.exec(rawSource)) !== null) {
      const regexBody = match[1];
      const flags = match[2];

      // Only flag if it looks like sanitization (targets special chars)
      if (!SANITIZATION_CHARS.test(regexBody)) continue;

      // Flag if missing the `g` flag
      if (!flags.includes('g')) {
        mod._lintIssues = mod._lintIssues || [];
        mod._lintIssues.push({
          rule: 'incomplete-sanitization',
          loc: { start: match.index },
          message: `'.replace(/${regexBody}/${flags}, ...)' is missing the 'g' flag — only the first occurrence will be replaced, leaving the string partially sanitized`,
          severity: 'error',
        });
      }
    }
  }
}
