import { useState } from 'react';
import { css } from '@decantr/css';
import {
  Settings,
  Bell,
  Shield,
  Cpu,
  Globe,
  Save,
  RotateCcw,
} from 'lucide-react';
import { SectionLabel } from '../../components/SectionLabel';

/**
 * Agent config page — settings-nav + form-sections (structured).
 * Per layout_hints for form-sections:
 * - Labels ABOVE fields (stacked layout)
 * - Max-width 640px
 * - NO card per section — one continuous form
 */

const settingsNavItems = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'models', label: 'Models', icon: Cpu },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

export function AgentConfigPage() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className={css('_flex _gap6')}>
      {/* Settings nav */}
      <nav className={css('_flex _col _gap1')} style={{ minWidth: '12rem', flexShrink: 0 }}>
        <SectionLabel>Settings</SectionLabel>
        {settingsNavItems.map((item) => (
          <button
            key={item.id}
            className={
              css('_flex _aic _gap2 _px3 _py2 _textsm _rounded _pointer _trans _textl') +
              ' d-interactive neon-glow-hover' +
              (activeSection === item.id ? ' neon-border-glow' : '')
            }
            data-variant="ghost"
            onClick={() => setActiveSection(item.id)}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Form sections — stacked labels, max-width 640px, no card-per-section */}
      <div className={css('_flex1 _mw640')}>
        <form className={css('_flex _col _gap6')} onSubmit={(e) => e.preventDefault()}>
          {activeSection === 'general' && <GeneralSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'security' && <SecuritySection />}
          {activeSection === 'models' && <ModelsSection />}
          {activeSection === 'integrations' && <IntegrationsSection />}

          {/* Actions — bottom-aligned save/cancel */}
          <div className={css('_flex _gap3 _pt4')} style={{ borderTop: '1px solid var(--d-border)' }}>
            <button
              type="submit"
              className={css('_flex _aic _gap2') + ' d-interactive neon-glow-hover'}
              data-variant="primary"
            >
              <Save size={14} /> Save Changes
            </button>
            <button
              type="button"
              className={css('_flex _aic _gap2') + ' d-interactive'}
              data-variant="ghost"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Stacked label field helper */
function FormField({
  label,
  id,
  type = 'text',
  placeholder,
  defaultValue,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className={css('_flex _col _gap1')}>
      <label htmlFor={id} className={css('_textsm _fontsemi')}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="d-control carbon-input"
      />
    </div>
  );
}

function SelectField({
  label,
  id,
  options,
  defaultValue,
}: {
  label: string;
  id: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div className={css('_flex _col _gap1')}>
      <label htmlFor={id} className={css('_textsm _fontsemi')}>
        {label}
      </label>
      <select id={id} className="d-control carbon-input" defaultValue={defaultValue}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleField({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className={css('_flex _jcsb _aic _gap4')}>
      <div className={css('_flex _col _gap0')}>
        <span className={css('_textsm _fontsemi')}>{label}</span>
        <span className={css('_textxs _fgmuted')}>{description}</span>
      </div>
      <button
        type="button"
        className={css('_rel _pointer')}
        onClick={() => setChecked((c) => !c)}
        role="switch"
        aria-checked={checked}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? 'var(--d-accent)' : 'var(--d-border)',
          border: 'none',
          flexShrink: 0,
          transition: 'background 0.15s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'var(--d-text)',
            transition: 'left 0.15s ease',
          }}
        />
      </button>
    </div>
  );
}

function GeneralSection() {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _gap1 _mb2')}>
        <h2 className={css('_textlg _fontsemi')}>General Settings</h2>
        <p className={css('_textsm _fgmuted')}>Configure your workspace and default behaviors.</p>
      </div>
      <FormField label="Workspace Name" id="workspace-name" placeholder="My Workspace" defaultValue="Agent Ops" />
      <FormField label="Default Agent Prefix" id="agent-prefix" placeholder="agent-" defaultValue="agent-" />
      <SelectField label="Default Model" id="default-model" options={['GPT-4o', 'Claude 3.5', 'Gemini Pro', 'Mistral Large']} defaultValue="GPT-4o" />
      <SelectField label="Log Level" id="log-level" options={['Debug', 'Info', 'Warning', 'Error']} defaultValue="Info" />
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _gap1 _mb2')}>
        <h2 className={css('_textlg _fontsemi')}>Notifications</h2>
        <p className={css('_textsm _fgmuted')}>Control how and when you receive alerts.</p>
      </div>
      <ToggleField label="Agent Errors" description="Get notified when an agent enters error state." defaultChecked />
      <ToggleField label="Task Completion" description="Notify when batch tasks complete." defaultChecked />
      <ToggleField label="Daily Summary" description="Receive a daily digest of agent activity." />
      <FormField label="Notification Email" id="notif-email" type="email" placeholder="ops@example.com" />
    </div>
  );
}

function SecuritySection() {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _gap1 _mb2')}>
        <h2 className={css('_textlg _fontsemi')}>Security</h2>
        <p className={css('_textsm _fgmuted')}>Manage access controls and execution policies.</p>
      </div>
      <ToggleField label="Sandbox Execution" description="Run all agents in isolated sandbox environments." defaultChecked />
      <ToggleField label="MFA Required" description="Require MFA for all team members." />
      <SelectField label="API Key Rotation" id="key-rotation" options={['Never', '30 days', '60 days', '90 days']} defaultValue="90 days" />
      <FormField label="Allowed IP Ranges" id="ip-ranges" placeholder="0.0.0.0/0" />
    </div>
  );
}

function ModelsSection() {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _gap1 _mb2')}>
        <h2 className={css('_textlg _fontsemi')}>Model Configuration</h2>
        <p className={css('_textsm _fgmuted')}>Configure default parameters for AI models.</p>
      </div>
      <FormField label="Max Tokens" id="max-tokens" type="number" placeholder="4096" defaultValue="4096" />
      <FormField label="Temperature" id="temperature" type="number" placeholder="0.7" defaultValue="0.7" />
      <SelectField label="Fallback Model" id="fallback-model" options={['GPT-4o', 'Claude 3.5', 'Mistral Large']} defaultValue="Claude 3.5" />
      <ToggleField label="Auto-retry on Failure" description="Automatically retry failed inference requests." defaultChecked />
    </div>
  );
}

function IntegrationsSection() {
  return (
    <div className={css('_flex _col _gap4')}>
      <div className={css('_flex _col _gap1 _mb2')}>
        <h2 className={css('_textlg _fontsemi')}>Integrations</h2>
        <p className={css('_textsm _fgmuted')}>Connect external services and APIs.</p>
      </div>
      <FormField label="Webhook URL" id="webhook-url" placeholder="https://api.example.com/webhook" />
      <FormField label="Slack Channel" id="slack-channel" placeholder="#agent-alerts" />
      <FormField label="GitHub Repo" id="github-repo" placeholder="org/repo" />
      <ToggleField label="Auto-deploy on Merge" description="Automatically update agents when code merges." />
    </div>
  );
}
