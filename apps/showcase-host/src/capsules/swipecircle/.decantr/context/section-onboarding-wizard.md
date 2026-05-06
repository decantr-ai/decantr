# Section: onboarding-wizard

**Role:** gateway | **Shell:** centered | **Archetype:** onboarding-wizard
**Description:** Gateway archetype for multi-step new-user onboarding flows. Three-step wizard pattern: account creation, profile completion (with photo upload), and interests selection. Each step occupies its own route on the centered shell with a stepper progress indicator at the top. Designed for consumer apps where post-auth profile completion is required before entering the primary app surface.

## Quick Start

**Shell:** Centered card on a background. Used for auth flows (login, register, forgot password) across all archetypes.
**Pages:** 3 (account-step, profile-step, interests-step)
**Key patterns:** onboarding-wizard [moderate], auth-form, cta-section, content-uploader [moderate], form [complex], chip-multiselect [moderate]
**Theme decorators:** 10 classes — see `section-onboarding-wizard-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Playful, warm, encouraging — never desperate, never pushy.

## Shell Implementation (centered)

### root

- **display:** flex
- **align:** center
- **justify:** center
- **min_height:** 100vh
- **background:** var(--d-bg)
- **atoms:** _flex _aic _jcc _minh[100vh]

### body

- **width:** 100%
- **max_width_auth:** 28rem
- **max_width_wide:** 36rem
- **padding:** 1.5rem
- **treatment:** d-surface
- **border_radius:** var(--d-radius-lg)
- **note:** Single centered card. No sidebar, no header. Auth forms use 28rem, wider content 36rem.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (centered)

- **Max Width:** Centered content should be constrained to max-width: 28rem (448px) for auth forms, 36rem (576px) for wider content.
- **Vertical Centering:** Center the content card vertically using min-height: 100dvh with flexbox centering.
- **Shell Spacing:** Centered shell owns viewport centering, outer padding, and maximum-width rhythm. Route components should render the card contents only and must not add nested full-height centering wrappers.

## Theme Reference

**Theme:** swipecircle (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 10 `swipecircle-*` classes — full Class/Intent/Apply-to table in `section-onboarding-wizard-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Compositions:** **swipe-feed:** Photo-first swipe deck centered in the viewport with floating action bar above bottom tabs. Coral and violet accents punctuate the warm peach surface.
**matches:** Grid of circular avatar tiles with new-match dots, presence rail at top. Soft tile lift on hover with coral glow.
**chat:** Intimate one-to-one chat with rounded bubbles and warm timestamps. Coral mine, cream theirs.
**profile:** Mobile profile with full-bleed cover photo, overlapping circular avatar, stats bar, interest pills, and pill-shaped action buttons.
**auth:** Single centered card on warm peach background. Coral primary CTA, violet hover state. Bouncy entrance.
**marketing:** Splash with photo-first hero, swipe-card/photo mockups, pill CTAs, warm off-white scroll surface, and coral/violet accents. Friendly, not corporate. Avoid ambient blobs/orbs or a single solid peach hero slab.
**Spatial hints:** Density bias: none. Section padding: 1.5rem. Card wrapping: rounded-photo.


Usage: `className={css('_flex _col _gap4') + ' d-surface swipecircle-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Gateway (gateway) — centered shell
Auth success → enters App zone. Sign out returns here.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth, photo-upload, step-validation, form-validation, interests-picker

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

### onboarding-wizard

Multi-step guided flow with progress indicator, step validation, and completion celebration for user onboarding and setup experiences.

**Components:** StepIndicator, StepContent, NavigationButtons, ProgressBar, CompletionScreen, SkipButton

**Layout slots:**
- `step-indicator`: Horizontal row of step markers centered at the top of the wizard. Max-width 480px for 4-5 steps (scales proportionally). Each step marker is a flex column: the circle (32px diameter) on top, and optionally a step label (text-xs text-muted, max-width 80px, text-center, margin-top 6px) below. Circles are connected by horizontal lines (2px height) that span from the right edge of one circle to the left edge of the next, vertically centered with the circles. Circle states — Completed: background var(--d-accent), white checkmark SVG icon (16px), full opacity. Active: background var(--d-accent), white step number (text-sm font-bold), box-shadow: 0 0 0 4px color-mix(in srgb, var(--d-accent) 15%, transparent), slightly larger (36px diameter) with a smooth size transition. Upcoming: background transparent, border 2px solid var(--d-border-muted), step number in text-muted (text-sm). Line states — Between completed steps: background var(--d-accent). Between active and next: a gradient from var(--d-accent) to var(--d-border-muted). Between upcoming steps: background var(--d-border-muted). The active circle and its connecting lines transition smoothly (300ms ease-out) when stepping forward or backward.
- `progress-bar`: A thin horizontal bar positioned directly below the step indicator with 12px top margin. Width matches the step indicator container (480px or proportional). Height: 4px. Border-radius: 2px. Track: background var(--d-bg-muted). Fill: background var(--d-accent), width transitions smoothly (400ms ease-out) as the user progresses. The fill width represents overall completion as a percentage (e.g., step 2 of 4 = 50%). On completion, the bar fills to 100% with a brief accent pulse animation.
- `step-content`: The main content area below the progress bar. Max-width 640px, width 100%, centered (margin 0 auto), padding-top 40px. Each step renders: a title (text-xl font-semibold text-foreground, text-center or text-left depending on content type), an optional description (text-sm text-muted, margin-top 8px, margin-bottom 24px, max-width 480px, text-center for intro text or text-left for form instructions), and the step body (form fields, selections, informational content). Transitions between steps: the outgoing step slides out (translateX to -100% for forward, +100% for backward) while the incoming step slides in from the opposite side, both over 300ms ease-out. The content area has a min-height (e.g., 300px) to prevent layout shift between steps of different heights.
- `navigation-buttons`: A horizontal flex row at the bottom of the step content area. Width matches the step content (max-width 640px). Margin-top 32px. Justify-content: space-between for when SkipButton is present, or flex-end when only Back/Continue show. Left side: SkipButton (text-xs text-muted, ghost style, 'Skip this step' with a right-pointing chevron icon, only visible on optional steps, hover: text-foreground, hover: underline). Right side: a flex row with gap 12px containing the Back button (ghost variant, text-sm, left arrow icon + 'Back' text, visible from step 2 onward, disabled on step 1) and the Continue button (primary variant, text-sm font-medium, 'Continue' text + right arrow icon, min-width 120px, accent background, white text). On the final step, Continue reads 'Complete Setup' or 'Get Started' and may have a sparkle/check icon. The Continue button shows a loading spinner (16px, replacing the arrow icon) during async validation. If validation fails, the button shakes briefly (translateX -4px→4px→-2px→2px→0, 400ms) and an error message appears below it.
- `completion-screen`: Replaces step-content and step-indicator after the final step is completed. A centered vertical flex column with items-center. Top: an animated check circle — a 72px diameter circle with background var(--d-accent) and a white checkmark SVG. The checkmark draws itself with a stroke-dasharray animation: dasharray equals the path length, dashoffset animates from full to 0 over 600ms with a cubic-bezier(0.65, 0, 0.35, 1) easing. The circle itself scales from 0.8 to 1.0 with a slight overshoot (spring) during the same period. Below: 'You are all set!' heading (text-2xl font-bold text-foreground, margin-top 24px), a congratulatory description (text-base text-muted, max-width 400px, text-center, margin-top 8px, e.g., 'Your account is configured and ready to go.'), and a primary 'Get Started' button (margin-top 32px, large size, min-width 160px). Confetti animation: 40 small particles (4-8px each, mix of circles and rectangles) in accent, green (#22c55e), amber (#f59e0b), and purple (#8b5cf6) colors burst outward from the center of the screen in a fountain pattern, each with random velocity, gentle gravity, rotation, and opacity fade. The burst lasts 2.5 seconds total, particles fade out individually as they slow. Confetti is rendered in a fixed overlay layer with pointer-events: none.
- `skip-button`: A subtle, low-emphasis text button that appears on the left side of the navigation row for optional steps. Renders as text-xs text-muted with no background or border. Text reads 'Skip this step' or 'I'll do this later'. On hover: text color strengthens to text-foreground with an underline. On click: advances to the next step without saving the current step's data. Only present on steps explicitly marked as skippable — mandatory steps do not show this button.
  **Layout guidance:**
  - container: centered-column
  - note: The wizard should be centered on the page with a max-width of 720px for the overall container and 640px for step content. Generous vertical spacing creates a calm, focused feel. Do NOT cram the wizard into a small card — it should feel spacious.
  - step_indicator: The horizontal step indicator must be visually clear at a glance. Completed (checkmark), active (filled, highlighted), and upcoming (outlined, muted) states must be distinctly different. The connecting lines are essential — they visually link the steps into a journey narrative. Place the step indicator within a max-width container (e.g., 480px for 4-5 steps) centered above the content.
  - content_area: Step content should be max-width 640px centered. Form fields within each step should use the full width. Keep each step focused — one primary action or information group per step. Avoid scrolling within a step if possible.
  - navigation_alignment: Navigation buttons align to the right edge of the content area. The 'Back' button sits to the LEFT of 'Continue' with a 12px gap. The SkipButton, if present, sits to the FAR LEFT of the button row (justify-between with the nav buttons). This creates a clear visual hierarchy: skip (optional, left), back (secondary, right-of-center), continue (primary, far right).
  - completion_celebration: The confetti animation should be delightful but not overwhelming. Use 30-50 particles, small sizes (4-8px), and fade them out after 2.5 seconds. The check circle animation should be the star — the checkmark stroke draws itself over 600ms with a satisfying easing curve.

### auth-form

Unified authentication form with multiple modes: login, register, forgot-password, reset-password, verify-email, mfa-setup, mfa-verify, phone-verify.

**Components:** Button, icon

**Layout slots:**
- `header`: Logo and welcome title
- `form`: Email and password inputs
- `oauth`: Social login buttons (Google, GitHub, etc.)
- `divider`: 'or continue with' separator
- `footer`: Register and forgot password links
- `error`: Inline error message area
  **Layout guidance:**
  - shell_ownership: The centered shell owns viewport centering and the outer card frame. Route components should render auth content inside that card rhythm, not add another full-height centering wrapper.
  - field_stack: Fields, CTA, OAuth buttons, and footer links should align to one stable column width. OAuth rows should feel like part of the form, not a detached widget.
  - verification_states: Pending-email, MFA, and reset-success states should feel like transitions of the same auth surface rather than unrelated page layouts.

### cta-section

Full-width call-to-action section with headline, description, and action buttons

**Components:** Button

**Layout slots:**
- `headline`: Section heading with _heading2, centered
- `description`: Supporting paragraph with _body _fgmuted _mw[640px]
- `cta-group`: Horizontal Button group with _flex _gap3, primary + secondary
  **Layout guidance:**
  - shell_rhythm: CTA sections should feel like a deliberate break in the page rhythm, but they still inherit the shell-owned width and spacing system. Do not add extra page wrappers around them.
  - cta_priority: The primary CTA must be visually dominant, but secondary CTAs should still feel aligned and intentional rather than like an afterthought.
  - background_treatment: Use a distinct but controlled background treatment so the CTA reads as a purposeful moment, not as a random card dropped into the page.

### content-uploader

Drag-drop media upload component with file preview, progress tracking, and multi-file support. Handles images, videos, audio, and documents.

**Components:** Button, Card, Progress, icon

**Layout slots:**
- `dropzone`: Drag-drop target area with visual feedback
- `file-list`: Uploaded files with progress bars
- `preview`: Media preview thumbnails grid
- `actions`: Upload, cancel, clear buttons
  **Layout guidance:**
  - dropzone_priority: The primary affordance is the upload target itself. Supporting file previews and action rows should reinforce confidence in what has been selected, not compete with the dropzone.
  - progress_clarity: Upload state, file identity, and error or retry status should stay tightly grouped for each file so the user can resolve issues without scanning the whole surface.
  - single_vs_multi: Single-file flows should emphasize preview and replacement, while multi-file flows should emphasize queue state and per-file progress.

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

### chip-multiselect

Toggleable multi-select pill input. Used for interest pickers, category selectors, tag filters — anywhere users pick 3-N from a curated set. Differs from tech-pills (read-only display) by being interactive form input. Each chip toggles a selected state with a bounce-scale and check-icon insertion. Validates via min/max counts.

**Components:** ChipGroup, Chip, CheckIcon, HelperText, ValidationMessage, CountIndicator

**Layout slots:**
- `chip-group`: Outer container holding the chip grid + helper + validation. Flex-col, gap 12px. Width fills parent. Carries aria-role='group' and aria-labelledby pointing to the field label (rendered by the parent form).
- `chip`: Repeating slot — one per choice. Pill-shaped button (border-radius: 9999px, padding: 8px 14px, font-size: 14px, font-weight: 500). Flex-row, items-center, gap 6px (gap reserved for the check icon). data-selected: 'true' | 'false'. data-disabled: 'true' | 'false'. Cursor: pointer. Min height 36px. Inactive: border 1.5px solid var(--d-border), background transparent, color var(--d-text-muted). Active: applies the swipecircle-chip-selected decorator (or theme equivalent) — border + background var(--d-primary), color white. On press: scale(0.94) for 80ms, spring back to scale(1) over 220ms cubic-bezier(0.34, 1.56, 0.64, 1).
- `check-icon`: 12px Lucide Check icon, conditionally rendered when data-selected=true. Color white. On chip activation, animates in: opacity 0→1 + translateX(-4px)→0 over 200ms cubic-bezier(0.34, 1.56, 0.64, 1). Sits at the left edge of the chip content, before the label.
- `helper-text`: Single-line text below the chip group. font-size 12px, color var(--d-text-muted), font-weight 500. Content: 'Pick at least 3 interests' or 'Choose up to 5 categories' — describes the selection requirement.
- `count-indicator`: Inline span next to or below helper text. font-size 12px, font-weight 600. Format: '{count} of {min}–{max}' (e.g., '2 of 3–5'). Color: var(--d-primary) when count is within range, var(--d-danger) when below min, var(--d-warning) when above max.
- `validation-message`: Conditionally rendered below helper-text. Visible only when validation fails. font-size 12px, color var(--d-danger), font-weight 500. Animates in via opacity 0→1 + translateY(-4px)→0 over 200ms ease-out. Includes the role='alert' aria attribute for screen readers.
  **Layout guidance:**
  - container: flex-wrap horizontal grid
  - chip_target: Each chip min 36px tall × 56px wide for tap targets; padding 8px 14px
  - selected_signal: Three redundant signals: fill, border, AND check icon — important for color-blind accessibility
  - validation: Inline below the chip grid; min/max defined via data attributes (data-min=N, data-max=N)
  - scrollbar: If the container has a max-height that triggers vertical scroll, use overflow-y: auto with scrollbar-thin

---

## Pages

### account-step (/signup)

Layout: onboarding-wizard (stepper) → auth-form (register) → cta-section (banner)

### profile-step (/onboarding/profile)

Layout: onboarding-wizard (stepper) → content-uploader (single) → form (standard) → cta-section (banner)

### interests-step (/onboarding/interests)

Layout: onboarding-wizard (stepper) → chip-multiselect (standard) → cta-section (banner)
