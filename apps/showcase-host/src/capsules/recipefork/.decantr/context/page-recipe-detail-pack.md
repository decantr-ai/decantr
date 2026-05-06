# Page Pack

**Objective:** Implement the recipe-detail route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=recipe-detail | patterns=hero, detail-header, recipefork-fork-provenance, recipefork-chef-ingredients-display, recipefork-chef-instructions-display, recipefork-presentation-display, recipefork-cooking-tips-display, comment-thread

## Page Contract
- Page: recipe-detail
- Path: /recipe/:id
- Shell: recipefork-top-nav
- Section: recipefork-recipe-detail (primary)
- Theme: recipefork (light)
- Features: sharing, comments, reactions, forking, chef-mode, presentation, cooking-tips, lineage, branch-analytics
- Surface: _flex _col _gap4

## Page Patterns
- hero -> hero [stack | image-overlay]
  > Full-bleed image with gradient overlay, content at bottom. Used for recipe/cookbook detail headers.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scale-hover
  - [ ] glow-hover
  - [ ] float-idle
- detail-header -> detail-header [row | standard]
  > Title, subtitle/description, status badge, breadcrumb, and action buttons. Horizontal layout with bottom border.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation
  - [ ] animate-on-mount
  - [ ] click-select
- recipefork-fork-provenance -> recipefork-fork-provenance [stack | lineage-card]
  > Inline provenance card that keeps the direct parent visible and exposes the root original when different for all viewers. Branch metrics, history stacks, and descendant timelines are owner-facing expansions rather than public browsing defaults.
- recipefork-chef-ingredients-display -> recipefork-chef-ingredients-display [stack | scaled]
  > Ingredient list with recipe scaling controls and converted quantity display.
- recipefork-chef-instructions-display -> recipefork-chef-instructions-display [stack | hierarchical]
  > Display grouped Chef Mode instruction sets with optional simple stand-alone steps mixed into the flow.
- recipefork-presentation-display -> recipefork-presentation-display [stack | numbered-steps]
  > Presentation card inserted after recipe instructions, with clear numbering, optional imagery, and an AI/manual provenance badge.
- recipefork-cooking-tips-display -> recipefork-cooking-tips-display [stack | bullet-list]
  > Sidebar or support-surface bullet list of recipe-specific cooking tips.
- comment-thread -> comment-thread [column | sidebar]
  > Full thread display in aside panel
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] real-time-updates
  - [ ] inline-edit
  - [ ] hover-reveal

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
