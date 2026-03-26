/**
 * Shared semver range matching module.
 * Used by both the CLI and registry server.
 */

/**
 * Parse a version string "x.y.z" into its numeric components.
 * @param {string} version
 * @returns {{ major: number, minor: number, patch: number }}
 */
export function parse(version) {
  const parts = String(version).split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version: ${version}`);
  }
  const [major, minor, patch] = parts.map(Number);
  if ([major, minor, patch].some(isNaN)) {
    throw new Error(`Invalid version: ${version}`);
  }
  return { major, minor, patch };
}

/**
 * Compare two version strings.
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if a < b, 0 if equal, positive if a > b
 */
export function compareSemver(a, b) {
  const va = parse(a);
  const vb = parse(b);
  if (va.major !== vb.major) return va.major - vb.major;
  if (va.minor !== vb.minor) return va.minor - vb.minor;
  return va.patch - vb.patch;
}

/**
 * Parse a range string into a structured descriptor.
 * @param {string} range
 * @returns {{ type: 'caret'|'tilde'|'gte'|'exact'|'wildcard', version: string|null }}
 */
export function parseRange(range) {
  const r = String(range).trim();

  if (r === '*') {
    return { type: 'wildcard', version: null };
  }
  if (r.startsWith('^')) {
    return { type: 'caret', version: r.slice(1) };
  }
  if (r.startsWith('~')) {
    return { type: 'tilde', version: r.slice(1) };
  }
  if (r.startsWith('>=')) {
    return { type: 'gte', version: r.slice(2) };
  }
  // Exact version
  return { type: 'exact', version: r };
}

/**
 * Test whether a version satisfies a range.
 * Supported range formats:
 *   *        — matches everything
 *   ^1.0.0   — same major, >= range version
 *   ~1.2.0   — same major+minor, >= range version
 *   >=2.0.0  — version >= range version
 *   1.2.3    — exact match
 *
 * @param {string} version
 * @param {string} range
 * @returns {boolean}
 */
export function satisfies(version, range) {
  const { type, version: rv } = parseRange(range);

  if (type === 'wildcard') {
    return true;
  }

  const v = parse(version);
  const r = parse(rv);

  switch (type) {
    case 'caret':
      // Same major, and version >= range version
      return v.major === r.major && compareSemver(version, rv) >= 0;

    case 'tilde':
      // Same major+minor, and version >= range version
      return v.major === r.major && v.minor === r.minor && compareSemver(version, rv) >= 0;

    case 'gte':
      return compareSemver(version, rv) >= 0;

    case 'exact':
      return compareSemver(version, rv) === 0;

    default:
      return false;
  }
}

/**
 * Return the highest version from the array that satisfies the range,
 * or null if none satisfy it.
 * @param {string[]} versions
 * @param {string} range
 * @returns {string|null}
 */
export function maxSatisfying(versions, range) {
  const matching = versions.filter(v => satisfies(v, range));
  if (matching.length === 0) return null;
  return matching.reduce((best, v) => compareSemver(v, best) > 0 ? v : best);
}
