# Scaffold: crm-dashboard

**Blueprint:** ai-native-crm
**Theme:** glassmorphism
**Personality:** Intelligent CRM with AI enrichment at every touch. Frosted glass panels on cool-toned dark backgrounds. Contact cards show AI-gathered insights alongside manual data. Pipeline board is the center of gravity — wide, draggable, value-weighted. Email composer has AI ghost text suggestions. Meeting recaps auto-populate with action items. Relationship graph makes hidden connections visible. Smooth transitions. Lucide icons. This CRM feels alive.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Confident and helpful. Assumes sales professionals.
**CTA verbs:** Close, Schedule, Follow Up, Enrich, Connect, Forecast
**Avoid:** Submit, Click here, Please enter, Buy now, Synergy
**Empty states:** Motivational and action-oriented. An empty pipeline encourages importing contacts or adding the first deal. No clutter.
**Errors:** Clear and recovery-focused. Show what went wrong and offer retry. Never lose user data.
**Loading states:** Frosted glass skeleton cards. Pipeline columns show placeholder deal cards. Contact details shimmer progressively.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** crm-dashboard + crm-email + crm-meetings + crm-intelligence + marketing-crm + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-crm
  Purpose: Public marketing landing page for the AI-native CRM. Showcases AI-powered sales features, pipeline management, pricing, and customer testimonials with strong conversion CTAs.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: crm-dashboard
  Purpose: Primary sales overview dashboard with pipeline visualization, contact management, deal tracking, AI-powered enrichment, and revenue forecasting.
  Features: pipeline, contacts, deals, ai-enrichment, forecasting

**App (auxiliary)** — sidebar-main shell
  Archetypes: crm-email, crm-meetings, crm-intelligence, settings-full
  Purpose: AI-assisted email interface integrated with the CRM. Features smart inbox with auto-categorization and an AI-powered compose experience for personalized outreach. Meeting management interface with calendar views, AI-generated recaps, transcription, and automatic action item extraction linked to CRM contacts and deals. AI-generated sales intelligence dashboard with win/loss analysis, revenue forecasting, relationship mapping, and actionable insights derived from CRM data. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: email, ai-compose, categorization, meetings, ai-recap, transcription, action-items, ai-insights, forecasting, analytics, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| crm-dashboard | primary | sidebar-main | dashboard, pipeline, contacts, contact-detail, deals, deal-detail | pipeline, contacts, deals, ai-enrichment, forecasting |
| crm-email | auxiliary | sidebar-main | inbox, compose | email, ai-compose, categorization |
| crm-meetings | auxiliary | sidebar-main | meetings, meeting-detail | meetings, ai-recap, transcription, action-items |
| crm-intelligence | auxiliary | sidebar-main | insights | ai-insights, forecasting, analytics |
| marketing-crm | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-crm | home |
| /deals | crm-dashboard | deals |
| /inbox | crm-email | inbox |
| /login | auth-full | login |
| /compose | crm-email | compose |
| /contacts | crm-dashboard | contacts |
| /insights | crm-intelligence | insights |
| /meetings | crm-meetings | meetings |
| /pipeline | crm-dashboard | pipeline |
| /register | auth-full | register |
| /dashboard | crm-dashboard | dashboard |
| /deals/:id | crm-dashboard | deal-detail |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /contacts/:id | crm-dashboard | contact-detail |
| /meetings/:id | crm-meetings | meeting-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-crm-dashboard.md
- .decantr/context/section-crm-email.md
- .decantr/context/section-crm-meetings.md
- .decantr/context/section-crm-intelligence.md
- .decantr/context/section-marketing-crm.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| kpi-grid | crm-dashboard/dashboard, crm-dashboard/deals, crm-intelligence/insights |
| deal-pipeline-board | crm-dashboard/dashboard, crm-dashboard/pipeline |
| activity-feed | crm-dashboard/dashboard, crm-dashboard/contact-detail, crm-dashboard/deal-detail |
| data-table | crm-dashboard/contacts, crm-dashboard/deals |
| relationship-graph | crm-dashboard/contact-detail, crm-intelligence/insights |
| detail-header | crm-dashboard/deal-detail, crm-meetings/meeting-detail |
| timeline | crm-dashboard/deal-detail, crm-meetings/meeting-detail |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
