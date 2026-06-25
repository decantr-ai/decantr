# Decantr 3.5.5 Real-World Corpus Report

Generated on June 25, 2026 against published `@decantr/cli@3.5.5`.

## Corpus

The run cloned five established open-source Brownfield apps into `/tmp` and executed Decantr through a neutral harness, without project-specific fixtures or Decantr engineering skill context.

| Project | Stack signal | Selected route | Result |
| --- | --- | --- | --- |
| `cypress-io/cypress-realworld-app` | React payment app | `/transaction/new` | pass |
| `oldboyxx/jira_clone` | legacy React app | `/authenticate` | pass |
| `ixartz/SaaS-Boilerplate` | Next/Tailwind/shadcn SaaS app | `/:locale/dashboard` | pass |
| `wasp-lang/open-saas` | Wasp/React SaaS app | `/admin` | pass |
| `DustinBrett/daedalOS` | complex TypeScript web desktop | `/` | pass |

## Command Matrix

Each project ran 18 commands:

- `decantr --version`
- `decantr --help`
- `decantr scan --json`
- `decantr scan`
- `decantr setup`
- `decantr workspace list --json`
- `decantr adopt --yes --no-packs`
- `decantr doctor`
- `decantr graph --json`
- `decantr graph --route <selected-route> --json`
- `decantr task <selected-route> "Review this route before editing" --json`
- `decantr verify --json`
- `decantr ci --json`
- `decantr resolve`
- `decantr refresh --check`
- `decantr graph --check`
- `decantr doctor --project ./definitely-missing-app`
- `decantr task /definitely-missing-route "Bad route smoke" --json`

The bad-project and bad-route commands are expected to fail. All other commands are expected to succeed.

## Results

| Metric | Result |
| --- | ---: |
| Projects | 5 |
| Commands | 90 |
| Unexpected failures | 0 |
| Crash-signature projects | 0 |
| Route misses | 0 |
| Promoted corpus candidates | 5 |

## Route Coverage

| Project | Routes detected | Selected route | Verify status | Score | Findings |
| --- | ---: | --- | --- | ---: | ---: |
| `cypress-realworld-app` | 12 | `/transaction/new` | warning | 43 | 17 |
| `jira_clone` | 2 | `/authenticate` | warning | 91 | 5 |
| `SaaS-Boilerplate` | 7 | `/:locale/dashboard` | warning | 37 | 19 |
| `open-saas` | 18 | `/admin` | warning | 76 | 8 |
| `daedalOS` | 1 | `/` | warning | 51 | 13 |

The warning scores are expected for uncurated Brownfield repositories. This pass measures first-mile compatibility, route/context discovery, graph generation, task activation, Project Health execution, CI JSON execution, resolver behavior, freshness checks, and bad-command quality. It does not claim these projects conform to Decantr local law.

## Findings

- `@decantr/cli@3.5.5` handled all five repos without unexpected nonzero exits.
- No `EISDIR`, `TypeError`, `ReferenceError`, `SyntaxError`, unhandled exception, or `Cannot read properties` crash signatures appeared.
- All five adopted projects produced taskable routes and graph-ready Project Health output.
- `open-saas` is worth keeping in the corpus. It is Wasp-specific, but Decantr can still observe concrete React UI routes such as `/admin`, `/ui`, `/pricing`, and auth flows without a Wasp adapter.
- The harness must not execute `npx @decantr/cli@...` from inside target repositories. `open-saas` has `.npmrc` `min-release-age=7`, which correctly blocked a freshly published Decantr package during the first attempt. The checked-in harness now installs the selected Decantr CLI once in the harness tool directory and runs that binary inside each target repo.

## Local Artifacts

Raw run artifacts were written under:

```text
/tmp/decantr-realworld-corpus-20260625-r2
```

Key files:

- `/tmp/decantr-realworld-corpus-20260625-r2/reports/aggregate-summary.json`
- `/tmp/decantr-realworld-corpus-20260625-r2/reports/realworld-corpus.md`
- `/tmp/decantr-realworld-corpus-20260625-r2/logs/<project>/<command>.stdout.txt`
- `/tmp/decantr-realworld-corpus-20260625-r2/logs/<project>/<command>.stderr.txt`

## Interpretation

This result does not justify a 3.5.x compatibility patch by itself. The honest next step is a 3.6.0 planning lane for deeper proof quality: runtime/browser evidence, local-law codification quality, false-positive review, repair-loop replay, and optional hard-mode projects such as Documenso, Formbricks, Dub, or Midday.
