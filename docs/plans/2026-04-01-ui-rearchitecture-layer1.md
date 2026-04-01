# @decantr/ui Layer 1 Re-Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `@decantr/ui` to TypeScript, fix architectural defects (global context, SSR globals, duplicate APIs, custom elements, CSS monolith, Suspense polling), and establish the foundation for Layers 2-3 (essence-aware runtime + composition API).

**Architecture:** The signal engine, runtime, and all subsystems convert from JS to TS with strict typing. Core defects are fixed: context becomes tree-scoped, SSR becomes per-request isolated, control flow uses comment anchors instead of custom elements, components use `component()` wrapper for ownership scoping, and CSS splits per-component.

**Tech Stack:** TypeScript 5.7+, tsup (build), vitest (test), jsdom (test environment)

**Spec:** `docs/specs/2026-04-01-decantr-ui-rearchitecture-design.md`

**CLAUDE.md:** Do not add Co-Authored-By lines to commits.

---

## Scope

This plan covers **Phases 1-2** of the migration strategy from the spec:
- **Phase 1:** Foundation types + build pipeline (tsconfig, tsup, core type definitions, migrate `runtime/` and `state/` to TS)
- **Phase 2:** Fix defects (remove duplicates, tree-scoped context, Suspense fix, custom element removal)

**Phase 3** (component migration — 107 files) will be a separate plan after this foundation is solid.

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `packages/ui/tsconfig.json` | TypeScript config for the package |
| `packages/ui/tsup.config.ts` | Build config: ESM output + declarations |
| `packages/ui/src/types.ts` | Core type definitions: Accessor, Setter, Component, Child, Context |
| `packages/ui/test/state.test.ts` | Tests for signal primitives and tree-scoped context |
| `packages/ui/test/runtime.test.ts` | Tests for h(), Show, For, mount, comment anchors |
| `packages/ui/test/suspense.test.ts` | Tests for signal-based Suspense |
| `packages/ui/vitest.config.ts` | Vitest config with jsdom |

### Renamed files (JS → TS)

| From | To |
|------|-----|
| `packages/ui/src/state/scheduler.js` | `packages/ui/src/state/scheduler.ts` |
| `packages/ui/src/state/index.js` | `packages/ui/src/state/index.ts` |
| `packages/ui/src/runtime/index.js` | `packages/ui/src/runtime/index.ts` |
| `packages/ui/src/runtime/component.js` | `packages/ui/src/runtime/component.ts` |
| `packages/ui/src/runtime/lifecycle.js` | `packages/ui/src/runtime/lifecycle.ts` |
| `packages/ui/src/runtime/show.js` | `packages/ui/src/runtime/show.ts` |
| `packages/ui/src/runtime/for.js` | `packages/ui/src/runtime/for.ts` |
| `packages/ui/src/index.js` | `packages/ui/src/index.ts` |

### Modified files

| File | Change |
|------|--------|
| `packages/ui/package.json` | Add build scripts, tsup dep, update exports to dist/ |
| `packages/css/src/runtime.ts` | Change `getInjectedClasses()` return from `Set<string>` to `string[]` |

### Deleted files

| File | Reason |
|------|--------|
| `packages/ui/src/core/index.js` | Barrel re-export of runtime — removed |
| `packages/ui/src/core/component.js` | Barrel re-export — removed |
| `packages/ui/src/core/lifecycle.js` | Barrel re-export — removed |

---

## Task 1: Build pipeline setup

**Files:**
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/tsup.config.ts`
- Create: `packages/ui/vitest.config.ts`
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationDir": "./dist",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 2: Create tsup.config.ts**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'runtime/index': 'src/runtime/index.ts',
    'state/index': 'src/state/index.ts',
    'state/scheduler': 'src/state/scheduler.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'esnext',
  splitting: false,
  sourcemap: true,
});
```

Note: This initial config only includes the files being migrated in this plan. It will be expanded as more files convert to TS in later phases.

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Update package.json**

Add to `scripts`:
```json
{
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

Add `tsup` to `devDependencies`:
```json
{
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsup": "^8.0.0",
    "vitest": "^3.0.0"
  }
}
```

**IMPORTANT:** Do NOT change the `exports` field yet — the existing `.js` source files are still consumed directly by the workbench and ui-site via Vite aliases. Exports will update to `dist/` after the full migration. For now, the build pipeline exists alongside the source imports.

- [ ] **Step 5: Install dependencies**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm install`

- [ ] **Step 6: Verify build pipeline works**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui typecheck`
Expected: May show errors for unconverted files — that's OK, we just need the pipeline to run.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/tsconfig.json packages/ui/tsup.config.ts packages/ui/vitest.config.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): add TypeScript build pipeline with tsup, tsconfig, and vitest"
```

---

## Task 2: Core type definitions

**Files:**
- Create: `packages/ui/src/types.ts`

- [ ] **Step 1: Create the core types file**

```ts
// packages/ui/src/types.ts
// Core type definitions for @decantr/ui

/** Signal getter — reads the current value and tracks the calling effect */
export type Accessor<T> = () => T;

/** Signal setter — updates the value, accepts direct value or updater function */
export type Setter<T> = (value: T | ((prev: T) => T)) => void;

/** A signal pair: [getter, setter] */
export type Signal<T> = [Accessor<T>, Setter<T>];

/** Valid children for h() and components */
export type Child =
  | string
  | number
  | boolean
  | null
  | undefined
  | Node
  | (() => Child)
  | Child[];

/** A component function that returns a DOM element */
export type Component<P extends Record<string, unknown> = Record<string, unknown>> = {
  (props: P, ...children: Child[]): HTMLElement;
  __d_isComponent?: true;
  displayName?: string;
};

/** Props base — all components accept these */
export interface BaseProps {
  class?: string;
  style?: string | Record<string, string>;
  ref?: (el: HTMLElement) => void;
}

/** Reactive node in the dependency graph */
export interface ReactiveNode {
  run: () => void;
  level: number;
  sources?: Set<Set<ReactiveNode>>;
  disposed?: boolean;
}

/** Owner in the reactive ownership tree */
export interface Owner {
  children: Set<Owner>;
  cleanups: Array<() => void>;
  onError?: (err: unknown) => void;
  context?: Map<symbol, unknown>;
  _parent?: Owner | null;
}

/** Context object created by createContext */
export interface Context<T> {
  readonly id: symbol;
  Provider: (value: T) => () => void;
  consume: () => T;
  defaultValue: T;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/types.ts
git commit -m "feat(ui): add core TypeScript type definitions"
```

---

## Task 3: Migrate scheduler.ts (ownership tree)

**Files:**
- Rename: `packages/ui/src/state/scheduler.js` → `packages/ui/src/state/scheduler.ts`
- Test: `packages/ui/test/state.test.ts`

- [ ] **Step 1: Write tests for the ownership tree and batching**

Create `packages/ui/test/state.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  createRoot, getOwner, runWithOwner, registerCleanup,
  disposeOwner, createChildOwner, batch, getCurrentEffect,
  setCurrentEffect, scheduleEffect, isBatching, flush,
  handleError, onError,
} from '../src/state/scheduler.js';

describe('ownership tree', () => {
  it('createRoot establishes an owner', () => {
    let captured: unknown = null;
    createRoot(() => {
      captured = getOwner();
    });
    expect(captured).not.toBeNull();
    expect(captured).toHaveProperty('children');
    expect(captured).toHaveProperty('cleanups');
  });

  it('runWithOwner temporarily sets the owner', () => {
    const outer = { children: new Set(), cleanups: [] };
    let inner: unknown = null;
    runWithOwner(outer as any, () => {
      inner = getOwner();
    });
    expect(inner).toBe(outer);
    // After runWithOwner, owner is restored
    expect(getOwner()).not.toBe(outer);
  });

  it('registerCleanup adds to current owner', () => {
    let cleaned = false;
    createRoot((dispose) => {
      registerCleanup(() => { cleaned = true; });
      dispose();
    });
    expect(cleaned).toBe(true);
  });

  it('disposeOwner runs cleanups in reverse order', () => {
    const order: number[] = [];
    createRoot((dispose) => {
      registerCleanup(() => order.push(1));
      registerCleanup(() => order.push(2));
      registerCleanup(() => order.push(3));
      dispose();
    });
    expect(order).toEqual([3, 2, 1]);
  });
});

describe('batching', () => {
  it('batch defers effect execution', () => {
    let runCount = 0;
    const effect = { run: () => { runCount++; }, level: 0, sources: new Set(), disposed: false };

    batch(() => {
      scheduleEffect(effect as any);
      scheduleEffect(effect as any); // duplicate should be deduped
      expect(runCount).toBe(0); // not yet run
    });

    // After batch, effects should have been flushed
    // Note: flush uses queueMicrotask, so we may need to await
  });
});
```

- [ ] **Step 2: Run tests to verify they pass against current JS**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: Tests pass (they import from the `.js` file which still exists).

- [ ] **Step 3: Rename scheduler.js → scheduler.ts and add types**

Rename the file and convert JSDoc annotations to TypeScript types. The implementing agent should:
1. `mv packages/ui/src/state/scheduler.js packages/ui/src/state/scheduler.ts`
2. Import types from `../types.ts` (`ReactiveNode`, `Owner`)
3. Convert all `@param`/`@returns` JSDoc to TS type annotations
4. Add explicit return types to all exported functions
5. Replace `/** @type {X} */` casts with TS type annotations

Key conversions:
- `let _currentEffect = null` → `let _currentEffect: ReactiveNode | null = null`
- `let currentOwner = null` → `let currentOwner: Owner | null = null`
- `function createRoot(fn)` → `function createRoot<T>(fn: (dispose: () => void) => T): T`
- `function registerCleanup(cleanup)` → `function registerCleanup(cleanup: () => void): void`

**CRITICAL:** The `Owner` type in `types.ts` now includes `context?: Map<symbol, unknown>` and `_parent?: Owner | null`. Add `_parent` tracking to `createRoot` and `createChildOwner`:

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T {
  const owner: Owner = { children: new Set(), cleanups: [], _parent: currentOwner };
  if (currentOwner) currentOwner.children.add(owner);
  const prev = currentOwner;
  currentOwner = owner;
  let result: T;
  try {
    result = fn(() => disposeOwner(owner));
  } finally {
    currentOwner = prev;
  }
  return result;
}
```

The `_parent` field is essential for tree-scoped context (Task 6).

- [ ] **Step 4: Update imports in files that import from scheduler**

Update `packages/ui/src/state/index.js` to import from `./scheduler.ts` (or `./scheduler` — bundlers resolve `.ts`). The implementing agent should check what files import from `scheduler` and update their extensions if needed.

- [ ] **Step 5: Run tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/state/scheduler.ts packages/ui/src/types.ts packages/ui/test/state.test.ts
git rm packages/ui/src/state/scheduler.js
git commit -m "feat(ui): migrate scheduler to TypeScript with Owner._parent tracking"
```

---

## Task 4: Migrate state/index.ts (signals, effects, context)

**Files:**
- Rename: `packages/ui/src/state/index.js` → `packages/ui/src/state/index.ts`
- Modify: `packages/ui/test/state.test.ts` (add signal tests)

- [ ] **Step 1: Add signal and effect tests to state.test.ts**

Append to `packages/ui/test/state.test.ts`:

```ts
import {
  createSignal, createEffect, createMemo, createContext,
  untrack, peek,
} from '../src/state/index.js';

describe('createSignal', () => {
  it('reads and writes a value', () => {
    const [count, setCount] = createSignal(0);
    expect(count()).toBe(0);
    setCount(5);
    expect(count()).toBe(5);
  });

  it('accepts an updater function', () => {
    const [count, setCount] = createSignal(10);
    setCount((prev) => prev + 5);
    expect(count()).toBe(15);
  });

  it('does not notify if value is the same (Object.is)', () => {
    let effectRuns = 0;
    const [val, setVal] = createSignal(1);
    createRoot(() => {
      createEffect(() => { val(); effectRuns++; });
    });
    expect(effectRuns).toBe(1);
    setVal(1); // same value
    expect(effectRuns).toBe(1); // no re-run
  });
});

describe('createEffect', () => {
  it('runs immediately and re-runs on dependency change', () => {
    const log: number[] = [];
    const [count, setCount] = createSignal(0);
    createRoot(() => {
      createEffect(() => { log.push(count()); });
    });
    expect(log).toEqual([0]);
    setCount(1);
    expect(log).toEqual([0, 1]);
  });

  it('cleans up previous run via returned function', () => {
    let cleaned = false;
    const [val, setVal] = createSignal(0);
    createRoot(() => {
      createEffect(() => {
        val();
        return () => { cleaned = true; };
      });
    });
    expect(cleaned).toBe(false);
    setVal(1); // triggers cleanup of previous run
    expect(cleaned).toBe(true);
  });
});

describe('createMemo', () => {
  it('derives a value from signals', () => {
    const [a, setA] = createSignal(2);
    const [b, setB] = createSignal(3);
    let derived: () => number;
    createRoot(() => {
      derived = createMemo(() => a() + b());
    });
    expect(derived!()).toBe(5);
    setA(10);
    expect(derived!()).toBe(13);
  });
});

describe('createContext (current — global)', () => {
  it('provides and consumes a value', () => {
    const ctx = createContext('default');
    expect(ctx.consume()).toBe('default');
    const cleanup = ctx.Provider('hello');
    expect(ctx.consume()).toBe('hello');
    cleanup();
    expect(ctx.consume()).toBe('default');
  });
});
```

- [ ] **Step 2: Run tests against current JS to establish baseline**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass.

- [ ] **Step 3: Rename index.js → index.ts and add types**

The implementing agent should:
1. `mv packages/ui/src/state/index.js packages/ui/src/state/index.ts`
2. Import `Accessor`, `Setter`, `Signal`, `ReactiveNode`, `Owner`, `Context` from `../types.ts`
3. Convert all JSDoc to TS type annotations
4. Type all exported functions explicitly

Key conversions:
- `export function createSignal(initialValue)` → `export function createSignal<T>(initialValue: T): Signal<T>`
- `export function createEffect(fn)` → `export function createEffect(fn: () => void | (() => void)): () => void`
- `export function createMemo(fn)` → `export function createMemo<T>(fn: () => T): Accessor<T>`
- `export function createContext(defaultValue)` → `export function createContext<T>(defaultValue: T): Context<T>`

**Do NOT change `createContext` behavior yet** — it stays global for now. Tree-scoping happens in Task 6.

- [ ] **Step 4: Run tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/state/index.ts packages/ui/test/state.test.ts
git rm packages/ui/src/state/index.js
git commit -m "feat(ui): migrate state/index to TypeScript with typed signals and effects"
```

---

## Task 5: Migrate runtime to TypeScript

**Files:**
- Rename: `packages/ui/src/runtime/index.js` → `packages/ui/src/runtime/index.ts`
- Rename: `packages/ui/src/runtime/component.js` → `packages/ui/src/runtime/component.ts`
- Rename: `packages/ui/src/runtime/lifecycle.js` → `packages/ui/src/runtime/lifecycle.ts`
- Rename: `packages/ui/src/runtime/show.js` → `packages/ui/src/runtime/show.ts`
- Rename: `packages/ui/src/runtime/for.js` → `packages/ui/src/runtime/for.ts`
- Test: `packages/ui/test/runtime.test.ts`

- [ ] **Step 1: Write runtime tests**

Create `packages/ui/test/runtime.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { h, mount, text } from '../src/runtime/index.js';
import { createSignal, createRoot } from '../src/state/index.js';
import { Show } from '../src/runtime/show.js';
import { For } from '../src/runtime/for.js';
import { component } from '../src/runtime/component.js';

describe('h()', () => {
  it('creates a DOM element with props', () => {
    const el = h('div', { class: 'test', id: 'foo' });
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('test');
    expect(el.id).toBe('foo');
  });

  it('appends string children as text', () => {
    const el = h('p', null, 'hello', ' ', 'world');
    expect(el.textContent).toBe('hello world');
  });

  it('appends DOM node children', () => {
    const child = h('span', null, 'inner');
    const parent = h('div', null, child);
    expect(parent.children.length).toBe(1);
    expect(parent.children[0].textContent).toBe('inner');
  });

  it('binds event listeners for on* props', () => {
    let clicked = false;
    const el = h('button', { onclick: () => { clicked = true; } });
    el.click();
    expect(clicked).toBe(true);
  });

  it('creates reactive bindings for function props', () => {
    const [cls, setCls] = createSignal('a');
    let el: HTMLElement;
    createRoot(() => {
      el = h('div', { class: cls });
    });
    expect(el!.className).toBe('a');
    setCls('b');
    expect(el!.className).toBe('b');
  });
});

describe('mount()', () => {
  it('mounts a component into a root element', () => {
    const root = document.createElement('div');
    mount(root, () => h('p', null, 'mounted'));
    expect(root.innerHTML).toContain('mounted');
  });
});

describe('component()', () => {
  it('wraps a function with ownership scoping', () => {
    const Comp = component<{}>(() => h('div', null, 'wrapped'));
    expect(Comp.__d_isComponent).toBe(true);
    const el = Comp({});
    expect(el.textContent).toBe('wrapped');
  });
});
```

- [ ] **Step 2: Run tests against current JS**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: Tests pass.

- [ ] **Step 3: Rename all runtime files to .ts and add types**

The implementing agent should rename all 5 runtime files from `.js` to `.ts` and convert JSDoc to TypeScript annotations.

Key type conversions:

**runtime/index.ts:**
- `function h(tag, props, ...children)` → `function h(tag: string, props?: Record<string, unknown> | null, ...children: Child[]): HTMLElement`
- `function mount(root, component)` → `function mount(root: HTMLElement, component: () => HTMLElement): void`
- `function text(getter)` → `function text(getter: string | (() => string)): Text`
- Remove `cond()` and `list()` exports (they're being deleted in Task 7)

**runtime/component.ts:**
- `function component(fn)` → `function component<P extends Record<string, unknown> = Record<string, unknown>>(fn: (props: P, ...children: Child[]) => HTMLElement): Component<P>`
- Import `Component`, `Child` from `../types.ts`

**runtime/show.ts:**
- `function Show(when, renderFn, fallbackFn)` → `function Show(when: () => boolean, renderFn: () => Node, fallbackFn?: () => Node): HTMLElement`

**runtime/for.ts:**
- `function For<T>(each, keyFn, renderFn)` → `function For<T>(each: () => T[], keyFn: (item: T, index: number) => unknown, renderFn: (item: T, index: number) => Node): HTMLElement`

**runtime/lifecycle.ts:**
- `function onMount(fn)` → `function onMount(fn: () => void | (() => void)): void`
- `function onDestroy(fn)` → `function onDestroy(fn: () => void): void`

- [ ] **Step 4: Run tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/runtime/*.ts packages/ui/test/runtime.test.ts
git rm packages/ui/src/runtime/*.js
git commit -m "feat(ui): migrate runtime to TypeScript with typed h(), mount(), Show, For, component"
```

---

## Task 6: Tree-scoped context

**Files:**
- Modify: `packages/ui/src/state/index.ts`
- Modify: `packages/ui/test/state.test.ts`

- [ ] **Step 1: Write failing tests for tree-scoped context**

Add to `packages/ui/test/state.test.ts`:

```ts
describe('createContext (tree-scoped)', () => {
  it('provides and consumes via owner tree', () => {
    const ctx = createContext<string>('default');
    let consumed: string = '';

    createRoot(() => {
      ctx.Provider('outer');
      createRoot(() => {
        consumed = ctx.consume();
      });
    });

    expect(consumed).toBe('outer');
  });

  it('nested providers shadow parent', () => {
    const ctx = createContext<string>('default');
    let outerVal = '';
    let innerVal = '';

    createRoot(() => {
      ctx.Provider('outer');
      outerVal = ctx.consume();

      createRoot(() => {
        ctx.Provider('inner');
        innerVal = ctx.consume();
      });
    });

    expect(outerVal).toBe('outer');
    expect(innerVal).toBe('inner');
  });

  it('falls back to default when no provider', () => {
    const ctx = createContext<number>(42);
    let val: number = 0;

    createRoot(() => {
      val = ctx.consume();
    });

    expect(val).toBe(42);
  });

  it('sibling scopes are isolated', () => {
    const ctx = createContext<string>('default');
    let valA = '';
    let valB = '';

    createRoot(() => {
      createRoot(() => {
        ctx.Provider('A');
        valA = ctx.consume();
      });
      createRoot(() => {
        valB = ctx.consume(); // should NOT see 'A'
      });
    });

    expect(valA).toBe('A');
    expect(valB).toBe('default');
  });
});
```

- [ ] **Step 2: Run tests — the tree-scoped tests should FAIL**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: The "nested providers shadow parent" and "sibling scopes are isolated" tests FAIL (current global context doesn't support this).

- [ ] **Step 3: Implement tree-scoped context**

Replace the `createContext` implementation in `packages/ui/src/state/index.ts`:

```ts
import type { Context, Owner } from '../types.js';
import { getOwner } from './scheduler.js';

export function createContext<T>(defaultValue: T): Context<T> {
  const id = Symbol('context');

  return {
    id,
    defaultValue,

    Provider(value: T): () => void {
      const owner = getOwner();
      if (!owner) {
        throw new Error('createContext.Provider must be called within a reactive scope (createRoot)');
      }
      if (!owner.context) owner.context = new Map();
      owner.context.set(id, value);
      return () => {
        if (owner.context) owner.context.delete(id);
      };
    },

    consume(): T {
      let current: Owner | null | undefined = getOwner();
      while (current) {
        if (current.context && current.context.has(id)) {
          return current.context.get(id) as T;
        }
        current = current._parent;
      }
      return defaultValue;
    },
  };
}
```

**IMPORTANT:** This requires `Owner` to have `_parent` set (done in Task 3) and `context` as an optional `Map<symbol, unknown>` (defined in types.ts).

Also remove the old `_ctxId`, `_ctxMap` variables.

- [ ] **Step 4: Run tests — all should pass now**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass, including the new tree-scoped context tests.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/state/index.ts packages/ui/test/state.test.ts
git commit -m "feat(ui): implement tree-scoped context via owner chain traversal"
```

---

## Task 7: Remove duplicate APIs and core/ barrel

**Files:**
- Modify: `packages/ui/src/runtime/index.ts`
- Delete: `packages/ui/src/core/index.js`
- Delete: `packages/ui/src/core/component.js`
- Delete: `packages/ui/src/core/lifecycle.js`

- [ ] **Step 1: Remove cond() and list() from runtime/index.ts**

Delete the `cond()` function (the one that creates `d-cond`) and the `list()` function (the one that creates `d-list`) from `packages/ui/src/runtime/index.ts`. Also remove them from any export statements.

These are replaced by `Show` and `For` which have proper per-branch/per-item scoping.

- [ ] **Step 2: Delete the core/ barrel directory**

```bash
rm packages/ui/src/core/index.js packages/ui/src/core/component.js packages/ui/src/core/lifecycle.js
rmdir packages/ui/src/core
```

- [ ] **Step 3: Update all internal imports from ../core/ to ../runtime/**

98 files import from `../core/index.js`. The implementing agent should run a find-and-replace across `packages/ui/src/`:

Replace all occurrences of:
- `from '../core/index.js'` → `from '../runtime/index.js'`
- `from '../core/component.js'` → `from '../runtime/component.js'`
- `from '../core/lifecycle.js'` → `from '../runtime/lifecycle.js'`

Verify with: `grep -r "../core/" packages/ui/src/` — should return zero results.

- [ ] **Step 4: Run tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A packages/ui/src/
git commit -m "refactor(ui): remove cond/list duplicates and core/ barrel, consolidate imports to runtime/"
```

---

## Task 8: Remove custom element tags from Show and For

**Files:**
- Modify: `packages/ui/src/runtime/show.ts`
- Modify: `packages/ui/src/runtime/for.ts`
- Modify: `packages/ui/test/runtime.test.ts`

- [ ] **Step 1: Add tests for clean DOM output**

Add to `packages/ui/test/runtime.test.ts`:

```ts
describe('Show — clean DOM', () => {
  it('does not create custom elements in the DOM', () => {
    const [visible, setVisible] = createSignal(true);
    let container: Node;
    createRoot(() => {
      container = Show(visible, () => h('span', null, 'hello'));
    });
    // Should not be a custom element like 'd-show'
    expect((container! as any).tagName).not.toBe('D-SHOW');
  });
});

describe('For — clean DOM', () => {
  it('does not create custom elements in the DOM', () => {
    const [items] = createSignal([1, 2, 3]);
    let container: Node;
    createRoot(() => {
      container = For(items, (item) => item, (item) => h('span', null, String(item)));
    });
    expect((container! as any).tagName).not.toBe('D-FOR');
  });
});
```

- [ ] **Step 2: Run tests — custom element tests should FAIL**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: The "does not create custom elements" tests fail (currently `Show` creates `d-show`).

- [ ] **Step 3: Update Show to use a DocumentFragment or div**

In `packages/ui/src/runtime/show.ts`, replace:
```ts
const container = document.createElement('d-show');
```
with:
```ts
const container = document.createElement('div');
container.style.display = 'contents'; // invisible wrapper
```

Using `display: contents` makes the wrapper transparent in layout — its children participate in the parent's layout as if the wrapper didn't exist. This is the cleanest approach that doesn't require the complexity of comment-node anchor management.

- [ ] **Step 4: Update For to use a div with display:contents**

Same pattern in `packages/ui/src/runtime/for.ts`:
```ts
const container = document.createElement('div');
container.style.display = 'contents';
```

- [ ] **Step 5: Run tests — all should pass**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/runtime/show.ts packages/ui/src/runtime/for.ts packages/ui/test/runtime.test.ts
git commit -m "refactor(ui): replace custom element tags with display:contents wrappers in Show/For"
```

---

## Task 9: Fix Suspense polling

**Files:**
- Modify: `packages/ui/src/runtime/index.ts` (Suspense function)
- Create: `packages/ui/test/suspense.test.ts`

- [ ] **Step 1: Write Suspense test**

Create `packages/ui/test/suspense.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { createSignal, createRoot } from '../src/state/index.js';

describe('Suspense signal-based tracking', () => {
  it('should not use setInterval', () => {
    const spy = vi.spyOn(globalThis, 'setInterval');
    // Import Suspense after spy is in place
    // The implementing agent should trigger a Suspense render
    // and verify setInterval is NOT called
    spy.mockRestore();
  });
});
```

Note: The implementing agent should write a more complete test that verifies Suspense switches from fallback to content when a pending signal resolves, WITHOUT using setInterval.

- [ ] **Step 2: Replace setInterval with signal-based tracking**

In `packages/ui/src/runtime/index.ts`, the Suspense function currently:
1. Checks `_pendingQueries.size > 0`
2. Uses `setInterval(16ms)` to poll

Replace with a signal approach:

```ts
const [pendingCount, setPendingCount] = createSignal(0);

export function trackPending(promise: Promise<unknown>): void {
  setPendingCount(c => c + 1);
  promise.finally(() => setPendingCount(c => c - 1));
}

export function Suspense(props: { fallback: () => Node }, ...children: Child[]): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'contents';
  // ...existing child collection...

  createEffect(() => {
    if (pendingCount() > 0) {
      showFallback();
    } else {
      showChildren();
    }
  });

  return container;
}
```

The implementing agent should read the full current Suspense implementation and adapt this pattern to it, keeping the existing show/hide logic but replacing the polling mechanism.

- [ ] **Step 3: Run tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/runtime/index.ts packages/ui/test/suspense.test.ts
git commit -m "fix(ui): replace Suspense setInterval polling with signal-based pending tracking"
```

---

## Task 10: Fix @decantr/css getInjectedClasses return type

**Files:**
- Modify: `packages/css/src/runtime.ts`

- [ ] **Step 1: Change return type from Set to Array**

In `packages/css/src/runtime.ts`, change:

```ts
export function getInjectedClasses(): Set<string> {
  return new Set(injected);
}
```

to:

```ts
export function getInjectedClasses(): string[] {
  return [...injected];
}
```

- [ ] **Step 2: Rebuild @decantr/css**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/css build`

- [ ] **Step 3: Run all tests**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test && pnpm --filter @decantr/ui-catalog test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/css/src/runtime.ts
git commit -m "fix(css): change getInjectedClasses return type from Set to string[]"
```

---

## Task 11: Migrate packages/ui/src/index.ts

**Files:**
- Rename: `packages/ui/src/index.js` → `packages/ui/src/index.ts`

- [ ] **Step 1: Rename and add types**

The root `index.ts` should re-export the core public API with types:

```ts
// packages/ui/src/index.ts
export { VERSION } from './version.js';

// Re-export core types
export type {
  Accessor, Setter, Signal, Child, Component, BaseProps,
  ReactiveNode, Owner, Context,
} from './types.js';
```

Create `packages/ui/src/version.ts`:
```ts
export const VERSION = '0.2.0';
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/index.ts packages/ui/src/version.ts
git rm packages/ui/src/index.js
git commit -m "feat(ui): migrate root index to TypeScript, export core types, bump to 0.2.0"
```

---

## Task 12: Update tsup config and verify build

**Files:**
- Modify: `packages/ui/tsup.config.ts`

- [ ] **Step 1: Update tsup entries for all migrated files**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'types': 'src/types.ts',
    'runtime/index': 'src/runtime/index.ts',
    'runtime/component': 'src/runtime/component.ts',
    'runtime/lifecycle': 'src/runtime/lifecycle.ts',
    'runtime/show': 'src/runtime/show.ts',
    'runtime/for': 'src/runtime/for.ts',
    'state/index': 'src/state/index.ts',
    'state/scheduler': 'src/state/scheduler.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'esnext',
  splitting: false,
  sourcemap: true,
  external: ['@decantr/css'],
});
```

- [ ] **Step 2: Build and verify**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui build`

Expected: `dist/` contains `.js` and `.d.ts` files for all entries. Verify:
```bash
ls packages/ui/dist/index.js packages/ui/dist/index.d.ts
ls packages/ui/dist/runtime/index.js packages/ui/dist/runtime/index.d.ts
ls packages/ui/dist/state/index.js packages/ui/dist/state/index.d.ts
```

- [ ] **Step 3: Run all tests one final time**

Run: `cd /Users/davidaimi/projects/decantr-monorepo && pnpm --filter @decantr/ui test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/tsup.config.ts packages/ui/dist/
git commit -m "feat(ui): update tsup config for all migrated TS files, verify build output"
```

---

## Task 13: Update workbench/ui-site Vite aliases

**Files:**
- Modify: `apps/workbench/vite.config.js`
- Modify: `apps/ui-site/vite.config.js`

The workbench and ui-site use Vite aliases that point to `packages/ui/src`. These still work because the `.ts` files are resolved by Vite natively. However, the import paths from `../core/` no longer exist.

- [ ] **Step 1: Verify workbench still starts**

Run: `pnpm --filter @decantr/workbench dev` briefly, check for import errors.

If there are errors related to `../core/` imports in component files (which are still `.js`), those components haven't been migrated yet — they were updated in Task 7 to use `../runtime/`. Verify all component files use `../runtime/` not `../core/`.

- [ ] **Step 2: Verify ui-site still starts**

Run: `pnpm --filter @decantr/ui-site dev` briefly.

- [ ] **Step 3: Fix any issues and commit**

```bash
git add -A
git commit -m "fix: update Vite aliases and verify workbench + ui-site after TS migration"
```

---

## Task 14: Update CLAUDE.md and documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the Build and Test section**

Add `@decantr/ui` build command:
```
pnpm --filter @decantr/ui build    # Build @decantr/ui (TypeScript → JS + .d.ts)
pnpm --filter @decantr/ui test     # Run @decantr/ui tests
pnpm --filter @decantr/ui typecheck # Type-check without emit
```

- [ ] **Step 2: Add a note about the TS migration**

In the `@decantr/ui` row of the Packages table, update description:
```
| `@decantr/ui` | `packages/ui/` | UI framework — signal-based reactivity, atomic CSS, components (TypeScript, tree-scoped context) |
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for @decantr/ui TypeScript migration"
```

---

## Notes for Implementing Agents

### File extension handling

When renaming `.js` → `.ts`, internal imports between the migrated files need their extensions updated. Vite and tsup both handle extensionless imports, but some imports may explicitly use `.js` — check each file.

### Components are still JS

This plan only migrates `runtime/`, `state/`, and the root `index.ts`. The 107 component files in `components/` remain as `.js` for now. They import from `runtime/` — TypeScript files can be imported from JS files when using Vite (which handles the resolution).

### The workbench and ui-site continue to work

Both apps use Vite aliases pointing to `packages/ui/src`. Vite natively handles `.ts` files, so the migration is transparent to these consumers. The `dist/` output is for npm publishing and consumers outside the monorepo.

### Tree-scoped context depends on _parent

Task 6 (tree-scoped context) depends on Task 3 adding `_parent` to the `Owner` type and tracking it in `createRoot`. If Task 3 is implemented correctly, Task 6 should work. If the implementing agent encounters issues, check that `_parent` is being set on every `createRoot` call.
