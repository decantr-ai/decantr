# Hybrid Fortification Plan

Date: 2026-05-15
Status: Active product program. The 2.13 slice ships richer `codify --from-audit` source evidence, advisory `codify --map-pattern <slug>` hosted-pattern mapping, and clearer enforceable-versus-advisory Hybrid output in `task`, `verify`, and `ci`.

## Goal

Make Hybrid adoption a first-class Decantr lane.

Hybrid means an existing product keeps its source authority and local design system, while selectively adopting Decantr capabilities such as hosted execution packs, registry patterns, local pattern packs, Project Health gates, adapter guidance, task-time context, or Decantr CSS atoms where they are explicitly wanted.

Hybrid must not feel like Brownfield with extra commands or Greenfield with source takeover. It needs its own clear promise:

- Brownfield contract-only: observe the app, preserve it, and help LLMs stay coherent.
- Hybrid: observe the app, preserve it, and intentionally adopt selected Decantr-managed or project-owned UI law.
- Greenfield: create a new app contract and optionally realize a certified starter surface.

## Product Risks

The Hybrid lane must address these risks before it is promoted as a primary workflow:

- Users may not know when to move from Brownfield contract-only to Hybrid.
- Hosted registry patterns can look like they are replacing local app patterns.
- Local pattern packs and hosted patterns need clear precedence.
- Runtime adapters must not imply Decantr can safely rewrite any framework surface.
- CSS ownership must be explicit: contract-only, style bridge, Decantr CSS runtime, or mixed mode.
- CI should validate the selected adoption mode without asking users to stitch together many commands.
- LLM task activation must say which authority is active for a route: observed app, local law, hosted pack, or Decantr runtime.

## Non-Negotiables

- Keep Essence V4 stable unless implementation proves a real contract gap.
- Do not promote automatic source takeover for existing apps.
- Keep visual evidence and source snapshots local unless users opt into hosted workflows.
- Keep stack support adapter-driven and explicit.
- Do not require `decantr-content` schema changes unless existing fields cannot express the needed guidance.
- Update docs, package READMEs, release notes, command references, support matrix, sitemap, and the Decantr engineering skill whenever behavior changes.
- Keep `decantr-content` synchronized only when registry content, aliases, tags, descriptions, examples, or certification metadata actually change.

## Core User Story

A user should be able to say:

```bash
pnpm exec decantr setup
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
```

Then Decantr should make the next choice obvious:

- Stay contract-only and use `task` plus `verify`.
- Codify local patterns and rules from the observed app.
- Adopt selected hosted patterns into local law.
- Add visual evidence.
- Wire CI.
- Move one route or component family into a stronger Hybrid rule set.

The user should not need to memorize `analyze`, `refresh`, `check`, `health`, `audit`, `sync`, `compile-packs`, and `status` to understand what comes next.

## Workstream 1: Workflow Messaging

Clarify the product lane matrix everywhere users enter Decantr:

| Lane | Source Authority | Best For | CI Gate |
| --- | --- | --- | --- |
| Brownfield contract-only | Existing app | LLM context, drift awareness, local law proposals | `decantr ci --project <app>` |
| Hybrid | Existing app plus selected Decantr/local law | Standardizing component families and route-level patterns | `decantr ci --project <app>` plus accepted local/hybrid rules |
| Greenfield | Decantr contract and certified adapter | New apps and starter surfaces | `decantr ci` after realization |

Implementation candidates:

- Make `doctor` explicitly recommend the next adoption lane.
- Make `setup` summarize the lane choices without expanding into a command wall.
- Make `task` state the active route authority in one compact block.
- Keep advanced primitives available but document them under reference, not first-mile guides.

## Workstream 2: Hybrid Local Law

Hybrid should build on Brownfield local law rather than inventing a parallel system.

Implementation candidates:

- Extend `codify --from-audit` output to distinguish observed local law, recommended local rules, source evidence, confidence tiers, variants, and hosted-pattern candidates. First shipped in 2.13.
- Add local pattern precedence wording to `task`, `verify`, and `doctor`.
- Improve suggestion ranking for user intents such as "standardize buttons", "standardize cards", "make every form use the same field shell", and "stop raw design tokens".
- Add a proposal-only path for adopting a hosted pattern into a local pattern pack without applying source edits. First shipped in 2.13 as `decantr codify --map-pattern <slug>`.

Validation scenarios:

- Button families with raw `<button>`, shared button wrappers, shadcn buttons, Bootstrap buttons, and framework-native button components.
- Card families with duplicated surfaces, theme variants, and route-specific exceptions.
- Form-field families across authentication, settings, and admin surfaces.

## Workstream 3: Registry And Content Alignment

Hybrid needs hosted registry content to act as optional guidance, not as the default owner of an existing app.

Implementation candidates:

- Improve pattern tags, aliases, and descriptions for local-law discovery prompts.
- Add examples that explain "map this hosted pattern to your project-owned component" rather than "replace your component".
- Keep RecipeFork, AI food, dashboard, SaaS, commerce, auth, and content patterns well tagged for Brownfield and Hybrid discovery.
- Confirm hosted pack hydration, local cache, and custom registry precedence are consistent for Hybrid.

`decantr-content` sync requirements:

- Update content only when Hybrid implementation needs better aliases, tags, visual briefs, interactions, or certification metadata.
- Run content health, schema sync, and registry certification before any content release.
- Avoid schema changes unless existing optional fields cannot carry the needed metadata.

## Workstream 4: Adapter And Runtime Boundaries

Hybrid is where users will ask Decantr to combine runtimes. The CLI and LLM context must prevent bad moves.

Implementation candidates:

- Strengthen task-time language when a prompt asks for Angular, Svelte, Solid, Vue, Bootstrap, shadcn, or Decantr CSS inside a project detected as another runtime.
- Add route-level runtime evidence where possible.
- Make `doctor` call out whether the project is contract-only, style-bridge, Decantr CSS runtime, or mixed.
- Ensure unsupported adapter requests produce contract guidance or dry-run plans, not silent source edits.

Validation scenarios:

- "Add an Angular component to this React app."
- "Convert this route to shadcn cards but keep the current Tailwind tokens."
- "Use Bootstrap for one legacy admin page without making it the design system."
- "Adopt Decantr CSS atoms only for one generated route."

## Workstream 5: Evidence And CI

Hybrid validation must be source-grounded enough for CI and LLM repair loops.

Implementation candidates:

- Improve source evidence ranking so findings cite the most relevant affected files first.
- Keep `decantr ci` the blessed automation entrypoint.
- Let accepted local and Hybrid rules report as rule families, not only generic health warnings.
- Emit stable JSON for local law, hosted pattern adoption, visual evidence, and route drift.
- Keep generated workflow placement monorepo-aware and pinned to the installed CLI.

Validation scenarios:

- Root pnpm workspace with app-scoped Decantr projects.
- Turbo with mixed adopted and non-adopted apps.
- GitHub Actions workflow generation.
- Generic CI snippet generation for Jenkins, Buildkite, GitLab, and custom build systems.
- Baseline comparison after a route-level design-system change.

## Workstream 6: Documentation

Every Hybrid behavior change must update the public and maintainer surfaces in the same branch:

- Root `README.md`
- `docs/index.html`
- `docs/README.md`
- `docs/llms.txt`
- `docs/guides/existing-apps.md`
- `docs/guides/monorepos.md`
- `docs/guides/project-health-ci.md`
- `docs/guides/ai-assistant-setup.md`
- `docs/reference/workflow-model.md`
- `docs/reference/project-health.md`
- `docs/reference/command-surface.md`
- `docs/reference/package-support-matrix.md`
- changed package READMEs
- schemas index if schema behavior changes
- sitemap
- release notes
- Decantr engineering skill

The docs should keep the first-mile path short and move command details into reference pages.

## First Implementation Candidates

Start Hybrid with the smallest useful product slice:

1. Add lane-aware `doctor` recommendations.
2. Improve `task` authority blocks for observed app, accepted local law, hosted patterns, and runtime boundaries.
3. Improve `suggest` and `codify --from-audit` for buttons, cards, forms, nav, theme variants, and design-token drift.
4. Add dry-run hosted-pattern-to-local-law adoption guidance.
5. Add docs that explain contract-only, Hybrid, and Greenfield without a command wall.

## Exit Criteria

Hybrid is ready for release when a cold monorepo user can:

- Attach one existing app.
- Understand the lane they are in.
- Codify one local component family.
- Optionally map one hosted pattern into project-owned law.
- Ask an LLM to make a route change using `decantr task`.
- Run one local command and one CI command that validate the selected lane.
- Read docs that explain the workflow without requiring Decantr-internal vocabulary.
