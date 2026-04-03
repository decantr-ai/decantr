import { Badge } from '@/components/ui/badge';

const namespaceVariant: Record<string, 'official' | 'community' | 'org'> = {
  '@official': 'official',
  '@community': 'community',
};

export function NamespaceBadge({ namespace }: { namespace: string }) {
  const variant = namespaceVariant[namespace] || 'org';
  return <Badge variant={variant}>{namespace}</Badge>;
}
