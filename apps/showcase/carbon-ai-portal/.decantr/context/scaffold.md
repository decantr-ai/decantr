# Scaffold: ai-chatbot

**Blueprint:** carbon-ai-portal
**Theme:** carbon
**Personality:** Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Intelligent and measured. Speaks like a premium developer tool. Technical accuracy matters. Warm but never casual.
**CTA verbs:** Start chat, New conversation, Send, Export, Configure, Upgrade
**Avoid:** Submit, Click here, Please enter, Hey there, Awesome
**Empty states:** Thoughtful and inviting. An empty conversation list should welcome the user and suggest a first prompt or use case. Settings pages show clear descriptions of each option.
**Errors:** Calm and specific. AI response failures should explain rate limits or model availability. Form errors use inline validation with specific guidance.
**Loading states:** Chat messages stream token-by-token with a blinking cursor. Conversation list shows skeleton cards. Settings forms show field outlines while preferences load.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** ai-chatbot + auth-full + settings-full + marketing-saas + about-hybrid + contact + legal

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-saas, about-hybrid, contact, legal
  Purpose: SaaS marketing landing page with hero, features, how-it-works timeline, pricing, testimonials, and CTA sections. About page combining hero, company story, team grid, values, and call-to-action sections. Contact page with hero header and working contact form with validation and spam protection. Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.
  Features: pricing-toggle, testimonials, feature-grid, team-grid, values-display, form-validation, spam-protection, file-attachment, toc-navigation, print-friendly, smooth-scroll

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — chat-portal shell
  Archetypes: ai-chatbot
  Purpose: AI chatbot interface with conversation sidebar, message thread, and anchored input. Core interface for chat-first AI applications.
  Features: chat, markdown, code-highlight, file-upload, mentions, reactions, export

**App (auxiliary)** — chat-portal shell
  Archetypes: settings-full
  Purpose: Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
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
| /phone-verify | auth-full | phone-verify |
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
| chat-thread | ai-chatbot/chat, ai-chatbot/new |
| chat-input | ai-chatbot/chat, ai-chatbot/new |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify, contact/contact |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |
| hero | marketing-saas/home, about-hybrid/about, contact/contact |
| cta | marketing-saas/home, about-hybrid/about |
| legal-prose | legal/privacy, legal/terms, legal/cookies |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 3 configured
