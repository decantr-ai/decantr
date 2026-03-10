import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button, Spinner, Dropdown, Toggle, ToggleGroup, icon } from 'decantr/components';
import { SectionHeader, DemoGroup, DemoRow } from './_shared.js';

const { div, section, h3, p, span, small } = tags;

export function ActionSection() {
  const [pressed, setPressed] = createSignal(false);
  const [groupVal, setGroupVal] = createSignal('center');

  return section({ id: 'action', class: css('_flex _col _gap10') },
    SectionHeader('Action Components', 'Buttons, toggles, dropdowns, and loading indicators.'),

    DemoGroup('Button — Variants', 'All available button styles for different semantic contexts.',
      DemoRow(
        Button({}, 'Default'),
        Button({ variant: 'primary' }, 'Primary'),
        Button({ variant: 'secondary' }, 'Secondary'),
        Button({ variant: 'tertiary' }, 'Tertiary'),
        Button({ variant: 'destructive' }, 'Destructive'),
        Button({ variant: 'success' }, 'Success'),
        Button({ variant: 'warning' }, 'Warning'),
        Button({ variant: 'outline' }, 'Outline'),
        Button({ variant: 'ghost' }, 'Ghost'),
        Button({ variant: 'link' }, 'Link')
      )
    ),

    DemoGroup('Button — Sizes', 'From extra-small to large, plus icon-only variants.',
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Text'),
        Button({ size: 'xs' }, 'Extra Small'),
        Button({ size: 'sm' }, 'Small'),
        Button({}, 'Default'),
        Button({ size: 'lg' }, 'Large')
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Icon'),
        Button({ variant: 'primary', size: 'icon-xs', 'aria-label': 'Close' }, icon('x')),
        Button({ variant: 'primary', size: 'icon-sm', 'aria-label': 'Edit' }, icon('edit')),
        Button({ variant: 'primary', size: 'icon', 'aria-label': 'Settings' }, icon('settings')),
        Button({ variant: 'primary', size: 'icon-lg', 'aria-label': 'Menu' }, icon('menu'))
      )
    ),

    DemoGroup('Button — With Icons', 'Buttons with leading and trailing icons for common actions.',
      DemoRow(
        Button({ variant: 'primary', iconLeft: 'plus' }, 'Create'),
        Button({ variant: 'secondary', iconLeft: 'download' }, 'Download'),
        Button({ variant: 'outline', iconLeft: 'upload' }, 'Upload'),
        Button({ variant: 'default', iconLeft: 'search' }, 'Search'),
        Button({ variant: 'destructive', iconLeft: 'trash' }, 'Delete')
      ),
      DemoRow(
        Button({ variant: 'primary', iconRight: 'arrow-right' }, 'Continue'),
        Button({ variant: 'outline', iconRight: 'external-link' }, 'Open Link'),
        Button({ variant: 'ghost', iconLeft: 'mail' }, 'Send Email'),
        Button({ variant: 'success', iconLeft: 'check' }, 'Confirm'),
        Button({ variant: 'warning', iconLeft: 'alert-triangle' }, 'Caution')
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Sizes with icons'),
        Button({ size: 'xs', iconLeft: 'star' }, 'Favorite'),
        Button({ size: 'sm', iconLeft: 'edit' }, 'Edit'),
        Button({ iconLeft: 'settings' }, 'Settings'),
        Button({ size: 'lg', iconLeft: 'save' }, 'Save Changes')
      )
    ),

    DemoGroup('Button — States', 'Disabled, loading, rounded, full-width, and grouped buttons.',
      DemoRow(
        Button({ disabled: true }, 'Disabled'),
        Button({ variant: 'primary', loading: true }, 'Saving...'),
        Button({ variant: 'secondary', loading: true }, 'Processing'),
        Button({ variant: 'destructive', loading: true }, 'Deleting...'),
        Button({ variant: 'primary', rounded: true }, 'Rounded')
      ),
      (() => {
        const [l1, sl1] = createSignal(false);
        const [l2, sl2] = createSignal(false);
        const [l3, sl3] = createSignal(false);
        const trigger = (s) => { s(true); setTimeout(() => s(false), 2000); };
        return div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Interactive — click to trigger loading'),
          DemoRow(
            Button({ variant: 'primary', loading: l1, iconLeft: 'save', onclick: () => trigger(sl1) }, 'Save'),
            Button({ variant: 'secondary', loading: l2, iconLeft: 'refresh', onclick: () => trigger(sl2) }, 'Sync Data'),
            Button({ variant: 'destructive', loading: l3, iconLeft: 'trash', onclick: () => trigger(sl3) }, 'Delete')
          )
        );
      })(),
      div({ class: css('_flex _col _gap3') },
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Block'),
        Button({ block: true, variant: 'primary' }, 'Full Width (block)')
      ),
      div({ class: css('_flex _col _gap3') },
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Button Group'),
        Button.Group({},
          Button({ variant: 'outline' }, 'Left'),
          Button({ variant: 'outline' }, 'Center'),
          Button({ variant: 'outline' }, 'Right')
        )
      )
    ),

    DemoGroup('Toggle', 'Stateful toggle buttons with pressed and unpressed states.',
      DemoRow(
        Toggle({ pressed: pressed, onToggle: v => setPressed(v) }, 'Interactive'),
        Toggle({ pressed: true }, 'Pressed'),
        Toggle({}, 'Default'),
        Toggle({ disabled: true }, 'Disabled'),
        Toggle({ variant: 'outline' }, 'Outline'),
        Toggle({ variant: 'outline', pressed: true }, 'Outline Pressed')
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Sizes'),
        Toggle({ size: 'sm' }, 'Small'),
        Toggle({}, 'Default'),
        Toggle({ size: 'lg' }, 'Large')
      )
    ),

    DemoGroup('ToggleGroup', 'Single-select and multi-select toggle groups.',
      DemoRow(
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Single Select'),
          ToggleGroup({
            items: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' }
            ],
            value: groupVal,
            onChange: v => setGroupVal(v)
          })
        ),
        div({ class: css('_flex _col _gap2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Multiple Select'),
          ToggleGroup({
            items: [
              { label: 'Bold', value: 'bold' },
              { label: 'Italic', value: 'italic' },
              { label: 'Underline', value: 'underline' }
            ],
            type: 'multiple',
            value: ['bold']
          })
        )
      )
    ),

    DemoGroup('Dropdown', 'Contextual menus triggered by buttons.',
      DemoRow(
        Dropdown({
          trigger: () => Button({ variant: 'outline' }, 'Actions'),
          items: [
            { label: 'Edit', onclick: () => {} },
            { label: 'Duplicate', onclick: () => {} },
            { separator: true },
            { label: 'Delete', onclick: () => {} }
          ]
        }),
        Dropdown({
          trigger: () => Button({ variant: 'primary' }, 'With shortcuts'),
          items: [
            { label: 'Cut', shortcut: '\u2318X', onclick: () => {} },
            { label: 'Copy', shortcut: '\u2318C', onclick: () => {} },
            { label: 'Paste', shortcut: '\u2318V', onclick: () => {} },
            { separator: true },
            { label: 'Disabled item', disabled: true }
          ]
        })
      )
    ),

    DemoGroup('Spinner — Variants', 'Five animation styles plus hybrid icon mode.',
      DemoRow(
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ size: 'lg' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'ring')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ variant: 'dots', size: 'lg' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'dots')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ variant: 'pulse', size: 'lg' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'pulse')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ variant: 'bars', size: 'lg' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'bars')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ variant: 'orbit', size: 'lg' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'orbit')
        )
      )
    ),

    DemoGroup('Spinner — Sizes', 'All sizes from xs to xl.',
      DemoRow(
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ size: 'xs' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'xs')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ size: 'sm' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'sm')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({}),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'default')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ size: 'lg' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'lg')
        ),
        div({ class: css('_flex _col _aic _gap2') },
          Spinner({ size: 'xl' }),
          small({ class: css('_textsm _fg4 _fwtitle') }, 'xl')
        )
      )
    ),

    DemoGroup('Spinner — Colors', 'Spinners inherit color from their parent via currentColor.',
      DemoRow(
        ...['primary', 'accent', 'tertiary', 'success', 'warning', 'error', 'info'].map(role =>
          div({ class: css('_flex _col _aic _gap2') },
            div({ style: `color:var(--d-${role})` }, Spinner({ size: 'lg' })),
            small({ class: css('_textsm _fg4 _fwtitle') }, role)
          )
        )
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Dots'),
        ...['primary', 'accent', 'tertiary', 'success', 'error'].map(role =>
          div({ class: css('_flex _col _aic _gap2') },
            div({ style: `color:var(--d-${role})` }, Spinner({ variant: 'dots', size: 'lg' })),
            small({ class: css('_textsm _fg4 _fwtitle') }, role)
          )
        )
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Bars'),
        ...['primary', 'accent', 'tertiary', 'warning', 'info'].map(role =>
          div({ class: css('_flex _col _aic _gap2') },
            div({ style: `color:var(--d-${role})` }, Spinner({ variant: 'bars', size: 'lg' })),
            small({ class: css('_textsm _fg4 _fwtitle') }, role)
          )
        )
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Orbit'),
        ...['primary', 'accent', 'tertiary', 'success', 'error'].map(role =>
          div({ class: css('_flex _col _aic _gap2') },
            div({ style: `color:var(--d-${role})` }, Spinner({ variant: 'orbit', size: 'lg' })),
            small({ class: css('_textsm _fg4 _fwtitle') }, role)
          )
        )
      )
    ),

    DemoGroup('Spinner — On Surfaces', 'Spinners in context on colored and elevated backgrounds.',
      DemoRow(
        div({ style: 'padding:var(--d-sp-5);background:var(--d-primary);color:var(--d-primary-fg);border-radius:var(--d-radius-lg);display:flex;align-items:center;gap:var(--d-sp-3)' },
          Spinner({ size: 'sm' }),
          span({}, 'Loading on primary')
        ),
        div({ style: 'padding:var(--d-sp-5);background:var(--d-accent);color:var(--d-accent-fg);border-radius:var(--d-radius-lg);display:flex;align-items:center;gap:var(--d-sp-3)' },
          Spinner({ size: 'sm' }),
          span({}, 'Loading on accent')
        ),
        div({ style: 'padding:var(--d-sp-5);background:var(--d-surface-1);border:1px solid var(--d-border);border-radius:var(--d-radius-lg);display:flex;align-items:center;gap:var(--d-sp-3)' },
          Spinner({ size: 'sm' }),
          span({}, 'Loading on surface')
        )
      ),
      DemoRow(
        div({
          style: 'width:220px;height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--d-sp-3);background:var(--d-surface-1);border:1px solid var(--d-border);border-radius:var(--d-radius-lg)'
        },
          div({ style: 'color:var(--d-primary)' }, Spinner({ size: 'xl' })),
          small({ class: css('_textsm _fg4') }, 'Loading data...')
        ),
        div({
          style: 'width:220px;height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--d-sp-3);background:var(--d-surface-2);border:1px solid var(--d-surface-2-border);border-radius:var(--d-radius-lg)'
        },
          div({ style: 'color:var(--d-accent)' }, Spinner({ variant: 'dots', size: 'xl' })),
          small({ class: css('_textsm _fg4') }, 'Syncing...')
        )
      )
    ),

    DemoGroup('Spinner — Hybrid Showcase', 'Ring spinners with centered icons in different colors.',
      DemoRow(
        ...['settings', 'cloud', 'database', 'refresh', 'zap', 'heart', 'star'].map(name =>
          div({ class: css('_flex _col _aic _gap2') },
            Spinner({ icon: name, size: 'xl' }),
            small({ class: css('_textsm _fg4 _fwtitle') }, name)
          )
        )
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Colored hybrids'),
        div({ style: 'color:var(--d-accent)' }, Spinner({ icon: 'cloud', size: 'xl' })),
        div({ style: 'color:var(--d-success)' }, Spinner({ icon: 'check-circle', size: 'xl' })),
        div({ style: 'color:var(--d-error)' }, Spinner({ icon: 'alert-circle', size: 'xl' })),
        div({ style: 'color:var(--d-warning)' }, Spinner({ icon: 'alert-triangle', size: 'xl' })),
        div({ style: 'color:var(--d-tertiary)' }, Spinner({ icon: 'database', size: 'xl' })),
        div({ style: 'color:var(--d-info)' }, Spinner({ icon: 'refresh', size: 'xl' }))
      )
    )
  );
}
