import { css } from '@decantr/css';
import { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';

export function AgentConfig() {
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('4096');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful autonomous agent. Follow instructions precisely and report errors immediately.');
  const [retryCount, setRetryCount] = useState('3');
  const [timeout, setTimeout_] = useState('30000');
  const [rateLimit, setRateLimit] = useState('100');
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhooks/agent');
  const [loggingLevel, setLoggingLevel] = useState('info');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Dev mode: no-op
  }

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: '40rem' }}>
      <div>
        <h1 className={css('_fontsemi _textxl')} style={{ marginBottom: '0.25rem' }}>Agent Configuration</h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>Configure global parameters for your agent fleet.</p>
      </div>

      <form onSubmit={handleSubmit} className={css('_flex _col _gap6')} role="form">
        {/* Model Settings */}
        <div className="d-surface carbon-card">
          <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
            <Settings size={16} style={{ color: 'var(--d-primary)' }} />
            <h2 className={css('_fontsemi')}>Model Settings</h2>
          </div>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
            Configure the base model and inference parameters.
          </p>

          <div className={css('_grid _gap4')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Model</label>
              <select
                className="d-control carbon-input"
                value={model}
                onChange={e => setModel(e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="mistral-large">Mistral Large</option>
              </select>
            </div>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Temperature</label>
              <input className="d-control carbon-input mono-data" type="text" value={temperature} onChange={e => setTemperature(e.target.value)} />
            </div>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Max Tokens</label>
              <input className="d-control carbon-input mono-data" type="text" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} />
            </div>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Logging Level</label>
              <select
                className="d-control carbon-input"
                value={loggingLevel}
                onChange={e => setLoggingLevel(e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warn</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          <div className={css('_flex _col _gap1')} style={{ marginTop: '1rem' }}>
            <label className={css('_textsm _fontmedium')}>System Prompt</label>
            <textarea
              className="d-control carbon-input"
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              style={{ minHeight: '6rem', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Reliability Settings */}
        <div className="d-surface carbon-card">
          <div className={css('_flex _aic _gap2')} style={{ marginBottom: '1rem' }}>
            <RotateCcw size={16} style={{ color: 'var(--d-primary)' }} />
            <h2 className={css('_fontsemi')}>Reliability</h2>
          </div>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1rem' }}>
            Configure retry policies, timeouts, and rate limits.
          </p>

          <div className={css('_grid _gap4')} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Retry Count</label>
              <input className="d-control carbon-input mono-data" type="text" value={retryCount} onChange={e => setRetryCount(e.target.value)} />
            </div>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Timeout (ms)</label>
              <input className="d-control carbon-input mono-data" type="text" value={timeout} onChange={e => setTimeout_(e.target.value)} />
            </div>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Rate Limit (req/min)</label>
              <input className="d-control carbon-input mono-data" type="text" value={rateLimit} onChange={e => setRateLimit(e.target.value)} />
            </div>
            <div className={css('_flex _col _gap1')}>
              <label className={css('_textsm _fontmedium')}>Webhook URL</label>
              <input className="d-control carbon-input mono-data" type="url" placeholder="https://..." value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={css('_flex _jcfe _gap3')}>
          <button className="d-interactive" data-variant="ghost" type="reset">Cancel</button>
          <button className="d-interactive neon-glow-hover" data-variant="primary" type="submit">
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
