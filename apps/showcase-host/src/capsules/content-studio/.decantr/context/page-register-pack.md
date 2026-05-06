# Page Pack

**Objective:** Implement the register route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=register | patterns=auth-form

## Page Contract
- Page: register
- Path: /register
- Shell: centered
- Section: auth-flow (gateway)
- Theme: editorial (light)
- Features: auth
- Surface: _flex _col _gap4

## Page Patterns
- auth-form -> auth-form [stack | register]
  > Registration form with password strength indicator
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
  - [ ] inline-edit

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
