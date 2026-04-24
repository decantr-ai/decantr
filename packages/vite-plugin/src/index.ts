import { join } from 'node:path';
import type { EssenceFile } from '@decantr/essence-spec';
import { evaluateGuard } from '@decantr/essence-spec';
import type { Plugin, ViteDevServer } from 'vite';
import { formatViolations } from './overlay.js';
import { createDebouncedGuard, loadEssence, shouldTriggerGuard } from './watcher.js';

export interface DecantrPluginOptions {
  /** Path to the essence file, relative to project root. Default: 'decantr.essence.json' */
  essencePath?: string;
  /** Debounce delay in ms before running guard after a file change. Default: 300 */
  debounceMs?: number;
}

export function decantrPlugin(options: DecantrPluginOptions = {}): Plugin {
  const essenceFileName = options.essencePath ?? 'decantr.essence.json';
  const debounceMs = options.debounceMs ?? 300;

  let essence: EssenceFile | null = null;
  let root = '';

  function runGuard(server: ViteDevServer): void {
    const essencePath = join(root, essenceFileName);
    essence = loadEssence(essencePath);

    if (!essence) {
      server.hot.send({
        type: 'error',
        err: { message: '', stack: '', plugin: '@decantr/vite-plugin' },
      });
      return;
    }

    const violations = evaluateGuard(essence, {});
    const overlayError = formatViolations(violations);

    if (overlayError) {
      server.config.logger.warn(`[decantr] ${violations.length} guard violation(s) detected`, {
        timestamp: true,
      });
      server.hot.send({
        type: 'error',
        err: {
          message: overlayError.message,
          stack: overlayError.frame,
          plugin: overlayError.plugin,
        },
      });
    }
  }

  return {
    name: 'decantr-guard',

    configureServer(server) {
      root = server.config.root;

      const debouncedGuard = createDebouncedGuard(() => runGuard(server), debounceMs);

      server.httpServer?.once('listening', () => {
        runGuard(server);
      });

      server.watcher.on('change', (filePath: string) => {
        const relative = filePath.startsWith(root) ? filePath.slice(root.length + 1) : filePath;

        if (relative === essenceFileName || relative.endsWith('decantr.essence.json')) {
          runGuard(server);
        } else if (shouldTriggerGuard(relative)) {
          debouncedGuard();
        }
      });
    },
  };
}

export default decantrPlugin;
export type { EssenceFile, GuardContext, GuardViolation } from '@decantr/essence-spec';
