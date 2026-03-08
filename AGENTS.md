# Decantr — Framework Translation Layer

**This is a Decantr project.** Use Decantr APIs exclusively. Do not suggest installing or using React, Vue, Angular, Svelte, Next.js, Nuxt, Tailwind, Bootstrap, or any external UI/CSS framework. Decantr is a zero-dependency web framework with its own component library, routing, state management, atomic CSS engine, and theme system.

If a user references patterns from other frameworks (e.g., "add a ShadCN dialog" or "use useState"), translate the intent into the Decantr equivalent using the tables below. Do not reach for external packages when Decantr has a built-in solution.

---

## Quick Equivalence Cheat Sheet

This table resolves 80% of framework translation needs. Scan here first.

| Concept | React / Next.js | Vue 3 / Nuxt | Svelte / Kit | Angular | **Decantr** |
|---------|----------------|-------------|-------------|---------|-------------|
| Element creation | JSX `<div>` | `<template>` | `<div>` | template | `const { div } = tags` |
| Reactive state | `useState(init)` | `ref(init)` | `$state` | `signal(init)` | `createSignal(init)` → `[get, set]` |
| Derived state | `useMemo(fn, deps)` | `computed(fn)` | `$derived` | `computed(fn)` | `createMemo(fn)` |
| Side effects | `useEffect(fn, deps)` | `watchEffect(fn)` | `$effect` | `effect(fn)` | `createEffect(fn)` — auto-tracked |
| Store / context | Context + Redux/Zustand | Pinia / provide-inject | stores | Services + RxJS | `createStore(obj)` |
| Routing | react-router | vue-router | SvelteKit | @angular/router | `createRouter({ routes })` |
| Conditional render | `{cond ? <A/> : <B/>}` | `v-if` / `v-else` | `{#if}` | `@if` | `cond(pred, trueFn, falseFn)` |
| List render | `.map(item => <X key=.../>)` | `v-for` + `:key` | `{#each}` | `@for` | `list(items, keyFn, renderFn)` |
| CSS / styling | Tailwind / CSS-in-JS | scoped `<style>` | scoped `<style>` | ViewEncapsulation | `css('_flex _gap4 _p6 _bg2')` |
| Component library | ShadCN / MUI / Radix | Element Plus / PrimeVue | Skeleton / Melt | Angular Material | `decantr/components` (28 components) |
| Build / deploy | Next.js / Vite | Nuxt / Vite | SvelteKit / Vite | Angular CLI | `decantr build` → `dist/` |
| Testing | Jest / Vitest | Vitest | Vitest | Karma / Jest | `decantr/test` (node:test based) |

---

## Tier 1: Full Framework Mappings

### React

| React API | Decantr Equivalent |
|-----------|-------------------|
| `React.createElement('div', props, ...children)` | `const { div } = tags; div(props, ...children)` |
| `<div className="x">` (JSX) | `div({ class: css('_flex _p4') }, ...)` |
| `<>{child1}{child2}</>` (Fragment) | Just pass multiple children: `div(child1, child2)` |
| `useState(initial)` | `createSignal(initial)` → `[getter, setter]`. Read: `getter()`. Write: `setter(val)` |
| `useReducer(reducer, init)` | `createSignal(init)` + dispatch function that calls `setter` |
| `useMemo(fn, [deps])` | `createMemo(fn)` — deps are auto-tracked |
| `useCallback(fn, [deps])` | Not needed — no VDOM reconciliation. Just use the function directly |
| `useEffect(fn, [deps])` | `createEffect(fn)` — deps are auto-tracked, no dependency array needed |
| `useEffect(() => () => cleanup, [])` | `onDestroy(() => cleanup)` |
| `useEffect(() => {...}, [])` (mount-only) | `onMount(() => {...})` |
| `useRef(null)` | Assign via `const el = div(...)` — elements are real DOM nodes |
| `useContext(MyContext)` | `createStore(obj)` or import shared signals directly |
| `createContext` + `Provider` | `createStore(obj)` — no provider wrapper needed |
| `useId()` | Not needed — no SSR hydration mismatch concerns |
| `forwardRef` | Not needed — components return real DOM elements |
| `React.lazy(() => import(...))` | Standard dynamic `import()` — no wrapper needed |
| `Suspense` | `cond(() => isLoading(), fallback, content)` |
| `createPortal(child, container)` | `document.body.appendChild(el)` — real DOM, no portals needed |
| `ReactDOM.createRoot(el).render(<App/>)` | `mount(document.getElementById('app'), () => App())` |
| `className={clsx('a', cond && 'b')}` | `class: css('_a', cond && '_b')` |
| `style={{ color: 'red' }}` | `style: 'color:red'` |
| `onClick={handler}` | `onclick: handler` (lowercase, native DOM) |
| `onChange={handler}` | `oninput: handler` (for inputs — native DOM event) |
| `<Link to="/about">` (React Router) | `link({ href: '/about' }, 'About')` |
| `useNavigate()` then `nav('/path')` | `navigate('/path')` |
| `useLocation()` / `useParams()` | `useRoute()` → signal with `path`, `params`, `query` |
| `<Routes><Route path="/" element={...}/></Routes>` | `createRouter({ routes: [{ path: '/', component: Home }] })` |

### Vue 3

| Vue 3 API | Decantr Equivalent |
|-----------|-------------------|
| `<template>` + SFC | `const { div, p } = tags; div(p('Hello'))` |
| `ref(value)` | `createSignal(value)` → `[get, set]`. Read: `get()` not `.value` |
| `reactive(obj)` | `createStore(obj)` — per-property proxy tracking |
| `computed(() => ...)` | `createMemo(() => ...)` |
| `watch(source, cb)` | `createEffect(() => { const v = source(); /* react */ })` |
| `watchEffect(fn)` | `createEffect(fn)` — identical concept |
| `provide(key, value)` / `inject(key)` | Import shared signals/stores directly — no DI needed |
| `v-if` / `v-else` | `cond(pred, trueFn, falseFn)` |
| `v-for="item in items" :key="item.id"` | `list(() => items(), i => i.id, i => renderItem(i))` |
| `v-show` | `el.style.display = cond ? '' : 'none'` or toggle CSS class |
| `v-model` | `Input({ value: getter, oninput: e => setter(e.target.value) })` |
| `defineProps(['title'])` | Function parameter: `function MyComp({ title }) {}` |
| `defineEmits(['update'])` | Callback prop: `function MyComp({ onUpdate }) {}` |
| `<slot>` / `<slot name="x">` | Children arguments: `function MyComp(props, ...children) {}` |
| `<Teleport to="body">` | `document.body.appendChild(el)` — real DOM |
| `onMounted(fn)` | `onMount(fn)` |
| `onBeforeUnmount(fn)` | `onDestroy(fn)` |
| `<RouterLink :to="path">` | `link({ href: path }, 'Text')` |
| `useRouter().push(path)` | `navigate(path)` |
| `useRoute()` | `useRoute()` — same name, returns signal |
| Pinia store | `createStore(obj)` or module-level signals |
| `<Transition>` / `<TransitionGroup>` | CSS transitions via theme system + `_trans` atoms |

### Svelte

| Svelte API | Decantr Equivalent |
|------------|-------------------|
| `<div>` in `.svelte` file | `const { div } = tags; div(...)` |
| `let count = $state(0)` | `const [count, setCount] = createSignal(0)` |
| `$derived(expression)` | `createMemo(() => expression)` |
| `$effect(() => {...})` | `createEffect(() => {...})` |
| `$props()` | Function parameter: `function MyComp(props) {}` |
| `$bindable()` | Signal getter prop: `MyComp({ value: () => signal() })` |
| `{#if cond}...{:else}...{/if}` | `cond(pred, trueFn, falseFn)` |
| `{#each items as item (item.id)}` | `list(() => items(), i => i.id, i => render(i))` |
| `{#await promise}` | `createSignal` for loading/data/error states |
| `writable(value)` | `createSignal(value)` |
| `derived(store, fn)` | `createMemo(fn)` |
| `onMount(fn)` | `onMount(fn)` — same name |
| `onDestroy(fn)` | `onDestroy(fn)` — same name |
| `bind:value` | `Input({ value: getter, oninput: e => setter(e.target.value) })` |
| `on:click={handler}` | `onclick: handler` (lowercase, native DOM) |
| `class:active={isActive}` | `class: css(isActive && '_active')` |
| `transition:fade` | CSS transitions via theme system |
| `goto(path)` (SvelteKit) | `navigate(path)` |
| `$page` store (SvelteKit) | `useRoute()` |
| `+page.svelte` file routing | `createRouter({ routes: [...] })` |
| `+page.server.js` / `load()` | `onMount` + `fetch()` — Decantr is client-side |

### Angular

| Angular API | Decantr Equivalent |
|-------------|-------------------|
| `@Component({ template: '...' })` | `function MyComp(props) { return div(...); }` |
| `signal(value)` | `createSignal(value)` → `[get, set]` |
| `computed(() => ...)` | `createMemo(() => ...)` |
| `effect(() => ...)` | `createEffect(() => ...)` |
| `@Input() title` | Function parameter: `function MyComp({ title }) {}` |
| `@Output() clicked = new EventEmitter()` | Callback prop: `{ onclick: handler }` |
| `@if (cond) { } @else { }` | `cond(pred, trueFn, falseFn)` |
| `@for (item of items; track item.id)` | `list(() => items(), i => i.id, i => render(i))` |
| `[(ngModel)]="value"` | `Input({ value: getter, oninput: e => setter(e.target.value) })` |
| `HttpClient.get(url)` | `fetch(url).then(r => r.json())` |
| `Injectable` service | Module-level signals/stores — no DI needed |
| `BehaviorSubject` / `Observable` | `createSignal(value)` — simpler reactive primitive |
| `Router.navigate([path])` | `navigate(path)` |
| `routerLink` | `link({ href: path }, 'Text')` |
| `ActivatedRoute` | `useRoute()` |
| `ngOnInit` | `onMount(fn)` |
| `ngOnDestroy` | `onDestroy(fn)` |
| `NgModule` | Not needed — ES module imports |
| `<ng-content>` | Children arguments: `function MyComp(props, ...children) {}` |
| `ViewEncapsulation` | Decantr themes handle scoping via `d-{component}` CSS classes |
| `@defer` | Dynamic `import()` + `cond()` |
| `MatDialog.open(Component)` | `Modal({ visible: () => show(), onClose: () => setShow(false) })` |

---

## Tier 2: Key Architectural Differences

### Next.js / Nuxt

| Next.js / Nuxt Concept | Decantr Approach |
|------------------------|-----------------|
| Server Components (RSC) | Not applicable — Decantr is client-side SPA. All rendering happens in the browser |
| SSR / SSG / ISR | `decantr build` produces static SPA. For SSR, pair with a separate server |
| API Routes / Server Routes | Use a separate backend (Express, Hono, Fastify) or BaaS (Supabase, Firebase) |
| `getServerSideProps` / `useFetch` | `onMount` + `fetch()` with signals for loading/data/error |
| Middleware | Router guards via `createEffect` watching `useRoute()` |
| `<Image>` optimization | Standard `<img>` with lazy loading: `img({ loading: 'lazy', src })` |
| File-based routing | Explicit route config: `createRouter({ routes: [...] })` |
| `next/head` / `useHead` | Direct DOM: `document.title = 'Page'` |

### Astro

| Astro Concept | Decantr Approach |
|---------------|-----------------|
| `.astro` files + islands | Full client-side SPA — no partial hydration model |
| Content Collections | Fetch from API/CMS or import JSON directly |
| `<Component client:load>` | All components are client-side by default |
| Zero JS by default | Decantr is JS-first — ships a runtime. Optimized for interactive apps |
| Multi-framework support | Single framework — Decantr components only |

### Qwik

| Qwik Concept | Decantr Approach |
|--------------|-----------------|
| Resumability / `$` functions | Standard JS execution — no serialization boundary |
| `useSignal()` / `useStore()` | `createSignal()` / `createStore()` |
| `component$(() => ...)` | `function MyComp(props) { return div(...); }` |
| QRL lazy loading | Standard dynamic `import()` |
| `useTask$` / `useVisibleTask$` | `createEffect()` / `onMount()` |

### Solid.js

Solid.js is architecturally closest to Decantr. Key differences:

| Solid.js | Decantr |
|----------|---------|
| `createSignal(init)` | `createSignal(init)` — identical API |
| `createEffect(fn)` | `createEffect(fn)` — identical API |
| `createMemo(fn)` | `createMemo(fn)` — identical API |
| JSX `<div class="x">` | `const { div } = tags; div({ class: css('_x') })` |
| `<Show when={cond}>` | `cond(pred, trueFn, falseFn)` |
| `<For each={items}>` | `list(items, keyFn, renderFn)` |
| `createStore()` | `createStore()` — similar concept |
| `@solidjs/router` | `createRouter()` — built-in |

---

## Component Suite Mappings

### ShadCN / ui

| ShadCN Component | Decantr Equivalent | Notes |
|-----------------|-------------------|-------|
| `<Button>` | `Button({ variant, size })` | Variants: default, outline, ghost, destructive, link |
| `<Card>` + `<CardHeader>` etc. | `Card(props, ...children)` | Compound: `Card.Header`, `Card.Body`, `Card.Footer` |
| `<Dialog>` | `Modal({ title, visible, onClose })` | Role dialog + aria-modal built-in |
| `<Sheet>` | `Drawer({ visible, side, title })` | Side: left, right, top, bottom |
| `<AlertDialog>` | `Modal()` + `Alert()` | Compose Modal with Alert content |
| `<DropdownMenu>` | `Dropdown({ trigger, items })` | |
| `<Select>` | `Select({ options, value })` | |
| `<Combobox>` / `<Command>` | `Combobox({ options, value, onfilter })` | Searchable select |
| `<Popover>` | `Popover({ trigger, position })` | |
| `<Tooltip>` | `Tooltip({ content, position })` | |
| `<Tabs>` | `Tabs({ tabs, active })` | |
| `<Accordion>` | `Accordion({ items, multiple })` | |
| `<Input>` | `Input({ type, value, error })` | |
| `<Textarea>` | `Textarea({ value, rows })` | |
| `<Checkbox>` | `Checkbox({ checked, label })` | |
| `<Switch>` | `Switch({ checked, label })` | |
| `<RadioGroup>` | `RadioGroup({ options, value })` | |
| `<Slider>` | `Slider({ value, min, max, step })` | |
| `<Progress>` | `Progress({ value, max, variant })` | |
| `<Badge>` | `Badge({ count, status, color })` | |
| `<Avatar>` | `Avatar({ src, alt, size })` | |
| `<Skeleton>` | `Skeleton({ variant, width, height })` | |
| `<Separator>` | `Separator({ vertical, label })` | |
| `<Breadcrumb>` | `Breadcrumb({ items, separator })` | |
| `<Table>` | `Table({ columns, data, striped })` | |
| `<Pagination>` | `Pagination({ total, perPage, current })` | |
| `<Sonner>` / `toast()` | `toast({ message, variant, duration })` | |
| `<Alert>` | `Alert({ variant, dismissible })` | |
| `<Spinner>` | `Spinner({ size, label })` | |
| `<Calendar>` | *Not yet available* | Build with `list()` + date logic |
| `<DatePicker>` | *Not yet available* | Build with `Popover()` + calendar |
| `<NavigationMenu>` | *Not yet available* | Build with `tags` + `link()` |
| `<Menubar>` | *Not yet available* | Build with `Dropdown()` composition |

### MUI / Material UI

| MUI Component | Decantr Equivalent |
|--------------|-------------------|
| `<Button>` | `Button({ variant, size })` |
| `<TextField>` | `Input({ type, value, error })` |
| `<Select>` | `Select({ options, value })` |
| `<Checkbox>` | `Checkbox({ checked, label })` |
| `<Switch>` | `Switch({ checked, label })` |
| `<Radio>` + `<RadioGroup>` | `RadioGroup({ options, value })` |
| `<Slider>` | `Slider({ value, min, max })` |
| `<Card>` + `<CardContent>` | `Card()` + `Card.Header/Body/Footer` |
| `<Dialog>` | `Modal({ title, visible, onClose })` |
| `<Drawer>` | `Drawer({ visible, side })` |
| `<Snackbar>` / `<Alert>` | `toast({ message, variant })` / `Alert()` |
| `<Tooltip>` | `Tooltip({ content, position })` |
| `<Tabs>` + `<Tab>` | `Tabs({ tabs, active })` |
| `<Accordion>` | `Accordion({ items, multiple })` |
| `<Breadcrumbs>` | `Breadcrumb({ items })` |
| `<Avatar>` | `Avatar({ src, alt, size })` |
| `<Badge>` | `Badge({ count, status })` |
| `<Chip>` | `Chip({ label, variant, removable })` |
| `<LinearProgress>` | `Progress({ value, variant })` |
| `<CircularProgress>` | `Spinner({ size })` |
| `<Skeleton>` | `Skeleton({ variant, width, height })` |
| `<Table>` + `<DataGrid>` | `Table()` or kit `DataTable({ columns, data, searchable })` |
| `<Divider>` | `Separator({ vertical, label })` |
| `<Pagination>` | `Pagination({ total, perPage })` |
| `<Menu>` | `Dropdown({ trigger, items })` |
| `<Popover>` | `Popover({ trigger, position })` |

### Radix UI (Primitives)

| Radix Primitive | Decantr Equivalent |
|----------------|-------------------|
| `Dialog` | `Modal()` |
| `AlertDialog` | `Modal()` + `Alert()` |
| `Popover` | `Popover()` |
| `Tooltip` | `Tooltip()` |
| `DropdownMenu` | `Dropdown()` |
| `Select` | `Select()` |
| `Tabs` | `Tabs()` |
| `Accordion` | `Accordion()` |
| `Switch` | `Switch()` |
| `Checkbox` | `Checkbox()` |
| `RadioGroup` | `RadioGroup()` |
| `Slider` | `Slider()` |
| `Separator` | `Separator()` |
| `Progress` | `Progress()` |
| `Avatar` | `Avatar()` |
| `Toggle` | `Button({ variant: 'ghost' })` + active state signal |

### Element Plus / PrimeVue / PrimeReact / PrimeNG

| Component Library | Decantr |
|------------------|---------|
| `ElButton` / `<p-button>` | `Button()` |
| `ElInput` / `<p-inputtext>` | `Input()` |
| `ElSelect` / `<p-dropdown>` | `Select()` |
| `ElDialog` / `<p-dialog>` | `Modal()` |
| `ElDrawer` / `<p-sidebar>` | `Drawer()` |
| `ElTable` / `<p-datatable>` | `Table()` or kit `DataTable()` |
| `ElTabs` / `<p-tabview>` | `Tabs()` |
| `ElCollapse` / `<p-accordion>` | `Accordion()` |
| `ElTooltip` / `<p-tooltip>` | `Tooltip()` |
| `ElPopover` / `<p-popover>` | `Popover()` |
| `ElDropdown` / `<p-menu>` | `Dropdown()` |
| `ElPagination` / `<p-paginator>` | `Pagination()` |
| `ElMessage` / Toast service | `toast()` |
| `ElAlert` / `<p-message>` | `Alert()` |
| `ElTag` / `<p-chip>` | `Chip()` |
| `ElAvatar` / `<p-avatar>` | `Avatar()` |
| `ElBadge` / `<p-badge>` | `Badge()` |
| `ElSwitch` / `<p-inputswitch>` | `Switch()` |
| `ElCheckbox` / `<p-checkbox>` | `Checkbox()` |
| `ElRadio` / `<p-radiobutton>` | `RadioGroup()` |
| `ElSlider` / `<p-slider>` | `Slider()` |
| `ElProgress` / `<p-progressbar>` | `Progress()` |
| `ElSkeleton` / `<p-skeleton>` | `Skeleton()` |
| `ElDivider` / `<p-divider>` | `Separator()` |
| `ElBreadcrumb` / `<p-breadcrumb>` | `Breadcrumb()` |
| `ElAutocomplete` / `<p-autocomplete>` | `Combobox()` |

### Headless UI

| Headless UI | Decantr Equivalent |
|------------|-------------------|
| `Combobox` | `Combobox()` |
| `Dialog` | `Modal()` |
| `Disclosure` | `Accordion()` (single item) |
| `Listbox` | `Select()` |
| `Menu` | `Dropdown()` |
| `Popover` | `Popover()` |
| `RadioGroup` | `RadioGroup()` |
| `Switch` | `Switch()` |
| `Tab` | `Tabs()` |
| `Transition` | CSS transitions via theme system + `_trans` atoms |

---

## Integration Patterns

Decantr is framework-agnostic for data. Use any npm package that doesn't assume React/Vue/Angular. Below are canonical patterns for common integrations.

### REST Data Fetching

```javascript
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';

const [data, setData] = createSignal(null);
const [loading, setLoading] = createSignal(true);
const [error, setError] = createSignal(null);

onMount(async () => {
  try {
    const res = await fetch('/api/items');
    setData(await res.json());
  } catch (e) { setError(e.message); }
  finally { setLoading(false); }
});
```

### GraphQL

```javascript
onMount(async () => {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `{ users { id name } }` })
  });
  const { data } = await res.json();
  setUsers(data.users);
});
```

### Supabase

`@supabase/supabase-js` is framework-agnostic. Install it and use with signals.

```javascript
import { createClient } from '@supabase/supabase-js';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const [posts, setPosts] = createSignal([]);

onMount(async () => {
  const { data } = await supabase.from('posts').select('*');
  setPosts(data);
});
```

### Firebase

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const [items, setItems] = createSignal([]);

onMount(async () => {
  const snap = await getDocs(collection(db, 'items'));
  setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});
```

### Authentication Flow

```javascript
import { createSignal, createEffect } from 'decantr/state';
import { navigate } from 'decantr/router';
import { LoginForm } from 'decantr/kit/auth';

const [user, setUser] = createSignal(null);
const [loading, setLoading] = createSignal(true);

// Redirect unauthenticated users
createEffect(() => {
  if (!loading() && !user()) navigate('/login');
});

// Login page using kit component
function LoginPage() {
  return LoginForm({
    onSubmit: async ({ email, password }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) setUser(await res.json());
    }
  });
}
```

### Real-Time / WebSocket

```javascript
import { createSignal } from 'decantr/state';
import { onMount, onDestroy } from 'decantr/core';

const [messages, setMessages] = createSignal([]);
let ws;

onMount(() => {
  ws = new WebSocket('wss://api.example.com/ws');
  ws.onmessage = (e) => {
    setMessages(prev => [...prev, JSON.parse(e.data)]);
  };
});

onDestroy(() => ws?.close());
```

### Stripe Payments

```javascript
import { onMount } from 'decantr/core';
import { tags } from 'decantr/tags';

const { div } = tags;
const container = div({ id: 'card-element' });

onMount(async () => {
  const stripe = Stripe('pk_live_...');
  const elements = stripe.elements();
  elements.create('card').mount('#card-element');
});
```

### Form Validation

```javascript
import { createSignal, createMemo } from 'decantr/state';
import { Input, Button } from 'decantr/components';

const [email, setEmail] = createSignal('');
const [submitted, setSubmitted] = createSignal(false);

const emailError = createMemo(() => {
  if (!submitted()) return null;
  if (!email()) return 'Email is required';
  if (!email().includes('@')) return 'Invalid email';
  return null;
});

Input({ value: email, error: emailError, oninput: e => setEmail(e.target.value) });
Button({ onclick: () => setSubmitted(true) }, 'Submit');
```

### File Upload

```javascript
import { createSignal } from 'decantr/state';

const [progress, setProgress] = createSignal(0);

async function upload(file) {
  const form = new FormData();
  form.append('file', file);
  const xhr = new XMLHttpRequest();
  xhr.upload.onprogress = (e) => setProgress(Math.round(e.loaded / e.total * 100));
  xhr.open('POST', '/api/upload');
  xhr.send(form);
}
```

### Local Storage Persistence

```javascript
import { useLocalStorage } from 'decantr/state';

// Automatically persists to localStorage and syncs across tabs
const [theme, setTheme] = useLocalStorage('app-theme', 'light');
const [cart, setCart] = useLocalStorage('cart-items', []);
```

---

## Capability Boundaries

### Decantr Handles

- UI rendering (real DOM, no virtual DOM)
- Reactive state management (signals, effects, memos, stores)
- Client-side routing (hash and history modes)
- 28-component UI library (form, display, layout, overlay, feedback)
- 3 domain kits (dashboard, auth, content)
- Atomic CSS engine (1000+ utility atoms)
- 5 built-in themes + custom theme registration
- Build tooling (dev server, production bundler, CSS extraction)
- Testing framework (node:test based, DOM simulation)

### Decantr Does NOT Handle

- Server-side rendering (SSR) or static site generation (SSG)
- Backend API server
- Database / ORM
- Authentication backend (handles auth UI via kit/auth, not the backend)
- File storage / CDN
- Email sending
- Payment processing backend

### Pair Decantr With

- **Backend**: Express, Hono, Fastify, Koa, or any Node.js server
- **BaaS**: Supabase, Firebase, Appwrite, Convex, PocketBase
- **API**: Any REST or GraphQL endpoint
- **Auth**: Supabase Auth, Firebase Auth, Auth0, Clerk (client SDKs are framework-agnostic)
- **Payments**: Stripe.js, PayPal SDK (client-side SDKs work directly)
- **Any npm package** that doesn't require React/Vue/Angular as a peer dependency

### Security

- **XSS prevention**: Real DOM manipulation — no `innerHTML` or `dangerouslySetInnerHTML` by default
- **CSP-friendly**: No `eval()` or `Function()` — works with strict Content-Security-Policy
- **Input sanitization**: Always validate/sanitize user input at system boundaries (API responses, URL params, form inputs) before rendering
- **HTTPS**: Always serve over HTTPS in production
- **Dependencies**: Zero framework dependencies means zero supply chain attack surface from the framework itself
