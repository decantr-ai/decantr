# Add Decantr To An Existing App

Use Decantr when an AI-built or AI-maintained frontend needs a durable product contract without a rewrite. Brownfield adoption is observe-first: Decantr reads the existing app, proposes a contract, and keeps the current router, styling system, docs, and assistant rules authoritative until you accept the proposal.

## Start

Preview the fit before you attach anything:

```bash
npx @decantr/cli scan
```

For a public repository or GitHub Pages site, use the hosted scanner at `/scan`. It accepts `https://github.com/owner/repo` and `https://owner.github.io/repo/` URLs, clones public GitHub source into a temporary checkout, probes the Pages URL with HTML-only HTTP, returns an ephemeral report, and does not persist source or reports.

When the scan says the app is a good Brownfield UI target, attach Decantr:

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

`scan` is look-don't-touch reconnaissance. `analyze` is the local primitive that writes Brownfield intelligence and an observed proposal. `adopt` is the paved path that explains and runs the primitive flow for you: `analyze`, `init --existing --accept-proposal` or `--merge-proposal`, hosted pack hydration when online, Project Health, a baseline, and optional CI setup. Use the primitive commands only when you need to script or debug a specific step. Pass `--no-packs` when you need a fully local/offline attach and hydrate packs later with `decantr registry compile-packs <app>/decantr.essence.json --write-context`. In contract-only mode, deferred hosted packs are optional context; missing packs should show as optional/info unless a present manifest references missing files.

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
- `.decantr/local-patterns.json`: accepted project-owned UI law when `decantr codify --accept` is run.
- `.decantr/rules.json`: accepted project-owned local rule checks when `decantr codify --accept` is run.

## What Decantr Does Not Do

- `decantr scan` does not write `.decantr`, save a report, install dependencies, build the app, run scripts, upload source, or open pull requests.
- It does not replace your router.
- It does not take over Tailwind, Bootstrap, MUI, Chakra, plain CSS, or another existing styling system.
- It does not mutate assistant rule files unless you explicitly use the assistant bridge apply flow.
- It does not upload source code, prompts, or health reports.
- It does not upload screenshots; browser evidence remains local unless you explicitly choose a hosted workflow.

## Scan, Analyze, Adopt

Use `scan` when you want a no-risk answer to "is this a Decantr Brownfield UI target?" It reports framework, package manager, route evidence, component/style signals, Decantr presence, assistant-rule files, GitHub Pages hints, fallback warnings, and next commands. Non-web repositories, such as Python/backend projects, return a useful "not a Brownfield UI target" result instead of failing.

Use `analyze` when you are ready for local artifacts: doctrine map, Brownfield intelligence, theme inventory, enrichment backlog, report markdown, and an observed essence proposal.

Use `adopt` when you want the guided attach workflow. It can write the accepted contract, generated context, optional hosted packs, local evidence, and CI guidance depending on the flags you choose.

## When To Use This Path

Use brownfield attach when your app already exists and the problem is drift: AI-generated pages stop matching the intended product shape, routes grow without a coherent map, or design-system decisions get repeated differently across screens.

For day-two work, ask assistants to load task context before editing. MCP clients can call `decantr_prepare_task_context` with a route and task. CLI-only workflows can use `decantr task <route> "<task>"`.

The CLI shortcut is:

```bash
npx @decantr/cli task /feed "add saved recipe actions"
npx @decantr/cli verify --brownfield --local-patterns
```

When the app has repeated local UI decisions that Decantr cannot infer from the public registry, codify them as project-owned law:

```bash
npx @decantr/cli codify --from-audit --style-bridge
# review .decantr/local-patterns.proposal.json and .decantr/rules.proposal.json
# review .decantr/style-bridge.proposal.json if you want Decantr intent mapped to project tokens/classes
npx @decantr/cli codify --map-pattern hero
# review the advisory hosted-pattern mapping before accepting it as local law
npx @decantr/cli codify --accept
npx @decantr/cli verify --brownfield --local-patterns
```

Accepting local law moves the app from plain Brownfield contract-only into the first Hybrid lane. The existing app still owns source and styling, but `.decantr/local-patterns.json` and `.decantr/rules.json` become project-owned UI authority for assistants and verification. `codify --from-audit` now includes source snippets, confidence tiers, and likely variants for button, card/surface, form, shell, and theme families so the proposal is less generic. Accepting a style bridge adds `.decantr/style-bridge.json`, which maps Decantr concepts like surfaces, actions, focus, density, and theme variants to your own tokens/classes without adopting Decantr CSS. Hosted registry patterns are useful vocabulary and review guidance; `codify --map-pattern <slug>` places one into the local-law proposal as advisory guidance, but it is not enforceable until you add project-owned components, classes, token recipes, variants, and exceptions.

In a monorepo, keep passing the same app path:

```bash
pnpm exec decantr codify --from-audit --style-bridge --project apps/web
pnpm exec decantr codify --map-pattern hero --project apps/web
pnpm exec decantr codify --accept --project apps/web
pnpm exec decantr task /feed "add saved recipe actions" --project apps/web
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
pnpm exec decantr ci --project apps/web
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

`suggest --from-code` reads the selected app's file and ranks accepted local patterns alongside registry patterns, so questions like "standardize these buttons/cards" can point the AI at your project-owned law without requiring Decantr registry components. From inside an app root, `decantr suggest "button" --from-code --file src/App.tsx` works without `--project`; from a workspace root, keep `--project apps/web`. `task` prints the same authority boundary before an edit: lane, source authority, style authority, active authorities, runtime boundary, and warnings for cross-runtime requests such as adding Angular to a React app or Decantr CSS to a contract-only app.

`add page` records a route as part of the contract so future `task /settings` calls are addressable. If the route is omitted, Decantr derives one from the page id; use `--route` when the app's real URL differs. In observed Brownfield apps, section IDs may be `observed-public` or `observed-primary`; the common `app/settings` shorthand resolves to the single primary section when Decantr can do that safely. The same section shorthand works for page removal and scoped feature additions such as `decantr add feature saved-recipes --section app --project apps/web`.

`export --to figma-tokens` only exports Decantr CSS tokens. In contract-only Brownfield, the app may intentionally keep Tailwind, Sass, CSS module, or design-system tokens outside Decantr; use that project token source or adopt a style bridge before treating Decantr token export as canonical.

If you run `decantr setup` after adoption from a monorepo root, it should show attached projects and the day-two loop (`doctor`, `task`, `verify`, `ci init`) rather than asking you to reattach the same app. If you run `decantr magic` against an already attached app, it should steer you into `decantr task <route> "<change>" --project apps/web`; `magic` remains greenfield-first.

If you run `decantr setup` from inside an attached app, Decantr should reflect the current state: apps with accepted local law get `verify --brownfield --local-patterns`, while apps without accepted local law or style bridge still get the `codify --from-audit --style-bridge` next step.

This does not replace ESLint, Biome, Storybook, visual regression, or project tests. Decantr owns the contract and LLM context layer, then adds a narrow local `.decantr/rules.json` scan for obvious Brownfield drift such as inline styles, raw color literals, or raw button usage when a wrapper exists. `decantr ci` prints those accepted local-rule findings with file/line evidence so they appear in the same automation surface as Project Health; use `--fail-on warn` only when the team is ready to block on warnings. Deeper deterministic enforcement should still live in the project rule stack where it can fail CI with full framework knowledge.

See also: [Monorepos](monorepos.md), [Workflow Model](../reference/workflow-model.md), [Project Health](../reference/project-health.md).

## Wire It Into The Lifecycle

Once the app is attached, the operating loop is intentionally small:

```bash
pnpm exec decantr doctor --project apps/web
pnpm exec decantr task /feed "add saved recipe actions" --project apps/web
pnpm exec decantr verify --project apps/web
pnpm exec decantr ci --project apps/web
```

Use `doctor` when you are unsure whether Decantr is attached correctly, whether generated context is stale, whether local law exists, or whether CI is wired. It now reports the active adoption lane, so a teammate can tell the difference between Brownfield contract-only, Hybrid local law, Hybrid style bridge, Hybrid Decantr CSS, Hybrid composition, and Greenfield modes. Use `verify` after local edits. Use `ci` in mandatory automation. Use `health`, `check`, `audit`, `refresh`, `workspace health`, and registry pack commands as advanced primitives only when you need direct control over a specific layer.

In contract-only or style-bridge Brownfield adoption, Decantr does not require `@decantr/css`, `css(...)`, `d-*` treatments, or generated Decantr token CSS. Critique and source audit should point you toward your project-owned design system, Tailwind/Sass/theme tokens, component variants, accepted local rules, or accepted style bridge instead.

Contract-only Brownfield also suppresses Decantr CSS interaction-class enforcement. Use project-owned interaction rules if you want to make hover, motion, or animation behavior a CI gate.

Project Health treats test, spec, story, fixture, and mock files as non-production source audit inputs. Localhost and security warnings should point at production source paths instead of colocated tests.

Install CI from the monorepo root:

```bash
pnpm exec decantr ci init --project apps/web
```

For GitHub Actions, Decantr writes a root `.github/workflows/decantr-ci.yml` and uses the pinned local CLI command, such as `pnpm exec decantr ci --project apps/web`. If the root package does not yet pin Decantr, `ci init` prints the exact install command, such as `pnpm add -D -w @decantr/cli`. For Jenkins, Please, Buildkite, GitLab, Azure DevOps, or internal deployment systems, generate a portable snippet instead:

```bash
pnpm exec decantr ci init --provider generic --project apps/web
```
