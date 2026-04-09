# Shell Implementation Specs + Scaffolding Accelerators (Revised)

**Date:** 2026-04-03
**Status:** Approved (revised after sanity audit)
**Scope:** All 13 shells (decantr-content), CLI context generation, DECANTR.md template, registry types, documentation, skills

---

## Goal

Fix shell layout collisions, card inception, spacing inconsistencies, and scaffolding speed issues. The root cause: rich shell data (grid templates, dimensions, internal spacing, code examples) exists in shell JSON files but only 3 of 15+ fields reach the AI through the `ShellInfo` bottleneck.

## Changes From Original Spec (Post-Audit)

1. **Replaced Tailwind strings with semantic properties + Decantr atoms** — framework-agnostic, not Tailwind-coupled
2. **Removed data shape generation (Section 6)** — deferred to follow-up as authored content, not CLI-generated
3. **Complexity computed at CLI time** — not stored in 116 pattern files
4. **Added registry type update** — Shell interface needs `internal_layout`
5. **Merged css() docs** — into existing CSS_APPROACH block, not a duplicate section
6. **Added token budget estimates** — shell implementation block adds ~25-30 lines per section context
7. **Added MCP, cache staleness, theme.shell interaction notes**

---

## Section 1: Shell Content Enrichment — `internal_layout` Field

Add `internal_layout` to all 13 shells using **semantic properties + Decantr atoms** (NOT Tailwind classes).

### Format

```json
"internal_layout": {
  "region_name": {
    "width": "240px",
    "height": "52px",
    "position": "left",
    "direction": "column",
    "border": "right",
    "overflow_y": "auto",
    "sticky": true,
    "atoms": "_flex _col _borderR _overflow[auto]",
    "treatment": "d-interactive[ghost]",
    "gap": "2px",
    "padding": "0.75rem",
    "note": "Prose description for the AI"
  }
}
```

Fields are semantic CSS properties, not framework utilities. The `atoms` field uses `@decantr/css` notation where applicable. The AI translates these to its target framework (Tailwind, vanilla CSS, etc.).

### 1.1 sidebar-main.json

```json
"internal_layout": {
  "root": {
    "display": "flex",
    "direction": "row",
    "height": "100vh",
    "atoms": "_flex _h[100vh]"
  },
  "sidebar": {
    "width": "240px",
    "collapsed_width": "64px",
    "collapse_breakpoint": "md",
    "position": "left",
    "direction": "column",
    "border": "right",
    "background": "var(--d-surface)",
    "overflow_y": "auto",
    "atoms": "_flex _col _borderR",
    "brand": {
      "height": "52px",
      "display": "flex",
      "align": "center",
      "padding": "0 1rem",
      "border": "bottom",
      "content": "Logo/brand + collapse toggle"
    },
    "nav": {
      "flex": "1",
      "overflow_y": "auto",
      "padding": "0.5rem",
      "group_gap": "0.5rem",
      "group_header_treatment": "d-label",
      "item_treatment": "d-interactive[ghost]",
      "item_padding": "0.375rem 0.75rem",
      "item_gap": "2px",
      "item_content": "icon (16px) + label text. Collapsed: icon only, text hidden."
    },
    "footer": {
      "border": "top",
      "padding": "0.5rem",
      "position_within": "bottom (mt-auto)",
      "content": "User avatar + settings link"
    }
  },
  "main_wrapper": {
    "flex": "1",
    "direction": "column",
    "overflow": "hidden",
    "atoms": "_flex _col _flex1 _overflow[hidden]"
  },
  "header": {
    "height": "52px",
    "display": "flex",
    "align": "center",
    "justify": "space-between",
    "padding": "0 1.5rem",
    "border": "bottom",
    "sticky": false,
    "left_content": "Breadcrumb — omit segment when it equals page title",
    "right_content": "Search/command trigger"
  },
  "body": {
    "flex": "1",
    "overflow_y": "auto",
    "padding": "1.5rem",
    "atoms": "_flex1 _overflow[auto] _p6",
    "note": "Sole scroll container. Page content renders directly here. No wrapper div around outlet."
  }
}
```

### 1.2 centered.json

```json
"internal_layout": {
  "root": {
    "display": "flex",
    "align": "center",
    "justify": "center",
    "min_height": "100vh",
    "background": "var(--d-bg)",
    "atoms": "_flex _center _minh[100vh]"
  },
  "body": {
    "width": "100%",
    "max_width_auth": "28rem (448px)",
    "max_width_wide": "36rem (576px)",
    "padding": "1.5rem",
    "treatment": "d-surface",
    "border_radius": "var(--d-radius-lg)",
    "note": "Single centered card. No sidebar, no header. Auth forms use 28rem, wider content 36rem."
  }
}
```

### 1.3 top-nav-footer.json

```json
"internal_layout": {
  "root": {
    "display": "flex",
    "direction": "column",
    "min_height": "100vh",
    "atoms": "_flex _col _minh[100vh]"
  },
  "header": {
    "height": "52px",
    "display": "flex",
    "align": "center",
    "justify": "space-between",
    "padding": "0 1.5rem",
    "border": "bottom",
    "sticky": true,
    "z_index": "10",
    "background": "var(--d-bg)",
    "left_content": "Brand/logo",
    "center_content": "Nav links — flex with gap 1.5rem. Hidden below md, visible above.",
    "right_content": "CTA button + mobile hamburger. Hamburger ONLY below md breakpoint.",
    "note": "Mobile: hamburger opens a drawer/sheet with nav links. Desktop: links are inline."
  },
  "body": {
    "flex": "1",
    "padding": "none",
    "note": "Full-width sections stack vertically. Each section uses d-section with --d-section-py. Body has NO padding — sections own their own spacing. Natural document scroll (no overflow-y-auto)."
  },
  "footer": {
    "border": "top",
    "padding": "2rem 1.5rem",
    "position_within": "bottom (mt-auto for short pages)",
    "note": "Multi-column footer with link groups and legal. Push to bottom on short content via mt-auto on body or flex-grow."
  }
}
```

### 1.4 chat-portal.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "row", "height": "100vh" },
  "sidebar": {
    "width": "280px", "collapsed_width": "64px", "direction": "column", "border": "right",
    "conversation_list": { "flex": "1", "overflow_y": "auto", "item_treatment": "d-interactive[ghost]", "item_padding": "0.625rem 0.75rem", "item_gap": "2px" }
  },
  "main_wrapper": { "flex": "1", "direction": "column", "overflow": "hidden" },
  "header": { "height": "52px", "padding": "0 1rem", "border": "bottom" },
  "body": {
    "flex": "1", "direction": "column", "overflow": "hidden",
    "messages_area": { "flex": "1", "overflow_y": "auto", "padding": "1rem" },
    "input_area": { "border": "top", "padding": "1rem", "position_within": "bottom (anchored)" },
    "note": "Body splits into scrollable messages + pinned input. Input anchored to bottom."
  }
}
```

### 1.5 full-bleed.json

```json
"internal_layout": {
  "root": { "min_height": "100vh" },
  "header": {
    "position": "fixed", "top": "0", "width": "100%", "height": "52px", "z_index": "50",
    "background": "var(--d-bg) with 80% opacity + backdrop blur",
    "padding": "0 1.5rem",
    "note": "Floating transparent header. No sidebar."
  },
  "body": { "padding_top": "52px", "note": "Offset for fixed header." }
}
```

### 1.6 minimal-header.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "column", "min_height": "100vh" },
  "header": { "height": "44px", "padding": "0 1rem", "border": "bottom", "note": "Slim 44px header" },
  "body": { "flex": "1", "max_width": "720px", "margin": "0 auto", "width": "100%", "padding": "1.5rem", "note": "Centered content column" }
}
```

### 1.7 sidebar-aside.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "row", "height": "100vh" },
  "sidebar": { "width": "240px", "collapsed_width": "64px", "direction": "column", "border": "right" },
  "main_wrapper": { "flex": "1", "direction": "column", "overflow": "hidden" },
  "header": { "height": "52px", "padding": "0 1.5rem", "border": "bottom" },
  "body": {
    "display": "flex", "direction": "row", "flex": "1", "overflow": "hidden",
    "content": { "flex": "1", "overflow_y": "auto", "padding": "1.5rem" },
    "aside": { "width": "280px", "border": "left", "overflow_y": "auto", "padding": "1rem" },
    "note": "Content + right aside. Both scroll independently."
  }
}
```

### 1.8 sidebar-main-footer.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "row", "height": "100vh" },
  "sidebar": { "width": "240px", "direction": "column", "border": "right" },
  "main_wrapper": { "flex": "1", "direction": "column", "overflow": "hidden" },
  "header": { "height": "52px", "padding": "0 1.5rem", "border": "bottom" },
  "body": { "flex": "1", "overflow_y": "auto", "padding": "1.5rem" },
  "footer": { "border": "top", "padding": "0.75rem 1.5rem", "note": "Footer inside main area, below body scroll." }
}
```

### 1.9 sidebar-right.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "row", "height": "100vh" },
  "main_wrapper": { "flex": "1", "direction": "column", "overflow": "hidden" },
  "header": { "height": "52px", "padding": "0 1.5rem", "border": "bottom" },
  "body": { "flex": "1", "overflow_y": "auto", "padding": "1.5rem" },
  "sidebar": { "width": "240px", "collapsed_width": "64px", "position": "right", "direction": "column", "border": "left", "note": "Right-side sidebar. Same internal structure as sidebar-main but mirrored." }
}
```

### 1.10 terminal-split.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "column", "height": "100vh" },
  "status_bar": { "height": "24px", "padding": "0 0.75rem", "background": "var(--d-surface)", "border": "bottom", "font": "monospace", "font_size": "0.75rem" },
  "body": { "display": "flex", "direction": "row", "flex": "1", "overflow": "hidden", "pane": { "flex": "1", "overflow_y": "auto", "font": "monospace", "font_size": "0.875rem", "padding": "0.5rem" }, "note": "Horizontal split panes. Each scrolls independently. Resizable divider between." },
  "hotkey_bar": { "height": "28px", "padding": "0 0.75rem", "background": "var(--d-surface)", "border": "top", "font_size": "0.75rem", "note": "Bottom bar with keyboard shortcut hints." }
}
```

### 1.11 top-nav-main.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "column", "min_height": "100vh" },
  "header": { "height": "52px", "padding": "0 1.5rem", "border": "bottom", "sticky": true, "background": "var(--d-bg)", "z_index": "10" },
  "body": { "flex": "1", "padding": "1.5rem", "note": "No footer. Simple top-nav + content." }
}
```

### 1.12 top-nav-sidebar.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "column", "height": "100vh" },
  "header": { "height": "52px", "padding": "0 1.5rem", "border": "bottom", "note": "Full-width header spans above both sidebar and content." },
  "below_header": { "display": "flex", "direction": "row", "flex": "1", "overflow": "hidden" },
  "sidebar": { "width": "240px", "collapsed_width": "64px", "direction": "column", "border": "right", "overflow_y": "auto" },
  "body": { "flex": "1", "overflow_y": "auto", "padding": "1.5rem" }
}
```

### 1.13 workspace-aside.json

```json
"internal_layout": {
  "root": { "display": "flex", "direction": "row", "height": "100vh" },
  "sidebar": { "width": "240px", "collapsed_width": "48px", "direction": "column", "border": "right" },
  "main_wrapper": { "flex": "1", "direction": "column", "overflow": "hidden" },
  "header": { "height": "52px", "padding": "0 1.5rem", "border": "bottom", "note": "Spans above both content and aside." },
  "body": {
    "display": "flex", "direction": "row", "flex": "1", "overflow": "hidden",
    "content": { "flex": "1", "overflow_y": "auto", "padding": "1rem" },
    "aside": { "width": "280px", "border": "left", "overflow_y": "auto", "padding": "1rem" },
    "note": "Left sidebar + content + right aside."
  }
}
```

---

## Section 2: Quick-Start Block

A 7-10 line summary at the top of every section context file.

**Generation logic:** Computed at CLI time from section data, pattern specs, and density settings. Complexity derived from component count (simple ≤3, moderate 4-7, complex 8+) — NOT stored in content files.

```markdown
## Quick Start
- **Shell:** sidebar-main (240px sidebar, 52px header, scrollable body)
- **Pages:** 4 — overview, detail, config, marketplace
- **Key patterns:** AgentSwarmCanvas (complex), AgentTimeline (shared, 3 pages), NeuralFeedbackLoop (shared, 2 pages)
- **CSS:** carbon-glass, carbon-card + neon-glow, mono-data, status-ring
- **Density:** comfortable (content_gap: 1rem)
- **Voice:** Operational and precise. "Deploy" not "Submit".
```

**Token budget:** ~8 lines. Replaces nothing — net addition.

---

## Section 3: Merge css() Responsive/Pseudo Examples Into Existing Docs

The `CSS_APPROACH_CONTENT` constant in scaffold.ts already has `import { css } from '@decantr/css'` and basic usage. Merge responsive and pseudo-prefix examples into the existing block:

```typescript
// Add after existing css() example in CSS_APPROACH_CONTENT:
`
// Responsive prefix — applies at breakpoint and above:
css('_col sm:_row')        // column on mobile, row from sm+

// Pseudo prefix:
css('hover:_opacity80')    // opacity on hover
`
```

**Not** a new section — append to the existing CSS Implementation guide.

---

## Section 4: Nesting Anti-Patterns in DECANTR.md

Add to the DECANTR.md template, after the treatment class table:

```markdown
### Layout Rules

1. **Never nest d-surface inside d-surface.** Inner sections use plain containers with padding atoms.
2. **Shell regions are frames, not surfaces.** Sidebar and header use bg-[var(--d-surface)] or var(--d-bg) directly. Apply d-surface only to content cards WITHIN the body region.
3. **One scroll container per region.** Body has overflow-y-auto. Sidebar nav has its own overflow-y-auto. Never nest additional scrollable wrappers.
4. **d-section spacing is self-contained.** Each d-section owns its padding. The `d-section + d-section` rule adds a separator. Do NOT add extra margin between adjacent sections.
5. **Responsive nav rules.** Hamburger menus and mobile drawers appear ONLY below the shell's collapse breakpoint. Full nav shows above it.
```

**Token budget:** ~8 lines. Net addition.

---

## Section 5: Spacing Guide Table

Generated from `computeSpatialTokens()` output for the section's density level.

```markdown
## Spacing Guide ({density} density)

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Content gap | --d-content-gap | {computed} | Between sibling content blocks |
| Section padding | --d-section-py | {computed} | Vertical space between page sections |
| Surface padding | --d-surface-p | {computed} | Inside d-surface cards |
| Interactive padding | --d-interactive-py/px | {computed} | Buttons, nav items |
| Control padding | --d-control-py | {computed} | Form inputs |
| Data cell padding | --d-data-py | {computed} | Table cells |

**Rule:** Use var(--d-*) tokens for density-responsive spacing. Use atoms for fixed layout structure.
```

Values are **computed from the density level**, not hardcoded.

**Token budget:** ~10 lines. Net addition.

---

## Section 6: REMOVED (Data Shape Hints)

Deferred to follow-up. Data shapes will be an authored content field (`data_shape` on patterns), not CLI-generated. Too high risk to synthetically derive TypeScript interfaces from pattern metadata.

---

## Section 7: CLI Pipeline Changes

### 7.1 Expand ShellInfo Interface

```typescript
interface ShellInfo {
  description: string;
  regions: string[];
  layout?: string;
  guidance?: Record<string, string>;
  // NEW:
  atoms?: string;
  config?: {
    grid?: { areas?: string[][] };
    nav?: { position?: string; width?: string; collapseTo?: string; collapseBelow?: string; defaultState?: string };
    header?: { height?: string; sticky?: boolean };
    body?: { scroll?: boolean; inputAnchored?: boolean };
    footer?: { height?: string; sticky?: boolean };
  };
  internal_layout?: Record<string, any>;
}
```

### 7.2 Update Shell Fetching

Extract all fields from shell JSON:

```typescript
shellInfoCache[shellId] = {
  description: inner.description || '',
  regions: inner.config?.regions || [],
  layout: inner.layout,
  guidance: inner.guidance,
  atoms: inner.atoms,
  config: inner.config,
  internal_layout: inner.internal_layout,
};
```

### 7.3 generateShellImplementation() — New Function

Renders the shell implementation block from `internal_layout`. Outputs semantic properties as structured guidance, not framework-specific classes.

For each region in `internal_layout`:
- Output the region name as a bold header
- List dimensional properties (width, height, padding, gap)
- List structural properties (display, direction, overflow, position)
- Include atoms where present
- Include treatment references where present
- Include prose notes where present
- End with anti-patterns block

**Token budget:** ~25-30 lines for sidebar-main (the largest), ~10 lines for centered (the smallest).

### 7.4 generateQuickStart() — New Function

Computes from section data:
- Shell summary from `internal_layout` (or fallback to description)
- Page count and names
- Key patterns: complex (≥8 components) and shared (appears in >1 page) — computed at CLI time
- CSS classes: top 3 decorators + active personality utilities
- Density level + content_gap value
- Voice tone (from project.json voice, first sentence only)

Needs: Add `voiceTone?: string` to `SectionContextInput`. Pass from `refreshDerivedFiles`.

### 7.5 generateSpacingGuide() — New Function

Takes density level, calls `computeSpatialTokens()`, renders the table with actual computed values.

### 7.6 Update generateSectionContext()

Rendering order:
1. **Quick Start** (NEW — ~8 lines)
2. **Shell Implementation** (NEW — replaces old 5-line shell description, adds ~25 lines net)
3. **Shell Notes** (EXISTING — behavioral guidance, unchanged)
4. **Spacing Guide** (NEW — ~10 lines)
5. **Guard config** (EXISTING)
6. **Token palette** (EXISTING)
7. **Decorator table** (EXISTING)
8. **Visual Direction** (EXISTING)
9. **Theme hints** (EXISTING)
10. **Zone context** (EXISTING)
11. **Features** (EXISTING)
12. **Pattern specs** (EXISTING)
13. **Pages** (EXISTING)

**Total token budget impact:** +43 lines per section context (8 quick start + 25 shell impl + 10 spacing guide). For a section with 6 patterns, this pushes from ~80 lines to ~123 lines. Acceptable — high information density, prevents costly AI guessing.

### 7.7 Update DECANTR.md Template

- Merge css() responsive/pseudo examples into existing CSS_APPROACH block
- Add nesting anti-patterns after treatment class table

---

## Section 8: Registry Type Update

### @decantr/registry types.ts

Add to Shell interface:

```typescript
interface Shell {
  // ...existing fields...
  internal_layout?: Record<string, any>;
}
```

Bump `@decantr/registry` to 1.0.0-beta.12.

### validate.js in decantr-content

No schema change needed — `internal_layout` is a freeform JSON object stored in the shell's data blob. The existing validation (valid JSON + has id/slug) covers it. No new `$schema` version required.

---

## Section 9: Theme.shell Interaction

When a theme has `shell.preferred` and the blueprint uses a different shell, the theme's spatial hints apply but the shell's `internal_layout` takes precedence for structural layout. The theme influences visual treatment (e.g., backdrop blur on surfaces) but NOT region dimensions or spacing.

**No code change needed** — the current pipeline already separates theme data (decorators, treatments, spatial) from shell data. This is a documentation clarification added to the engineering skill.

---

## Section 10: Cache Staleness Handling

When `decantr refresh` runs, it re-fetches shells from the registry. If the API returns the updated shell with `internal_layout`, the context files get the new blocks. If the user is offline and has stale cached shells, the fallback renders the old thin shell description.

**No code change needed** — the existing cache → API fallback chain handles this. The shell implementation block simply won't appear if `internal_layout` is missing.

---

## Section 11: MCP Tool Updates

- `decantr_get_section_context` — already returns section context markdown, will include new blocks automatically
- `decantr_resolve_blueprint` — no change, returns essence structure not shell implementation details
- Documentation update: note that section contexts now include shell implementation specs

---

## Package Impact

| Package | Change | Version |
|---------|--------|---------|
| decantr-content | `internal_layout` on 13 shells | 1.2.0 |
| @decantr/registry | Add `internal_layout` to Shell type | 1.0.0-beta.12 |
| @decantr/cli | Shell rendering, Quick Start, Spacing Guide, DECANTR.md updates | 1.7.0 |
| docs | CLAUDE.md, css-scaffolding-guide.md, README.md | — |
| skills | decantr-engineering SKILL.md, harness.md (both copies) | — |

No changes to: essence-spec, core, mcp-server (code), css, vite-plugin.

---

## Implementation Checklist

### Content (decantr-content)
- [ ] Add `internal_layout` to all 13 shells
- [ ] Run validate.js — 0 errors
- [ ] Commit and push to main (auto-syncs to registry)

### Registry Types (decantr-monorepo)
- [ ] Add `internal_layout?: Record<string, any>` to Shell interface in registry/src/types.ts
- [ ] Bump @decantr/registry to 1.0.0-beta.12
- [ ] Build and test

### CLI (decantr-monorepo)
- [ ] Expand ShellInfo interface
- [ ] Update shell fetching in refreshDerivedFiles
- [ ] Implement generateShellImplementation()
- [ ] Implement generateQuickStart() — add voiceTone to SectionContextInput
- [ ] Implement generateSpacingGuide() — use computeSpatialTokens()
- [ ] Update generateSectionContext() rendering order
- [ ] Merge css() responsive/pseudo examples into CSS_APPROACH_CONTENT
- [ ] Add nesting anti-patterns to DECANTR.md template
- [ ] Run all tests — fix any assertion changes
- [ ] Bump CLI to 1.7.0

### Documentation (decantr-monorepo)
- [ ] Update CLAUDE.md — shell implementation specs, Quick Start, spacing guide, nesting rules, updated CLI version, registry version
- [ ] Update docs/css-scaffolding-guide.md — nesting rules section, shell spatial guidance
- [ ] Update README.md — ensure it reflects current project state, CLI version, feature list

### Skills
- [ ] Update decantr-engineering SKILL.md — shell implementation specs in three-tier model, nesting rules in anti-patterns, CLI 1.7.0, registry 1.0.0-beta.12, theme.shell interaction note
- [ ] Update both harness.md files — shell implementation block validation (check for region dimensions, anti-patterns), Quick Start presence, spacing guide presence
- [ ] Commit project-level harness

### Verification
- [ ] Regenerate agent-marketplace showcase with refreshed context
- [ ] Run harness — verify shell implementation blocks have dimensions + anti-patterns
- [ ] Verify Quick Start block at top of each section context
- [ ] Verify spacing guide table with correct computed values
- [ ] Verify nesting anti-patterns in DECANTR.md
- [ ] Push decantr-monorepo
- [ ] Push decantr-content
- [ ] Publish @decantr/registry@1.0.0-beta.12
- [ ] Publish @decantr/cli@1.7.0

### Integration Test
- [ ] Create fresh scaffold in /tmp: `mkdir /tmp/decantr-shell-test && cd /tmp/decantr-shell-test && npx @decantr/cli@1.7.0 init --blueprint=agent-marketplace --yes`
- [ ] Run harness against the fresh scaffold — verify:
  - Shell implementation blocks present for all 3 shells (sidebar-main, centered, top-nav-footer)
  - Each block has region dimensions (width, height, padding), anti-patterns, and structural properties
  - Quick Start block at top of each section context
  - Spacing guide with computed values for comfortable density
  - Nesting anti-patterns in DECANTR.md
  - css() responsive/pseudo examples in CSS Implementation section
  - Overall harness score ≥95/100
