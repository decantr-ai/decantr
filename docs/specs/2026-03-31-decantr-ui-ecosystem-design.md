# Decantr UI Ecosystem Design

**Date:** 2026-03-31
**Status:** Approved
**Scope:** `packages/ui-catalog`, `apps/workbench`, `apps/ui-site`

---

## 1. Overview

This spec defines the architecture for surfacing `@decantr/ui` as a standalone UI framework with two consumer-facing surfaces:

1. **Public showcase site** (`apps/ui-site/`) — a marketing and reference site at `ui.decantr.ai`, built entirely with `@decantr/ui` (dog-fooding), deployed as static HTML to GitHub Pages.
2. **Local development workbench** (`apps/workbench/`) — a Storybook-like dev tool for building, testing, and exploring components locally, also built with `@decantr/ui`.

Both apps consume a shared **component catalog** (`packages/ui-catalog/`) that defines demo stories, variant showcases, playground controls, and code examples for every component, chart, and icon.

### Positioning

`@decantr/ui` is positioned as an **independent UI framework** — usable on its own without the Decantr design intelligence platform — but clearly "by Decantr" with first-class integration into the design intelligence layer (essence, blueprints, guards, themes). Analogous to how Next.js relates to Vercel: independently viable, but deepest integration with the parent platform.

The Decantr platform itself remains framework-agnostic (React, Vue, Svelte, Tailwind). `@decantr/ui` is Decantr's native target.

### Source of Truth

Component source code stays in the existing monorepo packages (`packages/ui`, `packages/ui-chart`, `packages/css`). No separate repository is needed. Unlike `decantr-content` (which holds authored JSON artifacts synced via GitHub Actions → API → Supabase), `@decantr/ui` is source code distributed via npm. The monorepo provides the tight feedback loop needed for interdependent packages (compiler, CSS atoms, components, charts).

---

## 2. Architecture

### Monorepo Layout

```
decantr-monorepo/
├── packages/
│   ├── ui/                     ← @decantr/ui (107 components, compiler, reactivity) — EXISTING
│   ├── ui-chart/               ← @decantr/ui-chart (25 chart types, 3 renderers) — EXISTING
│   ├── css/                    ← @decantr/css (atomic CSS runtime, theme registry) — EXISTING
│   ├── ui-catalog/             ← NEW: component stories, demo definitions, metadata
│   ├── essence-spec/           ← existing
│   ├── registry/               ← existing
│   ├── core/                   ← existing
│   ├── mcp-server/             ← existing
│   ├── cli/                    ← existing
│   └── vite-plugin/            ← existing
├── apps/
│   ├── api/                    ← existing (Hono + Supabase + Stripe on Fly.io)
│   ├── web/                    ← existing (registry.decantr.ai — Next.js)
│   ├── ui-site/                ← NEW: public showcase (Decantr-native, → GitHub Pages)
│   └── workbench/              ← REVIVE: local dev tool (Decantr-native, localhost only)
```

### Dependency Flow

```
apps/ui-site  ─┐
                ├──→ packages/ui-catalog ──→ @decantr/ui
apps/workbench ─┘                        ──→ @decantr/ui-chart
                                          ──→ @decantr/css

Both apps also depend on:
  @decantr/essence-spec (schema + guard validation)
  decantr-content (archetypes, themes, shells, patterns — via registry)
```

### Key Principle

The three UI packages (ui, ui-chart, css) are the **source of truth** — they ship to npm. The catalog describes **how to present them**. The two apps are thin shells that render the catalog with different chrome — dev tools for workbench, marketing polish for the showcase site.

---

## 3. packages/ui-catalog

### Purpose

A shared package that defines demo stories for every component, chart, icon, and CSS feature in the `@decantr/ui` ecosystem. Both apps import this package and render its stories with their own chrome.

### Structure

```
packages/ui-catalog/
├── package.json
└── src/
    ├── index.js              ← exports: getAllStories, getStory, getCategories, searchStories
    ├── schema.js             ← story format definition + validation
    ├── renderer.js           ← renders a story definition → live Decantr component tree
    └── stories/
        ├── components/
        │   ├── Button.story.js
        │   ├── Modal.story.js
        │   ├── DataTable.story.js
        │   └── ...(107 component stories)
        ├── charts/
        │   ├── BarChart.story.js
        │   ├── LineChart.story.js
        │   └── ...(25 chart stories)
        ├── icons/
        │   └── IconGallery.story.js
        └── css/
            ├── Atoms.story.js
            ├── ThemeSwitcher.story.js
            └── Styles.story.js
```

### Story Format

```js
// Example: Button.story.js
import { Button } from '@decantr/ui/components'

export default {
  // ─── Identity ───
  component: Button,
  title: 'Button',
  category: 'components/original',
  description: 'Primary action trigger with multiple variants and sizes.',

  // ─── Variants (rendered as a grid) ───
  variants: [
    { name: 'Primary',     props: { variant: 'primary', children: 'Click me' } },
    { name: 'Secondary',   props: { variant: 'secondary', children: 'Click me' } },
    { name: 'Ghost',       props: { variant: 'ghost', children: 'Click me' } },
    { name: 'Destructive', props: { variant: 'destructive', children: 'Delete' } },
    { name: 'Disabled',    props: { variant: 'primary', disabled: true, children: 'Disabled' } },
  ],

  // ─── Playground (interactive prop editor) ───
  playground: {
    defaults: { variant: 'primary', size: 'md', children: 'Click me' },
    controls: {
      variant:  { type: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
      size:     { type: 'select', options: ['sm', 'md', 'lg'] },
      disabled: { type: 'boolean' },
      children: { type: 'text' },
    },
  },

  // ─── Code Examples ───
  usage: [
    {
      title: 'Basic',
      code: "import { Button } from '@decantr/ui/components'\n\nButton({ variant: 'primary', children: 'Save' })",
    },
    {
      title: 'With Icon',
      code: "Button({ variant: 'ghost', children: [Icon({ name: 'trash' }), 'Delete'] })",
    },
  ],
}
```

### Design Decisions

- **Plain JS, no build step** — stories are ES modules that export objects. No special compiler, no MDX.
- **Co-located renderer** — `renderer.js` takes a story definition and produces a live Decantr component tree. Both apps use this renderer, adding their own chrome around it.
- **Category hierarchy** — mirrors the existing component organization in `@decantr/ui` (original, general, layout, navigation, form, data-display, feedback, media, utility).
- **Extensible** — third-party developers could write stories for their own `@decantr/ui` components using the same format.

### Boundaries

**IN the catalog:** story definitions (props, variants, categories), playground control schemas, code usage examples, story renderer, query API (getAllStories, getByCategory, searchStories).

**NOT in the catalog:** component source code (stays in `@decantr/ui`), marketing copy/SEO/branding (showcase site's job), dev tools/hot-reload/debug panels (workbench's job), build tooling.

---

## 4. apps/workbench

### Purpose

A local development tool for building, testing, and exploring `@decantr/ui` components. Built entirely with the Decantr stack (dog-fooding). Runs on localhost only.

### Structure

```
apps/workbench/
├── essence.json              ← real v3 essence
├── package.json
└── src/
    ├── index.js              ← entry point, mounts via @decantr/ui runtime
    ├── app.js                ← root component: sidebar + main panel router
    ├── shell/
    │   ├── sidebar.js        ← component tree nav (category → component → variant)
    │   ├── toolbar.js        ← theme picker, density toggle, a11y mode, dark/light
    │   └── search.js         ← fuzzy search across all stories
    ├── views/
    │   ├── isolation.js      ← Phase 1: single component + variants grid
    │   ├── playground.js     ← Phase 2: live prop editor + code preview
    │   └── explorer.js       ← Phase 3: design system dashboard
    └── panels/
        ├── props-panel.js    ← live prop inspector (reads playground controls)
        ├── source-panel.js   ← shows component source from @decantr/ui
        ├── css-panel.js      ← shows computed atoms + injected CSS
        └── state-panel.js    ← signal inspector (reactive state debugger)
```

### Essence File

```json
{
  "version": "3",
  "dna": {
    "archetype": "developer-tool",
    "theme": {
      "style": "auradecantism",
      "mode": "dark",
      "recipe": "clean",
      "shape": "rounded"
    },
    "personality": ["technical", "minimal", "focused"],
    "platform": { "type": "spa", "routing": "hash" },
    "density": { "level": "comfortable", "content_gap": "md" },
    "accessibility": { "wcag_level": "AA" }
  },
  "blueprint": {
    "pages": [
      {
        "id": "main",
        "shell": "sidebar-detail",
        "layout": [
          { "zone": "sidebar", "pattern": "component-tree" },
          { "zone": "main", "pattern": "story-renderer" },
          { "zone": "aside", "pattern": "inspector-panels" }
        ]
      }
    ],
    "features": ["theme-switching", "search", "hot-reload"]
  },
  "dna_enforcement": "error",
  "blueprint_enforcement": "warn",
  "guard": { "mode": "guided" }
}
```

### Fully Dog-Fooded

The workbench uses the **complete Decantr stack**:

**Design Intelligence Layer:**
- Real `essence.json` with archetype, theme DNA, guard mode
- Blueprint with real shells and layout zones
- Theme resolved through the theme registry
- DNA and blueprint guard enforcement active
- `@decantr/vite-plugin` drift detection

**UI Framework Layer:**
- `@decantr/ui` runtime — `h()`, `mount()`, signal reactivity
- `@decantr/ui` components — sidebar, tabs, search use real components
- `@decantr/css` atoms — `_flex`, `_col`, `_gap4`, theme tokens
- `@decantr/ui` router — hash-based routing for SPA
- Compiler dev mode — hot-reload via `compiler/dev.js`

The workbench serves as both a development tool and a **reference implementation** — the canonical example of a fully Decantr-native application.

### Three Views (phased)

**Phase 1 — Component Isolation (priority):**
Select a component from the sidebar. See all its variants rendered in a grid. Switch themes, density, and mode. Components live-reload as you edit source files. CSS inspector panel shows computed atoms.

**Phase 2 — Playground:**
Interactive prop editor driven by the story's playground controls. Tweak every prop, see the component update live. Copy the resulting code snippet. Signal state inspector.

**Phase 3 — Design System Explorer:**
Bird's-eye view of the full system. Theme gallery (all themes side-by-side), density comparison (same component at 3 densities), colorblind simulation modes, WCAG contrast checker per theme, full icon gallery with search.

### Layout

Three-panel layout:
- **Left sidebar** — component tree nav grouped by category, collapsible sections, fuzzy search
- **Main area** — variant grid (isolation), prop editor + preview (playground), or system dashboard (explorer)
- **Right panel** — inspector with props, CSS atoms, and signal state

### Running

```bash
pnpm --filter workbench dev    # localhost, hot-reload
```

No deployment needed. Local only.

---

## 5. apps/ui-site

### Purpose

The public-facing showcase website for `@decantr/ui` at `ui.decantr.ai`. Built entirely with the Decantr stack (dog-fooding). Statically generated and deployed to GitHub Pages.

### Structure

```
apps/ui-site/
├── essence.json              ← real v3 essence
├── package.json
└── src/
    ├── index.js              ← entry, mounts via @decantr/ui runtime
    ├── app.js                ← root component, history-based router
    ├── pages/
    │   ├── home.js           ← landing page — hero, value props, quick demos
    │   ├── getting-started.js ← installation, first component, hello world
    │   ├── components/
    │   │   ├── index.js      ← component gallery (grid of all categories)
    │   │   └── [slug].js     ← individual component page (from catalog)
    │   ├── charts/
    │   │   ├── index.js      ← chart gallery
    │   │   └── [slug].js     ← individual chart page
    │   ├── icons.js          ← icon gallery with search + copy
    │   ├── css.js            ← atomic CSS reference + theme playground
    │   ├── examples.js       ← full-page example apps built with @decantr/ui
    │   └── why.js            ← framework comparison, benchmarks, philosophy
    ├── shell/
    │   ├── nav.js            ← top nav: home, components, charts, icons, css, docs
    │   ├── sidebar.js        ← docs/component sidebar nav
    │   └── footer.js         ← links, github, npm
    ├── content/
    │   └── docs/             ← markdown/JS docs: concepts, API reference, guides
    └── build.js              ← SSG build script → static HTML for GitHub Pages
```

### Essence File

```json
{
  "version": "3",
  "dna": {
    "archetype": "documentation-site",
    "theme": {
      "style": "auradecantism",
      "mode": "dark",
      "recipe": "clean",
      "shape": "rounded"
    },
    "personality": ["polished", "confident", "technical"],
    "platform": { "type": "static", "routing": "history" },
    "density": { "level": "comfortable", "content_gap": "lg" },
    "accessibility": { "wcag_level": "AA" }
  },
  "blueprint": {
    "pages": [
      {
        "id": "home",
        "shell": "marketing",
        "layout": [
          { "zone": "hero", "pattern": "hero" },
          { "zone": "main", "pattern": "feature-grid" },
          { "zone": "cta", "pattern": "cta-section" }
        ]
      },
      {
        "id": "components",
        "shell": "sidebar-detail",
        "layout": [
          { "zone": "sidebar", "pattern": "component-nav" },
          { "zone": "main", "pattern": "story-renderer" }
        ]
      }
    ],
    "features": ["theme-switching", "search", "copy-to-clipboard"]
  },
  "dna_enforcement": "error",
  "blueprint_enforcement": "warn",
  "guard": { "mode": "strict" }
}
```

### Site Map

**Marketing pages:**
- `/` — Landing page (hero, value props, live interactive demos)
- `/why` — Framework comparison, benchmarks, design philosophy
- `/getting-started` — Install, first component, hello world tutorial
- `/examples` — Full-page example apps built with `@decantr/ui`

**Reference pages (catalog-driven):**
- `/components` — Component gallery grid
- `/components/[slug]` — Individual component (variants, playground, code examples)
- `/charts` — Chart gallery
- `/charts/[slug]` — Individual chart page
- `/icons` — Icon gallery with search and copy
- `/css` — Atomic CSS reference and theme playground

### Build & Deploy

- **SSG build** — `build.js` crawls all routes, renders each page with `@decantr/ui` SSR, outputs static HTML + CSS + JS to `dist/`
- **GitHub Pages** — GitHub Action on push to main: build → deploy to `gh-pages` branch
- **Domain** — `ui.decantr.ai` (CNAME to GitHub Pages)
- **Dev mode** — `pnpm --filter ui-site dev` runs locally with hot-reload

### Showcase vs Workbench — Same Catalog, Different Chrome

| Aspect | Workbench (developer) | Showcase (public) |
|--------|----------------------|-------------------|
| Chrome | Dev tools + inspector panels | Marketing copy + descriptions |
| Features | Hot-reload + signal debugger | Code examples + copy buttons |
| Rendering | Raw component rendering | Polished presentation |
| Routing | Hash routing (SPA) | History routing (clean URLs) |
| Hosting | localhost only | Static build → GitHub Pages |
| Guard mode | `guided` | `strict` |

---

## 6. Content Evolution

Building these apps will reveal gaps in the existing content types stored in `decantr-content`. New archetypes, patterns, and shells will be created as needed. Expected new content:

**Archetypes:**
- `developer-tool` — for the workbench and similar developer-facing apps
- `documentation-site` — for the showcase and similar docs/marketing sites

**Shells:**
- `sidebar-detail` — three-panel layout (sidebar, main, aside) if not already present
- `marketing` — hero + main + CTA zones for landing pages

**Patterns:**
- `component-tree` — category-grouped tree navigation
- `story-renderer` — renders catalog stories in a display context
- `inspector-panels` — tabbed panel with props/CSS/state inspectors
- `component-nav` — sidebar navigation for component reference pages

This is the intended feedback loop:

```
Build real app → Discover missing content → Create archetype/pattern/shell
→ Publish to registry → Use in app → Repeat
```

---

## 7. Delivery Phases

### Phase 1: Foundation (unblocks everything else)

**1a. packages/ui-catalog:**
- Story schema definition and validation
- Story renderer (story definition → live Decantr component tree)
- Query API: `getAllStories()`, `getStory(slug)`, `getCategories()`, `searchStories(query)`
- First 10–15 component stories covering core components (Button, Input, Modal, Card, Tabs, Table, etc.)

**1b. apps/workbench — Isolation View:**
- Real `essence.json` with full Decantr stack
- Sidebar nav with category tree
- Variant grid rendering from catalog stories
- Theme/density/mode toolbar
- Hot-reload via compiler dev mode

### Phase 2: Depth (rich developer experience)

**2a. Workbench — Playground View:**
- Interactive prop editor generated from story playground controls
- Live component preview + code output panel
- Signal state inspector
- CSS atoms panel

**2b. Remaining catalog stories:**
- All 107 component stories
- All 25 chart stories
- Icon gallery story
- CSS/theme stories

### Phase 3: Polish & Public (ship the showcase)

**3a. apps/ui-site — Showcase:**
- Landing page + marketing pages (why, getting-started, examples)
- Component/chart/icon reference pages (catalog-driven)
- SSG build pipeline → GitHub Pages
- `ui.decantr.ai` domain setup
- GitHub Action for automated deploy on push

**3b. Workbench — Explorer View:**
- Design system dashboard
- Theme gallery (all themes side-by-side)
- Density level comparison
- Accessibility audit (WCAG contrast, colorblind simulation)

---

## 8. What Stays the Same

No existing packages or apps are moved or restructured:

- `packages/ui`, `packages/ui-chart`, `packages/css` — unchanged, remain the source of truth
- `apps/web` — `registry.decantr.ai` stays as-is (Next.js + Supabase)
- `apps/api` — Hono API stays as-is (Fly.io)
- `decantr-content` — stays as separate repo, grows with new content types as needed
- All other packages (`essence-spec`, `registry`, `core`, `mcp-server`, `cli`, `vite-plugin`) — unchanged
