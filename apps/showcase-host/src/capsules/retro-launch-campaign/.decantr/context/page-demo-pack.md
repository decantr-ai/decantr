# Page Pack

**Objective:** Implement the demo route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=demo | patterns=prototype-demo-bezel, product-box-spec-panel, continue-screen-cta

## Page Contract
- Page: demo
- Path: /demo
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- prototype-demo-bezel -> prototype-demo-bezel [grid | demo-screen]
  > Large bezel-framed product demo with controls, caption strip, status LEDs, and CTA.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] keyboard-navigation
  - [ ] hover-reveal
  - [ ] animate-on-mount
- product-box-spec-panel -> product-box-spec-panel [grid | box-back]
  > Back-of-package grid with feature callouts, contents list, compatibility, shipping status, and support notes.
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

- The demo page must show concrete product evidence in a stable media frame before asking for conversion.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
