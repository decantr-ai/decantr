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
- `terminal-dashboard`: fail

Current representative baseline: `5/6` passing.

The remaining outlier is `terminal-dashboard`, which currently scaffolds but fails certification because its generated essence and referenced pattern set drift from the current contract enough that compiled pack artifacts are not emitted and `check`/`audit` do not pass cleanly.
