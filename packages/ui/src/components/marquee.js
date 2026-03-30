/**
 * Marquee — Continuously scrolling content strip with seamless loop.
 * Uses CSS animation (d-marquee) — no JS animation frames.
 *
 * @module decantr/components/marquee
 */
import { h } from '../core/index.js';
import { onDestroy } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {number} [props.speed=30] - Duration in seconds for one full cycle
 * @param {'left'|'right'} [props.direction='left'] - Scroll direction
 * @param {boolean} [props.pauseOnHover=true] - Pause animation on hover
 * @param {number} [props.gap=8] - Gap scale between items (atom scale number)
 * @param {number} [props.repeat=4] - Times to repeat items per segment (ensures viewport fill)
 * @param {string} [props.class]
 * @param {...(HTMLElement|string)} children - Items to scroll
 * @returns {HTMLElement}
 */
export function Marquee(props = {}, ...children) {
  injectBase();

  const {
    speed = 30,
    direction = 'left',
    pauseOnHover = true,
    gap = 8,
    repeat = 4,
    class: cls
  } = props;

  const wrap = h('div', {
    class: cx('d-marquee-wrap', cls),
    'aria-hidden': 'true'
  });

  const trackClass = cx(
    'd-marquee',
    direction === 'right' && 'd-marquee-reverse'
  );

  const track = h('div', {
    class: trackClass
  });
  track.style.setProperty('--d-marquee-duration', `${speed}s`);

  if (!pauseOnHover) {
    track.style.setProperty('pointer-events', 'none');
  }

  // Build two identical segments for seamless loop.
  // Each segment repeats children `repeat` times to guarantee viewport fill.
  if (gap !== 8) {
    track.style.setProperty('--d-marquee-gap', `var(--d-sp-${gap})`);
  }
  for (let copy = 0; copy < 2; copy++) {
    const segment = h('div', {
      class: 'd-marquee-segment'
    });
    for (let r = 0; r < repeat; r++) {
      for (const child of children) {
        if (child instanceof Node) {
          segment.appendChild(copy === 0 && r === 0 ? child : child.cloneNode(true));
        } else {
          segment.appendChild(document.createTextNode(String(child)));
        }
      }
    }
    track.appendChild(segment);
  }

  wrap.appendChild(track);
  return wrap;
}
