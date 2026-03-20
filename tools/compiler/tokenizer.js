/**
 * Decantr Compiler - Tokenizer
 *
 * Produces a token stream with source locations for error reporting.
 * Handles: strings, comments, regex vs division, template literals.
 */

/** @typedef {'keyword'|'identifier'|'punctuator'|'string'|'number'|'regex'|'comment'|'template_head'|'template_middle'|'template_tail'|'template_string'|'eof'} TokenType */

/**
 * @typedef {Object} Token
 * @property {TokenType} type
 * @property {string} value
 * @property {Object} loc
 * @property {number} loc.line
 * @property {number} loc.col
 * @property {string} loc.file
 */

const KEYWORDS = new Set([
  'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally',
  'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null',
  'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'var', 'void', 'while', 'with', 'yield', 'async', 'of', 'from', 'as'
]);

const PUNCTUATORS = new Set([
  '{', '}', '(', ')', '[', ']', '.', '...', ';', ',', '<', '>', '<=', '>=',
  '==', '!=', '===', '!==', '+', '-', '*', '%', '**', '++', '--', '<<', '>>',
  '>>>', '&', '|', '^', '!', '~', '&&', '||', '??', '?', ':', '=', '+=', '-=',
  '*=', '%=', '**=', '<<=', '>>=', '>>>=', '&=', '|=', '^=', '&&=', '||=',
  '??=', '=>', '/', '/=', '?.', '#'
]);

// Tokens after which / starts a regex (not division)
const REGEX_PREV_TOKENS = new Set([
  '=', '(', '[', ',', ';', '!', '&', '|', ':', '?', '{', '}',
  'return', 'throw', 'case', 'in', 'of', 'typeof', 'instanceof',
  'new', 'void', 'delete', '&&', '||', '??', '+', '-', '*', '/', '%',
  '<', '>', '<=', '>=', '==', '!=', '===', '!==', '=>'
]);

/**
 * Tokenize JavaScript source code
 * @param {string} source
 * @param {string} file
 * @returns {Token[]}
 */
export function tokenize(source, file) {
  const tokens = [];
  let pos = 0;
  let line = 1;
  let col = 0;
  let prevToken = null;

  const length = source.length;

  function loc() {
    return { line, col, file };
  }

  function advance(count = 1) {
    for (let i = 0; i < count; i++) {
      if (source[pos] === '\n') {
        line++;
        col = 0;
      } else {
        col++;
      }
      pos++;
    }
  }

  function peek(offset = 0) {
    return source[pos + offset];
  }

  function match(str) {
    return source.slice(pos, pos + str.length) === str;
  }

  function isIdentifierStart(ch) {
    return /[a-zA-Z_$]/.test(ch);
  }

  function isIdentifierPart(ch) {
    return /[a-zA-Z0-9_$]/.test(ch);
  }

  function isDigit(ch) {
    return /[0-9]/.test(ch);
  }

  function isWhitespace(ch) {
    return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
  }

  function skipWhitespace() {
    while (pos < length && isWhitespace(peek())) {
      advance();
    }
  }

  function addToken(type, value) {
    const token = { type, value, loc: loc() };
    tokens.push(token);
    prevToken = token;
    return token;
  }

  function canBeRegex() {
    if (!prevToken) return true;
    if (prevToken.type === 'punctuator') {
      return REGEX_PREV_TOKENS.has(prevToken.value);
    }
    if (prevToken.type === 'keyword') {
      return REGEX_PREV_TOKENS.has(prevToken.value);
    }
    return false;
  }

  function readString(quote) {
    const startLoc = loc();
    let value = quote;
    advance(); // skip opening quote

    while (pos < length) {
      const ch = peek();

      if (ch === quote) {
        value += ch;
        advance();
        break;
      }

      if (ch === '\\') {
        value += ch;
        advance();
        if (pos < length) {
          value += peek();
          advance();
        }
      } else if (ch === '\n') {
        throw new SyntaxError(`Unterminated string at ${file}:${startLoc.line}:${startLoc.col}`);
      } else {
        value += ch;
        advance();
      }
    }

    addToken('string', value);
  }

  function readTemplateLiteral() {
    // Determine if this is head, middle, or tail
    const isHead = peek() === '`';
    const startLoc = loc();
    let value = '';

    if (isHead) {
      value = '`';
      advance(); // skip `
    } else {
      // We're continuing after a ${...}
      value = '}';
      advance(); // skip }
    }

    while (pos < length) {
      const ch = peek();

      if (ch === '`') {
        value += ch;
        advance();
        // End of template
        addToken(isHead ? 'template_string' : 'template_tail', value);
        return;
      }

      if (ch === '$' && peek(1) === '{') {
        value += '${';
        advance(2);
        // Template with expression
        addToken(isHead ? 'template_head' : 'template_middle', value);
        return;
      }

      if (ch === '\\') {
        value += ch;
        advance();
        if (pos < length) {
          value += peek();
          advance();
        }
      } else {
        if (ch === '\n') {
          line++;
          col = 0;
          value += ch;
          pos++;
        } else {
          value += ch;
          advance();
        }
      }
    }

    throw new SyntaxError(`Unterminated template literal at ${file}:${startLoc.line}:${startLoc.col}`);
  }

  function readNumber() {
    let value = '';
    const startLoc = loc();

    // Handle hex, octal, binary
    if (peek() === '0') {
      const next = peek(1);
      if (next === 'x' || next === 'X') {
        value = '0x';
        advance(2);
        while (pos < length && /[0-9a-fA-F]/.test(peek())) {
          value += peek();
          advance();
        }
        addToken('number', value);
        return;
      }
      if (next === 'o' || next === 'O') {
        value = '0o';
        advance(2);
        while (pos < length && /[0-7]/.test(peek())) {
          value += peek();
          advance();
        }
        addToken('number', value);
        return;
      }
      if (next === 'b' || next === 'B') {
        value = '0b';
        advance(2);
        while (pos < length && /[01]/.test(peek())) {
          value += peek();
          advance();
        }
        addToken('number', value);
        return;
      }
    }

    // Decimal
    while (pos < length && isDigit(peek())) {
      value += peek();
      advance();
    }

    // Decimal point
    if (peek() === '.' && isDigit(peek(1))) {
      value += '.';
      advance();
      while (pos < length && isDigit(peek())) {
        value += peek();
        advance();
      }
    }

    // Exponent
    if (peek() === 'e' || peek() === 'E') {
      value += peek();
      advance();
      if (peek() === '+' || peek() === '-') {
        value += peek();
        advance();
      }
      while (pos < length && isDigit(peek())) {
        value += peek();
        advance();
      }
    }

    // BigInt suffix
    if (peek() === 'n') {
      value += 'n';
      advance();
    }

    addToken('number', value);
  }

  function readRegex() {
    const startLoc = loc();
    let value = '/';
    advance(); // skip opening /

    let inClass = false;

    while (pos < length) {
      const ch = peek();

      if (ch === '\n') {
        throw new SyntaxError(`Unterminated regex at ${file}:${startLoc.line}:${startLoc.col}`);
      }

      if (ch === '\\') {
        value += ch;
        advance();
        if (pos < length) {
          value += peek();
          advance();
        }
        continue;
      }

      if (ch === '[') {
        inClass = true;
        value += ch;
        advance();
        continue;
      }

      if (ch === ']' && inClass) {
        inClass = false;
        value += ch;
        advance();
        continue;
      }

      if (ch === '/' && !inClass) {
        value += ch;
        advance();
        // Read flags
        while (pos < length && /[gimsuy]/.test(peek())) {
          value += peek();
          advance();
        }
        break;
      }

      value += ch;
      advance();
    }

    addToken('regex', value);
  }

  function readIdentifier() {
    let value = '';

    while (pos < length && isIdentifierPart(peek())) {
      value += peek();
      advance();
    }

    const type = KEYWORDS.has(value) ? 'keyword' : 'identifier';
    addToken(type, value);
  }

  function readPunctuator() {
    // Try matching longest punctuators first
    const threeChar = source.slice(pos, pos + 3);
    if (PUNCTUATORS.has(threeChar)) {
      addToken('punctuator', threeChar);
      advance(3);
      return;
    }

    const twoChar = source.slice(pos, pos + 2);
    if (PUNCTUATORS.has(twoChar)) {
      addToken('punctuator', twoChar);
      advance(2);
      return;
    }

    const oneChar = peek();
    if (PUNCTUATORS.has(oneChar)) {
      addToken('punctuator', oneChar);
      advance();
      return;
    }

    throw new SyntaxError(`Unexpected character '${oneChar}' at ${file}:${line}:${col}`);
  }

  function readComment() {
    const startLoc = loc();

    if (match('//')) {
      let value = '//';
      advance(2);
      while (pos < length && peek() !== '\n') {
        value += peek();
        advance();
      }
      addToken('comment', value);
      return;
    }

    if (match('/*')) {
      let value = '/*';
      advance(2);
      while (pos < length) {
        if (match('*/')) {
          value += '*/';
          advance(2);
          break;
        }
        const ch = peek();
        value += ch;
        if (ch === '\n') {
          line++;
          col = 0;
          pos++;
        } else {
          advance();
        }
      }
      addToken('comment', value);
      return;
    }
  }

  // Track template literal brace depth for nested expressions
  const templateBraceStack = [];

  while (pos < length) {
    skipWhitespace();
    if (pos >= length) break;

    const ch = peek();

    // Comments
    if (match('//') || match('/*')) {
      readComment();
      continue;
    }

    // Strings
    if (ch === '"' || ch === "'") {
      readString(ch);
      continue;
    }

    // Template literals
    if (ch === '`') {
      readTemplateLiteral();
      // If we emitted template_head, track brace depth
      if (prevToken && prevToken.type === 'template_head') {
        templateBraceStack.push(0);
      }
      continue;
    }

    // Handle template literal expression endings
    if (ch === '}' && templateBraceStack.length > 0) {
      const depth = templateBraceStack[templateBraceStack.length - 1];
      if (depth === 0) {
        // End of template expression, continue template
        templateBraceStack.pop();
        readTemplateLiteral();
        if (prevToken && prevToken.type === 'template_middle') {
          templateBraceStack.push(0);
        }
        continue;
      } else {
        templateBraceStack[templateBraceStack.length - 1]--;
      }
    }

    // Track braces inside template expressions
    if (ch === '{' && templateBraceStack.length > 0) {
      templateBraceStack[templateBraceStack.length - 1]++;
    }

    // Numbers
    if (isDigit(ch) || (ch === '.' && isDigit(peek(1)))) {
      readNumber();
      continue;
    }

    // Identifiers and keywords
    if (isIdentifierStart(ch)) {
      readIdentifier();
      continue;
    }

    // Regex or division
    if (ch === '/') {
      if (canBeRegex() && peek(1) !== '=' && peek(1) !== '/') {
        readRegex();
      } else {
        readPunctuator();
      }
      continue;
    }

    // Punctuators
    readPunctuator();
  }

  addToken('eof', '');
  return tokens;
}

/**
 * Filter out comment tokens for parsing
 * @param {Token[]} tokens
 * @returns {Token[]}
 */
export function filterComments(tokens) {
  return tokens.filter(t => t.type !== 'comment');
}
