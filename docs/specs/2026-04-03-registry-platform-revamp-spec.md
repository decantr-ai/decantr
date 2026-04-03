# Registry Platform Blueprint Revamp

**Date:** 2026-04-03
**Status:** Approved
**Scope:** luminarum theme (dual mode), registry-platform blueprint (restructure), pattern enrichment, archetype updates

---

## Goal

Revamp the registry-platform blueprint to be as visually stunning as agent-marketplace. Add light+dark mode to luminarum theme, restructure the blueprint to match the real apps/web route structure, enrich all patterns with layout_hints, and refresh the personality.

---

## Section 1: Luminarum Theme — Dual Mode

### Background Shift
- Dark: `#0D0D1A` (cold navy) → `#141414` (warm charcoal)
- Light: NEW `#FAFAF9` (warm off-white)
- Mode: `["dark"]` → `["dark", "light"]`

### Full Palette (dark + light values)

| Token | Dark | Light |
|-------|------|-------|
| background | #141414 | #FAFAF9 |
| surface | #1E1E1E | #FFFFFF |
| surface-raised | #262626 | #F5F5F4 |
| border | #2E2E2E | #E7E5E4 |
| text | #FAFAFA | #1C1917 |
| text-muted | #A1A1AA | #78716C |
| primary | #FE4474 | #E11D48 |
| primary-hover | #FF5C8A | #BE123C |

### Seed
Keep: primary `#FE4474`, secondary `#0AF3EB`, accent `#FDA303`
Change: background `#0D0D1A` → `#141414`

### Decorators
All 11 decorators stay. Update `decorator_definitions` suggested_properties to use values that work in both modes (use CSS custom properties like `var(--d-bg)` instead of hardcoded hex where applicable).

### Spatial, Motion, Effects, Typography, Radius
No changes — these are mode-independent.

---

## Section 2: Blueprint Restructure

### Compose Array (4 archetypes, down from 6)

```json
"compose": [
  "registry-browser",
  "user-dashboard",
  "admin-moderation",
  { "archetype": "auth-flow", "prefix": "auth", "role": "gateway" }
]
```

Drop from compose: `content-editor`, `team-management`, `billing-portal`. Their pages are absorbed into `user-dashboard` or dropped.

### Archetype Updates

**registry-browser** — Add pages: `homepage` (marketing landing at `/`), `profile` (`/profile/:username`). Keep: browse, browse-type, detail.

**user-dashboard** — Absorb: `content-new` page (from content-editor), `billing` page (from billing-portal), `team` page (from team-management). Final pages: overview, content, content-new, api-keys, settings, billing, team.

**admin-moderation** — Keep as-is with just `moderation-queue` page.

**auth-flow** — Already exists. Compose with gateway role for login.

### Routes (14 total)

```json
{
  "/": { "page": "homepage", "shell": "top-nav-main", "archetype": "registry-browser" },
  "/browse": { "page": "browse", "shell": "top-nav-main", "archetype": "registry-browser" },
  "/browse/:type": { "page": "browse-type", "shell": "top-nav-main", "archetype": "registry-browser" },
  "/:type/:namespace/:slug": { "page": "detail", "shell": "top-nav-main", "archetype": "registry-browser" },
  "/profile/:username": { "page": "profile", "shell": "top-nav-main", "archetype": "registry-browser" },
  "/login": { "page": "login", "shell": "centered", "archetype": "auth-flow" },
  "/dashboard": { "page": "overview", "shell": "sidebar-main", "archetype": "user-dashboard" },
  "/dashboard/content": { "page": "content", "shell": "sidebar-main", "archetype": "user-dashboard" },
  "/dashboard/content/new": { "page": "content-new", "shell": "sidebar-main", "archetype": "user-dashboard" },
  "/dashboard/api-keys": { "page": "api-keys", "shell": "sidebar-main", "archetype": "user-dashboard" },
  "/dashboard/settings": { "page": "settings", "shell": "sidebar-main", "archetype": "user-dashboard" },
  "/dashboard/billing": { "page": "billing", "shell": "sidebar-main", "archetype": "user-dashboard" },
  "/dashboard/team": { "page": "team", "shell": "sidebar-main", "archetype": "user-dashboard" },
  "/admin/moderation": { "page": "moderation-queue", "shell": "sidebar-main", "archetype": "admin-moderation" }
}
```

### Features
```json
["search", "pagination", "auth", "api-keys", "validation", "admin", "team", "billing", "theme-toggle"]
```

### Navigation
```json
{
  "command_palette": true,
  "hotkeys": [
    { "key": "g b", "route": "/browse", "label": "Browse Registry" },
    { "key": "g d", "route": "/dashboard", "label": "Dashboard" },
    { "key": "g s", "route": "/dashboard/settings", "label": "Settings" }
  ]
}
```

### Personality
```
Vibrant design intelligence registry. Warm coral and amber accents on a rich dark canvas (or crisp warm-white in light mode). Content cards are the hero — outlined with colored type borders, hovering with purpose. Search is instant and faceted. Publishing feels like sharing art. The Decantr dogfood app — built with its own system, proudly showing what the platform produces. Think Figma Community meets shadcn/ui registry.
```

### Voice
```json
{
  "tone": "Welcoming and developer-friendly. Uses design-system terminology naturally. Celebrates community contributions.",
  "cta_verbs": ["Browse", "Publish", "Install", "Preview", "Fork", "Explore"],
  "avoid": ["Submit", "Click here", "Please enter", "Buy now", "Amazing"],
  "empty_states": "Encouraging and constructive. Empty content list links to publishing guide. No results suggests broadening filters or browsing popular items.",
  "errors": "Precise with error codes and affected resource IDs. Validation errors quote the failing field.",
  "loading": "Content card skeletons with type-colored top borders. Registry stats use counter animations. Search results stream in as they resolve."
}
```

---

## Section 3: Pattern Enrichment — layout_hints

Add layout_hints to all patterns used by registry-platform that don't have them:

### content-card-grid
```json
"layout_hints": {
  "card_treatment": "Each card uses lum-card-outlined: transparent bg, colored border-left (3px) by content type — coral for patterns, amber for themes, cyan for blueprints, green for shells. Hover: border-color intensifies + translateY(-2px) + subtle shadow.",
  "card_content": "Card shows: type badge (d-annotation) top-left, title (font-semibold), namespace-badge, one-line description, bottom row: version + download count + compatibility badge. All in a clean vertical stack with gap-2.",
  "grid_layout": "Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile. Gap: 1rem. Cards should be equal height within each row."
}
```

### content-detail-hero
```json
"layout_hints": {
  "hero_layout": "Full-width section with breadcrumb trail at top (type > namespace > slug). Large title (heading2) with namespace-badge inline. Metadata row below: version, downloads, last updated, compatibility indicators. For themes: show live color swatch preview. For patterns: show component count + slot summary.",
  "background": "Subtle gradient matching the content type color at 5-8% opacity, fading to var(--d-bg). Creates a warm header zone.",
  "actions": "Right-aligned action buttons: Install (primary), Preview (ghost), Fork (ghost). On mobile: full-width stacked."
}
```

### search-filter-bar
```json
"layout_hints": {
  "search_input": "Full-width search input with magnifying glass icon. On focus: border transitions to accent color. Placeholder: 'Search patterns, themes, blueprints...'",
  "filter_tabs": "Type tabs below search: All, Patterns, Themes, Blueprints, Shells. Active tab uses primary bg with white text (pill shape). Inactive: ghost style.",
  "sort_dropdown": "Right-aligned sort: Relevance, Most Downloaded, Recently Updated, Name A-Z."
}
```

### kpi-grid
```json
"layout_hints": {
  "stat_treatment": "Each KPI card uses lum-stat-glow: filled circle in accent/primary color with the number inside (dark text on light bg). Label below in text-muted. Sparkline trend line to the right.",
  "animation": "Counter animation on mount — numbers count up from 0 to final value over 500ms."
}
```

### activity-feed, api-key-row, moderation-queue-item, team-member-row, tier-upgrade-card, reputation-badge, namespace-badge, json-viewer
Each gets 2-3 layout_hints appropriate to its content (card treatments, spacing, hover states, visual hierarchy).

### account-settings
Add missing `visual_brief`.

### Homepage (new page)
The homepage needs its own hero pattern instance with registry-specific content: "Design Intelligence Registry" heading, centered search bar, featured/popular content carousel, stats bar (pattern count, theme count, active publishers).

---

## Section 4: Archetype Updates

### registry-browser — Add Pages

Add to archetype pages:
```json
{
  "id": "homepage",
  "default_layout": ["hero", "search-filter-bar", "content-card-grid", "kpi-grid"],
  "shell": "top-nav-main",
  "notes": "Marketing landing for the registry. Hero with search, featured content grid, stats."
},
{
  "id": "profile",
  "default_layout": ["detail-header", "content-card-grid", "activity-feed"],
  "shell": "top-nav-main",
  "notes": "Public user profile showing published items and activity."
}
```

Add `page_briefs` for new pages.

### user-dashboard — Absorb Pages

Add pages from dropped archetypes:
```json
{
  "id": "content-new",
  "default_layout": ["form", "json-viewer"],
  "shell": "sidebar-main"
},
{
  "id": "billing",
  "default_layout": ["tier-upgrade-card", "kpi-grid"],
  "shell": "sidebar-main"
},
{
  "id": "team",
  "default_layout": ["kpi-grid", "team-member-row"],
  "shell": "sidebar-main"
}
```

Add `page_briefs` for absorbed pages.

---

## Package Impact

| Item | Repo | Change |
|------|------|--------|
| luminarum.json | decantr-content | Dual mode palette, bg shift, mode array |
| registry-platform.json | decantr-content | Full rewrite: compose, routes, personality, voice, features, navigation |
| registry-browser.json | decantr-content | Add homepage + profile pages |
| user-dashboard.json | decantr-content | Add content-new, billing, team pages |
| 12 pattern files | decantr-content | Add layout_hints |
| account-settings.json | decantr-content | Add missing visual_brief |

No monorepo code changes. No CLI changes. No package publishes. Content-only.

---

## Implementation Checklist

### Theme
- [ ] Update luminarum.json: palette with dark+light values, shift dark bg to #141414, add "light" to modes, update seed.background
- [ ] Update decorator_definitions suggested_properties for dual-mode compatibility

### Blueprint
- [ ] Rewrite registry-platform.json: compose (4 archetypes), routes (14), personality, voice, features (add theme-toggle), navigation

### Archetypes
- [ ] Add homepage + profile pages to registry-browser
- [ ] Add content-new + billing + team pages to user-dashboard
- [ ] Add page_briefs for all new pages
- [ ] Verify auth-flow archetype exists and has login page

### Patterns
- [ ] Add layout_hints to content-card-grid
- [ ] Add layout_hints to content-detail-hero
- [ ] Add layout_hints to search-filter-bar
- [ ] Add layout_hints to kpi-grid
- [ ] Add layout_hints to activity-feed
- [ ] Add layout_hints to api-key-row
- [ ] Add layout_hints to moderation-queue-item
- [ ] Add layout_hints to team-member-row
- [ ] Add layout_hints to tier-upgrade-card
- [ ] Add layout_hints to reputation-badge
- [ ] Add layout_hints to namespace-badge
- [ ] Add layout_hints to json-viewer
- [ ] Add visual_brief to account-settings

### Validate & Push
- [ ] Run validate.js — 0 errors, 0 warnings
- [ ] Push to main — auto-syncs to registry

### Test
- [ ] Scaffold fresh: `decantr init --blueprint=registry-platform --yes` in apps/showcase/registry-platform
- [ ] Run harness
