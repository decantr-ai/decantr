# Decantr Registry Platform Design

**Date:** 2026-03-27
**Status:** Approved
**Author:** David Aimi

---

## Overview

This document specifies the full commercial Decantr registry platform, including database, API, authentication, billing, content publishing, moderation, and web UI.

### Goals

- Database-first architecture with Supabase (Postgres)
- Tiered pricing: Free, Pro ($29/mo), Team ($99/seat/mo), Enterprise
- Direct API publishing for community content (no PR workflow)
- Reputation-gated moderation for new contributors
- Private content for paid tiers
- Web UI for browsing, account management, and content publishing

### Non-Goals

- PR-based content submission workflow
- Bundled content in CLI/MCP (API-first approach)
- On-prem deployment for non-Enterprise tiers

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Web UI                                │
│  Landing Page | Registry Browser | User Dashboard            │
│  Next.js on Vercel                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Registry API                             │
│  Hono on Fly.io                                             │
│  POST /content, GET /patterns, /admin/moderation, etc.      │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   Supabase DB    │ │ Supabase Auth│ │     Stripe       │
│   (Postgres)     │ │ OAuth + Email│ │   Billing        │
└──────────────────┘ └──────────────┘ └──────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│       MCP Server        │     │          CLI            │
│  @decantr/mcp-server    │     │     @decantr/cli        │
│  (API client mode)      │     │   (API client mode)     │
└─────────────────────────┘     └─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    decantr-content repo                      │
│  Official @official content, CI/CD publishes to registry    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tier Model

| Tier | Price | Content Visibility | Infrastructure | Features |
|------|-------|-------------------|----------------|----------|
| **Free** | $0 | Public only | Shared DB | Read registry, publish to @community (queued) |
| **Pro** | $29/mo | Public + private (personal) | Shared DB | Instant publish (if trusted), API keys, private content |
| **Team** | $99/seat/mo | Public + private (org-scoped) | Shared DB | Org namespace, team management, shared API keys |
| **Enterprise** | Custom | Full isolation | Dedicated DB | SSO/OAuth, on-prem option, SLA, audit trail |

---

## Database Schema

### Tables

```sql
-- Users (extended from Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'team', 'enterprise')),
  stripe_customer_id TEXT,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  trusted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organizations (Team/Enterprise)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  tier TEXT NOT NULL CHECK (tier IN ('team', 'enterprise')),
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Members
CREATE TABLE org_members (
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- API Keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{"read"}',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Content
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('pattern', 'recipe', 'theme', 'blueprint', 'archetype', 'shell')),
  slug TEXT NOT NULL,
  namespace TEXT NOT NULL, -- @official, @community, @org:{org_id}
  owner_id UUID NOT NULL REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  version TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  UNIQUE (namespace, type, slug)
);

-- Content Versions (history)
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Moderation Queue
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  notes TEXT
);
```

### Row-Level Security (RLS)

```sql
-- Content: anyone can read public
CREATE POLICY content_select ON content FOR SELECT USING (
  visibility = 'public'
  OR owner_id = auth.uid()
  OR org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
);

-- Content: only owner/admin can update
CREATE POLICY content_update ON content FOR UPDATE USING (
  owner_id = auth.uid()
  OR (org_id IS NOT NULL AND org_id IN (
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
);

-- Content: only owner/admin can delete
CREATE POLICY content_delete ON content FOR DELETE USING (
  owner_id = auth.uid()
  OR (org_id IS NOT NULL AND org_id IN (
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
);
```

---

## Registry API v2

### Base URL

```
https://api.decantr.ai/v1
```

### Authentication

- **Unauthenticated:** Public endpoints, rate limited (30 req/min)
- **JWT:** `Authorization: Bearer <supabase_jwt>` (from Supabase Auth)
- **API Key:** `X-API-Key: <api_key>` (for programmatic access)

### Public Endpoints

```
GET  /health

# List content (paginated)
GET  /patterns?namespace=@official&limit=20&offset=0
GET  /recipes
GET  /themes
GET  /blueprints
GET  /archetypes
GET  /shells

# Get single item
GET  /patterns/:namespace/:slug
GET  /recipes/:namespace/:slug
GET  /themes/:namespace/:slug
GET  /blueprints/:namespace/:slug
GET  /archetypes/:namespace/:slug
GET  /shells/:namespace/:slug

# Search
GET  /search?q=dashboard&type=blueprints&namespace=@official

# Schema
GET  /schema/essence.v3.json
```

### Authenticated Endpoints

```
# User
GET    /me
PATCH  /me

# API Keys
GET    /api-keys
POST   /api-keys
DELETE /api-keys/:id

# Content Publishing
POST   /content
PATCH  /content/:id
DELETE /content/:id
GET    /my/content

# Organization (Team tier)
GET    /orgs/:slug
GET    /orgs/:slug/content
POST   /orgs/:slug/members
DELETE /orgs/:slug/members/:user_id
PATCH  /orgs/:slug/members/:user_id
POST   /orgs/:slug/content
PATCH  /orgs/:slug/content/:id
DELETE /orgs/:slug/content/:id
```

### Admin Endpoints

```
GET    /admin/moderation/queue
POST   /admin/moderation/:id/approve
POST   /admin/moderation/:id/reject
POST   /admin/sync
```

### Rate Limits

| Tier | Requests/min |
|------|--------------|
| Unauthenticated | 30 |
| Free | 60 |
| Pro | 300 |
| Team | 600 |
| Enterprise | Unlimited |

---

## Authentication

### Supabase Auth Configuration

**Providers:**
- GitHub OAuth (primary)
- Google OAuth (primary)
- Email/Password (fallback)

**Redirect URLs:**
- `https://decantr.ai/auth/callback`
- `http://localhost:3000/auth/callback` (dev)

### Permission Matrix

| Action | Free | Pro | Team Member | Team Admin | Trusted |
|--------|------|-----|-------------|------------|---------|
| Read public | Y | Y | Y | Y | Y |
| Read org private | - | - | Y | Y | - |
| Publish public (queued) | Y | Y | Y | Y | - |
| Publish public (instant) | - | - | - | - | Y |
| Publish private | - | Y | Y | Y | - |
| Manage org content | - | - | - | Y | - |
| Manage org members | - | - | - | Y | - |

### API Key Scopes

- `read` — Read public + own content
- `write` — Publish content
- `org:read` — Read org content (if member)
- `org:write` — Publish to org (if admin)

---

## Stripe Integration

### Products

| Product | Price ID | Amount |
|---------|----------|--------|
| Pro | `price_pro_monthly` | $29/mo |
| Team | `price_team_monthly` | $99/seat/mo |
| Enterprise | Custom invoicing | Custom |

### User Flow

1. User clicks "Upgrade" in dashboard
2. Redirect to Stripe Checkout
3. Stripe webhook: `checkout.session.completed`
4. API updates `users.tier` and `stripe_customer_id`

### Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/upgrade subscription, update tier |
| `customer.subscription.updated` | Sync tier, seat count |
| `customer.subscription.deleted` | Downgrade to free, hide private content |
| `invoice.payment_failed` | Flag account, send warning |

### Cancellation Policy

Private content is **hidden** (not deleted) on cancellation. User can resubscribe to restore access.

---

## MCP Server + CLI

### Shared API Client

Both MCP server and CLI use `RegistryAPIClient` from `@decantr/registry`:

```typescript
class RegistryAPIClient {
  constructor(options: {
    baseUrl?: string;      // default: https://api.decantr.ai/v1
    apiKey?: string;
    cacheDir?: string;
  })

  // Content fetching
  async getPattern(namespace: string, slug: string): Promise<Pattern>
  async getTheme(namespace: string, slug: string): Promise<Theme>
  async getBlueprint(namespace: string, slug: string): Promise<Blueprint>
  // ... etc

  // Publishing (authenticated)
  async publishContent(content: ContentPayload): Promise<Content>

  // Cache management
  async cacheContent(content: Content): Promise<void>
  async getCached(type, namespace, slug): Promise<Content | null>
}
```

### Resolution Order

```
1. .decantr/custom/{type}/{id}.json  ← Local custom (NEVER synced)
2. Registry API                       ← Fetch from API
3. .decantr/cache/{namespace}/{type}/ ← Cached responses
```

**No bundled content fallback** — API-first architecture.

### Directory Structure

```
.decantr/
├── custom/                    # User-created, never auto-synced
│   ├── themes/
│   │   └── my-brand.json
│   ├── patterns/
│   │   └── custom-hero.json
│   ├── recipes/
│   ├── blueprints/
│   ├── archetypes/
│   └── shells/
├── cache/                     # Synced from registry
│   ├── @official/
│   │   ├── themes/carbon.json
│   │   └── patterns/hero.json
│   └── @community/
│       └── patterns/cool-widget.json
├── project.json
└── context/
```

### CLI Commands

```bash
# Init
decantr init                          # Minimal boilerplate (offline OK)
# Creates:
#   - decantr.essence.json (empty structure, version, platform only)
#   - .decantr/project.json (project metadata)
#   - .decantr/custom/ (empty directories for themes, patterns, etc.)
#   - DECANTR.md (instructions for AI assistant)

decantr init --blueprint="@official/carbon"  # Fetch from registry
# Fetches blueprint + dependencies, caches in .decantr/cache/,
# scaffolds fully populated essence file

# Auth
decantr login                         # Browser OAuth flow
decantr logout

# Content management
decantr create theme <name>           # → .decantr/custom/themes/
decantr create pattern <name>         # → .decantr/custom/patterns/
decantr list themes                   # Local custom + cached + registry
decantr validate theme <name>

# Publishing
decantr publish theme <name>          # Upload to registry
decantr publish pattern <name>

# Import from registry to local custom
decantr import theme @official/carbon
```

### Custom Content Isolation

- `syncRegistry()` only writes to `.decantr/cache/`
- Never reads or writes `.decantr/custom/`
- Custom content is completely isolated from sync operations

---

## decantr-content Repository

### Structure

```
decantr-content/
├── patterns/
│   ├── hero.json
│   ├── kpi-grid.json
│   └── ... (87 patterns)
├── recipes/
│   ├── carbon.json
│   └── ... (11 recipes)
├── themes/
│   ├── carbon.json
│   └── ... (17 themes)
├── blueprints/
│   ├── saas-dashboard.json
│   └── ... (16 blueprints)
├── archetypes/
│   ├── saas-dashboard.json
│   └── ... (53 archetypes)
├── shells/
│   ├── sidebar-main.json
│   └── ...
├── .github/
│   └── workflows/
│       └── publish.yml
├── package.json
└── README.md
```

### CI/CD Pipeline

```yaml
name: Publish to Registry

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run validate
      - name: Publish to Registry
        env:
          DECANTR_ADMIN_KEY: ${{ secrets.DECANTR_ADMIN_KEY }}
        run: |
          for type in patterns recipes themes blueprints archetypes shells; do
            for file in $type/*.json; do
              curl -X POST "https://api.decantr.ai/v1/admin/sync" \
                -H "Authorization: Bearer $DECANTR_ADMIN_KEY" \
                -H "Content-Type: application/json" \
                -d "{\"type\": \"$type\", \"item\": $(cat $file)}"
            done
          done
```

### Initial Sync

One-time script to pull current registry into repo:

```bash
for type in patterns recipes themes blueprints archetypes shells; do
  curl "https://api.decantr.ai/v1/$type" | jq -c '.items[]' | while read item; do
    slug=$(echo $item | jq -r '.slug // .id')
    echo $item | jq '.' > $type/$slug.json
  done
done
```

---

## Reputation System

### Model

| Field | Description |
|-------|-------------|
| `reputation_score` | Cumulative points (starts at 0) |
| `trusted` | Boolean, enables instant-publish |

### Point System

| Action | Points |
|--------|--------|
| Content approved | +10 |
| Content rejected | -5 |
| Content flagged | -2 |
| Content featured | +25 |

### Trust Threshold

```
trusted = true when:
  - reputation_score >= 50
  - at least 3 approved submissions
  - no rejections in last 30 days
```

### Submission Flow

```
User submits content
       │
       ▼
   user.trusted?
       │
   ┌───┴───┐
  yes     no
   │       │
   ▼       ▼
status = 'published'    status = 'pending'
(instant)               → moderation_queue
                               │
                           admin reviews
                               │
                        ┌──────┴──────┐
                     approve       reject
                        │             │
                        ▼             ▼
               status = 'published'   status = 'rejected'
               reputation += 10       reputation -= 5
               check trust threshold  notify user
```

### Edge Cases

| Scenario | Handling |
|----------|----------|
| Trusted user submits bad content | Flag → review → if rejected, trusted = false |
| Spam submissions | Rate limit: max 5 pending per user |
| Dispute rejection | Manual admin override |

---

## Web UI

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Hosting:** Vercel
- **Auth:** Supabase Auth (SSR)
- **Styling:** Tailwind CSS

### Pages

#### Landing Page (`/`)

- Hero section
- What is Decantr
- How it works
- Before/after comparison
- Pricing tiers
- MCP setup instructions
- Footer

#### Registry Browser (`/registry`)

- Search bar with filters
- Tabs: Patterns | Themes | Blueprints | Recipes | Archetypes | Shells
- Grid of content cards
- Pagination

#### Content Detail (`/registry/[type]/[namespace]/[slug]`)

- Content name, namespace, description
- Preview (if applicable)
- Components/presets list
- JSON view (collapsible)
- Copy JSON / Use in Project buttons

#### Dashboard (`/dashboard`)

- Overview with stats
- Recent activity

#### Dashboard - My Content (`/dashboard/content`)

- List user's published content
- Create new content
- Edit/delete existing

#### Dashboard - API Keys (`/dashboard/api-keys`)

- List keys
- Create new key
- Revoke key

#### Dashboard - Team (`/dashboard/team`) [Team tier only]

- Team members list
- Invite member
- Change roles
- Remove member

#### Dashboard - Team Content (`/dashboard/team/content`) [Team tier only]

- Org content management

#### Dashboard - Settings (`/dashboard/settings`)

- Profile settings
- Notification preferences

#### Dashboard - Billing (`/dashboard/billing`)

- Current plan
- Link to Stripe Billing Portal

### Auth Flow

1. User clicks "Sign In"
2. Supabase Auth UI (GitHub, Google, or Email)
3. Redirect to `/dashboard`
4. Session stored in cookie (SSR-compatible)

---

## Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| 1 | Supabase setup (schema, auth, RLS) |
| 2 | Registry API v2 (CRUD, namespacing, permissions) |
| 3 | Stripe integration (tiers, billing, webhooks) |
| 4 | MCP server + CLI updates (API client, custom content) |
| 5 | decantr-content rebuild + CI/CD |
| 6 | Reputation system + moderation |
| 7 | Web UI (Landing + Registry Browser + Dashboard) |

---

## Scope Notes

**In scope for Phases 1-7:**
- Free, Pro, and Team tiers on shared Supabase infrastructure
- All features described above for these tiers

**Out of scope (future work):**
- Enterprise tier (dedicated DB, SSO, on-prem) — requires separate infrastructure design
- Email notifications for moderation events
- Advanced analytics dashboard
- Mobile app

---

## Open Questions

None — all decisions captured above.

---

## Appendix: Namespace Convention

| Namespace | Owner | Example |
|-----------|-------|---------|
| `@official` | Decantr team | `@official/hero` |
| `@community` | Verified users | `@community/cool-widget` |
| `@org:{slug}` | Organization | `@org:acme/internal-card` |
