# Page Pack

**Objective:** Implement the scan route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=scan | patterns=brownfield-scan

## Page Contract
- Page: scan
- Path: /scan
- Shell: full-bleed
- Section: registry-browser (public)
- Theme: luminarum (dark)
- Features: search, pagination
- Surface: _flex _col _gap4

## Page Patterns
- brownfield-scan -> brownfield-scan [stack | hosted-repo-scan]
  > Centered full-bleed hero that collapses into an evidence report after a public GitHub repo or GitHub Pages URL is submitted.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] ripple-click
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Render as a full-bleed acquisition surface inside the public shell; do not constrain the hero to the registry browser max-width rhythm.
- Use Decantr controls, cards, labels, and data-viz treatments before adding route-local CSS.
- Keep the scan promise visually clear: no install, no build, no source execution.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
