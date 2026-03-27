import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface RegistryItem {
  id: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export interface RegistrySource {
  type: 'api' | 'bundled' | 'cache';
  url?: string;
}

export interface FetchResult<T> {
  data: T;
  source: RegistrySource;
}

// Default API URL
const DEFAULT_API_URL = 'https://decantr-registry.fly.dev/v1';

// Bundled content root (relative to this package in monorepo)
function getBundledContentRoot(): string {
  // In production, content is bundled with the CLI
  // In development, it's in the monorepo content directory
  const bundled = join(__dirname, '..', '..', '..', 'content');
  if (existsSync(bundled)) return bundled;

  // Fallback for dist
  const distBundled = join(__dirname, '..', '..', '..', '..', 'content');
  if (existsSync(distBundled)) return distBundled;

  return bundled; // Return default, will error if accessed
}

/**
 * Fetch from API with timeout.
 */
async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Try to fetch data from the API.
 */
async function tryApi<T>(
  endpoint: string,
  apiUrl: string = DEFAULT_API_URL
): Promise<FetchResult<T> | null> {
  try {
    const url = `${apiUrl}/${endpoint}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) return null;

    const data = await response.json() as T;
    return {
      data,
      source: { type: 'api', url: apiUrl },
    };
  } catch {
    // API unavailable or timeout
    return null;
  }
}

/**
 * Load data from cache.
 */
function loadFromCache<T>(
  cacheDir: string,
  contentType: string,
  id?: string
): FetchResult<T> | null {
  const cachePath = id
    ? join(cacheDir, contentType, `${id}.json`)
    : join(cacheDir, contentType, 'index.json');

  if (!existsSync(cachePath)) return null;

  try {
    const data = JSON.parse(readFileSync(cachePath, 'utf-8')) as T;
    return {
      data,
      source: { type: 'cache' },
    };
  } catch {
    return null;
  }
}

/**
 * Load data from bundled content.
 */
function loadFromBundled<T>(
  contentType: string,
  id?: string
): FetchResult<T> | null {
  const contentRoot = getBundledContentRoot();

  if (id) {
    // Load single item - check main dir first, then core
    const mainPath = join(contentRoot, contentType, `${id}.json`);
    if (existsSync(mainPath)) {
      try {
        const data = JSON.parse(readFileSync(mainPath, 'utf-8')) as T;
        return { data, source: { type: 'bundled' } };
      } catch { /* fall through */ }
    }

    // Check core directory
    const corePath = join(contentRoot, 'core', contentType, `${id}.json`);
    if (existsSync(corePath)) {
      try {
        const data = JSON.parse(readFileSync(corePath, 'utf-8')) as T;
        return { data, source: { type: 'bundled' } };
      } catch { /* fall through */ }
    }

    return null;
  } else {
    // Load all items - merge main and core directories
    const mainDir = join(contentRoot, contentType);
    const coreDir = join(contentRoot, 'core', contentType);
    const items: Array<{ id: string; [key: string]: unknown }> = [];

    // Load from main directory
    if (existsSync(mainDir)) {
      try {
        const files = readdirSync(mainDir).filter(f => f.endsWith('.json'));
        for (const f of files) {
          const content = JSON.parse(readFileSync(join(mainDir, f), 'utf-8'));
          items.push({ id: content.id || f.replace('.json', ''), ...content });
        }
      } catch { /* ignore errors */ }
    }

    // Load from core directory (don't duplicate if id already exists)
    if (existsSync(coreDir)) {
      try {
        const files = readdirSync(coreDir).filter(f => f.endsWith('.json'));
        const existingIds = new Set(items.map(i => i.id));
        for (const f of files) {
          const content = JSON.parse(readFileSync(join(coreDir, f), 'utf-8'));
          const itemId = content.id || f.replace('.json', '');
          if (!existingIds.has(itemId)) {
            items.push({ id: itemId, ...content });
          }
        }
      } catch { /* ignore errors */ }
    }

    if (items.length === 0) return null;

    return {
      data: { items, total: items.length } as unknown as T,
      source: { type: 'bundled' },
    };
  }
}

/**
 * Save data to cache.
 */
function saveToCache(
  cacheDir: string,
  contentType: string,
  id: string | null,
  data: unknown
): void {
  const dir = join(cacheDir, contentType);
  mkdirSync(dir, { recursive: true });

  const cachePath = id
    ? join(dir, `${id}.json`)
    : join(dir, 'index.json');

  writeFileSync(cachePath, JSON.stringify(data, null, 2));
}

/**
 * Registry client with fallback chain: API → Cache → Bundled
 */
export class RegistryClient {
  private cacheDir: string;
  private apiUrl: string;
  private offline: boolean;

  constructor(options: {
    cacheDir?: string;
    apiUrl?: string;
    offline?: boolean;
  } = {}) {
    this.cacheDir = options.cacheDir || join(process.cwd(), '.decantr', 'cache');
    this.apiUrl = options.apiUrl || DEFAULT_API_URL;
    this.offline = options.offline || false;
  }

  /**
   * Fetch archetypes list.
   */
  async fetchArchetypes(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    // Try API first (unless offline)
    if (!this.offline) {
      const apiResult = await tryApi<{ items: RegistryItem[]; total: number }>('archetypes', this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'archetypes', null, apiResult.data);
        return apiResult;
      }
    }

    // Try cache
    const cacheResult = loadFromCache<{ items: RegistryItem[]; total: number }>(
      this.cacheDir,
      'archetypes'
    );
    if (cacheResult) return cacheResult;

    // Fall back to bundled
    const bundledResult = loadFromBundled<{ items: RegistryItem[]; total: number }>('archetypes');
    if (bundledResult) return bundledResult;

    // Empty fallback
    return {
      data: { items: [], total: 0 },
      source: { type: 'bundled' },
    };
  }

  /**
   * Fetch a single archetype.
   */
  async fetchArchetype(id: string): Promise<FetchResult<RegistryItem> | null> {
    if (!this.offline) {
      const apiResult = await tryApi<RegistryItem>(`archetypes/${id}`, this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'archetypes', id, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<RegistryItem>(this.cacheDir, 'archetypes', id);
    if (cacheResult) return cacheResult;

    return loadFromBundled<RegistryItem>('archetypes', id);
  }

  /**
   * Fetch blueprints list.
   */
  async fetchBlueprints(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    if (!this.offline) {
      const apiResult = await tryApi<{ items: RegistryItem[]; total: number }>('blueprints', this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'blueprints', null, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<{ items: RegistryItem[]; total: number }>(
      this.cacheDir,
      'blueprints'
    );
    if (cacheResult) return cacheResult;

    const bundledResult = loadFromBundled<{ items: RegistryItem[]; total: number }>('blueprints');
    if (bundledResult) return bundledResult;

    return {
      data: { items: [], total: 0 },
      source: { type: 'bundled' },
    };
  }

  /**
   * Fetch a single blueprint.
   */
  async fetchBlueprint(id: string): Promise<FetchResult<RegistryItem> | null> {
    if (!this.offline) {
      const apiResult = await tryApi<RegistryItem>(`blueprints/${id}`, this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'blueprints', id, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<RegistryItem>(this.cacheDir, 'blueprints', id);
    if (cacheResult) return cacheResult;

    return loadFromBundled<RegistryItem>('blueprints', id);
  }

  /**
   * Fetch themes list.
   */
  async fetchThemes(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    if (!this.offline) {
      const apiResult = await tryApi<{ items: RegistryItem[]; total: number }>('themes', this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'themes', null, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<{ items: RegistryItem[]; total: number }>(
      this.cacheDir,
      'themes'
    );
    if (cacheResult) return cacheResult;

    const bundledResult = loadFromBundled<{ items: RegistryItem[]; total: number }>('themes');
    if (bundledResult) return bundledResult;

    return {
      data: { items: [], total: 0 },
      source: { type: 'bundled' },
    };
  }

  /**
   * Fetch patterns list.
   */
  async fetchPatterns(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    if (!this.offline) {
      const apiResult = await tryApi<{ items: RegistryItem[]; total: number }>('patterns', this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'patterns', null, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<{ items: RegistryItem[]; total: number }>(
      this.cacheDir,
      'patterns'
    );
    if (cacheResult) return cacheResult;

    const bundledResult = loadFromBundled<{ items: RegistryItem[]; total: number }>('patterns');
    if (bundledResult) return bundledResult;

    return {
      data: { items: [], total: 0 },
      source: { type: 'bundled' },
    };
  }

  /**
   * Check if API is available.
   */
  async checkApiAvailability(): Promise<boolean> {
    if (this.offline) return false;

    try {
      const response = await fetchWithTimeout(`${this.apiUrl.replace('/v1', '')}/health`, 3000);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the source used for the last fetch.
   */
  getSourceType(): 'api' | 'bundled' | 'cache' {
    // This would track the last source, but for simplicity we check API availability
    return this.offline ? 'bundled' : 'api';
  }
}

/**
 * Create a registry client with default options.
 */
export function createRegistryClient(options?: {
  cacheDir?: string;
  apiUrl?: string;
  offline?: boolean;
}): RegistryClient {
  return new RegistryClient(options);
}

/**
 * Sync registry content to cache.
 */
export async function syncRegistry(
  cacheDir: string,
  apiUrl: string = DEFAULT_API_URL
): Promise<{
  synced: string[];
  failed: string[];
  source: 'api' | 'bundled';
}> {
  const client = new RegistryClient({ cacheDir, apiUrl, offline: false });
  const synced: string[] = [];
  const failed: string[] = [];

  // Check if API is available
  const apiAvailable = await client.checkApiAvailability();

  if (!apiAvailable) {
    return { synced: [], failed: ['API unavailable'], source: 'bundled' };
  }

  // Sync each content type
  const types = ['archetypes', 'blueprints', 'themes', 'patterns'] as const;

  for (const type of types) {
    try {
      const fetchMethod = `fetch${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof RegistryClient;
      const result = await (client[fetchMethod] as () => Promise<FetchResult<unknown>>)();
      if (result.source.type === 'api') {
        synced.push(type);
      }
    } catch {
      failed.push(type);
    }
  }

  return {
    synced,
    failed,
    source: synced.length > 0 ? 'api' : 'bundled',
  };
}
