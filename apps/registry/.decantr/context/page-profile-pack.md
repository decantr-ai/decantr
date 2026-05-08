# Page Pack

**Objective:** Implement the profile route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=profile | patterns=detail-header, content-card-grid, activity-feed

## Page Contract
- Page: profile
- Path: /profile/:username
- Shell: top-nav-main
- Section: registry-browser (public)
- Theme: luminarum (dark)
- Features: search, pagination
- Surface: _flex _col _gap4

## Page Patterns
- detail-header -> detail-header [row | standard]
  > Title, subtitle/description, status badge, breadcrumb, and action buttons. Horizontal layout with bottom border.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
  - [ ] click-select
- content-card-grid -> content-card-grid [grid | standard]
  > Registry content cards with optional 16:9 media, one type chip, a 3-line description, and a clean source/version/date footer. Grid: 1/2/3 cols at sm/md/lg.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal
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
