# Docs Redesign — Prompt-First Documentation

**Goal**: Replace the current utilitarian docs section with a visually stunning, prompt-first documentation experience that aligns with Decantr's AI-native identity and Auradecantism styling.

**Core Insight**: Decantr is a framework for process, not coding. The docs should teach humans how to work with AI to build with Decantr, not just document APIs.

---

## Core Concept

**"Prompt-First Documentation"** — Docs for humans working with AI, not traditional API docs.

- **Primary audience**: Developers using LLMs to build with Decantr
- **Mental model**: "Here's how to talk to your AI about Decantr"
- **Structure**: A proper docs explorer with sidebar navigation (not a wizard or gated content)
- **Visual identity**: Full Auradecantism styling — glass effects, glows, gradients — but information-dense, not wasteful

---

## Layout Architecture

### Structure

**Shadcn-style sidebar layout** with Auradecantism elevation:

```
┌─────────────────────────────────────────────────────────────┐
│                      Site Header                            │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │              Content Area                    │
│   (260px)    │                                              │
│              │                                     ┌───────┐│
│  - Search    │                                     │  TOC  ││
│  - Sections  │                                     │(sticky)│
│  - Accordions│                                     └───────┘│
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- **Left sidebar** (fixed ~260px): Accordion sections with Decantr icons, glow on active state
- **Content area**: Primary focus, information-dense, sleek but not wasteful
- **Right TOC** (optional, sticky): Table of contents for longer pages (3+ headings)
- **Search**: Command palette (Cmd+K) at top of sidebar
- **Mobile**: Sidebar collapses to hamburger menu

### Implementation Approach

**Build purpose-built, extract patterns after**:

1. Build docs-specific layout components not constrained by existing Shell/DocsShell patterns
2. Refactor underlying Shell component if needed to support this properly
3. After docs work, extract reusable patterns to registry for community use

This avoids premature abstraction while ensuring patterns get extracted.

---

## Sidebar Navigation Structure

**Prompt-first curriculum** organized by user journey:

```
[Search icon] Search docs...                    [Cmd+K]
───────────────────────────────────────────────────────
START HERE                                    (highlighted)
  [zap]       Quick Setup
  [message]   Your First Prompt
  [wine]      The Decantation Process

▼ BUILDING
    [file]      Adding Pages
    [sparkles]  Adding Features
    [lightbulb] Prompt Patterns
    [file-code] Working with Essence

▶ STYLING
    [palette]   Themes & Recipes
    [droplet]   Customizing Colors
    [wand]      Visual Effects

▶ CUSTOMIZING
    [puzzle]    Creating Patterns
    [brush]     Creating Themes
    [package]   Publishing to Registry

───────────────────────────────────────────────────────
▶ REFERENCE
    [blocks]    Components
    [layout]    Patterns
    [grid]      Atoms & Tokens
    [code]      API
```

### Visual Treatment

- **Icons**: Decantr icons (Lucide-style SVGs), never emojis
- **Active state**: Glow effect with primary color background
- **Start Here section**: Colored accent (primary color gradient on left border)
- **Collapsed sections**: Muted but readable
- **Divider**: Subtle gradient between curriculum and reference sections
- **Hover states**: Background highlight, smooth transitions

---

## Docs Home Page

Landing page at `/docs` with visual impact but information-dense:

### Hero Strip (compact)

```
┌─────────────────────────────────────────────────────────────┐
│  [subtle aura orb]                                          │
│                                                             │
│              Learn to Build with AI                         │
│         The prompt-first guide to Decantr                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Headline with subtle gradient or accent
- Brief subtext
- Optional subtle aura orb for Auradecantism flavor
- Not wasteful — compact and purposeful

### Quick Start Cards (2-3 cards)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ [zap]           │  │ [message]       │  │ [wine]          │
│ Quick Setup     │  │ First Prompt    │  │ The Process     │
│ 2 min install   │  │ Build something │  │ Understand flow │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

- Glass card styling
- Icon + title + brief description
- Links to Start Here section pages

### Pathway Cards (below)

```
┌───────────────────────────────────────────────────────────┐
│  Building  │  Styling  │  Customizing  │  Reference       │
│  [icon]    │  [icon]   │  [icon]       │  [icon]          │
│  desc...   │  desc...  │  desc...      │  desc...         │
└───────────────────────────────────────────────────────────┘
```

- Links to each major section
- Icon + title + brief description
- Subtle glass styling

**Note**: This is the only page with the bento-ish card layout. Inner pages are clean prose.

---

## Inner Page Content

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Docs / Building / Adding Pages              (breadcrumb)    │
├─────────────────────────────────────────────────────────────┤
│                                                    ┌───────┐│
│ # Adding Pages                                     │On this││
│ ─────────────────                                  │ page  ││
│                                                    │       ││
│ Content here...                                    │ - Sec1││
│                                                    │ - Sec2││
│ ## Section 1                                       │ - Sec3││
│                                                    └───────┘│
│ More content...                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Content Styling

- **Title**: h1 with subtle gradient underline or accent
- **Breadcrumb**: `Docs / Section / Page` navigation
- **Prose**: Clean markdown-style content
- **Code blocks**: Auradecantism-styled with glass effect, syntax highlighting, copy button

### Content Patterns

**Prompt examples** — styled callout boxes:
```
┌─────────────────────────────────────────────────────────────┐
│ [message icon] Try this prompt:                             │
│                                                             │
│ "Add a settings page with user profile form and             │
│  notification preferences"                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tips/warnings** — glass-styled alert cards
**Related pages** — links section at bottom of content

### Right Sidebar (TOC)

- Sticky "On this page" with anchor links
- Only appears when page has 3+ headings
- Highlights current section on scroll

---

## File Changes

### Removing

| File | Reason |
|------|--------|
| `src/registry/archetypes/docs-explorer.json` | No longer needed |
| `docs/src/pages/docs-home.js` | Replaced with new prompt-first home |
| `docs/src/layouts/docs-layout.js` | Replaced with new sidebar layout |

### Creating

| File | Purpose |
|------|---------|
| `docs/src/layouts/docs-shell.js` | New purpose-built docs layout |
| `docs/src/components/docs-sidebar.js` | Accordion nav with icons, search, glow states |
| `docs/src/components/docs-toc.js` | Right-side table of contents |
| `docs/src/pages/docs-home.js` | New prompt-first landing page |
| `docs/src/pages/docs/*.js` | Content pages (can scaffold with placeholders) |

### Potentially Refactoring

| File | If Needed |
|------|-----------|
| `src/components/Shell.js` | If current Shell limits this layout |
| `docs/src/layouts/site-shell.js` | For docs integration |

---

## Implementation Phases

### Phase 1 — Foundation

1. Build new `docs-shell.js` layout (sidebar + content + optional TOC)
2. Build `docs-sidebar.js` with:
   - Accordion sections
   - Decantr icons
   - Search trigger (Cmd+K)
   - Glow active states
   - Mobile collapse
3. Refactor core Shell if needed for flexibility

### Phase 2 — Pages

1. New `docs-home.js` with:
   - Compact hero strip
   - Quick start cards
   - Pathway cards
2. Scaffold content pages with placeholder content for each nav item
3. Style code blocks, callouts, prose with Auradecantism

### Phase 3 — Polish

1. Cmd+K search integration (command palette)
2. Right-side TOC for long pages (scroll spy)
3. Mobile responsive (sidebar collapse to hamburger)
4. Transitions and micro-interactions
5. Breadcrumb navigation

### Phase 4 — Pattern Extraction

1. Extract `docs-shell` pattern to registry
2. Extract `docs-sidebar` pattern to registry
3. Extract `docs-toc` pattern to registry
4. Document patterns for community reuse as docs recipe

---

## Design Principles

1. **Information-dense, not wasteful** — No huge blobby cards; sleek and purposeful
2. **Prompt-first** — Teach how to work with AI, not just document APIs
3. **Auradecantism everywhere** — Glass, glows, gradients — but subtle and functional
4. **Icons, never emojis** — Use Decantr icon suite consistently
5. **Curriculum above, reference below** — Clear separation of learning vs. lookup
6. **Build right, extract later** — Purpose-built first, patterns second

---

## Success Criteria

- Docs home page feels cohesive with decantr.ai homepage and showcase
- Navigation is intuitive for someone learning Decantr with AI
- Visual styling matches Auradecantism identity
- Information density is high — no wasted space
- Patterns extracted are reusable for community docs projects
