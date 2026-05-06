# Page Pack

**Objective:** Implement the billing route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=billing | patterns=tier-upgrade-card, kpi-grid

## Page Contract
- Page: billing
- Path: /dashboard/billing
- Shell: sidebar-main
- Section: user-dashboard (primary)
- Theme: luminarum (dark)
- Features: auth, api-keys
- Surface: _flex _col _gap4

## Page Patterns
- tier-upgrade-card -> tier-upgrade-card [stack | standard]
  > Pricing card with plan name, monthly price, feature checklist, and upgrade button. Vertical stack layout.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] stagger-children
- kpi-grid -> kpi-grid [grid | dashboard]
  > 4-column grid of stat cards with icon, label, value, and change percentage. This pattern owns the grid and cards, not the surrounding section rhythm.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] real-time-updates
  - [ ] hover-tooltip

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
