# Section Pack

**Objective:** Implement the swipe-feed section using the compiled mobile-tab-bar shell contract.
**Target:** react-vite (react)
**Scope:** pages=discover, matches, chat-list, chat-thread, profile-own, profile-other, settings | patterns=filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar, presence-avatars, stats-bar, avatar-grid-tile, conversation-list, chat-header, chat-thread, chat-input, mobile-profile-hero, tech-pills, settings-nav, form

## Section Contract
- Section: swipe-feed
- Role: primary
- Shell: mobile-tab-bar
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Description: Primary archetype for mobile-first swipe-based social discovery apps. Hosts the core swipe deck (discover), matches grid, chat list and thread, own/other profile views, and settings — all under a single mobile-tab-bar shell with persistent bottom navigation. The first archetype in Decantr's catalog purpose-built around a card-stack swipe loop with match celebration and 1:1 chat.

## Section Routes
- /discover -> swipe-feed/discover @ mobile-tab-bar [filter-bar, spatial-card-stack, swipe-action-bar, match-celebration, hero, bottom-tab-bar]
- /matches -> swipe-feed/matches @ mobile-tab-bar [presence-avatars, stats-bar, avatar-grid-tile, hero, bottom-tab-bar]
- /chat -> swipe-feed/chat-list @ mobile-tab-bar [conversation-list, hero, bottom-tab-bar]
- /chat/:userId -> swipe-feed/chat-thread @ mobile-tab-bar [chat-header, chat-thread, chat-input, bottom-tab-bar]
- /me -> swipe-feed/profile-own @ mobile-tab-bar [mobile-profile-hero, stats-bar, tech-pills, settings-nav, bottom-tab-bar]
- /u/:userId -> swipe-feed/profile-other @ mobile-tab-bar [mobile-profile-hero, stats-bar, tech-pills, bottom-tab-bar]
- /settings -> swipe-feed/settings @ mobile-tab-bar [settings-nav, form, bottom-tab-bar]

## Section Navigation

Render these items in the shell's primary navigation. Exact match on label, route, and icon.

- Swipe → /discover · icon: Heart · hotkey: g d · active match: `/discover`
- Matches → /matches · icon: Users · hotkey: g m · badge: new-matches-count · active match: `/matches`
- Chat → /chat · icon: MessageCircle · hotkey: g c · badge: unread-chats-count · active match: `/chat`
- Profile → /me · icon: User · hotkey: g p · active match: `/me`

## Section Directives

Execution-level rules every page in this section must obey. Follow exactly — these live in the pack contract, not narrative prose.

- All pages share the mobile-tab-bar shell and persist the bottom-tab-bar across page transitions
- Bottom-tab-bar 4 items: Swipe (/discover, Heart icon, hotkey g d), Matches (/matches, Users icon, hotkey g m), Chat (/chat, MessageCircle icon, hotkey g c), Profile (/me, User icon, hotkey g p)
- Swipe gestures (← / →) only fire on the /discover route — input_guard prevents firing while typing in chat
- Match celebration triggers on a successful right-swipe (mocked: 30% chance in demo mode) — first-match preset adds confetti, subsequent matches use subsequent-match preset
- All photo content uses circular swipecircle-photo-frame for avatars, full-bleed with gradient overlay for cards
- Demo mode (localStorage flag 'sc_demo' = true) populates 30 mock cards on first /discover load, 12 mock matches, and 3 pre-existing chat threads with sample histories

## Theme Decorators

Theme `swipecircle` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- swipe-feed
- primary
- mobile-tab-bar
- swipecircle
- light
- swipe-deck
- matches
- match-celebration
- chat
- profile
- filter-bar
- tab-navigation
- empty-states
- demo-mode
- keyboard-shortcuts
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
- form

## Success Checks
- Section pages and routes remain coherent with the compiled topology. [error]
- The section shell contract stays consistent across its routes. [error]
- Primary section patterns are represented without adding off-contract filler sections. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
