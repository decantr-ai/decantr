# Brownfield Monorepo Onboarding

`@decantr/cli@2.8.1` clarifies the first-run Brownfield path for monorepos.

## Highlights

- `decantr setup` now recognizes workspace roots and explains that Decantr can be installed at the root while attaching to an app with `--project`.
- `decantr adopt`, `init`, `analyze`, `task`, `verify`, `codify`, and `rules` now give more actionable guidance when run from a monorepo root without an app path.
- `decantr workspace list` now shows unattached app candidates as well as attached Decantr projects.
- Brownfield docs now lead with the simple source-only command: `decantr adopt --yes`.
- `--base-url` remains available for local browser screenshots and visual evidence, but it is no longer presented as the core adoption command.

## Recommended Monorepo Start

```bash
pnpm add -D -w @decantr/cli
pnpm exec decantr setup
pnpm exec decantr workspace list
pnpm exec decantr adopt --project apps/web --yes
pnpm exec decantr codify --from-audit --project apps/web
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
```

Visual evidence stays opt-in:

```bash
pnpm exec decantr verify --project apps/web --base-url http://localhost:3000 --evidence
```
