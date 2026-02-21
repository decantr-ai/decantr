import { h } from 'decantr/core';

const RULES = [
  // Strings (single and double quoted, template literals)
  { pattern: /(&#39;[^&#39;]*&#39;|&quot;[^&quot;]*&quot;|\`[^\`]*\`)/g, cls: 'code-str' },
  { pattern: /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\`(?:[^\`\\]|\\.)*\`)/g, cls: 'code-str' },
  // Comments
  { pattern: /(\/\/.*$)/gm, cls: 'code-cmt' },
  // Keywords
  { pattern: /\b(import|export|from|const|let|var|function|return|if|else|for|while|new|class|extends|this|typeof|instanceof|switch|case|default|break|continue|throw|try|catch|finally|async|await|yield|of|in|void|delete|null|undefined|true|false)\b/g, cls: 'code-kw' },
  // Numbers
  { pattern: /\b(\d+(?:\.\d+)?)\b/g, cls: 'code-num' },
  // Function calls
  { pattern: /\b([A-Z]\w*)\s*(?=\()/g, cls: 'code-fn' },
  { pattern: /\b([a-z]\w*)\s*(?=\()/g, cls: 'code-call' }
];

function highlight(code) {
  // Escape HTML
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tokenize to avoid overlapping replacements
  const tokens = [];
  let id = 0;

  // Extract strings first
  escaped = escaped.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\`(?:[^\`\\]|\\.)*\`)/g, (m) => {
    const placeholder = `\x00S${id++}\x00`;
    tokens.push({ placeholder, html: `<span class="code-str">${m}</span>` });
    return placeholder;
  });

  // Extract comments
  escaped = escaped.replace(/(\/\/.*$)/gm, (m) => {
    const placeholder = `\x00S${id++}\x00`;
    tokens.push({ placeholder, html: `<span class="code-cmt">${m}</span>` });
    return placeholder;
  });

  // Keywords
  escaped = escaped.replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|new|class|extends|this|typeof|instanceof|switch|case|default|break|continue|throw|try|catch|finally|async|await|yield|of|in|void|delete|null|undefined|true|false)\b/g,
    '<span class="code-kw">$1</span>'
  );

  // Numbers
  escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g,
    '<span class="code-num">$1</span>'
  );

  // Component/constructor calls (uppercase)
  escaped = escaped.replace(/\b([A-Z]\w*)\s*(?=\()/g,
    '<span class="code-fn">$1</span>'
  );

  // Function calls (lowercase)
  escaped = escaped.replace(/\b([a-z]\w*)\s*(?=\()/g,
    '<span class="code-call">$1</span>'
  );

  // Restore tokens
  for (const t of tokens) {
    escaped = escaped.replace(t.placeholder, t.html);
  }

  return escaped;
}

const styleInjected = { done: false };

function injectCodeStyles() {
  if (styleInjected.done || typeof document === 'undefined') return;
  styleInjected.done = true;
  const style = document.createElement('style');
  style.setAttribute('data-decantr-code', '');
  style.textContent = [
    '.code-block{background:var(--c2);border:1px solid var(--c5);border-radius:var(--d-radius,6px);overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.8125rem;line-height:1.6}',
    '.code-block pre{margin:0;padding:1rem;white-space:pre;tab-size:2}',
    '.code-block code{font:inherit}',
    '.code-str{color:var(--c7)}',
    '.code-cmt{color:var(--c4);font-style:italic}',
    '.code-kw{color:var(--c9)}',
    '.code-num{color:var(--c8)}',
    '.code-fn{color:var(--c1)}',
    '.code-call{color:var(--c6)}'
  ].join('');
  document.head.appendChild(style);
}

/**
 * @param {{ code: string, lang?: string }} props
 */
export function CodeBlock({ code, lang }) {
  injectCodeStyles();

  const trimmed = code.replace(/^\n+|\n+$/g, '');
  const highlighted = lang === 'bash' ? trimmed.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : highlight(trimmed);

  const pre = h('pre', null);
  const codeEl = h('code', null);
  codeEl.innerHTML = highlighted;
  pre.appendChild(codeEl);

  return h('div', { class: 'code-block', role: 'region', 'aria-label': `${lang || 'JavaScript'} code example` },
    pre
  );
}
