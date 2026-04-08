# Decantr LLM-Readability Overhaul

**Date:** 2026-04-08
**Status:** Proposed
**Scope:** Entire Decantr system — CLI (packages/cli), essence-spec (packages/essence-spec), content (decantr-content), MCP server (packages/mcp-server)
**Prerequisite reading:** 2026-04-01-composition-pipeline-v2-design.md (master spec)

---

## Part 1: State of the World

### What the master spec (2026-04-01) promised vs what exists

| Master spec claim | Status | Evidence |
|---|---|---|
| Section contexts inline pattern code examples | **MISSING** | `generateSectionContext` (scaffold.ts:3489-3558) inlines descriptions, composition algebra, slots, responsive — but zero code blocks. No TSX/JSX anywhere in section context output. |
| `meta.target` drives framework-specific scaffolding | **PARTIAL** | Stored in essence and displayed in markdown (scaffold.ts:1260,1764). Never branches logic. No `if (target === 'react')` anywhere. |
| DECANTR.md stays at ~200 lines | **MISSING** | Actual output: 457 lines. Includes 48-line project brief (spec says no project-specific data) and 176-line atom reference table. |
| Section contexts are self-contained (no cross-references) | **PARTIAL** | Three explicit `see also` references: to tokens.css (line 3358), scaffold.md (line 3429), DECANTR.md (line 3362). |
| Development Mode section in scaffold.md | **MATCHES** | Present at scaffold.ts:3620-3629. |
| `decantr_critique` tool exists | **MATCHES** | packages/mcp-server/src/critique.ts with 6-category scoring. |

### Bugs in CLI template output (CSS_APPROACH_CONTENT, scaffold.ts:1284-1589)

| # | Bug | Location | Impact |
|---|---|---|---|
| 1 | `d-surface` documented as `data-variant="raised\|overlay"` but CSS uses `data-elevation="raised\|overlay"` | scaffold.ts:1311 | AI generates non-functional elevation markup. Every scaffold since this was written has this bug. |
| 2 | Hardcoded `carbon-glass`, `carbon-code`, `carbon-card` in composition examples | scaffold.ts:1323,1329,1330 | AI copies wrong decorator names in every non-carbon project |
| 3 | `entrance-fade` referenced unconditionally | scaffold.ts:1530,1573 | Class only generated when theme has `motion.entrance` (treatments.ts:370). AI references a class that may not exist. |
| 4 | Responsive prefix syntax inconsistent: `sm:_row` (line 1334) vs `_sm:gc2` (line 1516) | scaffold.ts:1334 vs 1516 | AI doesn't know which syntax is correct |
| 5 | Section labels instruction embeds raw CSS (`border-left: 2px solid var(--d-accent); padding-left: 0.5rem`) | scaffold.ts:1518-1521 | AI copies this as inline styles. Should reference `d-label[data-anchor]` treatment. |
| 6 | Tokens `--d-font-mono`, `--d-duration-hover`, `--d-easing`, `--d-accent-glow` in Design Tokens table but conditionally generated | scaffold.ts:1548-1551 vs 589-603 | AI references tokens that don't exist in tokens.css for themes that lack the source data |
| 7 | Bracket atom syntax (`_overflow[auto]`, `_h[100vh]`, `_center`) used in shell internal_layout but not documented in atom reference | Shell JSON vs scaffold.ts:1340-1516 | AI sees undocumented syntax in shell specs |

### Bugs in section context generation (scaffold.ts:3238-3583)

| # | Bug | Location | Impact |
|---|---|---|---|
| 8 | Palette tokens listed in context (--d-cyan, --d-pink, --d-amber, etc.) but not generated in tokens.css | scaffold.ts:3312-3358 | AI uses `var(--d-cyan)` and gets nothing. The palette table lists theme seed colors as informational but gives them token names that don't exist in CSS. |
| 9 | Usage example uses `${themePrefix}-glass` where `themePrefix = themeName.split('-')[0]` | scaffold.ts:3419-3421 | For theme `luminarum`, prefix is `luminarum` → class `luminarum-glass`. Actual class is `lum-glass` (from decorator_definitions). The prefix derivation is wrong. |
| 10 | Personality repeated in every section context Visual Direction block | scaffold.ts:3444-3463 | ~80 tokens x 4 sections = 320 wasted tokens. Same paragraph appears in scaffold.md too. |
| 11 | Full 11-decorator table repeated in every section context | scaffold.ts:3362-3418 | Only 2-3 decorators are relevant per section. ~150 tokens x 4 sections of noise. |
| 12 | Orphaned compositions block (hero, pipeline, tool-list, feature-grid) appears in sections where none apply (e.g., auth-flow) | scaffold.ts:3402-3418 (themeHints.compositions) | AI reads "hero" composition in auth-flow context and gets confused |
| 13 | Routes for register and forgot-password defined in auth-flow archetype pages but missing from blueprint route map | Blueprint routes field vs archetype pages | scaffold.md route map has 14 routes; actual app needs 16+. AI builds incomplete router. |
| 14 | Shell zone ambiguity — scaffold.md says "App" zone uses top-nav-main but user-dashboard uses sidebar-main | scaffold.ts:3593 (topology generation) | AI doesn't know which shell applies when navigating between zones |
| 15 | Composition algebra syntax (`>`, `+`, `[]`, `?`, `()`) used everywhere but never explained | Pattern content | AI interprets the grammar differently each time |
| 16 | No framework, icon library, or file structure specified in any generated file | All output files | AI must guess React vs Vue, which icons, where to put files. The essence has `meta.target` and personality often mentions icon libraries (e.g., "Lucide icons throughout") but scaffold.md doesn't emit these as explicit instructions. |
| 17 | No mock data shapes provided despite "mock data on every page" instruction | scaffold.md:3621-3629 | AI invents data shapes that may not match pattern slots |
| 18 | Hotkeys listed as "3 configured" with no detail on what they are or do | scaffold.ts:3716-3726 | AI can't implement hotkeys without knowing the bindings |

### Treatment CSS bugs (treatments.ts)

| # | Bug | Location | Impact |
|---|---|---|---|
| 19 | Missing `[data-variant="danger"]:hover` rule | treatments.ts:122-126 | Hovering a danger button falls through to base hover → turns neutral surface color |
| 20 | `[aria-invalid]` matches `aria-invalid="false"` too | treatments.ts:220 | Inputs explicitly marked valid still get error styling |
| 21 | `d-control` horizontal padding hardcoded as `0.75rem` — not a token | treatments.ts:196 | Can't be adjusted via theme. Minor but inconsistent with spatial token approach. |

### Content repo gaps (decantr-content)

| # | Gap | Impact |
|---|---|---|
| 22 | Zero patterns have `code_examples` field despite master spec calling for it | AI generates every component from scratch with no reference implementation |
| 23 | `meta.target` is set but never drives framework-specific behavior | Content can't provide target-specific guidance |
| 24 | Archetype page_briefs are short prose (1 sentence) with no structural guidance | AI has minimal info for page layout beyond the pattern list |
| 25 | No treatment vocabulary for avatars, breadcrumbs, tabs, success buttons, or status-colored surfaces | AI hand-rolls these common UI elements ~6x per scaffold |
| 26 | Pattern `composition` algebra has no formal syntax reference anywhere in the system | Interpretation varies across AI invocations |

---

## Part 2: Design Principles

These constraints are non-negotiable. Every change in this spec must respect them.

### From the master spec (2026-04-01)
1. **Framework agnosticism** — Decantr does not generate framework-specific code in the core pipeline. `meta.target` can select framework-specific guidance. The AI generates code, not Decantr.
2. **Three-tier context model** — DECANTR.md (methodology), scaffold.md (app overview), section-*.md (per-section). Section contexts should be self-contained.
3. **DECANTR.md stays small** — ~200 lines, methodology only, no project-specific data.
4. **Patterns contain code examples** — preset `code.example` fields are inlined into section contexts.
5. **Essence is source of truth** — everything else is derived and regenerable via `decantr refresh`.

### From LLM behavior analysis
6. **Instructions over documentation** — imperative commands ("Use X") over explanatory prose ("The system provides X").
7. **Templates over descriptions** — code blocks the AI copies and modifies have ~90% compliance. Prose descriptions have ~20%.
8. **Closed vocabulary over open reference** — "choose from THIS list" beats "here's a reference table of 100+ options."
9. **Anti-pattern corrections** — intercepting the AI's most probable wrong outputs ("IF YOU WROTE style={{...}} → CHANGE TO css(...)") has very high compliance.
10. **Co-location** — rules placed next to where they apply (in the component spec) beat rules in a separate methodology doc.

### From existing design decisions
11. **`@layer` cascade** — reset > tokens > treatments > decorators > utilities > app. Immutable.
12. **Treatments use `data-*` attributes** for variants. Not modifier classes.
13. **`@layer decorators` is empty** — AI generates decorator CSS from structured definitions.
14. **Shell `internal_layout` uses semantic properties + Decantr atoms** — not Tailwind.
15. **Personality carries visual opinions** — no separate visual_hints schema.

---

## Part 3: Phase A — Fix CLI Template Bugs

**Goal:** Every bug in the template output (bugs #1-21) is fixed. Every scaffold immediately improves.

**Scope:** `packages/cli/src/scaffold.ts`, `packages/cli/src/treatments.ts`, `packages/cli/test/`

### A1: Fix CSS_APPROACH_CONTENT (scaffold.ts:1284-1589)

This 306-line string constant is 100% hardcoded with zero dynamic substitution. Every bug in DECANTR.md traces to this constant.

**Changes to CSS_APPROACH_CONTENT:**

| Line | Current | Fix |
|---|---|---|
| 1311 | `data-variant="raised\|overlay"` | `data-elevation="raised\|overlay"` |
| 1323 | `d-surface carbon-glass` | Make dynamic: accept `themePrefix` parameter, emit `d-surface ${themePrefix}-glass` |
| 1329 | `carbon-glass`, `carbon-code` | Replace with `${themePrefix}-glass`, `${themePrefix}-code` |
| 1330 | `d-surface carbon-card` | Replace with `d-surface ${themePrefix}-card` |
| 1334 | `css('_col sm:_row')` | `css('_col _sm:_row')` (consistent underscore prefix) |
| 1518-1521 | Raw CSS for section labels | Replace with: "Use the `d-label` class for section headings. For accent-anchored headers, add `data-anchor`: `<span className="d-label" data-anchor>Section Title</span>`" |
| 1530 | Unconditional `entrance-fade` | Conditional: "If treatments.css contains an `entrance-fade` class, apply it to page content containers for transitions." |

**Convert `CSS_APPROACH_CONTENT` from a string constant to a function:**

```typescript
function generateCSSApproach(themePrefix: string, hasEntranceFade: boolean): string {
  return `## CSS Implementation
  ...
  // All carbon-* references become ${themePrefix}-*
  // entrance-fade becomes conditional on hasEntranceFade
  // data-variant becomes data-elevation for d-surface
  ...`;
}
```

The function receives `themePrefix` (derived from the theme's actual decorator_definitions prefix, not `themeName.split('-')[0]`) and `hasEntranceFade` (from theme `motion.entrance`).

**Theme prefix derivation fix:** Currently line 3419 does `themeName.split('-')[0]`. This produces `luminarum` for theme `luminarum`. But decorator class names use `lum-` prefix (from `decorator_definitions` keys). The fix: extract the common prefix from `decorator_definitions` keys. If all decorator names start with `lum-`, the prefix is `lum`. Fall back to `themeName.split('-')[0]` if no decorator_definitions exist.

```typescript
function deriveThemePrefix(decoratorDefinitions?: Record<string, unknown>, themeName?: string): string {
  if (decoratorDefinitions) {
    const keys = Object.keys(decoratorDefinitions);
    if (keys.length > 0) {
      // Find common prefix: lum-canvas, lum-glass, lum-orbs → lum
      const first = keys[0];
      const dashIdx = first.indexOf('-');
      if (dashIdx > 0) {
        const candidate = first.substring(0, dashIdx);
        if (keys.every(k => k.startsWith(candidate + '-'))) {
          return candidate;
        }
      }
    }
  }
  return themeName?.split('-')[0] ?? 'theme';
}
```

### A2: Fix conditional token generation (scaffold.ts:589-603)

Tokens `--d-font-mono`, `--d-duration-hover`, `--d-easing`, `--d-accent-glow` are conditionally emitted but unconditionally referenced in the Design Tokens table (CSS_APPROACH_CONTENT lines 1548-1551).

**Fix:** Always emit these tokens with sensible defaults when the theme doesn't provide them:

```typescript
// In generateTokensCSS, after existing conditional blocks (lines 589-603):
// Always emit utility tokens with defaults if theme doesn't provide them
if (!themeData?.typography?.mono) {
  lines.push('  --d-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;');
}
if (!themeData?.motion?.durations?.hover) {
  lines.push('  --d-duration-hover: 0.15s;');
}
if (!themeData?.motion?.timing) {
  lines.push('  --d-easing: ease;');
}
if (!themeData?.palette?.['accent-glow']) {
  lines.push('  --d-accent-glow: rgba(0, 212, 255, 0.3);');
}
```

### A3: Fix palette token listing (scaffold.ts:3312-3358)

The section context palette table lists `--d-cyan`, `--d-pink`, etc. as token names, but these are NOT in tokens.css. They're informational palette entries.

**Fix:** Two options:
- **Option A:** Actually emit these as CSS custom properties in tokens.css. Add a loop in `generateTokensCSS` that emits `--d-{color}` for each palette entry.
- **Option B:** Change the palette table in section context to show the actual hex values with a note that they're available via the theme palette, not as CSS variables.

**Recommendation: Option A.** Emit them. The AI needs to use `var(--d-coral)` for type-colored badges. Without the CSS variable, it hardcodes hex values.

```typescript
// In generateTokensCSS, after status colors:
// Emit palette colors as CSS custom properties
if (themeData?.palette) {
  for (const [name, values] of Object.entries(themeData.palette)) {
    const modeValue = values[mode] || values.dark || values.light;
    if (modeValue && !['background', 'surface', 'surface-raised', 'border', 'text', 'text-muted', 'primary', 'primary-hover'].includes(name)) {
      lines.push(`  --d-${name}: ${modeValue};`);
    }
  }
}
```

### A4: Fix section context generation

**A4a: Fix theme prefix in usage example (line 3419-3421)**

Replace `themeName.split('-')[0]` with the `deriveThemePrefix()` function from A1.

**A4b: Condense personality in section contexts**

The full personality paragraph (~80 tokens) is repeated in every section context. Condense to a 1-2 sentence summary with actionable utility references, keeping section contexts self-contained without verbatim duplication:

```typescript
// Instead of the full personality paragraph (lines 3444-3463):
// Emit a condensed version with the key actionable elements
const condensed = personality.join(' ').substring(0, 150) + '...';
lines.push(`**Personality (condensed):** ${condensed}`);
lines.push(`**Key utilities:** ${utilityHints.join(', ') || 'none'}`);
```

The full personality narrative remains in scaffold.md for initial project understanding. Section contexts get a reminder + the concrete utility class names the AI should use.

**A4c: Scope decorator tables per section**

Instead of listing all 11 decorators, filter to only those relevant to the section's patterns. Cross-reference pattern `visual_brief` and `layout_hints` to identify which decorators are actually referenced.

```typescript
// Identify relevant decorators by scanning pattern specs for decorator name mentions
const relevantDecorators = decorators.filter(d => {
  const name = d.name.toLowerCase();
  return patternSpecs.some(p =>
    p.visual_brief?.toLowerCase().includes(name) ||
    p.layout_hints?.card_treatment?.toLowerCase().includes(name) ||
    p.description?.toLowerCase().includes(name)
  );
});
// Fall back to full list if none match (safety)
const decoratorList = relevantDecorators.length > 0 ? relevantDecorators : decorators;
```

**A4d: Remove orphaned compositions block**

The compositions block comes from `themeHints.compositions` which is built from `themeData.compositions`. This is theme-level data (hero, feature-grid, pipeline, tool-list) that applies to the whole app, not per section.

**Fix:** Move compositions to scaffold.md (where theme-level data belongs). Remove from section contexts entirely.

**A4e: Remove cross-references**

Replace "Full token set: `src/styles/tokens.css`" (line 3358) with: inline the 5-6 most critical tokens that aren't in the spacing guide. Remove "see DECANTR.md for usage" (line 3362). Remove "For full app topology, see scaffold.md" (line 3429) — instead inline the zone context fully.

**A4f: Fix route map completeness**

The scaffold.md route map is built from `blueprint.routes` (scaffold.ts:2752). But archetype pages that aren't in the blueprint route map (register, forgot-password) are still in the section context.

**Fix:** When building the route map, iterate both blueprint.routes AND all section pages. For pages without a blueprint route entry, generate the route from the section prefix + page path:

```typescript
// After collecting blueprint routes, add any section page routes that are missing
for (const section of sections) {
  for (const page of section.pages) {
    const pagePath = page.path || `/${section.id}/${page.id}`;
    if (!routeMap.has(pagePath)) {
      routeMap.set(pagePath, {
        page: page.id,
        shell: section.shell,
        archetype: section.id
      });
    }
  }
}
```

### A5: Fix treatment CSS bugs

**A5a: Add `[data-variant="danger"]:hover`** (treatments.ts, after line 126)

```typescript
emitRule('.d-interactive[data-variant="danger"]:hover', [
  ['background', 'color-mix(in srgb, var(--d-error) 85%, black)'],
  ['border-color', 'color-mix(in srgb, var(--d-error) 85%, black)'],
]);
```

**A5b: Fix `[aria-invalid]` selector** (treatments.ts line 220)

Change `.d-control[aria-invalid]` to `.d-control[aria-invalid="true"]`.

### A6: Add `entrance-fade` to base treatments (non-conditional)

Currently, `entrance-fade` is only generated when the theme has `motion.entrance`. But DECANTR.md references it unconditionally.

**Fix:** Always generate the `entrance-fade` class with sensible defaults:

```css
.entrance-fade {
  animation: decantr-entrance var(--d-duration-entrance, 0.3s) var(--d-easing, ease-out);
}
@keyframes decantr-entrance {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Move this from the conditional personality block to the base treatments block so it always exists.

---

## Part 4: Phase B — Content Enrichment (decantr-content)

**Goal:** Patterns have code examples. Archetypes have richer page_briefs. Missing treatments are addressed. Content contradictions are fixed.

**Scope:** `decantr-content/patterns/`, `decantr-content/archetypes/`, validation

### B1: Add code examples to high-traffic patterns

The master spec says section contexts should inline code examples. The CLI already looks for `code.example` on pattern presets but no patterns have them.

**Priority patterns (used by registry-platform and 5+ other blueprints):**

1. `content-card-grid` — card grid with type-coded badges
2. `kpi-grid` — metric cards with counter animation
3. `search-filter-bar` — search input with type/namespace dropdowns
4. `auth-form` — login/register/forgot-password forms
5. `activity-feed` — date-grouped event stream
6. `form` — generic form with validation
7. `api-key-row` — masked key with copy/reveal
8. `account-settings` — tabbed settings panel
9. `tier-upgrade-card` — pricing tier comparison
10. `team-member-row` — member with role badge and actions

**Code example format:** JSX (React-like syntax). While not strictly framework-agnostic, JSX is the lingua franca that all AI models understand and can translate to Vue/Svelte/Angular. The `meta.target` field in the essence exists for future multi-framework code example selection — when target-specific examples are available, the CLI should prefer them. For now, JSX is the pragmatic default that maximizes AI compliance across all models.

Each preset gets a `code` object with `example` (string of JSX) and optionally `imports` (string).

**Example for content-card-grid, preset "editable":**

```json
{
  "code": {
    "imports": "import { css } from '@decantr/css';",
    "example": "<div className={css('d-section _flex _col _gap4')} data-density=\"compact\">\n  <span className=\"d-label\" data-anchor>Published ({items.length})</span>\n  <div className={css('_grid _gc1 _md:gc2 _lg:gc3 _gap4')}>\n    {items.map(item => (\n      <div key={item.id} className={css('d-surface _flex _col _gap3')} data-interactive>\n        <div className={css('_flex _row _gap2 _aic')}>\n          <span className=\"d-annotation\" data-status=\"info\">{item.type}</span>\n          <span className={css('_textxs _fgmuted')}>{item.namespace}</span>\n        </div>\n        <h3 className={css('_textlg _fontbold')}>{item.name}</h3>\n        <p className={css('_textsm _fgmuted')}>{item.description}</p>\n      </div>\n    ))}\n  </div>\n</div>"
  }
}
```

**Key properties of each example:**
- Uses `css()` from `@decantr/css` for ALL layout (flex, grid, gap, padding)
- Uses treatment classes for ALL visual (d-surface, d-interactive, d-label, d-annotation)
- Uses `var(--d-*)` tokens for ALL colors (via atom classes like `_fgmuted`, `_fgprimary`)
- Uses `data-anchor` on d-label (not inline border styles)
- Uses `data-density` on d-section
- Uses responsive prefixes (`_md:gc2 _lg:gc3`)
- Zero inline styles for layout/spacing

**Each code example is the canonical template** the AI should copy and modify. It demonstrates the correct Decantr patterns. The AI sees "this is how a card grid looks" and reproduces the pattern.

### B2: Enrich archetype page_briefs

Current page_briefs are 1-sentence descriptions. Expand to include:
- Layout structure (what goes where on the page)
- Key patterns and how they connect
- Data shape (what fields the mock data needs)
- Density context (compact for dashboards, comfortable for marketing)

**Example for user-dashboard, page "content":**

Current:
```json
"content": "Content management grid. Card grid of user-published content items with thumbnail, title, type badge, status indicator, and date per card."
```

Enriched:
```json
"content": "Content management grid. Layout: d-section(data-density=compact) containing d-label(data-anchor) 'Your Content' header, then content-card-grid(preset=editable) with cards grouped by status (Published, Draft, Pending Review). Each card: d-surface(data-interactive) with type badge (d-annotation), title, description, version, date, edit/delete actions. Mock data: 3-5 items per status group. Empty group: show centered empty state with message and 'Create New' CTA."
```

### B3: Add composition algebra syntax reference

Add a `docs/composition-algebra.md` to decantr-content that formally defines the grammar:

```
EXPRESSION = COMPONENT | EXPRESSION > EXPRESSION | EXPRESSION + EXPRESSION
COMPONENT  = Name | Name(decorators) | Name(decorators, hints)
decorators = comma-separated list of: treatment-class, atom-hint, behavior-hint
hints      = key: value pairs
OPERATORS:
  >     contains (parent > child)
  +     adjacent sibling
  []    repeating list (ContentCard[])
  ?     optional (SocialLogin?)
  ()    decorators and hints
  |     alternative (Grid | List)
```

This reference gets inlined at the top of the first pattern reference block in each section context (once per section, ~10 lines).

### B4: Fix type-color contradiction

content-card-grid.json `visual_brief` says "pattern in blue, theme in purple, blueprint in green." The `layout_hints.card_treatment` says "coral for patterns, amber for themes, cyan for blueprints, green for shells."

**Fix:** Update `visual_brief` to match `card_treatment` (which is correct — it matches the luminarum palette):

```
coral (#FE4474/--d-coral) = patterns
amber (#FDA303/--d-amber) = themes
cyan (#0AF3EB/--d-cyan) = blueprints
green (#22C55E/--d-green) = shells
```

---

## Part 5: Phase C — LLM-Readability Restructure

**Goal:** DECANTR.md is ~200 lines per the master spec. Section contexts use imperative instructions instead of descriptive prose. The AI's compliance rate with the design system goes from ~30% to ~70%+.

**Scope:** scaffold.ts (DECANTR.md template, CSS_APPROACH_CONTENT, section context generation), DECANTR.md.template

### C1: Restructure DECANTR.md to ~200 lines

The current 457-line output has three sections that need restructuring:

**C1a: Move the Project Brief** to scaffold.md

The Project Brief (generated at scaffold.ts:1617-1683) contains project-specific data: blueprint name, theme, personality, sections, features, decorators, development workflow. The master spec says DECANTR.md should be project-agnostic methodology.

Move the Project Brief block to the top of scaffold.md. The scaffold already has personality and sections — the brief consolidates this.

**C1b: Replace the 176-line atom reference table with a compact vocabulary**

The atom reference table (lines 1340-1516 of CSS_APPROACH_CONTENT) is a lookup table, not instructions. Replace with a ~40-line "Allowed Vocabulary" block:

```markdown
## Allowed CSS Vocabulary

Use `css()` from `@decantr/css` for ALL layout. Use treatment classes for ALL visual styling.

### REQUIRED in every component file:
```
import { css } from '@decantr/css';
```

### Layout atoms (combine in css()):
_flex _col _row _grid _block _inline _none
_gap{n} _p{n} _m{n} (scale: 1=0.25rem, 2=0.5rem, 3=0.75rem, 4=1rem, 6=1.5rem, 8=2rem)
_w100 _h100 _wfit _hfit _flex1 _grow _shrink0
_aic _jcc _jcsb (align/justify shortcuts)
_gc1-_gc12 _span1-_span12 (grid columns)
_rel _abs _fixed _sticky _inset0
_sm: _md: _lg: (responsive prefixes)

### Treatment classes (use as className, not in css()):
d-surface d-interactive d-control d-label d-annotation d-section d-data

### IF YOU WROTE THIS → CHANGE TO THIS:
style={{ display: 'flex' }}        → className={css('_flex')}
style={{ gap: '1rem' }}            → className={css('_gap4')}
style={{ padding: '1.5rem' }}      → className={css('_p6')}
className="flex flex-col"          → className={css('_flex _col')}
border-left: 2px solid accent      → data-anchor on d-label
```

This is ~40 lines. The full atom reference can live in a separate `docs/atom-reference.md` for human consumption. The AI gets the working vocabulary + anti-pattern corrections.

**C1c: Remove explanatory prose**

Remove "What is Decantr?" (lines 7-11 of template) and "Two-Layer Model" explanation (lines 15-28). These explain philosophy. The AI needs rules, not philosophy. The guard rules table (lines 31-50) is sufficient.

**Target DECANTR.md structure (~180 lines):**

```
# DECANTR.md (~180 lines)
1. Guard Rules table + enforcement tiers + violation protocol (~50 lines)
2. How To Use (source of truth, working on a section, commands) (~30 lines)
3. CSS Implementation (three file setup + treatment table) (~20 lines)
4. Allowed Vocabulary (compact atoms + anti-patterns) (~40 lines)
5. Layout Rules (5 rules) (~10 lines)
6. Motion Philosophy (6 principles) (~12 lines)
7. Interactivity Philosophy (6 principles) (~12 lines)
```

### C2: Restructure section contexts for LLM compliance

The current section context format is descriptive. Change it to imperative.

**C2a: Add required imports block (first thing after header)**

```markdown
## Required Imports

Every component file in this section starts with:
```tsx
import { css } from '@decantr/css';
import '@/styles/tokens.css';
import '@/styles/treatments.css';
import '@/styles/global.css';
```

This exploits LLM autoregressive behavior: once the import is in the file, the AI uses it.

**C2b: Add anti-pattern corrections per section**

After the required imports, add a section-specific anti-pattern block:

```markdown
## Common Mistakes in This Section

WRONG: style={{ borderLeft: '2px solid var(--d-accent)' }}
RIGHT: <span className="d-label" data-anchor>Title</span>

WRONG: style={{ padding: '1rem' }}
RIGHT: className={css('d-surface _p4')}

WRONG: <div style={{ display: 'flex', gap: '1rem' }}>
RIGHT: <div className={css('_flex _gap4')}>
```

These intercept the AI's most probable wrong outputs for this specific section context.

**C2c: Inline code examples from patterns**

When a pattern has `code.example` on its preset, inline it in the section context:

```markdown
### content-card-grid (editable)

**Template — copy and modify:**
```tsx
<div className={css('d-section _flex _col _gap4')} data-density="compact">
  <span className="d-label" data-anchor>Published ({items.length})</span>
  <div className={css('_grid _gc1 _md:gc2 _lg:gc3 _gap4')}>
    {items.map(item => (
      <div key={item.id} className={css('d-surface _flex _col _gap3')} data-interactive>
        ...
      </div>
    ))}
  </div>
</div>
```
```

The `generateSectionContext` function already has the pattern reference block (lines 3489-3558). Add code example rendering after the existing pattern metadata:

```typescript
// After responsive/accessibility in pattern spec (line ~3555):
if (spec.code?.example) {
  lines.push('');
  lines.push('**Template — copy and modify:**');
  lines.push('```tsx');
  lines.push(spec.code.example);
  lines.push('```');
}
```

**C2d: Add concrete nav items, mock data shapes, redirect targets**

In the Shell Implementation block, add explicit nav items derived from the section's pages:

```markdown
### Sidebar Navigation Items
- Overview → /dashboard
- Content → /dashboard/content
- API Keys → /dashboard/api-keys
- Settings → /dashboard/settings
- Billing → /dashboard/billing
- Team → /dashboard/team
```

In the Development Mode block of scaffold.md, add mock data shapes:

```markdown
### Mock Data Shapes

ContentItem: { id, name, slug, type, namespace, version, description, downloads, createdAt, status }
User: { id, username, email, avatar, role, reputation }
APIKey: { id, name, key (masked), createdAt, lastUsed, scopes[] }
```

These are derivable from the pattern slots but should be explicit to prevent AI improvisation.

**C2e: Add hotkey details**

The scaffold already has hotkey data from the blueprint's `navigation.hotkeys` array. Just emit them:

```typescript
// In generateScaffoldContext, after navigation section:
if (navigation?.hotkeys) {
  for (const hk of navigation.hotkeys) {
    lines.push(`  - \`${hk.key}\` → ${hk.route || hk.action} (${hk.label})`);
  }
}
```

### C3: Generate tokens.ts alongside tokens.css

Add a `generateTokensTS()` function to scaffold.ts that emits:

```typescript
// tokens.ts — auto-generated by decantr, do not edit
export const tokens = {
  primary: '#FE4474',
  secondary: '#0AF3EB',
  accent: '#FDA303',
  bg: '#141414',
  surface: '#1E1E1E',
  surfaceRaised: '#262626',
  border: '#2E2E2E',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  // ... all tokens as string constants
} as const;

export type TokenKey = keyof typeof tokens;
```

This lets JavaScript/TypeScript code reference colors without `var()`:

```tsx
// Before: const TYPE_COLORS = { pattern: '#FE4474', theme: '#FDA303' };
// After:  import { tokens } from '@/styles/tokens';
//         const TYPE_COLORS = { pattern: tokens.coral, theme: tokens.amber };
```

---

## Part 6: Phase D — Progressive Generation & Critique Enhancement

**Goal:** The AI generates one component at a time with feedback between steps. `decantr_critique` catches inline styles, missing treatments, and accessibility gaps in generated code.

### D1: Enhance decantr_critique

Current critique (mcp-server/src/critique.ts) does string-matching heuristics. Enhance with:

**D1a: Inline style detection**

```typescript
// Check for inline styles that should be atoms or treatments
const inlineStyleCount = (code.match(/style=\{\{/g) || []).length;
const inlineFlexCount = (code.match(/display:\s*['"]?flex/g) || []).length;
const inlinePaddingCount = (code.match(/padding:\s*['"]?\d/g) || []).length;
const inlineGapCount = (code.match(/gap:\s*['"]?\d/g) || []).length;

if (inlineStyleCount > 5) {
  findings.push({
    category: 'atom-usage',
    severity: 'warning',
    message: `Found ${inlineStyleCount} inline style objects. Use css() atoms for layout (flex, gap, padding, margin).`
  });
}
```

**D1b: Hardcoded color detection**

```typescript
// Check for hardcoded hex colors
const hexColors = code.match(/#[0-9a-fA-F]{3,8}/g) || [];
const nonWhiteHex = hexColors.filter(c => !['#fff', '#ffffff', '#000', '#000000'].includes(c.toLowerCase()));
if (nonWhiteHex.length > 0) {
  findings.push({
    category: 'token-usage',
    severity: 'warning',
    message: `Found ${nonWhiteHex.length} hardcoded colors: ${nonWhiteHex.slice(0, 5).join(', ')}. Use var(--d-*) tokens or import from tokens.ts.`
  });
}
```

**D1c: Accessibility pattern detection**

```typescript
// Check for non-accessible interactive elements
const spanOnClick = (code.match(/<span[^>]*onClick/g) || []).length;
const divOnClick = (code.match(/<div[^>]*onClick/g) || []).length;
if (spanOnClick + divOnClick > 0) {
  findings.push({
    category: 'accessibility',
    severity: 'error',
    message: `Found ${spanOnClick + divOnClick} non-semantic click handlers on <span>/<div>. Use <button> or add role="button" + tabIndex={0} + onKeyDown.`
  });
}
```

**D1d: Treatment compliance scoring**

```typescript
// Check treatment class usage vs inline equivalent
const cssCallCount = (code.match(/css\(/g) || []).length;
const treatmentCount = (code.match(/d-(surface|interactive|control|label|annotation|section|data)/g) || []).length;
const inlineLayoutCount = inlineFlexCount + inlinePaddingCount + inlineGapCount;

const complianceScore = cssCallCount + treatmentCount > 0
  ? (cssCallCount + treatmentCount) / (cssCallCount + treatmentCount + inlineLayoutCount)
  : 0;
```

### D2: Add generation task templates to MCP

Add a new MCP tool `decantr_generate_task` that returns a per-page generation prompt:

```typescript
// Tool: decantr_generate_task
// Input: { section_id: string, page_id: string }
// Output: A focused generation prompt for ONE page with:
//   - Required imports
//   - Shell template (for the page's shell)
//   - Pattern code examples (for the page's patterns)
//   - Anti-pattern corrections
//   - Mock data shape
//   - Success criteria (what critique will check)
```

This enables progressive generation: the AI calls `decantr_generate_task` for each page, generates it, calls `decantr_critique` to check, fixes issues, then moves to the next page.

---

## Part 7: Cross-Impact Analysis

### Changes by repository

| Repository | Phase | Files changed | Type |
|---|---|---|---|
| decantr-monorepo | A | packages/cli/src/scaffold.ts | Bug fixes in templates |
| decantr-monorepo | A | packages/cli/src/treatments.ts | Treatment CSS fixes |
| decantr-monorepo | A | packages/cli/test/ | Updated tests |
| decantr-monorepo | C | packages/cli/src/scaffold.ts | Context restructure |
| decantr-monorepo | C | packages/cli/src/templates/DECANTR.md.template | Template rewrite |
| decantr-monorepo | D | packages/mcp-server/src/critique.ts | Critique enhancement |
| decantr-monorepo | D | packages/mcp-server/src/tools.ts | New generate_task tool |
| decantr-content | B | patterns/*.json (10 priority patterns) | Add code examples |
| decantr-content | B | archetypes/*.json (4 used by registry-platform) | Enrich page_briefs |
| decantr-content | B | patterns/content-card-grid.json | Fix color contradiction |

### Changes by file (scaffold.ts)

scaffold.ts is the largest file (3731 lines) and receives the most changes. Here's the line-level breakdown:

| Phase | Lines affected | Change |
|---|---|---|
| A1 | 1284-1589 | Convert CSS_APPROACH_CONTENT from const to function, fix 7 bugs |
| A2 | 589-603 | Add default token emission for conditional tokens |
| A3 | 3312-3358 | Emit palette colors as CSS variables |
| A4a | 3419-3421 | Fix theme prefix derivation |
| A4b | 3444-3463 | De-duplicate personality |
| A4c | 3362-3418 | Scope decorator table per section |
| A4d | 3402-3418 | Move compositions to scaffold.md |
| A4e | 3358, 3362, 3429 | Remove cross-references |
| A4f | 2752 | Complete route map from all sections |
| A6 | treatments.ts:370-373 | Move entrance-fade to base treatments |
| C1a | 1617-1683 | Move project brief to scaffold.md |
| C1b | 1340-1516 | Replace atom reference with compact vocabulary |
| C2a | 3242 | Add required imports block |
| C2b | 3242 | Add anti-pattern corrections |
| C2c | 3489-3558 | Inline code examples from patterns |
| C2d | 3244-3298 | Add concrete nav items |
| C2e | 3716-3726 | Emit hotkey details |
| C3 | new function | Generate tokens.ts |

### Packages affected

| Package | Changes | Rebuild required? |
|---|---|---|
| @decantr/essence-spec | None in this spec (spatial contracts changes already done) | No |
| decantr (CLI) | scaffold.ts, treatments.ts | Yes |
| @decantr/mcp-server | critique.ts, tools.ts (Phase D) | Yes |
| @decantr/css | None | No |
| @decantr/registry | None | No |
| @decantr/core | None | No |

---

## Part 8: Verification Strategy

### Phase A verification (after each bug fix)

1. Rebuild CLI: `pnpm --filter decantr build`
2. Clean showcase: `rm -rf apps/showcase/registry-platform/{decantr.essence.json,DECANTR.md,.decantr/,src/styles/}`
3. Refresh: `node packages/cli/dist/bin.js refresh` (from showcase dir)
4. Verify each fix:
   - Bug 1: `grep "data-elevation" apps/showcase/registry-platform/DECANTR.md` (should find it)
   - Bug 2: `grep "carbon-" apps/showcase/registry-platform/DECANTR.md` (should find ZERO)
   - Bug 3: `grep "entrance-fade" apps/showcase/registry-platform/src/styles/treatments.css` (should find it unconditionally)
   - Bug 6: `grep -E "d-font-mono|d-duration-hover|d-easing|d-accent-glow" apps/showcase/registry-platform/src/styles/tokens.css` (all 4 present)
   - Bug 8: `grep "d-cyan\|d-coral\|d-amber" apps/showcase/registry-platform/src/styles/tokens.css` (should find them)
   - Bug 9: `grep "luminarum-" apps/showcase/registry-platform/.decantr/context/section-*.md` (should find ZERO, only "lum-")
   - Bug 13: Check scaffold.md route map includes register and forgot-password routes

### Phase B verification

1. Run content validator: `cd decantr-content && node validate.js` (0 errors)
2. Verify code examples: `grep -l "code" patterns/{content-card-grid,kpi-grid,auth-form}.json` (all present)
3. Sync to local cache: `decantr sync` from showcase dir
4. Refresh and verify code examples appear in section contexts

### Phase C verification

1. Verify DECANTR.md line count: `wc -l apps/showcase/registry-platform/DECANTR.md` (target: <=200)
2. Verify no personality duplication in section contexts
3. Verify anti-pattern corrections block present in section contexts
4. Verify required imports block present in section contexts
5. Verify tokens.ts generated alongside tokens.css

### Phase D verification

1. Run `decantr_critique` against the harness-built showcase code
2. Verify inline style detection catches `style={{` patterns
3. Verify hardcoded color detection catches hex values
4. Verify accessibility detection catches `<span onClick>`

### End-to-end harness

After ALL phases complete:
1. Clean showcase completely
2. Cold `decantr init --blueprint=registry-platform`
3. Dispatch fresh agent (zero Decantr knowledge) with the standard build prompt
4. Run `decantr_critique` on the output
5. Success criteria:
   - Inline style count: < 20 (from 267)
   - css() usage count: > 100
   - Treatment class coverage: > 80%
   - Hardcoded colors: < 5
   - Accessibility errors: 0
   - Section header spacing: correct (d-label with data-anchor, no inline border styles)

---

## Non-Goals

- **Tailwind integration** — We keep @decantr/css atoms. The anti-pattern corrections block addresses the adoption friction without changing the system.
- **Component library** — Decantr provides code examples as guidance, not as importable components.
- **AST-based critique** — Phase D uses enhanced string-matching. AST parsing is a future enhancement.
- **Recipe-theme merge** — That's a separate spec (2026-04-02). This spec works with the current theme structure.
- **New treatment classes** (avatar, breadcrumb, tabs) — Valid gaps but scope creep. Track as content enrichment tasks after this spec ships.
