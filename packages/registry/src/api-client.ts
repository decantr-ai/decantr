import type {
  Pattern,
  Archetype,
  Theme,
  Blueprint,
  Shell,
  ApiContentType,
  ContentListResponse,
  PublicContentSummary,
  PublicContentRecord,
  ContentItem,
  OwnedContentSummary,
  PublishPayload,
  PublishResponse,
  SearchParams,
  SearchResponse,
  RegistryIntelligenceSummaryResponse,
  UserProfile,
  PublicUserProfile,
  ShowcaseManifestResponse,
  ShowcaseShortlistResponse,
  ShowcaseShortlistReport,
  HostedFileCritiqueRequest,
  HostedProjectAuditRequest,
  FileCritiqueReport,
  ProjectAuditReport,
  ExecutionPackManifest,
  ExecutionPackBundleResponse,
  HostedSelectedExecutionPackRequest,
  SelectedExecutionPackResponse,
} from './types.js';
import type { EssenceFile } from '@decantr/essence-spec';

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
  accessToken?: string;
  timeoutMs?: number;
  cacheTtlMs?: number;
}

export class RegistryAPIError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'RegistryAPIError';
    this.status = status;
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class RegistryAPIClient {
  private baseUrl: string;
  private apiKey: string | undefined;
  private accessToken: string | undefined;
  private timeoutMs: number;
  private cacheTtlMs: number;
  private cache = new Map<string, CacheEntry<unknown>>();

  constructor(options: RegistryAPIClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.apiKey = options.apiKey;
    this.accessToken = options.accessToken;
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
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
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
      const bodyText = await response.text().catch(() => '');
      let details: unknown;
      let message = response.statusText;

      if (bodyText) {
        try {
          details = JSON.parse(bodyText) as unknown;
          if (isRecord(details) && typeof details.error === 'string') {
            message = details.error;
          } else {
            message = bodyText;
          }
        } catch {
          message = bodyText;
        }
      }

      throw new RegistryAPIError(response.status, `API ${response.status}: ${message}`, details);
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
    params?: {
      namespace?: string;
      source?: SearchParams['source'];
      sort?: string;
      recommended?: boolean;
      intelligenceSource?: SearchParams['intelligenceSource'];
      limit?: number;
      offset?: number;
    }
  ): Promise<ContentListResponse<T>> {
    const cacheKey = `list:${type}:${JSON.stringify(params ?? {})}`;
    const cached = this.getCached<ContentListResponse<T>>(cacheKey);
    if (cached) return cached;

    const searchParams = new URLSearchParams();
    if (params?.namespace) searchParams.set('namespace', params.namespace);
    if (params?.source) searchParams.set('source', params.source);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.recommended) searchParams.set('recommended', 'true');
    if (params?.intelligenceSource) searchParams.set('intelligence_source', params.intelligenceSource);
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

  async getPublicContentRecord<TData = Record<string, unknown>>(
    type: ApiContentType,
    namespace: string,
    slug: string,
  ): Promise<PublicContentRecord<TData>> {
    const cacheKey = `public-record:${type}:${namespace}:${slug}`;
    const cached = this.getCached<PublicContentRecord<TData>>(cacheKey);
    if (cached) return cached;

    const result = await this.request<PublicContentRecord<TData>>(`/${type}/${namespace}/${slug}`);
    this.setCache(cacheKey, result);
    return result;
  }

  async getContentRecord<TData = Record<string, unknown>>(
    type: ApiContentType,
    namespace: string,
    slug: string,
  ): Promise<PublicContentRecord<TData>> {
    const cacheKey = `content-record:${type}:${namespace}:${slug}:${this.apiKey ?? ''}:${this.accessToken ?? ''}`;
    const cached = this.getCached<PublicContentRecord<TData>>(cacheKey);
    if (cached) return cached;

    const result = await this.request<PublicContentRecord<TData>>(`/${type}/${namespace}/${slug}`);
    this.setCache(cacheKey, result);
    return result;
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
    if (params.source) searchParams.set('source', params.source);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.recommended) searchParams.set('recommended', 'true');
    if (params.intelligenceSource) searchParams.set('intelligence_source', params.intelligenceSource);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    return this.request<SearchResponse>(`/search?${searchParams}`);
  }

  async getPublicUserProfile(username: string): Promise<PublicUserProfile> {
    const cacheKey = `public-user:${username}`;
    const cached = this.getCached<PublicUserProfile>(cacheKey);
    if (cached) return cached;

    const result = await this.request<PublicUserProfile>(`/users/${encodeURIComponent(username)}`);
    this.setCache(cacheKey, result);
    return result;
  }

  async getPublicUserContent(
    username: string,
    params?: {
      type?: string;
      source?: SearchParams['source'];
      sort?: string;
      recommended?: boolean;
      intelligenceSource?: SearchParams['intelligenceSource'];
      limit?: number;
      offset?: number;
    },
  ): Promise<ContentListResponse<PublicContentSummary>> {
    const cacheKey = `public-user-content:${username}:${JSON.stringify(params ?? {})}`;
    const cached = this.getCached<ContentListResponse<PublicContentSummary>>(cacheKey);
    if (cached) return cached;

    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.source) searchParams.set('source', params.source);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.recommended) searchParams.set('recommended', 'true');
    if (params?.intelligenceSource) searchParams.set('intelligence_source', params.intelligenceSource);
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    if (params?.offset != null) searchParams.set('offset', String(params.offset));

    const query = searchParams.toString();
    const result = await this.request<ContentListResponse<PublicContentSummary>>(
      `/users/${encodeURIComponent(username)}/content${query ? `?${query}` : ''}`,
    );
    this.setCache(cacheKey, result);
    return result;
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

  async getMyContent(): Promise<ContentListResponse<OwnedContentSummary>> {
    return this.request<ContentListResponse<OwnedContentSummary>>('/my/content');
  }

  async getAccessiblePrivateContent(
    params?: {
      type?: string;
      scope?: 'all' | 'personal' | 'organization';
      q?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<ContentListResponse<OwnedContentSummary>> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.scope) searchParams.set('scope', params.scope);
    if (params?.q) searchParams.set('q', params.q);
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    if (params?.offset != null) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();

    return this.request<ContentListResponse<OwnedContentSummary>>(
      `/private/content${query ? `?${query}` : ''}`,
    );
  }

  // ── Schema ──

  async getSchema(name: string = 'essence.v3.json'): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/schema/${name}`);
  }

  // ── Showcase benchmarks ──

  async getShowcaseManifest(): Promise<ShowcaseManifestResponse> {
    const cacheKey = 'showcase:manifest';
    const cached = this.getCached<ShowcaseManifestResponse>(cacheKey);
    if (cached) return cached;

    const result = await this.request<ShowcaseManifestResponse>('/showcase/manifest');
    this.setCache(cacheKey, result);
    return result;
  }

  async getShowcaseShortlist(): Promise<ShowcaseShortlistResponse> {
    const cacheKey = 'showcase:shortlist';
    const cached = this.getCached<ShowcaseShortlistResponse>(cacheKey);
    if (cached) return cached;

    const result = await this.request<ShowcaseShortlistResponse>('/showcase/shortlist');
    this.setCache(cacheKey, result);
    return result;
  }

  async getShowcaseShortlistVerification(): Promise<ShowcaseShortlistReport> {
    const cacheKey = 'showcase:shortlist-verification';
    const cached = this.getCached<ShowcaseShortlistReport>(cacheKey);
    if (cached) return cached;

    const result = await this.request<ShowcaseShortlistReport>('/showcase/shortlist-verification');
    this.setCache(cacheKey, result);
    return result;
  }

  async getRegistryIntelligenceSummary(
    params?: { namespace?: string },
  ): Promise<RegistryIntelligenceSummaryResponse> {
    const cacheKey = `registry-intelligence-summary:${JSON.stringify(params ?? {})}`;
    const cached = this.getCached<RegistryIntelligenceSummaryResponse>(cacheKey);
    if (cached) return cached;

    const searchParams = new URLSearchParams();
    if (params?.namespace) searchParams.set('namespace', params.namespace);
    const query = searchParams.toString();
    const result = await this.request<RegistryIntelligenceSummaryResponse>(
      `/intelligence/summary${query ? `?${query}` : ''}`,
    );
    this.setCache(cacheKey, result);
    return result;
  }

  async compileExecutionPacks(
    essence: EssenceFile,
    params?: { namespace?: string },
  ): Promise<ExecutionPackBundleResponse> {
    const searchParams = new URLSearchParams();
    if (params?.namespace) searchParams.set('namespace', params.namespace);
    const query = searchParams.toString();

    return this.request<ExecutionPackBundleResponse>(
      `/packs/compile${query ? `?${query}` : ''}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(essence),
      },
    );
  }

  async selectExecutionPack(
    input: HostedSelectedExecutionPackRequest,
    params?: { namespace?: string },
  ): Promise<SelectedExecutionPackResponse> {
    const searchParams = new URLSearchParams();
    if (params?.namespace) searchParams.set('namespace', params.namespace);
    const query = searchParams.toString();

    return this.request<SelectedExecutionPackResponse>(
      `/packs/select${query ? `?${query}` : ''}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
    );
  }

  async getExecutionPackManifest(
    essence: EssenceFile,
    params?: { namespace?: string },
  ): Promise<ExecutionPackManifest> {
    const selected = await this.selectExecutionPack(
      {
        essence,
        pack_type: 'scaffold',
      },
      params,
    );

    return selected.manifest;
  }

  async critiqueFile(
    input: HostedFileCritiqueRequest,
    params?: { namespace?: string },
  ): Promise<FileCritiqueReport> {
    const searchParams = new URLSearchParams();
    if (params?.namespace) searchParams.set('namespace', params.namespace);
    const query = searchParams.toString();

    return this.request<FileCritiqueReport>(
      `/critique/file${query ? `?${query}` : ''}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
    );
  }

  async auditProject(
    input: HostedProjectAuditRequest,
    params?: { namespace?: string },
  ): Promise<ProjectAuditReport> {
    const searchParams = new URLSearchParams();
    if (params?.namespace) searchParams.set('namespace', params.namespace);
    const query = searchParams.toString();

    return this.request<ProjectAuditReport>(
      `/audit/project${query ? `?${query}` : ''}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
    );
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
