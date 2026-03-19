import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Chip } from 'decantr/components';

const { div, span, h2, ul, li } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const typeColors = { added: 'success', changed: 'warning', fixed: 'info', removed: 'error' };

const releases = [
  {
    version: '2.4.1', title: 'Hotfix: Auth Token Refresh', date: 'Mar 15, 2026',
    changes: [
      { type: 'fixed', text: 'OAuth token refresh loop causing session drops after 30 minutes' },
      { type: 'fixed', text: 'Race condition in concurrent API requests during token renewal' },
      { type: 'changed', text: 'Token refresh buffer increased from 30s to 120s before expiry' },
    ]
  },
  {
    version: '2.4.0', title: 'Pipeline & Deal Management', date: 'Mar 10, 2026',
    changes: [
      { type: 'added', text: 'Kanban board view for deal pipeline with drag-and-drop' },
      { type: 'added', text: 'Deal value tracking and stage-based filtering' },
      { type: 'added', text: 'Priority badges and assignee chips on deal cards' },
      { type: 'changed', text: 'Sidebar navigation reorganized into logical sections' },
      { type: 'fixed', text: 'Chart tooltip positioning on small viewports' },
    ]
  },
  {
    version: '2.3.0', title: 'Advanced Analytics & Reporting', date: 'Feb 28, 2026',
    changes: [
      { type: 'added', text: 'Report builder with configurable filters and export' },
      { type: 'added', text: 'Area and bar chart types for trend visualization' },
      { type: 'added', text: 'Scorecard component with animated KPI counters' },
      { type: 'changed', text: 'DataTable now supports inline status badges' },
      { type: 'fixed', text: 'Pagination reset when changing table filters' },
    ]
  },
  {
    version: '2.2.0', title: 'Notification Center', date: 'Feb 15, 2026',
    changes: [
      { type: 'added', text: 'Split-pane notification inbox with detail preview' },
      { type: 'added', text: 'Unread indicator dots and mark-all-read action' },
      { type: 'changed', text: 'Bell icon in header now shows unread count badge' },
      { type: 'removed', text: 'Legacy toast-only notification system' },
    ]
  },
  {
    version: '2.1.0', title: 'Billing & Subscription Management', date: 'Feb 1, 2026',
    changes: [
      { type: 'added', text: 'Three-tier pricing table with feature comparison' },
      { type: 'added', text: 'Invoice history with sortable DataTable' },
      { type: 'added', text: 'Payment method display and plan KPI cards' },
      { type: 'changed', text: 'Settings page now uses tabbed layout' },
      { type: 'fixed', text: 'Modal z-index conflict with dropdown menus' },
    ]
  },
  {
    version: '2.0.0', title: 'Auradecantism Visual Overhaul', date: 'Jan 15, 2026',
    changes: [
      { type: 'added', text: 'Auradecantism dark theme with glass morphism cards' },
      { type: 'added', text: 'Gradient text and glow effects on key UI elements' },
      { type: 'added', text: 'Stagger entrance animations across all pages' },
      { type: 'changed', text: 'Migrated from command-center recipe to auradecantism' },
      { type: 'removed', text: 'All cc-* class references and legacy theme tokens' },
      { type: 'removed', text: 'Google Fonts dependency — using system font stack' },
    ]
  },
];

// ─── Timeline Entry ─────────────────────────────────────────────
function TimelineEntry(release, isLast) {
  return div({ class: css('_flex _gap4') },
    div({ class: css('_flex _col _aic _shrink0 _w[24px]') },
      div({ class: css('_w[12px] _h[12px] _rfull _bgprimary aura-glow _shrink0') }),
      isLast ? null : div({ class: css('_w[2px] _flex1 _bcborder/40') })
    ),
    div({ class: css('_flex _col _gap3 _pb8 _flex1') },
      div({ class: css('_flex _aic _jcsb _wrap _gap2') },
        div({ class: css('_flex _aic _gap3') },
          Badge({ variant: 'primary' }, `v${release.version}`),
          span({ class: css('d-gradient-text _bold') }, release.title)
        ),
        span({ class: css('_textxs _fgmuted') }, release.date)
      ),
      ul({ class: css('_flex _col _gap2') },
        ...release.changes.map(change =>
          li({ class: css('_flex _aic _gap3 _textsm') },
            Chip({ label: change.type, size: 'xs', variant: typeColors[change.type] }),
            span({}, change.text)
          )
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function ChangelogPage() {
  onMount(() => { document.title = 'Changelog — SaaS Dashboard'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5') }, 'Changelog'),
      Badge({ variant: 'default', size: 'sm' }, `${releases.length} releases`)
    ),
    div({ class: css('_flex _col _mw[800px] d-stagger') },
      ...releases.map((release, i) => TimelineEntry(release, i === releases.length - 1))
    )
  );
}
