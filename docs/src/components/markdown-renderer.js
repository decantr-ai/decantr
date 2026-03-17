import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { CodeBlock } from 'decantr/components';

const { div, h1, h2, h3, h4, h5, h6, p, a, span, code, pre, ul, ol, li, hr, blockquote, strong, em } = tags;

// ── Markdown cache ────────────────────────────────────────────────
const cache = new Map();

// ── Syntax highlighting tokens ────────────────────────────────────
const JS_KEYWORDS = new Set([
  'import', 'export', 'from', 'const', 'let', 'var', 'function', 'return',
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'class', 'extends', 'new', 'this', 'super', 'typeof', 'instanceof',
  'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield',
  'true', 'false', 'null', 'undefined', 'void', 'delete', 'in', 'of',
  'default', 'static', 'get', 'set',
]);

const BASH_KEYWORDS = new Set([
  'npm', 'npx', 'cd', 'mkdir', 'echo', 'export', 'source', 'sudo',
  'git', 'node', 'decantr', 'install', 'run', 'build', 'dev', 'test',
]);

function highlightCode(text, lang) {
  const block = CodeBlock({ language: lang || undefined, class: css('_my4') }, text);

  // If we have a recognized language, apply syntax highlighting to the code element
  if (lang && lang !== 'text') {
    const codeEl = block.querySelector('.d-codeblock-code');
    if (codeEl) {
      codeEl.textContent = '';
      const keywords = lang === 'bash' || lang === 'sh' ? BASH_KEYWORDS : JS_KEYWORDS;
      const tokens = tokenize(text, keywords, lang);
      for (const tok of tokens) {
        if (tok.type === 'plain') {
          codeEl.appendChild(document.createTextNode(tok.value));
        } else {
          codeEl.appendChild(span({ class: `ds-hl-${tok.type}` }, tok.value));
        }
      }
    }
  }

  return block;
}

function tokenize(text, keywords, lang) {
  const tokens = [];
  let i = 0;
  let buf = '';

  function flush() {
    if (buf) {
      // Check if buf is a keyword
      if (keywords.has(buf)) {
        tokens.push({ type: 'keyword', value: buf });
      } else if (/^\d+(\.\d+)?$/.test(buf)) {
        tokens.push({ type: 'number', value: buf });
      } else {
        tokens.push({ type: 'plain', value: buf });
      }
      buf = '';
    }
  }

  while (i < text.length) {
    const ch = text[i];

    // Comments
    if (ch === '/' && text[i + 1] === '/') {
      flush();
      let end = text.indexOf('\n', i);
      if (end === -1) end = text.length;
      tokens.push({ type: 'comment', value: text.slice(i, end) });
      i = end;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      flush();
      let end = text.indexOf('*/', i + 2);
      if (end === -1) end = text.length; else end += 2;
      tokens.push({ type: 'comment', value: text.slice(i, end) });
      i = end;
      continue;
    }
    // Bash comments
    if (ch === '#' && (lang === 'bash' || lang === 'sh')) {
      flush();
      let end = text.indexOf('\n', i);
      if (end === -1) end = text.length;
      tokens.push({ type: 'comment', value: text.slice(i, end) });
      i = end;
      continue;
    }

    // Strings
    if (ch === '\'' || ch === '"' || ch === '`') {
      flush();
      let end = i + 1;
      while (end < text.length && text[end] !== ch) {
        if (text[end] === '\\') end++;
        end++;
      }
      if (end < text.length) end++;
      tokens.push({ type: 'string', value: text.slice(i, end) });
      i = end;
      continue;
    }

    // Word boundaries
    if (/[a-zA-Z_$]/.test(ch)) {
      buf += ch;
      i++;
      continue;
    }

    // Numbers at word start
    if (/[0-9]/.test(ch) && !buf) {
      flush();
      let num = '';
      while (i < text.length && /[0-9.]/.test(text[i])) {
        num += text[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // Everything else
    flush();
    tokens.push({ type: 'plain', value: ch });
    i++;
  }
  flush();
  return tokens;
}

// ── Inline markdown parsing ───────────────────────────────────────
function parseInline(text) {
  const frag = document.createDocumentFragment();
  let i = 0;
  let buf = '';

  function flushBuf() {
    if (buf) {
      frag.appendChild(document.createTextNode(buf));
      buf = '';
    }
  }

  while (i < text.length) {
    // Inline code
    if (text[i] === '`') {
      flushBuf();
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        frag.appendChild(code({ class: `ds-inline-code ${css('_px1 _r1 _textsm')}` }, text.slice(i + 1, end)));
        i = end + 1;
        continue;
      }
    }

    // Bold **text**
    if (text[i] === '*' && text[i + 1] === '*') {
      flushBuf();
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        const inner = parseInline(text.slice(i + 2, end));
        const el = strong({});
        el.appendChild(inner);
        frag.appendChild(el);
        i = end + 2;
        continue;
      }
    }

    // Italic *text*
    if (text[i] === '*' && text[i + 1] !== '*') {
      flushBuf();
      const end = text.indexOf('*', i + 1);
      if (end !== -1 && end > i + 1) {
        const inner = parseInline(text.slice(i + 1, end));
        const el = em({});
        el.appendChild(inner);
        frag.appendChild(el);
        i = end + 1;
        continue;
      }
    }

    // Links [text](url)
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket + 2);
        if (closeParen !== -1) {
          flushBuf();
          const linkText = text.slice(i + 1, closeBracket);
          const href = text.slice(closeBracket + 2, closeParen);
          frag.appendChild(a({ href, class: css('_fgprimary') }, linkText));
          i = closeParen + 1;
          continue;
        }
      }
    }

    buf += text[i];
    i++;
  }
  flushBuf();
  return frag;
}

// ── Block-level markdown parsing ──────────────────────────────────
function parseMarkdown(src) {
  const lines = src.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(highlightCode(codeLines.join('\n'), lang));
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingTags = [h1, h2, h3, h4, h5, h6];
      const tag = headingTags[level - 1];
      const classes = [
        css('_heading1 _mt8 _mb4'),
        css('_heading2 _mt6 _mb3'),
        css('_heading3 _mt5 _mb2'),
        css('_heading4 _mt4 _mb2'),
        css('_heading5 _mt3 _mb1'),
        css('_heading6 _mt3 _mb1'),
      ];
      const el = tag({ class: classes[level - 1], id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
      el.appendChild(parseInline(text));
      elements.push(el);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      elements.push(hr({ class: css('_my6') }));
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      const content = quoteLines.join('\n');
      const bq = blockquote({ class: `ds-blockquote ${css('_pis4 _py2 _my4 _fgmutedfg _italic')}` });
      bq.appendChild(parseInline(content));
      elements.push(bq);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        const itemEl = li({});
        itemEl.appendChild(parseInline(lines[i].replace(/^[-*+]\s/, '')));
        items.push(itemEl);
        i++;
      }
      elements.push(ul({ class: css('_flex _col _gap1 _pis6 _my3') }, ...items));
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const itemEl = li({});
        itemEl.appendChild(parseInline(lines[i].replace(/^\d+\.\s/, '')));
        items.push(itemEl);
        i++;
      }
      elements.push(ol({ class: css('_flex _col _gap1 _pis6 _my3') }, ...items));
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' &&
      !lines[i].startsWith('#') && !lines[i].startsWith('```') &&
      !lines[i].startsWith('> ') && !/^[-*+]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) && !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      const pEl = p({ class: css('_body _lhrelaxed _my2') });
      pEl.appendChild(parseInline(paraLines.join(' ')));
      elements.push(pEl);
    }
  }

  return elements;
}

// ── Public API ────────────────────────────────────────────────────
/**
 * Render a markdown file into Decantr DOM elements.
 * Fetches the file via fetch(), caches the result, and returns a container div.
 * @param {string} url — URL of the .md file to render
 * @returns {HTMLElement} — Container div with rendered markdown
 */
export function MarkdownRenderer({ url }) {
  const container = div({ class: css('_flex _col _gap4 _maxw[800px]') });
  container.textContent = 'Loading...';

  const cached = cache.get(url);
  if (cached) {
    container.textContent = '';
    for (const el of cached) container.appendChild(el.cloneNode(true));
    return container;
  }

  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load ${url}`);
      return r.text();
    })
    .then(src => {
      const elements = parseMarkdown(src);
      cache.set(url, elements);
      container.textContent = '';
      for (const el of elements) container.appendChild(el.cloneNode(true));
    })
    .catch(() => {
      container.textContent = 'Failed to load content.';
    });

  return container;
}

/**
 * Render a raw markdown string into Decantr DOM elements.
 * @param {string} src — Markdown source string
 * @returns {HTMLElement} — Container div with rendered markdown
 */
export function MarkdownContent({ src }) {
  const container = div({ class: css('_flex _col _gap4 _maxw[800px]') });
  const elements = parseMarkdown(src);
  for (const el of elements) container.appendChild(el);
  return container;
}
