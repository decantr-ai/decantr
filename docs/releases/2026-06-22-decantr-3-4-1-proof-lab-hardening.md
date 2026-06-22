# Decantr 3.4.1 Proof Lab Hardening

Date: 2026-06-22
Status: Candidate
Version: `3.4.1`

Decantr `3.4.1` is a precision hardening release for the 3.4 proof engine. It does not introduce a new benchmark product surface and it does not claim the `/tmp` proof-lab run as the official public proof corpus.

## Candidate Scope

- Reduced Brownfield shell-drift noise for simple React Router apps that use a generic `AppShell` wrapper.
- Preserved explicit protected-shell drift findings for sidebar, dashboard shell, protected shell, and `app-frame` route evidence.
- Made behavior-obligation `A11Y011` consistent for project-owned form control usages such as `<Input />`, `<Select />`, and `<Textarea />`.
- Rejected empty `aria-label` and dangling literal `aria-labelledby` references as proof of form-control labels.
- Reduced Hybrid style-bridge noise by treating stylesheet CSS-variable usage as local token authority while still flagging hardcoded visual values.
- Added `benchmark:proof-field`, a deterministic local harness for copying nominated apps, applying exact marker mutations, running `decantr health --json`, and emitting JSON/Markdown reports.

## Benchmark Position

The `/tmp` proof-lab report remains a field report, not a public benchmark. It found only three realistic local apps and no rendered runtime evidence, so it is useful for hardening but not enough for benchmark publication.

The public proof benchmark still needs:

- five replayable apps or committed fixtures with stable provenance
- runtime/browser evidence where dependencies can be installed and served
- marker-based or AST-aware mutations instead of brittle manual edits
- published raw artifacts and summarized precision/recall results

## Verification Target

Before publishing, run the package gates:

```bash
pnpm build:packages
pnpm test
pnpm biome:check
pnpm audit:public-api
pnpm audit:package-surface
```

When a local proof corpus is available, also run the field harness against nominated apps:

```bash
pnpm benchmark:proof-field --discover /tmp --limit 5 --out /tmp/decantr-proof-field-3.4.1
```
