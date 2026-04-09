# Decantr Composition Pipeline — LLM-First Redesign

**Date:** 2026-04-01
**Status:** Draft
**Author:** David Aimi
**Supersedes:** `2026-04-01-composition-pipeline-design.md`, `2026-03-31-composition-topology-design.md`

---

## Overview

A ground-up redesign of how Decantr composes, stores, and presents design intelligence to AI code generators. The core insight: **the essence is for structure, the section contexts are for generation.** The AI doesn't read a single 1000-line reference document — it reads one self-contained file per task scope with everything inlined: guard rules, theme tokens, decorators, pattern specs with code examples, and topology context.

This spec covers the full application lifecycle: greenfield init, brownfield attach, progressive development, maintenance, and validation.

### Design Philosophy

**Decantr is an LLM-first framework.** Every decision is evaluated by: "Can an LLM read this single file and correctly generate code without cross-referencing anything else?"

- **One file per task scope, everything inlined, no cross-referencing**
- **The essence is the source of truth — compact, structural, for tools and review**
- **Section contexts are the LLM's working documents — rich, self-contained, derived**
- **DECANTR.md is a methodology primer only — ~200 lines, never grows with the app**
- **Everything derived is regenerable** — change the essence, run `decantr refresh`, get updated contexts

### Goals

- An LLM working on a section reads ONE file and has everything it needs
- The essence stores full structural data (sections, routes, features, DNA, meta)
- DECANTR.md never exceeds ~200 lines regardless of app size
- Section context files are pre-compiled with inlined pattern specs, tokens, decorators, guard rules, and topology
- The architecture supports all lifecycle phases: greenfield, brownfield, progressive mutation, maintenance
- All registry content (52 archetypes, 17 blueprints, 97 patterns, 13 shells, 11 recipes, 17 themes) flows cohesively through the pipeline

### Non-Goals

- Multi-file essence splitting (sections are the prerequisite — this is future)
- Real-time AI collaboration (the static file model is sufficient)
- Visual design tool integration (Figma, etc.)
- Pattern-level code generation by Decantr itself (the AI generates code, Decantr guides it)

---

## Architecture

### The Three-Tier Context Model

```
Tier 1: DECANTR.md                    (~200 lines, never grows)
        Methodology primer. What is Decantr, how guard rules work,
        enforcement tiers, violation protocol, file layout guide.
        Read once per project. Not project-specific.

Tier 2: decantr.essence.json          (grows with app, structured JSON)
        Source of truth. Sections, routes, features, DNA, meta.
        For CLI tools, guard validation, MCP server, human review.
        The AI reads this for structural queries, not for generation.

Tier 3: .decantr/context/             (one file per task scope)
        scaffold.md                   — full app overview (creative tier)
        section-{id}.md               — per-section context (guided/strict tier)
        Each file is self-contained with INLINED pattern specs, tokens,
        decorators, guard rules, topology. The AI reads ONE of these per task.
```

**The LLM's workflow:**
1. First task (scaffold): reads `DECANTR.md` (200 lines) + `scaffold.md` (full app overview)
2. Adding a page: reads `section-{id}.md` only (~150-200 lines, everything inlined)
3. Modifying a page: reads `section-{id}.md` only
4. No cross-referencing. No "also read DECANTR.md." No "fetch pattern from registry."

### Why This Is Right for LLMs

| LLM Behavior | How This Architecture Accommodates It |
|---------------|---------------------------------------|
| Context window is finite | Section contexts are ~200 lines, not 1000+ |
| Forgets instructions at the beginning of long docs | Everything relevant is in one short file |
| Poor at cross-referencing multiple files | Everything inlined, no "see also" references |
| Good at structured JSON parsing | Essence is structured JSON for when AI needs structure |
| Good at following explicit rules | Guard rules inlined in each section context |
| Degrades when given irrelevant context | Section scoping eliminates noise from other sections |

---

## Tier 1: DECANTR.md (~200 Lines, Immutable Size)

This is the methodology primer. It does NOT contain project-specific data (no pages tables, no route maps, no pattern lists, no topology narratives). It contains ONLY:

```markdown
# DECANTR.md

This project uses Decantr for design intelligence.

## What is Decantr?
[2 paragraphs — spec-driven design, two-layer model, guard rules]

## Two-Layer Model
### DNA (Design Axioms) — violations are errors
[1 paragraph — theme, spacing, typography, color, radius, elevation, motion, accessibility, personality]

### Blueprint (Structure) — deviations are warnings
[1 paragraph — sections, pages, routes, features, shells, patterns]

## Guard Rules
[Table of 8 rules with severity]

## Enforcement Tiers
| Tier | When Used | DNA | Blueprint |
|------|-----------|-----|-----------|
| Creative | New scaffolding | Off | Off |
| Guided | Adding pages/features | Error | Off |
| Strict | Modifying code | Error | Warn |

## Violation Response Protocol
1. STOP  2. EXPLAIN  3. OFFER update  4. WAIT

## How To Use This Project

### Initial scaffolding
Read `.decantr/context/scaffold.md` for the full app overview.

### Working on a section
Read `.decantr/context/section-{name}.md` for that section's complete context.
Each section file contains: guard rules, theme tokens, decorators, pattern specs,
code examples, topology context, and routes. Everything you need, in one place.

### Source of truth
`decantr.essence.json` is the structural spec. Tools and guards read this.
You read section context files instead — they're richer and scoped.

### Validation
Run `decantr check` to validate code against the spec.

### Commands
decantr status          — project health
decantr check           — detect drift
decantr add section X   — compose a new archetype
decantr add page X/Y    — add a page to a section
decantr remove section X — remove a section
decantr refresh         — regenerate all context files
decantr upgrade         — check for registry updates
```

That's it. ~200 lines. Does not grow with pages, sections, or features. The project-specific detail lives in the context files.

---

## Tier 2: Essence V3.1 (Source of Truth)

### Schema

```typescript
interface EssenceV31 {
  version: '3.1.0';

  dna: {
    theme: { style: string; mode: string; recipe: string; shape: string };
    spacing: { base_unit: number; scale: string; density: string; content_gap: string };
    typography: { scale: string; heading_weight: number; body_weight: number };
    color: { palette: string; accent_count: number; cvd_preference: string };
    radius: { philosophy: string; base: number };
    elevation: { system: string; max_levels: number };
    motion: { preference: string; duration_scale: number; reduce_motion: boolean;
              timing?: string; durations?: Record<string, string> };
    accessibility: { wcag_level: string; focus_visible: boolean; skip_nav: boolean };
    personality: string[];
    constraints?: {
      mode?: string;          // "dark_only"
      typography?: string;    // "monospace_only"
      borders?: string;       // "ascii_box_drawing"
      corners?: string;       // "sharp_only"
      shadows?: string;       // "none"
      effects?: Record<string, string>;
    };
  };

  blueprint: {
    sections: EssenceSection[];
    features: string[];                    // resolved global list (union + add - remove)
    routes: Record<string, RouteEntry>;    // URL → section/page mapping
  };

  meta: {
    archetype: string;                     // primary archetype ID
    target: string;                        // react, vue, svelte, nextjs, etc.
    platform: { type: string; routing: string };
    guard: { mode: string; dna_enforcement: string; blueprint_enforcement: string };
    seo?: { schema_org?: string[]; meta_priorities?: string[] };
    navigation?: {
      hotkeys?: Array<{ key: string; route?: string; action?: string; label: string }>;
      command_palette?: boolean;
    };
  };
}

interface EssenceSection {
  id: string;                              // archetype ID
  role: ArchetypeRole;                     // primary | gateway | public | auxiliary
  shell: string;                           // default shell for this section
  features: string[];                      // features scoped to this section
  description: string;                     // archetype description (intent)
  pages: BlueprintPage[];
}

interface BlueprintPage {
  id: string;                              // page ID (no prefix)
  route?: string;                          // URL path
  layout: LayoutItem[];                    // pattern aliases in order
  patterns?: PatternRef[];                 // full refs: { pattern, preset, as }
  shell_override?: string;                 // per-page shell override
  dna_overrides?: { density?: string; mode?: string };
}

interface PatternRef {
  pattern: string;                         // registry pattern ID
  preset?: string;                         // preset variant
  as?: string;                             // alias used in layout
}

interface RouteEntry {
  section: string;                         // section ID
  page: string;                            // page ID within section
}
```

### What Changed from V3.0

| Field | V3.0 | V3.1 |
|-------|------|------|
| `blueprint.pages` (flat) | Yes | Removed — replaced by `blueprint.sections[].pages` |
| `blueprint.sections` | No | New — grouped by archetype |
| `blueprint.routes` | No | New — from blueprint routes map |
| `section.role` | No | New — topology role |
| `section.description` | No | New — archetype description |
| `section.features` | No | New — scoped features |
| `page.route` | No | New — URL path |
| `page.patterns` | No | New — full refs (pattern + preset + alias) |
| `dna.personality` | From defaults | From blueprint personality |
| `dna.constraints` | No | New — from blueprint design_constraints |
| `dna.motion.timing/durations` | No | New — from recipe animation |
| `meta.seo` | No | New — from blueprint seo_hints |
| `meta.navigation` | No | New — from blueprint navigation |

### Feature Resolution

```
resolved_features =
  union(section.features for each section)
  + blueprint.overrides.features_add
  - blueprint.overrides.features_remove
```

Each section retains its own scoped feature list (from archetype). The global `blueprint.features` is the resolved union. The blueprint's top-level `features` field in decantr-content is informational — the CLI computes the resolved list.

### Migration from V3.0

```typescript
function migrateV30ToV31(essence: EssenceV3): EssenceV31 {
  return {
    ...essence,
    version: '3.1.0',
    blueprint: {
      sections: [{
        id: essence.meta.archetype,
        role: 'primary',
        shell: essence.blueprint.shell,
        features: essence.blueprint.features,
        description: '',
        pages: essence.blueprint.pages,
      }],
      features: essence.blueprint.features,
      routes: {},
    },
  };
}
```

---

## Tier 3: Section Context Files (The LLM's Working Documents)

### Structure

Generated during `decantr init` and regenerated by `decantr refresh`. One file per section.

```
.decantr/context/
  scaffold.md                     — creative tier: full app overview
  section-ai-chatbot.md           — guided/strict tier: chat section
  section-auth-full.md            — guided/strict tier: auth section
  section-settings-full.md        — guided/strict tier: settings section
  section-marketing-saas.md       — guided/strict tier: marketing pages
  section-about-hybrid.md         — guided/strict tier: about page
  section-contact.md              — guided/strict tier: contact page
  section-legal.md                — guided/strict tier: legal pages
```

### Section Context File Format

Each section file follows this exact structure. Everything is inlined — the LLM reads ONLY this file for its task.

```markdown
# Section: {section_id}

**Role:** {role} | **Shell:** {shell} | **Archetype:** {archetype_id}
**Description:** {archetype description}

---

## Guard Rules

Mode: {guard_mode} | DNA: {dna_enforcement} | Blueprint: {blueprint_enforcement}

| # | Rule | Severity | What It Checks |
|---|------|----------|----------------|
| 1 | Style | error | Code uses {theme_style} theme |
| 2 | Recipe | error | Decorations use {recipe} recipe |
| 3 | Density | error | Spacing follows {density} density |
| 4 | Accessibility | error | Code meets WCAG {wcag_level} |
| 5 | Theme-mode | error | {theme_style}/{mode} combination |
| 6 | Structure | warn | Pages exist in this section |
| 7 | Layout | warn | Pattern order matches layout |
| 8 | Pattern existence | warn | Patterns exist in registry |

---

## Theme: {theme_style} ({mode})

```css
--d-primary: {value};
--d-bg: {value};
--d-surface: {value};
--d-surface-raised: {value};
--d-border: {value};
--d-text: {value};
--d-text-muted: {value};
/* ... all token values from tokens.css ... */
```

---

## Decorators ({recipe} recipe)

| Class | Description |
|-------|-------------|
{for each decorator in recipe.decorators}
| `{class}` | {description} |

**Spatial hints:** {spatial_hints description}
**Preferred patterns:** {pattern_preferences.prefer}
**Compositions:** {relevant composition for this section's shell}

---

## Zone Context

This section is in the **{zone_label}** zone ({shell} shell).
{zone-specific transition descriptions}

---

## Features

{comma-separated feature list for this section}

---

## Pages

{for each page in section}
### {page_id} ({route})

Layout: {layout items joined with →}
Shell: {shell_override or section shell}

{for each pattern in page.patterns}
#### Pattern: {pattern_id} (preset: {preset})

{pattern description}

**Components:** {pattern components list}

**Layout slots:**
{for each slot in pattern preset layout.slots}
- `{slot_name}`: {slot_description}

**Code example:**
```{target}
{pattern preset code.example}
```

{end for each pattern}
{end for each page}

---

## Personality

{personality traits joined}

## Constraints
{if constraints exist}
{constraint descriptions}
```

### Scaffold Context (scaffold.md)

The scaffold context is for the initial build (creative tier). It's the only context that covers the FULL app:

```markdown
# Scaffold: {app_name}

**Blueprint:** {blueprint_id}
**Theme:** {theme_style} ({mode}) | **Recipe:** {recipe}
**Personality:** {personality traits}
**Guard mode:** creative (no enforcement during initial scaffolding)

## App Topology

{zones with archetypes, transitions, entry points — same as current topology section}

## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
{for each section}
| {id} | {role} | {shell} | {page count} | {feature count} |

## Route Map

| Route | Section | Page | Shell |
|-------|---------|------|-------|
{for each route}
| {path} | {section} | {page} | {shell} |

## Full Section Contexts

For detailed pattern specs and code examples per section, read:
{for each section}
- `.decantr/context/section-{id}.md`

## DNA Summary

{key DNA axioms: theme, density, accessibility, radius, motion}

## Design Constraints
{if blueprint has design_constraints}
{constraint details}

## SEO Hints
{if blueprint has seo_hints}
{seo details}

## Navigation
{if blueprint has navigation}
{hotkeys, command palette details}
```

The scaffold context references section contexts for detail. During initial scaffolding, the AI may read multiple section contexts — but for each section it works on, it reads just that one file.

---

## Composition Pipeline

### Data Flow

```
Registry Content (patterns, archetypes, themes, recipes, shells, blueprints)
                           │
                    CLI: decantr init
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  Fetch blueprint    Fetch archetypes   Fetch theme + recipe
  (routes, personality,  (pages, features,    (tokens, decorators,
   overrides, constraints,  patterns, role,      spatial hints,
   seo, navigation)        description, shells)  animation, compositions)
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    Compose Sections
                    (group by archetype, preserve boundaries)
                           │
                    Resolve Features
                    (union + add - remove)
                           │
                    Map Routes
                    (blueprint routes → section/page pairs)
                           │
                    Derive Topology
                    (roles → zones → transitions → entry points)
                           │
         ┌─────────────────┼─────────────────────────┐
         │                 │                 │        │
         ▼                 ▼                 ▼        ▼
   Essence JSON     DECANTR.md        Section      CSS files
   (source of       (~200 lines,      contexts     (tokens.css,
    truth)           methodology       (one per     decorators.css)
                     primer)           section,
                                       everything
                                       inlined)
```

### What the CLI Reads from Each Content Type

**From blueprint:**
- `compose[]` — archetype list and order
- `theme` — style, mode, recipe, shape
- `personality[]` — brand traits → `dna.personality`
- `routes` — URL mapping → `blueprint.routes` + page route fields
- `overrides.features_add` — applied during feature resolution
- `overrides.features_remove` — applied during feature resolution
- `overrides.pages_remove` — pages excluded during composition
- `overrides.pages` — per-page layout/shell overrides
- `seo_hints` — → `meta.seo`
- `navigation` — → `meta.navigation`
- `design_constraints` — → `dna.constraints`

**From each archetype:**
- `id` — section ID
- `role` — section role (topology)
- `description` — section description (intent propagation)
- `pages[]` — pages with pattern refs, shells, layouts
- `features[]` — section-scoped features
- `shells` — shell descriptions (for section context)

**From theme:**
- `seed`, `palette`, `tokens` — CSS custom property values (for tokens.css AND inlined in section contexts)
- `typography_hints` — `dna.typography` enrichment
- `motion_hints` — `dna.motion` enrichment
- `cvd_support` — accessibility context

**From recipe:**
- `decorators` — CSS classes (for decorators.css AND inlined in section contexts)
- `spatial_hints` — `dna.spacing` enrichment
- `animation` — `dna.motion` enrichment (timing, durations)
- `pattern_preferences` — inlined in section contexts
- `compositions` — inlined in relevant section contexts
- `radius_hints` — `dna.radius` enrichment

**From patterns (fetched per section):**
- Full pattern specs with presets — inlined in section context files
- Components, layout.slots, code examples — all inlined

### What's NOT Read (intentionally omitted)

- `archetype.classification` — only for AI matching, not composition
- `archetype.suggested_theme` — blueprint theme overrides
- `archetype.dependencies.recipes/styles` — informational, not consumed
- `blueprint.tags` — search metadata only
- `blueprint.$schema` — validation only

---

## Application Lifecycle

### Phase 1a: Greenfield Init

```bash
decantr init --blueprint=carbon-ai-portal
```

Produces: essence.json, DECANTR.md (~200 lines), section contexts (7 files), tokens.css, decorators.css, .decantr/project.json

### Phase 1b: Brownfield Attach

```bash
decantr analyze
```

1. **Scan** — detect framework, routes, component tree, styling approach
2. **Match** — suggest archetypes for existing page groups, patterns for existing components, theme for existing colors
3. **Propose** — show the user a proposed essence mapping
4. **Confirm** — user reviews and adjusts
5. **Generate** — produce essence.json describing the existing structure
6. **Derive** — generate DECANTR.md, section contexts, CSS files
7. **Audit** — `decantr check` shows gaps between code and essence

The essence starts as a description of reality. Guard violations highlight where the code doesn't match the spec. The user evolves the code or the spec toward alignment.

### Phase 2: Progressive Development

**Add a new section:**
```bash
decantr add section billing-portal
```
- Fetches the `billing-portal` archetype from registry
- Adds a new section to the essence
- Generates `section-billing-portal.md` context file
- Updates topology (recalculates zones/transitions)
- Updates scaffold.md overview
- Runs guard validation

**Add a page to a section:**
```bash
decantr add page settings/notifications
```
- Adds a page entry to the settings-full section
- Suggests patterns from the registry (based on page name + section features)
- Updates `section-settings-full.md` with the new page and inlined pattern specs
- Updates routes in essence

**Add a feature:**
```bash
decantr add feature webhooks --section=ai-chatbot
```
- Adds feature to the section's feature list
- Updates the resolved global features
- Regenerates section context with updated feature list

**Remove a section:**
```bash
decantr remove section legal
```
- Removes the section and its pages from essence
- Removes routes pointing to that section
- Deletes `section-legal.md` context file
- Updates topology

**Change theme:**
```bash
decantr theme switch terminal --recipe=terminal --shape=sharp
```
- Updates `dna.theme`, `dna.radius.philosophy`
- Regenerates tokens.css and decorators.css
- Regenerates ALL section context files (tokens and decorators change globally)
- Guard highlights code that uses old theme tokens

**Regenerate all derived files:**
```bash
decantr refresh
```
- Re-reads the essence + fetches all referenced patterns/recipes from registry
- Regenerates: DECANTR.md, all section contexts, tokens.css, decorators.css
- Use after manual essence edits or registry content updates

### Phase 3: Maintenance

**Check for registry updates:**
```bash
decantr upgrade
```
- Compares local essence references against registry versions
- Shows: "pattern hero has a new version, archetype ai-chatbot updated"

**Apply updates:**
```bash
decantr upgrade --apply
```
- Updates essence references to latest versions
- Regenerates section contexts with updated pattern specs

**Detect drift:**
```bash
decantr check
```
- Guard validates code against essence
- Reports DNA violations (errors) and blueprint violations (warnings)

**Resolve drift:**
- MCP tools: `decantr_accept_drift`, `decantr_update_essence`
- CLI: `decantr sync-drift`

---

## System Integration

### decantr-content Updates

**Archetypes (52 files):**
- `role` field — already added
- No other changes needed

**Blueprints (17 files):**
- Audit `features` against composed archetype union
- Ensure `overrides.features_add/remove` are intentional
- Verify `routes` maps for V2 blueprints
- No structural changes to blueprint schema

**validate.js:**
- Add: blueprint route validation (routes reference valid archetype/page pairs)
- Add: features_remove entries must exist in archetype feature union
- Existing: role validation on archetypes (already added)

### @decantr/essence-spec

- Add: `EssenceSection`, `RouteEntry`, `PatternRef` types
- Update: `EssenceBlueprint` to use sections
- Update: `EssenceDNA` with constraints, enriched motion
- Update: `EssenceMeta` with seo, navigation
- Update: `isV3` to accept 3.0.0 and 3.1.0
- Add: `migrateV30ToV31` function
- Add: `flattenPages(sections)` helper for guard rules
- Update: guard rules to iterate `flattenPages(sections)`

### @decantr/registry

- Rename: `composeArchetypes` → `composeSections` — returns `EssenceSection[]`
- Add: feature resolution with add/remove overrides
- Add: route mapping from blueprint routes to section/page pairs
- Align: TypeScript types with actual JSON schemas (patterns, shells, recipes)

### CLI

**scaffold.ts:**
- `composeSections()` — groups by archetype, preserves boundaries
- `buildEssenceV31()` — builds sectioned essence with full data
- `generateSectionContext()` — builds one section context file with INLINED pattern specs, tokens, decorators, guard rules, topology
- `generateScaffoldContext()` — builds the full-app scaffold overview
- `generateDecantrMd()` — simplified to ~200 line methodology primer
- `refreshDerivedFiles()` — regenerates all derived files from essence + registry

**index.ts:**
- Read full blueprint data (not just `{id, compose, features, theme}`)
- Fetch patterns per section for inlining in context files
- Pass all data through to scaffold

**New CLI commands:**
- `decantr add section {archetype}` — compose new archetype into essence
- `decantr add page {section}/{page}` — add page to section
- `decantr add feature {feature} --section={section}` — enable feature
- `decantr remove section {section}` — remove section
- `decantr remove page {section}/{page}` — remove page
- `decantr theme switch {theme}` — change theme
- `decantr refresh` — regenerate all derived files
- `decantr analyze` — brownfield project analysis (future phase)

**templates/DECANTR.md.template:**
- Simplified to methodology + enforcement + file layout guide
- All project-specific content removed (lives in context files)

### MCP Server

- `decantr_resolve_blueprint` — returns topology + sections + routes
- Consider: `decantr_get_section_context` — returns scoped context for one section (enables MCP-based AI tools to get the same context as the file-based approach)

### Guard System

- Update all rules to iterate `flattenPages(sections)`
- New advisory: route completeness (every page should have a route)
- New advisory: topology reachability (every zone should be reachable)
- Existing topology rules from previous spec retained

---

## File Size Analysis

| File | 20-page app | 80-page app | 200-page app |
|------|-------------|-------------|--------------|
| DECANTR.md | ~200 lines | ~200 lines | ~200 lines |
| Essence JSON | ~300 lines | ~800 lines | ~1800 lines |
| Section context (each) | ~150-200 lines | ~150-250 lines | ~150-300 lines |
| scaffold.md | ~200 lines | ~300 lines | ~400 lines |

DECANTR.md is constant. Section contexts grow only with the number of pages in THAT section (typically 2-8), not with the total app. The essence grows but it's structured JSON.

**LLM context usage per task:**
- Initial scaffold: DECANTR.md (~200) + scaffold.md (~200-400) = ~400-600 lines = ~2-3K tokens
- Working on a section: section context only (~150-200 lines) = ~1K tokens
- For comparison: a typical system prompt is 5-10K tokens

---

## Rollout Plan

### Phase 1: Foundation (Composition + Sections + Context Files)

1. essence-spec: Section types, route types, migration, guard updates
2. registry: `composeSections()`, feature resolution, TypeScript type alignment
3. CLI scaffold: `buildEssenceV31()`, section context generation, DECANTR.md simplification
4. CLI index.ts: Read full blueprint data, fetch patterns for inlining
5. Tests: Full coverage of new composition, context generation, migration

### Phase 2: Content & Registry Updates

6. decantr-content blueprints: Feature audit, route verification
7. decantr-content validate.js: Route and feature override validation
8. Publish updated content to registry

### Phase 3: Progressive Mutation Commands

9. `decantr add section` — compose new archetype
10. `decantr add page` — add page to section
11. `decantr add/remove feature` — feature mutations
12. `decantr remove section/page` — removal commands
13. `decantr theme switch` — theme migration
14. `decantr refresh` — regenerate all derived files

### Phase 4: Brownfield Analysis

15. `decantr analyze` — scan existing project structure
16. Route detection, component mapping, theme inference
17. Propose-and-confirm workflow for essence generation
18. Reconciliation with existing code via guard

### Phase 5: Validation & Showcase

19. Rebuild CLI, re-init showcase with new pipeline
20. Verify: carbon-ai-portal has proper sections, routes, inlined context files
21. Verify: AI reading section context can generate code without cross-referencing
22. Run all tests, verify backward compatibility

---

## Success Criteria

1. `decantr init --blueprint=carbon-ai-portal` produces:
   - Essence with 7 sections (not flat pages), routes, resolved features
   - DECANTR.md at ~200 lines (methodology only)
   - 7 section context files with INLINED pattern specs, tokens, decorators, guard rules, topology
   - scaffold.md with full app overview

2. An AI reading ONLY `section-ai-chatbot.md` can:
   - Generate the chat page with correct shell, patterns, and presets
   - Use the correct theme tokens (inlined, not "see tokens.css")
   - Apply the correct decorator classes (inlined, not "see decorators.css")
   - Wire zone transitions (topology inlined, not "see DECANTR.md")
   - Follow guard rules (inlined, not "see DECANTR.md")
   - Write code using the pattern code examples (inlined, not "fetch from registry")

3. A 100-page app with 10 sections produces:
   - DECANTR.md still at ~200 lines
   - 10 section context files at ~150-200 lines each
   - scaffold.md at ~300 lines
   - The AI working on settings reads ~200 lines, not 1000+

4. Progressive mutations work:
   - `decantr add section billing-portal` adds the section and generates its context file
   - `decantr refresh` regenerates all derived files from the current essence
   - Guard validates the updated structure

---

## Open Questions

1. **Should section context files include FULL pattern JSON or a curated summary?** Full JSON is most complete but could be 50-100 lines per pattern. A curated summary (description, components, slots, code example) is ~20-30 lines per pattern and more LLM-friendly. Recommendation: curated summary with code examples — the LLM doesn't need the full JSON schema, it needs enough to generate code.

2. **Should `decantr analyze` (brownfield) be in Phase 4 or earlier?** Recommendation: Phase 4. It's the most complex feature and depends on sections + mutation commands being solid first. The MCP tool `decantr_create_essence` provides a manual path until then.

3. **Should section context files be gitignored (regenerable) or committed?** Recommendation: committed. They're the LLM's working documents and should be reviewable in PRs. They're deterministic outputs from essence + registry, but committing them ensures the AI always has them available without running `decantr refresh` first.

4. **How should the scaffold context reference section contexts?** Recommendation: list them as "read `.decantr/context/section-{id}.md` for detailed pattern specs" but do NOT inline section contents into scaffold.md. Keep scaffold.md as an overview with routes and topology. The AI reads scaffold.md first, then dives into individual sections.
