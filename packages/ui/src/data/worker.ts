import { createSignal, createEffect } from '../state/index.js';

export interface WorkerSignalResult {
  result: () => any;
  busy: () => boolean;
  error: () => any;
  send: (data: any) => number;
  terminate: () => void;
}

export interface WorkerQueryResult {
  data: () => any;
  loading: () => boolean;
  error: () => any;
  refetch: () => void;
}

let nextId = 1;

/**
 * Persistent bridge to a Web Worker with reactive state.
 *
 * Sends messages using `{ id, payload }` protocol and expects
 * `{ id, result }` or `{ id, error }` responses.
 *
 * @param {Worker} worker
 * @returns {{
 *   result: () => any,
 *   busy: () => boolean,
 *   error: () => any,
 *   send: (data: any) => number,
 *   terminate: () => void
 * }}
 *
 * @example
 * ```js
 * const ws = createWorkerSignal(new Worker('./compute.js'));
 * ws.send({ type: 'process', data: [1,2,3] });
 * // ws.result() — last result from worker
 * // ws.busy()   — true while worker is processing
 * // ws.error()  — last error (if any)
 * ```
 */
export function createWorkerSignal(worker: Worker): WorkerSignalResult {
  const [result, setResult] = createSignal(undefined);
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal(undefined);

  /** @type {Set<number>} */
  const pending = new Set();

  function onMessage(e) {
    const msg = e.data;
    if (msg && typeof msg.id === 'number') {
      pending.delete(msg.id);
      if ('error' in msg) {
        setError(msg.error);
      } else {
        setResult(msg.result);
        setError(undefined);
      }
      if (pending.size === 0) setBusy(false);
    }
  }

  function onError(e) {
    setError(e.message || e);
    pending.clear();
    setBusy(false);
  }

  worker.addEventListener('message', onMessage);
  worker.addEventListener('error', onError);

  /**
   * Send a message to the worker.
   * @param {any} data
   * @returns {number} message id
   */
  function send(data) {
    const id = nextId++;
    pending.add(id);
    setBusy(true);
    setError(undefined);
    worker.postMessage({ id, payload: data });
    return id;
  }

  /** Terminate the worker and clean up listeners. */
  function terminate() {
    worker.removeEventListener('message', onMessage);
    worker.removeEventListener('error', onError);
    worker.terminate();
    pending.clear();
    setBusy(false);
  }

  return { result, busy, error, send, terminate };
}

/**
 * One-shot reactive computation via a Web Worker.
 *
 * When `input` is a signal getter, re-sends to the worker whenever
 * the value changes. Returns a resource-like object.
 *
 * @param {Worker} worker
 * @param {(() => any) | any} input - Signal getter or plain value
 * @returns {{
 *   data: () => any,
 *   loading: () => boolean,
 *   error: () => any,
 *   refetch: () => void
 * }}
 *
 * @example
 * ```js
 * const result = createWorkerQuery(new Worker('./heavy.js'), () => ({ data: largeArray() }));
 * // result.data()    — computed result
 * // result.loading() — true while computing
 * // result.error()   — last error
 * // result.refetch() — re-run with current input
 * ```
 */
export function createWorkerQuery(worker: Worker, input: (() => any) | any): WorkerQueryResult {
  const ws = createWorkerSignal(worker);
  const isGetter = typeof input === 'function';

  /** Resolve current input value and send to worker. */
  function run() {
    const value = isGetter ? input() : input;
    ws.send(value);
  }

  // If input is reactive, track changes and re-send automatically.
  if (isGetter) {
    createEffect(() => { run(); });
  } else {
    run();
  }

  return {
    data: ws.result,
    loading: ws.busy,
    error: ws.error,
    refetch: run
  };
}
