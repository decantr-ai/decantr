# Icon System Reference

Decantr's icon system renders 375 essential stroke-based SVG icons as CSS-masked `<span>` elements. Icons inherit `currentColor`, inject CSS once per name, and tree-shake unused paths at build time.

## Rendering Pipeline

```
essential.js → getIconPath(name) → icon(name, opts)
                                       ↓
                                  buildDataUri(inner, weight, filled)
                                       ↓
                                  injectIconCSS(name, inner, weight, filled)
                                       ↓
                                  <span class="d-i d-i-{variantKey}">
```

All icons use a 24×24 viewBox, `stroke-linecap="round"`, `stroke-linejoin="round"`. Default: `stroke-width="2"`, `fill="none"`. Weight and fill options parameterize the SVG wrapper. The `<span>` uses `mask-image` with a data URI — color comes from `currentColor` via the parent's `color` property. Each icon variant is injected into a shared `<style data-decantr-icons>` element exactly once (keyed by name + weight + filled).

---

## Core API

### `icon(name, opts?)` — `@decantr/decantr/components`

Render an icon as a `<span>` element.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | — | Icon name in kebab-case (e.g. `'check'`, `'chevron-down'`) |
| `opts.size` | `string\|number` | `'1.25em'` | CSS width and height |
| `opts.weight` | `string\|number` | `'regular'` | Stroke weight (see Weight table below) |
| `opts.filled` | `boolean` | `false` | Fill closed shapes |
| `opts.class` | `string` | — | Additional CSS classes |
| `...rest` | — | — | Spread to the `<span>` element |

**Returns:** `HTMLElement` with `class="d-i d-i-{name}"`, `role="img"`, `aria-hidden="true"`

```javascript
import { icon } from '@decantr/decantr/components';

icon('check');                                          // default 1.25em, regular weight
icon('star', { size: '1em' });                          // inline with text
icon('home', { size: '2rem' });                         // large feature icon
icon('edit', { class: css('_fgprimary') });             // colored
icon('heart', { filled: true });                        // solid heart
icon('star', { weight: 'bold', filled: true });         // bold + filled
icon('chevron-down', { weight: 'thin' });               // thin stroke
icon('circle', { weight: 1.5 });                        // numeric weight
```

#### Weight

Named or numeric, controls `stroke-width`. Numeric values clamped to `[0.5, 4]`.

| Name | stroke-width |
|------|-------------|
| `thin` | 1 |
| `light` | 1.5 |
| `regular` | 2 (default) |
| `medium` | 2.5 |
| `bold` | 3 |

Fill-based icons (auto-detected via `fill=` attribute) ignore weight.

#### Filled

Boolean, default `false`. Adds `fill='black'` alongside stroke attributes in the SVG wrapper. Closed shapes (paths, polygons, circles, rects) fill in; open elements (lines, polylines) remain unchanged. Fill-based icons ignore this option (already filled).

#### CSS Class Naming

Variants produce CSS class suffixes on `d-i-{name}`:

| Variant | CSS class example |
|---------|------------------|
| Default (regular, no fill) | `d-i-heart` |
| Weight only | `d-i-heart--w1` (thin), `d-i-heart--w1p5` (light) |
| Fill only | `d-i-heart--filled` |
| Weight + fill | `d-i-heart--w3-filled` (bold + filled) |

Decimals use `p` in class names: `1.5` → `w1p5`, `2.5` → `w2p5`.

### Registry Functions — `@decantr/decantr/icons`

| Function | Signature | Description |
|----------|-----------|-------------|
| `getIconPath` | `(name) → string\|null` | Get SVG inner content for an icon |
| `registerIcon` | `(name, svgInner)` | Register or override a single icon |
| `registerIcons` | `(map)` | Bulk-register from `{ name: svgInner }` object |
| `hasIcon` | `(name) → boolean` | Check if icon is available |
| `getIconNames` | `() → string[]` | List all available icon names |

### `caret(direction?, opts?)` — `@decantr/decantr/components` (via `_behaviors.js`)

Convenience wrapper for chevron icons used as dropdown/expand indicators.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `direction` | `'down'\|'up'\|'left'\|'right'` | `'down'` | Chevron direction |
| `opts` | `object` | `{}` | Passed to `icon()` |

**Returns:** `icon('chevron-{direction}', { size: '1em', class: 'd-caret', ...opts })`

CSS classes `.d-caret` (transition on transform) and `.d-caret-open` (`rotate(180deg)`) handle open/close animation.

**Used by:** Accordion, Cascader, Combobox, DataTable, Menu, NavigationMenu, Select, TreeSelect

---

## Size Tiers

| Tier | Size | When to use |
|------|------|-------------|
| **inline** | `1em` | Inside text-bearing components — Button, Chip, Menu items, Steps, Pickers, carets. Scales with font size. |
| **default** | `1.25em` | Standalone icons, general purpose. The `icon()` default. |
| **feature** | `1.5em`–`24px` | Feature cards, settings panels, navigation highlights. |
| **hero** | `2.5rem`–`3rem` | Empty states, Result status icons, large visual anchors. |

**Rule:** Use `1em` when the icon sits beside text (it scales with the text). Use `1.25em`+ when the icon stands alone.

From `spatial-guidelines.md` §7:

| Context | Icon Size | Text Size | Icon-Text Gap |
|---------|-----------|-----------|---------------|
| Small (compact) | 16px | 12-14px | 4px (`_gap1`) |
| Default | 20-24px | 14-16px | 8px (`_gap2`) |
| Large | 24-32px | 16-20px | 8-12px (`_gap2`–`_gap3`) |

---

## Component Integration Map

Components that accept or render icons. Sizes listed are what the component renders internally.

| Component | Prop / Mechanism | Type | Rendered Size | Notes |
|-----------|-----------------|------|---------------|-------|
| **Button** | `iconLeft`, `iconRight` | `string\|Node` | `1em` | String auto-wrapped via `icon(name, {size:'1em'})` |
| **Chip** | child icon node | `Node` | `1em` | `.d-chip-icon` class applied |
| **Alert** | `icon` | `string\|Node` | component default | Severity icon auto-assigned if omitted |
| **Input** | `prefix`, `suffix` | `string\|Node` | parent font | Wrapped in `.d-input-prefix`/`.d-input-suffix` |
| **InputNumber** | `prefix`, `suffix` | `string\|Node` | parent font | Same as Input |
| **Select** | caret auto-rendered | — | `1em` | `caret('down')` for dropdown arrow |
| **Combobox** | caret auto-rendered | — | `1em` | `caret('down')` for dropdown arrow |
| **DatePicker** | calendar icon auto | — | `1em` | `icon('calendar', {size:'1em'})` |
| **TimePicker** | clock icon auto | — | `1em` | `icon('clock', {size:'1em'})` |
| **Accordion** | caret auto-rendered | — | `1em` | `caret('down')`, rotates on open |
| **Menu** | caret on submenus | — | `1em` | `caret('right')` for nested items |
| **NavigationMenu** | caret auto-rendered | — | `1em` | `caret('down')` for dropdown triggers |
| **Dropdown** | item `icon` | `string\|Node` | `1em` | `.d-dropdown-item-icon` class |
| **ContextMenu** | item `icon` | `string\|Node` | `1em` | Same as Dropdown |
| **DataTable** | sort/expand carets | — | `1em` | Auto-rendered sort indicators and row expand |
| **Cascader** | caret auto-rendered | — | `1em` | `caret('right')` for navigation |
| **TreeSelect** | expand caret | — | `0.875em` | Smaller for nested tree items |
| **Segmented** | item `icon` | `string\|Node` | `1em` | Optional icon per segment |
| **Steps** | status icons auto | — | component default | Auto check/x for completed/error steps |
| **Timeline** | `dot` content | `Node` | varies | Custom icon in timeline dot |
| **BackTop** | arrow-up auto | — | `1.25em` | `icon('arrow-up')` default |
| **Statistic** | `prefix`, `suffix` | `string\|Node` | parent font | Visual prefix/suffix for numeric value |
| **Spinner** | loader icon | — | varies | Integrated icon animation |
| **Badge** | `icon` | `string\|Node` | component default | Optional icon in badge |

---

## Essential Icon Catalog

375 icons organized by semantic category. Canonical machine-readable source: `src/registry/icons.json`.

### Navigation (15)
`check`, `x`, `plus`, `minus`, `chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`, `chevrons-left`, `chevrons-right`, `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`, `navigation`

Directional control, confirmation/dismissal, expand/collapse. The backbone of interactive UI.

### Common UI (22)
`search`, `menu`, `more-horizontal`, `more-vertical`, `external-link`, `home`, `bell`, `settings`, `star`, `edit`, `trash`, `copy`, `eye`, `eye-off`, `filter`, `download`, `upload`, `refresh`, `loader`, `log-out`, `log-in`, `user`

General-purpose actions and indicators used across all domain archetypes.

### Feedback (9)
`info`, `alert-triangle`, `alert-circle`, `check-circle`, `x-circle`, `circle-dot`, `flag`, `ban`, `alarm`

Status communication. Map directly to Alert/Notification severity variants: `info` → info, `alert-triangle` → warning, `alert-circle` → error, `check-circle` → success, `x-circle` → error/destructive.

### Time & Scheduling (11)
`clock`, `timer`, `hourglass`, `alarm-clock`, `watch`, `watch-smart`, `history`, `calendar`, `calendar-check`, `calendar-plus`, `calendar-x`

All scheduling, reminders, deadlines, and time-tracking contexts.

### Layout / Data (9)
`layout-dashboard`, `mail`, `image`, `file`, `folder`, `grip-vertical`, `move`, `blocks`

Content type indicators and drag handles. Dashboard and file management contexts.

### People & Security (19)
`user`, `users`, `user-plus`, `user-minus`, `user-check`, `user-x`, `users-round`, `shield`, `shield-check`, `shield-x`, `shield-alert`, `lock`, `lock-keyhole`, `unlock`, `key`, `fingerprint`, `eye-scan`, `id-card`, `passport`

Authentication, authorization, team management, and identity verification.

### Documents & Data (29)
`file-text`, `file-plus`, `file-minus`, `file-check`, `file-x`, `file-search`, `file-code`, `file-spreadsheet`, `file-image`, `file-audio`, `file-video`, `files`, `folder-open`, `folder-plus`, `folder-check`, `save`, `printer`, `bookmark`, `bookmark-plus`, `archive`, `clipboard`, `paperclip`, `link`, `unlink`, `hash`, `tag`, `notebook`, `contract`, `invoice`

Document actions, file types, and metadata. Content management and file operations.

### Communication (29)
`phone`, `video`, `send`, `at-sign`, `at`, `message-square`, `message-circle`, `reply`, `rss`, `podcast`, `microphone`, `microphone-off`, `headphones`, `megaphone`, `newspaper`, `radio`, `tv`, `cast`, `heart`, `heart-crack`, `thumbs-up`, `thumbs-down`, `smile`, `frown`, `meh`, `laugh`, `angry`, `award`

Messaging, social engagement, media, and broadcasting.

### Charts & Analytics (6)
`bar-chart`, `pie-chart`, `trending-up`, `trending-down`, `activity`, `percent`

Data visualization indicators. Use `trending-up`/`trending-down` for KPI trend arrows.

### Organization (8)
`list`, `list-ordered`, `grid-3x3`, `inbox`, `layers`, `kanban`, `columns`, `rows`

View modes, sorting, and organizational structures.

### Navigation & Layout (7)
`sidebar`, `panel-left`, `panel-right`, `maximize`, `minimize`, `expand`, `shrink`

Window and panel management. Dashboard and editor layouts.

### Dev & Infrastructure (13)
`code`, `terminal`, `server`, `database`, `moon`, `sun`, `cloud`, `cloud-upload`, `cloud-download`, `cloud-cog`, `wifi`, `wifi-off`, `bug`

Developer tools, infrastructure status, and mode toggles. `moon`/`sun` are the canonical dark/light mode toggle icons.

### Business & Finance (14)
`calculator`, `bank`, `coins`, `piggy-bank`, `invoice`, `contract`, `signature`, `stamp`, `briefcase`, `handshake`, `scale`, `target`, `crown`, `lighthouse`

Banking, contracts, professional tools, and financial contexts.

### Commerce (22)
`credit-card`, `shopping-cart`, `shopping-bag`, `store`, `wallet`, `dollar-sign`, `receipt`, `gift`, `coupon`, `barcode`, `qr-code`, `price-tag`, `percent-circle`, `shipping`, `returns`, `truck`, `package`, `box`, `boxes`, `container`, `pallet`, `forklift`

Shopping, payments, and logistics.

### Media & Creative (16)
`camera`, `camera-off`, `film`, `palette`, `brush`, `pen-tool`, `eyedropper`, `crop`, `type`, `align-left`, `align-center`, `align-right`, `align-justify`, `sparkles`, `wand`, `eraser`

Photography, design tools, and text formatting.

### Devices & Technology (13)
`smartphone`, `tablet`, `laptop`, `monitor`, `bluetooth`, `usb`, `battery`, `battery-charging`, `battery-low`, `signal`, `satellite`, `robot`, `chip`

Hardware, connectivity, and device types.

### Workflow & Development (12)
`git-branch`, `git-merge`, `git-pull-request`, `git-commit`, `milestone`, `workflow`, `variable`, `regex`, `binary`, `webhook`, `api`, `container-ship`

Version control, CI/CD, and project management tools.

### Healthcare & Wellness (12)
`stethoscope`, `pill`, `syringe`, `heart-pulse`, `bandage`, `thermometer`, `brain`, `dna`, `accessibility`, `baby`, `apple`, `dumbbell`

Medical, wellness, fitness, and accessibility contexts.

### Education & Learning (10)
`book`, `book-open`, `graduation-cap`, `notebook`, `presentation`, `trophy`, `medal`, `school`, `lightbulb`, `puzzle`

Learning, achievements, and educational institutions.

### Transportation & Travel (11)
`car`, `bus`, `train`, `bicycle`, `ship`, `rocket`, `helicopter`, `taxi`, `parking`, `fuel`, `map-compass`

Vehicles, travel, and logistics.

### Food & Hospitality (8)
`utensils`, `coffee`, `wine`, `pizza`, `cake`, `chef-hat`, `grape`, `wheat`

Dining, beverages, and culinary contexts.

### Home & Real Estate (10)
`house`, `apartment`, `sofa`, `lamp`, `bed`, `bath`, `garden`, `door-closed`, `window`, `air-conditioning`

Furniture, property, and living spaces.

### Weather & Environment (9)
`umbrella`, `wind`, `droplet`, `snowflake`, `sunrise`, `sunset`, `leaf`, `tree`, `mountain`

Climate, nature, and environmental contexts.

### Actions (11)
`undo`, `redo`, `share`, `share-2`, `rotate-cw`, `rotate-ccw`, `scissors`, `zap`, `scan`, `pencil`, `pen`

Editing operations and quick actions.

### Maps & Location (2)
`globe`, `map-pin`

Geographic and internationalization contexts.

### Places (17)
`building`, `building-2`, `hospital`, `factory`, `warehouse`, `landmark`, `door-open`, `garage`, `fence`, `construction`, `anchor`, `plane`, `map`, `compass`, `route`, `cctv`

Physical locations and facility management.

### Tools & Config (14)
`wrench`, `tool`, `hammer`, `screwdriver`, `nut`, `plug`, `cog`, `sliders-horizontal`, `gauge`, `toggle-left`, `toggle-right`, `power`, `cpu`, `hard-drive`

Settings, configuration, and system administration.

### Tables & Data Grids (15)
`table`, `table-rows`, `table-columns`, `table-cells`, `layout-grid`, `sort-asc`, `sort-desc`, `arrow-up-down`, `filter-x`, `group`, `ungroup`, `spreadsheet`, `pivot-table`

DataTable controls and view configuration. Sort/filter/group affordances.

### Shapes & Symbols (9)
`circle`, `square`, `triangle`, `diamond`, `hexagon`, `infinity`, `asterisk`, `hash-tag`, `parentheses`

Geometric shapes and common symbols for UI decoration, status, and categorization.

---

## Content Strategy: When to Use Icons

### The Five Functions of Icons

| Function | What it communicates | Where it appears |
|----------|---------------------|-----------------|
| **Recognition** | Quick identification of action or object | Buttons, nav items, menus |
| **Scannability** | Visual anchors that break text monotony | KPI cards, feature lists, settings panels |
| **Affordance** | Signals interactivity or expandability | Dropdown carets, sort indicators, expandable sections |
| **Status** | Conveys state or feedback type | Alerts, results, step completion, trend indicators |
| **Density** | Communicates meaning in less space than text | Icon-only buttons, compact toolbars, data table controls |

### Mandatory Icon Placement

Icons MUST appear in these contexts:

1. **Navigation items** (sidebar, menu) — leading icon for scannability
2. **Empty states** (Result, Empty) — visual focal point required
3. **Feedback components** (Alert, Banner, Notification, toast) — severity before reading text
4. **Form triggers** (DatePicker, TimePicker, search inputs) — affordance signal
5. **Data table controls** (sort, filter, expand, pin) — primary affordance
6. **Step indicators** — auto check/x plus domain-specific custom icons
7. **KPI / Statistics** — trend arrows (`trending-up`/`trending-down`), category icons for dashboard anchoring

### Recommended Icon Placement

Optional but improves visual integrity:

- **Button `iconLeft`** for primary CTAs — adds visual weight and recognition
- **Chip icons** for category disambiguation in tag clouds or filter bars
- **Menu/Dropdown item icons** for faster scanning in long lists
- **Card headers** with topic icons for visual grouping
- **Hero sections** with feature icon alongside headline

### When NOT to Use Icons

- **Pure text content** — articles, documentation body, prose paragraphs
- **Purely decorative** — icon with no semantic value adds noise
- **Already icon-dense areas** — too many icons defeat scannability
- **Typography components** (Title, Text, Paragraph) — they carry their own visual weight

---

## Accessibility

- Icons render `role="img"` and `aria-hidden="true"` — decorative by default
- **Icon-only buttons:** place `aria-label` on the `<button>`, NOT the icon
  ```javascript
  Button({ 'aria-label': 'Delete', size: 'icon' }, icon('trash'))
  ```
- Never use an icon as the sole conveyor of critical information without adjacent text
- Color alone is not sufficient — icons help distinguish Alert variants beyond color (e.g., `alert-triangle` for warning vs `info` for info)
- Icons are static; animated states use CSS transitions on containers (e.g., `.d-caret` → `.d-caret-open`)

---

## Custom Icons

### Import workflow via `tools/icons.js`

```bash
node tools/icons.js <svg-dir> [output.js]
```

**SVG requirements:** 24×24 viewBox, stroke-based preferred (`fill="none"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`).

| Command | Output |
|---------|--------|
| `node tools/icons.js ./my-icons` | `src/icons/custom.js` |
| `node tools/icons.js ./brand-icons brand.js` | `src/icons/brand.js` |
| `node tools/icons.js` (no args) | Regenerates `src/registry/icons.json` only |

**Generated module:**
```javascript
// Generated by tools/icons.js — do not edit
export const ICONS = {
  'icon-name': '<path d="..."/>',
};
```

**Registration in app code:**
```javascript
import { ICONS } from './icons/custom.js';
import { registerIcons } from '@decantr/decantr/icons';
registerIcons(ICONS);
```

### Runtime registration

For icons loaded dynamically (e.g., from an API):

```javascript
import { registerIcon, hasIcon } from '@decantr/decantr/icons';

if (!hasIcon('my-dynamic-icon')) {
  registerIcon('my-dynamic-icon', '<path d="M12 2L22 22H2z"/>');
}
```

Register custom icons before first render to avoid a flash of missing icons.

---

## Third-Party Icon Libraries

Decantr's `icon()` renders SVGs via CSS `mask-image`. Third-party libraries fall into two categories: SVG-based (compatible with `icon()`) and font/class-based (bypass `icon()` entirely). The LLM generating code already knows every library's conventions — Decantr provides the hooks, not the adapters.

### Config Signal

Declare the project's icon library in `decantr.config.json`:

```jsonc
{
  "icons": {
    "library": "material"  // informational — tells LLM what conventions to use
  }
}
```

Decantr does not act on this value. It signals to the LLM which icon library's conventions to follow when generating code. Validated by `decantr validate` (warns on unrecognized libraries).

### SVG Libraries (Lucide, Heroicons, Phosphor, Feather, Tabler)

These ship SVG data and work directly with `registerIcons()`.

**Stroke-based (Lucide, Feather, Heroicons Outline):**

```javascript
import { registerIcons } from '@decantr/decantr/icons';
import lucideIcons from './icons/lucide-data.js';  // generated via tools/icons.js
registerIcons(lucideIcons);

// Then use normally
icon('search');  // renders Lucide's search icon
```

**Fill-based (Heroicons Solid, Material SVGs, Phosphor Fill):**

`buildDataUri()` auto-detects fill-based SVGs. If the inner content contains a `fill=` attribute with a non-`none` value, it uses fill rendering (`fill='black' stroke='none'`). Otherwise it uses stroke rendering (default).

```javascript
// Fill-based SVGs — auto-detected
registerIcon('home-solid', '<path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>');

// SVGs with bare <path> (no fill attr) — add fill="currentColor" when registering
registerIcon('expand-more', '<path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>');
```

**Import workflow:**

```bash
node tools/icons.js ./lucide-svgs lucide.js    # → src/icons/lucide.js
node tools/icons.js ./heroicons-solid solid.js  # → src/icons/solid.js
```

### Font-Based Libraries (Google Material Icons, Font Awesome)

Font/class-based icon systems use a fundamentally different rendering model (`font-family` + ligatures or `::before` pseudo-elements). They bypass `icon()` entirely — the LLM generates native HTML.

**Google Material Icons:**

```html
<!-- Load in index.html -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

```javascript
// LLM generates native Material Icons markup
h('span', { class: 'material-icons', 'aria-hidden': 'true' }, 'home')
h('span', { class: 'material-icons', 'aria-hidden': 'true' }, 'search')
```

**Font Awesome:**

```html
<!-- Load in index.html -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
```

```javascript
// LLM generates native Font Awesome markup
h('i', { class: 'fa-solid fa-house', 'aria-hidden': 'true' })
h('i', { class: 'fa-solid fa-magnifying-glass', 'aria-hidden': 'true' })
```

### Structural Icon Overrides

Framework components (Select, Accordion, DataTable, Alert, etc.) use ~15 structural icons internally via `icon()`. These always work with the built-in essential set, regardless of what third-party library the project uses.

For visual consistency with an external SVG library, override the structural icons at app startup:

```javascript
import { registerIcon } from '@decantr/decantr/icons';

// Override structural icons with Material Design SVGs
registerIcon('chevron-down', '<path fill="currentColor" d="M7 10l5 5 5-5z"/>');
registerIcon('chevron-up', '<path fill="currentColor" d="M7 14l5-5 5 5z"/>');
registerIcon('chevron-left', '<path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>');
registerIcon('chevron-right', '<path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>');
registerIcon('check', '<path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>');
registerIcon('x', '<path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>');
registerIcon('calendar', '<path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>');
registerIcon('clock', '<path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>');
registerIcon('search', '<path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/>');
// ... remaining structural icons as needed
```

**Structural icon names (15 total):**

`chevron-down`, `chevron-up`, `chevron-left`, `chevron-right`, `check`, `x`, `calendar`, `clock`, `search`, `arrow-up`, `grip-vertical`, `info`, `check-circle`, `alert-triangle`, `x-circle`

Most SVG icon libraries ship downloadable SVGs alongside any font files — the LLM extracts the appropriate `<path>` data for these overrides.

### Summary by Library Type

| Library Type | Examples | Integration | `icon()` used? |
|---|---|---|---|
| SVG stroke | Lucide, Feather, Heroicons Outline | `registerIcons()` | Yes |
| SVG fill | Heroicons Solid, Material SVGs, Phosphor Fill | `registerIcons()` (auto-detected) | Yes |
| Font ligature | Google Material Icons | Load font, native HTML | No — LLM generates `<span class="material-icons">` |
| CSS class | Font Awesome, Bootstrap Icons | Load CSS, native HTML | No — LLM generates `<i class="fa-solid fa-*">` |
| Custom SVGs | Company icon sets | `tools/icons.js` → `registerIcons()` | Yes |

---

## Build Optimization

Tree shaking scans bundled JS for `icon('name')` call patterns and prunes unused SVG path data from the output. Only referenced icons ship in the production bundle.

- Essential icons that are never referenced are stripped
- Custom icons registered via `registerIcons()` are included if the module is imported
- `hasIcon()` guard calls do not count as icon usage for tree shaking

---

## Icon-Text Spacing

Components handle icon-text gaps internally — do not add manual spacing gaps around icons rendered by components.

| Context | Gap Token | Value | Example |
|---------|-----------|-------|---------|
| Micro icon-text (label-adjacent) | `--d-sp-1` | 4px | Helper text icon, badge icon |
| Button icon-label | `--d-sp-2` | 8px | `Button({ iconLeft: 'plus' }, 'Add')` |
| Alert/Notification icon-body | `--d-sp-3` | 12px | Severity icon to message text |

For standalone icon-text pairs outside components, use `_gap1` (4px intimate) or `_gap2` (8px default). See `reference/spatial-guidelines.md` §3 Gestalt Proximity Rules.

---

## Quick Reference

| Scenario | Icon required? | Size | Code |
|----------|---------------|------|------|
| Button with label | Recommended for CTAs | `1em` (auto) | `Button({ iconLeft: 'plus' }, 'Add Item')` |
| Icon-only button | Yes (only content) | `1em` (auto) | `Button({ 'aria-label': 'Delete', size: 'icon' }, icon('trash'))` |
| Nav/menu item | Yes (scannability) | `1em` (auto) | `{ label: 'Dashboard', icon: 'layout-dashboard' }` |
| Alert | Yes (auto-assigned) | component default | `Alert({ variant: 'warning' }, 'Check your input')` |
| Empty state | Yes (focal point) | `2.5rem`–`3rem` | `icon('inbox', { size: '3rem' })` |
| Result status | Yes (focal point) | hero tier | `Result({ status: 'success' })` |
| KPI card | Recommended | `1.5em` | `icon('trending-up', { size: '1.5em' })` |
| Feature card | Recommended | `1.5em`–`24px` | `icon('shield', { size: '24px' })` |
| Data table sort | Yes (affordance) | `1em` (auto) | Auto-rendered by DataTable |
| Standalone decorative | No | — | Use text or visual hierarchy instead |
