/**
 * Decantr Realtime Primitives
 * WebSocket and EventSource wrappers built on Decantr signals.
 *
 * @module decantr/data/realtime
 *
 * Exports:
 *   createWebSocket(url, options?)    — Reactive WebSocket with auto-reconnect
 *   createEventSource(url, options?)  — Reactive Server-Sent Events wrapper
 */
import { createSignal, batch } from '../state/index.js';

// ─── CONSTANTS ──────────────────────────────────────────────────

const MAX_MESSAGES = 100;
const MAX_BACKOFF = 30000;

// ─── createWebSocket ────────────────────────────────────────────

/**
 * Create a reactive WebSocket connection with auto-reconnect and message buffering.
 *
 * @param {string} url — WebSocket endpoint (ws:// or wss://)
 * @param {object} [options]
 * @param {number} [options.reconnectDelay=1000] — Initial reconnect delay in ms
 * @param {number} [options.maxRetries=5] — Maximum reconnect attempts
 * @param {boolean} [options.buffer=true] — Buffer sends while disconnected
 * @param {(data: any) => any} [options.parse] — Message parser (default: identity)
 * @param {string[]} [options.protocols] — WebSocket sub-protocols
 * @returns {{
 *   lastMessage: () => any,
 *   messages: () => any[],
 *   status: () => 'connecting'|'open'|'closed'|'reconnecting',
 *   send: (data: any) => void,
 *   close: () => void,
 *   reconnect: () => void,
 *   on: (handler: (msg: any) => void) => () => void
 * }}
 */
export function createWebSocket(url, options = {}) {
  const {
    reconnectDelay = 1000,
    maxRetries = 5,
    buffer = true,
    parse = (d) => d,
    protocols
  } = options;

  const [lastMessage, setLastMessage] = createSignal(null);
  const [messages, setMessages] = createSignal([]);
  const [status, setStatus] = createSignal('connecting');

  /** @type {((msg: any) => void)[]} */
  const handlers = [];
  /** @type {any[]} */
  const sendBuffer = [];
  /** @type {{ ws: WebSocket|null, attempts: number, timer: number|null, stopped: boolean }} */
  const state = { ws: null, attempts: 0, timer: null, stopped: false };

  /**
   * Flush the send buffer once the socket is open.
   * @param {WebSocket} ws
   */
  function flushBuffer(ws) {
    while (sendBuffer.length > 0) {
      ws.send(sendBuffer.shift());
    }
  }

  /**
   * Connect (or reconnect) to the WebSocket server.
   */
  function connect() {
    if (state.stopped) return;
    const ws = protocols
      ? new WebSocket(url, protocols)
      : new WebSocket(url);

    state.ws = ws;

    ws.addEventListener('open', () => {
      batch(() => {
        state.attempts = 0;
        setStatus('open');
      });
      flushBuffer(ws);
    });

    ws.addEventListener('message', (ev) => {
      const parsed = parse(ev.data);
      batch(() => {
        setLastMessage(parsed);
        setMessages((prev) => {
          const next = prev.concat(parsed);
          return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
        });
      });
      for (let i = 0; i < handlers.length; i++) handlers[i](parsed);
    });

    ws.addEventListener('close', () => {
      if (state.stopped) {
        setStatus('closed');
        return;
      }
      scheduleReconnect();
    });

    ws.addEventListener('error', () => {
      // Error is always followed by close — reconnect logic lives there.
      // Explicitly close to ensure the close event fires consistently.
      ws.close();
    });
  }

  /**
   * Schedule a reconnect attempt with exponential backoff + jitter.
   */
  function scheduleReconnect() {
    if (state.stopped) return;
    if (state.attempts >= maxRetries) {
      setStatus('closed');
      return;
    }
    setStatus('reconnecting');
    const delay = Math.min(
      reconnectDelay * Math.pow(2, state.attempts) + Math.random() * 1000,
      MAX_BACKOFF
    );
    state.attempts++;
    state.timer = setTimeout(() => {
      state.timer = null;
      connect();
    }, delay);
  }

  /**
   * Send data through the WebSocket. Buffers if disconnected and `buffer` is enabled.
   * @param {any} data
   */
  function send(data) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(data);
    } else if (buffer) {
      sendBuffer.push(data);
    }
  }

  /**
   * Close the connection and stop all reconnection attempts.
   */
  function close() {
    state.stopped = true;
    if (state.timer !== null) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    if (state.ws) {
      state.ws.close();
      state.ws = null;
    }
    setStatus('closed');
  }

  /**
   * Manually trigger a reconnect. Resets attempt counter.
   */
  function reconnect() {
    if (state.timer !== null) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    if (state.ws) {
      state.stopped = true; // prevent auto-reconnect from close handler
      state.ws.close();
      state.ws = null;
    }
    state.stopped = false;
    state.attempts = 0;
    setStatus('connecting');
    connect();
  }

  /**
   * Register a message handler. Returns an unsubscribe function.
   * @param {(msg: any) => void} handler
   * @returns {() => void}
   */
  function on(handler) {
    handlers.push(handler);
    return () => {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    };
  }

  // Kick off initial connection
  connect();

  return { lastMessage, messages, status, send, close, reconnect, on };
}

// ─── createEventSource ──────────────────────────────────────────

/**
 * Create a reactive EventSource (Server-Sent Events) wrapper.
 *
 * @param {string} url — SSE endpoint
 * @param {object} [options]
 * @param {string[]} [options.events] — Event types to listen for (default: ['message'])
 * @param {boolean} [options.withCredentials=false] — Send credentials with request
 * @returns {{
 *   lastEvent: () => { type: string, data: string }|null,
 *   status: () => 'connecting'|'open'|'closed',
 *   close: () => void,
 *   on: (eventType: string, handler: (ev: { type: string, data: string }) => void) => () => void
 * }}
 */
export function createEventSource(url, options = {}) {
  const { events, withCredentials = false } = options;

  const [lastEvent, setLastEvent] = createSignal(null);
  const [status, setStatus] = createSignal('connecting');

  /** @type {Map<string, ((ev: {type: string, data: string}) => void)[]>} */
  const handlerMap = new Map();

  const source = new EventSource(url, { withCredentials });

  source.addEventListener('open', () => {
    setStatus('open');
  });

  source.addEventListener('error', () => {
    // EventSource auto-reconnects; reflect readyState
    if (source.readyState === EventSource.CLOSED) {
      setStatus('closed');
    } else {
      setStatus('connecting');
    }
  });

  /**
   * Internal handler factory for a given event type.
   * @param {string} type
   * @returns {(ev: MessageEvent) => void}
   */
  function makeListener(type) {
    return (ev) => {
      const record = { type, data: ev.data };
      setLastEvent(record);
      const list = handlerMap.get(type);
      if (list) {
        for (let i = 0; i < list.length; i++) list[i](record);
      }
    };
  }

  // Attach listeners for requested event types
  const types = events && events.length > 0 ? events : ['message'];
  for (let i = 0; i < types.length; i++) {
    source.addEventListener(types[i], makeListener(types[i]));
  }

  /**
   * Close the EventSource connection.
   */
  function close() {
    source.close();
    setStatus('closed');
  }

  /**
   * Register a handler for a specific event type. Returns an unsubscribe function.
   * If the event type was not in the initial `events` list, it is dynamically added.
   *
   * @param {string} eventType
   * @param {(ev: { type: string, data: string }) => void} handler
   * @returns {() => void}
   */
  function on(eventType, handler) {
    if (!handlerMap.has(eventType)) {
      handlerMap.set(eventType, []);
      // Attach a native listener if this type wasn't in the initial set
      if (!types.includes(eventType)) {
        source.addEventListener(eventType, makeListener(eventType));
      }
    }
    handlerMap.get(eventType).push(handler);
    return () => {
      const list = handlerMap.get(eventType);
      if (!list) return;
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  return { lastEvent, status, close, on };
}
