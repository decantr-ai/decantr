# Mutation Pack

**Objective:** Execute the modify workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=home, login, account-step, profile-step, interests-step, discover, matches, chat-list, chat-thread, profile-own, profile-other, settings | patterns=hero-split, cta-section, features, how-it-works, testimonials, footer, auth-form, onboarding-wizard, content-uploader, form, chip-multiselect, filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar, presence-avatars, stats-bar, avatar-grid-tile, conversation-list, chat-header, chat-thread, chat-input, mobile-profile-hero, tech-pills, settings-nav

## Mutation Contract
- Operation: modify
- Shell: top-nav-footer
- Theme: swipecircle (light)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: marketing, seo, conversion, demo-mode, auth, mfa, oauth, email-verification, password-reset, photo-upload, step-validation, form-validation, interests-picker, swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, keyboard-shortcuts, theme-toggle

## Route Topology
- / -> marketing-swipecircle/home @ top-nav-footer [hero-split, cta-section, features, how-it-works, testimonials, footer]
- /login -> auth-full/login @ centered [auth-form]
- /signup -> onboarding-wizard/account-step @ centered [onboarding-wizard, auth-form, cta-section]
- /onboarding/profile -> onboarding-wizard/profile-step @ centered [onboarding-wizard, content-uploader, form, cta-section]
- /onboarding/interests -> onboarding-wizard/interests-step @ centered [onboarding-wizard, chip-multiselect, cta-section]
- /discover -> swipe-feed/discover @ mobile-tab-bar [filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar]
- /matches -> swipe-feed/matches @ mobile-tab-bar [presence-avatars, stats-bar, avatar-grid-tile, hero, bottom-tab-bar]
- /chat -> swipe-feed/chat-list @ mobile-tab-bar [conversation-list, hero, bottom-tab-bar]
- /chat/:userId -> swipe-feed/chat-thread @ mobile-tab-bar [chat-header, chat-thread, chat-input, bottom-tab-bar]
- /me -> swipe-feed/profile-own @ mobile-tab-bar [mobile-profile-hero, stats-bar, tech-pills, settings-nav, bottom-tab-bar]
- /u/:userId -> swipe-feed/profile-other @ mobile-tab-bar [mobile-profile-hero, stats-bar, tech-pills, bottom-tab-bar]
- /settings -> swipe-feed/settings @ mobile-tab-bar [settings-nav, form, bottom-tab-bar]

## Workflow
- Read the page pack for the route you are modifying first.
- Stop and update the essence before changing route, shell, or pattern contracts.
- Validate and check drift after code changes complete.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- modify
- top-nav-footer
- swipecircle
- light
- marketing
- seo
- conversion
- demo-mode
- auth
- mfa
- oauth
- email-verification
- password-reset
- photo-upload
- step-validation
- form-validation
- interests-picker
- swipe-deck
- matches
- match-celebration
- chat
- profile
- filter-bar
- tab-navigation
- empty-states
- keyboard-shortcuts
- theme-toggle
- hero-split
- cta-section
- features
- how-it-works
- testimonials
- footer
- auth-form
- onboarding-wizard
- content-uploader
- form
- chip-multiselect
- spatial-card-stack
- swipe-action-bar
- hero
- bottom-tab-bar
- presence-avatars
- stats-bar
- avatar-grid-tile
- conversation-list
- chat-header
- chat-thread
- chat-input
- mobile-profile-hero
- tech-pills
- settings-nav

## Success Checks
- Modified routes remain coherent with the compiled topology unless the essence changes first. [error]
- Theme, shell, and page identity stay aligned with the current contract during edits. [error]
- Route-local edits should start from the compiled page pack rather than improvised structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
