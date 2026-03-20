/**
 * Decantr Compiler - Main Entry Point
 *
 * Replaces regex-based bundler with proper compiler architecture.
 * Pipeline: Tokenize → Parse → Graph → Transform → Optimize → Emit → Validate
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { ModuleGraph } from './graph.js';
import { createPipeline } from './pipeline.js';
import { optimize } from './optimizer.js';
import { emit } from './emitter.js';
import { validate } from './validator.js';
import { report, formatErrors } from './reporter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} BuildOptions
 * @property {string} entry - Entry point file path
 * @property {string} outDir - Output directory
 * @property {boolean} [minify=true] - Enable minification
 * @property {boolean} [sourceMaps=true] - Generate source maps
 * @property {boolean} [validate=true] - Validate output
 * @property {boolean} [dev=false] - Development mode (skip optimizations)
 */

/**
 * @typedef {Object} BuildResult
 * @property {boolean} success
 * @property {string[]} outputs - Written file paths
 * @property {Error[]} errors
 * @property {Warning[]} warnings
 * @property {number} duration - Build time in ms
 */

/**
 * Build a Decantr project
 * @param {BuildOptions} options
 * @returns {Promise<BuildResult>}
 */
export async function build(options) {
  const startTime = performance.now();
  const { entry, outDir, minify = true, sourceMaps = true, validate: doValidate = true, dev = false } = options;

  const result = {
    success: false,
    outputs: [],
    errors: [],
    warnings: [],
    duration: 0
  };

  try {
    // Phase 1: Parse entry and build module graph
    const graph = new ModuleGraph(entry);
    await graph.build();

    if (graph.errors.length > 0) {
      result.errors = graph.errors;
      result.warnings = graph.warnings;
      console.error(formatErrors(graph.errors));
      return result;
    }

    // Phase 2: Run transform pipeline
    const transforms = createPipeline({ dev, minify });
    for (const transform of transforms) {
      transform(graph);
    }

    // Phase 3: Optimize (skip in dev mode)
    if (!dev) {
      optimize(graph, { minify });
    }

    // Phase 4: Emit output
    const outputs = emit(graph, { sourceMaps, minify });

    // Phase 5: Validate (skip in dev mode for speed)
    if (doValidate && !dev) {
      for (const output of outputs) {
        const validation = validate(output.code, output.file);
        if (!validation.valid) {
          result.errors.push(...validation.errors);
        }
      }

      if (result.errors.length > 0) {
        console.error(formatErrors(result.errors));
        return result;
      }
    }

    // Phase 6: Write files
    await mkdir(outDir, { recursive: true });

    for (const output of outputs) {
      const outPath = join(outDir, output.file);
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, output.code);
      result.outputs.push(outPath);

      if (output.map && sourceMaps) {
        const mapPath = outPath + '.map';
        await writeFile(mapPath, output.map);
        result.outputs.push(mapPath);
      }
    }

    result.success = true;
    result.warnings = graph.warnings;

  } catch (error) {
    result.errors.push(error);
    console.error(report(error));
  }

  result.duration = performance.now() - startTime;
  return result;
}

/**
 * Parse a single file (for dev server / HMR)
 * @param {string} filePath
 * @param {string} source
 * @returns {Object} Module AST
 */
export function parseModule(filePath, source) {
  const tokens = tokenize(source, filePath);
  return parse(tokens, filePath);
}

/**
 * Incremental rebuild for HMR
 * @param {ModuleGraph} oldGraph
 * @param {string} changedFile
 * @param {string} newSource
 * @returns {Object} { affectedModules, newGraph }
 */
export function incrementalRebuild(oldGraph, changedFile, newSource) {
  const newGraph = oldGraph.clone();
  const moduleId = newGraph.pathToId.get(resolve(changedFile));

  if (!moduleId) {
    // New file, do full rebuild
    return { affectedModules: null, newGraph: null };
  }

  // Re-parse the changed module
  const tokens = tokenize(newSource, changedFile);
  const ast = parse(tokens, changedFile);

  // Update the module in the graph
  const mod = newGraph.modules.get(moduleId);
  const oldDeps = new Set(mod.dependencies.map(d => d.moduleId));

  mod.ast = ast;

  // Find affected modules (dependents of changed module)
  const affected = new Set([moduleId]);
  const queue = [...mod.dependents];

  while (queue.length > 0) {
    const depId = queue.shift();
    if (!affected.has(depId)) {
      affected.add(depId);
      const dep = newGraph.modules.get(depId);
      if (dep) {
        queue.push(...dep.dependents);
      }
    }
  }

  return {
    affectedModules: Array.from(affected),
    newGraph
  };
}

export { tokenize } from './tokenizer.js';
export { parse } from './parser.js';
export { ModuleGraph } from './graph.js';
export { validate } from './validator.js';
export { emit } from './emitter.js';
