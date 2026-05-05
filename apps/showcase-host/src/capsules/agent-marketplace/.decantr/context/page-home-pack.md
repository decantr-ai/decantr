# Page Pack

**Objective:** Implement the home route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=home | patterns=hero, features, how-it-works, pricing, testimonials, cta

## Page Contract
- Page: home
- Path: /
- Shell: top-nav-footer
- Section: marketing-saas (public)
- Theme: carbon-neon (dark)
- Features: pricing-toggle, testimonials, feature-grid
- Surface: _flex _col _gap4 _p4 _overauto _flex1

## Page Patterns
- hero -> hero [stack | landing]
- features -> features [grid | grid]
- how-it-works -> how-it-works [grid | horizontal]
- pricing -> pricing [stack | standard]
- testimonials -> testimonials [grid | grid]
- cta -> cta [hero | standard]

## Required Setup
- Keep the compiled route and shell contract stable for this page.
- Treat the listed page patterns as the primary structure for this route.

## Allowed Vocabulary
- home
- top-nav-footer
- marketing-saas
- public
- carbon-neon
- dark
- pricing-toggle
- testimonials
- feature-grid
- hero
- stack
- features
- grid
- how-it-works
- pricing
- cta

## Success Checks
- The page keeps the compiled route, shell, and section contract intact. [error]
- The page preserves its primary compiled patterns instead of drifting into unrelated layouts. [error]
- Any declared wiring signals remain coherent with the rendered page structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
