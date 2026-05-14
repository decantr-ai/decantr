# Decantr

**Evidence-backed design intelligence, governance, and verification for AI-generated UI.**

Decantr is the contract layer between product intent and AI-generated implementation. It gives coding assistants three things they don't have on their own — structured design inputs, registry-backed UI knowledge, and scoped context files — so they build coherent product surfaces instead of improvising screen by screen. Think of it as OpenAPI for AI-generated UI: the model still writes the code, but Decantr defines the shape, vocabulary, and checks around it.

> AI generates the interface. Decantr proves, with local evidence, whether the outcome stayed aligned.

## Pick your path

| Path | Use when | Start with |
| --- | --- | --- |
| **[Greenfield blueprint](#greenfield-blueprint)** &nbsp;⭐ | New project, published app composition as the starting point | `decantr new my-app --blueprint=<id> --workflow=greenfield --adoption=decantr-css` |
| **Greenfield contract-only** | New project or repo that wants Decantr governance but no blueprint/runtime takeover | `decantr init --workflow=greenfield --adoption=contract-only` |
| **[Brownfield adoption](docs/reference/workflow-model.md#brownfield-adoption)** | Attaching Decantr to an existing Angular/React/Vue/etc. project | `decantr adopt --yes` |
| **[Hybrid composition](docs/reference/workflow-model.md#hybrid-composition)** | Layering sections, themes, or features into an attached project | `decantr add/remove`, `decantr theme switch`, `decantr registry` |

---

## Greenfield blueprint

### 1. Scaffold from a blueprint

```bash
npx @decantr/cli new my-app --blueprint=esports-hq
cd my-app
```

A blueprint is a published app composition — theme, sections, pages, layouts, voice, and personality. The public registry now keeps blueprint discovery intentionally small: **Featured** and **Certified** are the strongest default picks, **All** shows supported contracts, and **Labs** is opt-in for promising but less-proven directions. Try `esports-hq`, `agent-studio`, or `registry-platform` to start, or run `decantr list blueprints --blueprint-set featured` to browse the curated set.

> **Adapter availability.** `react-vite`, `next-app`, `vanilla-vite`, `vue-vite`, `sveltekit`, `angular`, and `solid-vite` are certified runnable starter adapters. Other contract targets remain valid Decantr targets but initialize through `generic-web` contract-only mode — Decantr writes the contract, you own the runtime.

### 2. What just got generated

```
my-app/
├── decantr.essence.json     # the durable contract: theme, sections, routes, features
├── DECANTR.md               # methodology primer your AI assistant reads first
├── .decantr/context/
│   ├── scaffold.md          # full app overview: topology, voice, personality
│   └── section-*.md         # per-section spec: shell, patterns, spacing
└── src/styles/
    ├── tokens.css           # CSS variables from the theme
    ├── treatments.css       # shared visual treatment classes
    └── decorators.css       # theme-specific decorator classes
```

Decantr produces the contract. Your AI assistant produces the implementation against it.

### 3. Hand it to your AI assistant

Open the project in Claude Code, Cursor, Windsurf, or any AI-aware editor. Your assistant reads `DECANTR.md` first for the methodology, then loads section context files on demand as it works through each part of the app. The split keeps the assistant focused on the right scope at the right time.

### 4. Make your first change and verify

```bash
# Edit decantr.essence.json — add a section, swap the theme, etc.
decantr refresh   # regenerate context files from the updated essence
decantr verify    # run the canonical local reliability gate
decantr verify --evidence
decantr studio    # open the local-only health dashboard
```

`refresh` keeps the generated context files in sync with the essence. `verify` is the day-to-day reliability gate over Project Health, Brownfield checks, health baselines, and optional evidence. `--evidence` writes the privacy-redacted Evidence Bundle that AI agents and CI can use for repair context. `decantr studio` gives the same signal in a small localhost dashboard, and `decantr studio --workspace` expands that view across many Decantr projects in a monorepo.

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
| CLI | Guides users through workflow commands (`setup`, `adopt`, `task`, `verify`, `codify`), keeps advanced primitives available, writes Evidence Bundles, runs workspace health, installs Project Health CI, opens Studio locally, and audits registry content supply-chain health |
| MCP server | Exposes Decantr directly to AI tools — essence reads, registry resolution, context reads, pack compilation, drift checks, critique, audit, evidence bundles, workspace health, and repair prompts |
| Hosted registry/API | Browse and search public content, read intelligence summaries, compile execution packs, critique files, and audit projects |
| Verifier | Shared audit, critique, Project Health, Evidence Bundle, contract assertion, and report-schema engine |
| Showcase apps | Audited benchmark corpus and verification targets for Decantr-generated scaffolds |

## Packages

| Package | Role |
| --- | --- |
| `@decantr/essence-spec` | Essence schemas, validation, migration, and TypeScript types |
| `@decantr/registry` | Registry contracts, schemas, content utilities, and API client surfaces |
| `@decantr/css` | Framework-agnostic CSS atom runtime |
| `@decantr/core` | Execution-pack compiler primitives and shared Decantr utilities |
| `@decantr/verifier` | Shared audit, critique, Evidence Bundle, contract assertion, and report-schema engine |
| `@decantr/mcp-server` | MCP delivery surface for assistants and agent tooling |
| `@decantr/cli` | Local scaffold, registry, Project Health CI/Studio, audit, and maintenance workflows |
| `@decantr/vite-plugin` | Experimental local guard feedback overlay for Vite |

Full release/support status lives in [docs/reference/package-support-matrix.md](docs/reference/package-support-matrix.md).

## Repo layout

| Path | Role |
| --- | --- |
| `apps/api` | Hosted API for registry, packs, critique, audit, auth, org, and billing-adjacent flows |
| `apps/registry` | Next.js registry portal and internal dogfood surface |
| `apps/showcase-host` | Shared Vite host for live blueprint showcase capsules |
| `apps/showcase/` | Showcase manifest and verification reports used by the API and registry |
| `packages/*` | Core Decantr packages and supporting runtime surfaces |
| `docs/` | Public docs, audits, architecture notes, schemas, and runbooks |
| `scripts/` | Audit, release, showcase, schema, and packaging automation |

Showcase capsule architecture is documented in [docs/reference/showcase-host.md](docs/reference/showcase-host.md).

## Development

Requires **Node.js `>=20`** and **pnpm `>=9`**.

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm audit:public-api
pnpm audit:registry-dogfood
pnpm showcase:verify:shortlist
pnpm release:verify
```

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
```

Brownfield adoption:

```bash
decantr adopt --yes
decantr codify --from-audit
decantr codify --accept
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
decantr verify --since-baseline
```

In a monorepo, install Decantr at the workspace root, but attach it to an app:

```bash
decantr setup
decantr workspace list
decantr adopt --project apps/web --yes
decantr codify --from-audit --project apps/web
decantr task /feed "add saved recipe actions" --project apps/web
decantr verify --brownfield --local-patterns --project apps/web
```

If the app is already running and you want local screenshots, add visual evidence later:

```bash
decantr verify --project apps/web --base-url http://localhost:3000 --evidence
```

`analyze` now writes Brownfield intelligence artifacts in addition to the proposal: `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`. Essence V4 stays unchanged; multi-theme apps are observed in the inventory and kept as local task context until the team explicitly promotes that model.

`adopt` orchestrates the primitive Brownfield flow (`analyze`, proposal acceptance, Project Health, optional browser evidence, optional CI) so users do not need to memorize the internal command chain. `codify --from-audit` proposes project-owned local law in `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json`; after review, `codify --accept` promotes those files so `task` can feed them to LLMs and `verify --local-patterns` can check them. The primitive commands remain available for advanced and scripted workflows.

Registry and verification:

```bash
decantr registry summary       --namespace @official --json
decantr registry compile-packs decantr.essence.json --write-context
decantr registry critique-file src/pages/Home.tsx  --namespace @official --json
decantr registry audit-project --namespace @official --json
decantr showcase verification  --json
```

Project Health and CI:

```bash
decantr verify
decantr verify --base-url http://localhost:3000 --evidence
decantr verify --since-baseline
decantr verify init-ci
decantr health --format markdown
decantr health --ci --fail-on error
decantr health --prompt <finding-id>
decantr health --evidence --output .decantr/evidence/latest.json
decantr health --browser --base-url http://localhost:3000 --evidence
decantr health --design-tokens .decantr/design/figma-tokens.json
decantr verify init-ci --project apps/registry
decantr verify init-ci --workspace
decantr verify --workspace --changed --since origin/main
decantr export --to figma-tokens
decantr health --json --output decantr-health.json
decantr studio --port 4319 --host 127.0.0.1
decantr studio --workspace
decantr studio --report decantr-health.json
```

Opted-in product telemetry:

```bash
decantr telemetry status
decantr telemetry explain
decantr telemetry link --enable --org <org-slug>
```

Telemetry stays product-level: command names, aggregate lifecycle counts, registry sources, Project Health scores/counts, private-registry readiness, and billing intent. `decantr telemetry explain` prints the CLI event catalog subset and never-collected list before a team opts in. It does not collect source code, prompts, raw paths, emails, private package slugs, or health report contents.

Official content supply chain:

```bash
decantr content check
decantr content check --ci --fail-on error
decantr content-health
decantr content-health --markdown --output content-health.md
decantr content-health --ci --fail-on error
decantr content-health --prompt <finding-id>
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

Studio is local-only and shows the same Project Health signal as `decantr health`. Its Overview keeps triage focused: pick the issue to fix first, review the AI prompt before copying it, switch to manual guidance or commands, and expand project details when you need route/runtime/pack evidence. Workspace mode is available with `decantr studio --workspace` when a repo contains many Decantr projects.

`decantr health --prompt <finding-id>` prints a focused repair prompt for the assistant doing the implementation. It does not edit files by itself; use Studio's copy buttons or paste the printed prompt into your AI coding workflow, then rerun Project Health.

To view a CI-produced report artifact without scanning a checkout:

```bash
decantr health --json --output decantr-health.json
decantr studio --report decantr-health.json
```

Studio is for interactive triage; `decantr verify --ci --fail-on error` is still the pull-request gate.

See the full [FAQ](docs/faq.md) for common setup, brownfield, Studio, migration, CI, and drift questions.

## Links

- Registry — [registry.decantr.ai](https://registry.decantr.ai)
- Discord — [discord.gg/WeDpBd4xFU](https://discord.gg/WeDpBd4xFU)
- FAQ — [docs/faq.md](docs/faq.md)
- Published schemas — [decantr.ai/schemas](https://decantr.ai/schemas/)
- Project Health — [docs/reference/project-health.md](docs/reference/project-health.md)
- Command surface — [docs/reference/command-surface.md](docs/reference/command-surface.md)
- Content Health — [docs/reference/content-health.md](docs/reference/content-health.md)
- Workflow model — [docs/reference/workflow-model.md](docs/reference/workflow-model.md)
- Public API reference — [docs/reference/registry-public-api.md](docs/reference/registry-public-api.md)
- Package support matrix — [docs/reference/package-support-matrix.md](docs/reference/package-support-matrix.md)

## Contributing

Contributions are welcome. The most useful repo context lives in `docs/` — especially the architecture notes, audits, runbooks, and package support matrix.

Use [Discord](https://discord.gg/WeDpBd4xFU) for quick setup help, showcase feedback, and live community discussion. Keep bugs, feature requests, and durable decisions in GitHub issues, PRs, or docs.

## License

MIT. The source repositories are MIT licensed; hosted services such as the registry and API may publish separate service terms without changing the source-code license.
