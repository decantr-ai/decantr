# Decantr

**Agent-neutral UI change control for codebases edited by AI.**

Decantr observes a project's own UI authority, prepares compact context for a coding agent, verifies the resulting change, and reports reproducible evidence. It does not generate the change or replace the project's router, component library, styling system, tests, or design tools.

> **Release status:** Decantr **3.11.3** is the current stable product line. Bare `decantr verify` inspects only the current UI change, writes nothing, selects one changed app when that choice is unambiguous, and returns at most three consequential findings with source and repair targets. This patch fixes SvelteKit task ambiguity by keeping `+page.svelte` as the UI implementation and colocated page-data modules as supporting authority. It does not claim frontier-model lift. See the [3.11.3 release note](docs/releases/2026-08-08-decantr-3-11-3-sveltekit-task-authority.md), [Change Assurance contract](docs/reference/change-assurance.md), and [qualification evidence](docs/research/2026-08-07-decantr-3-11-change-assurance-trials.md).

Run it in any Git worktree; adoption is not required:

```bash
npx @decantr/cli@3.11.3 verify
```

The result is `pass`, `attention`, or `not_proven`. Multi-app ambiguity, missing Git scope, and unsupported authority fail closed instead of producing a reassuring score.

## The Product Loop

1. **Observe** project-owned UI authority and state what is unknown.
2. **Prepare** a compact, change-scoped context capsule for any coding agent.
3. **Verify** the diff against project authority, tests, and available runtime evidence.
4. **Report** typed evidence that a person, agent, or CI system can inspect.

For deeper task preparation and full-project governance:

```bash
npx @decantr/cli@3.11.3 verify
npx @decantr/cli@3.11.3 scan
npx @decantr/cli adopt --yes       # one-time attachment
npx @decantr/cli task /feed "add saved actions"
npx @decantr/cli verify --full
npx @decantr/cli ci init           # one-time CI setup
```

In a monorepo, install once at the workspace root and select the app consistently:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr scan --project apps/web
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr task /feed "add saved actions" --project apps/web
pnpm exec decantr verify            # auto-selects one changed app when provable
pnpm exec decantr verify --project apps/web
```

Bare `verify` and `scan` are read-only. `adopt` is the one-time write boundary. Use `verify --full` for the previous Project Health workflow and its explicit evidence or baseline options. The daily loop can start with changed-UI assurance and deepen to `task -> edit -> verify`; CI is the durable gate.

## UI Authority

Routes are evidence, not the product ontology. The 3.10 authority model remains the foundation beneath 3.11 Change Assurance and covers:

| Surface | Examples |
| --- | --- |
| Route | URL-backed page and its production implementation |
| Layout | Shell, nested layout, or navigation boundary |
| Component | Reusable project or design-system component |
| Story | Storybook-backed component state and usage evidence |
| Overlay | Dialog, drawer, popover, toast, or command surface |
| Flow | Multi-step interaction crossing routes or states |
| Package | UI library or design-system package without an app router |
| Runtime state | Loading, empty, error, permission, responsive, or interactive state |

Decantr 3.10.0 can prepare route and non-route UI targets without pretending that a component count, package dependency, or URL literal proves production reachability.

Readiness is evaluated on independent axes:

- selected app authority;
- production surface authority;
- topology completeness;
- implementation taskability;
- component inventory quality;
- styling authority;
- runtime evidence.

The primary 3.10 result is `ready`, `limited`, `blocked`, or `unsupported`. No numeric confidence or aggregate fit score may hide an unresolved axis. The [Day-0 baseline](docs/benchmarks/2026-07-22-decantr-3-9-4-day-zero.md) shows why this changed: 3.9.4 could run successfully while still selecting incomplete routes, weak styling evidence, or the wrong ontology for design-system packages.

Source declaration and deployment reachability are separate facts. Decantr keeps a file-backed route visible when Next middleware or proxy policy can hide it, but excludes that route from taskable production context. If the affected path set cannot be resolved statically, route authority degrades and task preparation fails closed. Framework semantics remain explicit: authored TanStack route files are implementation authority while generated route metadata only corroborates public paths; Astro Markdown/MDX files are pages while TypeScript/JavaScript response handlers are non-UI endpoints; SvelteKit `+page.svelte` is the UI implementation while colocated page-data modules remain supporting authority; Angular wildcard fallbacks do not create child URLs, and resolved external templates/styles travel with the route task. Styling authority follows ordered production imports, including workspace package exports; Next server handlers do not count as UI components.

## Product Boundary

Active 3.11 investment is deliberately narrow:

- `@decantr/verifier` and framework authority adapters;
- `@decantr/cli` around `scan`, `task`, and `verify`;
- the existing eight-tool MCP surface;
- local evidence, CI integration, and deterministic policy packs;
- compatibility evolution of existing 3.x contracts.

These remain available where already shipped, but are advanced, compatibility, or historical surfaces rather than the product lead:

- Greenfield blueprints, themes, and broad corpus expansion;
- registry publishing, login, logout, and community discovery;
- `@decantr/css` and the Vite plugin;
- telemetry product work;
- Studio and showcase expansion;
- hosted cross-repository intelligence.

Existing 3.x scripts remain callable. Package removal or consolidation is a 4.0 compatibility decision, independent of the model-lift research result.

## Agent-Neutral And Local-First

Decantr works through CLI output, project files, JSON contracts, CI artifacts, and MCP. No specific editor, model vendor, personal skill, or hosted account is required.

- Source inspection and verification run locally.
- Hosted source upload is retired.
- Browser evidence stays in the project unless the user moves it.
- Existing repository instructions and MCP servers remain project-owned.
- Decantr should add one small assistant bridge only when requested, not duplicate `AGENTS.md`, Cursor rules, Claude instructions, and other agent context.
- The optional Fly content API is a reference helper, not the authority for a local codebase.

Production source is the first authority. Reviewed project-local law or style mappings may refine it. Essence and official content can provide contract or advisory guidance, but they do not silently override the app's runtime, styling, component, or test systems.

## The Model-Lift Research Boundary

The shipped product does not make this causal claim. The separate research program tests whether it can eventually support it:

> Decantr gives AI coding agents more accurate project authority before a UI change and produces measurably better, safer UI outcomes afterward.

The frozen design uses 40 UI tasks across 28 pinned open-source repositories, two models, two arms, and two repetitions: **320 isolated runs**. It includes one repository-authentic task per target plus 12 adversarial tasks. The corpus carries 18 development and 10 qualification acquisition labels; independently, the task experiment contains 24 development and 16 sealed qualification tasks. Repository identities were already observed during Day-0, so this is not a repository-blind holdout; qualification solutions and evaluator oracles remain sealed, and a future independent external holdout is required for an industry-wide claim.

The control receives the model, repository-native instructions, existing tests/design evidence, and an approved policy card. The treatment receives the same information entitlement through Decantr context and verification; Decantr receives no extra human facts. Candidate package bytes are frozen before the paid experiment, and any implementation change invalidates the candidate result.

The requested model identities are OpenAI `gpt-5.6-sol` and Anthropic `claude-fable-5`. Substitutions remain visible and are not pooled with the requested model.

The measured-improvement claim remains unavailable unless all predeclared research gates hold, including:

- correct app selection or honest `unsupported` on all 28 repositories;
- no test, fixture, story, generated, build-output, or sibling-app source promoted to production authority;
- correct rank-one implementation whenever Decantr says a task is ready;
- at least a five-point paired treatment lift with a 95% confidence interval above zero, separately for each model;
- at least 25% fewer governance violations;
- functional success non-inferior within five percentage points overall for each model; framework strata remain exploratory unless separately powered;
- at least 26 of 32 qualification task/model units with a decisive blinded preference, at least 60% treatment preference among decisive units, and a two-sided 95% Wilson lower bound above 50%;
- median token/cost overhead no higher than 15% and P95 no higher than 25%.

Unsupported targets, missing evaluators, build failures, and model substitutions stay visible and in the denominator. A pass permits the bounded claim. Mixed results narrow the supported framework or task claim. A failure blocks any value-proven claim and requires Decantr to shrink toward verifier, authority-adapter, and CI infrastructure. Nothing is automatically deleted by a failed benchmark.

## Current 3.11.3 Contracts

The published line adds `change-assurance-report.v1` and changed-UI assurance to the existing independent UI authority axes, authority-aware task context, compatible route-backed `TaskCapsuleV1`, `AdoptionTruthV1`, `GovernanceDeltaV1`, Project Health, local evidence, CI v2 by default, and explicit CI v3. CLI, explicit CI v3, and MCP `decantr_verify` consume the same verifier-owned report. These are product contracts, not proof that Decantr materially improves frontier-model outcomes.

The MCP server preserves exactly eight public tools:

`decantr_project`, `decantr_contract`, `decantr_context`, `decantr_graph`, `decantr_registry`, `decantr_verify`, `decantr_repair`, and `decantr_contract_write`.

`decantr_registry` is a compatibility name backed by `@decantr/content`; it is not a public marketplace. `@decantr/css` is a legacy optional adapter and is never required for normal Brownfield adoption.

## Packages

| Package | Current posture |
| --- | --- |
| `@decantr/cli` 3.11.3 | Primary changed-UI and local workflow surface |
| `@decantr/verifier` 3.11.3 | Primary authority and evidence engine |
| `@decantr/mcp-server` 3.11.3 | Stable eight-tool agent integration surface |
| `@decantr/core` 3.10.0 | Supported graph and execution foundation |
| `@decantr/essence-spec` | Supported contract foundation |
| `@decantr/content` | Supported policy/reference foundation; no broad corpus expansion |
| `@decantr/registry` | Legacy 3.x compatibility facade |
| `@decantr/css` | Legacy optional adapter |
| `@decantr/telemetry` | Optional compatibility package; no active product investment |
| `@decantr/vite-plugin` | Experimental; outside the primary reliability layer |

See the current [package support matrix](docs/reference/package-support-matrix.md) for published support details.

## Development

Requires Node.js `>=20.19.0` and pnpm `>=9`.

```bash
pnpm install
pnpm build
pnpm test
pnpm qualification:3-11:changes
pnpm benchmark:3-10:validate
```

Paid research execution is not implied by product release validation. The optional 320-run experiment requires explicit budget approval, configured provider credentials, frozen treatment tarballs, sealed evaluators, and independent review.

## Documentation

- [Existing apps](docs/guides/existing-apps.md)
- [Change Assurance](docs/reference/change-assurance.md)
- [AI assistant setup](docs/guides/ai-assistant-setup.md)
- [Workflow model](docs/reference/workflow-model.md)
- [Command surface](docs/reference/command-surface.md)
- [FAQ](docs/faq.md)
- [3.11.3 SvelteKit task-authority patch](docs/releases/2026-08-08-decantr-3-11-3-sveltekit-task-authority.md)
- [3.11.1 MCP metadata patch](docs/releases/2026-08-07-decantr-3-11-1-mcp-metadata-compatibility.md)
- [3.11.0 Changed-UI Assurance release](docs/releases/2026-08-07-decantr-3-11-0-changed-ui-assurance.md)
- [3.11 qualification evidence](docs/research/2026-08-07-decantr-3-11-change-assurance-trials.md)
- [4.0 entry criteria](docs/reference/decantr-4-entry-criteria.md)
- [3.10.0 authority-model release note](docs/releases/2026-08-07-decantr-3-10-0-authority-aware-ui-change-control.md)
- [Frontier-model lift research program](docs/programs/2026-07-22-decantr-3-10-ui-change-control-proof.md)
- [3.10 Culinary Platform clean-slate adoption](docs/benchmarks/2026-08-07-culinary-platform-clean-slate-adoption.md) (oracle-assisted repair evidence, not a model A/B result)
- [3.10 exploratory adoption evidence](docs/benchmarks/2026-07-24-decantr-3-10-exploratory-adoption-evidence.md) (deterministic development evidence, not model-lift proof)
- [3.9.4 Day-0 authority baseline](docs/benchmarks/2026-07-22-decantr-3-9-4-day-zero.md)
- [3.9 Governed Change Proof program](docs/programs/2026-07-16-decantr-3-9-adoption-proof-program.md) (historical current-release evidence)
- [3.9.4 release note](docs/releases/2026-07-21-decantr-3-9-4-tailwind-source-isolation.md) (published stable history)

Historical programs, audits, benchmarks, and release notes are retained as evidence of what was proposed or shipped at that time. They do not override active references or convert regression evidence into a model-lift result.

## License

MIT. Test-corpus repositories retain their own licenses and are not redistributed by Decantr.
