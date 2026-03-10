import { h, createEffect, css, injectBase, cx, resolve } from '../_shared.js';
import { createSignal } from '../../state/index.js';

/**
 * Table of contents with scroll tracking via IntersectionObserver.
 * @param {Object} [props]
 * @param {Array<{id: string, text: string, level: number}>} [props.headings] - Heading entries
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function TableOfContents(props = {}) {
  injectBase();

  const { headings = [], class: cls } = props;
  const [activeId, setActiveId] = createSignal(headings.length > 0 ? headings[0].id : '');

  const nav = h('nav', {
    class: cx(css('_sticky _flex _col _gap1'), cls),
    style: 'top:2rem',
    'aria-label': 'Table of contents'
  });

  // Title
  nav.appendChild(
    h('span', {
      class: css('_t12 _bold _fg4 _upper _mb2 _block'),
      style: 'letter-spacing:0.05em'
    }, 'Contents')
  );

  // Build link list
  const linkEls = [];

  for (const heading of headings) {
    // Indent based on heading level: h2 = 0, h3 = 1rem, h4 = 2rem, etc.
    const indentLevel = Math.max(0, (heading.level || 2) - 2);
    const indent = indentLevel > 0 ? `${indentLevel}rem` : '0';

    const linkEl = h('a', {
      href: `#${heading.id}`,
      class: css('_t13 _block _py1 _nounder'),
      style: `padding-left:${indent};text-decoration:none;border-left:2px solid transparent;transition:color 0.15s ease,border-color 0.15s ease`,
      'data-toc-id': heading.id
    }, heading.text);

    linkEls.push({ el: linkEl, id: heading.id });
    nav.appendChild(linkEl);
  }

  // Reactive styling for active link
  createEffect(() => {
    const current = activeId();
    for (const { el, id } of linkEls) {
      if (id === current) {
        el.style.color = 'var(--d-primary)';
        el.style.borderLeftColor = 'var(--d-primary)';
        el.style.fontWeight = '600';
      } else {
        el.style.color = 'var(--d-muted)';
        el.style.borderLeftColor = 'transparent';
        el.style.fontWeight = '400';
      }
    }
  });

  // Intersection observer for scroll tracking
  if (typeof IntersectionObserver !== 'undefined') {
    // Defer observer setup to allow DOM to be mounted
    requestAnimationFrame(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          }
        },
        { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
      );

      for (const heading of headings) {
        const target = document.getElementById(heading.id);
        if (target) observer.observe(target);
      }

      // Store observer reference for cleanup
      nav._tocObserver = observer;
    });
  }

  return nav;
}
