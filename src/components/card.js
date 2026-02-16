import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.title]
 * @param {boolean} [props.hoverable]
 * @param {string} [props.class]
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function Card(props = {}, ...children) {
  injectBase();

  const { title, hoverable, class: cls } = props;

  const cardClass = cx('d-card', hoverable && 'd-card-hover', cls);

  const parts = [];
  if (title) {
    parts.push(h('div', { class: 'd-card-header' }, title));
  }

  // Check if children use Card.Header/Body/Footer pattern
  // If none are Card sections, wrap all in a body
  const hasSection = children.some(c =>
    c && typeof c === 'object' && c.nodeType === 1 &&
    (c.className || '').split(/\s+/).some(cls =>
      cls === 'd-card-header' || cls === 'd-card-body' || cls === 'd-card-footer'
    )
  );

  if (hasSection) {
    parts.push(...children);
  } else if (children.length) {
    parts.push(h('div', { class: 'd-card-body' }, ...children));
  }

  return h('div', { class: cardClass }, ...parts);
}

/**
 * Card.Header - card header section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Card.Header = function CardHeader(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-card-header', cls) }, ...children);
};

/**
 * Card.Body - card body section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Card.Body = function CardBody(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-card-body', cls) }, ...children);
};

/**
 * Card.Footer - card footer section
 * @param {Object} [props]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
Card.Footer = function CardFooter(props = {}, ...children) {
  const { class: cls } = props;
  return h('div', { class: cx('d-card-footer', cls) }, ...children);
};
