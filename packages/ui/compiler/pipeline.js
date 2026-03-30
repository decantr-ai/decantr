/**
 * Decantr Compiler - Transform Pipeline
 *
 * Orchestrates transform execution in the correct order.
 */

import { resolveExports } from './transforms/resolve-exports.js';
import { markUsed } from './transforms/mark-used.js';
import { treeShake } from './transforms/tree-shake.js';
import { deadCode } from './transforms/dead-code.js';
import { assignChunks } from './transforms/assign-chunks.js';
import { markHoistable } from './transforms/mark-hoistable.js';
import { createLintRunner } from './lint-rules/index.js';

/**
 * Create the transform pipeline
 * @param {Object} options
 * @param {boolean} [options.dev=false] - Development mode
 * @param {boolean} [options.minify=true] - Enable minification
 * @param {Object} [options.lint] - Lint rule severity config
 * @returns {Function[]}
 */
export function createPipeline(options = {}) {
  const { dev = false, minify = true, lint = {} } = options;

  const transforms = [
    // Always run - resolve export bindings
    resolveExports,

    // Always run - track what's used
    markUsed,

    // Always run - detect hoistability
    markHoistable,

    // Always run - assign chunks for dynamic imports
    assignChunks,
  ];

  // Production-only transforms
  if (!dev) {
    transforms.push(
      // Remove unused exports
      treeShake,

      // Remove dead code (if(false), dev guards)
      deadCode,
    );
  }

  // Lint phase - always runs last, respects severity config
  const lintRunner = createLintRunner(lint, { dev });
  transforms.push((graph) => lintRunner.run(graph));

  return transforms;
}

/**
 * Run the pipeline on a graph
 * @param {ModuleGraph} graph
 * @param {Object} options
 */
export function runPipeline(graph, options = {}) {
  const transforms = createPipeline(options);

  for (const transform of transforms) {
    transform(graph);
  }

  return graph;
}
