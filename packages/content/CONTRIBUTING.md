# Contributing to @decantr/content

Thanks for helping maintain Decantr's official content corpus.

`packages/content` is the source of truth for official patterns, themes, shells, archetypes, and blueprints that enrich Decantr contracts and agent context. The corpus feeds the Contract / Context / Evidence loop; it is not a public marketplace, UI framework, component library, or starter-kit portal.

Every JSON file here can influence what an agent sees when a project opts into official vocabulary, so small wording or schema changes matter. Brownfield app repositories can also adopt Decantr without this corpus by using project-owned contracts, local law, style bridges, typed graph artifacts, Project Health, and evidence generated from the app itself.

## Quick Start

From the monorepo root:

```bash
pnpm install
pnpm --filter @decantr/content validate
pnpm --filter @decantr/content content:health
pnpm --filter @decantr/content test
pnpm audit:content-package
```

These checks run offline and require no Supabase, registry, Stripe, PostHog, or hosted publishing credentials.

## Content Types

| Directory | Purpose | Schema |
| --- | --- | --- |
| `patterns/` | UI sections and reusable product guidance | `schemas/pattern.v2.json` |
| `themes/` | Color palettes, modes, treatments, decorators | `schemas/theme.v1.json` |
| `blueprints/` | Complete app compositions | `schemas/blueprint.v1.json` |
| `archetypes/` | App-level templates | `schemas/archetype.v2.json` |
| `shells/` | Page layout containers | `schemas/shell.v1.json` |

## File Rules

- One item per file. Filename is `<id>.json` in kebab-case.
- `id` must equal the filename without `.json`.
- `$schema` must point at the canonical URL for the content type.
- `version` is semver.
- `decantr_compat` should describe the Decantr product line that may consume the item.
- JSON files cannot contain comments.

## Adding Content

1. Pick the right directory and copy the closest existing file as a starting point.
2. Edit the JSON and keep ids unique.
3. Run content validation and health checks.
4. Open a PR in the monorepo.
5. A maintainer reviews and merges. Package publication and Fly content API deployment are separate release operations.

Hosted community publishing and live sync-to-registry workflows are retired in Decantr 3.8. Official reusable content belongs here; customer-specific governance belongs in the consuming repository as local law.

## Editing Existing Content

- Bump `version` when changing semantics such as preset shape, component list, layout, or references.
- Do not rename ids. Add a new file and deprecate the old one if a slug must change.
- Do not delete official content without a maintainer-approved migration path.
- Do not add project-specific `behavior_obligations`; those belong in downstream app `.decantr/local-patterns.json`.

## Auditing Changes

```bash
pnpm --filter @decantr/content validate
pnpm --filter @decantr/content content:health:json
pnpm --filter @decantr/content content:health:suppressions
pnpm --filter @decantr/content content:intelligence
```

The certifier proves active blueprints compile to Essence `4.0.0`; Content Health proves schema/reference/guidance quality; the intelligence audit summarizes local corpus coverage.

## License

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).
