# Blueprint Certification Matrix

Date: 2026-04-13

## Purpose

This runbook defines the first post-merge cold-start scaffold certification matrix for Decantr blueprints.

The goal is not to prove every blueprint in the corpus on every run. The goal is to keep a small,
representative set of blueprints under repeatable smoke coverage so we can quickly detect when core
scaffolding, pack generation, prompt emission, `decantr check`, or `decantr audit` regress.

## Command

Run the representative matrix:

```bash
pnpm audit:blueprint-matrix
```

Run the same matrix with JSON output:

```bash
pnpm audit:blueprint-matrix -- --json
```

Run a manual subset:

```bash
pnpm audit:blueprint-matrix -- --blueprints=saas-dashboard,registry-platform
```

Run the full blueprint corpus:

```bash
pnpm audit:blueprint-matrix -- --all
```

Override the sibling `decantr-content` path when needed:

```bash
DECANTR_CONTENT_DIR=/path/to/decantr-content pnpm audit:blueprint-matrix
```

## What The Script Verifies

For each selected blueprint, the matrix:

1. creates a fresh temp project
2. copies the local curated content corpus into `.decantr/custom/`
3. runs `decantr init --blueprint=<slug> --offline --yes`
4. verifies these artifacts exist:
   - `decantr.essence.json`
   - `DECANTR.md`
   - `.decantr/context/scaffold-pack.md`
   - `.decantr/context/review-pack.md`
   - `.decantr/context/pack-manifest.json`
5. verifies the emitted prompt and generated `DECANTR.md` contain the pack-first guidance
6. runs `decantr check`
7. runs `decantr audit`

The command exits non-zero if any blueprint fails.

## Offline Content Expectations

`decantr init --offline --blueprint=<slug>` now expects a real local content source rather than silently degrading to the default scaffold.

Resolution order:

1. existing workspace `.decantr/cache` / `.decantr/custom`
2. `DECANTR_CONTENT_DIR`
3. sibling `../decantr-content`

If a requested offline blueprint or archetype cannot be resolved from one of those local sources, `init` should stop with an explicit error instead of scaffolding a fallback custom project.

## Harness Guidance

For cold-start certification runs, the workspace-local scaffold files are the only source of truth.

- prefer the generated `scaffold-pack.md`, `scaffold.md`, section packs, and page packs over repo-global Decantr assumptions
- if local scaffold files disagree with each other, stop and report the mismatch instead of inferring intent from prior knowledge
- treat a missing compiled pack as a harness failure, not as permission to improvise

## Representative Matrix

| Blueprint | Why it stays in the matrix |
|---|---|
| `product-landing` | Public, conversion-oriented marketing composition with multiple public archetypes |
| `saas-dashboard` | Canonical authenticated SaaS shape with dashboard, analytics, billing, and settings |
| `agent-marketplace` | Marketplace + orchestration topology with heavier AI/realtime feature mix |
| `knowledge-base` | Documentation/search-heavy information architecture with auth and settings |
| `registry-platform` | Most complex Decantr dogfood blueprint with browse, dashboard, admin, and auth zones |
| `terminal-dashboard` | Dense devtool-style blueprint that pressures treatments, shells, and feature breadth |

## Success Criteria

The matrix is considered green when:

- every selected blueprint scaffolds successfully from a fresh temp directory
- the stronger pack-first prompt is emitted during `init`
- the generated `DECANTR.md` preserves the same pack-first contract
- `decantr check` exits successfully
- `decantr audit` exits successfully

## Current Guidance

Use the representative matrix as the default release and post-merge smoke path.

Use `--all` only when you want a slower full-corpus pass, such as:

- before a wider release wave
- after major compiler changes
- after schema/content migrations
- when changing scaffold prompt or pack rendering logic

## Current Baseline (2026-04-13)

Initial representative run against the local curated corpus:

- `product-landing`: pass
- `saas-dashboard`: pass
- `agent-marketplace`: pass
- `knowledge-base`: pass
- `registry-platform`: pass
- `terminal-dashboard`: pass

Current representative baseline: `6/6` passing.

`terminal-dashboard` was the original outlier. The current green baseline includes the systemic fixes that made it pass cleanly:

- sectioned composition now resolves archetype layout aliases into concrete pattern references
- `decantr check` now reads real local pattern/theme registry context instead of evaluating guards against empty registries
- the v3 schema now accepts the already-modeled `dna.constraints` metadata emitted by the scaffold path
