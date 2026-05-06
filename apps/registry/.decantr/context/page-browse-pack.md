# Page Pack

**Objective:** Implement the browse route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=browse | patterns=search-filter-bar, content-card-grid

## Page Contract
- Page: browse
- Path: /browse
- Shell: top-nav-main
- Section: registry-browser (primary)
- Theme: luminarum (dark)
- Features: search, pagination
- Surface: _flex _col _gap4

## Page Patterns
- search-filter-bar -> search-filter-bar [stack | standard]
  > Full public registry filter bar with search, type tabs, source filter, sort, and result count.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
  - [ ] hover-reveal
- content-card-grid -> content-card-grid [grid | standard]
  > Registry content cards with optional 16:9 media, one type chip, a 3-line description, and a clean source/version/date footer. Grid: 1/2/3 cols at sm/md/lg.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
