import type {
  ContentItem as AuthenticatedContentItem,
  ContentIntelligenceSource,
  ContentListResponse,
  PublicContentRecord,
  PublicContentSummary,
  PublicUserProfile,
  RegistryIntelligenceSummaryResponse,
  SearchResponse,
  OwnedContentSummary,
} from '@decantr/registry/client';
import { RegistryAPIClient } from '@decantr/registry/client';
import { getPublicRegistryClient, normalizeApiContentType } from '@/lib/public-registry-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

export type ContentItem = PublicContentSummary;
export type ContentRecord<TData = Record<string, unknown>> = PublicContentRecord<TData>;
export type UserProfile = PublicUserProfile;
export type DashboardContentItem = OwnedContentSummary;

export interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  org_id: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface OrgMember {
  user_id: string;
  email: string;
  display_name?: string | null;
  username?: string | null;
  role: string;
  created_at: string;
}

export interface OrganizationSummary {
  id: string;
  slug: string;
  name: string;
  tier: 'team' | 'enterprise';
  role: 'owner' | 'admin' | 'member';
  seat_limit: number;
  member_count: number;
  stripe_subscription_id: string | null;
}

export interface CommercialEntitlements {
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  personal_private_packages: boolean;
  org_collaboration: boolean;
  org_private_packages: boolean;
  shared_packages: boolean;
  audit_logs: boolean;
  approval_workflows: boolean;
  support_level: 'community' | 'priority' | 'enterprise';
}

export interface CommercialLimits {
  api_requests_per_minute: number | null;
  personal_content_items: number | null;
  personal_private_packages: number | null;
  org_content_items: number | null;
  team_seats: number | null;
}

export interface BillingStatus {
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  entitlements: CommercialEntitlements;
  limits: CommercialLimits;
  usage: {
    api_requests_30d: number;
    personal_publishes_30d: number;
    private_package_publishes_30d: number;
    org_package_publishes_30d: number;
    approval_actions_30d: number;
    personal_content_items: number;
    personal_private_packages: number;
    org_content_items: number;
    seats_used: number;
    seats_limit: number;
  };
  organizations: OrganizationSummary[];
  subscription: null | {
    id: string;
    status: string;
    price_id: string | null;
    quantity: number | null;
    current_period_start: number | null;
    current_period_end: number | null;
    cancel_at_period_end: boolean;
  };
}

export interface MeResponse {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  entitlements: CommercialEntitlements;
  limits: CommercialLimits;
  reputation_score: number;
  trusted: boolean;
  org_slug: string | null;
  organizations: OrganizationSummary[];
  created_at: string;
  updated_at: string;
}

export interface OrgAuditEntry {
  id: string;
  actor_user_id: string | null;
  org_id: string | null;
  scope: 'user' | 'organization' | 'billing' | 'content' | 'membership';
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface OrgPolicy {
  org_id: string;
  require_public_content_approval: boolean;
}

export interface OrgUsageSummary {
  organization: {
    id: string;
    slug: string;
    name: string;
    tier: 'team' | 'enterprise';
    seat_limit: number;
  };
  usage: {
    members: number;
    seat_limit: number;
    content_items: number;
    public_packages: number;
    private_packages: number;
    pending_approvals: number;
    api_requests_30d: number;
    org_package_publishes_30d: number;
    approval_actions_30d: number;
  };
}

export interface AdminCommercialSummary {
  users_by_tier: Record<'free' | 'pro' | 'team' | 'enterprise', number>;
  organizations_by_tier: Record<'team' | 'enterprise', number>;
  totals: {
    public_packages: number;
    private_packages: number;
    org_packages: number;
    pending_approvals: number;
    audit_events_30d: number;
    seat_limit_total: number;
    api_requests_30d: number;
    content_publishes_30d: number;
    private_package_publishes_30d: number;
    org_package_publishes_30d: number;
    approval_actions_30d: number;
  };
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
  getUserProfile: (username: string) => getPublicRegistryClient().getPublicUserProfile(username),
  getUserContent: (username: string, params?: Record<string, string>) =>
    getPublicRegistryClient().getPublicUserContent(username, params),
  listContent: (type: string, params?: Record<string, string>) =>
    getPublicRegistryClient().listContent<ContentItem>(normalizeApiContentType(type), params),
  getContent: (type: string, namespace: string, slug: string) =>
    getPublicRegistryClient().getPublicContentRecord(normalizeApiContentType(type), namespace, slug),
  search: (q: string, params?: Record<string, string>) =>
    getPublicRegistryClient()
      .search({
        q,
        type: params?.type,
        namespace: params?.namespace,
        sort: params?.sort,
        recommended: params?.recommended === 'true',
        intelligenceSource: (params?.intelligence_source as ContentIntelligenceSource | undefined) ?? undefined,
      })
      .then((result): SearchResponse => ({ total: result.total, results: result.results })),
  getRegistryIntelligenceSummary: (params?: { namespace?: string }) =>
    getPublicRegistryClient().getRegistryIntelligenceSummary(params),

  // Authenticated
  getMe: (token: string) => apiFetch<MeResponse>('/me', { token }),
  getMyContent: (token: string) => apiFetch<ContentListResponse<DashboardContentItem>>('/my/content', { token }),
  getPrivateContent: (
    token: string,
    params?: { type?: string; scope?: 'all' | 'personal' | 'organization'; q?: string; limit?: number; offset?: number },
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.scope) searchParams.set('scope', params.scope);
    if (params?.q) searchParams.set('q', params.q);
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    if (params?.offset != null) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return apiFetch<ContentListResponse<DashboardContentItem>>(`/private/content${query ? `?${query}` : ''}`, { token });
  },
  getApiKeys: (token: string) => apiFetch<any>('/api-keys', { token }),
  createApiKey: (token: string, body: any) =>
    apiFetch<any>('/api-keys', { token, method: 'POST', body: JSON.stringify(body) }),
  deleteApiKey: (token: string, id: string) =>
    apiFetch<void>(`/api-keys/${id}`, { token, method: 'DELETE' }),
  publishContent: (token: string, body: any) =>
    apiFetch<any>('/content', { token, method: 'POST', body: JSON.stringify(body) }),
  getBillingStatus: (token: string) => apiFetch<BillingStatus>('/billing/status', { token }),
  createCheckout: (token: string, body: any) =>
    apiFetch<any>('/billing/checkout', { token, method: 'POST', body: JSON.stringify(body) }),
  createPortal: (token: string, body: any) =>
    apiFetch<any>('/billing/portal', { token, method: 'POST', body: JSON.stringify(body) }),

  // Team / Org
  getOrgMembers: (token: string, orgSlug: string) =>
    apiFetch<{ organization: Omit<OrganizationSummary, 'role' | 'member_count' | 'stripe_subscription_id'>; your_role: string; members: OrgMember[] }>(`/orgs/${orgSlug}/members`, { token }),
  getOrgContent: (token: string, orgSlug: string, params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    if (params?.offset != null) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return apiFetch<ContentListResponse<DashboardContentItem>>(`/orgs/${orgSlug}/content${query ? `?${query}` : ''}`, { token });
  },
  publishOrgContent: (token: string, orgSlug: string, body: any) =>
    apiFetch<any>(`/orgs/${orgSlug}/content`, { token, method: 'POST', body: JSON.stringify(body) }),
  inviteOrgMember: (token: string, orgSlug: string, body: { email: string; role: string }) =>
    apiFetch<any>(`/orgs/${orgSlug}/members`, { token, method: 'POST', body: JSON.stringify(body) }),
  removeOrgMember: (token: string, orgSlug: string, userId: string) =>
    apiFetch<void>(`/orgs/${orgSlug}/members/${userId}`, { token, method: 'DELETE' }),
  updateOrgMemberRole: (token: string, orgSlug: string, userId: string, body: { role: string }) =>
    apiFetch<any>(`/orgs/${orgSlug}/members/${userId}`, { token, method: 'PATCH', body: JSON.stringify(body) }),
  getOrgAuditLog: (token: string, orgSlug: string, params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    if (params?.offset != null) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return apiFetch<{ total: number; limit: number; offset: number; items: OrgAuditEntry[] }>(`/orgs/${orgSlug}/audit${query ? `?${query}` : ''}`, { token });
  },
  getOrgPolicy: (token: string, orgSlug: string) =>
    apiFetch<OrgPolicy>(`/orgs/${orgSlug}/policy`, { token }),
  getOrgUsage: (token: string, orgSlug: string) =>
    apiFetch<OrgUsageSummary>(`/orgs/${orgSlug}/usage`, { token }),
  updateOrgPolicy: (token: string, orgSlug: string, body: { require_public_content_approval: boolean }) =>
    apiFetch<OrgPolicy>(`/orgs/${orgSlug}/policy`, { token, method: 'PATCH', body: JSON.stringify(body) }),
  getOrgApprovals: (token: string, orgSlug: string, params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit != null) searchParams.set('limit', String(params.limit));
    if (params?.offset != null) searchParams.set('offset', String(params.offset));
    const query = searchParams.toString();
    return apiFetch<ContentListResponse<DashboardContentItem>>(`/orgs/${orgSlug}/approvals${query ? `?${query}` : ''}`, { token });
  },
  approveOrgContent: (token: string, orgSlug: string, contentId: string) =>
    apiFetch<any>(`/orgs/${orgSlug}/approvals/${contentId}/approve`, { token, method: 'POST' }),
  rejectOrgContent: (token: string, orgSlug: string, contentId: string) =>
    apiFetch<any>(`/orgs/${orgSlug}/approvals/${contentId}/reject`, { token, method: 'POST' }),

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
  getCommercialSummary: (token: string, adminKey: string) =>
    adminFetch<AdminCommercialSummary>('/admin/commercial/summary', {
      token,
      adminKey,
    }),
};

// Standalone exports for server components
export function listContent(
  type: string,
  params?: {
    namespace?: string;
    sort?: string;
    recommended?: boolean;
    intelligenceSource?: ContentIntelligenceSource;
    limit?: number;
    offset?: number;
  }
) {
  return getPublicRegistryClient().listContent<ContentItem>(
    normalizeApiContentType(type),
    params,
  );
}

export function searchContent(
  q: string,
  params?: {
    type?: string;
    namespace?: string;
    sort?: string;
    recommended?: boolean;
    intelligenceSource?: ContentIntelligenceSource;
    limit?: number;
    offset?: number;
  }
) {
  return getPublicRegistryClient()
    .search({
      q,
      type: params?.type,
      namespace: params?.namespace,
      sort: params?.sort,
      recommended: params?.recommended,
      intelligenceSource: params?.intelligenceSource,
      limit: params?.limit,
      offset: params?.offset,
    })
    .then((data) => ({ total: data.total, items: data.results }));
}

export function getContent(
  type: string,
  namespace: string,
  slug: string,
  options?: { token?: string; apiKey?: string },
) {
  if (options?.token || options?.apiKey) {
    const client = new RegistryAPIClient({
      baseUrl: API_URL,
      apiKey: options?.apiKey,
      accessToken: options?.token,
    });
    return client.getContentRecord(
      normalizeApiContentType(type),
      namespace,
      slug,
    );
  }

  return getPublicRegistryClient().getPublicContentRecord(
    normalizeApiContentType(type),
    namespace,
    slug,
  );
}

export function getUserProfile(username: string) {
  return getPublicRegistryClient().getPublicUserProfile(username);
}

export function getRegistryIntelligenceSummary(
  params?: { namespace?: string },
): Promise<RegistryIntelligenceSummaryResponse> {
  return getPublicRegistryClient().getRegistryIntelligenceSummary(params);
}

export function getUserContent(
  username: string,
  params?: {
    type?: string;
    sort?: string;
    recommended?: boolean;
    intelligenceSource?: ContentIntelligenceSource;
    limit?: number;
    offset?: number;
  }
) {
  return getPublicRegistryClient().getPublicUserContent(username, params);
}
