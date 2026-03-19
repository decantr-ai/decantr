# Shell Layouts Reference

The Shell component provides configurable layout regions via CSS grid-template-areas.

## Import

```js
import { Shell } from 'decantr/components';
// Or for config utilities:
import { Shell, resolveShellConfig, buildGridTemplate } from 'decantr/components';
```

## API

```js
Shell({
  config: 'sidebar-main',        // preset string or config object
  inset: false,                   // floating panel effect (any sidebar preset)
  navState: collapseSignal,       // signal: 'expanded' | 'rail' | 'hidden'
  onNavStateChange: setter,       // called on responsive collapse
  class: ''
},
  Shell.Header({}, headerContent),
  Shell.Nav({}, sidebarContent),
  Shell.Body({}, mainContent),
  Shell.Footer({}, footerContent),  // optional
  Shell.Aside({}, inspectorPanel)   // optional
)
```

## Sub-Components

| Sub-Component | CSS Class | Grid Area |
|---|---|---|
| `Shell.Header` | `d-shell-header` | `header` |
| `Shell.Nav` | `d-shell-nav` | `nav` |
| `Shell.Body` | `d-shell-body` | `body` |
| `Shell.Footer` | `d-shell-footer` | `footer` |
| `Shell.Aside` | `d-shell-aside` | `aside` |

## 10 Preset Configs

| Preset ID | Grid Areas | Nav Mode |
|---|---|---|
| `sidebar-main` | `[[nav,header],[nav,body]]` | Left sidebar |
| `sidebar-right` | `[[header,nav],[body,nav]]` | Right sidebar |
| `sidebar-main-footer` | `[[nav,header],[nav,body],[nav,footer]]` | Left + footer |
| `sidebar-aside` | `[[nav,header,aside],[nav,body,aside]]` | Left nav + right aside |
| `top-nav-main` | `[[header],[body]]` | Top (nav inside header) |
| `top-nav-footer` | `[[header],[body],[footer]]` | Top + footer |
| `centered` | `[[body]]` | None |
| `full-bleed` | `[[header],[body]]` | Floating header |
| `minimal-header` | `[[header],[body]]` | Slim header |
| `top-nav-sidebar` | `[[header,header],[nav,body]]` | Header spans, left nav below |

## Nav States

- **`expanded`** — full sidebar width (default `240px`)
- **`rail`** — collapsed to icon-only (`64px`)
- **`hidden`** — `0px`, content hidden

Transition is smooth via CSS `transition` on `grid-template-columns`.

## Config Object Schema

```json
{
  "regions": ["header", "nav", "body"],
  "grid": {
    "areas": [["nav", "header"], ["nav", "body"]]
  },
  "nav": {
    "position": "left",
    "width": "240px",
    "collapseTo": "64px",
    "collapseBelow": "md",
    "defaultState": "expanded"
  },
  "header": { "height": "52px", "sticky": true },
  "body": { "scroll": true, "maxWidth": null },
  "footer": { "height": "auto", "sticky": false },
  "aside": { "width": "280px", "collapsible": true }
}
```

## Top Nav Mode

When `nav.position === 'top'`, Shell.Nav children are moved inline into Shell.Header (wrapped in `.d-shell-nav-inline`). The nav grid column is removed. Use `NavigationMenu` or `Cascader` inside Shell.Nav for dropdown menus.

## Responsive Collapse

Set `nav.collapseBelow` to a breakpoint (`sm`/`md`/`lg`/`xl`). Below that width, nav auto-collapses to `rail`. Cleanup is wired to `onDestroy`.

## Grid Area Diagrams

```
sidebar-main:                    sidebar-right:
┌─────┬────────────────┐        ┌────────────────┬─────┐
│     │    HEADER      │        │    HEADER      │     │
│ NAV ├────────────────┤        ├────────────────┤ NAV │
│     │     BODY       │        │     BODY       │     │
└─────┴────────────────┘        └────────────────┴─────┘

sidebar-aside:                   top-nav-main:
┌─────┬──────────┬──────┐       ┌──────────────────────┐
│     │  HEADER  │      │       │  HEADER [+NAV items] │
│ NAV ├──────────┤ASIDE │       ├──────────────────────┤
│     │  BODY    │      │       │       BODY           │
└─────┴──────────┴──────┘       └──────────────────────┘

top-nav-sidebar:
┌──────────────────────┐
│       HEADER         │
├─────┬────────────────┤
│ NAV │     BODY       │
└─────┴────────────────┘
```

## ARIA Attributes

Shell sub-components include semantic ARIA roles for assistive technology:

| Sub-Component | Role | Notes |
|---|---|---|
| `Shell.Header` | `role="banner"` | Page-level banner landmark |
| `Shell.Nav` | `role="navigation"` | Navigation landmark; `aria-label` defaults to `"Main"`, override via prop |
| `Shell.Body` | `role="main"` | Main content landmark |
| `Shell.Footer` | `role="contentinfo"` | Footer landmark |
| `Shell.Aside` | `role="complementary"` | Complementary content landmark |

Additionally, `Shell.Nav` receives `aria-expanded` reactively from the parent Shell — set to `"true"` when the nav state is `expanded`, `"false"` otherwise (rail/hidden).

```js
// Custom aria-label on nav
Shell.Nav({ 'aria-label': 'Admin navigation' }, ...children)
```

## Shell in Generate Engine

The `tools/generate.js` `buildSkeletonApp()` function emits Shell-based layouts for the `sidebar-main` skeleton. The generated code includes:

- **Shell component** with `navState` signal for animated collapse/expand
- **Shell.Nav** with `d-shell-nav-item` / `d-shell-nav-item-active` classes for animated indicator
- **Shell.Header** with `Breadcrumb`, search (Command palette via Cmd+K), notification `Popover`, and user `Dropdown`
- **Shell.Body** with `d-page-enter` fade-in animation
- **Keyboard shortcut**: `Ctrl+\` toggles sidebar between expanded/rail states
- **Recipe decoration**: `applyRecipeToSkeleton()` injects recipe-specific classes (e.g. `cc-mesh`, `cc-frame`, `d-glass`) into Shell regions via `getRecipeDecoration()`

### Nav Sub-Components

Semantic wrappers for nav sections, footer, nested nav, toggle trigger, and badge.

| Sub-Component | CSS Class | Purpose |
|---|---|---|
| `Shell.NavGroup` | `d-shell-nav-group` | Semantic nav section wrapper |
| `Shell.NavGroupLabel` | `d-shell-nav-group-label` | Section label (hides in rail mode) |
| `Shell.NavFooter` | `d-shell-nav-footer` | Anchored bottom section in sidebar |
| `Shell.NavSub` | `d-shell-nav-sub` | Collapsible nested nav items |
| `Shell.Trigger` | `d-shell-trigger` | Visible toggle button for sidebar |
| `.d-shell-nav-badge` | `d-shell-nav-badge` | Badge count (CSS-only, no component) |

#### Shell.NavGroup + Shell.NavGroupLabel

```js
Shell.Nav({},
  Shell.NavGroup({},
    Shell.NavGroupLabel({}, 'OVERVIEW'),
    link({ href: '/', class: 'd-shell-nav-item ...' }, 'Dashboard'),
    link({ href: '/analytics', class: 'd-shell-nav-item ...' }, 'Analytics')
  ),
  Shell.NavGroup({},
    Shell.NavGroupLabel({}, 'MANAGEMENT'),
    link({ href: '/users', class: 'd-shell-nav-item ...' }, 'Users')
  )
)
```

NavGroupLabel automatically hides in rail mode (`.d-shell-nav-rail .d-shell-nav-group-label { display: none }`).

#### Shell.NavFooter

Anchored to the bottom of the sidebar via `margin-top: auto`.

```js
Shell.Nav({},
  // ... nav items ...
  Shell.NavFooter({},
    icon('circle', { class: '_fgsuccess' }),
    text('System Online')
  )
)
```

#### Shell.NavSub

Collapsible nested nav using `createDisclosure` animation.

```js
Shell.NavSub({
  open: false,
  trigger: () => link({ class: 'd-shell-nav-item' }, icon('folder'), text('Projects'))
},
  link({ class: 'd-shell-nav-item' }, 'Project A'),
  link({ class: 'd-shell-nav-item' }, 'Project B')
)
```

#### Shell.Trigger

Accessible toggle button. Wire `onToggle` to the nav state setter.

```js
Shell.Trigger({ onToggle: () => setNavState(s() === 'expanded' ? 'rail' : 'expanded') },
  icon('panel-left')
)
```

#### Nav Badge (CSS-only)

Add `d-shell-nav-badge` to a span inside a nav item. Collapses to a dot in rail mode.

```js
link({ class: 'd-shell-nav-item' },
  icon('bell'),
  text('Notifications'),
  span({ class: 'd-shell-nav-badge' }, '3')
)
```

### Inset Variant

The `inset` prop creates a floating panel effect where the main content area gets distributed border-radius, while the nav appears as part of the chrome.

```js
Shell({ config: 'sidebar-main', inset: true, navState, onNavStateChange: setNavState },
  Shell.Nav({}, ...),
  Shell.Header({}, ...),
  Shell.Body({}, ...)
)
```

Orthogonal to all 10 presets — any sidebar preset can use it. Configure per-page via `"inset": true` in essence structure entries.

The `--d-shell-inset-gap` CSS variable controls the padding around the content panel (default: `var(--d-sp-2)`).

### Nav Item Classes

Use `d-shell-nav-item` on all sidebar nav links. Add `d-shell-nav-item-active` on the current route to get an animated left-edge indicator pill:

```js
link({ href: item.href, class: () =>
  css(`d-shell-nav-item _r2 _trans ${
    isActive ? 'd-shell-nav-item-active _bgprimary/10 _fgprimary' : '_fgfg'
  }`)
})
```
