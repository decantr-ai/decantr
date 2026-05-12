# Scaffold: launch-campaign

**Blueprint:** retro-launch-campaign
**Theme:** retro-arcade
**Personality:** A retro product launch campaign that feels like a coin-op arcade cabinet, a boxed toy set, and a transparent maker campaign in one system. Full-bleed atmosphere is allowed, but content lives inside a centered campaign safe area. Sections are bezels, counters, manual panels, shelves, cartridges, and continue screens rather than generic cards. The funnel is explicit: product reveal -> proof -> rewards -> stretch goals -> maker trust -> conversion -> share. Vibrant, playful, high contrast, and conversion-focused without hiding delivery or beta-access caveats.
**Guard mode:** creative (no enforcement during initial scaffolding)

## Voice & Copy

**Tone:** Excited, maker-led, transparent, playful, and concrete. The copy should make the campaign feel alive while clearly explaining what exists, what is shipping, and what support unlocks.
**CTA verbs:** Back, Reserve, Join, Choose, Unlock, Watch, Share
**Avoid:** Submit, Buy now, Learn more, Click here, Guaranteed overnight success, Revolutionary
**Empty states:** Use launch-native empty states such as First backers will appear here, Updates will unlock after launch day, or Press assets are being packed.
**Errors:** Inline, specific, and calm. Campaign checkout errors must preserve trust and never obscure payment timing, fulfillment expectations, or waitlist status.
**Loading states:** Render stable retro frames immediately. Counters, tiers, and media fill in without layout shift. No spinner-only launch states.

## Development Mode

For local development and showcases, wire all zone transitions with mock data:

- **Auth bypass:** Auth pages should accept any input and redirect to the primary section's default route
- **Route guards:** Check a simple localStorage flag (e.g., `decantr_authenticated`). Login sets it → redirect to app zone entry. Logout clears it → redirect to public/gateway zone.
- **Mock data on every page:** All pages should render with simulated data on first load — never show empty states during development
- **Zone transitions:** CTA links on marketing pages should route to the gateway (login/register). Successful auth should route to the primary section default page.

## Composition Topology

**Intent:** launch-campaign

### Zones

**Public** — full-bleed shell
  Archetypes: launch-campaign
  Purpose: Public product-launch funnel for campaign-style launches, preorders, waitlists, crowdfunding-inspired reward tiers, product demos, maker stories, updates, checkout, press assets, and post-conversion sharing.
  Features: marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout

### Default Entry Points

  Anonymous users enter: public zone
  Authenticated users enter: first section
  Auth redirect target: first section


## Sections Overview

| Section | Role | Shell | Pages | Features |
|---------|------|-------|-------|----------|
| launch-campaign | public | full-bleed | home, rewards, updates, story, demo, checkout, thanks, press | marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout |

## Route Map

| Route | Section | Page |
|-------|---------|------|
| / | launch-campaign | home |
| /rewards | launch-campaign | rewards |
| /updates | launch-campaign | updates |
| /story | launch-campaign | story |
| /demo | launch-campaign | demo |
| /checkout | launch-campaign | checkout |
| /thanks | launch-campaign | thanks |
| /press | launch-campaign | press |

## Section Contexts

For detailed pattern specs per section, read:
- .decantr/context/section-launch-campaign.md

## Shared Components

These patterns appear on multiple pages. Consider creating shared components:

| Pattern | Used by |
|---------|---------|
| backer-progress-console | home, rewards, updates |
| prototype-demo-bezel | home, demo |
| product-box-spec-panel | home, rewards, story, demo, press |
| reward-tier-selector | home, rewards |
| founder-comic-strip | home, story |
| backer-wall-ticker | home, thanks |
| continue-screen-cta | home, rewards, updates, story, demo, thanks |

## SEO Hints

**Schema.org types:** WebSite, Product, Organization, FAQPage
**Meta priorities:** description, og:title, og:image, product:price:amount, product:availability

## Navigation

- Command palette: enabled
- Requirement: implement a real keyboard-triggered command palette, not just placeholder UI text.
- Hotkeys: 5 configured
  - `g h`: Go to Campaign Home — /
  - `g r`: Go to Rewards — /rewards
  - `g u`: Go to Updates — /updates
  - `g d`: Go to Demo — /demo
  - `g p`: Go to Press Kit — /press
- Requirement: implement these bindings as real keyboard shortcuts, not as decorative text.
- Presentation rule: do not append hotkey text to persistent nav labels, breadcrumbs, or page titles unless the shell or route contract explicitly requests visible shortcut hints.
