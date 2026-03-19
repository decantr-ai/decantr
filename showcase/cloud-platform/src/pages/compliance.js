import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Card, Chip, DataTable, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const checklist = [
  { label: '2FA Enabled', status: 'done', ic: 'check' },
  { label: 'SOC 2 Audit', status: 'done', ic: 'check' },
  { label: 'GDPR Data Processing Agreement', status: 'done', ic: 'check' },
  { label: 'Encryption at Rest', status: 'done', ic: 'check' },
  { label: 'VPN Configuration', status: 'pending', ic: 'x' },
  { label: 'Penetration Test', status: 'pending', ic: 'x' },
];

const auditLogs = [
  { event: 'Login from new IP', user: 'Alice Chen', ip: '203.0.113.42', timestamp: 'Mar 18, 2026 09:14', status: 'success' },
  { event: 'Token created: deploy-ci', user: 'Bob Patel', ip: '198.51.100.7', timestamp: 'Mar 17, 2026 16:32', status: 'success' },
  { event: 'Failed login attempt', user: 'unknown', ip: '192.0.2.99', timestamp: 'Mar 17, 2026 03:11', status: 'error' },
  { event: '2FA disabled by admin', user: 'Alice Chen', ip: '203.0.113.42', timestamp: 'Mar 16, 2026 11:45', status: 'warning' },
  { event: 'Role changed: Dan Kim to Viewer', user: 'Eve Torres', ip: '198.51.100.14', timestamp: 'Mar 15, 2026 14:20', status: 'success' },
];

const doneCount = checklist.filter(c => c.status === 'done').length;
const totalCount = checklist.length;

// ─── Compliance Checklist ───────────────────────────────────────
function ComplianceChecklist() {
  return Card({},
    Card.Header({},
      span({ class: css('_textsm _bold') }, 'Compliance Checklist'),
      Badge({ variant: 'default' }, doneCount + '/' + totalCount + ' complete')
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...checklist.map(item =>
          div({ class: css('_flex _aic _gap3 _py3 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 ' + (item.status === 'done' ? '_bgsuccess/10' : '_bgmuted/10')) },
              icon(item.ic, {
                size: '1em',
                class: css(item.status === 'done' ? '_fgsuccess' : '_fgmuted')
              })
            ),
            span({ class: css('_textsm _flex1 _medium') }, item.label),
            Chip({
              label: item.status === 'done' ? 'Complete' : 'Pending',
              variant: item.status === 'done' ? 'success' : 'warning',
              size: 'xs'
            })
          )
        )
      )
    )
  );
}

// ─── Audit Log Table ────────────────────────────────────────────
function AuditLogTable() {
  const statusVariant = (s) => s === 'success' ? 'success' : s === 'error' ? 'error' : 'warning';

  const columns = [
    { key: 'event', label: 'Event', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'ip', label: 'IP Address' },
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  const data = auditLogs.map(log => ({
    event: span({ class: css('_textsm _medium') }, log.event),
    user: log.user,
    ip: span({ class: css('_textxs _font[monospace] _fgmuted') }, log.ip),
    timestamp: log.timestamp,
    status: Badge({ variant: statusVariant(log.status), size: 'sm' }, log.status),
  }));

  return Card({},
    Card.Header({},
      span({ class: css('_textsm _bold') }, 'Audit Log'),
      span({ class: css('_textxs _fgmuted') }, auditLogs.length + ' events')
    ),
    Card.Body({},
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function CompliancePage() {
  onMount(() => {
    document.title = 'Compliance — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    ComplianceChecklist(),
    AuditLogTable()
  );
}
