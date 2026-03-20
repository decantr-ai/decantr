/**
 * Decantr Compiler - Module Graph IR
 *
 * Central data structure for all transforms.
 * Builds dependency graph from entry point.
 */

import { readFile } from 'node:fs/promises';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize } from './tokenizer.js';
import { parse, getStaticImports, getDynamicImports } from './parser.js';
import { resolvePath, resolveDecantrImport, isDecantrImport, isRelativeImport } from './utils/paths.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkSrc = resolve(__dirname, '..', '..', 'src');

/**
 * @typedef {Object} Dependency
 * @property {string} moduleId
 * @property {'static'|'dynamic'} type
 * @property {string} specifier
 * @property {string[]} [names]
 */

/**
 * @typedef {Object} ModuleNode
 * @property {string} id
 * @property {string} file
 * @property {string} relPath
 * @property {Object} ast
 * @property {Dependency[]} dependencies
 * @property {string[]} dependents
 * @property {Object<string, Object>} resolvedExports
 * @property {Set<string>} usedExports
 * @property {boolean} hoistable
 * @property {boolean} needsAsyncIIFE
 * @property {string} chunk
 * @property {boolean} isFramework
 */

/**
 * Module Graph - Central IR for the compiler
 */
export class ModuleGraph {
  /**
   * @param {string} entry - Entry point file path
   * @param {Object} [options]
   * @param {string} [options.root] - Project root directory
   */
  constructor(entry, options = {}) {
    this.entry = resolve(entry);
    this.root = options.root || dirname(this.entry);

    /** @type {Map<string, ModuleNode>} */
    this.modules = new Map();

    /** @type {Map<string, string>} */
    this.pathToId = new Map();

    /** @type {string} */
    this.entryId = null;

    /** @type {string[]} */
    this.order = [];

    /** @type {Map<string, string[]>} */
    this.chunks = new Map();
    this.chunks.set('main', []);

    /** @type {Error[]} */
    this.errors = [];

    /** @type {Object[]} */
    this.warnings = [];

    this._nextId = 0;
  }

  /**
   * Generate unique module ID
   */
  _genId() {
    return `_m${this._nextId++}`;
  }

  /**
   * Build the module graph from entry point
   */
  async build() {
    const queue = [{ file: this.entry, from: null, type: 'static' }];
    const visited = new Set();

    while (queue.length > 0) {
      const { file, from, type, specifier } = queue.shift();

      if (visited.has(file)) {
        // Already processed, just record dependency
        if (from) {
          const fromMod = this.modules.get(this.pathToId.get(from));
          const toId = this.pathToId.get(file);
          if (fromMod && toId) {
            fromMod.dependencies.push({
              moduleId: toId,
              type,
              specifier: specifier || file
            });

            const toMod = this.modules.get(toId);
            if (toMod && !toMod.dependents.includes(fromMod.id)) {
              toMod.dependents.push(fromMod.id);
            }
          }
        }
        continue;
      }

      visited.add(file);

      try {
        const source = await readFile(file, 'utf-8');
        const tokens = tokenize(source, file);
        const ast = parse(tokens, file);
        ast.rawSource = source;

        const id = this._genId();
        const relPath = relative(this.root, file);
        const isFramework = file.startsWith(frameworkSrc);

        /** @type {ModuleNode} */
        const mod = {
          id,
          file,
          relPath,
          ast,
          dependencies: [],
          dependents: [],
          resolvedExports: {},
          usedExports: new Set(),
          hoistable: !ast.hasTopLevelAwait,
          needsAsyncIIFE: ast.hasTopLevelAwait,
          chunk: 'main',
          isFramework
        };

        // Record dependents from caller
        if (from) {
          const fromMod = this.modules.get(this.pathToId.get(from));
          if (fromMod) {
            mod.dependents.push(fromMod.id);
            fromMod.dependencies.push({
              moduleId: id,
              type,
              specifier: specifier || file
            });
          }
        }

        this.modules.set(id, mod);
        this.pathToId.set(file, id);

        if (!this.entryId) {
          this.entryId = id;
        }

        // Queue static imports
        for (const imp of ast.imports) {
          if (imp.type === 'dynamic') continue;

          const resolved = this._resolveImport(imp.source, file);
          if (resolved) {
            queue.push({
              file: resolved,
              from: file,
              type: 'static',
              specifier: imp.source
            });
          }
        }

        // Queue dynamic imports (for chunk splitting)
        for (const imp of ast.imports) {
          if (imp.type !== 'dynamic') continue;

          const resolved = this._resolveImport(imp.source, file);
          if (resolved) {
            queue.push({
              file: resolved,
              from: file,
              type: 'dynamic',
              specifier: imp.source
            });
          }
        }

      } catch (err) {
        this.errors.push(new Error(`Failed to process ${file}: ${err.message}`));
      }
    }

    // Compute topological order
    this._computeOrder();

    // Assign initial chunks
    this._assignMainChunk();
  }

  /**
   * Resolve import specifier to absolute path
   */
  _resolveImport(specifier, fromFile) {
    try {
      if (isDecantrImport(specifier)) {
        return resolveDecantrImport(specifier, frameworkSrc);
      }

      if (isRelativeImport(specifier)) {
        return resolvePath(specifier, fromFile);
      }

      // Node module - skip for now
      return null;
    } catch (err) {
      this.warnings.push({
        type: 'resolution',
        message: `Could not resolve '${specifier}' from ${fromFile}`,
        file: fromFile,
        specifier
      });
      return null;
    }
  }

  /**
   * Compute topological order for bundling
   */
  _computeOrder() {
    const visited = new Set();
    const order = [];

    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const mod = this.modules.get(id);
      if (!mod) return;

      for (const dep of mod.dependencies) {
        visit(dep.moduleId);
      }

      order.push(id);
    };

    visit(this.entryId);
    this.order = order;
  }

  /**
   * Assign modules to main chunk (static imports only)
   */
  _assignMainChunk() {
    const visited = new Set();

    const visit = (id) => {
      if (visited.has(id)) return;
      visited.add(id);

      const mod = this.modules.get(id);
      if (!mod) return;

      mod.chunk = 'main';
      this.chunks.get('main').push(id);

      // Only follow static dependencies for main chunk
      for (const dep of mod.dependencies) {
        if (dep.type === 'static') {
          visit(dep.moduleId);
        }
      }
    };

    visit(this.entryId);
  }

  /**
   * Clone the graph (for incremental rebuilds)
   */
  clone() {
    const copy = new ModuleGraph(this.entry, { root: this.root });
    copy._nextId = this._nextId;
    copy.entryId = this.entryId;
    copy.order = [...this.order];

    for (const [id, mod] of this.modules) {
      copy.modules.set(id, {
        ...mod,
        dependencies: [...mod.dependencies],
        dependents: [...mod.dependents],
        usedExports: new Set(mod.usedExports)
      });
    }

    for (const [path, id] of this.pathToId) {
      copy.pathToId.set(path, id);
    }

    for (const [name, ids] of this.chunks) {
      copy.chunks.set(name, [...ids]);
    }

    return copy;
  }

  /**
   * Get module by path
   */
  getByPath(filePath) {
    const id = this.pathToId.get(resolve(filePath));
    return id ? this.modules.get(id) : null;
  }

  /**
   * Get all modules in a chunk
   */
  getChunkModules(chunkName) {
    const ids = this.chunks.get(chunkName) || [];
    return ids.map(id => this.modules.get(id)).filter(Boolean);
  }

  /**
   * Get modules in topological order
   */
  getOrderedModules() {
    return this.order.map(id => this.modules.get(id)).filter(Boolean);
  }

  /**
   * Check for circular dependencies
   */
  detectCircularDependencies() {
    const circular = [];
    const visiting = new Set();
    const visited = new Set();

    const visit = (id, path = []) => {
      if (visited.has(id)) return;

      if (visiting.has(id)) {
        const cycleStart = path.indexOf(id);
        circular.push(path.slice(cycleStart).concat(id));
        return;
      }

      visiting.add(id);
      path.push(id);

      const mod = this.modules.get(id);
      if (mod) {
        for (const dep of mod.dependencies) {
          visit(dep.moduleId, [...path]);
        }
      }

      visiting.delete(id);
      visited.add(id);
    };

    visit(this.entryId);
    return circular;
  }

  /**
   * Get framework modules (for separate bundling)
   */
  getFrameworkModules() {
    return Array.from(this.modules.values()).filter(m => m.isFramework);
  }

  /**
   * Get user modules
   */
  getUserModules() {
    return Array.from(this.modules.values()).filter(m => !m.isFramework);
  }
}
