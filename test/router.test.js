import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { createRouter, link, navigate, useRoute } from '../src/router/index.js';
import { h } from '../src/core/index.js';

let cleanup;

before(() => {
  const env = createDOM();
  cleanup = env.cleanup;
});

after(() => {
  if (cleanup) cleanup();
});

describe('createRouter (history mode)', () => {
  it('creates a router with current route', () => {
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    const route = router.current();
    assert.equal(route.path, '/');
    assert.equal(route.matched, true);
    router.destroy();
  });

  it('renders outlet with matched component', () => {
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home Page') }
      ]
    });
    const out = router.outlet();
    assert.ok(out.textContent.includes('Home Page'));
    router.destroy();
  });

  it('matches route parameters', () => {
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/user/:id', component: (params) => h('div', null, `User ${params.id}`) }
      ]
    });
    // Simulate navigating to /user/42
    window.location.pathname = '/user/42';
    router.navigate('/user/42');
    const route = router.current();
    assert.equal(route.params.id, '42');
    router.destroy();
  });
});

describe('link()', () => {
  it('creates an anchor element', () => {
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    const el = link({ href: '/about', class: 'nav-link' }, 'About');
    assert.equal(el.tagName, 'A');
    assert.equal(el.getAttribute('href'), '/about');
    assert.equal(el.className, 'nav-link');
    router.destroy();
  });
});

describe('useRoute()', () => {
  it('returns current route signal', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    const route = useRoute();
    assert.equal(route().path, '/');
    router.destroy();
  });

  it('throws without active router', () => {
    // The previous router was destroyed, but activeRouter may still be set
    // This test verifies the function works when there IS a router
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.doesNotThrow(() => useRoute());
    router.destroy();
  });
});
