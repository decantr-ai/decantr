/**
 * Decantr Compiler - Validator
 *
 * Safety net - guarantees we never write broken JavaScript.
 */

import { Script } from 'node:vm';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {Error[]} errors
 */

/**
 * Validate JavaScript output
 * @param {string} code
 * @param {string} file
 * @returns {ValidationResult}
 */
export function validate(code, file) {
  const result = {
    valid: true,
    errors: []
  };

  // Syntax validation using Node.js VM
  try {
    new Script(code, { filename: file });
  } catch (err) {
    result.valid = false;
    result.errors.push(createValidationError(err, code, file));
  }

  // Structure validation
  const structureErrors = validateStructure(code, file);
  if (structureErrors.length > 0) {
    result.valid = false;
    result.errors.push(...structureErrors);
  }

  return result;
}

/**
 * Create validation error with source location
 */
function createValidationError(err, code, file) {
  const error = new Error(`Syntax error in ${file}: ${err.message}`);
  error.name = 'ValidationError';
  error.file = file;

  // Try to extract line number
  const lineMatch = err.message.match(/line (\d+)/i) ||
                    err.stack?.match(/:(\d+):/);
  if (lineMatch) {
    error.line = parseInt(lineMatch[1], 10);
    error.context = getLineContext(code, error.line);
  }

  return error;
}

/**
 * Get surrounding lines for error context
 */
function getLineContext(code, line, context = 2) {
  const lines = code.split('\n');
  const start = Math.max(0, line - context - 1);
  const end = Math.min(lines.length, line + context);

  return lines.slice(start, end).map((content, i) => {
    const lineNum = start + i + 1;
    const marker = lineNum === line ? '>' : ' ';
    return `${marker} ${lineNum} | ${content}`;
  }).join('\n');
}

/**
 * Validate expected structure
 */
function validateStructure(code, file) {
  const errors = [];

  // Check for module registry (only for bundle files, not snippets)
  // Skip this check for test files or small snippets
  if (code.length > 100 && !file.includes('test') && !code.includes('__modules')) {
    errors.push(new Error(`Missing module registry in ${file}`));
  }

  // Note: Brace/paren counting is unreliable due to template literals
  // with expressions `${...}`. The Script syntax check above is authoritative.

  return errors;
}

/**
 * Count occurrences of a character (outside strings/comments)
 */
function countChar(code, char) {
  let count = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inBlockComment = false;

  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const next = code[i + 1];

    // Handle comments
    if (!inString) {
      if (!inComment && !inBlockComment && c === '/' && next === '/') {
        inComment = true;
        continue;
      }
      if (!inComment && !inBlockComment && c === '/' && next === '*') {
        inBlockComment = true;
        continue;
      }
      if (inComment && c === '\n') {
        inComment = false;
        continue;
      }
      if (inBlockComment && c === '*' && next === '/') {
        inBlockComment = false;
        i++;
        continue;
      }
    }

    if (inComment || inBlockComment) continue;

    // Handle strings
    if (!inString && (c === '"' || c === "'" || c === '`')) {
      inString = true;
      stringChar = c;
      continue;
    }
    if (inString && c === stringChar && code[i - 1] !== '\\') {
      inString = false;
      continue;
    }

    if (inString) continue;

    // Count the character
    if (c === char) count++;
  }

  return count;
}

/**
 * Validate a chunk independently
 * @param {string} code
 * @param {string} chunkName
 * @returns {ValidationResult}
 */
export function validateChunk(code, chunkName) {
  return validate(code, `chunk:${chunkName}`);
}

/**
 * Validate source map
 * @param {string} mapJson
 * @returns {ValidationResult}
 */
export function validateSourceMap(mapJson) {
  const result = { valid: true, errors: [] };

  try {
    const map = JSON.parse(mapJson);

    // Check version
    if (map.version !== 3) {
      result.errors.push(new Error('Invalid source map version'));
      result.valid = false;
    }

    // Check required fields
    if (!map.sources || !Array.isArray(map.sources)) {
      result.errors.push(new Error('Missing or invalid sources array'));
      result.valid = false;
    }

    if (typeof map.mappings !== 'string') {
      result.errors.push(new Error('Missing or invalid mappings'));
      result.valid = false;
    }

  } catch (err) {
    result.valid = false;
    result.errors.push(new Error(`Invalid source map JSON: ${err.message}`));
  }

  return result;
}
