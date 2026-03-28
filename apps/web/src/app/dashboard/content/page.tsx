import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ContentItem {
  id: string;
  type: string;
  slug: string;
  version: number;
  status: string;
  visibility?: string;
  namespace?: string;
  updated_at?: string;
}

export default async function ContentPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let items: ContentItem[] = [];

  try {
    const result = await api.getMyContent(token);
    items = Array.isArray(result) ? result : (result?.items ?? []);
  } catch {
    // API may not be reachable
  }

  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case 'pattern': return 'official' as const;
      case 'theme': return 'community' as const;
      case 'recipe': return 'org' as const;
      default: return 'default' as const;
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'success' as const;
      case 'draft': return 'warning' as const;
      case 'archived': return 'error' as const;
      default: return 'default' as const;
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">My Content</h1>
          <p className="text-[var(--fg-muted)] mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/content/new">
          <Button>Create New</Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-[var(--fg-muted)] mb-4">No content yet. Create your first item to get started.</p>
          <Link href="/dashboard/content/new">
            <Button>Create Content</Button>
          </Link>
        </Card>
      ) : (
        <div className="border border-[var(--border)] rounded-[var(--radius-md)] overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--fg-muted)]">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--fg-muted)]">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--fg-muted)]">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--fg-muted)]">Visibility</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--fg-muted)]">Version</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--fg-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)]">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[var(--fg)]">{item.slug}</span>
                    {item.namespace && (
                      <span className="text-xs text-[var(--fg-dim)] ml-1">({item.namespace})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={typeBadgeVariant(item.type)}>{item.type}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.visibility === 'public' ? 'success' : 'default'}>
                      {item.visibility ?? 'public'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--fg-muted)]">v{item.version}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
