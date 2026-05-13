# Add Decantr To An Existing App

Use Decantr when an AI-built or AI-maintained frontend needs a durable product contract without a rewrite. Brownfield adoption is observe-first: Decantr reads the existing app, proposes a contract, and keeps the current router, styling system, docs, and assistant rules authoritative until you accept the proposal.

## Start

```bash
npx @decantr/cli analyze
npx @decantr/cli init --existing --accept-proposal
npx @decantr/cli check --brownfield
npx @decantr/cli health --browser --base-url http://localhost:3000 --evidence
npx @decantr/cli health --save-baseline
```

For monorepos, point Decantr at the app:

```bash
npx @decantr/cli analyze --project apps/web
npx @decantr/cli init --existing --accept-proposal --project apps/web
cd apps/web
npx @decantr/cli health
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

## What Decantr Does Not Do

- It does not replace your router.
- It does not take over Tailwind, Bootstrap, MUI, Chakra, plain CSS, or another existing styling system.
- It does not mutate assistant rule files unless you explicitly use the assistant bridge apply flow.
- It does not upload source code, prompts, or health reports.
- It does not upload screenshots; browser evidence remains local unless you explicitly choose a hosted workflow.

## When To Use This Path

Use brownfield attach when your app already exists and the problem is drift: AI-generated pages stop matching the intended product shape, routes grow without a coherent map, or design-system decisions get repeated differently across screens.

For day-two work, ask assistants to load task context before editing. MCP clients can call `decantr_prepare_task_context` with a route and task. CLI-only workflows can use `decantr registry get-pack page --route <route>` plus the generated `.decantr/context/` files.

See also: [Workflow Model](../reference/workflow-model.md), [Project Health](../reference/project-health.md).
