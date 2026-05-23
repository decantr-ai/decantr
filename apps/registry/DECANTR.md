## Project Brief

- **Blueprint:** registry-platform
- **Theme:** luminarum (dark mode, pill shape)
- **Workflow:** greenfield-scaffold
- **Adoption mode:** decantr-css
- **Personality:** Vibrant official vocabulary browser for AI Frontend Governance. Warm coral and amber accents on a rich dark canvas (or crisp warm-white in light mode). Content cards are the hero - outlined with colored type borders, hovering with purpose. Search is instant and faceted. Publishing feels like maintaining a trusted contract corpus. The Decantr dogfood app demonstrates how certified vocabulary feeds project-owned Contracts without overriding local law. Think Figma Community meets shadcn/ui registry, but framed as governance vocabulary rather than a marketplace.
- **Sections:** 4 (registry-browser [public], user-dashboard [primary], admin-moderation [auxiliary], auth-flow [gateway])
- **Features:** search, pagination, auth, api-keys, admin
- **Guard mode:** strict

### Decorator Quick Reference
Apply these classes — they carry the theme's visual identity. Without them the scaffold reads as "themed colors only."

| Class | Intent | Apply to | Key CSS |
|-------|--------|----------|---------|
| `.lum-orbs` | Use behind hero and feature sections to create living, breathing visual energy. Position as background decoration behind content. | Hero section backgrounds, Feature section accents, Landing page backdrops | inset: 0; position: absolute; animation: breathe 8s ease-in-out infinite; background: radial-gradient(ellipse at 30% 40%, rgba(254, 68, 116, var(--lum-orb-opacity, 0.15)), transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(10, 243, 235, var(--lum-orb-opacity, 0.15)), transparent 60%); pointer-events: none |
| `.lum-brand` | Use for the brand name in navigation and headers. Colored punctuation creates a distinctive, memorable brand mark. | Brand logos, Navigation brand text, Footer brand marks | color: var(--d-text, rgba(255, 255, 255, 0.9)); font-weight: 700 |
| `.lum-glass` | Use for navigation and panel surfaces that need subtle elevation without competing with the vibrant card accents. | Navigation bars, Sidebar panels, Section containers | border: 1px solid var(--d-glass-border, rgba(255, 255, 255, 0.08)); background: var(--d-glass-bg, rgba(255, 255, 255, 0.03)); border-radius: var(--d-radius, 12px) |
| `.lum-canvas` | Use as the foundational page background to create the geometric canvas. The particle network adds depth and tech-forward energy. | Page root containers, App shell backgrounds | color: var(--d-text, rgba(255, 255, 255, 0.85)); position: relative; min-height: 100vh; background-color: var(--d-bg, #141414) |
| `.lum-divider` | Use between major page sections to create visual breathing room. The colored dot transitions the eye to the next section's accent. | Section dividers, Content breaks, Page section transitions | margin: 80px 0; position: relative; border-top: 1px solid var(--d-border, rgba(255, 255, 255, 0.1)) |
| `.lum-fade-up` | Use as the entrance animation for sections appearing on scroll. The larger translate creates a more dramatic reveal. | Section reveals, Card entrance animations, Scroll-triggered content | opacity: 0; animation: lum-fade-up 0.6s ease-out both; transform: translateY(24px) |
| `.lum-particles` | Use as a viewport-level decorative layer to add ambient visual interest. Fixed positioning keeps particles stable during scroll. | Viewport background layer, Ambient decoration | inset: 0; opacity: 0.15; z-index: 0; position: fixed; pointer-events: none |
| `.lum-stat-glow` | Use for numbered badges and step indicators. The filled circle with contrasting text creates a bold, readable counter. | Step numbers, Stat badges, Counter indicators, Ranking badges | color: var(--d-bg, #141414); width: 40px; height: 40px; display: flex; background: var(--lum-card-color, #FDA303); align-items: center; font-weight: 700; border-radius: 50%; justify-content: center |
| `.lum-code-block` | Use for code examples and syntax-highlighted blocks. The colored top border ties the code block to its section's accent color. | Code blocks, API examples, Configuration snippets | padding: 20px; background: var(--d-surface, #111113); border-top: 2px solid var(--lum-card-color, #0AF3EB); font-family: ui-monospace, monospace; border-radius: 12px |
| `.lum-card-vibrant` | Use for high-impact feature cards that need maximum visual energy. Each card uses a different brand color gradient. | Feature highlight cards, Product cards, Pricing tiers, Call-to-action cards | color: #FFFFFF; background: linear-gradient(135deg, var(--lum-card-color, #FE4474), var(--lum-card-color-alt, #FDA303)); transition: transform 300ms ease, box-shadow 300ms ease; border-radius: 16px |
| `.lum-card-outlined` | Use for content cards in grids where each card should have a distinct accent color stroke. Ideal for process steps and feature lists. | Process step cards, Feature list items, Pipeline stages, Info cards | color: var(--d-text-muted, rgba(255, 255, 255, 0.75)); border: var(--lum-stroke-width, 3px) solid var(--lum-card-color, #FE4474); background: transparent; transition: transform 300ms ease, box-shadow 300ms ease; border-radius: 16px |

## Development Workflow

The essence file (`decantr.essence.json`) is the source of truth for your project's structure. Context files in `.decantr/context/` are derived from it. When you need to add, remove, or modify pages, sections, or features:

**1. Update the essence** (use CLI commands for consistency):
- `decantr add page {section}/{page} --route /{path}`
- `decantr add section {archetype}`
- `decantr add feature {name}` (or `--section {id}` for scoped)
- `decantr remove page {section}/{page}`
- `decantr remove section {id}`
- `decantr remove feature {name}`
- `decantr theme switch {name}`

**2. Regenerate context:** `decantr refresh`

**3. Read the updated context files**, then build.

**Rules:**
- Never create page components for routes that don't exist in the essence
- Never delete pages without removing them from the essence
- Always refresh after mutations — stale context files lead to drift
- If you edit the essence directly, run `decantr refresh` before building

---
# DECANTR.md

This project uses **Decantr** for AI Frontend Governance. Read this file before generating any UI code.

---

## What is Decantr?

Decantr is an AI Frontend Governance layer for codebases touched by AI agents. It provides structured contracts, guard rules, scoped context, and evidence so generated or edited UI stays coherent with the product's standards.

**Decantr does NOT generate code.** You generate the code. Decantr ensures it remains coherent and consistent.

---

## Two-Layer Model

### DNA (Design Axioms)

DNA defines the foundational design rules. **DNA violations are errors** -- they must never happen without updating the essence first.

DNA axioms include: Theme (id, mode, shape), Spacing (density, content gap), Typography (scale, weights), Color (palette, accent count), Radius (philosophy, base), Elevation (system, levels), Motion (preference, reduce-motion), Accessibility (WCAG level, focus-visible), and Personality traits.

### Blueprint (Structural Layout)

Blueprint defines sections, pages, routes, features, and pattern layouts. **Blueprint deviations are warnings** -- they should be corrected but do not block generation.

Blueprint includes: Sections (grouped by archetype with role, shell, and scoped features), Page definitions with layouts and pattern references, Routes (URL mapping), and Features (resolved from archetype union + blueprint overrides).

---

## Guard Rules

| # | Rule | Layer | What It Checks |
|---|------|-------|----------------|
| 1 | Style | DNA (error) | Code uses the theme specified in DNA |
| 2 | Density | DNA (error) | Spacing follows the density profile |
| 3 | Accessibility | DNA (error) | Code meets the WCAG level |
| 4 | Theme-mode | DNA (error) | Theme/mode combination is valid |
| 5 | Structure | Blueprint (warn) | Pages exist in the blueprint sections |
| 6 | Layout | Blueprint (warn) | Pattern order matches the layout spec |
| 7 | Pattern existence | Blueprint (warn) | Patterns referenced exist in the registry |

### Enforcement Tiers

| Tier | When Used | DNA Rules | Blueprint Rules |
|------|-----------|-----------|-----------------|
| **Creative** | New project scaffolding | Off | Off |
| **Guided** | Adding pages or features | Error | Off |
| **Strict** | Modifying existing code | Error | Warn |

This project uses **strict** mode.

### Violation Response Protocol

When a user request would violate guard rules:

```
1. STOP   -- Do not proceed with code that violates DNA rules
2. EXPLAIN -- Tell the user which rule would be violated and why
3. OFFER  -- Suggest using decantr_update_essence to update the spec
4. WAIT   -- Only proceed after the essence is updated
```

**Never make "just this once" exceptions.** If the user insists, update the essence first.

### MCP Tools for Drift Management

- `decantr_check_drift` -- Check if planned changes violate rules
- `decantr_accept_drift` -- Accept a detected drift as intentional
- `decantr_update_essence` -- Update the essence spec to match desired changes
- `decantr_audit_project` -- Audit the current project against the essence contract and compiled packs
- `decantr_get_scaffold_context` -- Read the top-level scaffold task, scaffold overview, compiled scaffold pack, and review pack together
- `decantr_get_page_context` -- Read a route-local page pack together with its parent section context when available
- `decantr_get_execution_pack` -- Read compiled scaffold, review, mutation, section, and page packs
- `decantr_get_section_context` -- Read the richer section context with compiled pack data when available

---

## How To Use This Project

### Source of truth

`decantr.essence.json` is the structural spec. Tools and guards read this.

### Initial scaffolding

This project is using Decantr in **greenfield scaffold** mode.

This project is using Decantr in **greenfield scaffold** mode with **decantr-css** adoption.

Treat the compiled execution-pack files as the primary source of truth.
Use narrative docs only as secondary explanation when the compiled packs are not enough.
Use only files present in this workspace as the source of truth. If local scaffold files disagree, stop and report the mismatch instead of relying on external Decantr assumptions or prior examples.

Read `.decantr/context/scaffold-pack.md` first for the compact compiled shell, theme, feature, and route contract.
Then read `.decantr/context/scaffold.md` for the fuller app overview, topology, route map, and voice guidance.
Start implementation from the shell layouts and shared route structure before filling in section pages.

### Working on a section

Read `.decantr/context/section-{name}-pack.md` for the compact compiled section contract.
Then read `.decantr/context/section-{name}.md` for the fuller context. Prefer the compiled section pack if the two sources differ, and do not invent section features, shells, or themes that are not present in the compiled contract.

### Working on a route

Read `.decantr/context/page-{name}-pack.md` for the most local compiled route contract before editing a specific page. Route-local packs should win over broader narrative docs when there is any mismatch.

### Editing rules

- Use the real `@decantr/css` runtime for atoms. If `package.json` does not already include `@decantr/css`, add it before implementation.
- If a local `package.json` is present, trust its declared Decantr dependencies over external assumptions about package availability.
- Do **not** create local atom-runtime substitutes such as `src/lib/css.js`, `src/lib/css.ts`, or hand-written `src/styles/atoms.css` files unless the task explicitly asks for a fallback runtime.
- Import `src/styles/global.css`, `src/styles/tokens.css`, and `src/styles/treatments.css`.
- Reuse the existing Decantr tokens, treatments, and decorators instead of inventing a new visual system.
- Do **not** use inline visual style values or component-scoped `<style>` tags as the primary styling path. Colors, spacing, borders, shadows, gradients, and transitions should come from atoms, treatments, decorators, or CSS variables. Inline styles are only acceptable for truly dynamic geometry that cannot be expressed through the contract.
- Shells own spacing, centering, and scroll containers. Page components should not duplicate shell responsibilities with extra full-height wrappers, max-width wrappers, or page-local padding unless the route contract explicitly requires it.
- If a required decorator class is referenced in the contract but missing from generated CSS, report the contract gap instead of inventing a parallel visual system.
- If `dna.accessibility.skip_nav = true`, add a visible-on-focus skip link and a matching main landmark target such as `<main id="main-content">`.
- If `dna.motion.reduce_motion = true`, add an explicit `prefers-reduced-motion: reduce` path in project CSS.
- Do not modify generated context files unless you are explicitly regenerating or refreshing Decantr context.
- If a required context file is missing or inconsistent, stop and report which file is missing before continuing.

### Validation

Run `decantr check` to detect drift violations while editing and `decantr audit` to audit the whole project contract after implementation.
Run `decantr health` for the broader Project Health view before handoff, pull requests, or CI. Use `decantr health init-ci` to install the default GitHub Actions health gate, `decantr health --prompt <finding-id>` to generate a scoped remediation prompt for a specific issue, and `decantr studio` to inspect local drift, routes, findings, remediation, CI, and pack state in a localhost dashboard.
Declared command palettes and hotkeys must be implemented, not merely acknowledged.

### Quick Commands

```bash
decantr status          # Project status overview
decantr health          # Local contract health report
decantr health init-ci  # Install GitHub Actions health gate
decantr studio          # Local health dashboard
decantr check           # Detect drift violations
decantr get pattern X   # Fetch a pattern spec from registry
decantr get theme X     # Fetch theme details and decorators
decantr search <query>  # Search the registry
```

---

## CSS Implementation

This project uses **@decantr/css** for layout atoms, **visual treatments** for semantic styling, and **theme decorators** for theme-specific decoration.

### Three File Setup

```
src/styles/
  tokens.css       # Design tokens: --d-primary, --d-surface, --d-bg, etc.
  treatments.css   # Visual treatments (d-interactive, d-surface, ...) + theme decorators
  global.css       # Resets, base typography, sr-only
```

```javascript
import { css } from '@decantr/css';         // Atoms runtime
import './styles/tokens.css';                // Theme tokens
import './styles/treatments.css';            // Treatments + theme decorators
import './styles/global.css';                // Resets
```

### Atoms in 5 minutes — DO NOT inline-style layout, spacing, or typography

`@decantr/css` is your default tool for layout, spacing, sizing, flex/grid, position, typography. Anywhere you'd reach for `style={{ ... }}` to set those properties, use `css('...')` instead.

| ❌ Inline (DO NOT) | ✅ Atom (DO) |
|--------------------|------------|
| `style={{ display: 'flex', gap: '1rem' }}` | `className={css('_flex _gap4')}` |
| `style={{ flexDirection: 'column', alignItems: 'center' }}` | `className={css('_col _aic')}` |
| `style={{ padding: '1rem 1.5rem' }}` | `className={css('_py4 _px6')}` |
| `style={{ width: '100%', maxWidth: '40rem' }}` | `className={css('_wfull _maxw[40rem]')}` |
| `style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}` | `className={css('_grid _gc3')}` |
| `style={{ position: 'sticky', top: 0 }}` | `className={css('_sticky _top0')}` |
| `style={{ marginInline: 'auto' }}` | `className={css('_mxauto')}` |
| `style={{ fontSize: '1.5rem' }}` | `className={css('_text2xl')}` |

> **Naming convention:** atoms use compact prefix-spelling (`_aic`, `_jcsb`, `_wfull`, `_top0`) — not Tailwind-style hyphenation. The runtime accepts both (`_aic` and `_items-center` both resolve to `align-items:center`) but compact prefix is canonical and shorter.

**Inline `style={{ ... }}` is ONLY acceptable for these cases:**
1. **CSS custom property writes** — `style={{ '--d-stagger-index': i }}` (the contract REQUIRES inline writes for dynamic CSS-var values that loop variables / animation indices feed into).
2. **Truly dynamic geometry** — computed positions for draggable nodes, real-time pan/zoom `transform` values, dynamic gradient hue interpolation, layout coordinates calculated from data.

If you're writing >5 inline styles in a component for layout/spacing/sizing, **stop** and migrate them to atoms. Inline styles for static visual values (colors, gradients, shadows, radii, font-size, padding, margin, gap, flex/grid layout) are a contract violation — `decantr audit` will surface them.

### Runtime Rules

- Use the real `@decantr/css` runtime for atoms. If `package.json` does not already depend on `@decantr/css`, add it before building.
- If `package.json`, app entry files, or router/runtime files are absent, create them explicitly for the declared target instead of assuming a hidden starter already exists.
- Do **not** create local atom-runtime substitutes such as `src/lib/css.js`, `src/lib/css.ts`, or hand-written `src/styles/atoms.css` files unless the task explicitly asks for a fallback runtime.
- Keep atoms in `css(...)`, treatments as semantic classes, and theme decorators as additive classes. Do not blur those roles together.
- Do **not** use inline visual style values or component-scoped `<style>` tags as the primary styling path. Colors, spacing, borders, shadows, gradients, and transitions should come from atoms, treatments, decorators, or CSS variables. Inline styles are only acceptable for truly dynamic geometry that cannot be expressed through the contract.
- Use `d-control` as the default semantic treatment for inputs, selects, and textareas. Theme decorators such as `carbon-input` are additive and should only layer on when the section or theme contract explicitly calls for them.
- Use loading decorators such as `carbon-skeleton` as optional enhancement on top of a structurally correct loading state — they do not replace the need for a real loading/skeleton branch.
- Shells own spacing, centering, and scroll containers. Pages should not duplicate shell responsibilities with extra full-height wrappers, max-width wrappers, or page-local padding unless the route contract explicitly requires it.
- If a required decorator class is referenced in the generated contract but missing from generated CSS, report that contract gap instead of inventing a parallel visual system.

### Visual Treatments

Decantr ships semantic treatment classes that cover the recurring UI idioms. Combine with atoms for layout — don't hand-roll equivalent CSS classes.

**Core treatments (every app uses these):**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Interactive Surface** | `d-interactive` | `data-variant="primary\|ghost\|danger"`, `data-size="sm\|md\|lg"`, hover/focus-visible/disabled states |
| **Container Surface** | `d-surface` | `data-variant="raised\|overlay"`, optional `data-interactive` for hover |
| **Data Display** | `d-data`, `d-data-header`, `d-data-row`, `d-data-cell` | Row hover highlight |
| **Form Control** | `d-control` | Focus ring, placeholder, disabled, error via `aria-invalid` |
| **Section Rhythm** | `d-section` | Auto-spacing between adjacent sections, density-aware |
| **Inline Annotation** | `d-annotation` | `data-status="success\|error\|warning\|info"` |
| **Section Label** | `d-label` | `data-anchor` for accent-border section headers |

**Common UI idioms (use these before hand-rolling):**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Text Link** | `d-link` | `data-variant="subtle\|strong"`, active state via `aria-current="page"` or `data-active="true"` |
| **Icon Button** | `d-icon-btn` | `data-size="sm\|lg"`, `data-variant="primary"`, hover/focus-visible/disabled |
| **Nav Link** | `d-nav-link` | Active state via `aria-current="page"` or `data-active="true"` (accent left-border pill) |
| **Stepper Chip** | `d-step-chip` | `data-step-state="pending\|active\|done"` |
| **Divider utilities** | `d-divider-top`, `d-divider-bottom`, `d-divider-left`, `d-divider-right`, `d-divider` | Single-side border rule, or standalone `<hr className="d-divider">` |

**Spatial / graph patterns (for canvases with positioned nodes):**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Agent Node** | `d-agent-node` | Card sized for graph canvases (200-260px wide). `data-status="active\|error"` for highlights (error adds red border-glow shadow, active adds accent border). Pair with absolute positioning on the canvas parent. |
| **Connection Port** | `d-port` | `data-side="left\|right\|top\|bottom"` positions the 8px dot on the node edge. `data-active="true"` colors it with accent. Use as a slot inside `d-agent-node` so SVG connection paths can anchor to predictable element coordinates via `getBoundingClientRect`. |

**Composite card (structural companion to theme card decorators):**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Card** | `d-card` | `data-padding="compact\|spacious\|none"`, `data-interactive` for hover elevation + border accent |
| **Card header** | `d-card-header` | Flex row, bottom-bordered; pair with `d-title` + `d-icon-btn` slots |
| **Card body** | `d-card-body` | Content region, flex col, `flex: 1 1 auto` |
| **Card footer** | `d-card-footer` | Right-aligned action row, top-bordered |

Pair `d-card` with a theme card decorator (e.g., `carbon-card`) for hover glow / gradient border. The composite handles layout; the decorator handles aesthetic polish.

**Data-viz primitives (do NOT hand-roll inline SVGs for these):**

| Treatment | Class | Purpose / Variants |
|-----------|-------|---------------------|
| **Timeline rail** | `d-timeline-rail` + `d-timeline-dot` | Vertical timeline. Dot has `data-state="active\|done\|error\|warning"` controlling color. |
| **Sparkline** | `d-sparkline` + `d-sparkline-path` + `d-sparkline-area` | Inline trend SVG. `data-trend="up\|down"` colors stroke + area accent. |
| **Intent radar** | `d-intent-radar` + `d-intent-radar-ring[data-level]` + `d-intent-radar-axis` | Concentric ring backdrop (5 levels) for confidence/score wheels. `--d-radar-axis-angle` for rotated axes. |
| **Waveform** | `d-waveform` + `d-waveform-path` | Audio/signal waveform path container. `data-state="active"` switches to success color. |
| **QR placeholder** | `d-qr-placeholder` | Pure-CSS QR-code placeholder (repeating gradients). `--d-qr-size` for size override. |
| **Conic ring** | `d-conic-ring` | Gauge/confidence ring. Set `--d-conic-value` (0..1) to fill arc. `data-state="success\|warning\|error"` switches color. `--d-conic-thickness` for ring width. |
| **Heatmap cell** | `d-heatmap-cell` | Single heatmap cell. `--d-heatmap-intensity` 0..1 blends primary→surface. `data-status="error\|success"` switches base color. |

**Banners / prominent CTAs:**

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **CTA Banner** | `d-cta-banner` | `data-size="compact\|hero"` (default is between). Gradient wash from primary to accent. Theme can override via `--d-cta-gradient` / `--d-cta-text` CSS vars. |
| **Dark-Pill Button** | `d-interactive` + `data-variant="dark"` | Pill-shaped dark-on-accent CTA for use inside `d-cta-banner`. Theme can override via `--d-cta-pill-bg` / `--d-cta-pill-text`. |

**Shell layouts (do NOT hand-roll these):**

| Treatment | Class | Purpose / States |
|-----------|-------|------------------|
| **Shell root** | `d-shell` | Full-viewport root container. `data-layout="sidebar-main\|centered\|top-nav-footer\|sidebar-aside"` switches the layout model (default equivalent to top-nav-footer: vertical flex with sticky header). |
| **Sidebar** | `d-shell-sidebar` | Left 240px nav column. `data-collapsed="true"` switches to a 64px rail. Below `_mdmax:` auto-becomes an off-canvas drawer — toggle via `data-mobile-open="true"`. |
| **Main** | `d-shell-main` | Remaining-width column to the right of the sidebar (or the full content area in top-nav shells). Handles scroll internally. |
| **Aside** | `d-shell-aside` | Right 320px auxiliary panel for inspector / timeline / minimap in `sidebar-aside` layouts. Below `_mdmax:` hides by default; toggle with `data-mobile-open="true"`. |
| **Header** | `d-shell-header` | 52px sticky top bar with horizontal flex layout. Use inside `d-shell-main` (sidebar-main shells) or at the top of `d-shell` (top-nav shells). |
| **Body** | `d-shell-body` | Scrollable main region. **Flex column with section-level gap (`var(--d-section-gap, 2rem)`) between direct children** — every block-level child (eyebrow, card grid, chart row, table) gets uniform spacing automatically, no matter how it's wrapped internally. `data-padding="compact\|spacious\|none"` adjusts the outer 1rem padding. `data-flow="tight"` reduces the gap to 0.75rem; `data-flow="none"` reverts to plain block flow. |
| **Footer** | `d-shell-footer` | Narrow band below the body with top border. |
| **Centered card** | `d-shell-centered-card` | The content parent inside `d-shell[data-layout="centered"]`. Caps width at 28rem. |
| **Mobile menu trigger** | `d-shell-mobile-trigger` | Hamburger button hidden above `_md:`, visible below. Toggles `data-mobile-open` on the sibling `d-shell-sidebar`. REQUIRED inside `d-shell-header` for any `sidebar-main` or `sidebar-aside` shell — without it, mobile users can't re-open the collapsed nav. |
| **Mobile backdrop** | `d-shell-mobile-backdrop` | Dim scrim shown behind the open sidebar drawer below `_md:`. Apply `data-visible="true"` when sidebar is open; click to close. Hidden above `_md:`. |

**Shell layout recipes:**
- **Auth / confirmation:** `d-shell[data-layout="centered"] + d-shell-centered-card`.
- **Dashboard with sidebar:** `d-shell[data-layout="sidebar-main"] + d-shell-sidebar + d-shell-main (> d-shell-header + d-shell-body)`.
- **Dashboard with inspector / timeline / minimap:** `d-shell[data-layout="sidebar-aside"] + d-shell-sidebar + d-shell-main + d-shell-aside` (3-column grid; aside collapses off-canvas below md).
- **Marketing / public pages:** `d-shell[data-layout="top-nav-footer"]` (or bare `d-shell`) with `d-shell-header` at the top and `d-shell-body` + `d-shell-footer`.

Do NOT hand-roll `.shell-sidebar`, `.shell-centered`, `.shell-tnf`, `.shell-aside`, `.sidebar-main-layout`, or similar class names. They exist as treatments.

**Mobile sidebar wiring (REQUIRED for sidebar-main / sidebar-aside shells):**

The sidebar collapses to off-canvas below `_mdmax:`. Without an explicit toggle, mobile users get stuck — collapsed sidebar, no way to re-open it. Wire it up like this:

```tsx
function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="d-shell" data-layout="sidebar-main">
      <aside
        className="d-shell-sidebar"
        data-mobile-open={navOpen ? 'true' : undefined}
      >
        {/* nav items */}
      </aside>
      <div
        className="d-shell-mobile-backdrop"
        data-visible={navOpen ? 'true' : undefined}
        onClick={() => setNavOpen(false)}
      />
      <main className="d-shell-main">
        <header className="d-shell-header">
          <button
            className="d-shell-mobile-trigger"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <Menu size={18} aria-hidden />
          </button>
          {/* rest of header */}
        </header>
        <div className="d-shell-body">{/* page content */}</div>
      </main>
    </div>
  );
}
```

The trigger auto-hides above `_md:` (where the sidebar is always visible inline) and the backdrop only shows when `data-visible="true"` AND viewport is below `_md:`. Close-on-route-change is recommended for SPA blueprints — wire `useEffect` on `location.pathname` to reset `navOpen` to false.

### Theme toggle

If the blueprint declares the `theme-toggle` feature, `tokens.css` includes a `[data-mode="<opposite>"]` selector block. Flip the visible mode by setting `data-mode` on `<html>` (or any ancestor):

```tsx
// Toggle between the blueprint's primary mode and its opposite.
function ThemeToggle() {
  const toggle = () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-mode');
    html.setAttribute('data-mode', current === 'dark' ? 'light' : 'dark');
  };
  return <button className="d-icon-btn" onClick={toggle}><SunMoon /></button>;
}
```

Do NOT branch component code on the current mode via JS to re-style elements — the token switch handles it CSS-side.

**Modal / palette chrome:**

| Treatment | Class | Purpose / States |
|-----------|-------|------------------|
| **Modal root** | `d-modal` | Fixed-position overlay covering the viewport. `data-align="top"` shifts content to top 15vh (common for command palettes). |
| **Modal backdrop** | `d-modal-backdrop` | Scrim with backdrop-blur. Place as a sibling inside `d-modal` with `onClick` to close. |
| **Modal panel** | `d-modal-panel` | The actual dialog content. `data-size="sm\|lg"` adjusts max-width (default 32rem). |
| **Command palette** | `d-palette` | Specialized modal-panel variant for command palettes — 40rem wide, 60vh max-height. |
| **Palette search row** | `d-palette-search` | Icon + search input row at the top of a palette. Use this wrapper so focus styling belongs to the palette, not the raw input. |
| **Palette input** | `d-palette-input` | Search input at top of palette. |
| **Palette list** | `d-palette-list` | Scrollable command list. |
| **Palette row** | `d-palette-row` | Individual command row. `data-active="true"` for keyboard-highlighted row. |
| **Palette section** | `d-palette-section` | Uppercase section label inside palette (e.g., "Navigation"). |
| **Keyboard chip** | `d-kbd` | Mono-font key hint. Use inside `<kbd>` for accessibility. |
| **Hotkey indicator** | `d-hotkey-indicator` | Corner badge shown while a chord hotkey prefix is armed. Apply `data-visible={isArmed}` and `data-prefix="g"` when the prefix is pressed; clear on timeout/resolve. Required when `hotkey_semantics.show_chord_indicator !== false`. |

Composition pattern for a command palette (REQUIRED — palette MUST be wrapped in `d-modal` + `d-modal-backdrop`, otherwise it renders as a top-level full-width strip):
```tsx
{open && (
  <div className="d-modal" data-align="top">
    <div className="d-modal-backdrop" onClick={close} />
    <div className="d-palette">
      <div className="d-palette-search">
        <Search />
        <input className="d-palette-input" placeholder="Type a command..." />
      </div>
      <ul className="d-palette-list">
        <li className="d-palette-section">Navigation</li>
        <li className="d-palette-row" data-active={i === selectedIndex}>
          <Bot /> Go to Agents
          <kbd className="d-kbd">g a</kbd>
        </li>
      </ul>
    </div>
  </div>
)}
```

**Hard rules for the palette:**
- The palette MUST be inside `d-modal` (positions/centers it as overlay) AND have a `d-modal-backdrop` sibling (provides scrim + click-to-close).
- Group commands by section using `d-palette-section` (Uppercase eyebrow label) — never render a flat list. The blueprint's `navigation.command_palette.commands` already has `section` fields; honor them.
- Each row should have an icon on the LEFT (Lucide), label in the center, and a `d-kbd` shortcut hint on the RIGHT — even when the command has no hotkey, leave the right slot empty for visual rhythm.

Composition pattern for an auth page (REQUIRED — must use `d-shell[data-layout="centered"]` + `d-shell-centered-card`, not a hand-rolled centering wrapper):
```tsx
<div className="d-shell" data-layout="centered">
  <div className="d-shell-centered-card">
    {/* Logo + form go here. Card caps at 28rem and self-centers. */}
  </div>
</div>
```

**Hard rule for centered/auth pages:**
The `d-shell-centered-card` element provides the 28rem-max-width box. Do NOT render auth forms directly as children of `d-shell` — they will span full viewport width. Always wrap the form in `d-shell-centered-card`.

**Guidance for cold scaffolds:**
- If your component is an icon-only action trigger, it's a `d-icon-btn`, not a stripped-down `d-interactive`.
- Breadcrumb / footer / inline body-copy links use `d-link`.
- Sidebar and top-nav route links use `d-nav-link`. Match active state by setting `aria-current="page"` (preferred — accessible) or `data-active="true"`.
- Checkout / onboarding stepper position indicators use `d-step-chip`.
- Horizontal rules between card sections use `d-divider-top` / `d-divider-bottom` as a container modifier, or `<hr className="d-divider">` as a standalone element.
- Do NOT create `.nav-link`, `.icon-btn`, `.sidebar-link`, `.step-chip`, `.divider-top` (or similar) as custom classes. They exist as treatments.

### Icons — use Lucide

Decantr scaffolds ship with `lucide-react` pre-installed. When personality prose says "Lucide icons" (or the section/pattern contract references icon names), import them from there:

```tsx
import { Bot, ShoppingBag, Settings, Activity, Gauge, Cpu } from 'lucide-react';

<Bot className={css('_w5 _h5')} aria-hidden="true" />
```

- Tree-shaking keeps the bundle at ~1.5-3 KB per icon used.
- Do NOT inline SVGs or import an alternative icon library without an explicit contract directive.
- When a navigation item declares an `icon` field (see section `navigation_items`), the value is the Lucide icon name in kebab-case — e.g., `"shopping-bag"` → `import { ShoppingBag } from 'lucide-react'`.
- Default sizing: `_w5 _h5` (20px) for inline icons, `_w4 _h4` (16px) inside dense chrome, `_w6 _h6` (24px) for primary slots.

### Composition

Atoms + treatment + theme decorator:

```tsx
<button className={css('_px4 _py2') + ' d-interactive'} data-variant="primary">Deploy</button>
<div className={css('_flex _col _gap4') + ' d-surface carbon-glass'}>Card</div>
<span className="d-annotation" data-status="success">Active</span>
```

- **Atoms:** `css('_flex _col _gap4')` — processed by @decantr/css runtime
- **Treatments:** `d-interactive`, `d-surface` — semantic base styles from treatments.css
- **Theme decorators:** `carbon-glass`, `carbon-code` — theme-specific decoration from treatments.css
- **Combined:** `css('_flex _col') + ' d-surface carbon-card'`

```tsx
// Responsive prefix — applies at breakpoint and above:
css('_col _sm:row')

// Pseudo prefix:
css('_bgprimary _h:bgprimary/80')
```

### Prefix and Arbitrary Value Syntax

- Responsive prefixes are part of the atom token itself: `_sm:gc2`, `_md:flex`, `_lg:row`.
- Pseudo prefixes are also token-prefixed: `_h:bgprimary/80`, `_f:borderprimary`, `_fv:shadowmd`.
- Arbitrary values use square brackets when the standard scale is not enough: `_w[512px]`, `_h[100vh]`, `_p[clamp(1rem,3vw,2rem)]`, `_z[40]`.
- When you see bracket atoms in shell or page contracts, treat them as first-class Decantr syntax, not as an error or a cue to fall back to inline styles.

### Responsive Breakpoint Atoms

Decantr ships two families of responsive prefixes. Use them directly inside `css(...)` — no `matchMedia` JS needed for simple responsive switches.

**Mobile-first (min-width):**
| Prefix | Breakpoint | Meaning |
|--------|-----------|---------|
| `_sm:` | ≥ 640px | small tablet / large phone landscape and up |
| `_md:` | ≥ 768px | tablet portrait and up |
| `_lg:` | ≥ 1024px | tablet landscape / small desktop and up |
| `_xl:` | ≥ 1280px | desktop and up |

**Desktop-first (max-width, for "hide below" / "swap at small" expressions):**
| Prefix | Breakpoint | Meaning |
|--------|-----------|---------|
| `_smmax:` | < 640px | phone only |
| `_mdmax:` | < 768px | phone + small tablet |
| `_lgmax:` | < 1024px | below tablet-landscape |
| `_xlmax:` | < 1280px | below desktop |

Pseudo-class stacking works with both (e.g., `_mdmax:h:bgmuted`, `_sm:fv:ring2`).

**Example:**
```
// 1-column on phone, 2-column from tablet, 3-column from desktop
css('_grid _gc1 _sm:gc2 _lg:gc3')

// Hide the minimap below tablet portrait
css('_block _mdmax:none')

// Show the hamburger below tablet portrait, hide it above
css('_none _mdmax:block')
```

Prefer these atoms over `window.matchMedia` in JS. Reserve JS responsive checks for cases where the component tree ITSELF must change shape (e.g., rendering a different React component), not just styling.

### Atom Reference

#### Display
| Atom | CSS |
|------|-----|
| `_flex` | `display:flex` |
| `_grid` | `display:grid` |
| `_block` | `display:block` |
| `_inline` | `display:inline` |
| `_inlineflex` | `display:inline-flex` |
| `_none` | `display:none` |
| `_contents` | `display:contents` |

#### Flexbox
| Atom | CSS |
|------|-----|
| `_col` | `flex-direction:column` |
| `_row` | `flex-direction:row` |
| `_colrev` | `flex-direction:column-reverse` |
| `_wrap` | `flex-wrap:wrap` |
| `_nowrap` | `flex-wrap:nowrap` |
| `_flex1` | `flex:1` |
| `_flex0` | `flex:none` |
| `_flexauto` | `flex:auto` |
| `_grow` | `flex-grow:1` |
| `_grow0` | `flex-grow:0` |
| `_shrink0` | `flex-shrink:0` |

#### Alignment
| Atom | CSS |
|------|-----|
| `_aic` | `align-items:center` |
| `_aifs` | `align-items:flex-start` |
| `_aife` | `align-items:flex-end` |
| `_aist` | `align-items:stretch` |
| `_aibl` | `align-items:baseline` |
| `_jcc` | `justify-content:center` |
| `_jcfs` | `justify-content:flex-start` |
| `_jcfe` | `justify-content:flex-end` |
| `_jcsb` | `justify-content:space-between` |
| `_jcsa` | `justify-content:space-around` |
| `_jcse` | `justify-content:space-evenly` |
| `_pic` | `place-items:center` |
| `_pcc` | `place-content:center` |

#### Spacing (scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, ...)
| Atom | CSS | Notes |
|------|-----|-------|
| `_gap{n}` | `gap:{scale}` | e.g. `_gap4` = `gap:1rem` |
| `_gx{n}` | `column-gap:{scale}` | horizontal gap |
| `_gy{n}` | `row-gap:{scale}` | vertical gap |
| `_p{n}` | `padding:{scale}` | all sides |
| `_pt{n}`, `_pr{n}`, `_pb{n}`, `_pl{n}` | directional padding | top/right/bottom/left |
| `_px{n}` | `padding-inline:{scale}` | horizontal |
| `_py{n}` | `padding-block:{scale}` | vertical |
| `_m{n}` | `margin:{scale}` | same as padding variants |
| `_mx{n}`, `_my{n}` | inline/block margin | horizontal/vertical |
| `_mauto` | `margin:auto` | center in flex/grid |
| `_mtauto`, `_mbauto` | `margin-top:auto` / `margin-bottom:auto` | pin to bottom/top of flex column |
| `_mlauto`, `_mrauto` | `margin-left:auto` / `margin-right:auto` | pin to right/left in a row |
| `_mxauto`, `_myauto` | inline/block margin: auto | center horizontally/vertically |

#### Sizing
| Atom | CSS |
|------|-----|
| `_wfull` / `_w100` | `width:100%` |
| `_hfull` / `_h100` | `height:100%` |
| `_wscreen` | `width:100vw` |
| `_hscreen` | `height:100vh` |
| `_wfit` | `width:fit-content` |
| `_hfit` | `height:fit-content` |
| `_wauto` | `width:auto` |
| `_minw0` | `min-width:0` |
| `_minh0` | `min-height:0` |
| `_w{n}`, `_h{n}` | width/height from spacing scale |
| `_minw{n}`, `_maxw{n}` | min/max width from scale |

#### Text Size
| Atom | Size | Line-height |
|------|------|-------------|
| `_textxs` | 0.75rem | 1rem |
| `_textsm` | 0.875rem | 1.25rem |
| `_textbase` | 1rem | 1.5rem |
| `_textlg` | 1.125rem | 1.75rem |
| `_textxl` | 1.25rem | 1.75rem |
| `_text2xl` | 1.5rem | 2rem |
| `_text3xl` | 1.875rem | 2.25rem |
| `_heading1`-`_heading6` | Heading presets (size + weight) |

#### Text Style
| Atom | CSS |
|------|-----|
| `_fontbold` | `font-weight:700` |
| `_fontsemi` | `font-weight:600` |
| `_fontmedium` | `font-weight:500` |
| `_fontlight` | `font-weight:300` |
| `_italic` | `font-style:italic` |
| `_underline` | `text-decoration:underline` |
| `_uppercase` | `text-transform:uppercase` |
| `_truncate` | overflow ellipsis + nowrap |
| `_textl`, `_textc`, `_textr` | text-align left/center/right |

#### Color (theme variable based)
| Atom | CSS |
|------|-----|
| `_bgprimary` | `background:var(--d-primary)` |
| `_bgaccent` | `background:var(--d-accent)` |
| `_bgsecondary` | `background:var(--d-secondary)` |
| `_bgsurface` | `background:var(--d-surface)` |
| `_bgsurface0`-`_bgsurface2` | surface elevation layers |
| `_bgmuted` | `background:var(--d-muted)` |
| `_bgbg` | `background:var(--d-bg)` |
| `_bgtransparent` | `background:transparent` |
| `_bgsuccess`, `_bgerror`, `_bgwarning`, `_bginfo` | status backgrounds |
| `_fgprimary` | `color:var(--d-primary)` |
| `_fgaccent` | `color:var(--d-accent)` |
| `_fgsecondary` | `color:var(--d-secondary)` |
| `_fgtext` | `color:var(--d-text)` |
| `_fgmuted` | `color:var(--d-text-muted)` |
| `_fgwhite`, `_fgblack`, `_fginherit` | absolute/inherited text colors |
| `_fgsuccess`, `_fgerror`, `_fgwarning`, `_fginfo` | status text |
| `_bcprimary` | `border-color:var(--d-primary)` |
| `_bcaccent` | `border-color:var(--d-accent)` |
| `_bcborder` | `border-color:var(--d-border)` |
| `_bcmuted` | `border-color:var(--d-muted)` |
| `_bctransparent` | `border-color:transparent` |

#### Overflow & Whitespace
| Atom | CSS |
|------|-----|
| `_overhidden` | `overflow:hidden` |
| `_overauto` | `overflow:auto` |
| `_overscroll` | `overflow:scroll` |
| `_overxauto`, `_overyauto` | axis-specific overflow |
| `_nowraptext` | `white-space:nowrap` |
| `_prewrap` | `white-space:pre-wrap` |
| `_breakword` | `overflow-wrap:break-word` |

#### Cursor & Interaction
| Atom | CSS |
|------|-----|
| `_pointer` | `cursor:pointer` |
| `_cursordefault` | `cursor:default` |
| `_notallowed` | `cursor:not-allowed` |
| `_grab` | `cursor:grab` |
| `_selectnone` | `user-select:none` |
| `_ptrnone` | `pointer-events:none` |

#### Position & Layout
| Atom | CSS |
|------|-----|
| `_rel` | `position:relative` |
| `_abs` | `position:absolute` |
| `_fixed` | `position:fixed` |
| `_sticky` | `position:sticky` |
| `_inset0` | `inset:0` |
| `_top0`, `_right0`, `_bottom0`, `_left0` | edge positioning |
| `_z10`-`_z50` | z-index scale |

#### Grid
| Atom | CSS |
|------|-----|
| `_gc1`-`_gc12` | `grid-template-columns:repeat(N,...)` |
| `_gr1`-`_gr6` | `grid-template-rows:repeat(N,...)` |
| `_span1`-`_span12`, `_spanfull` | column span |
| `_rowspan1`-`_rowspan6` | row span |

#### Visual
| Atom | CSS |
|------|-----|
| `_rounded` | `border-radius:var(--d-radius)` |
| `_roundedfull` | `border-radius:9999px` |
| `_roundedsm`, `_roundedlg`, `_roundedxl` | radius variants |
| `_shadow`, `_shadowmd`, `_shadowlg` | box-shadow presets |
| `_bordernone` | `border:none` |
| `_bw{n}` | `border-width:{n}px` |
| `_op0`-`_op100` | opacity (0, 25, 50, 75, 100) |
| `_trans` | `transition:all 0.15s ease` |
| `_visible`, `_invisible` | visibility |

Responsive prefixes: `_sm:`, `_md:`, `_lg:`, `_xl:` (e.g. `_sm:gc2`, `_md:flex`, `_lg:row`).

### Section Labels

Use the d-label class for uppercase section headings.
Anchor with a left accent border: `border-left: 2px solid var(--d-accent); padding-left: 0.5rem`.

### Empty States

Every data-driven section should handle zero-data gracefully.
Pattern: centered 48px muted icon + descriptive message + optional CTA button.

### Page Transitions

If the theme provides motion tokens, apply the `entrance-fade` class to page content containers for smooth page-to-page transitions.

### Navigation Shortcuts

If the essence defines hotkeys or command_palette, implement as keyboard event listeners (useEffect + keydown) — not as visible UI text.
Missing declared navigation features are contract drift, not optional polish.

### Design Tokens

| Token | Purpose | Use for |
|-------|---------|---------|
| `--d-primary` | Primary brand color | Buttons, links, focus rings |
| `--d-surface`, `--d-surface-raised` | Surface backgrounds | Cards, panels |
| `--d-bg` | Page background | Body, main container |
| `--d-border` | Border color | Dividers, card borders |
| `--d-text`, `--d-text-muted` | Text colors | Body text, secondary text |
| `--d-success`, `--d-error`, `--d-warning`, `--d-info` | Status colors | Alerts, badges, toasts |
| `--d-shadow`, `--d-shadow-lg` | Elevation shadows | Cards, overlays |
| `--d-radius`, `--d-radius-lg` | Border radii | Buttons, cards |
| `--d-font-mono` | Monospace font stack | Code, metrics, data |
| `--d-duration-hover` | Hover transition | Interactive elements |
| `--d-easing` | Animation easing | All transitions |
| `--d-accent-glow` | Glow color | Hover effects, focus rings |

### Routing

Check `decantr.essence.json` → `meta.platform.routing` for the routing strategy. The value is also rendered at the top of `.decantr/context/scaffold-pack.md` with a mechanical router-name hint — trust the pack.

- `"history"` (modern SPA default) → use `BrowserRouter` from `react-router-dom`. Regular URLs like `/login`, `/agents`. Works on Vite dev, Vercel, Netlify, Cloudflare Pages, and most modern hosts (SPA fallback is automatic on those platforms).
- `"hash"` → use `HashRouter` from `react-router-dom`. URLs are prefixed with `/#` (e.g., `/#/login`). Only needed when deploying to a static host without SPA fallback (e.g., vanilla GitHub Pages).
- `"pathname"` → framework-native file-based routing (Next.js App Router).

Do **not** pick a router based on personal preference. Match the declared `routing` value exactly — it's the contract.

Routes are defined in `decantr.essence.json` → `blueprint.routes` and listed in `.decantr/context/scaffold.md`.

### SEO Expectations by Platform

- For hash-routed SPA scaffolds, focus SEO work on the root document: document title, description, Open Graph/Twitter meta, and any root-level JSON-LD that the contract calls for.
- Do **not** invent SSR-only per-route metadata systems for a clearly hash-routed scaffold.
- For history-mode SPAs and SSR-style projects, per-route metadata can be richer (set `document.title` and meta tags via a route-level effect on SPA; use framework primitives on SSR), but it still needs to follow the declared route contract instead of introducing off-contract marketing pages.

### Layout Rules

1. **Never nest d-surface inside d-surface.** Inner sections use plain containers with padding atoms.
2. **Shell regions are frames, not surfaces.** Sidebar and header use var(--d-surface) or var(--d-bg) directly. Apply d-surface only to content cards within the body region.
3. **One scroll container per region.** Body has overflow-y-auto. Sidebar nav has its own overflow-y-auto. Never nest additional scrollable wrappers.
4. **d-section spacing is self-contained.** Each d-section owns its padding. The d-section + d-section rule adds a separator. Do NOT add extra margin between adjacent sections.
5. **Responsive nav rules.** Hamburger menus appear ONLY below the shell collapse breakpoint. Full nav shows above it.

### Responsive Breakpoints

The `@decantr/css` atom breakpoints are the canonical defaults. See the "Responsive Breakpoint Atoms" section below for the full table. Shell-level guidance:

- **`_smmax:` (< 640px — phone):** hamburger drawer, single-column stack, full-bleed content. Pattern-level content stacks vertically unless the pattern explicitly declares otherwise.
- **`_mdmax:` (< 768px — phone + small tablet):** most patterns should use this as the "stack to a single column / hide secondary chrome" breakpoint. This is the level where `top-nav-footer` mid-nav links should collapse to a hamburger.
- **`_lgmax:` (< 1024px — below tablet-landscape):** `sidebar-main` shells should collapse the persistent sidebar into a drawer here. Do **not** keep the sidebar open below `_lg:` — at 768-1023px it leaves the main canvas too cramped for data-dense mission-control content.
- **`_lg:` (≥ 1024px — tablet-landscape / small desktop):** full `sidebar-main` layout; responsive multi-column grids.
- **`_xl:` (≥ 1280px — desktop):** canonical layout.

Implementation: prefer the `@decantr/css` breakpoint atoms (`_sm:`, `_md:`, `_lg:`, `_xl:`, `_smmax:`, `_mdmax:`, `_lgmax:`, `_xlmax:`) or structured `responsive` fields on patterns. Use `window.matchMedia` only when the React component tree itself must change shape per viewport (e.g., rendering a different component), not just styling.

**High-density content patterns** (swarm canvases, trace-waterfall, data tables with 8+ columns) should declare explicit mobile-reflow behavior — stack vertically, collapse to a list, or define a `desktop-only` directive and render a lighter alternative pattern below `_md:`. Without this, horizontal overflow on phone viewports is the default failure mode.

### Accessibility Defaults

- If `dna.accessibility.skip_nav = true`, add a visible-on-focus skip link such as `<a href="#main-content" className="skip-link">Skip to content</a>`.
- Pair that skip link with a real main landmark target such as `<main id="main-content">`.
- Keep keyboard focus visible with `:focus-visible` treatments on custom interactive surfaces, not just browser defaults.
- Implement shell-level accessibility and routing behaviors as reusable structure or shared helpers, not one-off inline patches. Compact header sizing, responsive sidebar collapse, and skip-nav targets should be consistent across the shell, not re-solved page by page.

### Motion Treatments

**Hard rule:** Every animation MUST use one of the treatments below. Do **not** hand-roll `@keyframes` or inline `transition` rules — the treatments ship tuned durations, easings, and `prefers-reduced-motion` handling.

| Treatment | Class | Intent | When to use |
|-----------|-------|--------|-------------|
| Fade entrance | `d-enter-fade` | Soft mount | Cards, sections, modals on mount |
| Slide-up entrance | `d-enter-slide-up` | Forceful mount | Hero blocks, primary content |
| Scale entrance | `d-enter-scale` | Spring mount | Dialogs, popovers, callouts |
| Stagger children | `d-stagger-children > *` | Sequential reveal | Lists, grids — set `style={{ '--d-stagger-index': i }}` on each child |
| Status pulse | `d-pulse` | Opacity cycle | Live indicators, processing badges |
| Ring pulse | `d-pulse-ring` | Expanding halo | Notification dots, focus attractors |
| Shimmer | `d-shimmer` | Loading skeleton | Skeleton screens on surface-raised |
| Float | `d-float` | Idle vertical drift | Decorative elements, empty-state graphics |
| Glow on hover | `d-glow-hover` | Accent glow | Primary CTAs, feature cards |
| Scale on hover | `d-scale-hover` | 1.02× pop | Clickable cards, tiles |
| Lift on hover | `d-lift-hover` | Translate + elevate | Product cards (elevation jumps to 3) |
| Click ripple | `d-ripple` | Material ripple | Buttons inside disclosure surfaces |

**Motion tokens** (theme-tunable via `theme.motion.durations` / `theme.motion.easings`):

| Token | Default | Meaning |
|-------|---------|---------|
| `--d-motion-instant` | 80ms | Color swaps, focus rings |
| `--d-motion-fast` | 150ms | Hover transitions, button press |
| `--d-motion-base` | 250ms | Entrances, section reveals |
| `--d-motion-slow` | 400ms | Modals, page transitions |
| `--d-motion-slower` | 600ms | Hero reveals |
| `--d-motion-stagger` | 60ms | Per-child stagger delay |
| `--d-motion-ease` | cubic-bezier(0.4, 0, 0.2, 1) | Balanced ease in/out |
| `--d-motion-ease-out` | cubic-bezier(0, 0, 0.2, 1) | Decelerate (entrances) |
| `--d-motion-ease-in` | cubic-bezier(0.4, 0, 1, 1) | Accelerate (exits) |
| `--d-motion-ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Bounce overshoot |

**Reduced motion is handled inside the treatments themselves** — do NOT wrap each usage in a media query. Do NOT branch React/TS code on `dna.motion.reduce_motion`. The treatments' `@media (prefers-reduced-motion: reduce)` block hands control to the user's OS preference automatically.

### Typography Treatments

**Hard rule:** Every text node with a distinct visual role MUST use one of these treatments. Do **not** set `font-size` / `font-weight` / `letter-spacing` / `line-height` via inline styles or hand-rolled classes.

| Treatment | Class | Role | Default size / weight |
|-----------|-------|------|----------------------|
| Display | `d-display` | Hero headings | 3rem / 700 / tight leading / tight tracking |
| Headline | `d-headline` | Section H1/H2 | 1.875rem / 600 / snug leading |
| Title | `d-title` | Card titles, dialog headers | 1.25rem / 600 |
| Subtitle | `d-subtitle` | Under-title explainer | 1.125rem / 400 / muted |
| Prose | `d-prose` | Long-form reading copy | 1rem / 1.625 leading |
| Body | `d-body` | UI body text | 1rem / 1.5 leading |
| Caption | `d-caption` | Help text, fine print | 0.875rem / muted |
| Eyebrow | `d-eyebrow` | Category kicker above headline | 0.75rem / 600 / uppercase / wider tracking / accent |
| Numeric modifier | `d-numeric` | Adds tabular-nums to any text | Mix with other treatments |
| Monospace | `d-mono-text` | Code, IDs, timestamps, metric values | Mono font + tabular nums |

### Elevation Scale

**Hard rule:** When a surface needs a shadow, use `d-elevate[data-level="1..5"]`. Do **not** hand-roll `box-shadow` values.

| Level | Token | Typical use |
|-------|-------|-------------|
| 0 | `--d-elevation-0` (none) | Flat surfaces (default) |
| 1 | `--d-elevation-1` | Subtle — resting cards |
| 2 | `--d-elevation-2` | Raised — default cards |
| 3 | `--d-elevation-3` | Hover / active |
| 4 | `--d-elevation-4` | Floating panels, popovers |
| 5 | `--d-elevation-5` | Modals, overlays |

Dark themes emit stronger alpha values automatically.

### Interaction Requirements

**Hard rule:** Every pattern declares its required interactions in its page-pack `Interactions` checklist. **A pattern that declares `interactions: [...]` MUST implement each one in source.** `decantr check --strict` fails when a declared interaction has no matching treatment or handler in the generated code.

| Declared interaction | Canonical implementation |
|----------------------|-------------------------|
| `animate-on-mount` | `d-enter-fade` / `d-enter-slide-up` / `d-enter-scale` on the pattern root |
| `stagger-children` | `d-stagger-children` on parent + `style={{ '--d-stagger-index': i }}` on each child |
| `status-pulse` | `d-pulse` on the indicator |
| `glow-hover` | `d-glow-hover` on the interactive surface |
| `lift-hover` | `d-lift-hover` on the interactive surface |
| `scale-hover` | `d-scale-hover` on the interactive surface |
| `drag-nodes` | `pointerdown` → `pointermove` with 4px threshold before drag engages. `cursor: grab` default, `cursor: grabbing` during. |
| `pan-background` | Pointer handlers on canvas background only (not nodes); translate the viewport transform |
| `zoom-scroll` | Wheel handler adjusting a `scale` transform, clamped [0.25, 4]; show zoom indicator |
| `click-connect` | Two-click state machine: select a port, click another port to create a connection |
| `inline-edit` | Replace static text with controlled `<input>` on click; commit on blur or Enter |
| `hover-tooltip` | `data-tooltip` attribute + hover handler positioning a popover (mount with `d-enter-scale`) |
| `live-simulation` | `setInterval` updating mock state every 2-4 seconds; animate changes with `d-pulse` |
| `drag-reorder` | `pointerdown` → `pointermove` with 4px threshold + `cursor: grab/grabbing`. Reorder list state on drop. (Same handler shape as `drag-nodes`; different state model — list reorder vs free placement.) |
| `scroll-reveal` | `IntersectionObserver` with `once: true` triggering `d-enter-fade`/`d-enter-slide-up` on entry |
| `real-time-updates` | `setInterval` (2-8s) updating mock state OR `WebSocket`/`EventSource` for live data; animate changes with `d-pulse` on the changed element |
| `float-idle` | `d-float` on decorative elements (illustrations, empty-state graphics) |
| `hover-reveal` | `onMouseEnter`/`onMouseLeave` toggling visibility, OR group-hover via the `:hover` pseudo on a parent revealing a child (e.g., row actions appear on row hover) |
| `click-select` | Controlled selection state via `onClick`; reflect via `aria-selected` / `aria-pressed` / `data-active="true"` and toggle visual via the matching treatment data-attribute |
| `keyboard-navigation` | `onKeyDown` arrow-key handlers (ArrowUp/Down/Left/Right + Enter/Space). For lists/grids: roving tabindex pattern. Always pair with `tabIndex={0}` on focusable items. |
| `focus-trap` | Tab-key interception inside modal/dialog cycles focus to first/last focusable element; restore focus on close |
| `shimmer-skeleton` | `d-shimmer` on skeleton placeholders during loading |
| `zoom-pinch` | Touch handlers (`touchstart`/`touchmove`) tracking pinch distance, OR `gestureend` on Safari; same scale transform as `zoom-scroll` |
| `ripple-click` | `d-ripple` on the interactive surface |
