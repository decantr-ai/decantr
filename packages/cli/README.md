# @decantr/cli

Support status: `core-supported`  
Release channel: `stable`

Decantr’s main local operator surface for scaffolding, auditing, inspecting, and maintaining Decantr projects.

## Install

```bash
npm install -D @decantr/cli
```

Or run it without installing:

```bash
npx @decantr/cli scan
npx @decantr/cli new my-app --blueprint=esports-hq
```

Use `decantr setup` when you are unsure which path applies. It detects whether the repo is empty, already attached, or a Brownfield app and recommends the right entry path.
Use `decantr scan` when you want a zero-commit Brownfield preview. It reads local files, detects framework/routes/styling/static-hosting/assistant-rule signals, previews typed Contract graph readiness in memory when a Decantr contract already exists, reports the contract capsule source-handle count and limit, prints a terminal report, and writes no `.decantr` files or report artifacts. Add `--json` when automation needs the `ScanReportV1` payload.
Use `decantr new` for a greenfield workspace in a fresh directory. With a starter-kit blueprint or archetype it uses the runnable adapter and Decantr CSS; without certified vocabulary content it creates a contract-only workspace unless you explicitly pass `--adoption=decantr-css`.
Use `decantr adopt` when you already have an app and want Decantr governance without adopting a blueprint. Brownfield attach is proposal-driven: Decantr inventories the app, writes an observed essence proposal, hydrates hosted execution packs when online, and only applies the contract when you explicitly accept or merge it.
Use `decantr studio` after adoption when you want a local visual view of routes, findings, and attention areas. Use `decantr doctor` when the next step is unclear, `decantr task <route> "<intent>"` before asking an LLM to modify a route, `decantr verify` after the edit, and `decantr ci` in required automation. If runtime source and Decantr context disagree, report the drift instead of guessing; in Brownfield the existing source is observed truth, accepted local law/style bridge is project authority where present, Essence V4 is the structural contract, and hosted packs stay advisory until mapped into local law. Use `decantr graph` when you want the Decantr 3 typed Contract graph, typed graph diff summary, manifest, content-addressed snapshot history, and cache-friendly contract capsule written under `.decantr/graph`; the capsule includes a bounded SourceArtifact path index so agents can discover valid file-impact handles without reading the full snapshot, and `--capsule-source-limit <count>` can tune that index for large repos. Add `--route /feed --task "improve loading" --json` when you want the exact task-ranked route-scoped subgraph an agent should inspect before editing, `--node cmp:button --impact --json` when you need the graph-shaped blast radius for a component, token, rule, finding, or source artifact, or `--file src/app/page.tsx --impact --json` when the agent knows the source file it is about to change. Use `--snapshot-id <id>` to inspect a replayable history snapshot and `--compare-to <id> --include-diff-ops --json` to compare the selected/current graph against a prior snapshot. Use `decantr codify --from-audit --style-bridge` when you want project-owned UI patterns, optional `behavior_obligations`, local rules, and token/class bridge mappings such as button/card/shell/theme standards to appear in future task context and verification. Once accepted, that local law is the first Hybrid lane: the app still owns source and styling, but Decantr treats accepted local patterns, behavior obligations, rules, and style bridge mappings as project authority.
In monorepos, app-scoped commands accept `--project <app-path>`. `setup` shows attach guidance before adoption and the day-two loop after adoption. Hosted pack hydration also follows the essence path: `decantr registry compile-packs apps/web/decantr.essence.json --write-context` writes into `apps/web/.decantr/context`. In contract-only/offline Brownfield, deferred hosted packs are optional context unless a present manifest references missing files.
Use `decantr init`, `decantr analyze`, `decantr check`, and `decantr health` as advanced primitives when you need direct control over one step.

App-scoped primitives now share the same `--project` posture as the primary workflow commands. From a workspace root, `health`, `status`, `upgrade`, `add`, `remove`, `theme`, `export`, `suggest`, `magic`, `rules`, and `telemetry` target the selected app instead of the root. Task/read paths, local-law summaries, and refresh change summaries are printed as openable workspace paths. Nonexistent project paths fail immediately, and Brownfield adoption refuses component packages unless you intentionally pass `--force-package`.

Current starter adapter availability:

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
decantr scan
decantr scan --project apps/web --json
decantr adopt --yes
decantr studio
decantr doctor
decantr ci --fail-on error
decantr ci init
decantr codify --from-audit --style-bridge
decantr codify --map-pattern hero
decantr codify --accept
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
decantr rules preview
decantr rules apply
```

Adoption modes:

- `contract-only` writes Decantr essence/context/governance files without Decantr CSS files or `@decantr/css` dependency guidance.
- `style-bridge` writes bridge tokens/files that map Decantr intent onto an existing style system without requiring `@decantr/css`.
- `decantr-css` writes the full Decantr CSS files and runtime guidance.

Monorepos store both `workspaceRoot` and `appRoot`. Install Decantr at the workspace root if that is where dependencies are managed, but attach Decantr to an app root with `--project=<path>`.

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

Assistant rule integration is preview-first: `--assistant-bridge=preview` writes `.decantr/context/assistant-bridge.md`, `decantr rules preview` prints the bridge, and `--assistant-bridge=apply` or `decantr rules apply` mutates supported rule files with idempotent marked blocks. When `.decantr/graph/contract-capsule.json` exists, `decantr task` includes it in the read list and JSON payload so CLI-only agents can load the typed Contract capsule and its SourceArtifact path index before route-specific edits. When `.decantr/graph/graph.snapshot.json` exists, `decantr task --json` also includes `graph.routeContext`: the route node, scoped page/shell/pattern/component/token nodes, local law/style bridge nodes, behavior-obligation LocalRule nodes, open findings/evidence IDs, deterministic ranked nodes boosted by the task text, and the supporting edges. Accepted `.decantr/local-patterns.json` `behavior_obligations` also appear in `localLaw.patterns[].behaviorObligations` and `localLaw.behaviorObligations` so agents see project-owned dialog/form obligations before editing. If git changed files resolve to SourceArtifact nodes, `decantr task --json` also includes `graph.changedFileContext` so an agent can see source-file blast radius before editing or repairing the current diff.

`decantr scan` is different from the mutating Brownfield primitives: it is look-don't-touch reconnaissance for fit, route/style evidence, GitHub Pages hints, typed Contract graph readiness, capsule source-handle bounds, and next-command guidance. For attached Essence V4 apps it derives the graph preview in memory, reports stale/missing `.decantr/graph` artifacts, and still writes nothing. `decantr analyze` writes `.decantr/doctrine-map.json`, a ranked source-precedence map across security/data, architecture, design-system, workflow/CI, feature/business, assistant-specific, stale, and unsafe-to-cite evidence. It also writes `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`. The proposal groups routes into observed semantic domains such as auth, RBAC, billing, reporting, facilities, settings, and public surfaces across Next App/Pages Router, React Router, Angular Router, SvelteKit, Vue Router, and Nuxt file routes. Existing styling systems such as Tailwind, Bootstrap, MUI, Chakra, plain CSS, and Decantr CSS are observed as evidence instead of replaced. Theme variants are observed in the theme inventory without changing Essence V4. `decantr adopt` writes the first typed Contract graph baseline before verification so Project Health, task context, and agents can anchor to graph artifacts immediately. `decantr codify --from-audit` proposes `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json` with Hybrid authority guidance, source-derived button/card/form/theme evidence, variant hints, confidence tiers, and optional `behavior_obligations` for form controls and destructive confirmation dialogs when source evidence is strong; `decantr codify --style-bridge` proposes `.decantr/style-bridge.proposal.json`, mapping Decantr intent to project-owned tokens/classes without requiring `@decantr/css`; `decantr codify --map-pattern <slug>` maps a hosted or bundled registry pattern into an advisory local-law proposal without changing source. After review, `decantr codify --accept` promotes whichever proposals exist. `decantr doctor` reports whether the app is contract-only, Hybrid local law, style bridge, Decantr CSS, or Hybrid composition. `decantr task` prints that authority block and warns before mixing runtimes or adding Decantr CSS to a non-Decantr-CSS app. `decantr suggest --from-code` surfaces accepted local patterns and style bridge mappings from the app root or selected `--project`, and `decantr ci` prints accepted local-rule findings, behavior-obligation findings, plus style bridge status in text, markdown, and JSON reports. `decantr verify --brownfield --local-patterns` uses the Brownfield guard layer plus accepted local law to flag actionable missing doctrine coverage, unsafe context, missing assistant bridges, behavior-obligation drift, style drift, raw local-rule violations, and unsafe defaults without treating current database migrations as stale docs.

## What It Does

- scaffolds Decantr projects from blueprints, archetypes, or prompts
- previews existing apps with read-only Brownfield scan reports
- guides users through human workflow commands: setup, adopt, doctor, task, verify, ci, and codify
- supports explicit workflow lanes: greenfield blueprint, greenfield contract-only, brownfield adoption, Hybrid local law, Hybrid style bridge, Hybrid Decantr CSS, and hybrid composition
- generates execution-pack context files for AI coding assistants
- generates typed Contract graph artifacts, replayable snapshot history, graph diffs, manifests, source-file impact context, style-bridge Token nodes, behavior-obligation LocalRule nodes, and `contract-capsule.json` for agent sessions
- audits projects against Decantr contracts
- produces local Project Health reports, Evidence Bundles, workspace health, and a localhost Studio dashboard for end-user drift triage
- audits local vocabulary repositories with Content Health reports for schema, reference, and quality coverage
- searches the registry and showcase benchmark corpus
- filters blueprints through public portfolio sets: `All`, `Featured`, `Certified`, and opt-in `Labs`
- syncs paginated hosted vocabulary content into a full slug-keyed local cache for offline guards and context generation
- validates, refreshes, and maintains `decantr.essence.json`

## Security And Permissions

The CLI is intentionally a local project inspector and artifact writer. It reads selected project/workspace files, package manifests, routing/style/config files, `.decantr` artifacts, and Decantr cache/config files. It writes `decantr.essence.json`, `DECANTR.md`, `.decantr/*`, generated context packs, `.decantr/graph/*` typed graph artifacts, optional CI workflows/snippets, optional style/export files, and auth/telemetry config only when explicitly requested. `decantr scan` is the exception by design: it reads and prints only, and does not create `.decantr`, save reports, upload source, run package scripts, or install dependencies.

Telemetry is disabled by default. Hosted registry, hosted pack hydration, hosted critique/audit, and browser evidence are explicit command paths; screenshots and Evidence Bundles stay local unless a hosted workflow is invoked. Release audits prove the installed package with `npm pack --dry-run --json`. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## Common Commands

```bash
decantr setup
decantr scan
decantr scan --project apps/web
decantr scan --json
decantr new my-app --blueprint=esports-hq
decantr adopt --yes
decantr adopt --project apps/web --yes
decantr doctor
decantr doctor --project apps/web
decantr codify --from-audit --style-bridge
decantr codify --map-pattern hero --project apps/web
decantr codify --accept
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
decantr magic "AI-native analytics workspace"
decantr audit
decantr check
decantr studio --port 4319 --host 127.0.0.1
decantr telemetry status
decantr telemetry explain
decantr telemetry link --enable --org <org-slug>
decantr content check --ci --fail-on error
decantr registry summary --namespace @official --json
decantr list blueprints --blueprint-set featured
decantr list blueprints --blueprint-set certified
decantr search dashboard --type blueprint --blueprint-set labs
decantr suggest "recipe feed with infinite scroll" --route /feed --from-code
decantr suggest --from-code --file app/page.tsx --project apps/web
decantr suggest "standardize buttons" --project apps/web
decantr list patterns
decantr showcase verification --json
```

`suggest --from-code` uses the selected app's source file to rank both hosted registry patterns and accepted project-owned local patterns, so Brownfield button/card/form law can surface from real code instead of just the text query.

## Project Health And Studio

`decantr verify` is the workflow command most users should run locally after edits. It delegates to Project Health, can add Brownfield guard validation with `--brownfield`, requires an accepted local pattern pack with `--local-patterns`, scans `.decantr/rules.json` when present, supports workspace mode, and writes evidence to `.decantr/evidence/latest.json` by default when `--evidence` is used.

`decantr doctor` explains project/workspace state, adoption mode, adoption lane, generated artifacts, typed graph readiness, local law, visual evidence, design authority signals, CI wiring, and an ordered next-step queue. It is the command to reach for when an app is in a monorepo, has stale Decantr files, or someone is not sure what Decantr expects next.

`decantr setup` is non-mutating orientation. In an attached Brownfield app it reflects whether local law is already accepted, so the recommended verify command includes `--local-patterns` only when the project has that layer.

`decantr ci` is the blessed non-mutating automation gate. It runs the Project Health surface with adoption-mode-aware local law checks and emits a schema-backed CI report. `decantr ci init` writes root GitHub workflows or portable generic snippets using the detected package manager and pinned local CLI command instead of `@latest`; if the root manifest has not pinned Decantr yet, it prints the exact install command first.

`decantr health` remains the advanced project observability primitive. It composes the existing verifier audit, guard checks, brownfield route drift checks, runtime evidence, component reuse drift, accepted style bridge drift, accepted behavior-obligation checks, typed Contract graph freshness, and execution-pack files into a `ProjectHealthReport` with a status, score, route summary, pack summary, findings, stable diagnostic codes, typed repair IDs, and AI-ready remediation prompts. The graph freshness slice emits `GRAPH001` / `regenerate-typed-graph` when an attached app has missing, stale, or non-derivable `.decantr/graph` artifacts. The component reuse slice emits `COMP001` / `import-existing-component` when production source locally redeclares a common primitive that already exists as an exported reusable component, and `COMP010` / `replace-raw-control-with-local-component` when production JSX renders raw controls such as `<button>` while the project already owns a reusable primitive. The behavior-obligation slice emits `A11Y010`, `A11Y011`, `INT010`, `INT011`, `INT012`, `INT013`, and `COMP020` for high-confidence dialog/form regressions such as missing accessible names, missing label associations, missing visible destructive consequence copy, missing cancel affordances, missing submitting guards, implicit form button types, or bypassed project-owned interaction primitives. The style bridge slice emits `TOKEN010` / `replace-arbitrary-style-with-bridge-token` when production JSX, common class helpers, hardcoded inline color styles, or hardcoded visual values in CSS/module stylesheets bypass `.decantr/style-bridge.json` after it has been accepted as project-owned style authority. The baseline slice emits `VISUAL010` / `review-visual-baseline-drift` when `--since-baseline` detects changed screenshot hashes. When `.decantr/graph/graph.snapshot.json` exists, each finding is anchored to the most specific graph node Decantr can resolve, and JSON, markdown, text output, repair prompts, and Evidence Bundles carry that anchor. `decantr graph` also writes content-addressed history snapshots under `.decantr/graph/snapshots/` so repeated graph runs can be replayed across an AI edit sequence. When `.decantr/analysis.json` exists, `decantr graph` links observed routes/pages to implementation source artifacts and links exported reusable component declarations to their source files. When browser evidence writes `.decantr/evidence/visual-manifest.json`, `decantr graph` ingests it as local route/page Evidence nodes without uploading screenshots. When `.decantr/evidence/latest.json` exists, `decantr graph` can also materialize saved findings, evidence strings, graph anchors, repair IDs, and referenced repair/read target files as typed graph nodes and edges. When `.decantr/health-baseline-diff.json` exists, baseline changed files become file-level temporal evidence in the graph.

```bash
decantr verify
decantr verify --brownfield --local-patterns
decantr verify --brownfield --local-patterns --fail-on warn
decantr verify --base-url http://localhost:3000 --evidence
decantr verify --since-baseline
decantr doctor --project apps/registry
decantr ci --project apps/registry
decantr ci init --project apps/registry
decantr ci init --provider generic --project apps/registry
decantr health
decantr health --format json
decantr health --markdown --output health.md
decantr health --prompt <finding-id>
decantr health --project apps/registry --prompt <finding-id>
decantr health --evidence --output .decantr/evidence/latest.json
decantr health --browser --base-url http://localhost:3000 --evidence
decantr health --save-baseline
decantr health --since-baseline
decantr health --diagnostics --markdown
decantr health --design-tokens .decantr/design/figma-tokens.json
decantr health --json --output decantr-health.json
decantr ci init
decantr ci init --fail-on warn --force
decantr ci init --project apps/registry
decantr ci init --workspace
decantr workspace list
decantr verify --workspace --changed --since origin/main
decantr export --to figma-tokens
```

Use `--json` for machines and schema validation, `--markdown` for summaries, `--evidence` for the privacy-redacted Evidence Bundle, and `--prompt <finding-id>` when you want a scoped remediation prompt for an AI assistant. Use `--diagnostics --json` when automation or agents need the stable diagnostic code and repair ID catalog without running a project audit. The prompt command prints instructions only; it does not modify source files. In monorepos, prompt commands preserve `--project <path>`, include app-prefixed read targets such as `apps/web/DECANTR.md`, and use root-safe runtime commands such as `pnpm --dir apps/web build` so the finding resolves from the same app that produced it. Prompt output includes the stable code and repair ID; if `decantr graph` has generated a snapshot, it also includes the graph node ID, node type, confidence, and snapshot ID for the finding. `--browser` uses a project-local Playwright install and a supplied base URL to capture local route screenshots under `.decantr/evidence/screenshots/` and write `.decantr/evidence/visual-manifest.json`; missing Playwright becomes a visible setup finding/message, not a crash or silent skip. `--save-baseline` writes `.decantr/health-baseline.json`; `--since-baseline` writes `.decantr/health-baseline-diff.json` with changed files, route impact, finding deltas, screenshot hash drift, and contract drift. `--design-tokens <path>` compares a Tokens Studio/Figma token JSON export against Decantr CSS token names. `decantr ci --fail-on error` fails only when blocking errors exist; `decantr ci --fail-on warn` also fails on warnings.

`decantr ci init` installs `.github/workflows/decantr-ci.yml` for GitHub Actions. The generated workflow installs dependencies at the workspace root, writes JSON/markdown CI artifacts, gates with `decantr ci`, appends the markdown report to the GitHub step summary, and uploads both files as artifacts. Use `--force` to replace an existing workflow or `--fail-on warn` for stricter repositories. In monorepos, add `--project <path>` from the repository root; dependency install stays at the root while CI evaluates the app contract and uploads app-scoped artifacts. Use `--workspace` to generate an aggregate gate. Use `--provider generic` for Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deployment tools. Generated CI uses the pinned local package-manager command and does not depend on `@latest`. Project Health remediation prompts are also monorepo-aware, so missing-pack fixes use `apps/web/decantr.essence.json` and CI recommendations include `--project apps/web`.

`decantr workspace` is the monorepo reliability namespace. Before attach, `workspace list` shows app candidates. After attach, it also discovers Decantr projects from `.decantr/workspace.json` or by finding `decantr.essence.json` files, and it distinguishes "attach another app" from the empty-workspace first attach. Workspace health runs projects with deterministic ordering, concurrency, per-project timeout, failure isolation, and aggregate JSON, and can limit a run to changed projects:

```bash
decantr workspace list
decantr workspace health
decantr workspace health --json --output .decantr/workspace-health.json
decantr verify --workspace --changed --since origin/main
```

In observed Brownfield projects, common section shorthands are accepted for page and feature additions when they resolve unambiguously. For example, `decantr add page app/settings --route /settings --project apps/web` and `decantr add feature saved-recipes --section app --project apps/web` resolve `app` to the single primary section, such as `observed-primary`, so docs and LLM prompts do not have to guess generated section IDs first.

`decantr studio` starts a local-only dashboard powered by the same report. It uses Node built-ins only and serves `GET /`, `GET /api/health`, and `POST /api/refresh`.

```bash
decantr studio
decantr studio --port 4319 --host 127.0.0.1
decantr studio --report decantr-health.json
decantr studio --workspace
```

Studio is for local triage, not Decantr admin telemetry. The Overview keeps the first decision simple: pick the issue to fix first, review the full AI repair prompt before copying it, switch to manual guidance or commands, and expand project details when route/runtime/pack evidence matters. The tabs cover Overview, Routes, Drift, Findings, Remediation, CI, and Packs without uploading source code, prompts, file paths, or project data.

Workspace Studio uses `decantr workspace health` behind `GET /api/workspace` and `POST /api/workspace/refresh` so large monorepos can triage many Decantr projects from one local dashboard.

Use report mode for customer-controlled reporting from CI artifacts:

```bash
decantr health --json --output decantr-health.json
decantr studio --report decantr-health.json
```

If the project has explicitly enabled Decantr CLI telemetry, `new --telemetry`, `init --telemetry`, `analyze`, `check --telemetry`, `health`, and `studio` emit only aggregate product-activation metadata such as lifecycle command outcome, analyze counts, status, score, finding counts, CI failure outcome, Studio usage, and remediation prompt requests. They never upload the health report, finding evidence, local paths, route names, source code, package names, or prompt text.

## Opted-In Telemetry Identity

`decantr telemetry` lets users inspect and link the opaque install/project ids used by opted-in CLI telemetry. This is how customer org attribution becomes durable without collecting repository names, local paths, source code, prompts, private package slugs, emails, or secrets.

```bash
decantr telemetry status
decantr telemetry status --json
decantr telemetry explain
decantr telemetry explain --json
decantr login --api-key=<key>
decantr telemetry link --enable --org <org-slug>
```

`telemetry link` calls the hosted `/v1/me/telemetry-link` endpoint with only opaque ids, optional org slug, and optional label. The API verifies org membership, writes `telemetry_identity_aliases`, clears the actor-resolution cache, audit logs the change, and emits `telemetry.identity_linked`.

`telemetry explain` prints the CLI event catalog subset, aggregate field categories, current opaque ids if they already exist, and the explicit never-collected list. It is designed for security review and customer trust conversations before a team opts in.

## Content Health

`decantr content check` is the preferred content-author workflow for vocabulary repositories such as `decantr-content`. `decantr content-health` remains as a backward-compatible primitive. Content Health is separate from Project Health: Project Health checks an end-user app against its Decantr contract, while Content Health checks published content inputs before they flow into the hosted registry.

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

The report validates local `patterns/`, `themes/`, `blueprints/`, `archetypes/`, and `shells/` against the published registry schemas, checks hard references such as blueprint themes and composed archetypes, summarizes softer generation-coverage gaps such as missing pattern coverage, and emits AI-ready remediation prompts. It does not call the hosted registry by default; use the existing registry drift audits when you need live publish parity.

## Greenfield Certification

Use the built-in certification harness before releases when you want to prove that representative blueprints still scaffold into runnable starter projects:

```bash
pnpm --filter @decantr/cli certify:blueprints
```

By default it certifies `portfolio`, `producer-studio`, and `agent-marketplace` by:

- running `decantr new` in fresh temp directories
- seeding offline content from `DECANTR_CONTENT_DIR` or a sibling `decantr-content` checkout
- verifying the starter runtime files and router mode match the generated essence
- running `npm run build` in each scaffolded project

Override the matrix or emit JSON when needed:

```bash
pnpm --filter @decantr/cli certify:blueprints -- --blueprints=portfolio,legal-research --json
```

Offline blueprint scaffolding expects a real local content source:

```bash
DECANTR_CONTENT_DIR=/path/to/decantr-content decantr new my-app --blueprint=esports-hq --offline
```

If a requested offline blueprint, archetype, or theme cannot be resolved from local cache/custom content or `DECANTR_CONTENT_DIR`, the CLI now stops explicitly instead of silently falling back to the default scaffold.

Run `decantr sync` before offline-heavy or CI-heavy workflows that depend on hosted certified vocabulary content. Sync paginates the official registry list endpoints, then fetches and stores each item by slug as a full content record under `.decantr/cache/@official/`. That keeps guard checks, Project Health, and context generation aligned with the canonical vocabulary contract instead of abbreviated public list summaries.

## Workflow Certification

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
5. matching `page-*-pack.md` files before route work

Treat the compiled execution packs as the source of truth. Use the narrative docs as secondary explanation, start with the shell and route structure first, and run `decantr check` plus `decantr audit` after implementation.

For a broader health pass, run `decantr verify` after `refresh` or before opening a pull request, and run `decantr ci` inside CI. Install the default GitHub Actions gate with `decantr ci init`. Findings include remediation commands and can be turned into focused AI prompts with `decantr health --prompt <finding-id>`.

For cold-start harness or certification runs, use only the scaffolded workspace files as the contract. If local scaffold files disagree, stop and report the mismatch rather than relying on repo-global Decantr assumptions.

## Related Packages

- `@decantr/essence-spec` for schema and guard validation
- `@decantr/registry` for registry contracts and API access
- `@decantr/verifier` for audit and critique

## Docs

- [Decantr root README](https://github.com/decantr-ai/decantr/blob/main/README.md)
- [Package support matrix](https://github.com/decantr-ai/decantr/blob/main/docs/reference/package-support-matrix.md)

## License

MIT
