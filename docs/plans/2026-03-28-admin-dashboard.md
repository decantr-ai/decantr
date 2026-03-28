# Admin Dashboard Implementation Plan

**Date:** 2026-03-28
**Scope:** Admin layout, overview page, moderation queue, API client additions, nav updates

---

## Overview

Build an admin dashboard at `/admin` gated to `davidaimi@gmail.com`. The admin key (`DECANTR_ADMIN_KEY`) is kept strictly server-side in server actions. The dashboard provides a moderation queue for reviewing community submissions and an overview page with platform stats.

---

## Step 1: Add admin API methods to the API client

**File:** `apps/web/src/lib/api.ts`

Add a private helper that injects the `X-Admin-Key` header, then add three admin methods to the `api` object.

```ts
// Add this interface after the existing OrgMember interface:

export interface ModerationQueueItem {
  id: string;
  content_id: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  content: {
    id: string;
    type: string;
    slug: string;
    namespace: string;
    version: string;
    data: Record<string, unknown>;
  };
}

export interface ModerationQueueResponse {
  total: number;
  limit: number;
  offset: number;
  items: ModerationQueueItem[];
}
```

Add a new `adminFetch` helper right after the existing `apiFetch` function:

```ts
async function adminFetch<T>(
  path: string,
  options: FetchOptions & RequestInit & { adminKey: string }
): Promise<T> {
  const { adminKey, ...rest } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Key': adminKey,
  };

  if (rest.token) {
    headers['Authorization'] = `Bearer ${rest.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}
```

Add these methods inside the `api` object, after the Team / Org section:

```ts
  // Admin
  getModerationQueue: (
    token: string,
    adminKey: string,
    params?: { status?: string; limit?: number; offset?: number }
  ) => {
    const query: Record<string, string> = {};
    if (params?.status) query.status = params.status;
    if (params?.limit != null) query.limit = String(params.limit);
    if (params?.offset != null) query.offset = String(params.offset);
    const qs = Object.keys(query).length ? `?${new URLSearchParams(query)}` : '';
    return adminFetch<ModerationQueueResponse>(`/admin/moderation/queue${qs}`, {
      token,
      adminKey,
    });
  },
  approveContent: (token: string, adminKey: string, queueId: string) =>
    adminFetch<{ message: string }>(`/admin/moderation/${queueId}/approve`, {
      token,
      adminKey,
      method: 'POST',
    }),
  rejectContent: (token: string, adminKey: string, queueId: string, reason: string) =>
    adminFetch<{ message: string }>(`/admin/moderation/${queueId}/reject`, {
      token,
      adminKey,
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
```

### Full modified file

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

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
  published_at?: string;
  data?: Record<string, unknown>;
}

export interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface OrgMember {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface ModerationQueueItem {
  id: string;
  content_id: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  content: {
    id: string;
    type: string;
    slug: string;
    namespace: string;
    version: string;
    data: Record<string, unknown>;
  };
}

export interface ModerationQueueResponse {
  total: number;
  limit: number;
  offset: number;
  items: ModerationQueueItem[];
}

interface FetchOptions {
  token?: string;
  apiKey?: string;
}

async function apiFetch<T>(path: string, options?: FetchOptions & RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options?.apiKey) {
    headers['X-API-Key'] = options.apiKey;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers as Record<string, string> },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

async function adminFetch<T>(
  path: string,
  options: FetchOptions & RequestInit & { adminKey: string }
): Promise<T> {
  const { adminKey, ...rest } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Admin-Key': adminKey,
  };

  if (rest.token) {
    headers['Authorization'] = `Bearer ${rest.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Public
  listContent: (type: string, params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiFetch<{ total: number; items: any[] }>(`/${type}${query}`);
  },
  getContent: (type: string, namespace: string, slug: string) =>
    apiFetch<any>(`/${type}/${namespace}/${slug}`),
  search: (q: string, params?: Record<string, string>) => {
    const query = new URLSearchParams({ q, ...params });
    return apiFetch<{ total: number; results: any[] }>(`/search?${query}`);
  },

  // Authenticated
  getMe: (token: string) => apiFetch<any>('/me', { token }),
  getMyContent: (token: string) => apiFetch<any>('/my/content', { token }),
  getApiKeys: (token: string) => apiFetch<any>('/api-keys', { token }),
  createApiKey: (token: string, body: any) =>
    apiFetch<any>('/api-keys', { token, method: 'POST', body: JSON.stringify(body) }),
  deleteApiKey: (token: string, id: string) =>
    apiFetch<void>(`/api-keys/${id}`, { token, method: 'DELETE' }),
  publishContent: (token: string, body: any) =>
    apiFetch<any>('/content', { token, method: 'POST', body: JSON.stringify(body) }),
  getBillingStatus: (token: string) => apiFetch<any>('/billing/status', { token }),
  createCheckout: (token: string, body: any) =>
    apiFetch<any>('/billing/checkout', { token, method: 'POST', body: JSON.stringify(body) }),
  createPortal: (token: string, body: any) =>
    apiFetch<any>('/billing/portal', { token, method: 'POST', body: JSON.stringify(body) }),

  // Team / Org
  getOrgMembers: (token: string, orgSlug: string) =>
    apiFetch<{ members: OrgMember[] }>(`/orgs/${orgSlug}/members`, { token }),
  inviteOrgMember: (token: string, orgSlug: string, body: { email: string; role: string }) =>
    apiFetch<any>(`/orgs/${orgSlug}/members`, { token, method: 'POST', body: JSON.stringify(body) }),
  removeOrgMember: (token: string, orgSlug: string, userId: string) =>
    apiFetch<void>(`/orgs/${orgSlug}/members/${userId}`, { token, method: 'DELETE' }),
  updateOrgMemberRole: (token: string, orgSlug: string, userId: string, body: { role: string }) =>
    apiFetch<any>(`/orgs/${orgSlug}/members/${userId}`, { token, method: 'PATCH', body: JSON.stringify(body) }),

  // Admin
  getModerationQueue: (
    token: string,
    adminKey: string,
    params?: { status?: string; limit?: number; offset?: number }
  ) => {
    const query: Record<string, string> = {};
    if (params?.status) query.status = params.status;
    if (params?.limit != null) query.limit = String(params.limit);
    if (params?.offset != null) query.offset = String(params.offset);
    const qs = Object.keys(query).length ? `?${new URLSearchParams(query)}` : '';
    return adminFetch<ModerationQueueResponse>(`/admin/moderation/queue${qs}`, {
      token,
      adminKey,
    });
  },
  approveContent: (token: string, adminKey: string, queueId: string) =>
    adminFetch<{ message: string }>(`/admin/moderation/${queueId}/approve`, {
      token,
      adminKey,
      method: 'POST',
    }),
  rejectContent: (token: string, adminKey: string, queueId: string, reason: string) =>
    adminFetch<{ message: string }>(`/admin/moderation/${queueId}/reject`, {
      token,
      adminKey,
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// Standalone exports for server components
export function listContent(
  type: string,
  params?: { namespace?: string; limit?: number; offset?: number }
) {
  const query: Record<string, string> = {};
  if (params?.namespace) query.namespace = params.namespace;
  if (params?.limit != null) query.limit = String(params.limit);
  if (params?.offset != null) query.offset = String(params.offset);
  return apiFetch<{ total: number; items: ContentItem[] }>(
    `/${type}${Object.keys(query).length ? `?${new URLSearchParams(query)}` : ''}`
  );
}

export function searchContent(
  q: string,
  params?: { type?: string; namespace?: string }
) {
  const query: Record<string, string> = { q };
  if (params?.type) query.type = params.type;
  if (params?.namespace) query.namespace = params.namespace;
  return apiFetch<{ total: number; results: ContentItem[] }>(
    `/search?${new URLSearchParams(query)}`
  ).then(data => ({ total: data.total, items: data.results }));
}

export function getContent(type: string, namespace: string, slug: string) {
  return apiFetch<ContentItem>(`/${type}/${namespace}/${slug}`);
}
```

---

## Step 2: Create admin layout with email gating

**File:** `apps/web/src/app/admin/layout.tsx` (new)

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'davidaimi@gmail.com';

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: '◎' },
  { href: '/admin/moderation', label: 'Moderation', icon: '⚖' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Supabase unavailable
  }

  if (!user) {
    redirect('/login');
  }

  if (user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] min-h-[calc(100vh-4rem)]">
        <nav className="p-4 flex flex-col gap-1">
          <div className="px-3 py-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">
              Admin
            </span>
          </div>
          <AdminNavLinks items={adminNavItems} />
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <span className="text-base">←</span>
              Back to Dashboard
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

// Client component extracted inline for sidebar active state
import { AdminNavLinksClient } from './admin-nav-links';
const AdminNavLinks = AdminNavLinksClient;
```

Wait -- the layout is a server component but needs `usePathname` for active link highlighting. We need a small client component for the nav links. Let me restructure:

**File:** `apps/web/src/app/admin/layout.tsx` (new)

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'davidaimi@gmail.com';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Supabase unavailable
  }

  if (!user) {
    redirect('/login');
  }

  if (user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

---

## Step 3: Create admin sidebar component

**File:** `apps/web/src/components/admin/admin-sidebar.tsx` (new)

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: '◎' },
  { href: '/admin/moderation', label: 'Moderation', icon: '⚖' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] min-h-[calc(100vh-4rem)]">
      <nav className="p-4 flex flex-col gap-1">
        <div className="px-3 py-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-dim)]">
            Admin
          </span>
        </div>
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-[var(--primary)]/15 text-[var(--primary-light)] font-medium'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <span className="text-base">←</span>
            Back to Dashboard
          </Link>
        </div>
      </nav>
    </aside>
  );
}
```

---

## Step 4: Create admin overview page

**File:** `apps/web/src/app/admin/page.tsx` (new)

```tsx
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  try {
    const pending = await api.getModerationQueue(token, adminKey, {
      status: 'pending',
      limit: 1,
    });
    pendingCount = pending.total;
  } catch {
    // API may not be reachable
  }

  try {
    const approved = await api.getModerationQueue(token, adminKey, {
      status: 'approved',
      limit: 1,
    });
    approvedCount = approved.total;
  } catch {
    // ignore
  }

  try {
    const rejected = await api.getModerationQueue(token, adminKey, {
      status: 'rejected',
      limit: 1,
    });
    rejectedCount = rejected.total;
  } catch {
    // ignore
  }

  const totalContent = approvedCount + pendingCount + rejectedCount;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Admin Overview</h1>
        <p className="text-[var(--fg-muted)] mt-1">Platform moderation and content management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Pending Review</p>
          <p className="text-3xl font-bold text-[var(--warning)] mt-1">{pendingCount}</p>
        </Card>
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Total Approved</p>
          <p className="text-3xl font-bold text-[var(--success)] mt-1">{approvedCount}</p>
        </Card>
        <Card>
          <p className="text-[var(--fg-dim)] text-sm">Total Rejected</p>
          <p className="text-3xl font-bold text-[var(--error)] mt-1">{rejectedCount}</p>
        </Card>
      </div>

      <Card>
        <p className="text-[var(--fg-dim)] text-sm">Total Submissions</p>
        <p className="text-3xl font-bold text-[var(--fg)] mt-1">{totalContent}</p>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/moderation">
            <Button>Review Moderation Queue</Button>
          </Link>
          <Link href="/admin/moderation?status=pending">
            <Button variant="secondary">
              Pending Items ({pendingCount})
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Create moderation server actions

**File:** `apps/web/src/app/admin/moderation/actions.ts` (new)

```ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';

const ADMIN_EMAIL = 'davidaimi@gmail.com';

async function getAdminContext() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  const token = session.access_token;
  const adminKey = process.env.DECANTR_ADMIN_KEY;

  if (!adminKey) {
    throw new Error('Admin key not configured');
  }

  return { token, adminKey };
}

export async function approveSubmission(queueId: string) {
  const { token, adminKey } = await getAdminContext();

  try {
    const result = await api.approveContent(token, adminKey, queueId);
    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve',
    };
  }
}

export async function rejectSubmission(queueId: string, reason: string) {
  const { token, adminKey } = await getAdminContext();

  if (!reason.trim()) {
    return { success: false, message: 'Rejection reason is required' };
  }

  try {
    const result = await api.rejectContent(token, adminKey, queueId, reason);
    revalidatePath('/admin/moderation');
    revalidatePath('/admin');
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reject',
    };
  }
}
```

---

## Step 6: Create the moderation queue item component

**File:** `apps/web/src/components/admin/moderation-item.tsx` (new)

```tsx
'use client';

import { useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { approveSubmission, rejectSubmission } from '@/app/admin/moderation/actions';
import type { ModerationQueueItem } from '@/lib/api';

export function ModerationItem({ item }: { item: ModerationQueueItem }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const contentName =
    (item.content.data?.name as string) ||
    (item.content.data?.id as string) ||
    item.content.slug;

  function handleApprove() {
    startTransition(async () => {
      const result = await approveSubmission(item.id);
      setFeedback(result);
    });
  }

  function handleReject() {
    if (!reason.trim()) return;
    startTransition(async () => {
      const result = await rejectSubmission(item.id, reason);
      setFeedback(result);
      if (result.success) {
        setRejectMode(false);
        setReason('');
      }
    });
  }

  const statusVariant = {
    pending: 'warning' as const,
    approved: 'success' as const,
    rejected: 'error' as const,
  };

  const submittedDate = new Date(item.submitted_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[var(--fg)]">{contentName}</span>
            <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
            <Badge>{item.content.type}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-[var(--fg-dim)]">
            <span>{item.content.namespace}/{item.content.slug}</span>
            <span>v{item.content.version}</span>
            <span>{submittedDate}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {/* Expandable JSON preview */}
      {expanded && (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 overflow-x-auto">
          <pre className="text-xs text-[var(--fg-muted)] whitespace-pre-wrap break-words">
            {JSON.stringify(item.content.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Feedback message */}
      {feedback && (
        <div
          className={`text-sm px-3 py-2 rounded-[var(--radius-md)] ${
            feedback.success
              ? 'bg-[var(--success)]/20 text-[var(--success)]'
              : 'bg-[var(--error)]/20 text-[var(--error)]'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Action buttons (only for pending items) */}
      {item.status === 'pending' && !feedback?.success && (
        <div className="flex items-center gap-2 pt-1">
          {rejectMode ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Rejection reason..."
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-dim)] focus:outline-none focus:border-[var(--primary)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleReject();
                  if (e.key === 'Escape') {
                    setRejectMode(false);
                    setReason('');
                  }
                }}
                autoFocus
              />
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={isPending || !reason.trim()}
              >
                {isPending ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectMode(false);
                  setReason('');
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
              >
                {isPending ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectMode(true)}
                disabled={isPending}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      )}

      {/* Show rejection reason for already-rejected items */}
      {item.status === 'rejected' && item.rejection_reason && (
        <div className="text-sm text-[var(--error)] bg-[var(--error)]/10 px-3 py-2 rounded-[var(--radius-md)]">
          Reason: {item.rejection_reason}
        </div>
      )}
    </Card>
  );
}
```

---

## Step 7: Create the moderation queue page

**File:** `apps/web/src/app/admin/moderation/page.tsx` (new)

```tsx
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import type { ModerationQueueItem } from '@/lib/api';
import { ModerationItem } from '@/components/admin/moderation-item';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ModerationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || 'pending';
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let items: ModerationQueueItem[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const result = await api.getModerationQueue(token, adminKey, {
      status,
      limit: PAGE_SIZE,
      offset,
    });
    items = result.items;
    total = result.total;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to fetch moderation queue';
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const statusOptions = [
    { value: 'pending', label: 'Pending', variant: 'warning' as const },
    { value: 'approved', label: 'Approved', variant: 'success' as const },
    { value: 'rejected', label: 'Rejected', variant: 'error' as const },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Moderation Queue</h1>
        <p className="text-[var(--fg-muted)] mt-1">
          Review and moderate community submissions
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2">
        {statusOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/moderation?status=${opt.value}`}
          >
            <Button
              variant={status === opt.value ? 'primary' : 'secondary'}
              size="sm"
            >
              {opt.label}
              {status === opt.value && (
                <span className="ml-1.5 text-xs opacity-80">({total})</span>
              )}
            </Button>
          </Link>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-[var(--error)]">
          <p className="text-[var(--error)] text-sm">{error}</p>
        </Card>
      )}

      {/* Empty state */}
      {!error && items.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-[var(--fg-muted)]">
            No {status} items in the queue.
          </p>
        </Card>
      )}

      {/* Queue items */}
      <div className="space-y-4">
        {items.map((item) => (
          <ModerationItem key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-[var(--fg-dim)]">
            Showing {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link href={`/admin/moderation?status=${status}&page=${page - 1}`}>
                <Button variant="secondary" size="sm">Previous</Button>
              </Link>
            )}
            <span className="text-sm text-[var(--fg-muted)] px-2">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/moderation?status=${status}&page=${page + 1}`}>
                <Button variant="secondary" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Step 8: Add Admin link to the nav component

**File:** `apps/web/src/components/nav.tsx`

Add a conditional "Admin" link that only shows when the user's email is `davidaimi@gmail.com`.

```tsx
import Link from 'next/link';
import { Button } from './ui/button';

const ADMIN_EMAIL = 'davidaimi@gmail.com';

export function Nav({ user }: { user?: { email: string } | null }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[var(--fg)]">
          Decantr
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/registry" className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors text-sm">
            Registry
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors text-sm">
                Dashboard
              </Link>
              {user.email === ADMIN_EMAIL && (
                <Link href="/admin" className="text-[var(--primary-light)] hover:text-[var(--primary)] transition-colors text-sm font-medium">
                  Admin
                </Link>
              )}
              <span className="text-[var(--fg-dim)] text-sm">{user.email}</span>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

---

## Step 9: Environment variable setup

Add `DECANTR_ADMIN_KEY` to the Vercel project:

```bash
# Via Vercel CLI (or set in Vercel dashboard under Settings > Environment Variables)
vercel env add DECANTR_ADMIN_KEY production
# Value: dctr_admin_77c4795b9ab38cb906eeb44c55ec1f658f7cff12bc9bca8e
```

The key is already set on Fly.io for the API server. The web app only needs it as a server-side env var (no `NEXT_PUBLIC_` prefix) because it is exclusively used in server actions and server components.

---

## File Summary

| Action | File |
|--------|------|
| Modify | `apps/web/src/lib/api.ts` |
| Create | `apps/web/src/app/admin/layout.tsx` |
| Create | `apps/web/src/app/admin/page.tsx` |
| Create | `apps/web/src/app/admin/moderation/page.tsx` |
| Create | `apps/web/src/app/admin/moderation/actions.ts` |
| Create | `apps/web/src/components/admin/admin-sidebar.tsx` |
| Create | `apps/web/src/components/admin/moderation-item.tsx` |
| Modify | `apps/web/src/components/nav.tsx` |

## Security Notes

- The `DECANTR_ADMIN_KEY` never appears in client-side code. It is only read via `process.env.DECANTR_ADMIN_KEY` inside server components and server actions.
- The admin layout performs a server-side email check and redirects non-admins before rendering any admin content.
- Server actions in `actions.ts` independently verify the admin email before every mutation, so even direct server action calls from non-admin clients are rejected.
- The `adminFetch` helper is only callable from server-side code because the admin key must be passed explicitly (it is never available in the browser).
