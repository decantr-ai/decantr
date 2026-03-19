import { tags } from 'decantr/tags';
import { list, onMount } from 'decantr/core';
import { createSignal, createMemo } from 'decantr/state';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Input, Segmented, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const activities = [
  { user: 'Alice Chen', action: 'deployed api-gateway v3.2.0 to production', time: '4 min ago', type: 'Deploys', ic: 'rocket', variant: 'success' },
  { user: 'Bob Patel', action: 'updated environment variables on worker-service', time: '18 min ago', type: 'Config', ic: 'settings', variant: 'default' },
  { user: 'Carol Liu', action: 'invited eve@cloudlaunch.io to the organization', time: '45 min ago', type: 'Team', ic: 'user-plus', variant: 'info' },
  { user: 'Dan Kim', action: 'scaled ml-inference to 4 machines', time: '1 hour ago', type: 'Deploys', ic: 'maximize', variant: 'success' },
  { user: 'Eve Torres', action: 'rotated deploy-ci access token', time: '2 hours ago', type: 'Config', ic: 'key', variant: 'warning' },
  { user: 'Alice Chen', action: 'deployed web-frontend v2.1.0 to staging', time: '3 hours ago', type: 'Deploys', ic: 'rocket', variant: 'success' },
  { user: 'Frank Moore', action: 'changed Bob Patel role from Viewer to Developer', time: '5 hours ago', type: 'Team', ic: 'shield', variant: 'info' },
  { user: 'Bob Patel', action: 'triggered manual deploy of cron-scheduler', time: '6 hours ago', type: 'Deploys', ic: 'play', variant: 'success' },
];

// ─── Page ───────────────────────────────────────────────────────
export default function ActivityPage() {
  const [search, setSearch] = createSignal('');
  const [typeFilter, setTypeFilter] = createSignal('All');

  const filtered = createMemo(() => {
    const q = search().toLowerCase();
    const t = typeFilter();
    return activities.filter(a =>
      (t === 'All' || a.type === t) &&
      (!q || a.user.toLowerCase().includes(q) || a.action.toLowerCase().includes(q))
    );
  });

  onMount(() => {
    document.title = 'Activity — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    // Filter bar
    div({ class: css('_flex _gap3 _aic _flexWrap') },
      Input({
        placeholder: 'Search activity...',
        class: css('_w[240px]'),
        oninput: (e) => setSearch(e.target.value)
      }),
      Segmented({
        options: [
          { value: 'All', label: 'All' },
          { value: 'Deploys', label: 'Deploys' },
          { value: 'Config', label: 'Config' },
          { value: 'Team', label: 'Team' },
        ],
        value: typeFilter,
        onchange: setTypeFilter
      }),
      div({ class: css('_flex1') }),
      Button({ variant: 'ghost', size: 'sm' },
        icon('download', { size: '1em' }), ' Export'
      )
    ),
    // Activity feed
    div({ class: css('_flex _col _gap4') },
      div({ class: css('_flex _aic _jcsb') },
        h2({ class: css('_heading5 _bold') }, 'Organization Activity'),
        Badge({ variant: 'default' }, () => filtered().length + ' events')
      ),
      list(filtered, (item) => item.user + item.action, (item) =>
        div({ class: css('_flex _gap3 _aic _py3 _borderB') },
          Avatar({ name: item.user, size: 'sm' }),
          div({ class: css('_flex _col _flex1') },
            span({ class: css('_textsm') },
              span({ class: css('_bold') }, item.user),
              span({ class: css('_fgmuted') }, ' ' + item.action)
            ),
            span({ class: css('_textxs _fgmuted') }, item.time)
          ),
          Badge({ variant: item.variant, size: 'sm' }, item.type)
        )
      )
    )
  );
}
