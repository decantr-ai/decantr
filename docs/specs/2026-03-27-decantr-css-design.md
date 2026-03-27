# @decantr/css Design Spec

**Date:** 2026-03-27
**Status:** Draft
**Author:** Claude + David

---

## Summary

Create `@decantr/css` - a framework-agnostic CSS atoms runtime that enables Decantr's layout system to work across React, Vue, Svelte, and vanilla JS projects.

---

## Problem Statement

The Decantr monorepo references atom classes (`_flex`, `_gap4`, `_col`) across 52+ files, but has **no CSS implementation**. The atom system exists only in `decantr-framework`, which was not migrated during the framework-agnostic transition.

**Current state:**
- Patterns reference atoms in JSON: `"atoms": "_grid _gc1 _sm:gc2 _lg:gc3 _gap4"`
- DECANTR.md instructs LLMs to use `css('_flex _col _gap4')`
- No `css()` function exists
- No CSS gets generated
- Scaffolded projects have broken styles

---

## Goals

1. **Atoms work everywhere** - React, Vue, Svelte, vanilla JS
2. **Minimal footprint** - Only atoms runtime, no opinions on components
3. **Design tokens from recipes** - Theme variables injected at scaffold time
4. **LLM-friendly** - Clear instructions, examples that work

**Non-goals:**
- Component CSS (stays in decantr-framework)
- Theme derivation engine (stays in decantr-framework)
- Style definitions (auradecantism, etc.)

---

## Architecture

### What @decantr/css provides

```
@decantr/css (npm package)
├── css()           → Process atom strings, inject CSS
├── define()        → Register custom atoms
├── extractCSS()    → SSR: get all injected CSS as string
├── reset()         → Clear injected styles (for tests)
└── BREAKPOINTS     → { sm: 640, md: 768, lg: 1024, xl: 1280 }
```

### What CLI scaffold generates

```
project/
├── decantr.essence.json
├── DECANTR.md
├── src/
│   └── styles/
│       ├── tokens.css      ← Theme tokens from recipe
│       └── decorators.css  ← Recipe decorator classes
└── .decantr/
```

### Data flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  SCAFFOLD TIME (CLI)                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Theme JSON ──► tokens.css                                          │
│  {                        :root {                                   │
│    "seed": {                --d-primary: #7C93B0;                   │
│      "primary": "#7C93B0"   --d-bg: #18181B;                        │
│    }                        --d-surface: #1F1F23;                   │
│  }                        }                                         │
│                                                                     │
│  Recipe JSON ──► decorators.css                                     │
│  {                        .carbon-card {                            │
│    "decorators": {...}      background: var(--d-surface);           │
│  }                          border-radius: 8px;                     │
│                           }                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  RUNTIME (Browser)                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  css('_flex _col _gap4')                                            │
│       │                                                             │
│       ▼                                                             │
│  resolveAtom('_flex')  → 'display:flex'                             │
│  resolveAtom('_col')   → 'flex-direction:column'                    │
│  resolveAtom('_gap4')  → 'gap:1rem'                                 │
│       │                                                             │
│       ▼                                                             │
│  inject() → <style data-decantr>                                    │
│             @layer d.atoms {                                        │
│               ._flex { display:flex }                               │
│               ._col { flex-direction:column }                       │
│               ._gap4 { gap:1rem }                                   │
│             }                                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Package Structure

```
packages/css/
├── src/
│   ├── atoms.ts          ← Atom definitions (DIRECT map + algorithmic)
│   ├── runtime.ts        ← CSS injection (DOM manipulation)
│   ├── css.ts            ← Main css() function
│   └── index.ts          ← Public exports
├── test/
│   ├── atoms.test.ts
│   ├── css.test.ts
│   └── runtime.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Source files

**atoms.ts** (~400 lines)
- Port from `decantr-framework/src/css/atoms.js`
- `DIRECT` map: 200+ direct atom → CSS mappings
- `resolveAtomDecl()`: algorithmic resolution for spacing, colors, etc.
- Tailwind-compatible aliases

**runtime.ts** (~200 lines)
- Port from `decantr-framework/src/css/runtime.js`
- `inject()`, `injectResponsive()`, `injectPseudo()`, etc.
- Buffered injection with microtask flushing
- `@layer d.atoms` wrapping
- `extractCSS()` for SSR

**css.ts** (~150 lines)
- Port from `decantr-framework/src/css/index.js`
- Main `css()` function
- Responsive prefixes: `_sm:`, `_md:`, `_lg:`, `_xl:`
- Pseudo prefixes: `_h:`, `_f:`, `_a:`
- Opacity modifiers: `_bgprimary/50`
- Arbitrary values: `_w[512px]`
- **Excludes:** theme-registry imports (not needed)

---

## CLI Updates

### scaffold.ts changes

Add two new generated files:

**1. tokens.css generation**

```typescript
function generateTokensCSS(themeData: ThemeData, mode: string): string {
  const palette = themeData.palette || {};
  const seed = themeData.seed || {};

  const tokens: Record<string, string> = {
    '--d-primary': seed.primary || '#6366f1',
    '--d-secondary': seed.secondary || '#a1a1aa',
    '--d-accent': seed.accent || '#f59e0b',
    '--d-bg': palette.background?.[mode] || '#18181b',
    '--d-surface': palette.surface?.[mode] || '#1f1f23',
    '--d-surface-raised': palette['surface-raised']?.[mode] || '#27272a',
    '--d-border': palette.border?.[mode] || '#3f3f46',
    '--d-text': palette.text?.[mode] || '#fafafa',
    '--d-text-muted': palette['text-muted']?.[mode] || '#a1a1aa',
    // ... spacing tokens
    '--d-gap-1': '0.25rem',
    '--d-gap-2': '0.5rem',
    '--d-gap-4': '1rem',
    '--d-gap-6': '1.5rem',
    '--d-gap-8': '2rem',
    // ... radius tokens
    '--d-radius': '0.5rem',
    '--d-radius-lg': '0.75rem',
    '--d-radius-full': '9999px',
  };

  return `:root {\n${Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`;
}
```

**2. decorators.css generation**

```typescript
function generateDecoratorsCSS(recipeData: RecipeData): string {
  // Generate CSS from decorator descriptions + tokens
  // This is a simplified generator - complex decorators get basic styling
  const decorators = recipeData.decorators || {};
  const css: string[] = [];

  for (const [name, description] of Object.entries(decorators)) {
    css.push(generateDecoratorRule(name, description));
  }

  return css.join('\n\n');
}

function generateDecoratorRule(name: string, description: string): string {
  // Parse description for common patterns
  // "Surface background, subtle border, 8px radius" →
  // .carbon-card { background: var(--d-surface); border: 1px solid var(--d-border); border-radius: 8px; }

  const rules: string[] = [];

  if (description.includes('surface') || description.includes('Surface')) {
    rules.push('background: var(--d-surface)');
  }
  if (description.includes('border') || description.includes('Border')) {
    rules.push('border: 1px solid var(--d-border)');
  }
  if (description.includes('radius') || description.includes('rounded')) {
    rules.push('border-radius: var(--d-radius)');
  }
  // ... more pattern matching

  return `.${name} {\n  ${rules.join(';\n  ')};\n}`;
}
```

### File output changes

Add to `scaffoldProject()`:

```typescript
// Generate CSS files
const stylesDir = join(projectRoot, 'src', 'styles');
mkdirSync(stylesDir, { recursive: true });

// tokens.css
const tokensPath = join(stylesDir, 'tokens.css');
writeFileSync(tokensPath, generateTokensCSS(themeData, essence.theme.mode));

// decorators.css
const decoratorsPath = join(stylesDir, 'decorators.css');
writeFileSync(decoratorsPath, generateDecoratorsCSS(recipeData));
```

---

## DECANTR.md Template Updates

Replace CSS section with actionable instructions:

```markdown
## CSS Setup

### 1. Install the atoms runtime

\`\`\`bash
npm install @decantr/css
\`\`\`

### 2. Import in your entry file

\`\`\`js
// React: src/main.jsx or src/index.jsx
import { css } from '@decantr/css';
import './styles/tokens.css';
import './styles/decorators.css';
\`\`\`

### 3. Use atoms for layout

\`\`\`jsx
<div className={css('_flex _col _gap4 _p4')}>
  <h1 className={css('_heading1')}>Title</h1>
</div>
\`\`\`

### 4. Use decorators for recipe effects

\`\`\`jsx
<div className="{{RECIPE}}-card">
  Card with recipe styling
</div>
\`\`\`

### Atom Quick Reference

| Category | Examples |
|----------|----------|
| Display | `_flex`, `_grid`, `_block`, `_none` |
| Direction | `_col`, `_row`, `_colrev`, `_rowrev` |
| Alignment | `_aic`, `_jcc`, `_jcsb`, `_aifs` |
| Spacing | `_gap1` - `_gap12`, `_p1` - `_p12`, `_m1` - `_m12` |
| Sizing | `_wfull`, `_hfull`, `_w100`, `_h100` |
| Typography | `_textsm`, `_textlg`, `_fontbold`, `_heading1` |
| Colors | `_bgprimary`, `_fgmuted`, `_bgsurface` |
| Responsive | `_sm:`, `_md:`, `_lg:`, `_xl:` prefixes |
| Pseudo | `_h:` (hover), `_f:` (focus), `_a:` (active) |

### Theme Tokens

These CSS variables are available from `tokens.css`:

| Token | Value |
|-------|-------|
{{THEME_TOKENS_TABLE}}

### Decorators

These classes are available from `decorators.css`:

{{DECORATORS_LIST}}
```

---

## Documentation Updates

### 1. CLAUDE.md

Add to packages table:
```markdown
| `@decantr/css` | `packages/css/` | Framework-agnostic atoms runtime |
```

Add to terminology if needed.

### 2. README.md

Add new section after "Initialize a New Project":

```markdown
### CSS Setup

Decantr uses a two-part CSS system:

1. **Design tokens** (`tokens.css`) - Theme colors, spacing, radii generated from your recipe
2. **Atoms runtime** (`@decantr/css`) - Utility classes like `_flex`, `_gap4`, `_col`

After scaffolding, install the atoms runtime:

\`\`\`bash
npm install @decantr/css
\`\`\`

Then import in your entry file:

\`\`\`js
import { css } from '@decantr/css';
import './styles/tokens.css';
import './styles/decorators.css';
\`\`\`

Use atoms for layout:

\`\`\`jsx
<div className={css('_flex _col _gap4')}>
\`\`\`

See the generated `DECANTR.md` in your project for full atom reference.
```

### 3. docs/css-scaffolding-guide.md

Major rewrite to reflect new architecture:
- Explain tokens.css vs decorators.css vs @decantr/css
- Update layer structure
- Add atoms reference section
- Remove placeholder comments

### 4. packages/css/README.md (new)

```markdown
# @decantr/css

Framework-agnostic CSS atoms runtime for Decantr projects.

## Installation

\`\`\`bash
npm install @decantr/css
\`\`\`

## Usage

\`\`\`js
import { css } from '@decantr/css';

// In your components
<div className={css('_flex _col _gap4 _p4')}>
\`\`\`

## API

### css(...classes)

Process atom strings and inject CSS. Returns space-separated class names.

### define(name, declaration)

Register a custom atom.

### extractCSS()

Get all injected CSS as a string (for SSR).

### reset()

Clear all injected styles (for testing).

## Atoms Reference

See [docs/css-scaffolding-guide.md](../../docs/css-scaffolding-guide.md)
```

---

## Testing Strategy

### Unit tests

- `atoms.test.ts`: Test atom resolution for all categories
- `css.test.ts`: Test responsive, pseudo, opacity, arbitrary
- `runtime.test.ts`: Test injection (mock DOM)

### Integration test

After implementation, re-run the carbon scaffold test:
1. `decantr init` with carbon blueprint
2. LLM builds React app
3. `npm run dev` works with proper styling

---

## Migration from decantr-framework

Files to port (with modifications):

| Source | Target | Changes |
|--------|--------|---------|
| `decantr-framework/src/css/atoms.js` | `packages/css/src/atoms.ts` | Convert to TS, remove unused |
| `decantr-framework/src/css/runtime.js` | `packages/css/src/runtime.ts` | Convert to TS |
| `decantr-framework/src/css/index.js` | `packages/css/src/css.ts` | Remove theme-registry imports |

**NOT migrating:**
- `theme-registry.js` - Stays in decantr-framework
- `derive.js` - Stays in decantr-framework
- `components.js` - Stays in decantr-framework

---

## Success Criteria

1. `npm install @decantr/css` works
2. `css('_flex _col _gap4')` returns `'_flex _col _gap4'` and injects CSS
3. CLI scaffold generates `tokens.css` and `decorators.css`
4. DECANTR.md has actionable CSS instructions
5. Carbon test project styles work correctly
6. All monorepo docs updated

---

## Open Questions

1. **Decorator CSS generation** - Should we parse descriptions or add explicit CSS to recipe JSON?
   - **Recommendation:** Start with description parsing, iterate based on quality

2. **SSR support** - Do we need `extractCSS()` for server-side rendering?
   - **Recommendation:** Include it, it's 10 lines and useful

3. **Bundle size** - Should we tree-shake unused atoms?
   - **Recommendation:** Not for v1, the full atom map is ~15KB

---

## Timeline Estimate

| Task | Effort |
|------|--------|
| Create packages/css structure | 30 min |
| Port atoms.ts | 1 hour |
| Port runtime.ts | 30 min |
| Port css.ts | 30 min |
| Write tests | 1 hour |
| Update CLI scaffold | 1 hour |
| Update DECANTR.md template | 30 min |
| Update docs (CLAUDE.md, README.md, css-guide) | 1 hour |
| Integration test with carbon | 30 min |
| **Total** | ~7 hours |
