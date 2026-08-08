# Decantr 3.11.3: SvelteKit Task Authority

Decantr 3.11.3 is a direct stable delivery-wave patch for `@decantr/verifier`, `@decantr/cli`, and `@decantr/mcp-server`. It corrects SvelteKit route and task authority found during an exact public-package Brownfield replay, and it aligns the reusable corpus harness with the two distinct `verify` contracts. It does not change the eight-tool MCP inventory or introduce a new report schema.

```bash
npx @decantr/cli@3.11.3 verify
npx @decantr/cli@3.11.3 scan
npx @decantr/mcp-server@3.11.3
```

## What Changed

- SvelteKit `+page.svelte` is the taskable UI implementation for a file route.
- Colocated `+page.ts`, `+page.js`, `+page.server.ts`, and `+page.server.js` modules remain production page-data authority, but they no longer become competing UI routes or rank-one edit targets.
- A SvelteKit directory containing only page-data modules is not reported as a taskable UI page.
- Route task context keeps the selected `+page.svelte` implementation at rank one and adds same-directory page-data modules as bounded supporting authority reads.
- The real-world corpus harness now validates bare `verify` as `change-assurance-report.v1` and separately runs `verify --full --json` for `project-health.v2`.

## Compatibility

- `change-assurance-report.v1`, `scan-report.v2`, `TaskCapsuleV1`, CI v2/v3, and existing CLI command names are unchanged.
- MCP remains `io.github.decantr-ai/mcp-server` over stdio with exactly eight tools. `server.json`, Smithery metadata, runtime identity, and the npm package are aligned at 3.11.3.
- The TanStack, Astro, and Angular authority hardening shipped in 3.11.2 remains intact.
- `@decantr/content`, `@decantr/registry`, `@decantr/core`, `@decantr/essence-spec`, `@decantr/css`, and `@decantr/telemetry` are unchanged.

## Validation Boundary

An eight-target, serial, exact-public-3.11.2 acceptance run exercised Angular, TanStack Start, Astro, Next.js in a Turborepo, native JavaScript, SvelteKit, Solid, and the committed state of a real Next.js monorepo. It ran 152 CLI commands. Seven targets passed; the SvelteKit target failed because `/` resolved to both `+page.svelte` and colocated `+page.ts`.

The same pinned corpus and command matrix then ran against the local 3.11.3 candidate. All 152 commands and all eight target gates passed, with no crash signatures, route misses, or performance-budget failures. A focused SvelteKit replay also passed all 19 commands with `+page.svelte` first and page-data modules retained as supporting reads.

These runs did not install or build each host project, exercise browser behavior, measure route precision or recall, or compare model outcomes. The real monorepo target used a committed revision and explicitly excluded its dirty working tree. The corpus is development and regression evidence, not a claim of broad adoption success or frontier-model improvement.
