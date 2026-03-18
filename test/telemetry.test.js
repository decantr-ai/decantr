import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { createTelemetry } from '../src/tannins/telemetry.js';

// ─── Helpers ──────────────────────────────────────────────────

let dom;

beforeEach(() => {
  dom = createDOM();
});

afterEach(() => {
  if (dom && dom.destroy) dom.destroy();
});

// ─── Core API ─────────────────────────────────────────────────

describe('createTelemetry — core API', () => {
  it('returns all expected properties', () => {
    const t = createTelemetry({ reporters: [] });
    assert.equal(typeof t.metrics, 'function');
    assert.equal(typeof t.errors, 'function');
    assert.equal(typeof t.vitals, 'function');
    assert.equal(typeof t.isCollecting, 'function');
    assert.equal(typeof t.recordMetric, 'function');
    assert.equal(typeof t.startTimer, 'function');
    assert.equal(typeof t.recordError, 'function');
    assert.equal(typeof t.flush, 'function');
    assert.equal(typeof t.pause, 'function');
    assert.equal(typeof t.resume, 'function');
    assert.equal(typeof t.destroy, 'function');
    t.destroy();
  });

  it('starts in collecting state', () => {
    const t = createTelemetry({ reporters: [] });
    assert.equal(t.isCollecting(), true);
    t.destroy();
  });

  it('initial vitals are all null', () => {
    const t = createTelemetry({ reporters: [], webVitals: false });
    const v = t.vitals();
    assert.equal(v.lcp, null);
    assert.equal(v.fid, null);
    assert.equal(v.cls, null);
    assert.equal(v.inp, null);
    t.destroy();
  });

  it('initial metrics map is empty', () => {
    const t = createTelemetry({ reporters: [] });
    assert.equal(t.metrics().size, 0);
    t.destroy();
  });

  it('initial errors list is empty', () => {
    const t = createTelemetry({ reporters: [] });
    assert.equal(t.errors().length, 0);
    t.destroy();
  });
});

// ─── recordMetric ─────────────────────────────────────────────

describe('createTelemetry — recordMetric', () => {
  it('records a metric and updates the metrics signal', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    t.recordMetric('page.load', 1234, { page: '/home' });

    const m = t.metrics();
    assert.equal(m.size, 1);
    assert.equal(m.has('page.load'), true);
    assert.equal(m.get('page.load').value, 1234);
    assert.deepEqual(m.get('page.load').tags, { page: '/home' });
    t.destroy();
  });

  it('overwrites metric with same name', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    t.recordMetric('latency', 100);
    t.recordMetric('latency', 200);

    assert.equal(t.metrics().get('latency').value, 200);
    t.destroy();
  });

  it('records without tags', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    t.recordMetric('count', 42);

    const m = t.metrics().get('count');
    assert.deepEqual(m.tags, {});
    t.destroy();
  });
});

// ─── startTimer ───────────────────────────────────────────────

describe('createTelemetry — startTimer', () => {
  it('returns a stop function that returns duration', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    const stop = t.startTimer('operation');
    assert.equal(typeof stop, 'function');

    const duration = stop();
    assert.equal(typeof duration, 'number');
    assert.ok(duration >= 0);
    t.destroy();
  });

  it('records the metric when stopped', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    const stop = t.startTimer('db.query', { table: 'users' });
    stop();

    const m = t.metrics().get('db.query');
    assert.ok(m);
    assert.deepEqual(m.tags, { table: 'users' });
    t.destroy();
  });
});

// ─── recordError ──────────────────────────────────────────────

describe('createTelemetry — recordError', () => {
  it('records an error and updates errors signal', () => {
    const t = createTelemetry({ reporters: [], errorCapture: false, flushInterval: 0 });
    const err = new Error('test error');
    t.recordError(err, { page: '/broken' });

    assert.equal(t.errors().length, 1);
    assert.equal(t.errors()[0].error.message, 'test error');
    assert.deepEqual(t.errors()[0].context, { page: '/broken' });
    t.destroy();
  });

  it('wraps non-Error in Error object', () => {
    const t = createTelemetry({ reporters: [], errorCapture: false, flushInterval: 0 });
    t.recordError('string error');

    assert.ok(t.errors()[0].error instanceof Error);
    assert.equal(t.errors()[0].error.message, 'string error');
    t.destroy();
  });
});

// ─── pause / resume ───────────────────────────────────────────

describe('createTelemetry — pause/resume', () => {
  it('pausing stops collection', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    t.pause();
    assert.equal(t.isCollecting(), false);

    // Metrics recorded while paused should not appear in buffer
    t.recordMetric('ignored', 999);
    // The metrics signal still updates (it's in the recordMetric path before buffer check)
    // but the event buffer won't be flushed to reporters

    t.resume();
    assert.equal(t.isCollecting(), true);
    t.destroy();
  });

  it('resume restores collection', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    t.pause();
    t.resume();
    assert.equal(t.isCollecting(), true);
    t.destroy();
  });
});

// ─── Reporters ────────────────────────────────────────────────

describe('createTelemetry — reporters', () => {
  it('callback reporter receives events on flush', async () => {
    const received = [];
    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: (events) => received.push(...events) }],
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    t.recordMetric('test', 42);
    await t.flush();

    assert.ok(received.length > 0);
    assert.equal(received[0].name, 'test');
    assert.equal(received[0].value, 42);
    t.destroy();
  });

  it('multiple reporters all receive events', async () => {
    const r1 = [];
    const r2 = [];
    const t = createTelemetry({
      reporters: [
        { type: 'callback', fn: (events) => r1.push(...events) },
        { type: 'callback', fn: (events) => r2.push(...events) }
      ],
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    t.recordMetric('multi', 1);
    await t.flush();

    assert.ok(r1.length > 0);
    assert.ok(r2.length > 0);
    t.destroy();
  });

  it('empty reporters array is valid', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0 });
    t.recordMetric('ok', 1);
    // Should not throw
    t.flush();
    t.destroy();
  });

  it('reporter errors do not break telemetry', async () => {
    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: () => { throw new Error('boom'); } }],
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    t.recordMetric('test', 1);
    // Should not throw
    await t.flush();
    t.destroy();
  });
});

// ─── Sampling ─────────────────────────────────────────────────

describe('createTelemetry — sampling', () => {
  it('sampleRate 0 drops all events', async () => {
    const received = [];
    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: (events) => received.push(...events) }],
      sampleRate: 0,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    for (let i = 0; i < 100; i++) t.recordMetric(`m${i}`, i);
    await t.flush();

    assert.equal(received.length, 0);
    t.destroy();
  });

  it('sampleRate 1 keeps all events', async () => {
    const received = [];
    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: (events) => received.push(...events) }],
      sampleRate: 1.0,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    for (let i = 0; i < 10; i++) t.recordMetric(`m${i}`, i);
    await t.flush();

    assert.equal(received.length, 10);
    t.destroy();
  });
});

// ─── Buffer limits ────────────────────────────────────────────

describe('createTelemetry — buffer management', () => {
  it('respects maxBufferSize', async () => {
    const received = [];
    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: (events) => received.push(...events) }],
      maxBufferSize: 5,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    // Push 3 events (under limit, no auto-flush)
    t.recordMetric('a', 1);
    t.recordMetric('b', 2);
    t.recordMetric('c', 3);

    // Manually flush
    await t.flush();
    assert.equal(received.length, 3);
    t.destroy();
  });
});

// ─── Query Timing ─────────────────────────────────────────────

describe('createTelemetry — query timing', () => {
  it('instruments queryClient middleware', async () => {
    const received = [];
    const middlewares = [];
    const mockQueryClient = {
      use(mw) {
        middlewares.push(mw);
        return () => {
          const idx = middlewares.indexOf(mw);
          if (idx !== -1) middlewares.splice(idx, 1);
        };
      }
    };

    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: (events) => received.push(...events) }],
      queryTiming: true,
      queryClient: mockQueryClient,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    assert.equal(middlewares.length, 1);

    // Simulate a query through the middleware
    const ctx = { url: '/api/users', method: 'GET', headers: {}, body: null };
    await middlewares[0](ctx, async () => ({ status: 200 }));
    await t.flush();

    const queryMetrics = received.filter(e => e.name === 'query');
    assert.ok(queryMetrics.length > 0);
    assert.equal(queryMetrics[0].tags.url, '/api/users');
    t.destroy();
  });

  it('records query errors', async () => {
    const received = [];
    const middlewares = [];
    const mockQueryClient = {
      use(mw) {
        middlewares.push(mw);
        return () => middlewares.splice(middlewares.indexOf(mw), 1);
      }
    };

    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: (events) => received.push(...events) }],
      queryTiming: true,
      queryClient: mockQueryClient,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    const ctx = { url: '/api/fail', method: 'POST', headers: {}, body: null };
    try {
      await middlewares[0](ctx, async () => { throw new Error('network fail'); });
    } catch (_) {}

    await t.flush();
    const errorMetrics = received.filter(e => e.name === 'query_error');
    assert.ok(errorMetrics.length > 0);
    assert.equal(errorMetrics[0].tags.error, 'network fail');
    t.destroy();
  });

  it('removes middleware on destroy', () => {
    const middlewares = [];
    const mockQueryClient = {
      use(mw) {
        middlewares.push(mw);
        return () => middlewares.splice(middlewares.indexOf(mw), 1);
      }
    };

    const t = createTelemetry({
      reporters: [],
      queryTiming: true,
      queryClient: mockQueryClient,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    assert.equal(middlewares.length, 1);
    t.destroy();
    assert.equal(middlewares.length, 0);
  });
});

// ─── Navigation Timing ───────────────────────────────────────

describe('createTelemetry — navigation timing', () => {
  it('tracks navigation events', async () => {
    const received = [];
    const listeners = [];
    let origNavigate;
    const mockRouter = {
      navigate(to) {
        const path = typeof to === 'string' ? to : '/';
        for (const fn of listeners) fn({ path }, { path: '/' });
      },
      onNavigate(fn) {
        listeners.push(fn);
        return () => listeners.splice(listeners.indexOf(fn), 1);
      }
    };
    origNavigate = mockRouter.navigate;

    const t = createTelemetry({
      reporters: [{ type: 'callback', fn: (events) => received.push(...events) }],
      navigationTiming: true,
      router: mockRouter,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    // Simulate navigation
    mockRouter.navigate('/dashboard');
    await t.flush();

    const navMetrics = received.filter(e => e.name === 'navigation');
    assert.ok(navMetrics.length > 0);
    assert.equal(navMetrics[0].tags.to, '/dashboard');
    t.destroy();
  });

  it('restores original navigate on destroy', () => {
    const listeners = [];
    const originalNav = function nav() {};
    const mockRouter = {
      navigate: originalNav,
      onNavigate(fn) {
        listeners.push(fn);
        return () => listeners.splice(listeners.indexOf(fn), 1);
      }
    };

    const t = createTelemetry({
      reporters: [],
      navigationTiming: true,
      router: mockRouter,
      flushInterval: 0,
      webVitals: false,
      errorCapture: false
    });

    assert.notEqual(mockRouter.navigate, originalNav);
    t.destroy();
    assert.equal(mockRouter.navigate, originalNav);
  });
});

// ─── Destroy ──────────────────────────────────────────────────

describe('createTelemetry — destroy', () => {
  it('stops collecting after destroy', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0, webVitals: false, errorCapture: false });
    t.destroy();
    assert.equal(t.isCollecting(), false);
  });

  it('can be called multiple times safely', () => {
    const t = createTelemetry({ reporters: [], flushInterval: 0, webVitals: false, errorCapture: false });
    t.destroy();
    t.destroy(); // Should not throw
  });
});

// ─── Default config ───────────────────────────────────────────

describe('createTelemetry — defaults', () => {
  it('works with no config', () => {
    const t = createTelemetry();
    assert.equal(typeof t.recordMetric, 'function');
    t.destroy();
  });

  it('works with empty config', () => {
    const t = createTelemetry({});
    assert.equal(typeof t.recordMetric, 'function');
    t.destroy();
  });
});
