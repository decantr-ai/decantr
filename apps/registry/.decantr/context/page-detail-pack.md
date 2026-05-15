# Page Pack

**Objective:** Implement the detail route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=detail | patterns=blueprint-launch-hero, command-rail, blueprint-anatomy, contract-explorer, json-viewer

## Page Contract
- Page: detail
- Path: /:type/:namespace/:slug
- Shell: top-nav-main
- Section: registry-browser (public)
- Theme: luminarum (dark)
- Features: search, pagination
- Surface: _flex _col _gap4

## Page Patterns
- blueprint-launch-hero -> blueprint-launch-hero [stack | registry]
  > Product-forward registry hero with eyebrow, headline, concise value copy, primary browse/search action, secondary CLI action, and a proof row of compact metrics.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] click-select
  - [ ] keyboard-navigation
- command-rail -> command-rail [stack | copyable]
  > A compact command row with label, monospace command, optional context badge, and copy button.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] keyboard-navigation
  - [ ] hover-reveal
- blueprint-anatomy -> blueprint-anatomy [grid | explainer]
  > Two-region anatomy layout: narrative component list on the left and a compact contract or context preview on the right.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] keyboard-navigation
  - [ ] hover-tooltip
- contract-explorer -> contract-explorer [grid | inspector]
  > Split-pane contract inspector with artifact tabs, tree or section navigation, selected JSON/markdown preview, and copy/open actions.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] keyboard-navigation
  - [ ] hover-tooltip
  - [ ] inline-edit
- json-viewer -> json-viewer [stack | artifact]
  > Premium artifact panel with a padded toolbar, segmented tab strip, syntax-highlighted JSON, and supporting summary metadata.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
