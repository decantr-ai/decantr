# Decantr FAQ

## What is Decantr?

Decantr is agent-neutral UI change control. Published 3.11.3 starts with zero-setup Changed-UI Assurance and retains authority-aware route and non-route context for deeper work.

The product loop is **Observe -> Prepare -> Verify -> Report**, assembled from existing commands. Decantr does not replace the coding agent, router, component library, styling system, Storybook, design files, tests, or human review.

## What is the current release?

Decantr **3.11.3** is the current stable release. It is released but is not value-proven against frontier models.

The [3.11.3 release note](releases/2026-08-08-decantr-3-11-3-sveltekit-task-authority.md) and [Change Assurance contract](reference/change-assurance.md) define the current boundary. The [3.10.0 release note](releases/2026-08-07-decantr-3-10-0-authority-aware-ui-change-control.md) defines the retained authority foundation. The separate [model-lift program](programs/2026-07-22-decantr-3-10-ui-change-control-proof.md) defines research claim gates.

## How do I start in an existing app?

Start with Changed-UI Assurance; it needs no attachment:

```bash
npx @decantr/cli@3.11.3 verify
```

For deeper authority and task context, scan, attach once, then use the task and full-health loop:

```bash
npx @decantr/cli@3.11.3 scan
npx @decantr/cli adopt --yes
npx @decantr/cli task /feed "add saved actions"
npx @decantr/cli verify --full
npx @decantr/cli ci init
```

Bare `verify` and `scan` are read-only. `adopt` is the one-time write boundary. `task` prepares bounded route or non-route agent context. `verify --full` runs broader Project Health. `ci init` installs the durable automation gate.

## How do I use Decantr in a monorepo?

Install at the workspace root. Bare verify auto-selects one app when the changed files prove that choice; use `--project` when work crosses apps or selection is intentional:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr verify
pnpm exec decantr scan --project apps/web
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr task /feed "add saved actions" --project apps/web
pnpm exec decantr verify --full --project apps/web
pnpm exec decantr ci init --project apps/web
```

Package-manager evidence may come from the workspace root. Framework, route, surface, component, styling, and runtime authority must come from the selected app, not a sibling.

## Does a successful scan mean Decantr understood the app?

No. A successful process exit means the scanner produced a report. It does not prove that the selected app, route graph, component inventory, style authority, or rank-one implementation source is correct.

Before adopting, inspect representative production targets and limitations. In particular, confirm that tests, fixtures, stories, generated files, build output, and sibling apps were not promoted to production authority. The Day-0 baseline contains examples where high fit/confidence language concealed incomplete or inapplicable evidence.

## What is a UI surface?

The approved 3.10 model covers eight kinds of target:

- routes;
- layouts;
- components;
- stories;
- overlays such as dialogs and drawers;
- flows crossing multiple screens or states;
- packages such as design systems;
- runtime states such as loading, empty, error, permission, and responsive states.

Routes remain useful evidence, but they are not the universal unit of UI work. A design-system package can be a valid target with no application router. A URL literal in a test is not a production route.

## How does Decantr decide whether a task is ready?

Decantr 3.10 keeps these axes independent:

- selected-app authority;
- production-surface authority;
- topology completeness;
- implementation taskability;
- component inventory quality;
- styling authority;
- runtime evidence.

The primary result is `ready`, `limited`, `blocked`, or `unsupported`. A route can be proven while styling remains unresolved. A large component inventory cannot compensate for a missing implementation target. Numeric confidence must not override an unresolved axis.

This readiness model ships in 3.10.0. Consumers must still inspect the individual axes rather than paraphrasing them into a stronger result.

## What should an agent do before editing?

For the current route-backed CLI path:

```bash
npx @decantr/cli task /feed "improve loading and saved-item behavior"
```

The agent should read the ranked project source and authority returned by the command, make the change with its normal tools, and run the exact verification command returned in the task context. If Decantr reports stale, missing, conflicting, or unsupported authority, stop and resolve that limitation instead of guessing.

Decantr should complement repository-native instructions. Do not add redundant `AGENTS.md`, Cursor, Claude, and editor rule files merely to repeat the same workflow.

## Does Decantr require a specific model or editor?

No. CLI output, project files, JSON contracts, CI artifacts, and MCP are model- and editor-neutral. The project can use its existing agent, tools, tests, and instructions.

Cursor has a compatibility setup command, and any MCP-compatible client can use the MCP server, but neither is required.

## What MCP tools are public?

Decantr 3.x preserves exactly eight tool identities:

`decantr_project`, `decantr_contract`, `decantr_context`, `decantr_graph`, `decantr_registry`, `decantr_verify`, `decantr_repair`, and `decantr_contract_write`.

For task preparation, use `decantr_context` with `{"action":"task"}` and a route or target. Attached routes retain compatible `TaskCapsuleV1`; other targets use the authority-aware discovery envelope. `decantr_registry` is a compatibility name over `@decantr/content`; it is not a hosted public marketplace and there is no ninth content tool in 3.x.

## Is Decantr local-first?

Yes.

- `scan`, task preparation, verification, and evidence generation run locally.
- Hosted source upload is retired.
- Browser screenshots and evidence remain local unless the user moves them.
- A hosted account is not required.
- The optional Fly content API provides reference content and schemas; it is not project authority.
- Telemetry has no Decantr-hosted default sink.

## What does adoption write?

Brownfield adoption can write an accepted Decantr contract, compact project context, graph/evidence artifacts, project state, and optional CI configuration when explicitly requested. It does not create or edit formatter ignore files. Production source and runtime configuration remain first authority; the accepted Essence contract is project law beneath that source, not a replacement for it. The adoption receipt distinguishes these writes from host source.

Review `scan` first. Use `adopt --force` only as a visible, manual override when you understand an unresolved discovery result; an override does not make the evidence proven.

## How do I enforce Decantr in CI?

Generate the current default workflow once:

```bash
npx @decantr/cli ci init
```

Then make the generated check required in branch protection. Existing CI v2 behavior remains the 3.10 compatibility default. Explicit CI v3 remains available for the published `AdoptionTruthV1` and `GovernanceDeltaV1` contracts:

```bash
npx @decantr/cli ci --since origin/main --report-version v3 --json
```

Missing, stale, or incompatible evidence must remain visible. CI should not interpret missing proof as a clean result.

## Does Decantr replace project tests or accessibility tools?

No. Keep ESLint/Biome, TypeScript, host tests, Storybook, Playwright, visual regression, axe, manual accessibility review, and design-system checks. Published 3.10 ranks route and non-route context from available authority rather than recreating every specialist tool.

## Is Decantr a code generator?

Not as its primary product. The agent writes the code. The current Greenfield scaffold and blueprint commands remain callable in 3.x, but Greenfield generation, themes, and broad blueprint expansion are not active 3.10 investment.

For a new app, choose the framework and project template on their own merits. Attach Decantr when you want the same Observe -> Prepare -> Verify -> Report loop. Existing `new`, `init`, blueprint, and theme workflows are advanced compatibility surfaces.

## Is `@decantr/css` required?

No. `@decantr/css` is a legacy optional adapter. Brownfield and normal contract-only workflows keep the project's Tailwind, PrimeNG, Sass, CSS Modules, MUI, Chakra, Bootstrap, or other styling authority.

Package presence alone is not styling authority. Decantr must use project configuration, reachable imports/providers, style order, tokens, components, and runtime evidence where available.

## What happened to the public registry?

The public registry portal and community marketplace direction are retired. `@decantr/registry`, `decantr registry ...`, `REGISTRY_URL`, and MCP `decantr_registry` remain 3.x compatibility names over content-owned implementations.

`@decantr/content` is a supported policy/reference package. Broad corpus growth and registry publishing are not active 3.10 product work. The optional content API remains a helper for schemas, search, and reference material.

## What about Studio, showcase, telemetry, and themes?

They remain available where shipped, but they are advanced, compatibility, or historical surfaces. The 3.10 release does not invest in Studio/showcase expansion, telemetry product work, themes, or hosted cross-repository intelligence.

## Has Decantr proven that it improves frontier models?

No. The separate model-lift research program exists to test that claim; it is not the product release gate.

The [Culinary Platform clean-slate replay](benchmarks/2026-08-07-culinary-platform-clean-slate-adoption.md) did prove that one real Next.js failure could be reproduced and repaired: seven middleware-conditioned routes now fail closed, six ordered stylesheet layers reach task context, API handlers no longer inflate UI components, and one bounded route change passed native and responsive verification. It does not prove model lift because the oracle was known, no control arm ran, and the implementation was not blinded.

The frozen experiment is 40 tasks across 28 pinned repositories, two requested models, control and Decantr treatment arms, and two repetitions: 320 isolated runs. It includes one repository-authentic task per target and 12 adversarial tasks. The corpus acquisition labels are 18 development and 10 qualification; independently, the task partition is 24 development and 16 sealed qualification. Repository identities were seen during Day-0, so this is not a repository-blind holdout; sealed solutions/oracles and a future independent external holdout limit the claim honestly.

Both arms receive the same information entitlement. Decantr may rank, compress, cite, and verify that information; it may not receive extra human facts. Candidate package bytes are frozen before paid execution, and an implementation change invalidates that result.

The requested models are OpenAI `gpt-5.6-sol` and Anthropic `claude-fable-5`. Any substitution is reported and excluded from the requested-model result.

## What would count as model-lift proof?

The full predeclared boundary is in the [3.10 program](programs/2026-07-22-decantr-3-10-ui-change-control-proof.md). Core gates include:

- correct app selection or honest `unsupported` for all 28 repositories;
- no test, fixture, story, generated, build-output, or sibling-app authority contamination;
- correct rank-one implementation whenever Decantr says a task is ready;
- at least +5/100 paired treatment lift with 95% CI above zero for each model;
- at least 25% fewer governance violations;
- functional non-inferiority within 5 percentage points overall for each model, with framework strata exploratory unless separately powered;
- at least 26 decisive units out of 32 qualification task/model units, at least 60% treatment preference among decisive units, and a two-sided 95% Wilson lower bound above 50%;
- median token/cost overhead no higher than 15%, P95 no higher than 25%.

Unsupported targets, evaluator gaps, build failures, and model substitutions remain visible and in the denominator.

## What happens if the benchmark is mixed or fails?

A pass permits only the measured, bounded claim. Mixed results require narrower framework or task claims and a narrower product. Failure blocks value-proven language and requires Decantr to contract toward verifier, authority-adapter, and CI infrastructure or stop broad expansion.

Failure does not automatically delete repositories, packages, services, or historical evidence.

## What did 3.9.4 prove?

The 3.9 route/source and isolated machine lanes are complete. The two-human finding lane is incomplete. Stable publication used an explicit sole-maintainer waiver.

Therefore 3.9.4 must not be described as proving human precision/recall, human release qualification, broad adoption value, or material improvement to frontier-model UI changes.

## Where are older workflows documented?

Historical release notes, audits, programs, benchmarks, research, and specifications remain in their dated directories. Treat them as evidence of what was proposed or shipped at that time. Active guides, references, and the 3.11.3 release note describe current product usage; the research program describes only the experimental claim boundary.
