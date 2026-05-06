# Page Pack

**Objective:** Implement the drafts route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=drafts | patterns=data-table

## Page Contract
- Page: drafts
- Path: /drafts
- Shell: sidebar-main
- Section: content-author (auxiliary)
- Theme: editorial (light)
- Features: editing, publishing, auto-save, markdown
- Surface: _flex _col _gap4

## Page Patterns
- data-table -> data-table [column | standard]
  > Full-featured table with column headers, sortable columns, row selection checkboxes, pagination footer
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] keyboard-navigation
  - [ ] click-select
  - [ ] hover-reveal
  - [ ] animate-on-mount
  - [ ] stagger-children

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
