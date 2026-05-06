# Page Pack

**Objective:** Implement the chat-thread route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=chat-thread | patterns=chat-header, chat-thread, chat-input, bottom-tab-bar

## Page Contract
- Page: chat-thread
- Path: /chat/:userId
- Shell: mobile-tab-bar
- Section: swipe-feed (primary)
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Surface: _flex _col _gap4

## Page Patterns
- chat-header -> chat-header [row | compact]
  > Minimal header for mobile or constrained layouts
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] animate-on-mount
- chat-thread -> chat-thread [stack | standard]
  > Standard chat thread with messages and anchored input
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] real-time-updates
  - [ ] scroll-reveal
  - [ ] keyboard-navigation
- chat-input -> chat-input [stack | standard]
  > Auto-expanding textarea with attach and send buttons
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
- bottom-tab-bar -> bottom-tab-bar [flex-row | standard]
  > Four-item bottom tab bar with icon above label. Active item has color-shift, icon scale, and underline dot. Sticky bottom on mobile, sticky bottom of centered column on desktop.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] scale-hover
  - [ ] keyboard-navigation
  - [ ] animate-on-mount

## Page Directives

Execution-level rules for this route. Follow exactly.

- Chat header has back-button (left), partner avatar + name (center, tap → opens /u/:userId), and a More menu (right) for mute/block/report.
- Messages area is the only scrolling region. My messages render right-aligned with coral fill (swipecircle-bubble decorator); their messages render left-aligned with cream fill.
- Pre-populated mock conversation: 4-6 messages showing realistic banter (greeting, question, response, follow-up).
- Composer at the bottom: rounded-pill text input with auto-grow (max 4 lines), Smile/Attach icons inside, Send button (coral pill) appears on right when input is non-empty.
- Bottom-tab-bar remains visible by default. On input focus, hide tab-bar with a 200ms slide-down to maximize keyboard space; restore on blur.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
