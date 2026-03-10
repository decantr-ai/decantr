import { h, css, injectBase, cx } from '../_shared.js';
import { Card } from '../../components/index.js';

/**
 * Placeholder card for chart area.
 * @param {Object} [props]
 * @param {string} [props.title] - Chart title
 * @param {string} [props.height] - Height of placeholder area (default '200px')
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function ChartPlaceholder(props = {}) {
  injectBase();

  const { title = 'Chart', height = '200px', class: cls } = props;

  const placeholder = h('div', {
    class: css('_flex _center _textbase _medium _fg4'),
    style: {
      height,
      border: '2px dashed var(--d-border)',
      borderRadius: 'var(--d-radius, 6px)'
    }
  }, `Chart: ${title}`);

  return Card({ title, class: cls }, placeholder);
}
