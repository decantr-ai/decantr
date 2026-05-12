# Page Pack

**Objective:** Implement the home route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=home | patterns=campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta

## Page Contract
- Page: home
- Path: /
- Shell: full-bleed
- Section: launch-campaign (public)
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Surface: _flex _col _gap4

## Page Patterns
- campaign-marquee-hero -> campaign-marquee-hero [grid | coin-op]
  > First-viewport hero staged like an arcade cabinet: marquee headline, product screen, live counter strip, and dual CTAs.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] click-select
  - [ ] keyboard-navigation
- backer-progress-console -> backer-progress-console [grid | funding-console]
  > Wide console for crowdfunding or preorder campaigns with raised amount, goal progress, backer count, and days remaining.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] real-time-updates
  - [ ] status-pulse
  - [ ] click-select
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
- reward-tier-selector -> reward-tier-selector [grid | cartridge-row]
  > Horizontal reward cartridges with price, contents, inventory meter, delivery window, and select action.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
- stretch-goal-ladder -> stretch-goal-ladder [grid | level-map]
  > Horizontal level-select path with milestone gates, unlock labels, and progress connector.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] hover-tooltip
  - [ ] hover-reveal
  - [ ] keyboard-navigation
- founder-comic-strip -> founder-comic-strip [grid | story-panels]
  > Four to six comic-style story panels with captions, maker photos or illustrations, and a clear campaign ask.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] hover-reveal
  - [ ] click-select
- backer-wall-ticker -> backer-wall-ticker [stack | ticker-wall]
  > Horizontal ticker rows mixed with supporter wall segments for recent pledge activity and testimonials.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] click-select
  - [ ] real-time-updates
  - [ ] keyboard-navigation
- continue-screen-cta -> continue-screen-cta [stack | continue-screen]
  > Full-width final CTA with continue prompt, campaign countdown, pledge/reserve action, and share option.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] status-pulse
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Render the home page as a campaign funnel, not a generic product landing page.
- Use campaign-native sections and avoid generic hero, features, pricing, testimonials, card-grid, and cta-banner substitutes.
- Keep the first viewport full-bleed but place content inside a clear campaign cabinet safe area.
- Show product evidence early: prototype UI, render, video, screenshot, packaging, or a stable visual placeholder.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
