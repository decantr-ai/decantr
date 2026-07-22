# Decantr FAQ

## What is Decantr?

Decantr is agent-neutral UI change control. Published 3.9.4 prepares route-backed context for an attached project and gives people and CI evidence after the change. The unreleased 3.10 candidate broadens that model to non-route UI surfaces.

The 3.10 candidate loop is **Observe -> Prepare -> Verify -> Report**, assembled from existing commands. Decantr does not replace the coding agent, router, component library, styling system, Storybook, design files, tests, or human review.

## What is the current release?

Decantr **3.9.4** is the current published stable release. Decantr **3.10 is an active proof program**, not a released or value-proven line.

The [3.10 program](programs/2026-07-22-decantr-3-10-ui-change-control-proof.md) defines intended behavior and release gates. The [3.9.4 Day-0 baseline](benchmarks/2026-07-22-decantr-3-9-4-day-zero.md) documents current discovery weaknesses. Neither document turns planned behavior into shipped behavior.

## How do I start in an existing app?

Scan first, attach once, then use the daily task and verify loop:

```bash
npx @decantr/cli scan
npx @decantr/cli adopt --yes
npx @decantr/cli task /feed "add saved actions"
npx @decantr/cli verify
npx @decantr/cli ci init
```

`scan` is read-only. `adopt` is the one-time write boundary. `task` prepares agent context; in 3.9.4 it is primarily route-backed. `verify` checks the result. `ci init` installs the durable automation gate.

## How do I use Decantr in a monorepo?

Install at the workspace root and keep the selected app explicit:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr scan --project apps/web
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr task /feed "add saved actions" --project apps/web
pnpm exec decantr verify --project apps/web
pnpm exec decantr ci init --project apps/web
```

Package-manager evidence may come from the workspace root. In 3.9.4, framework and route authority must come from the selected app, not a sibling. The same selected-app rule applies to the broader 3.10 candidate surface, component, styling, and runtime axes.

## Does a successful scan mean Decantr understood the app?

No. A successful process exit means the scanner produced a report. It does not prove that the selected app, route graph, component inventory, style authority, or rank-one implementation source is correct.

Before adopting with 3.9.4, inspect representative production targets and limitations. In particular, confirm that tests, fixtures, stories, generated files, build output, and sibling apps were not promoted to production authority. The Day-0 baseline contains examples where high fit/confidence language concealed incomplete or inapplicable evidence.

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

The 3.10 direction keeps these axes independent:

- selected-app authority;
- production-surface authority;
- topology completeness;
- implementation taskability;
- component inventory quality;
- styling authority;
- runtime evidence.

The primary result is intended to be `ready`, `limited`, `blocked`, or `unsupported`. A route can be proven while styling remains unresolved. A large component inventory cannot compensate for a missing implementation target. Numeric confidence must not override an unresolved axis.

This readiness model is a 3.10 target. Do not infer that every 3.9.4 report already enforces it.

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

For task preparation, use `decantr_context` with `{"action":"task"}`. In 3.9.4 this remains route-backed. `decantr_registry` is a compatibility name over `@decantr/content`; it is not a hosted public marketplace and there is no ninth content tool in 3.x.

## Is Decantr local-first?

Yes.

- `scan`, task preparation, verification, and evidence generation run locally.
- Hosted source upload is retired.
- Browser screenshots and evidence remain local unless the user moves them.
- A hosted account is not required.
- The optional Fly content API provides reference content and schemas; it is not project authority.
- Telemetry has no Decantr-hosted default sink.

## What does adoption write?

Brownfield adoption can write an accepted Decantr contract, project context, graph/evidence artifacts, project state, formatter ignore entries for generated artifacts, and optional CI configuration. Production source and runtime configuration remain first authority; the accepted Essence contract is project law beneath that source, not a replacement for it. The 3.9.4 flow records an adoption receipt so these writes can be distinguished from host source.

Review `scan` first. Use `adopt --force` only as a visible, manual override when you understand an unresolved discovery result; an override does not make the evidence proven.

## How do I enforce Decantr in CI?

Generate the current default workflow once:

```bash
npx @decantr/cli ci init
```

Then make the generated check required in branch protection. Existing CI v2 behavior remains the 3.9.4 default. Explicit CI v3 remains available for the published `AdoptionTruthV1` and `GovernanceDeltaV1` compatibility contracts:

```bash
npx @decantr/cli ci --since origin/main --report-version v3 --json
```

Missing, stale, or incompatible evidence must remain visible. CI should not interpret missing proof as a clean result.

## Does Decantr replace project tests or accessibility tools?

No. Keep ESLint/Biome, TypeScript, host tests, Storybook, Playwright, visual regression, axe, manual accessibility review, and design-system checks. Published 3.9.4 ranks route-backed task context; the 3.10 candidate attempts broader surface authority. In both cases Decantr combines available evidence rather than recreating every specialist tool.

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

They remain available where shipped, but they are advanced, compatibility, or historical surfaces. The 3.10 proof does not invest in Studio/showcase expansion, telemetry product work, themes, or hosted cross-repository intelligence.

## Has Decantr proven that it improves frontier models?

No. That is the purpose of the 3.10 program.

The frozen experiment is 40 tasks across 28 pinned repositories, two requested models, control and Decantr treatment arms, and two repetitions: 320 isolated runs. It includes one repository-authentic task per target and 12 adversarial tasks. The corpus acquisition labels are 18 development and 10 qualification; independently, the task partition is 24 development and 16 sealed qualification. Repository identities were seen during Day-0, so this is not a repository-blind holdout; sealed solutions/oracles and a future independent external holdout limit the claim honestly.

Both arms receive the same information entitlement. Decantr may rank, compress, cite, and verify that information; it may not receive extra human facts. Candidate package bytes are frozen before paid execution, and an implementation change invalidates that result.

The requested models are OpenAI `gpt-5.6-sol` and Anthropic `claude-fable-5`. Any substitution is reported and excluded from the requested-model result.

## What would count as 3.10 proof?

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

Historical release notes, audits, programs, benchmarks, research, and specifications remain in their dated directories. Treat them as evidence of what was proposed or shipped at that time. Active guides and references describe current usage; the active 3.10 program describes intended behavior until a release ships it.
