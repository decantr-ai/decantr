# v1.0 "Drive to 1.0" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Decantr for v1.0 release with a cohesive README, homepage, showcase, and navigation that communicates the AI-native framework identity.

**Architecture:** Phase 1 focuses on structural MVP: simplified navigation, 7-section homepage with new patterns, tabbed showcase page, hero-only gradient theme refinement, and a condensed ~100-line README. All new sections use Decantr patterns — no hand-rolled HTML/CSS.

**Tech Stack:** Decantr framework (tags, css, components, patterns), registry JSON patterns, auradecantism theme

**Spec:** [docs/superpowers/specs/2026-03-19-v1-drive-to-one-design.md](../specs/2026-03-19-v1-drive-to-one-design.md)

---

## File Structure

### New Files
| Path | Purpose |
|------|---------|
| `src/registry/patterns/code-comparison.json` | Side-by-side code comparison pattern |
| `src/registry/patterns/bento-features.json` | Bento box feature grid with hero card |
| `src/registry/patterns/showcase-card.json` | App showcase card with badges/metadata |
| `docs/src/pages/showcase.js` | New tabbed showcase page (Apps/Components/Themes) |
| `docs/src/sections/vision-comparison.js` | Section 3: Code comparison split |
| `docs/src/sections/bento-features.js` | Section 4: Bento box features |
| `docs/src/sections/showcase-preview.js` | Section 5: Homepage showcase teaser |

### Modified Files
| Path | Changes |
|------|---------|
| `src/registry/patterns/hero.json` | Add `vision` preset |
| `src/css/styles/auradecantism.js` | Add `d-heading-hero` class, restrict gradient |
| `docs/src/layouts/site-shell.js` | Simplify nav: Logo \| Showcase \| Docs \| GitHub |
| `docs/src/pages/home.js` | Rewrite to 7-section structure |
| `docs/src/app.js` | Add `/showcase` route |
| `README.md` | Rewrite to ~100 lines |

---

## Task 1: Add `vision` Preset to Hero Pattern

**Files:**
- Modify: `src/registry/patterns/hero.json`
- Test: Manual verification via Explorer

- [ ] **Step 1: Read current hero.json**

Verify current presets: `landing`, `image-overlay`, `brand`, `split`, `image-overlay-compact`, `empty-state`

- [ ] **Step 2: Add vision preset to hero.json**

Add after the `brand` preset:

```json
"vision": {
  "description": "AI-native vision statement hero with gradient headline, value prop, and dual CTAs. Hero-only gradient treatment.",
  "components": ["Button", "icon"],
  "blend": {
    "layout": "stack",
    "atoms": "_flex _col _aic _tc _gap8 _py24 _px6 _minh[100vh] _jcc _relative",
    "slots": {
      "decoration": "Absolute-positioned aura-orb elements for ambient background",
      "headline": "Display-size heading with d-heading-hero (gradient-only class)",
      "description": "Value proposition paragraph with _textlg _fgmuted _mw[640px]",
      "cta-group": "Horizontal Button group: primary (npx decantr init) + secondary (View Showcase)"
    }
  },
  "code": {
    "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Button, icon } from 'decantr/components';",
    "example": "function VisionHero() {\n  const { div, section, h1, p, span } = tags;\n\n  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _minh[100vh] _jcc _relative d-mesh') },\n    // Decorative orbs\n    span({ class: css('aura-orb _w[400px] _h[400px] _top[-10%] _left[-5%] _bg[rgba(254,68,116,0.15)]') }),\n    span({ class: css('aura-orb _w[300px] _h[300px] _bottom[10%] _right[-5%] _bg[rgba(10,243,235,0.1)]') }),\n    // Content\n    h1({ class: css('d-heading-hero') }, 'Frameworks were built for humans. Decantr is built for AI.'),\n    p({ class: css('_textlg _fgmuted _mw[640px] _lh[1.6]') }, 'The AI-native web framework. Registry-driven generation, signal reactivity, and 100+ components — all designed for LLMs to generate, read, and maintain.'),\n    div({ class: css('_flex _gap3') },\n      Button({ variant: 'primary', size: 'lg', class: css('aura-glow') }, icon('terminal'), 'npx decantr init'),\n      Button({ variant: 'outline', size: 'lg' }, 'View Showcase')\n    )\n  );\n}"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/registry/patterns/hero.json
git commit -m "feat(patterns): add vision preset to hero pattern

Adds hero:vision preset for AI-native landing pages with gradient
headline, value prop, and dual CTAs.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Code Comparison Pattern

**Files:**
- Create: `src/registry/patterns/code-comparison.json`
- Modify: `src/registry/patterns/index.json`

- [ ] **Step 1: Create code-comparison.json**

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "code-comparison",
  "name": "Code Comparison",
  "description": "Side-by-side code comparison with syntax highlighting. Shows before/after, traditional vs modern, or any two code approaches.",
  "components": ["CodeBlock", "Card"],
  "default_preset": "split",
  "presets": {
    "split": {
      "description": "Equal-width side-by-side comparison, stacks on mobile",
      "components": ["CodeBlock", "Card"],
      "blend": {
        "layout": "row",
        "atoms": "_grid _gc1 _lg:gc2 _gap6 _py12 _px6",
        "slots": {
          "left-panel": "Card with header label and CodeBlock",
          "right-panel": "Card with header label and CodeBlock",
          "caption": "Optional bottom caption explaining the comparison"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, CodeBlock, createHighlighter } from 'decantr/components';",
        "example": "function CodeComparison({ left, right, caption }) {\n  const { div, h3, p } = tags;\n\n  const panel = (label, code, lang) =>\n    Card({ class: css('_flex _col _gap0 _overflow[hidden]') },\n      Card.Header({},\n        h3({ class: css('_textsm _fgmuted _uppercase _tracking[0.05em]') }, label)\n      ),\n      Card.Body({ class: css('_p0') },\n        CodeBlock({ language: lang, highlight: createHighlighter }, code)\n      )\n    );\n\n  return div({ class: css('_flex _col _gap6') },\n    div({ class: css('_grid _gc1 _lg:gc2 _gap6') },\n      panel(left.label, left.code, left.lang || 'javascript'),\n      panel(right.label, right.code, right.lang || 'javascript')\n    ),\n    caption ? p({ class: css('_tc _fgmuted _textsm _italic') }, caption) : null\n  );\n}"
      }
    },
    "stacked": {
      "description": "Vertical stack with labels, good for longer code samples",
      "components": ["CodeBlock", "Card"],
      "blend": {
        "layout": "stack",
        "atoms": "_flex _col _gap6 _py12 _px6",
        "slots": {
          "top-panel": "Card with header label and CodeBlock",
          "bottom-panel": "Card with header label and CodeBlock"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, CodeBlock, createHighlighter } from 'decantr/components';",
        "example": "function StackedComparison({ top, bottom }) {\n  const { div, h3 } = tags;\n\n  const panel = (label, code, lang) =>\n    Card({ class: css('_flex _col _gap0 _overflow[hidden]') },\n      Card.Header({},\n        h3({ class: css('_textsm _fgmuted _uppercase _tracking[0.05em]') }, label)\n      ),\n      Card.Body({ class: css('_p0') },\n        CodeBlock({ language: lang, highlight: createHighlighter }, code)\n      )\n    );\n\n  return div({ class: css('_flex _col _gap6') },\n    panel(top.label, top.code, top.lang || 'javascript'),\n    panel(bottom.label, bottom.code, bottom.lang || 'javascript')\n  );\n}"
      }
    }
  },
  "default_blend": {
    "layout": "row",
    "atoms": "_grid _gc1 _lg:gc2 _gap6 _py12 _px6",
    "slots": {
      "left-panel": "Card with header label and CodeBlock",
      "right-panel": "Card with header label and CodeBlock"
    }
  },
  "code": {
    "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, CodeBlock, createHighlighter } from 'decantr/components';",
    "example": "function CodeComparison({ left, right }) {\n  const { div, h3 } = tags;\n\n  const panel = (label, code, lang) =>\n    Card({ class: css('_flex _col _gap0 _overflow[hidden]') },\n      Card.Header({},\n        h3({ class: css('_textsm _fgmuted _uppercase _tracking[0.05em]') }, label)\n      ),\n      Card.Body({ class: css('_p0') },\n        CodeBlock({ language: lang, highlight: createHighlighter }, code)\n      )\n    );\n\n  return div({ class: css('_grid _gc1 _lg:gc2 _gap6') },\n    panel(left.label, left.code, left.lang || 'javascript'),\n    panel(right.label, right.code, right.lang || 'javascript')\n  );\n}"
  }
}
```

- [ ] **Step 2: Add to patterns index**

In `src/registry/patterns/index.json`, add entry:

```json
"code-comparison": {
  "file": "code-comparison.json",
  "name": "Code Comparison",
  "category": "marketing"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/registry/patterns/code-comparison.json src/registry/patterns/index.json
git commit -m "feat(patterns): add code-comparison pattern

Side-by-side code comparison with split and stacked presets.
Used for before/after, traditional vs modern comparisons.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Bento Features Pattern

**Files:**
- Create: `src/registry/patterns/bento-features.json`
- Modify: `src/registry/patterns/index.json`

- [ ] **Step 1: Create bento-features.json**

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "bento-features",
  "name": "Bento Features",
  "description": "Bento box feature grid with varied card sizes. Hero feature card (large) with stats and supporting feature cards.",
  "components": ["Card", "Badge", "icon"],
  "default_preset": "hero-stats",
  "presets": {
    "hero-stats": {
      "description": "Large hero feature + stats row + supporting features",
      "components": ["Card", "Badge", "icon", "CodeBlock"],
      "blend": {
        "layout": "stack",
        "atoms": "_flex _col _gap6 _py12 _px6 _mw[1100px] _mx[auto]",
        "slots": {
          "hero-card": "Large Card (span 2 cols) with feature title, description, and visual preview",
          "stats-row": "4-column grid of stat Cards (icon + value + label)",
          "features-row": "3-column grid of supporting feature Cards"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge, icon } from 'decantr/components';",
        "example": "function BentoFeatures({ hero, stats, features }) {\n  const { div, h2, h3, p, span } = tags;\n\n  return div({ class: css('_flex _col _gap6 _py12 _px6 _mw[1100px] _mx[auto]') },\n    // Hero feature card\n    Card({ class: css('d-glass _p6') },\n      Card.Body({ class: css('_grid _gc1 _lg:gc2 _gap6 _aic') },\n        div({ class: css('_flex _col _gap4') },\n          Badge({ variant: 'outline' }, hero.badge),\n          h2({ class: css('_heading2') }, hero.title),\n          p({ class: css('_fgmuted _lh[1.6]') }, hero.description)\n        ),\n        div({ class: css('d-glass-strong _r3 _p4 _hfull') }, hero.preview)\n      )\n    ),\n    // Stats row\n    div({ class: css('_grid _gc2 _md:gc4 _gap4') },\n      ...stats.map(s =>\n        Card({ class: css('d-glass _tc _p4') },\n          Card.Body({ class: css('_flex _col _gap2 _aic') },\n            icon(s.icon, { class: css('_fgprimary') }),\n            span({ class: css('_heading2 _fgfg') }, s.value),\n            span({ class: css('_textsm _fgmuted') }, s.label)\n          )\n        )\n      )\n    ),\n    // Features row\n    div({ class: css('_grid _gc1 _md:gc3 _gap4') },\n      ...features.map(f =>\n        Card({ class: css('d-glass') },\n          Card.Body({ class: css('_flex _col _gap3') },\n            div({ class: css('_w10 _h10 _r2 _bgprimary/10 _flex _aic _jcc _fgprimary') }, icon(f.icon)),\n            h3({ class: css('_heading5') }, f.title),\n            p({ class: css('_textsm _fgmuted') }, f.description)\n          )\n        )\n      )\n    )\n  );\n}"
      }
    },
    "grid-only": {
      "description": "Simple uniform grid of feature cards",
      "components": ["Card", "icon"],
      "blend": {
        "layout": "grid",
        "atoms": "_grid _gc1 _md:gc2 _lg:gc3 _gap6 _py12 _px6",
        "slots": {
          "feature-cards": "Uniform Card grid with icon, title, description"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, icon } from 'decantr/components';",
        "example": "function FeatureGrid({ features }) {\n  const { div, h3, p } = tags;\n\n  return div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6 _py12 _px6') },\n    ...features.map(f =>\n      Card({ class: css('d-glass') },\n        Card.Body({ class: css('_flex _col _gap3') },\n          div({ class: css('_w10 _h10 _r2 _bgprimary/10 _flex _aic _jcc _fgprimary') }, icon(f.icon)),\n          h3({ class: css('_heading5') }, f.title),\n          p({ class: css('_textsm _fgmuted') }, f.description)\n        )\n      )\n    )\n  );\n}"
      }
    }
  },
  "default_blend": {
    "layout": "stack",
    "atoms": "_flex _col _gap6 _py12 _px6 _mw[1100px] _mx[auto]",
    "slots": {
      "hero-card": "Large hero feature Card",
      "stats-row": "Stats grid",
      "features-row": "Supporting features grid"
    }
  },
  "code": {
    "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge, icon } from 'decantr/components';",
    "example": "function BentoFeatures({ hero, stats, features }) {\n  const { div, h2, h3, p, span } = tags;\n\n  return div({ class: css('_flex _col _gap6') },\n    Card({ class: css('d-glass _p6') },\n      Card.Body({},\n        h2({ class: css('_heading2') }, hero.title),\n        p({ class: css('_fgmuted') }, hero.description)\n      )\n    ),\n    div({ class: css('_grid _gc2 _md:gc4 _gap4') },\n      ...stats.map(s => Card({ class: css('d-glass _tc _p4') }, span({ class: css('_heading2') }, s.value), span({ class: css('_textsm _fgmuted') }, s.label)))\n    )\n  );\n}"
  }
}
```

- [ ] **Step 2: Add to patterns index**

In `src/registry/patterns/index.json`, add entry:

```json
"bento-features": {
  "file": "bento-features.json",
  "name": "Bento Features",
  "category": "marketing"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/registry/patterns/bento-features.json src/registry/patterns/index.json
git commit -m "feat(patterns): add bento-features pattern

Bento box feature grid with hero card, stats row, and supporting
features. Presets: hero-stats, grid-only.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Showcase Card Pattern

**Files:**
- Create: `src/registry/patterns/showcase-card.json`
- Modify: `src/registry/patterns/index.json`

- [ ] **Step 1: Create showcase-card.json**

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "showcase-card",
  "name": "Showcase Card",
  "description": "App showcase card with thumbnail, live badge, style/mode chips, and metadata. Used in showcase galleries.",
  "components": ["Card", "Badge", "Chip", "Button", "icon"],
  "default_preset": "app",
  "presets": {
    "app": {
      "description": "Full app showcase with thumbnail, badges, description, and tags",
      "components": ["Card", "Badge", "Chip", "Button", "icon"],
      "blend": {
        "layout": "stack",
        "atoms": "_flex _col _gap0 _overflow[hidden]",
        "slots": {
          "thumbnail": "Top image/preview area with hover scale",
          "badge-row": "LIVE badge + style/mode chips",
          "title": "App title with _heading5",
          "description": "Short description with _fgmuted",
          "tags": "Horizontal tag pills",
          "footer": "Archetype label + View Live button"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge, Button, icon } from 'decantr/components';",
        "example": "function ShowcaseCard({ item }) {\n  const { div, h3, p, span, a, img } = tags;\n  const isLive = item.status === 'live';\n  const url = `/showcase/${item.id}/`;\n\n  return Card({ hoverable: true, class: css('d-glass _flex _col _gap0 _overflow[hidden]') },\n    a({ href: url, target: '_blank', class: css('_block _overflow[hidden] _bgmuted') },\n      img({ src: `/showcase/${item.id}/thumbnail.svg`, alt: item.title, loading: 'lazy',\n            class: css('_wfull _h[200px] _object[cover] _trans[transform_0.3s_ease] _h:scale[1.03]') })\n    ),\n    div({ class: css('_flex _col _gap4 _p6 _flex1') },\n      div({ class: css('_flex _aic _jcsb') },\n        Badge({ variant: isLive ? 'success' : 'default' }, isLive ? 'LIVE' : 'Coming Soon'),\n        div({ class: css('_flex _gap2') },\n          Badge({ variant: 'outline' }, item.style),\n          Badge({ variant: 'outline' }, item.mode)\n        )\n      ),\n      h3({ class: css('_heading5 _fgfg') }, item.title),\n      p({ class: css('_textsm _fgmuted _lh[1.6]') }, item.description),\n      div({ class: css('_flex _wrap _gap2') },\n        ...item.tags.map(t => span({ class: css('_textxs _fgmuted _bgmuted/50 _px2 _py1 _r1') }, t))\n      ),\n      div({ class: css('_flex _aic _jcsb _mt[auto] _pt4 _borderT _bcborder') },\n        span({ class: css('_textsm _fgmuted') }, `Archetype: ${item.archetype}`),\n        isLive ? a({ href: url, target: '_blank', class: css('_nounder') },\n          Button({ variant: 'primary', size: 'sm' }, 'View Live', icon('external-link'))\n        ) : null\n      )\n    )\n  );\n}"
      }
    },
    "compact": {
      "description": "Compact card for grid displays, thumbnail + title only",
      "components": ["Card", "Badge"],
      "blend": {
        "layout": "stack",
        "atoms": "_flex _col _gap0 _overflow[hidden]",
        "slots": {
          "thumbnail": "Square thumbnail with hover overlay",
          "title": "Title + live badge"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge } from 'decantr/components';",
        "example": "function CompactShowcaseCard({ item }) {\n  const { div, h4, a, img } = tags;\n\n  return Card({ hoverable: true, class: css('d-glass _overflow[hidden]') },\n    a({ href: `/showcase/${item.id}/`, target: '_blank', class: css('_block') },\n      img({ src: `/showcase/${item.id}/thumbnail.svg`, alt: item.title,\n            class: css('_wfull _h[150px] _object[cover]') })\n    ),\n    div({ class: css('_flex _aic _jcsb _p3') },\n      h4({ class: css('_textsm _fgfg') }, item.title),\n      Badge({ variant: 'success', size: 'xs' }, 'LIVE')\n    )\n  );\n}"
      }
    }
  },
  "default_blend": {
    "layout": "stack",
    "atoms": "_flex _col _gap0 _overflow[hidden]",
    "slots": {
      "thumbnail": "Top preview area",
      "content": "Title, description, metadata"
    }
  },
  "code": {
    "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge, Button, icon } from 'decantr/components';",
    "example": "function ShowcaseCard({ item }) {\n  const { div, h3, p, a, img } = tags;\n\n  return Card({ hoverable: true, class: css('d-glass _overflow[hidden]') },\n    a({ href: `/showcase/${item.id}/`, target: '_blank' },\n      img({ src: `/showcase/${item.id}/thumbnail.svg`, alt: item.title, class: css('_wfull _h[200px] _object[cover]') })\n    ),\n    div({ class: css('_p6') },\n      h3({ class: css('_heading5') }, item.title),\n      p({ class: css('_textsm _fgmuted') }, item.description)\n    )\n  );\n}"
  }
}
```

- [ ] **Step 2: Add to patterns index**

In `src/registry/patterns/index.json`, add entry:

```json
"showcase-card": {
  "file": "showcase-card.json",
  "name": "Showcase Card",
  "category": "marketing"
}
```

- [ ] **Step 3: Commit**

```bash
git add src/registry/patterns/showcase-card.json src/registry/patterns/index.json
git commit -m "feat(patterns): add showcase-card pattern

App showcase card with thumbnail, live badge, style/mode chips,
tags, and metadata. Presets: app, compact.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Add Hero-Only Gradient Theme Class

**Files:**
- Modify: `src/css/styles/auradecantism.js`
- Test: Visual verification

- [ ] **Step 1: Read current auradecantism.js**

Locate the `d-gradient-text` class and related heading styles.

- [ ] **Step 2: Add d-heading-hero class**

Add a new class that combines the display heading size with gradient treatment:

```javascript
// In the styles object, add:
'.d-heading-hero': {
  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
  fontWeight: '900',
  letterSpacing: '-0.04em',
  lineHeight: '1.1',
  background: 'linear-gradient(135deg, var(--d-primary) 0%, var(--d-accent) 50%, var(--d-secondary) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
},
```

- [ ] **Step 3: Document the change**

Add comment noting that `d-heading-hero` is for hero headlines only, while `d-gradient-text` remains available for legacy/other uses but should not be used on section headings.

- [ ] **Step 4: Commit**

```bash
git add src/css/styles/auradecantism.js
git commit -m "feat(theme): add d-heading-hero class for hero-only gradient

Introduces d-heading-hero for hero headlines with gradient treatment.
Regular section headings should use solid colors (_fgfg).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Simplify Site Navigation

**Files:**
- Modify: `docs/src/layouts/site-shell.js`

- [ ] **Step 1: Read current site-shell.js**

Review current NAV_ITEMS structure and SHOWCASE_LINKS.

- [ ] **Step 2: Replace NAV_ITEMS with minimal nav**

```javascript
const NAV_ITEMS = [
  { label: 'Showcase', href: '#/showcase' },
  { label: 'Docs', href: '#/docs' },
  { label: 'GitHub', href: 'https://github.com/decantr-ai/decantr' },
];
```

- [ ] **Step 3: Remove SHOWCASE_LINKS constant**

Delete the SHOWCASE_LINKS array since we no longer need the dropdown.

- [ ] **Step 4: Update GitHub link handling**

Keep the `target="_blank"` and `rel="noopener"` attribute setting for GitHub.

- [ ] **Step 5: Commit**

```bash
git add docs/src/layouts/site-shell.js
git commit -m "feat(nav): simplify to Logo | Showcase | Docs | GitHub

Removes Explorer and Gallery from main nav. Showcase dropdown
replaced with direct link to /showcase page.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Showcase Page with Tabs

**Files:**
- Create: `docs/src/pages/showcase.js`
- Modify: `docs/src/app.js`

- [ ] **Step 1: Create showcase.js**

```javascript
/**
 * Showcase Page — tabbed view of Apps, Components, and Themes
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { Card, Badge, Button, Tabs, icon } from 'decantr/components';
import { SiteShell } from '../layouts/site-shell.js';
import { showcaseManifest } from '../data/showcases.js';

const { div, h1, h2, h3, p, span, section, a, img } = tags;
const SHOWCASES = showcaseManifest.showcases;

// ─── Apps Tab ─────────────────────────────────────────────────────
function AppsTab() {
  const liveApps = SHOWCASES.filter(s => s.status === 'live');

  return div({ class: css('_grid _gc1 _md:gc2 _gap6 _py8') },
    ...liveApps.map(item =>
      Card({ hoverable: true, class: css('d-glass _flex _col _gap0 _overflow[hidden]') },
        a({ href: `/showcase/${item.id}/`, target: '_blank', rel: 'noopener', class: css('_block _overflow[hidden] _bgmuted') },
          img({ src: `/showcase/${item.id}/thumbnail.svg`, alt: item.title, loading: 'lazy',
                class: css('_wfull _h[200px] _object[cover] _trans[transform_0.3s_ease] _h:scale[1.03]') })
        ),
        div({ class: css('_flex _col _gap4 _p6 _flex1') },
          div({ class: css('_flex _aic _jcsb') },
            Badge({ variant: 'success' }, 'LIVE'),
            div({ class: css('_flex _gap2') },
              Badge({ variant: 'outline' }, item.style),
              Badge({ variant: 'outline' }, item.mode)
            )
          ),
          h3({ class: css('_heading5 _fgfg') }, item.title),
          p({ class: css('_textsm _fgmuted _lh[1.6]') }, item.description),
          div({ class: css('_flex _wrap _gap2') },
            ...item.tags.map(t => span({ class: css('_textxs _fgmuted _bgmuted/50 _px2 _py1 _r1') }, t))
          ),
          div({ class: css('_flex _aic _jcsb _mt[auto] _pt4 _borderT _bcborder') },
            span({ class: css('_textsm _fgmuted') }, `Archetype: ${item.archetype}`),
            a({ href: `/showcase/${item.id}/`, target: '_blank', rel: 'noopener', class: css('_nounder') },
              Button({ variant: 'primary', size: 'sm' }, 'View Live', icon('external-link'))
            )
          )
        )
      )
    )
  );
}

// ─── Components Tab ───────────────────────────────────────────────
function ComponentsTab() {
  const categories = [
    { name: 'Form', items: ['Button', 'Input', 'Select', 'Checkbox', 'Toggle', 'Slider'] },
    { name: 'Display', items: ['Card', 'Badge', 'Avatar', 'Chip', 'Statistic'] },
    { name: 'Layout', items: ['Shell', 'Tabs', 'Accordion', 'Modal', 'Drawer'] },
    { name: 'Feedback', items: ['Alert', 'Toast', 'Progress', 'Skeleton'] },
  ];

  return div({ class: css('_flex _col _gap8 _py8') },
    p({ class: css('_fgmuted _tc') }, '100+ production-ready components. Explore the full catalog in the Explorer.'),
    div({ class: css('_grid _gc1 _md:gc2 _gap6') },
      ...categories.map(cat =>
        Card({ class: css('d-glass') },
          Card.Header({}, h3({ class: css('_heading5') }, cat.name)),
          Card.Body({},
            div({ class: css('_flex _wrap _gap2') },
              ...cat.items.map(c => Badge({ variant: 'outline' }, c))
            )
          )
        )
      )
    ),
    div({ class: css('_tc') },
      a({ href: '#/explorer', class: css('_nounder') },
        Button({ variant: 'outline' }, 'Open Component Explorer', icon('arrow-right'))
      )
    )
  );
}

// ─── Themes Tab ───────────────────────────────────────────────────
function ThemesTab() {
  const themes = [
    { name: 'Auradecantism', desc: 'Default dark theme with aurora gradients and glass effects', type: 'core' },
    { name: 'Clean', desc: 'Minimal light theme with sharp edges and solid colors', type: 'addon' },
    { name: 'Glassmorphism', desc: 'Frosted glass aesthetic with blur and transparency', type: 'addon' },
    { name: 'Retro', desc: 'Synthwave-inspired with neon accents', type: 'community' },
    { name: 'Bioluminescent', desc: 'Deep sea glow with organic gradients', type: 'community' },
    { name: 'Launchpad', desc: 'Startup-focused with vibrant CTAs', type: 'community' },
  ];

  return div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6 _py8') },
    ...themes.map(t =>
      Card({ class: css('d-glass') },
        Card.Body({ class: css('_flex _col _gap3') },
          div({ class: css('_flex _aic _jcsb') },
            h3({ class: css('_heading5 _fgfg') }, t.name),
            Badge({ variant: t.type === 'core' ? 'primary' : t.type === 'addon' ? 'secondary' : 'outline' },
              t.type === 'core' ? 'Core' : t.type === 'addon' ? 'Add-on' : 'Community'
            )
          ),
          p({ class: css('_textsm _fgmuted') }, t.desc)
        )
      )
    )
  );
}

// ─── Page Composition ─────────────────────────────────────────────
export function ShowcasePage() {
  return SiteShell(
    section({ class: css('_flex _col _gap8 _py12 _px6 _mw[1100px] _mx[auto]') },
      // Header
      div({ class: css('_tc _flex _col _gap4 _aic') },
        h1({ class: css('d-heading-hero') }, 'See What Decantr Builds'),
        p({ class: css('_textlg _fgmuted _mw[600px]') },
          'Production apps, 100+ components, and curated themes — all generated from essence files.'
        )
      ),
      // Tabs
      Tabs({
        items: [
          { id: 'apps', label: 'Apps', icon: 'layout-grid' },
          { id: 'components', label: 'Components', icon: 'box' },
          { id: 'themes', label: 'Themes', icon: 'palette' },
        ],
        default: 'apps',
        variant: 'pills',
        centered: true,
      },
        Tabs.Panel({ id: 'apps' }, AppsTab()),
        Tabs.Panel({ id: 'components' }, ComponentsTab()),
        Tabs.Panel({ id: 'themes' }, ThemesTab())
      )
    )
  );
}
```

- [ ] **Step 2: Add route to app.js**

In `docs/src/app.js`, add the showcase route:

```javascript
import { ShowcasePage } from './pages/showcase.js';

// In router config, add:
{ path: '/showcase', component: ShowcasePage },
```

- [ ] **Step 3: Commit**

```bash
git add docs/src/pages/showcase.js docs/src/app.js
git commit -m "feat(docs): add tabbed showcase page

Three tabs: Apps (live showcases), Components (category overview),
Themes (core/addon/community). Links to Explorer for full catalog.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Homepage Vision Comparison Section

**Files:**
- Create: `docs/src/sections/vision-comparison.js`

- [ ] **Step 1: Create vision-comparison.js**

```javascript
/**
 * Section 3: Code Comparison — Traditional React vs Decantr Essence
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, CodeBlock, createHighlighter } from 'decantr/components';

const { div, section, h2, h3, p } = tags;

const REACT_CODE = `// Traditional React Dashboard
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@emotion/react';
import { AuthProvider, useAuth } from './auth';
import { Sidebar, Header, KPICard, DataTable, Chart } from './components';
import { theme } from './theme';
import './styles.css';

// 847 lines of boilerplate, hooks, providers, and components...
// Just to get a basic dashboard running.`;

const ESSENCE_CODE = `// Decantr Essence — 30 lines → 14-page dashboard
{
  "terroir": "saas-dashboard",
  "vintage": {
    "style": "auradecantism",
    "mode": "dark"
  },
  "character": ["professional", "data-rich"],
  "structure": [
    { "id": "overview", "blend": ["kpi-grid", "chart-grid", "data-table"] },
    { "id": "analytics", "blend": ["filter-bar", "chart-grid"] },
    { "id": "users", "blend": ["filter-bar", "data-table"] },
    { "id": "settings", "blend": ["form-sections"] }
  ],
  "tannins": ["auth", "realtime-data"]
}`;

export function VisionComparisonSection() {
  const panel = (label, code, lang) =>
    Card({ class: css('d-glass _flex _col _gap0 _overflow[hidden]') },
      Card.Header({},
        h3({ class: css('_textsm _fgmuted _uppercase _tracking[0.05em]') }, label)
      ),
      Card.Body({ class: css('_p0') },
        CodeBlock({ language: lang, highlight: createHighlighter, maxHeight: '300px' }, code)
      )
    );

  return section({ class: css('_py24 _px6') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap8') },
      div({ class: css('_tc') },
        h2({ class: css('_heading2 _fgfg _mb3') }, 'Traditional vs AI-Native'),
        p({ class: css('_fgmuted _mw[600px] _mx[auto]') },
          'AI doesn\'t think in JSX and hooks. It thinks in registries, tokens, and compositions.'
        )
      ),
      div({ class: css('_grid _gc1 _lg:gc2 _gap6') },
        panel('React + TypeScript', REACT_CODE, 'javascript'),
        panel('Decantr Essence', ESSENCE_CODE, 'json')
      ),
      p({ class: css('_tc _fgmuted _textsm _italic') },
        '30 lines of essence.json generates the same dashboard that takes 847 lines of traditional React.'
      )
    )
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add docs/src/sections/vision-comparison.js
git commit -m "feat(docs): add vision comparison section

Side-by-side React vs Decantr essence.json comparison.
Shows 847 lines vs 30 lines for same dashboard.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create Homepage Bento Features Section

**Files:**
- Create: `docs/src/sections/bento-features.js`

- [ ] **Step 1: Create bento-features.js**

```javascript
/**
 * Section 4: Bento Features — Hero feature + stats + supporting features
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, CodeBlock, createHighlighter, icon } from 'decantr/components';

const { div, section, h2, h3, p, span, pre } = tags;

const MCP_PREVIEW = `$ claude "Add a kanban board to the dashboard"

→ lookup_pattern { "id": "kanban-board" }
→ get_pattern_code { "id": "kanban-board", "preset": "task" }
→ validate_essence { "path": "decantr.essence.json" }

✓ Pattern added to overview page blend
✓ Code generated with drag-drop + status columns
✓ Essence updated, Cork rules validated`;

export function BentoFeaturesSection() {
  const stats = [
    { icon: 'box', value: '100+', label: 'Components' },
    { icon: 'file-code', value: '<13KB', label: 'Bundle' },
    { icon: 'layout-grid', value: '48', label: 'Patterns' },
    { icon: 'palette', value: '10', label: 'Themes' },
  ];

  const features = [
    { icon: 'zap', title: 'Signal Reactivity', description: 'Fine-grained updates without virtual DOM. Changes propagate exactly where needed.' },
    { icon: 'shield', title: 'Enterprise Ready', description: 'OIDC/PKCE auth, RBAC, form validation, error boundaries, route guards built in.' },
    { icon: 'server', title: 'SSR Support', description: 'Server-side rendering with streaming and hydration. Edge-ready.' },
  ];

  return section({ class: css('_py24 _px6 d-mesh') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap8') },
      // Hero feature card
      Card({ class: css('d-glass _p6') },
        Card.Body({ class: css('_grid _gc1 _lg:gc2 _gap8 _aic') },
          div({ class: css('_flex _col _gap4') },
            Badge({ variant: 'primary', icon: 'cpu' }, 'MCP Server'),
            h2({ class: css('_heading2 _fgfg') }, 'Registry-Driven Generation'),
            p({ class: css('_fgmuted _lh[1.6]') },
              'The MCP server exposes 16 tools for AI to query components, resolve atoms, generate patterns, and validate essence files. Your AI assistant becomes a Decantr expert.'
            )
          ),
          div({ class: css('d-glass-strong _r3 _overflow[hidden]') },
            pre({ class: css('_p4 _m0 _textsm _lh[1.6] _font[var(--d-font-mono)] _fgfg') }, MCP_PREVIEW)
          )
        )
      ),
      // Stats row
      div({ class: css('_grid _gc2 _md:gc4 _gap4') },
        ...stats.map(s =>
          Card({ class: css('d-glass _tc _p4') },
            Card.Body({ class: css('_flex _col _gap2 _aic') },
              icon(s.icon, { class: css('_fgprimary _w6 _h6') }),
              span({ class: css('_heading2 _fgfg') }, s.value),
              span({ class: css('_textsm _fgmuted') }, s.label)
            )
          )
        )
      ),
      // Features row
      div({ class: css('_grid _gc1 _md:gc3 _gap4') },
        ...features.map(f =>
          Card({ class: css('d-glass') },
            Card.Body({ class: css('_flex _col _gap3') },
              div({ class: css('_w10 _h10 _r2 _bgprimary/10 _flex _aic _jcc _fgprimary') },
                icon(f.icon)
              ),
              h3({ class: css('_heading5 _fgfg') }, f.title),
              p({ class: css('_textsm _fgmuted _lh[1.5]') }, f.description)
            )
          )
        )
      )
    )
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add docs/src/sections/bento-features.js
git commit -m "feat(docs): add bento features section

Hero card (MCP server), stats row (100+ components, <13KB, etc.),
and supporting features (signals, enterprise, SSR).

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Create Homepage Showcase Preview Section

**Files:**
- Create: `docs/src/sections/showcase-preview.js`

- [ ] **Step 1: Create showcase-preview.js**

```javascript
/**
 * Section 5: Showcase Preview — 3 app cards with link to full showcase
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Button, icon } from 'decantr/components';
import { link } from 'decantr/router';
import { showcaseManifest } from '../data/showcases.js';

const { div, section, h2, h3, p, span, a, img } = tags;
const SHOWCASES = showcaseManifest.showcases.filter(s => s.status === 'live').slice(0, 3);

export function ShowcasePreviewSection() {
  return section({ class: css('_py24 _px6') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap8') },
      div({ class: css('_tc') },
        h2({ class: css('_heading2 _fgfg _mb3') }, 'Built with Decantr'),
        p({ class: css('_fgmuted') }, 'Real applications generated from essence files')
      ),
      div({ class: css('_grid _gc1 _md:gc3 _gap6') },
        ...SHOWCASES.map(item =>
          Card({ hoverable: true, class: css('d-glass _overflow[hidden]') },
            a({ href: `/showcase/${item.id}/`, target: '_blank', rel: 'noopener', class: css('_block _bgmuted') },
              img({ src: `/showcase/${item.id}/thumbnail.svg`, alt: item.title, loading: 'lazy',
                    class: css('_wfull _h[160px] _object[cover] _trans[transform_0.3s_ease] _h:scale[1.03]') })
            ),
            div({ class: css('_p4 _flex _col _gap2') },
              div({ class: css('_flex _aic _jcsb') },
                h3({ class: css('_textsm _fgfg _bold') }, item.title),
                Badge({ variant: 'success', size: 'xs' }, 'LIVE')
              ),
              div({ class: css('_flex _gap2') },
                Badge({ variant: 'outline', size: 'xs' }, item.style),
                Badge({ variant: 'outline', size: 'xs' }, item.mode)
              )
            )
          )
        )
      ),
      div({ class: css('_tc') },
        link({ href: '/showcase', class: css('_nounder') },
          Button({ variant: 'outline' }, 'View All Showcases', icon('arrow-right'))
        )
      )
    )
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add docs/src/sections/showcase-preview.js
git commit -m "feat(docs): add showcase preview section

Homepage teaser with 3 app cards and link to full showcase page.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Rewrite Homepage with 7 Sections

**Files:**
- Modify: `docs/src/pages/home.js`

- [ ] **Step 1: Import new sections**

```javascript
import { VisionComparisonSection } from '../sections/vision-comparison.js';
import { BentoFeaturesSection } from '../sections/bento-features.js';
import { ShowcasePreviewSection } from '../sections/showcase-preview.js';
```

- [ ] **Step 2: Create new VisionHero section**

Replace `BrandHero` with a new `VisionHero` using `d-heading-hero`:

```javascript
function VisionHero() {
  return section({ class: css('_minh[100vh] _relative d-mesh _flex _aic _jcc _px6 _py24') },
    // Decorative orbs
    span({ class: css('aura-orb _w[400px] _h[400px] _top[-10%] _left[-5%] _bg[rgba(254,68,116,0.15)]') }),
    span({ class: css('aura-orb _w[300px] _h[300px] _bottom[10%] _right[-5%] _bg[rgba(10,243,235,0.1)]') }),
    span({ class: css('aura-orb _w[250px] _h[250px] _top[30%] _right[20%] _bg[rgba(101,0,198,0.1)]') }),
    // Content
    div({ class: css('_flex _col _aic _tc _gap8 _relative _z10 _mw[900px]') },
      h1({ class: css('d-heading-hero') }, 'Frameworks were built for humans. Decantr is built for AI.'),
      p({ class: css('_textxl _fgmuted _mw[640px] _lh[1.6]') },
        'The AI-native web framework. Registry-driven generation, signal reactivity, and 100+ components — all designed for LLMs to generate, read, and maintain.'
      ),
      div({ class: css('_flex _gap4 _wrap _jcc') },
        Button({ variant: 'primary', size: 'lg', class: css('aura-glow') }, icon('terminal'), 'npx decantr init'),
        link({ href: '/showcase', class: css('_nounder') },
          Button({ variant: 'outline', size: 'lg' }, 'View Showcase')
        )
      )
    )
  );
}
```

- [ ] **Step 3: Create ProcessSection**

```javascript
function ProcessSection() {
  const stages = [
    { name: 'POUR', desc: 'Describe what you want' },
    { name: 'SETTLE', desc: 'AI decomposes layers' },
    { name: 'CLARIFY', desc: 'Write the Essence' },
    { name: 'DECANT', desc: 'Resolve layout' },
    { name: 'SERVE', desc: 'Generate code' },
    { name: 'AGE', desc: 'Guard against drift' },
  ];

  return section({ class: css('_py16 _px6 _bcborder _borderT _borderB') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap6 _aic') },
      span({ class: css('_textxs _fgmuted _uppercase _tracking[0.15em]') }, 'The Decantation Process'),
      div({ class: css('_flex _wrap _jcc _gap4') },
        ...stages.map((s, i) =>
          div({ class: css('_flex _aic _gap3') },
            div({ class: css('_flex _col _aic') },
              span({ class: css('_textsm _fgprimary _bold') }, s.name),
              span({ class: css('_textxs _fgmuted') }, s.desc)
            ),
            i < stages.length - 1 ? icon('arrow-right', { class: css('_fgmuted/50') }) : null
          )
        )
      )
    )
  );
}
```

- [ ] **Step 4: Update CtaSection to use solid heading**

```javascript
function CtaSection() {
  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _relative d-mesh') },
    span({ class: css('aura-orb _w[300px] _h[300px] _top[10%] _right[-5%] _bg[rgba(254,68,116,0.12)]') }),
    span({ class: css('aura-orb _w[200px] _h[200px] _bottom[20%] _left[-3%] _bg[rgba(10,243,235,0.08)]') }),
    h2({ class: css('_heading1 _fgfg _mw[700px]') }, 'Start building today'),
    p({ class: css('_textlg _fgmuted _mw[540px] _lh[1.6]') },
      'Join the community of developers shipping faster with the AI-native web framework. Free and open source.'
    ),
    div({ class: css('_flex _gap4 _wrap _jcc') },
      Button({ variant: 'primary', size: 'lg', class: css('aura-glow') }, icon('terminal'), 'npx decantr init'),
      a({ href: '#/docs', class: css('_nounder') },
        Button({ variant: 'outline', size: 'lg' }, icon('book-open'), 'Read the Docs')
      )
    )
  );
}
```

- [ ] **Step 5: Rewrite HomePage composition**

```javascript
export function HomePage() {
  return div({ class: css('_flex _col _gap0 _overflow[auto] _flex1 d-page-enter') },
    VisionHero(),           // Section 1: Vision statement
    ProcessSection(),       // Section 2: Decantation process
    VisionComparisonSection(), // Section 3: Code comparison
    BentoFeaturesSection(), // Section 4: Bento features
    ShowcasePreviewSection(), // Section 5: Showcase preview
    CtaSection(),           // Section 6: CTA
    FooterSection()         // Section 7: Footer
  );
}
```

- [ ] **Step 6: Remove unused sections**

Delete or comment out: `AnnouncementBar`, `BrandHero`, `LogoStripSection`, `FeatureGrid`, `CodePreviewSection`, `StatsSection`, `TestimonialWall`, `ShowcaseGallery`, `BrandCta`.

- [ ] **Step 7: Commit**

```bash
git add docs/src/pages/home.js
git commit -m "feat(docs): rewrite homepage with 7-section structure

1. VisionHero with d-heading-hero gradient
2. ProcessSection (Decantation flow)
3. VisionComparisonSection (React vs Essence)
4. BentoFeaturesSection (MCP + stats + features)
5. ShowcasePreviewSection (3 app cards)
6. CtaSection (solid heading)
7. FooterSection

Removes: announcement bar, logo strip, testimonials, old feature grid.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Rewrite README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write new README**

```markdown
# decantr

[![CI](https://github.com/decantr-ai/decantr/actions/workflows/ci.yml/badge.svg)](https://github.com/decantr-ai/decantr/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/decantr)](https://www.npmjs.com/package/decantr)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**The AI-native web framework.** Zero dependencies. Native JS/CSS/HTML.

> Frameworks were designed for humans. Decantr is designed for AI.

## Why Decantr?

Traditional frameworks (React, Vue, Angular) were built for humans to write. AI doesn't think in JSX and hooks — it thinks in registries, tokens, and compositions. Decantr speaks AI's language: a machine-readable registry, atomic CSS tokens, and a structured generation pipeline that turns plain-English descriptions into production apps.

## The Decantation Process

```
POUR  →  SETTLE  →  CLARIFY  →  DECANT  →  SERVE  →  AGE
 you      AI         AI+you      AI         AI        ongoing
describe  decomposes crystallizes resolves   generates  guards
intent    layers     the Essence  layout     code       against drift
```

Every app starts as a conversation. You describe what you want, the AI decomposes it into layers (Terroir, Vintage, Character, Structure, Tannins), writes the Essence file, and generates code — all validated against Cork rules that prevent drift.

## See It In Action

| SaaS Dashboard | eCommerce Admin | Gaming Platform |
|----------------|-----------------|-----------------|
| 14-page analytics | 15-page merchant panel | Guild hub with leaderboards |
| [View Live →](https://decantr.ai/showcase/saas-dashboard/) | [View Live →](https://decantr.ai/showcase/ecommerce-admin/) | [View Live →](https://decantr.ai/showcase/gaming-platform/) |

## Quick Start

```bash
npx decantr init my-app
cd my-app && npm install
npx decantr dev
```

Then tell your AI: *"Build me a SaaS dashboard with KPI cards, charts, and a data table."*

## Learn More

- [Documentation](https://decantr.ai/docs) — Tutorial and cookbook
- [Showcase](https://decantr.ai/showcase) — Live demos and component gallery
- [MCP Server](https://decantr.ai/docs/mcp) — AI tool integration
- [Community Registry](https://decantr.ai/docs/registry) — Styles, patterns, recipes

## Requirements

Node.js >= 20.0.0

## License

MIT
```

- [ ] **Step 2: Verify line count**

Run: `wc -l README.md` — should be ~80-100 lines.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README to ~80 lines

Focuses on AI-native positioning, Decantation Process overview,
showcase thumbnails, and fast path. Moves detailed docs to website.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Final Integration Test

**Files:**
- Test: Run dev server and verify all changes

- [ ] **Step 1: Start dev server**

```bash
cd docs && npm run dev
```

- [ ] **Step 2: Verify homepage**

Navigate to `http://localhost:4200/`:
- [ ] Vision hero with gradient headline
- [ ] Decantation process strip
- [ ] Code comparison section
- [ ] Bento features with MCP preview
- [ ] Showcase preview with 3 cards
- [ ] CTA with solid heading
- [ ] Footer

- [ ] **Step 3: Verify navigation**

- [ ] Only 3 nav items: Showcase, Docs, GitHub
- [ ] Logo links to home
- [ ] Showcase links to /showcase
- [ ] GitHub opens in new tab

- [ ] **Step 4: Verify showcase page**

Navigate to `http://localhost:4200/#/showcase`:
- [ ] Tabs render (Apps, Components, Themes)
- [ ] Apps tab shows live showcases
- [ ] Components tab shows category overview
- [ ] Themes tab shows theme cards

- [ ] **Step 5: Verify patterns in Explorer**

Navigate to `http://localhost:4200/#/explorer`:
- [ ] hero pattern shows new `vision` preset
- [ ] code-comparison pattern appears
- [ ] bento-features pattern appears
- [ ] showcase-card pattern appears

- [ ] **Step 6: Run build**

```bash
npm run build
```

Verify no errors.

- [ ] **Step 7: Commit integration verification**

```bash
git add -A
git commit -m "chore: verify v1.0 Drive to 1.0 Phase 1 integration

All sections render correctly, navigation simplified,
patterns registered, README condensed.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Total Tasks:** 13
**Estimated Time:** 2-3 hours

**Phase 1 Deliverables:**
1. 4 new patterns (hero:vision preset, code-comparison, bento-features, showcase-card)
2. Hero-only gradient theme class (d-heading-hero)
3. Simplified navigation (Logo | Showcase | Docs | GitHub)
4. New tabbed Showcase page
5. Rewritten 7-section Homepage
6. Condensed ~80-line README

**Not Included (Phase 2):**
- Anatomy viewer pattern
- Ecosystem tab with registry
- Patterns tab in showcase
- Docs restructure
- Explorer removal from nav
