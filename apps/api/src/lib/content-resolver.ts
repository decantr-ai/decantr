import type { ContentResolver, ContentType, ResolvedContent } from '@decantr/registry';
import type { Archetype, Blueprint, Pattern, Shell, Theme } from '@decantr/registry';
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
): ContentResolver {
  const client = createAdminClient();

  return {
    async resolve<T extends ContentType>(type: T, id: string): Promise<ResolvedContent<ContentMap[T]> | null> {
      const { data, error } = await client
        .from('content')
        .select('namespace, slug, data')
        .eq('type', type)
        .eq('slug', id)
        .eq('visibility', 'public')
        .eq('status', 'published')
        .limit(5);

      if (error || !Array.isArray(data)) {
        return null;
      }

      const row = pickPreferredRow(
        data as unknown as Array<ContentRow<ContentMap[T]>>,
        preferredNamespace,
      );
      if (!row) {
        return null;
      }

      return {
        item: row.data,
        source: row.namespace === preferredNamespace ? 'local' : 'core',
        path: `${row.namespace}/${type}/${row.slug}`,
      };
    },
  };
}
