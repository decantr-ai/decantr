# Scaffold: portfolio-overview

**Blueprint:** financial-dashboard
**Theme:** auradecantism
**Personality:** Authoritative financial dashboard built for trust and precision. Conservative color palette with green for gains, red for losses, neutral grays for context. Large numbers in monospace font dominate the viewport. Charts are clean with minimal gridlines. Sparklines inline in tables show trends at a glance. Budget views use clear bar comparisons. Transaction history is filterable and fast. Lucide icons. Every number precise to two decimal places.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Precise and trustworthy. Speaks to investors and financial planners.
**CTA verbs:** Invest, Track, Analyze, Budget, Compare, Export
**Avoid:** Submit, Click here, Please enter, Exciting opportunity
**Empty states:** Matter-of-fact. Explain what data will appear and how to configure the data source. No playful language.
**Errors:** Clear and specific. Include error codes where applicable. For data sync failures, show last-known-good timestamp.
**Loading states:** Skeleton rows in tables and chart outlines. Show stale data with a subtle 'Updating...' badge rather than blank screens.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** portfolio-overview + transaction-history + budget-planner + investment-tracker + marketing-finance + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-finance
  Purpose: Public marketing landing page for a financial dashboard product with hero, feature highlights, social proof, and conversion CTAs.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: portfolio-overview
  Purpose: Financial portfolio dashboard with net worth KPIs, allocation charts, and asset data tables. Primary view for wealth management and investment tracking.
  Features: analytics-state, data-export

**App (auxiliary)** — sidebar-main shell
  Archetypes: transaction-history, budget-planner, investment-tracker, settings-full
  Purpose: Financial transaction ledger with filterable data tables, sparkline trend indicators, and transaction detail views. Budget planning and tracking with budget vs actual comparisons, category charts, and compact spending data tables. Investment holdings tracker with position tables, sparkline price trends, performance charts, and individual holding detail views. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: filtering, search, data-export, analytics-state, real-time-data, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| portfolio-overview | primary | sidebar-main | overview, allocations | analytics-state, data-export |
| transaction-history | auxiliary | sidebar-main | transactions, transaction-detail | filtering, search, data-export |
| budget-planner | auxiliary | sidebar-main | budgets | analytics-state, data-export |
| investment-tracker | auxiliary | sidebar-main | investments, holding-detail | analytics-state, data-export, real-time-data |
| marketing-finance | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-finance | home |
| /login | auth-full | login |
| /budgets | budget-planner | budgets |
| /register | auth-full | register |
| /dashboard | portfolio-overview | overview |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /allocations | portfolio-overview | allocations |
| /investments | investment-tracker | investments |
| /phone-verify | auth-full | phone-verify |
| /transactions | transaction-history | transactions |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /investments/:id | investment-tracker | holding-detail |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /transactions/:id | transaction-history | transaction-detail |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-portfolio-overview.md
- .decantr/context/section-transaction-history.md
- .decantr/context/section-budget-planner.md
- .decantr/context/section-investment-tracker.md
- .decantr/context/section-marketing-finance.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** WebApplication, FinancialProduct
**Meta priorities:** description, og:title, og:description, og:image

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
