import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { cond, onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Input, icon } from 'decantr/components';

const { div, span, h2, p } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const notifications = [
  { id: 1, ic: 'rocket', title: 'Deployment Successful', preview: 'v2.4.1 deployed to production cluster us-east-1.', body: 'Version 2.4.1 has been successfully deployed to the production cluster us-east-1. All health checks passed. Rollback window expires in 30 minutes. Memory usage is nominal at 67%. No errors detected in the first 500 requests.', time: '2 min ago', read: false, category: 'deploy' },
  { id: 2, ic: 'alert-triangle', title: 'CPU Alert Triggered', preview: 'Worker node-03 exceeded 90% CPU for 5 minutes.', body: 'Worker node-03 has exceeded the 90% CPU utilization threshold for a sustained period of 5 minutes. Auto-scaling has been triggered and a new instance is being provisioned. Current request queue depth: 142. Estimated recovery: 3 minutes.', time: '15 min ago', read: false, category: 'alert' },
  { id: 3, ic: 'user-plus', title: 'New Team Member', preview: 'Grace Park joined the Engineering team.', body: 'Grace Park has been added to the Engineering team with the role of Senior Backend Engineer. Default permissions have been applied. Please review and adjust access levels as needed. Onboarding checklist has been sent to their email.', time: '1 hour ago', read: false, category: 'team' },
  { id: 4, ic: 'git-merge', title: 'PR #142 Merged', preview: 'Feature branch auth-v2 merged into main.', body: 'Pull request #142 "Implement OAuth2 PKCE flow" has been merged into main by Bob Patel. 14 files changed, 892 insertions, 234 deletions. All CI checks passed. Staging deployment will begin automatically.', time: '2 hours ago', read: true, category: 'code' },
  { id: 5, ic: 'shield', title: 'Security Scan Complete', preview: 'No critical vulnerabilities found in latest scan.', body: 'The scheduled security scan completed successfully. 0 critical, 0 high, 2 medium, and 5 low severity findings. The medium findings relate to outdated dependencies in the dev toolchain and do not affect production. Full report available in the security dashboard.', time: '3 hours ago', read: true, category: 'security' },
  { id: 6, ic: 'database', title: 'Database Backup Complete', preview: 'Daily backup for prod-db-01 completed successfully.', body: 'Daily automated backup for prod-db-01 completed in 4 minutes 23 seconds. Backup size: 12.4 GB (compressed). Stored in us-east-1-backups bucket with 90-day retention. Integrity check passed. Point-in-time recovery available for the last 7 days.', time: '4 hours ago', read: true, category: 'infra' },
  { id: 7, ic: 'credit-card', title: 'Invoice Paid', preview: 'March invoice for $79.00 has been processed.', body: 'Your March invoice for $79.00 (Pro Plan) has been successfully charged to Visa ending in 4242. Receipt has been sent to billing@acme.io. Next invoice date: April 1, 2026.', time: '6 hours ago', read: true, category: 'billing' },
  { id: 8, ic: 'bar-chart', title: 'Weekly Report Ready', preview: 'Your analytics summary for the week of Mar 10 is available.', body: 'Weekly analytics summary is ready. Highlights: 12% increase in active users, 8.3% revenue growth, 99.97% uptime. Top performing channel: Organic Search (+18%). Full breakdown available in the Reports section.', time: '1 day ago', read: true, category: 'report' },
  { id: 9, ic: 'zap', title: 'Rate Limit Warning', preview: 'API endpoint /v2/search approaching rate limit threshold.', body: 'The /v2/search endpoint has reached 85% of its rate limit quota (8,500/10,000 requests per minute). Consider implementing caching or increasing the limit. Top consumers: mobile-app (4,200 rpm), web-dashboard (2,800 rpm), partner-api (1,500 rpm).', time: '1 day ago', read: true, category: 'alert' },
  { id: 10, ic: 'check-circle', title: 'Incident Resolved', preview: 'INC-089 resolved — latency returned to normal.', body: 'Incident INC-089 has been resolved. Root cause: misconfigured connection pool in the read replica. Fix applied by Carol Liu. Total downtime: 0 minutes (degraded performance for 12 minutes). Post-mortem scheduled for Thursday.', time: '2 days ago', read: true, category: 'incident' },
  { id: 11, ic: 'settings', title: 'Config Change Detected', preview: 'Environment variable DATABASE_POOL_SIZE changed in production.', body: 'A configuration change was detected in the production environment. DATABASE_POOL_SIZE was changed from 20 to 50 by admin user hiro@acme.io. Change was applied via the settings panel. All services have been gracefully restarted.', time: '2 days ago', read: true, category: 'config' },
];

// ─── Notification List Item ─────────────────────────────────────
function NotifItem(notif, selected, onSelect) {
  const isActive = () => selected() === notif.id;

  return div({
    class: () => css(`_flex _gap3 _p3 _r2 _cursor[pointer] _trans ${isActive() ? '_bgprimary/10 _bcprimary/30 _b1' : '_bgbg/50'}`),
    onclick: () => onSelect(notif.id),
  },
    div({ class: css('_flex _col _center _shrink0') },
      notif.read
        ? div({ class: css('_w[8px] _h[8px] _rfull _bgbg') })
        : div({ class: css('_w[8px] _h[8px] _rfull _bgprimary aura-glow') })
    ),
    div({ class: css('_flex _center _shrink0 _w8 _h8 _r2 _bgprimary/10') },
      icon(notif.ic, { size: '1em', class: css('_fgprimary') })
    ),
    div({ class: css('_flex _col _gap1 _flex1 _overflow[hidden]') },
      div({ class: css('_flex _aic _jcsb _gap2') },
        span({ class: css(`_textsm ${notif.read ? '_fgmuted' : '_bold'}`) }, notif.title),
        span({ class: css('_textxs _fgmuted _shrink0') }, notif.time),
      ),
      span({ class: css('_textxs _fgmuted _truncate') }, notif.preview)
    )
  );
}

// ─── Notification Detail ────────────────────────────────────────
function NotifDetail(selected) {
  const notif = () => notifications.find(n => n.id === selected());

  return Card({ class: css('d-glass _flex _col _flex1') },
    Card.Header({ class: css('_flex _aic _jcsb') },
      cond(() => !!notif(),
        () => div({ class: css('_flex _aic _gap3') },
          div({ class: css('_flex _center _w10 _h10 _r2 _bgprimary/10') },
            icon(notif().ic, { size: '1.2em', class: css('_fgprimary') })
          ),
          div({ class: css('_flex _col') },
            span({ class: css('_bold') }, notif().title),
            span({ class: css('_textxs _fgmuted') }, notif().time)
          )
        ),
        () => span({ class: css('_fgmuted') }, 'Select a notification')
      )
    ),
    Card.Body({ class: css('_flex _col _gap4 _flex1') },
      cond(() => !!notif(),
        () => div({ class: css('_flex _col _gap4') },
          p({ class: css('_textsm _leading[1.7]') }, notif().body),
          div({ class: css('_flex _gap2') },
            Button({ variant: 'outline', size: 'sm' }, icon('check', { size: '1em' }), ' Mark Read'),
            Button({ variant: 'outline', size: 'sm' }, icon('archive', { size: '1em' }), ' Archive'),
            Button({ variant: 'ghost', size: 'sm', class: css('_fgerror') }, icon('trash-2', { size: '1em' }), ' Delete')
          )
        ),
        () => div({ class: css('_flex _center _flex1 _fgmuted _textsm') },
          span({}, 'Choose a notification from the list to view details.')
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [selected, setSelected] = createSignal(1);
  const [search, setSearch] = createSignal('');

  onMount(() => { document.title = 'Notifications — SaaS Dashboard'; });

  const unreadCount = notifications.filter(n => !n.read).length;

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      div({ class: css('_flex _aic _gap3') },
        h2({ class: css('d-gradient-text _heading5') }, 'Notifications'),
        Badge({ variant: 'primary', size: 'sm' }, `${unreadCount} unread`)
      ),
      Button({ variant: 'outline', size: 'sm' }, icon('check-check', { size: '1em' }), ' Mark All Read')
    ),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4 _flex1') },
      div({ class: css('_flex _col _gap3 _span1') },
        Input({ placeholder: 'Search notifications...', value: search, onchange: e => setSearch(e.target.value) }),
        Card({ class: css('d-glass _flex _col _flex1 _overflow[hidden]') },
          Card.Body({ class: css('_flex _col _gap1 _overflow[auto] _mh[600px] d-stagger') },
            ...notifications.map(n => NotifItem(n, selected, setSelected))
          )
        )
      ),
      div({ class: css('_span1 _lg:span2') },
        NotifDetail(selected)
      )
    )
  );
}
