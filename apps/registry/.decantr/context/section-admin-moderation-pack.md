# Section Pack

**Objective:** Implement the admin-moderation section using the compiled sidebar-main shell contract.
**Target:** nextjs (nextjs)
**Scope:** pages=moderation-queue, commercial-reports, organizations, organization-detail | patterns=search-filter-bar, moderation-queue-item, kpi-grid, activity-feed, content-card-grid, detail-header

## Section Contract
- Section: admin-moderation
- Role: auxiliary
- Shell: sidebar-main
- Theme: luminarum (dark)
- Features: auth, admin
- Description: Admin moderation queue for reviewing, approving, and rejecting community-submitted registry content.

## Section Routes
- /admin/moderation -> admin-moderation/moderation-queue @ sidebar-main [search-filter-bar, moderation-queue-item]
- /admin/reports -> admin-moderation/commercial-reports @ sidebar-main [kpi-grid, activity-feed]
- /admin/organizations -> admin-moderation/organizations @ sidebar-main [search-filter-bar, content-card-grid, activity-feed]
- /admin/organizations/:slug -> admin-moderation/organization-detail @ sidebar-main [detail-header, kpi-grid, activity-feed, content-card-grid]

## Theme Decorators

Theme `luminarum` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

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
- kpi-grid
- activity-feed
- content-card-grid
- detail-header

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
