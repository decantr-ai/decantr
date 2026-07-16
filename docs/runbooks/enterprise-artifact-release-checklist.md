# Enterprise Artifact Release Checklist

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`
- `pnpm audit:package-surface`
- `pnpm audit:package-permissions`
- `pnpm audit:release-readiness`
- `pnpm audit:content-package`
- `pnpm audit:public-api -- --core-only --fail-on-error`
- `pnpm release:evidence --out=package-release-evidence`
- `node scripts/publish-packages.mjs --publish-dry-run --wave=<wave>`
- `node scripts/publish-packages.mjs --wave=<wave>` from the pinned publish workflow or local authenticated shell
- `node scripts/verify-published-packages.mjs --wave=<wave>`

`release:evidence` attempts `pnpm audit --json` first. When npm explicitly reports that pnpm's audit endpoints were retired with HTTP 410, it queries npm's supported bulk advisory endpoint using the installed pnpm dependency graph. Any advisory, malformed response, inventory failure, or transport failure still fails the release evidence gate.

Optional release notification:

- Set `RELEASE_VERIFICATION_WEBHOOK_URL` to a private release Discord webhook.
- Or reuse `TELEMETRY_HEALTH_WEBHOOK_URL` and run `node scripts/verify-published-packages.mjs --wave=<wave> --send-webhook`.
- Local verification loads `.env.release.local`, `.env.telemetry.local`, and `.env.local`; use `--env-file <path>` when validating from another secrets file.
