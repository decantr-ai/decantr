import { css } from '@decantr/css';
import { Link } from 'react-router-dom';

/* ── Color rotation from luminarum recipe ── */
const FEATURE_CARDS = [
  {
    title: 'Natural Language Queries',
    desc: 'Ask questions in plain English and get precise, contextual answers from your data.',
    color: '#F58882',
    colorAlt: '#FE4474',
    rgb: '245,136,130',
  },
  {
    title: 'Real-Time Analytics',
    desc: 'Live dashboards that update as your data changes. No refresh needed.',
    color: '#0AF3EB',
    colorAlt: '#00E0AB',
    rgb: '10,243,235',
  },
  {
    title: 'Multi-Model Support',
    desc: 'Switch between GPT-4, Claude, and open-source models on the fly.',
    color: '#FDA303',
    colorAlt: '#FC8D0D',
    rgb: '253,163,3',
  },
  {
    title: 'Enterprise Security',
    desc: 'SOC 2 compliant with end-to-end encryption and granular access controls.',
    color: '#6500C6',
    colorAlt: '#FE4474',
    rgb: '101,0,198',
  },
];

const PIPELINE_STEPS = [
  { num: 1, title: 'Connect', desc: 'Link your data sources — databases, APIs, or file uploads.', color: '#F58882', rgb: '245,136,130' },
  { num: 2, title: 'Configure', desc: 'Set permissions, define schemas, and tune model parameters.', color: '#0AF3EB', rgb: '10,243,235' },
  { num: 3, title: 'Query', desc: 'Ask questions in natural language. The AI understands context.', color: '#FDA303', rgb: '253,163,3' },
  { num: 4, title: 'Analyze', desc: 'Get visualizations, summaries, and actionable insights.', color: '#FCD021', rgb: '252,208,33' },
];

export function LandingPage() {
  return (
    <div className={css('_flex _col')}>
      {/* ── Hero Section ── */}
      <section
        className={css('_rel _flex _aic _jcc')}
        style={{ minHeight: '85vh', padding: '120px 48px' }}
      >
        <div className="lum-orbs" />
        <div
          className={css('_rel _flex _col _aic _textc _gap6') + ' lum-fade-up'}
          style={{ maxWidth: 800, zIndex: 1 }}
        >
          <div
            className={css('_textsm _fontmedium _px4 _py1 _rounded')}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--d-primary)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            Powered by Carbon AI Engine v4.0
          </div>
          <h1
            className={css('_fontsemi')}
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1 }}
          >
            Your data, answered
            <br />
            <span style={{ color: 'var(--d-primary)' }}>in real time</span>
          </h1>
          <p
            className={css('_textlg _fgmuted')}
            style={{ maxWidth: 560, lineHeight: 1.7 }}
          >
            Carbon AI Portal transforms how teams interact with data.
            Ask questions, get visualizations, and uncover insights — all
            through a conversational interface.
          </p>
          <div className={css('_flex _gap4 _mt4')}>
            <Link
              to="/chat"
              className={css('_px6 _py3 _rounded _fontmedium _textbase')}
              style={{
                background: 'var(--d-primary)',
                color: '#fff',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              Start Chatting
            </Link>
            <Link
              to="/dashboard"
              className={css('_px6 _py3 _rounded _fontmedium _textbase')}
              style={{
                border: '1px solid var(--d-border)',
                color: 'var(--d-text)',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="lum-divider">
        <div className="dot" style={{ background: '#F58882' }} />
      </div>

      {/* ── Feature Grid (vibrant cards) ── */}
      <section style={{ padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2
            className={css('_fontsemi _textc _mb3') + ' lum-fade-up'}
            style={{ fontSize: '2.25rem' }}
          >
            Built for modern teams
          </h2>
          <p
            className={css('_textlg _fgmuted _textc _mb12') + ' lum-fade-up'}
            style={{ maxWidth: 520, margin: '0 auto', marginBottom: 64 }}
          >
            Everything you need to turn raw data into clear decisions.
          </p>
          <div className={css('_grid _gap6 _gc1 _sm:gc2')}>
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.title}
                className="lum-card-vibrant lum-fade-up"
                style={{
                  '--lum-card-color': card.color,
                  '--lum-card-color-alt': card.colorAlt,
                  '--lum-card-color-rgb': card.rgb,
                } as React.CSSProperties}
              >
                <h3 className={css('_fontsemi _textxl _mb2')}>{card.title}</h3>
                <p style={{ opacity: 0.9, lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="lum-divider">
        <div className="dot" style={{ background: '#0AF3EB' }} />
      </div>

      {/* ── Pipeline (outlined cards) ── */}
      <section style={{ padding: '100px 48px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2
            className={css('_fontsemi _textc _mb3') + ' lum-fade-up'}
            style={{ fontSize: '2.25rem' }}
          >
            How it works
          </h2>
          <p
            className={css('_textlg _fgmuted _textc') + ' lum-fade-up'}
            style={{ maxWidth: 480, margin: '0 auto', marginBottom: 64 }}
          >
            Four steps from raw data to actionable insight.
          </p>
          <div className={css('_grid _gap6 _gc1 _sm:gc2 _lg:gc4')}>
            {PIPELINE_STEPS.map((step) => (
              <div
                key={step.num}
                className="lum-card-outlined lum-fade-up"
                style={{
                  '--lum-card-color': step.color,
                  '--lum-card-color-rgb': step.rgb,
                } as React.CSSProperties}
              >
                <div className={css('_flex _aic _gap3 _mb3')}>
                  <span
                    className="lum-stat-glow"
                    style={{
                      '--lum-card-color': step.color,
                      width: 36,
                      height: 36,
                      fontSize: '0.875rem',
                    } as React.CSSProperties}
                  >
                    {step.num}
                  </span>
                  <h4 className={css('_fontsemi _textlg')}>{step.title}</h4>
                </div>
                <p className={css('_textsm')} style={{ lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="lum-divider">
        <div className="dot" style={{ background: '#FDA303' }} />
      </div>

      {/* ── CTA Section ── */}
      <section style={{ padding: '120px 48px' }}>
        <div
          className={css('_flex _col _aic _textc _gap6') + ' lum-fade-up'}
          style={{ maxWidth: 640, margin: '0 auto' }}
        >
          <h2 className={css('_fontsemi')} style={{ fontSize: '2.25rem' }}>
            Ready to get started?
          </h2>
          <p className={css('_textlg _fgmuted')} style={{ lineHeight: 1.7 }}>
            Join thousands of teams already using Carbon AI to make
            faster, smarter decisions from their data.
          </p>
          <Link
            to="/chat"
            className={css('_px8 _py3 _rounded _fontmedium _textlg')}
            style={{
              background: 'var(--d-primary)',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Launch AI Chat
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: '32px 48px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className={css('_flex _jcsb _aic _fgmuted _textsm')}>
          <span className="lum-brand">
            Carbon<span className="accent">AI</span> Portal
          </span>
          <span>2026 Carbon AI Inc.</span>
        </div>
      </footer>
    </div>
  );
}
