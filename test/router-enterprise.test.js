import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { createRouter, link, navigate, useRoute, onNavigate, back, forward, isNavigating } from '../src/router/index.js';
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

describe('onNavigate', () => {
  it('fires callback on navigation with correct to/from', async () => {
    window.location.pathname = '/';
    const calls = [];
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    router.onNavigate((to, from) => {
      calls.push({ to: to.path, from: from.path });
    });

    router.navigate('/about');
    // handleNavigation is async, give it a tick
    await new Promise(r => setTimeout(r, 10));
    assert.equal(calls.length >= 1, true);
    const last = calls[calls.length - 1];
    assert.equal(last.to, '/about');
    router.destroy();
  });

  it('unsubscribe stops future callbacks', async () => {
    window.location.pathname = '/';
    const calls = [];
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/a', component: () => h('div', null, 'A') },
        { path: '/b', component: () => h('div', null, 'B') }
      ]
    });
    const unsub = router.onNavigate((to) => {
      calls.push(to.path);
    });

    router.navigate('/a');
    await new Promise(r => setTimeout(r, 10));
    unsub();
    router.navigate('/b');
    await new Promise(r => setTimeout(r, 10));

    // Should have '/a' but not '/b' (plus initial nav)
    assert.equal(calls.includes('/a'), true);
    assert.equal(calls.includes('/b'), false);
    router.destroy();
  });

  it('supports multiple listeners', async () => {
    window.location.pathname = '/';
    const calls1 = [];
    const calls2 = [];
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/x', component: () => h('div', null, 'X') }
      ]
    });
    router.onNavigate((to) => calls1.push(to.path));
    router.onNavigate((to) => calls2.push(to.path));

    router.navigate('/x');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(calls1.includes('/x'), true);
    assert.equal(calls2.includes('/x'), true);
    router.destroy();
  });

  it('fires after afterEach guard', async () => {
    window.location.pathname = '/';
    const order = [];
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/y', component: () => h('div', null, 'Y') }
      ],
      afterEach: () => { order.push('afterEach'); }
    });
    router.onNavigate(() => { order.push('onNavigate'); });

    router.navigate('/y');
    await new Promise(r => setTimeout(r, 10));

    // Find the last pair to verify ordering
    const lastAfter = order.lastIndexOf('afterEach');
    const lastNav = order.lastIndexOf('onNavigate');
    assert.ok(lastAfter < lastNav, 'afterEach should fire before onNavigate');
    router.destroy();
  });

  it('standalone export delegates to active router', async () => {
    window.location.pathname = '/';
    const calls = [];
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/z', component: () => h('div', null, 'Z') }
      ]
    });

    const unsub = onNavigate((to) => { calls.push(to.path); });
    router.navigate('/z');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(calls.includes('/z'), true);
    unsub();
    router.destroy();
  });
});

describe('route meta', () => {
  it('meta propagates to route match', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home'), meta: { title: 'Home' } }
      ]
    });
    const route = router.current();
    assert.deepEqual(route.meta, { title: 'Home' });
    router.destroy();
  });

  it('parent meta merges with child meta', () => {
    window.location.pathname = '/admin/users';
    const router = createRouter({
      mode: 'history',
      routes: [{
        path: '/admin',
        component: (p) => h('div', null, 'Admin', p.outlet ? p.outlet() : null),
        meta: { requiresAuth: true, layout: 'admin' },
        children: [{
          path: 'users',
          component: () => h('div', null, 'Users'),
          meta: { title: 'Users' }
        }]
      }]
    });
    router.navigate('/admin/users');
    const route = router.current();
    assert.deepEqual(route.meta, { requiresAuth: true, layout: 'admin', title: 'Users' });
    router.destroy();
  });

  it('child meta overrides parent on key collision', () => {
    window.location.pathname = '/admin/settings';
    const router = createRouter({
      mode: 'history',
      routes: [{
        path: '/admin',
        component: (p) => h('div', null, 'Admin', p.outlet ? p.outlet() : null),
        meta: { title: 'Admin', requiresAuth: true },
        children: [{
          path: 'settings',
          component: () => h('div', null, 'Settings'),
          meta: { title: 'Settings' }
        }]
      }]
    });
    router.navigate('/admin/settings');
    const route = router.current();
    assert.equal(route.meta.title, 'Settings');
    assert.equal(route.meta.requiresAuth, true);
    router.destroy();
  });

  it('missing meta defaults to empty object', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') }
      ]
    });
    const route = router.current();
    assert.deepEqual(route.meta, {});
    router.destroy();
  });

  it('guard can read to.meta to cancel navigation', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/admin', component: () => h('div', null, 'Admin'), meta: { requiresAuth: true } }
      ],
      beforeEach: (to) => {
        if (to.meta.requiresAuth) return false;
      }
    });
    router.navigate('/admin');
    assert.equal(router.current().path, '/');
    router.destroy();
  });
});

describe('isNavigating', () => {
  it('isNavigating is false initially', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.equal(router.isNavigating(), false);
    router.destroy();
  });

  it('isNavigating is false after synchronous navigation', async () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    router.navigate('/about');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(router.isNavigating(), false);
    router.destroy();
  });

  it('standalone isNavigating() delegates to active router', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.equal(isNavigating(), false);
    router.destroy();
  });

  it('throws without active router', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    router.destroy();
    assert.throws(() => isNavigating(), /No active router/);
  });
});

describe('back and forward', () => {
  it('back() does not throw', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.doesNotThrow(() => router.back());
    router.destroy();
  });

  it('forward() does not throw', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.doesNotThrow(() => router.forward());
    router.destroy();
  });

  it('standalone back()/forward() delegate to active router', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    assert.doesNotThrow(() => back());
    assert.doesNotThrow(() => forward());
    router.destroy();
  });

  it('throws without active router', () => {
    window.location.pathname = '/';
    const router = createRouter({
      mode: 'history',
      routes: [{ path: '/', component: () => h('div', null, 'Home') }]
    });
    router.destroy();
    assert.throws(() => back(), /No active router/);
    assert.throws(() => forward(), /No active router/);
  });
});

describe('base path', () => {
  it('base is stripped from initial path', () => {
    window.location.pathname = '/app/dashboard';
    const router = createRouter({
      mode: 'history',
      base: '/app',
      routes: [
        { path: '/dashboard', component: () => h('div', null, 'Dashboard') }
      ]
    });
    const route = router.current();
    assert.equal(route.path, '/dashboard');
    assert.equal(route.matched, true);
    router.destroy();
  });

  it('navigate() prepends base to URL', async () => {
    window.location.pathname = '/app/';
    const router = createRouter({
      mode: 'history',
      base: '/app',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    router.navigate('/about');
    await new Promise(r => setTimeout(r, 10));
    // The strategy receives base + path
    assert.equal(router.current().path, '/about');
    router.destroy();
  });

  it('route params work with base', async () => {
    window.location.pathname = '/app/user/42';
    const router = createRouter({
      mode: 'history',
      base: '/app',
      routes: [
        { path: '/user/:id', component: (p) => h('div', null, `User ${p.id}`) }
      ]
    });
    const route = router.current();
    assert.equal(route.params.id, '42');
    assert.equal(route.matched, true);
    router.destroy();
  });

  it('link() href includes base', () => {
    window.location.pathname = '/app/';
    const router = createRouter({
      mode: 'history',
      base: '/app',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    const el = link({ href: '/about' }, 'About');
    assert.equal(el.getAttribute('href'), '/app/about');
    router.destroy();
  });

  it('empty/missing base is a no-op', async () => {
    window.location.pathname = '/about';
    const router = createRouter({
      mode: 'history',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') },
        { path: '/about', component: () => h('div', null, 'About') }
      ]
    });
    router.navigate('/about');
    await new Promise(r => setTimeout(r, 10));
    assert.equal(router.current().path, '/about');
    router.destroy();
  });

  it('trailing slash on base is normalized', () => {
    window.location.pathname = '/app/';
    const router = createRouter({
      mode: 'history',
      base: '/app/',
      routes: [
        { path: '/', component: () => h('div', null, 'Home') }
      ]
    });
    const el = link({ href: '/test' }, 'Test');
    // base '/app/' normalizes to '/app'
    assert.equal(el.getAttribute('href'), '/app/test');
    router.destroy();
  });
});
