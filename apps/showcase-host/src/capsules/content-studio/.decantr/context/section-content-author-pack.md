# Section Pack

**Objective:** Implement the content-author section using the compiled sidebar-main shell contract.
**Target:** react-vite (react)
**Scope:** pages=drafts, editor, published | patterns=data-table, doc-editor

## Section Contract
- Section: content-author
- Role: auxiliary
- Shell: sidebar-main
- Theme: editorial (light)
- Features: editing, publishing, auto-save, markdown
- Description: Author and editor dashboard for managing drafts, editing articles, and viewing published content. Functional workspace focused on writing productivity.

## Section Routes
- /drafts -> content-author/drafts @ sidebar-main [data-table]
- /drafts/:id -> content-author/editor @ sidebar-main [doc-editor]
- /published -> content-author/published @ sidebar-main [data-table]

## Theme Decorators

Theme `editorial` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- content-author
- auxiliary
- sidebar-main
- editorial
- light
- editing
- publishing
- auto-save
- markdown
- data-table
- doc-editor

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
