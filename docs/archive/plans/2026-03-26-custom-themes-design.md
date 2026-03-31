# Custom Themes Architecture

**Date:** 2026-03-26
**Status:** Approved
**Author:** Claude + David

## Summary

Enable users to create and use custom themes that live locally in their project, separate from the Decantr registry. Custom themes use the `custom:` namespace prefix and are resolved from `.decantr/custom/themes/`.

## Motivation

Users may want to:
- Create themes from an external theme roller tool
- Define project-specific visual identity not in the registry
- Iterate on themes locally before potentially submitting to registry

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Directory structure | `.decantr/custom/themes/` | Scalable for future custom patterns/recipes |
| Namespace | `custom:themename` prefix | Explicit routing, no shadowing risk, self-documenting |
| Validation | Strict schema validation | Prevent downstream errors, match registry quality |
| Resolution | Resolver-level integration | Single integration point, all consumers benefit |
| Template | Minimal skeleton + docs | Clean JSON, separate reference documentation |

## Directory Structure

```
.decantr/
  cache/
    themes/
      index.json              # Registry theme list cache
      auradecantism.json      # Cached registry themes
  custom/
    themes/
      how-to-theme.md         # Documentation (auto-generated)
      mytheme.json            # User's custom theme
    patterns/                 # Future: custom patterns
    recipes/                  # Future: custom recipes
```

## Custom Theme Schema

Custom themes use the same schema as registry themes:

```json
{
  "$schema": "https://decantr.ai/schemas/style-metadata.v1.json",
  "id": "mytheme",
  "name": "My Theme",
  "description": "A custom theme for my project",
  "tags": ["dark", "minimal"],
  "seed": {
    "primary": "#6366F1",
    "secondary": "#8B5CF6",
    "accent": "#EC4899",
    "background": "#0F172A"
  },
  "palette": {
    "indigo": "#6366F1",
    "violet": "#8B5CF6",
    "pink": "#EC4899"
  },
  "modes": ["dark"],
  "shapes": ["rounded", "sharp"],
  "decantr_compat": ">=1.0.0",
  "source": "custom"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier, matches filename |
| `name` | string | Display name |
| `seed` | object | Core colors: primary, secondary, accent, background |
| `modes` | string[] | Supported modes: "light", "dark" |
| `shapes` | string[] | Supported shapes: "sharp", "rounded", "pill" |
| `decantr_compat` | string | Semver compatibility range |
| `source` | string | Must be "custom" for custom themes |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Brief description |
| `tags` | string[] | Searchable tags |
| `palette` | object | Extended named colors |
| `personality` | string | Theme personality traits |

## Essence File Usage

```json
{
  "archetype": "saas-dashboard",
  "theme": {
    "style": "custom:mytheme",
    "mode": "dark",
    "recipe": "custom:mytheme",
    "shape": "rounded"
  },
  "pages": {
    "dashboard": {
      "patterns": ["kpi-grid", "chart-grid"]
    }
  }
}
```

**Key point:** The `custom:` prefix is per-content-type. Registry archetypes, patterns, and other content work normally alongside custom themes.

## Resolution Logic

### Flow

```
fetchTheme("custom:mytheme")
  → detect "custom:" prefix
  → strip prefix, resolve from .decantr/custom/themes/mytheme.json
  → validate against schema
  → return { data, source: { type: 'custom', path: '...' } }

fetchTheme("auradecantism")
  → no prefix
  → existing chain: API → Cache → Bundled
```

### RegistryClient Changes

```typescript
// packages/cli/src/registry.ts

export interface RegistrySource {
  type: 'api' | 'bundled' | 'cache' | 'custom';
  url?: string;
  path?: string;  // For custom: local file path
}

async fetchTheme(id: string): Promise<FetchResult<RegistryItem> | null> {
  if (id.startsWith('custom:')) {
    return this.loadCustomContent('themes', id.slice(7));
  }

  // Existing registry chain unchanged
  // ...
}

private loadCustomContent<T>(
  contentType: string,
  id: string
): FetchResult<T> | null {
  const customPath = join(
    this.projectRoot,
    '.decantr',
    'custom',
    contentType,
    `${id}.json`
  );

  if (!existsSync(customPath)) {
    return null;
  }

  const data = JSON.parse(readFileSync(customPath, 'utf-8')) as T;

  return {
    data,
    source: { type: 'custom', path: customPath }
  };
}
```

## CLI Commands

### New `theme` Subcommand

```bash
# Create custom theme
decantr theme create <name>           # Minimal skeleton
decantr theme create <name> --guided  # Interactive prompts

# Manage custom themes
decantr theme list                    # List custom themes only
decantr theme validate <name>         # Validate against schema
decantr theme delete <name>           # Remove custom theme
decantr theme import <path>           # Import/validate external JSON
```

### Enhanced Existing Commands

```bash
# Integrated discovery
decantr list themes                   # Shows registry + custom (labeled)
decantr search "dark glass"           # Searches both sources
decantr get theme custom:mytheme      # Returns full JSON
```

### Output Format

```
$ decantr list themes

Registry themes (11):
  auradecantism    Luminous glass aesthetic...
  clean            Professional, understated...
  ...

Custom themes (1):
  custom:mytheme   A custom theme for my project
```

## Validation

### Schema Validation

Custom themes validated against `style-metadata.v1.json`:

```typescript
const REQUIRED_FIELDS = ['id', 'name', 'seed', 'modes', 'shapes', 'decantr_compat', 'source'];
const REQUIRED_SEED = ['primary', 'secondary', 'accent', 'background'];
const VALID_MODES = ['light', 'dark'];
const VALID_SHAPES = ['sharp', 'rounded', 'pill'];
```

### Error Messages

```
$ decantr theme validate mytheme

✗ Custom theme validation failed:
  - Missing required field: seed.accent
  - Invalid mode "auto" - must be "light" or "dark"
  - Shape "oval" not recognized - use: sharp, rounded, pill
```

### Essence Validation

```
$ decantr validate

Validating decantr.essence.json...
✓ Schema valid
✓ Custom theme "custom:mytheme" found and valid
✓ Archetype "saas-dashboard" resolved from registry
✓ Patterns resolved: kpi-grid, chart-grid
✓ All checks passed
```

## Integration Points

### MCP Server

`decantr_search_registry` includes custom themes in results:

```typescript
if (type === 'themes') {
  const registryResults = await registry.searchThemes(query);
  const customResults = await registry.searchCustomThemes(query);
  return [
    ...registryResults,
    ...customResults.map(r => ({ ...r, source: 'custom' }))
  ];
}
```

### Core Pipeline

Custom themes treated as addons (require style registration):

```typescript
// packages/core/src/resolve.ts
const CORE_STYLES = new Set(['auradecantism']);

const isAddon = style.startsWith('custom:') || !CORE_STYLES.has(style);
const theme = buildTheme(simpleEssence, isAddon);
```

### Guard System

No changes needed. Theme-mode compatibility check receives resolved theme metadata regardless of source.

## Documentation

Auto-generated at `.decantr/custom/themes/how-to-theme.md`:

```markdown
# Custom Themes

Create custom themes for your Decantr project.

## Quick Start

    decantr theme create mytheme

## Theme Structure

| Field | Required | Description |
|-------|----------|-------------|
| id | Yes | Unique identifier (matches filename) |
| name | Yes | Display name |
| description | No | Brief description |
| tags | No | Searchable tags |
| seed | Yes | Core colors: primary, secondary, accent, background |
| palette | No | Extended color palette |
| modes | Yes | Supported modes: ["light"], ["dark"], or both |
| shapes | Yes | Supported shapes: sharp, rounded, pill |
| decantr_compat | Yes | Version compatibility (e.g., ">=1.0.0") |
| source | Yes | Must be "custom" |

## Using Your Theme

In decantr.essence.json:

    {
      "theme": {
        "style": "custom:mytheme",
        "mode": "dark"
      }
    }

## Validation

    decantr theme validate mytheme

## Reference

See registry themes for examples:

    decantr get theme auradecantism
```

## Files to Modify

| File | Changes |
|------|---------|
| `packages/cli/src/registry.ts` | Add `custom:` prefix handling, `loadCustomContent()` |
| `packages/cli/src/registry.ts` | Update `RegistrySource` type |
| `packages/cli/src/index.ts` | Add `theme` subcommand |
| `packages/cli/src/theme-commands.ts` | New file: create, list, validate, delete, import |
| `packages/cli/src/templates/` | Add theme skeleton template |
| `packages/mcp-server/src/tools.ts` | Update search to include custom themes |
| `packages/core/src/resolve.ts` | Treat `custom:` styles as addons |
| `packages/essence-spec/src/validator.ts` | Validate custom theme references in essence |

## Testing

1. Create custom theme via CLI
2. Validate theme structure
3. Reference in essence file
4. Verify `decantr validate` passes
5. Verify `decantr list themes` shows custom theme
6. Verify MCP search includes custom theme
7. Verify core pipeline resolves custom theme
8. Verify mixing custom theme with registry patterns works
