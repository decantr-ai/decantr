import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { Card, Input, Select, Toggle, Button } from 'decantr/components';

const { div, h1, h2, label, span } = tags;

export function SettingsPage() {
  const [companyName, setCompanyName] = createSignal('Acme Corp');
  const [timezone, setTimezone] = createSignal('UTC');
  const [notifications, setNotifications] = createSignal(true);
  const [darkMode, setDarkMode] = createSignal(true);

  return div({ class: '_flex _col _gap4 _p4 _overflow[auto] _flex1' },
    h1({ class: '_fslg _fwbold _mb4' }, 'Settings'),

    // General settings
    Card({
      children: [
        Card.Header({}, 'General'),
        Card.Body({ class: '_flex _col _gap4' },
          div({ class: '_flex _col _gap2' },
            label({ class: '_fwmedium' }, 'Company Name'),
            Input({
              value: companyName,
              onInput: (e) => setCompanyName(e.target.value),
            }),
          ),
          div({ class: '_flex _col _gap2' },
            label({ class: '_fwmedium' }, 'Timezone'),
            Select({
              value: timezone,
              onChange: setTimezone,
              options: [
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time' },
                { value: 'America/Los_Angeles', label: 'Pacific Time' },
                { value: 'Europe/London', label: 'London' },
              ],
            }),
          ),
        ),
      ],
    }),

    // Preferences
    Card({
      children: [
        Card.Header({}, 'Preferences'),
        Card.Body({ class: '_flex _col _gap4' },
          div({ class: '_flex _justifybetween _itemscenter' },
            div({},
              span({ class: '_fwmedium _block' }, 'Email Notifications'),
              span({ class: '_fgmuted _fssm' }, 'Receive email updates about your account'),
            ),
            Toggle({ checked: notifications, onChange: setNotifications }),
          ),
          div({ class: '_flex _justifybetween _itemscenter' },
            div({},
              span({ class: '_fwmedium _block' }, 'Dark Mode'),
              span({ class: '_fgmuted _fssm' }, 'Use dark theme for the dashboard'),
            ),
            Toggle({ checked: darkMode, onChange: setDarkMode }),
          ),
        ),
      ],
    }),

    // Save button
    div({ class: '_flex _justifyend _mt4' },
      Button({ variant: 'primary' }, 'Save Changes'),
    )
  );
}
