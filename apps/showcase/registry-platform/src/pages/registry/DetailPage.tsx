import { useParams } from 'react-router-dom';
import { css } from '@decantr/css';
import { ContentDetailHero } from '@/components/ContentDetailHero';
import { JsonViewer } from '@/components/JsonViewer';
import { CONTENT_ITEMS, SAMPLE_JSON, TYPE_COLORS } from '@/data/mock';

export function DetailPage() {
  const { type, namespace, slug } = useParams<{
    type: string;
    namespace: string;
    slug: string;
  }>();

  const item = CONTENT_ITEMS.find(
    (i) =>
      i.type === type &&
      i.namespace === `@${namespace}` &&
      i.slug === slug,
  );

  if (!item) {
    return (
      <div
        className={css('_flex _col _aic _jcc')}
        style={{ minHeight: 400, padding: '4rem 1.5rem', textAlign: 'center' }}
      >
        <h2
          className={css('_fontsemi')}
          style={{ fontSize: '1.5rem', color: 'var(--d-text)', marginBottom: '0.5rem' }}
        >
          Content Not Found
        </h2>
        <p style={{ color: 'var(--d-text-muted)', maxWidth: 400 }}>
          The {type ?? 'item'} <strong>{namespace}/{slug}</strong> could not be found
          in the registry.
        </p>
      </div>
    );
  }

  const typeColor = TYPE_COLORS[item.type] ?? 'var(--d-primary)';

  return (
    <div>
      {/* Subtle type-colored gradient background */}
      <div
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${typeColor} 5%, transparent) 0%, transparent 100%)`,
          minHeight: '100%',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
          <ContentDetailHero item={item} />

          <div style={{ marginTop: '2.5rem' }}>
            <JsonViewer data={SAMPLE_JSON} title="Content Schema" />
          </div>
        </div>
      </div>
    </div>
  );
}
