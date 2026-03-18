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

# Task: Change Styles or Themes


> Read this file when changing the visual style, creating a custom style, or modifying the theme system.


# Style + Mode System


# Style + Mode System

Decantr uses an orthogonal **style x mode** architecture. Visual personality (style) is independent from color mode (light/dark/auto).

## Styles (Visual Personality)

| Style | Description | Personality |
|-------|-------------|-------------|
| auradecantism | **(default)** Dark glass aesthetic — vibrant purple/cyan/pink palette, mesh gradients, luminous glow, frosted surfaces | radius:pill, elevation:glass, motion:bouncy, borders:thin, density:comfortable, gradient:vivid |
| clean | Modern minimal — rounded corners, subtle shadows, smooth motion | radius:rounded, elevation:subtle, motion:smooth, borders:thin, density:comfortable, gradient:none |
| retro | Neobrutalism — sharp corners, offset shadows, bold borders | radius:sharp, elevation:brutalist, motion:snappy, borders:bold, density:comfortable, gradient:none |
| glassmorphism | Frosted glass — translucent surfaces, vivid gradients, bouncy motion | radius:pill, elevation:glass, motion:bouncy, borders:thin, density:comfortable, gradient:vivid |
| command-center | HUD/radar monochromatic — dark operational panels, beveled frames, scanlines, scoped monospace on data elements | radius:sharp, elevation:flat, motion:snappy, borders:bold, density:compact, gradient:none, palette:monochrome |

## Modes

| Mode | Behavior |
|------|----------|
| light | Light color scheme |
| dark | Dark color scheme |
| auto | Tracks system `prefers-color-scheme`, listens for changes |

## Seed-Derived Token System

10 seed colors + 6 personality traits are algorithmically expanded into **280+ CSS custom properties** by `src/css/derive.js`. No manual color definitions needed — everything is computed.

**Seed colors:** primary, accent, tertiary, neutral, success, warning, error, info, bg, bgDark
**Personality traits:** radius (sharp/rounded/pill), elevation (flat/subtle/raised/glass/brutalist), motion (instant/snappy/smooth/bouncy), borders (none/thin/bold), density (compact/comfortable/spacious), gradient (none/subtle/vivid/mesh)

## Custom Styles

```javascript
registerStyle({
  id: 'my-style',
  name: 'My Style',
  seed: { primary: '#6366f1', accent: '#ec4899', bg: '#ffffff', bgDark: '#0a0a0a' },
  personality: { radius: 'pill', elevation: 'glass', motion: 'bouncy', borders: 'none' },
  typography: { '--d-fw-heading': '800' },  // optional overrides
  overrides: { light: {}, dark: {} },       // optional per-mode token overrides
  components: '',                            // optional component CSS (array of CSS rule strings or joined string)
  // Component CSS overrides let styles transform standard components:
  // e.g., command-center overrides .d-card → cc-frame aesthetic,
  //        .d-statistic → cc-glow + cc-data, .d-table-wrap → cc-scanline
  // This is the primary mechanism for recipe visual transforms.
});
```

## Shape API

Shapes control border-radius personality independently from the style. Available shapes: `sharp`, `rounded`, `pill`.

```javascript
setShape('pill');   // All components use pill radius
getShape();         // 'pill'
getShapeList();     // ['sharp', 'rounded', 'pill']
```

Shapes override the style's default radius. The command-center style defaults to `sharp`; glassmorphism defaults to `pill`.

## Colorblind Mode

Colorblind mode is an orthogonal axis alongside style, mode, and shape: `Style x Mode x Shape x ColorblindMode`.

```javascript
setColorblindMode('protanopia');  // Red-green CVD safety
setColorblindMode('deuteranopia'); // Red-green CVD safety (same shifts)
setColorblindMode('tritanopia');   // Blue-yellow CVD safety
setColorblindMode('off');          // Default (no transformation)
getColorblindMode();               // Signal getter
```

**Architecture:** Seeds are transformed BEFORE `derive()` processes them, so all derived tokens (hover, active, subtle, border, chart, gradient) automatically adapt. Chart tokens are replaced with Wong/Okabe-Ito adapted palettes for maximum CVD safety.

**Seed shifts (protanopia/deuteranopia):** error red -> magenta (OKLCH H ~345), success green -> teal (OKLCH H ~190). Primary/accent/tertiary shifted if in red or green hue zones.

**Seed shifts (tritanopia):** info blue -> teal (OKLCH H ~170), warning yellow -> orange (OKLCH H ~50). Primary shifted if in blue hue zone.

`resetStyles()` resets colorblind mode to `'off'`. See `reference/color-guidelines.md` for full documentation.

## OKLCH Color Space

All color math in `derive.js` uses **OKLCH** (perceptually uniform color space) instead of HSL. This means:
- `lighten(hex, amount)` and `darken(hex, amount)` adjust the OKLCH L channel
- `mixColors(hex1, hex2, weight)` interpolates in OKLCH space with short-arc hue blending
- `rotateHue(hex, degrees)` rotates the OKLCH H channel
- Hover states look more consistent across all 7 palette roles (same perceived brightness shift regardless of hue)
- `adjustForContrast()` converges faster due to perceptual uniformity

Internal exports for testing/advanced use: `rgbToOklch(r,g,b)`, `oklchToRgb(L,C,H)`, `gamutMap(L,C,H)`.

## Monochrome Palette

The `palette: 'monochrome'` personality trait (used by command-center) constrains **decorative** role colors (accent, tertiary, info) within ±20° of the primary hue. **Semantic** roles (success, warning, error) retain their standard hues (green, amber, red) so that trend indicators, status badges, and alerts have correct color meaning even in monochrome mode. WCAG AA validated via `validateContrast()`.

## Animation System

Decantr provides built-in animations for all overlay/dialog lifecycle transitions:

**Entry animations** (CSS keyframes, automatic):
- Modal panel: `d-scalein` (scale 0.95→1 + fade)
- Drawer panel: `d-slidein-l/r/t/b` (directional slide + fade)
- Popover, Dropdown, Select, Combobox, ContextMenu: `d-scalein` (scale + fade)
- Tooltip: `d-fadein` (fade only)
- Tab panel: `d-fadein` on switch
- Toast: `d-slidein-t` (slide down)

**Exit animations** (automatic on close):
- Modal: `d-scaleout` (reverse scale + fade) before `dialog.close()`
- Drawer: `d-slideout-l/r/t/b` (reverse directional slide) before `dialog.close()`
- Overlay types (Dropdown, Select, etc.): `d-overlay-exit` class applied during close timeout

**Stagger animations** (opt-in via CSS classes):
- `d-stagger` — children fade in sequentially (50ms delay per child)
- `d-stagger-up` — children slide up sequentially
- `d-stagger-scale` — children scale in sequentially

**Statistic count-up** (opt-in via `animate` prop):
- `Statistic({ value: 12480, animate: true })` — counts from 0 with easeOutExpo
- `Statistic({ value: 12480, animate: 2000 })` — custom duration in ms

**Toast progress bar** — visual countdown automatically added when `duration > 0`.

**Tab indicator** — sliding underline animates between tabs via CSS transitions.

All animations respect `prefers-reduced-motion: reduce` media query.

## Backward Compatibility

`setTheme()`, `getTheme()`, `registerTheme()` are backward-compatible wrappers around the Style+Mode API. Legacy `--c0`–`--c9` color variables and `_fg0`–`_fg9` atoms have been removed — use semantic atoms (`_fgfg`, `_fgmutedfg`, `_fgprimary`, etc.) instead.

## Build-Time Style Elimination

At build time, unused style modules are automatically detected and removed from the bundle. The build pipeline scans user code for `setStyle()` and `setTheme()` calls, and checks `decantr.essence.json` and `decantr.config.json` for style references. Only the default style (auradecantism) and explicitly referenced styles are shipped. For a default app using only auradecantism, this eliminates 4 unused styles and saves ~17 KB raw.

See `reference/build-tooling.md` for full details on the detection and elimination pipeline.

## Key Files

- `src/css/derive.js` — Color math, personality presets, main `derive()` function
- `src/css/styles/auradecantism.js` / `clean.js` / `retro.js` / `glassmorphism.js` / `command-center.js` — Style definitions
- `src/css/theme-registry.js` — State management, DOM injection, public API
- `src/css/index.js` — Public CSS module exports

---


---

# Design Token Reference (Full)


# Design Token Reference

Components use a two-layer CSS system: base CSS (`_base.js`) for structure, style CSS (`styles/*.js` + `derive.js`) for visual identity. Component CSS is organized as a keyed object (`componentCSSMap` in `src/css/components.js`) with 78 sections, enabling build-time pruning of unused component styles. The backward-compatible `componentCSS` export (joined string) is maintained for runtime use. All spacing and typography references design tokens via `var()` with fallbacks.

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

## Field Sizing Tokens

> For tier selection logic and touch target rules, see `reference/spatial-guidelines.md` §7 Component Sizing.

Height-first, 4-tier sizing system for form components. `md` = density comfortable (zero regression).

| Tier | Height | Padding-Y | Padding-X | Font Size | Gap |
|------|--------|-----------|-----------|-----------|-----|
| **xs** | `--d-field-h-xs` (1.5rem/24px) | `--d-field-py-xs` (sp-1) | `--d-field-px-xs` (sp-2) | `--d-field-text-xs` (text-xs) | `--d-field-gap-xs` (sp-1) |
| **sm** | `--d-field-h-sm` (1.75rem/28px) | `--d-field-py-sm` (sp-1) | `--d-field-px-sm` (sp-2-5) | `--d-field-text-sm` (text-sm) | `--d-field-gap-sm` (sp-1-5) |
| **md** | `--d-field-h-md` (2.25rem/36px) | `--d-field-py-md` (sp-2) | `--d-field-px-md` (sp-4) | `--d-field-text-md` (text-base) | `--d-field-gap-md` (sp-2) |
| **lg** | `--d-field-h-lg` (2.75rem/44px) | `--d-field-py-lg` (sp-2-5) | `--d-field-px-lg` (sp-6) | `--d-field-text-lg` (text-md) | `--d-field-gap-lg` (sp-2-5) |

**Density ↔ tier mapping:** compact → sm tokens, comfortable → md tokens, spacious → lg tokens.

**Switch dimension tokens per tier:**

| Tier | Width | Height | Thumb |
|------|-------|--------|-------|
| xs | `--d-switch-w-xs` (1.5rem) | `--d-switch-h-xs` (0.875rem) | `--d-switch-thumb-xs` (0.625rem) |
| sm | `--d-switch-w-sm` (1.75rem) | `--d-switch-h-sm` (1rem) | `--d-switch-thumb-sm` (0.75rem) |
| md | `--d-switch-w` (2.5rem) | `--d-switch-h` (1.375rem) | `--d-switch-thumb` (1rem) |
| lg | `--d-switch-w-lg` (3.25rem) | `--d-switch-h-lg` (1.75rem) | `--d-switch-thumb-lg` (1.25rem) |

**Checkbox/Radio dimension tokens:**

| Tier | Size |
|------|------|
| xs | `--d-checkbox-size-xs` (0.875rem/14px) |
| sm | `--d-checkbox-size-sm` (1rem/16px) |
| md | `--d-checkbox-size` (1.125rem/18px) |
| lg | `--d-checkbox-size-lg` (1.375rem/22px) |

**OTP slot tokens:**

| Tier | Width | Height | Font |
|------|-------|--------|------|
| sm | `--d-otp-w-sm` (2rem) | `--d-otp-h-sm` (2rem) | `--d-otp-text-sm` (text-base) |
| md | `--d-otp-w` (2.5rem) | `--d-otp-h` (2.5rem) | `--d-otp-text` (text-lg) |
| lg | `--d-otp-w-lg` (3rem) | `--d-otp-h-lg` (3rem) | `--d-otp-text-lg` (text-xl) |

**Style-specific token overrides (retro):**

| Token | clean (default) | retro |
|-------|----------------|-------|
| `--d-fw-heading` | 700 | 800 |
| `--d-fw-title` | 600 | 800 |
| `--d-fw-medium` | 500 | 700 |
| `--d-ls-heading` | -0.025em | 0.05em |

## Component Anatomy Tokens

Fixed dimensions for component internals. These centralize magic numbers and allow density/style overrides.

| Token | Default | Component |
|-------|---------|-----------|
| `--d-avatar-size-sm` | 24px | Avatar small |
| `--d-avatar-size` | 36px | Avatar default |
| `--d-avatar-size-lg` | 48px | Avatar large |
| `--d-avatar-size-xl` | 64px | Avatar extra-large |
| `--d-spinner-size-xs` | 12px | Spinner extra-small |
| `--d-spinner-size-sm` | 16px | Spinner small |
| `--d-spinner-size-lg` | 28px | Spinner large |
| `--d-spinner-size-xl` | 36px | Spinner extra-large |
| `--d-progress-h` | 8px | Progress bar default height |
| `--d-progress-h-sm` | 4px | Progress bar small |
| `--d-progress-h-md` | 16px | Progress bar medium |
| `--d-progress-h-lg` | 24px | Progress bar large |
| `--d-slider-thumb` | 18px | Slider thumb diameter |
| `--d-slider-track-h` | 6px | Slider/RangeSlider track height |
| `--d-badge-dot` | 8px | Badge dot diameter |
| `--d-carousel-dot` | 8px | Carousel indicator dot diameter |
| `--d-float-btn-size` | 48px | Float button diameter |
| `--d-backtop-size` | 40px | Back-to-top button diameter |
| `--d-step-icon-size` | 2rem | Step/stepper icon diameter |
| `--d-colorpicker-swatch` | 24px | Color swatch preview |
| `--d-colorpicker-thumb` | 14px | Picker cursor thumb |
| `--d-colorpicker-preset` | 20px | Preset color swatch |
| `--d-colorpicker-sat-h` | 150px | Saturation panel height |
| `--d-colorpicker-bar-h` | 12px | Hue/alpha bar height |
| `--d-timeline-dot` | 10px | Timeline dot diameter |
| `--d-timeline-dot-lg` | 24px | Timeline large dot |
| `--d-timeline-sm-dot` | 8px | Timeline small-size dot |
| `--d-timeline-sm-dot-lg` | 20px | Timeline small-size large dot |
| `--d-timeline-lg-dot` | 32px | Timeline large-size dot |
| `--d-timeline-lg-dot-lg` | 40px | Timeline large-size large dot |
| `--d-timeline-line-w` | 2px | Timeline connector line width |
| `--d-rangeslider-thumb` | 16px | Range slider thumb diameter |
| `--d-slide-distance` | 8px | Slide-in/out animation distance |

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

## Chrome Tokens

Inverted chrome for header/sidebar navigation. In light mode, chrome is dark (tinted toward primary) for anchoring; in dark mode, chrome blends with the surface hierarchy.

| Token | Light Mode | Dark Mode | Description |
|-------|-----------|-----------|-------------|
| `--d-chrome-bg` | Dark (bgDark + 12% primary) | lighten(bg, 4) | Chrome background |
| `--d-chrome-fg` | Auto (white on dark) | `#fafafa` | Chrome foreground |
| `--d-chrome-border` | lighten(chromeBg, 10) | lighten(bg, 12) | Chrome border |
| `--d-chrome-muted` | lighten(chromeBg, 30) | lighten(neutral, 15) | Muted text in chrome |
| `--d-chrome-hover` | lighten(chromeBg, 6) | lighten(chromeBg, 6) | Chrome hover state |
| `--d-chrome-active` | lighten(chromeBg, 12) | lighten(chromeBg, 10) | Chrome active state |

**Usage:** Apply `--d-chrome-bg` + `--d-chrome-fg` to sidebar/header containers. Use `--d-chrome-hover`/`--d-chrome-active` for nav item states.

## Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--d-z-dropdown` | 1000 | Select, combobox, datepicker, cascader, dropdown, menu |
| `--d-z-sticky` | 1100 | Affix, float button |
| `--d-z-modal` | 1200 | Modal, drawer, image overlay, tour |
| `--d-z-popover` | 1300 | Popover, popconfirm, context menu, hovercard |
| `--d-z-toast` | 1400 | Toast, notification, message containers |
| `--d-z-tooltip` | 1500 | Tooltip |

## Interaction Tokens

`--d-hover-translate`, `--d-hover-shadow`, `--d-hover-brightness`, `--d-active-scale`, `--d-active-translate`, `--d-active-shadow`, `--d-focus-ring-width`, `--d-focus-ring-color`, `--d-focus-ring-offset`, `--d-focus-ring-style`, `--d-selection-bg`, `--d-selection-fg`

## Motion Tokens

`--d-duration-instant`, `--d-duration-fast`, `--d-duration-normal`, `--d-duration-slow`, `--d-duration-spin`, `--d-easing-standard`, `--d-easing-decelerate`, `--d-easing-accelerate`, `--d-easing-bounce`

| Token | instant | snappy | smooth | bouncy |
|-------|---------|--------|--------|--------|
| `--d-duration-spin` | 200ms | 500ms | 850ms | 1000ms |

Spinner variants use `calc(var(--d-duration-spin) * N)` for staggered timings (dots ×1.6, bars ×1.4, pulse/orbit ×1.8).

## Gradient Tokens

`--d-gradient-brand`, `--d-gradient-brand-alt`, `--d-gradient-brand-full`, `--d-gradient-surface`, `--d-gradient-overlay`, `--d-gradient-subtle`, `--d-gradient-text`, `--d-gradient-text-alt`, `--d-gradient-angle`, `--d-gradient-intensity`

## Chart Tokens

| Token Pattern | Count | Description |
|---|---|---|
| `--d-chart-{0-7}` | 8 | Base chart palette (resolved hex for SVG/canvas compat) |
| `--d-chart-{0-7}-ext-1` | 8 | Extended: lightness-shifted variation |
| `--d-chart-{0-7}-ext-2` | 8 | Extended: hue-rotated +30 variation |
| `--d-chart-{0-7}-ext-3` | 8 | Extended: hue-rotated -30 + lightness variation |
| `--d-chart-tooltip-bg` | 1 | Chart tooltip background (= surface-2) |
| `--d-chart-grid` | 1 | Grid lines (mode-aware alpha) |
| `--d-chart-axis` | 1 | Axis lines (mode-aware alpha) |
| `--d-chart-crosshair` | 1 | Crosshair indicator (mode-aware alpha) |
| `--d-chart-selection` | 1 | Selection highlight (primary @ 15% alpha) |

When colorblind mode is active (`setColorblindMode()`), `--d-chart-{0-7}` are replaced with Wong/Okabe-Ito adapted palettes. Extended tokens are re-derived from the CVD-safe base.

All color derivation uses **OKLCH** (perceptually uniform color space). See `reference/color-guidelines.md` §13 and `reference/style-system.md`.

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

## Composition Guidelines

- **External layout** — Use atomic CSS (`_gap4`, `_grid _gc3`, `_p6`) for spacing between components
- **Internal spacing** — Components handle their own padding via `--d-pad` token; don't add padding inside Card/Modal wrappers
- **Theme overrides** — Only add padding in theme CSS when it intentionally differs from base (e.g. retro's accordion/tabs)
- **Token-backed atoms** — Use `_textbase`, `_fwheading`, `_lhnormal` etc. in component and pattern code for theme-customizable typography (see `reference/atoms.md`)

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

## Field Tokens

Unified visual system for all form field containers. Applied via `.d-field` base class.

| Token | Default | Description |
|-------|---------|-------------|
| `--d-field-bg` | `var(--d-bg)` | Field background (outlined default) |
| `--d-field-bg-hover` | Surface shift | Background on hover |
| `--d-field-bg-disabled` | alpha(fg, 0.05) | Disabled field background |
| `--d-field-bg-readonly` | alpha(fg, 0.03) | Read-only field background |
| `--d-field-border` | `var(--d-border)` | Default border color |
| `--d-field-border-hover` | `var(--d-border-strong)` | Border on hover |
| `--d-field-border-focus` | `var(--d-primary)` | Border on focus-within |
| `--d-field-border-error` | `var(--d-error)` | Border for error state |
| `--d-field-border-success` | `var(--d-success)` | Border for success state |
| `--d-field-border-disabled` | alpha(border, 0.5) | Disabled border |
| `--d-field-bg-error` | alpha(error, 0.06) | Error state background tint |
| `--d-field-bg-success` | alpha(success, 0.06) | Success state background tint |
| `--d-field-border-width` | `var(--d-border-width)` | Field border width |
| `--d-field-ring` | Focus shadow | Focus ring (box-shadow) |
| `--d-field-ring-error` | Error focus shadow | Error focus ring |
| `--d-field-ring-success` | Success focus shadow | Success focus ring |
| `--d-field-radius` | `var(--d-radius)` | Field border radius |
| `--d-field-placeholder` | `var(--d-muted)` | Placeholder text color |

### Variants

| Class | Effect |
|-------|--------|
| `.d-field-outlined` | Default — transparent bg, visible border |
| `.d-field-filled` | Surface bg, transparent border |
| `.d-field-ghost` | Transparent bg + border, shows border on focus |

### State Matrix

| State | Background | Border | Shadow |
|-------|-----------|--------|--------|
| Default | `--d-field-bg` | `--d-field-border` | none |
| Hover | `--d-field-bg-hover` | `--d-field-border-hover` | none |
| Focus | `--d-field-bg` | `--d-field-border-focus` | `--d-field-ring` |
| Error | `--d-field-bg-error` | `--d-field-border-error` | none |
| Error+Focus | `--d-field-bg-error` | `--d-field-border-error` | `--d-field-ring-error` |
| Success | `--d-field-bg-success` | `--d-field-border-success` | none |
| Disabled | `--d-field-bg-disabled` | `--d-field-border-disabled` | none |
| Readonly | `--d-field-bg-readonly` | `--d-field-border` | none |

## Interactive State Tokens

Semantic tokens for item hover, selection, and disabled states.

| Token | Default | Description |
|-------|---------|-------------|
| `--d-item-hover-bg` | `var(--d-surface-1)` / glass alpha | Hover background for list items, options, rows |
| `--d-item-active-bg` | `var(--d-primary-subtle)` | Active/pressed item background |
| `--d-selected-bg` | `var(--d-primary-subtle)` | Selected item background |
| `--d-selected-fg` | `var(--d-primary)` | Selected item text color |
| `--d-selected-border` | `var(--d-primary-border)` | Selected item border |
| `--d-disabled-opacity` | `0.5` | Primary disabled opacity |
| `--d-disabled-opacity-soft` | `0.35` | Secondary disabled opacity (steppers, pagination) |
| `--d-icon-muted` | `0.55` | Opacity for close buttons, clear icons, prefix/suffix |
| `--d-icon-subtle` | `0.35` | Opacity for very subtle elements (out-of-range dates, hidden sort) |

### Migration Guide

| Old Pattern | New Token |
|-------------|-----------|
| `opacity:0.5` on disabled | `var(--d-disabled-opacity)` |
| `opacity:0.3` on soft disabled | `var(--d-disabled-opacity-soft)` |
| `opacity:0.6` on close/clear icons | `var(--d-icon-muted)` |
| `opacity:0.4` on sort/pagination | `var(--d-disabled-opacity-soft)` |
| `background:var(--d-surface-1)` on hover | `var(--d-item-hover-bg)` |
| `background:var(--d-primary-subtle)` on selected | `var(--d-selected-bg)` |

## Overlay Tokens

Three overlay intensity levels for modal backdrops and scrims.

| Token | Dark | Light | Description |
|-------|------|-------|-------------|
| `--d-overlay` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.5)` | Standard overlay (existing) |
| `--d-overlay-light` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.2)` | Light overlay for non-modal scrims |
| `--d-overlay-heavy` | `rgba(0,0,0,0.85)` | `rgba(0,0,0,0.7)` | Heavy overlay for image lightboxes |

## Table Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-table-stripe-bg` | alpha(fg, 0.02-0.03) | Striped row background |
| `--d-table-header-bg` | `var(--d-surface-1)` | Table header background |
| `--d-table-hover-bg` | `var(--d-item-hover-bg)` | Row hover background |
| `--d-table-selected-bg` | `var(--d-selected-bg)` | Selected row background |

## Scrollbar Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-scrollbar-w` | `8px` | Scrollbar width/height |
| `--d-scrollbar-track` | `transparent` | Track background |
| `--d-scrollbar-thumb` | `var(--d-border)` | Thumb color |
| `--d-scrollbar-thumb-hover` | `var(--d-border-strong)` | Thumb hover color |

## Skeleton Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-skeleton-bg` | `var(--d-muted)` | Skeleton element background |
| `--d-skeleton-shine` | Gradient | Shimmer animation gradient |

## Layout Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-prose-width` | `75ch` | Optimal reading line length |
| `--d-content-width-prose` | `75ch` | Content area max-width for prose |
| `--d-content-width-standard` | `960px` | Standard content area max-width |
| `--d-sidebar-width-sm` | `220px` | Small sidebar width |
| `--d-sidebar-width` | `260px` | Default sidebar width |
| `--d-sidebar-width-lg` | `320px` | Large sidebar width |
| `--d-drawer-width` | `360px` | Drawer panel width |
| `--d-drawer-bottom-max-h` | `85vh` | Bottom drawer max-height |

## Chart UI Tokens

Extends the existing chart section with UI tokens.

| Token | Default | Description |
|-------|---------|-------------|
| `--d-chart-tooltip-shadow` | Mode-aware shadow | Tooltip box-shadow |
| `--d-chart-axis-opacity` | `0.3` | Axis line opacity |
| `--d-chart-grid-opacity` | `0.06`/`0.08` | Grid line opacity (light/dark) |
| `--d-chart-legend-gap` | `var(--d-sp-3)` | Gap between legend items |

## Glass Blur Tokens

| Token | Value | Description |
|-------|-------|-------------|
| `--d-glass-blur-sm` | `blur(8px)` | Light glass effect |
| `--d-glass-blur` | `blur(16px)` | Standard glass effect |
| `--d-glass-blur-lg` | `blur(24px)` | Heavy glass effect |

## Semantic Motion Tokens

Semantic shorthand tokens for common transition patterns.

| Token | Value | Description |
|-------|-------|-------------|
| `--d-motion-enter` | `var(--d-duration-normal) var(--d-easing-decelerate)` | Enter/appear transition |
| `--d-motion-exit` | `var(--d-duration-fast) var(--d-easing-accelerate)` | Exit/disappear transition |
| `--d-motion-state` | `var(--d-duration-fast) var(--d-easing-standard)` | State change transition |

---


---



## Recipe Index

### recipe-auradecantism
**Setup:** `import { setStyle, setMode } from 'decantr/css';
setStyle('auradecantism');
setMode('dark');`
**Decorators (10):** d-mesh, d-glass, d-glass-strong, d-gradient-text, d-gradient-text-alt, aura-glow, aura-glow-strong, aura-ring, aura-orb, aura-shimmer
**Compositions:** panel, card, kpi, table, form, sidebar, layout, alert, modal, chart

### recipe-clay
**Setup:** `import { registerStyle, setStyle, setMode } from 'decantr/css';
import { clay } from 'decantr/styles/community/clay';
registerStyle(clay);
setStyle('clay');
setMode('light');`
**Decorators (14):** cy-pillow, cy-pillow-strong, cy-squish, cy-float, cy-blob, cy-soft, cy-dimple, cy-bounce, cy-jelly, cy-pastel-mesh, cy-label, cy-swatch, cy-glow, cy-pulse-soft
**Pattern overrides:** hero, card-grid, specimen-grid, filter-bar, search-bar, cta-section, detail-header, testimonials, stats-section, comparison-panel, footer-columns
**Compositions:** panel, card, kpi, sidebar, specimen, workspace

### recipe-clean
**Setup:** `import { setStyle, setMode } from 'decantr/css';
setStyle('clean');
setMode('light');`
**Decorators (6):** cl-card, cl-divider, cl-section, cl-muted-bg, cl-badge-dot, cl-subtle-hover
**Compositions:** panel, card, kpi, table, form, sidebar, layout, alert, modal, chart

### recipe-command-center
**Setup:** `import { setStyle, setMode } from 'decantr/css';
setStyle('command-center');
setMode('dark');`
**Decorators (19):** cc-frame, cc-frame-sm, cc-corner, cc-scanline, cc-grid, cc-bar, cc-bar-bottom, cc-blink, cc-glow, cc-glow-strong, cc-glow-pulse, cc-divider, cc-label, cc-data, cc-indicator, cc-indicator-ok, cc-indicator-warn, cc-indicator-error, cc-mesh
**Pattern overrides:** kpi-grid, chart-grid, data-table, activity-feed, scorecard, pipeline-tracker, timeline, goal-tracker, comparison-panel
**Compositions:** panel, card, kpi, table, form, sidebar, layout, alert, modal, chart

### recipe-gaming-guild
**Setup:** `import { registerStyle, setStyle, setMode } from 'decantr/css';
import { gamingGuild } from 'decantr/styles/community/gaming-guild';
registerStyle(gamingGuild);
setStyle('gaming-guild');
setMode('dark');`
**Decorators (14):** gg-glow, gg-glow-accent, gg-glow-strong, gg-glow-pulse, gg-shimmer, gg-rank-up, gg-float, gg-xp-bar, gg-badge-pop, gg-mesh, gg-panel, gg-label, gg-data, gg-live
**Pattern overrides:** hero, card-grid, leaderboard, kpi-grid, post-list, activity-feed, detail-header, stats-bar, timeline, cta-section, form-sections, auth-form, testimonials
**Compositions:** panel, card, kpi, table, leaderboard, profile-card, sidebar, auth-modal, achievement



---

# Community Styles via Registry


Beyond built-in styles, community styles can be discovered and installed:
- `decantr registry search --type=style <query>` — find community styles
- `decantr registry add style/<name>` — install to `src/css/styles/community/`
- Installed styles auto-register via `registerStyle()` and become available to `setStyle()`
- Use `decantr registry list` to see installed community content