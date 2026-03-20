/**
 * Decantr Compiler - Hashing Utilities
 */

import { createHash } from 'node:crypto';

/**
 * Generate content hash for cache busting
 * @param {string} content
 * @param {number} [length=8]
 * @returns {string}
 */
export function contentHash(content, length = 8) {
  return createHash('sha256')
    .update(content)
    .digest('hex')
    .slice(0, length);
}

/**
 * Generate hash for module ID shortening
 * @param {string} id
 * @returns {string}
 */
export function moduleHash(id) {
  return createHash('md5')
    .update(id)
    .digest('base64')
    .replace(/[+/=]/g, '')
    .slice(0, 4);
}

/**
 * Generate chunk filename with hash
 * @param {string} name
 * @param {string} content
 * @returns {string}
 */
export function chunkFileName(name, content) {
  const hash = contentHash(content);
  return `${name}.${hash}.js`;
}
