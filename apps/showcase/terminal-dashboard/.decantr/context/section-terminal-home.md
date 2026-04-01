# Section: terminal-home

**Role:** primary | **Shell:** terminal-split | **Archetype:** terminal-home
**Description:** Main terminal dashboard view with split panes, log streaming, metrics, and command input. Core interface for CLI-style developer tools.

---

## Guard Rules

| Rule | Scope | Severity | Description |
|------|-------|----------|-------------|
| Style guard | DNA | error | Code must use the terminal theme |
| Recipe guard | DNA | error | Visual recipe must match terminal |
| Density guard | DNA | error | Content gap must match essence density |
| Accessibility guard | DNA | error | Must meet WCAG level from essence |
| Structure guard | Blueprint | warn | Pages must exist in essence structure |
| Layout guard | Blueprint | warn | Pattern order must match essence layout |
| Pattern existence | Blueprint | warn | All patterns must exist in registry |

**Guard mode:** strict

---

## Theme: terminal

```css
/* No theme data available */
:root {
  --d-primary: #6366f1;
  --d-secondary: #a1a1aa;
  --d-accent: #f59e0b;
  --d-bg: #18181b;
  --d-surface: #1f1f23;
  --d-surface-raised: #27272a;
  --d-border: #3f3f46;
  --d-text: #fafafa;
  --d-text-muted: #a1a1aa;
}

```

---

## Decorators (terminal recipe)

No decorators defined.

---

## Zone Context

This section is in the **App** zone (terminal-split shell).

## Composition Topology

**Intent:** terminal-home + log-viewer + metrics-monitor + config-editor + marketing-devtool + auth-full + legal

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-devtool, legal
  Purpose: Developer tool landing page with terminal-styled hero, feature highlights, and ASCII art elements. Marketing page that maintains the terminal aesthetic. Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.
  Tone: technical, retro, focused, immersive
  Features: terminal-hero, ascii-demo, code-examples, installation-guide, toc-navigation, print-friendly, smooth-scroll

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Tone: technical, retro, focused, immersive
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — terminal-split shell
  Archetypes: terminal-home
  Purpose: Main terminal dashboard view with split panes, log streaming, metrics, and command input. Core interface for CLI-style developer tools.
  Tone: technical, retro, focused, immersive
  Features: split-panes, log-streaming, metrics, command-input, keyboard-shortcuts, command-palette

**App (auxiliary)** — terminal-split shell
  Archetypes: log-viewer, metrics-monitor, config-editor
  Purpose: Dedicated log streaming interface with filtering, search, and real-time updates. Focus view for log analysis and monitoring. System metrics dashboard with ASCII charts, gauges, and real-time updates. Terminal-style monitoring interface. Configuration file editor with tree navigation, diff view, and terminal integration. For managing app configuration in a terminal interface.
  Tone: technical, retro, focused, immersive
  Features: log-streaming, log-filtering, log-search, log-levels, auto-scroll, export-logs, realtime-metrics, ascii-charts, sparklines, threshold-alerts, historical-data, file-tree, syntax-highlight, diff-view, search-replace, undo-redo, auto-save

### Zone Transitions

  Public → Gateway: conversion (authentication)
  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)
  App → Public: navigation (external)

### Default Entry Points

  Anonymous users enter: public zone
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


---

## Features

split-panes, log-streaming, metrics, command-input, keyboard-shortcuts, command-palette

---

## Personality

technical, retro, focused, immersive

---

## Constraints

- **mode:** dark_only
- **borders:** ascii_box_drawing
- **corners:** sharp_only
- **effects:** [object Object]
- **shadows:** none
- **typography:** monospace_only

---

## Pages

### home (/app)

Layout: status → main-split → hotkeys
