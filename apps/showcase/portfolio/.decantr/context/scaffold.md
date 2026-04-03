# Scaffold: portfolio-showcase

**Blueprint:** portfolio
**Theme:** auradecantism
**Personality:** Bold, expressive portfolio that lets the work shine. Large hero with confident typography and strong CTA. Project showcases use generous whitespace and large imagery. Dark backgrounds make visual work pop. Case studies flow like stories with full-bleed images and concise text blocks. The about page is personal but professional — one strong photo, concise bio, skill badges. Blog posts use comfortable reading typography. Lucide icons. Every pixel showcases craft.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Confident and personal. Shows, doesn't tell.
**CTA verbs:** View, Explore, Read, Connect, Download, Browse
**Avoid:** Submit, Click here, Please enter, Buy now
**Empty states:** Minimal and intentional. A portfolio with no projects yet should feel like a canvas waiting to be filled, with a prompt to add the first piece.
**Errors:** Brief and low-key. Contact form errors should guide without breaking the creative flow.
**Loading states:** Fade-in content blocks with subtle opacity transitions. No spinners — the portfolio should feel curated, not loading.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** portfolio-showcase + portfolio-about + portfolio-blog + auth-flow + settings

### Zones

**Gateway** — centered shell
  Archetypes: auth-flow
  Purpose: Login, registration, and password recovery with OAuth support
  Features: auth

**App** — full-bleed shell
  Archetypes: portfolio-showcase
  Purpose: Project grid and detail views for portfolio work. Full-bleed layouts with large imagery and generous whitespace to let creative work shine.
  Features: gallery, lightbox, lazy-loading

**App (auxiliary)** — top-nav-main shell
  Archetypes: portfolio-about, portfolio-blog, settings
  Purpose: Bio, skills, and contact pages for a personal portfolio. Professional yet personal presentation with skill badges and a contact form. Blog listing and post detail pages for a portfolio site. Comfortable reading typography with breadcrumb navigation. Application settings and preferences page
  Features: contact-form, social-links, markdown, syntax-highlight, reading-time

### Zone Transitions

  Gateway → App: gate-pass (authentication)
  App → Gateway: gate-return (authentication)

### Default Entry Points

  Anonymous users enter: gateway
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| portfolio-showcase | primary | full-bleed | projects, project-detail | gallery, lightbox, lazy-loading |
| portfolio-about | auxiliary | top-nav-main | about, skills, contact-page | contact-form, social-links |
| portfolio-blog | auxiliary | top-nav-main | blog, blog-post | markdown, syntax-highlight, reading-time |
| auth-flow | gateway | centered | login, register, forgot-password | auth |
| settings | auxiliary | sidebar-main | settings | none |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| /blog | portfolio-blog | blog |
| /about | portfolio-about | about |
| /login | auth-flow | login |
| /skills | portfolio-about | skills |
| /contact | portfolio-about | contact-page |
| /blog/:id | portfolio-blog | blog-post |
| /projects | portfolio-showcase | projects |
| /register | auth-flow | register |
| /settings | settings | settings |
| /projects/:id | portfolio-showcase | project-detail |
| /forgot-password | auth-flow | forgot-password |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-portfolio-showcase.md
- .decantr/context/section-portfolio-about.md
- .decantr/context/section-portfolio-blog.md
- .decantr/context/section-auth-flow.md
- .decantr/context/section-settings.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| auth-form | auth-flow/login, auth-flow/register, auth-flow/forgot-password |

## SEO Hints

**Schema.org types:** WebSite, Person, ProfilePage, Blog
**Meta priorities:** description, og:title, og:image

## Navigation

- Command palette: enabled
- Hotkeys: 5 configured
