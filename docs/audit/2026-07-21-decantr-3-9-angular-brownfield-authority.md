# Decantr 3.9 Angular Brownfield Authority Audit

Date: 2026-07-21

Status: Packed-artifact replay required by the 3.9 route evidence lane. This is machine evidence, not a claim that every Angular architecture is supported or that Decantr is adoption-proven.

## Trigger

An external Angular monorepo trial found three critical failures in the prior discovery model:

- route paths were attributed to a `settings-menu.vitest.ts` fixture instead of the production `routes.ts`
- a large production route table was mostly missed while scan still reported very high confidence
- an installed Tailwind dependency was treated as styling authority despite PrimeNG and Sass owning the selected app

Because route/source provenance feeds adoption, graph baselines, task context, and CI, this was a product-level authority failure rather than a narrow parser bug.

## 3.9 Correction

The verifier now uses an Angular TypeScript authority adapter rooted at the selected app bootstrap. Test, fixture, mock, E2E, and generated paths are excluded before route resolution. The adapter resolves nested and lazy route arrays, maps taskable pages to implementation files, inventories `@Component` classes, and separates route authority, extraction completeness, taskability, styling confidence, and global scan confidence.

Angular adoption, route tasks, MCP task context, and CI v3 fail closed when production route proof is insufficient. `adopt --force` remains available only as an explicit reviewed override.

## Public Replay

The packed `@decantr/verifier@3.9.0` candidate is replayed against these exact public commits:

| Target | Commit | Route signals | Taskable pages | Components | Styling authority |
| --- | --- | ---: | ---: | ---: | --- |
| `gothinkster/angular-realworld-example-app` | `dd99ed2cf39c805d719f943c5d7061a5683d98a8` | 14 | 10 | 18 | CSS from Angular build configuration |
| `primefaces/sakai-ng` | `96d71496d685b5c110efd2875abaa2bf89a56ad2` | 29 | 25 | 44 | PrimeNG + Tailwind + Sass |

Both targets must report Angular Router, proven bootstrap authority, complete extraction, high route/style/component confidence, score 98, pinned Git blob provenance for every route implementation and authority file, and nonzero production-source exclusions. The replay keeps lazy boundaries such as `/uikit`, `/pages`, and `/auth` as graph signals without pretending they are rendered page implementations.

The original frozen 84-case route benchmark remains unchanged. This Angular replay is a supplemental, tarball-bound release requirement in the same content-addressed route artifact.

## Synthetic Regression Coverage

Repository tests also cover:

- a 1,500-line route source with 100 taskable routes
- misleading `.vitest.ts` navigation metadata
- an orphaned `Routes` array that is not reachable from the selected bootstrap
- unresolved lazy components that force partial completeness
- PrimeNG/Sass authority with Tailwind installed but not configured
- CLI adoption refusal and explicit `--force`
- MCP `DISCOVERY_NOT_PROVEN`
- CI v3 `not_proven`

## Remaining Limits

The adapter is static. Runtime-generated routes, custom router factories that cannot be resolved statically, custom `UrlMatcher` behavior, dynamically computed paths, and runtime-created components remain explicit limitations. The two public repositories also reference style assets through Git submodules; their Angular build declarations are retained as authority evidence while an uninitialized submodule is reported as a missing local input.

Equivalent fail-closed authority adapters are not yet claimed for every supported framework. React, Vue, Svelte, Next, Nuxt, and other existing discovery paths remain compatibility surfaces until separately upgraded and qualified against this standard.
