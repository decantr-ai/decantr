# Security Policy

## Supported Surfaces

Security fixes are prioritized for the published Decantr npm packages, the hosted registry API, the registry portal, and official registry content consumed by `@decantr/cli` or `@decantr/mcp-server`.

## Package Permissions

The canonical installed-package permission surface lives in [docs/reference/security-permissions.md](docs/reference/security-permissions.md) and is generated from `config/package-permissions.json`.

That reference distinguishes the published npm packages from internal monorepo scripts, showcase fixtures, docs examples, and release automation. Static scanners that analyze the whole repository may flag internal release helpers or benchmark apps that do not ship to npm.

Key defaults:

- CLI telemetry is disabled unless a project explicitly opts in with `--telemetry`, `decantr telemetry link --enable`, or `.decantr/project.json` containing `telemetry: true`.
- Browser evidence and screenshots stay local under `.decantr/evidence/*` unless a user explicitly invokes a hosted workflow.
- MCP write tools are explicitly annotated and paths are contained to the active workspace root.
- Hosted critique/audit source upload fallbacks are opt-in and require `allow_hosted_upload: true` on the MCP surface or an explicit hosted CLI command.
- Published packages use `files` allowlists, and release audits run `npm pack --dry-run --json` to prove what actually ships.

## Reporting

Please report suspected vulnerabilities privately through GitHub Security Advisories for `decantr-ai/decantr`. Do not open a public issue for exploitable behavior, secrets, auth bypasses, package publication issues, or hosted analysis data-exposure concerns.

## Artifact Expectations

Release candidates must pass package build/test gates, public API audits, registry portal audits, dependency vulnerability scans, npm package-surface checks, and provenance-enabled npm publish workflows before being promoted as latest.

Run the package permission audit as part of release confidence:

```bash
pnpm audit:package-permissions
```
