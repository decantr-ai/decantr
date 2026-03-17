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
mount(document.getElementById('app'), App)
```
