import { useState } from 'react';
import { Monitor, Tablet, Smartphone, RotateCcw } from 'lucide-react';

const viewports = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' },
] as const;

const previewComponents = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'cards', label: 'Cards' },
  { id: 'annotations', label: 'Annotations' },
] as const;

export function PreviewPage() {
  const [viewport, setViewport] = useState<string>('desktop');
  const [activeComponent, setActiveComponent] = useState('buttons');

  const currentViewport = viewports.find(v => v.id === viewport) ?? viewports[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: '-1.5rem' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--d-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {previewComponents.map(comp => (
            <button
              key={comp.id}
              onClick={() => setActiveComponent(comp.id)}
              className="wb-tab"
              data-active={activeComponent === comp.id ? 'true' : undefined}
            >
              {comp.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {viewports.map(vp => {
            const Icon = vp.icon;
            return (
              <button
                key={vp.id}
                onClick={() => setViewport(vp.id)}
                className="d-interactive"
                data-variant="ghost"
                style={{
                  padding: '0.25rem 0.5rem',
                  border: 'none',
                  color: viewport === vp.id ? 'var(--d-primary)' : 'var(--d-text-muted)',
                }}
                title={vp.label}
              >
                <Icon size={14} />
              </button>
            );
          })}
          <div style={{ width: 1, height: 16, background: 'var(--d-border)', margin: '0 0.25rem' }} />
          <button
            className="d-interactive"
            data-variant="ghost"
            style={{ padding: '0.25rem 0.5rem', border: 'none' }}
            title="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Viewport label */}
      <div style={{ padding: '0.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
          {currentViewport.label} ({currentViewport.width})
        </span>
      </div>

      {/* Preview area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflowY: 'auto', padding: '1rem' }}>
        <div
          className="d-terminal-chrome"
          style={{
            width: currentViewport.width,
            maxWidth: '100%',
            transition: 'width 300ms ease',
            alignSelf: 'flex-start',
          }}
        >
          <div style={{ padding: '1.5rem' }}>
            {activeComponent === 'buttons' && <ButtonsPreview />}
            {activeComponent === 'inputs' && <InputsPreview />}
            {activeComponent === 'cards' && <CardsPreview />}
            {activeComponent === 'annotations' && <AnnotationsPreview />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonsPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <span className="d-label" style={{ display: 'block', marginBottom: '0.75rem' }}>VARIANTS</span>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="d-interactive" data-variant="primary" style={{ border: 'none' }}>Primary</button>
          <button className="d-interactive" data-variant="ghost" style={{ border: 'none' }}>Ghost</button>
          <button className="d-interactive" data-variant="danger" style={{ border: 'none' }}>Danger</button>
          <button className="d-interactive" style={{}}>Default</button>
        </div>
      </div>
      <div>
        <span className="d-label" style={{ display: 'block', marginBottom: '0.75rem' }}>STATES</span>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="d-interactive" data-variant="primary" style={{ border: 'none' }}>Normal</button>
          <button className="d-interactive" data-variant="primary" disabled style={{ border: 'none' }}>Disabled</button>
        </div>
      </div>
    </div>
  );
}

function InputsPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 360 }}>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Default</label>
        <input className="d-control" placeholder="Type something..." />
      </div>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>With value</label>
        <input className="d-control" defaultValue="Hello, World" />
      </div>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Disabled</label>
        <input className="d-control" disabled placeholder="Disabled input" />
      </div>
      <div>
        <label style={{ fontSize: '0.8125rem', fontWeight: 500, display: 'block', marginBottom: '0.375rem' }}>Error</label>
        <input className="d-control" aria-invalid defaultValue="Invalid value" />
      </div>
    </div>
  );
}

function CardsPreview() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
      <div className="d-surface">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Default Card</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Standard surface treatment.</p>
      </div>
      <div className="d-surface" data-elevation="raised">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Raised Card</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Elevated surface treatment.</p>
      </div>
      <div className="d-surface d-glass">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>Glass Card</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>Frosted glass treatment.</p>
      </div>
    </div>
  );
}

function AnnotationsPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <span className="d-label" style={{ display: 'block', marginBottom: '0.75rem' }}>STATUS ANNOTATIONS</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="d-annotation" data-status="success">stable</span>
          <span className="d-annotation" data-status="warning">beta</span>
          <span className="d-annotation" data-status="info">experimental</span>
          <span className="d-annotation" data-status="error">deprecated</span>
          <span className="d-annotation">neutral</span>
        </div>
      </div>
      <div>
        <span className="d-label" style={{ display: 'block', marginBottom: '0.75rem' }}>LABELS</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span className="d-label">COMPONENT</span>
          <span className="d-label">PATTERN</span>
          <span className="d-label">LAYOUT</span>
        </div>
      </div>
    </div>
  );
}
