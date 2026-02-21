/**
 * @param {string} source
 * @returns {string}
 */
export function minify(source) {
  let result = source;

  // Stash template literals to protect multi-line content from minification
  const stash = [];
  result = result.replace(/`(?:[^`\\]|\\.)*`/gs, (m) => {
    stash.push(m);
    return `\`__MTPL_${stash.length - 1}__\``;
  });

  // Remove JSDoc and multi-line comments
  result = result.replace(/\/\*\*[\s\S]*?\*\//g, '');
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove single-line comments (but not URLs with // and not past stashed template placeholders)
  result = result.replace(/([^:])\/\/[^\n`]*/g, '$1');

  // Process line by line
  const lines = result.split('\n');
  const processed = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Collapse whitespace outside strings
    let collapsed = '';
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inString) {
        collapsed += ch;
        if (ch === stringChar && line[i - 1] !== '\\') inString = false;
      } else if (ch === '"' || ch === "'" || ch === '`') {
        inString = true;
        stringChar = ch;
        collapsed += ch;
      } else if (ch === ' ' || ch === '\t') {
        // Keep space only between identifiers/keywords
        const prev = collapsed[collapsed.length - 1];
        const next = line[i + 1];
        if (prev && next && /\w/.test(prev) && /\w/.test(next)) {
          collapsed += ' ';
        }
      } else {
        collapsed += ch;
      }
    }
    line = collapsed;
    if (line) processed.push(line);
  }

  // Join lines - use semicolons where safe
  result = processed.join('\n');

  // Remove unnecessary semicolons before closing braces
  result = result.replace(/;\s*\}/g, '}');

  // Remove newlines after opening braces and before closing
  result = result.replace(/\{\s*\n\s*/g, '{');
  result = result.replace(/\s*\n\s*\}/g, '}');

  // Collapse remaining newlines into semicolons where safe
  // But be careful not to break return statements, if/else, etc.
  const finalLines = result.split('\n');
  let output = '';
  for (let i = 0; i < finalLines.length; i++) {
    const line = finalLines[i].trim();
    if (!line) continue;
    if (output) {
      const prev = output[output.length - 1];
      // Add semicolon between statements, newline after control flow
      if (prev === '}' || prev === ';' || prev === '{') {
        // Check if current line continues (else, catch, etc.)
        if (/^(else|catch|finally|while)/.test(line)) {
          output += ' ';
        } else if (prev === '}') {
          output += '\n';
        }
      } else {
        output += '\n';
      }
    }
    output += line;
  }

  // Restore stashed template literals
  output = output.replace(/`__MTPL_(\d+)__`/g, (_, i) => stash[i]);

  return output;
}
