import { h } from 'decantr/core';
import { createSignal, createEffect } from 'decantr/state';
import { link } from 'decantr/router';
import { setTheme, getTheme, getThemeList, setStyle, getStyle, getStyleList } from 'decantr/css';

export function Navbar() {
  const [scrolled, setScrolled] = createSignal(false);

  const handler = () => setScrolled(window.scrollY > 20);
  window.addEventListener('scroll', handler, { passive: true });
  handler();

  const themes = getThemeList();
  const styles = getStyleList();

  const themeSelect = h('select', {
    'aria-label': 'Select theme',
    style: {
      padding: '0.25rem 0.375rem', borderRadius: '4px',
      border: '1px solid var(--c5)', background: 'transparent',
      color: 'var(--c3)', fontSize: '0.75rem', cursor: 'pointer'
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
      padding: '0.25rem 0.375rem', borderRadius: '4px',
      border: '1px solid var(--c5)', background: 'transparent',
      color: 'var(--c3)', fontSize: '0.75rem', cursor: 'pointer'
    },
    onchange: (e) => setStyle(e.target.value)
  },
    ...styles.map(s =>
      h('option', { value: s.id, selected: s.id === getStyle()() }, s.name)
    )
  );

  const nav = h('nav', {
    'aria-label': 'Main navigation',
    style: {
      position: 'fixed', top: '0', left: '0', right: '0',
      height: '64px', zIndex: '50',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem',
      transition: 'background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
      flexWrap: 'wrap'
    }
  },
    // Left: logo
    link({ href: '/', style: { textDecoration: 'none', fontWeight: '800', fontSize: '1.25rem', color: 'var(--c1)' } }, 'decantr'),

    // Center: nav links
    h('div', { style: { display: 'flex', gap: '1.5rem', alignItems: 'center' } },
      link({ href: '/getting-started', style: { textDecoration: 'none', color: 'var(--c3)', fontSize: '0.875rem', fontWeight: '500' } }, 'Docs'),
      link({ href: '/components', style: { textDecoration: 'none', color: 'var(--c3)', fontSize: '0.875rem', fontWeight: '500' } }, 'Components'),
      h('a', {
        href: 'https://github.com/decantr-ai/decantr', target: '_blank', rel: 'noopener',
        style: { textDecoration: 'none', color: 'var(--c3)', fontSize: '0.875rem', fontWeight: '500' }
      }, 'GitHub')
    ),

    // Right: theme/style selects
    h('div', { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' } },
      themeSelect,
      styleSelect
    )
  );

  createEffect(() => {
    if (scrolled()) {
      nav.style.background = 'var(--c0)';
      nav.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      nav.style.backdropFilter = 'blur(12px)';
    } else {
      nav.style.background = 'color-mix(in srgb, var(--c0) 60%, transparent)';
      nav.style.boxShadow = 'none';
      nav.style.backdropFilter = 'blur(12px)';
    }
  });

  return nav;
}
