# Decantr

**Design intelligence, governance, and verification for AI-generated UI.**

Decantr is the contract layer between product intent and AI-generated implementation. It gives coding assistants three things they don't have on their own — structured design inputs, registry-backed UI knowledge, and scoped context files — so they build coherent product surfaces instead of improvising screen by screen. Think of it as OpenAPI for AI-generated UI: the model still writes the code, but Decantr defines the shape, vocabulary, and checks around it.

> AI generates the interface. Decantr keeps the outcome aligned.

## Pick Your Path

How are you starting?

- **A) [⭐ Brand new app from a blueprint](#a-brand-new-app-from-a-blueprint)** — Use `decantr new` when you want a new directory plus the currently available starter adapter.
- **B) [Brownfield adoption](docs/reference/workflow-model.md#brownfield-adoption)** — Use `decantr analyze` first, then `decantr init --existing` to attach Decantr to an existing app without requiring a blueprint.
- **C) [Hybrid composition](docs/reference/workflow-model.md#hybrid-composition)** — Start from any attached Decantr project, then selectively add/remove features, switch themes, or pull registry content later.

---

## A) Brand new app from a blueprint

### Step 1 — Scaffold from a blueprint

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
cd my-app
```

A blueprint is a published app composition: theme, sections, pages, layouts, voice, and personality. Try `agent-marketplace`, `terminal-dashboard`, or `portfolio` to start, or run `decantr search` to browse the full catalog.
The greenfield runnable starter adapter available in this wave is `react-vite`. Other contract targets remain valid Decantr targets, but currently initialize in contract-only mode until their bootstrap adapters land.

### Step 2 — What just got generated

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

If a runnable starter adapter is available for your requested target, `decantr new` also writes the starter runtime. Otherwise the command still creates a new Decantr workspace, but leaves runtime ownership to you. In both cases, Decantr produces the contract; your AI assistant produces the implementation against it.

### Step 3 — Hand it to your AI assistant

Open the project in Claude Code, Cursor, Windsurf, or any AI-aware editor. Your assistant will read `DECANTR.md` to learn the methodology, then load section context files on demand as it works on each part of the app. The split keeps the assistant focused on the right scope at the right time.

### Step 4 — Make your first change and verify

```bash
# Edit decantr.essence.json — add a section, swap the theme, etc.
decantr refresh   # regenerate context files from the updated essence
decantr check     # verify the code matches the new contract
```

`refresh` keeps the generated context files in sync with the essence. `check` runs the guard rules — if your code drifted from the contract, it tells you exactly where. `decantr audit` is a broader pass when you want a full report.

> Working from a different starting point? See the full [workflow model](docs/reference/workflow-model.md).

---

## The Model

Decantr separates design governance into two layers:

- **DNA** — durable visual and system axioms: theme, spacing, motion, accessibility, personality.
- **Blueprint** — product topology: sections, page routes, shells, layouts, features.

That split matters because not every change should be treated the same way. A theme swap or accessibility regression is different from adding a new auxiliary section or reshaping a route map. Decantr lets governance be strict where it should be strict (DNA, errors by default) and flexible where it should be flexible (Blueprint, warnings only).

For the full model — example essence shapes, registry content schemas, guard mode details, and drift-resolution flow — see the [governance and essence reference](docs/concepts/governance.md). <!-- TODO: link when written -->

## Surfaces

| Surface | What it does |
| --- | --- |
| CLI | Scaffold new apps, initialize existing projects, refresh derived context, search registry content, and run checks/audits |
| MCP server | Exposes Decantr intelligence directly to AI tools: essence reads, registry resolution, context reads, pack compilation, drift checks, critique, and audit |
| Hosted registry/API | Browse/search public content, read intelligence summaries, compile execution packs, critique files, and audit projects |
| Verifier | Shared audit and critique engine with schema-backed reports |
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

## Repo Layout

| Path | Role |
| --- | --- |
| `apps/api` | Hosted API for registry, packs, critique, audit, auth, org, and billing-adjacent flows |
| `apps/registry` | Next.js registry portal and internal dogfood surface |
| `apps/showcase/*` | Generated benchmark apps used as evidence and verification targets |
| `packages/*` | Core Decantr packages and supporting runtime surfaces |
| `docs/` | Public docs, audits, architecture notes, schemas, and runbooks |
| `scripts/` | Audit, release, showcase, schema, and packaging automation |

## Development

Requirements:

- Node.js `>=20`
- pnpm `>=9`

Common repo tasks:

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm audit:public-api
pnpm audit:registry-dogfood
pnpm showcase:verify:shortlist
```

## More CLI Commands

```bash
decantr magic "AI chatbot with a bold terminal-inspired workspace"
decantr analyze
decantr init --existing --yes
decantr search dashboard
decantr suggest leaderboard
decantr registry summary --namespace @official --json
decantr registry compile-packs decantr.essence.json --write-context
decantr registry critique-file src/pages/Home.tsx --namespace @official --json
decantr registry audit-project --namespace @official --json
decantr showcase verification --json
```

## Links

- Registry: [registry.decantr.ai](https://registry.decantr.ai)
- Workflow model: [docs/reference/workflow-model.md](docs/reference/workflow-model.md)
- Public API reference: [docs/reference/registry-public-api.md](docs/reference/registry-public-api.md)
- Published schemas: [decantr.ai/schemas](https://decantr.ai/schemas/)
- Package support matrix: [docs/reference/package-support-matrix.md](docs/reference/package-support-matrix.md)

## Contributing

Contributions are welcome. The most useful repo context lives in `docs/`, especially the architecture notes, audits, runbooks, and package support matrix.

## License

MIT

The source repositories are MIT licensed. Hosted services such as the registry and API may publish separate service terms without changing the source-code license.
