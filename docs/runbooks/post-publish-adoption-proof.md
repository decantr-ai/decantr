# Post-Publish Adoption Proof

Use this runbook after an npm release and before describing that release as adopted successfully. It tests public npm artifacts, exact Brownfield commits, a current greenfield generator, host builds, and host-source integrity.

## Rules

- Use an empty `/tmp` output directory.
- Install the exact public version with npm. Do not use a workspace link, local package directory, or global Decantr binary.
- Pin Brownfield repositories to reviewed commits.
- Generate the greenfield target from an exact CLI version.
- Keep generated reports in `/tmp` or CI artifacts. Commit only the human-reviewed audit.
- Treat host formatter failures as Decantr failures only when adoption changed the failing host files or changed the result relative to a pristine control.

## Brownfield Corpus

From the Decantr monorepo:

```bash
OUT=/tmp/decantr-post-publish-3.8.2
pnpm benchmark:post-publish-adoption -- \
  --cli-package @decantr/cli@3.8.2 \
  --out "$OUT/brownfield"
```

The harness installs the requested CLI package in its own npm prefix, clones the refs in `scripts/realworld-corpus.post-publish.json`, runs the command matrix, and writes:

- `reports/aggregate-summary.json`
- `reports/realworld-corpus.md`
- per-command stdout and stderr under `logs/`

The gate passes only when both projects have taskable routes, no unexpected command failures, no crash signatures, and no performance-budget failures. Inspect task output manually to confirm that the first read target is the route implementation, not a layout, generated route tree, or unrelated sibling app.

## Greenfield Lane

Generate a current TanStack Start control with an exact generator version:

```bash
OUT=/tmp/decantr-post-publish-3.8.2
npx --yes @tanstack/cli@0.69.6 create greenfield-tanstack \
  --framework React \
  --package-manager npm \
  --toolchain biome \
  --no-examples \
  --no-git \
  --no-intent \
  --yes \
  --target-dir "$OUT/greenfield"

npm install \
  --prefix "$OUT/runner" \
  --no-package-lock \
  --no-audit \
  --no-fund \
  @decantr/cli@3.8.2
```

Run the installed binary without adding it to the generated application's dependencies:

```bash
CLI="$OUT/runner/node_modules/@decantr/cli/dist/bin.js"
node "$CLI" scan --json
node "$CLI" init \
  --workflow=greenfield \
  --adoption=contract-only \
  --assistant-bridge=apply \
  --yes
node "$CLI" task / "Review the generated home route" --json
node "$CLI" ci --fail-on error --json
```

The task gate requires `ready_to_edit`, a current graph, and `src/routes/index.tsx` as the first implementation read for `/` when the starter uses the standard TanStack `__root.tsx` plus `index.tsx` structure.

## Host Gates

Run each target's own install, build, and source check after Decantr adoption:

| Target | Install | Build | Source check |
| --- | --- | --- | --- |
| TanStack dashboard | `npx --yes bun@latest install --frozen-lockfile` | `npx --yes bun@latest run build` | `npx --yes bun@latest run format:check` |
| Bulletproof React app | `npx --yes yarn@1.22.22 install --frozen-lockfile --ignore-scripts` | `npx --yes yarn@1.22.22 build` | `npx --yes yarn@1.22.22 lint` |
| Generated TanStack app | generator installs dependencies | `npm run build` | `npm run check` |

Capture a pristine greenfield source-check result before adoption. If the post-adoption result fails, compare it with the pristine result and inspect `git diff` before assigning responsibility.

Contract-only adoption may create Decantr governance artifacts and narrowly update ignore files. It must not rewrite application source. Host-generated files such as TanStack's `routeTree.gen.ts` are allowed only when the host build generated them and the audit records that provenance.

## Required Evidence

Record these facts in the release audit:

- npm package names, versions, and zero-link install boundary
- repository URLs and exact commits
- generator package and exact version
- scan, adoption/init, task, CI, build, and source-check durations
- route count and first task read target
- inherited versus new CI findings
- source files changed by Decantr versus by host tooling
- any defect, limitation, or unmeasured claim

Do not claim false-positive precision without a human-labeled findings set. Do not claim a percentile from a single run.
