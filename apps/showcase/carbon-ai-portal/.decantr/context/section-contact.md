# Section: contact

**Role:** public | **Shell:** top-nav-footer | **Archetype:** contact
**Description:** Contact page with hero header and working contact form with validation and spam protection.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

## Decorators (carbon recipe)

No decorators defined.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

form-validation, spam-protection, file-attachment

---

## Personality

professional, minimal, developer-focused, polished

---

## Pages

### contact (/contact)

Layout: hero → form

#### Pattern: hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Components:** Button, icon

**Layout slots:**
- `media`: Optional image, illustration, or chart component
- `headline`: Primary heading, typically h1 with _heading1
- `cta-group`: Horizontal Button group with _flex _gap3
- `description`: Supporting paragraph with _body _muted

#### Pattern: form



**Components:** 

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
