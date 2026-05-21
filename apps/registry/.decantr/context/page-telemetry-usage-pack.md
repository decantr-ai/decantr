# Page Pack

**Objective:** Implement the telemetry-usage route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=telemetry-usage | patterns=kpi-grid, activity-feed, content-card-grid

## Page Contract
- Page: telemetry-usage
- Path: /admin/telemetry/usage
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
- activity-feed -> activity-feed [column | standard]
  > Vertical timeline with avatar, user name, action text, timestamp. Grouped by date.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] real-time-updates
  - [ ] hover-reveal
  - [ ] scroll-reveal
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
