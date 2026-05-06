# Section: marketing-esports

**Role:** public | **Shell:** immersive-stage | **Archetype:** marketing-esports
**Description:** Public esports homepage surface for a live matchday command product with a full-bleed broadcast hero, roster proof, telemetry, and cinematic conversion path.

## Quick Start

**Shell:** `immersive-stage`
**Pages:** 1 (`/`)
**Key pattern:** `esports-matchday-command`
**Density:** cinematic, above-the-fold first
**Voice:** Live broadcast command, competitive, professional.

Use this section as a greenfield alternative to the standard marketing landing page. It should not read as a centered hero followed by card sections. The first viewport is the product: live match state, team-versus-team tension, roster proof, rolling updates, and angular watch actions.

## Shell Implementation (immersive-stage)

### root

- Full-bleed dark stage with `min-height: 100dvh`.
- No page-level content card, no centered shell container around the home route.
- Horizontal overflow must be clipped at the stage/root level.

### header

- Fixed flush header, full viewport width.
- Bottom accent line spans the full header width, fading from cyan on the left to neutral center to red on the right.
- Brand uses a controller/gamepad icon mark with no decorative left stroke.
- Header links are compact anchors into the home page: `#war-room`, `#roster`, `#access`.
- CTA remains compact and angular.

### body

- The home route owns its own spatial system.
- Top padding only accounts for the fixed header.
- Hero, roster panel, command layers, and access teaser are full-bleed stage regions, not cards inside cards.

### Anti-patterns

- Do not use the default `hero`, `features`, `testimonials`, or `cta-section` stack for this page.
- Do not wrap the hero in `d-surface` or generic card grids.
- Do not center all content in one column on desktop.
- Do not use pill-heavy badges as visual proof.
- Do not use decorative shapes that compete with the match story.

## Guard Context

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

This section intentionally stretches the usual public-page pattern grammar. The contract still needs predictable regions, accessible actions, reduced-motion support, and responsive reflow, but visual composition can be cinematic and free-form.

## Visual Direction

**Personality:** Production esports matchday command surface. Think broadcast truck, coach room, and arena telemetry fused into one polished home page. The hero should make a real match feel live: Team Vitality versus r3Fraction, score state, map context, momentum, player form, and rolling match updates. Use aggressive but controlled typography, angular CTAs, glow accents, dark glass, and motion that supports urgency without becoming noisy.

**Theme direction:**

| Token | Role |
|-------|------|
| `--hq-cyan` | Live systems, header accent, controls |
| `--hq-green` | Positive status, primary CTA, live confirmation |
| `--hq-red` | Opponent tension, warning, match volatility |
| `--hq-violet` | Broadcast depth and arena energy |
| `--hq-bg` | Near-black stage canvas |
| `--hq-ink` | High-contrast headline and primary text |

## Pattern Reference

### esports-matchday-command

Full-bleed esports matchday homepage with a live match hero, compact broadcast telemetry, angular animated CTAs, a right-side roster panel, vertical rolling update reel, command layers, and a secure team access teaser.

**Visual brief:** The page should feel like a live broadcast control surface rather than a SaaS landing page. The first viewport uses an oversized italic match headline, a real score strip, and a glass roster panel that proves the product is actively tracking a match. Motion appears as title gleam, beacon pulse, radar drift, hover sweeps, and a vertical update reel.

**Layout slots:**

| Slot | Purpose |
|------|---------|
| `match-eyebrow` | Live venue or broadcast source label |
| `match-title` | Team-versus-team headline with integrated `vs` marker |
| `supporting-copy` | Practical match operations copy, not generic value props |
| `telemetry-strip` | Inline score and live match metrics |
| `primary-actions` | Angular `Watch Live` and replay actions |
| `roster-panel` | Compact team matchup roster with circular avatars |
| `update-reel` | Vertical live match event feed inside the roster panel |
| `command-layers` | Free-form lower section describing operational layers |
| `access-teaser` | Secure team portal preview and login CTA |

**Motion:**

| Interaction | Animation |
|-------------|-----------|
| title | White headline stays readable while a bright gleam sweeps across on load and repeats every 4s |
| live CTA | Beacon pulse and hover shine |
| update reel | Vertical rolling feed with top/bottom fade mask |
| radar | Slow ambient rotation, desktop biased left |
| reduced motion | Disable continuous motion and keep static states readable |

**Responsive:**

- Desktop: hero text begins at the left edge of the content frame, roster panel occupies roughly the right third, radar sits top-left, header is flush full-width.
- Tablet: hero stacks above roster panel, telemetry remains compact, command layers become shallower.
- Mobile: title size reduces, `vs` stays integrated without clipping, telemetry becomes two columns or one column on narrow screens, roster rows stack, CTAs become full-width.

**Accessibility:**

- Home section uses `aria-labelledby` for the match title.
- Roster and update reel have descriptive `aria-label` values.
- Buttons are real buttons and keep visible focus states from the base runtime.
- Motion must respect `prefers-reduced-motion`.

## Pages

| Page | Route | Layout |
|------|-------|--------|
| home | `/` | `esports-matchday-command` |
