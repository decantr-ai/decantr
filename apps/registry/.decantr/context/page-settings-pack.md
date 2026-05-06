# Page Pack

**Objective:** Implement the settings route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=settings | patterns=account-settings

## Page Contract
- Page: settings
- Path: /dashboard/settings
- Shell: sidebar-main
- Section: user-dashboard (primary)
- Theme: luminarum (dark)
- Features: auth, api-keys
- Surface: _flex _col _gap4

## Page Patterns
- account-settings -> account-settings [stack | profile]
  > Profile editing with settings navigation, avatar upload, name, email, bio, and a stable save zone.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
