# Spatial Design Language

Comprehensive spatial intelligence for Decantr. Every spacing, sizing, and layout decision an LLM makes should be traceable to a rule in this document. Spacing is not decoration — it encodes meaning.

## The Four Functions of Whitespace

| Function | What it communicates | Primary tool |
|----------|---------------------|-------------|
| **Grouping** | Related elements are close; unrelated are far | Proximity tiers (§4) |
| **Hierarchy** | More whitespace = more importance | Visual weight rules (§10) |
| **Rhythm** | Consistent spacing = scannable, predictable | Vertical rhythm (§9) |
| **Density** | Less spacing = more information | Density zones (§6), density classes (§17) |

In the Decantation Process vocabulary, this is the **Clarity** layer — whitespace, density, and compound spacing derived from the Character trait.

---

## 1. The Spacing Scale

Decantr's spacing scale (defined in `css/derive.js` as `--d-sp-*` tokens):

| Token | Value | Atom | Usage scope |
|-------|-------|------|-------------|
| `--d-sp-0-5` | 2px (0.125rem) | `_p0` | Hairline gaps, badge offsets |
| `--d-sp-1` | 4px (0.25rem) | `_p1` | Icon-text gaps, helper text, micro-spacing |
| `--d-sp-1-5` | 6px (0.375rem) | — | Button-sm padding, chip gap |
| `--d-sp-2` | 8px (0.5rem) | `_p2` | Input padding, control gaps, touch target spacing |
| `--d-sp-2-5` | 10px (0.625rem) | — | Button-lg padding, tab padding |
| `--d-sp-3` | 12px (0.75rem) | `_p3` | Cell padding, compound-gap default |
| `--d-sp-4` | 16px (1rem) | `_p4` | **Anchor value.** Default container padding, form field gaps |
| `--d-sp-5` | 20px (1.25rem) | `_p5` | Compound-pad (dark themes) |
| `--d-sp-6` | 24px (1.5rem) | `_p6` | Compound-pad (light themes), card padding |
| `--d-sp-8` | 32px (2rem) | `_p8` | Section inline padding, hero margins |
| `--d-sp-10` | 40px (2.5rem) | `_p10` | Large layout spacing |
| `--d-sp-12` | 48px (3rem) | `_p12` | Section block padding |
| `--d-sp-16` | 64px (4rem) | `_p16` | Hero block padding, landmark spacing |

### Why non-linear

The scale follows the Weber-Fechner law: human perception requires proportionally larger differences to notice change at larger magnitudes. The jumps (2→4→8→12→16→24→32→48→64) increase because a 4px difference at 8px is noticeable, but a 4px difference at 48px is invisible.

### The 16px anchor

16px (`--d-sp-4` / `_p4`) is the gravitational center of the spacing system. It is: the default font size, the default container padding, the default form field gap, and a factor of all common screen widths (320, 768, 1024, 1280, 1440, 1920). When in doubt, 16px is the safe default for general component spacing.

### Two scopes

| Scope | Range | Purpose | Examples |
|-------|-------|---------|---------|
| **Component** | 2-24px (sp-0-5 to sp-6) | Internal padding, gaps between sub-elements | Button padding, icon-text gap, input padding |
| **Layout** | 24-64px+ (sp-6 to sp-16) | Section margins, page structure, major separators | Hero padding, section gaps, page margins |

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

---

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

## 9. Visual Weight & Whitespace

Heavier visual elements need more surrounding whitespace to feel balanced.

### Weight factors (by impact)

1. **Size** — Larger elements have more weight, need proportionally more margin
2. **Contrast** — Dark elements on light backgrounds (or vice versa) carry high weight
3. **Color saturation** — Vivid/saturated colors weigh more than muted
4. **Texture/Detail** — Images, dense text, filled icons weigh more than simple shapes
5. **Shape** — Compact regular shapes (squares) weigh more than open/irregular shapes

### Spacing rules by weight

| Element | Weight | Surrounding Space | Example |
|---------|--------|-------------------|---------|
| Display heading (32px+) | Heavy | 1.5-2× normal gap | `_mt12` vs body's `_mt6` |
| Hero image | Heavy | `_my8`–`_my16` from neighbors | Full-bleed needs large vertical margin |
| Data table (aggregate) | Heavy | `_my6`–`_my8` from surrounding content | Dense tables need breathing room |
| Icon-heavy toolbar | Medium (aggregate) | `_p2` internal (icons create density) | Light padding, icons fill the space |
| Body paragraph | Light | Standard gap (`_gap4`) | No extra space needed |
| Metadata (timestamp, tags) | Very light | Minimal (`_gap1`–`_gap2`) | Compact, subordinate |

### The asymmetry rule

More space **above** heavy elements, less **below**:
- Headings: `_mt8 _mb3` (not `_my6`) — binds heading to its section
- Section dividers: more space above than below
- Cards with bottom actions: actions provide visual weight at the bottom, reducing the need for bottom padding

---

## 10. Optical Alignment Corrections

Mathematical spacing sometimes looks wrong. These corrections account for human perception:

| Situation | Correction | Notes |
|-----------|-----------|-------|
| **All-caps button text** | Reduce bottom padding ~2px | No descenders → mathematical center looks bottom-heavy |
| **Rounded corners** | Add ~2px more internal padding | Prevents content appearing to touch the curve; especially relevant with `--d-radius-lg` |
| **Icons in containers** | Shift ~2px down from mathematical center | Most icons have more visual weight in upper portion |
| **Play/arrow icons** | Shift 2-4px right of center | Visual weight is on the left/base of the triangle |
| **Buttons with leading icon** | Icon-side padding can be 2-4px less | Icon provides visual fill that padding would duplicate |
| **Cards with full-bleed top image** | No top padding for the image | Compound-pad applies only to text sections |
| **Circle vs square** at same dimensions | Circle appears ~2-4% smaller | Enlarge circles slightly to appear equal |

**Concentric radius rule:** When a rounded-rect child is nested inside a rounded-rect parent with padding between them, the inner radius MUST equal `outer radius − padding`. This produces concentric curves that look intentional. Mismatched radii (e.g., `8px` inner inside `16px` outer with `2px` padding) create a flat-inside-round artifact. In Decantr this is enforced via the `--d-radius-panel` / `--d-radius-inner` token pair in the RADIUS presets in `derive.js`. When adding a new preset, always compute `inner = panel − container padding`.

**In Decantr**: Most optical corrections are handled in `_base.js` component CSS. When building new components, visually verify alignment — don't assume mathematical centering is optically correct.

---

## 11. Z-Axis Spatial Rules

Elevation determines how far floating elements sit from their triggers. Higher elevation = more offset + more shadow.

| Component | Offset Token | Value | Z-Index Token | Elevation |
|-----------|-------------|-------|--------------|-----------|
| Form dropdowns (Select, Combobox) | `--d-offset-dropdown` | 2px | `--d-z-dropdown` (1000) | Low |
| Menus, context menus | `--d-offset-menu` | 4px | `--d-z-dropdown` (1000) | Low-medium |
| Tooltips | `--d-offset-tooltip` | 6px | `--d-z-tooltip` (1500) | Medium |
| Popovers, hover cards | `--d-offset-popover` | 8px | `--d-z-popover` (1300) | Medium-high |
| Toasts | Fixed, 24px from viewport edge | — | `--d-z-toast` (1400) | High |
| Modals, dialogs | Centered with overlay | — | `--d-z-modal` (1200) | Highest |
| Drawers, sheets | Slide from edge, 0px offset | — | `--d-z-modal` (1200) | Highest |

### Rules

- **Offset direction**: Floating elements appear in the direction of action — dropdowns go down, tooltips go contextually (prefer above, then flip)
- **Collision handling**: When a floating element would overflow the viewport, flip to opposite side maintaining the same offset distance
- **Never hardcode offsets** — always use `--d-offset-*` tokens

---

## 12. Component Anatomy Rules

### Header / Body / Footer (compound components)

All compound components (Card, Modal, Drawer, Sheet) follow the compound spacing contract:

| Section | Padding Rule | Border |
|---------|-------------|--------|
| **Header** | `var(--d-compound-pad) var(--d-compound-pad) 0` | No bottom border (unless body scrolls beneath) |
| **Body** | `var(--d-compound-gap) var(--d-compound-pad)` | None |
| **Body:last-child** | Adds `padding-bottom: var(--d-compound-pad)` | None |
| **Footer** | `var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)` | Top separation via compound-gap (not a visible border) |

### Divider placement

- **Between siblings**: Use `d-dividey` on parent (never manual `<hr>` above first or below last child)
- **Footer top**: Always has visual separation from body (compound-gap provides it)
- **Header bottom**: Only add a border when the body scrolls beneath the header
- **Inset dividers in lists**: Indent to align with text start, not leading icon
- **Never**: place a divider between the last item and container edge — padding handles this

### Leading / Trailing content

| Position | Width | Gap to Main | Alignment |
|----------|-------|-------------|-----------|
| **Leading** (icon, avatar, checkbox) | Fixed | `_gap2` (8px) | Center (single-line), top (multi-line) |
| **Main** (title, description) | Flex-grow | — | Start |
| **Trailing** (action, badge, chevron) | Fixed | `_gap2` (8px) | Center (single-line), top (multi-line) |

### Action placement

| Context | Primary Action | Secondary Action | Destructive Action |
|---------|---------------|-----------------|-------------------|
| **Dialogs/modals** | Rightmost | Left of primary | Leftmost (with larger gap) |
| **Cards** | In footer, consistent alignment | Same row | Separate row or leftmost |
| **Forms** | Submit right-aligned (or left — pick one, never mix) | Cancel left of submit, `_gap2` | — |
| **Button groups** | `_gap2` between related | `_gap4`–`_gap6` between groups | Isolated with `_mla` (margin-left: auto) |

---

## 13. Navigation & Chrome Spacing

Navigation is chrome — it's scanned, not read. Tight density zone applies.

### Rules

- **Grouped nav items** (segmented controls, chip filters) form a single visual unit → `_gap0` to `_gap1`
- **Internal padding creates separation** — when nav items have their own padding (`_px2 _py1`), external gap between them is redundant or minimal
- **Logo gets asymmetric spacing** — use `_mr4`–`_mr6` on the logo vs `_gap2` between nav items. This separates identity from navigation
- **Toolbar grouping** — related tools cluster together (bold/italic/underline: `_gap0` or `_gap1`); unrelated groups separate with `_gap3`–`_gap4` or a `Separator` component
- **Breadcrumbs** — separator character gets `_gap1`–`_gap2` on each side; breadcrumb items themselves have no extra gap
- **Tab bars** — tabs use squish inset internally (`_py2 _px4`); the tab container uses `_gap0` because tab borders/indicators handle visual separation

---

## 14. Grid & Column System

### Decantr grid atoms

| Atom | CSS | Use |
|------|-----|-----|
| `_gc1`–`_gc12` | `grid-template-columns: repeat(N, minmax(0, 1fr))` | Fixed column count |
| `_gcaf160`–`_gcaf320` | `repeat(auto-fit, minmax(Npx, 1fr))` | Responsive auto-fit |
| `_span1`–`_span12` | `grid-column: span N` | Column span |
| `_spanfull` | `grid-column: 1 / -1` | Full row |

### Column count by content type

| Content | Desktop Columns | Auto-fit Min | Rationale |
|---------|----------------|-------------|-----------|
| Cards/tiles | 3-4 (`_gc3`, `_gc4`) | `_gcaf280` (280px) | Cards need ~280px to show content |
| KPI/stats | 4 (`_gc4`) | `_gcaf220` (220px) | Compact metrics, smaller minimum |
| Product grid | 3-4 | `_gcaf220` (220px) | Product cards with image + title + price |
| Article/documentation | 1 (centered `_ctr`) | — | Single column for readability |
| Dashboard widgets | 12 with variable `_span` | — | Mixed widget sizes in master grid |
| Photo/media | 3-6 | `_gcaf160` (160px) | Thumbnails can be small |

### Container widths

| Atom | Max-width | Use |
|------|-----------|-----|
| `_ctrsm` | 640px | Auth forms, settings pages, narrow content |
| `_ctr` | 960px | Article content, documentation, focused UIs |
| `_ctrlg` | 1080px | Standard app content, general pages |
| `_ctrxl` | 1280px | Wide app layouts, dashboards, multi-column |

### Max line length

Target ~60 characters per line for readability. `_ctr` (960px) with default body font achieves this. For wider containers, use multi-column layouts rather than stretching text across the full width.

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

| Character Trait | Density | Section Padding | Content Gap | Chrome Gap | Zone Emphasis |
|----------------|---------|-----------------|-------------|------------|--------------|
| "minimal", "clean" | Spacious | Landmark (`_py16`) | `_gap6` | `_gap2` | Showcase + Content |
| "professional", "balanced" | Comfortable | Sectional (`_py12`) | `_gap4` | `_gap2` | Content + Controls |
| "tactical", "dense" | Compact | Grouped (`_py8`) | `_gap3` | `_gap1` | Data-dense + Chrome |
| "editorial", "luxurious" | Spacious | Landmark (`_py24`) | `_gap8` | `_gap2` | Showcase |
| "technical", "utilitarian" | Compact | Sectional (`_py8`) | `_gap3` | `_gap1` | Controls + Data-dense |

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

**See also:** `reference/atoms.md`, `reference/compound-spacing.md`, `reference/tokens.md`, `reference/decantation-process.md`
