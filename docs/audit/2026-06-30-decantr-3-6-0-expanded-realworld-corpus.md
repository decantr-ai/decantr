# Decantr 3.6.0 Expanded Real-World Corpus Audit

Generated: 2026-06-30

CLI under test: `@decantr/cli@3.6.0`

Harness: `scripts/run-realworld-corpus.mjs`

Raw workspace: `/tmp/decantr-realworld-expanded-20260630`

## Summary

The expanded corpus run cloned and tested 16 public GitHub projects across React, Next/Turborepo, Wasp, Remix, Vue, Angular, SvelteKit, static vanilla JavaScript, jQuery, and design-system documentation apps.

After correcting stale corpus paths and one invalid configured route, 14/16 targets passed the full 18-command matrix. There were no crash signatures, no route misses after corrected config, no runtime-proof setup gaps, and no slow-command budget breaches.

| Metric | Result |
| --- | ---: |
| Targets | 16 |
| Commands | 288 |
| Passing commands | 286 |
| Failing commands | 2 |
| Clean targets | 14 |
| Targets needing triage | 2 |
| Crash-signature projects | 0 |
| Route misses after corrected config | 0 |
| Slow commands over budget | 0 |
| Command p50 | 243ms |
| Command p95 | 2134ms |
| Command max | 54163ms |

## Target Results

| Target | Project Path | Kind | Routes | Selected Route | Result |
| --- | --- | --- | ---: | --- | --- |
| `cypress-realworld-app` | root | react-payment-app | 12 | `/transaction/new` | pass |
| `jira-clone` | root | legacy-react-app | 2 | `/authenticate` | pass |
| `saas-boilerplate` | root | next-saas-app | 7 | `/:locale/dashboard` | pass |
| `open-saas` | root | wasp-react-saas-app | 18 | `/admin` | pass |
| `dub` | `apps/web` | next-link-management-monorepo | 80 | `/admin.dub.co/login` | pass |
| `midday` | `apps/dashboard` | dashboard-monorepo | 40 | `/:locale` | pass |
| `daedalos` | root | complex-web-desktop | 1 | `/` | pass |
| `cal-diy` | `apps/web` | next-scheduling-monorepo | 80 | `/auth/login` | pass |
| `epic-stack` | root | remix-starter-app | 3 | `/login` | pass |
| `react-redux-realworld` | root | archived-legacy-react-spa | 9 | `/login` | pass |
| `angular-realworld` | root | angular-realworld-app | 1 in scan, 11 after graph/adopt | `/login` | pass, scan quality gap |
| `dashy` | root | vue-dashboard-app | 4 | `/` | pass |
| `sveltekit-realworld` | root | sveltekit-realworld-app | 33 noisy scan routes | `/login` | pass, scan quality gap |
| `todomvc-vanilla-es6` | `examples/javascript-es6` | vanilla-js-static-app | 1 | `/` | `ci-json` failed |
| `todomvc-jquery` | `examples/jquery` | jquery-static-app | 1 | `/` | `ci-json` failed |
| `shadcn-ui-v4` | `apps/v4` | design-system-docs-monorepo | 17 | `/docs/changelog` | pass |

## Findings

Modern Brownfield coverage was strong. Cypress RealWorld, Jira clone, SaaS Boilerplate, Open SaaS/Wasp, Dub, Midday, daedalOS, Cal.com/Cal DIY, Epic Stack, React Redux RealWorld, Angular RealWorld, Dashy, SvelteKit RealWorld, and shadcn/ui v4 completed the matrix after valid app paths and routes were supplied.

Wasp does not justify stack-specific Decantr behavior from this evidence. `open-saas` passed through generic route and source observation with 18 routes and zero failures.

Monorepo app scoping is healthy for the tested targets. `dub/apps/web`, `midday/apps/dashboard`, `cal-diy/apps/web`, and `shadcn-ui/apps/v4` worked when the correct product app path was supplied.

The actionable 3.6.1 defect is static runtime proof. Both corrected TodoMVC static apps adopted and verified, but `ci --json` failed because `runtime-runtime-root-document-invalid` expected a framework-style `id="root"` mount. Their built HTML has valid semantic static app roots such as `section.todoapp` and `#todoapp`.

The corpus harness also needed sharper config preflight. The initial full run used stale target paths (`examples/vanillajs`, `apps/www`) and an invalid selected route (`/docs`). Decantr returned useful errors, but the harness should not let bad config create a cascade of product-like command failures.

Two route quality items should remain visible after 3.6.1:

- Angular scan underreported routes: `scan` saw only `/`, while graph/adopt later found routes from `src/app/app.routes.ts`.
- SvelteKit scan overreported implementation modules such as `+layout`, `+page.server`, and component files as taskable routes.

## 3.6.1 Actions

The 3.6.1 patch should:

- Accept semantic static app roots as runtime evidence for generic static apps.
- Keep framework targets strict about framework mount/document evidence.
- Add regression tests for static TodoMVC-like roots.
- Make custom corpus configs run all candidates by default unless `--limit` is supplied.
- Preflight configured `projectPath` values before running the full matrix.
- Fall back to a concrete detected route when harness config supplies a route that scan does not report.
- Align verifier scan with Angular route arrays and SvelteKit `+page` route semantics.

## Raw Artifacts

Raw clones and logs were intentionally left under `/tmp`:

- `/tmp/decantr-realworld-expanded-20260630/compiled-report.md`
- `/tmp/decantr-realworld-expanded-20260630/full-run/reports/aggregate-summary.json`
- `/tmp/decantr-realworld-expanded-20260630/full-run/logs`
- `/tmp/decantr-realworld-expanded-20260630/corrected-static-docs-run/reports/aggregate-summary.json`
- `/tmp/decantr-realworld-expanded-20260630/shadcn-valid-route-run/reports/aggregate-summary.json`
