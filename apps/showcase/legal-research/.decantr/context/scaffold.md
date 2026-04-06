# Scaffold: research-workspace

**Blueprint:** legal-research
**Theme:** counsel
**Personality:** Authoritative legal research workspace with warm cream backgrounds and deep navy accents. Serif body typography with monospace case citations. Citation graphs visualize case law networks showing which decisions cite which. Contract diffs reveal redlining with author attribution in margins. Matter cards track billable hours and deadlines with urgency indicators. Lucide icons. Scholarly.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Formal and precise. Speaks to attorneys, paralegals, researchers.
**CTA verbs:** Research, Cite, Shepardize, Draft, Redline, File
**Avoid:** Click, Browse
**Empty states:** No matters assigned to you. Ask the partner to add you to a case.
**Errors:** Citation check failed — {citation} could not be resolved.
**Loading states:** Searching case law...

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** research-workspace + contract-center + matter-management + citation-tools + marketing-legal + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-legal
  Purpose: Public marketing landing surface for a legal research platform with hero, feature grid, testimonials, and final call to action.
  Features: marketing

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-aside shell
  Archetypes: research-workspace
  Purpose: Primary legal research workspace for searching case law, inspecting case detail with citation graphs, and drafting research memos side-by-side with supporting briefs.
  Features: case-law, citations, research

**App (auxiliary)** — sidebar-main shell
  Archetypes: contract-center, matter-management, citation-tools, settings-full
  Purpose: Auxiliary contract management surface for browsing the contract library, reviewing redlined documents with tracked changes, and comparing versions side-by-side. Auxiliary matter management surface for tracking legal matters across lifecycle stages, inspecting matter detail with activity and billing context. Auxiliary citation management surface for organizing a citation library and running Shepardize-style validity checks with visual citation graphs. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: contracts, redlining, diffs, matters, billing-tracking, citations, shepardize, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| research-workspace | primary | sidebar-aside | search, case-detail, research-memo | case-law, citations, research |
| contract-center | auxiliary | sidebar-main | contracts, contract-detail, contract-compare | contracts, redlining, diffs |
| matter-management | auxiliary | sidebar-main | matters, matter-detail | matters, billing-tracking |
| citation-tools | auxiliary | sidebar-main | citations, citation-check | citations, shepardize |
| marketing-legal | public | top-nav-footer | home | marketing |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-aside | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-legal | home |
| /login | auth-full | login |
| /matters | matter-management | matters |
| /register | auth-full | register |
| /research | research-workspace | search |
| /citations | citation-tools | citations |
| /contracts | contract-center | contracts |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /matters/:id | matter-management | matter-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /contracts/:id | contract-center | contract-detail |
| /research/memo | research-workspace | research-memo |
| /reset-password | auth-full | reset-password |
| /citations/check | citation-tools | citation-check |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /contracts/compare | contract-center | contract-compare |
| /settings/security | settings-full | security |
| /research/cases/:id | research-workspace | case-detail |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-research-workspace.md
- .decantr/context/section-contract-center.md
- .decantr/context/section-matter-management.md
- .decantr/context/section-citation-tools.md
- .decantr/context/section-marketing-legal.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| data-table | research-workspace/search, contract-center/contracts, matter-management/matters, citation-tools/citations, citation-tools/citation-check |
| citation-graph | research-workspace/search, research-workspace/case-detail, citation-tools/citations, citation-tools/citation-check |
| case-brief-card | research-workspace/case-detail, research-workspace/research-memo |
| contract-diff | contract-center/contract-detail, contract-center/contract-compare |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
