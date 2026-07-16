# Decantr Scaffolding Flow

## Complete Init Flow (Top-Down)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        decantr init                                 │
│                     (CLI Entry Point)                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PROJECT DETECTION                                │
│  Scans working directory for:                                       │
│  • Framework (react, vue, svelte, next, etc.)                       │
│  • Package manager (npm, pnpm, yarn)                                │
│  • TypeScript presence                                              │
│  • Tailwind presence                                                │
│  • Existing decantr.essence.json                                    │
│  • Existing AI rule files (CLAUDE.md, .cursorrules, AGENTS.md, etc.)│
│  • Ambient doctrine docs (.claude/, docs/, CI, schema, design system)│
│  • Workspace/app roots (pnpm workspaces, turbo, nx, apps/*)         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│              WORKFLOW POLICY RESOLUTION                             │
│                                                                     │
│  Resolve once, before content reads, adapter work, or file writes:  │
│                                                                     │
│  workflowMode:                                                      │
│    greenfield-scaffold | greenfield-contract-only                   │
│    brownfield-attach  | hybrid-compose                              │
│                                                                     │
│  adoptionMode: contract-only | style-bridge | decantr-css           │
│  contentSource: none | official | custom | cache                    │
│  assistantBridge: none | preview | apply                            │
│  projectScope: single-app | workspace-app                           │
│                                                                     │
│  --existing is a compatibility alias for brownfield-attach.         │
│  --accept-proposal / --merge-proposal / --replace-essence control   │
│  deterministic brownfield proposal acceptance.                      │
│  --project=<path> pins appRoot when a workspace has multiple apps.  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   WORKFLOW ROUTING                                  │
│                                                                     │
│  greenfield-scaffold      → contract scaffold + optional content    │
│  greenfield-contract-only → local contract/context files only       │
│  brownfield-attach        → inventory → proposal → acceptance        │
│  hybrid-compose           → mutate existing essence/context         │
│                                                                     │
│  Offline contract-only exits without content API access.            │
│  Offline corpus flows require bundled/cache/custom/content dir.     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BLUEPRINT / CONTENT SELECTION                     │
│                                                                     │
│  Two-phase interactive flow:                                        │
│                                                                     │
│  Phase A: runSimplifiedInit()                                       │
│  ┌────────────────────────────┐                                     │
│  │  "What blueprint?"         │                                     │
│  │  1. Default (recommended)  │──→ Phase B: runInteractivePrompts() │
│  │  2. Search official content│──→ Select from results, use defaults│
│  └────────────────────────────┘                                     │
│                                                                     │
│  Phase B (only if "Default" selected):                              │
│    Theme, mode, shape, target, guard, density, shell prompts        │
│                                                                     │
│  --yes / --blueprint <id>:  Skip prompts, use defaults/flags        │
│  --offline (contract-only): scaffoldMinimal() → exit early           │
│  --offline + --blueprint:    Normal flow using local content only    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  CONTENT RESOLUTION                                 │
│                                                                     │
│  Single items: Custom → API → Cache                                 │
│  Lists:        API → Cache → merge Custom on top                    │
│  cmdGet:       API → Cache → Bundled (packages/cli/src/bundled/)    │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  1. BLUEPRINT │    │  2. THEMES   │    │  3. RECIPE   │          │
│  │              │    │              │    │              │          │
│  │  compose[]   │    │  seed        │    │  treatment_  │          │
│  │  theme{}     │    │  palette     │    │    overrides │          │
│  │  personality │    │  tokens      │    │  decorators  │          │
│  │  features    │    │  typography_ │    │  spatial_    │          │
│  │  overrides   │    │    hints     │    │    hints     │          │
│  └──────┬───────┘    │  motion_     │    │  radius_     │          │
│         │            │    hints     │    │    hints     │          │
│         │            │  cvd_support │    │  animation   │          │
│         │            └──────┬───────┘    │  shell prefs │          │
│         │                   │            │  visual_     │          │
│         │                   │            │    effects   │          │
│         │                   │            └──────┬───────┘          │
│         ▼                   │                   │                  │
│  ┌──────────────────┐       │                   │                  │
│  │  4. ARCHETYPES   │       │                   │                  │
│  │  (ALL compose[]) │       │                   │                  │
│  │                  │       │                   │                  │
│  │  compose[0]:     │       │                   │                  │
│  │   Primary        │       │                   │                  │
│  │   No prefix      │       │                   │                  │
│  │   Sets shell     │       │                   │                  │
│  │                  │       │                   │                  │
│  │  compose[1+]:    │       │                   │                  │
│  │   Prefixed pages │       │                   │                  │
│  │   shell_override │       │                   │                  │
│  │                  │       │                   │                  │
│  │  Each provides:  │       │                   │                  │
│  │   pages[]        │       │                   │                  │
│  │   features[]     │       │                   │                  │
│  │   shells{}       │       │                   │                  │
│  └──────┬───────────┘       │                   │                  │
│         │                   │                   │                  │
└─────────┼───────────────────┼───────────────────┼──────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 BROWNFIELD PROPOSAL PATH                            │
│                                                                     │
│  decantr analyze writes:                                            │
│    .decantr/analysis.json                                           │
│    .decantr/init-seed.json                                          │
│    .decantr/ambient-context.json                                    │
│    .decantr/doctrine-map.json                                       │
│    .decantr/observed-essence.proposal.json                          │
│    .decantr/brownfield-report.md                                    │
│                                                                     │
│  doctrine-map ranks security/data, architecture, design-system,      │
│  workflow/CI, feature/business, assistant-specific, and stale        │
│  sources before the proposal is accepted.                           │
│  Observed routes are grouped into semantic product domains such as   │
│  auth, RBAC, billing, reporting, facilities, settings, and public.   │
│  Shared discovery prefers formal source routes over generated trees, │
│  resolves nested/lazy React Router and Vue Router object routes, and │
│  labels pathname-only fallbacks as medium confidence.                │
│                                                                     │
│  decantr init --existing --accept-proposal writes the proposal       │
│  only when no essence exists. Existing essences require              │
│  --merge-proposal or the explicit destructive --replace-essence.     │
│                                                                     │
│  Brownfield contract-only uses existing-app authority: no Decantr    │
│  theme default, no CSS runtime, no rule-file mutation, no official   │
│  content unless explicitly requested.                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│     composeArchetypes() + resolvePatternAlias() + buildEssenceV4()  │
│                                                                     │
│  INPUTS:                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │ Archetypes  │  │ Theme Hints │  │Recipe Hints │                │
│  │ (composed)  │  │             │  │             │                │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │
│         │                │                │                        │
│         ▼                ▼                ▼                        │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                                                         │       │
│  │              decantr.essence.json (v4)                   │       │
│  │                                                         │       │
│  │  ┌─────────────────────────────────────────────────┐    │       │
│  │  │  DNA (Guarded — design axioms)                  │    │       │
│  │  │                                                 │    │       │
│  │  │  theme ◄──────── Blueprint.theme                │    │       │
│  │  │    id, mode, shape                              │    │       │
│  │  │                                                 │    │       │
│  │  │  typography ◄──── Theme.typography_hints         │    │       │
│  │  │    scale, heading_weight, body_weight           │    │       │
│  │  │                                                 │    │       │
│  │  │  spacing ◄─────── Options.density               │    │       │
│  │  │    base_unit, scale, density, content_gap       │    │       │
│  │  │                                                 │    │       │
│  │  │  radius ◄──────── Theme.radius_hints             │    │       │
│  │  │    philosophy, base                             │    │       │
│  │  │                                                 │    │       │
│  │  │  motion ◄──────── Theme.motion_hints            │    │       │
│  │  │    preference, duration_scale, reduce_motion    │    │       │
│  │  │                                                 │    │       │
│  │  │  color ◄───────── Options/Defaults              │    │       │
│  │  │  elevation ◄───── Defaults                      │    │       │
│  │  │  accessibility ◄─ Options (wcag_level: AA)      │    │       │
│  │  │  personality ◄─── Blueprint/Options             │    │       │
│  │  └─────────────────────────────────────────────────┘    │       │
│  │                                                         │       │
│  │  ┌─────────────────────────────────────────────────┐    │       │
│  │  │  BLUEPRINT (Tracked — evolves with the app)     │    │       │
│  │  │                                                 │    │       │
│  │  │  shell ◄───────── Primary archetype[0].shell    │    │       │
│  │  │                                                 │    │       │
│  │  │  sections[] ◄───── Composed from archetype topology │ │       │
│  │  │    ┌─────────────────────────────────────────┐  │    │       │
│  │  │    │ Primary pages (no prefix):              │  │    │       │
│  │  │    │   home      → [hero, features, cta]     │  │    │       │
│  │  │    │   pricing   → [pricing-table]           │  │    │       │
│  │  │    │                                         │  │    │       │
│  │  │    │ chat-* pages (prefixed):                │  │    │       │
│  │  │    │   chat-main → [chat-header, thread]     │  │    │       │
│  │  │    │   chat-settings → [form-sections]       │  │    │       │
│  │  │    │     shell_override: sidebar-main        │  │    │       │
│  │  │    └─────────────────────────────────────────┘  │    │       │
│  │  │                                                 │    │       │
│  │  │  features[] ◄──── Merged + deduplicated         │    │       │
│  │  └─────────────────────────────────────────────────┘    │       │
│  │                                                         │       │
│  │  ┌─────────────────────────────────────────────────┐    │       │
│  │  │  META                                           │    │       │
│  │  │  archetype, target, platform, guard             │    │       │
│  │  │                                                 │    │       │
│  │  │  guard.dna_enforcement: error|warn|off          │    │       │
│  │  │  guard.blueprint_enforcement: warn|off          │    │       │
│  │  └─────────────────────────────────────────────────┘    │       │
│  │                                                         │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FILE GENERATION                                  │
│                                                                     │
│  decantr.essence.json ◄── Essence v4 (DNA + Blueprint + Meta)       │
│                                                                     │
│  DECANTR.md ◄──────────── Template + theme/pages/guard data         │
│                            (AI assistant instructions)              │
│                                                                     │
│  src/styles/tokens.css ◄── Theme seed + palette → CSS variables     │
│    :root        { --d-primary, --d-bg, --d-text, ... }              │
│    @media (prefers-color-scheme: light) { ... }          (if auto)   │
│                                                                     │
│  src/styles/treatments.css ◄── Visual treatments → CSS rules         │
│    .d-interactive { hover, focus, active states; ... }              │
│    .d-surface     { container surfaces, elevation; ... }            │
│    .d-data        { table, list, grid styling; ... }                │
│    .d-control     { form input focus, error states; ... }           │
│    .d-section     { section rhythm and spacing; ... }               │
│    .d-annotation  { badge, tag, status indicators; ... }            │
│                                                                     │
│  src/styles/decorators.css ◄── Recipe decorators → CSS rules        │
│    .d-glass  { backdrop-filter: blur(8px); ... }                    │
│    .d-card   { border: 1px solid var(--d-border); ... }             │
│                                                                     │
│  CSS files are adoption-mode gated:                                 │
│    contract-only → no Decantr CSS files or @decantr/css guidance    │
│    style-bridge  → bridge tokens/files, no @decantr/css requirement │
│    decantr-css   → full tokens/treatments/decorators guidance       │
│                                                                     │
│  .decantr/project.json ◄── Detection results + init metadata        │
│  .decantr/context/*.md ◄── compiled packs + task and section context │
│  .gitignore            ◄── Adds .decantr/cache/ if not present      │
│  .prettierignore       ◄── Generated artifact boundary for formatters│
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    POST-SCAFFOLD                                    │
│                                                                     │
│  1. Validate essence against the v4 schema                          │
│  2. Display file creation summary                                   │
│  3. Build initial typed graph with shared route/source discovery     │
│  4. Generate curated prompt (copy to AI assistant)                  │
│  5. Optionally preview/apply workflow-specific assistant bridge     │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                     RUNTIME FLOW (after init)
═══════════════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│                    GUARD EVALUATION                                 │
│          (MCP tools, CLI validate, Vite plugin)                     │
│                                                                     │
│  evaluateGuard(essence, context) → GuardViolation[]                 │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  DNA Rules (enforce design axioms)                          │    │
│  │                                                             │    │
│  │  Rule 1: Style    — code theme matches dna.theme.id           │    │
│  │  Rule 2: Density  — spacing matches dna.spacing.content_gap │    │
│  │  Rule 3: A11y     — meets dna.accessibility.wcag_level      │    │
│  │  Rule 4: Mode     — theme/mode combo is compatible          │    │
│  │                                                             │    │
│  │  Severity: controlled by meta.guard.dna_enforcement         │    │
│  │    'error' → violations are errors                          │    │
│  │    'warn'  → violations downgraded to warnings              │    │
│  │    'off'   → violations suppressed entirely                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Blueprint Rules (track structural evolution)               │    │
│  │                                                             │    │
│  │  Rule 6: Page exists — code pages in blueprint.pages        │    │
│  │  Rule 7: Layout      — pattern order matches (strict only)  │    │
│  │  Rule 8: Patterns    — refs exist in corpus/local content    │    │
│  │                                                             │    │
│  │  Severity: controlled by meta.guard.blueprint_enforcement   │    │
│  │    'warn'  → violations are warnings (default)              │    │
│  │    'off'   → violations suppressed entirely                 │    │
│  │                                                             │    │
│  │  autoFixable: true (explicit decantr_contract_write action)  │   │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Guard Modes: creative (skip all) | guided (1,2,4,5,6,8) |         │
│               strict (all rules including 3 + 7)                   │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                  DATA SOURCE CASCADE                                │
│           (Priority order for DNA field derivation)                 │
│                                                                     │
│  ┌───────────────────────────────────────────────────────┐          │
│  │                                                       │          │
│  │   DNA Field        Source Priority                    │          │
│  │   ─────────        ───────────────                    │          │
│  │                                                       │          │
│  │   theme.*          Blueprint.theme                    │          │
│  │                                                       │          │
│  │   typography.*     Theme.typography_hints > Defaults   │          │
│  │                                                       │          │
│  │   spacing.*        Options.density > Defaults          │          │
│  │                                                       │          │
│  │   radius.*         Recipe.radius_hints > Theme.shape   │          │
│  │                    > Defaults                         │          │
│  │                                                       │          │
│  │   motion.*         Recipe.animation > Theme.motion_    │          │
│  │                    hints > Defaults                   │          │
│  │                                                       │          │
│  │   color.*          Defaults (semantic, 1 accent)       │          │
│  │                                                       │          │
│  │   elevation.*      Defaults (layered, 3 levels)        │          │
│  │                                                       │          │
│  │   accessibility.*  User choice > AA default            │          │
│  │                                                       │          │
│  │   personality      Blueprint > Options > [professional]│          │
│  │                                                       │          │
│  └───────────────────────────────────────────────────────┘          │
│                                                                     │
│  After init, the essence file IS the source of truth.               │
│  The cascade only matters at scaffold time.                         │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                OFFICIAL CONTENT CORPUS PIPELINE                     │
│                                                                     │
│  packages/content (JSON files + schemas + helpers)                  │
│       │                                                             │
│       │  pull request                                               │
│       ▼                                                             │
│  GitHub Actions: validate → content health → package audit          │
│       │                                                             │
│       │  monorepo release                                           │
│       ▼                                                             │
│  @decantr/content npm package                                       │
│       │                                                             │
│       ├──→ API serves content/reference routes from package data    │
│       │       │                                                     │
│       │       ├──→ CLI fetches content packs/search/schemas         │
│       │       └──→ MCP decantr_registry compatibility tool reads    │
│       │                                                             │
│       └──→ Projects may codify private vocabulary as local law      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
