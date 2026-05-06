# Page Pack

**Objective:** Implement the moderation-queue route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=moderation-queue | patterns=search-filter-bar, moderation-queue-item

## Page Contract
- Page: moderation-queue
- Path: /admin/moderation
- Shell: sidebar-main
- Section: admin-moderation (auxiliary)
- Theme: luminarum (dark)
- Features: auth, admin
- Surface: _flex _col _gap4

## Page Patterns
- search-filter-bar -> search-filter-bar [stack | standard]
  > Full public registry filter bar with search, type tabs, source filter, sort, and result count.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] inline-edit
  - [ ] animate-on-mount
  - [ ] keyboard-navigation
  - [ ] hover-reveal
- moderation-queue-item -> moderation-queue-item [stack | standard]
  > Full moderation card with content preview, submitter avatar, reputation score, submission date, and approve/reject buttons.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
