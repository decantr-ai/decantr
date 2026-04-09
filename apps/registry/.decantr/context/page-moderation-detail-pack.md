# Page Pack

**Objective:** Implement the moderation-detail route using the compiled page contract.
**Target:** nextjs (nextjs)
**Scope:** pages=moderation-detail | patterns=content-detail-hero, json-viewer, moderation-queue-item

## Page Contract
- Page: moderation-detail
- Path: /moderation-detail/:id
- Shell: sidebar-main
- Section: admin-moderation (auxiliary)
- Theme: luminarum (dark)
- Features: auth, admin
- Surface: _flex _col _gap_gap4 _p4 _overflow[auto] _flex1

## Page Patterns
- content-detail-hero -> content-detail-hero [stack | standard]
- json-viewer -> json-viewer [stack | collapsible]
- moderation-queue-item -> moderation-queue-item [stack | standard]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- moderation-detail
- sidebar-main
- admin-moderation
- auxiliary
- luminarum
- dark
- auth
- admin
- content-detail-hero
- stack
- json-viewer
- moderation-queue-item

## Success Checks
- The page keeps the compiled route, shell, and section contract intact. [error]
- The page preserves its primary compiled patterns instead of drifting into unrelated layouts. [error]
- Any declared wiring signals remain coherent with the rendered page structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
