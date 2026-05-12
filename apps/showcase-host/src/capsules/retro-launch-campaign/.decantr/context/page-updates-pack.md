# Page Pack

**Objective:** Implement the updates route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=updates | patterns=launch-update-log, backer-progress-console, continue-screen-cta

## Page Contract
- Page: updates
- Path: /updates
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- launch-update-log -> launch-update-log [grid | update-console]
  > Console-like update feed with pinned latest update, category filters, and expandable entries.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] animate-on-mount
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

- Prioritize factual progress, blockers, unlocked milestones, and fulfillment status over blog-style marketing posts.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
