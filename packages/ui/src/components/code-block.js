/**
 * CodeBlock — Structured code display with line numbers, copy button, and language label.
 * No syntax highlighting (zero-dependency). Users can integrate Prism/Shiki externally.
 *
 * @module decantr/components/code-block
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.language] - Language label (e.g. 'javascript', 'html')
 * @param {boolean} [props.lineNumbers=false] - Show line numbers
 * @param {boolean} [props.copyable=true] - Show copy button
 * @param {number} [props.maxHeight] - Max height in px (scroll if exceeded)
 * @param {Function} [props.highlight] - Optional highlighter function (code, lang) => HTML string
 * @param {string} [props.class]
 * @param {...string} children - Code string(s)
 * @returns {HTMLElement}
 */
export function CodeBlock(props = {}, ...children) {
  injectBase();

  const { language, lineNumbers = false, copyable = true, maxHeight, highlight, class: cls } = props;
  const code = children.join('');
  const lines = code.split('\n');

  const wrap = h('div', { class: cx('d-codeblock', cls) });

  // Header bar (language label + copy button)
  if (language || copyable) {
    const header = h('div', { class: 'd-codeblock-header' });

    if (language) {
      header.appendChild(h('span', { class: 'd-codeblock-lang' }, language));
    }

    if (copyable) {
      const copyBtn = h('button', {
        type: 'button',
        class: 'd-codeblock-copy',
        'aria-label': 'Copy code'
      }, 'Copy');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        } catch (_) {
          copyBtn.textContent = 'Failed';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        }
      });
      header.appendChild(copyBtn);
    }

    wrap.appendChild(header);
  }

  // Code area
  const pre = h('pre', {
    class: 'd-codeblock-pre',
    style: maxHeight ? { maxHeight: `${maxHeight}px`, overflow: 'auto' } : undefined
  });

  if (lineNumbers) {
    const gutter = h('span', { class: 'd-codeblock-gutter', 'aria-hidden': 'true' });
    for (let i = 1; i <= lines.length; i++) {
      gutter.appendChild(h('span', { class: 'd-codeblock-ln' }, String(i)));
      if (i < lines.length) gutter.appendChild(document.createTextNode('\n'));
    }
    pre.appendChild(gutter);
  }

  const codeEl = h('code', {
    class: cx('d-codeblock-code', language && `language-${language}`)
  });
  if (highlight && language) {
    codeEl.innerHTML = highlight(code, language);
  } else {
    codeEl.textContent = code;
  }
  pre.appendChild(codeEl);

  wrap.appendChild(pre);
  return wrap;
}
