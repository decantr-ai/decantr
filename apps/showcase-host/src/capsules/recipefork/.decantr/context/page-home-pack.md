# Page Pack

**Objective:** Implement the home route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=home | patterns=hero, card-grid, testimonials, cta-section

## Page Contract
- Page: home
- Path: /
- Shell: recipefork-top-nav
- Section: recipefork-landing (public)
- Theme: recipefork (light)
- Features: marketing, seo
- Surface: _flex _col _gap4

## Page Patterns
- hero -> hero [stack | landing]
  > Centered headline + CTA + optional media
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scale-hover
  - [ ] glow-hover
  - [ ] float-idle
- card-grid -> card-grid [grid | content]
  > Content/blog cards with thumbnail, title, excerpt, author, date. Grid: 1/2/3 cols.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal
- testimonials -> testimonials [grid | grid]
  > Grid of testimonial cards, each with quote, avatar, name, and role
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scroll-reveal
  - [ ] drag-reorder
- cta-section -> cta-section [hero | standard]
  > Centered headline + subtext + primary/secondary buttons. Background can have gradient or subtle pattern.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
