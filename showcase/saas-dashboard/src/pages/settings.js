import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { Button, Card, Input, Modal, Select, Separator, Switch, Tabs, Textarea, icon, toast } from 'decantr/components';

const { div, span, h3, p } = tags;

function ProfileSection() {
  return div({ class: css('_flex _col _gap3') },
    div({}, h3({ class: css('cc-label') }, 'PROFILE'), p({ class: css('_fgmuted _textsm') }, 'Operator identity and contact')),
    div({ class: css('_grid _gc1 _sm:gc2 _gap3') },
      Input({ label: 'Callsign' }),
      Input({ label: 'Designation' })
    ),
    Input({ label: 'Email', type: 'email' }),
    Textarea({ label: 'Notes', rows: 3 })
  );
}

function NotificationSection() {
  const [emailAlerts, setEmailAlerts] = createSignal(true);
  const [pushAlerts, setPushAlerts] = createSignal(false);
  const [criticalOnly, setCriticalOnly] = createSignal(false);

  const row = (title, desc, checked, onChange) =>
    div({ class: css('_flex _aic _jcsb') },
      div({},
        span({ class: css('_textsm _medium') }, title),
        p({ class: css('_textxs _fgmuted') }, desc)
      ),
      Switch({ checked, onchange: onChange })
    );

  return div({ class: css('_flex _col _gap3') },
    div({}, h3({ class: css('cc-label') }, 'ALERTS'), p({ class: css('_fgmuted _textsm') }, 'Notification routing configuration')),
    row('Email alerts', 'Receive status updates via email', emailAlerts, v => setEmailAlerts(v)),
    row('Push notifications', 'Browser push notifications', pushAlerts, v => setPushAlerts(v)),
    row('Critical only', 'Only alert on severity > warning', criticalOnly, v => setCriticalOnly(v)),
  );
}

function SystemSection() {
  return div({ class: css('_flex _col _gap3') },
    div({}, h3({ class: css('cc-label') }, 'SYSTEM'), p({ class: css('_fgmuted _textsm') }, 'Platform configuration')),
    Select({ label: 'Region', options: [
      { label: 'US East', value: 'us-east' }, { label: 'US West', value: 'us-west' },
      { label: 'EU Central', value: 'eu-central' }, { label: 'AP Southeast', value: 'ap-se' },
    ] }),
    Select({ label: 'Data retention', options: [
      { label: '30 days', value: '30d' }, { label: '90 days', value: '90d' }, { label: '1 year', value: '1y' },
    ] })
  );
}

export default function SettingsPage() {
  const [confirmVis, setConfirmVis] = createSignal(false);

  return div({ class: css('d-page-enter _flex _col _gap3') },
    Card({},
      Card.Header({ class: css('cc-bar') },
        span({ class: css('cc-label') }, 'CONFIGURATION'),
        span({ class: css('cc-indicator cc-indicator-ok') })
      ),
      Card.Body({},
        Tabs({
          tabs: [
            {
              id: 'profile', label: 'Profile',
              content: () => div({ class: css('_flex _col _gap6 _p4 _mw[720px]') },
                ProfileSection(),
                Separator(),
                div({ class: css('_flex _jcfe _gap3') },
                  Button({ variant: 'outline', class: css('cc-label _textxs') }, 'CANCEL'),
                  Button({ variant: 'primary', class: css('cc-label _textxs'), onclick: () => toast({ message: 'Configuration saved', variant: 'success', duration: 3000 }) }, 'SAVE')
                )
              )
            },
            {
              id: 'notifications', label: 'Notifications',
              content: () => div({ class: css('_p4 _mw[720px]') }, NotificationSection())
            },
            {
              id: 'system', label: 'System',
              content: () => div({ class: css('_flex _col _gap6 _p4 _mw[720px]') },
                SystemSection(),
                Separator(),
                div({ class: css('_flex _jcfe _gap3') },
                  Button({ variant: 'error', class: css('cc-label _textxs'), onclick: () => setConfirmVis(true) }, 'RESET CONFIGURATION')
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
