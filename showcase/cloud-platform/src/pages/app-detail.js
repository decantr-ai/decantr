import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, DataTable, Statistic, icon } from 'decantr/components';

const { div, span, h2, pre, code } = tags;

// ─── Mock data ──────────────────────────────────────────────────

const app = {
  name: 'api-gateway',
  status: 'deployed',
  region: 'iad',
};

const kpis = [
  { label: 'Requests/min', value: '12,450', trend: 'up', trendValue: '+8.2%', ic: 'activity' },
  { label: 'Avg Latency', value: '42ms', trend: 'down', trendValue: '-5.1%', ic: 'clock' },
  { label: 'Error Rate', value: '0.03%', trend: 'down', trendValue: '-12%', ic: 'alert-triangle' },
  { label: 'Uptime', value: '99.99%', trend: 'stable', trendValue: 'stable', ic: 'shield-check' },
];

const logEntries = [
  { time: '14:32:01', level: 'INFO', msg: 'Starting deployment v2.4.1...' },
  { time: '14:32:02', level: 'INFO', msg: 'Pulling image registry.fly.io/api-gateway:v2.4.1' },
  { time: '14:32:05', level: 'INFO', msg: 'Image pulled successfully (234 MB)' },
  { time: '14:32:06', level: 'INFO', msg: 'Running health checks...' },
  { time: '14:32:08', level: 'WARN', msg: 'Health check timeout on machine m-3 (retrying)' },
  { time: '14:32:10', level: 'INFO', msg: 'Health check passed on all machines' },
  { time: '14:32:11', level: 'INFO', msg: 'Rolling update: 1/3 machines updated' },
  { time: '14:32:14', level: 'INFO', msg: 'Rolling update: 2/3 machines updated' },
  { time: '14:32:17', level: 'INFO', msg: 'Rolling update: 3/3 machines updated' },
  { time: '14:32:18', level: 'INFO', msg: 'Deployment complete \u2014 all machines healthy' },
];

const machines = [
  { id: 'm-abc123', region: 'iad', state: 'started', cpu: 'shared-cpu-1x', memory: '256 MB', created: '2h ago' },
  { id: 'm-def456', region: 'iad', state: 'started', cpu: 'shared-cpu-1x', memory: '256 MB', created: '2h ago' },
  { id: 'm-ghi789', region: 'iad', state: 'started', cpu: 'shared-cpu-1x', memory: '256 MB', created: '2h ago' },
];

// ─── Severity color map ─────────────────────────────────────────

function levelColor(level) {
  switch (level) {
    case 'WARN': return '_fgwarning';
    case 'ERROR': return '_fgerror';
    case 'SUCCESS': return '_fgsuccess';
    default: return '_fgmuted';
  }
}

// ─── Detail Header ──────────────────────────────────────────────

function DetailHeader() {
  return Card({},
    Card.Body({ class: css('_flex _aic _gap4 _p5 _flexWrap') },
      div({ class: css('_flex _center _w10 _h10 _r2 _bgprimary/10') },
        icon('box', { size: '1.25em', class: css('_fgprimary') })
      ),
      div({ class: css('_flex _col _gap1 _flex1') },
        div({ class: css('_flex _aic _gap3') },
          h2({ class: css('_heading5 _bold') }, app.name),
          Badge({ variant: 'success' }, app.status),
          Chip({ label: app.region, size: 'sm' })
        )
      ),
      div({ class: css('_flex _gap2') },
        Button({ variant: 'ghost', size: 'sm' }, icon('rotate-cw', { size: '1em' }), ' Restart'),
        Button({ variant: 'ghost', size: 'sm' }, icon('maximize', { size: '1em' }), ' Scale'),
        Button({ variant: 'danger', size: 'sm' }, icon('trash-2', { size: '1em' }), ' Destroy')
      )
    )
  );
}

// ─── KPI Grid ───────────────────────────────────────────────────

function KpiGrid() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4') },
    ...kpis.map(kpi =>
      Statistic({
        label: kpi.label,
        value: kpi.value,
        trend: kpi.trend,
        trendValue: kpi.trendValue,
        class: css('lp-card'),
      })
    )
  );
}

// ─── Deploy Log ─────────────────────────────────────────────────

function DeployLog() {
  return Card({},
    Card.Header({ class: css('_flex _aic _jcsb') },
      span({ class: css('_textsm _bold') }, 'Deploy Log'),
      Badge({ variant: 'success' }, 'live')
    ),
    Card.Body({ class: css('_p0') },
      div({ class: css('_bg[#0F0B1A] _fg[#EEEDF5] _r2 _p4 _overflow[auto] _maxh[400px]') },
        pre({ class: css('_m0 _textxs _font[monospace] _lh[1.75]') },
          ...logEntries.map(entry =>
            code({ class: css('_block') },
              span({ class: css('_fgmuted') }, '[' + entry.time + '] '),
              span({ class: css(levelColor(entry.level)) }, entry.level.padEnd(5, ' ')),
              span({}, ' ' + entry.msg)
            )
          )
        )
      )
    )
  );
}

// ─── Machines Table ─────────────────────────────────────────────

function MachinesTable() {
  return Card({},
    Card.Header({},
      span({ class: css('_textsm _bold') }, 'Machines')
    ),
    Card.Body({ class: css('_p0') },
      DataTable({
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'region', label: 'Region' },
          { key: 'state', label: 'State', render: (v) => Badge({ variant: 'success' }, v) },
          { key: 'cpu', label: 'CPU' },
          { key: 'memory', label: 'Memory' },
          { key: 'created', label: 'Created' },
        ],
        data: machines,
        hoverable: true,
      })
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function AppDetailPage() {
  onMount(() => {
    document.title = app.name + ' \u2014 CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    DetailHeader(),
    KpiGrid(),
    div({ class: css('_grid _gc1 _lg:gc2 _gap4') },
      DeployLog(),
      MachinesTable()
    )
  );
}
