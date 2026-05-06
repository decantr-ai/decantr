# Page Pack

**Objective:** Implement the discover route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=discover | patterns=filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar

## Page Contract
- Page: discover
- Path: /discover
- Shell: mobile-tab-bar
- Section: swipe-feed (primary)
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Surface: _flex _col _gap4

## Page Patterns
- filter-bar -> filter-bar [row | compact]
  > Search input only, filters in a collapsible popover
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
- spatial-card-stack -> spatial-card-stack [spatial | deck]
  > Swipeable card stack where cards are layered along the Z-axis — front card is full-size and interactive, cards behind progressively scale down, dim, and offset upward
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] lift-hover
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] stagger-children
- swipe-action-bar -> swipe-action-bar [flex-row | three-button]
  > X / Star / Heart — the classic swipe-app trio. Centered horizontally with even spacing. Heart and X are the primary 60px buttons, Star is a smaller premium 48px between them.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] scale-hover
  - [ ] keyboard-navigation
  - [ ] ripple-click
- match-celebration -> match-celebration [spatial | first-match]
  > Full-impact first-match celebration with confetti, burst gradient, avatar pair animation, and a delightful 'It's a Match!' headline. Auto-dismiss after 4s unless user interacts.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scale-hover
  - [ ] focus-trap
  - [ ] click-select
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

- Filter bar at top of body: 4 chips — All / Nearby / My Interests / New — single-select, default 'All'. Changing selection refetches the deck with mock data.
- Swipe deck occupies the largest visual share of the body — at least 60% of body height. Card width 320px, aspect ratio 3/4. Use spatial-card-stack deck preset gestural defaults (30% threshold, ±15deg rotateY, spring physics).
- Each card uses swipe-card pattern as its content slot — full-bleed photo with bottom gradient overlay carrying name, age, distance, bio, interests.
- Swipe-action-bar sits 16px above the bottom-tab-bar with 3 buttons: Pass (X), Super Like (star, optional), Like (heart). Hotkeys: ←/↑/→.
- On a successful match (mock-randomized: 30% chance on right-swipe in demo mode), trigger match-celebration overlay. First-match preset includes confetti.
- When the deck is exhausted: show hero empty-state with copy 'You've seen everyone nearby! Check back later.' + a Refresh button that re-randomizes the mock deck.
- Bottom-tab-bar persists with 'Swipe' tab active. Badge dots appear on Matches and Chat tabs when new matches/messages arrive.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
