# Section: auth-full

**Role:** gateway | **Shell:** centered | **Archetype:** auth-full
**Description:** Complete authentication flow with login, register, forgot password, reset password, email verification, and MFA setup/verify.

## Quick Start

**Shell:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Pages:** 8 (login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify)
**Key patterns:** auth-form
**Theme decorators:** 10 classes — see `section-auth-full-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Playful, warm, encouraging — never desperate, never pushy.

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

**Theme:** swipecircle (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 10 `swipecircle-*` classes — full Class/Intent/Apply-to table in `section-auth-full-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Compositions:** **swipe-feed:** Photo-first swipe deck centered in the viewport with floating action bar above bottom tabs. Coral and violet accents punctuate the warm peach surface.
**matches:** Grid of circular avatar tiles with new-match dots, presence rail at top. Soft tile lift on hover with coral glow.
**chat:** Intimate one-to-one chat with rounded bubbles and warm timestamps. Coral mine, cream theirs.
**profile:** Mobile profile with full-bleed cover photo, overlapping circular avatar, stats bar, interest pills, and pill-shaped action buttons.
**auth:** Single centered card on warm peach background. Coral primary CTA, violet hover state. Bouncy entrance.
**marketing:** Splash with photo-first hero, swipe-card/photo mockups, pill CTAs, warm off-white scroll surface, and coral/violet accents. Friendly, not corporate. Avoid ambient blobs/orbs or a single solid peach hero slab.
**Spatial hints:** Density bias: none. Section padding: 1.5rem. Card wrapping: rounded-photo.


Usage: `className={css('_flex _col _gap4') + ' d-surface swipecircle-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Gateway (gateway) — centered shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth, mfa, oauth, email-verification, password-reset

---

## Visual Direction

**Personality:** Mobile-first social discovery with playful coral-pink energy and warm peach undertones. Photo-centric swipe deck dominates the screen — cards feel tactile, almost like polaroids you'd shuffle through. Pill-shaped buttons everywhere with bouncy spring physics. Soft drop shadows replace harsh borders. Bottom tabs provide always-visible navigation. Match moments feel celebratory with a coral-to-violet burst; chats feel intimate with rounded bubbles and warm timestamps. Empty states encourage rather than scold. Designed to feel native on iPhone but elegantly scaled on desktop with a 480px-wide centered column. Hinge meets BeReal meets a Dribbble shot — never desperate, always inviting. Every interaction rewards: the spring of a card, the burst of a like, the warmth of a new match.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Constraints

- **mode:** light
- **effects:** {"max_width_app":"480px","photo_aspect":"3/4","tab_bar_height":"64px","header_height":"52px","swipe_threshold":"30%","card_size":"320x420"}

---

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

Layout: auth-form (login)

### register (/auth-full/register)

Layout: auth-form (register)

### forgot-password (/auth-full/forgot-password)

Layout: auth-form (forgot-password)

### reset-password (/auth-full/reset-password)

Layout: auth-form (reset-password)

### verify-email (/auth-full/verify-email)

Layout: auth-form (verify-email)

### mfa-setup (/auth-full/mfa-setup)

Layout: auth-form (mfa-setup)

### mfa-verify (/auth-full/mfa-verify)

Layout: auth-form (mfa-verify)

### phone-verify (/auth-full/phone-verify)

Layout: auth-form (phone-verify)
