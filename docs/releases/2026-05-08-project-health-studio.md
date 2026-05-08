# Project Health And Studio

Released: May 8, 2026

Project Health is now available in `@decantr/cli@1.8.0` with the shared report contract in `@decantr/verifier@1.1.0`.

## What Shipped

- `decantr health` for local contract-health reports in text, JSON, markdown, and CI modes.
- `decantr studio` for a local-only dashboard with Overview, Routes, Drift, Findings, Remediation, CI, and Packs views.
- `ProjectHealthReport` schema and TypeScript exports from `@decantr/verifier`.
- Public schema catalog support at `https://api.decantr.ai/v1/schema/project-health-report.v1.json`.
- CI-ready remediation prompts through `decantr health --prompt <finding-id>`.

## Try It

```bash
npx @decantr/cli@1.8.0 health
npx @decantr/cli@1.8.0 health --ci --fail-on error
npx @decantr/cli@1.8.0 studio
```

Project Health is local project observability. It does not upload source code, prompts, raw file paths, or health reports to Decantr.
