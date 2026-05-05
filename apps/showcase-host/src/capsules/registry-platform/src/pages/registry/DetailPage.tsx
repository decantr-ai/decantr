import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentDetailHero } from '../../components/ContentDetailHero';
import { JsonViewer } from '../../components/JsonViewer';
import { ContentCardGrid } from '../../components/ContentCardGrid';
import { contentItems, sampleJson, type ContentItem } from '../../data/mock';

export default function DetailPage() {
  const navigate = useNavigate();
  const { type, namespace, slug } = useParams<{ type: string; namespace: string; slug: string }>();

  const item = useMemo(() => {
    const match = contentItems.find(
      (i) => i.type === type && i.namespace === namespace && i.slug === slug
    );
    return match ?? contentItems[0];
  }, [type, namespace, slug]);

  const relatedItems = useMemo(() => {
    if (!item) return [];
    return contentItems
      .filter((i) => i.namespace === item.namespace && i.id !== item.id)
      .slice(0, 3);
  }, [item]);

  function handleItemClick(clicked: ContentItem) {
    navigate(`/browse/${clicked.type}/${clicked.namespace}/${clicked.slug}`);
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Detail hero */}
      <ContentDetailHero item={item} />

      {/* JSON viewer */}
      <JsonViewer data={sampleJson} title={`${item.slug}.json`} />

      {/* Related items */}
      {relatedItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-4)' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            More from {item.namespace}
          </h3>
          <ContentCardGrid items={relatedItems} onItemClick={handleItemClick} />
        </div>
      )}
    </div>
  );
}
