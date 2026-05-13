# Decantr 2.7 Workflow Command Layer

Decantr 2.7 introduces a workflow-first CLI layer so users no longer need to memorize the primitive command chain for common jobs.

## What Changed

- Added `decantr setup` to detect the project state and recommend the right path.
- Added `decantr adopt` as the Brownfield paved path over analyze, proposal acceptance or merge, Project Health, evidence, baseline, and optional CI.
- Added `decantr task <route>` to surface route-local context for AI coding assistants before edits.
- Added `decantr verify` as the day-to-day reliability gate over Project Health, optional Brownfield checks, evidence, baselines, workspace health, and local-pattern requirements.
- Added `decantr codify` to propose and accept project-owned Brownfield UI patterns.
- Added `decantr content` as the content-author namespace while preserving `content-health`, `create`, and `publish` aliases.

## Compatibility

No primitive commands were removed. `analyze`, `init`, `check`, `health`, `audit`, `registry`, `workspace`, `content-health`, `create`, and `publish` remain available for scripts and advanced workflows.

## Brownfield Direction

Brownfield contract-only adoption now has a clearer lifecycle:

```bash
decantr adopt --base-url http://localhost:3000 --evidence --yes
decantr task /feed "add saved recipe actions"
decantr codify
decantr codify --accept
decantr verify --brownfield --local-patterns
```

Local pattern packs are project-owned governance, not official registry content. Deterministic mechanical enforcement still belongs in the project's ESLint, Biome, test, or visual-regression stack.
