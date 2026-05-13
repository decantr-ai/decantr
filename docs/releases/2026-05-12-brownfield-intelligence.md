# Decantr 2.6 Brownfield Intelligence

Decantr 2.6 ships Brownfield intelligence as a minor release. Essence V4 remains the active contract; this release adds local intelligence around it instead of changing the schema.

## Highlights

- `decantr analyze` now writes `.decantr/brownfield-intelligence.json`, `.decantr/theme-inventory.json`, and `.decantr/enrichment-backlog.md`.
- Contract-only Brownfield guidance no longer tells agents to install `@decantr/css`.
- Command help is side-effect free: command-specific help requests print help without running command bodies.
- Bundled, cached, hosted, and custom pattern resolution are aligned for guard checks, eliminating false missing-pattern warnings for bundled patterns such as `content-section` and `form-basic`.
- `decantr suggest` now supports `--route`, `--file`, and `--from-code`, and ranks across slug, name, description, tags, components, interactions, visual briefs, layout hints, aliases, and domain language.
- `decantr list patterns` is browsable by slug/name/domain/source.
- MCP adds `decantr_prepare_task_context` for route-local task activation before an assistant edits a Brownfield app.
- `decantr health --browser --base-url <url> --evidence` writes a local visual manifest next to local screenshots.
- `decantr health --save-baseline` and `decantr health --since-baseline` add continuity across sessions.
- Interaction findings include source-scan evidence such as scanned file count, file line ranges, and expected signals where possible.

## Package Versions

- `@decantr/cli`: `2.6.0`
- `@decantr/registry`: `2.2.0`
- `@decantr/mcp-server`: `2.2.0`
- `@decantr/verifier`: `2.2.0`

## Content

The official content repo adds RecipeFork/AI-food patterns for recipe cards, photo-to-recipe generation, and AI kitchen chat. RecipeFork archetypes and theme preferences now point at those explicit domain patterns instead of relying only on generic feed/upload/chat patterns.

## Compatibility

This is a minor release because it adds commands flags, MCP surface, package exports, artifacts, and report behavior. No Essence V4 schema migration is required. Screenshots and source-derived evidence remain local unless a user explicitly chooses a hosted workflow.
