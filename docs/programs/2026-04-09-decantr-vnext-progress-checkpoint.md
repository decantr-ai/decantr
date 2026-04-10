# Decantr vNext Progress Checkpoint

Date: 2026-04-09

This checkpoint records what is already implemented on the `codex/decantr-vnext-reset`
branch so the reset program can continue from a known-good state instead of relying on
commit archaeology.

## Branch State

- `decantr-monorepo`: `codex/decantr-vnext-reset`
- `decantr-content`: `codex/decantr-vnext-resetmai`

## Completed Streams

### Product boundary reset

- Removed legacy UI-runtime surfaces from the active monorepo product boundary:
  - `apps/ui-site`
  - `apps/workbench`
  - `packages/ui`
  - `packages/ui-chart`
  - `packages/ui-catalog`
- Reframed `apps/showcase/*` as a benchmark corpus instead of a product app line.
- Archived stale planning/docs that kept the old product story alive.

### Registry/content/API normalization

- Normalized live registry taxonomy around:
  - `pattern`
  - `theme`
  - `blueprint`
  - `archetype`
  - `shell`
- Removed lingering `recipe` and `theme.style` drift from active product flows.
- Tightened shared registry typing to match the real corpus.
- Hardened `decantr-content` validation around live schema contracts.

### Schema ownership

- Canonical registry schemas live in package surfaces under `packages/registry/schema`.
- API schema serving reads from package exports instead of private copies.
- Public schema copies in `docs/schemas` are synced from package sources.
- `decantr-content` has a schema sync path back to the monorepo package source.
- `essence.v3.json` now matches the actual sectioned v3.1 contract already used by the compiler and guard stack:
  - sectioned blueprints
  - route maps
  - route-bearing blueprint pages
  - `meta.seo`
  - `meta.navigation`
- `migrateV30ToV31()` now emits a schema-valid section description instead of producing an invalid v3.1 artifact.

### Execution packs

- Added schema-backed execution pack contracts:
  - scaffold
  - section
  - page
  - mutation
  - review
  - pack manifest
- Added a hosted execution-pack bundle contract:
  - `execution-pack-bundle.v1.json`
- Added a hosted selected execution-pack contract:
  - `selected-execution-pack.v1.json`
- CLI now emits pack artifacts into scaffolded projects.
- Shared core now compiles execution-pack bundles from essence as a reusable runtime primitive instead of only inside CLI scaffold glue.
- Shared core now also selects one scaffold, review, section, page, or mutation pack from a compiled bundle as a reusable primitive.
- MCP can read scaffold, section, page, mutation, and review pack context.
- MCP context readers now fall back to hosted pack compilation when local `.decantr/context` artifacts are missing or incomplete.
- Generated project guidance now points operators to packs first.
- Hosted API now compiles execution packs from essence documents through:
  - `POST /v1/packs/compile`
- Hosted API now also returns one selected execution pack plus manifest metadata through:
  - `POST /v1/packs/select`
- Public registry client and CLI now expose that hosted compiler surface:
  - `RegistryAPIClient.compileExecutionPacks()`
  - `decantr registry compile-packs`
  - `RegistryAPIClient.selectExecutionPack()`
  - `decantr registry get-pack`
- `decantr registry get-pack manifest` now uses the smaller hosted selected-pack path and returns just the manifest metadata without requiring a full hosted bundle compile.
- `@decantr/registry` now exposes a first-class `getExecutionPackManifest()` client helper, so CLI and MCP manifest reads do not duplicate their own scaffold-pack selection glue.
- `decantr registry compile-packs --write-context` can now materialize the hosted pack bundle into local `.decantr/context` artifacts without waiting for a full refresh cycle.
- `decantr registry get-pack --write-context` can now materialize just the hosted selected pack plus `pack-manifest.json` into local `.decantr/context`, so operators can hydrate exactly one pack without compiling the full bundle.
- `decantr_get_execution_pack` now uses the hosted selected-pack surface for targeted remote pack reads instead of recompiling the full hosted bundle when local artifacts are missing.
- `decantr_get_section_context` and `decantr_get_page_context` now also use hosted selected-pack reads for remote fallback, so MCP no longer recompiles the full hosted bundle when it only needs one page pack or one section pack.
- Plain `decantr audit` now opportunistically hydrates missing local execution-pack artifacts from the hosted compiler before running local critique or project audit, so pack-first verification still works on partially initialized projects.
- `decantr audit <file>` now hydrates just the hosted review pack plus manifest via pack select when local review context is missing, instead of recompiling and writing the full hosted bundle for single-file critique.
- Plain `decantr audit` now also prefers hydrating just the hosted review pack plus manifest before falling back to a full hosted bundle compile, so routine local project audits stay on the smaller pack-first remote path.
- MCP scaffold-context fallback now prefers hosted selected scaffold/review packs plus manifest before falling back to a full hosted bundle, reducing remote context payload size when local scaffold artifacts are missing.
- MCP manifest-only execution-pack reads now also prefer a hosted selected scaffold pack plus manifest before falling back to full hosted bundle compilation, keeping default remote manifest reads aligned with the smaller pack-first path.
- Live hosted rollout is now green for all current public pack and verification surfaces:
  - `POST /v1/packs/compile`
  - `POST /v1/packs/select`
  - `POST /v1/critique/file`
  - `POST /v1/audit/project`
  - `pnpm audit:public-api` passes against `https://api.decantr.ai/v1`
  - the root `pnpm audit:public-api` command now includes those hosted pack and verifier checks by default

### Verification foundation

- Added shared verifier package: `@decantr/verifier`
- Added schema-backed verifier report contracts.
- CLI and MCP now share the verifier engine.
- Review packs now inform critique behavior.
- Project audit now aggregates source-tree findings from `src/`, `app/`, `pages/`, and `components/` when they are present, including inline styles, risky HTML patterns, placeholder routes, auth storage writes, accessibility issues, and unsafe form/auth input behavior.
- Project audit now also scans common root implementation surfaces such as `lib/`, `hooks/`, `providers/`, `server/`, plus root `middleware.*` and `proxy.*`, so framework-level auth guards and session exits are not missed when they live outside `src/`.
- Project audit now also warns when auth is declared but the source tree does not show obvious protected-route, middleware, session-check, or auth-redirect behavior.
- Project audit now also warns when source files reference auth/session state but do not show a loading or pending state on those same surfaces while session resolution happens.
- Project audit now also checks Decantr accessibility contract intent directly, including warning when `dna.accessibility.skip_nav=true` but the source tree does not expose a skip-link signal.
- Project audit now also warns when `dna.accessibility.skip_nav=true` but the source tree still lacks a concrete main landmark (`<main>` / `role="main"`) for skip-link targeting.
- Project audit now also warns when detected skip-link targets do not match any main landmark id, so a nominal skip-nav link cannot silently point at the wrong surface.
- Project audit now also checks Decantr accessibility style intent directly, including warning when `dna.accessibility.focus_visible=true` but the project CSS does not define a focus-visible treatment.
- Project audit now also checks Decantr motion accessibility intent directly, including warning when `dna.motion.reduce_motion=true` but the project CSS does not define a reduced-motion path.
- Runtime audit now also flags remote stylesheet links that ship without Subresource Integrity metadata, extending the built-output hardening pass beyond scripts alone.
- Source and file critique now also flag auth-like credentials written into client-managed cookies, not just localStorage/sessionStorage.
- Project audit now also warns when auth is declared but the source tree does not show an obvious sign-out or session-exit path.
- Project audit now also warns when auth gateway routes exist but the source tree never exposes a real sign-in, registration, or credential-entry surface.
- Source and file critique now also flag auth-like authorization headers being assembled in client-side code.
- Project audit now includes shared runtime evidence when `dist/` exists:
  - root document validation
  - document title validation
  - document `lang` and `viewport` metadata checks
  - built asset fetch checks
  - route-document coverage checks
- Runtime verification now also calls out auth route failures by role, so broken gateway login routes and broken primary app routes are surfaced explicitly instead of only as generic partial route coverage.
- Project audit now adds document-hardening and runtime-security heuristics:
  - charset declaration presence
  - inline script detection
  - external script integrity checks
  - CSP signal detection
  - built-JS dynamic code execution markers
  - built-JS HTML injection markers
- Project audit now also records built asset byte totals and warns on oversized JS/CSS/total bundle budgets.
- Project audit now warns when an auth-declared essence lacks a clear gateway section or anonymous entry route.
- File critique now flags higher-risk code patterns including:
  - `dangerouslySetInnerHTML`
  - raw DOM HTML injection
  - `eval` / `new Function`
- File critique now includes a first AST-backed static pass for supported TS/JSX input so inline-style and high-risk HTML/code-execution findings do not rely only on regex matching.
- File critique and source audit now also catch unlabeled icon-only links, not just icon-only buttons, so generated nav/icon surfaces are held to the same accessibility contract.
- File critique and source audit now also flag iframes without descriptive `title` attributes, so embedded dashboards/docs do not slip past the accessibility baseline.
- File critique and source audit now also flag external iframes without `sandbox`, so embeds are held to a safer default trust boundary.
- File critique and source audit now also flag forms posting to plain `http://` endpoints, so insecure transport regressions show up before runtime review.
- File critique and source audit now also flag plain `http://` / `ws://` client transport endpoints across fetch, axios, WebSocket, and EventSource usage, so insecure outbound requests are caught before hosted/runtime verification.
- File critique and source audit now also flag auth-like forms that default to GET semantics, so credential flows are forced onto explicit POST/server-action boundaries instead of URL-leaking defaults.
- Source audit now also flags auth-enabled apps that still expose no obvious entry surface at all, even when the blueprint forgot to declare gateway routes.
- File critique and source audit now also flag auth-like forms without any submit control, so credential surfaces are not accidentally left non-functional.
- File critique now also treats `autocomplete=\"off\"` on auth inputs as a credential-flow issue, not just missing autocomplete hints.
- File critique now also treats auth-like inputs with the wrong semantic type (`text` instead of `email`/`password`) as a credential-flow issue.
- Source audit and file critique now also flag localhost-style endpoints such as `localhost`, `127.0.0.1`, and `0.0.0.0`, so generated client code does not quietly ship development-only URLs into production.
- Runtime verification now also treats localhost-style development endpoints in built JavaScript as transport-risk signals, so development-only bundle markers are caught even when they survive minification or only appear post-build.
- Runtime verification now also flags plain `http://` / `ws://` transport markers that survive into built JavaScript bundles.
- Runtime verification now also flags root-document remote scripts and stylesheets loaded over plain `http://`, so insecure external asset transport is caught separately from missing integrity metadata.
- Runtime verification now also flags external iframes in built HTML that omit sandboxing or still load over plain `http://`, so embed trust boundaries and embed transport are carried through shortlist benchmarks, intelligence scoring, CLI summaries, registry UI copy, and public schemas alongside the existing source-level iframe review.
- Source audit now flags protected app-surface files that reference routes like `/dashboard` or `/settings` without co-located session or guard behavior, even when an auth helper exists elsewhere in the repo.
- Source audit now also flags auth/session flows that never expose an obvious failure state, so generated credential handling is pushed toward explicit rejected-sign-in and session-refresh error affordances.
- Source audit now also flags auth entry surfaces that never show an obvious post-auth transition into the protected app, so login or registration flows do not silently stop before a primary route like `/dashboard` or `/app`.
- File critique now also flags auth entry flows that never show an obvious transition into a protected route declared by the compiled review contract, so login-page reviews can catch missing post-auth navigation directly instead of only at project-audit time.
- File critique now also flags auth/session files that omit explicit loading and failure states, so reviewed login/session components surface missing pending/error handling directly instead of relying only on project-audit aggregation.
- Package graduation audits now report npm authentication health explicitly, so release readiness can distinguish repo-side blockers from "npm credentials are not currently usable" operational blockers.
- The standalone graduation plan now also reports npm authentication health, so package graduation can be reviewed from one operator-facing report instead of requiring a second release-surface audit to expose auth failures.
- The plain release-wave plan now also reports npm authentication health, so all three package-governance views (`release:plan`, `release:graduation-plan`, and `audit:release-surface`) expose the same operational blocker without requiring cross-checking separate reports.
- Auth exit assurance is stricter now too: if reviewed source files persist auth state in browser storage, client-managed cookies, or client-managed authorization headers, both project audit and file critique now expect those persistence surfaces to be explicitly cleared during sign-out instead of assuming redirects or generic sign-out helpers are sufficient.
- Auth redirect assurance is stricter now too: reviewed sign-in, recovery, registration, and logout flows are now flagged when they hard-redirect users to external URLs, so Decantr distinguishes internal reviewed route transitions from off-site auth handoffs that should instead go through explicit allowlists or provider configuration.
- External provider auth handoffs are stricter too: hardcoded OAuth/authorize URLs without a `state` parameter are now flagged in both project audit and file critique, so off-site auth entry can’t quietly bypass basic return-flow protection.
- Provider code flows are stricter too: hardcoded external `response_type=code` authorize URLs now get flagged when they omit PKCE, so client-initiated OAuth handoffs can’t quietly ship as bare authorization-code redirects.
- OIDC implicit and hybrid handoffs are stricter too: hardcoded external `id_token` authorize URLs now get flagged when they omit `nonce`, so provider-return integrity can’t quietly depend on a bare implicit-flow redirect.
- Callback cleanup is stricter too: auth callback code that reads codes or tokens from URL query/hash without scrubbing them back out of browser history is now flagged in both project audit and file critique.
- Callback failure handling is stricter now too: auth callback code that reads provider return data without an obvious failure state for `error` returns is now flagged in both project audit and file critique, so provider-denied callbacks do not silently assume the happy path.
- Callback state validation is stricter too: if reviewed callback code reads a returned provider `state`, Decantr now expects an obvious validation step against a stored or expected reviewed value before the auth exchange continues.
- Callback state teardown is stricter now too: if reviewed callback code validates stored `oauth_state` or similar CSRF state, Decantr now expects that reviewed state key to be cleared afterwards instead of lingering in browser storage or cookies.
- Callback failure routes are stricter now too: if reviewed callback handling exposes an error state and the contract declares a sign-in route, Decantr now expects an obvious way back into that sign-in surface instead of trapping users on an isolated callback error screen.
- Callback success paths are stricter too: code/state callback handlers now need to either enter a reviewed protected route or expose an explicit success/verification state instead of ending in an indeterminate “processing” surface.
- Callback completion is stricter too: if reviewed code exchanges provider callback codes into a session, Decantr now expects explicit rejection handling for that exchange instead of assuming provider-return success means callback completion cannot fail.
- Callback URL hygiene is broader too: Decantr now treats provider-return error params the same way it treats callback codes/tokens, so failure callbacks are expected to scrub stale query params out of browser history instead of leaving them behind.
- Callback recovery is stricter too: once callback code/session exchange failures are handled explicitly, Decantr now expects those failure paths to lead users back to the reviewed sign-in surface instead of leaving them stuck on a dead-end callback screen.
- Auth loading detection is a little smarter now too: callback-style pending copy such as “Signing you in…” is treated as a real loading state, which reduces false positives when reviewed auth flows are already surfacing legitimate pending UX.
- Recovery-flow assurance is deeper now too: project audit and file critique both flag password-reset/recovery surfaces that never show a visible success confirmation such as "check your email" or another reviewed completion state after the request succeeds.
- Registration-flow assurance now follows the same standard: registration surfaces are flagged when they neither transition into a reviewed protected destination nor show an explicit success/verification state, and the source-audit recovery-success check is now scoped to the recovery files themselves instead of any unrelated auth success signal elsewhere in the tree.
- The generic "missing post-auth redirect" rule is narrower now as well: it focuses on direct sign-in flows, so registration and recovery surfaces are judged by their own reviewed success-state contract instead of being over-flagged by a sign-in-specific redirect expectation.
- Source critique now also flags insecure remote image URLs in JSX/TSX (`http://...` image sources), closing a mixed-content blind spot that previously existed outside the built-runtime script/stylesheet checks.
- Mixed-content source hardening is broader now too: external iframe embeds over plain HTTP are flagged separately from sandbox issues, so embed trust and embed transport are both visible during critique instead of being conflated into one finding.
- Image semantics are wider now as well: the verifier treats framework-level `Image` components like real image surfaces for missing-`alt` and insecure-transport checks, so Next-style generated code no longer sidesteps those accessibility and mixed-content rules.
- File critique now also flags sign-in flows that omit an obvious path to a declared recovery route, so compiled auth contracts can enforce recovery completeness instead of leaving it implicit.
- File critique now also flags recovery flows that omit an obvious path back to a declared anonymous entry route, so compiled auth contracts can enforce recovery completeness in both directions.
- File critique now also flags sign-in and sign-up surfaces that omit obvious cross-links when the compiled auth contract declares both routes, so gateway entry flows no longer drift into isolated dead ends.
- Project audit now also flags declared auth-route gaps across the source tree, such as sign-in surfaces that never link into declared recovery/registration routes or gateway flows that never route back into declared sign-in.
- File critique now catches dialog accessibility gaps too, including missing dialog labels and missing modal hints on dialog-like surfaces.
- Auth verification now flags guard/session files that redirect unauthenticated users toward protected destinations like `/dashboard` instead of anonymous entry routes.
- File critique now also flags auth-like form inputs that omit `name` attributes, so visually correct login forms do not silently fail browser submission or FormData handling.
- Security critique now also flags credential inputs whose `autocomplete` values are semantically wrong for the field, closing another silent auth-form correctness gap beyond missing hints.
- Security critique now also treats string-based `setTimeout` / `setInterval` execution like other dynamic-eval patterns, so timer strings do not slip past the AST-backed runtime-trust checks.
- Security critique now also treats insecure client-side redirects like other transport hygiene failures, catching `location.href` / `location.assign` / `location.replace` paths that still point at plain `http://` destinations.
- Security critique now also flags imperative `window.open(..., "_blank")` usage that omits `noopener,noreferrer`, so generated action handlers do not silently preserve opener access across trust boundaries.
- Accessibility critique now catches table markup without headers or captions, so data-heavy generated UIs fail earlier when their structure is visually plausible but semantically incomplete.
- Accessibility critique now also catches multiple navigation landmarks without distinct labels, which is especially important for generated app shells with both sidebar and utility nav regions.
- Accessibility critique now also flags files that render multiple main landmarks, helping generated page and shell structures keep a single clear primary content region for assistive technologies.
- Package graduation now also audits publish metadata quality directly, including `license`, `homepage`, `repository.directory`, `files`, `publishConfig.access`, and normalized `bin` paths, so stable-readiness is enforced in code instead of left to npm auto-correction.
- Package release auditing now also runs real `npm publish --dry-run` style preflights for the `foundation` and `delivery` waves, so graduation review captures actual packaging/publish rehearsal output instead of stopping at metadata and dist-tag checks.

### Showcase / golden corpus

- Added showcase manifest validation and repeatable shortlist verification.
- Added shortlist verification reports and schema contracts.
- Moved shortlist verification onto the shared `@decantr/verifier` built-dist runtime audit path instead of keeping a showcase-only smoke helper.
- Deepened shortlist verification beyond root/asset smoke with:
  - HTML title checks
  - HTML `lang` and viewport checks
  - charset checks
  - inline script counts
  - external script integrity checks
  - CSP signal checks
  - route-document coverage checks
  - total / JS / CSS asset payload reporting
  - richer shortlist summary/report fields surfaced through shared contracts
- Registry homepage and blueprint detail surfaces expose showcase benchmark metadata.
- API, CLI, and MCP all expose showcase benchmark surfaces.
- Registry app now dogfoods public showcase metadata from the hosted API path.
- Current tracked shortlist baseline on 2026-04-09:
  - 8/8 builds passing
  - 8/8 smoke checks passing
  - 8/8 title / `lang` / viewport / charset checks passing
  - 8/8 with no inline script tags
  - 8/8 with no external scripts missing integrity
  - 8/8 with no insecure remote asset transport
  - 8/8 with sandboxed external iframes
  - 8/8 with no insecure external iframes
  - 0/8 with CSP signals present
  - average build duration `1908ms`
  - average smoke duration `12ms`
  - average assets `335362 B total`, `325759 B JS`, `9602 B CSS`

### Registry intelligence

- Added authored intelligence scoring on top of benchmark-backed blueprint intelligence.
- Added public ranking for recommended content.
- Added shared sort handling across API, registry, CLI, and MCP.
- Added recommended filtering across public registry surfaces.
- Added explicit intelligence provenance:
  - `authored`
  - `benchmark`
  - `hybrid`
- Added explicit intelligence confidence tiers so recommendation quality is visible and rankable:
  - `low`
  - `medium`
  - `high`
  - `verified`
- Added explainable intelligence metadata so API, CLI, and registry detail views can surface recommendation reasons and blockers instead of only raw scores.
- Intelligence scoring now rewards shortlist runtime hardening evidence:
  - document `lang` / viewport metadata
  - charset presence
  - script hygiene without inline scripts or missing integrity
  - optional CSP signal presence
  - healthy built asset budgets
  - not just build/smoke pass state
- Added a hosted schema-backed registry intelligence rollup endpoint:
  - `/v1/intelligence/summary`
- Added intelligence-source filtering across:
  - public API routes
  - registry portal browse surfaces
  - CLI search/list
  - MCP registry search
- Registry cards now label intelligence provenance directly.

### Content repo operational audits

- Added live registry drift audit in `decantr-content`.
- Added content-intelligence audit in `decantr-content`.
- Added provenance/source-filter audit coverage so live API rollout gaps are measurable.
- Added a hosted intelligence summary surface so rollout state can be checked without crawling the entire public corpus.
- Added dry-run reporting for official-content sync/prune behavior.

### Hosted rollout visibility

- Added a lightweight public API smoke audit script: `pnpm audit:public-api`
- Added a GitHub Actions workflow for scheduled/manual public API audit reporting.
- Added a human-readable public API reference page under `docs/reference/`.
- Added a manual Fly deploy workflow for the hosted API:
  - `.github/workflows/deploy-api-fly.yml`
- Added an explicit Vercel deploy workflow for the registry portal:
  - `.github/workflows/deploy-registry-vercel.yml`
- Added a hosted registry portal audit surface:
  - `pnpm audit:registry-portal`
  - `.github/workflows/registry-portal-audit.yml`
- Standardized the hosted API deploy contract around:
  - `apps/api/fly.toml`
  - the workspace-aware root `Dockerfile`
- Standardized the registry portal deploy contract around:
  - `apps/registry`
  - `apps/registry/.env.example`
  - `docs/runbooks/2026-04-09-registry-portal-deploy.md`
- Removed stale deploy-path drift:
  - retired the old root `fly.toml`
  - removed the obsolete `apps/api/Dockerfile`
  - removed the stray `apps/api/package-lock.json`
- Completed the hosted API rollout on 2026-04-09:
  - Fly now serves the reset-branch API successfully
  - `/v1/schema/*`, `/v1/showcase/*`, and `/v1/intelligence/summary` are publicly reachable
  - `pnpm audit:public-api` now passes against `https://api.decantr.ai/v1`
- Extended the hosted public API contract again after rollout with:
  - `POST /v1/packs/compile`
  - audit coverage for hosted execution-pack compilation
  - public docs/reference coverage for the hosted compiler surface
  - direct Fly redeploy from `codex/decantr-vnext-reset` completed successfully
  - `POST /v1/packs/compile` now returns `200` in live public audits
- Added a hosted file-critique surface on the reset branch:
  - `POST /v1/critique/file`
  - shared verifier-backed critique for inline source plus posted essence
  - CLI entrypoint via `decantr registry critique-file`
  - MCP hosted fallback when local review packs are missing
  - the root `pnpm audit:public-api` path now covers the hosted critique surface by default
- Added a hosted project-audit surface on the reset branch:
  - `POST /v1/audit/project`
  - remote project audit from posted essence plus optional dist and source snapshots
  - CLI entrypoint via `decantr registry audit-project`
  - MCP hosted fallback when local pack artifacts are missing, with optional `sources_path` support for richer hosted source verification
  - the root `pnpm audit:public-api` path now covers the hosted project-audit surface by default
- Completed the hosted verification rollout on 2026-04-09:
  - Fly redeploy from `codex/decantr-vnext-reset` completed successfully after syncing the workspace lockfile
  - `pnpm audit:public-api` now reports both hosted verification endpoints as `200`
  - live hosted verification now covers:
    - `POST /v1/critique/file`
    - `POST /v1/audit/project`
- Completed the official content rollout on 2026-04-09:
  - content workflow run `24192386163` synced `codex/decantr-vnext-resetmai` into the live registry
  - live `@official` content count is now `480`
  - stale live extras were pruned
  - live registry drift now reports zero missing, extra, or changed items

### Registry portal dogfooding

- The registry portal now validates as a schema-correct Decantr v3.1 project instead of carrying a stale essence shape.
- `apps/registry` now has compiled pack artifacts checked into `.decantr/context`, including:
  - scaffold pack
  - section packs
  - page packs
  - mutation packs
  - review pack
  - pack manifest
- Added a CI-visible dogfood audit command:
  - `pnpm audit:registry-dogfood`
- Wired that audit into the main CI workflow.
- Reduced verifier findings on the public homepage and detail page by:
  - removing inline style literals
  - removing hardcoded color literals
  - adding real landmark ARIA metadata
  - adding explicit focus-visible signals
  - adding responsive CSS-module breakpoints
- Made the registry portal `build` path clean-checkout safe by rebuilding `@decantr/registry` before Next.js typechecking, matching the existing lint discipline.

### Package surface governance

- Added `config/package-surface.json` as the package support and dist-tag source of truth.
- Added `config/package-retirements.json` plus a retirement/deprecation script for removed npm lines such as `@decantr/ui`.
- Added `pnpm audit:package-surface` and wired it into CI.
- Added executable release-readiness metadata and `pnpm audit:release-readiness` so beta-to-stable graduation stops living only in docs.
- Added `pnpm release:plan` plus `scripts/release-plan.mjs` so package publish intent, beta blockers, and retired replacements can be generated as Markdown or JSON from the manifest source of truth.
- Added `pnpm audit:release-surface` plus `scripts/audit-release-surface.mjs` so package support config, release readiness, release plan, and live npm drift can be reported together in one JSON/Markdown artifact.
- Improved npm surface tooling so dist-tag audits and normalization now distinguish between packages that merely need missing `beta` tags and packages whose `latest` retag is blocked because no stable published version exists yet.
- Added a dedicated npm surface normalization workflow so safe dist-tag repairs can run through GitHub Actions without relying on local npm auth state.
- Added a real package artifact preflight path via `--publish-dry-run` and `pnpm release:preflight`, so selected packages now run through `npm publish --dry-run` when unpublished and `npm pack --dry-run` when the version is already on npm instead of relying only on manifest selection rehearsal.
- Replaced the hardcoded publish loop with a manifest-backed publish script.
- Added explicit release-wave and publish-order metadata so package planning, dry-runs, and publishes can execute in a stable foundation-to-delivery order instead of hand-curated lists.
- Added wave-aware release-plan and publish filtering so npm rehearsals can target a specific package wave instead of hand-picked package name lists.
- Updated the GitHub npm publish workflow so manual runs can select a release wave, emit the computed release plan into the Actions summary, and rehearse with `dry_run_only=true`.
- Added a dedicated package release audit workflow so GitHub Actions now publishes report-only package-governance artifacts without requiring npm publish credentials.
- Added package-level README coverage for all active public packages.
- Added a generated package support matrix and release-strategy runbook for the npm surface, with `pnpm audit:package-surface` now enforcing that the matrix stays in sync with the manifest source of truth.
- The generated package support matrix now also includes an operator-facing graduation snapshot with stable-now, ready-next, beta-blocked, and experimental-hold lanes, so release planning is visible directly from manifest-backed docs instead of only from audit artifacts.
- Package-surface validation now also enforces semver intent directly, so stable packages cannot silently keep prerelease versions and beta packages must keep prerelease semver until they intentionally graduate.
- Graduation and release-plan output now also surface each package's current version and stable target version, making beta-to-latest planning more operational than a pure status label.
- Cleared the remaining workspace dependency advisories by upgrading `hono`, `@hono/node-server`, and `@modelcontextprotocol/sdk`, then pinning patched `vite` and `path-to-regexp` resolutions through root `pnpm` overrides so `pnpm audit` now returns zero vulnerabilities.

## Verification Baseline

The reset branch has repeatedly been verified with:

- `pnpm test`
- `pnpm build`
- `pnpm lint`
- `pnpm audit`
- `pnpm audit:registry-dogfood`
- `pnpm showcase:validate`
- `pnpm showcase:verify:shortlist`
- `node validate.js` in `decantr-content`
- `node scripts/audit-content-intelligence.js` in `decantr-content`
- `node scripts/audit-registry-drift.js` in `decantr-content`

## Current Live State

Observed from live audits against `https://api.decantr.ai/v1` on 2026-04-09:

- hosted public API smoke audit is green
- hosted intelligence summary is green
- live `@official` content count matches repo count
- live registry drift is clean after the official-content sync
- showcase shortlist verification is publicly reachable
- hosted execution-pack compilation is publicly reachable
- `POST /v1/packs/compile` returns `200`
- `POST /v1/critique/file` returns `200`
- `POST /v1/audit/project` returns `200`

The hosted API path is explicit and exercised in production. The registry portal deploy path is
now explicit in-repo as well through the Vercel workflow, portal audit, and runbook surfaces.

The local dependency graph is also green again on 2026-04-09:

- `pnpm audit` reports `0` vulnerabilities
- `hono` is resolved at `4.12.12`
- `@hono/node-server` is resolved at `1.19.13`
- `@modelcontextprotocol/sdk` is resolved at `1.29.0`
- `vite` is resolved at `6.4.2`
- `path-to-regexp` is resolved at `8.4.0`

The verifier layer has also moved beyond heuristic-only critique in this branch:

- AST-backed security checks now detect `dangerouslySetInnerHTML`, raw DOM HTML injection, and dynamic eval patterns.
- AST-backed accessibility checks now detect unlabeled icon-only buttons, clickable non-semantic controls, images without `alt`, and unlabeled form controls.
- AST-backed route/security checks now catch external `_blank` links missing `rel="noopener noreferrer"`, placeholder navigation targets such as `href="#"` or `javascript:void(0)`, and auth-related inputs missing explicit `autocomplete` hints.
- Auth-input hardening now also treats OTP and verification-code fields as first-class auth surfaces, so generated one-time-code flows are reviewed for `autocomplete="one-time-code"` instead of slipping past the password/email-focused checks.
- Framework navigation wrappers now inherit the same safety/accessibility scrutiny as raw anchors, so `Link` and `NavLink` surfaces are reviewed for unlabeled icon links and `_blank` external targets missing `rel="noopener noreferrer"`.
- Remote image-transport checks now cover responsive media sources too, so insecure `srcSet` and `<source>` entries inside `picture` flows are caught alongside plain `img src` and framework `Image` props.
- Open-redirect review is tighter too: Decantr now flags `href`/`to`/location assignments and route-transition helpers that pull destinations directly from `searchParams.get("next")`-style values, not just obvious inline `redirect(...)` calls.
- Runtime smoke verification now catches insecure remote image and media sources in built HTML too, and that signal flows through shortlist verification, content-intelligence scoring, CLI summaries, registry detail pages, and the public verifier schemas.
- Project audit now also flags suspicious auth topology, including gateway sections that expose protected-looking routes, gateway sections that are not auth-like, primary sections that only expose auth-like destinations, and primary sections that do not include a clear post-auth application route.
- Project audit now also warns when gateway and primary sections overlap on the same route, making the anonymous-to-authenticated boundary ambiguous.
- Runtime verification now reports partial route drift when only some compiled route hints or route documents survive the built output, instead of only surfacing catastrophic misses.
- Runtime verification and shortlist reports now also track strict full-route-coverage booleans for both compiled route hints and audited route documents, so the golden corpus can distinguish “some route coverage” from “the entire declared route contract survived.”
- Runtime verification and shortlist reports now also track route-document hardening coverage separately from route existence, so Decantr can distinguish “the route rendered” from “the route preserved a hardened document shell.”
- Runtime verification now also flags secret-like client-bundle leakage, including service-role key markers, live secret key patterns, and private-key material that survive into built JavaScript.
- Runtime verification now also flags inline DOM event-handler attributes that survive into built HTML, so golden verification and hosted audits catch `onclick`/`onload`-style leakage alongside inline scripts and remote asset hardening issues.
- File critique and source audit now also flag hardcoded secret literals plus client-exposed secret env references, so privileged keys can be caught before they ever reach a compiled bundle.
- File critique and source audit now also flag `postMessage(..., "*")` wildcard target origins, so cross-window messaging contracts have to name an explicit reviewed origin instead of broadcasting blindly.
- File critique and source audit now also flag inbound `message` handlers that never validate `event.origin`, so Decantr reviews both sides of the browser cross-window trust boundary instead of only outbound `postMessage` calls.
- Critique now also flags buttons inside forms that omit `type`, helping catch accidental-submit behavior before generated UI reaches review.
- Critique now flags auth-like writes into `localStorage` and `sessionStorage`, helping catch insecure client-side token/session persistence earlier in review.
- Critique now also flags auth cookie issuance that omits explicit `httpOnly`, `secure`, or `sameSite` options across both `cookies.set(...)` and `Set-Cookie` header issuance, so server-managed session flows are held to a hardened baseline instead of relying on ambient framework defaults.
- Project audit and file critique now also flag auth exit flows that never return users to an anonymous route after logout, so protected shells do not quietly linger after session teardown.
- Project audit and file critique now also distinguish redirect-only logout from a real sign-out boundary, so auth exit flows have to actually invalidate session state instead of merely bouncing users back to `/login`.
- Hosted showcase summaries, CLI output, registry portal messaging, and benchmark-backed intelligence scoring now all surface that stricter full-route-coverage signal instead of treating partial route survival as fully verified.
- Showcase manifest, shortlist, and shortlist-report surfaces are now kept in sync with the runtime security contract, so new smoke fields cannot silently land in verifier output while API and registry serializers keep emitting stale payloads.
- Registry app lint now rebuilds `@decantr/registry` before typechecking so clean-checkout verification does not depend on stale generated package artifacts.
- Package graduation now has its own executable planning surface via `pnpm release:graduation-plan`, which classifies each public package as stable, ready, contract-blocked, npm-blocked, experimental, or retired.
- The package governance GitHub Actions audit now publishes the graduation plan alongside the broader release-surface audit, so stable-vs-beta decisions are visible in CI artifacts instead of only from local scripts.
- The package governance workflow now also captures the raw live npm-surface audit log, so stray dist-tags, missing `beta` tags, and unpublished packages stay visible in CI even while graduation remains report-first.
- The package governance workflow now also captures the npm dist-tag normalization dry-run preview, so CI artifacts show both the live npm drift and the safe executable repair plan in one place.
- The verifier now flags auth and route-transition flows that trust raw `next`/`returnTo`-style redirect params, so open-redirect risk shows up in both project audit and file critique before shipping.
- That open-redirect coverage now also catches raw `new URLSearchParams(window.location.search).get('next')`-style flows in both direct redirects and JSX route props, so auth handoff code cannot evade review by parsing the query string inline before navigating.
- The auth open-redirect detector now also follows simple local aliases of those raw query-param reads, so `const next = new URLSearchParams(window.location.search).get('next')` still gets flagged when later consumed by redirects or JSX route props.
- The auth open-redirect detector now also covers browser-native handoffs like `window.location.assign(...)` and `window.location.href = next`, including aliased `next` values sourced from raw query-param reads, so app code cannot bypass review just by swapping router redirects for direct location navigation.
- That auth open-redirect tracing now also follows aliased query containers like `const params = new URLSearchParams(window.location.search)` and `const url = new URL(window.location.href)`, so later `params.get('next')` or `url.searchParams.get('next')` handoffs still get caught when they feed redirects or direct location navigation.
- Runtime verification now also distinguishes remote assets that declare integrity but omit `crossorigin`, and that signal flows through shortlist benchmarks, intelligence scoring, CLI summaries, registry UI copy, and public schemas.
- Runtime verification now also flags external new-tab links in built HTML that omit `rel="noopener noreferrer"`, and that signal now flows through shortlist benchmarks, intelligence scoring, CLI summaries, registry UI copy, and public schemas alongside the existing source-level link review.
- MCP scaffold/section/page context tools now reuse hosted selected packs as readable fallback context, so missing local `.decantr/context` markdown no longer forces consumers to reconstruct human-readable context from JSON alone.
- Release operations now have a command-level handoff too: `pnpm release:commands` prints exact preflight and publish commands for the selected package wave, so npm publishing can move from “audit says it’s ready” to “run these commands” without manual translation.
- `pnpm release:commands` now also prints exact npm dist-tag repair commands for the selected package wave, so the same handoff covers both publish execution and the live npm cleanup still blocking package graduation.
- The release planning and publish scripts now also accept both `--wave foundation` and `--wave=foundation` style flags, so the operator commands in the runbooks work exactly as documented.
- Project audit and file critique now also flag logout flows that leave client-side query or data caches alive, so reviewed auth exits are expected to reset React Query/Apollo/SWR-style caches before returning users to an anonymous route.
- Project audit and file critique now also flag logout flows that leave background auth refresh timers or subscriptions alive, so session refresh work is expected to stop alongside sign-out instead of continuing after users return to anonymous routes.
- Project audit and file critique now also flag logout flows that leave realtime sockets or channels alive, so protected live data streams are expected to close during sign-out instead of continuing after users return to anonymous routes.
- Project audit and file critique now also flag logout flows that leave cross-tab auth coordination channels or storage listeners alive, so BroadcastChannel and storage-based session sync work is expected to stop alongside sign-out instead of lingering after users return to anonymous routes.
- Project audit and file critique now also flag protected session-aware surfaces that never branch on unauthenticated state, so reviewed dashboard shells cannot quietly keep rendering after session loss just because they only handled the loading path.
- Project audit and file critique now also flag protected session-aware surfaces that handle auth loss by returning nothing instead of routing users back to an anonymous entry point, so reviewed dashboard shells cannot quietly go blank after session loss without re-establishing the gateway boundary.
- Project audit and file critique now also flag protected session-aware surfaces that use the loading branch to render the protected shell itself, so reviewed dashboard shells cannot flash or hydrate privileged UI before session resolution completes.
- Project audit and file critique now also flag auth/session loading branches that return `null` or an empty fragment instead of an explicit pending boundary, so reviewed auth-aware shells cannot hide loading races behind a blank frame.
- Project audit and file critique now also flag auth/session loading branches that redirect straight to anonymous routes before session resolution finishes, so reviewed gateway logic cannot bounce real users to `/login` while a valid session is still loading.
- Project audit and file critique now also flag unauthenticated branches that still render dashboard/app shells, so reviewed protected surfaces cannot acknowledge auth loss and then keep rendering privileged structure anyway.
- Protected-shell detection for auth-loss branches now also catches protected-looking shell component names even when they omit explicit `path="/dashboard"`-style route props, so dashboard/workspace/admin shells do not evade review just by relying on component identity alone.
- Protected auth-loss render detection now also catches protected-looking child component names such as dashboard/workspace/admin summaries or panels even when they are not literally `*Shell` surfaces, so privileged child renders cannot slip through the unauthenticated branch under softer component naming.
- Protected auth-loss and auth-loading detection now also treats `children`, `props.children`, `Outlet`, `Routes`, and `RouterProvider` pass-through branches as protected renders, so reviewed gates cannot leak nested protected content just by returning the outlet tree directly.
- Protected auth-loss and auth-loading detection now also catches generic component renders that still receive auth-scoped props like `session`, `currentUser`, or `authUser`, so stale privileged state cannot hide behind neutral component names like `SummaryPanel`.
- Protected auth-loss and auth-loading detection now also catches direct JSX interpolation of auth-scoped values like `session?.user?.email`, so stale privileged identity data cannot linger inside otherwise generic markup after reviewed gateway logic has supposedly left the protected state.
- Protected auth-loss and auth-loading detection now also catches protected route links nested inside otherwise generic markup, so reviewed gateway branches cannot keep advertising `/dashboard` or other privileged destinations from a neutral `<section>` container.
- Protected auth-loss and auth-loading detection now also catches protected route actions hidden behind nested buttons or callback handlers, so reviewed gateway branches cannot keep a stale “continue to dashboard” button alive just by replacing a link with `navigate('/dashboard')`.
- Protected auth-loss and auth-loading detection now also catches nested form submissions into protected routes like `action="/dashboard"`, so reviewed gateway branches cannot preserve privileged navigation by swapping a link or button callback for a form post.
- Protected auth-loss and auth-loading detection now also catches browser redirects like `window.location.assign('/dashboard')` inside nested callbacks, so reviewed gateway branches cannot preserve privileged navigation by bypassing router helpers entirely.
- Protected auth-loss and auth-loading detection now also catches hidden redirect payloads like `<input type="hidden" value="/dashboard" />` inside nested markup, so reviewed gateway branches cannot stash privileged destinations in invisible form state after auth loss.
- Protected auth-loss and auth-loading detection now also catches `data-redirect` / `data-next` style metadata carrying reviewed protected routes, so reviewed gateway branches cannot preserve privileged destinations by hiding them in seemingly neutral markup attributes.
- Protected auth-loss and auth-loading detection now also catches neutral component props like `redirectTo="/dashboard"` or `returnTo="/dashboard"`, so reviewed gateway branches cannot smuggle privileged destinations through helper components after auth loss.
- Protected auth-loss and auth-loading detection now also catches nested object props like `state={{ redirectTo: '/dashboard' }}` or `options={{ returnTo: '/dashboard' }}`, so reviewed gateway branches cannot preserve privileged destinations inside seemingly generic helper payloads.
- Protected auth-loss and auth-loading detection now also catches generic config payloads like `config={{ to: '/dashboard' }}` or `config={{ path: '/dashboard' }}`, so reviewed gateway branches cannot hide privileged route intent inside neutral helper objects after auth loss.
- Protected auth-loss and auth-loading detection now also catches serialized route payloads like `payload={JSON.stringify({ redirectTo: '/dashboard' })}`, so reviewed gateway branches cannot preserve privileged destinations by wrapping them in stringified helper configs after auth loss.
- Protected auth-loss and auth-loading detection now also catches querystring-encoded helper payloads like `payload={new URLSearchParams({ next: '/dashboard' }).toString()}`, so reviewed gateway branches cannot preserve privileged destinations by hiding them inside encoded helper state after auth loss.
- Protected auth-loss and auth-loading detection now also catches router-helper payloads like `payload={createSearchParams({ next: '/dashboard' }).toString()}`, so reviewed gateway branches cannot preserve privileged destinations by relying on framework query helpers instead of native `URLSearchParams`.
- Protected auth-loss and auth-loading detection now also catches JSX expression-wrapped route props like `to={'/dashboard'}` or ``redirectTo={`/dashboard`}``, so reviewed gateway branches cannot evade route leakage checks just by wrapping privileged destinations in JSX expressions instead of plain string props.
- Protected auth-loss and auth-loading detection now also catches route-object props like `to={{ pathname: '/dashboard' }}` or `redirect={{ pathname: '/dashboard' }}`, so reviewed gateway branches cannot preserve privileged destinations by hiding them inside router descriptor objects after auth loss.
- Protected auth-loss and auth-loading detection now also catches callback navigation objects like `navigate({ pathname: '/dashboard' })` inside returned UI, so reviewed gateway branches cannot preserve privileged navigation by swapping string route callbacks for router descriptor objects after auth loss.
- Protected auth-loss and auth-loading detection now also catches helper-generated destinations like `generatePath('/dashboard')` and `createPath({ pathname: '/dashboard' })`, so reviewed gateway branches cannot preserve privileged navigation by synthesizing protected routes through router helper APIs after auth loss.
- Protected auth-loss and auth-loading detection now also catches helper-generated `pathname` route objects like `to={{ pathname: generatePath('/dashboard') }}` and `navigate({ pathname: createPath({ pathname: '/dashboard' }) })`, so guarded branches cannot smuggle protected destinations through route-object wrappers after auth loss.
- Protected auth-loss and auth-loading detection now also catches array-carried route payloads like `items={[{ to: '/dashboard' }]}` and `links={[{ href: '/dashboard' }]}`, so reviewed gateway branches cannot preserve privileged destinations by tucking them into nav/config collections after auth loss.
- Protected auth-loss and auth-loading detection now also catches helper-generated destinations inside nav/config arrays like `items={[{ to: generatePath('/dashboard') }]}` and `links={[{ pathname: createPath({ pathname: '/dashboard' }) }]}`, so reviewed gateway branches cannot preserve privileged destinations by combining array-carried configs with router helper APIs after auth loss.
- Protected auth-loss and auth-loading detection now also catches helper-style redirect props inside nav/config arrays like `items={[{ redirectTo: '/dashboard' }]}` and `links={[{ returnTo: generatePath('/dashboard') }]}`, so reviewed gateway branches cannot preserve privileged destinations by swapping route keys for helper-prop keys inside array-carried configs after auth loss.
- Protected auth-loss and auth-loading detection now also catches nested state/options payloads inside nav/config arrays like `items={[{ state: { redirectTo: '/dashboard' } }]}` and `links={[{ options: { returnTo: '/dashboard' } }]}`, so reviewed gateway branches cannot preserve privileged destinations by nesting redirect payloads one object deeper inside array-carried configs after auth loss.
- Protected auth-loss and auth-loading detection now also catches serialized or query-encoded payloads inside nav/config arrays like `items={[{ payload: JSON.stringify({ redirectTo: '/dashboard' }) }]}` and `links={[{ payload: createSearchParams({ path: '/dashboard' }).toString() }]}`, so reviewed gateway branches cannot preserve privileged destinations by hiding them inside encoded array item payloads after auth loss.
- Protected auth-loss and auth-loading detection now also catches stale auth-scoped data hidden inside nav/config arrays like `items={[{ label: session?.user?.email, href: '/login' }]}` and `links={[{ label: currentUser?.email, href: '/login' }]}`, so reviewed gateway branches cannot leak privileged identity data through config-driven UI after auth loss.
- Protected auth-loss and auth-loading detection now also catches stale auth-scoped data buried inside nested array metadata like `items={[{ meta: { label: session?.user?.email }, href: '/login' }]}` and `links={[{ details: { subtitle: currentUser?.email }, href: '/login' }]}`, so config-driven gateway surfaces cannot leak privileged identity data by nesting it inside secondary array objects after auth loss.
- Protected auth-loss and auth-loading detection now also catches stale auth-scoped data encoded into array payloads like `items={[{ payload: JSON.stringify({ label: session?.user?.email }), href: '/login' }]}` and `links={[{ payload: createSearchParams({ email: currentUser?.email }).toString(), href: '/login' }]}`, so config-driven gateway surfaces cannot leak privileged identity data by serializing it into payload helpers after auth loss.
- Protected auth-loss and auth-loading detection now also catches stale auth-scoped data encoded into direct helper props like `payload={JSON.stringify({ label: session?.user?.email })}` and `payload={createSearchParams({ email: currentUser?.email }).toString()}`, so neutral status surfaces cannot leak privileged identity data by serializing it into non-array payload helpers after auth loss.
- Protected auth-loss and auth-loading detection now also treats raw `new URLSearchParams(...)` and `createSearchParams(...)` helper objects as risky too, so reviewed surfaces cannot preserve `/dashboard` routes or stale identity data by passing `payload={new URLSearchParams({ next: '/dashboard' })}`, `payload={new URLSearchParams({ path: '/dashboard' })}`, `payload={new URLSearchParams({ email: session?.user?.email })}`, `links={[{ payload: new URLSearchParams({ next: '/dashboard' }) }]}`, `links={[{ payload: new URLSearchParams({ path: '/dashboard' }) }]}`, `links={[{ payload: new URLSearchParams({ email: currentUser?.email }) }]}`, `payload={createSearchParams({ next: '/dashboard' })}`, `payload={createSearchParams({ path: '/dashboard' })}`, `links={[{ payload: createSearchParams({ next: '/dashboard' }) }]}`, `links={[{ payload: createSearchParams({ path: '/dashboard' }) }]}`, or `links={[{ payload: createSearchParams({ email: currentUser?.email }) }]}` without an immediate `.toString()`.
- Auth open-redirect tracing now also follows destructured and aliased query carriers like `const { searchParams: params } = new URL(window.location.href)`, aliased query keys like `const queryKey = 'next'`, and destructured query payloads like `const { next: redirectTo } = router.query`, so later `params.get(queryKey)` or `redirect(redirectTo ?? '/dashboard')` handoffs still get caught in both project audit and file critique.
- Auth open-redirect tracing now also follows destructured `query` carriers like `const { query: params } = router` and bracket-access reads like `query[queryKey]`, so auth flows cannot evade redirect-param detection just by swapping dot access for destructuring or indexed query lookups before calling `redirect(...)` or similar route transitions.
- Auth open-redirect tracing now also recurses into object-shaped route descriptors like `navigate({ pathname: next ?? '/dashboard' })` and `<Link to={{ pathname: next ?? '/dashboard' }}>`, so aliased redirect params cannot slip past the verifier just by being wrapped inside router object payloads before the transition call or JSX route prop.
- Auth open-redirect tracing now also follows server handler URL parsing like `new URL(request.url).searchParams.get('next')` and `new URL(req.url).searchParams.get('next')`, so route handlers and server auth callbacks cannot bypass redirect-param detection by pulling the same untrusted destination out of the incoming request URL instead of browser location state.
- Auth open-redirect tracing now also treats plain `searchParams` object props as redirect carriers, so server-rendered login routes like `redirect(searchParams.next ?? '/dashboard')` and aliased/indexed variants like `const { searchParams: params } = props; params[queryKey]` get caught too instead of only the `searchParams.get('next')` family.
- Auth open-redirect tracing now also follows parameter-destructured and nested `searchParams` props like `function LoginRedirect({ searchParams: params }) { ... }` and `function LoginRedirect({ searchParams: { next } }) { ... }`, so auth entry routes cannot hide unreviewed `next` handoffs behind destructured function signatures instead of local aliases.
- Auth open-redirect tracing now also recurses into template-wrapped route handoffs like ``redirect(`${next ?? '/dashboard'}`)`` and `<Link to={`${next ?? '/dashboard'}`}>`, so aliased redirect params cannot bypass the verifier just by being interpolated into template strings before the transition sink.
- Auth open-redirect tracing now also treats common snake/kebab redirect keys like `return_to`, `redirect_to`, and `callback_url` as first-class redirect carriers, so auth flows cannot evade review simply by switching from camel-case query names like `returnTo` to more backend-shaped parameter names before redirecting into `/dashboard`.
- Auth open-redirect tracing now also follows `req.nextUrl.searchParams.get(...)` in addition to `request.nextUrl.searchParams.get(...)` and `new URL(req.url).searchParams.get(...)`, so server auth handlers cannot bypass redirect-param detection just by renaming the request object while still trusting the same incoming Next.js query state.
- Auth open-redirect tracing now also follows aliased `req.nextUrl.searchParams` containers like `const params = req.nextUrl.searchParams; params.get(queryKey)`, so server auth handlers cannot evade review by lifting Next.js query state into a local alias before consuming `next` in a redirect sink.
- Auth open-redirect tracing now also follows aliased and destructured `req.nextUrl` bases like `const nextUrl = req.nextUrl` and `const { nextUrl } = req`, so server auth handlers cannot bypass redirect-param detection by hoisting the Next.js URL object first and only reading `nextUrl.searchParams` later.
- Auth open-redirect tracing now also recurses through URL-constructor wrappers like `NextResponse.redirect(new URL(next ?? '/dashboard', req.url))`, so server handlers cannot hide the same raw `next` redirect source just by normalizing it through `new URL(...)` before returning the response.
- Auth open-redirect tracing now also follows aliased URL-constructor bases like `const requestUrl = req.url; new URL(next ?? '/dashboard', requestUrl)`, so server handlers cannot bypass redirect-param detection by hoisting the request URL into a local variable before wrapping the destination.
- Auth open-redirect tracing now also follows destructured browser location carriers like `const { search } = window.location; new URLSearchParams(search).get('next')` and `const { href } = window.location; new URL(href).searchParams.get('next')`, so client auth routes cannot bypass redirect-param detection by pulling `search` or `href` off `window.location` before reading and forwarding the same untrusted destination.
- Auth open-redirect tracing now also treats `globalThis.location` and destructured global location bases like `const { location } = globalThis` as first-class carriers, so browser auth flows cannot bypass redirect-param detection by swapping from `window.location` to the generic global location surface before reading `next` and redirecting into `/dashboard`.
- Auth open-redirect tracing now also follows aliased location objects like `const browserLocation = window.location` or `const browserLocation = globalThis.location`, so browser auth flows cannot evade detection by hoisting the location object first and only then reading `browserLocation.search`, `browserLocation.href`, `browserLocation.assign(...)`, or `browserLocation.href = next ?? '/dashboard'`.
- Auth open-redirect tracing now also treats `document.location` and aliased document location objects as first-class carriers, so browser auth flows cannot bypass redirect-param detection by switching to the older DOM location surface before reading `next` and handing it to `document.location.assign(...)` or `browserLocation.href = next ?? '/dashboard'`.
- Auth open-redirect tracing now also treats frame/window variants like `self.location`, `parent.location`, and `top.location` as first-class carriers, so embedded auth flows cannot bypass redirect-param detection by reading `next` from a frame-level location object and handing it to `self.location.assign(...)` or `frameLocation.href = next ?? '/dashboard'`.
- Auth open-redirect tracing now also follows bracketed location access like `self['location']['search']`, `self['location']['assign'](...)`, `parent['location']`, and `frameLocation['href'] = next ?? '/dashboard'`, so auth flows cannot bypass redirect-param detection just by swapping dot access for element-access syntax on browser location carriers and sinks.
- Auth open-redirect tracing now also follows bracketed query getter calls like `req['nextUrl']['searchParams']['get']('next')` and `searchParams['get']('next')`, so auth flows cannot bypass redirect-param detection by swapping `params.get(...)` for element-access calls on the same reviewed query carrier.
- Auth open-redirect tracing now also follows bracketed location access through aliased browser/frame bases like `const browser = window; browser['location']['assign'](...)`, so auth flows cannot bypass redirect-param detection by hoisting `window`, `self`, or `parent` into a local alias before reading `['location']` and forwarding the same untrusted destination.
- Auth open-redirect tracing now also treats bracketed route-transition sinks like `router['push'](...)` and `router['replace'](...)` the same as dot-access router calls, so auth flows cannot bypass redirect-param detection just by swapping `router.push(next)` for element-access syntax before navigating into a privileged destination.
- Auth open-redirect tracing now also treats History API transitions like `history.pushState(...)`, `history.replaceState(...)`, and aliased `window.history` calls as reviewed route-transition sinks, so auth flows cannot bypass redirect-param detection just by mutating the browser URL through the History API instead of router helpers or redirect functions.
- Auth open-redirect tracing now also treats `useSearchParams()` hook results, including tuple-destructured forms like `const [params] = useSearchParams()`, as reviewed query carriers, so auth flows cannot bypass redirect-param detection by pulling `next` from framework hook state instead of props, router query objects, or raw request/browser URL helpers.
- Auth open-redirect tracing now also treats `useRouter()` hook results as reviewed query-container bases, including renamed forms like `const appRouter = useRouter()` and destructured aliases like `const { query: params } = useRouter()`, so auth flows cannot bypass redirect-param detection just by hiding `query.next` behind framework hook output instead of a prop literally named `router`.
- Auth open-redirect tracing now also follows redirect params through common transformations like `decodeURIComponent(searchParams.get('next'))`, chained helper access, and repeated-query reads like `searchParams.getAll('next')[0]`, so auth flows cannot bypass redirect-param detection just by wrapping or indexing the same unreviewed destination before handing it to a redirect sink.
- Auth open-redirect tracing now also treats `useLocation()` hook results as reviewed location carriers, including aliased forms like `const routeLocation = useLocation()` and destructured forms like `const { search } = useLocation()`, so router-driven auth entry routes cannot bypass redirect-param detection by reading `next` from hook-managed route state instead of raw `window.location`.
- Auth open-redirect tracing now also follows cloned Next.js request URLs like `req.nextUrl.clone()`, including aliased `searchParams` reads off the cloned object, so middleware and route handlers cannot bypass redirect-param detection just by copying the incoming request URL before consuming `next`.
- Auth open-redirect tracing now also treats Next.js `nextUrl.search` and `nextUrl.href` as reviewed URL carriers, so middleware and route handlers cannot bypass redirect-param detection by reparsing the same incoming request URL through `new URLSearchParams(req.nextUrl.search)` or `new URL(nextUrl.href)` before redirecting.
- Auth open-redirect tracing now also treats stringified reviewed URL carriers like `req.nextUrl.toString()` and `String(nextUrl)` as equivalent URL inputs, so middleware and route handlers cannot bypass redirect-param detection by stringifying a trusted request URL object and then reparsing it through `new URL(...)` before consuming `next`.
- Auth open-redirect tracing now also treats `Object.fromEntries(searchParams)` as a reviewed query carrier, including destructured forms like `const { next } = Object.fromEntries(...)`, so auth flows cannot bypass redirect-param detection by converting reviewed search params into a plain object and then reading `query.next` before redirecting.
- Auth open-redirect tracing now also follows aliased `searchParams.entries()` iterators passed into `Object.fromEntries(...)`, so auth flows cannot bypass redirect-param detection by lifting the reviewed entries iterator into a local `entries` variable before materializing `query.next`.
- Auth open-redirect tracing now also follows `Array.from(...)` and spread-array wrappers around reviewed search-param iterables like `Object.fromEntries(Array.from(searchParams.entries()))` and `Object.fromEntries([...searchParams])`, so auth flows cannot bypass redirect-param detection by materializing reviewed query pairs into intermediate arrays before reading `query.next`.
- Auth open-redirect tracing now also follows optional-chain access across both reviewed carriers and navigation sinks like `searchParams?.get('next')`, `query?.next`, `router?.push(next)`, and `window.location?.assign(next)`, so auth flows cannot bypass redirect-param detection just by inserting `?.` between the same reviewed redirect source and the eventual sink.
- Auth open-redirect tracing now also follows bound and wrapper-based reviewed query readers like `const readRedirect = searchParams.get.bind(searchParams)` and `get.call(searchParams, 'next')`, so auth flows cannot bypass redirect-param detection just by hoisting `searchParams.get` into a helper before the eventual redirect sink.
- Auth open-redirect tracing now also follows simple local helper wrappers like `const readRedirect = (key) => searchParams.get(key)` and `function readRedirect(searchParams, key) { return searchParams.get(key); }`, so auth flows cannot bypass redirect-param detection just by hiding the same reviewed query read behind a tiny local helper before redirecting.
- Auth open-redirect tracing now also follows object-shaped local helpers like `helpers.readRedirect('next')` and destructured aliases like `const { readRedirect } = helpers`, so auth flows cannot bypass redirect-param detection by stashing the same reviewed query read behind a small object method before redirecting.
- Auth open-redirect tracing now also follows nested helper objects like `helpers.redirect.readRedirect('next')` and destructured helper-object aliases like `const { redirect: redirectHelpers } = helpers`, so auth flows cannot bypass redirect-param detection by hiding the same reviewed query read one object layer deeper before redirecting.
- Auth open-redirect tracing now also follows helper factories like `const helpers = createRedirectHelpers(searchParams)` and destructured factory results like `const { readRedirect } = createRedirectHelpers(searchParams)`, so auth flows cannot bypass redirect-param detection by returning the same reviewed query reader from a small local factory before redirecting.
- Auth open-redirect tracing now also preserves helper-factory closure bindings like `function createRedirectHelpers(params) { return { readRedirect() { return params.get(...) } }; }`, so auth flows cannot bypass redirect-param detection just by renaming the reviewed `searchParams` carrier inside a small factory before returning and calling the helper object.
- Auth open-redirect tracing now also follows function-returning helper factories like `const readRedirect = createReadRedirect(searchParams)` and aliased returns like `return getRedirectFromQuery`, so auth flows cannot bypass redirect-param detection by wrapping the same reviewed query read in a returned closure before redirecting.
- Auth open-redirect tracing now also treats returned query-reader closures as getter helpers even through wrappers like `readRedirect.call(null, 'next')`, `readRedirect.apply(null, ['next'])`, `Reflect.apply(readRedirect, null, ['next'])`, and `createReadRedirect(searchParams).bind(null)`, so auth flows cannot bypass redirect-param detection by wrapping the returned helper closure before invoking it with the same raw redirect key.
- Auth open-redirect tracing now also preserves repeated-param helper normalization inside returned closures, including shapes like `const readRedirect = (key) => params.getAll(key)[0]`, `const readRedirect = (key) => params.getAll(key)[0].trim()`, `const readRedirect = (key) => params.getAll(key)[0].trimStart()`, `const readRedirect = (key) => params.getAll(key)[0].trimLeft()`, `const readRedirect = (key) => params.getAll(key)[0].trimEnd()`, `const readRedirect = (key) => params.getAll(key)[0].trimRight()`, `const readRedirect = (key) => params.getAll(key)[0].padStart(12, '/')`, `const readRedirect = (key) => params.getAll(key)[0].padEnd(12, '/')`, `const readRedirect = (key) => params.getAll(key)[0].repeat(1)`, `const readRedirect = (key) => params.getAll(key)[0].replace(/^\\/+/, '/')`, `const readRedirect = (key) => params.getAll(key)[0].replaceAll('//', '/')`, `const readRedirect = (key) => params.getAll(key)[0].substr(0)`, `const readRedirect = (key) => params.getAll(key)[0].substring(0)`, `const readRedirect = (key) => params.getAll(key)[0].toLowerCase()`, `const readRedirect = (key) => params.getAll(key)[0].toUpperCase()`, `const readRedirect = (key) => params.getAll(key)[0].toLocaleLowerCase()`, `const readRedirect = (key) => params.getAll(key)[0].toLocaleUpperCase()`, `const readRedirect = (key) => params.getAll(key)[0].normalize()`, `const readRedirect = (key) => params.getAll(key).at(0)`, `const readRedirect = (key) => params.getAll(key).shift()`, `const readRedirect = (key) => params.getAll(key).pop()`, `const readRedirect = (key) => params.getAll(key).find(Boolean)`, `const readRedirect = (key) => params.getAll(key).findLast(Boolean)`, `const readRedirect = (key) => params.getAll(key).slice(-1)[0]`, `const readRedirect = (key) => params.getAll(key).reverse()[0]`, `const readRedirect = (key) => params.getAll(key).toReversed()[0]`, `const readRedirect = (key) => params.getAll(key).sort()[0]`, `const readRedirect = (key) => params.getAll(key).toSorted()[0]`, `const readRedirect = (key) => Array.from(params.getAll(key))[0]`, `const readRedirect = (key) => [...params.getAll(key)][0]`, `const readRedirect = (key) => params.getAll(key).concat()[0]`, `const readRedirect = (key) => params.getAll(key).flat()[0]`, `const readRedirect = (key) => params.getAll(key).map((value) => value)[0]`, `const readRedirect = (key) => params.getAll(key).flatMap((value) => [value])[0]`, `const readRedirect = (key) => params.getAll(key).splice(0, 1)[0]`, `const readRedirect = (key) => params.getAll(key).toSpliced(0, 1)[0]`, `const readRedirect = (key) => params.getAll(key).values().next().value`, `const readRedirect = (key) => params.getAll(key).entries().next().value[1]`, `const readRedirect = (key) => params.getAll(key).filter(Boolean)[0]`, and wrapped invocations like `readRedirect.call(null, 'next')`, so auth flows cannot sidestep redirect-param detection by normalizing repeated `next` values before redirecting.
- Auth open-redirect tracing now also follows normalized query carriers like `new URLSearchParams(window.location.search.slice(1))` and `new URLSearchParams(req.nextUrl.search.slice(1))`, so auth flows cannot bypass redirect-param detection just by stripping the leading `?` off a reviewed location/request query string before reading `next`.
- Auth open-redirect tracing now also treats `open(...)` and `window.open(...)` as imperative navigation sinks, so auth flows cannot bypass redirect-param detection by forwarding raw `next` or `returnTo` values through browser popup or tab navigation instead of `redirect(...)`, router transitions, or direct location assignment.
- Auth open-redirect tracing now also follows aliased and destructured `window.open` sinks like `const popup = window.open` and `const { open: popup } = window`, so auth flows cannot bypass redirect-param detection just by hoisting browser-open navigation into a local helper before forwarding the same untrusted destination.
- Auth open-redirect tracing now also follows aliased and destructured location-mutation sinks like `const navigate = window.location.assign` and `const { replace: navigate } = window.location`, so auth flows cannot bypass redirect-param detection just by hoisting browser location navigation methods into local helpers before forwarding the same raw `next` value.
- Auth open-redirect tracing now also follows bound location-mutation sinks like `window.location.assign.bind(window.location)` and `replace.bind(window.location)`, so auth flows cannot bypass redirect-param detection just by binding browser location navigation methods before forwarding the same raw `next` value.
- Auth open-redirect tracing now also follows aliased and bound router transition sinks like `const { push } = useRouter()` and `router.replace.bind(router)`, so auth flows cannot bypass redirect-param detection just by hoisting or binding client router navigation methods before forwarding the same raw `next` value.
- Auth open-redirect tracing now also follows router transition method wrappers like `router.push.call(router, next)` and `navigate.apply(router, [next])`, so auth flows cannot bypass redirect-param detection just by forwarding the same raw destination through `call(...)` or `apply(...)` around client router navigation.
- Auth open-redirect tracing now also follows `call(...)` and `apply(...)` wrappers around browser/history sinks like `history.replaceState.call(history, {}, '', next)`, `window.location.assign.call(window.location, next)`, and `window.open.apply(window, [next, '_self'])`, so auth flows cannot bypass redirect-param detection just by forwarding the same raw destination through method wrappers on non-router navigation APIs.
- Auth open-redirect tracing now also follows aliased `.apply(...)` argument arrays like `const args = [next]; navigate.apply(router, args)` and `const args = [{}, '', next]; history.replaceState.apply(history, args)`, so auth flows cannot bypass redirect-param detection just by hoisting the wrapped argument list into a local helper before calling the same router, history, location, or `window.open` sink.
- Auth open-redirect tracing now also follows reflected wrapper calls like `Reflect.apply(router.replace, router, [next])`, `Reflect.apply(history.replaceState, history, [{}, '', next])`, `Reflect.apply(window.location.assign, window.location, [next])`, and `Reflect.apply(window.open, window, [next, '_self'])`, including aliased argument arrays like `const args = [next]; Reflect.apply(router.replace, router, args)`, so auth flows cannot bypass redirect-param detection just by routing the same raw destination through `Reflect.apply(...)` instead of method-style `.apply(...)`.
- Auth open-redirect tracing now also follows aliased and destructured History API sinks like `const updateHistory = history.replaceState` and `const { pushState: updateHistory } = window.history`, so auth flows cannot bypass redirect-param detection just by hoisting history mutation methods into local helpers before forwarding the same raw destination into the browser URL bar.
- Auth open-redirect tracing now also follows bound History API sinks like `history.replaceState.bind(history)` and `pushState.bind(window.history)`, so auth flows cannot bypass redirect-param detection just by binding a browser history mutation method before forwarding the same untrusted destination into the URL bar.

## Highest-Value Next Streams

1. Add richer golden verification beyond build/smoke into route/runtime behavior.
2. Move execution packs deeper into hosted/API workflows instead of local scaffold-only artifacts.
3. Deepen verifier coverage further into auth, navigation, performance, and security checks beyond the current AST/runtime baseline.
4. Continue narrowing legacy `any`/implicit contracts in older CLI and MCP paths.
5. Keep improving content intelligence quality and confidence scoring on top of the now-live hosted summary contract.
