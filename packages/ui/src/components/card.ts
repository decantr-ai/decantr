import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { Skeleton } from './skeleton.js';

import { component } from '../runtime/component.js';
export interface CardProps {
  title?: string | Node;
  extra?: Node|Function;
  hoverable?: boolean;
  bordered?: boolean;
  loading?: boolean | (() => boolean);
  size?: 'default'|'sm';
  type?: 'inner';
  cover?: Node;
  actions?: Node[];
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string|Node} [props.title]
 * @param {Node|Function} [props.extra] - Top-right header content
 * @param {boolean} [props.hoverable]
 * @param {boolean} [props.bordered] - Toggle border (default true)
 * @param {boolean|Function} [props.loading] - Skeleton loading placeholder
 * @param {'default'|'sm'} [props.size]
 * @param {'inner'} [props.type] - Inner card variant
 * @param {Node} [props.cover] - Cover image shorthand
 * @param {Node[]} [props.actions] - Bottom action bar items
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export const Card = component<CardProps>((props: CardProps = {} as CardProps, ...children: (string | Node)[]) => {
  injectBase();

  const {
    title, extra, hoverable, bordered = true, loading, size, type,
    cover, actions, class: cls
  } = props;

  const cardClass = cx(
    'd-card',
    hoverable && 'd-card-hover',
    !bordered && 'd-card-borderless',
    size === 'sm' && 'd-card-sm',
    type === 'inner' && 'd-card-inner',
    cls
  );

  // Reactive loading — signal or boolean
  if (typeof loading === 'function') {
    const el = h('div', { class: cardClass });
    const buildContent = () => {
      el.innerHTML = '';
      if (loading()) {
        el.appendChild(h('div', { class: 'd-card-loading' }, Skeleton({ lines: 4 })));
      } else {
        buildCardContent(el, { title, extra, cover, actions }, children);
      }
    };
    createEffect(buildContent);
    return el;
  }

  if (loading) {
    return h('div', { class: cardClass },
      h('div', { class: 'd-card-loading' }, Skeleton({ lines: 4 }))
    );
  }

  const parts = [];
  buildCardContent(null, { title, extra, cover, actions }, children, parts);
  return h('div', { class: cardClass }, ...parts);
})

/**
 * Build card content parts — either appends to el or pushes to parts array.
 */
function buildCardContent(el, { title, extra, cover, actions }, children, parts) {
  const out = parts || [];
  const append = (node) => {
    if (el) el.appendChild(node);
    else out.push(node);
  };

  // Cover shorthand
  if (cover) append(Card.Cover({}, cover));

  // Title + extra → auto-create header
  if (title) append(Card.Header({ extra }, title));

  // Check if children use Card section pattern
  const hasSection = children.some(c =>
    c && typeof c === 'object' && c.nodeType === 1 &&
    (c.className || '').split(/\s+/).some(cls =>
      cls === 'd-card-header' || cls === 'd-card-body' || cls === 'd-card-footer' ||
      cls === 'd-card-cover' || cls === 'd-card-meta' || cls === 'd-card-grid' ||
      cls === 'd-card-actions'
    )
  );

  if (hasSection) {
    children.forEach(c => { if (c) append(c); });
  } else if (children.length) {
    append(h('div', { class: 'd-card-body' }, ...children));
  }

  // Actions shorthand
  if (actions && actions.length) append(Card.Actions({}, ...actions));
}

/**
 * Card.Header - card header section
 * @param {Object} [props]
 * @param {Node|Function} [props.extra] - Top-right header content
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface CardHeaderProps {
  class?: string;
  [key: string]: unknown;
}

Card.Header = function CardHeader(props: CardHeaderProps = {} as CardHeaderProps, ...children: (string | Node)[]) {
  const { extra, class: cls } = props;
  if (extra) {
    const extraNode = typeof extra === 'function' ? extra() : extra;
    return h('div', { class: cx('d-card-header d-card-header-extra', cls) },
      h('div', { class: 'd-card-header-content' }, ...children),
      h('div', { class: 'd-card-extra' }, extraNode)
    );
  }
  return h('div', { class: cx('d-card-header', cls) }, ...children);
};

/**
 * Card.Body - card body section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface CardBodyProps {
  class?: string;
  [key: string]: unknown;
}

Card.Body = function CardBody(props: CardBodyProps = {} as CardBodyProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return h('div', { class: cx('d-card-body', cls) }, ...children);
};

/**
 * Card.Footer - card footer section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */

export interface CardFooterProps {
  class?: string;
  [key: string]: unknown;
}

Card.Footer = function CardFooter(props: CardFooterProps = {} as CardFooterProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return h('div', { class: cx('d-card-footer', cls) }, ...children);
};

/**
 * Card.Cover - cover media area
 * @param {Object} [props]
 * @param {...Node} children
 * @returns {HTMLElement}
 */

export interface CardCoverProps {
  class?: string;
  [key: string]: unknown;
}

Card.Cover = function CardCover(props: CardCoverProps = {} as CardCoverProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return h('div', { class: cx('d-card-cover', cls) }, ...children);
};

/**
 * Card.Meta - avatar + title + description
 * @param {Object} [props]
 * @param {Node} [props.avatar]
 * @param {string|Node} [props.title]
 * @param {string|Node} [props.description]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */

export interface CardMetaProps {
  class?: string;
  [key: string]: unknown;
}

Card.Meta = function CardMeta(props: CardMetaProps = {} as CardMetaProps) {
  const { avatar, title, description, class: cls } = props;
  const detail = h('div', { class: 'd-card-meta-detail' });
  if (title) detail.appendChild(h('div', { class: 'd-card-meta-title' }, title));
  if (description) detail.appendChild(h('div', { class: 'd-card-meta-description' }, description));
  return h('div', { class: cx('d-card-meta', cls) },
    ...(avatar ? [avatar, detail] : [detail])
  );
};

/**
 * Card.Grid - grid sub-layout
 * @param {Object} [props]
 * @param {boolean} [props.hoverable]
 * @param {...Node} children
 * @returns {HTMLElement}
 */

export interface CardGridProps {
  class?: string;
  [key: string]: unknown;
}

Card.Grid = function CardGrid(props: CardGridProps = {} as CardGridProps, ...children: (string | Node)[]) {
  const { hoverable, class: cls } = props;
  return h('div', { class: cx('d-card-grid', hoverable && 'd-card-grid-hover', cls) }, ...children);
};

/**
 * Card.Actions - equal-width bottom action bar
 * @param {Object} [props]
 * @param {...Node} children
 * @returns {HTMLElement}
 */

export interface CardActionsProps {
  class?: string;
  [key: string]: unknown;
}

Card.Actions = function CardActions(props: CardActionsProps = {} as CardActionsProps, ...children: (string | Node)[]) {
  const { class: cls } = props;
  return h('div', { class: cx('d-card-actions', cls) }, ...children);
};
