# Page Pack

**Objective:** Implement the generate route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=generate | patterns=content-uploader, detail-header

## Page Contract
- Page: generate
- Path: /generate
- Shell: recipefork-top-nav
- Section: recipefork-ai-kitchen (auxiliary)
- Theme: recipefork (light)
- Features: chat-history, image-upload, auth, generation-history
- Surface: _flex _col _gap4

## Page Patterns
- content-uploader -> content-uploader [stack | single]
  > Single file upload with large preview area
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] drag-reorder
  - [ ] animate-on-mount
  - [ ] click-select
- detail-header -> detail-header [row | standard]
  > Title, subtitle/description, status badge, breadcrumb, and action buttons. Horizontal layout with bottom border.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
  - [ ] click-select

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
