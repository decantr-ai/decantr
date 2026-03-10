import { h, createEffect, css, injectBase, cx, resolve, reactiveText } from '../_shared.js';
import { link } from '../../router/index.js';
import { icon } from '../../components/index.js';
import { createSignal } from '../../state/index.js';

/**
 * Sidebar navigation component.
 * @param {Object} [props]
 * @param {Array<{href: string, label: string, icon?: string}>} [props.nav] - Navigation links
 * @param {string} [props.branding] - App name shown at top
 * @param {boolean} [props.collapsible] - Adds a toggle button
 * @param {boolean|Function} [props.collapsed] - Collapsed state (signal getter or boolean)
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function Sidebar(props = {}, ...children) {
  injectBase();

  const { nav = [], branding, collapsible, collapsed, class: cls } = props;

  // Internal collapsed state: use provided signal or create one
  const hasExternalSignal = typeof collapsed === 'function';
  const [internalCollapsed, setInternalCollapsed] = hasExternalSignal
    ? [collapsed, null]
    : createSignal(!!collapsed);

  const navEl = h('nav', {
    class: cx('d-sidebar', cls),
    role: 'navigation',
    'aria-label': 'Main navigation'
  });

  // Reactive width based on collapsed state
  createEffect(() => {
    const isCollapsed = internalCollapsed();
    navEl.style.width = isCollapsed ? '64px' : '240px';
  });

  // Apply base styles
  Object.assign(navEl.style, {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--d-surface-1)',
    borderRight: '1px solid var(--d-border)',
    transition: 'width 0.2s ease',
    overflow: 'hidden',
    flexShrink: '0'
  });

  // Branding
  if (branding) {
    const brandEl = h('div', {
      class: css('_flex _aic _px4 _py4 _fwtitle _textlg _fg3 _wsnw')
    }, branding);

    // Hide brand text when collapsed
    createEffect(() => {
      brandEl.style.justifyContent = internalCollapsed() ? 'center' : 'flex-start';
      brandEl.textContent = internalCollapsed() ? branding.charAt(0) : branding;
    });

    navEl.appendChild(brandEl);
  }

  // Collapsible toggle button
  if (collapsible) {
    const toggleBtn = h('button', {
      class: css('_flex _aic _jcc _p2 _mx2 _mb2 _textsm _lh1 _fg4 _pointer'),
      style: {
        background: 'transparent',
        border: '1px solid var(--d-border)',
        borderRadius: 'var(--d-radius, 6px)'
      },
      'aria-label': 'Toggle sidebar',
      onclick() {
        if (setInternalCollapsed) {
          setInternalCollapsed(prev => !prev);
        }
      }
    });

    createEffect(() => {
      toggleBtn.textContent = internalCollapsed() ? '\u25B6' : '\u25C0';
    });

    navEl.appendChild(toggleBtn);
  }

  // Navigation links
  const navList = h('ul', {
    style: { listStyle: 'none', margin: '0', padding: '0', flex: '1', overflowY: 'auto' }
  });

  for (const item of nav) {
    const linkContent = [];

    if (item.icon) {
      linkContent.push(icon(item.icon, { size: '1.25em' }));
    }

    const labelSpan = h('span', {
      style: { whiteSpace: 'nowrap', overflow: 'hidden' }
    }, item.label);

    // Hide label when collapsed
    createEffect(() => {
      labelSpan.style.display = internalCollapsed() ? 'none' : 'inline';
    });

    linkContent.push(labelSpan);

    const linkEl = link(
      {
        href: item.href,
        class: css('_flex _aic _gap2 _px4 _py2 _nounder _fg3 _textbase'),
        style: {
          borderRadius: 'var(--d-radius, 6px)',
          transition: 'background 0.15s ease'
        }
      },
      ...linkContent
    );

    linkEl.addEventListener('mouseenter', () => {
      linkEl.style.background = 'var(--d-border)';
    });
    linkEl.addEventListener('mouseleave', () => {
      linkEl.style.background = 'transparent';
    });

    const li = h('li', { style: { padding: '0.125rem 0.5rem' } }, linkEl);
    navList.appendChild(li);
  }

  navEl.appendChild(navList);

  // Append any extra children
  for (const child of children) {
    if (child && typeof child === 'object' && child.nodeType) {
      navEl.appendChild(child);
    }
  }

  return navEl;
}
