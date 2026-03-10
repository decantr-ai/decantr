import { h, createEffect, css, injectBase, cx, resolve } from '../_shared.js';

/**
 * Category filter navigation with pill-style buttons.
 * @param {Object} [props]
 * @param {Array<{id: string, label: string, count?: number}>} [props.categories] - Category entries
 * @param {string|Function} [props.active] - Currently active category ID (signal getter or string)
 * @param {Function} [props.onChange] - Callback when category clicked: onChange(id)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function CategoryNav(props = {}) {
  injectBase();

  const { categories = [], active, onChange, class: cls } = props;

  const nav = h('nav', {
    class: cx(css('_flex _aic _gap2 _wrap'), cls),
    'aria-label': 'Categories'
  });

  const buttonEls = [];

  for (const cat of categories) {
    const btnContent = [cat.label];

    // Optional count badge
    if (cat.count !== undefined && cat.count !== null) {
      btnContent.push(
        h('span', {
          class: css('_t11 _fg4'),
          style: 'margin-left:0.25rem;opacity:0.7',
          'aria-label': `${cat.count} items`
        }, `${cat.count}`)
      );
    }

    const btn = h('button', {
      type: 'button',
      class: css('_t13 _medium'),
      style: buildPillStyle(false),
      'aria-pressed': 'false',
      onclick() {
        if (typeof onChange === 'function') {
          onChange(cat.id);
        }
      }
    }, ...btnContent);

    buttonEls.push({ el: btn, id: cat.id });
    nav.appendChild(btn);
  }

  // Reactive active state styling
  if (typeof active === 'function') {
    createEffect(() => {
      const currentId = active();
      for (const { el, id } of buttonEls) {
        const isActive = id === currentId;
        Object.assign(el.style, buildPillStyleObj(isActive));
        el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      }
    });
  } else if (active !== undefined) {
    for (const { el, id } of buttonEls) {
      const isActive = id === active;
      Object.assign(el.style, buildPillStyleObj(isActive));
      el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
  }

  // Hover effects
  for (const { el } of buttonEls) {
    el.addEventListener('mouseenter', () => {
      if (el.getAttribute('aria-pressed') !== 'true') {
        el.style.background = 'var(--d-border)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (el.getAttribute('aria-pressed') !== 'true') {
        el.style.background = 'transparent';
      }
    });
  }

  return nav;
}

/**
 * Build pill button style string (for initial inline style).
 * @param {boolean} isActive
 * @returns {string}
 */
function buildPillStyle(isActive) {
  const obj = buildPillStyleObj(isActive);
  return Object.entries(obj).map(([k, v]) => `${camelToKebab(k)}:${v}`).join(';');
}

/**
 * Build pill button style object.
 * @param {boolean} isActive
 * @returns {Object}
 */
function buildPillStyleObj(isActive) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease, color 0.15s ease',
    background: isActive ? 'var(--d-primary)' : 'transparent',
    color: isActive ? 'var(--d-bg)' : 'var(--d-fg)',
    outline: 'none'
  };
}

/**
 * Convert camelCase to kebab-case for CSS property names.
 * @param {string} str
 * @returns {string}
 */
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}
