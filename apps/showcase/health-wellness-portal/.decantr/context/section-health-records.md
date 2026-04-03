# Section: health-records

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** health-records
**Description:** Health records vault for browsing, viewing, and managing patient documents including lab results, imaging, and intake forms.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (records, record-detail, intake)
**Key patterns:** file-browser [complex], detail-header [moderate], intake-form-wizard [moderate]
**CSS classes:** `.health-nav`, `.health-card`, `.health-alert`
**Density:** comfortable
**Voice:** Caring, clear, and professional.

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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

records, documents, intake-forms

---

## Visual Direction

**Personality:** Calming, trust-building health portal with emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Vitals use color-coded status indicators always supplemented with text labels. Appointment booking is straightforward. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence. Lucide icons. WCAG AAA compliance throughout.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### file-browser

File and folder tree with preview panel, breadcrumb navigation, and multi-select for comprehensive file management.

**Visual brief:** A two-or-three-panel file management interface with clean lines and clear visual hierarchy. The leftmost panel is the FolderTree (240px wide, collapsible): a vertical list of folders with indentation levels (16px per level) connected by thin vertical and horizontal connector lines (1px solid var(--d-border-subtle), gray) forming an ASCII-tree-like structure. Folder icons are small (16px) filled folder shapes that rotate open (chevron turns 90deg) when expanded. The active/selected folder has an accent-tinted background row (var(--d-accent) at 10% opacity) with accent-colored text. Hovering any folder row shows a subtle background tint. The center panel is the FileList (flex: 1, fills remaining space). Above it spans the BreadcrumbBar: a horizontal path showing the current location as clickable segments separated by chevron-right icons (e.g., 'Home > Projects > Design > Assets'), each segment in text-sm with hover underline, the final segment in font-semibold. Below the breadcrumb is the ActionBar: a horizontal toolbar with icon+label buttons for Upload, New Folder, Delete, and a view-mode toggle (grid/list icons), plus a search input on the right side (240px wide, with a search icon prefix). The file list itself renders either as FileCards in grid mode (120px wide cards with a 64px icon/thumbnail centered above the filename) or FileRows in list mode (table rows with columns: checkbox, icon, name, size, type, date modified, each sortable by clicking the column header). File icons use distinct shapes and colors per type: documents are blue page icons, images are green landscape icons, code files are purple bracket icons, archives are amber box icons, PDFs are red document icons. Selected files have an accent-tinted background (var(--d-accent) at 8% opacity) with a visible checkbox checked state. Multi-select is supported via Shift+click (range) and Ctrl/Cmd+click (additive). The rightmost panel is the PreviewPanel (320px wide, slides in from the right when a file is selected). It shows: a large thumbnail or file-type icon at the top (200px max-height), the filename (text-base font-semibold), file metadata in a key-value list (Size, Type, Created, Modified, Owner — each as text-sm rows), and quick action buttons (Download, Share, Rename, Delete) as ghost-style icon+label buttons. The UploadDropzone activates on drag-over: a full-area overlay (position: absolute, inset: 0, z-index above all content) with a dashed border (3px dashed var(--d-accent), border-radius 12px), translucent accent-tinted background (var(--d-accent) at 8%), and a centered column with a large upload cloud icon (48px) and 'Drop files to upload' text (text-lg, text-accent). During file drag operations, a ghost badge follows the cursor showing the count of files being moved ('3 files') in a small accent pill.

**Components:** FolderTree, FileList, FileCard, FileRow, PreviewPanel, BreadcrumbBar, ActionBar, UploadDropzone

**Composition:**
```
FileRow = Row(d-interactive, flex-row) > [Checkbox + TypeIcon + Name + Size + Type + Modified]
FileCard = Card(d-interactive, flex-col, centered) > [Thumbnail|TypeIcon + FileName]
FileList = List(d-surface, scrollable) > FileRow*(d-interactive) | FileCard*(d-interactive)
MainArea = Area(flex-col) > [BreadcrumbBar + ActionBar + FileList(scrollable)]
ActionBar = Bar(d-control, flex-row) > [UploadButton + NewFolderButton + DeleteButton + ViewToggle + SearchInput]
FolderTree = Tree(d-surface, scrollable, resizable) > FolderEntry*(indented, connectors) > [Chevron + FolderIcon + Name]
FileBrowser = Browser(d-section, flex-row, full-height) > [FolderTree?(d-surface) + MainArea(flex-col, flex-1) + PreviewPanel?(d-surface)]
PreviewPanel = Panel(d-surface, slide-in, resizable) > [Preview(image|icon) + Filename + Metadata(key-value) + QuickActions]
BreadcrumbBar = Bar(d-annotation, flex-row) > Segment*(clickable, chevron-separated)
UploadDropzone = Overlay(d-interactive, dashed-border, centered) > [UploadIcon + DropText + BrowseLink]
```

**Layout slots:**
  **Layout guidance:**
  - note: The split preset uses a three-panel layout with resizable dividers. The folder tree and preview panels are collapsible. Panel widths should be adjustable via drag handles on the divider borders.
  - container: multi-panel
  - selection: Selected files must have a clearly visible accent background tint AND a checked checkbox. Multi-select interactions: click selects single, Shift+click selects range, Ctrl/Cmd+click toggles individual selection.
  - file_icons: File type icons MUST be visually distinct — do not use a generic file icon for everything. Use color-coded icons: blue for documents (.doc, .txt), green for images (.png, .jpg), purple for code (.js, .ts, .py), amber for archives (.zip, .tar), red for PDFs. This color coding is essential for quick visual scanning.
  - folder_tree: Connector lines use a combination of vertical lines (from parent to last child) and horizontal stubs (from vertical line to folder icon). Use CSS ::before pseudo-elements on each tree item. Indent each level by 16px.
  - preview_panel: The preview panel should only appear when a file (not folder) is selected. For image files, show an actual thumbnail. For other files, show a large file-type icon. The panel slides in from the right edge with a 250ms animation.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| row-hover | background-color transition 100ms ease-out |
| card-hover | translateY(-2px) + shadow increase, 150ms ease-out |
| folder-expand | chevron rotates 0→90deg, 200ms ease-out; children slide down with stagger 50ms each |
| checkbox-check | scale bounce 1.0→1.2→1.0, 200ms ease-out with checkmark draw animation |
| view-switch | Cross-fade between grid and list views, 200ms ease-in-out with content scale 0.98→1.0 |
| preview-open | Preview panel slides in from right edge, width 0→320px, 250ms ease-out with content fade-in 150ms delay |
| preview-close | Panel slides out to right, 200ms ease-in, content fades immediately |
| dropzone-activate | Overlay fades in from opacity 0→1 over 200ms with border dash animation |
| drag-ghost | File count badge follows cursor with 50ms position lerp for smooth trailing effect |
| upload-progress | Progress bar fills with smooth width transition, striped gradient animation moving left-to-right at 1s linear infinite |

**Responsive:**
- **Mobile (<640px):** Single-panel layout only. Folder tree becomes a full-screen overlay triggered by a hamburger/folder icon in the action bar. File list defaults to a simplified list view (name + icon + size only, no table columns). Preview panel becomes a bottom sheet on file tap. Breadcrumb bar shows only the current folder name with a back arrow. Action bar simplifies to essential actions behind an overflow menu. Upload dropzone is replaced by an upload button that opens the system file picker. Multi-select uses a long-press to enter selection mode with checkboxes.
- **Tablet (640-1024px):** Two-panel layout: folder tree (collapsible) + file list. Preview panel is a slide-over overlay from the right (50% width). Grid view shows 4-5 columns of file cards. Action bar shows primary actions with remaining in overflow. Drag-and-drop supported for file organization. Breadcrumb bar shows full path with horizontal scroll if needed.
- **Desktop (>1024px):** Full three-panel split layout. All panels visible simultaneously with resizable dividers (drag handles on borders). Folder tree 240px, file list flex, preview 320px. Full table columns in list view with sortable headers. Keyboard shortcuts fully enabled. Right-click context menus on files and folders. Drag-and-drop between folders with visual drop indicators. Search input with real-time filtering and type-ahead.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: move focus between folder tree, file list, and preview panel; Arrow Up/Down: navigate files in list, folders in tree; Arrow Left/Right: collapse/expand folders in tree, move between columns in list; Enter: open selected file or navigate into folder; Space: toggle file selection; Shift+Arrow: extend selection range; Ctrl/Cmd+A: select all files in current folder; Delete/Backspace: delete selected files (with confirmation); Ctrl/Cmd+C/V: copy/paste files; F2: rename selected file; Ctrl/Cmd+Shift+N: create new folder; Escape: clear selection or close preview panel
- Announcements: Navigated to folder {name}; {count} files selected; File {name} preview opened; Uploading {count} files — {percent}% complete; File {name} deleted; Sorted by {column} {ascending|descending}


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


### intake-form-wizard

Multi-step healthcare intake form with conditional branching, progress sidebar, auto-save, file upload, section review, and conversational single-question mode.

**Visual brief:** Two-panel layout. Left panel is a fixed ProgressSidebar (240px wide, surface background, full viewport height): a vertical list of section names (e.g. 'Personal Info', 'Medical History', 'Current Medications', 'Insurance', 'Consent') each with a status icon to the left. Completed sections show a green circle with white checkmark. The current section shows an accent-filled circle with a dot. Upcoming sections show an empty gray circle. A thin vertical line connects the circles. Section names are medium-weight text; the current section is bold with accent color. At the bottom of the sidebar, a small muted progress label shows '3 of 5 sections completed'. The right panel is the main form content area with a clean white card (max-width 600px, centered within the right panel, generous padding 32px). The card header shows the current section title in heading-3 style and a one-line description below in muted text. Below the header, QuestionGroup components render vertically: each question has a label (semibold, with a small red asterisk for required fields), a help text line below the label in muted text, and the appropriate input (text field, textarea, radio group, checkbox group, select dropdown, date picker, or FileUploadField). FileUploadField renders as a dashed-border drop zone with an upload icon, 'Drag file or click to browse' text, and accepted file types listed below. Inputs have comfortable vertical spacing (24px gap). Validation errors appear below the input in red text with an error icon. At the bottom of the card, a row with 'Back' secondary button on the left and 'Continue' primary button on the right. The SaveIndicator sits in the top-right corner of the card as a small pill: during save it shows a spinning circle icon + 'Saving...', after save it shows a green checkmark + 'Saved' that fades to subtle opacity after 3 seconds. ConditionalBranch logic hides or reveals question groups based on prior answers (e.g. selecting 'Yes' to allergies reveals an allergy detail text area). The conversational preset shows one large question centered on screen with a large input below it, no sidebar, and a 'Next' button or Enter-to-advance. Previous answers appear as small muted chips above the current question. The review preset lists all sections as collapsible panels with answer summaries in a two-column table (question label | answer) and 'Edit' links that jump back to that section.

**Components:** FormStep, QuestionGroup, ProgressSidebar, ReviewPanel, SaveIndicator, ConditionalBranch, FileUploadField

**Composition:**
```
FormStep = Card(d-surface, padding-lg) > [StepHeader > [Title(heading-3) + Description?(muted)] + QuestionGroup* + NavRow]
ReviewPanel = Container(d-surface, flex-col, gap-4) > ReviewSection(d-data, collapsible) > [SectionHeader > [SectionName + EditLink(d-interactive)] + AnswerTable(d-data, two-column) > AnswerRow > [QuestionLabel(muted) + AnswerValue]]
IntakeWizard = Container(d-section, grid: sidebar+main) > [ProgressSidebar(d-surface, sticky, flex-col) + FormStep(d-surface, card, centered, max-w-600) > QuestionGroup(d-data, flex-col, gap-6)* > [Question(d-data) > [Label(required?) + HelpText? + Input(d-interactive) + ValidationMsg?]] + NavigationRow > [BackButton?(d-interactive, secondary) + ContinueButton(d-interactive, primary)]] + ReviewPanel?(d-surface, conditional: final-step) + SaveIndicator(d-annotation, position: absolute, top-right)
QuestionGroup = Fieldset(d-data, flex-col, gap-6) > QuestionRow > [Label(semibold, required-asterisk?) + HelpText?(muted, text-sm) + Input(d-interactive, type-variant) + ConditionalBranch?(expandable) + ValidationError?(d-annotation, red)]
ProgressSidebar = Nav(d-surface, sticky, flex-col, gap-2) > StepItem(d-annotation, status: completed|current|upcoming) > [StatusCircle(color: status) + SectionLabel(weight: status)]
```

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| input-focus | border-color accent + shadow-ring-accent/20 150ms ease-out |
| button-press | scale(0.98) 100ms ease-in |
| step-circle-complete | scale(0.9→1.1→1) + color-fill green 300ms ease-out |
| step-forward | current-card translateX(0→-20px) + opacity 1→0 200ms ease-in, then new-card translateX(20px→0) + opacity 0→1 300ms ease-out |
| step-backward | current-card translateX(0→20px) + opacity 1→0 200ms ease-in, then new-card translateX(-20px→0) + opacity 0→1 300ms ease-out |
| conditional-hide | max-height auto→0 + opacity 1→0 250ms ease-in |
| conditional-reveal | max-height 0→auto + opacity 0→1 350ms ease-out |
| save-indicator-fade | opacity 1→0.4 1s ease-out after 3s delay |
| saving-spinner | rotate(0→360deg) 800ms linear infinite |
| required-asterisk-pulse | opacity 0.6→1→0.6 2s ease-in-out infinite on validation error |

**Responsive:**
- **Mobile (<640px):** Sidebar collapses to a horizontal progress bar at the top of the screen (thin bar showing percentage + current section name). Form card goes full-width with reduced padding (16px). Navigation buttons are full-width and stacked (Continue on top, Back below). File upload zone uses a simple button instead of a drag area. Conversational preset works naturally at full width. Review panel tables stack question above answer.
- **Tablet (640-1024px):** Sidebar remains visible at reduced width (200px). Form card fills remaining space. Standard padding and input sizes. Navigation buttons in a row. Comfortable touch targets on all inputs.
- **Desktop (>1024px):** Full two-panel layout with 240px sidebar and centered form card (max-width 600px). Generous spacing and padding. Hover states on all interactive elements. File upload supports drag-and-drop.

**Accessibility:**
- Role: `form`
- Keyboard: Tab: move between form fields within the current step; Enter: advance to the next step (when on Continue button) or submit answer (conversational mode); Shift+Tab: move backwards between fields; Arrow Up/Down: navigate radio and select options; Space: toggle checkboxes; Escape: cancel file upload or close date picker; Alt+Left: go to previous step; Alt+Right: go to next step
- Announcements: Step {current} of {total}: {section_name}; Required field: {label}; Validation error on {label}: {error_message}; Progress saved automatically; Conditional questions revealed: {count} additional questions; Review mode: check your answers before submitting; Form submitted successfully


---

## Pages

### records (/records)

Layout: file-browser

### record-detail (/records/:id)

Layout: detail-header

### intake (/intake)

Layout: intake-form-wizard
