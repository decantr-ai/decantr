/**
 * Decantr Compiler - Error Reporter
 *
 * Consistent, helpful error messages.
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

const useColors = process.stdout.isTTY;

function color(name, text) {
  return useColors ? `${COLORS[name]}${text}${COLORS.reset}` : text;
}

/**
 * Format a single error
 * @param {Error} error
 * @returns {string}
 */
export function report(error) {
  let output = '';

  // Error header
  output += color('red', '[ERROR]') + ' ';
  output += color('bold', error.message) + '\n';

  // File location
  if (error.file) {
    output += '\n';
    output += `  ${color('cyan', error.file)}`;
    if (error.line) {
      output += `:${error.line}`;
      if (error.col) output += `:${error.col}`;
    }
    output += '\n';
  }

  // Source context
  if (error.context) {
    output += '\n';
    output += error.context.split('\n').map(line => `  ${line}`).join('\n');
    output += '\n';
  }

  // Suggestion
  if (error.suggestion) {
    output += '\n';
    output += `  ${color('dim', 'Did you mean:')} ${error.suggestion}\n`;
  }

  // Stack trace (in debug mode)
  if (process.env.DEBUG && error.stack) {
    output += '\n';
    output += color('dim', error.stack);
    output += '\n';
  }

  return output;
}

/**
 * Format multiple errors
 * @param {Error[]} errors
 * @returns {string}
 */
export function formatErrors(errors) {
  if (errors.length === 0) return '';

  let output = '\n';

  for (const error of errors) {
    output += report(error);
    output += '\n';
  }

  output += color('red', `${errors.length} error${errors.length > 1 ? 's' : ''}`);
  output += '\n';

  return output;
}

/**
 * Format a warning
 * @param {Object} warning
 * @returns {string}
 */
export function formatWarning(warning) {
  let output = '';

  output += color('yellow', '[WARN]') + ' ';
  output += warning.message + '\n';

  if (warning.file) {
    output += `  ${color('dim', warning.file)}\n`;
  }

  if (warning.cycle) {
    output += '\n';
    output += `  ${warning.cycle.join(' → ')}\n`;
  }

  return output;
}

/**
 * Format multiple warnings
 * @param {Object[]} warnings
 * @returns {string}
 */
export function formatWarnings(warnings) {
  if (warnings.length === 0) return '';

  let output = '\n';

  for (const warning of warnings) {
    output += formatWarning(warning);
    output += '\n';
  }

  return output;
}

/**
 * Create module resolution error with suggestion
 * @param {string} specifier
 * @param {string} fromFile
 * @returns {Error}
 */
export function createResolutionError(specifier, fromFile) {
  const error = new Error(`Cannot resolve '${specifier}' from ${fromFile}`);
  error.file = fromFile;

  // Try to suggest corrections
  if (specifier.startsWith('decantr/')) {
    const parts = specifier.split('/');
    const suggestions = {
      'component': 'components',
      'router': 'router',
      'state': 'state',
      'tag': 'tags',
      'css': 'css',
      'util': 'utils'
    };

    for (const [wrong, right] of Object.entries(suggestions)) {
      if (parts[1] === wrong) {
        error.suggestion = `decantr/${right}`;
        break;
      }
    }
  }

  return error;
}

/**
 * Format build summary
 * @param {Object} result
 * @returns {string}
 */
export function formatBuildSummary(result) {
  let output = '\n';

  if (result.success) {
    output += color('cyan', '✓') + ' Build completed in ';
    output += color('bold', `${Math.round(result.duration)}ms`);
    output += '\n\n';

    for (const file of result.outputs) {
      output += `  ${color('dim', '→')} ${file}\n`;
    }
  } else {
    output += color('red', '✗') + ' Build failed\n';
  }

  if (result.warnings.length > 0) {
    output += '\n';
    output += formatWarnings(result.warnings);
  }

  return output;
}

/**
 * Format validation error with traced source
 * @param {Error} error
 * @param {Object} sourceMap
 * @returns {string}
 */
export function formatValidationError(error, sourceMap) {
  let output = '';

  output += color('red', 'Validation Error:') + ' ';
  output += `Syntax error in ${error.file || 'output'}\n`;
  output += '\n';
  output += `  ${error.message}\n`;

  // Try to trace to source
  if (sourceMap && error.line) {
    output += '\n';
    output += `  ${color('dim', 'Traced to source:')}\n`;
    // Would need source map decoder here
    output += `    (source mapping not yet implemented)\n`;
  }

  if (error.context) {
    output += '\n';
    output += error.context.split('\n').map(line => `    ${line}`).join('\n');
    output += '\n';
  }

  return output;
}
