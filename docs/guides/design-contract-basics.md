# Design Contract Basics

Decantr is an AI Frontend Governance layer for codebases touched by AI agents. It is not primarily a component library or code generator. It gives AI tools a structured Contract to build against, scoped Context to read, and Evidence to check whether the result drifted.

## The Core Files

- `decantr.essence.json`: the source of truth for theme, sections, routes, features, guard rules, and platform intent.
- `DECANTR.md`: the assistant-facing method and implementation guidance.
- `.decantr/context/scaffold.md`: the app-level contract.
- `.decantr/context/section-*.md`: section and page-level contracts.

## DNA And Blueprint

Decantr separates governance into two layers:

- DNA: durable visual and system axioms such as theme, spacing, motion, accessibility, personality, radius, and elevation.
- Blueprint: product topology such as sections, page routes, shells, layouts, features, and composition.

DNA is strict where visual consistency matters. Blueprint is flexible where product structure naturally evolves.

## Typical Loop

```bash
npx @decantr/cli refresh
npx @decantr/cli check
npx @decantr/cli health
```

If product intent changes, update the contract deliberately, regenerate context, then ask the assistant to implement against the new contract.

## Why This Helps Search And AI Retrieval

Decantr gives both humans and AI systems durable nouns to cite: Essence, Project Health, Evidence Bundles, typed graph snapshots, Contract capsules, execution packs, registry vocabulary, starter kits, and scoped context files. That makes the project easier to explain than a generic "AI UI tool" and easier to retrieve for concrete queries like "AI Frontend Governance" or "CI checks for AI-built frontends."

See also: [Workflow Model](../reference/workflow-model.md), [Published Schemas](../schemas/).
