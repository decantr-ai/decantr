# Page Pack

**Objective:** Implement the interests-step route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=interests-step | patterns=onboarding-wizard, chip-multiselect, cta-section

## Page Contract
- Page: interests-step
- Path: /onboarding/interests
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
- chip-multiselect -> chip-multiselect [flex-row | standard]
  > Wrapping flex grid of toggleable pill chips. Selected chips get coral fill + white text + check icon; unselected use border-only treatment. Optional helper text and inline validation message below.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] scale-hover
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
- cta-section -> cta-section [row | banner]
  > Compact horizontal bar with text on left, single button on right. Good for inline CTAs between content sections.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover

## Page Directives

Execution-level rules for this route. Follow exactly.

- Show step indicator: 3 of 3, dots 1 and 2 in success state, dot 3 active
- Heading above chip grid: 'What are you into?' (large, display font)
- Sub-heading: 'Pick 3-5 interests so we can introduce you to your circle.'
- Default interest chips: Music, Travel, Fitness, Food, Movies, Books, Gaming, Outdoors, Art, Tech, Wellness, Animals — 12 categories, all selectable simultaneously
- Validation: minimum 3 selected, maximum 5. Below 3: helper text turns danger color. Above 5: chips lock and show 'Max 5 reached' tooltip
- Primary CTA label: 'Complete Profile →' — disabled until 3-5 chips are selected
- On submit: POST profile, route to /discover (the primary swipe feed)

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
