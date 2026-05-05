# Section: changelog-center

**Role:** auxiliary | **Shell:** top-nav-main | **Archetype:** changelog-center
**Description:** Versioned changelog with chronological release feed and individual release note pages. Tracks product evolution with migration guides and version diffs.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 2 (changelog, changelog-entry)
**Key patterns:** activity-feed, legal-prose
**CSS classes:** `.paper-card`, `.paper-fade`, `.paper-input`
**Density:** comfortable
**Voice:** Helpful and clear.

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
| `--d-text` | `#1A1918` | Body text, headings, primary content |
| `--d-accent` | `#E07B4C` |  |
| `--d-border` | `#E8E6E3` | Dividers, card borders, separators |
| `--d-primary` | `#2E8B8B` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-bg` | `#FDFCFA` | Page canvas / base layer |
| `--d-text-muted` | `#78756F` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#257575` | Hover state for primary elements |
| `--d-surface-raised` | `#F9F8F6` | Elevated containers, modals, popovers |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.paper-card` | Minimal card styling with 1px warm border, 6px radius, no shadow. Content over decoration. |
| `.paper-fade` | Entrance animation: opacity 0 to 1, 180ms natural easing. No translation. |
| `.paper-input` | Warm gray border with teal focus ring. Clean input styling for forms and editors. |
| `.paper-prose` | Optimized typography for reading. 16px base, 1.75 line-height, Inter font stack, max-width 680px. |
| `.paper-canvas` | Warm cream background in light mode, soft charcoal in dark. Clean foundation for content. |
| `.paper-cursor` | Remote cursor SVG with name label. Colored by collaborator presence color. |
| `.paper-comment` | Comment bubble with subtle shadow and presence color accent. Used in comment threads. |
| `.paper-divider` | Hairline separator using warm gray. Subtle content division. |
| `.paper-surface` | Clean panel surface with subtle warmth. Used for sidebars and elevated areas. |
| `.paper-presence` | Avatar ring indicating collaborator presence. Ring color matches assigned presence color. |
| `.paper-selection` | Highlighted text selection for remote collaborators. Tinted with presence color at 20% opacity. |

**Preferred:** activity-feed
**Compositions:** **auth:** Centered auth forms with clean card styling.
**editor:** Document editor with real-time collaboration. Page tree, editor, and comment sidebar.
**marketing:** Marketing pages with top nav and footer. Clean sections with generous whitespace.
**workspace:** Workspace dashboard with activity and recent documents.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface paper-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — top-nav-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

changelog, versions, migration-guides

---

## Visual Direction

**Personality:** Warm, reading-optimized documentation platform. Paper-like backgrounds with comfortable typography (65-75 character measure). AI-powered search with highlighted excerpts. Navigation tree on the left, content center, table-of-contents right. Feels like a well-designed textbook. Changelog entries feel celebratory. API reference is interactive. Lucide icons. Light mode default.

## Pattern Reference

### activity-feed

Chronological list of activity events with avatars, timestamps, and action descriptions

**Visual brief:** Vertical timeline of activity events grouped by date. Each date group starts with a muted, small-text date header. Individual feed items are horizontal rows: a circular avatar (with fallback initials) on the left, then a content block with the user name in medium-weight text followed by the action description in normal weight, and a relative timestamp (e.g. '2h ago') in small muted text right-aligned or below. Items are separated by subtle dividers or spacing. The compact preset drops avatars and uses small type-indicator icons instead. The detailed preset wraps each item in a bordered card with attachment previews and action buttons (reply, like).

**Components:** Avatar, Badge, Button

**Composition:**
```
FeedItem = Row(d-data-row, hoverable) > [Avatar(fallback-initials) + Content(flex-col) > [UserName(font-medium) + ActionText] + Timestamp(mono-data, text-xs, text-muted)]
DateGroup = Section > [DateHeader(d-annotation, text-muted) + FeedItem[]]
ActivityFeed = Container(d-data, flex-col, full-width) > [DateGroup[] + LoadMore?(d-interactive)]
```

**Layout slots:**
- `avatar`: User Avatar with fallback initials
- `content`: Action text with user name (_fontmedium) and description
- `feed-item`: Single activity row: _flex _row _gap3 _items[start]
- `load-more`: Button at bottom to load older activities
- `timestamp`: Relative time label with _textsm _fgmuted
- `date-header`: Date group separator with _textsm _fgmuted _fontmedium
  **Layout guidance:**
  - grouping: Group events by date. Date header: d-label with accent left-border. Today/Yesterday labels, then ISO dates.
  - empty_state: Encouraging: 'No activity yet. Publish your first item to see it here.'
  - event_treatment: Each event row: small colored dot (8px, color by event type) + timestamp (mono-data, text-xs) + description. Hover: subtle bg highlight.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Feed item rows highlight on hover with subtle background transition over 150ms. Action buttons in detailed preset scale on hover. |
| transitions | New activity items slide in from the top with 300ms ease-out translateY(-10px) to translateY(0) plus opacity 0 to 1. Staggered by 80ms per item when multiple arrive. Load-more items fade in from below. |

**Responsive:**
- **Mobile (<640px):** Full-width feed. Avatar size reduces to 32px. Timestamp moves below the content text instead of right-aligned. Detailed preset card actions stack vertically. Load-more button goes full-width.
- **Tablet (640-1024px):** Standard layout with avatars at 36px. Timestamp stays inline right-aligned. Comfortable spacing with gap3.
- **Desktop (>1024px):** Full layout with 40px avatars. Generous spacing. Detailed preset shows attachment previews inline. Actions row is fully horizontal.


### legal-prose

Styled legal documents with auto-generated TOC, smooth scroll navigation, collapsible sections, and print-friendly layout.

**Visual brief:** Long-form legal document layout with a sticky table of contents sidebar on the left and the prose content area on the right. The TOC auto-generates from heading hierarchy with indented sub-sections, highlighting the current section on scroll. The prose area uses comfortable reading typography — constrained line length, generous line height, numbered section headers, and proper paragraph spacing. A header shows the document title and 'Last updated' date. Footer contains contact information and version history link. The document is print-friendly with clean page breaks.

**Components:** Button, icon

**Layout slots:**
- `toc`: Sticky table of contents sidebar
- `footer`: Contact info and version history
- `header`: Title and last updated date
- `content`: Markdown prose content
**Responsive:**
- **Mobile (<640px):** TOC collapses into a dropdown menu at the top. Prose takes full width with comfortable reading margins. Sections stack with clear heading hierarchy.
- **Tablet (640-1024px):** TOC as a collapsible left drawer. Prose area takes remaining width with comfortable reading column.
- **Desktop (>1024px):** Full two-column layout — sticky TOC sidebar on the left (220px), prose content on the right with max-width for readability.


---

## Pages

### changelog (/changelog)

Layout: activity-feed

### changelog-entry (/changelog/:id)

Layout: legal-prose
