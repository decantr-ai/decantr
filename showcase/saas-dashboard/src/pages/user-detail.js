import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, Chip, Statistic, icon } from 'decantr/components';

const { div, span, h2, h3 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const user = {
  name: 'Alice Chen',
  email: 'alice@acme.io',
  role: 'Admin',
  status: 'Active',
  joined: 'Jan 15, 2025',
  avatar: null,
  department: 'Engineering',
  location: 'San Francisco, CA',
};

const userKpis = [
  { label: 'Tasks Completed', value: 342, trend: 'up', trendValue: '+18', ic: 'check-circle' },
  { label: 'Commits', value: 1287, trend: 'up', trendValue: '+64', ic: 'git-commit' },
  { label: 'Reviews', value: 89, trend: 'up', trendValue: '+12', ic: 'eye' },
  { label: 'Uptime', value: 99.8, suffix: '%', trend: 'up', trendValue: '+0.1%', ic: 'activity' },
];

const timeline = [
  { date: 'Mar 18, 2026', title: 'Deployed v2.4.1', desc: 'Released hotfix for auth token refresh', ic: 'rocket', variant: 'success' },
  { date: 'Mar 17, 2026', title: 'Merged PR #142', desc: 'Feature: multi-tenant support', ic: 'git-merge', variant: 'info' },
  { date: 'Mar 16, 2026', title: 'Code Review', desc: 'Reviewed 4 pull requests', ic: 'eye', variant: 'default' },
  { date: 'Mar 15, 2026', title: 'Resolved INC-089', desc: 'Fixed memory leak in worker pool', ic: 'check-circle', variant: 'success' },
  { date: 'Mar 14, 2026', title: 'Sprint Planning', desc: 'Planned Q2 infrastructure migration', ic: 'calendar', variant: 'default' },
  { date: 'Mar 13, 2026', title: 'Security Audit', desc: 'Completed quarterly penetration test', ic: 'shield', variant: 'warning' },
];

const recentActivity = [
  { action: 'Pushed 3 commits to feature/auth', time: '2 min ago', ic: 'git-commit' },
  { action: 'Commented on PR #145', time: '20 min ago', ic: 'message-circle' },
  { action: 'Approved PR #143', time: '1 hour ago', ic: 'check' },
  { action: 'Created branch hotfix/token-refresh', time: '3 hours ago', ic: 'git-branch' },
  { action: 'Updated project documentation', time: '5 hours ago', ic: 'file-text' },
];

// ─── Detail Header ──────────────────────────────────────────────
function DetailHeader() {
  return Card({ class: css('d-glass d-mesh') },
    Card.Body({ class: css('_flex _gap6 _aic _p6 _flexWrap') },
      Avatar({ name: user.name, size: 'xl', class: css('aura-glow') }),
      div({ class: css('_flex _col _gap2 _flex1') },
        div({ class: css('_flex _aic _gap3') },
          h2({ class: css('d-gradient-text _heading4 _bold') }, user.name),
          Chip({ label: user.status, variant: 'success', size: 'sm' })
        ),
        div({ class: css('_flex _gap4 _flexWrap') },
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('briefcase', { size: '1em' }), ` ${user.role} — ${user.department}`),
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('map-pin', { size: '1em' }), ` ${user.location}`),
          span({ class: css('_textsm _fgmuted _flex _aic _gap1') }, icon('mail', { size: '1em' }), ` ${user.email}`),
        ),
        span({ class: css('_textxs _fgmuted') }, `Joined ${user.joined}`)
      ),
      div({ class: css('_flex _gap2') },
        Button({ variant: 'primary', size: 'sm' }, icon('edit', { size: '1em' }), ' Edit Profile'),
        Button({ variant: 'ghost', size: 'sm' }, icon('more-horizontal', { size: '1em' }))
      )
    )
  );
}

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap4 d-stagger-scale') },
    ...userKpis.map(kpi =>
      Statistic({
        label: kpi.label,
        value: kpi.value,
        suffix: kpi.suffix,
        trend: kpi.trend,
        trendValue: kpi.trendValue,
        animate: 1000,
        class: css('d-glass'),
      })
    )
  );
}

// ─── Timeline ───────────────────────────────────────────────────
function Timeline() {
  return div({ class: css('_flex _col _gap3') },
    span({ class: css('d-gradient-text _textsm _bold') }, 'Timeline'),
    div({ class: css('_flex _col _gap1 d-stagger') },
      ...timeline.map(item =>
        div({ class: css('_flex _gap3 _py3 _borderB') },
          div({ class: css('_flex _col _aic _gap1 _w10') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon(item.ic, { size: '1em', class: css('_fgprimary') })
            ),
            div({ class: css('_flex1 _w[2px] _bcborder') })
          ),
          div({ class: css('_flex _col _gap1 _flex1') },
            div({ class: css('_flex _aic _jcsb') },
              h3({ class: css('_textsm _bold') }, item.title),
              span({ class: css('_textxs _fgmuted') }, item.date)
            ),
            span({ class: css('_textxs _fgmuted') }, item.desc)
          )
        )
      )
    )
  );
}

// ─── Activity Feed ──────────────────────────────────────────────
function ActivityFeed() {
  return Card({ class: css('d-glass') },
    Card.Header({},
      span({ class: css('d-gradient-text _textsm _bold') }, 'Recent Activity'),
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...recentActivity.map(item =>
          div({ class: css('_flex _gap3 _aic _py2 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon(item.ic, { size: '1em', class: css('_fgprimary') })
            ),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm') }, item.action),
              span({ class: css('_textxs _fgmuted') }, item.time)
            )
          )
        )
      )
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, `${recentActivity.length} events`),
      Button({ variant: 'ghost', size: 'sm' }, 'View All')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function UserDetailPage() {
  onMount(() => {
    document.title = `${user.name} — SaaS Dashboard`;
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    DetailHeader(),
    KpiGrid(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, Timeline()),
      ActivityFeed()
    )
  );
}
