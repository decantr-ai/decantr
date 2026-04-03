# Section: auth-flow-enterprise

**Role:** gateway | **Shell:** centered | **Archetype:** auth-flow-enterprise
**Description:** Enterprise authentication flow with SSO, MFA, org creation during registration, and team invitation acceptance for multi-tenant SaaS platforms.

## Quick Start

**Shell:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Pages:** 4 (login, register, sso, invite-accept)
**Key patterns:** login-form [moderate], register-form [moderate], sso-form [moderate], invite-form [moderate]
**CSS classes:** `.lp-nav`, `.lp-header`, `.lp-fade-in`, `.mono-data`
**Density:** comfortable
**Voice:** Professional, developer-friendly.

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

auth, sso, mfa, invite-flow

---

## Visual Direction

**Personality:** Enterprise-grade platform console built for trust and scale. Navy-to-violet gradient accents on clean white/dark surfaces. Organization switcher prominent in the top-left. Dense data tables with inline actions. API console feels like Stripe's — polished, developer-friendly. Billing shows clear usage breakdowns. Audit logs are prominent. Lucide icons. System sans with monospace for IDs, keys, and code.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pattern Reference

### login-form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### register-form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### sso-form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### invite-form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

---

## Pages

### login (/login)

Layout: login-form

### register (/register)

Layout: register-form → org-setup

### sso (/sso)

Layout: sso-form

### invite-accept (/invite)

Layout: invite-form
