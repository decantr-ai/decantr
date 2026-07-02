# Decantr Content

Official certified vocabulary for Decantr. This repo is the source of truth for all `@official` namespace patterns, themes, shells, archetypes, and starter-kit blueprints served by `api.decantr.ai`.

This content enriches vocabulary-backed starter-kit, archetype, pattern, theme, and shell flows. It is not the Decantr product center and it is not required for brownfield attach or contract-only Decantr adoption: those CLI paths can run from local project analysis, typed contracts, Project Health, and generated graph/context files without connecting to the official vocabulary service. Brownfield project-owned local law created by `decantr codify --from-audit` lives in the app repo under `.decantr/local-patterns.json` and `.decantr/rules.json`; it is intentionally separate from this official corpus. Official patterns may include accessibility and interaction guidance through existing schema fields, but project-specific `behavior_obligations` remain app-local law in consuming repositories and are not a `decantr-content` schema field in v1. Offline starter-kit/theme enrichment can point the CLI at a local checkout of this repo with `DECANTR_CONTENT_DIR=/path/to/decantr-content` or use an equivalent local cache/custom content source.

Join the [Decantr Discord](https://discord.gg/WeDpBd4xFU) for quick setup help, showcase feedback, and live content discussion. GitHub issues and PRs remain the canonical path for bugs, feature requests, and proposed registry content changes.

## Structure

```
patterns/       — Certified UI vocabulary (hero, kpi-grid, chat-thread, etc.)
themes/         — Color palettes, modes, treatment metadata, and DNA-inference hints
blueprints/     — Starter-kit app compositions (saas-dashboard, etc.)
archetypes/     — App-level templates (ai-chatbot, saas-dashboard, etc.)
shells/         — Page layout containers (sidebar-main, topbar-main, etc.)
```

## Publishing

Changes are validated in CI on PRs and again after they land on `main`. A push to `main` does not mutate the hosted registry by default.

CI checks every content file with `node validate.js`, runs Decantr Content Health, audits intentional warning suppressions, and certifies the active registry catalog against the Decantr V2 / Essence V4 product boundary. Public contributors do not need registry credentials to validate or propose content changes.

Every active blueprint must include `blueprint_portfolio` metadata. Public registry users only see the simple sets: `All`, `Featured`, `Certified`, and opt-in `Labs`. Maintainer-only maturity labels can fold overlapping legacy slugs out of browse/search while keeping those slugs directly addressable for compatibility.

Registry sync is a separate maintainer-controlled step through the `Publish to Registry` workflow. Manual dispatch defaults to `dry_run: true` and `content_certification_tier: enterprise`; a live sync requires an explicit non-dry-run dispatch with scoped registry credentials. Use `content_certification_tier: all` only when demo or experimental content is intentionally part of the sync. Stale live-content pruning is opt-in through `prune_missing` / `PRUNE_MISSING=true` and should only run after reviewing a dry-run report.

## Local Development

For contributors (no credentials required):

```bash
npm install
npm run schemas:sync                                                             # refresh vendored schemas from a sibling decantr-monorepo checkout
npm run validate                                                                 # validate every JSON file against the schemas
npm run registry:v2-certify                                                      # prove active blueprints compile to Essence v4
npm run content:health                                                           # local content health report, fails only on blocking errors
npx @decantr/cli content check                                                    # same Content Health workflow through the current CLI namespace
npm run content:health:json && npm run content:health:suppressions                # fail if a warning is new or no longer intentionally suppressed
npm run registry:audit -- --report-json=./registry-drift-report.json             # read-only diff against the live registry
node scripts/audit-content-intelligence.js --report-json=./content-intelligence-report.json
```

External contributors can verify their changes with `npm run validate` and the read-only audit scripts. Registry publishing is handled by Decantr maintainers.

## Release Stewardship

This repo does not publish an npm package. Its maintainer release lane is registry readiness plus Decantr CLI alignment:

```bash
npm run validate
npm run registry:v2-certify
npm run content:health:json
npm run content:health:suppressions
npm run registry:audit -- --report-json=./registry-drift-report.json --summary-markdown=./registry-drift-summary.md
npm run release:closeout
```

`npm run release:closeout` checks that the repo is clean, `@decantr/cli` and `@decantr/telemetry` are exact-pinned, the lockfile matches those pins, the expected schema copies exist, and a sibling `decantr-monorepo` checkout uses the same CLI version when present. This repo should stay pinned to the current published Decantr stable line so Content Health and registry certification exercise the same public CLI users install. Live registry sync remains an explicit maintainer workflow; run the `Publish to Registry` workflow in dry-run mode before any non-dry-run sync or prune.

## Auditing Content Health

Use Content Health when you want a repo-local quality report before opening or merging a content PR:

```bash
npm run content:health
npm run content:health:json
npx @decantr/cli content check
```

What it reports:
- invalid or duplicate content records
- stale ids or filename mismatches
- missing hard references that block registry correctness
- missing softer archetype layout or suggested-theme references that maintainers can triage over time
- content guidance coverage for patterns, themes, blueprints, and archetypes

The CI gate uses `--fail-on error`, so existing warning-level reference drift stays visible in the GitHub summary without blocking unrelated content fixes. Use a finding's prompt command, such as `decantr content check --prompt <finding-id>`, to produce a scoped remediation prompt for an AI coding assistant.

This repo tracks the current published Decantr CLI and telemetry package versions so Content Health, registry certification, and publish telemetry stay aligned with the monorepo reliability layer. The Decantr 3 content branch can update docs and vocabulary language before package pins move, but the package pins should not point at unpublished `next` versions. Content Health is the content-author lane; app/workspace commands such as `decantr doctor` and `decantr ci` belong in end-user app repos, not this official content corpus. When Decantr adds or changes public schemas, run `npm run schemas:sync` from this repo and commit the vendored schema copies with the content change.

Warning-level debt is also tracked in [`content-health-suppressions.json`](./content-health-suppressions.json). New Content Health warning IDs fail CI until they are fixed or deliberately added to that baseline with a rationale. Stale suppressions fail too, so the baseline shrinks as content quality improves.

## Decantr V2 Certification

Decantr V2 uses Essence `4.0.0` as the active app contract. Registry content keeps its own schema versions (`pattern.v2.json`, `archetype.v2.json`, `blueprint.v1.json`, etc.), but every active published item must declare:

```json
"decantr_compat": ">=2.0.0"
```

Run the V2 certification gate before release-sensitive content changes:

```bash
npm run registry:v2-certify
```

The certifier builds Essence V4 candidates from every active blueprint and its composed archetypes, resolves inherited shells to concrete blueprint route shells, validates against [`schemas/essence.v4.json`](./schemas/essence.v4.json), and writes local report artifacts. Files ignored by the publish pipeline are reported as ignored rather than certified; currently all first-party content in this repo is eligible for certification and publish.

## Auditing Live Registry Drift

Use the audit script when you want to compare this repo with the live `@official` namespace before release:

```bash
node scripts/audit-registry-drift.js
node scripts/audit-registry-drift.js --report-json=./registry-drift-report.json --summary-markdown=./registry-drift-summary.md
```

What it reports:
- `missing live` — content present in this repo but missing from the live registry
- `extra live` — content still published live but no longer present in this repo
- `changed` — content whose live JSON or version does not match the repo source of truth
- `failures` — fetch or comparison errors during the audit

The audit is read-only and does not require registry credentials for public `@official` content.

## Auditing Content Intelligence Coverage

Use the intelligence audit when you want a read-only coverage report for quality, confidence, provenance, recommendation, and verification metadata attached to live `@official` content:

```bash
node scripts/audit-content-intelligence.js
node scripts/audit-content-intelligence.js --report-json=./content-intelligence-report.json --summary-markdown=./content-intelligence-summary.md
```

This audit is also read-only and does not require registry credentials for public `@official` content.

## Adding Content

1. Create a new JSON file in the appropriate directory
2. Every item must have an `id` field (used as the slug)
3. Open a PR — CI validates the JSON
4. Merge to `main` — CI validates the repo source of truth without publishing
5. Maintainers publish the update to the live registry through an explicit non-dry-run registry sync

PRs and scheduled checks can also run the drift audit workflow to surface live-vs-repo mismatches without mutating the registry.

## Content Schema

Each content type has specific required fields. All items should include:
- `id` — unique identifier (used as slug in the registry)
- `version` — semver version string
- `name` — human-readable name
- `description` — brief description

Blueprints additionally require `blueprint_portfolio.visibility`, `blueprint_portfolio.maturity`, a non-empty rationale, and an artifact status. Hidden or folded blueprints must declare a valid `recommended_alternative` that points to a published blueprint in this repo.

This repo keeps vendored copies of the canonical registry schemas in [`schemas/`](./schemas):
- `schemas/essence.v4.json`
- `schemas/pattern.v2.json`
- `schemas/theme.v1.json`
- `schemas/blueprint.v1.json`
- `schemas/archetype.v2.json`
- `schemas/shell.v1.json`

`validate.js` enforces both the expected `$schema` URL and the local schema contract for each content type.

Themes include DNA-inference hints (`typography_hints`, `motion_hints`, `radius_hints`) used by the CLI to generate Essence v4 defaults during `decantr init`.

Project-specific behavior obligations are deliberately not part of these content schemas. Use existing pattern accessibility, responsive, motion, composition, and voice fields for official guidance. Consuming apps can accept their own `.decantr/local-patterns.json` `behavior_obligations` when local source evidence supports form-control or confirmation-dialog obligations.

Legacy note:
- recipe metadata has been folded into themes and treatment-related fields
- `recipe` is no longer an active top-level registry content type

## License

This repository is licensed under the MIT License. See [LICENSE](./LICENSE).
