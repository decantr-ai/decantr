# Section: recipefork-auth

**Role:** gateway | **Shell:** recipefork-top-nav | **Archetype:** recipefork-auth
**Description:** Recipefork's shared-shell authentication entry surface. The auth card lives inside the product navbar shell rather than switching to a detached centered-only auth layout.

## Quick Start

**Shell:** Shared Recipefork application shell with sticky top nav, compact utility actions, and a wide scrollable content region below. Mirrors the current app's persistent nav model across public and authenticated product routes. (header: 64px)
**Pages:** 1 (login)
**Key patterns:** auth-form
**Density:** comfortable
**Voice:** Encouraging, practical, and food-aware without becoming gimmicky.

## Shell Implementation (recipefork-top-nav)

### root

- **display:** flex
- **direction:** column
- **min_height:** 100vh
- **atoms:** _flex _col _minh[100vh]

### header

- **height:** 64px
- **display:** flex
- **align:** center
- **justify:** space-between
- **padding:** 0 1rem
- **border:** bottom
- **sticky:** true
- **z_index:** 20
- **background:** recipefork-nav
- **left_content:** Brand icon + Recipefork wordmark
- **center_content:** Home, Chat, Generate, Feed, Cookbooks navigation links
- **right_content:** Create Recipe CTA + theme toggle + notification bell + profile button or sign-in button + mobile menu trigger
- **button_sizing:** Use compact controls. Create CTA should feel prominent but still fit inside the 64px row without oversized padding.

### body

- **flex:** 1
- **overflow_y:** auto
- **padding:** 0
- **atoms:** _flex1 _overflow[auto]
- **note:** Individual pages own their spacing. Preserve the wide, app-like content region used by feed, recipe detail, profile, and authoring pages.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: comfortable (--d-density-scale: 1)

## Shell Notes (recipefork-top-nav)

- **Nav Identity:** Brand mark on the left, route links in the center-left, create CTA plus utility actions on the right. Keep the overall feel product-like rather than marketing-heavy.
- **Mobile Menu:** Collapse route links into a dropdown or menu button below md breakpoint. The create action may stay visible as an icon button or move into the menu when width is constrained.
- **Auth Variation:** Unauthenticated states may still reuse the same shell. Swap the profile entry for a sign-in button while keeping spacing and alignment stable.
- **Notification Behavior:** Authenticated states include a bell menu in the utility cluster. The bell should expose unread count, recent follow/comment/reaction/save/fork activity, and quick mark-as-read behavior without forcing a dedicated page route.

## Theme Reference

**Theme:** recipefork (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 6 `recipefork-*` classes — full Class/Intent/Apply-to table in `section-recipefork-auth-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Spatial hints:** Density bias: none. Section padding: 4rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface recipefork-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Gateway (gateway) — recipefork-top-nav shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth, oauth

---

## Visual Direction

**Personality:** Recipefork is a neutral, production-grade recipe product that lets food photography and authoring depth carry the experience. Public browsing feels clean and modern; Chef Mode is the critical differentiator, with structured ingredients, nested instruction groups, optional plating presentation, dynamic cooking tips, explicit recipe visibility controls, draft workflows, and no-loss hydrated editing.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

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

### login (/auth)

Layout: auth-form (login)
