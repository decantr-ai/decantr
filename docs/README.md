# Decantr Docs

This reset branch treats only the vNext program, audits, and active implementation specs as current source of truth.

For quick setup help, showcase feedback, and live community discussion, join the [Decantr Discord](https://discord.gg/WeDpBd4xFU). GitHub issues, pull requests, and these docs remain the canonical home for bugs, feature requests, and durable decisions.

## Active Docs

- `programs/`
  - Branch-level product strategy and program structure.
- `audit/`
  - Baseline audits, keep/cut decisions, package surface review, and platform contract findings.
- `specs/`
  - Active implementation specs for the reset program.
- `reference/`
  - Human-readable references for active public/runtime contracts such as Project Health, Evidence Bundles, Workspace Health, Content Health, workflow mode, telemetry, and registry API surfaces.
- `guides/`
  - Focused public entry points for existing-app adoption, Project Health CI, AI assistant setup, registry publishing, and design contract basics.
- Brownfield 2.8 operating-layer guidance lives in `guides/existing-apps.md`, `guides/ai-assistant-setup.md`, `reference/workflow-model.md`, `reference/project-health.md`, and `reference/command-surface.md`: `adopt`, `task`, `verify`, `codify --from-audit`, analyze artifacts, theme inventory, task-time MCP/CLI context, visual manifest, baselines, local pattern proposals, local rule proposals, and changed-file impact.
- `releases/`
  - Short product release notes for shipped user-facing surfaces.
- `schemas/`
  - Published public schema copies and the schema index surfaced at `https://decantr.ai/schemas/`.
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

Registry blueprint docs should describe the public sets as `All`, `Featured`, `Certified`, and `Labs`. Internal portfolio labels such as fold candidates are maintainer metadata only; public docs should say that overlapping legacy slugs remain addressable directly but are hidden from browse/search.
