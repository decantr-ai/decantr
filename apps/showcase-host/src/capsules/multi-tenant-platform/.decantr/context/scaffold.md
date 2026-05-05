# Scaffold: tenant-switcher-dashboard

**Blueprint:** multi-tenant-platform
**Theme:** launchpad
**Personality:** Enterprise-grade platform console built for trust and scale. Navy-to-violet gradient accents on clean white/dark surfaces. Organization switcher prominent in the top-left. Dense data tables with inline actions. API console feels like Stripe's — polished, developer-friendly. Billing shows clear usage breakdowns. Audit logs are prominent. Lucide icons. System sans with monospace for IDs, keys, and code.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Professional, developer-friendly. Assumes technical audience.
**CTA verbs:** Create, Configure, Deploy, Monitor, Manage, Explore
**Avoid:** Submit, Click here, Please enter, Buy now, Exciting
**Empty states:** Professional onboarding. Empty states guide users to create their first resource with clear documentation links. No whimsy.
**Errors:** Precise and actionable. Include request IDs, error codes, and remediation steps. Link to API docs when relevant.
**Loading states:** Skeleton tables and card placeholders. Monospace fields show blinking cursors. Progress indicators for long operations.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** tenant-switcher-dashboard + api-console + usage-billing + webhook-manager + audit-center + marketing-platform + auth-flow-enterprise + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-platform
  Purpose: Platform marketing landing page with hero, feature showcase, pricing tiers, testimonials, and documentation hub for multi-tenant SaaS products.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-flow-enterprise
  Purpose: Enterprise authentication flow with SSO, MFA, org creation during registration, and team invitation acceptance for multi-tenant SaaS platforms.
  Features: auth, sso, mfa, invite-flow

**App** — sidebar-main shell
  Archetypes: tenant-switcher-dashboard
  Purpose: Org-scoped dashboard with tenant switching, KPI overview, team management, and organization settings for multi-tenant SaaS platforms.
  Features: multi-tenant, org-switcher, team-management, roles

**App (auxiliary)** — sidebar-main shell
  Archetypes: api-console, usage-billing, webhook-manager, audit-center, settings-full
  Purpose: Interactive API documentation, key management, and webhook configuration console for developer-facing SaaS platforms. Usage metering dashboard, plan management, payment configuration, and invoice history for consumption-based SaaS billing. Webhook endpoint configuration, event filtering, delivery monitoring, and retry management for platform integrations. Compliance audit trail with searchable event log, retention policies, export capabilities, and notification configuration for enterprise governance. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: api-console, api-keys, webhooks, documentation, billing, usage-metering, invoices, plans, event-filtering, retry-logic, audit-trail, compliance, export, retention, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| tenant-switcher-dashboard | primary | sidebar-main | overview, members, org-settings | multi-tenant, org-switcher, team-management, roles |
| api-console | auxiliary | sidebar-main | api-docs, api-keys, webhooks | api-console, api-keys, webhooks, documentation |
| usage-billing | auxiliary | sidebar-main | usage, billing, invoices | billing, usage-metering, invoices, plans |
| webhook-manager | auxiliary | sidebar-main | endpoints, endpoint-detail | webhooks, event-filtering, retry-logic |
| audit-center | auxiliary | sidebar-main | audit-log, audit-settings | audit-trail, compliance, export, retention |
| marketing-platform | public | top-nav-footer | home, docs | marketing, seo |
| auth-flow-enterprise | gateway | centered | login, register, sso, invite-accept | auth, sso, mfa, invite-flow |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-platform | home |
| /sso | auth-flow-enterprise | sso |
| /docs | marketing-platform | docs |
| /audit | audit-center | audit-log |
| /login | auth-flow-enterprise | login |
| /usage | usage-billing | usage |
| /invite | auth-flow-enterprise | invite-accept |
| /billing | usage-billing | billing |
| /members | tenant-switcher-dashboard | members |
| /api/docs | api-console | api-docs |
| /api/keys | api-console | api-keys |
| /invoices | usage-billing | invoices |
| /overview | tenant-switcher-dashboard | overview |
| /register | auth-flow-enterprise | register |
| /webhooks | webhook-manager | endpoints |
| /api/webhooks | api-console | webhooks |
| /org-settings | tenant-switcher-dashboard | org-settings |
| /webhooks/:id | webhook-manager | endpoint-detail |
| /audit/settings | audit-center | audit-settings |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-tenant-switcher-dashboard.md
- .decantr/context/section-api-console.md
- .decantr/context/section-usage-billing.md
- .decantr/context/section-webhook-manager.md
- .decantr/context/section-audit-center.md
- .decantr/context/section-marketing-platform.md
- .decantr/context/section-auth-flow-enterprise.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
