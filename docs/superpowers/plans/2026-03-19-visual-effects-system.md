# Visual Effects System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement recipe-driven visual effects system that automatically applies decorators (glows, terminal chrome, gradient hints) during code generation.

**Architecture:** Add new decorator CSS classes to style files, extend recipe JSON with `visual_effects` config, update generator to resolve effect types and inject decorators automatically.

**Tech Stack:** CSS custom properties, Node.js (generator), JSON schema extensions.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/css/styles/auradecantism.js` | Add new decorator CSS classes (d-glow-primary, d-terminal-chrome, etc.) |
| `src/css/styles/clean.js` | Add clean-appropriate decorators |
| `src/css/styles/gaming-guild.js` | Add gaming-appropriate decorators |
| `src/css/styles/launchpad.js` | Add launchpad-appropriate decorators |
| `src/registry/recipe-auradecantism.json` | Add visual_effects config |
| `src/registry/recipe-clean.json` | Add visual_effects config |
| `src/registry/recipe-gaming-guild.json` | Add visual_effects config |
| `src/registry/recipe-launchpad.json` | Add visual_effects config |
| `tools/generate.js` | Add resolveVisualEffects() function |
| `registry-server/mcp-server.js` | Add get_visual_effects tool |
| `test/visual-effects.test.js` | Unit tests for visual effects system |

---

### Task 1: Add Visual Effects Decorator CSS to Auradecantism

**Files:**
- Modify: `src/css/styles/auradecantism.js`

- [ ] **Step 1: Read current auradecantism.js to understand structure**

The file exports an object with `components` array containing CSS strings.

- [ ] **Step 2: Add CSS custom properties for intensity control**

Add to the `overrides.dark` section in auradecantism.js:

```javascript
// In overrides.dark object, add:
'--d-glow-radius': '30px',
'--d-glow-intensity': '0.3',
'--d-gradient-hint-opacity': '0.08',
'--d-chrome-bg': 'linear-gradient(145deg, #1a1a2e 0%, #0d0d14 100%)',
```

- [ ] **Step 3: Add decorator CSS classes to components array**

Add to the `components` array:

```javascript
// Visual effects decorators
// d-glow-primary — accent glow effect
'.d-glow-primary{box-shadow:0 0 var(--d-glow-radius,30px) rgba(254,68,116,calc(var(--d-glow-intensity,0.3))),0 0 calc(var(--d-glow-radius,30px)*2) rgba(254,68,116,calc(var(--d-glow-intensity,0.3)/2)),inset 0 1px 0 rgba(255,255,255,0.08);border:1px solid rgba(254,68,116,0.4)}',
'.d-glow-primary:hover{box-shadow:0 0 calc(var(--d-glow-radius,30px)*1.3) rgba(254,68,116,calc(var(--d-glow-intensity,0.3)*1.3)),0 0 calc(var(--d-glow-radius,30px)*2.5) rgba(254,68,116,calc(var(--d-glow-intensity,0.3)/1.5)),inset 0 1px 0 rgba(255,255,255,0.1)}',

// d-glow-accent — secondary glow using accent color
'.d-glow-accent{box-shadow:0 0 var(--d-glow-radius,30px) rgba(10,243,235,calc(var(--d-glow-intensity,0.3))),inset 0 1px 0 rgba(255,255,255,0.08);border:1px solid rgba(10,243,235,0.4)}',

// d-stat-glow — text glow for large numbers
'.d-stat-glow{text-shadow:0 0 var(--d-glow-radius,30px) rgba(254,68,116,0.4)}',

// d-gradient-hint-primary — subtle gradient background
'.d-gradient-hint-primary{background:linear-gradient(135deg,rgba(254,68,116,var(--d-gradient-hint-opacity,0.08)) 0%,transparent 50%)}',

// d-gradient-hint-accent — gradient toward accent
'.d-gradient-hint-accent{background:linear-gradient(135deg,rgba(10,243,235,var(--d-gradient-hint-opacity,0.08)) 0%,transparent 50%)}',

// d-terminal-chrome — macOS-style terminal window
'.d-terminal-chrome{background:var(--d-chrome-bg,linear-gradient(145deg,#1a1a2e,#0d0d14));border-radius:var(--d-radius-panel);border:1px solid rgba(255,255,255,0.1);box-shadow:0 0 40px rgba(10,243,235,0.08),inset 0 1px 0 rgba(255,255,255,0.05);overflow:hidden}',
'.d-terminal-chrome-header{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05)}',
'.d-terminal-chrome-dot{width:12px;height:12px;border-radius:50%}',
'.d-terminal-chrome-dot-red{background:#ff5f57}',
'.d-terminal-chrome-dot-yellow{background:#febc2e}',
'.d-terminal-chrome-dot-green{background:#28c840}',
'.d-terminal-chrome-title{margin-left:auto;font-size:11px;color:rgba(255,255,255,0.4);font-family:var(--d-font-mono)}',
'.d-terminal-chrome-body{padding:16px;font-family:var(--d-font-mono);font-size:12px;line-height:1.8}',

// d-icon-glow — glowing icon container
'.d-icon-glow{background:linear-gradient(135deg,rgba(254,68,116,0.15) 0%,rgba(254,68,116,0.05) 100%);box-shadow:0 0 20px rgba(254,68,116,0.1);border-radius:var(--d-radius-md);display:flex;align-items:center;justify-content:center}',
```

- [ ] **Step 4: Verify no syntax errors**

Run: `node -c src/css/styles/auradecantism.js`
Expected: No syntax errors

- [ ] **Step 5: Commit**

```bash
git add src/css/styles/auradecantism.js
git commit -m "feat(css): add visual effects decorators to auradecantism

Add d-glow-primary, d-glow-accent, d-stat-glow, d-gradient-hint-*,
d-terminal-chrome, d-icon-glow decorators with CSS custom property
intensity control."
```

---

### Task 2: Add visual_effects Config to Auradecantism Recipe

**Files:**
- Modify: `src/registry/recipe-auradecantism.json`

- [ ] **Step 1: Add visual_effects section to recipe JSON**

Add after the `animation` section:

```json
"visual_effects": {
  "enabled": true,
  "intensity": "medium",
  "type_mapping": {
    "code_preview": ["d-terminal-chrome"],
    "stat_display": ["d-glow-primary", "d-stat-glow"],
    "feature_card": ["d-glass", "d-gradient-hint-primary"],
    "icon_container": ["d-icon-glow"]
  },
  "component_fallback": {
    "pre": "code_preview",
    "code": "code_preview",
    "Statistic": "stat_display",
    "Card": "feature_card"
  },
  "intensity_values": {
    "subtle": {
      "--d-glow-radius": "15px",
      "--d-glow-intensity": "0.15",
      "--d-gradient-hint-opacity": "0.04"
    },
    "medium": {
      "--d-glow-radius": "30px",
      "--d-glow-intensity": "0.3",
      "--d-gradient-hint-opacity": "0.08"
    },
    "strong": {
      "--d-glow-radius": "50px",
      "--d-glow-intensity": "0.5",
      "--d-gradient-hint-opacity": "0.12"
    }
  }
},
```

- [ ] **Step 2: Update decorators section with new entries**

Add to existing `decorators` object:

```json
"d-glow-primary": "Box-shadow glow using primary color. Apply to stats, featured cards.",
"d-glow-accent": "Box-shadow glow using accent color. For secondary highlights.",
"d-stat-glow": "Text-shadow glow for large numbers and metrics.",
"d-gradient-hint-primary": "Subtle gradient background toward primary color.",
"d-gradient-hint-accent": "Subtle gradient background toward accent color.",
"d-terminal-chrome": "macOS-style terminal window with traffic light dots and gradient background.",
"d-icon-glow": "Glowing icon container with gradient background."
```

- [ ] **Step 3: Validate JSON syntax**

Run: `node -e "require('./src/registry/recipe-auradecantism.json')"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/registry/recipe-auradecantism.json
git commit -m "feat(recipe): add visual_effects config to auradecantism

Add type_mapping for code_preview, stat_display, feature_card, icon_container.
Add component_fallback for automatic effect detection.
Add intensity_values for subtle/medium/strong presets."
```

---

### Task 3: Create Visual Effects Test File

**Files:**
- Create: `test/visual-effects.test.js`

- [ ] **Step 1: Create test file with basic structure**

```javascript
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const registryRoot = join(__dirname, '..', 'src', 'registry');

async function loadJSON(path) {
  return JSON.parse(await readFile(path, 'utf-8'));
}

describe('Visual Effects System', () => {
  describe('Recipe visual_effects config', () => {
    it('auradecantism has visual_effects enabled', async () => {
      const recipe = await loadJSON(join(registryRoot, 'recipe-auradecantism.json'));
      assert.ok(recipe.visual_effects, 'visual_effects should exist');
      assert.equal(recipe.visual_effects.enabled, true);
    });

    it('auradecantism has type_mapping for all effect types', async () => {
      const recipe = await loadJSON(join(registryRoot, 'recipe-auradecantism.json'));
      const { type_mapping } = recipe.visual_effects;
      assert.ok(type_mapping.code_preview, 'should have code_preview mapping');
      assert.ok(type_mapping.stat_display, 'should have stat_display mapping');
      assert.ok(type_mapping.feature_card, 'should have feature_card mapping');
      assert.ok(type_mapping.icon_container, 'should have icon_container mapping');
    });

    it('auradecantism has component_fallback mapping', async () => {
      const recipe = await loadJSON(join(registryRoot, 'recipe-auradecantism.json'));
      const { component_fallback } = recipe.visual_effects;
      assert.equal(component_fallback.pre, 'code_preview');
      assert.equal(component_fallback.Statistic, 'stat_display');
    });

    it('auradecantism has intensity_values for all presets', async () => {
      const recipe = await loadJSON(join(registryRoot, 'recipe-auradecantism.json'));
      const { intensity_values } = recipe.visual_effects;
      assert.ok(intensity_values.subtle, 'should have subtle preset');
      assert.ok(intensity_values.medium, 'should have medium preset');
      assert.ok(intensity_values.strong, 'should have strong preset');
    });
  });

  describe('Decorator CSS', () => {
    it('auradecantism style exports d-glow-primary class', async () => {
      const { auradecantism } = await import('../src/css/styles/auradecantism.js');
      const hasGlowPrimary = auradecantism.components.some(c => c.includes('.d-glow-primary'));
      assert.ok(hasGlowPrimary, 'd-glow-primary should be defined');
    });

    it('auradecantism style exports d-terminal-chrome class', async () => {
      const { auradecantism } = await import('../src/css/styles/auradecantism.js');
      const hasTerminal = auradecantism.components.some(c => c.includes('.d-terminal-chrome'));
      assert.ok(hasTerminal, 'd-terminal-chrome should be defined');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `node --test test/visual-effects.test.js`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add test/visual-effects.test.js
git commit -m "test: add visual effects system tests

Test recipe visual_effects config and decorator CSS presence."
```

---

### Task 4: Add resolveVisualEffects to Generator

**Files:**
- Modify: `tools/generate.js`

- [ ] **Step 1: Add resolveVisualEffects function**

Add after the `resolvePatternRef` function (around line 100):

```javascript
/**
 * Resolve visual effects for a pattern based on recipe config.
 * Returns array of decorator class names to apply.
 *
 * @param {object} recipe - Recipe JSON with visual_effects config
 * @param {object} pattern - Pattern JSON (may have effect_types)
 * @param {string} slot - Optional slot name for targeted effects
 * @returns {string[]} Array of decorator class names
 */
function resolveVisualEffects(recipe, pattern, slot = null) {
  const ve = recipe.visual_effects;
  if (!ve || !ve.enabled) return [];

  const { type_mapping, component_fallback } = ve;
  const decorators = [];

  // Check explicit effect_types on pattern first
  if (pattern.effect_types) {
    const effectType = slot ? pattern.effect_types[slot] : Object.values(pattern.effect_types)[0];
    if (effectType && type_mapping[effectType]) {
      decorators.push(...type_mapping[effectType]);
    }
    return decorators;
  }

  // Fallback: detect components in pattern code
  if (component_fallback && pattern.code?.example) {
    const code = pattern.code.example;
    for (const [component, effectType] of Object.entries(component_fallback)) {
      if (code.includes(component) && type_mapping[effectType]) {
        decorators.push(...type_mapping[effectType]);
        break; // Only apply first match to avoid over-decoration
      }
    }
  }

  return [...new Set(decorators)]; // Dedupe
}

/**
 * Get intensity CSS custom properties based on recipe config.
 * @param {object} recipe - Recipe JSON with visual_effects config
 * @returns {object} CSS custom property values
 */
function getIntensityValues(recipe) {
  const ve = recipe.visual_effects;
  if (!ve || !ve.enabled) return {};

  const intensity = ve.intensity || 'medium';
  return ve.intensity_values?.[intensity] || {};
}
```

- [ ] **Step 2: Export the functions for testing**

At the end of the file, update exports:

```javascript
export { resolveVisualEffects, getIntensityValues };
```

- [ ] **Step 3: Add tests for resolveVisualEffects**

Add to `test/visual-effects.test.js`:

```javascript
describe('resolveVisualEffects function', () => {
  it('returns empty array when visual_effects disabled', async () => {
    const { resolveVisualEffects } = await import('../tools/generate.js');
    const recipe = { visual_effects: { enabled: false } };
    const pattern = {};
    const result = resolveVisualEffects(recipe, pattern);
    assert.deepEqual(result, []);
  });

  it('returns decorators for explicit effect_types', async () => {
    const { resolveVisualEffects } = await import('../tools/generate.js');
    const recipe = {
      visual_effects: {
        enabled: true,
        type_mapping: { code_preview: ['d-terminal-chrome'] }
      }
    };
    const pattern = { effect_types: { terminal: 'code_preview' } };
    const result = resolveVisualEffects(recipe, pattern, 'terminal');
    assert.deepEqual(result, ['d-terminal-chrome']);
  });

  it('falls back to component detection', async () => {
    const { resolveVisualEffects } = await import('../tools/generate.js');
    const recipe = {
      visual_effects: {
        enabled: true,
        type_mapping: { code_preview: ['d-terminal-chrome'] },
        component_fallback: { pre: 'code_preview' }
      }
    };
    const pattern = { code: { example: 'pre({ class: css(...) }, ...)' } };
    const result = resolveVisualEffects(recipe, pattern);
    assert.deepEqual(result, ['d-terminal-chrome']);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `node --test test/visual-effects.test.js`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add tools/generate.js test/visual-effects.test.js
git commit -m "feat(generator): add resolveVisualEffects function

Resolves effect types from pattern or component detection,
maps to decorator classes via recipe config."
```

---

### Task 5: Create Clean Style File and Add Visual Effects

**Files:**
- Create: `src/css/styles/clean.js`
- Modify: `src/registry/recipe-clean.json`

- [ ] **Step 1: Create clean.js style file**

Create new file `src/css/styles/clean.js` with full structure:

```javascript
/**
 * Clean — Professional, understated design style.
 * Subtle shadows, rounded corners, thin borders, smooth motion.
 * No gradients, no glass, no glow. Closest to shadcn/Tailwind aesthetic.
 */
export const clean = {
  id: 'clean',
  name: 'Clean',
  seed: {
    primary: '#3b82f6',
    accent: '#10b981',
    tertiary: '#8b5cf6',
    neutral: '#6b7280',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    bg: '#ffffff',
    bgDark: '#111827',
  },
  personality: {
    radius: 'rounded',
    elevation: 'shadow',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'none',
  },
  typography: {
    '--d-fw-heading': '600',
    '--d-fw-title': '500',
    '--d-ls-heading': '-0.01em',
  },
  overrides: {
    light: {
      '--d-glow-radius': '8px',
      '--d-glow-intensity': '0.08',
      '--d-gradient-hint-opacity': '0.03',
    },
    dark: {
      '--d-glow-radius': '12px',
      '--d-glow-intensity': '0.12',
      '--d-gradient-hint-opacity': '0.05',
    },
  },
  components: [
    // Visual effects decorators (subtle for clean style)
    '.d-glow-primary{box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid rgba(0,0,0,0.1)}',
    '.d-glow-primary:hover{box-shadow:0 4px 12px rgba(0,0,0,0.12)}',
    '.d-glow-accent{box-shadow:0 2px 8px rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2)}',
    '.d-stat-glow{font-weight:700}',
    '.d-gradient-hint-primary{background:linear-gradient(135deg,rgba(59,130,246,0.03) 0%,transparent 50%)}',
    '.d-gradient-hint-accent{background:linear-gradient(135deg,rgba(16,185,129,0.03) 0%,transparent 50%)}',
    '.d-terminal-chrome{background:#fafafa;border-radius:8px;border:1px solid #e5e5e5;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden}',
    '.d-terminal-chrome-header{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid #e5e5e5;background:#f5f5f5}',
    '.d-terminal-chrome-dot{width:12px;height:12px;border-radius:50%}',
    '.d-terminal-chrome-dot-red{background:#ff5f57}',
    '.d-terminal-chrome-dot-yellow{background:#febc2e}',
    '.d-terminal-chrome-dot-green{background:#28c840}',
    '.d-terminal-chrome-title{margin-left:auto;font-size:11px;color:#6b7280;font-family:var(--d-font-mono)}',
    '.d-terminal-chrome-body{padding:16px;font-family:var(--d-font-mono);font-size:12px;line-height:1.8;background:#fafafa}',
    '.d-icon-glow{background:rgba(59,130,246,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center}',
  ],
};
```

- [ ] **Step 2: Add visual_effects to recipe-clean.json**

```json
"visual_effects": {
  "enabled": true,
  "intensity": "subtle",
  "type_mapping": {
    "code_preview": ["d-terminal-chrome"],
    "stat_display": ["d-stat-glow"],
    "feature_card": ["d-glass"],
    "icon_container": ["d-icon-glow"]
  },
  "component_fallback": {
    "pre": "code_preview",
    "code": "code_preview",
    "Statistic": "stat_display",
    "Card": "feature_card"
  },
  "intensity_values": {
    "subtle": {
      "--d-glow-radius": "8px",
      "--d-glow-intensity": "0.08",
      "--d-gradient-hint-opacity": "0.03"
    },
    "medium": {
      "--d-glow-radius": "12px",
      "--d-glow-intensity": "0.12",
      "--d-gradient-hint-opacity": "0.05"
    },
    "strong": {
      "--d-glow-radius": "16px",
      "--d-glow-intensity": "0.18",
      "--d-gradient-hint-opacity": "0.08"
    }
  }
}
```

- [ ] **Step 3: Add test for clean recipe**

```javascript
it('clean has visual_effects with subtle intensity', async () => {
  const recipe = await loadJSON(join(registryRoot, 'recipe-clean.json'));
  assert.ok(recipe.visual_effects);
  assert.equal(recipe.visual_effects.intensity, 'subtle');
});
```

- [ ] **Step 4: Run tests**

Run: `node --test test/visual-effects.test.js`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/css/styles/clean.js src/registry/recipe-clean.json test/visual-effects.test.js
git commit -m "feat(recipe): add visual_effects to clean recipe

Subtle intensity with minimal shadows, no strong glows."
```

---

### Task 6: Create Gaming-Guild Style File and Add Visual Effects

**Files:**
- Create: `src/css/styles/gaming-guild.js`
- Modify: `src/registry/recipe-gaming-guild.json`

- [ ] **Step 1: Create gaming-guild.js style file**

Create new file `src/css/styles/gaming-guild.js`:

```javascript
/**
 * Gaming Guild — Bold, high-energy design style.
 * Intense neon glows, dark backgrounds, sharp contrasts.
 * For gaming, esports, and high-energy applications.
 */
export const gamingGuild = {
  id: 'gaming-guild',
  name: 'Gaming Guild',
  seed: {
    primary: '#8b5cf6',
    accent: '#22d3ee',
    tertiary: '#f43f5e',
    neutral: '#71717a',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#22d3ee',
    bg: '#f8fafc',
    bgDark: '#0f0f1a',
  },
  personality: {
    radius: 'rounded',
    elevation: 'glow',
    motion: 'bouncy',
    borders: 'medium',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '800',
    '--d-fw-title': '700',
    '--d-ls-heading': '-0.02em',
  },
  overrides: {
    light: {},
    dark: {
      '--d-glow-radius': '40px',
      '--d-glow-intensity': '0.4',
      '--d-gradient-hint-opacity': '0.1',
    },
  },
  components: [
    // Visual effects decorators (intense for gaming style)
    '.d-glow-primary{box-shadow:0 0 var(--d-glow-radius,40px) rgba(139,92,246,var(--d-glow-intensity,0.4)),0 0 calc(var(--d-glow-radius,40px)*2) rgba(139,92,246,calc(var(--d-glow-intensity,0.4)/2));border:1px solid rgba(139,92,246,0.6)}',
    '.d-glow-primary:hover{box-shadow:0 0 calc(var(--d-glow-radius,40px)*1.5) rgba(139,92,246,calc(var(--d-glow-intensity,0.4)*1.5)),0 0 calc(var(--d-glow-radius,40px)*3) rgba(139,92,246,calc(var(--d-glow-intensity,0.4)/1.5))}',
    '.d-glow-accent{box-shadow:0 0 var(--d-glow-radius,40px) rgba(34,211,238,var(--d-glow-intensity,0.4));border:1px solid rgba(34,211,238,0.6)}',
    '.d-stat-glow{text-shadow:0 0 30px rgba(139,92,246,0.6)}',
    '.d-gradient-hint-primary{background:linear-gradient(135deg,rgba(139,92,246,var(--d-gradient-hint-opacity,0.1)) 0%,transparent 50%)}',
    '.d-gradient-hint-accent{background:linear-gradient(135deg,rgba(34,211,238,var(--d-gradient-hint-opacity,0.1)) 0%,transparent 50%)}',
    '.d-terminal-chrome{background:linear-gradient(145deg,#1a1a2e 0%,#0f0f1a 100%);border-radius:var(--d-radius-panel);border:1px solid rgba(139,92,246,0.3);box-shadow:0 0 30px rgba(139,92,246,0.15);overflow:hidden}',
    '.d-terminal-chrome-header{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(139,92,246,0.2)}',
    '.d-terminal-chrome-dot{width:12px;height:12px;border-radius:50%}',
    '.d-terminal-chrome-dot-red{background:#ff5f57}',
    '.d-terminal-chrome-dot-yellow{background:#febc2e}',
    '.d-terminal-chrome-dot-green{background:#28c840}',
    '.d-terminal-chrome-title{margin-left:auto;font-size:11px;color:rgba(139,92,246,0.6);font-family:var(--d-font-mono)}',
    '.d-terminal-chrome-body{padding:16px;font-family:var(--d-font-mono);font-size:12px;line-height:1.8}',
    '.d-icon-glow{background:linear-gradient(135deg,rgba(139,92,246,0.2) 0%,rgba(139,92,246,0.05) 100%);box-shadow:0 0 20px rgba(139,92,246,0.15);border-radius:var(--d-radius-md);display:flex;align-items:center;justify-content:center}',
  ],
};
```

- [ ] **Step 2: Add visual_effects to recipe-gaming-guild.json**

```json
"visual_effects": {
  "enabled": true,
  "intensity": "strong",
  "type_mapping": {
    "code_preview": ["d-terminal-chrome", "d-glow-accent"],
    "stat_display": ["d-glow-primary", "d-stat-glow"],
    "feature_card": ["d-glass", "d-glow-primary"],
    "icon_container": ["d-icon-glow", "d-glow-accent"]
  },
  "component_fallback": {
    "pre": "code_preview",
    "Statistic": "stat_display",
    "Card": "feature_card"
  },
  "intensity_values": {
    "subtle": { "--d-glow-radius": "20px", "--d-glow-intensity": "0.2" },
    "medium": { "--d-glow-radius": "35px", "--d-glow-intensity": "0.35" },
    "strong": { "--d-glow-radius": "50px", "--d-glow-intensity": "0.5" }
  }
}
```

- [ ] **Step 3: Add test**

```javascript
it('gaming-guild has visual_effects with strong intensity', async () => {
  const recipe = await loadJSON(join(registryRoot, 'recipe-gaming-guild.json'));
  assert.ok(recipe.visual_effects);
  assert.equal(recipe.visual_effects.intensity, 'strong');
});
```

- [ ] **Step 4: Run tests and commit**

```bash
git add src/registry/recipe-gaming-guild.json test/visual-effects.test.js
git commit -m "feat(recipe): add visual_effects to gaming-guild

Strong intensity with intense neon glows."
```

---

### Task 7: Create Launchpad Style File and Add Visual Effects

**Files:**
- Create: `src/css/styles/launchpad.js`
- Modify: `src/registry/recipe-launchpad.json`

- [ ] **Step 1: Create launchpad.js style file**

Create new file `src/css/styles/launchpad.js`:

```javascript
/**
 * Launchpad — Modern startup/product design style.
 * Clean with subtle accents, balanced glows, product-focused.
 * For SaaS, product pages, and startup applications.
 */
export const launchpad = {
  id: 'launchpad',
  name: 'Launchpad',
  seed: {
    primary: '#6366f1',
    accent: '#06b6d4',
    tertiary: '#ec4899',
    neutral: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    bg: '#ffffff',
    bgDark: '#0f172a',
  },
  personality: {
    radius: 'rounded',
    elevation: 'subtle-glow',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'subtle',
  },
  typography: {
    '--d-fw-heading': '700',
    '--d-fw-title': '600',
    '--d-ls-heading': '-0.02em',
  },
  overrides: {
    light: {
      '--d-glow-radius': '20px',
      '--d-glow-intensity': '0.15',
      '--d-gradient-hint-opacity': '0.05',
    },
    dark: {
      '--d-glow-radius': '25px',
      '--d-glow-intensity': '0.25',
      '--d-gradient-hint-opacity': '0.08',
    },
  },
  components: [
    // Visual effects decorators (balanced for launchpad style)
    '.d-glow-primary{box-shadow:0 0 var(--d-glow-radius,25px) rgba(99,102,241,var(--d-glow-intensity,0.25)),inset 0 1px 0 rgba(255,255,255,0.06);border:1px solid rgba(99,102,241,0.3)}',
    '.d-glow-primary:hover{box-shadow:0 0 calc(var(--d-glow-radius,25px)*1.3) rgba(99,102,241,calc(var(--d-glow-intensity,0.25)*1.3))}',
    '.d-glow-accent{box-shadow:0 0 var(--d-glow-radius,25px) rgba(6,182,212,var(--d-glow-intensity,0.25));border:1px solid rgba(6,182,212,0.3)}',
    '.d-stat-glow{text-shadow:0 0 20px rgba(99,102,241,0.3)}',
    '.d-gradient-hint-primary{background:linear-gradient(135deg,rgba(99,102,241,var(--d-gradient-hint-opacity,0.08)) 0%,transparent 50%)}',
    '.d-gradient-hint-accent{background:linear-gradient(135deg,rgba(6,182,212,var(--d-gradient-hint-opacity,0.08)) 0%,transparent 50%)}',
    '.d-terminal-chrome{background:linear-gradient(145deg,#1e1e2e 0%,#0f172a 100%);border-radius:var(--d-radius-panel);border:1px solid rgba(99,102,241,0.2);box-shadow:0 0 30px rgba(6,182,212,0.08);overflow:hidden}',
    '.d-terminal-chrome-header{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05)}',
    '.d-terminal-chrome-dot{width:12px;height:12px;border-radius:50%}',
    '.d-terminal-chrome-dot-red{background:#ff5f57}',
    '.d-terminal-chrome-dot-yellow{background:#febc2e}',
    '.d-terminal-chrome-dot-green{background:#28c840}',
    '.d-terminal-chrome-title{margin-left:auto;font-size:11px;color:rgba(255,255,255,0.4);font-family:var(--d-font-mono)}',
    '.d-terminal-chrome-body{padding:16px;font-family:var(--d-font-mono);font-size:12px;line-height:1.8}',
    '.d-icon-glow{background:linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(99,102,241,0.04) 100%);box-shadow:0 0 15px rgba(99,102,241,0.08);border-radius:var(--d-radius-md);display:flex;align-items:center;justify-content:center}',
  ],
};
```

- [ ] **Step 2: Add visual_effects config to recipe-launchpad.json**

```json
"visual_effects": {
  "enabled": true,
  "intensity": "medium",
  "type_mapping": {
    "code_preview": ["d-terminal-chrome"],
    "stat_display": ["d-glow-accent", "d-stat-glow"],
    "feature_card": ["d-glass", "d-gradient-hint-accent"],
    "icon_container": ["d-icon-glow"]
  },
  "component_fallback": {
    "pre": "code_preview",
    "Statistic": "stat_display",
    "Card": "feature_card"
  },
  "intensity_values": {
    "subtle": { "--d-glow-radius": "15px", "--d-glow-intensity": "0.15", "--d-gradient-hint-opacity": "0.04" },
    "medium": { "--d-glow-radius": "25px", "--d-glow-intensity": "0.25", "--d-gradient-hint-opacity": "0.08" },
    "strong": { "--d-glow-radius": "40px", "--d-glow-intensity": "0.4", "--d-gradient-hint-opacity": "0.12" }
  }
}
```

- [ ] **Step 3: Add test and commit**

```javascript
it('launchpad has visual_effects with medium intensity', async () => {
  const recipe = await loadJSON(join(registryRoot, 'recipe-launchpad.json'));
  assert.ok(recipe.visual_effects);
  assert.equal(recipe.visual_effects.intensity, 'medium');
});
```

```bash
git add src/css/styles/launchpad.js src/registry/recipe-launchpad.json test/visual-effects.test.js
git commit -m "feat(recipe): add visual_effects to launchpad

Medium intensity focused on product presentation."
```

---

### Task 8: Add get_visual_effects MCP Tool

**Files:**
- Modify: `registry-server/mcp-server.js`

- [ ] **Step 1: Add tool definition**

Add to the `TOOLS` array (around line 30):

```javascript
{
  name: 'get_visual_effects',
  description: 'Get visual effects configuration for a recipe, including type mappings, decorators, and intensity values.',
  inputSchema: {
    type: 'object',
    properties: {
      recipe: {
        type: 'string',
        description: 'Recipe ID (e.g., "auradecantism", "clean")'
      }
    },
    required: ['recipe']
  }
}
```

- [ ] **Step 2: Add tool handler**

Add to the switch/case in the request handler. Note: MCP server uses `readFileSync`, not async:

```javascript
case 'get_visual_effects': {
  const { recipe: recipeId } = args;
  const recipePath = join(REGISTRY_PATH, `recipe-${recipeId}.json`);

  try {
    if (!existsSync(recipePath)) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: `Recipe not found: ${recipeId}` }) }] };
    }

    const recipe = JSON.parse(readFileSync(recipePath, 'utf-8'));
    const { visual_effects, decorators } = recipe;

    if (!visual_effects) {
      return { content: [{ type: 'text', text: JSON.stringify({ error: 'No visual_effects config found' }) }] };
    }

    const intensity = visual_effects.intensity || 'medium';
    const intensity_values = visual_effects.intensity_values?.[intensity] || {};

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          recipe: recipeId,
          visual_effects,
          decorators: decorators || {},
          intensity_values
        }, null, 2)
      }]
    };
  } catch (err) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: `Error reading recipe: ${err.message}` }) }] };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add registry-server/mcp-server.js
git commit -m "feat(mcp): add get_visual_effects tool

Exposes visual_effects config for AI assistants to query
when scaffolding code."
```

---

### Task 9: Add effect_types to Bento-Features Pattern

**Files:**
- Modify: `src/registry/patterns/bento-features.json`

- [ ] **Step 1: Add effect_types field**

Add to the pattern JSON:

```json
"effect_types": {
  "terminal": "code_preview",
  "stats": "stat_display",
  "features": "icon_container"
}
```

- [ ] **Step 2: Add test**

```javascript
it('bento-features pattern has effect_types', async () => {
  const pattern = await loadJSON(join(registryRoot, 'patterns', 'bento-features.json'));
  assert.ok(pattern.effect_types);
  assert.equal(pattern.effect_types.terminal, 'code_preview');
  assert.equal(pattern.effect_types.stats, 'stat_display');
});
```

- [ ] **Step 3: Run tests and commit**

```bash
git add src/registry/patterns/bento-features.json test/visual-effects.test.js
git commit -m "feat(pattern): add effect_types to bento-features

Explicit effect type declarations for terminal, stats, features slots."
```

---

### Task 10: Run Full Test Suite and Final Verification

**Files:**
- All modified files

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: Verify decorators render correctly**

Start docs dev server and verify bento-features section:
```bash
cd docs && npm run dev
```

Check http://localhost:3001/ and verify:
- Terminal has chrome styling
- Stats have glow effects
- Feature icons have gradient backgrounds

- [ ] **Step 3: Final commit with summary**

```bash
git add -A
git commit -m "feat: complete visual effects system implementation

- Decorator CSS in all 4 recipes (auradecantism, clean, gaming-guild, launchpad)
- visual_effects config with type_mapping and component_fallback
- Generator resolveVisualEffects() function
- MCP get_visual_effects tool
- Pattern effect_types for explicit control
- Full test coverage"
```

---

## Success Criteria

- [ ] All 4 recipes have visual_effects config
- [ ] Decorator CSS renders correctly per recipe
- [ ] Generator applies decorators automatically
- [ ] MCP tool returns correct config
- [ ] Tests pass
- [ ] Docs site bento-features section matches hand-crafted version
