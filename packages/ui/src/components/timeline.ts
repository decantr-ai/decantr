/**
 * Timeline — Vertical/horizontal sequence of events with connecting lines.
 *
 * @module decantr/components/timeline
 */
import { h } from '../runtime/index.js';
import { createSignal, createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {{ label?: string, content: string|Node, color?: string, icon?: string|Node, time?: string, status?: 'default'|'success'|'warning'|'error'|'info', tag?: string, position?: 'left'|'right', collapsible?: boolean, defaultOpen?: boolean, onclick?: Function, disabled?: boolean }[]} [props.items]
 * @param {'left'|'right'|'alternate'|'custom'} [props.mode='left']
 * @param {boolean|string} [props.pending=false] - Show pending last item
 * @param {string|Node} [props.pendingDot] - Custom dot for pending item
 * @param {'default'|'branded'} [props.variant='default']
 * @param {string} [props.size] - sm|lg
 * @param {number|Function} [props.active] - Index of active item (reactive)
 * @param {boolean} [props.gradient=false] - Gradient connector line
 * @param {boolean} [props.glass=false] - Glass background on dots
 * @param {boolean} [props.reverse=false] - Reverse item order
 * @param {'vertical'|'horizontal'} [props.direction='vertical'] - Layout direction
 * @param {boolean|Function} [props.loading=false] - Skeleton loading state (reactive)
 * @param {number} [props.loadingCount=3] - Skeleton item count
 * @param {Function} [props.onClick] - Global click handler (item, index)
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Timeline(props = {}) {
  injectBase();
  const {
    items = [], mode = 'left', pending = false, pendingDot,
    variant = 'default', size, active, gradient = false, glass = false,
    reverse = false, direction = 'vertical', loading = false,
    loadingCount = 3, onClick, class: cls
  } = props;

  const isBranded = variant === 'branded';
  const isHorizontal = direction === 'horizontal';

  const container = h('div', {
    class: cx('d-timeline',
      mode === 'alternate' && 'd-timeline-alternate',
      mode === 'right' && 'd-timeline-right',
      mode === 'custom' && 'd-timeline-custom',
      isHorizontal && 'd-timeline-horizontal',
      size && `d-timeline-${size}`,
      isBranded && 'd-timeline-lg d-timeline-gradient d-timeline-glass',
      !isBranded && gradient && 'd-timeline-gradient',
      !isBranded && glass && 'd-timeline-glass',
      cls
    )
  });

  // skeleton loading state
  if (typeof loading === 'function') {
    createEffect(() => {
      const isLoading = loading();
      container.replaceChildren();
      if (isLoading) {
        renderSkeleton(container, loadingCount);
      } else {
        renderItems(container, items, { mode, pending, pendingDot, active, reverse, isHorizontal, onClick, isBranded, gradient });
      }
    });
    return container;
  }

  if (loading) {
    renderSkeleton(container, loadingCount);
  } else {
    renderItems(container, items, { mode, pending, pendingDot, active, reverse, isHorizontal, onClick, isBranded, gradient });
  }

  return container;
}

/**
 * Render timeline items into the container.
 */
function renderItems(container, items, opts) {
  const { mode, pending, pendingDot, active, reverse, onClick } = opts;
  const ordered = reverse ? [...items].reverse() : items;
  const dots = [];

  ordered.forEach((item, i) => {
    const itemDisabled = item.disabled;
    const itemClickable = !itemDisabled && (item.onclick || onClick);

    const el = h('div', {
      class: cx('d-timeline-item',
        mode === 'custom' && item.position === 'right' && 'd-timeline-item-right',
        mode === 'custom' && item.position !== 'right' && 'd-timeline-item-left',
        itemClickable && 'd-timeline-item-clickable',
        itemDisabled && 'd-timeline-item-disabled'
      )
    });

    if (itemClickable) {
      el.addEventListener('click', () => {
        if (item.onclick) item.onclick(item, i);
        if (onClick) onClick(item, i);
      });
    }

    // Dot
    const dot = h('div', { class: cx('d-timeline-dot', item.icon && 'd-timeline-dot-lg') });
    if (item.icon) {
      if (typeof item.icon === 'string') dot.textContent = item.icon;
      else dot.appendChild(item.icon);
    }
    if (item.status && item.status !== 'default') dot.dataset.status = item.status;
    if (item.color && !item.status) dot.dataset.color = item.color;
    el.appendChild(dot);
    dots.push(dot);

    // Line (not on last item unless pending)
    if (i < ordered.length - 1 || pending) {
      el.appendChild(h('div', { class: 'd-timeline-line' }));
    }

    // Opposite label for alternate mode
    if (mode === 'alternate' && item.label) {
      const opposite = h('div', { class: 'd-timeline-opposite' }, item.label);
      // In alternate mode, insert opposite before or after content depending on even/odd
      el.insertBefore(opposite, el.firstChild);
    }

    // Content
    const content = h('div', { class: 'd-timeline-content' });
    if (item.time) content.appendChild(h('div', { class: 'd-timeline-label' }, item.time));
    if (item.tag) {
      content.appendChild(h('span', { class: 'd-timeline-tag' }, item.tag));
    }

    if (item.collapsible) {
      // Collapsible content
      const [open, setOpen] = createSignal(item.defaultOpen !== false);
      const trigger = h('div', { class: 'd-timeline-collapse-trigger' });
      createEffect(() => {
        trigger.textContent = open() ? '▾ Collapse' : '▸ Expand';
      });
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(!open());
      });

      const region = h('div', { class: 'd-timeline-collapse-region', role: 'region' });
      if (typeof item.content === 'string') {
        region.appendChild(h('div', null, item.content));
      } else if (item.content?.nodeType) {
        region.appendChild(item.content);
      }

      createEffect(() => {
        region.style.maxHeight = open() ? 'none' : '0px';
        region.style.overflow = open() ? 'visible' : 'hidden';
      });

      content.appendChild(trigger);
      content.appendChild(region);
    } else {
      if (typeof item.content === 'string') {
        content.appendChild(h('div', null, item.content));
      } else if (item.content?.nodeType) {
        content.appendChild(item.content);
      }
    }

    el.appendChild(content);
    container.appendChild(el);
  });

  // Active item highlight
  if (active != null) {
    const applyActive = (idx) => {
      dots.forEach((d, i) => {
        d.classList.toggle('d-timeline-dot-active', i === idx);
      });
    };
    if (typeof active === 'function') {
      createEffect(() => applyActive(active()));
    } else {
      applyActive(active);
    }
  }

  // Pending item
  if (pending) {
    const pendingItem = h('div', { class: 'd-timeline-item' });
    const dot = h('div', { class: 'd-timeline-dot d-timeline-dot-pending' });
    if (pendingDot) {
      if (typeof pendingDot === 'string') dot.textContent = pendingDot;
      else if (pendingDot.nodeType) dot.appendChild(pendingDot);
    }
    pendingItem.appendChild(dot);
    pendingItem.appendChild(h('div', { class: 'd-timeline-content' },
      h('div', { class: 'd-timeline-label' }, typeof pending === 'string' ? pending : 'Loading...')
    ));
    container.appendChild(pendingItem);
  }
}

/**
 * Render skeleton loading items.
 */
function renderSkeleton(container, count) {
  container.classList.add('d-timeline-skeleton');
  for (let i = 0; i < count; i++) {
    const el = h('div', { class: 'd-timeline-item' });
    el.appendChild(h('div', { class: 'd-timeline-dot' }));
    if (i < count - 1) {
      el.appendChild(h('div', { class: 'd-timeline-line' }));
    }
    const content = h('div', { class: 'd-timeline-content' });
    const bar1 = h('div', { class: 'd-timeline-skel-bar' });
    bar1.style.width = `${60 + Math.random() * 30}%`;
    const bar2 = h('div', { class: 'd-timeline-skel-bar' });
    bar2.style.width = `${40 + Math.random() * 40}%`;
    content.appendChild(bar1);
    content.appendChild(bar2);
    el.appendChild(content);
    container.appendChild(el);
  }
}
