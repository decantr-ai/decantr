/**
 * SHA-256 checksum computation and verification.
 */

import { createHash } from 'node:crypto';

/**
 * Compute prefixed SHA-256 checksum.
 * @param {string} content
 * @returns {string} "sha256:{hex}"
 */
export function computeChecksum(content) {
  const hash = createHash('sha256').update(content).digest('hex');
  return `sha256:${hash}`;
}

/**
 * Verify content matches an expected checksum.
 * @param {string} content
 * @param {string} expected - "sha256:{hex}"
 * @returns {boolean}
 */
export function verifyChecksum(content, expected) {
  return computeChecksum(content) === expected;
}
