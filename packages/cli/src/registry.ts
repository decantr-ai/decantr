import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryAPIClient } from '@decantr/registry';
import type { ApiContentType, Archetype, Blueprint, Pattern, Shell, Theme } from '@decantr/registry';

type RegistryContentMap = {
  patterns: Pattern;
  archetypes: Archetype;
  themes: Theme;
  blueprints: Blueprint;
  shells: Shell;
};

export type RegistryItem = RegistryContentMap[ApiContentType];

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
const ALL_CONTENT_TYPES = ['themes', 'patterns', 'blueprints', 'archetypes', 'shells'] as const;

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
  listCustomContent<T extends ApiContentType>(contentType: T): RegistryContentMap[T][] {
    const dir = join(this.projectRoot, '.decantr', 'custom', contentType);
    if (!existsSync(dir)) return [];

    try {
      return readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const data = JSON.parse(readFileSync(join(dir, f), 'utf-8')) as RegistryContentMap[T];
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
  async fetchContentList<T extends ApiContentType>(
    contentType: T,
    namespace?: string
  ): Promise<FetchResult<{ items: RegistryContentMap[T][]; total: number }>> {
    let apiItems: RegistryContentMap[T][] = [];
    let source: RegistrySource = { type: 'cache' };

    // Try API first
    if (!this.offline) {
      try {
        const apiResult = await this.apiClient.listContent<RegistryContentMap[T]>(contentType, { namespace });
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
      const cacheResult = loadFromCache<{ items: RegistryContentMap[T][]; total: number }>(
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
  async fetchContentItem<T extends ApiContentType>(
    contentType: T,
    id: string,
    namespace: string = '@official'
  ): Promise<FetchResult<RegistryContentMap[T]> | null> {
    // 1. Check custom content first (strip "custom:" prefix if present)
    const customId = id.startsWith('custom:') ? id.slice(7) : id;
    const customResult = this.loadCustomContent<RegistryContentMap[T]>(contentType, customId);
    if (customResult) return customResult;

    // If the id had "custom:" prefix and we didn't find it, return null
    if (id.startsWith('custom:')) return null;

    // 2. Try API (with one retry on failure)
    if (!this.offline) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const data = await this.apiClient.getContent<RegistryContentMap[T]>(contentType, namespace, id);
          saveToCache(this.cacheDir, contentType, id, data, namespace);
          return { data, source: { type: 'api', url: this.apiUrl } };
        } catch (e) {
          if (process.env.DECANTR_DEBUG) {
            console.error(`  [debug] API fetch ${attempt === 0 ? 'failed' : 'retry failed'} for ${contentType}/${namespace}/${id}: ${(e as Error).message}`);
          }
          if (attempt === 0) {
            // Brief pause before retry
            await new Promise(r => setTimeout(r, 500));
          }
        }
      }
    } else if (process.env.DECANTR_DEBUG) {
      console.error(`  [debug] Skipping API (offline mode) for ${contentType}/${namespace}/${id}`);
    }

    // 3. Try cache
    return loadFromCache<RegistryContentMap[T]>(this.cacheDir, contentType, id, namespace);
  }

  // ── Convenience methods (delegate to unified fetch) ──

  async fetchArchetypes(): Promise<FetchResult<{ items: Archetype[]; total: number }>> {
    return this.fetchContentList('archetypes');
  }

  async fetchArchetype(id: string): Promise<FetchResult<Archetype> | null> {
    return this.fetchContentItem('archetypes', id);
  }

  async fetchBlueprints(): Promise<FetchResult<{ items: Blueprint[]; total: number }>> {
    return this.fetchContentList('blueprints');
  }

  async fetchBlueprint(id: string): Promise<FetchResult<Blueprint> | null> {
    return this.fetchContentItem('blueprints', id);
  }

  async fetchThemes(): Promise<FetchResult<{ items: Theme[]; total: number }>> {
    return this.fetchContentList('themes');
  }

  async fetchTheme(id: string): Promise<FetchResult<Theme> | null> {
    return this.fetchContentItem('themes', id);
  }

  async fetchPatterns(): Promise<FetchResult<{ items: Pattern[]; total: number }>> {
    return this.fetchContentList('patterns');
  }

  async fetchPattern(id: string): Promise<FetchResult<Pattern> | null> {
    return this.fetchContentItem('patterns', id);
  }

  async fetchShells(): Promise<FetchResult<{ items: Shell[]; total: number }>> {
    return this.fetchContentList('shells');
  }

  async fetchShell(id: string): Promise<FetchResult<Shell> | null> {
    return this.fetchContentItem('shells', id);
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

      // Cache individual items by slug.
      // The list endpoint returns abbreviated items (no inner 'data' field),
      // but that's OK — fetchContentItem will hit the API for full data when needed.
      for (const item of result.items) {
        const slug = (item as Record<string, unknown>).slug as string;
        const data = (item as Record<string, unknown>).data as Record<string, unknown> | undefined;
        const innerSlug = data?.id as string || data?.slug as string;
        const cacheKey = slug || innerSlug || (item as Record<string, unknown>).id as string;
        if (cacheKey) {
          saveToCache(cacheDir, type, cacheKey, item, '@official');
        }
      }

      synced.push(type);
    } catch {
      failed.push(type);
    }
  }

  return { synced, failed };
}
