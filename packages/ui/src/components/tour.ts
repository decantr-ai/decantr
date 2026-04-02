/**
 * Tour — Step-by-step onboarding guide that highlights elements on the page.
 * Draws a spotlight overlay + popover with step content.
 *
 * @module decantr/components/tour
 */
import { onDestroy } from '../runtime/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface TourProps {
  onFinish?: (...args: unknown[]) => unknown;
  onChange?: (...args: unknown[]) => unknown;
  onClose?: () => void;
  class?: string;
  steps?: unknown;
  [key: string]: unknown;
}

const { div, span, button: buttonTag } = tags;

/**
 * @param {Object} [props]
 * @param {{ target: HTMLElement|string, title?: string, description?: string, placement?: 'top'|'bottom'|'left'|'right' }[]} props.steps
 * @param {Function} [props.onFinish]
 * @param {Function} [props.onChange] - Called with (currentStep, direction)
 * @param {Function} [props.onClose]
 * @param {string} [props.class]
 * @returns {{ start: Function, next: Function, prev: Function, close: Function, goTo: Function }}
 */
// @ts-expect-error -- strict-mode fix (auto)
export const Tour = component<TourProps>((props: TourProps = {} as TourProps) => {
  injectBase();
  const { steps = [], onFinish, onChange, onClose, class: cls } = props;

  let current = 0;
  let overlayEl: any = null;
  let popoverEl: any = null;

  function resolveTarget(target: any) {
    if (typeof target === 'string') return document.querySelector(target);
    return target;
  }

  function createOverlayEl() {
    return div({ class: cx('d-tour-overlay', cls) });
  }

  // Read the offset token at runtime
  function getOffset() {
    if (typeof document === 'undefined') return 12;
    const val = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--d-offset-tour'), 10);
    return isNaN(val) ? 12 : val;
  }

  function positionPopover(targetEl: any, placement = 'bottom') {
    if (!targetEl || !popoverEl) return;
    const rect = targetEl.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const offset = getOffset();

    // Spotlight cutout
    overlayEl.style.setProperty('--tour-x', `${rect.left + scrollX}px`);
    overlayEl.style.setProperty('--tour-y', `${rect.top + scrollY}px`);
    overlayEl.style.setProperty('--tour-w', `${rect.width}px`);
    overlayEl.style.setProperty('--tour-h', `${rect.height}px`);

    // Position popover — all runtime values from DOM measurement
    let top, left;
    if (placement === 'bottom') { top = rect.bottom + scrollY + offset; left = rect.left + scrollX; }
    else if (placement === 'top') { top = rect.top + scrollY - offset; left = rect.left + scrollX; popoverEl.style.transform = 'translateY(-100%)'; }
    else if (placement === 'left') { top = rect.top + scrollY; left = rect.left + scrollX - offset; popoverEl.style.transform = 'translateX(-100%)'; }
    else { top = rect.top + scrollY; left = rect.right + scrollX + offset; }

    popoverEl.style.position = 'absolute';
    popoverEl.style.top = `${top}px`;
    popoverEl.style.left = `${left}px`;
  }

  function renderStep() {
    // @ts-expect-error -- strict-mode fix (auto)
    const step = steps[current];
    if (!step) return;
    const targetEl = resolveTarget(step.target);

    if (popoverEl) popoverEl.remove();

    const prevBtn = buttonTag({ type: 'button', class: 'd-btn d-btn-sm d-btn-outline', disabled: current === 0 }, 'Prev');
    const nextBtn = buttonTag({ type: 'button', class: 'd-btn d-btn-sm d-btn-primary' },
      // @ts-expect-error -- strict-mode fix (auto)
      current === steps.length - 1 ? 'Finish' : 'Next');
    const closeBtn = buttonTag({ type: 'button', class: 'd-tour-close', 'aria-label': 'Close tour' }, '\u00d7');

    const body = div({ class: 'd-tour-body' });
    if (step.title) body.appendChild(div({ class: 'd-tour-title' }, step.title));
    if (step.description) body.appendChild(div({ class: 'd-tour-desc' }, step.description));

    const footer = div({ class: 'd-tour-footer' },
      // @ts-expect-error -- strict-mode fix (auto)
      span({ class: 'd-tour-steps' }, `${current + 1} / ${steps.length}`),
      div({ class: 'd-tour-actions' }, prevBtn, nextBtn)
    );

    popoverEl = div({ class: cx('d-tour-popover', cls) }, closeBtn, body, footer);
    document.body.appendChild(popoverEl);

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', () => {
      // @ts-expect-error -- strict-mode fix (auto)
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
    overlayEl = createOverlayEl();
    document.body.appendChild(overlayEl);
    renderStep();

    // Close on Escape
    document.addEventListener('keydown', _onKey);
  }

  function _onKey(e: any) {
    if (e.key === 'Escape') close();
  }

  function next() {
    // @ts-expect-error -- strict-mode fix (auto)
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

  function goTo(index: any) {
    // @ts-expect-error -- strict-mode fix (auto)
    if (index >= 0 && index < steps.length) {
      current = index;
      if (onChange) onChange(current, 'goto');
      renderStep();
    }
  }

  function close() {
    if (overlayEl) { overlayEl.remove(); overlayEl = null; }
    if (popoverEl) { popoverEl.remove(); popoverEl = null; }
    document.removeEventListener('keydown', _onKey);
    if (onClose) onClose();
  }

  onDestroy(() => {
    close();
  });

  return { start, next, prev, close, goTo };
})
