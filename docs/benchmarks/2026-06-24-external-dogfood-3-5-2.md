# Decantr 3.5.2 External Dogfood Report

Generated with the local `@decantr/cli@3.5.2` candidate on June 24, 2026.

## Corpus

The run cloned five established open-source Brownfield apps into `/tmp` and executed Decantr without project-specific fixtures or Decantr engineering skill context:

| Project | Selected route | Result |
| --- | --- | --- |
| `cypress-io/cypress-realworld-app` | `/transaction/new` | pass |
| `oldboyxx/jira_clone` | `/` | pass |
| `ixartz/SaaS-Boilerplate` | `/:locale/dashboard` | pass |
| `wasp-lang/open-saas` | `/ui` | pass |
| `DustinBrett/daedalOS` | `/` | pass |

## Command Matrix

Each project ran:

- `decantr --version`
- `decantr --help`
- `decantr scan --json`
- `decantr setup`
- `decantr workspace list --json`
- `decantr adopt --yes --no-packs`
- `decantr doctor`
- `decantr graph --json`
- `decantr graph --route <selected-route> --json`
- `decantr task <selected-route> "Review route before editing" --json`
- `decantr verify --json`
- `decantr ci --json`
- `decantr resolve`
- `decantr doctor --project ./definitely-missing-app`
- `decantr task /definitely-missing-route "Bad route test" --json`

## Findings

- No unexpected nonzero exits in the route-aware happy path.
- No `EISDIR`, `TypeError`, `ReferenceError`, `SyntaxError`, unhandled exception, or `Cannot read properties` crash signatures.
- All adopted projects produced current graph artifacts; `verify --json` reported `graph.ready: true` and zero stale graph artifacts.
- The unhappy-path commands failed as expected. `doctor --project ./definitely-missing-app` now prints a direct missing-path error instead of rendering a setup report for an impossible directory.

## Health Scores

| Project | Verify status | Score | Findings |
| --- | --- | ---: | ---: |
| `cypress-realworld-app` | warning | 38 | 18 |
| `jira_clone` | warning | 91 | 5 |
| `SaaS-Boilerplate` | warning | 37 | 19 |
| `open-saas` | warning | 76 | 8 |
| `daedalOS` | warning | 51 | 13 |

These warning scores are expected for uncurated Brownfield projects. The purpose of this pass was CLI reliability, route-context usability, graph freshness, and bad-command behavior, not proving the projects conform to Decantr local law.

## Local Artifacts

Raw run artifacts were written under:

```text
/tmp/decantr-3-5-2-dogfood-route-aware-1782341073538
```

