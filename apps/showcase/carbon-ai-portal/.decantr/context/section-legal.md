# Section: legal

**Role:** public | **Shell:** top-nav-footer | **Archetype:** legal
**Description:** Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.

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

toc-navigation, print-friendly, smooth-scroll

---

## Personality

professional, minimal, developer-focused, polished

---

## Pages

### privacy (/privacy)

Layout: content

#### Pattern: content



**Components:** 

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)

### terms (/terms)

Layout: content

#### Pattern: content



**Components:** 

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)

### cookies (/cookies)

Layout: content

#### Pattern: content



**Components:** 

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)
