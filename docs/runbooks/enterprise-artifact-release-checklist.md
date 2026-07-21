# Enterprise Artifact Release Checklist

Use this checklist with [Release Stewardship](release-stewardship.md). Decantr 3.9 publishes directly to stable; no RC or `next` lane exists. Machine, package, provenance, and closeout evidence is mandatory. Human finding evidence is required only for a quantitative qualification claim and remains explicitly waived for the sole-maintainer 3.9.1 publication.

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm biome:check`
- `pnpm audit:package-surface`
- `pnpm audit:package-permissions`
- `pnpm audit:packed-content-facade`
- `pnpm audit:packed-mcp-server`
- `pnpm audit:3-9-qualification:lint`
- `pnpm qualification:3-9:route`
- `pnpm qualification:3-9:machine`
- Confirm `fixtures/qualification/3.9/release-waiver.json` names the sole maintainer, accepts exactly the four human finding gaps, and prohibits qualification/adoption claims.
- `pnpm audit:3-9-qualification` must remain `INCOMPLETE` with exactly those four gaps unless two independent humans later complete the finding lane.
- `pnpm audit:3-9-release-gate` must exit zero and report `SOLE-MAINTAINER UNQUALIFIED` or `HUMAN QUALIFIED`.
- `pnpm audit:release-readiness`
- `pnpm audit:content-package`
- `pnpm audit:public-api -- --core-only --fail-on-error`
- `pnpm release:evidence --out=package-release-evidence`
- `pnpm release:preflight`
- `pnpm release:commands`
- Commit and push the verified source and evidence to `main`.
- Create and push the exact stable `v3.9.1` tag only after every gate passes.
- Create the GitHub Release from `docs/releases/2026-07-16-decantr-3-9-0-governed-change-proof.md`.
- Dispatch `.github/workflows/publish.yml` from `main` with `release_tag=v3.9.1`; use the wrapper, never bare `npm publish`.
- `pnpm release:verify`
- `pnpm release:closeout -- --version 3.9.1`
- `pnpm release:announce -- --version 3.9.1 --send` only after closeout passes.

`release:evidence` attempts `pnpm audit --json` first. When npm explicitly reports that pnpm's audit endpoints were retired with HTTP 410, it queries npm's supported bulk advisory endpoint using the installed pnpm dependency graph. Any advisory, malformed response, inventory failure, or transport failure still fails the release evidence gate.

The evidence generator and publish wrapper use the same deterministic canonical tarball helper. The SHA-256 in each package evidence directory therefore identifies the exact archive shape qualified for publication, not an npm-version- or operating-system-specific repack.

Optional private verification notification:

- Set `RELEASE_VERIFICATION_WEBHOOK_URL` to a private release Discord webhook.
- Or reuse `TELEMETRY_HEALTH_WEBHOOK_URL` and run `node scripts/verify-published-packages.mjs --wave=<wave> --send-webhook`.
- Local verification loads `.env.release.local`, `.env.telemetry.local`, and `.env.local`; use `--env-file <path>` when validating from another secrets file.
