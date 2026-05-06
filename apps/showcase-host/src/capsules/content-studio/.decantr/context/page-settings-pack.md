# Page Pack

**Objective:** Implement the settings route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=settings | patterns=form-sections

## Page Contract
- Page: settings
- Path: /settings
- Shell: sidebar-main
- Section: settings (auxiliary)
- Theme: editorial (light)
- Surface: _flex _col _gap4

## Page Patterns
- form-sections -> form-sections [stack | settings]
  > Vertical stack of sections, each with a title/description on the left and form fields on the right (2-column layout per section). Save button at bottom.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] inline-edit
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
