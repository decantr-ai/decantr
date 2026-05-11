# Add Decantr To An Existing App

Use Decantr when an AI-built or AI-maintained frontend needs a durable product contract without a rewrite. Brownfield adoption is observe-first: Decantr reads the existing app, proposes a contract, and keeps the current router, styling system, docs, and assistant rules authoritative until you accept the proposal.

## Start

```bash
npx @decantr/cli analyze
npx @decantr/cli init --existing --accept-proposal
npx @decantr/cli check --brownfield
npx @decantr/cli health
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

## What Decantr Does Not Do

- It does not replace your router.
- It does not take over Tailwind, Bootstrap, MUI, Chakra, plain CSS, or another existing styling system.
- It does not mutate assistant rule files unless you explicitly use the assistant bridge apply flow.
- It does not upload source code, prompts, or health reports.

## When To Use This Path

Use brownfield attach when your app already exists and the problem is drift: AI-generated pages stop matching the intended product shape, routes grow without a coherent map, or design-system decisions get repeated differently across screens.

See also: [Workflow Model](../reference/workflow-model.md), [Project Health](../reference/project-health.md).
