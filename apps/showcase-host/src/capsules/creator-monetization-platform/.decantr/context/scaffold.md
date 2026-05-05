# Scaffold: creator-dashboard

**Blueprint:** creator-monetization-platform
**Theme:** studio
**Personality:** Warm, creator-first monetization platform that celebrates creative work. Light theme with soft gradients and rounded cards. Creator profiles are visually rich — large cover images, prominent avatars, and tier cards with benefit previews. Earnings dashboards use approachable chart styles (rounded bars, smooth lines) in warm accent tones. The fan storefront feels like a boutique, not a marketplace. Premium tiers get subtle visual elevation. Think Patreon meets Gumroad with a Dribbble-level polish.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Warm, encouraging, and creator-supportive. Celebrates milestones. Speaks differently to creators (empowering) vs fans (appreciative).
**CTA verbs:** Create, Publish, Subscribe, Support, Unlock, Share
**Avoid:** Submit, Click here, Please enter, Buy now, Deploy
**Empty states:** Encouraging and aspirational. An empty subscriber list should celebrate that the creator is getting started and offer tips for their first post.
**Errors:** Gentle and solution-oriented. Payment failures should reassure that no charges were made and offer alternative methods.
**Loading states:** Content card skeletons with rounded corners and warm shimmer. Earnings charts show axis labels while data populates.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** creator-dashboard + creator-earnings + creator-content + creator-subscribers + creator-tiers + fan-storefront + fan-library + fan-checkout + marketing-creator + auth-full + settings-full + about-hybrid + contact + legal

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-creator, about-hybrid, contact, legal
  Purpose: Platform marketing landing page for creator monetization. Attract creators with features, pricing, and testimonials. About page combining hero, company story, team grid, values, and call-to-action sections. Contact page with hero header and working contact form with validation and spam protection. Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.
  Features: hero-section, feature-grid, pricing-tiers, testimonials, faq, team-grid, values-display, form-validation, spam-protection, file-attachment, toc-navigation, print-friendly, smooth-scroll

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — sidebar-main shell
  Archetypes: creator-dashboard, creator-earnings, creator-content, creator-subscribers, creator-tiers
  Purpose: Creator admin dashboard home with earnings summary, recent activity, and quick actions. Revenue analytics and payout management for creators. Full earnings dashboard and payout configuration. Content management for creators. Upload, organize, and manage posts, media, and products. Fan and subscriber management for creators. View, filter, and engage with your audience. Subscription tier management for creators. Create, edit, and organize membership tiers.
  Features: earnings-kpis, activity-feed, quick-actions, revenue-charts, tier-breakdown, payout-configuration, export-reports, media-upload, tier-gating, scheduling, drafts, subscriber-filtering, export-csv, messaging, tier-management, tier-creation, benefit-management, pricing-config, tier-reorder

**App (auxiliary)** — top-nav-main shell
  Archetypes: fan-storefront, fan-library, fan-checkout, settings-full
  Purpose: Public creator storefront for fans. Browse content, view tiers, and subscribe to creators. Fan's purchased and subscribed content library. View all unlocked content and manage subscriptions. Purchase and subscription checkout flow for fans. Complete payment for subscriptions and one-time purchases. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: creator-profile, tier-display, content-preview, subscribe-flow, content-library, subscription-management, download-content, creator-links, stripe-integration, promo-codes, apple-pay, google-pay, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| creator-dashboard | primary | sidebar-main | home | earnings-kpis, activity-feed, quick-actions |
| creator-earnings | primary | sidebar-main | earnings, payouts | revenue-charts, tier-breakdown, payout-configuration, export-reports |
| creator-content | primary | sidebar-main | content, new, edit | media-upload, tier-gating, scheduling, drafts |
| creator-subscribers | primary | sidebar-main | subscribers, subscriber-detail | subscriber-filtering, export-csv, messaging, tier-management |
| creator-tiers | primary | sidebar-main | tiers | tier-creation, benefit-management, pricing-config, tier-reorder |
| fan-storefront | auxiliary | top-nav-main | profile, post | creator-profile, tier-display, content-preview, subscribe-flow |
| fan-library | auxiliary | top-nav-main | library, subscriptions | content-library, subscription-management, download-content, creator-links |
| fan-checkout | auxiliary | minimal-header | checkout, purchase, success | stripe-integration, promo-codes, apple-pay, google-pay |
| marketing-creator | public | top-nav-footer | home, pricing | hero-section, feature-grid, pricing-tiers, testimonials, faq |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | sidebar-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |
| about-hybrid | public | top-nav-footer | about | team-grid, values-display |
| contact | public | top-nav-footer | contact | form-validation, spam-protection, file-attachment |
| legal | public | top-nav-footer | privacy, terms, cookies | toc-navigation, print-friendly, smooth-scroll |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-creator | home |
| /about | about-hybrid | about |
| /login | auth-full | login |
| /terms | legal | terms |
| /contact | contact | contact |
| /library | fan-library | library |
| /pricing | marketing-creator | pricing |
| /privacy | legal | privacy |
| /checkout | fan-checkout | checkout |
| /register | auth-full | register |
| /dashboard | creator-dashboard | home |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /verify-email | auth-full | verify-email |
| /reset-password | auth-full | reset-password |
| /dashboard/tiers | creator-tiers | tiers |
| /forgot-password | auth-full | forgot-password |
| /checkout/success | fan-checkout | success |
| /settings/account | settings-full | danger |
| /settings/payouts | creator-earnings | payouts |
| /settings/profile | settings-full | profile |
| /checkout/purchase | fan-checkout | purchase |
| /creator/:username | fan-storefront | profile |
| /dashboard/content | creator-content | content |
| /settings/security | settings-full | security |
| /dashboard/earnings | creator-earnings | earnings |
| /settings/preferences | settings-full | preferences |
| /dashboard/content/new | creator-content | new |
| /dashboard/subscribers | creator-subscribers | subscribers |
| /library/subscriptions | fan-library | subscriptions |
| /dashboard/subscribers/:id | creator-subscribers | subscriber-detail |
| /creator/:username/post/:id | fan-storefront | post |
| /dashboard/content/:id/edit | creator-content | edit |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-creator-dashboard.md
- .decantr/context/section-creator-earnings.md
- .decantr/context/section-creator-content.md
- .decantr/context/section-creator-subscribers.md
- .decantr/context/section-creator-tiers.md
- .decantr/context/section-fan-storefront.md
- .decantr/context/section-fan-library.md
- .decantr/context/section-fan-checkout.md
- .decantr/context/section-marketing-creator.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md
- .decantr/context/section-about-hybrid.md
- .decantr/context/section-contact.md
- .decantr/context/section-legal.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| earnings-dashboard | creator-dashboard/home, creator-earnings/earnings |
| activity-feed | creator-dashboard/home, creator-subscribers/subscriber-detail |
| payout-settings | creator-earnings/earnings, creator-earnings/payouts |
| filters | creator-content/content, fan-library/library |
| checkout-flow | fan-checkout/checkout, fan-checkout/purchase |
| hero | marketing-creator/home, about-hybrid/about, contact/contact |
| pricing | marketing-creator/home, marketing-creator/pricing |
| cta | marketing-creator/home, about-hybrid/about |
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify, contact/contact |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |
| legal-prose | legal/privacy, legal/terms, legal/cookies |

## SEO Hints

**Schema.org types:** Organization, WebApplication, Product
**Meta priorities:** description, og:image, twitter:card

## Navigation

- Command palette: enabled
- Hotkeys: 4 configured
