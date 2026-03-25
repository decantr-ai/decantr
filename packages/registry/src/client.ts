export interface RegistryClientOptions {
  baseUrl?: string;
  cacheDir?: string;
  cacheTtl?: number;
}

export interface SearchResult {
  id: string;
  type: string;
  name: string;
  description: string;
  version: string;
  tags: string[];
}

export interface RegistryClient {
  search(query: string, type?: string): Promise<SearchResult[]>;
  fetch(type: string, id: string, version?: string): Promise<unknown>;
}

export function createRegistryClient(options: RegistryClientOptions = {}): RegistryClient {
  const baseUrl = options.baseUrl ?? 'https://decantr-registry.fly.dev/v1';
  return {
    async search(query: string, type?: string): Promise<SearchResult[]> {
      const params = new URLSearchParams({ q: query });
      if (type) params.set('type', type);
      const res = await fetch(`${baseUrl}/search?${params}`);
      if (!res.ok) return [];
      return res.json() as Promise<SearchResult[]>;
    },
    async fetch(type: string, id: string, version?: string): Promise<unknown> {
      const url = version ? `${baseUrl}/content/${type}/${id}/${version}` : `${baseUrl}/content/${type}/${id}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return res.json();
    },
  };
}
