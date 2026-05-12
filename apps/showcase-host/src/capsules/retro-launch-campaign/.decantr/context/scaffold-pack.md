# Scaffold Pack

**Objective:** Scaffold the retro-arcade app shell and declared routes.
**Target:** react-vite (react)
**Scope:** pages=home, rewards, updates, story, demo, checkout, thanks, press | patterns=campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta, launch-update-log, pledge-checkout-panel, share-quest-panel, press-kit-shelf

## Scaffold Contract
- Shell: full-bleed
- Theme: retro-arcade (dark)
- Routing: history → BrowserRouter from react-router-dom; regular URLs (e.g. /login). Works on Vite dev, Vercel, Netlify, Cloudflare Pages.
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout
- Navigation:
  - command palette required
  - Hotkeys:
    - g h: Go to Campaign Home — /
    - g r: Go to Rewards — /rewards
    - g u: Go to Updates — /updates
    - g d: Go to Demo — /demo
    - g p: Go to Press Kit — /press

## Route Plan
- / -> launch-campaign/home @ full-bleed [campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta]
- /rewards -> launch-campaign/rewards @ full-bleed [reward-tier-selector, product-box-spec-panel, backer-progress-console, continue-screen-cta]
- /updates -> launch-campaign/updates @ full-bleed [launch-update-log, backer-progress-console, continue-screen-cta]
- /story -> launch-campaign/story @ full-bleed [founder-comic-strip, product-box-spec-panel, continue-screen-cta]
- /demo -> launch-campaign/demo @ full-bleed [prototype-demo-bezel, product-box-spec-panel, continue-screen-cta]
- /checkout -> launch-campaign/checkout @ full-bleed [pledge-checkout-panel]
- /thanks -> launch-campaign/thanks @ full-bleed [continue-screen-cta, share-quest-panel, backer-wall-ticker]
- /press -> launch-campaign/press @ full-bleed [press-kit-shelf, product-box-spec-panel]

## Required Theme Decorators (retro-arcade)

These classes carry the active theme's visual identity. Tokens alone give bones; decorators give personality. Generated source MUST apply these across all sections — without them, every page reads as "themed colors only" with no theme character. Section packs reference this table; the contract is project-wide.

| Class | Intent | Apply to |
|-------|--------|----------|
| `.arcade-canvas` | Use on page roots and full-bleed sections. The canvas should feel immersive while preserving a centered campaign safe area. | Page roots, Full-bleed campaign bands, Launch homepages |
| `.arcade-marquee` | Use for hero headlines, section titles, and primary campaign identity. The marquee must be a dominant visual signal. | Hero labels, Section headers, Campaign status bands |
| `.arcade-bezel` | Use for product demos, progress consoles, and pledge modules. The bezel replaces generic cards. | Demo screens, Progress modules, Campaign panels |
| `.arcade-button` | Use for all primary and secondary actions. Buttons should look physical and tappable. | Primary CTAs, Reward selection, Checkout actions, Share buttons |
| `.arcade-token` | Use for compact status, backer levels, limited-run labels, and pledge tokens. | Badges, Backer counts, Tier markers, Campaign state chips |
| `.arcade-led-counter` | Use for funding totals, countdowns, backer counts, and reward inventory. Numbers must be highly legible. | Metric strips, Counters, Campaign timers, Funding totals |
| `.arcade-pixel-border` | Use when a section needs retro structure without becoming another card. | Spec panels, Manual surfaces, Tier rows, Story panels |
| `.arcade-progress-track` | Use for funding, stretch goals, tier availability, and onboarding completion. Progress should feel like campaign momentum. | Funding progress, Stretch goals, Inventory meters, Referral progress |
| `.arcade-manual-panel` | Use for explanatory sections, product specs, story steps, and launch instructions. This replaces generic marketing cards. | Product specs, How-it-works sections, Founder story, FAQ/manual content |
| `.arcade-sticker` | Use sparingly for limited-run notes, shipping states, early-bird labels, and proof cues. | Limited labels, Launch notes, Inventory tags, Proof badges |

## Required Setup
- Treat the declared routes as the topology source of truth.
- Preserve the resolved theme and shell contract unless the task explicitly mutates them.

## Allowed Vocabulary
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
- Routes and page IDs match the compiled topology. [error]
- The declared shell contract is preserved unless the task explicitly mutates it. [error]
- Theme identity and mode remain consistent across scaffolded routes. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
