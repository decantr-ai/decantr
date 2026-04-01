# Layer 2: Essence-Aware Runtime Design

**Date:** 2026-04-01
**Status:** Approved
**Scope:** `packages/ui/src/essence/` — new module bridging design intelligence into the runtime

---

## 1. What Layer 2 Does

Layer 2 makes `@decantr/ui` components **essence-aware**. Instead of components being dumb DOM builders, they know what design DNA they're operating under and can validate themselves against guard rules at render time.

### Before (Layer 1 only)
```ts
Button({ variant: 'primary' })
// Renders a button. Has no idea what theme, density, or guard mode is active.
// No connection to the essence spec.
```

### After (Layer 2)
```ts
EssenceProvider({ essence: myEssence }, () =>
  Button({ variant: 'primary' })
  // Button reads the active theme from essence context
  // Button reads density level and adapts spacing
  // In strict guard mode, Button validates itself against DNA rules
  // Guard violations surface as console warnings or errors
)
```

---

## 2. Architecture

### New module: `packages/ui/src/essence/`

```
packages/ui/src/essence/
├── index.ts          ← Public API: EssenceProvider, useEssence, useGuard, useDNA
├── context.ts        ← EssenceContext definition using tree-scoped createContext
├── provider.ts       ← EssenceProvider component that parses essence and provides context
├── hooks.ts          ← useEssence(), useDNA(), useDensity(), useGuardMode() — context consumers
├── guard.ts          ← Runtime guard validation: validateComponent(), guardWarn(), guardError()
├── tokens.ts         ← Token resolution: essence DNA → CSS custom properties
```

### Dependency flow

```
@decantr/essence-spec (types + evaluateGuard + computeDensity)
    ↓ imported by
packages/ui/src/essence/ (the bridge)
    ↓ provides context to
packages/ui/src/components/ (components consume via useEssence/useDNA)
    ↓ also uses
packages/ui/src/css/theme-registry.ts (token application)
```

**CRITICAL:** `@decantr/essence-spec` becomes a dependency of `@decantr/ui` (it's already a workspace package). This is the correct direction — the UI framework consuming the spec package, not the other way around.

---

## 3. EssenceContext

Uses the tree-scoped `createContext` from Layer 1.

```ts
// context.ts
import { createContext } from '../state/index.js';
import type { EssenceV3, GuardMode, DensityLevel, ThemeStyle, ThemeMode, ThemeShape } from '@decantr/essence-spec';

export interface EssenceContextValue {
  /** The full essence spec (null if no provider) */
  essence: EssenceV3 | null;

  /** Resolved DNA values (convenience accessors) */
  style: ThemeStyle | string;
  mode: ThemeMode;
  shape: ThemeShape | string;
  density: DensityLevel;
  contentGap: string;
  guardMode: GuardMode;
  dnaEnforcement: 'error' | 'warn' | 'off';
  blueprintEnforcement: 'warn' | 'off';
  personality: string[];
  wcagLevel: string;

  /** Guard validation function bound to this essence */
  validateGuard: (context: Record<string, unknown>) => GuardViolation[];
}

export const EssenceContext = createContext<EssenceContextValue>({
  essence: null,
  style: 'auradecantism',
  mode: 'dark',
  shape: 'rounded',
  density: 'comfortable',
  contentGap: '4',
  guardMode: 'creative',
  dnaEnforcement: 'off',
  blueprintEnforcement: 'off',
  personality: [],
  wcagLevel: 'AA',
  validateGuard: () => [],
});
```

### Why tree-scoped matters here

```ts
EssenceProvider({ essence: appEssence }, () =>
  // Everything here uses appEssence DNA (comfortable density)
  Shell({}, () =>
    EssenceProvider({ overrides: { density: 'compact' } }, () =>
      // Sidebar uses compact density — overrides parent
      Sidebar({})
    ),
    // Main content still uses comfortable density
    MainContent({})
  )
)
```

Tree-scoped context means nested `EssenceProvider`s shadow their parents for their subtree only. This enables per-section DNA overrides — exactly what the v3.1 sectioned essence format supports.

---

## 4. EssenceProvider

```ts
// provider.ts
import { component } from '../runtime/component.js';
import type { EssenceV3 } from '@decantr/essence-spec';
import { evaluateGuard } from '@decantr/essence-spec';
import { EssenceContext, type EssenceContextValue } from './context.js';
import { applyTokens } from './tokens.js';
import type { Child } from '../types.js';

export interface EssenceProviderProps {
  /** Full essence spec to provide */
  essence?: EssenceV3;
  /** Partial DNA overrides (for nested providers) */
  overrides?: Partial<EssenceContextValue>;
  /** Children */
}

export const EssenceProvider = component<EssenceProviderProps>((props, ...children) => {
  const parent = EssenceContext.consume();
  const essence = props.essence || parent.essence;

  // Build context value from essence or overrides
  const value: EssenceContextValue = essence ? {
    essence,
    style: props.overrides?.style || essence.dna.theme.style || parent.style,
    mode: props.overrides?.mode || essence.dna.theme.mode || parent.mode,
    shape: props.overrides?.shape || essence.dna.radius?.philosophy || parent.shape,
    density: props.overrides?.density || essence.dna.spacing?.density || parent.density,
    contentGap: props.overrides?.contentGap || essence.dna.spacing?.content_gap || parent.contentGap,
    guardMode: essence.meta?.guard?.mode || parent.guardMode,
    dnaEnforcement: essence.meta?.guard?.dna_enforcement || parent.dnaEnforcement,
    blueprintEnforcement: essence.meta?.guard?.blueprint_enforcement || parent.blueprintEnforcement,
    personality: essence.dna.personality || parent.personality,
    wcagLevel: essence.dna.accessibility?.wcag_level || parent.wcagLevel,
    validateGuard: (ctx) => evaluateGuard(essence, ctx),
  } : { ...parent, ...props.overrides };

  // Provide to subtree
  EssenceContext.Provider(value);

  // Apply theme tokens to CSS custom properties
  applyTokens(value);

  // Render children
  const container = h('div', { style: 'display:contents' });
  for (const child of children) {
    // append children
  }
  return container;
});
```

---

## 5. Consumer Hooks

```ts
// hooks.ts — convenience accessors for components

export function useEssence(): EssenceContextValue {
  return EssenceContext.consume();
}

export function useDNA(): { style, mode, shape, density, contentGap, personality } {
  const ctx = EssenceContext.consume();
  return { style: ctx.style, mode: ctx.mode, shape: ctx.shape,
           density: ctx.density, contentGap: ctx.contentGap, personality: ctx.personality };
}

export function useDensity(): DensityLevel {
  return EssenceContext.consume().density;
}

export function useGuardMode(): GuardMode {
  return EssenceContext.consume().guardMode;
}

export function useGuard(): (context: Record<string, unknown>) => GuardViolation[] {
  return EssenceContext.consume().validateGuard;
}
```

### How components use this

```ts
// Example: Button consuming essence DNA
export const Button = component<ButtonProps>((props, ...children) => {
  const dna = useDNA();

  // Density-aware spacing
  const densityClass = `d-density-${dna.density}`;

  // Guard validation (in guided/strict mode)
  if (dna.guardMode !== 'creative') {
    // Could validate that button variant matches the style DNA
  }

  // Render with density-aware classes
  return h('button', { class: cx('d-btn', densityClass, ...) }, ...children);
});
```

---

## 6. Token Resolution

```ts
// tokens.ts — bridges essence DNA to the CSS theme registry

import { setStyle, setMode, setShape } from '../css/theme-registry.js';

export function applyTokens(ctx: EssenceContextValue): void {
  // Apply the essence's theme DNA to the CSS system
  setStyle(ctx.style);
  setMode(ctx.mode);
  if (ctx.shape) setShape(ctx.shape);

  // Future: apply density tokens, content gap, etc.
}
```

This is the connection point: the essence's `dna.theme.style` drives the CSS token system through the existing `setStyle`/`setMode`/`setShape` API. No new CSS infrastructure needed — Layer 2 just tells the existing CSS system what to apply.

---

## 7. Runtime Guard Validation

```ts
// guard.ts — runtime guard checking for development

export function guardWarn(violation: GuardViolation): void {
  console.warn(`[decantr guard] ${violation.rule}: ${violation.message}`);
  if (violation.suggestion) console.warn(`  suggestion: ${violation.suggestion}`);
}

export function guardError(violation: GuardViolation): void {
  throw new Error(`[decantr guard] ${violation.rule}: ${violation.message}`);
}

export function handleViolations(
  violations: GuardViolation[],
  dnaEnforcement: 'error' | 'warn' | 'off',
  blueprintEnforcement: 'warn' | 'off',
): void {
  for (const v of violations) {
    if (v.layer === 'dna') {
      if (dnaEnforcement === 'error') guardError(v);
      else if (dnaEnforcement === 'warn') guardWarn(v);
    } else if (v.layer === 'blueprint') {
      if (blueprintEnforcement === 'warn') guardWarn(v);
    }
  }
}
```

---

## 8. Package.json Update

Add `@decantr/essence-spec` as a dependency (not just peer):

```json
{
  "dependencies": {
    "@decantr/essence-spec": "workspace:*"
  }
}
```

Add new subpath export:

```json
{
  "exports": {
    "./essence": "./src/essence/index.ts"
  }
}
```

---

## 9. What This Enables

### For developers
```ts
import { EssenceProvider, useEssence } from '@decantr/ui/essence';
import essenceJson from './essence.json';

// Wrap your app — all components become essence-aware
mount(root, () =>
  EssenceProvider({ essence: essenceJson },
    App()
  )
);
```

### For LLMs
An AI scaffolding a Decantr app writes:
1. `essence.json` — defines the design DNA
2. `EssenceProvider({ essence })` — wraps the app
3. Components — they automatically respect the DNA

The AI doesn't need to manually call `setStyle()`, `setMode()`, `setShape()`, manage density classes, or validate guard rules. The `EssenceProvider` does it all.

### For the workbench and ui-site
Both apps already have `essence.json` files. Wrapping them in `EssenceProvider` instantly makes them essence-aware — guard violations show in console, density adapts, theme tokens apply automatically.

---

## 10. Success Criteria

1. `EssenceProvider` reads an `EssenceV3` and provides context to children
2. `useEssence()`, `useDNA()`, `useDensity()`, `useGuardMode()` return correct values
3. Nested `EssenceProvider` overrides shadow parent for subtree only
4. Token application (`applyTokens`) calls `setStyle`/`setMode`/`setShape`
5. Guard violations surface via `handleViolations` respecting enforcement levels
6. Tree-scoped context works (tested in Layer 1, used here)
7. `@decantr/essence-spec` types flow through without duplication
