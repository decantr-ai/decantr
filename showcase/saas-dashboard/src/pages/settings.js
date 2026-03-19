import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Button, Card, Input, Modal, Select, Separator, Switch, Tabs, Textarea, icon, toast } from 'decantr/components';

const { div, span, h2, h3, p } = tags;

// ─── Profile Section ────────────────────────────────────────────
function ProfileSection() {
  return div({ class: css('_flex _col _gap3') },
    div({},
      h3({ class: css('d-gradient-text _heading6 _bold') }, 'Profile'),
      p({ class: css('_fgmuted _textsm') }, 'Manage your identity and contact details')
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _gap3') },
      Input({ label: 'Full Name' }),
      Input({ label: 'Username' })
    ),
    Input({ label: 'Email', type: 'email' }),
    Textarea({ label: 'Bio', rows: 3 })
  );
}

// ─── Notifications Section ──────────────────────────────────────
function NotificationSection() {
  const [emailAlerts, setEmailAlerts] = createSignal(true);
  const [pushAlerts, setPushAlerts] = createSignal(false);
  const [criticalOnly, setCriticalOnly] = createSignal(false);

  const row = (title, desc, checked, onChange) =>
    div({ class: css('_flex _aic _jcsb _py2') },
      div({ class: css('_flex _col') },
        span({ class: css('_textsm _medium') }, title),
        p({ class: css('_textxs _fgmuted') }, desc)
      ),
      Switch({ checked, onchange: onChange })
    );

  return div({ class: css('_flex _col _gap3') },
    div({},
      h3({ class: css('d-gradient-text _heading6 _bold') }, 'Notifications'),
      p({ class: css('_fgmuted _textsm') }, 'Configure how you receive alerts')
    ),
    row('Email alerts', 'Receive status updates via email', emailAlerts, v => setEmailAlerts(v)),
    row('Push notifications', 'Browser push notifications', pushAlerts, v => setPushAlerts(v)),
    row('Critical only', 'Only alert on severity above warning', criticalOnly, v => setCriticalOnly(v))
  );
}

// ─── System Section ─────────────────────────────────────────────
function SystemSection() {
  return div({ class: css('_flex _col _gap3') },
    div({},
      h3({ class: css('d-gradient-text _heading6 _bold') }, 'System'),
      p({ class: css('_fgmuted _textsm') }, 'Platform configuration and data policies')
    ),
    Select({ label: 'Region', options: [
      { label: 'US East', value: 'us-east' }, { label: 'US West', value: 'us-west' },
      { label: 'EU Central', value: 'eu-central' }, { label: 'AP Southeast', value: 'ap-se' },
    ] }),
    Select({ label: 'Data retention', options: [
      { label: '30 days', value: '30d' }, { label: '90 days', value: '90d' }, { label: '1 year', value: '1y' },
    ] })
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  onMount(() => { document.title = 'Settings — SaaS Dashboard'; });

  const [confirmVis, setConfirmVis] = createSignal(false);

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      h2({ class: css('d-gradient-text _heading4 _bold') }, 'Settings'),
      span({ class: css('_textxs _fgmuted') }, 'Manage your account and preferences')
    ),
    Card({ class: css('d-glass') },
      Card.Body({},
        Tabs({
          tabs: [
            {
              id: 'profile', label: 'Profile',
              content: () => div({ class: css('_flex _col _gap4 _p6 _mw[720px]') },
                ProfileSection(),
                Separator(),
                div({ class: css('_flex _jcfe _gap3') },
                  Button({ variant: 'outline' }, 'Cancel'),
                  Button({ variant: 'primary', onclick: () => toast({ message: 'Settings saved', variant: 'success', duration: 3000 }) }, icon('check', { size: '1em' }), ' Save')
                )
              )
            },
            {
              id: 'notifications', label: 'Notifications',
              content: () => div({ class: css('_p6 _mw[720px]') }, NotificationSection())
            },
            {
              id: 'system', label: 'System',
              content: () => div({ class: css('_flex _col _gap4 _p6 _mw[720px]') },
                SystemSection(),
                Separator(),
                div({ class: css('_flex _jcfe _gap3') },
                  Button({ variant: 'error', onclick: () => setConfirmVis(true) }, icon('rotate-ccw', { size: '1em' }), ' Reset Configuration')
                )
              )
            }
          ],
          active: 'profile'
        })
      )
    ),
    Modal({
      visible: confirmVis,
      onClose: () => setConfirmVis(false),
      title: 'Confirm Reset',
      footer: [
        Button({ variant: 'outline', onclick: () => setConfirmVis(false) }, 'Cancel'),
        Button({ variant: 'error', onclick: () => { setConfirmVis(false); toast({ message: 'Configuration reset', variant: 'warning' }); } }, 'Reset')
      ]
    }, p({}, 'This will restore all settings to factory defaults. This action cannot be undone.'))
  );
}
