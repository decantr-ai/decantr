import { css } from '@decantr/css';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Layers, ArrowLeft, Save, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function WorkspaceSettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [name, setName] = useState('Product Workspace');
  const [description, setDescription] = useState('Collaborative spatial workspace for product design and architecture planning.');
  const [gridVisible, setGridVisible] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState('40');
  const [defaultZoom, setDefaultZoom] = useState('100');
  const [notifyJoin, setNotifyJoin] = useState(true);
  const [notifyEdits, setNotifyEdits] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  return (
    <div data-theme="carbon" style={{ minHeight: '100dvh', background: 'var(--d-bg)' }}>
      {/* Nav header */}
      <header
        className={css('_flex _aic _jcsb _shrink0')}
        style={{
          height: 52,
          padding: '0 1.5rem',
          borderBottom: '1px solid var(--d-border)',
          background: 'var(--d-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div className={css('_flex _aic _gap3')}>
          <Link to="/" className={css('_flex _aic _gap2')} style={{ textDecoration: 'none', color: 'var(--d-text)' }}>
            <Layers size={20} style={{ color: 'var(--d-accent)' }} />
            <span className={css('_fontsemi _textlg')}>SpatialOps</span>
          </Link>
          <div style={{ width: 1, height: 20, background: 'var(--d-border)' }} />
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Settings</span>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <button className="d-interactive" data-variant="ghost" onClick={() => navigate('/')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>
            <ArrowLeft size={14} /> Back to Workspace
          </button>
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Form content */}
      <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <h1 className={css('_fontsemi')} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Workspace Settings</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '2rem' }}>
          Configure your workspace preferences, canvas behavior, and collaboration settings.
        </p>

        <form
          role="form"
          className={css('_flex _col _gap6')}
          onSubmit={e => { e.preventDefault(); navigate('/'); }}
        >
          {/* General section */}
          <div className="d-surface carbon-card" style={{ padding: 'var(--d-surface-p)' }}>
            <h2 className={css('_fontsemi')} style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>General</h2>
            <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>Basic workspace information</p>

            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _col _gap1')}>
                <label className={css('_textsm _fontmedium')}>Workspace Name</label>
                <input className="d-control carbon-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className={css('_flex _col _gap1')}>
                <label className={css('_textsm _fontmedium')}>Description</label>
                <textarea
                  className="d-control carbon-input"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ minHeight: '6rem', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Canvas section */}
          <div className="d-surface carbon-card" style={{ padding: 'var(--d-surface-p)' }}>
            <h2 className={css('_fontsemi')} style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Canvas</h2>
            <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>Spatial canvas behavior and defaults</p>

            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <p className={css('_textsm _fontmedium')}>Show Grid</p>
                  <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>Display background grid on canvas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGridVisible(!gridVisible)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: gridVisible ? 'var(--d-primary)' : 'var(--d-border)',
                    position: 'relative', transition: 'background 250ms var(--d-easing)', flexShrink: 0,
                  }}
                  aria-label="Toggle grid visibility"
                >
                  <span style={{
                    position: 'absolute', top: 2, left: gridVisible ? 22 : 2, width: 20, height: 20,
                    borderRadius: '50%', background: '#fff', transition: 'left 250ms var(--d-easing)',
                  }} />
                </button>
              </div>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <p className={css('_textsm _fontmedium')}>Snap to Grid</p>
                  <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>Align objects to grid lines</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: snapToGrid ? 'var(--d-primary)' : 'var(--d-border)',
                    position: 'relative', transition: 'background 250ms var(--d-easing)', flexShrink: 0,
                  }}
                  aria-label="Toggle snap to grid"
                >
                  <span style={{
                    position: 'absolute', top: 2, left: snapToGrid ? 22 : 2, width: 20, height: 20,
                    borderRadius: '50%', background: '#fff', transition: 'left 250ms var(--d-easing)',
                  }} />
                </button>
              </div>
              <div className={css('_grid _gap4')} style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className={css('_flex _col _gap1')}>
                  <label className={css('_textsm _fontmedium')}>Grid Size (px)</label>
                  <input className="d-control carbon-input" type="number" value={gridSize} onChange={e => setGridSize(e.target.value)} />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label className={css('_textsm _fontmedium')}>Default Zoom (%)</label>
                  <input className="d-control carbon-input" type="number" value={defaultZoom} onChange={e => setDefaultZoom(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Collaboration section */}
          <div className="d-surface carbon-card" style={{ padding: 'var(--d-surface-p)' }}>
            <h2 className={css('_fontsemi')} style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Collaboration</h2>
            <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.25rem' }}>Real-time collaboration preferences</p>

            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <p className={css('_textsm _fontmedium')}>Show Collaborator Cursors</p>
                  <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>Display other users' cursors on canvas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCursorVisible(!cursorVisible)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: cursorVisible ? 'var(--d-primary)' : 'var(--d-border)',
                    position: 'relative', transition: 'background 250ms var(--d-easing)', flexShrink: 0,
                  }}
                  aria-label="Toggle cursor visibility"
                >
                  <span style={{
                    position: 'absolute', top: 2, left: cursorVisible ? 22 : 2, width: 20, height: 20,
                    borderRadius: '50%', background: '#fff', transition: 'left 250ms var(--d-easing)',
                  }} />
                </button>
              </div>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <p className={css('_textsm _fontmedium')}>Notify on Join</p>
                  <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>Alert when collaborators enter workspace</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyJoin(!notifyJoin)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: notifyJoin ? 'var(--d-primary)' : 'var(--d-border)',
                    position: 'relative', transition: 'background 250ms var(--d-easing)', flexShrink: 0,
                  }}
                  aria-label="Toggle join notifications"
                >
                  <span style={{
                    position: 'absolute', top: 2, left: notifyJoin ? 22 : 2, width: 20, height: 20,
                    borderRadius: '50%', background: '#fff', transition: 'left 250ms var(--d-easing)',
                  }} />
                </button>
              </div>
              <div className={css('_flex _aic _jcsb')}>
                <div>
                  <p className={css('_textsm _fontmedium')}>Notify on Edits</p>
                  <p className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>Alert when objects are modified by others</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyEdits(!notifyEdits)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: notifyEdits ? 'var(--d-primary)' : 'var(--d-border)',
                    position: 'relative', transition: 'background 250ms var(--d-easing)', flexShrink: 0,
                  }}
                  aria-label="Toggle edit notifications"
                >
                  <span style={{
                    position: 'absolute', top: 2, left: notifyEdits ? 22 : 2, width: 20, height: 20,
                    borderRadius: '50%', background: '#fff', transition: 'left 250ms var(--d-easing)',
                  }} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={css('_flex _aic _jce _gap3')}>
            <button className="d-interactive" data-variant="ghost" type="button" onClick={() => navigate('/')}>
              <X size={14} /> Cancel
            </button>
            <button className="d-interactive" data-variant="primary" type="submit">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
