import { injectBase, cx } from './_base.js';

const SIZES = { xs: 12, sm: 16, default: 20, lg: 28 };
const SIZE_CLS = { xs: 'd-spinner-xs', sm: 'd-spinner-sm', lg: 'd-spinner-lg' };
const NS = 'http://www.w3.org/2000/svg';

/**
 * @param {Object} [props]
 * @param {string} [props.size] - xs|sm|default|lg (default: 'default')
 * @param {string} [props.label] - Accessible label (default: 'Loading')
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Spinner(props = {}) {
  injectBase();

  const { size = 'default', label = 'Loading', class: cls, ...rest } = props;
  const px = SIZES[size] || SIZES.default;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(px));
  svg.setAttribute('height', String(px));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('role', 'status');
  svg.setAttribute('aria-label', label);

  const className = cx('d-spinner', SIZE_CLS[size], cls);
  svg.setAttribute('class', className);

  for (const [k, v] of Object.entries(rest)) {
    svg.setAttribute(k, v);
  }

  // Track circle
  const track = document.createElementNS(NS, 'circle');
  track.setAttribute('cx', '12');
  track.setAttribute('cy', '12');
  track.setAttribute('r', '10');
  track.setAttribute('stroke', 'currentColor');
  track.setAttribute('stroke-opacity', '0.2');
  track.setAttribute('stroke-width', '3');
  svg.appendChild(track);

  // Animated arc
  const arc = document.createElementNS(NS, 'circle');
  arc.setAttribute('cx', '12');
  arc.setAttribute('cy', '12');
  arc.setAttribute('r', '10');
  arc.setAttribute('stroke', 'currentColor');
  arc.setAttribute('stroke-width', '3');
  arc.setAttribute('stroke-linecap', 'round');
  arc.setAttribute('stroke-dasharray', '31.4 31.4');
  arc.setAttribute('class', 'd-spinner-arc');
  svg.appendChild(arc);

  // Visually-hidden text for screen readers
  const srText = document.createElement('span');
  srText.className = 'd-sr-only';
  srText.textContent = label;

  const wrap = document.createElement('span');
  wrap.className = cx('d-spinner-wrap', cls ? undefined : undefined);
  wrap.appendChild(svg);
  wrap.appendChild(srText);

  return wrap;
}
