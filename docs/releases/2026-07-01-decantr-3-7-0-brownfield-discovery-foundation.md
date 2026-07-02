# Decantr 3.7.0 Brownfield Discovery Foundation

Decantr 3.7.0 ships a shared Brownfield discovery substrate across `@decantr/verifier`, `@decantr/cli`, and `@decantr/mcp-server`.

The release fixes a real monorepo failure mode: a selected React/Vite/TypeScript app inside a mixed Angular/React workspace should inherit the workspace package manager, but framework, language, routes, components, styling, assistant rules, confidence, and limitations must come from the selected app.

## Highlights

- `scanProject()` now emits `scan-report.v2` by default.
- `@decantr/verifier` exports stable `discoverProject()` discovery types and helpers.
- Discovery reports workspace/app scope, package manager, framework, primary language, route signals, taskable routes, component inventory confidence, styling authority, assistant rules, and limitations.
- TanStack Router is handled as generic source-declared route evidence through `createFileRoute`, `createLazyFileRoute`, route literals, and generated route trees.
- Component inventory now includes feature-folder components, exported/default components, memo/forwardRef wrappers, PascalCase TSX/JSX files, and route-local components while excluding tests, stories, mocks, generated declarations, and build output.
- CLI scan output avoids false precision with component confidence labels and partial-inventory limitations.
- MCP keeps the eight-tool surface and includes compatible discovery metadata in project state, task context, evidence bundles, and health-loop responses.
- A committed mixed Angular/React/TanStack fixture now anchors the regression class.

## Package Wave

- `@decantr/verifier@3.7.0`
- `@decantr/cli@3.7.0`
- `@decantr/mcp-server@3.7.0`

`@decantr/core` is unchanged.

## Compatibility

`scan --json` intentionally moves to `scan-report.v2`. `scan-report.v1.json` remains published for historical validation. No Essence fields, MCP tools, telemetry behavior, hosted upload behavior, or Decantr CSS adoption behavior changed.

