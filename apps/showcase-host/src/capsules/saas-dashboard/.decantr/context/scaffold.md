# Scaffold: saas-overview

**Blueprint:** saas-dashboard
**Theme:** auradecantism
**Personality:** Clean, data-driven SaaS dashboard. Neutral tones with a single accent color for CTAs and active states. Card-based layout with consistent spacing. Charts use smooth gradients. KPIs are prominent with trend indicators. Team management is clear with role badges. Usage meters show consumption at a glance. Notification center keeps users informed. Audit trail for compliance. Lucide icons. Everything scannable in 3 seconds.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Clear and professional. Data-forward.
**CTA verbs:** Analyze, Configure, Invite, Upgrade, Export, Monitor
**Avoid:** Submit, Click here, Please enter, Dear user
**Empty states:** Friendly and action-oriented. Explain what will appear here and provide a single clear next step.
**Errors:** Direct and helpful. State what went wrong and suggest a fix. No blame language.
**Loading states:** Show skeleton placeholders matching the content shape. No spinner text — let the layout speak.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** saas-overview + team-workspace + saas-analytics + saas-billing-v2 + marketing-saas-v2 + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-saas-v2
  Purpose: Public marketing landing page for SaaS products with hero, features, pricing, testimonials, and conversion CTAs.
  Features: marketing, seo, conversion

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: saas-overview
  Purpose: KPI dashboard overview with activity feed, chart grid, and quick actions. The primary landing surface for SaaS dashboard users.
  Features: real-time, charts, kpi, activity-feed

**App (auxiliary)** — sidebar-main shell
  Archetypes: team-workspace, saas-analytics, saas-billing-v2, settings-full
  Purpose: Team member management and permission configuration. Data table of members with role badges and a permission matrix for fine-grained access control. Deep analytics with charts, sparklines, and usage meters. Detailed breakdowns of product metrics, user behavior, and resource consumption. Billing management with plan selection, usage meters, invoice history, and payment management for SaaS products. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: invite, roles, permissions, search, charts, export, date-range, real-time, billing, invoices, usage-tracking, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| saas-overview | primary | sidebar-main | dashboard, quick-actions | real-time, charts, kpi, activity-feed |
| team-workspace | auxiliary | sidebar-main | team, permissions | invite, roles, permissions, search |
| saas-analytics | auxiliary | sidebar-main | analytics | charts, export, date-range, real-time |
| saas-billing-v2 | auxiliary | sidebar-main | billing, invoices | billing, invoices, usage-tracking |
| marketing-saas-v2 | public | top-nav-footer | home | marketing, seo, conversion |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-saas-v2 | home |
| /team | team-workspace | team |
| /login | auth-full | login |
| /billing | saas-billing-v2 | billing |
| /register | auth-full | register |
| /analytics | saas-analytics | analytics |
| /dashboard | saas-overview | dashboard |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /billing/invoices | saas-billing-v2 | invoices |
| /settings/profile | settings-full | profile |
| /team/permissions | team-workspace | permissions |
| /dashboard/actions | saas-overview | quick-actions |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-saas-overview.md
- .decantr/context/section-team-workspace.md
- .decantr/context/section-saas-analytics.md
- .decantr/context/section-saas-billing-v2.md
- .decantr/context/section-marketing-saas-v2.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
