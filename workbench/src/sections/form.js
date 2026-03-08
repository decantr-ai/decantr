import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Input, Textarea, Checkbox, Switch, Select, Combobox, RadioGroup, Slider, icon } from 'decantr/components';

const { div, section, h2, h3 } = tags;

function DemoGroup(label, ...children) {
  return div({ class: css('_flex _col _gap3') },
    h3({ class: css('_t12 _bold _fg4'), style: 'text-transform:uppercase;letter-spacing:0.05em' }, label),
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

  return section({ id: 'input', class: css('_flex _col _gap8') },
    h2({ class: css('_t24 _bold _mb2') }, 'Input Components'),

    DemoGroup('Input',
      div({ class: css('_flex _col _gap3'), style: 'max-width:320px' },
        Input({ placeholder: 'Default input' }),
        Input({ value: 'With value' }),
        Input({ placeholder: 'Disabled', disabled: true }),
        Input({ placeholder: 'Error state', error: true }),
        Input({ placeholder: 'With prefix', prefix: icon('search') }),
        Input({ type: 'password', placeholder: 'Password' })
      )
    ),

    DemoGroup('Textarea',
      div({ class: css('_flex _col _gap3'), style: 'max-width:320px' },
        Textarea({ placeholder: 'Default textarea' }),
        Textarea({ placeholder: 'Disabled', disabled: true }),
        Textarea({ placeholder: 'Error state', error: true })
      )
    ),

    DemoGroup('Checkbox',
      DemoRow(
        Checkbox({ label: 'Unchecked' }),
        Checkbox({ checked: true, label: 'Checked' }),
        Checkbox({ checked: checked, onchange: v => setChecked(v), label: 'Interactive' }),
        Checkbox({ indeterminate: true, label: 'Indeterminate' }),
        Checkbox({ disabled: true, label: 'Disabled' })
      )
    ),

    DemoGroup('Switch',
      DemoRow(
        Switch({ label: 'Off' }),
        Switch({ checked: switchOn, onchange: v => setSwitchOn(v), label: 'Interactive' }),
        Switch({ checked: true, label: 'On' }),
        Switch({ disabled: true, label: 'Disabled' })
      )
    ),

    DemoGroup('Select',
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

    DemoGroup('Combobox',
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
        }),
        Combobox({
          options: [
            { value: 'us', label: 'United States' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'ca', label: 'Canada' }
          ],
          placeholder: 'Disabled',
          disabled: true
        })
      )
    ),

    DemoGroup('RadioGroup',
      DemoRow(
        RadioGroup({
          options: [
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
            { value: 'c', label: 'Option C' }
          ],
          value: radioVal,
          onchange: v => setRadioVal(v)
        }),
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
    ),

    DemoGroup('Slider',
      div({ class: css('_flex _col _gap3'), style: 'max-width:320px' },
        Slider({ value: sliderVal, onchange: v => setSliderVal(v), min: 0, max: 100 }),
        Slider({ value: 30, disabled: true, min: 0, max: 100 })
      )
    )
  );
}
