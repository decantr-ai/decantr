const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

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
};
