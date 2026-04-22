import { useMemo, useState } from 'react';
import { Globe, RotateCcw, Save, Settings2, Shield } from 'lucide-react';
import { PageHeader, SectionHeader } from '../../components/PageHeader';
import { configurationTabs } from '../../data/mock';
import { css } from '@decantr/css';

export function AgentConfig() {
  const [activeTab, setActiveTab] = useState<(typeof configurationTabs)[number]['id']>('model');
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('4096');
  const [systemPrompt, setSystemPrompt] = useState('You are a precise autonomous operator. Prefer explicit telemetry, deterministic responses, and actionable recovery guidance.');
  const [retryCount, setRetryCount] = useState('3');
  const [timeout, setTimeoutValue] = useState('30000');
  const [rateLimit, setRateLimit] = useState('100');
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhooks/agent');
  const [approvalMode, setApprovalMode] = useState('operator-review');

  const cards = useMemo(() => ({
    model: [
      {
        id: 'model-primary',
        title: 'Model selection',
        copy: 'Choose the default runtime, generation style, and prompt baseline for new agents.',
        icon: Settings2,
      },
      {
        id: 'model-guard',
        title: 'Prompt framing',
        copy: 'Keep the system prompt stable and explicit so operator intent remains legible at runtime.',
        icon: Shield,
      },
    ],
    reliability: [
      {
        id: 'reliability-retries',
        title: 'Retry policy',
        copy: 'Shape recovery logic so failures surface early instead of hiding behind silent loops.',
        icon: RotateCcw,
      },
    ],
    integrations: [
      {
        id: 'integrations-webhook',
        title: 'Outbound integrations',
        copy: 'Manage webhook fanout and external observability handoffs from one dependable configuration surface.',
        icon: Globe,
      },
    ],
  }), []);

  return (
    <div className="page-stack">
      <PageHeader
        label="Configuration"
        title="Agent configuration"
        description="This page keeps the nav-header brief and lets grouped form sections do the heavy lifting. Tabs narrow the view without turning the page into a maze."
        actions={(
          <>
            <button type="button" className="d-interactive" data-variant="ghost">
              Reset draft
            </button>
            <button type="button" className="d-interactive" data-variant="primary">
              <Save size={14} />
              Save configuration
            </button>
          </>
        )}
      />

      <div className="config-nav carbon-fade-slide" role="tablist" aria-label="Configuration sections">
        {configurationTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="config-tab"
            data-active={activeTab === tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {cards[activeTab].map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.id} className="d-surface carbon-card config-card carbon-fade-slide">
            <div className="config-card__header">
              <span className="config-card__icon">
                <Icon size={16} />
              </span>
              <div className={css('_flex _col _gap1')}>
                <strong>{card.title}</strong>
                <p className="config-help">{card.copy}</p>
              </div>
            </div>

            {activeTab === 'model' ? (
              <>
                <SectionHeader label="Model settings" title="Primary inference controls" description="These controls map to the configured form-sections pattern for model behavior." />
                <div className="config-form-grid">
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Model</span>
                    <select className="d-control carbon-input" value={model} onChange={(event) => setModel(event.target.value)}>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="mistral-large">Mistral Large</option>
                    </select>
                  </label>
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Temperature</span>
                    <input className="d-control carbon-input mono-data" value={temperature} onChange={(event) => setTemperature(event.target.value)} />
                  </label>
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Max tokens</span>
                    <input className="d-control carbon-input mono-data" value={maxTokens} onChange={(event) => setMaxTokens(event.target.value)} />
                  </label>
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Approval mode</span>
                    <select className="d-control carbon-input" value={approvalMode} onChange={(event) => setApprovalMode(event.target.value)}>
                      <option value="operator-review">Operator review</option>
                      <option value="auto-safe">Auto safe paths only</option>
                      <option value="manual-escalation">Manual escalation required</option>
                    </select>
                  </label>
                </div>
                <label className="config-field">
                  <span className={css('_textsm _fontmedium')}>System prompt</span>
                  <textarea className="d-control carbon-input" value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={5} />
                </label>
              </>
            ) : null}

            {activeTab === 'reliability' ? (
              <>
                <SectionHeader label="Reliability" title="Failure and recovery posture" description="Retries, timeouts, and rate limits sit together so teams can reason about the whole reliability story." />
                <div className="config-form-grid">
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Retry count</span>
                    <input className="d-control carbon-input mono-data" value={retryCount} onChange={(event) => setRetryCount(event.target.value)} />
                  </label>
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Timeout (ms)</span>
                    <input className="d-control carbon-input mono-data" value={timeout} onChange={(event) => setTimeoutValue(event.target.value)} />
                  </label>
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Rate limit (req/min)</span>
                    <input className="d-control carbon-input mono-data" value={rateLimit} onChange={(event) => setRateLimit(event.target.value)} />
                  </label>
                </div>
              </>
            ) : null}

            {activeTab === 'integrations' ? (
              <>
                <SectionHeader label="Integrations" title="Outbound hooks and escalation targets" description="The operator only needs a few fields here, so the card stays dense and calm instead of over-designed." />
                <div className="config-form-grid">
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Webhook URL</span>
                    <input className="d-control carbon-input mono-data" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />
                  </label>
                  <label className="config-field">
                    <span className={css('_textsm _fontmedium')}>Escalation channel</span>
                    <select className="d-control carbon-input" value={approvalMode} onChange={(event) => setApprovalMode(event.target.value)}>
                      <option value="operator-review">Operator review</option>
                      <option value="pager-escalation">Pager escalation</option>
                      <option value="chat-channel">Chat channel</option>
                    </select>
                  </label>
                </div>
              </>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
