# Decantr Workflow Model

Decantr resolves an explicit workflow and adoption policy before registry, adapter, or scaffold work begins. The contract layer stays framework-agnostic; adapters translate that contract into project conventions.

## Workflow And Adoption Matrix

| Mode | Use when | Primary command | Default adoption | Registry role |
| --- | --- | --- | --- | --- |
| `greenfield-scaffold` | New app from a blueprint/archetype | `decantr new my-app --blueprint=<id>` | `decantr-css` | primary or cached |
| `greenfield-contract-only` | New repo wants Decantr governance without blueprint/runtime takeover | `decantr init --workflow=greenfield --adoption=contract-only` | `contract-only` | none |
| `brownfield-attach` | Existing app wants Decantr context and checks | `decantr adopt --base-url <url> --evidence --yes` | `contract-only` | optional |
| `hybrid-compose` | Attached app selectively adds/removes features, sections, themes, or packs | `decantr add/remove`, `decantr theme switch`, `decantr registry` | existing project setting | opt-in |

Adoption modes:

- `contract-only`: write Decantr essence/context/governance files; do not add Decantr CSS or require `@decantr/css`.
- `style-bridge`: write lightweight bridge tokens/files that map Decantr intent into the existing style system.
- `decantr-css`: generate the full Decantr CSS runtime guidance and style files.

## Adapters

Adapters expose five capabilities:

- `bootstrap`: write a runnable greenfield starter.
- `realize`: apply a certified first-mile realization plan from Essence v4 without turning Decantr core into a framework code generator.
- `attach`: describe route/layout/component conventions for an existing app.
- `styling`: map adoption mode into dependencies, style files, and prompts.
- `verify`: provide dev/build commands, dist directory, and runtime expectations.

Current adapter availability:

- `react-vite`: runnable bootstrap, certified realization, attach, styling, verify.
- `next-app`: runnable Next.js App Router bootstrap, certified realization, App/Pages Router attach hints, verify.
- `vanilla-vite`: runnable plain HTML/CSS/JavaScript bootstrap, certified realization, attach, styling, verify.
- `vue-vite`: runnable Vue 3 + Vite bootstrap, certified realization, Vue Router attach hints, styling, verify.
- `sveltekit`: runnable SvelteKit bootstrap, certified realization, file-route attach hints, styling, verify.
- `angular`: runnable Angular standalone bootstrap, certified realization, Angular Router attach hints, styling, verify.
- `solid-vite`: runnable Solid + Vite bootstrap, certified realization, attach, styling, verify.
- `generic-web`: contract-only fallback for unsupported targets; no framework code realization.

Unsupported targets should feel intentional, not broken: Decantr writes the contract and tells the user that the runtime remains theirs.

## Brownfield Adoption

Brownfield starts with:

```bash
decantr adopt --base-url http://localhost:3000 --evidence --yes
```

`adopt` is the user-facing workflow. It explains and runs the primitive chain: analyze the app, accept or merge the observed proposal, run Project Health, write optional local browser evidence, save a baseline, and optionally install CI.

`analyze` writes `.decantr/analysis.json`, `.decantr/init-seed.json`, `.decantr/ambient-context.json`, `.decantr/doctrine-map.json`, `.decantr/observed-essence.proposal.json`, `.decantr/brownfield-report.md`, `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`. The proposal is observed from routes, styling, dependencies, layout signals, features, semantic route domains, ranked doctrine sources, and ambient project context. Route observation covers Next App/Pages Router, React Router, Angular Router, SvelteKit, Vue Router, and Nuxt file routes. Styling observation preserves existing systems such as Tailwind, Bootstrap, MUI, Chakra, plain CSS, and Decantr CSS. Theme inventory observes light, dark, and variant selectors without changing Essence V4. It is not a Decantr scaffold.

Proposal acceptance is deterministic:

```bash
decantr init --existing --accept-proposal # only when no essence exists
decantr init --existing --merge-proposal  # preserve existing essence and add observed coverage
decantr init --existing --replace-essence # explicit destructive replacement with backup
```

Brownfield defaults to existing-app authority: `theme.id` is `existing`, registry content is optional, Decantr CSS is not written in `contract-only`, and existing rule/docs remain cited evidence. The doctrine map ranks security/data, architecture, design-system, workflow/CI, feature/business, assistant-specific, and stale evidence, then emits resolution suggestions for conflicts and stale sources. Check scoring focuses on actionable evidence; current database migrations remain security/data doctrine instead of stale-doc noise. Direct brownfield init without analysis is still a compatibility path, but the recommended path is inventory → semantic sections → doctrine map → proposal → deterministic acceptance.

Task-time activation is explicit. MCP clients should call `decantr_prepare_task_context` before route edits; it resolves the route, section/page packs, directives, patterns, shared components, visual target, baseline evidence, theme inventory, and local screenshot references. CLI-only workflows use the existing pack path: `decantr registry get-pack page --route <route>` or generated `.decantr/context/page-*-pack.md` files.

For CLI-only assistants, prefer:

```bash
decantr task /feed "add saved recipe actions"
decantr verify --brownfield
```

Project-owned Brownfield UI law is explicit:

```bash
decantr codify
# review .decantr/local-patterns.proposal.json
decantr codify --accept
decantr verify --local-patterns
```

This local pattern layer captures what the app standardizes on, such as button variants, card surfaces, shell spacing, and form controls. It complements, but does not replace, mechanical rules in ESLint, Biome, Storybook, visual regression, or project tests.

## Project Health

Project Health is the local reliability layer across all workflow modes:

- Greenfield projects use `decantr verify` after `refresh` to confirm essence, context packs, routes, and runtime evidence agree.
- Brownfield projects automatically include route coverage and drift checks when `.decantr/project.json` declares `brownfield-attach`.
- Hybrid projects use `decantr verify` after `add`, `remove`, `theme switch`, or registry pack changes to catch contract and pack drift before implementation continues.

Use `decantr verify init-ci` to install the default GitHub Actions gate, `decantr verify --ci --fail-on error` as the default CI command, `decantr verify --evidence` for the privacy-redacted Evidence Bundle, `decantr verify --base-url <url> --evidence` for local screenshots plus `.decantr/evidence/visual-manifest.json`, `decantr verify --save-baseline` / `--since-baseline` for continuity, and `decantr health --prompt <finding-id>` to hand a focused remediation task to an AI assistant. Monorepos can install the gate from the repository root with `decantr verify init-ci --project <app-path>` so dependency install remains root-scoped while health runs inside the app contract, or `decantr verify init-ci --workspace` for an aggregate workspace gate. `decantr studio` serves the same report from localhost for visual triage without sending customer project data to Decantr, and `decantr studio --workspace` serves an aggregate health matrix for repos with many Decantr projects. See [Project Health](project-health.md) for the full reference.

## Assistant Rule Bridge

Existing rule files are detected during project analysis and init. Bridge behavior is preview-first:

- `--assistant-bridge=preview` writes `.decantr/context/assistant-bridge.md`.
- `decantr rules preview` prints the bridge without mutating files.
- `decantr rules apply` injects idempotent marked blocks into supported rule files.
- Cursor uses `.cursor/rules/decantr.mdc`.
- Brownfield init never mutates rule files unless `--assistant-bridge=apply` is explicit.

## Monorepo And Offline

Workspace roots are detected from `pnpm-workspace.yaml`, package workspaces, `turbo.json`, `nx.json`, and common `apps/*` layouts. Non-interactive workspace-root init requires `--project=<path>` when multiple app candidates exist. Project Health CI uses the same explicit project-path posture through `decantr verify init-ci --project <path>`.

For monorepos with many Decantr projects, use `.decantr/workspace.json` when you want explicit project ownership/tags/concurrency, or let Decantr discover `decantr.essence.json` files automatically:

```bash
decantr workspace list
decantr verify --workspace
decantr verify --workspace --changed --since origin/main
```

Workspace health isolates per-project failures, keeps output deterministic, and emits aggregate JSON suitable for CI artifacts.

Offline behavior:

- `--offline --adoption=contract-only` works without registry content.
- Registry-backed blueprint, archetype, or theme flows require local cache/custom content or `DECANTR_CONTENT_DIR`.
- `decantr sync` is the hosted-registry cache hardening path: it paginates official list endpoints and stores full slug-keyed item records under `.decantr/cache/@official/`, so offline guards and generated context use canonical content rather than public list summaries.
- Supported offline flows must not call the hosted API.

## Harness And Certification

Use:

```bash
pnpm --filter @decantr/cli certify:workflows
pnpm --filter @decantr/cli certify:blueprints
```

The workflow matrix covers greenfield blueprint, greenfield contract-only, brownfield analyze/proposal/acceptance, direct brownfield compatibility init, adoption modes, offline flows, unsupported target fallback, monorepo `--project`, Next.js adapter, and hybrid composition.
