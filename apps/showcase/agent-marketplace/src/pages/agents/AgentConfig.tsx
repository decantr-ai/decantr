import { css } from '@decantr/css';
import {
  Settings, Cpu, Shield, Bell, Plug, Save, RotateCcw,
} from 'lucide-react';
import { useState } from 'react';

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'compute', label: 'Compute', icon: Cpu },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Plug },
];

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={'toggle-track' + (active ? ' active' : '')}
      onClick={onToggle}
      role="switch"
      aria-checked={active}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

export function AgentConfig() {
  const [activeSection, setActiveSection] = useState('general');
  const [autoScale, setAutoScale] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [mfa, setMfa] = useState(false);

  return (
    <div className={css('_flex _col _gap6') + ' fade-in'}>
      {/* Page header */}
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className={'font-mono ' + css('_text2xl _fontbold')}>Configuration</h1>
          <p className={'font-mono ' + css('_textsm _fgmuted _mt1')}>
            Swarm parameters and agent defaults
          </p>
        </div>
        <div className={css('_flex _gap2')}>
          <button className="btn btn-secondary btn-sm">
            <RotateCcw size={14} /> Reset
          </button>
          <button className="btn btn-primary btn-sm">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>

      <div className={css('_grid _gap6')} style={{ gridTemplateColumns: '200px 1fr' }}>
        {/* Settings nav */}
        <nav className={css('_flex _col _gap1')}>
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                className={'nav-item' + (activeSection === s.id ? ' active' : '')}
                onClick={() => setActiveSection(s.id)}
              >
                <Icon size={16} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings content */}
        <div className={css('_flex _col _gap6')}>
          {activeSection === 'general' && (
            <div className={css('_flex _col _gap4') + ' carbon-card ' + css('_p6')}>
              <h3 className={'font-mono ' + css('_textlg _fontsemi')}>General Settings</h3>
              <div className="separator" />

              <div className={css('_grid _gap4')} style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>Swarm Name</label>
                  <input
                    type="text"
                    className="carbon-input font-mono"
                    defaultValue="production-swarm-01"
                  />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>Environment</label>
                  <input
                    type="text"
                    className="carbon-input font-mono"
                    defaultValue="production"
                  />
                </div>
              </div>

              <div className={css('_flex _col _gap1')}>
                <label className={'font-mono ' + css('_textsm _fgmuted')}>Description</label>
                <textarea
                  className="carbon-input font-mono"
                  rows={3}
                  defaultValue="Primary production agent swarm for data processing and inference workloads."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className={css('_grid _gap4')} style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>Max Agents</label>
                  <input type="number" className="carbon-input font-mono" defaultValue="12" />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>Heartbeat Interval</label>
                  <input type="text" className="carbon-input font-mono" defaultValue="30s" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'compute' && (
            <div className={css('_flex _col _gap4') + ' carbon-card ' + css('_p6')}>
              <h3 className={'font-mono ' + css('_textlg _fontsemi')}>Compute Resources</h3>
              <div className="separator" />

              <div className={css('_flex _aic _jcsb _py3')}>
                <div>
                  <span className={'font-mono ' + css('_textsm')}>Auto-scaling</span>
                  <p className={'font-mono ' + css('_textxs _fgmuted _mt1')}>
                    Automatically scale agent count based on queue depth
                  </p>
                </div>
                <Toggle active={autoScale} onToggle={() => setAutoScale(!autoScale)} />
              </div>
              <div className="separator" />

              <div className={css('_grid _gap4')} style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>CPU Limit per Agent</label>
                  <input type="text" className="carbon-input font-mono" defaultValue="2 vCPU" />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>Memory Limit</label>
                  <input type="text" className="carbon-input font-mono" defaultValue="4096 MB" />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>GPU Allocation</label>
                  <input type="text" className="carbon-input font-mono" defaultValue="0.5 A100" />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label className={'font-mono ' + css('_textsm _fgmuted')}>Disk IOPS</label>
                  <input type="text" className="carbon-input font-mono" defaultValue="3000" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className={css('_flex _col _gap4') + ' carbon-card ' + css('_p6')}>
              <h3 className={'font-mono ' + css('_textlg _fontsemi')}>Security</h3>
              <div className="separator" />
              <div className={css('_flex _aic _jcsb _py3')}>
                <div>
                  <span className={'font-mono ' + css('_textsm')}>MFA Required</span>
                  <p className={'font-mono ' + css('_textxs _fgmuted _mt1')}>
                    Require multi-factor authentication for agent config changes
                  </p>
                </div>
                <Toggle active={mfa} onToggle={() => setMfa(!mfa)} />
              </div>
              <div className="separator" />
              <div className={css('_flex _col _gap1')}>
                <label className={'font-mono ' + css('_textsm _fgmuted')}>API Key</label>
                <input
                  type="password"
                  className="carbon-input font-mono"
                  defaultValue="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div className={css('_flex _col _gap1')}>
                <label className={'font-mono ' + css('_textsm _fgmuted')}>Allowed Origins</label>
                <input type="text" className="carbon-input font-mono" defaultValue="*.agentctrl.io" />
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className={css('_flex _col _gap4') + ' carbon-card ' + css('_p6')}>
              <h3 className={'font-mono ' + css('_textlg _fontsemi')}>Notifications</h3>
              <div className="separator" />
              <div className={css('_flex _aic _jcsb _py3')}>
                <div>
                  <span className={'font-mono ' + css('_textsm')}>Enable Alerts</span>
                  <p className={'font-mono ' + css('_textxs _fgmuted _mt1')}>
                    Send alerts when agents exceed error thresholds
                  </p>
                </div>
                <Toggle active={notifications} onToggle={() => setNotifications(!notifications)} />
              </div>
              <div className="separator" />
              <div className={css('_flex _col _gap1')}>
                <label className={'font-mono ' + css('_textsm _fgmuted')}>Webhook URL</label>
                <input type="url" className="carbon-input font-mono" placeholder="https://hooks.slack.com/..." />
              </div>
              <div className={css('_flex _col _gap1')}>
                <label className={'font-mono ' + css('_textsm _fgmuted')}>Alert Email</label>
                <input type="email" className="carbon-input font-mono" placeholder="ops@company.com" />
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className={css('_flex _col _gap4') + ' carbon-card ' + css('_p6')}>
              <h3 className={'font-mono ' + css('_textlg _fontsemi')}>Integrations</h3>
              <div className="separator" />
              {[
                { name: 'Datadog', status: 'Connected', badge: 'badge-success' },
                { name: 'PagerDuty', status: 'Connected', badge: 'badge-success' },
                { name: 'Slack', status: 'Not configured', badge: 'badge-muted' },
                { name: 'GitHub Actions', status: 'Not configured', badge: 'badge-muted' },
              ].map((integration) => (
                <div key={integration.name} className={css('_flex _aic _jcsb _py3')} style={{ borderBottom: '1px solid color-mix(in srgb, var(--d-border) 40%, transparent)' }}>
                  <div>
                    <span className={'font-mono ' + css('_textsm')}>{integration.name}</span>
                    <p className={'font-mono ' + css('_textxs _fgmuted _mt1')}>{integration.status}</p>
                  </div>
                  <button className="btn btn-secondary btn-sm font-mono">Configure</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
