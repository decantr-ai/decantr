# Scaffold Pack

**Objective:** Scaffold the editorial app shell and declared routes.
**Target:** react-vite (react)
**Scope:** pages=drafts, editor, published, login, register, forgot-password, settings | patterns=data-table, doc-editor, auth-form, form-sections

## Scaffold Contract
- Shell: sidebar-main
- Shells: sidebar-main (primary), centered
- Theme: editorial (light)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: editing, publishing, auto-save, markdown, auth, theme-toggle
- Navigation:
  - command palette required
  - Hotkeys:
    - g d: Go to Drafts — /drafts
    - g p: Go to Published — /published
    - g s: Go to Settings — /settings

## Route Plan
- /drafts -> content-author/drafts @ sidebar-main [data-table]
- /drafts/:id -> content-author/editor @ sidebar-main [doc-editor]
- /published -> content-author/published @ sidebar-main [data-table]
- /login -> auth-flow/login @ centered [auth-form]
- /register -> auth-flow/register @ centered [auth-form]
- /forgot-password -> auth-flow/forgot-password @ centered [auth-form]
- /settings -> settings/settings @ sidebar-main [form-sections]

## Required Theme Decorators (editorial)

These classes carry the active theme's visual identity. Tokens alone give bones; decorators give personality. Generated source MUST apply these across all sections — without them, every page reads as "themed colors only" with no theme character. Section packs reference this table; the contract is project-wide.

| Class | Intent | Apply to |
|-------|--------|----------|
| `.editorial-card` | Use for article cards and content containers. Minimal styling lets typography and imagery do all the visual work. | Article cards, Content containers, Feature summaries, Editorial layouts |
| `.editorial-pullquote` | Use to highlight key quotes and important passages. The left border in red creates dramatic emphasis within long-form content. | Pull quotes, Key excerpts, Highlighted passages, Testimonials |
| `.editorial-divider` | Use between major content sections. Generous vertical spacing creates the dramatic pacing of a print magazine layout. | Section dividers, Article breaks, Content section separators |
| `.editorial-caption` | Use for image captions, bylines, dates, and metadata labels. Uppercase tracking creates the classic editorial meta-text treatment. | Image captions, Bylines, Date labels, Category labels |
| `.editorial-dropcap` | Use at the start of article sections for dramatic editorial opening. The oversized letter signals a new section or chapter. | Article openers, Chapter starts, Section introductions |

## Required Setup
- Treat the declared routes as the topology source of truth.
- Preserve the resolved theme and shell contract unless the task explicitly mutates them.

## Allowed Vocabulary
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
- Routes and page IDs match the compiled topology. [error]
- The declared shell contract is preserved unless the task explicitly mutates it. [error]
- Theme identity and mode remain consistent across scaffolded routes. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
