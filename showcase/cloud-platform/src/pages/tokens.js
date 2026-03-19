import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, DataTable, Input, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const tokens = [
  { name: 'deploy-ci', token: 'cl_****7f3a', scope: 'deploy', created: 'Jan 15, 2026', lastUsed: '2 min ago' },
  { name: 'read-only-api', token: 'cl_****b2e1', scope: 'read', created: 'Feb 3, 2026', lastUsed: '1 hour ago' },
  { name: 'admin-cli', token: 'cl_****9d4c', scope: 'admin', created: 'Dec 8, 2025', lastUsed: '15 min ago' },
  { name: 'staging-deploy', token: 'cl_****a1f0', scope: 'deploy', created: 'Mar 1, 2026', lastUsed: '3 hours ago' },
  { name: 'monitoring-agent', token: 'cl_****e8b5', scope: 'read', created: 'Feb 20, 2026', lastUsed: '30 sec ago' },
];

const scopeVariant = (s) => s === 'admin' ? 'error' : s === 'deploy' ? 'warning' : 'default';

// ─── Toolbar ────────────────────────────────────────────────────
function Toolbar() {
  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search tokens...', class: css('_w[240px]') }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' },
      icon('plus', { size: '1em' }), ' Create Token'
    )
  );
}

// ─── Tokens Table ───────────────────────────────────────────────
function TokensTable() {
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'token', label: 'Token' },
    { key: 'scope', label: 'Scope', sortable: true },
    { key: 'created', label: 'Created', sortable: true },
    { key: 'lastUsed', label: 'Last Used', sortable: true },
    { key: 'actions', label: 'Actions' },
  ];

  const data = tokens.map(t => ({
    name: span({ class: css('_medium _textsm') }, t.name),
    token: span({ class: css('_textxs _fgmuted _font[monospace]') }, t.token),
    scope: Badge({ variant: scopeVariant(t.scope), size: 'sm' }, t.scope),
    created: t.created,
    lastUsed: t.lastUsed,
    actions: Button({ variant: 'ghost', size: 'sm', class: css('_fgerror') },
      icon('trash-2', { size: '1em' }), ' Revoke'
    ),
  }));

  return Card({},
    Card.Header({},
      span({ class: css('_textsm _bold') }, 'Access Tokens'),
      span({ class: css('_textxs _fgmuted') }, tokens.length + ' tokens')
    ),
    Card.Body({},
      DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
    ),
    Card.Footer({},
      span({ class: css('_textxs _fgmuted') }, 'Tokens grant access to the CloudLaunch API'),
      Button({ variant: 'ghost', size: 'sm' }, icon('external-link', { size: '1em' }), ' API Docs')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function TokensPage() {
  onMount(() => {
    document.title = 'Tokens — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    Toolbar(),
    TokensTable()
  );
}
