import type { GeneratorPlugin, IRAppNode, IRPageNode, GeneratedFile } from '@decantr/generator-core';
import { emitApp } from './emit-app.js';
import { emitPage } from './emit-page.js';
import { emitStore } from './emit-store.js';
import { emitNotFound, emitIndexHtml } from './emit-shared.js';

export function createDecantrPlugin(): GeneratorPlugin {
  return {
    name: 'decantr',
    target: 'decantr',
    emit(app: IRAppNode): GeneratedFile[] {
      const files: GeneratedFile[] = [];

      // App shell
      files.push(emitApp(app));

      // Pages
      for (const child of app.children) {
        if (child.type === 'page') {
          files.push(emitPage(child as IRPageNode));
        }
      }

      // Store
      files.push(emitStore(app.store));

      // Shared files
      files.push(emitNotFound());
      files.push(emitIndexHtml(app));

      return files;
    },
  };
}
