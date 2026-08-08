# @decantr/cli

Support status: `core-supported`  
Release channel: `stable`

Decantr's main local operator surface for observing project-owned UI authority, preparing change-scoped context, verifying changes, and reporting typed evidence.

## Release Boundary

The current stable version is Decantr 3.11.2. Bare `decantr verify` is now zero-write Changed-UI Assurance: it scopes the current Git change, auto-selects one changed UI app when provable, and reports at most three source-anchored findings. It is not quantitatively adoption-proven.

The zero-setup entry point is `verify`. The deeper CLI loop remains **Observe -> Prepare -> Verify -> Report** through `scan`, `task <target>`, `verify --full`, and `ci`. Routes are one UI surface among layouts, components, stories, overlays, flows, packages, runtime states, and exact files. Shipped behavior must not be presented as evidence that Decantr improves frontier models; that remains a separate research question.

## Install

```bash
npm install -D @decantr/cli
```

Or run it without installing:

```bash
npx @decantr/cli@3.11.2 verify
npx @decantr/cli@3.11.2 scan
npx @decantr/cli new my-app --blueprint=esports-hq
```

Use `decantr scan` with zero writes. Published 3.10.0 reports selected app/workspace scope plus independent UI-surface authority, topology, taskability, component-inventory, styling-authority, runtime-evidence, source-scope, graph-readiness, and limitation evidence through `ScanReportV2`.
Use `decantr task <target> "<intent>"` to **Prepare** one bounded change. Attached graph-backed routes retain `TaskCapsuleV1`; an exact surface ID, component, layout, overlay, story, package, or `file:<path>` selector can return read-only discovery context before adoption. Unknown, ambiguous, unresolved, or non-taskable targets fail closed; static non-route evidence is normally `limited` unless runtime reachability proves more.
Use bare `decantr verify` to check only the current UI change with no adoption or write. Use `decantr verify --full` for the previous Project Health workflow. Use `decantr ci` to **Report** typed evidence; explicit CI v3 includes the same verifier-owned change-assurance report, and missing or incompatible proof remains `not_proven`.
Use `decantr setup` when you are unsure which attach or compatibility path applies. It detects whether the repo is empty, already attached, or a Brownfield app and recommends the right entry path.
Use `decantr new` for a greenfield workspace in a fresh directory. With a blueprint or archetype it creates a contract-only Decantr workspace by default; runnable legacy Decantr CSS adapters require explicit `--adoption=decantr-css`.
Use `decantr adopt` when you already have an app and want Decantr governance without adopting a blueprint. Brownfield attach is proposal-driven: Decantr inventories the app, writes an observed essence proposal, prepares compact local context, and only applies the contract when you explicitly accept or merge it. Bulk content API execution packs require `decantr adopt --packs`.
Use `decantr studio` as an advanced read-only Control Room for findings, evidence, authority, and next actions. Use `decantr connect cursor` when the opened workspace should get Cursor Agent MCP and project-rule activation; in monorepos use `decantr connect cursor --project apps/web` so the rule keeps the app scope. Use `decantr doctor` when attach state is unclear and `decantr resolve` when source and contract disagree. If runtime source and Decantr context disagree, report the drift instead of guessing; in Brownfield the existing production source is first authority, accepted local law/style bridges apply within their scope, accepted Essence V4 is project law beneath production source, and content packs stay advisory until mapped into local law. Use `decantr graph` for attached typed graph snapshots, diffs, history, route context, and source-file impact. Graph ranking is supporting evidence, not a substitute for live target authority. Use `decantr codify --from-audit --style-bridge` when reviewed project-owned UI patterns, behavior obligations, rules, and token/class mappings should become local law.
In monorepos, app-scoped commands accept `--project <app-path>`. `setup` shows attach guidance before adoption and the day-two loop after adoption. Discovery ranks product UI apps ahead of docs, Storybook, API, MCP helper, workbench, and package surfaces; `decantr workspace list --json` metadata explains the rank. Once an app path is selected, scan/setup/adopt/doctor/task/verify/ci/connect behavior preserves that app scope and inherits package-manager evidence from the workspace root. Bulk content packs are opt-in with `decantr adopt --packs`; task-scoped context remains the default. Content pack hydration also follows the essence path: `decantr content compile-packs apps/web/decantr.essence.json --write-context` writes into `apps/web/.decantr/context`. In contract-only/offline Brownfield, deferred packs are optional context unless a present manifest references missing files.
Use `decantr init`, `decantr analyze`, `decantr check`, and `decantr health` as advanced primitives when you need direct control over one step. Direct `init` and Brownfield `adopt` retain bounded write receipts in `.decantr/project.json`; `AdoptionTruthV1` reports governance writes, explicitly requested assistant-rule/CI support artifacts, and authored-source integrity independently. Brownfield and Hybrid adoption do not create or edit formatter ignore files. Tailwind v4 projects are one explicit bounded exception: Decantr adds a marked `@source not` block to detected Tailwind CSS entry files so generated governance text cannot become utility candidates. The receipt records each approved stylesheet path and exact before/after hash; any other authored-source mutation, or a later hash mismatch, fails the integrity claim.

App-scoped primitives now share the same `--project` posture as the primary workflow commands. From a workspace root, `health`, `status`, `upgrade`, `add`, `remove`, `theme`, `export`, `suggest`, `magic`, `rules`, and `telemetry` target the selected app instead of the root. Task/read paths, local-law summaries, and refresh change summaries are printed as openable workspace paths. Nonexistent project paths fail immediately, and Brownfield adoption refuses component packages unless you intentionally pass `--force-package`.

Compatibility Decantr CSS starter adapters, only when `--adoption=decantr-css` is explicit. These receive no 3.11 feature investment:

- `react-vite` is the React + Vite runnable bootstrap adapter
- `next-app` is the runnable Next.js App Router adapter
- `vanilla-vite` is the plain HTML/CSS/JS runnable bootstrap adapter
- `vue-vite` is the Vue 3 + Vite runnable bootstrap adapter
- `sveltekit` is the SvelteKit runnable bootstrap adapter
- `angular` is the Angular standalone runnable bootstrap adapter
- `solid-vite` is the Solid + Vite runnable bootstrap adapter
- other contract targets use the `generic-web` contract-only adapter until their runnable adapters land

Explicit workflow/adoption flags:

```bash
decantr setup
decantr verify
decantr verify --since origin/main --ci
decantr scan
decantr scan --project apps/web --json
decantr adopt --yes
decantr studio
decantr doctor
decantr ci --fail-on error
decantr ci init
decantr resolve
decantr codify --from-audit --style-bridge
decantr codify --map-pattern hero
decantr codify --accept --confirm-reviewed
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
decantr graph --project apps/web
decantr graph --project apps/web --route /feed --json
decantr graph --project apps/web --node cmp:button --impact --json
decantr graph --project apps/web --file src/app/page.tsx --impact --json
decantr graph --project apps/web --compare-to graph:previous --include-diff-ops --json
decantr graph --check
decantr init --workflow=greenfield --adoption=contract-only
decantr analyze
decantr init --existing --accept-proposal
decantr init --existing --merge-proposal
decantr init --existing --adoption=style-bridge
decantr init --existing --adoption=decantr-css
decantr init --project=apps/web --yes
decantr init --assistant-bridge=preview
decantr connect cursor --preview
decantr rules preview
decantr rules apply
```

Additional 3.10 selectors:

```bash
decantr task component:SaveButton "preserve loading behavior"
decantr task file:src/components/SaveButton.tsx "preserve loading behavior"
```

Adoption modes:

- `contract-only` writes Decantr essence/context/governance files without Decantr CSS files or `@decantr/css` dependency guidance.
- `style-bridge` keeps runtime styling host-owned. Decantr writes proposal/accepted governance JSON under `.decantr/`, never runtime CSS, token stylesheets, or global styles; only an accepted `.decantr/style-bridge.json` has bridge authority.
- `decantr-css` writes the full Decantr CSS files and runtime guidance.

Monorepos store portable, workspace-relative `workspaceRoot` and `appRoot` values. Install Decantr at the workspace root if that is where dependencies are managed, but attach Decantr to an app root with `--project=<path>`.

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr setup
pnpm exec decantr workspace list
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
pnpm exec decantr codify --from-audit --style-bridge --project apps/web
pnpm exec decantr codify --map-pattern hero --project apps/web
pnpm exec decantr ci init --project apps/web
```

Assistant rule integration is preview-first: `--assistant-bridge=preview` writes `.decantr/context/assistant-bridge.md`, `decantr rules preview` prints the bridge, and `--assistant-bridge=apply` or `decantr rules apply` mutates supported rule files with updatable marked blocks. Normal `decantr refresh` keeps a configured or existing assistant preview current, and accepting a reviewed style bridge immediately refreshes both that preview and `DECANTR.md`. Cursor has a direct connector: `decantr connect cursor` writes `.cursor/mcp.json` and `.cursor/rules/decantr.mdc`, preserving existing MCP servers; use `--preview` to inspect first and `--project <app>` from a monorepo root. Stable route-backed task capsules require a current typed graph and start with the proven route implementation rather than a generated route tree. The capsule adds verifier-ranked authority, ordered style, and advisory evidence reads; generated `.decantr`, `DECANTR.md`, and Essence churn is excluded from source impact, and compatibility-only fields are trimmed before the 12,000-byte ceiling is exceeded. Decantr uses live verifier discovery for every target and never treats saved `.decantr/analysis.json` as authority. Discovery-backed non-route or pre-adoption task context is a separate read-only `ui-surface-task-context.v1` result and does not pretend to be `TaskCapsuleV1`. Blocked targets exit nonzero with structured reasons and no edit read set.

Published 3.10.0 `decantr scan` is look-don't-touch reconnaissance for selected-app scope, independent authority axes, taskable routes and surfaces, components, styling, typed graph readiness, and limitations. Authored framework route sources remain the implementation authority. TanStack generated metadata may corroborate public paths without becoming an edit target; Astro content pages are separated from response endpoints; Angular scans begin at the selected production bootstrap/router graph and carry resolved external component resources into task context. Inferred or unresolved route evidence is withheld from governed route maps. Attached Essence V4 apps may derive graph previews in memory while scan still writes nothing.

Scan separates UI-surface authority, topology, taskability, component-inventory, styling-authority, runtime-evidence, and source-scope axes. It keeps tests, stories, fixtures, mocks, generated files, build output, packages, and sibling apps separate from production authority.

For Next applications, scan treats file-route declaration and deployment reachability as distinct evidence. Routes denied by statically resolved middleware/proxy 4xx policy remain visible but are not taskable; unresolved path policy lowers authority and blocks task context. Styling reads follow production import order across workspace package CSS and app-local overrides. Server-handler exports from App Router `route.ts` files are not component candidates.

## Compatible 3.x Surface

- writes Decantr contract/context projects from blueprints, archetypes, or prompts
- previews existing apps with read-only Brownfield scan reports
- emits `scan-report.v2` JSON with selected-app scope, route/component/style evidence, graph readiness, and limitations
- supports scan/adopt/route-task/verify/CI workflows, with codify, Studio, and compatibility commands available as advanced paths
- exposes one verifier-owned adoption truth across operator surfaces and records bounded before/after initialization and adoption receipts without following symlinks, including exact approval records for Tailwind v4 source-scan isolation
- emits verifier-owned bounded route task capsules and opt-in governance deltas without changing existing v2 report defaults
- supports explicit workflow lanes: greenfield blueprint, greenfield contract-only, brownfield adoption, Hybrid local law, Hybrid style bridge, Hybrid Decantr CSS, and hybrid composition
- generates execution-pack context files for AI coding assistants
- connects Cursor Agent to Decantr MCP and project rules with `decantr connect cursor`
- generates typed Contract graph artifacts, replayable snapshot history, graph diffs, manifests, source-file impact context, style-bridge Token nodes, behavior-obligation LocalRule nodes, and `contract-capsule.json` for agent sessions
- audits projects against Decantr contracts
- produces local Project Health reports, Evidence Bundles, workspace health, and a localhost Studio dashboard for end-user drift triage
- audits local vocabulary repositories with Content Health reports for schema, reference, and quality coverage
- searches the official content corpus and showcase benchmark corpus
- runs real-world corpus harnesses with timing percentiles, slow-command budgets, root-smoke/app-scoped classification, and stable failure categories
- filters blueprints through public portfolio sets: `All`, `Featured`, `Certified`, and opt-in `Labs`
- syncs hosted content API vocabulary into a full slug-keyed local cache for offline guards and context generation
- validates, refreshes, and maintains `decantr.essence.json`

## Shipped 3.11 Addition

- bare `decantr verify` selects `change-assurance-report.v1` with complete Git change scope and zero writes
- exactly one changed app is auto-selected when provable; ambiguous multi-app work fails closed
- default output is capped at three consequential authority, component-reuse, or style findings with exact source lines and repair targets
- tests, fixtures, stories, generated files, build output, and sibling apps cannot become production authority
- explicit CI v3 and MCP `decantr_verify` action `changes` carry the same verifier-owned report

Primitive-reuse enforcement is strongest for JSX/TSX in 3.11. Angular, Vue, and other template parity remains an explicit limitation. See the [Change Assurance contract](https://decantr.ai/reference/change-assurance.md).

## Shipped 3.10 Foundation

- independent UI-surface readiness and evidence-adapter data in source-tree scan reports
- target-based non-route and pre-adoption discovery context through `ui-surface-task-context.v1`
- stricter selected-app ranking and production/supporting/generated source classification

These additions shipped in 3.10.0 and remain the authority foundation beneath 3.11. Their deterministic behavior is covered by tests and regression replays; it does not establish a frontier-model improvement claim.

## Security And Permissions

The CLI is intentionally a local project inspector and artifact writer. It reads selected project/workspace files, package manifests, routing/style/config files, `.decantr` artifacts, and Decantr cache/config files. It writes `decantr.essence.json`, `DECANTR.md`, `.decantr/*`, generated context packs, `.decantr/graph/*` typed graph artifacts, optional CI workflows/snippets, optional Cursor MCP/rule files, optional style/export files, and auth/telemetry config only when explicitly requested. Bare `decantr verify` and `decantr scan` read and print only; changed-UI verify writes only when an explicit `--output` is supplied. Neither path creates `.decantr`, uploads source, runs package scripts, or installs dependencies.

Telemetry is disabled by default. Content API reads and pack hydration are explicit command paths; hosted critique/audit uploads are retired. Screenshots and Evidence Bundles stay local. Release audits prove the installed package with `npm pack --dry-run --json`. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## Common Commands

```bash
decantr setup
decantr verify
decantr verify --since origin/main --ci
decantr verify --full --brownfield --local-patterns
decantr scan
decantr scan --project apps/web
decantr scan --json
decantr new my-app --blueprint=esports-hq
decantr adopt --yes
decantr adopt --project apps/web --yes
decantr doctor
decantr doctor --project apps/web
decantr resolve --project apps/web
decantr codify --from-audit --style-bridge
decantr codify --map-pattern hero --project apps/web
decantr codify --accept --confirm-reviewed
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
decantr verify --base-url http://localhost:3000 --evidence
decantr graph --project apps/web
decantr graph --project apps/web --route /feed --json
decantr graph --project apps/web --node cmp:button --impact --json
decantr graph --project apps/web --file src/app/page.tsx --impact --json
decantr graph --project apps/web --snapshot-id graph:previous --route /feed --json
decantr graph --project apps/web --compare-to graph:previous --include-diff-ops --json
decantr graph --check --json
decantr ci --project apps/web
decantr ci --project apps/web --fail-on warn
decantr ci --workspace --changed --since origin/main
decantr ci init --project apps/web
decantr init --existing --blueprint=esports-hq
decantr init --workflow=greenfield --adoption=contract-only
decantr rules preview
decantr rules apply
decantr connect cursor
decantr connect cursor --project apps/web --preview
decantr magic "AI-native analytics workspace"
decantr audit
decantr check
decantr studio --port 4319 --host 127.0.0.1
decantr telemetry status
decantr telemetry explain
decantr telemetry link --api-url https://telemetry.example/v1 --api-key <key>
decantr content check --ci --fail-on error
decantr content summary --namespace @official --json
decantr list blueprints --blueprint-set featured
decantr list blueprints --blueprint-set certified
decantr search dashboard --type blueprint --blueprint-set labs
decantr suggest "recipe feed with infinite scroll" --route /feed --from-code
decantr suggest --from-code --file app/page.tsx --project apps/web
decantr suggest "standardize buttons" --project apps/web
decantr list patterns
decantr showcase verification --json
```

`suggest --from-code` uses the selected app's source file to rank both official content patterns and accepted project-owned local patterns, so Brownfield button/card/form law can surface from real code instead of just the text query.

## Project Health And Studio

Bare `decantr verify` is the workflow command most users should run locally after edits. It performs Changed-UI Assurance over the current Git scope and writes nothing. `--project`, `--since`, `--json`, `--markdown`, `--ci`, and an explicit `--output` refine that workflow. It selects Project Health when `--full` or an existing health-only flag is present; full mode can add Brownfield guard validation with `--brownfield`, require an accepted local pattern pack with `--local-patterns`, scan `.decantr/rules.json`, support workspace mode, and write evidence when `--evidence` is used.

`decantr doctor` explains project/workspace state, adoption mode, adoption lane, generated artifacts, typed graph readiness, local law, visual evidence, design authority signals, CI wiring, and an ordered next-step queue. It is the command to reach for when an app is in a monorepo, has stale Decantr files, or someone is not sure what Decantr expects next.

`decantr setup` is non-mutating orientation. In an attached Brownfield app it reflects whether local law is already accepted, so the recommended verify command includes `--local-patterns` only when the project has that layer.

`decantr ci` is the blessed non-mutating automation gate. V2 remains the default and preserves its shipped baseline behavior. Explicit `--report-version v3` emits `decantr-ci-report.v3` with the existing health evidence plus verifier-owned `AdoptionTruthV1`, `GovernanceDeltaV1`, and Changed-UI Assurance; project mode may add `--since <git-ref>` for changed-file scope, and workspace mode carries per-project contracts plus a deterministic aggregate gate. Missing, stale, or incompatible baseline/change evidence is `not_proven`, not an empty successful delta, and is non-passing unless `--fail-on none` is explicit. `decantr ci init --report-version v3` opts a generated workflow into v3 and configures full Git history/base-ref collection; existing and newly generated workflows stay on v2 without that flag.

`decantr health` remains the advanced project observability primitive. It composes the existing verifier audit, guard checks, brownfield route drift checks, runtime evidence, component reuse drift, accepted style bridge drift, accepted behavior-obligation checks, typed Contract graph freshness, and execution-pack files into a v2 `ProjectHealthReport` with status, score, route summary, pack summary, findings, stable diagnostic codes, typed repair IDs, evidence tier, authority resolution, loop readiness, and AI-ready remediation prompts. The graph freshness slice emits `GRAPH001` / `regenerate-typed-graph` when an attached app has missing, stale, or non-derivable `.decantr/graph` artifacts. The component reuse slice emits `COMP001` / `import-existing-component` when production source locally redeclares a common primitive that already exists as an exported reusable component, and `COMP010` / `replace-raw-control-with-local-component` when production JSX renders generic raw controls such as `<button>` or text-like `<input>` while the project already owns a reusable primitive. Specialized inputs such as file, hidden, checkbox, radio, color, range, and Dropzone `getInputProps()` controls are not treated as generic `Input` drift. Source audits also exclude tests, fixtures, generated files, and testing directories; explicit router guards satisfy protected-surface topology; generic callback utilities and fixed-position components need semantic evidence before they are treated as auth callbacks or dialogs. The behavior-obligation slice emits `A11Y010`, `A11Y011`, `INT010`, `INT011`, `INT012`, `INT013`, and `COMP020` for high-confidence dialog/form regressions such as missing accessible names, missing label associations, missing visible destructive consequence copy, missing cancel affordances, missing submitting guards, implicit form button types, or bypassed project-owned interaction primitives. The style bridge slice emits `TOKEN010` / `replace-arbitrary-style-with-bridge-token` when production JSX, common class helpers, hardcoded inline color styles, or hardcoded visual values in CSS/module stylesheets bypass `.decantr/style-bridge.json` after it has been accepted as project-owned style authority. The baseline slice emits `VISUAL010` / `review-visual-baseline-drift` when `--since-baseline` detects changed screenshot hashes. When `.decantr/graph/graph.snapshot.json` exists, each finding is anchored to the most specific graph node Decantr can resolve, and JSON, markdown, text output, repair prompts, and Evidence Bundles carry that anchor. `decantr graph` also writes content-addressed history snapshots under `.decantr/graph/snapshots/` so repeated graph runs can be replayed across an AI edit sequence. When `.decantr/analysis.json` exists, `decantr graph` links observed routes/pages to implementation source artifacts and links exported reusable component declarations to their source files. When browser evidence writes `.decantr/evidence/visual-manifest.json`, `decantr graph` ingests it as local route/page Evidence nodes without uploading screenshots. When `.decantr/evidence/latest.json` exists, `decantr graph` can also materialize saved findings, evidence strings, graph anchors, repair IDs, and referenced repair/read target files as typed graph nodes and edges. Health-baseline diffs remain continuity artifacts and are deliberately not graph inputs, preventing a continuity check from making the graph stale.

```bash
decantr verify
decantr verify --brownfield --local-patterns
decantr verify --brownfield --local-patterns --fail-on warn
decantr verify --base-url http://localhost:3000 --evidence
decantr verify --since-baseline
decantr doctor --project apps/web
decantr ci --project apps/web
decantr ci --project apps/web --since origin/main --report-version v3 --json
decantr ci init --project apps/web
decantr ci init --project apps/web --report-version v3
decantr ci init --provider generic --project apps/web
decantr health
decantr health --format json
decantr health --markdown --output health.md
decantr health --prompt <finding-id>
decantr health --project apps/web --prompt <finding-id>
decantr health --evidence --output .decantr/evidence/latest.json
decantr health --browser --base-url http://localhost:3000 --evidence
decantr health --save-baseline
decantr health --since-baseline
decantr health --diagnostics --markdown
decantr health --design-tokens .decantr/design/figma-tokens.json
decantr health --json --output decantr-health.json
decantr ci init
decantr ci init --fail-on warn --force
decantr ci init --project apps/web
decantr ci init --workspace
decantr ci --workspace --report-version v3 --json
decantr workspace list
decantr verify --workspace --changed --since origin/main
decantr export --to figma-tokens
```

Use `--json` for machines and schema validation, `--markdown` for summaries, `--evidence` for the privacy-redacted Evidence Bundle, and `--prompt <finding-id>` when you want a scoped remediation prompt for an AI assistant. Use `--diagnostics --json` when automation or agents need the stable diagnostic code and repair ID catalog without running a project audit. The prompt command prints instructions only; it does not modify source files. In monorepos, prompt commands preserve `--project <path>`, include app-prefixed read targets such as `apps/web/DECANTR.md`, and use root-safe runtime commands such as `pnpm --dir apps/web build` so the finding resolves from the same app that produced it. Prompt output includes the stable code and repair ID; if `decantr graph` has generated a snapshot, it also includes the graph node ID, node type, confidence, and snapshot ID for the finding. `--browser` uses a project-local Playwright install and a supplied base URL to capture local route screenshots under `.decantr/evidence/screenshots/` and write `.decantr/evidence/visual-manifest.json`; missing Playwright becomes a visible setup finding/message, not a crash or silent skip. `--save-baseline` writes `.decantr/health-baseline.json`; `--since-baseline` writes `.decantr/health-baseline-diff.json` with changed files, route impact, finding deltas, screenshot hash drift, and contract drift. `--design-tokens <path>` compares a Tokens Studio/Figma token JSON export against Decantr CSS token names. `decantr ci --fail-on error` fails only when blocking errors exist; `decantr ci --fail-on warn` also fails on warnings.

`decantr ci init` installs `.github/workflows/decantr-ci.yml` for GitHub Actions. The generated workflow installs dependencies at the workspace root, writes JSON/markdown CI artifacts, gates with `decantr ci`, appends the markdown report to the GitHub step summary, and uploads both files as artifacts. Use `--force` to replace an existing workflow or `--fail-on warn` for stricter repositories. In monorepos, add `--project <path>` from the repository root; dependency install stays at the root while CI evaluates the app contract and uploads app-scoped artifacts. Use `--workspace` to generate an aggregate gate. Use `--provider generic` for Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deployment tools. Generated CI uses the pinned local package-manager command and does not depend on `@latest`. V3 GitHub workflows fetch full history and resolve the pull-request base SHA or configured base ref before passing `--since`; v2 workflow generation is unchanged. Project Health remediation prompts are also monorepo-aware, so missing-pack fixes use `apps/web/decantr.essence.json` and CI recommendations include `--project apps/web`.

`decantr workspace` is the monorepo reliability namespace. Before attach, `workspace list` shows app candidates. After attach, it also discovers Decantr projects from `.decantr/workspace.json` or by finding `decantr.essence.json` files, and it distinguishes "attach another app" from the empty-workspace first attach. Workspace health runs projects with deterministic ordering, concurrency, per-project timeout, failure isolation, and aggregate JSON, and can limit a run to changed projects:

```bash
decantr workspace list
decantr workspace health
decantr workspace health --json --output .decantr/workspace-health.json
decantr verify --workspace --changed --since origin/main
```

In observed Brownfield projects, common section shorthands are accepted for page and feature additions when they resolve unambiguously. For example, `decantr add page app/settings --route /settings --project apps/web` and `decantr add feature saved-recipes --section app --project apps/web` resolve `app` to the single primary section, such as `observed-primary`, so docs and LLM prompts do not have to guess generated section IDs first.

`decantr studio` starts a local-only, read-only Control Room. Current-project mode computes Project Health, `AdoptionTruthV1`, and a deliberately `not_proven` in-memory governance delta when compatible baseline/change evidence is unavailable. Report mode reads project-mode Project Health v2, CI v2, CI v3, standalone AdoptionTruthV1, or standalone GovernanceDeltaV1 artifacts; it does not support saved workspace CI artifacts. Studio exposes read endpoints plus refresh-as-recompute, but it does not write project/report files, run Git/build/package-manager/repair commands, invoke an agent, or upload source.

```bash
decantr studio
decantr studio --port 4319 --host 127.0.0.1
decantr studio --report decantr-health.json
decantr studio --workspace
```

Studio is for local triage, not Decantr admin telemetry. The Control Room keeps the first decision simple: inspect adoption truth, governance delta, loop state, next action, authority lane, blocking findings, evidence tier, graph impact, and copyable commands. Commands and repair prompts are copy-only. The views cover Control Room, Routes, Graph Impact, Authority Resolver, Evidence, Repairs, and CI/Benchmarks without uploading source code, prompts, file paths, or project data.

Workspace Studio uses `decantr workspace health` behind `GET /api/workspace` and `POST /api/workspace/refresh` so large monorepos can triage many Decantr projects from one local dashboard.

Use report mode for customer-controlled reporting from CI artifacts:

```bash
decantr health --json --output decantr-health.json
decantr studio --report decantr-health.json
```

If a project has explicitly enabled Decantr CLI telemetry and configured `DECANTR_TELEMETRY_ENDPOINT`, `new --telemetry`, `init --telemetry`, `analyze`, `check --telemetry`, `health`, and `studio` may emit only aggregate product-activation metadata to that caller-controlled private sink. They never upload the health report, finding evidence, local paths, route names, source code, package names, or prompt text. Without the endpoint, opt-in remains a local preference and no events or opaque identifiers are created.

## Private Telemetry Identity

`decantr telemetry` reports whether a caller-controlled event sink is configured and exposes the aggregate event contract for review. Decantr does not operate a hosted telemetry sink or identity service.

```bash
decantr telemetry status
decantr telemetry status --json
decantr telemetry explain
decantr telemetry explain --json
DECANTR_TELEMETRY_ENDPOINT=https://telemetry.example/v1/events decantr init --telemetry
decantr telemetry link --api-url https://telemetry.example/v1 --api-key <key> --org <org-slug>
```

`telemetry link` is retained for private deployments only. It requires an explicit `--api-url` or `DECANTR_TELEMETRY_IDENTITY_API_URL` plus an API key; it never falls back to `api.decantr.ai` or `DECANTR_API_URL`. Only after those values are validated can it create and send opaque install/project ids, optional org slug, and optional label.

`telemetry explain` prints the CLI event catalog subset, aggregate field categories, current opaque ids if they already exist, and the explicit never-collected list. It is designed for security review and customer trust conversations before a team opts in.

## Content Health

`decantr content check` is the preferred content-author workflow for the official corpus in `packages/content`. `decantr content-health` remains as a backward-compatible primitive. Content Health is separate from Project Health: Project Health checks an end-user app against its Decantr contract, while Content Health checks official corpus inputs before they ship in `@decantr/content` or back the content API.

```bash
decantr content check
decantr content check --ci --fail-on error
decantr content-health
decantr content-health --json
decantr content-health --markdown --output content-health.md
decantr content-health --ci --fail-on error
decantr content-health --ci --fail-on warn
decantr content check --prompt <finding-id>
```

The report validates local `patterns/`, `themes/`, `blueprints/`, `archetypes/`, and `shells/` against the published content schemas, checks hard references such as blueprint themes and composed archetypes, summarizes softer generation-coverage gaps such as missing pattern coverage, and emits AI-ready remediation prompts. It does not call the content API by default.

## Greenfield Certification

This is a compatibility harness for retained scaffolding behavior. It is not the Decantr model-improvement benchmark or product release evidence by itself.

Use the built-in certification harness before releases when you want to prove that representative blueprints still scaffold into runnable starter projects:

```bash
pnpm --filter @decantr/cli certify:blueprints
```

By default it certifies `portfolio`, `producer-studio`, and `agent-marketplace` by:

- running `decantr new` in fresh temp directories
- seeding offline content from `DECANTR_CONTENT_DIR` or the workspace `packages/content` corpus
- verifying the starter runtime files and router mode match the generated essence
- running `npm run build` in each scaffolded project

Override the matrix or emit JSON when needed:

```bash
pnpm --filter @decantr/cli certify:blueprints -- --blueprints=portfolio,legal-research --json
```

Offline blueprint scaffolding expects a real local content source:

```bash
DECANTR_CONTENT_DIR=/path/to/content decantr new my-app --blueprint=esports-hq --offline
```

If a requested offline blueprint, archetype, or theme cannot be resolved from local cache/custom content or `DECANTR_CONTENT_DIR`, the CLI now stops explicitly instead of silently falling back to the default scaffold.

Run `decantr sync` before offline-heavy or CI-heavy workflows that depend on content API reads. Sync paginates the official content list endpoints, then fetches and stores each item by slug as a full content record under `.decantr/cache/@official/`. That keeps guard checks, Project Health, and context generation aligned with the canonical vocabulary contract instead of abbreviated public list summaries.

## Workflow Certification

This is a deterministic CLI regression matrix. Passing it does not establish the 3.10 treatment-lift claim.

The broader workflow matrix now has its own certification entrypoint:

```bash
pnpm --filter @decantr/cli certify:workflows
```

It covers:

- greenfield blueprint bootstrap
- greenfield contract-only
- brownfield `adopt -> task -> verify`, with `analyze -> init --existing --accept-proposal -> check --brownfield` still covered as primitives
- brownfield doctrine maps and contract coverage checks
- brownfield semantic route-domain sectioning
- direct brownfield compatibility init
- adoption modes (`contract-only`, `style-bridge`, `decantr-css`)
- offline contract-only and offline blueprint flows
- unsupported target contract-only fallback
- monorepo `--project` handling
- Next.js App Router adapter
- hybrid follow-up composition via Decantr mutation commands

## Generated Context

Scaffolded projects include compiled execution packs under `.decantr/context/`, including:

- `scaffold-pack.md` / `scaffold-pack.json`
- `section-*-pack.md` / `section-*-pack.json`
- `page-*-pack.md` / `page-*-pack.json`
- `review-pack.md` / `review-pack.json`
- `pack-manifest.json`

Those files are the compact task contracts meant for AI assistants and downstream tooling.

Recommended read order for AI-assisted scaffolding:

1. `DECANTR.md` for the design spec, CSS approach, and guard rules
2. `.decantr/context/scaffold-pack.md` as the primary compiled shell, theme, feature, and route contract
3. `.decantr/context/scaffold.md` as the broader app overview and topology guide
4. matching `section-*-pack.md` and `section-*.md` files before section work
5. matching `page-*-pack.md` files before proven route work. For non-route work, use 3.10 target-based ranked reads together with repository-native component, Storybook, package, and runtime evidence.

For scaffolded Greenfield work before production source exists, treat accepted compiled execution packs as implementation law and narrative docs as secondary explanation. In Brownfield, production source remains first authority and execution packs are advisory unless explicitly accepted into project law. Run `decantr check` plus `decantr audit` after implementation.

For a broader health pass, run `decantr verify` after `refresh` or before opening a pull request, and run `decantr ci` inside CI. Install the default GitHub Actions gate with `decantr ci init`. Findings include remediation commands and can be turned into focused AI prompts with `decantr health --prompt <finding-id>`.

For cold-start harness or certification runs, use only the scaffolded workspace files as the contract. If local scaffold files disagree, stop and report the mismatch rather than relying on repo-global Decantr assumptions.

## Related Packages

- `@decantr/essence-spec` for schema and guard validation
- `@decantr/content` for official corpus contracts, provenance, resolution, and API access
- `@decantr/registry` only for Decantr 3.x compatibility imports
- `@decantr/verifier` for audit and critique

## Docs

- [Decantr root README](https://github.com/decantr-ai/decantr/blob/main/README.md)
- [Package support matrix](https://github.com/decantr-ai/decantr/blob/main/docs/reference/package-support-matrix.md)

## License

MIT
