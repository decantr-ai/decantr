# Page Pack

**Objective:** Implement the home route using the compiled page contract.
**Target:** react-vite (react)
**Scope:** pages=home | patterns=hero-split, cta-section, features, how-it-works, testimonials, footer

## Page Contract
- Page: home
- Path: /
- Shell: top-nav-footer
- Section: marketing-swipecircle (public)
- Theme: swipecircle (light)
- Features: marketing, seo, conversion, demo-mode
- Surface: _flex _col _gap4

## Page Patterns
- hero-split -> hero-split [hero | centered]
  > Centered single-column layout with media above and text below. Logo/image centered at top, followed by centered title, tagline, and CTA buttons. Good for simpler landing pages.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scroll-reveal
- cta-section -> cta-section [row | banner]
  > Compact horizontal bar with text on left, single button on right. Good for inline CTAs between content sections.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover
- features -> features [grid | grid]
  > Grid of feature cards, each with icon, heading, and description
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scroll-reveal
- how-it-works -> how-it-works [grid | horizontal]
  > Horizontal row of 3-4 steps connected by lines/arrows
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scroll-reveal
- testimonials -> testimonials [grid | grid]
  > Grid of testimonial cards, each with quote, avatar, name, and role
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] scroll-reveal
  - [ ] drag-reorder
- cta-section -> cta-section [row | banner]
  > Compact horizontal bar with text on left, single button on right. Good for inline CTAs between content sections.
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] animate-on-mount
  - [ ] stagger-children
  - [ ] glow-hover
- footer -> footer [stack | standard]
  > Multi-column footer with link groups, social icons, and copyright
  **Interactions (MUST implement each — see DECANTR.md "Interaction Requirements"):**
  - [ ] hover-reveal
  - [ ] keyboard-navigation

## Page Directives

Execution-level rules for this route. Follow exactly.

- Hero tagline: 'Rate. Connect. Vibe.' — three-word punch. Keep it fully visible in the first viewport with no clipping, transforms, or overlapping CTA strips.
- Hero subhead: warm, inviting, ~12-18 words — describe the swipe-and-connect promise without being thirsty
- Hero background should feel photo-first and premium: use a real-looking swipe card mockup/photo stack on a mostly white or warm off-white surface with coral/violet accents. Avoid a single solid peach gradient slab as the whole hero.
- Auth CTA section provides TWO equal-weight buttons: 'Sign Up' (primary coral pill) and 'Log In' (secondary white-bordered pill), plus a small ghost link below: 'Try Demo Mode' for instant exploration without signup. It must sit in normal document flow below the hero copy or inside the hero composition, never as a fixed or overlapping banner.
- Features section highlights the four pillars: Swipe (heart icon), Match (sparkle icon), Chat (message icon), Vibe (smile icon) — short blurb per pillar, soft white cards with subtle peach tint and enough internal padding that text never hugs the border.
- How-it-works walks through the 3-step loop: 1) Build your profile, 2) Swipe through your circle, 3) Chat with matches — illustrated by photo cards or compact mockups rather than empty bordered slabs
- Testimonials use real-feeling first-name + age tags (no LinkedIn-style headshots) — '— Maya, 27', '— Jordan, 32' — feels like reading text messages from friends
- Final CTA banner is coral-fill with white text + arrow icon: 'Find your circle today →'
- Footer remains warm: about, privacy, terms, contact — no enterprise compliance noise. Footer must be part of the page flow and must not cover the how-it-works or CTA content.

## Shared Contract
Required setup, allowed vocabulary, success checks, anti-patterns, and token budget are shared across every page pack. The full list lives in the pack JSON sidecar (`page-<id>-pack.json`) and in the pack-manifest. Refer there instead of re-reading the same boilerplate 16 times.
