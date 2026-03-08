import { h, css, injectBase, cx } from '../_shared.js';
import { Input, Button, Badge, Avatar, icon } from '../../components/index.js';

/**
 * Dashboard top header bar.
 * @param {Object} [props]
 * @param {string} [props.title] - Heading text
 * @param {boolean} [props.search] - Show search input
 * @param {boolean} [props.notifications] - Show bell icon with badge
 * @param {boolean} [props.userMenu] - Show user avatar
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function DashboardHeader(props = {}, ...children) {
  injectBase();

  const { title, search, notifications, userMenu, class: cls } = props;

  const header = h('header', {
    class: cx(css('_flex _aic _jcsb _px6 _py3'), cls),
    style: {
      background: 'var(--c0)',
      borderBottom: '1px solid var(--c5)',
      minHeight: '56px',
      flexShrink: '0'
    }
  });

  // Left section: title
  const left = h('div', { class: css('_flex _aic _gap4') });

  if (title) {
    left.appendChild(
      h('h1', {
        class: css('_m0 _textxl _fwtitle _fg3')
      }, title)
    );
  }

  header.appendChild(left);

  // Right section: search, notifications, user menu
  const right = h('div', { class: css('_flex _aic _gap3') });

  if (search) {
    right.appendChild(
      Input({
        type: 'search',
        placeholder: 'Search...',
        class: css('_w48')
      })
    );
  }

  if (notifications) {
    const bellIcon = icon('bell', { size: '1.25em' });
    const bellBtn = Button(
      { variant: 'ghost', 'aria-label': 'Notifications' },
      bellIcon
    );
    right.appendChild(
      Badge({ count: 3, color: 'var(--c9)' }, bellBtn)
    );
  }

  if (userMenu) {
    right.appendChild(
      Avatar({ fallback: 'U', size: 'sm' })
    );
  }

  // Append extra children to right section
  for (const child of children) {
    if (child && typeof child === 'object' && child.nodeType) {
      right.appendChild(child);
    }
  }

  header.appendChild(right);

  return header;
}
