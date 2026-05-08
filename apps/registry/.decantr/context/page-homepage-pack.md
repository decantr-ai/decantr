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
- blueprint-launch-hero -> blueprint-launch-hero [column | default]
- search-filter-bar -> search-filter-bar [stack | standard]
  > Full public registry filter bar with search, type tabs, source filter, sort, and result count.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
  - [ ] hover-reveal
- featured-launchpad-list -> featured-launchpad-list [column | default]
- launchpad-flow -> launchpad-flow [column | default]
- registry-link-list -> registry-link-list [column | default]

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
