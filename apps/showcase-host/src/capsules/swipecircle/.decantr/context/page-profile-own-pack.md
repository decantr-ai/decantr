# Page Pack

**Objective:** Implement the profile-own route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=profile-own | patterns=mobile-profile-hero, stats-bar, tech-pills, settings-nav, bottom-tab-bar

## Page Contract
- Page: profile-own
- Path: /me
- Shell: mobile-tab-bar
- Section: swipe-feed (primary)
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Surface: _flex _col _gap4

## Page Patterns
- mobile-profile-hero -> mobile-profile-hero [stack | own-profile]
  > Profile hero for the current user (own /me route). Single Edit button as the primary action. Cover photo is large, avatar overlaps bottom edge, bio sits below.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] scroll-reveal
  - [ ] scale-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] keyboard-navigation
- stats-bar -> stats-bar [row | default]
  > Equal-width stat items in a row
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
- tech-pills -> tech-pills [row | standard]
  > Centered row of pill badges with uniform styling. Each pill has a rounded shape (border-radius: 20px), medium padding, semi-bold text, and a subtle hover lift. All pills use a consistent muted background with light text. Wrapped in a flex container with center justification and 12px gap. Max-width constrained to ~700px.
- settings-nav -> settings-nav [stack | standard]
  > Vertical sidebar navigation with grouped sections and icon-prefixed items — used as a settings page sidebar alongside a content panel
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation
- bottom-tab-bar -> bottom-tab-bar [flex-row | standard]
  > Four-item bottom tab bar with icon above label. Active item has color-shift, icon scale, and underline dot. Sticky bottom on mobile, sticky bottom of centered column on desktop.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] scale-hover
  - [ ] keyboard-navigation
  - [ ] animate-on-mount

## Page Directives

Execution-level rules for this route. Follow exactly.

- Profile hero uses own-profile preset: full-bleed cover photo (45vh), overlapping circular avatar, name+age+bio, single 'Edit Profile' coral pill CTA.
- Stats-bar shows 3 stats: 'X swiped', 'Y matches', 'Z.W★ rating' — each stat formatted with lowercase units per voice guidelines.
- Interests display: tech-pills rendered as the curated interest list selected during onboarding (read-only here; editable via Edit Profile).
- Settings-nav: a list of links — Notifications, Privacy, Help, Logout (simulated). Tap navigates to /settings or relevant sub-routes.
- Bottom-tab-bar with 'Profile' active. No badge on Profile tab.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
