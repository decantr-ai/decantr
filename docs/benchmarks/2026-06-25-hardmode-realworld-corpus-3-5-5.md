# Decantr 3.5.5 Hard-Mode Real-World Corpus Report

Generated on June 25, 2026 against published `@decantr/cli@3.5.5`.

## Corpus

This run targeted larger production monorepos after the first five-project corpus passed. The goal was to separate three failure classes:

- setup friction: the app needs services, secrets, or unusual package-manager setup before browser/runtime proof
- route/context failure: Decantr cannot identify or activate useful app routes
- runtime-proof gap: static Decantr workflows work, but browser/runtime evidence needs more setup

## Root-Level Smoke

The first pass intentionally ran Decantr from each monorepo root without `--project`.

| Project | Root result | Interpretation |
| --- | --- | --- |
| `documenso/documenso` | no routes, printed app candidates | correct monorepo refusal, but candidate ranking needs review |
| `formbricks/formbricks` | no routes, printed app candidates | correct monorepo refusal, but candidate ranking needs review |
| `dubinc/dub` | no routes, printed app candidates | correct monorepo refusal |
| `midday-ai/midday` | no routes, printed app candidates | correct monorepo refusal, but candidate ranking needs review |

This is not a route-discovery failure. `scan` correctly refused to guess an app inside a monorepo and told the user to use `--project`.

The quality issue is candidate ranking. In real user copy, product UI apps should rank above docs, Storybook, API, utility packages, MCP helper packages, and workbench-style packages. Examples observed:

- Documenso listed `apps/docs` before the main `apps/remix` app.
- Formbricks listed `apps/storybook` before the main `apps/web` app.
- Midday listed product apps, but also listed packages such as `packages/mcp-apps` and `packages/workbench` as attach candidates.

## App-Scoped Command Matrix

Each app-scoped target ran 18 commands:

- `decantr --version`
- `decantr --help`
- `decantr scan --json --project <app>`
- `decantr scan --project <app>`
- `decantr setup`
- `decantr workspace list --json`
- `decantr adopt --yes --no-packs --project <app>`
- `decantr doctor --project <app>`
- `decantr graph --json --project <app>`
- `decantr graph --route <selected-route> --json --project <app>`
- `decantr task <selected-route> "Review this route before editing" --json --project <app>`
- `decantr verify --json --project <app>`
- `decantr ci --json --project <app>`
- `decantr resolve --project <app>`
- `decantr refresh --check --project <app>`
- `decantr graph --check --project <app>`
- `decantr doctor --project ./definitely-missing-app`
- `decantr task /definitely-missing-route "Bad route smoke" --json --project <app>`

The bad-project and bad-route commands are expected to fail. All other commands are expected to succeed.

## App-Scoped Results

| Project | Project path | Routes | Selected route | Unexpected failures | Verify status | Score | Findings |
| --- | --- | ---: | --- | ---: | --- | ---: | ---: |
| `documenso/documenso` | `apps/remix` | 52 | `/settings` | 0 | warning | 25 | 23 |
| `formbricks/formbricks` | `apps/web` | 73 | `/account/settings/notifications` | 0 | warning | 17 | 27 |
| `dubinc/dub` | `apps/web` | 80 | `/admin.dub.co/login` | 0 | warning | 8 | 28 |
| `midday-ai/midday` | `apps/dashboard` | 40 | `/:locale` | 0 | warning | 0 | 34 |

Aggregate:

| Metric | Result |
| --- | ---: |
| Projects | 4 |
| Commands | 72 |
| Routes discovered | 245 |
| Unexpected failures | 0 |
| Crash-signature projects | 0 |
| Route misses | 0 |
| Promoted hard-mode candidates | 4 |

## Timing Notes

The command matrix remained bounded, but very large apps are materially slower:

- Dub `adopt` took about 54 seconds.
- Dub `verify`, `ci`, `resolve`, and `graph --route` each took about 30 seconds.
- Documenso `adopt` took about 9 seconds.
- Formbricks `adopt` took about 5 seconds.
- Midday `adopt` took about 4 seconds.

This suggests 3.6 planning should include performance budgets for large-app graph/context generation, but no emergency 3.5.x compatibility patch is justified by this run.

## Findings

- App-scoped Decantr 3.5.5 handled Documenso, Formbricks, Dub, and Midday without unexpected failures.
- Route discovery worked across Remix, large Next.js monorepos, dashboard apps, dynamic locale routes, admin domains, and settings/product flows.
- `verify` produced warning-level reports on all four apps, which is expected for uncurated Brownfield projects.
- The next hardening work is not a framework adapter. It is better app-candidate ranking, false-positive review, local-law codification quality, repair-loop replay, and browser/runtime evidence setup.

## Local Artifacts

Root-level smoke artifacts:

```text
/tmp/decantr-hardmode-corpus-20260625
```

App-scoped artifacts:

```text
/tmp/decantr-hardmode-corpus-20260625-scoped
```

Key files:

- `/tmp/decantr-hardmode-corpus-20260625-scoped/reports/aggregate-summary.json`
- `/tmp/decantr-hardmode-corpus-20260625-scoped/reports/realworld-corpus.md`
- `/tmp/decantr-hardmode-corpus-20260625-scoped/logs/<project>/<command>.stdout.txt`
- `/tmp/decantr-hardmode-corpus-20260625-scoped/logs/<project>/<command>.stderr.txt`

## Recommendation

Do not cut a 3.5.6 compatibility patch from this evidence alone. Plan 3.6.0 around:

- product-app ranking in monorepo candidate discovery
- route/context performance budgets for large apps
- manual false-positive review of high-volume Brownfield findings
- `codify --from-audit --style-bridge` quality on production design systems
- repair-loop replay on selected findings
- browser/runtime proof for apps that can run with documented local services
