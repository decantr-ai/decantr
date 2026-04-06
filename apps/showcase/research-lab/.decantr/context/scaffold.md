# Scaffold: lab-notebook

**Blueprint:** research-lab
**Theme:** lab
**Personality:** Scientific research workspace with pristine white panels and technical cyan accents. Lab notebook entries with LaTeX formula blocks and image embeds. Protocol steps numbered with reagent lists, equipment chips, and safety badges. Sample trackers with barcode displays and expiry countdowns. Instrument scheduling grids show bookings across lab equipment. Dataset cards with schema trees and quality indicators. Think Benchling meets Jupyter. Lucide icons. Precise.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Scientific and methodical. Speaks to researchers, PIs, grad students.
**CTA verbs:** Log, Analyze, Publish, Cite, Reserve, Replicate
**Avoid:** Save, Process
**Empty states:** No experiments logged yet. Start your first notebook entry.
**Errors:** Protocol step {n} validation failed — missing reagent {name}.
**Loading states:** Processing dataset... {rows}/{total}

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** lab-notebook + experiment-tracker + sample-inventory + instrument-booking + data-repository + marketing-research + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-research
  Purpose: Public marketing home page for a scientific research lab. Introduces the lab, its research focus, and drives visitors toward publications and collaboration.
  Features: marketing, landing, about

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-aside shell
  Archetypes: lab-notebook
  Purpose: Primary authoring surface for a scientific research lab. Researchers maintain an electronic lab notebook with hierarchical page tree, rich entries, and checklist protocols.
  Features: notebook, entries, authoring, protocols

**App (auxiliary)** — sidebar-main shell
  Archetypes: experiment-tracker, sample-inventory, instrument-booking, data-repository, settings-full
  Purpose: Experiment lifecycle management for a research lab. Researchers track planned, in-progress, and completed experiments with protocols and timelines. Biological and chemical sample inventory management with chain-of-custody tracking. Researchers locate, log, and audit every sample in the lab. Shared instrument reservation system for research labs. Researchers see availability calendars for lab equipment and book time slots. Research dataset library for a scientific lab. Scientists publish, browse, and inspect structured datasets produced by experiments. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: experiments, protocols, tracking, samples, chain-of-custody, inventory, booking, scheduling, instruments, datasets, repository, data-catalog, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| lab-notebook | primary | sidebar-aside | notebook, entry-detail | notebook, entries, authoring, protocols |
| experiment-tracker | auxiliary | sidebar-main | experiments, experiment-detail | experiments, protocols, tracking |
| sample-inventory | auxiliary | sidebar-main | samples, sample-detail | samples, chain-of-custody, inventory |
| instrument-booking | auxiliary | sidebar-main | instruments, instrument-detail | booking, scheduling, instruments |
| data-repository | auxiliary | sidebar-main | datasets, dataset-detail | datasets, repository, data-catalog |
| marketing-research | public | top-nav-footer | home | marketing, landing, about |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-aside | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-research | home |
| /login | auth-full | login |
| /samples | sample-inventory | samples |
| /datasets | data-repository | datasets |
| /notebook | lab-notebook | notebook |
| /register | auth-full | register |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /experiments | experiment-tracker | experiments |
| /instruments | instrument-booking | instruments |
| /samples/:id | sample-inventory | sample-detail |
| /datasets/:id | data-repository | dataset-detail |
| /notebook/:id | lab-notebook | entry-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /experiments/:id | experiment-tracker | experiment-detail |
| /forgot-password | auth-full | forgot-password |
| /instruments/:id | instrument-booking | instrument-detail |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-lab-notebook.md
- .decantr/context/section-experiment-tracker.md
- .decantr/context/section-sample-inventory.md
- .decantr/context/section-instrument-booking.md
- .decantr/context/section-data-repository.md
- .decantr/context/section-marketing-research.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| notebook-entry | lab-notebook/notebook, lab-notebook/entry-detail |
| protocol-step | lab-notebook/entry-detail, experiment-tracker/experiment-detail |
| data-table | experiment-tracker/experiments, instrument-booking/instrument-detail, data-repository/dataset-detail |
| detail-header | experiment-tracker/experiment-detail, sample-inventory/sample-detail, instrument-booking/instrument-detail |
| search-filter-bar | sample-inventory/samples, data-repository/datasets |
| sample-tracker | sample-inventory/samples, sample-inventory/sample-detail |
| card-grid | instrument-booking/instruments, data-repository/datasets |
| instrument-schedule | instrument-booking/instruments, instrument-booking/instrument-detail |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, ResearchProject
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
