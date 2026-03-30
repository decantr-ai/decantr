import { readFileSync, existsSync } from 'node:fs';
import { normalizeEssence } from '@decantr/essence-spec';
import type { EssenceFile } from '@decantr/essence-spec';

export function loadEssence(filePath: string): EssenceFile | null {
  if (!existsSync(filePath)) return null;

  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    return normalizeEssence(raw);
  } catch {
    return null;
  }
}

const TRIGGER_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte', '.astro',
]);

const IGNORE_PATTERNS = [
  'node_modules',
  '.decantr',
  'decantr.essence.json',
];

export function shouldTriggerGuard(filePath: string): boolean {
  if (IGNORE_PATTERNS.some(p => filePath.includes(p))) return false;

  const ext = filePath.slice(filePath.lastIndexOf('.'));
  return TRIGGER_EXTENSIONS.has(ext);
}

export function createDebouncedGuard(
  callback: () => void,
  delayMs: number,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      callback();
    }, delayMs);
  };
}
