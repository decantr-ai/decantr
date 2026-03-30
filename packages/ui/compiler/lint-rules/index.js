/**
 * Decantr Compiler - Lint Rule Infrastructure
 *
 * Provides a configurable lint runner that integrates into the compiler pipeline.
 * Rules can be set to 'off', 'warn', or 'error' severity.
 * In dev mode, 'error' severity is downgraded to 'warn'.
 */

import { unusedVariable } from './unused-variable.js';
import { unusedAssignment } from './unused-assignment.js';
import { duplicateProperty } from './duplicate-property.js';
import { insecureTempFile } from './insecure-temp-file.js';
import { prototypePollution } from './prototype-pollution.js';
import { incompleteSanitization } from './incomplete-sanitization.js';
import { superfluousArguments } from './superfluous-arguments.js';
import { redos } from './redos.js';

const DEFAULTS = {
  'unused-variable': 'warn',
  'unused-assignment': 'warn',
  'duplicate-property': 'warn',
  'superfluous-arguments': 'warn',
  'insecure-temp-file': 'error',
  'prototype-pollution': 'error',
  'incomplete-sanitization': 'error',
  'redos': 'error',
};

/**
 * Create a lint runner with the given rule config and options.
 * @param {Object} config - Rule severity map, e.g. { 'unused-variable': 'warn' }
 * @param {Object} options
 * @param {boolean} [options.dev=false] - In dev mode, errors are downgraded to warnings
 * @returns {{ register(name, fn): void, run(graph): void }}
 */
export function createLintRunner(config = {}, options = {}) {
  const mergedConfig = { ...DEFAULTS, ...config };
  const rules = new Map();

  const runner = {
    register(name, fn) {
      rules.set(name, fn);
    },

    run(graph) {
      for (const [name, fn] of rules) {
        const severity = mergedConfig[name] || 'off';
        if (severity === 'off') continue;

        fn(graph);

        for (const mod of graph.modules.values()) {
          if (!mod._lintIssues) continue;
          for (const issue of mod._lintIssues) {
            const effectiveSeverity = options.dev ? 'warn' : severity;
            const entry = {
              rule: issue.rule,
              message: issue.message,
              file: mod.relPath || mod.file,
              loc: issue.loc,
            };
            if (effectiveSeverity === 'error') {
              graph.errors.push(entry);
            } else {
              graph.warnings.push(entry);
            }
          }
          mod._lintIssues = null;
        }
      }
    },
  };

  return runner;
}

/**
 * Create a lint runner pre-loaded with all built-in rules.
 * Use this in the compiler pipeline instead of createLintRunner directly.
 * @param {Object} config - Rule severity overrides
 * @param {Object} options
 * @returns {{ register(name, fn): void, run(graph): void }}
 */
export function createDefaultLintRunner(config = {}, options = {}) {
  const runner = createLintRunner(config, options);
  runner.register('unused-variable', unusedVariable);
  runner.register('unused-assignment', unusedAssignment);
  runner.register('duplicate-property', duplicateProperty);
  runner.register('insecure-temp-file', insecureTempFile);
  runner.register('prototype-pollution', prototypePollution);
  runner.register('incomplete-sanitization', incompleteSanitization);
  runner.register('superfluous-arguments', superfluousArguments);
  runner.register('redos', redos);
  return runner;
}
