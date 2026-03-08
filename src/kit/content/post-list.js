import { h, css, injectBase, cx, resolve } from '../_shared.js';
import { Card } from '../../components/index.js';

/**
 * List of blog post cards in a grid or stack layout.
 * @param {Object} [props]
 * @param {Array<{title: string, excerpt: string, date: string, href: string, author: string, image: string}>} [props.posts] - Post entries
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function PostList(props = {}) {
  injectBase();

  const { posts = [], class: cls } = props;

  const container = h('div', {
    class: cx(css('_grid _gcaf300 _gap6'), cls)
  });

  for (const post of posts) {
    // Card body content
    const bodyParts = [];

    // Title as link
    if (post.title) {
      const titleEl = post.href
        ? h('a', {
            href: post.href,
            class: css('_t16 _bold _fg3 _nounder _block _mb2'),
            style: 'line-height:1.3'
          }, post.title)
        : h('h3', {
            class: css('_t16 _bold _fg3 _mb2'),
            style: 'margin:0;line-height:1.3'
          }, post.title);

      bodyParts.push(titleEl);
    }

    // Excerpt
    if (post.excerpt) {
      bodyParts.push(
        h('p', {
          class: css('_t14 _fg4 _mb3 _lhnormal'),
          style: 'margin-top:0'
        }, post.excerpt)
      );
    }

    // Meta row: date + author
    const metaParts = [];

    if (post.date) {
      metaParts.push(
        h('time', {
          class: css('_t12 _fg4'),
          datetime: post.date
        }, post.date)
      );
    }

    if (post.author) {
      if (metaParts.length > 0) {
        metaParts.push(
          h('span', { class: css('_fg5'), 'aria-hidden': 'true' }, '\u00B7')
        );
      }
      metaParts.push(
        h('span', { class: css('_t12 _fg4') }, post.author)
      );
    }

    if (metaParts.length > 0) {
      bodyParts.push(
        h('div', { class: css('_flex _aic _gap2') }, ...metaParts)
      );
    }

    // Build card: with image header or plain
    if (post.image) {
      container.appendChild(
        Card({ hoverable: true },
          h('img', {
            src: post.image,
            alt: '',
            'aria-hidden': 'true',
            style: 'width:100%;height:180px;object-fit:cover;display:block'
          }),
          Card.Body({}, ...bodyParts)
        )
      );
    } else {
      container.appendChild(
        Card({ hoverable: true }, ...bodyParts)
      );
    }
  }

  return container;
}
