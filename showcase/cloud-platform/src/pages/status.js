import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Card, Chip, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const services = [
  { name: 'API', status: 'operational', uptime: '99.99%', lastCheck: '< 1 min ago' },
  { name: 'Dashboard', status: 'operational', uptime: '99.98%', lastCheck: '< 1 min ago' },
  { name: 'Builds', status: 'operational', uptime: '99.95%', lastCheck: '2 min ago' },
  { name: 'DNS', status: 'operational', uptime: '99.99%', lastCheck: '< 1 min ago' },
  { name: 'Networking', status: 'operational', uptime: '99.97%', lastCheck: '1 min ago' },
  { name: 'Object Storage', status: 'degraded', uptime: '98.50%', lastCheck: '< 1 min ago' },
  { name: 'Metrics', status: 'operational', uptime: '99.96%', lastCheck: '3 min ago' },
  { name: 'Logs', status: 'operational', uptime: '99.94%', lastCheck: '< 1 min ago' },
];

const statusDot = (s) => s === 'operational' ? '_bgsuccess' : s === 'degraded' ? '_bgwarning' : '_bgerror';
const statusLabel = (s) => s === 'operational' ? 'Operational' : s === 'degraded' ? 'Degraded' : 'Outage';
const statusVariant = (s) => s === 'operational' ? 'success' : s === 'degraded' ? 'warning' : 'error';
const allOperational = services.every(s => s.status === 'operational');

// ─── Status Header ──────────────────────────────────────────────
function StatusHeader() {
  return div({ class: css('_flex _aic _jcsb _flexWrap _gap3') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4 _bold') }, 'System Status'),
      span({ class: css('_textxs _fgmuted') }, 'Last updated: ' + new Date().toLocaleTimeString())
    ),
    Badge({
      variant: allOperational ? 'success' : 'warning',
      class: css('_textsm'),
    }, allOperational ? 'All Operational' : 'Partial Degradation')
  );
}

// ─── Service Status Grid ────────────────────────────────────────
function ServiceGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading5 _bold') }, 'Services'),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger') },
      ...services.map(svc =>
        Card({ hover: true },
          Card.Body({ class: css('_flex _col _gap3 _p4') },
            div({ class: css('_flex _aic _jcsb') },
              div({ class: css('_flex _aic _gap2') },
                div({ class: css('_w[10px] _h[10px] _rfull ' + statusDot(svc.status)) }),
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
                span({ class: css('_textxs _fgmuted') }, 'Last Check'),
                span({ class: css('_textsm _bold') }, svc.lastCheck)
              )
            )
          )
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function StatusPage() {
  onMount(() => {
    document.title = 'Status — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    StatusHeader(),
    ServiceGrid()
  );
}
