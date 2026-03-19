# Decantr v1.0 "Drive to 1.0" Initiative

**Date:** 2026-03-19
**Status:** Draft
**Authors:** David + Claude

## Overview

A comprehensive initiative to prepare Decantr for a true v1.0 release. This spec covers README refinement, homepage redesign, showcase creation, registry visibility, theme refinement, and site architecture — all designed as one cohesive system.

## Strategic Positioning

### Primary Identity: AI-Native Framework

Decantr is not competing with React, Vue, or Angular on their terms. It's competing with "hiring a dev team" or "learning to code." The framework is designed for AI to generate, read, and maintain — not for human readability.

### Target Audience (Priority Order)

1. **Developers evaluating AI-native tooling** — They want to understand the technical approach and why it's better than traditional frameworks
2. **Technical founders / solo developers** — They appreciate the speed boost, will prompt their way to working apps
3. **Enterprise (roadmap)** — They care about DevOps pipelines, governance, registries
4. **Non-technical builders (future)** — Not v1.0 focus; requires Node/terminal/editor basics

### Core Narrative (Arguments A & B)

**The Framework Problem:** React, Angular, Vue were designed for humans to write. AI doesn't think in JSX and hooks — it thinks in registries, tokens, and compositions. Decantr speaks AI's language.

**The Inevitability:** AI is already generating most UI code. The frameworks that win will be the ones built for AI from day one. Decantr is that framework.

## Phasing Strategy

### Approach: MVP Core → Polish Pass

**Phase 1 — Structural MVP:**
- README rewrite (hook → pitch → proof → quick start)
- Homepage with minimal nav, Vision section, all 7 sections
- Showcase with Apps + Components + Themes tabs (curated, not exhaustive)
- Theme: hero-only gradient applied
- Minimal nav implemented

**Phase 2 — Full Vision:**
- Showcase anatomy views (interactive component breakdowns)
- Ecosystem tab with community registry
- Patterns tab with full anatomy viewer
- Docs restructure
- Explorer separation (dev tooling only)

## Site Architecture

### URL Structure

```
decantr.ai/
├── /                    Homepage (vision, convince, fast path)
├── /showcase            Proof layer
│   ├── #apps            Full app demos
│   ├── #patterns        Pattern highlights with anatomy (Phase 2)
│   ├── #components      Component samples
│   ├── #themes          Style previews
│   └── #ecosystem       Community registry (Phase 2)
├── /docs                Learning layer
│   ├── /tutorial/*      Step-by-step guide
│   └── /cookbook/*      Standalone recipes
└── /explorer            Dev tooling (de-emphasized, linked from docs)
```

### Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] decantr.ai          Showcase   Docs   [GitHub ↗]   │
└─────────────────────────────────────────────────────────────┘
```

- **Logo** → Homepage
- **Showcase** → `/showcase`
- **Docs** → `/docs`
- **GitHub** → External link

No dropdowns. Sub-navigation happens within each page.

### User Journey

```
Homepage (vision) → Showcase (proof) → Try It (conversion)
            ↘ Fast path: "npx decantr init" right from hero
```

## README Structure

**Target:** ~80-100 lines (down from ~450)

```markdown
# decantr

[badges]

**The AI-native web framework.** Zero dependencies. Native JS/CSS/HTML.

> Frameworks were designed for humans. Decantr is designed for AI.

## Why Decantr?
[3-4 sentences on AI-native architecture]

## The Decantation Process
[Visual diagram: POUR → SETTLE → CLARIFY → DECANT → SERVE → AGE]
[One-liner per stage]

## See It In Action
[2-3 showcase thumbnails with links]

## Quick Start
```bash
npx decantr init my-app
cd my-app && npm install
npx decantr dev
```

## Learn More
- Documentation
- Showcase
- MCP Server
- Community Registry

## Requirements
Node.js >= 20.0.0

## License
MIT
```

**Removed:** Inline architecture docs, CLI reference, component examples, MCP examples, Tannins docs — all move to proper documentation.

## Homepage Design

### Section Flow (7 Sections)

#### Section 1: Hero — Vision Statement
- Gradient headline (hero-only): "Frameworks were built for humans. Decantr is built for AI."
- Value prop paragraph
- Dual CTAs: `npx decantr init` (primary) + View Showcase (secondary)
- **Pattern:** `hero:vision` preset (new)

#### Section 2: Decantation Process — Visual Flow
- 6-stage visual: POUR → SETTLE → CLARIFY → DECANT → SERVE → AGE
- One-liner per stage
- **Pattern:** `process-flow` or `steps-card` with custom preset

#### Section 3: Vision — Code Comparison Split
- Left side: Traditional React/TypeScript (messy, many imports, 847 lines)
- Right side: Clean Decantr essence.json (30 lines → 14-page dashboard)
- Visual proof that AI-native is simpler
- Bottom caption: "AI doesn't think in JSX and hooks..."
- **Pattern:** `code-comparison` (new)

#### Section 4: Features — Bento Box Layout
- Hero feature card (large): "Registry-Driven Generation" with MCP terminal preview
- Stats cards: 100+ Components, <13KB bundle, 48 Patterns, 10 Themes
- Bottom row: Supporting features (Signal Reactivity, Enterprise Ready, SSR)
- **Pattern:** `bento-features` (new)

#### Section 5: Showcase Preview — Proof It Works
- 3 app cards with thumbnails
- "View All Showcases" CTA
- **Pattern:** `showcase-preview` or `card-grid:showcase` preset

#### Section 6: CTA — Get Started
- "Start building today"
- Repeat fast path CTAs
- **Pattern:** `cta-section` (existing)

#### Section 7: Footer
- Links, social, standard footer
- **Pattern:** `footer-columns` (existing)

## Showcase Design

### Tab Navigation

```
Apps | Patterns | Components | Themes | Ecosystem
```

Pill-style tabs with anchor links.

### Apps Tab (Phase 1)

App cards featuring:
- Mini preview thumbnail
- "LIVE" badge
- Official/Community chip
- Style/mode tags
- Page count and feature summary
- **Pattern:** `showcase-card` (new)

### Patterns Tab with Anatomy View (Phase 2)

Split layout:
- **Left:** Visual preview of pattern with numbered hotspots
- **Right:** Breakdown panel
  - Selected component with code signature
  - Atoms used
  - List of all components in pattern
  - Layout atoms

**Pattern:** `anatomy-viewer` (new)

### Components Tab (Phase 1)

Curated component samples across categories. Not exhaustive — highlights that link to Explorer for full reference.

### Themes Tab (Phase 1)

Style previews (auradecantism, clean, glassmorphism) with mode toggles. Visual comparison.

### Ecosystem Tab (Phase 2)

Community registry concept:
- Curated community contributions
- Type chips (style/pattern/archetype)
- Contributor attribution (@username)
- Download counts
- CTAs: "Browse Registry" + "Publish Your Own"
- **Pattern:** `ecosystem-grid` (new)

## Theme Refinement

### Hero-Only Gradient

**Change:** `d-gradient-text` reserved for hero headlines only.

**Implementation:**
- Create `d-heading-hero` class that applies gradient
- Remove gradient from general header styling
- All other headers: solid white/light (`--d-fg`)

**Files:**
- `src/css/styles/auradecantism.js`
- Homepage hero section

## Explorer Separation

**Change:** Explorer becomes pure dev tooling, not part of marketing funnel.

**Implementation:**
- Remove from main nav
- Link from Docs sidebar under "Reference → Dev Tools"
- Keep at `/explorer` URL (no breaking change)
- Future consideration: CLI-launched local tool (`npx decantr workbench`)

## New Patterns Required

All implementations use Decantr patterns and components. No hand-rolled inline systems.

| Pattern | Description | Phase |
|---------|-------------|-------|
| `hero:vision` preset | Gradient headline, dual CTAs, vision statement (preset on existing `hero` pattern) | 1 |
| `code-comparison` | Side-by-side split with syntax highlighting | 1 |
| `bento-features` | Varied card sizes, hero feature prominence | 1 |
| `showcase-card` | Thumbnail, badges, chips, metadata | 1 |
| `showcase-preview` | Homepage showcase teaser grid | 1 |
| `anatomy-viewer` | Interactive component breakdown | 2 |
| `ecosystem-grid` | Community items with attribution | 2 |

## Implementation Constraints

1. **No inline CSS/HTML** — Everything built with Decantr patterns and components
2. **New patterns go to registry** — Reusable assets, not one-off implementations
3. **Practice what you preach** — Homepage proves Decantr can build stunning marketing sites
4. **Curated, not exhaustive** — Showcase demonstrates approach, doesn't catalog everything

## Success Criteria

### Phase 1
- [ ] README is ~100 lines, hooks developers in 30 seconds
- [ ] Homepage tells coherent AI-native story in 7 sections
- [ ] Showcase has Apps, Components, Themes tabs with curated content
- [ ] Navigation is minimal: Logo | Showcase | Docs | GitHub
- [ ] Gradient reserved for hero headlines only
- [ ] All new sections use Decantr patterns (no hand-rolled HTML/CSS)

### Phase 2
- [ ] Anatomy viewer teaches composition model interactively
- [ ] Ecosystem tab sells community registry concept
- [ ] Explorer removed from main nav, linked from docs
- [ ] Docs restructured around prompt workflow, not API reference

## Out of Scope

- Enterprise DevOps pipeline (roadmap)
- Non-technical builder workflows (future)
- Platform features (cloud.decantr.ai — roadmap)
- Pricing page (no monetization in v1.0)
- Traditional documentation overhaul (Phase 2+)

## Visual References

Wireframes created during brainstorming session (in `.superpowers/brainstorm/` at project root, gitignored):
- `homepage-sections.html` — Full 7-section flow
- `sections-3-4-redesign.html` — Code comparison + bento features
- `showcase-design.html` — Tab navigation + anatomy viewer
