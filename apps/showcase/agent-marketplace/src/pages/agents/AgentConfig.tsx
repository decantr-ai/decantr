import { css } from '@decantr/css';
import { Save, RotateCcw, Bot, Shield, Gauge, Bell, Webhook, Database } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';

interface SettingsSection {
  icon: React.ElementType;
  title: string;
  description: string;
  fields: Array<{ label: string; type: 'text' | 'select' | 'toggle' | 'number'; placeholder?: string; options?: string[]; value?: string | number | boolean }>;
}

const SECTIONS: SettingsSection[] = [
  {
    icon: Bot,
    title: 'Agent Identity',
    description: 'Core configuration for agent identification and model binding.',
    fields: [
      { label: 'Agent Name', type: 'text', placeholder: 'e.g. CodeGen Alpha', value: 'CodeGen Alpha' },
      { label: 'Model', type: 'select', options: ['gpt-4o', 'gpt-4o-mini', 'claude-3.5', 'mistral-large'] },
      { label: 'System Prompt', type: 'text', placeholder: 'Enter system instruction...', value: 'You are a code generation assistant.' },
    ],
  },
  {
    icon: Gauge,
    title: 'Performance',
    description: 'Throughput limits, concurrency, and resource allocation.',
    fields: [
      { label: 'Max Concurrent Tasks', type: 'number', value: 10 },
      { label: 'Timeout (ms)', type: 'number', value: 30000 },
      { label: 'Priority', type: 'select', options: ['low', 'normal', 'high', 'critical'] },
    ],
  },
  {
    icon: Shield,
    title: 'Safety & Guardrails',
    description: 'Content filtering, rate limits, and safety boundaries.',
    fields: [
      { label: 'Content Filter', type: 'toggle', value: true },
      { label: 'Max Tokens per Request', type: 'number', value: 4096 },
      { label: 'Rate Limit (req/min)', type: 'number', value: 60 },
    ],
  },
  {
    icon: Bell,
    title: 'Alerts & Notifications',
    description: 'Configure when and how you get notified of agent events.',
    fields: [
      { label: 'Error Alerts', type: 'toggle', value: true },
      { label: 'Latency Threshold (ms)', type: 'number', value: 500 },
      { label: 'Notification Channel', type: 'select', options: ['slack', 'email', 'webhook', 'none'] },
    ],
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    description: 'External integrations and event forwarding.',
    fields: [
      { label: 'Webhook URL', type: 'text', placeholder: 'https://...' },
      { label: 'Secret Token', type: 'text', placeholder: 'whsec_...' },
      { label: 'Events', type: 'select', options: ['all', 'errors', 'completions', 'custom'] },
    ],
  },
  {
    icon: Database,
    title: 'Data & Storage',
    description: 'Persistence, caching, and data retention policies.',
    fields: [
      { label: 'Enable Caching', type: 'toggle', value: true },
      { label: 'Retention (days)', type: 'number', value: 30 },
      { label: 'Storage Region', type: 'select', options: ['us-east-1', 'eu-west-1', 'ap-southeast-1'] },
    ],
  },
];

function renderField(field: SettingsSection['fields'][number]) {
  if (field.type === 'toggle') {
    return (
      <button
        type="button"
        className="d-interactive neon-glow-hover"
        data-variant={field.value ? 'primary' : 'ghost'}
        style={{
          width: 44,
          height: 24,
          padding: 0,
          borderRadius: 'var(--d-radius-full)',
          position: 'relative',
          background: field.value ? 'var(--d-accent)' : 'var(--d-surface-raised)',
          borderColor: field.value ? 'var(--d-accent)' : 'var(--d-border)',
          justifyContent: 'flex-start',
        }}
        role="switch"
        aria-checked={!!field.value}
        aria-label={field.label}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 'var(--d-radius-full)',
            background: 'var(--d-text)',
            display: 'block',
            transition: `transform var(--d-duration-hover) var(--d-easing)`,
            transform: field.value ? 'translateX(22px)' : 'translateX(2px)',
          }}
        />
      </button>
    );
  }

  if (field.type === 'select') {
    return (
      <select className="d-control mono-data neon-glow-hover" style={{ fontSize: '0.8125rem' }} aria-label={field.label}>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type}
      className="d-control mono-data neon-glow-hover"
      placeholder={field.placeholder}
      defaultValue={field.value != null ? String(field.value) : undefined}
      style={{ fontSize: '0.8125rem' }}
      aria-label={field.label}
    />
  );
}

export function AgentConfig() {
  return (
    <>
      <PageHeader
        title="Agent Configuration"
        subtitle="Configure agent parameters and guardrails"
        actions={
          <>
            <button className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid transparent' }}>
              <RotateCcw size={14} /> Reset
            </button>
            <button className="d-interactive neon-glow-hover" style={{ background: 'var(--d-accent)', color: 'var(--d-bg)', borderColor: 'var(--d-accent)' }}>
              <Save size={14} /> Save Changes
            </button>
          </>
        }
      />

      <form className={css('_flex _col _gap6')} onSubmit={(e) => e.preventDefault()}>
        {SECTIONS.map((section) => (
          <section key={section.title} className="d-surface carbon-glass neon-entrance">
            <div className={css('_flex _aic _gap3')} style={{ marginBottom: 'var(--d-gap-4)' }}>
              <section.icon size={18} style={{ color: 'var(--d-accent)' }} />
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{section.title}</h2>
                <p className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{section.description}</p>
              </div>
            </div>

            <div className={css('_flex _col _gap4')}>
              {section.fields.map((field) => (
                <div key={field.label} className={css('_flex _jcsb _aic _gap4 _wrap')} style={{ minHeight: 36 }}>
                  <label className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 160 }}>
                    {field.label}
                  </label>
                  <div style={{ flex: 1, maxWidth: 320 }}>
                    {renderField(field)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </form>
    </>
  );
}
