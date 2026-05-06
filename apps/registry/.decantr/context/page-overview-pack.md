# Page Pack

**Objective:** Implement the overview route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=overview | patterns=kpi-grid, reputation-badge, activity-feed

## Page Contract
- Page: overview
- Path: /dashboard
- Shell: sidebar-main
- Section: user-dashboard (primary)
- Theme: luminarum (dark)
- Features: auth, api-keys
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
- reputation-badge -> reputation-badge [inline | standard]
  > Inline reputation display with score number and trust level icon. Color-coded by trust threshold.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
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
