# Scaffold: recipe-browser

**Blueprint:** recipe-community
**Theme:** auradecantism
**Personality:** Warm, appetite-driven recipe community with rich food photography as the visual anchor. Earthy tones with pops of warm orange and herb green. Card-based recipe grid where each card is a gorgeous food photo with overlaid title. Recipe detail pages flow: hero image, ingredient list with drag-to-reorder, step-by-step instructions with the stepper pattern. Cook mode is distraction-free with large text and step navigation. Social features include emoji reactions, collections, and creator profiles. Lucide icons. Everything makes you hungry.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Warm and encouraging. Celebrates food and creativity.
**CTA verbs:** Cook, Save, Share, Follow, Create, Collect
**Avoid:** Submit, Click here, Please enter, Execute, Deploy
**Empty states:** Inviting and appetizing. An empty cookbook should inspire the user to save their first recipe, not feel like an error. Use food-related metaphors.
**Errors:** Gentle and understanding. If a recipe upload fails, offer to retry. Keep the kitchen metaphor alive without being cheesy.
**Loading states:** Recipe card skeletons with image placeholders showing a subtle plate outline. Shimmer animation in warm tones.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** recipe-browser + cook-mode + recipe-creator + recipe-social + marketing-recipe + auth-full + settings-full

### Zones

**Public** — top-nav-footer shell
  Archetypes: marketing-recipe
  Purpose: Public marketing landing page for the recipe community platform with hero, featured recipes, testimonials, and conversion CTAs.
  Features: marketing, seo

**Gateway** — centered shell
  Archetypes: auth-full
  Purpose: Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.
  Features: auth, mfa, oauth, email-verification, password-reset

**App** — top-nav-main shell
  Archetypes: recipe-browser
  Purpose: Browse and search recipes with filterable card grid and rich recipe detail pages with step-by-step instructions.
  Features: search, filter, gallery, sharing

**App (auxiliary)** — minimal-header shell
  Archetypes: cook-mode, recipe-creator, recipe-social, settings-full
  Purpose: Distraction-free step-by-step cooking interface with large text, step navigation, and minimal chrome for hands-free kitchen use. Recipe creation editor with sectioned forms, drag-and-drop ingredient and step ordering, and a personal recipe management table. Social features for the recipe community: activity feed, emoji reactions, recipe collections, and creator profiles with follow functionality. Complete account settings with profile, security (password, MFA, sessions), preferences (theme, notifications, language), and danger zone.
  Features: timer, voice-control, wake-lock, drag-drop, image-upload, autosave, preview, follow, reactions, collections, sharing, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion

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
| recipe-browser | primary | top-nav-main | recipes, recipe-detail | search, filter, gallery, sharing |
| cook-mode | auxiliary | minimal-header | cooking | timer, voice-control, wake-lock |
| recipe-creator | auxiliary | sidebar-main | create, my-recipes | drag-drop, image-upload, autosave, preview |
| recipe-social | auxiliary | top-nav-main | feed, collections, profile | follow, reactions, collections, sharing |
| marketing-recipe | public | top-nav-footer | home | marketing, seo |
| auth-full | gateway | centered | login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify | auth, mfa, oauth, email-verification, password-reset |
| settings-full | auxiliary | top-nav-main | profile, security, preferences, danger | profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | marketing-recipe | home |
| /feed | recipe-social | feed |
| /login | auth-full | login |
| /recipes | recipe-browser | recipes |
| /register | auth-full | register |
| /mfa-setup | auth-full | mfa-setup |
| /mfa-verify | auth-full | mfa-verify |
| /my-recipes | recipe-creator | my-recipes |
| /collections | recipe-social | collections |
| /profile/:id | recipe-social | profile |
| /recipes/:id | recipe-browser | recipe-detail |
| /verify-email | auth-full | verify-email |
| /recipes/create | recipe-creator | create |
| /reset-password | auth-full | reset-password |
| /forgot-password | auth-full | forgot-password |
| /settings/danger | settings-full | danger |
| /recipes/:id/cook | cook-mode | cooking |
| /settings/profile | settings-full | profile |
| /settings/security | settings-full | security |
| /settings/preferences | settings-full | preferences |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-recipe-browser.md
- .decantr/context/section-cook-mode.md
- .decantr/context/section-recipe-creator.md
- .decantr/context/section-recipe-social.md
- .decantr/context/section-marketing-recipe.md
- .decantr/context/section-auth-full.md
- .decantr/context/section-settings-full.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| form | auth-full/login, auth-full/register, auth-full/forgot-password, auth-full/reset-password, auth-full/verify-email, auth-full/mfa-setup, auth-full/mfa-verify, auth-full/phone-verify |
| account-settings | settings-full/profile, settings-full/security, settings-full/preferences, settings-full/danger |

## SEO Hints

**Schema.org types:** WebApplication, Recipe, CollectionPage
**Meta priorities:** description, og:title, og:image

## Navigation

- Command palette: enabled
- Hotkeys: 6 configured
