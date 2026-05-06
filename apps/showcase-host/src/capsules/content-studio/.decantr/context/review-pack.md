# Review Pack

**Objective:** Review generated output against the compiled Decantr contract.
**Target:** react-vite (react)
**Scope:** pages=drafts, editor, published, login, register, forgot-password, settings | patterns=data-table, doc-editor, auth-form, form-sections

## Review Contract
- Review Type: app
- Shell: sidebar-main
- Theme: editorial (light)
- Routing: history
- Features: editing, publishing, auto-save, markdown, auth, theme-toggle

## Review Topology
- /drafts -> content-author/drafts @ sidebar-main [data-table]
- /drafts/:id -> content-author/editor @ sidebar-main [doc-editor]
- /published -> content-author/published @ sidebar-main [data-table]
- /login -> auth-flow/login @ centered [auth-form]
- /register -> auth-flow/register @ centered [auth-form]
- /forgot-password -> auth-flow/forgot-password @ centered [auth-form]
- /settings -> settings/settings @ sidebar-main [form-sections]

## Focus Areas
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Review Workflow
- Read the scaffold pack and page packs before evaluating generated code.
- Compare findings against the compiled route, shell, and theme contract first.
- Escalate contract drift into essence updates when the requested output intentionally changes topology or theme identity.

## Required Setup
- Read the compiled scaffold and route packs before reviewing code.
- Use concrete evidence from the workspace instead of purely stylistic intuition.

## Allowed Vocabulary
- app
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
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Success Checks
- Review findings should use the compiled route, shell, and theme contract as the baseline. [error]
- Each critique finding should cite concrete evidence from the generated workspace. [error]
- Suggested fixes should point back to code changes or essence updates when contract drift exists. [warn]

## Anti-Patterns
- Avoid inline style literals as the primary styling path.: Move visual styling into tokens.css and treatments.css instead of component-local style objects.
- Avoid hardcoded color literals.: Use CSS variables and theme decorators instead of hex, rgb, or hsl values.
- Avoid utility-framework leakage as the primary design language.: Prefer compiled Decantr treatments and contract vocabulary over ad hoc utility class stacks.

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
