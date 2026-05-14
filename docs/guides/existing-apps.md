# Add Decantr To An Existing App

Use Decantr when an AI-built or AI-maintained frontend needs a durable product contract without a rewrite. Brownfield adoption is observe-first: Decantr reads the existing app, proposes a contract, and keeps the current router, styling system, docs, and assistant rules authoritative until you accept the proposal.

## Start

```bash
npx @decantr/cli adopt --yes
```

For monorepos, install once at the workspace root, then point Decantr at the app:

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr setup
pnpm exec decantr workspace list
pnpm exec decantr adopt --project apps/web --yes
```

`adopt` is the paved path. It explains and runs the primitive flow for you: `analyze`, `init --existing --accept-proposal` or `--merge-proposal`, Project Health, a baseline, and optional CI setup. Use the primitive commands only when you need to script or debug a specific step.

If the app is already running and you want Decantr to attach route screenshots to task context, add visual evidence after adoption:

```bash
npx @decantr/cli verify --project apps/web --base-url http://localhost:3000 --evidence
```

## What Decantr Writes

- `decantr.essence.json`: the accepted design and product contract.
- `DECANTR.md`: the project-level assistant primer.
- `.decantr/context/`: scoped implementation context for the AI assistant.
- `.decantr/doctrine-map.json`: ranked evidence from existing docs, rules, architecture, and workflow files.
- `.decantr/brownfield-report.md`: human-readable inventory and proposal notes.
- `.decantr/brownfield-intelligence.json`: route, component, styling, feature, dependency, and evidence summary for task-time context.
- `.decantr/theme-inventory.json`: observed light/dark/variant theme selectors and token evidence. Essence V4 is unchanged; variants are reported, not promoted.
- `.decantr/enrichment-backlog.md`: checklist for turning the first attach pass into stronger section/page directives.
- `.decantr/evidence/visual-manifest.json`: local route-to-screenshot map when `health --browser --base-url <url> --evidence` is run.
- `.decantr/local-patterns.proposal.json`: project-owned pattern proposal when `decantr codify --from-audit` is run.
- `.decantr/rules.proposal.json`: project-owned rule proposal when `decantr codify --from-audit` is run.
- `.decantr/local-patterns.json`: accepted project-owned UI law when `decantr codify --accept` is run.
- `.decantr/rules.json`: accepted project-owned local rule checks when `decantr codify --accept` is run.

## What Decantr Does Not Do

- It does not replace your router.
- It does not take over Tailwind, Bootstrap, MUI, Chakra, plain CSS, or another existing styling system.
- It does not mutate assistant rule files unless you explicitly use the assistant bridge apply flow.
- It does not upload source code, prompts, or health reports.
- It does not upload screenshots; browser evidence remains local unless you explicitly choose a hosted workflow.

## When To Use This Path

Use brownfield attach when your app already exists and the problem is drift: AI-generated pages stop matching the intended product shape, routes grow without a coherent map, or design-system decisions get repeated differently across screens.

For day-two work, ask assistants to load task context before editing. MCP clients can call `decantr_prepare_task_context` with a route and task. CLI-only workflows can use `decantr registry get-pack page --route <route>` plus the generated `.decantr/context/` files.

The CLI shortcut is:

```bash
npx @decantr/cli task /feed "add saved recipe actions"
npx @decantr/cli verify --brownfield --local-patterns
```

When the app has repeated local UI decisions that Decantr cannot infer from the public registry, codify them as project-owned law:

```bash
npx @decantr/cli codify --from-audit
# review .decantr/local-patterns.proposal.json and .decantr/rules.proposal.json
npx @decantr/cli codify --accept
npx @decantr/cli verify --brownfield --local-patterns
```

In a monorepo, keep passing the same app path:

```bash
pnpm exec decantr codify --from-audit --project apps/web
pnpm exec decantr codify --accept --project apps/web
pnpm exec decantr task /feed "add saved recipe actions" --project apps/web
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
```

This does not replace ESLint, Biome, Storybook, visual regression, or project tests. Decantr owns the contract and LLM context layer, then adds a narrow local `.decantr/rules.json` scan for obvious Brownfield drift such as inline styles, raw color literals, or raw button usage when a wrapper exists. Deeper deterministic enforcement should still live in the project rule stack where it can fail CI with full framework knowledge.

See also: [Workflow Model](../reference/workflow-model.md), [Project Health](../reference/project-health.md).
