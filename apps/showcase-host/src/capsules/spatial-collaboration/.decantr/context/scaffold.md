# Scaffold: spatial-workspace

**Blueprint:** spatial-collaboration
**Theme:** carbon
**Personality:** Immersive spatial workspace with depth and presence. Glassmorphic floating panels over depth-layered backgrounds. Smooth spring animations for all transitions. Presence indicators use warm accent colors. Think Figma meets a sci-fi command bridge. System sans-serif typography. Minimal chrome, maximum canvas.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Minimal and spatial-aware. UI text is brief — the canvas is the focus. Status messages are contextual to the user's position in the workspace.
**CTA verbs:** Create, Place, Connect, Share, Focus, Navigate
**Avoid:** Submit, Click here, Please enter, Buy, Subscribe
**Empty states:** Spatial and inviting. An empty canvas should show a subtle grid with a centered prompt to place the first element. Presence dots should appear as collaborators join.
**Errors:** Non-intrusive. Connection drops show a subtle reconnecting indicator at the canvas edge. Conflict resolution uses visual diffing on the affected object.
**Loading states:** Canvas grid renders immediately. Objects fade in as data arrives. Presence rings pulse gently during connection establishment. No blocking loading screens.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** spatial-workspace + auth-full + about-hybrid

### Zones

**Public** — top-nav-footer shell
  Archetypes: about-hybrid
  Purpose: About page combining hero, company story, team grid, values, and call-to-action sections.
  Features: team-grid, values-display

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — canvas-overlay shell
  Archetypes: spatial-workspace
  Purpose: Immersive spatial workspace with depth-layered canvases, holographic controls, and real-time presence indicators for collaborative creative work.
  Features: spatial, collaboration, drag-drop, real-time, presence

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
| spatial-workspace | primary | canvas-overlay | workspace, workspace-settings | spatial, collaboration, drag-drop, real-time, presence |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| about-hybrid | public | top-nav-footer | about | team-grid, values-display |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | spatial-workspace | workspace |
| /about | about-hybrid | about |
| /login | auth-full | login |
| /register | auth-full | register |
| /settings | spatial-workspace | workspace-settings |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-spatial-workspace.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-about-hybrid.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |

## SEO Hints

**Schema.org types:** Organization, WebApplication
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
- Hotkeys: 2 configured
