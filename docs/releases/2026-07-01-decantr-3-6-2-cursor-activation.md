# Decantr 3.6.2 Cursor Activation

Decantr 3.6.2 is a scoped adoption patch for Cursor-first AI coding workflows. It adds a direct CLI connector for Cursor Agent and updates the MCP package docs so users do not have to hand-wire Decantr MCP plus project rules.

Package wave:

- `@decantr/cli@3.6.2`
- `@decantr/mcp-server@3.6.2`

## What Changed

- Added `decantr connect cursor`.
- The command writes `.cursor/mcp.json` and `.cursor/rules/decantr.mdc` in the opened workspace.
- Existing Cursor MCP servers are preserved.
- `--preview` shows the planned files without writing them.
- `--project <app>` keeps monorepo app scope in generated `project_path`, task commands, verify commands, and drift-resolution guidance.
- The generated Cursor rule tells Cursor Agent to call Decantr task context before route edits, run `decantr verify --brownfield --local-patterns` after edits, and stop/report drift when runtime source and Decantr context disagree.
- The MCP README now leads Cursor users to the connector, while keeping manual MCP setup as a fallback.
- The package permission matrix now declares the optional `.cursor` write surface.

## What Did Not Change

- No Essence V4 schema changes.
- No MCP tool-surface changes.
- No verifier behavior changes.
- No telemetry changes.
- No hosted upload changes.
- No autonomous source-editing behavior.

## Why

Cursor is a major AI coding environment, and manual MCP setup alone does not teach the agent Decantr's day-two workflow. This patch turns Cursor setup into one explicit command that installs both the MCP server config and the route-task rule needed for Brownfield control-loop behavior.

## Verification

Completed before publish prep:

```bash
pnpm --filter @decantr/cli build
pnpm --filter @decantr/cli test -- cursor-connect help "audited CLI command surface"
pnpm build:packages
pnpm test
pnpm biome:check
pnpm audit:public-api
pnpm audit:package-surface
pnpm audit:package-permissions
pnpm audit:docs-drift
pnpm audit:docs-marketing
pnpm audit:public-links
pnpm seo:docs-sitemap
```

Publish prep:

```bash
pnpm release:commands -- --only=@decantr/cli,@decantr/mcp-server
pnpm release:preflight -- --only=@decantr/cli,@decantr/mcp-server
```

After explicit publish authorization:

```bash
node scripts/publish-packages.mjs --only=@decantr/cli,@decantr/mcp-server
pnpm release:verify -- --only=@decantr/cli,@decantr/mcp-server
pnpm release:closeout -- --only=@decantr/cli,@decantr/mcp-server --version 3.6.2
```
