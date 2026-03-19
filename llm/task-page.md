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

# Task: Add or Modify a Page


> Read this file when adding a page to an existing project. Always read `decantr.essence.json` first to identify the active archetype, recipe, and Clarity profile.



---

# Cork Rules (Guided Tier)


Cork enforcement: **Guided** — structure is enforced, layout is flexible.

Before writing ANY code, read `decantr.essence.json`. Verify:
1. **Style matches the Vintage.** Do not switch styles.
2. **Page exists in the Structure.** If new, add it to the Essence first.
3. **Layout follows the page's Blend** as a baseline, but new column arrangements and pattern reordering are allowed to match intent.
4. **Composition follows the active Recipe.** Do not freestyle decoration.
5. **Spacing follows the Clarity profile** — select within the range for the active character cluster.

New local patterns (`src/patterns/`) are allowed with brief justification. If a request conflicts with the Essence, flag it and ask.

## Reading the Essence


1. Open `decantr.essence.json`
2. Identify the `terroir` — this determines which archetype to consult
3. Identify the `vintage.recipe` — this determines which decorators to apply
4. Identify the `character` — this determines the Clarity profile (spacing density)
5. Check if the new page already exists in `structure`. If not, add it.
6. Resolve the page's `blend` from the archetype's `default_blend` or customize.


## SERVE Algorithm (Code Generation from Blend)


For each page, read its `blend` array and apply:
1. Create page container with `surface` atoms (default: `_flex _col _gap4 _p4 _overflow[auto] _flex1`) + `d-page-enter` class
2. String rows → full-width pattern (use pattern's `default_blend.atoms`)
3. `{ cols, at }` rows → `_grid _gc1 _{at}:gc{N} _gap{clarity}` wrapper with responsive collapse
4. `{ cols, span, at }` rows → responsive `_gc{total}` grid, each pattern gets `_span{weight}`
5. Wrap contained patterns in `Card(Card.Header, Card.Body)` — standalone patterns (layout `hero`/`row` or `contained: false`) skip wrapping
6. Apply recipe `pattern_overrides` (background effects) from recipe JSON as Card class attrs
7. Apply Clarity-derived gap to pattern code internals (`_gap4` → clarity gap)
8. Add entrance animations: `d-stagger` / `d-stagger-up` on grid wrappers, `animate: true` on Statistic


## Recipe Application Guide


## 7. Recipe Application Guide

Recipes overlay decorative classes onto standard components. The pattern is always: **standard component + recipe wrapper classes**.

### Without recipe (plain):
```js
div({ class: css('_b1 _r4 _p4') },
  Statistic({ label: 'Revenue', value: 125000, prefix: '$' })
)
```

### With auradecantism recipe:
```js
div({ class: css('d-glass _r4 _p4') },  // glass panel wrapper
  Statistic({ label: 'Revenue', value: 125000, prefix: '$' }),
  span({ class: css('d-gradient-text _textxs') }, 'ALL TIME HIGH')  // gradient accent text
)
```

### With clean recipe:
```js
div({ class: css('_b1 _r4 _p4') },  // simple border + radius (tokens handle the rest)
  Statistic({ label: 'Revenue', value: 125000, prefix: '$' })
)
```

**Key principle:** Recipes don't change which components you use — they change how you wrap and decorate them.

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
**Decorators (10):** d-mesh, d-glass, d-glass-strong, d-gradient-text, d-gradient-text-alt, aura-glow, aura-glow-strong, aura-ring, aura-orb, aura-shimmer
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

# Pattern Code Snippets


## 6. Top 15 Pattern Code Snippets

> **Spacing note:** Snippets below use comfortable-density defaults (`_gap4`, `_p4`).
> Actual spacing must match the project's Clarity profile — see §12 below or `reference/spatial-guidelines.md` §17.

### kpi-grid
```js
function KpiGrid() {
  const { div, h2 } = tags;
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, 'Key Metrics'),
    div({ class: css('_grid _gc4 _gap4') },
      Statistic({ label: 'Revenue', value: 1248500, prefix: '$', trend: 'up', trendValue: '+12.5%' }),
      Statistic({ label: 'Users', value: 84230, trend: 'up', trendValue: '+8.1%' }),
      Statistic({ label: 'Orders', value: 6420, trend: 'down', trendValue: '-2.3%' }),
      Statistic({ label: 'Conversion', value: 3.24, suffix: '%', trend: 'up', trendValue: '+0.5%' })
    )
  );
}
```

### data-table
```js
function DataTablePattern({ columns, data }) {
  const { div } = tags;
  const [search, setSearch] = createSignal('');
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _gap3 _aic _jcsb') },
      Input({ placeholder: 'Search...', value: search, onchange: e => setSearch(e.target.value) }),
      Button({ variant: 'outline' }, 'Export')
    ),
    DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
  );
}
```

### chart-grid
```js
function ChartGrid({ data }) {
  const { div, h2 } = tags;
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, 'Analytics'),
    div({ class: css('_grid _gc2 _gap4') },
      Chart({ type: 'line', data: data.revenue, x: 'date', y: 'value', title: 'Revenue', height: 280 }),
      Chart({ type: 'bar', data: data.orders, x: 'month', y: 'count', title: 'Orders', height: 280 }),
      Chart({ type: 'pie', data: data.categories, x: 'name', y: 'value', title: 'Categories', height: 280 }),
      Chart({ type: 'area', data: data.traffic, x: 'date', y: 'visits', title: 'Traffic', height: 280 })
    )
  );
}
```

### hero
```js
function Hero() {
  const { div, h1, p } = tags;
  return div({ class: css('_flex _col _aic _tc _gap6 _py16 _px6') },
    h1({ class: css('_heading1') }, 'Build Faster, Ship Smarter'),
    p({ class: css('_body _fgmuted _mw[640px]') }, 'The AI-first framework that turns ideas into production-ready apps.'),
    div({ class: css('_flex _gap3') },
      Button({ variant: 'primary', size: 'lg' }, 'Get Started'),
      Button({ variant: 'outline', size: 'lg' }, 'View Source')
    )
  );
}
```

### auth-form
```js
function AuthForm() {
  const { div, h2, p, span } = tags;
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  return div({ class: css('_flex _col _aic _jcc _minhscreen _p6') },
    Card({ class: css('_w[400px] _mw[100%]') },
      Card.Header({},
        h2({ class: css('_heading4 _tc') }, 'Sign In'),
        p({ class: css('_fgmuted _tc _mt1') }, 'Enter your credentials')
      ),
      Card.Body({ class: css('_flex _col _gap3') },
        Input({ label: 'Email', type: 'email', value: email, onchange: e => setEmail(e.target.value) }),
        Input({ label: 'Password', type: 'password', value: password, onchange: e => setPassword(e.target.value) }),
        Button({ variant: 'primary', class: css('_wfull _mt2') }, 'Sign In')
      ),
      Card.Footer({ class: css('_tc') },
        span({ class: css('_fgmuted _textsm') }, 'No account? ', link({ href: '/register' }, 'Sign Up'))
      )
    )
  );
}
```

### filter-bar
```js
function FilterBar() {
  const { div } = tags;
  const [search, setSearch] = createSignal('');
  return div({ class: css('_flex _gap3 _aic _wrap _py3') },
    Input({ placeholder: 'Search...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: 'all', options: [
      { label: 'All', value: 'all' }, { label: 'Active', value: 'active' }
    ] }),
    DatePicker({ placeholder: 'Date range' }),
    Button({ variant: 'ghost', size: 'sm' }, 'Clear')
  );
}
```

### activity-feed
```js
function ActivityFeed({ items }) {
  const { div, span, h3 } = tags;
  return div({ class: css('_flex _col _gap2 _p4') },
    h3({ class: css('_heading5') }, 'Recent Activity'),
    ...items.map(item =>
      div({ class: css('_flex _gap3 _aic _py2 _borderB') },
        Avatar({ src: item.avatar, name: item.user, size: 'sm' }),
        div({ class: css('_flex _col _flex1') },
          span({ class: css('_textsm') }, span({ class: css('_bold') }, item.user), ` ${item.action}`),
          span({ class: css('_textxs _fgmuted') }, item.time)
        ),
        Badge({ variant: 'default' }, item.type)
      )
    )
  );
}
```

### card-grid (preset: product)
```js
function ProductGrid({ products }) {
  const { div, span, h3 } = tags;
  return div({ class: css('_grid _gcaf280 _gap4 _p4') },
    ...products.map(p =>
      Card({},
        Image({ src: p.image, alt: p.name, class: css('_wfull _h[200px] _object[cover]') }),
        Card.Body({ class: css('_flex _col _gap2') },
          h3({ class: css('_heading5') }, p.name),
          span({ class: css('_fgmuted _textsm') }, p.description),
          div({ class: css('_flex _aic _jcsb _mt2') },
            span({ class: css('_heading4') }, `$${p.price}`),
            Button({ variant: 'primary', size: 'sm' }, 'Add to Cart')
          )
        )
      )
    )
  );
}
```

### pricing-table
```js
function PricingTable({ plans }) {
  const { div, span, h3, ul, li } = tags;
  return div({ class: css('_grid _gc3 _gap6 _p4 _aic') },
    ...plans.map(plan =>
      Card({ class: css(plan.featured ? '_b2 _bcprimary' : '') },
        Card.Header({ class: css('_tc') },
          h3({ class: css('_heading4') }, plan.name),
          div({ class: css('_mt2') },
            span({ class: css('_heading1') }, `$${plan.price}`),
            span({ class: css('_fgmuted') }, '/month')
          )
        ),
        Card.Body({},
          ul({ class: css('_flex _col _gap2') },
            ...plan.features.map(f => li({ class: css('_flex _aic _gap2 _textsm') }, icon('check'), f))
          )
        ),
        Card.Footer({},
          Button({ variant: plan.featured ? 'primary' : 'outline', class: css('_wfull') }, 'Get Started')
        )
      )
    )
  );
}
```

### contact-form
```js
function ContactForm() {
  const { div, h2, p } = tags;
  return Card({ class: css('_mw[600px] _mxa') },
    Card.Header({},
      h2({ class: css('_heading4') }, 'Get in Touch'),
      p({ class: css('_fgmuted _mt1') }, 'We\'ll respond within 24 hours.')
    ),
    Card.Body({ class: css('_flex _col _gap4') },
      div({ class: css('_grid _gc2 _gap4') },
        Input({ label: 'First Name' }), Input({ label: 'Last Name' })
      ),
      Input({ label: 'Email', type: 'email' }),
      Textarea({ label: 'Message', rows: 4 }),
      Button({ variant: 'primary', class: css('_wfull') }, 'Send Message')
    )
  );
}
```

### card-grid (preset: content)
```js
function RecipeCardGrid({ recipes }) {
  const { div, span, h3, img } = tags;
  return div({ class: css('_grid _gc3 _gap6 _p4') },
    ...recipes.map(r =>
      Card({},
        img({ src: r.image, alt: r.title, class: css('_wfull _h[200px] _object[cover]') }),
        Card.Body({ class: css('_flex _col _gap2') },
          h3({ class: css('_heading5') }, r.title),
          span({ class: css('_caption _fgmuted') }, r.description),
          div({ class: css('_flex _aic _gap3 _fgmuted _textsm') },
            span({}, icon('clock'), ` ${r.time} min`),
            span({}, icon('users'), ` ${r.servings} servings`)
          ),
          div({ class: css('_flex _gap1 _wrap') },
            ...r.tags.map(t => Chip({ size: 'sm' }, t))
          ),
          div({ class: css('_flex _aic _jcsb _mt2') },
            div({ class: css('_flex _aic _gap2') },
              Avatar({ src: r.author.avatar, size: 'xs' }),
              span({ class: css('_textsm') }, r.author.name)
            ),
            span({ class: css('_textsm _fgmuted') }, icon('git-fork'), ` ${r.forks}`)
          )
        )
      )
    )
  );
}
```

### form-sections (preset: creation)
```js
function RecipeFormSimple() {
  const { div, h3 } = tags;
  const [ingredients, setIngredients] = createSignal(['']);
  const [instructions, setInstructions] = createSignal(['']);

  return div({ class: css('_flex _col _gap6 _mw[720px] _mxAuto _p4') },
    Upload({ accept: 'image/*', variant: 'dragger' }, 'Upload recipe photo'),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Basic Info')),
      Card.Body({ class: css('_flex _col _gap3') },
        Input({ label: 'Title', placeholder: 'Recipe name' }),
        Textarea({ label: 'Description', rows: 3 })
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Details')),
      Card.Body({ class: css('_flex _col _gap3') },
        div({ class: css('_grid _gc3 _gap3') },
          InputNumber({ label: 'Prep (min)', min: 0 }),
          InputNumber({ label: 'Cook (min)', min: 0 }),
          InputNumber({ label: 'Servings', min: 1 })
        ),
        Segmented({ label: 'Difficulty', options: ['Easy', 'Medium', 'Hard'] })
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Ingredients')),
      Card.Body({ class: css('_flex _col _gap2') },
        ...ingredients().map((_, i) => Input({ placeholder: `Ingredient ${i + 1}` })),
        Button({ variant: 'outline', size: 'sm' }, icon('plus'), 'Add Ingredient')
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Instructions')),
      Card.Body({ class: css('_flex _col _gap2') },
        ...instructions().map((_, i) => Textarea({ placeholder: `Step ${i + 1}`, rows: 2 })),
        Button({ variant: 'outline', size: 'sm' }, icon('plus'), 'Add Step')
      )
    ),
    div({ class: css('_flex _jce _gap3') },
      Button({ variant: 'outline' }, 'Save Draft'),
      Button({ variant: 'primary' }, 'Publish Recipe')
    )
  );
}
```

### chat-interface
```js
function ChatInterface() {
  const { div, p } = tags;
  const [input, setInput] = createSignal('');
  const [messages, setMessages] = createSignal([
    { role: 'assistant', text: 'Hi! I\'m your AI chef assistant.' }
  ]);
  const suggestions = ['What can I make with chicken?', 'Suggest a quick dinner'];

  const send = () => {
    if (!input()) return;
    setMessages([...messages(), { role: 'user', text: input() }]);
    setInput('');
  };

  return div({ class: css('_flex _col _h[calc(100vh-200px)] _b1 _r4 _overflow[hidden]') },
    ScrollArea({ class: css('_flex1 _p4') },
      div({ class: css('_flex _col _gap3') },
        ...messages().map(m =>
          div({ class: css(m.role === 'user' ? '_flex _jce' : '_flex _gap2') },
            m.role === 'assistant' ? Avatar({ size: 'sm', fallback: 'AI' }) : null,
            div({ class: css(`_p3 _r4 _mw[70%] ${m.role === 'user' ? '_bgprimary' : '_bgmuted'}`) },
              p({}, m.text)
            )
          )
        )
      )
    ),
    div({ class: css('_flex _gap2 _p3 _borderb') },
      ...suggestions.map(s => Chip({ variant: 'outline', onclick: () => setInput(s) }, s))
    ),
    div({ class: css('_flex _gap2 _p3 _bordert') },
      Input({ placeholder: 'Ask your chef assistant...', value: input, class: css('_flex1') }),
      Button({ variant: 'primary', onclick: send }, icon('send'))
    )
  );
}
```

### photo-to-recipe
```js
function PhotoToRecipe() {
  const { div, h3, p } = tags;
  const [analyzing, setAnalyzing] = createSignal(false);
  const [result, setResult] = createSignal(null);

  return div({ class: css('_grid _gc2 _gap6 _p4') },
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, icon('camera'), ' Upload Photo')),
      Card.Body({ class: css('_flex _col _gap4 _aic') },
        Upload({ accept: 'image/*', variant: 'dragger', class: css('_wfull') }, 'Drop a food photo here'),
        Button({ variant: 'primary', class: css('_wfull'), onclick: () => setAnalyzing(true) },
          analyzing() ? Spinner({ size: 'sm' }) : icon('sparkles'),
          analyzing() ? ' Analyzing...' : ' Generate Recipe'
        )
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, icon('sparkles'), ' AI Generated Recipe')),
      Card.Body({},
        result()
          ? div({ class: css('_flex _col _gap3') }, h3({ class: css('_heading4') }, result().title))
          : p({ class: css('_fgmuted _tc') }, 'Upload a photo to generate a recipe')
      )
    )
  );
}
```

### card-grid (preset: icon)
```js
function FeatureGrid({ features }) {
  const { div, h3, p } = tags;
  return div({ class: css('_grid _gc3 _gap6 _p4') },
    ...features.map(f =>
      Card({},
        Card.Body({ class: css('_flex _col _gap3 _aic _tc') },
          div({ class: css('_w[48px] _h[48px] _r4 _bgmuted _flex _aic _jcc _fgprimary') }, icon(f.icon)),
          h3({ class: css('_heading5') }, f.title),
          p({ class: css('_caption _fgmuted') }, f.description)
        )
      )
    )
  );
}
```

---


---

# Skeleton Templates


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

# Responsive Spatial Behavior


## 6. Responsive Spatial Behavior

### Breakpoint mapping

| Class | Width | Grid Columns | Page Margin | Gutter | Nav Pattern |
|-------|-------|-------------|-------------|--------|-------------|
| Compact | <640px | 4 | `_px4` (16px) | `_gap4` (16px) | Bottom bar or hamburger |
| Medium | 640-1023px | 8 | `_px6` (24px) | `_gap4`–`_gap6` | Rail (80px) or collapsible sidebar |
| Expanded | 1024-1439px | 12 | `_px6`–`_px8` | `_gap6` (24px) | Persistent sidebar (220-360px) |
| Large | ≥1440px | 12 | auto (centered `_ctrxl`) | `_gap6` (24px) | Persistent sidebar + extra panes |

### What reduces at smaller screens

| Property | Desktop | Tablet | Mobile | Reduction |
|----------|---------|--------|--------|-----------|
| Page margins | 32px | 24px | 16px | ~50% |
| Grid gutters | 24px | 16-24px | 16px | ~33% |
| Section padding | `_py16` (64px) | `_py12` (48px) | `_py8` (32px) | ~50% |
| Card-to-card spacing | 48px | 32px | 16px | ~67% |
| Display heading size | Scales down | Scales down | Scales down | Per type scale |

### What stays constant across breakpoints

- Component internal padding (button padding doesn't change)
- Label-to-input gap (always intimate: `_gap1`–`_gap2`)
- Body-copy-to-button gap (always ~24px / `_gap6`)
- Card-title-to-body gap (always ~16px / `_gap4`)
- Touch target minimums (44px on touch devices)

### What transforms (not just shrinks)

- **Navigation**: persistent sidebar → rail → bottom bar or hamburger
- **Side-by-side panes** → stacked vertically
- **Horizontal tabs** → scrollable tabs or vertical list
- **Multi-column grid** → fewer columns (not smaller columns)
- **Decorative elements** may be removed entirely
- **Content order** may shift via flex direction changes

### Canonical responsive layouts (mapped to blend spec)

| Layout | <640px | 640-1023px | ≥1024px | Blend Spec |
|--------|--------|-----------|---------|-----------|
| **List-Detail** | One pane at a time | One pane at a time | Both side-by-side | `{ "cols": ["list", "detail"], "at": "lg" }` |
| **Supporting Panel** | Stacked or bottom sheet | 50/50 split | 70/30 split | `{ "cols": ["main", "support"], "span": {"main": 7, "support": 3}, "at": "md" }` |
| **Feed** | Single column | Auto-fit grid | Auto-fit grid | `_gcaf220` or `_gcaf280` |
| **KPI Grid** | 1 column | 2 columns | 4 columns | `_gc1 _sm:gc2 _lg:gc4 _gap3` |
| **Chart Grid** | 1 column | 2 columns | 2 columns | `_gc1 _md:gc2 _gap3` |

### Responsive atoms in generated code

When a blend item has `{ cols, at }`, the generate engine emits responsive grid atoms:
- `{ "cols": ["a", "b"], "at": "lg" }` → `_grid _gc1 _lg:gc2 _gap3`
- `{ "cols": ["a", "b", "c"], "span": { "a": 2 }, "at": "md" }` → `_grid _gc1 _md:gc3 _gap3`

Pattern code examples also use responsive atoms directly (see `kpi-grid.json`, `chart-grid.json`).

---



## 4. Containment Principle

Inner spacing must always be less than outer spacing. This creates visual containment — the Gestalt principle of closure makes padded containers feel like distinct objects.

| Container Padding | Internal Gap | Nested Item Gap | Typical Use |
|-------------------|-------------|-----------------|-------------|
| `_p8` (32px) | `_gap4`–`_gap6` | `_gap2`–`_gap3` | Page sections, large panels |
| `_p6` (24px) | `_gap3`–`_gap4` | `_gap2` | Cards, modals, drawers |
| `_p4` (16px) | `_gap2`–`_gap3` | `_gap1` | Dropdowns, popovers, compact cards |
| `_p3` (12px) | `_gap2` | `_gap1` | Tooltips, toast bodies, dense panels |
| `_p2` (8px) | `_gap1` | — | Badges, chips, inline containers |

**Rule**: Reduce by 1-2 scale steps per nesting level. If you can't reduce further, the nesting is too deep — flatten the structure.

---