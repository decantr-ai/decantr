import type { GeneratorPlugin, IRAppNode, IRPageNode, IRHookType, GeneratedFile } from '@decantr/generator-core';
import { emitApp } from './emit-app.js';
import { emitAuth } from './emit-auth.js';
import { emitTheme } from './emit-theme.js';
import { emitPage } from './emit-page.js';
import { emitHooks } from './emit-hooks.js';
import {
  emitPackageJson, emitTailwindConfig, emitViteConfig,
  emitGlobalsCss, emitUtils, emitTsConfig, emitIndexHtml, emitNotFound,
} from './emit-shared.js';
import { validateReactOutput } from './quality-rules.js';

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

      // App shell (includes auth wrapping when features includes "auth")
      files.push(emitApp(app));

      // THEME: ThemeProvider + optional ThemeToggle
      files.push(...emitTheme(app));

      // AUTH: Auth scaffolding (AuthContext, LoginPage, ProtectedRoute)
      files.push(...emitAuth(app));

      // AUTO: Collect all hook types needed across pages, then emit hook files
      const allHookTypes = new Set<IRHookType>();
      for (const child of app.children) {
        if (child.type === 'page') {
          const page = child as IRPageNode;
          if (page.wiring?.hooks) {
            for (const h of page.wiring.hooks) {
              allHookTypes.add(h);
            }
          }
        }
      }
      if (allHookTypes.size > 0) {
        files.push(...emitHooks(allHookTypes));
      }

      // Pages
      for (const child of app.children) {
        if (child.type === 'page') {
          files.push(emitPage(child as IRPageNode));
        }
      }

      // 404 page
      files.push(emitNotFound());

      // AUTO: Post-generation quality check (Vercel React best practices)
      const violations = validateReactOutput(files);
      if (violations.length > 0) {
        for (const v of violations) {
          const loc = v.line ? `:${v.line}` : '';
          console.warn(`[quality:${v.severity}] ${v.rule} — ${v.file}${loc}: ${v.message}`);
        }
      }

      return files;
    },
  };
}
