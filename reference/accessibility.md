# Accessibility Reference

Decantr targets **WCAG 2.1 AA** compliance across all components and patterns.

## Component ARIA Contracts

### Modal
- `<dialog>` with `aria-modal="true"` and `aria-labelledby` (points to title)
- Focus trapped within panel via `createFocusTrap`
- Escape closes, backdrop click closes

### AlertDialog
- `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- Focus trapped, initial focus on cancel button (least destructive)

### Select / Combobox
- Trigger has `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`
- `aria-activedescendant` on trigger/input tracks highlighted option
- Options have `role="option"`, unique `id`, `aria-selected`, `aria-disabled`

### Dropdown
- Trigger has `aria-haspopup="menu"`, `aria-expanded`
- Menu has `role="menu"`, items have `role="menuitem"`, `aria-disabled`
- `aria-activedescendant` on menu element, type-ahead enabled

### DataTable
- `role="grid"`, `aria-rowcount` on table, `aria-rowindex` on rows
- Column resize handles: `role="separator"`, `tabindex="0"`, Arrow key support
- Sort/filter changes announced via live region
- `aria-sort` on sortable column headers

### Accordion
- Triggers have `aria-expanded`, `aria-controls`, `aria-disabled`
- Regions have `role="region"`, `aria-labelledby`
- Arrow keys navigate between triggers, Home/End jump to first/last

### RadioGroup
- `role="radiogroup"`, `aria-label`
- `aria-invalid` + `aria-errormessage` when error state active
- Roving tabindex for keyboard navigation

### Button
- `aria-busy="true"` when in loading state

### Input
- `aria-required="true"` when required prop set
- `aria-describedby` wired to help text via `createFormField`

### Tree
- `role="tree"` on container, `role="treeitem"` on nodes
- `aria-level`, `aria-setsize`, `aria-posinset` on every node

### SkipLink
- Visually hidden, visible on `:focus`
- Targets `#main-content` by default

## Keyboard Navigation Patterns

| Component | Keys |
|-----------|------|
| Modal | Tab/Shift+Tab cycle (trapped), Escape closes |
| Select/Combobox | Arrow Up/Down navigate, Enter selects, Escape closes |
| Dropdown | Arrow Down opens + navigates, Enter/Space select, Escape closes, type-ahead |
| Accordion | Arrow Up/Down between triggers, Home/End, Enter/Space toggle |
| Tabs | Arrow Left/Right (horizontal), focus follows selection |
| RadioGroup | Arrow keys select + focus, roving tabindex |
| ToggleGroup | Arrow keys navigate, roving tabindex |
| DataTable | Column resize via Arrow Left/Right on handle |
| Tree | Arrow keys expand/collapse/navigate |

## Color Contrast

- `derive()` validates WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
- `prefers-contrast: more` → bumps border and muted-fg tokens for higher contrast
- `forced-colors: active` → all interactive controls get explicit `ButtonText` borders

## Motion Sensitivity

- `Transition` component respects `prefers-reduced-motion: reduce` (duration → 0, classes skipped)
- Motion atoms: `_motionSafe:` prefix → only applies when motion is OK
- Motion atoms: `_motionReduce:` prefix → only applies when user prefers reduced motion
- `setAnimations(false)` disables all framework animations globally

## RTL Support

- Logical property atoms: `_mis`, `_mie`, `_pis`, `_pie`, `_pbs`, `_pbe`, `_mbs`, `_mbe`
- `setDirection('rtl')` sets `dir="rtl"` on document root
- `setLocale()` syncs `document.documentElement.lang`

## Live Regions

- `createLiveRegion({ politeness })` — persistent SR-only div for dynamic announcements
- Router announces page changes via `aria-live="polite"` region
- DataTable announces sort direction and filter result counts

## Audit Tool

Run `npx decantr a11y` for static analysis. 12 rules:
`button-label`, `input-label`, `img-alt`, `focus-visible`, `keyboard-handler`, `role-valid`, `heading-order`, `contrast-ratio`, `dialog-label`, `listbox-label`, `table-structure`, `live-region-valid`
