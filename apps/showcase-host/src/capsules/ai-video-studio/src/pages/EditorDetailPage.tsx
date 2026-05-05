import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, Play, SkipBack, SkipForward, Download, Users, Film } from 'lucide-react';
import { projects, prompts, characters } from '@/data/mock';

export function EditorDetailPage() {
  const { id } = useParams();
  const project = projects.find(p => p.id === id) || projects[0];
  const scenePrompts = prompts.slice(0, project.scenes > 3 ? 3 : project.scenes);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <NavLink to="/editor" className="d-interactive" data-variant="ghost" style={{ padding: '4px', border: 'none' }}><ArrowLeft size={16} /></NavLink>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{project.title}</h1>
        <span className="cinema-slate">SCN {project.scenes}</span>
        <span className="d-annotation" data-status={project.status === 'completed' ? 'success' : project.status === 'rendering' ? 'warning' : undefined}>{project.status}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <NavLink to="/editor/export" className="d-interactive" data-variant="ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            <Download size={12} /> Export
          </NavLink>
          <button className="d-interactive" data-variant="primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            Render All
          </button>
        </div>
      </div>

      {/* Main area: preview + sidebar */}
      <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minHeight: 0 }}>
        {/* Preview + timeline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          {/* Video preview */}
          <div className="cinema-frame cinema-vignette cinema-grain" data-ratio="16:9" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--d-radius)' }}>
            <div style={{ fontSize: '3rem', opacity: 0.3, zIndex: 2 }}>{project.thumbnail}</div>
            {/* Playback controls */}
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="d-interactive" data-variant="ghost" style={{ padding: 4, border: 'none' }}><SkipBack size={16} /></button>
              <button className="d-interactive cinema-amber-glow" data-variant="primary" style={{ padding: '8px', borderRadius: 'var(--d-radius-full)' }}><Play size={18} /></button>
              <button className="d-interactive" data-variant="ghost" style={{ padding: 4, border: 'none' }}><SkipForward size={16} /></button>
            </div>
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 3 }}>
              <span className="cinema-timecode">00:01:24:18 / {project.duration}:00:00</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="d-surface" style={{ padding: '0.75rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>TIMELINE</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {[0, 1, 2, 3].map(i => <div key={i} className="keyframe-dot" />)}
                <span style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginLeft: '0.25rem' }}>4 keyframes</span>
              </div>
            </div>
            {/* Tracks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {['Video', 'Audio', 'Effects'].map((track, ti) => (
                <div key={track} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 50, fontSize: '0.65rem', color: 'var(--d-text-muted)', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>{track}</span>
                  <div className="timeline-track" style={{ flex: 1, position: 'relative' }}>
                    {ti === 0 && (
                      <>
                        <div className="timeline-clip" style={{ left: '2%', width: '22%' }}>Scene 1</div>
                        <div className="timeline-clip" style={{ left: '26%', width: '18%' }}>Scene 2</div>
                        <div className="timeline-clip" style={{ left: '46%', width: '28%' }}>Scene 3</div>
                        <div className="timeline-clip" style={{ left: '76%', width: '20%' }}>Scene 4</div>
                        <div className="timeline-playhead" style={{ left: '45%' }} />
                      </>
                    )}
                    {ti === 1 && (
                      <>
                        <div className="timeline-clip" style={{ left: '0%', width: '45%', background: 'color-mix(in srgb, var(--d-info) 20%, #1F1F1F)', borderColor: 'color-mix(in srgb, var(--d-info) 40%, transparent)' }}>BGM</div>
                        <div className="timeline-clip" style={{ left: '48%', width: '50%', background: 'color-mix(in srgb, var(--d-info) 20%, #1F1F1F)', borderColor: 'color-mix(in srgb, var(--d-info) 40%, transparent)' }}>SFX</div>
                      </>
                    )}
                    {ti === 2 && (
                      <div className="timeline-clip" style={{ left: '24%', width: '4%', background: 'color-mix(in srgb, var(--d-warning) 20%, #1F1F1F)', borderColor: 'color-mix(in srgb, var(--d-warning) 40%, transparent)' }}>Fade</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Timecode ruler */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', marginLeft: 58, fontSize: '0.6rem', color: 'var(--d-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              <span>00:00</span><span>00:30</span><span>01:00</span><span>01:30</span><span>02:00</span><span>{project.duration}</span>
            </div>
          </div>
        </div>

        {/* Right sidebar: scene list + characters */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
          <div className="d-surface" style={{ padding: '0.75rem' }}>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>SCENES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {scenePrompts.map((p, i) => (
                <div key={p.id} className="d-surface" data-elevation="raised" data-interactive style={{ padding: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="cinema-slate" style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}>SCN {String(i + 1).padStart(2, '0')}</span>
                    <span className="status-dot" data-status={p.status === 'active' ? 'completed' : 'draft'} />
                  </div>
                  <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-surface" style={{ padding: '0.75rem' }}>
            <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '0.75rem' }}>
              <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />CHARACTERS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {characters.slice(0, 3).map(c => (
                <NavLink key={c.id} to={`/characters/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', fontSize: '0.75rem', padding: '0.25rem 0' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 3, flexShrink: 0,
                    background: 'color-mix(in srgb, var(--d-primary) 15%, var(--d-surface-raised))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.55rem', fontWeight: 700, color: 'var(--d-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{c.avatar}</div>
                  <span>{c.name}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--d-success)', fontSize: '0.65rem' }}>{c.consistency}%</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
