# Page Pack

**Objective:** Implement the thanks route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=thanks | patterns=continue-screen-cta, share-quest-panel, backer-wall-ticker

## Page Contract
- Page: thanks
- Path: /thanks
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- continue-screen-cta -> continue-screen-cta [stack | share-after-action]
  > Post-conversion continue screen prompting supporters to share, invite, or unlock referral rewards.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] status-pulse
  - [ ] keyboard-navigation
- share-quest-panel -> share-quest-panel [grid | referral-quest]
  > Quest-style share panel with referral link, unlock progress, share buttons, and next reward.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] real-time-updates
  - [ ] status-pulse
  - [ ] keyboard-navigation
- backer-wall-ticker -> backer-wall-ticker [grid | static-wall]
  > Reduced-motion friendly static supporter wall with grouped names, quotes, and pledge badges.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] click-select
  - [ ] real-time-updates
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Lead with confirmation before asking for sharing.
- Explain referral unlocks plainly and avoid manipulative sharing pressure.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
