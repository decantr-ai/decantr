# WS2: Theme-Recipe Completeness

## Problem

Theme and recipe coverage is incomplete:

| Issue | Details |
|-------|---------|
| Low recipe coverage | Only 2 recipes (luminarum, auradecantism) for 11 themes (18%) |
| Missing theme | `auradecantism` has recipe in `content/core/recipes/` but no theme |
| Missing recipe | `launchpad` has theme but no recipe |
| Location mismatch | `auradecantism` recipe is in `content/core/recipes/`, not `content/recipes/` |

## Current State

### Themes (11)
```
content/themes/
├── bioluminescent.json
├── clean.json
├── dopamine.json
├── editorial.json
├── gaming-guild.json
├── glassmorphism.json
├── launchpad.json
├── liquid-glass.json
├── luminarum.json
├── prismatic.json
└── retro.json
```

### Recipes (2)
```
content/recipes/
└── luminarum.json

content/core/recipes/
└── auradecantism.json
```

## Solution

1. Move `auradecantism` recipe to main recipes directory
2. Create `auradecantism` theme definition
3. Create recipes for remaining themes (prioritize most-used)

## Priority Order

Based on usage and distinctiveness:

| Priority | Theme | Has Recipe | Action |
|----------|-------|------------|--------|
| 1 | auradecantism | Yes (wrong location) | Create theme, move recipe |
| 2 | launchpad | No | Create recipe |
| 3 | glassmorphism | No | Create recipe |
| 4 | gaming-guild | No | Create recipe |
| 5 | clean | No | Create recipe |
| 6+ | Others | No | Create recipes |

## Files to Create/Move

### 1. Move `auradecantism` recipe

```bash
mv content/core/recipes/auradecantism.json content/recipes/auradecantism.json
```

### 2. Create `content/themes/auradecantism.json`

```json
{
  "$schema": "https://decantr.ai/schemas/style-metadata.v1.json",
  "id": "auradecantism",
  "name": "Auradecantism",
  "description": "Luminous glass aesthetic with purple/cyan/pink palette. Bouncy pill shapes, glass morphism effects, and vibrant gradients.",
  "tags": ["dark", "glass", "vibrant", "modern", "premium", "animated"],
  "personality": "luminous + bouncy + glass + vibrant gradients + pill shapes",
  "seed": {
    "primary": "#A855F7",
    "secondary": "#0EA5E9",
    "accent": "#EC4899",
    "background": "#0F0A1A"
  },
  "palette": {
    "purple": "#A855F7",
    "cyan": "#0EA5E9",
    "pink": "#EC4899",
    "magenta": "#D946EF",
    "indigo": "#6366F1",
    "violet": "#8B5CF6"
  },
  "modes": ["dark"],
  "shapes": ["pill", "rounded"],
  "decantr_compat": ">=1.0.0",
  "source": "core"
}
```

### 3. Create `content/recipes/launchpad.json`

```json
{
  "$schema": "https://decantr.ai/schemas/recipe.v2.json",
  "id": "launchpad",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Launchpad",
  "description": "Clean startup aesthetic with bold typography, generous whitespace, and subtle shadows. Works in both light and dark modes.",
  "dependencies": {
    "styles": {
      "launchpad": ">=1.0.0"
    }
  },
  "schema_version": "2.0",
  "style": "launchpad",
  "mode": "auto",
  "spatial_hints": {
    "density_bias": 0,
    "content_gap_shift": 0,
    "section_padding": "96px",
    "card_wrapping": "standard",
    "surface_override": null
  },
  "shell": {
    "preferred": ["top-nav-main", "minimal-header"],
    "avoid": ["sidebar-main"],
    "nav_style": "minimal",
    "default_nav_state": "expanded",
    "root": "lp-surface",
    "nav": "lp-nav",
    "header": "lp-header",
    "brand": "lp-brand"
  },
  "animation": {
    "entrance": "lp-fade-in",
    "micro": "snappy"
  },
  "visual_effects": {
    "enabled": true,
    "intensity": "subtle",
    "type_mapping": {
      "hero_section": ["lp-gradient-mesh"],
      "feature_card": ["lp-card-elevated"],
      "cta_button": ["lp-button-primary"]
    }
  },
  "card_styles": {
    "elevated": {
      "description": "Clean card with subtle shadow and rounded corners",
      "properties": {
        "background": "var(--lp-surface)",
        "border-radius": "12px",
        "box-shadow": "0 4px 24px rgba(0,0,0,0.08)"
      }
    },
    "outlined": {
      "description": "Card with thin border, no shadow",
      "properties": {
        "background": "transparent",
        "border": "1px solid var(--lp-border)",
        "border-radius": "12px"
      }
    }
  },
  "decorators": {
    "lp-surface": "Base surface with subtle texture. Light mode: #FAFAFA, Dark mode: #111111.",
    "lp-nav": "Sticky navigation with blur backdrop. Minimal branding.",
    "lp-header": "Large hero with gradient mesh background.",
    "lp-card-elevated": "Card with elevation shadow, hover lift effect.",
    "lp-gradient-mesh": "Subtle gradient mesh in primary/accent colors at 5% opacity.",
    "lp-button-primary": "Solid primary color button with hover scale.",
    "lp-fade-in": "Simple fade-in on scroll, 0.4s duration."
  }
}
```

### 4. Create `content/recipes/glassmorphism.json`

```json
{
  "$schema": "https://decantr.ai/schemas/recipe.v2.json",
  "id": "glassmorphism",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Glassmorphism",
  "description": "Frosted glass panels with blur effects, subtle borders, and layered transparency.",
  "dependencies": {
    "styles": {
      "glassmorphism": ">=1.0.0"
    }
  },
  "schema_version": "2.0",
  "style": "glassmorphism",
  "mode": "dark",
  "spatial_hints": {
    "density_bias": 0,
    "content_gap_shift": 0,
    "section_padding": "80px",
    "card_wrapping": "glass",
    "surface_override": null
  },
  "shell": {
    "preferred": ["sidebar-main", "top-nav-main"],
    "avoid": [],
    "nav_style": "glass",
    "default_nav_state": "expanded",
    "root": "glass-backdrop",
    "nav": "glass-panel",
    "header": "glass-header"
  },
  "animation": {
    "entrance": "glass-fade-up",
    "micro": "smooth"
  },
  "visual_effects": {
    "enabled": true,
    "intensity": "medium",
    "type_mapping": {
      "card": ["glass-card"],
      "nav": ["glass-panel"],
      "modal": ["glass-overlay"]
    }
  },
  "card_styles": {
    "glass": {
      "description": "Frosted glass card with blur and subtle border",
      "properties": {
        "background": "rgba(255,255,255,0.05)",
        "backdrop-filter": "blur(20px)",
        "border": "1px solid rgba(255,255,255,0.1)",
        "border-radius": "16px"
      }
    }
  },
  "decorators": {
    "glass-backdrop": "Dark gradient background with subtle noise texture.",
    "glass-panel": "Frosted panel with blur(20px), 5% white background, subtle border.",
    "glass-card": "Individual glass card element.",
    "glass-header": "Glass hero section with layered blur panels.",
    "glass-overlay": "Modal overlay with heavy blur.",
    "glass-fade-up": "Entrance animation: fade + translateY(20px) over 0.5s."
  }
}
```

### 5. Create `content/recipes/gaming-guild.json`

```json
{
  "$schema": "https://decantr.ai/schemas/recipe.v2.json",
  "id": "gaming-guild",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Gaming Guild",
  "description": "High-energy gaming aesthetic with neon accents, dark surfaces, and animated elements.",
  "dependencies": {
    "styles": {
      "gaming-guild": ">=1.0.0"
    }
  },
  "schema_version": "2.0",
  "style": "gaming-guild",
  "mode": "dark",
  "spatial_hints": {
    "density_bias": -1,
    "content_gap_shift": 0,
    "section_padding": "64px",
    "card_wrapping": "minimal",
    "surface_override": null
  },
  "shell": {
    "preferred": ["sidebar-main"],
    "avoid": ["centered", "minimal-header"],
    "nav_style": "filled",
    "default_nav_state": "expanded",
    "root": "gg-dark",
    "nav": "gg-sidebar",
    "header": "gg-hero"
  },
  "animation": {
    "entrance": "gg-slide-in",
    "micro": "bouncy"
  },
  "visual_effects": {
    "enabled": true,
    "intensity": "strong",
    "type_mapping": {
      "hero_section": ["gg-neon-glow"],
      "stat_display": ["gg-stat-pulse"],
      "leaderboard": ["gg-rank-badge"],
      "achievement": ["gg-achievement-shine"]
    }
  },
  "card_styles": {
    "neon": {
      "description": "Dark card with neon border glow",
      "properties": {
        "background": "rgba(0,0,0,0.6)",
        "border": "2px solid var(--gg-accent)",
        "box-shadow": "0 0 20px var(--gg-accent-glow)",
        "border-radius": "8px"
      }
    },
    "solid": {
      "description": "Filled card with accent color",
      "properties": {
        "background": "var(--gg-accent)",
        "border-radius": "8px",
        "color": "#000"
      }
    }
  },
  "decorators": {
    "gg-dark": "Near-black background (#0A0A0F) with subtle grid pattern.",
    "gg-sidebar": "Dark sidebar with accent-colored active states.",
    "gg-hero": "Hero with animated gradient background.",
    "gg-neon-glow": "Neon glow effect behind hero elements.",
    "gg-stat-pulse": "Stats with subtle pulse animation.",
    "gg-rank-badge": "Rank position with metallic gradient (gold/silver/bronze).",
    "gg-achievement-shine": "Achievement cards with shine animation on hover.",
    "gg-slide-in": "Entrance: slide from left with slight bounce."
  }
}
```

### 6. Create `content/recipes/clean.json`

```json
{
  "$schema": "https://decantr.ai/schemas/recipe.v2.json",
  "id": "clean",
  "version": "1.0.0",
  "decantr_compat": ">=1.0.0",
  "name": "Clean",
  "description": "Minimal, professional aesthetic. Monochrome base with single accent color. Maximum readability.",
  "dependencies": {
    "styles": {
      "clean": ">=1.0.0"
    }
  },
  "schema_version": "2.0",
  "style": "clean",
  "mode": "auto",
  "spatial_hints": {
    "density_bias": 0,
    "content_gap_shift": 0,
    "section_padding": "64px",
    "card_wrapping": "standard",
    "surface_override": null
  },
  "shell": {
    "preferred": ["top-nav-main", "sidebar-main"],
    "avoid": [],
    "nav_style": "minimal",
    "default_nav_state": "collapsed",
    "root": "clean-surface",
    "nav": "clean-nav",
    "header": ""
  },
  "animation": {
    "entrance": "none",
    "micro": "instant"
  },
  "visual_effects": {
    "enabled": false,
    "intensity": "none"
  },
  "card_styles": {
    "flat": {
      "description": "Borderless card with subtle background difference",
      "properties": {
        "background": "var(--clean-surface-raised)",
        "border-radius": "8px"
      }
    },
    "bordered": {
      "description": "Card with thin border, no shadow",
      "properties": {
        "background": "var(--clean-surface)",
        "border": "1px solid var(--clean-border)",
        "border-radius": "8px"
      }
    }
  },
  "decorators": {
    "clean-surface": "Pure white (#FFFFFF) or near-black (#111111) depending on mode.",
    "clean-nav": "Minimal navigation with text links, no backgrounds.",
    "clean-surface-raised": "Slightly elevated surface for cards (2% darker/lighter)."
  }
}
```

## Validation

```bash
# Verify all themes have matching recipes
for theme in $(ls content/themes/*.json | xargs -n1 basename | sed 's/.json//'); do
  if [ -f "content/recipes/$theme.json" ]; then
    echo "OK: $theme"
  else
    echo "MISSING: $theme recipe"
  fi
done

# Test specific lookups
npx decantr get theme auradecantism
npx decantr get recipe auradecantism
npx decantr get recipe launchpad
```

## Checklist

- [ ] Move `content/core/recipes/auradecantism.json` to `content/recipes/auradecantism.json`
- [ ] Create `content/themes/auradecantism.json`
- [ ] Create `content/recipes/launchpad.json`
- [ ] Create `content/recipes/glassmorphism.json`
- [ ] Create `content/recipes/gaming-guild.json`
- [ ] Create `content/recipes/clean.json`
- [ ] Verify theme-recipe pairing for all created files
- [ ] Run existing tests: `pnpm test`
- [ ] Commit: `feat(content): add missing themes and recipes for complete coverage`

## Future Work

Create recipes for remaining themes:
- bioluminescent
- dopamine
- editorial
- liquid-glass
- prismatic
- retro
