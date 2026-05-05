# Scaffold: admin-overview

**Blueprint:** ecommerce-admin
**Theme:** auradecantism
**Personality:** Efficient, no-nonsense admin dashboard built for store operators. Dense table-heavy layouts with inline editing. Status badges use semantic colors. Order fulfillment uses a Kanban board for visual pipeline tracking. Revenue charts update in real-time. Product management has bulk actions and inventory alerts. Customer profiles show purchase history and lifetime value. Lucide icons. Dark mode for long operational sessions.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Direct and operational. Speaks to store managers.
**CTA verbs:** Fulfill, Ship, Edit, Restock, Export, Analyze
**Avoid:** Submit, Click here, Please enter, Shop now, Discover
**Empty states:** Practical and forward-looking. An empty orders page should say when orders will appear and link to store setup. No whimsy.
**Errors:** Specific and actionable. Include affected item IDs. For inventory conflicts, show current vs. attempted values.
**Loading states:** Table row skeletons matching column widths. Show row count estimate if available. No full-page spinners.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** admin-overview + product-management + order-fulfillment + customer-management + admin-analytics + auth-full + settings-full

### Zones

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: admin-overview
  Purpose: Store operations dashboard with KPIs, sales charts, activity feed, and quick action cards. Central hub for e-commerce administrators.
  Features: analytics-state, notifications, quick-actions

**App (auxiliary)** — sidebar-main shell
  Archetypes: product-management, order-fulfillment, customer-management, admin-analytics, settings-full
  Purpose: Product catalog CRUD and inventory management with data tables, edit forms, and Kanban-style inventory boards for e-commerce admin operations. Admin order processing and shipping management with data tables, Kanban pipeline boards, order detail views, and fulfillment action forms. Customer relationship management for e-commerce with customer list, profile detail views, activity feeds, and purchase history. Revenue and sales analytics for e-commerce administrators with KPI dashboards, trend charts, and inline sparkline data tables. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: bulk-actions, search, inline-editing, image-upload, order-tracking, notifications, filtering, export, tagging, analytics-state, data-export, date-range-picker, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| admin-overview | primary | sidebar-main | dashboard, quick-actions | analytics-state, notifications, quick-actions |
| product-management | auxiliary | sidebar-main | products, product-edit, inventory | bulk-actions, search, inline-editing, image-upload |
| order-fulfillment | auxiliary | sidebar-main | orders, order-detail | order-tracking, bulk-actions, notifications |
| customer-management | auxiliary | sidebar-main | customers, customer-detail | search, filtering, export, tagging |
| admin-analytics | auxiliary | sidebar-main | analytics | analytics-state, data-export, date-range-picker |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| /login | auth-full | login |
| /orders | order-fulfillment | orders |
| /products | product-management | products |
| /register | auth-full | register |
| /analytics | admin-analytics | analytics |
| /customers | customer-management | customers |
| /dashboard | admin-overview | dashboard |
| /inventory | product-management | inventory |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /orders/:id | order-fulfillment | order-detail |
| /phone-verify | auth-full | phone-verify |
| /products/:id | product-management | product-edit |
| /verify-email | auth-full | verify-email |
| /customers/:id | customer-management | customer-detail |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /dashboard/actions | admin-overview | quick-actions |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-admin-overview.md
- .decantr/context/section-product-management.md
- .decantr/context/section-order-fulfillment.md
- .decantr/context/section-customer-management.md
- .decantr/context/section-admin-analytics.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** WebApplication, SoftwareApplication
**Meta priorities:** description, og:title, og:description

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
