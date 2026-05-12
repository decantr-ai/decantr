# Mutation Pack

**Objective:** Execute the add-page workflow against the compiled app contract.
**Target:** react-vite (react)
**Scope:** pages=home, rewards, updates, story, demo, checkout, thanks, press | patterns=campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta, launch-update-log, pledge-checkout-panel, share-quest-panel, press-kit-shelf

## Mutation Contract
- Operation: add-page
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
- Declare the new page in the essence before generating code.
- Refresh Decantr context so section and page packs include the new route.
- Read the relevant section pack and new page pack before implementation.

## Required Setup
- Treat the compiled topology as the source of truth until the essence changes.
- Refresh Decantr context after structural mutations so downstream tasks read current packs.

## Allowed Vocabulary
- add-page
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
- New pages are declared in the essence before any code generation begins. [error]
- New routes inherit an existing shell and section contract unless the essence changes first. [error]
- Refresh compiled packs after the mutation so downstream tasks read current topology. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
