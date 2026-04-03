# Section: crm-email

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** crm-email
**Description:** AI-assisted email interface integrated with the CRM. Features smart inbox with auto-categorization and an AI-powered compose experience for personalized outreach.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (inbox, compose)
**Key patterns:** conversation-list [moderate], chat-input
**CSS classes:** `.glass-card`, `.glass-panel`, `.glass-header`
**Density:** comfortable
**Voice:** Confident and helpful.

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
| `--d-accent` | `#4ade80` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.glass-card` | Individual glass card element. |
| `.glass-panel` | Frosted panel with blur(20px), 5% white background, subtle border. |
| `.glass-header` | Glass hero section with layered blur panels. |
| `.glass-fade-up` | Entrance animation: fade + translateY(20px) over 0.5s. |
| `.glass-overlay` | Modal overlay with heavy blur. |
| `.glass-backdrop` | Dark gradient background with subtle noise texture. |

**Spatial hints:** Density bias: none. Section padding: 80px. Card wrapping: glass.


Usage: `className={css('_flex _col _gap4') + ' d-surface glassmorphism-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

email, ai-compose, categorization

---

## Visual Direction

**Personality:** Intelligent CRM with AI enrichment at every touch. Frosted glass panels on cool-toned dark backgrounds. Contact cards show AI-gathered insights alongside manual data. Pipeline board is the center of gravity — wide, draggable, value-weighted. Email composer has AI ghost text suggestions. Meeting recaps auto-populate with action items. Relationship graph makes hidden connections visible. Smooth transitions. Lucide icons. This CRM feels alive.

## Pattern Reference

### conversation-list

Sidebar conversation history with search, new chat button, and conversation items showing unread indicators and actions.

**Visual brief:** Vertical sidebar panel with a search input at the top (magnifying glass icon, 'Search conversations' placeholder), a 'New Chat' button below it, and a scrollable list of conversation items. Each item shows a chat icon or model avatar, the conversation title (truncating with ellipsis), a last-message date in small muted text, and an unread count badge (colored circle with number) when applicable. The active conversation has a highlighted surface background. Hovering reveals a three-dot menu for rename and delete actions. Compact preset reduces row height and hides dates.

**Components:** Button, Avatar, Badge, icon

**Composition:**
```
ItemList = List(flex-col, scrollable) > ConversationItem[]
ConversationItem = Row(d-data-row, hoverable, active?: highlighted) > [ChatIcon + Title(ellipsis) + Date(text-muted, text-xs) + UnreadBadge?(d-annotation, accent)]
ConversationList = Panel(d-surface, flex-col, full-height) > [SearchInput(d-control, icon: search) + NewChatButton(d-interactive, variant: primary) + ItemList]
```

**Layout slots:**
- `items`: List of conversation rows
- `search`: Filter/search conversations input
- `new-button`: Create new conversation button
**Responsive:**
- **Mobile (<640px):** Conversation list takes full screen as a page. Selecting an item navigates to the chat view. New Chat button is a floating action button.
- **Tablet (640-1024px):** Sidebar panel at 280px width. Standard row heights.
- **Desktop (>1024px):** Sidebar panel at 300px width with comfortable spacing. Full dates visible. Hover actions on each row.


### chat-input

Message composition area with auto-growing textarea, file attachments, mentions autocomplete, and keyboard shortcuts.

**Visual brief:** Anchored input bar at the bottom of the chat viewport with a subtle top border separator. The textarea auto-grows from one line up to a max height, with a muted placeholder. An attachment button (paperclip icon) sits to the left and a send button (arrow-up icon) sits to the right, coloring to accent when the input has content. Staged file attachments render as thumbnail pills above the textarea with individual remove buttons.

**Components:** Button, icon

**Layout slots:**
- `actions`: Attach and send buttons
- `textarea`: Auto-growing input with placeholder
- `attachments-preview`: Staged file thumbnails with remove buttons
**Responsive:**
- **Mobile (<640px):** Input bar stretches full width with 12px horizontal padding. Textarea font size bumps to 16px to prevent iOS zoom. Attachment previews scroll horizontally as a single row. Send button uses a compact 36px icon-only variant. Mentions popup renders as a bottom sheet rather than a dropdown.
- **Tablet (640-1024px):** Standard layout with comfortable padding. Formatting toolbar (rich preset) shows as a single scrollable row above the textarea. Mentions popup renders as a floating dropdown anchored to the cursor position.
- **Desktop (>1024px):** Full-featured input with optional formatting toolbar. Send button shows label text alongside icon. Character/token counter appears in the bottom-right corner. Keyboard shortcut hints shown on hover (Enter to send, Shift+Enter for newline).


---

## Pages

### inbox (/inbox)

Layout: conversation-list

### compose (/compose)

Layout: chat-input
