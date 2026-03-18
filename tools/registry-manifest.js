/**
 * Registry Manifest CRUD — reads, writes, and updates `decantr.registry.json`.
 *
 * The manifest tracks installed registry content with provenance,
 * checksums, and file locations for deterministic add/remove.
 *
 * @module tools/registry-manifest
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const MANIFEST_FILE = 'decantr.registry.json';

const CONTENT_TYPES = ['styles', 'recipes', 'patterns', 'archetypes', 'plugins', 'templates'];

/** Create a fresh empty manifest. */
export function createEmptyManifest() {
  const installed = {};
  for (const type of CONTENT_TYPES) installed[type] = {};
  return {
    $schema: 'https://registry.decantr.dev/schemas/manifest.v1.json',
    version: '1.0.0',
    registry: 'https://registry.decantr.dev/v1',
    installed,
  };
}

/**
 * Read the manifest from disk. Returns empty manifest if missing or invalid.
 * @param {string} cwd - Project root directory
 * @returns {Promise<Object>} Parsed manifest
 */
export async function readManifest(cwd) {
  const manifestPath = join(cwd, MANIFEST_FILE);
  try {
    const raw = await readFile(manifestPath, 'utf-8');
    const data = JSON.parse(raw);
    // Ensure all content type keys exist
    if (!data.installed) data.installed = {};
    for (const type of CONTENT_TYPES) {
      if (!data.installed[type]) data.installed[type] = {};
    }
    return data;
  } catch {
    return createEmptyManifest();
  }
}

/**
 * Write the manifest to disk.
 * @param {string} cwd - Project root directory
 * @param {Object} manifest - Manifest data
 */
export async function writeManifest(cwd, manifest) {
  const manifestPath = join(cwd, MANIFEST_FILE);
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Get an installed entry from the manifest.
 * @param {Object} manifest
 * @param {string} type - Content type (styles, recipes, etc.)
 * @param {string} name - Content name
 * @returns {Object|null} Installed entry or null
 */
export function getEntry(manifest, type, name) {
  return manifest.installed?.[type]?.[name] || null;
}

/**
 * Set (add or update) an installed entry in the manifest.
 * @param {Object} manifest - Manifest to mutate
 * @param {string} type - Content type
 * @param {string} name - Content name
 * @param {Object} entry - Entry data (version, source, checksum, file)
 */
export function setEntry(manifest, type, name, entry) {
  if (!manifest.installed[type]) manifest.installed[type] = {};
  manifest.installed[type][name] = {
    version: entry.version,
    source: entry.source || 'registry',
    installedAt: new Date().toISOString(),
    checksum: entry.checksum,
    file: entry.file,
  };
}

/**
 * Remove an installed entry from the manifest.
 * @param {Object} manifest - Manifest to mutate
 * @param {string} type - Content type
 * @param {string} name - Content name
 * @returns {boolean} True if entry existed and was removed
 */
export function removeEntry(manifest, type, name) {
  if (!manifest.installed?.[type]?.[name]) return false;
  delete manifest.installed[type][name];
  return true;
}

/**
 * List all installed entries, optionally filtered by type.
 * @param {Object} manifest
 * @param {string} [type] - Optional type filter
 * @returns {Array<{type: string, name: string, entry: Object}>}
 */
export function listEntries(manifest, type) {
  const results = [];
  const types = type ? [type] : CONTENT_TYPES;
  for (const t of types) {
    const entries = manifest.installed?.[t] || {};
    for (const [name, entry] of Object.entries(entries)) {
      results.push({ type: t, name, ...entry });
    }
  }
  return results;
}

/**
 * Check if manifest has any installed content.
 * @param {Object} manifest
 * @returns {boolean}
 */
export function isEmpty(manifest) {
  return listEntries(manifest).length === 0;
}

/** Valid content type names. */
export { CONTENT_TYPES };
