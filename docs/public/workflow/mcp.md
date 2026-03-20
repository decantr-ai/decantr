# Using the MCP Server

Decantr includes a Model Context Protocol (MCP) server that exposes 16 tools for AI assistants. This makes your AI a Decantr expert — it can look up patterns, validate changes, and generate code that follows the registry.

## What is MCP?

MCP (Model Context Protocol) is a standard for AI tools. Instead of relying on training data (which may be outdated), AI assistants can query live tools for accurate, up-to-date information.

When you connect Decantr's MCP server, your AI can:
- Look up component props and valid configurations
- Search the pattern registry
- Validate Essence changes before applying them
- Generate code that uses the correct atoms and components

---

## Setup

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "decantr": {
      "command": "npx",
      "args": ["decantr", "mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "servers": {
    "decantr": {
      "command": "npx",
      "args": ["decantr", "mcp"]
    }
  }
}
```

### VS Code with Claude

Configure in your workspace settings or use the Claude extension's MCP configuration.

---

## Available Tools

### Registry Lookup

| Tool | Description |
|------|-------------|
| `list_components` | List all available components with categories |
| `get_component` | Get full props, variants, and examples for a component |
| `list_patterns` | List all patterns with descriptions |
| `get_pattern` | Get pattern details including presets and blend specs |
| `search_patterns` | Search patterns by keyword or category |

### Archetype & Recipe

| Tool | Description |
|------|-------------|
| `list_archetypes` | List available domain archetypes |
| `get_archetype` | Get archetype defaults, pages, and recommended patterns |
| `get_recipe` | Get recipe decoration rules and spatial hints |

### Validation

| Tool | Description |
|------|-------------|
| `validate_essence` | Check Essence file for errors |
| `check_cork_rules` | Verify a change against Cork rules |

### Code Generation

| Tool | Description |
|------|-------------|
| `get_pattern_code` | Get code for a pattern with specific preset |
| `resolve_atoms` | Expand atom shorthand to full CSS |
| `get_blend_code` | Generate code for a complete blend |

### Visual Effects

| Tool | Description |
|------|-------------|
| `get_visual_effects` | Get available visual effects for a recipe |

---

## Common Workflows

### Adding a Pattern to a Page

**You:** "Add a kanban board to the overview page."

**AI uses:**
1. `search_patterns` → finds `kanban-board` pattern
2. `get_pattern` → gets presets and blend spec
3. `validate_essence` → checks if adding to blend is valid
4. `get_pattern_code` → gets implementation code

**Result:** AI adds the pattern to your Essence and generates correct code.

### Looking Up Component Props

**You:** "What props does the DataTable component accept?"

**AI uses:**
1. `get_component` with `id: "DataTable"`

**Returns:** Full prop definitions, types, defaults, and usage examples.

### Validating Changes

**You:** "Change the style to glassmorphism."

**AI uses:**
1. `validate_essence` → checks current state
2. `check_cork_rules` → verifies style change is allowed

**If cork mode is `maintenance`:** AI flags that this violates Cork rule #1 and asks for confirmation.

---

## Example Session

```
You: Add a kanban board to the dashboard

AI: Let me look up the kanban pattern.

→ search_patterns { "query": "kanban" }
  Found: kanban-board (patterns/kanban-board.json)

→ get_pattern { "id": "kanban-board" }
  Presets: default, task, project
  Components: Card, Badge, Chip, Button, DragDrop

→ validate_essence { "path": "decantr.essence.json" }
  Current structure includes: overview, analytics, settings

I'll add the kanban-board pattern to your overview page blend.
Which preset would you like?
- default: Basic columns
- task: With assignees and due dates
- project: With progress bars and milestones

You: Task preset

→ get_pattern_code { "id": "kanban-board", "preset": "task" }

✓ Updated decantr.essence.json
✓ Generated src/patterns/kanban-board.js
✓ Added to overview page blend
```

---

## Tips

### Let AI Query Instead of Guessing

If you're unsure about a component or pattern, ask directly:

> "What patterns exist for displaying metrics?"
> "Show me the Button component variants."
> "What presets does the hero pattern have?"

The AI will query the MCP server and give you accurate information.

### Validate Before Committing

After significant changes, ask:

> "Validate the Essence file."

This catches issues before they become problems.

### Use Cork Checks for Refactoring

When changing multiple files:

> "Check these changes against Cork rules."

The AI will flag any drift from the Essence.

---

## Troubleshooting

### MCP Not Connecting

1. Ensure you're in a Decantr project directory
2. Check that `npx decantr mcp` runs without errors
3. Restart your AI client after config changes

### Tools Not Found

The MCP server requires Decantr to be installed:

```bash
npm install decantr
```

### Stale Data

MCP reads from your local `node_modules/decantr/src/registry/`. If you've installed new registry content, restart the MCP server.
