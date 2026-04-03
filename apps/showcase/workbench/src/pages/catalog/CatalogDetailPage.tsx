import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Tag, ExternalLink } from 'lucide-react';
import { catalogItems, buttonProperties } from '@/data/mock';

const statusAnnotation: Record<string, string> = {
  stable: 'success',
  beta: 'warning',
  experimental: 'info',
  deprecated: 'error',
};

export function CatalogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const item = catalogItems.find(c => c.id === id) ?? catalogItems[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Breadcrumb */}
      <Link
        to="/catalog"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}
      >
        <ArrowLeft size={14} /> Back to Catalog
      </Link>

      {/* Header */}
      <div className="d-surface d-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{item.name}</h1>
            <span className="d-annotation" data-status={statusAnnotation[item.status]}>
              {item.status}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
            {item.description}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {item.tags.map(tag => (
              <span key={tag} className="d-annotation" style={{ fontSize: '0.6875rem' }}>
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            <Download size={14} /> {item.downloads} downloads
          </span>
          <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
            {item.category}
          </span>
        </div>
      </div>

      {/* Installation */}
      <div>
        <h2 className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          INSTALLATION
        </h2>
        <div className="wb-code-block">
          {`import { ${item.name} } from '@decantr/ui';`}
        </div>
      </div>

      {/* API reference */}
      <div>
        <h2 className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          API REFERENCE
        </h2>
        <div className="d-surface d-glass" style={{ overflowX: 'auto', padding: 0 }}>
          <table className="d-data" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th className="d-data-header">Prop</th>
                <th className="d-data-header">Type</th>
                <th className="d-data-header">Default</th>
                <th className="d-data-header">Description</th>
              </tr>
            </thead>
            <tbody>
              {buttonProperties.slice(0, 6).map(prop => (
                <tr key={prop.name} className="d-data-row">
                  <td className="d-data-cell mono-data" style={{ color: 'var(--d-primary)' }}>{prop.name}</td>
                  <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-secondary)' }}>{prop.type}</td>
                  <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem' }}>{prop.default}</td>
                  <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON spec */}
      <div>
        <h2 className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
          JSON SPEC
        </h2>
        <div className="wb-code-block" style={{ fontSize: '0.75rem' }}>
{JSON.stringify({
  name: item.name,
  id: item.id,
  category: item.category,
  status: item.status,
  tags: item.tags,
  downloads: item.downloads,
}, null, 2)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link
          to={`/workspace/${item.id}`}
          className="d-interactive"
          data-variant="primary"
          style={{ textDecoration: 'none', border: 'none' }}
        >
          Open in Workspace
        </Link>
        <Link
          to={`/inspector`}
          className="d-interactive"
          data-variant="ghost"
          style={{ textDecoration: 'none', border: 'none', gap: '0.375rem' }}
        >
          <ExternalLink size={14} /> Inspect Props
        </Link>
      </div>
    </div>
  );
}
