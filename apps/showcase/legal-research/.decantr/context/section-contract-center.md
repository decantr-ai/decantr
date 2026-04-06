# Section: contract-center

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** contract-center
**Description:** Auxiliary contract management surface for browsing the contract library, reviewing redlined documents with tracked changes, and comparing versions side-by-side.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (contracts, contract-detail, contract-compare)
**Key patterns:** filter-bar [moderate], data-table [moderate], redline-track-changes [moderate], contract-diff [moderate], diff-view
**CSS classes:** `.counsel-page`, `.counsel-seal`, `.counsel-header`, `.mono-data`
**Density:** comfortable
**Voice:** Formal and precise.

## Shell Implementation (sidebar-main)

### body

- **flex:** 1
- **note:** Sole scroll container. Page content renders directly here. No wrapper div around outlet.
- **atoms:** _flex1 _overflow[auto] _p6
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _flex _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** row

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **left_content:** Breadcrumb — omit segment when it equals page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Theme toggle (sun/moon icon) + Search/command trigger. Theme toggle toggles light/dark class on html element.

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - group_gap: 0.5rem
  - overflow_y: auto
  - item_content: icon (16px) + label text. Collapsed: icon only, text hidden.
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
  - group_header_treatment: d-label
- **atoms:** _flex _col _borderR
- **brand:**
  - align: center
  - border: bottom
  - height: 52px
  - content: Logo/brand + collapse toggle
  - display: flex
  - padding: 0 1rem
- **width:** 240px
- **border:** right
- **footer:**
  - border: top
  - content: User avatar + settings link
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
- **position:** left
- **direction:** column
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **collapse_breakpoint:** md

### main_wrapper

- **flex:** 1
- **atoms:** _flex _col _flex1 _overflow[hidden]
- **overflow:** hidden
- **direction:** column

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (sidebar-main)

- **Hotkeys:** Navigation hotkeys defined in the essence are keyboard shortcuts. Implement as useEffect keydown event listeners — do NOT render hotkey text in the sidebar UI.
- **Collapse:** Sidebar collapse toggle should be integrated into the sidebar header area (next to the brand/logo), not floating at the bottom of the sidebar.
- **Breadcrumbs:** For nested routes (e.g., /resource/:id), show a breadcrumb trail above the page heading inside the main content area.
- **Empty States:** When a section has zero data, show a centered empty state: 48px muted icon + descriptive message + optional CTA button.
- **Section Labels:** Dashboard section labels should use the d-label class. Anchor with a left accent border: border-left: 2px solid var(--d-accent); padding-left: 0.5rem.
- **Section Density:** Dashboard sections use compact spacing. Apply data-density='compact' on d-section elements for tighter vertical rhythm than marketing pages.
- **Page Transitions:** Apply the entrance-fade class (if generated) to the main content area for smooth page transitions.

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
| `--d-accent` | `#991B1B` |  |
| `--d-border` | `#D6CFC0` | Dividers, card borders, separators |
| `--d-primary` | `#1E3A5F` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#7F1D1D` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAF7F2` | Page canvas / base layer |
| `--d-text-muted` | `#6B6054` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#7F1D1D` |  |
| `--d-primary-hover` | `#14284A` | Hover state for primary elements |
| `--d-surface-raised` | `#F4F0E8` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#991B1B` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.counsel-page` | Warm cream document page (#FAF7F2) with generous margins and serif body text. Document-inspired foundation. |
| `.counsel-seal` | Official seal with ribbon embellishment in navy and oxblood. Authority and certification mark. |
| `.counsel-header` | Georgia or Garamond serif heading with deep navy color. Formal section and page headers. |
| `.counsel-margin` | Annotation margin area with dashed divider for notes and references. Legal pad aesthetic. |
| `.counsel-divider` | Thin horizontal rule with warm border tone for clean section separation. |
| `.counsel-oxblood` | Deep oxblood red accent elements for emphasis, warnings, and critical status indicators. |
| `.counsel-citation` | Indented citation blocks with left border accent and italic serif type. Legal reference styling. |
| `.counsel-highlight` | Subtle highlight on key text using warm cream background tint. Marks important passages. |

**Compositions:** **document:** Legal document viewer with serif body, citation styling, and annotation margins.
**marketing:** Law firm marketing page with authoritative serif headlines and seal branding.
**client-portal:** Client portal with case status, document access, and secure messaging.
**case-dashboard:** Legal case dashboard with matter listings, docket calendar, and client directory.
**Spatial hints:** Density bias: none. Section padding: 72px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface counsel-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

contracts, redlining, diffs

---

## Visual Direction

**Personality:** Authoritative legal research workspace with warm cream backgrounds and deep navy accents. Serif body typography with monospace case citations. Citation graphs visualize case law networks showing which decisions cite which. Contract diffs reveal redlining with author attribution in margins. Matter cards track billable hours and deadlines with urgency indicators. Lucide icons. Scholarly.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pattern Reference

### filter-bar

Search input and filter controls for filtering page content. Sits above data-consuming patterns like data-table, card-grid, and activity-feed.

**Visual brief:** Horizontal bar containing a search input with magnifying glass icon on the left, one or more dropdown Select filters in the middle (category, status, date range), and action buttons on the right (Clear All, Apply). Active filters may display as small removable badge chips below the bar. The compact preset places the search input and filters in a single tight row. The advanced preset adds an expandable panel with additional filter fields (date pickers, range sliders, checkboxes).

**Components:** Input, Select, Button, Badge, icon

**Composition:**
```
FilterBar = Row(d-control, full-width) > [SearchInput(d-control, icon: search) + FilterSelects > Select(d-control)[] + ActionButtons(d-interactive)]
ActiveFilters = Row(gap-2) > FilterChip(d-annotation, removable)[]
AdvancedFilters = Panel(d-surface, expandable) > [FilterRow > Select[] + SavedFilters > Button(variant: outline)[]]
```

**Layout slots:**
- `search`: Search Input with placeholder text
- `actions`: Action Buttons (clear, apply, etc.)
- `filters`: One or more Select dropdowns for category/status filtering
**Responsive:**
- **Mobile (<640px):** Search input takes full width on its own row. Filter selects stack below or collapse into a 'Filters' button that opens a bottom sheet. Active filter chips wrap to multiple lines.
- **Tablet (640-1024px):** Search and primary filters fit in one row. Less common filters in a collapsible section.
- **Desktop (>1024px):** All elements in a single horizontal row. Advanced filters expand inline below the bar.


### data-table

Sortable, filterable, paginated data table with row selection

**Visual brief:** Full-width data table with a sticky header row. Header cells use uppercase, small, muted text with sort-direction arrows on sortable columns. Data rows have consistent vertical padding (py3) for scan-ability, with subtle zebra-stripe background on hover. Row-selection checkboxes align in the first column. Active selections highlight the row with a faint primary-color tint. A toolbar above the table holds a search input on the left and action buttons (export, delete) on the right. Pagination controls at the bottom show current range, total count, and prev/next buttons with disabled states at boundaries.

**Components:** Table, Checkbox, Button, Input, Badge, icon

**Composition:**
```
Table = Table(d-data) > [TableHeader > HeaderCell(sortable?, sort-indicator?)[] + TableBody > DataRow(d-data-row, hoverable, striped?)[]]
DataRow = Row > [Checkbox?(d-control) + DataCell(d-data-cell)[]]
Toolbar = Row(d-control) > [SearchInput(d-control) + ActionButtons(d-interactive)]
DataTable = Container(d-data, full-width) > [Toolbar + Table + Pagination]
Pagination = Row(d-control) > [PageInfo(text-muted) + PageButtons(d-interactive, variant: ghost)[]]
```

**Layout slots:**
- `toolbar`: Top row with optional search Input and action Buttons
- `pagination`: Footer with page info and prev/next Buttons
- `table-body`: Data rows with optional row selection Checkbox
- `table-header`: Column headers with sort controls
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Row hover highlights with 150ms background-color transition. Sort arrow rotates 180deg on direction change with 200ms ease. Checkbox scales briefly on check (scale 1.1 for 100ms). |
| transitions | Rows entering from filter/search fade in with 200ms opacity transition. Bulk-selected rows highlight with a slide-in left-border accent over 150ms. |

**Responsive:**
- **Mobile (<640px):** Table transforms into a stacked card list. Each row becomes a vertical card with label-value pairs. Toolbar search goes full-width. Pagination simplifies to prev/next only. Horizontal scroll is avoided entirely.
- **Tablet (640-1024px):** Table displays with horizontal scroll if columns exceed viewport. Sticky first column for row identifiers. Toolbar remains single row.
- **Desktop (>1024px):** Full table layout with all columns visible. Sticky header on scroll. Toolbar with search, filters, and bulk action buttons. Full pagination with page numbers.

**Accessibility:**
- Role: `Table uses semantic <table>, <thead>, <tbody>, <th>, <td> elements. Sort buttons are <button> inside <th> with aria-sort attribute.`


### redline-track-changes

A document review surface with inline track-changes, margin comments, author attribution, accept/reject controls, and a revision version timeline.

**Visual brief:** A document rendered in serif font with generous margins, similar to Word track-changes. Insertions appear underlined in an author-specific color (author A red, author B blue, author C purple, etc.) with author initial badge floating at start of insertion. Deletions shown with strikethrough in the same author color. Comment bubbles in right margin are rounded rectangles with author avatar, timestamp, comment text, and thin connecting line drawn to the referenced text span. Hovering any change surface reveals a floating action bar with Accept (green check) and Reject (red X) icon buttons plus 'Reply' option. Top header contains a horizontal version timeline chip strip showing v1, v2, v3... with dots for revision authors, current version highlighted. Side panel can filter by author, change type, or resolved/unresolved comments.

**Components:** DocumentPane, InlineChange, CommentBubble, AuthorBadge, AcceptRejectControls, VersionTimeline

**Composition:**
```
DocumentPane = Article(serif, margin-sized) > Paragraph[]
InlineChange = Span(colored, underline|strikethrough, data-author) > [AuthorBadge + TextContent]
CommentBubble = Card(d-annotation, connector-line) > [Header(avatar+name+time) + Body + Replies + Actions]
VersionTimeline = Strip(horizontal) > VersionPill[] > [VersionNumber + AuthorDots + DateLabel]
RedlineTrackChanges = Section(d-section) > [VersionTimeline(header) + DocumentPane(main) > [Paragraph[] > InlineChange[](author-colored) > [AuthorBadge + ChangeText + AcceptRejectControls]] + CommentMargin > CommentBubble[](d-annotation) > [AuthorBadge + Timestamp + CommentBody + ReplyThread + ResolveToggle]]
```

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)
  **Layout guidance:**
  - note: Comments in margin must have visible connector lines to source text. Author badges use initials, never emoji.
  - container: d-section
  - color_attribution: Each author gets a stable color assigned at entry. Do not recycle colors mid-revision.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| change-hover | background brighten + controls fade-in 180ms ease-out |
| comment-focus | bubble elevation raise 200ms ease |
| accept-change | background flash green then content reflow 400ms ease-in-out |
| reject-change | strikethrough pulse then content removal 400ms |
| comment-resolve | bubble fade to muted 300ms |
| unresolved-pulse | unresolved comment bubble subtle ring-pulse 3s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Comment margin collapses to a drawer with indicator badges inline in the document. Controls appear in a bottom action sheet.
- **Tablet (640-1024px):** Narrower margin column. Version timeline collapses to current-version dropdown.

**Accessibility:**
- Role: `region`
- Keyboard: J / K: next / previous change; A: accept focused change; R: reject focused change; C: add comment to selection; Arrow keys: navigate within document; Escape: close comment thread
- Announcements: Change by {author}: {type} at paragraph {n}; Comment added by {author}: {excerpt}; Change {accepted|rejected}


### contract-diff

A side-by-side contract comparison view with synchronized scrolling, inline change markers, addition and deletion highlighting, and a clause navigation sidebar.

**Visual brief:** Two document panes rendered as scrollable text surfaces positioned side by side. Left pane shows the original version, right pane shows the revised. Both use a serif document font at comfortable reading size with generous line-height. Addition text appears with a pale green (#DCFCE7) background and green underline. Deletion text shows with pale red (#FEE2E2) background and strikethrough. Both panes share a synchronized vertical scroll — scrolling one scrolls the other. A gutter between the panes contains connecting lines and change markers (small colored chevrons: green for add, red for delete, amber for modify) linking related changes across panes. A left-docked clause navigation sidebar lists all changed sections by clause number with change-type icons, clickable for jump-to navigation. Top header shows aggregate change count ('37 changes: 18 additions, 12 deletions, 7 modifications').

**Components:** DiffPane, ChangeMarker, AdditionText, DeletionText, ClauseNav, ChangeCount

**Composition:**
```
DiffPane = ScrollContainer(sync-scroll) > DocumentText(serif) > Line[] > [Gutter + ChangeMarker? + TextContent]
ClauseNav = Panel(d-surface) > ClauseItem[] > [ClauseNumber + ChangeTypeIcon + ClauseLabel]
ChangeCount = Header(d-annotation) > [TotalBadge + AdditionsBadge + DeletionsBadge + ModificationsBadge]
ContractDiff = Section(d-section) > [ChangeCount(header) + ClauseNav(sidebar) + DiffPane[](d-surface) > [LineNumber + ChangeMarker + [AdditionText | DeletionText | NormalText]]]
```

**Layout slots:**
  **Layout guidance:**
  - note: Document panes must use serif font-family. Preserve legal document whitespace/indentation. Sync scroll is mandatory in split preset.
  - container: d-section
  - change_semantics: Additions always green, deletions always red, modifications always amber. Do not invert.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| marker-hover | chevron scale(1.2) + brightness 150ms ease-out |
| preset-switch | cross-fade 300ms |
| jump-to-change | smooth scroll to target 400ms ease-in-out |
| sync-indicator | subtle gutter-line glow pulse 2s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Split preset collapses to inline preset automatically. Clause nav becomes slide-out drawer.
- **Tablet (640-1024px):** Split retained with narrower panes. Clause nav collapses to icon strip.

**Accessibility:**
- Role: `region`
- Keyboard: J / K: next / previous change; G: jump to clause navigator; A: accept focused change (if editable); R: reject focused change (if editable); Escape: close clause nav
- Announcements: Change {n} of {total}: {type} at clause {clause}; Navigated to clause {clause}


### diff-view

Side-by-side or unified diff display for code and text comparison.

**Visual brief:** Code comparison display with two side-by-side panels (split preset) or a single merged panel (unified preset). Each panel shows line numbers in a narrow gutter column with a monospace font. Added lines have a green-tinted background with a '+' marker. Removed lines have a red-tinted background with a '-' marker. Unchanged lines render with no background tint. A header bar above each panel shows the file name and change statistics (additions/deletions count). The inline preset highlights changed characters within a line with a stronger color accent.

**Components:** Button, icon

**Layout slots:**
- `left`: Original content
- `right`: Modified content
- `gutter`: Line numbers, change markers
- `header`: File names, stats
**Responsive:**
- **Mobile (<640px):** Defaults to unified diff view — single column with added/removed lines interleaved. Horizontal scroll for long lines. Line numbers use minimal width.
- **Tablet (640-1024px):** Split view available with narrower panes. Synchronized scrolling between panels.
- **Desktop (>1024px):** Full split view with generous panel widths. Character-level diff highlighting. Expandable context lines.


---

## Pages

### contracts (/contracts)

Layout: filter-bar → data-table

### contract-detail (/contracts/:id)

Layout: redline-track-changes → contract-diff

### contract-compare (/contracts/compare)

Layout: contract-diff → diff-view
