import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { VodAnnotator } from '@/components/VodAnnotator';
import { vods, vodAnnotations } from '@/data/mock';

export function VodDetailPage() {
  const { id } = useParams();
  const vod = vods.find(v => v.id === id) || vods[0];

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      <Link to="/vods" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--d-text-muted)', textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to VODs
      </Link>

      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>{vod.title}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
          <span>vs {vod.opponent}</span>
          <span>|</span>
          <span>{vod.mapName}</span>
          <span>|</span>
          <span>{vod.date}</span>
          <span>|</span>
          <span
            className="d-annotation"
            data-status={vod.result === 'win' ? 'success' : vod.result === 'loss' ? 'error' : 'warning'}
            style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}
          >
            {vod.result}
          </span>
        </div>
      </div>

      <VodAnnotator
        annotations={vodAnnotations}
        vodTitle={vod.title}
        vodDuration={vod.duration}
        vodThumbnail={vod.thumbnail}
      />
    </div>
  );
}
