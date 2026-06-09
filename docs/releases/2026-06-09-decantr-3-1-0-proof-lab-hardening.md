# Decantr 3.1.0 Proof-Lab Hardening

Version: `3.1.0`

Decantr `3.1.0` is a Brownfield reliability release for the Decantr 3 governance line. It folds the Phase 0 proof-lab findings back into the public package surface so messy, pristine, and hybrid apps get sharper route context, better graph evidence, fewer noisy findings, and tighter MCP task scoping before a broader 3.2 dashboard push.

## Published Packages

This release publishes the stable public Decantr package surface as `3.1.0`:

- `@decantr/essence-spec@3.1.0`
- `@decantr/registry@3.1.0`
- `@decantr/css@3.1.0`
- `@decantr/core@3.1.0`
- `@decantr/telemetry@3.1.0`
- `@decantr/verifier@3.1.0`
- `@decantr/mcp-server@3.1.0`
- `@decantr/cli@3.1.0`

## What Changed

- Hardened Brownfield route discovery for messy React apps that route through `window.location.pathname`, route constants, case switches, `href`, and `to` targets.
- Added conservative Brownfield shell-drift detection for obvious public/full-bleed versus sidebar/app-shell mismatches without treating route names alone as app-shell proof.
- Made graph SourceArtifact generation file-only so route, file impact, and node impact graph commands no longer trip on directories.
- Scoped CLI and MCP changed-file context to the selected `--project`, which keeps monorepo task context from leaking sibling app changes.
- Reduced false positives in behavior and style verification by skipping project-owned form primitive definitions and allowing plain CSS variables such as `var(--foreground)`.
- Pointed interaction repair prompts at the correct Brownfield local-pattern verification command.
- Aligned MCP server advertised version metadata with the npm package version and added a metadata guard test.
- Documented the Phase 0 proof-lab findings and folded the work into the AI Frontend Governance reset plan.

## Compatibility

No Essence schema migration is required. Existing Decantr 3 projects can upgrade packages in place.

The release stays inside the Contract / Context / Evidence boundary:

- `Contract`: no new Essence field or registry schema.
- `Context`: route-scoped task context is tighter for messy Brownfield projects and monorepos.
- `Evidence`: findings and repair prompts get better file, graph, and command anchors.

## Verification

Release operators should use the Decantr release wrapper and closeout audits:

```bash
pnpm release:preflight
pnpm release:verify -- --version 3.1.0
pnpm release:closeout -- --version 3.1.0
```

After closeout passes, announce with:

```bash
pnpm release:announce -- --version 3.1.0 --send
```
