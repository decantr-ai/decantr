# creative-tool

Built with [decantr](https://decantr.ai) v0.9.5 — AI-first web framework.

## Quick Start

**Read this first:** `node_modules/decantr/reference/llm-primer.md` — single-file guide with all imports, top atoms with Tailwind equivalences, component signatures, Chart API, skeleton code, and pattern examples. This covers 80% of code generation needs.

## Project Structure

- `src/app.js` — Entry point, mounts the app to `#app`
- `src/pages/` — Route page components
- `public/index.html` — HTML shell with clay light theme CSS variables
- `decantr.config.json` — Project configuration
- `decantr.essence.json` — Project DNA (creative-tool archetype, clay light, rounded shape)

## Vintage

- **Style:** clay (community)
- **Mode:** light
- **Shape:** rounded
- **Recipe:** clay
- **Character:** playful, tactile, soft

## Pages

1. **home** — Full-bleed landing: hero, features, stats, testimonials, CTA, footer
2. **workspace** — Sidebar-main: color input → palette specimen grid (core tool)
3. **explore** — Sidebar-main: gallery of curated palette collections
4. **detail** — Sidebar-main: single palette detail with large swatches and comparison
5. **not-found** — Simple 404

## Commands

- `npx decantr dev` — Dev server with hot reload (port 4302)
- `npx decantr build` — Production build to `dist/`
