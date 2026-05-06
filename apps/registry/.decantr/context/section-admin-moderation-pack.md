# Section Pack

**Objective:** Implement the admin-moderation section using the compiled sidebar-main shell contract.
**Target:** nextjs (nextjs)
**Scope:** pages=moderation-queue, moderation-detail | patterns=search-filter-bar, moderation-queue-item, content-detail-hero, json-viewer

## Section Contract
- Section: admin-moderation
- Role: auxiliary
- Shell: sidebar-main
- Theme: luminarum (dark)
- Features: auth, admin
- Description: Admin moderation queue for reviewing, approving, and rejecting community-submitted registry content.

## Section Routes
- /moderation-queue -> moderation-queue [search-filter-bar, moderation-queue-item]
- /moderation-detail/:id -> moderation-detail [content-detail-hero, json-viewer, moderation-queue-item]

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- admin-moderation
- auxiliary
- sidebar-main
- luminarum
- dark
- auth
- admin
- search-filter-bar
- moderation-queue-item
- content-detail-hero
- json-viewer

## Success Checks
- Section pages and routes remain coherent with the compiled topology. [error]
- The section shell contract stays consistent across its routes. [error]
- Primary section patterns are represented without adding off-contract filler sections. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
