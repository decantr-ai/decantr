# Scaffold: music-workspace

**Blueprint:** producer-studio
**Theme:** studio-dark
**Personality:** Electric music production workspace with cyan waveforms pulsing across deep purple canvases. Multi-track DAW layout with stem-stack channel strips, meter bars glowing on transients, and automation lanes curving below. Split-royalty calculators with real-time percentage validation. Live session rooms with voice chat and collaborative scrubbing. Think Ableton meets Splice. Lucide icons. Electric.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Creative and technical. Speaks to producers and engineers.
**CTA verbs:** Record, Bounce, Master, Mix, Collab, Drop
**Avoid:** Save, Process
**Empty states:** Empty session. Drop a stem or start from a preset.
**Errors:** Bounce failed — clip {n} has no audio at {timestamp}
**Loading states:** Rendering stems... {percent}%

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** music-workspace + track-library + collaboration-hub + session-rooms + marketing-producer + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-producer
  Purpose: Public marketing landing page for a music producer studio product with vision hero, feature rundown, pricing, and testimonials.
  Features: marketing

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-aside shell
  Archetypes: music-workspace
  Purpose: Music producer session workspace with multi-track waveform editing, stem stacking, and split-pane arrangement for audio production flows.
  Features: session-editing, stems, mixing

**App (auxiliary)** — sidebar-main shell
  Archetypes: track-library, collaboration-hub, session-rooms, settings-full
  Purpose: Producer track catalog with searchable table of finished and in-progress tracks plus a per-track detail view with waveform preview and version history. Producer collaborator directory and royalty split management surface with contributor cards and split calculators. Live producer session rooms for real-time co-creation with voice, video, and chat. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: track-management, versions, collaboration, royalties, live-sessions, voice-chat, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| music-workspace | primary | sidebar-aside | session, session-detail | session-editing, stems, mixing |
| track-library | auxiliary | sidebar-main | tracks, track-detail | track-management, versions |
| collaboration-hub | auxiliary | sidebar-main | collaborators, splits | collaboration, royalties |
| session-rooms | auxiliary | sidebar-main | rooms, room-detail | live-sessions, voice-chat |
| marketing-producer | public | top-nav-footer | home | marketing |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-aside | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-producer | home |
| /login | auth-full | login |
| /rooms | session-rooms | rooms |
| /collab | collaboration-hub | collaborators |
| /tracks | track-library | tracks |
| /session | music-workspace | session |
| /register | auth-full | register |
| /mfa-setup | auth-full | mfa-setup |
| /rooms/:id | session-rooms | room-detail |
| /mfa-verify | auth-full | mfa-verify |
| /tracks/:id | track-library | track-detail |
| /session/:id | music-workspace | session-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /collab/splits | collaboration-hub | splits |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-music-workspace.md
- .decantr/context/section-track-library.md
- .decantr/context/section-collaboration-hub.md
- .decantr/context/section-session-rooms.md
- .decantr/context/section-marketing-producer.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| waveform-track | music-workspace/session, music-workspace/session-detail, track-library/track-detail |
| stem-stack | music-workspace/session, music-workspace/session-detail |
| data-table | track-library/tracks, collaboration-hub/splits |
| card-grid | collaboration-hub/collaborators, session-rooms/rooms |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
