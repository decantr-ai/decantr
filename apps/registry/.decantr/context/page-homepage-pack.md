# Page Pack

**Objective:** Implement the homepage route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage | patterns=blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list

## Page Contract
- Page: homepage
- Path: /
- Shell: top-nav-main
- Section: registry-browser (public)
- Theme: luminarum (dark)
- Features: search, pagination
- Surface: _flex _col _gap4

## Page Patterns
- blueprint-launch-hero -> blueprint-launch-hero [stack | registry]
  > Product-forward registry hero with eyebrow, headline, concise value copy, primary browse/search action, secondary CLI action, and a proof row of compact metrics.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] click-select
  - [ ] keyboard-navigation
- search-filter-bar -> search-filter-bar [stack | standard]
  > Full public registry filter bar with search, type tabs, source filter, sort, and result count.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
  - [ ] hover-reveal
- featured-launchpad-list -> featured-launchpad-list [grid | curated]
  > Three to six featured launchpad cards with blueprint name, target workflow, short outcome copy, tag row, and primary inspect/use action.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] keyboard-navigation
- launchpad-flow -> launchpad-flow [grid | steps]
  > Four-step horizontal or stacked flow: Choose, Initialize, Refresh, Verify. Each step carries a compact command or artifact reference.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] keyboard-navigation
- registry-link-list -> registry-link-list [stack | compact]
  > Single-column link list with icon, title, short helper text, and optional count or status badge.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
