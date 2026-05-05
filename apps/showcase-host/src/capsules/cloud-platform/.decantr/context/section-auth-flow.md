# Section: auth-flow

**Role:** gateway | **Shell:** centered | **Archetype:** auth-flow
**Description:** Login, registration, and password recovery with OAuth support

## Quick Start

**Shell:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Pages:** 2 (login, register)
**Key patterns:** auth-form
**CSS classes:** `.lp-nav`, `.lp-header`, `.lp-fade-in`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and trustworthy.

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
- **atoms:** _flex _center _minh[100vh]
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
- **Vertical Centering:** Center the content card vertically using min-height: 100dvh with flexbox centering.

## Spacing Guide

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Content gap | `--d-content-gap` | `1rem` | Gap between sibling elements |
| Section padding | `--d-section-py` | `5rem` | Vertical padding on d-section |
| Surface padding | `--d-surface-p` | `1.25rem` | Inner padding for d-surface |
| Interactive V | `--d-interactive-py` | `0.5rem` | Vertical padding on buttons |
| Interactive H | `--d-interactive-px` | `1rem` | Horizontal padding on buttons |
| Control | `--d-control-py` | `0.5rem` | Vertical padding on inputs |
| Data row | `--d-data-py` | `0.625rem` | Vertical padding on table rows |

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Key palette tokens:**

| Token | Value | Role |
|-------|-------|------|
| `--d-text` | `#F0EEF8` | Body text, headings, primary content |
| `--d-border` | `#2E2848` | Dividers, card borders, separators |
| `--d-primary` | `#9F6EFF` | Brand color, key interactive, selected states |
| `--d-surface` | `#141020` | Cards, panels, containers |
| `--d-bg` | `#0C0A14` | Page canvas / base layer |
| `--d-text-muted` | `#9890B0` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#B08AFF` | Hover state for primary elements |
| `--d-surface-raised` | `#1C1830` | Elevated containers, modals, popovers |
| `--d-accent` | `#06B6D4` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lp-nav` | Sticky navigation with blur backdrop. Minimal branding. |
| `.lp-header` | Large hero with gradient mesh background. |
| `.lp-fade-in` | Simple fade-in on scroll, 0.4s duration. |
| `.lp-surface` | Base surface with subtle texture. Light mode: #FAFAFA, Dark mode: #111111. |
| `.lp-card-elevated` | Card with elevation shadow, hover lift effect. |
| `.lp-gradient-mesh` | Subtle gradient mesh in primary/accent colors at 5% opacity. |
| `.lp-button-primary` | Solid primary color button with hover scale. |

**Spatial hints:** Density bias: none. Section padding: 96px. Card wrapping: standard.


Usage: `className={css('_flex _col _gap4') + ' d-surface launchpad-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Gateway (gateway) — centered shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth

---

## Visual Direction

**Personality:** Enterprise-grade cloud console built for reliability and scale. Clean, systematic layout with a left sidebar for service navigation. Status indicators use semantic colors — green healthy, amber degraded, red incident. Deploy logs stream in monospace with ANSI color support. Usage charts are functional, not decorative. Dense data tables with sort, filter, and bulk actions. Think AWS Console meets Vercel — powerful but approachable. Every view should feel like a control plane.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

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
**Responsive:**
- **Mobile (<640px):** Form takes full width with horizontal padding. OAuth buttons stack vertically. MFA code inputs remain large for touch targets. Footer links stack.
- **Tablet (640-1024px):** Centered 400px form. Standard spacing. OAuth buttons render in a row.
- **Desktop (>1024px):** Centered form with generous padding. All elements comfortably spaced in their standard layout.


---

## Pages

### login (/login)

Layout: auth-form

### register (/register)

Layout: auth-form (register)
