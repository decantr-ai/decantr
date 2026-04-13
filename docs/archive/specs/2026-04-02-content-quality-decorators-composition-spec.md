# Content Quality Floor + Structured Decorators + Composition Algebra

**Date:** 2026-04-02
**Status:** Approved
**Scope:** decantr-content (all content types), CLI scaffold.ts (decorator heuristic removal), registry sync

---

## Goal

Bring all 223 content items to zero quality warnings, replace the keyword-based decorator CSS heuristic with structured decorator definitions on all 20 themes, and add composition algebra expressions to all ~60 patterns with 3+ components. Then sync everything to the live registry.

---

## Section 1: Resolve 71 Content Warnings

### 1.1 Missing Components Arrays (10 patterns)

Patterns missing `components` need a string array listing all UI components the pattern uses. Derive from slot descriptions and visual_brief.

**Affected patterns:** Identified by `node validate.js 2>&1 | grep "missing or empty components"`.

Each gets a `components` array like:
```json
"components": ["Card", "Button", "Badge", "Icon", "Text"]
```

### 1.2 Short Preset Descriptions (61 instances across ~40 patterns)

Preset descriptions under 30 chars need expansion to be meaningful for AI consumption.

**Before:** `"description": "Compact layout"`
**After:** `"description": "Compact single-row layout with inline actions and condensed spacing for dense data views"`

Each description must:
- Be 30+ characters
- Describe the visual layout difference from the default preset
- Mention key structural changes (column count, spacing, element visibility)

### 1.3 Success Criteria

`node validate.js` reports: `Validated 223 files: 0 errors, 0 quality warnings`

---

## Section 2: Structured Decorator Definitions

### 2.1 Schema

The `decorator_definitions` field (already in `@decantr/registry` Theme type) replaces the `decorators` string-description field as the primary visual guidance source.

```typescript
decorator_definitions: Record<string, {
  description: string;            // What it looks like
  intent: string;                 // When/why to use it
  suggested_properties: Record<string, string>;  // CSS property hints
  pairs_with?: string[];          // Complementary decorators
  usage?: string[];               // Component types this applies to
}>
```

### 2.2 Content Authoring (20 themes)

**For themes with existing `decorators` field (10 rich themes):**
Promote each decorator entry from `decorators` into `decorator_definitions`:
- `description` ← existing string description
- `intent` ← new, authored: when/why the AI should apply this class
- `suggested_properties` ← new, authored: key CSS properties with values
- `pairs_with` ← new, authored: which other decorators complement this one
- `usage` ← new, authored: which component types it's for

Keep the original `decorators` field intact for backward compatibility.

**For themes with no/minimal decorators (10 stub themes):**
These were enriched in Phase 6 with basic `decorators` strings. Now add `decorator_definitions` alongside.

**Example — carbon-neon theme:**
```json
{
  "decorators": {
    "carbon-glass": "Glassmorphic panel with backdrop-filter blur and semi-transparent background"
  },
  "decorator_definitions": {
    "carbon-glass": {
      "description": "Glassmorphic panel with backdrop-filter blur and semi-transparent background",
      "intent": "Depth and layering — use for elevated containers that need visual separation from the canvas. Creates a floating, translucent effect.",
      "suggested_properties": {
        "backdrop-filter": "blur(12px)",
        "background": "rgba(39, 39, 42, 0.8)",
        "border": "1px solid rgba(63, 63, 70, 0.3)",
        "border-radius": "var(--d-radius)"
      },
      "pairs_with": ["neon-border-glow", "carbon-card"],
      "usage": ["Modal overlays", "Sidebar panels", "Elevated cards", "Dropdown menus"]
    }
  }
}
```

### 2.3 CLI Changes — Delete Heuristic, Render Structured Definitions

**File:** `packages/cli/src/scaffold.ts`

**Delete:** The `generateDecoratorRule` function (~lines 750-905). This is the 150-line keyword-matching NLP engine that converts decorator description strings into CSS.

**Delete:** In `generateTreatmentCSS` (treatments.ts), the loop that calls `generateDecoratorRule` for each decorator. The `@layer decorators { }` section in treatments.css becomes empty (just the layer declaration with no rules).

**Update:** In `generateSectionContext`, when rendering decorators:

```
Priority 1: If theme has decorator_definitions, render rich table:

| Class | Intent | Key CSS | Pairs with |
|-------|--------|---------|------------|
| `.carbon-glass` | Depth/layering for elevated containers | backdrop-filter: blur(12px); background: rgba(39,39,42,0.8) | neon-border-glow |

Priority 2: If theme has only decorators (old string format), render description table:

| Class | Usage |
|-------|-------|
| `.carbon-glass` | Glassmorphic panel with backdrop-filter blur... |

Priority 3: No decorators → "No theme decorators defined."
```

**Update:** The `@layer decorators` block in treatments.css should contain a comment:
```css
@layer decorators {
  /* Decorator CSS is generated by the AI from structured definitions in section context files.
     See .decantr/context/section-*.md for decorator intent, suggested properties, and usage. */
}
```

### 2.4 Impact on Existing Showcases

The agent-marketplace showcase has decorator CSS in its treatments.css. After this change, a fresh `decantr refresh` would produce an empty `@layer decorators` block. This is intentional — the AI regenerates decorator CSS from the structured definitions. The showcase's existing component code already uses decorator class names; the CSS implementation becomes the AI's responsibility.

---

## Section 3: Composition Algebra

### 3.1 Scope

All patterns in decantr-content with 3+ entries in their `components` array. Approximately 60 patterns.

Patterns with 1-2 components are excluded — their visual_brief provides sufficient structural guidance.

### 3.2 Grammar

```
>     contains (parent > child)
[]    repeats / list
?     conditional (present only when condition is true)
()    props, decorators, variants, conditions
+     adjacent sibling
a ? b : c   ternary (conditional variant)
```

### 3.3 Authoring Guidelines

Each composition expression must:
- Name components using PascalCase matching the pattern's `components` array
- Reference decorator classes from the theme (e.g., `Card(carbon-card)`)
- Use treatment classes for interactive elements (e.g., `Button(d-interactive, variant: primary)`)
- Express conditionality where the visual_brief describes it (e.g., `Badge?(show: tier.recommended)`)
- Be readable by an LLM in one pass — no deeply nested expressions beyond 3 levels

**Example — data-table:**
```json
{
  "composition": {
    "DataTable": "Container(d-data, full-width) > [TableHeader + TableBody + TableFooter]",
    "TableHeader": "Row(d-data-header, sticky) > HeaderCell(sortable?, sort-indicator?)[]",
    "TableBody": "Row(d-data-row, hoverable, striped?)[] > DataCell(d-data-cell)[]",
    "TableFooter": "Row > [PageInfo(text-muted) + Pagination(d-interactive, variant: ghost)[]]"
  }
}
```

**Example — chat-thread:**
```json
{
  "composition": {
    "ChatThread": "Container(d-surface, flex-col, full-height) > [MessageList + TypingIndicator? + ScrollAnchor]",
    "MessageList": "List(flex-col, gap-3) > Message[]",
    "Message": "Bubble(user: right-aligned + carbon-bubble-user, ai: left-aligned + carbon-bubble-ai) > [Avatar? + Content(markdown) + Timestamp(mono-data, text-xs)]",
    "TypingIndicator": "Bubble(carbon-bubble-ai, opacity-70) > PulseDots(3, animated)"
  }
}
```

### 3.4 Rendering

Already implemented in Phase 5A. The `generateSectionContext` function renders composition expressions in a code block:

```markdown
**Composition:**
```
DataTable = Container(d-data, full-width) > [TableHeader + TableBody + TableFooter]
TableHeader = Row(d-data-header, sticky) > HeaderCell(sortable?, sort-indicator?)[]
```
```

---

## Section 4: Registry Sync

All content changes are committed to decantr-content and pushed to main. The GitHub Actions workflow (`publish.yml`) auto-validates and syncs to the registry API via `POST /v1/admin/sync`.

No manual sync step required.

---

## Package Impact

| Package | Change | Version |
|---------|--------|---------|
| `decantr-content` | All content enrichment | 1.1.0 (from 1.0.0) |
| `@decantr/cli` | Delete generateDecoratorRule, update decorator rendering | 1.6.2 (patch) |

No changes to: essence-spec, registry, mcp-server, core, css, vite-plugin.

---

## Implementation Order

1. Resolve 71 content warnings (decantr-content)
2. Author decorator_definitions for all 20 themes (decantr-content)
3. CLI: delete heuristic, update decorator rendering, bump to 1.6.2 (decantr-monorepo)
4. Author composition expressions for ~60 patterns (decantr-content)
5. Push both repos → auto-sync to registry
6. Verify via `decantr refresh` on agent-marketplace showcase

---

## Checklist

### Section 1: Content Warnings
- [ ] Add components arrays to 10 patterns missing them
- [ ] Expand 61 short preset descriptions to 30+ chars
- [ ] Run validate.js — 0 errors, 0 warnings
- [ ] Commit to decantr-content

### Section 2: Structured Decorators
- [ ] Author decorator_definitions for 10 rich themes (carbon, carbon-neon, auradecantism, terminal, luminarum, glassmorphism, studio, estate, paper, neon-cyber)
- [ ] Author decorator_definitions for 10 enriched stub themes (retro, dopamine, editorial, prismatic, bioluminescent, liquid-glass, neon-dark, launchpad, gaming-guild, clean)
- [ ] Commit to decantr-content
- [ ] Delete generateDecoratorRule from scaffold.ts
- [ ] Delete decorator CSS generation loop from treatments.ts
- [ ] Update generateSectionContext to prefer decorator_definitions over decorators
- [ ] Empty @layer decorators block with comment in treatments.css output
- [ ] Run CLI tests — all pass
- [ ] Bump CLI to 1.6.2
- [ ] Commit to decantr-monorepo

### Section 3: Composition Algebra
- [ ] Identify all patterns with 3+ components (~60)
- [ ] Author composition expressions for each
- [ ] Commit to decantr-content

### Section 4: Sync & Verify
- [ ] Push decantr-content → GitHub Actions auto-syncs
- [ ] Push decantr-monorepo
- [ ] Publish @decantr/cli@1.6.2
- [ ] Run decantr refresh on agent-marketplace showcase
- [ ] Verify decorator table in section contexts shows structured format
- [ ] Verify composition expressions render in section contexts
