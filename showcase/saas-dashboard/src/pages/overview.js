import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Select, Statistic, icon } from 'decantr/components';
import { Chart } from 'decantr/chart';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const kpis = [
  { label: 'REVENUE', value: 1248500, prefix: '$', trend: 'up', trendValue: '+12.5%', ic: 'dollar-sign' },
  { label: 'ACTIVE USERS', value: 84230, trend: 'up', trendValue: '+8.1%', ic: 'users' },
  { label: 'ORDERS', value: 6420, trend: 'down', trendValue: '-2.3%', ic: 'shopping-cart' },
  { label: 'CONVERSION', value: 3.24, suffix: '%', trend: 'up', trendValue: '+0.5%', ic: 'target' },
];

const revenueData = [
  { date: 'Jan', value: 42000 }, { date: 'Feb', value: 51000 },
  { date: 'Mar', value: 48000 }, { date: 'Apr', value: 62000 },
  { date: 'May', value: 58000 }, { date: 'Jun', value: 71000 },
];
const ordersData = [
  { month: 'Jan', count: 120 }, { month: 'Feb', count: 145 },
  { month: 'Mar', count: 132 }, { month: 'Apr', count: 168 },
  { month: 'May', count: 155 }, { month: 'Jun', count: 192 },
];
const activities = [
  { user: 'Alice Chen', action: 'deployed v2.4.1 to production', time: '2 min ago', variant: 'success', ic: 'rocket' },
  { user: 'Bob Patel', action: 'opened pull request #142', time: '15 min ago', variant: 'default', ic: 'git-pull-request' },
  { user: 'Carol Liu', action: 'resolved incident INC-089', time: '1 hour ago', variant: 'success', ic: 'check-circle' },
  { user: 'Dan Kim', action: 'merged branch feature/auth', time: '3 hours ago', variant: 'default', ic: 'git-merge' },
  { user: 'Eve Torres', action: 'triggered alert: CPU > 90%', time: '4 hours ago', variant: 'error', ic: 'alert-triangle' },
];

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap3') },
    div({ class: css('_flex _aic _jcsb') },
      div({ class: css('_flex _aic _gap2') },
        span({ class: css('cc-indicator cc-indicator-ok cc-blink') }),
        h2({ class: css('cc-label _fgmutedfg') }, 'SYSTEM METRICS')
      ),
      span({ class: css('cc-data _textxs _fgmuted') }, new Date().toLocaleTimeString())
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap3 d-stagger-scale') },
      ...kpis.map(kpi =>
        Statistic({
          label: kpi.label,
          value: kpi.value,
          prefix: kpi.prefix,
          suffix: kpi.suffix,
          trend: kpi.trend,
          trendValue: kpi.trendValue,
          animate: 1200,
          class: css('cc-glow'),
        })
      )
    )
  );
}

// ─── Chart Grid ─────────────────────────────────────────────────
function ChartGrid() {
  return div({ class: css('_flex _col _gap3') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('cc-label _fgmutedfg') }, 'ANALYTICS'),
      Select({ value: '30d', options: [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
      ] })
    ),
    div({ class: css('_grid _gc1 _md:gc2 _gap3 d-stagger-up') },
      Card({ hover: true, class: css('cc-scanline') },
        Card.Header({ class: css('cc-bar') },
          span({ class: css('cc-label') }, 'REVENUE TREND'),
          span({ class: css('cc-data cc-blink _textxs') }, 'LIVE')
        ),
        Card.Body({},
          Chart({ type: 'area', data: revenueData, x: 'date', y: 'value', height: 240 })
        )
      ),
      Card({ hover: true, class: css('cc-scanline') },
        Card.Header({ class: css('cc-bar') },
          span({ class: css('cc-label') }, 'ORDER VOLUME'),
          span({ class: css('cc-indicator cc-indicator-ok') })
        ),
        Card.Body({},
          Chart({ type: 'bar', data: ordersData, x: 'month', y: 'count', height: 240 })
        )
      ),
    )
  );
}

// ─── Activity Feed ──────────────────────────────────────────────
function ActivityFeed() {
  return Card({ class: css('cc-scanline') },
    Card.Header({ class: css('cc-bar') },
      span({ class: css('cc-label') }, 'SIGNAL LOG'),
      span({ class: css('cc-data cc-blink _textxs') }, 'STREAMING')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...activities.map(item =>
          div({ class: css('_flex _gap3 _aic _py2 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon(item.ic, { size: '1em', class: css('_fgprimary') })
            ),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm') },
                span({ class: css('_medium') }, item.user),
                span({ class: css('_fgmuted') }, ` ${item.action}`)
              ),
              span({ class: css('cc-data _textxs _fgmuted') }, item.time)
            ),
            Chip({
              label: item.variant === 'success' ? 'OK' : item.variant === 'error' ? 'ALERT' : 'INFO',
              variant: item.variant === 'success' ? 'success' : item.variant === 'error' ? 'error' : 'info',
              size: 'xs'
            })
          )
        )
      )
    ),
    Card.Footer({ class: css('cc-bar-bottom') },
      span({ class: css('cc-label _textxs _fgmuted') }, `${activities.length} SIGNALS`),
      Button({ variant: 'ghost', size: 'sm', class: css('cc-label _textxs') }, 'LOAD MORE')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function OverviewPage() {
  onMount(() => {
    document.title = 'Overview — Command Center';
  });

  return div({ class: css('d-page-enter _flex _col _gap3') },
    KpiGrid(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap3') },
      div({ class: css('_span1 _lg:span2') }, ChartGrid()),
      ActivityFeed()
    )
  );
}
