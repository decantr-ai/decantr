import { PageHeader } from '@/components/PageHeader';
import { models } from '@/data/mock';
import { Save } from 'lucide-react';

export function AgentConfigPage() {
  return (
    <div>
      <PageHeader
        title="Agent Configuration"
        description="Runtime and model parameters for the selected agent"
        actions={
          <button className="d-interactive" data-variant="primary" style={{ background: 'var(--d-accent)', borderColor: 'var(--d-accent)', color: '#0a0a0a', fontSize: '0.8rem' }}>
            <Save size={14} /> Save
          </button>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', maxWidth: 960 }}>
        <ConfigSection title="Model">
          <Field label="Provider">
            <select className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }}>
              <option>Anthropic</option>
              <option>OpenAI</option>
              <option>Google</option>
            </select>
          </Field>
          <Field label="Model">
            <select className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }}>
              {models.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Temperature">
            <input type="number" defaultValue="0.7" step="0.1" min="0" max="2" className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }} />
          </Field>
          <Field label="Max tokens">
            <input type="number" defaultValue="4096" className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }} />
          </Field>
        </ConfigSection>
        <ConfigSection title="Runtime">
          <Field label="Timeout (ms)">
            <input type="number" defaultValue="30000" className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }} />
          </Field>
          <Field label="Max tool calls">
            <input type="number" defaultValue="10" className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }} />
          </Field>
          <Field label="Retry strategy">
            <select className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }}>
              <option>exponential-backoff</option>
              <option>linear</option>
              <option>none</option>
            </select>
          </Field>
          <Field label="Concurrency">
            <input type="number" defaultValue="5" className="d-control" style={{ fontFamily: 'var(--d-font-mono)', fontSize: '0.82rem' }} />
          </Field>
        </ConfigSection>
        <ConfigSection title="Safety">
          <Toggle label="Content filter" defaultChecked />
          <Toggle label="PII redaction" defaultChecked />
          <Toggle label="Rate limiting" defaultChecked />
          <Toggle label="Audit logs" defaultChecked />
        </ConfigSection>
        <ConfigSection title="Observability">
          <Toggle label="Trace all runs" defaultChecked />
          <Toggle label="Log inputs" defaultChecked />
          <Toggle label="Log outputs" defaultChecked />
          <Toggle label="Export to OTLP" />
        </ConfigSection>
      </div>
    </div>
  );
}

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="carbon-panel">
      <div className="carbon-panel-header">{title}</div>
      <div className="carbon-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label className="d-label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', padding: '0.375rem 0' }}>
      <input type="checkbox" defaultChecked={defaultChecked} style={{ accentColor: 'var(--d-accent)' }} />
      <span>{label}</span>
    </label>
  );
}
