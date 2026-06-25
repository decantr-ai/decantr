# Decantr 3.6.0 Brownfield Proof Quality

Decantr 3.6.0 is a coordinated quality release for the Brownfield control loop. It keeps Essence V4, v2 report contracts, the eight-tool MCP surface, telemetry posture, hosted upload posture, and explicit write boundaries unchanged.

## Packages

- `@decantr/core@3.6.0`
- `@decantr/verifier@3.6.0`
- `@decantr/mcp-server@3.6.0`
- `@decantr/cli@3.6.0`

Foundation packages that did not need code changes remain on their existing stable versions.

## Highlights

- Ranked monorepo app candidates so product UI apps rank ahead of docs, Storybook, API/server, MCP helper, workbench/demo, and package/library surfaces.
- Added candidate rank, score, category, and reason metadata to `decantr workspace list --json` while preserving existing path and suggested-adopt fields.
- Extended the real-world corpus harness to emit v2 reports with root-smoke vs app-scoped command classification, timing percentiles, slow-command budgets, and stable failure categories.
- Added checked-in first-mile and hard-mode corpus configs for repeatable external dogfood runs.
- Tuned `COMP010` component-reuse findings from the hard-mode Midday corpus so file/hidden/specialized input controls and Dropzone `getInputProps()` upload inputs do not get mislabeled as generic `Input` drift.
- Re-ran the committed proof-field corpus for 3.6 and published `docs/benchmarks/2026-06-25-decantr-3-6-proof-field-report.md`.
- Updated active docs, package docs, public homepage labels, `llms.txt`, benchmark methodology, and the Decantr engineering skill for the 3.6 proof-quality train.
- Added a full markdown documentation audit with explicit keep/update/delete policy.

## Failure Taxonomy

The corpus harness now separates:

- `setup_friction`
- `missing_project_scope`
- `route_context_failure`
- `decantr_command_failure`
- `runtime_proof_gap`

This keeps public dogfood results honest: service setup or browser-runtime gaps should not be reported as Decantr route/context failures.

## Finding Quality

The 3.5.5 hard-mode corpus showed eight `COMP010` findings in Midday upload/avatar/logo flows. Those were legitimate project code paths, but several were false-positive suggestions to replace file-upload controls with a generic `Input` primitive. In 3.6, the verifier excludes static specialized input types and React Dropzone `getInputProps()` inputs from generic `Input` drift. A rerun against the existing Midday hard-mode clone reduced `COMP010` from 8 to 0 without weakening the committed proof-corpus raw-button drift case.

## Documentation

The 3.6 documentation audit is `docs/audit/2026-06-25-decantr-3-6-0-docs-audit.md`. Historical release notes, benchmark reports, specs, programs, runbooks, and audits were preserved. No markdown files were deleted in this release.

## Release Checks

Before publish, run:

```bash
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
pnpm release:commands -- --only=@decantr/core,@decantr/verifier,@decantr/mcp-server,@decantr/cli
pnpm release:preflight -- --only=@decantr/core,@decantr/verifier,@decantr/mcp-server,@decantr/cli
```

After publish, close out with:

```bash
pnpm release:verify -- --only=@decantr/core,@decantr/verifier,@decantr/mcp-server,@decantr/cli
pnpm release:closeout -- --only=@decantr/core,@decantr/verifier,@decantr/mcp-server,@decantr/cli --version 3.6.0
```
