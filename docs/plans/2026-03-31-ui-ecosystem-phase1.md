# UI Ecosystem Phase 1: Catalog + Workbench Isolation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/ui-catalog` (story format, renderer, query API, first 15 stories) and `apps/workbench` isolation view (sidebar nav, variant grid, theme toolbar, hot-reload) — a fully dog-fooded Decantr app.

**Architecture:** A new `packages/ui-catalog` package defines component stories as plain ES module objects. A co-located renderer turns stories into live `@decantr/ui` component trees. The workbench (`apps/workbench`) is a Decantr-native SPA that imports the catalog, renders stories in a three-panel layout (sidebar, variant grid, inspector), and uses the compiler dev mode for hot-reload.

**Tech Stack:** `@decantr/ui` (runtime, state, components, router, CSS), `@decantr/css` (atoms), `@decantr/ui-chart` (chart stories), vitest (tests)

**Spec:** `docs/specs/2026-03-31-decantr-ui-ecosystem-design.md`

**CLAUDE.md:** Do not add Co-Authored-By lines to commits.

---

## File Structure

### packages/ui-catalog/ (NEW)

| File | Responsibility |
|------|---------------|
| `package.json` | Package manifest with workspace deps and exports map |
| `src/index.js` | Public API: `getAllStories`, `getStory`, `getCategories`, `searchStories` |
| `src/schema.js` | Story format validation: `validateStory()`, category constants |
| `src/renderer.js` | Turns a story object into a live Decantr component tree |
| `src/stories/components/Button.story.js` | Button story (variants, playground, usage) |
| `src/stories/components/Input.story.js` | Input story |
| `src/stories/components/Card.story.js` | Card story |
| `src/stories/components/Modal.story.js` | Modal story |
| `src/stories/components/Tabs.story.js` | Tabs story |
| `src/stories/components/Table.story.js` | Table story |
| `src/stories/components/Badge.story.js` | Badge story |
| `src/stories/components/Alert.story.js` | Alert story |
| `src/stories/components/Accordion.story.js` | Accordion story |
| `src/stories/components/Select.story.js` | Select story |
| `src/stories/components/Checkbox.story.js` | Checkbox story |
| `src/stories/components/Switch.story.js` | Switch story |
| `src/stories/components/Spinner.story.js` | Spinner story |
| `src/stories/components/Progress.story.js` | Progress story |
| `src/stories/components/Tooltip.story.js` | Tooltip story |
| `vitest.config.ts` | Vitest config for this package |
| `test/schema.test.js` | Tests for story validation |
| `test/index.test.js` | Tests for query API |

### apps/workbench/ (REVIVE — currently placeholder)

| File | Responsibility |
|------|---------------|
| `package.json` | Updated with real scripts and deps |
| `essence.json` | Real v3 essence: `developer-tool` archetype, auradecantism, dark, guided guard |
| `index.html` | Entry HTML that loads the app |
| `src/index.js` | Entry point: init theme, mount app |
| `src/app.js` | Root component: three-panel shell with router |
| `src/shell/sidebar.js` | Category tree nav built from catalog `getCategories()` |
| `src/shell/toolbar.js` | Theme/mode/density/shape controls |
| `src/shell/search.js` | Fuzzy search across story titles |
| `src/views/isolation.js` | Variant grid view: renders all variants for selected story |
| `src/panels/css-panel.js` | Shows computed CSS atoms for rendered component |
| `dev-server.js` | Simple dev server: serves index.html + watches for changes |

---

## Task 1: Scaffold packages/ui-catalog

**Files:**
- Create: `packages/ui-catalog/package.json`
- Create: `packages/ui-catalog/vitest.config.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@decantr/ui-catalog",
  "version": "0.1.0",
  "description": "Component stories, demo definitions, and metadata for @decantr/ui",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./renderer": "./src/renderer.js",
    "./schema": "./src/schema.js"
  },
  "files": ["src/"],
  "keywords": ["decantr", "ui", "catalog", "stories", "components"],
  "author": "David Aimi",
  "license": "MIT",
  "dependencies": {
    "@decantr/ui": "workspace:*",
    "@decantr/ui-chart": "workspace:*",
    "@decantr/css": "workspace:*"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 3: Install dependencies**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm install`
Expected: Success, new package linked in workspace.

- [ ] **Step 4: Commit**

```bash
git add packages/ui-catalog/package.json packages/ui-catalog/vitest.config.ts pnpm-lock.yaml
git commit -m "feat(ui-catalog): scaffold package with workspace deps and vitest config"
```

---

## Task 2: Story schema and validation

**Files:**
- Create: `packages/ui-catalog/src/schema.js`
- Create: `packages/ui-catalog/test/schema.test.js`

- [ ] **Step 1: Write the failing test**

Create `packages/ui-catalog/test/schema.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { validateStory, CATEGORIES } from '../src/schema.js';

describe('validateStory', () => {
  const validStory = {
    component: () => document.createElement('button'),
    title: 'Button',
    category: 'components/original',
    description: 'A button component.',
    variants: [
      { name: 'Primary', props: { variant: 'primary' } },
    ],
  };

  it('accepts a valid story with required fields', () => {
    const result = validateStory(validStory);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a story missing title', () => {
    const result = validateStory({ ...validStory, title: undefined });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('title is required');
  });

  it('rejects a story missing component', () => {
    const result = validateStory({ ...validStory, component: undefined });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('component is required and must be a function');
  });

  it('rejects a story with invalid category', () => {
    const result = validateStory({ ...validStory, category: 'invalid/nope' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/category must be one of/);
  });

  it('rejects a story with empty variants', () => {
    const result = validateStory({ ...validStory, variants: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('variants must be a non-empty array');
  });

  it('rejects a variant missing name', () => {
    const result = validateStory({ ...validStory, variants: [{ props: {} }] });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/variant\[0\]\.name is required/);
  });

  it('accepts optional playground field', () => {
    const story = {
      ...validStory,
      playground: {
        defaults: { variant: 'primary' },
        controls: { variant: { type: 'select', options: ['primary', 'secondary'] } },
      },
    };
    const result = validateStory(story);
    expect(result.valid).toBe(true);
  });

  it('rejects playground with invalid control type', () => {
    const story = {
      ...validStory,
      playground: {
        defaults: {},
        controls: { variant: { type: 'invalid-type' } },
      },
    };
    const result = validateStory(story);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/control type/);
  });

  it('accepts optional usage field', () => {
    const story = {
      ...validStory,
      usage: [{ title: 'Basic', code: 'Button()' }],
    };
    const result = validateStory(story);
    expect(result.valid).toBe(true);
  });
});

describe('CATEGORIES', () => {
  it('includes expected component categories', () => {
    expect(CATEGORIES).toContain('components/original');
    expect(CATEGORIES).toContain('components/form');
    expect(CATEGORIES).toContain('components/layout');
    expect(CATEGORIES).toContain('charts');
    expect(CATEGORIES).toContain('icons');
    expect(CATEGORIES).toContain('css');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui-catalog test`
Expected: FAIL — `Cannot find module '../src/schema.js'`

- [ ] **Step 3: Write the schema implementation**

Create `packages/ui-catalog/src/schema.js`:

```js
/**
 * Story format schema and validation for @decantr/ui-catalog.
 * Stories are plain objects — no magic, no compilation.
 */

export const CATEGORIES = [
  // Components (mirrors @decantr/ui component groups)
  'components/original',
  'components/general',
  'components/layout',
  'components/navigation',
  'components/form',
  'components/data-display',
  'components/feedback',
  'components/media',
  'components/utility',
  // Charts
  'charts',
  // Icons
  'icons',
  // CSS
  'css',
];

const CONTROL_TYPES = ['select', 'boolean', 'text', 'number', 'color'];

/**
 * Validate a story object against the schema.
 * @param {Object} story
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStory(story) {
  const errors = [];

  if (!story || typeof story !== 'object') {
    return { valid: false, errors: ['story must be an object'] };
  }

  // Required: component (function)
  if (typeof story.component !== 'function') {
    errors.push('component is required and must be a function');
  }

  // Required: title (string)
  if (!story.title || typeof story.title !== 'string') {
    errors.push('title is required');
  }

  // Required: category (one of CATEGORIES)
  if (!story.category || !CATEGORIES.includes(story.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  // Required: description (string)
  if (!story.description || typeof story.description !== 'string') {
    errors.push('description is required');
  }

  // Required: variants (non-empty array)
  if (!Array.isArray(story.variants) || story.variants.length === 0) {
    errors.push('variants must be a non-empty array');
  } else {
    for (let i = 0; i < story.variants.length; i++) {
      const v = story.variants[i];
      if (!v.name || typeof v.name !== 'string') {
        errors.push(`variant[${i}].name is required`);
      }
      if (!v.props || typeof v.props !== 'object') {
        errors.push(`variant[${i}].props is required and must be an object`);
      }
    }
  }

  // Optional: playground
  if (story.playground !== undefined) {
    if (typeof story.playground !== 'object') {
      errors.push('playground must be an object');
    } else {
      if (story.playground.controls) {
        for (const [key, control] of Object.entries(story.playground.controls)) {
          if (!control.type || !CONTROL_TYPES.includes(control.type)) {
            errors.push(`playground.controls.${key} has invalid control type "${control.type}". Must be one of: ${CONTROL_TYPES.join(', ')}`);
          }
        }
      }
    }
  }

  // Optional: usage
  if (story.usage !== undefined) {
    if (!Array.isArray(story.usage)) {
      errors.push('usage must be an array');
    } else {
      for (let i = 0; i < story.usage.length; i++) {
        if (!story.usage[i].title) errors.push(`usage[${i}].title is required`);
        if (!story.usage[i].code) errors.push(`usage[${i}].code is required`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui-catalog test`
Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui-catalog/src/schema.js packages/ui-catalog/test/schema.test.js
git commit -m "feat(ui-catalog): add story schema validation with categories and control types"
```

---

## Task 3: Query API (index.js)

**Files:**
- Create: `packages/ui-catalog/src/index.js`
- Create: `packages/ui-catalog/test/index.test.js`

- [ ] **Step 1: Write the failing test**

Create `packages/ui-catalog/test/index.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

// We'll test the API with mock stories injected via the register function
describe('catalog query API', () => {
  let catalog;

  const buttonStory = {
    component: () => document.createElement('button'),
    title: 'Button',
    category: 'components/original',
    description: 'A button component.',
    variants: [{ name: 'Primary', props: { variant: 'primary' } }],
  };

  const inputStory = {
    component: () => document.createElement('input'),
    title: 'Input',
    category: 'components/form',
    description: 'A text input.',
    variants: [{ name: 'Default', props: {} }],
  };

  const cardStory = {
    component: () => document.createElement('div'),
    title: 'Card',
    category: 'components/original',
    description: 'A card container.',
    variants: [{ name: 'Default', props: {} }],
  };

  beforeEach(async () => {
    // Re-import to get a fresh module (stories are module-level state)
    catalog = await import('../src/index.js');
    catalog._reset();
    catalog._register('button', buttonStory);
    catalog._register('input', inputStory);
    catalog._register('card', cardStory);
  });

  describe('getAllStories', () => {
    it('returns all registered stories', () => {
      const all = catalog.getAllStories();
      expect(all).toHaveLength(3);
      expect(all.map(s => s.title)).toEqual(['Button', 'Input', 'Card']);
    });
  });

  describe('getStory', () => {
    it('returns a story by slug', () => {
      const story = catalog.getStory('button');
      expect(story.title).toBe('Button');
    });

    it('returns null for unknown slug', () => {
      expect(catalog.getStory('nonexistent')).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('returns categories with their stories', () => {
      const cats = catalog.getCategories();
      expect(cats).toHaveLength(2);

      const original = cats.find(c => c.category === 'components/original');
      expect(original.stories).toHaveLength(2);
      expect(original.stories.map(s => s.title)).toContain('Button');
      expect(original.stories.map(s => s.title)).toContain('Card');

      const form = cats.find(c => c.category === 'components/form');
      expect(form.stories).toHaveLength(1);
    });
  });

  describe('searchStories', () => {
    it('finds stories by title substring', () => {
      const results = catalog.searchStories('but');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Button');
    });

    it('finds stories by description substring', () => {
      const results = catalog.searchStories('text input');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Input');
    });

    it('is case-insensitive', () => {
      const results = catalog.searchStories('CARD');
      expect(results).toHaveLength(1);
    });

    it('returns empty array for no matches', () => {
      expect(catalog.searchStories('zzz')).toEqual([]);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui-catalog test`
Expected: FAIL — `Cannot find module '../src/index.js'`

- [ ] **Step 3: Write the index implementation**

Create `packages/ui-catalog/src/index.js`:

```js
/**
 * @decantr/ui-catalog — Query API
 *
 * Public API for discovering and retrieving component stories.
 * Stories are registered at module load time from the stories/ directory.
 */

import { validateStory } from './schema.js';

/** @type {Map<string, Object>} slug → story */
const stories = new Map();

/**
 * Register a story. Validates before adding.
 * @param {string} slug - URL-safe identifier (e.g. 'button', 'date-picker')
 * @param {Object} story - Story definition object
 */
export function _register(slug, story) {
  const result = validateStory(story);
  if (!result.valid) {
    console.warn(`[ui-catalog] Invalid story "${slug}":`, result.errors);
    return;
  }
  stories.set(slug, { ...story, slug });
}

/**
 * Clear all registered stories. Used for testing.
 */
export function _reset() {
  stories.clear();
}

/**
 * Get all registered stories.
 * @returns {Object[]}
 */
export function getAllStories() {
  return [...stories.values()];
}

/**
 * Get a single story by slug.
 * @param {string} slug
 * @returns {Object|null}
 */
export function getStory(slug) {
  return stories.get(slug) || null;
}

/**
 * Get stories grouped by category.
 * @returns {{ category: string, stories: Object[] }[]}
 */
export function getCategories() {
  const map = new Map();
  for (const story of stories.values()) {
    if (!map.has(story.category)) {
      map.set(story.category, []);
    }
    map.get(story.category).push(story);
  }
  return [...map.entries()].map(([category, items]) => ({ category, stories: items }));
}

/**
 * Search stories by title or description (case-insensitive substring match).
 * @param {string} query
 * @returns {Object[]}
 */
export function searchStories(query) {
  const q = query.toLowerCase();
  return [...stories.values()].filter(
    s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
  );
}

// ─── Auto-register stories from the stories/ directory ───
// This block runs at import time. Each .story.js file's default export is registered.
// The slug is derived from the filename (e.g. Button.story.js → 'button').

const storyModules = import.meta.glob('./stories/**/*.story.js', { eager: true });

for (const [path, mod] of Object.entries(storyModules)) {
  // path is like './stories/components/Button.story.js'
  const filename = path.split('/').pop().replace('.story.js', '');
  const slug = filename.toLowerCase().replace(/([A-Z])/g, (m, c, i) => i ? '-' + c.toLowerCase() : c.toLowerCase());
  if (mod.default) {
    _register(slug, mod.default);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui-catalog test`
Expected: All 8 tests PASS. (The `import.meta.glob` block runs but finds no stories yet in test context — that's fine, tests use `_register` directly.)

- [ ] **Step 5: Commit**

```bash
git add packages/ui-catalog/src/index.js packages/ui-catalog/test/index.test.js
git commit -m "feat(ui-catalog): add query API with getAllStories, getStory, getCategories, searchStories"
```

---

## Task 4: Story renderer

**Files:**
- Create: `packages/ui-catalog/src/renderer.js`

- [ ] **Step 1: Write the renderer**

Create `packages/ui-catalog/src/renderer.js`:

```js
/**
 * Story renderer — turns a story definition into live Decantr component trees.
 *
 * Both apps (workbench + ui-site) use this renderer, adding their own chrome around it.
 */
import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';

/**
 * Render all variants of a story as a grid of labeled component instances.
 * @param {Object} story - A validated story object
 * @returns {HTMLElement} A container with all variants rendered
 */
export function renderVariants(story) {
  const grid = h('div', {
    class: css('_grid _gap4'),
    style: 'grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))',
  });

  for (const variant of story.variants) {
    const cell = h('div', {
      class: css('_flex _col _gap2 _p4 _rounded _border _border-subtle _bg-surface'),
    });

    // Render the actual component with the variant's props
    const component = story.component(variant.props);
    const label = h('span', {
      class: css('_text-xs _text-muted'),
    }, variant.name);

    cell.appendChild(component);
    cell.appendChild(label);
    grid.appendChild(cell);
  }

  return grid;
}

/**
 * Render a single variant of a story.
 * @param {Object} story - A validated story object
 * @param {number} variantIndex - Index into story.variants
 * @returns {HTMLElement} The rendered component
 */
export function renderVariant(story, variantIndex) {
  const variant = story.variants[variantIndex];
  if (!variant) throw new Error(`Variant index ${variantIndex} out of range`);
  return story.component(variant.props);
}

/**
 * Render code usage examples as formatted blocks.
 * @param {Object} story - A validated story object
 * @returns {HTMLElement|null} Container with code blocks, or null if no usage
 */
export function renderUsage(story) {
  if (!story.usage || story.usage.length === 0) return null;

  const container = h('div', { class: css('_flex _col _gap3') });

  for (const example of story.usage) {
    const block = h('div', { class: css('_flex _col _gap1') });
    const title = h('span', {
      class: css('_text-sm _font-medium'),
    }, example.title);
    const code = h('pre', {
      class: css('_p3 _rounded _bg-surface _text-xs _font-mono _overflow-x-auto _border _border-subtle'),
    }, h('code', null, example.code));

    block.appendChild(title);
    block.appendChild(code);
    container.appendChild(block);
  }

  return container;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui-catalog/src/renderer.js
git commit -m "feat(ui-catalog): add story renderer for variants, single variant, and usage blocks"
```

---

## Task 5: First 5 component stories (Button, Input, Card, Badge, Alert)

**Files:**
- Create: `packages/ui-catalog/src/stories/components/Button.story.js`
- Create: `packages/ui-catalog/src/stories/components/Input.story.js`
- Create: `packages/ui-catalog/src/stories/components/Card.story.js`
- Create: `packages/ui-catalog/src/stories/components/Badge.story.js`
- Create: `packages/ui-catalog/src/stories/components/Alert.story.js`

- [ ] **Step 1: Create Button.story.js**

```js
import { Button } from '@decantr/ui/components';

export default {
  component: Button,
  title: 'Button',
  category: 'components/original',
  description: 'Primary action trigger with multiple variants and sizes.',
  variants: [
    { name: 'Default', props: { children: 'Click me' } },
    { name: 'Primary', props: { variant: 'primary', children: 'Click me' } },
    { name: 'Secondary', props: { variant: 'secondary', children: 'Click me' } },
    { name: 'Destructive', props: { variant: 'destructive', children: 'Delete' } },
    { name: 'Ghost', props: { variant: 'ghost', children: 'Click me' } },
    { name: 'Outline', props: { variant: 'outline', children: 'Click me' } },
    { name: 'Link', props: { variant: 'link', children: 'Click me' } },
    { name: 'Small', props: { variant: 'primary', size: 'sm', children: 'Small' } },
    { name: 'Large', props: { variant: 'primary', size: 'lg', children: 'Large' } },
    { name: 'Disabled', props: { variant: 'primary', disabled: true, children: 'Disabled' } },
    { name: 'Block', props: { variant: 'primary', block: true, children: 'Full Width' } },
  ],
  playground: {
    defaults: { variant: 'primary', size: 'default', children: 'Click me' },
    controls: {
      variant: { type: 'select', options: ['default', 'primary', 'secondary', 'tertiary', 'destructive', 'success', 'warning', 'outline', 'ghost', 'link'] },
      size: { type: 'select', options: ['xs', 'sm', 'default', 'lg'] },
      disabled: { type: 'boolean' },
      block: { type: 'boolean' },
      rounded: { type: 'boolean' },
      children: { type: 'text' },
    },
  },
  usage: [
    {
      title: 'Basic',
      code: "import { Button } from '@decantr/ui/components'\n\nButton({ variant: 'primary' }, 'Save')",
    },
    {
      title: 'With icon',
      code: "import { Button, icon } from '@decantr/ui/components'\n\nButton({ variant: 'ghost', iconLeft: 'trash' }, 'Delete')",
    },
    {
      title: 'Loading state',
      code: "import { Button } from '@decantr/ui/components'\nimport { createSignal } from '@decantr/ui/state'\n\nconst [loading, setLoading] = createSignal(false)\nButton({ variant: 'primary', loading }, 'Submit')",
    },
  ],
};
```

- [ ] **Step 2: Create Input.story.js**

```js
import { Input } from '@decantr/ui/components';

export default {
  component: Input,
  title: 'Input',
  category: 'components/original',
  description: 'Text input field with variants, sizes, and validation states.',
  variants: [
    { name: 'Default', props: { placeholder: 'Enter text...' } },
    { name: 'With value', props: { value: 'Hello world' } },
    { name: 'Disabled', props: { placeholder: 'Disabled', disabled: true } },
    { name: 'Readonly', props: { value: 'Read only', readonly: true } },
    { name: 'Error', props: { placeholder: 'Error state', 'data-error': '' } },
    { name: 'Small', props: { placeholder: 'Small', size: 'sm' } },
    { name: 'Large', props: { placeholder: 'Large', size: 'lg' } },
  ],
  playground: {
    defaults: { placeholder: 'Enter text...', size: 'default' },
    controls: {
      placeholder: { type: 'text' },
      disabled: { type: 'boolean' },
      readonly: { type: 'boolean' },
      size: { type: 'select', options: ['sm', 'default', 'lg'] },
    },
  },
  usage: [
    {
      title: 'Basic',
      code: "import { Input } from '@decantr/ui/components'\n\nInput({ placeholder: 'Enter text...' })",
    },
  ],
};
```

- [ ] **Step 3: Create Card.story.js**

```js
import { Card } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

export default {
  component: (props) => Card(props, h('p', null, props._content || 'Card content goes here.')),
  title: 'Card',
  category: 'components/original',
  description: 'Container component for grouping related content with optional header and footer.',
  variants: [
    { name: 'Default', props: { _content: 'Default card content.' } },
    { name: 'With title', props: { title: 'Card Title', _content: 'Card with a title.' } },
    { name: 'With description', props: { title: 'Card Title', description: 'A short description.', _content: 'Full card.' } },
  ],
  playground: {
    defaults: { title: 'Card Title', description: 'Description text' },
    controls: {
      title: { type: 'text' },
      description: { type: 'text' },
    },
  },
  usage: [
    {
      title: 'Basic',
      code: "import { Card } from '@decantr/ui/components'\nimport { h } from '@decantr/ui/runtime'\n\nCard({ title: 'My Card' }, h('p', null, 'Content here'))",
    },
  ],
};
```

- [ ] **Step 4: Create Badge.story.js**

```js
import { Badge } from '@decantr/ui/components';

export default {
  component: Badge,
  title: 'Badge',
  category: 'components/original',
  description: 'Small status indicator label with color variants.',
  variants: [
    { name: 'Default', props: { children: 'Badge' } },
    { name: 'Primary', props: { variant: 'primary', children: 'Primary' } },
    { name: 'Secondary', props: { variant: 'secondary', children: 'Secondary' } },
    { name: 'Destructive', props: { variant: 'destructive', children: 'Destructive' } },
    { name: 'Success', props: { variant: 'success', children: 'Success' } },
    { name: 'Warning', props: { variant: 'warning', children: 'Warning' } },
    { name: 'Outline', props: { variant: 'outline', children: 'Outline' } },
  ],
  playground: {
    defaults: { variant: 'default', children: 'Badge' },
    controls: {
      variant: { type: 'select', options: ['default', 'primary', 'secondary', 'destructive', 'success', 'warning', 'outline'] },
      children: { type: 'text' },
    },
  },
  usage: [
    {
      title: 'Basic',
      code: "import { Badge } from '@decantr/ui/components'\n\nBadge({ variant: 'success' }, 'Active')",
    },
  ],
};
```

- [ ] **Step 5: Create Alert.story.js**

```js
import { Alert } from '@decantr/ui/components';

export default {
  component: Alert,
  title: 'Alert',
  category: 'components/original',
  description: 'Contextual feedback messages with severity variants.',
  variants: [
    { name: 'Default', props: { children: 'This is an alert message.' } },
    { name: 'Info', props: { variant: 'info', children: 'Informational message.' } },
    { name: 'Success', props: { variant: 'success', children: 'Operation succeeded.' } },
    { name: 'Warning', props: { variant: 'warning', children: 'Please be careful.' } },
    { name: 'Destructive', props: { variant: 'destructive', children: 'Something went wrong.' } },
    { name: 'With title', props: { variant: 'info', title: 'Heads up!', children: 'Important information here.' } },
  ],
  playground: {
    defaults: { variant: 'info', children: 'Alert message.' },
    controls: {
      variant: { type: 'select', options: ['default', 'info', 'success', 'warning', 'destructive'] },
      title: { type: 'text' },
      children: { type: 'text' },
    },
  },
  usage: [
    {
      title: 'Basic',
      code: "import { Alert } from '@decantr/ui/components'\n\nAlert({ variant: 'success', title: 'Done!' }, 'File uploaded.')",
    },
  ],
};
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui-catalog/src/stories/
git commit -m "feat(ui-catalog): add first 5 component stories (Button, Input, Card, Badge, Alert)"
```

---

## Task 6: Next 10 component stories

**Files:**
- Create: `packages/ui-catalog/src/stories/components/Modal.story.js`
- Create: `packages/ui-catalog/src/stories/components/Tabs.story.js`
- Create: `packages/ui-catalog/src/stories/components/Table.story.js`
- Create: `packages/ui-catalog/src/stories/components/Accordion.story.js`
- Create: `packages/ui-catalog/src/stories/components/Select.story.js`
- Create: `packages/ui-catalog/src/stories/components/Checkbox.story.js`
- Create: `packages/ui-catalog/src/stories/components/Switch.story.js`
- Create: `packages/ui-catalog/src/stories/components/Spinner.story.js`
- Create: `packages/ui-catalog/src/stories/components/Progress.story.js`
- Create: `packages/ui-catalog/src/stories/components/Tooltip.story.js`

Each story follows the same format as Task 5. The implementing agent should:

1. Read the component source file in `packages/ui/src/components/` to understand props and variants
2. Write the story with accurate variants matching the component's actual API
3. Include playground controls for all user-facing props
4. Include at least one usage example

- [ ] **Step 1: Create all 10 story files**

For each component, read `packages/ui/src/components/<name>.js` first, then write `packages/ui-catalog/src/stories/components/<Name>.story.js` following the pattern from Task 5.

Key patterns to follow:
- `component` field: import from `@decantr/ui/components` and reference the function directly
- `category`: all 10 are `'components/original'` except `Select`, `Checkbox`, `Switch` which are `'components/original'` (they're in the original group per components/index.js)
- `variants`: test all major visual states (default, each variant, disabled, sizes)
- `playground.controls`: match the prop types from the component's JSDoc
- `usage`: show the import and basic usage

- [ ] **Step 2: Verify stories load by running tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui-catalog test`
Expected: All existing tests PASS. (Stories auto-register via `import.meta.glob` but tests use `_reset()` so they're isolated.)

- [ ] **Step 3: Commit**

```bash
git add packages/ui-catalog/src/stories/
git commit -m "feat(ui-catalog): add 10 more component stories (Modal, Tabs, Table, Accordion, Select, Checkbox, Switch, Spinner, Progress, Tooltip)"
```

---

## Task 7: Scaffold apps/workbench with essence.json

**Files:**
- Modify: `apps/workbench/package.json`
- Create: `apps/workbench/essence.json`
- Create: `apps/workbench/index.html`

- [ ] **Step 1: Update package.json with real scripts and deps**

Replace `apps/workbench/package.json` with:

```json
{
  "name": "@decantr/workbench",
  "version": "0.1.0",
  "private": true,
  "description": "Decantr Workbench - component development, design system explorer, interactive playground",
  "type": "module",
  "scripts": {
    "dev": "node dev-server.js",
    "build": "echo 'Workbench is local-only, no build needed'"
  },
  "dependencies": {
    "@decantr/ui": "workspace:*",
    "@decantr/ui-chart": "workspace:*",
    "@decantr/ui-catalog": "workspace:*",
    "@decantr/css": "workspace:*"
  }
}
```

- [ ] **Step 2: Create essence.json**

Create `apps/workbench/essence.json`:

```json
{
  "version": "3",
  "dna": {
    "archetype": "developer-tool",
    "theme": {
      "style": "auradecantism",
      "mode": "dark",
      "recipe": "clean",
      "shape": "rounded"
    },
    "personality": ["technical", "minimal", "focused"],
    "platform": { "type": "spa", "routing": "hash" },
    "density": { "level": "comfortable", "content_gap": "md" },
    "accessibility": { "wcag_level": "AA" }
  },
  "blueprint": {
    "pages": [
      {
        "id": "main",
        "shell": "sidebar-detail",
        "layout": [
          { "zone": "sidebar", "pattern": "component-tree" },
          { "zone": "main", "pattern": "story-renderer" },
          { "zone": "aside", "pattern": "inspector-panels" }
        ]
      }
    ],
    "features": ["theme-switching", "search", "hot-reload"]
  },
  "dna_enforcement": "error",
  "blueprint_enforcement": "warn",
  "guard": { "mode": "guided" }
}
```

- [ ] **Step 3: Create index.html**

Create `apps/workbench/index.html`:

```html
<!DOCTYPE html>
<html lang="en" data-mode="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Decantr Workbench</title>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; background: var(--d-bg, #0a0a0a); color: var(--d-fg, #fafafa); font-family: system-ui, -apple-system, sans-serif; }
    #app { height: 100%; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./src/index.js"></script>
</body>
</html>
```

- [ ] **Step 4: Run pnpm install to link new dependency**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm install`
Expected: Success.

- [ ] **Step 5: Commit**

```bash
git add apps/workbench/package.json apps/workbench/essence.json apps/workbench/index.html pnpm-lock.yaml
git commit -m "feat(workbench): scaffold with essence.json, entry HTML, and real dependencies"
```

---

## Task 8: Workbench entry point and app shell

**Files:**
- Create: `apps/workbench/src/index.js`
- Create: `apps/workbench/src/app.js`

- [ ] **Step 1: Create the entry point**

Create `apps/workbench/src/index.js`:

```js
/**
 * Workbench entry point.
 * Initializes the Decantr theme system and mounts the app.
 */
import { mount } from '@decantr/ui/runtime';
import { setStyle, setMode, setShape } from '@decantr/ui/css';
import { App } from './app.js';

// Initialize theme from essence.json DNA
setStyle('auradecantism');
setMode('dark');
setShape('rounded');

// Mount the workbench app
const root = document.getElementById('app');
mount(root, App);
```

- [ ] **Step 2: Create the app shell**

Create `apps/workbench/src/app.js`:

```js
/**
 * Root app component — three-panel layout with hash router.
 */
import { h } from '@decantr/ui/runtime';
import { createSignal } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { getAllStories, getCategories, getStory, searchStories } from '@decantr/ui-catalog';
import { Sidebar } from './shell/sidebar.js';
import { Toolbar } from './shell/toolbar.js';
import { IsolationView } from './views/isolation.js';

export function App() {
  const [selectedSlug, setSelectedSlug] = createSignal(null);
  const [searchQuery, setSearchQuery] = createSignal('');

  // Select the first story by default
  const stories = getAllStories();
  if (stories.length > 0 && !selectedSlug()) {
    setSelectedSlug(stories[0].slug);
  }

  const shell = h('div', {
    class: css('_flex _col _h-screen'),
  });

  // Top toolbar
  const toolbar = Toolbar();
  shell.appendChild(toolbar);

  // Main content area: sidebar + main
  const content = h('div', {
    class: css('_flex _flex-1 _overflow-hidden'),
  });

  // Left sidebar
  const sidebar = Sidebar({
    onSelect: (slug) => setSelectedSlug(slug),
    selectedSlug,
    searchQuery,
    onSearch: (q) => setSearchQuery(q),
  });
  content.appendChild(sidebar);

  // Main panel — isolation view
  const main = h('div', {
    class: css('_flex-1 _overflow-auto _p6'),
  });

  // Reactive: re-render when selected story changes
  const { createEffect } = await import('@decantr/ui/state');
  createEffect(() => {
    const slug = selectedSlug();
    main.innerHTML = '';
    if (!slug) return;

    const story = getStory(slug);
    if (!story) return;

    const view = IsolationView({ story });
    main.appendChild(view);
  });

  content.appendChild(main);
  shell.appendChild(content);

  return shell;
}
```

**Note:** The `await import` in the effect setup is a pattern issue. The implementing agent should restructure to import `createEffect` at the top of the file (it's already available from `@decantr/ui/state`) and use it directly. The app.js should NOT use `await` — it's a synchronous component function. Corrected version:

```js
/**
 * Root app component — three-panel layout.
 */
import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { getAllStories, getStory } from '@decantr/ui-catalog';
import { Sidebar } from './shell/sidebar.js';
import { Toolbar } from './shell/toolbar.js';
import { IsolationView } from './views/isolation.js';

export function App() {
  const [selectedSlug, setSelectedSlug] = createSignal(null);
  const [searchQuery, setSearchQuery] = createSignal('');

  // Select the first story by default
  const stories = getAllStories();
  if (stories.length > 0) {
    setSelectedSlug(stories[0].slug);
  }

  // Top toolbar
  const toolbar = Toolbar();

  // Left sidebar
  const sidebar = Sidebar({
    onSelect: (slug) => setSelectedSlug(slug),
    selectedSlug,
    searchQuery,
    onSearch: (q) => setSearchQuery(q),
  });

  // Main panel — reactive isolation view
  const main = h('div', {
    class: css('_flex-1 _overflow-auto _p6'),
  });

  createEffect(() => {
    const slug = selectedSlug();
    main.innerHTML = '';
    if (!slug) return;

    const story = getStory(slug);
    if (!story) return;

    const view = IsolationView({ story });
    main.appendChild(view);
  });

  // Assemble layout
  const content = h('div', {
    class: css('_flex _flex-1 _overflow-hidden'),
  });
  content.appendChild(sidebar);
  content.appendChild(main);

  const shell = h('div', {
    class: css('_flex _col _h-screen'),
  });
  shell.appendChild(toolbar);
  shell.appendChild(content);

  return shell;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/workbench/src/index.js apps/workbench/src/app.js
git commit -m "feat(workbench): add entry point with theme init and app shell with three-panel layout"
```

---

## Task 9: Workbench sidebar

**Files:**
- Create: `apps/workbench/src/shell/sidebar.js`
- Create: `apps/workbench/src/shell/search.js`

- [ ] **Step 1: Create search component**

Create `apps/workbench/src/shell/search.js`:

```js
import { h } from '@decantr/ui/runtime';
import { Input } from '@decantr/ui/components';
import { css } from '@decantr/css';

/**
 * Search input for filtering stories.
 * @param {{ onSearch: (query: string) => void }} props
 */
export function Search({ onSearch }) {
  return h('div', { class: css('_p2') },
    Input({
      placeholder: 'Search components...',
      size: 'sm',
      oninput: (e) => onSearch(e.target.value),
    })
  );
}
```

- [ ] **Step 2: Create sidebar component**

Create `apps/workbench/src/shell/sidebar.js`:

```js
import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { getCategories, searchStories } from '@decantr/ui-catalog';
import { Search } from './search.js';

/**
 * Category label formatting.
 * 'components/original' → 'Original'
 * 'charts' → 'Charts'
 */
function formatCategory(cat) {
  const parts = cat.split('/');
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}

/**
 * Sidebar with category tree and search.
 * @param {{ onSelect: Function, selectedSlug: Function, searchQuery: Function, onSearch: Function }} props
 */
export function Sidebar({ onSelect, selectedSlug, searchQuery, onSearch }) {
  const [expandedCategories, setExpandedCategories] = createSignal(new Set());

  const container = h('div', {
    class: css('_flex _col _w-56 _border-r _border-subtle _bg-surface _overflow-auto'),
    style: 'min-width: 220px; max-width: 280px',
  });

  // Search
  container.appendChild(Search({ onSearch }));

  // Story list container (reactive)
  const listContainer = h('div', {
    class: css('_flex _col _px2 _pb2'),
  });

  createEffect(() => {
    listContainer.innerHTML = '';
    const query = searchQuery();

    // If searching, show flat filtered list
    if (query && query.length > 0) {
      const results = searchStories(query);
      for (const story of results) {
        listContainer.appendChild(storyItem(story, selectedSlug, onSelect));
      }
      return;
    }

    // Otherwise, show category tree
    const categories = getCategories();
    for (const { category, stories } of categories) {
      const expanded = expandedCategories();
      const isExpanded = expanded.has(category);

      // Category header
      const header = h('button', {
        class: css('_flex _items-center _gap1 _px2 _py1 _text-xs _text-muted _uppercase _tracking-wide _w-full _cursor-pointer'),
        style: 'background: none; border: none; text-align: left',
        onclick: () => {
          const next = new Set(expandedCategories());
          if (next.has(category)) next.delete(category);
          else next.add(category);
          setExpandedCategories(next);
        },
      },
        h('span', null, isExpanded ? '▾' : '▸'),
        h('span', null, `${formatCategory(category)} (${stories.length})`),
      );
      listContainer.appendChild(header);

      // Story items (if expanded)
      if (isExpanded) {
        for (const story of stories) {
          listContainer.appendChild(storyItem(story, selectedSlug, onSelect));
        }
      }
    }
  });

  container.appendChild(listContainer);
  return container;
}

function storyItem(story, selectedSlug, onSelect) {
  const isSelected = () => selectedSlug() === story.slug;

  const item = h('button', {
    class: css('_flex _items-center _px3 _py1 _text-sm _w-full _cursor-pointer _rounded'),
    style: 'background: none; border: none; text-align: left',
    onclick: () => onSelect(story.slug),
  }, story.title);

  createEffect(() => {
    if (isSelected()) {
      item.style.background = 'var(--d-primary-ghost, rgba(var(--d-primary-rgb), 0.1))';
      item.style.color = 'var(--d-primary)';
    } else {
      item.style.background = 'none';
      item.style.color = 'inherit';
    }
  });

  return item;
}

// Need to import createEffect at the function scope for storyItem
import { createEffect as _ce } from '@decantr/ui/state';
```

**Note:** The implementing agent should fix the double import of `createEffect` — it's already imported at the top. Remove the bottom import line. The `storyItem` function can access `createEffect` from the module scope import.

- [ ] **Step 3: Commit**

```bash
git add apps/workbench/src/shell/sidebar.js apps/workbench/src/shell/search.js
git commit -m "feat(workbench): add sidebar with category tree, search, and story selection"
```

---

## Task 10: Workbench toolbar

**Files:**
- Create: `apps/workbench/src/shell/toolbar.js`

- [ ] **Step 1: Create toolbar with theme/mode/density controls**

Create `apps/workbench/src/shell/toolbar.js`:

```js
import { h } from '@decantr/ui/runtime';
import { createSignal } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { Select } from '@decantr/ui/components';
import {
  setStyle, setMode, setShape,
  getStyle, getMode, getAnimations, setAnimations,
  getStyleList,
} from '@decantr/ui/css';

/**
 * Top toolbar with theme, mode, density, and shape controls.
 */
export function Toolbar() {
  const bar = h('div', {
    class: css('_flex _items-center _gap4 _px4 _h-12 _border-b _border-subtle _bg-surface'),
  });

  // Logo / title
  bar.appendChild(
    h('span', { class: css('_font-bold _text-sm') }, '⬡ Workbench')
  );

  bar.appendChild(h('span', { class: css('_text-muted'), style: 'opacity: 0.3' }, '|'));

  // Style selector
  const styleList = getStyleList();
  bar.appendChild(
    h('label', { class: css('_flex _items-center _gap1 _text-xs _text-muted') },
      'Style:',
      h('select', {
        class: css('_text-xs _px1 _py0 _rounded _bg-surface _border _border-subtle'),
        onchange: (e) => setStyle(e.target.value),
      }, ...styleList.map(s =>
        h('option', { value: s.id, selected: s.id === getStyle()() ? '' : undefined }, s.name || s.id)
      ))
    )
  );

  // Mode selector
  bar.appendChild(
    h('label', { class: css('_flex _items-center _gap1 _text-xs _text-muted') },
      'Mode:',
      h('select', {
        class: css('_text-xs _px1 _py0 _rounded _bg-surface _border _border-subtle'),
        onchange: (e) => setMode(e.target.value),
      },
        h('option', { value: 'dark', selected: '' }, 'Dark'),
        h('option', { value: 'light' }, 'Light'),
        h('option', { value: 'auto' }, 'Auto'),
      )
    )
  );

  // Shape selector
  bar.appendChild(
    h('label', { class: css('_flex _items-center _gap1 _text-xs _text-muted') },
      'Shape:',
      h('select', {
        class: css('_text-xs _px1 _py0 _rounded _bg-surface _border _border-subtle'),
        onchange: (e) => {
          const v = e.target.value;
          setShape(v === 'default' ? null : v);
        },
      },
        h('option', { value: 'default' }, 'Default'),
        h('option', { value: 'sharp' }, 'Sharp'),
        h('option', { value: 'rounded', selected: '' }, 'Rounded'),
        h('option', { value: 'pill' }, 'Pill'),
      )
    )
  );

  // Animations toggle
  bar.appendChild(
    h('label', { class: css('_flex _items-center _gap1 _text-xs _text-muted _ml-auto') },
      h('input', {
        type: 'checkbox',
        checked: '',
        onchange: (e) => setAnimations(e.target.checked),
      }),
      'Animations',
    )
  );

  return bar;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/workbench/src/shell/toolbar.js
git commit -m "feat(workbench): add toolbar with style, mode, shape, and animation controls"
```

---

## Task 11: Workbench isolation view

**Files:**
- Create: `apps/workbench/src/views/isolation.js`

- [ ] **Step 1: Create the isolation view**

Create `apps/workbench/src/views/isolation.js`:

```js
import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { renderVariants, renderUsage } from '@decantr/ui-catalog/renderer';

/**
 * Isolation view — renders all variants of a story in a grid.
 * @param {{ story: Object }} props
 */
export function IsolationView({ story }) {
  const container = h('div', { class: css('_flex _col _gap6') });

  // Header
  const header = h('div', { class: css('_flex _col _gap1') });
  header.appendChild(h('h2', { class: css('_text-xl _font-bold') }, story.title));
  header.appendChild(h('p', { class: css('_text-sm _text-muted') }, story.description));
  if (story.category) {
    header.appendChild(h('span', {
      class: css('_text-xs _text-muted _uppercase _tracking-wide'),
    }, story.category));
  }
  container.appendChild(header);

  // Variant grid
  const variantsSection = h('div', { class: css('_flex _col _gap2') });
  variantsSection.appendChild(h('h3', { class: css('_text-sm _font-medium _text-muted') }, 'Variants'));
  variantsSection.appendChild(renderVariants(story));
  container.appendChild(variantsSection);

  // Usage examples
  const usage = renderUsage(story);
  if (usage) {
    const usageSection = h('div', { class: css('_flex _col _gap2') });
    usageSection.appendChild(h('h3', { class: css('_text-sm _font-medium _text-muted') }, 'Usage'));
    usageSection.appendChild(usage);
    container.appendChild(usageSection);
  }

  return container;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/workbench/src/views/isolation.js
git commit -m "feat(workbench): add isolation view rendering variant grid and usage examples"
```

---

## Task 12: CSS inspector panel

**Files:**
- Create: `apps/workbench/src/panels/css-panel.js`

- [ ] **Step 1: Create the CSS panel**

Create `apps/workbench/src/panels/css-panel.js`:

```js
import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { getInjectedClasses } from '@decantr/css';

/**
 * CSS inspector panel — shows injected atom classes.
 * For Phase 1, this is a simple display. Phase 2 will add per-element inspection.
 */
export function CssPanel() {
  const container = h('div', { class: css('_flex _col _gap2 _p3') });

  container.appendChild(
    h('h4', { class: css('_text-xs _text-muted _uppercase _tracking-wide') }, 'Injected CSS Atoms')
  );

  const classes = getInjectedClasses();
  const list = h('pre', {
    class: css('_text-xs _font-mono _bg-surface _p2 _rounded _overflow-auto'),
    style: 'max-height: 300px',
  }, classes.join('\n'));

  container.appendChild(list);
  return container;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/workbench/src/panels/css-panel.js
git commit -m "feat(workbench): add CSS inspector panel showing injected atom classes"
```

---

## Task 13: Dev server

**Files:**
- Create: `apps/workbench/dev-server.js`

- [ ] **Step 1: Create a simple dev server**

Create `apps/workbench/dev-server.js`:

```js
/**
 * Simple dev server for the workbench.
 * Serves index.html and watches src/ for changes with live-reload.
 *
 * Uses only Node.js built-ins — no external dependencies.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3333;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

// SSE clients for live-reload
const clients = new Set();

// Inject live-reload script into HTML
const RELOAD_SCRIPT = `<script>
  const es = new EventSource('/__reload');
  es.onmessage = () => location.reload();
</script>`;

async function handler(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // SSE endpoint for live-reload
  if (url.pathname === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // Resolve file path
  let filePath = join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);

  // For workspace package imports, resolve from monorepo root
  if (url.pathname.startsWith('/node_modules/') || url.pathname.includes('@decantr/')) {
    // Let the browser handle ES module resolution via import maps or bare specifiers
    // For dev, we serve from the monorepo node_modules
    const monoRoot = resolve(__dirname, '../..');
    filePath = join(monoRoot, 'node_modules', url.pathname.replace('/node_modules/', ''));
  }

  try {
    await stat(filePath);
  } catch {
    // SPA fallback: serve index.html for non-file routes
    filePath = join(__dirname, 'index.html');
  }

  try {
    let content = await readFile(filePath, 'utf-8');
    const ext = extname(filePath);
    const mime = MIME_TYPES[ext] || 'text/plain';

    // Inject reload script into HTML
    if (ext === '.html') {
      content = content.replace('</body>', `${RELOAD_SCRIPT}</body>`);
    }

    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
}

// Watch for changes and notify clients
function notifyReload() {
  for (const client of clients) {
    client.write('data: reload\n\n');
  }
}

// Watch src/ and packages/ for changes
const watchDirs = [
  join(__dirname, 'src'),
  resolve(__dirname, '../../packages/ui/src'),
  resolve(__dirname, '../../packages/ui-catalog/src'),
  resolve(__dirname, '../../packages/css/src'),
];

for (const dir of watchDirs) {
  try {
    watch(dir, { recursive: true }, () => notifyReload());
  } catch {
    // Directory might not exist yet
  }
}

const server = createServer(handler);
server.listen(PORT, () => {
  console.log(`⬡ Workbench running at http://localhost:${PORT}`);
});
```

**Note:** This is a minimal dev server for Phase 1. It serves static files and provides live-reload via SSE. The implementing agent should be aware that bare specifier imports (`@decantr/ui/runtime`) won't resolve in the browser without an import map or a bundler. The recommended approach is to add a simple import map to `index.html` that maps workspace package names to their actual file paths, OR use a lightweight bundler like esbuild in watch mode. The implementing agent should choose the simplest approach that works.

- [ ] **Step 2: Test that the dev server starts**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/workbench dev &`
Wait 2 seconds, then:
Run: `curl -s http://localhost:3333 | head -5`
Expected: HTML content from index.html.
Then kill the background process.

- [ ] **Step 3: Commit**

```bash
git add apps/workbench/dev-server.js
git commit -m "feat(workbench): add minimal dev server with live-reload via SSE"
```

---

## Task 14: Integration test — verify everything connects

- [ ] **Step 1: Verify catalog tests still pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui-catalog test`
Expected: All tests PASS.

- [ ] **Step 2: Verify pnpm workspace is healthy**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm install && pnpm ls --filter @decantr/workbench`
Expected: Shows `@decantr/ui-catalog`, `@decantr/ui`, `@decantr/ui-chart`, `@decantr/css` as dependencies.

- [ ] **Step 3: Verify the workbench dev server starts and serves content**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && timeout 5 pnpm --filter @decantr/workbench dev || true`
Expected: Output includes `⬡ Workbench running at http://localhost:3333`

- [ ] **Step 4: Commit any fixes**

If any fixes were needed, commit them:

```bash
git add -A
git commit -m "fix: integration fixes for workbench + catalog wiring"
```

---

## Task 15: Update monorepo documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add ui-catalog to packages table and workbench to apps table**

In `CLAUDE.md`, add to the Packages table:

```
| `@decantr/ui-catalog` | `packages/ui-catalog/` | Component stories, demo definitions, and metadata |
```

Update the Apps table to reflect the workbench is now active:

```
| `decantr-workbench` | `apps/workbench/` | Component dev workbench (Decantr-native SPA) |
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add ui-catalog and workbench to CLAUDE.md tables"
```

---

## Notes for Implementing Agent

### Browser Module Resolution

The biggest implementation challenge in Phase 1 is **bare specifier resolution in the browser**. The workbench uses `import { h } from '@decantr/ui/runtime'` which browsers cannot resolve natively. Options:

1. **Import map in index.html** — Map `@decantr/ui` → `../../packages/ui/src`, etc. Simplest, no build step.
2. **esbuild in watch mode** — Bundle `src/index.js` → `dist/bundle.js`, serve from dist. Fast, handles all resolution.
3. **Vite** — Overkill for Phase 1 but would give the best DX. Consider for Phase 2.

The implementing agent should choose option 1 or 2 based on what works first.

### CSS Atom Resolution

The `css()` function from `@decantr/css` injects styles at runtime. This works in the browser as long as the module is loaded. No build step needed for CSS.

### Story Auto-Registration

The `import.meta.glob` in `packages/ui-catalog/src/index.js` uses a Vite-specific API. In a plain Node/browser context, this won't work. The implementing agent should either:
- Replace with explicit imports (simpler, works everywhere)
- Add a build step that generates an import manifest
- Use the Vite approach if the workbench ends up using Vite

### Component API Pattern

All `@decantr/ui` components follow this pattern:
```js
function Component(props = {}, ...children) → HTMLElement
```
They return raw DOM elements. No virtual DOM. The renderer calls them directly.
