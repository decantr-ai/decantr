# Scaffold: team-operations

**Blueprint:** esports-hq
**Theme:** gaming-guild
**Personality:** Professional esports team operations hub with vibrant neon-accented rosters and live scoreboards. Player form trackers show sparklines of K/D ratios, win rates, and self-reported mood indicators. Scrim calendars map team availability to opponent windows. VOD review interface with frame-by-frame annotations and drawing tools. Sponsor dashboards track activation metrics. Think Overwatch League backstage. Lucide icons. Competitive.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Competitive and operational. Speaks to coaches, analysts, players, managers.
**CTA verbs:** Scrim, Review, Draft, Bench, Rotate, Analyze
**Avoid:** Manage, Handle
**Empty states:** No scrims scheduled. Reach out to the {region} captains.
**Errors:** VOD upload failed — file size exceeds 4GB limit.
**Loading states:** Loading match replay...

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** team-operations + scrim-scheduler + vod-review + sponsor-dashboard + marketing-esports + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-esports
  Purpose: Public marketing landing surface for an esports team operations platform with image-overlay hero, feature grid, testimonials, and final call to action.
  Features: marketing

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: team-operations
  Purpose: Primary esports team operations surface with team overview dashboard, player roster, and individual player profiles tracking form and activity.
  Features: team-management, rosters

**App (auxiliary)** — sidebar-main shell
  Archetypes: scrim-scheduler, vod-review, sponsor-dashboard, settings-full
  Purpose: Auxiliary esports scheduling surface for managing scrim calendars and inspecting match detail with live scoreboards and timelines. Auxiliary esports VOD review surface for browsing a library of match recordings and annotating frames with coaching notes and timestamps. Auxiliary esports sponsor surface for managing brand partnerships, tracking deal value, impressions, and activation metrics across sponsors. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: scheduling, calendars, vod-review, annotations, sponsors, deals, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| team-operations | primary | sidebar-main | overview, roster, player-detail | team-management, rosters |
| scrim-scheduler | auxiliary | sidebar-main | scrims, match-detail | scheduling, calendars |
| vod-review | auxiliary | sidebar-main | vods, vod-detail | vod-review, annotations |
| sponsor-dashboard | auxiliary | sidebar-main | sponsors, sponsor-detail | sponsors, deals |
| marketing-esports | public | top-nav-footer | home | marketing |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-esports | home |
| /team | team-operations | overview |
| /vods | vod-review | vods |
| /login | auth-full | login |
| /scrims | scrim-scheduler | scrims |
| /register | auth-full | register |
| /sponsors | sponsor-dashboard | sponsors |
| /vods/:id | vod-review | vod-detail |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /scrims/:id | scrim-scheduler | match-detail |
| /team/roster | team-operations | roster |
| /phone-verify | auth-full | phone-verify |
| /sponsors/:id | sponsor-dashboard | sponsor-detail |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /team/players/:id | team-operations | player-detail |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-team-operations.md
- .decantr/context/section-scrim-scheduler.md
- .decantr/context/section-vod-review.md
- .decantr/context/section-sponsor-dashboard.md
- .decantr/context/section-marketing-esports.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| kpi-grid | team-operations/overview, sponsor-dashboard/sponsor-detail |
| scoreboard-live | team-operations/overview, scrim-scheduler/match-detail |
| activity-feed | team-operations/overview, team-operations/player-detail |
| player-form-tracker | team-operations/roster, team-operations/player-detail |
| card-grid | team-operations/roster, vod-review/vods, sponsor-dashboard/sponsors |
| chart-grid | team-operations/player-detail, sponsor-dashboard/sponsor-detail |
| data-table | scrim-scheduler/scrims, vod-review/vods, sponsor-dashboard/sponsors |
| detail-header | scrim-scheduler/match-detail, sponsor-dashboard/sponsor-detail |
| timeline | scrim-scheduler/match-detail, vod-review/vod-detail |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, SportsTeam
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
