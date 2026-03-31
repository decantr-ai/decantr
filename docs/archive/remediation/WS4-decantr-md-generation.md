# WS4: DECANTR.md Generation Fixes

## Problems

| Issue | Details | Severity |
|-------|---------|----------|
| `[object Object]` serialization | Layout items that are objects render as `[object Object]` | High |
| Theme colors missing | Seed colors not surfaced in DECANTR.md | High |
| Recipe decorators missing | No mention of recipe-specific CSS classes | High |
| MCP tools unconditional | References MCP tools that may not be available | Medium |
| No CLI command guidance | Doesn't mention `decantr get theme/recipe` | Medium |

## Root Causes

### Serialization Bug

In `packages/cli/src/scaffold.ts`:

```typescript
const pagesTable = essence.structure.map(p =>
  `| ${p.id} | ${p.shell} | ${p.layout.join(', ') || 'none'} |`  // BUG: .join() on objects
).join('\n');
```

When `p.layout` contains objects like `{ pattern: "hero", preset: "landing" }`, calling `.join(', ')` produces `[object Object]`.

### Missing Theme/Recipe Data

The template uses static placeholders but doesn't fetch actual theme/recipe data to populate colors or decorators.

## Solution

### 1. Fix Serialization

Update `packages/cli/src/scaffold.ts`:

```typescript
/**
 * Serialize a layout item to a readable string.
 */
function serializeLayoutItem(item: unknown): string {
  if (typeof item === 'string') {
    return item;
  }
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;

    // Pattern with preset: "hero (landing)"
    if (typeof obj.pattern === 'string') {
      const preset = obj.preset ? ` (${obj.preset})` : '';
      const alias = obj.as ? ` as ${obj.as}` : '';
      return `${obj.pattern}${preset}${alias}`;
    }

    // Column layout: "activity-feed | top-players @lg"
    if (Array.isArray(obj.cols)) {
      const cols = obj.cols.map(serializeLayoutItem).join(' | ');
      const breakpoint = obj.at ? ` @${obj.at}` : '';
      return `[${cols}]${breakpoint}`;
    }
  }
  return 'custom';
}

function generateDecantrMd(essence: EssenceFile, detected: DetectedProject): string {
  // ... existing code ...

  // Build pages table with proper serialization
  const pagesTable = essence.structure.map(p => {
    const layoutStr = p.layout.map(serializeLayoutItem).join(', ') || 'none';
    return `| ${p.id} | ${p.shell} | ${layoutStr} |`;
  }).join('\n');

  // ... rest of function ...
}
```

### 2. Add Theme Colors to Template

Update `packages/cli/src/templates/DECANTR.md.template`:

Add after "Essence Overview" section:

```markdown
### Theme Quick Reference

{{THEME_QUICK_REFERENCE}}
```

Update `generateDecantrMd` to populate this:

```typescript
async function generateDecantrMd(
  essence: EssenceFile,
  detected: DetectedProject,
  themeData?: { seed?: Record<string, string>; palette?: Record<string, string> },
  recipeData?: { decorators?: Record<string, string> }
): string {
  // ... existing code ...

  // Build theme quick reference
  let themeQuickRef = '';
  if (themeData?.seed) {
    const colors = Object.entries(themeData.seed)
      .map(([name, hex]) => `- **${name}:** \`${hex}\``)
      .join('\n');
    themeQuickRef = `**Seed Colors:**\n${colors}`;
  }

  // Add recipe decorators
  let recipeDecorators = '';
  if (recipeData?.decorators) {
    const decorators = Object.entries(recipeData.decorators)
      .slice(0, 5)  // Top 5 decorators
      .map(([name, desc]) => `- \`${name}\` — ${desc}`)
      .join('\n');
    recipeDecorators = `\n\n**Key Decorators:**\n${decorators}`;
  }

  const vars: Record<string, string> = {
    // ... existing vars ...
    THEME_QUICK_REFERENCE: themeQuickRef + recipeDecorators || 'See `decantr get theme {{THEME_STYLE}}` for details.',
  };

  return renderTemplate(template, vars);
}
```

### 3. Add CLI Command Guidance

Update the template's "Before Writing Code" section:

```markdown
## Before Writing Code

**Always check these before generating UI code:**

### Quick Commands

```bash
# Get full theme spec (colors, palette, modes)
npx decantr get theme {{THEME_STYLE}}

# Get recipe decorators and effects
npx decantr get recipe {{THEME_RECIPE}}

# Get pattern structure and presets
npx decantr get pattern <pattern-name>

# Search for patterns
npx decantr search <query>
```

### With MCP Tools (If Available)

> Note: MCP tools require the `@decantr/mcp-server` to be configured. If these tools aren't available, use the CLI commands above.

1. `decantr_read_essence` — Load the current essence
2. `decantr_check_drift` — Verify your planned changes won't violate rules
3. `decantr_resolve_pattern` — Get pattern details before implementing
4. `decantr_suggest_patterns` — Find appropriate patterns for new sections
```

### 4. Update Template Sections

Full updated template section for "Theme Quick Reference":

```markdown
### Theme Quick Reference

{{THEME_QUICK_REFERENCE}}

**To fetch complete theme and recipe specs:**
```bash
npx decantr get theme {{THEME_STYLE}}
npx decantr get recipe {{THEME_RECIPE}}
```
```

## Files to Modify

1. `packages/cli/src/scaffold.ts`
   - Add `serializeLayoutItem()` function
   - Update `generateDecantrMd()` to use it
   - Add optional theme/recipe data parameters
   - Populate theme quick reference

2. `packages/cli/src/templates/DECANTR.md.template`
   - Add `{{THEME_QUICK_REFERENCE}}` section
   - Update MCP tools section with conditional note
   - Add CLI command quick reference

3. `packages/cli/src/index.ts`
   - Pass theme/recipe data to `generateDecantrMd()` when available

## Test Cases

```typescript
describe('serializeLayoutItem', () => {
  it('handles string patterns', () => {
    expect(serializeLayoutItem('kpi-grid')).toBe('kpi-grid');
  });

  it('handles pattern objects with preset', () => {
    expect(serializeLayoutItem({ pattern: 'hero', preset: 'landing' }))
      .toBe('hero (landing)');
  });

  it('handles pattern objects with alias', () => {
    expect(serializeLayoutItem({ pattern: 'hero', preset: 'landing', as: 'guild-hero' }))
      .toBe('hero (landing) as guild-hero');
  });

  it('handles column layouts', () => {
    expect(serializeLayoutItem({ cols: ['activity-feed', 'top-players'], at: 'lg' }))
      .toBe('[activity-feed | top-players] @lg');
  });

  it('handles nested column layouts', () => {
    expect(serializeLayoutItem({
      cols: [{ pattern: 'hero', preset: 'landing' }, 'sidebar'],
      at: 'md'
    })).toBe('[hero (landing) | sidebar] @md');
  });
});
```

## Validation

```bash
# Rebuild CLI
cd packages/cli && pnpm build

# Test with a fresh init
mkdir /tmp/test-decantr && cd /tmp/test-decantr
npx decantr init --blueprint gaming-platform --yes

# Check DECANTR.md for:
# 1. No [object Object] in tables
# 2. Theme colors section present
# 3. CLI commands documented
cat DECANTR.md | grep -E "\[object Object\]"  # Should find nothing

# Cleanup
rm -rf /tmp/test-decantr
```

## Checklist

- [ ] Add `serializeLayoutItem()` helper to `scaffold.ts`
- [ ] Update `generateDecantrMd()` to use serializer
- [ ] Add theme/recipe data fetching in `index.ts`
- [ ] Update `DECANTR.md.template` with theme quick reference section
- [ ] Update MCP tools section to be conditional
- [ ] Add CLI command quick reference to template
- [ ] Add tests for `serializeLayoutItem()`
- [ ] Run full test suite: `pnpm test`
- [ ] Test with fresh `decantr init`
- [ ] Commit: `fix(cli): improve DECANTR.md generation with proper serialization and theme data`
