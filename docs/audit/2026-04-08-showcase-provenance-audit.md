# Showcase Provenance Audit

Date: 2026-04-08
Status: Draft
Scope: `apps/showcase/*`

## 1. Objective

The showcase program began with 39 attempted full blueprint scaffolds generated with Decantr. After the vNext reset pruning, 38 remain in `apps/showcase/*`, with the off-strategy `workbench` example removed from the repo and retained only as historical audit context.

This corpus is valuable, but only if it is treated as evidence and benchmark material rather than as an undifferentiated product asset.

This audit defines how the showcase corpus should be classified and used in the vNext program.

## 2. Current Reality

Known facts:

- every showcase app began as an attempted blueprint scaffold from Decantr
- provenance varies across apps
- some apps include React / Tailwind / inline-style / hand-rolled deviations that were not part of the intended Decantr ideal
- the corpus is large enough to support benchmark and regression analysis
- the corpus was initially unclassified, which made it noisy instead of trustworthy
- `apps/showcase/manifest.json` now exists as the operational inventory surface for this audit
- `scripts/audit-showcases.mjs` now provides a repeatable signal sweep for inline styles, hardcoded colors, utility leakage, Decantr treatment usage, and pack-manifest presence
- `scripts/validate-showcase-manifest.mjs` now protects the inventory from duplicate slugs and broken shortlist metadata
- `scripts/copy-showcase-dist.mjs` now exports showcase metadata and shortlist manifests into `apps/registry/public/showcase/`
- `workbench` has already been marked `removed` / `Class D` because it reinforced the removed standalone UI-framework line

## 3. New Classification Model

Every showcase app should be assigned one of four classes.

### Class A: Pure Generated

Definition:
- primarily generated from Decantr output
- no meaningful hand-rolled structural rewrite
- limited or no off-contract styling drift

Primary value:
- strongest candidates for golden references

### Class B: Generated + Patched

Definition:
- generated from Decantr output
- manually repaired or improved after generation
- still useful as a realism benchmark

Primary value:
- benchmark evidence for where the system currently needs help

### Class C: Mixed / Hand-Rolled Hybrid

Definition:
- began from a Decantr scaffold but was substantially shaped by manual React / Tailwind / custom implementation

Primary value:
- historical learning and anti-pattern evidence, not a golden candidate by default

### Class D: Obsolete / Discard

Definition:
- broken, outdated, low-signal, or no longer representative of the product direction

Primary value:
- archive or delete after extracting any lessons

## 4. Audit Fields Per Showcase App

Every showcase app should receive a structured audit record.

Required fields:

- slug
- originating blueprint
- target stack
- current build status
- generated provenance estimate
- hand-edit estimate
- inline-style count
- hardcoded-color count
- framework leakage notes
- contract-drift notes
- quality score
- classification (`A`, `B`, `C`, `D`)
- golden-candidate (`yes` / `no`)
- notes on why it matters

## 5. How the Showcase Corpus Should Be Used

### 5.1 Benchmark corpus

The full showcase set should act as a historical and ongoing benchmark corpus.

Use cases:
- measure scaffold quality over time
- identify repeated failure patterns
- test critique and verification improvements
- compare generated output before and after compiler changes

### 5.2 Golden references

Only a small curated subset should become official goldens.

Golden selection rules:
- builds cleanly
- low manual intervention
- low contract drift
- representative of an important blueprint category
- valuable for regression testing

### 5.3 Failure evidence

The weaker showcase apps are still useful if they are explicitly labeled as failure evidence rather than silently mixed with stronger examples.

## 6. Proposed Audit Process

### Phase 0: Inventory

- enumerate all showcase apps
- record blueprint, stack, and rough provenance notes

### Phase 1: Verification sweep

For each app, record:
- build result
- major runtime issues
- presence of inline styles and hardcoded colors
- framework-specific leakage
- missing shell / route / state coverage

Current automation support:
- `pnpm showcase:validate`
- `pnpm showcase:audit`
- `pnpm showcase:shortlist`
- `pnpm showcase:build:shortlist`
- `pnpm showcase:copy:shortlist`
- `pnpm showcase:verify:shortlist`
- optional JSON output: `pnpm showcase:audit -- --report-json=/tmp/showcase-audit.json`

Baseline from the first branch run on 2026-04-08:
- 38 active showcase apps audited
- 16,302 inline-style signals
- 1,985 hardcoded-color signals
- 18 utility-leakage signals
- 7,626 Decantr treatment signals
- 0/38 with compiled pack manifests still present

Initial provisional shortlist produced from the same baseline:
- `portfolio`
- `ai-copilot-shell`
- `spatial-collaboration`
- `content-site`
- `product-landing`
- `carbon-ai-portal`
- `registry-platform`
- `knowledge-base`

These are now marked in `apps/showcase/manifest.json` as provisional `Class B` shortlist candidates. This does not mean they are full goldens yet. It means they are the lowest-noise current benchmark candidates to review first during the manual provenance pass.

Tracked shortlist verification baseline on 2026-04-08:
- 8/8 shortlisted apps built successfully
- average build duration is recorded in the tracked shortlist report and will vary by run
- drift signals: `2 lower`, `4 moderate`, `2 elevated`
- pack manifests present: `0/8`
- tracked report: `apps/showcase/reports/shortlist-verification.json`
- verification command: `pnpm showcase:verify:shortlist`
- surfaced through: registry homepage, `decantr showcase`, `/v1/showcase/*`, and `decantr_get_showcase_benchmarks`

### Phase 2: Classification

Assign each app to Class A, B, C, or D.

### Phase 3: Golden shortlist

Promote a small set of apps to the first golden-reference pool.

Suggested initial target:
- 5 to 8 apps max

### Phase 4: Archive or discard

Archive or delete the lowest-signal apps once their lessons are captured.

## 7. Immediate Decisions

1. `apps/showcase/*` should remain in the repo for now as an audited corpus.
2. The corpus should stop being treated as informal proof that all generated outputs are equally representative.
3. The corpus should become an input to:
   - benchmark reporting
   - golden-app selection
   - critique-engine improvement
   - content quality scoring

## 8. Exit Criteria

This audit is considered complete when:

- every showcase app has provenance and classification metadata
- a small golden shortlist exists
- the lowest-value apps are marked for archive or deletion
- showcase results can inform compiler and verification roadmap decisions
