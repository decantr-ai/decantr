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
  owner_name?: string;
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
