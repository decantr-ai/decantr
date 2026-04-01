/**
 * Minimal syntax highlighter — regex-based tokenizer.
 * Supports: js, bash, html, json. Zero dependencies.
 *
 * @module decantr/components/code-highlight
 */

const LANGS = {
  js: [
    { type: 'comment', re: /\/\/[^\n]*/g },
    { type: 'comment', re: /\/\*[\s\S]*?\*\//g },
    { type: 'string', re: /`(?:[^`\\]|\\.)*`/g },
    { type: 'string', re: /"(?:[^"\\]|\\.)*"/g },
    { type: 'string', re: /'(?:[^'\\]|\\.)*'/g },
    { type: 'number', re: /\b\d+(?:\.\d+)?\b/g },
    { type: 'keyword', re: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|yield|void|delete|null|undefined|true|false)\b/g },
    { type: 'function', re: /\b[a-zA-Z_$][\w$]*(?=\s*\()/g },
    { type: 'operator', re: /[+\-*/%=!<>&|^~?:]+/g },
    { type: 'punctuation', re: /[{}[\]();,.]/g },
  ],
  bash: [
    { type: 'comment', re: /#[^\n]*/g },
    { type: 'string', re: /"(?:[^"\\]|\\.)*"/g },
    { type: 'string', re: /'[^']*'/g },
    { type: 'keyword', re: /\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|export|source|alias|cd|echo|printf|read|set|unset|local|declare|eval|exec|trap|wait|shift|sudo|chmod|chown|mkdir|rm|cp|mv|ls|cat|grep|sed|awk|find|xargs|curl|wget|npm|npx|node|git|docker)\b/g },
    { type: 'function', re: /\$\{?[\w]+\}?/g },
    { type: 'operator', re: /[|&;><]+/g },
    { type: 'punctuation', re: /[{}[\]()]/g },
  ],
  html: [
    { type: 'comment', re: /<!--[\s\S]*?-->/g },
    { type: 'string', re: /"[^"]*"/g },
    { type: 'string', re: /'[^']*'/g },
    { type: 'keyword', re: /<\/?[a-zA-Z][\w-]*/g },
    { type: 'operator', re: /[=>/]/g },
    { type: 'punctuation', re: /[<>]/g },
  ],
  json: [
    { type: 'string', re: /"(?:[^"\\]|\\.)*"/g },
    { type: 'number', re: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g },
    { type: 'keyword', re: /\b(?:true|false|null)\b/g },
    { type: 'punctuation', re: /[{}[\]:,]/g },
  ],
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Highlight code string into HTML with d-hl-* span tokens.
 * @param {string} code - Source code to highlight
 * @param {string} language - Language key (js, bash, html, json)
 * @returns {string} HTML string with syntax-highlighted spans
 */
export function createHighlighter(code, language) {
  const rules = LANGS[language];
  if (!rules) return escapeHtml(code);

  // Collect all token matches with their positions
  const tokens = [];
  for (const rule of rules) {
    const re = new RegExp(rule.re.source, rule.re.flags);
    let m;
    while ((m = re.exec(code)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, type: rule.type, text: m[0] });
    }
  }

  // Sort by start position, then by length descending (longest match first)
  tokens.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  // Remove overlapping tokens (greedy, first wins)
  const filtered = [];
  let lastEnd = 0;
  for (const tok of tokens) {
    if (tok.start >= lastEnd) {
      filtered.push(tok);
      lastEnd = tok.end;
    }
  }

  // Build output
  let result = '';
  let pos = 0;
  for (const tok of filtered) {
    if (tok.start > pos) {
      result += escapeHtml(code.slice(pos, tok.start));
    }
    result += `<span class="d-hl-${tok.type}">${escapeHtml(tok.text)}</span>`;
    pos = tok.end;
  }
  if (pos < code.length) {
    result += escapeHtml(code.slice(pos));
  }

  return result;
}
