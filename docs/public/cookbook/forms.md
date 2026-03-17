# Cookbook: Forms

Advanced form handling with validation, field arrays, and multi-step flows using Decantr's reactive form system.

## Basic Form with createForm

`createForm` provides reactive form state, validation, dirty tracking, and submission handling:

```js
import { tags } from 'decantr/tags';
import { text, cond } from 'decantr/core';
import { css } from 'decantr/css';
import { createForm, validators } from 'decantr/form';
import { Button, Input, Alert } from 'decantr/components';

const { div, h2, p } = tags;

export default function ContactPage() {
  const form = createForm({
    fields: {
      name: {
        value: '',
        validators: [validators.required(), validators.minLength(2)]
      },
      email: {
        value: '',
        validators: [validators.required(), validators.email()]
      },
      message: {
        value: '',
        validators: [validators.required(), validators.minLength(10)]
      }
    },
    onSubmit: async (values) => {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
    }
  });

  return div({ class: css('_flex _col _gap4 _p6 _mw[600px] _mxa') },
    h2({ class: css('_heading3') }, 'Contact Us'),

    cond(() => form.submitError(), () =>
      Alert({ variant: 'error' }, text(() => form.submitError()))
    ),

    cond(() => form.isSubmitSuccessful(), () =>
      Alert({ variant: 'success' }, 'Message sent successfully!')
    ),

    Input({
      label: 'Name',
      value: form.field('name').value,
      oninput: (e) => form.field('name').setValue(e.target.value),
      onblur: () => form.field('name').touch(),
    }),
    cond(() => form.field('name').errors().length > 0, () =>
      p({ class: css('_textsm _fgerror') }, text(() => form.field('name').errors()[0]))
    ),

    Input({
      label: 'Email',
      type: 'email',
      value: form.field('email').value,
      oninput: (e) => form.field('email').setValue(e.target.value),
      onblur: () => form.field('email').touch(),
    }),
    cond(() => form.field('email').errors().length > 0, () =>
      p({ class: css('_textsm _fgerror') }, text(() => form.field('email').errors()[0]))
    ),

    Input({
      label: 'Message',
      value: form.field('message').value,
      oninput: (e) => form.field('message').setValue(e.target.value),
      onblur: () => form.field('message').touch(),
    }),
    cond(() => form.field('message').errors().length > 0, () =>
      p({ class: css('_textsm _fgerror') }, text(() => form.field('message').errors()[0]))
    ),

    div({ class: css('_flex _jce _gap3 _mt4') },
      Button({
        variant: 'outline',
        onclick: () => form.reset(),
        disabled: !form.isDirty()
      }, 'Reset'),
      Button({
        variant: 'primary',
        onclick: () => form.submit(),
        loading: form.isSubmitting(),
        disabled: !form.isValid()
      }, 'Send')
    )
  );
}
```

## Built-in Validators

Decantr ships 10 validator factories:

```js
import { validators } from 'decantr/form';

validators.required('This field is required')        // Non-empty check
validators.minLength(3, 'Too short')                  // String length >= n
validators.maxLength(100, 'Too long')                 // String length <= n
validators.min(0, 'Must be positive')                 // Number >= n
validators.max(999, 'Too large')                      // Number <= n
validators.email('Invalid email')                     // Email format
validators.pattern(/^\d{5}$/, 'Must be 5 digits')    // Regex match
validators.match('password', 'Passwords must match')  // Cross-field equality
validators.custom((val) => val.includes('@') || 'Must contain @')  // Sync custom
validators.async(async (val) => {                     // Async custom
  const res = await fetch(`/api/check-email?email=${val}`);
  const data = await res.json();
  return data.available || 'Email already taken';
})
```

All validators return `null` when valid or an error message string when invalid. The message parameter is optional — each validator has a sensible default.

## Form State API

```js
const form = createForm({ fields: { /* ... */ }, onSubmit: fn });

// Form-level state
form.isValid();             // true if all fields pass validation
form.isDirty();             // true if any field differs from initial value
form.isSubmitting();        // true during onSubmit execution
form.isSubmitSuccessful();  // true after successful submit
form.submitError();         // error message or null
form.values();              // { name: '...', email: '...' }

// Form-level actions
form.submit();              // Validate all, then call onSubmit
form.reset();               // Reset all fields to initial values
form.setValues({ name: 'Alice', email: 'alice@example.com' });

// Field-level state
const nameField = form.field('name');
nameField.value();          // Current value (signal getter)
nameField.errors();         // Array of error strings
nameField.touched();        // true after blur
nameField.dirty();          // true if changed from initial

// Field-level actions
nameField.setValue('Alice');
nameField.touch();
nameField.validate();       // Run validators immediately
nameField.reset();          // Reset to initial value
```

## Registration Form with Cross-Field Validation

```js
const form = createForm({
  fields: {
    name: {
      value: '',
      validators: [validators.required(), validators.minLength(2)]
    },
    email: {
      value: '',
      validators: [
        validators.required(),
        validators.email(),
        validators.async(async (email) => {
          const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
          const data = await res.json();
          return data.available || 'This email is already registered';
        })
      ]
    },
    password: {
      value: '',
      validators: [
        validators.required(),
        validators.minLength(8, 'Password must be at least 8 characters'),
        validators.pattern(/[A-Z]/, 'Must contain an uppercase letter'),
        validators.pattern(/[0-9]/, 'Must contain a number')
      ]
    },
    confirmPassword: {
      value: '',
      validators: [
        validators.required(),
        validators.match('password', 'Passwords do not match')
      ]
    }
  },
  onSubmit: async (values) => {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: values.name, email: values.email, password: values.password })
    });
  }
});
```

## Dynamic Field Arrays

Build forms where the user can add and remove fields dynamically:

```js
import { tags } from 'decantr/tags';
import { list, cond } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { Button, Input } from 'decantr/components';
import { icon } from 'decantr/components';

const { div, h3, span } = tags;

function IngredientsEditor() {
  const [ingredients, setIngredients] = createSignal([
    { name: '', quantity: '', unit: 'g' }
  ]);

  const addRow = () => {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: 'g' }]);
  };

  const removeRow = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setIngredients(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  return div({ class: css('_flex _col _gap3') },
    h3({ class: css('_heading5') }, 'Ingredients'),

    list(ingredients, (item, index) =>
      div({ class: css('_flex _gap2 _aic') },
        Input({
          placeholder: 'Ingredient',
          value: () => item.name,
          oninput: (e) => updateRow(index, 'name', e.target.value),
          class: css('_flex1')
        }),
        Input({
          placeholder: 'Qty',
          type: 'number',
          value: () => item.quantity,
          oninput: (e) => updateRow(index, 'quantity', e.target.value),
          class: css('_w[80px]')
        }),
        Input({
          placeholder: 'Unit',
          value: () => item.unit,
          oninput: (e) => updateRow(index, 'unit', e.target.value),
          class: css('_w[80px]')
        }),
        Button({
          variant: 'ghost',
          size: 'sm',
          onclick: () => removeRow(index),
          disabled: ingredients().length <= 1
        }, icon('trash-2'))
      )
    ),

    Button({ variant: 'outline', size: 'sm', onclick: addRow }, icon('plus'), ' Add Ingredient'),

    // Hidden summary
    span({ class: css('_textsm _fgmuted') },
      () => `${ingredients().filter(i => i.name.trim()).length} ingredient(s)`
    )
  );
}
```

## Multi-Step Form

Break a long form into pages with navigation:

```js
import { tags } from 'decantr/tags';
import { text, cond } from 'decantr/core';
import { createSignal, createMemo } from 'decantr/state';
import { css } from 'decantr/css';
import { Button, Input, Select, Card, Progress } from 'decantr/components';

const { div, h2, h3, p } = tags;

export default function OnboardingForm() {
  const [step, setStep] = createSignal(0);
  const totalSteps = 3;
  const progress = createMemo(() => ((step() + 1) / totalSteps) * 100);

  // Form data across steps
  const [data, setData] = createSignal({
    name: '', email: '', company: '',
    plan: 'starter', seats: 1,
    cardNumber: '', expiry: '', cvc: ''
  });

  const update = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = createMemo(() => {
    const d = data();
    if (step() === 0) return d.name && d.email;
    if (step() === 1) return d.plan;
    if (step() === 2) return d.cardNumber && d.expiry && d.cvc;
    return false;
  });

  return div({ class: css('_flex _col _aic _jcc _minhscreen _p6 _bgmuted') },
    Card({ class: css('_w[500px] _mw[100%]') },
      Card.Header({},
        h2({ class: css('_heading4 _tc') }, 'Setup Your Account'),
        Progress({ value: progress(), class: css('_mt3') }),
        p({ class: css('_textsm _fgmuted _tc _mt2') },
          () => `Step ${step() + 1} of ${totalSteps}`
        )
      ),

      Card.Body({ class: css('_flex _col _gap4') },

        // Step 1: Basic Info
        cond(() => step() === 0, () =>
          div({ class: css('_flex _col _gap3') },
            h3({ class: css('_heading5') }, 'Basic Information'),
            Input({ label: 'Full Name', value: () => data().name, oninput: (e) => update('name', e.target.value) }),
            Input({ label: 'Email', type: 'email', value: () => data().email, oninput: (e) => update('email', e.target.value) }),
            Input({ label: 'Company', value: () => data().company, oninput: (e) => update('company', e.target.value) })
          )
        ),

        // Step 2: Plan Selection
        cond(() => step() === 1, () =>
          div({ class: css('_flex _col _gap3') },
            h3({ class: css('_heading5') }, 'Choose a Plan'),
            Select({
              label: 'Plan',
              value: () => data().plan,
              options: [
                { label: 'Starter — $9/mo', value: 'starter' },
                { label: 'Pro — $29/mo', value: 'pro' },
                { label: 'Enterprise — $99/mo', value: 'enterprise' },
              ],
              onchange: (val) => update('plan', val)
            }),
            Input({
              label: 'Team Seats',
              type: 'number',
              value: () => data().seats,
              oninput: (e) => update('seats', parseInt(e.target.value) || 1)
            })
          )
        ),

        // Step 3: Payment
        cond(() => step() === 2, () =>
          div({ class: css('_flex _col _gap3') },
            h3({ class: css('_heading5') }, 'Payment Details'),
            Input({ label: 'Card Number', placeholder: '4242 4242 4242 4242', value: () => data().cardNumber, oninput: (e) => update('cardNumber', e.target.value) }),
            div({ class: css('_grid _gc2 _gap3') },
              Input({ label: 'Expiry', placeholder: 'MM/YY', value: () => data().expiry, oninput: (e) => update('expiry', e.target.value) }),
              Input({ label: 'CVC', placeholder: '123', value: () => data().cvc, oninput: (e) => update('cvc', e.target.value) })
            )
          )
        )
      ),

      Card.Footer({ class: css('_flex _jcsb') },
        cond(() => step() > 0, () =>
          Button({ variant: 'outline', onclick: () => setStep(s => s - 1) }, 'Back')
        ),
        div({ class: css('_flex _gap2 _mis[auto]') },
          cond(() => step() < totalSteps - 1, () =>
            Button({
              variant: 'primary',
              disabled: !canProceed(),
              onclick: () => setStep(s => s + 1)
            }, 'Continue')
          ),
          cond(() => step() === totalSteps - 1, () =>
            Button({
              variant: 'primary',
              disabled: !canProceed(),
              onclick: () => console.log('Submit:', data())
            }, 'Complete Setup')
          )
        )
      )
    )
  );
}
```

## Form with useFormField

The `useFormField` helper simplifies binding form fields to input components:

```js
import { createForm, validators, useFormField } from 'decantr/form';
import { Input } from 'decantr/components';

const form = createForm({
  fields: {
    email: { value: '', validators: [validators.required(), validators.email()] }
  },
  onSubmit: async (values) => { /* ... */ }
});

// useFormField returns props you can spread into Input
const emailProps = useFormField(form, 'email');
// emailProps = { value, oninput, onblur, error, ... }

Input({ label: 'Email', ...emailProps });
```

## Transform Input Values

Apply transformations before storing field values:

```js
const form = createForm({
  fields: {
    email: {
      value: '',
      validators: [validators.required(), validators.email()],
      transform: (val) => val.toLowerCase().trim()
    },
    phone: {
      value: '',
      transform: (val) => val.replace(/\D/g, '')  // Strip non-digits
    }
  },
  onSubmit: async (values) => { /* values.email is already lowercase/trimmed */ }
});
```

## Key Takeaways

- `createForm` manages the full lifecycle: initial values, validation, dirty tracking, submission
- Validators are composable — stack multiple validators per field
- `validators.match` enables cross-field validation (e.g., password confirmation)
- `validators.async` for server-side checks with automatic debouncing
- Build dynamic fields with `createSignal` + `list()` for add/remove patterns
- Multi-step forms use a step signal with `cond()` to show/hide sections
- `useFormField` reduces boilerplate when binding forms to Input components
