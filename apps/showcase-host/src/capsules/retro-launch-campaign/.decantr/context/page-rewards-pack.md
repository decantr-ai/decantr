# Page Pack

**Objective:** Implement the rewards route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=rewards | patterns=reward-tier-selector, product-box-spec-panel, backer-progress-console, continue-screen-cta

## Page Contract
- Page: rewards
- Path: /rewards
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- reward-tier-selector -> reward-tier-selector [grid | comparison-console]
  > Wide comparison console with tiers as columns, feature rows as manual-style line items, and a sticky action row.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
- product-box-spec-panel -> product-box-spec-panel [grid | manual-foldout]
  > Instruction-manual style foldout with numbered specs, diagrams, and usage scenarios.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] keyboard-navigation
- backer-progress-console -> backer-progress-console [grid | funding-console]
  > Wide console for crowdfunding or preorder campaigns with raised amount, goal progress, backer count, and days remaining.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] real-time-updates
  - [ ] status-pulse
  - [ ] click-select
- continue-screen-cta -> continue-screen-cta [stack | continue-screen]
  > Full-width final CTA with continue prompt, campaign countdown, pledge/reserve action, and share option.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] status-pulse
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Treat reward tiers as campaign packages or cartridges rather than SaaS pricing cards.
- Expose inventory, delivery/access timing, and caveats near the tier action.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
