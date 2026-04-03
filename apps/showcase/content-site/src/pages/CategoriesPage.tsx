import { css } from '@decantr/css';
import { Layers, Code2, Type, Palette, Eye, Zap } from 'lucide-react';
import { categories } from '../data/mock';

const iconMap: Record<string, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
  Layers,
  Code2,
  Type,
  Palette,
  Eye,
  Zap,
};

export function CategoriesPage() {
  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Categories</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
          Browse articles by topic.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Layers;
          return (
            <a
              key={cat.id}
              href={`#/articles`}
              className="editorial-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 'var(--d-radius)',
                cursor: 'pointer',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 'var(--d-radius-sm)', background: 'var(--d-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={20} style={{ color: 'var(--d-accent)' }} />
              </div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.375rem', fontFamily: 'system-ui, sans-serif' }}>{cat.name}</h2>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem', fontFamily: 'system-ui, sans-serif' }}>
                {cat.description}
              </p>
              <span className="editorial-caption" style={{ color: 'var(--d-accent)' }}>
                {cat.articleCount} articles
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
