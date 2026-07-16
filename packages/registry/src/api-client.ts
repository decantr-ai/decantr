import { ContentAPIClient, ContentAPIError } from '@decantr/content/client';

export type {
  ContentAPIClientOptions as RegistryAPIClientOptions,
  ContentClient as RegistryClient,
  ContentClientOptions as RegistryClientOptions,
  ContentSearchResult as SearchResult,
} from '@decantr/content/client';
export { createContentClient as createRegistryClient } from '@decantr/content/client';

export class RegistryAPIError extends ContentAPIError {
  constructor(status: number, message: string, details?: unknown) {
    super(status, message, details);
    this.name = 'RegistryAPIError';
  }
}

export class RegistryAPIClient extends ContentAPIClient {
  protected override createError(
    status: number,
    message: string,
    details?: unknown,
  ): RegistryAPIError {
    return new RegistryAPIError(status, message, details);
  }
}
