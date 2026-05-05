import { css } from '@decantr/css';
import { NeuralFeedbackLoop } from '../../components/NeuralFeedbackLoop';
import { PageHeader, SectionHeader } from '../../components/PageHeader';
import { StatsOverview } from '../../components/StatsOverview';
import { deployedModels, modelFeedbackMetrics, modelOverviewStats } from '../../data/mock';

export function ModelOverview() {
  return (
    <div className="page-stack">
      <PageHeader
        label="Transparency"
        title="Model overview"
        description="This route stays legible by giving the KPI row, feedback instruments, and table their own clear layers instead of compressing everything into one panel."
      />

      <div className="page-stack">
        <SectionHeader label="Model KPIs" title="Current health and workload" description="The stats overview pattern owns the metric row, not the surrounding page frame." />
        <StatsOverview stats={modelOverviewStats} />
      </div>

      <div className="page-stack">
        <SectionHeader label="Feedback summary" title="Processing state made tangible" description="Each feedback panel behaves like a focused instrument rather than a generic card with decorative motion." />
        <div className="feedback-grid">
          {modelFeedbackMetrics.map((metric) => (
            <article key={metric.label} className="d-surface carbon-card feedback-panel">
              <NeuralFeedbackLoop
                label={metric.label}
                value={metric.value}
                maxValue={metric.maxValue}
                unit={metric.unit}
                trend={metric.trend}
                status={metric.status}
              />
            </article>
          ))}
        </div>
      </div>

      <div className="page-stack">
        <SectionHeader label="Deployed models" title="Current runtime mix" description="Dense tables are fine here because the shell already handles outer spacing and scroll ownership." />
        <div className="d-surface carbon-card table-card">
          <table className="d-data">
            <thead>
              <tr>
                <th className="d-data-header">Model</th>
                <th className="d-data-header">Provider</th>
                <th className="d-data-header">Requests (24h)</th>
                <th className="d-data-header">Average latency</th>
                <th className="d-data-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {deployedModels.map((row) => (
                <tr key={row.model} className="d-data-row">
                  <td className="d-data-cell mono-data">{row.model}</td>
                  <td className="d-data-cell">{row.provider}</td>
                  <td className="d-data-cell mono-data">{row.requests}</td>
                  <td className="d-data-cell mono-data">{row.latency}</td>
                  <td className="d-data-cell">
                    <span className="d-annotation" data-status={row.status === 'active' ? 'success' : row.status === 'error' ? 'error' : 'warning'}>
                      <span className="status-inline-dot" data-status={row.status} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
