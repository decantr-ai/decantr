import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryAPIClient } from '@decantr/registry';
import type { ApiContentType } from '@decantr/registry';

export interface RegistryItem {
  id: string;
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export interface RegistrySource {
  type: 'api' | 'cache' | 'custom';
  url?: string;
  path?: string;
}

export interface FetchResult<T> {
  data: T;
  source: RegistrySource;
}

const DEFAULT_API_URL = 'https://api.decantr.ai/v1';

/**
 * Content types that support custom overrides in .decantr/custom/
 */
const ALL_CONTENT_TYPES = ['themes', 'patterns', 'recipes', 'blueprints', 'archetypes', 'shells'] as const;

/**
 * Load data from cache at .decantr/cache/{namespace}/{type}/
 */
function loadFromCache<T>(
  cacheDir: string,
  contentType: string,
  id?: string,
  namespace?: string
): FetchResult<T> | null {
  const nsDir = namespace ? join(cacheDir, namespace) : cacheDir;
  const cachePath = id
    ? join(nsDir, contentType, `${id}.json`)
    : join(nsDir, contentType, 'index.json');

  if (!existsSync(cachePath)) return null;

  try {
    const data = JSON.parse(readFileSync(cachePath, 'utf-8')) as T;
    return { data, source: { type: 'cache' } };
  } catch {
    return null;
  }
}

/**
 * Save data to cache at .decantr/cache/{namespace}/{type}/
 */
function saveToCache(
  cacheDir: string,
  contentType: string,
  id: string | null,
  data: unknown,
  namespace: string = '@official'
): void {
  const dir = join(cacheDir, namespace, contentType);
  mkdirSync(dir, { recursive: true });

  const cachePath = id
    ? join(dir, `${id}.json`)
    : join(dir, 'index.json');

  writeFileSync(cachePath, JSON.stringify(data, null, 2));
}

/**
 * Registry client with resolution order: Custom -> API -> Cache
 *
 * - .decantr/custom/{type}/{id}.json is NEVER auto-synced
 * - API is the primary source
 * - .decantr/cache/{namespace}/{type}/ is the offline fallback
 * - No bundled content
 */
export class RegistryClient {
  private cacheDir: string;
  private apiUrl: string;
  private offline: boolean;
  private projectRoot: string;
  private apiClient: RegistryAPIClient;

  constructor(options: {
    cacheDir?: string;
    apiUrl?: string;
    apiKey?: string;
    offline?: boolean;
    projectRoot?: string;
  } = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.cacheDir = options.cacheDir || join(this.projectRoot, '.decantr', 'cache');
    this.apiUrl = options.apiUrl || DEFAULT_API_URL;
    this.offline = options.offline || false;
    this.apiClient = new RegistryAPIClient({
      baseUrl: this.apiUrl,
      apiKey: options.apiKey,
    });
  }

  /**
   * Load content from .decantr/custom/{contentType}/{id}.json
   * Works for ALL content types, not just themes.
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

    if (!existsSync(customPath)) return null;

    try {
      const data = JSON.parse(readFileSync(customPath, 'utf-8')) as T;
      return { data, source: { type: 'custom', path: customPath } };
    } catch {
      return null;
    }
  }

  /**
   * List all custom content of a given type from .decantr/custom/{type}/
   */
  listCustomContent(contentType: string): RegistryItem[] {
    const dir = join(this.projectRoot, '.decantr', 'custom', contentType);
    if (!existsSync(dir)) return [];

    try {
      return readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
          return { id: data.id || f.replace('.json', ''), ...data };
        });
    } catch {
      return [];
    }
  }

  /**
   * Unified fetch for a content list.
   * Resolution: API -> Cache. Custom items are merged into the list.
   */
  async fetchContentList(
    contentType: ApiContentType,
    namespace?: string
  ): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    let apiItems: RegistryItem[] = [];
    let source: RegistrySource = { type: 'cache' };

    // Try API first
    if (!this.offline) {
      try {
        const apiResult = await this.apiClient.listContent<RegistryItem>(contentType, { namespace });
        apiItems = apiResult.items;
        source = { type: 'api', url: this.apiUrl };
        // Cache the result
        saveToCache(this.cacheDir, contentType, null, apiResult, namespace || '@official');
      } catch {
        // API failed, fall through to cache
      }
    }

    // If no API result, try cache
    if (apiItems.length === 0) {
      const cacheResult = loadFromCache<{ items: RegistryItem[]; total: number }>(
        this.cacheDir,
        contentType,
        undefined,
        namespace
      );
      if (cacheResult) {
        apiItems = cacheResult.data.items;
        source = { type: 'cache' };
      }
    }

    // Merge custom content (prepended so they appear first)
    const customItems = this.listCustomContent(contentType);
    const allItems = [...customItems, ...apiItems];

    return {
      data: { items: allItems, total: allItems.length },
      source,
    };
  }

  /**
   * Unified fetch for a single content item.
   * Resolution: Custom -> API -> Cache
   */
  async fetchContentItem(
    contentType: ApiContentType,
    id: string,
    namespace: string = '@official'
  ): Promise<FetchResult<RegistryItem> | null> {
    // 1. Check custom content first (strip "custom:" prefix if present)
    const customId = id.startsWith('custom:') ? id.slice(7) : id;
    const customResult = this.loadCustomContent<RegistryItem>(contentType, customId);
    if (customResult) return customResult;

    // If the id had "custom:" prefix and we didn't find it, return null
    if (id.startsWith('custom:')) return null;

    // 2. Try API
    if (!this.offline) {
      try {
        const data = await this.apiClient.getContent<RegistryItem>(contentType, namespace, id);
        saveToCache(this.cacheDir, contentType, id, data, namespace);
        return { data, source: { type: 'api', url: this.apiUrl } };
      } catch {
        // API failed, fall through to cache
      }
    }

    // 3. Try cache
    return loadFromCache<RegistryItem>(this.cacheDir, contentType, id, namespace);
  }

  // ── Convenience methods (delegate to unified fetch) ──

  async fetchArchetypes(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    return this.fetchContentList('archetypes');
  }

  async fetchArchetype(id: string): Promise<FetchResult<RegistryItem> | null> {
    return this.fetchContentItem('archetypes', id);
  }

  async fetchBlueprints(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    return this.fetchContentList('blueprints');
  }

  async fetchBlueprint(id: string): Promise<FetchResult<RegistryItem> | null> {
    return this.fetchContentItem('blueprints', id);
  }

  async fetchThemes(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    return this.fetchContentList('themes');
  }

  async fetchTheme(id: string): Promise<FetchResult<RegistryItem> | null> {
    return this.fetchContentItem('themes', id);
  }

  async fetchPatterns(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    return this.fetchContentList('patterns');
  }

  async fetchPattern(id: string): Promise<FetchResult<RegistryItem> | null> {
    return this.fetchContentItem('patterns', id);
  }

  async fetchShells(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    return this.fetchContentList('shells');
  }

  async fetchShell(id: string): Promise<FetchResult<RegistryItem> | null> {
    return this.fetchContentItem('shells', id);
  }

  async fetchRecipes(): Promise<FetchResult<{ items: RegistryItem[]; total: number }>> {
    return this.fetchContentList('recipes');
  }

  async fetchRecipe(id: string): Promise<FetchResult<RegistryItem> | null> {
    return this.fetchContentItem('recipes', id);
  }

  /**
   * Check if API is available.
   */
  async checkApiAvailability(): Promise<boolean> {
    if (this.offline) return false;
    return this.apiClient.checkHealth();
  }
}

/**
 * Create a registry client with default options.
 */
export function createRegistryClient(options?: {
  cacheDir?: string;
  apiUrl?: string;
  apiKey?: string;
  offline?: boolean;
  projectRoot?: string;
}): RegistryClient {
  return new RegistryClient(options);
}

/**
 * Sync registry content to .decantr/cache/.
 * NEVER touches .decantr/custom/.
 */
export async function syncRegistry(
  cacheDir: string,
  apiUrl: string = DEFAULT_API_URL
): Promise<{
  synced: string[];
  failed: string[];
}> {
  const apiClient = new RegistryAPIClient({ baseUrl: apiUrl });
  const synced: string[] = [];
  const failed: string[] = [];

  // Check if API is available
  const healthy = await apiClient.checkHealth();
  if (!healthy) {
    return { synced: [], failed: ['API unavailable'] };
  }

  // Sync each content type — only writes to cache, never custom
  for (const type of ALL_CONTENT_TYPES) {
    try {
      const result = await apiClient.listContent(type, { namespace: '@official' });
      saveToCache(cacheDir, type, null, result, '@official');

      // Also cache individual items
      for (const item of result.items) {
        const id = (item as Record<string, unknown>).id as string
          || (item as Record<string, unknown>).slug as string;
        if (id) {
          saveToCache(cacheDir, type, id, item, '@official');
        }
      }

      synced.push(type);
    } catch {
      failed.push(type);
    }
  }

  return { synced, failed };
}
