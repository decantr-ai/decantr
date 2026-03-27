# Decantr Remediation Plan

Created: 2026-03-26
Status: In Progress
Context: Battle-test audit of decantr CLI from cold start

## Overview

This folder contains 6 independent workstream specs to address gaps found during CLI battle-testing. Each workstream can be executed by a separate agent in parallel.

## Workstreams

| # | Workstream | File | Gaps Addressed | Priority |
|---|------------|------|----------------|----------|
| 1 | Missing Patterns | [WS1-missing-patterns.md](./WS1-missing-patterns.md) | 5 patterns don't exist | Critical |
| 2 | Theme-Recipe Completeness | [WS2-theme-recipe-completeness.md](./WS2-theme-recipe-completeness.md) | 18% recipe coverage | High |
| 3 | Content Resolver Fix | [WS3-content-resolver-fix.md](./WS3-content-resolver-fix.md) | `content/core/` not loaded | Critical |
| 4 | DECANTR.md Generation | [WS4-decantr-md-generation.md](./WS4-decantr-md-generation.md) | Serialization, colors, MCP | High |
| 5 | Guard Validation | [WS5-guard-validation.md](./WS5-guard-validation.md) | Theme/mode, pattern existence | Critical |
| 6 | CSS/Pattern Guidance | [WS6-css-pattern-guidance.md](./WS6-css-pattern-guidance.md) | Theme scoping, @layer, color-scheme, multi-theme CSS, pattern code | High |
| 7 | CLAUDE.md Cleanup | [WS7-claude-md-cleanup.md](./WS7-claude-md-cleanup.md) | Outdated counts, missing CLI package | Low |

## Recommended Merge Order

While all workstreams can run in parallel, merge in this order to avoid conflicts:

```
WS3 (resolver) → WS1 (patterns) → WS2 (recipes) → WS5 (guard) → WS4 (docs) → WS6 (guidance) → WS7 (CLAUDE.md)
```

## Execution

7 independent workstreams, each:
- Has its own branch: `fix/ws{N}-{name}`
- Is independent and can be assigned to a parallel agent
- Contains a checklist at the bottom for tracking

## Pre-Work: Cleanup Test Artifacts

Before starting workstreams, clean up stale test files in the CLI package:

```bash
# Remove test artifacts that could confuse LLMs
rm -f packages/cli/decantr.essence.json
rm -f packages/cli/DECANTR.md
rm -rf packages/cli/.decantr/

# Add to .gitignore to prevent future issues
echo "packages/cli/decantr.essence.json" >> .gitignore
echo "packages/cli/DECANTR.md" >> .gitignore
echo "packages/cli/.decantr/" >> .gitignore
```

These files contain "neon" theme references that don't exist in the registry and may have caused confusion during the audit.

## Audit Source

These gaps were identified through:
1. `npx decantr init` with gaming platform + luminarum theme
2. Theme switching (luminarum → launchpad → auradecantism)
3. Pattern addition (leaderboard → activity-feed fallback)
4. Full CSS scaffolding review
