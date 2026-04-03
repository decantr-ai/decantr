import { useState } from 'react';
import { css } from '@decantr/css';
import { Settings, Sliders, Link2, Bell } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface FormSectionsProps {
  agentName?: string;
  model?: string;
}

export function FormSections({ agentName = 'sentinel-7x3k', model = 'gpt-4-turbo' }: FormSectionsProps) {
  const [form, setForm] = useState({
    name: agentName,
    description: 'Autonomous monitoring and anomaly detection agent for production workloads.',
    model: model,
    temperature: 0.7,
    maxTokens: 4096,
    timeout: 30,
    enableLogging: true,
    alertThreshold: 95,
    notificationEmail: 'ops@example.com',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: '40rem' }}>
      <div className={'d-surface carbon-card'}>
        {/* General */}
        <div className={css('_flex _col _gap4 _mb6')}>
          <div className={css('_flex _aic _gap2')}>
            <Settings size={18} style={{ color: 'var(--d-accent)' }} />
            <h3 className={css('_textlg _fontsemi')}>General</h3>
          </div>
          <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
            <Input
              label="Agent Name"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Model</label>
              <select
                className="d-control carbon-input"
                value={form.model}
                onChange={e => handleChange('model', e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="claude-3-opus">claude-3-opus</option>
                <option value="mixtral-8x7b">mixtral-8x7b</option>
                <option value="llama-3-70b">llama-3-70b</option>
              </select>
            </div>
          </div>
          <div className={css('_flex _col _gap1')}>
            <label className={css('_textsm _fontmedium')}>Description</label>
            <textarea
              className="d-control carbon-input"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
              style={{ minHeight: '6rem', resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="carbon-divider" style={{ marginBottom: '1.5rem' }} />

        {/* Parameters */}
        <div className={css('_flex _col _gap4 _mb6')}>
          <div className={css('_flex _aic _gap2')}>
            <Sliders size={18} style={{ color: 'var(--d-accent)' }} />
            <h3 className={css('_textlg _fontsemi')}>Parameters</h3>
          </div>
          <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>
                Temperature
                <span className="mono-data" style={{ color: 'var(--d-text-muted)', marginLeft: '0.5rem' }}>
                  {form.temperature}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={form.temperature}
                onChange={e => handleChange('temperature', parseFloat(e.target.value))}
                className="d-control"
                style={{ padding: 0 }}
              />
            </div>
            <Input
              label="Max Tokens"
              type="number"
              value={String(form.maxTokens)}
              onChange={e => handleChange('maxTokens', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Timeout (seconds)"
              type="number"
              value={String(form.timeout)}
              onChange={e => handleChange('timeout', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="carbon-divider" style={{ marginBottom: '1.5rem' }} />

        {/* Connections */}
        <div className={css('_flex _col _gap4 _mb6')}>
          <div className={css('_flex _aic _gap2')}>
            <Link2 size={18} style={{ color: 'var(--d-accent)' }} />
            <h3 className={css('_textlg _fontsemi')}>Connections</h3>
          </div>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
            Select agents this agent is allowed to communicate with.
          </p>
          <div className={css('_flex _wrap _gap2')}>
            {['parser-alpha', 'router-9f2b', 'classifier-v4', 'extractor-m8', 'optimizer-2k1'].map(name => (
              <label key={name} className={css('_flex _aic _gap2 _px3 _py1') + ' d-surface'} style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                <input type="checkbox" defaultChecked={name === 'parser-alpha' || name === 'classifier-v4'} />
                <span className="mono-data">{name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="carbon-divider" style={{ marginBottom: '1.5rem' }} />

        {/* Monitoring */}
        <div className={css('_flex _col _gap4 _mb6')}>
          <div className={css('_flex _aic _gap2')}>
            <Bell size={18} style={{ color: 'var(--d-accent)' }} />
            <h3 className={css('_textlg _fontsemi')}>Monitoring</h3>
          </div>
          <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
            <label className={css('_flex _aic _jcsb _px3 _py2') + ' d-surface'} style={{ cursor: 'pointer' }}>
              <span className={css('_textsm _fontmedium')}>Enable Logging</span>
              <input
                type="checkbox"
                checked={form.enableLogging}
                onChange={e => handleChange('enableLogging', e.target.checked)}
              />
            </label>
            <Input
              label="Alert Threshold (%)"
              type="number"
              value={String(form.alertThreshold)}
              onChange={e => handleChange('alertThreshold', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Notification Email"
              type="email"
              value={form.notificationEmail}
              onChange={e => handleChange('notificationEmail', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className={css('_flex _aic _gap2 _jcfe')} style={{ borderTop: '1px solid var(--d-border)', paddingTop: '1.5rem' }}>
          {saved && (
            <span className="d-annotation" data-status="success">Configuration saved</span>
          )}
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>
    </div>
  );
}
