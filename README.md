# Decantr

**AI Frontend Governance for production codebases touched by AI agents.**

Decantr is the governance layer between product intent and AI-edited frontend code. It gives coding assistants three things they don't have on their own: typed contracts, route-scoped context, and machine-actionable evidence, so UI changes stay coherent instead of drifting prompt by prompt. Decantr 3.9 calls this **Governed Change Proof**: one source-grounded adoption truth, one bounded task capsule, and one fail-closed governance delta around each change. The model still writes the code; Decantr defines the contract, context, authority, and verification loop around it.

> AI generates the interface. Decantr proves, with local evidence, whether the outcome stayed aligned.

## Pick your path

| Path | Use when | Start with |
| --- | --- | --- |
| **[Brownfield adoption](docs/reference/workflow-model.md#brownfield-adoption)** &nbsp;⭐ | Attaching Decantr to an existing Angular/React/Vue/etc. project | `decantr scan` -> `decantr adopt --yes` |
| **[Hybrid operating layer](docs/reference/workflow-model.md#hybrid-operating-layer)** | An attached app wants selected Decantr or project-owned UI law, without source takeover | `decantr codify`, `decantr doctor`, `decantr task` |
| **[Greenfield content contract](#greenfield-content-contracts)** | New project, official content-corpus composition as governance context | `decantr new my-app --blueprint=<id> --workflow=greenfield` |
| **Greenfield contract-only** | New project or repo that wants Decantr governance but no blueprint/runtime takeover | `decantr init --workflow=greenfield --adoption=contract-only` |

---

## Greenfield Content Contracts

### 1. Scaffold from a blueprint

```bash
npx @decantr/cli new my-app --blueprint=esports-hq
cd my-app
```

A blueprint is official corpus content: theme, sections, pages, layouts, voice, and personality that compile into Decantr contracts and execution packs. It is reference material for governance, not a public marketplace or runtime takeover. Try `esports-hq`, `agent-studio`, or `carbon-ai-portal`, or run `decantr list blueprints --blueprint-set featured` to browse the curated set.

> **Adapter availability.** Greenfield defaults to contract-only governance. The legacy `@decantr/css` runnable adapters (`react-vite`, `next-app`, `vanilla-vite`, `vue-vite`, `sveltekit`, `angular`, and `solid-vite`) remain available only when explicitly requested with `--adoption=decantr-css`. Other targets initialize through `generic-web` contract-only mode.

### 2. What just got generated

```
my-app/
├── decantr.essence.json     # the durable contract: theme, sections, routes, features
├── DECANTR.md               # methodology primer your AI assistant reads first
├── .decantr/context/
│   ├── scaffold.md          # full app overview: topology, voice, personality
│   └── section-*.md         # per-section spec: shell, patterns, spacing
└── .decantr/graph/
    ├── graph.snapshot.json  # typed Contract graph with route/source provenance
    └── contract-capsule.json # compact agent cache and source handles
```

Decantr produces the contract and governance context. Your AI assistant produces the implementation through the project's selected runtime and styling system. Decantr CSS files are generated only by the explicit legacy `--adoption=decantr-css` path.

### 3. Hand it to your AI assistant

Open the project in Claude Code, Cursor, Windsurf, or any AI-aware editor. For Cursor, run `decantr connect cursor` once from the opened workspace; in monorepos use `decantr connect cursor --project apps/web`. It writes `.cursor/mcp.json` and `.cursor/rules/decantr.mdc`, preserving existing MCP servers, so Cursor Agent knows to call Decantr task context before route edits. Other assistants can read `DECANTR.md` first for the methodology, then load section context files on demand. Optional assistant bridges are workflow-specific: contract-only Greenfield rules cite Essence, narrative context, and the Contract capsule; corpus-backed Greenfield/Hybrid rules cite execution packs; Brownfield rules cite observed analysis and doctrine artifacts. For route-level work, run `decantr task <route> "<intent>"` before editing. In 3.9 that compatibility response is built from `TaskCapsuleV1`: the discovered implementation file is the required rank-one read target, authority and changed-file impact are explicit, official guidance carries content identity and digest provenance, and the compact canonical payload is bounded to 12,000 UTF-8 bytes / 4,000 deterministic estimated tokens. Task activation emits structured remediation and exits nonzero when the typed graph is missing or stale instead of serving contradictory context.

### 4. Make your first change and verify

```bash
# Edit decantr.essence.json — add a section, swap the theme, etc.
decantr refresh   # regenerate context files from the updated essence
decantr graph     # generate the typed Contract graph, source index, and contract capsule
decantr verify    # run the canonical local reliability gate
decantr verify --evidence
decantr studio    # open the local-only health dashboard
```

`refresh` keeps the generated context files in sync with the essence. `graph` writes `.decantr/graph/graph.snapshot.json`, `.decantr/graph/snapshots/<snapshot-id>.json`, `graph.manifest.json`, `graph.diff.json`, and `contract-capsule.json` for typed agent context and replayable local history. `verify` is the day-to-day reliability gate over Project Health, Brownfield checks, health baselines, and optional evidence; health findings include stable diagnostic codes, typed repair IDs, component reuse drift such as `COMP001`, behavior-obligation drift such as `A11Y010`, and accepted style bridge drift such as `TOKEN010`. For an adopted Brownfield app with a saved baseline, inherited findings remain visible but only new findings determine the `verify --ci` or `decantr ci` exit code. When a graph snapshot exists, findings also include graph anchors back to the contract node they came from. `--evidence` writes the privacy-redacted Evidence Bundle that AI agents and CI can use for repair context. `decantr studio` gives the same signal in a small localhost dashboard, and `decantr studio --workspace` expands that view across many Decantr projects in a monorepo.

> Starting from a different point? See the full [workflow model](docs/reference/workflow-model.md).

---

## The model

Decantr separates design governance into two layers:

- **DNA** — durable visual and system axioms: theme, spacing, motion, accessibility, personality.
- **Blueprint** — product topology: sections, page routes, shells, layouts, features.

That split matters because not every change should be treated the same way. A theme swap or accessibility regression is different from adding an auxiliary section or reshaping a route map. Decantr lets governance be strict where it should be strict (DNA, errors by default) and flexible where it should be flexible (Blueprint, warnings only).

Canonical shapes live in the [published schemas](https://decantr.ai/schemas/); the command-level flow is in the [workflow model](docs/reference/workflow-model.md).

## Surfaces

| Surface | What it does |
| --- | --- |
| CLI | Guides users through workflow commands (`setup`, `adopt`, `doctor`, `task`, `verify`, `resolve`, `ci`, `codify`, `connect cursor`), projects `AdoptionTruthV1`, builds bounded `TaskCapsuleV1` task context, keeps v2 reports as the default, offers explicit CI v3 governed-change proof, and opens read-only Studio locally |
| MCP server | Exposes exactly eight Decantr tools for contracts, bounded task context, graph reads, compatibility content-corpus reads, verification, repair, and explicit contract writes; it does not add a ninth content tool in 3.x |
| Content API | Fly-hosted helper for official corpus search, schemas, intelligence summaries, showcase metadata, and execution-pack compilation |
| Verifier | Canonical owner of `AdoptionTruthV1`, `TaskCapsuleV1`, and `GovernanceDeltaV1`, plus shared discovery, audit, critique, Project Health, Evidence Bundle, stable finding identity, graph anchors, and report schemas |
| Showcase apps | Audited benchmark corpus and verification targets for Decantr-generated scaffolds |

Decantr 3.7 introduced the shared Brownfield discovery substrate that 3.9 composes into `AdoptionTruthV1` across verifier, CLI, MCP, opt-in CI v3, and Studio. `scan`, `setup`, `workspace list`, `adopt`, `doctor`, `task`, `verify`, `ci`, and MCP project/task/evidence reads use the same selected app scope, workspace package-manager evidence, framework, language, route signals, taskable routes, component inventory confidence, styling authority, assistant rules, provenance, and limitations. Route discovery reads formal TanStack source routes instead of generated route trees, resolves nested React Router object routes and lazy implementation files, recognizes Vue Router object routes, and labels pathname-only fallbacks as medium confidence. App scans also inherit repository-level assistant rules such as a root `AGENTS.md`. This is especially important in mixed monorepos: a React/Vite app beside an Angular app should scan as React/TypeScript/pnpm when `--project apps/web` targets the React app, not as the repository root or sibling framework. `scan --json` remains `scan-report.v2`; 3.9 does not silently change existing report contracts.

Security review starts with the installed npm surface, not the whole monorepo. The package permission matrix documents filesystem, network, process, telemetry, hosted-upload, and MCP write-tool behavior for every public package: [docs/reference/security-permissions.md](docs/reference/security-permissions.md).

## Packages

| Package | Role |
| --- | --- |
| `@decantr/essence-spec` | Essence schemas, validation, migration, and TypeScript types |
| `@decantr/content` | Canonical official corpus, content identities/digests, schemas, validation, API clients, search, resolution, ranking, wiring, and content health helpers |
| `@decantr/registry` | Thin legacy facade that re-exports content-owned clients, types, and helpers for Decantr 3.x compatibility; first-party integrations use `@decantr/content` |
| `@decantr/css` | Legacy optional CSS atom adapter; not a default adoption path |
| `@decantr/core` | Execution-pack compiler primitives, typed Contract graph builders, graph diffs, snapshot history, hybrid graph ranking, evidence/proof ingestion, and Contract capsules |
| `@decantr/telemetry` | Optional event contracts and caller-controlled sinks; no hosted default collection |
| `@decantr/verifier` | Shared discovery and verification plus the canonical `AdoptionTruthV1`, `TaskCapsuleV1`, `GovernanceDeltaV1`, v2 Evidence Bundle, loop readiness, authority resolution, stable finding identity, and report-schema engine |
| `@decantr/mcp-server` | MCP delivery surface for assistants and agent tooling |
| `@decantr/cli` | Local contract, content, Project Health CI/Studio, audit, and maintenance workflows |
| `@decantr/vite-plugin` | Experimental local guard feedback overlay for Vite |

Full release/support status lives in [docs/reference/package-support-matrix.md](docs/reference/package-support-matrix.md).

## Repo layout

| Path | Role |
| --- | --- |
| `apps/api` | Fly-hosted content API for corpus, schemas, search, intelligence, showcase metadata, and execution packs |
| `apps/showcase-host` | Shared Vite host for live blueprint showcase capsules |
| `apps/showcase/` | Showcase manifest and verification reports used by the content API |
| `packages/*` | Core Decantr packages and supporting runtime surfaces |
| `docs/` | Public docs, audits, architecture notes, schemas, and runbooks |
| `scripts/` | Audit, release, showcase, schema, and packaging automation |

Showcase capsule architecture is documented in [docs/reference/showcase-host.md](docs/reference/showcase-host.md).

## Development

Requires **Node.js `>=20.19.0`** and **pnpm `>=9`**.

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm audit:public-api
pnpm audit:package-permissions
pnpm audit:content-package
pnpm showcase:verify:shortlist
pnpm benchmark:realworld-corpus -- --config scripts/realworld-corpus.first-mile.json --cli packages/cli/dist/index.js --out /tmp/decantr-realworld-corpus-3.9
pnpm benchmark:post-publish-adoption -- --cli-package @decantr/cli@3.9.0 --out /tmp/decantr-post-publish-3.9.0
pnpm release:verify
pnpm release:closeout -- --version 3.9.0
```

Decantr 3.9 is the Governed Change Proof line. The approved scope and qualification standard are recorded in [docs/programs/2026-07-16-decantr-3-9-adoption-proof-program.md](docs/programs/2026-07-16-decantr-3-9-adoption-proof-program.md). The route and machine lanes are complete; the two-human finding lane is not. Because Decantr has one human maintainer, stable 3.9.0 publication may use the explicit sole-maintainer waiver without claiming human precision, recall, release qualification, or adoption proof.

### Release stewardship

Release work is script-led. Use `pnpm release:commands` for publish handoff, `pnpm release:verify` for public npm verification, and `pnpm release:closeout` before calling a release done. Closeout verifies npm version/dist-tag parity plus git tag and release-note parity so versioned docs cannot drift away from origin tags. After closeout, `pnpm release:announce -- --version X.Y.Z --send` can dispatch the changelog to `community-ops` for Discord posting. See [docs/runbooks/release-stewardship.md](docs/runbooks/release-stewardship.md).

## More CLI

Intent and discovery:

```bash
decantr setup
decantr magic "AI chatbot with a bold terminal-inspired workspace"
decantr search dashboard
decantr list blueprints --blueprint-set certified
decantr list blueprints --blueprint-set labs
decantr suggest leaderboard
decantr suggest "recipe feed with infinite scroll" --route /feed --from-code
decantr suggest --from-code --file app/page.tsx --project apps/web
decantr suggest "standardize buttons" --project apps/web
```

Source-code suggestions rank official content patterns and accepted `.decantr/local-patterns.json` against the selected app's file contents. From an app root, `decantr suggest "button" --from-code --file src/App.tsx` surfaces project-owned law without extra flags; from a monorepo root, add `--project apps/web`.

Brownfield adoption:

```bash
decantr scan
decantr adopt --yes
decantr studio
decantr doctor
decantr codify --from-audit --style-bridge
decantr codify --map-pattern hero
decantr codify --accept --confirm-reviewed
decantr graph
decantr graph --file src/app/page.tsx --impact --json
decantr resolve
decantr connect cursor
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
decantr verify --since-baseline
```

In a monorepo, install Decantr at the workspace root, but attach it to an app:

```bash
decantr setup
decantr workspace list
decantr scan --project apps/web
decantr adopt --project apps/web --yes
cd apps/web && decantr studio
decantr doctor --project apps/web
decantr codify --from-audit --style-bridge --project apps/web
decantr codify --map-pattern hero --project apps/web
decantr graph --project apps/web
decantr graph --project apps/web --file src/app/page.tsx --impact --json
decantr resolve --project apps/web
decantr connect cursor --project apps/web
decantr task /feed "add saved recipe actions" --project apps/web
decantr verify --brownfield --local-patterns --project apps/web
decantr ci init --project apps/web
decantr ci --project apps/web
decantr add page app/settings --route /settings --project apps/web
decantr health --project apps/web --prompt <finding-id>
```

For observed Brownfield apps, `app/settings` can resolve to the single primary section, such as `observed-primary`, so route additions remain ergonomic after attach.

If the app is already running and you want local screenshots, add visual evidence later:

```bash
decantr verify --project apps/web --base-url http://localhost:3000 --evidence
```

`analyze` now writes Brownfield intelligence artifacts in addition to the proposal: `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`. Essence V4 stays unchanged; multi-theme apps are observed in the inventory and kept as local task context until the team explicitly promotes that model. When local law, a style bridge, or the explicit legacy Decantr CSS path is accepted, Decantr calls that out as Hybrid instead of pretending every existing app is still only contract-only.

`scan` is the safe first look: it is read-only and tells you whether Decantr sees a plausible UI app before anything is written. `adopt` orchestrates the primitive Brownfield flow (`analyze`, proposal acceptance, optional content pack hydration when online, first typed Contract graph baseline, Project Health, optional browser evidence, optional CI) so users do not need to memorize the internal command chain. Greenfield `init` also writes the first graph so its generated task-first guidance is immediately usable. Shared source discovery supplies route/source provenance to the graph even when no Brownfield analysis exists. When the host uses Prettier or Oxfmt, adoption also adds generated Decantr artifacts to `.prettierignore` so governance output does not break the app's formatter gate. In contract-only/offline adoption, content packs can be deferred; `doctor`, `health`, and `refresh --check` treat missing packs as optional context unless a present `pack-manifest.json` references missing files. `studio` gives a local visual view of what Decantr found, while `doctor` explains the active adoption lane. `codify --from-audit` proposes project-owned local law; `codify --style-bridge` separately proposes mappings from Decantr intent to project-owned tokens/classes; and `codify --map-pattern <slug>` maps official content guidance into an advisory local-law proposal. Acceptance is intentionally two-step: `codify --accept --confirm-reviewed` promotes reviewed local patterns and rules but leaves any style bridge as a proposal, while `codify --accept --confirm-reviewed --accept-style-bridge` explicitly activates the style bridge and changes the adoption lane. When current typed graph artifacts exist, `task` and MCP task context rank route graph nodes with the task text so matching components, local rules, behavior obligations, findings, evidence, and source artifacts rise before the edit. The primitive commands remain available for advanced and scripted workflows.

Content and verification:

```bash
decantr content summary       --namespace @official --json
decantr content compile-packs decantr.essence.json --write-context
decantr content compile-packs apps/web/decantr.essence.json --write-context
decantr audit src/pages/Home.tsx
decantr audit
decantr showcase verification  --json
```

When an essence path is provided, `--write-context` writes the pack bundle beside that essence file. In monorepos, that means app packs land under `apps/web/.decantr/context`, not the repository root.

Project Health remediation copy follows the same rule: from a monorepo root, pack fixes point at `apps/web/decantr.essence.json`, prompt commands keep `--project apps/web`, task/read paths include `apps/web/...`, and CI prompts point at `decantr ci --project apps/web --fail-on error`. `ci` keeps the v2 report and exit semantics unless `--report-version v3` is explicit. The v3 project report embeds the existing v2 health evidence plus `AdoptionTruthV1` and `GovernanceDeltaV1`; a missing, stale, or incompatible baseline is `not_proven`, not an empty or all-new delta. `task` also prints an authority block so assistants know whether the route is Brownfield contract-only, Hybrid local law, Hybrid style bridge, or explicit legacy Decantr CSS, and it warns before mixing runtimes or adding Decantr CSS to a non-Decantr-CSS app. Advanced app-scoped primitives such as `health`, `status`, `add`, `remove`, `theme`, `export`, `suggest`, and `magic` should target the selected app rather than the workspace root. `setup` becomes a post-adoption dashboard once any app is attached, so it recommends `doctor`, `task`, `verify`, and `ci init` instead of telling users to adopt the same app again.

Project Health, CI, and diagnosis:

```bash
decantr doctor
decantr doctor --project apps/web
decantr verify
decantr verify --base-url http://localhost:3000 --evidence
decantr verify --since-baseline
decantr ci --project apps/web
decantr ci --project apps/web --since origin/main --report-version v3 --json
decantr ci --workspace --changed --since origin/main
decantr ci init --project apps/web
decantr ci init --project apps/web --report-version v3
decantr ci init --workspace
decantr health --format markdown
decantr health --prompt <finding-id>
decantr health --evidence --output .decantr/evidence/latest.json
decantr health --browser --base-url http://localhost:3000 --evidence
decantr health --design-tokens .decantr/design/figma-tokens.json
decantr verify --workspace --changed --since origin/main
decantr export --to figma-tokens
decantr health --json --output decantr-health.json
decantr studio --port 4319 --host 127.0.0.1
decantr studio --workspace
decantr studio --report decantr-health.json
```

In contract-only Brownfield projects, Decantr may not own `src/styles/tokens.css`; `export --to figma-tokens` is for explicitly adopted legacy Decantr CSS token exports, while project-native token exports remain the app's source of truth unless you adopt a style bridge.

Caller-configured private telemetry:

```bash
decantr telemetry status
decantr telemetry explain
DECANTR_TELEMETRY_ENDPOINT=https://telemetry.example/v1/events decantr init --telemetry
decantr telemetry link --api-url https://telemetry.example/v1 --api-key <key>
```

Decantr does not operate a hosted telemetry sink. Setting `telemetry: true` records a local preference, but the CLI sends nothing and creates no opaque telemetry identifiers unless `DECANTR_TELEMETRY_ENDPOINT` points to a caller-controlled sink. Private deployments can additionally configure identity linking with an explicit `--api-url`; the Decantr content API does not provide that route. When configured, telemetry stays product-level: command names, aggregate lifecycle counts, content sources, Project Health scores/counts, and adoption workflow signals. It never includes source code, prompts, raw paths, emails, private package slugs, or health report contents.

Official content supply chain:

```bash
decantr content check
decantr content check --ci --fail-on error
decantr content-health
decantr content-health --markdown --output content-health.md
decantr content-health --ci --fail-on error
decantr content check --prompt <finding-id>
```

## FAQ

### How does Decantr keep AI or agent work tied back to the original spec?

You cannot truly force an LLM to follow a spec. Decantr gives the assistant a durable contract, scoped context, and drift checks so implementation stays tied to the intended product shape.

```bash
decantr refresh
decantr verify
decantr audit
decantr health
```

If the product direction changes, update Decantr deliberately, then regenerate and check:

```bash
decantr add page dashboard/reports
decantr refresh
decantr verify
```

### How do I open Decantr Studio?

Run Studio from the app root, where `decantr.essence.json` lives:

```bash
decantr studio
```

If the default port is busy:

```bash
decantr studio --host 127.0.0.1 --port 4320
```

Studio is local-only and read-only with respect to project files. Its Control Room can render current Project Health, `AdoptionTruthV1`, and an in-memory `GovernanceDeltaV1`, or read saved project-mode Project Health v2 and CI v2/v3 artifacts. Refresh recomputes or rereads state; it does not run adoption, repair, acceptance, migration, builds, package-manager commands, agents, or verification on the user's behalf. Workspace mode is available with `decantr studio --workspace` when a repo contains many Decantr projects.

`decantr health --prompt <finding-id>` prints a focused repair prompt for the assistant doing the implementation. It does not edit files by itself; use Studio's copy buttons or paste the printed prompt into your AI coding workflow, then rerun Project Health.

To view a CI-produced report artifact without scanning a checkout:

```bash
decantr health --json --output decantr-health.json
decantr ci --report-version v3 --json --output decantr-ci-v3.json
decantr studio --report decantr-ci-v3.json
```

Studio is for interactive triage; `decantr ci --fail-on error` is the pull-request gate.

See the full [FAQ](docs/faq.md) for common setup, brownfield, Studio, migration, CI, and drift questions.

## Links

- Discord — [discord.gg/WeDpBd4xFU](https://discord.gg/WeDpBd4xFU)
- FAQ — [docs/faq.md](docs/faq.md)
- Monorepos — [docs/guides/monorepos.md](docs/guides/monorepos.md)
- Published schemas — [decantr.ai/schemas](https://decantr.ai/schemas/)
- Project Health — [docs/reference/project-health.md](docs/reference/project-health.md)
- Command surface — [docs/reference/command-surface.md](docs/reference/command-surface.md)
- Content Health — [docs/reference/content-health.md](docs/reference/content-health.md)
- Workflow model — [docs/reference/workflow-model.md](docs/reference/workflow-model.md)
- Content API reference — [docs/reference/registry-public-api.md](docs/reference/registry-public-api.md)
- Package support matrix — [docs/reference/package-support-matrix.md](docs/reference/package-support-matrix.md)

## Contributing

Contributions are welcome. The most useful repo context lives in `docs/` — especially the architecture notes, audits, runbooks, and package support matrix.

Use [Discord](https://discord.gg/WeDpBd4xFU) for quick setup help, showcase feedback, and live community discussion. Keep bugs, feature requests, and durable decisions in GitHub issues, PRs, or docs.

## License

MIT. The source repositories are MIT licensed; hosted services such as the content API may publish separate service terms without changing the source-code license.
