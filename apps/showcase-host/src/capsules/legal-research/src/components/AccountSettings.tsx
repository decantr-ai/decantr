import { css } from '@decantr/css';
import { useState } from 'react';
import { type SettingsField } from '../data/mock';

interface AccountSettingsProps {
  title: string;
  description?: string;
  fields: SettingsField[];
}

export function AccountSettings({ title, description, fields }: AccountSettingsProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const f of fields) map[f.id] = f.value;
    return map;
  });

  return (
    <div className="d-surface" style={{ maxWidth: 600 }}>
      <h2 className="counsel-header" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{title}</h2>
      {description && <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginBottom: '1.25rem', fontFamily: 'Georgia, serif' }}>{description}</p>}

      <div className={css('_flex _col _gap4')}>
        {fields.map((field) => (
          <div key={field.id} className={css('_flex _col _gap2')}>
            <label className={css('_textsm _fontmedium')} htmlFor={field.id}>{field.label}</label>
            {field.type === 'toggle' ? (
              <button
                className="d-interactive"
                data-variant={values[field.id] === 'true' ? 'primary' : undefined}
                onClick={() => setValues((v) => ({ ...v, [field.id]: v[field.id] === 'true' ? 'false' : 'true' }))}
                style={{ width: 'fit-content', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                type="button"
              >
                {values[field.id] === 'true' ? 'Enabled' : 'Disabled'}
              </button>
            ) : field.type === 'select' ? (
              <select
                id={field.id}
                className="d-control"
                value={values[field.id]}
                onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={field.id}
                type={field.type}
                className="d-control"
                value={values[field.id]}
                onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                placeholder={field.type === 'password' ? `Enter ${field.label.toLowerCase()}` : undefined}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 1rem', fontSize: '0.8125rem' }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
