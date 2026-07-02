import {
  createContentResolver,
  OFFICIAL_CONTENT_NAMESPACE,
} from '@decantr/content';
import type { ContentResolver, ContentType, ResolvedContent } from '@decantr/registry';

interface PublicContentResolverOptions {
  onResolve?: (event: {
    contentType: ContentType;
    success: boolean;
    durationMs: number;
    itemId: string;
    namespace: string;
    registrySource: 'official' | 'custom';
    visibility?: 'public';
    errorCode?: 'content_item_not_found';
  }) => void;
}

export function createPublicContentResolver(
  preferredNamespace: string = OFFICIAL_CONTENT_NAMESPACE,
  options: PublicContentResolverOptions = {},
): ContentResolver {
  const localResolver = createContentResolver(preferredNamespace);

  return {
    async resolve<T extends ContentType>(type: T, id: string): Promise<ResolvedContent | null> {
      const startedAt = Date.now();
      const resolved = await localResolver.resolve(type, id);

      options.onResolve?.({
        contentType: type,
        success: Boolean(resolved),
        durationMs: Date.now() - startedAt,
        itemId: id,
        namespace: preferredNamespace,
        registrySource: registrySourceForNamespace(preferredNamespace),
        visibility: resolved ? 'public' : undefined,
        errorCode: resolved ? undefined : 'content_item_not_found',
      });

      return resolved as ResolvedContent | null;
    },
  };
}

function registrySourceForNamespace(namespace: string): 'custom' | 'official' {
  return namespace === OFFICIAL_CONTENT_NAMESPACE ? 'official' : 'custom';
}
