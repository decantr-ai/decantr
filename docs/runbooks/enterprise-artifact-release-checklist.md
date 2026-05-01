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
- `npm publish --provenance --access public` from the pinned publish workflow
