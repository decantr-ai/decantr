# Page Pack

**Objective:** Implement the telemetry route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=telemetry | patterns=kpi-grid, search-filter-bar, activity-feed

## Page Contract
- Page: telemetry
- Path: /admin/telemetry
- Shell: sidebar-main
- Section: admin-moderation (auxiliary)
- Theme: luminarum (dark)
- Features: auth, admin
- Surface: _flex _col _gap4

## Page Patterns
- kpi-grid -> kpi-grid [grid | dashboard]
  > 4-column grid of stat cards with icon, label, value, and change percentage. This pattern owns the grid and cards, not the surrounding section rhythm.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] real-time-updates
  - [ ] hover-tooltip
- search-filter-bar -> search-filter-bar [stack | standard]
  > Full public registry filter bar with search, type tabs, source filter, sort, and result count.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
  - [ ] hover-reveal
- activity-feed -> activity-feed [column | standard]
  > Vertical timeline with avatar, user name, action text, timestamp. Grouped by date.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] real-time-updates
  - [ ] hover-reveal
  - [ ] scroll-reveal

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
