## Project Brief

- **Blueprint:** registry-platform
- **Theme:** luminarum (dark mode, pill shape)
- **Workflow:** brownfield-attach
- **Adoption mode:** style-bridge
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

This project is using Decantr in **brownfield attach** mode.

This project is using Decantr in **brownfield attach** mode with **style-bridge** adoption.

No `.decantr/analysis.json` or `.decantr/init-seed.json` was present when this context was generated. Inventory the current framework, routes, styling, layout, package manager, and rule files before changing runtime code. Then read `.decantr/context/scaffold-pack.md` and `.decantr/context/scaffold.md` to understand the Decantr contract you are layering onto the existing app.

Preserve the current framework, package manager, router, and working runtime structure unless the contract gives you a reviewed reason to change them. Registry content is optional in this workflow unless the task explicitly asks for it.

### Working on a section

Read `.decantr/context/section-{name}-pack.md` for the compact compiled section contract.
Then read `.decantr/context/section-{name}.md` for the fuller context. Prefer the compiled section pack if the two sources differ, and do not invent section features, shells, or themes that are not present in the compiled contract.

### Working on a route

Read `.decantr/context/page-{name}-pack.md` for the most local compiled route contract before editing a specific page. Route-local packs should win over broader narrative docs when there is any mismatch.

### Editing rules

- Follow the **Styling Adoption** or **CSS Implementation** section below before adding dependencies, imports, tokens, or runtime CSS. Brownfield contract-only projects preserve the existing styling system; Decantr CSS projects use the declared Decantr CSS runtime.
- If a local `package.json` is present, trust its declared Decantr dependencies and the project adoption mode over external assumptions about package availability.
- Do **not** create local atom-runtime substitutes such as `src/lib/css.js`, `src/lib/css.ts`, or hand-written `src/styles/atoms.css` files unless the task explicitly asks for a fallback runtime.
- Import Decantr generated CSS files only when the adoption section below says this project uses Decantr CSS or a style bridge.
- Reuse the existing tokens, treatments, decorators, or project design-system primitives instead of inventing a new visual system.
- Do **not** use inline visual style values or component-scoped `<style>` tags as the primary styling path. Colors, spacing, borders, shadows, gradients, and transitions should come from the project's adopted styling system. Inline styles are only acceptable for truly dynamic geometry that cannot be expressed through the contract.
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

## Styling Adoption

This project uses Decantr in **style-bridge** mode.

Decantr may generate lightweight bridge files such as `src/styles/tokens.css` and `src/styles/decantr-bridge.css`, but `@decantr/css` is not required. Treat these files as a mapping layer between Decantr context and the app's existing styling system.

Preserve the current CSS framework/component library. Use Decantr tokens and bridge classes only where they clarify design intent without replacing the app's established styling conventions.

### Interaction Requirements

Every pattern declares its required interactions in its page-pack `Interactions` checklist. A declared interaction must be implemented in source through the project's existing component library, CSS, or event-handler patterns.

| Declared interaction | Canonical implementation shape |
|----------------------|--------------------------------|
| `animate-on-mount` | Entrance animation class or component transition on the pattern root |
| `stagger-children` | Parent stagger class or animation delay driven by child index |
| `keyboard-navigation` | Arrow-key/Enter/Space handlers with visible focus state |
| `ripple-click` | `d-ripple` or an equivalent click feedback class on the interactive surface |
