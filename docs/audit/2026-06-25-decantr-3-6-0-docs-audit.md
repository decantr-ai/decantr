# Decantr 3.6.0 Documentation Audit

Generated: 2026-06-25

## Summary

This audit reviewed the markdown/documentation surface for the 3.6.0 Brownfield Proof Quality Train. The cleanup policy is conservative: keep historical release notes, runbooks, specs, programs, benchmark reports, and audits as historical evidence; update active docs and generated public surfaces; delete only duplicated, orphaned, non-historical markdown after reference checks.

Inventory command:

```bash
find . -path './node_modules' -prune -o -path './.git' -prune -o -path './dist' -prune -o -name '*.md' -type f -print
```

Observed markdown inventory:

| Area | Count | Classification |
| --- | ---: | --- |
| Repository total | 1594 | mixed active, generated, mirrored, historical |
| `docs/` | 132 | active docs plus historical records |
| `packages/` package READMEs | 9 | active package docs |
| `apps/` | 553 | app-local docs, generated app docs, and fixtures |
| `scripts/` | 112 | harness/templates and generated support docs |
| `public/` | 56 | public mirrors generated for docs site routing |

## Active Updates

| Surface | Action |
| --- | --- |
| Root README | Updated with 3.6 proof-quality hardening, ranked app candidates, and real-world corpus harness command. |
| `packages/cli/README.md` | Updated monorepo candidate ranking and corpus harness behavior. |
| `packages/verifier/README.md` | Documented the 3.6 `COMP010` specialized-input and Dropzone exception. |
| `docs/README.md` | Updated active model from 3.5 to 3.6 and pointed the latest release note at 3.6.0. |
| `docs/llms.txt` | Added 3.6 candidate ranking and harness v2 metadata for AI consumers. |
| `docs/reference/workflow-model.md` | Updated Brownfield loop wording and documented candidate ranking policy. |
| `docs/reference/command-surface.md` | Documented `workspace list` rank/score/category/reason metadata. |
| `docs/reference/project-health.md` | Clarified that `COMP010` covers generic raw controls and excludes specialized upload/input controls. |
| `docs/reference/diagnostic-codes.md` | Clarified `COMP010` semantics and specialized input exclusions. |
| `docs/benchmarks/governance-proof-methodology.md` | Added first-mile and hard-mode configs, timing budgets, command scopes, and failure taxonomy. |
| `docs/benchmarks/2026-06-25-decantr-3-6-proof-field-report.md` | Added the 3.6 committed proof-corpus replay result. |
| `docs/releases/2026-06-25-decantr-3-6-0-brownfield-proof-quality.md` | Added 3.6 package, harness, docs-audit, benchmark, and release-check notes. |
| `docs/index.html` | Updated current release labels and package-version labels for the 3.6.0 wave. |

## Historical Records Kept

| Area | Decision | Reason |
| --- | --- | --- |
| `docs/releases/*` | Keep | Release notes intentionally describe shipped historical versions, including old commands or version numbers. |
| `docs/benchmarks/*3-5-*` and older reports | Keep | Benchmark reports are evidence snapshots, not current-product docs. |
| `docs/programs/*` | Keep | Program plans are historical strategy unless re-promoted by active references. |
| `docs/specs/*` | Keep | Specs document design history and implementation intent. |
| `docs/runbooks/*` | Keep | Operational history and release process context remain useful. |
| `docs/audit/*` | Keep | Audit records should not be rewritten solely because current product behavior moved forward. |
| `public/*` markdown mirrors | Keep/regenerate | Public docs mirrors are generated site artifacts; update through existing sitemap/docs generation. |

## Delete Candidates

None in this pass.

No markdown file met all deletion criteria: duplicated, orphaned, incorrect, non-historical, and unreferenced. Several older files contain stale version or command language, but they are release notes, benchmark reports, specs, runbooks, or audits and should remain as historical records.

## Drift Sweep

Active docs were swept for:

- stale 3.5 current-release claims
- old MCP 32-tool/direct-tool guidance outside migration history
- Essence V2/V3 product wording outside migration/history context
- `health init-ci` / `verify init-ci` as primary guidance
- outdated package version labels
- old product positioning such as Design Intelligence API, wine terminology, or scaffold-first framing

`audit:docs-drift`, `audit:docs-marketing`, `audit:public-links`, and `seo:docs-sitemap` remain the release gates for active documentation drift.
