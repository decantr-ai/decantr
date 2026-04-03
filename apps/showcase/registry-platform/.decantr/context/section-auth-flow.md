# Section: auth-flow

**Role:** gateway | **Shell:** centered | **Archetype:** auth-flow
**Description:** Login, registration, and password recovery with OAuth support

## Quick Start

**Shell:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Pages:** 3 (login, register, forgot-password)
**Key patterns:** auth-form
**CSS classes:** `.lum-orbs`, `.lum-brand`, `.lum-glass`
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

**Guard:** guided mode | DNA violations = error | Blueprint violations = off

**Key palette tokens:**

| Token | Value | Role |
|-------|-------|------|
| `--d-cyan` | `#0AF3EB` |  |
| `--d-pink` | `#FE4474` |  |
| `--d-text` | `#FAFAFA` | Body text, headings, primary content |
| `--d-amber` | `#FDA303` |  |
| `--d-coral` | `#F58882` |  |
| `--d-green` | `#00E0AB` |  |
| `--d-border` | `#2E2E2E` | Dividers, card borders, separators |
| `--d-orange` | `#FC8D0D` |  |
| `--d-purple` | `#6500C6` |  |
| `--d-yellow` | `#FCD021` |  |
| `--d-crimson` | `#D80F4A` |  |
| `--d-primary` | `#FE4474` | Brand color, key interactive, selected states |
| `--d-surface` | `#1E1E1E` | Cards, panels, containers |
| `--d-bg` | `#141414` | Page canvas / base layer |
| `--d-text-muted` | `#A1A1AA` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#FF5C8A` | Hover state for primary elements |
| `--d-surface-raised` | `#262626` | Elevated containers, modals, popovers |
| `--d-accent` | `#FDA303` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lum-orbs` | Breathing gradient orbs behind hero/feature sections. Large radial gradients in primary/secondary/accent at 15-22% opacity, slowly pulsing and drifting. |
| `.lum-brand` | Brand text with accent color on punctuation (e.g. 'decantr.ai' with coral period and 'i'). |
| `.lum-glass` | Subtle glass panel (dark: rgba(255,255,255,0.03), light: rgba(0,0,0,0.02)) with soft border. No heavy blur — clean transparency. |
| `.lum-canvas` | Particle network background (dark: #141414, light: #FAFAF9). Scattered small dots and thin connecting lines in brand colors at low opacity. Apply to page root. |
| `.lum-divider` | Section divider: thin horizontal line with centered colored dot. Dot color matches the next section's accent. |
| `.lum-fade-up` | Scroll-reveal animation: fade in + translate up 24px over 0.6s. |
| `.lum-particles` | Fixed-position small dots (2-8px) in brand colors scattered across the viewport at 15% opacity with subtle pulse animation. |
| `.lum-stat-glow` | Number badge with filled circle in accent color, contrasting text inside. |
| `.lum-code-block` | Code block (dark: #111113, light: #F5F5F4) with colored top border (2px) matching section accent. Monospace font, syntax highlighting. |
| `.lum-card-vibrant` | Filled card with vibrant gradient background, white text, corner accent brackets. |
| `.lum-card-outlined` | Outlined card with colored border stroke, transparent bg, colored heading. The stroke color comes from the section's accent. |

**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 120px. Card wrapping: minimal.


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

### register (/auth-flow/register)

Layout: auth-form (register)

### forgot-password (/auth-flow/forgot-password)

Layout: auth-form (reset)
