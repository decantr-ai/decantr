import { notFound } from 'next/navigation';
import { getContent } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { NamespaceBadge } from '@/components/registry/namespace-badge';
import { JsonViewer } from '@/components/registry/json-viewer';
import { CopyButton } from '@/components/registry/copy-button';

interface ContentDetailParams {
  params: Promise<{ type: string; namespace: string; slug: string }>;
}

export async function generateMetadata({ params }: ContentDetailParams) {
  const { type, namespace, slug } = await params;
  const decodedNamespace = decodeURIComponent(namespace);
  return {
    title: `${slug} — ${decodedNamespace} ${type} — Decantr`,
  };
}

export default async function ContentDetailPage({ params }: ContentDetailParams) {
  const { type, namespace, slug } = await params;
  const decodedNamespace = decodeURIComponent(namespace);

  let content;
  try {
    content = await getContent(type, decodedNamespace, slug);
  } catch {
    notFound();
  }

  const name = (content.data.name as string) || content.slug;
  const description = (content.data.description as string) || '';
  const components = (content.data.components as Array<{ name: string }>) || [];
  const presets = (content.data.presets as Record<string, unknown>) || {};

  return (
    <section className="mx-auto max-w-[var(--max-w)] px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge>{content.type}</Badge>
          <NamespaceBadge namespace={content.namespace} />
          <Badge variant="default">v{content.version}</Badge>
          {content.status === 'published' && <Badge variant="success">Published</Badge>}
        </div>

        <h1 className="mb-2 text-3xl font-bold">{name}</h1>
        {description && (
          <p className="text-[var(--fg-muted)]">{description}</p>
        )}

        <div className="mt-4 flex gap-2">
          <CopyButton
            text={`decantr import ${content.type} ${content.namespace}/${content.slug}`}
            label="Copy Import Command"
          />
          <CopyButton
            text={JSON.stringify(content.data, null, 2)}
            label="Copy JSON"
          />
        </div>
      </div>

      {/* Components list (if present) */}
      {components.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Components</h2>
          <div className="flex flex-wrap gap-2">
            {components.map((comp) => (
              <Badge key={comp.name} variant="default">{comp.name}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Presets (if present) */}
      {Object.keys(presets).length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Presets</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(presets).map((preset) => (
              <Badge key={preset} variant="default">{preset}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* JSON Viewer */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Source</h2>
        <JsonViewer data={content.data} />
      </div>
    </section>
  );
}
