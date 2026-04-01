/**
 * Shared behavioral primitives for Decantr components.
 * These composable systems are the foundation for 70+ components.
 * Each behavior wires up event listeners, ARIA, and state management
 * so individual components stay thin and focused.
 */
import { createEffect, createSignal } from '../state/index.js';
import { h } from '../runtime/index.js';
import { icon } from './icon.js';

// ─── CARET ──────────────────────────────────────────────────────

type CaretDirection = 'down' | 'up' | 'right' | 'left';

/**
 * Shared caret (chevron arrow) using the icon system.
 * Replaces inconsistent Unicode arrows across all components.
 */
export function caret(direction: CaretDirection = 'down', opts: Record<string, unknown> = {}): HTMLElement {
  const cls = opts.class ? `d-caret ${opts.class}` : 'd-caret';
  return icon(`chevron-${direction}`, { size: '1em', ...opts, class: cls });
}

// ─── OVERLAY SYSTEM ──────────────────────────────────────────────

export interface OverlayOptions {
  trigger?: 'click' | 'hover' | 'manual';
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  hoverDelay?: number;
  hoverCloseDelay?: number;
  onOpen?: () => void;
  onClose?: () => void;
  usePopover?: boolean;
  portal?: boolean;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  offset?: number;
  matchWidth?: boolean;
  exitAnimation?: boolean;
  exitDuration?: number;
}

export interface OverlayHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
  destroy: () => void;
}

/**
 * Creates a managed overlay (floating layer) attached to a trigger element.
 * Handles show/hide, click-outside, escape, and ARIA state.
 */
export function createOverlay(triggerEl: HTMLElement, contentEl: HTMLElement, opts: OverlayOptions = {}): OverlayHandle {
  const {
    trigger = 'click',
    closeOnEscape = true,
    closeOnOutside = true,
    hoverDelay = 200,
    hoverCloseDelay = 150,
    onOpen,
    onClose,
    usePopover = false,
    portal = false,
    placement = 'bottom',
    align = 'start',
    offset = 2,
    matchWidth = false,
    exitAnimation = typeof document !== 'undefined' && typeof document.getAnimations === 'function',
    exitDuration = 150,
  } = opts;

  let _open = false;
  let _closing = false;
  let _hoverTimer: ReturnType<typeof setTimeout> | null = null;
  let _closeTimer: ReturnType<typeof setTimeout> | null = null;
  const _cleanups: Array<() => void> = [];
  let _posHandle: { reposition: () => void; destroy: () => void } | null = null;

  if (portal) {
    _posHandle = positionPanel(triggerEl, contentEl, { placement, align, offset, matchWidth });
  }

  function isOpen(): boolean { return _open; }

  // Resolve portal target at open time
  function portalTarget(): HTMLElement {
    const dlg = triggerEl.closest('dialog');
    return (dlg as HTMLElement) || document.body;
  }

  function open(): void {
    if (_open) return;
    if (_closing) { _closing = false; }
    _open = true;
    if (portal) {
      const target = portalTarget();
      if (contentEl.parentNode !== target) target.appendChild(contentEl);
    }
    if (usePopover && (contentEl as any).showPopover) {
      (contentEl as any).showPopover();
    } else {
      contentEl.style.display = '';
    }
    contentEl.classList.remove('d-overlay-exit');
    if (_posHandle) _posHandle.reposition();
    triggerEl.setAttribute('aria-expanded', 'true');
    if (onOpen) onOpen();
  }

  function close(): void {
    if (!_open) return;
    _open = false;

    if (exitAnimation && !usePopover) {
      _closing = true;
      contentEl.classList.add('d-overlay-exit');
      setTimeout(() => {
        if (!_closing) return;
        _closing = false;
        contentEl.classList.remove('d-overlay-exit');
        contentEl.style.display = 'none';
        triggerEl.setAttribute('aria-expanded', 'false');
        if (onClose) onClose();
      }, exitDuration);
      return;
    }

    if (usePopover && (contentEl as any).hidePopover) {
      try { (contentEl as any).hidePopover(); } catch (_) {}
    } else {
      contentEl.style.display = 'none';
    }
    triggerEl.setAttribute('aria-expanded', 'false');
    if (onClose) onClose();
  }

  function toggle(): void { _open ? close() : open(); }

  // --- Wire up triggers ---
  if (trigger === 'click') {
    const onClick = (e: Event): void => { e.stopPropagation(); toggle(); };
    triggerEl.addEventListener('click', onClick);
    _cleanups.push(() => triggerEl.removeEventListener('click', onClick));
  }

  if (trigger === 'hover') {
    const onEnter = (): void => {
      if (_closeTimer) clearTimeout(_closeTimer);
      _hoverTimer = setTimeout(open, hoverDelay);
    };
    const onLeave = (): void => {
      if (_hoverTimer) clearTimeout(_hoverTimer);
      _closeTimer = setTimeout(close, hoverCloseDelay);
    };
    triggerEl.addEventListener('mouseenter', onEnter);
    triggerEl.addEventListener('mouseleave', onLeave);
    contentEl.addEventListener('mouseenter', () => { if (_closeTimer) clearTimeout(_closeTimer); });
    contentEl.addEventListener('mouseleave', onLeave);
    _cleanups.push(
      () => triggerEl.removeEventListener('mouseenter', onEnter),
      () => triggerEl.removeEventListener('mouseleave', onLeave)
    );
  }

  // Escape to close
  if (closeOnEscape) {
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape' && _open) { close(); triggerEl.focus(); } };
    document.addEventListener('keydown', onKey, true);
    _cleanups.push(() => document.removeEventListener('keydown', onKey, true));
  }

  // Click outside to close
  if (closeOnOutside && trigger !== 'hover') {
    const onDoc = (e: MouseEvent): void => {
      if (_open && !triggerEl.contains(e.target as Node) && !contentEl.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDoc);
    _cleanups.push(() => document.removeEventListener('mousedown', onDoc));
  }

  // Popover API toggle sync
  if (usePopover) {
    const onToggle = (e: any): void => {
      _open = e.newState === 'open';
      triggerEl.setAttribute('aria-expanded', String(_open));
      if (!_open && onClose) onClose();
    };
    contentEl.addEventListener('toggle', onToggle);
    _cleanups.push(() => contentEl.removeEventListener('toggle', onToggle));
  }

  // Initial state: hidden
  if (!usePopover) contentEl.style.display = 'none';

  function destroy(): void {
    _cleanups.forEach(fn => fn());
    if (_posHandle) _posHandle.destroy();
    if (portal && contentEl.parentNode) {
      contentEl.parentNode.removeChild(contentEl);
    }
  }

  return { open, close, toggle, isOpen, destroy };
}


// ─── PANEL POSITIONING ──────────────────────────────────────────

export interface PositionPanelOptions {
  placement?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  offset?: number;
  matchWidth?: boolean;
  flip?: boolean;
}

export interface PositionHandle {
  reposition: () => void;
  destroy: () => void;
}

/**
 * Positions a panel element relative to a trigger using position:fixed
 * + getBoundingClientRect(). Escapes all overflow containers and
 * stacking contexts by computing coordinates in viewport space.
 */
export function positionPanel(triggerEl: HTMLElement, panelEl: HTMLElement, opts: PositionPanelOptions = {}): PositionHandle {
  const {
    placement = 'bottom',
    align = 'start',
    offset = 2,
    matchWidth = false,
    flip = true,
  } = opts;

  let _rafId: number | null = null;
  let _listening = false;
  const EDGE_PAD = 8;

  function reposition(): void {
    if (!triggerEl.isConnected) {
      panelEl.style.display = 'none';
      return;
    }

    const tr = triggerEl.getBoundingClientRect();
    const panelEl_display = panelEl.style.display;
    // Ensure panel is measurable
    if (panelEl.style.display === 'none') panelEl.style.display = '';
    const pr = panelEl.getBoundingClientRect();
    panelEl.style.display = panelEl_display === 'none' ? panelEl_display : '';

    panelEl.style.position = 'fixed';
    panelEl.style.right = 'auto';
    panelEl.style.margin = '0';

    if (matchWidth) panelEl.style.width = `${tr.width}px`;

    const isHorizontal = placement === 'left' || placement === 'right';
    let usePlacement = placement;

    if (flip) {
      if (isHorizontal) {
        const spaceRight = window.innerWidth - tr.right - offset;
        const spaceLeft = tr.left - offset;
        if (usePlacement === 'right' && pr.width > spaceRight && spaceLeft > spaceRight) {
          usePlacement = 'left';
        } else if (usePlacement === 'left' && pr.width > spaceLeft && spaceRight > spaceLeft) {
          usePlacement = 'right';
        }
      } else {
        const spaceBelow = window.innerHeight - tr.bottom - offset;
        const spaceAbove = tr.top - offset;
        if (usePlacement === 'bottom' && pr.height > spaceBelow && spaceAbove > spaceBelow) {
          usePlacement = 'top';
        } else if (usePlacement === 'top' && pr.height > spaceAbove && spaceBelow > spaceAbove) {
          usePlacement = 'bottom';
        }
      }
    }

    let top: number, left: number;

    if (usePlacement === 'left' || usePlacement === 'right') {
      left = usePlacement === 'right' ? tr.right + offset : tr.left - pr.width - offset;
      if (align === 'start') top = tr.top;
      else if (align === 'end') top = tr.bottom - pr.height;
      else top = tr.top + (tr.height - pr.height) / 2;
    } else {
      top = usePlacement === 'bottom' ? tr.bottom + offset : tr.top - pr.height - offset;
      if (align === 'start') left = tr.left;
      else if (align === 'end') left = tr.right - pr.width;
      else left = tr.left + (tr.width - pr.width) / 2;
    }

    // Clamp to viewport edges
    const pw = matchWidth ? tr.width : pr.width;
    if (left + pw > window.innerWidth - EDGE_PAD) left = window.innerWidth - EDGE_PAD - pw;
    if (left < EDGE_PAD) left = EDGE_PAD;
    if (top + pr.height > window.innerHeight - EDGE_PAD) top = window.innerHeight - EDGE_PAD - pr.height;
    if (top < EDGE_PAD) top = EDGE_PAD;

    panelEl.style.top = `${top}px`;
    panelEl.style.left = `${left}px`;
  }

  function onScrollOrResize(): void {
    if (_rafId) return;
    _rafId = requestAnimationFrame(() => {
      _rafId = null;
      reposition();
    });
  }

  function startListening(): void {
    if (_listening) return;
    _listening = true;
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
  }

  function stopListening(): void {
    if (!_listening) return;
    _listening = false;
    window.removeEventListener('scroll', onScrollOrResize, true);
    window.removeEventListener('resize', onScrollOrResize);
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  }

  startListening();

  function destroy(): void {
    stopListening();
  }

  return { reposition, destroy };
}


// ─── LISTBOX SYSTEM ──────────────────────────────────────────────

export interface ListboxOptions {
  itemSelector?: string;
  activeClass?: string;
  disabledSelector?: string;
  loop?: boolean;
  orientation?: 'vertical' | 'horizontal';
  typeAhead?: boolean;
  owner?: HTMLElement | null;
  onSelect?: (element: Element, index: number) => void;
  onHighlight?: (element: Element, index: number) => void;
}

export interface ListboxHandle {
  highlight: (index: number) => void;
  highlightNext: () => void;
  highlightPrev: () => void;
  selectCurrent: () => void;
  getActiveIndex: () => number;
  reset: () => void;
  handleKeydown: (e: KeyboardEvent) => void;
  destroy: () => void;
}

let _listboxOptionId = 0;

/**
 * Keyboard navigation + selection for a list of options.
 */
export function createListbox(containerEl: HTMLElement, opts: ListboxOptions = {}): ListboxHandle {
  const {
    itemSelector = '.d-option',
    activeClass = 'd-option-active',
    disabledSelector = '.d-option-disabled',
    loop = true,
    orientation = 'vertical',
    typeAhead = false,
    owner = null,
    onSelect,
    onHighlight,
  } = opts;

  let activeIndex = -1;
  let _typeBuffer = '';
  let _typeTimer: ReturnType<typeof setTimeout> | null = null;

  function getItems(): Element[] {
    return [...containerEl.querySelectorAll(itemSelector)];
  }

  function highlight(index: number): void {
    const items = getItems();
    items.forEach((el, i) => {
      el.classList.toggle(activeClass, i === index);
      el.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    activeIndex = index;
    if (owner && items[index]) {
      if (!items[index].id) items[index].id = 'd-lo-' + (_listboxOptionId++);
      owner.setAttribute('aria-activedescendant', items[index].id);
    } else if (owner) {
      owner.removeAttribute('aria-activedescendant');
    }
    if (items[index]) (items[index] as HTMLElement).scrollIntoView?.({ block: 'nearest' });
    if (onHighlight && items[index]) onHighlight(items[index], index);
  }

  function highlightNext(): void {
    const items = getItems();
    if (!items.length) return;
    let next = activeIndex + 1;
    while (next < items.length && items[next]?.matches(disabledSelector)) next++;
    if (next >= items.length) next = loop ? 0 : items.length - 1;
    highlight(next);
  }

  function highlightPrev(): void {
    const items = getItems();
    if (!items.length) return;
    let prev = activeIndex - 1;
    while (prev >= 0 && items[prev]?.matches(disabledSelector)) prev--;
    if (prev < 0) prev = loop ? items.length - 1 : 0;
    highlight(prev);
  }

  function selectCurrent(): void {
    const items = getItems();
    if (activeIndex >= 0 && items[activeIndex] && !items[activeIndex].matches(disabledSelector)) {
      if (onSelect) onSelect(items[activeIndex], activeIndex);
    }
  }

  function handleTypeAhead(char: string): void {
    if (!typeAhead) return;
    if (_typeTimer) clearTimeout(_typeTimer);
    _typeBuffer += char.toLowerCase();
    _typeTimer = setTimeout(() => { _typeBuffer = ''; }, 500);
    const items = getItems();
    const idx = items.findIndex(el =>
      (el.textContent || '').trim().toLowerCase().startsWith(_typeBuffer) && !el.matches(disabledSelector)
    );
    if (idx >= 0) highlight(idx);
  }

  const downKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const upKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === downKey) { e.preventDefault(); highlightNext(); }
    else if (e.key === upKey) { e.preventDefault(); highlightPrev(); }
    else if (e.key === 'Home') { e.preventDefault(); highlight(0); }
    else if (e.key === 'End') { e.preventDefault(); highlight(getItems().length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCurrent(); }
    else if (e.key.length === 1 && typeAhead) { handleTypeAhead(e.key); }
  }

  containerEl.addEventListener('keydown', handleKeydown);

  function reset(): void {
    activeIndex = -1;
    highlight(-1);
    if (owner) owner.removeAttribute('aria-activedescendant');
  }
  function getActiveIndex(): number { return activeIndex; }
  function destroy(): void { containerEl.removeEventListener('keydown', handleKeydown); }

  return { highlight, highlightNext, highlightPrev, selectCurrent, getActiveIndex, reset, handleKeydown, destroy };
}


// ─── DISCLOSURE SYSTEM ───────────────────────────────────────────

export interface DisclosureOptions {
  defaultOpen?: boolean;
  animate?: boolean;
  onToggle?: (open: boolean) => void;
}

export interface DisclosureHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
}

/**
 * Expand/collapse with smooth height animation.
 */
export function createDisclosure(triggerEl: HTMLElement, contentEl: HTMLElement, opts: DisclosureOptions = {}): DisclosureHandle {
  const { defaultOpen = false, animate = true, onToggle } = opts;
  let _open = defaultOpen;

  const region = contentEl.parentElement?.classList.contains('d-disclosure-region')
    ? contentEl.parentElement
    : contentEl;

  function syncState(): void {
    triggerEl.setAttribute('aria-expanded', String(_open));
    if (_open) {
      if (animate && region !== contentEl) {
        region!.style.height = '0';
        region!.style.overflow = 'hidden';
        region!.style.display = '';
        const h = contentEl.scrollHeight;
        region!.style.height = h + 'px';
        const onEnd = (): void => { region!.style.height = 'auto'; region!.style.overflow = ''; region!.removeEventListener('transitionend', onEnd); };
        region!.addEventListener('transitionend', onEnd);
      } else {
        region!.style.display = '';
        region!.style.height = 'auto';
      }
    } else {
      if (animate && region !== contentEl) {
        region!.style.height = region!.scrollHeight + 'px';
        (region as HTMLElement).offsetHeight; // force reflow
        region!.style.overflow = 'hidden';
        region!.style.height = '0';
        const onEnd = (): void => { region!.style.display = 'none'; region!.removeEventListener('transitionend', onEnd); };
        region!.addEventListener('transitionend', onEnd);
      } else {
        region!.style.display = 'none';
      }
    }
    if (onToggle) onToggle(_open);
  }

  function open(): void { _open = true; syncState(); }
  function close(): void { _open = false; syncState(); }
  function toggle(): void { _open = !_open; syncState(); }
  function isOpen(): boolean { return _open; }

  triggerEl.addEventListener('click', toggle);
  triggerEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });

  // Initial state
  if (!_open) { region!.style.display = 'none'; region!.style.height = '0'; }
  triggerEl.setAttribute('aria-expanded', String(_open));

  return { open, close, toggle, isOpen };
}


// ─── ROVING TABINDEX ─────────────────────────────────────────────

export interface RovingTabindexOptions {
  itemSelector?: string;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onFocus?: (element: Element, index: number) => void;
}

export interface RovingTabindexHandle {
  focus: (index: number) => void;
  setActive: (index: number) => void;
  getActive: () => number;
  destroy: () => void;
}

/**
 * Manages keyboard navigation within a group via roving tabindex pattern.
 */
export function createRovingTabindex(containerEl: HTMLElement, opts: RovingTabindexOptions = {}): RovingTabindexHandle {
  const {
    itemSelector = '[role="tab"]',
    orientation = 'horizontal',
    loop = true,
    onFocus,
  } = opts;

  let activeIdx = 0;

  function getItems(): Element[] {
    return [...containerEl.querySelectorAll(itemSelector)];
  }

  function setActive(index: number): void {
    const items = getItems();
    items.forEach((el, i) => {
      el.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    activeIdx = index;
  }

  function focus(index: number): void {
    const items = getItems();
    if (index < 0 || index >= items.length) return;
    setActive(index);
    (items[index] as HTMLElement).focus();
    if (onFocus) onFocus(items[index], index);
  }

  function move(delta: number): void {
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

  function onKeydown(e: KeyboardEvent): void {
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

  function destroy(): void { containerEl.removeEventListener('keydown', onKeydown); }
  function getActive(): number { return activeIdx; }

  return { focus, setActive, getActive, destroy };
}


// ─── FOCUS TRAP ──────────────────────────────────────────────────

export interface FocusTrapHandle {
  activate: () => void;
  deactivate: () => void;
}

/**
 * Traps focus within a container. Tab/Shift+Tab cycle within focusable elements.
 */
export function createFocusTrap(containerEl: HTMLElement): FocusTrapHandle {
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let _active = false;

  function getFocusable(): HTMLElement[] {
    return [...containerEl.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => el.offsetParent !== null);
  }

  function onKeydown(e: KeyboardEvent): void {
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

  function activate(): void {
    _active = true;
    containerEl.addEventListener('keydown', onKeydown);
    const first = getFocusable()[0];
    if (first) requestAnimationFrame(() => first.focus());
  }

  function deactivate(): void {
    _active = false;
    containerEl.removeEventListener('keydown', onKeydown);
  }

  return { activate, deactivate };
}


// ─── FORM FIELD WRAPPER ──────────────────────────────────────────

export interface FormFieldOptions {
  label?: string;
  error?: string | (() => string);
  success?: boolean | string | (() => boolean | string);
  help?: string;
  required?: boolean;
  variant?: string;
  size?: string;
  class?: string;
}

export interface FormFieldHandle {
  wrapper: HTMLElement;
  setError: (msg: string) => void;
  setSuccess: (v: boolean | string) => void;
  destroy: () => void;
}

let _fieldId = 0;

/**
 * Wraps a form control with label, help text, error message, and required indicator.
 */
export function createFormField(controlEl: HTMLElement, opts: FormFieldOptions = {}): FormFieldHandle {
  const { label, error, success, help, required, variant, size, class: cls } = opts;

  const id = controlEl.id || `d-form-field-${_fieldId++}`;
  controlEl.id = id;

  const wrapCls = ['d-form-field'];
  if (variant) wrapCls.push(`d-form-field-${variant}`);
  if (size) wrapCls.push(`d-form-field-${size}`);
  if (cls) wrapCls.push(cls);

  const wrapper = h('div', { class: wrapCls.join(' ') });

  if (label) {
    const labelEl = h('label', { class: 'd-form-field-label', for: id });
    labelEl.textContent = label;
    if (required) {
      labelEl.appendChild(h('span', { class: 'd-form-field-required', 'aria-hidden': 'true' }, ' *'));
    }
    wrapper.appendChild(labelEl);
  }

  wrapper.appendChild(controlEl);

  if (help) {
    const helpId = `${id}-help`;
    const helpEl = h('div', { class: 'd-form-field-help', id: helpId }, help);
    controlEl.setAttribute('aria-describedby', helpId);
    wrapper.appendChild(helpEl);
  }

  const errId = `${id}-error`;
  const errEl = h('div', { class: 'd-form-field-error', id: errId, role: 'alert' });
  wrapper.appendChild(errEl);
  errEl.style.display = 'none';

  if (error) {
    if (typeof error === 'function') {
      createEffect(() => {
        const msg = error();
        errEl.textContent = msg || '';
        errEl.style.display = msg ? '' : 'none';
        controlEl.setAttribute('aria-invalid', msg ? 'true' : 'false');
        wrapper.toggleAttribute('data-error', !!msg);
        if (msg) controlEl.setAttribute('aria-errormessage', errId);
        else controlEl.removeAttribute('aria-errormessage');
      });
    } else {
      errEl.textContent = typeof error === 'string' ? error : '';
      errEl.style.display = '';
      controlEl.setAttribute('aria-invalid', 'true');
      controlEl.setAttribute('aria-errormessage', errId);
      wrapper.setAttribute('data-error', '');
    }
  }

  // Reactive success
  if (success) {
    if (typeof success === 'function') {
      createEffect(() => {
        const v = success();
        wrapper.toggleAttribute('data-success', !!v);
      });
    } else {
      wrapper.setAttribute('data-success', '');
    }
  }

  function setError(msg: string): void {
    errEl.textContent = msg || '';
    errEl.style.display = msg ? '' : 'none';
    controlEl.setAttribute('aria-invalid', msg ? 'true' : 'false');
    wrapper.toggleAttribute('data-error', !!msg);
    if (msg) controlEl.setAttribute('aria-errormessage', errId);
    else controlEl.removeAttribute('aria-errormessage');
  }

  function setSuccess(v: boolean | string): void {
    wrapper.toggleAttribute('data-success', !!v);
  }

  function destroy(): void {}

  return { wrapper, setError, setSuccess, destroy };
}


// ─── DRAG SYSTEM ─────────────────────────────────────────────────

export interface DragOptions {
  onMove: (x: number, y: number, dx: number, dy: number, event?: PointerEvent) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

/**
 * Lightweight drag handler for pointer-based interactions.
 */
export function createDrag(el: HTMLElement, opts: DragOptions): { destroy: () => void } {
  const { onMove, onStart, onEnd } = opts;
  let startX: number, startY: number;

  function onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
    if (onStart) onStart();
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e: PointerEvent): void {
    onMove(e.clientX, e.clientY, e.clientX - startX, e.clientY - startY);
  }

  function onPointerUp(e: PointerEvent): void {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    if (onEnd) onEnd();
  }

  el.addEventListener('pointerdown', onPointerDown);

  return { destroy: () => el.removeEventListener('pointerdown', onPointerDown) };
}


// ─── VIRTUAL SCROLL ────────────────────────────────────────────

export interface VirtualScrollOptions {
  itemHeight: number;
  totalItems: number;
  buffer?: number;
  renderItem: (index: number) => HTMLElement;
}

export interface VirtualScrollHandle {
  refresh: () => void;
  setTotal: (n: number) => void;
  destroy: () => void;
}

/**
 * Simple virtual scroller for rendering large lists efficiently.
 */
export function createVirtualScroll(containerEl: HTMLElement, opts: VirtualScrollOptions): VirtualScrollHandle {
  let { itemHeight, totalItems, buffer = 5, renderItem } = opts;

  const spacer = h('div', { style: { height: `${totalItems * itemHeight}px`, position: 'relative' } });
  const content = h('div', { style: { position: 'absolute', top: '0', left: '0', right: '0' } });
  spacer.appendChild(content);
  containerEl.appendChild(spacer);

  let _lastStart = -1, _lastEnd = -1;

  function render(): void {
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

  function refresh(): void { _lastStart = -1; render(); }
  function setTotal(n: number): void { totalItems = n; spacer.style.height = `${n * itemHeight}px`; refresh(); }
  function destroy(): void { containerEl.removeEventListener('scroll', render); }

  return { refresh, setTotal, destroy };
}


// ─── HOTKEY SYSTEM ────────────────────────────────────────────────

export interface HotkeyHandle {
  destroy: () => void;
  update: (newBindings: Record<string, (e: KeyboardEvent) => void>) => void;
}

/**
 * Registers keyboard shortcuts on an element (or document).
 */
export function createHotkey(el: HTMLElement | Document, bindings: Record<string, (e: KeyboardEvent) => void>): HotkeyHandle {
  const isMac = typeof navigator !== 'undefined' && /mac|ipod|iphone|ipad/i.test((navigator as any).userAgentData?.platform || navigator.userAgent || '');
  let _chordKey: string | null = null;
  let _chordTimer: ReturnType<typeof setTimeout> | null = null;

  interface ParsedCombo { key: string; mods: { ctrl: boolean; shift: boolean; alt: boolean; meta: boolean } }

  function parseCombo(str: string): ParsedCombo {
    const parts = str.toLowerCase().trim().split('+');
    const key = parts.pop()!;
    const mods = { ctrl: false, shift: false, alt: false, meta: false };
    for (const p of parts) {
      if (p === 'ctrl' || p === 'control') mods.ctrl = true;
      else if (p === 'shift') mods.shift = true;
      else if (p === 'alt' || p === 'option') mods.alt = true;
      else if (p === 'meta' || p === 'cmd' || p === 'command') mods.meta = true;
    }
    return { key, mods };
  }

  function matchMods(e: KeyboardEvent, mods: ParsedCombo['mods']): boolean {
    const ctrl = mods.ctrl ? (isMac ? (e.ctrlKey || e.metaKey) : e.ctrlKey) : (!e.ctrlKey && !e.metaKey);
    const shift = mods.shift ? e.shiftKey : !e.shiftKey;
    const alt = mods.alt ? e.altKey : !e.altKey;
    if (mods.meta && !isMac) return ctrl && shift && alt && e.metaKey;
    return ctrl && shift && alt;
  }

  function matchKey(e: KeyboardEvent, key: string): boolean {
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

  type ParsedEntry = { type: 'single'; combo: ParsedCombo; handler: (e: KeyboardEvent) => void }
    | { type: 'chord'; first: ParsedCombo; second: ParsedCombo; handler: (e: KeyboardEvent) => void };

  const parsed: ParsedEntry[] = [];
  let _bindings = bindings;

  function rebuild(): void {
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

  function onKeydown(e: KeyboardEvent): void {
    if (_chordKey) {
      const chord = _chordKey;
      _chordKey = null;
      if (_chordTimer) clearTimeout(_chordTimer);
      for (const entry of parsed) {
        if (entry.type === 'chord' && entry.first.key === chord && matchKey(e, entry.second.key) && matchMods(e, entry.second.mods)) {
          e.preventDefault();
          entry.handler(e);
          return;
        }
      }
    }

    for (const entry of parsed) {
      if (entry.type === 'chord' && matchKey(e, entry.first.key) && matchMods(e, entry.first.mods)) {
        e.preventDefault();
        _chordKey = entry.first.key;
        _chordTimer = setTimeout(() => { _chordKey = null; }, 1000);
        return;
      }
    }

    for (const entry of parsed) {
      if (entry.type === 'single' && matchKey(e, entry.combo.key) && matchMods(e, entry.combo.mods)) {
        e.preventDefault();
        entry.handler(e);
        return;
      }
    }
  }

  el.addEventListener('keydown', onKeydown as EventListener, true);

  function destroy(): void {
    el.removeEventListener('keydown', onKeydown as EventListener, true);
    if (_chordTimer) clearTimeout(_chordTimer);
  }

  function update(newBindings: Record<string, (e: KeyboardEvent) => void>): void {
    _bindings = newBindings;
    rebuild();
  }

  return { destroy, update };
}


// ─── INFINITE SCROLL ──────────────────────────────────────────────

export interface InfiniteScrollOptions {
  loadMore: () => void | Promise<void>;
  threshold?: number;
  sentinel?: HTMLElement;
}

/**
 * Triggers a callback when a sentinel element enters the viewport.
 */
export function createInfiniteScroll(containerEl: HTMLElement, opts: InfiniteScrollOptions): { destroy: () => void; loading: () => boolean } {
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

  function destroy(): void {
    _destroyed = true;
    observer.disconnect();
    if (!customSentinel && sentinel.parentNode) sentinel.remove();
  }

  function loading(): boolean { return _loading; }

  return { destroy, loading };
}


// ─── MASONRY LAYOUT ───────────────────────────────────────────────

export interface MasonryOptions {
  columns?: number;
  gap?: number;
}

export interface MasonryHandle {
  refresh: () => void;
  setColumns: (n: number) => void;
  destroy: () => void;
}

/**
 * Applies masonry layout to child elements of a container.
 */
export function createMasonry(containerEl: HTMLElement, opts: MasonryOptions = {}): MasonryHandle {
  let { columns = 3, gap = 16 } = opts;

  containerEl.style.position = 'relative';

  function layout(): void {
    const children = [...containerEl.children] as HTMLElement[];
    if (!children.length) { containerEl.style.height = '0'; return; }

    const containerWidth = containerEl.clientWidth;
    const colWidth = (containerWidth - gap * (columns - 1)) / columns;
    const colHeights = new Array(columns).fill(0);

    for (const child of children) {
      const minCol = colHeights.indexOf(Math.min(...colHeights));
      const x = minCol * (colWidth + gap);
      const y = colHeights[minCol];

      child.style.position = 'absolute';
      child.style.left = `${x}px`;
      child.style.top = `${y}px`;
      child.style.width = `${colWidth}px`;

      colHeights[minCol] += child.offsetHeight + gap;
    }

    containerEl.style.height = `${Math.max(...colHeights) - gap}px`;
  }

  const ro = new ResizeObserver(() => layout());
  ro.observe(containerEl);
  layout();

  function refresh(): void { layout(); }
  function setColumns(n: number): void { columns = n; layout(); }
  function destroy(): void { ro.disconnect(); }

  return { refresh, setColumns, destroy };
}


// ─── SCROLL SPY ─────────────────────────────────────────────────

export interface ScrollSpyOptions {
  rootMargin?: string;
  threshold?: number;
  onActiveChange: (element: Element) => void;
}

/**
 * Tracks which observed elements are visible in a scroll container.
 */
export function createScrollSpy(root: HTMLElement | null, opts: ScrollSpyOptions): { observe: (el: Element) => void; unobserve: (el: Element) => void; disconnect: () => void } {
  const {
    rootMargin = '-20% 0px -60% 0px',
    threshold = 0,
    onActiveChange
  } = opts;

  let currentEl: Element | null = null;

  const observer = new IntersectionObserver(
    (entries) => {
      let topEntry: IntersectionObserverEntry | null = null;
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

  function observe(el: Element): void { observer.observe(el); }
  function unobserve(el: Element): void { observer.unobserve(el); }
  function disconnect(): void { observer.disconnect(); currentEl = null; }

  return { observe, unobserve, disconnect };
}


// ─── CHECKBOX CONTROL ────────────────────────────────────────────

/**
 * Shared checkbox control for embedding styled checkboxes inside
 * compound components (Transfer, Tree, TreeSelect, DataTable).
 */
export function createCheckControl(opts: Record<string, unknown> = {}): { wrap: HTMLElement; input: HTMLInputElement } {
  const input = h('input', { type: 'checkbox', class: 'd-checkbox-native', ...opts }) as HTMLInputElement;
  const check = h('span', { class: 'd-checkbox-check' });
  const wrap = h('span', { class: 'd-checkbox-inline' }, input, check);
  return { wrap, input };
}


// ─── LIVE REGION ─────────────────────────────────────────────

export interface LiveRegionOptions {
  politeness?: 'polite' | 'assertive';
}

/**
 * Creates a persistent live region for announcing dynamic changes to screen readers.
 */
export function createLiveRegion(opts: LiveRegionOptions = {}): { announce: (msg: string) => void; destroy: () => void } {
  const { politeness = 'polite' } = opts;
  let _timer: ReturnType<typeof setTimeout> | null = null;

  const el = h('div', {
    class: 'd-sr-only',
    'aria-live': politeness,
    'aria-atomic': 'true',
    role: politeness === 'assertive' ? 'alert' : 'status'
  });
  el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';

  if (typeof document !== 'undefined') document.body.appendChild(el);

  function announce(msg: string): void {
    if (_timer) clearTimeout(_timer);
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 50);
    _timer = setTimeout(() => { el.textContent = ''; _timer = null; }, 1000);
  }

  function destroy(): void {
    if (_timer) clearTimeout(_timer);
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  return { announce, destroy };
}


// ─── SCROLL REVEAL ───────────────────────────────────────────────

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

/**
 * Scroll-reveal -- adds 'd-visible' class when element enters viewport.
 */
export function createScrollReveal(el: HTMLElement, options: ScrollRevealOptions = {}): () => void {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options;
  if (typeof IntersectionObserver === 'undefined') return () => {};
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('d-visible');
        if (once) observer.unobserve(entry.target);
      } else if (!once) {
        entry.target.classList.remove('d-visible');
      }
    }
  }, { threshold, rootMargin });
  observer.observe(el);
  return () => observer.disconnect();
}
