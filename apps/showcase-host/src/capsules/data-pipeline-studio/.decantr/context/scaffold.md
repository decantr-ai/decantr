# Scaffold: pipeline-builder

**Blueprint:** data-pipeline-studio
**Theme:** terminal
**Personality:** Technical data engineering workspace with terminal-inspired aesthetics. Phosphor green/amber on black for pipeline canvas and log viewers. ASCII box borders on panels. Monospace everywhere. Visual pipeline builder uses nodes and edges with animated data flow particles. Source connectors show recognizable database/API icons. Transformation nodes show SQL/code previews. Think dbt Cloud meets Prefect meets a retro terminal. Lucide icons mixed with data-type icons.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Technical and direct. Speaks to data engineers.
**CTA verbs:** Run, Deploy, Connect, Transform, Preview, Monitor
**Avoid:** Submit, Click here, Please enter, Buy now, Easy
**Empty states:** Terminal-style. An empty pipeline workspace shows a blinking cursor prompt inviting the user to create their first pipeline. No decoration.
**Errors:** Diagnostic and log-formatted. Include job IDs, timestamps, and stack traces. Suggest fixes or link to docs.
**Loading states:** Terminal-style progress bars with percentage. Pipeline nodes show blinking status indicators. Log lines stream in real-time.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** pipeline-builder + source-catalog + transformation-editor + job-monitor + marketing-pipeline + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-pipeline
  Purpose: Public marketing landing page for a data pipeline studio. Vision hero, feature highlights, how-it-works walkthrough, pricing tiers, and call-to-action.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — terminal-split shell
  Archetypes: pipeline-builder
  Purpose: Visual data pipeline builder with drag-and-drop canvas, pipeline list, and configuration for scheduling and retry policies.
  Features: pipelines, visual-builder, scheduling

**App (auxiliary)** — sidebar-main shell
  Archetypes: source-catalog, transformation-editor, job-monitor, settings-full
  Purpose: Data source management with browsable connector catalog, setup wizards, and active connection monitoring. SQL and code transformation editor with split-pane layout for writing queries alongside live data preview. Pipeline job run monitoring with run history, step-by-step trace waterfall, live log streaming, and performance KPIs. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: sources, connectors, schemas, sql-editor, transformations, data-preview, monitoring, logs, job-history, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| pipeline-builder | primary | terminal-split | pipelines, pipeline-editor, pipeline-config | pipelines, visual-builder, scheduling |
| source-catalog | auxiliary | sidebar-main | sources, source-detail, connections | sources, connectors, schemas |
| transformation-editor | auxiliary | sidebar-aside | transforms, transform-editor, data-preview | sql-editor, transformations, data-preview |
| job-monitor | auxiliary | sidebar-main | jobs, job-detail | monitoring, logs, job-history |
| marketing-pipeline | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | terminal-split | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-pipeline | home |
| /jobs | job-monitor | jobs |
| /login | auth-full | login |
| /sources | source-catalog | sources |
| /jobs/:id | job-monitor | job-detail |
| /register | auth-full | register |
| /mfa-setup | auth-full | mfa-setup |
| /pipelines | pipeline-builder | pipelines |
| /mfa-verify | auth-full | mfa-verify |
| /transforms | transformation-editor | transforms |
| /connections | source-catalog | connections |
| /sources/:id | source-catalog | source-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /pipelines/:id | pipeline-builder | pipeline-editor |
| /reset-password | auth-full | reset-password |
| /transforms/:id | transformation-editor | transform-editor |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /transforms/preview | transformation-editor | data-preview |
| /pipelines/:id/config | pipeline-builder | pipeline-config |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-pipeline-builder.md
- .decantr/context/section-source-catalog.md
- .decantr/context/section-transformation-editor.md
- .decantr/context/section-job-monitor.md
- .decantr/context/section-marketing-pipeline.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| data-table | pipeline-builder/pipelines, transformation-editor/transforms, transformation-editor/data-preview, job-monitor/jobs |
| data-source-connector | source-catalog/sources, source-catalog/source-detail, source-catalog/connections |
| json-viewer | source-catalog/source-detail, transformation-editor/data-preview |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
