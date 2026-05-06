# Page Pack

**Objective:** Implement the profile-step route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=profile-step | patterns=onboarding-wizard, content-uploader, form, cta-section

## Page Contract
- Page: profile-step
- Path: /onboarding/profile
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
- content-uploader -> content-uploader [stack | single]
  > Single file upload with large preview area
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] drag-reorder
  - [ ] animate-on-mount
  - [ ] click-select
- form -> form [stack | settings]
  > Vertical stack of sections, each with a title/description on the left and form fields on the right (2-column layout per section). Save button at bottom.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] inline-edit
  - [ ] keyboard-navigation
- cta-section -> cta-section [row | banner]
  > Compact horizontal bar with text on left, single button on right. Good for inline CTAs between content sections.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover

## Page Directives

Execution-level rules for this route. Follow exactly.

- Show step indicator: 2 of 3, dot 1 in success-state (filled coral with check), dot 2 active, dot 3 muted
- Photo uploader at the top: large dashed-border drop zone with cloud icon. Tap on mobile opens native picker. Selected photo shows with a small Edit overlay button.
- Form fields: Age (number input, 18+ required), Gender (3-option select with Other text input), Location (city autocomplete), Bio (textarea, 1-3 sentence guidance, 280 char limit with counter)
- All fields except Bio are required. Bio shows 'optional but recommended' helper text.
- Primary CTA: 'Continue →' — disabled until age + gender + location are valid AND a photo is uploaded
- Secondary text: 'Skip for now' (smaller, ghost link) — only enabled if photo is uploaded; profile completion can finish in app

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
