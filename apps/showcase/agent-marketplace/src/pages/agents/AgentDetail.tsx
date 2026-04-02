import { useParams, Link } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  ArrowLeft, Cpu, MemoryStick, HardDrive, Thermometer,
  Activity, Zap, Clock, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const agentData: Record<string, {
  name: string; type: string; status: 'online' | 'warning' | 'error' | 'offline';
  model: string; version: string; cpu: number; mem: number; disk: number; temp: number;
  confidence: number; throughput: number; latency: string; uptime: string;
}> = {
  'agent-001': { name: 'Sentinel-Alpha', type: 'Monitor', status: 'online', model: 'sentinel-v3.2', version: '3.2.1', cpu: 23, mem: 41, disk: 12, temp: 42, confidence: 0.97, throughput: 340, latency: '89ms', uptime: '99.97%' },
  'agent-002': { name: 'Parser-Beta', type: 'ETL', status: 'online', model: 'parser-v2.8', version: '2.8.0', cpu: 67, mem: 72, disk: 34, temp: 61, confidence: 0.91, throughput: 890, latency: '124ms', uptime: '99.91%' },
  'agent-003': { name: 'Curator-Gamma', type: 'Classifier', status: 'warning', model: 'curator-v4.1', version: '4.1.3', cpu: 92, mem: 88, disk: 67, temp: 78, confidence: 0.83, throughput: 203, latency: '347ms', uptime: '98.44%' },
};

const history = [
  { time: '14:32:01', action: 'Task batch #4801 completed', result: 'success' as const, duration: '1.2s', tokens: 4800 },
  { time: '14:31:22', action: 'Confidence threshold check', result: 'warning' as const, duration: '0.1s', tokens: 120 },
  { time: '14:30:58', action: 'Model inference — classification', result: 'success' as const, duration: '0.8s', tokens: 3200 },
  { time: '14:30:15', action: 'Input validation pass', result: 'success' as const, duration: '0.05s', tokens: 50 },
  { time: '14:29:44', action: 'Memory pressure alert — threshold 85%', result: 'warning' as const, duration: '—', tokens: 0 },
  { time: '14:28:30', action: 'Heartbeat acknowledged by orchestrator', result: 'success' as const, duration: '0.02s', tokens: 10 },
  { time: '14:27:11', action: 'Retry failed — upstream timeout', result: 'error' as const, duration: '30s', tokens: 0 },
  { time: '14:26:00', action: 'Task batch #4800 completed', result: 'success' as const, duration: '1.4s', tokens: 5100 },
];

function GaugeRing({ value, max, color, size = 64 }: { value: number; max: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <svg width={size} height={size} className="confidence-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-border)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

function ResourceGauge({ icon: Icon, label, value, max, unit }: {
  icon: typeof Cpu; label: string; value: number; max: number; unit: string;
}) {
  const color = value / max > 0.8 ? 'var(--d-warning)' : value / max > 0.6 ? 'var(--d-info)' : 'var(--d-success)';
  return (
    <div className={css('_flex _col _aic _gap2 _p4') + ' carbon-card'}>
      <GaugeRing value={value} max={max} color={color} />
      <span className={'metric-value ' + css('_textlg')}>{value}{unit}</span>
      <div className={css('_flex _aic _gap1')}>
        <Icon size={12} style={{ color: 'var(--d-text-muted)' }} />
        <span className={'font-mono ' + css('_textxs _fgmuted _uppercase')}>{label}</span>
      </div>
    </div>
  );
}

export function AgentDetail() {
  const { id } = useParams();
  const agent = agentData[id || ''] || agentData['agent-001'];

  const statusClass = agent.status === 'online' ? 'status-online pulse' :
                      agent.status === 'warning' ? 'status-warning pulse' :
                      agent.status === 'error' ? 'status-error' : 'status-offline';

  return (
    <div className={css('_flex _col _gap6') + ' fade-in'}>
      {/* Breadcrumb */}
      <div className={css('_flex _aic _gap2')}>
        <Link to="/agents" className={'btn btn-ghost btn-sm'}>
          <ArrowLeft size={14} />
          <span className="font-mono">Agents</span>
        </Link>
      </div>

      {/* Agent header */}
      <div className={css('_flex _aic _jcsb')}>
        <div className={css('_flex _aic _gap3')}>
          <span className={'status-ring-lg ' + statusClass} />
          <div>
            <h1 className={'font-mono ' + css('_text2xl _fontbold')}>{agent.name}</h1>
            <div className={css('_flex _aic _gap2 _mt1')}>
              <span className="badge badge-info">{agent.type}</span>
              <span className={'font-mono ' + css('_textxs _fgmuted')}>{agent.model}</span>
              <span className={'font-mono ' + css('_textxs _fgmuted')}>v{agent.version}</span>
            </div>
          </div>
        </div>
        <div className={css('_flex _gap2')}>
          <button className="btn btn-secondary btn-sm">
            <RefreshCw size={14} /> Restart
          </button>
          <button className="btn btn-primary btn-sm">
            <Activity size={14} /> Live Trace
          </button>
        </div>
      </div>

      {/* Resource gauges */}
      <div className={css('_grid _gc2 _lg:gc4 _gap4')}>
        <ResourceGauge icon={Cpu} label="CPU" value={agent.cpu} max={100} unit="%" />
        <ResourceGauge icon={MemoryStick} label="Memory" value={agent.mem} max={100} unit="%" />
        <ResourceGauge icon={HardDrive} label="Disk" value={agent.disk} max={100} unit="%" />
        <ResourceGauge icon={Thermometer} label="Temp" value={agent.temp} max={100} unit="C" />
      </div>

      {/* Metrics row */}
      <div className={css('_grid _gc3 _gap4')}>
        <div className={css('_flex _col _gap1 _p4') + ' carbon-card'}>
          <span className={'font-mono ' + css('_textxs _fgmuted _uppercase')}>Confidence</span>
          <div className={css('_flex _aic _gap2')}>
            <span className="metric-value" style={{ color: agent.confidence > 0.9 ? 'var(--d-success)' : 'var(--d-warning)' }}>
              {(agent.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className={css('_flex _col _gap1 _p4') + ' carbon-card'}>
          <span className={'font-mono ' + css('_textxs _fgmuted _uppercase')}>Throughput</span>
          <div className={css('_flex _aic _gap2')}>
            <span className="metric-value">{agent.throughput}</span>
            <span className={'font-mono ' + css('_textxs _fgmuted')}>req/s</span>
          </div>
        </div>
        <div className={css('_flex _col _gap1 _p4') + ' carbon-card'}>
          <span className={'font-mono ' + css('_textxs _fgmuted _uppercase')}>Avg Latency</span>
          <span className="metric-value">{agent.latency}</span>
        </div>
      </div>

      {/* Neural feedback visualization */}
      <div className={css('_flex _col _gap3')}>
        <h2 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>Feedback Loop</h2>
        <div className={css('_p6 _flex _aic _jcc') + ' carbon-card neon-glow'}>
          <div className={css('_rel')} style={{ width: 200, height: 200 }}>
            {/* Outer confidence ring */}
            <svg width={200} height={200} className="confidence-ring" style={{ position: 'absolute', inset: 0 }}>
              <circle cx={100} cy={100} r={90} fill="none" stroke="var(--d-border)" strokeWidth={3} opacity={0.3} />
              <circle
                cx={100} cy={100} r={90} fill="none" stroke="var(--d-primary)" strokeWidth={3}
                strokeDasharray={565} strokeDashoffset={565 - agent.confidence * 565}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px var(--d-primary))' }}
              />
            </svg>
            {/* Inner throughput ring */}
            <svg width={200} height={200} className="confidence-ring" style={{ position: 'absolute', inset: 0 }}>
              <circle cx={100} cy={100} r={70} fill="none" stroke="var(--d-border)" strokeWidth={3} opacity={0.2} />
              <circle
                cx={100} cy={100} r={70} fill="none" stroke="var(--d-success)" strokeWidth={3}
                strokeDasharray={440} strokeDashoffset={440 - (agent.throughput / 1000) * 440}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px var(--d-success))' }}
              />
            </svg>
            {/* Center value */}
            <div
              className={css('_abs _flex _col _aic _jcc')}
              style={{ inset: 0 }}
            >
              <span className={'metric-value neon-text-glow ' + css('_text3xl')}>
                {(agent.confidence * 100).toFixed(0)}
              </span>
              <span className={'font-mono ' + css('_textxs _fgmuted')}>confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* History timeline */}
      <div className={css('_flex _col _gap3')}>
        <h2 className={'font-mono ' + css('_textsm _fontbold _uppercase')}>Agent History</h2>
        <div className={css('_flex _col')}>
          {history.map((h, i) => {
            const Icon = h.result === 'success' ? CheckCircle2 : h.result === 'error' ? XCircle : AlertTriangle;
            const iconColor = h.result === 'success' ? 'var(--d-success)' : h.result === 'error' ? 'var(--d-error)' : 'var(--d-warning)';
            return (
              <div
                key={i}
                className={css('_flex _aic _gap3 _py3 _px3')}
                style={{ borderBottom: i < history.length - 1 ? '1px solid color-mix(in srgb, var(--d-border) 40%, transparent)' : undefined }}
              >
                <span className={'font-mono ' + css('_textxs _fgmuted _shrink0')} style={{ width: 72 }}>
                  {h.time}
                </span>
                <Icon size={14} style={{ color: iconColor, flexShrink: 0 }} />
                <span className={'font-mono ' + css('_textsm _flex1')}>{h.action}</span>
                <span className={'font-mono ' + css('_textxs _fgmuted')}>{h.duration}</span>
                {h.tokens > 0 && (
                  <span className={'font-mono ' + css('_textxs _fgmuted')}>
                    <Zap size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {h.tokens.toLocaleString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
