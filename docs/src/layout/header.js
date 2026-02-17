import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { setTheme, getTheme, getThemeList, setStyle, getStyle, getStyleList } from 'decantr/css';
import { Button } from 'decantr/components';

export function Header() {
  const themes = getThemeList();
  const styles = getStyleList();

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

  const styleSelect = h('select', {
    'aria-label': 'Select style',
    style: {
      padding: '0.375rem 0.5rem', borderRadius: '6px',
      border: '1px solid var(--c5)', background: 'var(--c0)',
      color: 'var(--c3)', fontSize: '0.8125rem', cursor: 'pointer'
    },
    onchange: (e) => setStyle(e.target.value)
  },
    ...styles.map(s =>
      h('option', { value: s.id, selected: s.id === getStyle()() }, s.name)
    )
  );

  return h('header', {
    style: {
      padding: '0.75rem 1.5rem', background: 'var(--c2)',
      borderBottom: '1px solid var(--c5)',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem'
    }
  },
    h('label', { style: { fontSize: '0.75rem', color: 'var(--c4)', display: 'flex', alignItems: 'center', gap: '0.375rem' } },
      'Theme', themeSelect
    ),
    h('label', { style: { fontSize: '0.75rem', color: 'var(--c4)', display: 'flex', alignItems: 'center', gap: '0.375rem' } },
      'Style', styleSelect
    ),
    h('a', {
      href: 'https://github.com/decantr-ai/decantr',
      target: '_blank',
      rel: 'noopener',
      style: { color: 'var(--c4)', fontSize: '0.8125rem' }
    }, 'GitHub')
  );
}
