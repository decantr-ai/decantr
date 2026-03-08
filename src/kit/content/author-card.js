import { h, css, injectBase, cx, resolve } from '../_shared.js';
import { Card, Avatar } from '../../components/index.js';

/**
 * Author info card with avatar, name, bio, and optional social links.
 * @param {Object} [props]
 * @param {string|Function} [props.name] - Author name (required)
 * @param {string|Function} [props.avatar] - URL string for avatar image
 * @param {string|Function} [props.bio] - Short biography text
 * @param {Array<{href: string, label: string}>} [props.social] - Social links
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function AuthorCard(props = {}) {
  injectBase();

  const { name, avatar, bio, social, class: cls } = props;

  const resolvedName = resolve(name);
  const resolvedAvatar = resolve(avatar);
  const resolvedBio = resolve(bio);

  // Avatar element
  const avatarEl = Avatar({
    src: resolvedAvatar,
    alt: resolvedName || '',
    fallback: resolvedName ? resolvedName.split(' ').map(w => w[0]).join('').slice(0, 2) : '?'
  });

  // Author info: name + bio
  const infoParts = [];

  if (resolvedName) {
    infoParts.push(
      h('span', {
        class: css('_bold _fg3 _t14')
      }, resolvedName)
    );
  }

  if (resolvedBio) {
    infoParts.push(
      h('span', {
        class: css('_fg4 _t12'),
        style: 'line-height:1.4'
      }, resolvedBio)
    );
  }

  // Social links
  if (social && social.length > 0) {
    const links = social.map(s =>
      h('a', {
        href: s.href,
        class: css('_fg1 _t12 _nounder'),
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': s.label
      }, s.label)
    );

    infoParts.push(
      h('div', { class: css('_flex _gap3 _wrap') }, ...links)
    );
  }

  const infoColumn = h('div', {
    class: css('_flex _col _gap1')
  }, ...infoParts);

  return Card({
    class: cls
  },
    h('div', { class: css('_flex _aic _gap4') },
      avatarEl,
      infoColumn
    )
  );
}
