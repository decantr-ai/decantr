/**
 * Carousel — Slide-based content carousel with navigation and dots.
 *
 * @module decantr/components/carousel
 */
import { h, onCleanup } from '../core/index.js';
import { injectBase, cx } from './_base.js';
import { caret } from './_behaviors.js';

/**
 * @param {Object} [props]
 * @param {Node[]} [props.slides] - Array of slide elements
 * @param {boolean} [props.autoplay=false]
 * @param {number} [props.interval=3000] - Autoplay interval in ms
 * @param {boolean} [props.arrows=true] - Show prev/next arrows
 * @param {boolean} [props.dots=true] - Show dot indicators
 * @param {boolean} [props.loop=true] - Loop around edges
 * @param {Function} [props.onChange] - Called with current index
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Carousel(props = {}) {
  injectBase();
  const { slides = [], autoplay = false, interval = 3000, arrows = true, dots = true, loop = true, onChange, class: cls } = props;

  let current = 0;
  let _timer = null;

  const track = h('div', { class: 'd-carousel-track' });
  slides.forEach(slide => {
    const slideEl = h('div', { class: 'd-carousel-slide' });
    slideEl.appendChild(slide);
    track.appendChild(slideEl);
  });

  const container = h('div', { class: cx('d-carousel', cls) }, track);

  function goTo(idx) {
    if (!loop) idx = Math.max(0, Math.min(idx, slides.length - 1));
    else idx = (idx + slides.length) % slides.length;
    current = idx;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    if (onChange) onChange(current);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Arrows
  if (arrows && slides.length > 1) {
    const prevBtn = h('button', { type: 'button', class: 'd-carousel-nav d-carousel-prev', 'aria-label': 'Previous slide' }, caret('left'));
    const nextBtn = h('button', { type: 'button', class: 'd-carousel-nav d-carousel-next', 'aria-label': 'Next slide' }, caret('right'));
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
  }

  // Dots
  let dotEls = [];
  function updateDots() {
    dotEls.forEach((d, i) => d.classList.toggle('d-carousel-dot-active', i === current));
  }

  if (dots && slides.length > 1) {
    const dotsContainer = h('div', { class: 'd-carousel-dots' });
    slides.forEach((_, i) => {
      const dot = h('button', {
        type: 'button',
        class: cx('d-carousel-dot', i === 0 && 'd-carousel-dot-active'),
        'aria-label': `Slide ${i + 1}`
      });
      dot.addEventListener('click', () => goTo(i));
      dotEls.push(dot);
      dotsContainer.appendChild(dot);
    });
    container.appendChild(dotsContainer);
  }

  // Autoplay
  if (autoplay && slides.length > 1) {
    function startTimer() { _timer = setInterval(next, interval); }
    function stopTimer() { clearInterval(_timer); }
    startTimer();
    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', startTimer);
    onCleanup(() => { clearInterval(_timer); });
  }

  // Keyboard
  container.setAttribute('tabindex', '0');
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });

  return container;
}
