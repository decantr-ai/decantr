# Scaffold: doc-browser

**Blueprint:** knowledge-base
**Theme:** paper
**Personality:** Warm, reading-optimized documentation platform. Paper-like backgrounds with comfortable typography (65-75 character measure). AI-powered search with highlighted excerpts. Navigation tree on the left, content center, table-of-contents right. Feels like a well-designed textbook. Changelog entries feel celebratory. API reference is interactive. Lucide icons. Light mode default.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Helpful and clear. Teacher energy.
**CTA verbs:** Learn, Explore, Try, Read, Search, Contribute
**Avoid:** Submit, Click here, Please enter, Buy now, Obviously
**Empty states:** Welcoming and educational. Empty search results suggest related topics. New sections invite contributions. Warm and encouraging.
**Errors:** Gentle and helpful. Suggest alternative search terms or related pages. Never blame the user.
**Loading states:** Content skeleton with paragraph-shaped placeholders. Search results show shimmer cards. Table of contents loads progressively.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** doc-browser + search-hub + changelog-center + api-reference + marketing-docs + auth-flow + settings

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-docs
  Purpose: Marketing landing page for a documentation platform. Features a search hero, feature highlights, and calls to action driving visitors into the knowledge base.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — three-column-browser shell
  Archetypes: doc-browser
  Purpose: Full documentation reading experience with navigable doc tree, content pane, and table of contents. Core interface for knowledge base platforms.
  Features: docs, navigation, table-of-contents, breadcrumbs

**App (auxiliary)** — sidebar-main shell
  Archetypes: search-hub, changelog-center, api-reference, settings
  Purpose: AI-powered search interface with semantic results, filters, and highlighting. Provides intelligent search across knowledge base content. Versioned changelog with chronological release feed and individual release note pages. Tracks product evolution with migration guides and version diffs. Interactive API reference with endpoint browser, try-it-out console, and multi-language code snippets. Built for developer-facing knowledge bases. Application settings and preferences page
  Features: ai-search, semantic-search, highlighting, changelog, versions, migration-guides, api-docs, try-it-out, code-snippets

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
| doc-browser | primary | three-column-browser | docs, doc-page | docs, navigation, table-of-contents, breadcrumbs |
| search-hub | auxiliary | sidebar-main | search | ai-search, semantic-search, highlighting |
| changelog-center | auxiliary | top-nav-main | changelog, changelog-entry | changelog, versions, migration-guides |
| api-reference | auxiliary | three-column-browser | api-ref, api-ref-endpoint | api-docs, try-it-out, code-snippets |
| marketing-docs | public | top-nav-footer | home | marketing, seo |
| auth-flow | gateway | centered | login, register, forgot-password | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-docs | home |
| /api | api-reference | api-ref |
| /docs | doc-browser | docs |
| /login | auth-flow | login |
| /search | search-hub | search |
| /register | auth-flow | register |
| /settings | settings | settings |
| /changelog | changelog-center | changelog |
| /docs/:slug | doc-browser | doc-page |
| /api/:endpoint | api-reference | api-ref-endpoint |
| /changelog/:id | changelog-center | changelog-entry |
| /forgot-password | auth-flow | forgot-password |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-doc-browser.md
- .decantr/context/section-search-hub.md
- .decantr/context/section-changelog-center.md
- .decantr/context/section-api-reference.md
- .decantr/context/section-marketing-docs.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| command-palette | doc-browser/doc-page, search-hub/search |
| legal-prose | doc-browser/doc-page, changelog-center/changelog-entry |
| api-explorer | api-reference/api-ref, api-reference/api-ref-endpoint |
| auth-form | auth-flow/login, auth-flow/register, auth-flow/forgot-password |

## SEO Hints

**Schema.org types:** Organization, WebSite, Article, TechArticle
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
