# Enterprise Artifact Release Checklist

Use this checklist with [Release Stewardship](release-stewardship.md). Decantr 3.10 publishes directly to stable; no RC or `next` lane exists. Build, test, documentation, package, provenance, and closeout evidence is mandatory. The separate model-lift experiment is required only for a quantitative frontier-model improvement claim, not for product publication.

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm biome:check`
- `pnpm audit:package-surface`
- `pnpm audit:package-permissions`
- `pnpm audit:packed-content-facade`
- `pnpm audit:packed-mcp-server`
- `pnpm audit:docs-marketing`
- `pnpm audit:docs-drift`
- `pnpm audit:public-links`
- `pnpm audit:release-readiness`
- `pnpm audit:content-package`
- `pnpm audit:public-api -- --core-only --fail-on-error`
- `pnpm release:evidence --out=package-release-evidence`
- `pnpm release:preflight`
- `pnpm release:commands`
- Commit and push the verified source and evidence to `main`.
- Create and push the exact stable `v3.10.0` tag only after every gate passes.
- Create the GitHub Release from `docs/releases/2026-08-07-decantr-3-10-0-authority-aware-ui-change-control.md`.
- Let the tag trigger `.github/workflows/publish.yml`, or dispatch it from `main` with `release_tag=v3.10.0`; use the wrapper, never bare `npm publish`.
- `pnpm release:verify`
- `pnpm release:closeout -- --version 3.10.0 --staging-manifest=<downloaded-publish-manifest>`
- `pnpm release:announce -- --version 3.10.0 --send` only after closeout passes.

The frozen 3.9 qualification packet remains historical evidence for the 3.9 line. Do not rerun or rewrite it as 3.10 publication authorization. Likewise, do not claim measured model improvement from deterministic 3.10 regression tests or product closeout.

`release:evidence` attempts `pnpm audit --json` first. When npm explicitly reports that pnpm's audit endpoints were retired with HTTP 410, it queries npm's supported bulk advisory endpoint using the installed pnpm dependency graph. Any advisory, malformed response, inventory failure, or transport failure still fails the release evidence gate.

The evidence generator and publish wrapper use the same deterministic canonical tarball helper. The SHA-256 in each package evidence directory therefore identifies the exact archive shape qualified for publication, not an npm-version- or operating-system-specific repack.

Optional private verification notification:

- Set `RELEASE_VERIFICATION_WEBHOOK_URL` to a private release Discord webhook.
- Or reuse `TELEMETRY_HEALTH_WEBHOOK_URL` and run `node scripts/verify-published-packages.mjs --wave=<wave> --send-webhook`.
- Local verification loads `.env.release.local`, `.env.telemetry.local`, and `.env.local`; use `--env-file <path>` when validating from another secrets file.
