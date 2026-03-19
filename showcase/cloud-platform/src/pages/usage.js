import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Card, Chip, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const resources = [
  { name: 'CPU', ic: 'cpu', current: 45, max: 100, unit: 'cores', color: '_bgprimary' },
  { name: 'Memory', ic: 'hard-drive', current: 12, max: 32, unit: 'GB', color: '_bgsuccess' },
  { name: 'Storage', ic: 'database', current: 180, max: 500, unit: 'GB', color: '_bgwarning' },
  { name: 'Bandwidth', ic: 'wifi', current: 2.4, max: 10, unit: 'TB', color: '_bginfo' },
];

const cpuData = [
  { time: '00:00', value: 32 }, { time: '04:00', value: 28 },
  { time: '08:00', value: 45 }, { time: '12:00', value: 62 },
  { time: '16:00', value: 55 }, { time: '20:00', value: 41 },
];

const requestData = [
  { time: '00:00', value: 1200 }, { time: '04:00', value: 800 },
  { time: '08:00', value: 3400 }, { time: '12:00', value: 5100 },
  { time: '16:00', value: 4800 }, { time: '20:00', value: 2900 },
];

const usagePercent = (current, max) => Math.round((current / max) * 100);
const usageStatus = (pct) => pct >= 80 ? 'error' : pct >= 60 ? 'warning' : 'success';

// ─── Resource Gauge Card ────────────────────────────────────────
function GaugeCard(resource) {
  const pct = usagePercent(resource.current, resource.max);
  const status = usageStatus(pct);

  return Card({},
    Card.Body({ class: css('_flex _col _gap3') },
      div({ class: css('_flex _aic _jcsb') },
        div({ class: css('_flex _aic _gap2') },
          div({ class: css('_w8 _h8 _flex _center _r2 _bgprimary/10') },
            icon(resource.ic, { size: '1em', class: css('_fgprimary') })
          ),
          span({ class: css('_textsm _bold') }, resource.name)
        ),
        Chip({ label: pct + '%', variant: status, size: 'xs' })
      ),
      div({ class: css('_flex _col _gap1') },
        div({ class: css('_w[100%] _h[8px] _r1 _bgmuted/20 _overflow[hidden]') },
          div({ class: css('_h[100%] _r1 ' + resource.color), style: 'width: ' + pct + '%' })
        ),
        div({ class: css('_flex _jcsb') },
          span({ class: css('_textxs _fgmuted') }, resource.current + ' ' + resource.unit + ' used'),
          span({ class: css('_textxs _fgmuted') }, resource.max + ' ' + resource.unit + ' total')
        )
      )
    )
  );
}

// ─── Resource Gauge Grid ────────────────────────────────────────
function GaugeGrid() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('_heading5 _bold') }, 'Resource Usage'),
      Badge({ variant: 'default' }, 'Current Period')
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger') },
      ...resources.map(r => GaugeCard(r))
    )
  );
}

// ─── Chart Grid ─────────────────────────────────────────────────
function ChartGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading5 _bold') }, 'Usage Trends'),
    div({ class: css('_grid _gc1 _md:gc2 _gap4 d-stagger-up') },
      Card({},
        Card.Header({},
          span({ class: css('_textsm _bold') }, 'CPU Usage'),
          Chip({ label: 'Last 24h', size: 'xs' })
        ),
        Card.Body({},
          Chart({ type: 'area', data: cpuData, x: 'time', y: 'value', height: 240 })
        )
      ),
      Card({},
        Card.Header({},
          span({ class: css('_textsm _bold') }, 'Request Volume'),
          Chip({ label: 'Last 24h', size: 'xs' })
        ),
        Card.Body({},
          Chart({ type: 'bar', data: requestData, x: 'time', y: 'value', height: 240 })
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function UsagePage() {
  onMount(() => {
    document.title = 'Usage — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    GaugeGrid(),
    ChartGrid()
  );
}
