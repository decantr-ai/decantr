# Blueprint Harness

End-to-end test harness for the Decantr scaffolding pipeline. Automates the deterministic pieces (workspace prep, mobile smoke, artifact collection) and guides the operator through the non-deterministic one (cold-subagent dispatch).

## Usage

```bash
# All-in-one, interactive
node scripts/blueprint-harness/harness.mjs run <blueprint-slug>

# Or run phases individually:
node scripts/blueprint-harness/harness.mjs prep <blueprint-slug> [--workspace=<dir>]
node scripts/blueprint-harness/harness.mjs prompt <workspace>
node scripts/blueprint-harness/harness.mjs smoke <workspace>
node scripts/blueprint-harness/harness.mjs synthesize <workspace> --subagent-report=<file>
```

## What each phase does

| Phase | Action | Deterministic? |
|-------|--------|:-:|
| **prep** | Creates a Vite + React workspace, runs `decantr init --blueprint=<slug> --existing --yes`, validates scaffold output | ✅ |
| **prompt** | Composes the cold-subagent prompt (blueprint slug + harness reporting requirements) and writes it to `<workspace>/_harness/cold-prompt.md` | ✅ |
| **dispatch** | **[OPERATOR]** Dispatch cold subagent with the prompt, save its report to `<workspace>/_harness/subagent-report.md` | ❌ operator step |
| **smoke** | Starts dev server, runs auth-seeded puppeteer against 4 routes × 3 viewports, saves shots to `<workspace>/_harness/mobile-shots/` | ✅ |
| **synthesize** | Fills the report template from scaffold state + subagent report + mobile shots. Writes to `<output-dir>/<date>-<slug>-harness.md` | ✅ |

## Outputs

Default output location: `.claude/harness-runs/<YYYY-MM-DD>-<slug>/` (worktree-local, per project convention).

Artifacts produced:
- `report.md` — synthesis report with all sections
- `mobile-shots/` — 12 puppeteer-rendered PNGs (4 routes × 3 viewports)
- `subagent-report.md` — verbatim cold-subagent response (pasted by operator)
- `cold-prompt.md` — the exact prompt used

## Prereqs

- Node >= 20
- Local decantr CLI built at `packages/cli/dist/bin.js` (run `pnpm build` in the monorepo root if missing)
- `/Applications/Google Chrome.app` installed (puppeteer uses it via `puppeteer-core`)
- From `scripts/blueprint-harness/`, run `npm install` once to pull `puppeteer-core`

## Methodology notes

- Mobile smoke uses `isMobile: true` + `hasTouch: true` + real device-pixel-ratio via `puppeteer-core`. Bare `--window-size` headless Chrome silently skips mobile emulation and produces misleading output — verified 2026-04-23 when it caused false-positive mobile findings in the agent-marketplace run.
- `localStorage.decantr_authenticated = 'true'` is seeded on the origin before every route to bypass the scaffold's mock auth gate. Keep this in sync if the scaffold's auth storage key changes (`src/lib/auth.ts`).
- Cold-subagent prompt comes from `templates/cold-prompt.md` — edit there if the official CLI cold-prompt copy changes.
