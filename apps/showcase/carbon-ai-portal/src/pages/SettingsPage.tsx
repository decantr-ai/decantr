import { useState } from 'react';
import { css } from '@decantr/css';

interface SettingsState {
  displayName: string;
  email: string;
  defaultModel: string;
  maxTokens: string;
  temperature: string;
  darkMode: boolean;
  emailNotifications: boolean;
  queryAlerts: boolean;
  apiKey: string;
}

const INITIAL: SettingsState = {
  displayName: 'Sarah Chen',
  email: 'sarah.chen@company.com',
  defaultModel: 'gpt-4',
  maxTokens: '4096',
  temperature: '0.7',
  darkMode: true,
  emailNotifications: true,
  queryAlerts: false,
  apiKey: 'sk-carbon-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
};

export function SettingsPage() {
  const [form, setForm] = useState<SettingsState>(INITIAL);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={css('_flex _col _gap8 _p8')} style={{ maxWidth: 800 }}>
      {/* Header */}
      <div>
        <h1 className={css('_heading2 _mb1')}>Settings</h1>
        <p className={css('_textsm _fgmuted')}>
          Manage your account, AI preferences, and integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className={css('_flex _col _gap10')}>
        {/* ── Profile Section ── */}
        <section className={css('_flex _col _gap5')}>
          <div
            className={css('_pb3')}
            style={{ borderBottom: '1px solid var(--d-border)' }}
          >
            <h2 className={css('_fontsemi _textlg')}>Profile</h2>
            <p className={css('_textsm _fgmuted _mt1')}>Your personal information</p>
          </div>
          <Field label="Display Name" htmlFor="displayName">
            <input
              id="displayName"
              type="text"
              value={form.displayName}
              onChange={(e) => update('displayName', e.target.value)}
              className={css('_wfull _px4 _py3 _rounded _textbase')}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
              }}
            />
          </Field>
          <Field label="Email Address" htmlFor="email">
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={css('_wfull _px4 _py3 _rounded _textbase')}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
              }}
            />
          </Field>
        </section>

        {/* ── AI Configuration ── */}
        <section className={css('_flex _col _gap5')}>
          <div
            className={css('_pb3')}
            style={{ borderBottom: '1px solid var(--d-border)' }}
          >
            <h2 className={css('_fontsemi _textlg')}>AI Configuration</h2>
            <p className={css('_textsm _fgmuted _mt1')}>
              Control how the AI engine processes your queries
            </p>
          </div>
          <Field label="Default Model" htmlFor="defaultModel">
            <select
              id="defaultModel"
              value={form.defaultModel}
              onChange={(e) => update('defaultModel', e.target.value)}
              className={css('_wfull _px4 _py3 _rounded _textbase')}
              style={{
                background: 'var(--d-surface)',
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
              }}
            >
              <option value="gpt-4">GPT-4</option>
              <option value="claude">Claude 3.5 Sonnet</option>
              <option value="mixtral">Mixtral 8x22B</option>
              <option value="llama3">Llama 3 70B</option>
            </select>
          </Field>
          <div className={css('_grid _gap4 _gc1 _sm:gc2')}>
            <Field label="Max Tokens" htmlFor="maxTokens">
              <input
                id="maxTokens"
                type="number"
                value={form.maxTokens}
                onChange={(e) => update('maxTokens', e.target.value)}
                className={css('_wfull _px4 _py3 _rounded _textbase')}
                style={{
                  background: 'var(--d-surface)',
                  border: '1px solid var(--d-border)',
                  color: 'var(--d-text)',
                }}
              />
            </Field>
            <Field label="Temperature" htmlFor="temperature">
              <input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={form.temperature}
                onChange={(e) => update('temperature', e.target.value)}
                className={css('_wfull _px4 _py3 _rounded _textbase')}
                style={{
                  background: 'var(--d-surface)',
                  border: '1px solid var(--d-border)',
                  color: 'var(--d-text)',
                }}
              />
            </Field>
          </div>
        </section>

        {/* ── Preferences ── */}
        <section className={css('_flex _col _gap5')}>
          <div
            className={css('_pb3')}
            style={{ borderBottom: '1px solid var(--d-border)' }}
          >
            <h2 className={css('_fontsemi _textlg')}>Preferences</h2>
            <p className={css('_textsm _fgmuted _mt1')}>
              Notification and display preferences
            </p>
          </div>
          <Toggle
            label="Dark Mode"
            description="Use dark theme across the portal"
            checked={form.darkMode}
            onChange={(v) => update('darkMode', v)}
          />
          <Toggle
            label="Email Notifications"
            description="Receive email alerts for completed batch queries"
            checked={form.emailNotifications}
            onChange={(v) => update('emailNotifications', v)}
          />
          <Toggle
            label="Query Alerts"
            description="Get notified when queries exceed token limits"
            checked={form.queryAlerts}
            onChange={(v) => update('queryAlerts', v)}
          />
        </section>

        {/* ── API Key ── */}
        <section className={css('_flex _col _gap5')}>
          <div
            className={css('_pb3')}
            style={{ borderBottom: '1px solid var(--d-border)' }}
          >
            <h2 className={css('_fontsemi _textlg')}>API Access</h2>
            <p className={css('_textsm _fgmuted _mt1')}>
              Manage your API credentials
            </p>
          </div>
          <Field label="API Key" htmlFor="apiKey">
            <div className={css('_flex _gap2')}>
              <input
                id="apiKey"
                type="password"
                value={form.apiKey}
                readOnly
                className={css('_flex1 _px4 _py3 _rounded _textbase')}
                style={{
                  background: 'var(--d-surface)',
                  border: '1px solid var(--d-border)',
                  color: 'var(--d-text-muted)',
                  fontFamily: 'monospace',
                }}
              />
              <button
                type="button"
                className={css('_px4 _py3 _rounded _textsm _fontmedium')}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--d-border)',
                  color: 'var(--d-text-muted)',
                }}
              >
                Regenerate
              </button>
            </div>
          </Field>
        </section>

        {/* ── Danger Zone ── */}
        <section className={css('_flex _col _gap4 _p5 _rounded')} style={{ border: '1px solid var(--d-error)' }}>
          <div>
            <h2 className={css('_fontsemi _textlg _fgerror')}>Danger Zone</h2>
            <p className={css('_textsm _fgmuted _mt1')}>
              Irreversible actions on your account
            </p>
          </div>
          <div className={css('_flex _gap3')}>
            <button
              type="button"
              className={css('_px4 _py2 _rounded _textsm _fontmedium')}
              style={{
                background: 'transparent',
                border: '1px solid var(--d-error)',
                color: 'var(--d-error)',
              }}
            >
              Delete All Data
            </button>
            <button
              type="button"
              className={css('_px4 _py2 _rounded _textsm _fontmedium')}
              style={{
                background: 'var(--d-error)',
                border: 'none',
                color: '#fff',
              }}
            >
              Delete Account
            </button>
          </div>
        </section>

        {/* Save button */}
        <div className={css('_flex _aic _gap4 _pb8')}>
          <button
            type="submit"
            className={css('_px8 _py3 _rounded _fontmedium _textbase')}
            style={{
              background: 'var(--d-primary)',
              border: 'none',
              color: '#fff',
            }}
          >
            Save Changes
          </button>
          {saved && (
            <span className={css('_textsm _fgsuccess _fontmedium')}>
              Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

/* ── Reusable field wrapper ── */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={css('_flex _col _gap2')}>
      <label htmlFor={htmlFor} className={css('_textsm _fontmedium')}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className={css('_flex _jcsb _aic _gap4')}>
      <div>
        <p className={css('_fontmedium _textsm')}>{label}</p>
        <p className={css('_textxs _fgmuted')}>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={css('_shrink0 _rounded')}
        style={{
          width: 44,
          height: 24,
          border: 'none',
          background: checked ? 'var(--d-primary)' : 'var(--d-surface-raised)',
          position: 'relative',
          transition: 'background 0.2s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}
