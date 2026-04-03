# Section: fan-storefront

**Role:** auxiliary | **Shell:** top-nav-main | **Archetype:** fan-storefront
**Description:** Public creator storefront for fans. Browse content, view tiers, and subscribe to creators.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 2 (profile, post)
**Key patterns:** creator-profile [moderate], post-list [moderate]
**CSS classes:** `.studio-card`, `.studio-glow`, `.studio-input`
**Density:** comfortable
**Voice:** Warm, encouraging, and creator-supportive.

## Shell Implementation (top-nav-main)

### body

- **gap:** 1rem
- **flex:** 1
- **note:** Full-width scrollable content area below the nav bar.
- **atoms:** _flex _col _gap4 _p6 _overflow[auto] _flex1
- **padding:** 1.5rem
- **direction:** column
- **overflow_y:** auto

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **nav_links:** Nav links use text-sm font-medium with no background. Hover: text color transitions to primary. Active: font-semibold or underline-offset-4.
- **background:** var(--d-bg)
- **left_content:** Brand/logo link
- **button_sizing:** Buttons and CTAs in the header must use compact sizing: py-1.5 px-4 text-sm (not the default d-interactive padding). The header is 52px — buttons should be ~32px tall, not 40px+.
- **right_content:** Theme toggle (sun/moon icon, toggles light/dark class on html element) + Search trigger + CTA button or user avatar. Theme toggle uses a simple icon button — no dropdown.
- **center_content:** Nav links — flex with gap 1.5rem

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Spacing Guide

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Content gap | `--d-content-gap` | `1rem` | Gap between sibling elements |
| Section padding | `--d-section-py` | `5rem` | Vertical padding on d-section |
| Surface padding | `--d-surface-p` | `1.25rem` | Inner padding for d-surface |
| Interactive V | `--d-interactive-py` | `0.5rem` | Vertical padding on buttons |
| Interactive H | `--d-interactive-px` | `1rem` | Horizontal padding on buttons |
| Control | `--d-control-py` | `0.5rem` | Vertical padding on inputs |
| Data row | `--d-data-py` | `0.625rem` | Vertical padding on table rows |

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Key palette tokens:**

| Token | Value | Role |
|-------|-------|------|
| `--d-text` | `#1C1917` | Body text, headings, primary content |
| `--d-accent` | `#14B8A6` |  |
| `--d-border` | `#E7E5E4` | Dividers, card borders, separators |
| `--d-primary` | `#F97316` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#8B5CF6` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAF9F7` | Page canvas / base layer |
| `--d-text-muted` | `#78716C` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#EA580C` | Hover state for primary elements |
| `--d-surface-raised` | `#F5F3F0` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#7C3AED` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.studio-card` | Surface background, soft shadow, 12px radius, hover lift transition. |
| `.studio-glow` | Subtle primary-tinted glow effect for call-to-action buttons. |
| `.studio-input` | Warm border with coral focus ring and gentle glow effect. Friendly input styling. |
| `.studio-canvas` | Warm background using theme background token. Friendly, inviting foundation. |
| `.studio-divider` | Warm hairline separator using border-color token. |
| `.studio-fade-up` | Entrance animation: opacity 0 to 1, translateY 16px to 0, 250ms ease-out. |
| `.studio-surface` | Soft surface elevation with 1px warm border and subtle shadow. Uses surface background. |
| `.studio-skeleton` | Loading placeholder with warm pulse animation. |
| `.studio-gate-blur` | Backdrop blur effect for content behind paywalls. |
| `.studio-badge-tier` | Tier badge with gradient backgrounds for subscription levels. |
| `.studio-card-premium` | Premium card with purple gradient border for exclusive content. |
| `.studio-avatar-creator` | Larger creator avatar with accent ring highlight. |

**Compositions:** **auth:** Centered auth forms with warm card styling.
**checkout:** Minimal checkout flow with focused content area.
**dashboard:** Creator dashboard with sidebar navigation. Analytics, content management, subscriber views.
**marketing:** Marketing pages with top nav and footer. Clean sections with warm accents.
**storefront:** Fan-facing storefront with top navigation. Creator profiles, content browsing.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: soft.


Usage: `className={css('_flex _col _gap4') + ' d-surface studio-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — top-nav-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

creator-profile, tier-display, content-preview, subscribe-flow

---

## Visual Direction

**Personality:** Warm, creator-first monetization platform that celebrates creative work. Light theme with soft gradients and rounded cards. Creator profiles are visually rich — large cover images, prominent avatars, and tier cards with benefit previews. Earnings dashboards use approachable chart styles (rounded bars, smooth lines) in warm accent tones. The fan storefront feels like a boutique, not a marketplace. Premium tiers get subtle visual elevation. Think Patreon meets Gumroad with a Dribbble-level polish.

## Pattern Reference

### creator-profile

Public creator page layout with hero, tiers, content feed, and about section. Tab-based navigation.

**Visual brief:** Full-width creator page starting with a storefront hero section (cover image, avatar, creator name, bio, follower count, subscribe CTA). Below the hero, a horizontal tab bar with tabs for Posts, Memberships, About, and Community. The tab content area fills the remaining space — Posts tab shows a content feed, Memberships tab shows tier cards, About tab shows a rich text bio with social links. Embed preset removes the hero and shows a compact card version suitable for embedding on external sites.

**Components:** Button, Card, Tabs, icon

**Composition:**
```
Hero = Section(full-width) > [CoverImage + Avatar(large) + CreatorName(heading2) + Bio(text-muted) + Stats + SubscribeCTA(d-interactive)]
TabBar = Row(d-control) > Tab(d-interactive)[]
TabContent = Panel(d-surface) > [PostsFeed? + TierCards? + AboutSection?]
CreatorProfile = Container(d-section, flex-col) > [Hero + TabBar(d-control) + TabContent]
```

**Layout slots:**
- `hero`: Storefront hero pattern
- `tabs`: Posts, About, Tiers navigation
- `content`: Tab content area
- `tiers-sidebar`: Optional tier cards sidebar
**Responsive:**
- **Mobile (<640px):** Hero cover image reduces in height. Tabs become horizontally scrollable. Content feed is single-column full-width.
- **Tablet (640-1024px):** Standard hero proportions. Tabs fit in a single row. Content area has comfortable margins.
- **Desktop (>1024px):** Full-width hero with generous cover image. Content area centered with max-width constraint. All tabs visible.


### post-list

Chronological list of posts, articles, or news items with author, date, and preview.

**Visual brief:** Vertical list of post items in chronological order. Each post row shows a title link in medium-weight text, an author name, publish date in muted text, and a two-line preview excerpt. Posts are separated by subtle dividers or spacing. The compact preset reduces to title and date only, one line per item. The cards preset wraps each post in a bordered card with optional thumbnail image on the left, title, excerpt, author avatar, and date. Featured posts may have a 'Featured' badge.

**Components:** Card, Badge, Avatar, Text, icon

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Full-width post items. Cards preset uses vertical card layout with image on top. Excerpts limited to one line.
- **Tablet (640-1024px):** Standard list or card layout with comfortable spacing.
- **Desktop (>1024px):** Posts in a centered content column. Cards preset shows image on the left with text on the right.


---

## Pages

### profile (/creator/:username)

Layout: creator-profile → tier-comparison

### post (/creator/:username/post/:id)

Layout: post-list → paywall
