# UI Ecosystem Phase 2: Playground View + All Remaining Stories

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the interactive playground view to the workbench (prop editor, live preview, code output, signal inspector) and complete all remaining component stories (92 components), chart stories (25 charts), icon gallery, and CSS/theme stories.

**Architecture:** The playground view reads the `playground` field from story definitions to auto-generate controls (select, boolean, text, number, color). A reactive signal holds the current props; changes re-render the component live. Code output generates a copy-paste-ready snippet. The signal inspector hooks into `@decantr/ui/state/devtools` to show live signal values. Stories follow the established format from Phase 1.

**Tech Stack:** `@decantr/ui` (runtime, state, components, devtools), `@decantr/ui-chart` (Chart, Sparkline), `@decantr/css`, `@decantr/ui-catalog`

**Spec:** `docs/specs/2026-03-31-decantr-ui-ecosystem-design.md` (Section 4 Phase 2, Section 7 Phase 2)

**CLAUDE.md:** Do not add Co-Authored-By lines to commits.

---

## File Structure

### Playground View (NEW files in apps/workbench/)

| File | Responsibility |
|------|---------------|
| `src/views/playground.js` | Playground view: split layout with live preview + prop controls + code output |
| `src/panels/props-panel.js` | Auto-generated prop controls from story playground schema |
| `src/panels/state-panel.js` | Signal state inspector showing reactive values |

### Remaining Stories (NEW files in packages/ui-catalog/src/stories/)

| Directory | Count | Description |
|-----------|-------|-------------|
| `stories/components/` | +92 files | All remaining component stories not created in Phase 1 |
| `stories/charts/` | +25 files | All 25 chart type stories |
| `stories/icons/` | +1 file | Icon gallery story |
| `stories/css/` | +3 files | Atoms, ThemeSwitcher, Styles stories |

---

## Task 1: Playground props panel

**Files:**
- Create: `apps/workbench/src/panels/props-panel.js`

- [ ] **Step 1: Create the props panel component**

This component reads the `playground` field from a story and auto-generates form controls.

```js
// apps/workbench/src/panels/props-panel.js
import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';

/**
 * Auto-generated prop controls from story playground definition.
 * @param {{ playground: Object, currentProps: Function, onChange: Function }} props
 *   playground — the story's playground field ({ defaults, controls })
 *   currentProps — signal getter for current prop values
 *   onChange — callback: (propName, value) => void
 */
export function PropsPanel({ playground, currentProps, onChange }) {
  if (!playground || !playground.controls) {
    return h('div', { class: css('_p3 _text-sm _text-muted') }, 'No playground controls defined.');
  }

  const container = h('div', { class: css('_flex _col _gap3 _p3') });
  container.appendChild(h('h4', { class: css('_text-xs _text-muted _uppercase _tracking-wide') }, 'Props'));

  const controls = Array.isArray(playground.controls) ? playground.controls : Object.entries(playground.controls).map(([key, ctrl]) => ({ ...ctrl, key }));

  for (const control of controls) {
    const key = control.key || control.label;
    const row = h('label', { class: css('_flex _col _gap1') });
    row.appendChild(h('span', { class: css('_text-xs _text-muted') }, control.label || key));

    let input;
    switch (control.type) {
      case 'select':
        input = h('select', {
          class: css('_text-xs _px2 _py1 _rounded _bg-surface _border _border-subtle'),
          onchange: (e) => onChange(key, e.target.value),
        }, ...(control.options || []).map(opt =>
          h('option', { value: opt, selected: currentProps()[key] === opt ? '' : undefined }, opt)
        ));
        break;
      case 'boolean':
        input = h('input', {
          type: 'checkbox',
          checked: currentProps()[key] ? '' : undefined,
          onchange: (e) => onChange(key, e.target.checked),
        });
        break;
      case 'text':
        input = h('input', {
          type: 'text',
          class: css('_text-xs _px2 _py1 _rounded _bg-surface _border _border-subtle'),
          value: currentProps()[key] || '',
          oninput: (e) => onChange(key, e.target.value),
        });
        break;
      case 'number':
        input = h('input', {
          type: 'number',
          class: css('_text-xs _px2 _py1 _rounded _bg-surface _border _border-subtle'),
          value: currentProps()[key] || 0,
          oninput: (e) => onChange(key, parseFloat(e.target.value)),
        });
        break;
      case 'color':
        input = h('input', {
          type: 'color',
          value: currentProps()[key] || '#000000',
          oninput: (e) => onChange(key, e.target.value),
        });
        break;
      default:
        input = h('span', { class: css('_text-xs _text-muted') }, `Unknown type: ${control.type}`);
    }

    row.appendChild(input);
    container.appendChild(row);
  }

  return container;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/workbench/src/panels/props-panel.js
git commit -m "feat(workbench): add auto-generated props panel from story playground schema"
```

---

## Task 2: Signal state inspector panel

**Files:**
- Create: `apps/workbench/src/panels/state-panel.js`

- [ ] **Step 1: Create the state panel**

This panel shows the current playground props as a live JSON view. In Phase 1 we keep this simple — display the reactive props object. Future phases can hook into `@decantr/ui/state/devtools` for deeper signal introspection.

```js
// apps/workbench/src/panels/state-panel.js
import { h } from '@decantr/ui/runtime';
import { createEffect } from '@decantr/ui/state';
import { css } from '@decantr/css';

/**
 * Signal state inspector — shows current playground props as live JSON.
 * @param {{ currentProps: Function }} props — signal getter
 */
export function StatePanel({ currentProps }) {
  const container = h('div', { class: css('_flex _col _gap2 _p3') });
  container.appendChild(h('h4', { class: css('_text-xs _text-muted _uppercase _tracking-wide') }, 'Signal State'));

  const pre = h('pre', {
    class: css('_text-xs _font-mono _bg-surface _p2 _rounded _overflow-auto _border _border-subtle'),
    style: 'max-height: 200px',
  });

  createEffect(() => {
    const props = currentProps();
    pre.textContent = JSON.stringify(props, null, 2);
  });

  container.appendChild(pre);
  return container;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/workbench/src/panels/state-panel.js
git commit -m "feat(workbench): add signal state inspector panel"
```

---

## Task 3: Playground view

**Files:**
- Create: `apps/workbench/src/views/playground.js`
- Modify: `apps/workbench/src/app.js` — add view switching between isolation and playground

- [ ] **Step 1: Create the playground view**

The playground view has three sections:
1. **Live preview** — renders the component with current props (re-renders on change)
2. **Props panel** — auto-generated controls from the story's playground schema
3. **Code output** — generates a copy-paste-ready import + usage snippet

```js
// apps/workbench/src/views/playground.js
import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect, batch } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { PropsPanel } from '../panels/props-panel.js';
import { StatePanel } from '../panels/state-panel.js';

/**
 * Playground view — interactive prop editor with live preview and code output.
 * @param {{ story: Object }} props
 */
export function PlaygroundView({ story }) {
  if (!story.playground) {
    return h('div', { class: css('_p6 _text-muted') },
      h('p', null, `"${story.title}" has no playground controls defined.`),
      h('p', { class: css('_text-xs _mt2') }, 'Add a playground field to the story to enable this view.')
    );
  }

  // Reactive props signal — initialized from playground defaults
  const [currentProps, setCurrentProps] = createSignal({ ...story.playground.defaults });

  function handleChange(key, value) {
    setCurrentProps(prev => ({ ...prev, [key]: value }));
  }

  // ─── Live Preview ───
  const previewContainer = h('div', {
    class: css('_flex-1 _p6 _overflow-auto'),
  });

  const previewArea = h('div', {
    class: css('_p4 _rounded _border _border-subtle _bg-surface'),
    style: 'min-height: 120px; display: flex; align-items: center; justify-content: center',
  });

  createEffect(() => {
    const props = currentProps();
    previewArea.innerHTML = '';
    try {
      const rendered = story.component(props);
      previewArea.appendChild(rendered);
    } catch (e) {
      previewArea.appendChild(h('span', { class: css('_text-sm'), style: 'color: var(--d-destructive, #ef4444)' }, `Error: ${e.message}`));
    }
  });

  // ─── Code Output ───
  const codeBlock = h('pre', {
    class: css('_p3 _rounded _bg-surface _text-xs _font-mono _border _border-subtle _overflow-x-auto'),
  });

  createEffect(() => {
    const props = currentProps();
    const propsStr = Object.entries(props)
      .filter(([k, v]) => v !== undefined && v !== '' && v !== false && k !== '_content')
      .map(([k, v]) => {
        if (typeof v === 'boolean') return v ? k : null;
        if (typeof v === 'number') return `${k}: ${v}`;
        return `${k}: '${v}'`;
      })
      .filter(Boolean)
      .join(', ');

    const contentPart = props._content ? `, '${props._content}'` : '';
    codeBlock.textContent = `import { ${story.title} } from '@decantr/ui/components'\n\n${story.title}({ ${propsStr} }${contentPart})`;
  });

  // ─── Layout ───
  const container = h('div', { class: css('_flex _col _gap4 _h-full') });

  // Header
  container.appendChild(h('div', { class: css('_flex _col _gap1 _px6 _pt6') },
    h('h2', { class: css('_text-xl _font-bold') }, `${story.title} — Playground`),
    h('p', { class: css('_text-sm _text-muted') }, story.description),
  ));

  // Main area: preview + controls side by side
  const main = h('div', { class: css('_flex _flex-1 _overflow-hidden') });

  // Left: preview + code
  const left = h('div', { class: css('_flex _col _flex-1 _gap4 _px6 _pb6 _overflow-auto') });
  left.appendChild(h('div', { class: css('_flex _col _gap2') },
    h('h3', { class: css('_text-sm _font-medium _text-muted') }, 'Preview'),
    previewArea
  ));
  left.appendChild(h('div', { class: css('_flex _col _gap2') },
    h('h3', { class: css('_text-sm _font-medium _text-muted') }, 'Code'),
    codeBlock
  ));
  main.appendChild(left);

  // Right: prop controls + state
  const right = h('div', {
    class: css('_flex _col _border-l _border-subtle _overflow-auto'),
    style: 'width: 260px; min-width: 260px',
  });
  right.appendChild(PropsPanel({ playground: story.playground, currentProps, onChange: handleChange }));
  right.appendChild(h('div', { class: css('_border-t _border-subtle') }));
  right.appendChild(StatePanel({ currentProps }));
  main.appendChild(right);

  container.appendChild(main);
  return container;
}
```

- [ ] **Step 2: Update app.js with view switching**

Modify `apps/workbench/src/app.js` to add a view mode signal (`isolation` vs `playground`) and a toggle in the toolbar area or as tabs above the main content. Import `PlaygroundView` and conditionally render it.

The implementing agent should:
- Read current `app.js` to understand the layout
- Add a `[viewMode, setViewMode] = createSignal('isolation')` signal
- Add two clickable tabs ("Isolation" / "Playground") above the main panel
- In the `createEffect` that renders the main panel, switch between `IsolationView` and `PlaygroundView` based on `viewMode()`
- Pass `setViewMode` or the tabs to the toolbar if appropriate

- [ ] **Step 3: Verify the workbench starts**

Run: `pnpm --filter @decantr/workbench dev` briefly to confirm no import errors.

- [ ] **Step 4: Commit**

```bash
git add apps/workbench/src/views/playground.js apps/workbench/src/app.js
git commit -m "feat(workbench): add playground view with live preview, prop editor, and code output"
```

---

## Task 4: Remaining Original component stories (15 components)

**Files:** Create stories for components in the "Original" group that don't have stories yet.

**Components:** Textarea, Separator, Breadcrumb, Avatar, Skeleton, Chip, Dropdown, Drawer, Pagination, RadioGroup, Popover, Combobox, Slider, toast (function-based), icon (function-based)

For each: read the source at `packages/ui/src/components/<name>.js`, write `packages/ui-catalog/src/stories/components/<Name>.story.js` following the established story format.

Note: `toast` and `icon` are function-based (not component constructors). Their stories should use wrapper functions.

- [ ] **Step 1: Read each component source and write its story file**
- [ ] **Step 2: Run `pnpm --filter @decantr/ui-catalog exec vitest run` — all tests pass**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add remaining Original component stories (Textarea, Separator, Breadcrumb, Avatar, Skeleton, Chip, Dropdown, Drawer, Pagination, RadioGroup, Popover, Combobox, Slider, toast, icon)"
```

---

## Task 5: General component stories (8 components)

**Components:** Toggle, ToggleGroup, Title, Text, Paragraph, Link, Blockquote, Kbd

Category: `components/general`

- [ ] **Step 1: Read each source, write story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add General component stories (Toggle, ToggleGroup, Title, Text, Paragraph, Link, Blockquote, Kbd)"
```

---

## Task 6: Layout component stories (7 components)

**Components:** Shell, Space, AspectRatio, Resizable, ScrollArea, Collapsible, Splitter

Category: `components/layout`

- [ ] **Step 1: Read each source, write story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add Layout component stories (Shell, Space, AspectRatio, Resizable, ScrollArea, Collapsible, Splitter)"
```

---

## Task 7: Navigation component stories (7 components)

**Components:** Menu, Steps, Segmented, Affix, ContextMenu, NavigationMenu, BackTop

Category: `components/navigation`

- [ ] **Step 1: Read each source, write story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add Navigation component stories (Menu, Steps, Segmented, Affix, ContextMenu, NavigationMenu, BackTop)"
```

---

## Task 8: Form component stories (18 components)

**Components:** InputGroup, CompactGroup, InputNumber, InputOTP, Rate, ColorPicker, ColorPalette, DatePicker, TimePicker, Upload, Transfer, Cascader, Mentions, Label, Form, Field, DateRangePicker, TimeRangePicker, RangeSlider, TreeSelect

Category: `components/form`

Note: Some of these are complex (DatePicker, Transfer, Cascader) — stories should show the component with minimal realistic props. Don't try to demonstrate every sub-feature.

- [ ] **Step 1: Read each source, write story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add Form component stories (InputGroup through TreeSelect, 18 components)"
```

---

## Task 9: Data Display component stories (14 components)

**Components:** DataTable, AvatarGroup, Tag, List, Tree, Descriptions, Statistic, Calendar, Carousel, Empty, Placeholder, Image, Timeline, Comment, QRCode, HoverCard

Category: `components/data-display`

- [ ] **Step 1: Read each source, write story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add Data Display component stories (DataTable through HoverCard, 14 components)"
```

---

## Task 10: Feedback component stories (9 components)

**Components:** AlertDialog, notification (function), message (function), Result, Popconfirm, Command, FloatButton, Tour, Watermark

Category: `components/feedback`

Note: `notification` and `message` are function-based (imperative API), similar to `toast`. Use wrapper functions in stories.

- [ ] **Step 1: Read each source, write story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add Feedback component stories (AlertDialog through Watermark, 9 components)"
```

---

## Task 11: New (v0.4.1), Media, Utility, and Behavior stories (10 components)

**New (v0.4.1):** MaskedInput, Banner, CodeBlock, SortableList, DateTimePicker
**Media:** Marquee, BrowserFrame, createHighlighter
**Utility:** VisuallyHidden, SkipLink

Categories: `components/form` for MaskedInput/DateTimePicker, `components/feedback` for Banner, `components/media` for CodeBlock/Marquee/BrowserFrame/createHighlighter, `components/utility` for VisuallyHidden/SkipLink, `components/data-display` for SortableList

The implementing agent should check each component's actual group in components/index.js and assign the correct category.

- [ ] **Step 1: Read each source, write story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/components/
git commit -m "feat(ui-catalog): add v0.4.1, Media, Utility component stories (10 components)"
```

---

## Task 12: Chart stories (25 chart types + Sparkline)

**Files:** Create `packages/ui-catalog/src/stories/charts/` directory with story files.

The `Chart` component from `@decantr/ui-chart` takes a spec object:
```js
Chart({
  type: 'line',        // chart type
  data: [...],         // array of data points
  x: 'month',          // x-axis field
  y: 'value',          // y-axis field (or array for multi-series)
  title: 'My Chart',   // optional title
  height: '300px',     // height
  tooltip: true,       // show tooltips
  legend: true,        // show legend
  animate: true,       // entrance animation
})
```

**Chart types to create stories for:**
line, bar, area, pie, scatter, bubble, histogram, box-plot, candlestick, waterfall, range-bar, range-area, heatmap, combination, radar, radial, gauge, funnel, treemap, sunburst, sankey, chord, swimlane, org-chart

Plus a `Sparkline` story.

Each chart story should:
- Import `Chart` (or `Sparkline`) from `@decantr/ui-chart`
- Use category `'charts'`
- Include realistic sample data
- Show 2-4 variants (e.g., basic, multi-series, stacked, custom colors)
- Include playground controls for common options (height, animate, tooltip, legend, stacked)

- [ ] **Step 1: Create all 25 chart stories + Sparkline story**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/charts/
git commit -m "feat(ui-catalog): add all 25 chart type stories plus Sparkline"
```

---

## Task 13: Icon gallery and CSS stories

**Files:**
- Create: `packages/ui-catalog/src/stories/icons/IconGallery.story.js`
- Create: `packages/ui-catalog/src/stories/css/Atoms.story.js`
- Create: `packages/ui-catalog/src/stories/css/ThemeSwitcher.story.js`
- Create: `packages/ui-catalog/src/stories/css/Styles.story.js`

**Icon Gallery story:**
- Import `getIconNames, getIconPath` from `@decantr/ui/icons` and `icon` from `@decantr/ui/components`
- Category: `icons`
- The component function renders a grid of all icons with their names
- Single variant showing the full gallery
- Playground with search filter (text control)

**Atoms story:**
- Category: `css`
- Demonstrates the `css()` function with common atom patterns
- Variants showing flex, grid, spacing, typography, color atoms

**ThemeSwitcher story:**
- Category: `css`
- Demonstrates `setStyle`, `setMode`, `setShape` from `@decantr/ui/css`
- Shows a panel of buttons that switch themes and a sample component to see the effect

**Styles story:**
- Category: `css`
- Shows all registered styles from `getStyleList()`
- Variants showing a sample component rendered in each style

- [ ] **Step 1: Create all 4 story files**
- [ ] **Step 2: Run tests**
- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/icons/ packages/ui-catalog/src/stories/css/
git commit -m "feat(ui-catalog): add icon gallery and CSS/theme stories"
```

---

## Task 14: Final integration verification

- [ ] **Step 1: Run all catalog tests**

Run: `pnpm --filter @decantr/ui-catalog exec vitest run`
Expected: All tests pass.

- [ ] **Step 2: Verify story count**

Run: `find packages/ui-catalog/src/stories -name '*.story.js' | wc -l`
Expected: ~135+ stories (15 from Phase 1 + ~92 components + 26 charts + 1 icon + 3 CSS)

- [ ] **Step 3: Start workbench and verify**

Run: `pnpm --filter @decantr/workbench dev` briefly.
Expected: Starts on port 3333, sidebar shows all categories and stories.

- [ ] **Step 4: Fix any issues and commit**

```bash
git add -A
git commit -m "fix: Phase 2 integration fixes"
```
