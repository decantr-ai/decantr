import { useState } from 'react';
import { buttonProperties } from '@/data/mock';
import type { PropertyDef } from '@/data/mock';

export function InspectorPage() {
  const [selectedProp, setSelectedProp] = useState<PropertyDef | null>(buttonProperties[0]);
  const [editValues, setEditValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    buttonProperties.forEach(p => { initial[p.name] = p.default; });
    return initial;
  });

  const updateValue = (name: string, value: string) => {
    setEditValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ display: 'flex', height: '100%', margin: '-1.5rem', overflow: 'hidden' }}>
      {/* Property form (left) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--d-border)' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            PROPERTY EDITOR
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Button</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
              Edit properties to see live changes in the preview.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {buttonProperties.map(prop => (
              <div
                key={prop.name}
                onClick={() => setSelectedProp(prop)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  padding: '0.625rem',
                  borderRadius: 'var(--d-radius-sm)',
                  border: selectedProp?.name === prop.name ? '1px solid var(--d-primary)' : '1px solid var(--d-border)',
                  background: selectedProp?.name === prop.name ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="mono-data" style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--d-primary)' }}>
                    {prop.name}
                  </label>
                  {prop.required && (
                    <span className="d-annotation" data-status="warning" style={{ fontSize: '0.5625rem' }}>req</span>
                  )}
                </div>
                {prop.type.includes('|') ? (
                  <select
                    className="d-control"
                    value={editValues[prop.name]}
                    onChange={e => updateValue(prop.name, e.target.value)}
                    style={{ fontSize: '0.8125rem', appearance: 'none' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {prop.type.split('|').map(opt => {
                      const v = opt.trim().replace(/"/g, '');
                      return <option key={v} value={v}>{v}</option>;
                    })}
                  </select>
                ) : prop.type === 'boolean' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        updateValue(prop.name, editValues[prop.name] === 'true' ? 'false' : 'true');
                      }}
                      style={{
                        width: 36, height: 20, borderRadius: 'var(--d-radius-full)',
                        border: '1px solid var(--d-border)',
                        background: editValues[prop.name] === 'true' ? 'var(--d-primary)' : 'var(--d-surface)',
                        position: 'relative', cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: 2,
                        left: editValues[prop.name] === 'true' ? 19 : 2,
                        transition: 'left 150ms ease',
                      }} />
                    </button>
                    <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                      {editValues[prop.name]}
                    </span>
                  </div>
                ) : (
                  <input
                    className="d-control"
                    value={editValues[prop.name]}
                    onChange={e => updateValue(prop.name, e.target.value)}
                    style={{ fontSize: '0.8125rem' }}
                    onClick={e => e.stopPropagation()}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property data (right) */}
      <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--d-border)' }}>
          <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            PROPERTY DATA
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {selectedProp ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="d-label" style={{ display: 'block', marginBottom: '0.375rem' }}>NAME</span>
                <span className="mono-data" style={{ fontSize: '0.875rem', color: 'var(--d-primary)' }}>{selectedProp.name}</span>
              </div>
              <div>
                <span className="d-label" style={{ display: 'block', marginBottom: '0.375rem' }}>TYPE</span>
                <span className="mono-data" style={{ fontSize: '0.8125rem', color: 'var(--d-secondary)' }}>{selectedProp.type}</span>
              </div>
              <div>
                <span className="d-label" style={{ display: 'block', marginBottom: '0.375rem' }}>DEFAULT</span>
                <span className="mono-data" style={{ fontSize: '0.8125rem' }}>{selectedProp.default}</span>
              </div>
              <div>
                <span className="d-label" style={{ display: 'block', marginBottom: '0.375rem' }}>REQUIRED</span>
                <span className="d-annotation" data-status={selectedProp.required ? 'warning' : 'success'} style={{ fontSize: '0.6875rem' }}>
                  {selectedProp.required ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="d-label" style={{ display: 'block', marginBottom: '0.375rem' }}>DESCRIPTION</span>
                <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5 }}>{selectedProp.description}</p>
              </div>
              <hr className="d-divider" />
              <div>
                <span className="d-label" style={{ display: 'block', marginBottom: '0.375rem' }}>CURRENT VALUE</span>
                <div className="wb-code-block" style={{ fontSize: '0.75rem' }}>
                  {`${selectedProp.name}: ${editValues[selectedProp.name]}`}
                </div>
              </div>
              <div>
                <span className="d-label" style={{ display: 'block', marginBottom: '0.375rem' }}>JSON</span>
                <div className="wb-code-block" style={{ fontSize: '0.6875rem' }}>
{JSON.stringify({
  name: selectedProp.name,
  type: selectedProp.type,
  default: selectedProp.default,
  required: selectedProp.required,
}, null, 2)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--d-text-muted)' }}>
              <p style={{ fontSize: '0.875rem' }}>Select a property to inspect</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
