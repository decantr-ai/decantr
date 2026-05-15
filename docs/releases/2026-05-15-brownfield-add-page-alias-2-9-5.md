# Decantr 2.9.5 Brownfield Add Page Alias

Decantr 2.9.5 is a focused Brownfield dogfood patch for route additions in observed apps.

## What Changed

- `decantr add page app/foo --route /foo --project apps/web` now resolves the common `app` shorthand to the single primary section when a Brownfield contract uses observed section IDs such as `observed-primary`.
- The command prints the resolved section alias before writing the page, so users and LLMs can see the actual contract section that received the route.
- If a requested section still cannot be resolved, the error now suggests a concrete `decantr add page <available-section>/<page>` command.

## Updated Package

- `@decantr/cli`: `2.9.5`

No Essence, registry schema, MCP, verifier, or content-repo schema changes are required for this patch.
