import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, Chip, DataTable, Input, Select, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const members = [
  { name: 'Alice Chen', role: 'Lead Engineer', status: 'Active', avatar: null, team: 'Platform', commits: 142, tasks: 38 },
  { name: 'Bob Patel', role: 'Backend Engineer', status: 'Active', avatar: null, team: 'Platform', commits: 98, tasks: 27 },
  { name: 'Carol Liu', role: 'UI Designer', status: 'Active', avatar: null, team: 'Design', commits: 45, tasks: 52 },
  { name: 'Dan Kim', role: 'DevOps Engineer', status: 'Away', avatar: null, team: 'Infrastructure', commits: 76, tasks: 19 },
  { name: 'Eve Torres', role: 'SRE', status: 'Active', avatar: null, team: 'Infrastructure', commits: 112, tasks: 31 },
  { name: 'Frank Wu', role: 'Product Manager', status: 'Active', avatar: null, team: 'Product', commits: 12, tasks: 64 },
  { name: 'Grace Park', role: 'Frontend Engineer', status: 'Offline', avatar: null, team: 'Platform', commits: 87, tasks: 22 },
  { name: 'Hiro Tanaka', role: 'Security Engineer', status: 'Active', avatar: null, team: 'Infrastructure', commits: 63, tasks: 41 },
];

const teamTableData = [
  { team: 'Platform', members: 3, activeSprint: 'Sprint 24', velocity: 42, completion: '78%' },
  { team: 'Infrastructure', members: 3, activeSprint: 'Sprint 24', velocity: 38, completion: '85%' },
  { team: 'Design', members: 1, activeSprint: 'Sprint 24', velocity: 28, completion: '92%' },
  { team: 'Product', members: 1, activeSprint: 'Sprint 24', velocity: 15, completion: '70%' },
];

const statusVariant = (s) => s === 'Active' ? 'success' : s === 'Away' ? 'warning' : 'default';

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [search, setSearch] = createSignal('');
  const [team, setTeam] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search team members...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: team, onchange: v => setTeam(v), options: [
      { label: 'All Teams', value: 'all' },
      { label: 'Platform', value: 'platform' },
      { label: 'Infrastructure', value: 'infra' },
      { label: 'Design', value: 'design' },
      { label: 'Product', value: 'product' },
    ] }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' }, icon('user-plus', { size: '1em' }), ' Invite Member')
  );
}

// ─── Member Card Grid ───────────────────────────────────────────
function MemberGrid() {
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('d-gradient-text _heading5 _bold') }, 'Team Members'),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc3 _xl:gc4 _gap4 d-stagger-up') },
      ...members.map(m =>
        Card({ hover: true, class: css('d-glass') },
          Card.Body({ class: css('_flex _col _aic _gap3 _p6 _tc') },
            Avatar({ name: m.name, size: 'lg', class: css('aura-glow') }),
            div({ class: css('_flex _col _aic _gap1') },
              span({ class: css('_textsm _bold') }, m.name),
              span({ class: css('_textxs _fgmuted') }, m.role),
            ),
            div({ class: css('_flex _gap2 _aic') },
              Badge({ variant: 'default' }, m.team),
              Chip({ label: m.status, variant: statusVariant(m.status), size: 'xs' })
            ),
            div({ class: css('_flex _gap4 _pt2 _borderT _w[100%] _jcc') },
              div({ class: css('_flex _col _aic') },
                span({ class: css('_textsm _bold _fgprimary') }, `${m.commits}`),
                span({ class: css('_textxs _fgmuted') }, 'Commits')
              ),
              div({ class: css('_flex _col _aic') },
                span({ class: css('_textsm _bold _fgprimary') }, `${m.tasks}`),
                span({ class: css('_textxs _fgmuted') }, 'Tasks')
              ),
            )
          )
        )
      )
    )
  );
}

// ─── Team Table ─────────────────────────────────────────────────
function TeamTable() {
  const columns = [
    { key: 'team', label: 'Team', sortable: true },
    { key: 'members', label: 'Members', sortable: true },
    { key: 'activeSprint', label: 'Sprint', sortable: true },
    { key: 'velocity', label: 'Velocity', sortable: true },
    { key: 'completion', label: 'Completion', sortable: true },
  ];

  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Team Performance'),
      span({ class: css('_textxs _fgmuted') }, `${teamTableData.length} teams`)
    ),
    Card.Body({},
      DataTable({ columns, data: teamTableData, sortable: true, paginate: true, pageSize: 10 })
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, 'Updated just now'),
      Button({ variant: 'ghost', size: 'sm' }, icon('download', { size: '1em' }), ' Export')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function TeamsPage() {
  onMount(() => {
    document.title = 'Teams — SaaS Dashboard';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    FilterBar(),
    MemberGrid(),
    TeamTable()
  );
}
