import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ContentDetailHero } from '../../components/ContentDetailHero';
import { JsonViewer } from '../../components/JsonViewer';
import ModerationQueueItem from '../../components/ModerationQueueItem';
import { moderationQueue, sampleJson } from '../../data/mock';

export default function ModerationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [notes, setNotes] = useState('');

  // Find the item by id, fall back to first item
  const item = moderationQueue.find((m) => m.id === id) ?? moderationQueue[0];

  const handleApprove = useCallback(() => {
    // Mock approve action
  }, []);

  const handleReject = useCallback(() => {
    // Mock reject action
  }, []);

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="d-label" data-anchor="">
        Moderation Detail
      </div>

      <ContentDetailHero item={item.content} />

      <JsonViewer data={sampleJson} title="Content Schema" />

      {/* Admin notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Admin Notes</h3>
        <textarea
          className="d-control"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add review notes..."
          style={{ resize: 'vertical' }}
        />
      </div>

      <ModerationQueueItem
        item={item}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
