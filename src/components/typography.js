/**
 * Typography — Title, Text, Paragraph, Link, Blockquote.
 * Semantic text components with consistent token-based sizing.
 *
 * @module decantr/components/typography
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * Title — Heading element (h1-h5) with consistent styling.
 * @param {Object} [props]
 * @param {1|2|3|4|5} [props.level=3] - Heading level (1-5)
 * @param {string} [props.type] - secondary|success|warning|danger
 * @param {boolean} [props.mark]
 * @param {boolean} [props.underline]
 * @param {boolean} [props.strikethrough]
 * @param {boolean} [props.disabled]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Title(props = {}, ...children) {
  injectBase();
  const { level = 3, type, mark, underline, strikethrough, disabled, class: cls, ...rest } = props;
  const tag = `h${Math.max(1, Math.min(5, level))}`;
  const className = cx(
    'd-title',
    `d-title-${level}`,
    type && `d-text-${type}`,
    disabled && 'd-text-disabled',
    cls
  );
  let content = children;
  if (mark) content = [h('mark', { class: 'd-text-mark' }, ...content)];
  if (underline) content = [h('u', null, ...content)];
  if (strikethrough) content = [h('s', null, ...content)];
  return h(tag, { class: className, ...rest }, ...content);
}

/**
 * Text — Inline text with semantic variants.
 * @param {Object} [props]
 * @param {string} [props.type] - secondary|success|warning|danger
 * @param {boolean} [props.strong]
 * @param {boolean} [props.italic]
 * @param {boolean} [props.underline]
 * @param {boolean} [props.strikethrough]
 * @param {boolean} [props.code]
 * @param {boolean} [props.keyboard]
 * @param {boolean} [props.mark]
 * @param {boolean} [props.disabled]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Text(props = {}, ...children) {
  injectBase();
  const { type, strong, italic, underline, strikethrough, code, keyboard, mark, disabled, class: cls, ...rest } = props;

  if (code) return h('code', { class: cx('d-text-code', type && `d-text-${type}`, cls), ...rest }, ...children);
  if (keyboard) return h('kbd', { class: cx('d-kbd', cls), ...rest }, ...children);

  const className = cx(
    'd-text',
    type && `d-text-${type}`,
    strong && 'd-text-strong',
    italic && 'd-text-italic',
    underline && 'd-text-underline',
    strikethrough && 'd-text-strikethrough',
    disabled && 'd-text-disabled',
    cls
  );

  let content = children;
  if (mark) content = [h('mark', { class: 'd-text-mark' }, ...content)];

  return h('span', { class: className, ...rest }, ...content);
}

/**
 * Paragraph — Block-level text with relaxed line-height.
 * @param {Object} [props]
 * @param {string} [props.type] - secondary|success|warning|danger
 * @param {boolean} [props.strong]
 * @param {boolean} [props.italic]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Paragraph(props = {}, ...children) {
  injectBase();
  const { type, strong, italic, class: cls, ...rest } = props;
  const className = cx(
    'd-paragraph',
    type && `d-text-${type}`,
    strong && 'd-text-strong',
    italic && 'd-text-italic',
    cls
  );
  return h('p', { class: className, ...rest }, ...children);
}

/**
 * Link — Anchor element with consistent styling.
 * @param {Object} [props]
 * @param {string} [props.href]
 * @param {string} [props.target]
 * @param {string} [props.type] - secondary|success|warning|danger
 * @param {boolean} [props.disabled]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Link(props = {}, ...children) {
  injectBase();
  const { href, target, type, disabled, class: cls, ...rest } = props;
  const className = cx('d-link', type && `d-text-${type}`, disabled && 'd-text-disabled', cls);
  const el = h('a', { class: className, href, target, ...rest }, ...children);
  if (target === '_blank') el.setAttribute('rel', 'noopener noreferrer');
  if (disabled) { el.setAttribute('aria-disabled', 'true'); el.setAttribute('tabindex', '-1'); }
  return el;
}

/**
 * Blockquote — Styled quotation block.
 * @param {Object} [props]
 * @param {string} [props.class]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function Blockquote(props = {}, ...children) {
  injectBase();
  const { class: cls, ...rest } = props;
  return h('blockquote', { class: cx('d-blockquote', cls), ...rest }, ...children);
}
