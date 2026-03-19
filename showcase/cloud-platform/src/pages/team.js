import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, Chip, Input, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const members = [
  { name: 'Alice Chen', email: 'alice@cloudlaunch.io', role: 'Admin', status: 'active' },
  { name: 'Bob Patel', email: 'bob@cloudlaunch.io', role: 'Developer', status: 'active' },
  { name: 'Carol Liu', email: 'carol@cloudlaunch.io', role: 'Developer', status: 'active' },
  { name: 'Dan Kim', email: 'dan@cloudlaunch.io', role: 'Viewer', status: 'active' },
  { name: 'Eve Torres', email: 'eve@cloudlaunch.io', role: 'Admin', status: 'invited' },
  { name: 'Frank Moore', email: 'frank@cloudlaunch.io', role: 'Developer', status: 'active' },
];

const roleVariant = (r) => r === 'Admin' ? 'error' : r === 'Developer' ? 'primary' : 'default';
const statusVariant = (s) => s === 'active' ? 'success' : 'warning';

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const roles = ['All', 'Admin', 'Developer', 'Viewer'];

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search members...', class: css('_w[240px]') }),
    div({ class: css('_flex _gap2') },
      ...roles.map(role =>
        Chip({
          label: role,
          variant: role === 'All' ? 'primary' : 'default',
          size: 'sm',
          class: css('_cursor[pointer]')
        })
      )
    ),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' },
      icon('user-plus', { size: '1em' }), ' Invite Member'
    )
  );
}

// ─── Member Card ────────────────────────────────────────────────
function MemberCard(member) {
  return Card({ hover: true },
    Card.Body({ class: css('_flex _col _aic _gap3 _p6 _tc') },
      Avatar({ name: member.name, size: 'lg' }),
      div({ class: css('_flex _col _aic _gap1') },
        span({ class: css('_textsm _bold') }, member.name),
        span({ class: css('_textxs _fgmuted') }, member.email)
      ),
      div({ class: css('_flex _gap2 _aic') },
        Badge({ variant: roleVariant(member.role), size: 'sm' }, member.role),
        Chip({ label: member.status, variant: statusVariant(member.status), size: 'xs' })
      ),
      div({ class: css('_flex _gap2 _pt2 _borderT _wfull _jcc') },
        Button({ variant: 'ghost', size: 'sm' },
          icon('mail', { size: '1em' })
        ),
        Button({ variant: 'ghost', size: 'sm' },
          icon('more-horizontal', { size: '1em' })
        )
      )
    )
  );
}

// ─── Member Grid ────────────────────────────────────────────────
function MemberGrid() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('_heading5 _bold') }, 'Team Members'),
      Badge({ variant: 'default' }, members.length + ' members')
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc3 _gap4 d-stagger-up') },
      ...members.map(m => MemberCard(m))
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function TeamPage() {
  onMount(() => {
    document.title = 'Team — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    FilterBar(),
    MemberGrid()
  );
}
