# Decantr Workflow Model

Decantr is an agent-neutral UI change-control layer. Stable 3.10 organizes existing commands into this primary loop:

1. **Observe** project-owned authority.
2. **Prepare** compact context for a specific change.
3. **Verify** the resulting diff against that authority and available runtime evidence.
4. **Report** typed, reproducible evidence.

**Status:** 3.10.0 is the current published stable release. This reference describes shipped behavior. The product is released but is not value-proven against frontier models.

## Default Existing-App Workflow

| Stage | Command | Write behavior | Purpose |
| --- | --- | --- | --- |
| Observe | `decantr scan` | Read-only | Select the app, inventory evidence, and expose limitations. |
| Attach once | `decantr adopt --yes` | Writes reviewed Decantr artifacts | Establish project state, contract/context, baseline, and optional CI. |
| Prepare | `decantr task <target> "<change>"` | Read-only | Rank implementation and authority for one route or non-route UI target. |
| Verify | `decantr verify` | Read-only except explicit evidence/baseline outputs | Evaluate the change and return remediation/evidence. |
| Report | Project Health, JSON, Evidence Bundle, CI | Artifact-dependent | Make the result inspectable by people, agents, and automation. |

CI setup is one-time:

```bash
decantr ci init
```

The daily developer/agent loop is `task -> edit -> verify`. CI is the durable merge boundary.

## Observe

The shipped scanner must answer two different questions separately:

1. What project evidence was observed?
2. Is that evidence sufficient for the requested governance task?

A successful scanner exit answers neither question by itself. It only confirms that a report was produced. The 3.9.4 Day-0 baseline showed reports with incomplete routes, unresolved styling, missing components, and route-centric misclassification despite strong aggregate language.

Published 3.10 observation reports selected-app/workspace scope, framework and build evidence, source-declared and taskable routes, UI surfaces, component/style evidence, graph readiness, independent authority axes, and limitations.

Observation identifies:

- selected application and workspace boundary;
- framework/build entry and production reachability;
- UI surfaces and implementation sources;
- component and package evidence;
- styling and token authority;
- project instructions and accepted local law;
- test, Storybook, design, runtime, visual, and accessibility evidence;
- excluded, conflicting, stale, and missing evidence.

Tests, fixtures, stories, mocks, generated files, build output, coverage, and sibling apps may be useful supporting evidence. They must not become production authority merely because they contain route or component syntax.

## UI Surfaces

The approved 3.10 authority model uses explicit UI surfaces rather than treating every project as a route map:

| Surface | Authority question |
| --- | --- |
| Route | Which production implementation renders this URL? |
| Layout | Which shell or nested layout owns the relevant region? |
| Component | Which project or package component is canonical for the change? |
| Story | Which states and usage constraints are evidenced by Storybook? |
| Overlay | Which dialog, drawer, popover, toast, or command surface owns the interaction? |
| Flow | Which sequence of surfaces and state transitions defines the user outcome? |
| Package | Which exports and conventions govern a design-system or UI library change? |
| Runtime state | Which loading, empty, error, permission, responsive, or interactive state is in scope? |

Routes remain an evidence source. They are not required for every UI repository and are not sufficient for every UI task.

This broader surface model ships in 3.10.0. Attached routes retain compatible graph-backed capsules.

## 3.10 Readiness

Readiness must not collapse into a single confidence or fit score. Evaluate at least:

- **selected-app authority:** the intended app or package was selected;
- **surface authority:** production-owned evidence identifies the target;
- **topology completeness:** enough surrounding structure was observed for the task;
- **implementation taskability:** a ranked edit target is actually resolvable;
- **component inventory quality:** reusable and local components are distinguished with limits;
- **styling authority:** scoped style/token systems, order, and conflicts are explicit;
- **runtime evidence:** observed behavior is bound to the target and current source.

The 3.10 primary state is `ready`, `limited`, `blocked`, or `unsupported`.

- `ready`: required axes are proven for the requested task.
- `limited`: useful evidence exists, but the missing axis is explicit and the task can be bounded safely.
- `blocked`: Decantr cannot prepare or verify the requested task without resolving evidence.
- `unsupported`: no current adapter or authority path can make the target reliable.

A component count cannot upgrade missing taskability. Route success cannot upgrade unresolved styling. Runtime evidence cannot repair the wrong selected app. An operator override records a decision but does not convert weak evidence into proof.

Route declaration also cannot upgrade deployment reachability. A framework file convention may prove that source exists while middleware, proxy, feature gating, or another production policy conditions whether the route can be reached. Exact policy exclusions should remain observable and non-taskable; unresolved path policy must lower authority. Styling preparation follows the selected production import graph in cascade order, including workspace-owned CSS exports, rather than choosing the first stylesheet found.

## Prepare

Task preparation should be compact, source-ranked, and model-neutral. It should include only what the change needs:

- project and target identity;
- ranked production implementation sources;
- relevant local instructions, components, styles, tokens, and tests;
- changed-file or graph impact where available;
- active findings and runtime evidence;
- conflicts, limitations, and stop conditions;
- one exact verification command.

`TaskCapsuleV1` remains a route-backed compatibility contract with a current graph requirement and bounded canonical payload. CLI and MCP must not use stale analysis or guessed root files as authority when current discovery is blocked.

For 3.10, non-route targets require a UI-surface context contract or compatible projection. A component, story, overlay, package, or runtime state must not be mislabeled as a route implementation merely to fit the old schema.

## Verify

Verification compares the actual diff with the authority prepared for the task and the host project's own checks. Depending on available evidence, it can combine:

- contract and local-rule checks;
- changed-file scope and forbidden edits;
- framework build, type, lint, and test results;
- component reuse and styling/token authority;
- DOM and interaction behavior;
- visual evidence;
- accessibility results;
- graph, baseline, and finding continuity.

Static evidence must not claim browser behavior. SPA fallback must not prove a route. Screenshot hashes prove artifact identity, not visual correctness. Accessibility evidence should distinguish violations, incomplete checks, and unavailable checks.

Decantr complements the host stack. It does not replace Storybook, Playwright, visual regression, axe, linting, type checking, tests, design review, or manual accessibility review.

## Report

Reports should preserve provenance and uncertainty. Missing, stale, incompatible, unsupported, and unresolved evidence must remain visible.

Published behavior includes:

- Project Health and Evidence Bundle outputs;
- v2 report compatibility by default;
- explicit CI v3 with `AdoptionTruthV1` and `GovernanceDeltaV1`;
- route-backed `TaskCapsuleV1`;
- local graph and baseline artifacts.

These contracts establish reproducible structure. They do not prove that Decantr improves a frontier model's implementation outcome.

## Authority Order

The default order is:

1. Brownfield production source, build/runtime configuration, providers, and package exports for the selected target;
2. scoped project-owned supporting evidence such as tests, Storybook, design tokens, and runtime artifacts;
3. reviewed project-local patterns, rules, behavior obligations, and style mappings;
4. an explicitly accepted Essence contract as project law beneath production source;
5. official Decantr content as advisory vocabulary.

Authority can be scoped. A component stylesheet may govern one component without becoming global style authority. Multiple project-owned systems can be valid in different packages or runtime regions. In Brownfield, Essence records accepted intent but cannot silently override contradictory production behavior. Decantr should report scope and conflicts instead of forcing one global winner.

## Local-First Boundary

- Scanning, task preparation, verification, and evidence generation run locally.
- Hosted source upload is retired.
- Browser evidence remains local unless the user moves it.
- No hosted account, model vendor, editor, personal skill, or Decantr CSS runtime is required.
- The optional Fly content API supplies reference material and schemas, not local project authority.
- Existing repository instructions and MCP servers remain project-owned.
- Assistant integration should add at most one small bridge rather than duplicate the full rule set across tools.

## Monorepos

Install Decantr at the workspace root, select one app, and retain that scope:

```bash
pnpm exec decantr scan --project apps/web
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr task /feed "add saved actions" --project apps/web
pnpm exec decantr verify --project apps/web
pnpm exec decantr ci init --project apps/web
```

The package manager can be workspace-owned. Framework, route, surface, component, styling, and runtime authority remain app-scoped. A sibling app must never satisfy the selected app's authority gaps.

## MCP Compatibility

The eight public Decantr 3.x tool names remain stable:

`decantr_project`, `decantr_contract`, `decantr_context`, `decantr_graph`, `decantr_registry`, `decantr_verify`, `decantr_repair`, and `decantr_contract_write`.

The published task path is `decantr_context` with `{"action":"task"}` and a route or target. Attached routes retain `TaskCapsuleV1`; other targets use `ui-surface-task-context.v1`. `decantr_registry` is a compatibility content/reference name. No ninth tool is added in 3.x.

## Advanced And Compatibility Workflows

The following remain callable where shipped but do not define the 3.10 product lead:

- Greenfield `new`, `init`, blueprints, themes, and scaffold adapters;
- Hybrid `codify`, style bridges, project-local rules, and explicit legacy Decantr CSS adoption;
- diagnostic `doctor`, `resolve`, `graph`, `health`, `workspace`, `analyze`, and `connect` commands;
- broad content-corpus authoring and hydration;
- Studio, showcase, and telemetry;
- registry-named publishing/account compatibility commands;
- Vite plugin experimentation.

Use these for explicit advanced needs. Do not add them to every assistant prompt or normal day-to-day loop. Package consolidation or removal is deferred to a future major-version compatibility decision.

## Model-Lift Research Boundary

The separate research program must prove that Decantr improves UI outcomes over a strong repository-native baseline before any measured model-lift claim, not before product publication.

The frozen design is 40 tasks across 28 pinned repositories, two requested models, control and Decantr treatment arms, and two repetitions: 320 isolated runs. It uses one repository-authentic task per target plus 12 adversarial tasks. The corpus acquisition labels are 18 development and 10 qualification; independently, the task partition is 24 development and 16 sealed qualification. Repository identities were observed during Day-0, so the set is not repository-blind; qualification solutions and evaluator oracles remain sealed, and a future independent external holdout is required for a general industry claim.

Both arms receive the same repository instructions, tests/design evidence, tools, limits, and approved policy information. Decantr may compress, rank, cite, and verify that information; it receives no extra human facts. Candidate package bytes are frozen before paid execution, and any implementation change invalidates that candidate result.

The requested models are `gpt-5.6-sol` and `claude-fable-5`. Provider substitutions remain visible and are not pooled.

Release claims require the declared Day-0 authority gates plus at least +5/100 paired rubric lift with a 95% confidence interval above zero for each model, 25% fewer governance violations, functional non-inferiority within five percentage points overall for each model, at least 26 decisive blinded-preference units out of 32 qualification task/model units, at least 60% treatment preference among decisive units, a two-sided 95% Wilson lower bound above 50%, median token/cost overhead at or below 15%, and P95 overhead at or below 25%. Framework functional estimates remain exploratory unless separately powered.

A pass permits the bounded measured claim. Mixed results narrow supported frameworks or tasks. Failure blocks value-proof language, not the stable product release. Unsupported targets, missing evaluators, build failures, and model substitutions remain visible and in the denominator.

See the [model-lift research program](../programs/2026-07-22-decantr-3-10-ui-change-control-proof.md), [3.10.0 release note](../releases/2026-08-07-decantr-3-10-0-authority-aware-ui-change-control.md), and [3.9.4 Day-0 baseline](../benchmarks/2026-07-22-decantr-3-9-4-day-zero.md).

## Historical Boundary

The [3.9 Governed Change Proof program](../programs/2026-07-16-decantr-3-9-adoption-proof-program.md), earlier workflow matrices, Greenfield certification, proof-field reports, and release notes remain historical evidence. They document prior scope and shipped compatibility but do not override the active 3.10 direction or prove model-outcome value.
