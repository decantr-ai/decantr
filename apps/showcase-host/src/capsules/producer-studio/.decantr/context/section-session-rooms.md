# Section: session-rooms

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** session-rooms
**Description:** Live producer session rooms for real-time co-creation with voice, video, and chat.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (rooms, room-detail)
**Key patterns:** card-grid [moderate], activity-feed, video-room [complex], chat-thread
**CSS classes:** `.studio-beat`, `.studio-knob`, `.studio-rack`, `.neon-glow`
**Density:** comfortable
**Voice:** Creative and technical.

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
| `--d-text` | `#E0E7FF` | Body text, headings, primary content |
| `--d-accent` | `#D946EF` |  |
| `--d-border` | `#4338CA` | Dividers, card borders, separators |
| `--d-primary` | `#22D3EE` | Brand color, key interactive, selected states |
| `--d-surface` | `#2A2565` | Cards, panels, containers |
| `--d-secondary` | `#D946EF` | Secondary brand color, supporting elements |
| `--d-bg` | `#1E1B4B` | Page canvas / base layer |
| `--d-text-muted` | `#A5B4FC` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#E879F9` |  |
| `--d-primary-hover` | `#06B6D4` | Hover state for primary elements |
| `--d-surface-raised` | `#332E80` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#C026D3` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.studio-beat` | Beat grid lines with subdivision markers for timeline and arrangement views. |
| `.studio-knob` | Circular control knobs with cyan indicator and rotational value display. |
| `.studio-rack` | Equipment rack styling with 1U slot dividers and industrial metal aesthetic. |
| `.studio-wave` | Cyan waveform displays with glowing stroke and animated playhead. Audio visualization aesthetic. |
| `.studio-meter` | VU meter styling with gradient fill from cyan through yellow to magenta at peak. |
| `.studio-channel` | Vertical channel strips with fader, meter, and knob stack. Mixing console layout. |
| `.studio-glow-cyan` | Cyan glow effects on active elements using box-shadow and text-shadow. |
| `.studio-glow-magenta` | Magenta glow on peaks, alerts, and secondary highlights. |

**Compositions:** **daw:** Digital audio workstation with track arrangement, mixer view, and transport controls.
**mixer:** Mixing console with channel strips, busses, and master section.
**library:** Sample library browser with waveform previews and tag filtering.
**marketing:** Music production marketing with waveform visuals and electric color palette.
**Spatial hints:** Density bias: 1. Section padding: 32px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface studio-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

live-sessions, voice-chat

---

## Visual Direction

**Personality:** Electric music production workspace with cyan waveforms pulsing across deep purple canvases. Multi-track DAW layout with stem-stack channel strips, meter bars glowing on transients, and automation lanes curving below. Split-royalty calculators with real-time percentage validation. Live session rooms with voice chat and collaborative scrubbing. Think Ableton meets Splice. Lucide icons. Electric.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

## Pattern Reference

### card-grid

Responsive grid of cards with preset-specific content layouts

**Visual brief:** Responsive grid of uniformly-sized cards with consistent gap spacing. Each card is a contained surface with subtle border or shadow, rounded corners (r3), and internal padding. Product preset: top image with fixed aspect ratio, title below in medium-weight text, price in bold heading style, star-rating row with filled/empty star icons, and a full-width add-to-cart button in the card footer. Content preset: thumbnail image, colored category badge, article title, two-line excerpt in muted small text, and an author row with avatar, name, and date. Cards maintain equal height within each row via grid stretch.

**Components:** Card, CardHeader, CardBody, CardFooter, Image, Button, Badge

**Composition:**
```
CardGrid = Grid(d-section, responsive: 1/2/3/4-col) > ProductCard[]
ContentCard = Card(d-surface) > [Thumbnail + CategoryBadge(d-annotation) + Title(heading4) + Excerpt(text-muted) + MetaRow > [AuthorAvatar + AuthorName + Date]]
ProductCard = Card(d-surface, hoverable, lift-on-hover) > [Image(aspect-ratio) + Title(font-medium) + Price(heading4) + RatingRow > [StarIcon[] + CountBadge(d-annotation)] + CTAButton(d-interactive, full-width)]
```

**Layout slots:**
- `card-image`: Product image with aspect-ratio container
- `card-price`: Price with _heading4 styling
- `card-title`: Product name with _textsm _fontmedium
- `card-action`: Add-to-cart Button in CardFooter
- `card-rating`: Star rating row with icon stars and count Badge
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Cards lift on hover with translateY(-2px) and increased shadow over 200ms ease. Image within card scales to 1.03 on hover with overflow hidden. Badge pulses subtly on new items. |
| transitions | Cards entering viewport fade up from 15px below with staggered 100ms delay per card, 300ms duration. Load-more appends new cards with the same stagger animation. |

**Responsive:**
- **Mobile (<640px):** Single column (1 card per row). Cards go full-width with larger touch targets. Image aspect ratio maintained. Gap reduces to gap3.
- **Tablet (640-1024px):** Two columns for most presets. Collection preset stays at 2 columns. Gap at gap4. Cards maintain equal height per row.
- **Desktop (>1024px):** Three to four columns depending on preset. Product goes up to 4 columns at xl breakpoint. Content stays at 3. Icon preset reaches 4 columns. Full gap4-gap6 spacing.


### activity-feed

Chronological list of activity events with avatars, timestamps, and action descriptions

**Visual brief:** Vertical timeline of activity events grouped by date. Each date group starts with a muted, small-text date header. Individual feed items are horizontal rows: a circular avatar (with fallback initials) on the left, then a content block with the user name in medium-weight text followed by the action description in normal weight, and a relative timestamp (e.g. '2h ago') in small muted text right-aligned or below. Items are separated by subtle dividers or spacing. The compact preset drops avatars and uses small type-indicator icons instead. The detailed preset wraps each item in a bordered card with attachment previews and action buttons (reply, like).

**Components:** Avatar, Badge, Button

**Composition:**
```
FeedItem = Row(d-data-row, hoverable) > [Avatar(fallback-initials) + Content(flex-col) > [UserName(font-medium) + ActionText] + Timestamp(mono-data, text-xs, text-muted)]
DateGroup = Section > [DateHeader(d-annotation, text-muted) + FeedItem[]]
ActivityFeed = Container(d-data, flex-col, full-width) > [DateGroup[] + LoadMore?(d-interactive)]
```

**Layout slots:**
- `avatar`: User Avatar with fallback initials
- `content`: Action text with user name (_fontmedium) and description
- `feed-item`: Single activity row: _flex _row _gap3 _items[start]
- `load-more`: Button at bottom to load older activities
- `timestamp`: Relative time label with _textsm _fgmuted
- `date-header`: Date group separator with _textsm _fgmuted _fontmedium
  **Layout guidance:**
  - grouping: Group events by date. Date header: d-label with accent left-border. Today/Yesterday labels, then ISO dates.
  - empty_state: Encouraging: 'No activity yet. Publish your first item to see it here.'
  - event_treatment: Each event row: small colored dot (8px, color by event type) + timestamp (mono-data, text-xs) + description. Hover: subtle bg highlight.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Feed item rows highlight on hover with subtle background transition over 150ms. Action buttons in detailed preset scale on hover. |
| transitions | New activity items slide in from the top with 300ms ease-out translateY(-10px) to translateY(0) plus opacity 0 to 1. Staggered by 80ms per item when multiple arrive. Load-more items fade in from below. |

**Responsive:**
- **Mobile (<640px):** Full-width feed. Avatar size reduces to 32px. Timestamp moves below the content text instead of right-aligned. Detailed preset card actions stack vertically. Load-more button goes full-width.
- **Tablet (640-1024px):** Standard layout with avatars at 36px. Timestamp stays inline right-aligned. Comfortable spacing with gap3.
- **Desktop (>1024px):** Full layout with 40px avatars. Generous spacing. Detailed preset shows attachment previews inline. Actions row is fully horizontal.


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


---

## Pages

### rooms (/rooms)

Layout: card-grid → activity-feed

### room-detail (/rooms/:id)

Layout: video-room → chat-thread
