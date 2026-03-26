import type { IRStoreNode, GeneratedFile } from '@decantr/generator-core';

/** Emit src/state/store.js from store IR */
export function emitStore(store: IRStoreNode): GeneratedFile {
  const signals = store.pageSignals;

  const code = [
    `import { createSignal, createStore } from 'decantr/state';`,
    ``,
    `// Application store`,
    `export const [appState, setAppState] = createStore({`,
    `  currentPage: '${signals[0]?.name || 'home'}',`,
    `  sidebarOpen: true,`,
    `});`,
    ``,
    `// Page-level signals`,
    ...signals.map(s =>
      `export const [${s.name}Active, set${s.pascalName}Active] = createSignal(false);`
    ),
    ``,
  ].join('\n');

  return { path: 'src/state/store.js', content: code };
}
