# Section: lab-notebook

**Role:** primary | **Shell:** sidebar-aside | **Archetype:** lab-notebook
**Description:** Primary authoring surface for a scientific research lab. Researchers maintain an electronic lab notebook with hierarchical page tree, rich entries, and checklist protocols.

## Quick Start

**Shell:** Three-column layout with left navigation and right inspector/detail panel. Used for admin dashboards, email clients, IDE-style apps. (nav: 240px, header: 52px)
**Pages:** 2 (notebook, entry-detail)
**Key patterns:** page-tree, notebook-entry [complex], protocol-step [complex]
**CSS classes:** `.lab-grid`, `.lab-panel`, `.lab-beaker`
**Density:** comfortable
**Voice:** Scientific and methodical.

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
| `--d-text` | `#18181B` | Body text, headings, primary content |
| `--d-accent` | `#06B6D4` |  |
| `--d-border` | `#E4E4E7` | Dividers, card borders, separators |
| `--d-primary` | `#06B6D4` | Brand color, key interactive, selected states |
| `--d-surface` | `#FAFAFA` | Cards, panels, containers |
| `--d-secondary` | `#0E7490` | Secondary brand color, supporting elements |
| `--d-bg` | `#FFFFFF` | Page canvas / base layer |
| `--d-text-muted` | `#71717A` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#0891B2` |  |
| `--d-primary-hover` | `#0891B2` | Hover state for primary elements |
| `--d-surface-raised` | `#F4F4F5` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#155E75` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lab-grid` | Precise 8px grid alignment with visible baseline grid on hover or debug mode. |
| `.lab-panel` | White panels with precise 1px borders and sharp corners. Clean container for data and controls. |
| `.lab-beaker` | Scientific iconography with cyan stroke weight matching 1.5px precision. |
| `.lab-hazard` | Yellow and black diagonal hazard stripes for warnings and caution zones. |
| `.lab-barcode` | Monospace barcode-style displays for sample IDs and tracking codes. |
| `.lab-reading` | Monospace IBM Plex Mono data displays with tabular-nums and precise alignment. |
| `.lab-protocol` | Numbered step markers with circle badges and precise connectors for procedural displays. |
| `.lab-cyan-accent` | Cyan status indicators and highlights for active data streams and live readings. |

**Compositions:** **protocol:** Protocol step-by-step interface with numbered procedures and safety callouts.
**marketing:** Research platform marketing with technical precision and data visualization.
**data-explorer:** Data exploration interface with precise readings, barcodes, and grid alignment.
**experiment-dashboard:** Experiment monitoring dashboard with live readings, protocol steps, and sample tracking.
**Spatial hints:** Density bias: 1. Section padding: 48px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface lab-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — sidebar-aside shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

notebook, entries, authoring, protocols

---

## Visual Direction

**Personality:** Scientific research workspace with pristine white panels and technical cyan accents. Lab notebook entries with LaTeX formula blocks and image embeds. Protocol steps numbered with reagent lists, equipment chips, and safety badges. Sample trackers with barcode displays and expiry countdowns. Instrument scheduling grids show bookings across lab equipment. Dataset cards with schema trees and quality indicators. Think Benchling meets Jupyter. Lucide icons. Precise.

## Pattern Reference

### page-tree

Hierarchical page navigation with drag-and-drop reordering, inline rename, and nested page support. Used in workspace sidebars.

**Visual brief:** Sidebar navigation tree with nested page items. Each item shows a document icon, page title, and an expand/collapse chevron for nested children. Indentation increases per nesting level with a thin vertical guide line. Hovering a page reveals action icons (three-dot menu for rename, duplicate, delete). A 'Favorites' section at the top shows pinned pages with a star icon. A search input at the very top filters pages by name. A 'New Page' button at the bottom (or a plus icon at the top) creates new pages. The compact preset reduces row height and font size. The flat preset removes nesting and shows all pages in a flat alphabetical list.

**Components:** Button, Input, icon

**Composition:**
```
PageTree = Panel(d-section, flex-col) > [SearchInput(d-control) + FavoritesSection? + TreeList + NewPageButton(d-interactive)]
TreeItem = Row(hoverable, indent: level) > [ExpandChevron? + DocIcon + PageTitle(ellipsis) + ActionsMenu?(d-interactive, show-on-hover)]
TreeList = List(flex-col) > TreeItem(d-data-row)[]
FavoritesSection = Section > [SectionLabel(d-annotation) + PageItem(icon: star)[]]
```

**Layout slots:**
- `tree`: Nested page items
- `search`: Filter pages by name
- `favorites`: Pinned pages section
- `new-button`: Create new page button
**Responsive:**
- **Mobile (<640px):** Page tree renders as a full-screen drawer or sheet. Larger touch targets for tree items. Drag-to-reorder uses long-press. Actions in swipe menus.
- **Tablet (640-1024px):** Sidebar at 260px width. Standard row heights. Drag-to-reorder functional.
- **Desktop (>1024px):** Sidebar at 280px width with comfortable spacing. Full keyboard navigation. Drag-and-drop reordering.


### notebook-entry

An electronic lab notebook (ELN) entry card combining rich text, embedded images, LaTeX-rendered formulas, timestamp-chained edit history, and reviewer annotations for scientific record-keeping and witness-signing compliance.

**Visual brief:** A lab-notebook entry rendered as a d-surface document with a thin left accent border and generous padding reflecting the feel of a bound laboratory notebook page. The EntryHeader at the top shows: a DateBadge pill with full date and time ('April 5, 2026 — 14:23'), an experiment-ID chip ('EXP-2026-042'), and an AuthorAvatar (32px circle) with author name and role beneath. A title in text-2xl semibold follows ('Protein Expression Optimization — Trial 3'). A horizontal rule separates header from body. The RichContent body flows in a newspaper-column-inspired layout with readable line-height (1.6) and max-width 70ch. TextBlocks render as paragraphs with proper typography. ImageEmbeds appear as centered figures with thin borders, captions beneath ('Figure 1: SDS-PAGE gel showing lane 1-6 expressed protein') in text-sm italic, and click-to-enlarge behavior opening a full-resolution lightbox. FormulaBlocks render mathematical expressions via LaTeX (e.g., 'OD600 = log(I₀/I) × path-length') in a display-math style with subtle gray background inset. Data tables render with monospaced headers and tabular-nums cells. The TimestampChain sits at the bottom of the entry showing edit-history as a horizontal chain: small timestamp pills connected with arrows ('Created 14:23 → Edited 15:47 → Edited 16:12'). Each pill shows user initial + time, hoverable for full diff. In review preset, ReviewerNotes render as yellow sticky-note cards in the right margin, anchored by thin connector lines to the text range they annotate, with reviewer avatar, note text, and 'resolve' button. A SignatureBlock at the very bottom shows the author signature (e.g., 'Signed: J. Chen 16:12 EDT') and when witnessed, a co-signer block ('Witnessed by: S. Park 17:04 EDT') with tamper-evident hash of the content. The entire entry becomes immutable after signing — further edits create a new dated revision.

**Components:** EntryHeader, RichContent, ImageEmbed, FormulaBlock, TimestampChain, ReviewerNote, TextBlock, SignatureBlock, AuthorAvatar

**Composition:**
```
ImageEmbed = Figure(d-surface, bordered, data-interactive) > [Image + Caption + LightboxLink]
EntryHeader = Header(d-annotation) > [DateBadge + ExperimentIdChip + AuthorAvatar + EntryTitle]
RichContent = Body(d-prose, max-w-70ch) > [TextBlock[] + ImageEmbed[] + FormulaBlock[] + DataTable[]]
FormulaBlock = Block(d-annotation, data-formula, mathjax) > [LatexExpression]
ReviewerNote = Card(d-surface, data-note, sticky-yellow, margin-right) > [ReviewerAvatar + NoteText + Timestamp + ResolveButton + AnchorLine]
NotebookEntry = Surface(d-surface, document, border-left-accent) > [EntryHeader + RichContent + TimestampChain + ReviewerNote[]? + SignatureBlock]
SignatureBlock = Block(d-annotation, data-signature, data-locked?) > [AuthorSignature + WitnessSignature? + ContentHash]
TimestampChain = Chain(d-annotation, data-timestamp-history) > [TimestampPill[] > [UserInitial + TimeText] + ChainArrow[]]
```

**Layout slots:**
- `content`: Story/about narrative text content
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
  **Layout guidance:**
  - note: ELN entries are regulated scientific records (21 CFR Part 11 compliant). After signature, entries are immutable. Edits create new revisions with full diff preserved.
  - container: d-surface document with left-accent border
  - image_embed: ImageEmbed figures centered with 1px border, 8px padding, and caption beneath in text-sm italic. Click opens lightbox at full resolution.
  - formula_block: FormulaBlock uses MathJax/KaTeX rendering, display-math style. Inset gray background for visual distinction from body text.
  - signature_block: SignatureBlock hashes entry content at time of signing for tamper-evidence. After witness co-signature, entry enters locked state (no further edits allowed, only appended revisions).
  - timestamp_chain: TimestampChain shows ALL edits with user+timestamp. Never hides revision history. Hoverable pills show diff of that edit.
  - rich_content_width: RichContent body max-width 70ch for readable line-length. Line-height 1.6. Paragraph spacing generous.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| image-hover | subtle shadow-lift 150ms ease-out |
| formula-hover | background darkens subtly 150ms ease-out |
| timestamp-hover | pill brightens + expands 120ms ease-out |
| note-resolve | yellow note fade + slide-out 250ms ease-in |
| image-lightbox | image scale + fade from thumbnail to fullscreen 300ms ease-out |
| signature-lock | border color shift to success + content dim 400ms ease-out |
| unsigned-pulse | SignatureBlock subtle amber tint pulse 2s ease-in-out infinite when entry unsigned |

**Responsive:**
- **Mobile (<640px):** Entry expands to full width with reduced padding. ReviewerNotes collapse into inline indicators that expand on tap. ImageEmbeds fit 100% width. FormulaBlocks allow horizontal scroll.
- **Tablet (640-1024px):** Standard document at max-w-820px. Review preset maintains right margin ReviewerNotes at reduced 200px width.

**Accessibility:**
- Role: `article`
- Keyboard: J/K: navigate between entries; R: toggle review annotations; I: open images in lightbox; E: edit current entry (if unsigned); S: sign entry (author) or witness (reviewer)
- Announcements: Entry by {author} from {date}, experiment {id}; Edited {count} times, last edit {timestamp}; Entry signed by {author} and witnessed by {witness}; New reviewer note on {range}


### protocol-step

A lab-protocol step card rendering a numbered procedural step with action description, reagent list with volumes and concentrations, required equipment chips, timing controls, safety indicators, and completion confirmation checkbox.

**Visual brief:** A lab-notebook-inspired step card rendered as a d-surface with a thin left border in primary accent color. At the top-left corner, a StepNumber renders as a 40px circular badge with the number in bold text ('3') against a filled primary-color background. To its right, the StepAction contains the procedural instruction in text-base semibold followed by an optional description in body-muted text (e.g., 'Add lysis buffer and vortex for 30 seconds'). Below the header, the ReagentList renders as a bordered sub-panel with a d-annotation caption 'Reagents'. Each ReagentRow contains: reagent name (semibold), volume (mono-data, e.g., '50 µL'), concentration (mono-data muted, e.g., '10 mM'), and a small source-chip indicating which stock or lot (e.g., 'Lot #A2394'). Adjacent to ReagentList, EquipmentChips render as pill-shaped tags with tiny iconography (vortex mixer, centrifuge, pipette, heat block, incubator) showing the instruments required. SafetyBadges render as a horizontal row of color-coded pills with warning icons: amber for PPE requirements (gloves, eye protection), red for hazardous materials (flammable, corrosive, toxic), blue for specialized handling (fume hood, biosafety cabinet). For timed steps, the TimerDisplay sits prominently as a large digital-style countdown card (text-3xl mono-data) with start/pause/reset icon buttons. The timer background shifts from neutral to amber when <30s remain and pulses when time expires. A NotesBox sits below as a small textarea for scientist observations. At the bottom-right, the CompletionCheck is a large 24px checkbox labeled 'Mark complete' that, when checked, locks the card in a completed state (subtle green tint, strikethrough action text) and records a timestamp chip showing who completed it and when. Completed cards show a thin success-colored left border replacing the primary border.

**Components:** StepNumber, StepAction, ReagentList, ReagentRow, EquipmentChip, TimerDisplay, SafetyBadge, CompletionCheck, NotesBox

**Composition:**
```
ReagentRow = Row(d-row, data-reagent) > [ReagentName + VolumeCell + ConcentrationCell + LotChip]
StepHeader = Row(d-row) > [StepNumber + StepAction]
StepNumber = Badge(d-annotation, circular, data-step) > [NumberOrCheck]
ReagentList = Panel(d-annotation, bordered) > [ListCaption + ReagentRow[]]
SafetyBadge = Badge(d-annotation, data-safety-level) > [WarningIcon + HazardLabel]
ProtocolStep = Surface(d-surface, border-left-accent) > [StepHeader + ReagentList + EquipmentChip[] + SafetyBadge[] + TimerDisplay? + NotesBox? + CompletionCheck]
TimerDisplay = Card(d-surface, data-timer-state) > [DigitReadout + StartButton + PauseButton + ResetButton]
EquipmentChip = Chip(d-annotation, data-equipment) > [EquipmentIcon + EquipmentLabel]
CompletionCheck = Control(d-control, data-completion) > [Checkbox + CompletionLabel + TimestampChip?]
```

**Layout slots:**
  **Layout guidance:**
  - note: Protocol steps are safety-critical scientific procedures. Every reagent MUST show volume AND concentration. Every hazard MUST have a visible SafetyBadge. Completion MUST be timestamped.
  - container: d-surface card with colored left border
  - step_number: StepNumber uses d-annotation[data-step-number] as a 40px filled circle with bold number. Completed steps show checkmark instead of number. Primary color filled.
  - timer_states: TimerDisplay transitions through states: idle (neutral), running (primary), warning (<30s amber), expired (red pulse). Always shows mm:ss format with tabular-nums.
  - safety_badges: SafetyBadge colors MUST map consistently: amber=PPE, red=hazard, blue=specialized-handling. Each badge includes icon+label, never icon-only (unparseable without label).
  - reagent_format: ReagentRow uses mono-data tabular-nums for all volumes and concentrations. Format: 'Reagent Name | 50 µL | 10 mM | Lot #A2394'. Never abbreviate units.
  - completion_lock: CompletionCheck is single-direction (checking locks the step). Undoing completion requires supervisor password to maintain protocol integrity and audit trail.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| chip-hover | scale 1.03 + shadow 120ms ease-out |
| timer-tick | digit flip 80ms ease-in-out per second |
| check-toggle | checkbox fill + checkmark-draw 200ms ease-out |
| notes-expand | height auto + fade 200ms ease-out |
| timer-warning | background color pulse to amber 400ms ease-in-out when <30s |
| completion-lock | card background tint to success + border color shift 300ms ease-out |
| timer-pulse | expired timer border red-glow 800ms ease-in-out infinite |
| running-shimmer | timer digits subtle brightness pulse 2s ease-in-out infinite while running |

**Responsive:**
- **Mobile (<640px):** Step card expands to full-width. ReagentList collapses into expandable accordion. EquipmentChips wrap to multiple lines. TimerDisplay grows to hero size for visibility at the bench where scientists may be gloved and distant.
- **Tablet (640-1024px):** Full standard layout. ReagentList and EquipmentChips display side-by-side in two columns if space permits.

**Accessibility:**
- Role: `region`
- Keyboard: Space: toggle timer start/pause; R: reset timer; C: mark step complete; N: focus notes box; Tab: cycle through reagents and equipment chips
- Announcements: Step {number}: {action}; Required safety: {badges}; Timer {started|paused|completed} at {time}; Step {number} marked complete by {user}


---

## Pages

### notebook (/notebook)

Layout: page-tree → notebook-entry

### entry-detail (/notebook/:id)

Layout: notebook-entry → protocol-step
