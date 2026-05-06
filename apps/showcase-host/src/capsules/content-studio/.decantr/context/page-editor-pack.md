# Page Pack

**Objective:** Implement the editor route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=editor | patterns=doc-editor

## Page Contract
- Page: editor
- Path: /drafts/:id
- Shell: sidebar-main
- Section: content-author (auxiliary)
- Theme: editorial (light)
- Features: editing, publishing, auto-save, markdown
- Surface: _flex _col _gap4

## Page Patterns
- doc-editor -> doc-editor [stack | standard]
  > Full-featured block editor with toolbar, slash commands, and collaboration features
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] inline-edit
  - [ ] keyboard-navigation

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
