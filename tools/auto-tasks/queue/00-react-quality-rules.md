---
type: enrich
name: react-quality-rules
---

You are running in fully autonomous mode on the Decantr monorepo at /Users/davidaimi/projects/decantr-new.
Do NOT use EnterPlanMode or AskUserQuestion tools. Do NOT add Co-Authored-By lines to commits.
Make reasonable decisions and document them in code comments prefixed with // AUTO:

## Monorepo Structure
- packages/generator-react/ — React + Tailwind + shadcn/ui code emitter
- packages/generator-react/src/emit-page.ts — Emits .tsx page components
- packages/generator-react/src/emit-app.ts — Emits App.tsx with router + shell
- packages/generator-react/src/shadcn.ts — COMPONENT_MAP: abstract → shadcn/ui imports
- packages/generator-react/src/tailwind.ts — ATOM_TO_TAILWIND: IR spatial → Tailwind classes
- packages/generator-react/src/imports.ts — Import management
- packages/generator-react/src/emit-shared.ts — package.json, configs, globals.css
- packages/generator-core/src/types.ts — IR node types

## Task

Create a React quality validation module that enforces Vercel's React best practices on all generated code.
This runs as a post-generation check and is also used by tests to catch regressions.

### Step 1: Create the quality rules module

Create `packages/generator-react/src/quality-rules.ts`:

This module exports a `validateReactOutput(files: GeneratedFile[]): QualityViolation[]` function that scans generated .tsx/.ts files for violations of these rules (from https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices):

**CRITICAL rules to enforce:**

1. **no-barrel-imports** — Flag any import from a package index (e.g., `import { X } from 'lucide-react'` instead of `import { X } from 'lucide-react/dist/esm/icons/x'`). For shadcn/ui, imports MUST be from specific component paths like `@/components/ui/button`, never from `@/components/ui`.

2. **no-inline-components** — Flag any function/const component definition inside another component. Scan for patterns like `function Component() { ... function Inner()` or `const Component = () => { ... const Inner = ()`. This is HIGH impact — causes remount on every render.

3. **use-lazy-imports** — Verify that page-level components use `React.lazy()` or dynamic import for code splitting. Flag pages imported directly in the router without lazy wrapping.

4. **use-suspense-boundaries** — Verify that lazy-loaded routes are wrapped in `<Suspense fallback={...}>`.

**HIGH rules to enforce:**

5. **functional-setstate** — Flag `setState(value)` patterns where `setState(prev => ...)` should be used (when the new state depends on previous state).

6. **no-effect-derived-state** — Flag `useEffect(() => { setState(derived) }, [source])` patterns. Derived state should be computed during render with `useMemo`.

7. **hoist-default-props** — Flag non-primitive default values in component parameters (e.g., `function Comp({ items = [] })`). These create new references every render.

**MEDIUM rules to enforce:**

8. **hoist-static-jsx** — Flag static JSX elements (no props, no state) defined inside components that could be hoisted to module level.

9. **memo-expensive-components** — Flag components that receive complex objects as props without `React.memo()` wrapping.

10. **primitive-effect-deps** — Flag `useEffect` with object/array dependencies that should be primitive.

### Step 2: Integrate into emit pipeline

Update `packages/generator-react/src/plugin.ts` to run `validateReactOutput()` after emit. If violations are found, log them as warnings (don't fail — the generator should self-correct over time).

Also export the validator so tests can use it:
```ts
export { validateReactOutput } from './quality-rules.js';
```

### Step 3: Update all existing emit functions to comply

Go through each emit file and fix any existing violations:

**emit-page.ts:**
- Ensure no component definitions inside other components
- Ensure default prop values are primitives or hoisted constants
- Ensure wiring uses functional setState where appropriate

**emit-app.ts:**
- Ensure route imports use React.lazy()
- Ensure Suspense boundary wraps router outlet
- Ensure no barrel imports in generated imports

**shadcn.ts:**
- Ensure COMPONENT_MAP uses direct import paths, not barrel paths
- Each shadcn component import should be from `@/components/ui/specific-component`

**emit-shared.ts:**
- Ensure generated package.json includes correct direct dependencies (not barrel packages)

### Step 4: Write comprehensive tests

Create `packages/generator-react/test/quality-rules.test.ts`:

```ts
describe('React Quality Rules', () => {
  describe('no-barrel-imports', () => {
    it('flags import from lucide-react barrel', () => { ... });
    it('allows import from lucide-react/dist/esm/icons/x', () => { ... });
    it('flags import from @/components/ui barrel', () => { ... });
    it('allows import from @/components/ui/button', () => { ... });
  });

  describe('no-inline-components', () => {
    it('flags function component inside function component', () => { ... });
    it('flags arrow component inside function component', () => { ... });
    it('allows top-level component definitions', () => { ... });
  });

  describe('use-lazy-imports', () => {
    it('flags direct page import in router file', () => { ... });
    it('allows React.lazy() wrapped import', () => { ... });
  });

  describe('use-suspense-boundaries', () => {
    it('flags lazy component without Suspense wrapper', () => { ... });
    it('allows lazy component inside Suspense', () => { ... });
  });

  describe('functional-setstate', () => {
    it('flags setState(count + 1) pattern', () => { ... });
    it('allows setState(prev => prev + 1) pattern', () => { ... });
  });

  describe('no-effect-derived-state', () => {
    it('flags useEffect that only sets derived state', () => { ... });
    it('allows useEffect with side effects', () => { ... });
  });

  describe('hoist-default-props', () => {
    it('flags default array in component params', () => { ... });
    it('flags default object in component params', () => { ... });
    it('allows default primitive values', () => { ... });
  });

  describe('integration: generated output passes all rules', () => {
    it('emit-page output has zero violations', () => {
      // Generate a page, run validateReactOutput, expect empty violations
    });
    it('emit-app output has zero violations', () => {
      // Generate app.tsx, run validateReactOutput, expect empty violations
    });
  });
});
```

### Step 5: Run tests and fix any violations found

```bash
cd /Users/davidaimi/projects/decantr-new && pnpm test
```

Fix ALL violations in the generated output. The integration tests must pass with zero violations.

### Step 6: Commit

```bash
git add packages/generator-react/
git commit -m "feat(generator-react): add Vercel React best practices quality validation"
```

## Acceptance Criteria
- `validateReactOutput()` catches all 10 rule categories
- All existing generated output passes with zero violations
- Integration tests verify emit-page and emit-app output are clean
- shadcn imports use direct paths, not barrel imports
- Router uses React.lazy() + Suspense
- No inline component definitions in any generated code
- `pnpm test` passes with all new tests
