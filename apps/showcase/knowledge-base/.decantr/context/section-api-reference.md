# Section: api-reference

**Role:** auxiliary | **Shell:** three-column-browser | **Archetype:** api-reference
**Description:** Interactive API reference with endpoint browser, try-it-out console, and multi-language code snippets. Built for developer-facing knowledge bases.

## Quick Start

**Shell:** Three-column browse layout with navigation tree, item list, and detail preview. Classic mail/file-browser pattern. Used for email clients, file managers, documentation browsers, and any master-detail-detail interface. (nav: 220px, header: 52px)
**Pages:** 2 (api-ref, api-ref-endpoint)
**Key patterns:** api-explorer [moderate]
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

**Compositions:** **auth:** Centered auth forms with clean card styling.
**editor:** Document editor with real-time collaboration. Page tree, editor, and comment sidebar.
**marketing:** Marketing pages with top nav and footer. Clean sections with generous whitespace.
**workspace:** Workspace dashboard with activity and recent documents.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface paper-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — three-column-browser shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

api-docs, try-it-out, code-snippets

---

## Visual Direction

**Personality:** Warm, reading-optimized documentation platform. Paper-like backgrounds with comfortable typography (65-75 character measure). AI-powered search with highlighted excerpts. Navigation tree on the left, content center, table-of-contents right. Feels like a well-designed textbook. Changelog entries feel celebratory. API reference is interactive. Lucide icons. Light mode default.

## Pattern Reference

### api-explorer

Interactive API documentation with a browsable endpoint list, parameter tables, a try-it-out request builder with editable JSON bodies, live response viewer, and multi-language code snippet generation.

**Visual brief:** Two-panel layout with a left sidebar (280px wide) listing API endpoints and a right detail area filling the remaining width. The sidebar has a search input at the top and below it a scrollable list of endpoints grouped by resource (e.g., 'Users', 'Products', 'Orders'). Each resource group has a heading with the resource name and a count badge. Under each group, individual endpoints display as rows showing an HTTP method badge (GET as a green rounded pill, POST as a blue pill, PUT as an orange pill, DELETE as a red pill, PATCH as a purple pill) followed by the URL path in monospace text (e.g., '/users/{id}'). The currently selected endpoint row has an active background highlight. The right detail area shows the selected endpoint's documentation: a title with the HTTP method badge and full path, a description paragraph, a ParameterTable with columns for name, type (as a code-styled badge), required (red asterisk or green optional badge), and description. Below the parameter table is the RequestBuilder section: an editable JSON body area with syntax highlighting (for POST/PUT/PATCH methods), an auth configuration dropdown (None, Bearer Token, API Key, Basic Auth) with a token/key input field, and header key-value rows. A prominent 'Send' button with a play icon triggers the request. The ResponseViewer below shows: a status code badge (2xx green, 4xx amber, 5xx red) with the status text, a collapsible headers section showing response headers as key-value pairs, and the response body in a syntax-highlighted JSON viewer with line numbers. At the bottom, CodeSnippet tabs allow switching between curl, JavaScript (fetch), and Python (requests) with a copy-to-clipboard button on each tab. The minimal preset renders everything as a single scrollable page with accordion sections per endpoint.

**Components:** EndpointList, EndpointDetail, RequestBuilder, ResponseViewer, AuthConfig, ParameterTable, CodeSnippet

**Composition:**
```
APIExplorer = Container(d-section, flex-row) > [EndpointList(d-surface) > EndpointItem*(d-interactive)] + EndpointDetail(d-surface) > [DescriptionSection + ParameterTable(d-data) + RequestBuilder(d-interactive) + ResponseViewer(d-data) + CodeSnippet(d-data)]
CodeSnippet = Tabs(d-data) > [CurlTab + JavaScriptTab + PythonTab] > CodeBlock(syntax-highlighted, copyable)
EndpointItem = Row(d-interactive) > [MethodBadge(d-annotation, color: method) + PathLabel(mono)]
EndpointList = Sidebar(d-surface, fixed-width, scrollable) > [SearchInput(d-control) + ResourceGroup* > EndpointItem*]
RequestBuilder = Section(d-interactive) > [URLBar + AuthConfig(d-control) + HeaderRows? + BodyEditor?(d-data, syntax-highlighted) + SendButton(d-interactive)]
ResponseViewer = Section(d-data) > [StatusBadge(d-annotation, color: statusCode) + HeadersToggle? + ResponseBody(d-data, syntax-highlighted, line-numbers)]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| copy-flash | background flash green 300ms ease-out on successful clipboard copy |
| method-badge | subtle scale pulse on hover 150ms ease-out |
| endpoint-hover | background-tint 100ms ease-out on sidebar items |
| send-button-hover | background-lighten + scale(1.02) 150ms ease-out |
| group-expand | max-height 0→auto + fade 250ms ease-out for resource group toggle |
| endpoint-switch | detail area crossfade 200ms ease-out when selecting a different endpoint |
| response-appear | fade + slide-up 300ms ease-out when response arrives |
| sidebar-collapse | width 280px→60px 300ms ease-in-out on tablet sidebar toggle |
| request-loading | send button spinner rotation continuous while request is in flight |

**Responsive:**
- **Mobile (<640px):** Single-column layout. Endpoint list renders as a top dropdown selector instead of a sidebar. Detail sections stack vertically with full width. JSON editor uses a compact height. Code snippets show one language at a time with a selector dropdown. Send button is sticky at the bottom of the viewport.
- **Tablet (640-1024px):** Sidebar collapses to an icon-only mode (showing just method badges) that expands on tap. Detail area takes most of the width. Parameter table horizontally scrolls if needed. Response viewer and code snippets at full width.
- **Desktop (>1024px):** Full two-panel layout with 280px sidebar and spacious detail area. Parameter table displays all columns without truncation. JSON editor has generous height. Code snippet tabs are all visible. Hover effects on endpoint list items.

**Accessibility:**
- Role: `application`
- Keyboard: Arrow Up/Down: navigate endpoint list in sidebar; Enter: select focused endpoint and show its detail; Tab: move between interactive elements (search, parameters, body editor, send button); Ctrl+Enter: send the current request; Ctrl+C: copy the current code snippet to clipboard; 1-3: switch between code snippet tabs (curl, JS, Python); Escape: close expanded response headers or resource groups; S: focus the endpoint search input; F: toggle fullscreen on the body editor or response viewer
- Announcements: Endpoint selected: {method} {path}; Request sent to {method} {path}; Response received: {statusCode} {statusText}, {bodySize} bytes; Code snippet copied to clipboard: {language}; Parameter {name} is required, type {type}; Auth configured: {authType}; Showing {count} endpoints matching '{query}'


---

## Pages

### api-ref (/api)

Layout: api-explorer

### api-ref-endpoint (/api/:endpoint)

Layout: api-explorer
