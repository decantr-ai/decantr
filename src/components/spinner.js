import { injectBase, cx } from './_base.js';
import { icon } from './icon.js';

const SIZES = { xs: 12, sm: 16, default: 20, lg: 28, xl: 36 };
const SIZE_CLS = { xs: 'd-spinner-xs', sm: 'd-spinner-sm', lg: 'd-spinner-lg', xl: 'd-spinner-xl' };
const NS = 'http://www.w3.org/2000/svg';

function createRingSVG(px, label) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(px));
  svg.setAttribute('height', String(px));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('role', 'status');
  svg.setAttribute('aria-label', label);

  // Track circle
  const track = document.createElementNS(NS, 'circle');
  track.setAttribute('cx', '12');
  track.setAttribute('cy', '12');
  track.setAttribute('r', '10');
  track.setAttribute('stroke', 'currentColor');
  track.setAttribute('stroke-opacity', '0.2');
  track.setAttribute('stroke-width', '3');
  svg.appendChild(track);

  // Animated arc — quarter arc (15.7 of 62.8 circumference)
  const arc = document.createElementNS(NS, 'circle');
  arc.setAttribute('cx', '12');
  arc.setAttribute('cy', '12');
  arc.setAttribute('r', '10');
  arc.setAttribute('stroke', 'currentColor');
  arc.setAttribute('stroke-width', '3');
  arc.setAttribute('stroke-linecap', 'round');
  arc.setAttribute('stroke-dasharray', '15.7 47.1');
  arc.setAttribute('class', 'd-spinner-arc');
  svg.appendChild(arc);

  return svg;
}

function createDots(px) {
  const el = document.createElement('span');
  el.className = 'd-spinner-dots';
  el.style.width = px + 'px';
  el.style.height = px + 'px';
  for (let i = 0; i < 3; i++) el.appendChild(document.createElement('span'));
  return el;
}

function createPulse(px) {
  const el = document.createElement('span');
  el.className = 'd-spinner-pulse';
  el.style.width = px + 'px';
  el.style.height = px + 'px';
  el.appendChild(document.createElement('span'));
  return el;
}

function createBars(px) {
  const el = document.createElement('span');
  el.className = 'd-spinner-bars';
  el.style.width = px + 'px';
  el.style.height = px + 'px';
  for (let i = 0; i < 4; i++) el.appendChild(document.createElement('span'));
  return el;
}

function createOrbit(px) {
  const el = document.createElement('span');
  el.className = 'd-spinner-orbit';
  el.style.width = px + 'px';
  el.style.height = px + 'px';
  for (let i = 0; i < 2; i++) el.appendChild(document.createElement('span'));
  return el;
}

/**
 * Spinner component with multiple animation variants.
 *
 * @param {Object} [props]
 * @param {'ring'|'dots'|'pulse'|'bars'|'orbit'} [props.variant='ring'] - Animation style
 * @param {string} [props.size] - xs|sm|default|lg|xl
 * @param {string} [props.icon] - Icon name for hybrid mode (ring spins around static center icon)
 * @param {string} [props.label] - Accessible label (default: 'Loading')
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Spinner(props = {}) {
  injectBase();

  const { variant = 'ring', size = 'default', icon: iconName, label = 'Loading', class: cls, ...rest } = props;
  const px = SIZES[size] || SIZES.default;

  let inner;
  if (iconName) {
    // Hybrid mode: spinning ring + static center icon
    inner = document.createElement('span');
    inner.className = cx('d-spinner-hybrid', SIZE_CLS[size]);
    inner.style.width = px + 'px';
    inner.style.height = px + 'px';
    inner.appendChild(createRingSVG(px, label));
    const centerIcon = icon(iconName, { size: Math.round(px * 0.45) + 'px' });
    inner.appendChild(centerIcon);
  } else {
    switch (variant) {
      case 'dots': inner = createDots(px); break;
      case 'pulse': inner = createPulse(px); break;
      case 'bars': inner = createBars(px); break;
      case 'orbit': inner = createOrbit(px); break;
      default: inner = createRingSVG(px, label); break;
    }
  }

  const className = cx('d-spinner', SIZE_CLS[size], cls);

  // Screen reader text
  const srText = document.createElement('span');
  srText.className = 'd-sr-only';
  srText.textContent = label;

  const wrap = document.createElement('span');
  wrap.className = cx('d-spinner-wrap', cls);
  wrap.setAttribute('role', 'status');
  wrap.setAttribute('aria-label', label);
  for (const [k, v] of Object.entries(rest)) {
    wrap.setAttribute(k, v);
  }
  wrap.appendChild(inner);
  wrap.appendChild(srText);

  return wrap;
}
