# Page Pack

**Objective:** Implement the content-new route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=content-new | patterns=form, json-viewer

## Page Contract
- Page: content-new
- Path: /dashboard/content/new
- Shell: sidebar-main
- Section: user-dashboard (primary)
- Theme: luminarum (dark)
- Features: auth, api-keys
- Surface: _flex _col _gap4

## Page Patterns
- form -> form [stack | settings]
  > Vertical stack of sections, each with a title/description on the left and form fields on the right (2-column layout per section). Save button at bottom.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] inline-edit
  - [ ] keyboard-navigation
- json-viewer -> json-viewer [stack | artifact]
  > Premium artifact panel with a padded toolbar, segmented tab strip, syntax-highlighted JSON, and supporting summary metadata.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
