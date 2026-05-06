# Scaffold: content-author

**Blueprint:** content-studio
**Theme:** editorial
**Personality:** Focused editorial workspace for writers and editors. The interface should feel quiet, efficient, and typographically disciplined. Writing and publishing tools are present, but the chrome stays secondary to the article work itself. Think editorial CMS rather than noisy analytics dashboard.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Clear, editorial, and operational.
**CTA verbs:** Write, Edit, Publish, Review, Update
**Avoid:** Submit, Click here, Buy now
**Empty states:** Supportive and work-focused. Empty drafts should encourage the writer to start a new piece, not feel like a blank admin panel.
**Errors:** Brief and practical. Explain what failed and what the editor should do next.
**Loading states:** Quiet table and editor skeletons. No flashy loading motion.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** content-author + auth-flow + settings

### Zones

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App (auxiliary)** — sidebar-main shell
  Archetypes: content-author, settings
  Purpose: Author and editor dashboard for managing drafts, editing articles, and viewing published content. Functional workspace focused on writing productivity. Application settings and preferences page
  Features: editing, publishing, auto-save, markdown

### Zone Transitions

  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)

### Default Entry Points

  Anonymous users enter: gateway
  Authenticated users enter: first section
  Auth redirect target: first section


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| content-author | auxiliary | sidebar-main | drafts, editor, published | editing, publishing, auto-save, markdown |
| auth-flow | gateway | centered | login, register, forgot-password | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| /login | auth-flow | login |
| /register | auth-flow | register |
| /forgot-password | auth-flow | forgot-password |
| /drafts | content-author | drafts |
| /drafts/:id | content-author | editor |
| /published | content-author | published |
| /settings | settings | settings |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-content-author.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| data-table | content-author/drafts, content-author/published |
| auth-form | auth-flow/login, auth-flow/register, auth-flow/forgot-password |

## SEO Hints

**Schema.org types:** WebApplication
**Meta priorities:** description

## Navigation

- Command palette: enabled
- Requirement: implement a real keyboard-triggered command palette, not just placeholder UI text.
- Hotkeys: 3 configured
  - `g d`: Go to Drafts — /drafts
  - `g p`: Go to Published — /published
  - `g s`: Go to Settings — /settings
- Requirement: implement these bindings as real keyboard shortcuts, not as decorative text.
- Presentation rule: do not append hotkey text to persistent nav labels, breadcrumbs, or page titles unless the shell or route contract explicitly requests visible shortcut hints.
