# Page Pack

**Objective:** Implement the my-recipes route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=my-recipes | patterns=stats-overview, filter-bar, card-grid

## Page Contract
- Page: my-recipes
- Path: /recipes
- Shell: recipefork-top-nav
- Section: recipefork-profile (auxiliary)
- Theme: recipefork (light)
- Features: profile-editing, follows, collections, activity-feed, public-profiles, branch-analytics
- Surface: _flex _col _gap4

## Page Patterns
- stats-overview -> stats-overview [grid | standard]
  > Horizontal row of stat items with label, value, and trend indicator
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
- filter-bar -> filter-bar [row | standard]
  > Search input + dropdown filters + action buttons in a horizontal bar
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
- card-grid -> card-grid [grid | content]
  > Content/blog cards with thumbnail, title, excerpt, author, date. Grid: 1/2/3 cols.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal

## Wiring Signals
- pageSearch

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
