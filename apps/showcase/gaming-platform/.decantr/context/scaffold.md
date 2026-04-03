# Scaffold: gaming-community

**Blueprint:** gaming-platform
**Theme:** gaming-guild
**Personality:** High-energy gaming hub with bold, immersive visuals. Dark backgrounds with vibrant neon accents (electric blue, hot pink, lime green). Leaderboard tables use rank-colored highlights. Profile cards show achievement badges and stat bars. Game catalog uses large cover-art cards with hover-zoom effects. Competitive elements (rankings, win rates) are front and center. The vibe is Discord meets Steam — social, loud, and unapologetically gamer.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Energetic and direct. Speaks like a fellow gamer. Uses gaming vernacular where natural but stays readable.
**CTA verbs:** Play, Join, Challenge, Explore, Claim, Unlock
**Avoid:** Submit, Click here, Please enter, Purchase, Subscribe now
**Empty states:** Motivational and challenge-oriented. An empty leaderboard should dare the user to be the first to claim the top spot.
**Errors:** Brief and in-character. Connection failures can use gaming metaphors (lag, disconnect). Always offer a retry.
**Loading states:** Pulsing skeleton cards with neon accent borders. Progress bars use the accent palette. Leaderboard rows animate in sequentially.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** gaming-community + game-catalog + auth-flow + settings

### Zones

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — sidebar-main shell
  Archetypes: game-catalog
  Purpose: Game discovery and browsing with search, filters, and guild recruitment pages
  Features: search

**App (auxiliary)** — sidebar-main shell
  Archetypes: gaming-community, settings
  Purpose: Guild hub, news feed, hall of fame, and member profiles for social gaming communities Application settings and preferences page
  Features: guild-state, achievements, realtime-data

### Zone Transitions

  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)

### Default Entry Points

  Anonymous users enter: gateway
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| gaming-community | auxiliary | sidebar-main | main, news, hall-of-fame, member-profile | guild-state, achievements, realtime-data |
| game-catalog | primary | sidebar-main | games, join-guild | search |
| auth-flow | gateway | centered | login, register | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| /join | game-catalog | join-guild |
| /games | game-catalog | games |
| /login | auth-flow | login |
| /register | auth-flow | register |
| /settings | settings | settings |
| /community | gaming-community | main |
| /community/news | gaming-community | news |
| /community/members/:id | gaming-community | member-profile |
| /community/hall-of-fame | gaming-community | hall-of-fame |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-gaming-community.md
- .decantr/context/section-game-catalog.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| hero | gaming-community/main, game-catalog/join-guild |
| kpi-grid | gaming-community/main, gaming-community/member-profile |
| activity-feed | gaming-community/main, gaming-community/member-profile |
| filter-bar | gaming-community/news, game-catalog/games |
| timeline | gaming-community/hall-of-fame, gaming-community/member-profile |
| card-grid | game-catalog/games, game-catalog/join-guild |
| auth-form | auth-flow/login, auth-flow/register |

## SEO Hints

**Schema.org types:** WebApplication, SoftwareApplication
**Meta priorities:** description, og:title, og:description

## Navigation

- Command palette: enabled
- Hotkeys: 3 configured
