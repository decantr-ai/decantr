# Page Pack

**Objective:** Implement the public-profile route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=public-profile | patterns=creator-profile, stats-overview, card-grid, recipefork-activity-feed

## Page Contract
- Page: public-profile
- Path: /profile/:id
- Shell: recipefork-top-nav
- Section: recipefork-profile (auxiliary)
- Theme: recipefork (light)
- Features: profile-editing, follows, collections, activity-feed, public-profiles, branch-analytics
- Surface: _flex _col _gap4

## Page Patterns
- creator-profile -> creator-profile [stack | standard]
  > Full creator profile page with hero banner, tabbed navigation for posts, memberships, and about
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] hover-reveal
- stats-overview -> stats-overview [grid | standard]
  > Horizontal row of stat items with label, value, and trend indicator
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
- card-grid -> card-grid [grid | collection]
  > Collection/category cards with background image, overlay title, item count. Grid: 2/3 cols.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal
- card-grid -> card-grid [grid | collection]
  > Collection/category cards with background image, overlay title, item count. Grid: 2/3 cols.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal
- recipefork-activity-feed -> recipefork-activity-feed [stack | preview-cards]
  > Vertical rail of linked activity cards with preview image, event icon, summary text, actor attribution, and timestamp.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
