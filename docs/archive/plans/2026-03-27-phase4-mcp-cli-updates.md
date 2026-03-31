# Phase 4: MCP Server + CLI Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace local file-based content resolution with API-first architecture. Both the MCP server and CLI resolve content from the registry API via a shared `RegistryAPIClient` in `@decantr/registry`. Remove bundled content fallback. Add auth commands (`login`, `logout`, `publish`) to the CLI. Update `decantr init` for offline minimal boilerplate.

**Architecture:** Shared `RegistryAPIClient` in `@decantr/registry` provides typed API access with in-memory caching. MCP server drops `ContentResolver` (local files) and uses the API client. CLI drops bundled content and uses resolution order: `.decantr/custom/` -> API -> `.decantr/cache/`. Custom content support extends to all content types (not just themes).

**Tech Stack:** TypeScript, Node.js, Hono API (already deployed from Phase 2)

**Spec:** `docs/specs/2026-03-27-registry-platform-design.md` (section: "MCP Server + CLI")

**API Base URL:** `https://api.decantr.ai/v1` (new canonical URL from spec, replacing `https://decantr-registry.fly.dev/v1`)

---

## Task 1: Create Shared `RegistryAPIClient` in `@decantr/registry`

Add a new `RegistryAPIClient` class to the `@decantr/registry` package. This is the single API client used by both MCP server and CLI. It handles fetching, caching, and authentication.

### Files to create/modify

- **Create:** `packages/registry/src/api-client.ts`
- **Modify:** `packages/registry/src/types.ts` (add new types)
- **Modify:** `packages/registry/src/index.ts` (export new client)

### Steps

- [ ] **1.1** Add new types to `packages/registry/src/types.ts`. Append the following after the existing `Theme` interface:

```typescript
// --- API Client Types ---

export type ApiContentType = 'patterns' | 'recipes' | 'themes' | 'blueprints' | 'archetypes' | 'shells';

export interface ContentListResponse<T = Record<string, unknown>> {
  items: T[];
  total: number;
}

export interface ContentItem {
  id: string;
  slug: string;
  namespace: string;
  type: string;
  version: string;
  data: Record<string, unknown>;
  visibility: 'public' | 'private';
  status: 'pending' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface PublishPayload {
  type: ApiContentType;
  slug: string;
  namespace: string;
  version: string;
  data: Record<string, unknown>;
  visibility?: 'public' | 'private';
}

export interface PublishResponse {
  id: string;
  slug: string;
  namespace: string;
  type: string;
  status: string;
}

export interface SearchParams {
  q: string;
  type?: string;
  namespace?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: Array<{
    id: string;
    type: string;
    slug: string;
    namespace: string;
    name: string;
    description: string;
    version: string;
  }>;
  total: number;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  reputation_score: number;
  trusted: boolean;
}
```

- [ ] **1.2** Create `packages/registry/src/api-client.ts`:

```typescript
import type {
  Pattern,
  Archetype,
  Recipe,
  Theme,
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
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
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

    const result = await this.request<T>(`/${type}/${namespace}/${slug}`);
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

  async getRecipe(namespace: string, slug: string): Promise<Recipe> {
    return this.getContent<Recipe>('recipes', namespace, slug);
  }

  async getTheme(namespace: string, slug: string): Promise<Theme> {
    return this.getContent<Theme>('themes', namespace, slug);
  }

  async getBlueprint(namespace: string, slug: string): Promise<Record<string, unknown>> {
    return this.getContent<Record<string, unknown>>('blueprints', namespace, slug);
  }

  async getShell(namespace: string, slug: string): Promise<Record<string, unknown>> {
    return this.getContent<Record<string, unknown>>('shells', namespace, slug);
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
```

- [ ] **1.3** Update `packages/registry/src/index.ts` to export the new client:

```typescript
export type {
  PatternPreset,
  PatternIO,
  Pattern,
  ArchetypePage,
  Archetype,
  RecipeSpatialHints,
  RecipeVisualEffects,
  RecipeShell,
  Recipe,
  ContentType,
  ResolvedContent,
  ApiContentType,
  ContentListResponse,
  ContentItem,
  PublishPayload,
  PublishResponse,
  SearchParams,
  SearchResponse,
  UserProfile,
} from './types.js';

export { createResolver } from './resolver.js';
export type { ResolverOptions, ContentResolver } from './resolver.js';

export { resolvePatternPreset } from './pattern.js';
export type { ResolvedPreset } from './pattern.js';

export { detectWirings, WIRING_RULES } from './wiring.js';
export type { HookType, WiringSignal, WiringRule, WiringResult } from './wiring.js';

export { createRegistryClient } from './client.js';
export type { RegistryClientOptions, SearchResult, RegistryClient } from './client.js';

export { RegistryAPIClient } from './api-client.js';
export type { RegistryAPIClientOptions } from './api-client.js';
```

### Run

```bash
cd packages/registry && pnpm build
```

### Commit

```
feat(registry): add RegistryAPIClient for API-first content resolution
```

---

## Task 2: Update MCP Server to Use `RegistryAPIClient`

Remove the broken local file-based `ContentResolver` from helpers.ts. Replace all content resolution in tools.ts with `RegistryAPIClient`. Support `DECANTR_API_KEY` and `DECANTR_API_URL` environment variables.

### Files to modify

- **Modify:** `packages/mcp-server/src/helpers.ts`
- **Modify:** `packages/mcp-server/src/tools.ts`

### Steps

- [ ] **2.1** Rewrite `packages/mcp-server/src/helpers.ts` to remove `ContentResolver` and provide the shared `RegistryAPIClient`:

```typescript
import { RegistryAPIClient } from '@decantr/registry';

const MAX_INPUT_LENGTH = 1000;

export function validateStringArg(args: Record<string, unknown>, field: string): string | null {
  const val = args[field];
  if (!val || typeof val !== 'string') {
    return `Required parameter "${field}" must be a non-empty string.`;
  }
  if (val.length > MAX_INPUT_LENGTH) {
    return `Parameter "${field}" exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`;
  }
  return null;
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 60 : 0;
}

let _apiClient: RegistryAPIClient | null = null;

export function getAPIClient(): RegistryAPIClient {
  if (!_apiClient) {
    _apiClient = new RegistryAPIClient({
      baseUrl: process.env.DECANTR_API_URL || undefined,
      apiKey: process.env.DECANTR_API_KEY || undefined,
    });
  }
  return _apiClient;
}

export function resetAPIClient(): void {
  _apiClient = null;
}
```

- [ ] **2.2** Rewrite `packages/mcp-server/src/tools.ts` to use `RegistryAPIClient` instead of `ContentResolver`. The tool definitions (TOOLS array) stay the same. Only the `handleTool` function changes.

Replace the entire `handleTool` function. Key changes:
- `decantr_resolve_pattern` uses `getAPIClient().getPattern()` instead of `getResolver().resolve('pattern', id)`
- `decantr_resolve_archetype` uses `getAPIClient().getArchetype()`
- `decantr_resolve_recipe` uses `getAPIClient().getRecipe()`
- `decantr_resolve_blueprint` uses `getAPIClient().getBlueprint()`
- `decantr_search_registry` uses `getAPIClient().search()`
- `decantr_suggest_patterns` uses `getAPIClient().listContent('patterns')` and filters locally
- `decantr_create_essence` uses `getAPIClient().getArchetype()` for the matched archetype

```typescript
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateEssence, evaluateGuard } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';
import { resolvePatternPreset } from '@decantr/registry';
import type { Pattern } from '@decantr/registry';
import { validateStringArg, fuzzyScore, getAPIClient } from './helpers.js';

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export const TOOLS = [
  {
    name: 'decantr_read_essence',
    title: 'Read Essence',
    description: 'Read and return the current decantr.essence.json file from the working directory.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Optional path to essence file. Defaults to ./decantr.essence.json.' },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_validate',
    title: 'Validate Essence',
    description: 'Validate a decantr.essence.json file against the schema and guard rules. Returns errors and warnings.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_search_registry',
    title: 'Search Registry',
    description: 'Search the Decantr community content registry for patterns, archetypes, recipes, and styles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (e.g. "kanban", "neon", "dashboard")' },
        type: { type: 'string', description: 'Filter by type: pattern, archetype, recipe, style' },
      },
      required: ['query'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_pattern',
    title: 'Resolve Pattern',
    description: 'Get full pattern details including layout spec, components, presets, and code examples.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Pattern ID (e.g. "hero", "data-table", "kpi-grid")' },
        preset: { type: 'string', description: 'Optional preset name (e.g. "product", "content")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_archetype',
    title: 'Resolve Archetype',
    description: 'Get archetype details including default pages, layouts, features, and suggested theme.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Archetype ID (e.g. "saas-dashboard", "ecommerce")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_recipe',
    title: 'Resolve Recipe',
    description: 'Get recipe decoration rules including shell styles, spatial hints, visual effects, and pattern preferences.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Recipe ID (e.g. "auradecantism")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_resolve_blueprint',
    title: 'Resolve Blueprint',
    description: 'Get a blueprint (app composition) with its archetype list, suggested theme, personality traits, and full page structure.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Blueprint ID (e.g. "saas-dashboard", "ecommerce", "portfolio")' },
        namespace: { type: 'string', description: 'Namespace (default: "@official")' },
      },
      required: ['id'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_suggest_patterns',
    title: 'Suggest Patterns',
    description: 'Given a page description, suggest appropriate patterns from the registry. Returns ranked pattern matches with layout specs and component lists.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: { type: 'string', description: 'Description of the page or section (e.g. "dashboard with metrics and charts", "settings form with toggles")' },
      },
      required: ['description'],
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_check_drift',
    title: 'Check Drift',
    description: 'Check if code changes violate the design intent captured in the Essence spec. Returns guard rule violations with severity and fix suggestions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Path to essence file. Defaults to ./decantr.essence.json.' },
        page_id: { type: 'string', description: 'Page ID being modified (e.g. "overview", "settings")' },
        components_used: {
          type: 'array' as const,
          items: { type: 'string' },
          description: 'List of component names used in the generated code',
        },
        theme_used: { type: 'string', description: 'Theme/style name used in the generated code' },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'decantr_create_essence',
    title: 'Create Essence',
    description: 'Generate a valid Essence spec skeleton from a project description. Returns a structured essence.json template based on the closest matching archetype and blueprint.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        description: { type: 'string', description: 'Natural language project description (e.g. "SaaS dashboard with analytics, user management, and billing")' },
        framework: { type: 'string', description: 'Target framework (e.g. "react", "vue", "svelte"). Defaults to "react".' },
      },
      required: ['description'],
    },
    annotations: READ_ONLY,
  },
];

export async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiClient = getAPIClient();

  switch (name) {
    case 'decantr_read_essence': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      try {
        const raw = await readFile(essencePath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        return { error: `Could not read essence file: ${(e as Error).message}` };
      }
    }

    case 'decantr_validate': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: unknown;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return { valid: false, errors: [`Could not read: ${(e as Error).message}`], guardViolations: [] };
      }
      const result = validateEssence(essence);

      let guardViolations: unknown[] = [];
      if (result.valid && typeof essence === 'object' && essence !== null) {
        try {
          guardViolations = evaluateGuard(essence as EssenceFile, {});
        } catch { /* guard evaluation is optional */ }
      }

      return { ...result, guardViolations };
    }

    case 'decantr_search_registry': {
      const err = validateStringArg(args, 'query');
      if (err) return { error: err };
      try {
        const response = await apiClient.search({
          q: args.query as string,
          type: args.type as string | undefined,
        });
        return {
          total: response.total,
          results: response.results.map((r) => ({
            type: r.type,
            id: r.slug,
            namespace: r.namespace,
            name: r.name,
            description: r.description,
            install: `decantr get ${r.type} ${r.slug}`,
          })),
        };
      } catch (e) {
        return { error: `Search failed: ${(e as Error).message}` };
      }
    }

    case 'decantr_resolve_pattern': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const pattern = await apiClient.getPattern(namespace, args.id as string);
        const result: Record<string, unknown> = { found: true, ...pattern };
        if (args.preset && typeof args.preset === 'string') {
          const preset = resolvePatternPreset(pattern as Pattern, args.preset);
          if (preset) result.resolvedPreset = preset;
        }
        return result;
      } catch {
        return { found: false, message: `Pattern "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_archetype': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const archetype = await apiClient.getArchetype(namespace, args.id as string);
        return { found: true, ...archetype };
      } catch {
        return { found: false, message: `Archetype "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_recipe': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const recipe = await apiClient.getRecipe(namespace, args.id as string);
        return { found: true, ...recipe };
      } catch {
        return { found: false, message: `Recipe "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_resolve_blueprint': {
      const err = validateStringArg(args, 'id');
      if (err) return { error: err };
      const namespace = (args.namespace as string) || '@official';
      try {
        const blueprint = await apiClient.getBlueprint(namespace, args.id as string);
        return { found: true, ...blueprint };
      } catch {
        return { found: false, message: `Blueprint "${args.id}" not found in ${namespace}.` };
      }
    }

    case 'decantr_suggest_patterns': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = (args.description as string).toLowerCase();

      try {
        const patternsResponse = await apiClient.listContent<Pattern>('patterns', {
          namespace: '@official',
          limit: 100,
        });

        const suggestions: { id: string; score: number; name: string; description: string; components: string[]; layout: string }[] = [];

        for (const p of patternsResponse.items) {
          const searchable = [
            p.name || '',
            p.description || '',
            ...(p.components || []),
            ...(p.tags || []),
          ].join(' ').toLowerCase();

          let score = 0;
          const words = desc.split(/\s+/);
          for (const word of words) {
            if (word.length < 3) continue;
            if (searchable.includes(word)) score += 10;
          }

          // Boost for common keyword associations
          if (desc.includes('dashboard') && ['kpi-grid', 'chart-grid', 'data-table', 'filter-bar'].includes(p.id)) score += 20;
          if (desc.includes('metric') && p.id === 'kpi-grid') score += 15;
          if (desc.includes('chart') && p.id === 'chart-grid') score += 15;
          if (desc.includes('table') && p.id === 'data-table') score += 15;
          if (desc.includes('form') && p.id === 'form-sections') score += 15;
          if (desc.includes('setting') && p.id === 'form-sections') score += 15;
          if (desc.includes('landing') && ['hero', 'cta-section', 'card-grid'].includes(p.id)) score += 20;
          if (desc.includes('hero') && p.id === 'hero') score += 20;
          if (desc.includes('ecommerce') && ['card-grid', 'filter-bar', 'detail-header'].includes(p.id)) score += 15;
          if (desc.includes('product') && p.id === 'card-grid') score += 15;
          if (desc.includes('feed') && p.id === 'activity-feed') score += 15;
          if (desc.includes('filter') && p.id === 'filter-bar') score += 15;
          if (desc.includes('search') && p.id === 'filter-bar') score += 10;

          if (score > 0) {
            const preset = p.presets ? Object.values(p.presets)[0] : null;
            suggestions.push({
              id: p.id,
              score,
              name: p.name || p.id,
              description: p.description || '',
              components: p.components || [],
              layout: preset?.layout ? preset.layout.layout : 'grid',
            });
          }
        }

        suggestions.sort((a, b) => b.score - a.score);

        return {
          query: args.description,
          suggestions: suggestions.slice(0, 5),
          total: suggestions.length,
        };
      } catch (e) {
        return { error: `Could not fetch patterns: ${(e as Error).message}` };
      }
    }

    case 'decantr_check_drift': {
      const essencePath = (args.path as string) || join(process.cwd(), 'decantr.essence.json');
      let essence: EssenceFile;
      try {
        essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      } catch (e) {
        return { error: `Could not read essence: ${(e as Error).message}` };
      }

      const validation = validateEssence(essence);
      if (!validation.valid) {
        return { drifted: true, reason: 'invalid_essence', errors: validation.errors };
      }

      const violations: { rule: string; severity: string; message: string }[] = [];

      if (args.theme_used && typeof args.theme_used === 'string') {
        const expectedTheme = (essence as Record<string, unknown>).theme as Record<string, string> | undefined;
        if (expectedTheme?.style && args.theme_used !== expectedTheme.style) {
          violations.push({
            rule: 'theme-match',
            severity: 'critical',
            message: `Theme drift: code uses "${args.theme_used}" but Essence specifies "${expectedTheme.style}". Do not switch themes.`,
          });
        }
      }

      if (args.page_id && typeof args.page_id === 'string') {
        const structure = (essence as Record<string, unknown>).structure as Array<{ id: string }> | undefined;
        if (structure && !structure.find(p => p.id === args.page_id)) {
          violations.push({
            rule: 'page-exists',
            severity: 'critical',
            message: `Page "${args.page_id}" not found in Essence structure. Add it to the Essence before generating code for it.`,
          });
        }
      }

      try {
        const guardViolations = evaluateGuard(essence, {
          pageId: args.page_id as string | undefined,
        });
        for (const gv of guardViolations) {
          violations.push({
            rule: (gv as Record<string, string>).rule || 'guard',
            severity: (gv as Record<string, string>).severity || 'warning',
            message: (gv as Record<string, string>).message || 'Guard violation',
          });
        }
      } catch { /* guard is optional */ }

      return {
        drifted: violations.length > 0,
        violations,
        checkedAgainst: essencePath,
      };
    }

    case 'decantr_create_essence': {
      const err = validateStringArg(args, 'description');
      if (err) return { error: err };
      const desc = (args.description as string).toLowerCase();
      const framework = (args.framework as string) || 'react';

      const archetypeScores: { id: string; score: number }[] = [];
      const archetypeIds = [
        'saas-dashboard', 'ecommerce', 'portfolio', 'content-site',
        'financial-dashboard', 'cloud-platform', 'gaming-platform',
        'ecommerce-admin', 'workbench',
      ];

      for (const id of archetypeIds) {
        let score = 0;
        if (desc.includes('dashboard') && id.includes('dashboard')) score += 20;
        if (desc.includes('saas') && id.includes('saas')) score += 20;
        if (desc.includes('ecommerce') && id.includes('ecommerce')) score += 20;
        if (desc.includes('shop') && id.includes('ecommerce')) score += 15;
        if (desc.includes('portfolio') && id.includes('portfolio')) score += 20;
        if (desc.includes('blog') && id.includes('content')) score += 15;
        if (desc.includes('content') && id.includes('content')) score += 15;
        if (desc.includes('finance') && id.includes('financial')) score += 20;
        if (desc.includes('cloud') && id.includes('cloud')) score += 15;
        if (desc.includes('game') && id.includes('gaming')) score += 15;
        if (desc.includes('admin') && id.includes('admin')) score += 15;
        if (desc.includes('analytics') && id.includes('dashboard')) score += 10;
        if (desc.includes('tool') && id === 'workbench') score += 10;
        if (score > 0) archetypeScores.push({ id, score });
      }

      archetypeScores.sort((a, b) => b.score - a.score);
      const bestMatch = archetypeScores[0]?.id || 'saas-dashboard';

      // Try to fetch archetype from API for richer skeleton
      let pages: Array<{ id: string; shell: string; default_layout: string[] }> | undefined;
      let features: string[] = [];

      try {
        const archetype = await apiClient.getArchetype('@official', bestMatch);
        pages = archetype.pages as Array<{ id: string; shell: string; default_layout: string[] }>;
        features = archetype.features || [];
      } catch {
        // API unavailable, use minimal defaults
      }

      const structure = (pages || [{ id: 'home', shell: 'full-bleed', default_layout: ['hero'] }]).map(p => ({
        id: p.id,
        shell: p.shell || 'sidebar-main',
        layout: p.default_layout || [],
      }));

      const essence = {
        version: '2.0.0',
        archetype: bestMatch,
        theme: {
          style: 'auradecantism',
          mode: 'dark',
          recipe: 'auradecantism',
          shape: 'rounded',
        },
        personality: ['professional'],
        platform: { type: 'spa', routing: 'hash' },
        structure,
        features,
        guard: { enforce_style: true, enforce_recipe: true, mode: 'strict' },
        density: { level: 'comfortable', content_gap: '_gap4' },
        target: framework,
        _generated: {
          matched_archetype: bestMatch,
          confidence: archetypeScores[0]?.score || 0,
          alternatives: archetypeScores.slice(1, 4).map(a => a.id),
          description: args.description,
        },
      };

      return {
        essence,
        archetype: bestMatch,
        instructions: `Save this as decantr.essence.json in your project root. Review the structure (pages, patterns) and adjust to match your needs. The guard rules will validate your code against this spec.`,
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}
```

### Run

```bash
cd packages/mcp-server && pnpm build
```

### Commit

```
feat(mcp-server): replace local ContentResolver with RegistryAPIClient
```

---

## Task 3: Update CLI `RegistryClient` to Use API-First Resolution with Custom Content for All Types

Rewrite `packages/cli/src/registry.ts` to remove bundled content fallback and implement the new resolution order: `.decantr/custom/` -> API -> `.decantr/cache/`. Extend custom content support to all content types (not just themes). Update `syncRegistry()` to only write to `.decantr/cache/` and never touch `.decantr/custom/`. Update the API URL to the new canonical `https://api.decantr.ai/v1`. Update `packages/cli/src/index.ts` to use the new API client for `cmdGet`, `cmdList`, and `cmdSync`.

### Files to modify

- **Modify:** `packages/cli/src/registry.ts`
- **Modify:** `packages/cli/src/index.ts`
- **Modify:** `packages/cli/src/theme-commands.ts`

### Steps

- [ ] **3.1** Rewrite `packages/cli/src/registry.ts`. Remove `loadFromBundledLocal`, update `RegistryClient` to use `RegistryAPIClient` internally, and add custom content support for all types:

```typescript
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
 * Registry client with resolution order: Custom → API → Cache
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
   * Resolution: API → Cache. Custom items are merged into the list.
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
   * Resolution: Custom → API → Cache
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
```

- [ ] **3.2** Update `packages/cli/src/index.ts` imports and the `getResolver()`/`getContentRoot()` helpers. Replace the local-file based `getResolver()` with the new API-based resolution. Also update `cmdGet` to handle the `namespace` argument.

Replace these lines near the top of `index.ts`:

**Old (lines 5-6):**
```typescript
import { createResolver, createRegistryClient } from '@decantr/registry';
```

**New:**
```typescript
import { RegistryAPIClient, createRegistryClient } from '@decantr/registry';
```

**Old (lines 110-117):**
```typescript
function getContentRoot(): string {
  const bundled = join(import.meta.dirname, '..', '..', '..', 'content');
  return process.env.DECANTR_CONTENT_ROOT || bundled;
}

function getResolver() {
  return createResolver({ contentRoot: getContentRoot() });
}
```

**New:**
```typescript
function getAPIClient(): RegistryAPIClient {
  return new RegistryAPIClient({
    baseUrl: process.env.DECANTR_API_URL || undefined,
    apiKey: process.env.DECANTR_API_KEY || undefined,
  });
}
```

Then update `cmdSearch` (around line 121) to use the new API client:

**Old:**
```typescript
async function cmdSearch(query: string, type?: string) {
  const client = createRegistryClient();
  const results = await client.search(query, type);
```

**New:**
```typescript
async function cmdSearch(query: string, type?: string) {
  const apiClient = getAPIClient();
  try {
    const response = await apiClient.search({ q: query, type });
    const results = response.results;
```

And update `cmdSuggest` similarly:

**Old:**
```typescript
async function cmdSuggest(query: string, type?: string) {
  const client = createRegistryClient();
  const searchType = type || 'pattern';
  const results = await client.search(query, searchType);
```

**New:**
```typescript
async function cmdSuggest(query: string, type?: string) {
  const apiClient = getAPIClient();
  const searchType = type || 'pattern';
  try {
    const response = await apiClient.search({ q: query, type: searchType });
    const results = response.results;
```

Update `cmdGet` (around line 178) to use `RegistryClient` for all types (not just shells), fetching from the API with namespace support:

**Old:**
```typescript
async function cmdGet(type: string, id: string) {
  const validTypes = ['pattern', 'archetype', 'recipe', 'theme', 'blueprint', 'shell'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  // Handle shells via registry client
  if (type === 'shell') {
    const registryClient = new RegistryClient({
      cacheDir: join(process.cwd(), '.decantr', 'cache')
    });
    const shellResult = await registryClient.fetchShell(id);
    if (shellResult) {
      console.log(JSON.stringify(shellResult.data, null, 2));
      return;
    }
    console.error(error(`shell "${id}" not found.`));
    process.exitCode = 1;
    return;
  }
```

**New:**
```typescript
async function cmdGet(type: string, id: string) {
  const validTypes = ['pattern', 'archetype', 'recipe', 'theme', 'blueprint', 'shell'] as const;
  if (!validTypes.includes(type as any)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  // Map singular type names to API plural form
  const typeMap: Record<string, string> = {
    pattern: 'patterns',
    archetype: 'archetypes',
    recipe: 'recipes',
    theme: 'themes',
    blueprint: 'blueprints',
    shell: 'shells',
  };
  const apiType = typeMap[type] as import('@decantr/registry').ApiContentType;

  const registryClient = new RegistryClient({
    cacheDir: join(process.cwd(), '.decantr', 'cache'),
  });
  const result = await registryClient.fetchContentItem(apiType, id);
  if (result) {
    console.log(JSON.stringify(result.data, null, 2));
    return;
  }
  console.error(error(`${type} "${id}" not found.`));
  process.exitCode = 1;
  return;
```

Also update the `cmdList` function (find it in index.ts, it likely fetches from the API URL directly) to use the `RegistryClient`:

Find the `cmdList` function and replace its body to use `RegistryClient.fetchContentList()` instead of raw `fetch()` calls.

- [ ] **3.3** Update `packages/cli/src/theme-commands.ts` — no structural changes needed, but update the docstrings to note that custom content works for all types. The actual custom content management for non-theme types will be added via the `create` command in Task 4.

No code changes needed in `theme-commands.ts` for this step. The existing theme create/delete/import functions continue to work as-is since they operate on `.decantr/custom/themes/` which is the same path the new `RegistryClient.loadCustomContent()` checks.

### Run

```bash
cd packages/registry && pnpm build && cd ../cli && pnpm build
```

### Commit

```
feat(cli): API-first registry client with custom content for all types
```

---

## Task 4: Add `decantr login`, `decantr logout`, `decantr publish` Commands

Add authentication and publishing commands to the CLI. Auth tokens are stored in `~/.config/decantr/auth.json`. The login flow opens a browser for OAuth and listens on a local callback server. Publish reads content from `.decantr/custom/` and uploads it via the API.

### Files to create/modify

- **Create:** `packages/cli/src/auth.ts`
- **Create:** `packages/cli/src/commands/publish.ts`
- **Modify:** `packages/cli/src/index.ts` (add command routing)

### Steps

- [ ] **4.1** Create `packages/cli/src/auth.ts` for token management and browser OAuth flow:

```typescript
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createServer } from 'node:http';

const CONFIG_DIR = join(homedir(), '.config', 'decantr');
const AUTH_FILE = join(CONFIG_DIR, 'auth.json');
const DEFAULT_AUTH_URL = 'https://decantr.ai/auth/cli';

interface AuthToken {
  api_key: string;
  email: string;
  tier: string;
  created_at: string;
}

/**
 * Get the stored API key, or undefined if not logged in.
 */
export function getStoredApiKey(): string | undefined {
  if (!existsSync(AUTH_FILE)) return undefined;
  try {
    const data = JSON.parse(readFileSync(AUTH_FILE, 'utf-8')) as AuthToken;
    return data.api_key;
  } catch {
    return undefined;
  }
}

/**
 * Get stored auth info.
 */
export function getStoredAuth(): AuthToken | null {
  if (!existsSync(AUTH_FILE)) return null;
  try {
    return JSON.parse(readFileSync(AUTH_FILE, 'utf-8')) as AuthToken;
  } catch {
    return null;
  }
}

/**
 * Save auth token.
 */
function saveAuth(token: AuthToken): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(AUTH_FILE, JSON.stringify(token, null, 2), { mode: 0o600 });
}

/**
 * Remove stored auth.
 */
export function clearAuth(): boolean {
  if (!existsSync(AUTH_FILE)) return false;
  try {
    rmSync(AUTH_FILE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Run the browser-based OAuth login flow.
 *
 * 1. Start a local HTTP server on a random port
 * 2. Open the browser to the auth URL with a callback to localhost
 * 3. Wait for the callback with the API key
 * 4. Store the token
 */
export async function login(authUrl?: string): Promise<{ success: boolean; email?: string; error?: string }> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url || '/', `http://localhost`);

      if (url.pathname === '/callback') {
        const apiKey = url.searchParams.get('api_key');
        const email = url.searchParams.get('email');
        const tier = url.searchParams.get('tier');

        if (apiKey && email) {
          saveAuth({
            api_key: apiKey,
            email,
            tier: tier || 'free',
            created_at: new Date().toISOString(),
          });

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Logged in to Decantr!</h1><p>You can close this tab.</p></body></html>');

          server.close();
          resolve({ success: true, email });
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Login failed</h1><p>Missing credentials.</p></body></html>');

          server.close();
          resolve({ success: false, error: 'Missing API key or email in callback' });
        }
        return;
      }

      res.writeHead(404);
      res.end();
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        resolve({ success: false, error: 'Could not start local server' });
        return;
      }

      const port = address.port;
      const callbackUrl = `http://127.0.0.1:${port}/callback`;
      const loginUrl = `${authUrl || DEFAULT_AUTH_URL}?callback=${encodeURIComponent(callbackUrl)}`;

      console.log(`\nOpening browser for authentication...`);
      console.log(`If it doesn't open, visit: ${loginUrl}\n`);

      // Open browser
      const open = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      import('node:child_process').then(({ exec }) => {
        exec(`${open} "${loginUrl}"`);
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        resolve({ success: false, error: 'Login timed out after 5 minutes' });
      }, 5 * 60 * 1000);
    });
  });
}
```

- [ ] **4.2** Create `packages/cli/src/commands/publish.ts`:

```typescript
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryAPIClient } from '@decantr/registry';
import type { ApiContentType, PublishPayload } from '@decantr/registry';
import { getStoredApiKey } from '../auth.js';

const VALID_TYPES = ['theme', 'pattern', 'recipe', 'blueprint', 'archetype', 'shell'] as const;
type ContentTypeSingular = typeof VALID_TYPES[number];

const TYPE_TO_API: Record<ContentTypeSingular, ApiContentType> = {
  theme: 'themes',
  pattern: 'patterns',
  recipe: 'recipes',
  blueprint: 'blueprints',
  archetype: 'archetypes',
  shell: 'shells',
};

export async function publishContent(
  type: string,
  name: string,
  options: { apiUrl?: string; namespace?: string }
): Promise<{ success: boolean; message: string }> {
  // Validate type
  if (!VALID_TYPES.includes(type as ContentTypeSingular)) {
    return {
      success: false,
      message: `Invalid type "${type}". Must be one of: ${VALID_TYPES.join(', ')}`,
    };
  }

  // Check authentication
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return {
      success: false,
      message: 'Not logged in. Run `decantr login` first.',
    };
  }

  // Find the content file in .decantr/custom/{type}s/
  const apiType = TYPE_TO_API[type as ContentTypeSingular];
  const customPath = join(process.cwd(), '.decantr', 'custom', apiType, `${name}.json`);

  if (!existsSync(customPath)) {
    return {
      success: false,
      message: `Content not found at ${customPath}. Create it first with: decantr create ${type} ${name}`,
    };
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(customPath, 'utf-8'));
  } catch (e) {
    return {
      success: false,
      message: `Invalid JSON in ${customPath}: ${(e as Error).message}`,
    };
  }

  // Publish to API
  const client = new RegistryAPIClient({
    baseUrl: options.apiUrl,
    apiKey,
  });

  const payload: PublishPayload = {
    type: apiType,
    slug: name,
    namespace: options.namespace || '@community',
    version: (data.version as string) || '1.0.0',
    data,
  };

  try {
    const result = await client.publishContent(payload);
    return {
      success: true,
      message: `Published ${type} "${name}" to ${payload.namespace}. Status: ${result.status}`,
    };
  } catch (e) {
    return {
      success: false,
      message: `Publish failed: ${(e as Error).message}`,
    };
  }
}
```

- [ ] **4.3** Update `packages/cli/src/index.ts` to add command routing for `login`, `logout`, and `publish`. Find the main command routing section (the large `switch` or `if/else` chain at the bottom of the file) and add the new commands.

Add these imports at the top of `index.ts` (after existing imports):

```typescript
import { login, clearAuth, getStoredAuth } from './auth.js';
import { publishContent } from './commands/publish.js';
```

Then add these command handler functions before the main routing:

```typescript
async function cmdLogin() {
  const existing = getStoredAuth();
  if (existing) {
    console.log(`Already logged in as ${cyan(existing.email)} (${existing.tier} tier).`);
    const overwrite = await confirm('Log in again?', false);
    if (!overwrite) return;
  }

  const result = await login();
  if (result.success) {
    console.log(success(`Logged in as ${result.email}`));
  } else {
    console.error(error(`Login failed: ${result.error}`));
    process.exitCode = 1;
  }
}

async function cmdLogout() {
  const removed = clearAuth();
  if (removed) {
    console.log(success('Logged out.'));
  } else {
    console.log(dim('Not logged in.'));
  }
}

async function cmdPublish(type: string, name: string) {
  if (!type || !name) {
    console.error(error('Usage: decantr publish <type> <name>'));
    console.log(dim('Example: decantr publish theme my-brand'));
    process.exitCode = 1;
    return;
  }

  console.log(dim(`Publishing ${type} "${name}"...`));
  const result = await publishContent(type, name, {});

  if (result.success) {
    console.log(success(result.message));
  } else {
    console.error(error(result.message));
    process.exitCode = 1;
  }
}
```

Then add routing entries in the main command dispatch:

```typescript
// In the command routing section, add:
case 'login':
  await cmdLogin();
  break;

case 'logout':
  await cmdLogout();
  break;

case 'publish':
  await cmdPublish(positionalArgs[0], positionalArgs[1]);
  break;
```

Also update the help text to include the new commands:

```typescript
// In the help output, add under the appropriate section:
console.log('  login                         Log in to your Decantr account');
console.log('  logout                        Log out');
console.log('  publish <type> <name>         Publish custom content to registry');
```

### Run

```bash
cd packages/cli && pnpm build
```

### Commit

```
feat(cli): add login, logout, and publish commands
```

---

## Task 5: Update `decantr init` for Offline Minimal Boilerplate

Update the init command so that offline mode (or `decantr init` without `--blueprint`) creates only minimal boilerplate:
- `decantr.essence.json` (empty structure, version, platform only)
- `.decantr/project.json`
- `.decantr/custom/` (empty directories for all content types)
- `DECANTR.md`

When online with `--blueprint`, fetch from registry and scaffold a fully populated essence file.

### Files to modify

- **Modify:** `packages/cli/src/index.ts` (the `cmdInit` function)
- **Modify:** `packages/cli/src/scaffold.ts` (add `scaffoldMinimal` function)

### Steps

- [ ] **5.1** Add a `scaffoldMinimal` function to `packages/cli/src/scaffold.ts`. This creates the bare minimum files for an offline init. Add it at the end of the file:

```typescript
export interface MinimalScaffoldResult {
  essencePath: string;
  decantrMdPath: string;
  projectJsonPath: string;
  customDirs: string[];
}

/**
 * Scaffold minimal boilerplate for offline init.
 * Creates:
 * - decantr.essence.json (empty structure, version + platform only)
 * - .decantr/project.json
 * - .decantr/custom/{themes,patterns,recipes,blueprints,archetypes,shells}/
 * - DECANTR.md
 */
export function scaffoldMinimal(
  projectRoot: string,
  detected: DetectedProject
): MinimalScaffoldResult {
  const essencePath = join(projectRoot, 'decantr.essence.json');
  const decantrDir = join(projectRoot, '.decantr');
  const projectJsonPath = join(decantrDir, 'project.json');
  const decantrMdPath = join(projectRoot, 'DECANTR.md');

  // Create .decantr directory
  mkdirSync(decantrDir, { recursive: true });

  // Create custom content directories
  const contentTypes = ['themes', 'patterns', 'recipes', 'blueprints', 'archetypes', 'shells'];
  const customDirs: string[] = [];
  for (const type of contentTypes) {
    const dir = join(decantrDir, 'custom', type);
    mkdirSync(dir, { recursive: true });
    customDirs.push(dir);
  }

  // Create cache directory
  mkdirSync(join(decantrDir, 'cache'), { recursive: true });

  // Write minimal essence file
  const essenceContent = {
    version: '2.0.0',
    archetype: '',
    theme: {
      style: '',
      mode: 'dark',
      recipe: '',
      shape: 'rounded',
    },
    personality: [],
    platform: {
      type: 'spa',
      routing: detected.framework === 'next' ? 'app-router'
        : detected.framework === 'nuxt' ? 'file-based'
        : 'hash',
    },
    structure: [],
    features: [],
    guard: { enforce_style: true, enforce_recipe: true, mode: 'guided' },
    density: { level: 'comfortable', content_gap: '_gap4' },
    target: detected.framework || 'react',
  };

  writeFileSync(essencePath, JSON.stringify(essenceContent, null, 2));

  // Write project.json
  const projectJson = {
    name: detected.name || 'my-project',
    version: '1.0.0',
    created_at: new Date().toISOString(),
    registry_url: 'https://api.decantr.ai/v1',
  };
  writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2));

  // Write DECANTR.md from template
  const templatePath = join(__dirname, 'templates', 'DECANTR.md.template');
  if (existsSync(templatePath)) {
    const template = readFileSync(templatePath, 'utf-8');
    writeFileSync(decantrMdPath, template);
  } else {
    writeFileSync(decantrMdPath, [
      '# DECANTR.md',
      '',
      'This project uses Decantr for design intelligence.',
      '',
      '## Getting Started',
      '',
      '1. Run `decantr init --blueprint=@official/<name>` to scaffold from a blueprint',
      '2. Or manually edit `decantr.essence.json` to define your design spec',
      '3. Place custom content in `.decantr/custom/{type}/`',
      '4. Run `decantr sync` to fetch registry content',
      '',
      '## Custom Content',
      '',
      'Create custom content with `decantr create <type> <name>`.',
      'Custom content in `.decantr/custom/` is never overwritten by sync.',
      '',
    ].join('\n'));
  }

  return { essencePath, decantrMdPath, projectJsonPath, customDirs };
}
```

- [ ] **5.2** Update the `cmdInit` function in `packages/cli/src/index.ts`. When offline or when no blueprint is specified, use `scaffoldMinimal`. When online with `--blueprint`, fetch from registry and use the full scaffold.

Find the `cmdInit` function and update the offline/default path. The key change is replacing the current offline behavior (which fetches bundled content) with minimal scaffolding:

Add import at the top:
```typescript
import { scaffoldProject, scaffoldMinimal, type ThemeData, type RecipeData, type LayoutItem } from './scaffold.js';
```

In the `cmdInit` function, after the API availability check, replace the offline handling:

**Old pattern:**
```typescript
  } else if (!apiAvailable) {
    // Offline mode
    console.log(`\n${YELLOW}You're offline. Scaffolding Decantr default.${RESET}`);
    console.log(dim('Run `decantr upgrade` when online, or visit decantr.ai/registry\n'));
    selectedBlueprint = 'default';
  }
```

**New pattern:**
```typescript
  } else if (!apiAvailable) {
    // Offline mode — minimal boilerplate only
    console.log(`\n${YELLOW}You're offline. Creating minimal project boilerplate.${RESET}`);
    console.log(dim('Run `decantr init --blueprint=@official/<name>` when online for full scaffold.\n'));

    const detected = detectProject(projectRoot);
    const result = scaffoldMinimal(projectRoot, detected);
    console.log(success('Created:'));
    console.log(`  ${result.essencePath}`);
    console.log(`  ${result.projectJsonPath}`);
    console.log(`  ${result.decantrMdPath}`);
    console.log(`  .decantr/custom/ (empty directories for all content types)`);
    console.log('');
    console.log(dim('Next: run `decantr init --blueprint=@official/<name>` when online'));
    return;
  }
```

### Run

```bash
cd packages/cli && pnpm build
```

### Commit

```
feat(cli): minimal offline boilerplate for decantr init
```

---

## Task 6: Create Custom Content for All Types

Generalize the theme-only `decantr create theme <name>` command to support all content types: `decantr create <type> <name>`. Each type gets a skeleton JSON file in `.decantr/custom/{type}/`.

### Files to create/modify

- **Create:** `packages/cli/src/commands/create.ts`
- **Modify:** `packages/cli/src/index.ts` (update `create` command routing)

### Steps

- [ ] **6.1** Create `packages/cli/src/commands/create.ts`:

```typescript
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const VALID_TYPES = ['theme', 'pattern', 'recipe', 'blueprint', 'archetype', 'shell'] as const;
type ContentTypeSingular = typeof VALID_TYPES[number];

const TYPE_TO_DIR: Record<ContentTypeSingular, string> = {
  theme: 'themes',
  pattern: 'patterns',
  recipe: 'recipes',
  blueprint: 'blueprints',
  archetype: 'archetypes',
  shell: 'shells',
};

function getPatternSkeleton(id: string, name: string): Record<string, unknown> {
  return {
    id,
    version: '1.0.0',
    name,
    description: '',
    tags: [],
    components: [],
    default_preset: 'standard',
    presets: {
      standard: {
        description: 'Default layout',
        layout: { layout: 'column', atoms: '_stack _gap4' },
        code: { imports: '', example: '' },
      },
    },
    source: 'custom',
  };
}

function getRecipeSkeleton(id: string): Record<string, unknown> {
  return {
    id,
    style: id,
    mode: 'dark',
    schema_version: '2.0.0',
    spatial_hints: {
      density_bias: 0,
      content_gap_shift: 0,
      section_padding: '_pad6',
      card_wrapping: 'minimal',
      surface_override: null,
    },
    shell: {
      preferred: ['sidebar-main'],
      nav_style: 'vertical',
    },
    visual_effects: {
      enabled: false,
      intensity: 'subtle',
      type_mapping: {},
      component_fallback: {},
    },
    pattern_preferences: {
      prefer: [],
      avoid: [],
    },
    source: 'custom',
  };
}

function getBlueprintSkeleton(id: string, name: string): Record<string, unknown> {
  return {
    id,
    name,
    description: '',
    compose: [],
    theme: {
      style: '',
      mode: 'dark',
      shape: 'rounded',
    },
    personality: [],
    source: 'custom',
  };
}

function getArchetypeSkeleton(id: string, name: string): Record<string, unknown> {
  return {
    id,
    version: '1.0.0',
    name,
    description: '',
    tags: [],
    pages: [
      {
        id: 'home',
        shell: 'sidebar-main',
        default_layout: [],
      },
    ],
    features: [],
    dependencies: { patterns: {}, recipes: {} },
    source: 'custom',
  };
}

function getShellSkeleton(id: string, name: string): Record<string, unknown> {
  return {
    id,
    name,
    description: '',
    layout: {
      type: 'sidebar-main',
      regions: ['nav', 'main'],
    },
    source: 'custom',
  };
}

function getThemeSkeleton(id: string, name: string): Record<string, unknown> {
  return {
    id,
    name,
    description: '',
    seed: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#0f172a',
    },
    modes: ['light', 'dark'],
    shapes: ['rounded'],
    decantr_compat: '2.0.0',
    source: 'custom',
  };
}

function getSkeleton(type: ContentTypeSingular, id: string, name: string): Record<string, unknown> {
  switch (type) {
    case 'theme': return getThemeSkeleton(id, name);
    case 'pattern': return getPatternSkeleton(id, name);
    case 'recipe': return getRecipeSkeleton(id);
    case 'blueprint': return getBlueprintSkeleton(id, name);
    case 'archetype': return getArchetypeSkeleton(id, name);
    case 'shell': return getShellSkeleton(id, name);
  }
}

export function createContent(
  projectRoot: string,
  type: string,
  id: string
): { success: boolean; path?: string; error?: string } {
  if (!VALID_TYPES.includes(type as ContentTypeSingular)) {
    return {
      success: false,
      error: `Invalid type "${type}". Must be one of: ${VALID_TYPES.join(', ')}`,
    };
  }

  const dirName = TYPE_TO_DIR[type as ContentTypeSingular];
  const dir = join(projectRoot, '.decantr', 'custom', dirName);
  const filePath = join(dir, `${id}.json`);

  if (existsSync(filePath)) {
    return {
      success: false,
      error: `${type} "${id}" already exists at ${filePath}`,
    };
  }

  mkdirSync(dir, { recursive: true });

  const name = id
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const skeleton = getSkeleton(type as ContentTypeSingular, id, name);
  writeFileSync(filePath, JSON.stringify(skeleton, null, 2));

  return { success: true, path: filePath };
}
```

- [ ] **6.2** Update the `create` command in `packages/cli/src/index.ts` to dispatch to the generalized `createContent` for all types (keeping backward compat with `decantr create theme <name>`).

Add import:
```typescript
import { createContent } from './commands/create.js';
```

Update the `create` command handler:

```typescript
case 'create': {
  const createType = positionalArgs[0];
  const createName = positionalArgs[1];

  if (!createType || !createName) {
    console.error(error('Usage: decantr create <type> <name>'));
    console.log(dim('Types: theme, pattern, recipe, blueprint, archetype, shell'));
    console.log(dim('Example: decantr create pattern my-hero'));
    process.exitCode = 1;
    break;
  }

  // Use generalized create for all types
  const result = createContent(process.cwd(), createType, createName);
  if (result.success) {
    console.log(success(`Created ${createType} "${createName}" at ${result.path}`));
    console.log(dim(`Edit the file, then publish with: decantr publish ${createType} ${createName}`));
  } else {
    console.error(error(result.error!));
    process.exitCode = 1;
  }
  break;
}
```

### Run

```bash
cd packages/cli && pnpm build
```

### Commit

```
feat(cli): generalize create command for all content types
```

---

## Task 7: Build Verification

Verify the full monorepo builds, typechecks, and tests pass for all affected packages.

### Steps

- [ ] **7.1** Build all packages in dependency order:

```bash
pnpm build
```

- [ ] **7.2** Typecheck all packages:

```bash
pnpm lint
```

- [ ] **7.3** Run tests:

```bash
pnpm test
```

- [ ] **7.4** If any tests fail due to the removal of bundled content or `ContentResolver` changes, update the test mocks. Common places that may need updates:

- `packages/mcp-server/test/` — tests that mock `getResolver()` need to mock `getAPIClient()` instead
- `packages/cli/test/` — tests that reference `loadFromBundledLocal` or the old resolution order need updating
- `packages/registry/test/` — should not need changes (resolver.ts is unchanged, api-client.ts is additive)

For MCP server tests, the mock pattern changes from:

```typescript
// Old:
vi.mock('../src/helpers.js', () => ({
  getResolver: () => ({ resolve: vi.fn() }),
  // ...
}));
```

To:

```typescript
// New:
vi.mock('../src/helpers.js', () => ({
  getAPIClient: () => ({
    getPattern: vi.fn(),
    getArchetype: vi.fn(),
    getRecipe: vi.fn(),
    getBlueprint: vi.fn(),
    listContent: vi.fn(),
    search: vi.fn(),
  }),
  // ...
}));
```

### Run

```bash
pnpm build && pnpm lint && pnpm test
```

### Commit

```
fix: update tests for API-first content resolution
```

---

## Summary of Changes

| Package | What changes |
|---------|-------------|
| `@decantr/registry` | New `RegistryAPIClient` class with typed API access, in-memory caching, auth support |
| `@decantr/mcp-server` | `helpers.ts`: remove `ContentResolver`, add `getAPIClient()`. `tools.ts`: all resolve tools use API client |
| `@decantr/cli` | `registry.ts`: API-first with custom content for all types, no bundled fallback. New `auth.ts`, `commands/publish.ts`, `commands/create.ts`. Updated `init` for offline minimal boilerplate. New `login`/`logout`/`publish` commands |

### New files

| File | Purpose |
|------|---------|
| `packages/registry/src/api-client.ts` | Shared `RegistryAPIClient` |
| `packages/cli/src/auth.ts` | Token storage and browser OAuth flow |
| `packages/cli/src/commands/publish.ts` | `decantr publish` command |
| `packages/cli/src/commands/create.ts` | Generalized `decantr create` for all content types |

### Deleted content (conceptual, code removed inline)

| What | Where |
|------|-------|
| `ContentResolver` usage in MCP server | `packages/mcp-server/src/helpers.ts` |
| `loadFromBundledLocal` function | `packages/cli/src/registry.ts` |
| Bundled content fallback in CLI | `packages/cli/src/registry.ts` |
| `getContentRoot()` / `getResolver()` in CLI | `packages/cli/src/index.ts` |

### API URL migration

| Old | New |
|-----|-----|
| `https://decantr-registry.fly.dev/v1` | `https://api.decantr.ai/v1` |

### Resolution order change

| Before | After |
|--------|-------|
| API -> Cache -> Bundled | Custom (.decantr/custom/) -> API -> Cache (.decantr/cache/) |
