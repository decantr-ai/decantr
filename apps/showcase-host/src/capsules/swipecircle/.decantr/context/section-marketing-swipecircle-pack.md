# Section Pack

**Objective:** Implement the marketing-swipecircle section using the compiled top-nav-footer shell contract.
**Target:** react-vite (react)
**Scope:** pages=home | patterns=hero-split, cta-section, features, how-it-works, testimonials, footer

## Section Contract
- Section: marketing-swipecircle
- Role: public
- Shell: top-nav-footer
- Theme: swipecircle (light)
- Features: marketing, seo, conversion, demo-mode
- Description: Public marketing landing page for SwipeCircle — a mobile-first swipe-based social rating community. Photo-first hero with 'Rate. Connect. Vibe.' tagline, dual sign-up/log-in CTAs plus a demo mode entry, feature highlights showing the swipe loop, social proof, and a final conversion CTA. Optimized for casual consumer first-impressions.

## Section Routes
- / -> marketing-swipecircle/home @ top-nav-footer [hero-split, cta-section, features, how-it-works, testimonials, footer]

## Section Navigation

Render these items in the shell's primary navigation. Exact match on label, route, and icon.

- How It Works → /#how-it-works · icon: Sparkles
- About → /#about · icon: Heart
- Log In → /login · icon: LogIn
- Sign Up → /signup · icon: UserPlus

## Section Directives

Execution-level rules every page in this section must obey. Follow exactly — these live in the pack contract, not narrative prose.

- All CTAs use pill shape (border-radius: 9999px)
- Primary buttons fill coral; secondary buttons use white border + transparent fill
- Demo Mode link sets a localStorage flag and navigates to /discover with mock data — no actual auth
- Hero must work on mobile portrait — stack hero text + CTAs vertically, swipe-card mockup moves below on narrow viewports
- Hero, auth CTA, feature cards, how-it-works, final CTA, and footer must be laid out as normal page sections with clear spacing. Do NOT use fixed/sticky CTA strips or negative margins that can cover the headline, cards, or footer content.
- Do not render implementation notes, pattern labels, Decantr guard prose, or hotkey/debug hints as visible marketing copy.
- Page is fully accessible: heading hierarchy h1→h2→h3, all CTAs keyboard-focusable with visible focus rings, alt text on all imagery

## Theme Decorators

Theme `swipecircle` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- marketing-swipecircle
- public
- top-nav-footer
- swipecircle
- light
- marketing
- seo
- conversion
- demo-mode
- hero-split
- cta-section
- features
- how-it-works
- testimonials
- footer

## Success Checks
- Section pages and routes remain coherent with the compiled topology. [error]
- The section shell contract stays consistent across its routes. [error]
- Primary section patterns are represented without adding off-contract filler sections. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
