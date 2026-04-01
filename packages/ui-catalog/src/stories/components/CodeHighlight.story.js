import { createHighlighter } from '@decantr/ui/components';
import { h } from '@decantr/ui/core';

const jsSample = `const greet = (name) => {
  // Say hello
  return \`Hello, \${name}!\`;
};
console.log(greet("World"));`;

const bashSample = `#!/bin/bash
# Deploy script
export NODE_ENV="production"
npm run build && docker compose up -d
echo "Deployed!"`;

const htmlSample = `<!-- Navigation -->
<nav class="header">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>`;

const jsonSample = `{
  "name": "decantr",
  "version": "0.4.1",
  "private": true,
  "dependencies": { "vite": "^5.0.0" }
}`;

function renderHighlighted(code, language) {
  const html = createHighlighter(code, language);
  const pre = h('pre', { style: { padding: '16px', background: '#1e1e1e', color: '#d4d4d4', borderRadius: '8px', overflow: 'auto', fontSize: '14px' } });
  const codeEl = h('code', null);
  codeEl.innerHTML = html;
  pre.appendChild(codeEl);
  return pre;
}

export default {
  component: (props) => renderHighlighted(props._code || jsSample, props._language || 'js'),
  title: 'CodeHighlight',
  category: 'components/media',
  description: 'Minimal regex-based syntax highlighter supporting JS, Bash, HTML, and JSON.',
  variants: [
    { name: 'JavaScript', props: { _code: jsSample, _language: 'js' } },
    { name: 'Bash', props: { _code: bashSample, _language: 'bash' } },
    { name: 'HTML', props: { _code: htmlSample, _language: 'html' } },
    { name: 'JSON', props: { _code: jsonSample, _language: 'json' } },
    { name: 'Unknown Language', props: { _code: 'Some plain text with no highlighting.', _language: 'txt' } },
  ],
  playground: {
    defaults: { _language: 'js', _code: jsSample },
    controls: [
      { name: '_language', type: 'select', options: ['js', 'bash', 'html', 'json'] },
    ],
  },
  usage: [
    {
      title: 'Highlight JavaScript',
      code: `import { createHighlighter } from '@decantr/ui/components';

const html = createHighlighter('const x = 42;', 'js');
// Returns: '<span class="d-hl-keyword">const</span> x <span class="d-hl-operator">=</span> <span class="d-hl-number">42</span>;'

const el = document.createElement('code');
el.innerHTML = html;`,
    },
    {
      title: 'Use with CodeBlock',
      code: `import { CodeBlock, createHighlighter } from '@decantr/ui/components';

const block = CodeBlock(
  { language: 'js', highlight: createHighlighter, lineNumbers: true },
  'function add(a, b) { return a + b; }'
);`,
    },
  ],
};
