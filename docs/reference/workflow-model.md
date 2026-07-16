# Decantr Workflow Model

Decantr resolves an explicit workflow and adoption policy before content, adapter, or scaffold work begins. The contract layer stays framework-agnostic; adapters translate that contract into project conventions. Decantr 3.9 calls the end-to-end result **Governed Change Proof**: one canonical adoption truth, one bounded task capsule, and one fail-closed governance delta around existing Project Health evidence.

## Workflow And Adoption Matrix

| Mode | Use when | Primary command | Default adoption | Official content role |
| --- | --- | --- | --- | --- |
| `greenfield-scaffold` | New app from a blueprint/archetype | `decantr new my-app --blueprint=<id>` | `contract-only` | primary or cached |
| `greenfield-contract-only` | New repo wants Decantr governance without blueprint/runtime takeover | `decantr init --workflow=greenfield --adoption=contract-only` | `contract-only` | none |
| `brownfield-attach` | Existing app wants Decantr context and checks | `decantr adopt --yes` | `contract-only` | optional |
| `hybrid-compose` | Attached app intentionally adopts selected Decantr or project-owned UI law | `decantr codify`, `decantr task`, `decantr add/remove`, `decantr theme switch` | existing project setting | opt-in guidance |

Adoption modes:

- `contract-only`: write Decantr essence/context/governance files; do not add the legacy Decantr CSS adapter or require `@decantr/css`.
- `style-bridge`: keep runtime styling host-owned and map Decantr intent only through a reviewed, accepted `.decantr/style-bridge.json`; Decantr does not generate or overwrite runtime CSS, token stylesheets, or global styles.
- `decantr-css`: explicitly activate the legacy optional Decantr CSS adapter/runtime guidance and style files.

An explicit Greenfield lane wins over incidental host files. Running `decantr init --workflow=greenfield --adoption=contract-only` inside an existing technology scaffold uses Greenfield defaults, preserves the selected host runtime/styling boundary, writes the first typed graph, and emits Greenfield task/verify guidance. It does not reinterpret the scaffold as Brownfield merely because `package.json` or source files already exist. Contract-only assistant bridges cite Essence, narrative context, and the Contract capsule until compiled execution packs are hydrated.

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
decantr scan
decantr adopt --yes
decantr studio
decantr doctor
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
decantr resolve
```

`scan` is the read-only preview. It detects whether the app is a plausible Brownfield UI target and reports framework, route, styling, static-hosting, Decantr, assistant-rule, and GitHub Pages signals without writing files, building the app, running scripts, installing dependencies, uploading source, or saving a report.

`adopt` is the user-facing workflow. It explains and runs the primitive chain: analyze the app, accept or merge the observed proposal, hydrate content API execution packs when online, run Project Health, save a baseline, and optionally install CI. Both direct `init` and `adopt` store a bounded before/after receipt in `.decantr/project.json`, allowing `AdoptionTruthV1` to distinguish Decantr governance and support writes from authored host source proven untouched. Incomplete snapshot evidence becomes a limitation instead of a source-integrity claim. When the host uses Prettier or Oxfmt, adoption adds generated Decantr artifacts to `.prettierignore` at the app and workspace formatter boundaries. After adoption, use read-only `decantr studio` for local visual triage and `decantr doctor` when the next command is unclear. If the app is running and you want screenshots attached to task context, run `decantr verify --base-url <url> --evidence` after adoption. Use `--no-packs` or offline mode when the first attach must avoid network access.

`analyze` writes `.decantr/analysis.json`, `.decantr/init-seed.json`, `.decantr/ambient-context.json`, `.decantr/doctrine-map.json`, `.decantr/observed-essence.proposal.json`, `.decantr/brownfield-report.md`, `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`. The proposal is observed from routes, styling, dependencies, layout signals, features, semantic route domains, ranked doctrine sources, and ambient project context. Route observation covers Next App/Pages Router, React Router, Angular Router, SvelteKit, Vue Router, Nuxt file routes, package-managed static HTML entrypoints such as `src/index.html` and `dist/index.html`, nested static demo/example pages, custom React Router wrapper components with literal `path` props, simple optional path groups such as `/(public|contacts)?`, declarative TypeScript route specs such as `route("Name", "/path", page(Component))` declarations, and path literals from route constants or pathname branches. Decantr filters framework internals and catch-all fallbacks that are not taskable routes. Styling observation preserves existing systems such as Tailwind, Bootstrap, MUI, Chakra, plain CSS, and Decantr CSS. Theme inventory observes light, dark, and variant selectors without changing Essence V4. It is not a Decantr scaffold.

Proposal acceptance is deterministic:

```bash
decantr init --existing --accept-proposal # only when no essence exists
decantr init --existing --merge-proposal  # preserve existing essence and add observed coverage
decantr init --existing --replace-essence # explicit destructive replacement with backup
```

Brownfield defaults to existing-app authority: `theme.id` is `existing`, official corpus content is optional, legacy Decantr CSS is not written in `contract-only`, and existing rule/docs remain cited evidence. The doctrine map ranks security/data, architecture, design-system, workflow/CI, feature/business, assistant-specific, and stale evidence, then emits resolution suggestions for conflicts and stale sources. Check scoring focuses on actionable evidence; current database migrations remain security/data doctrine instead of stale-doc noise. Direct brownfield init without analysis is still a compatibility path, but the recommended path is inventory → semantic sections → doctrine map → proposal → deterministic acceptance.

Task-time activation is explicit. MCP clients should call `decantr_context` with `{ "action": "task" }` before route edits; CLI-only workflows use `decantr task <route> "<task>"`. Both compatibility surfaces adapt one `TaskCapsuleV1`: selected project/route/task, graph identity/freshness, required rank-one route implementation, active authority, changed-file/route/node impact, stable findings, official-content identity/digest provenance, stop conditions, and one exact verify command. The canonical compact capsule is bounded to 12,000 UTF-8 bytes and 4,000 deterministic estimated tokens; expanded `detail: "full"` diagnostics remain separate. Both paths require a current typed graph and block with regeneration guidance when graph artifacts are missing or stale; the CLI still emits structured JSON when requested but exits nonzero so scripts and agents cannot mistake blocked context for readiness.

Cursor users can install that activation in the opened workspace:

```bash
decantr connect cursor
decantr connect cursor --project apps/web
```

The command writes Cursor MCP config plus a Decantr project rule. It preserves existing MCP servers, keeps monorepo app scope in `project_path` / `--project`, and tells Cursor Agent to stop and report drift when runtime source and Decantr context disagree.

In Decantr 3.9, these commands form the Brownfield control loop:

1. `scan` or `doctor` to understand the app state.
2. `task` to prepare route-scoped maker/checker instructions before editing.
3. Edit source with the authority order visible.
4. `verify` or default `ci` to produce v2 Project Health, Evidence Bundle, and loop readiness; select CI v3 explicitly when change proof is required.
5. `resolve` when source, local law, style bridge, Essence, and official corpus guidance disagree.
6. Repair, regenerate graph/context when requested, and repeat until the loop verdict is `verified`.

Loop states are intentionally explicit: `needs_context`, `ready_to_edit`, `verify_required`, `repair_required`, `human_resolution_required`, `blocked_missing_context`, `blocked_missing_graph`, and `verified`. Decantr guides agents through the loop; it does not invoke agents, edit source, or run autonomous retry cycles.

In monorepos, Decantr ranks app candidates before suggesting `--project`. Product UI apps receive positive signals from app-folder placement, frontend dependencies/configs, source trees, and names such as `web`, `remix`, `dashboard`, `client`, or `portal`. Docs, Storybook, API/server, MCP helper, workbench/demo, and package/library surfaces are penalized or filtered. `decantr workspace list --json` exposes rank, score, category, and reason metadata so users and agents can see why one app path was suggested first.

The selected app remains the source of discovery truth after that. `scan`, `setup`, `workspace list`, `adopt`, `doctor`, `task`, `verify`, `ci`, graph construction, MCP, and Studio use the shared verifier discovery substrate. `AdoptionTruthV1` makes the scope/provenance explicit: package-manager evidence can come from the workspace root, while app facts stay app-scoped and assistant rules may be inherited from the workspace root. Formal TanStack source routes outrank generated route trees; nested React Router object routes resolve lazy implementation files; Vue Router object routes are recognized; and pathname/navigation fallbacks are medium confidence. Graph route and page nodes retain implementation-source provenance even when no Brownfield analysis artifact exists. Existing `decantr scan --project apps/web --json` remains `scan-report.v2`; the human workflow may project adoption truth without changing that wire contract.

For CLI-only assistants, prefer:

```bash
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
```

Project-owned Brownfield UI law is explicit:

```bash
decantr codify --from-audit --style-bridge
# review .decantr/local-patterns.proposal.json and .decantr/rules.proposal.json
# review .decantr/style-bridge.proposal.json when you want token/class mapping
decantr codify --map-pattern hero
# review the advisory content-pattern mapping before accepting it as local law
decantr codify --accept --confirm-reviewed
# add --accept-style-bridge only to explicitly activate the reviewed bridge proposal
decantr verify --brownfield --local-patterns
```

This local law layer captures what the app standardizes on, such as button variants, card surfaces, shell spacing, form controls, theme variants, and optional `behavior_obligations` for project-owned interaction/accessibility behavior. `.decantr/local-patterns.json` is the LLM-facing standard; `.decantr/rules.json` is the narrow mechanical check layer Decantr can scan locally. `codify --from-audit` records source evidence, confidence tiers, likely variants, and behavior obligations for observed form-control or confirmation-dialog patterns so the proposal explains why a family was suggested. `.decantr/style-bridge.json` is the optional Hybrid style bridge: it maps Decantr intent onto project-owned tokens/classes without installing Decantr CSS or writing host style files. `codify --accept --confirm-reviewed` accepts local law only; a pending bridge remains a proposal until `--accept-style-bridge` is also supplied. Bridge acceptance regenerates `DECANTR.md` and `.decantr/context/assistant-bridge.md` immediately so all authority guidance agrees. `codify --map-pattern <slug>` imports official corpus guidance as advisory local law; it remains non-enforceable until the team fills in project-owned components, token/class recipes, variants, and exceptions. This complements, but does not replace, ESLint, Biome, Storybook, axe, Playwright, visual regression, or project tests.

## Hybrid Operating Layer

Hybrid starts when an attached app moves beyond contract-only context and intentionally adopts one or more stronger authority layers:

- **Hybrid local law**: accepted `.decantr/local-patterns.json` and `.decantr/rules.json` describe project-owned buttons, cards, shells, forms, tokens, theme variants, optional behavior obligations, and mechanical rules.
- **Hybrid style bridge**: accepted `.decantr/style-bridge.json` maps Decantr intent through project-owned tokens/classes into the app's existing style system.
- **Hybrid with legacy Decantr CSS**: `@decantr/css` and generated Decantr CSS are active only where explicitly adopted.
- **Hybrid composition**: the app selectively adds sections, pages, features, themes, or content API execution packs while preserving existing source authority.

The authority order is explicit: existing production source first, accepted local patterns/rules and style bridge next, Essence V4 contract next, and official corpus patterns or execution packs as optional guidance unless the project maps them into local law. This is how Decantr helps with drift like "three different primary buttons" without pretending the corpus owns a contract-only app.

`decantr resolve` makes that order visible when the code and contract disagree. The default command is read-only: it groups conflicts, names the authority lane, and prints exact next commands such as repair source, accept observed source into contract, codify local law, update style bridge, regenerate graph/context, defer to drift log, or mark advisory. Only drift-log flags write directly to `.decantr/drift-log.json`; source, contract, local-law, and style-bridge changes stay in explicit workflows.

`decantr doctor` reports the active adoption lane and the next choice. `decantr task <route> "<task>"` and MCP `decantr_context` with `{ "action": "task" }` return a compact authority block with source authority, style authority, active authorities, runtime boundary, accepted behavior obligations, and warnings when a prompt asks to mix frameworks or add the legacy Decantr CSS adapter outside `decantr-css` mode. That block is intended to be pasted into, or automatically surfaced by, the assistant before it edits.

```bash
decantr doctor --project apps/web
decantr codify --from-audit --style-bridge --project apps/web
decantr codify --map-pattern hero --project apps/web
decantr codify --accept --confirm-reviewed --project apps/web
decantr task /settings "standardize account form buttons" --project apps/web
decantr verify --brownfield --local-patterns --project apps/web
```

Hybrid is still observe-first. It does not rewrite the app, replace project tests, or make official corpus patterns enforceable by default.

## Project Health

Project Health is the local reliability layer across all workflow modes:

- Greenfield projects use `decantr verify` after `refresh` to confirm essence, context packs, routes, and runtime evidence agree.
- Brownfield projects automatically include route coverage and drift checks when `.decantr/project.json` declares `brownfield-attach`.
- Hybrid projects use `decantr verify` after local-law acceptance, `add`, `remove`, `theme switch`, style bridge changes, explicit legacy Decantr CSS adoption, or content-pack changes to catch contract, rule, and pack drift before implementation continues.

Use `decantr doctor` when the next step is unclear, `decantr task` before route edits, `decantr verify` after local edits, `decantr ci` inside automation, `decantr resolve` when authority conflicts need a decision, `decantr verify --evidence` for the privacy-redacted v2 Evidence Bundle, `decantr verify --base-url <url> --evidence` for local screenshots, and `decantr verify --save-baseline` / `--since-baseline` for continuity. In default v2 Brownfield CI, a saved baseline keeps inherited debt visible but gates only findings introduced after that baseline. `doctor` prints an ordered next-step queue; monorepos can install the v2 gate from the repository root with `decantr ci init --project <app-path>`, or use `decantr ci init --workspace` for an aggregate workspace gate. See [Project Health](project-health.md) for the full reference.

Select Decantr 3.9 change proof deliberately:

```bash
decantr ci --project apps/web --since origin/main --report-version v3 --json
decantr ci --workspace --since origin/main --report-version v3 --json
decantr ci init --project apps/web --report-version v3
```

CI v3 embeds the existing v2 health evidence plus `AdoptionTruthV1` and `GovernanceDeltaV1`. The delta partitions stable finding occurrences into new, inherited, resolved, and unclassified, and combines Git scope with baseline/graph/evidence/contract/content/source identities. Missing, stale, incompatible, or unresolved evidence produces `not_proven` and remains non-passing unless `--fail-on none` is explicit. CI never creates or updates the baseline, and package upgrades do not rewrite v2 workflows.

Studio renders the same contracts without becoming an operator. Current-project refresh may recompute read-only verifier state in memory; report mode may reread project-mode Project Health v2, CI v2/v3, Adoption Truth, or Governance Delta artifacts. Studio does not write source/contracts/baselines or run adoption, repair, acceptance, migration, builds, package managers, verification, or agents.

## Assistant Rule Bridge

Existing rule files are detected during project analysis and init. Bridge behavior is preview-first:

- `--assistant-bridge=preview` writes `.decantr/context/assistant-bridge.md`.
- `decantr refresh` regenerates a configured or existing assistant preview from the current workflow and adoption metadata.
- `decantr rules preview` prints the bridge without mutating files and inherits the package manager from the selected app's workspace root in monorepos.
- `decantr rules apply` inserts or upgrades marked blocks in supported rule files using the workflow recorded in `.decantr/project.json`; Greenfield bridges do not cite Brownfield-only artifacts.
- `decantr connect cursor` writes `.cursor/mcp.json` and `.cursor/rules/decantr.mdc`; use `--preview` to inspect first.
- No workflow mutates rule files unless `--assistant-bridge=apply` or `decantr rules apply` is explicit.

## Monorepo And Offline

Workspace roots are detected from `pnpm-workspace.yaml`, package workspaces, `turbo.json`, `nx.json`, and common `apps/*` layouts. Install Decantr at the workspace root if that is where dependencies are managed, but attach Decantr to an app root. Workspace-root Brownfield commands require `--project=<path>` whenever app candidates exist.

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr setup
pnpm exec decantr workspace list
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
pnpm exec decantr codify --from-audit --style-bridge --project apps/web
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
pnpm exec decantr ci init --project apps/web
```

CI uses the same explicit project-path posture through `decantr ci --project <path>` and `decantr ci init --project <path>`. Generated GitHub workflows live at the repository root and use the pinned local package-manager command, such as `pnpm exec decantr ci --project apps/web`, instead of `@latest`. V2 remains the default; add `--report-version v3` explicitly when the workflow should fetch full history, resolve a change base, and emit per-project governed-change proof. If the CLI is not pinned in the root package manifest, `ci init` prints the package-manager-specific install command before writing the workflow.

App-scoped primitives follow the same posture. Use `--project <path>` with `health`, `status`, `upgrade`, `add`, `remove`, `theme`, `export`, `suggest`, `magic`, `rules`, and `telemetry` when invoking them from a workspace root. `add page` writes route mappings so task-time context remains addressable; `health --project <path> --prompt <finding-id>` resolves prompts against the app that produced the finding.

For monorepos with many Decantr projects, use `.decantr/workspace.json` when you want explicit project ownership/tags/concurrency, or let Decantr discover `decantr.essence.json` files automatically:

```bash
decantr workspace list
decantr verify --workspace
decantr verify --workspace --changed --since origin/main
```

Workspace health isolates per-project failures, keeps output deterministic, and emits aggregate JSON suitable for CI artifacts.

Offline behavior:

- `--offline --adoption=contract-only` works without content API access.
- Blueprint, archetype, or theme flows resolve through canonical `@decantr/content` implementations using bundled/workspace content, local cache/custom content, `DECANTR_CONTENT_DIR`, or the content API. `@decantr/registry` is a compatibility facade, not a second corpus owner.
- `decantr sync` is the content API cache-hardening path: it paginates official list endpoints and stores full slug-keyed item records under `.decantr/cache/@official/`, so offline guards and generated context use canonical content rather than list summaries.
- Supported offline flows must not call the hosted API.

## Harness And Certification

Use:

```bash
pnpm --filter @decantr/cli certify:workflows
pnpm --filter @decantr/cli certify:blueprints
pnpm benchmark:proof-field -- --config fixtures/proof-corpus/proof-apps.json --out /tmp/decantr-proof-field-3.5
```

The workflow matrix covers greenfield blueprint, greenfield contract-only, brownfield analyze/proposal/acceptance, direct brownfield compatibility init, adoption modes, offline flows, unsupported target fallback, monorepo `--project`, Next.js adapter, and hybrid composition.

The 3.5 proof harness replays realistic Brownfield fixtures and mutation classes, then writes a v2 proof-field report with pass/fail metrics, false positives, graph-anchor coverage, repair-plan coverage, and loop-verdict quality. It is historical benchmark infrastructure, not a hosted telemetry path. The separate 3.9 qualification standard requires replayable route/source cases and two-human finding adjudication; active docs do not claim the 84/24/200 gates passed.
