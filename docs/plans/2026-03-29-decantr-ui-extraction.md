# Decantr UI Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract UI framework assets from decantr-framework (legacy) into @decantr/ui and @decantr/ui-chart packages in the monorepo.

**Architecture:** Hybrid approach with bundled @decantr/ui (runtime, state, components, router, SSR, etc.) using subpath exports, plus separate @decantr/ui-chart for the charting library. Minimal changes to existing monorepo packages. Internal folder named `runtime/` instead of `core/` to avoid conflict with existing @decantr/core.

**Tech Stack:** TypeScript, pnpm workspace, tsup for bundling, vitest for testing.

**Source Repo:** `/Users/davidaimi/projects/decantr-framework`
**Target Repo:** `/Users/davidaimi/projects/decantr-monorepo`

---

## File Structure

### New Package: packages/ui/

```
packages/ui/
├── src/
│   ├── runtime/        # From decantr-framework/src/core/
│   │   └── index.js    # h(), mount(), onMount, onDestroy, text, cond, list
│   ├── state/          # From decantr-framework/src/state/
│   │   ├── index.js    # createSignal, createEffect, createMemo, batch
│   │   ├── store.js    # createStore
│   │   ├── arrays.js   # Array utilities
│   │   ├── devtools.js # DevTools integration
│   │   └── middleware.js
│   ├── components/     # From decantr-framework/src/components/ (107 files)
│   │   └── index.js    # Re-exports all components
│   ├── icons/          # From decantr-framework/src/icons/
│   │   └── index.js
│   ├── router/         # From decantr-framework/src/router/
│   │   ├── index.js    # createRouter, navigate, useRoute
│   │   ├── hash.js
│   │   └── history.js
│   ├── data/           # From decantr-framework/src/data/
│   │   ├── index.js    # createQuery, createMutation
│   │   ├── url.js
│   │   ├── realtime.js
│   │   └── worker.js
│   ├── ssr/            # From decantr-framework/src/ssr/
│   │   └── index.js    # renderToString, renderToStream, hydrate
│   ├── i18n/           # From decantr-framework/src/i18n/
│   │   └── index.js    # createI18n
│   ├── form/           # From decantr-framework/src/form/
│   │   └── index.js
│   ├── tags/           # From decantr-framework/src/tags/
│   │   └── index.js
│   ├── tannins/        # From decantr-framework/src/tannins/
│   │   ├── auth.js
│   │   ├── telemetry.js
│   │   └── auth-enterprise.js
│   └── css/            # From decantr-framework/src/css/ (component styles)
│       └── index.js
├── compiler/           # From decantr-framework/tools/compiler/
│   ├── index.js
│   ├── tokenizer.js
│   ├── parser.js
│   ├── emitter.js
│   ├── optimizer.js
│   ├── validator.js
│   ├── graph.js
│   ├── pipeline.js
│   ├── reporter.js
│   ├── dev.js
│   ├── lint-rules/
│   ├── transforms/
│   └── utils/
├── package.json
├── tsconfig.json
└── README.md
```

### New Package: packages/ui-chart/

```
packages/ui-chart/
├── src/
│   ├── index.js
│   ├── types/          # Chart type implementations
│   │   ├── bar.js
│   │   ├── pie.js
│   │   ├── sparkline.js
│   │   ├── scatter.js
│   │   ├── bubble.js
│   │   ├── candlestick.js
│   │   ├── radar.js
│   │   ├── radial.js
│   │   ├── gauge.js
│   │   ├── sankey.js
│   │   ├── chord.js
│   │   ├── treemap.js
│   │   ├── sunburst.js
│   │   ├── heatmap.js
│   │   ├── histogram.js
│   │   ├── waterfall.js
│   │   ├── funnel.js
│   │   ├── box-plot.js
│   │   ├── range-bar.js
│   │   ├── range-area.js
│   │   ├── swimlane.js
│   │   ├── org-chart.js
│   │   ├── combination.js
│   │   └── _type-base.js
│   ├── renderers/
│   │   ├── svg.js
│   │   ├── canvas.js
│   │   └── webgpu.js
│   ├── layouts/
│   │   ├── cartesian.js
│   │   ├── polar.js
│   │   ├── hierarchy.js
│   │   └── _layout-base.js
│   ├── _animate.js
│   ├── _interact.js
│   ├── _data.js
│   ├── _palette.js
│   ├── _format.js
│   ├── _shared.js
│   ├── _renderer.js
│   └── _scene.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Phase 1: Prepare Monorepo

### Task 1: Create @decantr/ui package skeleton

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.js`
- Create: `packages/ui/README.md`

- [ ] **Step 1: Create package directory**

```bash
mkdir -p /Users/davidaimi/projects/decantr-monorepo/packages/ui/src
```

- [ ] **Step 2: Create package.json**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui/package.json << 'EOF'
{
  "name": "@decantr/ui",
  "version": "0.1.0",
  "description": "Decantr UI Framework - signal-based reactivity, atomic CSS, 100+ components",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./runtime": "./src/runtime/index.js",
    "./state": "./src/state/index.js",
    "./state/store": "./src/state/store.js",
    "./state/arrays": "./src/state/arrays.js",
    "./state/devtools": "./src/state/devtools.js",
    "./state/middleware": "./src/state/middleware.js",
    "./components": "./src/components/index.js",
    "./icons": "./src/icons/index.js",
    "./router": "./src/router/index.js",
    "./data": "./src/data/index.js",
    "./ssr": "./src/ssr/index.js",
    "./i18n": "./src/i18n/index.js",
    "./form": "./src/form/index.js",
    "./tags": "./src/tags/index.js",
    "./tannins/auth": "./src/tannins/auth.js",
    "./tannins/telemetry": "./src/tannins/telemetry.js",
    "./tannins/auth-enterprise": "./src/tannins/auth-enterprise.js",
    "./css": "./src/css/index.js"
  },
  "files": [
    "src/",
    "compiler/",
    "README.md"
  ],
  "keywords": [
    "ui-framework",
    "signals",
    "reactive",
    "components",
    "decantr"
  ],
  "author": "David Aimi",
  "license": "MIT",
  "peerDependencies": {
    "@decantr/css": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
EOF
```

- [ ] **Step 3: Create tsconfig.json**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

- [ ] **Step 4: Create placeholder index.js**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/index.js << 'EOF'
// @decantr/ui - Decantr UI Framework
// This is the main entry point. Import specific modules via subpaths:
//   import { h, mount } from '@decantr/ui/runtime';
//   import { createSignal } from '@decantr/ui/state';
//   import { Button } from '@decantr/ui/components';

export const VERSION = '0.1.0';
EOF
```

- [ ] **Step 5: Create README.md**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui/README.md << 'EOF'
# @decantr/ui

Decantr UI Framework - a signal-based, reactive UI framework with 100+ components.

## Installation

```bash
npm install @decantr/ui @decantr/css
```

## Usage

```js
import { h, mount } from '@decantr/ui/runtime';
import { createSignal } from '@decantr/ui/state';
import { Button } from '@decantr/ui/components';

const [count, setCount] = createSignal(0);

mount(
  document.getElementById('app'),
  h('div', {},
    Button({ onClick: () => setCount(c => c + 1) }, 'Count: ', count)
  )
);
```

## Subpath Exports

- `@decantr/ui/runtime` - Core runtime (h, mount, onMount, onDestroy)
- `@decantr/ui/state` - State management (createSignal, createEffect, createStore)
- `@decantr/ui/components` - 100+ UI components
- `@decantr/ui/icons` - Icon system
- `@decantr/ui/router` - Routing (createRouter, navigate)
- `@decantr/ui/data` - Data fetching (createQuery, createMutation)
- `@decantr/ui/ssr` - Server-side rendering
- `@decantr/ui/i18n` - Internationalization
- `@decantr/ui/form` - Form utilities
- `@decantr/ui/tags` - Tag helpers
- `@decantr/ui/tannins/auth` - Authentication
- `@decantr/ui/tannins/telemetry` - Telemetry
- `@decantr/ui/css` - Extended CSS atoms

## License

MIT
EOF
```

- [ ] **Step 6: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/
git commit -m "chore: create @decantr/ui package skeleton"
```

---

### Task 2: Create @decantr/ui-chart package skeleton

**Files:**
- Create: `packages/ui-chart/package.json`
- Create: `packages/ui-chart/tsconfig.json`
- Create: `packages/ui-chart/src/index.js`
- Create: `packages/ui-chart/README.md`

- [ ] **Step 1: Create package directory**

```bash
mkdir -p /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src
```

- [ ] **Step 2: Create package.json**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/package.json << 'EOF'
{
  "name": "@decantr/ui-chart",
  "version": "0.1.0",
  "description": "Decantr Chart Library - SVG, Canvas, and WebGPU chart renderers",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./types/*": "./src/types/*.js",
    "./renderers/*": "./src/renderers/*.js",
    "./layouts/*": "./src/layouts/*.js"
  },
  "files": [
    "src/",
    "README.md"
  ],
  "keywords": [
    "charts",
    "visualization",
    "svg",
    "canvas",
    "webgpu",
    "decantr"
  ],
  "author": "David Aimi",
  "license": "MIT",
  "peerDependencies": {
    "@decantr/ui": "workspace:*",
    "@decantr/css": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
EOF
```

- [ ] **Step 3: Create tsconfig.json**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

- [ ] **Step 4: Create placeholder index.js**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/index.js << 'EOF'
// @decantr/ui-chart - Decantr Chart Library
// Chart types, renderers, and layouts for data visualization

export const VERSION = '0.1.0';
EOF
```

- [ ] **Step 5: Create README.md**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/README.md << 'EOF'
# @decantr/ui-chart

Decantr Chart Library - SVG, Canvas, and WebGPU chart renderers with 20+ chart types.

## Installation

```bash
npm install @decantr/ui-chart @decantr/ui @decantr/css
```

## Usage

```js
import { BarChart } from '@decantr/ui-chart';
import { mount } from '@decantr/ui/runtime';

mount(
  document.getElementById('chart'),
  BarChart({
    data: [
      { label: 'A', value: 10 },
      { label: 'B', value: 20 },
      { label: 'C', value: 15 }
    ]
  })
);
```

## Chart Types

- Bar, Line, Area, Pie, Donut
- Scatter, Bubble, Heatmap
- Candlestick, OHLC
- Radar, Radial, Gauge
- Sankey, Chord, Funnel
- Treemap, Sunburst
- Box Plot, Histogram, Waterfall
- Org Chart, Swimlane

## Renderers

- SVG (default) - Best for interactivity and accessibility
- Canvas - Best for large datasets
- WebGPU - Best for real-time updates and massive datasets

## License

MIT
EOF
```

- [ ] **Step 6: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui-chart/
git commit -m "chore: create @decantr/ui-chart package skeleton"
```

---

### Task 3: Update pnpm-workspace.yaml

**Files:**
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: Read current workspace config**

```bash
cat /Users/davidaimi/projects/decantr-monorepo/pnpm-workspace.yaml
```

Expected: Current workspace packages list

- [ ] **Step 2: Verify new packages are already included**

The workspace likely uses `packages/*` glob, which automatically includes new packages. Verify:

```bash
# If it says "packages:  - 'packages/*'" then no change needed
grep -A5 "packages:" /Users/davidaimi/projects/decantr-monorepo/pnpm-workspace.yaml
```

- [ ] **Step 3: Install dependencies to register new packages**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm install
```

- [ ] **Step 4: Verify packages are recognized**

```bash
pnpm list --filter @decantr/ui --filter @decantr/ui-chart
```

Expected: Both packages listed

- [ ] **Step 5: Commit if any changes**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "chore: register @decantr/ui and @decantr/ui-chart in workspace" || echo "No changes to commit"
```

---

## Phase 2: Extract @decantr/ui

### Task 4: Extract runtime core

**Files:**
- Create: `packages/ui/src/runtime/index.js`
- Source: `decantr-framework/src/core/`

- [ ] **Step 1: Create runtime directory**

```bash
mkdir -p /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/runtime
```

- [ ] **Step 2: Copy core files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/core/* \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/runtime/
```

- [ ] **Step 3: Verify files copied**

```bash
ls -la /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/runtime/
```

- [ ] **Step 4: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/runtime/
git commit -m "feat(ui): extract runtime core (h, mount, signals)"
```

---

### Task 5: Extract state management

**Files:**
- Create: `packages/ui/src/state/`
- Source: `decantr-framework/src/state/`

- [ ] **Step 1: Copy state files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/state \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Verify files copied**

```bash
ls -la /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/state/
```

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/state/
git commit -m "feat(ui): extract state management (signals, stores, effects)"
```

---

### Task 6: Extract tags

**Files:**
- Create: `packages/ui/src/tags/`
- Source: `decantr-framework/src/tags/`

- [ ] **Step 1: Copy tags files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/tags \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/tags/
git commit -m "feat(ui): extract tags helpers"
```

---

### Task 7: Extract router

**Files:**
- Create: `packages/ui/src/router/`
- Source: `decantr-framework/src/router/`

- [ ] **Step 1: Copy router files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/router \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/router/
git commit -m "feat(ui): extract router (hash + history)"
```

---

### Task 8: Extract data layer

**Files:**
- Create: `packages/ui/src/data/`
- Source: `decantr-framework/src/data/`

- [ ] **Step 1: Copy data files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/data \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/data/
git commit -m "feat(ui): extract data layer (query, mutation, realtime)"
```

---

### Task 9: Extract SSR

**Files:**
- Create: `packages/ui/src/ssr/`
- Source: `decantr-framework/src/ssr/`

- [ ] **Step 1: Copy SSR files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/ssr \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/ssr/
git commit -m "feat(ui): extract SSR (renderToString, renderToStream, hydrate)"
```

---

### Task 10: Extract i18n

**Files:**
- Create: `packages/ui/src/i18n/`
- Source: `decantr-framework/src/i18n/`

- [ ] **Step 1: Copy i18n files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/i18n \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/i18n/
git commit -m "feat(ui): extract i18n (createI18n)"
```

---

### Task 11: Extract form utilities

**Files:**
- Create: `packages/ui/src/form/`
- Source: `decantr-framework/src/form/`

- [ ] **Step 1: Copy form files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/form \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/form/
git commit -m "feat(ui): extract form utilities"
```

---

### Task 12: Extract tannins (auth, telemetry)

**Files:**
- Create: `packages/ui/src/tannins/`
- Source: `decantr-framework/src/tannins/`

- [ ] **Step 1: Copy tannins files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/tannins \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/tannins/
git commit -m "feat(ui): extract tannins (auth, telemetry)"
```

---

### Task 13: Extract icons

**Files:**
- Create: `packages/ui/src/icons/`
- Source: `decantr-framework/src/icons/`

- [ ] **Step 1: Copy icons files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/icons \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/icons/
git commit -m "feat(ui): extract icons system"
```

---

### Task 14: Extract CSS extensions

**Files:**
- Create: `packages/ui/src/css/`
- Source: `decantr-framework/src/css/`

- [ ] **Step 1: Copy CSS files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/css \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/css/
git commit -m "feat(ui): extract CSS extensions (component atoms)"
```

---

### Task 15: Extract components (107 files)

**Files:**
- Create: `packages/ui/src/components/`
- Source: `decantr-framework/src/components/`

- [ ] **Step 1: Copy all component files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/src/components \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/
```

- [ ] **Step 2: Count files to verify**

```bash
ls /Users/davidaimi/projects/decantr-monorepo/packages/ui/src/components/ | wc -l
```

Expected: ~107 files

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/src/components/
git commit -m "feat(ui): extract 107 UI components"
```

---

### Task 16: Extract compiler

**Files:**
- Create: `packages/ui/compiler/`
- Source: `decantr-framework/tools/compiler/`

- [ ] **Step 1: Copy compiler files**

```bash
cp -r /Users/davidaimi/projects/decantr-framework/tools/compiler \
      /Users/davidaimi/projects/decantr-monorepo/packages/ui/
```

- [ ] **Step 2: Verify structure**

```bash
ls -la /Users/davidaimi/projects/decantr-monorepo/packages/ui/compiler/
```

Expected: index.js, tokenizer.js, parser.js, emitter.js, optimizer.js, lint-rules/, transforms/, utils/

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/compiler/
git commit -m "feat(ui): extract compiler (tokenizer, parser, emitter)"
```

---

### Task 17: Fix internal imports

**Files:**
- Modify: All files in `packages/ui/src/`

- [ ] **Step 1: Find all imports referencing 'decantr/'**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/packages/ui
grep -r "from 'decantr/" src/ --include="*.js" | head -20
```

- [ ] **Step 2: Create import fix script**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui/fix-imports.sh << 'EOF'
#!/bin/bash
# Fix imports from 'decantr/xxx' to relative paths

cd /Users/davidaimi/projects/decantr-monorepo/packages/ui/src

# Map old imports to new paths
# decantr/core -> ../runtime (or ./runtime depending on location)
# decantr/state -> ../state
# decantr/components -> ../components
# etc.

find . -name "*.js" -type f | while read file; do
  # Replace decantr/core with relative runtime path
  sed -i '' "s|from 'decantr/core'|from '../runtime/index.js'|g" "$file"
  sed -i '' "s|from 'decantr/state'|from '../state/index.js'|g" "$file"
  sed -i '' "s|from 'decantr/components'|from '../components/index.js'|g" "$file"
  sed -i '' "s|from 'decantr/router'|from '../router/index.js'|g" "$file"
  sed -i '' "s|from 'decantr/data'|from '../data/index.js'|g" "$file"
  sed -i '' "s|from 'decantr/css'|from '@decantr/css'|g" "$file"
  sed -i '' "s|from 'decantr/icons'|from '../icons/index.js'|g" "$file"
  sed -i '' "s|from 'decantr/tags'|from '../tags/index.js'|g" "$file"
done

echo "Import fixes applied"
EOF
chmod +x /Users/davidaimi/projects/decantr-monorepo/packages/ui/fix-imports.sh
```

- [ ] **Step 3: Run import fix script**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/packages/ui
./fix-imports.sh
```

- [ ] **Step 4: Verify no remaining decantr/ imports**

```bash
grep -r "from 'decantr/" src/ --include="*.js" | wc -l
```

Expected: 0

- [ ] **Step 5: Remove fix script and commit**

```bash
rm /Users/davidaimi/projects/decantr-monorepo/packages/ui/fix-imports.sh
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui/
git commit -m "fix(ui): update internal imports to relative paths"
```

---

### Task 18: Verify @decantr/ui builds

**Files:**
- None (verification only)

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm install
```

- [ ] **Step 2: Run lint/typecheck**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/packages/ui
pnpm exec tsc --noEmit || echo "Type errors found - review and fix"
```

- [ ] **Step 3: Verify exports resolve**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
node -e "
const pkg = require('./packages/ui/package.json');
console.log('Exports defined:', Object.keys(pkg.exports).length);
"
```

- [ ] **Step 4: Document any build issues for follow-up**

If there are build issues, create a tracking issue or note. The extraction is still valid; issues can be fixed incrementally.

---

## Phase 3: Extract @decantr/ui-chart

### Task 19: Extract chart types

**Files:**
- Create: `packages/ui-chart/src/types/`
- Source: `decantr-framework/src/chart/types/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/types
```

- [ ] **Step 2: Copy chart type files**

```bash
cp /Users/davidaimi/projects/decantr-framework/src/chart/types/*.js \
   /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/types/
```

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui-chart/src/types/
git commit -m "feat(ui-chart): extract chart types (20+ chart implementations)"
```

---

### Task 20: Extract chart renderers

**Files:**
- Create: `packages/ui-chart/src/renderers/`
- Source: `decantr-framework/src/chart/renderers/`

- [ ] **Step 1: Create directory**

```bash
mkdir -p /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/renderers
```

- [ ] **Step 2: Copy renderer files**

```bash
cp /Users/davidaimi/projects/decantr-framework/src/chart/renderers/*.js \
   /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/renderers/
```

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui-chart/src/renderers/
git commit -m "feat(ui-chart): extract chart renderers (SVG, Canvas, WebGPU)"
```

---

### Task 21: Extract chart layouts

**Files:**
- Create: `packages/ui-chart/src/layouts/`
- Source: `decantr-framework/src/chart/layouts/`

- [ ] **Step 1: Create directory**

```bash
mkdir -p /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/layouts
```

- [ ] **Step 2: Copy layout files**

```bash
cp /Users/davidaimi/projects/decantr-framework/src/chart/layouts/*.js \
   /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/layouts/
```

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui-chart/src/layouts/
git commit -m "feat(ui-chart): extract chart layouts (cartesian, polar, hierarchy)"
```

---

### Task 22: Extract chart utilities

**Files:**
- Create: `packages/ui-chart/src/_*.js`
- Source: `decantr-framework/src/chart/_*.js`

- [ ] **Step 1: Copy utility files**

```bash
cp /Users/davidaimi/projects/decantr-framework/src/chart/_*.js \
   /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/
```

- [ ] **Step 2: Create main index.js**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src/index.js << 'EOF'
// @decantr/ui-chart - Chart Library
export const VERSION = '0.1.0';

// Re-export chart types
export * from './types/bar.js';
export * from './types/pie.js';
export * from './types/sparkline.js';
export * from './types/scatter.js';
export * from './types/bubble.js';
export * from './types/candlestick.js';
export * from './types/radar.js';
export * from './types/radial.js';
export * from './types/gauge.js';
export * from './types/sankey.js';
export * from './types/chord.js';
export * from './types/treemap.js';
export * from './types/sunburst.js';
export * from './types/heatmap.js';
export * from './types/histogram.js';
export * from './types/waterfall.js';
export * from './types/funnel.js';
export * from './types/box-plot.js';
export * from './types/range-bar.js';
export * from './types/range-area.js';
export * from './types/swimlane.js';
export * from './types/org-chart.js';
export * from './types/combination.js';

// Re-export renderers
export * from './renderers/svg.js';
export * from './renderers/canvas.js';
export * from './renderers/webgpu.js';

// Re-export layouts
export * from './layouts/cartesian.js';
export * from './layouts/polar.js';
export * from './layouts/hierarchy.js';
EOF
```

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui-chart/src/
git commit -m "feat(ui-chart): extract chart utilities and create main export"
```

---

### Task 23: Fix chart imports

**Files:**
- Modify: All files in `packages/ui-chart/src/`

- [ ] **Step 1: Find imports needing update**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart
grep -r "from 'decantr/" src/ --include="*.js" | head -10
```

- [ ] **Step 2: Update imports to @decantr/ui**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart/src
find . -name "*.js" -type f | while read file; do
  # Charts depend on @decantr/ui for rendering primitives
  sed -i '' "s|from 'decantr/core'|from '@decantr/ui/runtime'|g" "$file"
  sed -i '' "s|from 'decantr/state'|from '@decantr/ui/state'|g" "$file"
  sed -i '' "s|from 'decantr/css'|from '@decantr/css'|g" "$file"
done
```

- [ ] **Step 3: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add packages/ui-chart/
git commit -m "fix(ui-chart): update imports to @decantr/ui"
```

---

### Task 24: Verify @decantr/ui-chart builds

**Files:**
- None (verification only)

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm install
```

- [ ] **Step 2: Run lint/typecheck**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart
pnpm exec tsc --noEmit || echo "Type errors found - review and fix"
```

- [ ] **Step 3: Verify exports resolve**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
node -e "
const pkg = require('./packages/ui-chart/package.json');
console.log('Package:', pkg.name, pkg.version);
console.log('Peer deps:', Object.keys(pkg.peerDependencies || {}));
"
```

---

## Phase 4: Integration

### Task 25: Create apps/workbench placeholder

**Files:**
- Create: `apps/workbench/README.md`
- Create: `apps/workbench/package.json`

- [ ] **Step 1: Create workbench directory**

```bash
mkdir -p /Users/davidaimi/projects/decantr-monorepo/apps/workbench
```

- [ ] **Step 2: Create placeholder package.json**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/apps/workbench/package.json << 'EOF'
{
  "name": "@decantr/workbench",
  "version": "0.1.0",
  "private": true,
  "description": "Decantr Workbench - component development, design system explorer, interactive playground",
  "scripts": {
    "dev": "echo 'Workbench not yet implemented'",
    "build": "echo 'Workbench not yet implemented'"
  },
  "dependencies": {
    "@decantr/ui": "workspace:*",
    "@decantr/ui-chart": "workspace:*",
    "@decantr/css": "workspace:*"
  }
}
EOF
```

- [ ] **Step 3: Create README**

```bash
cat > /Users/davidaimi/projects/decantr-monorepo/apps/workbench/README.md << 'EOF'
# Decantr Workbench

> **Status:** Placeholder - implementation deferred

The Decantr Workbench will be a unified tool combining:

1. **Component Development Environment** - like Storybook, for developing and testing @decantr/ui components in isolation

2. **Design System Explorer** - browse the full registry (patterns, archetypes, recipes, themes) with live previews

3. **Interactive Playground** - compose pages using the Decantr methodology, see generated code, tweak in real-time

## Future Implementation

See the design spec: `docs/specs/2026-03-29-decantr-ui-extraction-design.md`
EOF
```

- [ ] **Step 4: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add apps/workbench/
git commit -m "chore: create apps/workbench placeholder"
```

---

### Task 26: Update monorepo README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add @decantr/ui and @decantr/ui-chart to packages table**

Open `README.md` and add to the Packages table:

```markdown
| `@decantr/ui` | [![npm](https://img.shields.io/npm/v/@decantr/ui)](https://www.npmjs.com/package/@decantr/ui) | Signal-based UI framework with 100+ components |
| `@decantr/ui-chart` | [![npm](https://img.shields.io/npm/v/@decantr/ui-chart)](https://www.npmjs.com/package/@decantr/ui-chart) | Chart library with SVG, Canvas, WebGPU renderers |
```

- [ ] **Step 2: Commit**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
git add README.md
git commit -m "docs: add @decantr/ui and @decantr/ui-chart to packages table"
```

---

## Phase 5: Publish & Archive

### Task 27: Prepare npm publish

**Files:**
- None (npm commands only)

- [ ] **Step 1: Verify package versions**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
cat packages/ui/package.json | grep '"version"'
cat packages/ui-chart/package.json | grep '"version"'
```

Expected: Both at "0.1.0"

- [ ] **Step 2: Build packages**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm build
```

- [ ] **Step 3: Dry run publish**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/packages/ui
npm publish --dry-run

cd /Users/davidaimi/projects/decantr-monorepo/packages/ui-chart
npm publish --dry-run
```

- [ ] **Step 4: Document publish steps**

When ready to publish:

```bash
# Publish @decantr/ui
cd packages/ui && npm publish --access public

# Publish @decantr/ui-chart
cd packages/ui-chart && npm publish --access public
```

---

### Task 28: Deprecate legacy decantr package

**Files:**
- Modify: `decantr-framework/package.json` (in legacy repo)

- [ ] **Step 1: Update legacy package.json with deprecation**

```bash
cd /Users/davidaimi/projects/decantr-framework

# Update version to 0.9.12 and add deprecation notice
cat package.json | jq '.version = "0.9.12" | .deprecated = "This package is deprecated. Use @decantr/ui instead: npm install @decantr/ui @decantr/css"' > package.tmp.json
mv package.tmp.json package.json
```

- [ ] **Step 2: Publish deprecation notice**

```bash
cd /Users/davidaimi/projects/decantr-framework
npm publish
npm deprecate decantr "This package is deprecated. Use @decantr/ui instead: npm install @decantr/ui @decantr/css"
```

---

### Task 29: Archive decantr-framework

**Files:**
- None (GitHub operations)

- [ ] **Step 1: Push final state**

```bash
cd /Users/davidaimi/projects/decantr-framework
git add -A
git commit -m "chore: final commit before archive - UI extracted to decantr-monorepo"
git push origin main
```

- [ ] **Step 2: Archive on GitHub**

Go to GitHub repo settings → Archive this repository

Or via CLI:

```bash
gh repo archive decantr-ai/decantr-framework --yes
```

- [ ] **Step 3: Update any documentation pointing to old repo**

Search for references to `decantr-framework` in the monorepo and update to point to `@decantr/ui`.

---

## Summary

**Total Tasks:** 29
**Estimated Time:** 4-6 hours

**Commit History Preview:**
1. `chore: create @decantr/ui package skeleton`
2. `chore: create @decantr/ui-chart package skeleton`
3. `chore: register @decantr/ui and @decantr/ui-chart in workspace`
4. `feat(ui): extract runtime core (h, mount, signals)`
5. `feat(ui): extract state management (signals, stores, effects)`
6. `feat(ui): extract tags helpers`
7. `feat(ui): extract router (hash + history)`
8. `feat(ui): extract data layer (query, mutation, realtime)`
9. `feat(ui): extract SSR (renderToString, renderToStream, hydrate)`
10. `feat(ui): extract i18n (createI18n)`
11. `feat(ui): extract form utilities`
12. `feat(ui): extract tannins (auth, telemetry)`
13. `feat(ui): extract icons system`
14. `feat(ui): extract CSS extensions (component atoms)`
15. `feat(ui): extract 107 UI components`
16. `feat(ui): extract compiler (tokenizer, parser, emitter)`
17. `fix(ui): update internal imports to relative paths`
18. `feat(ui-chart): extract chart types (20+ chart implementations)`
19. `feat(ui-chart): extract chart renderers (SVG, Canvas, WebGPU)`
20. `feat(ui-chart): extract chart layouts (cartesian, polar, hierarchy)`
21. `feat(ui-chart): extract chart utilities and create main export`
22. `fix(ui-chart): update imports to @decantr/ui`
23. `chore: create apps/workbench placeholder`
24. `docs: add @decantr/ui and @decantr/ui-chart to packages table`
