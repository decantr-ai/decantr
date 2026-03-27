# CSS Scaffolding Guide

When implementing Decantr themes and recipes, follow these CSS conventions.

---

## Layer Structure

Use CSS `@layer` for proper cascade control:

```css
@layer decantr.reset, decantr.tokens, decantr.decorators, decantr.patterns, decantr.utilities, app;

@layer decantr.reset {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
}

@layer decantr.tokens {
  :root {
    /* Theme seed colors */
    --d-primary: #FE4474;
    --d-secondary: #0AF3EB;
    --d-accent: #FDA303;
    --d-bg: #0D0D1A;

    /* Spacing tokens */
    --gap1: 4px;
    --gap2: 8px;
    --gap3: 12px;
    --gap4: 16px;
    --gap6: 24px;
    --gap8: 32px;
    --gap12: 48px;
  }
}

@layer decantr.decorators {
  /* Recipe-specific classes */
  .lum-glass { /* ... */ }
  .lum-orbs { /* ... */ }
}

@layer decantr.patterns {
  /* Pattern base styles */
  .pattern-hero { /* ... */ }
  .pattern-kpi-grid { /* ... */ }
}

@layer decantr.utilities {
  .d-flex { display: flex; }
  .d-grid { display: grid; }
}

@layer app {
  /* Application-specific overrides */
}
```

---

## Theme Scoping on HTML Tag

**The HTML element MUST have theme and mode attributes for proper scoping:**

```html
<!DOCTYPE html>
<html lang="en" data-theme="luminarum" data-mode="dark">
  <head>
    <meta charset="UTF-8" />
    <!-- color-scheme tells the browser about the page's color scheme -->
    <meta name="color-scheme" content="dark">
    ...
  </head>
  <body>
    ...
  </body>
</html>
```

### Why This Matters

1. **Theme switching** - JavaScript can change `data-theme` without reloading CSS
2. **Multiple themes** - Scoped containers can have different themes
3. **CSS specificity** - `html[data-theme="x"]` is more specific than `:root`
4. **OS integration** - `color-scheme` enables native form controls to match

---

## The `color-scheme` Property

The `color-scheme` property tells the browser which color schemes the page supports:

```css
/* In CSS */
html[data-mode="dark"] {
  color-scheme: dark;
}

html[data-mode="light"] {
  color-scheme: light;
}

html[data-mode="auto"] {
  color-scheme: light dark;
}
```

```html
<!-- In HTML -->
<meta name="color-scheme" content="dark">
```

### What `color-scheme` Controls

- Scrollbar appearance
- Form control styling (inputs, buttons, selects)
- Default background and text colors
- System UI elements

---

## Multi-Theme CSS Structure

Define theme-specific tokens using attribute selectors:

```css
/* Base tokens (always applied) */
:root {
  --gap1: 4px;
  --gap2: 8px;
  --gap4: 16px;
  /* ...spacing is theme-agnostic */
}

/* Theme-specific tokens */
html[data-theme="luminarum"] {
  color-scheme: dark;

  --d-primary: #FE4474;
  --d-secondary: #0AF3EB;
  --d-accent: #FDA303;
  --d-bg: #0D0D1A;
  --d-surface: rgba(255, 255, 255, 0.03);
  --d-text: #FFFFFF;
  --d-text-muted: rgba(255, 255, 255, 0.7);
}

html[data-theme="auradecantism"] {
  color-scheme: dark;

  --d-primary: #A855F7;
  --d-secondary: #0EA5E9;
  --d-accent: #EC4899;
  --d-bg: #0F0A1A;
  --d-surface: rgba(255, 255, 255, 0.05);
  --d-text: #FFFFFF;
  --d-text-muted: rgba(255, 255, 255, 0.7);
}

html[data-theme="launchpad"][data-mode="light"] {
  color-scheme: light;

  --d-primary: #2563EB;
  --d-bg: #FAFAFA;
  --d-surface: #FFFFFF;
  --d-text: #111111;
  --d-text-muted: rgba(0, 0, 0, 0.6);
}

html[data-theme="launchpad"][data-mode="dark"] {
  color-scheme: dark;

  --d-primary: #3B82F6;
  --d-bg: #111111;
  --d-surface: #1A1A1A;
  --d-text: #FFFFFF;
  --d-text-muted: rgba(255, 255, 255, 0.7);
}
```

---

## Semantic Variable Naming

Organize variables into semantic layers:

```css
html[data-theme="luminarum"] {
  /* Layer 1: Raw palette (from theme.palette) */
  --palette-pink: #FE4474;
  --palette-cyan: #0AF3EB;
  --palette-amber: #FDA303;

  /* Layer 2: Semantic roles (from theme.seed) */
  --d-primary: var(--palette-pink);
  --d-secondary: var(--palette-cyan);
  --d-accent: var(--palette-amber);

  /* Layer 3: Component tokens */
  --d-bg: #0D0D1A;
  --d-surface: rgba(255, 255, 255, 0.03);
  --d-surface-raised: rgba(255, 255, 255, 0.06);
  --d-border: rgba(255, 255, 255, 0.1);

  /* Layer 4: Text hierarchy */
  --d-text: #FFFFFF;
  --d-text-secondary: rgba(255, 255, 255, 0.7);
  --d-text-muted: rgba(255, 255, 255, 0.4);

  /* Layer 5: Interactive states */
  --d-hover-bg: rgba(255, 255, 255, 0.05);
  --d-active-bg: rgba(255, 255, 255, 0.08);
  --d-focus-ring: var(--d-primary);
}
```

---

## Variable Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `--d-` | Core Decantr tokens | `--d-primary`, `--d-bg` |
| `--{recipe}-` | Recipe-specific | `--lum-orb-opacity`, `--gg-accent` |
| `--gap{N}` | Spacing tokens | `--gap4`, `--gap8` |
| `--radius-{size}` | Border radius | `--radius-sm`, `--radius-pill` |
| `--palette-{color}` | Raw palette values | `--palette-pink`, `--palette-cyan` |

---

## Theme Implementation

When scaffolding from a theme, map seed colors to variables:

```css
/* From: theme.seed = { primary: "#FE4474", secondary: "#0AF3EB" } */
:root {
  --d-primary: #FE4474;
  --d-primary-rgb: 254, 68, 116;  /* For rgba() usage */
  --d-secondary: #0AF3EB;
  --d-secondary-rgb: 10, 243, 235;
}
```

### RGB Values for Alpha Blending

When you need transparency, provide RGB components:

```css
html[data-theme="luminarum"] {
  --d-primary: #FE4474;
  --d-primary-rgb: 254, 68, 116;
}

/* Usage */
.overlay {
  background: rgba(var(--d-primary-rgb), 0.5);
}
```

---

## Recipe Decorator Implementation

Recipes define decorators as descriptions. Implement them as classes:

```css
/* From: decorators.lum-glass = "Subtle glass panel with..." */
.lum-glass {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

/* From: decorators.lum-orbs = "Breathing gradient orbs..." */
.lum-orbs {
  position: relative;
}

.lum-orbs::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, var(--d-primary) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--d-secondary) 0%, transparent 50%);
  opacity: var(--lum-orb-opacity, 0.15);
  animation: lum-breathe 8s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes lum-breathe {
  0%, 100% { opacity: var(--lum-orb-opacity, 0.15); }
  50% { opacity: calc(var(--lum-orb-opacity, 0.15) * 1.5); }
}
```

---

## Mode Support

Handle light/dark modes with proper cascade:

```css
/* 1. Set color-scheme for OS integration */
html[data-mode="dark"] {
  color-scheme: dark;
}

html[data-mode="light"] {
  color-scheme: light;
}

/* 2. Auto mode respects OS preference */
html[data-mode="auto"] {
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  html[data-mode="auto"] {
    --d-bg: #111111;
    --d-text: #FFFFFF;
  }
}

@media (prefers-color-scheme: light) {
  html[data-mode="auto"] {
    --d-bg: #FAFAFA;
    --d-text: #111111;
  }
}
```

---

## Theme Switching JavaScript

```javascript
// Switch theme
document.documentElement.dataset.theme = 'auradecantism';

// Switch mode
document.documentElement.dataset.mode = 'light';
document.querySelector('meta[name="color-scheme"]').content = 'light';

// Toggle mode
function toggleMode() {
  const html = document.documentElement;
  const newMode = html.dataset.mode === 'dark' ? 'light' : 'dark';
  html.dataset.mode = newMode;
  document.querySelector('meta[name="color-scheme"]').content = newMode;
}

// Persist preference
function setTheme(theme, mode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.mode = mode;
  document.querySelector('meta[name="color-scheme"]').content = mode;
  localStorage.setItem('decantr-theme', JSON.stringify({ theme, mode }));
}

// Restore on load
function restoreTheme() {
  const saved = localStorage.getItem('decantr-theme');
  if (saved) {
    const { theme, mode } = JSON.parse(saved);
    setTheme(theme, mode);
  }
}
```

---

## Scaffold HTML Template

When scaffolding a new project, generate the HTML with theme attributes:

```html
<!DOCTYPE html>
<html lang="en" data-theme="{{THEME_STYLE}}" data-mode="{{THEME_MODE}}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="{{THEME_MODE}}">
    <title>{{PROJECT_NAME}}</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <!-- App content -->
    <script src="./main.js"></script>
  </body>
</html>
```

---

## Complete Example

Here is a complete CSS file following all conventions:

```css
/* 1. Layer declaration */
@layer decantr.reset, decantr.tokens, decantr.decorators, decantr.patterns, app;

/* 2. Reset layer */
@layer decantr.reset {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; line-height: 1.5; }
}

/* 3. Token layer - theme-agnostic */
@layer decantr.tokens {
  :root {
    /* Spacing */
    --gap1: 4px;
    --gap2: 8px;
    --gap3: 12px;
    --gap4: 16px;
    --gap6: 24px;
    --gap8: 32px;
    --gap12: 48px;

    /* Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-pill: 9999px;
  }

  /* Theme: Luminarum (dark) */
  html[data-theme="luminarum"] {
    color-scheme: dark;

    --palette-pink: #FE4474;
    --palette-cyan: #0AF3EB;
    --palette-amber: #FDA303;

    --d-primary: var(--palette-pink);
    --d-secondary: var(--palette-cyan);
    --d-accent: var(--palette-amber);

    --d-bg: #0D0D1A;
    --d-surface: rgba(255, 255, 255, 0.03);
    --d-border: rgba(255, 255, 255, 0.1);

    --d-text: #FFFFFF;
    --d-text-muted: rgba(255, 255, 255, 0.7);
  }

  /* Theme: Clean (light) */
  html[data-theme="clean"][data-mode="light"] {
    color-scheme: light;

    --d-primary: #2563EB;
    --d-secondary: #64748B;
    --d-accent: #F59E0B;

    --d-bg: #FFFFFF;
    --d-surface: #F8FAFC;
    --d-border: #E2E8F0;

    --d-text: #0F172A;
    --d-text-muted: #64748B;
  }
}

/* 4. Decorator layer */
@layer decantr.decorators {
  .lum-glass {
    background: var(--d-surface);
    border: 1px solid var(--d-border);
    backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
  }
}

/* 5. Pattern layer */
@layer decantr.patterns {
  .pattern-hero {
    display: grid;
    gap: var(--gap8);
    padding: var(--gap12);
  }

  .pattern-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--gap4);
  }
}

/* 6. App layer - project-specific overrides */
@layer app {
  /* Custom styles go here */
}
```

---

## Checklist

When implementing CSS for a Decantr project:

- [ ] Declare `@layer` order at the top of your CSS
- [ ] Add `data-theme` and `data-mode` to the `<html>` element
- [ ] Add `<meta name="color-scheme">` to the `<head>`
- [ ] Use `html[data-theme="x"]` selectors for theme-specific tokens
- [ ] Set `color-scheme` property within theme selectors
- [ ] Follow the `--d-` prefix for core tokens
- [ ] Follow the `--{recipe}-` prefix for recipe-specific tokens
- [ ] Implement decorator classes for recipe decorators
- [ ] Use spacing tokens (`--gap*`) instead of arbitrary pixel values
- [ ] Provide `-rgb` variants for colors that need alpha blending

---

## Further Reading

- [CSS Cascade Layers (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [color-scheme property (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

Or run: `npx decantr docs css`
