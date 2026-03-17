/**
 * Decantr Plugin System
 *
 * Allows users to extend Decantr without forking. Plugins can register
 * styles, patterns, recipes, and hook into build/dev/generate lifecycle.
 *
 * Plugin format in decantr.config.json:
 *   "plugins": [
 *     "@acme/decantr-plugin-auth",
 *     ["./plugins/custom-style.js", { "theme": "corporate" }]
 *   ]
 *
 * Each plugin exports a default function:
 *   export default function(api, options) { ... }
 *
 * Zero third-party dependencies (the Decantr Way).
 */

import { resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';

// ============================================================
// Internal state
// ============================================================

/** @type {Array<{ name: string, hooks: Map<string, Function[]> }>} */
const loadedPlugins = [];

/** Registry extensions contributed by plugins */
const extensions = {
  /** @type {Map<string, object>} */
  styles: new Map(),
  /** @type {Map<string, object>} */
  patterns: new Map(),
  /** @type {Map<string, object>} */
  recipes: new Map(),
};

/** Valid hook names — kept small and explicit */
const VALID_HOOKS = new Set([
  'onBuild',
  'onDev',
  'onGenerate',
  'registerStyle',
  'registerPattern',
  'registerRecipe',
]);

// ============================================================
// Plugin API (passed to each plugin function)
// ============================================================

/**
 * Creates a sandboxed API object for a single plugin.
 * @param {string} pluginName
 * @param {Map<string, Function[]>} hooks
 * @returns {object}
 */
function createPluginAPI(pluginName, hooks) {
  return {
    /**
     * Register a lifecycle hook.
     * @param {'onBuild'|'onDev'|'onGenerate'} hookName
     * @param {Function} fn
     */
    onBuild(fn) {
      if (typeof fn !== 'function') throw new Error(`[decantr:plugin:${pluginName}] onBuild handler must be a function`);
      if (!hooks.has('onBuild')) hooks.set('onBuild', []);
      hooks.get('onBuild').push(fn);
    },

    onDev(fn) {
      if (typeof fn !== 'function') throw new Error(`[decantr:plugin:${pluginName}] onDev handler must be a function`);
      if (!hooks.has('onDev')) hooks.set('onDev', []);
      hooks.get('onDev').push(fn);
    },

    onGenerate(fn) {
      if (typeof fn !== 'function') throw new Error(`[decantr:plugin:${pluginName}] onGenerate handler must be a function`);
      if (!hooks.has('onGenerate')) hooks.set('onGenerate', []);
      hooks.get('onGenerate').push(fn);
    },

    /**
     * Register a custom style (theme).
     * @param {string} id   - Style identifier (e.g. "corporate")
     * @param {object} def  - Style definition: { name, seed, personality?, overrides? }
     */
    registerStyle(id, def) {
      if (!id || typeof id !== 'string') throw new Error(`[decantr:plugin:${pluginName}] registerStyle requires a string id`);
      if (!def || typeof def !== 'object') throw new Error(`[decantr:plugin:${pluginName}] registerStyle requires a definition object`);
      if (!def.name) def.name = id;
      if (!def.seed) throw new Error(`[decantr:plugin:${pluginName}] Style "${id}" must have seed colors`);
      const style = { id, ...def };
      extensions.styles.set(id, style);

      // Also register via the hook mechanism so runHook('registerStyle') can propagate
      if (!hooks.has('registerStyle')) hooks.set('registerStyle', []);
      hooks.get('registerStyle').push(() => style);
    },

    /**
     * Register a custom pattern.
     * @param {string} id   - Pattern identifier (e.g. "ticket-board")
     * @param {object} def  - Pattern definition: { name, description?, blend?, atoms? }
     */
    registerPattern(id, def) {
      if (!id || typeof id !== 'string') throw new Error(`[decantr:plugin:${pluginName}] registerPattern requires a string id`);
      if (!def || typeof def !== 'object') throw new Error(`[decantr:plugin:${pluginName}] registerPattern requires a definition object`);
      if (!def.name) def.name = id;
      extensions.patterns.set(id, { id, ...def });

      if (!hooks.has('registerPattern')) hooks.set('registerPattern', []);
      hooks.get('registerPattern').push(() => ({ id, ...def }));
    },

    /**
     * Register a custom recipe (visual language overlay).
     * @param {string} id   - Recipe identifier (e.g. "brutalist")
     * @param {object} def  - Recipe definition: { name, style, mode?, description?, decorators?, compositions? }
     */
    registerRecipe(id, def) {
      if (!id || typeof id !== 'string') throw new Error(`[decantr:plugin:${pluginName}] registerRecipe requires a string id`);
      if (!def || typeof def !== 'object') throw new Error(`[decantr:plugin:${pluginName}] registerRecipe requires a definition object`);
      if (!def.name) def.name = id;
      extensions.recipes.set(id, { id, ...def });

      if (!hooks.has('registerRecipe')) hooks.set('registerRecipe', []);
      hooks.get('registerRecipe').push(() => ({ id, ...def }));
    },
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Load all plugins declared in config.plugins.
 *
 * Each entry is either:
 *   - A string (bare module specifier or relative path)
 *   - A [specifier, options] tuple
 *
 * @param {object} config - The full decantr.config.json object
 * @param {object} [opts]
 * @param {string} [opts.cwd] - Working directory for resolving relative paths
 * @returns {Promise<void>}
 */
export async function loadPlugins(config, opts = {}) {
  const cwd = opts.cwd || process.cwd();
  const entries = config?.plugins;

  if (!entries || !Array.isArray(entries) || entries.length === 0) return;

  for (const entry of entries) {
    let specifier, options;

    if (typeof entry === 'string') {
      specifier = entry;
      options = {};
    } else if (Array.isArray(entry) && entry.length >= 1) {
      specifier = entry[0];
      options = entry[1] || {};
    } else {
      console.warn(`[decantr] Invalid plugin entry — skipping: ${JSON.stringify(entry)}`);
      continue;
    }

    if (typeof specifier !== 'string') {
      console.warn(`[decantr] Plugin specifier must be a string — skipping: ${JSON.stringify(entry)}`);
      continue;
    }

    // Derive a human-readable name
    const pluginName = specifier.startsWith('.') ? specifier : specifier.replace(/^@[^/]+\//, '');

    try {
      // Resolve the module
      let mod;
      if (specifier.startsWith('.') || isAbsolute(specifier)) {
        // Relative or absolute path — resolve against cwd
        const fullPath = resolve(cwd, specifier);
        mod = await import(pathToFileURL(fullPath).href);
      } else {
        // Bare specifier — let Node resolution handle it (node_modules)
        mod = await import(specifier);
      }

      const pluginFn = mod.default || mod;

      if (typeof pluginFn !== 'function') {
        console.warn(`[decantr] Plugin "${pluginName}" does not export a function — skipping`);
        continue;
      }

      // Create isolated hooks map and API for this plugin
      const hooks = new Map();
      const api = createPluginAPI(pluginName, hooks);

      // Execute the plugin setup function
      await pluginFn(api, options);

      loadedPlugins.push({ name: pluginName, hooks });
    } catch (err) {
      console.error(`[decantr] Failed to load plugin "${pluginName}": ${err.message}`);
    }
  }
}

/**
 * Run a named hook across all loaded plugins, in registration order.
 *
 * @param {string} hookName - One of: onBuild, onDev, onGenerate, registerStyle, registerPattern, registerRecipe
 * @param {object} [context] - Hook-specific context object passed to each handler
 * @returns {Promise<any[]>} - Array of results from each hook handler
 */
export async function runHook(hookName, context = {}) {
  if (!VALID_HOOKS.has(hookName)) {
    throw new Error(`[decantr] Unknown plugin hook: "${hookName}". Valid hooks: ${[...VALID_HOOKS].join(', ')}`);
  }

  const results = [];

  for (const plugin of loadedPlugins) {
    const handlers = plugin.hooks.get(hookName);
    if (!handlers) continue;

    for (const handler of handlers) {
      try {
        const result = await handler(context);
        if (result !== undefined) results.push(result);
      } catch (err) {
        console.error(`[decantr] Plugin "${plugin.name}" hook "${hookName}" threw: ${err.message}`);
      }
    }
  }

  return results;
}

/**
 * Get all plugin-registered styles.
 * @returns {Map<string, object>}
 */
export function getPluginStyles() {
  return new Map(extensions.styles);
}

/**
 * Get all plugin-registered patterns.
 * @returns {Map<string, object>}
 */
export function getPluginPatterns() {
  return new Map(extensions.patterns);
}

/**
 * Get all plugin-registered recipes.
 * @returns {Map<string, object>}
 */
export function getPluginRecipes() {
  return new Map(extensions.recipes);
}

/**
 * Get the list of loaded plugin names.
 * @returns {string[]}
 */
export function getLoadedPlugins() {
  return loadedPlugins.map(p => p.name);
}

/**
 * Reset all plugin state. Primarily for testing.
 */
export function resetPlugins() {
  loadedPlugins.length = 0;
  extensions.styles.clear();
  extensions.patterns.clear();
  extensions.recipes.clear();
}
