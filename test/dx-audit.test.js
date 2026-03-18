import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createQuery, createMutation, queryClient } from '../src/data/query.js';
import { createEffect } from '../src/state/index.js';
import { createDOM } from '../src/test/dom.js';
import { createRouter } from '../src/router/index.js';
import { h } from '../src/core/index.js';

// ─── Fix 1: Mutation callback errors are logged in dev mode ─────

describe('mutation callback error logging', () => {
  let logs;
  const origError = console.error;

  beforeEach(() => {
    logs = [];
    console.error = (...args) => logs.push(args);
    globalThis.__DECANTR_DEV__ = true;
  });

  it('logs onSuccess errors in dev mode', async () => {
    const mutation = createMutation(
      (val) => Promise.resolve(val),
      { onSuccess: () => { throw new Error('callback boom'); } }
    );
    await mutation.mutateAsync('test');
    assert.ok(logs.some(l => l[0].includes('onSuccess')));
    console.error = origError;
    delete globalThis.__DECANTR_DEV__;
  });

  it('logs onError errors in dev mode', async () => {
    const mutation = createMutation(
      () => Promise.reject(new Error('fail')),
      { onError: () => { throw new Error('handler boom'); } }
    );
    try { await mutation.mutateAsync('test'); } catch (_) {}
    assert.ok(logs.some(l => l[0].includes('onError')));
    console.error = origError;
    delete globalThis.__DECANTR_DEV__;
  });

  it('logs onSettled errors in dev mode', async () => {
    const mutation = createMutation(
      (val) => Promise.resolve(val),
      { onSettled: () => { throw new Error('settled boom'); } }
    );
    await mutation.mutateAsync('test');
    assert.ok(logs.some(l => l[0].includes('onSettled')));
    console.error = origError;
    delete globalThis.__DECANTR_DEV__;
  });

  it('logs onMutate errors in dev mode', async () => {
    const mutation = createMutation(
      (val) => Promise.resolve(val),
      { onMutate: () => { throw new Error('mutate boom'); } }
    );
    await mutation.mutateAsync('test');
    assert.ok(logs.some(l => l[0].includes('onMutate')));
    console.error = origError;
    delete globalThis.__DECANTR_DEV__;
  });

  it('logs fire-and-forget mutation errors in dev mode', async () => {
    const mutation = createMutation(
      () => Promise.reject(new Error('fire-forget fail'))
    );
    mutation.mutate('test');
    await new Promise(r => setTimeout(r, 20));
    assert.ok(logs.some(l => l[0].includes('Unhandled mutation error')));
    console.error = origError;
    delete globalThis.__DECANTR_DEV__;
  });

  it('does not log when not in dev mode', async () => {
    delete globalThis.__DECANTR_DEV__;
    const mutation = createMutation(
      (val) => Promise.resolve(val),
      { onSuccess: () => { throw new Error('silent'); } }
    );
    await mutation.mutateAsync('test');
    assert.equal(logs.length, 0);
    console.error = origError;
  });
});

// ─── Fix 2: Router guard error handling ─────────────────────────

let domCleanup;

before(() => {
  const env = createDOM();
  domCleanup = env.cleanup;
});

after(() => {
  if (domCleanup) domCleanup();
});

describe('router guard error handling', () => {
  it('catches beforeEach errors and cancels navigation', async () => {
    const logs = [];
    const origError = console.error;
    console.error = (...args) => logs.push(args);
    globalThis.__DECANTR_DEV__ = true;

    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/crash', component: () => h('div', null, 'Crash') }
      ],
      beforeEach: (to) => {
        if (to.path === '/crash') throw new Error('guard exploded');
      }
    });

    router.navigate('/crash');
    await new Promise(r => setTimeout(r, 20));

    // Navigation should have been cancelled — route stays at /
    assert.equal(router.current().path, '/');
    assert.ok(logs.some(l => l[0].includes('beforeEach')));

    router.destroy();
    console.error = origError;
    delete globalThis.__DECANTR_DEV__;
  });

  it('catches afterEach errors without breaking navigation', async () => {
    const logs = [];
    const origError = console.error;
    console.error = (...args) => logs.push(args);
    globalThis.__DECANTR_DEV__ = true;

    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/ok', component: () => h('div', null, 'OK') }
      ],
      afterEach: () => { throw new Error('after boom'); }
    });

    router.navigate('/ok');
    await new Promise(r => setTimeout(r, 20));

    // Navigation should have completed despite afterEach error
    assert.equal(router.current().path, '/ok');
    assert.ok(logs.some(l => l[0].includes('afterEach')));

    router.destroy();
    console.error = origError;
    delete globalThis.__DECANTR_DEV__;
  });
});

// ─── Fix 5: Unobserved query error warnings ────────────────────

describe('unobserved query error warning', () => {
  it('warns when error() is never read', async () => {
    const warns = [];
    const origWarn = console.warn;
    console.warn = (...args) => warns.push(args);
    globalThis.__DECANTR_DEV__ = true;

    const result = createQuery('unobserved-err', () => Promise.reject(new Error('ignored')), { retry: 0 });
    // Do NOT read result.error()
    await new Promise(r => setTimeout(r, 50));

    assert.ok(warns.some(l => l[0].includes('error() was never read')));

    queryClient.clear();
    console.warn = origWarn;
    delete globalThis.__DECANTR_DEV__;
  });

  it('does not warn when error() is read reactively', async () => {
    const warns = [];
    const origWarn = console.warn;
    console.warn = (...args) => warns.push(args);
    globalThis.__DECANTR_DEV__ = true;

    const result = createQuery('observed-err', () => Promise.reject(new Error('handled')), { retry: 0 });
    // Simulate a component reactively observing the error signal —
    // this runs synchronously when the signal changes, before the microtask check
    createEffect(() => { result.error(); });
    await new Promise(r => setTimeout(r, 50));

    const relevant = warns.filter(l => l[0].includes('error() was never read'));
    assert.equal(relevant.length, 0);

    queryClient.clear();
    console.warn = origWarn;
    delete globalThis.__DECANTR_DEV__;
  });

  it('does not warn when not in dev mode', async () => {
    const warns = [];
    const origWarn = console.warn;
    console.warn = (...args) => warns.push(args);
    delete globalThis.__DECANTR_DEV__;

    const result = createQuery('no-dev-err', () => Promise.reject(new Error('silent')), { retry: 0 });
    await new Promise(r => setTimeout(r, 50));

    const relevant = warns.filter(l => typeof l[0] === 'string' && l[0].includes('error() was never read'));
    assert.equal(relevant.length, 0);

    queryClient.clear();
    console.warn = origWarn;
  });
});
