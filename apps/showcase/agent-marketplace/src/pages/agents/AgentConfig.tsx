import { useState } from 'react';
import { css } from '@decantr/css';
import { Bot, Shield, Bell, Workflow, Globe, ChevronDown } from 'lucide-react';

interface SettingsSection {
  id: string;
  label: string;
  icon: typeof Bot;
  description: string;
}

const sections: SettingsSection[] = [
  { id: 'general', label: 'General', icon: Bot, description: 'Agent name, model, and basic configuration' },
  { id: 'security', label: 'Security', icon: Shield, description: 'API keys, access controls, and permissions' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert thresholds and notification channels' },
  { id: 'orchestration', label: 'Orchestration', icon: Workflow, description: 'Swarm behavior, routing rules, and fallbacks' },
  { id: 'network', label: 'Network', icon: Globe, description: 'Endpoints, rate limits, and retry policies' },
];

function SelectInput({ label, options, defaultValue }: { label: string; options: string[]; defaultValue?: string }) {
  return (
    <div className={css('_flex _col _gap1')}>
      <label className={css('_textsm _fontmedium') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
        {label}
      </label>
      <div className={css('_rel')}>
        <select
          className="d-control"
          defaultValue={defaultValue}
          style={{ appearance: 'none', paddingRight: '2rem' }}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--d-text-muted)',
          }}
        />
      </div>
    </div>
  );
}

function TextInput({ label, placeholder, type = 'text', defaultValue }: { label: string; placeholder?: string; type?: string; defaultValue?: string }) {
  return (
    <div className={css('_flex _col _gap1')}>
      <label className={css('_textsm _fontmedium') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="d-control carbon-input"
      />
    </div>
  );
}

function ToggleInput({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className={css('_flex _aic _jcsb _gap4')}>
      <div className={css('_flex _col')}>
        <span className={css('_textsm _fontmedium')}>{label}</span>
        <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={css('_shrink0 _rounded')}
        style={{
          width: '40px',
          height: '22px',
          background: checked ? 'var(--d-accent)' : 'var(--d-surface-raised)',
          border: '1px solid var(--d-border)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? '20px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s ease',
            boxShadow: checked ? '0 0 6px var(--d-accent-glow)' : undefined,
          }}
        />
      </button>
    </div>
  );
}

function TextareaInput({ label, placeholder, rows = 3 }: { label: string; placeholder?: string; rows?: number }) {
  return (
    <div className={css('_flex _col _gap1')}>
      <label className={css('_textsm _fontmedium') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
        {label}
      </label>
      <textarea
        className="d-control carbon-input"
        placeholder={placeholder}
        rows={rows}
        style={{ minHeight: '6rem', resize: 'vertical' }}
      />
    </div>
  );
}

export function AgentConfig() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className={css('_flex _col _gap6')} style={{ maxWidth: '40rem' }}>
      {/* Settings nav */}
      <nav className={css('_flex _gap2 _wrap')}>
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={css('_flex _aic _gap2') + ' d-interactive'}
              data-variant={isActive ? 'primary' : 'ghost'}
              style={{ fontSize: '0.8125rem' }}
            >
              <Icon size={14} />
              {section.label}
            </button>
          );
        })}
      </nav>

      {/* Form content — single card */}
      <form
        className={css('_flex _col _gap6 _p5') + ' d-surface carbon-glass'}
        onSubmit={e => e.preventDefault()}
      >
        {activeSection === 'general' && (
          <>
            <div className={css('_flex _col _gap1')}>
              <h3 className={css('_textlg _fontsemi _flex _aic _gap2')}>
                <Bot size={18} style={{ color: 'var(--d-accent)' }} />
                General Settings
              </h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                Configure basic agent properties and model selection.
              </p>
            </div>
            <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
              <TextInput label="Agent Name" placeholder="e.g., Classifier-v3" defaultValue="Classifier-v3" />
              <SelectInput label="Model" options={['GPT-4o', 'GPT-4o-mini', 'Claude-3', 'Claude-3.5', 'Mistral-7B']} defaultValue="GPT-4o" />
              <TextInput label="Version" placeholder="1.0.0" defaultValue="3.2.1" />
              <SelectInput label="Priority" options={['Low', 'Medium', 'High', 'Critical']} defaultValue="High" />
            </div>
            <TextareaInput label="System Prompt" placeholder="Enter the agent's system prompt..." />
            <ToggleInput label="Auto-restart on failure" description="Automatically restart the agent if it crashes or becomes unresponsive" defaultChecked />
          </>
        )}

        {activeSection === 'security' && (
          <>
            <div className={css('_flex _col _gap1')}>
              <h3 className={css('_textlg _fontsemi _flex _aic _gap2')}>
                <Shield size={18} style={{ color: 'var(--d-accent)' }} />
                Security Settings
              </h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                API keys, access controls, and permissions for this agent.
              </p>
            </div>
            <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
              <TextInput label="API Key" type="password" placeholder="sk-..." defaultValue="sk-xxxxxxxxxxxx" />
              <SelectInput label="Access Level" options={['Read-only', 'Read-write', 'Admin']} defaultValue="Read-write" />
            </div>
            <ToggleInput label="Sandbox mode" description="Run agent in isolated sandbox environment" defaultChecked />
            <ToggleInput label="Audit logging" description="Log all agent actions for compliance review" defaultChecked />
          </>
        )}

        {activeSection === 'notifications' && (
          <>
            <div className={css('_flex _col _gap1')}>
              <h3 className={css('_textlg _fontsemi _flex _aic _gap2')}>
                <Bell size={18} style={{ color: 'var(--d-accent)' }} />
                Notification Settings
              </h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                Configure when and how you receive alerts about this agent.
              </p>
            </div>
            <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
              <TextInput label="Error Threshold" type="number" placeholder="5" defaultValue="5" />
              <TextInput label="Latency Threshold (ms)" type="number" placeholder="500" defaultValue="500" />
              <TextInput label="Webhook URL" placeholder="https://hooks.slack.com/..." />
              <SelectInput label="Alert Channel" options={['Email', 'Slack', 'Webhook', 'PagerDuty']} defaultValue="Slack" />
            </div>
            <ToggleInput label="Enable error alerts" description="Get notified when this agent encounters errors" defaultChecked />
            <ToggleInput label="Performance alerts" description="Alert on latency spikes or throughput drops" />
          </>
        )}

        {activeSection === 'orchestration' && (
          <>
            <div className={css('_flex _col _gap1')}>
              <h3 className={css('_textlg _fontsemi _flex _aic _gap2')}>
                <Workflow size={18} style={{ color: 'var(--d-accent)' }} />
                Orchestration Settings
              </h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                Configure swarm behavior, task routing, and fallback strategies.
              </p>
            </div>
            <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
              <SelectInput label="Routing Strategy" options={['Round-robin', 'Weighted', 'Priority', 'Least-latency']} defaultValue="Priority" />
              <TextInput label="Max Concurrent Tasks" type="number" placeholder="10" defaultValue="10" />
              <SelectInput label="Fallback Agent" options={['None', 'Classifier-v3', 'Summarizer-v2', 'Guardian-v1']} defaultValue="Guardian-v1" />
              <TextInput label="Task Timeout (s)" type="number" placeholder="30" defaultValue="30" />
            </div>
            <ToggleInput label="Auto-scale" description="Automatically scale agent instances based on load" />
            <ToggleInput label="Circuit breaker" description="Stop routing tasks after consecutive failures" defaultChecked />
          </>
        )}

        {activeSection === 'network' && (
          <>
            <div className={css('_flex _col _gap1')}>
              <h3 className={css('_textlg _fontsemi _flex _aic _gap2')}>
                <Globe size={18} style={{ color: 'var(--d-accent)' }} />
                Network Settings
              </h3>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                Configure endpoints, rate limits, and retry policies.
              </p>
            </div>
            <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
              <TextInput label="Base URL" placeholder="https://api.example.com" defaultValue="https://api.openai.com/v1" />
              <TextInput label="Rate Limit (req/min)" type="number" placeholder="60" defaultValue="120" />
              <TextInput label="Max Retries" type="number" placeholder="3" defaultValue="3" />
              <SelectInput label="Retry Backoff" options={['Linear', 'Exponential', 'Fixed']} defaultValue="Exponential" />
            </div>
            <ToggleInput label="Keep-alive connections" description="Reuse TCP connections for lower latency" defaultChecked />
          </>
        )}

        {/* Action buttons */}
        <div className={css('_flex _jcfe _gap3 _pt4')} style={{ borderTop: '1px solid var(--d-border)' }}>
          <button type="button" className="d-interactive" data-variant="ghost">Cancel</button>
          <button type="submit" className="d-interactive neon-glow-hover" data-variant="primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
