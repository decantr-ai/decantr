# Decantr 2.8 Brownfield Operating Layer

Decantr 2.8 expands the 2.7 workflow command layer into a practical Brownfield operating model for existing apps.

## Highlights

- `decantr codify --from-audit` now proposes both `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json`.
- `decantr codify --accept` promotes reviewed proposals to `.decantr/local-patterns.json` and `.decantr/rules.json`.
- `decantr verify --brownfield --local-patterns` requires accepted local patterns and scans accepted local rules when present.
- `decantr task <route>` now surfaces accepted local laws, changed files, impacted routes, screenshot references, and the recommended verify command before LLM edits.
- MCP `decantr_prepare_task_context` now returns accepted local laws, changed-file impact, local law file references, and the recommended verify command.
- Brownfield `adopt` output now points users into the operating loop: codify, accept, task, verify, and baseline continuity.

## Brownfield Positioning

Decantr still does not take over source code in contract-only Brownfield adoption. The existing app remains authoritative. The new local law layer gives teams a project-owned place to name their button, card, surface, form, shell, and theme standards, then feed those standards to LLMs and local verification.

Mechanical checks in `.decantr/rules.json` are intentionally narrow. They catch obvious drift such as inline styles, raw color literals, and raw button usage when a wrapper exists. Framework-specific or organization-specific enforcement should still live in ESLint, Biome, tests, Storybook, or visual regression.

## Recommended Loop

```bash
decantr adopt --base-url http://localhost:3000 --evidence --yes
decantr codify --from-audit
# review .decantr/local-patterns.proposal.json and .decantr/rules.proposal.json
decantr codify --accept
decantr task /feed "add saved recipe actions"
decantr verify --brownfield --local-patterns
```
