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
