import { css } from '@decantr/css';
import { useState } from 'react';
import {
  Search, Filter, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Clock, Zap,
  Brain,
} from 'lucide-react';

type LogEntry = {
  id: string;
  timestamp: string;
  model: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  duration: string;
  tokens: number;
  confidence: number;
  details?: string;
};

const logEntries: LogEntry[] = [
  { id: 'inf-001', timestamp: '14:32:01.234', model: 'sentinel-v3.2', action: 'Anomaly detection — request latency analysis', status: 'success', duration: '89ms', tokens: 1200, confidence: 0.97, details: 'Analyzed 340 request traces. Detected 2 anomalies in p99 latency distribution. Threshold: 400ms. Max observed: 412ms at 14:31:47.' },
  { id: 'inf-002', timestamp: '14:31:58.891', model: 'parser-v2.8', action: 'Schema inference — batch #4782', status: 'success', duration: '124ms', tokens: 3400, confidence: 0.91 },
  { id: 'inf-003', timestamp: '14:31:47.120', model: 'curator-v4.1', action: 'Classification — document batch', status: 'warning', duration: '347ms', tokens: 2800, confidence: 0.83, details: 'Classification confidence below 0.85 threshold for 12/89 documents. Ambiguous categories: [technical-spec, api-reference]. Recommend manual review.' },
  { id: 'inf-004', timestamp: '14:31:22.456', model: 'router-v1.0', action: 'Load balancing — task redistribution', status: 'success', duration: '45ms', tokens: 800, confidence: 0.95 },
  { id: 'inf-005', timestamp: '14:30:58.789', model: 'parser-v2.8', action: 'Data transformation — JSON to Parquet', status: 'success', duration: '201ms', tokens: 4200, confidence: 0.93 },
  { id: 'inf-006', timestamp: '14:30:15.123', model: 'analyst-v2.1', action: 'Time-series forecast — revenue projection', status: 'error', duration: '30000ms', tokens: 0, confidence: 0, details: 'Process killed: OOM at inference step 3. Memory usage exceeded 4096MB limit. Input tensor shape: [1, 8192, 768]. Recommend reducing sequence length or increasing memory allocation.' },
  { id: 'inf-007', timestamp: '14:29:44.567', model: 'router-v1.0', action: 'Capacity planning — cluster reweight', status: 'success', duration: '38ms', tokens: 600, confidence: 0.96 },
  { id: 'inf-008', timestamp: '14:29:01.890', model: 'sentinel-v3.2', action: 'Health check — agent heartbeat validation', status: 'success', duration: '12ms', tokens: 100, confidence: 0.99 },
  { id: 'inf-009', timestamp: '14:28:30.234', model: 'curator-v4.1', action: 'Classification — entity extraction', status: 'success', duration: '290ms', tokens: 2100, confidence: 0.88 },
  { id: 'inf-010', timestamp: '14:27:55.678', model: 'parser-v2.8', action: 'Schema validation — incoming payload', status: 'success', duration: '56ms', tokens: 400, confidence: 0.94 },
];

const statusFilters = ['All', 'Success', 'Warning', 'Error'] as const;

export function InferenceLog() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<typeof statusFilters[number]>('All');
  const [search, setSearch] = useState('');

  const filtered = logEntries.filter((entry) => {
    const matchesFilter = activeFilter === 'All' || entry.status === activeFilter.toLowerCase();
    const matchesSearch = search === '' ||
      entry.model.includes(search) ||
      entry.action.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={css('_flex _col _gap6') + ' fade-in'}>
      {/* Header */}
      <div className={css('_flex _aic _jcsb')}>
        <div>
          <h1 className={'font-mono ' + css('_text2xl _fontbold')}>Inference Log</h1>
          <p className={'font-mono ' + css('_textsm _fgmuted _mt1')}>
            Complete trace of every model inference
          </p>
        </div>
        <div className={css('_flex _aic _gap2')}>
          <Clock size={14} style={{ color: 'var(--d-text-muted)' }} />
          <span className={'font-mono ' + css('_textxs _fgmuted')}>Live — auto-refreshing</span>
          <span className={'status-ring status-online pulse'} />
        </div>
      </div>

      {/* Filters */}
      <div className={css('_flex _aic _gap3')}>
        <div className={css('_flex _aic _gap2 _flex1 _rel')}>
          <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--d-text-muted)' }} />
          <input
            type="text"
            className="carbon-input font-mono"
            placeholder="Search by model or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div className={css('_flex _gap1')}>
          {statusFilters.map((f) => (
            <button
              key={f}
              type="button"
              className={'btn btn-sm font-mono ' + (activeFilter === f ? 'btn-primary' : 'btn-ghost')}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm">
          <Filter size={14} /> Advanced
        </button>
      </div>

      {/* Log entries */}
      <div className={css('_flex _col')}>
        {filtered.map((entry) => {
          const Icon = entry.status === 'success' ? CheckCircle2 : entry.status === 'error' ? XCircle : AlertTriangle;
          const iconColor = entry.status === 'success' ? 'var(--d-success)' : entry.status === 'error' ? 'var(--d-error)' : 'var(--d-warning)';
          const isExpanded = expandedId === entry.id;

          return (
            <div key={entry.id} style={{ borderBottom: '1px solid color-mix(in srgb, var(--d-border) 40%, transparent)' }}>
              <button
                type="button"
                className={css('_flex _aic _gap3 _py3 _px3 _wfull')}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                {isExpanded ? <ChevronDown size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} /> : <ChevronRight size={14} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />}
                <span className={'font-mono ' + css('_textxs _fgmuted _shrink0')} style={{ width: 100 }}>
                  {entry.timestamp}
                </span>
                <Icon size={14} style={{ color: iconColor, flexShrink: 0 }} />
                <span className="badge badge-muted font-mono">{entry.model}</span>
                <span className={'font-mono ' + css('_textsm _flex1 _fgtext')}>{entry.action}</span>
                <span className={'font-mono ' + css('_textxs _fgmuted _shrink0')}>
                  <Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {entry.duration}
                </span>
                <span className={'font-mono ' + css('_textxs _fgmuted _shrink0')}>
                  <Zap size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {entry.tokens.toLocaleString()}
                </span>
                {entry.confidence > 0 && (
                  <span className={'font-mono ' + css('_textxs _shrink0')} style={{ color: entry.confidence > 0.9 ? 'var(--d-success)' : entry.confidence > 0.8 ? 'var(--d-warning)' : 'var(--d-error)' }}>
                    <Brain size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {(entry.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </button>
              {isExpanded && entry.details && (
                <div className={css('_ml10 _mb3 _p3') + ' carbon-code fade-in'}>
                  <span className={'font-mono ' + css('_textsm _fgmuted')}>{entry.details}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
