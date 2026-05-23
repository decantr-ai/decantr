# Decantr Docs

This reset branch treats the active program docs, audits, and implementation specs as current source of truth.

The Decantr 3.0 AI Frontend Governance reset is captured in `programs/2026-05-21-ai-frontend-governance-reset-plan.md`. Treat it as the active strategic planning source for the hard-cut 3.x initiative. The existing Hybrid and Brownfield 2.x docs remain the operational source of truth until a 3.x implementation branch, package line, and public docs are explicitly cut over.

For quick setup help, showcase feedback, and live community discussion, join the [Decantr Discord](https://discord.gg/WeDpBd4xFU). GitHub issues, pull requests, and these docs remain the canonical home for bugs, feature requests, and durable decisions.

## Active Docs

- `programs/`
  - Branch-level product strategy and program structure.
  - Current 3.0 reset program: `programs/2026-05-21-ai-frontend-governance-reset-plan.md`.
  - Current Hybrid program: `programs/2026-05-15-hybrid-fortification-plan.md`.
- `audit/`
  - Baseline audits, keep/cut decisions, package surface review, and platform contract findings.
  - Latest Brownfield confidence report: `audit/2026-05-15-brownfield-2-9-dogfood-confidence.md`.
- `specs/`
  - Active implementation specs for the reset program.
- `architecture/decisions/`
  - Architecture decision records for active implementation choices.
  - Current 3.0 decisions: graph storage adapter, temporal/provenance model, React/TypeScript/TSX code graph extraction, and contract capsule context architecture.
- `research/`
  - Market and architecture research that informs active programs.
  - Current graph/AI governance research: `research/2026-05-21-graph-ai-governance-competitive-research.md`.
  - Current retrieval/context architecture research: `research/2026-05-21-retrieval-architecture-research.md`.
- `reference/`
  - Human-readable references for active public/runtime contracts such as Project Health, Evidence Bundles, Workspace Health, Content Health, workflow mode, telemetry, and registry API surfaces.
- `guides/`
  - Focused public entry points for existing-app adoption, monorepos, Project Health CI, AI assistant setup, typed graph agent operation, registry publishing, and design contract basics.
- Brownfield 2.9 operating-layer guidance lives in `guides/existing-apps.md`, `guides/monorepos.md`, `guides/project-health-ci.md`, `guides/ai-assistant-setup.md`, `guides/typed-graph-agent-playbook.md`, `reference/workflow-model.md`, `reference/project-health.md`, `reference/diagnostic-codes.md`, and `reference/command-surface.md`: `adopt`, automatic online pack hydration, `doctor`, `ci`, monorepo `--project` onboarding, app-scoped primitives, pinned root CI workflows, generic CI snippets, project-scoped remediation prompts and read targets, `task`, `verify`, `codify --from-audit --style-bridge`, analyze artifacts, theme inventory, task-time MCP/CLI context, typed route/impact graph context, optional visual manifest, baselines, local pattern proposals, local rule proposals, production-UI interaction evidence, contract-only token-export copy, Brownfield `add page` / `add feature` section aliases, and changed-file impact.
- Hybrid 2.12 guidance extends the same docs with accepted style bridge artifacts, style-bridge task/MCP context, style-bridge suggestions, CI style-bridge summaries, stronger project-owned styling critique boundaries, source-derived button/card hints, and cleaner theme inventory. The active implementation note is `releases/2026-05-19-hybrid-style-bridge-2-12.md`; the broader program remains `programs/2026-05-15-hybrid-fortification-plan.md`.
- Installed-package security posture is captured in `reference/security-permissions.md`. It is generated from `config/package-permissions.json` and distinguishes published npm surfaces from internal monorepo scripts, showcase fixtures, and release automation.
- `releases/`
  - Short product release notes for shipped user-facing surfaces.
  - Latest Hybrid operating-layer note: `releases/2026-05-19-hybrid-local-law-hardening-2-11.md`.
- `schemas/`
  - Published public schema copies and the schema index surfaced at `https://decantr.ai/schemas/`.
- `runbooks/`
  - Operational rollout and verification procedures for hosted surfaces.
  - Includes package release strategy and hosted rollout runbooks.
  - Current release closeout source of truth: `runbooks/release-stewardship.md`.
  - Includes explicit runbooks for both API and registry portal deployment.

Current active phase specs:
- `specs/2026-05-21-v3-typed-graph-foundation-design.md`
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
