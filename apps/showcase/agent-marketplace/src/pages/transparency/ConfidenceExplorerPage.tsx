import { css } from '@decantr/css';
import { BarChart3, TrendingUp, Layers, Inbox } from 'lucide-react';
import { confidenceDistribution, modelMetrics, agents } from '../../data';
import { SectionLabel } from '../../components/SectionLabel';

/**
 * Confidence explorer — intent-radar as confidence-distribution + stats-detail as metric-breakdown.
 * Intent radar: radial visualization of confidence vectors.
 * Stats detail: detailed metric breakdown table.
 */
export function ConfidenceExplorerPage() {
  const maxCount = Math.max(...confidenceDistribution.map((d) => d.count));

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Intent radar / confidence distribution */}
      <div className="d-section" data-density="compact">
        <SectionLabel>Confidence Distribution</SectionLabel>

        <div className={css('_flex _wrap _gap6')}>
          {/* Radial visualization */}
          <div
            className={css('_flex _aic _jcc _flex1') + ' d-surface carbon-glass'}
            style={{ minWidth: '240px', minHeight: '240px', padding: '2rem' }}
          >
            <div className={css('_rel')} style={{ width: 200, height: 200 }}>
              {/* Concentric circles */}
              {[1, 0.75, 0.5, 0.25].map((scale, i) => (
                <div
                  key={i}
                  className={css('_abs _roundedfull')}
                  style={{
                    width: `${scale * 100}%`,
                    height: `${scale * 100}%`,
                    top: `${(1 - scale) * 50}%`,
                    left: `${(1 - scale) * 50}%`,
                    border: '1px solid var(--d-border)',
                    opacity: 0.3 + i * 0.1,
                  }}
                />
              ))}
              {/* Data points as vectors */}
              {confidenceDistribution.map((d, i) => {
                const angle = (i / confidenceDistribution.length) * Math.PI * 2 - Math.PI / 2;
                const radius = (d.count / maxCount) * 80;
                const x = 100 + Math.cos(angle) * radius;
                const y = 100 + Math.sin(angle) * radius;
                return (
                  <div
                    key={d.range}
                    className={css('_abs _roundedfull') + ' neon-glow'}
                    style={{
                      width: 10,
                      height: 10,
                      background: d.color,
                      left: `${x - 5}px`,
                      top: `${y - 5}px`,
                      boxShadow: `0 0 8px ${d.color}`,
                    }}
                    title={`${d.range}: ${d.count} inferences`}
                  />
                );
              })}
              {/* Center label */}
              <div
                className={css('_abs _flex _col _aic _jcc')}
                style={{ inset: '35%' }}
              >
                <span className={css('_textlg _fontsemi') + ' mono-data neon-text-glow'}>
                  {Math.round(modelMetrics.avgConfidence * 100)}%
                </span>
                <span className={css('_textxs _fgmuted')}>avg</span>
              </div>
            </div>
          </div>

          {/* Bar chart breakdown */}
          <div className={css('_flex _col _gap3 _flex1')} style={{ minWidth: '200px' }}>
            {confidenceDistribution.map((d) => (
              <div key={d.range} className={css('_flex _col _gap1')}>
                <div className={css('_flex _jcsb _aic')}>
                  <span className={css('_textsm') + ' mono-data'}>{d.range}</span>
                  <span className={css('_textsm _fontsemi') + ' mono-data'}>{d.count}</span>
                </div>
                <div
                  className={css('_w100 _rounded')}
                  style={{ height: 6, background: 'var(--d-border)' }}
                >
                  <div
                    className={css('_rounded')}
                    style={{
                      height: '100%',
                      width: `${(d.count / maxCount) * 100}%`,
                      background: d.color,
                      transition: 'width 0.3s var(--d-easing)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric breakdown — stats-detail */}
      <div className="d-section" data-density="compact">
        <SectionLabel>Metric Breakdown</SectionLabel>

        {agents.length === 0 ? (
          <div className={css('_flex _col _aic _jcc _gap4 _py8')}>
            <Inbox size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
            <p className={css('_fgmuted _textsm')}>No agent data available.</p>
          </div>
        ) : (
          <div className={css('_overyauto')}>
            <table className="d-data">
              <thead>
                <tr>
                  <th className="d-data-header">Agent</th>
                  <th className="d-data-header">Model</th>
                  <th className="d-data-header">Confidence</th>
                  <th className="d-data-header">Tokens</th>
                  <th className="d-data-header">Tasks</th>
                  <th className="d-data-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="d-data-row">
                    <td className={css('_fontsemi') + ' d-data-cell mono-data'}>{agent.name}</td>
                    <td className={css('_fgmuted') + ' d-data-cell mono-data'}>{agent.model}</td>
                    <td className="d-data-cell">
                      <div className={css('_flex _aic _gap2')}>
                        <span className="mono-data">{Math.round(agent.confidence * 100)}%</span>
                        <div
                          className={css('_rounded')}
                          style={{
                            width: 40,
                            height: 4,
                            background: 'var(--d-border)',
                          }}
                        >
                          <div
                            className={css('_rounded')}
                            style={{
                              height: '100%',
                              width: `${agent.confidence * 100}%`,
                              background: agent.confidence > 0.8 ? 'var(--d-success)' : agent.confidence > 0.5 ? 'var(--d-warning)' : 'var(--d-error)',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="d-data-cell mono-data">{agent.tokensUsed.toLocaleString()}</td>
                    <td className="d-data-cell mono-data">{agent.tasksCompleted.toLocaleString()}</td>
                    <td className="d-data-cell">
                      <span
                        className="d-annotation"
                        data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : agent.status === 'warning' ? 'warning' : undefined}
                      >
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
