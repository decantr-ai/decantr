# Scaffold: engagement-hub

**Blueprint:** civic-platform
**Theme:** government
**Personality:** Accessible civic engagement platform built for trust and clarity. High-contrast government-standard typography with generous spacing. Budget Sankey flows show taxpayer dollars from source to category to line item. Petition cards display signature progress prominently. Council meeting archives have full video with synchronized transcripts. WCAG AAA compliance throughout. Lucide icons. Accessible.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Clear and inclusive. Speaks to all citizens regardless of technical literacy.
**CTA verbs:** Vote, Sign, Comment, Attend, Request, Track
**Avoid:** Submit, Process, User
**Empty states:** No active petitions in your district. Be the first to start one.
**Errors:** Your session expired. Sign in again to continue.
**Loading states:** Loading your ballot...

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** engagement-hub + budget-transparency + meeting-archive + service-requests + marketing-civic + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-civic
  Purpose: Public marketing surface for civic engagement platforms with landing and about pages. Positions the platform to municipal buyers and citizen communities.
  Features: marketing

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — top-nav-main shell
  Archetypes: engagement-hub
  Purpose: Citizen engagement hub with dashboards, petitions, voting, and threaded comments. Primary entry point for civic participation platforms enabling residents to track and influence local decisions.
  Features: petitions, voting, comments

**App (auxiliary)** — sidebar-main shell
  Archetypes: budget-transparency, meeting-archive, service-requests, settings-full
  Purpose: Public budget transparency dashboard with sankey visualizations, category drill-down, and expenditure tables. Exposes municipal budget flows to citizens in navigable detail. Public archive of government meetings with searchable records, calendar browsing, and per-meeting timelines of votes and agenda items. Provides citizens long-term access to council and committee proceedings. Citizen service request system with submission forms, map pin placement, kanban tracking, and status timelines. Enables residents to report issues and track resolution. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: budget-transparency, drill-down, meetings, archives, service-requests, mapping, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| engagement-hub | primary | top-nav-main | home, petitions, petition-detail | petitions, voting, comments |
| budget-transparency | auxiliary | sidebar-main | budget, budget-category | budget-transparency, drill-down |
| meeting-archive | auxiliary | sidebar-main | meetings, meeting-detail | meetings, archives |
| service-requests | auxiliary | sidebar-main | requests, new-request, request-detail | service-requests, mapping |
| marketing-civic | public | top-nav-footer | home, about | marketing |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | top-nav-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-civic | home |
| /about | marketing-civic | about |
| /login | auth-full | login |
| /budget | budget-transparency | budget |
| /engage | engagement-hub | home |
| /meetings | meeting-archive | meetings |
| /register | auth-full | register |
| /requests | service-requests | requests |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /meetings/:id | meeting-archive | meeting-detail |
| /phone-verify | auth-full | phone-verify |
| /requests/:id | service-requests | request-detail |
| /requests/new | service-requests | new-request |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /budget/:category | budget-transparency | budget-category |
| /engage/petitions | engagement-hub | petitions |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /engage/petitions/:id | engagement-hub | petition-detail |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-engagement-hub.md
- .decantr/context/section-budget-transparency.md
- .decantr/context/section-meeting-archive.md
- .decantr/context/section-service-requests.md
- .decantr/context/section-marketing-civic.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** GovernmentOrganization, WebSite
**Meta priorities:** description, og:image
