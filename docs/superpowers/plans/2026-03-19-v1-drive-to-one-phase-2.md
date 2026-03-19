# v1.0 "Drive to 1.0" Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Decantr v1.0 vision with interactive anatomy viewer, ecosystem tab, docs restructure focused on prompt workflows, and explorer de-emphasis.

**Architecture:** Two new registry patterns (`anatomy-viewer`, `ecosystem-grid`) power the new Showcase tabs. Docs navigation restructured around prompt-first workflow with Explorer moved to "Dev Tools" section. All implementations use Decantr patterns and components — no hand-rolled HTML/CSS.

**Tech Stack:** Decantr framework (tags, css, components, patterns), registry JSON patterns, auradecantism theme

**Spec:** [docs/superpowers/specs/2026-03-19-v1-drive-to-one-design.md](../specs/2026-03-19-v1-drive-to-one-design.md)

---

## File Structure

### New Files
| Path | Purpose |
|------|---------|
| `src/registry/patterns/anatomy-viewer.json` | Pattern registry entry for interactive component breakdown |
| `src/registry/patterns/ecosystem-grid.json` | Pattern registry entry for community registry display |
| `docs/src/sections/anatomy-viewer.js` | Anatomy viewer component implementation |
| `docs/src/sections/ecosystem-grid.js` | Ecosystem grid component implementation |
| `docs/src/data/patterns-data.js` | Curated pattern data for Patterns tab |
| `docs/src/data/ecosystem-data.js` | Mock community registry data for Ecosystem tab |

### Modified Files
| Path | Changes |
|------|---------|
| `docs/src/pages/showcase.js` | Add Patterns and Ecosystem tabs |
| `docs/src/layouts/docs-layout.js` | Restructure nav: "Prompt Workflow" section, "Dev Tools" section with Explorer link |
| `docs/src/components/nav-header.js` | Remove Explorer from main nav (keep only Logo, Showcase, Docs, GitHub) |
| `src/registry/patterns/index.json` | Register new patterns |

---

## Task 1: Create anatomy-viewer Pattern Registry Entry

**Files:**
- Create: `src/registry/patterns/anatomy-viewer.json`
- Modify: `src/registry/patterns/index.json`

- [ ] **Step 1: Read existing pattern index**

Run: `cat src/registry/patterns/index.json | head -30`

- [ ] **Step 2: Create anatomy-viewer.json pattern**

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "anatomy-viewer",
  "name": "Anatomy Viewer",
  "description": "Interactive component breakdown with numbered hotspots on visual preview, component list, atoms used, and code signatures. Used for pattern documentation and education.",
  "components": [
    "Card",
    "Badge",
    "Tabs",
    "Button",
    "icon"
  ],
  "default_preset": "split",
  "presets": {
    "split": {
      "description": "Two-column layout: visual preview with hotspots (left), breakdown panel (right)",
      "components": ["Card", "Badge", "Tabs", "Button", "icon"],
      "blend": {
        "layout": "row",
        "atoms": "_grid _gc1 _lg:gc2 _gap6 _p6",
        "slots": {
          "preview": "Visual pattern preview with numbered hotspot overlays",
          "component-list": "List of all components in pattern with selection state",
          "detail-panel": "Selected component details: name, code signature, atoms used",
          "layout-atoms": "Pattern-level layout atoms display"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { createSignal } from 'decantr/state';\nimport { Card, Badge, Button, icon } from 'decantr/components';",
        "example": "function AnatomyViewer({ pattern }) {\n  const { div, h3, span, code, ul, li } = tags;\n  const [selected, setSelected] = createSignal(null);\n\n  return div({ class: css('_grid _gc1 _lg:gc2 _gap6') },\n    // Left: Preview with hotspots\n    Card({ class: css('_relative _overflow[hidden]') },\n      div({ class: css('_bgmuted/10 _p6 _flex _center _minh[300px]') },\n        // Pattern preview rendered here with numbered overlays\n        span({ class: css('_fgmuted') }, 'Pattern Preview')\n      )\n    ),\n    // Right: Breakdown panel\n    Card({},\n      Card.Header({}, h3({ class: css('_heading5') }, 'Components')),\n      Card.Body({},\n        ul({ class: css('_flex _col _gap2') },\n          ...pattern.components.map((c, i) =>\n            li({ \n              class: css('_flex _aic _gap2 _p2 _r1 _cursor[pointer] _h:bgmuted/10'),\n              onclick: () => setSelected(c)\n            },\n              Badge({ variant: 'outline', size: 'sm' }, String(i + 1)),\n              span({ class: css('_textsm') }, c)\n            )\n          )\n        )\n      )\n    )\n  );\n}"
      }
    }
  },
  "default_blend": {
    "layout": "row",
    "atoms": "_grid _gc1 _lg:gc2 _gap6",
    "slots": {
      "preview": "Visual pattern preview with numbered hotspot overlays",
      "breakdown": "Component list, atoms, code signatures"
    }
  },
  "code": {
    "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge } from 'decantr/components';",
    "example": "function AnatomyViewer({ pattern }) {\n  const { div, h3, span } = tags;\n  return div({ class: css('_grid _gc1 _lg:gc2 _gap6') },\n    Card({}, 'Preview'),\n    Card({}, 'Breakdown')\n  );\n}"
  }
}
```

- [ ] **Step 3: Add to patterns index**

Add `"anatomy-viewer"` to the patterns array in `src/registry/patterns/index.json`.

- [ ] **Step 4: Validate pattern JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/registry/patterns/anatomy-viewer.json'))" && echo "Valid JSON"`
Expected: "Valid JSON"

- [ ] **Step 5: Commit**

```bash
git add src/registry/patterns/anatomy-viewer.json src/registry/patterns/index.json
git commit -m "feat(registry): add anatomy-viewer pattern for interactive component breakdown"
```

---

## Task 2: Create ecosystem-grid Pattern Registry Entry

**Files:**
- Create: `src/registry/patterns/ecosystem-grid.json`
- Modify: `src/registry/patterns/index.json`

- [ ] **Step 1: Create ecosystem-grid.json pattern**

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "ecosystem-grid",
  "name": "Ecosystem Grid",
  "description": "Community registry display with contributor attribution, type chips, download counts, and publish CTAs. Used for showcasing community contributions.",
  "components": [
    "Card",
    "Badge",
    "Avatar",
    "Chip",
    "Button",
    "icon"
  ],
  "default_preset": "standard",
  "presets": {
    "standard": {
      "description": "Responsive grid of community contribution cards",
      "components": ["Card", "Badge", "Avatar", "Chip", "Button", "icon"],
      "blend": {
        "layout": "grid",
        "atoms": "_grid _gc1 _md:gc2 _lg:gc3 _gap6",
        "slots": {
          "header": "Section header with title and 'Publish Your Own' CTA",
          "cards": "Grid of contribution cards with preview, type chip, attribution, downloads",
          "footer": "Browse Registry CTA"
        }
      },
      "code": {
        "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge, Avatar, Chip, Button, icon } from 'decantr/components';",
        "example": "function EcosystemGrid({ items }) {\n  const { div, h3, span, a } = tags;\n\n  return div({ class: css('_flex _col _gap8') },\n    // Header\n    div({ class: css('_flex _jcsb _aic') },\n      h3({ class: css('_heading4') }, 'Community Registry'),\n      Button({ variant: 'outline' }, icon('plus'), 'Publish Your Own')\n    ),\n    // Grid\n    div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6') },\n      ...items.map(item =>\n        Card({ hoverable: true, class: css('d-glass') },\n          Card.Body({ class: css('_flex _col _gap3') },\n            div({ class: css('_flex _jcsb _aic') },\n              Chip({ size: 'sm', variant: item.type === 'style' ? 'primary' : 'secondary' }, item.type),\n              span({ class: css('_textsm _fgmuted') }, `${item.downloads} downloads`)\n            ),\n            h3({ class: css('_heading5') }, item.name),\n            span({ class: css('_textsm _fgmuted') }, item.description),\n            div({ class: css('_flex _aic _gap2 _mt[auto] _pt3 _borderT _bcborder') },\n              Avatar({ src: item.author.avatar, size: 'xs' }),\n              span({ class: css('_textsm _fgmuted') }, `@${item.author.username}`)\n            )\n          )\n        )\n      )\n    ),\n    // Footer CTA\n    div({ class: css('_tc') },\n      Button({ variant: 'primary' }, 'Browse Full Registry', icon('arrow-right'))\n    )\n  );\n}"
      }
    }
  },
  "default_blend": {
    "layout": "grid",
    "atoms": "_grid _gc1 _md:gc2 _lg:gc3 _gap6",
    "slots": {
      "cards": "Grid of community contribution cards"
    }
  },
  "code": {
    "imports": "import { tags } from 'decantr/tags';\nimport { css } from 'decantr/css';\nimport { Card, Badge, Avatar, Chip, Button, icon } from 'decantr/components';",
    "example": "function EcosystemGrid({ items }) {\n  const { div } = tags;\n  return div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6') }, ...items.map(i => Card({}, i.name)));\n}"
  }
}
```

- [ ] **Step 2: Add to patterns index**

Add `"ecosystem-grid"` to the patterns array in `src/registry/patterns/index.json`.

- [ ] **Step 3: Validate pattern JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/registry/patterns/ecosystem-grid.json'))" && echo "Valid JSON"`
Expected: "Valid JSON"

- [ ] **Step 4: Commit**

```bash
git add src/registry/patterns/ecosystem-grid.json src/registry/patterns/index.json
git commit -m "feat(registry): add ecosystem-grid pattern for community registry display"
```

---

## Task 3: Create Patterns Data Module

**Files:**
- Create: `docs/src/data/patterns-data.js`

- [ ] **Step 1: Create curated patterns data**

```js
/**
 * Curated pattern data for Showcase Patterns tab
 * Each pattern includes metadata for anatomy viewer display
 */
export const featuredPatterns = [
  {
    id: 'hero',
    name: 'Hero Section',
    preset: 'vision',
    description: 'Full-width hero with gradient headline, value prop, and dual CTAs',
    components: ['Button', 'icon'],
    atoms: ['_flex', '_col', '_aic', '_tc', '_gap8', '_py24', '_px6', '_minh[100vh]', '_jcc', '_relative'],
    preview: '/images/patterns/hero-vision.svg',
    slots: [
      { id: 'decoration', label: 'Decorative orbs', x: 10, y: 15 },
      { id: 'headline', label: 'Display heading', x: 50, y: 35 },
      { id: 'description', label: 'Value prop', x: 50, y: 55 },
      { id: 'cta-group', label: 'CTA buttons', x: 50, y: 75 },
    ],
  },
  {
    id: 'bento-features',
    name: 'Bento Features',
    preset: 'default',
    description: 'Varied card sizes with hero feature prominence and stats',
    components: ['Card', 'Badge', 'icon'],
    atoms: ['_grid', '_gc1', '_md:gc2', '_lg:gc4', '_gap4', '_p6'],
    preview: '/images/patterns/bento-features.svg',
    slots: [
      { id: 'hero-card', label: 'Hero feature (2x2)', x: 25, y: 40 },
      { id: 'stat-cards', label: 'Stat cards', x: 75, y: 25 },
      { id: 'feature-row', label: 'Supporting features', x: 50, y: 85 },
    ],
  },
  {
    id: 'data-table',
    name: 'Data Table',
    preset: 'default',
    description: 'Sortable, filterable table with pagination and row actions',
    components: ['Card', 'Input', 'Button', 'Badge', 'Checkbox', 'Dropdown', 'Pagination'],
    atoms: ['_flex', '_col', '_gap4', '_wfull'],
    preview: '/images/patterns/data-table.svg',
    slots: [
      { id: 'toolbar', label: 'Search + filters', x: 50, y: 10 },
      { id: 'header', label: 'Column headers', x: 50, y: 25 },
      { id: 'rows', label: 'Data rows', x: 50, y: 55 },
      { id: 'pagination', label: 'Pagination', x: 50, y: 90 },
    ],
  },
  {
    id: 'card-grid',
    name: 'Card Grid',
    preset: 'product',
    description: 'Responsive grid of product/content cards with metadata',
    components: ['Card', 'Badge', 'Button', 'Avatar', 'icon'],
    atoms: ['_grid', '_gc1', '_md:gc2', '_lg:gc3', '_gap6'],
    preview: '/images/patterns/card-grid.svg',
    slots: [
      { id: 'image', label: 'Card image', x: 50, y: 25 },
      { id: 'badges', label: 'Status badges', x: 80, y: 45 },
      { id: 'content', label: 'Title + description', x: 50, y: 65 },
      { id: 'footer', label: 'Actions', x: 50, y: 90 },
    ],
  },
  {
    id: 'filter-bar',
    name: 'Filter Bar',
    preset: 'default',
    description: 'Horizontal filter controls with search, dropdowns, and chips',
    components: ['Input', 'Select', 'Chip', 'Button', 'icon'],
    atoms: ['_flex', '_wrap', '_gap3', '_aic', '_p4', '_bgmuted/5', '_r2'],
    preview: '/images/patterns/filter-bar.svg',
    slots: [
      { id: 'search', label: 'Search input', x: 20, y: 50 },
      { id: 'filters', label: 'Filter dropdowns', x: 50, y: 50 },
      { id: 'active-chips', label: 'Active filter chips', x: 80, y: 50 },
    ],
  },
  {
    id: 'kpi-grid',
    name: 'KPI Grid',
    preset: 'default',
    description: 'Dashboard metrics with trend indicators and sparklines',
    components: ['Card', 'Badge', 'icon', 'Sparkline'],
    atoms: ['_grid', '_gc1', '_sm:gc2', '_lg:gc4', '_gap4'],
    preview: '/images/patterns/kpi-grid.svg',
    slots: [
      { id: 'label', label: 'Metric label', x: 50, y: 20 },
      { id: 'value', label: 'Value + trend', x: 50, y: 50 },
      { id: 'sparkline', label: 'Sparkline chart', x: 50, y: 80 },
    ],
  },
];
```

- [ ] **Step 2: Verify module syntax**

Run: `node --check docs/src/data/patterns-data.js`
Expected: No output (valid syntax)

- [ ] **Step 3: Commit**

```bash
git add docs/src/data/patterns-data.js
git commit -m "feat(docs): add curated patterns data for anatomy viewer"
```

---

## Task 4: Create Ecosystem Data Module

**Files:**
- Create: `docs/src/data/ecosystem-data.js`

- [ ] **Step 1: Create mock ecosystem data**

```js
/**
 * Mock community registry data for Ecosystem tab
 * Simulates what the real registry API would return
 */
export const ecosystemItems = [
  {
    id: 'retro-style',
    name: 'Retro',
    type: 'style',
    description: 'Synthwave-inspired with neon accents and CRT effects',
    downloads: 2847,
    author: { username: 'synthdev', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=synthdev' },
  },
  {
    id: 'bioluminescent-style',
    name: 'Bioluminescent',
    type: 'style',
    description: 'Deep sea glow with organic gradients and subtle animations',
    downloads: 1923,
    author: { username: 'oceanix', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=oceanix' },
  },
  {
    id: 'kanban-pattern',
    name: 'Kanban Board',
    type: 'pattern',
    description: 'Drag-and-drop task board with swimlanes and WIP limits',
    downloads: 4521,
    author: { username: 'agiledev', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=agiledev' },
  },
  {
    id: 'chat-interface-pattern',
    name: 'Chat Interface',
    type: 'pattern',
    description: 'Real-time messaging with typing indicators and reactions',
    downloads: 3156,
    author: { username: 'msgmaster', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=msgmaster' },
  },
  {
    id: 'gaming-platform-archetype',
    name: 'Gaming Platform',
    type: 'archetype',
    description: 'Full gaming dashboard with leaderboards, achievements, and profiles',
    downloads: 1284,
    author: { username: 'gamecraft', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=gamecraft' },
  },
  {
    id: 'launchpad-recipe',
    name: 'Launchpad',
    type: 'recipe',
    description: 'Startup-focused visual language with vibrant CTAs',
    downloads: 2103,
    author: { username: 'founderhq', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=founderhq' },
  },
  {
    id: 'timeline-pattern',
    name: 'Timeline',
    type: 'pattern',
    description: 'Vertical timeline with milestones and collapsible details',
    downloads: 1876,
    author: { username: 'chronodev', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=chronodev' },
  },
  {
    id: 'dopamine-style',
    name: 'Dopamine',
    type: 'style',
    description: 'Playful, high-energy design with bold colors and animations',
    downloads: 1542,
    author: { username: 'happyui', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=happyui' },
  },
  {
    id: 'editorial-style',
    name: 'Editorial',
    type: 'style',
    description: 'Magazine-inspired typography and layouts for content sites',
    downloads: 987,
    author: { username: 'typesmith', avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=typesmith' },
  },
];

export const ecosystemStats = {
  totalItems: 127,
  totalDownloads: 48293,
  contributors: 43,
};
```

- [ ] **Step 2: Verify module syntax**

Run: `node --check docs/src/data/ecosystem-data.js`
Expected: No output (valid syntax)

- [ ] **Step 3: Commit**

```bash
git add docs/src/data/ecosystem-data.js
git commit -m "feat(docs): add mock ecosystem data for community registry tab"
```

---

## Task 5: Implement Anatomy Viewer Section Component

**Files:**
- Create: `docs/src/sections/anatomy-viewer.js`

- [ ] **Step 1: Create anatomy viewer component**

```js
/**
 * Anatomy Viewer — Interactive pattern breakdown
 * Shows visual preview with numbered hotspots + component/atom details
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { Card, Badge, Button, icon } from 'decantr/components';

const { div, h3, h4, span, ul, li, code, img } = tags;

export function AnatomyViewer({ pattern }) {
  const [selectedSlot, setSelectedSlot] = createSignal(null);

  // Preview panel with hotspots
  const previewPanel = Card({ class: css('_relative _overflow[hidden] _flex1') },
    div({ class: css('_bgmuted/5 _p6 _flex _center _minh[320px] _relative') },
      // Pattern preview image
      pattern.preview
        ? img({ src: pattern.preview, alt: pattern.name, class: css('_maxw[100%] _maxh[280px] _object[contain]') })
        : div({ class: css('_flex _center _w[200px] _h[200px] _bgmuted/10 _r2') },
            icon('layout', { size: '3rem', class: css('_fgmuted/50') })
          ),
      // Hotspot overlays
      ...(pattern.slots || []).map((slot, i) => {
        const hotspot = div({
          class: css('_absolute _cursor[pointer] _trans[transform_0.15s_ease]'),
          style: `left: ${slot.x}%; top: ${slot.y}%; transform: translate(-50%, -50%);`,
          onclick: () => setSelectedSlot(slot),
        },
          span({
            class: css('_flex _center _w8 _h8 _rfull _bgprimary _fgfg _textsm _bold _shadow[0_2px_8px_rgba(0,0,0,0.3)] _h:scale[1.1]')
          }, String(i + 1))
        );

        // Highlight on selection
        createEffect(() => {
          const sel = selectedSlot();
          hotspot.classList.toggle('aura-glow', sel?.id === slot.id);
        });

        return hotspot;
      })
    )
  );

  // Details panel
  const detailsPanel = Card({ class: css('_flex1 _minh[320px]') },
    Card.Header({ class: css('_flex _jcsb _aic') },
      h3({ class: css('_heading5') }, pattern.name),
      pattern.preset ? Badge({ variant: 'outline', size: 'sm' }, pattern.preset) : null
    ),
    Card.Body({ class: css('_flex _col _gap4') },
      // Description
      span({ class: css('_textsm _fgmuted _lh[1.6]') }, pattern.description),

      // Components section
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_caption _fgmutedfg _uppercase _ls[0.05em]') }, 'Components'),
        div({ class: css('_flex _wrap _gap2') },
          ...pattern.components.map(c => Badge({ variant: 'secondary', size: 'sm' }, c))
        )
      ),

      // Atoms section
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_caption _fgmutedfg _uppercase _ls[0.05em]') }, 'Layout Atoms'),
        div({ class: css('_flex _wrap _gap1') },
          ...pattern.atoms.map(a => code({ class: css('_textxs _bgmuted/20 _px1 _py[2px] _r1 _fgmuted') }, a))
        )
      ),

      // Slots section
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_caption _fgmutedfg _uppercase _ls[0.05em]') }, 'Slots'),
        ul({ class: css('_flex _col _gap1') },
          ...(pattern.slots || []).map((slot, i) => {
            const item = li({
              class: css('_flex _aic _gap2 _p2 _r1 _cursor[pointer] _trans[background_0.15s_ease] _h:bgmuted/10'),
              onclick: () => setSelectedSlot(slot),
            },
              Badge({ variant: 'outline', size: 'sm' }, String(i + 1)),
              span({ class: css('_textsm') }, slot.label)
            );

            createEffect(() => {
              const sel = selectedSlot();
              item.classList.toggle(css('_bgprimary/10'), sel?.id === slot.id);
            });

            return item;
          })
        )
      )
    )
  );

  return div({ class: css('_grid _gc1 _lg:gc2 _gap6') },
    previewPanel,
    detailsPanel
  );
}
```

- [ ] **Step 2: Verify module syntax**

Run: `node --check docs/src/sections/anatomy-viewer.js`
Expected: No output (valid syntax)

- [ ] **Step 3: Commit**

```bash
git add docs/src/sections/anatomy-viewer.js
git commit -m "feat(docs): implement anatomy viewer section component"
```

---

## Task 6: Implement Ecosystem Grid Section Component

**Files:**
- Create: `docs/src/sections/ecosystem-grid.js`

- [ ] **Step 1: Create ecosystem grid component**

```js
/**
 * Ecosystem Grid — Community registry showcase
 * Displays community contributions with attribution and download stats
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Card, Badge, Avatar, Chip, Button, icon } from 'decantr/components';

const { div, h3, h4, span, a } = tags;

const TYPE_COLORS = {
  style: 'primary',
  pattern: 'secondary',
  archetype: 'success',
  recipe: 'warning',
};

function EcosystemCard({ item }) {
  return Card({ hoverable: true, class: css('d-glass') },
    Card.Body({ class: css('_flex _col _gap3') },
      // Header: type + downloads
      div({ class: css('_flex _jcsb _aic') },
        Chip({ size: 'sm', variant: TYPE_COLORS[item.type] || 'outline' }, item.type),
        div({ class: css('_flex _aic _gap1') },
          icon('download', { size: '0.875rem', class: css('_fgmuted') }),
          span({ class: css('_textsm _fgmuted') }, item.downloads.toLocaleString())
        )
      ),
      // Title + description
      h3({ class: css('_heading5 _fgfg') }, item.name),
      span({ class: css('_textsm _fgmuted _lh[1.5]') }, item.description),
      // Footer: author
      div({ class: css('_flex _aic _gap2 _mt[auto] _pt3 _borderT _bcborder') },
        Avatar({ src: item.author.avatar, size: 'xs' }),
        span({ class: css('_textsm _fgmuted') }, `@${item.author.username}`)
      )
    )
  );
}

export function EcosystemGrid({ items, stats }) {
  return div({ class: css('_flex _col _gap8 _py8') },
    // Header
    div({ class: css('_flex _col _gap4 _tc _aic') },
      h3({ class: css('_heading4 _fgfg') }, 'Community Registry'),
      span({ class: css('_fgmuted') },
        `${stats.totalItems} contributions from ${stats.contributors} developers`
      ),
      div({ class: css('_flex _gap3') },
        Button({ variant: 'primary' }, icon('search'), 'Browse Registry'),
        Button({ variant: 'outline' }, icon('plus'), 'Publish Your Own')
      )
    ),

    // Grid
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6') },
      ...items.map(item => EcosystemCard({ item }))
    ),

    // Footer CTA
    div({ class: css('_tc _pt4') },
      span({ class: css('_fgmuted _textsm') },
        'Styles, patterns, archetypes, and recipes — all installable via '
      ),
      span({ class: css('_fgprimary _textsm _mono') }, 'npx decantr registry add')
    )
  );
}
```

- [ ] **Step 2: Verify module syntax**

Run: `node --check docs/src/sections/ecosystem-grid.js`
Expected: No output (valid syntax)

- [ ] **Step 3: Commit**

```bash
git add docs/src/sections/ecosystem-grid.js
git commit -m "feat(docs): implement ecosystem grid section component"
```

---

## Task 7: Add Patterns and Ecosystem Tabs to Showcase Page

**Files:**
- Modify: `docs/src/pages/showcase.js`

- [ ] **Step 1: Read current showcase page**

Run: `cat docs/src/pages/showcase.js`

- [ ] **Step 2: Import new modules and add tabs**

Add imports at top (after existing imports):
```js
import { createSignal, createEffect } from 'decantr/state';
import { AnatomyViewer } from '../sections/anatomy-viewer.js';
import { EcosystemGrid } from '../sections/ecosystem-grid.js';
import { featuredPatterns } from '../data/patterns-data.js';
import { ecosystemItems, ecosystemStats } from '../data/ecosystem-data.js';
```

Add PatternsTab function before Page Composition section (around line 106):
```js
// ─── Patterns Tab ────────────────────────────────────────────────
function PatternsTab() {
  const [activePattern, setActivePattern] = createSignal(featuredPatterns[0]);

  // Container for anatomy viewer - will be reactively updated
  const anatomyContainer = div({ class: css('_mt4') });

  // Render anatomy viewer when pattern changes
  createEffect(() => {
    const pattern = activePattern();
    anatomyContainer.innerHTML = '';
    anatomyContainer.appendChild(AnatomyViewer({ pattern }));
  });

  return div({ class: css('_flex _col _gap6 _py8') },
    // Pattern selector
    div({ class: css('_flex _wrap _gap2 _jcc') },
      ...featuredPatterns.map(p => {
        const btn = Button({
          variant: 'outline',
          size: 'sm',
          onclick: () => setActivePattern(p),
        }, p.name);

        createEffect(() => {
          const isActive = activePattern().id === p.id;
          btn.classList.toggle(css('_bgprimary/20 _bcprimary'), isActive);
        });

        return btn;
      })
    ),
    // Anatomy viewer - reactive container
    anatomyContainer
  );
}
```

Add EcosystemTab function:
```js
// ─── Ecosystem Tab ───────────────────────────────────────────────
function EcosystemTab() {
  return EcosystemGrid({ items: ecosystemItems, stats: ecosystemStats });
}
```

Update Tabs component to include new tabs:
```js
Tabs({
  tabs: [
    { id: 'apps', label: 'Apps', content: () => AppsTab() },
    { id: 'patterns', label: 'Patterns', content: () => PatternsTab() },
    { id: 'components', label: 'Components', content: () => ComponentsTab() },
    { id: 'themes', label: 'Themes', content: () => ThemesTab() },
    { id: 'ecosystem', label: 'Ecosystem', content: () => EcosystemTab() },
  ],
  active: 'apps',
  class: css('_jcc'),
})
```

- [ ] **Step 3: Verify imports are complete**

The imports added in Step 2 include `createSignal` and `createEffect` from `decantr/state`. No additional imports needed.

- [ ] **Step 4: Verify syntax**

Run: `node --check docs/src/pages/showcase.js`
Expected: No output (valid syntax)

- [ ] **Step 5: Commit**

```bash
git add docs/src/pages/showcase.js
git commit -m "feat(showcase): add Patterns and Ecosystem tabs with anatomy viewer"
```

---

## Task 8: Restructure Docs Navigation

**Files:**
- Modify: `docs/src/layouts/docs-layout.js`

- [ ] **Step 1: Read current docs layout**

Run: `cat docs/src/layouts/docs-layout.js`

- [ ] **Step 2: Restructure NAV_SECTIONS**

Use Edit tool to replace the existing NAV_SECTIONS constant (lines 15-60).

- **old_string:** (the entire existing NAV_SECTIONS from `const NAV_SECTIONS = [` through the closing `];`)
- **new_string:**
```js
const NAV_SECTIONS = [
  {
    label: 'Getting Started',
    items: [
      { id: 'overview', label: 'Overview', path: '/docs' },
    ],
  },
  {
    label: 'Tutorial',
    items: [
      { id: 'tut-01', label: '1. Install & Setup', path: '/docs/tutorial/01-install' },
      { id: 'tut-02', label: '2. Your First Page', path: '/docs/tutorial/02-first-page' },
      { id: 'tut-03', label: '3. Components', path: '/docs/tutorial/03-components' },
      { id: 'tut-04', label: '4. Styling', path: '/docs/tutorial/04-styling' },
      { id: 'tut-05', label: '5. State', path: '/docs/tutorial/05-state' },
      { id: 'tut-06', label: '6. Routing', path: '/docs/tutorial/06-routing' },
      { id: 'tut-07', label: '7. Data Fetching', path: '/docs/tutorial/07-data' },
      { id: 'tut-08', label: '8. Build & Deploy', path: '/docs/tutorial/08-deploy' },
    ],
  },
  {
    label: 'Prompt Workflow',
    items: [
      { id: 'pw-essence', label: 'The Essence File', path: '/docs/workflow/essence' },
      { id: 'pw-decantation', label: 'Decantation Process', path: '/docs/workflow/decantation' },
      { id: 'pw-mcp', label: 'Using MCP Server', path: '/docs/workflow/mcp' },
      { id: 'pw-prompts', label: 'Prompt Templates', path: '/docs/workflow/prompts' },
    ],
  },
  {
    label: 'Cookbook',
    items: [
      { id: 'ck-dashboard', label: 'SaaS Dashboard', path: '/docs/cookbook/dashboard' },
      { id: 'ck-auth', label: 'Authentication', path: '/docs/cookbook/auth' },
      { id: 'ck-i18n', label: 'Internationalization', path: '/docs/cookbook/i18n' },
      { id: 'ck-data', label: 'Data Fetching', path: '/docs/cookbook/data-fetching' },
      { id: 'ck-forms', label: 'Forms', path: '/docs/cookbook/forms' },
    ],
  },
  {
    label: 'Dev Tools',
    items: [
      { id: 'dt-explorer', label: 'Explorer', path: '/explorer' },
      { id: 'dt-cli', label: 'CLI Reference', path: '/docs/tools/cli' },
      { id: 'dt-config', label: 'Configuration', path: '/docs/tools/config' },
    ],
  },
];
```

- [ ] **Step 3: Verify syntax**

Run: `node --check docs/src/layouts/docs-layout.js`
Expected: No output (valid syntax)

- [ ] **Step 4: Commit**

```bash
git add docs/src/layouts/docs-layout.js
git commit -m "feat(docs): restructure nav with Prompt Workflow and Dev Tools sections"
```

**Note:** The "Prompt Workflow" section links to pages that don't exist yet (`/docs/workflow/*`). These nav items will show in the sidebar but clicking them will 404. Content creation for these pages is out of scope for Phase 2 — they should be created in a follow-up task. The nav structure is in place to demonstrate the intended IA.

---

## Task 9: Update Main Navigation Header

**Files:**
- Modify: `docs/src/components/nav-header.js`

- [ ] **Step 1: Read current nav header**

Run: `cat docs/src/components/nav-header.js`

- [ ] **Step 2: Update navigation links**

The nav should have: Logo → Home, Showcase, Docs, GitHub (external).

Use Edit tool with:
- **old_string:**
```js
      // Right: Nav links
      div({ class: css('_flex _row _aic _gap6') },
        link({ href: '/', exact: true, activeClass: 'ds-nav-active', class: 'ds-nav-link' }, 'Home'),
      ),
```
- **new_string:**
```js
      // Right: Nav links
      div({ class: css('_flex _row _aic _gap6') },
        link({ href: '/showcase', activeClass: 'ds-nav-active', class: 'ds-nav-link' }, 'Showcase'),
        link({ href: '/docs', activeClass: 'ds-nav-active', class: 'ds-nav-link' }, 'Docs'),
        a({
          href: 'https://github.com/decantr-ai/decantr',
          target: '_blank',
          rel: 'noopener',
          class: css('ds-nav-link _flex _aic _gap1')
        },
          'GitHub',
          icon('external-link', { size: '0.875rem' })
        )
      ),
```

- [ ] **Step 3: Add missing imports**

Add at top if not present:
```js
import { icon } from 'decantr/components';
```

And add `a` to tags destructuring:
```js
const { nav, div, img, span, a } = tags;
```

- [ ] **Step 4: Verify syntax**

Run: `node --check docs/src/components/nav-header.js`
Expected: No output (valid syntax)

- [ ] **Step 5: Commit**

```bash
git add docs/src/components/nav-header.js
git commit -m "feat(nav): update header with Showcase, Docs, GitHub links"
```

---

## Task 10: Create Placeholder Pattern Preview Images

**Files:**
- Create: `docs/public/images/patterns/` directory and placeholder SVGs

- [ ] **Step 1: Create patterns directory**

Run: `mkdir -p docs/public/images/patterns`

- [ ] **Step 2: Create placeholder SVG files**

Create simple placeholder SVGs for each featured pattern. These can be replaced with proper previews later.

`docs/public/images/patterns/hero-vision.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="100" y="80" width="200" height="24" rx="4" fill="#4a4a6a"/>
  <rect x="120" y="120" width="160" height="12" rx="2" fill="#3a3a5a"/>
  <rect x="140" y="140" width="120" height="12" rx="2" fill="#3a3a5a"/>
  <rect x="130" y="180" width="60" height="32" rx="4" fill="#7c3aed"/>
  <rect x="200" y="180" width="70" height="32" rx="4" stroke="#7c3aed" stroke-width="2"/>
</svg>
```

`docs/public/images/patterns/bento-features.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="20" y="20" width="180" height="160" rx="8" fill="#2a2a4e"/>
  <rect x="210" y="20" width="80" height="75" rx="8" fill="#2a2a4e"/>
  <rect x="300" y="20" width="80" height="75" rx="8" fill="#2a2a4e"/>
  <rect x="210" y="105" width="80" height="75" rx="8" fill="#2a2a4e"/>
  <rect x="300" y="105" width="80" height="75" rx="8" fill="#2a2a4e"/>
  <rect x="20" y="200" width="115" height="80" rx="8" fill="#2a2a4e"/>
  <rect x="145" y="200" width="115" height="80" rx="8" fill="#2a2a4e"/>
  <rect x="270" y="200" width="110" height="80" rx="8" fill="#2a2a4e"/>
</svg>
```

`docs/public/images/patterns/data-table.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="20" y="20" width="360" height="40" rx="4" fill="#2a2a4e"/>
  <rect x="20" y="70" width="360" height="30" rx="2" fill="#3a3a5a"/>
  <rect x="20" y="110" width="360" height="30" rx="2" fill="#2a2a4e"/>
  <rect x="20" y="150" width="360" height="30" rx="2" fill="#2a2a4e"/>
  <rect x="20" y="190" width="360" height="30" rx="2" fill="#2a2a4e"/>
  <rect x="20" y="230" width="360" height="30" rx="2" fill="#2a2a4e"/>
  <rect x="160" y="270" width="80" height="20" rx="4" fill="#4a4a6a"/>
</svg>
```

`docs/public/images/patterns/card-grid.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="20" y="20" width="115" height="120" rx="8" fill="#2a2a4e"/>
  <rect x="145" y="20" width="115" height="120" rx="8" fill="#2a2a4e"/>
  <rect x="270" y="20" width="110" height="120" rx="8" fill="#2a2a4e"/>
  <rect x="20" y="160" width="115" height="120" rx="8" fill="#2a2a4e"/>
  <rect x="145" y="160" width="115" height="120" rx="8" fill="#2a2a4e"/>
  <rect x="270" y="160" width="110" height="120" rx="8" fill="#2a2a4e"/>
</svg>
```

`docs/public/images/patterns/filter-bar.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="20" y="125" width="360" height="50" rx="8" fill="#2a2a4e"/>
  <rect x="30" y="140" width="100" height="20" rx="4" fill="#3a3a5a"/>
  <rect x="140" y="140" width="60" height="20" rx="4" fill="#4a4a6a"/>
  <rect x="210" y="140" width="60" height="20" rx="4" fill="#4a4a6a"/>
  <rect x="280" y="140" width="40" height="20" rx="10" fill="#7c3aed"/>
  <rect x="330" y="140" width="40" height="20" rx="10" fill="#7c3aed"/>
</svg>
```

`docs/public/images/patterns/kpi-grid.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="none">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <rect x="20" y="80" width="85" height="100" rx="8" fill="#2a2a4e"/>
  <rect x="115" y="80" width="85" height="100" rx="8" fill="#2a2a4e"/>
  <rect x="210" y="80" width="85" height="100" rx="8" fill="#2a2a4e"/>
  <rect x="305" y="80" width="75" height="100" rx="8" fill="#2a2a4e"/>
  <text x="62" y="120" fill="#9ca3af" font-size="10" text-anchor="middle">Revenue</text>
  <text x="62" y="145" fill="#e5e7eb" font-size="16" font-weight="bold" text-anchor="middle">$42.5k</text>
</svg>
```

- [ ] **Step 3: Commit**

```bash
git add docs/public/images/patterns/
git commit -m "feat(docs): add placeholder pattern preview SVGs for anatomy viewer"
```

---

## Task 11: Integration Test

**Files:**
- Test all changes work together

- [ ] **Step 1: Start dev server**

Run: `cd docs && npx decantr dev`
Expected: Server starts on localhost:3000

- [ ] **Step 2: Test Showcase page tabs**

Navigate to `http://localhost:3000/#/showcase`

Verify:
- [ ] Apps tab loads (existing)
- [ ] Patterns tab loads with anatomy viewer
- [ ] Components tab loads (existing)
- [ ] Themes tab loads (existing)
- [ ] Ecosystem tab loads with community grid

- [ ] **Step 3: Test Anatomy Viewer interactions**

On Patterns tab:
- [ ] Pattern selector buttons work
- [ ] Hotspots are visible on preview
- [ ] Clicking hotspot highlights corresponding slot in list
- [ ] Clicking slot in list highlights corresponding hotspot

- [ ] **Step 4: Test Docs navigation**

Navigate to `http://localhost:3000/#/docs`

Verify:
- [ ] "Getting Started" section visible
- [ ] "Tutorial" section visible
- [ ] "Prompt Workflow" section visible (new)
- [ ] "Cookbook" section visible
- [ ] "Dev Tools" section visible with Explorer link

- [ ] **Step 5: Test main nav header**

Verify:
- [ ] Logo links to home
- [ ] "Showcase" link works
- [ ] "Docs" link works
- [ ] "GitHub" opens external link

- [ ] **Step 6: Verify Explorer removed from main nav**

Verify:
- [ ] No "Explorer" link in top nav bar
- [ ] Explorer still accessible via `/explorer` route
- [ ] Explorer linked from Docs sidebar under "Dev Tools"

- [ ] **Step 7: Commit integration verification**

```bash
git add -A
git commit -m "test: verify Phase 2 integration complete"
```

---

## Summary

Phase 2 adds:
1. **anatomy-viewer pattern** — Interactive component breakdown for documentation
2. **ecosystem-grid pattern** — Community registry display
3. **Patterns tab** — Showcase tab with curated patterns and anatomy viewer
4. **Ecosystem tab** — Showcase tab with community registry preview
5. **Docs restructure** — Prompt Workflow section, Dev Tools section with Explorer
6. **Nav simplification** — Explorer removed from main nav, accessible via docs

All implementations use Decantr patterns and components — no hand-rolled HTML/CSS.
