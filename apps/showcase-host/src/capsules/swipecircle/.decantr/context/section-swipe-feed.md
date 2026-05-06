# Section: swipe-feed

**Role:** primary | **Shell:** mobile-tab-bar | **Archetype:** swipe-feed
**Description:** Primary archetype for mobile-first swipe-based social discovery apps. Hosts the core swipe deck (discover), matches grid, chat list and thread, own/other profile views, and settings — all under a single mobile-tab-bar shell with persistent bottom navigation. The first archetype in Decantr's catalog purpose-built around a card-stack swipe loop with match celebration and 1:1 chat.

## Quick Start

**Shell:** Mobile-first app shell with sticky compact header, single-scroll body, and fixed bottom tab-bar. The first shell in Decantr's catalog optimized for mobile-portrait consumer apps. Desktop scales gracefully to a 480px-wide centered column. Use for: dating apps, social discovery, swipe feeds, anywhere a bottom tab navigator is the primary navigation affordance.
**Pages:** 7 (discover, matches, chat-list, chat-thread, profile-own, profile-other, settings)
**Key patterns:** filter-bar [moderate], spatial-card-stack [moderate], swipe-action-bar [complex], match-celebration [complex], hero, bottom-tab-bar [moderate], presence-avatars, stats-bar, avatar-grid-tile [moderate], conversation-list [moderate], chat-header, chat-thread, chat-input, mobile-profile-hero [complex], tech-pills, settings-nav [moderate], form [complex]
**Theme decorators:** 10 classes — see `section-swipe-feed-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Playful, warm, encouraging — never desperate, never pushy.

## Shell Implementation (mobile-tab-bar)

### regions

- root,header,body,tab-bar

### root

- **purpose:** App container. Centers the column on desktop, full-width on mobile. Owns the dvh-based viewport sizing and global background color.
- **min-height:** 100dvh
- **max-width:** 480px
- **margin:** 0 auto
- **position:** relative
- **background:** var(--d-bg)
- **color:** var(--d-fg)
- **display:** flex
- **flex-direction:** column
- **atoms:** _relative _flex _flex-col _w-full _min-h-dvh _max-w-screen-md _mx-auto _bg-background _text-text

### header

- **purpose:** Sticky top header. Hosts the brand mark (left), optional filter or page title (center), and avatar/profile control (right). Compact at 52px to maximize body space.
- **height:** 52px
- **padding:** 0 16px
- **display:** flex
- **align-items:** center
- **justify-content:** space-between
- **gap:** 12px
- **position:** sticky
- **top:** 0
- **z-index:** 30
- **background:** rgba(255, 245, 242, 0.85)
- **backdrop-filter:** blur(16px)
- **border-bottom:** 1px solid var(--d-border)
- **atoms:** _sticky _top-0 _z-30 _flex _items-center _justify-between _gap-3 _px-4 _h-[52px] _bg-background/85 _backdrop-blur _border-b _border-border

### body

- **purpose:** Single scroll region for page content. The ONLY scroll container in this shell — never nest scroll inside. Bottom padding clears the fixed tab-bar so content isn't hidden behind it.
- **flex:** 1 1 auto
- **overflow-y:** auto
- **overflow-x:** hidden
- **padding:** 16px 16px 80px 16px
- **scroll-container:** true
- **atoms:** _flex-1 _overflow-y-auto _overflow-x-hidden _px-4 _pt-4 _pb-20

### tab-bar

- **purpose:** Bottom navigator with 4-5 icon+label tabs. Sticky on desktop / fixed-translate on iOS to handle safe-area-inset-bottom. Always visible across primary app pages.
- **height:** calc(64px + env(safe-area-inset-bottom))
- **padding:** 8px 12px calc(8px + env(safe-area-inset-bottom))
- **position:** sticky
- **bottom:** 0
- **z-index:** 40
- **display:** flex
- **align-items:** center
- **justify-content:** space-around
- **background:** rgba(255, 245, 242, 0.85)
- **backdrop-filter:** blur(16px)
- **border-top:** 1px solid var(--d-border)
- **tab-target-min-size:** 56px
- **atoms:** _sticky _bottom-0 _z-40 _flex _items-center _justify-around _bg-background/85 _backdrop-blur _border-t _border-border
- **responsive:**
  - mobile: Tab bar uses sticky positioning with safe-area inset. Tap targets 56×56 minimum.
  - desktop: Sticky bottom inside the 480px column. Same height. Becomes part of the centered column visual.

### anti_patterns

- Never nest a scroll container inside body — body owns the only scroll axis. Inner scroll causes momentum-scroll conflicts on iOS.,Never absolute-position elements outside the body region — they will overflow the 480px column on desktop and disrupt the centered layout.,Tab bar must NOT consume body height via flex — body's padding-bottom (80px) clears it. Mixing flex-shrink and fixed/sticky causes scroll jump.,Never apply viewport units (vh/vw) to body children — use dvh on root only. iOS Safari miscalculates vh with dynamic toolbars.,Header and tab-bar must NOT both grow flexibly — they have fixed heights (52px / 64px). Body alone flexes.,Do not place the tab-bar inside the body region — it must be a sibling so it remains fixed during body scroll.

### responsive

- **mobile:**
  - max_width: 100vw
  - padding: 0
  - tab_bar_position: sticky bottom with safe-area inset
  - notes: Full-width portrait optimized. Header and tab-bar sticky, body scrolls.
- **desktop:**
  - max_width: 480px
  - centered: true
  - side_treatment: Optional quiet off-column background tint or neutral gutter treatment handled by the page or theme background, NOT the shell. Avoid decorative orb/blob layers.
  - notes: Column floats centered with 480px max-width. The shell does not add side rails — the surrounding page background fills the gutters.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (mobile-tab-bar)

- **Primary Use Cases:** Mobile-first consumer apps with bottom-tab navigation: swipe-based dating/discovery apps, social feeds, mobile-first messaging, photo-share apps, fitness/habit trackers, food/recipe browsing.
- **Avoid For:** Desktop-first SaaS (use sidebar-main), data-dense dashboards (use top-nav-sidebar), document/spreadsheet UI (use three-column-browser), terminal/CLI tools (use terminal-split).
- **Tab Bar Contract:** Tab bar should host 4-5 items maximum. Each item is a route+icon+label. The active tab is signaled via the swipecircle-tab-active decorator (or theme equivalent). Tap targets are 56×56 minimum for thumb-friendliness.
- **Header Contract:** Header is intentionally compact (52px). Use brand mark, optional filter dropdown or page title, and a single profile/action control. Do NOT cram multiple actions into the header — push secondary actions into the body or a sheet.
- **Body Contract:** Body is the only scroll axis. Use padding-bottom of at least 80px to clear the tab-bar. Do not rely on flex-grow alone — explicit overflow-y: auto is required.
- **Thread Pages:** When entering a focused state (e.g., a chat thread), keep the tab-bar visible by default for navigation consistency. Hide it only on input focus to maximize keyboard-aware compose space, restoring on blur.

## Theme Reference

**Theme:** swipecircle (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 10 `swipecircle-*` classes — full Class/Intent/Apply-to table in `section-swipe-feed-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** spatial-card-stack, conversation-list, chat-thread, presence-avatars, filter-bar
**Compositions:** **swipe-feed:** Photo-first swipe deck centered in the viewport with floating action bar above bottom tabs. Coral and violet accents punctuate the warm peach surface.
**matches:** Grid of circular avatar tiles with new-match dots, presence rail at top. Soft tile lift on hover with coral glow.
**chat:** Intimate one-to-one chat with rounded bubbles and warm timestamps. Coral mine, cream theirs.
**profile:** Mobile profile with full-bleed cover photo, overlapping circular avatar, stats bar, interest pills, and pill-shaped action buttons.
**auth:** Single centered card on warm peach background. Coral primary CTA, violet hover state. Bouncy entrance.
**marketing:** Splash with photo-first hero, swipe-card/photo mockups, pill CTAs, warm off-white scroll surface, and coral/violet accents. Friendly, not corporate. Avoid ambient blobs/orbs or a single solid peach hero slab.
**Spatial hints:** Density bias: none. Section padding: 1.5rem. Card wrapping: rounded-photo.


Usage: `className={css('_flex _col _gap4') + ' d-surface swipecircle-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — mobile-tab-bar shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

swipe-deck, matches, match-celebration, chat, profile, filter-bar, tab-navigation, empty-states, demo-mode, keyboard-shortcuts

---

## Visual Direction

**Personality:** Mobile-first social discovery with playful coral-pink energy and warm peach undertones. Photo-centric swipe deck dominates the screen — cards feel tactile, almost like polaroids you'd shuffle through. Pill-shaped buttons everywhere with bouncy spring physics. Soft drop shadows replace harsh borders. Bottom tabs provide always-visible navigation. Match moments feel celebratory with a coral-to-violet burst; chats feel intimate with rounded bubbles and warm timestamps. Empty states encourage rather than scold. Designed to feel native on iPhone but elegantly scaled on desktop with a 480px-wide centered column. Hinge meets BeReal meets a Dribbble shot — never desperate, always inviting. Every interaction rewards: the spring of a card, the burst of a like, the warmth of a new match.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Constraints

- **mode:** light
- **effects:** {"max_width_app":"480px","photo_aspect":"3/4","tab_bar_height":"64px","header_height":"52px","swipe_threshold":"30%","card_size":"320x420"}

---

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### filter-bar

Search input and filter controls for filtering page content. Sits above data-consuming patterns like data-table, card-grid, and activity-feed.

**Components:** Input, Select, Button, Badge, icon

**Layout slots:**
- `search`: Search Input with placeholder text
- `filters`: One or more Select dropdowns for category/status filtering
- `actions`: Action Buttons (clear, apply, etc.)
  **Layout guidance:**
  - control_priority: Search and primary filters should read as one coherent control band. Secondary filters belong in an expandable surface before they crowd the main row.
  - chip_rhythm: Active-filter chips should wrap cleanly and remain clearly dismissible without turning the bar into a chip cloud.
  - mobile_behavior: Collapsed mobile filters must preserve the same filter model as desktop, not introduce a different semantic ordering.

### spatial-card-stack

Z-axis stacked cards with depth parallax and gesture-based navigation — supports swipeable deck, fanned arc, 3D carousel, and chronological timeline stack layouts.

**Components:** CardStack, DepthCard, StackControls, DepthIndicator, GestureZone

**Layout slots:**
- `card-stack`: The 3D container holding all DepthCard elements. Uses transform-style: preserve-3d. Dimensions match the front card size plus padding for depth offset (add 48px padding on each side for the cascade effect). Position: relative. All child DepthCards are position: absolute, centered within this container via left: 50%, top: 50%, translate(-50%, -50%) as the base transform, with each card's depth transform layered on top. The container handles pointer events for swipe/drag gestures via a GestureZone overlay. In carousel3d mode, the container additionally applies a rotateY transform that animates when navigating between cards.
- `depth-card`: Repeating slot — one per item in the stack. Each card is a d-surface element (rounded-xl, shadow-lg, overflow-hidden, bg-surface). Position: absolute, centered in the card-stack container. The card's visual depth is controlled by CSS transforms: translateZ (depth), translateY (vertical offset), and scale (size reduction). These three properties are interpolated based on the card's position relative to the active index. The active (front) card: translateZ(0) scale(1) opacity(1), pointer-events: auto, z-index: highest. Cards behind: pointer-events: none, progressively reduced z-index. Each card has transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease-out — the spring-like bezier gives a satisfying physical feel when cards move forward. Card content is projected inside via a slot: the card accepts arbitrary children (images, text, interactive elements). In fan mode, the transform changes to rotateZ(angle) with transform-origin: bottom center.
- `stack-controls`: Navigation buttons flanking the card stack. Two circular buttons (36px diameter, bg-surface, border, shadow-md, rounded-full) positioned absolutely: left button at left: -48px, top: 50%, translateY(-50%); right button at right: -48px, top: 50%, translateY(-50%). Each contains a chevron icon (16px, stroke-width: 2). Left button: chevron-left icon, navigates to previous card. Right button: chevron-right icon, navigates to next card. Buttons have hover state (bg-accent/10%, scale 1.05) and active state (scale 0.95). Disabled state (at start/end of stack): opacity 0.3, pointer-events: none. In carousel3d mode, buttons rotate the ring. In fan mode, buttons shift the highlighted card.
- `depth-indicator`: A row of small dots below the card stack showing the current position within the stack. Uses flex layout (gap-2, items-center, justify-center). Each dot is an 8px circle. The active card's dot: bg-accent, scale(1). Other dots: border 1.5px solid var(--d-border), bg-transparent, scale(0.85). Dots transition between states with: background-color 200ms, transform 200ms. If there are more than 7 items, the indicator collapses: shows the active dot, 2 dots on each side, and small ellipsis dots (...) at the edges. Clicking a dot navigates directly to that card.
- `gesture-zone`: An invisible overlay covering the card-stack area that captures touch/mouse drag events for swipe navigation. Position: absolute, inset: 0, z-index above cards. Captures pointerdown → pointermove → pointerup sequences. During drag: the front card follows the pointer horizontally with a slight rotateY tilt (max ±8deg at card edges). Visual feedback: the card tilts in the drag direction, the next card in the swipe direction begins scaling up (scale 0.95→0.98) as a preview. On release: if past threshold (30% card width or velocity >500px/s), commit the navigation with a spring animation (300ms). Below threshold, spring back to center (250ms ease-out). The gesture zone also handles keyboard arrow events bubbled from child focus.
  **Layout guidance:**
  - container: block with perspective
  - note: The container MUST have CSS perspective set (1000px default) for 3D effects. Cards should use transform-style: preserve-3d for nested 3D content. Ensure the container has enough padding to accommodate card offsets and shadows.
  - card_sizing: Default card size: 320px wide, auto height. Override with CSS custom properties --card-width and --card-height. Maintain consistent aspect ratio across all cards in a stack.
  - gesture_thresholds: Swipe threshold: 30% of card width to trigger navigation. Below threshold, card springs back. Velocity-based: fast swipes (>500px/s) trigger regardless of distance.
  - performance: Only render the active card + 4 surrounding cards. Use will-change: transform, opacity on visible cards. Remove will-change from hidden cards.

### swipe-action-bar

Three (or four) circular icon buttons sitting above the bottom-tab-bar, providing tap-to-act alternatives to swipe gestures: X (pass), Star (super-like), Heart (like), optional Undo. Sized generously (60px) for thumb-friendly tapping. Each button bounces and emits a color burst on tap. Hotkey-bound to ←/↑/→ for desktop testing.

**Components:** ActionBar, ActionButton, PassButton, LikeButton, SuperLikeButton, UndoButton, ButtonIcon, TapBurst

**Layout slots:**
- `action-bar`: Outer container. Flex-row, items-center, justify-center, gap 24px (preset-dependent), padding 16px 0. Width 100% of parent. Carries aria-label='Swipe actions' and role='toolbar'.
- `pass-button`: Circular button, 60×60, applies the swipecircle-action-button decorator. Contains a 24px X Lucide icon in var(--d-text-muted). data-action='pass'. On click: emits 'swipe-pass' event. Bound to ArrowLeft hotkey.
- `super-like-button`: Circular button, 48×48 (smaller than primaries), white background, soft shadow. Contains a 20px Star Lucide icon in var(--d-secondary) (violet). data-action='super-like'. Conditionally rendered (controlled by feature flag). On click: emits 'swipe-super-like'. Bound to ArrowUp hotkey.
- `like-button`: Circular button, 60×60, applies swipecircle-action-button decorator. Contains a 24px Heart Lucide icon in var(--d-primary) (coral). On hover: icon fills with the primary color (transition fill 200ms ease-out). data-action='like'. On click: emits 'swipe-like'. Bound to ArrowRight hotkey.
- `undo-button`: Circular button, 48×48, optional in four-button preset. Contains a 18px Undo2 Lucide icon in var(--d-text-muted). data-action='undo'. On click: emits 'swipe-undo'. Disabled when no previous swipe to restore.
- `tap-burst`: Pseudo-element overlay on each button. Position absolute, inset 0. On action commit: scales 0→1.4 over 320ms with opacity 0.6→0. Background: radial-gradient with the action's signature color (coral, violet, muted).
  **Layout guidance:**
  - container: horizontal flex bar, centered, with action buttons sized for thumb reach
  - primary_buttons: 60×60 for primary actions (X, Heart) — the main swipe verbs
  - secondary_buttons: 48×48 for premium/optional (Star, Undo) — visually smaller to signal lower frequency
  - spacing: 24px gap in three-button, 20px in four-button, 32px in two-button-minimal — wider gaps emphasize button independence
  - position: Above bottom-tab-bar, below swipe deck. Not inside the tab-bar.

### match-celebration

Full-screen celebratory overlay that appears when two users match. A coral-to-violet radial burst, two avatars meeting in the center with a heart pop between them, an 'It's a Match!' headline, and two CTAs (Send Message / Keep Swiping). Optional auto-dismiss after 3-4s. Designed to be a magic moment — the dopamine pop that rewards the swipe loop.

**Components:** MatchOverlay, Backdrop, BurstGradient, Confetti, AvatarPair, MyAvatar, TheirAvatar, HeartPop, Headline, Subtitle, ActionPair, MessageButton, KeepSwipingButton

**Layout slots:**
- `match-overlay`: Outer container. Position fixed, inset 0, z-index 50. Background rgba(0,0,0,0.4) for backdrop dim. Flex centered. Pointer-events: auto. Carries role='alertdialog', aria-modal='true', aria-labelledby pointing to the Headline.
- `backdrop`: Implicit — the bg-black/40 of match-overlay serves as the backdrop. On click outside the inner content, dismisses the overlay.
- `burst-gradient`: Position absolute, inset 0, pointer-events: none. Background applies the swipecircle-match-burst decorator. Animates: scale(0.6)→scale(1) over 600ms cubic-bezier(0.34, 1.56, 0.64, 1), then rotate 0→10deg infinite linear over 4s.
- `confetti`: Conditional slot in first-match preset only. Position absolute, top 0, left 0, right 0, height 100%. Renders 24-40 confetti particles (small rectangles 6×10px in coral, violet, peach colors). Each particle has random horizontal start position, randomized fall duration 1.6-2.4s, slight horizontal drift, and rotation 0-720deg. Uses physics-based animation library or CSS keyframes. Pointer-events: none.
- `avatar-pair`: Center container. Flex-row, items-center, gap 8px, position relative, z-index above burst. Width auto, height 96px. Houses MyAvatar + HeartPop + TheirAvatar.
- `my-avatar`: 96×96 circular avatar with the swipecircle-photo-frame decorator. Img fills the inner circle. Enters with slideInFromLeft animation: translateX(-120%) opacity 0 → translateX(-32%) opacity 1 over 480ms cubic-bezier(0.34, 1.56, 0.64, 1).
- `their-avatar`: 96×96 circular avatar (same as MyAvatar). Enters with slideInFromRight: translateX(120%) opacity 0 → translateX(32%) opacity 1 over 480ms cubic-bezier(0.34, 1.56, 0.64, 1) with a 60ms delay from MyAvatar — adds slight stagger.
- `heart-pop`: 32px filled Heart Lucide icon in coral with a 2px white inner ring. Position absolute, centered between the two avatars, z-index above avatars. Animates: scale(0) → scale(1.3) → scale(1.0) + rotate(-10deg) → rotate(10deg) → rotate(0deg) over 480ms cubic-bezier(0.34, 1.56, 0.64, 1) with a 240ms delay (after avatars start arriving).
- `headline`: 'It's a Match!' h2 element. Font-family: var(--d-font-display). Font-size: 36px. Font-weight: 700. Color: white. Text-shadow: 0 1px 2px rgba(0,0,0,0.3). Margin-top: 32px. Text-align: center. Enters: opacity 0 + translateY(12px) → opacity 1 + translateY(0) over 320ms ease-out with 480ms delay (after avatars arrive).
- `subtitle`: Subtitle text under headline. Format: '{name} liked you back.' Font-size: 16px. Font-weight: 500. Color: rgba(255,255,255,0.9). Margin-top: 8px. Text-align: center. Enters with same animation as headline plus 60ms additional delay.
- `action-pair`: Container for the two CTAs. Flex-row, gap 12px, margin-top: 32px, justify-center. Both buttons enter with: opacity 0 + translateY(8px) → opacity 1 + translateY(0) over 320ms ease-out with 720ms delay.
- `message-button`: Primary CTA. Pill button (swipecircle-pill decorator), 'Send Message' label, leading 16px Send Lucide icon. On click: emit 'open-chat-thread' event with the matched user's id, then dismiss overlay.
- `keep-swiping-button`: Secondary CTA. Pill button with white 1.5px border, transparent fill, white text. 'Keep Swiping' label. On click: dismiss overlay (returns user to swipe deck).
  **Layout guidance:**
  - container: fixed full-viewport overlay
  - z_index: 50 — above bottom-tab-bar (40) but below toast notifications (60)
  - auto_dismiss: 4000ms default; pauses on hover or focus
  - reduced_motion: Respect prefers-reduced-motion: no rotation, no confetti, fade-only entrance

### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Components:** Button, icon

**Layout slots:**
- `headline`: Primary heading, typically h1 with _heading1
- `description`: Supporting paragraph with _body _muted
- `cta-group`: Horizontal Button group with _flex _gap3
- `media`: Optional image, illustration, or chart component
  **Layout guidance:**
  - container: none
  - note: Hero sections should NOT wrap content in d-surface cards. The hero IS the section. Use d-section for spacing.
  - visual_proof: The visual element below CTAs should be an ambient visualization (animated gradient, particle effect, blurred screenshot) — NOT a data widget wrapped in a card. If showing product data (agents, metrics), render as floating elements without card containment. Omit entirely if no meaningful visual is available.
  - subtitle: Subtitle line-height should be 1.6-1.8. Use text-muted color, smaller font than heading.
  - cta_sizing: Primary and secondary CTAs should have equal padding and height. Primary is filled (d-interactive[data-variant=primary]), secondary is ghost (d-interactive[data-variant=ghost]).
  - announcement: If showing an announcement badge above the heading, use d-annotation with prominent styling — not a tiny muted pill. Accent border or accent background at 15% opacity.
  - background: Hero sections should have a subtle radial or mesh gradient background using the theme palette — not a flat color. Use the primary and accent colors at very low opacity (5-10%) to create depth. Example: radial-gradient(ellipse at top center, rgba(var(--d-accent-rgb), 0.08) 0%, transparent 60%), or a soft gradient from primary to transparent. The gradient should fade to var(--d-bg) at the edges so it blends seamlessly with the page.
  - ambient_glow: For themes with neon/glow personality, add a soft ambient glow behind the hero heading or CTA area. Use a blurred pseudo-element or box-shadow with the accent color at 10-15% opacity, radius 200-400px. This creates a focal point without overwhelming the content.

### bottom-tab-bar

Mobile-first fixed-bottom tab navigator with 4-5 icon+label items. The primary navigation affordance for mobile consumer apps. Active tab signaled via color shift, icon scale, and an underline dot. Sticky on desktop within the centered column. Pairs with the mobile-tab-bar shell.

**Components:** TabBar, TabItem, TabIcon, TabLabel, ActiveIndicator, BadgeDot

**Layout slots:**
- `tab-bar`: Outer container. Sticky bottom (mobile and desktop). Flex-row, items-center, justify-around. Height 64px + env(safe-area-inset-bottom). Padding 8px 12px calc(8px + env(safe-area-inset-bottom)). Background: var(--d-bg) at 85% opacity with backdrop-filter blur(16px). Border-top: 1px solid var(--d-border). Z-index 40. Width 100% inside the parent shell column.
- `tab-item`: Repeating slot — one per tab (4 in standard, 5 in five-item, 4 in compact-no-labels). Vertical flex column, items-center, gap 4px, padding 4px 8px. Min size 56×56. Cursor: pointer. Tap target satisfies WCAG 2.5.5 (44×44 minimum, exceeded). Each item carries data-active true|false and aria-current page when active. Click navigates via the route bound to that tab. On press: scale 0.96 with 80ms transition, then spring back to 1.0 with 180ms cubic-bezier(0.34, 1.56, 0.64, 1).
- `tab-icon`: 24×24 icon (Lucide preferred — Heart, Users, MessageCircle, User, Search, Compass for SwipeCircle). Stroke-width 2. Color: var(--d-text-muted) when inactive, var(--d-primary) when active. Active state adds transform: scale(1.1) and translateY(-2px) lift, transitioned with 200ms cubic-bezier(0.34, 1.56, 0.64, 1).
- `tab-label`: Single-line label below icon, font-size 11px, font-weight 500 inactive / 600 active, letter-spacing 0.01em, white-space nowrap, color matches icon. In compact-no-labels preset, this slot is omitted entirely.
- `active-indicator`: 4×4px circular dot in var(--d-secondary) (violet match accent), positioned absolute below the icon (transform: translateY(2px)). Visible only on the active tab. Animates in via opacity 0→1 (160ms) and scale 0→1 (160ms cubic-bezier(0.34, 1.56, 0.64, 1)) when the tab becomes active.
- `badge-dot`: Optional 6×6px circle in var(--d-secondary), positioned absolute at top-right of the icon (translateX 8px, translateY -4px). Indicates unread/new items in this tab. May contain a tiny number for counts >0 — but typically just a dot. Pulse animation on appearance: scale 0→1.2→1 over 320ms.
  **Layout guidance:**
  - container: sticky-bottom flex-row
  - tab_target: Each tab is min 56×56px tap area; vertical flex with 4px gap between icon and label
  - active_signal: Color shift muted→primary AND icon scale 1.1× AND violet dot 4px below icon — three redundant signals for accessibility
  - translucency: backdrop-blur(16px) with 85% bg-opacity. Required: page bg color set as CSS var so the rgba()-with-var pattern works
  - safe_area: Padding bottom uses calc(8px + env(safe-area-inset-bottom)) — accommodates iOS home indicator without forcing the inset on every page

### presence-avatars

Horizontal stack of collaborator avatars showing who is currently viewing or editing. Each avatar has a unique presence color ring.

**Components:** Avatar, Button, Tooltip

**Layout slots:**
- `avatars`: Stacked avatar images with presence color ring
- `overflow`: +N more indicator
- `tooltip`: Hover shows full name and status
  **Layout guidance:**
  - presence_priority: The pattern should communicate who is here now before it communicates every individual detail. Overflow handling should preserve that quick presence read.
  - stack_logic: Overlap should feel intentional and orderly, with the most relevant or recent collaborators visually favored if ordering matters.
  - detailed_mode: Expanded or detailed modes should feel like a continuation of the avatar stack rather than a separate people directory.

### stats-bar

Horizontal bar of key statistics or metrics. Compact summary row.

**Components:** Text, icon, Container

**Layout slots:**
- `items`: Equal-width stat cells with label, value, optional unit, and optional trend
  **Layout guidance:**
  - summary_priority: The value is the first read, then the label, then any trend. Keep that hierarchy stable across compact and highlighted variants.
  - bar_role: This pattern is a concise summary surface. It should feel like one horizontal instrumentation band, not a row of unrelated mini-cards.
  - highlighted_variant: When one metric is emphasized, it should still remain visually tied to the rest of the stats bar rather than breaking the row into separate modules.

### avatar-grid-tile

Square card with a circular avatar inside, name underneath, and an optional new-match dot indicator. The repeating tile inside a matches-grid layout. Differs from card-grid (rectangular content cards) and presence-avatars (horizontal stack of presence indicators) by combining a square card surface with a circular photo and a single-line name — optimized for grid-of-people displays.

**Components:** Tile, AvatarFrame, Avatar, PresenceDot, NewMatchDot, Name, TimestampLabel

**Layout slots:**
- `tile`: Outer card. Position relative (so absolute children anchor here). Flex-col, items-center, gap 8px, padding 16px. Border-radius 20px. Background var(--d-surface). Applies swipecircle-grid-tile decorator. Cursor pointer. data-new='true|false'. data-online='true|false'. Click navigates to user's profile. Carries role='link' or wraps an <a> element pointing to /u/{userId}.
- `avatar-frame`: Position relative (anchors PresenceDot and NewMatchDot). 80×80 (standard) or 56×56 (compact). Applies swipecircle-photo-frame decorator: rounded-full, padding 3px, gradient coral-to-accent border. Box-shadow soft.
- `avatar`: Img inside the frame. width 100%, height 100%, border-radius 9999px (matches frame), object-fit cover, object-position center. Default placeholder: a soft peach gradient with a 24px User Lucide icon centered.
- `presence-dot`: Conditional in with-presence preset. Position absolute, bottom: 2px, right: 2px. 10×10. Border-radius 9999px. Background var(--d-success). Border 2px solid var(--d-surface) (creates a clean cutout effect). Visible only when data-online=true.
- `new-match-dot`: Position absolute, top: -2px, right: -2px. 12×12. Border-radius 9999px. Background var(--d-secondary) (violet match accent). Border 2px solid var(--d-surface). Visible only when data-new=true. On first render: scales 0→1.2→1 + opacity 0→1 over 320ms cubic-bezier(0.34, 1.56, 0.64, 1). Optional gentle pulse animation (scale 1→1.06→1 over 1.6s ease-in-out infinite) until viewed.
- `name`: Single-line text below the avatar. Font-size 14px, font-weight 600, color var(--d-text), text-align center, white-space nowrap, overflow hidden, text-overflow ellipsis, max-width 100%.
- `timestamp-label`: Optional secondary line below name. Font-size 11px, font-weight 500, color var(--d-text-muted). Format examples: 'Matched today', 'Active 2h ago', 'New match!'. Visible per preset config — always in standard, on-hover only in compact.
  **Layout guidance:**
  - container: square-ish card with circular avatar inside
  - size: Default 144×160px or grid-cell-fill — fills the container
  - avatar_size: 80×80 standard / 56×56 compact
  - tap_target: Entire tile is the tap target (not just avatar) — easier on mobile

### conversation-list

Sidebar conversation history with search, new chat button, and conversation items showing unread indicators and actions.

**Components:** Button, Avatar, Badge, icon

**Layout slots:**
- `search`: Filter/search conversations input
- `new-button`: Create new conversation button
- `items`: List of conversation rows
  **Layout guidance:**
  - list_priority: The active conversation and unread state should be immediately legible. Search and new-chat actions support the list but should not compete with it visually.
  - row_density: Keep row metadata concise so titles remain dominant and the sidebar does not become noisy. Compact mode should still preserve active-state clarity.
  - mobile_translation: On small screens, treat the list as its own route-level selection surface rather than a cramped embedded sidebar.

### chat-header

Contextual header for active conversation with editable title, status indicator, and action buttons.

**Components:** Button, Badge, icon

**Layout slots:**
- `title`: Editable conversation subject/title
- `status`: Online/offline indicator or model name badge
- `actions`: Search, export, branch, settings buttons
  **Layout guidance:**
  - title_priority: Keep the title as the main anchor of the header. Status and action controls should support the title rather than crowd it.
  - compact_actions: On narrow widths, collapse lower-priority actions into overflow before truncating the title into meaninglessness.
  - editable_title: Inline title editing should preserve the header rhythm and should not cause the whole bar to jump when entering edit mode.

### chat-thread

Full message thread container with scrollable messages, typing indicator, pagination, and auto-scroll behavior.

**Components:** Button, Avatar, icon

**Layout slots:**
- `messages`: Scrollable message list
- `typing-indicator`: AI is thinking... indicator
- `load-more`: History pagination button
- `scroll-to-bottom`: Floating button when scrolled up
  **Layout guidance:**
  - scroll_ownership: The message list is the primary scrollable region and should not fight with outer page wrappers for scroll ownership.
  - bubble_measure: Message bubbles should keep a readable max-width rather than stretching to the container edge, especially for long AI responses.
  - typing_state: Typing indicators and load-more controls should feel like part of the thread rhythm instead of detached widgets.

### chat-input

Message composition area with auto-growing textarea, file attachments, mentions autocomplete, and keyboard shortcuts.

**Components:** Button, icon

**Layout slots:**
- `attachments-preview`: Staged file thumbnails with remove buttons
- `textarea`: Auto-growing input with placeholder
- `actions`: Attach and send buttons
  **Layout guidance:**
  - anchored_zone: The input bar should feel anchored to the bottom of the chat shell and should not float with extra page-level spacing around it.
  - attachment_rhythm: Attachment previews should sit in a stable row above the textarea and not push the send controls into awkward positions.
  - send_priority: Send controls should remain visually clear when the composer grows; avoid layouts where the send button drifts away from the text area.

### mobile-profile-hero

Large photo header for mobile profile pages. Full-bleed cover photo (40-50vh), circular avatar overlapping the cover bottom edge, name+age+bio stack, and a row of action buttons (Edit on own profile / Message+Like+Report on other). Sticky-scroll behavior: avatar shrinks as user scrolls down. Differs from storefront-hero (desktop-leaning, wider proportions) by being mobile-optimized with portrait photo and thumb-friendly action sizing.

**Components:** Hero, CoverPhoto, GradientOverlay, AvatarFrame, Avatar, BackButton, MoreMenuButton, InfoStack, NameAge, DistanceTag, Bio, ActionRow, EditButton, MessageButton, LikeButton, ReportButton

**Layout slots:**
- `hero`: Outer container. Position relative (so AvatarFrame absolute-anchors here). Flex-col. Width 100%. No background — content layers do the visual work.
- `cover-photo`: Position relative. Width 100%. Height 45vh (capped at 360px portrait / 400px landscape). Img with object-fit cover, object-position center. Fallback: linear-gradient(135deg, var(--d-accent), var(--d-primary)). Has data-parallax attribute for scroll-driven translateY.
- `gradient-overlay`: Position absolute, inset 0 (or just bottom 40%). Linear-gradient(180deg, transparent 0%, transparent 50%, rgba(0,0,0,0.45) 100%). Pointer-events none.
- `back-button`: Conditional in other-profile preset. Position absolute, top: 16px (or 16px + safe-area-inset-top), left: 16px, z-index 5. 36×36 circular button. Background rgba(0,0,0,0.4) with backdrop-blur 8px. ChevronLeft icon 18px white. On click: navigates back via history.back() or emits 'navigate-back'.
- `more-menu-button`: Position absolute, top: 16px (or 16px + safe-area-inset-top), right: 16px, z-index 5. 36×36 circular glassy button. MoreHorizontal icon 18px white. On click: opens dropdown sheet with share/report/block actions.
- `avatar-frame`: Position absolute, bottom: -48px, left: 24px, z-index 4. 96×96. Applies swipecircle-photo-frame decorator. Gets data-scrolled attribute that shrinks the frame to 56×56 with translateY when user scrolls > 200px.
- `avatar`: Img inside the AvatarFrame. width 100%, height 100%, border-radius 9999px, object-fit cover. Fallback: solid surface color with a centered User icon at 36px.
- `info-stack`: Padding 64px 24px 16px 24px (the 64px top clears the overlapping avatar). Flex-col, gap 4px (between name and distance), gap 12px (after distance, before bio). Background var(--d-bg).
- `name-age`: Span: 'Name, Age'. Font-family var(--d-font-display). Font-size 24px. Font-weight 700. Color var(--d-text). Line-height 1.2.
- `distance-tag`: Inline span with 12px MapPin icon + location text + ' · ' + activity text. Font-size 12px. Font-weight 500. Color var(--d-text-muted). Display flex, items-center, gap 4px.
- `bio`: Paragraph. Font-size 15px. Font-weight 400. Color var(--d-text). Line-height 1.5. Max 3 lines (line-clamp 3 in compact contexts; uncapped on full profile view).
- `action-row`: Flex-row, gap 8px. Padding 16px 24px. Background var(--d-bg). In own-profile: single Edit button at 100% width. In other-profile: Message (flex-grow), Like Again (auto), Report (auto, icon only).
- `edit-button`: Pill button (swipecircle-pill decorator). Full width. 'Edit Profile' label with leading 16px Edit Lucide icon. Min height 44px.
- `message-button`: Pill button (swipecircle-pill decorator). Flex-grow, 'Message' label with leading 16px Send icon. Primary action.
- `like-button`: Pill button with white border + transparent fill. 'Like Again' label with leading 16px Heart icon. Auto-width.
- `report-button`: Icon-only ghost button, 44×44. 18px Flag icon in muted color. Tertiary action — opens report flow.
  **Layout guidance:**
  - container: vertical stack with overlapping avatar
  - cover_height: 45vh capped at 360px on portrait, 50vh capped at 400px on landscape
  - avatar_overlap: AvatarFrame absolute-positioned with bottom: -48px so it overlaps the cover-bottom edge
  - info_padding_top: 64px on InfoStack to clear the overlapping avatar
  - sticky_scroll: Avatar shrinks 96→56px over first 200px of scroll; cover parallaxes at 0.4×
  - buttons: ActionRow uses pill shapes with icon prefix; min height 44px for tap targets

### tech-pills

Row of technology or integration pill badges showing compatibility and supported platforms. Each pill is a rounded badge with the technology name, displayed in a centered flex-wrap row. Used for 'works with' sections to communicate broad technology compatibility. Supports standard uniform styling or individually colored brand pills.

**Visual brief:** Centered flex-wrap row of rounded pill badges, each displaying a technology or integration name (e.g., 'React', 'Vue', 'Next.js', 'Tailwind', 'Figma'). Standard preset shows uniform styling — each pill has a muted border, surface background, and small text in consistent color. The colored preset gives each pill a unique brand-colored background or border (React blue, Vue green, etc.) with white or dark text for contrast. Pills have consistent padding and slight letter spacing. The row wraps naturally, creating an organic layout of technology compatibility indicators.

**Components:** Badge

**Layout slots:**
- `pill-items`: Array of Badge pills, each with _rounded[20px] _py2 _px5 _fs[0.85rem] _fw600 _transition _hover:translateY[-2px]. Background: _bgwhite/10. Text: _fgwhite/80. Each pill contains a technology name (e.g., 'React', 'Next.js', 'Claude', 'Cursor').
**Responsive:**
- **Mobile (<640px):** Pills wrap across multiple lines. Sizing remains consistent. Narrower horizontal padding if needed.
- **Tablet (640-1024px):** Pills in a comfortable centered row, wrapping as needed.
- **Desktop (>1024px):** Single or two row display depending on count. Generous spacing between pills.


### settings-nav

Vertical navigation list for settings and preferences pages with grouped sections, active state highlighting, icons, and badges. Collapses to horizontal tabs on mobile.

**Components:** NavItem, NavGroup, Icon, Badge, Text

**Layout slots:**
- `group-heading`: Uppercase section label (d-label) separating navigation groups. Not interactive.
- `nav-item`: Repeating slot — one per settings page. Renders as a flex row with icon (left), label (center), and optional badge/count (right). Active state indicated by left border + background tint. Hover shows surface background.
- `divider`: Thin horizontal line (1px border-top, var(--d-border)) between groups.
  **Layout guidance:**
  - active_indicator: Active item uses a 3px left border in var(--d-primary) color plus a light primary background tint: background: color-mix(in srgb, var(--d-primary) 10%, transparent).
  - group_headings: Section group headings use the d-label class. They are not clickable, just visual separators.
  - icon_alignment: Icons are 16-20px, vertically centered with the label text. Use flex + align-items: center.
  - mobile_tabs: On mobile (<640px), render as a horizontal scrollable row of tab items. Show icon + short label. Active tab has a bottom border instead of left border.

### form

Structured form with labeled field groups, validation states, and action buttons

**Components:** Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup

**Layout slots:**
- `section`: Card with 2-column layout: labels left, fields right
- `section-title`: Section heading with _heading4 and description with _bodysm _fgmuted
- `field-group`: Grid of form fields with _grid _gc1 _lg:gc2 _gap4
- `actions`: Bottom-aligned save/cancel buttons
  **Layout guidance:**
  - label_position: stacked
  - note: Labels go ABOVE their field, not side-by-side. This prevents the label-field gap problem at wide viewports.
  - max_width: Form content should be constrained to max-width: 40rem (640px). Full-width forms are hard to read.
  - section_grouping: Group related fields under section headers. Use a SINGLE d-surface card for the entire form, OR no card at all. Do NOT wrap each section in its own separate card.
  - icon_placement: Section header icons render INLINE with the heading text (icon left of heading, vertically centered), not floating outside the card border.
  - select_styling: Apply d-control to ALL form elements including <select>. Add appearance: none and a custom SVG chevron for consistent styling.
  - textarea: Textareas should have min-height: 6rem to visually differentiate from single-line inputs.

---

## Pages

### discover (/discover)

Layout: filter-bar (compact) → spatial-card-stack (deck) → swipe-action-bar (three-button) → match-celebration (first-match) → hero (empty-state) → bottom-tab-bar (standard)

### matches (/matches)

Layout: presence-avatars (detailed) → stats-bar (default) → avatar-grid-tile (standard) → hero (empty-state) → bottom-tab-bar (standard)

### chat-list (/chat)

Layout: conversation-list (standard) → hero (empty-state) → bottom-tab-bar (standard)

### chat-thread (/chat/:userId)

Layout: chat-header (compact) → chat-thread (standard) → chat-input (standard) → bottom-tab-bar (standard)

### profile-own (/me)

Layout: mobile-profile-hero (own-profile) → stats-bar (default) → tech-pills (standard) → settings-nav (standard) → bottom-tab-bar (standard)

### profile-other (/u/:userId)

Layout: mobile-profile-hero (other-profile) → stats-bar (default) → tech-pills (standard) → bottom-tab-bar (standard)

### settings (/settings)

Layout: settings-nav (standard) → form (standard) → bottom-tab-bar (standard)
