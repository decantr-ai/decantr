/**
 * Simple JS tokenizer that identifies and classifies tokens in source code.
 * Processes comments, strings, template literals, and regex literals in correct
 * precedence order (matching how a real JS parser would).
 *
 * Returns the source with comments removed and strings/templates/regex replaced
 * by stash placeholders, plus the stash array for restoration.
 */
function tokenize(source) {
  const stash = [];
  let out = '';
  let i = 0;
  const len = source.length;

  while (i < len) {
    const ch = source[i];
    const next = source[i + 1];

    // 1. Single-line comment
    if (ch === '/' && next === '/') {
      // Skip until end of line
      while (i < len && source[i] !== '\n') i++;
      continue;
    }

    // 2. Multi-line comment (including JSDoc)
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2; // skip closing */
      continue;
    }

    // 3. Template literal
    if (ch === '`') {
      let s = '`';
      i++;
      while (i < len && source[i] !== '`') {
        if (source[i] === '\\') { s += source[i++]; }
        s += source[i++];
      }
      if (i < len) s += source[i++]; // closing `
      stash.push(s);
      out += `\`__MTPL_${stash.length - 1}__\``;
      continue;
    }

    // 4. String literal (single or double quoted)
    if (ch === "'" || ch === '"') {
      let s = ch;
      const q = ch;
      i++;
      while (i < len && source[i] !== q) {
        if (source[i] === '\\') { s += source[i++]; }
        if (i < len) s += source[i++];
      }
      if (i < len) s += source[i++]; // closing quote
      stash.push(s);
      out += `"__MSTR_${stash.length - 1}__"`;
      continue;
    }

    // 5. Regex literal — heuristic: `/` after operator/keyword context
    if (ch === '/') {
      // Look back to determine if this is a regex or division
      const prevCode = out.trimEnd();
      const last = prevCode[prevCode.length - 1];
      const isRegex = !last || '=(:,;!&|?{}[]^~+-*<>%\n'.includes(last);
      if (isRegex) {
        let s = '/';
        i++;
        while (i < len && source[i] !== '/' && source[i] !== '\n') {
          if (source[i] === '\\') { s += source[i++]; }
          if (i < len) s += source[i++];
        }
        if (i < len && source[i] === '/') {
          s += source[i++]; // closing /
          // Flags
          while (i < len && /[gimsuy]/.test(source[i])) s += source[i++];
          stash.push(s);
          out += `"__MREG_${stash.length - 1}__"`;
          continue;
        }
        // Not a regex after all (no closing /), treat as division
        out += s;
        continue;
      }
    }

    // 6. Regular character
    out += ch;
    i++;
  }

  return { result: out, stash };
}

/**
 * @param {string} source
 * @returns {string}
 */
export function minify(source) {
  // Phase 1: Tokenize — strip comments, stash strings/regex/templates
  const { result: stripped, stash } = tokenize(source);
  let result = stripped;

  // Phase 2: Process line by line — collapse whitespace outside stash placeholders
  const lines = result.split('\n');
  const processed = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) continue;

    // Collapse whitespace (all strings are stashed, so no need to track quotes)
    let collapsed = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === ' ' || ch === '\t') {
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

  // Phase 3: Join lines
  result = processed.join('\n');

  // Remove unnecessary semicolons before closing braces
  result = result.replace(/;\s*\}/g, '}');

  // Remove newlines after opening braces and before closing
  result = result.replace(/\{\s*\n\s*/g, '{');
  result = result.replace(/\s*\n\s*\}/g, '}');

  // Collapse remaining newlines into semicolons where safe
  const finalLines = result.split('\n');
  let output = '';
  for (let i = 0; i < finalLines.length; i++) {
    const line = finalLines[i].trim();
    if (!line) continue;
    if (output) {
      const prev = output[output.length - 1];
      if (prev === '}' || prev === ';' || prev === '{') {
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

  // Phase 4: Restore stashed values
  output = output.replace(/"__MREG_(\d+)__"/g, (_, i) => stash[i]);
  output = output.replace(/"__MSTR_(\d+)__"/g, (_, i) => stash[i]);
  output = output.replace(/`__MTPL_(\d+)__`/g, (_, i) => stash[i]);

  return output;
}
