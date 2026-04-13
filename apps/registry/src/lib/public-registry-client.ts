import {
  RegistryAPIClient,
  isApiContentType,
  type ApiContentType,
} from '@decantr/registry/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';

let publicRegistryClient: RegistryAPIClient | null = null;

export function getPublicRegistryApiUrl(): string {
  return API_URL;
}

export function getPublicRegistryClient(): RegistryAPIClient {
  if (!publicRegistryClient) {
    publicRegistryClient = new RegistryAPIClient({ baseUrl: API_URL });
  }

  return publicRegistryClient;
}

export function normalizeApiContentType(type: string): ApiContentType {
  const candidate = type.endsWith('s') ? type : `${type}s`;
  if (!isApiContentType(candidate)) {
    throw new Error(`Unsupported content type: ${type}`);
  }

  return candidate;
}
