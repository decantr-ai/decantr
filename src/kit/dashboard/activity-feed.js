import { h, css, injectBase, cx } from '../_shared.js';
import { Card, Avatar } from '../../components/index.js';

/**
 * Activity feed card.
 * @param {Object} [props]
 * @param {string} [props.title] - Section heading (default "Recent Activity")
 * @param {Array<{user: string, action: string, time: string, avatar?: string}>} [props.items] - Activity entries
 * @param {number} [props.count] - Max items to show (default 5)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ActivityFeed(props = {}) {
  injectBase();

  const {
    title = 'Recent Activity',
    items,
    count = 5,
    class: cls
  } = props;

  // Generate placeholder items if none provided
  const feedItems = items || [
    { user: 'System', action: 'No recent activity', time: 'just now' }
  ];

  const visibleItems = feedItems.slice(0, count);

  // Build card content
  const headerEl = Card.Header({},
    h('span', { class: css('_textmd _fwtitle _fg3') }, title)
  );

  const bodyContent = h('div', { class: css('_flex _col _gap3') });

  for (const item of visibleItems) {
    const row = h('div', {
      class: css('_flex _aic _gap3'),
      style: { padding: '0.25rem 0' }
    });

    // Avatar
    row.appendChild(
      Avatar({
        src: item.avatar,
        fallback: item.user ? item.user.charAt(0).toUpperCase() : '?',
        size: 'sm',
        alt: item.user || ''
      })
    );

    // Text content
    const textCol = h('div', {
      class: css('_flex _col'),
      style: { flex: '1', minWidth: '0' }
    });

    const actionText = h('span', {
      class: css('_textbase _fg3')
    });
    actionText.appendChild(
      h('strong', null, item.user || 'Unknown')
    );
    actionText.appendChild(
      document.createTextNode(` ${item.action}`)
    );
    textCol.appendChild(actionText);

    if (item.time) {
      textCol.appendChild(
        h('span', {
          class: css('_textsm _fg4')
        }, item.time)
      );
    }

    row.appendChild(textCol);
    bodyContent.appendChild(row);
  }

  const bodyEl = Card.Body({}, bodyContent);

  return Card({ class: cls }, headerEl, bodyEl);
}
