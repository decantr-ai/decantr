# Page Pack

**Objective:** Implement the checkout route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=checkout | patterns=pledge-checkout-panel

## Page Contract
- Page: checkout
- Path: /checkout
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- pledge-checkout-panel -> pledge-checkout-panel [grid | pledge-flow]
  > Three-step pledge checkout with reward review, supporter details, payment or reservation, and confirmation note.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] focus-trap
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Keep checkout calm and readable. The retro theme should support trust, not overwhelm form completion.
- Make payment timing, delivery/access expectations, and consent text explicit.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
