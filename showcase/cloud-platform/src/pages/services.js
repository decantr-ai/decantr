import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, icon } from 'decantr/components';

const { div, span, h2 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const services = [
  { name: 'Postgres', ic: 'database', status: 'connected', desc: 'Managed relational database with automatic backups and high availability.', action: 'Manage' },
  { name: 'Redis', ic: 'server', status: 'connected', desc: 'In-memory data store for caching, sessions, and real-time features.', action: 'Manage' },
  { name: 'Object Storage', ic: 'hard-drive', status: 'available', desc: 'S3-compatible blob storage for assets, media, and static files.', action: 'Connect' },
  { name: 'Elasticsearch', ic: 'search', status: 'beta', desc: 'Full-text search and analytics engine for logs and application data.', action: 'Try Now' },
  { name: 'Prometheus', ic: 'activity', status: 'available', desc: 'Metrics collection and alerting for infrastructure monitoring.', action: 'Connect' },
  { name: 'Kafka', ic: 'zap', status: 'beta', desc: 'Distributed event streaming platform for real-time data pipelines.', action: 'Try Now' },
];

const statusDot = (s) => s === 'connected' ? '_bgsuccess' : s === 'available' ? '_bgprimary' : '_bgwarning';
const statusLabel = (s) => s === 'connected' ? 'Connected' : s === 'available' ? 'Available' : 'Beta';
const statusVariant = (s) => s === 'connected' ? 'success' : s === 'available' ? 'primary' : 'warning';
const actionVariant = (s) => s === 'connected' ? 'outline' : 'primary';

// ─── Service Card ───────────────────────────────────────────────
function ServiceCard(svc) {
  return Card({ hover: true },
    Card.Body({ class: css('_flex _col _gap3') },
      div({ class: css('_flex _aic _jcsb') },
        div({ class: css('_w[40px] _h[40px] _r2 _bgprimary/10 _flex _aic _jcc') },
          icon(svc.ic, { size: '1rem', class: css('_fgprimary') })
        ),
        div({ class: css('_flex _aic _gap2') },
          div({ class: css('_w[8px] _h[8px] _rfull ' + statusDot(svc.status)) }),
          Badge({ variant: statusVariant(svc.status), size: 'sm' }, statusLabel(svc.status))
        )
      ),
      div({ class: css('_flex _col _gap1') },
        span({ class: css('_textsm _bold') }, svc.name),
        span({ class: css('_textxs _fgmuted _lh[1.5]') }, svc.desc)
      ),
      Button({ variant: actionVariant(svc.status), size: 'sm', class: css('_wfull') }, svc.action)
    )
  );
}

// ─── Service Grid ───────────────────────────────────────────────
function ServiceGrid() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('_heading5 _bold') }, 'Managed Services'),
      Badge({ variant: 'default' }, services.length + ' services')
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc3 _gap4 d-stagger-up') },
      ...services.map(svc => ServiceCard(svc))
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function ServicesPage() {
  onMount(() => {
    document.title = 'Services — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    ServiceGrid()
  );
}
