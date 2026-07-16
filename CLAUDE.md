# CLAUDE.md -- Decantr

Do not add Co-Authored-By lines to commits.

## Project

Decantr is AI Frontend Governance. It is a contract, context, content-corpus, and evidence layer that AI coding assistants use to keep frontend changes coherent in production codebases. Decantr does not generate code -- the AI does.

Current product model: the repository is preparing Decantr 3.9.0, Governed Change Proof, on top of the public 3.8.3 baseline. The 3.9 implementation adds verifier-owned adoption truth, bounded task capsules, governance deltas, and explicit CI v3 while keeping v2 reports as the default. It is not a completed public release until the release-evidence gate, packed-artifact matrix, publication verification, and release closeout all pass. Because Decantr has one human maintainer, stable 3.9.0 may publish under the explicit `sole-maintainer-unqualified` waiver; the fail-closed human qualification packet remains incomplete and no precision, recall, release-qualification, or adoption-proven claim is allowed. Decantr 3.8 remains patch-only under `docs/runbooks/decantr-3-8-maintenance.md`; 3.9 maintenance boundaries live in `docs/runbooks/decantr-3-9-maintenance.md`. The approved program is `docs/programs/2026-07-16-decantr-3-9-adoption-proof-program.md`; older program files remain historical strategy unless a current reference or release note explicitly re-promotes them. A forward-looking successor architecture is tracked in `docs/audit/decantr-meta-alignment.md` (`decantr-meta` project, separate from this monorepo).

## Packages

| Package | Path | Description |
|---------|------|-------------|
| `@decantr/essence-spec` | `packages/essence-spec/` | Essence v4 schema, validator, guard rules, migration, and TypeScript types |
| `@decantr/content` | `packages/content/` | Official corpus, schemas, validation, search, resolution, and content health helpers |
| `@decantr/registry` | `packages/registry/` | Thin Decantr 3.x compatibility facade over content-owned implementations and schemas |
| `@decantr/core` | `packages/core/` | Execution-pack, pipeline, typed graph, route context, and changed-file impact primitives |
| `@decantr/telemetry` | `packages/telemetry/` | Optional event contracts and caller-controlled sinks; no hosted default collection |
| `@decantr/mcp-server` | `packages/mcp-server/` | MCP server exposing the submitted 8-tool surface to AI assistants |
| `@decantr/css` | `packages/css/` | Legacy optional CSS atom adapter; not a default adoption path |
| `@decantr/verifier` | `packages/verifier/` | Shared discovery, verification, canonical governed-change contracts, and report-schema engine |
| `@decantr/vite-plugin` | `packages/vite-plugin/` | Vite plugin for real-time design drift detection |
| `@decantr/cli` | `packages/cli/` | CLI for project initialization, content queries, validation, Project Health, and governance workflows |

## Apps

| App | Path | Description |
|-----|------|-------------|
| `decantr-api` | `apps/api/` | Fly-hosted content API for corpus, schemas, search, intelligence, showcase metadata, and execution packs |
| `decantr-showcase-host` | `apps/showcase-host/` | Shared Vite host for live blueprint showcase capsules. Capsule source lives in `apps/showcase-host/src/capsules/<slug>/`; metadata and reports remain in `apps/showcase/`. |

## Terminology

Wine metaphors are used in branding only. Code and schema use normalized terms.

| Wine Term | Normalized Term | Meaning |
|-----------|----------------|---------|
| Essence | Essence (kept) | The spec file (`decantr.essence.json`) |
| Essence Pipeline | Design Pipeline | The seven-stage methodology |
| POUR | Intent | User expresses what they want |
| TASTE | Interpret | System interprets intent into structured form |
| SETTLE | Decompose | Break intent into layers |
| CLARIFY | Specify | Write the machine-readable spec |
| DECANT | Compose | Resolve page layouts from patterns and themes |
| SERVE | Generate | Produce code (done by user's AI, not Decantr) |
| AGE | Guard | Validate changes against the spec |
| Vintage | Theme | Style, mode, shape |
| Vignette | Blueprint | A composed app template |
| Archetype | Archetype (kept) | App-level template (e.g., dashboard) |
| Pattern | Pattern (kept) | Composable UI section |
| Carafe | Shell | App shell layout |
| Blend | Layout | Page composition |
| Character | Personality | Brand traits |
| Clarity | Density | Spatial density |
| Tannins | Features | Functional systems (auth, search, payments) |
| Cork | Guard | Drift prevention rules |
| Vessel | Platform | SPA/MPA, routing mode |
| Plumbing | Wiring | Cross-pattern state sharing |

## Content Architecture

Content lives in `packages/content` as `@decantr/content` and is the source of truth for all `@official` corpus content.

Official content enriches blueprint/archetype/theme/pattern flows. It is not a hard dependency for brownfield attach or contract-only adoption: those paths must work from local project analysis and generated Decantr contract files, including in offline enterprise scenarios.

`@decantr/content` ships the official corpus with package-local schemas, validation helpers, search/resolution helpers, and content health scripts. The Fly API reads this package for public content/reference routes. There is no public registry marketplace or Supabase-backed content table in the current product model.

**Content resolution fallback chains:**
- **CLI single items** (`get`): Custom → content API → Cache
- **CLI lists** (`list`): content API → Cache → merge Custom
- **CLI `get` fallback**: content API → Cache → Bundled
- **MCP Server**: content API/corpus reads through content-owned clients while retaining the `decantr_registry` tool name
- **CLI Bundled**: Offline fallback defaults in `packages/cli/src/bundled/`

```
packages/cli/src/bundled/    # Offline fallback content (not from RegistryClient)
  blueprints/                # Default blueprint for offline init
  patterns/                  # Core patterns (hero, nav-header, footer, etc.)
  themes/                    # Default theme
  shells/                    # Default shell layout
```

## Telemetry Boundary

Decantr has no hosted telemetry sink. CLI opt-in records a local preference, but event delivery requires an explicit caller-controlled `DECANTR_TELEMETRY_ENDPOINT`; guard metrics require `DECANTR_TELEMETRY_GUARD_ENDPOINT`. Private identity linking requires `--api-url` or `DECANTR_TELEMETRY_IDENTITY_API_URL` and must never fall back to the content API through `DECANTR_API_URL`.

## Essence Schemas

- **v4** (`docs/schemas/essence.v4.json`) -- active Essence V4 sectioned schema with DNA/Blueprint split, `dna_enforcement` / `blueprint_enforcement` fields, per-page `dna_overrides`, and section topology.
- **v2/v3** (`docs/schemas/essence.v2.json`, `docs/schemas/essence.v3.json`) -- historical migration references only. Active workflows must run `decantr migrate --to v4` before validation, refresh, check, packs, MCP mutation, or hosted compilation.

All resource schemas live in `docs/schemas/`.

## Content Schema Fields

Patterns, blueprints, themes, and archetypes carry enriched fields for visual intelligence:

| Field | Content Type | Description |
|-------|-------------|-------------|
| `visual_brief` | Pattern | 2-5 sentence visual description of the pattern |
| `composition` | Pattern | Component composition algebra expressions |
| `motion` | Pattern | Micro-interactions, transitions, ambient animations |
| `interactions` | Pattern | Declared runtime interactions (24-value enum: `animate-on-mount`, `drag-nodes`, `status-pulse`, `glow-hover`, `pan-background`, `zoom-scroll`, `click-connect`, `inline-edit`, `hover-tooltip`, `live-simulation`, `keyboard-navigation`, `focus-trap`, etc.). Surfaced in page-pack as a checkbox checklist; enforced by 8th guard rule. |
| `responsive` | Pattern | Mobile/tablet/desktop adaptation strategies |
| `accessibility` | Pattern | ARIA, keyboard, focus, screen reader patterns |
| `layout_hints` | Pattern | Freeform rendering guidance key-value pairs |
| `voice` | Blueprint | Copy/tone intelligence (CTA verbs, empty states, errors) |
| `personality` | Blueprint | Visual personality narrative (min 100 chars) |
| `responsive_strategy` | Blueprint | Global responsive breakpoint strategy |
| `directives` | Blueprint section/page, archetype | Execution-level rules. Short imperative strings. Belongs in pack contract, not narrative doc. |
| `navigation_items` | Blueprint section, archetype | Per-section primary nav items (label, route, icon, hotkey, active_match) |
| `command_palette` | Blueprint navigation | Structured contract — `boolean` (legacy) OR `{ trigger, placeholder, width, styling, commands[] }` |
| `hotkey_semantics` | Blueprint navigation | Behavioral directives: `chord_window_ms`, `input_guard`, `modifier_suppression`, `match_case`, `show_chord_indicator` |
| `decorator_definitions` | Theme | Structured decorator data (intent, properties, usage, optional `hover_properties` / `focus_properties` / `active_properties`) |
| `motion.durations.{instant,fast,base,slow,slower,stagger}` | Theme | Per-theme tuned motion durations (overrides CLI default tokens) |
| `motion.easings.{ease,easeOut,easeIn,spring}` | Theme | Per-theme tuned easing curves |
| `typography.{display,body}` | Theme | Display + body font stacks |
| `elevation[1..5]` | Theme | Per-theme elevation scale; mode-split via `{ light, dark }` |
| `internal_layout` | Shell | Semantic spatial specs per region (width, height, padding, gap, scroll); nested atom fields are legacy hints for explicit Decantr CSS adoption only |
| `page_briefs` | Archetype | Per-page visual descriptions |
| `role` | Archetype | Section role: primary, gateway, public, auxiliary |

## Execution Packs

Compact, compiled contracts consumed by AI agents during scaffolding. Generated into a project's `.decantr/context/` directory by `decantr init` / `decantr content compile-packs` (legacy `decantr registry compile-packs` remains compatible). Schemas live in `docs/schemas/`.

| Pack | Schema | Purpose |
|------|--------|---------|
| scaffold-pack | `scaffold-pack.v1.json` | App-level contract: shell, theme, features, route map |
| section-*-pack | (section-level) | Per-section contract (shell dimensions, decorators, tokens) |
| page-*-pack | `page-pack.v1.json` | Per-route contract (patterns, voice, visual brief) |
| mutation-pack | `mutation-pack.v1.json` | Add/remove mutation contracts |
| review-pack | `review-pack.v1.json` | Review / critique flow contract |
| execution-pack-bundle | `execution-pack-bundle.v1.json` | Aggregate of all packs for a project |
| pack-manifest | `pack-manifest.v1.json` | Index of generated packs |

Related intelligence schemas: `content-intelligence.v1.json`, `registry-intelligence-summary.v1.json`, `project-audit-report.v1.json`, `file-critique-report.v1.json`, `public-content-{list,record,summary}.v1.json`.

## Governed Change Contracts

`@decantr/verifier` is the sole owner of the additive Decantr 3.9 proof contracts:

- `AdoptionTruthV1` records one selected application plus independently modeled observation, governance, and mutation facts.
- `TaskCapsuleV1` provides bounded task-time project, route, graph, authority, impact, finding, content-provenance, stop-condition, and verification context. Its canonical/default payload limit is 12,000 UTF-8 bytes with deterministic `ceil(bytes / 3)` token estimation.
- `GovernanceDeltaV1` classifies new, inherited, resolved, and unclassified finding occurrences against compatible evidence and returns `not_proven` when a baseline or change scope is missing or incompatible.

CLI, MCP, CI v3, and Studio adapt these verifier-built values; they must not define competing discovery or proof shapes. Existing v2 machine reports remain the default throughout 3.9.x. `decantr ci --report-version v3` is the only 3.9 opt-in report upgrade, and `decantr ci init --report-version v3` is required to generate a v3 workflow. No environment variable, package version, or upgrade may select v3 silently.

## Section Context Enrichments

Section contexts (`.decantr/context/section-*.md`) include additional blocks generated from shell `internal_layout` data:

- **Quick Start** -- Summary block: shell name, primary region, key spatial dimensions
- **Shell Implementation** -- Full spatial layout block with region dimensions, scroll container designation, responsive behavior
- **Spacing Guide** -- Computed spacing values table mapping density tokens to pixel values for the section's shell regions
- **Layout Rules** -- Nesting anti-patterns in DECANTR.md:
  1. Never nest a scroll container inside another scroll container
  2. Never place a fixed/sticky element inside an overflow:hidden container
  3. Never use viewport units (vh/vw) inside a flex/grid child
  4. Never nest grid layouts more than 2 levels deep
  5. Never apply padding to a container that also uses gap for the same axis

## Design Pipeline

1. **Intent** -- User describes what they want to build.
2. **Interpret** -- Parse intent into structured form.
3. **Decompose** -- Split into theme, structure, features.
4. **Specify** -- Write `decantr.essence.json`.
5. **Compose** -- Resolve layouts from patterns and themes.
6. **Generate** -- User's AI generates code from the composition.
7. **Guard** -- Validate every change against the spec. Prevent drift.

## Guard Rules

The guard system (`packages/essence-spec/src/guard.ts`) enforces eight rules, ordered DNA-first.

**DNA guards (errors):**

1. **Style** -- Code must use the theme specified in the Essence.
2. **Density** -- Content gap values must match the Essence density setting. Strict mode only (warning severity). Essence v4 respects per-page `dna_overrides.density`.
3. **Accessibility** -- Code must meet the WCAG level specified in the Essence. Enforced in `guided` and `strict`.
4. **Theme-mode compatibility** -- The theme/mode combination must be compatible. Checked when `themeRegistry` is provided.

**Blueprint guards (warnings in Essence v4, auto-fixable):**

5. **Structure** -- Pages referenced in code must exist in the Essence structure.
6. **Layout** -- Pattern order in a page must match the Essence layout spec. Strict mode only.
7. **Pattern existence** -- All patterns referenced in layouts must exist in the official corpus or accepted local content. Includes fuzzy "did you mean?" suggestions.

**Experiential guard (8th rule):**

8. **Interactions** -- Patterns that declare `interactions: [...]` must implement each one in source. Source is scanned by `@decantr/verifier`'s `verifyInteractionsInSource()` (regex/substring signal map for 24 canonical interactions like `drag-nodes`, `status-pulse`, `glow-hover`). Severity governed by `meta.guard.interactions_enforcement` (`'error' | 'warn' | 'off'`) with mode-derived defaults: creative=off, guided=warn, strict=error. Fed into `evaluateGuard` via `GuardContext.interaction_issues` (CLI `decantr check` runs `scanProjectInteractions(cwd)` to compute).

Modes: `creative` (no enforcement), `guided` (1, 3, 4, 5, 7, 8-warn), `strict` (all).

**Essence v4 enforcement fields:** DNA violations are controlled by `dna_enforcement` (`'error'` | `'warn'` | `'off'`); Blueprint violations by `blueprint_enforcement` (`'warn'` | `'off'`); Interactions violations by `interactions_enforcement` (`'error'` | `'warn'` | `'off'`). Blueprint violations are warnings and are auto-fixable. Interactions violations are NOT auto-fixable (require code generation).

## Build and Test

```bash
pnpm install        # Install all dependencies
pnpm build          # Build active packages and product apps
pnpm test           # Run all tests via vitest
pnpm lint           # Type-check active product surfaces
pnpm clean          # Remove all dist/ directories
```

Requires Node.js >= 20 and pnpm >= 9.

## Legacy Decantr CSS Layer Cascade

This section applies only when `adoptionMode` is explicitly `decantr-css` or when maintaining the legacy `@decantr/css` package. Contract-only and style-bridge execution packs, prompts, review rules, and assistant bridges must use host-system language and must not emit `d-*` classes, Decantr token requirements, treatment files, or theme decorator requirements.

All generated CSS uses `@layer` declarations:

```css
@layer reset, tokens, treatments, decorators, utilities, app;
```

- `reset` -- normalize/reset styles (global.css)
- `tokens` -- CSS custom properties from theme (tokens.css)
- `treatments` -- base treatment classes (40+):
  - **Core surfaces**: `d-interactive` (with size + variant), `d-surface`, `d-data` (+ row/header/cell), `d-control`, `d-section`, `d-annotation`, `d-label`
  - **Common UI**: `d-link`, `d-icon-btn`, `d-nav-link`, `d-step-chip`, `d-divider-{top,bottom,left,right,base}`
  - **Spatial / graph**: `d-agent-node`, `d-port` (with `data-side`)
  - **Banners / CTAs**: `d-cta-banner`, `d-interactive[data-variant="dark"]`
  - **Shell layouts**: `d-shell` (with `data-layout="sidebar-main|centered|top-nav-footer|sidebar-aside"`), `d-shell-sidebar`, `d-shell-aside`, `d-shell-main`, `d-shell-header`, `d-shell-body`, `d-shell-footer`, `d-shell-centered-card`
  - **Modal / palette / kbd**: `d-modal`, `d-modal-backdrop`, `d-modal-panel`, `d-palette`, `d-palette-input/list/row/section`, `d-kbd`, `d-hotkey-indicator`
  - **Composite card**: `d-card`, `d-card-header`, `d-card-body`, `d-card-footer`
  - **Motion**: `d-enter-fade`, `d-enter-slide-up`, `d-enter-scale`, `d-stagger-children`, `d-pulse`, `d-pulse-ring`, `d-shimmer`, `d-float`, `d-glow-hover`, `d-scale-hover`, `d-lift-hover`, `d-ripple` — all respect `prefers-reduced-motion: reduce`
  - **Typography**: `d-display`, `d-headline`, `d-title`, `d-subtitle`, `d-prose`, `d-body`, `d-caption`, `d-eyebrow`, `d-numeric`, `d-mono-text`
  - **Elevation**: `d-elevate[data-level="0..5"]`
  - **Data-viz**: `d-timeline-rail`, `d-timeline-dot`, `d-sparkline` (+ path/area), `d-intent-radar` (+ ring/axis), `d-waveform`, `d-qr-placeholder`, `d-conic-ring`, `d-heatmap-cell`
- `decorators` -- theme-specific decorator classes (e.g., carbon-card, carbon-glass) with optional state variants (`hover_properties`, `focus_properties`, `active_properties`)
- `utilities` -- personality-derived utility classes (e.g., neon-glow, mono-data, status-ring with size variants)
- `app` -- application-specific overrides

**Token scales:**
- **Motion**: `--d-motion-{instant,fast,base,slow,slower,stagger}`, `--d-motion-{ease,ease-out,ease-in,ease-spring}` (themes override via `theme.motion.durations` / `theme.motion.easings`)
- **Typography**: `--d-text-{xs..6xl}`, `--d-weight-{regular,medium,semibold,bold}`, `--d-tracking-{tight,normal,wide,wider}`, `--d-leading-{tight,snug,normal,relaxed}`, `--d-font-{display,body,mono}`
- **Elevation**: `--d-elevation-{1..5}` mode-aware (themes override via `theme.elevation` with optional `{light, dark}` mode-split values)

## MCP Server Tools

The MCP server (`@decantr/mcp-server`) exposes the submitted Decantr 3 **8-tool** action surface (authoritative list at `packages/mcp-server/src/tools.ts`):

- `decantr_project`
- `decantr_contract`
- `decantr_context`
- `decantr_graph`
- `decantr_registry` (compatibility content-corpus tool name)
- `decantr_verify`
- `decantr_repair`
- `decantr_contract_write`

Do not add a ninth content tool in Decantr 3.x. Route new content-corpus actions through `decantr_registry` for directory compatibility.

`decantr_context` task responses are compact by default. Preserve route identity, implementation read targets, authority, graph readiness/ranking summaries, health, stop conditions, and verify command while bounding large context and omitting full nodes/edges. `detail: "full"` is the explicit diagnostic opt-in. Task context must block when graph artifacts are missing or stale.

The compact CLI and MCP task adapters are projections of `TaskCapsuleV1`. Preserve existing top-level compatibility fields and the `taskCapsuleVersion` / `task_capsule_version` markers; do not add a second nested copy of the capsule.

## CLI Commands

Authoritative dispatch: `packages/cli/src/index.ts` switch statement. Groups:

**Project lifecycle:** `new`, `init`, `status`, `upgrade`
**Governance workflows:** `setup`, `scan`, `adopt`, `doctor`, `task`, `verify`, `ci`, `resolve`, `codify`, `connect`, `studio`
**Content sync:** `sync`, `refresh`
**Content queries:** `search`, `suggest`, `get`, `list`, `showcase`
**Validation / drift:** `validate`, `check`, `heal`, `migrate`, `audit`
**Essence mutations:** `add {section|page|feature}`, `remove {section|page|feature}`, `analyze`, `magic`
**Content authoring:** `content check`, `content create {pattern|theme|blueprint|archetype|shell}`, `content summary`, `content compile-packs`, `content get-pack`
**Themes:** `theme {create|list|validate|delete|import|switch}`
**Export:** `export {shadcn|tailwind}`
**Registry compatibility:** `registry {mirror|summary|compile-packs|get-pack}`; old critique/audit aliases fall back to local `decantr audit`
**Legacy auth helpers:** `login`, `logout`
**Help:** `help`

Run `decantr help` for current flags and sub-flags. The `check` and `heal` commands share a case (heal is check with auto-fix).

## Workflow, Adoption, And Adapters

Every scaffold/init path should resolve an explicit policy before content, adapter, or file-generation work:

| Axis | Values | Default / rule |
|------|--------|----------------|
| `workflowMode` | `greenfield-scaffold`, `greenfield-contract-only`, `brownfield-attach`, `hybrid-compose` | Blank greenfield tooling-only flows must stay greenfield, not brownfield. `--existing` aliases brownfield attach. |
| `adoptionMode` | `contract-only`, `style-bridge`, `decantr-css` | Defaults to `contract-only`; Decantr CSS requires explicit `--adoption=decantr-css`. |
| `contentSource` | `none`, `official`, `custom`, `cache` | Official corpus content is optional for brownfield and contract-only flows. |
| `assistantBridge` | `none`, `preview`, `apply` | Preview writes `.decantr/context/assistant-bridge.md`; apply is explicit, workflow-specific, and upgrades marked blocks in place. |
| `projectScope` | `single-app`, `workspace-app` | Monorepos store both workspace root and app root; non-interactive root runs require `--project` when ambiguous. |

Adapter capabilities are `bootstrap`, `attach`, `styling`, and `verify`.

- `react-vite`: runnable bootstrap plus attach/styling/verify hints.
- `next-app`: runnable App Router bootstrap plus App/Pages Router attach metadata.
- `generic-web`: contract-only fallback for unsupported targets.

Assistant rule-file bridge behavior is deliberately conservative:

- No workflow mutates CLAUDE/Cursor/agent rule files unless `--assistant-bridge=apply` or `decantr rules apply` is explicit.
- Preview mode writes the suggested bridge into `.decantr/context/assistant-bridge.md`.
- Contract-only Greenfield bridges cite Essence, narrative context, and the Contract capsule; corpus-backed Greenfield/Hybrid bridges cite execution packs; Brownfield bridges cite observed analysis/doctrine artifacts and available narrative context. Cursor gets a dedicated `.cursor/rules/decantr.mdc`; other supported rule files receive updatable marked blocks.

Adoption safety invariants:

- Shared discovery lives in `@decantr/verifier`. Formal TanStack source files outrank generated trees; React Router object routes resolve nested paths and lazy implementation files; Vue Router object routes are formal evidence; pathname-only routes are medium confidence; app scans inherit workspace-level assistant rules.
- Greenfield `init` writes the first typed graph. Explicit `--workflow=greenfield` controls defaults even inside an existing technology scaffold and must not inherit Brownfield personality, shell, commands, or authority from incidental host files.
- Graph construction uses shared route discovery for route/page implementation provenance even when `.decantr/analysis.json` is absent.
- `decantr task` and MCP task activation require a current graph and lead read targets with the discovered implementation source. A blocked CLI task emits structured remediation but exits nonzero.
- `scan`, `adopt`, `doctor`, MCP project state, CI v3, and Studio must consume verifier-owned adoption truth for the selected app. Observation does not imply governance, and a planned write is not a completed mutation.
- `decantr ci` and generated CI stay on v2 unless `--report-version v3` is explicit. CI v3 carries `AdoptionTruthV1` and `GovernanceDeltaV1`; missing, stale, or incompatible proof remains `not_proven` and non-passing unless `--fail-on none` is explicit.
- Studio is a read-only renderer. It may read current state or project-mode health/CI v2/CI v3/contract artifacts and recompute in memory, but it must not write project files, run repair/build/package-manager/Git commands, invoke an agent, or upload source.
- `decantr codify --accept --confirm-reviewed` accepts local patterns/rules only. A style bridge requires the additional `--accept-style-bridge` flag because it changes adoption mode.
- Brownfield project CI with a saved baseline reports inherited findings but gates only new findings through `baselineGate`. Generated baseline diff output must not feed graph source hashing.
- When Prettier or Oxfmt is present, adoption/scaffolding records generated Decantr artifacts in `.prettierignore`, including app-prefixed entries for workspace-root formatters.

## Documentation

| Path | Purpose |
|------|---------|
| `docs/css-scaffolding-guide.md` | Full CSS implementation spec (@layer, theme scoping, variable naming). Generated `DECANTR.md` includes a condensed version. |
| `docs/programs/` | Active 3.9 adoption-proof program plus historical strategic programs |
| `docs/runbooks/` | Operational runbooks (releases, deploys, adoption proof, certification, and 3.8/3.9 maintenance) |
| `docs/specs/` | Design specifications for major features |
| `docs/architecture/` | Architecture diagrams and flow documentation |
| `docs/audit/` | Audit reports (including `decantr-meta-alignment.md` for successor-project context) |
| `docs/reference/` | API and support reference (`package-support-matrix.md`, `workflow-model.md`, `registry-public-api.md`) |
| `docs/schemas/` | Canonical JSON schemas for every resource type (active Essence v4, archived Essence migration references, patterns, archetypes, blueprints, all execution-pack variants, intelligence & audit reports) |
| `docs/llms.txt` | LLM-readable documentation index |

## Development Notes

- Do not commit `decantr.essence.json` or `DECANTR.md` files in package directories (these are test artifacts)
- The `.gitignore` excludes `packages/*/decantr.essence.json` and `packages/*/.decantr/`
- Detection of existing AI rule files (for `decantr init`) is controlled at `packages/cli/src/detect.ts`
- Release/audit automation lives in `scripts/*.mjs` (30+ scripts covering showcases, package surface, npm, blueprint governance, etc.)
- Root `config/` carries machine-readable package retirement and surface manifests (`package-retirements.json`, `package-surface.json`)
- `pnpm audit:packed-content-facade` proves clean tarball installation and legacy content/registry facade identity. `pnpm audit:3-9-qualification:lint` checks packet structure only; only the default `pnpm audit:3-9-qualification` command can grant human qualification. Stable 3.9 publication is separately authorized by `pnpm audit:3-9-release-gate`, which may accept only the exact version-bound sole-maintainer waiver and never grants quantitative claims.
