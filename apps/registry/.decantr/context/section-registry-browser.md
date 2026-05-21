# Section: registry-browser

**Role:** public | **Shell:** top-nav-main | **Archetype:** registry-browser
**Description:** Public content browsing for a design registry. Search, filter, and explore patterns, themes, blueprints, archetypes, and shells.

## Quick Start

**Shell:** Horizontal navigation shell with a compact sticky header, shared content insets, and a curated page-width rhythm. Used by public browsing, editorial catalog pages, and marketing-style registry surfaces. (header: 52px)
**Pages:** 8 (homepage, browse, browse-type, detail, profile, scan, privacy, terms)
**Key patterns:** blueprint-launch-hero [moderate], search-filter-bar [moderate], featured-launchpad-list [moderate], launchpad-flow [moderate], registry-link-list, content-card-grid [moderate], command-rail [moderate], blueprint-anatomy [moderate], contract-explorer [moderate], json-viewer, detail-header [moderate], activity-feed, brownfield-scan [moderate]
**Theme decorators:** 11 classes — see `section-registry-browser-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Welcoming and developer-friendly.

## Shell Implementation (top-nav-main)

### body

- **gap:** 1rem
- **flex:** 1
- **note:** Scrollable content area below the nav bar. Public registry pages should use a consistent page max-width rhythm inside this region instead of page-local guesses. When multiple editorial sections are stacked in the public registry shell, the shell owns inter-section spacing; do not stack shell gap on top of full default d-section padding.
- **atoms:** _flex _col _gap4 _p6 _overflow[auto] _flex1
- **padding:** clamp(1rem, 2vw, 1.5rem)
- **direction:** column
- **overflow_y:** auto

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 clamp(1rem, 2vw, 1.5rem)
- **nav_links:** Nav links use text-sm font-medium with no background. Hover: text color transitions to primary. Active: font-semibold or underline-offset-4. Keep the visible label to the route name itself — if hotkeys are declared in the essence, treat them as keyboard bindings or command-palette hints, not inline nav text.
- **background:** var(--d-bg)
- **left_content:** Brand/logo link
- **button_sizing:** Buttons and CTAs in the header must use compact sizing: py-1.5 px-4 text-sm (not the default d-interactive padding). The header is 52px — buttons should be ~32px tall, not 40px+.
- **right_content:** Theme toggle (sun/moon icon, toggles light/dark class on html element) + Search trigger + CTA button or user avatar. Theme toggle uses a simple icon button — no dropdown.
- **center_content:** Nav links — flex with gap 1.5rem on tablet/desktop and gracefully reduced clutter on narrow widths

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: comfortable (--d-density-scale: 1)

## Shell Notes (top-nav-main)

- **Hotkeys:** When navigation hotkeys are declared in the essence, implement them as keyboard shortcuts or command-palette affordances. Do not append hotkey text to the persistent top navigation unless the route contract explicitly asks for visible shortcut hints.
- **Mobile Nav:** Below md, preserve brand + essential actions first and collapse or hide secondary links rather than squeezing the whole nav row.
- **Shell Spacing:** Header, body, and footer share the same horizontal inset rhythm. Public pages should feel like one shell system, not separate handcrafted blocks. Editorial registry surfaces should use a compact shell-owned section rhythm rather than layering shell gap, d-section padding, and sibling section margins all at once.

## Theme Reference

**Theme:** luminarum (dark) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 11 `luminarum-*` classes — full Class/Intent/Apply-to table in `section-registry-browser-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 7.5rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface luminarum-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-main shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

search, pagination

---

## Visual Direction

**Personality:** Vibrant design intelligence registry. Warm coral and amber accents on a rich dark canvas (or crisp warm-white in light mode). Content cards are the hero — outlined with colored type borders, hovering with purpose. Search is instant and faceted. Publishing feels like sharing art. The Decantr dogfood app — built with its own system, proudly showing what the platform produces. Think Figma Community meets shadcn/ui registry.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Constraints

- **effects:** {"doctrine-security-data":"Preserve the existing Supabase auth, admin authorization, billing, API-key, telemetry attribution, privacy, and hosted-registry service boundaries unless a reviewed task explicitly changes them.","doctrine-design-system":"Preserve the registry's Luminarum token bridge, Decantr treatments, shell rhythm, and public/admin/dashboard styling contracts while evolving individual pages."}

---

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### blueprint-launch-hero

First-viewport registry hero for blueprint discovery pages. It introduces Decantr's blueprint catalog with a strong product signal, concise positioning, search or browse actions, and a compact proof row for counts, freshness, or workflow coverage.

**Visual brief:** A confident first-viewport registry hero that feels like an enterprise product surface rather than a marketing splash. The Decantr registry and blueprint catalog should be immediately legible. Use crisp type, restrained proof metrics, and a search or command action that feels operational. Avoid decorative hero cards or vague atmospheric art; this hero should help builders decide what to inspect next.

**Components:** Button, Badge, Search, KPI, icon

**Composition:**
```
ProofRow = GridOrRail(compact) > MetricChip[]
ActionRow = Flex(wrap) > [PrimaryBrowseOrSearch + SecondaryCommandOrDocs]
BlueprintLaunchHero = Hero(banner) > [Eyebrow + Headline + SupportingCopy + ActionRow + ProofRow]
```

**Layout slots:**
- `eyebrow`: Small d-label marker for the registry surface or selected namespace.
- `headline`: Literal offer or catalog name. Keep it concrete: Blueprint Registry, Launch With Decantr, or Official Blueprints.
- `proof-row`: Compact stat chips for blueprint count, supported workflows, update recency, or official/community split.
- `action-row`: Primary browse/search CTA plus a secondary command or docs CTA.
- `supporting-copy`: Two-to-three sentence value prop that explains what the blueprint helps a builder ship.
  **Layout guidance:**
  - proof_density: Use three to five proof metrics maximum. Metrics should validate catalog usefulness, not become dashboard chrome.
  - first_viewport: The catalog identity must be visible in the first viewport. Do not bury the blueprint signal in an eyebrow only.
  - action_priority: Primary action should move to browse/search. Secondary action can expose a CLI command or docs link.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Actions and proof chips may brighten on hover or focus. Keep motion short and functional. |
| transitions | Hero content can fade in with a subtle stagger, but search and command affordances should be instantly usable. |

**Responsive:**
- **Mobile (<640px):** Single-column stack with headline first, supporting copy second, actions wrapping into full-width buttons, and proof metrics in a two-column or horizontally scrollable strip.
- **Tablet (640-1024px):** Hero copy and actions remain stacked with a wider proof row. Search can expand to full width.
- **Desktop (>1024px):** Wide editorial hero with actions and proof row aligned below the copy. Keep enough vertical restraint that the next registry section is visible.

**Accessibility:**
- Role: `banner`
- Keyboard: Search and action controls should be reachable immediately after the skip link or primary navigation.
- Announcements: Headline, supporting copy, and proof metrics should remain meaningful without visual-only badges.
- Focus: Focus styles on search and CTAs should match hover intensity and remain visible on dark surfaces.


### search-filter-bar

Search-first public registry filter bar with type tabs, a source filter, sort controls, and result count. Designed for builders browsing Decantr content, not for exposing internal registry-intelligence taxonomy.

**Visual brief:** Public registry filter bar with one clear purpose: help builders find the right Decantr starting point quickly. Search is the hero. Type tabs are distinct and color-coded. Source filtering is understandable to humans: Official, Community, Organizations. Sort remains available but visually secondary. The bar should feel premium, breathable, and unambiguous, not like an operator console.

**Components:** Input, Select, Button, Badge, Chip, icon

**Composition:**
```
MobileFilters = Surface(d-surface) > [SourceFilter + SortSelect]
SearchFilterBar = Stack > [SearchRow > SearchInput(d-control, icon: search) + TypeRow > TypeTabs(d-interactive)[] + MetaRow > [ResultCount + SourceFilter + SortSelect(d-control)]]
```

**Layout slots:**
- `meta-row`: Result count on the left, source filter and sort on the right
- `type-row`: Scrollable row of type tabs (All, Patterns, Themes, Blueprints, Archetypes, Shells)
- `search-row`: Search input with icon prefix
- `mobile-filters`: Collapsible mobile filter surface for source and sort
  **Layout guidance:**
  - filter_tabs: Type tabs should use distinct type-linked treatments so all-type browsing is easy to parse at a glance. The patterns icon should read like a puzzle-piece rather than a generic component glyph.
  - search_input: Full-width search input with magnifying glass icon. Placeholder should explicitly mention Decantr content types and app-starting intent.
  - sort_dropdown: Right-aligned sort with a restrained visual footprint. Keep sort available, but subordinate to search and content-type/source selection.
  - source_filter: Use human-facing source language: Official, Community, Organizations. Do not expose authored/benchmark/hybrid intelligence taxonomy here.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Tabs, chips, and filter controls may animate lightly on hover and selection, but search remains the dominant visual action. |
| transitions | Filter-surface expansion, chip removal, and result-state updates should animate over 150-240ms without making the bar feel operator-heavy. |

**Responsive:**
- **Mobile (<640px):** Search input full-width on its own row. Type tabs become a horizontal scrollable strip. Source and sort move into a collapsible filter surface instead of squeezing the main bar.
- **Tablet (640-1024px):** Search and filters fit comfortably in stacked rows. Type tabs remain visible. Source filter can stay inline if space allows.
- **Desktop (>1024px):** Search, type tabs, source filter, and sort remain visible without feeling like one dense toolbar. Result count stays readable but subdued.

**Accessibility:**
- Role: `search`
- Keyboard: Tab moves from search input to tabs to source and sort controls in logical order.; Arrow keys may move between tab-style filters when implemented as a tab list.
- Announcements: Active filters, source selection, and sort changes should be announced clearly.; Result count updates should remain available without depending on purely visual placement.
- Focus: Opening mobile filter surfaces should move focus into the filter panel and return it to the invoking control on close.


### featured-launchpad-list

Curated list or grid of featured blueprints, archetypes, or starter paths. Each item explains who it is for, what it scaffolds, and the next command or registry route a builder should use.

**Visual brief:** A curated launchpad surface that feels selective and high-signal. Cards should read like strong product recommendations, not a generic content feed. Each item needs a clear use case, a reason to trust it, and an obvious next step. Use compact tags and command previews sparingly so the list remains scannable.

**Components:** Card, Badge, Button, icon

**Composition:**
```
TagRow = Flex(wrap) > Tag[]
LaunchpadCard = Card > [Header(Name + NamespaceBadge) + Outcome + TagRow + CommandPreview? + ActionRow]
FeaturedLaunchpadList = Grid(responsive) > LaunchpadCard[]
```

**Layout slots:**
- `item-tags`: Small tags for workflow, target framework, or adoption mode.
- `item-action`: Inspect, launch, or copy command action.
- `item-header`: Blueprint or launchpad name with namespace badge.
- `item-command`: Optional install or scaffold command snippet.
- `item-outcome`: One concise sentence describing what the builder can ship.
  **Layout guidance:**
  - curation: Prefer fewer, better launchpad entries over a dense catalog wall. The pattern should communicate recommendation quality.
  - metadata: Tags should explain fit: greenfield, brownfield, hybrid, Next, Vite, registry, dashboard, or SaaS.
  - command_preview: Use command snippets only when they accelerate action. They should be copyable or visually separate from prose.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Cards lift subtly and action rows sharpen on hover or focus. |
| transitions | Featured items can reveal with a short stagger when the list first enters view. |

**Responsive:**
- **Mobile (<640px):** Single-column cards with full-width action rows and command snippets that wrap without overflow.
- **Tablet (640-1024px):** Two-column card grid with equal-height cards and aligned action rows.
- **Desktop (>1024px):** Three-column grid or split featured-plus-secondary layout. Keep the primary featured item visually stronger only when the content warrants it.

**Accessibility:**
- Role: `region`
- Keyboard: Tab order should move through each card's primary action in reading order.
- Announcements: Each launchpad should expose name, outcome, and target workflow without relying on tag color.
- Focus: If the whole card is clickable, still expose one named primary link or button.


### launchpad-flow

Guided sequence that shows how a builder moves from selecting a Decantr blueprint to initializing, refreshing, checking, and iterating with AI-ready context.

**Visual brief:** A crisp operational flow that makes Decantr feel immediately usable. The sequence should look like a product workflow, not a tutorial wall. Use clear step labels, small command blocks, and simple connective rhythm so users understand the path from registry choice to verified project health.

**Components:** Card, Badge, CodeBlock, icon

**Composition:**
```
LaunchpadFlow = OrderedList > LaunchpadStep[]
LaunchpadStep = Card > [Marker + Title + CommandSnippet? + Outcome]
CommandSnippet = CodeBlock(compact, copyable)
```

**Layout slots:**
- `step-proof`: Short note about what changes after this step.
- `step-title`: Action-oriented step heading.
- `step-number`: Number or icon marker.
- `step-command`: Optional CLI command or file artifact.
  **Layout guidance:**
  - commands: Commands should be short and copyable. Avoid large code blocks inside this pattern.
  - outcomes: Every step should state the artifact or confidence it creates: essence, context, health report, or remediation prompt.
  - step_count: Use three to five steps. If more detail is needed, move it into an expandable or docs link outside the core flow.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Step cards can highlight in sequence on hover or focus. |
| transitions | Initial reveal may stagger from first step to last over 200-320ms. |

**Responsive:**
- **Mobile (<640px):** Stack steps vertically with compact command blocks and visible step numbers.
- **Tablet (640-1024px):** Two-column grid for four steps.
- **Desktop (>1024px):** Four-column flow with subtle connectors or aligned step markers.

**Accessibility:**
- Role: `list`
- Keyboard: Copyable commands and links should be focusable without trapping users in the flow.
- Announcements: Expose each step number, title, command, and outcome in source order.
- Focus: Focused steps should show the same state as hover and should not depend on connector visuals.


### registry-link-list

Compact list of registry destinations, documentation references, namespaces, or related content links. Optimized for sidebars, detail pages, and post-hero navigation blocks.

**Visual brief:** A utilitarian but polished registry navigation list. It should feel like a trustworthy map of related destinations, not a decorative card grid. Rows should be easy to scan, with clear link affordances, subtle dividers or hover states, and enough helper copy to explain why the destination matters.

**Components:** Link, Badge, icon

**Composition:**
```
RegistryLinkItem = LinkRow > [Icon + TextStack(Title + Description) + Badge? + TrailingIcon]
RegistryLinkList = NavOrList > RegistryLinkItem[]
```

**Layout slots:**
- `link-icon`: Small icon or type marker.
- `link-badge`: Optional count, namespace, or status.
- `link-title`: Destination name.
- `link-description`: One-line helper copy.
  **Layout guidance:**
  - metadata: Counts and namespaces belong in a trailing badge, not mixed into the title.
  - row_density: Keep rows compact. Avoid card-heavy treatment unless each link has substantial context.
  - trailing_affordance: Use an arrow, external-link icon, or subtle badge so links are unmistakable.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Rows may brighten or slide their trailing icon a few pixels on hover. |
| transitions | Filter updates should preserve list position and avoid dramatic reflow. |

**Responsive:**
- **Mobile (<640px):** Single-column full-width rows with titles and helper copy wrapping cleanly.
- **Tablet (640-1024px):** Single or two-column layout depending on available width.
- **Desktop (>1024px):** May use two columns or a sidebar list. Keep row height consistent.

**Accessibility:**
- Role: `navigation`
- Keyboard: Each row should expose one clear link target with a descriptive accessible name.
- Announcements: Destination title and helper copy should be included in the accessible label or nearby description.
- Focus: Focused rows should show an obvious outline or background shift.


### content-card-grid

Responsive grid of registry content cards with optional thumbnail media, strong type identity, builder-friendly descriptions, and a clean source/version/date footer. Used for browsing patterns, themes, blueprints, archetypes, and shells. This pattern owns the card grid, not outer section spacing.

**Visual brief:** Responsive grid of bordered cards that feel editorial, calm, and app-forward. Each card can open with an optional 16:9 screenshot-style thumbnail. The title and description should dominate, with one distinct type chip acting as the only browse-card chip. The footer should feel like a clean authored source line rather than a metadata bucket: source first, then version, then date. If a showcase exists, its CTA should feel obvious and inviting. The overall impression should be curated and useful, not operator-heavy or diagnostic.

**Components:** Card, CardHeader, CardBody, CardFooter, Badge, Button, icon

**Composition:**
```
ContentCard = Card(d-surface, hoverable) > [Thumbnail(optional, 16:9) + TitleRow > [Title(heading4, clickable) + TypeChip(d-annotation, color-coded)] + Description(text-muted, line-clamp-3) + Footer > [SourceLine(mono-data) + Version + PublishDate + ShowcaseAction(optional)]]
EditableCard = ContentCard > FooterSecondary > [StatusBadge + EditButton(d-interactive) + DeleteButton(d-interactive, variant: destructive)]
ContentCardGrid = Grid(d-data, responsive: 1/2/3-col) > ContentCard[]
```

**Layout slots:**
- `card-cta`: One optional showcase CTA with external-link affordance
- `card-meta`: Friendly source line, version, and publish date
- `card-media`: Optional full-width 16:9 thumbnail image. Only render when the content item has an uploaded registry thumbnail.
- `card-title-row`: Title on the left with one color-coded type chip on the right
- `card-description`: Short description with _bodysm _fgmuted, max 3 lines
  **Layout guidance:**
  - grid_layout: Responsive grid: 3 columns desktop, 2 tablet, 1 mobile. Gap: 1rem. Equal-height cards per row. Avoid visual density spikes between cards with thumbnails and cards without thumbnails. Parent workspace layout owns any spacing between this grid and sibling filters, intros, or empty-state lead surfaces.
  - card_content: Do not use browse-card trust chips. Keep only the type chip. The footer should carry the source line first, then version, then date. Showcase CTA should sit clearly below that row when present.
  - card_treatment: Each card uses lum-card-outlined with a type-linked accent and optional media frame. Hover should feel subtle but premium: border intensifies, card lifts slightly, and shadows deepen without turning noisy.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Cards may lift slightly and intensify their border treatment on hover. Showcase CTAs should respond clearly on hover and focus without overwhelming the card. |
| transitions | Filter and sort changes should cross-fade or stagger cards in gently over 180-260ms. Thumbnail appearance should feel polished but restrained. |

**Responsive:**
- **Mobile (<640px):** Single-column card stack. Cards take full width, thumbnails remain 16:9, descriptions show up to three lines, and the footer/source line wraps naturally without overflow.
- **Tablet (640-1024px):** Two-column grid. Thumbnails, title, description, and footer all remain readable without crowded chip rows.
- **Desktop (>1024px):** Three or four column grid depending on container width. Cards feel airy and selective, with one type chip, generous description room, and a clear showcase CTA when present.

**Accessibility:**
- Role: `region`
- Keyboard: Tab should move through cards and showcase CTAs in reading order.; If the whole card is clickable, expose one clear primary interaction target.
- Announcements: Card title, source line, and showcase availability should be available to assistive technology without depending on hover.
- Focus: Focused cards should receive an obvious treatment equivalent to hover, and nested CTAs should remain distinct from the card container.


### command-rail

Horizontal or stacked rail of short command snippets for CLI-driven workflows. Used to expose init, refresh, health, publish, or registry commands near the content they affect.

**Visual brief:** A practical command surface that feels crisp and developer-native without becoming a terminal dump. The command should be the hero of each row, with labels and copy controls kept compact. This pattern should make it obvious what to run next while preserving polish and accessibility.

**Components:** CodeBlock, Button, Badge, icon

**Composition:**
```
CopyButton = Button(icon-only, aria-label, copied-status)
CommandItem = Surface > [Label + CodeSnippet + Meta? + CopyButton]
CommandRail = StackOrGrid > CommandItem[]
```

**Layout slots:**
- `copy-action`: Icon button with copied state.
- `command-meta`: Optional shell, package manager, or target context.
- `command-label`: Short purpose label such as Init, Refresh, Health, or Publish.
- `command-snippet`: One-line monospace command with wrapping protection.
  **Layout guidance:**
  - context: Use badges for shell, package manager, or project target only when they prevent ambiguity.
  - copy_state: Copy buttons should have an accessible label and a copied confirmation state.
  - command_length: Keep commands short enough to scan. Move long explanatory flags into docs or helper text.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Copy actions can briefly swap icon/state. Hover should sharpen the command surface without moving layout. |
| transitions | Copied confirmation should be immediate and fade out after a short delay. |

**Responsive:**
- **Mobile (<640px):** Stack commands vertically. Commands wrap or horizontally scroll inside their own code region without forcing page overflow.
- **Tablet (640-1024px):** Two-column command rail when commands are short.
- **Desktop (>1024px):** Horizontal or two-column rail. Align copy buttons consistently.

**Accessibility:**
- Role: `region`
- Keyboard: Copy buttons should be reachable after each command snippet.
- Announcements: Copied state should be announced with aria-live or an equivalent status pattern.
- Focus: Focus should not enter decorative code tokens one by one. One command and one copy action per item is enough.


### blueprint-anatomy

Explanatory breakdown of a Decantr blueprint contract. Shows sections, routes, features, patterns, guard rules, and generated context as a coherent system rather than a flat JSON file.

**Visual brief:** A contract explanation surface that makes Decantr feel like an intelligent system. It should turn blueprint JSON into a readable mental model: routes, sections, patterns, guard rules, and generated context. The UI should be polished and educational but still operational, with code previews kept tight and legible.

**Components:** Card, Badge, CodeBlock, Accordion, icon

**Composition:**
```
AnatomyList = Stack > AnatomyPart[]
AnatomyPart = ButtonOrDisclosure > [Icon + Title + Purpose + Badges]
ContractPreview = CodeBlockOrStructuredPanel(selectedPart)
BlueprintAnatomy = Grid > [AnatomyList + ContractPreview]
```

**Layout slots:**
- `explanation`: Short prose that connects the part to generated AI context.
- `part-badges`: Small badges for route, section, feature, guard, pack, or pattern.
- `anatomy-list`: Stack of contract parts with icon, title, and one-sentence purpose.
- `contract-preview`: Code or structured preview focused on the selected part.
  **Layout guidance:**
  - part_order: Recommended order: purpose, sections, routes, patterns, features, guard rules, generated packs.
  - mental_model: Explain relationships, not just fields. The user should understand how a blueprint feeds context, health, and implementation.
  - preview_size: Code previews should be cropped or focused. Avoid dumping an entire essence file into this pattern.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Selecting an anatomy part can update the preview with a subtle cross-fade. |
| transitions | Avoid complex animation in code regions; legibility wins. |

**Responsive:**
- **Mobile (<640px):** Single-column anatomy list followed by previews. Accordions are acceptable to prevent long scroll walls.
- **Tablet (640-1024px):** Single-column or two-column if the preview remains readable.
- **Desktop (>1024px):** Two-region layout with sticky or persistent preview when helpful.

**Accessibility:**
- Role: `region`
- Keyboard: Selectable anatomy parts should be reachable in logical order and update the preview without losing focus.
- Announcements: Preview changes should expose the selected anatomy part name.
- Focus: If using tabs or accordions, preserve standard keyboard behavior.


### contract-explorer

Interactive inspector for Decantr contract artifacts such as essence files, execution packs, Project Health reports, schema snippets, and remediation prompts.

**Visual brief:** A small but powerful developer inspector that makes Decantr contracts feel inspectable and trustworthy. The left side should help users navigate contract structure; the right side should render selected JSON, markdown, health findings, or prompts with clear copy/open actions. It should feel like a local studio or internal developer tool, not a decorative code block.

**Components:** Tabs, Tree, CodeBlock, Badge, Button, icon

**Composition:**
```
ActionBar = Flex > [CopyButton + OpenButton? + PromptButton?]
OutlinePane = TreeOrList > ArtifactNode[]
PreviewPane = Panel > [SelectedTitle + Badges + CodeBlockOrMarkdown]
ContractExplorer = InspectorShell > [ArtifactTabs + OutlinePane + PreviewPane + ActionBar]
```

**Layout slots:**
- `preview`: Code or markdown preview of the selected artifact.
- `action-bar`: Copy, open, download, or prompt actions.
- `artifact-tabs`: Tabs for Essence, Packs, Health, Schema, or Prompt.
- `artifact-tree`: Optional tree of sections, pages, findings, or schema nodes.
  **Layout guidance:**
  - actions: Copy and prompt actions should be icon+label or icon-only with tooltips and aria labels.
  - artifact_scope: Keep selected artifact context visible through a title, breadcrumb, or badge.
  - preview_containment: Code/markdown preview must scroll inside its own region and never force page overflow.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Selection changes can cross-fade preview content. Copy actions should show a brief confirmation. |
| transitions | Avoid animated code reflow; preserve reading position when possible. |

**Responsive:**
- **Mobile (<640px):** Tabs appear first, tree collapses into a select or disclosure, preview scrolls horizontally inside its own region.
- **Tablet (640-1024px):** Tabs plus stacked tree and preview.
- **Desktop (>1024px):** Split-pane inspector with fixed navigation width and flexible preview region.

**Accessibility:**
- Role: `region`
- Keyboard: Tabs and tree items should follow standard keyboard behavior.; Preview region should be focusable when it scrolls.
- Announcements: Selection changes should announce the selected artifact title.
- Focus: Copy/open buttons should remain reachable after the preview title and before long code content.


### json-viewer

Artifact viewer for registry contracts with syntax highlighting, line numbers, copy actions, summary metrics, and optional tabs for JSON, commands, and evidence.

**Visual brief:** A premium contract viewer panel with the feel of a polished shadcn-style code surface, but expressed through Decantr treatments and decorators. The header is compact and editorial: title on the left, a small metadata strip in the middle, and copy actions on the right. Every section inside the frame shares a consistent horizontal inset so the title, tabs, cards, and footer read as one curated artifact surface instead of touching the border. Below the header, a segmented tab control can switch between JSON, Commands, and Evidence views. The JSON body uses a stronger `lum-code-block` treatment with an accent top border, subdued line-number gutter, and vivid but restrained syntax colors. The whole panel should feel like a trustworthy artifact explorer, not just a raw textarea dump.

**Components:** Button, icon

**Composition:**
```
Tabs = SegmentedControl(d-interactive) > [JsonTab + CommandsTab + EvidenceTab]
Toolbar = Row(d-data, compact) > [Title + SummaryBadges + ActionButtons]
JsonPane = CodeRegion(mono, syntax-highlighted) > [LineNumbers + JsonTree]
SummaryStrip = Row(d-annotation, compact) > [Lines + Bytes + Schema + RootKeys]
ArtifactViewer = Panel(lum-code-block, stack, padded-frame) > [Toolbar + Tabs + SummaryStrip + JsonPane + Footer]
```

**Layout slots:**
- `tabs`: Segmented tab strip for JSON, Commands, and Evidence views with the same horizontal inset as the toolbar
- `footer`: Optional footer with copy confirmation, notes, or schema guidance
- `header`: Toolbar row with artifact title, summary badges, and copy-to-clipboard Button. Maintain a shared horizontal inset so title and actions never sit flush against the frame.
- `json-content`: Syntax-highlighted JSON with collapsible nodes. Keys in _fgprimary, strings in _fgwarning, numbers in _fgsuccess, booleans in _fgaccent
- `line-numbers`: Gutter column with line numbers, _fgmuted _textxs _mono
- `summary-strip`: Compact metadata row with line count, byte size, schema id, or root key count
  **Layout guidance:**
  - syntax: Syntax highlighting uses theme-accented colors: keys=coral, strings=amber, numbers=cyan, booleans=green, null=muted.
  - toolbar: Header bar: title on the left, summary metrics in the middle, and copy/secondary actions on the right. A small segmented tab strip may sit directly beneath or inside the toolbar. Keep a shared x-axis inset across toolbar, tabs, content, and footer.
  - artifact_summary: Always surface a few useful stats before the raw JSON: line count, byte size, schema id, root key count, or command availability. Summary chips should feel tucked into the frame, not pressed against the edge.
  - viewer_treatment: Use lum-code-block or an equivalent artifact treatment with a dark body, an accent top border, and a compact toolbar. The code panel should feel purposeful and premium, not like a default developer console. The outer frame owns the inset rhythm for every inner band.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Copy actions, tab switches, and collapsible node toggles may animate subtly over 120-180ms. Avoid flashy motion inside code surfaces. |
| transitions | Tab and artifact-state changes should cross-fade or slide minimally so the viewer remains trustworthy and stable. |

**Responsive:**
- **Mobile (<640px):** Full-width viewer with horizontal scroll for deeply nested content. Tabs collapse into a compact segmented control, but the frame still keeps a small internal gutter. Nodes default to collapsed beyond depth 2 and summary metrics wrap into two rows.
- **Tablet (640-1024px):** Standard viewer width with a compact tab strip. Nodes expand to depth 3 by default and summary metrics stay visible without overwhelming the header.
- **Desktop (>1024px):** Full viewer with comfortable width. Tabs, summary metrics, and copy actions all remain visible. Horizontal space accommodates deep nesting without crowding.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves through tabs, copy actions, and expandable nodes.; Arrow keys may navigate tree nodes when the JSON body is rendered as an interactive tree.
- Announcements: Copy success and tab changes should be announced clearly.; Artifact summary metrics should be available before the raw JSON body.
- Focus: Keep focus stable when switching tabs or copying values, and do not drop keyboard users into the middle of a deep JSON tree unexpectedly.


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
  **Layout guidance:**
  - status_badge: Status indicators should read as supporting metadata and wrap gracefully below the title on narrow widths.
  - action_balance: Action controls should support the title rather than overpower it. Keep the title as the primary visual anchor and use compact buttons for secondary actions.
  - shell_alignment: Treat detail-header as a section that sits inside the shell rhythm. It should not recreate shell-level page-width wrappers or duplicate breadcrumb bars already owned by the shell.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Action buttons may use subtle hover and focus transitions. Status badges should remain visually stable rather than animate heavily. |
| transitions | Detail headers can fade up softly with the page container, but avoid dramatic motion that competes with the title hierarchy. |

**Responsive:**
- **Mobile (<640px):** Breadcrumb collapses to back arrow with parent name. Action buttons move below the title and stack full-width. Status badge wraps below the title on its own line.
- **Tablet (640-1024px):** Standard layout. Actions remain inline right of title. Breadcrumb shows full path.
- **Desktop (>1024px):** Full header with all elements comfortably positioned. Generous whitespace above and below.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves through breadcrumbs and action buttons in reading order.
- Announcements: The page title should be announced before supporting metadata and actions.
- Focus: If a route change lands at a detail header, keep the heading reachable as an early focus destination and ensure breadcrumb links remain semantically distinct from actions.


### activity-feed

Chronological list of activity events with avatars, timestamps, and action descriptions. The feed owns its rows and grouping, not the outer section spacing around it.

**Visual brief:** Vertical timeline of activity events grouped by date. Each date group starts with a muted, small-text date header. Individual feed items are horizontal rows: a circular avatar (with fallback initials) on the left, then a content block with the user name in medium-weight text followed by the action description in normal weight, and a relative timestamp (e.g. '2h ago') in small muted text right-aligned or below. Items are separated by subtle dividers or spacing. The compact preset drops avatars and uses small type-indicator icons instead. The detailed preset wraps each item in a bordered card with attachment previews and action buttons (reply, like).

**Components:** Avatar, Badge, Button

**Composition:**
```
FeedItem = Row(d-data-row, hoverable) > [Avatar(fallback-initials) + Content(flex-col) > [UserName(font-medium) + ActionText] + Timestamp(mono-data, text-xs, text-muted)]
DateGroup = Group(d-data) > [DateHeader(d-annotation, text-muted) + FeedItem[]]
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

**Accessibility:**
- Role: `feed`
- Keyboard: Tab moves through feed items and inline actions in chronological order.; Load-more controls remain reachable after the newest visible group.
- Announcements: New activity items should be announced without rereading the full feed.; Date group headers should remain semantically distinct from entries.
- Focus: Do not steal focus when new events arrive. Preserve the reader's current position unless they explicitly choose to jump to the latest item.


### brownfield-scan

A full-bleed read-only Brownfield acquisition surface with a large repository URL control, staged scan progress, evidence cards, score ring, fallback warnings, and next-command rail.

**Visual brief:** The scan surface should feel more like a precise product instrument than a registry catalog page: immersive full-bleed Luminarum background, centered hero, calm safety chips, a generous input dock, and report cards with unmistakable internal spacing.

**Components:** Card, Input, Button, Badge, ConicRing

**Composition:**
```
desktop = full-bleed-hero -> compact-scan-dock -> verdict + metrics -> two-up evidence panels -> findings grid -> command rail
mobile = stacked hero -> full-width input/button -> single-column evidence cards -> compact command rail
```

**Layout slots:**
- `hero`: Full-bleed centered headline, supporting copy, safety guarantee chips, and repository URL form.
- `scan-control`: Large d-control URL input paired with a primary d-interactive submit action.
- `progress`: Staged, polite live-region progress copy with no source-execution reassurance.
- `verdict`: Prominent d-card report summary with a d-conic-ring confidence score.
- `evidence-grid`: Responsive d-card panels for repository evidence, published-site evidence, route map, styling intelligence, findings, and next commands.
**Responsive:**
- **Mobile (<640px):** [object Object]
- **Desktop (>1024px):** [object Object]

**Accessibility:**
- Role: `form and report`
- Keyboard: URL input is reachable before the submit button.; Progress and report updates use polite live regions.; Command copy buttons expose visible copied state.
- Focus: Return focus to the scan form after validation errors; keep report content in document order after submit.


---

## Pages

### homepage (/)

Layout: blueprint-launch-hero → search-filter-bar → featured-launchpad-list → launchpad-flow → registry-link-list

### browse (/browse)

Layout: search-filter-bar → content-card-grid

### browse-type (/browse/:type)

Layout: search-filter-bar → content-card-grid

### detail (/:type/:namespace/:slug)

Layout: blueprint-launch-hero → command-rail → blueprint-anatomy → contract-explorer → json-viewer

### profile (/profile/:username)

Layout: detail-header → content-card-grid → activity-feed

### scan (/scan)

Layout: brownfield-scan

### privacy (/privacy)

Layout: detail-header → registry-link-list

### terms (/terms)

Layout: detail-header → registry-link-list
