# Scaffold: owner-dashboard

**Blueprint:** property-management-portal
**Theme:** estate
**Personality:** Professional, trust-building property management portal with a warm light theme. Clean card-based layouts for properties and units with status badges (occupied, vacant, maintenance). Financial views use conservative chart styles — bar charts for rent roll, line charts for P&L trends. Tenant directory emphasizes contact info and lease status. Maintenance board uses a kanban layout with priority coloring. The tenant portal feels welcoming and self-service. Think Buildium meets a modern banking app — serious about money, friendly about people.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Professional and reassuring. Speaks to property owners with authority and to tenants with warmth and clarity.
**CTA verbs:** Add property, View details, Submit request, Pay rent, Export, Schedule
**Avoid:** Submit, Click here, Please enter, Buy, Deploy
**Empty states:** Helpful and onboarding-oriented. An empty property list should guide through adding the first property with clear steps. Tenant portal empty states should reassure that everything is in order.
**Errors:** Professional and specific. Payment processing errors include next steps. Maintenance submission failures offer alternative contact methods.
**Loading states:** Property card skeletons with address line placeholders. Financial tables show column headers while data loads. Tenant portal uses gentle fade-in transitions.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** owner-dashboard + property-manager + tenant-manager + pm-financials + maintenance-center + tenant-portal + tenant-payments + marketing-realestate + auth-full + settings-full + about-hybrid + contact + legal

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-realestate, about-hybrid, contact, legal
  Purpose: Marketing landing page for property management SaaS platforms with hero, features, pricing, testimonials, and CTA sections. About page combining hero, company story, team grid, values, and call-to-action sections. Contact page with hero header and working contact form with validation and spam protection. Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.
  Features: marketing, seo, responsive, team-grid, values-display, form-validation, spam-protection, file-attachment, toc-navigation, print-friendly, smooth-scroll

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: owner-dashboard
  Purpose: Property owner/investor portfolio dashboard with financial overview, property grid, rent collection status, maintenance summary, and vacancy tracking.
  Features: dashboard, analytics, notifications

**App (auxiliary)** — sidebar-main shell
  Archetypes: property-manager, tenant-manager, pm-financials, maintenance-center, tenant-portal, tenant-payments, settings-full
  Purpose: Property CRUD and management screens including property list, detail view, create/edit forms, and unit management. Tenant management screens including directory, detail view with lease and payment history, and tenant onboarding. Property management financial analytics including P&L overview, rent roll, expense tracking, and payment history for real estate portfolios. Maintenance ticket management with Kanban board view, ticket details, and ticket creation for property repairs. Tenant self-service portal home with lease summary, rent reminders, recent maintenance tickets, and quick actions. Tenant payment management including rent reminders, payment history, and autopay setup configuration. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: crud, file-upload, search, filters, communication, analytics, export, charts, date-range, kanban, drag-drop, notifications, self-service, payments, autopay, receipts, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| owner-dashboard | primary | sidebar-main | dashboard | dashboard, analytics, notifications |
| property-manager | auxiliary | sidebar-main | list, detail, create, units, unit-detail | crud, file-upload, search, filters |
| tenant-manager | auxiliary | sidebar-main | list, detail, create | crud, search, filters, communication |
| pm-financials | auxiliary | sidebar-main | overview, rent-roll, expenses, payments | analytics, export, charts, date-range |
| maintenance-center | auxiliary | sidebar-main | board, ticket, create | kanban, drag-drop, file-upload, notifications |
| tenant-portal | auxiliary | top-nav-main | home, maintenance, documents | self-service, file-upload, notifications |
| tenant-payments | auxiliary | top-nav-main | overview, setup | payments, autopay, receipts |
| marketing-realestate | public | top-nav-footer | home | marketing, seo, responsive |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |
| about-hybrid | public | top-nav-footer | about | team-grid, values-display |
| contact | public | top-nav-footer | contact | form-validation, spam-protection, file-attachment |
| legal | public | top-nav-footer | privacy, terms, cookies | toc-navigation, print-friendly, smooth-scroll |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-realestate | home |
| /about | about-hybrid | about |
| /login | auth-full | login |
| /terms | legal | terms |
| /contact | contact | contact |
| /pricing | marketing-realestate | home |
| /privacy | legal | privacy |
| /tenants | tenant-manager | list |
| /register | auth-full | register |
| /dashboard | owner-dashboard | dashboard |
| /documents | property-manager | documents |
| /mfa-setup | auth-full | mfa-setup |
| /financials | pm-financials | overview |
| /mfa-verify | auth-full | mfa-verify |
| /properties | property-manager | list |
| /maintenance | maintenance-center | board |
| /tenants/:id | tenant-manager | detail |
| /verify-email | auth-full | verify-email |
| /tenant-portal | tenant-portal | home |
| /properties/:id | property-manager | detail |
| /properties/new | property-manager | create |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /maintenance/:id | maintenance-center | ticket |
| /settings/account | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /financials/expenses | pm-financials | expenses |
| /financials/rent-roll | pm-financials | rent-roll |
| /properties/:id/units | property-manager | units |
| /settings/preferences | settings-full | preferences |
| /tenant-portal/payments | tenant-payments | overview |
| /tenant-portal/documents | tenant-portal | documents |
| /tenant-portal/maintenance | tenant-portal | maintenance |
| /properties/:id/units/:unitId | property-manager | unit-detail |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-owner-dashboard.md
- .decantr/context/section-property-manager.md
- .decantr/context/section-tenant-manager.md
- .decantr/context/section-pm-financials.md
- .decantr/context/section-maintenance-center.md
- .decantr/context/section-tenant-portal.md
- .decantr/context/section-tenant-payments.md
- .decantr/context/section-marketing-realestate.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md
- .decantr/context/section-about-hybrid.md
- .decantr/context/section-contact.md
- .decantr/context/section-legal.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| rent-roll | owner-dashboard/dashboard, pm-financials/rent-roll |
| maintenance-board | owner-dashboard/dashboard, maintenance-center/board, tenant-portal/home |
| form | property-manager/create, tenant-manager/create, tenant-manager/create, maintenance-center/create, tenant-portal/maintenance, auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify, contact/contact |
| creator-profile | tenant-manager/detail, tenant-portal/home |
| lease-manager | tenant-manager/detail, tenant-portal/home |
| payments | tenant-manager/detail, pm-financials/payments |
| rent-reminder | tenant-portal/home, tenant-payments/overview |
| tenant-payment-setup | tenant-payments/overview, tenant-payments/setup |
| hero | marketing-realestate/home, about-hybrid/about, contact/contact |
| cta | marketing-realestate/home, about-hybrid/about |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |
| legal-prose | legal/privacy, legal/terms, legal/cookies |

## SEO Hints

**Schema.org types:** Organization, WebApplication, RealEstateAgent
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
