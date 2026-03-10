import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button, Separator, Spinner, Dropdown, Toggle, ToggleGroup, icon } from 'decantr/components';

const { div, section, h2, h3, p, span, small } = tags;

function DemoGroup(label, description, ...children) {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h3({ class: css('_textlg _fwheading _lhsnug') }, label),
      description ? p({ class: css('_textsm _fg4 _lhnormal') }, description) : null
    ),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

export function ActionSection() {
  const [pressed, setPressed] = createSignal(false);
  const [groupVal, setGroupVal] = createSignal('center');

  return section({ id: 'action', class: css('_flex _col _gap10') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Action Components'),
      p({ class: css('_textsm _fg4') }, 'Buttons, toggles, dropdowns, and loading indicators.')
    ),
    Separator({}),

    DemoGroup('Button — Variants', 'All available button styles for different semantic contexts.',
      DemoRow(
        Button({}, 'Default'),
        Button({ variant: 'primary' }, 'Primary'),
        Button({ variant: 'secondary' }, 'Secondary'),
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

    DemoGroup('Button — States', 'Disabled, loading, rounded, full-width, and grouped buttons.',
      DemoRow(
        Button({ disabled: true }, 'Disabled'),
        Button({ loading: true }, 'Loading'),
        Button({ variant: 'primary', loading: true }, 'Saving...'),
        Button({ variant: 'primary', rounded: true }, 'Rounded')
      ),
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
      ),
      DemoRow(
        small({ class: css('_textsm _fg4 _fwtitle') }, 'Hybrid'),
        Spinner({ icon: 'settings', size: 'xl' }),
        Spinner({ icon: 'cloud', size: 'xl' }),
        Spinner({ icon: 'database', size: 'xl' }),
        Spinner({ icon: 'zap', size: 'lg' })
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
    )
  );
}
