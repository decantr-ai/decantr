import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Input, Textarea, Checkbox, Switch, Select, Combobox, RadioGroup, Slider, InputNumber, InputOTP, Rate, Mentions, Label, Separator, InputGroup, CompactGroup, Button, icon } from 'decantr/components';

const { div, section, h2, h3, p, small } = tags;

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

export function InputSection() {
  const [checked, setChecked] = createSignal(false);
  const [switchOn, setSwitchOn] = createSignal(true);
  const [selectVal, setSelectVal] = createSignal('opt1');
  const [sliderVal, setSliderVal] = createSignal(50);
  const [radioVal, setRadioVal] = createSignal('a');
  const [numVal, setNumVal] = createSignal(5);
  const [rateVal, setRateVal] = createSignal(3);

  return section({ id: 'input', class: css('_flex _col _gap10') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_text2xl _fwheading _lhtight _lsheading') }, 'Form Components'),
      p({ class: css('_textsm _fg4') }, 'Text inputs, selectors, toggles, sliders, and other form controls.')
    ),

    Separator({}),

    // ── Input ──────────────────────────────────────────────────────
    DemoGroup('Input', 'Single-line text fields with prefix icons, error states, and password masking.',
      div({ class: css('_grid _gc2 _gap3'), style: 'max-width:640px' },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Default'),
          Input({ placeholder: 'Default input' })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'With Value'),
          Input({ value: 'With value' })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Disabled'),
          Input({ placeholder: 'Disabled', disabled: true })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Error'),
          Input({ placeholder: 'Error state', error: true })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'With Prefix'),
          Input({ placeholder: 'With prefix', prefix: icon('search') })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Password'),
          Input({ type: 'password', placeholder: 'Password' })
        )
      )
    ),

    // ── InputNumber ────────────────────────────────────────────────
    DemoGroup('InputNumber', 'Numeric stepper inputs with min/max, step, and precision controls.',
      DemoRow(
        InputNumber({ value: numVal, onChange: v => setNumVal(v), min: 0, max: 100, step: 1 }),
        InputNumber({ value: 3.14, precision: 2, step: 0.01, min: 0, max: 10 }),
        InputNumber({ value: 0, disabled: true })
      )
    ),

    // ── InputOTP ───────────────────────────────────────────────────
    DemoGroup('InputOTP', 'One-time password fields with configurable length, masking, and separators.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, '6-digit code'),
          InputOTP({ length: 6, onComplete: code => {} })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, '4-digit masked with separator'),
          InputOTP({ length: 4, mask: true, separator: 2 })
        )
      )
    ),

    // ── Rate ───────────────────────────────────────────────────────
    DemoGroup('Rate', 'Star ratings with half-star, custom character, and disabled variants.',
      DemoRow(
        Rate({ value: rateVal, onChange: v => setRateVal(v) }),
        Rate({ value: 3.5, allowHalf: true }),
        Rate({ value: 4, disabled: true }),
        Rate({ value: 2, count: 3, character: '\u2764' })
      )
    ),

    // ── Textarea ───────────────────────────────────────────────────
    DemoGroup('Textarea', 'Multi-line text areas with disabled and error states.',
      div({ class: css('_grid _gc2 _gap3'), style: 'max-width:640px' },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Default'),
          Textarea({ placeholder: 'Default textarea' })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Disabled'),
          Textarea({ placeholder: 'Disabled', disabled: true })
        ),
        div({ class: css('_flex _col _gap1 _span2') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Error'),
          Textarea({ placeholder: 'Error state', error: true })
        )
      )
    ),

    // ── Checkbox ───────────────────────────────────────────────────
    DemoGroup('Checkbox', 'Toggle checkboxes with indeterminate, disabled, and interactive states.',
      DemoRow(
        Checkbox({ label: 'Unchecked' }),
        Checkbox({ checked: true, label: 'Checked' }),
        Checkbox({ checked: checked, onchange: v => setChecked(v), label: 'Interactive' }),
        Checkbox({ indeterminate: true, label: 'Indeterminate' }),
        Checkbox({ disabled: true, label: 'Disabled' })
      )
    ),

    // ── Switch ─────────────────────────────────────────────────────
    DemoGroup('Switch', 'Binary toggles for on/off settings.',
      DemoRow(
        Switch({ label: 'Off' }),
        Switch({ checked: switchOn, onchange: v => setSwitchOn(v), label: 'Interactive' }),
        Switch({ checked: true, label: 'On' }),
        Switch({ disabled: true, label: 'Disabled' })
      )
    ),

    // ── Select ─────────────────────────────────────────────────────
    DemoGroup('Select', 'Dropdown menus for single-value selection.',
      DemoRow(
        Select({
          options: [
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
            { value: 'opt3', label: 'Option 3' }
          ],
          value: selectVal,
          onchange: v => setSelectVal(v),
          placeholder: 'Choose...'
        }),
        Select({
          options: [{ value: 'a', label: 'Disabled select' }],
          disabled: true,
          placeholder: 'Disabled'
        })
      )
    ),

    // ── Combobox ───────────────────────────────────────────────────
    DemoGroup('Combobox', 'Searchable dropdown with type-ahead filtering.',
      DemoRow(
        Combobox({
          options: [
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
            { value: 'cherry', label: 'Cherry' },
            { value: 'grape', label: 'Grape' },
            { value: 'mango', label: 'Mango' }
          ],
          placeholder: 'Search fruit...'
        })
      )
    ),

    // ── Mentions ───────────────────────────────────────────────────
    DemoGroup('Mentions', 'Textarea with @-mention autocomplete for user tagging.',
      div({ style: 'max-width:400px' },
        Mentions({
          options: [
            { label: 'Alice', value: 'alice' },
            { label: 'Bob', value: 'bob' },
            { label: 'Carol', value: 'carol' },
            { label: 'Dave', value: 'dave' }
          ],
          placeholder: 'Type @ to mention someone...',
          rows: 3
        })
      )
    ),

    // ── Label ──────────────────────────────────────────────────────
    DemoGroup('Label', 'Form labels with optional required indicator.',
      DemoRow(
        Label({ for: 'demo-input' }, 'Username'),
        Label({ required: true }, 'Email address')
      )
    ),

    // ── RadioGroup ─────────────────────────────────────────────────
    DemoGroup('RadioGroup', 'Single-selection radio groups in vertical and horizontal orientations.',
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Vertical'),
          RadioGroup({
            options: [
              { value: 'a', label: 'Option A' },
              { value: 'b', label: 'Option B' },
              { value: 'c', label: 'Option C' }
            ],
            value: radioVal,
            onchange: v => setRadioVal(v)
          })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Horizontal'),
          RadioGroup({
            orientation: 'horizontal',
            options: [
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' }
            ],
            value: 'md'
          })
        )
      )
    ),

    // ── Slider ─────────────────────────────────────────────────────
    DemoGroup('Slider', 'Range sliders with interactive and disabled states.',
      div({ class: css('_flex _col _gap4'), style: 'max-width:320px' },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Interactive'),
          Slider({ value: sliderVal, onchange: v => setSliderVal(v), min: 0, max: 100 })
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Disabled'),
          Slider({ value: 30, disabled: true, min: 0, max: 100 })
        )
      )
    ),

    // ── InputGroup ───────────────────────────────────────────────
    DemoGroup('InputGroup', 'Compose inputs with text, icon, button, and select addons. Groups respond to focus, error, and disabled states.',
      div({ class: css('_flex _col _gap4'), style: 'max-width:640px' },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Currency'),
          InputGroup({},
            InputGroup.Addon('$'),
            Input({ placeholder: '0.00' }),
            InputGroup.Addon('.00')
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'URL'),
          InputGroup({},
            InputGroup.Addon('https://'),
            Input({ placeholder: 'example' }),
            InputGroup.Addon('.com')
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Search with Button'),
          InputGroup({},
            Input({ placeholder: 'Search...' }),
            Button({ variant: 'primary' }, icon('search'))
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Select + Input'),
          InputGroup({},
            Select({ options: [{ value: 'usd', label: 'USD' }, { value: 'eur', label: 'EUR' }, { value: 'gbp', label: 'GBP' }], value: 'usd' }),
            Input({ placeholder: 'Amount' })
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Icon Addon'),
          InputGroup({},
            InputGroup.Addon(icon('mail')),
            Input({ placeholder: 'Email address' })
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Checkbox Addon'),
          InputGroup({},
            InputGroup.Addon(Checkbox({ label: 'Enable' })),
            Input({ placeholder: 'Value', disabled: true })
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Error State'),
          InputGroup({ error: true },
            InputGroup.Addon('@'),
            Input({ placeholder: 'Username' })
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Vertical (Textarea)'),
          InputGroup({ vertical: true },
            InputGroup.Addon(
              div({ class: css('_flex _gap2 _p1') },
                Button({ size: 'xs', variant: 'ghost', 'aria-label': 'Bold' }, 'B'),
                Button({ size: 'xs', variant: 'ghost', 'aria-label': 'Italic' }, 'I'),
                Button({ size: 'xs', variant: 'ghost', 'aria-label': 'Link' }, icon('link'))
              )
            ),
            Textarea({ placeholder: 'Write something...', rows: 3 }),
            InputGroup.Addon(small({ class: css('_textsm _fg4') }, '0 / 500'))
          )
        )
      )
    ),

    // ── CompactGroup ─────────────────────────────────────────────
    DemoGroup('CompactGroup', 'Border-merged mixed controls for compact form layouts.',
      div({ class: css('_flex _col _gap4'), style: 'max-width:640px' },
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Name Fields'),
          CompactGroup({},
            Input({ placeholder: 'First name' }),
            Input({ placeholder: 'Last name' })
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'URL Builder'),
          CompactGroup({},
            Select({ options: [{ value: 'https', label: 'https://' }, { value: 'http', label: 'http://' }], value: 'https' }),
            Input({ placeholder: 'domain.com' }),
            Button({ variant: 'primary' }, 'Go')
          )
        ),
        div({ class: css('_flex _col _gap1') },
          small({ class: css('_textsm _fg4 _fwtitle') }, 'Quantity with Label'),
          InputGroup({},
            InputGroup.Addon('Qty'),
            InputNumber({ value: 1, min: 0, max: 99, step: 1 })
          )
        )
      )
    )
  );
}
