# Add Decantr To An Existing App

Decantr is an agent-neutral UI change-control layer for Brownfield applications. It observes the app before writing, prepares scoped context for a coding agent, verifies the resulting change, and reports local evidence.

**Current release:** Decantr 3.11.3. Start with zero-write Changed-UI Assurance; adoption is optional and the product is not value-proven against frontier models.

## 0. Verify The Current Change

In any Git worktree:

```bash
npx @decantr/cli@3.11.3 verify
```

This inspects staged, unstaged, deleted, renamed, and untracked UI changes. In a monorepo it selects one app only when changed files prove that choice; otherwise it returns `not_proven` and asks for `--project`. It writes nothing and requires no Decantr files. See [Change Assurance](../reference/change-assurance.md).

## 1. Observe

Start with a read-only scan:

```bash
npx @decantr/cli@3.11.3 scan
```

The command reads the selected app in place. It does not create `.decantr`, install dependencies, run package scripts, build the app, upload source, or open a pull request.

For a monorepo, install once at the workspace root and identify the app explicitly:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr scan --project apps/web --json
```

Keep the same `--project` value for adoption, task context, verification, and CI. Workspace package-manager evidence may come from the root; framework and UI authority must come from the selected app.

## Read The Result Conservatively

A parseable scan proves that the scanner ran. It does not prove that Decantr found the canonical production sources or enough of the UI to govern a change.

Before adoption, check:

- the selected app root is the intended application, not docs, Storybook, an API, a demo, or a sibling app;
- representative production URLs resolve to the real implementation source;
- tests, fixtures, stories, mocks, generated files, coverage, build output, and sibling apps are not production authority;
- route and surface completeness match the real application closely enough for the intended task;
- component evidence distinguishes production, package, route-local, and story-only candidates;
- styling evidence names the actual project authority, not merely an installed dependency;
- limitations are explicit and consistent with the reported result.

Do not treat `strong_fit`, a numeric confidence score, route count, or component count as a readiness decision. The [3.9.4 Day-0 baseline](../benchmarks/2026-07-22-decantr-3-9-4-day-zero.md) records historical cases where aggregate language concealed unresolved styling, missing components, incomplete routes, or an inapplicable route ontology.

### Angular Check

For Angular, verify that authority starts from the selected production target in `angular.json` or `project.json`, follows the configured bootstrap and router providers, and reaches the canonical route graph and rendered components. Workspace `ng-packagr` secondary entries should resolve to exported component source, wildcard fallbacks must not appear as literal `/**/...` URLs, and route task reads should include static external templates and component styles. A `Routes` array in a test or fixture is not authority. A Tailwind package is not styling authority when Angular builder styles, PrimeNG, Bootstrap, Sass, or project configuration provide stronger evidence.

Angular adoption blocks unresolved or partial production-route authority unless `--force` is explicit. A force override records an operator decision; it does not make the evidence proven, and task/CI consumers continue to fail closed.

### TanStack, Astro, And SvelteKit Check

For TanStack Router, compare public paths rather than treating `createFileRoute()` identifiers as URLs. Parenthesized groups and underscore-prefixed pathless layouts do not add public segments. The authored route file remains the implementation target; `routeTree.gen.ts` can corroborate public paths but must not replace authored source as production edit authority. If convention-sensitive identifiers cannot be corroborated, completeness remains partial.

For Astro, `.astro`, `.md`, `.mdx`, and `.html` files under `src/pages` are UI pages. TypeScript and JavaScript files in that tree are response endpoints; keep them visible for topology without granting UI task authority.

For SvelteKit, `+page.svelte` is the taskable UI implementation. Colocated `+page.ts`, `+page.js`, `+page.server.ts`, and `+page.server.js` files are page-data authority and should appear only as supporting reads. A directory with page-data modules but no `+page.svelte` must not become a taskable UI route.

### Next.js Check

For Next.js, inspect both the App/Pages Router files and deployment reachability policy. A `page.tsx` proves a source declaration; it does not by itself prove that the route is available in the target deployment. Root or `src/` `middleware.*` and Next 16 `proxy.*` files, plus reachable local policy helpers, can condition a route with a 4xx response. Statically resolved routes remain visible as source signals but are non-taskable. A path-dependent non-success policy whose affected routes cannot be resolved lowers route authority to inferred/partial and blocks route task context.

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

For an attached route using the compatible graph-backed path:

```bash
npx @decantr/cli task /feed "add saved recipe actions"
```

From a monorepo root:

```bash
pnpm exec decantr task /feed "add saved recipe actions" --project apps/web
```

Give the output to the coding agent or let an MCP client request the same task context. The agent should start with the ranked production implementation, observe the authority and stop conditions, make the change with its normal tools, and run the returned verification command.

If task context reports missing or stale graph data, unresolved authority, or an unsupported target, stop. Regenerate or resolve the evidence rather than allowing the agent to infer a target from weak filenames or old analysis.

### 3.10 UI-Surface Context

Stable 3.10 task authority also covers:

- routes;
- layouts;
- components;
- stories;
- overlays;
- flows;
- packages;
- runtime states.

Use authority-aware context only where the implementation source is correct. Continue to combine it with repository-native component, Storybook, design-system, test, and runtime evidence.

Readiness keeps selected-app authority, surface authority, completeness, taskability, component inventory, styling authority, and runtime evidence independent. The primary result is `ready`, `limited`, `blocked`, or `unsupported`; no score may upgrade an unresolved axis.

A deployment-conditioned route can therefore appear in the observed surface inventory while remaining blocked for task context. This is intentional: discovery records that the source exists without granting an agent production-edit authority that the deployment does not establish.

## 4. Verify And Report

Run Changed-UI Assurance after the agent edits:

```bash
npx @decantr/cli verify
```

For a full Project Health pass over an app with reviewed local law:

```bash
pnpm exec decantr verify --full --brownfield --local-patterns --project apps/web
```

When the app is already running, add local browser evidence:

```bash
pnpm exec decantr verify --full --project apps/web \
  --base-url http://localhost:3000 \
  --evidence
```

Decantr complements, rather than replaces, TypeScript, linting, host tests, Storybook, Playwright, visual regression, axe, manual accessibility review, and design-system checks. A static check must not claim runtime behavior it did not observe.

## Put The Gate In CI

Generate CI once:

```bash
pnpm exec decantr ci init --project apps/web
```

Make the generated check required in branch protection. The compatibility default remains CI v2. Explicit CI v3 carries the same Changed-UI Assurance report as bare verify when the pipeline has the intended Git history and comparison base:

```bash
pnpm exec decantr ci --project apps/web \
  --since origin/main \
  --report-version v3 \
  --json
```

CI must keep missing, stale, incompatible, unsupported, and unresolved evidence visible. Lack of proof is not a clean pass.

## MCP Use

The MCP server preserves eight public tools. For post-edit assurance, call `decantr_verify` with `{"action":"changes"}`. For task preparation, call `decantr_context` with `{"action":"task"}`, the route or target, task, and app path. Both adapt verifier-owned contracts used by the CLI.

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

- 3.11.3 is not proven to improve frontier-model outcomes or establish finding precision/recall.
- Primitive-reuse assurance is strongest for JSX/TSX. Angular, Vue, and other template parity remains limited in 3.11.
- Route discovery remains materially weaker on some frameworks and package-shaped UI repositories.
- Static component inventory is advisory.
- Styling authority may be scoped or conflicting rather than one global winner.
- Runtime, visual, and accessibility evidence can be incomplete.
- The 3.9 human finding-qualification lane remains incomplete.

The separate model-lift program may make only the claims that pass its frozen Day-0 and 320-run A/B gates. Those gates do not define product publication readiness. See the [research program](../programs/2026-07-22-decantr-3-10-ui-change-control-proof.md).

## Related Docs

- [AI assistant setup](ai-assistant-setup.md)
- [Change Assurance](../reference/change-assurance.md)
- [Monorepos](monorepos.md)
- [Workflow model](../reference/workflow-model.md)
- [Command surface](../reference/command-surface.md)
- [Project Health](../reference/project-health.md)
- [3.9.4 Day-0 baseline](../benchmarks/2026-07-22-decantr-3-9-4-day-zero.md)
