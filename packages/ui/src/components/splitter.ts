/**
 * Splitter — Resizable panel layout with draggable handles.
 * Uses createDrag behavior for pointer interaction.
 *
 * @module decantr/components/splitter
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag } from './_behaviors.js';

/**
 * @typedef {Object} SplitterPanel
 * @property {string} [size] - Initial CSS size (e.g. '50%', '300px')
 * @property {string} [min] - Min size in px (e.g. '100')
 * @property {string} [max] - Max size in px (e.g. '500')
 * @property {Node} content - Panel content
 */

/**
 * @param {Object} [props]
 * @param {'horizontal'|'vertical'} [props.direction='horizontal']
 * @param {SplitterPanel[]} [props.panels]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Splitter(props = {}) {
  injectBase();
  const { direction = 'horizontal', panels = [], class: cls } = props;

  const isVert = direction === 'vertical';
  const container = h('div', {
    class: cx('d-splitter', isVert && 'd-splitter-vertical', cls),
    role: 'group',
    'aria-label': 'Resizable panels'
  });

  const panelEls = [];
  const handleEls = [];

  panels.forEach((panelDef, i) => {
    const panelEl = h('div', { class: 'd-splitter-panel' });

    // Initial size
    if (panelDef.size) {
      if (isVert) panelEl.style.height = panelDef.size;
      else panelEl.style.width = panelDef.size;
    } else {
      panelEl.style.flex = '1';
    }

    // Set min/max
    if (panelDef.min) {
      if (isVert) panelEl.style.minHeight = panelDef.min + 'px';
      else panelEl.style.minWidth = panelDef.min + 'px';
    }
    if (panelDef.max) {
      if (isVert) panelEl.style.maxHeight = panelDef.max + 'px';
      else panelEl.style.maxWidth = panelDef.max + 'px';
    }

    // Content
    if (panelDef.content) {
      if (panelDef.content.nodeType) panelEl.appendChild(panelDef.content);
      else panelEl.textContent = String(panelDef.content);
    }

    panelEls.push(panelEl);
    container.appendChild(panelEl);

    // Handle between panels (not after last)
    if (i < panels.length - 1) {
      const handleCls = isVert ? 'd-splitter-handle-v' : 'd-splitter-handle-h';
      const handle = h('div', {
        class: cx('d-splitter-handle', handleCls),
        role: 'separator',
        'aria-orientation': isVert ? 'horizontal' : 'vertical',
        'aria-valuenow': '50',
        tabindex: '0',
        'aria-label': `Resize handle ${i + 1}`
      }, h('div', { class: 'd-splitter-handle-dot' }));

      handleEls.push(handle);
      container.appendChild(handle);

      // Drag behavior
      const leftPanel = panelEls[i];
      let startSize = 0;

      createDrag(handle, {
        onStart: () => {
          startSize = isVert ? leftPanel.offsetHeight : leftPanel.offsetWidth;
          // Remove flex during drag so px sizing works
          leftPanel.style.flex = 'none';
        },
        onMove: (x, y, dx, dy) => {
          const delta = isVert ? dy : dx;
          let newSize = startSize + delta;

          // Respect min/max
          const minSize = parseInt(panels[i].min) || 0;
          const maxSize = parseInt(panels[i].max) || Infinity;
          newSize = Math.max(minSize, Math.min(maxSize, newSize));

          if (isVert) leftPanel.style.height = newSize + 'px';
          else leftPanel.style.width = newSize + 'px';
        }
      });

      // Keyboard: arrow keys to resize
      handle.addEventListener('keydown', (e) => {
        const stepPx = e.shiftKey ? 20 : 4;
        let delta = 0;
        if (!isVert && e.key === 'ArrowLeft') delta = -stepPx;
        else if (!isVert && e.key === 'ArrowRight') delta = stepPx;
        else if (isVert && e.key === 'ArrowUp') delta = -stepPx;
        else if (isVert && e.key === 'ArrowDown') delta = stepPx;
        else if (e.key === 'Home') {
          e.preventDefault();
          const minSize = parseInt(panels[i].min) || 0;
          leftPanel.style.flex = 'none';
          if (isVert) leftPanel.style.height = minSize + 'px';
          else leftPanel.style.width = minSize + 'px';
          return;
        } else if (e.key === 'End') {
          e.preventDefault();
          const maxSize = parseInt(panels[i].max) || (isVert ? container.offsetHeight : container.offsetWidth);
          leftPanel.style.flex = 'none';
          if (isVert) leftPanel.style.height = maxSize + 'px';
          else leftPanel.style.width = maxSize + 'px';
          return;
        } else return;

        e.preventDefault();
        leftPanel.style.flex = 'none';
        const curSize = isVert ? leftPanel.offsetHeight : leftPanel.offsetWidth;
        let newSize = curSize + delta;
        const minSize = parseInt(panels[i].min) || 0;
        const maxSize = parseInt(panels[i].max) || Infinity;
        newSize = Math.max(minSize, Math.min(maxSize, newSize));
        if (isVert) leftPanel.style.height = newSize + 'px';
        else leftPanel.style.width = newSize + 'px';
      });
    }
  });

  return container;
}
