/**
 * Decantr Data Layer
 * Server state, entity management, persistence, realtime, URL state, and worker integration.
 *
 * @module decantr/data
 */

export { createQuery, createInfiniteQuery, createMutation, queryClient } from './query.js';
export { createEntityStore } from './entity.js';
export { createURLSignal, createURLStore, parsers } from './url.js';
export { createWebSocket, createEventSource } from './realtime.js';
export { createPersisted, createIndexedDB, createCrossTab, createOfflineQueue } from './persist.js';
export { createWorkerSignal, createWorkerQuery } from './worker.js';
