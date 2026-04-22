# Section Pack

**Objective:** Implement the marketing-saas section using the compiled top-nav-footer shell contract.
**Target:** react-vite (react)
**Scope:** pages=home | patterns=hero, features, how-it-works, pricing, testimonials, cta

## Section Contract
- Section: marketing-saas
- Role: public
- Shell: top-nav-footer
- Theme: carbon-neon (dark)
- Features: pricing-toggle, testimonials, feature-grid
- Description: SaaS marketing landing page with hero, features, how-it-works timeline, pricing, testimonials, and CTA sections.

## Section Routes
- / -> home @ top-nav-footer [hero, features, how-it-works, pricing, testimonials, cta]

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- marketing-saas
- public
- top-nav-footer
- carbon-neon
- dark
- pricing-toggle
- testimonials
- feature-grid
- hero
- features
- how-it-works
- pricing
- cta

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
