# Portfolio Showcase

Built with [decantr](https://decantr.ai) v0.9.6 — AI-first web framework.

## Project Structure

- `src/app.js` — Entry point, mounts the app to `#app`
- `src/pages/home.js` — Single-page brand landing with 10 sections
- `public/index.html` — HTML shell with auradecantism dark theme variables
- `decantr.config.json` — Project configuration
- `decantr.essence.json` — Project DNA (portfolio archetype, auradecantism dark, pill shape)

## Vintage

- **Style:** auradecantism (default core)
- **Mode:** dark
- **Shape:** pill
- **Character:** bold, dramatic, editorial

## Page Sections (top to bottom)

1. **Announcement Bar** — dismissible glass-subtle banner
2. **Brand Hero** — full-viewport, d-mesh bg, aura-orbs, d-gradient-text headline
3. **Logo Strip** — two-row marquee, opposite directions
4. **Feature Grid** — 6 d-glass cards, 3-col responsive grid
5. **Code Preview** — split layout, code with syntax highlighting
6. **Stats Section** — 4 animated statistics on d-mesh bg
7. **Testimonial Wall** — 9 d-glass quote cards, staggered scroll reveal
8. **Showcase Gallery** — 6 BrowserFrame screenshots, 3-col grid
9. **Brand CTA** — full-width d-mesh, dual CTA buttons
10. **Footer** — 4-col grid with branding, links, social, copyright

## Commands

- `npx decantr dev` — Dev server with hot reload
- `npx decantr build` — Production build to `dist/`
