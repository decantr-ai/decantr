# Page Pack

**Objective:** Implement the cookbook-detail route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=cookbook-detail | patterns=hero, card-grid

## Page Contract
- Page: cookbook-detail
- Path: /cookbooks/:id
- Shell: recipefork-top-nav
- Section: recipefork-cookbooks (auxiliary)
- Theme: recipefork (light)
- Features: collections, visibility, recipe-saving
- Surface: _flex _col _gap4

## Page Patterns
- hero -> hero [stack | image-overlay]
  > Full-bleed image with gradient overlay, content at bottom. Used for recipe/cookbook detail headers.
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

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
