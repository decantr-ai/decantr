import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createForm, validators } from '../src/form/index.js';

describe('createForm', () => {
  it('creates form with initial values', () => {
    const form = createForm({
      fields: {
        name: { value: 'Alice' },
        age: { value: 30 }
      }
    });
    assert.equal(form.field('name').value(), 'Alice');
    assert.equal(form.field('age').value(), 30);
  });

  it('field().value() returns current value', () => {
    const form = createForm({
      fields: { email: { value: 'test@example.com' } }
    });
    assert.equal(form.field('email').value(), 'test@example.com');
  });

  it('field().setValue() updates value', () => {
    const form = createForm({
      fields: { name: { value: '' } }
    });
    form.field('name').setValue('Bob');
    assert.equal(form.field('name').value(), 'Bob');
  });

  it('isDirty tracks changes', () => {
    const form = createForm({
      fields: { name: { value: 'original' } }
    });
    assert.equal(form.isDirty(), false);
    form.field('name').setValue('changed');
    assert.equal(form.isDirty(), true);
    form.field('name').setValue('original');
    assert.equal(form.isDirty(), false);
  });

  it('validate runs all validators', async () => {
    const form = createForm({
      fields: {
        email: { value: '', validators: [validators.required(), validators.email()] }
      }
    });
    const valid = await form.validate();
    assert.equal(valid, false);
    assert.ok(form.field('email').error());
  });

  it('submit calls onSubmit with values', async () => {
    let submittedValues = null;
    const form = createForm({
      fields: {
        name: { value: 'Alice' },
        age: { value: 25 }
      },
      async onSubmit(values) { submittedValues = values; }
    });
    await form.submit();
    assert.deepEqual(submittedValues, { name: 'Alice', age: 25 });
  });

  it('required validator rejects empty', async () => {
    const form = createForm({
      fields: {
        name: { value: '', validators: [validators.required()] }
      }
    });
    const valid = await form.validate();
    assert.equal(valid, false);
    assert.equal(form.field('name').error(), 'Required');
  });

  it('email validator rejects invalid', async () => {
    const form = createForm({
      fields: {
        email: { value: 'notanemail', validators: [validators.email()] }
      }
    });
    const valid = await form.validate();
    assert.equal(valid, false);
    assert.equal(form.field('email').error(), 'Invalid email address');
  });

  it('cross-field validation works', async () => {
    const form = createForm({
      fields: {
        password: { value: 'abc123' },
        confirm: { value: 'abc456' }
      },
      validate(values) {
        if (values.password !== values.confirm) {
          return { confirm: ['Passwords must match'] };
        }
        return {};
      }
    });
    const valid = await form.validate();
    assert.equal(valid, false);
  });

  it('field.bind() returns component-compatible props', () => {
    const form = createForm({
      fields: { name: { value: 'test' } }
    });
    const bound = form.field('name').bind();
    assert.equal(typeof bound.value, 'function');
    assert.equal(typeof bound.onchange, 'function');
    assert.equal(typeof bound.onblur, 'function');
    assert.equal(typeof bound.error, 'function');
    assert.equal(bound.value(), 'test');
  });

  it('reset restores initial values', () => {
    const form = createForm({
      fields: { name: { value: 'Alice' } }
    });
    form.field('name').setValue('Bob');
    assert.equal(form.field('name').value(), 'Bob');
    form.reset();
    assert.equal(form.field('name').value(), 'Alice');
    assert.equal(form.isDirty(), false);
  });

  it('setValues updates multiple fields', () => {
    const form = createForm({
      fields: {
        first: { value: '' },
        last: { value: '' }
      }
    });
    form.setValues({ first: 'John', last: 'Doe' });
    assert.equal(form.field('first').value(), 'John');
    assert.equal(form.field('last').value(), 'Doe');
  });

  it('values() returns all current values', () => {
    const form = createForm({
      fields: {
        a: { value: 1 },
        b: { value: 2 }
      }
    });
    const vals = form.values();
    assert.deepEqual(vals, { a: 1, b: 2 });
  });
});

describe('validators', () => {
  it('required', () => {
    const v = validators.required();
    assert.equal(v(''), 'Required');
    assert.equal(v(null), 'Required');
    assert.equal(v(undefined), 'Required');
    assert.equal(v('hello'), null);
    assert.equal(v(0), null);
    assert.equal(v(false), null);
  });

  it('minLength', () => {
    const v = validators.minLength(3);
    assert.ok(v('ab'));
    assert.equal(v('abc'), null);
    assert.equal(v('abcd'), null);
  });

  it('maxLength', () => {
    const v = validators.maxLength(5);
    assert.equal(v('hello'), null);
    assert.ok(v('toolong'));
  });

  it('min/max', () => {
    const minV = validators.min(10);
    assert.ok(minV(5));
    assert.equal(minV(10), null);
    assert.equal(minV(15), null);

    const maxV = validators.max(100);
    assert.ok(maxV(150));
    assert.equal(maxV(100), null);
    assert.equal(maxV(50), null);
  });

  it('pattern', () => {
    const v = validators.pattern(/^\d+$/);
    assert.equal(v('123'), null);
    assert.ok(v('abc'));
    assert.ok(v('12a'));
  });

  it('email', () => {
    const v = validators.email();
    assert.equal(v('user@example.com'), null);
    assert.ok(v('notanemail'));
    assert.ok(v('missing@'));
    // Empty string should pass (use required() for empty checks)
    assert.equal(v(''), null);
  });

  it('match', () => {
    const v = validators.match('password');
    assert.equal(v('abc', { password: 'abc' }), null);
    assert.ok(v('abc', { password: 'xyz' }));
  });

  it('custom', () => {
    const v = validators.custom((val) => {
      if (val === 'secret') return true;
      return 'Must be "secret"';
    });
    assert.equal(v('secret', {}), null);
    assert.equal(v('wrong', {}), 'Must be "secret"');
  });
});

describe('fieldArray', () => {
  it('append adds item', () => {
    const form = createForm({ fields: {} });
    const arr = form.fieldArray('tags');
    arr.append('tag1');
    arr.append('tag2');
    assert.deepEqual(arr.items(), ['tag1', 'tag2']);
    assert.equal(arr.length(), 2);
  });

  it('remove deletes item', () => {
    const form = createForm({
      fields: { items: { value: ['a', 'b', 'c'] } }
    });
    const arr = form.fieldArray('items');
    assert.deepEqual(arr.items(), ['a', 'b', 'c']);
    arr.remove(1);
    assert.deepEqual(arr.items(), ['a', 'c']);
  });

  it('move reorders items', () => {
    const form = createForm({
      fields: { items: { value: ['x', 'y', 'z'] } }
    });
    const arr = form.fieldArray('items');
    arr.move(0, 2);
    assert.deepEqual(arr.items(), ['y', 'z', 'x']);
  });

  it('swap exchanges two items', () => {
    const form = createForm({
      fields: { items: { value: [1, 2, 3] } }
    });
    const arr = form.fieldArray('items');
    arr.swap(0, 2);
    assert.deepEqual(arr.items(), [3, 2, 1]);
  });

  it('prepend adds to beginning', () => {
    const form = createForm({ fields: {} });
    const arr = form.fieldArray('list');
    arr.append('b');
    arr.prepend('a');
    assert.deepEqual(arr.items(), ['a', 'b']);
  });

  it('replace updates item at index', () => {
    const form = createForm({
      fields: { items: { value: ['old'] } }
    });
    const arr = form.fieldArray('items');
    arr.replace(0, 'new');
    assert.deepEqual(arr.items(), ['new']);
  });
});
