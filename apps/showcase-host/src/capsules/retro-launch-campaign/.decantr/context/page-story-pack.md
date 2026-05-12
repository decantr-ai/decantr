# Page Pack

**Objective:** Implement the story route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=story | patterns=founder-comic-strip, product-box-spec-panel, continue-screen-cta

## Page Contract
- Page: story
- Path: /story
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- founder-comic-strip -> founder-comic-strip [grid | story-panels]
  > Four to six comic-style story panels with captions, maker photos or illustrations, and a clear campaign ask.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] hover-reveal
  - [ ] click-select
- product-box-spec-panel -> product-box-spec-panel [grid | manual-foldout]
  > Instruction-manual style foldout with numbered specs, diagrams, and usage scenarios.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] keyboard-navigation
- continue-screen-cta -> continue-screen-cta [stack | continue-screen]
  > Full-width final CTA with continue prompt, campaign countdown, pledge/reserve action, and share option.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] status-pulse
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Tell a clear problem-prototype-proof-launch story with real product or maker evidence.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
