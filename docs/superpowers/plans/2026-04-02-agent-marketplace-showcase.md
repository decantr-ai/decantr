# Agent Marketplace Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 16-page agent orchestrator showcase app with React + Vite, full interactive canvas, live-animated visualizations, and simulated auth flow.

**Architecture:** Shell-based layout with React Router nested routes. Three shells (sidebar-main, centered, top-nav-footer) mirror Decantr sections. Typed mock data modules with simulation hooks. All CSS via @decantr/css atoms + treatments + decorators.

**Tech Stack:** React 19, Vite 8, react-router-dom, lucide-react, @decantr/css

**Spec:** `docs/superpowers/specs/2026-04-02-agent-marketplace-showcase-design.md`

**Context files (read before implementing each section):**
- `.decantr/context/scaffold.md` — full topology
- `.decantr/context/section-agent-orchestrator.md`
- `.decantr/context/section-auth-full.md`
- `.decantr/context/section-marketing-saas.md`
- `.decantr/context/section-ai-transparency.md`
- `DECANTR.md` — guard rules, CSS atoms, treatments, decorators

---

## Phase 1: Foundation

### Task 1: Install dependencies and configure project

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `index.html`

- [ ] **Step 1: Install dependencies**

```bash
cd apps/showcase/agent-marketplace
pnpm add react-router-dom lucide-react @decantr/css
```

- [ ] **Step 2: Update index.html**

Add `class="dark"` and `data-theme="carbon-neon"` to `<html>`. Update title to "Agent Marketplace".

```html
<html lang="en" class="dark" data-theme="carbon-neon">
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml index.html
git commit -m "feat: install deps and configure theme"
```

### Task 2: Generate decorator CSS

**Files:**
- Modify: `src/styles/treatments.css` (fill `@layer decorators` block)

- [ ] **Step 1: Write decorator CSS**

Fill the empty `@layer decorators` block with CSS for all 10 carbon-neon decorators based on the structured definitions in the section context files. Each decorator references design tokens from tokens.css.

Decorators to implement:
- `.carbon-card` — `background: var(--d-surface); border: 1px solid var(--d-border); border-radius: 8px; transition: box-shadow 0.15s ease;` + hover shadow
- `.carbon-code` — monospace font, surface-raised bg, 3px left border in primary
- `.carbon-glass` — `backdrop-filter: blur(12px); background: rgba(31,31,35,0.6); border: 1px solid var(--d-border);`
- `.carbon-input` — soft border, focus ring primary
- `.carbon-canvas` — `background: var(--d-bg);`
- `.carbon-divider` — `border-bottom: 1px solid var(--d-border);`
- `.carbon-skeleton` — pulse animation placeholder
- `.carbon-bubble-ai` — left-aligned message bubble, surface bg
- `.carbon-bubble-user` — right-aligned, primary-tinted bg
- `.carbon-fade-slide` — `animation: carbon-fade-slide 200ms ease-out`

- [ ] **Step 2: Commit**

```bash
git add src/styles/treatments.css
git commit -m "feat: generate carbon-neon decorator CSS"
```

### Task 3: Create app.css with canvas, timeline, and component styles

**Files:**
- Create: `src/styles/app.css`

- [ ] **Step 1: Write app-layer CSS**

Create `src/styles/app.css` wrapped in `@layer app`. Include:
- Canvas: dot-grid background pattern, `.canvas-connection` animated stroke-dashoffset, `.canvas-node` positioning
- Timeline: `.timeline-line` (2px vertical line), `.timeline-orb` (12px circle positioning), event type color classes
- Neural feedback loop: `@keyframes breathing`, `@keyframes particle-flow`, `@keyframes ring-fill`
- Intent radar: concentric gridlines, vector line styles, sweep animation
- Sidebar: width transitions, collapsed state
- Command palette: overlay, backdrop
- Marketing: section overline label center-aligned variant
- Counter animation: `@keyframes counter-roll`

- [ ] **Step 2: Commit**

```bash
git add src/styles/app.css
git commit -m "feat: add app-layer CSS for canvas, timeline, visualizations"
```

### Task 4: Create data types and mock data

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/agents.ts`
- Create: `src/data/events.ts`
- Create: `src/data/metrics.ts`
- Create: `src/data/marketing.ts`

- [ ] **Step 1: Write types.ts**

All TypeScript interfaces: `Agent`, `TimelineEvent`, `MetricSnapshot`, `PricingTier`, `Testimonial`, `Feature`, `HowItWorksStep`. Plus type unions for status and event types.

- [ ] **Step 2: Write agents.ts**

Export `initialAgents: Agent[]` — 10 agents with names like "sentinel-7x3k", "parser-alpha", "router-9f2b". Mix of statuses. Each has 2-3 connections referencing other agent IDs. Realistic metrics (requests: 100-5000, latency: 20-500ms, tokens: 1k-50k, uptime: 95-99.9%).

- [ ] **Step 3: Write events.ts**

Export `initialEvents: TimelineEvent[]` — 35 events spread across agents. Mix of all 6 event types. Timestamps spanning last 2 hours. Summaries like "Parsed user query into 3 sub-tasks", "API call to /v2/embeddings completed".

- [ ] **Step 4: Write metrics.ts**

Export `modelMetrics: MetricSnapshot[]` — 5 KPIs (Total Inferences, Avg Confidence, Token Throughput, Error Rate, P95 Latency). Each with value, unit, trend, and 12-point history array.

- [ ] **Step 5: Write marketing.ts**

Export: `pricingTiers` (3 tiers: Starter $29, Pro $79 recommended, Enterprise $199), `testimonials` (6 quotes from CTOs/engineers), `features` (6 items: Agent Orchestration, Real-time Monitoring, etc.), `howItWorksSteps` (4 steps: Deploy → Connect → Monitor → Scale).

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: add typed mock data for agents, events, metrics, marketing"
```

### Task 5: Create hooks

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useHotkeys.ts`
- Create: `src/hooks/useAgentSimulation.ts`
- Create: `src/hooks/useMetricSimulation.ts`

- [ ] **Step 1: Write useAuth.ts**

```typescript
// useState + localStorage('agent-marketplace-auth')
// login(email, password) -> 800ms delay -> set flag -> navigate to /agents
// logout() -> clear flag -> navigate to /login
// isAuthenticated, user: { email, name: 'Operator' }
```

- [ ] **Step 2: Write useHotkeys.ts**

```typescript
// useEffect with keydown listener
// Tracks key sequence buffer (e.g., 'g' then 'a' within 500ms)
// Accepts hotkey config from essence: { key: 'g a', route: '/agents' }
// Uses useNavigate() to route
```

- [ ] **Step 3: Write useAgentSimulation.ts**

```typescript
// Accepts initial agents + events
// Returns { agents, events } state
// setInterval(3000): randomly toggle 1-2 agent statuses, append 1 new event
// Respects prefers-reduced-motion (no animation but still updates data)
// Cleanup on unmount
```

- [ ] **Step 4: Write useMetricSimulation.ts**

```typescript
// Accepts initial metrics
// Returns { metrics } state
// setInterval(2000): drift each value ±1-5% within realistic bounds
// Respects prefers-reduced-motion
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add hooks for auth, hotkeys, agent/metric simulation"
```

---

## Phase 2: Shells & Router

### Task 6: Create UI primitives

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Breadcrumbs.tsx`
- Create: `src/components/ui/CommandPalette.tsx`

- [ ] **Step 1: Write Button.tsx**

Wrapper around `<button>` using `d-interactive` treatment. Props: `variant` ('primary' | 'ghost' | 'danger'), `children`, `disabled`, standard button props. Uses `css()` for spacing atoms, applies `data-variant` attribute.

- [ ] **Step 2: Write Badge.tsx**

Uses `d-annotation` treatment. Props: `status` ('success' | 'error' | 'warning' | 'info'), `children`. Applies `data-status` attribute.

- [ ] **Step 3: Write Input.tsx**

Uses `d-control` treatment + `carbon-input` decorator. Props: standard input props + `error?: string`. Shows error text below with `d-annotation[data-status="error"]`.

- [ ] **Step 4: Write Breadcrumbs.tsx**

Takes `items: { label: string, href?: string }[]`. Renders slash-separated links. Last item is plain text (current page). Uses `css('_flex _aic _gap2')` + `mono-data` for text.

- [ ] **Step 5: Write CommandPalette.tsx**

Modal overlay triggered by `Cmd+K`. Search input at top, filtered list of routes below. Enter navigates + closes. Escape closes. Uses `d-surface[data-elevation="overlay"]` + `carbon-glass`. Route list from essence routes.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add UI primitives (Button, Badge, Input, Breadcrumbs, CommandPalette)"
```

### Task 7: Create shell components

**Files:**
- Create: `src/components/shells/SidebarMainShell.tsx`
- Create: `src/components/shells/CenteredShell.tsx`
- Create: `src/components/shells/TopNavFooterShell.tsx`

- [ ] **Step 1: Write SidebarMainShell.tsx**

Structure:
```
<div css('_flex _hscreen')>
  <aside carbon-glass> (collapsible sidebar)
    <header> brand + collapse toggle </header>
    <nav> grouped nav items (AGENTS, TRANSPARENCY) </nav>
    <footer> user avatar + sign out </footer>
  </aside>
  <div css('_flex _col _flex1 _minh0')>
    <header> breadcrumbs + page title + command palette trigger </header>
    <main css('_flex1 _overauto _p6') class='entrance-fade'>
      <Outlet />
    </main>
  </div>
</div>
```

- Sidebar width: 240px expanded, 56px collapsed. Transition 200ms.
- Collapse state in localStorage.
- Nav items: active route highlighted with `d-interactive[data-variant="primary"]`.
- Collapsed: icons only (Bot, Store, Settings, Brain, ScrollText, Target from lucide-react).
- Section labels: `d-label` + accent left border.
- Hotkeys via `useHotkeys` hook.
- CommandPalette mounted here.

- [ ] **Step 2: Write CenteredShell.tsx**

```tsx
<div css('_flex _aic _jcc') style={{ minHeight: '100dvh' }}>
  <div css('_wfull') style={{ maxWidth: '28rem' }}>
    <Outlet />
  </div>
</div>
```

- [ ] **Step 3: Write TopNavFooterShell.tsx**

```tsx
<div css('_flex _col') style={{ minHeight: '100dvh' }}>
  <NavHeader />
  <main css('_flex1')>
    <Outlet />
  </main>
  <Footer />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shells/
git commit -m "feat: add shell components (SidebarMain, Centered, TopNavFooter)"
```

### Task 8: Set up router and app entry

**Files:**
- Modify: `src/App.tsx` — replace boilerplate with router
- Modify: `src/main.tsx` — add CSS imports
- Delete: `src/App.css` — no longer needed
- Delete: `src/index.css` — no longer needed

- [ ] **Step 1: Rewrite main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { css } from '@decantr/css'
import './styles/global.css'
import './styles/tokens.css'
import './styles/treatments.css'
import './styles/app.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 2: Rewrite App.tsx**

HashRouter with full route tree per spec. Auth-gated sidebar routes via `RequireAuth` component (inline — checks `useAuth().isAuthenticated`, redirects to `/login`).

Route structure:
- `/` → TopNavFooterShell → Home
- `/login`, `/register`, etc. → CenteredShell → auth pages
- Auth-gated group → SidebarMainShell → agent/transparency pages
- `/agents/config` BEFORE `/agents/:id` to avoid param capture

All page components initially render a simple placeholder `<div>Page: {name}</div>` so the router works immediately. Real implementations come in later phases.

- [ ] **Step 3: Delete old CSS files, commit**

```bash
rm src/App.css src/index.css
git add -A
git commit -m "feat: set up HashRouter with shell-based nested routes"
```

---

## Phase 3: Auth Pages

### Task 9: Create AuthForm pattern and all auth pages

**Files:**
- Create: `src/components/patterns/AuthForm.tsx`
- Create: `src/pages/auth/Login.tsx`
- Create: `src/pages/auth/Register.tsx`
- Create: `src/pages/auth/ForgotPassword.tsx`
- Create: `src/pages/auth/ResetPassword.tsx`
- Create: `src/pages/auth/VerifyEmail.tsx`
- Create: `src/pages/auth/MfaSetup.tsx`
- Create: `src/pages/auth/MfaVerify.tsx`
- Create: `src/pages/auth/PhoneVerify.tsx`

- [ ] **Step 1: Write AuthForm.tsx**

Reusable form component. Props: `variant` determines fields and behavior.

| Variant | Fields | CTA |
|---------|--------|-----|
| login | email, password | Sign In |
| register | name, email, password, confirm | Create Account |
| forgot-password | email | Send Reset Link |
| reset-password | password, confirm | Reset Password |
| verify-email | 6-digit code input | Verify |
| mfa-setup | instructions + QR placeholder + code | Activate |
| mfa-verify | 6-digit code | Verify |
| phone-verify | phone number + code | Verify |

Uses:
- `d-surface carbon-card` for form container
- `d-control carbon-input` for inputs
- `d-interactive[data-variant="primary"]` for submit button
- Validation shake on empty fields
- Brand logo/name at top
- Link to alternate action (e.g., "Don't have an account? Register")
- OAuth buttons for login/register (GitHub, Google — visual only)

Read `.decantr/context/section-auth-full.md` for full pattern spec.

- [ ] **Step 2: Write all 8 auth page components**

Each is minimal — just renders `<AuthForm variant="..." />` with the appropriate variant. Login/Register use `useAuth().login()` on submit.

- [ ] **Step 3: Wire auth pages into router**

Replace placeholder page components in App.tsx with actual imports.

- [ ] **Step 4: Commit**

```bash
git add src/components/patterns/AuthForm.tsx src/pages/auth/
git commit -m "feat: add auth form pattern and all 8 auth pages"
```

---

## Phase 4: Marketing Landing Page

### Task 10: Create marketing pattern components

**Files:**
- Create: `src/components/patterns/NavHeader.tsx`
- Create: `src/components/patterns/Hero.tsx`
- Create: `src/components/patterns/Features.tsx`
- Create: `src/components/patterns/HowItWorks.tsx`
- Create: `src/components/patterns/Pricing.tsx`
- Create: `src/components/patterns/Testimonials.tsx`
- Create: `src/components/patterns/CtaSection.tsx`
- Create: `src/components/patterns/Footer.tsx`

- [ ] **Step 1: Write NavHeader.tsx**

Read section-marketing-saas.md nav-header pattern spec. Sticky top bar with carbon-glass. Logo left ("Agent Marketplace" in mono-data), links center (Features, Pricing, Testimonials — anchor scroll), CTAs right (Sign In ghost, Get Started primary). Mobile hamburger at <640px with slide-in panel.

- [ ] **Step 2: Write Hero.tsx**

Read section-marketing-saas.md hero pattern spec. Full-width, no d-surface card. Centered headline "Orchestrate AI Agents at Scale", subtext in muted, two CTAs (Deploy Now primary, Browse Marketplace ghost). Staggered entrance animation. Optional: ambient neon-glow gradient visual below CTAs.

- [ ] **Step 3: Write Features.tsx**

3-column grid (auto-fill minmax 280px). 6 feature cards from marketing data. Each: icon circle (48px, accent bg at 15%), heading, description. Stagger fade-up via IntersectionObserver. Section overline "CAPABILITIES" center-aligned, uppercase, accent color, d-label.

- [ ] **Step 4: Write HowItWorks.tsx**

4 horizontal steps with connecting lines. Number circles (48px, primary bg, white text). Section overline "HOW IT WORKS". Steps from marketing data. Mobile: vertical timeline style.

- [ ] **Step 5: Write Pricing.tsx**

3 tier cards from marketing data. Monthly/annual toggle with useState. Middle card elevated with neon-border-glow and "Popular" badge. Price in mono-data heading1 scale. Feature checklists. Toggle animates price counter.

- [ ] **Step 6: Write Testimonials.tsx**

Grid of 6 quote cards (2-col tablet, 3-col desktop). Open-quote icon in accent color, italic quote text, author row (avatar placeholder circle, name, role/company). Section overline "TESTIMONIALS".

- [ ] **Step 7: Write CtaSection.tsx**

Centered headline "Ready to Deploy Your Agent Fleet?", description, two CTAs. Subtle carbon-glass background or gradient. Idle CTA pulse after 3s.

- [ ] **Step 8: Write Footer.tsx**

Simple footer: brand name, year, links (Privacy, Terms, Docs). `carbon-divider` top border.

- [ ] **Step 9: Commit**

```bash
git add src/components/patterns/NavHeader.tsx src/components/patterns/Hero.tsx \
  src/components/patterns/Features.tsx src/components/patterns/HowItWorks.tsx \
  src/components/patterns/Pricing.tsx src/components/patterns/Testimonials.tsx \
  src/components/patterns/CtaSection.tsx src/components/patterns/Footer.tsx
git commit -m "feat: add marketing pattern components"
```

### Task 11: Create Home page and wire marketing section

**Files:**
- Create: `src/pages/marketing/Home.tsx`

- [ ] **Step 1: Write Home.tsx**

Assembles patterns in blueprint order: Hero → Features → HowItWorks → Pricing → Testimonials → CtaSection. Each wrapped in `d-section` with marketing spacing. Imports data from `src/data/marketing.ts`.

- [ ] **Step 2: Wire into router**

Replace Home placeholder in App.tsx.

- [ ] **Step 3: Commit**

```bash
git add src/pages/marketing/Home.tsx src/App.tsx
git commit -m "feat: add marketing home page with all sections"
```

---

## Phase 5: Agent Orchestrator — Shared Patterns

### Task 12: Create AgentTimeline pattern

**Files:**
- Create: `src/components/patterns/AgentTimeline.tsx`

- [ ] **Step 1: Write AgentTimeline.tsx**

Read section-agent-orchestrator.md agent-timeline spec thoroughly.

Props: `events: TimelineEvent[]`, `agentName?: string`, `modelId?: string`, `status?: string`.

Structure:
- TimelineSummary (sticky, d-surface): agent name, model, status badge, event counts by type, elapsed time (mono-data), token usage
- FilterBar: horizontal row of filter chips, one per event type, each with type color. Toggle filters active events.
- EventList: vertical timeline with 2px line at 16px left. Each event:
  - 12px colored orb ON the line, aligned with first text line
  - Card extending right: colored left-border (3px), type badge (d-annotation), summary, timestamp (mono-data), chevron toggle
  - Expandable detail panel
- Event type colors: action=`var(--d-accent)`, decision=`var(--d-success)`, error=`var(--d-error)`, warning=`var(--d-warning)`, tool_call=`var(--d-secondary)`, reasoning=`#F59E0B`
- Compact spacing: gap-3 between events
- Active event orbs pulse (scale animation)
- Hover: translateX(2px)

- [ ] **Step 2: Commit**

```bash
git add src/components/patterns/AgentTimeline.tsx
git commit -m "feat: add AgentTimeline pattern with filtering and expansion"
```

### Task 13: Create NeuralFeedbackLoop pattern

**Files:**
- Create: `src/components/patterns/NeuralFeedbackLoop.tsx`

- [ ] **Step 1: Write NeuralFeedbackLoop.tsx**

Read section-agent-orchestrator.md neural-feedback-loop spec.

Props: `metric: MetricSnapshot`, `processingState: 'idle' | 'active' | 'complete'`, `size?: number`.

SVG-based circular visualization:
- PulseCore: centered circle with radial gradient (accent → transparent). Scale oscillation via CSS animation, frequency mapped to state (idle=3s, active=1s, complete=stopped).
- IntensityRing: SVG circle with `stroke-dasharray` + `stroke-dashoffset` for conic fill effect. Fill level = metric value / max.
- FlowTrack: 6-8 small circles positioned along arc paths. `requestAnimationFrame` loop moves them. Speed = state-dependent.
- MetricDisplay: centered text overlay with value (mono-data, large), unit, trend arrow.
- Detail tooltip on hover: current value, range, trend interpretation.
- Respects prefers-reduced-motion: shows static gauge without animation.

- [ ] **Step 2: Commit**

```bash
git add src/components/patterns/NeuralFeedbackLoop.tsx
git commit -m "feat: add NeuralFeedbackLoop bio-mimetic visualization"
```

### Task 14: Create StatsOverview pattern

**Files:**
- Create: `src/components/patterns/StatsOverview.tsx`

- [ ] **Step 1: Write StatsOverview.tsx**

Read section-ai-transparency.md stats-overview spec.

Props: `metrics: MetricSnapshot[]`.

Responsive row of stat cards. Each card (d-surface carbon-card):
- Label (d-label, text-muted, text-sm)
- Value (heading3 scale, mono-data, fontbold) with counter roll-up animation on mount (useEffect + requestAnimationFrame, 800ms ease-out)
- Trend badge (d-annotation, data-status="success" for positive, "error" for negative) with directional arrow icon

Grid: `_grid _gc2 _md:gc3 _lg:gc5 _gap4`

- [ ] **Step 2: Commit**

```bash
git add src/components/patterns/StatsOverview.tsx
git commit -m "feat: add StatsOverview with counter roll-up animation"
```

---

## Phase 6: Agent Orchestrator — Pages

### Task 15: Create AgentSwarmCanvas pattern

**Files:**
- Create: `src/components/patterns/AgentSwarmCanvas.tsx`

- [ ] **Step 1: Write AgentSwarmCanvas.tsx**

Read section-agent-orchestrator.md agent-swarm-canvas spec thoroughly. This is the most complex component.

Props: `agents: Agent[]`, `onSelectAgent: (id: string) => void`.

State: `nodes` (id, x, y, agent), `connections` (source, target), `viewport` (x, y, zoom), `draggingNode`, `isPanning`, `showMinimap`.

Structure:
- Outer container: full-bleed, relative positioned, overflow hidden
- SVG layer (absolute, full size): connection bezier paths with animated stroke-dashoffset
- Node layer (absolute, full size, transformed by viewport): agent node cards
  - Each node: d-surface[data-interactive], positioned via transform. Contains: agent name, status-ring (data-status), model name (mono-data), task count
  - Error nodes: red border glow shadow
  - Draggable: onPointerDown sets draggingNode, onPointerMove updates position, onPointerUp clears
  - Click (no drag): navigate to `/agents/:id`
- Control bar (absolute, bottom center): zoom in/out buttons, fit-view, play/pause sim, toggle minimap, reset layout
- Status overlay (absolute, top right): agent count, running count, error count, d-annotation badges
- Minimap (absolute, bottom right, 160x120px): scaled-down replica showing node positions as dots

Interactions:
- Pan: pointerdown on background → track delta → update viewport.x/y
- Zoom: wheel event → update viewport.zoom (clamped 0.3-3x). Buttons for ±0.2.
- Fit view: calculate bounding box of all nodes, set viewport to center + scale
- Force-directed initial layout: simple spring simulation on mount (200 iterations, then freeze)
- Connection paths: cubic bezier from source center to target center, animated dash

- [ ] **Step 2: Commit**

```bash
git add src/components/patterns/AgentSwarmCanvas.tsx
git commit -m "feat: add full interactive AgentSwarmCanvas with drag/zoom/pan"
```

### Task 16: Create GenerativeCardGrid pattern

**Files:**
- Create: `src/components/patterns/GenerativeCardGrid.tsx`

- [ ] **Step 1: Write GenerativeCardGrid.tsx**

Read section-agent-orchestrator.md generative-card-grid spec.

Props: `agents: Agent[]` (repurposed as "agent templates" for marketplace).

Mock data for marketplace: 12 agent templates with names, descriptions, categories (NLP, Vision, Code, Data, Security, General).

Structure:
- Filter tabs at top: "All", plus one per category. Functional filtering via useState.
- CSS grid: `repeat(auto-fill, minmax(280px, 1fr))`, gap-4
- Each PreviewCard (d-surface carbon-card):
  - Preview area: colored gradient placeholder based on category, shimmer-to-loaded on mount
  - Generation badge (d-annotation, top-right): model name + generation time
  - Prompt/description (2-line clamp, mono-data for agent name)
  - Action bar (opacity 0, show on hover): Deploy, Favorite, Inspect, Clone, Remove buttons (lucide icons)
- Card hover: translateY(-4px) + shadow-lg
- Card entrance: staggered fade-up, 50ms per card
- Empty state on 0 filter results: centered 48px muted icon + message + "Clear filters" button

- [ ] **Step 2: Commit**

```bash
git add src/components/patterns/GenerativeCardGrid.tsx
git commit -m "feat: add GenerativeCardGrid with filtering and hover actions"
```

### Task 17: Create FormSections pattern

**Files:**
- Create: `src/components/patterns/FormSections.tsx`

- [ ] **Step 1: Write FormSections.tsx**

Read section-agent-orchestrator.md form-sections spec.

Agent configuration form with sections:
- General: agent name, description (textarea), model (select)
- Parameters: temperature (range), max tokens (number), timeout (number)
- Connections: allowed connections (multi-select/checkboxes of other agents)
- Monitoring: enable logging (switch), alert threshold (number), notification email

Single d-surface card for entire form. Labels above fields. Max-width 640px. 2-column grid at desktop (`_grid _gc1 _lg:gc2 _gap4`). Save/Cancel buttons at bottom.

- [ ] **Step 2: Commit**

```bash
git add src/components/patterns/FormSections.tsx
git commit -m "feat: add FormSections pattern for agent configuration"
```

### Task 18: Create agent orchestrator pages

**Files:**
- Create: `src/pages/agent-orchestrator/AgentOverview.tsx`
- Create: `src/pages/agent-orchestrator/AgentDetail.tsx`
- Create: `src/pages/agent-orchestrator/AgentConfig.tsx`
- Create: `src/pages/agent-orchestrator/AgentMarketplace.tsx`

- [ ] **Step 1: Write AgentOverview.tsx**

Layout: AgentSwarmCanvas (full bleed as swarm-topology) → AgentTimeline (as activity-feed below).
Uses `useAgentSimulation()` for live data. Canvas gets all agents + connections. Timeline gets latest 20 events. Click node → navigate to detail.

- [ ] **Step 2: Write AgentDetail.tsx**

Layout: AgentTimeline (as agent-history) → NeuralFeedbackLoop (as feedback-inspector).
Read agent ID from `useParams()`. Filter events for this agent. Show breadcrumb: Agents / {agent.name}.

- [ ] **Step 3: Write AgentConfig.tsx**

Layout: nav-header placeholder (breadcrumb suffices since we're in sidebar shell) → FormSections (structured).
Pre-filled with selected agent's current values (or defaults).

- [ ] **Step 4: Write AgentMarketplace.tsx**

Layout: Hero (standard, marketplace-themed headline "Browse Agent Marketplace") → GenerativeCardGrid.

- [ ] **Step 5: Wire into router, commit**

```bash
git add src/pages/agent-orchestrator/ src/App.tsx
git commit -m "feat: add agent orchestrator pages (overview, detail, config, marketplace)"
```

---

## Phase 7: AI Transparency Pages

### Task 19: Create IntentRadar pattern

**Files:**
- Create: `src/components/patterns/IntentRadar.tsx`

- [ ] **Step 1: Write IntentRadar.tsx**

Read section-ai-transparency.md intent-radar spec.

SVG radial display:
- Concentric circle gridlines (4 rings, dashed, low opacity)
- Center: glowing dot with subtle pulse
- 8-10 intent vectors radiating outward: line from center, length proportional to confidence (0-100%), color by category
- Suggestion chips at vector endpoints: clickable pills with label + confidence %
- Radar sweep line: rotating 8s linear infinite (subtle, low opacity)
- Mock data: 8 intents like "Deploy Agent" (92%), "Scale Cluster" (78%), "View Logs" (65%)

- [ ] **Step 2: Commit**

```bash
git add src/components/patterns/IntentRadar.tsx
git commit -m "feat: add IntentRadar radial confidence visualization"
```

### Task 20: Create AI transparency pages

**Files:**
- Create: `src/pages/transparency/ModelOverview.tsx`
- Create: `src/pages/transparency/InferenceLog.tsx`
- Create: `src/pages/transparency/ConfidenceExplorer.tsx`

- [ ] **Step 1: Write ModelOverview.tsx**

Layout: StatsOverview (as model-kpis) → NeuralFeedbackLoop (as feedback-summary).
Uses `useMetricSimulation()` for live-updating KPIs. NeuralFeedbackLoop shows confidence metric.

- [ ] **Step 2: Write InferenceLog.tsx**

Layout: AgentTimeline (as inference-trace).
Shows all events as inference trace entries. Filter to show tool_call, reasoning, decision types by default.

- [ ] **Step 3: Write ConfidenceExplorer.tsx**

Layout: IntentRadar (as confidence-distribution) → StatsOverview (as metric-breakdown).
IntentRadar shows confidence distribution. StatsOverview shows breakdown metrics.

- [ ] **Step 4: Wire into router, commit**

```bash
git add src/pages/transparency/ src/App.tsx
git commit -m "feat: add AI transparency pages (model overview, inference, confidence)"
```

---

## Phase 8: Polish & Verify

### Task 21: Final integration and cleanup

**Files:**
- Modify: `src/App.tsx` — ensure all imports are correct
- Delete: `src/assets/react.svg`, `src/assets/vite.svg` — leftover boilerplate

- [ ] **Step 1: Clean up unused assets**

Remove Vite/React boilerplate assets. Keep hero.png if used.

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Fix any TypeScript errors.

- [ ] **Step 3: Verify dev server**

```bash
pnpm dev
```

Navigate through all routes manually:
- `/` — marketing home with all sections
- `/login` → sign in → redirect to `/agents`
- `/agents` — canvas with live agents
- `/agents/:id` — timeline + neural loop for specific agent
- `/agents/config` — configuration form
- `/marketplace` — hero + card grid
- `/transparency` — stats + neural loop
- `/transparency/inference` — timeline
- `/transparency/confidence` — radar + stats
- Sign out → redirect to `/login`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete agent-marketplace showcase app"
```
