import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, FileText, Settings as SettingsIcon } from 'lucide-react';
import { currentTelehealthSession, sessionNotes } from '@/data/mock';

export function TelehealthSessionPage() {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [elapsed, setElapsed] = useState(754); // 12:34

  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function formatTime(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function handleEnd() {
    navigate('/appointments');
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 340px',
      gap: '1rem',
      padding: '1rem',
      height: '100%',
      background: 'var(--d-bg)',
    }}>
      {/* Video area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
        {/* Main speaker */}
        <div className="hw-video-tile" data-speaker="true" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 700, color: '#fff',
          }} aria-hidden>
            {currentTelehealthSession.providerAvatar}
          </div>
          {/* Top bar */}
          <div style={{
            position: 'absolute', top: 16, left: 16, right: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.875rem',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--d-radius)',
              color: '#fff', fontSize: '0.875rem',
            }}>
              <span className="hw-pulse-dot" aria-hidden /> LIVE
              <span style={{ opacity: 0.75 }}>·</span>
              <span style={{ fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>{formatTime(elapsed)}</span>
            </div>
            <div style={{
              padding: '0.5rem 0.875rem',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--d-radius)',
              color: '#fff', fontSize: '0.875rem', fontWeight: 600,
            }}>
              HIPAA secure · Encrypted
            </div>
          </div>
          {/* Caption */}
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
            padding: '0.75rem 1.25rem', borderRadius: 'var(--d-radius)',
            color: '#fff', fontSize: '1rem', maxWidth: '80%', textAlign: 'center',
          }}>
            How have you been feeling since our last visit?
          </div>
          {/* Self preview */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            width: 180, height: 120,
            background: '#1E293B',
            borderRadius: 'var(--d-radius)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.125rem', fontWeight: 700,
          }} aria-label="Your video preview">
            {videoOff ? <VideoOff size={28} /> : 'AR'}
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '0.75rem',
          padding: '1rem',
          background: 'var(--d-surface)',
          borderRadius: 'var(--d-radius-lg)',
          border: '1px solid var(--d-border)',
        }}>
          <button
            onClick={() => setMuted(!muted)}
            aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
            aria-pressed={muted}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: muted ? 'var(--d-error)' : 'var(--d-surface-raised)',
              color: muted ? '#fff' : 'var(--d-text)',
              border: '1px solid var(--d-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {muted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          <button
            onClick={() => setVideoOff(!videoOff)}
            aria-label={videoOff ? 'Turn camera on' : 'Turn camera off'}
            aria-pressed={videoOff}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: videoOff ? 'var(--d-error)' : 'var(--d-surface-raised)',
              color: videoOff ? '#fff' : 'var(--d-text)',
              border: '1px solid var(--d-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {videoOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
          <button
            aria-label="Chat"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--d-surface-raised)',
              color: 'var(--d-text)',
              border: '1px solid var(--d-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MessageSquare size={22} />
          </button>
          <button
            aria-label="Settings"
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--d-surface-raised)',
              color: 'var(--d-text)',
              border: '1px solid var(--d-border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <SettingsIcon size={22} />
          </button>
          <button
            onClick={handleEnd}
            aria-label="End visit"
            style={{
              padding: '0 1.5rem', height: 56, borderRadius: 28,
              background: 'var(--d-error)', color: '#fff',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.9375rem', fontWeight: 600,
            }}
          >
            <PhoneOff size={20} /> End Visit
          </button>
        </div>
      </div>

      {/* Provider notes sidebar */}
      <aside style={{
        background: 'var(--d-surface)',
        border: '1px solid var(--d-border)',
        borderRadius: 'var(--d-radius-lg)',
        padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        minWidth: 0, overflow: 'hidden',
      }} aria-label="Visit notes">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <FileText size={18} style={{ color: 'var(--d-primary)' }} aria-hidden />
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Visit Notes</h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            With {currentTelehealthSession.providerName}, {currentTelehealthSession.specialty}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sessionNotes.map((note, i) => (
            <div key={i} style={{
              padding: '0.75rem', background: 'var(--d-surface-raised)',
              borderRadius: 'var(--d-radius)',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--d-font-mono, ui-monospace, monospace)' }}>
                {note.time}
              </div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>{note.text}</div>
            </div>
          ))}
        </div>

        <textarea
          className="d-control"
          placeholder="Add a note…"
          style={{ resize: 'none', minHeight: 80, fontSize: '0.875rem', fontFamily: 'inherit' }}
          aria-label="Add a note"
        />
      </aside>
    </div>
  );
}
