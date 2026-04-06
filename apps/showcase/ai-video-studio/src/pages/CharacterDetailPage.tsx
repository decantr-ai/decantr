import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, Film } from 'lucide-react';
import { characters, characterAppearances } from '@/data/mock';

export function CharacterDetailPage() {
  const { id } = useParams();
  const character = characters.find(c => c.id === id) || characters[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-content-gap)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <NavLink to="/characters" className="d-interactive" data-variant="ghost" style={{ padding: '4px', border: 'none' }}><ArrowLeft size={16} /></NavLink>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{character.name}</h1>
        <span className="d-annotation" data-status={character.consistency >= 90 ? 'success' : 'warning'}>{character.consistency}% consistent</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--d-gap-6)' }}>
        {/* Character sheet */}
        <div className="d-surface" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            width: '100%', aspectRatio: '3/4', borderRadius: 'var(--d-radius)',
            background: 'color-mix(in srgb, var(--d-primary) 10%, var(--d-surface-raised))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '3rem', color: 'var(--d-primary)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{character.avatar}</div>
          <div>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>DESCRIPTION</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)', lineHeight: 1.6 }}>{character.description}</p>
          </div>
          <div>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>TAGS</div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {character.tags.map(t => <span key={t} className="d-annotation">{t}</span>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div className="d-surface" data-elevation="raised" style={{ textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-primary)' }}>{character.appearances}</div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>Appearances</div>
            </div>
            <div className="d-surface" data-elevation="raised" style={{ textAlign: 'center', padding: '0.75rem' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, color: 'var(--d-success)' }}>{character.consistency}%</div>
              <div style={{ color: 'var(--d-text-muted)', fontSize: '0.7rem' }}>Consistency</div>
            </div>
          </div>
        </div>

        {/* Appearances */}
        <div>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>APPEARANCES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {characterAppearances.map(a => (
              <div key={a.sceneId} className="d-surface" data-interactive style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <div className="cinema-frame" data-ratio="16:9" style={{ width: 120, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--d-radius-sm)' }}>
                  <Film size={20} style={{ color: 'var(--d-text-muted)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.sceneName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{a.project}</div>
                </div>
                <span className="cinema-timecode">{a.timecode}</span>
                <span className="d-annotation" data-status={a.consistencyScore >= 93 ? 'success' : 'warning'}>{a.consistencyScore}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
