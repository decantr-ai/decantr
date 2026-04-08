import type {
  Pattern,
  Archetype,
  Theme,
  Blueprint,
  Shell,
  ApiContentType,
  ContentListResponse,
  ContentItem,
  PublishPayload,
  PublishResponse,
  SearchParams,
  SearchResponse,
  UserProfile,
} from './types.js';

const DEFAULT_BASE_URL = 'https://api.decantr.ai/v1';
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function unwrapDataEnvelope<T>(value: T): T {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    return value.data as T;
  }
  return value;
}

export interface RegistryAPIClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
  cacheTtlMs?: number;
}

export class RegistryAPIClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  private timeoutMs: number;
  private cacheTtlMs: number;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(options: RegistryAPIClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  }

  // ── HTTP helpers ──

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    return headers;
  }

  private async fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetchWithTimeout(url, {
      ...init,
      headers: { ...this.buildHeaders(), ...init?.headers },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`API ${response.status}: ${body || response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  // ── Cache helpers ──

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.cacheTtlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // ── Health ──

  async checkHealth(): Promise<boolean> {
    try {
      const url = this.baseUrl.replace(/\/v1$/, '/health');
      const response = await this.fetchWithTimeout(url);
      return response.ok;
    } catch {
      return false;
    }
  }

  // ── Content fetching (public) ──

  async listContent<T = Record<string, unknown>>(
    type: ApiContentType,
    params?: { namespace?: string; limit?: number; offset?: number }
  ): Promise<ContentListResponse<T>> {
    const cacheKey = `list:${type}:${JSON.stringify(params ?? {})}`;
    const cached = this.getCached<ContentListResponse<T>>(cacheKey);
    if (cached) return cached;

    const searchParams = new URLSearchParams();
    if (params?.namespace) searchParams.set('namespace', params.namespace);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));

    const query = searchParams.toString();
    const path = `/${type}${query ? `?${query}` : ''}`;
    const result = await this.request<ContentListResponse<T>>(path);
    this.setCache(cacheKey, result);
    return result;
  }

  async getContent<T = Record<string, unknown>>(
    type: ApiContentType,
    namespace: string,
    slug: string
  ): Promise<T> {
    const cacheKey = `get:${type}:${namespace}:${slug}`;
    const cached = this.getCached<T>(cacheKey);
    if (cached) return cached;

    const raw = await this.request<T>(`/${type}/${namespace}/${slug}`);
    // API returns { id, type, slug, data: {...actual content...} } — unwrap
    const unwrapped = unwrapDataEnvelope(raw);
    this.setCache(cacheKey, unwrapped);
    return unwrapped;
  }

  // ── Typed convenience methods ──

  async getPattern(namespace: string, slug: string): Promise<Pattern> {
    return this.getContent<Pattern>('patterns', namespace, slug);
  }

  async getArchetype(namespace: string, slug: string): Promise<Archetype> {
    return this.getContent<Archetype>('archetypes', namespace, slug);
  }

  async getTheme(namespace: string, slug: string): Promise<Theme> {
    return this.getContent<Theme>('themes', namespace, slug);
  }

  async getBlueprint(namespace: string, slug: string): Promise<Blueprint> {
    return this.getContent<Blueprint>('blueprints', namespace, slug);
  }

  async getShell(namespace: string, slug: string): Promise<Shell> {
    return this.getContent<Shell>('shells', namespace, slug);
  }

  // ── Search ──

  async search(params: SearchParams): Promise<SearchResponse> {
    const searchParams = new URLSearchParams({ q: params.q });
    if (params.type) searchParams.set('type', params.type);
    if (params.namespace) searchParams.set('namespace', params.namespace);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    return this.request<SearchResponse>(`/search?${searchParams}`);
  }

  // ── Authenticated endpoints ──

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/me');
  }

  async publishContent(payload: PublishPayload): Promise<PublishResponse> {
    return this.request<PublishResponse>('/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async getMyContent(): Promise<ContentListResponse<ContentItem>> {
    return this.request<ContentListResponse<ContentItem>>('/my/content');
  }

  // ── Schema ──

  async getSchema(name: string = 'essence.v3.json'): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/schema/${name}`);
  }
}

// ── Lightweight registry client (merged from client.ts) ──

export interface RegistryClientOptions {
  baseUrl?: string;
}

export interface SearchResult {
  id: string;
  type: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
}

export interface RegistryClient {
  search(query: string, type?: string): Promise<SearchResult[]>;
  fetch(type: string, id: string, version?: string): Promise<unknown>;
}

export function createRegistryClient(options: RegistryClientOptions = {}): RegistryClient {
  const baseUrl = options.baseUrl ?? 'https://api.decantr.ai/v1';
  return {
    async search(query: string, type?: string): Promise<SearchResult[]> {
      const params = new URLSearchParams({ q: query });
      if (type) params.set('type', type);
      const res = await fetch(`${baseUrl}/search?${params}`);
      if (!res.ok) return [];
      const data = await res.json() as { results?: SearchResult[]; total?: number } | SearchResult[];
      // API returns { total, results } wrapper
      if (Array.isArray(data)) return data;
      return (data as { results: SearchResult[] }).results ?? [];
    },
    async fetch(type: string, id: string, version?: string): Promise<unknown> {
      const url = version ? `${baseUrl}/content/${type}/${id}/${version}` : `${baseUrl}/content/${type}/${id}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return res.json();
    },
  };
}
