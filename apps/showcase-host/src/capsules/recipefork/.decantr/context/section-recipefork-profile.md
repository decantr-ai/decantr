# Section: recipefork-profile

**Role:** auxiliary | **Shell:** recipefork-top-nav | **Archetype:** recipefork-profile
**Description:** Current-user and public profile surfaces for Recipefork with editable identity, a dedicated owner recipe workspace, public recipe/cookbook grids, follower stats, owner-only branch analytics, recent activity, and social navigation back into recipes and cookbooks.

## Quick Start

**Shell:** Shared Recipefork application shell with sticky top nav, compact utility actions, and a wide scrollable content region below. Mirrors the current app's persistent nav model across public and authenticated product routes. (header: 64px)
**Pages:** 3 (me, my-recipes, public-profile)
**Key patterns:** creator-profile [moderate], account-settings [moderate], stats-overview, card-grid [moderate], filter-bar [moderate], recipefork-activity-feed [moderate]
**Density:** comfortable
**Voice:** Encouraging, practical, and food-aware without becoming gimmicky.

## Shell Implementation (recipefork-top-nav)

### root

- **display:** flex
- **direction:** column
- **min_height:** 100vh
- **atoms:** _flex _col _minh[100vh]

### header

- **height:** 64px
- **display:** flex
- **align:** center
- **justify:** space-between
- **padding:** 0 1rem
- **border:** bottom
- **sticky:** true
- **z_index:** 20
- **background:** recipefork-nav
- **left_content:** Brand icon + Recipefork wordmark
- **center_content:** Home, Chat, Generate, Feed, Cookbooks navigation links
- **right_content:** Create Recipe CTA + theme toggle + notification bell + profile button or sign-in button + mobile menu trigger
- **button_sizing:** Use compact controls. Create CTA should feel prominent but still fit inside the 64px row without oversized padding.

### body

- **flex:** 1
- **overflow_y:** auto
- **padding:** 0
- **atoms:** _flex1 _overflow[auto]
- **note:** Individual pages own their spacing. Preserve the wide, app-like content region used by feed, recipe detail, profile, and authoring pages.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: comfortable (--d-density-scale: 1)

## Shell Notes (recipefork-top-nav)

- **Nav Identity:** Brand mark on the left, route links in the center-left, create CTA plus utility actions on the right. Keep the overall feel product-like rather than marketing-heavy.
- **Mobile Menu:** Collapse route links into a dropdown or menu button below md breakpoint. The create action may stay visible as an icon button or move into the menu when width is constrained.
- **Auth Variation:** Unauthenticated states may still reuse the same shell. Swap the profile entry for a sign-in button while keeping spacing and alignment stable.
- **Notification Behavior:** Authenticated states include a bell menu in the utility cluster. The bell should expose unread count, recent follow/comment/reaction/save/fork activity, and quick mark-as-read behavior without forcing a dedicated page route.

## Theme Reference

**Theme:** recipefork (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 6 `recipefork-*` classes — full Class/Intent/Apply-to table in `section-recipefork-profile-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** card-grid
**Spatial hints:** Density bias: none. Section padding: 4rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface recipefork-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — recipefork-top-nav shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

profile-editing, follows, collections, activity-feed, public-profiles, branch-analytics

---

## Visual Direction

**Personality:** Recipefork is a neutral, production-grade recipe product that lets food photography and authoring depth carry the experience. Public browsing feels clean and modern; Chef Mode is the critical differentiator, with structured ingredients, nested instruction groups, optional plating presentation, dynamic cooking tips, explicit recipe visibility controls, draft workflows, and no-loss hydrated editing.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### creator-profile

Public creator page layout with hero, tiers, content feed, and about section. Tab-based navigation.

**Components:** Button, Card, Tabs, icon

**Layout slots:**
- `hero`: Storefront hero pattern
- `tabs`: Posts, About, Tiers navigation
- `content`: Tab content area
- `tiers-sidebar`: Optional tier cards sidebar
  **Layout guidance:**
  - hero_priority: Lead with creator identity, subscribe intent, and social proof in the hero. The rest of the page should feel like a structured deepening of that first impression.
  - tab_rhythm: Tabs should act as the structural switch between content modes, not as decorative navigation. Keep the active tab visually obvious and the tab content frame stable.
  - embed_scope: Embed mode should behave like a focused conversion unit. Strip away broad profile storytelling and preserve only the identity, subscriber signal, and clear CTA.

### account-settings

Account management workspace with responsive settings navigation, grouped forms, and stable save/action zones for profile, security, preferences, and danger-zone flows.

**Components:** Button, Avatar, Badge, icon

**Layout slots:**
- `nav`: Responsive settings navigation using vertical tabs on larger widths and horizontal tabs on small screens
- `avatar`: Avatar with upload/change button
- `form`: Name, email, bio inputs grouped in a content panel
- `save`: Save changes button in a stable action zone
  **Layout guidance:**
  - active_state: Active nav/tab item should have a visible indicator: accent-colored left border (for vertical nav) or bottom border (for horizontal tabs), plus accent text color.
  - nav_position: For settings pages, use a vertical tab nav on the left at larger widths. On small screens, switch to a horizontal scrollable tab strip or segmented control without changing the content spacing rhythm.
  - spacing: Nav items have consistent padding. Active item stands out but doesn't shift layout. Content cards should share the same shell inset rhythm as the rest of the dashboard.
  - cta_treatment: Primary save/update actions should sit in a stable action zone and feel distinct from secondary utility buttons such as avatar change, sign out, or cancel.

### stats-overview

Summary row of key statistics with labels, values, and optional trend indicators

**Components:** Card, Badge, icon

**Layout slots:**
- `stat-card`: Card containing label, value, and optional trend
- `label`: Metric label with _textsm _fgmuted
- `value`: Primary value with _heading2 _fontbold
- `trend`: Badge with percentage change and directional icon
  **Layout guidance:**
  - grid_ownership: The pattern owns the internal stat grid only. Parent workspace or section patterns should provide the intro copy, surrounding card frame, and larger vertical rhythm.
  - card_balance: Each stat card should keep label, value, and trend tightly grouped so the row scans left-to-right without extra decorative chrome. Trend indicators should support the value, not become a second headline.
  - highlighted_variant: When using the highlighted preset, the featured stat may grow in prominence, but secondary stats should remain aligned as one coherent summary system rather than turning into unrelated cards.

### card-grid

Responsive grid of cards with preset-specific content layouts

**Components:** Card, CardHeader, CardBody, CardFooter, Image, Button, Badge

**Layout slots:**
- `card-image`: Product image with aspect-ratio container
- `card-title`: Product name with _textsm _fontmedium
- `card-price`: Price with _heading4 styling
- `card-rating`: Star rating row with icon stars and count Badge
- `card-action`: Add-to-cart Button in CardFooter
  **Layout guidance:**
  - card_surface: Each item should feel like one coherent card surface. Do not wrap grid items in an extra shell-level d-surface if the pattern already provides the card treatment.
  - description_clamp: Allow enough room for meaningful summary copy. In most content grids, descriptions should get at least two to three lines before truncation.
  - footer_rhythm: Meta rows and CTA rows should align consistently across cards. Footers should not jump vertically between items in the same grid.
  - hover_behavior: Use CSS-driven hover lift or media scaling rather than inline event handlers that mutate style values in component code.
  - icon_preset_scope: The icon preset is intentionally compact. Use it for icon + title + short description only, not for longer body copy plus nested capability rows.
  - capability_preset_scope: When a route needs richer category cards with supporting rows or badges, use the capability preset and keep the grid to one, two, or three columns rather than forcing a compact four-up layout.
  - nested_surface_avoidance: Capability cards should read as one card surface. Avoid creating a card within a card or wrapping each supporting row in its own mini-panel unless a route explicitly asks for nested grouping.

### filter-bar

Search input and filter controls for filtering page content. Sits above data-consuming patterns like data-table, card-grid, and activity-feed.

**Components:** Input, Select, Button, Badge, icon

**Layout slots:**
- `search`: Search Input with placeholder text
- `filters`: One or more Select dropdowns for category/status filtering
- `actions`: Action Buttons (clear, apply, etc.)
  **Layout guidance:**
  - control_priority: Search and primary filters should read as one coherent control band. Secondary filters belong in an expandable surface before they crowd the main row.
  - chip_rhythm: Active-filter chips should wrap cleanly and remain clearly dismissible without turning the bar into a chip cloud.
  - mobile_behavior: Collapsed mobile filters must preserve the same filter model as desktop, not introduce a different semantic ordering.

### recipefork-activity-feed

Recipefork-flavored community activity rail with publish, fork, follow, comment, reaction, and cookbook events rendered as linked preview cards.

**Visual brief:** A right-rail social surface that feels native to Recipefork rather than like a generic audit log. Each event has enough food or cookbook imagery to stay visually connected to the product, with compact event-type cues and lightweight timestamps.

**Components:** Card, Image, Avatar, Badge, Button, icon

**Composition:**
```
RecipeforkActivityFeed = Stack(recipefork-rail) > [FilterChips + EventCard*]
```

**Layout slots:**
- `filters`: Compact event filter chips for all, recipes, social, and cookbooks
- `event-card`: Linked activity card with preview image, icon chip, summary, actor attribution, and timestamp

---

## Pages

### me (/profile)

Layout: creator-profile (standard) → account-settings (standard) → stats-overview (standard) → card-grid (content) → card-grid (collection)

### my-recipes (/recipes)

Layout: stats-overview (standard) → filter-bar (standard) → card-grid (content)

### public-profile (/profile/:id)

Layout: creator-profile (standard) → stats-overview (standard) → card-grid (content) → card-grid (collection) → recipefork-activity-feed (preview-cards)
