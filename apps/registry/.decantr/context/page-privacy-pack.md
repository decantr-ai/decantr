# Page Pack

**Objective:** Implement the privacy route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=privacy | patterns=detail-header, registry-link-list

## Page Contract
- Page: privacy
- Path: /privacy
- Shell: top-nav-main
- Section: registry-browser (public)
- Theme: luminarum (dark)
- Features: search, pagination
- Surface: _flex _col _gap4

## Page Patterns
- detail-header -> detail-header [row | standard]
  > Title, subtitle/description, status badge, breadcrumb, and action buttons. Horizontal layout with bottom border.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
  - [ ] click-select
- registry-link-list -> registry-link-list [stack | compact]
  > Single-column link list with icon, title, short helper text, and optional count or status badge.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
