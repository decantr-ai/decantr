# Page Pack

**Objective:** Implement the moderation-detail route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=moderation-detail | patterns=content-detail-hero, json-viewer, moderation-queue-item

## Page Contract
- Page: moderation-detail
- Path: /admin/moderation/:id
- Shell: sidebar-main
- Section: admin-moderation (auxiliary)
- Theme: luminarum (dark)
- Features: auth, admin
- Surface: _flex _col _gap4

## Page Patterns
- content-detail-hero -> content-detail-hero [stack | standard]
  > Full-width detail hero with narrative content, a quick-start rail, and compact trust summaries.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover
- json-viewer -> json-viewer [stack | artifact]
  > Premium artifact panel with a padded toolbar, segmented tab strip, syntax-highlighted JSON, and supporting summary metadata.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] click-select
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
- moderation-queue-item -> moderation-queue-item [stack | standard]
  > Full moderation card with content preview, submitter avatar, reputation score, submission date, and approve/reject buttons.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
