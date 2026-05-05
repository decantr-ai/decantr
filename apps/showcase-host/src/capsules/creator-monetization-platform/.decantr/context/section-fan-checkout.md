# Section: fan-checkout

**Role:** auxiliary | **Shell:** minimal-header | **Archetype:** fan-checkout
**Description:** Purchase and subscription checkout flow for fans. Complete payment for subscriptions and one-time purchases.

## Quick Start

**Shell:** Slim header with centered content below. Used for checkout flows, focused task pages. (header: 44px)
**Pages:** 3 (checkout, purchase, success)
**Key patterns:** checkout-flow [moderate], chat-message
**CSS classes:** `.studio-card`, `.studio-glow`, `.studio-input`
**Density:** comfortable
**Voice:** Warm, encouraging, and creator-supportive.

## Shell Implementation (minimal-header)

### body

- **flex:** 1
- **align:** center
- **atoms:** _flex _col _aic _overflow[auto] _flex1 _py8
- **padding:** 2rem 0
- **direction:** column
- **overflow_y:** auto
- **content_wrapper:**
  - gap: 1.5rem
  - note: Centered column for focused content. Checkout forms, task pages.
  - atoms: _w[720px] _mw[100%] _px4 _flex _col _gap6
  - width: 720px
  - padding: 0 1rem
  - direction: column
  - max_width: 100%

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **note:** Slim header with centered brand. Minimal — no nav links.
- **align:** center
- **border:** bottom
- **height:** 44px
- **sticky:** true
- **content:** Back arrow icon + brand link, centered
- **display:** flex
- **justify:** center
- **padding:** 0.75rem 0
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Spacing Guide

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Content gap | `--d-content-gap` | `1rem` | Gap between sibling elements |
| Section padding | `--d-section-py` | `5rem` | Vertical padding on d-section |
| Surface padding | `--d-surface-p` | `1.25rem` | Inner padding for d-surface |
| Interactive V | `--d-interactive-py` | `0.5rem` | Vertical padding on buttons |
| Interactive H | `--d-interactive-px` | `1rem` | Horizontal padding on buttons |
| Control | `--d-control-py` | `0.5rem` | Vertical padding on inputs |
| Data row | `--d-data-py` | `0.625rem` | Vertical padding on table rows |

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Key palette tokens:**

| Token | Value | Role |
|-------|-------|------|
| `--d-text` | `#1C1917` | Body text, headings, primary content |
| `--d-accent` | `#14B8A6` |  |
| `--d-border` | `#E7E5E4` | Dividers, card borders, separators |
| `--d-primary` | `#F97316` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#8B5CF6` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAF9F7` | Page canvas / base layer |
| `--d-text-muted` | `#78716C` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#EA580C` | Hover state for primary elements |
| `--d-surface-raised` | `#F5F3F0` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#7C3AED` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.studio-card` | Surface background, soft shadow, 12px radius, hover lift transition. |
| `.studio-glow` | Subtle primary-tinted glow effect for call-to-action buttons. |
| `.studio-input` | Warm border with coral focus ring and gentle glow effect. Friendly input styling. |
| `.studio-canvas` | Warm background using theme background token. Friendly, inviting foundation. |
| `.studio-divider` | Warm hairline separator using border-color token. |
| `.studio-fade-up` | Entrance animation: opacity 0 to 1, translateY 16px to 0, 250ms ease-out. |
| `.studio-surface` | Soft surface elevation with 1px warm border and subtle shadow. Uses surface background. |
| `.studio-skeleton` | Loading placeholder with warm pulse animation. |
| `.studio-gate-blur` | Backdrop blur effect for content behind paywalls. |
| `.studio-badge-tier` | Tier badge with gradient backgrounds for subscription levels. |
| `.studio-card-premium` | Premium card with purple gradient border for exclusive content. |
| `.studio-avatar-creator` | Larger creator avatar with accent ring highlight. |

**Preferred:** checkout-flow
**Compositions:** **auth:** Centered auth forms with warm card styling.
**checkout:** Minimal checkout flow with focused content area.
**dashboard:** Creator dashboard with sidebar navigation. Analytics, content management, subscriber views.
**marketing:** Marketing pages with top nav and footer. Clean sections with warm accents.
**storefront:** Fan-facing storefront with top navigation. Creator profiles, content browsing.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: soft.


Usage: `className={css('_flex _col _gap4') + ' d-surface studio-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — minimal-header shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

stripe-integration, promo-codes, apple-pay, google-pay

---

## Visual Direction

**Personality:** Warm, creator-first monetization platform that celebrates creative work. Light theme with soft gradients and rounded cards. Creator profiles are visually rich — large cover images, prominent avatars, and tier cards with benefit previews. Earnings dashboards use approachable chart styles (rounded bars, smooth lines) in warm accent tones. The fan storefront feels like a boutique, not a marketplace. Premium tiers get subtle visual elevation. Think Patreon meets Gumroad with a Dribbble-level polish.

## Pattern Reference

### checkout-flow

Complete purchase/subscribe checkout process with payment form, promo codes, order summary, and success confirmation.

**Visual brief:** Two-column layout with an order summary card on the right and a payment form on the left. The summary card shows line items with names and prices, a promo code input field, subtotal, tax, and total in bold. The payment form includes radio buttons for payment method (card, PayPal), card number/expiry/CVC inputs with card brand icon detection, billing address fields, and a prominent submit button at the bottom. Subscribe preset adds plan name and billing cycle selector. Upgrade preset shows a comparison of current vs. new plan.

**Components:** Button, Card, Input, Badge, Radio, icon

**Composition:**
```
PaymentForm = Form(d-surface, flex-col) > [MethodSelect > Radio(d-control)[] + CardInputs > [NumberInput + ExpiryInput + CVCInput] + BillingAddress + SubmitButton(d-interactive, variant: primary, full-width)]
CheckoutFlow = Grid(d-section, 2-col, responsive: stack) > [PaymentForm + OrderSummary]
OrderSummary = Card(d-surface, sticky) > [LineItems > LineItem[] + PromoInput?(d-control) + Subtotal + Tax + Total(heading3, font-bold)]
```

**Layout slots:**
- `terms`: Terms acceptance checkbox
- `submit`: Subscribe/pay button
- `summary`: Tier/order summary card
- `promo-code`: Discount code input
- `payment-form`: Card/payment method inputs
**Responsive:**
- **Mobile (<640px):** Single column layout — order summary moves above the payment form. Submit button is full-width and sticky at the bottom. Card inputs stack vertically.
- **Tablet (640-1024px):** Two-column layout maintained. Summary panel is narrower. Payment form takes majority width.
- **Desktop (>1024px):** Standard two-column layout with comfortable spacing. Summary card is sticky within its column on scroll.


### chat-message

Single message bubble for user or AI responses. Supports markdown rendering, code blocks, attachments, reactions, and edit mode.

**Visual brief:** Message bubble layout with avatar on the left (user messages) or a model icon (assistant messages). Sender name in small bold text with a relative timestamp to the right. Content area supports full markdown: paragraphs, headings, bold/italic, bulleted lists, code blocks with syntax highlighting and copy button, inline code, images, and links. Action buttons (copy, edit, delete, react, branch) appear on hover in a small row above or below the message. User messages align left with a subtle surface background. Assistant messages use a slightly different surface shade. System messages are centered with muted italic text.

**Components:** Avatar, Button, icon

**Composition:**
```
ChatMessage = Row(d-surface, align: role) > [Avatar? + MessageBody + Timestamp?(mono-data, text-xs)]
MessageBody = Bubble(d-surface, variant: role) > [SenderName?(font-bold, text-sm) + Content(markdown) + CodeBlock?(syntax-highlight, copy-button)]
MessageActions = Row(d-interactive, show-on-hover) > IconButton(variant: ghost)[]
```

**Layout slots:**
- `avatar`: AI avatar or icon
- `sender`: Name/label (optional)
- `actions`: Copy, react, branch action buttons on hover
- `content`: Message content with full markdown rendering
- `timestamp`: Relative or absolute timestamp
**Responsive:**
- **Mobile (<640px):** Avatar size reduces to 28px. Action buttons appear on long-press instead of hover. Code blocks scroll horizontally. Message content takes full width minus avatar.
- **Tablet (640-1024px):** Standard layout with 32px avatars. Actions appear on hover/tap.
- **Desktop (>1024px):** Full layout with 36px avatars, hover actions, and generous content width for code blocks.


---

## Pages

### checkout (/checkout)

Layout: checkout-flow

### purchase (/checkout/purchase)

Layout: checkout-flow

### success (/checkout/success)

Layout: chat-message
