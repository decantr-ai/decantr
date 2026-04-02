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
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BLUEPRINT SELECTION                               │
│                                                                     │
│  Two-phase interactive flow:                                        │
│                                                                     │
│  Phase A: runSimplifiedInit()                                       │
│  ┌────────────────────────────┐                                     │
│  │  "What blueprint?"         │                                     │
│  │  1. Default (recommended)  │──→ Phase B: runInteractivePrompts() │
│  │  2. Search registry...     │──→ Select from results, use defaults│
│  └────────────────────────────┘                                     │
│                                                                     │
│  Phase B (only if "Default" selected):                              │
│    Theme, mode, shape, target, guard, density, shell prompts        │
│                                                                     │
│  --yes / --blueprint <id>:  Skip prompts, use defaults/flags        │
│  --offline (no --blueprint): scaffoldMinimal() → exit early          │
│  --offline + --blueprint:    Normal flow using cache                 │
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
│     composeArchetypes() + resolvePatternAlias() + buildEssenceV3()  │
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
│  │              decantr.essence.json (v3)                   │       │
│  │                                                         │       │
│  │  ┌─────────────────────────────────────────────────┐    │       │
│  │  │  DNA (Guarded — design axioms)                  │    │       │
│  │  │                                                 │    │       │
│  │  │  theme ◄──────── Blueprint.theme                │    │       │
│  │  │    style, mode, recipe, shape                   │    │       │
│  │  │                                                 │    │       │
│  │  │  typography ◄──── Theme.typography_hints         │    │       │
│  │  │    scale, heading_weight, body_weight           │    │       │
│  │  │                                                 │    │       │
│  │  │  spacing ◄─────── Options.density               │    │       │
│  │  │    base_unit, scale, density, content_gap       │    │       │
│  │  │                                                 │    │       │
│  │  │  radius ◄──────── Recipe.radius_hints           │    │       │
│  │  │    philosophy, base    (Recipe > Theme > Default)│    │       │
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
│  │  │  pages[] ◄──────── Composed from ALL archetypes │    │       │
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
│  decantr.essence.json ◄── v3 essence (DNA + Blueprint + Meta)       │
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
│  .decantr/project.json ◄── Detection results + init metadata        │
│  .decantr/context/*.md ◄── 3 task files + 1 essence summary         │
│  .gitignore            ◄── Adds .decantr/cache/ if not present      │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    POST-SCAFFOLD                                    │
│                                                                     │
│  1. Validate essence against v3 schema                              │
│  2. Display file creation summary                                   │
│  3. Generate curated prompt (copy to AI assistant)                  │
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
│  │  Rule 1: Style    — code theme matches dna.theme.style      │    │
│  │  Rule 2: Recipe   — decorations match dna.theme.recipe      │    │
│  │  Rule 3: Density  — spacing matches dna.spacing.content_gap │    │
│  │  Rule 4: A11y     — meets dna.accessibility.wcag_level      │    │
│  │  Rule 5: Mode     — theme/mode combo is compatible          │    │
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
│  │  Rule 8: Patterns    — referenced patterns exist in registry│    │
│  │                                                             │    │
│  │  Severity: controlled by meta.guard.blueprint_enforcement   │    │
│  │    'warn'  → violations are warnings (default)              │    │
│  │    'off'   → violations suppressed entirely                 │    │
│  │                                                             │    │
│  │  autoFixable: true (can be resolved via decantr_accept_drift)│   │
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
│                CONTENT REGISTRY PIPELINE                            │
│                                                                     │
│  decantr-content repo (JSON files)                                  │
│       │                                                             │
│       │  push to main                                               │
│       ▼                                                             │
│  GitHub Actions: validate.js → sync-to-registry.js                  │
│       │                                                             │
│       │  POST /v1/admin/sync (X-Admin-Key)                          │
│       ▼                                                             │
│  Supabase DB (namespace=@official, status=published)                │
│       │                                                             │
│       ├──→ API serves: GET /v1/{type}/@official/{slug}              │
│       │       │                                                     │
│       │       ├──→ CLI fetches (Custom → API → Cache)               │
│       │       └──→ MCP server fetches (RegistryAPIClient)           │
│       │                                                             │
│       └──→ Community publishes: POST /v1/content                    │
│               │                                                     │
│               └──→ Moderation queue (untrusted users)               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
