# Scaffold: restaurant-floor

**Blueprint:** restaurant-ops
**Theme:** bistro
**Personality:** Warm restaurant operations hub with terracotta accents and handwritten chalkboard headers. Floor map shows live table status as colored shapes with party sizes. Kitchen display system rail shows order tickets flowing through stations with prep timers. Menu engineering grid highlights profitability per dish. Inventory depletion bars warn on low stock. Tip pool calculators split fairly. Think Toast meets Resy. Lucide icons. Hospitable.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Warm and operational. Speaks to owners, managers, servers, line cooks.
**CTA verbs:** Seat, Fire, Bump, Comp, 86, Close
**Avoid:** Submit, Process
**Empty states:** No reservations tonight. Perfect time for walk-ins.
**Errors:** Order #{n} sent to wrong station. Recall and reroute?
**Loading states:** Printing to KDS...

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** restaurant-floor + kitchen-display + menu-management + inventory-supplies + server-station + customer-loyalty + daily-operations + marketing-restaurant + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-restaurant
  Purpose: Public-facing marketing landing page for the restaurant operations platform. Hero, features, testimonials, and conversion CTA.
  Features: marketing

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: restaurant-floor
  Purpose: Live floor map and reservations workspace for front-of-house staff. Real-time table status, reservation calendar, and guest seating.
  Features: floor-map, reservations, walk-ins

**App (auxiliary)** — sidebar-main shell
  Archetypes: kitchen-display, menu-management, inventory-supplies, server-station, customer-loyalty, daily-operations, settings-full
  Purpose: Kitchen display system (KDS) for restaurant ticket routing. Horizontal ticket rail with station-specific views and fire timers. Menu editor and engineering workspace. Manages menus, sections, items, pricing, modifiers, and profitability analysis. Restaurant inventory and purchasing workspace. Tracks ingredients, par levels, usage, and purchase orders across suppliers. Server-facing shift workspace. Tracks active tables, shift performance, sales, and tips across the current shift. Customer relationship and loyalty program management. Tracks guest history, preferences, tier status, and rewards. Daily operations dashboard and reporting for restaurant managers. Covers, sales, labor, and P&L at a glance. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: kds, tickets, station-routing, menu-editing, engineering, inventory, purchasing, shifts, tips, loyalty, customer-tracking, operations, reports, pnl, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| restaurant-floor | primary | sidebar-main | floor, reservations, new-reservation | floor-map, reservations, walk-ins |
| kitchen-display | auxiliary | sidebar-main | kitchen, stations | kds, tickets, station-routing |
| menu-management | auxiliary | sidebar-main | menus, menu-detail, menu-engineering | menu-editing, engineering |
| inventory-supplies | auxiliary | sidebar-main | inventory, ingredient-detail, orders | inventory, purchasing |
| server-station | auxiliary | sidebar-main | shift, tips | shifts, tips |
| customer-loyalty | auxiliary | sidebar-main | customers, customer-detail, loyalty-program | loyalty, customer-tracking |
| daily-operations | auxiliary | sidebar-main | dashboard, reports | operations, reports, pnl |
| marketing-restaurant | public | top-nav-footer | home | marketing |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-restaurant | home |
| /ops | daily-operations | dashboard |
| /floor | restaurant-floor | floor |
| /login | auth-full | login |
| /menus | menu-management | menus |
| /shift | server-station | shift |
| /kitchen | kitchen-display | kitchen |
| /register | auth-full | register |
| /customers | customer-loyalty | customers |
| /inventory | inventory-supplies | inventory |
| /menus/:id | menu-management | menu-detail |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /shift/tips | server-station | tips |
| /ops/reports | daily-operations | reports |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /customers/:id | customer-loyalty | customer-detail |
| /inventory/:id | inventory-supplies | ingredient-detail |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /inventory/orders | inventory-supplies | orders |
| /kitchen/stations | kitchen-display | stations |
| /settings/profile | settings-full | profile |
| /customers/loyalty | customer-loyalty | loyalty-program |
| /menus/engineering | menu-management | menu-engineering |
| /settings/security | settings-full | security |
| /floor/reservations | restaurant-floor | reservations |
| /settings/preferences | settings-full | preferences |
| /floor/reservations/new | restaurant-floor | new-reservation |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-restaurant-floor.md
- .decantr/context/section-kitchen-display.md
- .decantr/context/section-menu-management.md
- .decantr/context/section-inventory-supplies.md
- .decantr/context/section-server-station.md
- .decantr/context/section-customer-loyalty.md
- .decantr/context/section-daily-operations.md
- .decantr/context/section-marketing-restaurant.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Restaurant, Organization
**Meta priorities:** description, og:image

## Navigation

- Command palette: enabled
