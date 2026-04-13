# Decantr Content Expansion — Mega Spec

**Date:** 2026-04-03
**Scope:** 10 new blueprints, ~50 new archetypes, ~30 new patterns, 5 new themes, 2 new shells, 6 legacy blueprint upgrades
**Goal:** Expand the decantr-content library to cover the most desirable web builder verticals for 2026-2027+, with visually stunning, end-to-end layout descriptions.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [New Universal Patterns](#2-new-universal-patterns)
3. [New Themes](#3-new-themes)
4. [New Shells](#4-new-shells)
5. [Blueprint 1: AI Agent Builder / Studio](#5-blueprint-1-ai-agent-builder--studio)
6. [Blueprint 2: Multi-Tenant SaaS Platform](#6-blueprint-2-multi-tenant-saas-platform)
7. [Blueprint 3: Knowledge Base / Docs Platform](#7-blueprint-3-knowledge-base--docs-platform)
8. [Blueprint 4: AI Copilot / Embedded Assistant](#8-blueprint-4-ai-copilot--embedded-assistant)
9. [Blueprint 5: Observability / Monitoring Dashboard](#9-blueprint-5-observability--monitoring-dashboard)
10. [Blueprint 6: AI-Native CRM](#10-blueprint-6-ai-native-crm)
11. [Blueprint 7: Two-Sided Marketplace](#11-blueprint-7-two-sided-marketplace)
12. [Blueprint 8: Event / Community Platform](#12-blueprint-8-event--community-platform)
13. [Blueprint 9: Health / Wellness Portal](#13-blueprint-9-health--wellness-portal)
14. [Blueprint 10: Data Pipeline Studio](#14-blueprint-10-data-pipeline-studio)
15. [Legacy Blueprint Upgrades](#15-legacy-blueprint-upgrades)
16. [Content Summary Matrix](#16-content-summary-matrix)

---

## 1. Design Principles

Every new content item follows these rules:

- **Visually stunning by default.** Every pattern has a `visual_brief` that paints a vivid picture of the rendered output. No generic descriptions.
- **Composition algebra on every pattern with 3+ components.** Follows existing convention.
- **Full enrichment.** All patterns get: `visual_brief`, `responsive`, `motion`, `accessibility`, `io`. All blueprints get: `personality` (100+ chars), `voice`, full route maps.
- **Framework-agnostic.** Patterns describe structure, not code. No React/Vue/Svelte assumptions.
- **Realistic data flows.** Every pattern's `io` block describes what data it consumes and produces.
- **Theme-aware.** Each blueprint specifies an ideal theme and the personality carries visual opinions that materialize into decorator usage.
- **Role-based topology.** Every blueprint uses the 4-role system (public, gateway, primary, auxiliary) for clean zone transitions.

---

## 2. New Universal Patterns

These 30 patterns are primitives that unlock value across ALL blueprints. Each is described with full visual intent.

### 2.1 `kanban-board`
- **Category:** Project Management
- **Description:** Drag-and-drop column board with swimlanes, card previews, and column limits.
- **Presets:** `standard` (3-5 columns), `compact` (mini cards, dense), `grouped` (swimlane rows)
- **Components:** Board, Column, ColumnHeader, Card, CardPreview, DragOverlay, AddCardButton, ColumnLimit
- **Visual Brief:** Horizontally scrollable columns with subtle drop shadows. Cards are compact surface tiles with a left-edge color accent indicating status. Drag overlay uses a slight rotation (2deg) and elevated shadow to communicate "in flight." Column headers show count badges and optional WIP limits as a thin progress bar beneath the title. Empty columns show a dashed-border drop zone with muted instructional text.
- **Composition:** `Board(d-section) > Column*(d-surface) > [ColumnHeader + Card*(d-interactive) + AddCardButton]`
- **IO:** Consumes: `items[]`, `columns[]`, `swimlanes?[]`. Produces: `onDragEnd(itemId, fromCol, toCol)`, `onCardClick(itemId)`, `onAddCard(columnId)`
- **Motion:** Cards use spring physics on drag (stiffness: 300, damping: 25). Column reorder animates with layout shift (200ms ease-out). New cards enter with fade-up (150ms).
- **Responsive:** Desktop: horizontal scroll with all columns visible. Tablet: 2 columns visible, horizontal swipe. Mobile: single column stack with tab switcher.
- **Accessibility:** ARIA role=listbox on columns, role=option on cards. Keyboard: arrow keys move between cards, space to pick up, enter to drop. Screen reader announces column name and position.

### 2.2 `calendar-view`
- **Category:** Scheduling
- **Description:** Multi-mode calendar with day, week, and month views, event creation, and drag-to-reschedule.
- **Presets:** `month` (grid overview), `week` (time-slotted columns), `day` (single day detail), `agenda` (list view)
- **Components:** CalendarGrid, DayCell, WeekColumn, TimeSlot, EventChip, EventPopover, ViewSwitcher, NavigationBar, MiniCalendar
- **Visual Brief:** Clean grid with hairline borders. Today's date has a filled circle accent behind the number. Events are rounded pill chips color-coded by category with truncated titles. Overlapping events stack with a "+N more" overflow chip. The week view shows 15-minute time slots with alternating subtle background stripes. Event creation uses a click-and-drag gesture that renders a translucent preview chip. Month view cells show up to 3 events before collapsing to the overflow chip.
- **Composition:** `CalendarGrid(d-section) > [NavigationBar + ViewSwitcher] + DayCell*(d-surface) > EventChip*(d-interactive)`
- **IO:** Consumes: `events[]`, `currentDate`, `view`. Produces: `onEventClick(id)`, `onDateClick(date)`, `onEventDrag(id, newDate)`, `onViewChange(view)`
- **Motion:** View transitions use a horizontal slide (month ↔ week) or vertical expand (week ↔ day). Event chips animate position on drag with spring easing.
- **Responsive:** Desktop: full grid. Tablet: week view shows 5 days. Mobile: agenda list view default with swipe for day navigation.
- **Accessibility:** ARIA role=grid, cells are gridcell. Keyboard: arrow keys navigate days, enter opens event, escape closes popover.

### 2.3 `video-room`
- **Category:** Communication
- **Description:** Video conferencing layout with participant grid, screen sharing, and controls bar.
- **Presets:** `grid` (equal tiles), `speaker` (dominant speaker large + thumbnails), `screen-share` (shared screen dominant), `audio-only` (avatar circles)
- **Components:** VideoGrid, ParticipantTile, SpeakerView, ScreenShareView, ControlsBar, ParticipantList, ChatSidebar, ReactionOverlay
- **Visual Brief:** Dark background (always). Participant tiles are rounded rectangles with subtle borders that glow when speaking (accent color pulse). Name labels float at the bottom of each tile with a frosted glass background. Controls bar is centered at the bottom: circular buttons for mic, camera, screen share, reactions, leave (red). Speaker view places the active speaker in 70% of the space with a filmstrip of other participants along the bottom. Screen share uses the shared content as the dominant view with a floating self-view in the corner.
- **Composition:** `VideoGrid(d-section) > ParticipantTile*(d-surface) > [VideoStream + NameLabel + MuteIndicator] + ControlsBar(d-interactive)`
- **IO:** Consumes: `participants[]`, `localStream`, `remoteStreams[]`, `screenShare?`. Produces: `onToggleMic()`, `onToggleCamera()`, `onShareScreen()`, `onLeave()`, `onReaction(emoji)`
- **Motion:** Tile rearrangement uses layout animation (300ms spring). Speaking indicator pulses gently (opacity 0.5→1, 1s cycle). Reactions float up and fade out (2s).
- **Responsive:** Desktop: up to 4x4 grid. Tablet: 3x3 max. Mobile: speaker view only with swipe to switch.
- **Accessibility:** Focus management on controls bar. Screen reader announces speaker changes. Keyboard shortcuts for mute (M), camera (V), leave (L).

### 2.4 `file-browser`
- **Category:** Content Management
- **Description:** File and folder tree with preview panel, breadcrumb navigation, and multi-select.
- **Presets:** `tree` (sidebar tree), `grid` (icon grid), `list` (table list), `split` (tree + preview)
- **Components:** FolderTree, FileList, FileCard, FileRow, PreviewPanel, BreadcrumbBar, ActionBar, UploadDropzone
- **Visual Brief:** Two-panel layout: collapsible folder tree on the left (indented with connector lines), file list on the right. File icons use distinct shapes per type (document, image, code, archive) with subtle color coding. Selected files have an accent-tinted background. The preview panel slides in from the right showing file metadata, thumbnail, and quick actions. Drag-and-drop shows a ghost count badge ("3 files") following the cursor. Upload dropzone activates as a full-area dashed border overlay with a centered upload icon.
- **Composition:** `FileBrowser(d-section) > [BreadcrumbBar + ActionBar] + [FolderTree(d-surface) | FileList(d-surface)] + PreviewPanel?(d-surface)`
- **IO:** Consumes: `files[]`, `folders[]`, `currentPath`. Produces: `onNavigate(path)`, `onSelect(ids[])`, `onUpload(files[])`, `onDelete(ids[])`, `onRename(id, name)`
- **Motion:** Folder expand/collapse animates height (200ms). File list transitions use staggered fade (50ms per item). Preview panel slides in (250ms ease-out).
- **Responsive:** Desktop: split view. Tablet: toggle between tree and list. Mobile: list only with bottom sheet preview.
- **Accessibility:** Tree uses role=tree/treeitem. File list uses role=grid. Multi-select with shift+click, ctrl+click.

### 2.5 `notification-center`
- **Category:** System
- **Description:** Bell menu dropdown with notification list, categories, mark-all-read, and preferences link.
- **Presets:** `dropdown` (popover from bell), `page` (full-page notification center), `toast-stack` (corner toast notifications)
- **Components:** BellButton, NotificationList, NotificationItem, CategoryTabs, EmptyState, PreferencesLink, UnreadBadge
- **Visual Brief:** Bell icon with a small filled circle badge showing unread count (accent color, max "99+"). Dropdown is a 380px-wide popover with category tabs (All, Mentions, Updates, System) at the top. Each notification item has a left-edge dot for unread status, an icon representing the source, title, description (2 lines max, truncated), and a relative timestamp. Hover reveals a dismiss X button. The empty state shows a check-circle icon with "All caught up" text.
- **Composition:** `NotificationCenter(d-surface) > [CategoryTabs + NotificationList > NotificationItem*(d-interactive)] + EmptyState?`
- **IO:** Consumes: `notifications[]`, `unreadCount`. Produces: `onRead(id)`, `onReadAll()`, `onDismiss(id)`, `onPreferences()`
- **Motion:** Dropdown enters with scale-fade from bell origin (150ms). New notifications slide in from top (200ms). Dismiss animates height collapse (150ms).
- **Responsive:** Desktop: dropdown popover. Mobile: full-screen sheet.
- **Accessibility:** ARIA role=menu on list. Bell button has aria-label with count. Focus trap within dropdown.

### 2.6 `onboarding-wizard`
- **Category:** Onboarding
- **Description:** Multi-step guided flow with progress indicator, step validation, and completion celebration.
- **Presets:** `stepper` (numbered steps), `carousel` (slide-based), `checklist` (non-linear tasks)
- **Components:** StepIndicator, StepContent, NavigationButtons, ProgressBar, CompletionScreen, SkipButton
- **Visual Brief:** Horizontal step indicator at top with numbered circles connected by lines. Active step is filled accent, completed steps show checkmarks, upcoming steps are outlined. Content area below is generous (max-width 640px, centered). Navigation buttons are right-aligned: "Back" as ghost, "Continue" as primary filled. Final step shows a completion celebration with a subtle confetti animation and a large check circle. The progress bar beneath the steps shows overall completion percentage.
- **Composition:** `Wizard(d-section) > [StepIndicator + ProgressBar] + StepContent(d-surface) + NavigationButtons`
- **IO:** Consumes: `steps[]`, `currentStep`, `completedSteps[]`. Produces: `onNext()`, `onBack()`, `onSkip()`, `onComplete()`
- **Motion:** Step transitions slide horizontally (300ms ease-out). Step indicator circles pulse briefly on completion (scale 1→1.2→1). Completion confetti uses particle animation (2s).
- **Responsive:** Desktop: horizontal stepper. Mobile: vertical stepper with collapsed step labels (numbers only).
- **Accessibility:** ARIA role=tablist on steps, role=tabpanel on content. Step announcements for screen readers.

### 2.7 `drag-sort-list`
- **Category:** Interaction
- **Description:** Vertically reorderable list with drag handles, keyboard reordering, and position indicators.
- **Presets:** `standard` (full items), `compact` (minimal rows), `numbered` (with rank numbers)
- **Components:** SortableList, SortableItem, DragHandle, PositionIndicator, DropZone
- **Visual Brief:** Each item has a 6-dot drag handle on the left (grip icon). Active drag lifts the item with an elevated shadow and slight scale-up (1.02). The drop position shows a 2px accent-colored line between items. Items below shift down smoothly. The numbered preset shows rank numbers that update live during drag. Compact preset uses minimal 36px-height rows.
- **Composition:** `SortableList(d-section) > SortableItem*(d-interactive) > [DragHandle + Content + Actions?]`
- **IO:** Consumes: `items[]`. Produces: `onReorder(fromIndex, toIndex)`, `onRemove(id)`
- **Motion:** Drag uses spring physics. Other items animate position with 200ms ease. Drop settles with a micro-bounce.
- **Responsive:** Same on all sizes. Touch: long-press to drag.
- **Accessibility:** Keyboard: space to pick up, arrow keys to move, space to drop. Announcements: "Item X, position Y of Z. Grabbed. Moved to position N."

### 2.8 `map-view`
- **Category:** Geospatial
- **Description:** Interactive map with pins, clusters, search radius, and list/map toggle.
- **Presets:** `pins` (individual markers), `clusters` (grouped), `heatmap` (density), `route` (path with waypoints)
- **Components:** MapCanvas, Pin, ClusterBubble, InfoCard, SearchRadius, MapControls, ListToggle
- **Visual Brief:** Full-bleed map with floating controls. Pins are accent-colored circles with a subtle drop shadow, pulsing gently on hover. Clusters show a count number inside a larger circle, sized proportionally. Clicking a pin opens an info card that slides up from the bottom (mobile) or appears as a floating card (desktop). Search radius renders as a translucent accent-tinted circle. Map controls (zoom, compass, locate-me) are stacked vertically in the top-right corner as small pill buttons.
- **Composition:** `MapView(d-section) > [MapCanvas + Pin*(d-interactive) + ClusterBubble* + InfoCard?(d-surface) + MapControls]`
- **IO:** Consumes: `locations[]`, `center`, `zoom`, `searchRadius?`. Produces: `onPinClick(id)`, `onMapMove(bounds)`, `onSearch(query)`, `onRadiusChange(km)`
- **Motion:** Pins drop in with a bounce (300ms). Clusters morph size on zoom changes (200ms). Info card slides up (250ms spring).
- **Responsive:** Desktop: side list + map split. Mobile: full map with bottom sheet list.
- **Accessibility:** Map has role=application. Pins are buttons with aria-labels. List view is accessible alternative to map.

### 2.9 `comparison-table`
- **Category:** Decision Support
- **Description:** Feature comparison grid for products, plans, or options.
- **Presets:** `standard` (full grid), `highlight` (recommended column emphasized), `toggle` (collapsible category rows)
- **Components:** ComparisonGrid, ColumnHeader, FeatureRow, CategoryHeader, CheckIcon, CrossIcon, ValueCell, RecommendedBadge
- **Visual Brief:** Sticky column headers with product/plan names and prices. The recommended column has a subtle accent background tint and a "Recommended" badge above. Feature rows alternate between plain and light-tinted backgrounds for readability. Check marks are accent-colored circles with white checks. Cross marks are muted gray. Value cells show text or icons. Category headers are bold section dividers spanning the full width. The first column (feature names) is sticky on horizontal scroll.
- **Composition:** `ComparisonGrid(d-data) > [ColumnHeader*(d-header) + CategoryHeader* + FeatureRow*(d-row) > ValueCell*(d-cell)]`
- **IO:** Consumes: `columns[]`, `features[]`, `categories[]`, `recommended?`. Produces: `onSelect(columnId)`
- **Motion:** None — static layout. Hover highlights entire column (100ms).
- **Responsive:** Desktop: full grid. Tablet: horizontal scroll with sticky first column. Mobile: stacked cards per column with a selector.
- **Accessibility:** role=table, scope=col on headers, scope=row on feature names.

### 2.10 `sparkline-cell`
- **Category:** Data Visualization
- **Description:** Inline mini-chart for table cells showing trend over time.
- **Presets:** `line` (SVG path), `bar` (mini bar chart), `area` (filled area)
- **Components:** Sparkline, TrendIndicator, ValueLabel
- **Visual Brief:** A tiny (80×24px) SVG chart inline within a table cell. Line preset draws a smooth bezier path in accent color with a small filled circle at the last data point. Area preset fills below the line with a gradient (accent→transparent). A small trend arrow (▲/▼) and percentage change appear to the right of the chart. Positive trends use green, negative use red, neutral use muted text color.
- **Composition:** `SparklineCell > [Sparkline(svg) + TrendIndicator + ValueLabel]`
- **IO:** Consumes: `values[]`, `trend`. Produces: none (display only)
- **Motion:** Path draws from left to right on first render (500ms). Trend indicator fades in after path completes.
- **Responsive:** Fixed size, responsive parent handles overflow.
- **Accessibility:** aria-label with "Trend: up 12% over 7 days" or similar.

### 2.11 `breadcrumb-nav`
- **Category:** Navigation
- **Description:** Hierarchical path navigation with overflow handling.
- **Presets:** `standard` (text links), `icon` (with folder icons), `dropdown` (overflow as dropdown)
- **Components:** BreadcrumbList, BreadcrumbItem, Separator, OverflowMenu
- **Visual Brief:** Horizontal text links separated by chevron (›) icons. Current page is bold, non-interactive. Previous items are muted links that brighten on hover. When the path is too long, middle items collapse into a "..." overflow button that opens a dropdown with the hidden segments.
- **Composition:** `BreadcrumbList > BreadcrumbItem*(d-interactive) + Separator* + OverflowMenu?`
- **IO:** Consumes: `path[]`. Produces: `onNavigate(pathIndex)`
- **Motion:** Overflow dropdown enters with fade-scale (100ms).
- **Responsive:** Desktop: full path. Mobile: show first + last with overflow for middle.
- **Accessibility:** nav with aria-label="Breadcrumb". Current page has aria-current="page".

### 2.12 `stepper`
- **Category:** Progress
- **Description:** Step indicator for multi-step workflows.
- **Presets:** `horizontal` (inline dots/numbers), `vertical` (sidebar steps), `minimal` (dots only)
- **Components:** StepList, StepItem, StepConnector, StepLabel, StepIcon
- **Visual Brief:** Numbered circles connected by lines. Completed steps: filled accent circle with white checkmark, solid connector. Active step: filled accent circle with white number, pulsing ring. Upcoming: outlined circle with muted number, dashed connector. Labels appear below circles (horizontal) or beside them (vertical). Vertical preset works well as a left sidebar with step descriptions beneath labels.
- **Composition:** `StepList > StepItem*(d-interactive) > [StepIcon + StepLabel + StepConnector]`
- **IO:** Consumes: `steps[]`, `currentStep`, `completedSteps[]`. Produces: `onStepClick(index)`
- **Motion:** Completion animates the checkmark draw (200ms). Connector fills from left to right (300ms).
- **Responsive:** Horizontal collapses to minimal (dots only) on mobile. Vertical stays the same.
- **Accessibility:** role=list, aria-current="step" on active.

### 2.13 `toast-notification`
- **Category:** System
- **Description:** Transient notification toast with auto-dismiss and action buttons.
- **Presets:** `info`, `success`, `warning`, `error`, `action` (with button)
- **Components:** ToastContainer, Toast, ToastIcon, ToastTitle, ToastDescription, ToastAction, DismissButton, ProgressBar
- **Visual Brief:** Slides in from the top-right corner. Compact card (max-width 380px) with a left color stripe indicating severity (blue/green/amber/red). Icon on the left, title bold, description beneath in muted text. Action preset adds a small button on the right. Auto-dismiss progress bar is a thin line at the bottom that shrinks over the duration. Multiple toasts stack vertically with a slight overlap peek.
- **Composition:** `ToastContainer > Toast*(d-surface) > [ToastIcon + ToastTitle + ToastDescription + ToastAction? + DismissButton + ProgressBar]`
- **IO:** Consumes: `type`, `title`, `description`, `duration?`, `action?`. Produces: `onDismiss()`, `onAction()`
- **Motion:** Enter: slide in from right + fade (200ms spring). Exit: slide right + fade out (150ms). Stack repositions with layout animation.
- **Responsive:** Desktop: top-right corner. Mobile: full-width at top.
- **Accessibility:** role=status (info/success) or role=alert (warning/error). Auto-dismiss paused on hover/focus.

### 2.14 `skeleton-loader`
- **Category:** Loading
- **Description:** Animated placeholder mimicking content layout during loading.
- **Presets:** `card` (card with image + text), `table` (table rows), `list` (list items), `text` (paragraph lines), `profile` (avatar + name + bio)
- **Components:** SkeletonBlock, SkeletonCircle, SkeletonLine, SkeletonGroup
- **Visual Brief:** Rounded rectangles in a muted surface color with a shimmer animation sweeping left-to-right. The shimmer is a diagonal gradient (transparent → 10% lighter → transparent) that translates across the element. Shapes match the actual content dimensions: image placeholders are rectangles, avatars are circles, text lines vary in width (100%, 80%, 60%) to simulate natural text. No border, no shadow — just subtle colored blocks.
- **Composition:** `SkeletonGroup > [SkeletonBlock | SkeletonCircle | SkeletonLine]*`
- **IO:** Consumes: `variant`, `lines?`, `hasImage?`. Produces: none
- **Motion:** Shimmer animation: linear gradient slides 0→100% over 1.5s, infinite loop. Stagger delay between elements (100ms).
- **Responsive:** Adapts to container width. Line widths are percentage-based.
- **Accessibility:** aria-busy="true" on container. aria-hidden="true" on skeleton elements.

### 2.15 `emoji-reaction-bar`
- **Category:** Social
- **Description:** Reaction picker with counts and animated additions.
- **Presets:** `inline` (beneath content), `floating` (hover toolbar), `compact` (icon-only)
- **Components:** ReactionBar, ReactionChip, ReactionPicker, AddButton
- **Visual Brief:** Horizontal row of small pill chips, each showing an emoji + count. User's own reactions have an accent border. The "+" button opens a popover grid of available emojis (6 columns). Adding a reaction bounces the chip (scale 1→1.3→1). New reaction chips slide in from the right. Counts animate with a rolling number effect.
- **Composition:** `ReactionBar > ReactionChip*(d-interactive) + AddButton`
- **IO:** Consumes: `reactions[]`, `userReactions[]`. Produces: `onReact(emoji)`, `onUnreact(emoji)`
- **Motion:** Chip bounce on add (200ms spring). Count rolls (150ms). Picker enters with scale-fade (150ms).
- **Responsive:** Same on all sizes. Picker may use bottom sheet on mobile.
- **Accessibility:** Each chip is a toggle button with aria-pressed. Picker has role=grid with arrow key navigation.

### 2.16 `workflow-canvas`
- **Category:** Builder
- **Description:** Visual node-graph editor for business logic, ETL, or automation flows.
- **Presets:** `standard` (nodes + edges), `compact` (mini nodes), `readonly` (presentation mode)
- **Components:** Canvas, Node, NodePort, Edge, Minimap, Toolbar, PropertyPanel, NodePalette
- **Visual Brief:** Infinite pannable canvas with a subtle dot grid background. Nodes are rounded cards (160×80px min) with a colored top stripe indicating type (blue: trigger, green: action, yellow: condition, gray: transform). Input ports on the left, output ports on the right — small circles that glow on hover. Edges are smooth bezier curves following the port positions, with animated dashes flowing in the direction of data. Selected nodes have an accent border glow. The minimap is a small rectangle in the bottom-right showing a birds-eye view. Toolbar floats at the top with zoom controls, undo/redo, and a fit-to-view button. The node palette is a left sidebar with draggable node types grouped by category.
- **Composition:** `Canvas(d-section) > [Toolbar + NodePalette?(d-surface)] + Node*(d-interactive) > [NodeHeader + NodePort* + NodeBody?] + Edge* + Minimap`
- **IO:** Consumes: `nodes[]`, `edges[]`, `nodeTypes[]`. Produces: `onNodeAdd(type, position)`, `onNodeRemove(id)`, `onEdgeConnect(from, to)`, `onEdgeRemove(id)`, `onNodeMove(id, position)`, `onNodeSelect(id)`
- **Motion:** Edge flow animation: dashed stroke-dashoffset cycles (1s linear). Node placement uses drop-in with micro-bounce (200ms). Canvas pan is 1:1 with pointer.
- **Responsive:** Desktop only. Tablet: read-only mode. Mobile: not supported (show message).
- **Accessibility:** Keyboard: tab between nodes, arrow keys within connections. Screen reader describes node connections.

### 2.17 `prompt-playground`
- **Category:** AI Tools
- **Description:** Split-pane prompt editor with model selector, parameter controls, and response panel.
- **Presets:** `standard` (side by side), `stacked` (vertical), `comparison` (multiple models)
- **Components:** PromptEditor, ResponsePanel, ModelSelector, ParameterSliders, TokenCounter, HistoryList, SaveButton, ComparisonView
- **Visual Brief:** Left panel: monospace text editor with syntax highlighting for template variables ({{var}} in accent color). Right panel: rendered AI response with markdown formatting. Between them a "Run" button (accent filled, prominent). Top bar has model selector dropdown, temperature/max-tokens sliders with numeric inputs. Token counter shows input/output/total as a compact bar. The comparison preset shows 2-3 response panels side-by-side with a shared prompt editor above. History list is a collapsible sidebar showing saved prompts with timestamps.
- **Composition:** `Playground(d-section) > [TopBar > [ModelSelector + ParameterSliders + TokenCounter]] + [PromptEditor(d-surface) | ResponsePanel(d-surface)] + HistoryList?(d-surface)`
- **IO:** Consumes: `models[]`, `savedPrompts[]`. Produces: `onRun(prompt, model, params)`, `onSave(prompt)`, `onLoadHistory(id)`
- **Motion:** Response streams in token-by-token (typewriter). Run button shows a loading spinner during generation.
- **Responsive:** Desktop: side-by-side. Tablet/mobile: stacked with tab switcher.
- **Accessibility:** Editor uses role=textbox with aria-multiline. Response is aria-live=polite for streaming.

### 2.18 `eval-dashboard`
- **Category:** AI Tools
- **Description:** Model evaluation metrics grid with test case results and comparison.
- **Presets:** `overview` (aggregate metrics), `detail` (per-test breakdown), `comparison` (model vs model)
- **Components:** MetricCard, TestCaseTable, ScoreBar, DiffView, ModelComparisonGrid, ConfusionMatrix
- **Visual Brief:** Top row of metric cards showing accuracy, latency p50/p99, cost, and pass rate — each with a sparkline trend. Below is a test case table where each row is an eval case with input preview, expected output, actual output, score (color-coded green/yellow/red), and a diff toggle. The comparison preset shows two models side-by-side with highlighted differences in output. Scores use a horizontal bar that fills green (>80%), yellow (50-80%), or red (<50%).
- **Composition:** `EvalDashboard(d-section) > [MetricCard*(d-surface) > [Value + Sparkline]] + TestCaseTable(d-data) > [Row*(d-row) > [Input + Expected + Actual + ScoreBar + DiffToggle]]`
- **IO:** Consumes: `evalResults[]`, `metrics`, `models[]`. Produces: `onTestClick(id)`, `onCompare(model1, model2)`, `onRerun(testIds[])`
- **Motion:** Score bars animate width on load (300ms ease-out). Diff highlights pulse briefly (200ms).
- **Responsive:** Desktop: full grid. Mobile: metric cards scroll horizontally, table becomes card list.
- **Accessibility:** Data table with proper headers. Score colors supplemented with text labels.

### 2.19 `trace-waterfall`
- **Category:** Observability
- **Description:** Horizontal waterfall chart showing execution trace spans.
- **Presets:** `standard` (full trace), `compact` (collapsed spans), `flame` (flame chart style)
- **Components:** TraceContainer, SpanBar, SpanLabel, TimeAxis, SpanDetail, FilterBar
- **Visual Brief:** Vertical list of horizontal bars, each representing a span. Bars are positioned and sized relative to a time axis at the top. Nested spans indent and align beneath their parents. Colors indicate span type (blue: HTTP, green: DB, purple: AI, orange: cache, red: error). Hovering a span highlights it and dims others. Clicking expands a detail panel below with metadata, tags, and logs. Error spans have a red left border and a warning icon. The time axis shows millisecond markers with gridlines.
- **Composition:** `TraceContainer(d-section) > [FilterBar + TimeAxis] + SpanBar*(d-interactive) > [SpanLabel + Duration + StatusIcon] + SpanDetail?(d-surface)`
- **IO:** Consumes: `spans[]`, `rootSpanId`. Produces: `onSpanClick(id)`, `onFilter(type)`
- **Motion:** Spans animate width from 0 on load (stagger 30ms). Detail panel slides down (200ms).
- **Responsive:** Desktop: full waterfall. Mobile: simplified list with nested badges.
- **Accessibility:** Each span is a button with aria-label describing name and duration.

### 2.20 `service-map`
- **Category:** Observability
- **Description:** Topology graph showing service dependencies with health indicators.
- **Presets:** `graph` (force-directed), `hierarchy` (tree layout), `grid` (organized grid)
- **Components:** MapCanvas, ServiceNode, DependencyEdge, HealthIndicator, DetailPanel, Legend
- **Visual Brief:** Force-directed graph where each service is a rounded rectangle node with an icon, name, and a small health dot (green/yellow/red). Edges are curved lines with animated flow particles showing request direction. Thicker edges = more traffic. Hover on a node highlights its direct dependencies and fades others. The detail panel (right sidebar) shows latency, error rate, throughput for the selected service. Legend in the bottom-left explains health colors and edge thickness.
- **Composition:** `ServiceMap(d-section) > [MapCanvas > ServiceNode*(d-interactive) + DependencyEdge*] + DetailPanel?(d-surface) + Legend`
- **IO:** Consumes: `services[]`, `dependencies[]`, `metrics{}`. Produces: `onServiceClick(id)`, `onZoom(level)`
- **Motion:** Force simulation settles in 1s. Flow particles animate along edges continuously. Node health dot pulses on degraded/error.
- **Responsive:** Desktop: full graph. Mobile: list view with dependency counts.
- **Accessibility:** Fallback list view with service + dependency descriptions.

### 2.21 `alert-rule-builder`
- **Category:** Configuration
- **Description:** Visual condition builder for alerts, rules, or filters.
- **Presets:** `standard` (condition groups), `simple` (single condition), `advanced` (nested AND/OR tree)
- **Components:** RuleGroup, ConditionRow, MetricSelector, OperatorSelector, ValueInput, ThresholdSlider, AddConditionButton, TestButton
- **Visual Brief:** Card-based rule groups with indentation showing AND/OR logic. Each condition row has: metric dropdown, operator dropdown (>, <, =, contains), value input, and a remove button. Groups can be nested with AND/OR toggles as small pill buttons between conditions. The "Test" button at the bottom evaluates the rule against recent data and shows a pass/fail result. Threshold sliders show a mini-chart context with a draggable line.
- **Composition:** `RuleBuilder(d-section) > RuleGroup*(d-surface) > [LogicToggle + ConditionRow*(d-interactive) > [MetricSelector + OperatorSelector + ValueInput + RemoveButton] + AddConditionButton] + TestButton`
- **IO:** Consumes: `metrics[]`, `operators[]`, `existingRules?`. Produces: `onRuleChange(rule)`, `onTest(rule)`, `onSave(rule)`
- **Motion:** Adding conditions slides in (200ms). Nesting animates indent (150ms).
- **Responsive:** Desktop: full builder. Mobile: simplified single-condition mode.
- **Accessibility:** Each selector is a labeled combobox. Group nesting uses aria-level.

### 2.22 `relationship-graph`
- **Category:** Data Visualization
- **Description:** Network graph showing entity relationships (contacts, companies, deals).
- **Presets:** `network` (force-directed), `radial` (entity at center), `timeline` (relationships over time)
- **Components:** GraphCanvas, EntityNode, RelationshipEdge, DetailCard, SearchOverlay, FilterPanel
- **Visual Brief:** Force-directed network where entities are circular avatars (people) or rounded squares (companies) connected by labeled edges. Edge labels describe the relationship type (e.g., "reports to", "invested in"). Selecting an entity pulls it to center and fans out its connections. The radial preset places the focus entity at center with concentric rings for 1st, 2nd, and 3rd degree connections. Colors encode entity type. Edge thickness encodes relationship strength.
- **Composition:** `RelationshipGraph(d-section) > [SearchOverlay + FilterPanel?] + GraphCanvas > EntityNode*(d-interactive) + RelationshipEdge*`
- **IO:** Consumes: `entities[]`, `relationships[]`, `focusEntity?`. Produces: `onEntityClick(id)`, `onRelationshipClick(id)`, `onSearch(query)`
- **Motion:** Force simulation settles in 800ms. Focus change animates layout transition (500ms spring). Hover shows edge labels with fade-in.
- **Responsive:** Desktop: interactive graph. Mobile: list with relationship cards.
- **Accessibility:** Accessible list alternative. Graph canvas has role=img with aria-label describing key relationships.

### 2.23 `deal-pipeline-board`
- **Category:** CRM
- **Description:** Sales pipeline Kanban board specialized for deals with value aggregation.
- **Presets:** `standard` (cards with amounts), `compact` (one-line per deal), `forecast` (probability-weighted)
- **Components:** PipelineBoard, StageColumn, DealCard, StageHeader, DealAmount, ProbabilityIndicator, WonLostBanner
- **Visual Brief:** Horizontal Kanban columns representing stages (Lead → Qualified → Proposal → Negotiation → Won/Lost). Column headers show deal count and total value with a dollar-sign icon. Deal cards are compact: company name bold, contact name muted, amount prominent. A thin progress bar on each card shows probability to close. Won column has a green tint. Lost column has a red tint and cards are visually dimmed. Column totals use weighted amounts in the forecast preset.
- **Composition:** `PipelineBoard(d-section) > StageColumn*(d-surface) > [StageHeader > [StageName + DealCount + TotalValue]] + DealCard*(d-interactive) > [CompanyName + ContactName + DealAmount + ProbabilityIndicator]`
- **IO:** Consumes: `deals[]`, `stages[]`. Produces: `onDealMove(id, fromStage, toStage)`, `onDealClick(id)`, `onDealCreate(stageId)`
- **Motion:** Drag physics same as kanban-board. Amount counters use rolling number animation on stage change.
- **Responsive:** Same as kanban-board.
- **Accessibility:** Same as kanban-board, plus value announcements.

### 2.24 `api-explorer`
- **Category:** Developer
- **Description:** Interactive API documentation with try-it-out request builder.
- **Presets:** `standard` (method list + detail), `grouped` (by resource), `minimal` (compact reference)
- **Components:** EndpointList, EndpointDetail, RequestBuilder, ResponseViewer, AuthConfig, ParameterTable, CodeSnippet
- **Visual Brief:** Left sidebar lists endpoints grouped by resource, each showing the HTTP method as a colored badge (GET=green, POST=blue, PUT=orange, DELETE=red) and the path. Selecting an endpoint shows the detail panel: description, parameter table (name, type, required badge, description), request builder with editable JSON body, and auth config dropdown. The "Send" button fires the request and shows the response in a formatted viewer with status code badge, headers toggle, and syntax-highlighted JSON body. Code snippet tabs show the request in curl, JavaScript, Python.
- **Composition:** `APIExplorer(d-section) > [EndpointList(d-surface) > EndpointItem*(d-interactive)] + EndpointDetail(d-surface) > [Description + ParameterTable(d-data) + RequestBuilder + ResponseViewer + CodeSnippet]`
- **IO:** Consumes: `endpoints[]`, `authConfig`. Produces: `onSend(endpoint, params, body)`, `onEndpointSelect(id)`
- **Motion:** Response viewer slides in (200ms). Status code badge color fades in.
- **Responsive:** Desktop: sidebar + detail. Mobile: list → detail navigation.
- **Accessibility:** Method badges have aria-labels. Parameter table uses proper headers.

### 2.25 `webhook-debugger`
- **Category:** Developer
- **Description:** Webhook delivery log with payload inspection and retry.
- **Presets:** `standard` (log + detail), `compact` (table only), `live` (streaming log)
- **Components:** DeliveryLog, DeliveryRow, PayloadViewer, HeadersTable, RetryButton, StatusTimeline, EndpointFilter
- **Visual Brief:** Table listing webhook deliveries with columns: timestamp, endpoint, event type, status badge (delivered=green, failed=red, pending=yellow), response time, and a retry button. Clicking a row expands an inline detail panel showing: request headers, request body (syntax-highlighted JSON), response status, response body, and a delivery timeline (sent → received → processed with timestamps). Failed deliveries have a red-tinted background row. The live preset auto-scrolls as new deliveries arrive with a subtle slide-in animation.
- **Composition:** `WebhookDebugger(d-section) > [EndpointFilter + DeliveryLog(d-data) > DeliveryRow*(d-row) > [Timestamp + Endpoint + EventType + StatusBadge + ResponseTime + RetryButton]] + DeliveryDetail?(d-surface) > [PayloadViewer + HeadersTable + StatusTimeline]`
- **IO:** Consumes: `deliveries[]`, `endpoints[]`. Produces: `onRetry(deliveryId)`, `onFilter(endpoint, status)`, `onInspect(deliveryId)`
- **Motion:** Live mode: new rows slide in from top (200ms). Detail panel slides down (200ms).
- **Responsive:** Desktop: full table. Mobile: card list with expandable details.
- **Accessibility:** Table with sortable column headers. Status colors supplemented with text.

### 2.26 `usage-meter`
- **Category:** Billing
- **Description:** Quota and usage visualization with thresholds and upgrade prompts.
- **Presets:** `bar` (horizontal bar), `radial` (circular gauge), `breakdown` (stacked categories)
- **Components:** UsageBar, UsageGauge, ThresholdMarker, UpgradePrompt, UsageBreakdown, PeriodSelector
- **Visual Brief:** Horizontal bar showing current usage as a filled portion. Under 70%: accent color. 70-90%: yellow/amber. 90%+: red with a pulsing glow. Threshold markers appear as small triangles at key points (limit, soft cap). The percentage and absolute values appear to the right of the bar. The radial preset uses a circular gauge with the same color logic. When usage exceeds 80%, an upgrade prompt card appears below with plan comparison. The breakdown preset shows stacked segments with a legend.
- **Composition:** `UsageMeter(d-surface) > [PeriodSelector + UsageBar(d-data) > [FilledBar + ThresholdMarker* + ValueLabel]] + UpgradePrompt?(d-interactive)`
- **IO:** Consumes: `current`, `limit`, `thresholds[]`, `breakdown?[]`, `period`. Produces: `onUpgrade()`, `onPeriodChange(period)`
- **Motion:** Bar fills on load (500ms ease-out). Threshold pulse when exceeded.
- **Responsive:** Same on all sizes. Radial scales down proportionally.
- **Accessibility:** Progress bar uses role=progressbar with aria-valuenow/min/max.

### 2.27 `audit-trail`
- **Category:** Compliance
- **Description:** Chronological audit log with filtering, search, and export.
- **Presets:** `standard` (full log), `compact` (one-line entries), `grouped` (by entity)
- **Components:** AuditLog, AuditEntry, ActorAvatar, ActionBadge, EntityLink, DiffToggle, FilterBar, ExportButton
- **Visual Brief:** Vertical timeline with entries showing: actor avatar (small circle), actor name, action verb badge (Created=blue, Updated=yellow, Deleted=red, Accessed=gray), entity type and name as a link, timestamp. Expanding an entry reveals the diff (before/after as a two-column comparison). Filter bar at top lets you filter by actor, action type, entity type, and date range. Export button generates CSV.
- **Composition:** `AuditTrail(d-section) > [FilterBar + ExportButton] + AuditLog > AuditEntry*(d-interactive) > [ActorAvatar + ActorName + ActionBadge + EntityLink + Timestamp + DiffToggle?]`
- **IO:** Consumes: `entries[]`, `actors[]`, `actionTypes[]`. Produces: `onFilter(filters)`, `onEntryClick(id)`, `onExport(format)`
- **Motion:** Entries fade in on scroll (stagger 50ms). Diff panel slides down (200ms).
- **Responsive:** Desktop: full timeline. Mobile: compact one-line entries.
- **Accessibility:** Timeline uses role=feed. Each entry is an article. Action badge colors have text labels.

### 2.28 `booking-calendar`
- **Category:** Scheduling
- **Description:** Availability-aware booking calendar with time slot selection.
- **Presets:** `week-view` (available slots in week), `day-view` (hourly slots), `provider-select` (choose provider first)
- **Components:** AvailabilityGrid, TimeSlot, ProviderSelector, BookingConfirmation, DatePicker, TimezoneSelector
- **Visual Brief:** Calendar grid showing available time slots as selectable chips. Available slots are outlined accent buttons. Unavailable slots are grayed out and non-interactive. Selected slot fills with accent color. Provider selector (if multiple) shows avatar + name cards at the top. After selecting a slot, a confirmation card slides up showing provider, date, time, duration, and a "Confirm" button. Timezone selector is a small dropdown in the corner.
- **Composition:** `BookingCalendar(d-section) > [ProviderSelector? + DatePicker + TimezoneSelector] + AvailabilityGrid(d-surface) > TimeSlot*(d-interactive) + BookingConfirmation?(d-surface)`
- **IO:** Consumes: `availability[]`, `providers?[]`, `timezone`. Produces: `onSlotSelect(slot)`, `onConfirm(booking)`, `onProviderChange(id)`, `onTimezoneChange(tz)`
- **Motion:** Slot selection scales up briefly (150ms). Confirmation slides up (250ms spring).
- **Responsive:** Desktop: week view. Mobile: day view with date swipe.
- **Accessibility:** Grid uses role=grid. Slots are buttons with aria-label including date, time, and provider.

### 2.29 `intake-form-wizard`
- **Category:** Healthcare/Forms
- **Description:** Multi-step form with conditional branching, progress saving, and section review.
- **Presets:** `standard` (step-by-step), `conversational` (one question at a time), `review` (summary before submit)
- **Components:** FormStep, QuestionGroup, ProgressSidebar, ReviewPanel, SaveIndicator, ConditionalBranch, FileUploadField
- **Visual Brief:** Left sidebar shows progress through form sections (checked, current, upcoming) with section names. Main content area presents one question group at a time within a clean centered card (max-width 600px). Questions use generous vertical spacing. Required fields have a small red asterisk. The auto-save indicator shows a small check icon with "Saved" text in the corner. The conversational preset shows one question at a time with a large input field and a "Continue" button. Review preset shows all answers in a summary table with "Edit" links per section.
- **Composition:** `IntakeWizard(d-section) > [ProgressSidebar(d-surface) + FormStep(d-surface) > QuestionGroup* > [Question + Input + Validation]] + ReviewPanel?(d-surface) + SaveIndicator`
- **IO:** Consumes: `formSchema`, `savedAnswers?`, `conditionalRules[]`. Produces: `onStepComplete(step, answers)`, `onSave(answers)`, `onSubmit(allAnswers)`
- **Motion:** Step transitions slide horizontally (300ms). Save indicator fades in/out (200ms). Validation errors shake input (200ms).
- **Responsive:** Desktop: sidebar + form. Mobile: stepper at top + full-width form.
- **Accessibility:** Each question has label + description. Error messages linked with aria-describedby. Progress announced on step change.

### 2.30 `data-source-connector`
- **Category:** Integration
- **Description:** Cards for connecting to external data sources with status and sync controls.
- **Presets:** `catalog` (available sources grid), `connected` (active connections), `setup` (configuration form)
- **Components:** SourceCard, SourceIcon, ConnectionStatus, SyncButton, ConfigForm, TestConnectionButton, SourceCatalog
- **Visual Brief:** Grid of cards, each showing a recognizable source icon (PostgreSQL elephant, Stripe logo, etc.), source name, and connection status badge. Connected sources show a green dot and last sync time. Disconnected sources are slightly dimmed. The setup flow slides open a panel with connection fields (host, port, credentials) and a "Test Connection" button that shows a spinner → success checkmark or error message. Sync button shows a rotating arrows icon during active sync.
- **Composition:** `DataSourceConnector(d-section) > SourceCatalog > SourceCard*(d-interactive) > [SourceIcon + SourceName + ConnectionStatus + SyncButton?] + ConfigForm?(d-surface) > [Fields + TestConnectionButton]`
- **IO:** Consumes: `sources[]`, `connections[]`. Produces: `onConnect(sourceId, config)`, `onDisconnect(sourceId)`, `onSync(sourceId)`, `onTest(sourceId, config)`
- **Motion:** Test connection: spinner → checkmark animation (300ms). Sync: rotating arrows. Card hover lifts slightly.
- **Responsive:** Desktop: 3-column grid. Tablet: 2 columns. Mobile: single column.
- **Accessibility:** Cards are buttons with aria-label including source name and status.

---

## 3. New Themes

### 3.1 `healthcare`
- **Description:** Clean, accessible, trust-signaling medical theme.
- **Seed Colors:** Primary: #0EA5E9 (calming blue), Secondary: #14B8A6 (teal for wellness), Accent: #8B5CF6 (subtle purple for premium)
- **Palette:** Warm white backgrounds (#FAFBFC), soft card surfaces (#FFFFFF with subtle shadow), text in dark navy (#1E293B). Status colors: healthy green (#22C55E), warning amber (#F59E0B), critical red (#EF4444), info blue (#3B82F6).
- **Decorators:** `health-card` (white card with 1px border, subtle shadow, large radius), `health-metric` (large number with status-colored indicator dot), `health-badge` (rounded pill with tinted background), `health-alert` (left-border card with severity color stripe)
- **Shape:** rounded (12px base)
- **Motion:** smooth, subtle — never jarring. Duration scale 1.0. Reduced motion priority.
- **Typography:** Scale comfortable (1.25). Heading weight 600 (not too heavy). Body weight 400. Generous line height (1.7 for body text).
- **CVD Support:** Yes — all status colors have pattern/icon alternatives.
- **WCAG:** AAA target. High-contrast mode available.
- **Domain Tokens:** `--color-vitals-normal`, `--color-vitals-elevated`, `--color-vitals-critical`, `--color-appointment-confirmed`, `--color-appointment-pending`, `--color-appointment-cancelled`
- **Shell Preferences:** sidebar-main (patient portal), centered (booking), top-nav-footer (marketing)

### 3.2 `fintech`
- **Description:** Data-dense, dark-mode financial terminal with precision aesthetics.
- **Seed Colors:** Primary: #6366F1 (indigo), Secondary: #818CF8 (light indigo), Accent: #22D3EE (cyan data highlight)
- **Palette:** Deep dark backgrounds (#0C0E14, #12141C), surface cards (#1A1D28), border (#2A2D3A). Gain green (#00E676), loss red (#FF1744), neutral gray (#94A3B8). Data accent cyan (#22D3EE).
- **Decorators:** `fin-card` (dark card with 1px border, no shadow, sharp bottom corners), `fin-metric` (large monospace number with micro sparkline), `fin-table` (dense table with alternating row tints), `fin-ticker` (horizontal scrolling ticker with up/down arrows), `fin-alert` (top-border card with severity accent)
- **Shape:** sharp (4px base — trust through precision)
- **Motion:** minimal/instant — data changes must feel real-time, not animated. Duration scale 0.5.
- **Typography:** Scale tight (1.15). Monospace for all numbers. System sans for labels. Body weight 400. Data weight 500.
- **Domain Tokens:** `--color-gain`, `--color-loss`, `--color-neutral`, `--color-bid`, `--color-ask`, `--color-volume`
- **Shell Preferences:** sidebar-main (trading dashboard), sidebar-aside (multi-panel analytics), top-nav-main (marketing)

### 3.3 `neo-tokyo`
- **Description:** Anime/manga-inspired with Japanese typography sensibilities, vibrant gradients, and playful energy.
- **Seed Colors:** Primary: #FF6B9D (sakura pink), Secondary: #C084FC (lavender), Accent: #38BDF8 (sky blue)
- **Palette:** Dark mode: deep midnight (#0F0B1E), surface (#1A1230), purple-tinted borders (#3B2D5E). Light mode: warm cream (#FFF8F0), soft lavender surface (#F5F0FF). Gradient accents everywhere — pink-to-purple, blue-to-cyan.
- **Decorators:** `neo-card` (rounded card with gradient border, inner glow), `neo-badge` (pill with gradient fill, bold text), `neo-hero` (full-width with angled clip-path and gradient background), `neo-button` (rounded pill with gradient, hover scale-up), `neo-panel` (card with top-accent gradient stripe)
- **Shape:** pill (999px for badges/buttons, 16px for cards — very rounded)
- **Motion:** bouncy and energetic. Spring animations with overshoot. Duration scale 1.2. Entrance animations are playful (pop-in, slide-up with bounce).
- **Typography:** Scale expressive (1.333). Bold headings (800 weight). Mix of system sans and rounded display fonts. Body weight 400.
- **Effects:** Gradient borders, inner glow, subtle particle effects for hero sections. No glassmorphism — this is opaque and bold.
- **Shell Preferences:** top-nav-footer (marketing), sidebar-main (dashboard), centered (auth)

### 3.4 `earth`
- **Description:** Organic, sustainability-focused with natural textures and muted earth tones.
- **Seed Colors:** Primary: #65A30D (forest green), Secondary: #A16207 (warm amber), Accent: #0D9488 (teal)
- **Palette:** Light mode: warm white (#FEFCE8 warm cream), surface (#FFF7ED), text (#422006 warm brown). Dark mode: deep forest (#0C1A0C), surface (#1A2E1A), text (#FEF3C7 warm yellow). Borders are subtle warm tones.
- **Decorators:** `earth-card` (card with subtle paper texture bg, warm shadow), `earth-badge` (rounded pill with muted earth tones), `earth-hero` (full-bleed with organic shape dividers instead of straight lines), `earth-section` (with a subtle grain overlay texture), `earth-metric` (large number with a leaf or growth icon)
- **Shape:** rounded (10px — organic but not pill-shaped)
- **Motion:** smooth and slow — feels like nature. Duration scale 1.3. Ease-out curves. Scroll reveals with gentle fade-up.
- **Typography:** Scale comfortable (1.25). Serif headings (literary, warm). Sans body (clean legibility). Heading weight 600. Body weight 400. Generous line height (1.75).
- **Effects:** Subtle grain texture overlay (2% opacity). Organic divider shapes (SVG wave/curve between sections). No sharp geometric effects.
- **Shell Preferences:** top-nav-footer (marketing), sidebar-main (dashboard), full-bleed (portfolio/showcase)

### 3.5 `government`
- **Description:** Accessible, conservative, high-contrast — meets Section 508 and WCAG AAA.
- **Seed Colors:** Primary: #1D4ED8 (strong blue — trust), Secondary: #4338CA (deep indigo), Accent: #B91C1C (alert red — used sparingly)
- **Palette:** Pure white background (#FFFFFF), light gray surface (#F8FAFC), strong dark text (#111827). High-contrast borders (#D1D5DB). Status: success green (#166534), warning amber (#92400E), error red (#991B1B), info blue (#1E40AF).
- **Decorators:** `gov-card` (white card with 1px solid border, no shadow, square corners), `gov-badge` (rectangular badge with solid background), `gov-alert` (full-width bar with icon + text, high contrast), `gov-table` (high-contrast table with clear borders and large text), `gov-form` (generous spacing, large input fields, visible labels)
- **Shape:** sharp (2px base — institutional precision)
- **Motion:** minimal to none. Duration scale 0.3. Respect prefers-reduced-motion. No decorative animation.
- **Typography:** Scale large (1.25 base, large inputs). System sans for everything (maximum compatibility). Heading weight 700. Body weight 400. Line height 1.6. Minimum body text 16px.
- **WCAG:** AAA mandatory. 7:1 contrast ratio minimum for text. 4.5:1 for large text. Focus indicators: 3px solid outline with offset.
- **CVD Support:** Full — no information conveyed by color alone. Icons and text labels supplement every status.
- **Shell Preferences:** top-nav-footer (public), sidebar-main (portal), centered (forms)

---

## 4. New Shells

### 4.1 `copilot-overlay`
- **Description:** Main content area with a collapsible AI copilot side panel.
- **Regions:** header, body, copilot
- **Layout:** The copilot panel is a right-side drawer (360px) that overlays or pushes the body content. When collapsed, only a small floating pill button ("Ask AI") is visible.
- **Internal Layout:**
  - header: height 56px, full width, padding 0 16px, border-bottom
  - body: flex-1, overflow-y auto, padding 24px
  - copilot: width 360px (open) / 0px (closed), height 100vh, position fixed right, overflow-y auto, padding 16px, border-left, background surface-raised
- **Guidance:** The copilot panel should contain the AI chat interface (conversation list, input). The body contains the main application. The copilot can reference/annotate content in the body via highlighting. The toggle button should be always accessible via keyboard shortcut (Cmd+K or similar).
- **Responsive:** Desktop: side panel overlay. Mobile: full-screen bottom sheet.

### 4.2 `three-column-browser`
- **Description:** Three-column browse layout: navigation tree, item list, and detail preview.
- **Regions:** nav, list, detail, header
- **Layout:** Classic mail/file-browser pattern. Left nav tree (220px), middle item list (320px), right detail preview (flex-1).
- **Internal Layout:**
  - header: height 52px, full width spanning all columns, padding 0 16px, border-bottom
  - nav: width 220px, min-width 180px, overflow-y auto, padding 8px, border-right
  - list: width 320px, min-width 240px, overflow-y auto, border-right
  - detail: flex-1, overflow-y auto, padding 24px
- **Guidance:** Nav holds the tree/folder structure. List shows items for the selected folder/category. Detail shows the full content of the selected item. All three columns scroll independently. List items highlight on selection.
- **Responsive:** Desktop: three columns. Tablet: nav collapses to rail. Mobile: single column with back navigation.

---

## 5. Blueprint 1: AI Agent Builder / Studio

### Identity
- **Name:** AI Agent Studio
- **ID:** `agent-studio`
- **Theme:** `carbon-neon`
- **Tags:** ai, agents, studio, builder, tools, prompts, eval, traces, 2026

### Personality
"Precision engineering studio for AI agents. Carbon-dark surfaces with neon cyan highlights on active elements. Monospace typography for all prompts, traces, and model outputs. Split-pane interfaces reminiscent of an IDE — left tree, center editor, right preview. Think VS Code meets Langsmith. Interactions are immediate and keyboard-first. Every surface exists to reduce iteration cycles: write a prompt, test it, see traces, fix it. Lucide icons. No decoration — every pixel serves the builder."

### Voice
- **Tone:** Technical and precise. Speaks to AI engineers and prompt designers. Shows, doesn't tell.
- **CTA verbs:** Build, Test, Deploy, Trace, Iterate, Compare
- **Avoid:** Easy, Simple, Magic, Just, Getting Started
- **Empty states:** Show a code-like scaffold with placeholder variables: `// Your first agent starts here`
- **Errors:** Stack-trace style with step reference, model, token count, and latency
- **Loading:** Terminal cursor blink with progress percentage

### Archetypes (6 new)

**5.1 `agent-studio` (primary, shell: sidebar-aside)**
- **Role:** primary
- **Description:** Core agent building workspace with prompt editor, tool configuration, and live preview.
- **Pages:**
  - `agents` (route: /agents) — Agent list with create button. Layout: `card-grid(content)` with agent cards showing name, model, tool count, last test result, deploy status.
  - `agent-detail` (route: /agents/:id) — Three-panel: left tool tree, center prompt editor (monospace, syntax-highlighted template vars), right live preview panel showing last response. Layout: `split-pane` + `prompt-playground(standard)`
  - `agent-config` (route: /agents/:id/config) — Agent configuration: model selector, temperature, max tokens, system prompt, stop sequences. Layout: `form-sections`
  - `agent-tools` (route: /agents/:id/tools) — Tool management: add/remove/configure tools with schema validation. Layout: `tool-list` + `form-sections`
- **Features:** agents, tools, prompts, real-time-preview, keyboard-shortcuts

**5.2 `prompt-library` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Version-controlled prompt library with diff view and A/B testing.
- **Pages:**
  - `prompts` (route: /prompts) — Prompt list with search, tags, and version count. Layout: `data-table(standard)` with columns: name, tags, versions, last modified, success rate.
  - `prompt-detail` (route: /prompts/:id) — Prompt editor with version history sidebar. Layout: `prompt-playground(standard)` + `version-history`
  - `prompt-compare` (route: /prompts/:id/compare) — Side-by-side diff of two prompt versions with test results. Layout: `diff-view(split)` + `eval-dashboard(comparison)`
- **Features:** versioning, diff, search, tags

**5.3 `tool-registry` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Registry of available tools with schema definitions and usage analytics.
- **Pages:**
  - `tools` (route: /tools) — Tool catalog grid. Layout: `card-grid(icon)` with tool cards showing icon, name, description, usage count.
  - `tool-detail` (route: /tools/:id) — Tool detail with JSON schema editor, test playground, usage chart. Layout: `json-viewer` + `prompt-playground(stacked)` + `sparkline-cell`
- **Features:** tools, schemas, analytics

**5.4 `eval-suite` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Test suite management with batch evaluation and regression detection.
- **Pages:**
  - `evals` (route: /evals) — Eval suite list with last run status. Layout: `data-table(standard)` with run status badges and sparkline trends.
  - `eval-detail` (route: /evals/:id) — Eval results with per-test-case breakdown. Layout: `eval-dashboard(detail)`
  - `eval-compare` (route: /evals/:id/compare) — Model-vs-model comparison. Layout: `eval-dashboard(comparison)`
  - `eval-create` (route: /evals/create) — Create eval suite with test case editor. Layout: `form-sections` + `data-table(compact)`
- **Features:** evaluation, comparison, regression-detection

**5.5 `trace-viewer` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Agent execution trace viewer with step-by-step replay.
- **Pages:**
  - `traces` (route: /traces) — Trace list with filters (agent, status, duration, model). Layout: `data-table(standard)` with columns: trace ID, agent, duration, steps, status, cost.
  - `trace-detail` (route: /traces/:id) — Full trace waterfall with span details. Layout: `trace-waterfall(standard)` + `agent-timeline(live)`
- **Features:** traces, observability, replay

**5.6 `marketing-ai-studio` (public, shell: top-nav-footer)**
- **Role:** public
- **Description:** Marketing landing for the agent studio.
- **Pages:**
  - `home` (route: /) — Landing with hero, features, pricing. Layout: `hero(vision)` + `features` + `how-it-works` + `pricing` + `cta-section`
- **Features:** marketing, seo

### Blueprint Compose
```json
{
  "compose": [
    { "id": "agent-studio" },
    { "id": "prompt-library" },
    { "id": "tool-registry" },
    { "id": "eval-suite" },
    { "id": "trace-viewer" },
    { "id": "marketing-ai-studio" },
    { "id": "auth-full" },
    { "id": "settings-full" }
  ]
}
```

### Routes (20+)
/, /login, /register, /agents, /agents/:id, /agents/:id/config, /agents/:id/tools, /prompts, /prompts/:id, /prompts/:id/compare, /tools, /tools/:id, /evals, /evals/:id, /evals/:id/compare, /evals/create, /traces, /traces/:id, /settings, /settings/profile, /settings/team, /settings/billing, /forgot-password, /reset-password

---

## 6. Blueprint 2: Multi-Tenant SaaS Platform

### Identity
- **Name:** Multi-Tenant Platform
- **ID:** `multi-tenant-platform`
- **Theme:** `launchpad`
- **Tags:** platform, multi-tenant, saas, api, billing, enterprise, 2026

### Personality
"Enterprise-grade platform console built for trust and scale. Navy-to-violet gradient accents on clean white/dark surfaces. Organization switcher prominent in the top-left. Dense data tables with inline actions. API console feels like Stripe's — polished, developer-friendly, with live request/response previews. Billing pages show clear usage breakdowns with no hidden complexity. Audit logs are prominent — this is a platform that takes compliance seriously. Lucide icons. System sans typography with monospace for IDs, keys, and code."

### Voice
- **Tone:** Professional, developer-friendly. Assumes technical audience. Direct and clear.
- **CTA verbs:** Create, Configure, Deploy, Monitor, Manage, Explore
- **Avoid:** Simple, Easy, Just, Basically, Obviously
- **Empty states:** Helpful getting-started cards with copy-paste code snippets
- **Errors:** Structured: error code, message, request ID, documentation link
- **Loading:** Skeleton loaders matching the content layout

### Archetypes (7 new)

**6.1 `tenant-switcher-dashboard` (primary, shell: sidebar-main)**
- **Role:** primary
- **Description:** Organization-scoped dashboard with team overview, usage, and quick actions.
- **Pages:**
  - `overview` (route: /dashboard) — Org overview with KPI cards (members, API calls, storage, active projects), recent activity feed, quick action buttons. Layout: `kpi-grid(dashboard)` + `activity-feed(compact)` + `card-grid(icon)`
  - `members` (route: /members) — Team member management with role assignment. Layout: `data-table(standard)` + `team-member-row` + `permission-matrix`
  - `org-settings` (route: /settings/org) — Organization settings: name, logo, SSO, domains. Layout: `form-sections` + `account-settings`
- **Features:** multi-tenant, org-switcher, team-management, roles

**6.2 `api-console` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Interactive API documentation and testing console.
- **Pages:**
  - `api-docs` (route: /api) — API explorer with endpoint list, try-it-out builder. Layout: `api-explorer(grouped)`
  - `api-keys` (route: /api/keys) — API key management with scoping and rotation. Layout: `data-table(standard)` + `api-key-row`
  - `webhooks` (route: /api/webhooks) — Webhook endpoint management and delivery log. Layout: `data-table(standard)` + `webhook-debugger(standard)`
- **Features:** api-console, api-keys, webhooks, documentation

**6.3 `usage-billing` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Usage metering, billing management, and invoice history.
- **Pages:**
  - `usage` (route: /billing/usage) — Usage dashboard with meters for each resource. Layout: `usage-meter(breakdown)` + `chart-grid` + `data-table(compact)`
  - `billing` (route: /billing) — Current plan, payment method, next invoice preview. Layout: `pricing` + `form-sections` + `payment-history`
  - `invoices` (route: /billing/invoices) — Invoice history with PDF download. Layout: `data-table(standard)` with status badges
- **Features:** billing, usage-metering, invoices, plans

**6.4 `webhook-manager` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Webhook endpoint configuration with event filtering and delivery inspection.
- **Pages:**
  - `endpoints` (route: /webhooks) — Endpoint list with health status. Layout: `data-table(standard)`
  - `endpoint-detail` (route: /webhooks/:id) — Endpoint config + delivery log. Layout: `form-sections` + `webhook-debugger(live)`
- **Features:** webhooks, event-filtering, retry-logic

**6.5 `audit-center` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Compliance audit trail with export and retention policies.
- **Pages:**
  - `audit-log` (route: /audit) — Full audit trail with advanced filtering. Layout: `audit-trail(standard)`
  - `audit-settings` (route: /audit/settings) — Retention policies, export schedule, notification rules. Layout: `form-sections`
- **Features:** audit-trail, compliance, export, retention

**6.6 `marketing-platform` (public, shell: top-nav-footer)**
- **Role:** public
- **Description:** Platform marketing landing.
- **Pages:**
  - `home` (route: /) — Landing: hero + features + pricing + testimonials. Layout: `hero(split)` + `features` + `pricing` + `testimonials` + `cta-section`
  - `docs` (route: /docs) — Documentation landing linking to API docs. Layout: `card-grid(content)`
- **Features:** marketing, seo

**6.7 `auth-flow-enterprise` (gateway, shell: centered)**
- **Role:** gateway
- **Description:** Enterprise auth flow with SSO, MFA, and org invite accept.
- **Pages:**
  - `login` (route: /login) — Login with email/password + SSO button. Layout: `auth-form(login)`
  - `register` (route: /register) — Register with org creation step. Layout: `auth-form(register)` + `onboarding-wizard(stepper)`
  - `sso` (route: /sso) — SSO redirect page. Layout: `auth-form(login)` (SSO variant)
  - `invite-accept` (route: /invite/:token) — Accept team invitation. Layout: `auth-form(register)` (invite variant)
- **Features:** auth, sso, mfa, invite-flow

### Blueprint Compose
```json
{
  "compose": [
    { "id": "tenant-switcher-dashboard" },
    { "id": "api-console" },
    { "id": "usage-billing" },
    { "id": "webhook-manager" },
    { "id": "audit-center" },
    { "id": "marketing-platform" },
    { "id": "auth-flow-enterprise" },
    { "id": "settings-full" }
  ]
}
```

### Routes (25+)
/, /login, /register, /sso, /invite/:token, /dashboard, /members, /settings/org, /api, /api/keys, /api/webhooks, /billing, /billing/usage, /billing/invoices, /webhooks, /webhooks/:id, /audit, /audit/settings, /settings, /settings/profile, /settings/team, /settings/billing, /settings/security, /forgot-password, /reset-password, /mfa-setup, /mfa-verify

---

## 7. Blueprint 3: Knowledge Base / Docs Platform

### Identity
- **Name:** Knowledge Base
- **ID:** `knowledge-base`
- **Theme:** `paper`
- **Tags:** docs, knowledge, documentation, search, ai, content, 2026

### Personality
"Warm, reading-optimized documentation platform. Paper-like backgrounds with comfortable typography (65-75 character measure). AI-powered search with highlighted excerpts. Navigation tree on the left, content in the center, table-of-contents on the right. Feels like a well-designed textbook — generous whitespace, clear hierarchy, and inline code that's easy to scan. Changelog entries feel celebratory. API reference is interactive and developer-friendly. Lucide icons. Light mode default with dark mode toggle."

### Voice
- **Tone:** Helpful and clear. Teacher energy — explains without condescending. Technical accuracy matters.
- **CTA verbs:** Learn, Explore, Try, Read, Search, Contribute
- **Avoid:** Obviously, Simply, Trivially, Just do, Easy
- **Empty states:** Encouraging: "No results yet — try a broader search or browse categories"
- **Errors:** Friendly with suggestions: "This page doesn't exist. Did you mean [closest match]?"
- **Loading:** Content skeleton with realistic text line widths

### Archetypes (5 new)

**7.1 `doc-browser` (primary, shell: three-column-browser)**
- **Role:** primary
- **Description:** Documentation reading experience with navigation tree and TOC.
- **Pages:**
  - `docs` (route: /docs) — Doc tree navigation + content + table of contents. Layout: `page-tree(sidebar)` + `doc-editor(minimal, read-only variant)` + `breadcrumb-nav`
  - `doc-page` (route: /docs/:path*) — Individual doc page with full rendering. Layout: content area with `legal-prose` (for long content) + inline `command-palette` for quick nav
- **Features:** docs, navigation, table-of-contents, breadcrumbs

**7.2 `search-hub` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** AI-powered search with semantic understanding and highlighted excerpts.
- **Pages:**
  - `search` (route: /search) — Full-page search with filters and AI-summarized results. Layout: `command-palette(standard)` + search results list with highlighted excerpts + category filters
- **Features:** ai-search, semantic-search, highlighting

**7.3 `changelog-center` (auxiliary, shell: top-nav-main)**
- **Role:** auxiliary
- **Description:** Versioned changelog with release notes and migration guides.
- **Pages:**
  - `changelog` (route: /changelog) — Chronological changelog feed. Layout: `activity-feed(detailed)` styled as release entries with version badges
  - `changelog-entry` (route: /changelog/:version) — Single release note with detailed content. Layout: full-width content with `doc-editor(minimal, read-only)`
- **Features:** changelog, versions, migration-guides

**7.4 `api-reference` (auxiliary, shell: three-column-browser)**
- **Role:** auxiliary
- **Description:** Interactive API reference with live examples.
- **Pages:**
  - `api-ref` (route: /api-reference) — API endpoint browser. Layout: nav tree for resources + `api-explorer(grouped)` in detail panel
  - `api-ref-endpoint` (route: /api-reference/:resource/:method) — Single endpoint detail with try-it-out. Layout: `api-explorer(standard)` detail view
- **Features:** api-docs, try-it-out, code-snippets

**7.5 `marketing-docs` (public, shell: top-nav-footer)**
- **Role:** public
- **Description:** Docs platform marketing/landing.
- **Pages:**
  - `home` (route: /) — Landing with search hero. Layout: `hero(landing)` with prominent search bar + `features` + `cta-section`
- **Features:** marketing, seo

### Blueprint Compose
```json
{
  "compose": [
    { "id": "doc-browser" },
    { "id": "search-hub" },
    { "id": "changelog-center" },
    { "id": "api-reference" },
    { "id": "marketing-docs" },
    { "id": "auth-flow" },
    { "id": "settings" }
  ]
}
```

---

## 8. Blueprint 4: AI Copilot / Embedded Assistant

### Identity
- **Name:** AI Copilot Shell
- **ID:** `ai-copilot-shell`
- **Theme:** `carbon`
- **Tags:** ai, copilot, assistant, embedded, side-panel, suggestions, 2026

### Personality
"Minimal, unobtrusive AI assistant that enhances without overwhelming. The copilot panel is a sleek right-side drawer — dark carbon surface with soft shadows. Suggestions appear as ghost text or subtle card overlays near the user's focus point. The main app takes center stage; the AI is always available but never demands attention. Actions proposed by the AI have clear accept/reject affordances. Context breadcrumbs show exactly what the AI sees. Think GitHub Copilot meets Linear's command palette. Lucide icons. Geist Mono for AI outputs."

### Voice
- **Tone:** Concise and helpful. Like a knowledgeable colleague — offers, doesn't insist.
- **CTA verbs:** Apply, Accept, Dismiss, Refine, Ask, Explain
- **Avoid:** Let me, I think, Perhaps, Maybe, I can help with
- **Empty states:** "Ask me anything about [current context]"
- **Errors:** Quiet and recoverable: "Couldn't generate a suggestion. Try rephrasing."
- **Loading:** Subtle thinking indicator (three dots pulsing)

### Archetypes (4 new)

**8.1 `copilot-workspace` (primary, shell: copilot-overlay)**
- **Role:** primary
- **Description:** Main workspace with integrated copilot panel.
- **Pages:**
  - `workspace` (route: /app) — Main application view with copilot toggle. Layout: body contains the host application content, copilot panel contains chat thread
  - `workspace-detail` (route: /app/:id) — Detail view where copilot can reference the current item. Layout: same shell, copilot shows context-aware suggestions
- **Features:** copilot, ai-suggestions, context-awareness, keyboard-shortcuts

**8.2 `copilot-settings` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Copilot preferences: model selection, context permissions, suggestion density.
- **Pages:**
  - `copilot-config` (route: /settings/copilot) — Configuration form. Layout: `form-sections` with toggles for suggestion types, model picker, context permission checkboxes
- **Features:** settings, model-config, permissions

**8.3 `marketing-copilot` (public, shell: top-nav-footer)**
- **Role:** public
- **Description:** Landing page demonstrating the copilot in action.
- **Pages:**
  - `home` (route: /) — Landing with animated copilot demo. Layout: `hero(split)` with interactive demo + `features` + `how-it-works` + `cta-section`
- **Features:** marketing, demo, seo

**8.4 `auth-flow` (gateway, shell: centered)**
- **Role:** gateway
- **Pages:** login, register, forgot-password, reset-password
- **Features:** auth, oauth

### Blueprint Compose
```json
{
  "compose": [
    { "id": "copilot-workspace" },
    { "id": "copilot-settings" },
    { "id": "marketing-copilot" },
    { "id": "auth-flow" },
    { "id": "settings" }
  ]
}
```

---

## 9. Blueprint 5: Observability / Monitoring Dashboard

### Identity
- **Name:** Observability Platform
- **ID:** `observability-platform`
- **Theme:** `fintech` (new)
- **Tags:** observability, monitoring, traces, logs, alerts, metrics, sre, 2026

### Personality
"Data-dense monitoring command center. Dark backgrounds with accent-colored metric highlights. Dense information panels with multiple visualization types per screen — line charts, heatmaps, spark lines, gauge rings. Monospace for all metric values, timestamps, and trace IDs. Status uses the universal green/yellow/red language but never relies on color alone — icons and text supplement. Think Datadog meets Grafana. The alert system feels urgent but not panic-inducing. Lucide icons. Every millisecond matters."

### Voice
- **Tone:** Operational and direct. Speaks to SREs, devops, and platform engineers. Data over narrative.
- **CTA verbs:** Investigate, Filter, Drill Down, Acknowledge, Resolve, Silence
- **Avoid:** Don't worry, Everything's fine, Just check, Simple fix
- **Empty states:** "No data for this time range. Adjust the time picker or check your data sources."
- **Errors:** Structured: metric name, expected range, actual value, duration of deviation
- **Loading:** Chart skeletons with axis labels visible

### Archetypes (5 new)

**9.1 `metrics-overview-dashboard` (primary, shell: sidebar-main)**
- **Role:** primary
- **Description:** Top-level metrics dashboard with KPIs, charts, and status summary.
- **Pages:**
  - `overview` (route: /dashboard) — KPI row + chart grid + service health table. Layout: `kpi-grid(dashboard)` + `chart-grid` + `service-map(grid)`
  - `service-detail` (route: /services/:id) — Per-service metrics with SLO tracking. Layout: `kpi-grid(compact)` + `chart-grid` + `usage-meter(radial)` for SLO budget
- **Features:** metrics, charts, slo-tracking, real-time

**9.2 `log-explorer-pro` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Log search and analysis with structured querying.
- **Pages:**
  - `logs` (route: /logs) — Log stream with search, filters, and structured extraction. Layout: `log-stream` + `filter-bar` + `data-table(compact)`
  - `log-detail` (route: /logs/:id) — Single log entry with context (before/after logs, related trace). Layout: `json-viewer` + `trace-waterfall(compact)`
- **Features:** logs, search, structured-queries, context

**9.3 `trace-explorer` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Distributed trace viewer with service map integration.
- **Pages:**
  - `traces` (route: /traces) — Trace search with latency histogram. Layout: `data-table(standard)` + `chart-grid` (latency distribution)
  - `trace-detail` (route: /traces/:id) — Full trace waterfall with span details. Layout: `trace-waterfall(standard)`
  - `service-map` (route: /topology) — Service dependency graph. Layout: `service-map(graph)`
- **Features:** traces, service-map, latency-analysis

**9.4 `alert-manager-pro` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Description:** Alert rule management, incident tracking, and on-call scheduling.
- **Pages:**
  - `alerts` (route: /alerts) — Active alerts with severity filtering. Layout: `data-table(standard)` with severity color rows + `kpi-grid(compact)` for alert stats
  - `alert-rules` (route: /alerts/rules) — Rule builder and management. Layout: `alert-rule-builder(advanced)` + `data-table(standard)`
  - `incidents` (route: /incidents) — Incident timeline with status tracking. Layout: `timeline` + `activity-feed(detailed)`
  - `incident-detail` (route: /incidents/:id) — War room view. Layout: `kpi-grid(compact)` + `chart-grid` + `activity-feed(standard)` + `timeline`
- **Features:** alerts, incidents, rules, on-call

**9.5 `marketing-observability` (public, shell: top-nav-footer)**
- **Role:** public
- **Pages:**
  - `home` (route: /) — Landing. Layout: `hero(vision)` + `features` + `pricing` + `testimonials` + `cta-section`
- **Features:** marketing, seo

### Blueprint Compose
```json
{
  "compose": [
    { "id": "metrics-overview-dashboard" },
    { "id": "log-explorer-pro" },
    { "id": "trace-explorer" },
    { "id": "alert-manager-pro" },
    { "id": "marketing-observability" },
    { "id": "auth-full" },
    { "id": "settings-full" }
  ]
}
```

---

## 10. Blueprint 6: AI-Native CRM

### Identity
- **Name:** AI-Native CRM
- **ID:** `ai-native-crm`
- **Theme:** `glassmorphism`
- **Tags:** crm, sales, ai, pipeline, contacts, email, meetings, 2026

### Personality
"Intelligent CRM with AI enrichment at every touch. Frosted glass panels on cool-toned dark backgrounds. Contact cards show AI-gathered insights alongside manual data. The pipeline board is the center of gravity — wide, draggable, with value-weighted columns. Email composer has AI suggestions that appear as ghost text. Meeting recaps auto-populate with action items. The relationship graph makes hidden connections visible. Smooth transitions between views — no hard page reloads. Lucide icons. This CRM feels alive."

### Voice
- **Tone:** Confident and helpful. Assumes sales professionals. Action-oriented.
- **CTA verbs:** Close, Schedule, Follow Up, Enrich, Connect, Forecast
- **Avoid:** Maybe, Might, Could be, Perhaps, Uncertain
- **Empty states:** "Your pipeline is empty — add your first deal to get started"
- **Errors:** Contextual: "Couldn't enrich this contact. Verify the email address."
- **Loading:** Card skeleton with frosted glass shimmer

### Archetypes (5 new)

**10.1 `crm-dashboard` (primary, shell: sidebar-main)**
- **Role:** primary
- **Pages:**
  - `dashboard` (route: /dashboard) — Sales overview: pipeline value, deals closing this week, activity feed. Layout: `kpi-grid(dashboard)` + `deal-pipeline-board(compact)` + `activity-feed(compact)`
  - `pipeline` (route: /pipeline) — Full pipeline board. Layout: `deal-pipeline-board(standard)`
  - `contacts` (route: /contacts) — Contact directory with AI enrichment badges. Layout: `data-table(standard)` with inline enrichment indicators
  - `contact-detail` (route: /contacts/:id) — Contact profile with enrichment panel, activity, deals. Layout: `creator-profile(standard variant)` + `activity-feed(standard)` + `relationship-graph(radial)`
  - `deals` (route: /deals) — Deal list with forecast. Layout: `data-table(standard)` + `kpi-grid(compact)`
  - `deal-detail` (route: /deals/:id) — Deal detail with timeline and documents. Layout: `detail-header` + `timeline` + `activity-feed(standard)` + `form-sections`
- **Features:** pipeline, contacts, deals, ai-enrichment, forecasting

**10.2 `crm-email` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `inbox` (route: /email) — Email inbox with AI categorization. Layout: `conversation-list` + email preview
  - `compose` (route: /email/compose) — AI-assisted email composer. Layout: rich text editor with ghost text suggestions + contact selector
- **Features:** email, ai-compose, categorization

**10.3 `crm-meetings` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `meetings` (route: /meetings) — Meeting calendar. Layout: `calendar-view(week)`
  - `meeting-detail` (route: /meetings/:id) — Meeting detail with AI recap, action items, transcript. Layout: `detail-header` + recap card + action checklist + `timeline`
- **Features:** meetings, ai-recap, transcription, action-items

**10.4 `crm-intelligence` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `insights` (route: /insights) — AI-generated sales insights: win/loss analysis, pipeline forecast, relationship map. Layout: `kpi-grid(dashboard)` + `chart-grid` + `relationship-graph(network)`
- **Features:** ai-insights, forecasting, analytics

**10.5 `marketing-crm` (public, shell: top-nav-footer)**
- **Role:** public
- **Pages:**
  - `home` (route: /) — Landing. Layout: `hero(split)` + `features` + `testimonials` + `pricing` + `cta-section`
- **Features:** marketing, seo

### Blueprint Compose
```json
{
  "compose": [
    { "id": "crm-dashboard" },
    { "id": "crm-email" },
    { "id": "crm-meetings" },
    { "id": "crm-intelligence" },
    { "id": "marketing-crm" },
    { "id": "auth-full" },
    { "id": "settings-full" }
  ]
}
```

---

## 11. Blueprint 7: Two-Sided Marketplace

### Identity
- **Name:** Two-Sided Marketplace
- **ID:** `two-sided-marketplace`
- **Theme:** `clean`
- **Tags:** marketplace, buyers, sellers, listings, reviews, booking, messaging, 2026

### Personality
"Clean, trustworthy marketplace that serves both sides fairly. White/light surfaces with a single accent color for CTAs. Listing cards are image-forward with clean typography. Search and filtering are powerful but never overwhelming. Reviews are prominent — social proof drives conversion. Messaging is simple and contextual — always tied to a listing. The seller dashboard is data-rich but not intimidating. Comparison tools help buyers make confident decisions. Lucide icons. Mobile-first thinking."

### Voice
- **Tone:** Friendly and trustworthy. Speaks to both buyers and sellers. Clear and fair.
- **CTA verbs:** Browse, Book, List, Compare, Message, Review
- **Avoid:** Buy Now, Limited Time, Hurry, Act Fast, Exclusive
- **Empty states:** Encouraging search suggestions or popular categories
- **Errors:** Helpful: "This listing is no longer available. Here are similar options."
- **Loading:** Image placeholder shimmer + text skeleton

### Archetypes (7 new)

**11.1 `listing-browser` (primary, shell: top-nav-main)**
- **Role:** primary
- **Pages:**
  - `browse` (route: /browse) — Listing grid with search, filters, map toggle. Layout: `search-filter-bar` + `card-grid(product)` or `map-view(pins)` toggle
  - `listing-detail` (route: /listings/:id) — Full listing with gallery, details, reviews, booking. Layout: image gallery + detail section + `comparison-table(highlight)` variant for features + reviews section + booking CTA
  - `search` (route: /search) — Search results with filters. Layout: `search-filter-bar` + `card-grid(product)`
- **Features:** search, filters, map-view, image-gallery

**11.2 `listing-detail-full` (primary, shell: top-nav-main)**
- **Role:** primary
- **Pages:**
  - `listing-page` (route: /listings/:id) — Full listing page. Layout: hero gallery + `detail-header` + features grid + `calendar-view(week)` for availability + review section
- **Features:** gallery, availability, reviews, booking

**11.3 `buyer-dashboard` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `bookings` (route: /bookings) — Buyer's booking list. Layout: `data-table(standard)` with status badges
  - `favorites` (route: /favorites) — Saved listings. Layout: `card-grid(product)`
  - `messages` (route: /messages) — Message threads. Layout: `conversation-list` + `chat-thread`
- **Features:** bookings, favorites, messaging

**11.4 `seller-dashboard` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `seller-overview` (route: /seller) — Seller dashboard with earnings, active listings, pending bookings. Layout: `kpi-grid(dashboard)` + `data-table(compact)`
  - `seller-listings` (route: /seller/listings) — Manage listings. Layout: `data-table(standard)` with edit/delete actions
  - `seller-listing-edit` (route: /seller/listings/:id/edit) — Edit listing form. Layout: `form-sections` with image upload
  - `seller-analytics` (route: /seller/analytics) — Performance analytics. Layout: `chart-grid` + `kpi-grid(compact)` + `sparkline-cell`
  - `seller-reviews` (route: /seller/reviews) — Review management. Layout: `data-table(standard)`
- **Features:** listings, analytics, earnings, reviews

**11.5 `review-system` (auxiliary)**
- **Role:** auxiliary (embedded across buyer/seller dashboards, no standalone shell)
- **Pages:**
  - `write-review` (route: /review/:bookingId) — Review submission form. Layout: star rating + text area + photo upload
- **Features:** reviews, ratings, photos

**11.6 `marketplace-messaging` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `messages` (route: /messages) — Message center. Layout: `conversation-list` + `chat-thread`
  - `thread` (route: /messages/:id) — Single conversation. Layout: `chat-thread` with listing context card
- **Features:** messaging, contextual-listing-cards

**11.7 `marketing-marketplace` (public, shell: top-nav-footer)**
- **Role:** public
- **Pages:**
  - `home` (route: /) — Landing with featured listings, categories, testimonials. Layout: `hero(landing)` + `card-grid(content)` for categories + `testimonials` + `cta-section`
  - `about` (route: /about) — About page. Layout: `hero(brand)` + content sections
- **Features:** marketing, seo, featured-listings

### Blueprint Compose
```json
{
  "compose": [
    { "id": "listing-browser" },
    { "id": "buyer-dashboard" },
    { "id": "seller-dashboard" },
    { "id": "marketplace-messaging" },
    { "id": "review-system" },
    { "id": "marketing-marketplace" },
    { "id": "auth-full" },
    { "id": "settings-full" }
  ]
}
```

---

## 12. Blueprint 8: Event / Community Platform

### Identity
- **Name:** Event & Community Hub
- **ID:** `event-community-hub`
- **Theme:** `dopamine`
- **Tags:** events, community, social, ticketing, livestream, 2026

### Personality
"High-energy community hub with bold, vibrant visuals. Y2K-inspired maximalism with saturated event imagery. Event cards are punchy — bold titles, gradient accents, and clear date badges. Community feed is social and lively with reactions, comments, and shared content. Ticket selection is fun, not transactional — animated tier cards with clear value props. Live streams feel immersive with floating chat. The organizer dashboard balances energy with clarity. Lucide icons. Every interaction should feel like joining a party."

### Voice
- **Tone:** Enthusiastic and inclusive. Speaks to event-goers and community members. Celebratory.
- **CTA verbs:** Join, RSVP, Share, Watch, Connect, Discover
- **Avoid:** Buy, Purchase, Transaction, Invoice, Processing
- **Empty states:** "No events yet? Create one and watch the magic happen!"
- **Errors:** Light-hearted: "Oops! That event seems to have wandered off. Here's what's happening now."
- **Loading:** Gradient shimmer pulse

### Archetypes (5 new)

**12.1 `event-discovery` (primary, shell: top-nav-main)**
- **Role:** primary
- **Pages:**
  - `events` (route: /events) — Event listing with filters. Layout: `search-filter-bar` + `card-grid(content)` + `calendar-view(month)` toggle + `map-view(pins)` toggle
  - `event-detail` (route: /events/:id) — Full event page with details, schedule, tickets, attendees. Layout: `hero(image-overlay)` with event image + detail section + `timeline` for schedule + `card-grid(product)` for ticket tiers + attendee avatars
- **Features:** events, search, calendar, map, filters

**12.2 `community-feed` (auxiliary, shell: top-nav-main)**
- **Role:** auxiliary
- **Pages:**
  - `feed` (route: /community) — Social feed with posts, discussions. Layout: `post-list` + `activity-feed(standard)` + `emoji-reaction-bar`
  - `post-detail` (route: /community/:id) — Single post with comments. Layout: post content + `comment-thread` + `emoji-reaction-bar`
  - `members` (route: /community/members) — Member directory. Layout: `card-grid(content)` with member cards
- **Features:** feed, discussions, reactions, comments

**12.3 `ticket-checkout` (auxiliary, shell: minimal-header)**
- **Role:** auxiliary
- **Pages:**
  - `tickets` (route: /events/:id/tickets) — Ticket selection + checkout. Layout: tier cards + `checkout-flow(purchase)` + `onboarding-wizard(stepper)` for checkout steps
- **Features:** tickets, checkout, payment

**12.4 `organizer-dashboard` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `org-overview` (route: /organizer) — Organizer dashboard with event stats, attendee count, revenue. Layout: `kpi-grid(dashboard)` + `data-table(compact)` of upcoming events
  - `org-event-edit` (route: /organizer/events/:id) — Event editor. Layout: `form-sections` with image upload, schedule builder, ticket tier editor
  - `org-attendees` (route: /organizer/events/:id/attendees) — Attendee list with check-in. Layout: `data-table(standard)` with check-in toggle
  - `org-analytics` (route: /organizer/analytics) — Revenue and engagement analytics. Layout: `chart-grid` + `kpi-grid(compact)` + `earnings-dashboard(summary)`
- **Features:** event-management, attendees, analytics, revenue

**12.5 `marketing-events` (public, shell: top-nav-footer)**
- **Role:** public
- **Pages:**
  - `home` (route: /) — Landing with featured events and community highlights. Layout: `hero(landing)` + featured events carousel + `testimonials` + `cta-section`
- **Features:** marketing, seo

### Blueprint Compose
```json
{
  "compose": [
    { "id": "event-discovery" },
    { "id": "community-feed" },
    { "id": "ticket-checkout" },
    { "id": "organizer-dashboard" },
    { "id": "marketing-events" },
    { "id": "auth-full" },
    { "id": "settings-full" }
  ]
}
```

---

## 13. Blueprint 9: Health / Wellness Portal

### Identity
- **Name:** Health & Wellness Portal
- **ID:** `health-wellness-portal`
- **Theme:** `healthcare` (new)
- **Tags:** health, wellness, telehealth, appointments, medical, patient-portal, 2026

### Personality
"Calming, trust-building health portal with an emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Patient data is presented with care: vitals use color-coded status indicators (always supplemented with text labels for accessibility). Appointment booking is straightforward with clear availability. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence and understanding. Lucide icons. WCAG AAA compliance throughout."

### Voice
- **Tone:** Caring, clear, and professional. Speaks to patients. Never clinical or cold.
- **CTA verbs:** Book, View, Download, Upload, Connect, Schedule
- **Avoid:** Symptom, Diagnosis, Treatment (use patient-friendly alternatives), ASAP, Urgent (unless truly urgent)
- **Empty states:** "No upcoming appointments. Ready to schedule one?"
- **Errors:** Reassuring: "Something went wrong — your data is safe. Please try again or contact support."
- **Loading:** Gentle pulse skeleton with calming blue tint

### Archetypes (5 new)

**13.1 `patient-dashboard` (primary, shell: sidebar-main)**
- **Role:** primary
- **Pages:**
  - `overview` (route: /dashboard) — Patient overview: upcoming appointments, recent vitals, medication reminders. Layout: `kpi-grid(dashboard)` for vitals summary + `calendar-view(agenda)` for appointments + medication cards
  - `vitals` (route: /vitals) — Vitals history with charts. Layout: `chart-grid` + `data-table(standard)` + `sparkline-cell` trend indicators
  - `medications` (route: /medications) — Medication list with schedule. Layout: `data-table(standard)` + `calendar-view(day)` for schedule view
- **Features:** vitals, medications, appointments, health-records

**13.2 `appointment-center` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `appointments` (route: /appointments) — Appointment list with upcoming/past tabs. Layout: `data-table(standard)` with status badges
  - `book` (route: /appointments/book) — Booking flow with provider selection. Layout: `booking-calendar(provider-select)`
  - `appointment-detail` (route: /appointments/:id) — Appointment detail with notes, prescriptions, join telehealth button. Layout: `detail-header` + content sections + `video-room` join button
- **Features:** appointments, booking, telehealth

**13.3 `telehealth-room` (auxiliary, shell: minimal-header)**
- **Role:** auxiliary
- **Pages:**
  - `session` (route: /telehealth/:id) — Video consultation with notes panel. Layout: `video-room(speaker)` + notes sidebar
- **Features:** telehealth, video, notes

**13.4 `health-records` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `records` (route: /records) — Health records vault. Layout: `file-browser(list)` with category filters (lab results, prescriptions, imaging, notes)
  - `record-detail` (route: /records/:id) — Single record viewer. Layout: document viewer + metadata panel
  - `intake` (route: /intake) — Patient intake form. Layout: `intake-form-wizard(standard)`
- **Features:** records, documents, intake-forms

**13.5 `marketing-health` (public, shell: top-nav-footer)**
- **Role:** public
- **Pages:**
  - `home` (route: /) — Landing. Layout: `hero(split)` with calming imagery + `features` + `testimonials` + `cta-section`
- **Features:** marketing, seo

### Blueprint Compose
```json
{
  "compose": [
    { "id": "patient-dashboard" },
    { "id": "appointment-center" },
    { "id": "telehealth-room" },
    { "id": "health-records" },
    { "id": "marketing-health" },
    { "id": "auth-full" },
    { "id": "settings-full" }
  ]
}
```

---

## 14. Blueprint 10: Data Pipeline Studio

### Identity
- **Name:** Data Pipeline Studio
- **ID:** `data-pipeline-studio`
- **Theme:** `terminal`
- **Tags:** data, etl, pipeline, integration, transformation, engineering, 2026

### Personality
"Technical data engineering workspace with terminal-inspired aesthetics. Phosphor green/amber on black for the pipeline canvas and log viewers. ASCII box borders on panels. Monospace everywhere — this is a tool for data engineers who live in the terminal. The visual pipeline builder uses nodes and edges with animated data flow particles. Source connectors show recognizable database/API icons. Transformation nodes show SQL/code previews. Job monitoring uses real-time log streaming. Think dbt Cloud meets Prefect meets a retro terminal. Lucide icons mixed with custom data-type icons."

### Voice
- **Tone:** Technical and direct. Speaks to data engineers. Shows SQL/code examples, not prose.
- **CTA verbs:** Run, Deploy, Connect, Transform, Preview, Monitor
- **Avoid:** Easy, Simple, Drag and drop, No-code, Visual (ironic given the canvas, but avoid marketing-speak)
- **Empty states:** `> No pipelines configured. Run 'new pipeline' to begin.` (terminal style)
- **Errors:** Stack trace style with job ID, step name, error type, and retry count
- **Loading:** Terminal cursor blink with `Running...` text

### Archetypes (5 new)

**14.1 `pipeline-builder` (primary, shell: terminal-split)**
- **Role:** primary
- **Pages:**
  - `pipelines` (route: /pipelines) — Pipeline list with last run status. Layout: `data-table(standard)` with status badges, last run time, duration
  - `pipeline-editor` (route: /pipelines/:id) — Visual pipeline canvas. Layout: `workflow-canvas(standard)` with source/transform/sink node types
  - `pipeline-config` (route: /pipelines/:id/config) — Pipeline configuration: schedule, retries, alerts. Layout: `form-sections`
- **Features:** pipelines, visual-builder, scheduling

**14.2 `source-catalog` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `sources` (route: /sources) — Available data sources. Layout: `data-source-connector(catalog)`
  - `source-detail` (route: /sources/:id) — Source configuration and schema. Layout: `data-source-connector(setup)` + `json-viewer` for schema
  - `connections` (route: /connections) — Active connections. Layout: `data-source-connector(connected)`
- **Features:** sources, connectors, schemas

**14.3 `transformation-editor` (auxiliary, shell: sidebar-aside)**
- **Role:** auxiliary
- **Pages:**
  - `transforms` (route: /transforms) — Transformation list. Layout: `data-table(standard)`
  - `transform-editor` (route: /transforms/:id) — SQL/code editor with data preview. Layout: `split-pane` with code editor on left, data preview table on right
  - `data-preview` (route: /transforms/:id/preview) — Sample data viewer. Layout: `data-table(standard)` + `json-viewer`
- **Features:** sql-editor, transformations, data-preview

**14.4 `job-monitor` (auxiliary, shell: sidebar-main)**
- **Role:** auxiliary
- **Pages:**
  - `jobs` (route: /jobs) — Job run history. Layout: `data-table(standard)` with duration, rows processed, status
  - `job-detail` (route: /jobs/:id) — Job detail with step-by-step log. Layout: `trace-waterfall(standard)` + `log-stream` + `kpi-grid(compact)` (rows processed, duration, cost)
- **Features:** monitoring, logs, job-history

**14.5 `marketing-pipeline` (public, shell: top-nav-footer)**
- **Role:** public
- **Pages:**
  - `home` (route: /) — Landing. Layout: `hero(vision)` + `features` + `how-it-works` + `pricing` + `cta-section`
- **Features:** marketing, seo

### Blueprint Compose
```json
{
  "compose": [
    { "id": "pipeline-builder" },
    { "id": "source-catalog" },
    { "id": "transformation-editor" },
    { "id": "job-monitor" },
    { "id": "marketing-pipeline" },
    { "id": "auth-full" },
    { "id": "settings-full" }
  ]
}
```

---

## 15. Legacy Blueprint Upgrades

These 6 existing blueprints need to be upgraded from single-archetype stubs to full multi-archetype compositions with proper topology.

### 15.1 `ecommerce` → Decompose into:
- `storefront-browse` (primary): Browse, PDP, cart, categories
- `checkout-flow` (auxiliary): Multi-step checkout
- `order-management` (auxiliary): Order history, tracking
- `marketing-ecommerce` (public): Landing
- `auth-flow` (gateway): Login, register
- Add: `comparison-table`, `breadcrumb-nav` patterns

### 15.2 `ecommerce-admin` → Decompose into:
- `admin-dashboard` (primary): KPIs, quick actions
- `product-management` (auxiliary): CRUD, inventory
- `order-fulfillment` (auxiliary): Orders, shipping
- `customer-management` (auxiliary): Customer profiles
- `admin-analytics` (auxiliary): Revenue charts
- Add: `kanban-board` for orders, `sparkline-cell` for trends

### 15.3 `financial-dashboard` → Decompose into:
- `portfolio-overview` (primary): Net worth, allocations
- `transaction-history` (auxiliary): Transactions, categorization
- `budget-planner` (auxiliary): Budget vs actual
- `investment-tracker` (auxiliary): Holdings, performance
- `marketing-finance` (public): Landing
- Add: `sparkline-cell`, `comparison-table`

### 15.4 `portfolio` → Decompose into:
- `portfolio-showcase` (primary): Project grid, detail views
- `portfolio-about` (auxiliary): Bio, skills, contact
- `portfolio-blog` (auxiliary): Blog posts
- Add: `breadcrumb-nav`, `stepper` for case study sections

### 15.5 `saas-dashboard` → Decompose into:
- `saas-overview` (primary): KPIs, activity, quick actions
- `team-workspace` (auxiliary): Team members, permissions
- `saas-analytics` (auxiliary): Charts, usage
- `saas-billing` (auxiliary): Plans, invoices
- `marketing-saas-v2` (public): Landing
- Add: `usage-meter`, `audit-trail`, `notification-center`

### 15.6 `recipe-community` → Decompose into:
- `recipe-browser` (primary): Browse, search, filters
- `recipe-detail` (primary): Full recipe with instructions
- `cook-mode` (auxiliary): Step-by-step cooking view
- `recipe-creator` (auxiliary): Recipe editor with image upload
- `recipe-social` (auxiliary): Following, collections, comments
- `marketing-recipe` (public): Landing
- Add: `stepper` for cooking steps, `emoji-reaction-bar`, `drag-sort-list` for ingredients

---

## 16. Content Summary Matrix

### New Content Totals

| Type | Count | Items |
|------|-------|-------|
| **Patterns** | 30 | kanban-board, calendar-view, video-room, file-browser, notification-center, onboarding-wizard, drag-sort-list, map-view, comparison-table, sparkline-cell, breadcrumb-nav, stepper, toast-notification, skeleton-loader, emoji-reaction-bar, workflow-canvas, prompt-playground, eval-dashboard, trace-waterfall, service-map, alert-rule-builder, relationship-graph, deal-pipeline-board, api-explorer, webhook-debugger, usage-meter, audit-trail, booking-calendar, intake-form-wizard, data-source-connector |
| **Themes** | 5 | healthcare, fintech, neo-tokyo, earth, government |
| **Shells** | 2 | copilot-overlay, three-column-browser |
| **Blueprints** | 10 | agent-studio, multi-tenant-platform, knowledge-base, ai-copilot-shell, observability-platform, ai-native-crm, two-sided-marketplace, event-community-hub, health-wellness-portal, data-pipeline-studio |
| **Archetypes** | ~54 | See per-blueprint sections above |
| **Legacy upgrades** | 6 | ecommerce, ecommerce-admin, financial-dashboard, portfolio, saas-dashboard, recipe-community |

### Execution Order (Dependencies)

**Phase 1 — Universal Patterns** (no dependencies)
All 30 patterns can be created independently. They form the building blocks for everything else.

**Phase 2 — Themes & Shells** (no dependencies)
5 themes + 2 shells. Independent of patterns.

**Phase 3 — Archetypes** (depends on Phase 1)
~54 archetypes that reference patterns from Phase 1 + existing patterns.

**Phase 4 — Blueprints** (depends on Phase 3)
10 new blueprints that compose archetypes from Phase 3 + existing archetypes.

**Phase 5 — Legacy Upgrades** (depends on Phases 1-3)
6 existing blueprints decomposed into new archetypes and upgraded.

### Validation Criteria
- All patterns pass `validate.js`
- All archetypes reference existing patterns (fully-qualified slugs)
- All blueprints have `compose` arrays with existing archetypes
- All blueprints have personality (100+ chars), voice block, full route maps
- All patterns have visual_brief, responsive, motion, accessibility, composition (if 3+ components)
- 0 broken references across the entire registry
- All themes have decorator_definitions populated
