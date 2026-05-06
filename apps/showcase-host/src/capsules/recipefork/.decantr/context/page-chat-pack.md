# Page Pack

**Objective:** Implement the chat route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=chat | patterns=chat-thread, chat-input

## Page Contract
- Page: chat
- Path: /chat
- Shell: recipefork-top-nav
- Section: recipefork-ai-kitchen (auxiliary)
- Theme: recipefork (light)
- Features: chat-history, image-upload, auth, generation-history
- Surface: _flex _col _gap4

## Page Patterns
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

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
