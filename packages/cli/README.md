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
npx @decantr/cli new my-app --blueprint=esports-hq
```

Use `decantr setup` when you are unsure which path applies. It detects whether the repo is empty, already attached, or a Brownfield app and recommends the next command.
Use `decantr new` for a greenfield workspace in a fresh directory. With a blueprint/archetype it uses the runnable adapter and Decantr CSS; without registry content it creates a contract-only workspace unless you explicitly pass `--adoption=decantr-css`.
Use `decantr adopt` when you already have an app and want Decantr governance without adopting a blueprint. Brownfield attach is proposal-driven: Decantr inventories the app, writes an observed essence proposal, and only applies it when you explicitly accept or merge it.
Use `decantr task` before asking an LLM to modify a route, and `decantr verify` after the edit. Use `decantr codify --from-audit` when you want project-owned UI patterns and local rules such as button/card/shell/theme standards to appear in future task context and verification.
Use `decantr init`, `decantr analyze`, `decantr check`, and `decantr health` as advanced primitives when you need direct control over one step.

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
decantr adopt --yes
decantr codify --from-audit
decantr codify --accept
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
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
```

Assistant rule integration is preview-first: `--assistant-bridge=preview` writes `.decantr/context/assistant-bridge.md`, `decantr rules preview` prints the bridge, and `--assistant-bridge=apply` or `decantr rules apply` mutates supported rule files with idempotent marked blocks.

Brownfield analysis also writes `.decantr/doctrine-map.json`, a ranked source-precedence map across security/data, architecture, design-system, workflow/CI, feature/business, assistant-specific, stale, and unsafe-to-cite evidence. It also writes `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`. The proposal groups routes into observed semantic domains such as auth, RBAC, billing, reporting, facilities, settings, and public surfaces across Next App/Pages Router, React Router, Angular Router, SvelteKit, Vue Router, and Nuxt file routes. Existing styling systems such as Tailwind, Bootstrap, MUI, Chakra, plain CSS, and Decantr CSS are observed as evidence instead of replaced. Theme variants are observed in the theme inventory without changing Essence V4. `decantr codify --from-audit` proposes `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json`; after review, `decantr codify --accept` promotes `.decantr/local-patterns.json` and `.decantr/rules.json`. `decantr verify --brownfield --local-patterns` uses the Brownfield guard layer plus accepted local law to flag actionable missing doctrine coverage, unsafe context, missing assistant bridges, style drift, raw local-rule violations, and unsafe defaults without treating current database migrations as stale docs.

## What It Does

- scaffolds Decantr projects from blueprints, archetypes, or prompts
- guides users through human workflow commands: setup, adopt, task, verify, and codify
- supports explicit workflow lanes: greenfield blueprint, greenfield contract-only, brownfield adoption, and hybrid composition
- generates execution-pack context files for AI coding assistants
- audits projects against Decantr contracts
- produces local Project Health reports, Evidence Bundles, workspace health, and a localhost Studio dashboard for end-user drift triage
- audits local registry content repositories with Content Health reports for schema, reference, and quality coverage
- searches the registry and showcase benchmark corpus
- filters blueprints through public portfolio sets: `All`, `Featured`, `Certified`, and opt-in `Labs`
- syncs paginated hosted registry content into a full slug-keyed local cache for offline guards and context generation
- validates, refreshes, and maintains `decantr.essence.json`

## Common Commands

```bash
decantr setup
decantr new my-app --blueprint=esports-hq
decantr adopt --yes
decantr adopt --project apps/web --yes
decantr codify --from-audit
decantr codify --accept
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
decantr verify --base-url http://localhost:3000 --evidence
decantr init --existing --blueprint=esports-hq
decantr init --workflow=greenfield --adoption=contract-only
decantr rules preview
decantr rules apply
decantr magic "AI-native analytics workspace"
decantr audit
decantr check
decantr verify --ci --fail-on error
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
decantr list patterns
decantr showcase verification --json
```

## Project Health And Studio

`decantr verify` is the workflow command most users should run locally and in CI. It delegates to Project Health, can add Brownfield guard validation with `--brownfield`, requires an accepted local pattern pack with `--local-patterns`, scans `.decantr/rules.json` when present, supports workspace mode, and writes evidence to `.decantr/evidence/latest.json` by default when `--evidence` is used.

`decantr health` remains the advanced project observability primitive. It composes the existing verifier audit, guard checks, brownfield route drift checks, runtime evidence, and execution-pack files into a `ProjectHealthReport` with a status, score, route summary, pack summary, findings, and AI-ready remediation prompts.

```bash
decantr verify
decantr verify --brownfield --local-patterns
decantr verify --brownfield --local-patterns --fail-on warn
decantr verify --base-url http://localhost:3000 --evidence
decantr verify --since-baseline
decantr verify init-ci --project apps/registry
decantr health
decantr health --format json
decantr health --markdown --output health.md
decantr health --ci --fail-on error
decantr health --ci --fail-on warn
decantr health --prompt <finding-id>
decantr health --evidence --output .decantr/evidence/latest.json
decantr health --browser --base-url http://localhost:3000 --evidence
decantr health --save-baseline
decantr health --since-baseline
decantr health --design-tokens .decantr/design/figma-tokens.json
decantr health --json --output decantr-health.json
decantr verify init-ci
decantr verify init-ci --fail-on warn --cli-version latest --force
decantr verify init-ci --project apps/registry
decantr verify init-ci --workspace
decantr workspace list
decantr verify --workspace --changed --since origin/main
decantr export --to figma-tokens
```

Use `--json` for machines and schema validation, `--markdown` for CI summaries, `--evidence` for the privacy-redacted Evidence Bundle, and `--prompt <finding-id>` when you want a scoped remediation prompt for an AI assistant. The prompt command prints instructions only; it does not modify source files. `--browser` uses a project-local Playwright install and a supplied base URL to capture local route screenshots under `.decantr/evidence/screenshots/` and write `.decantr/evidence/visual-manifest.json`; missing Playwright becomes a setup finding, not a crash. `--save-baseline` writes `.decantr/health-baseline.json`; `--since-baseline` writes `.decantr/health-baseline-diff.json` with changed files, route impact, finding deltas, screenshot hash drift, and contract drift. `--design-tokens <path>` compares a Tokens Studio/Figma token JSON export against Decantr CSS token names. `--ci --fail-on error` fails only when blocking errors exist; `--ci --fail-on warn` also fails on warnings.

`decantr verify init-ci` installs `.github/workflows/decantr-health.yml` for GitHub Actions. The generated workflow installs project dependencies, writes JSON/markdown health artifacts, gates with the Project Health CI command, appends the markdown report to the GitHub step summary, and uploads both files as artifacts. Use `--force` to replace an existing workflow, `--fail-on warn` for stricter repositories, or `--cli-version <version|latest>` to pin the package used by CI. In monorepos, add `--project <path>` from the repository root; dependency install stays at the root while health runs inside the app contract and uploads artifacts from that project path. Use `--workspace` to generate an aggregate gate that runs `decantr workspace health` from the repository root and uploads `.decantr/workspace-health.json` plus `.decantr/workspace-health.md`.

`decantr workspace` is the monorepo reliability namespace. Before attach, `workspace list` shows app candidates. After attach, it also discovers Decantr projects from `.decantr/workspace.json` or by finding `decantr.essence.json` files. Workspace health runs projects with deterministic ordering, concurrency, per-project timeout, failure isolation, and aggregate JSON, and can limit a run to changed projects:

```bash
decantr workspace list
decantr workspace health
decantr workspace health --json --output .decantr/workspace-health.json
decantr verify --workspace --changed --since origin/main
```

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

`decantr content check` is the preferred content-author workflow for registry content repositories such as `decantr-content`. `decantr content-health` remains as a backward-compatible primitive. Content Health is separate from Project Health: Project Health checks an end-user app against its Decantr contract, while Content Health checks published content inputs before they flow into the hosted registry.

```bash
decantr content check
decantr content check --ci --fail-on error
decantr content-health
decantr content-health --json
decantr content-health --markdown --output content-health.md
decantr content-health --ci --fail-on error
decantr content-health --ci --fail-on warn
decantr content-health --prompt <finding-id>
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

Run `decantr sync` before offline-heavy or CI-heavy workflows that depend on hosted registry content. Sync paginates the official registry list endpoints, then fetches and stores each item by slug as a full content record under `.decantr/cache/@official/`. That keeps guard checks, Project Health, and context generation aligned with the canonical registry contract instead of abbreviated public list summaries.

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

For a broader health pass, run `decantr verify` after `refresh`, before opening a pull request, or inside CI. Install the default GitHub Actions gate with `decantr verify init-ci`. Findings include remediation commands and can be turned into focused AI prompts with `decantr health --prompt <finding-id>`.

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
