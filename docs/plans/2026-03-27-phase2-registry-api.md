# Phase 2: Registry API v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Registry API to use Supabase instead of local files, with full CRUD, namespacing, auth, and rate limiting.

**Architecture:** Hono server with Supabase Postgres backend, JWT + API key authentication, RLS-enforced permissions, paginated content endpoints with namespace routing.

**Tech Stack:** Hono, Supabase, TypeScript

**Spec:** `docs/specs/2026-03-27-registry-platform-design.md`

---

## Task 1: Convert to TypeScript + Restructure Build

Convert the API from plain JS to TypeScript with tsup for production builds. This task sets up the project skeleton without changing any route logic yet.

### Files to create/modify

- **Modify:** `apps/api/package.json`
- **Create:** `apps/api/tsconfig.json`
- **Create:** `apps/api/tsup.config.ts`
- **Create:** `apps/api/src/index.ts` (new entrypoint)
- **Create:** `apps/api/src/app.ts` (Hono app factory, exported for testing)
- **Create:** `apps/api/src/types.ts` (shared Hono env types)
- **Delete:** `apps/api/src/index.js`

### Steps

- [ ] **1.1** Update `apps/api/package.json` to add TypeScript tooling and update scripts:

```json
{
  "name": "decantr-api",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup",
    "start": "node dist/index.js",
    "test": "dotenv -e .env.local -- vitest run",
    "test:watch": "dotenv -e .env.local -- vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hono/node-server": "^1.13.0",
    "@supabase/supabase-js": "^2.100.1",
    "hono": "^4.6.0"
  },
  "engines": {
    "node": ">=20"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "dotenv-cli": "^11.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **1.2** Create `apps/api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

- [ ] **1.3** Create `apps/api/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  splitting: false,
  treeshake: true,
});
```

- [ ] **1.4** Create `apps/api/src/types.ts` with the shared Hono environment type:

```ts
import type { AuthContext } from './middleware/auth.js';

export type Env = {
  Variables: {
    auth: AuthContext;
  };
};

export type ContentType = 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';

export const CONTENT_TYPES: ContentType[] = [
  'pattern',
  'recipe',
  'theme',
  'blueprint',
  'archetype',
  'shell',
];

// Maps plural URL segment to singular DB type
export const PLURAL_TO_SINGULAR: Record<string, ContentType> = {
  patterns: 'pattern',
  recipes: 'recipe',
  themes: 'theme',
  blueprints: 'blueprint',
  archetypes: 'archetype',
  shells: 'shell',
};

export interface PaginationParams {
  limit: number;
  offset: number;
}

export function parsePagination(
  limitParam: string | undefined,
  offsetParam: string | undefined
): PaginationParams {
  const limit = Math.min(Math.max(parseInt(limitParam || '20', 10), 1), 100);
  const offset = Math.max(parseInt(offsetParam || '0', 10), 0);
  return { limit, offset };
}
```

- [ ] **1.5** Create `apps/api/src/app.ts` (the Hono app factory, importable by tests):

```ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types.js';
import { healthRoutes } from './routes/health.js';
import { contentRoutes } from './routes/content.js';
import { searchRoutes } from './routes/search.js';
import { authRoutes } from './routes/auth.js';
import { publishRoutes } from './routes/publish.js';
import { orgRoutes } from './routes/orgs.js';
import { adminRoutes } from './routes/admin.js';
import { rateLimiter } from './middleware/rate-limit.js';
import { optionalAuth } from './middleware/auth.js';

export function createApp(): Hono<Env> {
  const app = new Hono<Env>();

  // Global middleware
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    })
  );

  // Rate limiting on all v1 routes
  app.use('/v1/*', rateLimiter());

  // Optional auth on all v1 routes (populates auth context if credentials present)
  app.use('/v1/*', optionalAuth());

  // Mount route modules
  app.route('/', healthRoutes);
  app.route('/v1', contentRoutes);
  app.route('/v1', searchRoutes);
  app.route('/v1', authRoutes);
  app.route('/v1', publishRoutes);
  app.route('/v1', orgRoutes);
  app.route('/v1', adminRoutes);

  return app;
}
```

- [ ] **1.6** Create `apps/api/src/index.ts` (server entrypoint):

```ts
import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const app = createApp();
const port = parseInt(process.env.PORT || '3001', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Decantr API v2 running at http://localhost:${port}`);
});
```

- [ ] **1.7** Delete `apps/api/src/index.js`.

- [ ] **1.8** Install new dependencies:

```bash
cd apps/api && pnpm add -D tsup tsx typescript @types/node
```

- [ ] **1.9** Verify TypeScript compiles (expect errors for missing route files -- that is expected at this stage):

```bash
cd apps/api && pnpm typecheck
```

**Commit:** `refactor(api): convert to TypeScript with tsup build`

---

## Task 2: Implement Rate Limiting Middleware

Implement tiered rate limiting based on user authentication status and tier level.

### Files to create

- **Create:** `apps/api/src/middleware/rate-limit.ts`

### Steps

- [ ] **2.1** Create `apps/api/src/middleware/rate-limit.ts`:

```ts
import type { Context, Next } from 'hono';
import type { Env } from '../types.js';
import type { AuthContext } from './auth.js';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000; // 1 minute

const TIER_LIMITS: Record<string, number> = {
  unauthenticated: 30,
  free: 60,
  pro: 300,
  team: 600,
  enterprise: Infinity,
};

// In-memory store. For multi-instance deployments, replace with Redis.
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, 5 * 60_000);

function getRateLimitKey(c: Context<Env>): string {
  const auth: AuthContext | undefined = c.get('auth');
  if (auth?.isAuthenticated && auth.user) {
    return `user:${auth.user.id}`;
  }
  return `ip:${c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown'}`;
}

function getMaxRequests(c: Context<Env>): number {
  const auth: AuthContext | undefined = c.get('auth');
  if (!auth?.isAuthenticated || !auth.user) {
    return TIER_LIMITS.unauthenticated;
  }
  return TIER_LIMITS[auth.user.tier] ?? TIER_LIMITS.free;
}

export function rateLimiter() {
  return async (c: Context<Env>, next: Next) => {
    // Auth context may not be populated yet at this point in the middleware chain.
    // We call next() first so optionalAuth runs, then check rate limits.
    // However, since rate-limit runs before optionalAuth in the chain, we need
    // a different approach: rate-limit checks AFTER the response.
    // Instead, we use a lazy approach: resolve auth inside the limiter.

    // We cannot rely on c.get('auth') being set yet. Instead, we do a simpler
    // two-pass: the rateLimiter must be mounted AFTER optionalAuth, OR we
    // do the check post-auth. We'll check in the handler after auth is resolved.
    // For simplicity, we check rate limit AFTER next() is NOT viable (too late).
    //
    // Solution: mount optionalAuth BEFORE rateLimiter in app.ts, then read
    // the auth context here.

    const key = getRateLimitKey(c);
    const max = getMaxRequests(c);

    if (max === Infinity) {
      await next();
      return;
    }

    const now = Date.now();
    let entry = store.get(key);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
      entry = { count: 0, windowStart: now };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, max - entry.count);
    const resetAt = entry.windowStart + WINDOW_MS;

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (entry.count > max) {
      return c.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((resetAt - now) / 1000),
        },
        429
      );
    }

    await next();
  };
}

// Export for testing
export { store as _rateLimitStore, TIER_LIMITS };
```

- [ ] **2.2** Update middleware mount order in `apps/api/src/app.ts` so `optionalAuth` runs before `rateLimiter`:

```ts
  // Optional auth first (populates auth context)
  app.use('/v1/*', optionalAuth());

  // Rate limiting uses auth context for tier-based limits
  app.use('/v1/*', rateLimiter());
```

**Commit:** `feat(api): add tiered rate limiting middleware`

---

## Task 3: Health Route

### Files to create

- **Create:** `apps/api/src/routes/health.ts`

### Steps

- [ ] **3.1** Create `apps/api/src/routes/health.ts`:

```ts
import { Hono } from 'hono';
import type { Env } from '../types.js';

export const healthRoutes = new Hono<Env>();

healthRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});
```

**Commit:** `feat(api): add health check route`

---

## Task 4: Public Content Routes

Implement paginated list and detail endpoints for all six content types, querying Supabase.

### Files to create

- **Create:** `apps/api/src/routes/content.ts`

### Steps

- [ ] **4.1** Create `apps/api/src/routes/content.ts`:

```ts
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { PLURAL_TO_SINGULAR, parsePagination } from '../types.js';
import { supabase } from '../db/client.js';
import type { AuthContext } from '../middleware/auth.js';

export const contentRoutes = new Hono<Env>();

// --- Paginated list endpoints for each content type ---

const contentTypes = ['patterns', 'recipes', 'themes', 'blueprints', 'archetypes', 'shells'] as const;

for (const plural of contentTypes) {
  const singular = PLURAL_TO_SINGULAR[plural];

  // GET /patterns, /recipes, etc.
  contentRoutes.get(`/${plural}`, async (c) => {
    const { limit, offset } = parsePagination(
      c.req.query('limit'),
      c.req.query('offset')
    );
    const namespace = c.req.query('namespace');
    const auth: AuthContext | undefined = c.get('auth');

    let query = supabase
      .from('content')
      .select('id, type, slug, namespace, visibility, version, data, published_at, owner_id', {
        count: 'exact',
      })
      .eq('type', singular)
      .in('status', ['published', 'approved']);

    // Filter by namespace if provided
    if (namespace) {
      query = query.eq('namespace', namespace);
    }

    // Visibility: public always visible; private only if owner or org member
    if (!auth?.isAuthenticated || !auth.user) {
      query = query.eq('visibility', 'public');
    } else {
      // Authenticated users see public + their own private content.
      // Org-scoped private content is handled by RLS on user client,
      // but since we use the anon client here, we filter manually.
      query = query.or(
        `visibility.eq.public,owner_id.eq.${auth.user.id}`
      );
    }

    query = query
      .order('published_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return c.json({ error: 'Failed to fetch content', details: error.message }, 500);
    }

    return c.json({
      total: count ?? 0,
      limit,
      offset,
      items: (data ?? []).map((item) => ({
        id: item.id,
        type: item.type,
        slug: item.slug,
        namespace: item.namespace,
        version: item.version,
        visibility: item.visibility,
        published_at: item.published_at,
        ...(item.data as Record<string, unknown>),
      })),
    });
  });

  // GET /patterns/:namespace/:slug, etc.
  contentRoutes.get(`/${plural}/:namespace/:slug`, async (c) => {
    const namespace = c.req.param('namespace');
    const slug = c.req.param('slug');
    const auth: AuthContext | undefined = c.get('auth');

    let query = supabase
      .from('content')
      .select('*')
      .eq('type', singular)
      .eq('namespace', namespace)
      .eq('slug', slug)
      .in('status', ['published', 'approved'])
      .single();

    const { data, error } = await query;

    if (error || !data) {
      return c.json(
        { error: `${singular} "${namespace}/${slug}" not found` },
        404
      );
    }

    // Check visibility
    if (data.visibility === 'private') {
      if (!auth?.isAuthenticated || !auth.user) {
        return c.json({ error: 'Not found' }, 404);
      }
      if (data.owner_id !== auth.user.id) {
        // Check org membership for org-scoped content
        if (data.org_id) {
          const { data: membership } = await supabase
            .from('org_members')
            .select('user_id')
            .eq('org_id', data.org_id)
            .eq('user_id', auth.user.id)
            .single();

          if (!membership) {
            return c.json({ error: 'Not found' }, 404);
          }
        } else {
          return c.json({ error: 'Not found' }, 404);
        }
      }
    }

    return c.json({
      id: data.id,
      type: data.type,
      slug: data.slug,
      namespace: data.namespace,
      version: data.version,
      visibility: data.visibility,
      published_at: data.published_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      ...(data.data as Record<string, unknown>),
    });
  });
}

// GET /schema/essence.v3.json
contentRoutes.get('/schema/essence.v3.json', async (c) => {
  // Serve the essence schema from the essence-spec package.
  // In production this could be served from a CDN or bundled.
  const { readFileSync, existsSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  // Resolve relative to monorepo root
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const schemaPath = join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'packages',
    'essence-spec',
    'schema',
    'essence.v2.json'
  );

  if (!existsSync(schemaPath)) {
    return c.json({ error: 'Schema not found' }, 404);
  }

  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  return c.json(schema);
});

// POST /validate
contentRoutes.post('/validate', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const errors: string[] = [];

  if (!body.version) {
    errors.push('Missing required field: version');
  }
  if (!body.platform) {
    errors.push('Missing required field: platform');
  }
  if (!body.structure && !body.sections) {
    errors.push('Missing required field: structure or sections');
  }

  if (errors.length > 0) {
    return c.json({ valid: false, errors });
  }

  return c.json({ valid: true, errors: [] });
});
```

**Commit:** `feat(api): add public content list, detail, schema, and validate routes`

---

## Task 5: Search Route

### Files to create

- **Create:** `apps/api/src/routes/search.ts`

### Steps

- [ ] **5.1** Create `apps/api/src/routes/search.ts`:

```ts
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { PLURAL_TO_SINGULAR, parsePagination } from '../types.js';
import { supabase } from '../db/client.js';

export const searchRoutes = new Hono<Env>();

searchRoutes.get('/search', async (c) => {
  const q = c.req.query('q');
  const type = c.req.query('type');
  const namespace = c.req.query('namespace');
  const { limit, offset } = parsePagination(
    c.req.query('limit'),
    c.req.query('offset')
  );

  if (!q || q.trim().length === 0) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  const searchTerm = q.trim();

  // Build the query. We search the JSONB data field for name, description, and tags.
  // Postgres full-text search on JSONB: use ilike on the cast or use the ->> operator.
  // For simplicity, we search with ilike on data::text which is broad but effective.
  let query = supabase
    .from('content')
    .select('id, type, slug, namespace, version, data, published_at', {
      count: 'exact',
    })
    .eq('visibility', 'public')
    .in('status', ['published', 'approved']);

  // Filter by singular type if plural URL param given (e.g., type=blueprints -> blueprint)
  if (type) {
    const singular = PLURAL_TO_SINGULAR[type] ?? type;
    query = query.eq('type', singular);
  }

  if (namespace) {
    query = query.eq('namespace', namespace);
  }

  // Text search: search slug and cast data to text for ilike.
  // Supabase JS doesn't support ilike on jsonb cast, so we use textSearch on slug
  // plus an or filter. We search slug and use Postgres text search on data.
  // Best approach: use .or() with ilike on slug and data->>name, data->>description.
  query = query.or(
    `slug.ilike.%${searchTerm}%,data->>name.ilike.%${searchTerm}%,data->>description.ilike.%${searchTerm}%`
  );

  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return c.json({ error: 'Search failed', details: error.message }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    results: (data ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      slug: item.slug,
      namespace: item.namespace,
      version: item.version,
      published_at: item.published_at,
      name: (item.data as Record<string, unknown>)?.name ?? item.slug,
      description: (item.data as Record<string, unknown>)?.description ?? null,
    })),
  });
});
```

**Commit:** `feat(api): add search endpoint with type and namespace filters`

---

## Task 6: Auth Routes (User Profile + API Keys)

### Files to create

- **Create:** `apps/api/src/routes/auth.ts`

### Steps

- [ ] **6.1** Create `apps/api/src/routes/auth.ts`:

```ts
import { Hono } from 'hono';
import { randomBytes, createHash } from 'crypto';
import type { Env } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';

export const authRoutes = new Hono<Env>();

// All routes in this module require authentication
authRoutes.use('/*', requireAuth());

// GET /me
authRoutes.get('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('users')
    .select('id, email, tier, reputation_score, trusted, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return c.json({ error: 'User profile not found' }, 404);
  }

  return c.json({ user: profile });
});

// PATCH /me
authRoutes.patch('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Only allow updating specific fields
  const allowedFields = ['email'] as const;
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  updates.updated_at = new Date().toISOString();

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, tier, reputation_score, trusted, created_at, updated_at')
    .single();

  if (error) {
    return c.json({ error: 'Failed to update profile', details: error.message }, 500);
  }

  return c.json({ user: data });
});

// GET /api-keys
authRoutes.get('/api-keys', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('api_keys')
    .select('id, name, scopes, last_used_at, created_at, revoked_at')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return c.json({ error: 'Failed to fetch API keys', details: error.message }, 500);
  }

  return c.json({ keys: data ?? [] });
});

// POST /api-keys
authRoutes.post('/api-keys', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  // Pro tier or above required for API keys
  if (user.tier === 'free') {
    return c.json({ error: 'API keys require Pro tier or above' }, 403);
  }

  let body: { name: string; scopes?: string[]; org_id?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return c.json({ error: 'Field "name" is required' }, 400);
  }

  const validScopes = ['read', 'write', 'org:read', 'org:write'];
  const scopes = body.scopes ?? ['read'];
  for (const scope of scopes) {
    if (!validScopes.includes(scope)) {
      return c.json({ error: `Invalid scope: "${scope}". Valid scopes: ${validScopes.join(', ')}` }, 400);
    }
  }

  // Generate a random API key
  const rawKey = `dctr_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('api_keys')
    .insert({
      user_id: user.id,
      org_id: body.org_id ?? null,
      key_hash: keyHash,
      name: body.name.trim(),
      scopes,
    })
    .select('id, name, scopes, created_at')
    .single();

  if (error) {
    return c.json({ error: 'Failed to create API key', details: error.message }, 500);
  }

  // Return the raw key ONCE -- it cannot be retrieved again
  return c.json(
    {
      key: rawKey,
      id: data.id,
      name: data.name,
      scopes: data.scopes,
      created_at: data.created_at,
      warning: 'Store this key securely. It cannot be retrieved again.',
    },
    201
  );
});

// DELETE /api-keys/:id
authRoutes.delete('/api-keys/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const keyId = c.req.param('id');

  const adminClient = createAdminClient();

  // Verify ownership
  const { data: existing } = await adminClient
    .from('api_keys')
    .select('id, user_id')
    .eq('id', keyId)
    .is('revoked_at', null)
    .single();

  if (!existing) {
    return c.json({ error: 'API key not found' }, 404);
  }

  if (existing.user_id !== user.id) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const { error } = await adminClient
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', keyId);

  if (error) {
    return c.json({ error: 'Failed to revoke API key', details: error.message }, 500);
  }

  return c.json({ message: 'API key revoked' });
});
```

**Commit:** `feat(api): add user profile and API key management routes`

---

## Task 7: Content Publishing Routes (CRUD)

### Files to create

- **Create:** `apps/api/src/routes/publish.ts`

### Steps

- [ ] **7.1** Create `apps/api/src/routes/publish.ts`:

```ts
import { Hono } from 'hono';
import type { Env, ContentType } from '../types.js';
import { CONTENT_TYPES, parsePagination } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';

export const publishRoutes = new Hono<Env>();

publishRoutes.use('/*', requireAuth());

// POST /content -- Publish new content
publishRoutes.post('/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;

  let body: {
    type: ContentType;
    slug: string;
    namespace?: string;
    visibility?: 'public' | 'private';
    version: string;
    data: Record<string, unknown>;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Validate required fields
  if (!body.type || !CONTENT_TYPES.includes(body.type)) {
    return c.json({
      error: `Invalid type. Must be one of: ${CONTENT_TYPES.join(', ')}`,
    }, 400);
  }

  if (!body.slug || typeof body.slug !== 'string') {
    return c.json({ error: 'Field "slug" is required' }, 400);
  }

  if (!body.version || typeof body.version !== 'string') {
    return c.json({ error: 'Field "version" is required' }, 400);
  }

  if (!body.data || typeof body.data !== 'object') {
    return c.json({ error: 'Field "data" is required and must be an object' }, 400);
  }

  // Slug validation: lowercase, alphanumeric, hyphens only
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(body.slug) && body.slug.length > 1) {
    return c.json({ error: 'Slug must be lowercase alphanumeric with hyphens, not starting/ending with hyphen' }, 400);
  }

  // Determine namespace
  const namespace = body.namespace ?? '@community';

  // Only admins can publish to @official
  if (namespace === '@official') {
    return c.json({ error: 'Cannot publish to @official namespace' }, 403);
  }

  // Org namespaces require org membership
  if (namespace.startsWith('@org:')) {
    return c.json({ error: 'Use POST /orgs/:slug/content for org publishing' }, 400);
  }

  // Private content requires Pro or above
  const visibility = body.visibility ?? 'public';
  if (visibility === 'private' && user.tier === 'free') {
    return c.json({ error: 'Private content requires Pro tier or above' }, 403);
  }

  // Determine status: trusted users publish instantly, others go to queue
  const status = user.trusted ? 'published' : 'pending';
  const publishedAt = user.trusted ? new Date().toISOString() : null;

  const adminClient = createAdminClient();

  // Check for duplicate (namespace + type + slug)
  const { data: existing } = await adminClient
    .from('content')
    .select('id')
    .eq('namespace', namespace)
    .eq('type', body.type)
    .eq('slug', body.slug)
    .single();

  if (existing) {
    return c.json({ error: 'Content with this namespace/type/slug already exists' }, 409);
  }

  // Check pending content limit for untrusted users (max 5 pending)
  if (!user.trusted) {
    const { count } = await adminClient
      .from('content')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .eq('status', 'pending');

    if ((count ?? 0) >= 5) {
      return c.json({
        error: 'Maximum of 5 pending submissions reached. Wait for approval before submitting more.',
      }, 429);
    }
  }

  // Insert content
  const { data: content, error: insertError } = await adminClient
    .from('content')
    .insert({
      type: body.type,
      slug: body.slug,
      namespace,
      owner_id: user.id,
      visibility,
      status,
      version: body.version,
      data: body.data,
      published_at: publishedAt,
    })
    .select('*')
    .single();

  if (insertError) {
    return c.json({ error: 'Failed to publish content', details: insertError.message }, 500);
  }

  // Create version history entry
  await adminClient.from('content_versions').insert({
    content_id: content.id,
    version: body.version,
    data: body.data,
    created_by: user.id,
  });

  // If pending, add to moderation queue
  if (status === 'pending') {
    await adminClient.from('moderation_queue').insert({
      content_id: content.id,
      submitted_by: user.id,
    });
  }

  return c.json(
    {
      id: content.id,
      type: content.type,
      slug: content.slug,
      namespace: content.namespace,
      status: content.status,
      version: content.version,
      visibility: content.visibility,
      published_at: content.published_at,
      created_at: content.created_at,
    },
    201
  );
});

// PATCH /content/:id -- Update content
publishRoutes.patch('/content/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const contentId = c.req.param('id');

  let body: {
    version?: string;
    data?: Record<string, unknown>;
    visibility?: 'public' | 'private';
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const adminClient = createAdminClient();

  // Fetch existing content and verify ownership
  const { data: existing } = await adminClient
    .from('content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (!existing) {
    return c.json({ error: 'Content not found' }, 404);
  }

  if (existing.owner_id !== user.id) {
    return c.json({ error: 'Forbidden: you do not own this content' }, 403);
  }

  // Build update payload
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.visibility) {
    if (body.visibility === 'private' && user.tier === 'free') {
      return c.json({ error: 'Private content requires Pro tier or above' }, 403);
    }
    updates.visibility = body.visibility;
  }

  if (body.data) {
    updates.data = body.data;
  }

  if (body.version) {
    updates.version = body.version;
  }

  const { data: updated, error: updateError } = await adminClient
    .from('content')
    .update(updates)
    .eq('id', contentId)
    .select('*')
    .single();

  if (updateError) {
    return c.json({ error: 'Failed to update content', details: updateError.message }, 500);
  }

  // Create version history entry if data or version changed
  if (body.data || body.version) {
    await adminClient.from('content_versions').insert({
      content_id: contentId,
      version: updated.version,
      data: updated.data as Record<string, unknown>,
      created_by: user.id,
    });
  }

  return c.json({
    id: updated.id,
    type: updated.type,
    slug: updated.slug,
    namespace: updated.namespace,
    status: updated.status,
    version: updated.version,
    visibility: updated.visibility,
    updated_at: updated.updated_at,
  });
});

// DELETE /content/:id -- Delete content
publishRoutes.delete('/content/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const contentId = c.req.param('id');

  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from('content')
    .select('id, owner_id')
    .eq('id', contentId)
    .single();

  if (!existing) {
    return c.json({ error: 'Content not found' }, 404);
  }

  if (existing.owner_id !== user.id) {
    return c.json({ error: 'Forbidden: you do not own this content' }, 403);
  }

  const { error } = await adminClient
    .from('content')
    .delete()
    .eq('id', contentId);

  if (error) {
    return c.json({ error: 'Failed to delete content', details: error.message }, 500);
  }

  return c.json({ message: 'Content deleted' });
});

// GET /my/content -- List current user's content
publishRoutes.get('/my/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const { limit, offset } = parsePagination(
    c.req.query('limit'),
    c.req.query('offset')
  );
  const status = c.req.query('status');

  const adminClient = createAdminClient();

  let query = adminClient
    .from('content')
    .select('id, type, slug, namespace, visibility, status, version, data, published_at, created_at, updated_at', {
      count: 'exact',
    })
    .eq('owner_id', user.id);

  if (status) {
    query = query.eq('status', status);
  }

  query = query
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return c.json({ error: 'Failed to fetch content', details: error.message }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    items: (data ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      slug: item.slug,
      namespace: item.namespace,
      visibility: item.visibility,
      status: item.status,
      version: item.version,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      ...(item.data as Record<string, unknown>),
    })),
  });
});
```

**Commit:** `feat(api): add content publishing CRUD and my-content routes`

---

## Task 8: Organization Routes

### Files to create

- **Create:** `apps/api/src/routes/orgs.ts`

### Steps

- [ ] **8.1** Create `apps/api/src/routes/orgs.ts`:

```ts
import { Hono } from 'hono';
import type { Env, ContentType } from '../types.js';
import { CONTENT_TYPES, parsePagination } from '../types.js';
import { requireAuth, requireTier } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';

export const orgRoutes = new Hono<Env>();

orgRoutes.use('/*', requireAuth());

// Helper: check if user is a member of the org and return their role
async function getOrgMembership(
  orgSlug: string,
  userId: string
): Promise<{ org: { id: string; name: string; slug: string; tier: string }; role: string } | null> {
  const adminClient = createAdminClient();

  const { data: org } = await adminClient
    .from('organizations')
    .select('id, name, slug, tier')
    .eq('slug', orgSlug)
    .single();

  if (!org) return null;

  const { data: membership } = await adminClient
    .from('org_members')
    .select('role')
    .eq('org_id', org.id)
    .eq('user_id', userId)
    .single();

  if (!membership) return null;

  return { org, role: membership.role };
}

// GET /orgs/:slug
orgRoutes.get('/orgs/:slug', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const orgSlug = c.req.param('slug');

  const result = await getOrgMembership(orgSlug, user.id);
  if (!result) {
    return c.json({ error: 'Organization not found or access denied' }, 404);
  }

  const adminClient = createAdminClient();
  const { count: memberCount } = await adminClient
    .from('org_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('org_id', result.org.id);

  return c.json({
    id: result.org.id,
    name: result.org.name,
    slug: result.org.slug,
    tier: result.org.tier,
    your_role: result.role,
    member_count: memberCount ?? 0,
  });
});

// GET /orgs/:slug/content
orgRoutes.get('/orgs/:slug/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const orgSlug = c.req.param('slug');
  const { limit, offset } = parsePagination(
    c.req.query('limit'),
    c.req.query('offset')
  );

  const result = await getOrgMembership(orgSlug, user.id);
  if (!result) {
    return c.json({ error: 'Organization not found or access denied' }, 404);
  }

  const adminClient = createAdminClient();
  const { data, error, count } = await adminClient
    .from('content')
    .select('id, type, slug, namespace, visibility, status, version, data, published_at, created_at, updated_at', {
      count: 'exact',
    })
    .eq('org_id', result.org.id)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: 'Failed to fetch org content', details: error.message }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    items: (data ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      slug: item.slug,
      namespace: item.namespace,
      visibility: item.visibility,
      status: item.status,
      version: item.version,
      published_at: item.published_at,
      ...(item.data as Record<string, unknown>),
    })),
  });
});

// POST /orgs/:slug/members
orgRoutes.post('/orgs/:slug/members', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const orgSlug = c.req.param('slug');

  const result = await getOrgMembership(orgSlug, user.id);
  if (!result) {
    return c.json({ error: 'Organization not found or access denied' }, 404);
  }

  if (result.role !== 'owner' && result.role !== 'admin') {
    return c.json({ error: 'Only owners and admins can add members' }, 403);
  }

  let body: { user_id: string; role?: 'admin' | 'member' };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.user_id || typeof body.user_id !== 'string') {
    return c.json({ error: 'Field "user_id" is required' }, 400);
  }

  const role = body.role ?? 'member';
  if (!['admin', 'member'].includes(role)) {
    return c.json({ error: 'Role must be "admin" or "member"' }, 400);
  }

  // Cannot assign owner role via API
  const adminClient = createAdminClient();

  // Check if user exists
  const { data: targetUser } = await adminClient
    .from('users')
    .select('id')
    .eq('id', body.user_id)
    .single();

  if (!targetUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Check if already a member
  const { data: existingMember } = await adminClient
    .from('org_members')
    .select('user_id')
    .eq('org_id', result.org.id)
    .eq('user_id', body.user_id)
    .single();

  if (existingMember) {
    return c.json({ error: 'User is already a member of this organization' }, 409);
  }

  const { error } = await adminClient
    .from('org_members')
    .insert({
      org_id: result.org.id,
      user_id: body.user_id,
      role,
    });

  if (error) {
    return c.json({ error: 'Failed to add member', details: error.message }, 500);
  }

  return c.json({ message: 'Member added', user_id: body.user_id, role }, 201);
});

// DELETE /orgs/:slug/members/:user_id
orgRoutes.delete('/orgs/:slug/members/:user_id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const orgSlug = c.req.param('slug');
  const targetUserId = c.req.param('user_id');

  const result = await getOrgMembership(orgSlug, user.id);
  if (!result) {
    return c.json({ error: 'Organization not found or access denied' }, 404);
  }

  if (result.role !== 'owner' && result.role !== 'admin') {
    return c.json({ error: 'Only owners and admins can remove members' }, 403);
  }

  // Cannot remove the owner
  const adminClient = createAdminClient();
  const { data: targetMembership } = await adminClient
    .from('org_members')
    .select('role')
    .eq('org_id', result.org.id)
    .eq('user_id', targetUserId)
    .single();

  if (!targetMembership) {
    return c.json({ error: 'Member not found' }, 404);
  }

  if (targetMembership.role === 'owner') {
    return c.json({ error: 'Cannot remove the organization owner' }, 403);
  }

  // Admins cannot remove other admins
  if (targetMembership.role === 'admin' && result.role !== 'owner') {
    return c.json({ error: 'Only the owner can remove admins' }, 403);
  }

  const { error } = await adminClient
    .from('org_members')
    .delete()
    .eq('org_id', result.org.id)
    .eq('user_id', targetUserId);

  if (error) {
    return c.json({ error: 'Failed to remove member', details: error.message }, 500);
  }

  return c.json({ message: 'Member removed' });
});

// PATCH /orgs/:slug/members/:user_id
orgRoutes.patch('/orgs/:slug/members/:user_id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const orgSlug = c.req.param('slug');
  const targetUserId = c.req.param('user_id');

  const result = await getOrgMembership(orgSlug, user.id);
  if (!result) {
    return c.json({ error: 'Organization not found or access denied' }, 404);
  }

  if (result.role !== 'owner') {
    return c.json({ error: 'Only the owner can change member roles' }, 403);
  }

  let body: { role: 'admin' | 'member' };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.role || !['admin', 'member'].includes(body.role)) {
    return c.json({ error: 'Role must be "admin" or "member"' }, 400);
  }

  // Cannot change owner's role
  const adminClient = createAdminClient();
  const { data: targetMembership } = await adminClient
    .from('org_members')
    .select('role')
    .eq('org_id', result.org.id)
    .eq('user_id', targetUserId)
    .single();

  if (!targetMembership) {
    return c.json({ error: 'Member not found' }, 404);
  }

  if (targetMembership.role === 'owner') {
    return c.json({ error: 'Cannot change the owner role' }, 403);
  }

  const { error } = await adminClient
    .from('org_members')
    .update({ role: body.role })
    .eq('org_id', result.org.id)
    .eq('user_id', targetUserId);

  if (error) {
    return c.json({ error: 'Failed to update role', details: error.message }, 500);
  }

  return c.json({ message: 'Role updated', user_id: targetUserId, role: body.role });
});

// POST /orgs/:slug/content -- Publish content to org namespace
orgRoutes.post('/orgs/:slug/content', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const user = auth.user!;
  const orgSlug = c.req.param('slug');

  const result = await getOrgMembership(orgSlug, user.id);
  if (!result) {
    return c.json({ error: 'Organization not found or access denied' }, 404);
  }

  if (result.role !== 'owner' && result.role !== 'admin') {
    return c.json({ error: 'Only owners and admins can publish org content' }, 403);
  }

  let body: {
    type: ContentType;
    slug: string;
    visibility?: 'public' | 'private';
    version: string;
    data: Record<string, unknown>;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.type || !CONTENT_TYPES.includes(body.type)) {
    return c.json({
      error: `Invalid type. Must be one of: ${CONTENT_TYPES.join(', ')}`,
    }, 400);
  }

  if (!body.slug || typeof body.slug !== 'string') {
    return c.json({ error: 'Field "slug" is required' }, 400);
  }

  if (!body.version || typeof body.version !== 'string') {
    return c.json({ error: 'Field "version" is required' }, 400);
  }

  if (!body.data || typeof body.data !== 'object') {
    return c.json({ error: 'Field "data" is required and must be an object' }, 400);
  }

  const namespace = `@org:${orgSlug}`;
  const visibility = body.visibility ?? 'public';

  // Org content published by admins/owners is always instant (no moderation queue)
  const status = 'published';
  const publishedAt = new Date().toISOString();

  const adminClient = createAdminClient();

  // Check for duplicate
  const { data: existing } = await adminClient
    .from('content')
    .select('id')
    .eq('namespace', namespace)
    .eq('type', body.type)
    .eq('slug', body.slug)
    .single();

  if (existing) {
    return c.json({ error: 'Content with this type/slug already exists in this org' }, 409);
  }

  const { data: content, error: insertError } = await adminClient
    .from('content')
    .insert({
      type: body.type,
      slug: body.slug,
      namespace,
      owner_id: user.id,
      org_id: result.org.id,
      visibility,
      status,
      version: body.version,
      data: body.data,
      published_at: publishedAt,
    })
    .select('*')
    .single();

  if (insertError) {
    return c.json({ error: 'Failed to publish content', details: insertError.message }, 500);
  }

  // Version history
  await adminClient.from('content_versions').insert({
    content_id: content.id,
    version: body.version,
    data: body.data,
    created_by: user.id,
  });

  return c.json(
    {
      id: content.id,
      type: content.type,
      slug: content.slug,
      namespace: content.namespace,
      org_id: content.org_id,
      status: content.status,
      version: content.version,
      visibility: content.visibility,
      published_at: content.published_at,
      created_at: content.created_at,
    },
    201
  );
});
```

**Commit:** `feat(api): add organization management and org content routes`

---

## Task 9: Admin Routes (Moderation + Sync)

### Files to create/modify

- **Create:** `apps/api/src/routes/admin.ts`
- **Modify:** `apps/api/src/middleware/auth.ts` (add `requireAdmin` middleware)

### Steps

- [ ] **9.1** Add `requireAdmin` middleware to `apps/api/src/middleware/auth.ts`. Append after the existing `requireTier` function:

```ts
export function requireAdmin() {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth') as AuthContext | undefined;

    if (!auth?.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!auth.isAdmin) {
      return c.json({ error: 'Forbidden: admin access required' }, 403);
    }

    await next();
  };
}
```

- [ ] **9.2** Update `getAuthContext` in `apps/api/src/middleware/auth.ts` to detect admin status. The admin check uses the `ADMIN_USER_IDS` env var (comma-separated UUIDs). Replace the `isAdmin: false` in both the JWT and API key auth return blocks with a dynamic check:

In the JWT auth block, change:
```ts
        return {
          user: {
            id: profile.id,
            email: profile.email,
            tier: profile.tier,
            trusted: profile.trusted,
            reputation_score: profile.reputation_score,
          },
          isAuthenticated: true,
          isAdmin: false,
        };
```
to:
```ts
        return {
          user: {
            id: profile.id,
            email: profile.email,
            tier: profile.tier,
            trusted: profile.trusted,
            reputation_score: profile.reputation_score,
          },
          isAuthenticated: true,
          isAdmin: isAdminUser(profile.id),
        };
```

In the API key auth block, change `isAdmin: false` to `isAdmin: isAdminUser(profile.id)` as well.

Add this helper function at the top of the file (after the imports):

```ts
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

function isAdminUser(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}
```

- [ ] **9.3** Create `apps/api/src/routes/admin.ts`:

```ts
import { Hono } from 'hono';
import type { Env, ContentType } from '../types.js';
import { CONTENT_TYPES } from '../types.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import type { AuthContext } from '../middleware/auth.js';
import { createAdminClient } from '../db/client.js';

export const adminRoutes = new Hono<Env>();

adminRoutes.use('/*', requireAuth());
adminRoutes.use('/*', requireAdmin());

// GET /admin/moderation/queue
adminRoutes.get('/admin/moderation/queue', async (c) => {
  const status = c.req.query('status') ?? 'pending';
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10), 0);

  const adminClient = createAdminClient();

  const { data, error, count } = await adminClient
    .from('moderation_queue')
    .select(
      `
      id,
      status,
      submitted_at,
      submitted_by,
      reviewed_by,
      reviewed_at,
      rejection_reason,
      notes,
      content:content_id (
        id,
        type,
        slug,
        namespace,
        version,
        data,
        owner_id,
        visibility
      )
    `,
      { count: 'exact' }
    )
    .eq('status', status)
    .order('submitted_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return c.json({ error: 'Failed to fetch moderation queue', details: error.message }, 500);
  }

  return c.json({
    total: count ?? 0,
    limit,
    offset,
    items: data ?? [],
  });
});

// POST /admin/moderation/:id/approve
adminRoutes.post('/admin/moderation/:id/approve', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const moderationId = c.req.param('id');

  let body: { notes?: string } = {};
  try {
    body = await c.req.json();
  } catch {
    // Body is optional for approve
  }

  const adminClient = createAdminClient();

  // Get the moderation entry
  const { data: entry } = await adminClient
    .from('moderation_queue')
    .select('id, content_id, submitted_by, status')
    .eq('id', moderationId)
    .single();

  if (!entry) {
    return c.json({ error: 'Moderation entry not found' }, 404);
  }

  if (entry.status !== 'pending') {
    return c.json({ error: `Entry already ${entry.status}` }, 400);
  }

  const now = new Date().toISOString();

  // Update moderation queue
  await adminClient
    .from('moderation_queue')
    .update({
      status: 'approved',
      reviewed_by: auth.user!.id,
      reviewed_at: now,
      notes: body.notes ?? null,
    })
    .eq('id', moderationId);

  // Update content status to published
  await adminClient
    .from('content')
    .update({
      status: 'published',
      published_at: now,
      updated_at: now,
    })
    .eq('id', entry.content_id);

  // Award reputation: +10 to submitter
  const { data: submitter } = await adminClient
    .from('users')
    .select('reputation_score, trusted')
    .eq('id', entry.submitted_by)
    .single();

  if (submitter) {
    const newScore = submitter.reputation_score + 10;

    // Check trust threshold: score >= 50, at least 3 approved, no rejections in 30 days
    let shouldTrust = false;
    if (newScore >= 50) {
      const { count: approvedCount } = await adminClient
        .from('moderation_queue')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', entry.submitted_by)
        .eq('status', 'approved');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: recentRejections } = await adminClient
        .from('moderation_queue')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', entry.submitted_by)
        .eq('status', 'rejected')
        .gte('reviewed_at', thirtyDaysAgo);

      // approvedCount includes this current approval
      shouldTrust = (approvedCount ?? 0) >= 3 && (recentRejections ?? 0) === 0;
    }

    await adminClient
      .from('users')
      .update({
        reputation_score: newScore,
        trusted: shouldTrust || submitter.trusted,
        updated_at: now,
      })
      .eq('id', entry.submitted_by);
  }

  return c.json({
    message: 'Content approved and published',
    content_id: entry.content_id,
  });
});

// POST /admin/moderation/:id/reject
adminRoutes.post('/admin/moderation/:id/reject', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const moderationId = c.req.param('id');

  let body: { rejection_reason: string; notes?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.rejection_reason || typeof body.rejection_reason !== 'string') {
    return c.json({ error: 'Field "rejection_reason" is required' }, 400);
  }

  const adminClient = createAdminClient();

  const { data: entry } = await adminClient
    .from('moderation_queue')
    .select('id, content_id, submitted_by, status')
    .eq('id', moderationId)
    .single();

  if (!entry) {
    return c.json({ error: 'Moderation entry not found' }, 404);
  }

  if (entry.status !== 'pending') {
    return c.json({ error: `Entry already ${entry.status}` }, 400);
  }

  const now = new Date().toISOString();

  // Update moderation queue
  await adminClient
    .from('moderation_queue')
    .update({
      status: 'rejected',
      reviewed_by: auth.user!.id,
      reviewed_at: now,
      rejection_reason: body.rejection_reason,
      notes: body.notes ?? null,
    })
    .eq('id', moderationId);

  // Update content status
  await adminClient
    .from('content')
    .update({
      status: 'rejected',
      updated_at: now,
    })
    .eq('id', entry.content_id);

  // Deduct reputation: -5 to submitter
  const { data: submitter } = await adminClient
    .from('users')
    .select('reputation_score, trusted')
    .eq('id', entry.submitted_by)
    .single();

  if (submitter) {
    const newScore = Math.max(0, submitter.reputation_score - 5);
    const updates: Record<string, unknown> = {
      reputation_score: newScore,
      updated_at: now,
    };

    // If trusted user gets a rejection, revoke trust
    if (submitter.trusted) {
      updates.trusted = false;
    }

    await adminClient
      .from('users')
      .update(updates)
      .eq('id', entry.submitted_by);
  }

  return c.json({
    message: 'Content rejected',
    content_id: entry.content_id,
  });
});

// POST /admin/sync -- Bulk upsert official content from CI/CD
adminRoutes.post('/admin/sync', async (c) => {
  let body: {
    type: string;
    item: Record<string, unknown>;
  };

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Normalize type: accept both plural ("patterns") and singular ("pattern")
  let contentType: ContentType;
  const typeMap: Record<string, ContentType> = {
    patterns: 'pattern',
    recipes: 'recipe',
    themes: 'theme',
    blueprints: 'blueprint',
    archetypes: 'archetype',
    shells: 'shell',
    pattern: 'pattern',
    recipe: 'recipe',
    theme: 'theme',
    blueprint: 'blueprint',
    archetype: 'archetype',
    shell: 'shell',
  };

  contentType = typeMap[body.type];
  if (!contentType) {
    return c.json({ error: `Invalid type: "${body.type}"` }, 400);
  }

  const item = body.item;
  const slug = (item.id as string) || (item.slug as string);

  if (!slug) {
    return c.json({ error: 'Item must have an "id" or "slug" field' }, 400);
  }

  const auth = c.get('auth') as AuthContext;
  const adminClient = createAdminClient();

  // Upsert: check if exists, then insert or update
  const { data: existing } = await adminClient
    .from('content')
    .select('id')
    .eq('namespace', '@official')
    .eq('type', contentType)
    .eq('slug', slug)
    .single();

  const now = new Date().toISOString();
  const version = (item.version as string) || '1.0.0';

  if (existing) {
    // Update
    const { error } = await adminClient
      .from('content')
      .update({
        data: item,
        version,
        updated_at: now,
        status: 'published',
        published_at: now,
      })
      .eq('id', existing.id);

    if (error) {
      return c.json({ error: 'Failed to update content', details: error.message }, 500);
    }

    // Version history
    await adminClient.from('content_versions').insert({
      content_id: existing.id,
      version,
      data: item,
      created_by: auth.user!.id,
    });

    return c.json({ action: 'updated', id: existing.id, slug, type: contentType });
  } else {
    // Insert
    const { data: inserted, error } = await adminClient
      .from('content')
      .insert({
        type: contentType,
        slug,
        namespace: '@official',
        owner_id: auth.user!.id,
        visibility: 'public',
        status: 'published',
        version,
        data: item,
        published_at: now,
      })
      .select('id')
      .single();

    if (error) {
      return c.json({ error: 'Failed to insert content', details: error.message }, 500);
    }

    // Version history
    await adminClient.from('content_versions').insert({
      content_id: inserted.id,
      version,
      data: item,
      created_by: auth.user!.id,
    });

    return c.json({ action: 'created', id: inserted.id, slug, type: contentType }, 201);
  }
});
```

**Commit:** `feat(api): add admin moderation queue and CI/CD sync routes`

---

## Task 10: Write Tests

### Files to create

- **Create:** `apps/api/src/routes/health.test.ts`
- **Create:** `apps/api/src/routes/content.test.ts`
- **Create:** `apps/api/src/routes/search.test.ts`
- **Create:** `apps/api/src/routes/auth.test.ts`
- **Create:** `apps/api/src/routes/publish.test.ts`
- **Create:** `apps/api/src/routes/orgs.test.ts`
- **Create:** `apps/api/src/routes/admin.test.ts`
- **Create:** `apps/api/src/middleware/rate-limit.test.ts`
- **Create:** `apps/api/vitest.config.ts`
- **Create:** `apps/api/src/test-utils.ts`

### Steps

- [ ] **10.1** Create `apps/api/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: [],
  },
});
```

- [ ] **10.2** Create `apps/api/src/test-utils.ts` with mock factories for Supabase and auth:

```ts
import { vi } from 'vitest';
import type { AuthContext, AuthUser } from './middleware/auth.js';

// Mock user factory
export function mockUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'user-123',
    email: 'test@example.com',
    tier: 'pro',
    trusted: false,
    reputation_score: 0,
    ...overrides,
  };
}

export function mockAuthContext(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    user: mockUser(),
    isAuthenticated: true,
    isAdmin: false,
    ...overrides,
  };
}

export function mockUnauthContext(): AuthContext {
  return {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  };
}

// Mock Supabase query builder that chains fluently
export function createMockQueryBuilder(resolvedValue: { data: unknown; error: unknown; count?: number }) {
  const builder: Record<string, unknown> = {};
  const methods = [
    'select', 'insert', 'update', 'delete', 'eq', 'neq', 'in',
    'is', 'or', 'order', 'range', 'single', 'gte', 'lte', 'ilike',
    'limit', 'head',
  ];

  for (const method of methods) {
    builder[method] = vi.fn().mockReturnValue(builder);
  }

  // Terminal methods return the resolved value
  builder.single = vi.fn().mockResolvedValue(resolvedValue);
  builder.then = vi.fn((resolve: (value: unknown) => void) => resolve(resolvedValue));

  // Make it thenable so await works
  Object.defineProperty(builder, 'then', {
    value: (resolve: (value: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
    writable: true,
    configurable: true,
  });

  return builder;
}

// Create a mock Supabase client
export function createMockSupabase() {
  return {
    from: vi.fn().mockReturnValue(createMockQueryBuilder({ data: null, error: null })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  };
}
```

- [ ] **10.3** Create `apps/api/src/routes/health.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { healthRoutes } from './health.js';

describe('GET /health', () => {
  const app = new Hono();
  app.route('/', healthRoutes);

  it('returns status ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.version).toBe('2.0.0');
    expect(json.timestamp).toBeDefined();
  });
});
```

- [ ] **10.4** Create `apps/api/src/middleware/rate-limit.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { rateLimiter, _rateLimitStore, TIER_LIMITS } from './rate-limit.js';

describe('rateLimiter', () => {
  beforeEach(() => {
    _rateLimitStore.clear();
  });

  it('allows requests under the limit', async () => {
    const app = new Hono<Env>();
    app.use('*', async (c, next) => {
      c.set('auth', { user: null, isAuthenticated: false, isAdmin: false });
      await next();
    });
    app.use('*', rateLimiter());
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe(String(TIER_LIMITS.unauthenticated));
  });

  it('returns 429 when limit exceeded', async () => {
    const app = new Hono<Env>();
    app.use('*', async (c, next) => {
      c.set('auth', { user: null, isAuthenticated: false, isAdmin: false });
      await next();
    });
    app.use('*', rateLimiter());
    app.get('/test', (c) => c.json({ ok: true }));

    // Exhaust the limit
    for (let i = 0; i < TIER_LIMITS.unauthenticated; i++) {
      await app.request('/test', {
        headers: { 'x-forwarded-for': '5.6.7.8' },
      });
    }

    const res = await app.request('/test', {
      headers: { 'x-forwarded-for': '5.6.7.8' },
    });

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toBe('Rate limit exceeded');
  });

  it('uses higher limit for authenticated pro user', async () => {
    const app = new Hono<Env>();
    app.use('*', async (c, next) => {
      c.set('auth', {
        user: { id: 'u1', email: 'a@b.com', tier: 'pro', trusted: false, reputation_score: 0 },
        isAuthenticated: true,
        isAdmin: false,
      });
      await next();
    });
    app.use('*', rateLimiter());
    app.get('/test', (c) => c.json({ ok: true }));

    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe(String(TIER_LIMITS.pro));
  });
});
```

- [ ] **10.5** Create `apps/api/src/routes/content.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types.js';

// Mock supabase before importing routes
vi.mock('../db/client.js', () => {
  const mockFrom = vi.fn();
  return {
    supabase: { from: mockFrom },
    createUserClient: vi.fn(),
    createAdminClient: vi.fn(),
  };
});

import { contentRoutes } from './content.js';
import { supabase } from '../db/client.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.use('*', async (c, next) => {
    c.set('auth', { user: null, isAuthenticated: false, isAdmin: false });
    await next();
  });
  app.route('/v1', contentRoutes);
  return app;
}

describe('Content routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /v1/patterns', () => {
    it('returns paginated patterns', async () => {
      const mockData = [
        {
          id: '1',
          type: 'pattern',
          slug: 'hero',
          namespace: '@official',
          visibility: 'public',
          version: '1.0.0',
          data: { name: 'Hero', description: 'A hero section' },
          published_at: '2026-01-01T00:00:00Z',
          owner_id: 'u1',
        },
      ];

      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockData, error: null, count: 1 }),
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable);

      const app = createTestApp();
      const res = await app.request('/v1/patterns?limit=10&offset=0');

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.total).toBe(1);
      expect(json.items).toHaveLength(1);
      expect(json.items[0].slug).toBe('hero');
    });
  });

  describe('GET /v1/patterns/:namespace/:slug', () => {
    it('returns 404 for nonexistent pattern', async () => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      };

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable);

      const app = createTestApp();
      const res = await app.request('/v1/patterns/@official/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /v1/validate', () => {
    it('returns valid for correct essence file', async () => {
      const app = createTestApp();
      const res = await app.request('/v1/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '2.0.0',
          platform: { type: 'spa' },
          structure: [],
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.valid).toBe(true);
    });

    it('returns errors for missing fields', async () => {
      const app = createTestApp();
      const res = await app.request('/v1/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.valid).toBe(false);
      expect(json.errors.length).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **10.6** Create `apps/api/src/routes/search.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types.js';

vi.mock('../db/client.js', () => {
  const mockFrom = vi.fn();
  return {
    supabase: { from: mockFrom },
    createUserClient: vi.fn(),
    createAdminClient: vi.fn(),
  };
});

import { searchRoutes } from './search.js';
import { supabase } from '../db/client.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.use('*', async (c, next) => {
    c.set('auth', { user: null, isAuthenticated: false, isAdmin: false });
    await next();
  });
  app.route('/v1', searchRoutes);
  return app;
}

describe('Search routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when q is missing', async () => {
    const app = createTestApp();
    const res = await app.request('/v1/search');
    expect(res.status).toBe(400);
  });

  it('returns search results', async () => {
    const chainable = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            type: 'pattern',
            slug: 'hero',
            namespace: '@official',
            version: '1.0.0',
            data: { name: 'Hero Section', description: 'A hero' },
            published_at: '2026-01-01T00:00:00Z',
          },
        ],
        error: null,
        count: 1,
      }),
    };

    (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue(chainable);

    const app = createTestApp();
    const res = await app.request('/v1/search?q=hero');
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.total).toBe(1);
    expect(json.results[0].slug).toBe('hero');
  });
});
```

- [ ] **10.7** Create `apps/api/src/routes/auth.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { mockUser, mockAuthContext } from '../test-utils.js';

const mockAdminFrom = vi.fn();
vi.mock('../db/client.js', () => ({
  supabase: { from: vi.fn() },
  createUserClient: vi.fn(),
  createAdminClient: () => ({ from: mockAdminFrom }),
}));

vi.mock('../middleware/auth.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../middleware/auth.js')>();
  return {
    ...actual,
    requireAuth: () => async (c: any, next: any) => {
      const user = mockUser();
      c.set('auth', mockAuthContext({ user }));
      await next();
    },
    optionalAuth: () => async (c: any, next: any) => {
      await next();
    },
  };
});

import { authRoutes } from './auth.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', authRoutes);
  return app;
}

describe('Auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /v1/me', () => {
    it('returns user profile', async () => {
      const user = mockUser();
      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: user.id,
            email: user.email,
            tier: user.tier,
            reputation_score: user.reputation_score,
            trusted: user.trusted,
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
          error: null,
        }),
      };
      mockAdminFrom.mockReturnValue(chainable);

      const app = createTestApp();
      const res = await app.request('/v1/me');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.user.id).toBe(user.id);
    });
  });

  describe('GET /v1/api-keys', () => {
    it('returns list of api keys', async () => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 'key-1', name: 'test key', scopes: ['read'], last_used_at: null, created_at: '2026-01-01', revoked_at: null },
          ],
          error: null,
        }),
      };
      mockAdminFrom.mockReturnValue(chainable);

      const app = createTestApp();
      const res = await app.request('/v1/api-keys');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.keys).toHaveLength(1);
    });
  });
});
```

- [ ] **10.8** Create `apps/api/src/routes/publish.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { mockUser, mockAuthContext } from '../test-utils.js';

const mockAdminFrom = vi.fn();
vi.mock('../db/client.js', () => ({
  supabase: { from: vi.fn() },
  createUserClient: vi.fn(),
  createAdminClient: () => ({ from: mockAdminFrom }),
}));

vi.mock('../middleware/auth.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../middleware/auth.js')>();
  return {
    ...actual,
    requireAuth: () => async (c: any, next: any) => {
      c.set('auth', mockAuthContext({ user: mockUser({ trusted: true }) }));
      await next();
    },
    optionalAuth: () => async (c: any, next: any) => {
      await next();
    },
  };
});

import { publishRoutes } from './publish.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', publishRoutes);
  return app;
}

describe('Publish routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /v1/content', () => {
    it('rejects invalid type', async () => {
      const app = createTestApp();
      const res = await app.request('/v1/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'invalid', slug: 'test', version: '1.0.0', data: {} }),
      });
      expect(res.status).toBe(400);
    });

    it('creates content for trusted user', async () => {
      // Mock: no existing content
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'c1',
            type: 'pattern',
            slug: 'test-pattern',
            namespace: '@community',
            status: 'published',
            version: '1.0.0',
            visibility: 'public',
            published_at: '2026-01-01T00:00:00Z',
            created_at: '2026-01-01T00:00:00Z',
            data: { name: 'Test' },
          },
          error: null,
        }),
      };

      const versionChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      let callCount = 0;
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === 'content') {
          callCount++;
          return callCount === 1 ? selectChain : insertChain;
        }
        if (table === 'content_versions') return versionChain;
        return selectChain;
      });

      const app = createTestApp();
      const res = await app.request('/v1/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pattern',
          slug: 'test-pattern',
          version: '1.0.0',
          data: { name: 'Test' },
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.status).toBe('published');
    });
  });

  describe('DELETE /v1/content/:id', () => {
    it('returns 404 for nonexistent content', async () => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockAdminFrom.mockReturnValue(chainable);

      const app = createTestApp();
      const res = await app.request('/v1/content/nonexistent', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });
});
```

- [ ] **10.9** Create `apps/api/src/routes/orgs.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { mockUser, mockAuthContext } from '../test-utils.js';

const mockAdminFrom = vi.fn();
vi.mock('../db/client.js', () => ({
  supabase: { from: vi.fn() },
  createUserClient: vi.fn(),
  createAdminClient: () => ({ from: mockAdminFrom }),
}));

vi.mock('../middleware/auth.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../middleware/auth.js')>();
  return {
    ...actual,
    requireAuth: () => async (c: any, next: any) => {
      c.set('auth', mockAuthContext({ user: mockUser({ tier: 'team' }) }));
      await next();
    },
    optionalAuth: () => async (c: any, next: any) => {
      await next();
    },
  };
});

import { orgRoutes } from './orgs.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', orgRoutes);
  return app;
}

describe('Org routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /v1/orgs/:slug', () => {
    it('returns 404 when user is not a member', async () => {
      // Mock: org exists but user is not a member
      let callCount = 0;
      mockAdminFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // organizations table
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'org-1', name: 'Acme', slug: 'acme', tier: 'team' },
              error: null,
            }),
          };
        }
        // org_members table
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const app = createTestApp();
      const res = await app.request('/v1/orgs/acme');
      expect(res.status).toBe(404);
    });
  });
});
```

- [ ] **10.10** Create `apps/api/src/routes/admin.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { mockUser, mockAuthContext } from '../test-utils.js';

const mockAdminFrom = vi.fn();
vi.mock('../db/client.js', () => ({
  supabase: { from: vi.fn() },
  createUserClient: vi.fn(),
  createAdminClient: () => ({ from: mockAdminFrom }),
}));

vi.mock('../middleware/auth.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../middleware/auth.js')>();
  return {
    ...actual,
    requireAuth: () => async (c: any, next: any) => {
      c.set('auth', mockAuthContext({ isAdmin: true }));
      await next();
    },
    requireAdmin: () => async (c: any, next: any) => {
      await next();
    },
    optionalAuth: () => async (c: any, next: any) => {
      await next();
    },
  };
});

import { adminRoutes } from './admin.js';

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', adminRoutes);
  return app;
}

describe('Admin routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /v1/admin/moderation/queue', () => {
    it('returns moderation queue', async () => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };
      mockAdminFrom.mockReturnValue(chainable);

      const app = createTestApp();
      const res = await app.request('/v1/admin/moderation/queue');
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.total).toBe(0);
      expect(json.items).toEqual([]);
    });
  });

  describe('POST /v1/admin/sync', () => {
    it('creates new official content', async () => {
      // Mock: no existing content (select returns null), insert succeeds
      let callCount = 0;
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === 'content') {
          callCount++;
          if (callCount === 1) {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
          }
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'new-1' },
              error: null,
            }),
          };
        }
        if (table === 'content_versions') {
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const app = createTestApp();
      const res = await app.request('/v1/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'patterns',
          item: { id: 'hero', name: 'Hero', version: '1.0.0' },
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.action).toBe('created');
      expect(json.slug).toBe('hero');
    });
  });
});
```

- [ ] **10.11** Run all tests:

```bash
cd apps/api && pnpm test
```

**Commit:** `test(api): add tests for all route modules and rate limiting`

---

## Task 11: Final Integration + Cleanup

### Steps

- [ ] **11.1** Verify the full app builds:

```bash
cd apps/api && pnpm build
```

- [ ] **11.2** Verify the built app starts (will fail without env vars, but should load):

```bash
cd apps/api && PORT=3001 node dist/index.js || true
```

- [ ] **11.3** Update the root `package.json` if the `api` workspace scripts changed (likely no changes needed since the workspace just references `apps/api`).

- [ ] **11.4** Add `dist/` to `apps/api/.gitignore` if not already present:

```
dist/
node_modules/
.env
.env.local
```

**Commit:** `chore(api): add build config and gitignore`

---

## Summary of all new/modified files

| Action | File |
|--------|------|
| Modify | `apps/api/package.json` |
| Create | `apps/api/tsconfig.json` |
| Create | `apps/api/tsup.config.ts` |
| Create | `apps/api/vitest.config.ts` |
| Create | `apps/api/.gitignore` |
| Create | `apps/api/src/index.ts` |
| Create | `apps/api/src/app.ts` |
| Create | `apps/api/src/types.ts` |
| Create | `apps/api/src/test-utils.ts` |
| Delete | `apps/api/src/index.js` |
| Modify | `apps/api/src/middleware/auth.ts` |
| Create | `apps/api/src/middleware/rate-limit.ts` |
| Create | `apps/api/src/routes/health.ts` |
| Create | `apps/api/src/routes/content.ts` |
| Create | `apps/api/src/routes/search.ts` |
| Create | `apps/api/src/routes/auth.ts` |
| Create | `apps/api/src/routes/publish.ts` |
| Create | `apps/api/src/routes/orgs.ts` |
| Create | `apps/api/src/routes/admin.ts` |
| Create | `apps/api/src/routes/health.test.ts` |
| Create | `apps/api/src/routes/content.test.ts` |
| Create | `apps/api/src/routes/search.test.ts` |
| Create | `apps/api/src/routes/auth.test.ts` |
| Create | `apps/api/src/routes/publish.test.ts` |
| Create | `apps/api/src/routes/orgs.test.ts` |
| Create | `apps/api/src/routes/admin.test.ts` |
| Create | `apps/api/src/middleware/rate-limit.test.ts` |

## Environment variables required

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_USER_IDS=uuid1,uuid2
PORT=3001
```
