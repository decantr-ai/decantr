import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { icon } from './icon.js';

const SIZE_CLS = { xs: 'd-spinner-xs', sm: 'd-spinner-sm', lg: 'd-spinner-lg', xl: 'd-spinner-xl' };
const COLOR_CLS = { primary: 'd-spinner-primary', success: 'd-spinner-success', warning: 'd-spinner-warning', destructive: 'd-spinner-destructive', info: 'd-spinner-info', muted: 'd-spinner-muted' };
const NS = 'http://www.w3.org/2000/svg';

const { span } = tags;

function createRingSVG() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');

  const track = document.createElementNS(NS, 'circle');
  track.setAttribute('cx', '12');
  track.setAttribute('cy', '12');
  track.setAttribute('r', '10');
  track.setAttribute('stroke', 'currentColor');
  track.setAttribute('stroke-opacity', '0.2');
  track.setAttribute('stroke-width', '3');
  svg.appendChild(track);

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

function createDots() {
  const el = span({ class: 'd-spinner-dots' });
  for (let i = 0; i < 3; i++) el.appendChild(span());
  return el;
}

function createPulse() {
  const el = span({ class: 'd-spinner-pulse' });
  el.appendChild(span());
  return el;
}

function createBars() {
  const el = span({ class: 'd-spinner-bars' });
  for (let i = 0; i < 4; i++) el.appendChild(span());
  return el;
}

function createOrbit() {
  const el = span({ class: 'd-spinner-orbit' });
  for (let i = 0; i < 2; i++) el.appendChild(span());
  return el;
}

/**
 * Spinner component with multiple animation variants.
 *
 * @param {Object} [props]
 * @param {'ring'|'dots'|'pulse'|'bars'|'orbit'} [props.variant='ring'] - Animation style
 * @param {string} [props.size] - xs|sm|default|lg|xl
 * @param {'primary'|'success'|'warning'|'destructive'|'info'|'muted'} [props.color] - Semantic color
 * @param {string} [props.icon] - Icon name for hybrid mode (ring spins around static center icon)
 * @param {string} [props.label] - Accessible label (default: 'Loading')
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Spinner(props = {}) {
  injectBase();

  const { variant = 'ring', size = 'default', color, icon: iconName, label = 'Loading', class: cls, ...rest } = props;

  let inner;
  if (iconName) {
    inner = span({ class: cx('d-spinner-hybrid', SIZE_CLS[size]) });
    inner.appendChild(createRingSVG());
    const centerIcon = icon(iconName, { size: '45%' });
    inner.appendChild(centerIcon);
  } else {
    switch (variant) {
      case 'dots': inner = createDots(); break;
      case 'pulse': inner = createPulse(); break;
      case 'bars': inner = createBars(); break;
      case 'orbit': inner = createOrbit(); break;
      default: inner = createRingSVG(); break;
    }
  }

  const srText = span({ class: 'd-sr-only' }, label);

  const wrap = span({
    class: cx('d-spinner-wrap', SIZE_CLS[size], COLOR_CLS[color], cls),
    role: 'status',
    'aria-label': label
  });
  for (const [k, v] of Object.entries(rest)) {
    wrap.setAttribute(k, v);
  }
  wrap.appendChild(inner);
  wrap.appendChild(srText);

  return wrap;
}
