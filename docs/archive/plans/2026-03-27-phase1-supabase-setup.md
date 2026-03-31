# Phase 1: Supabase Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Supabase as the database and auth provider for the Decantr registry platform.

**Architecture:** Supabase provides Postgres database with Row-Level Security (RLS) and built-in authentication (GitHub OAuth, Google OAuth, Email/Password). The API server will connect via the Supabase client library.

**Tech Stack:** Supabase, PostgreSQL, TypeScript, pnpm

**Spec:** `docs/specs/2026-03-27-registry-platform-design.md`

---

## File Structure

### Create

```
apps/api/
├── src/
│   ├── db/
│   │   ├── client.ts              # Supabase client initialization
│   │   ├── types.ts               # Generated database types
│   │   └── index.ts               # Re-exports
│   └── middleware/
│       └── auth.ts                # Auth middleware for Hono
├── supabase/
│   ├── migrations/
│   │   ├── 00001_create_users.sql
│   │   ├── 00002_create_organizations.sql
│   │   ├── 00003_create_api_keys.sql
│   │   ├── 00004_create_content.sql
│   │   ├── 00005_create_moderation.sql
│   │   ├── 00006_create_rls_policies.sql
│   │   └── 00007_create_triggers.sql
│   └── config.toml                # Supabase local config
├── .env.example
└── .env.local                     # (gitignored)
```

### Modify

```
apps/api/package.json             # Add @supabase/supabase-js dependency
apps/api/src/index.ts             # Add auth middleware
.gitignore                        # Add .env.local
```

---

## Task 1: Initialize Supabase Project

**Files:**
- Create: `apps/api/supabase/config.toml`
- Create: `apps/api/.env.example`
- Modify: `apps/api/package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Install Supabase CLI globally (if not installed)**

```bash
npm install -g supabase
```

Verify: `supabase --version` returns version number.

- [ ] **Step 2: Add Supabase dependencies to apps/api**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/api
pnpm add @supabase/supabase-js
pnpm add -D supabase
```

- [ ] **Step 3: Initialize Supabase in apps/api**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/api
supabase init
```

This creates `supabase/config.toml`.

- [ ] **Step 4: Create .env.example**

Create `apps/api/.env.example`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
PORT=3000
NODE_ENV=development
```

- [ ] **Step 5: Update .gitignore**

Add to root `.gitignore`:

```gitignore
# Environment files
.env.local
.env.*.local
apps/api/.env.local
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/package.json apps/api/pnpm-lock.yaml apps/api/supabase apps/api/.env.example .gitignore
git commit -m "feat(api): initialize supabase project structure"
```

---

## Task 2: Create Users Table Migration

**Files:**
- Create: `apps/api/supabase/migrations/00001_create_users.sql`

- [ ] **Step 1: Create migration file**

Create `apps/api/supabase/migrations/00001_create_users.sql`:

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'team', 'enterprise')),
  stripe_customer_id TEXT,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  trusted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on email for lookups
CREATE INDEX idx_users_email ON public.users(email);

-- Create index on stripe_customer_id for webhook lookups
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data (except tier, trusted, reputation_score)
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Comment on table
COMMENT ON TABLE public.users IS 'Extended user profile data linked to Supabase auth';
```

- [ ] **Step 2: Verify SQL syntax**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/api
supabase db lint
```

Expected: No syntax errors.

- [ ] **Step 3: Commit**

```bash
git add apps/api/supabase/migrations/00001_create_users.sql
git commit -m "feat(api): add users table migration"
```

---

## Task 3: Create Organizations Table Migration

**Files:**
- Create: `apps/api/supabase/migrations/00002_create_organizations.sql`

- [ ] **Step 1: Create migration file**

Create `apps/api/supabase/migrations/00002_create_organizations.sql`:

```sql
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('team', 'enterprise')),
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on slug for lookups
CREATE INDEX idx_organizations_slug ON public.organizations(slug);

-- Create index on owner_id
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create org_members table
CREATE TABLE public.org_members (
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- Create index on user_id for member lookups
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);

-- Enable RLS
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Org members can read their org
CREATE POLICY org_select_members ON public.organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid())
  );

-- Only owner can update org
CREATE POLICY org_update_owner ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- Only owner can delete org
CREATE POLICY org_delete_owner ON public.organizations
  FOR DELETE USING (owner_id = auth.uid());

-- Members can see other members in their org
CREATE POLICY org_members_select ON public.org_members
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid())
  );

-- Owner/admin can manage members
CREATE POLICY org_members_insert ON public.org_members
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY org_members_delete ON public.org_members
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Comment on tables
COMMENT ON TABLE public.organizations IS 'Team/Enterprise organizations';
COMMENT ON TABLE public.org_members IS 'Organization membership with roles';
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/supabase/migrations/00002_create_organizations.sql
git commit -m "feat(api): add organizations and org_members tables migration"
```

---

## Task 4: Create API Keys Table Migration

**Files:**
- Create: `apps/api/supabase/migrations/00003_create_api_keys.sql`

- [ ] **Step 1: Create migration file**

Create `apps/api/supabase/migrations/00003_create_api_keys.sql`:

```sql
-- Create api_keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read'],
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Create index on user_id
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

-- Create index on key_hash for lookups (used during auth)
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Create index on org_id
CREATE INDEX idx_api_keys_org_id ON public.api_keys(org_id);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can read their own API keys
CREATE POLICY api_keys_select_own ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own API keys
CREATE POLICY api_keys_insert_own ON public.api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update (revoke) their own API keys
CREATE POLICY api_keys_update_own ON public.api_keys
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own API keys
CREATE POLICY api_keys_delete_own ON public.api_keys
  FOR DELETE USING (user_id = auth.uid());

-- Org admins can manage org API keys
CREATE POLICY api_keys_select_org ON public.api_keys
  FOR SELECT USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Comment on table
COMMENT ON TABLE public.api_keys IS 'API keys for programmatic access';
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/supabase/migrations/00003_create_api_keys.sql
git commit -m "feat(api): add api_keys table migration"
```

---

## Task 5: Create Content Table Migration

**Files:**
- Create: `apps/api/supabase/migrations/00004_create_content.sql`

- [ ] **Step 1: Create migration file**

Create `apps/api/supabase/migrations/00004_create_content.sql`:

```sql
-- Create content table
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('pattern', 'recipe', 'theme', 'blueprint', 'archetype', 'shell')),
  slug TEXT NOT NULL,
  namespace TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id),
  org_id UUID REFERENCES public.organizations(id),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  version TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE (namespace, type, slug)
);

-- Create indexes
CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_content_namespace ON public.content(namespace);
CREATE INDEX idx_content_owner_id ON public.content(owner_id);
CREATE INDEX idx_content_org_id ON public.content(org_id);
CREATE INDEX idx_content_status ON public.content(status);
CREATE INDEX idx_content_visibility ON public.content(visibility);

-- GIN index for JSONB search
CREATE INDEX idx_content_data ON public.content USING GIN (data);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Anyone can read public published content
CREATE POLICY content_select_public ON public.content
  FOR SELECT USING (
    visibility = 'public' AND status = 'published'
  );

-- Users can read their own content (any status)
CREATE POLICY content_select_own ON public.content
  FOR SELECT USING (owner_id = auth.uid());

-- Org members can read org content
CREATE POLICY content_select_org ON public.content
  FOR SELECT USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Users can insert content they own
CREATE POLICY content_insert_own ON public.content
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own content
CREATE POLICY content_update_own ON public.content
  FOR UPDATE USING (owner_id = auth.uid());

-- Org admins can update org content
CREATE POLICY content_update_org ON public.content
  FOR UPDATE USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Users can delete their own content
CREATE POLICY content_delete_own ON public.content
  FOR DELETE USING (owner_id = auth.uid());

-- Org admins can delete org content
CREATE POLICY content_delete_org ON public.content
  FOR DELETE USING (
    org_id IS NOT NULL AND org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create content_versions table for history
CREATE TABLE public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Create indexes
CREATE INDEX idx_content_versions_content_id ON public.content_versions(content_id);

-- Enable RLS
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Same read permissions as content
CREATE POLICY content_versions_select ON public.content_versions
  FOR SELECT USING (
    content_id IN (SELECT id FROM public.content)
  );

-- Comment on tables
COMMENT ON TABLE public.content IS 'Registry content items (patterns, themes, etc.)';
COMMENT ON TABLE public.content_versions IS 'Version history for content items';
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/supabase/migrations/00004_create_content.sql
git commit -m "feat(api): add content and content_versions tables migration"
```

---

## Task 6: Create Moderation Queue Migration

**Files:**
- Create: `apps/api/supabase/migrations/00005_create_moderation.sql`

- [ ] **Step 1: Create migration file**

Create `apps/api/supabase/migrations/00005_create_moderation.sql`:

```sql
-- Create moderation_queue table
CREATE TABLE public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  notes TEXT
);

-- Create indexes
CREATE INDEX idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX idx_moderation_queue_submitted_by ON public.moderation_queue(submitted_by);
CREATE INDEX idx_moderation_queue_submitted_at ON public.moderation_queue(submitted_at);

-- Enable RLS
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- Users can see their own submissions
CREATE POLICY moderation_select_own ON public.moderation_queue
  FOR SELECT USING (submitted_by = auth.uid());

-- Service role can manage all (for admin API)
-- Note: Service role bypasses RLS, so no explicit policy needed

-- Comment on table
COMMENT ON TABLE public.moderation_queue IS 'Content moderation queue for community submissions';
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/supabase/migrations/00005_create_moderation.sql
git commit -m "feat(api): add moderation_queue table migration"
```

---

## Task 7: Create Database Triggers

**Files:**
- Create: `apps/api/supabase/migrations/00006_create_triggers.sql`

- [ ] **Step 1: Create migration file**

Create `apps/api/supabase/migrations/00006_create_triggers.sql`:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger for organizations table
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger for content table
CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to add content to moderation queue
CREATE OR REPLACE FUNCTION public.queue_content_for_moderation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if status is 'pending' and namespace is @community
  IF NEW.status = 'pending' AND NEW.namespace = '@community' THEN
    INSERT INTO public.moderation_queue (content_id, submitted_by)
    VALUES (NEW.id, NEW.owner_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-queue community content
CREATE TRIGGER content_moderation_queue
  AFTER INSERT ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_content_for_moderation();

-- Comment on functions
COMMENT ON FUNCTION public.update_updated_at IS 'Updates updated_at column on row update';
COMMENT ON FUNCTION public.handle_new_user IS 'Creates user profile when auth user signs up';
COMMENT ON FUNCTION public.queue_content_for_moderation IS 'Adds community content to moderation queue';
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/supabase/migrations/00006_create_triggers.sql
git commit -m "feat(api): add database triggers for timestamps and auto-operations"
```

---

## Task 8: Create Supabase Client

**Files:**
- Create: `apps/api/src/db/client.ts`
- Create: `apps/api/src/db/index.ts`

- [ ] **Step 1: Create Supabase client**

Create `apps/api/src/db/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Client for authenticated user requests (uses RLS)
export function createUserClient(accessToken?: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}

// Admin client that bypasses RLS (for server-side operations)
export function createAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Default client for public operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create index export**

Create `apps/api/src/db/index.ts`:

```typescript
export { supabase, createUserClient, createAdminClient } from './client.js';
export type { Database } from './types.js';
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/db/client.ts apps/api/src/db/index.ts
git commit -m "feat(api): add supabase client initialization"
```

---

## Task 9: Generate Database Types

**Files:**
- Create: `apps/api/src/db/types.ts`

- [ ] **Step 1: Create placeholder types file**

Create `apps/api/src/db/types.ts`:

```typescript
// This file will be auto-generated by Supabase CLI after migrations run
// Run: supabase gen types typescript --local > src/db/types.ts

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
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
          tier?: 'free' | 'pro' | 'team' | 'enterprise';
          stripe_customer_id?: string | null;
          reputation_score?: number;
          trusted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          tier: 'team' | 'enterprise';
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          tier: 'team' | 'enterprise';
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          tier?: 'team' | 'enterprise';
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      org_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
        Update: {
          org_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member';
          created_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          org_id: string | null;
          key_hash: string;
          name: string;
          scopes: string[];
          last_used_at: string | null;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id?: string | null;
          key_hash: string;
          name: string;
          scopes?: string[];
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          org_id?: string | null;
          key_hash?: string;
          name?: string;
          scopes?: string[];
          last_used_at?: string | null;
          created_at?: string;
          revoked_at?: string | null;
        };
      };
      content: {
        Row: {
          id: string;
          type: 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';
          slug: string;
          namespace: string;
          owner_id: string;
          org_id: string | null;
          visibility: 'public' | 'private';
          status: 'pending' | 'approved' | 'rejected' | 'published';
          version: string;
          data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          type: 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';
          slug: string;
          namespace: string;
          owner_id: string;
          org_id?: string | null;
          visibility?: 'public' | 'private';
          status?: 'pending' | 'approved' | 'rejected' | 'published';
          version: string;
          data: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          type?: 'pattern' | 'recipe' | 'theme' | 'blueprint' | 'archetype' | 'shell';
          slug?: string;
          namespace?: string;
          owner_id?: string;
          org_id?: string | null;
          visibility?: 'public' | 'private';
          status?: 'pending' | 'approved' | 'rejected' | 'published';
          version?: string;
          data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      content_versions: {
        Row: {
          id: string;
          content_id: string;
          version: string;
          data: Record<string, unknown>;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          version: string;
          data: Record<string, unknown>;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          version?: string;
          data?: Record<string, unknown>;
          created_at?: string;
          created_by?: string;
        };
      };
      moderation_queue: {
        Row: {
          id: string;
          content_id: string;
          submitted_by: string;
          submitted_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          content_id: string;
          submitted_by: string;
          submitted_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          content_id?: string;
          submitted_by?: string;
          submitted_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          notes?: string | null;
        };
      };
    };
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/db/types.ts
git commit -m "feat(api): add database types"
```

---

## Task 10: Create Auth Middleware

**Files:**
- Create: `apps/api/src/middleware/auth.ts`

- [ ] **Step 1: Create auth middleware**

Create `apps/api/src/middleware/auth.ts`:

```typescript
import type { Context, Next } from 'hono';
import { createUserClient, createAdminClient } from '../db/client.js';
import { createHash } from 'crypto';

export interface AuthUser {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  trusted: boolean;
  reputation_score: number;
}

export interface AuthContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Hash API key for lookup
function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Extract auth context from request
export async function getAuthContext(c: Context): Promise<AuthContext> {
  const authHeader = c.req.header('Authorization');
  const apiKeyHeader = c.req.header('X-API-Key');

  // Try JWT auth first
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const client = createUserClient(token);

    const { data: { user: authUser }, error: authError } = await client.auth.getUser();

    if (!authError && authUser) {
      const { data: profile } = await client
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        return {
          user: {
            id: profile.id,
            email: profile.email,
            tier: profile.tier,
            trusted: profile.trusted,
            reputation_score: profile.reputation_score,
          },
          isAuthenticated: true,
          isAdmin: false, // TODO: Check admin role
        };
      }
    }
  }

  // Try API key auth
  if (apiKeyHeader) {
    const keyHash = hashApiKey(apiKeyHeader);
    const adminClient = createAdminClient();

    const { data: apiKey } = await adminClient
      .from('api_keys')
      .select('*, users(*)')
      .eq('key_hash', keyHash)
      .is('revoked_at', null)
      .single();

    if (apiKey && apiKey.users) {
      // Update last_used_at
      await adminClient
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', apiKey.id);

      const profile = apiKey.users as unknown as AuthUser;
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
    }
  }

  return {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  };
}

// Middleware to require authentication
export function requireAuth() {
  return async (c: Context, next: Next) => {
    const auth = await getAuthContext(c);

    if (!auth.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('auth', auth);
    await next();
  };
}

// Middleware to optionally attach auth context
export function optionalAuth() {
  return async (c: Context, next: Next) => {
    const auth = await getAuthContext(c);
    c.set('auth', auth);
    await next();
  };
}

// Middleware to require specific tier
export function requireTier(...tiers: Array<'free' | 'pro' | 'team' | 'enterprise'>) {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth') as AuthContext | undefined;

    if (!auth?.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!tiers.includes(auth.user.tier)) {
      return c.json({ error: 'Insufficient tier. Upgrade required.' }, 403);
    }

    await next();
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/middleware/auth.ts
git commit -m "feat(api): add auth middleware for JWT and API key authentication"
```

---

## Task 11: Create Supabase Project in Dashboard

**Files:**
- Create: `apps/api/.env.local` (gitignored)

- [ ] **Step 1: Create Supabase project**

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name: `decantr-registry`
4. Choose a database password (save this securely)
5. Choose region (closest to your users)
6. Click "Create new project"

Wait for project to be created (~2 minutes).

- [ ] **Step 2: Get project credentials**

1. Go to Project Settings > API
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

- [ ] **Step 3: Create .env.local**

Create `apps/api/.env.local`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
```

- [ ] **Step 4: Link local project to Supabase**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/api
supabase link --project-ref your-project-id
```

Enter database password when prompted.

- [ ] **Step 5: Verify connection**

```bash
supabase db remote status
```

Expected: Shows connection to remote database.

---

## Task 12: Run Migrations

**Files:**
- No new files

- [ ] **Step 1: Push migrations to Supabase**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/api
supabase db push
```

Expected: All migrations applied successfully.

- [ ] **Step 2: Verify tables exist**

```bash
supabase db remote status
```

Or check in Supabase Dashboard > Table Editor.

Expected tables:
- `users`
- `organizations`
- `org_members`
- `api_keys`
- `content`
- `content_versions`
- `moderation_queue`

- [ ] **Step 3: Generate types from live database**

```bash
supabase gen types typescript --project-id your-project-id > src/db/types.ts
```

This overwrites the placeholder types with accurate generated types.

- [ ] **Step 4: Commit generated types**

```bash
git add apps/api/src/db/types.ts
git commit -m "feat(api): update database types from supabase"
```

---

## Task 13: Configure Auth Providers

**Files:**
- No new files (Supabase dashboard configuration)

- [ ] **Step 1: Enable Email/Password auth**

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable "Email" provider
3. Settings:
   - Enable "Confirm email" (recommended for production)
   - Set Site URL: `https://decantr.ai`
   - Set Redirect URLs: `https://decantr.ai/auth/callback`, `http://localhost:3000/auth/callback`

- [ ] **Step 2: Enable GitHub OAuth**

1. Go to GitHub > Settings > Developer settings > OAuth Apps > New OAuth App
2. Fill in:
   - Application name: `Decantr`
   - Homepage URL: `https://decantr.ai`
   - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret
4. In Supabase Dashboard > Authentication > Providers > GitHub:
   - Enable GitHub
   - Enter Client ID and Client Secret

- [ ] **Step 3: Enable Google OAuth**

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Fill in:
   - Application type: Web application
   - Name: `Decantr`
   - Authorized JavaScript origins: `https://your-project-id.supabase.co`
   - Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret
5. In Supabase Dashboard > Authentication > Providers > Google:
   - Enable Google
   - Enter Client ID and Client Secret

- [ ] **Step 4: Configure email templates (optional)**

1. Go to Supabase Dashboard > Authentication > Email Templates
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Magic link

---

## Task 14: Test Database Connection

**Files:**
- Create: `apps/api/test/db.test.ts`

- [ ] **Step 1: Create test file**

Create `apps/api/test/db.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { createAdminClient } from '../src/db/client.js';

describe('Database Connection', () => {
  beforeAll(() => {
    // Load environment variables
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL not set. Run with: dotenv -e .env.local -- vitest');
    }
  });

  it('should connect to Supabase', async () => {
    const client = createAdminClient();
    const { data, error } = await client.from('users').select('count').limit(0);

    expect(error).toBeNull();
  });

  it('should have users table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('users').select('id').limit(1);

    expect(error).toBeNull();
  });

  it('should have content table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('content').select('id').limit(1);

    expect(error).toBeNull();
  });

  it('should have organizations table', async () => {
    const client = createAdminClient();
    const { error } = await client.from('organizations').select('id').limit(1);

    expect(error).toBeNull();
  });
});
```

- [ ] **Step 2: Add vitest and dotenv-cli**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/api
pnpm add -D vitest dotenv-cli
```

- [ ] **Step 3: Add test script to package.json**

Update `apps/api/package.json` scripts:

```json
{
  "scripts": {
    "test": "dotenv -e .env.local -- vitest run",
    "test:watch": "dotenv -e .env.local -- vitest"
  }
}
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/api
pnpm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/api/test/db.test.ts apps/api/package.json apps/api/pnpm-lock.yaml
git commit -m "test(api): add database connection tests"
```

---

## Task 15: Final Verification

**Files:**
- No new files

- [ ] **Step 1: Verify all files exist**

```bash
ls -la apps/api/supabase/migrations/
```

Expected: 6 migration files.

- [ ] **Step 2: Verify Supabase tables in dashboard**

Go to Supabase Dashboard > Table Editor and verify all tables exist with correct columns.

- [ ] **Step 3: Test auth flow manually**

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Enter test email and password
4. Check that user appears in both `auth.users` and `public.users` tables

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(api): complete supabase setup (phase 1)"
```

---

## Summary

After completing this plan, you will have:

- [x] Supabase project created and linked
- [x] Database schema with 7 tables
- [x] Row-Level Security policies
- [x] Auto-triggers for timestamps and user creation
- [x] TypeScript types for all tables
- [x] Auth middleware for JWT and API key authentication
- [x] GitHub and Google OAuth configured
- [x] Tests verifying database connection

**Next:** Proceed to Phase 2 (Registry API v2) to build the API endpoints.
