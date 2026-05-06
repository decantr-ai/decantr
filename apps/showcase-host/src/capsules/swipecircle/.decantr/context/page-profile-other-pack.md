# Page Pack

**Objective:** Implement the profile-other route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=profile-other | patterns=mobile-profile-hero, stats-bar, tech-pills, bottom-tab-bar

## Page Contract
- Page: profile-other
- Path: /u/:userId
- Shell: mobile-tab-bar
- Section: swipe-feed (primary)
- Theme: swipecircle (light)
- Features: swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts
- Surface: _flex _col _gap4

## Page Patterns
- mobile-profile-hero -> mobile-profile-hero [stack | other-profile]
  > Profile hero for another user (/u/:id route). Three action buttons: Message (primary), Like Again (secondary), Report (tertiary). Includes a back button at top-left.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] scroll-reveal
  - [ ] scale-hover
  - [ ] stagger-children
  - [ ] animate-on-mount
  - [ ] click-select
  - [ ] keyboard-navigation
- stats-bar -> stats-bar [row | default]
  > Equal-width stat items in a row
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
- tech-pills -> tech-pills [row | standard]
  > Centered row of pill badges with uniform styling. Each pill has a rounded shape (border-radius: 20px), medium padding, semi-bold text, and a subtle hover lift. All pills use a consistent muted background with light text. Wrapped in a flex container with center justification and 12px gap. Max-width constrained to ~700px.
- bottom-tab-bar -> bottom-tab-bar [flex-row | standard]
  > Four-item bottom tab bar with icon above label. Active item has color-shift, icon scale, and underline dot. Sticky bottom on mobile, sticky bottom of centered column on desktop.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] click-select
  - [ ] scale-hover
  - [ ] keyboard-navigation
  - [ ] animate-on-mount

## Page Directives

Execution-level rules for this route. Follow exactly.

- Profile hero uses other-profile preset: cover, avatar, name+age+bio, three action buttons (Message coral pill / Like Again white-bordered pill / Report icon-only ghost). Back button at top-left of cover.
- Stats-bar shows: 'Joined {date}', 'Active {timestamp}', 'Mutual matches: N' — informational, not numeric metrics.
- Interests display: shared interests highlighted (coral-filled), other interests in muted-border style.
- Bottom-tab-bar inherits active state from the page user navigated from (typically Matches or Chat). Hidden on input focus is N/A here (no input).

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
