import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Chip, Input, Select, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const stages = ['Lead', 'Qualified', 'Proposal', 'Closed'];
const priorities = { high: 'error', medium: 'warning', low: 'info' };

const deals = [
  { name: 'Cloud Migration', company: 'Acme Corp', value: 125000, priority: 'high', assignee: 'Alice Chen', date: 'Mar 12', stage: 'Lead' },
  { name: 'API Platform', company: 'Globex Inc', value: 85000, priority: 'medium', assignee: 'Bob Patel', date: 'Mar 10', stage: 'Lead' },
  { name: 'Data Pipeline', company: 'Initech', value: 210000, priority: 'high', assignee: 'Carol Liu', date: 'Mar 8', stage: 'Lead' },
  { name: 'SSO Integration', company: 'Umbrella Ltd', value: 45000, priority: 'low', assignee: 'Dan Kim', date: 'Mar 14', stage: 'Qualified' },
  { name: 'Analytics Suite', company: 'Stark Industries', value: 175000, priority: 'high', assignee: 'Eve Torres', date: 'Mar 11', stage: 'Qualified' },
  { name: 'Mobile Revamp', company: 'Wayne Enterprises', value: 92000, priority: 'medium', assignee: 'Frank Wu', date: 'Mar 6', stage: 'Qualified' },
  { name: 'Compliance Audit', company: 'Oscorp', value: 68000, priority: 'medium', assignee: 'Grace Park', date: 'Mar 9', stage: 'Qualified' },
  { name: 'Edge CDN', company: 'Cyberdyne', value: 310000, priority: 'high', assignee: 'Hiro Tanaka', date: 'Mar 5', stage: 'Proposal' },
  { name: 'ML Inference', company: 'Skynet Labs', value: 156000, priority: 'medium', assignee: 'Alice Chen', date: 'Mar 7', stage: 'Proposal' },
  { name: 'DevOps Tooling', company: 'Weyland-Yutani', value: 73000, priority: 'low', assignee: 'Bob Patel', date: 'Mar 3', stage: 'Proposal' },
  { name: 'Auth Overhaul', company: 'Soylent Corp', value: 198000, priority: 'high', assignee: 'Carol Liu', date: 'Mar 1', stage: 'Closed' },
  { name: 'Dashboard v2', company: 'Massive Dynamic', value: 142000, priority: 'medium', assignee: 'Dan Kim', date: 'Feb 28', stage: 'Closed' },
  { name: 'Search Reindex', company: 'Hooli', value: 54000, priority: 'low', assignee: 'Eve Torres', date: 'Feb 25', stage: 'Closed' },
  { name: 'Payments API', company: 'Pied Piper', value: 267000, priority: 'high', assignee: 'Frank Wu', date: 'Feb 22', stage: 'Closed' },
  { name: 'CI/CD Pipeline', company: 'Dunder Mifflin', value: 88000, priority: 'medium', assignee: 'Grace Park', date: 'Feb 20', stage: 'Closed' },
];

const fmt = v => '$' + v.toLocaleString();

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [search, setSearch] = createSignal('');
  const [stage, setStage] = createSignal('all');
  const [priority, setPriority] = createSignal('all');

  return div({ class: css('_flex _gap3 _aic _wrap') },
    Input({ placeholder: 'Search deals...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: stage, onchange: v => setStage(v), options: [
      { label: 'All Stages', value: 'all' },
      ...stages.map(s => ({ label: s, value: s })),
    ] }),
    Select({ value: priority, onchange: v => setPriority(v), options: [
      { label: 'All Priorities', value: 'all' },
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
    ] }),
    div({ class: css('_flex1') }),
    Button({ variant: 'primary', size: 'sm' }, icon('plus', { size: '1em' }), ' New Deal')
  );
}

// ─── Deal Card ──────────────────────────────────────────────────
function DealCard(deal) {
  return Card({ hover: true, class: css('d-glass') },
    Card.Body({ class: css('_flex _col _gap2') },
      div({ class: css('_flex _aic _jcsb') },
        span({ class: css('_medium _textsm') }, deal.name),
        Badge({ variant: priorities[deal.priority], size: 'sm' }, deal.priority)
      ),
      span({ class: css('_textxs _fgmuted') }, deal.company),
      div({ class: css('_flex _aic _jcsb') },
        span({ class: css('d-gradient-text _bold _textsm') }, fmt(deal.value)),
        Chip({ label: deal.assignee, size: 'xs', variant: 'default' })
      ),
      span({ class: css('_textxs _fgmuted') }, deal.date)
    )
  );
}

// ─── Kanban Column ──────────────────────────────────────────────
function KanbanColumn(stage) {
  const stageDeals = deals.filter(d => d.stage === stage);
  const total = stageDeals.reduce((sum, d) => sum + d.value, 0);

  return div({ class: css('_flex _col _flex1 _minw[260px]') },
    div({ class: css('_flex _aic _jcsb _px2') },
      div({ class: css('_flex _aic _gap2') },
        span({ class: css('_bold _textsm') }, stage),
        Badge({ variant: 'default', size: 'sm' }, String(stageDeals.length))
      ),
      span({ class: css('_textxs _fgmuted') }, fmt(total))
    ),
    div({ class: css('_flex _col _overflow[auto] _mh[500px] _gap2 d-stagger') },
      ...stageDeals.map(deal => DealCard(deal))
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function PipelinePage() {
  onMount(() => { document.title = 'Pipeline — SaaS Dashboard'; });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading5') }, 'Deal Pipeline'),
      span({ class: css('_textxs _fgmuted') }, `${deals.length} deals / ${fmt(deals.reduce((s, d) => s + d.value, 0))} total`)
    ),
    FilterBar(),
    div({ class: css('_flex _gap4 _overflow[auto] _pb2 d-stagger-up') },
      ...stages.map(stage => KanbanColumn(stage))
    )
  );
}
