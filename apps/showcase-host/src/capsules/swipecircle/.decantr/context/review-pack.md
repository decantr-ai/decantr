# Review Pack

**Objective:** Review generated output against the compiled Decantr contract.
**Target:** react-vite (react)
**Scope:** pages=home, login, account-step, profile-step, interests-step, discover, matches, chat-list, chat-thread, profile-own, profile-other, settings | patterns=hero-split, cta-section, features, how-it-works, testimonials, footer, auth-form, onboarding-wizard, content-uploader, form, chip-multiselect, filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar, presence-avatars, stats-bar, avatar-grid-tile, conversation-list, chat-header, chat-thread, chat-input, mobile-profile-hero, tech-pills, settings-nav

## Review Contract
- Review Type: app
- Shell: top-nav-footer
- Theme: swipecircle (light)
- Routing: history
- Features: marketing, seo, conversion, demo-mode, auth, mfa, oauth, email-verification, password-reset, photo-upload, step-validation, form-validation, interests-picker, swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, keyboard-shortcuts, theme-toggle

## Review Topology
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

## Focus Areas
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Review Workflow
- Read the scaffold pack and page packs before evaluating generated code.
- Compare findings against the compiled route, shell, and theme contract first.
- Escalate contract drift into essence updates when the requested output intentionally changes topology or theme identity.

## Required Setup
- Read the compiled scaffold and route packs before reviewing code.
- Use concrete evidence from the workspace instead of purely stylistic intuition.

## Allowed Vocabulary
- app
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
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Success Checks
- Review findings should use the compiled route, shell, and theme contract as the baseline. [error]
- Each critique finding should cite concrete evidence from the generated workspace. [error]
- Suggested fixes should point back to code changes or essence updates when contract drift exists. [warn]

## Anti-Patterns
- Avoid inline style literals as the primary styling path.: Move visual styling into tokens.css and treatments.css instead of component-local style objects.
- Avoid hardcoded color literals.: Use CSS variables and theme decorators instead of hex, rgb, or hsl values.
- Avoid utility-framework leakage as the primary design language.: Prefer compiled Decantr treatments and contract vocabulary over ad hoc utility class stacks.

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
