# Task Context: Scaffolding

**Enforcement Tier: Creative** — Guard rules are advisory during initial scaffolding.

## Primary Compiled Contract

- Start with `.decantr/context/scaffold-pack.md` for the compact route, shell, and theme contract.
- Use `.decantr/context/scaffold.md` only as secondary detail when the compiled pack is not enough.
- Read the route-local page packs before building each page so layout and wiring stay aligned with the compiled plan.

## Generate This Application

- Target: `react-vite` (react)
- Shell: `top-nav-footer`
- Theme: `swipecircle` (light, pill)
- Routing: `history`
- Features: marketing, seo, conversion, demo-mode, auth, mfa, oauth, email-verification, password-reset, photo-upload, step-validation, form-validation, interests-picker, swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, keyboard-shortcuts, theme-toggle

## Route Plan

- `/` -> `marketing-swipecircle/home` [hero-split, cta-section, features, how-it-works, testimonials, footer]
- `/login` -> `auth-full/login` [auth-form]
- `/signup` -> `onboarding-wizard/account-step` [onboarding-wizard, auth-form, cta-section]
- `/onboarding/profile` -> `onboarding-wizard/profile-step` [onboarding-wizard, content-uploader, form, cta-section]
- `/onboarding/interests` -> `onboarding-wizard/interests-step` [onboarding-wizard, chip-multiselect, cta-section]
- `/discover` -> `swipe-feed/discover` [filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar]
- `/matches` -> `swipe-feed/matches` [presence-avatars, stats-bar, avatar-grid-tile, hero, bottom-tab-bar]
- `/chat` -> `swipe-feed/chat-list` [conversation-list, hero, bottom-tab-bar]
- `/chat/:userId` -> `swipe-feed/chat-thread` [chat-header, chat-thread, chat-input, bottom-tab-bar]
- `/me` -> `swipe-feed/profile-own` [mobile-profile-hero, stats-bar, tech-pills, settings-nav, bottom-tab-bar]
- `/u/:userId` -> `swipe-feed/profile-other` [mobile-profile-hero, stats-bar, tech-pills, bottom-tab-bar]
- `/settings` -> `swipe-feed/settings` [settings-nav, form, bottom-tab-bar]

### Section Packs

- Section `marketing-swipecircle` -> `.decantr/context/section-marketing-swipecircle-pack.md`
- Section `auth-full` -> `.decantr/context/section-auth-full-pack.md`
- Section `onboarding-wizard` -> `.decantr/context/section-onboarding-wizard-pack.md`
- Section `swipe-feed` -> `.decantr/context/section-swipe-feed-pack.md`

### Page Packs

- 12 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Success Checks

- [error] Routes and page IDs match the compiled topology.
- [error] The declared shell contract is preserved unless the task explicitly mutates it.
- [warn] Theme identity and mode remain consistent across scaffolded routes.

## Token Budget

- Target: 1400 tokens
- Max: 2200 tokens
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.

Post-scaffold enforcement mode: **STRICT**.

---

*Task context generated from Decantr execution packs*