# Section: log-viewer

**Role:** auxiliary | **Shell:** terminal-split | **Archetype:** log-viewer
**Description:** Dedicated log streaming interface with filtering, search, and real-time updates. Focus view for log analysis and monitoring.

## Quick Start

**Shell:** Terminal-style layout with status bar, resizable split panes, and hotkey bar. Optimized for CLI tool interfaces with monospace typography and ASCII borders.
**Pages:** 2 (logs, grouped)
**Key patterns:** log-stream
**CSS classes:** `.term-glow`, `.term-tree`, `.term-type`
**Density:** comfortable

## Shell Implementation (terminal-split)

### body

- **note:** Split pane body. Supports horizontal, vertical, and quad layouts. Min pane size 100px.
- **display:** flex
- **divider:**
  - note: Drag handle between panes.
  - width: 4px
  - cursor: col-resize
  - background: var(--d-border)
- **padding:** 0.5rem
- **overflow:** hidden
- **pane_left:**
  - flex: 1
  - note: Left split pane. Resizable width via drag handle.
  - padding: 0.5rem
  - overflow_y: auto
- **pane_right:**
  - flex: 1
  - note: Right split pane. Resizable width via drag handle.
  - padding: 0.5rem
  - overflow_y: auto

### root

- **font:** monospace
- **atoms:** _grid _h[100vh] _mono _bgblack _fggreen
- **color:** var(--d-green)
- **height:** 100vh
- **display:** grid
- **background:** var(--d-black)
- **grid_template:** rows: 24px 1fr 28px

### hotkey_bar

- **gap:** 1rem
- **note:** Keyboard shortcut hints. Each item: kbd badge + label.
- **align:** center
- **atoms:** _flex _aic _gap4 _px2 _bgmuted _textsm
- **height:** 28px
- **sticky:** true
- **display:** flex
- **padding:** 0 0.5rem
- **font_size:** sm
- **background:** var(--d-surface)

### status_bar

- **align:** center
- **color:** var(--d-black)
- **height:** 24px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 0.5rem
- **font_size:** sm
- **background:** var(--d-green)
- **left_content:** App name + version
- **right_content:** Status indicator

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
| `--d-text` | `#00FF00` | Body text, headings, primary content |
| `--d-accent` | `#00FFFF` |  |
| `--d-border` | `#333333` | Dividers, card borders, separators |
| `--d-primary` | `#00FF00` | Brand color, key interactive, selected states |
| `--d-surface` | `#0A0A0A` | Cards, panels, containers |
| `--d-secondary` | `#FFB000` | Secondary brand color, supporting elements |
| `--d-bg` | `#000000` | Page canvas / base layer |
| `--d-text-muted` | `#00AA00` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#00CCCC` |  |
| `--d-primary-hover` | `#00CC00` | Hover state for primary elements |
| `--d-surface-raised` | `#111111` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#CC8C00` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.term-glow` | Subtle phosphor bloom effect using text-shadow with current color. 5px and 10px spread. |
| `.term-tree` | Tree view using ASCII connectors. Uses ├── └── │ for hierarchy visualization. |
| `.term-type` | Typewriter entrance animation. Characters appear one by one, 20ms per character. |
| `.term-blink` | Blinking cursor animation at 1s interval. Steps timing for authentic terminal feel. |
| `.term-input` | Terminal prompt style with '> ' prefix and blinking cursor. Monospace input. |
| `.term-panel` | ASCII box-drawing border using Unicode characters. Background surface color, 1px solid border. |
| `.term-table` | Full ASCII table borders with box-drawing characters for headers, cells, and junctions. |
| `.term-canvas` | Pure black background (#000000) for CRT authenticity. No gradients, no textures. |
| `.term-hotkey` | Function key button style '[F1]'. Border, padding, monospace. Inverse on active. |
| `.term-status` | Inverse color status bar. Background uses text color, text uses background color. |
| `.term-diff-add` | Addition highlighting. Green background with darker green text for added lines. |
| `.term-diff-del` | Deletion highlighting. Red background with darker red text for removed lines. |
| `.term-progress` | ASCII progress bar using block characters. [||||....] style with percentage. |
| `.term-scanlines` | Optional CRT scanline overlay using repeating-linear-gradient. Semi-transparent black lines. |
| `.term-sparkline` | Inline ASCII sparkline using braille characters for high-resolution mini charts. |

**Preferred:** log-stream
**Compositions:** **auth:** Terminal-styled authentication forms with ASCII borders.
**logs:** Log viewer with real-time streaming and filtering.
**dashboard:** Terminal dashboard with split panes, status bar, and hotkey bar.
**marketing:** Dev tool marketing page with terminal aesthetic hero.
**Spatial hints:** Density bias: 2. Section padding: 16px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface terminal-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — terminal-split shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

log-streaming, log-filtering, log-search, log-levels, auto-scroll, export-logs

---

## Visual Direction

**Personality:** technical. retro. focused. immersive

## Constraints

- **mode:** dark_only
- **borders:** ascii_box_drawing
- **corners:** sharp_only
- **effects:** {"glow":"optional","flicker":"disabled","scanlines":"optional"}
- **shadows:** none
- **typography:** monospace_only

---

## Pattern Reference

### log-stream

Real-time log streaming display with filtering, search, and auto-scroll behavior.

**Visual brief:** Terminal-style scrolling log display on a dark background with monospace text. Each log entry is a single line showing a timestamp in muted color, a log level badge (INFO in blue, WARN in yellow, ERROR in red, DEBUG in gray), and the message text. New entries append at the bottom with auto-scroll behavior. A controls header contains a search input, level filter toggles, and a pause/resume button. The filtered preset dims non-matching entries. The grouped preset collapses repeated messages with a count badge. A small stats bar shows entries/second and total count.

**Components:** Button, icon

**Layout slots:**
- `stats`: Error/warn/info counts
- `header`: Pause/play controls and stats
- `stream`: Scrolling log entries
**Responsive:**
- **Mobile (<640px):** Full-width log view. Controls collapse into a top bar with a filter toggle button. Log entries use smaller font. Search is a full-width overlay.
- **Tablet (640-1024px):** Standard layout with controls visible. Comfortable font size for log entries.
- **Desktop (>1024px):** Full log stream with controls bar, search, and stats visible. Wide view accommodates long log messages without wrapping.


---

## Pages

### logs (/app/logs)

Layout: status → log-stream → hotkeys

### grouped (/app/logs/grouped)

Layout: status → grouped-logs → hotkeys
