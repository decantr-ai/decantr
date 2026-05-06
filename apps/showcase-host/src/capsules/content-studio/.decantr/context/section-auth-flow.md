# Section: auth-flow

**Role:** gateway | **Shell:** centered | **Archetype:** auth-flow
**Description:** Login, registration, and password recovery with OAuth support

## Quick Start

**Shell:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Pages:** 3 (login, register, forgot-password)
**Key patterns:** auth-form
**Theme decorators:** 5 classes — see `section-auth-flow-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Clear, editorial, and operational.

## Shell Implementation (centered)

### root

- **display:** flex
- **align:** center
- **justify:** center
- **min_height:** 100vh
- **background:** var(--d-bg)
- **atoms:** _flex _aic _jcc _minh[100vh]

### body

- **width:** 100%
- **max_width_auth:** 28rem
- **max_width_wide:** 36rem
- **padding:** 1.5rem
- **treatment:** d-surface
- **border_radius:** var(--d-radius-lg)
- **note:** Single centered card. No sidebar, no header. Auth forms use 28rem, wider content 36rem.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (centered)

- **Max Width:** Centered content should be constrained to max-width: 28rem (448px) for auth forms, 36rem (576px) for wider content.
- **Vertical Centering:** Center the content card vertically using min-height: 100dvh with flexbox centering.
- **Shell Spacing:** Centered shell owns viewport centering, outer padding, and maximum-width rhythm. Route components should render the card contents only and must not add nested full-height centering wrappers.

## Theme Reference

**Theme:** editorial (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 5 `editorial-*` classes — full Class/Intent/Apply-to table in `section-auth-flow-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Spatial hints:** Density bias: none. Section padding: 6rem. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface editorial-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Gateway (gateway) — centered shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth

---

## Visual Direction

**Personality:** Focused editorial workspace for writers and editors. The interface should feel quiet, efficient, and typographically disciplined. Writing and publishing tools are present, but the chrome stays secondary to the article work itself. Think editorial CMS rather than noisy analytics dashboard.

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### auth-form

Unified authentication form with multiple modes: login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify.

**Components:** Button, icon

**Layout slots:**
- `header`: Logo and welcome title
- `form`: Email and password inputs
- `oauth`: Social login buttons (Google, GitHub, etc.)
- `divider`: 'or continue with' separator
- `footer`: Register and forgot password links
- `error`: Inline error message area
  **Layout guidance:**
  - shell_ownership: The centered shell owns viewport centering and the outer card frame. Route components should render auth content inside that card rhythm, not add another full-height centering wrapper.
  - field_stack: Fields, CTA, OAuth buttons, and footer links should align to one stable column width. OAuth rows should feel like part of the form, not a detached widget.
  - verification_states: Pending-email, MFA, and reset-success states should feel like transitions of the same auth surface rather than unrelated page layouts.

---

## Pages

### login (/login)

Layout: auth-form

### register (/register)

Layout: auth-form (register)

### forgot-password (/forgot-password)

Layout: auth-form (reset)
