# Decantr Artifacts

This directory is the local Decantr control plane for this app. Decantr is the UI contract and operating loop; your app runtime, framework, package manager, and existing design system stay authoritative unless you explicitly adopt more Decantr runtime surface.

## Canonical Files

Commit these when they exist:

- `decantr.essence.json` - the accepted app contract.
- `.decantr/project.json` - workflow, adoption mode, detection, and initialization metadata.
- `.decantr/local-patterns.json` - project-owned Brownfield UI patterns accepted by the team.
- `.decantr/rules.json` - project-owned mechanical rules accepted by the team.
- `.decantr/style-bridge.json` - accepted Hybrid style bridge from Decantr intent to project tokens/classes.

## Generated Context

Usually commit these so humans and AI assistants share the same context:

- `DECANTR.md` - operating guidance for this app.
- `.decantr/context/*` - generated scaffold, section, page, review, and mutation context.

Regenerate with `decantr refresh`. In CI, prefer `decantr refresh --check` or `decantr ci` so generated files are not rewritten.

## Proposal And Review Files

Review these before promoting anything to canonical state:

- `.decantr/*.proposal.json`
- `.decantr/brownfield-report.md`
- `.decantr/enrichment-backlog.md`
- `.decantr/brownfield-intelligence.json`
- `.decantr/theme-inventory.json`

## Local-Only Evidence

These files are local evidence and should normally stay out of source control unless your team intentionally commits reports:

- `.decantr/evidence/*`
- `.decantr/evidence/screenshots/*`
- `.decantr/ci/*`
- `.decantr/health-baseline-diff.json`

## Daily Loop

- Before AI edits: `decantr task <route> "<change>"`
- After local edits: `decantr verify`
- In CI: `decantr ci`
- When confused: `decantr doctor`
