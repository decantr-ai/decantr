# Decantr Showcase Host

Decantr live showcases are served by one maintained Vite app at `apps/showcase-host`.
Historical showcase projects are capsules under `apps/showcase-host/src/capsules/<slug>/`.

`apps/showcase/` remains the stable metadata surface for API compatibility:

- `apps/showcase/manifest.json`
- `apps/showcase/reports/shortlist-verification.json`

## Routing

Public showcase URLs use the host route:

```text
/showcase/:slug
/showcase/:slug/:path*
```

The registry app rewrites every `/showcase/:path*` request to the copied showcase host SPA at `/showcase/index.html`.
The outer host parses `:slug`, then iframe-loads the capsule runner:

```text
/showcase/:slug/__runner?runner=1#/:path*
```

Iframe isolation is intentional. Capsules may keep their generated global CSS, token files, and route assumptions without leaking styles into the registry UI or into other capsules.

## Capsule Shape

Each capsule owns its generated contract and app source:

```text
apps/showcase-host/src/capsules/<slug>/
  DECANTR.md
  decantr.essence.json
  .decantr/
  src/
```

Do not add new standalone `apps/showcase/<slug>` workspaces. New live showcases should be promoted into the host.

## Promotion Flow

The intended refresh flow is:

1. Run `decantr new` in a temporary workspace.
2. Let the cold scaffold agent build the app.
3. Run local scaffold checks and visual review.
4. Promote the verified workspace into the host:

```bash
node scripts/blueprint-harness/harness.mjs promote /tmp/codex-scaffold/my-app --slug=<blueprint-slug>
```

Use `--force` only when intentionally replacing an existing capsule.

## Build And Verification

```bash
pnpm --filter ./apps/showcase-host build
pnpm run showcase:verify:shortlist
pnpm run showcase:validate
pnpm --filter ./apps/registry build
```

`scripts/build-showcases.mjs` builds the host once.
`scripts/copy-showcase-dist.mjs` copies that host build into `apps/registry/public/showcase/` and writes the public showcase metadata files.
`scripts/verify-showcase-shortlist.ts` keeps its legacy name for API compatibility, but verifies every active capsule in `apps/showcase/manifest.json`.
