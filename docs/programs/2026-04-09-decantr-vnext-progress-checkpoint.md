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
- Runtime verification now also distinguishes remote assets that declare integrity but omit `crossorigin`, and that signal flows through shortlist benchmarks, intelligence scoring, CLI summaries, registry UI copy, and public schemas.
- Runtime verification now also flags external new-tab links in built HTML that omit `rel="noopener noreferrer"`, and that signal now flows through shortlist benchmarks, intelligence scoring, CLI summaries, registry UI copy, and public schemas alongside the existing source-level link review.
- MCP scaffold/section/page context tools now reuse hosted selected packs as readable fallback context, so missing local `.decantr/context` markdown no longer forces consumers to reconstruct human-readable context from JSON alone.
- Release operations now have a command-level handoff too: `pnpm release:commands` prints exact preflight and publish commands for the selected package wave, so npm publishing can move from “audit says it’s ready” to “run these commands” without manual translation.
- `pnpm release:commands` now also prints exact npm dist-tag repair commands for the selected package wave, so the same handoff covers both publish execution and the live npm cleanup still blocking package graduation.
- The release planning and publish scripts now also accept both `--wave foundation` and `--wave=foundation` style flags, so the operator commands in the runbooks work exactly as documented.

## Highest-Value Next Streams

1. Add richer golden verification beyond build/smoke into route/runtime behavior.
2. Move execution packs deeper into hosted/API workflows instead of local scaffold-only artifacts.
3. Deepen verifier coverage further into auth, navigation, performance, and security checks beyond the current AST/runtime baseline.
4. Continue narrowing legacy `any`/implicit contracts in older CLI and MCP paths.
5. Keep improving content intelligence quality and confidence scoring on top of the now-live hosted summary contract.
