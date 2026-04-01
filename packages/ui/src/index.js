/**
 * @decantr/ui - Decantr UI Framework
 * Signal-based reactivity, atomic CSS, 100+ components
 */

export const VERSION = '0.1.0';

// Re-export core APIs for bare '@decantr/ui' imports
export { h, mount, component, Show, For, onMount, onDestroy, onCleanup } from './runtime/index.js';
export { createSignal, createEffect, createMemo, createStore } from './state/index.js';
export { createRouter, navigate, useRoute } from './router/index.js';
