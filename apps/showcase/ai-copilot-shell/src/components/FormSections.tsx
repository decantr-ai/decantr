import { useState } from 'react';

export interface FormField {
  label: string;
  type: 'text' | 'email' | 'select' | 'toggle' | 'textarea' | 'number' | 'range';
  value: string | number | boolean;
  options?: string[];
  description?: string;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormSectionsProps {
  sections: FormSection[];
  onSave?: () => void;
}

export function FormSections({ sections, onSave }: FormSectionsProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave?.();
  };

  return (
    <form
      onSubmit={handleSave}
      role="form"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '40rem' }}
    >
      <div className="d-surface carbon-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sections.map((section, si) => (
          <div key={si}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{section.title}</h3>
            {section.description && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1rem' }}>{section.description}</p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {section.fields.map((field, fi) => (
                <div key={fi} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{field.label}</label>
                  {field.description && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginBottom: '0.125rem' }}>{field.description}</p>
                  )}
                  {field.type === 'toggle' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        style={{
                          width: 36, height: 20, borderRadius: 'var(--d-radius-full)',
                          border: '1px solid var(--d-border)',
                          background: field.value ? 'var(--d-primary)' : 'var(--d-surface)',
                          position: 'relative', cursor: 'pointer', transition: 'background 150ms ease',
                        }}
                      >
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%',
                          background: '#fff', position: 'absolute', top: 2,
                          left: field.value ? 19 : 2, transition: 'left 150ms ease',
                        }} />
                      </button>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
                        {field.value ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      className="d-control carbon-input"
                      defaultValue={String(field.value)}
                      style={{ appearance: 'none', width: '100%' }}
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="d-control carbon-input"
                      defaultValue={String(field.value)}
                      rows={3}
                      style={{ width: '100%', resize: 'vertical', minHeight: '6rem' }}
                    />
                  ) : field.type === 'range' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        defaultValue={Number(field.value)}
                        style={{ flex: 1, accentColor: 'var(--d-primary)' }}
                      />
                      <span className="mono-data" style={{ fontSize: '0.8125rem', minWidth: '2rem', textAlign: 'right' }}>
                        {field.value}
                      </span>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      className="d-control carbon-input"
                      defaultValue={String(field.value)}
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
              ))}
            </div>
            {si < sections.length - 1 && <hr className="carbon-divider" style={{ marginTop: '1.5rem' }} />}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="submit"
          className="d-interactive"
          data-variant="primary"
          style={{ border: 'none' }}
        >
          {saved ? 'Saved' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="d-interactive"
          data-variant="ghost"
          style={{ border: 'none' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
