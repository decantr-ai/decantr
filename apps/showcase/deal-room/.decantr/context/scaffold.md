# Scaffold: deal-workspace

**Blueprint:** deal-room
**Theme:** bespoke
**Personality:** Secure private equity deal room with authoritative quiet-luxury aesthetics. Deep navy surfaces bordered with gold hairlines. Serif display typography on titles, monospace on financial figures. Document viewer has diagonal watermarks showing viewer name and timestamp. Stage gates track deal progression with approval checkpoints. Q&A threads attach to specific document paragraphs. Investors see only what they're cleared for. Lucide icons. Refined.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Formal and authoritative. Speaks to PE partners, LPs, counsel.
**CTA verbs:** Review, Approve, Escalate, Sign, Request, Execute
**Avoid:** Click, Submit, Try
**Empty states:** No documents uploaded yet. Invite your deal team to contribute.
**Errors:** Access denied — NDA signature required for this document.
**Loading states:** Verifying access credentials...

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** deal-workspace + document-vault + qa-workflow + investor-portal + marketing-deal-room + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-deal-room
  Purpose: Public marketing landing page for deal-room software positioning trust, security, and workflow velocity. Primary acquisition surface for enterprise sales.
  Features: marketing

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: deal-workspace
  Purpose: Private equity deal workspace with dashboard, stage gate tracking, and per-stage detail views. Core interface for managing active M&A and investment transactions through structured stage progression.
  Features: deal-tracking, stage-gates

**App (auxiliary)** — sidebar-main shell
  Archetypes: document-vault, qa-workflow, investor-portal, settings-full
  Purpose: Secure document repository for deal rooms with watermarked viewing, granular access audit, and inline Q&A threads. Provides due-diligence document management with full audit trail. Structured Q&A workflow for due diligence with threaded questions, role assignments, and response tracking. Manages bidder and investor inquiries through assignment and resolution cycles. Investor management portal tracking NDA status, access history, and document activity per investor. Centralizes the bidder and limited-partner roster for deal rooms. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: secure-documents, watermarks, audit, qa, assignments, investor-management, nda-tracking, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| deal-workspace | primary | sidebar-main | overview, stage-detail | deal-tracking, stage-gates |
| document-vault | auxiliary | sidebar-main | documents, document-view | secure-documents, watermarks, audit |
| qa-workflow | auxiliary | sidebar-main | questions, question-detail | qa, assignments |
| investor-portal | auxiliary | sidebar-main | investors, investor-detail | investor-management, nda-tracking |
| marketing-deal-room | public | top-nav-footer | home | marketing |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-deal-room | home |
| /qa | qa-workflow | questions |
| /deal | deal-workspace | overview |
| /login | auth-full | login |
| /qa/:id | qa-workflow | question-detail |
| /register | auth-full | register |
| /documents | document-vault | documents |
| /investors | investor-portal | investors |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /documents/:id | document-vault | document-view |
| /investors/:id | investor-portal | investor-detail |
| /reset-password | auth-full | reset-password |
| /deal/stages/:id | deal-workspace | stage-detail |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-deal-workspace.md
- .decantr/context/section-document-vault.md
- .decantr/context/section-qa-workflow.md
- .decantr/context/section-investor-portal.md
- .decantr/context/section-marketing-deal-room.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
