# Form System Reference

`import { createForm, validators, useFormField } from 'decantr/form';`

## createForm(config)

### Config Shape

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `fields` | `{ [name]: FieldConfig }` | `{}` | Field definitions |
| `onSubmit` | `async (values, form) => void` | — | Submit handler |
| `validate` | `(values) => { [name]: string[] }` | — | Cross-field validation |
| `validateOn` | `'onChange' \| 'onBlur' \| 'onSubmit'` | `'onBlur'` | Validation trigger mode |

### FieldConfig

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `value` | `any` | `''` | Initial value |
| `validators` | `Function[]` | `[]` | Array of validator functions |
| `transform` | `(raw) => transformed` | — | Transform applied on every `setValue` |

### FormInstance API

| Member | Type | Description |
|--------|------|-------------|
| `field(name)` | `(string) => FieldInstance` | Get/create field by name |
| `fields` | `Proxy` | Dot-access fields: `form.fields.email.value()` |
| `values()` | `() => Object` | Memo — all current field + fieldArray values |
| `errors()` | `() => { [name]: string[] }` | Memo — all fields with errors |
| `isValid()` | `() => boolean` | Memo — true when all fields have zero errors |
| `isDirty()` | `() => boolean` | Memo — true when any field differs from initial |
| `isSubmitting()` | `() => boolean` | Signal — true during `onSubmit` execution |
| `isSubmitted()` | `() => boolean` | Signal — true after successful submit |
| `submitCount()` | `() => number` | Signal — number of submit attempts |
| `submit()` | `() => Promise<void>` | Touch all fields, validate, call `onSubmit` if valid |
| `reset(values?)` | `(Object?) => void` | Reset all fields; optional new initial values |
| `setValues(partial)` | `(Object) => void` | Batch-set multiple field values |
| `setErrors(errs)` | `(Object) => void` | Batch-set errors: `{ name: string \| string[] }` |
| `validate()` | `() => Promise<boolean>` | Run all field + cross-field validators |
| `fieldArray(name)` | `(string) => FieldArrayInstance` | Get/create field array |
| `watch(name, cb)` | `(string, (val, prev) => void) => unsub` | Watch single field changes |
| `watchAll(cb)` | `((values) => void) => unsub` | Watch any field change |

### Submit Flow

1. Increment `submitCount`
2. Touch all fields (batch)
3. Run all field validators (sync + async)
4. Run `config.validate` cross-field validator (if provided)
5. If all valid, set `isSubmitting(true)`, call `onSubmit(values, form)`
6. On completion, set `isSubmitted(true)`, `isSubmitting(false)`

## FieldInstance API

Returned by `form.field(name)` or `form.fields.name`.

| Member | Type | Description |
|--------|------|-------------|
| `name` | `string` | Field name |
| `value()` | `() => any` | Signal — current value |
| `error()` | `() => string \| null` | Memo — first error or null |
| `errors()` | `() => string[]` | Signal — all error messages |
| `touched()` | `() => boolean` | Signal — true after blur |
| `dirty()` | `() => boolean` | Memo — true when value differs from initial |
| `valid()` | `() => boolean` | Memo — true when no errors |
| `setValue(v)` | `(any \| (prev) => any) => void` | Set value (accepts updater fn); triggers validation per `validateOn` |
| `setTouched()` | `() => void` | Mark as touched; triggers validation if `validateOn: 'onBlur'` |
| `setError(msg)` | `(string) => void` | Set a single error manually |
| `reset(val?)` | `(any?) => void` | Reset to initial (or provided) value, clear errors/touched |
| `validate()` | `() => Promise<boolean>` | Run all validators imperatively |
| `bind()` | `() => BindProps` | Returns props object for component binding |

### bind() Return Shape

```
{ value, onchange, onblur, error }
```

- `value` — signal getter
- `onchange` — auto-extracts `e.target.value` from DOM events or accepts raw values
- `onblur` — calls `setTouched()`
- `error` — signal getter (first error or null)

Spread into any form component: `Input({ ...form.field('email').bind() })`

## validators

All return `(value, allValues) => string|null`. Custom message via last `msg` param.

| Validator | Signature | Default Message |
|-----------|-----------|-----------------|
| `required` | `(msg?)` | `'Required'` |
| `minLength` | `(n, msg?)` | `'Must be at least {n} characters'` |
| `maxLength` | `(n, msg?)` | `'Must be at most {n} characters'` |
| `min` | `(n, msg?)` | `'Must be at least {n}'` |
| `max` | `(n, msg?)` | `'Must be at most {n}'` |
| `pattern` | `(regex, msg?)` | `'Invalid format'` |
| `email` | `(msg?)` | `'Invalid email address'` |
| `match` | `(fieldName, msg?)` | `'Must match {fieldName}'` |
| `custom` | `(fn, msg?)` | `'Invalid'` |
| `async` | `(fn, msg?)` | `'Invalid'` |

### Validator behavior

- **Sync validators** run immediately on trigger (`onChange`/`onBlur`/`onSubmit`)
- **Async validators** (`validators.async()`) auto-debounce at 300ms; only run if all sync validators pass
- `custom(fn)` — `fn(value, allValues)` returns `true` (valid) or error string
- `async(fn)` — `fn(value, allValues)` returns `Promise<true|string>`
- `match(fieldName)` — cross-field equality check via `allValues[fieldName]`

## useFormField(form, name)

Convenience hook — delegates to `form.field(name)`.

| Key | Type | Source |
|-----|------|--------|
| `value` | `() => any` | `field.value` |
| `setValue` | `(any) => void` | `field.setValue` |
| `error` | `() => string \| null` | `field.error` |
| `errors` | `() => string[]` | `field.errors` |
| `touched` | `() => boolean` | `field.touched` |
| `dirty` | `() => boolean` | `field.dirty` |
| `valid` | `() => boolean` | `field.valid` |
| `onBlur` | `() => void` | `field.setTouched` |
| `bind` | `() => BindProps` | `field.bind` |

## fieldArray(name)

Returned by `form.fieldArray(name)`. Initial value from `config.fields[name].value` (must be array).

| Member | Type | Description |
|--------|------|-------------|
| `items()` | `() => any[]` | Signal — current array |
| `length()` | `() => number` | Memo — item count |
| `append(value)` | `(any) => void` | Add to end |
| `prepend(value)` | `(any) => void` | Add to beginning |
| `remove(index)` | `(number) => void` | Remove at index |
| `move(from, to)` | `(number, number) => void` | Move item between indices |
| `swap(a, b)` | `(number, number) => void` | Swap two items |
| `replace(index, value)` | `(number, any) => void` | Replace item at index |

## Integration Example

```javascript
import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { createForm, validators } from 'decantr/form';
import { Input, Button, Text } from 'decantr/components';
import { cond, text } from 'decantr/core';

const { form: formEl, div } = tags;

const form = createForm({
  fields: {
    email: { value: '', validators: [validators.required(), validators.email()] },
    password: { value: '', validators: [validators.required(), validators.minLength(8)] },
  },
  validateOn: 'onBlur',
  async onSubmit(values) {
    await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) });
  },
});

formEl({ class: css('_flex _col _gap4 _mw[24rem]'), onsubmit: (e) => { e.preventDefault(); form.submit(); } },
  div({ class: css('_flex _col _gap1') },
    Input({ type: 'email', placeholder: 'Email', ...form.field('email').bind() }),
    cond(() => form.fields.email.touched() && form.fields.email.error(),
      () => Text({ class: css('_fgdestructive _textSm') }, text(() => form.fields.email.error()))
    ),
  ),
  div({ class: css('_flex _col _gap1') },
    Input({ type: 'password', placeholder: 'Password', ...form.field('password').bind() }),
    cond(() => form.fields.password.touched() && form.fields.password.error(),
      () => Text({ class: css('_fgdestructive _textSm') }, text(() => form.fields.password.error()))
    ),
  ),
  Button({ type: 'submit', disabled: () => form.isSubmitting() }, 'Login'),
);
```

## Async Validation

```javascript
const form = createForm({
  fields: {
    username: {
      value: '',
      validators: [
        validators.required(),
        validators.minLength(3),
        validators.async(async (value) => {
          const res = await fetch(`/api/check-username?u=${value}`);
          const { available } = await res.json();
          return available ? true : 'Username already taken';
        }),
      ],
    },
  },
});
```

Async validators auto-debounce (300ms). They only execute when all sync validators pass. Pending async validation does not block — errors update reactively when the promise resolves.

## Error Handling

### Server-side errors

```javascript
const form = createForm({
  fields: { email: { value: '' }, password: { value: '' } },
  async onSubmit(values, form) {
    const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(values) });
    if (!res.ok) {
      const { errors } = await res.json();
      form.setErrors(errors); // { email: 'Not found', password: 'Incorrect' }
    }
  },
});
```

### Cross-field validation

```javascript
const form = createForm({
  fields: {
    password: { value: '' },
    confirm: { value: '' },
  },
  validate(values) {
    const errs = {};
    if (values.password !== values.confirm) {
      errs.confirm = ['Passwords do not match'];
    }
    return errs;
  },
});
```

Cross-field `validate` runs during `form.validate()` and `form.submit()`, after all per-field validators pass.

### Per-field imperative errors

```javascript
form.field('email').setError('This email is banned');
```

Cleared on next `setValue` or `reset`.

---

**See also:** `reference/component-lifecycle.md`, `reference/atoms.md`
