# Section: music-workspace

**Role:** primary | **Shell:** sidebar-aside | **Archetype:** music-workspace
**Description:** Music producer session workspace with multi-track waveform editing, stem stacking, and split-pane arrangement for audio production flows.

## Quick Start

**Shell:** Three-column layout with left navigation and right inspector/detail panel. Used for admin dashboards, email clients, IDE-style apps. (nav: 240px, header: 52px)
**Pages:** 2 (session, session-detail)
**Key patterns:** split-pane, waveform-track [moderate], stem-stack [moderate]
**CSS classes:** `.studio-beat`, `.studio-knob`, `.studio-rack`, `.neon-glow`
**Density:** comfortable
**Voice:** Creative and technical.

## Shell Implementation (sidebar-aside)

### body

- **flex:** 1
- **note:** Main scroll container for primary content.
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: sidebar 1fr aside; rows: 52px 1fr

### aside

- **note:** Right inspector/detail panel. Toggleable. Shows contextual details, properties, or preview.
- **atoms:** _flex _col _borderL
- **width:** 280px
- **border:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-bg)
- **collapsible:** true

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **left_content:** Breadcrumb / page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Actions / search

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - overflow_y: auto
  - item_content: icon + label text
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
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
  - content: User avatar + settings
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
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

**Zone:** App (primary) — sidebar-aside shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

session-editing, stems, mixing

---

## Visual Direction

**Personality:** Electric music production workspace with cyan waveforms pulsing across deep purple canvases. Multi-track DAW layout with stem-stack channel strips, meter bars glowing on transients, and automation lanes curving below. Split-royalty calculators with real-time percentage validation. Live session rooms with voice chat and collaborative scrubbing. Think Ableton meets Splice. Lucide icons. Electric.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

## Pattern Reference

### split-pane

Resizable terminal panes with keyboard and mouse controls for multi-panel layouts.

**Visual brief:** Multi-panel layout with resizable dividers between panes. The horizontal preset splits the viewport into left and right panels with a vertical drag handle between them. The vertical preset splits into top and bottom with a horizontal drag handle. The quad preset creates four panels in a 2x2 grid with cross-shaped drag handles at the center. Each pane has a monospace terminal aesthetic with a dark background. Drag handles render as a thin line with a grip indicator (three dots or lines). Double-clicking a handle resets to equal sizing.

**Components:** Container

**Layout slots:**
- `divider`: Resizable vertical divider
- `pane-left`: Left content pane
- `pane-right`: Right content pane
**Responsive:**
- **Mobile (<640px):** Panes stack vertically (no side-by-side splitting). Tab-based switching between panes instead of simultaneous view. No drag handles.
- **Tablet (640-1024px):** Horizontal split available. Drag handles have larger touch targets (24px hit area). Quad preset unavailable.
- **Desktop (>1024px):** Full split pane with all presets. Keyboard shortcuts for resizing. Drag handles at standard size.


### waveform-track

Audio waveform track displaying regions, automation lanes, gain control, and beat grid for DAW-style audio editing interfaces.

**Visual brief:** A horizontal track row approximately 96px tall (track preset). Track header on the left (160px fixed width) contains: track name in semibold 13px, mute/solo/arm circular buttons (24px each) in a row, and a horizontal gain slider with dB value display. Track header has subtle border-right separating it from the waveform. Waveform canvas fills remaining horizontal space rendering symmetrical amplitude envelope: mirrored above and below horizontal centerline in accent color (e.g. blue for audio, green for synth), against a muted background. Regions appear as colored semi-transparent rectangles overlaid on the waveform with 2px colored borders and clip names in 11px text at top-left. Beat grid lines run vertically through the waveform at BPM-synced intervals (1px, subtle muted color, brighter on bar lines). Automation lanes (optional, 32px tall each) stack below the main waveform showing parameter curves (volume, pan) as line graphs with draggable node points. Hovering on the waveform shows a vertical playhead indicator and timecode tooltip.

**Components:** WaveformCanvas, RegionBlock, AutomationLane, GainSlider, TrackHeader, MuteSolo

**Composition:**
```
RegionBlock = Overlay(absolute, d-interactive) > [ClipName + TrimHandles + FadeCurves]
TrackHeader = Column(d-control) > [TrackName + MuteSoloArm + GainSlider]
WaveformArea = Container > [WaveformCanvas + RegionBlock* + BeatGrid + AutomationLane*]
WaveformTrack = Root(d-surface, flex-row) > [TrackHeader + WaveformArea]
```

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| gain-drag | slider follows pointer at 60fps with real-time dB update |
| mute-solo-toggle | button color transition 150ms + ripple on click |
| region-add | region scale-in + fade 200ms spring |
| automation-node-drag | curve reshape 16ms per frame during drag |
| active-playback | vertical playhead line moves continuously across waveform at playback rate |
| armed-recording-pulse | arm button red pulse 1s ease-in-out infinite when recording |

**Responsive:**
- **Mobile (<640px):** Track header collapses to 64px with icon-only controls. Gain slider becomes popover. Automation lanes hidden; toggle to view. Waveform height reduces to 56px.
- **Tablet (640-1024px):** Standard layout with condensed track name. Full mute/solo/arm visible.
- **Desktop (>1024px):** Full 96px track with all automation lanes expanded and hover interactions.

**Accessibility:**
- Role: `region`
- Keyboard: M: toggle mute on focused track; S: toggle solo on focused track; R: toggle record-arm on focused track; Up/Down: adjust gain 1dB; Shift+Up/Down: adjust gain 0.1dB; Delete: remove focused region
- Announcements: Track {name} gain set to {value} dB; Track {name} {muted|soloed|armed}; Region {name} added at {timestamp}


### stem-stack

Multi-stem audio mixer with per-stem channel strips, faders, pan knobs, meters, plugin slots, and master chain for DAW-style mixing.

**Visual brief:** Vertical channel strips arranged side-by-side in a horizontal row. Each channel strip is approximately 80px wide and 480px tall (standard preset). From top to bottom each strip contains: 3-4 plugin slots as stacked small rectangles (72x24px) with plugin name text, a circular pan knob (40px diameter) with rotation indicator line and pan label, a row with mute and solo buttons (24px each, M/S labeled), a tall vertical fader (dominating center of strip, approximately 240px tall) with draggable knob cap and dB scale markings on one side, stereo level meter bars (2px wide each, flanking the fader on both sides) with color-graded peaks (green <-6dB, yellow -6 to -3dB, red >-3dB) and a peak-hold dot, and a stem name label at the bottom in 11px text with optional color-coding. The master channel on the far right is visually distinct (slight border highlight, primary-color accent) and has fewer plugin slots, emphasizing the master fader and meters. Hovering the fader cap shows a dB value tooltip. Meters update in real-time with audio levels.

**Components:** StemChannel, ChannelFader, PanKnob, MuteSoloButton, MeterBar, PluginSlot

**Composition:**
```
StemStack = Root(d-section, flex-row) > [StemChannel* + MasterChannel(d-surface, emphasized)]
PluginSlots = Stack > PluginSlot*(d-interactive, empty|filled)
StemChannel = Strip(d-surface, vertical) > [PluginSlot* + PanKnob + MuteSoloButton + FaderWithMeters + StemLabel]
FaderWithMeters = Container(relative) > [MeterBar(left) + ChannelFader(center) + MeterBar(right)]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| knob-drag | rotation follows pointer delta 60fps with value readout |
| fader-drag | cap follows pointer 60fps with real-time dB text update |
| solo-mode | non-soloed channels fade to 40% opacity 150ms ease-out |
| plugin-add | slot scale-in + fade 200ms spring |
| peak-hold | peak dot holds for 1.5s then decays |
| meter-levels | amplitude bars animate in real-time from audio signal |

**Responsive:**
- **Mobile (<640px):** Channel strips scroll horizontally. Plugin slots reduce to 2. Pan knob becomes slider. Meters simplify to single bar.
- **Tablet (640-1024px):** Channel strips at 72px wide. Full controls maintained. Horizontal scroll for many stems.
- **Desktop (>1024px):** Full 80px strips with all controls visible, hover tooltips, and keyboard automation.

**Accessibility:**
- Role: `region`
- Keyboard: Tab: cycle through channels; Arrow keys: adjust focused fader/knob; Shift+Arrow: fine adjustment; M: mute focused channel; S: solo focused channel; 0: reset fader to 0dB
- Announcements: {channel} fader set to {value} dB; {channel} pan set to {value}; {channel} {muted|soloed}; Plugin {name} added to {channel}


---

## Pages

### session (/session)

Layout: split-pane → waveform-track → stem-stack

### session-detail (/session/:id)

Layout: waveform-track → stem-stack
