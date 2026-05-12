# Decantr Reliability Layer

The next 2.x phase makes Project Health the evidence-backed reliability spine for AI-generated UI.

Highlights:

- `decantr health --evidence` writes a privacy-redacted local Evidence Bundle.
- Contract assertions now feed Project Health and evidence artifacts.
- Optional browser verification uses a project-local Playwright install and stores screenshots under `.decantr/evidence/`.
- `decantr workspace list` and `decantr workspace health` support monorepos with many Decantr projects.
- `decantr health init-ci --workspace` generates aggregate GitHub Actions artifacts.
- `decantr studio --workspace` exposes a local workspace health dashboard.
- MCP now exposes evidence, workspace health, repair prompt, and health-loop tools for AI agents.
- `decantr export --to figma-tokens` plus `health --design-tokens` provide token/policy comparison without Figma OAuth or frame sync.

This is additive 2.x minor work. No command removals, no hosted ingestion by default, and `@decantr/vite-plugin` remains experimental.
