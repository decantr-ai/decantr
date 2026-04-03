import { css } from '@decantr/css';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentDetailHero } from '@/components/ContentDetailHero';
import { JsonViewer } from '@/components/JsonViewer';
import { ModerationQueueItem } from '@/components/ModerationQueueItem';
import { MODERATION_ITEMS, SAMPLE_JSON } from '@/data/mock';

export function ModerationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const item = MODERATION_ITEMS.find((i) => i.id === id) ?? MODERATION_ITEMS[0];

  function handleApprove() {
    navigate('/admin/moderation');
  }

  function handleReject() {
    navigate('/admin/moderation');
  }

  return (
    <div className={css('_flex _col _gap5')}>
      {/* Back link */}
      <button
        className="d-interactive"
        data-variant="ghost"
        onClick={() => navigate('/admin/moderation')}
        style={{ alignSelf: 'flex-start', fontSize: '0.875rem' }}
      >
        <ArrowLeft size={16} />
        Back to queue
      </button>

      {/* Content hero */}
      <ContentDetailHero item={item.content} />

      {/* JSON preview */}
      <JsonViewer data={SAMPLE_JSON} title="Content Data Preview" />

      {/* Moderation actions */}
      <ModerationQueueItem
        item={item}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
