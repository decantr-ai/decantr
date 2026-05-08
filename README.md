# Decantr

**Design intelligence, governance, and verification for AI-generated UI.**

Decantr is the contract layer between product intent and AI-generated implementation. It gives coding assistants three things they don't have on their own — structured design inputs, registry-backed UI knowledge, and scoped context files — so they build coherent product surfaces instead of improvising screen by screen. Think of it as OpenAPI for AI-generated UI: the model still writes the code, but Decantr defines the shape, vocabulary, and checks around it.

> AI generates the interface. Decantr keeps the outcome aligned.

## Pick your path

| Path | Use when | Start with |
| --- | --- | --- |
| **[Greenfield blueprint](#greenfield-blueprint)** &nbsp;⭐ | New project, published app composition as the starting point | `decantr new my-app --blueprint=<id> --workflow=greenfield --adoption=decantr-css` |
| **Greenfield contract-only** | New project or repo that wants Decantr governance but no blueprint/runtime takeover | `decantr init --workflow=greenfield --adoption=contract-only` |
| **[Brownfield adoption](docs/reference/workflow-model.md#brownfield-adoption)** | Attaching Decantr to an existing Angular/React/Vue/etc. project | `decantr analyze`, then `decantr init --existing --accept-proposal` |
| **[Hybrid composition](docs/reference/workflow-model.md#hybrid-composition)** | Layering sections, themes, or features into an attached project | `decantr add/remove`, `decantr theme switch`, `decantr registry` |

---

## Greenfield blueprint

### 1. Scaffold from a blueprint

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
cd my-app
```

A blueprint is a published app composition — theme, sections, pages, layouts, voice, and personality. Try `agent-marketplace`, `terminal-dashboard`, or `portfolio` to start, or run `decantr search` to browse the full catalog.

> **Adapter availability.** `react-vite` and `next-app` are runnable starter adapters in this wave. Other contract targets remain valid Decantr targets but initialize through `generic-web` contract-only mode — Decantr writes the contract, you own the runtime.

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
decantr check     # verify the code matches the new contract
decantr health    # produce a local project health report for triage or CI
decantr studio    # open the local-only health dashboard
```

`refresh` keeps the generated context files in sync with the essence. `check` runs the guard rules and tells you exactly where the code drifted from the contract. `decantr health` is the end-user observability surface: it combines audits, checks, route drift, runtime evidence, and pack health into a structured report, while `decantr studio` gives the same signal in a small localhost dashboard. `decantr audit` remains the lower-level audit pass when you want verifier evidence directly.

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
| CLI | Scaffold new apps, initialize existing projects, refresh derived context, search registry content, run checks/audits, and inspect Project Health locally |
| MCP server | Exposes Decantr directly to AI tools — essence reads, registry resolution, context reads, pack compilation, drift checks, critique, and audit |
| Hosted registry/API | Browse and search public content, read intelligence summaries, compile execution packs, critique files, and audit projects |
| Verifier | Shared audit, critique, Project Health, and report-schema engine |
| Showcase apps | Audited benchmark corpus and verification targets for Decantr-generated scaffolds |

## Packages

| Package | Role |
| --- | --- |
| `@decantr/essence-spec` | Essence schemas, validation, migration, and TypeScript types |
| `@decantr/registry` | Registry contracts, schemas, content utilities, and API client surfaces |
| `@decantr/css` | Framework-agnostic CSS atom runtime |
| `@decantr/core` | Execution-pack compiler primitives and shared Decantr utilities |
| `@decantr/verifier` | Shared audit, critique, and report-schema engine |
| `@decantr/mcp-server` | MCP delivery surface for assistants and agent tooling |
| `@decantr/cli` | Local scaffold, registry, audit, and maintenance workflows |
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
```

## More CLI

Intent and discovery:

```bash
decantr magic "AI chatbot with a bold terminal-inspired workspace"
decantr search dashboard
decantr suggest leaderboard
```

Brownfield adoption:

```bash
decantr analyze
decantr init --existing --accept-proposal
decantr check --brownfield
decantr health
```

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
decantr health --format markdown
decantr health --ci --fail-on error
decantr health --prompt <finding-id>
decantr studio --port 4319 --host 127.0.0.1
```

## Links

- Registry — [registry.decantr.ai](https://registry.decantr.ai)
- Discord — [discord.gg/WeDpBd4xFU](https://discord.gg/WeDpBd4xFU)
- Published schemas — [decantr.ai/schemas](https://decantr.ai/schemas/)
- Project Health — [docs/reference/project-health.md](docs/reference/project-health.md)
- Workflow model — [docs/reference/workflow-model.md](docs/reference/workflow-model.md)
- Public API reference — [docs/reference/registry-public-api.md](docs/reference/registry-public-api.md)
- Package support matrix — [docs/reference/package-support-matrix.md](docs/reference/package-support-matrix.md)

## Contributing

Contributions are welcome. The most useful repo context lives in `docs/` — especially the architecture notes, audits, runbooks, and package support matrix.

Use [Discord](https://discord.gg/WeDpBd4xFU) for quick setup help, showcase feedback, and live community discussion. Keep bugs, feature requests, and durable decisions in GitHub issues, PRs, or docs.

## License

MIT. The source repositories are MIT licensed; hosted services such as the registry and API may publish separate service terms without changing the source-code license.
