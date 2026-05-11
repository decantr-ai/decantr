# Enterprise Artifact Release Checklist

- `pnpm install --frozen-lockfile`
- `pnpm audit --json`
- `pnpm run build:packages`
- `pnpm --filter decantr-api typecheck`
- `pnpm --filter decantr-api exec vitest run test/routes/critique.test.ts test/routes/auth.test.ts test/routes/billing.test.ts test/routes/orgs.test.ts test/routes/publish.test.ts`
- `pnpm audit:package-surface`
- `pnpm audit:release-readiness`
- `pnpm audit:public-api -- --core-only --fail-on-error`
- `pnpm audit:registry-portal -- --fail-on-error`
- `pnpm release:evidence --out=package-release-evidence`
- `node scripts/publish-packages.mjs --publish-dry-run --wave=<wave>`
- `node scripts/publish-packages.mjs --wave=<wave>` from the pinned publish workflow or local authenticated shell
- `node scripts/verify-published-packages.mjs --wave=<wave>`

Optional release notification:

- Set `RELEASE_VERIFICATION_WEBHOOK_URL` to a private release Discord webhook.
- Or reuse `TELEMETRY_HEALTH_WEBHOOK_URL` and run `node scripts/verify-published-packages.mjs --wave=<wave> --send-webhook`.
- Local verification loads `.env.release.local`, `.env.telemetry.local`, and `.env.local`; use `--env-file <path>` when validating from another secrets file.
