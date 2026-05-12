# Task Context: Scaffolding

**Enforcement Tier: Creative** — Guard rules are advisory during initial scaffolding.

## Primary Compiled Contract

- Start with `.decantr/context/scaffold-pack.md` for the compact route, shell, and theme contract.
- Use `.decantr/context/scaffold.md` only as secondary detail when the compiled pack is not enough.
- Read the route-local page packs before building each page so layout and wiring stay aligned with the compiled plan.

## Generate This Application

- Target: `react-vite` (react)
- Shell: `full-bleed`
- Theme: `retro-arcade` (dark, sharp)
- Routing: `history`
- Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout

## Route Plan

- `/` -> `launch-campaign/home` [campaign-marquee-hero, backer-progress-console, prototype-demo-bezel, product-box-spec-panel, reward-tier-selector, stretch-goal-ladder, founder-comic-strip, backer-wall-ticker, continue-screen-cta]
- `/rewards` -> `launch-campaign/rewards` [reward-tier-selector, product-box-spec-panel, backer-progress-console, continue-screen-cta]
- `/updates` -> `launch-campaign/updates` [launch-update-log, backer-progress-console, continue-screen-cta]
- `/story` -> `launch-campaign/story` [founder-comic-strip, product-box-spec-panel, continue-screen-cta]
- `/demo` -> `launch-campaign/demo` [prototype-demo-bezel, product-box-spec-panel, continue-screen-cta]
- `/checkout` -> `launch-campaign/checkout` [pledge-checkout-panel]
- `/thanks` -> `launch-campaign/thanks` [continue-screen-cta, share-quest-panel, backer-wall-ticker]
- `/press` -> `launch-campaign/press` [press-kit-shelf, product-box-spec-panel]

### Section Packs

- Section `launch-campaign` -> `.decantr/context/section-launch-campaign-pack.md`

### Page Packs

- 8 compiled references available. Use `.decantr/context/pack-manifest.json` to resolve the exact files for this scope.

## Success Checks

- [error] Routes and page IDs match the compiled topology.
- [error] The declared shell contract is preserved unless the task explicitly mutates it.
- [warn] Theme identity and mode remain consistent across scaffolded routes.

## Token Budget

- Target: 1400 tokens
- Max: 2200 tokens
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.

Post-scaffold enforcement mode: **STRICT**.

---

*Task context generated from Decantr execution packs*