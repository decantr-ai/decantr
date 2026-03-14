# Behavioral Primitives Reference

`src/components/_behaviors.js` provides composable behavioral systems used by 70+ components. Each primitive wires up event listeners, ARIA state, and keyboard interactions so components stay thin — import the behavior, call it, and wire `destroy()` to `onDestroy()`.

## Cleanup Contract

**All primitives returning `destroy()` (or `deactivate()`/`disconnect()`) MUST be wired to `onDestroy()`.** Failure to do so leaks document listeners, timers, and observers when components are removed from the DOM. See `reference/component-lifecycle.md` for patterns.

```javascript
const overlay = createOverlay(trigger, panel, { trigger: 'click' });
const listbox = createListbox(panel, { onSelect: handleSelect });
onDestroy(() => { overlay.destroy(); listbox.destroy(); });
```

---

## Overlay

### `createOverlay(triggerEl, contentEl, opts?)`

Managed floating layer with show/hide, click-outside, escape-to-close, and ARIA state.

**Used by:** Tooltip, Popover, HoverCard, Dropdown, Select, Combobox, DatePicker, TimePicker, ColorPicker, Cascader, TreeSelect, Mentions, Command, NavigationMenu, ContextMenu, Popconfirm, Tour

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `triggerEl` | `HTMLElement` | — | Element that triggers the overlay |
| `contentEl` | `HTMLElement` | — | Floating content element |
| `opts.trigger` | `'click'\|'hover'\|'manual'` | `'click'` | Activation mode |
| `opts.closeOnEscape` | `boolean` | `true` | Escape key closes overlay |
| `opts.closeOnOutside` | `boolean` | `true` | Click outside closes overlay |
| `opts.hoverDelay` | `number` | `200` | ms delay before showing (hover mode) |
| `opts.hoverCloseDelay` | `number` | `150` | ms delay before hiding (hover mode) |
| `opts.onOpen` | `Function` | — | Called when overlay opens |
| `opts.onClose` | `Function` | — | Called when overlay closes |
| `opts.usePopover` | `boolean` | `false` | Use Popover API instead of display toggle |

**Returns:** `{ open(), close(), toggle(), isOpen(): boolean, destroy() }`

**ARIA managed:** `aria-expanded` on `triggerEl` (`'true'`/`'false'`)

```javascript
const overlay = createOverlay(btn, panel, { trigger: 'hover', hoverDelay: 300 });
onDestroy(() => overlay.destroy());
```

---

## Navigation

### `createListbox(containerEl, opts?)`

Keyboard navigation + selection for option lists. Manages highlight, arrow keys, enter/space selection, type-ahead search, and scroll-into-view.

**Used by:** Select, Combobox, Command, Cascader, TreeSelect, Transfer, Mentions, AutoComplete, ContextMenu, Dropdown

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `containerEl` | `HTMLElement` | — | Listbox container |
| `opts.itemSelector` | `string` | `'.d-option'` | CSS selector for option elements |
| `opts.activeClass` | `string` | `'d-option-active'` | Class for highlighted item |
| `opts.disabledSelector` | `string` | `'.d-option-disabled'` | Selector for disabled items |
| `opts.loop` | `boolean` | `true` | Loop at list boundaries |
| `opts.orientation` | `'vertical'\|'horizontal'` | `'vertical'` | Arrow key axis |
| `opts.multiSelect` | `boolean` | `false` | Allow multi-selection |
| `opts.typeAhead` | `boolean` | `false` | Type-to-search (500ms buffer) |
| `opts.onSelect` | `Function` | — | Called with `(element, index)` |
| `opts.onHighlight` | `Function` | — | Called with `(element, index)` |

**Returns:** `{ highlight(index), highlightNext(), highlightPrev(), selectCurrent(), getActiveIndex(): number, reset(), handleKeydown(e), destroy() }`

**ARIA managed:** `aria-selected` on each option (`'true'`/`'false'`)

**Keys handled:** ArrowDown/ArrowUp (or ArrowRight/ArrowLeft for horizontal), Home, End, Enter, Space, type-ahead characters

```javascript
const listbox = createListbox(panel, { typeAhead: true, onSelect: (el, i) => pick(i) });
onDestroy(() => listbox.destroy());
```

### `createRovingTabindex(containerEl, opts?)`

Roving tabindex pattern for groups. One element has `tabindex=0`, rest have `tabindex=-1`. Arrow keys move focus.

**Used by:** Tabs, RadioGroup, ToggleGroup, Segmented, Menu, Menubar, ButtonGroup, Toolbar

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `containerEl` | `HTMLElement` | — | Container element |
| `opts.itemSelector` | `string` | `'[role="tab"]'` | Selector for navigable items |
| `opts.orientation` | `'horizontal'\|'vertical'\|'both'` | `'horizontal'` | Arrow key axes |
| `opts.loop` | `boolean` | `true` | Loop at boundaries |
| `opts.onFocus` | `Function` | — | Called with `(element, index)` |

**Returns:** `{ focus(index), setActive(index), getActive(): number, destroy() }`

**ARIA managed:** `tabindex` on each item (`'0'` or `'-1'`)

**Keys handled:** ArrowRight/ArrowLeft (horizontal), ArrowDown/ArrowUp (vertical), Home, End

```javascript
const roving = createRovingTabindex(tabList, { itemSelector: '[role="tab"]' });
onDestroy(() => roving.destroy());
```

### `createDisclosure(triggerEl, contentEl, opts?)`

Expand/collapse with smooth height animation. Does not add document-level listeners.

**Used by:** Accordion, Collapsible, Tree, NavigationMenu sections

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `triggerEl` | `HTMLElement` | — | Toggle trigger |
| `contentEl` | `HTMLElement` | — | Collapsible content |
| `opts.defaultOpen` | `boolean` | `false` | Initial state |
| `opts.animate` | `boolean` | `true` | Smooth height transition |
| `opts.onToggle` | `Function` | — | Called with `(isOpen)` |

**Returns:** `{ open(), close(), toggle(), isOpen(): boolean }`

**ARIA managed:** `aria-expanded` on `triggerEl`

**Keys handled:** Enter, Space on trigger

**Note:** No `destroy()` — uses only element-level listeners (cleaned up with the element).

```javascript
const disc = createDisclosure(header, body, { defaultOpen: true });
```

---

## Focus

### `createFocusTrap(containerEl)`

Traps Tab/Shift+Tab cycling within focusable elements. Focuses first focusable on activate.

**Used by:** Modal, Drawer, AlertDialog, Command

| Param | Type | Description |
|-------|------|-------------|
| `containerEl` | `HTMLElement` | Container to trap focus within |

**Returns:** `{ activate(), deactivate() }`

**Focusable selector:** `a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`

**Keys handled:** Tab, Shift+Tab

**Cleanup:** Call `deactivate()` via `onDestroy()`.

```javascript
const trap = createFocusTrap(panel);
trap.activate();
onDestroy(() => trap.deactivate());
```

---

## Interaction

### `createDrag(el, opts)`

Lightweight pointer-based drag handler. Tracks pointer movement with delta from start position.

**Used by:** Slider, Resizable, Transfer, DnD sorting

| Param | Type | Description |
|-------|------|-------------|
| `el` | `HTMLElement` | Draggable element |
| `opts.onMove` | `Function` | Called with `(x, y, dx, dy, event)` |
| `opts.onStart` | `Function` | Called with `(x, y, event)` |
| `opts.onEnd` | `Function` | Called with `(x, y, event)` |

**Returns:** `{ destroy() }`

```javascript
const drag = createDrag(handle, { onMove: (x, y, dx, dy) => update(dx) });
onDestroy(() => drag.destroy());
```

### `createHotkey(el, bindings)`

Keyboard shortcut registration with modifier normalization, chord sequences, and Mac meta-key handling.

**Used by:** Command, Modal, custom app shortcuts

| Param | Type | Description |
|-------|------|-------------|
| `el` | `HTMLElement\|Document` | Scope element for key events |
| `bindings` | `Object<string, Function>` | Map of shortcut string to handler |

**Shortcut format:** `'ctrl+k'`, `'shift+alt+n'`, `'meta+enter'`, `'g g'` (chord). Modifiers: `ctrl`, `shift`, `alt`, `meta`/`cmd`/`command`. On Mac, `ctrl` matches both Ctrl and Meta.

**Returns:** `{ destroy(), update(newBindings) }`

```javascript
const hk = createHotkey(document, { 'ctrl+k': openSearch, 'g g': goTop });
onDestroy(() => hk.destroy());
```

---

## Scroll

### `createVirtualScroll(containerEl, opts)`

Renders only visible items + buffer for large lists. Fixed item height.

**Used by:** DataTable, Tree (large), Transfer, Select (many options)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `containerEl` | `HTMLElement` | — | Scrollable container |
| `opts.itemHeight` | `number` | — | Fixed item height (px) |
| `opts.totalItems` | `number` | — | Total item count |
| `opts.buffer` | `number` | `5` | Extra items above/below viewport |
| `opts.renderItem` | `Function` | — | `(index) => HTMLElement` |

**Returns:** `{ refresh(), setTotal(n), destroy() }`

```javascript
const vs = createVirtualScroll(container, { itemHeight: 36, totalItems: 10000, renderItem: renderRow });
onDestroy(() => vs.destroy());
```

### `createInfiniteScroll(containerEl, opts)`

Triggers load-more when a sentinel element enters the viewport via IntersectionObserver.

**Used by:** List (infinite mode), feeds, search results

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `containerEl` | `HTMLElement` | — | Scrollable container |
| `opts.loadMore` | `Function` | — | Async callback to load more data |
| `opts.threshold` | `number` | `200` | Distance (px) from bottom to trigger |
| `opts.sentinel` | `HTMLElement` | auto-created | Custom sentinel element |

**Returns:** `{ destroy(), loading(): boolean }`

```javascript
const inf = createInfiniteScroll(list, { loadMore: fetchNextPage, threshold: 300 });
onDestroy(() => inf.destroy());
```

### `createScrollSpy(root, opts?)`

Tracks which observed section is visible. Calls callback when active section changes.

**Used by:** TableOfContents, workbench navigation, documentation layouts

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `root` | `HTMLElement\|null` | — | Scroll container (`null` = viewport) |
| `opts.rootMargin` | `string` | `'-20% 0px -60% 0px'` | IntersectionObserver margin |
| `opts.threshold` | `number` | `0` | Visibility threshold |
| `opts.onActiveChange` | `Function` | — | Called with `(element)` |

**Returns:** `{ observe(el), unobserve(el), disconnect() }`

**Cleanup:** Call `disconnect()` via `onDestroy()`.

```javascript
const spy = createScrollSpy(null, { onActiveChange: (el) => highlight(el.id) });
sections.forEach(s => spy.observe(s));
onDestroy(() => spy.disconnect());
```

---

## Layout

### `createMasonry(containerEl, opts?)`

Pinterest-style layout via shortest-column placement. Auto-recalculates on resize via ResizeObserver.

**Used by:** Image galleries, card grids

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `containerEl` | `HTMLElement` | — | Container whose children are laid out |
| `opts.columns` | `number` | `3` | Number of columns |
| `opts.gap` | `number` | `16` | Gap between items (px) |

**Returns:** `{ refresh(), setColumns(n), destroy() }`

```javascript
const masonry = createMasonry(grid, { columns: 4, gap: 24 });
onDestroy(() => masonry.destroy());
```

---

## Form

### `createFormField(controlEl, opts?)`

Wraps a form control with label, help text, error message, and required indicator. Manages ARIA attributes reactively.

**Used by:** All form inputs (Input, Select, Checkbox, Switch, etc.)

| Param | Type | Description |
|-------|------|-------------|
| `controlEl` | `HTMLElement` | The input/select/textarea element |
| `opts.label` | `string` | Label text |
| `opts.error` | `string\|Function` | Static or reactive (getter) error message |
| `opts.help` | `string` | Help text |
| `opts.required` | `boolean` | Show required indicator |
| `opts.class` | `string` | Additional CSS class on wrapper |

**Returns:** `HTMLElement` (the `d-field` wrapper)

**ARIA managed:** `aria-describedby` (links to help text), `aria-invalid`, `aria-errormessage` (links to error), `aria-hidden` on required indicator

**Note:** No `destroy()` — uses `createEffect` for reactive error tracking (cleaned up by reactivity system).

```javascript
const input = h('input', { type: 'text', class: 'd-input' });
const field = createFormField(input, { label: 'Email', error: () => emailErr(), required: true });
```

---

## Utilities

### `caret(direction?, opts?)`

Shared chevron icon for dropdowns, accordions, and other disclosure components.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `direction` | `'down'\|'up'\|'right'\|'left'` | `'down'` | Arrow direction |
| `opts` | `Object` | `{}` | Passed to `icon()`, plus optional `class` |

**Returns:** `HTMLElement` (SVG icon with class `d-caret`)

```javascript
trigger.appendChild(caret('down'));
```

### `createCheckControl(opts?)`

Styled checkbox for compound components. Returns same structure as Checkbox component.

**Used by:** Transfer, Tree, TreeSelect, DataTable

| Param | Type | Description |
|-------|------|-------------|
| `opts` | `Object` | Attributes for `<input type="checkbox">` |

**Returns:** `{ wrap: HTMLElement, input: HTMLInputElement }`

```javascript
const { wrap, input } = createCheckControl({ checked: true });
row.appendChild(wrap);
```

---

## Quick Reference

| Primitive | Category | Has `destroy()`? | Document listeners? |
|-----------|----------|-------------------|---------------------|
| `createOverlay` | Overlay | Yes | Yes (keydown, mousedown) |
| `createListbox` | Navigation | Yes | No (container only) |
| `createRovingTabindex` | Navigation | Yes | No (container only) |
| `createDisclosure` | Navigation | No | No |
| `createFocusTrap` | Focus | `deactivate()` | No (container only) |
| `createDrag` | Interaction | Yes | Yes (pointermove, pointerup during drag) |
| `createHotkey` | Keyboard | Yes | Yes (keydown) |
| `createVirtualScroll` | Scroll | Yes | No (container scroll) |
| `createInfiniteScroll` | Scroll | Yes | No (IntersectionObserver) |
| `createScrollSpy` | Scroll | `disconnect()` | No (IntersectionObserver) |
| `createMasonry` | Layout | Yes | No (ResizeObserver) |
| `createFormField` | Form | No | No |
| `createCheckControl` | Utility | No | No |
| `caret` | Utility | No | No |

---

**See also:** `reference/component-lifecycle.md`, `reference/compound-spacing.md`
