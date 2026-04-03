# Scaffold: copilot-workspace

**Blueprint:** ai-copilot-shell
**Theme:** carbon
**Personality:** Minimal, unobtrusive AI assistant that enhances without overwhelming. The copilot panel is a sleek right-side drawer — dark carbon surface with soft shadows. Suggestions appear as ghost text or subtle card overlays near the user's focus. Main app takes center stage; AI is always available but never demands attention. Actions have clear accept/reject affordances. Context breadcrumbs show what the AI sees. Think GitHub Copilot meets Linear's command palette. Lucide icons. Geist Mono for AI outputs.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Concise and helpful. Like a knowledgeable colleague.
**CTA verbs:** Apply, Accept, Dismiss, Refine, Ask, Explain
**Avoid:** Submit, Click here, Please enter, Buy now, Magic
**Empty states:** Quiet and inviting. An empty copilot panel shows a subtle prompt to ask a question or start a task. No clutter.
**Errors:** Brief and actionable. Show what went wrong and how to retry. Never verbose.
**Loading states:** Ghost text shimmer for suggestions. Subtle pulse animation on the copilot icon. Typing indicator dots for AI responses.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** copilot-workspace + copilot-settings + marketing-copilot + auth-flow + settings

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-copilot
  Purpose: Marketing landing page showcasing an AI copilot product. Features a split hero with live demo, feature breakdown, how-it-works flow, and conversion CTAs.
  Features: marketing, demo, seo

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — copilot-overlay shell
  Archetypes: copilot-workspace
  Purpose: Main application workspace with an AI copilot overlay. Features a toggleable copilot panel that provides context-aware suggestions and chat alongside the primary work surface.
  Features: copilot, ai-suggestions, context-awareness, keyboard-shortcuts

**App (auxiliary)** — sidebar-main shell
  Archetypes: copilot-settings, settings
  Purpose: Configuration interface for AI copilot preferences, model selection, permissions, and behavior tuning. Auxiliary archetype for copilot-powered applications. Application settings and preferences page
  Features: settings, model-config, permissions

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
| copilot-workspace | primary | copilot-overlay | workspace, workspace-detail | copilot, ai-suggestions, context-awareness, keyboard-shortcuts |
| copilot-settings | auxiliary | sidebar-main | copilot-config | settings, model-config, permissions |
| marketing-copilot | public | top-nav-footer | home | marketing, demo, seo |
| auth-flow | gateway | centered | login, register, forgot-password | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-copilot | home |
| /login | auth-flow | login |
| /register | auth-flow | register |
| /settings | settings | settings |
| /workspace | copilot-workspace | workspace |
| /workspace/:id | copilot-workspace | workspace-detail |
| /copilot/config | copilot-settings | copilot-config |
| /forgot-password | auth-flow | forgot-password |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-copilot-workspace.md
- .decantr/context/section-copilot-settings.md
- .decantr/context/section-marketing-copilot.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| chat-thread | copilot-workspace/workspace, copilot-workspace/workspace-detail |
| form-sections | copilot-settings/copilot-config, settings/settings |
| auth-form | auth-flow/login, auth-flow/register, auth-flow/forgot-password |

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 2 configured
