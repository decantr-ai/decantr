# Security Policy

## Supported Surfaces

Security fixes are prioritized for the published Decantr npm packages, the official `@decantr/content` corpus and clients, the optional content/reference API, and the local CLI and MCP surfaces that consume them.

## Package Permissions

The canonical installed-package permission surface lives in [docs/reference/security-permissions.md](docs/reference/security-permissions.md) and is generated from `config/package-permissions.json`.

That reference distinguishes the published npm packages from internal monorepo scripts, showcase fixtures, docs examples, and release automation. Static scanners that analyze the whole repository may flag internal release helpers or benchmark apps that do not ship to npm.

Key defaults:

- Governance is local-first: scan, audit, critique, verification, context generation, and browser evidence read the selected workspace in place.
- Bare `decantr verify` runs Changed-UI Assurance with zero writes by default. The CLI invokes local Git commands to resolve staged, unstaged, deleted, renamed, untracked, commit-range, and unborn-branch scope; it may read directly referenced workspace-package source as component authority.
- The content/reference API provides optional corpus, schema, search, and execution-pack reads. It does not accept project source code or replace local CLI and MCP verification.
- CLI telemetry is disabled unless a project explicitly opts in, and delivery still requires a caller-configured endpoint. Decantr does not provide a default hosted telemetry sink.
- Browser evidence and screenshots stay local under `.decantr/evidence/*`.
- MCP write tools are explicitly annotated and paths are contained to the active workspace root.
- Published packages use `files` allowlists, and release audits run `npm pack --dry-run --json` to prove what actually ships.

## Reporting

Please report suspected vulnerabilities privately through GitHub Security Advisories for `decantr-ai/decantr`. Do not open a public issue for exploitable behavior, secrets, auth bypasses, package publication issues, or content API and MCP data-exposure concerns.

## Artifact Expectations

Public releases must pass package build/test gates, content and public API audits, dependency vulnerability scans, npm package-surface checks, and provenance-enabled npm publish workflows before being promoted as latest.

Run the package permission audit as part of release confidence:

```bash
pnpm audit:package-permissions
```
