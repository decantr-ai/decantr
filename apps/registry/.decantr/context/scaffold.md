# Scaffold: registry-browser

**Blueprint:** registry-platform
**Theme:** luminarum
**Personality:** Vibrant design intelligence registry. Warm coral and amber accents on a rich dark canvas (or crisp warm-white in light mode). Content cards are the hero — outlined with colored type borders, hovering with purpose. Search is instant and faceted. Publishing feels like sharing art. The Decantr dogfood app — built with its own system, proudly showing what the platform produces. Think Figma Community meets shadcn/ui registry.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Welcoming and developer-friendly. Uses design-system terminology naturally. Celebrates community contributions.
**CTA verbs:** Browse, Publish, Install, Preview, Fork, Explore
**Avoid:** Submit, Click here, Please enter, Buy now, Amazing
**Empty states:** Encouraging and constructive. Empty content list links to publishing guide. No results suggests broadening filters or browsing popular items.
**Errors:** Precise with error codes and affected resource IDs. Validation errors quote the failing field.
**Loading states:** Content card skeletons with type-colored top borders. Registry stats use counter animations. Search results stream in as they resolve.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** registry-browser + user-dashboard + admin-moderation + auth-flow

### Zones

**Public** — top-nav-main shell
  Archetypes: registry-browser
  Purpose: Public content browsing for a design registry. Search, filter, and explore patterns, themes, blueprints, archetypes, and shells.
  Features: search, pagination

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — sidebar-main shell
  Archetypes: user-dashboard
  Purpose: Authenticated user area with content management, API key management, account settings, and activity overview.
  Features: auth, api-keys

**App (auxiliary)** — sidebar-main shell
  Archetypes: admin-moderation
  Purpose: Admin moderation queue for reviewing, approving, and rejecting community-submitted registry content.
  Features: auth, admin

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
| registry-browser | public | top-nav-main | homepage, browse, browse-type, detail, profile | search, pagination |
| user-dashboard | primary | sidebar-main | overview, content, content-new, api-keys, settings, billing, team, governance, private-registry | auth, api-keys |
| admin-moderation | auxiliary | sidebar-main | moderation-queue, commercial-reports, organizations, organization-detail, moderation-detail | auth, admin |
| auth-flow | gateway | centered | login, register, forgot-password | auth |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | registry-browser | homepage |
| /login | auth-flow | login |
| /browse | registry-browser | browse |
| /dashboard | user-dashboard | overview |
| /browse/:type | registry-browser | browse-type |
| /dashboard/team | user-dashboard | team |
| /dashboard/governance | user-dashboard | governance |
| /dashboard/private-registry | user-dashboard | private-registry |
| /admin/moderation | admin-moderation | moderation-queue |
| /admin/reports | admin-moderation | commercial-reports |
| /admin/organizations | admin-moderation | organizations |
| /admin/organizations/:slug | admin-moderation | organization-detail |
| /dashboard/billing | user-dashboard | billing |
| /dashboard/content | user-dashboard | content |
| /profile/:username | registry-browser | profile |
| /dashboard/api-keys | user-dashboard | api-keys |
| /dashboard/settings | user-dashboard | settings |
| /dashboard/content/new | user-dashboard | content-new |
| /:type/:namespace/:slug | registry-browser | detail |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-registry-browser.md
- .decantr/context/section-user-dashboard.md
- .decantr/context/section-admin-moderation.md
- .decantr/context/section-auth-flow.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| blueprint-launch-hero | registry-browser/homepage, registry-browser/detail |
| search-filter-bar | registry-browser/homepage, registry-browser/browse, registry-browser/browse-type, user-dashboard/private-registry, admin-moderation/moderation-queue, admin-moderation/organizations |
| content-card-grid | registry-browser/browse, registry-browser/browse-type, registry-browser/profile, user-dashboard/content, user-dashboard/governance, user-dashboard/private-registry, admin-moderation/organizations, admin-moderation/organization-detail |
| json-viewer | registry-browser/detail, user-dashboard/content-new, admin-moderation/moderation-detail |
| detail-header | registry-browser/profile, admin-moderation/organization-detail |
| activity-feed | registry-browser/profile, user-dashboard/overview, user-dashboard/governance, admin-moderation/commercial-reports, admin-moderation/organizations, admin-moderation/organization-detail |
| kpi-grid | user-dashboard/overview, user-dashboard/billing, user-dashboard/team, user-dashboard/governance, admin-moderation/commercial-reports, admin-moderation/organization-detail |
| moderation-queue-item | admin-moderation/moderation-queue, admin-moderation/moderation-detail |
| auth-form | auth-flow/login, auth-flow/register, auth-flow/forgot-password |

## SEO Hints

**Schema.org types:** WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Requirement: implement a real keyboard-triggered command palette, not just placeholder UI text.
- Hotkeys: 3 configured
  - `g b`: Browse Registry — /browse
  - `g d`: Dashboard — /dashboard
  - `g s`: Settings — /dashboard/settings
- Requirement: implement these bindings as real keyboard shortcuts, not as decorative text.
- Presentation rule: do not append hotkey text to persistent nav labels, breadcrumbs, or page titles unless the shell or route contract explicitly requests visible shortcut hints.
