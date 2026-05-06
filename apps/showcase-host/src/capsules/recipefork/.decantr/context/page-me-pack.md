# Page Pack

**Objective:** Implement the me route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=me | patterns=creator-profile, account-settings, stats-overview, card-grid

## Page Contract
- Page: me
- Path: /profile
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
- account-settings -> account-settings [stack | profile]
  > Profile editing with settings navigation, avatar upload, name, email, bio, and a stable save zone.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
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

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
