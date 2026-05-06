# Page Pack

**Objective:** Implement the api-keys route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=api-keys | patterns=api-key-row

## Page Contract
- Page: api-keys
- Path: /dashboard/api-keys
- Shell: sidebar-main
- Section: user-dashboard (primary)
- Theme: luminarum (dark)
- Features: auth, api-keys
- Surface: _flex _col _gap4

## Page Patterns
- api-key-row -> api-key-row [row | standard]
  > Full API key row with name, masked key, scope badges, dates, and copy/revoke actions.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] click-select
  - [ ] hover-reveal

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
