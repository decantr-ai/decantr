# Scaffold: marketing-swipecircle

**Blueprint:** swipecircle
**Theme:** swipecircle
**Personality:** Mobile-first social discovery with playful coral-pink energy and warm peach undertones. Photo-centric swipe deck dominates the screen — cards feel tactile, almost like polaroids you'd shuffle through. Pill-shaped buttons everywhere with bouncy spring physics. Soft drop shadows replace harsh borders. Bottom tabs provide always-visible navigation. Match moments feel celebratory with a coral-to-violet burst; chats feel intimate with rounded bubbles and warm timestamps. Empty states encourage rather than scold. Designed to feel native on iPhone but elegantly scaled on desktop with a 480px-wide centered column. Hinge meets BeReal meets a Dribbble shot — never desperate, always inviting. Every interaction rewards: the spring of a card, the burst of a like, the warmth of a new match.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Playful, warm, encouraging — never desperate, never pushy
**CTA verbs:** Swipe, Like, Pass, Match, Send, View, Connect, Vibe
**Avoid:** Submit, Click here, Please enter, Buy now, Convert, Engage
**Empty states:** Encouraging — 'You've seen everyone nearby! Check back later.' / 'Keep swiping — your circle is forming.' Never use the word error or failure in empty states.
**Errors:** Friendly — 'That didn't work, try again?' / 'Looks like that's taken — try another?' Avoid blame language.
**Loading states:** Brief — 'Finding your circle…' / 'Bringing you new faces…' Never use spinning percentage indicators.
**Metrics format:** Lowercase units — '124 swipes', '18 matches', '4.2★ rating'. No commas in small numbers; no leading zeros.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** marketing-swipecircle + auth-full + onboarding-wizard + swipe-feed

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-swipecircle
  Purpose: Public marketing landing page for SwipeCircle — a mobile-first swipe-based social rating community. Photo-first hero with 'Rate. Connect. Vibe.' tagline, dual sign-up/log-in CTAs plus a demo mode entry, feature highlights showing the swipe loop, social proof, and a final conversion CTA. Optimized for casual consumer first-impressions.
  Features: marketing, seo, conversion, demo-mode

**Gateway** — centered shell
  Archetypes: auth-full, onboarding-wizard
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify. Gateway archetype for multi-step new-user onboarding flows. Three-step wizard pattern: account creation, profile completion (with photo upload), and interests selection. Each step occupies its own route on the centered shell with a stepper progress indicator at the top. Designed for consumer apps where post-auth profile completion is required before entering the primary app surface.
  Features: auth, mfa, oauth, email-verification, password-reset, photo-upload, step-validation, form-validation, interests-picker

**App** — mobile-tab-bar shell
  Archetypes: swipe-feed
  Purpose: Primary archetype for mobile-first swipe-based social discovery apps. Hosts the core swipe deck (discover), matches grid, chat list and thread, own/other profile views, and settings — all under a single mobile-tab-bar shell with persistent bottom navigation. The first archetype in Decantr's catalog purpose-built around a card-stack swipe loop with match celebration and 1:1 chat.
  Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts

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
| marketing-swipecircle | public | top-nav-footer | home | marketing, seo, conversion, demo-mode |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| onboarding-wizard | gateway | centered | account-step, profile-step, interests-step | auth, photo-upload, step-validation, form-validation, interests-picker |
| swipe-feed | primary | mobile-tab-bar | discover, matches, chat-list, chat-thread, profile-own, profile-other, settings | swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-swipecircle | home |
| /login | auth-full | login |
| /signup | onboarding-wizard | account-step |
| /onboarding/profile | onboarding-wizard | profile-step |
| /onboarding/interests | onboarding-wizard | interests-step |
| /discover | swipe-feed | discover |
| /matches | swipe-feed | matches |
| /chat | swipe-feed | chat-list |
| /chat/:userId | swipe-feed | chat-thread |
| /me | swipe-feed | profile-own |
| /u/:userId | swipe-feed | profile-other |
| /settings | swipe-feed | settings |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-marketing-swipecircle.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-onboarding-wizard.md
- .decantr/context/section-swipe-feed.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| cta-section | marketing-swipecircle/home, marketing-swipecircle/home, onboarding-wizard/account-step, onboarding-wizard/profile-step, onboarding-wizard/interests-step |
| auth-form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify, onboarding-wizard/account-step |
| onboarding-wizard | onboarding-wizard/account-step, onboarding-wizard/profile-step, onboarding-wizard/interests-step |
| form | onboarding-wizard/profile-step, swipe-feed/settings |
| hero | swipe-feed/discover, swipe-feed/matches, swipe-feed/chat-list |
| bottom-tab-bar | swipe-feed/discover, swipe-feed/matches, swipe-feed/chat-list, swipe-feed/chat-thread, swipe-feed/profile-own, swipe-feed/profile-other, swipe-feed/settings |
| stats-bar | swipe-feed/matches, swipe-feed/profile-own, swipe-feed/profile-other |
| mobile-profile-hero | swipe-feed/profile-own, swipe-feed/profile-other |
| tech-pills | swipe-feed/profile-own, swipe-feed/profile-other |
| settings-nav | swipe-feed/profile-own, swipe-feed/settings |

## Design Constraints

- **mode:** light
- **effects:** {"max_width_app":"480px","photo_aspect":"3/4","tab_bar_height":"64px","header_height":"52px","swipe_threshold":"30%","card_size":"320x420"}

## SEO Hints

**Schema.org types:** Organization, WebApplication, MobileApplication
**Meta priorities:** description, og:image, twitter:card, og:title

## Navigation

- Hotkeys: 7 configured
  - `ArrowLeft`: Pass on current card — swipe-pass
  - `ArrowRight`: Like current card — swipe-like
  - `ArrowUp`: Super-like current card — super-like
  - `g d`: Go to Discover — /discover
  - `g m`: Go to Matches — /matches
  - `g c`: Go to Chat — /chat
  - `g p`: Go to Profile — /me
- Requirement: implement these bindings as real keyboard shortcuts, not as decorative text.
- Presentation rule: do not append hotkey text to persistent nav labels, breadcrumbs, or page titles unless the shell or route contract explicitly requests visible shortcut hints.
