# Add Decantr To An Existing App

Use Decantr when an AI-built or AI-maintained frontend needs a durable product contract without a rewrite. Brownfield adoption is observe-first: Decantr reads the existing app, proposes a contract, and keeps the current router, styling system, docs, and assistant rules authoritative until you accept the proposal.

## Start

Preview the fit before you attach anything:

```bash
npx @decantr/cli scan
```

Hosted source scanning is retired. Clone or open the repository locally and run the CLI scan inside the selected app; it reads source in place and does not upload it.

When the scan proves the app is a good Brownfield UI target, attach Decantr:

```bash
npx @decantr/cli adopt --yes
```

For monorepos, install once at the workspace root, then point Decantr at the app:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr setup
pnpm exec decantr workspace list
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr doctor --project apps/web
```

In mixed workspaces, keep the first scan app-scoped too:

```bash
pnpm exec decantr scan --project apps/web --json
```

The JSON output is `scan-report.v2`. It reports the selected app path, the workspace package manager discovered by walking upward from that app, framework/language evidence, route signal count, taskable route count, excluded production-source count, route authority and completeness, authority files, component inventory confidence, styling authority, assistant rule files, and limitations. If `apps/web` is React/Vite/TypeScript beside an Angular sibling, Decantr should report the React app when `--project apps/web` is selected.

## Read Route Proof Before Adoption

Route discovery is evidence, not a universal filename search. Decantr's governance contracts are stack-agnostic, while source authority is framework-specific.

For Angular, Decantr selects the app from `angular.json` or `project.json`, starts from the configured production bootstrap, follows static TypeScript imports to `provideRouter(...)` or `RouterModule.forRoot(...)`, resolves nested and lazy route arrays, and maps rendered routes to component implementations. Test, fixture, mock, E2E, and generated source are excluded. Lazy routing boundaries remain graph signals but are not taskable pages by themselves.

Check these fields before attaching an Angular app:

- `routes.authority` must be `proven`
- `routes.completeness` must be `complete`
- `routes.authorityFiles` must name the actual bootstrap/config/route chain
- `routes.items` must map representative production URLs to the expected implementation files
- `routes.excludedSourceCount` should account for test and fixture source where present
- `styling.evidence` should identify the selected app's actual style authority

If those conditions are not met, `scan` withholds the adopt recommendation and `adopt` refuses before writing. Fix the unresolved route source and rerun. `decantr adopt --force` is available only for a reviewed operator override; it does not make the route graph proven. Angular CLI/MCP route tasks and CI v3 continue to fail closed when the current production route is unproven.

`scan` is look-don't-touch reconnaissance. `analyze` is the local primitive that writes Brownfield intelligence and an observed proposal. `adopt` is the paved path that explains and runs the primitive flow for you: `analyze`, proposal acceptance, content-pack hydration when online, Project Health, a baseline, and optional CI setup. Adoption records a bounded before/after receipt in `.decantr/project.json` so `AdoptionTruthV1` can distinguish created or updated governance artifacts from authored host source that was proven untouched. An incomplete snapshot produces an explicit limitation rather than a source-integrity claim. If the host uses Prettier or Oxfmt, adoption also adds generated Decantr artifacts to `.prettierignore` at the app and workspace formatter boundaries. Pass `--no-packs` for a fully local/offline attach and hydrate packs later with `decantr content compile-packs <app>/decantr.essence.json --write-context`.

If the app is already running and you want Decantr to attach route screenshots to task context, add visual evidence after adoption:

```bash
npx @decantr/cli verify --project apps/web --base-url http://localhost:3000 --evidence
```

## What Decantr Writes

- `decantr.essence.json`: the accepted design and product contract.
- `DECANTR.md`: the project-level assistant primer.
- `.decantr/context/`: scoped implementation context for the AI assistant.
- `.decantr/README.md`: artifact ownership guide that explains canonical, generated, proposal, and local-only files.
- `.decantr/doctrine-map.json`: ranked evidence from existing docs, rules, architecture, and workflow files.
- `.decantr/brownfield-report.md`: human-readable inventory and proposal notes.
- `.decantr/brownfield-intelligence.json`: route, component, styling, feature, dependency, and evidence summary for task-time context.
- `.decantr/theme-inventory.json`: observed light/dark/variant theme selectors and token evidence. Essence V4 is unchanged; variants are reported, not promoted.
- `.decantr/enrichment-backlog.md`: checklist for turning the first attach pass into stronger section/page directives.
- `.decantr/evidence/visual-manifest.json`: local route-to-screenshot map when `verify --base-url <url> --evidence` is run.
- `.decantr/local-patterns.proposal.json`: project-owned pattern proposal when `decantr codify --from-audit` is run.
- `.decantr/rules.proposal.json`: project-owned rule proposal when `decantr codify --from-audit` is run.
- `.decantr/local-patterns.json`: accepted project-owned UI law after `decantr codify --accept --confirm-reviewed`. It may include optional `behavior_obligations` for app-owned interaction and accessibility rules.
- `.decantr/rules.json`: accepted project-owned local rule checks after the same reviewed acceptance command.
- `.decantr/project.json`: workflow/adoption state plus the latest adoption receipt used to report created, updated, deleted, or untouched paths without following symlinks.

## What Decantr Does Not Do

- `decantr scan` does not write `.decantr`, save a report, install dependencies, build the app, run scripts, upload source, or open pull requests.
- It does not replace your router.
- It does not take over Tailwind, Bootstrap, MUI, Chakra, plain CSS, or another existing styling system.
- It does not mutate assistant rule files unless you explicitly use the assistant bridge apply flow.
- It does not upload source code, prompts, or health reports.
- It does not upload screenshots; browser evidence remains local in Decantr 3.9.

## Scan, Analyze, Adopt

Use `scan` when you want a no-risk answer to "is this a Decantr Brownfield UI target?" It reports framework, package manager, primary language, route evidence, taskable route evidence, component inventory confidence, style signals, Decantr presence, assistant-rule files, GitHub Pages hints, fallback warnings, and next commands. Component counts are advisory static inventory evidence; the terminal output labels confidence instead of pretending every reusable component was found. Non-web repositories, such as Python/backend projects, return a useful "not a Brownfield UI target" result instead of failing.

Use `analyze` when you are ready for local artifacts: doctrine map, Brownfield intelligence, theme inventory, enrichment backlog, report markdown, and an observed essence proposal.

Use `adopt` when you want the guided attach workflow. It can write the accepted contract, generated context, optional content packs, local evidence, and CI guidance depending on the flags you choose. On Angular projects it first requires complete bootstrap-reachable route authority; use `--force` only after manual inspection of the scan payload.

## When To Use This Path

Use brownfield attach when your app already exists and the problem is drift: AI-generated pages stop matching the intended product shape, routes grow without a coherent map, or design-system decisions get repeated differently across screens.

For day-two work, ask assistants to load task context before editing. MCP clients can call `decantr_context` with `{ "action": "task" }`, a route, and a task. CLI-only workflows can use `decantr task <route> "<task>"`. Both compatibility surfaces are built from one `TaskCapsuleV1`. Task activation requires a current typed graph, starts with the discovered implementation source as a required rank-one read target, carries active authority/impact/content provenance, and keeps the default canonical capsule within 12,000 UTF-8 bytes and 4,000 deterministic estimated tokens.

The CLI shortcut is:

```bash
npx @decantr/cli task /feed "add saved recipe actions"
npx @decantr/cli verify --brownfield --local-patterns
```

When the app has repeated local UI decisions that Decantr cannot infer from the official corpus, codify them as project-owned law:

```bash
npx @decantr/cli codify --from-audit --style-bridge
# review .decantr/local-patterns.proposal.json and .decantr/rules.proposal.json
# review .decantr/style-bridge.proposal.json if you want Decantr intent mapped to project tokens/classes
npx @decantr/cli codify --map-pattern hero
# review the advisory content-pattern mapping before accepting it as local law
npx @decantr/cli codify --accept --confirm-reviewed
# add --accept-style-bridge only when the reviewed bridge should become active authority
npx @decantr/cli verify --brownfield --local-patterns
```

Accepting local law moves the app from plain Brownfield contract-only into the first Hybrid lane. The existing app still owns source and styling, but `.decantr/local-patterns.json` and `.decantr/rules.json` become project-owned UI authority. A style bridge is a separate authority decision: ordinary acceptance leaves `.decantr/style-bridge.proposal.json` untouched, while `codify --accept --confirm-reviewed --accept-style-bridge` writes `.decantr/style-bridge.json`, activates the style-bridge lane, and immediately regenerates `DECANTR.md` plus `.decantr/context/assistant-bridge.md`. Runtime CSS, tokens, and global styles remain host-owned and are never generated or overwritten by style-bridge adoption. Official corpus patterns remain advisory until you add project-owned components, classes, token recipes, variants, and exceptions.

In a monorepo, keep passing the same app path:

```bash
pnpm exec decantr codify --from-audit --style-bridge --project apps/web
pnpm exec decantr codify --map-pattern hero --project apps/web
pnpm exec decantr codify --accept --confirm-reviewed --project apps/web
pnpm exec decantr task /feed "add saved recipe actions" --project apps/web
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
pnpm exec decantr ci --project apps/web
pnpm exec decantr ci --project apps/web --since origin/main --report-version v3 --json
```

App-scoped primitives also honor the same path. When you add a page, switch a custom theme, export tokens, inspect status, ask for a health prompt, or ask for suggestions, keep `--project apps/web` on the command:

```bash
pnpm exec decantr add page app/settings --route /settings --project apps/web
pnpm exec decantr theme create retro-night --project apps/web
pnpm exec decantr export --to figma-tokens --project apps/web
pnpm exec decantr suggest "standardize buttons" --project apps/web
pnpm exec decantr suggest --from-code --file app/page.tsx --project apps/web
pnpm exec decantr health --project apps/web --prompt <finding-id>
```

`suggest --from-code` reads the selected app's file and ranks accepted local patterns alongside official corpus patterns, so questions like "standardize these buttons/cards" can point the AI at project-owned law without requiring Decantr runtime components. From inside an app root, `decantr suggest "button" --from-code --file src/App.tsx` works without `--project`; from a workspace root, keep `--project apps/web`. `task` prints the same authority boundary before an edit: lane, source authority, style authority, active authorities, runtime boundary, and warnings for cross-runtime requests such as adding Angular to a React app or the legacy Decantr CSS adapter to a contract-only app.

`add page` records a route as part of the contract so future `task /settings` calls are addressable. If the route is omitted, Decantr derives one from the page id; use `--route` when the app's real URL differs. In observed Brownfield apps, section IDs may be `observed-public` or `observed-primary`; the common `app/settings` shorthand resolves to the single primary section when Decantr can do that safely. The same section shorthand works for page removal and scoped feature additions such as `decantr add feature saved-recipes --section app --project apps/web`.

`export --to figma-tokens` only exports explicitly adopted legacy Decantr CSS tokens. In contract-only or style-bridge Brownfield, the app may intentionally keep Tailwind, Sass, CSS module, or design-system tokens outside Decantr; use that host project token source rather than treating Decantr token export as canonical.

If you run `decantr setup` after adoption from a monorepo root, it should show attached projects and the day-two loop (`doctor`, `task`, `verify`, `ci init`) rather than asking you to reattach the same app. If you run `decantr magic` against an already attached app, it should steer you into `decantr task <route> "<change>" --project apps/web`; `magic` remains greenfield-first.

If you run `decantr setup` from inside an attached app, Decantr should reflect the current state: apps with accepted local law get `verify --brownfield --local-patterns`, while apps without accepted local law or style bridge still get the `codify --from-audit --style-bridge` next step.

This does not replace ESLint, Biome, Storybook, visual regression, axe, Playwright, or project tests. Decantr owns the contract and LLM context layer, then adds a narrow local `.decantr/rules.json` scan for obvious Brownfield drift such as inline styles, raw color literals, or raw button usage when a wrapper exists. Behavior obligations add a second narrow lane: Decantr can statically check high-confidence dialog/form obligations such as accessible names, label association, explicit form button types, visible destructive consequence copy, cancel affordances, and project-owned primitives. Focus trapping, screen-reader behavior, and full temporal state coverage should still live in the project test stack where Decantr should not guess. `decantr ci` prints those accepted local-rule and Project Health findings with file/line evidence; use `--fail-on warn` only when the team is ready to block on warnings.

See also: [Monorepos](monorepos.md), [Workflow Model](../reference/workflow-model.md), [Project Health](../reference/project-health.md).

## Wire It Into The Lifecycle

Once the app is attached, the operating loop is intentionally small:

```bash
pnpm exec decantr doctor --project apps/web
pnpm exec decantr task /feed "add saved recipe actions" --project apps/web
pnpm exec decantr verify --project apps/web
pnpm exec decantr ci --project apps/web
```

Use `doctor` when you are unsure whether Decantr is attached correctly, whether generated context is stale, whether local law exists, or whether CI is wired. It reports the active adoption lane. Use `verify` after local edits and `ci` in mandatory automation. Use `health`, `check`, `audit`, `refresh`, `workspace health`, and content-pack commands as advanced primitives only when you need direct control over a specific layer.

In contract-only or style-bridge Brownfield adoption, Decantr does not require `@decantr/css`, `css(...)`, `d-*` treatments, or generated Decantr token CSS. Critique and source audit should point you toward your project-owned design system, Tailwind/Sass/theme tokens, component variants, accepted local rules, or accepted style bridge instead.

Contract-only Brownfield also suppresses legacy Decantr CSS interaction-class enforcement. Use project-owned interaction rules if you want to make hover, motion, or animation behavior a CI gate.

Project Health excludes test, spec, story, fixture, mock, generated, E2E, Playwright, Cypress, and testing utility files from production source audits. Explicit router guards satisfy protected-surface topology, and callback utilities or generic fixed-position components need semantic evidence before they are classified as auth callbacks or dialogs.

For adopted Brownfield apps with `.decantr/health-baseline.json`, `verify --ci` and default `decantr ci` keep the shipped v2 `baselineGate`: inherited debt stays visible while new health findings determine the baseline-aware gate. Explicit `decantr ci --report-version v3` adds `AdoptionTruthV1` and `GovernanceDeltaV1`, classifying stable finding occurrences as new, inherited, resolved, or unclassified. If the baseline/change evidence is missing, stale, or incompatible, v3 reports `not_proven` instead of treating the delta as empty.

Install CI from the monorepo root:

```bash
pnpm exec decantr ci init --project apps/web
```

For GitHub Actions, Decantr writes a root `.github/workflows/decantr-ci.yml` and uses the pinned local CLI command, such as `pnpm exec decantr ci --project apps/web`. If the root package does not yet pin Decantr, `ci init` prints the exact install command, such as `pnpm add -D -w @decantr/cli`. For Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deployment systems, generate a portable snippet instead:

```bash
pnpm exec decantr ci init --provider generic --project apps/web
```

Existing workflows stay on v2 after a package upgrade. To generate a governed-change GitHub workflow deliberately, use:

```bash
pnpm exec decantr ci init --project apps/web --report-version v3
```

The v3 GitHub workflow checks out full history, resolves a pull-request/push base, and passes it through `--since`. This is proof configuration, not automatic report negotiation.
