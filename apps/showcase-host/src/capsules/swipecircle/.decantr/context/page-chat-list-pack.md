# Page Pack

**Objective:** Implement the chat-list route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=chat-list | patterns=conversation-list, hero, bottom-tab-bar

## Page Contract
- Page: chat-list
- Path: /chat
- Shell: mobile-tab-bar
- Section: swipe-feed (primary)
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Surface: _flex _col _gap4

## Page Patterns
- conversation-list -> conversation-list [stack | standard]
  > Full conversation list with search and details
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] real-time-updates
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

- Conversation list shows each chat as a row: circular avatar (using swipecircle-photo-frame), name, last message preview (truncated 1 line), timestamp (e.g., '2h', 'Yesterday', 'Mon'), and an unread coral dot if unread.
- Tap a conversation to navigate to /chat/:userId (the chat-thread page).
- If no conversations yet: show hero empty-state 'Start a conversation. Match with someone first!' with a Heart icon and a CTA back to /discover.
- Bottom-tab-bar with 'Chat' active. Badge dot on Chat tab cleared when this page is viewed.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
