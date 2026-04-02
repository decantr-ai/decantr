# Section: legal

**Role:** public | **Shell:** top-nav-footer | **Archetype:** legal
**Description:** Legal pages including privacy policy, terms of service, and cookie policy with sticky TOC and print-friendly layout.
**Shell structure:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer.
**Regions:** header, body, footer

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme tokens:** see `src/styles/tokens.css` — use `var(--d-primary)`, `var(--d-bg)`, etc.

**Decorators:** see `src/styles/decorators.css` — available classes: carbon-card, carbon-code, carbon-glass, carbon-input, carbon-canvas, carbon-divider, carbon-skeleton, carbon-bubble-ai, carbon-fade-slide, carbon-bubble-user

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

toc-navigation, print-friendly, smooth-scroll

---

**Personality:** Production-ready AI chatbot with refined glassmorphic depth.... (full details in scaffold.md)

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
