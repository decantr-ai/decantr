import { h } from 'decantr/core';
import { navigate } from 'decantr/router';
import { setTheme, getTheme, getThemeList } from 'decantr/css';

export function Header() {
  const themes = getThemeList();

  const themeSelect = h('select', {
    'aria-label': 'Select theme',
    style: {
      padding: '0.375rem 0.5rem', borderRadius: '6px',
      border: '1px solid var(--c5)', background: 'var(--c0)',
      color: 'var(--c3)', fontSize: '0.8125rem', cursor: 'pointer'
    },
    onchange: (e) => setTheme(e.target.value)
  },
    ...themes.map(t =>
      h('option', { value: t.id, selected: t.id === getTheme()() }, t.name)
    )
  );

  return h('header', {
    style: {
      padding: '0.75rem 1.5rem', background: 'var(--c2)',
      borderBottom: '1px solid var(--c5)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem'
    }
  },
    h('a', {
      href: '#/',
      onclick: (e) => { e.preventDefault(); navigate('/'); },
      style: { display: 'flex', alignItems: 'center', textDecoration: 'none' },
      'aria-label': 'decantr home'
    },
      h('img', {
        src: './images/logo.jpg',
        alt: 'decantr',
        style: { height: '28px', width: 'auto', borderRadius: '4px' }
      })
    ),
    h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
      h('label', { style: { fontSize: '0.75rem', color: 'var(--c4)', display: 'flex', alignItems: 'center', gap: '0.375rem' } },
        'Theme', themeSelect
      ),
      h('a', {
        href: 'https://github.com/decantr-ai/decantr',
        target: '_blank',
        rel: 'noopener',
        style: { color: 'var(--c4)', fontSize: '0.8125rem' }
      }, 'GitHub')
    )
  );
}
