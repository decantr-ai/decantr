# Section: launch-campaign

**Role:** public | **Shell:** full-bleed | **Archetype:** launch-campaign
**Description:** Public product-launch funnel for campaign-style launches, preorders, waitlists, crowdfunding-inspired reward tiers, product demos, maker stories, updates, checkout, press assets, and post-conversion sharing.

## Quick Start

**Shell:** No persistent navigation. Scroll-driven hero-first layout. Used by portfolio landing pages. (header: 52px)
**Pages:** 8 (home, rewards, updates, story, demo, checkout, thanks, press)
**Key patterns:** campaign-marquee-hero [moderate], backer-progress-console [moderate], prototype-demo-bezel [moderate], product-box-spec-panel [moderate], reward-tier-selector [moderate], stretch-goal-ladder [moderate], founder-comic-strip [moderate], backer-wall-ticker [moderate], continue-screen-cta [moderate], launch-update-log [moderate], pledge-checkout-panel [moderate], share-quest-panel [moderate], press-kit-shelf [moderate]
**Theme decorators:** 10 classes — see `section-launch-campaign-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Excited, maker-led, transparent, playful, and concrete.

## Shell Implementation (full-bleed)

### root

- **display:** flex
- **direction:** column
- **atoms:** _flex _col

### header

- **height:** 52px
- **position:** fixed
- **top:** 0
- **left:** 0
- **width:** 100%
- **display:** flex
- **align:** center
- **justify:** space-between
- **padding:** 0 2rem
- **z_index:** 40
- **background:** transparent
- **atoms:** _fixed _top0 _left0 _wfull _flex _aic _jcsb _px8 _py4 _z[40]
- **left_content:** Brand/logo link
- **right_content:** Nav links — flex with gap 1.5rem
- **nav_links:** If navigation links are surfaced in the floating header, keep the visible label to the route name itself. Treat any declared hotkeys as keyboard bindings or command-palette hints rather than inline nav text.
- **note:** Floating nav overlays hero. No border, transparent background.
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.

### body

- **flex:** 1
- **direction:** column
- **atoms:** _flex _col
- **note:** Full-width sections stack vertically. Each section is full viewport height or auto. Sections own their own padding. Natural document scroll, no scroll container.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: spacious (--d-density-scale: 1.4)

## Shell Notes (full-bleed)

- **Shell Spacing:** Full-bleed shell owns floating header offsets and section stack rhythm. Pages should not add extra shell-width wrappers unless a route contract explicitly calls for a local reading measure or content column.
- **Hotkeys:** When navigation hotkeys are declared in the essence, implement them as keyboard shortcuts or command-palette affordances. Do not append hotkey text to the floating header navigation unless the route contract explicitly asks for visible shortcut hints.

## Theme Reference

**Theme:** retro-arcade (dark) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 10 `retro-arcade-*` classes — full Class/Intent/Apply-to table in `section-launch-campaign-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** campaign-marquee-hero, backer-progress-console, reward-tier-selector, stretch-goal-ladder, prototype-demo-bezel, product-box-spec-panel, continue-screen-cta
**Spatial hints:** Density bias: -1. Section padding: 7rem. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface retro-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — full-bleed shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing, seo, analytics, conversion, campaign-progress, reward-tiers, preorder, waitlist, referrals, press-kit, updates, checkout

---

## Visual Direction

**Personality:** A retro product launch campaign that feels like a coin-op arcade cabinet, a boxed toy set, and a transparent maker campaign in one system. Full-bleed atmosphere is allowed, but content lives inside a centered campaign safe area. Sections are bezels, counters, manual panels, shelves, cartridges, and continue screens rather than generic cards. The funnel is explicit: product reveal -> proof -> rewards -> stretch goals -> maker trust -> conversion -> share. Vibrant, playful, high contrast, and conversion-focused without hiding delivery or beta-access caveats.

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### campaign-marquee-hero

Retro product-launch hero with a cabinet marquee, product reveal, campaign countdown, progress snapshot, and primary pledge or waitlist action.

**Components:** Button, Badge, Progress, KPI, Media, Countdown

**Layout slots:**
- `marquee`: Oversized campaign title band. Literal product or offer name, not an eyebrow-only brand mention.
- `supporting-copy`: Short launch promise, 2-3 lines max, with one concrete product outcome.
- `product-screen`: Large visual slot framed as an arcade bezel. Show product render, prototype UI, or packaging visual.
- `status-strip`: Campaign counters: raised amount, target, backers, days left, early-bird inventory.
- `action-row`: Primary pledge/preorder/waitlist CTA plus secondary demo/story CTA.
- `trust-row`: Tiny proof cues such as prototype ready, shipping window, press quote, or maker credibility.
  **Layout guidance:**
  - first_viewport: The campaign identity, product visual, and conversion action must all appear before the first scroll.
  - safe_area: Full-bleed background is allowed, but content should live inside a max-width campaign cabinet zone.
  - cta_language: Use verbs like Back, Reserve, Join, Unlock, Watch Demo, or See Rewards. Avoid generic Submit or Learn More as the primary action.

### backer-progress-console

Campaign momentum console with funding or waitlist progress, backer count, countdown, inventory state, and next unlock cue.

**Components:** Progress, KPI, Badge, Countdown, Button

**Layout slots:**
- `primary-counter`: Raised amount or reservations count in LED treatment.
- `goal-progress`: Thick segmented progress track with percentage and target label.
- `metric-strip`: Backers, days left, average pledge, or early-bird inventory.
- `next-unlock`: Short copy for the next stretch goal or waitlist milestone.
- `action`: Inline pledge/reserve button when used outside hero.
  **Layout guidance:**
  - single_console: Treat the module as one instrument panel rather than individual cards.
  - labeling: Every number needs a visible text label and goal context.
  - conversion_role: The console should increase confidence and urgency before asking for action.

### prototype-demo-bezel

Arcade-screen demo frame for product videos, interactive prototypes, image sequences, before-after states, or playable product previews.

**Components:** Media, Button, Tabs, Badge, Slider

**Layout slots:**
- `screen`: Product video, screenshot, prototype, or interactive demo inside a thick bezel.
- `control-strip`: Play, pause, chapter, or mode controls styled as cabinet buttons.
- `caption`: Short explanation of what the viewer is seeing.
- `status-leds`: Tiny labeled state lights for Prototype, Shipping, Beta, or Live.
- `demo-cta`: Open full demo, watch walkthrough, or try prototype.
  **Layout guidance:**
  - media_integrity: Reserve stable aspect ratio so demos do not shift layout when media loads.
  - evidence_first: The demo must reveal the product, not just vibe. Use realistic UI or product imagery.
  - controls: Use icon buttons where possible for play, pause, next, previous, and fullscreen.

### product-box-spec-panel

Back-of-box product explanation panel with contents, specs, compatibility, proof, shipping notes, and campaign caveats.

**Components:** Badge, Accordion, icon, KPI

**Layout slots:**
- `feature-burst`: Two to four high-impact product benefits in bold manual panels.
- `contents-list`: What is included in the pledge or launch package.
- `compatibility-strip`: Works with, integrations, sizing, OS, or audience fit.
- `proof-stamps`: Prototype status, guarantee, press proof, or maker credibility.
- `shipping-note`: Delivery window, beta wave, manufacturing status, or digital access timing.
  **Layout guidance:**
  - content_order: Explain what it is, what is included, who it is for, and when/how backers receive it.
  - trust: Campaign caveats should be visible and plain, not hidden in tiny legal copy.
  - visual_language: Use package/manual framing rather than SaaS feature grids.

### reward-tier-selector

Campaign reward picker for founder packs, preorder bundles, beta access tiers, and collector editions without relying on generic pricing cards.

**Components:** Button, Badge, RadioGroup, Progress, icon

**Layout slots:**
- `tier-cartridge`: Repeating reward object shaped like a product cartridge or boxed set, not a generic card.
- `tier-title`: Founder Pack, Early Access, Collector Kit, Studio Bundle, or similar.
- `price`: Large price or pledge amount with billing/preorder note.
- `contents`: Short inventory list of included items or access rights.
- `availability`: Limited quantity, sold out, shipping window, or beta wave state.
- `select-action`: Choose reward, reserve, or join waitlist button.
  **Layout guidance:**
  - tier_language: Use campaign words: reward, founder pack, beta key, collector kit, early-bird, preorder bundle.
  - availability: Show scarcity honestly with inventory or delivery labels, not vague urgency.
  - selection_state: Selected tier should use border/fill/press state, not only color.

### stretch-goal-ladder

Campaign milestone ladder for unlocked, active, and upcoming stretch goals with playful retro progress states.

**Components:** Progress, Badge, icon, Tooltip

**Layout slots:**
- `goal-node`: Milestone gate with amount/signup target, unlock title, and state.
- `connector`: Segmented path line showing current campaign progress.
- `active-goal`: Current next unlock emphasized with larger label and CTA note.
- `legend`: Unlocked, next, and locked state labels.
  **Layout guidance:**
  - state_clarity: Do not rely on color alone. Use labels and icons for locked/unlocked/current.
  - goal_copy: Each goal should explain the backer benefit, not just the internal milestone.
  - path_role: The ladder should create momentum and shared mission, not just list features.

### founder-comic-strip

Campaign story section rendered as bold comic/manual panels for maker origin, product problem, prototype breakthrough, and launch ask.

**Components:** Media, Badge, Button, icon

**Layout slots:**
- `story-panel`: Repeating panel with image/diagram, label, title, and short caption.
- `maker-note`: Plain-spoken founder note or quote.
- `campaign-ask`: What support enables next, with CTA.
  **Layout guidance:**
  - story_arc: Problem -> prototype -> proof -> launch ask.
  - honesty: Do not overclaim. Include current product state and what funding/support enables.
  - media: Prefer actual maker/product evidence over decorative illustration.

### backer-wall-ticker

Social-proof ticker and supporter wall for campaign backers, waitlist joins, referrals, quotes, cities, or recent pledge activity.

**Components:** Avatar, Badge, Marquee, Toast, icon

**Layout slots:**
- `ticker-row`: Scrolling or static row of recent backer events.
- `supporter-grid`: Dense supporter names, avatars, locations, or quotes.
- `proof-summary`: Short trust summary tying backer activity to campaign momentum.
- `share-action`: Optional referral or share CTA.
  **Layout guidance:**
  - motion_safety: Auto-scrolling must pause on hover/focus and disable under reduced motion.
  - proof_quality: Prefer fewer meaningful supporter signals over endless anonymous names.
  - privacy: Support anonymous backer states and avoid exposing sensitive pledge amounts unless explicitly public.

### continue-screen-cta

Final campaign conversion section styled like a retro continue screen with countdown, pledge action, referral prompt, and confidence cues.

**Components:** Button, Badge, Countdown, Progress, icon

**Layout slots:**
- `continue-prompt`: Large direct headline such as Continue the build, Back the first run, or Unlock beta access.
- `countdown`: Campaign timer or limited window note.
- `confidence-cues`: Short row of guarantee, prototype, shipping, or beta status cues.
- `action-row`: Primary pledge/reserve/join action and secondary share/demo action.
- `fine-print`: Plain-language fulfillment or launch caveat.
  **Layout guidance:**
  - primary_action: Only one primary action should dominate.
  - copy: Use direct launch language: Back the first run, Reserve your kit, Join beta, or Share to unlock.
  - fine_print: Keep caveats visible and human.

### launch-update-log

Campaign update feed for maker notes, prototype milestones, shipping updates, stretch-goal unlocks, and backer announcements.

**Components:** Badge, Accordion, Media, Button, Timeline

**Layout slots:**
- `pinned-update`: Latest or critical campaign update highlighted at top.
- `filter-strip`: All, prototype, funding, shipping, stretch goals, press, and backer notes.
- `update-entry`: Date, category, title, summary, media, and expandable body.
- `subscribe-action`: Follow updates, email, RSS, or share action.
  **Layout guidance:**
  - trust: Updates should distinguish shipped, in-progress, delayed, and unlocked states.
  - filtering: Categories should support campaign-specific concerns like prototype, funding, shipping, and stretch goals.
  - media: Use photos/screenshots for evidence where available.

### pledge-checkout-panel

Focused campaign checkout or reservation flow for selected reward tier, supporter details, payment/waitlist mode, and confirmation.

**Components:** Form, Button, Badge, Stepper, Input, Checkbox

**Layout slots:**
- `checkout-stepper`: Reward, Details, Confirm step indicator.
- `selected-reward`: Selected tier summary with price, inventory, and delivery note.
- `supporter-form`: Name, email, shipping/beta access fields, consent, and referral code.
- `payment-or-reserve`: Payment form, preorder authorization, or waitlist reserve mode.
- `order-summary`: Total, estimated delivery/access, guarantees, and campaign caveat.
- `confirm-action`: Primary complete pledge/reserve button.
  **Layout guidance:**
  - trust: Fulfillment, refund, beta access, and payment timing must be clear before confirmation.
  - mode_support: Support both paid pledge/preorder and free waitlist reservation campaigns.
  - form_design: Inputs should be readable and calm even inside the retro theme.

### share-quest-panel

Post-conversion referral and sharing panel that turns supporter sharing into unlock progress without leaving the campaign tone.

**Components:** Button, Progress, Badge, Input, icon

**Layout slots:**
- `success-state`: Thank-you or reservation confirmation.
- `referral-link`: Copyable campaign referral link.
- `quest-progress`: Progress toward next share/backer unlock.
- `share-buttons`: Email, social, copy, and message actions.
- `next-unlock`: Reward, queue jump, sticker, bonus content, or beta wave unlocked by sharing.
  **Layout guidance:**
  - post_conversion: Lead with confirmation before asking for sharing.
  - clarity: Show exactly what sharing unlocks and how many referrals remain.
  - controls: Use copy and share icons inside accessible labeled buttons.

### press-kit-shelf

Campaign press and media asset shelf for logos, product shots, fact sheets, launch screenshots, demo videos, and founder bios.

**Components:** Button, Badge, Media, Tabs, icon

**Layout slots:**
- `asset-category-tabs`: Logo, screenshots, founder, product, facts, video, and brand tabs.
- `asset-shelf-row`: Shelf row of downloadable campaign assets.
- `asset-preview`: Thumbnail or document preview with stable dimensions.
- `asset-meta`: File type, size, recommended use, and license note.
- `asset-actions`: Download, copy link, copy caption, or open preview.
  **Layout guidance:**
  - asset_truth: Show file type, dimensions or size, and recommended use for each asset.
  - download_controls: Use recognizable download, copy, external-link, and play icons in buttons.
  - press_context: Include concise factual launch copy, not marketing fluff.

---

## Pages

### home (/)

Layout: campaign-marquee-hero (coin-op) → backer-progress-console (funding-console) → prototype-demo-bezel (demo-screen) → product-box-spec-panel (box-back) → reward-tier-selector (cartridge-row) → stretch-goal-ladder (level-map) → founder-comic-strip (story-panels) → backer-wall-ticker (ticker-wall) → continue-screen-cta (continue-screen)

### rewards (/rewards)

Layout: reward-tier-selector (comparison-console) → product-box-spec-panel (manual-foldout) → backer-progress-console (funding-console) → continue-screen-cta (continue-screen)

### updates (/updates)

Layout: launch-update-log (update-console) → backer-progress-console (funding-console) → continue-screen-cta (continue-screen)

### story (/story)

Layout: founder-comic-strip (story-panels) → product-box-spec-panel (manual-foldout) → continue-screen-cta (continue-screen)

### demo (/demo)

Layout: prototype-demo-bezel (demo-screen) → product-box-spec-panel (box-back) → continue-screen-cta (continue-screen)

### checkout (/checkout)

Layout: pledge-checkout-panel (pledge-flow)

### thanks (/thanks)

Layout: continue-screen-cta (share-after-action) → share-quest-panel (referral-quest) → backer-wall-ticker (static-wall)

### press (/press)

Layout: press-kit-shelf (press-page) → product-box-spec-panel (box-back)
