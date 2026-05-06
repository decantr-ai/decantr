# Page Pack

**Objective:** Implement the account-step route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=account-step | patterns=onboarding-wizard, auth-form, cta-section

## Page Contract
- Page: account-step
- Path: /signup
- Shell: centered
- Section: onboarding-wizard (gateway)
- Theme: swipecircle (light)
- Features: auth, photo-upload, step-validation, form-validation, interests-picker
- Surface: _flex _col _gap4

## Page Patterns
- onboarding-wizard -> onboarding-wizard [stack | stepper]
  > Numbered horizontal step indicator at the top with sequential content panels below — the classic wizard pattern for linear multi-step flows with validation between steps
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] click-select
  - [ ] keyboard-navigation
  - [ ] focus-trap
- auth-form -> auth-form [stack | register]
  > Registration form with password strength indicator
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
  - [ ] inline-edit
- cta-section -> cta-section [row | banner]
  > Compact horizontal bar with text on left, single button on right. Good for inline CTAs between content sections.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover

## Page Directives

Execution-level rules for this route. Follow exactly.

- Show step indicator: 1 of 3, active dot in coral, upcoming dots in muted border style
- Validate email format inline as user types (with 240ms debounce)
- Password strength meter shows below the field — coral=weak, accent=medium, success=strong
- Primary CTA label: 'Continue →' — disabled until form is valid
- Secondary text below form: 'Already have an account? Log in' — link to /login

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
