# Project Health CI Installer

`@decantr/cli@1.10.0` adds a generated GitHub Actions gate for Project Health.

```bash
npx @decantr/cli@1.10.0 health init-ci
npx @decantr/cli@1.10.0 health init-ci --fail-on warn --force
```

The generated workflow runs `decantr health` in CI, writes markdown and JSON reports, appends the markdown summary to GitHub Actions, and uploads both reports as artifacts. The default gate uses `--fail-on error`, which blocks invalid or error-level project health while keeping warning-level drift visible for triage.

Project Health remains local project observability. The generated CI workflow does not upload project reports, source code, prompts, file paths, or environment data to Decantr.
