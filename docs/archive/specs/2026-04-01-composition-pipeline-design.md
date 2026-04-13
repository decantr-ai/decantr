# Composition Pipeline Redesign

**Date:** 2026-04-01
**Status:** Draft
**Author:** David Aimi
**Supersedes:** `2026-03-31-composition-topology-design.md` (topology + intent is retained and expanded here)

---

## Overview

A comprehensive redesign of how Decantr composes blueprints into essences. The current pipeline discards most blueprint data during composition — routes, personality, overrides, SEO hints, navigation, design constraints, and archetype grouping are all lost. This spec closes every gap, introduces **sections** as the structural concept between blueprint and page, and ensures the full content hierarchy flows cohesively from patterns through to the generated DECANTR.md.

### Goals

- Every meaningful field in the content hierarchy flows through to the essence or DECANTR.md
- Sections preserve archetype grouping instead of flattening to a single page list
- Features have clear authority: archetype union + blueprint add/remove
- Blueprint routes, personality, design constraints, and SEO hints reach the AI
- The architecture scales to 100+ page apps with incremental generation context
- All 52 archetypes and 17 blueprints are updated to match the new pipeline

### Non-Goals

- Changing DNA or guard rule semantics
- Multi-file essence splitting (future — sections are the prerequisite)
- Real-time collaborative editing of the essence
- Pattern-level code generation changes

### Design Principles

- **Archetype boundaries are preserved, not flattened** — sections carry grouping through composition
- **Blueprint is authoritative for the app** — overrides, routes, personality, constraints are honored
- **Archetype is authoritative for its section** — features, pages, shells, patterns
- **The essence captures everything the AI needs** — no data silently dropped
- **DECANTR.md synthesizes, essence stores** — structural data in essence, narrative in DECANTR.md

---

## Architecture

### 1. Sections: The Missing Structural Layer

The essence gains a `sections` array that preserves archetype boundaries:

```json
{
  "version": "3.1.0",
  "dna": { "..." },
  "blueprint": {
    "sections": [
      {
        "id": "ai-chatbot",
        "role": "primary",
        "shell": "chat-portal",
        "features": ["chat", "markdown", "code-highlight", "file-upload", "mentions", "reactions", "export"],
        "description": "AI chatbot interface with conversation sidebar, message thread, and anchored input.",
        "pages": [
          { "id": "chat", "route": "/chat", "layout": ["header", "messages", "input"] },
          { "id": "new", "route": "/chat/new", "layout": ["empty-thread", "input"] }
        ]
      },
      {
        "id": "auth-full",
        "role": "gateway",
        "shell": "centered",
        "features": ["auth", "mfa", "oauth", "email-verification", "password-reset"],
        "description": "Complete authentication flow.",
        "pages": [
          { "id": "login", "route": "/login", "layout": ["form"] },
          { "id": "register", "route": "/register", "layout": ["form"] },
          { "id": "forgot-password", "route": "/forgot-password", "layout": ["form"] }
        ]
      },
      {
        "id": "settings-full",
        "role": "auxiliary",
        "shell": "sidebar-settings",
        "features": ["profile-edit", "password-change", "mfa-management", "session-management", "theme-toggle", "account-deletion"],
        "description": "Complete account settings.",
        "pages": [
          { "id": "profile", "route": "/settings/profile", "layout": ["settings"] },
          { "id": "security", "route": "/settings/security", "layout": ["security-settings", "sessions"] }
        ]
      }
    ],
    "features": ["chat", "markdown", "..."],
    "routes": { "/chat": { "section": "ai-chatbot", "page": "chat" }, "..." }
  }
}
```

**Key changes from current EssenceV3:**
- `blueprint.pages[]` (flat list) → `blueprint.sections[].pages[]` (grouped)
- Each section has: `id`, `role`, `shell`, `features`, `description`, `pages`
- Pages keep their original IDs (no `auth-full-login` prefixing)
- Routes are explicit (from blueprint's routes map)
- Sections map directly to topology zones
- `blueprint.features` remains as the merged/resolved global list (for guard rules and backward compat)

**Backward compatibility:** The flat `blueprint.pages` array is still derivable from sections (for guards that iterate all pages). A helper function `flattenPages(sections)` provides this.

### 2. Feature Authority Model

Features resolve through a clear chain:

```
Step 1: Union all archetype features (per section)
Step 2: Apply blueprint.overrides.features_add (global additions)
Step 3: Apply blueprint.overrides.features_remove (global removals)
Step 4: Result = resolved global features list
```

Each section retains its own feature subset (from its archetype). The global `blueprint.features` is the union of all section features + add - remove.

The blueprint's top-level `features` field becomes **informational** (for registry display). The resolved list is computed, not declared.

### 3. Blueprint Data That Now Flows Through

| Blueprint Field | Where It Goes | How |
|----------------|---------------|-----|
| `routes` | `blueprint.routes` in essence + route table in DECANTR.md | CLI reads and maps routes to section/page pairs |
| `personality` | `dna.personality` in essence + tone in DECANTR.md topology | CLI reads from blueprint, not defaults |
| `overrides.features_add` | Merged into `blueprint.features` | Applied during composition |
| `overrides.features_remove` | Subtracted from `blueprint.features` | Applied during composition |
| `overrides.pages_remove` | Pages excluded from sections | Applied during composition |
| `overrides.pages` | Per-page overrides (layout, shell) | Applied during composition |
| `seo_hints` | New `meta.seo` in essence + section in DECANTR.md | Passed through |
| `navigation` | New `meta.navigation` in essence + section in DECANTR.md | Passed through |
| `design_constraints` | New `dna.constraints` in essence + section in DECANTR.md | Passed through, enforced by guard |

### 4. Archetype Data That Now Flows Through

| Archetype Field | Where It Goes | How |
|----------------|---------------|-----|
| `role` | `section.role` in essence | Already implemented (topology) |
| `description` | `section.description` in essence + topology narrative | Read during composition |
| `pages[].patterns[]` (full) | `section.pages[].patterns[]` in essence | Preserved with pattern + preset + alias |
| `shells` (descriptions) | `section.shell_description` in essence | Carried through |
| `classification` | Not in essence (used for AI matching only) | Intentionally omitted |
| `dependencies` | Not in essence (used for validation only) | Available via registry |
| `suggested_theme` | Not in essence (blueprint theme overrides) | Intentionally omitted |

### 5. Recipe Data That Now Flows Through

| Recipe Field | Where It Goes | How |
|-------------|---------------|-----|
| `decorators` | Already in decorators.css | No change needed |
| `spatial_hints` | `dna.spacing` enrichment in essence | CLI applies density_bias and content_gap_shift |
| `pattern_preferences` | New section in DECANTR.md | CLI writes "preferred patterns" guidance |
| `compositions` | New section in DECANTR.md | CLI writes "pre-composed configurations" |
| `radius_hints` | `dna.radius` in essence | Already partially implemented |
| `animation` (full) | New `dna.motion` enrichment | CLI applies timing and durations |

### 6. Composition Topology (retained from previous spec)

The topology system from the earlier spec is retained in full:
- Archetype `role` field (primary/gateway/public/auxiliary) — already implemented
- Zone derivation from roles + shells — already implemented
- Transition derivation from role pairs + gateway features — already implemented
- Composition narrative in DECANTR.md — already implemented

Sections make topology cleaner: each section IS a zone member. No separate ZoneInput collection needed — iterate sections directly.

### 7. DECANTR.md Enhancements

The generated DECANTR.md gains these sections:

```markdown
## Composition Topology          (already implemented)
## Route Map                     (NEW — from blueprint.routes)
## Sections                      (NEW — per-section context with scoped features/patterns)
## Design Constraints            (NEW — from blueprint.design_constraints)
## SEO Guidance                  (NEW — from blueprint.seo_hints)
## Navigation                    (NEW — from blueprint.navigation)
## Recipe Guidance               (NEW — pattern_preferences + compositions)
```

The **Sections** block is especially important for scale. When the AI is working on a specific section (e.g., adding a page to settings), the task context can reference just that section's block instead of the full DECANTR.md.

### 8. Incremental Task Context

Task context files (`.decantr/context/task-*.md`) gain section awareness:

```markdown
## Current Section: settings-full

Role: auxiliary
Shell: sidebar-settings
Features: profile-edit, password-change, mfa-management, session-management
Pages: profile, security, preferences, danger

### Patterns Available in This Section
- settings (presets: standard, compact)
- security-settings (presets: standard)
- sessions (presets: standard)
```

When the AI reads `task-modify.md`, it gets scoped context for the section it's working in, not the entire app.

---

## Essence V3.1 Schema

### New/Modified Types

```typescript
export type ArchetypeRole = 'primary' | 'gateway' | 'public' | 'auxiliary';

export interface EssenceSection {
  id: string;                          // archetype ID
  role: ArchetypeRole;                 // topology role
  shell: string;                       // shell for this section's pages
  features: string[];                  // features scoped to this section
  description: string;                 // archetype description (intent propagation)
  pages: BlueprintPage[];              // pages with routes, layouts, pattern refs
}

export interface BlueprintPage {
  id: string;                          // page ID (no prefix)
  route?: string;                      // URL path (from blueprint.routes)
  layout: LayoutItem[];                // pattern aliases or full refs
  patterns?: PatternRef[];             // full pattern references (pattern + preset + alias)
  shell_override?: string;             // per-page shell override
  dna_overrides?: DNAOverrides;        // per-page density/mode overrides
}

export interface PatternRef {
  pattern: string;                     // registry pattern ID
  preset?: string;                     // preset variant name
  as?: string;                         // local alias used in layout
}

export interface EssenceBlueprint {
  sections: EssenceSection[];          // grouped by archetype (NEW)
  features: string[];                  // resolved global feature list
  routes?: Record<string, RouteEntry>; // URL → section/page mapping (NEW)
  icon_style?: string;
  avatar_style?: string;
}

export interface RouteEntry {
  section: string;                     // section ID
  page: string;                        // page ID within section
  shell?: string;                      // shell override for this route
}

export interface EssenceDNA {
  theme: { style: string; mode: string; recipe: string; shape: string };
  spacing: { /* existing */ };
  typography: { /* existing */ };
  color: { /* existing */ };
  radius: { /* existing */ };
  elevation: { /* existing */ };
  motion: { /* existing + animation.timing, animation.durations from recipe */ };
  accessibility: { /* existing */ };
  personality: string[];               // NOW read from blueprint, not defaults
  constraints?: {                      // NEW — from blueprint.design_constraints
    mode?: string;
    typography?: string;
    borders?: string;
    corners?: string;
    shadows?: string;
    effects?: Record<string, string>;
  };
}

export interface EssenceMeta {
  archetype: string;                   // primary archetype ID
  target: GeneratorTarget;
  platform: Platform;
  guard: EssenceV3Guard;
  seo?: {                              // NEW — from blueprint.seo_hints
    schema_org?: string[];
    meta_priorities?: string[];
  };
  navigation?: {                       // NEW — from blueprint.navigation
    hotkeys?: Array<{ key: string; route?: string; action?: string; label: string }>;
    command_palette?: boolean;
  };
}
```

### Version Bump

The essence version bumps from `3.0.0` to `3.1.0`. The `isV3` check (`version === '3.0.0'`) must also accept `3.1.0`. The flat `blueprint.pages` field is removed — sections are the canonical structure.

### Migration

Existing `3.0.0` essences are auto-migrated by wrapping the flat pages list into a single section:

```typescript
function migrateV30ToV31(essence: EssenceV3): EssenceV3 {
  if (essence.blueprint.sections) return essence; // already migrated
  return {
    ...essence,
    version: '3.1.0',
    blueprint: {
      ...essence.blueprint,
      sections: [{
        id: essence.meta.archetype,
        role: 'primary',
        shell: essence.blueprint.shell,
        features: essence.blueprint.features,
        description: '',
        pages: essence.blueprint.pages,
      }],
    },
  };
}
```

---

## System Integration

### decantr-content Updates

**Archetypes (52 files):**
- `role` field — already added (topology task)
- No other archetype changes needed — the CLI reads existing fields more thoroughly

**Blueprints (17 files):**
- Audit `features` lists against composed archetype features — add missing features or rely on `features_add`
- Ensure `overrides.features_add` and `features_remove` are used intentionally
- Ensure `routes` maps are complete for V2 blueprints (carbon-ai-portal, terminal-dashboard, etc.)
- V1 blueprints (minimal) need no changes — they compose a single archetype with no routes

**validate.js:**
- Add validation: blueprint `routes` keys must map to valid archetype/page combinations
- Add validation: `overrides.features_remove` entries must exist in the archetype feature union
- Existing `role` validation — already added

### @decantr/essence-spec

- Add `EssenceSection`, `RouteEntry`, `PatternRef` types
- Update `EssenceBlueprint` to use `sections` instead of flat `pages`
- Update `EssenceDNA` with `constraints` field
- Update `EssenceMeta` with `seo` and `navigation` fields
- Update `isV3` to accept `3.0.0` and `3.1.0`
- Add `migrateV30ToV31` function
- Update guard rules to iterate `sections[].pages[]` instead of flat `pages[]`
- Add `flattenPages(sections)` helper for guards that need the flat list

### @decantr/registry

- `ComposeEntry` — already updated with optional `role` (topology task)
- `composeArchetypes()` → rename to `composeSections()` — returns `EssenceSection[]` instead of flat pages
- Each section preserves: archetype ID, role, shell, features, description, full pattern refs
- Apply `overrides.features_add`, `features_remove`, `pages_remove`
- Compute route map from blueprint routes → section/page pairs

### CLI (packages/cli)

**scaffold.ts:**
- `composeSections()` replaces `composeArchetypes()` — outputs `EssenceSection[]`
- `buildEssenceV3()` → `buildEssenceV31()` — builds sectioned essence
- Feature resolution: union section features + apply add/remove overrides
- Route resolution: map blueprint routes to section/page pairs
- Topology derivation: iterate sections directly (no separate ZoneInput collection)
- `generateDecantrMd()` gains: route map section, per-section context, design constraints, SEO, navigation, recipe guidance

**index.ts:**
- Read blueprint `routes`, `personality`, `overrides`, `seo_hints`, `navigation`, `design_constraints`
- Cast blueprint to full type (not just `{id, compose, features, theme}`)
- Pass all data through to scaffold

**templates/DECANTR.md.template:**
- Add placeholders: `{{ROUTE_MAP}}`, `{{SECTIONS_CONTEXT}}`, `{{DESIGN_CONSTRAINTS}}`, `{{SEO_SECTION}}`, `{{NAVIGATION_SECTION}}`, `{{RECIPE_GUIDANCE}}`

**Task context templates:**
- Add section-scoped variants for task-add-page.md and task-modify.md

### MCP Server

- `decantr_resolve_blueprint` — already returns topology (from earlier task)
- Enrich with: sections, routes, full feature resolution
- New tool consideration: `decantr_get_section_context` — returns scoped context for one section (future)

### Guard System

- Update all rules that iterate pages to use `flattenPages(sections)`
- New advisory rule: **Route completeness** — every page should have a route (warn if missing)
- Existing topology rules (future) remain unchanged

---

## Content Audit & Registry Updates

### Blueprint Feature Audit

Each blueprint's `features` list must be audited against its composed archetype features. The resolution should be:

```
resolved = union(archetype.features for each in compose)
         + overrides.features_add
         - overrides.features_remove
```

If the blueprint's explicit `features` list differs from the resolved list, update it to match (or rely on the computation and treat the field as informational).

**Known gaps (from carbon-ai-portal investigation):**
- `carbon-ai-portal.features` missing: `mentions`, `reactions`, `code-highlight` (present in ai-chatbot archetype)
- Need to audit all 17 blueprints for similar gaps

### Blueprint Route Audit

V2 blueprints (6) already have `routes` maps. Verify each route maps to a valid archetype + page.

V1 blueprints (11) have no routes. For these, routes can be auto-generated from the composed pages during init (derive `/page-id` from page ID).

### TypeScript Type Alignment

The TypeScript types in `registry/src/types.ts` lag behind the actual JSON schemas. Fields to add:

**Pattern type:** `dependencies` (full structure), `default_layout`, per-preset `components`, `layout.slots`

**Shell type:** `layout`, `atoms`, `config` (full structure), `configurable` (full structure)

**Recipe type:** `decorators`, `compositions`, `radius_hints`, `animation.timing`, `animation.durations`, `shell.avoid`, `pattern_preferences`

This is housekeeping but important — the types should reflect what actually exists in the content.

---

## Rollout Order

### Phase 1: Composition Flow (critical gaps)

1. **essence-spec**: Add section types, route types, update EssenceBlueprint, add migration
2. **registry**: Rename `composeArchetypes` → `composeSections`, return `EssenceSection[]`
3. **CLI scaffold**: Update `buildEssenceV31()` to produce sectioned essence
4. **CLI index.ts**: Read full blueprint data (routes, personality, overrides, constraints, seo, navigation)
5. **CLI scaffold**: Apply features_add/remove/pages_remove during composition
6. **CLI scaffold**: Map blueprint routes to section/page pairs
7. **CLI DECANTR.md**: Add route map, sections context, constraints, SEO, navigation sections
8. **Tests**: Update all composition tests, add section-aware tests

### Phase 2: Content & Registry Updates

9. **decantr-content blueprints**: Audit and fix feature lists for all 17 blueprints
10. **decantr-content blueprints**: Verify route maps for V2 blueprints
11. **decantr-content validate.js**: Add route and feature override validation
12. **Registry TypeScript types**: Align with actual JSON schemas (patterns, shells, recipes)

### Phase 3: Enhanced Generation

13. **CLI task contexts**: Add section-scoped task-add-page.md and task-modify.md
14. **CLI DECANTR.md**: Add recipe guidance section (pattern_preferences, compositions)
15. **MCP server**: Enrich blueprint response with sections and routes
16. **Guard rules**: Update to iterate sections, add route completeness advisory rule

### Phase 4: Validation

17. **Rebuild CLI**, re-init showcase with new pipeline
18. **Verify**: carbon-ai-portal essence has proper sections, routes, features, topology
19. **Verify**: DECANTR.md has all new sections with correct content
20. **Run all tests**: Ensure backward compatibility

---

## Success Criteria

1. `decantr init --blueprint=carbon-ai-portal` produces an essence with:
   - 4+ sections (not a flat page list)
   - Routes mapping to section/page pairs
   - Personality from the blueprint (not defaults)
   - All 33+ features correctly resolved (archetype union + add - remove)

2. The DECANTR.md includes:
   - Composition Topology (zones, transitions, entry points)
   - Route Map (URL → section/page table)
   - Per-Section Context (scoped features, patterns, description)
   - Design Constraints (if blueprint defines them)
   - SEO Guidance (if blueprint defines seo_hints)
   - Navigation (if blueprint defines hotkeys/command palette)
   - Recipe Guidance (pattern preferences, compositions)

3. An AI reading ONLY the DECANTR.md can:
   - Wire all zone transitions without explicit instructions
   - Generate correct URL routes without inventing them
   - Scope its work to a specific section when modifying pages
   - Apply design constraints (dark_only, monospace_only for terminal-dashboard)
   - Implement SEO metadata from hints

4. A 100-page app produces a manageable essence (sectioned, not a 100-item flat list) and the AI can work incrementally on one section at a time.

---

## Open Questions

1. **Should V1 (minimal) blueprints auto-generate routes during init?** Recommendation: yes — derive `/page-id` from each page ID. Simple, predictable.

2. **Should the flat `blueprint.pages` field be kept for backward compat alongside sections?** Recommendation: no — provide `flattenPages()` helper instead. Keeping both creates ambiguity about which is authoritative.

3. **Should sections support per-section DNA overrides (density, mode)?** Recommendation: yes but optional. This enables "admin section is compact, marketing is spacious" without per-page overrides. Defer enforcement to Phase 3.

4. **Should `blueprint.features` (the informational list) be auto-computed or manually maintained?** Recommendation: auto-computed by the CLI during init (union + add - remove). The registry display can show this computed list. No manual maintenance needed.
