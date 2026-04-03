# Section: document-editor

**Role:** primary | **Shell:** workspace-aside | **Archetype:** document-editor
**Description:** Real-time collaborative document editing with presence indicators, remote cursors, inline comments, and version history.

## Quick Start

**Shell:** Three-column layout for collaborative editing with page tree navigation, document editor body, and comment/activity sidebar. Used by document-editor archetype for real-time collaboration. (nav: 240px, header: 52px)
**Pages:** 1 (doc)
**Key patterns:** nav-header, presence-avatars, doc-editor
**CSS classes:** `.paper-card`, `.paper-fade`, `.paper-input`
**Density:** comfortable
**Voice:** Warm, collaborative, and productivity-focused.

## Shell Implementation (workspace-aside)

### body

- **flex:** 1
- **note:** Document editor area. Scrollable. Editor mode enabled.
- **atoms:** _flex _col _overflow[auto] _p8
- **padding:** 2rem
- **direction:** column
- **overflow_y:** auto

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: sidebar 1fr aside; rows: 52px 1fr

### aside

- **body:**
  - flex: 1
  - note: Comment/activity thread.
  - padding: 1rem
  - overflow_y: auto
- **note:** Right comment/activity sidebar. Toggleable. When collapsed, shows a floating message-square icon button to reopen.
- **atoms:** _flex _col _borderL _bgbg _overflow[auto]
- **width:** 280px
- **border:** left
- **header:**
  - align: center
  - border: bottom
  - content: Comments label + close button
  - display: flex
  - justify: space-between
  - padding: 1rem
- **direction:** column
- **background:** var(--d-bg)
- **collapsible:** true
- **collapse_breakpoint:** xl

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **grid_span:** column 2/4
- **background:** var(--d-bg)
- **left_content:** Document title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Share button + collaborator avatars (stacked, max 4 + overflow count) + notifications + user avatar

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 0.25rem
  - overflow_y: auto
  - item_content: Page icon (emoji) + page title (truncated). Collapsed: icon only.
  - item_padding: 0.5rem
- **atoms:** _flex _col _bgmuted _borderR
- **brand:**
  - align: center
  - border: bottom
  - height: 52px
  - content: Pages heading + collapse toggle
  - display: flex
  - justify: space-between
  - padding: 0.75rem
- **width:** 240px
- **border:** right
- **footer:**
  - border: top
  - content: New Page button (full-width outline)
  - padding: 0.5rem
- **position:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-surface)
- **collapsed_width:** 48px
- **collapse_breakpoint:** lg

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

**Preferred:** doc-editor, presence-avatars
**Compositions:** **auth:** Centered auth forms with clean card styling.
**editor:** Document editor with real-time collaboration. Page tree, editor, and comment sidebar.
**marketing:** Marketing pages with top nav and footer. Clean sections with generous whitespace.
**workspace:** Workspace dashboard with activity and recent documents.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface paper-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — workspace-aside shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

realtime, presence, comments, mentions, versioning, sharing, export, markdown, slash-commands

---

## Visual Direction

**Personality:** Warm, distraction-free collaboration workspace built for focused teamwork. Light paper-like backgrounds with comfortable reading typography. Presence indicators use distinct warm colors per collaborator. Inline comments appear as subtle margin annotations. Page tree navigation is clean and collapsible. The document editor prioritizes content over chrome — toolbar hides on scroll, formatting is keyboard-first. Real-time cursors and selections feel natural, not distracting. Think Notion meets Google Docs — productive, polished, and genuinely collaborative.

## Pattern Reference

### nav-header

Top navigation bar with logo, links, and actions.

**Visual brief:** Horizontal navigation bar pinned to the top of the viewport. The bar spans full width with a subtle bottom border separating it from page content. Logo or wordmark sits on the far left with comfortable left padding. Navigation links are arranged horizontally in the center (or left-of-center) with even spacing and medium-weight text that highlights on hover with an underline or color shift. Action buttons (login, sign up) cluster on the far right — the primary action uses a filled button, secondary uses ghost. The bar has a fixed height (~60px) with vertically centered content. On scroll, the header may gain a subtle backdrop blur and elevated shadow.

**Components:** Button, Link, icon

**Composition:**
```
NavLinks = Row(d-interactive, gap-4) > Link(hover: underline)[]
NavHeader = Bar(d-section, row, space-between, border-bottom, full-width) > [Logo + NavLinks + ActionButtons]
ActionButtons = Row(d-interactive, gap-2) > [LoginButton(variant: ghost) + SignUpButton(variant: primary)]
```

**Layout slots:**
- `logo`: Brand logo or wordmark, left-aligned
- `links`: Horizontal navigation links with _flex _gap4
- `actions`: Action buttons (login, signup) right-aligned with _flex _gap2
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Link hover underline slides in from left with 200ms ease. Dropdown chevron rotates 180deg on open. Active link indicator transitions position with 250ms ease. |
| transitions | Mobile menu slides in from right with 300ms ease-out transform. Backdrop fades in over 200ms. Dropdown menus fade in and translate down 4px over 200ms. Sticky header shadow transitions in over 150ms on scroll. |

**Responsive:**
- **Mobile (<640px):** Navigation links collapse into a hamburger menu icon (three horizontal lines) on the right. Tapping the hamburger opens a full-height slide-in panel from the right or a dropdown overlay with vertically stacked links and action buttons. Logo remains visible. Close button (X icon) in the panel header.
- **Tablet (640-1024px):** Navigation links may remain visible if few (3-4 items), otherwise collapse to hamburger. Action buttons stay visible next to hamburger. Padding reduces to px4.
- **Desktop (>1024px):** Full horizontal layout with all links visible. Logo left, links center, actions right. Hover states on links. Dropdown menus open on hover or click for nested navigation.

**Accessibility:**
- Role: `navigation`
- Keyboard: Tab navigates between navigation links and action buttons; Enter activates the focused link or button; Escape closes the mobile menu or open dropdown; Arrow Left/Right navigates between top-level links; Arrow Down opens a dropdown menu on focused link
- Announcements: Navigation menu expanded; Navigation menu collapsed; Submenu {name} opened
- Focus: Mobile menu button uses aria-expanded to reflect open/closed state. On menu open, focus moves to first link. On Escape, focus returns to the hamburger button.


### presence-avatars

Horizontal stack of collaborator avatars showing who is currently viewing or editing. Each avatar has a unique presence color ring.

**Visual brief:** Horizontal stack of overlapping circular avatar images, each with a colored ring border indicating their presence state (green for active, yellow for idle, gray for offline). Avatars overlap by about 25% of their diameter. When there are more avatars than can be shown, a '+N' overflow indicator appears at the end as a circular badge with a muted background. Hovering any avatar shows a tooltip with the collaborator's name and status. The detailed preset adds a dropdown panel on click showing all collaborators with name, role, and status. The compact preset reduces avatar size to 24px.

**Components:** Avatar, Button, Tooltip

**Composition:**
```
AvatarStack = Row(negative-margin) > Avatar(ring-color: presence-state, tooltip: name)[]
OverflowBadge = Badge(d-annotation, muted-bg, circular) > PlusCount
PresenceAvatars = Row(d-section, overlapping) > [AvatarStack + OverflowBadge?]
```

**Layout slots:**
- `avatars`: Stacked avatar images with presence color ring
- `tooltip`: Hover shows full name and status
- `overflow`: +N more indicator
**Responsive:**
- **Mobile (<640px):** Avatars at 28px. Maximum 3-4 visible with overflow indicator. Tooltip replaced by tap-to-reveal.
- **Tablet (640-1024px):** Avatars at 32px. Up to 6 visible. Tap or hover for tooltip.
- **Desktop (>1024px):** Avatars at 36px. Up to 8 visible. Hover tooltips. Detailed preset dropdown on click.


### doc-editor

Rich text block editor with real-time collaboration support. CRDT-based synchronization, floating toolbar, slash commands, and remote cursor overlay.

**Visual brief:** Contenteditable block-based document area occupying the main content region. Each block (paragraph, heading, list, image, code) is a discrete editable unit. A floating formatting toolbar appears on text selection. Typing '/' at the start of a block opens a slash command menu. Remote collaborator cursors appear as colored caret lines with name labels. Remote selections render as colored highlights. The top area may include a document title field. Minimal preset hides all chrome except the content. Presentation preset uses larger type sizes and hides editing UI.

**Components:** Button, Avatar, icon

**Composition:**
```
DocEditor = Container(d-section, flex-col, full-height, relative) > [CursorsLayer + SelectionsLayer + ContentArea + FloatingToolbar? + SlashMenu? + MentionPopup?]
ContentArea = Editor(d-surface, contenteditable) > Block[]
CursorsLayer = Overlay(absolute) > RemoteCursor(colored, named)[]
FloatingToolbar = Bar(d-control, floating, on-selection)
```

**Layout slots:**
- `content`: Contenteditable block container
- `toolbar`: Floating formatting toolbar on selection
- `slash-menu`: Block type command palette
- `cursors-layer`: Overlay for remote collaborator cursors
- `mention-popup`: @mention autocomplete dropdown
- `selections-layer`: Overlay for remote text selections
**Responsive:**
- **Mobile (<640px):** Full-width editor with bottom-fixed formatting toolbar above the keyboard. Slash menu takes full width. Remote cursors show abbreviated names.
- **Tablet (640-1024px):** Standard editor layout. Floating toolbar near selection. Comfortable block spacing.
- **Desktop (>1024px):** Full editor with generous margins. Floating toolbar tracks selection precisely. All collaboration indicators visible.


---

## Pages

### doc (/doc/:id)

Layout: doc-breadcrumbs → nav-header → presence-avatars → doc-editor → reactions → comments
