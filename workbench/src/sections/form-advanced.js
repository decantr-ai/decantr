import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { ColorPicker, DatePicker, DateRangePicker, TimePicker, TimeRangePicker, Upload, Transfer, Cascader, TreeSelect, Form, Field, Input, Button } from 'decantr/components';
import { SectionHeader, DemoGroup, DemoRow } from './_shared.js';

const { div, section, h3, p } = tags;

export function FormAdvancedSection() {
  const [color, setColor] = createSignal('#1366D9');
  const [date, setDate] = createSignal(null);
  const [time, setTime] = createSignal(null);

  return section({ id: 'form-advanced', class: css('_flex _col _gap10') },
    SectionHeader('Advanced Form Components', 'Specialized inputs for color, date, time, file upload, data transfer, cascading selection, and structured forms.'),

    DemoGroup('ColorPicker', 'Inline color selection with optional preset swatches.',
      DemoRow(
        ColorPicker({ value: color, onChange: v => setColor(v) }),
        ColorPicker({
          value: '#22c55e',
          presets: ['#ef4444', '#f59e0b', '#22c55e', '#1366D9', '#8b5cf6', '#ec4899']
        }),
        ColorPicker({ value: '#999', disabled: true })
      )
    ),

    DemoGroup('DatePicker', 'Calendar-based date selection with placeholder and disabled states.',
      DemoRow(
        DatePicker({ value: date, onChange: v => setDate(v), placeholder: 'Select date' }),
        DatePicker({ disabled: true, placeholder: 'Disabled' })
      )
    ),

    DemoGroup('DateRangePicker', 'Dual-calendar panel for selecting a start and end date.',
      DemoRow(
        DateRangePicker({ placeholder: 'Select date range', onchange: v => {} }),
        DateRangePicker({ disabled: true, placeholder: 'Disabled' })
      )
    ),

    DemoGroup('TimePicker', 'Time input supporting 12/24-hour formats and optional seconds.',
      DemoRow(
        TimePicker({ value: time, onChange: v => setTime(v), placeholder: 'Select time' }),
        TimePicker({ use12h: true, placeholder: '12-hour format' }),
        TimePicker({ showSeconds: false, placeholder: 'No seconds' })
      )
    ),

    DemoGroup('TimeRangePicker', 'Dual time selectors for picking a start and end time.',
      DemoRow(
        TimeRangePicker({ placeholder: 'Select time range', onchange: v => {} }),
        TimeRangePicker({ value: ['09:00', '17:00'], placeholder: 'Business hours' }),
        TimeRangePicker({ disabled: true, placeholder: 'Disabled' })
      )
    ),

    DemoGroup('Upload', 'Drag-and-drop or click-to-upload file input with size and type constraints.',
      div({ class: css('_flex _col _gap4'), style: 'max-width:400px' },
        Upload({
          accept: 'image/*',
          multiple: true,
          maxSize: 5 * 1024 * 1024,
          onUpload: files => {}
        }, p({ class: css('_fg4 _tc _p4') }, 'Click or drag files to upload')),
        Upload({
          disabled: true,
          onUpload: files => {}
        }, p({ class: css('_fg4 _tc _p4') }, 'Upload disabled'))
      )
    ),

    DemoGroup('Transfer', 'Dual-list transfer with search filtering between source and target.',
      Transfer({
        dataSource: [
          { key: '1', label: 'Item 1' },
          { key: '2', label: 'Item 2' },
          { key: '3', label: 'Item 3' },
          { key: '4', label: 'Item 4' },
          { key: '5', label: 'Item 5' },
          { key: '6', label: 'Item 6' }
        ],
        targetKeys: ['3', '5'],
        titles: ['Source', 'Target'],
        searchable: true,
        onChange: (keys) => {}
      })
    ),

    DemoGroup('Cascader', 'Multi-level dropdown for hierarchical data selection.',
      DemoRow(
        Cascader({
          options: [
            { label: 'California', value: 'ca', children: [
              { label: 'San Francisco', value: 'sf' },
              { label: 'Los Angeles', value: 'la' },
              { label: 'San Diego', value: 'sd' }
            ]},
            { label: 'New York', value: 'ny', children: [
              { label: 'New York City', value: 'nyc' },
              { label: 'Buffalo', value: 'buf' }
            ]},
            { label: 'Texas', value: 'tx', children: [
              { label: 'Houston', value: 'hou' },
              { label: 'Austin', value: 'aus' },
              { label: 'Dallas', value: 'dal' }
            ]}
          ],
          placeholder: 'Select location'
        })
      )
    ),

    DemoGroup('TreeSelect', 'Dropdown with hierarchical tree data for single or multiple selection.',
      DemoRow(
        TreeSelect({
          options: [
            { label: 'Engineering', value: 'eng', children: [
              { label: 'Frontend', value: 'fe', children: [
                { label: 'React Team', value: 'react' },
                { label: 'Vue Team', value: 'vue' }
              ]},
              { label: 'Backend', value: 'be', children: [
                { label: 'API Team', value: 'api' },
                { label: 'Infra Team', value: 'infra' }
              ]}
            ]},
            { label: 'Design', value: 'design', children: [
              { label: 'UI/UX', value: 'uiux' },
              { label: 'Brand', value: 'brand' }
            ]},
            { label: 'Product', value: 'product' }
          ],
          placeholder: 'Select team'
        }),
        TreeSelect({
          options: [
            { label: 'California', value: 'ca', children: [
              { label: 'San Francisco', value: 'sf' },
              { label: 'Los Angeles', value: 'la' }
            ]},
            { label: 'New York', value: 'ny', children: [
              { label: 'New York City', value: 'nyc' },
              { label: 'Buffalo', value: 'buf' }
            ]}
          ],
          multiple: true,
          checkable: true,
          placeholder: 'Select locations'
        })
      )
    ),

    DemoGroup('Form + Field', 'Structured form layout with validation, help text, and action buttons.',
      div({ style: 'max-width:400px' },
        Form({ layout: 'vertical', onSubmit: () => {} },
          Field({ label: 'Username', required: true },
            Input({ placeholder: 'Enter username' })
          ),
          Field({ label: 'Email', required: true, help: 'We\'ll never share your email.' },
            Input({ type: 'email', placeholder: 'Enter email' })
          ),
          Field({ label: 'Bio' },
            Input({ placeholder: 'Optional bio' })
          ),
          Form.Actions({},
            Button({ variant: 'primary', type: 'submit' }, 'Submit'),
            Button({ variant: 'ghost' }, 'Cancel')
          )
        )
      )
    )
  );
}
