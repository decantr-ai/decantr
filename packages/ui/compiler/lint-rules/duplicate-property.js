/**
 * Decantr Compiler - duplicate-property lint rule
 *
 * Scans module source for object literal blocks and reports any duplicate keys.
 * Skips framework modules.
 */

/**
 * Extract all object literal blocks from a source string using brace matching,
 * then scan each block for duplicate property keys.
 * @param {string} source
 * @returns {{ name: string, blockIndex: number }[]}
 */
function findDuplicateKeys(source) {
  const duplicates = [];
  let i = 0;
  let blockIndex = 0;

  while (i < source.length) {
    if (source[i] === '{') {
      // Find the matching closing brace
      let depth = 1;
      let j = i + 1;
      while (j < source.length && depth > 0) {
        if (source[j] === '{') depth++;
        else if (source[j] === '}') depth--;
        j++;
      }
      const block = source.slice(i + 1, j - 1);
      const seen = new Set();
      // Match bare property keys: word chars followed by optional spaces and a colon
      // Handles both `key: value` and `"key": value` forms
      const keyPattern = /(?:^|,)\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*:/gm;
      let match;
      while ((match = keyPattern.exec(block)) !== null) {
        const key = match[1] || match[2] || match[3];
        if (seen.has(key)) {
          duplicates.push({ name: key, blockIndex });
        } else {
          seen.add(key);
        }
      }
      blockIndex++;
      i = j;
    } else {
      i++;
    }
  }

  return duplicates;
}

export function duplicateProperty(graph) {
  for (const mod of graph.modules.values()) {
    if (mod.isFramework) continue;
    const { rawSource } = mod.ast || {};
    if (!rawSource) continue;

    const dupes = findDuplicateKeys(rawSource);
    for (const { name } of dupes) {
      mod._lintIssues = mod._lintIssues || [];
      mod._lintIssues.push({
        rule: 'duplicate-property',
        name,
        message: `Duplicate object key '${name}'`,
        severity: 'warn',
      });
    }
  }
}
