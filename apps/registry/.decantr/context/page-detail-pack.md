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
- blueprint-launch-hero -> blueprint-launch-hero [column | default]
- command-rail -> command-rail [column | default]
- blueprint-anatomy -> blueprint-anatomy [column | default]
- contract-explorer -> contract-explorer [column | default]
- json-viewer -> json-viewer [stack | artifact]
  > Premium artifact panel with a padded toolbar, segmented tab strip, syntax-highlighted JSON, and supporting summary metadata.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
