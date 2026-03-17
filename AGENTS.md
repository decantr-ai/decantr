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
| CSS / styling | Tailwind / CSS-in-JS | scoped `<style>` | scoped `<style>` | ViewEncapsulation | `css('_flex _gap4 _p6 _bgmuted')` |
| Component library | ShadCN / MUI / Radix | Element Plus / PrimeVue | Skeleton / Melt | Angular Material | `decantr/components` (100+ components) |
| Build / deploy | Next.js / Vite | Nuxt / Vite | SvelteKit / Vite | Angular CLI | `decantr build` → `dist/` |
| Testing | Jest / Vitest | Vitest | Vitest | Karma / Jest | `decantr/test` (node:test based) |
| i18n | react-intl / i18next | vue-i18n | svelte-i18n | @ngx-translate | `createI18n({ locale, messages })` |
| Auth | NextAuth.js | @nuxtjs/auth | SvelteKit auth | @angular/fire/auth | `createAuth(config)` + `requireAuth(router)` |

---

## Common Pitfalls

### Conditional rendering — use `cond()`, not ternaries

```js
// WRONG — inline ternary as child produces "[object HTMLSpanElement]" when wrapped in a reactive function
div({}, () => show() ? span({}, 'text') : null)

// CORRECT — use cond() for conditional DOM elements
div({}, cond(() => show(), () => span({}, 'text')))
```

Function children are for **reactive text only** (`String(fn())`). For conditional DOM elements, always use `cond(predicate, trueFn, falseFn)`.

### Mount + Router — argument order matters

```js
// WRONG — reversed arguments
mount(() => router.outlet(), document.getElementById('app'))

// CORRECT — target first, render function second
mount(document.getElementById('app'), () => router.outlet())
```

`createRouter()` returns a plain object. Call `router.outlet()` to get the DOM element — do not pass the router object directly to `mount()`.

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
| `<BrowserRouter>` + `<Routes>` | `createRouter({ routes }); mount(el, () => router.outlet())` |
| `className={clsx('a', cond && 'b')}` | `class: css('_a', cond && '_b')` |
| `style={{ color: 'red' }}` | `class: css('_fgerror')` (use semantic color atom). For runtime-computed values only: `style: () => \`color:${dynamicColor()}\`` |
| `onClick={handler}` | `onclick: handler` (lowercase, native DOM) |
| `onChange={handler}` | `oninput: handler` (for inputs — native DOM event) |
| `<Link to="/about">` (React Router) | `link({ href: '/about' }, 'About')` |
| `useNavigate()` then `nav('/path')` | `navigate('/path')` |
| `navigate(-1)` / `navigate(1)` (React Router) | `back()` / `forward()` |
| `useNavigation().state` (React Router) | `isNavigating()` — reactive boolean for loading bars |
| `route.meta` (Vue Router) | `to.meta` — merged parent→child, set via `meta: {}` on route config |
| `basename` (React Router) / `base` (Vue Router) | `createRouter({ base: '/app' })` |
| `useLocation()` / `useParams()` | `useRoute()` → signal with `path`, `params`, `query`, `meta` |
| `useEffect` + `useLocation()` for analytics | `onNavigate((to, from) => { ... })` |
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
| Server Components (RSC) | Not applicable — Decantr uses SSR + hydration, not partial server components |
| SSR / SSG / ISR | `renderToString(component)` / `renderToStream(component)` from `decantr/ssr` + `hydrate(root, component)` on client |
| API Routes / Server Routes | Use a separate backend (Express, Hono, Fastify) or BaaS (Supabase, Firebase) |
| `getServerSideProps` / `useFetch` | Signals evaluated during SSR + `onMount` + `fetch()` for client-side data |
| Middleware | `onNavigate(fn)` for navigation hooks; `createEffect` watching `useRoute()` for reactive guards |
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
| `<Sheet>` / `<Drawer>` | `Drawer({ visible, side, title, size, footer, closeOnOutside })` | Compound: `Drawer.Header`, `Drawer.Body`, `Drawer.Footer` |
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
| `<Calendar>` | `DatePicker({ value, onChange })` | Use DatePicker in calendar mode |
| `<DatePicker>` | `DatePicker({ value, onChange, format })` | |
| `<NavigationMenu>` | `NavigationMenu({ items })` | |
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
| `<Table>` + `<DataGrid>` | `Table()` or `DataTable({ columns, data, searchable })` |
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
| `ElTable` / `<p-datatable>` | `Table()` or `DataTable()` |
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

### REST Data Fetching (Preferred — createQuery)

```javascript
import { createQuery } from 'decantr/data';

const items = createQuery('items', ({ signal }) =>
  fetch('/api/items', { signal }).then(r => r.json())
);
// items.data() — the fetched data (or undefined while loading)
// items.isLoading() — true while fetching
// items.error() — error if fetch failed
// items.refetch() — re-trigger the fetch
```

### REST Data Fetching (Manual — for complex flows)

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
import { createForm, validators, useFormField } from 'decantr/form';
import { Button, Input, Card } from 'decantr/components';
import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const [user, setUser] = createSignal(null);
const [loading, setLoading] = createSignal(true);

// Redirect unauthenticated users
createEffect(() => {
  if (!loading() && !user()) navigate('/login');
});

// Login page using form system + components
function LoginPage() {
  const { div, h2 } = tags;
  const form = createForm({
    fields: { email: '', password: '' },
    validators: { email: [validators.required, validators.email], password: [validators.required] },
    onSubmit: async ({ email, password }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) setUser(await res.json());
    }
  });
  return Card(
    Card.Header(h2({ class: css('_heading4') }, 'Login')),
    Card.Body(
      Input({ ...useFormField(form, 'email').bind(), type: 'email', placeholder: 'Email' }),
      Input({ ...useFormField(form, 'password').bind(), type: 'password', placeholder: 'Password' }),
      Button({ onclick: () => form.submit() }, 'Sign In')
    )
  );
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
- Reactive state management (signals, effects, memos, stores, resources, contexts)
- Client-side routing (hash and history modes, nested routes, guards, lazy loading)
- 100+ component UI library (form, display, layout, overlay, feedback, chart, typography)
- Form system (createForm, validators, field arrays)
- 49 composable UI patterns + 7 domain archetypes + recipe overlays
- Atomic CSS engine (1000+ utility atoms)
- 5 built-in styles + custom style registration
- Server-side rendering (renderToString, renderToStream, hydrate)
- Build tooling (dev server, production bundler, CSS extraction, tree shaking, code splitting)
- Testing framework (node:test based, DOM simulation)

### Decantr Does NOT Handle

- Static site generation (SSG) — SSR is supported, but not pre-built static pages
- Backend API server
- Database / ORM
- Authentication backend (handles auth UI via components, not the backend)
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

- **XSS prevention**: Real DOM manipulation — no `innerHTML` or `dangerouslySetInnerHTML` by default. Use `sanitize()` from `decantr/css` for any user-provided HTML
- **CSP-friendly**: No `eval()` or `Function()` — works with strict Content-Security-Policy
- **URL validation**: Router rejects `javascript:`, `data:`, and absolute URLs to prevent open redirect attacks
- **Input sanitization**: Always validate/sanitize user input at system boundaries (API responses, URL params, form inputs) before rendering
- **HTTPS**: Always serve over HTTPS in production
- **Dependencies**: Zero framework dependencies means zero supply chain attack surface from the framework itself

---

## Application Architect

Before generating a multi-page application, consult the architect registry to produce a comprehensive blueprint. This turns a naive user prompt ("build me a shopping cart") into a complete application spec with all the features, routes, state, and components a real app needs.

**Registry location:** `node_modules/decantr/src/registry/architect/` (or `src/registry/architect/` in framework source)

### Trait-Based Composition (Primary Approach)

Instead of matching the user's request to a hardcoded domain, use the **trait graph** at `src/registry/architect/traits.json` to dynamically compose the right set of patterns and skeletons for any domain.

**How it works:**

1. **Match keywords → traits**: Scan the user prompt against each trait's `triggers` array. Activate matching traits.
2. **Follow co-occurrence edges**: For each activated trait, activate co-occurring traits whose weight exceeds 0.6. This fills in complementary UI elements the user didn't explicitly mention.
3. **Map traits → patterns + skeletons**: Each trait maps to specific patterns (e.g., `widget-grid` → `kpi-grid`) and optionally a skeleton (e.g., `sidebar-nav` → `sidebar-main`).
4. **Check composites**: If the activated trait set closely matches a pre-built composite (dashboard, landing, ecommerce, etc.), use it as a starting point. Composites also suggest a vintage (style + mode).
5. **Compose essence**: Build the essence's `structure` array from the resolved patterns and skeletons.

**Example:** User says "build me a mortgage pipeline dashboard"
- Keyword matches: "pipeline" → `pipeline-view`, "dashboard" → `widget-grid`, `sidebar-nav`
- Co-occurrence: `widget-grid` → `chart-area` (0.85), `data-table-view` (0.75); `pipeline-view` → `data-table-view` (0.7)
- Composite match: closest is `financial` composite
- Result: sidebar-main skeleton with pages containing kpi-grid, chart-grid, pipeline-tracker, data-table, filter-bar

**Pre-built archetypes become examples, not constraints.** The trait graph is the reasoning scaffold; archetypes and composites are common trait combinations pre-packaged for convenience. Use them as shortcuts when the match is confident, but always prefer composing from traits when the user's request doesn't fit a clean archetype match.

### Legacy Domain Classification (Fallback)

**Current status:** Only `ecommerce` has a full architect domain file (`architect/domains/ecommerce.json`). The other 6 domains (saas-dashboard, portfolio, content-site, docs-explorer, financial-dashboard, recipe-community) have archetype blueprints in `src/registry/archetypes/` but no architect trigger/feature files yet. If no architect trigger file exists for the domain, use the archetype blueprint as the feature source. Still run SETTLE (5-layer decomposition), CLARIFY (write essence), and DECANT (resolve blends). The architect algorithm is an enhancement, not a prerequisite.

### When to Use

Use Architect when the user's request implies **2+ routes with distinct page layouts** OR references a **domain keyword** from any architect trigger file. Single-page requests (one component, one form, one widget) skip Architect but STILL follow POUR→SETTLE→CLARIFY for the page they're adding to.

### Step-by-Step Algorithm

Follow these 5 steps in order. Each step produces input for the next.

#### Step 1: Domain Classification (Weighted Keyword Matching)

1. Read `src/registry/architect/index.json` to get available domains
2. Normalize the user prompt to lowercase tokens
3. For each domain, load its file and score against `triggers`:
   - Each `primary` keyword match: **+3.0 points**
   - Each `secondary` keyword match: **+1.0 points**
   - Each `negative` keyword match: **−5.0 points**
   - If 2+ primary hits: multiply total score by **1.5×**
   - If 0 primary hits: multiply total score by **0.4×**
4. Decision:
   - Top score < 2.0 → domain unclear, treat as "general" (skip architect)
   - Top two scores within 30% of each other → ambiguous, consider both domains
   - Otherwise → confident single domain match

#### Step 2: Feature Graph Activation (DAG Forward-Chaining)

Given the matched domain file:

1. **Explicit activation**: Scan the user prompt for keywords matching feature `label` or `desc`. Set confidence = 1.0 for matches.
2. **Forward propagation via `implies` edges**: For each activated feature, activate its `implies` targets. Confidence decays **0.85× per hop**. Stop propagating when confidence drops below **0.3**.
3. **Backward dependency resolution**: For every activated feature, ensure all `requires` features are also active (confidence = 1.0). Repeat until stable.
4. **Auto-include tier=core**: Activate all features with `"t": "core"` regardless of prompt mentions.
5. **Add cross-cutting concerns**: Load `cross-cutting.json` and apply all concerns listed in the domain's `cross_cutting` array.

#### Step 3: Completeness Scoring

Calculate a composite score from activated features vs. total available:

```
composite = (
  core_coverage   × 0.60 +    // % of core features activated
  should_coverage × 0.25 +    // % of should features activated
  nice_coverage   × 0.10 +    // % of nice features activated
  cross_coverage  × 0.05      // % of cross-cutting concerns addressed
)
```

Grade: **A** (≥0.9) | **B** (≥0.75) | **C** (≥0.5) | **D** (<0.5)

Identify gaps — features NOT activated — categorized as:
- **Critical gaps**: core features missing (should not happen after Step 2)
- **Recommended gaps**: should-tier features not activated
- **Optional gaps**: nice-tier features not activated

#### Step 4: Question Generation (max 5 per round)

Collect question candidates from 3 sources:

1. **Feature-embedded questions** (from activated features' `questions` arrays) — priority: `weight × 2.0`
2. **Critical gap questions** ("Your app needs X. Include it?") — priority: `weight × 3.0`
3. **Recommended gap questions** ("Would you like X?") — priority: `weight × 1.5`

De-duplicate by affected feature. Take top 5 by priority. Present to user.

**Stop criteria**: Stop asking if completeness ≥ 0.75 AND no critical gaps. Max 2 rounds of questions.

#### Step 5: Blueprint Generation

Produce a structured blueprint JSON with these sections:

```json
{
  "domain": "<domain-id>",
  "theme": "<suggested-theme>",
  "score": { "composite": 0.87, "grade": "B" },
  "routes": [
    { "path": "/", "component": "HomePage" },
    { "path": "/products", "component": "ProductListPage" }
  ],
  "files": [
    { "path": "src/app.js", "type": "entry", "desc": "Router + layout + theme init" },
    { "path": "src/state/store.js", "type": "state", "signals": ["..."], "stores": ["..."], "memos": ["..."] },
    { "path": "src/pages/products.js", "type": "page", "components": ["Card", "Badge"], "features": ["product-catalog"] }
  ],
  "cross_cutting": {
    "loading": { "applies": ["products", "cart", "checkout"] },
    "errors": { "components": ["Alert", "toast"] },
    "empty": { "applies": ["product-list", "cart", "search-results"] },
    "a11y": true,
    "responsive": true
  }
}
```

**Blueprint rules:**
- Every activated feature's `routes` → merged into `routes` array
- Every activated feature's `state` → merged into a single state file
- Every activated feature's `components` → listed in the relevant page file
- Every activated feature's `ux` hints → used when generating the page code
- `cross_cutting` concerns → applied to every relevant page
- Only reference components that exist in the Decantr component registry

### Multi-Domain Resolution

When the domain classification (Step 1) identifies multiple applicable domains, follow this extended algorithm:

#### Trigger Conditions
- Top-2 domain scores are within 30% of each other
- User explicitly names multiple domains (e.g., "brand site with docs and explorer")
- User describes pages that map to different archetypes

#### Per-Section Processing
1. **Classify sections**: Map each user-described section to its best-fit archetype
2. **Independent SETTLE**: Run the 5-layer decomposition per section — each gets its own terroir, vintage, structure, and tannins
3. **Shared tannin extraction**: Identify tannins that appear in 2+ sections (auth, analytics) → move to `shared_tannins`
4. **Merge router tree**: Combine section routes under section path prefixes into a unified router config
5. **Write sectioned essence**: Use the sectioned format with one entry per domain section

#### General Fallback
When no domain scores above 2.0 (no confident match):
1. Ask the user to describe their main pages/sections
2. Pattern-match each described section against archetype pages
3. If a section matches an archetype's page set → assign that terroir
4. If no match → treat as custom section with manual structure definition
5. Still write a sectioned essence — even custom sections benefit from the Blend system

#### Per-Section Style Switching
For sectioned essences with different vintages per section, the generated `app.js` should include:

```js
// Generated during SERVE for sectioned essence
router.beforeEach((to) => {
  const section = sections.find(s => to.path.startsWith(s.path));
  if (section?.vintage?.style) setStyle(section.vintage.style);
  if (section?.vintage?.mode) setMode(section.vintage.mode);
});
```

This is a **generated code pattern**, not framework code — the LLM produces it during SERVE.

When the architect detects multiple plausible domains, use a sectioned essence:

- **Top-2 scores within 30%**: Create a sectioned essence with one section per domain. Each section gets its own terroir, vintage, structure, and tannins. Shared tannins (auth, analytics) are extracted to `shared_tannins`.
- **User explicitly names multiple domains**: Same approach — sectioned essence with one section per domain, regardless of scoring.
- **Per-section SETTLE**: Run the 5-layer decomposition (Terroir, Vintage, Character, Structure, Tannins) independently for each section. Each section may have a different archetype, different style, and different page layouts.
- **Merge into unified router**: Combine all section structures into a single router tree. Each section's pages are nested under that section's `path` prefix. Shared tannins are wired once at the app level, not per-section.
- **"General" fallback**: When no domain scores above 2.0, do not guess. Ask the user to describe their pages in concrete terms — then pattern-match each page against archetypes individually. If pages map to multiple archetypes, use sectioned essence. If all pages fit one archetype, use simple essence.

### Example Trace

User prompt: **"build me a shopping cart"**

1. **Domain**: "cart" = primary hit (+3.0), score = 4.5 → **ecommerce** (confident)
2. **Activation**: cart (explicit, 1.0) → implies checkout (0.85) → implies auth (0.72), order-confirmation (0.72), payment-integration (0.72) → auth implies user-profile (0.61). All core features auto-included: product-catalog, product-detail, cart, checkout, auth, search, order-confirmation, navbar.
3. **Score**: core 100%, should ~60%, nice 0% → composite ≈ 0.78, grade **B**
4. **Questions**: "Allow guest checkout or require account?" (from checkout), "Which payment provider?" (from payment-integration), "Would you like product reviews?" (nice gap), "Would you like wishlists?" (nice gap)
5. **Blueprint**: 8 routes, 12 files, 15+ components, full cross-cutting coverage

---

## v0.5.0 Breaking Changes — Migration Guide

### `createFormField()` wrapper class rename

The `createFormField()` wrapper class changed from `d-field` → `d-form-field`. This was necessary because `.d-field` is now the visual styling class for field containers (border, background, focus ring).

```javascript
// Before (v0.4.x)
document.querySelector('.d-field')       // could be either wrapper or visual
document.querySelector('.d-field-label') // form label

// After (v0.5.0)
document.querySelector('.d-form-field')       // structural wrapper (label + control + help + error)
document.querySelector('.d-form-field-label') // form label
document.querySelector('.d-field')            // visual styling (border, bg, focus)
```

### `createFormField()` return value

```javascript
// Before: returns HTMLElement
const wrapper = createFormField(input, { label: 'Name' });

// After: returns { wrapper, setError, setSuccess, destroy }
const { wrapper, setError, setSuccess } = createFormField(input, { label: 'Name' });
```

### New unified field component API

All 14 field components now accept these additional props:

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'outlined'\|'filled'\|'ghost'` | Visual variant (default: outlined) |
| `success` | `boolean\|string\|Function` | Success state |
| `loading` | `boolean\|Function` | Loading state |
| `label` | `string` | Wraps component with `createFormField` |
| `help` | `string` | Help text below field |
| `required` | `boolean` | Required indicator in label |
| `aria-label` | `string` | Accessible name when no label |

### ColorPicker: HSV → OKLCH

The color picker's saturation panel now uses OKLCH (perceptually uniform). The X axis maps to Chroma (0–0.4) and Y axis to Lightness (0–1). The API is unchanged: hex in, hex out. Colors may appear slightly different due to the perceptual uniformity of OKLCH.

