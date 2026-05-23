# Decantr

**AI Frontend Governance for production codebases touched by AI agents.**

Decantr is the governance layer between product intent and AI-edited frontend code. It gives coding assistants three things they don't have on their own: typed contracts, route-scoped context, and machine-actionable evidence, so UI changes stay coherent instead of drifting prompt by prompt. The model still writes the code; Decantr defines the contract, context, and verification loop around it.

> AI generates the interface. Decantr proves, with local evidence, whether the outcome stayed aligned.

## Pick your path

| Path | Use when | Start with |
| --- | --- | --- |
| **[Brownfield adoption](docs/reference/workflow-model.md#brownfield-adoption)** &nbsp;⭐ | Attaching Decantr to an existing Angular/React/Vue/etc. project | `decantr adopt --yes` |
| **[Hybrid operating layer](docs/reference/workflow-model.md#hybrid-operating-layer)** | An attached app wants selected Decantr or project-owned UI law, without source takeover | `decantr codify`, `decantr doctor`, `decantr task` |
| **[Greenfield starter kit](#greenfield-blueprint)** | New project, published app composition as the starting point | `decantr new my-app --blueprint=<id> --workflow=greenfield --adoption=decantr-css` |
| **Greenfield contract-only** | New project or repo that wants Decantr governance but no blueprint/runtime takeover | `decantr init --workflow=greenfield --adoption=contract-only` |

---

## Greenfield Starter Kits

### 1. Scaffold from a blueprint

```bash
npx @decantr/cli new my-app --blueprint=esports-hq
cd my-app
```

A starter kit is a published app composition — theme, sections, pages, layouts, voice, and personality. It is a starting point, not the product center. The public registry now keeps blueprint discovery intentionally small: **Featured** and **Certified** are the strongest default picks, **All** shows supported contracts, and **Labs** is opt-in for promising but less-proven directions. Try `esports-hq`, `agent-studio`, or `registry-platform` to start, or run `decantr list blueprints --blueprint-set featured` to browse the curated set.

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
decantr graph     # generate the typed Contract graph, source index, and contract capsule
decantr verify    # run the canonical local reliability gate
decantr verify --evidence
decantr studio    # open the local-only health dashboard
```

`refresh` keeps the generated context files in sync with the essence. `graph` writes `.decantr/graph/graph.snapshot.json`, `.decantr/graph/snapshots/<snapshot-id>.json`, `graph.manifest.json`, `graph.diff.json`, and `contract-capsule.json` for typed agent context and replayable local history. `verify` is the day-to-day reliability gate over Project Health, Brownfield checks, health baselines, and optional evidence; health findings include stable diagnostic codes, typed repair IDs, component reuse drift such as `COMP001` when an agent reimplements a project-owned primitive, and accepted style bridge drift such as `TOKEN010` when arbitrary Tailwind, inline style, or stylesheet values bypass project-owned style authority. When a graph snapshot exists, findings also include graph anchors back to the contract node they came from. `--evidence` writes the privacy-redacted Evidence Bundle that AI agents and CI can use for repair context, including those codes, repair IDs, and graph anchors when available. `decantr studio` gives the same signal in a small localhost dashboard, and `decantr studio --workspace` expands that view across many Decantr projects in a monorepo.

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
| CLI | Guides users through workflow commands (`setup`, `adopt`, `doctor`, `task`, `verify`, `ci`, `codify`), keeps advanced primitives available, writes Evidence Bundles, runs workspace health, installs CI, opens Studio locally, and audits official-vocabulary supply-chain health |
| MCP server | Exposes Decantr directly to AI tools - essence reads, vocabulary resolution, context reads, pack compilation, drift checks, critique, audit, evidence bundles, workspace health, and repair prompts |
| Hosted registry/API | Certified vocabulary and hosted pack compilation for teams that want official content context, without overriding repo-owned local law |
| Verifier | Shared audit, critique, Project Health, Evidence Bundle, component reuse drift, style bridge drift, stable diagnostic code, typed repair ID, graph-anchored finding, contract assertion, and report-schema engine |
| Showcase apps | Audited benchmark corpus and verification targets for Decantr-generated scaffolds |

Security review starts with the installed npm surface, not the whole monorepo. The package permission matrix documents filesystem, network, process, telemetry, hosted-upload, and MCP write-tool behavior for every public package: [docs/reference/security-permissions.md](docs/reference/security-permissions.md).

## Packages

| Package | Role |
| --- | --- |
| `@decantr/essence-spec` | Essence schemas, validation, migration, and TypeScript types |
| `@decantr/registry` | Certified vocabulary contracts, schemas, content utilities, and API client surfaces |
| `@decantr/css` | Framework-agnostic CSS atom runtime |
| `@decantr/core` | Execution-pack compiler primitives, typed Contract graph builders, graph diffs, snapshot history, and Contract capsules |
| `@decantr/verifier` | Shared audit, critique, Evidence Bundle, component reuse drift, style bridge drift, stable diagnostic code, typed repair ID, graph-anchored finding, contract assertion, and report-schema engine |
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
pnpm audit:package-permissions
pnpm audit:registry-dogfood
pnpm showcase:verify:shortlist
pnpm release:verify
pnpm release:closeout
```

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

Source-code suggestions rank both registry patterns and accepted `.decantr/local-patterns.json` against the selected app's file contents. From an app root, `decantr suggest "button" --from-code --file src/App.tsx` surfaces project-owned law without extra flags; from a monorepo root, add `--project apps/web`.

Brownfield adoption:

```bash
decantr adopt --yes
decantr codify --from-audit --style-bridge
decantr codify --accept
decantr graph
decantr graph --file src/app/page.tsx --impact --json
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
decantr verify --since-baseline
```

In a monorepo, install Decantr at the workspace root, but attach it to an app:

```bash
decantr setup
decantr workspace list
decantr adopt --project apps/web --yes
decantr doctor --project apps/web
decantr codify --from-audit --style-bridge --project apps/web
decantr graph --project apps/web
decantr graph --project apps/web --file src/app/page.tsx --impact --json
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

`analyze` now writes Brownfield intelligence artifacts in addition to the proposal: `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`. Essence V4 stays unchanged; multi-theme apps are observed in the inventory and kept as local task context until the team explicitly promotes that model. When local law, a style bridge, or Decantr CSS is accepted, Decantr calls that out as Hybrid instead of pretending every existing app is still only contract-only.

`adopt` orchestrates the primitive Brownfield flow (`analyze`, proposal acceptance, hosted pack hydration when online, Project Health, optional browser evidence, optional CI) so users do not need to memorize the internal command chain. In contract-only/offline adoption, hosted packs can be deferred; `doctor`, `health`, and `refresh --check` treat missing hosted packs as optional context unless a present `pack-manifest.json` references missing files. `doctor` explains project/workspace state, generated artifacts, CI wiring, and the active adoption lane: Brownfield contract-only, Hybrid local law, Hybrid style bridge, Hybrid Decantr CSS, Hybrid composition, or Greenfield. `codify --from-audit` proposes project-owned local law in `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json`; `codify --style-bridge` proposes `.decantr/style-bridge.proposal.json`, mapping Decantr intent to project-owned tokens/classes without installing Decantr CSS. After review, `codify --accept` promotes whichever proposals exist so `task`, `suggest`, `ci`, and MCP task context treat them as Hybrid authority, while hosted registry patterns remain optional guidance until mapped into project-owned law. When typed graph artifacts exist, `task` and MCP task context rank route graph nodes with the task text so matching components, findings, evidence, and source artifacts rise before the edit. The primitive commands remain available for advanced and scripted workflows.

Registry and verification:

```bash
decantr registry summary       --namespace @official --json
decantr registry compile-packs decantr.essence.json --write-context
decantr registry compile-packs apps/web/decantr.essence.json --write-context
decantr registry critique-file src/pages/Home.tsx  --namespace @official --json
decantr registry audit-project --namespace @official --json
decantr showcase verification  --json
```

When an essence path is provided, `--write-context` writes the pack bundle beside that essence file. In monorepos, that means app packs land under `apps/web/.decantr/context`, not the repository root.

Project Health remediation copy follows the same rule: from a monorepo root, pack fixes point at `apps/web/decantr.essence.json`, prompt commands keep `--project apps/web`, task/read paths include `apps/web/...`, and CI prompts point at `decantr ci --project apps/web --fail-on error`. `ci` prints accepted local-rule findings with file and line evidence, even when warnings are not configured to block. `task` also prints an authority block so assistants know whether the route is Brownfield contract-only, Hybrid local law, Hybrid style bridge, or Decantr CSS, and it warns before mixing runtimes or adding Decantr CSS to a non-Decantr-CSS app. Advanced app-scoped primitives such as `health`, `status`, `add`, `remove`, `theme`, `export`, `suggest`, and `magic` should target the selected app rather than the workspace root. `setup` becomes a post-adoption dashboard once any app is attached, so it recommends `doctor`, `task`, `verify`, and `ci init` instead of telling users to adopt the same app again.

Project Health, CI, and diagnosis:

```bash
decantr doctor
decantr doctor --project apps/registry
decantr verify
decantr verify --base-url http://localhost:3000 --evidence
decantr verify --since-baseline
decantr ci --project apps/registry
decantr ci --workspace --changed --since origin/main
decantr ci init --project apps/registry
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

In contract-only Brownfield projects, Decantr may not own `src/styles/tokens.css`; `export --to figma-tokens` is for Decantr CSS token exports, while project-native token exports remain the app's source of truth unless you adopt a style bridge.

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

Studio is local-only and shows the same Project Health signal as `decantr health`. Its Overview keeps triage focused: pick the issue to fix first, review the AI prompt before copying it, switch to manual guidance or commands, and expand project details when you need route/runtime/pack evidence. Workspace mode is available with `decantr studio --workspace` when a repo contains many Decantr projects.

`decantr health --prompt <finding-id>` prints a focused repair prompt for the assistant doing the implementation. It does not edit files by itself; use Studio's copy buttons or paste the printed prompt into your AI coding workflow, then rerun Project Health.

To view a CI-produced report artifact without scanning a checkout:

```bash
decantr health --json --output decantr-health.json
decantr studio --report decantr-health.json
```

Studio is for interactive triage; `decantr ci --fail-on error` is the pull-request gate.

See the full [FAQ](docs/faq.md) for common setup, brownfield, Studio, migration, CI, and drift questions.

## Links

- Registry — [registry.decantr.ai](https://registry.decantr.ai)
- Discord — [discord.gg/WeDpBd4xFU](https://discord.gg/WeDpBd4xFU)
- FAQ — [docs/faq.md](docs/faq.md)
- Monorepos — [docs/guides/monorepos.md](docs/guides/monorepos.md)
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
