# 05 — Reactive State

Decantr uses signal-based reactivity for fine-grained DOM updates. No virtual DOM diffing — when a signal changes, only the specific DOM nodes that depend on it are updated.

## createSignal

The foundational primitive. Returns a `[getter, setter]` tuple:

```js
import { createSignal } from 'decantr/state';

const [count, setCount] = createSignal(0);

count();              // Read the value: 0
setCount(5);          // Set to 5
setCount(c => c + 1); // Update from previous: 6
```

**The getter is a function.** You must call it with `()` to read the value. This is how Decantr tracks which DOM nodes depend on which signals.

### Connecting Signals to the DOM

Use the `text()` function from core to create reactive text nodes:

```js
import { tags } from 'decantr/tags';
import { text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import { Button } from 'decantr/components';

const { div, span, h2 } = tags;

function Counter() {
  const [count, setCount] = createSignal(0);

  return div({ class: css('_flex _col _gap4 _p6 _aic') },
    h2({ class: css('_heading3') }, text(() => `Count: ${count()}`)),
    div({ class: css('_flex _gap2') },
      Button({ variant: 'outline', onclick: () => setCount(c => c - 1) }, '-'),
      Button({ variant: 'outline', onclick: () => setCount(c => c + 1) }, '+'),
      Button({ variant: 'ghost', onclick: () => setCount(0) }, 'Reset')
    )
  );
}
```

### Reactive Function Children

When you pass a function as a child to a tag function, it becomes a reactive text node that updates automatically:

```js
// Reactive text — re-renders when count() changes
span({}, () => `Items: ${count()}`)

// Static text — never changes
span({}, 'Hello world')
```

**Important:** Function children produce text nodes only. They must return a string. If you need to conditionally render DOM elements, use `cond()`.

### Reactive Attributes

Attributes can also be reactive by passing a function:

```js
div({
  class: () => css(isActive() ? '_bgprimary _fgprimary' : '_bgmuted _fgmuted'),
  style: () => `opacity: ${visible() ? 1 : 0}`
})
```

## createEffect

Effects run automatically when any signal they read changes:

```js
import { createEffect } from 'decantr/state';

const [name, setName] = createSignal('World');

createEffect(() => {
  console.log(`Hello, ${name()}`);  // Logs on every change to name
});

setName('Decantr');  // Logs: "Hello, Decantr"
```

Effects auto-track dependencies. Every signal read inside the effect function is subscribed to automatically.

### Effect Cleanup

If an effect returns a function, that function runs before the next execution and on dispose:

```js
createEffect(() => {
  const interval = setInterval(() => console.log(count()), 1000);
  return () => clearInterval(interval);  // Cleanup on re-run or dispose
});
```

### Dispose

`createEffect` returns a dispose function:

```js
const dispose = createEffect(() => {
  console.log(count());
});

dispose();  // Stop the effect permanently
```

## createMemo

Derived values that cache their result and only recompute when dependencies change:

```js
import { createMemo } from 'decantr/state';

const [price, setPrice] = createSignal(100);
const [quantity, setQuantity] = createSignal(3);

const total = createMemo(() => price() * quantity());

total();  // 300 — computed once
total();  // 300 — cached, not recomputed
setPrice(120);
total();  // 360 — recomputed because price changed
```

Memos are themselves trackable — effects that read a memo will only re-run when the memo's computed value actually changes.

## createStore

For reactive objects with per-property tracking:

```js
import { createStore } from 'decantr/state';

const [user, setUser] = createStore({
  name: 'Alice',
  email: 'alice@example.com',
  settings: { theme: 'dark', notifications: true }
});

// Read properties
user.name;  // 'Alice'

// Update a field
setUser('name', 'Bob');

// Nested update
setUser('settings', 'theme', 'light');
```

Only effects that read the changed property are notified. If you update `user.name`, effects reading `user.email` are unaffected.

## batch

Group multiple signal updates so effects run only once:

```js
import { batch } from 'decantr/state';

const [firstName, setFirstName] = createSignal('Alice');
const [lastName, setLastName] = createSignal('Smith');

// Without batch: effect runs twice (once per setter)
// With batch: effect runs once after both setters complete
batch(() => {
  setFirstName('Bob');
  setLastName('Jones');
});
```

## Conditional Rendering with `cond()`

Use `cond()` for conditionally rendering DOM elements:

```js
import { cond } from 'decantr/core';

const [loggedIn, setLoggedIn] = createSignal(false);

div({},
  cond(
    () => loggedIn(),
    () => span('Welcome back!'),      // Shown when true
    () => Button({ onclick: () => setLoggedIn(true) }, 'Log in')  // Shown when false
  )
)
```

**Never use a function child to return DOM elements.** Function children are for reactive text only:

```js
// WRONG — returns "[object HTMLElement]"
div({}, () => show() ? span('Hello') : null)

// CORRECT — use cond()
div({}, cond(() => show(), () => span('Hello')))
```

## List Rendering with `list()`

Render an array of items reactively:

```js
import { list } from 'decantr/core';

const [items, setItems] = createSignal(['Apple', 'Banana', 'Cherry']);

ul({},
  list(items, (item) => li({}, item))
)

// Add an item
setItems(prev => [...prev, 'Date']);
```

## Putting It Together

A complete interactive component:

```js
import { tags } from 'decantr/tags';
import { text, cond, list } from 'decantr/core';
import { createSignal, createMemo } from 'decantr/state';
import { css } from 'decantr/css';
import { Button, Input, Badge } from 'decantr/components';

const { div, h2, ul, li, span } = tags;

export default function TodoPage() {
  const [todos, setTodos] = createSignal([]);
  const [input, setInput] = createSignal('');
  const remaining = createMemo(() => todos().filter(t => !t.done).length);

  const addTodo = () => {
    if (!input()) return;
    setTodos(prev => [...prev, { text: input(), done: false }]);
    setInput('');
  };

  const toggle = (index) => {
    setTodos(prev => prev.map((t, i) => i === index ? { ...t, done: !t.done } : t));
  };

  return div({ class: css('_flex _col _gap4 _p6 _mw[600px] _mxa') },
    h2({ class: css('_heading3') }, 'Todo List'),

    div({ class: css('_flex _gap2') },
      Input({ placeholder: 'Add a task...', value: input, oninput: (e) => setInput(e.target.value) }),
      Button({ variant: 'primary', onclick: addTodo }, 'Add')
    ),

    span({ class: css('_textsm _fgmuted') }, () => `${remaining()} remaining`),

    ul({ class: css('_flex _col _gap2') },
      list(todos, (todo, i) =>
        li({ class: css('_flex _aic _gap3 _p3 _bgmuted _r2'), onclick: () => toggle(i) },
          span({ class: css(todo.done ? '_fgmuted _line-through' : '_fgfg') }, todo.text),
          cond(() => todo.done, () => Badge({ variant: 'success' }, 'Done'))
        )
      )
    )
  );
}
```

## What's Next

With state management covered, the next section adds routing for multi-page navigation.

---

Previous: [04 — Styling](./04-styling.md) | Next: [06 — Routing](./06-routing.md)
