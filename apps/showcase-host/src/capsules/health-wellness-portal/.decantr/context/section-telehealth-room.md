# Section: telehealth-room

**Role:** auxiliary | **Shell:** minimal-header | **Archetype:** telehealth-room
**Description:** Video consultation room for telehealth appointments with speaker-focused layout, session controls, and provider notes.

## Quick Start

**Shell:** Slim header with centered content below. Used for checkout flows, focused task pages. (header: 44px)
**Pages:** 1 (session)
**Key patterns:** video-room [complex]
**CSS classes:** `.health-nav`, `.health-card`, `.health-alert`
**Density:** comfortable
**Voice:** Caring, clear, and professional.

## Shell Implementation (minimal-header)

### body

- **flex:** 1
- **align:** center
- **atoms:** _flex _col _aic _overflow[auto] _flex1 _py8
- **padding:** 2rem 0
- **direction:** column
- **overflow_y:** auto
- **content_wrapper:**
  - gap: 1.5rem
  - note: Centered column for focused content. Checkout forms, task pages.
  - atoms: _w[720px] _mw[100%] _px4 _flex _col _gap6
  - width: 720px
  - padding: 0 1rem
  - direction: column
  - max_width: 100%

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **note:** Slim header with centered brand. Minimal — no nav links.
- **align:** center
- **border:** bottom
- **height:** 44px
- **sticky:** true
- **content:** Back arrow icon + brand link, centered
- **display:** flex
- **justify:** center
- **padding:** 0.75rem 0
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.

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
| `--d-text` | `#0F172A` | Body text, headings, primary content |
| `--d-accent` | `#7C3AED` |  |
| `--d-border` | `#E2E8F0` | Dividers, card borders, separators |
| `--d-primary` | `#0284C7` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#0D9488` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAFAF8` | Page canvas / base layer |
| `--d-text-muted` | `#64748B` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#6D28D9` |  |
| `--d-primary-hover` | `#0369A1` | Hover state for primary elements |
| `--d-surface-raised` | `#F5F7FA` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#0F766E` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.health-nav` | Clean spacious navigation with generous spacing. Clear active states and focus indicators. |
| `.health-card` | White card with subtle shadow and large 12px radius. Clean, spacious padding for medical content readability. |
| `.health-alert` | Left-border severity stripe (4px) with tinted background. Color indicates severity: info, warning, critical. |
| `.health-badge` | Rounded pill badge with tinted semantic background. Always includes text label for accessibility. |
| `.health-input` | Large input with generous 14px padding. Clear focus ring for accessibility. Designed for clinical data entry. |
| `.health-metric` | Large prominent number with color-coded status dot indicator. Used for vitals, lab results, and patient stats. |
| `.health-status` | Color-coded status with always-visible text label. Never relies on color alone per WCAG guidelines. |
| `.health-surface` | Warm white background with minimal 1px border. Creates gentle separation without harsh contrast. |

**Compositions:** **auth:** Centered authentication forms with clean card styling. HIPAA-compliant login with MFA support.
**clinical:** Clinical data entry and review. Dense but readable layouts with large inputs and clear labels.
**dashboard:** Patient dashboard with sidebar navigation. Vitals overview, appointments, medication schedule, and health metrics.
**marketing:** Healthcare marketing pages with trust signals. Professional hero sections and feature grids.
**patient-portal:** Patient-facing portal with top navigation. Simplified interface for appointments, records, and messaging.
**Spatial hints:** Density bias: -1. Section padding: 48px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface healthcare-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — minimal-header shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

telehealth, video, notes

---

## Visual Direction

**Personality:** Calming, trust-building health portal with emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Vitals use color-coded status indicators always supplemented with text labels. Appointment booking is straightforward. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence. Lucide icons. WCAG AAA compliance throughout.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### video-room

Video conferencing layout with participant grid, speaker view, screen sharing, and a floating controls bar for real-time communication.

**Visual brief:** A dark-themed (always dark, background: #0a0a0f) full-viewport video conferencing interface. The grid layout arranges participant tiles as rounded rectangles (border-radius: 12px) with 8px gaps between them, automatically calculating optimal grid dimensions (e.g., 2x2 for 4 participants, 3x3 for 9). Each ParticipantTile has a subtle border (1px solid rgba(255,255,255,0.08)) that transforms into a glowing accent-colored border when the participant is speaking — the glow uses box-shadow: 0 0 0 2px var(--d-accent), 0 0 12px rgba(var(--d-accent-rgb), 0.3) with a smooth pulse animation synced to audio levels. Video fills the tile with object-fit: cover. When video is off, the tile shows the participant's avatar as a large centered circle (64px in grid, 120px in speaker view) on a slightly lighter dark background (bg-gray-900). Name labels float at the bottom-left of each tile: text rendered on a frosted glass bar (backdrop-filter: blur(12px), background: rgba(0,0,0,0.5), border-radius: 6px, padding: 4px 8px). The label shows the participant name (text-sm, text-white) and a small mute icon (12px, red microphone-off icon) if muted. In speaker view, the active speaker occupies the top 70% of the viewport as a large tile, with a horizontal filmstrip of other participants (120px tall tiles) scrolling along the bottom. The transition between active speakers cross-fades over 400ms. The ControlsBar is centered at the bottom of the viewport, floating 24px above the edge. It contains circular buttons (48px diameter) arranged horizontally with 12px gaps: microphone toggle (white icon on dark bg, red bg when muted), camera toggle (same pattern), screen share (accent highlight when active), reactions (opens an emoji picker flyout), participants list toggle, chat toggle, and leave call (always red background, white phone-down icon). Buttons have a frosted glass background (backdrop-filter: blur(16px), background: rgba(30,30,30,0.8), border: 1px solid rgba(255,255,255,0.1)). The ReactionOverlay renders floating emoji that rise from the participant's tile with a float-up + fade-out animation. Screen share mode places the shared content in 75% of the width with a vertical strip of participant thumbnails (160px wide) on the right side.

**Components:** VideoGrid, ParticipantTile, SpeakerView, ScreenShareView, ControlsBar, ParticipantList, ChatSidebar, ReactionOverlay

**Composition:**
```
VideoArea = Grid(d-surface[dark], responsive-grid) > ParticipantTile* | SpeakerView | ScreenShareView
VideoRoom = Room(d-section, full-viewport, dark-always) > [VideoArea + ControlsBar + ReactionOverlay + ChatSidebar? + ParticipantList?]
ControlsBar = Bar(floating, frosted-glass, bottom-center, auto-hide) > [MicButton + CameraButton + ShareButton + ReactionsButton + ParticipantsButton + ChatButton + LeaveButton(red)]
SpeakerView = Split(flex-col) > [DominantTile(flex-7) + Filmstrip(flex-3, horizontal-scroll) > ParticipantTile*]
ParticipantTile = Tile(d-surface[dark], rounded, overflow-hidden) > [VideoStream | AvatarFallback] + NameLabel(frosted-glass) + MuteIndicator?
ReactionOverlay = Layer(pointer-events-none, full-viewport) > FloatingEmoji*(animated, ephemeral)
ScreenShareView = Split(flex-row) > [SharedContent(flex-3, object-contain) + TileSidebar(flex-1, vertical-scroll) > ParticipantTile*]
```

**Layout slots:**
  **Layout guidance:**
  - note: This pattern ALWAYS uses a dark theme regardless of the app's light/dark mode setting. Background must be near-black (#0a0a0f or similar). All text is white/light. Do not apply light theme colors.
  - container: full-viewport-dark
  - name_labels: Name labels use frosted glass (backdrop-filter: blur(12px)). They are positioned at the bottom-left of each tile with 8px margin. Keep them compact — name only with optional mute icon. Do NOT show full details in the label.
  - tile_sizing: Participant tiles must maintain 16:9 aspect ratio when possible. In grid mode, calculate rows and columns to fill the viewport: cols = ceil(sqrt(n * aspectRatio)), rows = ceil(n / cols). Use CSS aspect-ratio: 16/9 with object-fit: cover on video elements.
  - controls_placement: ControlsBar must be centered horizontally, floating above the bottom edge. It should auto-hide after 5 seconds of mouse inactivity (fade out over 300ms) and reappear on mouse movement. On touch devices, tap to toggle visibility.
  - speaking_indicator: The speaking border glow is the PRIMARY visual indicator of who is talking. It must be clearly visible — use at least 2px solid accent border + 12px blur box-shadow. The glow should pulse subtly (opacity 0.6→1.0→0.6) synced to audio amplitude.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| mute-toggle | Icon cross-fades with 150ms, background-color transitions 200ms |
| button-hover | brightness(1.2) filter, 100ms ease-out |
| button-press | scale(0.95) on active/press, 80ms ease-out, return 120ms ease-out |
| grid-reflow | When participant joins or leaves, tiles animate to new grid positions over 300ms spring(1, 100, 12) |
| speaker-swap | Cross-fade between active speakers, 400ms ease-in-out. Outgoing speaker tile animates to filmstrip position while incoming speaker tile expands to dominant. |
| controls-hide | Controls bar fades out (opacity 1→0) over 300ms after 5s of mouse inactivity, fades in immediately on mouse move |
| sidebar-toggle | Chat/participant sidebar slides in from right over 300ms ease-out with a subtle backdrop dim |
| audio-ring | In audio-only mode, concentric rings expand outward from avatar when speaking, 1s ease-out infinite while voice active |
| speaking-glow | Active speaker border glow pulses opacity 0.5→1.0→0.5, 1.5s ease-in-out, synchronized to voice activity detection |
| reaction-float | Emoji rises from tile bottom-center, drifts upward 120px with sinusoidal X offset (amplitude 20px, period 1s), scales 1.0→1.3, opacity 1.0→0, duration 2s ease-out |

**Responsive:**
- **Mobile (<640px):** Grid layout switches to max 2x2 tiles with the active speaker auto-promoted to the largest tile. Controls bar simplifies to 4 essential buttons (mic, camera, chat, leave) with a '...' overflow menu for additional controls. Participant tiles show only video/avatar without name labels (name appears on tap). Screen share view goes full-screen with a floating 'back to tiles' button. Chat sidebar becomes a full-screen overlay. No hover states — all interactions are tap-based.
- **Tablet (640-1024px):** Grid supports up to 3x3 tiles. Controls bar shows all buttons. Speaker view maintains the 70/30 split. Screen share sidebar becomes a bottom filmstrip instead of right sidebar. Chat sidebar is a half-width overlay. Touch-friendly button sizes (min 44px tap targets). Name labels always visible.
- **Desktop (>1024px):** Full grid up to 7x7 (49 participants). All controls visible with keyboard shortcuts. Hover-to-show name labels option. Controls bar auto-hides on mouse inactivity. Screen share uses the right sidebar layout. Chat and participant list can be open simultaneously if viewport width exceeds 1400px. Drag to rearrange participant tile positions.

**Accessibility:**
- Role: `application`
- Keyboard: M: toggle microphone mute; V: toggle camera on/off; S: toggle screen sharing; C: toggle chat sidebar; P: toggle participant list; R: open reactions picker; Tab: cycle through participant tiles; Enter: pin/unpin focused participant; Escape: close any open sidebar or picker; Ctrl+D / Cmd+D: leave call (with confirmation)
- Announcements: {name} joined the call; {name} left the call; {name} started sharing their screen; {name} stopped sharing; {name} is now speaking; You are now muted; You are now unmuted


---

## Pages

### session (/telehealth)

Layout: video-room
