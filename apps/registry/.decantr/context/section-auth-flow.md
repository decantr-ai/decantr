# Section: auth-flow

**Role:** gateway | **Shell:** centered | **Archetype:** auth-flow
**Description:** Login, registration, and password recovery with OAuth support

## Quick Start

**Shell:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Pages:** 3 (login, register, forgot-password)
**Key patterns:** auth-form
**Theme decorators:** 11 classes — see `section-auth-flow-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Welcoming and developer-friendly.

## Shell Implementation (centered)

### body

- **note:** Single centered card. No sidebar, no header. Auth forms use 28rem, wider content 36rem.
- **width:** 100%
- **padding:** 1.5rem
- **treatment:** d-surface
- **border_radius:** var(--d-radius-lg)
- **max_width_auth:** 28rem
- **max_width_wide:** 36rem

### root

- **align:** center
- **atoms:** _flex _aic _jcc _minh[100vh]
- **display:** flex
- **justify:** center
- **background:** var(--d-bg)
- **min_height:** 100vh

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (centered)

- **Max Width:** Centered content should be constrained to max-width: 28rem (448px) for auth forms, 36rem (576px) for wider content.
- **Shell Spacing:** Centered shell owns viewport centering, outer padding, and maximum-width rhythm. Route components should render the card contents only and must not add nested full-height centering wrappers.
- **Vertical Centering:** Center the content card vertically using min-height: 100dvh with flexbox centering.

## Theme Reference

**Theme:** luminarum (dark) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 11 `luminarum-*` classes — full Class/Intent/Apply-to table in `section-auth-flow-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 7.5rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface luminarum-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Gateway (gateway) — centered shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth

---

## Visual Direction

**Personality:** Vibrant design intelligence registry. Warm coral and amber accents on a rich dark canvas (or crisp warm-white in light mode). Content cards are the hero — outlined with colored type borders, hovering with purpose. Search is instant and faceted. Publishing feels like sharing art. The Decantr dogfood app — built with its own system, proudly showing what the platform produces. Think Figma Community meets shadcn/ui registry.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Constraints

- **effects:** {"doctrine-security-data":"Preserve the existing Supabase auth, admin authorization, billing, API-key, telemetry attribution, privacy, and hosted-registry service boundaries unless a reviewed task explicitly changes them.","doctrine-design-system":"Preserve the registry's Luminarum token bridge, Decantr treatments, shell rhythm, and public/admin/dashboard styling contracts while evolving individual pages."}

---

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### auth-form

Unified authentication form with multiple modes: login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify.

**Visual brief:** Centered single-column form card constrained to 400px max-width. Header area shows logo and a welcome title. Form fields stack vertically with labeled inputs for email and password. A horizontal divider with 'or continue with' text separates the form from OAuth provider buttons (Google, GitHub icons in bordered pill buttons). Footer contains muted text links for Register and Forgot Password. Error messages appear inline below inputs in destructive color. MFA presets show a 6-digit code input with large separated character boxes. Verify-email preset centers a large mail icon with instructional text.

**Components:** Button, icon

**Layout slots:**
- `form`: Email and password inputs
- `error`: Inline error message area
- `oauth`: Social login buttons (Google, GitHub, etc.)
- `footer`: Register and forgot password links
- `header`: Logo and welcome title
- `divider`: 'or continue with' separator
  **Layout guidance:**
  - field_stack: Fields, CTA, OAuth buttons, and footer links should align to one stable column width. OAuth rows should feel like part of the form, not a detached widget.
  - shell_ownership: The centered shell owns viewport centering and the outer card frame. Route components should render auth content inside that card rhythm, not add another full-height centering wrapper.
  - verification_states: Pending-email, MFA, and reset-success states should feel like transitions of the same auth surface rather than unrelated page layouts.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Buttons and OAuth rows use calm hover and focus transitions. Code-entry boxes may softly highlight the active digit slot. |
| transitions | State changes between login, register, reset, and MFA should cross-fade or slide minimally over 180-250ms. |
| ambient | Do not add decorative ambient motion inside auth forms beyond a gentle entrance treatment. |

**Responsive:**
- **Mobile (<640px):** Form takes full width with horizontal padding. OAuth buttons stack vertically. MFA code inputs remain large for touch targets. Footer links stack.
- **Tablet (640-1024px):** Centered 400px form. Standard spacing. OAuth buttons render in a row.
- **Desktop (>1024px):** Centered form with generous padding. All elements comfortably spaced in their standard layout.

**Accessibility:**
- Role: `form`
- Keyboard: Tab moves through fields, provider buttons, and footer links in a logical order.; Enter submits the current form when focus is inside the primary auth field group.; OTP and MFA inputs should support sequential typing and backspace navigation between code slots.
- Announcements: Announce inline validation errors with field-specific guidance.; Announce verification-success and reset-email-sent states explicitly.
- Focus: Move focus to the first invalid field after validation failure. When auth mode changes, move focus to the heading or first interactive field in the new mode.


---

## Pages

### login (/login)

Layout: auth-form

### register (/login?mode=register)

Layout: auth-form (register)

### forgot-password (/login?mode=forgot-password)

Layout: auth-form (reset)
