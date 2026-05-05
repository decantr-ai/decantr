# Scaffold: video-editor

**Blueprint:** ai-video-studio
**Theme:** cinema
**Personality:** Professional AI video production studio. Dark charcoal timelines with warm amber accents on active elements. Film-grain textures and title-card typography. Multi-track timeline dominates the workspace with scrubber, scene thumbnails, and keyframe dots. Character consistency sheets hang in sidebar panels. Render queue shows live generation progress. Think Runway meets Final Cut Pro. Lucide icons. Cinematic.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Cinematic and precise. Speaks to video creators and AI directors.
**CTA verbs:** Direct, Render, Compose, Generate, Export, Review
**Avoid:** Process, Make, Do
**Empty states:** Your storyboard is empty. Drop your first scene prompt to begin.
**Errors:** Render failed — scene {id} timeout at {ms}ms. Retry with lower quality?
**Loading states:** Rendering scene {n} of {total}... {percent}% complete

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** project-library + character-library + prompt-director + render-monitor + marketing-video-studio + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-video-studio
  Purpose: Public-facing landing page for an AI video studio product. Communicates vision, showcases features and workflow, presents pricing tiers, and drives signups with social proof.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App (auxiliary)** — sidebar-main shell
  Archetypes: project-library, character-library, prompt-director, render-monitor, settings-full
  Purpose: Browse, filter, and manage video projects and starter templates. Entry point for opening existing work and kicking off new productions from curated blueprints. Manage reusable AI character references with persistent identity, appearance details, and consistency tracking across video scenes. Organize, version, and iterate on scene prompts. Provides a prompt library, full-fidelity editor with live playground, and inline storyboard strip for visual reference. Observe every render job in flight: queue, progress, GPU utilization, and live log streaming for diagnosing failed or slow video generations. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: project-management, templates, character-tracking, consistency, prompt-management, version-control, render-monitoring, logs, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

### Zone Transitions

  Public → Gateway: conversion (authentication)
  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)
  App → Public: navigation (external)

### Default Entry Points

  Anonymous users enter: public zone
  Authenticated users enter: first section
  Auth redirect target: first section


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| project-library | auxiliary | sidebar-main | projects, templates | project-management, templates |
| character-library | auxiliary | sidebar-main | characters, character-detail | character-tracking, consistency |
| prompt-director | auxiliary | sidebar-main | prompts, prompt-detail | prompt-management, version-control |
| render-monitor | auxiliary | sidebar-main | renders, render-detail | render-monitoring, logs |
| marketing-video-studio | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-video-studio | home |
| /login | auth-full | login |
| /editor | video-editor | editor |
| /prompts | prompt-director | prompts |
| /renders | render-monitor | renders |
| /projects | project-library | projects |
| /register | auth-full | register |
| /mfa-setup | auth-full | mfa-setup |
| /characters | character-library | characters |
| /editor/:id | video-editor | project-detail |
| /mfa-verify | auth-full | mfa-verify |
| /prompts/:id | prompt-director | prompt-detail |
| /renders/:id | render-monitor | render-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /editor/export | video-editor | export |
| /characters/:id | character-library | character-detail |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /projects/templates | project-library | templates |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-project-library.md
- .decantr/context/section-character-library.md
- .decantr/context/section-prompt-director.md
- .decantr/context/section-render-monitor.md
- .decantr/context/section-marketing-video-studio.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| filters | project-library/templates, character-library/characters, prompt-director/prompts, render-monitor/renders |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
