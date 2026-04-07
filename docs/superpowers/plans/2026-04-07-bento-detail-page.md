# Bento Detail Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the content detail page as a spatial bento grid with glass cards, immersive backdrops, animated terminal install card, and per-type data surfacing.

**Architecture:** Update decantr-content (new pattern + 12 decorators + archetype update) → publish through CI → decantr sync/refresh in registry → build bento page components from updated context files. The detail page is decomposed into ~15 focused components: backdrop, bento grid container, cursor glow, terminal card, identity card, schema toggle, and per-type data cards.

**Tech Stack:** Next.js 16, Tailwind CSS 4, Decantr treatments/decorators, CSS Grid, IntersectionObserver, requestAnimationFrame

**Spec:** `docs/superpowers/specs/2026-04-07-bento-detail-page-design.md`

---

## File Structure

### decantr-content (~/projects/decantr-content)

```
patterns/content-detail-bento.json  # CREATE — full pattern v2 JSON
archetypes/registry-browser.json    # MODIFY — detail page layout + deps + page_briefs
themes/luminarum.json               # MODIFY — add 12 decorator_definitions
```

### apps/registry/src

```
app/(public)/[type]/[namespace]/[slug]/
  page.tsx                          # REWRITE — bento grid page
  copy-install-button.tsx           # DELETE — replaced by terminal card

components/bento/
  bento-backdrop.tsx                # CREATE — backdrop layer (screenshot OR orbs+geo)
  bento-grid.tsx                    # CREATE — grid container + cursor glow
  bento-card.tsx                    # CREATE — base glass card with hover lift
  terminal-card.tsx                 # CREATE — macOS terminal with typing animation
  identity-card.tsx                 # CREATE — name, type, namespace, version, desc
  schema-card.tsx                   # CREATE — expandable JSON viewer toggle
  tags-card.tsx                     # CREATE — tag pills
  used-by-card.tsx                  # CREATE — install count
  sparkline-card.tsx                # CREATE — SVG sparkline
  compose-card.tsx                  # CREATE — blueprint archetype list
  features-card.tsx                 # CREATE — feature pills
  theme-preview-card.tsx            # CREATE — mini swatch + mode/shape
  routes-card.tsx                   # CREATE — route list by section
  personality-card.tsx              # CREATE — pull-quote with lum-quote
  route-map-card.tsx                # CREATE — SVG topology diagram
  visual-brief-card.tsx             # CREATE — pattern visual_brief
  components-card.tsx               # CREATE — pattern component list
  presets-card.tsx                  # CREATE — pattern preset pills
  responsive-card.tsx               # CREATE — mobile/tablet/desktop hints
  slots-card.tsx                    # CREATE — pattern slot definitions
  palette-card.tsx                  # CREATE — theme color swatch grid
  decorators-card.tsx               # CREATE — theme decorator list
  modes-shapes-card.tsx             # CREATE — theme modes + shapes
  geo-pattern.tsx                   # CREATE — SVG geometric pattern generator

app/globals.css                     # MODIFY — add 12 new decorator CSS classes

components/showcase-preview-hero.tsx # DELETE — replaced by backdrop
```

---

## Task 1: Create content-detail-bento pattern in decantr-content

**Files:**
- Create: `~/projects/decantr-content/patterns/content-detail-bento.json`

- [ ] **Step 1: Create the pattern JSON**

Read the spec section 11a for the complete JSON. Copy it verbatim from the spec into the file. The spec contains the full v2 pattern with all fields: `$schema`, `id`, `version`, `decantr_compat`, `name`, `description`, `dependencies`, `components`, `default_preset`, 4 presets (default/blueprint/pattern/theme), `default_layout`, `visual_brief`, `responsive`, `composition`, `motion`, `accessibility`, `layout_hints`.

- [ ] **Step 2: Validate**

```bash
cd ~/projects/decantr-content
node validate.js
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add patterns/content-detail-bento.json
git commit -m "feat: add content-detail-bento pattern for bento grid detail page"
```

---

## Task 2: Add 12 decorator definitions to Luminarum theme

**Files:**
- Modify: `~/projects/decantr-content/themes/luminarum.json`

- [ ] **Step 1: Read the spec section 10 for all 12 decorator definitions**

The spec contains the complete JSON for: `lum-bento-grid`, `lum-bento-card`, `lum-terminal`, `lum-terminal-titlebar`, `lum-terminal-dots`, `lum-terminal-body`, `lum-backdrop-orbs`, `lum-backdrop-geo`, `lum-backdrop-screenshot`, `lum-quote`, `lum-sparkline`, `lum-stagger`.

- [ ] **Step 2: Add the 12 definitions to luminarum.json**

Add each definition to the `decorator_definitions` object in the theme JSON. Also add the 12 class names to the `decorators` array (the short name list). Match the existing structure exactly — each definition needs: `description`, `intent`, `suggested_properties`, `pairs_with`, `usage`, plus optional `mode_overrides`/`variants`/`pseudo`.

- [ ] **Step 3: Validate**

```bash
cd ~/projects/decantr-content
node validate.js
```

- [ ] **Step 4: Commit**

```bash
git add themes/luminarum.json
git commit -m "feat(luminarum): add 12 bento detail page decorator definitions"
```

---

## Task 3: Update registry-browser archetype

**Files:**
- Modify: `~/projects/decantr-content/archetypes/registry-browser.json`

- [ ] **Step 1: Update detail page default_layout**

Change the `detail` page entry's `default_layout` from `["content-detail-hero", "json-viewer"]` to `["content-detail-bento"]`.

- [ ] **Step 2: Update dependencies.patterns**

Remove `content-detail-hero` and `json-viewer` from the dependencies. Add `content-detail-bento: "^1.0.0"`.

- [ ] **Step 3: Update page_briefs.detail**

Replace the detail page brief with:
```
"Content detail page as a spatial bento grid. Glass-treated cards float over an immersive backdrop (faded screenshot for blueprints, animated type-colored orbs + geometric SVG for others). Identity card with name, namespace, type, version. Animated macOS terminal card with install command. Per-type cards surface rich data (personality, visual brief, palette, composition, routes, components, presets). JSON collapsed behind View Source toggle."
```

- [ ] **Step 4: Validate**

```bash
cd ~/projects/decantr-content
node validate.js
```

- [ ] **Step 5: Commit**

```bash
git add archetypes/registry-browser.json
git commit -m "feat(registry-browser): update detail page to content-detail-bento pattern"
```

---

## Task 4: Publish content and refresh registry

**Files:** No file changes — pipeline execution.

- [ ] **Step 1: Push decantr-content**

```bash
cd ~/projects/decantr-content
git push origin main
```

- [ ] **Step 2: Wait for CI and verify**

```bash
gh run watch --repo decantr-ai/decantr-content
curl -s https://api.decantr.ai/v1/patterns/@official/content-detail-bento | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('slug','NOT FOUND'))"
```

Expected: `content-detail-bento`

- [ ] **Step 3: Sync and refresh in registry**

```bash
cd ~/projects/decantr-monorepo/apps/registry
node ../../packages/cli/dist/bin.js sync
node ../../packages/cli/dist/bin.js refresh
```

- [ ] **Step 4: Verify context files updated**

```bash
grep "content-detail-bento" .decantr/context/section-registry-browser.md
```

Expected: the pattern appears in the section context.

---

## Task 5: Add new decorator CSS to globals.css

**Files:**
- Modify: `apps/registry/src/app/globals.css`

- [ ] **Step 1: Read the spec section 10 decorator definitions**

Each decorator has `suggested_properties` with the exact CSS. Generate the CSS classes from those properties and add them to the `@layer decorators` section in globals.css.

- [ ] **Step 2: Add all 12 decorator classes**

Add to the `@layer decorators` block in globals.css. The CSS must match the `suggested_properties` from each definition, including `mode_overrides` (as `html.light .class-name`), `variants` (as `.class-name[data-variant]` or `.class-name:hover`), and `pseudo` (as `.class-name::before` / `::after`).

Key classes:
- `.lum-bento-grid` — CSS Grid 4-col, responsive via media queries
- `.lum-bento-card` — glass treatment, hover lift, accent border transition
- `.lum-terminal` — fixed dark bg, rounded, shadow
- `.lum-terminal-titlebar` — 40px flex bar
- `.lum-terminal-dots` — flex row, 8px gap
- `.lum-terminal-body` — monospace, padding
- `.lum-backdrop-orbs` — absolute, radial gradients, drift animation
- `.lum-backdrop-geo` — fixed, 6% opacity
- `.lum-backdrop-screenshot` — absolute, cover, gradient overlay pseudo
- `.lum-quote` — accent border, decorative quote pseudo
- `.lum-sparkline` — height, overflow hidden
- `.lum-stagger` — stagger children fade-in (nth-child delays)

Also add the `@keyframes` for the typing cursor blink and the copy ripple.

Add responsive grid rules for `.lum-bento-grid` (2-col at 1024px, 1-col at 640px).

Add `prefers-reduced-motion` overrides for all animated decorators.

- [ ] **Step 3: Build to verify CSS compiles**

```bash
cd ~/projects/decantr-monorepo/apps/registry
npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd ~/projects/decantr-monorepo
git add apps/registry/src/app/globals.css
git commit -m "feat: add 12 bento detail page decorator CSS classes"
```

---

## Task 6: Build bento base components

**Files:**
- Create: `apps/registry/src/components/bento/bento-grid.tsx`
- Create: `apps/registry/src/components/bento/bento-card.tsx`
- Create: `apps/registry/src/components/bento/bento-backdrop.tsx`
- Create: `apps/registry/src/components/bento/geo-pattern.tsx`

- [ ] **Step 1: Build BentoGrid container**

Client component. Renders `lum-bento-grid` CSS class. Implements cursor glow via `pointermove` listener updating `--mouse-x`/`--mouse-y` CSS custom properties on a `::before` pseudo-element. Sets `--lum-type-accent` and `--lum-type-accent-rgb` based on content type prop. Children render inside.

Props: `{ type: string; children: ReactNode }`

- [ ] **Step 2: Build BentoCard wrapper**

Server-safe component. Renders `lum-bento-card` with optional `span` prop (1, 2, or 'full'). Adds `role="region"` and `aria-label`.

Props: `{ span?: 1 | 2 | 'full'; label: string; children: ReactNode; className?: string }`

- [ ] **Step 3: Build BentoBackdrop**

Server-safe component. Conditionally renders either:
- `lum-backdrop-screenshot` (when `screenshotUrl` prop is provided) with background-image inline style (this is the ONE acceptable inline style — dynamic image URL)
- `lum-backdrop-orbs` + `GeoPattern` component (when no screenshot)

Props: `{ screenshotUrl?: string; type: string; dataCount?: number }`

- [ ] **Step 4: Build GeoPattern SVG generator**

Server-safe component. Generates an inline SVG based on content type and count. Returns an SVG element with `lum-backdrop-geo` class.

Props: `{ type: string; count: number; color: string }`

Geometry rules:
- pattern: `count` circles connected by lines (node graph)
- theme: `count` concentric circles
- blueprint: `count` overlapping circles
- shell: nested rectangles
- archetype: `count` radial spokes

- [ ] **Step 5: Build and verify**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 6: Commit**

```bash
git add apps/registry/src/components/bento/
git commit -m "feat: bento grid, card, backdrop, and geo-pattern base components"
```

---

## Task 7: Build terminal card

**Files:**
- Create: `apps/registry/src/components/bento/terminal-card.tsx`

- [ ] **Step 1: Build TerminalCard**

Client component. Renders the macOS terminal window with typing animation.

Structure:
- Outer: `lum-terminal` inside `BentoCard span={2}`
- Title bar: `lum-terminal-titlebar` with `lum-terminal-dots` (three 12px circles)
- Body: `lum-terminal-body` with the command text
- Typing: IntersectionObserver triggers character-by-character animation (~1.5s). Uses `useState` for displayed chars + `useEffect` with `setInterval`.
- Cursor: blinking block cursor (1s interval, CSS animation)
- Copy: button appears after typing completes. On click: copies to clipboard, sets `copied` state for 1.5s, traffic light dots all turn green.
- Copy ripple: green border glow animation (CSS class toggled for 600ms)
- Screen reader: `aria-live="polite"` on the full command text, animated span is `aria-hidden`
- Reduced motion: `prefers-reduced-motion` check skips typing, shows full command immediately

Props: `{ command: string; label?: string }`

The command varies by type (constructed in the parent page):
- Blueprint: `decantr init --blueprint={slug}`
- Pattern: `decantr get pattern {namespace}/{slug}`
- Theme: `decantr theme switch {slug}`
- Shell/Archetype: `decantr get {type} {namespace}/{slug}`

- [ ] **Step 2: Build and verify**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add apps/registry/src/components/bento/terminal-card.tsx
git commit -m "feat: animated macOS terminal card with typing animation and copy feedback"
```

---

## Task 8: Build universal cards (identity, tags, used-by, schema, sparkline)

**Files:**
- Create: `apps/registry/src/components/bento/identity-card.tsx`
- Create: `apps/registry/src/components/bento/tags-card.tsx`
- Create: `apps/registry/src/components/bento/used-by-card.tsx`
- Create: `apps/registry/src/components/bento/schema-card.tsx`
- Create: `apps/registry/src/components/bento/sparkline-card.tsx`

- [ ] **Step 1: IdentityCard**

Server-safe. BentoCard span={2}. Renders: type badge (d-annotation, filled with type accent), namespace badge (d-annotation), name (text-2xl font-bold), version (monospace muted), description (text-sm muted, max 70ch), published date, author name.

Props: `{ name: string; type: string; namespace: string; version: string; description?: string; publishedAt?: string; ownerName?: string }`

- [ ] **Step 2: TagsCard**

Server-safe. BentoCard span={1}. Renders tags as d-annotation pills in flex-wrap. Returns null if no tags.

Props: `{ tags: string[] }`

- [ ] **Step 3: UsedByCard**

Client component. BentoCard span={1}. Animated counter (rAF 500ms) showing install count. Row of placeholder avatar circles (gray, 24px). "Be the first to use this" if count is 0.

Props: `{ count: number }`

- [ ] **Step 4: SchemaCard**

Client component. BentoCard span={'full'}. "View Source" d-interactive ghost button. Toggling expands/collapses the JsonViewer with 300ms height transition (CSS `grid-template-rows: 0fr → 1fr` pattern). Collapsed by default.

Props: `{ data: Record<string, unknown>; title: string }`

- [ ] **Step 5: SparklineCard**

Server-safe. BentoCard span={1}. Renders a small SVG sparkline (60px tall) with a gentle sine wave in the type accent color. "30 day trend" label in text-xs muted.

Props: `{ color: string }`

- [ ] **Step 6: Build and verify**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 7: Commit**

```bash
git add apps/registry/src/components/bento/
git commit -m "feat: universal bento cards — identity, tags, used-by, schema, sparkline"
```

---

## Task 9: Build blueprint-specific cards

**Files:**
- Create: `apps/registry/src/components/bento/compose-card.tsx`
- Create: `apps/registry/src/components/bento/features-card.tsx`
- Create: `apps/registry/src/components/bento/theme-preview-card.tsx`
- Create: `apps/registry/src/components/bento/routes-card.tsx`
- Create: `apps/registry/src/components/bento/personality-card.tsx`
- Create: `apps/registry/src/components/bento/route-map-card.tsx`

- [ ] **Step 1: ComposeCard** — BentoCard span={2}. Vertical list of archetypes from `data.compose`. Each row: role badge (d-annotation colored by role), archetype name (font-medium), description (muted, truncated). Subtle dividers.

- [ ] **Step 2: FeaturesCard** — BentoCard span={1}. Feature names as d-annotation pills in flex-wrap.

- [ ] **Step 3: ThemePreviewCard** — BentoCard span={1}. Theme name heading. Swatch strip (lum-swatch-strip > lum-swatch) for seed colors. Mode badge. Shape badge.

- [ ] **Step 4: RoutesCard** — BentoCard span={1}. Route list grouped by section. Section name as d-label with accent border. Routes in monospace. Route count badge.

- [ ] **Step 5: PersonalityCard** — BentoCard span={1 or 2}. Uses lum-quote decorator. Oversized decorative quote mark. Accent left border. First sentence highlighted in type accent.

- [ ] **Step 6: RouteMapCard** — BentoCard span={1}. Inline SVG. Nodes for each section (circles), connection lines, pulse animation. Clicking shows tooltip.

- [ ] **Step 7: Build and verify**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 8: Commit**

```bash
git add apps/registry/src/components/bento/
git commit -m "feat: blueprint-specific bento cards — compose, features, theme, routes, personality, route-map"
```

---

## Task 10: Build pattern-specific and theme-specific cards

**Files:**
- Create: `apps/registry/src/components/bento/visual-brief-card.tsx`
- Create: `apps/registry/src/components/bento/components-card.tsx`
- Create: `apps/registry/src/components/bento/presets-card.tsx`
- Create: `apps/registry/src/components/bento/responsive-card.tsx`
- Create: `apps/registry/src/components/bento/slots-card.tsx`
- Create: `apps/registry/src/components/bento/palette-card.tsx`
- Create: `apps/registry/src/components/bento/decorators-card.tsx`
- Create: `apps/registry/src/components/bento/modes-shapes-card.tsx`

- [ ] **Step 1: Pattern cards** — VisualBriefCard (lum-quote, span=2), ComponentsCard (icon list, span=1), PresetsCard (d-annotation pills, span=1), ResponsiveCard (3-section breakdown, span=1), SlotsCard (name+description list, span=2).

- [ ] **Step 2: Theme cards** — PaletteCard (swatch grid organized by role, span=2), DecoratorsCard (monospace name + description, span=1), ModesShapesCard (mode/shape badges with mini previews, span=1).

- [ ] **Step 3: Build and verify**

```bash
npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add apps/registry/src/components/bento/
git commit -m "feat: pattern-specific and theme-specific bento cards"
```

---

## Task 11: Rewrite the detail page

**Files:**
- Rewrite: `apps/registry/src/app/(public)/[type]/[namespace]/[slug]/page.tsx`
- Delete: `apps/registry/src/app/(public)/[type]/[namespace]/[slug]/copy-install-button.tsx`
- Delete: `apps/registry/src/components/showcase-preview-hero.tsx`

- [ ] **Step 1: Rewrite page.tsx as the bento detail page**

Server component. Fetches content via `getContent(type, namespace, slug)`. Determines content type. Constructs install command. Checks for screenshot at `/showcase/${slug}/preview.png`.

Layout:
```
BentoBackdrop (screenshot or orbs+geo)
BentoGrid (type={singularType})
  IdentityCard (span=2)
  TerminalCard (span=2, command=installCmd)
  [type-specific cards based on singularType]
  TagsCard (if tags exist)
  UsedByCard (placeholder count)
  SparklineCard
  SchemaCard (span=full, data=content.data)
```

For blueprints: add ComposeCard, FeaturesCard, ThemePreviewCard, RoutesCard, PersonalityCard, RouteMapCard.
For patterns: add VisualBriefCard, ComponentsCard, PresetsCard, ResponsiveCard, SlotsCard.
For themes: add PaletteCard, DecoratorsCard, ModesShapesCard. Auto-preview theme colors via ThemeLabProvider.
For shells/archetypes: IdentityCard + TerminalCard + Tags + Schema (minimal set).

Error handling: separate 404 from transient errors (error card with retry message).

Breadcrumb above the grid.

- [ ] **Step 2: Delete replaced files**

```bash
rm apps/registry/src/app/\(public\)/\[type\]/\[namespace\]/\[slug\]/copy-install-button.tsx
rm apps/registry/src/components/showcase-preview-hero.tsx
```

- [ ] **Step 3: Build and verify all routes**

```bash
npx next build 2>&1 | tail -20
```

Expected: clean build, all routes present.

- [ ] **Step 4: Commit**

```bash
git add -A apps/registry/src/
git commit -m "feat: bento detail page — spatial grid with glass cards, terminal animation, per-type data cards"
```

---

## Task 12: Final verification and push

- [ ] **Step 1: Full build**

```bash
cd ~/projects/decantr-monorepo/apps/registry
npx next build
```

Expected: all routes compile, zero errors.

- [ ] **Step 2: Dev server smoke test**

```bash
npx next dev
```

Visit:
- `/blueprints/@official/registry-platform` — should show screenshot backdrop, compose card, features, personality
- `/patterns/@official/auth-form` — should show orbs backdrop, visual brief, components, presets, slots
- `/themes/@official/luminarum` — should show orbs backdrop, palette grid, decorators, modes/shapes, auto-preview
- `/shells/@official/top-nav-main` — should show minimal bento (identity + terminal + schema)

- [ ] **Step 3: Commit and push**

```bash
cd ~/projects/decantr-monorepo
git add -A
git commit -m "feat: bento detail page complete — spatial grid, glass cards, terminal animation, per-type data surfacing"
git push origin main
```
