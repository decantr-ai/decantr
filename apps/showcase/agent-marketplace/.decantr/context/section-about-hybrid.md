# Section: about-hybrid

**Role:** public | **Shell:** top-nav-footer | **Archetype:** about-hybrid
**Description:** About page combining hero, company story, team grid, values, and call-to-action sections.
**Shell structure:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer.
**Regions:** header, body, footer

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Decorators:** `carbon-card`, `carbon-code`, `carbon-glass`, `carbon-input`, `carbon-canvas`, `carbon-divider`, `carbon-skeleton`, `carbon-bubble-ai`, `carbon-fade-slide`, `carbon-bubble-user` (see `src/styles/decorators.css`)
Usage: `className={css('_flex _col') + ' carbon-card'}` — atoms via css(), decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

team-grid, values-display

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

### story



**Components:** Text, Image

**Layout slots:**
- `content`: Story/about narrative text content

### team



**Components:** Card, Avatar, Text

**Layout slots:**
- `members`: Team member cards (avatar, name, role)

### values



**Components:** Card, Icon, Text

**Layout slots:**
- `values`: Value cards (icon/emoji, title, description)

### cta



**Components:** Button, Text

**Layout slots:**
- `headline`: CTA headline text
- `description`: Supporting description text
- `actions`: CTA button(s)

---

## Pages

### about (/about)

Layout: hero → story → team → values → cta
