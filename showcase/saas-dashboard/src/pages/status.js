import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Card, Chip, icon } from 'decantr/components';

const { div, span, h2, p } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const services = [
  { name: 'API Gateway', status: 'operational', uptime: '99.98%', responseTime: '42ms', lastCheck: '< 1 min ago' },
  { name: 'Auth Service', status: 'operational', uptime: '99.99%', responseTime: '18ms', lastCheck: '< 1 min ago' },
  { name: 'Database Primary', status: 'operational', uptime: '99.97%', responseTime: '8ms', lastCheck: '2 min ago' },
  { name: 'Database Replica', status: 'degraded', uptime: '98.42%', responseTime: '156ms', lastCheck: '< 1 min ago' },
  { name: 'CDN Edge', status: 'operational', uptime: '99.99%', responseTime: '12ms', lastCheck: '1 min ago' },
  { name: 'Search Index', status: 'operational', uptime: '99.95%', responseTime: '35ms', lastCheck: '3 min ago' },
  { name: 'Worker Queue', status: 'operational', uptime: '99.96%', responseTime: '22ms', lastCheck: '< 1 min ago' },
  { name: 'Storage (S3)', status: 'outage', uptime: '95.10%', responseTime: '—', lastCheck: '< 1 min ago' },
  { name: 'Email Relay', status: 'operational', uptime: '99.94%', responseTime: '88ms', lastCheck: '2 min ago' },
  { name: 'WebSocket Hub', status: 'operational', uptime: '99.91%', responseTime: '6ms', lastCheck: '1 min ago' },
];

const incidents = [
  { id: 'INC-112', title: 'Storage service degradation', severity: 'critical', status: 'investigating', time: '12 min ago', description: 'S3 bucket returning 503 errors on write operations.' },
  { id: 'INC-111', title: 'Database replica lag spike', severity: 'warning', status: 'monitoring', time: '2 hours ago', description: 'Replication lag exceeded 500ms threshold. Auto-recovery in progress.' },
  { id: 'INC-108', title: 'CDN cache purge delay', severity: 'info', status: 'resolved', time: '1 day ago', description: 'Cache invalidation took 45 min instead of the usual 5 min.' },
];

const statusColor = (s) => s === 'operational' ? '_bgsuccess' : s === 'degraded' ? '_bgwarning' : '_bgerror';
const statusLabel = (s) => s === 'operational' ? 'Operational' : s === 'degraded' ? 'Degraded' : 'Outage';
const statusVariant = (s) => s === 'operational' ? 'success' : s === 'degraded' ? 'warning' : 'error';
const hasIssues = services.some(s => s.status !== 'operational');

// ─── Status Header ──────────────────────────────────────────────
function StatusHeader() {
  return div({ class: css('_flex _aic _jcsb _flexWrap _gap3') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('d-gradient-text _heading4 _bold') }, 'System Status'),
      span({ class: css('_textxs _fgmuted') }, 'Last updated: ' + new Date().toLocaleTimeString())
    ),
    Badge({
      variant: hasIssues ? 'error' : 'success',
      class: css('_textsm'),
    }, hasIssues ? 'Issues Detected' : 'All Operational')
  );
}

// ─── Service Grid ───────────────────────────────────────────────
function ServiceGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Services'),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger') },
      ...services.map(svc =>
        Card({ class: css('d-glass'), hover: true },
          Card.Body({ class: css('_flex _col _gap3 _p4') },
            div({ class: css('_flex _aic _jcsb') },
              div({ class: css('_flex _aic _gap2') },
                div({ class: css(`_w[10px] _h[10px] _rfull ${statusColor(svc.status)}`) }),
                span({ class: css('_medium _textsm') }, svc.name)
              ),
              Chip({ label: statusLabel(svc.status), variant: statusVariant(svc.status), size: 'xs' })
            ),
            div({ class: css('_grid _gc2 _gap2') },
              div({ class: css('_flex _col') },
                span({ class: css('_textxs _fgmuted') }, 'Uptime'),
                span({ class: css('_textsm _bold') }, svc.uptime)
              ),
              div({ class: css('_flex _col') },
                span({ class: css('_textxs _fgmuted') }, 'Response'),
                span({ class: css('_textsm _bold') }, svc.responseTime)
              )
            ),
            span({ class: css('_textxs _fgmuted') }, 'Checked ' + svc.lastCheck)
          )
        )
      )
    )
  );
}

// ─── Incident History ───────────────────────────────────────────
function IncidentHistory() {
  const sevVariant = (s) => s === 'critical' ? 'error' : s === 'warning' ? 'warning' : 'info';
  const sevIcon = (s) => s === 'critical' ? 'alert-circle' : s === 'warning' ? 'alert-triangle' : 'info';
  const statusChip = (s) => s === 'resolved' ? 'success' : s === 'investigating' ? 'error' : 'warning';

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Recent Incidents'),
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...incidents.map(inc =>
          div({ class: css('_flex _gap3 _aic _py3 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon(sevIcon(inc.severity), { size: '1em', class: css(`_fg${sevVariant(inc.severity)}`) })
            ),
            div({ class: css('_flex _col _flex1 _gap1') },
              div({ class: css('_flex _aic _gap2') },
                span({ class: css('_textsm _bold') }, inc.id),
                span({ class: css('_textsm _medium') }, inc.title),
              ),
              p({ class: css('_textxs _fgmuted') }, inc.description),
              span({ class: css('_textxs _fgmuted') }, inc.time)
            ),
            Chip({ label: inc.status, variant: statusChip(inc.status), size: 'xs' })
          )
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function StatusPage() {
  onMount(() => { document.title = 'Status — SaaS Dashboard'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    StatusHeader(),
    ServiceGrid(),
    IncidentHistory()
  );
}
