# Section: marketing-saas

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-saas
**Description:** SaaS marketing landing page with hero, features, how-it-works timeline, pricing, testimonials, and CTA sections.
**Shell structure:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer.
**Regions:** header, body, footer

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:** carbon-card, carbon-code, carbon-glass, carbon-input, carbon-canvas, carbon-divider, carbon-skeleton, carbon-bubble-ai, carbon-fade-slide, carbon-bubble-user

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

pricing-toggle, testimonials, feature-grid

---

**Personality:** See scaffold.md for personality and visual direction.

## Pattern Reference

### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Components:** Button, icon

**Layout slots:**
- `media`: Optional image, illustration, or chart component
- `headline`: Primary heading, typically h1 with _heading1
- `cta-group`: Horizontal Button group with _flex _gap3
- `description`: Supporting paragraph with _body _muted

### features



**Components:** Card, Icon, Text

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text

### how-it-works



**Components:** Card, Icon, Text, Badge

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)

### pricing



**Components:** Card, Button, Badge

**Layout slots:**
- `tiers`: Pricing tier cards (name, price, features list, CTA button)
- `toggle`: Monthly/annual billing toggle (optional)

### testimonials



**Components:** Card, Avatar, Text

**Layout slots:**
- `quotes`: Testimonial cards (quote text, author name, role, avatar)

### cta



**Components:** Button, Text

**Layout slots:**
- `headline`: CTA headline text
- `description`: Supporting description text
- `actions`: CTA button(s)

---

## Pages

### home (/)

Layout: hero → features → how-it-works → pricing → testimonials → cta
