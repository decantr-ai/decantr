# Scaffold: listing-browser

**Blueprint:** two-sided-marketplace
**Theme:** clean
**Personality:** Clean, trustworthy marketplace that serves both sides fairly. White/light surfaces with a single accent color for CTAs. Listing cards are image-forward with clean typography. Search and filtering are powerful but never overwhelming. Reviews are prominent — social proof drives conversion. Messaging is simple and contextual. Seller dashboard is data-rich but not intimidating. Comparison tools help buyers decide. Lucide icons. Mobile-first thinking.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Friendly and trustworthy. Speaks to both buyers and sellers.
**CTA verbs:** Browse, Book, List, Compare, Message, Review
**Avoid:** Submit, Click here, Please enter, Buy now, Hurry
**Empty states:** Encouraging and helpful. Empty listings invite sellers to create their first. Empty favorites encourage browsing. Always warm.
**Errors:** Friendly and reassuring. Never lose user progress. Offer clear recovery steps.
**Loading states:** Image-forward skeleton cards for listings. Smooth progressive loading. Seller dashboard shows shimmer tables.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** listing-browser + buyer-dashboard + seller-dashboard + marketplace-messaging + review-system + marketing-marketplace + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-marketplace
  Purpose: Public-facing marketing and landing pages for a two-sided marketplace. Showcases featured listings, categories, testimonials, and conversion CTAs.
  Features: marketing, seo, featured-listings

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — top-nav-main shell
  Archetypes: listing-browser
  Purpose: Browse and search marketplace listings with grid, map, and detail views. Core discovery interface for two-sided marketplaces.
  Features: search, filters, map-view, image-gallery

**App (auxiliary)** — sidebar-main shell
  Archetypes: buyer-dashboard, seller-dashboard, marketplace-messaging, review-system, settings-full
  Purpose: Buyer account hub with bookings, saved favorites, and messaging. Centralizes the buyer experience in a two-sided marketplace. Seller management hub with listing management, performance analytics, earnings tracking, and review monitoring for marketplace sellers. Dedicated message center for marketplace buyer-seller communication with conversation list and threaded chat views. Review submission flow for marketplace transactions. Allows buyers to rate, write text reviews, and upload photos after a completed booking. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: bookings, favorites, messaging, listings, analytics, earnings, reviews, contextual-listing-cards, ratings, photos, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| listing-browser | primary | top-nav-main | browse, listing-detail, search | search, filters, map-view, image-gallery |
| buyer-dashboard | auxiliary | sidebar-main | bookings, favorites, messages | bookings, favorites, messaging |
| seller-dashboard | auxiliary | sidebar-main | seller-overview, seller-listings, seller-listing-edit, seller-analytics, seller-reviews | listings, analytics, earnings, reviews |
| marketplace-messaging | auxiliary | sidebar-main | messages, thread | messaging, contextual-listing-cards |
| review-system | auxiliary | sidebar-main | write-review | reviews, ratings, photos |
| marketing-marketplace | public | top-nav-footer | home, about | marketing, seo, featured-listings |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | top-nav-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-marketplace | home |
| /about | marketing-marketplace | about |
| /login | auth-full | login |
| /browse | listing-browser | browse |
| /search | listing-browser | search |
| /seller | seller-dashboard | seller-overview |
| /bookings | buyer-dashboard | bookings |
| /messages | marketplace-messaging | messages |
| /register | auth-full | register |
| /favorites | buyer-dashboard | favorites |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /listings/:id | listing-browser | listing-detail |
| /messages/:id | marketplace-messaging | thread |
| /phone-verify | auth-full | phone-verify |
| /verify-email | auth-full | verify-email |
| /reviews/write | review-system | write-review |
| /buyer/messages | buyer-dashboard | messages |
| /reset-password | auth-full | reset-password |
| /seller/reviews | seller-dashboard | seller-reviews |
| /forgot-password | auth-full | forgot-password |
| /seller/listings | seller-dashboard | seller-listings |
| /settings/danger | settings-full | danger |
| /seller/analytics | seller-dashboard | seller-analytics |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |
| /seller/listings/:id/edit | seller-dashboard | seller-listing-edit |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-listing-browser.md
- .decantr/context/section-buyer-dashboard.md
- .decantr/context/section-seller-dashboard.md
- .decantr/context/section-marketplace-messaging.md
- .decantr/context/section-review-system.md
- .decantr/context/section-marketing-marketplace.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| search-filters | listing-browser/browse, listing-browser/search |
| active-thread | buyer-dashboard/messages, marketplace-messaging/messages |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** Organization, WebApplication, Product, Review
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 3 configured
