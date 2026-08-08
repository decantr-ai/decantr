# Decantr 3.11.2: Route Authority Hardening

Decantr 3.11.2 is a direct stable delivery-wave patch for `@decantr/verifier`, `@decantr/cli`, and `@decantr/mcp-server`. It hardens framework-specific route and task authority found during independent Brownfield field trials. It does not change the eight-tool MCP inventory or introduce a new report schema.

```bash
npx @decantr/cli@3.11.2 verify
npx @decantr/cli@3.11.2 scan
npx @decantr/mcp-server@3.11.2
```

## What Changed

- TanStack Router keeps authored route files as implementation authority while using generated route metadata only to corroborate public paths for route groups, pathless layouts, and parameters. Root and pathless layouts remain structural, non-taskable signals. Convention-sensitive routes without generated corroboration cap topology completeness at `partial` instead of reporting false certainty.
- Astro treats `.astro`, `.md`, `.mdx`, and `.html` files under `src/pages` as taskable UI pages. TypeScript and JavaScript response handlers remain observable topology but are not promoted to UI edit targets.
- Angular wildcard routes are terminal fallbacks and no longer create invented descendants such as `/**/401`.
- Angular workspace packages resolve `ng-packagr` secondary entries to exported component source before considering installed-package fallbacks.
- Angular route/task surfaces include statically resolved external templates, `styleUrl`/`styleUrls`, and adjacent authored Pug source. Resolution is workspace-contained and cached per file.
- Angular component inventory is limited to decorator-backed components instead of counting arbitrary TypeScript files.

## Compatibility

- `change-assurance-report.v1`, `scan-report.v2`, `TaskCapsuleV1`, CI v2/v3, and existing CLI command names are unchanged.
- MCP remains `io.github.decantr-ai/mcp-server` over stdio with exactly eight tools. `server.json`, Smithery metadata, runtime identity, and the npm package are aligned at 3.11.2.
- `@decantr/content`, `@decantr/registry`, `@decantr/core`, `@decantr/essence-spec`, `@decantr/css`, and `@decantr/telemetry` are unchanged.

## Validation Boundary

The patch adds regression coverage for TanStack generated-path corroboration, Astro endpoint separation, Angular wildcard behavior, workspace secondary-entry precedence, external component resources, and changed-file-to-surface resolution. Release qualification still includes the repository build/test suite, 3.11 change-assurance trials, documentation audits, package-surface and permission audits, packed MCP clean-consumer verification, npm provenance, public-package verification, and tag-bound closeout.

The external repository replays that motivated these fixes are development and regression evidence. They do not establish route precision or recall, broad adoption value, or improvement to frontier-model outcomes. Those claims remain gated by the separate frozen research program.
