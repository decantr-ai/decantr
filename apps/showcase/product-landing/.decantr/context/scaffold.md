# Scaffold: landing-hero

**Blueprint:** product-landing
**Theme:** luminarum
**Personality:** Bold, high-impact product landing page designed to convert. Dark premium background with vibrant geometric accent elements. Split hero with confident typography and a prominent CTA button. Feature sections alternate between full-bleed and contained layouts for visual rhythm. Social proof is prominent — logos, testimonials, case study snippets. The pricing section is clear and decisive. Below-the-fold content builds the narrative: problem → solution → proof → action. Blog/resources add SEO depth. Lucide icons. Mobile-first, fast-loading.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Confident and compelling. Sells the vision, not features.
**CTA verbs:** Start, Try, Explore, See, Learn, Get Started
**Avoid:** Submit, Click here, Please enter, Buy now, Sign up today
**Empty states:** N/A for landing pages — all content is authored, not user-generated.
**Errors:** Minimal. Form submission errors should be inline and specific. Never break the conversion flow.
**Loading states:** Hero content loads instantly (SSR/SSG). Below-fold sections fade in on scroll intersection. No loading states visible to users.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** landing-hero + landing-resources + landing-legal

### Zones

**App** — full-bleed shell
  Archetypes: landing-hero
  Purpose: High-impact product landing page with split hero, feature sections, how-it-works flow, pricing, testimonials, and conversion-optimized CTAs. Full-bleed scroll experience designed to convert visitors.
  Features: marketing, seo, analytics

**App (auxiliary)** — top-nav-main shell
  Archetypes: landing-resources, landing-legal
  Purpose: Resources and blog section for a product landing site. Provides SEO depth with blog posts, guides, and resource listings that support the main product narrative. Legal pages for a product landing site including privacy policy and terms of service. Clean prose layouts for legal content.
  Features: seo, search, rss

### Default Entry Points

  Anonymous users enter: gateway
  Authenticated users enter: primary zone
  Auth redirect target: primary zone


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| landing-hero | primary | full-bleed | home, demo | marketing, seo, analytics |
| landing-resources | auxiliary | top-nav-main | blog, blog-post, resources | seo, search, rss |
| landing-legal | auxiliary | top-nav-footer | privacy, terms | seo |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | landing-hero | home |
| /blog | landing-resources | blog |
| /demo | landing-hero | demo |
| /terms | landing-legal | terms |
| /privacy | landing-legal | privacy |
| /blog/:id | landing-resources | blog-post |
| /resources | landing-resources | resources |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-landing-hero.md
- .decantr/context/section-landing-resources.md
- .decantr/context/section-landing-legal.md

## SEO Hints

**Schema.org types:** WebSite, SoftwareApplication, Product
**Meta priorities:** description, og:title, og:image

## Navigation

- Hotkeys: 3 configured
