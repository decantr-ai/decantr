/**
 * Decantr Compiler - Parser
 *
 * Module-aware parser - parses structure, not full JavaScript expressions.
 * Extracts imports, exports, and top-level declarations.
 */

import { filterComments } from './tokenizer.js';

/**
 * @typedef {Object} Import
 * @property {'named'|'default'|'namespace'|'dynamic'|'side-effect'} type
 * @property {string} source
 * @property {string[]} [names]
 * @property {string} [name]
 * @property {Object} loc
 */

/**
 * @typedef {Object} Export
 * @property {'named'|'default'|'all'|'declaration'} type
 * @property {string[]} [names]
 * @property {string} [name]
 * @property {string} [source]
 * @property {Object} loc
 */

/**
 * @typedef {Object} TopLevelDeclaration
 * @property {'const'|'let'|'var'|'function'|'class'} kind
 * @property {string} name
 * @property {boolean} async
 * @property {boolean} hasAwait
 * @property {Object} loc
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} ModuleAST
 * @property {string} file
 * @property {Import[]} imports
 * @property {Export[]} exports
 * @property {TopLevelDeclaration[]} topLevel
 * @property {boolean} hasTopLevelAwait
 * @property {Object<string, {start: number, end: number}>} sourceRanges
 * @property {string} rawSource
 */

/**
 * Parse token stream into Module AST
 * @param {Token[]} tokens
 * @param {string} file
 * @returns {ModuleAST}
 */
export function parse(tokens, file) {
  const filtered = filterComments(tokens);
  let pos = 0;

  const ast = {
    file,
    imports: [],
    exports: [],
    topLevel: [],
    hasTopLevelAwait: false,
    sourceRanges: {},
    rawSource: ''
  };

  function current() {
    return filtered[pos] || { type: 'eof', value: '' };
  }

  function peek(offset = 0) {
    return filtered[pos + offset] || { type: 'eof', value: '' };
  }

  function advance() {
    return filtered[pos++];
  }

  function expect(type, value) {
    const token = current();
    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new SyntaxError(
        `Expected ${type}${value ? ` '${value}'` : ''}, got ${token.type} '${token.value}' at ${file}:${token.loc.line}:${token.loc.col}`
      );
    }
    return advance();
  }

  function match(type, value) {
    const token = current();
    return token.type === type && (value === undefined || token.value === value);
  }

  function matchKeyword(value) {
    return match('keyword', value);
  }

  function matchPunc(value) {
    return match('punctuator', value);
  }

  /**
   * Parse import statement
   */
  function parseImport() {
    const startLoc = current().loc;
    expect('keyword', 'import');

    // Dynamic import: import('...')
    if (matchPunc('(')) {
      advance(); // (
      const source = parseStringValue();
      expect('punctuator', ')');
      ast.imports.push({ type: 'dynamic', source, loc: startLoc });
      return;
    }

    // Side-effect import: import 'module'
    if (match('string')) {
      const source = parseStringValue();
      ast.imports.push({ type: 'side-effect', source, loc: startLoc });
      return;
    }

    let defaultName = null;
    let names = [];
    let namespace = null;

    // Default import: import foo from 'module'
    if (match('identifier')) {
      defaultName = advance().value;

      // Check for comma (mixed import)
      if (matchPunc(',')) {
        advance();
      } else {
        // Just default import
        expect('keyword', 'from');
        const source = parseStringValue();
        ast.imports.push({ type: 'default', source, name: defaultName, loc: startLoc });
        return;
      }
    }

    // Named imports: { a, b as c }
    if (matchPunc('{')) {
      advance();
      names = parseImportNames();
      expect('punctuator', '}');
    }
    // Namespace import: * as foo
    else if (matchPunc('*')) {
      advance();
      expect('keyword', 'as');
      namespace = expect('identifier').value;
    }

    expect('keyword', 'from');
    const source = parseStringValue();

    if (defaultName) {
      ast.imports.push({ type: 'default', source, name: defaultName, loc: startLoc });
    }
    if (names.length > 0) {
      ast.imports.push({ type: 'named', source, names, loc: startLoc });
    }
    if (namespace) {
      ast.imports.push({ type: 'namespace', source, name: namespace, loc: startLoc });
    }
  }

  function parseImportNames() {
    const names = [];

    while (!matchPunc('}') && !match('eof')) {
      const imported = expect('identifier').value;
      let local = imported;

      if (matchKeyword('as')) {
        advance();
        local = expect('identifier').value;
      }

      names.push({ imported, local });

      if (matchPunc(',')) {
        advance();
      } else {
        break;
      }
    }

    return names;
  }

  function parseStringValue() {
    const token = expect('string');
    // Remove quotes
    return token.value.slice(1, -1);
  }

  /**
   * Parse export statement
   */
  function parseExport() {
    const startLoc = current().loc;
    expect('keyword', 'export');

    // export default
    if (matchKeyword('default')) {
      advance();
      // Could be: export default function, export default class, export default expr
      if (matchKeyword('function') || matchKeyword('class') || matchKeyword('async')) {
        const isAsync = matchKeyword('async');
        if (isAsync) advance();

        const kind = matchKeyword('function') ? 'function' : 'class';
        advance();

        let name = null;
        if (match('identifier')) {
          name = advance().value;
        }

        skipToEndOfDeclaration();
        ast.exports.push({ type: 'default', name, loc: startLoc });
      } else {
        // Expression - skip to semicolon or end
        skipExpression();
        ast.exports.push({ type: 'default', name: null, loc: startLoc });
      }
      return;
    }

    // export * from 'module'
    if (matchPunc('*')) {
      advance();

      let exportedName = null;
      if (matchKeyword('as')) {
        advance();
        exportedName = expect('identifier').value;
      }

      expect('keyword', 'from');
      const source = parseStringValue();

      ast.exports.push({
        type: 'all',
        source,
        name: exportedName,
        loc: startLoc
      });
      return;
    }

    // export { a, b } or export { a, b } from 'module'
    if (matchPunc('{')) {
      advance();
      const names = parseExportNames();
      expect('punctuator', '}');

      let source = null;
      if (matchKeyword('from')) {
        advance();
        source = parseStringValue();
      }

      ast.exports.push({
        type: 'named',
        names,
        source,
        loc: startLoc
      });
      return;
    }

    // export const/let/var/function/class
    const isAsync = matchKeyword('async');
    if (isAsync) advance();

    if (matchKeyword('const') || matchKeyword('let') || matchKeyword('var')) {
      const kind = advance().value;
      const names = parseVariableNames();

      for (const name of names) {
        ast.exports.push({
          type: 'declaration',
          name,
          loc: startLoc
        });
      }

      skipToEndOfStatement();
      return;
    }

    if (matchKeyword('function')) {
      advance();
      const name = match('identifier') ? advance().value : null;
      skipToEndOfDeclaration();

      ast.exports.push({
        type: 'declaration',
        name,
        loc: startLoc
      });
      return;
    }

    if (matchKeyword('class')) {
      advance();
      const name = match('identifier') ? advance().value : null;
      skipToEndOfDeclaration();

      ast.exports.push({
        type: 'declaration',
        name,
        loc: startLoc
      });
      return;
    }
  }

  function parseExportNames() {
    const names = [];

    while (!matchPunc('}') && !match('eof')) {
      const local = expect('identifier').value;
      let exported = local;

      if (matchKeyword('as')) {
        advance();
        exported = expect('identifier').value;
      }

      names.push({ local, exported });

      if (matchPunc(',')) {
        advance();
      } else {
        break;
      }
    }

    return names;
  }

  function parseVariableNames() {
    const names = [];

    // Handle destructuring and regular declarations
    if (matchPunc('{')) {
      advance();
      while (!matchPunc('}') && !match('eof')) {
        if (match('identifier')) {
          const name = advance().value;
          // Skip : value if present
          if (matchPunc(':')) {
            advance();
            if (match('identifier')) advance();
          }
          names.push(name);
        }
        if (matchPunc(',')) advance();
        else break;
      }
      if (matchPunc('}')) advance();
    } else if (matchPunc('[')) {
      advance();
      while (!matchPunc(']') && !match('eof')) {
        if (match('identifier')) {
          names.push(advance().value);
        }
        if (matchPunc(',')) advance();
        else break;
      }
      if (matchPunc(']')) advance();
    } else if (match('identifier')) {
      names.push(advance().value);
    }

    return names;
  }

  /**
   * Parse top-level declaration (non-export)
   */
  function parseTopLevelDeclaration() {
    const startLoc = current().loc;
    const startPos = pos;

    const isAsync = matchKeyword('async');
    if (isAsync) advance();

    if (matchKeyword('const') || matchKeyword('let') || matchKeyword('var')) {
      const kind = advance().value;
      const names = parseVariableNames();

      // Check for await in initializer
      const hasAwait = scanForAwait();
      skipToEndOfStatement();

      for (const name of names) {
        ast.topLevel.push({
          kind,
          name,
          async: false,
          hasAwait,
          loc: startLoc,
          start: startPos,
          end: pos
        });

        if (hasAwait) {
          ast.hasTopLevelAwait = true;
        }
      }
      return true;
    }

    if (matchKeyword('function')) {
      advance();
      const name = match('identifier') ? advance().value : null;
      skipToEndOfDeclaration();

      if (name) {
        ast.topLevel.push({
          kind: 'function',
          name,
          async: isAsync,
          hasAwait: false,
          loc: startLoc,
          start: startPos,
          end: pos
        });
      }
      return true;
    }

    if (matchKeyword('class')) {
      advance();
      const name = match('identifier') ? advance().value : null;
      skipToEndOfDeclaration();

      if (name) {
        ast.topLevel.push({
          kind: 'class',
          name,
          async: false,
          hasAwait: false,
          loc: startLoc,
          start: startPos,
          end: pos
        });
      }
      return true;
    }

    // Reset if we didn't match
    if (isAsync) {
      pos = startPos;
    }

    return false;
  }

  /**
   * Scan ahead for await keyword (used for TLA detection)
   */
  function scanForAwait() {
    const startPos = pos;
    let braceDepth = 0;
    let parenDepth = 0;
    let bracketDepth = 0;
    let foundAwait = false;

    while (!match('eof')) {
      if (matchPunc('{')) braceDepth++;
      else if (matchPunc('}')) braceDepth--;
      else if (matchPunc('(')) parenDepth++;
      else if (matchPunc(')')) parenDepth--;
      else if (matchPunc('[')) bracketDepth++;
      else if (matchPunc(']')) bracketDepth--;

      // Only count await at our nesting level (not inside functions)
      if (braceDepth === 0 && matchKeyword('await')) {
        foundAwait = true;
      }

      // Check for function keyword (which would reset await context)
      if (matchKeyword('function') && braceDepth === 0) {
        // Skip past this function
        advance();
        if (match('identifier')) advance();
        skipToEndOfDeclaration();
        continue;
      }

      // End of statement
      if (braceDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
        if (matchPunc(';') || matchPunc(',')) {
          break;
        }
      }

      advance();
    }

    pos = startPos;
    return foundAwait;
  }

  /**
   * Skip to end of function/class body
   */
  function skipToEndOfDeclaration() {
    // Skip parameters
    if (matchPunc('(')) {
      skipBalanced('(', ')');
    }

    // Skip extends clause for classes
    if (matchKeyword('extends')) {
      advance();
      while (!matchPunc('{') && !match('eof')) {
        advance();
      }
    }

    // Skip body
    if (matchPunc('{')) {
      skipBalanced('{', '}');
    }
  }

  /**
   * Skip balanced brackets
   */
  function skipBalanced(open, close) {
    let depth = 0;

    do {
      if (matchPunc(open)) depth++;
      else if (matchPunc(close)) depth--;

      // Handle strings and templates
      if (match('string') || match('template_string') || match('template_head')) {
        advance();
        continue;
      }

      advance();
    } while (depth > 0 && !match('eof'));
  }

  /**
   * Skip to end of current statement
   */
  function skipToEndOfStatement() {
    let braceDepth = 0;
    let parenDepth = 0;
    let bracketDepth = 0;

    while (!match('eof')) {
      if (matchPunc('{')) braceDepth++;
      else if (matchPunc('}')) braceDepth--;
      else if (matchPunc('(')) parenDepth++;
      else if (matchPunc(')')) parenDepth--;
      else if (matchPunc('[')) bracketDepth++;
      else if (matchPunc(']')) bracketDepth--;

      if (braceDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
        if (matchPunc(';')) {
          advance();
          break;
        }
        // Implicit semicolon at newline or before certain keywords
        if (matchKeyword('import') || matchKeyword('export') ||
            matchKeyword('const') || matchKeyword('let') || matchKeyword('var') ||
            matchKeyword('function') || matchKeyword('class') || matchKeyword('async')) {
          break;
        }
      }

      advance();
    }
  }

  /**
   * Skip expression (for export default <expr>)
   */
  function skipExpression() {
    skipToEndOfStatement();
  }

  /**
   * Check for top-level await statement (e.g., `await fetch(...)`)
   */
  function checkTopLevelAwait() {
    if (matchKeyword('await')) {
      ast.hasTopLevelAwait = true;
      skipToEndOfStatement();
      return true;
    }
    return false;
  }

  // Main parsing loop
  while (!match('eof')) {
    // Skip semicolons
    if (matchPunc(';')) {
      advance();
      continue;
    }

    // Import statements
    if (matchKeyword('import')) {
      // Check if it's dynamic import as expression
      if (peek(1).type === 'punctuator' && peek(1).value === '(') {
        const startLoc = current().loc;
        advance(); // import
        advance(); // (
        const source = parseStringValue();
        expect('punctuator', ')');
        ast.imports.push({ type: 'dynamic', source, loc: startLoc });
        skipToEndOfStatement();
      } else {
        parseImport();
      }
      continue;
    }

    // Export statements
    if (matchKeyword('export')) {
      parseExport();
      continue;
    }

    // Top-level await
    if (checkTopLevelAwait()) {
      continue;
    }

    // Top-level declarations
    if (parseTopLevelDeclaration()) {
      continue;
    }

    // Skip any other statement
    advance();
  }

  return ast;
}

/**
 * Extract dynamic imports from already-parsed module
 * @param {ModuleAST} ast
 * @returns {string[]} Array of dynamic import specifiers
 */
export function getDynamicImports(ast) {
  return ast.imports
    .filter(imp => imp.type === 'dynamic')
    .map(imp => imp.source);
}

/**
 * Extract all static imports
 * @param {ModuleAST} ast
 * @returns {string[]} Array of static import specifiers
 */
export function getStaticImports(ast) {
  return ast.imports
    .filter(imp => imp.type !== 'dynamic')
    .map(imp => imp.source);
}
