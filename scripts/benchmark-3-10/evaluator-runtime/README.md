# Evaluator Runtime

This private runtime supplies the pinned Chromium and Axe implementation used by task-specific behavioral evaluators. It is benchmark infrastructure, not part of either experimental arm.

Evaluator sources remain self-contained. A source that needs browser evidence receives `--evaluator-runtime ${EVALUATOR_RUNTIME}` and resolves `playwright` or `@axe-core/playwright` from this lockfile-bound directory with `createRequire`.

```sh
npm ci --prefix scripts/benchmark-3-10/evaluator-runtime
PLAYWRIGHT_BROWSERS_PATH="$PWD/.private/benchmark-3-10/playwright-browsers" \
  scripts/benchmark-3-10/evaluator-runtime/node_modules/.bin/playwright install chromium
```

Pass the same location to the runner with `--evaluator-browsers-path`. The container installs the same lockfile at the default runtime-local browser path before benchmark timing begins. Browser absence is an evaluator failure, never a skip.
