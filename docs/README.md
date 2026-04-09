# Decantr Docs

This reset branch treats only the vNext program, audits, and active implementation specs as current source of truth.

## Active Docs

- `programs/`
  - Branch-level product strategy and program structure.
- `audit/`
  - Baseline audits, keep/cut decisions, package surface review, and platform contract findings.
- `specs/`
  - Active implementation specs for the reset program.
- `reference/`
  - Human-readable references for active public/runtime contracts such as registry API surfaces.
- `runbooks/`
  - Operational rollout and verification procedures for hosted surfaces.
  - Includes package release strategy and hosted rollout runbooks.
  - Includes explicit runbooks for both API and registry portal deployment.

Current active phase specs:
- `specs/2026-04-08-vnext-phase-0-product-boundary-cleanup-design.md`
- `specs/2026-04-08-vnext-phase-1-registry-contract-normalization-design.md`
- `specs/2026-04-08-vnext-phase-2-contract-compiler-design.md`
- `specs/2026-04-08-vnext-phase-3-verification-and-golden-corpus-design.md`
- `specs/2026-04-08-vnext-phase-4-registry-intelligence-and-content-ops-design.md`
- `specs/2026-04-08-vnext-phase-5-portal-docs-and-package-surface-design.md`
- `specs/2026-04-08-vnext-phase-6-hosted-commercial-platform-design.md`

## Archived Docs

- `archive/specs/`
  - Pre-vNext design/spec documents kept for historical reference only.
- `archive/plans/`
  - Superseded execution plans from the pre-reset architecture.
- `archive/remediation/`
  - Older remediation notes retained as reference material.

## Working Rule

If an older document conflicts with a file under `programs/`, `audit/`, or the active `specs/` directory, treat the active vNext docs as authoritative on this branch.
