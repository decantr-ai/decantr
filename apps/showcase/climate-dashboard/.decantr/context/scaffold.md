# Scaffold: emissions-dashboard

**Blueprint:** climate-dashboard
**Theme:** earth
**Personality:** Carbon accounting and emissions dashboard with organic earth-tone palette. Sankey diagrams show emissions flowing from sources through Scope 1/2/3 categories. Supply chain maps pin suppliers with tier rings showing Scope 3 complexity. Target progress rings track reduction commitments against science-based targets. Regulatory reporting for CSRD, SEC climate rules, Scope 3 disclosure. Lucide icons. Grounded.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Factual and urgent. Speaks to sustainability officers and compliance teams.
**CTA verbs:** Measure, Report, Reduce, Offset, Disclose, Verify
**Avoid:** Manage, Track
**Empty states:** No emissions data yet. Connect your first supplier to begin.
**Errors:** CSRD disclosure incomplete — missing Scope 3 category {n}.
**Loading states:** Calculating emissions... {percent}%

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** emissions-dashboard + supply-chain + offset-marketplace + reporting-center + marketing-climate + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-climate
  Purpose: Public marketing landing page for a climate dashboard product with vision hero, feature highlights, testimonials, and primary CTA.
  Features: marketing

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: emissions-dashboard
  Purpose: Climate emissions tracking dashboard with scope 1/2/3 breakdown, Sankey flows, and reduction target progress rings.
  Features: emissions-tracking, scope-123, targets

**App (auxiliary)** — sidebar-main shell
  Archetypes: supply-chain, offset-marketplace, reporting-center, settings-full
  Purpose: Supplier directory and per-supplier emissions profile with tier tracking and geographic mapping for supply chain climate programs. Carbon offset marketplace for browsing verified projects, reviewing details, and completing offset purchases with cart-based checkout. Climate disclosure reporting workspace for CSRD and compliance reports with list browsing and guided report building. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: supply-chain, tier-tracking, offsets, marketplace, purchasing, reporting, csrd, compliance, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| emissions-dashboard | primary | sidebar-main | overview, scope-detail, targets | emissions-tracking, scope-123, targets |
| supply-chain | auxiliary | sidebar-main | suppliers, supplier-detail | supply-chain, tier-tracking |
| offset-marketplace | auxiliary | sidebar-main | marketplace, project-detail, checkout | offsets, marketplace, purchasing |
| reporting-center | auxiliary | sidebar-main | reports, report-builder | reporting, csrd, compliance |
| marketing-climate | public | top-nav-footer | home | marketing |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-climate | home |
| /login | auth-full | login |
| /offsets | offset-marketplace | marketplace |
| /reports | reporting-center | reports |
| /register | auth-full | register |
| /emissions | emissions-dashboard | overview |
| /mfa-setup | auth-full | mfa-setup |
| /suppliers | supply-chain | suppliers |
| /mfa-verify | auth-full | mfa-verify |
| /offsets/:id | offset-marketplace | project-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /suppliers/:id | supply-chain | supplier-detail |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /reports/builder | reporting-center | report-builder |
| /settings/danger | settings-full | danger |
| /offsets/checkout | offset-marketplace | checkout |
| /settings/profile | settings-full | profile |
| /emissions/targets | emissions-dashboard | targets |
| /settings/security | settings-full | security |
| /emissions/scope/:id | emissions-dashboard | scope-detail |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-emissions-dashboard.md
- .decantr/context/section-supply-chain.md
- .decantr/context/section-offset-marketplace.md
- .decantr/context/section-reporting-center.md
- .decantr/context/section-marketing-climate.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| kpi-grid | emissions-dashboard/overview, supply-chain/supplier-detail |
| target-progress-ring | emissions-dashboard/overview, emissions-dashboard/targets |
| chart-grid | emissions-dashboard/scope-detail, emissions-dashboard/targets, supply-chain/supplier-detail, reporting-center/report-builder |
| data-table | supply-chain/suppliers, reporting-center/reports |
| detail-header | supply-chain/supplier-detail, offset-marketplace/project-detail |
| card-grid | offset-marketplace/marketplace, offset-marketplace/project-detail |
| offset-cart | offset-marketplace/marketplace, offset-marketplace/checkout |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
