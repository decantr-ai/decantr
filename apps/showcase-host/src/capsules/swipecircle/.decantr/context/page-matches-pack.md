# Page Pack

**Objective:** Implement the matches route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=matches | patterns=presence-avatars, stats-bar, avatar-grid-tile, hero, bottom-tab-bar

## Page Contract
- Page: matches
- Path: /matches
- Shell: mobile-tab-bar
- Section: swipe-feed (primary)
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Surface: _flex _col _gap4

## Page Patterns
- presence-avatars -> presence-avatars [row | detailed]
  > Avatars with online/away status dots
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] hover-reveal
- stats-bar -> stats-bar [row | default]
  > Equal-width stat items in a row
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
- avatar-grid-tile -> avatar-grid-tile [stack | standard]
  > Square card with circular 80px avatar centered above a single-line name. Optional violet new-match dot at top-right of the avatar. Used as the repeating tile in a matches-grid.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] scale-hover
  - [ ] lift-hover
  - [ ] click-select
  - [ ] stagger-children
  - [ ] animate-on-mount
- hero -> hero [stack | empty-state]
  > Empty state placeholder with illustration slot, message, and action CTA. Used when a list or page has no data yet.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scale-hover
  - [ ] glow-hover
  - [ ] float-idle
- bottom-tab-bar -> bottom-tab-bar [flex-row | standard]
  > Four-item bottom tab bar with icon above label. Active item has color-shift, icon scale, and underline dot. Sticky bottom on mobile, sticky bottom of centered column on desktop.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] scale-hover
  - [ ] keyboard-navigation
  - [ ] animate-on-mount

## Page Directives

Execution-level rules for this route. Follow exactly.

- Top section: 'New Matches' label with horizontal scrolling presence-avatars rail showing matches from the last 24h. Tap an avatar to open the chat thread.
- Below the rail: stats-bar with 1-2 stats — 'X new matches', 'Y total connections'. Use coral primary accent for the numerics.
- Main grid: 3-column responsive grid of avatar-grid-tile (4 cols on tablet+, 5 cols on desktop within the 480px column). Each tile shows the matched user's circular avatar, name, and a violet new-match dot if unviewed. Tap navigates to /u/:userId.
- If no matches yet: show hero empty-state with copy 'No matches yet. Keep swiping — your circle is forming.' and an illustration of two avatars meeting.
- Bottom-tab-bar with 'Matches' active. Badge dot on Matches tab cleared when this page is viewed.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
