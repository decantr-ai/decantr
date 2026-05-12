# Review Pack

**Objective:** Review generated output against the compiled Decantr contract.
**Target:** react-vite (react)
**Scope:** pages=home, rewards, updates, story, demo, checkout, thanks, press | patterns=campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta, launch-update-log, pledge-checkout-panel, share-quest-panel, press-kit-shelf

## Review Contract
- Review Type: app
- Shell: full-bleed
- Theme: retro-arcade (dark)
- Routing: history
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout

## Review Topology
- / -> launch-campaign/home @ full-bleed [campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta]
- /rewards -> launch-campaign/rewards @ full-bleed [reward-tier-selector, product-box-spec-panel, backer-progress-console, continue-screen-cta]
- /updates -> launch-campaign/updates @ full-bleed [launch-update-log, backer-progress-console, continue-screen-cta]
- /story -> launch-campaign/story @ full-bleed [founder-comic-strip, product-box-spec-panel, continue-screen-cta]
- /demo -> launch-campaign/demo @ full-bleed [prototype-demo-bezel, product-box-spec-panel, continue-screen-cta]
- /checkout -> launch-campaign/checkout @ full-bleed [pledge-checkout-panel]
- /thanks -> launch-campaign/thanks @ full-bleed [continue-screen-cta, share-quest-panel, backer-wall-ticker]
- /press -> launch-campaign/press @ full-bleed [press-kit-shelf, product-box-spec-panel]

## Focus Areas
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Review Workflow
- Read the scaffold pack and page packs before evaluating generated code.
- Compare findings against the compiled route, shell, and theme contract first.
- Escalate contract drift into essence updates when the requested output intentionally changes topology or theme identity.

## Required Setup
- Read the compiled scaffold and route packs before reviewing code.
- Use concrete evidence from the workspace instead of purely stylistic intuition.

## Allowed Vocabulary
- app
- full-bleed
- retro-arcade
- dark
- marketing
- seo
- analytics
- conversion
- campaign-progress
- reward-tiers
- preorder
- waitlist
- referrals
- press-kit
- updates
- checkout
- campaign-marquee-hero
- backer-progress-console
- prototype-demo-bezel
- product-box-spec-panel
- reward-tier-selector
- stretch-goal-ladder
- founder-comic-strip
- backer-wall-ticker
- continue-screen-cta
- launch-update-log
- pledge-checkout-panel
- share-quest-panel
- press-kit-shelf
- route-topology
- theme-consistency
- treatment-usage
- accessibility
- responsive-design

## Success Checks
- Review findings should use the compiled route, shell, and theme contract as the baseline. [error]
- Each critique finding should cite concrete evidence from the generated workspace. [error]
- Suggested fixes should point back to code changes or essence updates when contract drift exists. [warn]

## Anti-Patterns
- Avoid inline style literals as the primary styling path.: Move visual styling into tokens.css and treatments.css instead of component-local style objects.
- Avoid hardcoded color literals.: Use CSS variables and theme decorators instead of hex, rgb, or hsl values.
- Avoid utility-framework leakage as the primary design language.: Prefer compiled Decantr treatments and contract vocabulary over ad hoc utility class stacks.

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
