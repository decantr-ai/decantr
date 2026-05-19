# Hybrid Local Law Hardening 2.11

Release target: `@decantr/cli@2.11.0` and `@decantr/verifier@2.4.0`.

## What Changed

- `decantr suggest --from-code` now discovers accepted project-owned local law from the current app root as well as from explicit monorepo `--project` runs.
- `decantr ci` now prints accepted `.decantr/rules.json` findings with file and line evidence in text, markdown, and JSON reports. `--fail-on error` keeps warning-level local law visible; `--fail-on warn` blocks on it.
- `decantr codify --from-audit` captures source-derived button/action class hints as well as card/surface hints, making the first Hybrid local-law proposal less generic for apps without wrapper components.
- Brownfield theme inventory now treats `data-theme="dark"` and other real theme variants as dark/multi-theme evidence while avoiding component classes such as `.theme-switcher`.
- Brownfield `adopt` suppresses nested primitive next-step copy during the paved workflow so users see one operating loop instead of conflicting follow-ups.
- Browser evidence setup copy now explains that Playwright is only needed for browser/base-url screenshots; static evidence can still be written without it.

## Why

The 2.10 Hybrid lane made local law visible as an authority concept. The next dogfood pass showed the practical gap: local law needed to appear in normal discovery and CI, not only in `task` and `verify --local-patterns`. This release makes accepted project-owned law harder for humans and LLMs to miss.

## Compatibility

No Essence V4 schema change is required. Existing Brownfield and Hybrid projects can upgrade in place. Re-run `decantr codify --from-audit` if you want a fresher proposal with button/action class hints, then review before accepting.

## Try It

```bash
pnpm exec decantr suggest "standardize buttons" --from-code --file src/App.tsx
pnpm exec decantr suggest "standardize buttons" --from-code --file apps/web/src/App.tsx --project apps/web
pnpm exec decantr ci --project apps/web --fail-on error
pnpm exec decantr ci --project apps/web --fail-on warn
```
