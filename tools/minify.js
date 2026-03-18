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

// ---------------------------------------------------------------------------
// Stash mechanism for mangle — protects strings/templates/regex from renaming
// ---------------------------------------------------------------------------
function stashStrings(source) {
  const stash = [];
  let out = '';
  let i = 0;
  const len = source.length;

  while (i < len) {
    const ch = source[i];

    // Template literal
    if (ch === '`') {
      let s = '`';
      i++;
      while (i < len && source[i] !== '`') {
        if (source[i] === '\\') { s += source[i++]; }
        if (i < len) s += source[i++];
      }
      if (i < len) s += source[i++];
      stash.push(s);
      out += `\`__XSTASH_${stash.length - 1}__\``;
      continue;
    }

    // String literal
    if (ch === "'" || ch === '"') {
      let s = ch;
      const q = ch;
      i++;
      while (i < len && source[i] !== q) {
        if (source[i] === '\\') { s += source[i++]; }
        if (i < len) s += source[i++];
      }
      if (i < len) s += source[i++];
      stash.push(s);
      out += `"__XSTASH_${stash.length - 1}__"`;
      continue;
    }

    // Regex literal
    if (ch === '/') {
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
          s += source[i++];
          while (i < len && /[gimsuy]/.test(source[i])) s += source[i++];
          stash.push(s);
          out += `"__XSTASH_${stash.length - 1}__"`;
          continue;
        }
        out += s;
        continue;
      }
    }

    out += ch;
    i++;
  }

  return { result: out, stash };
}

function unstashStrings(source, stash) {
  return source.replace(/["'`]__XSTASH_(\d+)__["'`]/g, (_, i) => stash[+i]);
}

// ---------------------------------------------------------------------------
// JS reserved words and global built-ins — never mangle these
// ---------------------------------------------------------------------------
const JS_RESERVED = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
  'new', 'null', 'of', 'return', 'static', 'super', 'switch', 'this',
  'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while',
  'with', 'yield', 'async', 'await'
]);

const GLOBAL_BUILTINS = new Set([
  'window', 'document', 'console', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'Promise', 'Array', 'Object', 'Map',
  'Set', 'WeakMap', 'WeakSet', 'Math', 'JSON', 'Error', 'TypeError',
  'RangeError', 'SyntaxError', 'ReferenceError', 'Symbol', 'Proxy',
  'Reflect', 'undefined', 'null', 'true', 'false', 'NaN', 'Infinity',
  'globalThis', 'queueMicrotask', 'requestAnimationFrame',
  'cancelAnimationFrame', 'MutationObserver', 'ResizeObserver',
  'IntersectionObserver', 'EventSource', 'fetch', 'URL', 'URLSearchParams',
  'AbortController', 'TextEncoder', 'TextDecoder', 'structuredClone',
  'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
  'performance', 'CSS', 'CSSStyleSheet', 'HTMLElement', 'Node', 'Element',
  'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'FocusEvent',
  'InputEvent', 'PointerEvent', 'TouchEvent', 'DragEvent',
  'ClipboardEvent', 'MediaQueryList', 'FileReader', 'FormData', 'Blob',
  'File', 'Response', 'Request', 'Headers', 'ReadableStream',
  'WritableStream', 'TransformStream', 'crypto', 'atob', 'btoa', 'Buffer',
  'DataView', 'ArrayBuffer', 'Float32Array', 'Float64Array', 'Int8Array',
  'Int16Array', 'Int32Array', 'Uint8Array', 'Uint16Array', 'Uint32Array',
  'String', 'Number', 'Boolean', 'Date', 'RegExp', 'parseInt',
  'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent',
  'decodeURIComponent', 'encodeURI', 'decodeURI', 'alert', 'confirm',
  'prompt'
]);

const NEVER_MANGLE = new Set([
  'arguments', 'this', 'super', 'new', 'typeof', 'void', 'delete',
  'instanceof', 'in', 'of'
]);

// ---------------------------------------------------------------------------
// Short name generator: a..z, A..Z, aa..az, ...
// ---------------------------------------------------------------------------
function createNameGenerator(avoid) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let index = 0;

  return function next() {
    while (true) {
      let name = '';
      let n = index;
      // First character from chars
      name = chars[n % chars.length];
      n = Math.floor(n / chars.length);
      // Subsequent characters (if index >= chars.length)
      while (n > 0) {
        n--; // adjust for 1-based indexing in subsequent digits
        name += chars[n % chars.length];
        n = Math.floor(n / chars.length);
      }
      index++;
      if (!avoid.has(name)) return name;
    }
  };
}

// ---------------------------------------------------------------------------
// Find matching closing brace via brace counting
// ---------------------------------------------------------------------------
function findMatchingBrace(source, openPos) {
  let depth = 1;
  let i = openPos + 1;
  while (i < source.length && depth > 0) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') depth--;
    i++;
  }
  return depth === 0 ? i - 1 : -1;
}

// ---------------------------------------------------------------------------
// Extract export info from a return statement like: return {foo, bar, baz: qux}
// Returns { names: string[], shorthand: Set<string> }
//   names: all exported property keys
//   shorthand: names that use shorthand syntax (name IS the variable)
// ---------------------------------------------------------------------------
function extractExportInfo(iifeBody) {
  const returnRe = /return\s*\{([^}]*)\}\s*;?\s*$/;
  const match = iifeBody.match(returnRe);
  if (!match) return { names: [], shorthand: new Set() };

  const inner = match[1];
  const names = [];
  const shorthand = new Set();
  const parts = inner.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      // "key: value" — key is the export name, value is the local variable
      names.push(trimmed.slice(0, colonIdx).trim());
    } else {
      // shorthand "foo" — the name is both the key and the variable
      names.push(trimmed);
      shorthand.add(trimmed);
    }
  }
  return { names, shorthand };
}

// ---------------------------------------------------------------------------
// Find local declarations inside an IIFE body (after string stashing)
// ---------------------------------------------------------------------------
function findLocalDeclarations(body) {
  const locals = new Set();

  // const/let/var NAME (simple binding — not destructuring)
  // Match: const foo, let bar, var baz (with optional = ...)
  const declRe = /\b(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=;,)]/g;
  let m;
  while ((m = declRe.exec(body)) !== null) {
    locals.add(m[1]);
  }

  // Destructured bindings: const { a, b, c } = ...; or const { a: x, b: y } = ...;
  const destructRe = /\b(?:const|let|var)\s*\{([^}]*)\}\s*=/g;
  while ((m = destructRe.exec(body)) !== null) {
    const inner = m[1];
    const parts = inner.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        // `a: x` — x is the local name
        const localName = trimmed.slice(colonIdx + 1).trim();
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(localName)) {
          locals.add(localName);
        }
      } else {
        // shorthand `a` — a is the local name
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
          locals.add(trimmed);
        }
      }
    }
  }

  // Array destructuring: const [a, b, c] = ...;
  const arrDestructRe = /\b(?:const|let|var)\s*\[([^\]]*)\]\s*=/g;
  while ((m = arrDestructRe.exec(body)) !== null) {
    const inner = m[1];
    const parts = inner.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      // Skip rest elements ...x -> x
      const name = trimmed.startsWith('...') ? trimmed.slice(3).trim() : trimmed;
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
        locals.add(name);
      }
    }
  }

  // function NAME(...)
  const funcRe = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  while ((m = funcRe.exec(body)) !== null) {
    locals.add(m[1]);
  }

  // Function parameters: function name(a, b, c) or function(a, b, c)
  const funcParamRe = /\bfunction\s*(?:[a-zA-Z_$][a-zA-Z0-9_$]*)?\s*\(([^)]*)\)/g;
  while ((m = funcParamRe.exec(body)) !== null) {
    extractParams(m[1], locals);
  }

  // Arrow function parameters: (a, b) => or single param: a =>
  const arrowParamRe = /\(([^)]*)\)\s*=>/g;
  while ((m = arrowParamRe.exec(body)) !== null) {
    extractParams(m[1], locals);
  }

  // Single-parameter arrow: ident => (not preceded by . or ?)
  const singleArrowRe = /(?<![.\w?])([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>/g;
  while ((m = singleArrowRe.exec(body)) !== null) {
    if (!JS_RESERVED.has(m[1]) && !GLOBAL_BUILTINS.has(m[1])) {
      locals.add(m[1]);
    }
  }

  // catch(e)
  const catchRe = /\bcatch\s*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)/g;
  while ((m = catchRe.exec(body)) !== null) {
    locals.add(m[1]);
  }

  // for (const/let/var x of/in ...)
  const forRe = /\bfor\s*\(\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s+(?:of|in)\b/g;
  while ((m = forRe.exec(body)) !== null) {
    locals.add(m[1]);
  }

  return locals;
}

function extractParams(paramStr, locals) {
  const parts = paramStr.split(',');
  for (const part of parts) {
    let trimmed = part.trim();
    if (!trimmed) continue;
    // Handle default values: a = 5
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) trimmed = trimmed.slice(0, eqIdx).trim();
    // Handle rest params: ...args
    if (trimmed.startsWith('...')) trimmed = trimmed.slice(3).trim();
    // Handle destructured params — skip complex ones
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) continue;
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed)) {
      locals.add(trimmed);
    }
  }
}

// ---------------------------------------------------------------------------
// Count references of an identifier within a body (whole-word match)
// Excludes property access positions (after . or ?.)
// ---------------------------------------------------------------------------
function countReferences(name, body) {
  const re = new RegExp(`(?<![.\\w$])${escapeRegExp(name)}(?![\\w$])`, 'g');
  const matches = body.match(re);
  return matches ? matches.length : 0;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// mangle(source) — scope-aware variable renaming for bundled IIFE output
// ---------------------------------------------------------------------------
export function mangle(source) {
  // Phase 0: Stash strings/templates/regex to protect from modification
  const { result: stashed, stash } = stashStrings(source);

  let result = stashed;

  // Phase 1: Find IIFE scopes
  // Pattern: const _mN = (function(){...return {exports}})();
  const iifeRe = /const\s+(_m\d+)\s*=\s*\(function\s*\(\)\s*\{/g;
  const iifes = [];
  let iifeMatch;

  while ((iifeMatch = iifeRe.exec(stashed)) !== null) {
    const moduleName = iifeMatch[1];
    // The opening brace position is at the end of the match minus 1
    const openBracePos = iifeMatch.index + iifeMatch[0].length - 1;
    const closeBracePos = findMatchingBrace(stashed, openBracePos);

    if (closeBracePos === -1) continue;

    const body = stashed.slice(openBracePos + 1, closeBracePos);
    iifes.push({
      moduleName,
      start: openBracePos + 1,
      end: closeBracePos,
      body
    });
  }

  // Process each IIFE scope independently, from last to first
  // (so that index offsets remain valid as we splice)
  for (let si = iifes.length - 1; si >= 0; si--) {
    const iife = iifes[si];
    let body = iife.body;

    if (!body.trim()) continue;

    // Phase 2: Extract export names from return statement
    const exportInfo = extractExportInfo(body);
    const exportNames = new Set(exportInfo.names);
    // Shorthand exports (e.g. `return {bar}`) — renaming the variable would
    // change the exported property key, breaking inter-module references.
    // These must NOT be renamed.
    const shorthandExports = exportInfo.shorthand;

    // Phase 3: Find local declarations
    const locals = findLocalDeclarations(body);

    // Remove reserved words, globals, never-mangle, _mN refs, and shorthand exports
    for (const name of locals) {
      if (JS_RESERVED.has(name) || GLOBAL_BUILTINS.has(name) || NEVER_MANGLE.has(name)) {
        locals.delete(name);
      }
      // Don't mangle inter-module references (_mN names)
      if (/^_m\d+$/.test(name)) {
        locals.delete(name);
      }
      // Don't mangle shorthand export names — they are property keys
      if (shorthandExports.has(name)) {
        locals.delete(name);
      }
    }

    if (locals.size === 0) continue;

    // Phase 4: Count references and sort by frequency (most-used first)
    const refCounts = [];
    for (const name of locals) {
      const count = countReferences(name, body);
      if (count > 0) {
        refCounts.push({ name, count });
      }
    }

    // Sort: most referenced first → gets shortest name
    refCounts.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    if (refCounts.length === 0) continue;

    // Build the set of names to avoid:
    // - JS reserved words + globals + never-mangle
    // - Export names (must stay intact)
    // - All identifiers in the body that are NOT being renamed
    //   (to avoid collision with things we don't control)
    const avoidSet = new Set([...JS_RESERVED, ...GLOBAL_BUILTINS, ...NEVER_MANGLE, ...exportNames]);

    // Also avoid _mN references
    const moduleRefRe = /\b_m\d+\b/g;
    let mr;
    while ((mr = moduleRefRe.exec(body)) !== null) {
      avoidSet.add(mr[0]);
    }

    // Collect all identifiers in the body to avoid collision with non-local ones
    const allIdentsRe = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
    const allIdents = new Set();
    let ai;
    while ((ai = allIdentsRe.exec(body)) !== null) {
      allIdents.add(ai[0]);
    }
    // Names not in our rename set should be avoided
    const renameSet = new Set(refCounts.map(r => r.name));
    for (const ident of allIdents) {
      if (!renameSet.has(ident)) {
        avoidSet.add(ident);
      }
    }

    // Generate short replacement names
    const nameGen = createNameGenerator(avoidSet);
    const renames = new Map();

    for (const { name } of refCounts) {
      const short = nameGen();
      // Don't rename if the new name is the same as the original
      // or longer than the original
      if (short !== name && short.length < name.length) {
        renames.set(name, short);
        // Add the new short name to avoid set so future names don't collide
        avoidSet.add(short);
      } else if (short !== name) {
        // Even if not shorter, still valid rename for mangling purposes
        renames.set(name, short);
        avoidSet.add(short);
      }
    }

    if (renames.size === 0) continue;

    // Phase 5: Apply replacements — longest name first to avoid substring issues
    const sortedRenames = [...renames.entries()].sort((a, b) => b[0].length - a[0].length);

    for (const [oldName, newName] of sortedRenames) {
      // Replace whole-word occurrences, avoiding property access (after . or ?.)
      const re = new RegExp(
        `(?<![.$\\w])${escapeRegExp(oldName)}(?![\\w$])`,
        'g'
      );
      body = body.replace(re, newName);
    }

    // Splice the mangled body back into result
    result = result.slice(0, iife.start) + body + result.slice(iife.end);
  }

  // Phase 6: Restore stashed strings
  result = unstashStrings(result, stash);

  return result;
}

// ---------------------------------------------------------------------------
// minify(source, opts) — strip comments, collapse whitespace, optionally mangle
// ---------------------------------------------------------------------------

/**
 * @param {string} source
 * @param {{ mangle?: boolean }} [opts]
 * @returns {string}
 */
export function minify(source, opts = {}) {
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

  // Phase 5: Mangle if requested (runs on the restored output)
  if (opts.mangle) {
    output = mangle(output);
  }

  return output;
}
