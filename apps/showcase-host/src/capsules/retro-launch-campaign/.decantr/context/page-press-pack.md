# Page Pack

**Objective:** Implement the press route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=press | patterns=press-kit-shelf, product-box-spec-panel

## Page Contract
- Page: press
- Path: /press
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- press-kit-shelf -> press-kit-shelf [grid | press-page]
  > Full press page layout with launch facts, press quote, contact block, and asset shelves.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
- product-box-spec-panel -> product-box-spec-panel [grid | box-back]
  > Back-of-package grid with feature callouts, contents list, compatibility, shipping status, and support notes.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Press assets should be factual, inspectable, and easy to download or copy.
- Avoid generic marketing cards; use shelf/manual/asset treatments.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
