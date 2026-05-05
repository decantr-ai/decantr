# Scaffold: storefront-browse

**Blueprint:** ecommerce
**Theme:** auradecantism
**Personality:** Warm, inviting storefront where product imagery takes center stage. Clean white backgrounds with accent pops on CTAs. Typography hierarchy guides the eye from product name to price to action. Cart feels lightweight and frictionless. Checkout is a calm, focused 3-step flow. Order history is clean and scannable. Product cards use generous image space with subtle hover zoom. Comparison tools help shoppers decide. Lucide icons. Mobile-first, touch-friendly.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Friendly and confident. Product-focused, not pushy.
**CTA verbs:** Shop, Add, Compare, Checkout, Track, Browse
**Avoid:** Submit, Click here, Please enter, Purchase immediately
**Empty states:** Warm and inviting. Suggest popular items or categories when a search returns no results. Keep the shopper browsing.
**Errors:** Reassuring and solution-focused. If a payment fails, suggest alternatives. Never alarm the customer.
**Loading states:** Show product card skeletons with image placeholders. Subtle shimmer animation to signal progress.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** storefront-browse + ecommerce-checkout + order-management + marketing-ecommerce + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-ecommerce
  Purpose: Public marketing landing page for an e-commerce storefront with hero, feature highlights, social proof, and conversion CTAs.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — top-nav-main shell
  Archetypes: storefront-browse
  Purpose: Product browsing experience with search, filtering, product detail pages, and shopping cart. Core storefront interface for e-commerce applications.
  Features: search, filtering, cart, wishlist, product-comparison

**App (auxiliary)** — minimal-header shell
  Archetypes: ecommerce-checkout, order-management, settings-full
  Purpose: Multi-step checkout flow with shipping, payment, and order confirmation. Minimal chrome for a focused, distraction-free purchase experience. Customer-facing order history and tracking. Lists past orders with status, and provides detailed order views with delivery timeline. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: payments, address-autocomplete, saved-payments, order-tracking, notifications, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| storefront-browse | primary | top-nav-main | browse, product-detail, cart | search, filtering, cart, wishlist, product-comparison |
| ecommerce-checkout | auxiliary | minimal-header | checkout | payments, address-autocomplete, saved-payments |
| order-management | auxiliary | sidebar-main | orders, order-detail | order-tracking, notifications |
| marketing-ecommerce | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | top-nav-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-ecommerce | home |
| /cart | storefront-browse | cart |
| /shop | storefront-browse | browse |
| /login | auth-full | login |
| /orders | order-management | orders |
| /checkout | ecommerce-checkout | checkout |
| /register | auth-full | register |
| /shop/:id | storefront-browse | product-detail |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /orders/:id | order-management | order-detail |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-storefront-browse.md
- .decantr/context/section-ecommerce-checkout.md
- .decantr/context/section-order-management.md
- .decantr/context/section-marketing-ecommerce.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** WebApplication, Store, Product
**Meta priorities:** description, og:title, og:description, og:image

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
