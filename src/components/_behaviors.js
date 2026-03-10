/**
 * Shared behavioral primitives for Decantr components.
 * These composable systems are the foundation for 70+ components.
 * Each behavior wires up event listeners, ARIA, and state management
 * so individual components stay thin and focused.
 */
import { createEffect, createSignal } from '../state/index.js';
import { h } from '../core/index.js';
import { icon } from './icon.js';

/**
 * Shared caret (chevron arrow) using the icon system.
 * Replaces inconsistent Unicode arrows across all components.
 * @param {'down'|'up'|'right'|'left'} [direction='down']
 * @param {Object} [opts] - Passed to icon(), plus optional `class`
 * @returns {HTMLElement}
 */
export function caret(direction = 'down', opts = {}) {
  const cls = opts.class ? `d-caret ${opts.class}` : 'd-caret';
  return icon(`chevron-${direction}`, { size: '1em', ...opts, class: cls });
}

// ─── OVERLAY SYSTEM ──────────────────────────────────────────────
// Used by: Tooltip, Popover, HoverCard, Dropdown, Select, Combobox,
// DatePicker, TimePicker, ColorPicker, Cascader, TreeSelect,
// Mentions, Command, NavigationMenu, ContextMenu, Popconfirm, Tour

/**
 * Creates a managed overlay (floating layer) attached to a trigger element.
 * Handles show/hide, click-outside, escape, and ARIA state.
 *
 * @param {HTMLElement} triggerEl - The element that triggers the overlay
 * @param {HTMLElement} contentEl - The floating content element
 * @param {Object} opts
 * @param {'click'|'hover'|'manual'} [opts.trigger='click']
 * @param {boolean} [opts.closeOnEscape=true]
 * @param {boolean} [opts.closeOnOutside=true]
 * @param {number} [opts.hoverDelay=200]
 * @param {number} [opts.hoverCloseDelay=150]
 * @param {Function} [opts.onOpen]
 * @param {Function} [opts.onClose]
 * @param {boolean} [opts.usePopover=false] - Use Popover API
 * @returns {{ open: Function, close: Function, toggle: Function, isOpen: () => boolean, destroy: Function }}
 */
export function createOverlay(triggerEl, contentEl, opts = {}) {
  const {
    trigger = 'click',
    closeOnEscape = true,
    closeOnOutside = true,
    hoverDelay = 200,
    hoverCloseDelay = 150,
    onOpen,
    onClose,
    usePopover = false,
  } = opts;

  let _open = false;
  let _hoverTimer = null;
  let _closeTimer = null;
  const _cleanups = [];

  function isOpen() { return _open; }

  function open() {
    if (_open) return;
    _open = true;
    if (usePopover && contentEl.showPopover) {
      contentEl.showPopover();
    } else {
      contentEl.style.display = '';
    }
    triggerEl.setAttribute('aria-expanded', 'true');
    if (onOpen) onOpen();
  }

  function close() {
    if (!_open) return;
    _open = false;
    if (usePopover && contentEl.hidePopover) {
      try { contentEl.hidePopover(); } catch (_) {}
    } else {
      contentEl.style.display = 'none';
    }
    triggerEl.setAttribute('aria-expanded', 'false');
    if (onClose) onClose();
  }

  function toggle() { _open ? close() : open(); }

  // --- Wire up triggers ---
  if (trigger === 'click') {
    const onClick = (e) => { e.stopPropagation(); toggle(); };
    triggerEl.addEventListener('click', onClick);
    _cleanups.push(() => triggerEl.removeEventListener('click', onClick));
  }

  if (trigger === 'hover') {
    const onEnter = () => {
      clearTimeout(_closeTimer);
      _hoverTimer = setTimeout(open, hoverDelay);
    };
    const onLeave = () => {
      clearTimeout(_hoverTimer);
      _closeTimer = setTimeout(close, hoverCloseDelay);
    };
    triggerEl.addEventListener('mouseenter', onEnter);
    triggerEl.addEventListener('mouseleave', onLeave);
    contentEl.addEventListener('mouseenter', () => clearTimeout(_closeTimer));
    contentEl.addEventListener('mouseleave', onLeave);
    _cleanups.push(
      () => triggerEl.removeEventListener('mouseenter', onEnter),
      () => triggerEl.removeEventListener('mouseleave', onLeave)
    );
  }

  // Escape to close
  if (closeOnEscape) {
    const onKey = (e) => { if (e.key === 'Escape' && _open) { close(); triggerEl.focus(); } };
    document.addEventListener('keydown', onKey, true);
    _cleanups.push(() => document.removeEventListener('keydown', onKey, true));
  }

  // Click outside to close
  if (closeOnOutside && trigger !== 'hover') {
    const onDoc = (e) => {
      if (_open && !triggerEl.contains(e.target) && !contentEl.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDoc);
    _cleanups.push(() => document.removeEventListener('mousedown', onDoc));
  }

  // Popover API toggle sync
  if (usePopover) {
    const onToggle = (e) => {
      _open = e.newState === 'open';
      triggerEl.setAttribute('aria-expanded', String(_open));
      if (!_open && onClose) onClose();
    };
    contentEl.addEventListener('toggle', onToggle);
    _cleanups.push(() => contentEl.removeEventListener('toggle', onToggle));
  }

  // Initial state: hidden
  if (!usePopover) contentEl.style.display = 'none';

  function destroy() { _cleanups.forEach(fn => fn()); }

  return { open, close, toggle, isOpen, destroy };
}


// ─── LISTBOX SYSTEM ──────────────────────────────────────────────
// Used by: Select, Combobox, Command, Cascader, TreeSelect,
// Transfer, Mentions, AutoComplete, ContextMenu, Dropdown

/**
 * Keyboard navigation + selection for a list of options.
 * Manages active-descendant, arrow keys, enter/space selection,
 * type-ahead search, and multi-select.
 *
 * @param {HTMLElement} containerEl - The listbox container element
 * @param {Object} opts
 * @param {string} [opts.itemSelector='.d-option'] - CSS selector for option elements
 * @param {string} [opts.activeClass='d-option-active'] - Class for highlighted item
 * @param {string} [opts.disabledSelector='.d-option-disabled']
 * @param {boolean} [opts.loop=true] - Loop navigation
 * @param {'vertical'|'horizontal'} [opts.orientation='vertical']
 * @param {boolean} [opts.multiSelect=false]
 * @param {boolean} [opts.typeAhead=false]
 * @param {Function} [opts.onSelect] - Called with (element, index) on selection
 * @param {Function} [opts.onHighlight] - Called with (element, index) when highlight changes
 * @returns {{ highlight: Function, getActiveIndex: () => number, setItems: Function, reset: Function, handleKeydown: Function, destroy: Function }}
 */
export function createListbox(containerEl, opts = {}) {
  const {
    itemSelector = '.d-option',
    activeClass = 'd-option-active',
    disabledSelector = '.d-option-disabled',
    loop = true,
    orientation = 'vertical',
    multiSelect = false,
    typeAhead = false,
    onSelect,
    onHighlight,
  } = opts;

  let activeIndex = -1;
  let _typeBuffer = '';
  let _typeTimer = null;

  function getItems() {
    return [...containerEl.querySelectorAll(itemSelector)];
  }

  function getSelectableItems() {
    return getItems().filter(el => !el.matches(disabledSelector));
  }

  function highlight(index) {
    const items = getItems();
    items.forEach((el, i) => {
      el.classList.toggle(activeClass, i === index);
      el.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    activeIndex = index;
    // Scroll into view
    if (items[index]) items[index].scrollIntoView?.({ block: 'nearest' });
    if (onHighlight && items[index]) onHighlight(items[index], index);
  }

  function highlightNext() {
    const items = getItems();
    if (!items.length) return;
    let next = activeIndex + 1;
    // Skip disabled
    while (next < items.length && items[next]?.matches(disabledSelector)) next++;
    if (next >= items.length) next = loop ? 0 : items.length - 1;
    highlight(next);
  }

  function highlightPrev() {
    const items = getItems();
    if (!items.length) return;
    let prev = activeIndex - 1;
    while (prev >= 0 && items[prev]?.matches(disabledSelector)) prev--;
    if (prev < 0) prev = loop ? items.length - 1 : 0;
    highlight(prev);
  }

  function selectCurrent() {
    const items = getItems();
    if (activeIndex >= 0 && items[activeIndex] && !items[activeIndex].matches(disabledSelector)) {
      if (onSelect) onSelect(items[activeIndex], activeIndex);
    }
  }

  function handleTypeAhead(char) {
    if (!typeAhead) return;
    clearTimeout(_typeTimer);
    _typeBuffer += char.toLowerCase();
    _typeTimer = setTimeout(() => { _typeBuffer = ''; }, 500);
    const items = getItems();
    const idx = items.findIndex(el =>
      el.textContent.trim().toLowerCase().startsWith(_typeBuffer) && !el.matches(disabledSelector)
    );
    if (idx >= 0) highlight(idx);
  }

  const downKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const upKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

  function handleKeydown(e) {
    if (e.key === downKey) { e.preventDefault(); highlightNext(); }
    else if (e.key === upKey) { e.preventDefault(); highlightPrev(); }
    else if (e.key === 'Home') { e.preventDefault(); highlight(0); }
    else if (e.key === 'End') { e.preventDefault(); highlight(getItems().length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCurrent(); }
    else if (e.key.length === 1 && typeAhead) { handleTypeAhead(e.key); }
  }

  containerEl.addEventListener('keydown', handleKeydown);

  function reset() { activeIndex = -1; highlight(-1); }
  function getActiveIndex() { return activeIndex; }
  function destroy() { containerEl.removeEventListener('keydown', handleKeydown); }

  return { highlight, highlightNext, highlightPrev, selectCurrent, getActiveIndex, reset, handleKeydown, destroy };
}


// ─── DISCLOSURE SYSTEM ───────────────────────────────────────────
// Used by: Accordion, Collapsible, Tree, NavigationMenu sections

/**
 * Expand/collapse with smooth height animation.
 *
 * @param {HTMLElement} triggerEl
 * @param {HTMLElement} contentEl
 * @param {Object} opts
 * @param {boolean} [opts.defaultOpen=false]
 * @param {boolean} [opts.animate=true]
 * @param {Function} [opts.onToggle]
 * @returns {{ open: Function, close: Function, toggle: Function, isOpen: () => boolean }}
 */
export function createDisclosure(triggerEl, contentEl, opts = {}) {
  const { defaultOpen = false, animate = true, onToggle } = opts;
  let _open = defaultOpen;

  // Wrapper for height animation
  const region = contentEl.parentElement?.classList.contains('d-disclosure-region')
    ? contentEl.parentElement
    : contentEl;

  function syncState() {
    triggerEl.setAttribute('aria-expanded', String(_open));
    if (_open) {
      if (animate && region !== contentEl) {
        region.style.height = '0';
        region.style.overflow = 'hidden';
        region.style.display = '';
        const h = contentEl.scrollHeight;
        region.style.height = h + 'px';
        const onEnd = () => { region.style.height = 'auto'; region.style.overflow = ''; region.removeEventListener('transitionend', onEnd); };
        region.addEventListener('transitionend', onEnd);
      } else {
        region.style.display = '';
        region.style.height = 'auto';
      }
    } else {
      if (animate && region !== contentEl) {
        region.style.height = region.scrollHeight + 'px';
        region.offsetHeight; // force reflow
        region.style.overflow = 'hidden';
        region.style.height = '0';
        const onEnd = () => { region.style.display = 'none'; region.removeEventListener('transitionend', onEnd); };
        region.addEventListener('transitionend', onEnd);
      } else {
        region.style.display = 'none';
      }
    }
    if (onToggle) onToggle(_open);
  }

  function open() { _open = true; syncState(); }
  function close() { _open = false; syncState(); }
  function toggle() { _open = !_open; syncState(); }
  function isOpen() { return _open; }

  triggerEl.addEventListener('click', toggle);
  triggerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });

  // Initial state
  if (!_open) { region.style.display = 'none'; region.style.height = '0'; }
  triggerEl.setAttribute('aria-expanded', String(_open));

  return { open, close, toggle, isOpen };
}


// ─── ROVING TABINDEX ─────────────────────────────────────────────
// Used by: Tabs, RadioGroup, ToggleGroup, Segmented, Menu, Menubar,
// ButtonGroup, Toolbar

/**
 * Manages keyboard navigation within a group via roving tabindex pattern.
 * Only one element in the group has tabindex=0; the rest have tabindex=-1.
 *
 * @param {HTMLElement} containerEl
 * @param {Object} opts
 * @param {string} [opts.itemSelector='[role="tab"]'] - Selector for navigable items
 * @param {'horizontal'|'vertical'|'both'} [opts.orientation='horizontal']
 * @param {boolean} [opts.loop=true]
 * @param {Function} [opts.onFocus] - Called with (element, index) when focus changes
 * @returns {{ focus: Function, setActive: Function, getActive: () => number, destroy: Function }}
 */
export function createRovingTabindex(containerEl, opts = {}) {
  const {
    itemSelector = '[role="tab"]',
    orientation = 'horizontal',
    loop = true,
    onFocus,
  } = opts;

  let activeIdx = 0;

  function getItems() {
    return [...containerEl.querySelectorAll(itemSelector)];
  }

  function setActive(index) {
    const items = getItems();
    items.forEach((el, i) => {
      el.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    activeIdx = index;
  }

  function focus(index) {
    const items = getItems();
    if (index < 0 || index >= items.length) return;
    setActive(index);
    items[index].focus();
    if (onFocus) onFocus(items[index], index);
  }

  function move(delta) {
    const items = getItems();
    if (!items.length) return;
    let next = activeIdx + delta;
    if (loop) {
      next = (next + items.length) % items.length;
    } else {
      next = Math.max(0, Math.min(next, items.length - 1));
    }
    focus(next);
  }

  const hKeys = { next: 'ArrowRight', prev: 'ArrowLeft' };
  const vKeys = { next: 'ArrowDown', prev: 'ArrowUp' };

  function onKeydown(e) {
    const horiz = orientation === 'horizontal' || orientation === 'both';
    const vert = orientation === 'vertical' || orientation === 'both';

    if (horiz && e.key === hKeys.next) { e.preventDefault(); move(1); }
    else if (horiz && e.key === hKeys.prev) { e.preventDefault(); move(-1); }
    else if (vert && e.key === vKeys.next) { e.preventDefault(); move(1); }
    else if (vert && e.key === vKeys.prev) { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); focus(0); }
    else if (e.key === 'End') { e.preventDefault(); focus(getItems().length - 1); }
  }

  containerEl.addEventListener('keydown', onKeydown);

  // Initialize tabindex
  setActive(activeIdx);

  function destroy() { containerEl.removeEventListener('keydown', onKeydown); }
  function getActive() { return activeIdx; }

  return { focus, setActive, getActive, destroy };
}


// ─── FOCUS TRAP ──────────────────────────────────────────────────
// Used by: Modal, Drawer, Sheet, AlertDialog, Command

/**
 * Traps focus within a container. Tab/Shift+Tab cycle within focusable elements.
 *
 * @param {HTMLElement} containerEl
 * @returns {{ activate: Function, deactivate: Function }}
 */
export function createFocusTrap(containerEl) {
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let _active = false;

  function getFocusable() {
    return [...containerEl.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
  }

  function onKeydown(e) {
    if (!_active || e.key !== 'Tab') return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function activate() {
    _active = true;
    containerEl.addEventListener('keydown', onKeydown);
    // Focus first focusable element
    const first = getFocusable()[0];
    if (first) requestAnimationFrame(() => first.focus());
  }

  function deactivate() {
    _active = false;
    containerEl.removeEventListener('keydown', onKeydown);
  }

  return { activate, deactivate };
}


// ─── FORM FIELD WRAPPER ──────────────────────────────────────────
// Used by: ALL form inputs (Input, Select, Checkbox, etc.)

/**
 * Wraps a form control with label, help text, error message, and required indicator.
 * Returns the wrapper element; the control is placed inside.
 *
 * @param {HTMLElement} controlEl - The actual input/select/textarea element
 * @param {Object} opts
 * @param {string} [opts.label]
 * @param {string|Function} [opts.error]
 * @param {string} [opts.help]
 * @param {boolean} [opts.required]
 * @param {string} [opts.class]
 * @returns {HTMLElement}
 */
export function createFormField(controlEl, opts = {}) {
  const { label, error, help, required, class: cls } = opts;

  const id = controlEl.id || `d-field-${_fieldId++}`;
  controlEl.id = id;

  const wrapper = h('div', { class: cls ? `d-field ${cls}` : 'd-field' });

  if (label) {
    const labelEl = h('label', { class: 'd-field-label', for: id });
    labelEl.textContent = label;
    if (required) {
      labelEl.appendChild(h('span', { class: 'd-field-required', 'aria-hidden': 'true' }, ' *'));
    }
    wrapper.appendChild(labelEl);
  }

  wrapper.appendChild(controlEl);

  if (help) {
    const helpId = `${id}-help`;
    const helpEl = h('div', { class: 'd-field-help', id: helpId }, help);
    controlEl.setAttribute('aria-describedby', helpId);
    wrapper.appendChild(helpEl);
  }

  if (error) {
    const errId = `${id}-error`;
    const errEl = h('div', { class: 'd-field-error', id: errId, role: 'alert' });
    wrapper.appendChild(errEl);

    if (typeof error === 'function') {
      createEffect(() => {
        const msg = error();
        errEl.textContent = msg || '';
        errEl.style.display = msg ? '' : 'none';
        controlEl.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) controlEl.setAttribute('aria-errormessage', errId);
        else controlEl.removeAttribute('aria-errormessage');
      });
    } else {
      errEl.textContent = error;
      controlEl.setAttribute('aria-invalid', 'true');
      controlEl.setAttribute('aria-errormessage', errId);
    }
  }

  return wrapper;
}

let _fieldId = 0;


// ─── DRAG SYSTEM ─────────────────────────────────────────────────
// Used by: Slider, Resizable, Transfer, DnD sorting

/**
 * Lightweight drag handler for pointer-based interactions.
 *
 * @param {HTMLElement} el - The element to make draggable
 * @param {Object} opts
 * @param {Function} opts.onMove - Called with (x, y, dx, dy, event)
 * @param {Function} [opts.onStart]
 * @param {Function} [opts.onEnd]
 * @returns {{ destroy: Function }}
 */
export function createDrag(el, opts) {
  const { onMove, onStart, onEnd } = opts;
  let startX, startY;

  function onPointerDown(e) {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
    if (onStart) onStart(startX, startY, e);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    onMove(e.clientX, e.clientY, e.clientX - startX, e.clientY - startY, e);
  }

  function onPointerUp(e) {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    if (onEnd) onEnd(e.clientX, e.clientY, e);
  }

  el.addEventListener('pointerdown', onPointerDown);

  return { destroy: () => el.removeEventListener('pointerdown', onPointerDown) };
}


// ─── VIRTUAL SCROLL (Large lists) ────────────────────────────────
// Used by: DataTable, Tree (large), Transfer, Select (many options)

/**
 * Simple virtual scroller for rendering large lists efficiently.
 * Only renders items visible in the viewport + buffer.
 *
 * @param {HTMLElement} containerEl - The scrollable container
 * @param {Object} opts
 * @param {number} opts.itemHeight - Fixed item height in px
 * @param {number} opts.totalItems - Total number of items
 * @param {number} [opts.buffer=5] - Extra items to render above/below
 * @param {Function} opts.renderItem - (index) => HTMLElement
 * @returns {{ refresh: Function, setTotal: Function, destroy: Function }}
 */
export function createVirtualScroll(containerEl, opts) {
  let { itemHeight, totalItems, buffer = 5, renderItem } = opts;

  const spacer = h('div', { style: { height: `${totalItems * itemHeight}px`, position: 'relative' } });
  const content = h('div', { style: { position: 'absolute', top: '0', left: '0', right: '0' } });
  spacer.appendChild(content);
  containerEl.appendChild(spacer);

  let _lastStart = -1, _lastEnd = -1;

  function render() {
    const scrollTop = containerEl.scrollTop;
    const viewportH = containerEl.clientHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(totalItems, Math.ceil((scrollTop + viewportH) / itemHeight) + buffer);

    if (start === _lastStart && end === _lastEnd) return;
    _lastStart = start;
    _lastEnd = end;

    content.style.top = `${start * itemHeight}px`;
    content.replaceChildren();
    for (let i = start; i < end; i++) {
      content.appendChild(renderItem(i));
    }
  }

  containerEl.addEventListener('scroll', render, { passive: true });
  render();

  function refresh() { _lastStart = -1; render(); }
  function setTotal(n) { totalItems = n; spacer.style.height = `${n * itemHeight}px`; refresh(); }
  function destroy() { containerEl.removeEventListener('scroll', render); }

  return { refresh, setTotal, destroy };
}


// ─── HOTKEY SYSTEM ────────────────────────────────────────────────
// Used by: Command, Modal, custom app shortcuts

/**
 * Registers keyboard shortcuts on an element (or document).
 * Handles modifier normalization (Meta=Ctrl on Mac), chord sequences,
 * and cleanup on destroy.
 *
 * @param {HTMLElement|Document} el - Scope element for key events
 * @param {Object<string, Function>} bindings - Map of shortcut string to handler.
 *   Shortcut format: 'ctrl+k', 'shift+alt+n', 'meta+enter', 'g g' (chord).
 *   Modifiers: ctrl, shift, alt, meta. On Mac, 'ctrl' matches both Ctrl and Meta.
 * @returns {{ destroy: Function, update: Function }}
 */
export function createHotkey(el, bindings) {
  const isMac = typeof navigator !== 'undefined' && /mac|ipod|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.userAgent || '');
  let _chordKey = null;
  let _chordTimer = null;

  function parseCombo(str) {
    const parts = str.toLowerCase().trim().split('+');
    const key = parts.pop();
    const mods = { ctrl: false, shift: false, alt: false, meta: false };
    for (const p of parts) {
      if (p === 'ctrl' || p === 'control') mods.ctrl = true;
      else if (p === 'shift') mods.shift = true;
      else if (p === 'alt' || p === 'option') mods.alt = true;
      else if (p === 'meta' || p === 'cmd' || p === 'command') mods.meta = true;
    }
    return { key, mods };
  }

  function matchMods(e, mods) {
    const ctrl = mods.ctrl ? (isMac ? (e.ctrlKey || e.metaKey) : e.ctrlKey) : (!e.ctrlKey && !e.metaKey);
    const shift = mods.shift ? e.shiftKey : !e.shiftKey;
    const alt = mods.alt ? e.altKey : !e.altKey;
    // If meta was explicitly required but we already matched via ctrl on Mac, skip separate meta check
    if (mods.meta && !isMac) return ctrl && shift && alt && e.metaKey;
    return ctrl && shift && alt;
  }

  function matchKey(e, key) {
    if (key === 'enter') return e.key === 'Enter';
    if (key === 'escape' || key === 'esc') return e.key === 'Escape';
    if (key === 'space') return e.key === ' ';
    if (key === 'tab') return e.key === 'Tab';
    if (key === 'backspace') return e.key === 'Backspace';
    if (key === 'delete') return e.key === 'Delete';
    if (key === 'up') return e.key === 'ArrowUp';
    if (key === 'down') return e.key === 'ArrowDown';
    if (key === 'left') return e.key === 'ArrowLeft';
    if (key === 'right') return e.key === 'ArrowRight';
    return e.key.toLowerCase() === key;
  }

  const parsed = [];
  let _bindings = bindings;

  function rebuild() {
    parsed.length = 0;
    for (const [shortcut, handler] of Object.entries(_bindings)) {
      const chordParts = shortcut.split(/\s+/);
      if (chordParts.length === 2) {
        parsed.push({ type: 'chord', first: parseCombo(chordParts[0]), second: parseCombo(chordParts[1]), handler });
      } else {
        parsed.push({ type: 'single', combo: parseCombo(shortcut), handler });
      }
    }
  }
  rebuild();

  function onKeydown(e) {
    // Check chords first
    if (_chordKey) {
      const chord = _chordKey;
      _chordKey = null;
      clearTimeout(_chordTimer);
      for (const entry of parsed) {
        if (entry.type === 'chord' && entry.first.key === chord && matchKey(e, entry.second.key) && matchMods(e, entry.second.mods)) {
          e.preventDefault();
          entry.handler(e);
          return;
        }
      }
    }

    // Check chord starters
    for (const entry of parsed) {
      if (entry.type === 'chord' && matchKey(e, entry.first.key) && matchMods(e, entry.first.mods)) {
        e.preventDefault();
        _chordKey = entry.first.key;
        _chordTimer = setTimeout(() => { _chordKey = null; }, 1000);
        return;
      }
    }

    // Check single shortcuts
    for (const entry of parsed) {
      if (entry.type === 'single' && matchKey(e, entry.combo.key) && matchMods(e, entry.combo.mods)) {
        e.preventDefault();
        entry.handler(e);
        return;
      }
    }
  }

  el.addEventListener('keydown', onKeydown, true);

  function destroy() {
    el.removeEventListener('keydown', onKeydown, true);
    clearTimeout(_chordTimer);
  }

  function update(newBindings) {
    _bindings = newBindings;
    rebuild();
  }

  return { destroy, update };
}


// ─── INFINITE SCROLL ──────────────────────────────────────────────
// Used by: List (infinite mode), feeds, search results

/**
 * Triggers a callback when a sentinel element enters the viewport,
 * enabling infinite scroll / load-more patterns.
 *
 * @param {HTMLElement} containerEl - The scrollable container
 * @param {Object} opts
 * @param {Function} opts.loadMore - Called when more data is needed. Can return a Promise.
 * @param {number} [opts.threshold=200] - Distance in px from bottom to trigger
 * @param {HTMLElement} [opts.sentinel] - Custom sentinel element (auto-created if omitted)
 * @returns {{ destroy: Function, loading: () => boolean }}
 */
export function createInfiniteScroll(containerEl, opts) {
  const { loadMore, threshold = 200, sentinel: customSentinel } = opts;
  let _loading = false;
  let _destroyed = false;

  const sentinel = customSentinel || h('div', { style: { height: '1px', width: '100%' }, 'aria-hidden': 'true' });
  if (!customSentinel) containerEl.appendChild(sentinel);

  const observer = new IntersectionObserver(async (entries) => {
    if (_destroyed || _loading) return;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        _loading = true;
        try { await loadMore(); }
        finally { _loading = false; }
      }
    }
  }, {
    root: containerEl,
    rootMargin: `0px 0px ${threshold}px 0px`,
  });

  observer.observe(sentinel);

  function destroy() {
    _destroyed = true;
    observer.disconnect();
    if (!customSentinel && sentinel.parentNode) sentinel.remove();
  }

  function loading() { return _loading; }

  return { destroy, loading };
}


// ─── MASONRY LAYOUT ───────────────────────────────────────────────
// Used by: Image galleries, card grids, Pinterest-style layouts

/**
 * Applies masonry layout to child elements of a container.
 * Calculates shortest-column placement. Responsive via ResizeObserver.
 *
 * @param {HTMLElement} containerEl - The container whose children are laid out
 * @param {Object} [opts]
 * @param {number} [opts.columns=3] - Number of columns
 * @param {number} [opts.gap=16] - Gap between items in px
 * @returns {{ refresh: Function, setColumns: Function, destroy: Function }}
 */
export function createMasonry(containerEl, opts = {}) {
  let { columns = 3, gap = 16 } = opts;

  containerEl.style.position = 'relative';

  function layout() {
    const children = [...containerEl.children];
    if (!children.length) { containerEl.style.height = '0'; return; }

    const containerWidth = containerEl.clientWidth;
    const colWidth = (containerWidth - gap * (columns - 1)) / columns;
    const colHeights = new Array(columns).fill(0);

    for (const child of children) {
      // Find shortest column
      const minCol = colHeights.indexOf(Math.min(...colHeights));
      const x = minCol * (colWidth + gap);
      const y = colHeights[minCol];

      child.style.position = 'absolute';
      child.style.left = `${x}px`;
      child.style.top = `${y}px`;
      child.style.width = `${colWidth}px`;

      // Measure after positioning to get correct height
      colHeights[minCol] += child.offsetHeight + gap;
    }

    containerEl.style.height = `${Math.max(...colHeights) - gap}px`;
  }

  const ro = new ResizeObserver(() => layout());
  ro.observe(containerEl);

  // Initial layout
  layout();

  function refresh() { layout(); }
  function setColumns(n) { columns = n; layout(); }
  function destroy() { ro.disconnect(); }

  return { refresh, setColumns, destroy };
}

// ─── SCROLL SPY ─────────────────────────────────────────────────
// Used by: TableOfContents, workbench navigation, documentation layouts

/**
 * Tracks which observed elements are visible in a scroll container.
 * Calls onActiveChange when the topmost visible section changes.
 *
 * @param {HTMLElement|null} root - Scroll container (null = viewport)
 * @param {Object} opts
 * @param {string} [opts.rootMargin='-20% 0px -60% 0px'] - IntersectionObserver margin
 * @param {number} [opts.threshold=0]
 * @param {Function} opts.onActiveChange - Called with (element) when active section changes
 * @returns {{ observe: Function, unobserve: Function, disconnect: Function }}
 */
export function createScrollSpy(root, opts = {}) {
  const {
    rootMargin = '-20% 0px -60% 0px',
    threshold = 0,
    onActiveChange
  } = opts;

  let currentEl = null;

  const observer = new IntersectionObserver(
    (entries) => {
      let topEntry = null;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
            topEntry = entry;
          }
        }
      }
      if (topEntry && topEntry.target !== currentEl) {
        currentEl = topEntry.target;
        onActiveChange(currentEl);
      }
    },
    { root, rootMargin, threshold }
  );

  function observe(el) { observer.observe(el); }
  function unobserve(el) { observer.unobserve(el); }
  function disconnect() { observer.disconnect(); currentEl = null; }

  return { observe, unobserve, disconnect };
}

/**
 * Shared checkbox control for embedding styled checkboxes inside
 * compound components (Transfer, Tree, TreeSelect, DataTable).
 * Returns the same d-checkbox-native + d-checkbox-check structure
 * used by the Checkbox component, wrapped in d-checkbox-inline.
 * @param {Object} [opts] - Attributes for the <input type="checkbox">
 * @returns {{ wrap: HTMLElement, input: HTMLInputElement }}
 */
export function createCheckControl(opts = {}) {
  const input = h('input', { type: 'checkbox', class: 'd-checkbox-native', ...opts });
  const check = h('span', { class: 'd-checkbox-check' });
  const wrap = h('span', { class: 'd-checkbox-inline' }, input, check);
  return { wrap, input };
}
