# WS6: CSS and Pattern Guidance

## Problems

| Issue | Details | Severity |
|-------|---------|----------|
| No theme scoping on HTML tag | CSS uses `:root` only, no `data-theme`/`data-mode` | High |
| No `@layer` guidance | CSS cascade control not documented | High |
| No `color-scheme` property | Missing OS-level dark/light integration | High |
| No multi-theme CSS structure | One theme hardcoded, can't switch | High |
| No CSS variable conventions | Inconsistent variable naming (`--d-*`, `--surface-*`, etc.) | Medium |
| Pattern code uses fictional imports | `decantr/tags`, `decantr/css` don't exist | Medium |
| No target-specific output | Patterns don't generate React/Vue code | Medium |
| No alternative pattern suggestions | CLI lacks `suggest-alternative` command | Low |

## Solution

This workstream focuses on documentation, CSS architecture, and pattern format improvements.

## Part 1: CSS Scaffolding Guide

Create `docs/css-scaffolding-guide.md`:

```markdown
# CSS Scaffolding Guide

When implementing Decantr themes and recipes, follow these CSS conventions.

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

## Variable Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `--d-` | Core Decantr tokens | `--d-primary`, `--d-bg` |
| `--{recipe}-` | Recipe-specific | `--lum-orb-opacity`, `--gg-accent` |
| `--gap{N}` | Spacing tokens | `--gap4`, `--gap8` |
| `--radius-{size}` | Border radius | `--radius-sm`, `--radius-pill` |

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
.lum-orbs::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, var(--d-primary) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--d-secondary) 0%, transparent 50%);
  opacity: var(--lum-orb-opacity, 0.15);
  animation: lum-breathe 8s ease-in-out infinite;
}
```

## Theme Scoping on HTML Tag (Critical)

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

**Why this matters:**
1. **Theme switching** - JS can change `data-theme` without reloading CSS
2. **Multiple themes** - Scoped containers can have different themes
3. **CSS specificity** - `html[data-theme="x"]` is more specific than `:root`
4. **OS integration** - `color-scheme` enables native form controls to match

### Multi-Theme CSS Structure

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

### Scaffold Template Update

The CLI scaffold should generate `index.html` with theme attributes:

```html
<!DOCTYPE html>
<html lang="en" data-theme="{{THEME_STYLE}}" data-mode="{{THEME_MODE}}">
  <head>
    <meta name="color-scheme" content="{{THEME_MODE}}">
    ...
  </head>
```

### Theme Switching JavaScript

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
```

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
```

## Part 2: Update Pattern Code Format

Patterns currently use fictional imports. Update to provide framework-agnostic structure with implementation notes.

Update pattern schema in `packages/essence-spec/src/schemas/pattern.schema.ts`:

Add a new `implementation` field:

```json
{
  "implementation": {
    "structure": "Semantic description of HTML structure",
    "styling": "CSS approach and classes to use",
    "behavior": "Interactivity requirements",
    "react": "React-specific notes",
    "vue": "Vue-specific notes",
    "html": "Vanilla HTML notes"
  }
}
```

### Example: Updated `leaderboard.json`

```json
{
  "id": "leaderboard",
  "implementation": {
    "structure": [
      "<section class=\"pattern-leaderboard\">",
      "  <header>Title + Optional Filter</header>",
      "  <ol class=\"leaderboard-list\">",
      "    <li class=\"leaderboard-item\">",
      "      <span class=\"rank\">1</span>",
      "      <img class=\"avatar\" />",
      "      <span class=\"name\">Player Name</span>",
      "      <span class=\"score\">1234</span>",
      "    </li>",
      "  </ol>",
      "  <footer>Pagination / View All</footer>",
      "</section>"
    ],
    "styling": {
      "container": "pattern-leaderboard — vertical list with rank emphasis",
      "topThree": "spotlight preset highlights top 3 with larger cards",
      "rankBadge": "Gold/silver/bronze gradient for positions 1-3"
    },
    "react": "Use <ol> with map(). Consider virtualization for long lists.",
    "vue": "Use v-for on <li>. Scoped slots for custom item rendering.",
    "html": "Static <ol> works. Add data-rank for CSS targeting."
  }
}
```

## Part 3: Add `decantr suggest` Command

Add to CLI for pattern alternatives.

In `packages/cli/src/index.ts`:

```typescript
async function cmdSuggest(query: string, type?: string) {
  const client = createRegistryClient();
  const results = await client.search(query, type || 'pattern');

  if (results.length === 0) {
    console.log(dim(`No suggestions for "${query}"`));
    console.log('');
    console.log('Try:');
    console.log(`  ${cyan('decantr list patterns')} — see all patterns`);
    console.log(`  ${cyan('decantr search <broader-term>')} — broaden your search`);
    return;
  }

  console.log(heading(`Suggestions for "${query}"`));

  // Group by relevance
  const exact = results.filter(r => r.id.includes(query.toLowerCase()));
  const related = results.filter(r => !r.id.includes(query.toLowerCase()));

  if (exact.length > 0) {
    console.log(`${BOLD}Direct matches:${RESET}`);
    for (const r of exact.slice(0, 3)) {
      console.log(`  ${cyan(r.id)} — ${r.description || ''}`);
    }
  }

  if (related.length > 0) {
    console.log(`${BOLD}Related:${RESET}`);
    for (const r of related.slice(0, 5)) {
      console.log(`  ${cyan(r.id)} — ${r.description || ''}`);
    }
  }

  console.log('');
  console.log(dim(`Use "decantr get pattern <id>" for full details`));
}
```

Add to CLI help and argument parsing.

## Part 4: Add to DECANTR.md Template

Update template to reference the CSS guide:

```markdown
## CSS Implementation

For detailed CSS scaffolding guidance including:
- `@layer` structure for cascade control
- Variable naming conventions (`--d-*`, `--{recipe}-*`)
- Theme seed → CSS variable mapping
- Recipe decorator implementation

See: [CSS Scaffolding Guide](https://decantr.ai/docs/css-scaffolding)

Or run: `npx decantr docs css`
```

## Files to Create/Modify

### Create
1. `docs/css-scaffolding-guide.md` — Full CSS implementation guide

### Modify
1. `packages/essence-spec/src/schemas/pattern.schema.ts` — Add `implementation` field
2. `packages/cli/src/index.ts` — Add `suggest` command
3. `packages/cli/src/templates/DECANTR.md.template` — Reference CSS guide
4. `content/patterns/*.json` — Add `implementation` to existing patterns (optional for this WS)

## Validation

```bash
# Test suggest command
npx decantr suggest leaderboard
npx decantr suggest ranking --type pattern

# Verify CSS guide renders
cat docs/css-scaffolding-guide.md

# Build and test
pnpm build && pnpm test
```

## Files to Also Modify (Scaffold)

Update CLI scaffold to output proper HTML:

1. `packages/cli/src/templates/index.html.template` (create if doesn't exist)
   - Add `data-theme="{{THEME_STYLE}}"` to `<html>`
   - Add `data-mode="{{THEME_MODE}}"` to `<html>`
   - Add `<meta name="color-scheme" content="{{THEME_MODE}}">`

2. `packages/cli/src/scaffold.ts`
   - Generate index.html with theme attributes if target is html/react/vue

## Checklist

- [ ] Create `docs/css-scaffolding-guide.md` with @layer structure
- [ ] **Document theme scoping on HTML tag (`data-theme`, `data-mode`)**
- [ ] **Document `color-scheme` meta tag and CSS property**
- [ ] **Document multi-theme CSS structure with `html[data-theme="x"]`**
- [ ] Add semantic variable naming layers documentation
- [ ] Add variable naming convention documentation
- [ ] Document theme-to-CSS mapping process
- [ ] Document recipe decorator implementation
- [ ] Update pattern schema with `implementation` field
- [ ] Add `decantr suggest` command to CLI
- [ ] Update DECANTR.md template to reference CSS guide
- [ ] **Update scaffold to generate `<html data-theme="x" data-mode="y">`**
- [ ] Add help text for suggest command
- [ ] Run tests: `pnpm test`
- [ ] Commit: `docs: add CSS scaffolding guide with theme scoping and suggest command`

## Future Work

- Generate actual CSS files from themes/recipes
- Add `decantr generate-css` command
- Target-specific component generators
- Theme switcher component generation
