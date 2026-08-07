# Add Decantr To An Existing App

Decantr is an agent-neutral UI change-control layer for Brownfield applications. It observes the app before writing, prepares scoped context for a coding agent, verifies the resulting change, and reports local evidence.

**Current release:** Decantr 3.9.4. **3.10 is an active proof program, not a released or value-proven line.** Current task context remains primarily route-backed; the broader UI-surface model below is the 3.10 target.

## 1. Observe

Start with a read-only scan:

```bash
npx @decantr/cli scan
```

The command reads the selected app in place. It does not create `.decantr`, install dependencies, run package scripts, build the app, upload source, or open a pull request.

For a monorepo, install once at the workspace root and identify the app explicitly:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr scan --project apps/web --json
```

Keep the same `--project` value for adoption, task context, verification, and CI. Workspace package-manager evidence may come from the root; framework and UI authority must come from the selected app.

## Read The Result Conservatively

A parseable 3.9.4 scan proves that the scanner ran. It does not prove that Decantr found the canonical production sources or enough of the UI to govern a change.

Before adoption, check:

- the selected app root is the intended application, not docs, Storybook, an API, a demo, or a sibling app;
- representative production URLs resolve to the real implementation source;
- tests, fixtures, stories, mocks, generated files, coverage, build output, and sibling apps are not production authority;
- route completeness matches the real application closely enough for a 3.9.4 task; broader surface completeness is a separate 3.10 candidate axis;
- component evidence distinguishes production, package, route-local, and story-only candidates;
- styling evidence names the actual project authority, not merely an installed dependency;
- limitations are explicit and consistent with the reported result.

Do not treat `strong_fit`, a numeric confidence score, route count, or component count as a readiness decision. The [3.9.4 Day-0 baseline](../benchmarks/2026-07-22-decantr-3-9-4-day-zero.md) records current cases where aggregate language conceals unresolved styling, missing components, incomplete routes, or an inapplicable route ontology.

### Angular Check

For Angular, verify that authority starts from the selected production target in `angular.json` or `project.json`, follows the configured bootstrap and router providers, and reaches the canonical route graph and rendered components. A `Routes` array in a test or fixture is not authority. A Tailwind package is not styling authority when Angular builder styles, PrimeNG, Bootstrap, Sass, or project configuration provide stronger evidence.

In 3.9.4, Angular adoption blocks unresolved or partial production-route authority unless `--force` is explicit. A force override records an operator decision; it does not make the evidence proven, and task/CI consumers should continue to fail closed.

### Next.js Check

For the 3.10 candidate, inspect both the App/Pages Router files and deployment reachability policy. A `page.tsx` proves a source declaration; it does not by itself prove that the route is available in the target deployment. Root or `src/` `middleware.*` and Next 16 `proxy.*` files, plus reachable local policy helpers, can condition a route with a 4xx response. Statically resolved routes remain visible as source signals but are non-taskable. A path-dependent non-success policy whose affected routes cannot be resolved lowers route authority to inferred/partial and blocks route task context.

Also verify that styling evidence follows the complete ordered imports from production layouts or entrypoints. Workspace package exports may own foundation and brand CSS ahead of app-local global and override files. API `route.ts` exports such as `GET` and `POST` are server handlers, not UI components.

## 2. Adopt Once

After reviewing the scan:

```bash
npx @decantr/cli adopt --yes
```

In a monorepo:

```bash
pnpm exec decantr adopt --project apps/web --yes
```

Adoption is the one-time attachment boundary. It can write an accepted Decantr contract, compact project context, graph and evidence artifacts, project state, and explicitly requested CI configuration. It does not create or edit formatter ignore files. In Brownfield, production source and runtime configuration remain first authority; accepted Essence is project law beneath that source and any conflict remains visible. The adoption receipt distinguishes Decantr governance writes from host source and records any narrowly approved source mutation.

Official content is optional reference material, not authority over the app. Adoption does not bulk-hydrate it by default; use `--packs` only when you want the full page/review pack set materialized locally. `--no-packs` remains a compatibility spelling for scripts that explicitly disabled the old default.

### What Decantr Does Not Take Over

- the router or production entrypoint;
- the framework or package manager;
- Tailwind, PrimeNG, Sass, CSS Modules, MUI, Chakra, Bootstrap, or another styling system;
- project components, Storybook, design files, tests, linting, or accessibility tooling;
- existing assistant instructions or MCP servers;
- source hosting or pull-request creation.

Hosted source upload is retired. Browser evidence remains local unless the user deliberately moves it.

## 3. Prepare A Change

For the published 3.9.4 route-backed path:

```bash
npx @decantr/cli task /feed "add saved recipe actions"
```

From a monorepo root:

```bash
pnpm exec decantr task /feed "add saved recipe actions" --project apps/web
```

Give the output to the coding agent or let an MCP client request the same task context. The agent should start with the ranked production implementation, observe the authority and stop conditions, make the change with its normal tools, and run the returned verification command.

If task context reports missing or stale graph data, unresolved authority, or an unsupported target, stop. Regenerate or resolve the evidence rather than allowing the agent to infer a target from weak filenames or old analysis.

### 3.10 UI-Surface Direction

The active 3.10 program broadens task authority beyond routes to:

- routes;
- layouts;
- components;
- stories;
- overlays;
- flows;
- packages;
- runtime states.

That work is not a claim that 3.9.4 already prepares all eight target kinds. Until 3.10 ships and qualifies them, use route-backed task context only where the implementation source is correct, and use repository-native component, Storybook, design-system, and runtime evidence directly for other work.

Readiness must keep selected-app authority, surface authority, completeness, taskability, component inventory, styling authority, and runtime evidence independent. The intended primary result is `ready`, `limited`, `blocked`, or `unsupported`; no score may upgrade an unresolved axis.

A deployment-conditioned route can therefore appear in the observed surface inventory while remaining blocked for task context. This is intentional: discovery records that the source exists without granting an agent production-edit authority that the deployment does not establish.

## 4. Verify And Report

Run verification after the agent edits:

```bash
npx @decantr/cli verify
```

For an app with reviewed local law:

```bash
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
```

When the app is already running, add local browser evidence:

```bash
pnpm exec decantr verify --project apps/web \
  --base-url http://localhost:3000 \
  --evidence
```

Decantr complements, rather than replaces, TypeScript, linting, host tests, Storybook, Playwright, visual regression, axe, manual accessibility review, and design-system checks. A static check must not claim runtime behavior it did not observe.

## Put The Gate In CI

Generate CI once:

```bash
pnpm exec decantr ci init --project apps/web
```

Make the generated check required in branch protection. The 3.9.4 default remains CI v2. Use explicit CI v3 only when the pipeline has the intended Git history and comparison base:

```bash
pnpm exec decantr ci --project apps/web \
  --since origin/main \
  --report-version v3 \
  --json
```

CI must keep missing, stale, incompatible, unsupported, and unresolved evidence visible. Lack of proof is not a clean pass.

## MCP Use

The MCP server preserves eight public tools. For current task preparation, call `decantr_context` with `{"action":"task"}`, the route, task, and app path. It adapts the same 3.9.4 route-backed compatibility contract as the CLI.

Do not add a second Decantr MCP server or duplicate project instructions when one project-level configuration already exists. Preserve unrelated MCP servers.

## Optional Project Law

Advanced 3.x workflows can propose reviewed project-local patterns, rules, behavior obligations, and style mappings:

```bash
pnpm exec decantr codify --from-audit --style-bridge --project apps/web
pnpm exec decantr codify --accept --confirm-reviewed --project apps/web
```

Acceptance is explicit. Project source remains the first authority. A style bridge maps Decantr intent to project-owned tokens/classes; it does not install `@decantr/css` or rewrite host styles. Official corpus patterns remain advisory until the project deliberately adopts them.

## Advanced And Compatibility Workflows

`doctor`, `resolve`, `graph`, `health`, `workspace`, `connect`, `codify`, `analyze`, and direct `init` remain callable for diagnosis or lower-level control. Studio, Greenfield blueprints, themes, showcase, telemetry, registry-named commands, broad content workflows, and explicit Decantr CSS adoption are advanced, compatibility, or historical surfaces rather than the default Brownfield journey.

Use those commands when their specific behavior is needed; do not add them to every agent prompt or normal task loop.

## Current Limits

- 3.9.4 is not proven to improve frontier-model outcomes.
- Route discovery remains materially weaker on some frameworks and package-shaped UI repositories.
- Static component inventory is advisory.
- Styling authority may be scoped or conflicting rather than one global winner.
- Runtime, visual, and accessibility evidence can be incomplete.
- The 3.9 human finding-qualification lane remains incomplete.

The 3.10 release may make only the claims that pass its frozen Day-0 and 320-run A/B gates. See the [3.10 proof program](../programs/2026-07-22-decantr-3-10-ui-change-control-proof.md).

## Related Docs

- [AI assistant setup](ai-assistant-setup.md)
- [Monorepos](monorepos.md)
- [Workflow model](../reference/workflow-model.md)
- [Command surface](../reference/command-surface.md)
- [Project Health](../reference/project-health.md)
- [3.9.4 Day-0 baseline](../benchmarks/2026-07-22-decantr-3-9-4-day-zero.md)
