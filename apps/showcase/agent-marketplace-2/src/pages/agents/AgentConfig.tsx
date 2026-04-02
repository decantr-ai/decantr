import { useState } from 'react';
import { css } from '@decantr/css';
import { Settings, Bot, Globe, Bell, Shield, ChevronDown } from 'lucide-react';

const navSections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'agents', label: 'Agent Defaults', icon: Bot },
  { id: 'network', label: 'Network', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export function AgentConfig() {
  const [activeSection, setActiveSection] = useState('general');

  return (
    <div className={css('_flex _col _gap6 _p6')}>
      <h1 className={css('_textxl _fontsemi')}>Agent Configuration</h1>

      <div className={css('_flex _gap6')} style={{ alignItems: 'flex-start' }}>
        {/* Settings nav */}
        <nav className={css('_flex _col _gap1 _shrink0')} style={{ width: '200px' }}>
          {navSections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={css('_flex _aic _gap2 _px3 _py2 _textsm _textl _rounded') + ' d-interactive'}
              data-variant="ghost"
              style={{
                background: activeSection === id ? 'var(--d-surface)' : undefined,
                color: activeSection === id ? 'var(--d-text)' : 'var(--d-text-muted)',
                borderLeft: activeSection === id ? '2px solid var(--d-accent)' : '2px solid transparent',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Form content */}
        <div className={css('_flex1')} style={{ maxWidth: '40rem' }}>
          <div className={css('_flex _col _gap6 _p6') + ' d-surface carbon-card'}>
            {/* General section */}
            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _aic _gap2')}>
                <Settings size={18} style={{ color: 'var(--d-accent)' }} />
                <h2 className={css('_textlg _fontsemi')}>General Settings</h2>
              </div>
              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
                Configure global parameters for the agent orchestration system.
              </p>
            </div>

            <div className={css('_flex _col _gap4')}>
              <div className={css('_flex _col _gap1')}>
                <label className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)' }}>
                  Swarm Name <span style={{ color: 'var(--d-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  defaultValue="Production Swarm Alpha"
                  className="d-control carbon-input"
                />
              </div>

              <div className={css('_flex _col _gap1')}>
                <label className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)' }}>
                  Description
                </label>
                <textarea
                  className="d-control carbon-input"
                  style={{ minHeight: '6rem', resize: 'vertical' }}
                  defaultValue="Primary production agent swarm for data ingestion and processing pipeline."
                />
              </div>

              <div className={css('_grid _gc2 _gap4')}>
                <div className={css('_flex _col _gap1')}>
                  <label className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)' }}>
                    Max Concurrent Agents
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="d-control carbon-input"
                  />
                </div>
                <div className={css('_flex _col _gap1')}>
                  <label className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)' }}>
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    defaultValue={30000}
                    className="d-control carbon-input"
                  />
                </div>
              </div>

              <div className={css('_flex _col _gap1')}>
                <label className={css('_textsm _fontmedium')} style={{ color: 'var(--d-text-muted)' }}>
                  Log Level
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="d-control carbon-input"
                    defaultValue="info"
                    style={{ appearance: 'none', paddingRight: '2rem' }}
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
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

              <div className={css('_flex _aic _jcsb _p3 _rounded')} style={{ background: 'var(--d-surface-raised)' }}>
                <div className={css('_flex _col')}>
                  <span className={css('_textsm _fontmedium')}>Auto-restart on failure</span>
                  <span className={css('_textxs')} style={{ color: 'var(--d-text-muted)' }}>
                    Automatically restart agents when they crash or become unresponsive
                  </span>
                </div>
                <button
                  className={css('_shrink0')}
                  style={{
                    width: '40px',
                    height: '22px',
                    borderRadius: '11px',
                    background: 'var(--d-accent)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                  }}
                  role="switch"
                  aria-checked="true"
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: '2px',
                      left: '20px',
                      transition: 'left 0.2s ease',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className={css('_flex _jcfe _gap3')} style={{ borderTop: '1px solid var(--d-border)', paddingTop: 'var(--d-gap-4)' }}>
              <button className={'d-interactive'} data-variant="ghost">Cancel</button>
              <button className={'d-interactive neon-glow-hover'} data-variant="primary">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
