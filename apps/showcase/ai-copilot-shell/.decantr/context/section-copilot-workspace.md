# Section: copilot-workspace

**Role:** primary | **Shell:** copilot-overlay | **Archetype:** copilot-workspace
**Description:** Main application workspace with an AI copilot overlay. Features a toggleable copilot panel that provides context-aware suggestions and chat alongside the primary work surface.

## Quick Start

**Shell:** Main content area with a collapsible AI copilot side panel. Right-side drawer overlays or pushes body content. When collapsed, a floating pill button ('Ask AI') remains visible. Used for AI-assisted workflows where copilot can reference body content. (header: 56px)
**Pages:** 2 (workspace, workspace-detail)
**Key patterns:** chat-thread, chat-input, detail-header [moderate]
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.mono-data`
**Density:** comfortable
**Voice:** Concise and helpful.

## Shell Implementation (copilot-overlay)

### body

- **flex:** 1
- **note:** Main application content area. Scrollable. When copilot mode is 'push', body width shrinks to accommodate panel.
- **atoms:** _flex1 _overflow[auto] _p6
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: 1fr auto; rows: 56px 1fr

### header

- **align:** center
- **border:** bottom
- **height:** 56px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1rem
- **grid_span:** column 1/3
- **background:** var(--d-bg)
- **left_content:** Page title / breadcrumb
- **right_content:** Copilot toggle button (Cmd+K) + actions + user avatar

### copilot

- **body:**
  - flex: 1
  - note: AI chat message thread. Messages stack vertically with alternating alignment.
  - padding: 1rem
  - overflow_y: auto
- **note:** Right-side AI copilot drawer. Overlay mode: floats over body. Push mode: shrinks body width. Can reference body content for context-aware assistance.
- **atoms:** _flex _col _borderL _bgraised _overflow[auto] _p4
- **input:**
  - note: Chat input anchored to bottom of copilot panel. Always visible when panel is open.
  - border: top
  - padding: 0.75rem 1rem
  - position: anchored_bottom
- **width:** 360px
- **border:** left
- **header:**
  - align: center
  - border: bottom
  - content: Copilot title + close button
  - display: flex
  - justify: space-between
  - padding: 0.75rem 1rem
- **height:** 100vh
- **padding:** 1rem
- **position:** fixed
- **direction:** column
- **background:** var(--d-surface-raised)
- **overflow_y:** auto
- **collapsed_width:** 0px
- **position_anchor:** right
- **collapsed_trigger:**
  - note: Floating pill button visible when copilot is collapsed. Click or Cmd+K to open.
  - type: pill
  - label: Ask AI
  - offset: 1.5rem
  - position: fixed
  - position_anchor: bottom-right

### responsive

- **mobile:** Full-screen bottom sheet with drag-to-dismiss handle
- **desktop:** Side panel overlay on right, body unaffected in overlay mode

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (copilot-overlay)

- **Body Purpose:** Contains main application content that copilot can reference
- **Collapsed State:** When closed, only a floating 'Ask AI' pill button is visible at bottom-right
- **Context Passing:** Copilot can read and reference body content for contextual responses
- **Copilot Purpose:** Contains AI chat interface for context-aware assistance
- **Mobile Behavior:** On mobile, copilot opens as a full-screen bottom sheet instead of a side panel
- **Overlay Vs Push:** Overlay: panel floats over body content. Push: body shrinks to make room for panel
- **Toggle Shortcut:** Cmd+K opens/closes copilot panel from anywhere

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
| `--d-text` | `#FAFAFA` | Body text, headings, primary content |
| `--d-border` | `#3F3F46` | Dividers, card borders, separators |
| `--d-primary` | `#7C93B0` | Brand color, key interactive, selected states |
| `--d-surface` | `#1F1F23` | Cards, panels, containers |
| `--d-bg` | `#18181B` | Page canvas / base layer |
| `--d-text-muted` | `#A1A1AA` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#8CA3C0` | Hover state for primary elements |
| `--d-surface-raised` | `#27272A` | Elevated containers, modals, popovers |
| `--d-accent` | `#6B8AAE` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.carbon-card` | Surface background, subtle border, 8px radius, hover shadow transition. |
| `.carbon-code` | Monospace font, surface-raised background, subtle 3px left border accent in primary color. |
| `.carbon-glass` | Glassmorphic panel with backdrop-filter blur(12px), semi-transparent surface background, 1px border. Use for nav bars, sidebars, floating panels. |
| `.carbon-input` | Soft border with gentle focus ring using primary blue. Border transitions on focus. |
| `.carbon-canvas` | Background color using theme background token. Clean, minimal foundation. |
| `.carbon-divider` | Hairline separator using border-color token. |
| `.carbon-skeleton` | Loading placeholder with subtle pulse animation for skeleton states. |
| `.carbon-bubble-ai` | Left-aligned message bubble with surface background for AI responses. |
| `.carbon-fade-slide` | Entrance animation: opacity 0 to 1, translateY 12px to 0, 200ms ease-out. |
| `.carbon-bubble-user` | Right-aligned message bubble with primary-tinted background for user messages. |

**Preferred:** chat-thread, chat-input
**Compositions:** **auth:** Centered auth forms with clean card styling.
**chat:** Chat interface with conversation list sidebar and message thread. Anchored input at bottom.
**marketing:** Marketing pages with top nav and footer. Clean sections with subtle separators.
**Spatial hints:** Density bias: none. Section padding: 80px. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface carbon-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — copilot-overlay shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

copilot, ai-suggestions, context-awareness, keyboard-shortcuts

---

## Visual Direction

**Personality:** Minimal, unobtrusive AI assistant that enhances without overwhelming. The copilot panel is a sleek right-side drawer — dark carbon surface with soft shadows. Suggestions appear as ghost text or subtle card overlays near the user's focus. Main app takes center stage; AI is always available but never demands attention. Actions have clear accept/reject affordances. Context breadcrumbs show what the AI sees. Think GitHub Copilot meets Linear's command palette. Lucide icons. Geist Mono for AI outputs.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pattern Reference

### chat-thread

Full message thread container with scrollable messages, typing indicator, pagination, and auto-scroll behavior.

**Visual brief:** Vertically scrolling message thread with alternating alignment for user and AI messages. User bubbles align right with accent background; AI responses align left with surface background and wider max-width. A pulsing dot-trio typing indicator appears at the bottom when the AI is generating. A floating scroll-to-bottom FAB fades in when the user scrolls up past a threshold.

**Components:** Button, Avatar, icon

**Composition:**
```
ChatThread = Container(d-surface, flex-col, full-height) > [MessageList + TypingIndicator? + ScrollAnchor]
MessageList = List(flex-col, gap-3, scrollable) > Message[]
ScrollAnchor = FAB(d-interactive, floating, show-on-scroll-up)
TypingIndicator = Bubble(d-annotation, opacity-70) > PulseDots(3, animated)
```

**Layout slots:**
- `messages`: Scrollable message list
- `load-more`: History pagination button
- `scroll-to-bottom`: Floating button when scrolled up
- `typing-indicator`: AI is thinking... indicator
**Responsive:**
- **Mobile (<640px):** Messages span full width with minimal horizontal padding (12px). Avatars shrink to 28px or hide entirely. Typing indicator anchors to bottom of viewport. Scroll-to-bottom FAB shifts to bottom-right corner with 16px inset. Load-more button becomes a pull-to-refresh gesture at the top.
- **Tablet (640-1024px):** Standard layout with comfortable padding. Avatars visible at 36px. Message bubbles max-width at 75% of container. Typing indicator and scroll-to-bottom FAB remain in default positions.
- **Desktop (>1024px):** Message bubbles cap at 640px max-width for readability. Full avatars at 40px with timestamp on hover. Branch indicators show as a vertical sidebar gutter. Keyboard shortcuts enabled for navigation between messages.


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


### detail-header

Page header for detail views with title, metadata, status, and action buttons

**Visual brief:** Page header area with a breadcrumb navigation trail at the top, followed by a title row containing a large heading on the left and action buttons on the right. Below the title, a subtitle or description paragraph in muted text. An optional status badge appears inline next to the title. The profile preset adds an avatar to the left of the title. All elements are separated by consistent vertical spacing with a subtle bottom border below the entire header block.

**Components:** Avatar, Badge, Button, Breadcrumb

**Composition:**
```
TitleRow = Row(space-between) > [Title(heading2) + StatusBadge?(d-annotation) + ActionButtons(d-interactive)]
DetailHeader = Section(d-section, flex-col, gap-4, border-bottom) > [Breadcrumb + TitleRow + Subtitle?(text-muted)]
ActionButtons = Row(gap-2) > Button(variant: ghost)[]
ProfileHeader = Row(d-section, gap-6) > [Avatar(large, 96px) + InfoColumn > [Name(heading2) + Title(text-muted) + Bio + StatsRow + ActionButtons]]
```

**Layout slots:**
- `title`: Page heading with _heading2
- `status`: Badge showing current status (active, draft, archived)
- `actions`: Action buttons group: edit, delete, share with _flex _gap2
- `subtitle`: Description text with _bodysm _fgmuted
- `title-row`: Horizontal row with title on left and action buttons on right: _flex _row _jcsb _aic
- `breadcrumb`: Navigation breadcrumb trail with BreadcrumbItem links
**Responsive:**
- **Mobile (<640px):** Breadcrumb collapses to back arrow with parent name. Action buttons move below the title and stack full-width. Status badge wraps below the title on its own line.
- **Tablet (640-1024px):** Standard layout. Actions remain inline right of title. Breadcrumb shows full path.
- **Desktop (>1024px):** Full header with all elements comfortably positioned. Generous whitespace above and below.


---

## Pages

### workspace (/workspace)

Layout: chat-thread → chat-input

### workspace-detail (/workspace/:id)

Layout: detail-header → chat-thread
