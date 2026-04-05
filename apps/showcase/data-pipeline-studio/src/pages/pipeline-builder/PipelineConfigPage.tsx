import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { TerminalSplitShell } from '@/components/TerminalSplitShell';
import { getPipelineById } from '@/data/mock';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.375rem 0.5rem',
  background: 'var(--d-bg)',
  border: '1px solid var(--d-border)',
  color: 'var(--d-text)',
  fontFamily: 'inherit',
  fontSize: '0.8125rem',
  outline: 'none',
  borderRadius: 0,
};

export function PipelineConfigPage() {
  const { id } = useParams<{ id: string }>();
  const pipeline = getPipelineById(id || '');
  const [schedule, setSchedule] = useState(pipeline?.schedule || '');
  const [retries, setRetries] = useState(3);
  const [timeout, setTimeout] = useState(900);
  const [retryBackoff, setRetryBackoff] = useState('exponential');
  const [onFailure, setOnFailure] = useState('alert');
  const [concurrency, setConcurrency] = useState(1);

  if (!pipeline) return <Navigate to="/pipelines" replace />;

  return (
    <TerminalSplitShell title={`CONFIG // ${pipeline.name}`}>
      <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem', minHeight: 0 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
            <Link to={`/pipelines/${pipeline.id}`} style={{ color: 'var(--d-accent)' }}>&larr; editor</Link>
            <span className="term-glow" style={{ color: 'var(--d-primary)', fontWeight: 600 }}>{pipeline.name}</span>
          </div>

          {/* Schedule */}
          <section className="term-panel" style={{ padding: '0.875rem 1rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.625rem' }}>// SCHEDULE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="d-label">CRON EXPRESSION</label>
              <input value={schedule} onChange={(e) => setSchedule(e.target.value)} style={inputStyle} />
              <div style={{ fontSize: '0.7rem', color: 'var(--d-text-muted)' }}>
                $ next 3: 2026-04-05 15:00Z, 16:00Z, 17:00Z
              </div>
            </div>
          </section>

          {/* Retry */}
          <section className="term-panel" style={{ padding: '0.875rem 1rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.625rem' }}>// RETRY POLICY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="d-label">MAX RETRIES</label>
                <input type="number" value={retries} onChange={(e) => setRetries(+e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="d-label">BACKOFF</label>
                <select value={retryBackoff} onChange={(e) => setRetryBackoff(e.target.value)} style={inputStyle}>
                  <option value="constant">constant</option>
                  <option value="linear">linear</option>
                  <option value="exponential">exponential</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="d-label">TIMEOUT (sec)</label>
                <input type="number" value={timeout} onChange={(e) => setTimeout(+e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label className="d-label">CONCURRENCY</label>
                <input type="number" value={concurrency} onChange={(e) => setConcurrency(+e.target.value)} style={inputStyle} />
              </div>
            </div>
          </section>

          {/* Alerts */}
          <section className="term-panel" style={{ padding: '0.875rem 1rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.625rem' }}>// ON FAILURE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {['alert', 'alert + page', 'log only', 'custom webhook'].map((opt) => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  <input type="radio" name="onFailure" checked={onFailure === opt} onChange={() => setOnFailure(opt)} style={{ accentColor: 'var(--d-primary)' }} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Env vars */}
          <section className="term-panel" style={{ padding: '0.875rem 1rem' }}>
            <div className="d-label" style={{ color: 'var(--d-accent)', marginBottom: '0.625rem' }}>// ENVIRONMENT</div>
            <pre style={{ fontSize: '0.75rem', color: 'var(--d-text)', margin: 0, lineHeight: 1.6 }}>
{`DW_USER=etl_writer
DW_WAREHOUSE=etl_wh
DW_ROLE=etl_role
SLACK_WEBHOOK=***********
PAGE_ROUTING=#data-oncall`}
            </pre>
          </section>

          {/* Save */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="d-interactive" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 0 }}>Discard</button>
            <button className="d-interactive" data-variant="primary" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 0 }}>&gt; Save Config</button>
          </div>
        </div>
      </div>
    </TerminalSplitShell>
  );
}
