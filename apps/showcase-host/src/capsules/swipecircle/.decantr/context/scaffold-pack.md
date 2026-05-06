# Scaffold Pack

**Objective:** Scaffold the swipecircle app shell and declared routes.
**Target:** react-vite (react)
**Scope:** pages=home, login, account-step, profile-step, interests-step, discover, matches, chat-list, chat-thread, profile-own, profile-other, settings | patterns=hero-split, cta-section, features, how-it-works, testimonials, footer, auth-form, onboarding-wizard, content-uploader, form, chip-multiselect, filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar, presence-avatars, stats-bar, avatar-grid-tile, conversation-list, chat-header, chat-thread, chat-input, mobile-profile-hero, tech-pills, settings-nav

## Scaffold Contract
- Shell: top-nav-footer
- Shells: top-nav-footer (primary), centered, mobile-tab-bar
- Theme: swipecircle (light)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: marketing, seo, conversion, demo-mode, auth, mfa, oauth, email-verification, password-reset, photo-upload, step-validation, form-validation, interests-picker, swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, keyboard-shortcuts, theme-toggle
- Navigation:
  - Hotkeys (chord window 900ms; suppress during text-input focus; ignore when modifier held):
    - ArrowLeft: Pass on current card
    - ArrowRight: Like current card
    - ArrowUp: Super-like current card
    - g d: Go to Discover — /discover
    - g m: Go to Matches — /matches
    - g c: Go to Chat — /chat
    - g p: Go to Profile — /me

## Route Plan
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

## Required Theme Decorators (swipecircle)

These classes carry the active theme's visual identity. Tokens alone give bones; decorators give personality. Generated source MUST apply these across all sections — without them, every page reads as "themed colors only" with no theme character. Section packs reference this table; the contract is project-wide.

| Class | Intent | Apply to |
|-------|--------|----------|
| `.swipecircle-card` | Use for swipe-deck cards and any content card that leads with imagery. The bottom gradient ensures text overlay remains readable against any photo. The coral-tinted shadow signals warmth without harshness — replaces neutral grey shadows that read as enterprise. | Swipe deck cards, Profile preview cards, Match cards, Story-style content cards |
| `.swipecircle-pill` | Use for ALL primary CTAs. The pill shape signals approachability over enterprise sharpness. The spring scale on press provides satisfying haptic-like feedback. | Primary CTAs, Sign Up / Log In buttons, Send Message / Edit Profile, Step navigation in onboarding |
| `.swipecircle-tab-active` | Use ONLY on the active tab in the bottom-tab-bar. The violet dot is the primary visual signal of selected state — bright enough to read at a glance, subtle enough not to scream. The icon scale provides a secondary cue. | Active bottom-tab item, Active step indicator in stepper, Selected filter chip |
| `.swipecircle-match-burst` | Use exclusively in the match-celebration overlay. The burst signals reward and joy. The slow rotate adds magic without distracting from the central avatars meeting. | First-match celebration overlay, Major milestone achievements, First message sent celebration |
| `.swipecircle-photo-frame` | Use for ALL avatar imagery (profile, matches, chat). The double-ring frame elevates the photo into a proper portrait — signals care for identity. Cream inner gap provides clean separation from any background. | Profile avatar, Match grid avatars, Chat header avatar, Card photo thumbnails |
| `.swipecircle-chip-selected` | Use in chip-multiselect (interest picker) for the selected state. The fill provides immediate clarity of selection. The check icon doubles down on accessibility for color-blind users. | Selected interest chips in onboarding, Selected filter chips, Selected category tags |
| `.swipecircle-action-button` | Use exclusively for the swipe-action-bar buttons. The size is intentionally generous (56-64px) for thumb-friendly mobile tapping. The color coding matches semantic meaning — heart for like (coral=love), X for pass (muted=neutral-no), star for super-like (violet=premium). | Swipe action bar (X, Heart, Star), Floating action buttons, Quick-action overlays on cards |
| `.swipecircle-floating-bar` | Use for the bottom-tab-bar shell region. The backdrop-blur lets content behind subtly bleed through, signaling that content continues underneath rather than being chopped. Soft border-top is the only visual separator — no harsh hairline. | Bottom-tab-bar container, Floating action bar above tabs, Sticky action footer in mobile flows |
| `.swipecircle-bubble` | Use for chat-message rendering. The fill colors instantly communicate ownership — coral for self, cream for partner. The directional tail (small triangle peeking from the bubble corner) reinforces conversational direction. | Chat message bubbles, Inline notification toasts, Mention popups |
| `.swipecircle-grid-tile` | Use for the matches-grid tiles. The square card with circular avatar inside creates a tidy grid rhythm while preserving the photo-portrait feel. The new-match violet dot is the primary signal of unseen matches. | Matches grid tiles, Friends list items, Discoverable people grid |

## Required Setup
- Treat the declared routes as the topology source of truth.
- Preserve the resolved theme and shell contract unless the task explicitly mutates them.

## Allowed Vocabulary
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
- Routes and page IDs match the compiled topology. [error]
- The declared shell contract is preserved unless the task explicitly mutates it. [error]
- Theme identity and mode remain consistent across scaffolded routes. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
