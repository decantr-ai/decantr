/**
 * Tour — Step-by-step onboarding guide that highlights elements on the page.
 * Draws a spotlight overlay + popover with step content.
 *
 * @module decantr/components/tour
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ target: HTMLElement|string, title?: string, description?: string, placement?: 'top'|'bottom'|'left'|'right' }[]} props.steps
 * @param {Function} [props.onFinish]
 * @param {Function} [props.onChange] - Called with (currentStep, direction)
 * @param {Function} [props.onClose]
 * @param {string} [props.class]
 * @returns {{ start: Function, next: Function, prev: Function, close: Function, goTo: Function }}
 */
export function Tour(props = {}) {
  injectBase();
  const { steps = [], onFinish, onChange, onClose, class: cls } = props;

  let current = 0;
  let overlay = null;
  let popover = null;

  function resolveTarget(target) {
    if (typeof target === 'string') return document.querySelector(target);
    return target;
  }

  function createOverlayEl() {
    return h('div', { class: cx('d-tour-overlay', cls) });
  }

  function positionPopover(targetEl, placement = 'bottom') {
    if (!targetEl || !popover) return;
    const rect = targetEl.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Spotlight cutout
    overlay.style.setProperty('--tour-x', `${rect.left + scrollX}px`);
    overlay.style.setProperty('--tour-y', `${rect.top + scrollY}px`);
    overlay.style.setProperty('--tour-w', `${rect.width}px`);
    overlay.style.setProperty('--tour-h', `${rect.height}px`);

    // Position popover
    let top, left;
    if (placement === 'bottom') { top = rect.bottom + scrollY + 12; left = rect.left + scrollX; }
    else if (placement === 'top') { top = rect.top + scrollY - 12; left = rect.left + scrollX; popover.style.transform = 'translateY(-100%)'; }
    else if (placement === 'left') { top = rect.top + scrollY; left = rect.left + scrollX - 12; popover.style.transform = 'translateX(-100%)'; }
    else { top = rect.top + scrollY; left = rect.right + scrollX + 12; }

    popover.style.position = 'absolute';
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  }

  function renderStep() {
    const step = steps[current];
    if (!step) return;
    const targetEl = resolveTarget(step.target);

    if (popover) popover.remove();

    const prevBtn = h('button', { type: 'button', class: 'd-btn d-btn-sm d-btn-outline', disabled: current === 0 }, 'Prev');
    const nextBtn = h('button', { type: 'button', class: 'd-btn d-btn-sm d-btn-primary' },
      current === steps.length - 1 ? 'Finish' : 'Next');
    const closeBtn = h('button', { type: 'button', class: 'd-tour-close', 'aria-label': 'Close tour' }, '\u00d7');

    const body = h('div', { class: 'd-tour-body' });
    if (step.title) body.appendChild(h('div', { class: 'd-tour-title' }, step.title));
    if (step.description) body.appendChild(h('div', { class: 'd-tour-desc' }, step.description));

    const footer = h('div', { class: 'd-tour-footer' },
      h('span', { class: 'd-tour-steps' }, `${current + 1} / ${steps.length}`),
      h('div', { class: 'd-tour-actions' }, prevBtn, nextBtn)
    );

    popover = h('div', { class: cx('d-tour-popover', cls) }, closeBtn, body, footer);
    document.body.appendChild(popover);

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', () => {
      if (current === steps.length - 1) { close(); if (onFinish) onFinish(); }
      else next();
    });
    closeBtn.addEventListener('click', close);

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => positionPopover(targetEl, step.placement));
    }
  }

  function start(stepIndex = 0) {
    if (typeof document === 'undefined') return;
    current = stepIndex;
    overlay = createOverlayEl();
    document.body.appendChild(overlay);
    renderStep();

    // Close on Escape
    document.addEventListener('keydown', _onKey);
  }

  function _onKey(e) {
    if (e.key === 'Escape') close();
  }

  function next() {
    if (current < steps.length - 1) {
      current++;
      if (onChange) onChange(current, 'next');
      renderStep();
    }
  }

  function prev() {
    if (current > 0) {
      current--;
      if (onChange) onChange(current, 'prev');
      renderStep();
    }
  }

  function goTo(index) {
    if (index >= 0 && index < steps.length) {
      current = index;
      if (onChange) onChange(current, 'goto');
      renderStep();
    }
  }

  function close() {
    if (overlay) { overlay.remove(); overlay = null; }
    if (popover) { popover.remove(); popover = null; }
    document.removeEventListener('keydown', _onKey);
    if (onClose) onClose();
  }

  return { start, next, prev, close, goTo };
}
