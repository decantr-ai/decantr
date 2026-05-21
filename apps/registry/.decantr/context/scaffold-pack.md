# Scaffold Pack

**Objective:** Scaffold the luminarum app shell and declared routes.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile, scan, privacy, terms, overview, content, content-new, api-keys, settings, billing, team, governance, private-registry, moderation-queue, commercial-reports, organizations, organization-detail, moderation-detail, telemetry, telemetry-usage, login, register, forgot-password | patterns=blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list, content-card-grid, command-rail, blueprint-anatomy, contract-explorer, json-viewer, detail-header, activity-feed, brownfield-scan, kpi-grid, reputation-badge, form, api-key-row, account-settings, tier-upgrade-card, team-member-row, moderation-queue-item, content-detail-hero, auth-form

## Scaffold Contract
- Shell: top-nav-main
- Shells: top-nav-main (primary), full-bleed, sidebar-main, centered
- Theme: luminarum (dark)
- Routing: pathname → pathname-based routing (Next.js App Router file conventions).
- Features: search, pagination, auth, api-keys, admin
- Navigation:
  - command palette required
  - Hotkeys:
    - g b: Browse Registry — /browse
    - g d: Dashboard — /dashboard
    - g s: Settings — /dashboard/settings

## Route Plan
- / -> registry-browser/homepage @ top-nav-main [blueprint-launch-hero, search-filter-bar, featured-launchpad-list, launchpad-flow, registry-link-list]
- /browse -> registry-browser/browse @ top-nav-main [search-filter-bar, content-card-grid]
- /browse/:type -> registry-browser/browse-type @ top-nav-main [search-filter-bar, content-card-grid]
- /:type/:namespace/:slug -> registry-browser/detail @ top-nav-main [blueprint-launch-hero, command-rail, blueprint-anatomy, contract-explorer, json-viewer]
- /profile/:username -> registry-browser/profile @ top-nav-main [detail-header, content-card-grid, activity-feed]
- /scan -> registry-browser/scan @ full-bleed [brownfield-scan]
- /privacy -> registry-browser/privacy @ top-nav-main [detail-header, registry-link-list]
- /terms -> registry-browser/terms @ top-nav-main [detail-header, registry-link-list]
- /dashboard -> user-dashboard/overview @ sidebar-main [kpi-grid, reputation-badge, activity-feed]
- /dashboard/content -> user-dashboard/content @ sidebar-main [content-card-grid]
- /dashboard/content/new -> user-dashboard/content-new @ sidebar-main [form, json-viewer]
- /dashboard/api-keys -> user-dashboard/api-keys @ sidebar-main [api-key-row]
- /dashboard/settings -> user-dashboard/settings @ sidebar-main [account-settings]
- /dashboard/billing -> user-dashboard/billing @ sidebar-main [tier-upgrade-card, kpi-grid]
- /dashboard/team -> user-dashboard/team @ sidebar-main [kpi-grid, team-member-row]
- /dashboard/governance -> user-dashboard/governance @ sidebar-main [kpi-grid, activity-feed, content-card-grid]
- /dashboard/private-registry -> user-dashboard/private-registry @ sidebar-main [search-filter-bar, content-card-grid]
- /admin/moderation -> admin-moderation/moderation-queue @ sidebar-main [search-filter-bar, moderation-queue-item]
- /admin/reports -> admin-moderation/commercial-reports @ sidebar-main [kpi-grid, activity-feed]
- /admin/organizations -> admin-moderation/organizations @ sidebar-main [search-filter-bar, content-card-grid, activity-feed]
- /admin/organizations/:slug -> admin-moderation/organization-detail @ sidebar-main [detail-header, kpi-grid, activity-feed, content-card-grid]
- /admin/moderation/:id -> admin-moderation/moderation-detail @ sidebar-main [content-detail-hero, json-viewer, moderation-queue-item]
- /admin/telemetry -> admin-moderation/telemetry @ sidebar-main [kpi-grid, search-filter-bar, activity-feed]
- /admin/telemetry/usage -> admin-moderation/telemetry-usage @ sidebar-main [kpi-grid, activity-feed, content-card-grid]
- /login -> auth-flow/login @ centered [auth-form]
- /login?mode=register -> auth-flow/register @ centered [auth-form]
- /login?mode=forgot-password -> auth-flow/forgot-password @ centered [auth-form]

## Required Theme Decorators (luminarum)

These classes carry the active theme's visual identity. Tokens alone give bones; decorators give personality. Generated source MUST apply these across all sections — without them, every page reads as "themed colors only" with no theme character. Section packs reference this table; the contract is project-wide.

| Class | Intent | Apply to |
|-------|--------|----------|
| `.lum-orbs` | Use behind hero and feature sections to create living, breathing visual energy. Position as background decoration behind content. | Hero section backgrounds, Feature section accents, Landing page backdrops |
| `.lum-brand` | Use for the brand name in navigation and headers. Colored punctuation creates a distinctive, memorable brand mark. | Brand logos, Navigation brand text, Footer brand marks |
| `.lum-glass` | Use for navigation and panel surfaces that need subtle elevation without competing with the vibrant card accents. | Navigation bars, Sidebar panels, Section containers |
| `.lum-canvas` | Use as the foundational page background to create the geometric canvas. The particle network adds depth and tech-forward energy. | Page root containers, App shell backgrounds |
| `.lum-divider` | Use between major page sections to create visual breathing room. The colored dot transitions the eye to the next section's accent. | Section dividers, Content breaks, Page section transitions |
| `.lum-fade-up` | Use as the entrance animation for sections appearing on scroll. The larger translate creates a more dramatic reveal. | Section reveals, Card entrance animations, Scroll-triggered content |
| `.lum-particles` | Use as a viewport-level decorative layer to add ambient visual interest. Fixed positioning keeps particles stable during scroll. | Viewport background layer, Ambient decoration |
| `.lum-stat-glow` | Use for numbered badges and step indicators. The filled circle with contrasting text creates a bold, readable counter. | Step numbers, Stat badges, Counter indicators, Ranking badges |
| `.lum-code-block` | Use for code examples and syntax-highlighted blocks. The colored top border ties the code block to its section's accent color. | Code blocks, API examples, Configuration snippets |
| `.lum-card-vibrant` | Use for high-impact feature cards that need maximum visual energy. Each card uses a different brand color gradient. | Feature highlight cards, Product cards, Pricing tiers, Call-to-action cards |
| `.lum-card-outlined` | Use for content cards in grids where each card should have a distinct accent color stroke. Ideal for process steps and feature lists. | Process step cards, Feature list items, Pipeline stages, Info cards |

## Required Setup
- Treat the declared routes as the topology source of truth.
- Preserve the resolved theme and shell contract unless the task explicitly mutates them.

## Allowed Vocabulary
- top-nav-main
- luminarum
- dark
- search
- pagination
- auth
- api-keys
- admin
- blueprint-launch-hero
- search-filter-bar
- featured-launchpad-list
- launchpad-flow
- registry-link-list
- content-card-grid
- command-rail
- blueprint-anatomy
- contract-explorer
- json-viewer
- detail-header
- activity-feed
- brownfield-scan
- kpi-grid
- reputation-badge
- form
- api-key-row
- account-settings
- tier-upgrade-card
- team-member-row
- moderation-queue-item
- content-detail-hero
- auth-form

## Success Checks
- Routes and page IDs match the compiled topology. [error]
- The declared shell contract is preserved unless the task explicitly mutates it. [error]
- Theme identity and mode remain consistent across scaffolded routes. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
