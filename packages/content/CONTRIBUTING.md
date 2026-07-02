# Contributing to decantr-content

Thanks for helping grow Decantr's official certified vocabulary.

This repo is the source of truth for `@official` namespace content: patterns, themes, shells, archetypes, and starter-kit blueprints that can enrich Decantr contracts and agent context. Decantr itself is AI Frontend Governance for codebases touched by AI agents; this content corpus feeds the Contract / Context / Evidence loop, but it is not the product center, a UI framework, a component library, or a registry marketplace.

Every JSON file here can influence what an agent sees when a project opts into official vocabulary, so small wording or schema changes matter. Brownfield app repos can also adopt Decantr without this corpus by using project-owned contracts, local law, style bridges, typed graph artifacts, Project Health, and evidence generated from the app itself.

Project-specific `behavior_obligations` are intentionally not part of the official content schemas in v1. Content authors should use the existing accessibility, responsive, motion, composition, component, and preset fields for reusable guidance. Downstream apps own their accepted behavior obligations in `.decantr/local-patterns.json`, where Decantr can surface them through task context, graph LocalRule nodes, Project Health, and repair prompts.

## Quick start

```bash
git clone https://github.com/decantr-ai/decantr-content.git
cd decantr-content
npm install
npm run validate
npm run registry:v2-certify
npm run content:health
npm run release:closeout
```

`npm run validate`, `npm run registry:v2-certify`, and `npm run content:health` run offline and require no credentials. They are the core checks CI runs on every PR.

`npm run release:closeout` is the maintainer closeout gate. It checks exact Decantr package pins, lockfile alignment, vendored schema presence, local git cleanliness, and optional sibling monorepo CLI parity before registry publish work is called complete. During a Decantr `next` cut, keep the pins on published packages until the prerelease exists on npm, then move the pins and rerun closeout as part of the content release lane.

This repo uses Decantr as a content-author workflow, not as an app Brownfield attach target. Use `npm run content:health` or `decantr content check` here. Use app/workspace commands such as `decantr doctor`, `decantr task`, `decantr verify`, and `decantr ci` in downstream application repositories that consume Decantr or official vocabulary.

For quick setup help, showcase feedback, or live discussion about content ideas, join the [Decantr Discord](https://discord.gg/WeDpBd4xFU). Keep proposed content changes, bugs, and durable decisions in GitHub issues, PRs, or docs.

## Content types

| Directory | Purpose | Schema |
|-----------|---------|--------|
| `patterns/` | UI sections (hero, kpi-grid, chat-thread, etc.) | `schemas/pattern.v2.json` |
| `themes/` | Color palettes, modes, treatments, decorators | `schemas/theme.v1.json` |
| `blueprints/` | Complete app compositions | `schemas/blueprint.v1.json` |
| `archetypes/` | App-level templates (ai-chatbot, saas-dashboard, etc.) | `schemas/archetype.v2.json` |
| `shells/` | Page layout containers (sidebar-main, topbar-main, etc.) | `schemas/shell.v1.json` |

## File rules

- **One item per file.** Filename is `<id>.json` in kebab-case.
- **`id` field must equal the filename** (without `.json`). It becomes the slug in the registry.
- **`$schema` must point at the canonical URL** for the content type (see `schemas/`).
- **`version` is semver** (`"1.0.0"`).
- **`decantr_compat` must be `">=2.0.0"` for active `@official` content.** Content item versions describe the registry item itself; Decantr compatibility describes the product line that may consume it.
- **No comments.** JSON does not allow them.

## Quality bars

CI passes on schema validity, but the validator also emits warnings. Items that ship should not just be valid — they should be useful. Aim for:

| Type | What "good" looks like |
|------|------------------------|
| `patterns` | Has `visual_brief` (1-3 sentences describing the visual intent) AND `components` array AND non-trivial preset descriptions. Patterns with 3+ components should also include a `composition` expression. |
| `blueprints` | Has a `personality` narrative of 100+ characters AND a `voice` block (tone, CTA verbs, avoid words, empty-state copy) AND `suggested_themes`. |
| `themes` | Has a 5+ color semantic palette AND a `decorators` block AND `decorator_definitions` (structured data: name, description, intent, suggested CSS properties). |
| `archetypes` | Has a `role` field (`primary` / `gateway` / `public` / `auxiliary`), `pages` with valid `default_layout`, and `page_briefs` describing each page. |
| `shells` | Has `internal_layout` with semantic spatial specs per region. |

## Adding content

1. Pick the right directory and copy the closest existing file as a starting point — schemas are easier to mimic than to read cold.
2. Edit the JSON. Keep ids unique, run `npm run validate` and `npm run content:health` until blocking errors are clean.
3. Open a PR. CI validates the content and the `Audit Registry Drift` workflow can diff your changes against the live registry.
4. A maintainer reviews and merges. Merging to `main` validates the repo source of truth; it does not publish by itself.
5. Maintainers run the `Publish to Registry` workflow only when they intend to sync live content. Manual dispatch defaults to dry-run, and a live sync requires an explicit non-dry-run dispatch with scoped credentials.

## Editing existing content

- **Bump `version`** when changing semantics (preset shape, component list, layout). Cosmetic edits to `description` or `visual_brief` do not need a bump.
- **Do not rename ids.** Renaming an `id` is a breaking change for every project that references it. Add a new file with the new id and deprecate the old one if needed.
- **Do not delete `@official` content** without a maintainer-approved migration path — generated projects in the wild may reference it.

## Auditing your changes

Two read-only audit scripts run without credentials:

```bash
npm run registry:v2-certify
npm run content:health:json && npm run content:health:suppressions
npm run registry:audit -- --report-json=./registry-drift-report.json
node scripts/audit-content-intelligence.js --report-json=./content-intelligence-report.json
```

The V2 certifier proves active blueprints compile to Essence `4.0.0`; the suppression audit proves current Content Health warnings are intentional. The registry and intelligence audits compare the local repo against `api.decantr.ai` and surface what would change when your PR lands.

## What not to PR

- New top-level directories or new content types — those require a maintainer-coordinated schema change first.
- Edits to `schemas/` directly. Those are vendored from the canonical Decantr schema sources by maintainers.
- Changes to `validate.js` that loosen the contract — tighten freely, loosen only with a maintainer-led discussion.
- New `behavior_obligations` fields in registry JSON. Keep those app-local unless a future maintainer-led schema change explicitly promotes them.

## Code of conduct

Be kind. Reviews focus on the content, not the contributor.

## License

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).
