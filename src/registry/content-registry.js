/**
 * Content Registry HTTP Client — fetches content from the
 * Decantr community registry API.
 *
 * Uses native fetch() (Node 20+), response caching in
 * node_modules/.decantr-cache/registry/, and retry logic.
 *
 * @module src/registry/content-registry
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// ── Configuration ────────────────────────────────────────────────

const DEFAULT_REGISTRY = 'https://registry.decantr.dev/v1';
const CACHE_DIR = 'node_modules/.decantr-cache/registry';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for search/list
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 15000;

// ── Cache helpers ────────────────────────────────────────────────

function cacheKey(url) {
  return createHash('md5').update(url).digest('hex') + '.json';
}

async function getCacheDir(cwd) {
  const dir = join(cwd, CACHE_DIR);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function readCache(cwd, url) {
  try {
    const dir = await getCacheDir(cwd);
    const raw = await readFile(join(dir, cacheKey(url)), 'utf-8');
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  } catch { /* cache miss */ }
  return null;
}

async function writeCache(cwd, url, data) {
  try {
    const dir = await getCacheDir(cwd);
    await writeFile(
      join(dir, cacheKey(url)),
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch { /* cache write failure is non-fatal */ }
}

// ── HTTP helpers ─────────────────────────────────────────────────

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'decantr-cli',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const error = new Error(`Registry API error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.body = body;
      throw error;
    }

    return await response.json();
  } catch (err) {
    if (retries > 0 && !err.status) {
      // Retry on network errors (not HTTP errors)
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Client class ─────────────────────────────────────────────────

export class ContentRegistryClient {
  /**
   * @param {Object} opts
   * @param {string} [opts.registry] - Base registry URL
   * @param {string} [opts.cwd] - Project root for cache directory
   * @param {string} [opts.token] - Auth token for publish
   */
  constructor(opts = {}) {
    this.registry = opts.registry || DEFAULT_REGISTRY;
    this.cwd = opts.cwd || process.cwd();
    this.token = opts.token || null;
  }

  /** Build full URL from path + query params. */
  _url(path, params = {}) {
    const url = new URL(path, this.registry.endsWith('/') ? this.registry : this.registry + '/');
    for (const [key, val] of Object.entries(params)) {
      if (val != null && val !== '') url.searchParams.set(key, val);
    }
    return url.toString();
  }

  /** Add auth header if token is set. */
  _authHeaders() {
    if (!this.token) return {};
    return { Authorization: `Bearer ${this.token}` };
  }

  /**
   * Search the registry.
   * @param {Object} params - Query params (q, type, character, terroir, style, sort, page, limit)
   * @returns {Promise<{results: Object[], total: number, page: number}>}
   */
  async search(params = {}) {
    const url = this._url('search', params);
    const cached = await readCache(this.cwd, url);
    if (cached) return cached;

    const data = await fetchWithRetry(url);
    await writeCache(this.cwd, url, data);
    return data;
  }

  /**
   * Get full content artifact.
   * @param {string} type - Content type
   * @param {string} id - Content ID
   * @param {string} [version] - Specific version (omit for latest)
   * @returns {Promise<Object>} Content response
   */
  async getContent(type, id, version) {
    const path = version
      ? `content/${type}/${id}/version/${version}`
      : `content/${type}/${id}`;
    const url = this._url(path);

    // Content is not cached (we want fresh checksums)
    return fetchWithRetry(url);
  }

  /**
   * Get AI-native recommendations.
   * @param {Object} params - Query params (terroir, character, style, existing)
   * @returns {Promise<{recommendations: Object[]}>}
   */
  async getRecommendations(params = {}) {
    const url = this._url('recommend', params);
    const cached = await readCache(this.cwd, url);
    if (cached) return cached;

    const data = await fetchWithRetry(url);
    await writeCache(this.cwd, url, data);
    return data;
  }

  /**
   * Publish an artifact to the registry.
   * Requires auth token.
   * @param {Object} payload - Publish payload
   * @returns {Promise<Object>} Publish response
   */
  async publish(payload) {
    if (!this.token) {
      throw new Error('Authentication required. Run `decantr registry publish` to authenticate.');
    }

    const url = this._url('publish');
    return fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this._authHeaders(),
      },
      body: JSON.stringify(payload),
    });
  }
}

/**
 * Create a client from project manifest settings.
 * @param {Object} [opts]
 * @param {string} [opts.cwd] - Project root
 * @param {string} [opts.token] - Auth token
 * @returns {Promise<ContentRegistryClient>}
 */
export async function createClient(opts = {}) {
  const cwd = opts.cwd || process.cwd();
  let registry = DEFAULT_REGISTRY;

  // Read registry URL from manifest if present
  try {
    const manifest = JSON.parse(await readFile(join(cwd, 'decantr.registry.json'), 'utf-8'));
    if (manifest.registry) registry = manifest.registry;
  } catch { /* use default */ }

  return new ContentRegistryClient({ registry, cwd, token: opts.token });
}
