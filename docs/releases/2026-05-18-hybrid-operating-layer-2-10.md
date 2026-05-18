# Hybrid Operating Layer 2.10

Release target: `@decantr/cli@2.10.0` and `@decantr/mcp-server@2.4.0`.

## What Changed

- `decantr doctor` now reports the active adoption lane: Brownfield contract-only, Hybrid local law, Hybrid style bridge, Hybrid with Decantr CSS, Hybrid composition, Greenfield contract-only, or Greenfield scaffold.
- `decantr task <route> "<task>"` now prints an authority block with source authority, style authority, active authorities, runtime boundary, and warnings for cross-runtime requests or Decantr CSS usage outside `decantr-css` mode.
- MCP `decantr_prepare_task_context` returns the same task authority summary so assistants can preserve the right local/project/Decantr boundary before editing.
- `decantr codify --from-audit` now frames accepted local patterns and rules as the first Hybrid authority layer, with hosted registry patterns treated as optional guidance until mapped into project-owned law.
- Local law proposal files now include Hybrid precedence guidance: existing production source, accepted local law, Essence V4, then hosted registry patterns and execution packs as guidance.

## Why

Brownfield contract-only is valuable, but it is intentionally conservative. Real teams eventually ask Decantr to help standardize buttons, cards, forms, route layouts, theme variants, and task-time LLM behavior without rewriting the app or pretending Decantr's public registry owns their design system. This release gives that middle state a name, visible authority boundaries, and assistant-readable context.

## Compatibility

No Essence V4 schema change is required. Existing Brownfield projects keep working as contract-only until they accept local law, adopt a style bridge, adopt Decantr CSS, or use Hybrid composition commands.

## Try It

```bash
pnpm exec decantr doctor --project apps/web
pnpm exec decantr codify --from-audit --project apps/web
pnpm exec decantr codify --accept --project apps/web
pnpm exec decantr task /feed "standardize recipe cards without changing runtime" --project apps/web
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
```
