# Scaffold: event-discovery

**Blueprint:** event-community-hub
**Theme:** dopamine
**Personality:** High-energy community hub with bold, vibrant visuals. Y2K-inspired maximalism with saturated event imagery. Event cards are punchy — bold titles, gradient accents, clear date badges. Community feed is social and lively with reactions and comments. Ticket selection is fun, not transactional. Live streams feel immersive with floating chat. Organizer dashboard balances energy with clarity. Lucide icons. Every interaction feels like joining a party.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Enthusiastic and inclusive. Celebratory.
**CTA verbs:** Join, RSVP, Share, Watch, Connect, Discover
**Avoid:** Submit, Click here, Please enter, Buy now, Corporate
**Empty states:** Inviting and energetic. No events yet? Show trending communities and upcoming highlights. Always feel alive.
**Errors:** Friendly and reassuring. Never kill the vibe. Offer quick recovery and keep the energy up.
**Loading states:** Vibrant gradient skeleton cards. Event images load progressively. Feed items animate in with subtle bounce.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** event-discovery + community-feed + ticket-checkout + organizer-dashboard + marketing-events + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-events
  Purpose: Public-facing marketing and landing page for an event and community platform. Highlights featured events, testimonials, and sign-up CTAs.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — top-nav-main shell
  Archetypes: event-discovery
  Purpose: Event browsing and discovery interface with search, calendar, map, and detail views. Core exploration surface for event and community platforms.
  Features: events, search, calendar, map, filters

**App (auxiliary)** — top-nav-main shell
  Archetypes: community-feed, ticket-checkout, organizer-dashboard, settings-full
  Purpose: Social community feed with posts, discussions, reactions, comments, and a member directory. Drives engagement and connection in event and community platforms. Ticket selection and checkout flow for events. Guides users through tier selection, attendee info, and payment in a focused, distraction-free interface. Event organizer management hub with event editing, attendee management, revenue analytics, and performance dashboards. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: feed, discussions, reactions, comments, tickets, checkout, payment, event-management, attendees, analytics, revenue, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| event-discovery | primary | top-nav-main | events, event-detail | events, search, calendar, map, filters |
| community-feed | auxiliary | top-nav-main | feed, post-detail, members | feed, discussions, reactions, comments |
| ticket-checkout | auxiliary | minimal-header | tickets | tickets, checkout, payment |
| organizer-dashboard | auxiliary | sidebar-main | org-overview, org-event-edit, org-attendees, org-analytics | event-management, attendees, analytics, revenue |
| marketing-events | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | top-nav-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-events | home |
| /feed | community-feed | feed |
| /login | auth-full | login |
| /events | event-discovery | events |
| /members | community-feed | members |
| /tickets | ticket-checkout | tickets |
| /feed/:id | community-feed | post-detail |
| /register | auth-full | register |
| /mfa-setup | auth-full | mfa-setup |
| /organizer | organizer-dashboard | org-overview |
| /events/:id | event-discovery | event-detail |
| /mfa-verify | auth-full | mfa-verify |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /organizer/analytics | organizer-dashboard | org-analytics |
| /organizer/attendees | organizer-dashboard | org-attendees |
| /settings/preferences | settings-full | preferences |
| /organizer/events/:id/edit | organizer-dashboard | org-event-edit |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-event-discovery.md
- .decantr/context/section-community-feed.md
- .decantr/context/section-ticket-checkout.md
- .decantr/context/section-organizer-dashboard.md
- .decantr/context/section-marketing-events.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| reactions | community-feed/feed, community-feed/post-detail |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, Event, WebApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 3 configured
