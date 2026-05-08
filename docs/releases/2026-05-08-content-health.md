# Content Health

Content Health is now available in `@decantr/cli@1.9.0` with the shared report contract in `@decantr/registry@1.1.0`.

It adds a local supply-chain health surface for registry content repositories such as `decantr-content`.

## Commands

```bash
npx @decantr/cli@1.9.0 content-health
npx @decantr/cli@1.9.0 content-health --ci --fail-on error
npx @decantr/cli@1.9.0 content-health --markdown --output content-health.md
npx @decantr/cli@1.9.0 content-health --prompt <finding-id>
```

## What It Checks

- registry content schemas for patterns, themes, blueprints, archetypes, and shells
- id, filename, and duplicate-id health
- blueprint theme, route, shell, and composed-archetype references
- archetype shell, pattern, dependency, and suggested-theme references
- generation-guidance coverage for visual briefs, interactions, decorators, personality, voice, and page briefs

The command stays local by default and does not upload content files or reports.
