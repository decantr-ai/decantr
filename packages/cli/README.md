# @decantr/cli

Support status: `core-supported`  
Release channel: `stable`

Decantr’s main local operator surface for scaffolding, auditing, inspecting, and maintaining Decantr projects.

## Install

```bash
npm install -D @decantr/cli
```

Or run it without installing:

```bash
npx @decantr/cli new my-app --blueprint=agent-marketplace
```

Use `decantr new` for a greenfield workspace in a fresh directory.
Use `decantr analyze` first when you already have an app and want Decantr governance without adopting a blueprint.
Use `decantr init` to attach Decantr contract/context files to an existing project or to create a contract-only workspace.

Current starter adapter availability:

- `react-vite` is the runnable bootstrap adapter in this wave
- other contract targets remain valid Decantr targets, but `decantr new` will keep them in contract-only mode until their adapters land

## What It Does

- scaffolds Decantr projects from blueprints, archetypes, or prompts
- supports three workflow lanes: greenfield blueprint, brownfield adoption, and hybrid composition
- generates execution-pack context files for AI coding assistants
- audits projects against Decantr contracts
- searches the registry and showcase benchmark corpus
- validates, refreshes, and maintains `decantr.essence.json`

## Common Commands

```bash
decantr new my-app --blueprint=agent-marketplace
decantr analyze
decantr init --existing --yes
decantr init --existing --blueprint=agent-marketplace
decantr magic "AI-native analytics workspace"
decantr audit
decantr check
decantr registry summary --namespace @official --json
decantr showcase verification --json
```

## Greenfield Certification

Use the built-in certification harness before releases when you want to prove that representative blueprints still scaffold into runnable starter projects:

```bash
pnpm --filter @decantr/cli certify:blueprints
```

By default it certifies `portfolio`, `producer-studio`, and `agent-marketplace` by:

- running `decantr new` in fresh temp directories
- seeding offline content from `DECANTR_CONTENT_DIR` or a sibling `decantr-content` checkout
- verifying the starter runtime files and router mode match the generated essence
- running `npm run build` in each scaffolded project

Override the matrix or emit JSON when needed:

```bash
pnpm --filter @decantr/cli certify:blueprints -- --blueprints=portfolio,legal-research --json
```

Offline blueprint scaffolding expects a real local content source:

```bash
DECANTR_CONTENT_DIR=/path/to/decantr-content decantr new my-app --blueprint=agent-marketplace --offline
```

If a requested offline blueprint, archetype, or theme cannot be resolved from local cache/custom content or `DECANTR_CONTENT_DIR`, the CLI now stops explicitly instead of silently falling back to the default scaffold.

## Workflow Certification

The broader workflow matrix now has its own certification entrypoint:

```bash
pnpm --filter @decantr/cli certify:workflows
```

It covers:

- greenfield blueprint bootstrap
- brownfield `analyze -> init --existing`
- hybrid follow-up composition via Decantr mutation commands

## Generated Context

Scaffolded projects include compiled execution packs under `.decantr/context/`, including:

- `scaffold-pack.md` / `scaffold-pack.json`
- `section-*-pack.md` / `section-*-pack.json`
- `page-*-pack.md` / `page-*-pack.json`
- `review-pack.md` / `review-pack.json`
- `pack-manifest.json`

Those files are the compact task contracts meant for AI assistants and downstream tooling.

Recommended read order for AI-assisted scaffolding:

1. `DECANTR.md` for the design spec, CSS approach, and guard rules
2. `.decantr/context/scaffold-pack.md` as the primary compiled shell, theme, feature, and route contract
3. `.decantr/context/scaffold.md` as the broader app overview and topology guide
4. matching `section-*-pack.md` and `section-*.md` files before section work
5. matching `page-*-pack.md` files before route work

Treat the compiled execution packs as the source of truth. Use the narrative docs as secondary explanation, start with the shell and route structure first, and run `decantr check` plus `decantr audit` after implementation.

For cold-start harness or certification runs, use only the scaffolded workspace files as the contract. If local scaffold files disagree, stop and report the mismatch rather than relying on repo-global Decantr assumptions.

## Related Packages

- `@decantr/essence-spec` for schema and guard validation
- `@decantr/registry` for registry contracts and API access
- `@decantr/verifier` for audit and critique

## Docs

- [Decantr root README](https://github.com/decantr-ai/decantr/blob/main/README.md)
- [Package support matrix](https://github.com/decantr-ai/decantr/blob/main/docs/reference/package-support-matrix.md)

## License

MIT
