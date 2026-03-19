import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { link } from 'decantr/router';
import { onDestroy } from 'decantr/core';
import { icon } from 'decantr/components';

const { nav, div, img, span, a } = tags;

export function NavHeader() {
  const el = nav({
    role: 'navigation',
    'aria-label': 'Main navigation',
    class: `ds-nav ${css('_fixed _top0 _left0 _w100 _z[var(--d-z-sticky)] _flex _aic _jcc')}`,
  },
    div({ class: css('_flex _row _aic _jcbetween _w100 _px6 _py3 _maxw[1100px]') },
      // Left: Logo + Wordmark
      link({ href: '/', exact: true, class: css('_flex _row _aic _gap3 _nounder') },
        img({ src: './images/logo.svg', alt: 'decantr', class: css('_w[28px]') }),
        span({ class: css('_bold _ls[-0.02em] _textlg _fgfg') },
          'decantr',
          span({ class: 'ds-pink' }, '.'),
          'a',
          span({ class: 'ds-pink' }, 'i'),
        ),
      ),

      // Right: Nav links
      div({ class: css('_flex _row _aic _gap6') },
        link({ href: '/showcase', activeClass: 'ds-nav-active', class: 'ds-nav-link' }, 'Showcase'),
        link({ href: '/docs', activeClass: 'ds-nav-active', class: 'ds-nav-link' }, 'Docs'),
        a({
          href: 'https://github.com/anthropics/decantr',
          target: '_blank',
          rel: 'noopener',
          class: css('ds-nav-link _flex _aic _gap1')
        },
          'GitHub',
          icon('external-link', { size: '0.875rem' })
        )
      ),
    ),
  );

  // Scroll-aware glass background
  function onScroll() {
    if (window.scrollY > 50) {
      el.classList.add('ds-nav-scrolled');
    } else {
      el.classList.remove('ds-nav-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onDestroy(() => window.removeEventListener('scroll', onScroll));

  return el;
}
