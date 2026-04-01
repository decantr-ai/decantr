import { css } from '@decantr/css';

/* ── KPI data ── */
const KPIS = [
  { label: 'Total Queries', value: '142.8K', change: '+18.3%', positive: true },
  { label: 'Active Users', value: '3,247', change: '+12.1%', positive: true },
  { label: 'Avg Response', value: '1.2s', change: '-8.4%', positive: true },
  { label: 'Error Rate', value: '0.3%', change: '+0.1%', positive: false },
];

/* ── Chart-like bars ── */
const CHART_DATA = [
  { label: 'Mon', value: 72, color: '#F58882' },
  { label: 'Tue', value: 85, color: '#FE4474' },
  { label: 'Wed', value: 91, color: '#FDA303' },
  { label: 'Thu', value: 64, color: '#0AF3EB' },
  { label: 'Fri', value: 98, color: '#00E0AB' },
  { label: 'Sat', value: 45, color: '#FCD021' },
  { label: 'Sun', value: 38, color: '#6500C6' },
];

/* ── Table data ── */
const TABLE_DATA = [
  { query: 'Revenue breakdown by region', user: 'Sarah Chen', model: 'GPT-4', tokens: 2340, time: '1.1s', status: 'success' },
  { query: 'User churn prediction Q2', user: 'Marcus Rivera', model: 'Claude', tokens: 4120, time: '2.3s', status: 'success' },
  { query: 'Product recommendation engine', user: 'Aisha Patel', model: 'GPT-4', tokens: 1890, time: '0.9s', status: 'success' },
  { query: 'Anomaly detection pipeline', user: 'James Wilson', model: 'Mixtral', tokens: 3670, time: '1.8s', status: 'warning' },
  { query: 'Sentiment analysis batch', user: 'Lisa Park', model: 'Claude', tokens: 5210, time: '3.1s', status: 'error' },
  { query: 'Customer LTV forecasting', user: 'David Kim', model: 'GPT-4', tokens: 2980, time: '1.4s', status: 'success' },
];

export function DashboardPage() {
  return (
    <div className={css('_flex _col _gap8 _p8')}>
      {/* Page header */}
      <div className={css('_flex _jcsb _aic')}>
        <div>
          <h1 className={css('_heading2 _mb1')}>Dashboard</h1>
          <p className={css('_textsm _fgmuted')}>
            Real-time overview of your AI portal activity
          </p>
        </div>
        <div className={css('_flex _gap2')}>
          <select
            className={css('_px3 _py2 _rounded _textsm')}
            style={{
              background: 'var(--d-surface)',
              border: '1px solid var(--d-border)',
              color: 'var(--d-text)',
            }}
            aria-label="Time range"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button
            className={css('_px4 _py2 _rounded _fontmedium _textsm')}
            style={{
              background: 'var(--d-primary)',
              border: 'none',
              color: '#fff',
            }}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={css('_grid _gap4 _gc1 _sm:gc2 _lg:gc4')}>
        {KPIS.map((kpi) => (
          <div key={kpi.label} className={css('_p5 _flex _col _gap2') + ' carbon-card'}>
            <span className={css('_textsm _fgmuted _fontmedium')}>{kpi.label}</span>
            <span className={css('_text2xl _fontbold')}>{kpi.value}</span>
            <span
              className={css('_textsm _fontmedium')}
              style={{ color: kpi.positive ? 'var(--d-success)' : 'var(--d-error)' }}
            >
              {kpi.change} from last period
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={css('_grid _gap6 _gc1 _lg:gc2')}>
        {/* Bar chart */}
        <div className={css('_p6') + ' carbon-card'}>
          <h3 className={css('_fontsemi _textlg _mb1')}>Query Volume</h3>
          <p className={css('_textsm _fgmuted _mb6')}>Daily queries this week</p>
          <div className={css('_flex _aic _gap3')} style={{ height: 200 }}>
            {CHART_DATA.map((bar) => (
              <div
                key={bar.label}
                className={css('_flex _col _aic _jcfe _flex1 _gap2')}
                style={{ height: '100%' }}
              >
                <div
                  className={css('_wfull _rounded')}
                  style={{
                    height: `${bar.value}%`,
                    background: bar.color,
                    minHeight: 4,
                    opacity: 0.85,
                    transition: 'height 0.3s ease',
                  }}
                />
                <span className={css('_textxs _fgmuted')}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Model distribution */}
        <div className={css('_p6') + ' carbon-card'}>
          <h3 className={css('_fontsemi _textlg _mb1')}>Model Distribution</h3>
          <p className={css('_textsm _fgmuted _mb6')}>Queries by AI model</p>
          <div className={css('_flex _col _gap4')}>
            {[
              { name: 'GPT-4', pct: 45, color: '#0AF3EB' },
              { name: 'Claude', pct: 32, color: '#F58882' },
              { name: 'Mixtral', pct: 15, color: '#FDA303' },
              { name: 'Llama 3', pct: 8, color: '#6500C6' },
            ].map((model) => (
              <div key={model.name} className={css('_flex _col _gap1')}>
                <div className={css('_flex _jcsb _textsm')}>
                  <span className={css('_fontmedium')}>{model.name}</span>
                  <span className={css('_fgmuted')}>{model.pct}%</span>
                </div>
                <div
                  className={css('_wfull _rounded')}
                  style={{ height: 8, background: 'var(--d-surface-raised)' }}
                >
                  <div
                    className={css('_rounded _hfull')}
                    style={{
                      width: `${model.pct}%`,
                      background: model.color,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className={css('_flex _col') + ' carbon-card'} style={{ padding: 0 }}>
        <div className={css('_flex _jcsb _aic _px6 _py4')} style={{ borderBottom: '1px solid var(--d-border)' }}>
          <div>
            <h3 className={css('_fontsemi _textlg')}>Recent Queries</h3>
            <p className={css('_textsm _fgmuted')}>Latest AI queries across all users</p>
          </div>
          <button
            className={css('_px3 _py1 _rounded _textsm')}
            style={{
              background: 'transparent',
              border: '1px solid var(--d-border)',
              color: 'var(--d-text-muted)',
            }}
          >
            View All
          </button>
        </div>
        <div className={css('_overxauto')}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--d-border)' }}>
                {['Query', 'User', 'Model', 'Tokens', 'Time', 'Status'].map(
                  (col) => (
                    <th
                      key={col}
                      className={css('_textl _px4 _py3 _textsm _fontmedium _fgmuted')}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {TABLE_DATA.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className={css('_px4 _py3 _textsm _fontmedium')} style={{ maxWidth: 260 }}>
                    {row.query}
                  </td>
                  <td className={css('_px4 _py3 _textsm _fgmuted')}>{row.user}</td>
                  <td className={css('_px4 _py3 _textsm')}>
                    <span
                      className={css('_px2 _py1 _roundedsm _textxs _fontmedium')}
                      style={{
                        background: 'var(--d-surface-raised)',
                        color: 'var(--d-text)',
                      }}
                    >
                      {row.model}
                    </span>
                  </td>
                  <td className={css('_px4 _py3 _textsm _fgmuted')}>
                    {row.tokens.toLocaleString()}
                  </td>
                  <td className={css('_px4 _py3 _textsm _fgmuted')}>{row.time}</td>
                  <td className={css('_px4 _py3 _textsm')}>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code preview */}
      <div className={css('_flex _col _gap2')}>
        <h3 className={css('_fontsemi _textlg')}>API Integration</h3>
        <pre className="carbon-code">
{`// Connect to Carbon AI
import { CarbonAI } from '@carbon/sdk';

const ai = new CarbonAI({
  apiKey: process.env.CARBON_API_KEY,
  model: 'gpt-4',
});

const response = await ai.query({
  prompt: 'Analyze Q1 revenue trends',
  context: 'sales_database',
  format: 'visualization',
});`}
        </pre>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    success: { bg: 'rgba(34,197,94,0.15)', color: 'var(--d-success)', label: 'Success' },
    warning: { bg: 'rgba(245,158,11,0.15)', color: 'var(--d-warning)', label: 'Warning' },
    error: { bg: 'rgba(239,68,68,0.15)', color: 'var(--d-error)', label: 'Error' },
  };
  const c = config[status] ?? config.success;
  return (
    <span
      className={css('_px2 _py1 _roundedsm _textxs _fontmedium')}
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
