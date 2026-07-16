# Design Contract Basics

Decantr is an AI Frontend Governance layer for codebases touched by AI agents. It is not a component library, public registry, or autonomous code generator. It gives AI tools a structured Contract to build against, scoped Context to read, Evidence to check whether the result drifted, and explicit Authority for resolving disagreements.

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

## Governed Change Proof

Decantr 3.9 projects the loop through three verifier-owned contracts:

- `AdoptionTruthV1` separates what Decantr observed, what the project governs, and what adoption provably changed or preserved.
- `TaskCapsuleV1` gives an existing coding agent bounded, route-scoped context with the implementation source first, active authority, impact, content provenance, stop conditions, and one verify command.
- `GovernanceDeltaV1` classifies stable finding occurrences as new, inherited, resolved, or unclassified relative to compatible evidence. Incomplete evidence yields `not_proven`.

These contracts do not replace Essence V4, Project Health v2, or the typed graph. They compose those existing sources into a consistent change-proof surface. Existing machine reports remain v2 by default; CI v3 is opt-in with `decantr ci --report-version v3`.

## Why This Helps Search And AI Retrieval

Decantr gives both humans and AI systems durable nouns to cite: Essence, Adoption Truth, Task Capsules, Governance Deltas, Project Health, Evidence Bundles, typed graph snapshots, Contract capsules, execution packs, official `@decantr/content` records, blueprint references, and scoped context files. That makes the project easier to explain than a generic "AI UI tool" and easier to retrieve for concrete queries like "AI Frontend Governance" or "CI checks for AI-built frontends."

See also: [Workflow Model](../reference/workflow-model.md), [Published Schemas](../schemas/).
