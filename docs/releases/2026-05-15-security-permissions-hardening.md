# Security Permissions Hardening

Decantr now has an explicit installed-package permission surface for enterprise and scanner review.

## What Changed

- Added `config/package-permissions.json` as the source of truth for filesystem, network, process, telemetry, hosted-upload, local-artifact, and scanner-note behavior across public Decantr packages.
- Added `docs/reference/security-permissions.md`, generated from that manifest.
- Added `pnpm audit:package-permissions`, which validates the permissions manifest, runs `npm pack --dry-run --json` for every public package, rejects install-time lifecycle scripts, and checks the generated docs for drift.
- Extended `pnpm audit:package-surface` so package-surface release checks also cover the permission surface.
- Documented the difference between the installed npm surface and internal monorepo scripts, showcase fixtures, docs examples, and release automation.
- Added MCP workspace containment coverage and clarified intentional fixed-argv process calls.

## Why It Matters

Static scanners that analyze the whole repository can flag internal release scripts or showcase apps as if they shipped to npm. The new permission reference gives security reviewers the installed-package view: what Decantr actually reads, writes, uploads, executes, and keeps local.

## Verification

```bash
pnpm audit:package-permissions
pnpm audit:package-surface
pnpm --filter @decantr/mcp-server test
```
