# Scaffold: ai-chatbot

**Blueprint:** 
**Theme:** carbon | **Recipe:** carbon
**Personality:** Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.
**Guard mode:** creative (no enforcement during initial scaffolding)

## App Topology

## Composition Topology

**Intent:** ai-chatbot + auth-full + settings-full + marketing-saas + about-hybrid + contact + legal

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-saas, about-hybrid, contact, legal
  Purpose: SaaS marketing landing page with hero, features, how-it-works timeline, pricing, testimonials, and CTA sections. About page combining hero, company story, team grid, values, and call-to-action sections. Contact page with hero header and working contact form with validation and spam protection. Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.
  Tone: Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.
  Features: pricing-toggle, testimonials, feature-grid, team-grid, values-display, form-validation, spam-protection, file-attachment, toc-navigation, print-friendly, smooth-scroll

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Tone: Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — chat-portal shell
  Archetypes: ai-chatbot
  Purpose: AI chatbot interface with conversation sidebar, message thread, and anchored input. Core interface for chat-first AI applications.
  Tone: Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.
  Features: chat, markdown, code-highlight, file-upload, mentions, reactions, export

**App (auxiliary)** — chat-portal shell
  Archetypes: settings-full
  Purpose: Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Tone: Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.
  Features: profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| ai-chatbot | primary | chat-portal | chat, new | chat, markdown, code-highlight, file-upload, mentions, reactions, export |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | chat-portal | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |
| marketing-saas | public | top-nav-footer | home | pricing-toggle, testimonials, feature-grid |
| about-hybrid | public | top-nav-footer | about | team-grid, values-display |
| contact | public | top-nav-footer | contact | form-validation, spam-protection, file-attachment |
| legal | public | top-nav-footer | privacy, terms, cookies | toc-navigation, print-friendly, smooth-scroll |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-saas | home |
| /chat | ai-chatbot | new |
| /about | about-hybrid | about |
| /login | auth-full | login |
| /terms | legal | terms |
| /contact | contact | contact |
| /cookies | legal | cookies |
| /privacy | legal | privacy |
| /chat/:id | ai-chatbot | chat |
| /register | auth-full | register |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/account | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-ai-chatbot.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md
- .decantr/context/section-marketing-saas.md
- .decantr/context/section-about-hybrid.md
- .decantr/context/section-contact.md
- .decantr/context/section-legal.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| input | ai-chatbot/chat, ai-chatbot/new |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify, contact/contact |
| settings | settings-full/profile, settings-full/preferences, settings-full/danger |
| hero | marketing-saas/home, about-hybrid/about, contact/contact |
| cta | marketing-saas/home, about-hybrid/about |
| content | legal/privacy, legal/terms, legal/cookies |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card
