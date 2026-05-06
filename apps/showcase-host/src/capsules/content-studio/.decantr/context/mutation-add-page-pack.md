# Mutation Pack

**Objective:** Execute the add-page workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=drafts, editor, published, login, register, forgot-password, settings | patterns=data-table, doc-editor, auth-form, form-sections

## Mutation Contract
- Operation: add-page
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
- Declare the new page in the essence before generating code.
- Refresh Decantr context so section and page packs include the new route.
- Read the relevant section pack and new page pack before implementation.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- add-page
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
- New pages are declared in the essence before any code generation begins. [error]
- New routes inherit an existing shell and section contract unless the essence changes first. [error]
- Refresh compiled packs after the mutation so downstream tasks read current topology. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
