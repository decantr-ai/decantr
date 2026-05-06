# Mutation Pack

**Objective:** Execute the modify workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=drafts, editor, published, login, register, forgot-password, settings | patterns=data-table, doc-editor, auth-form, form-sections

## Mutation Contract
- Operation: modify
- Shell: sidebar-main
- Theme: editorial (light)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: editing, publishing, auto-save, markdown, auth, theme-toggle

## Route Topology
- /drafts -> content-author/drafts @ sidebar-main [data-table]
- /drafts/:id -> content-author/editor @ sidebar-main [doc-editor]
- /published -> content-author/published @ sidebar-main [data-table]
- /login -> auth-flow/login @ centered [auth-form]
- /register -> auth-flow/register @ centered [auth-form]
- /forgot-password -> auth-flow/forgot-password @ centered [auth-form]
- /settings -> settings/settings @ sidebar-main [form-sections]

## Workflow
- Read the page pack for the route you are modifying first.
- Stop and update the essence before changing route, shell, or pattern contracts.
- Validate and check drift after code changes complete.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- modify
- sidebar-main
- editorial
- light
- editing
- publishing
- auto-save
- markdown
- auth
- theme-toggle
- data-table
- doc-editor
- auth-form
- form-sections

## Success Checks
- Modified routes remain coherent with the compiled topology unless the essence changes first. [error]
- Theme, shell, and page identity stay aligned with the current contract during edits. [error]
- Route-local edits should start from the compiled page pack rather than improvised structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
