# Hybrid Style Bridge 2.12.0

Release target: `@decantr/cli@2.12.0`, `@decantr/mcp-server@2.5.0`, and `@decantr/verifier@2.5.0`.

## What Changed

- `decantr codify --style-bridge` now proposes `.decantr/style-bridge.proposal.json`, a project-owned Hybrid bridge from Decantr design intent to existing app tokens, classes, components, and theme modes.
- `decantr codify --accept` promotes reviewed style bridge proposals to `.decantr/style-bridge.json` and marks the project as `style-bridge` adoption without installing Decantr CSS or taking source ownership.
- `decantr task`, MCP `decantr_prepare_task_context`, and `decantr suggest` now surface accepted style bridge mappings before assistants edit or search for patterns.
- `decantr doctor`, `decantr verify`, and `decantr ci` now report the style bridge as part of the active Hybrid lane; CI JSON/Markdown/Text includes bridge status, mapping count, styling approach, and theme modes.
- `decantr setup` and the post-adopt operating loop now point Brownfield users at the combined `decantr codify --from-audit --style-bridge` path, while attached apps get the day-two loop: `doctor`, any missing codify step, `task`, `verify`, and `ci init`.
- CI/health assertion filtering now treats `style-bridge` like contract-only for optional hosted packs and Decantr CSS token files, avoiding adoption-mode mismatch warnings when the existing app owns styling.
- Brownfield style detection now scans common theme CSS files such as `src/styles/themes.css` and detects single-quoted `[data-theme='dark']` selectors, aligning `analyze` with the richer theme inventory.
- Local-law source hints now collect button/action classes from interactive elements instead of container classes, avoiding false hints like theme switcher wrappers.
- Verifier critique and source-audit copy treats both contract-only and style-bridge Brownfield as project-owned styling lanes, so Decantr CSS treatment guidance stays out unless that mode is explicitly adopted.
- Security permissions docs now list local artifacts explicitly, including `.decantr/style-bridge*.json`.

## Notes

No Essence V4 schema change is required. Existing Brownfield apps can stay contract-only, accept local law only, or add a reviewed style bridge when they want Decantr to explain how its vocabulary maps onto their actual styling system.

## Verification

- `pnpm --filter @decantr/verifier --filter @decantr/mcp-server --filter @decantr/cli run build`
- `pnpm exec vitest run test/style-bridge.test.ts test/local-law.test.ts` from `packages/cli`
- `pnpm exec vitest run test/e2e/operating-layer.test.ts` from `packages/cli`
- `pnpm exec vitest run test/e2e/analyze.test.ts` from `packages/cli`
- `pnpm audit:package-surface`
- Cold tmp dogfood against a React/Vite-style Brownfield app: `setup`, `adopt --yes --no-packs`, `codify --from-audit --style-bridge`, `codify --accept`, `doctor`, `task`, `suggest --from-code`, `ci --json`, and `verify --brownfield --local-patterns`
