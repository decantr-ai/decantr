# Mutation Pack

**Objective:** Execute the modify workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=home, rewards, updates, story, demo, checkout, thanks, press | patterns=campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta, launch-update-log, pledge-checkout-panel, share-quest-panel, press-kit-shelf

## Mutation Contract
- Operation: modify
- Shell: full-bleed
- Theme: retro-arcade (dark)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout

## Route Topology
- / -> launch-campaign/home @ full-bleed [campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta]
- /rewards -> launch-campaign/rewards @ full-bleed [reward-tier-selector, product-box-spec-panel, backer-progress-console, continue-screen-cta]
- /updates -> launch-campaign/updates @ full-bleed [launch-update-log, backer-progress-console, continue-screen-cta]
- /story -> launch-campaign/story @ full-bleed [founder-comic-strip, product-box-spec-panel, continue-screen-cta]
- /demo -> launch-campaign/demo @ full-bleed [prototype-demo-bezel, product-box-spec-panel, continue-screen-cta]
- /checkout -> launch-campaign/checkout @ full-bleed [pledge-checkout-panel]
- /thanks -> launch-campaign/thanks @ full-bleed [continue-screen-cta, share-quest-panel, backer-wall-ticker]
- /press -> launch-campaign/press @ full-bleed [press-kit-shelf, product-box-spec-panel]

## Workflow
- Read the page pack for the route you are modifying first.
- Stop and update the essence before changing route, shell, or pattern contracts.
- Validate and check drift after code changes complete.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- modify
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

## Success Checks
- Modified routes remain coherent with the compiled topology unless the essence changes first. [error]
- Theme, shell, and page identity stay aligned with the current contract during edits. [error]
- Route-local edits should start from the compiled page pack rather than improvised structure. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
