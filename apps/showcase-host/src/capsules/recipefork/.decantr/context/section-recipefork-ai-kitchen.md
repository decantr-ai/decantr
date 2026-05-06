# Section: recipefork-ai-kitchen

**Role:** auxiliary | **Shell:** recipefork-top-nav | **Archetype:** recipefork-ai-kitchen
**Description:** Authenticated AI kitchen workspace for Recipefork with chat history and photo-to-recipe generation flows.

## Quick Start

**Shell:** Shared Recipefork application shell with sticky top nav, compact utility actions, and a wide scrollable content region below. Mirrors the current app's persistent nav model across public and authenticated product routes. (header: 64px)
**Pages:** 2 (chat, generate)
**Key patterns:** chat-thread, chat-input, content-uploader [moderate], detail-header [moderate]
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

**Theme decorators:** 6 `recipefork-*` classes — full Class/Intent/Apply-to table in `section-recipefork-ai-kitchen-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** chat-thread, chat-input, content-uploader, detail-header
**Spatial hints:** Density bias: none. Section padding: 4rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface recipefork-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — recipefork-top-nav shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

chat-history, image-upload, auth, generation-history

---

## Visual Direction

**Personality:** Recipefork is a neutral, production-grade recipe product that lets food photography and authoring depth carry the experience. Public browsing feels clean and modern; Chef Mode is the critical differentiator, with structured ingredients, nested instruction groups, optional plating presentation, dynamic cooking tips, explicit recipe visibility controls, draft workflows, and no-loss hydrated editing.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### chat-thread

Full message thread container with scrollable messages, typing indicator, pagination, and auto-scroll behavior.

**Components:** Button, Avatar, icon

**Layout slots:**
- `messages`: Scrollable message list
- `typing-indicator`: AI is thinking... indicator
- `load-more`: History pagination button
- `scroll-to-bottom`: Floating button when scrolled up
  **Layout guidance:**
  - scroll_ownership: The message list is the primary scrollable region and should not fight with outer page wrappers for scroll ownership.
  - bubble_measure: Message bubbles should keep a readable max-width rather than stretching to the container edge, especially for long AI responses.
  - typing_state: Typing indicators and load-more controls should feel like part of the thread rhythm instead of detached widgets.

### chat-input

Message composition area with auto-growing textarea, file attachments, mentions autocomplete, and keyboard shortcuts.

**Components:** Button, icon

**Layout slots:**
- `attachments-preview`: Staged file thumbnails with remove buttons
- `textarea`: Auto-growing input with placeholder
- `actions`: Attach and send buttons
  **Layout guidance:**
  - anchored_zone: The input bar should feel anchored to the bottom of the chat shell and should not float with extra page-level spacing around it.
  - attachment_rhythm: Attachment previews should sit in a stable row above the textarea and not push the send controls into awkward positions.
  - send_priority: Send controls should remain visually clear when the composer grows; avoid layouts where the send button drifts away from the text area.

### content-uploader

Drag-drop media upload component with file preview, progress tracking, and multi-file support. Handles images, videos, audio, and documents.

**Components:** Button, Card, Progress, icon

**Layout slots:**
- `dropzone`: Drag-drop target area with visual feedback
- `file-list`: Uploaded files with progress bars
- `preview`: Media preview thumbnails grid
- `actions`: Upload, cancel, clear buttons
  **Layout guidance:**
  - dropzone_priority: The primary affordance is the upload target itself. Supporting file previews and action rows should reinforce confidence in what has been selected, not compete with the dropzone.
  - progress_clarity: Upload state, file identity, and error or retry status should stay tightly grouped for each file so the user can resolve issues without scanning the whole surface.
  - single_vs_multi: Single-file flows should emphasize preview and replacement, while multi-file flows should emphasize queue state and per-file progress.

### detail-header

Page header for detail views with title, metadata, status, and action buttons

**Components:** Avatar, Badge, Button, Breadcrumb

**Layout slots:**
- `breadcrumb`: Navigation breadcrumb trail with BreadcrumbItem links
- `title-row`: Horizontal row with title on left and action buttons on right: _flex _row _jcsb _aic
- `title`: Page heading with _heading2
- `subtitle`: Description text with _bodysm _fgmuted
- `status`: Badge showing current status (active, draft, archived)
- `actions`: Action buttons group: edit, delete, share with _flex _gap2
  **Layout guidance:**
  - shell_alignment: Treat detail-header as a section that sits inside the shell rhythm. It should not recreate shell-level page-width wrappers or duplicate breadcrumb bars already owned by the shell.
  - action_balance: Action controls should support the title rather than overpower it. Keep the title as the primary visual anchor and use compact buttons for secondary actions.
  - status_badge: Status indicators should read as supporting metadata and wrap gracefully below the title on narrow widths.

---

## Pages

### chat (/chat)

Layout: chat-thread (standard) → chat-input (standard)

### generate (/generate)

Layout: content-uploader (single) → detail-header (standard)
