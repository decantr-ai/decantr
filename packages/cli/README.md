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
npx @decantr/cli new my-app --blueprint=agent-marketplace
```

Use `decantr new` for a greenfield workspace in a fresh directory. With a blueprint/archetype it uses the runnable adapter and Decantr CSS; without registry content it creates a contract-only workspace unless you explicitly pass `--adoption=decantr-css`.
Use `decantr analyze` first when you already have an app and want Decantr governance without adopting a blueprint. Brownfield attach is proposal-driven: Decantr inventories the app, writes an observed essence proposal, and only applies it when you explicitly accept or merge it.
Use `decantr init` to attach Decantr contract/context files to an existing project or to create a contract-only workspace.

Current starter adapter availability:

- `react-vite` is the runnable bootstrap adapter in this wave
- `next-app` is the runnable Next.js App Router adapter
- other contract targets use the `generic-web` contract-only adapter until their runnable adapters land

Explicit workflow/adoption flags:

```bash
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

Monorepos store both `workspaceRoot` and `appRoot`. In non-interactive workspace-root runs with multiple app candidates, pass `--project=<path>` so Decantr attaches to the intended app.

Assistant rule integration is preview-first: `--assistant-bridge=preview` writes `.decantr/context/assistant-bridge.md`, `decantr rules preview` prints the bridge, and `--assistant-bridge=apply` or `decantr rules apply` mutates supported rule files with idempotent marked blocks.

Brownfield analysis also writes `.decantr/doctrine-map.json`, a ranked source-precedence map across security/data, architecture, design-system, workflow/CI, feature/business, assistant-specific, stale, and unsafe-to-cite evidence. The proposal groups routes into observed semantic domains such as auth, RBAC, billing, reporting, facilities, settings, and public surfaces across Next App/Pages Router, React Router, Angular Router, SvelteKit, Vue Router, and Nuxt file routes. Existing styling systems such as Tailwind, Bootstrap, MUI, Chakra, plain CSS, and Decantr CSS are observed as evidence instead of replaced. `decantr check --brownfield` uses the doctrine map to flag actionable missing doctrine coverage, unsafe context, missing assistant bridges, style drift, and unsafe defaults without treating current database migrations as stale docs.

## What It Does

- scaffolds Decantr projects from blueprints, archetypes, or prompts
- supports explicit workflow lanes: greenfield blueprint, greenfield contract-only, brownfield adoption, and hybrid composition
- generates execution-pack context files for AI coding assistants
- audits projects against Decantr contracts
- produces local Project Health reports and a localhost Studio dashboard for end-user drift triage
- audits local registry content repositories with Content Health reports for schema, reference, and quality coverage
- searches the registry and showcase benchmark corpus
- validates, refreshes, and maintains `decantr.essence.json`

## Common Commands

```bash
decantr new my-app --blueprint=agent-marketplace
decantr analyze
decantr init --existing --accept-proposal
decantr check --brownfield
decantr init --existing --blueprint=agent-marketplace
decantr init --workflow=greenfield --adoption=contract-only
decantr rules preview
decantr rules apply
decantr magic "AI-native analytics workspace"
decantr audit
decantr check
decantr health --ci --fail-on error
decantr studio --port 4319 --host 127.0.0.1
decantr content-health --ci --fail-on error
decantr registry summary --namespace @official --json
decantr showcase verification --json
```

## Project Health And Studio

`decantr health` is the local project observability command. It composes the existing verifier audit, guard checks, brownfield route drift checks, runtime evidence, and execution-pack files into a `ProjectHealthReport` with a status, score, route summary, pack summary, findings, and AI-ready remediation prompts.

```bash
decantr health
decantr health --format json
decantr health --markdown --output health.md
decantr health --ci --fail-on error
decantr health --ci --fail-on warn
decantr health --prompt <finding-id>
decantr health init-ci
decantr health init-ci --fail-on warn --cli-version latest --force
decantr health init-ci --project apps/registry
```

Use `--json` for machines and schema validation, `--markdown` for CI summaries, and `--prompt <finding-id>` when you want a scoped remediation prompt for an AI assistant. `--ci --fail-on error` fails only when blocking errors exist; `--ci --fail-on warn` also fails on warnings.

`decantr health init-ci` installs `.github/workflows/decantr-health.yml` for GitHub Actions. The generated workflow installs project dependencies, writes `decantr-health.json`, gates with `decantr health --ci --fail-on error --markdown --output decantr-health.md`, appends the markdown report to the GitHub step summary, and uploads both files as artifacts. Use `--force` to replace an existing workflow, `--fail-on warn` for stricter repositories, or `--cli-version <version|latest>` to pin the package used by CI. In monorepos, add `--project <path>` from the repository root; dependency install stays at the root while health runs inside the app contract and uploads artifacts from that project path.

`decantr studio` starts a local-only dashboard powered by the same report. It uses Node built-ins only and serves `GET /`, `GET /api/health`, and `POST /api/refresh`.

```bash
decantr studio
decantr studio --port 4319 --host 127.0.0.1
```

Studio is for local triage, not Decantr admin telemetry. The tabs cover Overview, Routes, Drift, Findings, Remediation, CI, and Packs without uploading source code, prompts, file paths, or project data.

If the project has explicitly enabled Decantr CLI telemetry, `new --telemetry`, `init --telemetry`, `check --telemetry`, `health`, and `studio` emit only aggregate product-activation metadata such as lifecycle command outcome, status, score, finding counts, CI failure outcome, Studio usage, and remediation prompt requests. They never upload the health report, finding evidence, local paths, route names, source code, or prompt text.

## Content Health

`decantr content-health` is the local supply-chain observability command for registry content repositories such as `decantr-content`. It is separate from Project Health: Project Health checks an end-user app against its Decantr contract, while Content Health checks published content inputs before they flow into the hosted registry.

```bash
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
DECANTR_CONTENT_DIR=/path/to/decantr-content decantr new my-app --blueprint=agent-marketplace --offline
```

If a requested offline blueprint, archetype, or theme cannot be resolved from local cache/custom content or `DECANTR_CONTENT_DIR`, the CLI now stops explicitly instead of silently falling back to the default scaffold.

## Workflow Certification

The broader workflow matrix now has its own certification entrypoint:

```bash
pnpm --filter @decantr/cli certify:workflows
```

It covers:

- greenfield blueprint bootstrap
- greenfield contract-only
- brownfield `analyze -> init --existing --accept-proposal -> check --brownfield`
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

For a broader health pass, run `decantr health` after `refresh`, before opening a pull request, or inside CI. Install the default GitHub Actions gate with `decantr health init-ci`. Findings include remediation commands and can be turned into focused AI prompts with `decantr health --prompt <finding-id>`.

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
