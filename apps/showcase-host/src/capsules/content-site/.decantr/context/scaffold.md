# Scaffold: content-reader

**Blueprint:** content-site
**Theme:** editorial
**Personality:** Reading-first content site optimized for long-form consumption. Generous line-height, comfortable measure (65-75 characters), and a clear typographic hierarchy that makes scanning effortless. Article cards feature bold headlines with subtle metadata. The reading view strips away distractions — just text, well-set. Author dashboard is functional and focused. Newsletter archive is clean and browsable. Think Substack meets Medium's typography. Lucide icons. Dark mode available for night reading.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Clear and editorial. Respects the reader's time.
**CTA verbs:** Read, Subscribe, Browse, Share, Bookmark, Explore
**Avoid:** Submit, Click here, Please enter, Buy now
**Empty states:** Editorially appropriate. An empty category should suggest related topics or popular articles to keep readers engaged.
**Errors:** Minimal and unobtrusive. A 404 should suggest similar articles. Search with no results should offer alternative queries.
**Loading states:** Article card skeletons with headline and excerpt placeholders. Subtle fade-in for content blocks. Reading experience never shows spinners.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** content-reader + content-author + content-newsletter + marketing-content + auth-flow + settings

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-content
  Purpose: Marketing landing page for a content site with hero, feature highlights, testimonials, and call-to-action sections. Public-facing entry point designed to attract readers and subscribers.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — top-nav-main shell
  Archetypes: content-reader
  Purpose: Article reading experience with browsable article listings, full article detail view, and category navigation. Optimized for long-form consumption with generous typography and effortless scanning.
  Features: search, reading, rss, bookmarks

**App (auxiliary)** — sidebar-main shell
  Archetypes: content-author, content-newsletter, settings
  Purpose: Author and editor dashboard for managing drafts, editing articles, and viewing published content. Functional workspace focused on writing productivity. Newsletter signup and archive experience. Landing-style subscribe page with hero and contact form, plus a browsable archive of past newsletters. Application settings and preferences page
  Features: editing, publishing, auto-save, markdown, subscription, email

### Zone Transitions

  Public → Gateway: conversion (authentication)
  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)
  App → Public: navigation (external)

### Default Entry Points

  Anonymous users enter: public zone
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| content-reader | primary | top-nav-main | articles, article-detail, categories | search, reading, rss, bookmarks |
| content-author | auxiliary | sidebar-main | drafts, editor, published | editing, publishing, auto-save, markdown |
| content-newsletter | auxiliary | minimal-header | subscribe, archive | subscription, email |
| marketing-content | public | top-nav-footer | home | marketing, seo |
| auth-flow | gateway | centered | login, register, forgot-password | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-content | home |
| /login | auth-flow | login |
| /drafts | content-author | drafts |
| /articles | content-reader | articles |
| /register | auth-flow | register |
| /settings | settings | settings |
| /published | content-author | published |
| /subscribe | content-newsletter | subscribe |
| /categories | content-reader | categories |
| /drafts/:id | content-author | editor |
| /newsletter | content-newsletter | archive |
| /articles/:id | content-reader | article-detail |
| /forgot-password | auth-flow | forgot-password |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-content-reader.md
- .decantr/context/section-content-author.md
- .decantr/context/section-content-newsletter.md
- .decantr/context/section-marketing-content.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| auth-form | auth-flow/login, auth-flow/register, auth-flow/forgot-password |

## SEO Hints

**Schema.org types:** WebSite, Blog, Article
**Meta priorities:** description, og:title, og:image

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
