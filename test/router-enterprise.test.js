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

beforeEach(() => {
  window.location.pathname = '/';
  window.location.hash = '';
  window.location.search = '';
});

describe('nested routes', () => {
  it('matches nested route paths', () => {
    const router = createRouter({
      mode: 'history',
      routes: [{
        path: '/admin',
        component: (params) => h('div', null, 'Admin Layout', params.outlet ? params.outlet() : null),
        children: [{
          path: 'users',
          component: () => h('div', null, 'Users Page')
        }]
      }]
    });

    window.location.pathname = '/admin/users';
    router.navigate('/admin/users');
    const route = router.current();
    assert.equal(route.path, '/admin/users');
    assert.equal(route.matched, true);
    assert.equal(route.components.length, 2);
    router.destroy();
  });

  it('renders layout with outlet', () => {
    const router = createRouter({
      mode: 'history',
      routes: [{
        path: '/app',
        component: (params) => {
          const layout = h('div', { class: 'layout' }, 'Layout');
          if (params.outlet) layout.appendChild(params.outlet());
          return layout;
        },
        children: [{
          path: 'dashboard',
          component: () => h('div', null, 'Dashboard')
        }]
      }]
    });

    window.location.pathname = '/app/dashboard';
    router.navigate('/app/dashboard');
    const out = router.outlet();
    assert.ok(out.textContent.includes('Layout'));
    assert.ok(out.textContent.includes('Dashboard'));
    router.destroy();
  });
});

describe('route guards', () => {
  it('beforeEach can cancel navigation', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/secret', component: () => h('div', null, 'Secret') }
      ],
      beforeEach: (to, from) => {
        if (to.path === '/secret') return false;
      }
    });

    router.navigate('/secret');
    const route = router.current();
    // Navigation was cancelled, should still be on home
    assert.equal(route.path, '/');
    router.destroy();
  });

  it('beforeEach can redirect', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/login', component: () => h('div', null, 'Login') },
        { path: '/admin', component: () => h('div', null, 'Admin') }
      ],
      beforeEach: (to) => {
        if (to.path === '/admin') return '/login';
      }
    });

    router.navigate('/admin');
    // The beforeEach redirected to /login via strategy.push,
    // which triggers the listener for handleNavigation
    // The route should reflect the redirect target
    router.destroy();
  });
});

describe('query params', () => {
  it('parses query string into route', () => {
    window.location.pathname = '/search';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/search', component: () => h('div', null, 'Search') }
      ]
    });

    router.navigate('/search?q=test&page=2');
    const route = router.current();
    assert.equal(route.query.q, 'test');
    assert.equal(route.query.page, '2');
    router.destroy();
  });
});

describe('URL validation', () => {
  it('rejects javascript: URLs', () => {
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.throws(() => {
      router.navigate('javascript:alert(1)');
    }, /Invalid route path/);
    router.destroy();
  });

  it('rejects data: URLs', () => {
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.throws(() => {
      router.navigate('data:text/html,<h1>hi</h1>');
    }, /Invalid route path/);
    router.destroy();
  });

  it('rejects absolute URLs', () => {
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.throws(() => {
      router.navigate('https://evil.com');
    }, /Invalid route path/);
    router.destroy();
  });

  it('allows relative paths', () => {
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    assert.doesNotThrow(() => {
      router.navigate('/about');
    });
    router.destroy();
  });
});

describe('named routes', () => {
  it('resolves named route with params', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home'), name: 'home' },
        { path: '/user/:id', component: (p) => h('div', null, `User ${p.id}`), name: 'user' }
      ]
    });

    router.navigate({ name: 'user', params: { id: '42' } });
    const route = router.current();
    assert.equal(route.path, '/user/42');
    assert.equal(route.params.id, '42');
    router.destroy();
  });

  it('throws for unknown route name', () => {
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home'), name: 'home' }
      ]
    });

    assert.throws(() => {
      router.navigate({ name: 'nonexistent' });
    }, /Unknown route name/);
    router.destroy();
  });
});

describe('link() with validation', () => {
  it('rejects javascript: href in link', () => {
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.throws(() => {
      link({ href: 'javascript:void(0)' }, 'Bad Link');
    }, /Invalid route path/);
    router.destroy();
  });

  it('creates valid link with safe href', () => {
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    const el = link({ href: '/about' }, 'About');
    assert.equal(el.tagName, 'A');
    assert.equal(el.getAttribute('href'), '/about');
    router.destroy();
  });
});
