/**
 * Dependency Resolver Service
 *
 * Resolves transitive dependencies for registry content items,
 * detecting cycles and checking decantr compatibility.
 */

import { maxSatisfying, satisfies } from './semver.js';

// Dependency types within an artifact's `dependencies` object that are
// resolved against the registry (requires_core is skipped).
const REGISTRY_DEP_TYPES = ['patterns', 'recipes', 'styles', 'archetypes'];

// Map from plural dep key in artifact to the content `type` value in the DB
const DEP_KEY_TO_TYPE = {
  patterns: 'pattern',
  recipes: 'recipe',
  styles: 'style',
  archetypes: 'archetype',
};

/**
 * Resolve dependencies for a list of registry items.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {Array<{ type: string, id: string, range: string }>} items
 * @param {Record<string, string>} installed  Map of "type/id" → installed version
 * @param {string} decantrVersion  Framework version (for compat checking)
 * @returns {{ tree: object, flat: Array, stats: { toInstall: number, toSkip: number }, warnings: string[] }}
 */
export function resolveDependencies(db, items, installed = {}, decantrVersion = '0.9.0') {
  const warnings = [];
  // flat results keyed by "type/id" to deduplicate
  const seen = new Map(); // "type/id" → flat entry
  // tree structure for the top-level requests
  const tree = {};

  /**
   * Recursively resolve a single item.
   *
   * @param {string} type
   * @param {string} id
   * @param {string} range
   * @param {Set<string>} visiting  Current DFS stack for cycle detection
   * @returns {object} The flat entry for this node
   */
  function resolve(type, id, range, visiting) {
    const key = `${type}/${id}`;

    // Cycle detection
    if (visiting.has(key)) {
      throw new Error(`Circular dependency detected: ${key} is already being resolved`);
    }

    // Deduplication — if already resolved, return the cached entry
    if (seen.has(key)) {
      return seen.get(key);
    }

    // Look up content row
    const contentRow = db.prepare(
      "SELECT id, latest_version FROM content WHERE type = ? AND content_id = ? AND status = 'active'"
    ).get(type, id);

    if (!contentRow) {
      throw new Error(`Content not found: ${type}/${id}`);
    }

    // Get all versions for this content
    const versionRows = db.prepare(
      'SELECT version FROM content_versions WHERE content_id = ?'
    ).all(contentRow.id);
    const versions = versionRows.map(r => r.version);

    // Find best version satisfying the range
    const resolvedVersion = maxSatisfying(versions, range);
    if (resolvedVersion === null) {
      throw new Error(`No version of ${type}/${id} satisfies range "${range}" (available: ${versions.join(', ')})`);
    }

    // Check if already installed and the installed version satisfies the range
    const installedVersion = installed[key];
    if (installedVersion !== undefined && satisfies(installedVersion, range)) {
      const entry = {
        type,
        id,
        version: installedVersion,
        action: 'skip',
        reason: 'already-installed',
        dependencies: {},
      };
      seen.set(key, entry);
      return entry;
    }

    // Fetch the artifact for the resolved version
    const versionRow = db.prepare(
      'SELECT artifact FROM content_versions WHERE content_id = ? AND version = ?'
    ).get(contentRow.id, resolvedVersion);

    let artifact;
    try {
      artifact = JSON.parse(versionRow.artifact);
    } catch {
      artifact = {};
    }

    // Check decantr_compat
    if (artifact.decantr_compat) {
      if (!satisfies(decantrVersion, artifact.decantr_compat)) {
        warnings.push(
          `${type}/${id}@${resolvedVersion} requires decantr ${artifact.decantr_compat} but current version is ${decantrVersion}`
        );
      }
    }

    // Build the flat entry
    const entry = {
      type,
      id,
      version: resolvedVersion,
      action: 'install',
      dependencies: {},
    };

    // Register in seen BEFORE recursing to allow cycle detection to work
    seen.set(key, entry);

    // Recurse into registry-resolvable dependencies
    const deps = artifact.dependencies || {};
    visiting.add(key);

    for (const depKey of REGISTRY_DEP_TYPES) {
      const depMap = deps[depKey];
      if (!depMap || typeof depMap !== 'object') continue;

      const depType = DEP_KEY_TO_TYPE[depKey];
      for (const [depId, depRange] of Object.entries(depMap)) {
        const depEntry = resolve(depType, depId, depRange, visiting);
        entry.dependencies[`${depType}/${depId}`] = depEntry;
      }
    }

    visiting.delete(key);

    return entry;
  }

  // Resolve all requested items
  for (const item of items) {
    const { type, id, range } = item;
    const entry = resolve(type, id, range, new Set());
    tree[`${type}/${id}`] = entry;
  }

  // Build flat list in insertion order
  const flat = Array.from(seen.values());
  const toInstall = flat.filter(e => e.action === 'install').length;
  const toSkip = flat.filter(e => e.action === 'skip').length;

  return {
    tree,
    flat,
    stats: { toInstall, toSkip },
    warnings,
  };
}
