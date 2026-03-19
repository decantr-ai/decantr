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

    it('clean has visual_effects with subtle intensity', async () => {
      const recipe = await loadJSON(join(registryRoot, 'recipe-clean.json'));
      assert.ok(recipe.visual_effects);
      assert.equal(recipe.visual_effects.intensity, 'subtle');
    });

    it('gaming-guild has visual_effects with strong intensity', async () => {
      const recipe = await loadJSON(join(registryRoot, 'recipe-gaming-guild.json'));
      assert.ok(recipe.visual_effects);
      assert.equal(recipe.visual_effects.intensity, 'strong');
    });

    it('launchpad has visual_effects with medium intensity', async () => {
      const recipe = await loadJSON(join(registryRoot, 'recipe-launchpad.json'));
      assert.ok(recipe.visual_effects);
      assert.equal(recipe.visual_effects.intensity, 'medium');
    });
  });

  describe('Decorator CSS', () => {
    it('auradecantism style exports d-glow-primary class', async () => {
      const { auradecantism } = await import('../src/css/styles/auradecantism.js');
      const hasGlowPrimary = auradecantism.components.includes('.d-glow-primary');
      assert.ok(hasGlowPrimary, 'd-glow-primary should be defined');
    });

    it('auradecantism style exports d-terminal-chrome class', async () => {
      const { auradecantism } = await import('../src/css/styles/auradecantism.js');
      const hasTerminal = auradecantism.components.includes('.d-terminal-chrome');
      assert.ok(hasTerminal, 'd-terminal-chrome should be defined');
    });
  });

  describe('Pattern effect_types', () => {
    it('bento-features pattern has effect_types', async () => {
      const pattern = await loadJSON(join(registryRoot, 'patterns', 'bento-features.json'));
      assert.ok(pattern.effect_types);
      assert.equal(pattern.effect_types.terminal, 'code_preview');
      assert.equal(pattern.effect_types.stats, 'stat_display');
    });
  });

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
});
