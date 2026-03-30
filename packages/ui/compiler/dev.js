/**
 * Decantr Compiler - Dev Server Integration
 *
 * Reuse compiler phases for development with HMR.
 */

import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { ModuleGraph } from './graph.js';
import { createPipeline } from './pipeline.js';
import { emit } from './emitter.js';

/**
 * @typedef {Object} DevCompilerOptions
 * @property {string} entry
 * @property {string} root
 * @property {Function} [onRebuild]
 */

/**
 * Development compiler with incremental rebuilds
 */
export class DevCompiler {
  /**
   * @param {DevCompilerOptions} options
   */
  constructor(options) {
    this.entry = options.entry;
    this.root = options.root;
    this.onRebuild = options.onRebuild;

    /** @type {ModuleGraph|null} */
    this.graph = null;

    /** @type {Map<string, string>} */
    this.sourceCache = new Map();
  }

  /**
   * Initial full build
   */
  async build() {
    this.graph = new ModuleGraph(this.entry, { root: this.root });
    await this.graph.build();

    // Run dev pipeline (no tree-shaking, no dead code elimination)
    const transforms = createPipeline({ dev: true });
    for (const transform of transforms) {
      transform(this.graph);
    }

    // Cache sources
    for (const mod of this.graph.modules.values()) {
      this.sourceCache.set(mod.file, mod.ast.rawSource);
    }

    // Emit without minification
    return emit(this.graph, { sourceMaps: true, minify: false });
  }

  /**
   * Incremental rebuild for a changed file
   * @param {string} filePath
   * @param {string} newSource
   * @returns {Object} { outputs, affectedModules }
   */
  async rebuild(filePath, newSource) {
    if (!this.graph) {
      // No previous build, do full build
      return { outputs: await this.build(), affectedModules: null };
    }

    const oldSource = this.sourceCache.get(filePath);

    // Quick check - if source unchanged, skip
    if (oldSource === newSource) {
      return { outputs: [], affectedModules: [] };
    }

    // Update cache
    this.sourceCache.set(filePath, newSource);

    // Re-parse the changed module
    const mod = this.graph.getByPath(filePath);

    if (!mod) {
      // New file or not in graph - do full rebuild
      return { outputs: await this.build(), affectedModules: null };
    }

    try {
      const tokens = tokenize(newSource, filePath);
      const ast = parse(tokens, filePath);
      ast.rawSource = newSource;

      // Check if imports changed
      const oldImports = JSON.stringify(mod.ast.imports);
      const newImports = JSON.stringify(ast.imports);

      if (oldImports !== newImports) {
        // Import structure changed - need full rebuild
        return { outputs: await this.build(), affectedModules: null };
      }

      // Update AST
      mod.ast = ast;

      // Find affected modules
      const affected = this.findAffectedModules(mod.id);

      // Re-run transforms
      const transforms = createPipeline({ dev: true });
      for (const transform of transforms) {
        transform(this.graph);
      }

      // Emit
      const outputs = emit(this.graph, { sourceMaps: true, minify: false });

      if (this.onRebuild) {
        this.onRebuild({ filePath, affectedModules: affected });
      }

      return { outputs, affectedModules: affected };

    } catch (err) {
      // Parse error - return error info
      return {
        outputs: [],
        affectedModules: [],
        error: {
          file: filePath,
          message: err.message,
          line: err.line || null
        }
      };
    }
  }

  /**
   * Find all modules affected by a change
   */
  findAffectedModules(moduleId) {
    const affected = new Set([moduleId]);
    const queue = [];

    const mod = this.graph.modules.get(moduleId);
    if (mod) {
      queue.push(...mod.dependents);
    }

    while (queue.length > 0) {
      const id = queue.shift();
      if (affected.has(id)) continue;

      affected.add(id);

      const dep = this.graph.modules.get(id);
      if (dep) {
        queue.push(...dep.dependents);
      }
    }

    return Array.from(affected).map(id => {
      const m = this.graph.modules.get(id);
      return m ? m.relPath : id;
    });
  }

  /**
   * Check if a file is in the module graph
   */
  hasModule(filePath) {
    return this.graph?.pathToId.has(filePath) ?? false;
  }

  /**
   * Get HMR update payload
   */
  getHMRPayload(affectedModules) {
    if (!affectedModules || affectedModules.length === 0) {
      return { type: 'full-reload' };
    }

    // For now, always full reload
    // Future: implement proper HMR with module replacement
    return {
      type: 'full-reload',
      affected: affectedModules
    };
  }

  /**
   * Dispose and clean up
   */
  dispose() {
    this.graph = null;
    this.sourceCache.clear();
  }
}

/**
 * Create a dev compiler instance
 */
export function createDevCompiler(options) {
  return new DevCompiler(options);
}

/**
 * Detect changes between two module graphs
 */
export function detectChanges(oldGraph, newGraph) {
  const changed = [];
  const added = [];
  const removed = [];

  // Check for changed/removed modules
  for (const [id, oldMod] of oldGraph.modules) {
    const newMod = newGraph.modules.get(id);

    if (!newMod) {
      removed.push(oldMod.relPath);
    } else if (oldMod.ast.rawSource !== newMod.ast.rawSource) {
      changed.push(newMod.relPath);
    }
  }

  // Check for added modules
  for (const [id, newMod] of newGraph.modules) {
    if (!oldGraph.modules.has(id)) {
      added.push(newMod.relPath);
    }
  }

  return { changed, added, removed };
}
