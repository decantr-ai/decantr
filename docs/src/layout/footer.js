import { h } from 'decantr/core';

export function Footer() {
  return h('footer', {
    style: {
      padding: '1.5rem 2rem', borderTop: '1px solid var(--c5)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '0.8125rem', color: 'var(--c4)'
    }
  },
    h('span', null, '\u00a9 2025 decantr. MIT License.'),
    h('div', { style: { display: 'flex', gap: '1rem' } },
      h('a', { href: 'https://github.com/decantr-ai/decantr', target: '_blank', rel: 'noopener', style: { color: 'var(--c4)' } }, 'GitHub'),
      h('a', { href: 'https://www.npmjs.com/package/decantr', target: '_blank', rel: 'noopener', style: { color: 'var(--c4)' } }, 'npm')
    )
  );
}
