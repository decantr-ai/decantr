import { useState } from 'react';
import { css } from '@decantr/css';

/* ── Component ── */

export function AgentConfig() {
  const [name, setName] = useState('sentinel-alpha');
  const [description, setDescription] = useState('Primary data ingestion and pipeline orchestration agent.');
  const [model, setModel] = useState('gpt-4-turbo');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('4096');
  const [systemPrompt, setSystemPrompt] = useState('You are an autonomous data processing agent. Follow safety constraints and report anomalies.');
  const [enableLogging, setEnableLogging] = useState(true);
  const [alertOnErrors, setAlertOnErrors] = useState(true);
  const [autoRestart, setAutoRestart] = useState(false);

  function handleReset() {
    setName('sentinel-alpha');
    setDescription('Primary data ingestion and pipeline orchestration agent.');
    setModel('gpt-4-turbo');
    setTemperature('0.7');
    setMaxTokens('4096');
    setSystemPrompt('You are an autonomous data processing agent. Follow safety constraints and report anomalies.');
    setEnableLogging(true);
    setAlertOnErrors(true);
    setAutoRestart(false);
  }

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--d-text)', margin: 0 }}>
        Agent Configuration
      </h1>

      <form
        className="d-surface carbon-card"
        onSubmit={e => e.preventDefault()}
        style={{ padding: '1.5rem' }}
      >
        <div className={css('_flex _col _gap6')}>
          {/* ── Section 1: General ── */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend
              className="d-label"
              style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
            >
              GENERAL
            </legend>
            <div className={css('_flex _col _gap4')}>
              {/* Agent Name */}
              <div className={css('_flex _col _gap1')}>
                <label className="d-label" htmlFor="cfg-name">Agent Name</label>
                <input
                  id="cfg-name"
                  type="text"
                  className="d-control carbon-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Description */}
              <div className={css('_flex _col _gap1')}>
                <label className="d-label" htmlFor="cfg-desc">Description</label>
                <textarea
                  id="cfg-desc"
                  className="d-control carbon-input"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  style={{ width: '100%', minHeight: '6rem', resize: 'vertical' }}
                />
              </div>

              {/* Model Select */}
              <div className={css('_flex _col _gap1')}>
                <label className="d-label" htmlFor="cfg-model">Model</label>
                <select
                  id="cfg-model"
                  className="d-control carbon-input"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="mistral-large">Mistral Large</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--d-border)', margin: 0 }} />

          {/* ── Section 2: Behavior ── */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend
              className="d-label"
              style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
            >
              BEHAVIOR
            </legend>
            <div className={css('_flex _col _gap4')}>
              {/* Temperature */}
              <div className={css('_flex _col _gap1')}>
                <label className="d-label" htmlFor="cfg-temp">
                  Temperature
                  <span className="mono-data" style={{ marginLeft: '0.5rem', fontSize: 11, color: 'var(--d-text-muted)' }}>
                    {temperature}
                  </span>
                </label>
                <input
                  id="cfg-temp"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  className="d-control"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Max Tokens */}
              <div className={css('_flex _col _gap1')}>
                <label className="d-label" htmlFor="cfg-tokens">Max Tokens</label>
                <input
                  id="cfg-tokens"
                  type="number"
                  className="d-control carbon-input"
                  value={maxTokens}
                  onChange={e => setMaxTokens(e.target.value)}
                  min="1"
                  max="128000"
                  style={{ width: '100%' }}
                />
              </div>

              {/* System Prompt */}
              <div className={css('_flex _col _gap1')}>
                <label className="d-label" htmlFor="cfg-prompt">System Prompt</label>
                <textarea
                  id="cfg-prompt"
                  className="d-control carbon-input"
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={4}
                  style={{ width: '100%', minHeight: '6rem', resize: 'vertical' }}
                />
              </div>
            </div>
          </fieldset>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--d-border)', margin: 0 }} />

          {/* ── Section 3: Monitoring ── */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend
              className="d-label"
              style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}
            >
              MONITORING
            </legend>
            <div className={css('_flex _col _gap3')}>
              {/* Enable Logging */}
              <label className={css('_flex _aic _jcsb')} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: 'var(--d-text)' }}>Enable logging</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableLogging}
                  onClick={() => setEnableLogging(v => !v)}
                  className="d-control"
                  style={{
                    position: 'relative',
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: '1px solid var(--d-border)',
                    background: enableLogging ? 'var(--d-accent)' : 'var(--d-surface)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'background 150ms ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: enableLogging ? 20 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 150ms ease',
                    }}
                  />
                </button>
              </label>

              {/* Alert on Errors */}
              <label className={css('_flex _aic _jcsb')} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: 'var(--d-text)' }}>Alert on errors</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={alertOnErrors}
                  onClick={() => setAlertOnErrors(v => !v)}
                  className="d-control"
                  style={{
                    position: 'relative',
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: '1px solid var(--d-border)',
                    background: alertOnErrors ? 'var(--d-accent)' : 'var(--d-surface)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'background 150ms ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: alertOnErrors ? 20 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 150ms ease',
                    }}
                  />
                </button>
              </label>

              {/* Auto-restart */}
              <label className={css('_flex _aic _jcsb')} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: 13, color: 'var(--d-text)' }}>Auto-restart on failure</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoRestart}
                  onClick={() => setAutoRestart(v => !v)}
                  className="d-control"
                  style={{
                    position: 'relative',
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: '1px solid var(--d-border)',
                    background: autoRestart ? 'var(--d-accent)' : 'var(--d-surface)',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'background 150ms ease',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: autoRestart ? 20 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 150ms ease',
                    }}
                  />
                </button>
              </label>
            </div>
          </fieldset>

          {/* Divider */}
          <hr style={{ border: 'none', borderTop: '1px solid var(--d-border)', margin: 0 }} />

          {/* ── Actions ── */}
          <div className={css('_flex _aic _gap3')}>
            <button
              type="submit"
              className="d-interactive neon-glow"
              data-variant="primary"
            >
              Save Configuration
            </button>
            <button
              type="button"
              className="d-interactive"
              data-variant="ghost"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
