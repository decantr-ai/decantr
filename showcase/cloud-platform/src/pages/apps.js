import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { cond, onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { navigate } from 'decantr/router';
import { Badge, Button, Card, Chip, Input, Modal, icon } from 'decantr/components';

const { div, span, h2, label, select, option } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const apps = [
  { name: 'api-gateway', status: 'deployed', cpu: 2, memory: 512, machines: 3, region: 'iad' },
  { name: 'web-frontend', status: 'deployed', cpu: 1, memory: 256, machines: 2, region: 'sjc' },
  { name: 'worker-service', status: 'deployed', cpu: 4, memory: 1024, machines: 5, region: 'ams' },
  { name: 'staging-api', status: 'pending', cpu: 1, memory: 256, machines: 1, region: 'iad' },
  { name: 'ml-inference', status: 'deployed', cpu: 8, memory: 4096, machines: 2, region: 'sjc' },
  { name: 'cron-scheduler', status: 'suspended', cpu: 1, memory: 128, machines: 1, region: 'iad' },
];

const activityFeed = [
  { user: 'Alice Chen', action: 'deployed api-gateway v3.2.0', time: '4 min ago', status: 'success' },
  { user: 'Bob Patel', action: 'scaled worker-service to 5 machines', time: '22 min ago', status: 'success' },
  { user: 'Carol Liu', action: 'suspended cron-scheduler', time: '1 hour ago', status: 'warning' },
  { user: 'Dan Kim', action: 'created staging-api', time: '3 hours ago', status: 'info' },
  { user: 'Eve Torres', action: 'deployed ml-inference v1.8.0', time: '5 hours ago', status: 'success' },
];

const statusVariant = (s) => s === 'deployed' ? 'success' : s === 'pending' ? 'warning' : 'error';
const statusLabel = (s) => s === 'deployed' ? 'Deployed' : s === 'pending' ? 'Pending' : 'Suspended';
const fmtMemory = (mb) => mb >= 1024 ? (mb / 1024) + ' GB' : mb + ' MB';

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar({ onLaunch }) {
  const [search, setSearch] = createSignal('');
  const [filter, setFilter] = createSignal('all');

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Deployed', value: 'deployed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
  ];

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({
      placeholder: 'Search apps...',
      value: search,
      onchange: e => setSearch(e.target.value),
      class: css('_w[240px]')
    }),
    div({ class: css('_flex _gap2 _aic') },
      ...filters.map(f =>
        label({ class: css('_flex _aic _gap1 _textsm _cursor[pointer]') },
          div({
            class: () => css('_w[16px] _h[16px] _r1 _border _flex _center _cursor[pointer] ' + (filter() === f.value ? '_bgprimary _bcprimary' : '_bcborder')),
            onclick: () => setFilter(f.value)
          },
            cond(() => filter() === f.value,
              () => icon('check', { size: '0.7em', class: css('_fg[#fff]') })
            )
          ),
          span({}, f.label)
        )
      )
    ),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm', onclick: onLaunch },
      icon('rocket', { size: '1em' }), ' Launch App'
    )
  );
}

// ─── App Card ───────────────────────────────────────────────────
function AppCard(app) {
  return Card({
    hover: true,
    class: css('_cursor[pointer]'),
    onclick: () => navigate('/apps/' + app.name)
  },
    Card.Body({ class: css('_flex _col _gap3') },
      div({ class: css('_flex _aic _jcsb') },
        div({ class: css('_flex _aic _gap2') },
          div({ class: css('_w8 _h8 _flex _center _r2 _bgprimary/10') },
            icon('box', { size: '1em', class: css('_fgprimary') })
          ),
          span({ class: css('_medium _textsm') }, app.name)
        ),
        Badge({ variant: statusVariant(app.status), size: 'sm' }, statusLabel(app.status))
      ),
      div({ class: css('_flex _gap2 _flexWrap') },
        Chip({ size: 'xs', variant: 'default' },
          icon('cpu', { size: '0.8em' }), ' ' + app.cpu + ' CPU'
        ),
        Chip({ size: 'xs', variant: 'default' },
          icon('hard-drive', { size: '0.8em' }), ' ' + fmtMemory(app.memory)
        ),
        Chip({ size: 'xs', variant: 'default' },
          icon('server', { size: '0.8em' }), ' ' + app.machines + (app.machines === 1 ? ' machine' : ' machines')
        ),
        Chip({ size: 'xs', variant: 'default' },
          icon('globe', { size: '0.8em' }), ' ' + app.region.toUpperCase()
        )
      )
    )
  );
}

// ─── App Grid ───────────────────────────────────────────────────
function AppGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading5 _bold') }, 'Your Apps'),
    div({ class: css('_grid _gc1 _sm:gc2 _gap4 d-stagger') },
      ...apps.map(app => AppCard(app))
    )
  );
}

// ─── Activity Feed ──────────────────────────────────────────────
function ActivityFeed() {
  return Card({},
    Card.Header({},
      span({ class: css('_textsm _bold') }, 'Recent Activity')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...activityFeed.map(item =>
          div({ class: css('_flex _gap3 _aic _py2 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon('rocket', { size: '1em', class: css('_fgprimary') })
            ),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm') },
                span({ class: css('_medium') }, item.user),
                span({ class: css('_fgmuted') }, ' ' + item.action)
              ),
              span({ class: css('_textxs _fgmuted') }, item.time)
            ),
            Chip({
              label: item.status === 'success' ? 'OK' : item.status === 'warning' ? 'WARN' : 'INFO',
              variant: item.status === 'success' ? 'success' : item.status === 'warning' ? 'warning' : 'info',
              size: 'xs'
            })
          )
        )
      )
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, activityFeed.length + ' events'),
      Button({ variant: 'ghost', size: 'sm', onclick: () => navigate('/activity') }, 'View All')
    )
  );
}

// ─── Launch Modal ───────────────────────────────────────────────
function LaunchModal({ visible, onClose }) {
  const [appName, setAppName] = createSignal('');
  const [region, setRegion] = createSignal('iad');
  const [machineSize, setMachineSize] = createSignal('shared-1x');

  return Modal({
    visible,
    onClose,
    title: 'Launch New App',
    footer: [
      Button({ variant: 'outline', onclick: onClose }, 'Cancel'),
      Button({ variant: 'primary', onclick: onClose },
        icon('rocket', { size: '1em' }), ' Deploy'
      )
    ]
  },
    div({ class: css('_flex _col _gap4') },
      Input({
        label: 'App Name',
        placeholder: 'my-awesome-app',
        value: appName,
        onchange: e => setAppName(e.target.value)
      }),
      div({ class: css('_flex _col _gap1') },
        span({ class: css('_textsm _medium') }, 'Region'),
        select({
          class: css('_p2 _r2 _border _bcborder _bgbg _textsm'),
          value: region,
          onchange: e => setRegion(e.target.value)
        },
          option({ value: 'iad' }, 'US East (IAD)'),
          option({ value: 'sjc' }, 'US West (SJC)'),
          option({ value: 'ams' }, 'EU West (AMS)'),
          option({ value: 'nrt' }, 'AP Northeast (NRT)')
        )
      ),
      div({ class: css('_flex _col _gap1') },
        span({ class: css('_textsm _medium') }, 'Machine Size'),
        select({
          class: css('_p2 _r2 _border _bcborder _bgbg _textsm'),
          value: machineSize,
          onchange: e => setMachineSize(e.target.value)
        },
          option({ value: 'shared-1x' }, 'Shared 1x - 1 CPU / 256 MB'),
          option({ value: 'shared-2x' }, 'Shared 2x - 2 CPU / 512 MB'),
          option({ value: 'performance-1x' }, 'Performance 1x - 2 CPU / 4 GB'),
          option({ value: 'performance-2x' }, 'Performance 2x - 4 CPU / 8 GB'),
          option({ value: 'performance-4x' }, 'Performance 4x - 8 CPU / 16 GB')
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function AppsPage() {
  const [modalVisible, setModalVisible] = createSignal(false);

  onMount(() => {
    document.title = 'Apps — Cloud Platform';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    FilterBar({ onLaunch: () => setModalVisible(true) }),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, AppGrid()),
      ActivityFeed()
    ),
    LaunchModal({ visible: modalVisible, onClose: () => setModalVisible(false) })
  );
}
