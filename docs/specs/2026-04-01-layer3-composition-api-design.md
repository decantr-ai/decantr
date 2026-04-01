# Layer 3: Composition API Design

**Date:** 2026-04-01
**Status:** Approved
**Scope:** `packages/ui/src/compose/` — declarative pattern composition

---

## 1. What Layer 3 Does

Layer 3 is the primary API for building Decantr apps. Instead of manually constructing DOM with `h()`, developers (and LLMs) describe what they want declaratively and the framework resolves it.

### Before (Layers 1-2 only)
```ts
// Developer manually builds everything
import { h, mount } from '@decantr/ui/runtime';
import { Button, Card, Input } from '@decantr/ui/components';
import { EssenceProvider } from '@decantr/ui/essence';

mount(root, () =>
  EssenceProvider({ essence },
    h('section', { class: css('_flex _col _gap6 _py12 _text-center') },
      h('h1', { class: css('_text-5xl _font-bold') }, 'Welcome'),
      h('p', { class: css('_text-lg _text-muted') }, 'Build something great'),
      Button({ variant: 'primary', size: 'lg' }, 'Get Started'),
    )
  )
);
```

### After (Layer 3)
```ts
import { mount } from '@decantr/ui/runtime';
import { composePage, EssenceApp } from '@decantr/ui/compose';
import essence from './essence.json';

mount(root, () =>
  EssenceApp({ essence },
    composePage('home')  // resolves from blueprint → shell + patterns → DOM
  )
);
```

---

## 2. Architecture

### New module: `packages/ui/src/compose/`

```
packages/ui/src/compose/
├── index.ts           ← Public API: compose, composePage, composePattern, EssenceApp
├── compose.ts         ← compose() — resolves a pattern by name with DNA context
├── page.ts            ← composePage() — resolves a full page from blueprint
├── app.ts             ← EssenceApp() — top-level component: EssenceProvider + router + shell
├── pattern-renderer.ts ← Maps pattern IDs to @decantr/ui component trees
```

### How it works

```
essence.json (blueprint.pages[0].layout: ['hero', 'feature-grid', 'cta'])
    ↓ composePage('home')
    ↓ reads blueprint from EssenceContext
    ↓ for each pattern in layout:
        ↓ compose('hero')
        ↓ reads pattern definition (components, preset, layout)
        ↓ renders @decantr/ui components with DNA-aware props
    ↓ wraps in shell layout
    ↓ returns rendered DOM
```

---

## 3. Core API

### compose(patternId, options?)

Renders a single pattern by ID.

```ts
function compose(
  patternId: string,
  options?: ComposeOptions,
): HTMLElement;

interface ComposeOptions {
  /** Override specific props passed to the pattern */
  props?: Record<string, unknown>;
  /** Override the preset (default comes from recipe) */
  preset?: string;
  /** Slot content to inject */
  slots?: Record<string, () => HTMLElement>;
}
```

`compose()` reads the current `EssenceContext` (provided by `EssenceProvider` from Layer 2) to get:
- Theme DNA (style, mode, shape) → applied to component styling
- Density → applied to spacing
- Guard mode → validates pattern usage

If no pattern renderer exists for the given ID, it renders a placeholder with the pattern name (graceful degradation).

### composePage(pageId)

Renders a full page from the essence blueprint.

```ts
function composePage(pageId: string): HTMLElement;
```

Reads the blueprint from `EssenceContext`, finds the page by ID, resolves its shell and layout patterns, and renders them composed together.

### composePattern(patternId, props?)

Lower-level: renders a pattern without reading from essence context. For use cases where you want to render a pattern outside of a blueprint.

```ts
function composePattern(
  patternId: string,
  props?: Record<string, unknown>,
): HTMLElement;
```

### EssenceApp(props, ...children)

Top-level convenience component that combines EssenceProvider + router setup.

```ts
function EssenceApp(
  props: { essence: EssenceV3 },
  ...children: Child[],
): HTMLElement;
```

This is the "one component to rule them all" — wraps children in an EssenceProvider and sets up routing from the blueprint.

---

## 4. Pattern Renderer

The pattern renderer maps pattern IDs to component trees. This is the bridge between the registry's declarative pattern definitions and actual rendered DOM.

```ts
// pattern-renderer.ts

type PatternRenderer = (props: PatternRenderProps) => HTMLElement;

interface PatternRenderProps {
  /** Pattern metadata from registry */
  pattern?: { id: string; components: string[]; };
  /** Resolved preset layout and code */
  preset?: { layout: { layout: string; atoms: string }; };
  /** DNA context */
  dna: { style: string; mode: string; density: string; contentGap: string };
  /** Props overrides */
  props: Record<string, unknown>;
  /** Slot content */
  slots: Record<string, () => HTMLElement>;
}

// Built-in pattern renderers
const PATTERN_RENDERERS: Map<string, PatternRenderer>;

// Register custom pattern renderer
function registerPattern(id: string, renderer: PatternRenderer): void;
```

### Built-in patterns

For Phase 1, the composition API ships with renderers for the most common patterns:
- `hero` — heading + subheading + CTA buttons
- `feature-grid` — grid of feature cards
- `cta-section` — call to action with heading + buttons
- `nav-header` — top navigation bar
- `footer` — site footer with links
- `content-section` — generic content block

Each renderer uses `@decantr/ui` components (Card, Button, etc.) with DNA-aware props from the essence context.

### Fallback renderer

For unregistered patterns, a generic fallback renders:
```ts
h('section', { class: css('_p6 _border _border-subtle _rounded') },
  h('p', { class: css('_text-sm _text-muted') }, `Pattern: ${patternId}`),
  h('p', { class: css('_text-xs _text-muted') }, 'No renderer registered for this pattern.'),
)
```

---

## 5. Shell Resolution

`composePage()` wraps patterns in a shell layout. Shells define the page structure (sidebar + main, top-nav + content, etc.).

```ts
function resolveShell(shellId: string, sections: HTMLElement[]): HTMLElement;
```

Built-in shells:
- `marketing` — full-width sections stacked vertically
- `sidebar-detail` — sidebar + main content
- `top-nav-main` — top nav + main content
- `centered` — centered content with max-width

---

## 6. Usage Examples

### Minimal app (LLM-friendly)
```ts
import { mount } from '@decantr/ui/runtime';
import { EssenceApp, composePage } from '@decantr/ui/compose';
import essence from './essence.json';

mount(document.getElementById('app')!, () =>
  EssenceApp({ essence },
    composePage('home')
  )
);
```

### Pattern composition
```ts
import { compose } from '@decantr/ui/compose';

// Inside an EssenceProvider context:
const hero = compose('hero', {
  props: { title: 'My App', subtitle: 'Built with Decantr' },
});
```

### Custom pattern renderer
```ts
import { registerPattern } from '@decantr/ui/compose';
import { Card, Button } from '@decantr/ui/components';
import { useDNA } from '@decantr/ui/essence';

registerPattern('pricing-table', ({ props, dna }) => {
  return h('section', { class: css(`_grid _gap${dna.contentGap} _p6`) },
    Card({ title: 'Free' }, Button({ variant: 'outline' }, 'Start Free')),
    Card({ title: 'Pro' }, Button({ variant: 'primary' }, 'Upgrade')),
  );
});
```

---

## 7. Success Criteria

1. `compose('hero')` renders a hero section with DNA-aware styling
2. `composePage('home')` resolves patterns from blueprint and renders in a shell
3. `EssenceApp` wraps children with EssenceProvider
4. `registerPattern` allows custom pattern renderers
5. Unregistered patterns render a graceful fallback
6. DNA context (density, theme, guard) flows through to rendered components
7. Tests cover compose, composePage, pattern registration, shell resolution
