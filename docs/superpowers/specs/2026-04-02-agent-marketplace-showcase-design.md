# Agent Marketplace Showcase — Design Spec

**Date:** 2026-04-02
**Location:** `apps/showcase/agent-marketplace/`
**Blueprint:** agent-marketplace
**Theme:** carbon-neon (dark mode, rounded)
**Guard mode:** strict

---

## Overview

A 16-page agent orchestrator showcase application built with React + Vite. Four sections (agent-orchestrator, auth-full, marketing-saas, ai-transparency) across three shell layouts (sidebar-main, centered, top-nav-footer). Uses mock data with live simulation — no real backend.

The personality is "confident cyber-minimal" — dark void backgrounds, neon accent glows, monospace data typography, color-coded status rings with pulse animations. Think Linear meets mission control. Lucide icons throughout. Every pixel serves the operator.

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data strategy | Typed mock data modules in `src/data/` | Realistic feel, easy to swap for real APIs later |
| Auth behavior | Simulated flow with localStorage flag | Demonstrates zone transitions (public → gateway → app) |
| Agent swarm canvas | Full interactive (drag, zoom/pan, minimap) | Core visual differentiator of the showcase |
| Neural feedback loop | Full animated with `requestAnimationFrame` | Matches the mission control energy |
| Icons | `lucide-react` package | Clean imports, tree-shakeable, personality spec calls for Lucide |
| Architecture | Shell-based layout with nested routes | Mirrors Decantr section/shell model, eliminates shell duplication |

---

## Dependencies

- `react-router-dom` — HashRouter (per essence `meta.platform.routing: "hash"`)
- `lucide-react` — icon library
- `@decantr/css` — atom runtime for layout utilities

No other dependencies. No component libraries. CSS is atoms + treatments + decorators.

---

## Routing & Shell Architecture

### Route Tree

```
HashRouter
├── / → TopNavFooterShell → Home
├── /login → CenteredShell → Login
├── /register → CenteredShell → Register
├── /forgot-password → CenteredShell → ForgotPassword
├── /reset-password → CenteredShell → ResetPassword
├── /verify-email → CenteredShell → VerifyEmail
├── /mfa-setup → CenteredShell → MfaSetup
├── /mfa-verify → CenteredShell → MfaVerify
├── /phone-verify → CenteredShell → PhoneVerify
├── RequireAuth → SidebarMainShell
│   ├── /agents → AgentOverview
│   ├── /agents/config → AgentConfig
│   ├── /agents/:id → AgentDetail
│   ├── /marketplace → AgentMarketplace
│   ├── /transparency → ModelOverview
│   ├── /transparency/inference → InferenceLog
│   └── /transparency/confidence → ConfidenceExplorer
```

### Shell Components

**SidebarMainShell**
- Collapsible sidebar (240px expanded, 56px collapsed) with `carbon-glass` decorator
- Header bar with breadcrumbs, page title, command palette trigger
- Scrollable `<main>` with `<Outlet />`
- Sidebar collapse toggle in header next to brand/logo
- Collapse state persisted in localStorage
- `entrance-fade` on main content area

**CenteredShell**
- `min-height: 100dvh`, flexbox centered
- Single `<Outlet />` constrained to `max-width: 28rem`

**TopNavFooterShell**
- Sticky NavHeader (carbon-glass) with logo, links, CTAs, mobile hamburger
- `<main>` with `<Outlet />`
- Footer

### Auth Gating

- `RequireAuth` wrapper checks localStorage auth flag
- Unauthenticated users → redirect to `/login`
- After mock login → redirect to `/agents`
- `logout()` → clear flag → navigate to `/login`

---

## Sidebar Navigation

```
[Brand/Logo + Collapse Toggle]
─────────────────────────────
AGENTS (d-label, accent left border)
  Bot    Overview        /agents
  Store  Marketplace     /marketplace
  Cog    Configuration   /agents/config

TRANSPARENCY (d-label, accent left border)
  Brain       Models          /transparency
  ScrollText  Inference Log   /transparency/inference
  Target      Confidence      /transparency/confidence

─────────────────────────────
[bottom: user avatar + sign out]
```

- Active route: `d-interactive[data-variant="primary"]` background
- Collapsed: icons only
- Hotkeys as keydown listeners, NOT rendered in sidebar UI
- Command palette: `Cmd+K` / `Ctrl+K` → modal with fuzzy route search

---

## Data Layer

### Types (`src/data/types.ts`)

```typescript
Agent: {
  id: string
  name: string
  status: 'active' | 'idle' | 'error' | 'processing'
  model: string
  tasks: number
  connections: string[]
  metrics: { requests: number, latency: number, tokens: number, uptime: number }
}

TimelineEvent: {
  id: string
  agentId: string
  type: 'action' | 'decision' | 'error' | 'tool_call' | 'reasoning' | 'warning'
  summary: string
  detail: string
  timestamp: number
  duration?: number
}

MetricSnapshot: {
  label: string
  value: number
  unit: string
  trend: number
  history: number[]
}

PricingTier: {
  name: string
  price: { monthly: number, annual: number }
  features: string[]
  recommended: boolean
}

Testimonial: { quote: string, author: string, role: string, company: string, avatar: string }
Feature: { icon: string, title: string, description: string }
HowItWorksStep: { number: number, title: string, description: string }
```

### Mock Data Files

- `agents.ts` — 8-12 agents with varied statuses, realistic names (e.g., "sentinel-7x3k", "parser-alpha")
- `events.ts` — 30-40 timeline events spread across agents
- `metrics.ts` — KPI snapshots for transparency pages
- `marketing.ts` — pricing tiers (3), testimonials (6), features (6), how-it-works steps (4)

### Simulation Hooks

- `useAgentSimulation()` — `setInterval` (3s) randomly toggles agent statuses and appends new timeline events
- `useMetricSimulation()` — `setInterval` (2s) drifts metric values within realistic ranges
- Both respect `prefers-reduced-motion`

### Auth Hook

- `useAuth()` — `useState` + localStorage
- `login(email, password)` — always succeeds after 800ms delay, sets flag
- `logout()` — clears flag, navigates to `/login`

---

## Pattern Components

### Shared Patterns (multi-page)

**AgentTimeline** — Used on: agent-overview, agent-detail, inference-log
- Vertical 2px line at 16px from left edge, full height, `var(--d-border)`
- 12px colored orbs centered ON the line, aligned with first text line
- Collapsible event cards with colored left-border per event type
- Sticky summary header: agent name, model, status badge, event counts, elapsed time, token usage
- Filter chips: toggleable per event type, each with distinct color
- Event type colors: action=cyan, decision=green, error=red, warning=amber, tool_call=purple, reasoning=gold

**NeuralFeedbackLoop** — Used on: agent-detail, model-overview
- SVG-based circular visualization
- PulseCore: radial gradient, breathing scale oscillation (slow=3s idle, rapid=1s active)
- IntensityRing: conic-gradient fill via CSS `@property` animation
- FlowTrack: 6-8 particles on arc paths via `requestAnimationFrame`, speed = throughput
- MetricDisplay: mono-data label with value + unit + trend arrow
- Detail tooltip on hover

**Hero** — Used on: agent-marketplace, home
- Full-width section, no d-surface card wrapping
- Staggered entrance: headline (0ms), subtext (150ms), CTAs (450ms), all fade-up 20px
- CTAs: primary filled + secondary ghost, equal padding/height

**StatsOverview** — Used on: model-overview, confidence-explorer
- Responsive row of stat cards
- Counter roll-up animation on mount (800ms ease-out)
- Trend badges with directional icons

**AuthForm** — Used by: all 8 auth pages
- Single component with `variant` prop determining fields/CTAs
- Centered in CenteredShell, max-width 28rem
- Validation shake on error, success fade-out + redirect

### Section-Specific Patterns

**AgentSwarmCanvas** — agent-overview page
- Full-bleed spatial canvas, no d-surface wrapping
- SVG layer: animated bezier connection paths (stroke-dashoffset, 3s linear infinite)
- Positioned agent node cards: d-surface[data-interactive], status-ring, draggable
- Pan: pointer drag on canvas background → translate
- Zoom: wheel + buttons, clamped 0.3x–3x
- Minimap: bottom-right, scaled replica of canvas
- Control bar: bottom-center (zoom in/out, fit view, play/pause, toggle minimap, reset layout)
- Status overlay: top-right (agent count, running count, error count)
- Force-directed initial layout, then free drag repositioning
- Click node → navigate to `/agents/:id`
- Error nodes: red border glow (`box-shadow: 0 0 12px color-mix(in srgb, var(--d-error) 25%, transparent)`)

**GenerativeCardGrid** — agent-marketplace page
- CSS grid: `repeat(auto-fill, minmax(280px, 1fr))`
- Cards: shimmer skeleton → loaded preview, hover lift translateY(-4px)
- Action bar reveals on hover (regenerate, favorite, expand, copy, delete)
- Generation badge top-right (model name, generation time)
- Filter tabs at top — functional filtering via React state
- Empty state on 0 filter results

**FormSections** — agent-config page
- Multi-section form with labeled groups
- Labels above fields, never side-by-side
- Single d-surface card for entire form (not per-section)
- 2-column grid at desktop, single column mobile
- Max-width 640px
- Save/cancel buttons at bottom

**IntentRadar** — confidence-explorer page
- SVG radial display with concentric circle gridlines
- Confidence vectors radiating from center, length = confidence score
- Suggestion chips at vector endpoints
- Radar sweep animation (8s rotation infinite)
- Glowing center with query text

**NavHeader** — marketing home (top-nav-footer shell)
- Logo left, links center, CTAs right
- Scroll: backdrop blur + shadow
- Mobile: hamburger → slide-in panel

**Features** — marketing home
- 3-column grid of feature cards (icon circle + heading + description)
- Stagger fade-up, 80ms per card (IntersectionObserver)

**HowItWorks** — marketing home
- 3-4 horizontal numbered steps with connecting lines
- Step circles: 48px, primary background, white text
- Stagger entrance, 120ms per step

**Pricing** — marketing home
- 3 tier cards, middle recommended (elevated, primary border, badge)
- Monthly/annual toggle with price counter animation
- Feature checklists with check/x icons

**Testimonials** — marketing home
- Grid of quote cards (open-quote icon, italic text, author row with avatar)
- Fade-in on section enter

**CtaSection** — marketing home
- Full-width, subtle gradient or glass background
- Centered headline + description + two CTAs
- Idle CTA pulse after 3s

**Footer** — marketing home
- Simple footer with links and copyright

---

## CSS Strategy

### Composition Pattern

```tsx
<div className={css('_flex _col _gap4') + ' d-surface carbon-glass'}>
```

- **Atoms** via `css()` from `@decantr/css` — layout only
- **Treatments** as plain class strings — semantic styling
- **Decorators** as plain class strings — theme decoration

### Decorator CSS

Fill the empty `@layer decorators` block in treatments.css with CSS for all 10 decorators:
- `.carbon-card` — surface bg, subtle border, 8px radius, hover shadow
- `.carbon-code` — monospace, surface-raised bg, 3px left border accent
- `.carbon-glass` — backdrop-filter blur(12px), semi-transparent surface, 1px border
- `.carbon-input` — soft border, focus ring with primary blue
- `.carbon-canvas` — bg using --d-bg token
- `.carbon-divider` — hairline separator
- `.carbon-skeleton` — pulse animation placeholder
- `.carbon-bubble-ai` — left-aligned message bubble
- `.carbon-bubble-user` — right-aligned message bubble, primary-tinted
- `.carbon-fade-slide` — entrance animation: opacity + translateY

### App CSS

New `src/styles/app.css` in `@layer app` for:
- Canvas dot-grid background, connection path animations
- Timeline vertical line + orb positioning
- Neural feedback loop keyframes
- Intent radar gridlines + vectors
- Marketing section spacing overrides
- Command palette overlay
- Sidebar transition (width collapse)

### Theme Scoping

- `class="dark"` on `<html>` for showcase convention
- `data-theme="carbon-neon"` on `<html>` for theme-scoped treatment overrides

---

## Interaction & Animation

### Global

- `entrance-fade` on main content for page transitions
- `prefers-reduced-motion: reduce` disables non-essential animations
- Hotkeys: `g a` → /agents, `g m` → /marketplace, `g t` → /transparency
- Command palette: `Cmd+K` / `Ctrl+K` → fuzzy route search modal

### Per-Component (see Pattern Components section for details)

Key animations:
- Canvas: node drag, zoom/pan, connection flow, status glow pulse
- Timeline: orb pulse, event expand/collapse, hover shift
- Neural feedback: breathing PulseCore, particle flow, intensity ring fill
- Marketing: staggered section entrances, pricing counter, testimonial fade
- Auth: validation shake, submit press, success redirect

---

## File Structure

```
src/
  components/
    shells/
      SidebarMainShell.tsx
      CenteredShell.tsx
      TopNavFooterShell.tsx
    patterns/
      AgentSwarmCanvas.tsx
      AgentTimeline.tsx
      NeuralFeedbackLoop.tsx
      StatsOverview.tsx
      Hero.tsx
      AuthForm.tsx
      GenerativeCardGrid.tsx
      FormSections.tsx
      IntentRadar.tsx
      NavHeader.tsx
      Features.tsx
      HowItWorks.tsx
      Pricing.tsx
      Testimonials.tsx
      CtaSection.tsx
      Footer.tsx
    ui/
      Button.tsx
      Badge.tsx
      Input.tsx
      CommandPalette.tsx
      Breadcrumbs.tsx
  pages/
    agent-orchestrator/
      AgentOverview.tsx
      AgentDetail.tsx
      AgentConfig.tsx
      AgentMarketplace.tsx
    auth/
      Login.tsx
      Register.tsx
      ForgotPassword.tsx
      ResetPassword.tsx
      VerifyEmail.tsx
      MfaSetup.tsx
      MfaVerify.tsx
      PhoneVerify.tsx
    marketing/
      Home.tsx
    transparency/
      ModelOverview.tsx
      InferenceLog.tsx
      ConfidenceExplorer.tsx
  data/
    types.ts
    agents.ts
    events.ts
    metrics.ts
    marketing.ts
  hooks/
    useAuth.ts
    useHotkeys.ts
    useAgentSimulation.ts
    useMetricSimulation.ts
  styles/
    global.css
    tokens.css
    treatments.css
    app.css
  App.tsx
  main.tsx
```

~45 files. Each maps directly to a Decantr pattern, page, or shell.
