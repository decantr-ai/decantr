# WS7: CLAUDE.md Cleanup

## Problem

The CLAUDE.md file has outdated information that could mislead AI assistants working on the project.

## Discrepancies Found

| Section | Current Value | Actual Value | Action |
|---------|---------------|--------------|--------|
| Packages table | Missing CLI | CLI exists at `packages/cli/` | Add row |
| Archetypes count | "19 app archetypes" | 20 | Update |
| Blueprints count | "10 composed app templates" | 11 | Update |
| Patterns count | "9 UI section patterns" | 16 | Update |
| Themes count | "10 theme definitions" | 11 | Update |
| Recipes description | "currently empty" | 1 recipe (luminarum) | Update |
| Core directory | Lists only shells | Also has patterns/ and recipes/ | Update |

## Solution

Update CLAUDE.md with accurate information.

## Changes to Make

### 1. Add CLI to Packages Table

```markdown
## Packages

| Package | Path | Description |
|---------|------|-------------|
| `@decantr/essence-spec` | `packages/essence-spec/` | Schema, validator, guard rules, TypeScript types |
| `@decantr/registry` | `packages/registry/` | Content resolver, wiring rules, pattern preset resolution |
| `@decantr/core` | `packages/core/` | Design Pipeline IR engine |
| `@decantr/mcp-server` | `packages/mcp-server/` | MCP server exposing tools to AI assistants |
| `decantr` | `packages/cli/` | CLI for project initialization, registry queries, validation |
```

### 2. Update Content Directory Section

```markdown
## Content Directory

```
content/
  archetypes/     # 20 app archetypes (e.g., saas-dashboard.json, gaming-community.json)
  blueprints/     # 11 composed app templates
  patterns/       # 16 UI section patterns (e.g., kpi-grid.json, activity-feed.json)
  recipes/        # 1 visual decoration rule (luminarum.json)
  themes/         # 11 theme definitions (e.g., luminarum.json, glassmorphism.json)
  core/           # Core defaults
    shells.json   # Shell layout definitions
    patterns/     # Base patterns (hero.json)
    recipes/      # Base recipes (auradecantism.json)
```
```

### 3. Add CLI Commands Section (Optional)

Consider adding a quick reference for CLI commands:

```markdown
## CLI Commands

```bash
decantr init              # Initialize a new Decantr project
decantr status            # Show project status
decantr validate [path]   # Validate essence file
decantr search <query>    # Search registry
decantr get <type> <id>   # Get full item details
decantr list <type>       # List all items of type
decantr sync              # Sync registry from API
decantr audit             # Audit project for issues
```
```

### 4. Remove or Update Stale Test Artifacts Note

Add a note about not committing test artifacts:

```markdown
## Development Notes

- Do not commit `decantr.essence.json` or `DECANTR.md` files in package directories (these are test artifacts)
- The `.gitignore` excludes `packages/*/decantr.essence.json` and `packages/*/.decantr/`
```

## Files to Modify

1. `/CLAUDE.md` — Update all sections listed above

## Validation

After updating, verify accuracy:

```bash
# Verify counts match
echo "Archetypes: $(ls content/archetypes/*.json | wc -l)"
echo "Blueprints: $(ls content/blueprints/*.json | wc -l)"
echo "Patterns: $(ls content/patterns/*.json | wc -l)"
echo "Themes: $(ls content/themes/*.json | wc -l)"
echo "Recipes: $(ls content/recipes/*.json | wc -l)"

# Verify CLI package exists
ls packages/cli/package.json
```

## Checklist

- [ ] Add CLI package to packages table
- [ ] Update archetypes count (19 → 20)
- [ ] Update blueprints count (10 → 11)
- [ ] Update patterns count (9 → 16)
- [ ] Update themes count (10 → 11)
- [ ] Update recipes description ("currently empty" → actual count)
- [ ] Update core/ directory listing to include patterns/ and recipes/
- [ ] Add CLI commands quick reference section
- [ ] Add development notes about test artifacts
- [ ] Verify all counts are accurate
- [ ] Commit: `docs: update CLAUDE.md with accurate content counts and CLI package`
