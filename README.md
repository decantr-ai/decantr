# Decantr

**Design intelligence, governance, and verification for AI-generated UI.**

Decantr is the contract layer between product intent and AI-generated implementation. It gives coding assistants structured design inputs, registry-backed UI knowledge, scoped context files, and verification paths so they can build coherent product surfaces instead of improvising screen by screen.

Think of it as OpenAPI for AI-generated UI: the model still writes the code, but Decantr defines the shape, vocabulary, and checks around it.

> AI generates the interface. Decantr keeps the outcome aligned.

## What It Actually Does

- Captures durable intent in `decantr.essence.json`: theme, density, accessibility, personality, sections, routes, shells, and features.
- Resolves curated registry content such as patterns, archetypes, blueprints, themes, and shells.
- Generates assistant-readable context like `DECANTR.md` and `.decantr/context/*.md` so an LLM sees the right constraints at the right scope.
- Produces style outputs like `src/styles/tokens.css`, `src/styles/treatments.css`, and `src/styles/decorators.css`.
- Compiles local or hosted execution packs for scaffold, section, page, mutation, review, critique, and audit workflows.
- Detects drift between the contract and the code with checks, critiques, audits, and optional drift-resolution flows.

## How The Model Works

Decantr separates design governance into two layers:

- **DNA**: durable visual and system axioms such as theme, spacing, motion, accessibility, and personality.
- **Blueprint**: product topology such as sections, page routes, shells, layouts, and features.

That split matters because not every change should be treated the same way. A theme swap or accessibility regression is different from adding a new auxiliary section or reshaping a route map. Decantr keeps those concerns separate so governance can be strict where it should be strict and flexible where it should be flexible.

## Example Shapes

Minimal essence shape:

```json
{
  "version": "3.1.0",
  "dna": {
    "theme": { "id": "terminal", "mode": "dark", "shape": "sharp" },
    "spacing": { "density": "comfortable", "content_gap": "_gap4" },
    "accessibility": { "wcag_level": "AA", "focus_visible": true },
    "personality": [
      "Technical workspace with terminal-inspired aesthetics."
    ]
  },
  "blueprint": {
    "sections": [
      {
        "id": "pipeline-builder",
        "role": "primary",
        "shell": "terminal-split",
        "pages": [
          {
            "id": "pipeline-editor",
            "layout": ["workflow-canvas"],
            "route": "/pipelines/:id"
          }
        ]
      }
    ]
  },
  "meta": {
    "platform": { "type": "spa", "routing": "hash" },
    "guard": {
      "mode": "guided",
      "dna_enforcement": "error",
      "blueprint_enforcement": "warn"
    }
  }
}
```

Registry content is also structured, not just prose:

```ts
const pattern = {
  $schema: 'https://decantr.ai/schemas/pattern.v2.json',
  id: 'hero',
  components: ['eyebrow', 'headline', 'supporting-copy', 'cta'],
  default_preset: 'split',
  presets: {
    split: {
      description: 'Content left, media right',
      layout: ['content', 'media']
    }
  },
  visual_brief: 'Confident launch hero with strong hierarchy and clear CTA.'
};

const theme = {
  $schema: 'https://decantr.ai/schemas/theme.v1.json',
  id: 'terminal',
  personality: 'Technical workspace with terminal-inspired aesthetics.',
  tokens: { '--d-primary': '#86efac', '--d-bg': '#050816' },
  decorator_definitions: {
    glass: { intent: 'Soft elevated blur for overlays and cards.' }
  }
};
```

## Governance In Practice

- `meta.guard.mode` sets the overall posture: `creative`, `guided`, or `strict`.
- `meta.guard.dna_enforcement` governs visual/system violations like theme, density, and accessibility drift.
- `meta.guard.blueprint_enforcement` governs structural drift like pages, layout contracts, and registry-backed pattern usage.
- `decantr check` is the fast local contract check.
- `decantr audit` and `decantr registry audit-project` are broader verification passes.
- `decantr registry critique-file` critiques a specific file against the current contract.
- `decantr sync-drift` exists for reviewing and resolving accepted drift entries over time.

The rule of thumb is simple: if a change is intentional and durable, update the essence and refresh the context. If it is accidental, fix the code. If it is a temporary exception, track it as drift instead of pretending the contract changed.

## Main Surfaces

| Surface | What it does |
| --- | --- |
| CLI | Scaffold new apps, initialize existing projects, refresh derived context, search registry content, and run checks/audits |
| MCP server | Exposes Decantr intelligence directly to AI tools: essence reads, registry resolution, context reads, pack compilation, drift checks, critique, and audit |
| Hosted registry/API | Browse/search public content, read intelligence summaries, compile execution packs, critique files, and audit projects |
| Verifier | Shared audit and critique engine with schema-backed reports |
| Showcase apps | Audited benchmark corpus and verification targets for Decantr-generated scaffolds |

## Current Product Surface

The active public package surface in this monorepo is:

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

## Quick Start

Create a new project:

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
cd my-app
decantr status
decantr check
decantr audit
```

Initialize Decantr inside an existing project:

```bash
npx @decantr/cli init --blueprint=agent-marketplace --yes
decantr refresh
decantr check
```

Common commands:

```bash
decantr magic "AI chatbot with a bold terminal-inspired workspace"
decantr search dashboard
decantr suggest leaderboard
decantr registry summary --namespace @official --json
decantr registry compile-packs decantr.essence.json --write-context
decantr registry critique-file src/pages/Home.tsx --namespace @official --json
decantr registry audit-project --namespace @official --json
decantr showcase verification --json
```

## What Gets Generated

Typical Decantr project outputs include:

- `decantr.essence.json` for the durable contract
- `DECANTR.md` for assistant instructions
- `.decantr/context/scaffold.md` plus section/page context files
- `src/styles/tokens.css` for token variables
- `src/styles/treatments.css` for shared treatments
- `src/styles/decorators.css` for theme decorators

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

## Links

- Registry: [registry.decantr.ai](https://registry.decantr.ai)
- Public API reference: [docs/reference/registry-public-api.md](docs/reference/registry-public-api.md)
- Published schemas: [decantr.ai/schemas](https://decantr.ai/schemas/)
- Package support matrix: [docs/reference/package-support-matrix.md](docs/reference/package-support-matrix.md)

## Contributing

Contributions are welcome. The most useful repo context lives in `docs/`, especially the architecture notes, audits, runbooks, and package support matrix.

## License

MIT

The source repositories are MIT licensed. Hosted services such as the registry and API may publish separate service terms without changing the source-code license.
