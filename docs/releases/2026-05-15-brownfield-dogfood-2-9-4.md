# Decantr 2.9.4 Brownfield Dogfood Polish

Decantr 2.9.4 is a narrow CLI patch from the published Brownfield dogfood loop.

## What Changed

- `health --project ... --prompt <finding>` now prints app-prefixed read targets such as `apps/web/DECANTR.md`, `apps/web/decantr.essence.json`, and app-local context files.
- Runtime repair prompts now use a root-safe app build command in monorepos, such as `pnpm --dir apps/web build`, instead of a bare `npm run build`.
- UI interaction evidence ignores API route handlers, tests, stories, fixtures, and mocks so declared route behavior is proven by production UI source.
- `export --to figma-tokens` now explains the contract-only Brownfield boundary when `src/styles/tokens.css` is absent instead of telling users to regenerate Decantr CSS tokens.
- `workspace list` now says "Attach another app" when a workspace already has an attached Decantr project and still has unattached app candidates.

## Updated Package

- `@decantr/cli`: `2.9.4`

No Essence, registry schema, MCP, verifier, or content-repo schema changes are required for this patch.
