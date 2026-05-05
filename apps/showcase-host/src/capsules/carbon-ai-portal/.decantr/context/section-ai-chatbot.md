# Section: ai-chatbot

**Role:** primary | **Shell:** chat-portal | **Archetype:** ai-chatbot
**Description:** AI chatbot interface with conversation sidebar, message thread, and anchored input. Core interface for chat-first AI applications.

## Quick Start

**Shell:** AI chatbot layout with collapsible conversation sidebar and anchored input. Used by ai-chatbot archetype for chat-first applications. (nav: 280px, header: 52px)
**Pages:** 2 (chat, new)
**Key patterns:** chat-header, chat-thread, chat-input
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.mono-data`
**Density:** comfortable
**Voice:** Intelligent and measured.

## Shell Implementation (chat-portal)

### body

- **flex:** 1
- **atoms:** _flex _col _overflow[hidden]
- **input:**
  - note: Chat input anchored to bottom of body. Always visible.
  - border: top
  - padding: 1rem 1.5rem
  - position: anchored_bottom
- **messages:**
  - flex: 1
  - note: Scrollable message list. Messages stack vertically.
  - padding: 1.5rem
  - overflow_y: auto
- **overflow:** hidden
- **direction:** column

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: sidebar 1fr; rows: 52px 1fr

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **background:** var(--d-bg)
- **left_content:** Chat title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Notifications bell + user avatar

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 0.25rem
  - overflow_y: auto
  - item_content: Avatar (sm) + conversation title (truncated). Collapsed: avatar only.
  - item_padding: 0.5rem
- **atoms:** _flex _col _bgmuted _borderR
- **brand:**
  - align: center
  - border: bottom
  - height: 52px
  - content: Conversations heading + collapse toggle
  - display: flex
  - justify: space-between
  - padding: 0.75rem
- **width:** 280px
- **border:** right
- **footer:**
  - border: top
  - content: New Chat button (full-width outline)
  - padding: 0.5rem
- **position:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **collapse_breakpoint:** md

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

**Zone:** App (primary) — chat-portal shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

chat, markdown, code-highlight, file-upload, mentions, reactions, export

---

## Visual Direction

**Personality:** Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### chat-header

Contextual header for active conversation with editable title, status indicator, and action buttons.

**Visual brief:** Horizontal bar at the top of a chat panel with the conversation title on the left (editable on click, showing a pencil icon on hover), a status indicator dot (green for online, gray for offline, or a model name badge) in the center-left area, and action icon buttons on the right (search, export, branch, settings). The bar has a bottom border separator. Compact preset reduces padding and hides less-used actions behind a more-menu.

**Components:** Button, Badge, icon

**Composition:**
```
ChatHeader = Bar(d-surface, row, space-between, border-bottom) > [Title(editable, heading4) + StatusIndicator(d-annotation, dot: online|offline) + ActionButtons(d-interactive)]
ActionButtons = Row(gap-2) > IconButton(variant: ghost)[]
```

**Layout slots:**
- `title`: Editable conversation subject/title
- `status`: Online/offline indicator or model name badge
- `actions`: Search, export, branch, settings buttons
**Responsive:**
- **Mobile (<640px):** Title truncates with ellipsis. Actions collapse into a single kebab menu. Status indicator moves below title.
- **Tablet (640-1024px):** Full title visible. Two primary actions visible, rest in overflow menu.
- **Desktop (>1024px):** All elements visible inline. Title is editable on click. Full action button row.


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


---

## Pages

### chat (/chat/:id)

Layout: chat-header → chat-thread → chat-input

### new (/chat)

Layout: chat-thread → chat-input
