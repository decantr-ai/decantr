# Scaffold: cloud-marketing

**Blueprint:** cloud-platform
**Theme:** launchpad
**Personality:** Enterprise-grade cloud console built for reliability and scale. Clean, systematic layout with a left sidebar for service navigation. Status indicators use semantic colors — green healthy, amber degraded, red incident. Deploy logs stream in monospace with ANSI color support. Usage charts are functional, not decorative. Dense data tables with sort, filter, and bulk actions. Think AWS Console meets Vercel — powerful but approachable. Every view should feel like a control plane.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Technical and trustworthy. Speaks to infrastructure engineers and DevOps teams. Precise about states and operations.
**CTA verbs:** Deploy, Create, Scale, Monitor, Configure, Migrate
**Avoid:** Submit, Click here, Please enter, Buy, Amazing
**Empty states:** Helpful and onboarding-oriented. An empty project list should walk users through creating their first app with clear steps.
**Errors:** Precise and diagnostic. Include request IDs, timestamps, and affected resources. Link to status page for platform issues.
**Loading states:** Resource list skeletons with status dot placeholders. Deploy logs show a blinking cursor. Metrics charts show axis labels while data loads.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** cloud-marketing + cloud-infrastructure + billing + auth-flow + settings

### Zones

**Public** — full-bleed shell
  Archetypes: cloud-marketing
  Purpose: Marketing landing page for cloud and infrastructure platforms

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — sidebar-main shell
  Archetypes: cloud-infrastructure
  Purpose: Infrastructure management pages: apps, deployments, teams, services, tokens, usage monitoring, status, and compliance
  Features: realtime-data, team-management

**App (auxiliary)** — sidebar-main shell
  Archetypes: billing, settings
  Purpose: Billing, payment, and subscription management Application settings and preferences page
  Features: billing

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
| cloud-marketing | public | full-bleed | home | none |
| cloud-infrastructure | primary | sidebar-main | apps, app-detail, team, activity, services, tokens, usage, status, compliance | realtime-data, team-management |
| billing | auxiliary | sidebar-main | billing | billing |
| auth-flow | gateway | centered | login, register | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | cloud-marketing | home |
| /apps | cloud-infrastructure | apps |
| /team | cloud-infrastructure | team |
| /login | auth-flow | login |
| /usage | cloud-infrastructure | usage |
| /status | cloud-infrastructure | status |
| /tokens | cloud-infrastructure | tokens |
| /billing | billing | billing |
| /activity | cloud-infrastructure | activity |
| /apps/:id | cloud-infrastructure | app-detail |
| /register | auth-flow | register |
| /services | cloud-infrastructure | services |
| /settings | settings | settings |
| /compliance | cloud-infrastructure | compliance |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-cloud-marketing.md
- .decantr/context/section-cloud-infrastructure.md
- .decantr/context/section-billing.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| card-grid | cloud-marketing/home, cloud-marketing/home, cloud-infrastructure/apps, cloud-infrastructure/team |
| filter-bar | cloud-infrastructure/apps, cloud-infrastructure/team, cloud-infrastructure/activity, cloud-infrastructure/tokens |
| activity-feed | cloud-infrastructure/apps, cloud-infrastructure/activity |
| kpi-grid | cloud-infrastructure/app-detail, billing/billing |
| data-table | cloud-infrastructure/app-detail, cloud-infrastructure/tokens, cloud-infrastructure/compliance |
| auth-form | auth-flow/login, auth-flow/register |

## SEO Hints

**Schema.org types:** WebApplication, SoftwareApplication
**Meta priorities:** description, og:title, og:description

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
