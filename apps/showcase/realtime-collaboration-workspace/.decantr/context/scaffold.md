# Scaffold: workspace-home

**Blueprint:** realtime-collaboration-workspace
**Theme:** paper
**Personality:** Warm, distraction-free collaboration workspace built for focused teamwork. Light paper-like backgrounds with comfortable reading typography. Presence indicators use distinct warm colors per collaborator. Inline comments appear as subtle margin annotations. Page tree navigation is clean and collapsible. The document editor prioritizes content over chrome — toolbar hides on scroll, formatting is keyboard-first. Real-time cursors and selections feel natural, not distracting. Think Notion meets Google Docs — productive, polished, and genuinely collaborative.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Warm, collaborative, and productivity-focused. Speaks in we/us language. Celebrates team accomplishments.
**CTA verbs:** Create, Share, Invite, Comment, Publish, Export
**Avoid:** Submit, Click here, Please enter, Buy, Deploy
**Empty states:** Inviting and action-oriented. An empty workspace should feel like a fresh notebook — exciting, not barren. Suggest creating a first page or importing content.
**Errors:** Calm and recovery-focused. Sync conflicts should show both versions and let the user choose. Never lose work silently.
**Loading states:** Document outline skeletons with line-height placeholders. Presence avatars fade in as connections establish. Page tree shows structure while content loads.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** workspace-home + document-editor + workspace-settings + auth-full + settings-full + marketing-productivity + about-hybrid + contact + legal

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-productivity, about-hybrid, contact, legal
  Purpose: Marketing landing page for productivity and collaboration tools. Features hero, feature grid, collaboration showcase, pricing, and testimonials. About page combining hero, company story, team grid, values, and call-to-action sections. Contact page with hero header and working contact form with validation and spam protection. Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.
  Features: marketing, pricing, testimonials, cta, team-grid, values-display, form-validation, spam-protection, file-attachment, toc-navigation, print-friendly, smooth-scroll

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: workspace-home, document-editor
  Purpose: Dashboard for collaborative workspace with recent documents, shared items, and activity feed. Landing page after login. Real-time collaborative document editing with presence indicators, remote cursors, inline comments, and version history.
  Features: realtime, search, favorites, recent-history, presence, comments, mentions, versioning, sharing, export, markdown, slash-commands

**App (auxiliary)** — sidebar-main shell
  Archetypes: workspace-settings, settings-full
  Purpose: Team workspace configuration including general settings, member management, permissions, and billing. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: team-management, permissions, billing, admin, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| workspace-home | primary | sidebar-main | dashboard | realtime, search, favorites, recent-history |
| document-editor | primary | workspace-aside | doc | realtime, presence, comments, mentions, versioning, sharing, export, markdown, slash-commands |
| workspace-settings | auxiliary | sidebar-main | general, members, permissions, billing | team-management, permissions, billing, admin |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |
| marketing-productivity | public | top-nav-footer | home, pricing | marketing, pricing, testimonials, cta |
| about-hybrid | public | top-nav-footer | about | team-grid, values-display |
| contact | public | top-nav-footer | contact | form-validation, spam-protection, file-attachment |
| legal | public | top-nav-footer | privacy, terms, cookies | toc-navigation, print-friendly, smooth-scroll |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-productivity | home |
| /home | workspace-home | dashboard |
| /team | workspace-settings | members |
| /about | about-hybrid | about |
| /login | auth-full | login |
| /terms | legal | terms |
| /contact | contact | contact |
| /doc/:id | document-editor | doc |
| /pricing | marketing-productivity | pricing |
| /privacy | legal | privacy |
| /profile | settings-full | profile |
| /register | auth-full | register |
| /settings | workspace-settings | general |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /profile/security | settings-full | security |
| /settings/billing | workspace-settings | billing |
| /settings/members | workspace-settings | members |
| /profile/preferences | settings-full | preferences |
| /settings/permissions | workspace-settings | permissions |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-workspace-home.md
- .decantr/context/section-document-editor.md
- .decantr/context/section-workspace-settings.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md
- .decantr/context/section-marketing-productivity.md
- .decantr/context/section-about-hybrid.md
- .decantr/context/section-contact.md
- .decantr/context/section-legal.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify, contact/contact |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |
| hero | marketing-productivity/home, marketing-productivity/pricing, about-hybrid/about, contact/contact |
| pricing | marketing-productivity/home, marketing-productivity/pricing |
| cta | marketing-productivity/home, marketing-productivity/pricing, about-hybrid/about |
| legal-prose | legal/privacy, legal/terms, legal/cookies |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication, CollaborativeWorkspace
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 3 configured
