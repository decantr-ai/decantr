# Registry Dogfood Evidence

`apps/registry` is the first flagship dogfood target for the 2.x reliability layer.

Local commands run:

```bash
pnpm --filter registry build
node packages/cli/dist/bin.js workspace list --json
node packages/cli/dist/bin.js workspace health --json --output .decantr/workspace-health.json
cd apps/registry
node ../../packages/cli/dist/bin.js sync
node ../../packages/cli/dist/bin.js health --evidence --output .decantr/evidence/latest.json
```

Current local proof result:

| Project | Status | Score | Findings |
| --- | --- | ---: | ---: |
| `apps/registry` | healthy | 100 | 0 |
| `apps/showcase-host` | error | 0 | 33 |
| `docs` | warning | 28 | 16 |

The registry Evidence Bundle was produced locally with provenance hashes for:

- `decantr.essence.json`
- `.decantr/context/pack-manifest.json`
- `.decantr/context/review-pack.json`

The first registry dogfood run exposed a real registry-sync bug: `decantr sync` only cached the first public list page and cached public list summaries as item files. That created false missing-pattern findings for registry portal patterns that existed in live content. The CLI now paginates registry list endpoints during sync and caches full content records by slug, so offline guard checks and context generation use the canonical content shape.

Two registry source findings were also resolved:

- The private registry telemetry link now carries an accessible label when rendered with string children.
- Escaped JSON-LD script injection is treated as a reviewed structured-data exception by the verifier, instead of being counted as unsafe raw HTML.

The registry portal is now the clean flagship proof target for this branch. The broader monorepo still intentionally reports advisory debt in `apps/showcase-host` and `docs`; those surfaces need contract modernization before they should be promoted to release-blocking dogfood gates.

Evidence artifacts are intentionally local and ignored from git:

- `.decantr/workspace-health.json`
- `apps/registry/.decantr/evidence/latest.json`

## Content Drift Check

The sibling `decantr-content` repo was checked on `feature/reliability-layer-surface-audit` with:

```bash
npm run schemas:sync
npm run validate
npm run registry:v2-certify
npm run registry:audit -- --report-json=registry-drift-report.json --summary-markdown=registry-drift-summary.md
```

Current content result:

| Check | Result |
| --- | --- |
| Schema sync | passed |
| Content validation | passed with 4 quality warnings |
| V2 certification | passed, 41/41 blueprints compile to Essence 4.0.0 |
| Live registry audit | passed, 538 repo items vs 538 live items |

The live registry audit found no missing or extra live items. It did report four changed live items:

- `archetype/agent-orchestrator`
- `archetype/auth-full`
- `archetype/marketing-swipecircle`
- `archetype/swipe-feed`

Those four repo items contain Decantr 2.x compatibility and certification metadata that is not yet present in the hosted registry. That drift is intentional until the content release is ready; it should remain a pre-publish gate rather than being resolved by pulling older live data back into the repo.
