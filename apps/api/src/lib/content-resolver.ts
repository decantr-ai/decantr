import type { ContentResolver, ContentType, ResolvedContent } from '@decantr/registry';
import type { Archetype, Blueprint, Pattern, Shell, Theme } from '@decantr/registry';
import type { RegistryItemResolvedProperties } from '@decantr/telemetry';
import { createAdminClient } from '../db/client.js';

type ContentMap = {
  pattern: Pattern;
  archetype: Archetype;
  theme: Theme;
  blueprint: Blueprint;
  shell: Shell;
};

interface ContentRow<T> {
  namespace: string;
  slug: string;
  data: T;
}

interface PublicContentResolverOptions {
  onResolve?: (event: RegistryItemResolvedProperties) => void;
}

function pickPreferredRow<T>(
  rows: Array<ContentRow<T>>,
  preferredNamespace: string,
): ContentRow<T> | null {
  if (rows.length === 0) return null;

  const exact = rows.find(row => row.namespace === preferredNamespace);
  if (exact) return exact;

  const official = rows.find(row => row.namespace === '@official');
  if (official) return official;

  return rows[0] ?? null;
}

export function createPublicContentResolver(
  preferredNamespace: string = '@official',
  options: PublicContentResolverOptions = {},
): ContentResolver {
  const client = createAdminClient();

  return {
    async resolve<T extends ContentType>(type: T, id: string): Promise<ResolvedContent<ContentMap[T]> | null> {
      const startedAt = Date.now();
      const { data, error } = await client
        .from('content')
        .select('namespace, slug, data')
        .eq('type', type)
        .eq('slug', id)
        .eq('visibility', 'public')
        .eq('status', 'published')
        .limit(5);

      if (error || !Array.isArray(data)) {
        options.onResolve?.({
          contentType: type,
          success: false,
          durationMs: Date.now() - startedAt,
          errorCode: 'registry_resolve_failed',
          itemId: id,
          namespace: preferredNamespace,
          registrySource: registrySourceForNamespace(preferredNamespace),
        });
        return null;
      }

      const row = pickPreferredRow(
        data as unknown as Array<ContentRow<ContentMap[T]>>,
        preferredNamespace,
      );
      if (!row) {
        options.onResolve?.({
          contentType: type,
          success: false,
          durationMs: Date.now() - startedAt,
          errorCode: 'registry_item_not_found',
          itemId: id,
          namespace: preferredNamespace,
          registrySource: registrySourceForNamespace(preferredNamespace),
        });
        return null;
      }

      options.onResolve?.({
        contentType: type,
        success: true,
        durationMs: Date.now() - startedAt,
        itemId: id,
        namespace: row.namespace,
        registrySource: registrySourceForNamespace(row.namespace),
        visibility: 'public',
      });

      return {
        item: row.data,
        source: row.namespace === preferredNamespace ? 'local' : 'core',
        path: `${row.namespace}/${type}/${row.slug}`,
      };
    },
  };
}

function registrySourceForNamespace(namespace: string): 'custom' | 'official' {
  return namespace === '@official' ? 'official' : 'custom';
}
