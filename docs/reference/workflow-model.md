# Decantr Workflow Model

Decantr resolves an explicit workflow and adoption policy before registry, adapter, or scaffold work begins. The contract layer stays framework-agnostic; adapters translate that contract into project conventions.

## Workflow And Adoption Matrix

| Mode | Use when | Primary command | Default adoption | Registry role |
| --- | --- | --- | --- | --- |
| `greenfield-scaffold` | New app from a blueprint/archetype | `decantr new my-app --blueprint=<id>` | `decantr-css` | primary or cached |
| `greenfield-contract-only` | New repo wants Decantr governance without blueprint/runtime takeover | `decantr init --workflow=greenfield --adoption=contract-only` | `contract-only` | none |
| `brownfield-attach` | Existing app wants Decantr context and checks | `decantr analyze`, then `decantr init --existing` | `contract-only` | optional |
| `hybrid-compose` | Attached app selectively adds/removes features, sections, themes, or packs | `decantr add/remove`, `decantr theme switch`, `decantr registry` | existing project setting | opt-in |

Adoption modes:

- `contract-only`: write Decantr essence/context/governance files; do not add Decantr CSS or require `@decantr/css`.
- `style-bridge`: write lightweight bridge tokens/files that map Decantr intent into the existing style system.
- `decantr-css`: generate the full Decantr CSS runtime guidance and style files.

## Adapters

Adapters expose four capabilities:

- `bootstrap`: write a runnable greenfield starter.
- `attach`: describe route/layout/component conventions for an existing app.
- `styling`: map adoption mode into dependencies, style files, and prompts.
- `verify`: provide dev/build commands, dist directory, and runtime expectations.

Current adapter availability:

- `react-vite`: runnable bootstrap, attach, styling, verify.
- `next-app`: runnable Next.js App Router bootstrap, App/Pages Router attach hints, verify.
- `generic-web`: contract-only fallback for unsupported targets.

Unsupported targets should feel intentional, not broken: Decantr writes the contract and tells the user that the runtime remains theirs.

## Brownfield Adoption

Brownfield starts with:

```bash
decantr analyze
decantr init --existing --yes --adoption=contract-only
```

`analyze` writes `.decantr/analysis.json`, `.decantr/init-seed.json`, and a retrofit plan covering routes, styling, dependencies, rule files, workspace/app roots, and recommended adoption mode.

Direct brownfield init is allowed:

```bash
decantr init --existing --yes
```

When analysis artifacts are absent, generated guidance tells the LLM to inventory the project first instead of referencing files that do not exist.

## Assistant Rule Bridge

Existing rule files are detected during project analysis and init. Bridge behavior is preview-first:

- `--assistant-bridge=preview` writes `.decantr/context/assistant-bridge.md`.
- `decantr rules apply` injects idempotent marked blocks into supported rule files.
- Cursor uses `.cursor/rules/decantr.mdc`.
- Brownfield init never mutates rule files unless `--assistant-bridge=apply` is explicit.

## Monorepo And Offline

Workspace roots are detected from `pnpm-workspace.yaml`, package workspaces, `turbo.json`, `nx.json`, and common `apps/*` layouts. Non-interactive workspace-root init requires `--project=<path>` when multiple app candidates exist.

Offline behavior:

- `--offline --adoption=contract-only` works without registry content.
- Registry-backed blueprint, archetype, or theme flows require local cache/custom content or `DECANTR_CONTENT_DIR`.
- Supported offline flows must not call the hosted API.

## Harness And Certification

Use:

```bash
pnpm --filter @decantr/cli certify:workflows
pnpm --filter @decantr/cli certify:blueprints
```

The workflow matrix covers greenfield blueprint, greenfield contract-only, brownfield analyze/init, direct brownfield init, adoption modes, offline flows, unsupported target fallback, monorepo `--project`, Next.js adapter, and hybrid composition.
