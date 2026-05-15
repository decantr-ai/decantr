# Decantr 2.9.6 Brownfield Feature Alias

Decantr 2.9.6 is a focused Brownfield dogfood patch for scoped feature additions in observed apps.

## What Changed

- `decantr add feature saved-recipes --section app --project apps/web` now resolves the common `app` shorthand to the single primary section when a Brownfield contract uses observed section IDs such as `observed-primary`.
- The command prints the resolved section alias before writing the feature, mirroring the `add page` behavior from 2.9.5.

## Updated Package

- `@decantr/cli`: `2.9.6`

No Essence, registry schema, MCP, verifier, or content-repo schema changes are required for this patch.
