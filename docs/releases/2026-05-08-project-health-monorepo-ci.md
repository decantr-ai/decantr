# Project Health Monorepo CI

`@decantr/cli@1.11.0` adds monorepo project targeting to the Project Health CI installer.

```bash
npx @decantr/cli@1.11.0 health init-ci --project apps/registry
```

The generated workflow still installs dependencies from the repository root, then runs `decantr health` inside the selected app contract with `working-directory: <project>`. Markdown and JSON artifacts are uploaded from root-relative paths such as `apps/registry/decantr-health.md`.

This keeps single-app repositories unchanged while making workspace-app health gates explicit, repeatable, and safe for CI.
