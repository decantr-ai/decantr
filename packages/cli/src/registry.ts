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
  type: 'api' | 'bundled' | 'cache' | 'custom';
  url?: string;
  path?: string;  // For custom: the local file path
}

export interface FetchResult<T> {
  data: T;
  source: RegistrySource;
}

// Default API URL
const DEFAULT_API_URL = 'https://decantr-registry.fly.dev/v1';

// Bundled content root (for CLI distribution)
function getLocalBundledRoot(): string {
  return join(__dirname, 'bundled');
}

/**
 * Load data from locally bundled content (shipped with CLI package).
 */
function loadFromBundledLocal<T>(
  contentType: string,
  id?: string
): FetchResult<T> | null {
  const bundledRoot = getLocalBundledRoot();

  if (id) {
    const filePath = join(bundledRoot, contentType, `${id}.json`);
    if (existsSync(filePath)) {
      try {
        const data = JSON.parse(readFileSync(filePath, 'utf-8')) as T;
        return { data, source: { type: 'bundled' } };
      } catch { return null; }
    }
    return null;
  }

  // Load all items from bundled directory
  const dir = join(bundledRoot, contentType);
  if (!existsSync(dir)) return null;

  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.json'));
    const items = files.map(f => {
      const content = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      return { id: content.id || f.replace('.json', ''), ...content };
    });
    return {
      data: { items, total: items.length } as unknown as T,
      source: { type: 'bundled' }
    };
  } catch { return null; }
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
  private projectRoot: string;

  constructor(options: {
    cacheDir?: string;
    apiUrl?: string;
    offline?: boolean;
    projectRoot?: string;
  } = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.cacheDir = options.cacheDir || join(this.projectRoot, '.decantr', 'cache');
    this.apiUrl = options.apiUrl || DEFAULT_API_URL;
    this.offline = options.offline || false;
  }

  /**
   * Load content from .decantr/custom/{contentType}/{id}.json
   */
  private loadCustomContent<T>(
    contentType: string,
    id: string
  ): FetchResult<T> | null {
    const customPath = join(
      this.projectRoot,
      '.decantr',
      'custom',
      contentType,
      `${id}.json`
    );

    if (!existsSync(customPath)) {
      return null;
    }

    try {
      const data = JSON.parse(readFileSync(customPath, 'utf-8')) as T;
      return {
        data,
        source: { type: 'custom', path: customPath }
      };
    } catch {
      return null;
    }
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
    const bundledResult = loadFromBundledLocal<{ items: RegistryItem[]; total: number }>('archetypes');
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

    return loadFromBundledLocal<RegistryItem>('archetypes', id);
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

    const bundledResult = loadFromBundledLocal<{ items: RegistryItem[]; total: number }>('blueprints');
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

    const bundledResult = loadFromBundledLocal<RegistryItem>('blueprints', id);
    if (bundledResult) return bundledResult;

    // Try local bundled (for CLI distribution)
    return loadFromBundledLocal<RegistryItem>('blueprints', id);
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

    const bundledResult = loadFromBundledLocal<{ items: RegistryItem[]; total: number }>('themes');
    if (bundledResult) return bundledResult;

    return {
      data: { items: [], total: 0 },
      source: { type: 'bundled' },
    };
  }

  /**
   * Fetch a single theme.
   */
  async fetchTheme(id: string): Promise<FetchResult<RegistryItem> | null> {
    // Check for custom: prefix
    if (id.startsWith('custom:')) {
      return this.loadCustomContent<RegistryItem>('themes', id.slice(7));
    }

    if (!this.offline) {
      const apiResult = await tryApi<RegistryItem>(`themes/${id}`, this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'themes', id, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<RegistryItem>(this.cacheDir, 'themes', id);
    if (cacheResult) return cacheResult;

    const bundledResult = loadFromBundledLocal<RegistryItem>('themes', id);
    if (bundledResult) return bundledResult;

    // Try local bundled (for CLI distribution)
    return loadFromBundledLocal<RegistryItem>('themes', id);
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

    const bundledResult = loadFromBundledLocal<{ items: RegistryItem[]; total: number }>('patterns');
    if (bundledResult) return bundledResult;

    return {
      data: { items: [], total: 0 },
      source: { type: 'bundled' },
    };
  }

  /**
   * Fetch shells list.
   */
  async fetchShells(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    if (!this.offline) {
      const apiResult = await tryApi<{ items: RegistryItem[]; total: number }>('shells', this.apiUrl);
      if (apiResult) {
        saveToCache(this.cacheDir, 'shells', null, apiResult.data);
        return apiResult;
      }
    }

    const cacheResult = loadFromCache<{ items: RegistryItem[]; total: number }>(
      this.cacheDir,
      'shells'
    );
    if (cacheResult) return cacheResult;

    const bundledResult = loadFromBundledLocal<{ items: RegistryItem[]; total: number }>('shells');
    if (bundledResult) return bundledResult;

    const localBundled = loadFromBundledLocal<{ items: RegistryItem[]; total: number }>('shells');
    if (localBundled) return localBundled;

    return {
      data: { items: [], total: 0 },
      source: { type: 'bundled' },
    };
  }

  /**
   * Fetch a single shell.
   * Note: API only has /shells list endpoint, not /shells/{id}, so we fetch all and filter.
   */
  async fetchShell(id: string): Promise<FetchResult<RegistryItem> | null> {
    // Try API - fetch all shells and find the matching one
    if (!this.offline) {
      const apiResult = await tryApi<{ items: RegistryItem[]; total: number }>('shells', this.apiUrl);
      if (apiResult) {
        const shell = apiResult.data.items.find(s => s.id === id);
        if (shell) {
          saveToCache(this.cacheDir, 'shells', id, shell);
          return { data: shell, source: apiResult.source };
        }
      }
    }

    // Try cache
    const cacheResult = loadFromCache<RegistryItem>(this.cacheDir, 'shells', id);
    if (cacheResult) return cacheResult;

    // Try bundled
    const bundledResult = loadFromBundledLocal<RegistryItem>('shells', id);
    if (bundledResult) return bundledResult;

    return null;
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
  projectRoot?: string;
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
  const types = ['archetypes', 'blueprints', 'themes', 'patterns', 'shells'] as const;

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
