# Decantr UI Re-Architecture Design

**Date:** 2026-04-01
**Status:** Approved
**Scope:** Layer 1 — Signal Engine + Native DOM foundation cleanup

---

## 1. Vision

`@decantr/ui` is being re-architected as an **AI-native, essence-driven UI framework** — not "another React alternative" but a fundamentally different approach where UI is described as design intent and rendered through a design intelligence layer.

The re-architecture is structured as three layers, delivered incrementally:

```
Layer 3: Composition API          → compose(), EssenceProvider (future spec)
Layer 2: Essence-Aware Runtime    → DNA context, guard validation (future spec)
Layer 1: Signal Engine + DOM      → THIS SPEC — foundation cleanup
```

### Principles

- **Lightweight-first**: Native HTML/CSS/JS at runtime. TypeScript compiles away to zero overhead.
- **AI-native**: Every API is typed, predictable, and self-describing. LLMs and tooling can read the type signatures to understand the entire framework without training data.
- **Essence-symbiotic**: The UI framework is the reference consumer of the Decantr design intelligence layer. It reads from the same APIs any framework would — just deeply and natively.
- **Monorepo-respectful**: Core packages (`essence-spec`, `registry`, `core`, `mcp-server`, `cli`, `vite-plugin`) remain framework-agnostic. Nothing in this re-architecture leaks into them.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  MONOREPO CORE (framework-agnostic, UNTOUCHED)          │
│  essence-spec · registry · core · mcp-server · cli      │
│  ↕ standard API: resolve, validate, search, guard       │
└────────────────────────┬────────────────────────────────┘
                         │ consumes (same API any framework would use)
┌────────────────────────▼────────────────────────────────┐
│  @decantr/ui                                            │
│  Layer 3: Composition API (future)                      │
│  Layer 2: Essence-Aware Runtime (future)                │
│  Layer 1: Signal Engine + Native DOM (THIS SPEC)        │
├──────────────────────────────────────────────────────────┤
│  @decantr/css (framework-agnostic, minor fixes only)    │
└──────────────────────────────────────────────────────────┘
```

### What changes vs. what stays

| Package | Change |
|---------|--------|
| `@decantr/essence-spec` | No changes |
| `@decantr/registry` | No changes |
| `@decantr/core` | No changes |
| `@decantr/mcp-server` | No changes |
| `@decantr/cli` | No changes |
| `@decantr/vite-plugin` | No changes |
| `@decantr/css` | Minor: fix return types, clean up API surface |
| `@decantr/ui` | Major: TS migration, fix defects, prepare for Layers 2-3 |
| `@decantr/ui-chart` | Later phase: align with new component model |
| `@decantr/ui-catalog` | Later phase: update stories for new API |

---

## 2. Layer 1 Scope — What Gets Fixed

### 2.1 TypeScript Migration

**Goal:** Convert all of `packages/ui/src/` from `.js` to `.ts`. Ship `.d.ts` declaration files alongside compiled JS output.

**Approach:**
- Rename `.js` → `.ts` for all source files
- Convert JSDoc annotations to TypeScript type annotations
- Define public interfaces for all component props
- Add `tsconfig.json` to `packages/ui/` targeting ESNext (no downlevel transforms)
- Use `tsup` or `tsc` for compilation, outputting `.js` + `.d.ts` to `dist/`
- Update `package.json` exports to point to `dist/` instead of `src/`

**Key type definitions to create:**

```ts
// Signal primitives
type Accessor<T> = () => T;
type Setter<T> = (value: T | ((prev: T) => T)) => void;
function createSignal<T>(initial: T): [Accessor<T>, Setter<T>];
function createEffect(fn: () => void | (() => void)): void;
function createMemo<T>(fn: () => T): Accessor<T>;

// Runtime
function h(tag: string, props?: Record<string, unknown> | null, ...children: Child[]): HTMLElement;
type Child = string | number | Node | null | false | undefined | (() => Child) | Child[];
function mount(root: HTMLElement, component: () => HTMLElement): void;

// Component pattern
type Component<P = {}> = (props: P, ...children: Child[]) => HTMLElement;
```

**What this enables:**
- Every LLM and code editor can read the full API surface from `.d.ts` files
- Type errors catch API misuse (like the `[object Set]` and `[object Object]` bugs) at compile time
- The MCP server can auto-generate tool schemas from TypeScript types in the future

### 2.2 Remove Duplicate APIs

**Delete:**
- `cond()` from `packages/ui/src/runtime/index.ts` — `Show` is the canonical replacement
- `list()` from `packages/ui/src/runtime/index.ts` — `For` is the canonical replacement
- `packages/ui/src/core/` directory entirely — these are barrel re-exports of `runtime/`

**Update:**
- All internal component imports that reference `../core/index.js` → `../runtime/index.js`
- This affects ~98 component files that import `h` from `../core/index.js`

**Keep:**
- `tags` proxy (`packages/ui/src/tags/`) — stays as optional convenience, imports from `runtime/`
- `text()` function in runtime — useful utility

### 2.3 Tree-Scoped Context

**Problem:** `createContext()` currently uses a global `Map`. Nested providers of the same context overwrite each other.

**Fix:** Context values attach to the ownership tree.

```ts
interface Context<T> {
  Provider: (value: T) => () => void;  // returns cleanup
  consume: () => T;                     // walks owner chain
  defaultValue: T;
}

function createContext<T>(defaultValue: T): Context<T>;
```

**Implementation:**
- `Provider(value)` attaches `{ contextId, value }` to the current owner node
- `consume()` walks up the owner chain (`owner._parent`) looking for a matching `contextId`
- Falls back to `defaultValue` if no provider found
- Cleanup removes the attachment from the owner

**Why this matters for Layer 2:** The essence DNA context (theme, density, guard mode) needs tree scoping. A layout section at `comfortable` density containing a sidebar at `compact` density requires nested providers that don't clobber each other.

### 2.4 Per-Request SSR Context

**Problem:** SSR uses `globalThis.__d_ssr_*` mutation. Concurrent `renderToString()` calls clobber each other.

**Fix:** SSR context travels through the ownership tree, not global state.

```ts
interface SSRContext {
  html: string[];
  head: string[];
  isSSR: true;
}

function renderToString(component: () => HTMLElement): string;
function renderToStream(component: () => HTMLElement): ReadableStream<string>;
```

**Implementation:**
- `renderToString()` creates an `SSRContext` and sets it as the root owner's context
- The SSR-mode `h()` function reads SSR context from the nearest owner (via `consume()`)
- No `globalThis` mutation — each call is isolated
- `isSSR()` checks the ownership tree for an SSR context, not a global flag

**Dependency:** Requires tree-scoped context (2.3) to be implemented first.

### 2.5 Remove Custom Element Tags

**Problem:** Control flow primitives create non-standard DOM elements (`d-cond`, `d-list`, `d-show`, `d-for`, `d-route`, `d-suspense`, `d-transition`, `d-boundary`).

**Fix:** Use `Comment` nodes as anchors and `DocumentFragment` for grouping where needed.

```ts
// Before:
const container = document.createElement('d-show');

// After:
const anchor = document.createComment('show');
// Insert/remove siblings relative to anchor
```

**Implementation:**
- `Show`: replace `d-show` with a comment anchor. Branch nodes inserted after the anchor.
- `For`: replace `d-for` with a comment anchor. Item nodes inserted after the anchor.
- `Suspense`: replace `d-suspense` with comment anchors for fallback/content boundaries.
- Router outlet: replace `d-route` with comment anchor.
- `ErrorBoundary`, `Transition`, `Portal`: same pattern.

**Why:** Clean DOM output. No non-standard elements for validators, testing tools, or SSR to deal with.

### 2.6 Component Wrapping with `component()`

**Problem:** Components are bare functions without automatic ownership scoping. Effects and cleanups created inside components don't get properly scoped to the component's lifecycle.

**Fix:** The standard component pattern uses `component()` wrapper.

```ts
// The component() wrapper creates a createRoot scope and attaches ownership
export const Button = component<ButtonProps>((props, ...children) => {
  // Everything in here is owned — effects auto-cleanup when component unmounts
  const el = h('button', { class: buttonVariants(props) }, ...children);
  return el;
});
```

**Implementation:**
- `component<P>(fn)` creates a typed wrapper that:
  1. Opens a `createRoot` scope
  2. Untracks the component body (signal reads during init don't subscribe the caller)
  3. Attaches the owner to the returned DOM node
  4. Returns a properly typed `Component<P>` function
- All 107 components migrate to this pattern during the TS migration
- The type system enforces that components return `HTMLElement` and accept typed props

### 2.7 CSS Architecture Cleanup

**Problem:** Duplicate CSS infrastructure between `@decantr/css` and `@decantr/ui/css`. The `_base.js` monolith loads all component CSS on first render.

**Fix — two parts:**

**Part A: Clarify package boundaries**
- `@decantr/css` (framework-agnostic): atom resolution, CSS injection, breakpoints. Fix `getInjectedClasses()` to return `string[]` instead of `Set<string>`.
- `@decantr/ui/css`: theme registry, token derivation, design token management. Imports `@decantr/css` for atom resolution. No duplicate atom/runtime code.

**Part B: Per-component CSS**
- Split `_base.js` monolith: each component file contains its own structural CSS
- Each component calls `injectCSS(componentId, cssString)` on first render — idempotent, only injects once per component type
- Result: using only `Button` loads only Button CSS. Using 50 components loads 50 components' CSS. Not all 107.

```ts
// Inside Button.ts
const BUTTON_CSS = `
  .d-btn { display: inline-flex; align-items: center; ... }
  .d-btn-primary { ... }
`;

export const Button = component<ButtonProps>((props, ...children) => {
  injectCSS('button', BUTTON_CSS);
  // ...
});
```

### 2.8 Fix Suspense Polling

**Problem:** `Suspense` uses `setInterval(16ms)` to poll for pending queries resolving.

**Fix:** Use a signal that tracks pending count. When it reaches zero, swap from fallback to content.

```ts
const [pending, setPending] = createSignal(0);
// Each async operation increments/decrements pending
// Suspense reacts to pending() reaching 0
```

---

## 3. What Stays Unchanged

### Signal primitives (keep as-is, just add types)
- `createSignal`, `createEffect`, `createMemo`, `batch`
- `createRoot`, `getOwner`, `runWithOwner`, `onError`
- `untrack`, `peek`, `on`

### Advanced state (keep as-is, just add types)
- `createStore`, `createDeepStore`, `produce`, `reconcile`
- `mapArray`, `indexArray`, `createProjection`
- `createSelector`, `createDeferred`, `createHistory`
- `useLocalStorage`, middleware system
- Devtools (all of `devtools.ts`)

### Subsystems (keep as-is, just add types)
- Router (`packages/ui/src/router/`) — all features
- Form system (`packages/ui/src/form/`)
- Data layer (`packages/ui/src/data/`)
- i18n (`packages/ui/src/i18n/`)
- Tannins (`packages/ui/src/tannins/`)
- Icons (`packages/ui/src/icons/`)

### Component library (keep components, update patterns)
- All 107 components keep their current API and behavior
- They get: TypeScript types, `component()` wrapper, per-component CSS, `runtime/` imports
- No functional changes to how any component works

---

## 4. Build System

### TypeScript Compilation

```
packages/ui/
├── src/           ← TypeScript source (.ts files)
├── dist/          ← Compiled output (.js + .d.ts)
├── tsconfig.json  ← ESNext target, strict mode
└── package.json   ← exports point to dist/
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationDir": "./dist",
    "outDir": "./dist",
    "strict": true,
    "skipLibCheck": true,
    "jsx": "preserve"
  },
  "include": ["src/**/*.ts"]
}
```

**Build tool:** `tsup` (already available in the monorepo ecosystem via vitest dependencies). Outputs ESM `.js` + `.d.ts` files.

**Package.json exports update:**
```json
{
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
    "./runtime": { "import": "./dist/runtime/index.js", "types": "./dist/runtime/index.d.ts" },
    "./state": { "import": "./dist/state/index.js", "types": "./dist/state/index.d.ts" },
    "./components": { "import": "./dist/components/index.js", "types": "./dist/components/index.d.ts" },
    ...
  }
}
```

### Compiler Strategy

The existing custom compiler (`packages/ui/compiler/`) is **retained but scoped** to Decantr-specific transforms:
- The build-time essence resolver (Layer 2, future) will live here
- Generic bundling defers to Vite/esbuild (used by workbench and ui-site already)
- The dev server (`compiler/dev.js`) stays for hot-reload
- Lint rules stay (prototype-pollution, ReDoS detection, etc.)

---

## 5. Migration Strategy

### Incremental, not big-bang

The migration happens in phases within Layer 1, each producing working software:

1. **Foundation types + build pipeline** — tsconfig, tsup, package.json exports. Create core type definitions (`Accessor`, `Setter`, `Component`, `Child`). Migrate `runtime/` and `state/` to TS.

2. **Fix defects** — Remove duplicates (`cond`, `list`, `core/` barrel), fix context to tree-scoped, fix Suspense polling, remove custom element tags.

3. **Component migration** — Migrate all 107 components to TS with `component()` wrapper and per-component CSS. This is the bulk of the work but each component is independent.

4. **SSR fix** — Per-request SSR context using the new tree-scoped context. Update hydration.

5. **Subsystem migration** — Router, form, data, i18n, icons to TS. These are independent of each other.

6. **CSS cleanup** — Clarify `@decantr/css` vs `@decantr/ui/css` boundaries. Fix `getInjectedClasses` return type. Delete `_base.js` monolith after all components have per-component CSS.

### Backwards compatibility

- All public API names stay the same (`createSignal`, `h`, `Button`, etc.)
- Import paths stay the same (`@decantr/ui/runtime`, `@decantr/ui/components`, etc.)
- The only breaking change: `cond()` and `list()` are removed (replaced by `Show`/`For`)
- The `core/` import path is removed (replaced by `runtime/`)
- Components that relied on the `_base.js` monolith now inject their own CSS (transparent to consumers)

---

## 6. Success Criteria

Layer 1 is complete when:

1. All source files in `packages/ui/src/` are TypeScript
2. `pnpm --filter @decantr/ui build` produces `dist/` with `.js` + `.d.ts` files
3. All existing tests pass (migrated to TS)
4. `createContext` is tree-scoped (test: nested providers don't clobber)
5. SSR supports concurrent `renderToString()` calls (test: two renders in parallel)
6. No custom element tags in DOM output (test: render a page, assert no `d-*` elements)
7. All components use `component()` wrapper (grep: no bare component exports)
8. Each component injects only its own CSS (test: import Button, check only button CSS in DOM)
9. `cond()` and `list()` no longer exported
10. `core/` import path no longer exists
11. `getInjectedClasses()` returns `string[]`
12. Suspense uses signal-based tracking, not `setInterval`

---

## 7. Future Layers (out of scope, documented for context)

### Layer 2: Essence-Aware Runtime (next spec)
- `EssenceContext` — tree-scoped context providing theme, density, guard mode
- Components read DNA from context and validate against guards at render time
- Token resolution from essence → CSS custom properties flows through context
- Guard violations surface as console warnings (guided mode) or thrown errors (strict mode)

### Layer 3: Composition API (future spec)
- `compose(patternName, options)` — resolves pattern from registry, applies DNA, renders DOM
- Build-time essence resolver — reads `essence.json` + blueprint, generates optimized component tree
- SSG: resolve at build time → emit HTML. SSR: resolve per-request. Hydration: attach signals only.
- This is the "LLMs write 10 lines of composition code instead of 50 files" layer.
