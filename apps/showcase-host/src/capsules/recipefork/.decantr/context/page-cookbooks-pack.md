# Page Pack

**Objective:** Implement the cookbooks route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=cookbooks | patterns=card-grid, cta-section

## Page Contract
- Page: cookbooks
- Path: /cookbooks
- Shell: recipefork-top-nav
- Section: recipefork-cookbooks (auxiliary)
- Theme: recipefork (light)
- Features: collections, visibility, recipe-saving
- Surface: _flex _col _gap4

## Page Patterns
- card-grid -> card-grid [grid | collection]
  > Collection/category cards with background image, overlay title, item count. Grid: 2/3 cols.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal
- cta-section -> cta-section [hero | standard]
  > Centered headline + subtext + primary/secondary buttons. Background can have gradient or subtle pattern.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
