# Visual Effects System Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a recipe-driven visual effects system that automatically applies decorators (glows, terminal chrome, gradient hints) during code generation, so scaffolded output is visually stunning on first render.

**Architecture:** Decorators + compositions layer (not new components). Recipes define `visual_effects` config with type mappings. Generator reads config and applies decorators automatically. Patterns stay agnostic.

**Tech Stack:** CSS custom properties, recipe JSON schema, generator updates, MCP server extension.

---

## 1. Design Decisions

### 1.1 Layer Placement
Visual effects belong in the **decorator layer**, not the component layer:
- Components remain structural and agnostic (Card, Button, Badge)
- Decorators express recipe personality (d-glass, d-glow-primary)
- Recipes orchestrate which decorators apply to which patterns

### 1.2 Implementation Approach
**Hybrid: Pattern Types + Component Fallback**
- Patterns CAN declare `effect_types` (explicit)
- If not declared, generator detects components and uses `component_fallback` mapping (implicit)
- Graceful migration path for existing patterns

### 1.3 Intensity Control
**CSS Custom Properties**
- Single decorator class per effect (e.g., `d-glow-primary`)
- Intensity controlled via CSS variables (`--d-glow-radius`, `--d-glow-intensity`)
- Each recipe sets variable values based on `intensity` preset (subtle/medium/strong)

### 1.4 Scope
All 4 core recipes receive visual_effects implementation:
- `auradecantism` — Strong glow, terminal chrome, mesh gradients
- `clean` — Subtle shadows, minimal chrome
- `gaming-guild` — Intense glow, neon borders
- `launchpad` — Medium glow, product focus

---

## 2. Semantic Effect Types

Patterns declare functional slots. Recipes map them to decorators.

| Effect Type | Purpose | Example Decorators (auradecantism) |
|-------------|---------|-----------------------------------|
| `code_preview` | Terminal/code displays | `d-terminal-chrome` |
| `stat_display` | Large metrics/numbers | `d-glow-primary`, `d-stat-glow` |
| `feature_card` | Highlighted feature boxes | `d-glass`, `d-gradient-hint-primary` |
| `icon_container` | Icon backgrounds | `d-gradient-hint-primary`, `d-glow-primary` |

Effect types are **semantic/functional**, not theme-specific. The same `code_preview` type renders differently per recipe.

---

## 3. New Decorators

### 3.1 Decorator Classes

```css
/* CSS Custom Properties (set by recipe based on intensity) */
:root {
  --d-glow-radius: 30px;
  --d-glow-intensity: 0.3;
  --d-chrome-bg: linear-gradient(145deg, #1a1a2e, #0d0d14);
  --d-gradient-hint-opacity: 0.08;
}

/* d-glow-primary — Accent glow effect */
.d-glow-primary {
  box-shadow:
    0 0 var(--d-glow-radius) rgba(var(--d-primary-rgb), var(--d-glow-intensity)),
    inset 0 1px 0 rgba(255,255,255,0.08);
  border: 1px solid rgba(var(--d-primary-rgb), 0.4);
}

/* d-terminal-chrome — macOS-style window */
.d-terminal-chrome {
  background: var(--d-chrome-bg);
  border-radius: var(--d-radius-panel);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 40px rgba(var(--d-accent-rgb), 0.08);
}
.d-terminal-chrome::before {
  /* Traffic light dots via CSS */
}

/* d-stat-glow — Text glow for large numbers */
.d-stat-glow {
  text-shadow: 0 0 var(--d-glow-radius) rgba(var(--d-primary-rgb), 0.4);
}

/* d-gradient-hint-primary — Subtle gradient background */
.d-gradient-hint-primary {
  background: linear-gradient(
    135deg,
    rgba(var(--d-primary-rgb), var(--d-gradient-hint-opacity)) 0%,
    transparent 50%
  );
}
```

### 3.2 Intensity Presets

| Preset | `--d-glow-radius` | `--d-glow-intensity` | `--d-gradient-hint-opacity` |
|--------|-------------------|----------------------|-----------------------------|
| subtle | 15px | 0.15 | 0.04 |
| medium | 30px | 0.3 | 0.08 |
| strong | 50px | 0.5 | 0.12 |

---

## 4. Recipe Schema

### 4.1 New `visual_effects` Field

```json
{
  "id": "auradecantism",
  "style": "auradecantism",

  "visual_effects": {
    "enabled": true,
    "intensity": "medium",

    "type_mapping": {
      "code_preview": ["d-terminal-chrome"],
      "stat_display": ["d-glow-primary", "d-stat-glow"],
      "feature_card": ["d-glass", "d-gradient-hint-primary"],
      "icon_container": ["d-gradient-hint-primary", "d-glow-primary"]
    },

    "component_fallback": {
      "pre": "code_preview",
      "Statistic": "stat_display",
      "Card": "feature_card"
    }
  },

  "decorators": { ... },
  "skeleton": { ... }
}
```

### 4.2 Per-Recipe Configuration

| Recipe | Intensity | Key Decorators |
|--------|-----------|----------------|
| auradecantism | medium | d-terminal-chrome, d-glow-primary, d-mesh |
| clean | subtle | d-code-frame, d-stat-bold, d-shadow-sm |
| gaming-guild | strong | d-neon-glow, d-scanlines, d-terminal-chrome |
| launchpad | medium | d-glow-accent, d-gradient-hint-accent |

---

## 5. Pattern Schema

### 5.1 Optional `effect_types` Field

```json
{
  "id": "bento-features",
  "name": "Bento Features",

  "effect_types": {
    "terminal": "code_preview",
    "stats": "stat_display",
    "features": "icon_container"
  },

  "presets": { ... },
  "default_blend": { ... }
}
```

If `effect_types` is omitted, generator falls back to component detection.

---

## 6. Generator Logic

### 6.1 Flow

1. **Load recipe** `visual_effects` config
   - Check `enabled` flag
   - Get `intensity` preset
   - Load `type_mapping` and `component_fallback`

2. **For each pattern in blend:**
   - If pattern has `effect_types` → use explicit mapping
   - Else → scan pattern code for components, use `component_fallback`

3. **Map effect types → decorator classes** via `type_mapping`

4. **Inject decorators** into generated code
   - Add classes to appropriate elements

5. **Set CSS custom properties** based on `intensity`
   - Inject into page/root styles

### 6.2 Code Location

Primary changes in `tools/generate.js`:
- Add `resolveVisualEffects(recipe, pattern)` function
- Extend `wrapPattern()` to apply decorators
- Add intensity CSS injection

---

## 7. MCP Server Updates

### 7.1 New Tool: `get_visual_effects`

**Input:**
```json
{ "recipe": "auradecantism" }
```

**Output:**
```json
{
  "recipe": "auradecantism",
  "visual_effects": {
    "enabled": true,
    "intensity": "medium",
    "type_mapping": { ... },
    "component_fallback": { ... }
  },
  "decorators": {
    "d-terminal-chrome": {
      "description": "macOS-style terminal window with traffic light dots",
      "usage": "Wrap pre/code elements"
    },
    "d-glow-primary": {
      "description": "Box-shadow glow using primary color",
      "usage": "Apply to cards, stats, highlighted elements"
    }
  },
  "intensity_values": {
    "--d-glow-radius": "30px",
    "--d-glow-intensity": "0.3",
    "--d-gradient-hint-opacity": "0.08"
  }
}
```

### 7.2 AI Usage

When AI scaffolds code:
1. Call `get_visual_effects(recipe)` to get config
2. Apply appropriate decorators based on effect type
3. Result: visually stunning on first scaffold

---

## 8. Files to Modify

| File | Changes |
|------|---------|
| `src/css/styles/auradecantism.js` | Add new decorator CSS classes |
| `src/css/styles/clean.js` | Add recipe-appropriate decorators |
| `src/css/styles/gaming-guild.js` | Add recipe-appropriate decorators |
| `src/css/styles/launchpad.js` | Add recipe-appropriate decorators |
| `src/registry/recipe-auradecantism.json` | Add `visual_effects` config |
| `src/registry/recipe-clean.json` | Add `visual_effects` config |
| `src/registry/recipe-gaming-guild.json` | Add `visual_effects` config |
| `src/registry/recipe-launchpad.json` | Add `visual_effects` config |
| `src/registry/patterns/bento-features.json` | Add `effect_types` (example) |
| `tools/generate.js` | Add visual effects resolution + injection |
| `registry-server/mcp-server.js` | Add `get_visual_effects` tool |

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Test decorator CSS generates correctly
- Test `resolveVisualEffects()` function
- Test intensity preset CSS variable values
- Test component fallback detection

### 9.2 Integration Tests
- Generate pattern with visual_effects enabled → verify decorators applied
- Generate pattern with visual_effects disabled → verify no decorators
- Generate pattern with explicit effect_types → verify correct mapping
- Generate pattern without effect_types → verify fallback works

### 9.3 Visual Verification
- Regenerate docs site bento-features section
- Compare against current hand-rolled implementation
- Verify all 4 recipes produce appropriate visual polish

---

## 10. Migration Path

1. **Phase 1:** Implement decorators in auradecantism style CSS
2. **Phase 2:** Add `visual_effects` config to auradecantism recipe
3. **Phase 3:** Update generator to read config and apply decorators
4. **Phase 4:** Extend to remaining 3 recipes
5. **Phase 5:** Add MCP server tool
6. **Phase 6:** Update LLM task profiles to reference visual_effects
7. **Phase 7:** Add `effect_types` to key patterns (optional, for explicit control)

---

## 11. Success Criteria

- [ ] Scaffolding a new project with auradecantism recipe produces visually stunning output without manual decorator application
- [ ] The same pattern renders with recipe-appropriate visual effects across all 4 recipes
- [ ] AI assistants can query `get_visual_effects` and apply decorators correctly
- [ ] Existing patterns work via component fallback (no breaking changes)
- [ ] New patterns can opt-in to explicit `effect_types` for precise control
