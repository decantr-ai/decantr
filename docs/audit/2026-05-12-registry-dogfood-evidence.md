# Registry Dogfood Evidence

`apps/registry` is the first flagship dogfood target for the 2.x reliability layer.

Local commands run:

```bash
node packages/cli/dist/bin.js workspace list --json
node packages/cli/dist/bin.js workspace health --json --output .decantr/workspace-health.json
cd apps/registry
node ../../packages/cli/dist/bin.js health --evidence --output .decantr/evidence/latest.json
```

Current local proof result:

| Project | Status | Score | Findings |
| --- | --- | ---: | ---: |
| `apps/registry` | warning | 45 | 11 |
| `apps/showcase-host` | error | 0 | 33 |
| `docs` | warning | 28 | 16 |

The registry Evidence Bundle was produced locally with provenance hashes for:

- `decantr.essence.json`
- `.decantr/context/pack-manifest.json`
- `.decantr/context/review-pack.json`

The first registry findings are warning-level missing pattern references such as `blueprint-launch-hero`, `featured-launchpad-list`, `launchpad-flow`, `registry-link-list`, and `command-rail`. This is exactly the kind of drift the reliability layer should surface before Decantr treats the registry portal as a flagship proof target.

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

The live registry audit found no missing or extra live items. It did report four changed live items that should be resolved or intentionally accepted before using the hosted registry as a final release proof:

- `archetype/agent-orchestrator`
- `archetype/auth-full`
- `archetype/marketing-swipecircle`
- `archetype/swipe-feed`
