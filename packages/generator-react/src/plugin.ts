import type { GeneratorPlugin, IRAppNode, IRPageNode, GeneratedFile } from '@decantr/generator-core';
import { emitApp } from './emit-app.js';
import { emitPage } from './emit-page.js';
import {
  emitPackageJson, emitTailwindConfig, emitViteConfig,
  emitGlobalsCss, emitUtils, emitTsConfig, emitIndexHtml, emitNotFound,
} from './emit-shared.js';

export function createReactPlugin(): GeneratorPlugin {
  return {
    name: 'react',
    target: 'react',
    emit(app: IRAppNode): GeneratedFile[] {
      const files: GeneratedFile[] = [];

      // Project scaffolding
      files.push(emitPackageJson(app));
      files.push(emitTailwindConfig());
      files.push(emitViteConfig());
      files.push(emitGlobalsCss(app));
      files.push(emitUtils());
      files.push(emitTsConfig());
      files.push(emitIndexHtml());

      // App shell
      files.push(emitApp(app));

      // Pages
      for (const child of app.children) {
        if (child.type === 'page') {
          files.push(emitPage(child as IRPageNode));
        }
      }

      // 404 page
      files.push(emitNotFound());

      return files;
    },
  };
}
