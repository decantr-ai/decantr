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

# Task: Add SSR to a Project


> Read this file when adding server-side rendering, streaming, or hydration to a Decantr app.


# SSR API Reference


# Server-Side Rendering (SSR)

Decantr supports server-side rendering via a dedicated `decantr/ssr` module that works in pure Node.js without DOM globals.

## When to Use SSR

- **SEO**: Search engines need HTML content to index pages
- **Initial load performance**: Users see content before JavaScript loads
- **Social sharing**: Open Graph scrapers need static HTML
- **Accessibility**: Content available before JS executes

## Architecture

The SSR module is a **separate entry point** that never imports `document` at module level. It provides SSR-safe versions of Decantr's core primitives:

| Client | SSR |
|--------|-----|
| `h(tag, props, ...children)` → HTMLElement | `ssrH(tag, props, ...children)` → VNode |
| `text(getter)` → reactive Text node | `ssrText(getter)` → TextVNode (evaluated once) |
| `cond(pred, trueFn, falseFn)` → reactive branch | `ssrCond(pred, trueFn, falseFn)` → static branch |
| `list(items, keyFn, renderFn)` → reactive list | `ssrList(items, keyFn, renderFn)` → static list |
| `css(...atoms)` → class string + DOM injection | `ssrCss(...atoms)` → class string only |
| `onMount(fn)` → runs after mount | `ssrOnMount(fn)` → no-op |
| `onDestroy(fn)` → runs on teardown | `ssrOnDestroy(fn)` → no-op |

## Quick Start

### Server

```js
import { renderToString } from 'decantr/ssr';
import { ssrH, ssrText, ssrCond, ssrList, ssrCss } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

function App() {
  const [count] = createSignal(0);
  return ssrH('div', { class: ssrCss('_flex _col _gap4 _p6') },
    ssrH('h1', null, 'Hello from SSR'),
    ssrH('p', null, ssrText(() => `Count: ${count()}`))
  );
}

const html = renderToString(() => App());
// => '<div data-d-id="0" class="_flex _col _gap4 _p6"><h1 data-d-id="1">Hello from SSR</h1>...'
```

### Client (Hydration)

```js
import { hydrate, installHydrationRuntime } from 'decantr/ssr';
import { createEffect } from 'decantr/state';
import { pushScope, popScope, drainMountQueue, runDestroyFns } from 'decantr/core';
import { h, text, cond, list, onMount } from 'decantr/core';

// Install runtime once before hydrating
installHydrationRuntime(
  { createEffect },
  { pushScope, popScope, drainMountQueue, runDestroyFns }
);

// Hydrate — reuses existing DOM, attaches event listeners + signal bindings
hydrate(document.getElementById('app'), () => App());
```

## API Reference

### `renderToString(component)`

Renders a component function to an HTML string.

- Signals are read once without creating subscriptions
- Effects are not created
- `onMount`/`onDestroy` callbacks are ignored
- Each element gets a `data-d-id` attribute for hydration matching
- Returns a complete HTML string

```js
const html = renderToString(() => App());
res.send(`<!DOCTYPE html><html><body><div id="app">${html}</div></body></html>`);
```

### `renderToStream(component)`

Same as `renderToString` but returns a `ReadableStream` that yields HTML chunks incrementally. Useful for large pages where you want to start sending HTML before the entire tree is serialized.

```js
const stream = renderToStream(() => App());

// Node.js HTTP response
const reader = stream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  res.write(value);
}
res.end();

// Or pipe to a Response (Deno, Bun, edge functions)
return new Response(stream, {
  headers: { 'Content-Type': 'text/html' }
});
```

### `hydrate(root, component)`

Walks the existing server-rendered DOM and attaches:
- Event listeners from component props
- Signal subscriptions for reactive text/attribute updates
- Conditional (`cond`) and list (`list`) reactivity
- `onMount` callbacks

The existing DOM is **reused**, not recreated. Matching is done by position (depth-first tree walk), not by `data-d-id`.

```js
hydrate(document.getElementById('app'), () => App());
```

### `installHydrationRuntime(stateMod, lifecycleMod)`

Must be called once on the client before `hydrate()`. Provides the reactive runtime:

```js
installHydrationRuntime(
  { createEffect },                    // from decantr/state
  { pushScope, popScope, drainMountQueue, runDestroyFns }  // from decantr/core
);
```

### `isSSR()`

Returns `true` during `renderToString`/`renderToStream` execution, `false` otherwise. Use this to conditionally skip browser-only code:

```js
function App() {
  if (!isSSR()) {
    // Browser-only initialization
    window.addEventListener('resize', handleResize);
  }
  return ssrH('div', null, 'content');
}
```

## Signal State During SSR

During SSR, signals are **evaluated once** without creating reactive subscriptions:

```js
const [count, setCount] = createSignal(0);

renderToString(() => {
  // count() reads the current value (0) but does NOT subscribe
  return ssrH('span', null, ssrText(() => count()));
});

setCount(5);
// The rendered HTML still shows "0" — no reactive updates during SSR
```

This is by design: SSR produces a static snapshot of your UI. Reactivity only activates after hydration on the client.

## Limitations

1. **No browser APIs during SSR**: `window`, `document`, `localStorage`, `fetch` (unless polyfilled), `requestAnimationFrame` are not available
2. **No effects**: `createEffect` callbacks are not executed during SSR
3. **No lifecycle**: `onMount`/`onDestroy` are no-ops during SSR
4. **No DOM manipulation**: Components must use `ssrH`/`ssrText`/`ssrCond`/`ssrList` instead of `h`/`text`/`cond`/`list`
5. **No Portals**: `Portal` components are not supported in SSR
6. **Static routing**: The router must be configured to resolve the correct page for the request URL before calling `renderToString`
7. **CSS is not injected**: The atomic CSS runtime does not inject styles during SSR. Include your CSS in the HTML shell or use build-time extraction

## Hydration Mismatch

If the SSR HTML doesn't match the client-side render, hydration will still work but may produce visual glitches. Common causes:

- Different signal values between server and client
- Browser-only branches (`if (typeof window !== 'undefined')`)
- Date/time-dependent content
- Random values

Guard against mismatches by ensuring the component produces identical output for the same inputs on both server and client.

### `ssrComponent(factory)`

Creates a universal component that works in both SSR and client contexts. The factory function receives `(h, text, cond, list, css)` — during SSR these are the SSR primitives; on the client they throw (you must import real implementations directly).

```js
import { ssrComponent } from 'decantr/ssr';

const Greeting = ssrComponent((h, text, cond, list, css) => {
  return (props) => {
    return h('div', { class: css('_flex _col _gap4') },
      h('h2', null, text(() => `Hello, ${props.name}!`)),
      cond(
        () => props.showDetails,
        () => h('p', null, 'Details go here...')
      )
    );
  };
});

// During SSR:
renderToString(() => Greeting({ name: 'World', showDetails: true }));
```

The factory pattern means your component code is written once and automatically uses the correct primitives based on context. `ssrComponent()` checks `isSSR()` internally — if true, it passes SSR primitives to the factory; otherwise it throws, signaling that you should import `h`, `text`, etc. directly for client rendering.

## Integration Example: Express

```js
import express from 'express';
import { renderToString, ssrH, ssrText, ssrCss } from 'decantr/ssr';
import { createSignal } from 'decantr/state';

const app = express();

app.get('/', (req, res) => {
  const html = renderToString(() =>
    ssrH('div', { id: 'app', class: ssrCss('_flex _col _gap4') },
      ssrH('h1', null, 'Server-Rendered Decantr App'),
      ssrH('p', null, 'Hydration will activate interactivity.')
    )
  );

  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My App</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div id="app">${html}</div>
  <script type="module" src="/client.js"></script>
</body>
</html>`);
});

app.listen(3000);
```

## Integration Example: Hono (Edge)

```js
import { Hono } from 'hono';
import { renderToStream, ssrH } from 'decantr/ssr';

const app = new Hono();

app.get('/', (c) => {
  const stream = renderToStream(() =>
    ssrH('div', { id: 'app' }, ssrH('h1', null, 'Edge SSR'))
  );
  return new Response(stream, {
    headers: { 'Content-Type': 'text/html' }
  });
});

export default app;
```



## Signal Behavior During SSR


During SSR, signals are **evaluated once** without creating reactive subscriptions.
`createEffect` callbacks do NOT execute. `onMount`/`onDestroy` are no-ops.
The result is a static HTML snapshot — reactivity only activates after client-side hydration.

```js
const [count, setCount] = createSignal(0);
renderToString(() => {
  // count() reads 0 but does NOT subscribe
  return ssrH('span', null, ssrText(() => count()));
});
setCount(5); // No effect on rendered HTML — still shows "0"
```


## Hydration Contract


1. Call `installHydrationRuntime()` **once** before any `hydrate()` call
2. Pass the same component function to `hydrate()` that was used for `renderToString()`
3. The client render must produce the **same DOM structure** as SSR (same elements, same order)
4. Hydration walks the DOM by position (depth-first), not by `data-d-id`
5. Existing DOM nodes are **reused** — event listeners and signal subscriptions are attached to them

```js
// Client bootstrap
import { hydrate, installHydrationRuntime } from 'decantr/ssr';
import { createEffect } from 'decantr/state';
import { pushScope, popScope, drainMountQueue, runDestroyFns } from 'decantr/core';

installHydrationRuntime(
  { createEffect },
  { pushScope, popScope, drainMountQueue, runDestroyFns }
);

hydrate(document.getElementById('app'), () => App());
```


## Universal Components (ssrComponent)


`ssrComponent(factory)` creates a component that works in both SSR and client contexts.
The factory receives `(h, text, cond, list, css)` — during SSR these are SSR primitives.

```js
import { ssrComponent } from 'decantr/ssr';

const Card = ssrComponent((h, text, cond, list, css) => {
  return (props) => h('div', { class: css('_bgmuted _r2 _p4') },
    h('h3', null, text(() => props.title)),
    cond(() => props.body, () => h('p', null, text(() => props.body)))
  );
});
```


## Common Pitfalls


1. **Browser APIs in SSR** — `window`, `document`, `localStorage` don't exist on the server. Guard with `isSSR()`
2. **Hydration mismatch** — Different signal values, browser-only branches, or time-dependent content between server and client cause glitches
3. **CSS not injected** — Atomic CSS runtime doesn't inject during SSR. Use build-time CSS extraction (`npx decantr build`) or inline critical CSS
4. **Portals unsupported** — `Portal` components are not available during SSR
5. **Static routing** — Resolve the correct page component for each request URL before calling `renderToString`
6. **Effects don't run** — `createEffect` callbacks are skipped during SSR. Data fetching must happen before `renderToString`
7. **Forgetting installHydrationRuntime** — Must be called once on the client before `hydrate()`


## Integration Patterns


### Express (Node.js)
```js
import express from 'express';
import { renderToString, ssrH, ssrCss } from 'decantr/ssr';

const app = express();
app.use(express.static('dist'));

app.get('/', (req, res) => {
  const html = renderToString(() => App());
  res.send(`<!DOCTYPE html><html><body><div id="app">${html}</div><script type="module" src="/client.js"></script></body></html>`);
});
```

### Edge (Hono / Cloudflare Workers)
```js
import { Hono } from 'hono';
import { renderToStream, ssrH } from 'decantr/ssr';

const app = new Hono();
app.get('/', (c) => {
  const stream = renderToStream(() => App());
  return new Response(stream, { headers: { 'Content-Type': 'text/html' } });
});
```

### Data Prefetching
```js
// Server: fetch + render + embed state
const data = await fetch('https://api.example.com/items').then(r => r.json());
const html = renderToString(() => ItemsPage(data));
res.send(`...<script>window.__PREFETCHED__ = ${JSON.stringify(data)}</script>...`);

// Client: hydrate with same data
const data = window.__PREFETCHED__ || [];
hydrate(root, () => ItemsPage(data));
```


---

# SSR Import Catalog


```js
// Server
import { renderToString, renderToStream, ssrH, ssrText, ssrCond, ssrList, ssrCss, ssrOnMount, ssrOnDestroy, ssrComponent, isSSR } from 'decantr/ssr';
import { createSignal, createMemo } from 'decantr/state';

// Client (hydration)
import { hydrate, installHydrationRuntime } from 'decantr/ssr';
import { createEffect } from 'decantr/state';
import { pushScope, popScope, drainMountQueue, runDestroyFns } from 'decantr/core';
```