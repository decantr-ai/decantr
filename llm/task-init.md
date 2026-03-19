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

### Character-to-Clarity Priority Table

When character traits span multiple clusters, the higher-priority (lower number) cluster determines the base density. Recipe `spatial_hints.density_bias` can then shift it.

| Priority | Cluster | Matching Traits | Base Density |
|----------|---------|-----------------|--------------|
| 1 (highest) | Compact | tactical, dense, data-dense, technical, utilitarian | compact |
| 2 | Editorial | editorial, luxurious, premium | spacious |
| 3 | Expressive | playful, bouncy, fluffy, immersive, cinematic, dramatic | comfortable |
| 4 | Spacious | minimal, clean, elegant | spacious |
| 5 | Balanced | professional, modern, friendly | comfortable |
| 6 (default) | Comfortable | (no match) | comfortable |

Rationale: functional density constraints (compact/dense) are hardest to violate without breaking usability, so they take precedence. Aesthetic intent (editorial, expressive) comes next.

### Composable Clarity Ranges

Each cluster defines a **range** rather than exact values. The LLM selects within the range based on recipe `spatial_hints` overlay and user `clarity` override in the Essence.

| Character Cluster | Density Range | Content Gap Range | Section Pad Range | Chrome Gap | Animation |
|---|---|---|---|---|---|
| Compact | Compact | `_gap2`–`_gap4` | `_py4`–`_py8` | `_gap1` | Snappy (`d-stagger-scale`) |
| Editorial | Comfortable–Spacious | `_gap6`–`_gap8` | `_py16`–`_py24` | `_gap2` | Graceful (`d-stagger`) |
| Expressive | Comfortable | `_gap5`–`_gap6` | `_py10`–`_py16` | `_gap2` | Bouncy / dramatic |
| Spacious | Comfortable–Spacious | `_gap5`–`_gap8` | `_py12`–`_py24` | `_gap2` | Subtle fades (`d-stagger`) |
| Balanced | Comfortable | `_gap4`–`_gap6` | `_py8`–`_py12` | `_gap2` | Standard (`d-stagger-up`) |
| Default (no match) | Comfortable | `_gap4`–`_gap6` | `_py8`–`_py12` | `_gap2` | Standard (`d-stagger-up`) |

### Resolution Order

1. **Character baseline** — select cluster from priority table, pick middle of range
2. **Recipe spatial_hints overlay** — `content_gap_shift` shifts the gap ±steps, `density_bias` shifts density level, `section_padding` overrides pad
3. **User clarity override in Essence** — optional `"clarity": { "density": "spacious", "content_gap": "_gap6" }` in essence

### Essence clarity Field (Optional)

```json
"clarity": { "density": "spacious", "content_gap": "_gap6" }
```

When present in the Essence, this field overrides both the character-derived baseline and the recipe overlay. Use when the user has a specific spatial preference that doesn't match their character traits.

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
POUR → TASTE → SETTLE → CLARIFY → DECANT → SERVE → AGE
```

| Stage | Purpose |
|-------|---------|
| **POUR** | User expresses intent in natural language |
| **TASTE** | Interpret intent → produce Impression (vibe, references, density, layout, novel elements) |
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
  "vintage": { "style": "auradecantism", "mode": "dark", "recipe": "auradecantism", "shape": "rounded" },
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

# Task: Create a New Decantr Project


> Read this file when scaffolding a new project from scratch. Covers the full Decantation Process, all archetypes, styles, recipes, and skeleton templates.



---

# Cork Rules (Creative Tier)


Cork enforcement: **Creative** — rules are advisory for initial scaffolding.

Before writing code, read `decantr.essence.json` if it exists. During initial scaffolding (POUR → TASTE → SETTLE → CLARIFY → DECANT → SERVE):
1. **Style**: Start from the Vintage. May explore adjacent styles if user intent suggests it.
2. **Structure**: Build from scratch. Archetype pages are suggestions, not requirements.
3. **Blend**: Archetype default_blend is a starting point. Reorder, add columns, change breakpoints to match the Impression.
4. **Recipe**: Recipe compositions show the target aesthetic. Adapt them, don't copy literally. Use `pattern_preferences.default_presets` as suggestions.
5. **Clarity**: Character traits suggest a density range, not exact atoms. Choose within the range from the Composable Clarity Ranges table.

After initial SERVE, cork.mode auto-sets to "maintenance" and strict rules apply.


---

# TASTE Stage — Intent Interpretation


Before SETTLE, produce a structured **Impression**:

| Field | Description |
|-------|-------------|
| **Vibe** | 1-3 adjective phrases ("airy minimalist with bold type") |
| **Reference signals** | Map user references to known recipes/styles ("like Notion" → clean) |
| **Density intent** | Spacious / balanced / compact |
| **Layout intent** | Sidebar dashboard / full-bleed / hybrid / novel |
| **Novel elements** | Anything not fitting existing patterns |

Store as `_impression` in Essence during CLARIFY:
```json
"_impression": {
  "vibe": ["airy", "minimalist"],
  "references": ["notion"],
  "density_intent": "comfortable",
  "layout_intent": "sidebar-main",
  "novel_elements": []
}
```

The Impression feeds SETTLE — use it to customize archetype defaults instead of copying them verbatim.

# The Decantation Process (Full)


# The Decantation Process

The intelligence layer between user intent and generated code. A formalized methodology that decomposes raw UI requirements into structured, drift-free specifications.

## The Seven Stages

```
POUR → TASTE → SETTLE → CLARIFY → DECANT → SERVE → AGE
```

### POUR (Intent Capture)
User expresses what they want in natural language. No forms, no wizards.

### TASTE (Intent Interpretation)
Before decomposing into layers, interpret the user's intent holistically. Produce a structured **Impression**:

| Impression Field | Description | Example |
|-----------------|-------------|---------|
| **Vibe** | 1-3 adjective phrases capturing the aesthetic feel | "airy minimalist with bold type" |
| **Reference signals** | Map user references to known recipes/styles | "like Notion" → clean recipe; "claymorphic" → bouncy, rounded |
| **Density intent** | Spacious / balanced / compact | "dense tactical cockpit" → compact |
| **Layout intent** | Sidebar dashboard / full-bleed marketing / hybrid / novel | "dashboard with wide content" → sidebar-main |
| **Novel elements** | Anything not fitting existing patterns | "kanban board with drag-drop" |

The Impression is stored as `_impression` in the Essence during CLARIFY:
```json
"_impression": {
  "vibe": ["airy", "minimalist", "bold typography"],
  "references": ["notion", "linear"],
  "density_intent": "comfortable",
  "layout_intent": "sidebar-main with wide content area",
  "novel_elements": ["kanban board with drag-drop"]
}
```

TASTE feeds SETTLE — instead of copying archetype defaults blindly, SETTLE starts from the Impression and uses archetypes to fill gaps. The Impression persists in the Essence for AGE-stage drift detection.

### SETTLE (Intent Decomposition)
The LLM decomposes intent into five named layers:

| Layer | Resolves | Registry Source |
|-------|----------|-----------------|
| **Terroir** | Domain archetype | `src/registry/archetypes/` |
| **Vintage** | Style + mode + recipe | `src/css/styles/` + `src/registry/recipe-*.json` |
| **Character** | Brand personality traits | User-defined (e.g. "tactical", "minimal") |
| **Structure** | Page/view map | Archetype `pages` + user customization |
| **Tannins** | Functional systems | Archetype `tannins` + user requirements |

**Archetype-as-Suggestion**: Read archetypes as **starting suggestions**, not templates. Use the Impression from TASTE to guide selection:
- Identify which pages the user actually needs — drop unused archetype pages, add new ones
- The archetype's `default_blend` is a **baseline** — customize based on user intent and recipe `pattern_preferences`
- Trait composition (`src/registry/architect/traits.json`) is the primary path for novel designs, not a fallback
- Each trait now provides `suggested_blend` options — use these for concrete layout alternatives

### CLARIFY (Essence Crystallization)
The LLM writes `decantr.essence.json` — the project's persistent DNA. User confirms. From this point, every decision references the Essence.

### Pattern Design Review Gate

**Mandatory checkpoint between CLARIFY and DECANT.** Enforcement varies by task context:

#### Creative Mode (task-init.md — new project scaffolding)
- Quick check: does an existing pattern+preset fit? (5-second check, not a gate)
- If no, create a **local pattern** in `src/patterns/{name}.json`
- Local patterns don't need cross-domain reuse justification
- Reference in blend: `{ "pattern": "local:pattern-name" }`

#### Guided Mode (task-page.md — adding pages)
- Check existing presets first
- If no fit, create a local pattern with brief justification
- Blend structure is enforced but new column arrangements are allowed

#### Strict Mode (task-refactor.md, task-component.md, etc.)
All 4 gates enforced:
1. **Can this be a preset on an existing pattern?** Check the pattern registry for structurally similar patterns with presets.
2. **Does a structurally similar pattern already exist?** Merge as a preset if layout, components, and slots match.
3. **Is the new pattern reusable across 2+ domains?** A pattern must be justified by cross-domain utility.
4. **Does the domain-specific name justify a standalone file?** Only when the structure is fundamentally different.

**If any strict-mode check fails**, refactor to use an existing pattern preset:
```json
{ "pattern": "stats-bar", "preset": "recipe", "as": "recipe-stats-bar" }
```

### DECANT (Spec Resolution)
Each Structure page resolves to a **Blend** — a row-based layout tree that specifies spatial arrangement of patterns. The archetype provides `default_blend` per page; the LLM copies it into the Essence's `blend` and customizes.

### SERVE (Code Generation)
Code generated from resolved Blend specs. The LLM reads each page's `blend` array and applies the SERVE algorithm (see Blend Spec below). No spatial improvisation — row order, column splits, and responsive breakpoints are all pre-specified.

#### Preset Resolution Order
When a blend item omits the preset, resolution follows this order (first non-null wins):
1. **Explicit in blend**: `{ "pattern": "card-grid", "preset": "compact" }` — always authoritative
2. **Recipe default_presets**: `recipe.pattern_preferences.default_presets["card-grid"]` — recipe's opinion
3. **Pattern default_preset**: `pattern.default_preset` field in the pattern JSON — pattern's own default
4. **No preset**: Use the pattern's base implementation

#### Recipe Spatial Hooks
Recipe `spatial_hints` influence generated code at generation time:
- `card_wrapping`: Controls whether patterns are wrapped in Card components ("always" / "minimal" / "none")
- `content_gap_shift`: Shifts the Clarity-derived gap up or down (e.g., +1 makes `_gap4` → `_gap5`)
- `section_padding`: Overrides Clarity section padding

#### Runtime vs Generation-Time Boundary

| Layer | Applied When | Runtime-Switchable? |
|-------|-------------|---------------------|
| Recipe spatial_hints | Generation time | No (baked into code) |
| Recipe skeleton decoration | Generation time | No (baked into code) |
| Recipe animation entrance | Generation time | No (baked into code) |
| `setStyle()` / `setMode()` | Runtime | Yes (CSS variable swap) |
| Density class (`.d-compact`) | Runtime | Yes (class toggle) |

For sectioned essences, resolve recipe per-section. Shell decoration follows the active section's recipe.

### AGE (Session Fortification)
On every subsequent prompt, the LLM reads the Essence first. New pages inherit the Vintage. Drift is detected and flagged.

---

## Vocabulary

### Project Identity

| Term | Definition |
|------|-----------|
| **Terroir** | Domain archetype. What kind of product this is. |
| **Vintage** | Visual identity — style + mode + recipe + shape. |
| **Character** | Brand personality as trait words. Guides density, tone, animation. |
| **Essence** | The persistent project DNA file (`decantr.essence.json`). |

### Architecture

| Term | Definition |
|------|-----------|
| **Vessel** | App container type + routing strategy (SPA/MPA, hash/history). |
| **Structure** | Page/view map — all screens in the app. |
| **Skeleton** | Layout type per page (sidebar-main, top-nav-main, full-bleed, centered). |

### Composition

| Term | Definition |
|------|-----------|
| **Blend** | Per-page spatial arrangement — a row-based layout tree specifying pattern order, column splits, and responsive breakpoints. |
| **Recipe** | Visual language composition rules — how standard components are wrapped/decorated differently. |
| **Plumbing** | State signals, stores, and data flows for the page. |
| **Pattern** | Reusable UI building block (kpi-grid, data-table, wizard, etc.) referenced by archetypes. |

### Visual Surface

| Term | Definition |
|------|-----------|
| **Bouquet** | Colors — palette tokens from `derive()` using OKLCH color math. Character traits map to palette personality (minimal->low chroma, bold->high chroma, professional->cool blue, technical->monochrome). See `reference/color-guidelines.md` §13. |
| **Body** | Typography — font, weight, spacing from style definition. |
| **Finish** | Motion + interaction — durations, easing from personality traits. |
| **Clarity** | White space — density, compound spacing from density trait. The Clarity layer is fully specified in `reference/spatial-guidelines.md` §17 Clarity Profile. |

### Drift Prevention

| Term | Definition |
|------|-----------|
| **Cork** | Validation constraints derived from the Essence. |
| **Tasting Notes** | Append-only changelog of decisions and iterations. |

---

## The Essence File

Location: `decantr.essence.json` (project root, generated during CLARIFY stage).

```json
{
  "$schema": "https://decantr.ai/schemas/essence.v1.json",
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": {
    "style": "auradecantism",
    "mode": "dark",
    "recipe": "auradecantism",
    "shape": "rounded"
  },
  "character": ["professional", "data-rich"],
  "vessel": {
    "type": "spa",
    "routing": "hash"
  },
  "structure": [
    {
      "id": "overview",
      "skeleton": "sidebar-main",
      "surface": "_flex _col _gap4 _p4 _overflow[auto] _flex1",
      "blend": [
        "kpi-grid",
        "data-table",
        { "cols": ["activity-feed", "chart-grid"], "at": "lg" }
      ]
    },
    {
      "id": "alerts",
      "skeleton": "sidebar-main",
      "blend": [
        "filter-sidebar",
        "data-table",
        "detail-panel"
      ]
    }
  ],
  "tannins": ["auth", "realtime-data", "notifications"],
  "cork": {
    "enforce_style": true,
    "enforce_recipe": true,
    "allowed_custom_css": false
  }
}
```

### Essence Version Field

The `version` field (string, semver format e.g. `"1.0.0"`) tracks the evolution of the Essence. It is optional but strongly recommended:

- **Bump the patch** (`1.0.0` -> `1.0.1`) when adding pages, tannins, or adjusting blend details
- **Bump the minor** (`1.0.0` -> `1.1.0`) when changing structure layout, adding sections, or swapping recipes
- **Bump the major** (`1.0.0` -> `2.0.0`) when changing terroir, vintage style, or fundamentally altering the project identity

The `validate` command will warn if no `version` field is present to encourage adoption.

### Sectioned Essence (Multi-Domain)

For applications spanning multiple domains, the Essence supports a sectioned format. Instead of a single `terroir`, the Essence defines `sections` — each with its own terroir, vintage, structure, and tannins.

**Detection**: If `sections` array exists → sectioned mode. If `terroir` exists → simple mode.

**Simple format** (single-domain — backward compatible):
```json
{
  "terroir": "saas-dashboard",
  "vintage": { "style": "auradecantism", "mode": "dark", "recipe": "auradecantism", "shape": "rounded" },
  "character": ["professional", "data-rich"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [...],
  "tannins": ["auth", "realtime-data"],
  "cork": { "enforce_style": true }
}
```

**Sectioned format** (multi-domain):
```json
{
  "vessel": { "type": "spa", "routing": "hash" },
  "character": ["professional", "technical"],
  "sections": [
    {
      "id": "brand",
      "path": "/",
      "terroir": "portfolio",
      "vintage": { "style": "glassmorphism", "mode": "dark" },
      "structure": [
        { "id": "home", "skeleton": "full-bleed", "blend": ["hero", "cta-section"] },
        { "id": "about", "skeleton": "top-nav-main", "blend": ["detail-header", "timeline"] }
      ],
      "tannins": ["analytics"]
    },
    {
      "id": "docs",
      "path": "/docs",
      "terroir": "content-site",
      "vintage": { "style": "clean", "mode": "light" },
      "structure": [
        { "id": "home", "skeleton": "sidebar-main", "blend": ["category-nav", "post-list"] },
        { "id": "article", "skeleton": "sidebar-main", "blend": ["article-content", "table-of-contents"] }
      ],
      "tannins": ["search", "content-state"]
    }
  ],
  "shared_tannins": ["auth"],
  "cork": { "enforce_style": true, "enforce_sections": true }
}
```

**Sectioned rules:**
- `vessel` and `character` are project-wide (shared across sections)
- Each section has its own `terroir`, `vintage`, `structure`, and `tannins`
- `shared_tannins` are available to all sections (auth, analytics, etc.)
- Section-level tannins MUST NOT duplicate shared_tannins
- Section `path` values define the URL namespace boundary
- During SERVE, the LLM generates a `beforeEach` router guard that switches style/mode per section

---

## Archetypes

Location: `src/registry/archetypes/`

Each archetype pre-maps domain knowledge for a type of application:
- **Pages**: Typical views with their skeleton layouts and patterns
- **Tannins**: Common functional systems (auth, search, payments, etc.)
- **Skeletons**: Layout descriptions per page type
- **Suggested Vintage**: Recommended styles and modes for the domain

Available archetypes: `ecommerce`, `saas-dashboard`, `portfolio`, `content-site`, `docs-explorer`, `financial-dashboard`, `recipe-community`

The LLM reads the archetype, gets 80% of the Structure for free, then customizes based on user requirements.

---

## Patterns

Location: `src/registry/patterns/`

Composable building blocks that archetypes reference. Each pattern describes:
- **Components**: Which Decantr components are used
- **Default Blend**: Layout, atoms, and slot descriptions
- **Recipe-Agnostic**: Patterns contain no recipe knowledge. Visual transforms happen via style CSS overrides on standard components (Card, Statistic, DataTable). Extra decorative classes (backgrounds) come from the recipe JSON's `pattern_overrides` section.

Patterns resolve to concrete component compositions during the DECANT stage.

### Pattern Preset Checklist

Before creating a new pattern file, check if it can be a preset on an existing pattern:

| Pattern | Available Presets |
|---------|------------------|
| `hero` | `landing`, `image-overlay`, `image-overlay-compact` |
| `card-grid` | `product`, `content`, `collection`, `icon` |
| `form-sections` | `settings`, `creation`, `structured` |
| `detail-header` | `standard`, `profile` |

If the desired variation shares the same grid layout, component set, and slot structure as an existing pattern but differs only in content slots, label placement, or density, add a preset instead of a new pattern file. Reference presets in blend specs:
```json
{ "pattern": "card-grid", "preset": "product", "as": "product-grid" }
```

---

## Recipes

Location: `src/registry/recipe-*.json`

Visual language composition rules for drastic visual transformations that go beyond token-level styling. A recipe describes:
- **Style**: Which Decantr style to activate
- **Decorators**: Available CSS classes (e.g., `cc-frame`, `cc-bar`)
- **Compositions**: Per-component examples showing how to compose standard components differently

Available recipes: `auradecantism`

---

## Cork Rules (Anti-Drift)

### Visual Drift → Vintage Lock
The Essence records the Vintage. The LLM applies recipe composition rules consistently.

### Architectural Drift → Structure Lock
New pages must be added to the Structure before generation. Skeleton assignments are enforced.

### Intent Drift → Character Lock
Character traits persist across sessions. "Minimal" means compact density and restraint — always.

### Enforcement
```
Before writing ANY code, read decantr.essence.json. Verify:
1. Style matches the Vintage
2. Page exists in the Structure
3. Composition follows the active Recipe
4. Density and tone match the Character
If a request conflicts with the Essence, flag it and ask for confirmation.
```

### Cork Response Protocol

For each cork rule violation type, the LLM MUST respond with a specific action. NEVER silently violate a cork rule. ALWAYS surface the conflict to the user.

| Violation Type | LLM Response |
|----------------|-------------|
| **Style mismatch** | Ask user: "Your essence specifies {X} style but you're requesting {Y}. Update essence or keep current?" Do not proceed until resolved. |
| **Unlisted page** | Ask user: "This page isn't in your structure. Add it to essence first?" If confirmed, add the page to the essence's `structure` array before generating code. |
| **Blend violation** | Warn the user that the requested layout conflicts with the page's blend spec. Propose a blend-compatible alternative that achieves the same goal within the existing spatial arrangement. |
| **Recipe violation** | Show the correct recipe composition from the active recipe's `compositions` and `decorators`. Explain which wrapper or decorator class should be used instead. |
| **Character drift** | Flag the tone mismatch: "Your essence character is [{traits}] but this request feels [{conflicting traits}]." Suggest alternatives that align with the declared character. |
| **Section boundary violation** (sectioned essence) | Warn that the change crosses section boundaries. Each section has its own vintage and terroir — changes must stay within the correct section. |

### Essence-Config Reconciliation

The Essence (`decantr.essence.json`) is authoritative. The config (`decantr.config.json`) is derived from it.

When the Essence is written or updated, the LLM MUST also update the config to match:

| Essence Field | Config Field |
|--------------|-------------|
| `essence.vintage.style` | `config.style` |
| `essence.vintage.mode` | `config.mode` |
| `essence.vessel.routing` | `config.router` |

**Conflict resolution**: Essence always wins. If a user manually edits `decantr.config.json` to diverge from the Essence, the LLM updates the config back to match the Essence and warns the user: "Config was out of sync with essence. Updated config.{field} from '{old}' to '{new}' to match essence."

For sectioned essences, the config reflects the first section's vintage (the primary visual identity). If sections have different styles, the LLM sets the config to the first section's style and adds a comment in the generated `app.js` noting that style switching happens per-section via `setStyle()`.

---

## The Blend Spec

The Blend is the per-page spatial arrangement — a row-based layout tree that specifies how patterns are positioned relative to each other. It closes the gap between "what patterns go on a page" (archetypes) and "how to decorate components" (recipes).

### Schema

Two keys on each `structure[]` entry in the Essence:

```
blend    : Row[]           — ordered layout rows (replaces flat patterns array)
surface  : string          — container atoms for the page body (optional)
```

**Row types:**

```
Row = string                                           // full-width pattern
    | { cols: string[], at?: string }                  // equal-width columns
    | { cols: string[], span: Record<string,number>, at?: string }  // weighted columns
```

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `cols` | `string[]` | — | Pattern IDs placed side-by-side |
| `span` | `{id: weight}` | all 1 | Relative column widths (sum = grid column count) |
| `at` | `string` | `"md"` | Breakpoint below which columns stack vertically |
| `surface` | `string` | `"_flex _col _gap4 _p4 _overflow[auto] _flex1"` | Page container atoms |

**Backward compatible**: `patterns` (flat array) still valid — interpreted as all patterns stacked full-width, one per row.

### Examples

**Dashboard Overview:**
```json
{
  "id": "overview",
  "skeleton": "sidebar-main",
  "blend": [
    "kpi-grid",
    "data-table",
    { "cols": ["activity-feed", "chart-grid"], "at": "lg" }
  ]
}
```

**E-Commerce Catalog (asymmetric split):**
```json
{
  "id": "catalog",
  "skeleton": "top-nav-main",
  "surface": "_flex _col _gap6 _p6 _ctrxl",
  "blend": [
    "sort-bar",
    { "cols": ["filter-sidebar", "product-grid"], "span": { "product-grid": 3 }, "at": "md" },
    "pagination"
  ]
}
```

**Content Article (3:1 split):**
```json
{
  "id": "article",
  "skeleton": "top-nav-main",
  "surface": "_flex _col _gap8 _py8 _px6 _ctr",
  "blend": [
    { "cols": ["article-content", "table-of-contents"], "span": { "article-content": 3 }, "at": "lg" },
    "author-card",
    "related-posts"
  ]
}
```

### SERVE Algorithm

How the LLM reads and applies a Blend during code generation:

1. Read the structure entry's `blend` array
2. Create page container with `surface` atoms (or default `_flex _col _gap4 _p4 _overflow[auto] _flex1`)
3. For each row:
   - **String**: render the pattern full-width. Use the pattern's `default_blend.atoms` for internal layout.
   - **`{ cols }`**: create a grid wrapper with `_grid _gc{N} _gap4` where N = number of columns. Add responsive collapse: below `at` breakpoint, use single column. Render each pattern inside.
   - **`{ cols, span }`**: compute total = sum of all span values (default 1 per unspecified). Grid gets `_gc{total}`. Each pattern gets `_span{weight}`.
4. Wrap contained patterns in `Card(Card.Header, Card.Body)` — standalone patterns (layout `hero`/`row`) skip wrapping. Recipe styles override Card appearance via component CSS.
5. Apply recipe `pattern_overrides` from recipe JSON (background effects like `cc-grid`, `cc-scanline`) as Card class attributes
6. Apply Clarity-derived gap to pattern code internals (`_gap4` → clarity gap)
7. Add entrance animations: `d-page-enter` on page container, `d-stagger` / `d-stagger-up` on grid wrappers containing cards/KPIs, `animate: true` on Statistic components
8. Fill pattern slots with domain content
9. **WIRE** — Cross-pattern plumbing: when related patterns co-exist on a page (e.g., `filter-bar` + `data-table`), the generator creates page-level signals and passes them as props. Wiring rules are defined in `WIRING_RULES` in `tools/generate.js`. Pattern code examples accept optional props via `= {}` destructuring — when called without props, patterns use internal demo data; when wired, they consume shared page state.

### Separation of Concerns

| Blend controls (spatial) | NOT Blend's concern |
|--------------------------|---------------------|
| Row ordering | Internal pattern layout (pattern's `default_blend`) |
| Column splits + weights | Recipe decoration (handled by style CSS on Card/Statistic/DataTable) |
| Responsive collapse breakpoints | Content decisions (labels, data, icons) |
| Page container atoms | Skeleton structure (sidebar, nav) |

### Default Blends in Archetypes

Archetypes provide `default_blend` per page — the domain-typical spatial arrangement. During CLARIFY, the LLM copies `default_blend` into the Essence's `blend`, then customizes. Essence `blend` always wins.

---

## Monochrome Palette

The `palette: 'monochrome'` personality trait in `derive.js` derives all 7 role colors from a single primary hue.

Derivation strategy (from primary H/S/L):
- accent: H+15°, S×0.8, L+8
- tertiary: H-15°, S×0.7, L-5
- success: H+10°, S×0.9, L+12
- warning: H-8°, S×1.1, L+5
- error: H-20°, S×1.2, L-3
- info: H+5°, S×0.6, L+15

All shifts within ±20° of base hue. Distinguishability via lightness/saturation. WCAG AA validated via `validateContrast()`.

---

## Style Selection Heuristics

When the user hasn't specified a style, use these domain signals:

| Domain | Recommended Style | Mode | Shape | Reasoning |
|--------|------------------|------|-------|-----------|
| SaaS / Dashboard | `clean` or `auradecantism` | `dark` | `rounded` | Data density needs neutral chrome; dark reduces eye strain for long sessions |
| E-commerce | `clean` | `light` | `rounded` | Products need accurate color rendering; light mode builds trust |
| Portfolio / Agency | `auradecantism` or `glassmorphism` | `dark` | `rounded` | Visual impact and brand differentiation; dark mode feels premium |
| Content / Blog | `clean` | `auto` | `rounded` | Readability first; auto mode respects reader preference |
| Enterprise / Internal | `clean` | `auto` | `sharp` | Professional, familiar; sharp corners signal precision |

## Character Trait Clusters

Character traits map to spatial and motion decisions. Three clusters cover most projects:

| Cluster | Traits | Density | Section Padding | Content Gap | Motion |
|---------|--------|---------|-----------------|-------------|--------|
| **Spacious** | minimal, elegant, premium, editorial | Comfortable | `_py16`–`_py24` | `_gap6`–`_gap8` | Slow, subtle |
| **Balanced** | modern, professional, friendly, clean | Default | `_py8`–`_py12` | `_gap4`–`_gap6` | Standard |
| **Compact** | tactical, dense, technical, efficient | Dense | `_py4`–`_py6` | `_gap2`–`_gap3` | Fast, minimal |

Pick the cluster closest to the user's Character words, then use its spatial values as starting points for the Clarity profile.

## Tasting Notes

A tasting-notes file (`decantr.tasting-notes.md`) is an optional append-only session log that tracks decisions made during the Decantation Process.

### Format

```markdown
## [DATE] — [STAGE]

**Changes:** What was added, modified, or decided
**Decisions:** Key choices and their reasoning
**Cork:** Any Essence constraints applied or conflicts flagged
```

### Rules

- **Append-only** — never edit previous entries
- **One entry per session** — each conversation adds at most one entry
- **Created during CLARIFY** — first entry documents Essence crystallization
- **Updated during AGE** — subsequent sessions append entries documenting drift checks and evolution
- **Location:** Project root, alongside `decantr.essence.json`

---


---



## Archetype Index

### cloud-platform
**Pages:** home, apps, app-detail, team, activity, services, tokens, usage, billing, settings, status, compliance, login
**Patterns used:** hero, card-grid, logo-strip, stats-section, cta-section, footer-columns, filter-bar, [object Object], activity-feed, detail-header, kpi-grid, [object Object], data-table, service-catalog, resource-overview, chart-grid, pricing-table, form-sections, status-board, checklist-card, auth-form
**Tannins:** auth, realtime-data, search, billing, team-management
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** full-bleed, sidebar-main, centered
**home blend:** `[{"pattern":"hero","preset":"brand","as":"brand-hero"},{"pattern":"card-grid","preset":"icon","as":"feature-grid"},{"pattern":"logo-strip","preset":"marquee","as":"tech-logos"},{"pattern":"card-grid","preset":"icon","as":"capability-grid"},{"pattern":"stats-section","preset":"hero","as":"platform-stats"},{"pattern":"cta-section","preset":"brand","as":"enterprise-cta"},{"pattern":"footer-columns","preset":"minimal","as":"footer"}]`
**apps blend:** `["filter-bar",{"cols":[{"pattern":"card-grid","preset":"resource","as":"app-grid"},"activity-feed"],"span":{"app-grid":2},"at":"lg"}]`

### content-site
**Pages:** home, category, article, search, about, contact
**Patterns used:** hero, category-nav, post-list, cta-section, pagination, article-content, table-of-contents, author-card, search-bar, detail-header, contact-form
**Tannins:** search, content-state, categories, analytics
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** top-nav-main
**home blend:** `["hero","category-nav","post-list","cta-section"]`
**category blend:** `["category-nav","post-list","pagination"]`

### docs-explorer
**Pages:** components, patterns, archetypes, recipes, foundations, atoms, tokens
**Patterns used:** component-showcase, detail-panel, specimen-grid, token-inspector
**Tannins:** registry-data, search, theme-controls, viewport-sim
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** sidebar-main
**components blend:** `["component-showcase"]`
**patterns blend:** `["detail-panel"]`

### ecommerce-admin
**Pages:** overview, analytics, products, product-detail, orders, order-detail, customers, customer-detail, inventory, promotions, media-library, support, store-settings
**Patterns used:** kpi-grid, quick-actions, sales-charts, recent-activity, filter-bar, chart-grid, comparison-panel, product-toolbar, data-table, detail-header, media-gallery, product-form, kanban-board, timeline, detail-panel, order-history, customer-header, activity-feed, goal-tracker, file-manager, inbox, wizard
**Tannins:** inventory-state, order-state, promotion-state
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** 
**overview blend:** `["kpi-grid","quick-actions",{"cols":["sales-charts","recent-activity"],"span":{"sales-charts":2},"at":"lg"}]`
**analytics blend:** `["filter-bar","kpi-grid","chart-grid","comparison-panel"]`

### ecommerce
**Pages:** home, catalog, product, cart, checkout, account, login, register
**Patterns used:** hero, category-nav, card-grid, testimonials, cta-section, filter-bar, filter-sidebar, product-grid, pagination, media-gallery, detail-panel, data-table, pricing-table, wizard, form-sections, order-history, auth-form
**Tannins:** auth, cart-state, search, payments, inventory, wishlist
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** top-nav-main, sidebar-main, minimal-header, centered
**home blend:** `["hero","category-nav",{"pattern":"card-grid","preset":"product","as":"product-grid"},"testimonials","cta-section"]`
**catalog blend:** `["filter-bar",{"cols":["filter-sidebar","product-grid"],"span":{"product-grid":3},"at":"md"},"pagination"]`

### financial-dashboard
**Pages:** overview, production, pipeline, approvals, collections, outreach, products, scorecard, vendors
**Patterns used:** kpi-grid, goal-tracker, comparison-panel, chart-grid, filter-bar, data-table, pipeline-tracker, scorecard, activity-feed, detail-panel
**Tannins:** portfolio-state, pipeline-state, compliance-state, report-export
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** 
**overview blend:** `["kpi-grid",{"cols":["goal-tracker","comparison-panel"],"at":"lg"},"chart-grid"]`
**production blend:** `["filter-bar","kpi-grid","chart-grid","data-table"]`

### gaming-platform
**Pages:** main, news, games, hall-of-fame, join-guild, member-profile
**Patterns used:** hero, kpi-grid, activity-feed, top-players, filter-bar, post-list, search-bar, card-grid, stats-bar, leaderboard, timeline, testimonials, cta-section, detail-header, achievements
**Tannins:** auth, guild-state, achievements, search, realtime-data, notifications
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** sidebar-main
**main blend:** `[{"pattern":"hero","preset":"landing","as":"guild-hero"},"kpi-grid",{"cols":["activity-feed","top-players"],"at":"lg"}]`
**news blend:** `["filter-bar","post-list"]`

### portfolio
**Pages:** home
**Patterns used:** announcement-bar, hero, logo-strip, card-grid, code-preview, stats-section, testimonials, showcase-gallery, cta-section, footer-columns
**Tannins:** analytics
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** full-bleed
**home blend:** `["announcement-bar",{"pattern":"hero","preset":"brand","as":"brand-hero"},{"pattern":"logo-strip","preset":"marquee","as":"partner-logos"},{"pattern":"card-grid","preset":"icon","as":"feature-grid"},{"pattern":"code-preview","preset":"split","as":"quickstart"},{"pattern":"stats-section","preset":"hero","as":"metrics"},{"pattern":"testimonials","preset":"wall","as":"social-proof"},"showcase-gallery",{"pattern":"cta-section","preset":"brand","as":"final-cta"},"footer-columns"]`

### recipe-community
**Pages:** home, feed, recipe-detail, recipe-create, recipe-edit, generate, chat, cookbooks, cookbook-detail, profile, login, register
**Patterns used:** hero, card-grid, cta-section, detail-header, stats-bar, checklist-card, author-card, steps-card, table-of-contents, stat-card, form-sections, photo-to-recipe, chat-interface, kpi-grid, auth-form
**Tannins:** auth, recipe-state, cookbook-state, ai-chat, ai-generate, social-feed, search, image-upload
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** top-nav-footer, top-nav-main, centered
**home blend:** `["hero",{"pattern":"card-grid","preset":"icon","as":"feature-grid"},"cta-section"]`
**feed blend:** `["detail-header",{"pattern":"card-grid","preset":"content","as":"recipe-card-grid"}]`

### saas-dashboard
**Pages:** overview, analytics, users, user-detail, settings, billing, notifications, login
**Patterns used:** kpi-grid, chart-grid, activity-feed, filter-bar, data-table, detail-header, timeline, form-sections, pricing-table, order-history, auth-form
**Tannins:** auth, analytics-state, search, notifications, user-management, billing
**Suggested vintage:** style=auradecantism, mode=dark
**Skeletons:** sidebar-main, centered
**overview blend:** `["kpi-grid",{"cols":["chart-grid","activity-feed"],"at":"lg"}]`
**analytics blend:** `["filter-bar","chart-grid","data-table"]`



---



## Recipe Index

### recipe-auradecantism
**Setup:** `import { setStyle, setMode } from 'decantr/css';
setStyle('auradecantism');
setMode('dark');`
**Decorators (17):** d-mesh, d-glass, d-glass-strong, d-gradient-text, d-gradient-text-alt, aura-glow, aura-glow-strong, aura-ring, aura-orb, aura-shimmer, d-glow-primary, d-glow-accent, d-stat-glow, d-gradient-hint-primary, d-gradient-hint-accent, d-terminal-chrome, d-icon-glow
**Compositions:** panel, card, kpi, table, form, sidebar, layout, alert, modal, chart

### recipe-clean
**Setup:** `import { setStyle, setMode } from 'decantr/css';
setStyle('clean');
setMode('light');`
**Decorators (6):** cl-card, cl-divider, cl-section, cl-muted-bg, cl-badge-dot, cl-subtle-hover
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

### recipe-launchpad
**Setup:** `import { registerStyle, setStyle, setMode } from 'decantr/css';
import { launchpad } from 'decantr/styles/community/launchpad';
registerStyle(launchpad);
setStyle('launchpad');
setMode('light');`
**Decorators (16):** lp-panel, lp-card, lp-card-hover, lp-header, lp-btn-gradient, lp-btn-outline, lp-nav-item, lp-nav-active, lp-surface, lp-divider, lp-dot, lp-brand-bg, lp-gradient-hero, lp-kbd, lp-code-inline, lp-shimmer
**Pattern overrides:** hero, card-grid, kpi-grid, filter-bar, data-table, cta-section, detail-header, stats-section, footer-columns, activity-feed, chart-grid, pricing-table, status-board, form-sections, deploy-log, resource-overview, service-catalog, checklist-card, logo-strip
**Compositions:** panel, card, kpi, table, form, sidebar, layout, alert, modal, chart, deploy-log



---

# Style Catalog


## 8. Styles & Modes

```js
import { setStyle, setMode, registerStyle } from 'decantr/css';

// Core style (always available, no import needed)
setStyle('auradecantism');  // Default: glass, gradients, vibrant (dark)

// Add-on styles (require import + registerStyle before use)
// Available: clean, retro, glassmorphism,
//            bioluminescent, clay, dopamine, editorial, liquid-glass, prismatic
import { clean as cleanStyle } from 'decantr/styles/clean';
registerStyle(cleanStyle);
setStyle('clean');

// Available modes
setMode('light');
setMode('dark');
setMode('auto');  // Follows system preference
```

**10 styles total:** `auradecantism` (core, default), `clean`, `retro`, `glassmorphism`, `bioluminescent`, `clay`, `dopamine`, `editorial`, `liquid-glass`, `prismatic` (all add-on).

### Interactive State Atoms (Pseudo-Class Prefixes)

```js
// Hover, focus, focus-visible, active, focus-within — compose with ANY atom
css('_h:bgprimary')       // background on hover
css('_f:bcprimary')       // border-color on focus
css('_fv:ring2')          // ring on keyboard focus
css('_a:bgmuted')         // background on press
css('_fw:bcprimary')      // border when child focused
css('_sm:h:bgmuted')      // responsive + hover
css('_h:bgprimary/50')    // hover + opacity modifier
```

### Ring, Transition, Prose, Divide

```js
css('_ring2 _ringPrimary')    // 2px primary ring
css('_fv:ring2 _ringAccent')  // ring on keyboard focus
css('_transColors')           // smooth color transitions
css('_prose')                 // rich text typography
css('_divideY')               // borders between stacked children
css('_textBalance')           // balanced line wrapping
```

### Opacity Modifiers
Works on all semantic color atoms: `_bgprimary/50`, `_fgaccent/30`, `_bcborder/80`

---


---

# Skeleton Code Templates


## 5. Skeleton Code (5 layouts)

### sidebar-main (recommended: Shell component)
```js
import { Shell, Breadcrumb, Command, Dropdown, icon } from 'decantr/components';

function SidebarMainApp({ nav, router }) {
  const [navState, setNavState] = createSignal('expanded');

  return Shell({ config: 'sidebar-main', navState, onNavStateChange: setNavState },
    Shell.Nav({},
      ...nav.map(item => {
        const isActive = () => router.path() === item.href;
        return link({ href: item.href, class: () =>
          css(`d-shell-nav-item _r2 _trans ${
            isActive() ? 'd-shell-nav-item-active _bgprimary/10 _fgprimary' : '_fgfg'
          }`)
        },
          icon(item.icon),
          cond(() => navState() === 'expanded', () => text(() => item.label))
        );
      })
    ),
    Shell.Header({},
      Breadcrumb({ items: [{ label: 'Home', href: '/' }] }),
      Command({ placeholder: 'Search... (Cmd+K)' }),
      Dropdown({ trigger: icon('user'), items: [{ label: 'Settings' }, { label: 'Logout' }] })
    ),
    Shell.Body({ class: css('d-page-enter') },
      router.outlet()
    )
  );
}
```

Shell handles ARIA roles, responsive collapse, CSS grid-template-areas, and keyboard shortcuts (Ctrl+\\ toggles sidebar). See `reference/shells.md` for all 10 presets.

### sidebar-main (manual alternative)
```js
function SidebarMain({ nav, children }) {
  const { div, aside, main, header, span } = tags;
  const [collapsed, setCollapsed] = createSignal(false);

  return div({ class: css('_grid _h[100vh]'),
               style: () => `grid-template-columns:${collapsed() ? '64px' : '240px'} 1fr;grid-template-rows:auto 1fr` },
    aside({ class: css('_flex _col _gap1 _p3 _bgmuted _overflow[auto] _borderR'), style: 'grid-row:1/3' },
      div({ class: css('_flex _aic _jcsb _mb4') },
        cond(() => !collapsed(), () => span({ class: css('_heading5') }, 'App')),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCollapsed(!collapsed()) }, icon('panel-left'))
      ),
      ...nav.map(item =>
        link({ href: item.href, class: css('_flex _aic _gap2 _p2 _px3 _r2 _trans _fgfg') },
          icon(item.icon), cond(() => !collapsed(), () => text(() => item.label))
        )
      )
    ),
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB') },
      span({ class: css('_heading4') }, 'Page Title')
    ),
    main({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') }, ...children)
  );
}
```

### Children Rules

> **Function children = reactive TEXT only.** When an element receives a function as a child, the framework calls `String(fn())` and creates a reactive text node. It does **not** expect DOM elements from that function.

Use `cond()` for conditional DOM elements:

```js
// WRONG — returns "[object HTMLSpanElement]"
div({}, () => show() ? span({}, 'Hello') : null)

// CORRECT — use cond() for conditional DOM
div({}, cond(() => show(), () => span({}, 'Hello')))

// CORRECT — function children work for reactive text
span({}, () => `Count: ${count()}`)
```

### top-nav-main
```js
function TopNavMain({ brand, nav, children }) {
  const { div, header, main, nav: navEl } = tags;
  return div({ class: css('_flex _col _h[100vh]') },
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB _bgbg') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, brand),
      navEl({ class: css('_flex _aic _gap6') },
        ...nav.map(item => link({ href: item.href, class: css('_fgmuted _nounder _trans') }, item.label))
      ),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm' }, icon('search')),
        Button({ variant: 'ghost', size: 'sm' }, icon('user'))
      )
    ),
    main({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') }, ...children)
  );
}
```

### centered
```js
function Centered({ children, width = '400px' }) {
  const { div } = tags;
  return div({ class: css('_flex _center _h[100vh] _bgmuted _p4') },
    Card({ class: css(`_w[${width}] _mw[100%]`) }, ...children)
  );
}
```

### full-bleed
```js
function FullBleed({ children }) {
  const { div, header, main, nav: navEl } = tags;
  return div({ class: css('_flex _col') },
    header({ class: css('_fixed _top0 _left0 _wfull _flex _aic _jcsb _px8 _py4 _z[40]') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, 'Brand'),
      navEl({ class: css('_flex _aic _gap6') })
    ),
    main({ class: css('_flex _col') }, ...children)
  );
}
```

### minimal-header
```js
function MinimalHeader({ brand, children }) {
  const { div, header, main } = tags;
  return div({ class: css('_flex _col _h[100vh]') },
    header({ class: css('_flex _aic _jcc _py3 _borderB') },
      link({ href: '/', class: css('_flex _aic _gap2 _nounder _fgfg') }, icon('arrow-left'), brand)
    ),
    main({ class: css('_flex _col _aic _overflow[auto] _flex1 _py8') },
      div({ class: css('_w[720px] _mw[100%] _px4 _flex _col _gap6') }, ...children)
    )
  );
}
```

---


---



## Pattern Index

| Pattern | Presets | Layout | Components |
|---------|---------|--------|-----------|
| activity-feed | default, notification-center, social, minimal, grouped | stack | Timeline, Avatar, Badge, Text, Separator |
| anatomy-viewer | split | row | Card, Badge, Tabs, Button, icon |
| announcement-bar | — | row | Badge, Button, icon |
| article-content | — | grid | Card, Avatar, Badge, Text, Separator |
| auth-form | — | stack | Input, Button, Card, Card.Header, Card.Body, Card.Footer, Separator |
| author-card | — | row | Card, Avatar, Badge, Text, Button |
| bento-features | asymmetric-glow, split-stats, hero-stats, grid-only | stack | Card, Badge, icon |
| card-grid | product, content, collection, icon, resource, service, user | grid | Card, Card.Header, Card.Body, Card.Footer, Button, Badge, icon |
| category-nav | — | flex | Chip, Badge, Button, Segmented |
| changelog | — | stack | Badge, Chip, Separator, icon |
| chart-grid | default, dashboard, single-focus, sparkline-row | grid | Chart, Select |
| chat-interface | — | stack | Card, Card.Body, Input, Button, Avatar, Chip, ScrollArea, icon |
| checklist-card | default, onboarding | stack | Card, Card.Header, Card.Body, Checkbox, icon |
| code-comparison | split, vision-split, stacked | row | CodeBlock, Card |
| code-preview | terminal, split | row | CodeBlock, Chip, Button |
| comparison-panel | — | grid | Statistic, Sparkline, Badge, Chart, Separator |
| component-showcase | — | stack | * |
| contact-form | — | stack | Input, Textarea, Button, Select |
| cta-section | standard, brand | stack | Button, Title, Text |
| data-table | default, audit-log, master-detail, editable | stack | DataTable, Input, Select, Button, Badge, Chip |
| deploy-log | live, history | stack | Badge, Button, Chip, Input, icon |
| detail-header | standard, profile | stack | Breadcrumb, Title, Badge, Button |
| detail-panel | — | stack | Tabs, Card, Card.Header, Card.Body, Avatar, Badge, Button, Separator, Tooltip |
| ecosystem-grid | standard | grid | Card, Badge, Avatar, Chip, Button, icon |
| explorer-shell | — | grid | Input, Select, Button |
| file-manager | — | stack | Card, Button, Breadcrumb, Dropdown, icon, Badge |
| filter-bar | default, toolbar, segmented, search-primary | row | Input, Select, Button, DatePicker, Chip |
| filter-sidebar | — | stack | Checkbox, Select, Switch, Button, Separator, Accordion, Input |
| footer-columns | standard, minimal | row | Separator, icon |
| form-sections | settings, creation, structured | stack | Input, Select, Switch, Textarea, Checkbox, Button, Separator |
| goal-tracker | — | grid | Statistic, Progress, Badge, icon, Sparkline |
| hero | landing, image-overlay, brand, vision, split, image-overlay-compact, empty-state | stack | Button, icon |
| inbox | — | split | Avatar, Badge, Chip, Button, icon, Separator |
| kanban-board | — | row | Card, Badge, Button, Chip, icon |
| kpi-grid | default, compact, featured, sparkline | grid | Statistic, icon |
| leaderboard | ranked, grid, spotlight | stack | Card, Avatar, Badge, Statistic, Progress, icon |
| logo-strip | static, marquee | row | Marquee, icon |
| media-gallery | — | grid | Image, Card, Modal, Button |
| order-history | — | stack | DataTable, Badge, Button |
| pagination | — | row | Pagination, Select, Button |
| photo-to-recipe | — | grid | Card, Card.Header, Card.Body, Upload, Button, Spinner, Separator, icon |
| pipeline-tracker | — | stack | Chart, Badge, DataTable, Tabs, Statistic, Select |
| post-list | — | stack | Card, Card.Body, Avatar, Badge, Chip, Pagination, Button |
| pricing-table | default, feature-comparison | grid | Card, Button, Badge, Separator, List |
| quick-actions | — | grid | Button, Card, icon |
| resource-overview | gauge-grid, summary-bar | grid | Badge, Card, Card.Body, Chip, icon |
| scorecard | — | stack | DataTable, Progress, Badge, Text, Separator, Avatar |
| search-bar | — | row | Input, Button, Dropdown |
| service-catalog | grid, list | grid | Card, Card.Body, Badge, Button, icon |
| showcase-card | app, compact | stack | Card, Badge, Chip, Button, icon |
| showcase-gallery | screenshots, cards | grid | Card, Image, BrowserFrame |
| specimen-grid | swatch, preview | — | Card, Badge, Chip |
| stat-card | compact-grid | grid | Card, Card.Header, Card.Body, Statistic, icon |
| stats-bar | default | stack | Button, Separator, Badge, icon |
| stats-section | hero, inline | hero | Statistic |
| status-board | — | grid | Badge, Chip, icon |
| steps-card | default | stack | Card, Card.Header, Card.Body, Badge, icon |
| table-of-contents | — | stack | List, Link |
| testimonials | grid, wall, marquee | grid | Card, Avatar, Badge, Text, Marquee |
| timeline | default, calendar, compact, branching, milestone | stack | Timeline, Card, Card.Body, Badge, Avatar, icon, Separator |
| token-inspector | — | stack | Card, Separator |
| wizard | — | stack | Button, Progress, Input, Select, Checkbox, Switch, Separator |


---

# Community Content Registry


During the Decantation Process, you can discover community content via:
- `decantr registry search <query>` — search for styles, recipes, patterns, archetypes
- `decantr registry add <type>/<name>` — install community content (e.g. `style/neon`)
- MCP tools: `search_content_registry`, `get_content_recommendations`

Registry content is installed locally with no runtime dependency. The manifest `decantr.registry.json` tracks installed content with checksums for integrity verification.