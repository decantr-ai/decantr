import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, Input, Select, Toggle, icon } from 'decantr/components';

const { div, span, h2, h3, p } = tags;

// ─── General Section ────────────────────────────────────────────
function GeneralSection() {
  return div({ class: css('_flex _col _gap3') },
    div({},
      h3({ class: css('_heading6 _bold') }, 'General'),
      p({ class: css('_fgmuted _textsm') }, 'Manage your organization identity')
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _gap3') },
      Input({ label: 'Organization Name', placeholder: 'Acme Corp' }),
      Input({ label: 'Slug', placeholder: 'acme-corp' })
    )
  );
}

// ─── Notifications Section ──────────────────────────────────────
function NotificationsSection() {
  const row = (title, desc) =>
    div({ class: css('_flex _aic _jcsb _py2') },
      div({ class: css('_flex _col') },
        span({ class: css('_textsm _medium') }, title),
        p({ class: css('_textxs _fgmuted') }, desc)
      ),
      Toggle({})
    );

  return div({ class: css('_flex _col _gap3') },
    div({},
      h3({ class: css('_heading6 _bold') }, 'Notifications'),
      p({ class: css('_fgmuted _textsm') }, 'Configure how your team receives alerts')
    ),
    row('Email notifications', 'Receive deploy and incident alerts via email'),
    Input({ label: 'Slack Webhook URL', placeholder: 'https://hooks.slack.com/services/...' })
  );
}

// ─── Security Section ───────────────────────────────────────────
function SecuritySection() {
  const row = (title, desc) =>
    div({ class: css('_flex _aic _jcsb _py2') },
      div({ class: css('_flex _col') },
        span({ class: css('_textsm _medium') }, title),
        p({ class: css('_textxs _fgmuted') }, desc)
      ),
      Toggle({})
    );

  return div({ class: css('_flex _col _gap3') },
    div({},
      h3({ class: css('_heading6 _bold') }, 'Security'),
      p({ class: css('_fgmuted _textsm') }, 'Protect your organization')
    ),
    row('Two-Factor Authentication', 'Require 2FA for all organization members'),
    Select({ label: 'Session Timeout', options: [
      { label: '30 minutes', value: '30m' },
      { label: '1 hour', value: '1h' },
      { label: '4 hours', value: '4h' },
      { label: '24 hours', value: '24h' },
    ] })
  );
}

// ─── Danger Zone ────────────────────────────────────────────────
function DangerZone() {
  return div({ class: css('_flex _col _gap3 _p4 _r2 _border _bcerror/30') },
    div({},
      h3({ class: css('_heading6 _bold _fgerror') }, 'Danger Zone'),
      p({ class: css('_fgmuted _textsm') }, 'Irreversible actions that affect your entire organization')
    ),
    div({ class: css('_flex _aic _jcsb') },
      div({ class: css('_flex _col') },
        span({ class: css('_textsm _medium') }, 'Delete Organization'),
        p({ class: css('_textxs _fgmuted') }, 'Permanently delete this organization and all its data')
      ),
      Button({ variant: 'danger', size: 'sm' },
        icon('trash-2', { size: '1em' }), ' Delete Organization'
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  onMount(() => {
    document.title = 'Settings — CloudLaunch';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('_heading4 _bold') }, 'Organization Settings'),
      span({ class: css('_textxs _fgmuted') }, 'Manage configuration and preferences')
    ),
    Card({},
      Card.Body({ class: css('_flex _col _gap6 _p6 _mw[720px]') },
        GeneralSection(),
        div({ class: css('_borderB') }),
        NotificationsSection(),
        div({ class: css('_borderB') }),
        SecuritySection(),
        div({ class: css('_borderB') }),
        DangerZone(),
        div({ class: css('_flex _jcfe _gap3 _pt4') },
          Button({ variant: 'outline' }, 'Cancel'),
          Button({ variant: 'primary' },
            icon('check', { size: '1em' }), ' Save Changes'
          )
        )
      )
    )
  );
}
