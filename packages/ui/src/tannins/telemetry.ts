/**
 * Decantr Telemetry Tannin
 *
 * Provides Web Vitals collection, error capture, query timing,
 * navigation timing, and pluggable reporters — all built from
 * native APIs with zero third-party dependencies.
 *
 * @module decantr/tannins/telemetry
 */

import { createSignal, createMemo, batch } from '../state/index.js';
import { setErrorHandler } from '../runtime/index.js';

// ─── Internal Types ──────────────────────────────────────────

interface TelemetryEvent {
  type: string;
  name: string;
  value?: number;
  tags?: Record<string, any>;
  timestamp: number;
  error?: Error;
  component?: string | null;
  stack?: string | null | undefined;
  context?: Record<string, any>;
}

interface Reporter {
  type: string;
  send(events: TelemetryEvent[]): Promise<void>;
  flush?(): Promise<void>;
}

interface Collector {
  destroy(): void;
}

interface TelemetryErrorInfo {
  error: Error;
  component: string | null;
  stack: string | null | undefined;
  context: Record<string, any>;
  timestamp: number;
}

interface HttpReporterConfig {
  type: 'http';
  url: string;
  batchSize?: number;
  headers?: Record<string, string>;
}

interface CallbackReporterConfig {
  type: 'callback';
  fn: (events: TelemetryEvent[]) => void;
}

type ReporterSpec = 'console' | HttpReporterConfig | CallbackReporterConfig;

export interface TelemetryConfig {
  reporters?: Array<'console' | { type: 'http'; url: string; batchSize?: number; headers?: Record<string, string> } | { type: 'callback'; fn: (events: any[]) => void }>;
  webVitals?: boolean;
  errorCapture?: boolean;
  navigationTiming?: boolean;
  queryTiming?: boolean;
  router?: any;
  queryClient?: any;
  sampleRate?: number;
  maxBufferSize?: number;
  flushInterval?: number;
}

export interface TelemetryInstance {
  metrics: () => Map<string, any>;
  errors: () => any[];
  vitals: () => { lcp: number | null; fid: number | null; cls: number | null; inp: number | null };
  isCollecting: () => boolean;
  recordMetric: (name: string, value: number, tags?: Record<string, any>) => void;
  startTimer: (name: string, tags?: Record<string, any>) => () => number;
  recordError: (error: Error, context?: Record<string, any>) => void;
  flush: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
}

// ─── Event Buffer ────────────────────────────────────────────

/**
 * Bounded event buffer that drops oldest entries when full.
 * @param {number} maxSize
 */
function createEventBuffer(maxSize: number) {
  const events: TelemetryEvent[] = [];

  return {
    push(event: TelemetryEvent) {
      events.push(event);
      if (events.length > maxSize) events.shift();
    },
    drain() {
      return events.splice(0, events.length);
    },
    size() {
      return events.length;
    },
    peek() {
      return events.slice();
    }
  };
}

// ─── Reporters ───────────────────────────────────────────────

function createConsoleReporter(): Reporter {
  return {
    type: 'console',
    async send(events: TelemetryEvent[]) {
      if (events.length === 0) return;
      if (typeof console !== 'undefined' && typeof console.table === 'function') {
        console.table(events.map((e: TelemetryEvent) => ({
          type: e.type,
          name: e.name,
          value: e.value,
          timestamp: new Date(e.timestamp).toISOString()
        })));
      }
    }
  };
}

function createHttpReporter(config: HttpReporterConfig): Reporter {
  const { url, batchSize = 20, headers = {} } = config;
  const queue: TelemetryEvent[] = [];

  return {
    type: 'http',
    async send(events: TelemetryEvent[]) {
      queue.push(...events);
      while (queue.length >= batchSize) {
        const batch = queue.splice(0, batchSize);
        await sendBatch(batch);
      }
    },
    async flush() {
      if (queue.length > 0) {
        const remaining = queue.splice(0, queue.length);
        await sendBatch(remaining);
      }
    }
  };

  async function sendBatch(batch: TelemetryEvent[]) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ events: batch, timestamp: Date.now() }),
        keepalive: true
      });
    } catch (_) {
      // Best-effort — telemetry must never break the app
    }
  }
}

function createCallbackReporter(config: CallbackReporterConfig): Reporter {
  const { fn } = config;
  return {
    type: 'callback',
    async send(events: TelemetryEvent[]) {
      if (events.length === 0) return;
      try {
        await fn(events);
      } catch (_) {
        // User callback must never break telemetry
      }
    }
  };
}

function resolveReporter(spec: ReporterSpec): Reporter | null {
  if (spec === 'console') return createConsoleReporter();
  if (typeof spec === 'object' && spec.type === 'http') return createHttpReporter(spec);
  if (typeof spec === 'object' && spec.type === 'callback') return createCallbackReporter(spec);
  return null;
}

// ─── Web Vitals Collector ────────────────────────────────────

function createWebVitalsCollector(onMetric: (name: string, value: number) => void): Collector {
  const observers: PerformanceObserver[] = [];

  // Guard for environments without PerformanceObserver
  if (typeof PerformanceObserver === 'undefined') {
    return { destroy() {} };
  }

  // LCP — Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const last = entries[entries.length - 1];
        onMetric('lcp', last.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObserver);
  } catch (_) {}

  // FID — First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const first = entries[0];
        onMetric('fid', (first as any).processingStart - first.startTime);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
    observers.push(fidObserver);
  } catch (_) {}

  // CLS — Cumulative Layout Shift (session window algorithm)
  try {
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: PerformanceEntry[] = [];

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstEntry = sessionEntries[0];
          const lastEntry = sessionEntries[sessionEntries.length - 1];

          // Start new session if gap > 1s or window > 5s
          if (sessionEntries.length > 0 &&
              (entry.startTime - lastEntry.startTime > 1000 ||
               entry.startTime - firstEntry.startTime > 5000)) {
            if (sessionValue > clsValue) clsValue = sessionValue;
            sessionValue = 0;
            sessionEntries = [];
          }

          sessionEntries.push(entry);
          sessionValue += (entry as any).value;

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            onMetric('cls', clsValue);
          }
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);
  } catch (_) {}

  // INP — Interaction to Next Paint (p98 of interaction durations)
  try {
    const interactions: number[] = [];

    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).interactionId) {
          interactions.push(entry.duration);
          // Calculate p98
          if (interactions.length > 0) {
            const sorted = interactions.slice().sort((a, b) => a - b);
            const p98Index = Math.ceil(sorted.length * 0.98) - 1;
            onMetric('inp', sorted[Math.max(0, p98Index)]);
          }
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 40 } as PerformanceObserverInit);
    observers.push(inpObserver);
  } catch (_) {}

  return {
    destroy() {
      for (const obs of observers) {
        try { obs.disconnect(); } catch (_) {}
      }
      observers.length = 0;
    }
  };
}

// ─── Error Capture ───────────────────────────────────────────

function createErrorCapture(onError: (info: TelemetryErrorInfo) => void): Collector {
  let previousHandler: ((info: any) => void) | null = null;

  // Integrate with Decantr's setErrorHandler
  setErrorHandler((info: any) => {
    onError({
      error: info.error,
      component: info.component,
      stack: info.stack,
      context: info.context,
      timestamp: Date.now()
    });
    // Chain to previous handler if it existed
    if (typeof previousHandler === 'function') {
      try { (previousHandler as (info: any) => void)(info); } catch (_) {}
    }
  });

  // Also catch unhandled errors
  let windowErrorHandler: ((event: ErrorEvent) => void) | null = null;
  let unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  if (typeof globalThis !== 'undefined' && typeof globalThis.addEventListener === 'function') {
    windowErrorHandler = (event: ErrorEvent) => {
      onError({
        error: event.error || new Error(event.message || 'Unknown error'),
        component: null,
        stack: event.error ? event.error.stack : null,
        context: { filename: event.filename, lineno: event.lineno, colno: event.colno },
        timestamp: Date.now()
      });
    };
    globalThis.addEventListener('error', windowErrorHandler);

    unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      onError({
        error: reason instanceof Error ? reason : new Error(String(reason)),
        component: null,
        stack: reason instanceof Error ? reason.stack : null,
        context: { type: 'unhandledrejection' },
        timestamp: Date.now()
      });
    };
    globalThis.addEventListener('unhandledrejection', unhandledRejectionHandler);
  }

  return {
    destroy() {
      setErrorHandler(null);
      if (typeof globalThis !== 'undefined' && typeof globalThis.removeEventListener === 'function') {
        if (windowErrorHandler) globalThis.removeEventListener('error', windowErrorHandler);
        if (unhandledRejectionHandler) globalThis.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      }
    }
  };
}

// ─── Navigation Timing ───────────────────────────────────────

function createNavigationTracker(router: any, onMetric: (name: string, value: number, tags?: Record<string, any>) => void): Collector {
  if (!router || typeof router.onNavigate !== 'function') {
    return { destroy() {} };
  }

  let lastNavStart: number | null = null;
  let lastPath: string | null = null;

  // Track navigation start via patching navigate
  const origNavigate = router.navigate;
  router.navigate = function trackedNavigate(...args: any[]) {
    lastNavStart = performance.now();
    lastPath = typeof args[0] === 'string' ? args[0] : null;
    return origNavigate.apply(this, args);
  };

  const unsub = router.onNavigate((to: any, from: any) => {
    const duration = lastNavStart !== null ? performance.now() - lastNavStart : 0;
    onMetric('navigation', duration, {
      from: from && from.path ? from.path : lastPath,
      to: to.path
    });
    lastNavStart = null;
    lastPath = null;
  });

  return {
    destroy() {
      router.navigate = origNavigate;
      unsub();
    }
  };
}

// ─── Query Timing Middleware ─────────────────────────────────

function createQueryTimingMiddleware(queryClient: any, onMetric: (name: string, value: number, tags?: Record<string, any>) => void): Collector {
  if (!queryClient || typeof queryClient.use !== 'function') {
    return { destroy() {} };
  }

  const removeMiddleware = queryClient.use(async (ctx: any, next: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await next();
      const duration = performance.now() - start;
      onMetric('query', duration, {
        url: ctx.url,
        method: ctx.method,
        status: ctx.response ? ctx.response.status : 200
      });
      return result;
    } catch (err: unknown) {
      const duration = performance.now() - start;
      onMetric('query_error', duration, {
        url: ctx.url,
        method: ctx.method,
        error: err instanceof Error ? err.message : String(err)
      });
      throw err;
    }
  });

  return {
    destroy() {
      removeMiddleware();
    }
  };
}

// ─── createTelemetry ─────────────────────────────────────────

/**
 * Create a telemetry instance with Web Vitals collection, error capture,
 * navigation timing, query timing, and pluggable reporters.
 *
 * @param {{
 *   reporters?: Array<'console' | { type: 'http', url: string, batchSize?: number, flushInterval?: number } | { type: 'callback', fn: (events: Array) => void }>,
 *   webVitals?: boolean,
 *   errorCapture?: boolean,
 *   navigationTiming?: boolean,
 *   queryTiming?: boolean,
 *   router?: Object,
 *   queryClient?: Object,
 *   sampleRate?: number,
 *   maxBufferSize?: number,
 *   flushInterval?: number,
 * }} [config]
 * @returns {{
 *   metrics: () => Map<string, Object>,
 *   errors: () => Array,
 *   vitals: () => { lcp: number|null, fid: number|null, cls: number|null, inp: number|null },
 *   isCollecting: () => boolean,
 *   recordMetric: (name: string, value: number, tags?: Object) => void,
 *   startTimer: (name: string, tags?: Object) => () => number,
 *   recordError: (error: Error, context?: Object) => void,
 *   flush: () => Promise<void>,
 *   pause: () => void,
 *   resume: () => void,
 *   destroy: () => void,
 * }}
 */
export function createTelemetry(config: TelemetryConfig = {}): TelemetryInstance {
  const {
    reporters: reporterSpecs = ['console'],
    webVitals = true,
    errorCapture = true,
    navigationTiming = true,
    queryTiming = true,
    router = null,
    queryClient: qc = null,
    sampleRate = 1.0,
    maxBufferSize = 100,
    flushInterval = 5000,
  } = config;

  // ── Signals ──
  const [metricsMap, setMetricsMap] = createSignal<Map<string, any>>(new Map());
  const [errorsList, setErrorsList] = createSignal<TelemetryEvent[]>([]);
  const [vitalsData, setVitalsData] = createSignal<{ lcp: number | null; fid: number | null; cls: number | null; inp: number | null }>({ lcp: null, fid: null, cls: null, inp: null });
  const [collecting, setCollecting] = createSignal(true);

  // ── Buffer & Reporters ──
  const buffer = createEventBuffer(maxBufferSize);
  const reporters = reporterSpecs.map(resolveReporter).filter(Boolean) as Reporter[];

  // ── Sampling ──
  function shouldSample() {
    if (sampleRate >= 1.0) return true;
    if (sampleRate <= 0) return false;
    return Math.random() < sampleRate;
  }

  // ── Push event into buffer ──
  function pushEvent(event: TelemetryEvent) {
    if (!collecting()) return;
    if (!shouldSample()) return;
    buffer.push(event);

    // Auto-flush if buffer is full
    if (buffer.size() >= maxBufferSize) {
      flush();
    }
  }

  // ── Record metric ──
  function recordMetric(name: string, value: number, tags?: Record<string, any>) {
    const event = {
      type: 'metric',
      name,
      value,
      tags: tags || {},
      timestamp: Date.now()
    };
    pushEvent(event);

    // Update metrics signal
    const map = new Map(metricsMap());
    map.set(name, event);
    setMetricsMap(map);
  }

  // ── Start timer ──
  function startTimer(name: string, tags?: Record<string, any>) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      recordMetric(name, duration, tags);
      return duration;
    };
  }

  // ── Record error ──
  function recordError(error: Error, context?: Record<string, any>) {
    const errorEvent = {
      type: 'error',
      name: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
      component: null,
      stack: error instanceof Error ? error.stack : null,
      context: context || {},
      timestamp: Date.now()
    };
    pushEvent(errorEvent);
    setErrorsList([...errorsList(), errorEvent]);
  }

  // ── Flush ──
  async function flush() {
    const events = buffer.drain();
    if (events.length === 0) return;

    const promises = reporters.map(async (reporter) => {
      try {
        await reporter.send(events);
        if (typeof reporter.flush === 'function') {
          await reporter.flush();
        }
      } catch (_) {
        // Reporter errors must never break the app
      }
    });

    await Promise.all(promises);
  }

  // ── Collectors ──
  const collectors: Collector[] = [];

  // Web Vitals
  if (webVitals) {
    const vitalsCollector = createWebVitalsCollector((name: string, value: number) => {
      recordMetric(`web_vitals.${name}`, value, { vital: name });

      // Update vitals signal
      const current = { ...vitalsData() } as { lcp: number | null; fid: number | null; cls: number | null; inp: number | null } & Record<string, number | null>;
      current[name] = value;
      setVitalsData(current as { lcp: number | null; fid: number | null; cls: number | null; inp: number | null });
    });
    collectors.push(vitalsCollector);
  }

  // Error capture
  if (errorCapture) {
    const errorCollector = createErrorCapture((errorInfo: TelemetryErrorInfo) => {
      const event = {
        type: 'error',
        name: 'error',
        value: 0,
        ...errorInfo
      };
      pushEvent(event);
      setErrorsList([...errorsList(), event]);
    });
    collectors.push(errorCollector);
  }

  // Navigation timing
  if (navigationTiming && router) {
    const navTracker = createNavigationTracker(router, (name: string, value: number, tags?: Record<string, any>) => {
      recordMetric(name, value, tags);
    });
    collectors.push(navTracker);
  }

  // Query timing
  if (queryTiming && qc) {
    const queryMiddleware = createQueryTimingMiddleware(qc, (name: string, value: number, tags?: Record<string, any>) => {
      recordMetric(name, value, tags);
    });
    collectors.push(queryMiddleware);
  }

  // ── Flush timer ──
  let flushTimerId: ReturnType<typeof setInterval> | null = null;
  if (flushInterval > 0) {
    flushTimerId = setInterval(() => {
      if (collecting()) flush();
    }, flushInterval);
  }

  // ── Control ──
  function pause() {
    setCollecting(false);
  }

  function resume() {
    setCollecting(true);
  }

  function destroy() {
    // Stop collecting
    setCollecting(false);

    // Clear flush timer
    if (flushTimerId !== null) {
      clearInterval(flushTimerId);
      flushTimerId = null;
    }

    // Final flush
    flush();

    // Destroy collectors
    for (const collector of collectors) {
      if (typeof collector.destroy === 'function') {
        collector.destroy();
      }
    }
    collectors.length = 0;
  }

  return {
    metrics: metricsMap,
    errors: errorsList,
    vitals: vitalsData,
    isCollecting: collecting,
    recordMetric,
    startTimer,
    recordError,
    flush,
    pause,
    resume,
    destroy
  };
}
