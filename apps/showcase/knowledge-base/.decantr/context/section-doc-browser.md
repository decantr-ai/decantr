# Section: doc-browser

**Role:** primary | **Shell:** three-column-browser | **Archetype:** doc-browser
**Description:** Full documentation reading experience with navigable doc tree, content pane, and table of contents. Core interface for knowledge base platforms.

## Quick Start

**Shell:** Three-column browse layout with navigation tree, item list, and detail preview. Classic mail/file-browser pattern. Used for email clients, file managers, documentation browsers, and any master-detail-detail interface. (nav: 220px, header: 52px)
**Pages:** 2 (docs, doc-page)
**Key patterns:** breadcrumb-nav [moderate], page-tree, command-palette, legal-prose
**CSS classes:** `.paper-card`, `.paper-fade`, `.paper-input`
**Density:** comfortable
**Voice:** Helpful and clear.

## Shell Implementation (three-column-browser)

### nav

- **note:** Left navigation tree. Holds folder/category structure. Selecting an item populates the list column. Collapses to icon rail on tablet.
- **tree:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - overflow_y: auto
  - item_content: Folder/category icon + label. Supports nested tree with expand/collapse chevrons. Collapsed nav: icon only.
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
- **atoms:** _flex _col _borderR _bgmuted _overflow[auto] _p2
- **width:** 220px
- **border:** right
- **footer:**
  - border: top
  - content: Add folder/category button
  - padding: 0.5rem
- **header:**
  - align: center
  - border: bottom
  - content: Folders heading + collapse toggle
  - display: flex
  - justify: space-between
  - padding: 0.75rem
- **padding:** 0.5rem
- **direction:** column
- **min_width:** 180px
- **background:** var(--d-surface)
- **overflow_y:** auto
- **collapsed_width:** 56px
- **collapse_breakpoint:** lg

### list

- **note:** Middle item list. Shows items for the selected nav folder. Selecting an item populates the detail column. Items highlight on selection.
- **atoms:** _flex _col _borderR _overflow[auto]
- **items:**
  - flex: 1
  - item_gap: 0
  - overflow_y: auto
  - item_border: bottom
  - item_content: Item title (bold) + subtitle/preview (truncated, muted) + metadata (date, badge). Selected item has active background.
  - item_padding: 0.75rem 1rem
  - item_treatment: d-interactive[ghost] with active state highlight
- **width:** 320px
- **border:** right
- **header:**
  - align: center
  - border: bottom
  - content: Selected folder name + item count + sort control
  - display: flex
  - justify: space-between
  - padding: 0.75rem 1rem
- **direction:** column
- **min_width:** 240px
- **overflow_y:** auto

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: nav list 1fr; rows: 52px 1fr

### detail

- **body:**
  - flex: 1
  - note: Full content of the selected item.
  - padding: 1.5rem 0
  - overflow_y: auto
- **flex:** 1
- **note:** Right detail preview. Shows full content of the selected list item. Scrolls independently.
- **atoms:** _flex _col _flex1 _overflow[auto] _p6
- **header:**
  - align: center
  - border: bottom
  - content: Item title + action buttons (reply, archive, delete, etc.)
  - display: flex
  - justify: space-between
  - padding: 0 0 1.5rem 0
- **padding:** 1.5rem
- **direction:** column
- **background:** var(--d-bg)
- **overflow_y:** auto
- **empty_state:**
  - note: Shown when no item is selected in the list.
  - align: center
  - content: Placeholder illustration + 'Select an item to view' message
  - display: flex
  - justify: center

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1rem
- **grid_span:** column 1/4
- **background:** var(--d-bg)
- **left_content:** App logo/title + search bar
- **right_content:** Filter controls + settings + user avatar

### responsive

- **mobile:** Single column with back navigation. Nav as overlay drawer, list as primary view, detail as pushed view with back button
- **tablet:** Nav collapses to icon rail (56px), list and detail remain visible
- **desktop:** Three columns visible simultaneously, all scroll independently

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (three-column-browser)

- **Nav Purpose:** Holds tree/folder structure for top-level navigation categories
- **Empty Detail:** When no list item is selected, detail shows a centered empty-state placeholder
- **Keyboard Nav:** Arrow keys navigate list items, Enter opens in detail, Escape goes back to list on mobile
- **List Purpose:** Shows items belonging to the selected nav folder, acts as a scannable index
- **Detail Purpose:** Shows full content of the selected list item with actions
- **List Highlight:** Selected list item should have a visually distinct active/selected state
- **Mobile Pattern:** On mobile, columns become stacked views with back-navigation between them
- **Selection Flow:** Nav folder -> List populates -> List item -> Detail populates
- **Independent Scroll:** All three columns scroll independently to maintain context across panels

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

**Preferred:** page-tree
**Compositions:** **auth:** Centered auth forms with clean card styling.
**editor:** Document editor with real-time collaboration. Page tree, editor, and comment sidebar.
**marketing:** Marketing pages with top nav and footer. Clean sections with generous whitespace.
**workspace:** Workspace dashboard with activity and recent documents.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface paper-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — three-column-browser shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

docs, navigation, table-of-contents, breadcrumbs

---

## Visual Direction

**Personality:** Warm, reading-optimized documentation platform. Paper-like backgrounds with comfortable typography (65-75 character measure). AI-powered search with highlighted excerpts. Navigation tree on the left, content center, table-of-contents right. Feels like a well-designed textbook. Changelog entries feel celebratory. API reference is interactive. Lucide icons. Light mode default.

## Pattern Reference

### breadcrumb-nav

A hierarchical path navigation component with text links, chevron separators, and smart overflow handling that collapses middle segments into a dropdown menu.

**Visual brief:** A single horizontal line of text links representing the navigation hierarchy, rendered as an ordered list (ol) with inline-flex items. Each breadcrumb item is a text link in text-sm (14px) with text-muted color that transitions to text-default on hover with a subtle underline (text-decoration: underline with underline-offset: 2px). Between each item sits a chevron separator: a small right-pointing angle bracket (›) rendered as a 12px SVG icon in text-muted color with 4px horizontal margin on each side. The current (last) breadcrumb item is rendered as plain text (not a link) in text-default color with font-semibold weight and no hover interaction — it represents the active page. The first item is typically 'Home' and can optionally display a home icon (16px) instead of text. When the path exceeds the available width (measured on mount and resize), the component enters overflow mode: the first item and the last two items remain visible, and all middle items collapse into a single overflow button displayed as '...' (three dots) styled as a small pill button (24px height, 32px width, bg-surface-subtle, border-radius-md, text-muted, hover: bg-surface-hover). Clicking the overflow button opens a dropdown menu (d-surface card with elevation, border-radius-md, min-width: 160px) positioned below the button, listing the hidden segments as menu items (text-sm, padding: 8px 12px, hover: bg-surface-subtle). Each menu item is a link that navigates to that hierarchy level. The dropdown closes on outside click, Escape, or selecting an item. In the icon preset, each breadcrumb item has a small 14px icon to the left of the label: a home icon for the root, a folder icon for intermediate levels, and a document/page icon for the current page. Icons are text-muted color, matching the link color behavior on hover. The entire breadcrumb component has 0 vertical padding (it inherits line-height from the parent) and sits naturally inline within a page header or toolbar.

**Components:** BreadcrumbList, BreadcrumbItem, Separator, OverflowMenu

**Composition:**
```
Separator = ListItem(li, role=presentation, aria-hidden) > ChevronIcon(12px, text-muted)
OverflowMenu = Button('...', pill) + Dropdown(d-surface, elevated) > MenuItem*(a, role=menuitem)
BreadcrumbNav = Nav(role=navigation, aria-label=Breadcrumb) > BreadcrumbList(ol)
BreadcrumbItem = ListItem(li) > Link(a, text-muted, hover:text-default) | Span(current, font-semibold)
BreadcrumbList = List(ol, inline-flex, nowrap) > [BreadcrumbItem + Separator]* + BreadcrumbItem(current)
```

**Layout slots:**
  **Layout guidance:**
  - note: Breadcrumbs are typically placed at the top of a page content area, below the main navigation but above the page title. They should not be wrapped in a card — render inline. The component has a max-width of 100% and uses overflow: hidden with text-overflow on individual items if a single label is too long.
  - container: inline or header
  - separator_style: Use a chevron (›) SVG icon, not a text character. The icon is 12px × 12px, color: text-muted, with 4px margin-left and 4px margin-right. Do not use slashes (/) or greater-than signs (>) as separators.
  - overflow_threshold: The overflow collapse triggers when the total rendered width of all items exceeds the container width. Measure on mount and on window resize. Always keep the first item and the last 2 items visible; collapse everything in between into the overflow menu.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| link-hover | color transition 150ms ease |
| overflow-button-hover | background-color transition 120ms ease |
| dropdown-open | opacity 0→1 + translateY(-4px)→0, 150ms ease-out |
| dropdown-close | opacity 1→0 + translateY(0)→(-4px), 100ms ease-in |
| overflow-collapse | items fade out 150ms as they collapse into the overflow button on resize |

**Responsive:**
- **Mobile (<640px):** Breadcrumbs aggressively collapse — only the parent (one level up) and current page are shown, with all earlier levels in the overflow menu. Max item width reduces to 120px. The overflow dropdown renders full-width at the bottom of the breadcrumb row. Touch targets are 44px minimum height.
- **Tablet (640-1024px):** Breadcrumbs show the first item, overflow, and last 2 items. Max item width 160px. Touch targets are 40px. Dropdown renders normally below the overflow button.
- **Desktop (>1024px):** Full breadcrumb path shown if it fits. Overflow only triggers when the path exceeds container width. Max item width 200px. Hover states active on links. Dropdown has max-height 240px with scroll for very deep hierarchies.

**Accessibility:**
- Role: `navigation`
- Keyboard: Tab: move focus between breadcrumb links and overflow button; Enter: activate focused breadcrumb link or open overflow menu; Escape: close overflow dropdown menu; Arrow Down: move focus to next item in overflow dropdown; Arrow Up: move focus to previous item in overflow dropdown; Home: move focus to first item in overflow dropdown; End: move focus to last item in overflow dropdown
- Announcements: You are here: {currentPage}; Breadcrumb path: {path segments joined by comma}; Overflow menu opened with {count} hidden segments; Navigated to {page}


### page-tree

Hierarchical page navigation with drag-and-drop reordering, inline rename, and nested page support. Used in workspace sidebars.

**Visual brief:** Sidebar navigation tree with nested page items. Each item shows a document icon, page title, and an expand/collapse chevron for nested children. Indentation increases per nesting level with a thin vertical guide line. Hovering a page reveals action icons (three-dot menu for rename, duplicate, delete). A 'Favorites' section at the top shows pinned pages with a star icon. A search input at the very top filters pages by name. A 'New Page' button at the bottom (or a plus icon at the top) creates new pages. The compact preset reduces row height and font size. The flat preset removes nesting and shows all pages in a flat alphabetical list.

**Components:** Button, Input, icon

**Composition:**
```
PageTree = Panel(d-section, flex-col) > [SearchInput(d-control) + FavoritesSection? + TreeList + NewPageButton(d-interactive)]
TreeItem = Row(hoverable, indent: level) > [ExpandChevron? + DocIcon + PageTitle(ellipsis) + ActionsMenu?(d-interactive, show-on-hover)]
TreeList = List(flex-col) > TreeItem(d-data-row)[]
FavoritesSection = Section > [SectionLabel(d-annotation) + PageItem(icon: star)[]]
```

**Layout slots:**
- `tree`: Nested page items
- `search`: Filter pages by name
- `favorites`: Pinned pages section
- `new-button`: Create new page button
**Responsive:**
- **Mobile (<640px):** Page tree renders as a full-screen drawer or sheet. Larger touch targets for tree items. Drag-to-reorder uses long-press. Actions in swipe menus.
- **Tablet (640-1024px):** Sidebar at 260px width. Standard row heights. Drag-to-reorder functional.
- **Desktop (>1024px):** Sidebar at 280px width with comfortable spacing. Full keyboard navigation. Drag-and-drop reordering.


### command-palette

Cmd+K style command search overlay with fuzzy search, categories, and keyboard navigation.

**Visual brief:** Centered modal overlay with a large search input at the top featuring a magnifying glass icon and placeholder text ('Type a command...'). Below the input, a scrollable results list shows matched commands grouped by category (Navigation, Actions, Settings) with muted category headers. Each result row displays an icon on the left, command name in medium weight, description in muted text, and a keyboard shortcut badge on the right. The currently selected item has a highlighted surface background. The overlay has a backdrop blur and rounded corners with a subtle border.

**Components:** icon

**Layout slots:**
- `recent`: Recent commands section
- `search`: Fuzzy search input
- `preview`: Optional command preview/help
- `results`: Command list with categories
**Responsive:**
- **Mobile (<640px):** Palette takes full screen width with slight horizontal margin. Results list fills available height. No keyboard shortcut badges shown. Touch-optimized row heights.
- **Tablet (640-1024px):** Centered overlay at 560px width. Standard row heights with shortcut badges visible.
- **Desktop (>1024px):** Centered overlay at 640px max-width. Full keyboard navigation with shortcut badges. Preview panel optionally visible on the right for selected commands.


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

### docs (/docs)

Layout: breadcrumb-nav → page-tree

### doc-page (/docs/:slug)

Layout: command-palette → legal-prose
