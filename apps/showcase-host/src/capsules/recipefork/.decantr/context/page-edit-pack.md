# Page Pack

**Objective:** Implement the edit route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=edit | patterns=detail-header, recipefork-recipe-metadata-form, recipefork-cookbook-assignment, recipefork-simple-recipe-editor, recipefork-chef-ingredients-editor, recipefork-chef-instruction-editor, recipefork-presentation-editor, recipefork-cooking-tips-editor, recipefork-recipe-story-editor

## Page Contract
- Page: edit
- Path: /recipe/edit/:id
- Shell: recipefork-top-nav
- Section: recipefork-recipe-authoring (auxiliary)
- Theme: recipefork (light)
- Features: simple-mode, chef-mode, drafts, image-upload, hydrated-editing, structured-ingredients, hierarchical-instructions, presentation, cooking-tips, mode-conversion, rich-story, autosave, cookbook-assignment
- Surface: _flex _col _gap4

## Page Patterns
- detail-header -> detail-header [row | standard]
  > Title, subtitle/description, status badge, breadcrumb, and action buttons. Horizontal layout with bottom border.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
  - [ ] click-select
- recipefork-recipe-metadata-form -> recipefork-recipe-metadata-form [stack | authoring]
  > Top section of the create and edit experience with hero upload, recipe title block, core metadata, tags, and draft/publish actions.
- recipefork-cookbook-assignment -> recipefork-cookbook-assignment [stack | inline-assignment]
  > Authoring-side cookbook assignment section with skeleton loading, cookbook chips/cards, and inline create-new-cookbook controls that run before final redirect.
- recipefork-simple-recipe-editor -> recipefork-simple-recipe-editor [stack | standard]
  > Basic recipe editor with two ordered lists: raw ingredient lines and raw instruction lines.
- recipefork-chef-ingredients-editor -> recipefork-chef-ingredients-editor [stack | structured]
  > Row-based structured ingredient editor with autosuggest, scaling controls, and stable ingredient IDs for downstream instruction linking. Although originally introduced for Chef Mode, Recipefork now uses this as the shared ingredient authoring surface across recipe modes.
- recipefork-chef-instruction-editor -> recipefork-chef-instruction-editor [stack | hierarchical]
  > Advanced instruction editor that supports parent instruction groups with nested sub-steps as well as stand-alone advanced steps in the same workflow. Stand-alone steps still expose image, timing, and ingredient-link controls.
- recipefork-presentation-editor -> recipefork-presentation-editor [stack | ai-assisted]
  > Chef Mode presentation section with segmented AI/manual/none controls, an AI generation call-to-action that is disabled until the recipe passes a plating-readiness checklist, and a numbered plating-step editor that supports images and ordering.
- recipefork-cooking-tips-editor -> recipefork-cooking-tips-editor [stack | bullet-editor]
  > Optional bullet-note editor with add, reorder, and remove controls.
- recipefork-recipe-story-editor -> recipefork-recipe-story-editor [stack | expandable]
  > Collapsed optional section that expands into a lightweight rich-text editor with formatting toolbar.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
