# Phase 8: Web UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Decantr registry web application — a Next.js 15+ / React 19 app with Tailwind CSS 4, Supabase Auth SSR, and Vercel hosting. The web UI is dogfooded using Decantr's own design system with the luminarum theme (dark mode, pill shape).

**Architecture:** Next.js App Router at `apps/web/`, calling the Registry API (`apps/api/`) for all data. Supabase Auth via `@supabase/ssr` for session management. Stripe Billing Portal for subscription management. Public pages (landing, registry browser, content detail) are server-rendered. Dashboard pages are protected via middleware.

**Tech Stack:** Next.js 15+, React 19, Tailwind CSS 4, `@supabase/ssr`, Vercel

**Spec:** `docs/specs/2026-03-27-registry-platform-design.md`

---

## Task 1: Scaffold Next.js App

Create the Next.js 15 application with App Router, React 19, Tailwind CSS 4, and Supabase SSR client.

### Files to create/modify

- **Create:** `apps/web/` (via `create-next-app`)
- **Modify:** `apps/web/package.json` (add dependencies)
- **Modify:** `apps/web/next.config.ts`
- **Create:** `apps/web/.env.local.example`
- **Modify:** `pnpm-workspace.yaml` (if not already including `apps/*`)

### Steps

- [ ] **1.1** Scaffold the Next.js app:

```bash
cd apps && pnpm dlx create-next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --turbopack
```

- [ ] **1.2** Install additional dependencies:

```bash
cd apps/web && pnpm add @supabase/ssr @supabase/supabase-js
```

- [ ] **1.3** Verify `pnpm-workspace.yaml` in the monorepo root includes `apps/*`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **1.4** Create `apps/web/.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Registry API
NEXT_PUBLIC_API_URL=http://localhost:8787

# Stripe (for billing portal redirect)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Site URL (used for auth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **1.5** Update `apps/web/next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **1.6** Remove the default Next.js boilerplate content from `apps/web/src/app/page.tsx` and `apps/web/src/app/globals.css`. Keep `globals.css` minimal — just the Tailwind directives.

Replace `apps/web/src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --bg: #0D0D1A;
  --fg: #FAFAFA;
  --muted: #9898A8;
  --code-bg: #0A0A14;
  --coral: #F58882;
  --amber: #FDA303;
  --cyan: #0AF3EB;
  --green: #00E0AB;
  --yellow: #FCD021;
  --orange: #FC8D0D;
  --purple: #6500C6;
  --pink: #FE4474;
  --crimson: #D80F4A;
  --card-bg: rgba(255, 255, 255, 0.04);
  --card-border: rgba(255, 255, 255, 0.08);
  --card-hover-border: rgba(255, 255, 255, 0.16);
  --radius-pill: 9999px;
  --radius-card: 16px;
  --radius-button: 9999px;
  --max-w: 1100px;
  --mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  --sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

body {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--fg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--cyan);
  text-decoration: none;
  transition: color 0.2s;
}
a:hover {
  color: var(--coral);
}
```

Replace `apps/web/src/app/page.tsx` with a minimal placeholder:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Decantr</h1>
    </main>
  );
}
```

### Run

```bash
cd apps/web && pnpm dev
```

Verify the dev server starts without errors and the placeholder page renders.

### Commit

```
feat(web): scaffold next.js 15 app with tailwind 4 and supabase
```

---

## Task 2: Supabase Auth SSR Setup

Create the Supabase client utilities for both server and client components, plus the auth middleware for protected routes.

### Files to create/modify

- **Create:** `apps/web/src/lib/supabase/server.ts`
- **Create:** `apps/web/src/lib/supabase/client.ts`
- **Create:** `apps/web/src/lib/supabase/middleware.ts`
- **Create:** `apps/web/src/middleware.ts`

### Steps

- [ ] **2.1** Create `apps/web/src/lib/supabase/server.ts` — Server-side Supabase client using `@supabase/ssr`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
```

- [ ] **2.2** Create `apps/web/src/lib/supabase/client.ts` — Browser-side Supabase client:

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **2.3** Create `apps/web/src/lib/supabase/middleware.ts` — Middleware helper to refresh auth tokens:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this is required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **2.4** Create `apps/web/src/middleware.ts`:

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Run

```bash
cd apps/web && pnpm build
```

Verify the build succeeds with the Supabase client modules and middleware in place.

### Commit

```
feat(web): add supabase auth ssr with session middleware
```

---

## Task 3: Shared Layout and Components

Create the root layout, navigation bar, footer, sidebar for dashboard, and reusable UI primitives that match the luminarum theme.

### Files to create/modify

- **Modify:** `apps/web/src/app/layout.tsx`
- **Create:** `apps/web/src/components/nav.tsx`
- **Create:** `apps/web/src/components/footer.tsx`
- **Create:** `apps/web/src/components/sidebar.tsx`
- **Create:** `apps/web/src/components/ui/button.tsx`
- **Create:** `apps/web/src/components/ui/badge.tsx`
- **Create:** `apps/web/src/components/ui/card.tsx`
- **Create:** `apps/web/src/components/ui/input.tsx`
- **Create:** `apps/web/src/lib/api.ts`

### Steps

- [ ] **3.1** Update `apps/web/src/app/layout.tsx` with dark background, font setup, and metadata:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Decantr — Design Intelligence Registry',
  description:
    'Browse, publish, and manage design intelligence content. Patterns, themes, blueprints, and more for AI-generated UI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **3.2** Create `apps/web/src/components/nav.tsx` — Top navigation bar with logo, links, and auth state. Use server component that reads session. Links: Home, Registry, Docs. Authenticated: Dashboard, Sign Out. Unauthenticated: Sign In.

The nav should be a dark bar (`bg-[var(--bg)]` / `border-b border-[var(--card-border)]`), max-width container, logo on left, links center, auth buttons right. Sign In button uses pill shape with cyan accent border. Dashboard link is a filled pill button.

```tsx
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function Nav() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[var(--max-w)] items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-[var(--fg)]">
          Decantr
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/registry" className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
            Registry
          </Link>
          <Link href="https://docs.decantr.ai" className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full bg-[var(--cyan)] px-4 py-1.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[var(--cyan)] px-4 py-1.5 text-sm font-medium text-[var(--cyan)] transition-colors hover:bg-[var(--cyan)] hover:text-[var(--bg)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **3.3** Create `apps/web/src/components/footer.tsx` — Site footer with links and copyright:

```tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] py-12">
      <div className="mx-auto max-w-[var(--max-w)] px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">Product</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/registry">Registry</Link></li>
              <li><Link href="/#pricing">Pricing</Link></li>
              <li><Link href="https://docs.decantr.ai">Docs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">Community</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="https://github.com/decantr">GitHub</Link></li>
              <li><Link href="https://discord.gg/decantr">Discord</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">Legal</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-[var(--fg)]">Company</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="mailto:hello@decantr.ai">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--card-border)] pt-8 text-center text-sm text-[var(--muted)]">
          &copy; {new Date().getFullYear()} Decantr. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **3.4** Create `apps/web/src/components/sidebar.tsx` — Dashboard sidebar navigation. Links: Overview, My Content, API Keys, Team, Settings, Billing. Highlight active link. Team link only visible to team-tier users (pass `tier` as prop).

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview', icon: 'grid' },
  { href: '/dashboard/content', label: 'My Content', icon: 'file-text' },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: 'key' },
  { href: '/dashboard/team', label: 'Team', icon: 'users', tierRequired: 'team' as const },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
  { href: '/dashboard/billing', label: 'Billing', icon: 'credit-card' },
];

export function Sidebar({ tier }: { tier: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--card-border)] py-6 pr-6">
      <nav className="space-y-1">
        {links
          .filter((link) => !link.tierRequired || tier === link.tierRequired || tier === 'enterprise')
          .map((link) => {
            const isActive =
              link.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--cyan)]/10 text-[var(--cyan)] font-medium'
                    : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card-bg)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
```

- [ ] **3.5** Create UI primitives in `apps/web/src/components/ui/`:

**`button.tsx`:**

```tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--cyan)] text-[var(--bg)] hover:opacity-90',
  secondary:
    'border border-[var(--card-border)] text-[var(--fg)] hover:bg-[var(--card-bg)]',
  ghost:
    'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card-bg)]',
  danger:
    'bg-[var(--crimson)] text-white hover:opacity-90',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-full font-medium transition-all disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

**`badge.tsx`:**

```tsx
type BadgeVariant = 'default' | 'official' | 'community' | 'org' | 'success' | 'warning' | 'error';

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--card-bg)] text-[var(--muted)] border-[var(--card-border)]',
  official: 'bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--cyan)]/20',
  community: 'bg-[var(--amber)]/10 text-[var(--amber)] border-[var(--amber)]/20',
  org: 'bg-[var(--purple)]/10 text-[var(--purple)] border-[var(--purple)]/20',
  success: 'bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20',
  warning: 'bg-[var(--yellow)]/10 text-[var(--yellow)] border-[var(--yellow)]/20',
  error: 'bg-[var(--crimson)]/10 text-[var(--crimson)] border-[var(--crimson)]/20',
};

export function Badge({
  variant = 'default',
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
```

**`card.tsx`:**

```tsx
export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 ${
        hover ? 'transition-colors hover:border-[var(--card-hover-border)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
```

**`input.tsx`:**

```tsx
import { type InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)] ${className}`}
      {...props}
    />
  );
});
Input.displayName = 'Input';
```

- [ ] **3.6** Create `apps/web/src/lib/api.ts` — Typed API client for the Registry API:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

interface FetchOptions {
  token?: string;
  revalidate?: number | false;
  tags?: string[];
}

async function apiFetch<T>(path: string, options: FetchOptions & RequestInit = {}): Promise<T> {
  const { token, revalidate, tags, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    next: {
      revalidate: revalidate ?? 60,
      tags,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

// Public endpoints
export function listContent(type: string, params?: { namespace?: string; limit?: number; offset?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.namespace) searchParams.set('namespace', params.namespace);
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.offset) searchParams.set('offset', String(params.offset));
  const qs = searchParams.toString();
  return apiFetch<{ items: ContentItem[]; total: number }>(`/${type}${qs ? `?${qs}` : ''}`, { tags: [type] });
}

export function getContent(type: string, namespace: string, slug: string) {
  return apiFetch<ContentItem>(`/${type}/${namespace}/${slug}`, { tags: [`${type}-${namespace}-${slug}`] });
}

export function searchContent(query: string, params?: { type?: string; namespace?: string }) {
  const searchParams = new URLSearchParams({ q: query });
  if (params?.type) searchParams.set('type', params.type);
  if (params?.namespace) searchParams.set('namespace', params.namespace);
  return apiFetch<{ items: ContentItem[]; total: number }>(`/search?${searchParams.toString()}`);
}

// Authenticated endpoints
export function getMe(token: string) {
  return apiFetch<UserProfile>('/me', { token, revalidate: false });
}

export function getMyContent(token: string) {
  return apiFetch<{ items: ContentItem[] }>('/my/content', { token, revalidate: false });
}

export function getApiKeys(token: string) {
  return apiFetch<{ items: ApiKey[] }>('/api-keys', { token, revalidate: false });
}

export function createApiKey(token: string, body: { name: string; scopes: string[] }) {
  return apiFetch<{ key: string; id: string }>('/api-keys', { token, method: 'POST', body: JSON.stringify(body), revalidate: false });
}

export function revokeApiKey(token: string, id: string) {
  return apiFetch<void>(`/api-keys/${id}`, { token, method: 'DELETE', revalidate: false });
}

export function createContent(token: string, body: ContentPayload) {
  return apiFetch<ContentItem>('/content', { token, method: 'POST', body: JSON.stringify(body), revalidate: false });
}

export function updateContent(token: string, id: string, body: Partial<ContentPayload>) {
  return apiFetch<ContentItem>(`/content/${id}`, { token, method: 'PATCH', body: JSON.stringify(body), revalidate: false });
}

export function deleteContent(token: string, id: string) {
  return apiFetch<void>(`/content/${id}`, { token, method: 'DELETE', revalidate: false });
}

// Organization endpoints
export function getOrgMembers(token: string, orgSlug: string) {
  return apiFetch<{ members: OrgMember[] }>(`/orgs/${orgSlug}`, { token, revalidate: false });
}

export function inviteOrgMember(token: string, orgSlug: string, body: { email: string; role: string }) {
  return apiFetch<OrgMember>(`/orgs/${orgSlug}/members`, { token, method: 'POST', body: JSON.stringify(body), revalidate: false });
}

export function removeOrgMember(token: string, orgSlug: string, userId: string) {
  return apiFetch<void>(`/orgs/${orgSlug}/members/${userId}`, { token, method: 'DELETE', revalidate: false });
}

export function updateOrgMemberRole(token: string, orgSlug: string, userId: string, body: { role: string }) {
  return apiFetch<OrgMember>(`/orgs/${orgSlug}/members/${userId}`, { token, method: 'PATCH', body: JSON.stringify(body), revalidate: false });
}

// Billing
export function createCheckoutSession(token: string, body: { plan: string; success_url: string; cancel_url: string }) {
  return apiFetch<{ url: string }>('/billing/checkout', { token, method: 'POST', body: JSON.stringify(body), revalidate: false });
}

export function createBillingPortalSession(token: string, body: { return_url: string }) {
  return apiFetch<{ url: string }>('/billing/portal', { token, method: 'POST', body: JSON.stringify(body), revalidate: false });
}

// Types
export interface ContentItem {
  id: string;
  type: string;
  slug: string;
  namespace: string;
  visibility: string;
  status: string;
  version: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ContentPayload {
  type: string;
  slug: string;
  namespace: string;
  visibility: string;
  data: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: string;
  reputation_score: number;
  trusted: boolean;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
}

export interface OrgMember {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}
```

### Run

```bash
cd apps/web && pnpm build
```

Verify all components and lib modules compile without errors.

### Commit

```
feat(web): add shared layout, ui components, and api client
```

---

## Task 4: Auth Pages (Login, Signup, Callback)

Create the authentication flow pages — login, signup, and the OAuth callback handler.

### Files to create/modify

- **Create:** `apps/web/src/app/login/page.tsx`
- **Create:** `apps/web/src/app/login/actions.ts`
- **Create:** `apps/web/src/app/signup/page.tsx`
- **Create:** `apps/web/src/app/signup/actions.ts`
- **Create:** `apps/web/src/app/auth/callback/route.ts`
- **Create:** `apps/web/src/app/(public)/layout.tsx`

### Steps

- [ ] **4.1** Create `apps/web/src/app/(public)/layout.tsx` — Public page layout with Nav and Footer:

```tsx
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
```

- [ ] **4.2** Create `apps/web/src/app/login/actions.ts` — Server actions for login:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function loginWithEmail(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function loginWithOAuth(provider: 'github' | 'google') {
  const supabase = await createSupabaseServerClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
```

- [ ] **4.3** Create `apps/web/src/app/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginWithEmail, loginWithOAuth } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginWithEmail(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'github' | 'google') {
    setLoading(true);
    setError(null);
    const result = await loginWithOAuth(provider);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>

        <div className="space-y-3 mb-6">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => handleOAuth('github')}
            disabled={loading}
          >
            Continue with GitHub
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => handleOAuth('google')}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--card-border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--card-bg)] px-2 text-[var(--muted)]">or</span>
          </div>
        </div>

        <form action={handleEmailLogin} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required />

          {error && (
            <p className="text-sm text-[var(--crimson)]">{error}</p>
          )}

          <Button type="submit" size="md" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          No account?{' '}
          <Link href="/signup" className="text-[var(--cyan)]">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

- [ ] **4.4** Create `apps/web/src/app/signup/actions.ts`:

```typescript
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function signupWithEmail(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email for a confirmation link.' };
}
```

- [ ] **4.5** Create `apps/web/src/app/signup/page.tsx` — Similar structure to login page but calls `signupWithEmail`. Show success message after signup ("Check your email").

- [ ] **4.6** Create `apps/web/src/app/auth/callback/route.ts` — OAuth callback handler:

```typescript
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add login, signup, and oauth callback pages
```

---

## Task 5: Landing Page

Build the full marketing landing page matching the luminarum theme from `docs/index.html` — hero, features, before/after, pricing, setup instructions, and CTA.

### Files to create/modify

- **Create:** `apps/web/src/app/(public)/page.tsx`
- **Create:** `apps/web/src/components/landing/hero.tsx`
- **Create:** `apps/web/src/components/landing/features.tsx`
- **Create:** `apps/web/src/components/landing/before-after.tsx`
- **Create:** `apps/web/src/components/landing/pricing.tsx`
- **Create:** `apps/web/src/components/landing/setup.tsx`
- **Create:** `apps/web/src/components/landing/cta-banner.tsx`

### Steps

- [ ] **5.1** Create `apps/web/src/app/(public)/page.tsx` — Composes the landing page sections:

```tsx
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { BeforeAfter } from '@/components/landing/before-after';
import { Pricing } from '@/components/landing/pricing';
import { Setup } from '@/components/landing/setup';
import { CtaBanner } from '@/components/landing/cta-banner';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <BeforeAfter />
      <Pricing />
      <Setup />
      <CtaBanner />
    </main>
  );
}
```

- [ ] **5.2** Create `apps/web/src/components/landing/hero.tsx`:

Hero section with:
- Full-viewport height, dark background (`#060610`)
- Gradient orb backgrounds (pink/cyan/amber radial gradients with blur, matching `docs/index.html` `.hero-orb-*` styles)
- Heading: "Design Intelligence for AI-Generated UI"
- Subheading: "Decantr is OpenAPI for AI-generated UI. A structured schema and design intelligence layer that makes AI assistants generate better, more consistent web applications."
- Two CTA buttons (pill shape): "Browse Registry" (primary/cyan) and "Read the Docs" (secondary/border)
- Use Tailwind animations for the gradient orbs (`animate-pulse` with custom timing)

- [ ] **5.3** Create `apps/web/src/components/landing/features.tsx`:

Feature grid section with:
- Section heading: "What is Decantr?"
- 2x3 grid of feature cards using `Card` component
- Features: Design System Schema, Pattern Library, Theme Engine, Blueprint Templates, Guard System, MCP Integration
- Each card: icon area (colored dot indicator), title, one-sentence description
- Cards use `hover` prop for border transition on hover

- [ ] **5.4** Create `apps/web/src/components/landing/before-after.tsx`:

Before/after comparison section:
- Section heading: "Before and After"
- Two side-by-side cards: "Without Decantr" (problems list with crimson dots) and "With Decantr" (benefits list with green dots)
- Use the card-decorated pattern from `docs/index.html` (corner brackets via pseudo-elements) — implement as a Tailwind `before:` / `after:` pattern or a wrapper component
- Visual contrast: left card slightly muted, right card with subtle cyan accent border

- [ ] **5.5** Create `apps/web/src/components/landing/pricing.tsx`:

Pricing section with:
- Section heading: "Pricing"
- `id="pricing"` for anchor link
- Four tier cards in a row: Free, Pro ($29/mo), Team ($99/seat/mo), Enterprise (Contact us)
- Pro card highlighted with cyan border and "Popular" badge
- Each card lists: price, feature bullet points, CTA button
- Free: "Get Started" (secondary), Pro: "Upgrade to Pro" (primary), Team: "Start Team Trial" (primary), Enterprise: "Contact Sales" (secondary)
- Feature lists from the tier model in the spec

Tier features to display:

| Free | Pro | Team | Enterprise |
|------|-----|------|------------|
| Browse public registry | Everything in Free | Everything in Pro | Everything in Team |
| Publish to @community (queued) | Instant publish (if trusted) | Organization namespace | Dedicated infrastructure |
| 60 API requests/min | API keys | Shared API keys | SSO/SAML |
| | Private content | Team management | On-prem option |
| | 300 requests/min | 600 requests/min | Unlimited requests |
| | | | Custom SLA |

- [ ] **5.6** Create `apps/web/src/components/landing/setup.tsx`:

Setup instructions section:
- Section heading: "Get Started in 60 Seconds"
- Three numbered step cards:
  1. Install: `npx decantr init` (with code block styling using `var(--code-bg)` and `var(--mono)`)
  2. Configure: "Add to your AI assistant's MCP config" with JSON snippet showing `mcpServers` config
  3. Build: "Start building — your AI now follows your design system"

- [ ] **5.7** Create `apps/web/src/components/landing/cta-banner.tsx`:

Bottom CTA section:
- Gradient background (subtle, dark-to-slightly-lighter)
- Heading: "Ready to build consistent AI-generated UI?"
- Two buttons: "Browse the Registry" (primary) and "Create Free Account" (secondary)

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add landing page with hero, features, pricing, and setup
```

---

## Task 6: Registry Browser Page

Build the public registry browser with search, type filtering, namespace filtering, and paginated content card grid.

### Files to create/modify

- **Create:** `apps/web/src/app/(public)/registry/page.tsx`
- **Create:** `apps/web/src/app/(public)/registry/loading.tsx`
- **Create:** `apps/web/src/components/registry/search-filter-bar.tsx`
- **Create:** `apps/web/src/components/registry/content-card.tsx`
- **Create:** `apps/web/src/components/registry/content-grid.tsx`
- **Create:** `apps/web/src/components/registry/pagination.tsx`
- **Create:** `apps/web/src/components/registry/namespace-badge.tsx`

### Steps

- [ ] **6.1** Create `apps/web/src/components/registry/namespace-badge.tsx`:

```tsx
import { Badge } from '@/components/ui/badge';

const namespaceVariant: Record<string, 'official' | 'community' | 'org'> = {
  '@official': 'official',
  '@community': 'community',
};

export function NamespaceBadge({ namespace }: { namespace: string }) {
  const variant = namespaceVariant[namespace] || 'org';
  return <Badge variant={variant}>{namespace}</Badge>;
}
```

- [ ] **6.2** Create `apps/web/src/components/registry/content-card.tsx`:

A card component that displays:
- Content type badge (top-left, using the `Badge` component with `default` variant)
- Namespace badge (top-right, using `NamespaceBadge`)
- Content name (extracted from `data.name` or `slug`)
- Description (extracted from `data.description`, truncated to 2 lines)
- Version number
- Link to detail page: `/registry/[type]/[namespace]/[slug]`

Use the `Card` component with `hover` enabled. The entire card is a link.

```tsx
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NamespaceBadge } from './namespace-badge';
import type { ContentItem } from '@/lib/api';

export function ContentCard({ item }: { item: ContentItem }) {
  const name = (item.data.name as string) || item.slug;
  const description = (item.data.description as string) || '';

  return (
    <Link href={`/registry/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`}>
      <Card hover className="h-full">
        <div className="mb-3 flex items-center justify-between">
          <Badge>{item.type}</Badge>
          <NamespaceBadge namespace={item.namespace} />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-[var(--fg)]">{name}</h3>
        <p className="mb-3 line-clamp-2 text-xs text-[var(--muted)]">{description}</p>
        <span className="text-xs text-[var(--muted)]">v{item.version}</span>
      </Card>
    </Link>
  );
}
```

- [ ] **6.3** Create `apps/web/src/components/registry/search-filter-bar.tsx`:

Client component with:
- Search input (using `Input` component, with search icon placeholder)
- Content type filter: horizontal tab-style pills for "All", "Patterns", "Themes", "Blueprints", "Recipes", "Archetypes", "Shells"
- Namespace filter: dropdown or pill buttons for "All", "@official", "@community"
- Updates URL search params on change (using `useRouter` and `useSearchParams`)

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';

const CONTENT_TYPES = ['all', 'patterns', 'themes', 'blueprints', 'recipes', 'archetypes', 'shells'] as const;
const NAMESPACES = ['all', '@official', '@community'] as const;

export function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentType = searchParams.get('type') || 'all';
  const currentNamespace = searchParams.get('namespace') || 'all';
  const currentQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(currentQuery);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === 'all' || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      params.delete('offset'); // Reset pagination on filter change
      startTransition(() => {
        router.push(`/registry?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: query });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[var(--cyan)] px-4 py-2 text-sm font-medium text-[var(--bg)] hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {CONTENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => updateParams({ type })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentType === type
                ? 'bg-[var(--cyan)]/10 text-[var(--cyan)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card-bg)]'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}

        <span className="mx-2 h-4 w-px bg-[var(--card-border)]" />

        {NAMESPACES.map((ns) => (
          <button
            key={ns}
            onClick={() => updateParams({ namespace: ns })}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentNamespace === ns
                ? 'bg-[var(--amber)]/10 text-[var(--amber)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--card-bg)]'
            }`}
          >
            {ns === 'all' ? 'All Sources' : ns}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="text-xs text-[var(--muted)]">Loading...</div>
      )}
    </div>
  );
}
```

- [ ] **6.4** Create `apps/web/src/components/registry/pagination.tsx`:

Client component with Previous/Next buttons and page indicator. Uses URL search params for `offset`. Shows "Page X of Y" text.

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 20;

export function Pagination({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offset = Number(searchParams.get('offset') || '0');
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function goTo(newOffset: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newOffset === 0) {
      params.delete('offset');
    } else {
      params.set('offset', String(newOffset));
    }
    router.push(`/registry?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-8">
      <Button
        variant="secondary"
        size="sm"
        disabled={offset === 0}
        onClick={() => goTo(Math.max(0, offset - PAGE_SIZE))}
      >
        Previous
      </Button>
      <span className="text-sm text-[var(--muted)]">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={offset + PAGE_SIZE >= total}
        onClick={() => goTo(offset + PAGE_SIZE)}
      >
        Next
      </Button>
    </div>
  );
}
```

- [ ] **6.5** Create `apps/web/src/components/registry/content-grid.tsx`:

```tsx
import type { ContentItem } from '@/lib/api';
import { ContentCard } from './content-card';

export function ContentGrid({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--muted)]">
        No content found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

- [ ] **6.6** Create `apps/web/src/app/(public)/registry/page.tsx` — Server component that reads search params, fetches from API, renders search bar + grid + pagination:

```tsx
import { Suspense } from 'react';
import { listContent, searchContent } from '@/lib/api';
import { SearchFilterBar } from '@/components/registry/search-filter-bar';
import { ContentGrid } from '@/components/registry/content-grid';
import { Pagination } from '@/components/registry/pagination';

const PAGE_SIZE = 20;

export const metadata = {
  title: 'Registry — Decantr',
  description: 'Browse patterns, themes, blueprints, recipes, archetypes, and shells.',
};

export default async function RegistryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const type = (params.type as string) || '';
  const namespace = (params.namespace as string) || '';
  const query = (params.q as string) || '';
  const offset = Number(params.offset || '0');

  let items: Awaited<ReturnType<typeof listContent>>['items'] = [];
  let total = 0;

  if (query) {
    const result = await searchContent(query, {
      type: type || undefined,
      namespace: namespace || undefined,
    });
    items = result.items;
    total = result.total;
  } else {
    // If no type filter, fetch all content types merged
    const contentType = type || 'patterns'; // Default to patterns
    const result = await listContent(contentType, {
      namespace: namespace || undefined,
      limit: PAGE_SIZE,
      offset,
    });
    items = result.items;
    total = result.total;
  }

  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Registry</h1>

      <Suspense>
        <SearchFilterBar />
      </Suspense>

      <div className="mt-8">
        <ContentGrid items={items} />
        <Suspense>
          <Pagination total={total} />
        </Suspense>
      </div>
    </section>
  );
}
```

- [ ] **6.7** Create `apps/web/src/app/(public)/registry/loading.tsx`:

```tsx
export default function RegistryLoading() {
  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Registry</h1>
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-full bg-[var(--card-bg)]" />
        <div className="h-8 w-64 animate-pulse rounded-full bg-[var(--card-bg)]" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--card-bg)]" />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add registry browser with search, filters, and pagination
```

---

## Task 7: Content Detail Page

Build the individual content view page with header, metadata, JSON viewer, and copy functionality.

### Files to create/modify

- **Create:** `apps/web/src/app/(public)/registry/[type]/[namespace]/[slug]/page.tsx`
- **Create:** `apps/web/src/app/(public)/registry/[type]/[namespace]/[slug]/loading.tsx`
- **Create:** `apps/web/src/components/registry/json-viewer.tsx`
- **Create:** `apps/web/src/components/registry/copy-button.tsx`

### Steps

- [ ] **7.1** Create `apps/web/src/components/registry/copy-button.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? 'Copied!' : label}
    </Button>
  );
}
```

- [ ] **7.2** Create `apps/web/src/components/registry/json-viewer.tsx`:

Client component that renders a collapsible, syntax-highlighted JSON view.

```tsx
'use client';

import { useState } from 'react';
import { CopyButton } from './copy-button';

export function JsonViewer({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);
  const previewLines = jsonString.split('\n').slice(0, 20).join('\n');
  const isLong = jsonString.split('\n').length > 20;

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--code-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-2">
        <span className="text-xs font-medium text-[var(--muted)]">JSON</span>
        <CopyButton text={jsonString} label="Copy JSON" />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-[var(--fg)]">
        <code>{expanded || !isLong ? jsonString : previewLines + '\n...'}</code>
      </pre>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full border-t border-[var(--card-border)] py-2 text-xs text-[var(--cyan)] hover:bg-[var(--card-bg)] transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand all'}
        </button>
      )}
    </div>
  );
}
```

- [ ] **7.3** Create `apps/web/src/app/(public)/registry/[type]/[namespace]/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { NamespaceBadge } from '@/components/registry/namespace-badge';
import { JsonViewer } from '@/components/registry/json-viewer';
import { CopyButton } from '@/components/registry/copy-button';

interface ContentDetailParams {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export async function generateMetadata({ params }: ContentDetailParams) {
  const { type, namespace, slug } = await params;
  const decodedNamespace = decodeURIComponent(namespace);
  return {
    title: `${slug} — ${decodedNamespace} ${type} — Decantr`,
  };
}

export default async function ContentDetailPage({ params }: ContentDetailParams) {
  const { type, namespace, slug } = await params;
  const decodedNamespace = decodeURIComponent(namespace);

  let content;
  try {
    content = await getContent(type, decodedNamespace, slug);
  } catch {
    notFound();
  }

  const name = (content.data.name as string) || content.slug;
  const description = (content.data.description as string) || '';
  const components = (content.data.components as Array<{ name: string }>) || [];
  const presets = (content.data.presets as Record<string, unknown>) || {};

  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge>{content.type}</Badge>
          <NamespaceBadge namespace={content.namespace} />
          <Badge variant="default">v{content.version}</Badge>
          {content.status === 'published' && <Badge variant="success">Published</Badge>}
        </div>

        <h1 className="mb-2 text-3xl font-bold">{name}</h1>
        {description && (
          <p className="text-[var(--muted)]">{description}</p>
        )}

        <div className="mt-4 flex gap-2">
          <CopyButton
            text={`decantr import ${content.type} ${content.namespace}/${content.slug}`}
            label="Copy Import Command"
          />
          <CopyButton
            text={JSON.stringify(content.data, null, 2)}
            label="Copy JSON"
          />
        </div>
      </div>

      {/* Components list (if present) */}
      {components.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Components</h2>
          <div className="flex flex-wrap gap-2">
            {components.map((comp) => (
              <Badge key={comp.name} variant="default">{comp.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Presets (if present) */}
      {Object.keys(presets).length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Presets</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(presets).map((preset) => (
              <Badge key={preset} variant="default">{preset}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* JSON Viewer */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Source</h2>
        <JsonViewer data={content.data} />
      </div>
    </section>
  );
}
```

- [ ] **7.4** Create `apps/web/src/app/(public)/registry/[type]/[namespace]/[slug]/loading.tsx`:

```tsx
export default function ContentDetailLoading() {
  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      <div className="mb-8 space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--card-bg)]" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--card-bg)]" />
        </div>
        <div className="h-10 w-80 animate-pulse rounded-lg bg-[var(--card-bg)]" />
        <div className="h-5 w-full max-w-lg animate-pulse rounded bg-[var(--card-bg)]" />
      </div>
      <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--card-bg)]" />
    </section>
  );
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add content detail page with json viewer
```

---

## Task 8: Dashboard Layout and Overview

Create the authenticated dashboard shell with sidebar navigation, and the overview page with stats and recent activity.

### Files to create/modify

- **Create:** `apps/web/src/app/dashboard/layout.tsx`
- **Create:** `apps/web/src/app/dashboard/page.tsx`
- **Create:** `apps/web/src/components/dashboard/stats-bar.tsx`
- **Create:** `apps/web/src/components/dashboard/reputation-badge.tsx`
- **Create:** `apps/web/src/components/dashboard/activity-feed.tsx`
- **Create:** `apps/web/src/app/dashboard/actions.ts`

### Steps

- [ ] **8.1** Create `apps/web/src/app/dashboard/actions.ts` — Server action for sign out:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
```

- [ ] **8.2** Create `apps/web/src/app/dashboard/layout.tsx`:

Server component that:
- Reads the user session via `createSupabaseServerClient`
- If no user, redirect to `/login` (middleware should handle this, but double-check)
- Fetches user profile via `getMe()` using the access token
- Renders: Nav (top), then a flex row with Sidebar (left, passing `tier`) and `{children}` (right)
- Includes a sign out button in the sidebar footer area

```tsx
import { redirect } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Sidebar } from '@/components/sidebar';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMe } from '@/lib/api';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: { session } } = await supabase.auth.getSession();
  let profile;
  try {
    profile = await getMe(session!.access_token);
  } catch {
    // If API is unreachable, use minimal profile
    profile = { tier: 'free' };
  }

  return (
    <>
      <Nav />
      <div className="mx-auto flex max-w-[var(--max-w)] gap-6 px-6 py-8">
        <Sidebar tier={profile.tier} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
```

- [ ] **8.3** Create `apps/web/src/components/dashboard/stats-bar.tsx`:

```tsx
import { Card } from '@/components/ui/card';

interface Stat {
  label: string;
  value: string | number;
  change?: string;
}

export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="text-xs text-[var(--muted)]">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold">{stat.value}</p>
          {stat.change && (
            <p className="mt-1 text-xs text-[var(--green)]">{stat.change}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **8.4** Create `apps/web/src/components/dashboard/reputation-badge.tsx`:

```tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ReputationBadge({
  score,
  trusted,
}: {
  score: number;
  trusted: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted)]">Reputation Score</p>
          <p className="mt-1 text-2xl font-bold">{score}</p>
        </div>
        {trusted && <Badge variant="success">Trusted</Badge>}
      </div>
      <div className="mt-3">
        <div className="h-2 rounded-full bg-[var(--card-border)]">
          <div
            className="h-2 rounded-full bg-[var(--cyan)] transition-all"
            style={{ width: `${Math.min(100, (score / 50) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {trusted ? 'Instant publish enabled' : `${Math.max(0, 50 - score)} points to trusted status`}
        </p>
      </div>
    </Card>
  );
}
```

- [ ] **8.5** Create `apps/web/src/components/dashboard/activity-feed.tsx`:

```tsx
import { Card } from '@/components/ui/card';

interface Activity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[var(--muted)]">No recent activity.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">Recent Activity</h3>
      <ul className="space-y-3">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-center justify-between border-b border-[var(--card-border)] pb-3 last:border-0 last:pb-0">
            <div>
              <p className="text-sm text-[var(--fg)]">
                {activity.action}{' '}
                <span className="font-medium text-[var(--cyan)]">{activity.target}</span>
              </p>
            </div>
            <time className="text-xs text-[var(--muted)]">
              {new Date(activity.timestamp).toLocaleDateString()}
            </time>
          </li>
        ))}
      </ul>
    </Card>
  );
}
```

- [ ] **8.6** Create `apps/web/src/app/dashboard/page.tsx`:

Server component that fetches user stats and recent activity from the API. Renders StatsBar, ReputationBadge, and ActivityFeed.

```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMe, getMyContent } from '@/lib/api';
import { StatsBar } from '@/components/dashboard/stats-bar';
import { ReputationBadge } from '@/components/dashboard/reputation-badge';
import { ActivityFeed } from '@/components/dashboard/activity-feed';

export const metadata = {
  title: 'Dashboard — Decantr',
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session!.access_token;

  const [profile, contentResult] = await Promise.all([
    getMe(token),
    getMyContent(token),
  ]);

  const published = contentResult.items.filter((c) => c.status === 'published');
  const pending = contentResult.items.filter((c) => c.status === 'pending');

  const stats = [
    { label: 'Published Content', value: published.length },
    { label: 'Pending Review', value: pending.length },
    { label: 'Total Content', value: contentResult.items.length },
    { label: 'Current Tier', value: profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1) },
  ];

  // Build activity from content items (most recent updates)
  const activities = contentResult.items
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      action: item.status === 'published' ? 'Published' : item.status === 'pending' ? 'Submitted' : 'Updated',
      target: `${item.namespace}/${item.slug}`,
      timestamp: item.updated_at,
    }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsBar stats={stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ReputationBadge score={profile.reputation_score} trusted={profile.trusted} />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add dashboard layout with stats, reputation, and activity
```

---

## Task 9: Dashboard - Content Management

Build the My Content page with content listing, create, edit, and delete functionality.

### Files to create/modify

- **Create:** `apps/web/src/app/dashboard/content/page.tsx`
- **Create:** `apps/web/src/app/dashboard/content/new/page.tsx`
- **Create:** `apps/web/src/app/dashboard/content/[id]/edit/page.tsx`
- **Create:** `apps/web/src/components/dashboard/content-list.tsx`
- **Create:** `apps/web/src/components/dashboard/content-form.tsx`
- **Create:** `apps/web/src/app/dashboard/content/actions.ts`

### Steps

- [ ] **9.1** Create `apps/web/src/app/dashboard/content/actions.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createContent, updateContent, deleteContent, type ContentPayload } from '@/lib/api';

async function getToken() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session!.access_token;
}

export async function createContentAction(payload: ContentPayload) {
  const token = await getToken();
  try {
    await createContent(token, payload);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create content' };
  }
  revalidatePath('/dashboard/content');
  redirect('/dashboard/content');
}

export async function updateContentAction(id: string, payload: Partial<ContentPayload>) {
  const token = await getToken();
  try {
    await updateContent(token, id, payload);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update content' };
  }
  revalidatePath('/dashboard/content');
  redirect('/dashboard/content');
}

export async function deleteContentAction(id: string) {
  const token = await getToken();
  try {
    await deleteContent(token, id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete content' };
  }
  revalidatePath('/dashboard/content');
}
```

- [ ] **9.2** Create `apps/web/src/components/dashboard/content-list.tsx`:

Client component that renders a table/list of the user's content items. Each row shows:
- Type badge, name/slug, namespace badge, status badge, version, updated date
- Actions: Edit (link), Delete (button with confirmation)

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NamespaceBadge } from '@/components/registry/namespace-badge';
import { deleteContentAction } from '@/app/dashboard/content/actions';
import type { ContentItem } from '@/lib/api';

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  published: 'success',
  pending: 'warning',
  rejected: 'error',
  approved: 'success',
};

export function ContentList({ items }: { items: ContentItem[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this content?')) return;
    setDeletingId(id);
    await deleteContentAction(id);
    setDeletingId(null);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center">
        <p className="text-[var(--muted)]">No content yet.</p>
        <Link
          href="/dashboard/content/new"
          className="mt-4 inline-block rounded-full bg-[var(--cyan)] px-4 py-2 text-sm font-medium text-[var(--bg)]"
        >
          Create Your First
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Badge>{item.type}</Badge>
            <span className="text-sm font-medium">{(item.data.name as string) || item.slug}</span>
            <NamespaceBadge namespace={item.namespace} />
            <Badge variant={statusVariant[item.status] || 'default'}>{item.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">v{item.version}</span>
            <Link href={`/dashboard/content/${item.id}/edit`}>
              <Button variant="ghost" size="sm">Edit</Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              disabled={deletingId === item.id}
              onClick={() => handleDelete(item.id)}
            >
              {deletingId === item.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **9.3** Create `apps/web/src/components/dashboard/content-form.tsx`:

Client component with a form for creating/editing content. Fields:
- Type (select: pattern, recipe, theme, blueprint, archetype, shell)
- Slug (text input, required)
- Namespace (select: @community, or org namespaces if team tier)
- Visibility (select: public, private — private only if Pro+)
- Data (textarea with JSON, validated on submit)

The form calls the appropriate server action (`createContentAction` or `updateContentAction`).

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createContentAction, updateContentAction } from '@/app/dashboard/content/actions';
import type { ContentItem, ContentPayload } from '@/lib/api';

const CONTENT_TYPES = ['pattern', 'recipe', 'theme', 'blueprint', 'archetype', 'shell'];

export function ContentForm({
  initialData,
  contentId,
  tier,
}: {
  initialData?: ContentItem;
  contentId?: string;
  tier: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEditing = !!contentId;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const dataStr = formData.get('data') as string;

    let parsedData: Record<string, unknown>;
    try {
      parsedData = JSON.parse(dataStr);
    } catch {
      setError('Invalid JSON in data field');
      setLoading(false);
      return;
    }

    const payload: ContentPayload = {
      type: formData.get('type') as string,
      slug: formData.get('slug') as string,
      namespace: formData.get('namespace') as string,
      visibility: formData.get('visibility') as string,
      data: parsedData,
    };

    const result = isEditing
      ? await updateContentAction(contentId!, payload)
      : await createContentAction(payload);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="mb-1 block text-xs text-[var(--muted)]">Type</label>
        <select
          name="type"
          defaultValue={initialData?.type || 'pattern'}
          disabled={isEditing}
          className="w-full rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--fg)]"
        >
          {CONTENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-[var(--muted)]">Slug</label>
        <Input
          name="slug"
          defaultValue={initialData?.slug}
          required
          disabled={isEditing}
          placeholder="my-pattern"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-[var(--muted)]">Namespace</label>
        <select
          name="namespace"
          defaultValue={initialData?.namespace || '@community'}
          className="w-full rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--fg)]"
        >
          <option value="@community">@community</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-[var(--muted)]">Visibility</label>
        <select
          name="visibility"
          defaultValue={initialData?.visibility || 'public'}
          className="w-full rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--fg)]"
        >
          <option value="public">Public</option>
          {(tier === 'pro' || tier === 'team' || tier === 'enterprise') && (
            <option value="private">Private</option>
          )}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-[var(--muted)]">Data (JSON)</label>
        <textarea
          name="data"
          rows={12}
          required
          defaultValue={initialData ? JSON.stringify(initialData.data, null, 2) : '{\n  \n}'}
          className="w-full rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--code-bg)] p-4 font-[var(--mono)] text-xs text-[var(--fg)] placeholder:text-[var(--muted)] focus:border-[var(--cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]"
        />
      </div>

      {error && <p className="text-sm text-[var(--crimson)]">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : isEditing ? 'Update Content' : 'Create Content'}
      </Button>
    </form>
  );
}
```

- [ ] **9.4** Create `apps/web/src/app/dashboard/content/page.tsx`:

```tsx
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMyContent } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ContentList } from '@/components/dashboard/content-list';

export const metadata = {
  title: 'My Content — Decantr',
};

export default async function ContentPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const result = await getMyContent(session!.access_token);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Content</h1>
        <Link href="/dashboard/content/new">
          <Button>Create New</Button>
        </Link>
      </div>
      <ContentList items={result.items} />
    </div>
  );
}
```

- [ ] **9.5** Create `apps/web/src/app/dashboard/content/new/page.tsx`:

```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMe } from '@/lib/api';
import { ContentForm } from '@/components/dashboard/content-form';

export const metadata = {
  title: 'Create Content — Decantr',
};

export default async function NewContentPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const profile = await getMe(session!.access_token);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Content</h1>
      <ContentForm tier={profile.tier} />
    </div>
  );
}
```

- [ ] **9.6** Create `apps/web/src/app/dashboard/content/[id]/edit/page.tsx`:

Server component that fetches the content item by ID (via `getMyContent` and filtering, or a dedicated API call), then renders `ContentForm` with `initialData` and `contentId` props. If not found, call `notFound()`.

```tsx
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMe, getMyContent } from '@/lib/api';
import { ContentForm } from '@/components/dashboard/content-form';

export const metadata = {
  title: 'Edit Content — Decantr',
};

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session!.access_token;

  const [profile, contentResult] = await Promise.all([
    getMe(token),
    getMyContent(token),
  ]);

  const item = contentResult.items.find((c) => c.id === id);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Content</h1>
      <ContentForm initialData={item} contentId={id} tier={profile.tier} />
    </div>
  );
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add content management with create, edit, and delete
```

---

## Task 10: Dashboard - API Keys

Build the API key management page with listing, creation, and revocation.

### Files to create/modify

- **Create:** `apps/web/src/app/dashboard/api-keys/page.tsx`
- **Create:** `apps/web/src/app/dashboard/api-keys/actions.ts`
- **Create:** `apps/web/src/components/dashboard/api-key-list.tsx`
- **Create:** `apps/web/src/components/dashboard/create-api-key-form.tsx`

### Steps

- [ ] **10.1** Create `apps/web/src/app/dashboard/api-keys/actions.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createApiKey, revokeApiKey } from '@/lib/api';

async function getToken() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session!.access_token;
}

export async function createApiKeyAction(name: string, scopes: string[]) {
  const token = await getToken();
  try {
    const result = await createApiKey(token, { name, scopes });
    revalidatePath('/dashboard/api-keys');
    return { key: result.key }; // Only shown once
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create API key' };
  }
}

export async function revokeApiKeyAction(id: string) {
  const token = await getToken();
  try {
    await revokeApiKey(token, id);
    revalidatePath('/dashboard/api-keys');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to revoke API key' };
  }
}
```

- [ ] **10.2** Create `apps/web/src/components/dashboard/api-key-list.tsx`:

Client component rendering each API key as a row. Shows: name, scopes (as badges), last used date, created date, and a Revoke button (with confirmation).

```tsx
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { revokeApiKeyAction } from '@/app/dashboard/api-keys/actions';
import type { ApiKey } from '@/lib/api';

export function ApiKeyList({ keys }: { keys: ApiKey[] }) {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    if (!confirm('Are you sure? This API key will stop working immediately.')) return;
    setRevokingId(id);
    await revokeApiKeyAction(id);
    setRevokingId(null);
  }

  if (keys.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] p-12 text-center">
        <p className="text-[var(--muted)]">No API keys yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {keys.map((key) => (
        <div
          key={key.id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{key.name}</span>
            <div className="flex gap-1">
              {key.scopes.map((scope) => (
                <Badge key={scope} variant="default">{scope}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--muted)]">
              {key.last_used_at
                ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
                : 'Never used'}
            </span>
            <Button
              variant="danger"
              size="sm"
              disabled={revokingId === key.id}
              onClick={() => handleRevoke(key.id)}
            >
              {revokingId === key.id ? 'Revoking...' : 'Revoke'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **10.3** Create `apps/web/src/components/dashboard/create-api-key-form.tsx`:

Client component with a form to create a new API key. Fields: name (text input), scopes (checkboxes: read, write, org:read, org:write). On success, display the raw key value in a highlighted box with a copy button and a warning that it will only be shown once.

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/registry/copy-button';
import { createApiKeyAction } from '@/app/dashboard/api-keys/actions';

const SCOPES = ['read', 'write', 'org:read', 'org:write'];

export function CreateApiKeyForm() {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  function toggleScope(scope: string) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const result = await createApiKeyAction(name.trim(), scopes);

    if ('error' in result && result.error) {
      setError(result.error);
    } else if ('key' in result && result.key) {
      setCreatedKey(result.key);
      setName('');
      setScopes(['read']);
    }
    setLoading(false);
  }

  if (createdKey) {
    return (
      <Card className="border-[var(--green)]/30">
        <h3 className="mb-2 text-sm font-semibold text-[var(--green)]">API Key Created</h3>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Copy this key now. It will not be shown again.
        </p>
        <div className="flex items-center gap-2 rounded-lg bg-[var(--code-bg)] p-3">
          <code className="flex-1 break-all font-[var(--mono)] text-xs text-[var(--fg)]">
            {createdKey}
          </code>
          <CopyButton text={createdKey} label="Copy" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => setCreatedKey(null)}
        >
          Done
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <label className="mb-1 block text-xs text-[var(--muted)]">Key Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., CI/CD Pipeline"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-[var(--muted)]">Scopes</label>
        <div className="flex gap-2">
          {SCOPES.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => toggleScope(scope)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                scopes.includes(scope)
                  ? 'bg-[var(--cyan)]/10 text-[var(--cyan)]'
                  : 'text-[var(--muted)] hover:text-[var(--fg)] bg-[var(--card-bg)] border border-[var(--card-border)]'
              }`}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Creating...' : 'Create Key'}
      </Button>

      {error && <p className="w-full text-sm text-[var(--crimson)]">{error}</p>}
    </form>
  );
}
```

- [ ] **10.4** Create `apps/web/src/app/dashboard/api-keys/page.tsx`:

```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getApiKeys } from '@/lib/api';
import { ApiKeyList } from '@/components/dashboard/api-key-list';
import { CreateApiKeyForm } from '@/components/dashboard/create-api-key-form';

export const metadata = {
  title: 'API Keys — Decantr',
};

export default async function ApiKeysPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const result = await getApiKeys(session!.access_token);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">API Keys</h1>
      <CreateApiKeyForm />
      <ApiKeyList keys={result.items} />
    </div>
  );
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add api key management page
```

---

## Task 11: Dashboard - Team Management

Build the team management page for Team-tier users with member listing, invite, role changes, and removal.

### Files to create/modify

- **Create:** `apps/web/src/app/dashboard/team/page.tsx`
- **Create:** `apps/web/src/app/dashboard/team/actions.ts`
- **Create:** `apps/web/src/components/dashboard/team-member-list.tsx`
- **Create:** `apps/web/src/components/dashboard/invite-member-form.tsx`

### Steps

- [ ] **11.1** Create `apps/web/src/app/dashboard/team/actions.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { inviteOrgMember, removeOrgMember, updateOrgMemberRole } from '@/lib/api';

async function getToken() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session!.access_token;
}

export async function inviteMemberAction(orgSlug: string, email: string, role: string) {
  const token = await getToken();
  try {
    await inviteOrgMember(token, orgSlug, { email, role });
    revalidatePath('/dashboard/team');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to invite member' };
  }
}

export async function removeMemberAction(orgSlug: string, userId: string) {
  const token = await getToken();
  try {
    await removeOrgMember(token, orgSlug, userId);
    revalidatePath('/dashboard/team');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to remove member' };
  }
}

export async function updateRoleAction(orgSlug: string, userId: string, role: string) {
  const token = await getToken();
  try {
    await updateOrgMemberRole(token, orgSlug, userId, { role });
    revalidatePath('/dashboard/team');
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update role' };
  }
}
```

- [ ] **11.2** Create `apps/web/src/components/dashboard/team-member-list.tsx`:

Client component. Each row shows: email, role badge (owner/admin/member with color variants), joined date, and actions (change role dropdown, remove button). Owner cannot be removed. Only admins/owners can change roles.

```tsx
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { removeMemberAction, updateRoleAction } from '@/app/dashboard/team/actions';
import type { OrgMember } from '@/lib/api';

const roleVariant: Record<string, 'official' | 'community' | 'default'> = {
  owner: 'official',
  admin: 'community',
  member: 'default',
};

export function TeamMemberList({
  members,
  orgSlug,
  currentUserRole,
}: {
  members: OrgMember[];
  orgSlug: string;
  currentUserRole: string;
}) {
  const [actionId, setActionId] = useState<string | null>(null);
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  async function handleRemove(userId: string) {
    if (!confirm('Remove this team member?')) return;
    setActionId(userId);
    await removeMemberAction(orgSlug, userId);
    setActionId(null);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setActionId(userId);
    await updateRoleAction(orgSlug, userId, newRole);
    setActionId(null);
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.user_id}
          className="flex items-center justify-between rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{member.email}</span>
            <Badge variant={roleVariant[member.role] || 'default'}>{member.role}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted)]">
              Joined {new Date(member.created_at).toLocaleDateString()}
            </span>
            {canManage && member.role !== 'owner' && (
              <>
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                  disabled={actionId === member.user_id}
                  className="rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-1 text-xs text-[var(--fg)]"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionId === member.user_id}
                  onClick={() => handleRemove(member.user_id)}
                >
                  Remove
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **11.3** Create `apps/web/src/components/dashboard/invite-member-form.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { inviteMemberAction } from '@/app/dashboard/team/actions';

export function InviteMemberForm({ orgSlug }: { orgSlug: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await inviteMemberAction(orgSlug, email.trim(), role);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <label className="mb-1 block text-xs text-[var(--muted)]">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="team@company.com"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[var(--muted)]">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--fg)]"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={loading || !email.trim()}>
        {loading ? 'Inviting...' : 'Invite'}
      </Button>
      {error && <p className="w-full text-sm text-[var(--crimson)]">{error}</p>}
      {success && <p className="w-full text-sm text-[var(--green)]">Invitation sent.</p>}
    </form>
  );
}
```

- [ ] **11.4** Create `apps/web/src/app/dashboard/team/page.tsx`:

Server component that reads the user's org membership from the API, then renders `InviteMemberForm` and `TeamMemberList`. If the user has no org (not on Team tier), show an upgrade prompt.

```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMe, getOrgMembers } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamMemberList } from '@/components/dashboard/team-member-list';
import { InviteMemberForm } from '@/components/dashboard/invite-member-form';
import Link from 'next/link';

export const metadata = {
  title: 'Team — Decantr',
};

export default async function TeamPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session!.access_token;
  const profile = await getMe(token);

  if (profile.tier !== 'team' && profile.tier !== 'enterprise') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Team</h1>
        <Card>
          <h2 className="mb-2 text-lg font-semibold">Upgrade to Team</h2>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Team management is available on the Team plan ($99/seat/mo). Collaborate with
            your organization, share content under a team namespace, and manage API keys together.
          </p>
          <Link href="/dashboard/billing">
            <Button>Upgrade Now</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // For team-tier users, fetch org data
  // The org slug would come from the user's profile or org membership
  // This is a simplified version — in production, profile would include org info
  let members: Awaited<ReturnType<typeof getOrgMembers>>['members'] = [];
  let orgSlug = '';
  let currentUserRole = 'member';

  try {
    // Assume profile has an org_slug field or we derive it
    // For now, use a placeholder API call pattern
    const orgResult = await getOrgMembers(token, orgSlug);
    members = orgResult.members;
    const currentMember = members.find((m) => m.user_id === profile.id);
    currentUserRole = currentMember?.role || 'member';
  } catch {
    // Org not yet set up
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>
      <InviteMemberForm orgSlug={orgSlug} />
      <TeamMemberList members={members} orgSlug={orgSlug} currentUserRole={currentUserRole} />
    </div>
  );
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add team management page with invite and role controls
```

---

## Task 12: Dashboard - Settings and Billing

Build the settings page (profile) and billing page (current plan, Stripe portal link).

### Files to create/modify

- **Create:** `apps/web/src/app/dashboard/settings/page.tsx`
- **Create:** `apps/web/src/app/dashboard/settings/actions.ts`
- **Create:** `apps/web/src/app/dashboard/billing/page.tsx`
- **Create:** `apps/web/src/app/dashboard/billing/actions.ts`

### Steps

- [ ] **12.1** Create `apps/web/src/app/dashboard/settings/actions.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const displayName = formData.get('display_name') as string;

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
```

- [ ] **12.2** Create `apps/web/src/app/dashboard/settings/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { updateProfile } from './actions';
import { signOut } from '@/app/dashboard/actions';

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <form action={handleSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="mb-1 block text-xs text-[var(--muted)]">Display Name</label>
            <Input name="display_name" placeholder="Your name" />
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-[var(--crimson)]' : 'text-[var(--green)]'}`}>
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

- [ ] **12.3** Create `apps/web/src/app/dashboard/billing/actions.ts`:

```typescript
'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCheckoutSession, createBillingPortalSession } from '@/lib/api';

async function getToken() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session!.access_token;
}

export async function upgradeAction(plan: 'pro' | 'team') {
  const token = await getToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const result = await createCheckoutSession(token, {
      plan,
      success_url: `${siteUrl}/dashboard/billing?upgraded=true`,
      cancel_url: `${siteUrl}/dashboard/billing`,
    });
    redirect(result.url);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create checkout session' };
  }
}

export async function manageBillingAction() {
  const token = await getToken();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const result = await createBillingPortalSession(token, {
      return_url: `${siteUrl}/dashboard/billing`,
    });
    redirect(result.url);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to open billing portal' };
  }
}
```

- [ ] **12.4** Create `apps/web/src/app/dashboard/billing/page.tsx`:

Server component showing:
- Current plan name and badge
- If Free: cards for Pro and Team with upgrade buttons
- If Pro or Team: "Manage Subscription" button that opens Stripe Billing Portal
- Upgrade success message if `?upgraded=true` in search params

```tsx
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMe } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { upgradeAction, manageBillingAction } from './actions';

export const metadata = {
  title: 'Billing — Decantr',
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const upgraded = params.upgraded === 'true';

  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const profile = await getMe(session!.access_token);

  const isPaid = profile.tier === 'pro' || profile.tier === 'team' || profile.tier === 'enterprise';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>

      {upgraded && (
        <Card className="border-[var(--green)]/30">
          <p className="text-sm text-[var(--green)]">
            Upgrade successful! Your new plan is now active.
          </p>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Current Plan</h2>
          <Badge variant={isPaid ? 'success' : 'default'}>
            {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
          </Badge>
        </div>

        {isPaid && (
          <form action={manageBillingAction} className="mt-4">
            <Button type="submit" variant="secondary">
              Manage Subscription
            </Button>
          </form>
        )}
      </Card>

      {!isPaid && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Pro</h3>
            <p className="mt-1 text-2xl font-bold">
              $29<span className="text-sm font-normal text-[var(--muted)]">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>Instant publish (if trusted)</li>
              <li>API keys</li>
              <li>Private content</li>
              <li>300 requests/min</li>
            </ul>
            <form action={upgradeAction.bind(null, 'pro')} className="mt-4">
              <Button type="submit" className="w-full">Upgrade to Pro</Button>
            </form>
          </Card>

          <Card className="border-[var(--cyan)]/30">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Team</h3>
              <Badge variant="official">Popular</Badge>
            </div>
            <p className="mt-1 text-2xl font-bold">
              $99<span className="text-sm font-normal text-[var(--muted)]">/seat/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>Everything in Pro</li>
              <li>Organization namespace</li>
              <li>Team management</li>
              <li>Shared API keys</li>
              <li>600 requests/min</li>
            </ul>
            <form action={upgradeAction.bind(null, 'team')} className="mt-4">
              <Button type="submit" className="w-full">Upgrade to Team</Button>
            </form>
          </Card>
        </div>
      )}

      {profile.tier === 'pro' && (
        <Card>
          <h3 className="text-lg font-semibold">Upgrade to Team</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Get organization namespaces, team management, and shared API keys.
          </p>
          <form action={upgradeAction.bind(null, 'team')} className="mt-4">
            <Button type="submit">Upgrade to Team — $99/seat/mo</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
```

### Run

```bash
cd apps/web && pnpm build
```

### Commit

```
feat(web): add settings and billing pages with stripe portal
```

---

## Task 13: Decantr Essence File

Create the `decantr.essence.json` file for the web app itself, dogfooding the Decantr design system.

### Files to create/modify

- **Create:** `apps/web/decantr.essence.json`

### Steps

- [ ] **13.1** Create `apps/web/decantr.essence.json` with the exact content from the spec:

```json
{
  "version": "2.0.0",
  "blueprint": "registry-platform",
  "archetype": "registry-browser",
  "theme": {
    "style": "luminarum",
    "mode": "dark",
    "recipe": "luminarum",
    "shape": "pill"
  },
  "personality": ["technical", "clean", "professional", "accessible"],
  "platform": {
    "type": "spa",
    "routing": "app-router",
    "framework": "next"
  },
  "structure": [
    {
      "id": "landing",
      "shell": "full-bleed",
      "layout": [
        { "pattern": "hero-split", "preset": "standard" },
        { "pattern": "feature-grid", "preset": "icons" },
        { "pattern": "before-after", "preset": "browser-frames" },
        { "pattern": "tier-upgrade-card", "preset": "highlighted" },
        { "pattern": "quick-start", "preset": "cards" },
        { "pattern": "cta-banner", "preset": "gradient" }
      ]
    },
    {
      "id": "registry",
      "shell": "topbar-main",
      "layout": [
        { "pattern": "search-filter-bar", "preset": "standard" },
        { "pattern": "content-card-grid", "preset": "standard" }
      ]
    },
    {
      "id": "content-detail",
      "shell": "topbar-main",
      "layout": [
        { "pattern": "content-detail-hero", "preset": "standard" },
        { "pattern": "json-viewer", "preset": "collapsible" }
      ]
    },
    {
      "id": "dashboard",
      "shell": "sidebar-main",
      "layout": [
        { "pattern": "stats-bar", "preset": "minimal" },
        { "pattern": "reputation-badge", "preset": "large" },
        { "pattern": "activity-feed", "preset": "compact" }
      ]
    },
    {
      "id": "dashboard-content",
      "shell": "sidebar-main",
      "layout": [
        { "pattern": "content-card-grid", "preset": "editable" }
      ]
    },
    {
      "id": "dashboard-api-keys",
      "shell": "sidebar-main",
      "layout": [
        { "pattern": "api-key-row", "preset": "standard" }
      ]
    },
    {
      "id": "dashboard-team",
      "shell": "sidebar-main",
      "layout": [
        { "pattern": "team-member-row", "preset": "standard" }
      ]
    },
    {
      "id": "admin-moderation",
      "shell": "sidebar-main",
      "layout": [
        { "pattern": "moderation-queue-item", "preset": "standard" }
      ]
    }
  ],
  "features": ["auth", "billing"],
  "guard": {
    "enforce_style": true,
    "enforce_recipe": true,
    "mode": "strict"
  },
  "density": {
    "level": "comfortable",
    "content_gap": "_gap6"
  },
  "target": "react",
  "_meta": {
    "project": "Decantr Registry Platform",
    "description": "The Decantr registry web UI — dogfooding the design intelligence system"
  }
}
```

### Run

No build step needed — this is a configuration file.

### Commit

```
feat(web): add decantr.essence.json for dogfooding
```

---

## Task 14: Build Verification

Final build and verification pass to ensure the entire app compiles and routes resolve.

### Files to create/modify

None — verification only.

### Steps

- [ ] **14.1** Run the full build:

```bash
cd apps/web && pnpm build
```

- [ ] **14.2** Verify the build output shows all expected routes:

Expected routes:
```
/                                  (landing page)
/login                             (login page)
/signup                            (signup page)
/auth/callback                     (oauth callback route)
/registry                          (registry browser)
/registry/[type]/[namespace]/[slug] (content detail)
/dashboard                         (dashboard overview)
/dashboard/content                 (my content)
/dashboard/content/new             (create content)
/dashboard/content/[id]/edit       (edit content)
/dashboard/api-keys                (api keys)
/dashboard/team                    (team management)
/dashboard/settings                (settings)
/dashboard/billing                 (billing)
```

- [ ] **14.3** Verify `decantr.essence.json` exists at `apps/web/decantr.essence.json`.

- [ ] **14.4** Run a quick dev server test:

```bash
cd apps/web && pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/registry
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login
kill %1
```

All three should return `200`.

### Commit

No commit — this is a verification task.

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Scaffold Next.js app | `apps/web/` |
| 2 | Supabase Auth SSR | `src/lib/supabase/`, `src/middleware.ts` |
| 3 | Shared layout + components | `src/components/`, `src/lib/api.ts` |
| 4 | Auth pages | `src/app/login/`, `src/app/signup/`, `src/app/auth/callback/` |
| 5 | Landing page | `src/components/landing/` |
| 6 | Registry browser | `src/app/(public)/registry/`, `src/components/registry/` |
| 7 | Content detail | `src/app/(public)/registry/[type]/[namespace]/[slug]/` |
| 8 | Dashboard layout + overview | `src/app/dashboard/` |
| 9 | Content management | `src/app/dashboard/content/` |
| 10 | API keys | `src/app/dashboard/api-keys/` |
| 11 | Team management | `src/app/dashboard/team/` |
| 12 | Settings + Billing | `src/app/dashboard/settings/`, `src/app/dashboard/billing/` |
| 13 | Essence file | `apps/web/decantr.essence.json` |
| 14 | Build verification | N/A |

### Architecture Notes

- **All data fetching goes through the Registry API** (`apps/api/`). The web app does not directly query Supabase for content data.
- **Supabase is used only for auth** (session management, OAuth) in the web app.
- **Server Components** are the default. Client Components (`'use client'`) are only used for interactive elements (forms, filters, sidebar highlighting).
- **Server Actions** handle all mutations (create, update, delete, auth).
- **Middleware** refreshes auth tokens on every request and redirects unauthenticated users away from `/dashboard/*` routes.
- **Luminarum theme** is enforced via CSS custom properties in `globals.css`, matching the existing `docs/index.html` color palette.
- **Pill shape** is applied to all buttons, badges, inputs, and navigation links via `rounded-full` (Tailwind) or `var(--radius-pill)`.
