# Page Pack

**Objective:** Implement the settings route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=settings | patterns=settings-nav, form, bottom-tab-bar

## Page Contract
- Page: settings
- Path: /settings
- Shell: mobile-tab-bar
- Section: swipe-feed (primary)
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Surface: _flex _col _gap4

## Page Patterns
- settings-nav -> settings-nav [stack | standard]
  > Vertical sidebar navigation with grouped sections and icon-prefixed items — used as a settings page sidebar alongside a content panel
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation
- form -> form [stack | settings]
  > Vertical stack of sections, each with a title/description on the left and form fields on the right (2-column layout per section). Save button at bottom.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] inline-edit
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

- Settings-nav at the top: vertical list of sections — Notifications, Privacy, Account, Help, About — each with a chevron-right and a brief subtitle.
- Below the nav, a form with toggles for the most-used preferences: Push notifications (on/off), Show me on Discover (on/off), Read receipts (on/off).
- Bottom of the page: a 'Log Out' link in danger color (var(--d-danger)). Confirmation modal on tap. In demo mode, logout clears the localStorage demo flag and routes to /.
- Bottom-tab-bar with 'Profile' active (settings is a sub-route of profile).

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
