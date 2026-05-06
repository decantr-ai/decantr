# Page Pack

**Objective:** Implement the feed route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=feed | patterns=filter-bar, card-grid, recipefork-activity-feed

## Page Contract
- Page: feed
- Path: /feed
- Shell: recipefork-top-nav
- Section: recipefork-social (auxiliary)
- Theme: recipefork (light)
- Features: social, activity-feed, comments, reactions, follows, forking, engagement-ranking, lineage-cues
- Surface: _flex _col _gap4

## Page Patterns
- filter-bar -> filter-bar [row | standard]
  > Search input + dropdown filters + action buttons in a horizontal bar
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
- card-grid -> card-grid [grid | content]
  > Content/blog cards with thumbnail, title, excerpt, author, date. Grid: 1/2/3 cols.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] scroll-reveal
- recipefork-activity-feed -> recipefork-activity-feed [stack | preview-cards]
  > Vertical rail of linked activity cards with preview image, event icon, summary text, actor attribution, and timestamp.

## Wiring Signals
- pageSearch

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
