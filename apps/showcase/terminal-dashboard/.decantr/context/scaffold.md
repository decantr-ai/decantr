# Scaffold: terminal-home

**Blueprint:** 
**Theme:** terminal | **Recipe:** terminal
**Personality:** technical, retro, focused, immersive
**Guard mode:** creative (no enforcement during initial scaffolding)

## App Topology

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


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| terminal-home | primary | terminal-split | home | split-panes, log-streaming, metrics, command-input, keyboard-shortcuts, command-palette |
| log-viewer | auxiliary | terminal-split | logs, grouped | log-streaming, log-filtering, log-search, log-levels, auto-scroll, export-logs |
| metrics-monitor | auxiliary | terminal-split | metrics, detail | realtime-metrics, ascii-charts, sparklines, threshold-alerts, historical-data |
| config-editor | auxiliary | terminal-split | config, diff | file-tree, syntax-highlight, diff-view, search-replace, undo-redo, auto-save |
| marketing-devtool | public | top-nav-footer | home, docs | terminal-hero, ascii-demo, code-examples, installation-guide |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| legal | public | top-nav-footer | privacy, terms, cookies | toc-navigation, print-friendly, smooth-scroll |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-devtool | home |
| /app | terminal-home | home |
| /docs | marketing-devtool | docs |
| /login | auth-full | login |
| /terms | legal | terms |
| /privacy | legal | privacy |
| /app/logs | log-viewer | logs |
| /register | auth-full | register |
| /app/config | config-editor | config |
| /app/metrics | metrics-monitor | metrics |
| /app/config/diff | config-editor | diff |
| /app/metrics/:id | metrics-monitor | detail |
| /app/logs/grouped | log-viewer | grouped |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-terminal-home.md
- .decantr/context/section-log-viewer.md
- .decantr/context/section-metrics-monitor.md
- .decantr/context/section-config-editor.md
- .decantr/context/section-marketing-devtool.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-legal.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| status | terminal-home/home, log-viewer/logs, log-viewer/grouped, metrics-monitor/metrics, metrics-monitor/detail, config-editor/config, config-editor/diff |
| main-split | terminal-home/home, config-editor/config |
| hotkeys | terminal-home/home, log-viewer/logs, log-viewer/grouped, metrics-monitor/metrics, metrics-monitor/detail, config-editor/config, config-editor/diff |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| content | legal/privacy, legal/terms, legal/cookies |

## Design Constraints

- **mode:** dark_only
- **borders:** ascii_box_drawing
- **corners:** sharp_only
- **effects:** {"glow":"optional","flicker":"disabled","scanlines":"optional"}
- **shadows:** none
- **typography:** monospace_only

## SEO Hints

**Schema.org types:** Organization, WebApplication, SoftwareApplication
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
