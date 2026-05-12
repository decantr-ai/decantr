# Section Pack

**Objective:** Implement the launch-campaign section using the compiled full-bleed shell contract.
**Target:** react-vite (react)
**Scope:** pages=home, rewards, updates, story, demo, checkout, thanks, press | patterns=campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta, launch-update-log, pledge-checkout-panel, share-quest-panel, press-kit-shelf

## Section Contract
- Section: launch-campaign
- Role: public
- Shell: full-bleed
- Theme: retro-arcade (dark)
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Description: Public product-launch funnel for campaign-style launches, preorders, waitlists, crowdfunding-inspired reward tiers, product demos, maker stories, updates, checkout, press assets, and post-conversion sharing.

## Section Routes
- / -> launch-campaign/home @ full-bleed [campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta]
- /rewards -> launch-campaign/rewards @ full-bleed [reward-tier-selector, product-box-spec-panel, backer-progress-console, continue-screen-cta]
- /updates -> launch-campaign/updates @ full-bleed [launch-update-log, backer-progress-console, continue-screen-cta]
- /story -> launch-campaign/story @ full-bleed [founder-comic-strip, product-box-spec-panel, continue-screen-cta]
- /demo -> launch-campaign/demo @ full-bleed [prototype-demo-bezel, product-box-spec-panel, continue-screen-cta]
- /checkout -> launch-campaign/checkout @ full-bleed [pledge-checkout-panel]
- /thanks -> launch-campaign/thanks @ full-bleed [continue-screen-cta, share-quest-panel, backer-wall-ticker]
- /press -> launch-campaign/press @ full-bleed [press-kit-shelf, product-box-spec-panel]

## Theme Decorators

Theme `retro-arcade` decorators are documented ONCE in `scaffold-pack.md` under "Required Theme Decorators". Apply them across this section's pages — the contract is the same project-wide. See also DECANTR.md "Decorator Quick Reference" for the same table.

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- launch-campaign
- public
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
- Section pages and routes remain coherent with the compiled topology. [error]
- The section shell contract stays consistent across its routes. [error]
- Primary section patterns are represented without adding off-contract filler sections. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
