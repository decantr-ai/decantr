# User Profiles and Slugs Implementation Plan

**Date:** 2026-03-28
**Status:** Draft

## Overview

Add usernames (slugs) to user accounts and create public profile pages. Users get a unique `@username` that appears on content they publish and links to a public profile page showing their published content, reputation, and tier.

## Current State

- **Users table** (`apps/api/src/db/types.ts`): `id`, `email`, `display_name`, `tier`, `stripe_customer_id`, `reputation_score`, `trusted`, `created_at`, `updated_at` -- no username column.
- **Content endpoints** (`apps/api/src/routes/content.ts`): Join `users!owner_id(display_name)` and return `owner_name` as a flat string. No username in response.
- **Search endpoint** (`apps/api/src/routes/search.ts`): Uses `search_content` RPC which returns `owner_display_name`. No username.
- **Content card** (`apps/web/src/components/registry/content-card.tsx`): Shows `by {item.owner_name}` as plain text (no link).
- **Content detail** (`apps/web/src/app/registry/[type]/[namespace]/[slug]/page.tsx`): Shows `Author: {content.owner_name}` as plain text (no link).
- **Settings page** (`apps/web/src/app/dashboard/settings/page.tsx`): Only has `display_name` field. Updates via Supabase auth metadata.
- **Settings action** (`apps/web/src/app/dashboard/settings/actions.ts`): Uses `supabase.auth.updateUser` -- does not touch `public.users` directly.
- **No public profile page** or public user API endpoint exists.
- **RLS on users table**: `users_select_own` (select own row only), `users_update_own` (update own row only). No public read policy.

---

## Task 1: DB Migration -- Add `username` Column

**Commit message:** `feat(api): add username column to users table with backfill and unique constraint`

### File: `apps/api/supabase/migrations/00010_add_username.sql`

```sql
-- Add username column to users table
ALTER TABLE public.users ADD COLUMN username TEXT;

-- Create a helper to generate a slug from text
-- Strips non-alphanumeric, lowercases, replaces spaces with hyphens, trims hyphens
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(trim(input)),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '[\s-]+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill: generate username from display_name, falling back to email prefix
-- Append a random suffix to avoid collisions during backfill
UPDATE public.users
SET username = public.slugify(
  COALESCE(display_name, split_part(email, '@', 1))
) || '-' || substr(gen_random_uuid()::text, 1, 4)
WHERE username IS NULL;

-- Now make it NOT NULL and add unique constraint + index
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
CREATE INDEX idx_users_username ON public.users(username);

-- Add a CHECK constraint for format: 3-30 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
ALTER TABLE public.users ADD CONSTRAINT users_username_format CHECK (
  username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$'
);

-- Update handle_new_user trigger to auto-generate username on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  candidate TEXT;
  counter INTEGER := 0;
BEGIN
  -- Derive base username from auth metadata or email
  base_username := public.slugify(
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  );

  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || '-user';
  END IF;

  -- Truncate to 30 chars max
  base_username := left(base_username, 30);

  -- Ensure it ends with alphanumeric (trim trailing hyphens)
  base_username := trim(both '-' from base_username);

  -- Find a unique username by appending a counter if needed
  candidate := base_username;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE users.username = candidate) LOOP
    counter := counter + 1;
    candidate := left(base_username, 30 - length(counter::text) - 1) || '-' || counter::text;
  END LOOP;

  INSERT INTO public.users (id, email, display_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    ),
    candidate
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy allowing anyone to read username, display_name, reputation_score, tier, created_at
-- This is needed for the public profile page
CREATE POLICY users_public_read ON public.users
  FOR SELECT
  USING (true);

-- Drop the old select-own policy since the public read policy is more permissive
-- The API layer controls which fields are exposed publicly
DROP POLICY IF EXISTS users_select_own ON public.users;

-- Update the search function to also return owner_username
DROP FUNCTION IF EXISTS public.search_content(TEXT, TEXT, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.search_content(
  search_query TEXT,
  content_type TEXT DEFAULT NULL,
  content_namespace TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  slug TEXT,
  namespace TEXT,
  version TEXT,
  data JSONB,
  published_at TIMESTAMPTZ,
  owner_display_name TEXT,
  owner_username TEXT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.type,
    c.slug,
    c.namespace,
    c.version,
    c.data,
    c.published_at,
    u.display_name AS owner_display_name,
    u.username AS owner_username,
    COUNT(*) OVER() AS total_count
  FROM public.content c
  LEFT JOIN public.users u ON u.id = c.owner_id
  WHERE
    c.visibility = 'public'
    AND c.status = 'published'
    AND (
      c.slug ILIKE '%' || search_query || '%'
      OR (c.data->>'name') ILIKE '%' || search_query || '%'
      OR (c.data->>'description') ILIKE '%' || search_query || '%'
      OR (c.data->>'id') ILIKE '%' || search_query || '%'
    )
    AND (content_type IS NULL OR c.type = content_type)
    AND (content_namespace IS NULL OR c.namespace = content_namespace)
  ORDER BY
    CASE
      WHEN c.slug = search_query THEN 0
      WHEN c.slug ILIKE search_query || '%' THEN 1
      WHEN (c.data->>'name') ILIKE search_query || '%' THEN 2
      ELSE 3
    END,
    c.published_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON COLUMN public.users.username IS 'Unique URL-safe username (3-30 chars, lowercase alphanumeric + hyphens)';
```

### File: `apps/api/src/db/types.ts`

Add `username` to all three Row/Insert/Update interfaces for the `users` table.

**In `Row`**, add after `email`:
```typescript
username: string;
```

**In `Insert`**, add after `email`:
```typescript
username?: string;
```

**In `Update`**, add after `email`:
```typescript
username?: string;
```

Full diff for the `users` table type:

```diff
 users: {
   Row: {
     id: string;
     email: string;
+    username: string;
     display_name: string | null;
     tier: 'free' | 'pro' | 'team' | 'enterprise';
     stripe_customer_id: string | null;
     reputation_score: number;
     trusted: boolean;
     created_at: string;
     updated_at: string;
   };
   Insert: {
     id: string;
     email: string;
+    username?: string;
     display_name?: string | null;
     tier?: 'free' | 'pro' | 'team' | 'enterprise';
     stripe_customer_id?: string | null;
     reputation_score?: number;
     trusted?: boolean;
     created_at?: string;
     updated_at?: string;
   };
   Update: {
     id?: string;
     email?: string;
+    username?: string;
     display_name?: string | null;
     tier?: 'free' | 'pro' | 'team' | 'enterprise';
     stripe_customer_id?: string | null;
     reputation_score?: number;
     trusted?: boolean;
     created_at?: string;
     updated_at?: string;
   };
   Relationships: [];
 };
```

---

## Task 2: API -- Add Public User Endpoints and Update Content Responses

**Commit message:** `feat(api): add public user profile endpoints and include username in content responses`

### File: `apps/api/src/routes/users.ts` (new file)

```typescript
import { Hono } from 'hono';
import type { Env } from '../types.js';
import { parsePagination } from '../types.js';
import { createAdminClient } from '../db/client.js';

export const userRoutes = new Hono<Env>();

// GET /v1/users/:username - Public profile
userRoutes.get('/users/:username', async (c) => {
  const username = c.req.param('username').toLowerCase();
  const client = createAdminClient();

  const { data: user, error } = await client
    .from('users')
    .select('username, display_name, reputation_score, tier, created_at')
    .eq('username', username)
    .single();

  if (error || !user) {
    return c.json({ error: `User "${username}" not found` }, 404);
  }

  // Get content counts by type
  const { data: contentRows } = await client
    .from('content')
    .select('type')
    .eq('owner_id', (
      await client.from('users').select('id').eq('username', username).single()
    ).data!.id)
    .eq('visibility', 'public')
    .eq('status', 'published');

  const contentCounts: Record<string, number> = {};
  let totalContent = 0;
  for (const row of contentRows ?? []) {
    contentCounts[row.type] = (contentCounts[row.type] || 0) + 1;
    totalContent++;
  }

  return c.json({
    username: user.username,
    display_name: user.display_name,
    reputation_score: user.reputation_score,
    tier: user.tier,
    created_at: user.created_at,
    content_count: totalContent,
    content_counts: contentCounts,
  });
});

// GET /v1/users/:username/content - User's published public content (paginated)
userRoutes.get('/users/:username/content', async (c) => {
  const username = c.req.param('username').toLowerCase();
  const typeFilter = c.req.query('type');
  const { limit, offset } = parsePagination(c.req.query('limit'), c.req.query('offset'));

  const client = createAdminClient();

  // Look up user ID from username
  const { data: user, error: userError } = await client
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (userError || !user) {
    return c.json({ error: `User "${username}" not found` }, 404);
  }

  let query = client
    .from('content')
    .select('id, type, slug, namespace, version, data, published_at', { count: 'exact' })
    .eq('owner_id', user.id)
    .eq('visibility', 'public')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (typeFilter) {
    query = query.eq('type', typeFilter);
  }

  const { data, error, count } = await query;

  if (error) {
    return c.json({ error: 'Failed to fetch content' }, 500);
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
      name: (item.data as Record<string, unknown>)?.name,
      description: (item.data as Record<string, unknown>)?.description,
      published_at: item.published_at,
    })),
  });
});
```

### File: `apps/api/src/app.ts`

Add the user routes import and mount.

```diff
 import { billingRoutes } from './routes/billing.js';
+import { userRoutes } from './routes/users.js';
 import { optionalAuth } from './middleware/auth.js';
```

```diff
   app.route('/v1', billingRoutes);
+  app.route('/v1', userRoutes);
```

### File: `apps/api/src/routes/content.ts`

Update the Supabase select to include `username` from the owner join and return `owner_username` in responses.

**Single item endpoint (line 23)** -- change the select:
```diff
-    .select('*, owner:users!owner_id(display_name)')
+    .select('*, owner:users!owner_id(display_name, username)')
```

**Single item response (line 47)** -- add `owner_username`:
```diff
     owner_name: (data as any).owner?.display_name || null,
+    owner_username: (data as any).owner?.username || null,
```

**List endpoint (line 67)** -- change the select:
```diff
-    .select('id, type, slug, namespace, version, data, created_at, updated_at, published_at, owner:users!owner_id(display_name)', { count: 'exact' })
+    .select('id, type, slug, namespace, version, data, created_at, updated_at, published_at, owner:users!owner_id(display_name, username)', { count: 'exact' })
```

**List item mapping (line 97)** -- add `owner_username`:
```diff
       owner_name: (item as any).owner?.display_name || null,
+      owner_username: (item as any).owner?.username || null,
```

### File: `apps/api/src/routes/search.ts`

Update the search results mapping to include `owner_username`.

**Line 65** -- add to the results mapping:
```diff
       owner_name: item.owner_display_name || null,
+      owner_username: item.owner_username || null,
```

---

## Task 3: API -- Update `PATCH /v1/me` to Support Username Changes

**Commit message:** `feat(api): support username updates in PATCH /me endpoint`

### File: `apps/api/src/routes/auth.ts`

**In `GET /me` response (line 28-37)**, add `username`:
```diff
   return c.json({
     id: user.id,
     email: user.email,
+    username: user.username,
     display_name: user.display_name,
     tier: user.tier,
```

**In `PATCH /me` handler (line 41-71)**, add username validation and update support.

Replace the entire PATCH handler with:

```typescript
authRoutes.patch('/me', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const body = await c.req.json();

  const updates: Record<string, unknown> = {};

  if (body.email && typeof body.email === 'string') {
    updates.email = body.email;
  }

  if (body.display_name && typeof body.display_name === 'string') {
    updates.display_name = body.display_name;
  }

  if (body.username !== undefined) {
    const username = String(body.username).toLowerCase().trim();

    // Validate format: 3-30 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
    if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(username)) {
      return c.json({
        error: 'Username must be 3-30 characters, lowercase alphanumeric and hyphens only, cannot start or end with a hyphen',
      }, 400);
    }

    // Check uniqueness
    const client = createAdminClient();
    const { data: existing } = await client
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', auth.user!.id)
      .maybeSingle();

    if (existing) {
      return c.json({ error: 'Username is already taken' }, 409);
    }

    updates.username = username;
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  const client = createAdminClient();
  const { data, error } = await client
    .from('users')
    .update(updates)
    .eq('id', auth.user!.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505' && error.message.includes('username')) {
      return c.json({ error: 'Username is already taken' }, 409);
    }
    return c.json({ error: 'Failed to update profile' }, 500);
  }

  return c.json(data);
});
```

---

## Task 4: Web -- Create Public Profile Page

**Commit message:** `feat(web): add public profile page at /profile/:username`

### File: `apps/web/src/lib/api.ts`

Add the `UserProfile` interface and API methods.

**After the `ContentItem` interface**, add:
```typescript
export interface UserProfile {
  username: string;
  display_name: string | null;
  reputation_score: number;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  created_at: string;
  content_count: number;
  content_counts: Record<string, number>;
}
```

**Add `owner_username` to the `ContentItem` interface**:
```diff
 export interface ContentItem {
   id: string;
   type: string;
   namespace: string;
   slug: string;
   version: string;
   status?: string;
   visibility?: string;
   name?: string;
   description?: string;
   owner_name?: string;
+  owner_username?: string;
   published_at?: string;
   data?: Record<string, unknown>;
 }
```

**Add standalone export functions** at the bottom of the file:
```typescript
export function getUserProfile(username: string) {
  return apiFetch<UserProfile>(`/users/${username}`);
}

export function getUserContent(
  username: string,
  params?: { type?: string; limit?: number; offset?: number }
) {
  const query: Record<string, string> = {};
  if (params?.type) query.type = params.type;
  if (params?.limit != null) query.limit = String(params.limit);
  if (params?.offset != null) query.offset = String(params.offset);
  return apiFetch<{ total: number; items: ContentItem[] }>(
    `/users/${username}/content${Object.keys(query).length ? `?${new URLSearchParams(query)}` : ''}`
  );
}
```

**Add to the `api` object**:
```diff
   // Public
+  getUserProfile: (username: string) => apiFetch<UserProfile>(`/users/${username}`),
+  getUserContent: (username: string, params?: Record<string, string>) => {
+    const query = params ? `?${new URLSearchParams(params)}` : '';
+    return apiFetch<{ total: number; items: ContentItem[] }>(`/users/${username}/content${query}`);
+  },
   listContent: (type: string, params?: Record<string, string>) => {
```

### File: `apps/web/src/app/profile/[username]/page.tsx` (new file)

```tsx
import { notFound } from 'next/navigation';
import { getUserProfile, getUserContent } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ContentCard } from '@/components/registry/content-card';

interface ProfileParams {
  params: Promise<{ username: string }>;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
  enterprise: 'Enterprise',
};

function getReputationBadge(score: number): { label: string; variant: string } {
  if (score >= 500) return { label: 'Trusted Contributor', variant: 'success' };
  if (score >= 100) return { label: 'Active Contributor', variant: 'default' };
  if (score >= 10) return { label: 'Contributor', variant: 'default' };
  return { label: 'Member', variant: 'default' };
}

export async function generateMetadata({ params }: ProfileParams) {
  const { username } = await params;
  const title = `@${username} - Decantr`;
  const description = `View @${username}'s public profile and published content on Decantr.`;
  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
  };
}

export default async function ProfilePage({ params }: ProfileParams) {
  const { username } = await params;

  let profile;
  try {
    profile = await getUserProfile(username);
  } catch {
    notFound();
  }

  let contentResponse;
  try {
    contentResponse = await getUserContent(username, { limit: 24 });
  } catch {
    contentResponse = { total: 0, items: [] };
  }

  const reputation = getReputationBadge(profile.reputation_score);
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const contentTypes = Object.entries(profile.content_counts);

  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      {/* Profile header */}
      <div className="mb-10">
        <h1 className="mb-1 text-3xl font-bold">
          {profile.display_name || `@${profile.username}`}
        </h1>
        <p className="mb-4 text-[var(--fg-muted)]">@{profile.username}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={reputation.variant as 'default' | 'success'}>
            {reputation.label}
          </Badge>
          {profile.tier !== 'free' && (
            <Badge>{TIER_LABELS[profile.tier]}</Badge>
          )}
        </div>
        <p className="mt-3 text-sm text-[var(--fg-dim)]">Member since {memberSince}</p>

        {/* Content counts by type */}
        {contentTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {contentTypes.map(([type, count]) => (
              <span key={type} className="text-xs text-[var(--fg-muted)]">
                {count} {count === 1 ? type : type + 's'}
              </span>
            ))}
            <span className="text-xs font-medium text-[var(--fg)]">
              {profile.content_count} total
            </span>
          </div>
        )}
      </div>

      {/* Published content grid */}
      {contentResponse.items.length > 0 ? (
        <>
          <h2 className="mb-4 text-lg font-semibold">Published Content</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentResponse.items.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--fg-muted)]">No published content yet.</p>
      )}
    </section>
  );
}
```

---

## Task 5: Web -- Update Content Card and Detail to Show Linked `@username`

**Commit message:** `feat(web): link author usernames to profile pages in content views`

### File: `apps/web/src/components/registry/content-card.tsx`

Replace the entire file:

```tsx
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NamespaceBadge } from './namespace-badge';
import type { ContentItem } from '@/lib/api';

export function ContentCard({ item }: { item: ContentItem }) {
  const name = item.name || (item.data?.name as string) || item.slug;
  const description = item.description || (item.data?.description as string) || '';

  return (
    <Link href={`/registry/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`}>
      <Card hover className="h-full">
        <div className="mb-3 flex items-center justify-between">
          <Badge>{item.type}</Badge>
          <NamespaceBadge namespace={item.namespace} />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-[var(--fg)]">{name}</h3>
        <p className="mb-3 line-clamp-2 text-xs text-[var(--fg-muted)]">{description}</p>
        <div className="flex items-center gap-2">
          {item.owner_username && item.namespace !== '@official' && (
            <span
              className="text-xs text-[var(--fg-dim)] hover:text-[var(--fg)] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={`/profile/${item.owner_username}`}>
                by @{item.owner_username}
              </a>
            </span>
          )}
          {!item.owner_username && item.owner_name && item.namespace !== '@official' && (
            <span className="text-xs text-[var(--fg-dim)]">by {item.owner_name}</span>
          )}
          <span className="text-xs text-[var(--fg-muted)]">v{item.version}</span>
        </div>
      </Card>
    </Link>
  );
}
```

Key change: When `owner_username` is present, render a linked `by @username` that navigates to the profile page. The `onClick` stopPropagation prevents the parent `<Link>` from activating when clicking the author name. Falls back to plain `owner_name` for users who haven't had their username backfilled yet (should not happen after migration, but safe).

### File: `apps/web/src/app/registry/[type]/[namespace]/[slug]/page.tsx`

**Replace the author line (lines 59-61)** with a linked version:

```diff
-        {content.owner_name && content.namespace !== '@official' && (
-          <p className="mt-1 text-sm text-[var(--fg-dim)]">Author: {content.owner_name}</p>
-        )}
+        {content.owner_username && content.namespace !== '@official' && (
+          <p className="mt-1 text-sm text-[var(--fg-dim)]">
+            by{' '}
+            <a
+              href={`/profile/${content.owner_username}`}
+              className="hover:text-[var(--fg)] hover:underline"
+            >
+              @{content.owner_username}
+            </a>
+            {' '}&middot; v{content.version}
+          </p>
+        )}
+        {!content.owner_username && content.owner_name && content.namespace !== '@official' && (
+          <p className="mt-1 text-sm text-[var(--fg-dim)]">by {content.owner_name}</p>
+        )}
```

This replaces the plain "Author: Display Name" with "by @username . v1.0.0" format, where the username links to the profile.

---

## Task 6: Web -- Update Dashboard Settings with Username Field

**Commit message:** `feat(web): add username field to dashboard settings page`

### File: `apps/web/src/app/dashboard/settings/actions.ts`

Replace the entire file to support both display name and username updates via the API:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'Not authenticated' };
  }

  const displayName = formData.get('display_name') as string;
  const username = formData.get('username') as string;

  const body: Record<string, string> = {};
  if (displayName) body.display_name = displayName;
  if (username) body.username = username;

  if (Object.keys(body).length === 0) {
    return { error: 'No changes to save' };
  }

  const res = await fetch(`${API_URL}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Update failed' }));
    return { error: data.error || `Update failed (${res.status})` };
  }

  // Also update auth metadata for display_name
  if (displayName) {
    await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
```

### File: `apps/web/src/app/dashboard/settings/page.tsx`

Replace the entire file to add the username field:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { updateProfile, signOut } from './actions';

export default function SettingsPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const result = await updateProfile(formData);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <form action={handleSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="mb-1 block text-xs text-[var(--fg-muted)]">Display Name</label>
            <Input name="display_name" placeholder="Your name" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[var(--fg-muted)]">Username</label>
            <Input name="username" placeholder="your-username" />
            <p className="mt-1 text-xs text-[var(--fg-dim)]">
              3-30 characters. Lowercase letters, numbers, and hyphens only. This appears as @username on your content.
            </p>
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <form action={signOut}>
          <Button type="submit" variant="danger">Sign Out</Button>
        </form>
      </Card>
    </div>
  );
}
```

---

## Task 7: Build, Deploy, Verify

**Commit message:** n/a (this is a verification checklist, not a code change)

### Pre-deploy checklist

1. Run the migration against Supabase:
   ```bash
   supabase db push --db-url "$SUPABASE_DB_URL"
   ```

2. Verify the backfill worked -- every user should have a non-null, unique username:
   ```sql
   SELECT count(*) FROM public.users WHERE username IS NULL;
   -- Should return 0
   SELECT username, count(*) FROM public.users GROUP BY username HAVING count(*) > 1;
   -- Should return 0 rows
   ```

3. Build and type-check the API:
   ```bash
   cd apps/api && pnpm build && pnpm lint
   ```

4. Build and type-check the web app:
   ```bash
   cd apps/web && pnpm build && pnpm lint
   ```

5. Test the new API endpoints locally:
   ```bash
   # Public profile
   curl http://localhost:8787/v1/users/davidaimi | jq

   # User content
   curl http://localhost:8787/v1/users/davidaimi/content | jq

   # Content list now includes owner_username
   curl http://localhost:8787/v1/patterns | jq '.items[0].owner_username'

   # Username update
   curl -X PATCH http://localhost:8787/v1/me \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"username": "new-name"}' | jq
   ```

6. Test the web pages:
   - Visit `/profile/davidaimi` -- should show profile with content grid
   - Visit a content detail page -- author should show as linked `@username`
   - Visit registry listing -- content cards should show linked `@username`
   - Visit `/dashboard/settings` -- username field should be present and functional

7. Test edge cases:
   - Try setting a username that is already taken (expect 409)
   - Try setting a username with invalid characters (expect 400)
   - Try setting a username shorter than 3 or longer than 30 chars (expect 400)
   - Visit `/profile/nonexistent-user` (expect 404 page)

8. Deploy in order:
   1. Run migration (Task 1)
   2. Deploy API (Tasks 2 + 3)
   3. Deploy web (Tasks 4 + 5 + 6)

---

## File Change Summary

| File | Action | Task |
|------|--------|------|
| `apps/api/supabase/migrations/00010_add_username.sql` | Create | 1 |
| `apps/api/src/db/types.ts` | Edit | 1 |
| `apps/api/src/routes/users.ts` | Create | 2 |
| `apps/api/src/app.ts` | Edit | 2 |
| `apps/api/src/routes/content.ts` | Edit | 2 |
| `apps/api/src/routes/search.ts` | Edit | 2 |
| `apps/api/src/routes/auth.ts` | Edit | 3 |
| `apps/web/src/lib/api.ts` | Edit | 4 |
| `apps/web/src/app/profile/[username]/page.tsx` | Create | 4 |
| `apps/web/src/components/registry/content-card.tsx` | Edit | 5 |
| `apps/web/src/app/registry/[type]/[namespace]/[slug]/page.tsx` | Edit | 5 |
| `apps/web/src/app/dashboard/settings/actions.ts` | Edit | 6 |
| `apps/web/src/app/dashboard/settings/page.tsx` | Edit | 6 |
