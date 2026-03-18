# Decantr — Methodology Preamble


> This preamble is included in every task profile. It contains the spatial, typographic, and thematic rules that define Decantr output quality.


---

# Spatial Design Rules


## 3. Gestalt Proximity Rules

Elements closer together are perceived as related. This is the master spacing principle — it determines which scale value to use based on the semantic relationship between elements.

| Tier | Relationship | Scale | Atoms | Examples |
|------|-------------|-------|-------|---------|
| **Intimate** | Label→input, icon→text, helper→field | 4-8px | `_gap1`–`_gap2` | Form label above input, icon beside button text, error text below input |
| **Related** | Field→field, item→item, sibling controls | 12-16px | `_gap3`–`_gap4` | Adjacent form fields, list items, card elements, toolbar buttons |
| **Grouped** | Group→group, section-header→content | 20-24px | `_gap5`–`_gap6` | Form group → action bar, sidebar sections, card body → footer |
| **Sectional** | Section→section on a page | 32-48px | `_py8`–`_py12` | Features → testimonials, pricing → CTA, dashboard widgets |
| **Landmark** | Hero emphasis, page-level breathing | 64-96px | `_py16`–`_py24` | Hero vertical padding, landing page section separation |

### The 50% rule

Inner-group spacing must be ≤ 50% of inter-group spacing. If items within a group are `_gap2` (8px) apart, groups themselves must be at least `_gap4` (16px) apart, ideally `_gap6` (24px). This ensures visual grouping is unambiguous.

### Quick decision flow

1. Are these elements part of the **same control**? (icon + label, input + helper) → Intimate
2. Are they **siblings of the same type**? (field + field, card + card) → Related
3. Are they **distinct groups** within a section? (form + action bar) → Grouped
4. Are they **different sections** of a page? → Sectional
5. Is this a **hero or primary attention area**? → Landmark

---

## 5. Functional Density Zones

Different UI regions serve different purposes and demand different spacing:

| Zone | Intent | Gap | Padding | Applies To |
|------|--------|-----|---------|-----------|
| **Chrome** | Scannable tools, navigation | `_gap1`–`_gap2` | `_p1`–`_p2` | Toolbars, nav bars, breadcrumbs, status bars, tab bars |
| **Controls** | Interactive efficiency | `_gap3`–`_gap4` | `_p3`–`_p4` | Filter sidebars, form groups, settings panels |
| **Content** | Readable comfort | `_gap4`–`_gap6` | `_p4`–`_p6` | Card bodies, feature grids, article sections |
| **Showcase** | Visual impact, breathing room | `_gap6`–`_gap8` | `_py12`–`_py16` | Heroes, CTAs, pricing tables, landing sections |
| **Data-dense** | Maximum information density | `_gap1`–`_gap2` | `_p2`–`_p3` | Data tables, dashboards, analyst tools, monitoring |

### Key rules

- Components **inherit their zone's density** — a chip inside chrome doesn't need extra gap
- A **dashboard page** mixes zones: the toolbar is chrome, the sidebar is controls, the main area is data-dense, and a KPI row might be content
- **Marketing pages** are mostly showcase + content zones
- **Application UIs** are mostly controls + content + chrome zones

---

## 2. Spatial Taxonomy

Six concepts that cover nearly all CSS spacing rules (adapted from EightShapes):

| Concept | Definition | Ratio | Decantr Pattern | Use Cases |
|---------|-----------|-------|-----------------|-----------|
| **Inset** | Equal padding all sides | 1:1:1:1 | `_p4`, `_p6` | Cards, panels, modals, containers, tooltips |
| **Squish Inset** | Vertical ≈ 50% of horizontal | 0.5:1 | `_py2 _px4`, `_py1 _px3` | Buttons, table cells, list items, chips, tabs |
| **Stretch Inset** | Vertical > horizontal | 1.5:1 | `_py3 _px2` | Text inputs, textareas, form fields |
| **Stack** | Vertical gap between siblings | — | `_gap4`, `d-spacey-4` | Vertical content flow (most common) |
| **Inline** | Horizontal gap between siblings | — | `_gap2`, `d-spacex-2` | Tags, breadcrumbs, button groups, nav items |
| **Grid** | Layout margins + gutters | — | `_p4 _gap4`, `_gc3 _gap6` | Page layouts, card grids, dashboards |

### When to use which

- Building a **button or table cell**? → Squish inset (`_py2 _px4`)
- Building a **text input**? → Stretch inset (`_py3 _px2`)
- Building a **card or panel**? → Inset (`_p4` or `_p6`)
- Stacking **vertical items**? → Stack (`_gap4` on flex column)
- Arranging **horizontal items**? → Inline (`_gap2` on flex row)
- Building a **page layout**? → Grid (`_gc3 _gap6 _p4`)

---

## 16. Density System Integration

Decantr's three density classes cascade all spacing tokens to children:

| Density | Class | Compound Pad | Compound Gap | Field Height | Field Pad-X | Field Pad-Y |
|---------|-------|-------------|-------------|-------------|-------------|-------------|
| **Compact** | `.d-compact` | sp-3 (12px) | sp-2 (8px) | sm (28px) | sp-2-5 (10px) | sp-1 (4px) |
| **Comfortable** | `.d-comfortable` | sp-5 (20px) | sp-3 (12px) | md (36px) | sp-4 (16px) | sp-2 (8px) |
| **Spacious** | `.d-spacious` | sp-8 (32px) | sp-4 (16px) | lg (44px) | sp-6 (24px) | sp-2-5 (10px) |

### When to use which

| Density | When | Examples |
|---------|------|---------|
| **Compact** | Data-dense views, mouse/keyboard-primary, scan/compare workflows | Data tables, dashboards, analyst tools, IDE-like UIs |
| **Comfortable** | General application UI, mixed input modalities | Forms, settings, content pages, standard app views |
| **Spacious** | Marketing, onboarding, touch-primary, accessibility priority | Landing pages, wizards, mobile-first UIs, accessible contexts |

### Rules

- **Always default to comfortable.** Compact is opt-in.
- **Compact is desktop-only** — never apply to touch-primary interfaces
- **Density cascades** — set `.d-compact` on a parent container and all children (buttons, inputs, selects, cards) adapt automatically
- **Don't mix densities** in the same visual group — all siblings should share the same density

---

## 17. Clarity Profile (Decantation Process)

The **Clarity** layer in the Decantation vocabulary governs whitespace. During SETTLE, the LLM determines Character traits which imply a Clarity profile:

| Character Trait | Density | Section Padding | Content Gap | Chrome Gap | Zone Emphasis | Animation |
|----------------|---------|-----------------|-------------|------------|--------------|-----------|
| "minimal", "clean" | Spacious | Landmark (`_py16`) | `_gap6` | `_gap2` | Showcase + Content | Subtle fades (`d-stagger`) |
| "professional", "balanced" | Comfortable | Sectional (`_py12`) | `_gap4` | `_gap2` | Content + Controls | Standard (`d-stagger-up`) |
| "tactical", "dense" | Compact | Grouped (`_py8`) | `_gap3` | `_gap1` | Data-dense + Chrome | Snappy (`d-stagger-scale`) |
| "editorial", "luxurious" | Spacious | Landmark (`_py24`) | `_gap8` | `_gap2` | Showcase | Graceful (`d-stagger`) |
| "technical", "utilitarian" | Compact | Sectional (`_py8`) | `_gap3` | `_gap1` | Controls + Data-dense | Minimal (`d-stagger-scale`) |

During DECANT, each page's blend spec inherits the Clarity profile. The `surface` atoms on each page should reflect the zone and the Character-derived density.

### Cork rule (anti-drift)

Once a Clarity profile is established in the Essence, all subsequent pages must maintain it. A "minimal" site should never suddenly have compact chrome gaps. Drift is detected by comparing new page atoms against the Clarity profile.

---

## 18. Quick Reference Decision Table

When you need to decide spacing, use this lookup:

| I'm spacing... | Tier | Gap | Padding | Reference |
|----------------|------|-----|---------|-----------|
| Icon next to its label | Intimate | `_gap1`–`_gap2` | — | §15 Micro-spacing |
| Form label above its input | Intimate | `_gap1` | — | §3 Proximity |
| Adjacent form fields | Related | `_gap4` | — | §3 Proximity |
| A button's content | — | — | `_py2 _px4` (squish) | §2 Taxonomy |
| A text input's content | — | — | `_py3 _px2` (stretch) | §2 Taxonomy |
| Inside a card | — | — | `_p4`–`_p6` (inset) | §2 Taxonomy |
| Between card sections (header/body) | Grouped | compound-gap | compound-pad | §12 Anatomy |
| Nav bar items | Chrome | `_gap1`–`_gap2` | `_p1`–`_p2` | §5 Zones, §13 Chrome |
| Dashboard widgets | Data-dense | `_gap3`–`_gap4` | `_p3` | §5 Zones |
| Sections on a landing page | Sectional/Landmark | — | `_py12`–`_py16` | §3 Proximity |
| A hero section | Landmark | `_gap6` internal | `_py16`–`_py24` | §3 Proximity |
| Heading above its content | Asymmetric | `_mt8 _mb3` | — | §8 Typography |
| A floating dropdown from trigger | Z-axis | 2px offset | — | §11 Elevation |
| A tooltip from trigger | Z-axis | 6px offset | — | §11 Elevation |
| Page layout margins | Grid | — | `_px4` (mobile) → `_px8` (desktop) | §6 Responsive |
| Sequential card/KPI entrance | — | — | `d-stagger` / `d-stagger-up` on parent | §17 Clarity |
| Statistic count-up on mount | — | — | `Statistic({ animate: true })` | §17 Clarity |

---

## 19. Density Zone Quick Selection

| Page Purpose | Zone | Default Gap | Default Padding | Example |
|--------------|------|-------------|-----------------|---------|
| Navigation bar, toolbar | Chrome | `_gap1`–`_gap2` | `_p1`–`_p2` | Top nav, breadcrumbs, status bar |
| Forms, settings, filters | Controls | `_gap3`–`_gap4` | `_p3`–`_p4` | Filter sidebar, settings panel |
| Articles, features, cards | Content | `_gap4`–`_gap6` | `_p4`–`_p6` | Blog post, feature grid |
| Hero, CTA, pricing | Showcase | `_gap6`–`_gap8` | `_py12`–`_py16` | Landing page sections |
| Tables, dashboards, monitoring | Data-dense | `_gap1`–`_gap2` | `_p2`–`_p3` | Analytics dashboard, log viewer |

---


---

# Typography


## Typography Tokens

| Token | Default | Semantic Role |
|-------|---------|---------------|
| `--d-font` | `system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif` | Body font family |
| `--d-font-mono` | `ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace` | Code font family |
| `--d-text-xs` | `0.625rem` | Progress labels, avatar-fallback-sm |
| `--d-text-sm` | `0.75rem` | Badges, tooltips, captions |
| `--d-text-base` | `0.875rem` | Body default, inputs, tables, tabs, alerts |
| `--d-text-md` | `1rem` | Feature titles, btn-lg |
| `--d-text-lg` | `1.125rem` | Card headers, lead text |
| `--d-text-xl` | `1.25rem` | Dashboard header, sidebar branding |
| `--d-text-2xl` | `1.5rem` | Section titles |
| `--d-text-3xl` | `2rem` | Article/page headings, stat values |
| `--d-text-4xl` | `2.5rem` | Hero headlines, pricing price |
| `--d-lh-none` | `1` | Single-line (buttons, badges, icons) |
| `--d-lh-tight` | `1.1` | Large headings, hero text |
| `--d-lh-snug` | `1.25` | Subheadings |
| `--d-lh-normal` | `1.5` | Body text, tables, form labels |
| `--d-lh-relaxed` | `1.6` | Descriptive/long-form text |
| `--d-lh-loose` | `1.75` | Article body, reading mode |
| `--d-fw-heading` | `700` | Heading font-weight (retro: `800`) |
| `--d-fw-title` | `600` | Title/subtitle font-weight (retro: `800`) |
| `--d-ls-heading` | `-0.025em` | Heading letter-spacing (retro: `0.05em`, stormy-ai: `-0.015em`) |
| `--d-ls-caps` | `0.05em` | Uppercase label contexts (group labels, table headers, codeblock lang) |

## 8. Typographic Spatial System

### Baseline grid

All line-heights should be divisible by 4. This aligns with Decantr's 4px half-step (`--d-sp-1`) and ensures vertical rhythm across mixed text sizes.

### Heading spacing asymmetry

Top-margin > bottom-margin. Ratio: approximately 3:1. This binds headings to the content that follows them, not the content above.

| Heading Level | Top Margin | Bottom Margin | Decantr Atoms |
|--------------|------------|---------------|--------------|
| Display / Hero | 64px | 16px | `_mt16 _mb4` |
| Section (h2) | 48px | 16px | `_mt12 _mb4` |
| Subsection (h3) | 32px | 12px | `_mt8 _mb3` |
| Minor (h4-h6) | 24px | 8px | `_mt6 _mb2` |

### Type-to-CTA spacing

| Content Before CTA | Gap | Decantr | Responsive? |
|--------------------|-----|---------|-------------|
| Display headline | 32px | `_mt8` | Reduces to 24px on mobile |
| Section headline | 24px | `_mt6` | Stays constant |
| Body copy | 24px | `_mt6` | Stays constant |
| Helper/description text | 16px | `_mt4` | Stays constant |

### Prose rhythm

The `.d-prose` class handles vertical rhythm for text-heavy content automatically:
- `> * + *` gets `margin-top: var(--d-sp-4)` (16px)
- Headings get graduated spacing (larger headings → more top margin)
- Lists get left padding with per-item spacing
- Blockquotes get left border + padding

**Rule**: Never manually space text blocks within a `.d-prose` container.

---

## Typography Presets (compound atoms)

Bundles of size+weight+lineHeight+letterSpacing for common text roles. All token-backed with `var()` fallbacks — theme-customizable automatically (retro gets bolder headings, etc.).

| Atom | Size | Weight | Line Height | Extra |
|------|------|--------|-------------|-------|
| `_heading1` | `--d-text-4xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading2` | `--d-text-3xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading3` | `--d-text-2xl` | `--d-fw-heading` | `--d-lh-snug` | `--d-ls-heading` |
| `_heading4` | `--d-text-xl` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading5` | `--d-text-lg` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading6` | `--d-text-md` | `--d-fw-title` | `--d-lh-normal` | — |
| `_body` | `--d-text-base` | — | `--d-lh-normal` | — |
| `_bodylg` | `--d-text-md` | — | `--d-lh-relaxed` | — |
| `_caption` | `--d-text-sm` | — | `--d-lh-normal` | `color:--d-muted-fg` |
| `_label` | `--d-text-sm` | `--d-fw-medium` | `--d-lh-none` | — |
| `_overline` | `--d-text-xs` | `--d-fw-medium` | `--d-lh-none` | `uppercase; ls:0.08em` |

Usage: `h1({ class: css('_heading1') }, 'Page Title')` — one atom replaces 3-4 individual atoms.


---

# Essential Tokens


## Spacing Tokens

> For strategic guidance on when to use these tokens, see `reference/spatial-guidelines.md` §1 The Spacing Scale and §3 Gestalt Proximity Rules.

| Token | Default | Common Usage |
|-------|---------|-------------|
| `--d-sp-0-5` | `0.125rem` | Segmented padding/gap |
| `--d-sp-1` | `0.25rem` | Badge padding, minimal gaps |
| `--d-sp-1-5` | `0.375rem` | Button-sm padding, tooltip padding, chip gap, table-compact |
| `--d-sp-2` | `0.5rem` | Button gap, input padding, control gaps |
| `--d-sp-2-5` | `0.625rem` | Button-lg padding, tab vertical padding, tooltip horizontal |
| `--d-sp-3` | `0.75rem` | Cell padding, alert/toast, accordion |
| `--d-sp-4` | `1rem` | Tab/accordion padding, element spacing |
| `--d-sp-5` | `1.25rem` | Container padding (dark/retro `--d-pad`) |
| `--d-sp-6` | `1.5rem` | Container padding (light), card/feature padding |
| `--d-sp-8` | `2rem` | Section inline padding, hero margins |
| `--d-sp-10` | `2.5rem` | Reserved for larger layouts |
| `--d-sp-12` | `3rem` | Section block padding |
| `--d-sp-16` | `4rem` | Hero block padding |
| `--d-pad` | `1.25rem` | Card/Modal container padding (per-theme) |
| `--d-compound-gap` | `var(--d-sp-3)` | Gap between header/body/footer in compound components |
| `--d-compound-pad` | `var(--d-pad)` | Inline + block-end padding in compound components |
| `--d-offset-dropdown` | `2px` | Trigger->panel offset for form dropdowns (select, combobox, etc.) |
| `--d-offset-menu` | `4px` | Trigger->panel offset for dropdown/context menus |
| `--d-offset-tooltip` | `6px` | Trigger->panel offset for tooltips |
| `--d-offset-popover` | `8px` | Trigger->panel offset for popovers/hovercards |
| `--d-offset-tour` | `12px` | Trigger->panel offset for tour/walkthrough steps |

## Semantic Color Tokens

| Token Pattern | Count | Description |
|---------------|-------|-------------|
| `--d-{role}` | 7 | Base palette: primary, accent, tertiary, success, warning, error, info |
| `--d-{role}-fg` | 7 | WCAG AA foreground on base |
| `--d-{role}-hover` | 7 | Hover state |
| `--d-{role}-active` | 7 | Active/pressed state |
| `--d-{role}-subtle` | 7 | Low-opacity tint background |
| `--d-{role}-subtle-fg` | 7 | Text on subtle background |
| `--d-{role}-on-subtle` | 7 | Contrast-safe role color for interactive elements on subtle bg (buttons, chips, toggles) |
| `--d-{role}-border` | 7 | Semi-transparent border |
| `--d-bg`, `--d-fg` | 2 | Page background / foreground |
| `--d-muted`, `--d-muted-fg` | 2 | Muted text (labels, descriptions) |
| `--d-border`, `--d-border-strong` | 2 | Border colors |
| `--d-ring` | 1 | Focus ring color (defaults to primary) |
| `--d-overlay` | 1 | Modal/dialog backdrop |
| `--d-surface-{0-3}` | 4 | Surface backgrounds (canvas -> overlay) |
| `--d-surface-{0-3}-fg` | 4 | Surface foregrounds |
| `--d-surface-{0-3}-border` | 4 | Surface borders |
| `--d-surface-{1-3}-filter` | 3 | Backdrop-filter for glass styles |
| `--d-elevation-{0-3}` | 4 | Box-shadow by level |

## Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--d-z-dropdown` | 1000 | Select, combobox, datepicker, cascader, dropdown, menu |
| `--d-z-sticky` | 1100 | Affix, float button |
| `--d-z-modal` | 1200 | Modal, drawer, image overlay, tour |
| `--d-z-popover` | 1300 | Popover, popconfirm, context menu, hovercard |
| `--d-z-toast` | 1400 | Toast, notification, message containers |
| `--d-z-tooltip` | 1500 | Tooltip |

## Radius Token Hierarchy

Components use semantic radius tokens that resolve differently per personality preset:

| Token | sharp | rounded | pill | Semantic Role |
|-------|-------|---------|------|---------------|
| `--d-radius-sm` | 2px | 4px | 9999px | Checkboxes, inline code |
| `--d-radius` | 0 | 8px | 9999px | Inline controls: buttons, inputs, chips, tags, select triggers |
| `--d-radius-panel` | 0 | 8px | 16px | Containers/panels: dropdowns, tooltips, alerts, textarea, menus, popovers |
| `--d-radius-inner` | 0 | 6px | 14px | Nested interactive cells: datepicker days, toggle/segmented items, close buttons |
| `--d-radius-lg` | 0 | 12px | 24px | Large surfaces: cards, modals, tables |
| `--d-radius-full` | 9999px | 9999px | 9999px | Circles, always-pill elements |

**Assignment rules:**
- Single-line inline controls (buttons, inputs, chips, tags, select triggers) -> `--d-radius`
- Floating panels, overlays, feedback containers, tall form fields -> `--d-radius-panel`
- Interactive elements nested inside panels/groups (calendar cells, menu links, toggle items) -> `--d-radius-inner`
- Large container surfaces (cards, modals, dialogs, tables) -> `--d-radius-lg`

**Concentric radius rule:** `--d-radius-inner` MUST equal `--d-radius-panel` minus the container's padding so that nested rounded rectangles follow concentric curves. For pill: `16px - 2px (--d-sp-0-5) = 14px`. Mismatched inner/outer radii create a visually jarring flat-inside-round artifact. When adding a new radius preset, always derive `inner` from `panel - padding`.

New components MUST use the appropriate semantic radius token. Never use `--d-radius` for panels or inner cells.

## Token Compliance

ALL consumer CSS (workbench, docs, generated code) MUST use design tokens. No hardcoded values.

### Quick-Reference Mapping

| Literal Value | Token |
|--------------|-------|
| `0.25rem` / `4px` | `var(--d-sp-1)` |
| `0.375rem` / `6px` | `var(--d-sp-1-5)` |
| `0.5rem` / `8px` | `var(--d-sp-2)` |
| `0.75rem` / `12px` | `var(--d-sp-3)` |
| `1rem` / `16px` | `var(--d-sp-4)` |
| `1.25rem` / `20px` | `var(--d-sp-5)` |
| `1.5rem` / `24px` | `var(--d-sp-6)` |
| `2rem` / `32px` | `var(--d-sp-8)` |
| `2.5rem` / `40px` | `var(--d-sp-10)` |
| `3rem` / `48px` | `var(--d-sp-12)` |
| `4rem` / `64px` | `var(--d-sp-16)` |

### Required Token Categories

| CSS Property | Token Family | Notes |
|-------------|-------------|-------|
| `padding`, `gap`, `margin` | `--d-sp-*` | Never use raw `px`/`rem` |
| `border-radius` | `--d-radius`, `--d-radius-panel`, `--d-radius-inner`, `--d-radius-lg`, `--d-radius-sm` | Use semantic role (see Radius section above) |
| `transition-duration` | `--d-duration-instant`, `--d-duration-fast`, `--d-duration-normal`, `--d-duration-slow` | Never hardcode `150ms`, `200ms` |
| `z-index` | `--d-z-dropdown`, `--d-z-sticky`, `--d-z-modal`, `--d-z-popover`, `--d-z-toast`, `--d-z-tooltip` | Never use raw numbers |
| `font-size` | `--d-text-xs` through `--d-text-4xl` | When a token exists for the size |
| `outline` (focus) | `--d-focus-ring-width`, `--d-focus-ring-style`, `--d-focus-ring-color`, `--d-focus-ring-offset` | All four tokens required |

### Workbench-Specific Layout Tokens

Workbench/tooling code may define named custom properties for layout dimensions that have no framework equivalent:

```css
:root {
  --de-header-h: 52px;
  --de-sidebar-w: 240px;
}
```

These use the `--de-*` prefix (not `--d-*`) and are the ONLY acceptable place for raw dimension values in consumer CSS.


---

# Essential Atoms


## Display
`_block`, `_inline`, `_flex`, `_grid`, `_none`, `_contents`, `_iflex`, `_igrid`

## Flexbox
| Atom | Output |
|------|--------|
| `_col/_row` | flex-direction |
| `_colr/_rowr` | column-reverse/row-reverse |
| `_wrap/_nowrap/_wrapr` | flex-wrap |
| `_grow/_grow0` | flex-grow: 1/0 |
| `_shrink/_shrink0` | flex-shrink: 1/0 |
| `_flex1` | flex: 1 1 0% |
| `_flexauto` | flex: 1 1 auto |
| `_flexnone` | flex: none |
| `_flexinit` | flex: 0 1 auto |

## Alignment
| Atom | Property | Value |
|------|----------|-------|
| `_center` | align-items + justify-content | center |
| `_aic/_ais/_aifs/_aife/_aibs` | align-items | center/stretch/flex-start/flex-end/baseline |
| `_jcc/_jcsb/_jcsa/_jcse/_jcfs/_jcfe` | justify-content | center/space-between/around/evenly/flex-start/flex-end |
| `_acc/_acsb/_acsa/_acse/_acfs/_acfe/_acs` | align-content | center/space-between/around/evenly/flex-start/flex-end/stretch |
| `_asc/_ass/_asfs/_asfe/_asa/_asbs` | align-self | center/stretch/flex-start/flex-end/auto/baseline |
| `_jic/_jis/_jifs/_jife` | justify-items | center/stretch/start/end |
| `_jsc/_jss/_jsfs/_jsfe/_jsa` | justify-self | center/stretch/start/end/auto |
| `_pic/_pis` | place-items | center/stretch |
| `_pcc/_pcse/_pcsb` | place-content | center/space-evenly/space-between |

## Grid System

> For column count by content type and container width guidance, see `reference/spatial-guidelines.md` §14 Grid & Column System.

| Atom | Output |
|------|--------|
| `_gc1`-`_gc12` | grid-template-columns: repeat(N,minmax(0,1fr)) |
| `_gcnone` | grid-template-columns: none |
| `_gr1`-`_gr6` | grid-template-rows: repeat(N,minmax(0,1fr)) |
| `_grnone` | grid-template-rows: none |
| `_span1`-`_span12` | grid-column: span N/span N |
| `_spanfull` | grid-column: 1/-1 |
| `_rspan1`-`_rspan6` | grid-row: span N/span N |
| `_rspanfull` | grid-row: 1/-1 |
| `_gcs1`-`_gcs13` | grid-column-start |
| `_gce1`-`_gce13` | grid-column-end |
| `_grs1`-`_grs7` | grid-row-start |
| `_gre1`-`_gre7` | grid-row-end |
| `_gcaf160/200/220/250/280/300/320` | repeat(auto-fit,minmax(Npx,1fr)) |
| `_gcaf` | repeat(auto-fit,minmax(0,1fr)) |
| `_gcafl` | repeat(auto-fill,minmax(0,1fr)) |
| `_gflowr/_gflowc/_gflowd/_gflowrd/_gflowcd` | grid-auto-flow |
| `_gacfr/_gacmin/_gacmax` | grid-auto-columns |
| `_garfr/_garmin/_garmax` | grid-auto-rows |

## Container Utilities
`_ctrsm` (640px), `_ctr` (960px), `_ctrlg` (1080px), `_ctrxl` (1280px), `_ctrfull` (100%) — all include margin-inline:auto

## Spacing (_p, _m, _gap — scale 0-12 + 14,16,20,24,32,40,48,56,64)

> For decision logic on which spacing atoms to use, see `reference/spatial-guidelines.md` §2 Spatial Taxonomy and §18 Quick Reference Decision Table.
| Prefix | Property | Example |
|--------|----------|---------|
| `_p` | padding | `_p4` -> `1rem` |
| `_px/_py` | padding-inline/block | `_px2` -> `0.5rem` |
| `_pt/_pr/_pb/_pl` | padding sides | `_pt1` -> `0.25rem` |
| `_m` | margin | `_m4` -> `1rem` |
| `_mx/_my` | margin-inline/block | `_mx2` -> `0.5rem` |
| `_mt/_mr/_mb/_ml` | margin sides | `_mt1` -> `0.25rem` |
| `_gap/_gx/_gy` | gap/column-gap/row-gap | `_gap4` -> `1rem` |

## Colors (Semantic)
**Palette roles**: `_bg{role}`, `_fg{role}`, `_bc{role}` — where role = `primary`, `accent`, `tertiary`, `success`, `warning`, `error`, `info`
**Subtle variants**: `_bg{role}sub`, `_fg{role}sub` (subtle bg/fg), `_bc{role}bdr` (role border)
**Foreground-on-base**: `_fg{role}on` (contrasting text on role background)
**Neutrals**: `_bgbg`, `_fgfg`, `_bgmuted`, `_fgmuted`, `_fgmutedfg`, `_bcborder`, `_bcstrong`
**Surfaces**: `_surface0`-`_surface3`, `_fgsurface0`-`_fgsurface3`, `_bcsurface0`-`_bcsurface3`
**Opacity**: `_bg{role}/N` (e.g. `_bgprimary/50`) — color-mix with transparency (0-100)

### Color Decision Flow

| Intent | Atom | Token |
|--------|------|-------|
| Primary text | `_fgfg` | `--d-fg` |
| Muted/secondary text | `_fgmutedfg` | `--d-muted-fg` |
| Even more muted text | `_fgmuted` | `--d-muted` |
| Accent/brand text | `_fgprimary` | `--d-primary` |
| Page background | `_bgbg` | `--d-bg` |
| Muted background | `_bgmuted` | `--d-muted` |
| Primary action bg | `_bgprimary` | `--d-primary` |
| Surface card bg | `_surface0`–`_surface3` | `--d-surface-{0-3}` |
| Border default | `_bcborder` | `--d-border` |
| Border emphasis | `_bcstrong` | `--d-border-strong` |
| Error state | `_fgerror` / `_bgerror` | `--d-error` |
| Success state | `_fgsuccess` / `_bgsuccess` | `--d-success` |


---

# Cork Rules (Anti-Drift)


Before writing ANY code, read `decantr.essence.json`. Verify:
1. **Style matches the Vintage.** Do not switch styles.
2. **Page exists in the Structure.** If new, add it to the Essence first.
3. **Layout follows the page's Blend.** Do not freestyle spatial arrangement.
4. **Composition follows the active Recipe.** Do not freestyle decoration.
5. **Spacing follows the Clarity profile** derived from Character → see Clarity Profile table above. Do not default to `_gap4`/`_p4` everywhere.

If a request conflicts with the Essence, flag the conflict and ask for confirmation.


---

# Decantation Process (Summary)


```
POUR → SETTLE → CLARIFY → DECANT → SERVE → AGE
```

| Stage | Purpose |
|-------|---------|
| **POUR** | User expresses intent in natural language |
| **SETTLE** | Decompose into 5 layers: Terroir (domain), Vintage (style+mode+recipe), Character (personality traits), Structure (pages), Tannins (functional systems) |
| **CLARIFY** | Write `decantr.essence.json` — the project's persistent DNA. User confirms. |
| **DECANT** | Resolve each page's Blend (spatial arrangement from archetype defaults) |
| **SERVE** | Generate code from Blend specs using the SERVE algorithm |
| **AGE** | Read Essence before every change. Guard against drift. |

**Essence Schema (simple):**
```json
{
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": { "style": "command-center", "mode": "dark", "recipe": "command-center", "shape": "sharp" },
  "character": ["tactical", "data-dense"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [
    { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"] }
  ],
  "tannins": ["auth", "realtime-data"],
  "cork": { "enforce_style": true, "enforce_recipe": true }
}
```

**Blend row types:**
- `"pattern-id"` → full-width pattern row
- `{ "pattern": "hero", "preset": "image-overlay", "as": "recipe-hero" }` → pattern with preset + alias
- `{ "cols": ["a", "b"], "at": "lg" }` → equal-width side-by-side, collapse below lg
- `{ "cols": ["a", "b"], "span": { "a": 3 }, "at": "md" }` → weighted columns (a=3fr, b=1fr)



---

# Import Catalog


```js
import { tags } from 'decantr/tags';
import { h, text, cond, list, mount, onMount, onDestroy } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore, batch } from 'decantr/state';
import { createQuery, createMutation, queryClient } from 'decantr/data';
import { createRouter, link, navigate, useRoute, back, forward, isNavigating } from 'decantr/router';
import { css, setStyle, setMode, registerStyle } from 'decantr/css';
import { Button, Input, Card, Modal, Tabs, Select, ... } from 'decantr/components';
import { Chart, Sparkline } from 'decantr/chart';
import { icon } from 'decantr/icons';
```



---

# Task: Create or Modify a Component


> Read this file when creating a new component or modifying existing framework components.


## Component Authoring Contract


- Components are **functions** that return `HTMLElement`
- Props are the first argument: `function MyComponent({ prop1, prop2, class: cls }) {}`
- Additional children via rest args: `function MyComponent(props, ...children) {}`
- Use `const { div, span, h1 } = tags;` for element creation
- Use `css('_atom1 _atom2')` for styling — never inline styles for static values
- Wire cleanup via `onDestroy(() => {...})` for listeners, timers, observers
- Export as named function: `export function MyComponent(props) { ... }`


## Top Component Signatures


## 3. Top 15 Component Signatures

```js
// Button
Button({ variant: 'primary'|'outline'|'ghost'|'destructive'|'link', size: 'sm'|'md'|'lg',
         disabled, loading, onclick, class }, ...children)

// Input
Input({ label, type, placeholder, value, onchange, oninput, disabled, class })

// Card (with sub-components)
Card({ title, extra, hoverable, bordered, loading, size, type, cover, actions, class },
  Card.Header({ extra }, ...), Card.Body({}, ...), Card.Footer({}, ...),
  Card.Cover({}, img), Card.Meta({ avatar, title, description }),
  Card.Grid({ hoverable }, ...), Card.Actions({}, ...)
)

// Select
Select({ label, value, onchange, options: [{ label, value }], placeholder, class })

// Modal
Modal({ visible: signal, onClose: fn, class }, ...children)

// Tabs
Tabs({ items: [{ label, content: () => node }], class })

// DataTable
DataTable({ columns: [{ key, label, sortable, render: (cellValue, row) => HTMLElement|string }], data, sortable, paginate, pageSize, class })

// Statistic
Statistic({ label, value, prefix, suffix, trend: 'up'|'down', trendValue, icon, class })

// Badge
Badge({ variant: 'default'|'primary'|'success'|'warning'|'error', size }, ...children)

// Alert
Alert({ variant: 'default'|'info'|'success'|'warning'|'error' }, ...children)

// Dropdown
Dropdown({ trigger, items: [{ label, onclick }], class })

// Breadcrumb
Breadcrumb({ items: [{ label, href }] })

// Pagination
Pagination({ current, total, onChange })

// Progress
Progress({ value: 0-100, class })

// Skeleton
Skeleton({ width, height, class })  // Loading placeholder

// Avatar
Avatar({ src, name, size: 'sm'|'md'|'lg' })

// Separator
Separator()  // Horizontal divider

// Chip
Chip({ label, onClose, variant })

// icon
icon('icon-name')  // Returns SVG icon element
```

---


## Chart API


## 4. Chart API

```js
import { Chart, Sparkline } from 'decantr/chart';

// Full chart
Chart({
  type: 'line'|'bar'|'area'|'pie'|'scatter'|'bubble'|'histogram'|'funnel'|
        'radar'|'gauge'|'heatmap'|'treemap'|'candlestick'|'waterfall'|
        'box-plot'|'range-bar'|'range-area'|'radial'|'sunburst'|'sankey'|
        'chord'|'swimlane'|'org-chart'|'combination',
  data: arrayOrSignal,
  x: 'fieldName',           // x-axis data key
  y: 'fieldName',           // y-axis data key (or array for multi-series)
  title: 'Chart Title',
  height: 300,              // pixels
  live: false,              // enable streaming updates
})

// Inline sparkline (no axes, no labels)
Sparkline({ data: [1, 4, 2, 8, 3], height: 32 })
```

### Working Examples

**Line chart:**
```js
Chart({
  type: 'line',
  data: [
    { date: '2024-01', revenue: 4200 },
    { date: '2024-02', revenue: 5100 },
    { date: '2024-03', revenue: 4800 },
  ],
  x: 'date', y: 'revenue', title: 'Monthly Revenue', height: 300
})
```

**Bar chart:**
```js
Chart({
  type: 'bar',
  data: [
    { category: 'Electronics', sales: 1200 },
    { category: 'Clothing', sales: 800 },
    { category: 'Books', sales: 600 },
  ],
  x: 'category', y: 'sales', title: 'Sales by Category', height: 280
})
```

**Pie chart:**
```js
Chart({
  type: 'pie',
  data: [
    { name: 'Desktop', value: 65 },
    { name: 'Mobile', value: 30 },
    { name: 'Tablet', value: 5 },
  ],
  x: 'name', y: 'value', title: 'Traffic Sources', height: 280
})
```

---


---

# Component Lifecycle & Cleanup


# Component Lifecycle & Cleanup

## The Problem

Decantr components return raw `HTMLElement` nodes — not wrapper objects with lifecycle methods. This means cleanup (removing document listeners, clearing timers, disconnecting observers) requires explicit wiring. Without it, components leak resources when removed from the DOM.

## Cleanup Contract

**Every component that adds document-level listeners, timers, or observers MUST clean them up.** This applies to:

- `document.addEventListener(...)` — click-outside, escape-to-close, resize, scroll
- `setTimeout` / `setInterval` — debounced actions, animation timers, polling
- `IntersectionObserver` / `ResizeObserver` / `MutationObserver`
- `window.addEventListener(...)` — resize, scroll, popstate

## How Cleanup Works

### Pattern 1: Use `_behaviors.js` primitives (preferred)

All behavioral primitives in `_behaviors.js` return `{ destroy() }`. Components MUST call `.destroy()` when removed.

```javascript
import { createOverlay, createListbox, createFocusTrap } from './_behaviors.js';

export function Select(props) {
  const trigger = /* ... */;
  const panel = /* ... */;

  const overlay = createOverlay(trigger, panel, { trigger: 'click' });
  const listbox = createListbox(panel, { onSelect: /* ... */ });

  // Wire cleanup to element removal
  const el = h('div', { class: 'd-select' }, trigger, panel);
  onDestroy(() => {
    overlay.destroy();
    listbox.destroy();
  });
  return el;
}
```

### Pattern 2: Manual cleanup collection

For components that add their own listeners (not via behaviors):

```javascript
export function MyComponent(props) {
  const cleanups = [];

  const onResize = () => { /* ... */ };
  window.addEventListener('resize', onResize);
  cleanups.push(() => window.removeEventListener('resize', onResize));

  const timer = setInterval(poll, 5000);
  cleanups.push(() => clearInterval(timer));

  const el = h('div', { /* ... */ });
  onDestroy(() => cleanups.forEach(fn => fn()));
  return el;
}
```

### Pattern 3: MutationObserver self-cleanup (last resort)

When `onDestroy` context is unavailable (e.g., dynamically created elements):

```javascript
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.removedNodes) {
      if (node === el || node.contains(el)) {
        cleanup();
        observer.disconnect();
      }
    }
  }
});
observer.observe(el.parentNode, { childList: true });
```

## Available `_behaviors.js` Primitives

| Primitive | Returns `destroy()`? | Use For |
|-----------|---------------------|---------|
| `createOverlay()` | Yes | Click-outside, escape, show/hide, ARIA expanded |
| `createListbox()` | Yes | Arrow-key navigation, selection, type-ahead |
| `createDisclosure()` | No (uses element listeners only) | Expand/collapse with animation |
| `createRovingTabindex()` | Yes | Tab navigation within groups |
| `createFocusTrap()` | Yes (via `deactivate()`) | Modal/drawer focus containment |
| `createDrag()` | Yes | Pointer-based drag interactions |
| `createVirtualScroll()` | Yes | Large list rendering |
| `createInfiniteScroll()` | Yes | Load-more sentinel |
| `createMasonry()` | Yes | Pinterest-style layout |
| `createScrollSpy()` | Yes (via `disconnect()`) | Section tracking |
| `createHotkey()` | Yes | Keyboard shortcuts |

## Checklist Before Shipping a Component

1. Does this component add `document.addEventListener`? -> Use `createOverlay` or collect cleanup
2. Does this component use `setTimeout`/`setInterval`? -> Clear on destroy
3. Does this component create an `Observer`? -> Disconnect on destroy
4. Does this component use `createOverlay`/`createListbox`/etc.? -> Call `.destroy()` via `onDestroy`
5. Does this component add `window.addEventListener`? -> Remove on destroy

## Known Components Needing Cleanup Audit

**Completed** (have `onDestroy` wired — verified March 2026):
- `modal.js` — uses `createFocusTrap`, cleanup via `onDestroy`
- `select.js` — `onDestroy` added
- `combobox.js` — `onDestroy` added
- `context-menu.js` — `onDestroy` added
- `tooltip.js` — `onDestroy` added
- `slider.js` — `onDestroy` added
- `image.js` — `onDestroy` added
- `data-table.js` — `onDestroy` added
- `dropdown.js` — `onDestroy` added

**Remaining** — components that may still benefit from migrating to `_behaviors.js` primitives:
- `slider.js` — document pointermove/pointerup (candidate for `createDrag`)
- `data-table.js` — document pointermove/pointerup for column resize (candidate for `createDrag`)
- `tour.js` — document keydown, window resize (has manual cleanup, could use `createHotkey`)

## Workbench & Tooling Lifecycle

The cleanup contract applies to **ALL code**, not just `src/components/`. Workbench explorer modules, docs site scripts, CLI preview tools — any code that adds event listeners, timers, or observers MUST wire `onDestroy` cleanup.

**Common violations in tooling code:**

- **Motion/animation demos** that add `mouseenter`/`mouseleave` listeners directly via `addEventListener` instead of element props (props are cleaned up with the element)
- **Search modals** that add `keydown` document listeners without cleanup
- **Live previews** that create `ResizeObserver` or `MutationObserver` without disconnecting

**Rule:** If a workbench explorer section adds listeners, it follows the same contract as a framework component. Use element event props (e.g. `onmouseenter`) for element-scoped events, and `onDestroy` + `_behaviors.js` for document-level listeners.

---


---

# Behavioral Primitives


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


---

# State Management


# State Module Reference

`import { createSignal, createEffect, createMemo, createStore, batch, createContext, createSelector, createDeferred, createHistory, useLocalStorage, untrack, peek, createRoot, getOwner, runWithOwner, onError, on } from 'decantr/state';`

## What's New (v0.5.0)

| Feature | Description | Cross-ref |
|---------|-------------|-----------|
| `createRoot` | Independent reactive scope with disposal | §createRoot |
| `getOwner` / `runWithOwner` | Ownership tree introspection and transfer | §Ownership |
| `onError` | Error boundaries in the reactive graph | §Error Boundaries |
| `on()` | Explicit dependency tracking | §on |
| Dependency cleanup | Effects auto-remove from old signal subscriber sets on re-run | Automatic |
| Topological flush | Diamond-problem fix — effects sorted by level before flush | Automatic |
| `createResource` **removed** | Replaced by `createQuery` in `decantr/data` | `reference/state-data.md` |

## createSignal(initial)

Returns `[getter, setter]` tuple. Getter auto-tracks in effects/memos. Setter accepts value or updater function.

| Call | Behavior |
|------|----------|
| `setter(5)` | Set value to `5` |
| `setter(prev => prev + 1)` | Update from previous value |

Skips notification if new value is identical (`Object.is`).

## createEffect(fn)

Runs `fn` immediately, auto-tracks all signal reads inside. Re-runs when any tracked signal changes. Returns `dispose()` function.

| Detail | Behavior |
|--------|----------|
| Auto-tracking | Reads during `fn` execution subscribe the effect |
| Dependency cleanup | On re-run, effect removes itself from old signal subscriber sets before re-tracking |
| Cleanup | If `fn` returns a function, it runs before next execution and on dispose |
| Dispose | `const dispose = createEffect(fn); dispose();` stops all future runs |
| Batching | During `batch()`, effects are deferred to topological flush |
| Error handling | Errors propagate up the ownership tree to nearest `onError` handler |

## createMemo(fn)

Cached derived computation. Returns a getter. Recomputes lazily when dependencies change. Tracks reads like a signal — effects depending on the memo re-run only when the memo's value changes.

```js
const [a, setA] = createSignal(1);
const double = createMemo(() => a() * 2);
double(); // 2
```

## createStore(initialValue)

Proxy-wrapped object with per-property reactive tracking. Reading a property inside an effect subscribes to that property. Writing a property notifies only subscribers of that specific key.

| Detail | Behavior |
|--------|----------|
| Tracking granularity | Per top-level property (not deep — see `decantr/state/store` for deep stores) |
| Identity check | Skips notification on `Object.is` equality |
| Return value | The proxy itself (mutate in place) |

## batch(fn)

Defers all effect runs until `fn` completes. Supports nesting — flush happens when outermost `batch` exits. Flush uses topological ordering.

```js
batch(() => {
  setA(1);
  setB(2); // effects run once after both updates
});
```

## createRoot(fn)

Create an independent reactive scope. `fn` receives a `dispose` function. All effects/memos created inside are owned by this root and disposed when `dispose()` is called.

```js
const result = createRoot(dispose => {
  const [count, setCount] = createSignal(0);
  createEffect(() => console.log(count()));
  // dispose() cleans up effect and all children
  return { count, setCount, dispose };
});
```

## getOwner() / runWithOwner(owner, fn)

Introspect and transfer ownership context. Useful for effects created outside the normal component tree (e.g., in setTimeout, event handlers).

```js
const owner = getOwner(); // capture in sync context
setTimeout(() => {
  runWithOwner(owner, () => {
    createEffect(() => { /* properly owned */ });
  });
}, 1000);
```

## onError(handler)

Register an error handler on the current owner. When an effect throws, the error walks up the ownership tree to find the nearest handler.

```js
createRoot(() => {
  onError(err => console.error('Caught:', err));
  createEffect(() => { throw new Error('boom'); }); // caught by handler
});
```

## on(deps, fn, options?)

Explicit dependency tracking. Reads `deps` inside tracking context, calls `fn` inside `untrack()`. Useful when you need to read a signal inside an effect without subscribing to it.

| Option | Description |
|--------|-------------|
| `defer` | If `true`, skip initial run (default: `false`) |

```js
const [count, setCount] = createSignal(0);
const [name] = createSignal('World');

// Only re-runs when count changes, not when name changes
on(count, (value, prev) => {
  console.log(`count: ${prev} → ${value}, name: ${name()}`);
});
```

Supports array of dependencies:
```js
on([a, b], ([aVal, bVal], [prevA, prevB]) => { ... });
```

## createContext(defaultValue?)

Dependency injection via Provider/consume pattern. Returns `{ Provider, consume }`.

| Method | Signature | Description |
|--------|-----------|-------------|
| `Provider` | `(value: T) => () => void` | Sets context value, returns restore function |
| `consume` | `() => T` | Reads current value (or `defaultValue`) |

```js
const ThemeCtx = createContext('light');
const restore = ThemeCtx.Provider('dark');
ThemeCtx.consume(); // 'dark'
restore(); // restores previous value
```

## createSelector(source)

Per-key memoization for efficient list highlighting. Returns `isSelected(key)` — a reactive check that only notifies when a specific key's match status changes.

```js
const [selected, setSelected] = createSignal('a');
const isSelected = createSelector(selected);
// In a list item: isSelected('a') returns true, re-runs only when 'a' gains/loses selection
```

## createDeferred(fn)

Like `createMemo` but lazy-initialized — does not compute until the returned getter is first called. Subsequent reads use cached value until dependencies change, then recomputes on next read.

## createHistory(signal, options?)

Undo/redo history tracking for a signal.

| Param | Type | Description |
|-------|------|-------------|
| `signal` | `[getter, setter]` | Signal tuple from `createSignal` |
| `options.maxLength` | `number` | Max undo depth (default: `100`) |

| Key | Type | Description |
|-----|------|-------------|
| `canUndo` | `() => boolean` | Signal getter |
| `canRedo` | `() => boolean` | Signal getter |
| `undo` | `() => void` | Restore previous value |
| `redo` | `() => void` | Re-apply undone value |
| `clear` | `() => void` | Reset history to current value |

## useLocalStorage(key, initial)

Signal backed by `localStorage` with JSON serialization. Returns `[getter, setter]` — same API as `createSignal`.

## untrack(fn) / peek(getter)

Read signals without subscribing the current effect.

| Function | Use case |
|----------|----------|
| `untrack(fn)` | Run `fn` with tracking disabled |
| `peek(getter)` | Alias for `untrack(getter)` |

---


---

# Data Layer


# Data Layer Reference

`import { createQuery, createInfiniteQuery, createMutation, queryClient, createEntityStore, createURLSignal, createURLStore, parsers, createWebSocket, createEventSource, createPersisted, createIndexedDB, createCrossTab, createOfflineQueue, createWorkerSignal, createWorkerQuery } from 'decantr/data';`

## createQuery(key, fetcher, options?)

Server state management with caching, deduplication, and stale-while-revalidate. Replaces `createResource`.

```js
const users = createQuery('users', ({ signal }) =>
  fetch('/api/users', { signal }).then(r => r.json())
);
// users.data(), users.isLoading(), users.error()
// users.refetch(), users.setData([])
```

**Dynamic key** — re-fetches when key changes (previous request cancelled via AbortController):
```js
const user = createQuery(() => `user-${id()}`, ({ key, signal }) =>
  fetch(`/api/users/${id()}`, { signal }).then(r => r.json())
);
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `staleTime` | `number` | `0` | ms before cached data is stale |
| `cacheTime` | `number` | `300000` | ms to keep inactive cache (5 min) |
| `retry` | `number` | `3` | Retry count with exponential backoff |
| `refetchInterval` | `number` | — | Auto background refetch ms |
| `refetchOnWindowFocus` | `boolean` | `true` | Refetch on tab focus |
| `enabled` | `() => boolean` | — | Signal getter; false = idle |
| `select` | `(data) => T` | — | Transform raw data |
| `initialData` | `T` | — | Initial data value |
| `placeholderData` | `T` | — | Placeholder while loading |

| Return | Type | Description |
|--------|------|-------------|
| `data` | `() => T \| undefined` | Signal getter |
| `status` | `() => string` | 'idle' \| 'loading' \| 'success' \| 'error' |
| `error` | `() => Error \| null` | Signal getter |
| `isLoading` | `() => boolean` | True during initial load |
| `isStale` | `() => boolean` | True when cached data is stale |
| `isFetching` | `() => boolean` | True during any fetch (including background) |
| `refetch` | `() => Promise` | Manually trigger refetch |
| `setData` | `(value: T) => void` | Manually set data |

## createInfiniteQuery(key, fetcher, options?)

Cursor-based or offset pagination.

```js
const posts = createInfiniteQuery('posts',
  ({ pageParam = 0, signal }) => fetch(`/api/posts?offset=${pageParam}`, { signal }).then(r => r.json()),
  { getNextPageParam: (lastPage) => lastPage.nextCursor }
);
// posts.pages(), posts.allItems(), posts.hasNextPage(), posts.fetchNextPage()
```

## createMutation(mutationFn, options?)

Mutations with optimistic updates and rollback.

```js
const addUser = createMutation(
  (user) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }).then(r => r.json()),
  {
    onMutate: (user) => {
      const prev = queryClient.getCache('users');
      queryClient.setCache('users', [...(prev || []), user]);
      return { prev }; // rollback context
    },
    onError: (err, user, ctx) => queryClient.setCache('users', ctx.prev),
    onSuccess: () => queryClient.invalidate('users')
  }
);
addUser.mutate({ name: 'Alice' });
```

## queryClient

Singleton cache manager.

| Method | Description |
|--------|-------------|
| `invalidate(keyPrefix)` | Mark matching queries stale, refetch active ones |
| `prefetch(key, fetcher)` | Warm cache without subscribing |
| `setCache(key, data)` | Manual cache write |
| `getCache(key)` | Read cache |
| `clear()` | Reset everything |

## createEntityStore(options)

Normalized collections with per-entity reactivity.

```js
const users = createEntityStore({ getId: u => u.id });
users.addMany([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
users.get(1)(); // { id: 1, name: 'Alice' } — per-entity signal
users.all(); // full array — collection signal
users.filter(u => u.name.startsWith('A'))(); // derived view
```

| Method | Description |
|--------|-------------|
| `addMany(entities)` | Batch add |
| `upsert(entity)` | Add or update |
| `update(id, partial)` | Partial merge |
| `remove(id)` | Remove |
| `clear()` | Remove all |
| `get(id)` | Per-entity signal getter (lazy, only fires for that entity) |
| `all()` | Signal: all entities as array |
| `count()` | Signal: count |
| `filter(pred)` | Derived filtered memo |
| `sorted(cmp)` | Derived sorted memo |
| `paginated({page, size})` | Derived paginated memo |

## createURLSignal(key, parser, options?)

Signal backed by URL search params. Routing-mode aware (hash/history).

```js
const [filter, setFilter] = createURLSignal('filter', parsers.string, { defaultValue: '' });
const [page, setPage] = createURLSignal('page', parsers.integer, { defaultValue: 1 });
```

## createURLStore(schema)

Multiple URL params as reactive store.

```js
const url = createURLStore({
  page: { parser: parsers.integer, defaultValue: 1 },
  sort: { parser: parsers.string, defaultValue: 'name' }
});
url.page(); // 1
url.setPage(2); // updates URL
url.values(); // { page: 2, sort: 'name' }
url.reset(); // reset all to defaults
```

## Built-in parsers

`parsers.string`, `parsers.integer`, `parsers.float`, `parsers.boolean`, `parsers.json`, `parsers.date`, `parsers.enum(['a','b','c'])`

## createWebSocket(url, options?)

WebSocket with auto-reconnect, exponential backoff, and send buffering.

```js
const ws = createWebSocket('wss://api.example.com/ws', { parse: JSON.parse });
ws.on(msg => users.upsert(msg.payload));
ws.send({ type: 'subscribe', channel: 'updates' });
// ws.status(), ws.lastMessage(), ws.close()
```

## createEventSource(url, options?)

Server-Sent Events with typed event listeners.

```js
const sse = createEventSource('/api/events', { events: ['update', 'delete'] });
sse.on('update', data => { ... });
```

## createPersisted(key, init, options?)

Signal backed by localStorage/sessionStorage with cross-tab sync via `storage` event.

```js
const [theme, setTheme] = createPersisted('app-theme', 'light');
```

## createIndexedDB(dbName, storeName)

Reactive IndexedDB binding. All methods return Promises.

```js
const db = createIndexedDB('myapp', 'items');
await db.set('key1', { name: 'Alice' });
const item = await db.get('key1');
```

## createCrossTab(channel, signal)

BroadcastChannel sync for a signal across browser tabs.

```js
const cleanup = createCrossTab('counter', [count, setCount]);
```

## createOfflineQueue(options)

Queue operations while offline, auto-flush on reconnect.

```js
const queue = createOfflineQueue({
  process: async (item) => await fetch(item.url, item.options),
  persist: true
});
queue.add({ url: '/api/sync', options: { method: 'POST', body: '...' } });
```

## createWorkerSignal(worker) / createWorkerQuery(worker, input)

Web Worker integration.

```js
const ws = createWorkerSignal(new Worker('./compute.js'));
ws.send({ type: 'process', data: largeArray });
// ws.result(), ws.busy(), ws.error()
```

---


---

# Compound Spacing


# Compound Spacing, Offsets & Density

> **Strategic guide**: For the full spatial design language — proximity tiers, density zones, responsive behavior, visual weight, and decision tables — see `reference/spatial-guidelines.md`. This document covers the implementation contracts for compound components.

## Compound Spacing Contract

All compound components (Card, Modal, AlertDialog, Drawer) follow a unified spacing contract via `--d-compound-pad` and `--d-compound-gap`. This ensures consistent header/body/footer spacing across all overlay and container components.

| Section | Padding Rule |
|---------|-------------|
| **Header** | `var(--d-compound-pad) var(--d-compound-pad) 0` |
| **Body** | `var(--d-compound-gap) var(--d-compound-pad)` |
| **Body:last-child** | adds `padding-bottom: var(--d-compound-pad)` |
| **Footer** | `var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)` |

**Bordered footer exception:** When a compound footer has a visible `border-top` (e.g. Card), the border provides inter-section separation, so the footer uses `var(--d-compound-pad)` on all sides for vertical centering. The asymmetric `compound-gap` top is only appropriate when the gap alone is the separator (Modal, Drawer).

New compound components MUST follow this contract. Never hardcode padding in header/body/footer — use the compound tokens.

## Popup Offset Hierarchy

> Full elevation hierarchy and offset strategy: `reference/spatial-guidelines.md` §11 Z-Axis Spatial Rules.

All floating elements use offset tokens for trigger->panel distance. The hierarchy reflects visual weight:

`--d-offset-dropdown` (2px) < `--d-offset-menu` (4px) < `--d-offset-tooltip` (6px) < `--d-offset-popover` (8px)

New floating components MUST use the appropriate offset token, never hardcoded pixel values.

## Density Classes

> Full density rules, character mapping, and usage guidance: `reference/spatial-guidelines.md` §16 Density System Integration.

`.d-compact`, `.d-comfortable`, `.d-spacious` — cascade to children, override `--d-density-pad-x`, `--d-density-pad-y`, `--d-density-gap`, `--d-density-min-h`, `--d-density-text`, `--d-compound-pad`, `--d-compound-gap`

| Density | `--d-compound-pad` | `--d-compound-gap` | Controls | Interiors |
|---------|--------------------|--------------------|----------|-----------|
| compact | `var(--d-sp-3)` | `var(--d-sp-2)` | Tighter | Tighter |
| comfortable | `var(--d-sp-5)` | `var(--d-sp-3)` | Default | Default |
| spacious | `var(--d-sp-8)` | `var(--d-sp-4)` | Wider | Wider |

## Field Sizing Contract

> Component sizing tiers, touch targets, and inset patterns: `reference/spatial-guidelines.md` §7 Component Sizing.

All form components support a unified 4-tier sizing system (xs/sm/md/lg). Height is the primary constraint; padding and font-size follow.

**Core components** (Button, Select, Input, Toggle, Combobox) use per-component size classes (`.d-btn-sm`, `.d-select-sm .d-select`, `.d-input-sm`, etc.) that include `min-height` overrides.

**Picker components** (DatePicker, TimePicker, Cascader, TreeSelect, ColorPicker, Mentions, InputNumber, DateRangePicker, TimeRangePicker) use `.d-field-{size}` utility classes that override density tokens locally:

```css
.d-field-xs { --d-density-min-h:var(--d-field-h-xs); --d-density-pad-y:var(--d-field-py-xs); ... }
.d-field-sm { --d-density-min-h:var(--d-field-h-sm); ... }
.d-field-lg { --d-density-min-h:var(--d-field-h-lg); ... }
```

Any child `.d-select`, `.d-input`, etc. inside a `.d-field-sm` wrapper inherits sm sizing via the density cascade — no per-component CSS needed.

**Tier ↔ density mapping:** compact defaults = sm tokens, comfortable defaults = md tokens, spacious defaults = lg tokens. This means setting density to "compact" automatically makes all form elements 28px height.

**Components with own size tokens:** Switch (`--d-switch-w/h/thumb-{tier}`), Checkbox/Radio (`--d-checkbox-size-{tier}`), InputOTP (`--d-otp-w/h/text-{tier}`).

## Prose System

`.d-prose` — auto-applies vertical rhythm to child elements. Use for long-form content (articles, documentation, modal descriptions).

- Base: `font-size:var(--d-text-base); line-height:var(--d-lh-relaxed)`
- Between siblings: `> * + * { margin-top: var(--d-sp-4) }`
- Headings: graduated margin-top (sp-12->sp-10->sp-8->sp-6) + margin-bottom (sp-4->sp-3)
- Lists: left padding, per-item spacing
- Blockquote: left border + padding + italic
- Code/pre: mono font, padding, surface background
- Tables: cell padding, bottom borders

Usage: `div({ class: 'd-prose' }, h1('Title'), p('Body text...'), ul(li('Item')))`

## Spacing Utilities

Child-spacing utilities use the `d-` prefix (not `_` atom prefix) because they require child combinators (`> * + *`) which cannot be expressed in the atom resolver.

| Class | Effect |
|-------|--------|
| `d-spacey-{1-24}` | `> * + * { margin-top: {scale} }` — vertical child spacing |
| `d-spacex-{1-24}` | `> * + * { margin-left: {scale} }` — horizontal child spacing |
| `d-dividey` | `> * + * { border-top: 1px solid var(--d-border) }` |
| `d-dividex` | `> * + * { border-left: 1px solid var(--d-border) }` |
| `d-dividey-strong` | `> * + * { border-top: 1px solid var(--d-border-strong) }` |
| `d-dividex-strong` | `> * + * { border-left: 1px solid var(--d-border-strong) }` |

Scale: 1 (0.25rem) through 24 (6rem). Same spacing scale as `_p`/`_m` atoms.

---


---

# Full Atom Reference


# Atomic CSS Reference

All atoms are prefixed with `_` (underscore) for namespace safety — zero conflicts with Tailwind, Bootstrap, or any CSS framework. Every decantr atom starts with `_`.

All atoms are available via `css()`. Example: `css('_grid _gc3 _gap4 _p6 _ctr')`.

## Spacing (_p, _m, _gap — scale 0-12 + 14,16,20,24,32,40,48,56,64)

> For decision logic on which spacing atoms to use, see `reference/spatial-guidelines.md` §2 Spatial Taxonomy and §18 Quick Reference Decision Table.
| Prefix | Property | Example |
|--------|----------|---------|
| `_p` | padding | `_p4` -> `1rem` |
| `_px/_py` | padding-inline/block | `_px2` -> `0.5rem` |
| `_pt/_pr/_pb/_pl` | padding sides | `_pt1` -> `0.25rem` |
| `_m` | margin | `_m4` -> `1rem` |
| `_mx/_my` | margin-inline/block | `_mx2` -> `0.5rem` |
| `_mt/_mr/_mb/_ml` | margin sides | `_mt1` -> `0.25rem` |
| `_gap/_gx/_gy` | gap/column-gap/row-gap | `_gap4` -> `1rem` |

## Negative Margins (scale 1-12 + 14,16,20,24,32)
`_-m2` -> `margin:-0.5rem`, `_-mt4` -> `margin-top:-1rem`, `_-mx1`, `_-my3`, `_-mr2`, `_-mb1`, `_-ml4`

## Auto Margins
`_ma` (margin:auto), `_mxa` (margin-inline:auto), `_mya` (margin-block:auto), `_mta`, `_mra`, `_mba`, `_mla`

## Width/Height (scale 0-12 + extended + keywords)
| Atom | Output |
|------|--------|
| `_w4/_h4` | width/height: 1rem |
| `_wfull/_hfull` | 100% |
| `_wscreen` | width:100vw |
| `_hscreen` | height:100vh |
| `_wauto/_hauto` | auto |
| `_wfit/_hfit` | fit-content |
| `_wmin/_wmax` | min-content/max-content |
| `_hmin/_hmax` | min-content/max-content |
| `_mw4/_mh4` | max-width/max-height |
| `_mwmin/_mwmax` | max-width: min/max-content |
| `_mhmin/_mhmax` | max-height: min/max-content |

## Min-Width/Height (scale 0-12 + extended + keywords)
`_minw0`-`_minw64`, `_minwfull`, `_minwscreen` (100vw), `_minwfit`, `_minwmin`, `_minwmax`
`_minh0`-`_minh64`, `_minhfull`, `_minhscreen` (100vh), `_minhfit`, `_minhmin`, `_minhmax`

## Display
`_block`, `_inline`, `_flex`, `_grid`, `_none`, `_contents`, `_iflex`, `_igrid`

## Flexbox
| Atom | Output |
|------|--------|
| `_col/_row` | flex-direction |
| `_colr/_rowr` | column-reverse/row-reverse |
| `_wrap/_nowrap/_wrapr` | flex-wrap |
| `_grow/_grow0` | flex-grow: 1/0 |
| `_shrink/_shrink0` | flex-shrink: 1/0 |
| `_flex1` | flex: 1 1 0% |
| `_flexauto` | flex: 1 1 auto |
| `_flexnone` | flex: none |
| `_flexinit` | flex: 0 1 auto |

## Flex-Basis (scale 0-12 + extended + percentages)
`_basis0`-`_basis12`, `_basis14`-`_basis64`, `_basisa` (auto)
`_basis25` (25%), `_basis33` (33.333%), `_basis50` (50%), `_basis66` (66.667%), `_basis75` (75%), `_basisfull` (100%)

## Order
`_ord0`-`_ord12`, `_ord-1` (-1), `_ordfirst` (-9999), `_ordlast` (9999)

## Alignment
| Atom | Property | Value |
|------|----------|-------|
| `_center` | align-items + justify-content | center |
| `_aic/_ais/_aifs/_aife/_aibs` | align-items | center/stretch/flex-start/flex-end/baseline |
| `_jcc/_jcsb/_jcsa/_jcse/_jcfs/_jcfe` | justify-content | center/space-between/around/evenly/flex-start/flex-end |
| `_acc/_acsb/_acsa/_acse/_acfs/_acfe/_acs` | align-content | center/space-between/around/evenly/flex-start/flex-end/stretch |
| `_asc/_ass/_asfs/_asfe/_asa/_asbs` | align-self | center/stretch/flex-start/flex-end/auto/baseline |
| `_jic/_jis/_jifs/_jife` | justify-items | center/stretch/start/end |
| `_jsc/_jss/_jsfs/_jsfe/_jsa` | justify-self | center/stretch/start/end/auto |
| `_pic/_pis` | place-items | center/stretch |
| `_pcc/_pcse/_pcsb` | place-content | center/space-evenly/space-between |

## Grid System

> For column count by content type and container width guidance, see `reference/spatial-guidelines.md` §14 Grid & Column System.

| Atom | Output |
|------|--------|
| `_gc1`-`_gc12` | grid-template-columns: repeat(N,minmax(0,1fr)) |
| `_gcnone` | grid-template-columns: none |
| `_gr1`-`_gr6` | grid-template-rows: repeat(N,minmax(0,1fr)) |
| `_grnone` | grid-template-rows: none |
| `_span1`-`_span12` | grid-column: span N/span N |
| `_spanfull` | grid-column: 1/-1 |
| `_rspan1`-`_rspan6` | grid-row: span N/span N |
| `_rspanfull` | grid-row: 1/-1 |
| `_gcs1`-`_gcs13` | grid-column-start |
| `_gce1`-`_gce13` | grid-column-end |
| `_grs1`-`_grs7` | grid-row-start |
| `_gre1`-`_gre7` | grid-row-end |
| `_gcaf160/200/220/250/280/300/320` | repeat(auto-fit,minmax(Npx,1fr)) |
| `_gcaf` | repeat(auto-fit,minmax(0,1fr)) |
| `_gcafl` | repeat(auto-fill,minmax(0,1fr)) |
| `_gflowr/_gflowc/_gflowd/_gflowrd/_gflowcd` | grid-auto-flow |
| `_gacfr/_gacmin/_gacmax` | grid-auto-columns |
| `_garfr/_garmin/_garmax` | grid-auto-rows |

## Aspect Ratio
`_arsq` (1), `_ar169` (16/9), `_ar43` (4/3), `_ar219` (21/9), `_ar32` (3/2), `_ara` (auto)

## Container Utilities
`_ctrsm` (640px), `_ctr` (960px), `_ctrlg` (1080px), `_ctrxl` (1280px), `_ctrfull` (100%) — all include margin-inline:auto

## Overflow
`_ohidden`, `_oauto`, `_oscroll`, `_ovisible`
`_oxhidden`, `_oxauto`, `_oxscroll`, `_oyhidden`, `_oyauto`, `_oyscroll`

## Text & Visibility
`_visible`, `_invisible`, `_wsnw` (nowrap), `_wsnormal`, `_wspre`, `_wsprewrap`
`_truncate` (overflow:hidden + text-overflow:ellipsis + white-space:nowrap)
`_clamp2`, `_clamp3` (line clamping via -webkit-line-clamp)

## Line-Height
`_lh1` (1), `_lh1a`/`_lh125` (1.25), `_lh1b`/`_lh150` (1.5), `_lh175` (1.75), `_lh2` (2)

## Typography
`_t10`-`_t48` (font-size, fixed rem), `_bold/_medium/_normal/_light` (weight), `_italic`, `_underline/_strike/_nounder`, `_upper/_lower/_cap`, `_tl/_tc/_tr`

## Token-Backed Typography (theme-customizable)

> For typographic spatial rules (heading asymmetry, vertical rhythm), see `reference/spatial-guidelines.md` §8 Typographic Spatial System.
| Atom | CSS Output |
|------|-----------|
| `_textxs`-`_text4xl` | `font-size:var(--d-text-{size},{fallback})` — xs/sm/base/md/lg/xl/2xl/3xl/4xl |
| `_lhtight` | `line-height:var(--d-lh-tight,1.1)` |
| `_lhsnug` | `line-height:var(--d-lh-snug,1.25)` |
| `_lhnormal` | `line-height:var(--d-lh-normal,1.5)` |
| `_lhrelaxed` | `line-height:var(--d-lh-relaxed,1.6)` |
| `_lhloose` | `line-height:var(--d-lh-loose,1.75)` |
| `_fwheading` | `font-weight:var(--d-fw-heading,700)` |
| `_fwtitle` | `font-weight:var(--d-fw-title,600)` |
| `_lsheading` | `letter-spacing:var(--d-ls-heading,-0.025em)` |

Use `_text*`/`_lh*`/`_fw*` atoms in components for theme-customizable typography. Use `_t10`-`_t48` for fixed sizes that should not change per theme.

## Typography Presets (compound atoms)

Bundles of size+weight+lineHeight+letterSpacing for common text roles. All token-backed with `var()` fallbacks — theme-customizable automatically (retro gets bolder headings, etc.).

| Atom | Size | Weight | Line Height | Extra |
|------|------|--------|-------------|-------|
| `_heading1` | `--d-text-4xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading2` | `--d-text-3xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading3` | `--d-text-2xl` | `--d-fw-heading` | `--d-lh-snug` | `--d-ls-heading` |
| `_heading4` | `--d-text-xl` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading5` | `--d-text-lg` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading6` | `--d-text-md` | `--d-fw-title` | `--d-lh-normal` | — |
| `_body` | `--d-text-base` | — | `--d-lh-normal` | — |
| `_bodylg` | `--d-text-md` | — | `--d-lh-relaxed` | — |
| `_caption` | `--d-text-sm` | — | `--d-lh-normal` | `color:--d-muted-fg` |
| `_label` | `--d-text-sm` | `--d-fw-medium` | `--d-lh-none` | — |
| `_overline` | `--d-text-xs` | `--d-fw-medium` | `--d-lh-none` | `uppercase; ls:0.08em` |

Usage: `h1({ class: css('_heading1') }, 'Page Title')` — one atom replaces 3-4 individual atoms.

## Colors (Semantic)
**Palette roles**: `_bg{role}`, `_fg{role}`, `_bc{role}` — where role = `primary`, `accent`, `tertiary`, `success`, `warning`, `error`, `info`
**Subtle variants**: `_bg{role}sub`, `_fg{role}sub` (subtle bg/fg), `_bc{role}bdr` (role border)
**Foreground-on-base**: `_fg{role}on` (contrasting text on role background)
**Neutrals**: `_bgbg`, `_fgfg`, `_bgmuted`, `_fgmuted`, `_fgmutedfg`, `_bcborder`, `_bcstrong`
**Surfaces**: `_surface0`-`_surface3`, `_fgsurface0`-`_fgsurface3`, `_bcsurface0`-`_bcsurface3`
**Opacity**: `_bg{role}/N` (e.g. `_bgprimary/50`) — color-mix with transparency (0-100)

### Color Decision Flow

| Intent | Atom | Token |
|--------|------|-------|
| Primary text | `_fgfg` | `--d-fg` |
| Muted/secondary text | `_fgmutedfg` | `--d-muted-fg` |
| Even more muted text | `_fgmuted` | `--d-muted` |
| Accent/brand text | `_fgprimary` | `--d-primary` |
| Page background | `_bgbg` | `--d-bg` |
| Muted background | `_bgmuted` | `--d-muted` |
| Primary action bg | `_bgprimary` | `--d-primary` |
| Surface card bg | `_surface0`–`_surface3` | `--d-surface-{0-3}` |
| Border default | `_bcborder` | `--d-border` |
| Border emphasis | `_bcstrong` | `--d-border-strong` |
| Error state | `_fgerror` / `_bgerror` | `--d-error` |
| Success state | `_fgsuccess` / `_bgsuccess` | `--d-success` |

## Field Atoms

Unified field container atoms. Pair with field tokens for consistent form styling.

| Atom | Output |
|------|--------|
| `_field` | Field visual base — applies `--d-field-bg`, `--d-field-border`, `--d-field-radius`, border-width |
| `_fieldOutlined` | Outlined variant (alias for `_field`) — transparent bg, visible border |
| `_fieldFilled` | Filled variant — surface bg, transparent border |
| `_fieldGhost` | Ghost variant — transparent bg + border, shows border on focus |

## Interactive State Atoms

Semantic background/foreground atoms for item selection and hover states.

| Atom | Output |
|------|--------|
| `_hoverBg` | `background:var(--d-item-hover-bg)` — hover background for list items, options, rows |
| `_activeBg` | `background:var(--d-item-active-bg)` — active/pressed item background |
| `_selectedBg` | `background:var(--d-selected-bg)` — selected item background |
| `_selectedFg` | `color:var(--d-selected-fg)` — selected item foreground |

## Semantic Opacity Atoms

| Atom | Output |
|------|--------|
| `_disabled` | `opacity:var(--d-disabled-opacity);cursor:not-allowed;pointer-events:none` — disabled state |

## Layout Atoms

| Atom | Output |
|------|--------|
| `_proseWidth` | `max-width:var(--d-prose-width,75ch)` — optimal reading line length |

## Atom Resolution

Atoms are resolved algorithmically by `resolveAtomDecl()` in `src/css/atoms.js` (rewritten from a 665-line imperative Map to a 548-line algorithmic resolver). The resolution order is:

1. **ALIASES** — long-form names to canonical terse atoms (`_gridCols4` → `_gc4`, etc.)
2. **DIRECT** — known fixed atoms looked up by exact name
3. **Algorithmic patterns** — spacing scales, grid columns, typography sizes, colors, etc. computed from naming conventions
4. **RESIDUAL** — remaining one-off atoms that don't fit algorithmic patterns

The `css()` API is unchanged. In **production builds** with static CSS extraction enabled, all atoms are pre-resolved at build time and `css()` becomes a lightweight passthrough (~673 bytes) that only converts `_group` to `d-group`, `_peer` to `d-peer`, and joins class names. The `atoms.js` and `runtime.js` modules are removed entirely from the bundle. If `define()` or dynamic `css()` patterns are detected, the full runtime is preserved as a fallback.

## Aliases
Long-form names resolve to canonical terse atoms: `_gridCols4` → `_gc4`, `_noDecoration` → `_nounder`, `_border` → `_b1`, `_borderColor` → `_bcborder`, `_radiusFull` → `_rfull`, `_radius0`-`_radius8` → `_r0`-`_r8`

## Position
`_relative/_absolute/_fixed/_sticky` (or `_rel/_abs`), `_top0/_right0/_bottom0/_left0/_inset0`

## Borders
`_b0/_b1/_b2`, `_r0`-`_r8` (border-radius), `_rfull` (9999px), `_rcircle` (50%)

### Radius Decision Flow

| Element | Atom | Rationale |
|---------|------|-----------|
| Buttons, inputs | `_r2`–`_r3` | Standard interactive controls |
| Cards, panels | `_r3`–`_r4` | Content containers |
| Avatars, tags | `_rfull` | Circular/pill shapes |
| Table cells | `_r2` | Subtle rounding |
| Modals, dialogs | `_r4` | Prominent containers |
| Sharp/no radius | `_r0` | Data-dense, technical UIs |

## Opacity, Transitions, Z-index, Shadow, Cursor
`_op0`-`_op10`, `_trans/_transfast/_transslow/_transnone`, `_z0/_z10/_z20/_z30/_z40/_z50`
`_shadow/_shadowmd/_shadowlg/_shadowno`, `_pointer/_grab`

### Arbitrary Transition Syntax

Use bracket notation `_trans[...]` for custom transitions. Underscores in the value are converted to spaces:

```js
css('_trans[color_0.15s_ease]')             // transition: color 0.15s ease
css('_trans[opacity_0.2s_ease-in-out]')     // transition: opacity 0.2s ease-in-out
css('_trans[transform_0.3s_cubic-bezier(0.4,0,0.2,1)]')  // custom easing
```

This uses the `trans` arbitrary value prefix (mapped to `transition` in `ARB_PROPS`). Prefer `_trans` (all 0.2s ease) for standard transitions and `_trans[...]` only when you need to target specific properties or non-standard durations.

---

## Composable Gradient System

Build gradients by combining direction + from + via + to atoms. Uses CSS variable composition.

```js
css('_gradBR _fromPrimary _toAccent')           // bottom-right, primary → accent
css('_gradR _fromPrimary _viaSuccess _toTransparent')  // right, with via stop
```

**Direction atoms:** `_gradR`, `_gradL`, `_gradT`, `_gradB`, `_gradBR`, `_gradBL`, `_gradTR`, `_gradTL`

**From atoms** (set start color): `_fromPrimary`, `_fromAccent`, `_fromTertiary`, `_fromSuccess`, `_fromWarning`, `_fromError`, `_fromInfo`, `_fromBg`, `_fromSurface1`, `_fromTransparent`

**Via atoms** (set middle color): `_viaPrimary`, `_viaAccent`, `_viaTertiary`, `_viaSuccess`, `_viaWarning`, `_viaError`, `_viaInfo`, `_viaBg`, `_viaSurface1`, `_viaTransparent`

**To atoms** (set end color): `_toPrimary`, `_toAccent`, `_toTertiary`, `_toSuccess`, `_toWarning`, `_toError`, `_toInfo`, `_toBg`, `_toSurface1`, `_toTransparent`

Works with responsive: `css('_sm:gradBR')`. Works with container queries: `css('_cq640:gradR')`.

## Opacity Modifiers

Append `/N` to any color atom for alpha transparency. Uses `color-mix()` (96%+ browser support).

```js
css('_bgprimary/50')    // background at 50% opacity
css('_fgaccent/30')     // text at 30% opacity
css('_bcborder/80')     // border at 80% opacity
css('_sm:bgprimary/20') // responsive: 20% at sm+
```

Valid opacities: 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95.

Works with all color atoms (`_bg*`, `_fg*`, `_bc*`), responsive prefixes, and container queries.

## Group/Peer State Modifiers

Style children based on parent state, or siblings based on peer state.

```js
// Group: parent hover affects children
div({ class: css('_group') },
  span({ class: css('_fgmuted _gh:fgprimary _trans') }, 'Turns primary on parent hover')
)

// Peer: sibling state affects next sibling
input({ class: css('_peer'), type: 'checkbox' }),
label({ class: css('_fgmuted _pf:fgprimary') }, 'Turns primary when input focused')
```

**Markers:** `_group` → outputs `d-group`, `_peer` → outputs `d-peer`

| Prefix | State | Selector Pattern |
|--------|-------|-----------------|
| `_gh:` | group-hover | `.d-group:hover .cls` |
| `_gf:` | group-focus-within | `.d-group:focus-within .cls` |
| `_ga:` | group-active | `.d-group:active .cls` |
| `_ph:` | peer-hover | `.d-peer:hover ~ .cls` |
| `_pf:` | peer-focus | `.d-peer:focus ~ .cls` |
| `_pa:` | peer-active | `.d-peer:active ~ .cls` |

Works with any atom: `_gh:elev2`, `_gh:bgprimary/50`, `_gf:bcprimary`.

## Responsive Prefixes (Mobile-First)

All atoms support responsive prefixes. Syntax: `_bp:atom`. Below the breakpoint, the base atom applies; at and above it, the prefixed atom takes over.

| Prefix | Min-Width | Example |
|--------|-----------|---------|
| `_sm:` | 640px | `css('_gc1 _sm:gc2')` — 1 col, 2 at sm+ |
| `_md:` | 768px | `css('_p4 _md:p8')` — p4 default, p8 at md+ |
| `_lg:` | 1024px | `css('_col _lg:row')` — column default, row at lg+ |
| `_xl:` | 1280px | `css('_ctr _xl:ctrxl')` — 960px default, 1280px at xl+ |

Works with all atoms including arbitrary values: `css('_sm:w[512px]')`, color opacity: `css('_sm:bgprimary/20')`, gradients: `css('_sm:gradBR')`.

## Container Query Prefixes

Style children based on container width, not viewport. Syntax: `_cqN:atom` where N is the min-width in pixels.

| Prefix | Min-Width | Example |
|--------|-----------|---------|
| `_cq320:` | 320px | `css('_cq320:gc2')` |
| `_cq480:` | 480px | `css('_cq480:gc3')` |
| `_cq640:` | 640px | `css('_cq640:gc4')` |
| `_cq768:` | 768px | `css('_cq768:row')` |
| `_cq1024:` | 1024px | `css('_cq1024:gc6')` |

Only these 5 widths are valid. Parent must have `container-type: inline-size` (use `_ctype[inline-size]` or set via CSS).

## Arbitrary Values

Escape hatch for one-off values without leaving utility-first flow.

```js
css('_w[512px]')                          // width:512px
css('_bg[#1a1d24]')                       // background:#1a1d24
css('_shadow[0_4px_6px_rgba(0,0,0,0.1)]') // box-shadow (underscores → spaces)
css('_p[clamp(1rem,2vw,2rem)]')           // padding with clamp()
css('_sm:w[512px]')                       // responsive arbitrary value
```

Syntax: `_prop[value]`. Underscores in value are converted to spaces.

| Prefix | Property | Prefix | Property |
|--------|----------|--------|----------|
| `w` | width | `h` | height |
| `mw` | max-width | `mh` | max-height |
| `minw` | min-width | `minh` | min-height |
| `p/pt/pr/pb/pl` | padding | `px/py` | padding-inline/block |
| `m/mt/mr/mb/ml` | margin | `mx/my` | margin-inline/block |
| `gap/gx/gy` | gap | `t` | font-size |
| `lh` | line-height | `fw` | font-weight |
| `ls` | letter-spacing | `r` | border-radius |
| `bg` | background | `fg` | color |
| `bc` | border-color | `z` | z-index |
| `op` | opacity | `shadow` | box-shadow |
| `top/right/bottom/left` | position | `inset` | inset |
| `bf` | backdrop-filter | | |

## Backdrop Filter Atoms (Composable)

Composable backdrop-filter via CSS variable composition. Combine blur + saturate + brightness.

```js
css('_bfblur12 _bfsat150')             // blur(12px) + saturate(1.5)
css('_bfblur8 _bfsat180 _bfbright110') // blur + saturate + brightness
css('_lg:bfblur16')                    // responsive backdrop blur
```

**Blur:** `_bfblur0`, `_bfblur4`, `_bfblur8`, `_bfblur12`, `_bfblur16`, `_bfblur20`, `_bfblur24`

**Saturate:** `_bfsat100`, `_bfsat125`, `_bfsat150`, `_bfsat180`, `_bfsat200`

**Brightness:** `_bfbright90`, `_bfbright100`, `_bfbright110`, `_bfbright120`

**Regular filter atoms:** `_fblur4`, `_fblur8`, `_fblur16`, `_fgray`, `_fgray50`, `_finvert`, `_fbright50`, `_fbright75`, `_fbright110`

## Custom Atoms via `define()`

When neither standard atoms nor `ARB_PROPS` bracket notation cover a CSS property, use `define()` to create a reusable atom instead of falling back to inline `style:`.

```js
import { define, css } from 'decantr/css';

define('_selectNone', 'user-select:none');
define('_peNone', 'pointer-events:none');
define('_rotated45', 'transform:rotate(45deg)');
define('_curNotAllowed', 'cursor:not-allowed');

// Use like any atom:
div({ class: css('_selectNone _peNone _rotated45') });
```

**When to use `define()`:**
- The CSS property has no `ARB_PROPS` prefix (e.g., `transform`, `user-select`, `pointer-events`, `clip-path`)
- You need the same static value in multiple places
- You want to avoid inline `style:` for a value known at author time

**When NOT to use `define()`:**
- The value is computed at runtime (use `style:` with signals/DOM measurements)
- A standard atom or bracket notation already covers it (check this file first)

**Escalation path:** (1) Standard atom → (2) Bracket notation `_w[32px]` → (3) `define()` → (4) Propose adding to `src/css/atoms.js` if broadly useful. Inline `style:` for static values is ALWAYS a bug.

---

## Pseudo-Class Prefixes

Compose ANY atom with interactive state pseudo-classes:

| Prefix | Pseudo-class | Example |
|--------|-------------|---------|
| `_h:` | `:hover` | `_h:bgprimary` — primary bg on hover |
| `_f:` | `:focus` | `_f:bcprimary` — primary border on focus |
| `_fv:` | `:focus-visible` | `_fv:ring2` — ring on keyboard focus |
| `_a:` | `:active` | `_a:bgmuted` — muted bg on press |
| `_fw:` | `:focus-within` | `_fw:bcprimary` — border when child focused |

**Combinations:**
- Responsive + pseudo: `_sm:h:bgmuted` — hover bg at sm+ breakpoint
- Pseudo + opacity: `_h:bgprimary/50` — 50% opacity primary bg on hover
- Pseudo + arbitrary: `_h:bg[rgba(255,255,255,0.1)]` — arbitrary bg on hover

## Ring Utilities

Focus indicators and decorative outlines using `--d-ring` token:

| Atom | Output |
|------|--------|
| `_ring1` | `box-shadow: 0 0 0 1px var(--d-ring)` |
| `_ring2` | `box-shadow: 0 0 0 2px var(--d-ring)` |
| `_ring4` | `box-shadow: 0 0 0 4px var(--d-ring)` |
| `_ring0` | `box-shadow: none` (remove ring) |
| `_ringPrimary` | `--d-ring: var(--d-primary)` |
| `_ringAccent` | `--d-ring: var(--d-accent)` |
| `_ringBorder` | `--d-ring: var(--d-border)` |

Common pattern: `css('_fv:ring2 _ringPrimary')` — 2px primary ring on keyboard focus.

## Transition Shortcuts

| Atom | Properties |
|------|-----------|
| `_transColors` | color, background-color, border-color, fill, stroke (0.2s ease) |
| `_transOpacity` | opacity (0.2s ease) |
| `_transTransform` | transform (0.2s ease) |
| `_transShadow` | box-shadow (0.2s ease) |
| `_trans[color_0.15s_ease]` | Arbitrary transition (underscores → spaces) |

## Prose Typography

`_prose` adds the `d-prose` class, which applies typographic styles to nested HTML content (h1-h4, p, blockquote, code, pre, ul, ol, hr, a, img, table).

```js
div({ class: css('_prose') },
  h('h2', 'Title'),
  h('p', 'Body text with ', h('code', 'inline code'), '.'),
  h('blockquote', 'A highlighted quote.')
);
```

## Divide Utilities

| Atom | Output |
|------|--------|
| `_divideY` | Horizontal border between stacked children |
| `_divideX` | Vertical border between inline children |

Uses `var(--d-border)` for color. Applied via child selector `> :not(:first-child)`.

## Text Wrapping

| Atom | Output |
|------|--------|
| `_textBalance` | `text-wrap: balance` — balanced line lengths |
| `_textPretty` | `text-wrap: pretty` — optimized line breaks |

## Scroll Behavior

| Atom | Output |
|------|--------|
| `_scrollSmooth` | `scroll-behavior: smooth` |

## Component Utility Classes

These are non-atomic CSS classes injected by `_base.js` for use in generated code and component composition:

| Class | Effect |
|-------|--------|
| `d-page-enter` | Fade-in entrance animation using `--d-duration-normal` + `--d-easing-decelerate` |
| `d-stagger` | Children fade in sequentially (50ms delay per child, up to 8 children + cap) |
| `d-stagger-up` | Children slide up sequentially (same timing as `d-stagger`) |
| `d-stagger-scale` | Children scale in sequentially (same timing as `d-stagger`) |
| `d-card-hover` | Card lift on hover — elevation + translateY + border-color transition |
| `d-shell-nav-item` | Nav item base — adds color/background transitions |
| `d-shell-nav-item-active` | Active nav item — animated left-edge indicator pill via `::before` pseudo |
| `d-statistic-trend-up` | Trend up color — `var(--d-success)` (green) |
| `d-statistic-trend-down` | Trend down color — `var(--d-error)` (red) |

---


---

# Component Sizing


## 7. Component Sizing

Height is the primary constraint. Padding, font-size, and gap derive from it.

### Field sizing tiers

| Tier | Height | Pad-Y | Pad-X | Font | Gap | Touch-safe? |
|------|--------|-------|-------|------|-----|-------------|
| **xs** | 24px | 4px | 8px | 10px | 4px | No (desktop only) |
| **sm** | 28px | 4px | 10px | 12px | 6px | No (desktop only) |
| **md** | 36px | 8px | 16px | 14px | 8px | Acceptable (with invisible padding to 44px) |
| **lg** | 44px | 10px | 24px | 16px | 10px | Yes (≥44px) |

### Inset patterns for components

| Component Type | Inset Pattern | Example Atoms | Rationale |
|---------------|---------------|--------------|-----------|
| **Buttons, chips, table cells** | Squish (vert ≈ 50% horiz) | `_py2 _px4` | Horizontal text needs room; vertical is constrained by line-height |
| **Text inputs, textareas** | Stretch (vert > horiz) | `_py3 _px2` | Vertical room for text entry; horizontal edge less critical |
| **Cards, panels, modals** | Inset (equal all sides) | `_p4`, `_p6` | Even containment boundary |
| **Tooltips, toasts** | Inset (compact) | `_p2`–`_p3` | Minimal chrome for transient content |

### Touch target rules

- **WCAG 2.2 AA minimum**: 24×24 CSS px
- **Recommended**: 44×44px (Apple) / 48×48px (Material)
- **Minimum gap between adjacent targets**: 8px (`_gap2`)
- **Compact density is desktop-only** — never apply `.d-compact` to touch-primary interfaces
- If visible size < 44px, invisible padding must extend the hit area to meet the target

### Icon sizing relative to text

| Context | Icon Size | Text Size | Line-Height | Icon-Text Gap |
|---------|-----------|-----------|-------------|--------------|
| Small (compact) | 16px | 12-14px | 16px | 4px (`_gap1`) |
| Default | 20-24px | 14-16px | 20-24px | 8px (`_gap2`) |
| Large | 24-32px | 16-20px | 24-32px | 8-12px (`_gap2`–`_gap3`) |

**Rule**: Icon size matches line-height, not font-size. Icon-to-text gap ≈ icon-size / 3.

---



## 15. Micro-Spacing Rules

Fine-grained spacing for small elements and intra-component gaps:

| Context | Gap (px) | Decantr | Notes |
|---------|----------|---------|-------|
| Icon to text (standard) | 8px | `_gap2` | Most common: buttons, list items, badges |
| Icon to text (compact) | 4px | `_gap1` | Small/dense buttons, breadcrumbs |
| Label above input | 4-8px | `_gap1`–`_gap2` | Intimate tier — label binds to its field |
| Helper/error text below input | 4px | `_gap1` | Intimate tier — subordinate to the input |
| Between form fields | 16px | `_gap4` | Related tier — siblings of same type |
| Chips/tags gap | 4-8px | `_gap1`–`_gap2` | Inline items, tight grouping |
| Breadcrumb separator margin | 4-8px each side | `_gap1`–`_gap2` | Separator is not a grouping boundary |
| Button group gap (related) | 8px | `_gap2` | Related actions (Save / Cancel) |
| Button group gap (unrelated groups) | 16-24px | `_gap4`–`_gap6` | Separate button clusters |
| Badge overlap on parent | 25-50% of badge diameter | `_-mt1 _-mr1` | Badge partially covers parent corner |
| Inline `Kbd` padding | 2-4px horizontal | `_px1` | Minimal chrome |

---