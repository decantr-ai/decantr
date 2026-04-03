import { css } from '@decantr/css';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import {
  MousePointer2, Hand, StickyNote, Square, Frame, Link2, Type, Image,
  Settings, ZoomIn, ZoomOut, Maximize, MoreHorizontal, Plus, Search,
  MessageCircle, Share2, Users, ChevronDown, Layers,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { COLLABORATORS, CANVAS_OBJECTS, WORKSPACE_TOOLS } from '../../data/mock';
import type { CanvasObject, Collaborator } from '../../data/mock';

const TOOL_ICONS: Record<string, React.ElementType> = {
  select: MousePointer2, hand: Hand, note: StickyNote, shape: Square,
  frame: Frame, connect: Link2, text: Type, image: Image,
};

function CanvasCard({ obj, style }: { obj: CanvasObject; style?: React.CSSProperties }) {
  const typeIcons: Record<string, React.ElementType> = {
    note: StickyNote, document: Type, shape: Square, frame: Frame, image: Image,
  };
  const Icon = typeIcons[obj.type] || Square;

  return (
    <div
      className="spatial-panel carbon-fade-slide"
      style={{
        position: 'absolute',
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        cursor: 'grab',
        overflow: 'hidden',
        animationDelay: `${Math.random() * 300}ms`,
        ...style,
      }}
    >
      <div className={css('_flex _aic _jcsb')}>
        <div className={css('_flex _aic _gap2')}>
          <Icon size={14} style={{ color: obj.color, opacity: 0.8 }} />
          <span className={css('_textsm _fontmedium')} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {obj.title}
          </span>
        </div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.4 }}
          aria-label="More options"
        >
          <MoreHorizontal size={12} style={{ color: 'var(--d-text-muted)' }} />
        </button>
      </div>
      {obj.content && (
        <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.5, flex: 1, overflow: 'hidden' }}>
          {obj.content}
        </p>
      )}
      {obj.author && (
        <div className={css('_flex _aic _gap1')} style={{ marginTop: 'auto' }}>
          <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)', opacity: 0.7 }}>{obj.author}</span>
        </div>
      )}
    </div>
  );
}

function CollaboratorCursor({ user }: { user: Collaborator }) {
  if (!user.cursor) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: user.cursor.x,
        top: user.cursor.y,
        pointerEvents: 'none',
        zIndex: 30,
        transition: 'left 1s ease, top 1s ease',
      }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.5))` }}>
        <path d="M0 0L16 12L8 12L4 20L0 0Z" fill={user.color} />
      </svg>
      <span
        className={css('_textxs _fontmedium')}
        style={{
          position: 'absolute',
          left: 16,
          top: 12,
          background: user.color,
          color: '#000',
          padding: '1px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          fontSize: '0.6875rem',
        }}
      >
        {user.name.split(' ')[0]}
      </span>
    </div>
  );
}

function PresenceRing({ collaborators }: { collaborators: Collaborator[] }) {
  const activeCount = collaborators.filter(c => c.status === 'active').length;

  return (
    <div
      className="spatial-panel"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        padding: '0.75rem',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: 'var(--d-radius-xl)',
      }}
      role="group"
      aria-label="Collaborators"
    >
      <div className={css('_flex')} style={{ flexDirection: 'row-reverse' }}>
        {collaborators.slice(0, 5).map((user, i) => (
          <div
            key={user.id}
            title={`${user.name} (${user.status})`}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: user.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#000',
              border: '2px solid var(--d-bg)',
              marginLeft: i > 0 ? -8 : 0,
              position: 'relative',
              zIndex: collaborators.length - i,
              cursor: 'pointer',
              transition: 'transform 200ms var(--d-easing)',
            }}
          >
            {user.initials}
            <span
              className="presence-dot"
              data-status={user.status}
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 8,
                height: 8,
                border: '1.5px solid var(--d-bg)',
                animation: user.status === 'active' ? 'presence-pulse 2s ease-in-out infinite' : undefined,
              }}
            />
          </div>
        ))}
      </div>
      {collaborators.length > 5 && (
        <span className={css('_textxs _fontmedium')} style={{ color: 'var(--d-text-muted)' }}>
          +{collaborators.length - 5}
        </span>
      )}
      <div style={{ width: 1, height: 20, background: 'var(--d-border)' }} />
      <div className={css('_flex _aic _gap1')}>
        <span className="presence-dot" data-status="active" style={{ width: 6, height: 6 }} />
        <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{activeCount} active</span>
      </div>
    </div>
  );
}

function Toolbar({ activeTool, onToolChange }: { activeTool: string; onToolChange: (id: string) => void }) {
  return (
    <div
      className="spatial-toolbar"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.375rem',
      }}
      role="toolbar"
      aria-label="Workspace tools"
    >
      {WORKSPACE_TOOLS.map(tool => {
        const Icon = TOOL_ICONS[tool.id] || Square;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            aria-pressed={isActive}
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--d-radius)',
              border: 'none',
              background: isActive ? 'var(--d-primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--d-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms var(--d-easing), color 150ms var(--d-easing)',
            }}
          >
            <Icon size={18} />
          </button>
        );
      })}
      <div style={{ width: 1, height: 24, background: 'var(--d-border)', margin: '0 0.25rem' }} />
      <button
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--d-radius)',
          border: 'none',
          background: 'transparent',
          color: 'var(--d-text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="More tools"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

function ZoomControls({ zoom, onZoomChange }: { zoom: number; onZoomChange: (z: number) => void }) {
  return (
    <div
      className="spatial-toolbar"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 16,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.125rem',
        padding: '0.25rem',
      }}
    >
      <button
        onClick={() => onZoomChange(Math.max(25, zoom - 25))}
        style={{
          width: 32, height: 32, borderRadius: 'var(--d-radius-sm)', border: 'none',
          background: 'transparent', color: 'var(--d-text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Zoom out"
      >
        <ZoomOut size={14} />
      </button>
      <span className={css('_textxs _fontmedium')} style={{ color: 'var(--d-text-muted)', minWidth: 36, textAlign: 'center', fontFamily: 'ui-monospace, monospace' }}>
        {zoom}%
      </span>
      <button
        onClick={() => onZoomChange(Math.min(200, zoom + 25))}
        style={{
          width: 32, height: 32, borderRadius: 'var(--d-radius-sm)', border: 'none',
          background: 'transparent', color: 'var(--d-text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Zoom in"
      >
        <ZoomIn size={14} />
      </button>
      <button
        onClick={() => onZoomChange(100)}
        style={{
          width: 32, height: 32, borderRadius: 'var(--d-radius-sm)', border: 'none',
          background: 'transparent', color: 'var(--d-text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Fit to screen"
      >
        <Maximize size={14} />
      </button>
    </div>
  );
}

export function WorkspacePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(100);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      {/* Depth layers */}
      <div className="spatial-depth-bg" style={{ opacity: 0.8 }} aria-hidden="true" />
      <div className="spatial-grid" aria-hidden="true" />

      {/* Top bar */}
      <div
        className="spatial-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 20,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
        }}
      >
        <div className={css('_flex _aic _gap3')}>
          <div className={css('_flex _aic _gap2')} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Layers size={18} style={{ color: 'var(--d-accent)' }} />
            <span className={css('_fontsemi _textsm')}>SpatialOps</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--d-border)' }} />
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Product Workspace</span>
          <ChevronDown size={14} style={{ color: 'var(--d-text-muted)' }} />
        </div>
        <div className={css('_flex _aic _gap2')}>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}>
            <Search size={14} /> <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)', opacity: 0.6, fontFamily: 'ui-monospace, monospace' }}>Ctrl+K</span>
          </button>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}>
            <MessageCircle size={14} />
          </button>
          <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }} onClick={() => navigate('/settings')}>
            <Settings size={14} />
          </button>
          <button className="d-interactive" data-variant="primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}>
            <Share2 size={14} /> Share
          </button>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Presence Ring */}
      <PresenceRing collaborators={COLLABORATORS} />

      {/* Canvas area */}
      <div
        role="region"
        aria-label="Spatial canvas"
        style={{
          position: 'absolute',
          inset: 0,
          top: 48,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: 'transform 300ms var(--d-easing)',
        }}
      >
        {/* Background layer objects — subtle, blurred slightly */}
        {CANVAS_OBJECTS.filter(o => o.layer === 'background').map(obj => (
          <CanvasCard key={obj.id} obj={obj} style={{ opacity: 0.5, filter: 'blur(1px)' }} />
        ))}

        {/* Midground layer — primary content */}
        {CANVAS_OBJECTS.filter(o => o.layer === 'midground').map(obj => (
          <CanvasCard key={obj.id} obj={obj} />
        ))}

        {/* Foreground layer — interactive controls, closest depth */}
        {CANVAS_OBJECTS.filter(o => o.layer === 'foreground').map(obj => (
          <CanvasCard key={obj.id} obj={obj} style={{ zIndex: 10, boxShadow: 'var(--d-shadow-lg), 0 0 30px rgba(0,0,0,0.3)' }} />
        ))}

        {/* Collaborator cursors */}
        {COLLABORATORS.filter(u => u.cursor).map(user => (
          <CollaboratorCursor key={user.id} user={user} />
        ))}
      </div>

      {/* Toolbar */}
      <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />

      {/* Zoom controls */}
      <ZoomControls zoom={zoom} onZoomChange={setZoom} />

      {/* Left mini-panel — layers */}
      <div
        className="spatial-panel"
        style={{
          position: 'fixed',
          left: 16,
          top: 72,
          width: 200,
          zIndex: 15,
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div className={css('_flex _aic _jcsb')}>
          <span className={css('_textxs _fontmedium')} style={{ color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Layers</span>
          <Plus size={12} style={{ color: 'var(--d-text-muted)', cursor: 'pointer' }} />
        </div>
        {['Foreground', 'Midground', 'Background'].map((layer, i) => {
          const count = CANVAS_OBJECTS.filter(o => o.layer === layer.toLowerCase()).length;
          return (
            <div
              key={layer}
              className={css('_flex _aic _jcsb')}
              style={{
                padding: '0.375rem 0.5rem',
                borderRadius: 'var(--d-radius-sm)',
                background: i === 1 ? 'var(--d-surface-raised)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 150ms',
                fontSize: '0.8125rem',
              }}
            >
              <span className={css('_flex _aic _gap2')}>
                <Layers size={12} style={{ color: 'var(--d-text-muted)' }} />
                <span>{layer}</span>
              </span>
              <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
