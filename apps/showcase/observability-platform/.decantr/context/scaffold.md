# Scaffold: metrics-overview-dashboard

**Blueprint:** observability-platform
**Theme:** fintech
**Personality:** Data-dense monitoring command center. Dark backgrounds with accent-colored metric highlights. Multiple visualization types per screen — line charts, heatmaps, sparklines, gauge rings. Monospace for all metric values, timestamps, and trace IDs. Universal green/yellow/red status. Think Datadog meets Grafana. Alert system feels urgent but not panic-inducing. Lucide icons. Every millisecond matters.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Operational and direct. Speaks to SREs and platform engineers.
**CTA verbs:** Investigate, Filter, Drill Down, Acknowledge, Resolve, Silence
**Avoid:** Submit, Click here, Please enter, Buy now, Exciting
**Empty states:** Operational calm. No data means no incidents — show a green status indicator and guide users to configure their first data source.
**Errors:** Diagnostic and precise. Include timestamps, request IDs, and suggested remediation. Link to runbooks.
**Loading states:** Chart skeleton placeholders with axis lines. Metric cards show pulsing number placeholders. Log lines stream in progressively.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** metrics-overview-dashboard + log-explorer-pro + trace-explorer + alert-manager-pro + marketing-observability + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-observability
  Purpose: Public marketing landing page for the observability platform. Showcases product vision, feature highlights, pricing tiers, testimonials, and call-to-action sections.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: metrics-overview-dashboard
  Purpose: Top-level observability dashboard with KPI summaries, real-time charts, and service health maps. Primary entry point for platform-wide metrics monitoring.
  Features: metrics, charts, slo-tracking, real-time

**App (auxiliary)** — sidebar-main shell
  Archetypes: log-explorer-pro, trace-explorer, alert-manager-pro, settings-full
  Purpose: Advanced log search and analysis interface with streaming log viewer, structured query filters, and contextual log detail inspection. Distributed tracing viewer with trace search, latency histograms, full waterfall visualization, and service topology mapping. Alert and incident management interface with active alert views, rule builder, incident timelines, and war-room detail pages for coordinated response. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: logs, search, structured-queries, context, traces, service-map, latency-analysis, alerts, incidents, rules, on-call, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| metrics-overview-dashboard | primary | sidebar-main | overview, service-detail | metrics, charts, slo-tracking, real-time |
| log-explorer-pro | auxiliary | sidebar-main | logs, log-detail | logs, search, structured-queries, context |
| trace-explorer | auxiliary | sidebar-main | traces, trace-detail, service-topology | traces, service-map, latency-analysis |
| alert-manager-pro | auxiliary | sidebar-main | alerts, alert-rules, incidents, incident-detail | alerts, incidents, rules, on-call |
| marketing-observability | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-observability | home |
| /logs | log-explorer-pro | logs |
| /login | auth-full | login |
| /alerts | alert-manager-pro | alerts |
| /traces | trace-explorer | traces |
| /metrics | metrics-overview-dashboard | overview |
| /logs/:id | log-explorer-pro | log-detail |
| /register | auth-full | register |
| /incidents | alert-manager-pro | incidents |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /traces/:id | trace-explorer | trace-detail |
| /alerts/rules | alert-manager-pro | alert-rules |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /incidents/:id | alert-manager-pro | incident-detail |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /traces/topology | trace-explorer | service-topology |
| /metrics/:service | metrics-overview-dashboard | service-detail |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-metrics-overview-dashboard.md
- .decantr/context/section-log-explorer-pro.md
- .decantr/context/section-trace-explorer.md
- .decantr/context/section-alert-manager-pro.md
- .decantr/context/section-marketing-observability.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| kpi-grid | metrics-overview-dashboard/overview, metrics-overview-dashboard/service-detail, alert-manager-pro/alerts, alert-manager-pro/incident-detail |
| chart-grid | metrics-overview-dashboard/overview, metrics-overview-dashboard/service-detail, trace-explorer/traces, alert-manager-pro/incident-detail |
| service-map | metrics-overview-dashboard/overview, trace-explorer/service-topology |
| data-table | log-explorer-pro/logs, trace-explorer/traces, alert-manager-pro/alerts, alert-manager-pro/alert-rules |
| trace-waterfall | log-explorer-pro/log-detail, trace-explorer/trace-detail |
| timeline | alert-manager-pro/incidents, alert-manager-pro/incident-detail |
| activity-feed | alert-manager-pro/incidents, alert-manager-pro/incident-detail |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
