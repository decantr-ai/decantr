# Decantr Docs

The Decantr 3 public docs now treat the reference pages, guides, schemas, release notes, and release runbooks as the current source of truth. Historical program docs remain useful background, but the active user-facing model is Decantr 3.8.1: Contract, Context, Evidence, Authority Resolution, typed graph impact, Studio Control Room, Brownfield control loop, ranked monorepo project targeting, and the official `@decantr/content` corpus.

The Decantr 3.0 AI Frontend Governance reset is captured in `programs/2026-05-21-ai-frontend-governance-reset-plan.md`. Treat it as historical strategy unless a current reference page or release note re-promotes a decision.

For quick setup help, showcase feedback, and live community discussion, join the [Decantr Discord](https://discord.gg/WeDpBd4xFU). GitHub issues, pull requests, and these docs remain the canonical home for bugs, feature requests, and durable decisions.

## Active Docs

- `programs/`
  - Historical product strategy, program structure, and planning checkpoints.
  - Important background: `programs/2026-05-21-ai-frontend-governance-reset-plan.md` and `programs/2026-05-15-hybrid-fortification-plan.md`.
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
  - Human-readable references for active public/runtime contracts such as Project Health, Evidence Bundles, Workspace Health, Content Health, workflow mode, telemetry, and content API surfaces.
- `guides/`
  - Focused public entry points for existing-app adoption, monorepos, Project Health CI, AI assistant setup, typed graph agent operation, content-corpus work, and design contract basics.
- `benchmarks/`
  - Proof-field and real-world corpus reports used to validate Brownfield command reliability, drift detection, repair-plan coverage, runtime evidence, and loop quality.
  - Latest proof-field report: `benchmarks/2026-06-25-decantr-3-6-proof-field-report.md`.
- Decantr 3.8.1 control-loop guidance lives in `guides/existing-apps.md`, `guides/monorepos.md`, `guides/project-health-ci.md`, `guides/ai-assistant-setup.md`, `guides/typed-graph-agent-playbook.md`, `reference/workflow-model.md`, `reference/project-health.md`, `reference/report-schemas.md`, `reference/diagnostic-codes.md`, `reference/mcp-migration.md`, and `reference/command-surface.md`: `scan`, `adopt`, Studio Control Room, `doctor`, `task`, `verify`, `resolve`, `ci`, Cursor activation through `connect cursor`, ranked monorepo `--project` onboarding, app-scoped primitives, v2 Project Health/CI/Workspace/Evidence schemas, authority resolution, loop readiness, hybrid graph ranking, pinned root CI workflows, generic CI snippets, project-scoped remediation prompts and read targets, `codify --from-audit --style-bridge`, analyze artifacts, theme inventory, task-time MCP/CLI context, typed route/impact graph context, optional visual manifest, baselines, local pattern proposals, local rule proposals, project-owned `behavior_obligations`, production-UI interaction evidence, semantic static runtime proof, contract-only token-export copy, Brownfield `add page` / `add feature` section aliases, changed-file impact, real-world corpus timing/failure taxonomy, proof-field benchmark reporting, and official content-corpus checks.
- Installed-package security posture is captured in `reference/security-permissions.md`. It is generated from `config/package-permissions.json` and distinguishes published npm surfaces from internal monorepo scripts, showcase fixtures, and release automation.
- `releases/`
  - Short product release notes for shipped user-facing surfaces.
  - Current release: `releases/2026-07-09-decantr-3-8-1-closeout.md`.
  - 3.6 quality-train note: `releases/2026-06-25-decantr-3-6-0-brownfield-proof-quality.md`.
  - Earlier 3.5 control-loop note: `releases/2026-06-23-decantr-3-5-0-brownfield-control-loop.md`.
  - Earlier behavior-obligations note: `releases/2026-05-23-behavior-obligations.md`.
- `schemas/`
  - Published public schema copies and the schema index surfaced at `https://decantr.ai/schemas/`.
- `runbooks/`
  - Operational rollout and verification procedures for hosted surfaces.
  - Includes package release strategy and hosted rollout runbooks.
  - Current release closeout source of truth: `runbooks/release-stewardship.md`.
  - Registry portal deployment runbooks are historical after the 3.8 de-registry migration; current hosted work is the Fly content API.

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
