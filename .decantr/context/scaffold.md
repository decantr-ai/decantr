# Scaffold: workbench-core

**Blueprint:** workbench
**Theme:** auradecantism
**Personality:** Technical design-system workbench for power users. Dense, IDE-like layout with multi-panel navigation. Monospace typography for code and data, system fonts for UI labels. The workspace splits into resizable panes — component tree on the left, live preview center, property inspector right. Catalog is a browsable grid with instant search. Everything responds to keyboard shortcuts. Command palette for quick navigation. Think VS Code crossed with Storybook. Lucide icons. No wasted space.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Technical and efficient. Speaks to design system engineers.
**CTA verbs:** Inspect, Browse, Preview, Configure, Export, Search
**Avoid:** Submit, Click here, Please enter, Buy, Subscribe
**Empty states:** Technical and helpful. An empty component list should explain how to register components or link to documentation.
**Errors:** Developer-friendly. Show error codes, stack traces for component render failures, and link to relevant docs.
**Loading states:** Code skeleton blocks with line-height placeholders. Component preview areas show a subtle grid pattern while loading.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** workbench-core + workbench-catalog + workbench-inspector + auth-flow + settings

### Zones

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — sidebar-aside shell
  Archetypes: workbench-core
  Purpose: Multi-panel IDE workspace with split-pane layout, command palette, and component detail view. The primary workspace for design system power users.
  Features: keyboard-shortcuts, split-pane, command-palette

**App (auxiliary)** — sidebar-main shell
  Archetypes: workbench-catalog, workbench-inspector, settings
  Purpose: Component and pattern catalog browser for the design-system workbench. Browsable grid with instant search, detail views with JSON inspection. Property inspector and live preview for the design-system workbench. Editable form sections for component properties with real-time preview in split-pane layout. Application settings and preferences page
  Features: search, filtering, live-preview, editing

### Zone Transitions

  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)

### Default Entry Points

  Anonymous users enter: gateway
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| workbench-core | primary | sidebar-aside | workspace, component-detail | keyboard-shortcuts, split-pane, command-palette |
| workbench-catalog | auxiliary | sidebar-main | catalog, catalog-detail | search, filtering |
| workbench-inspector | auxiliary | sidebar-aside | inspector, preview | live-preview, editing |
| auth-flow | gateway | centered | login, register, forgot-password | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| /login | auth-flow | login |
| /catalog | workbench-catalog | catalog |
| /preview | workbench-inspector | preview |
| /register | auth-flow | register |
| /settings | settings | settings |
| /inspector | workbench-inspector | inspector |
| /workspace | workbench-core | workspace |
| /catalog/:id | workbench-catalog | catalog-detail |
| /workspace/:id | workbench-core | component-detail |
| /forgot-password | auth-flow | forgot-password |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-workbench-core.md
- .decantr/context/section-workbench-catalog.md
- .decantr/context/section-workbench-inspector.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| auth-form | auth-flow/login, auth-flow/register, auth-flow/forgot-password |

## SEO Hints

**Schema.org types:** WebApplication, SoftwareApplication
**Meta priorities:** description, og:title, og:description

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
