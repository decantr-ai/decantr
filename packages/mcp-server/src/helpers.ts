import { createResolver, type ContentResolver } from '@decantr/registry';
import { join } from 'node:path';

const MAX_INPUT_LENGTH = 1000;

export function validateStringArg(args: Record<string, unknown>, field: string): string | null {
  const val = args[field];
  if (!val || typeof val !== 'string') {
    return `Required parameter "${field}" must be a non-empty string.`;
  }
  if (val.length > MAX_INPUT_LENGTH) {
    return `Parameter "${field}" exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`;
  }
  return null;
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 80;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length ? 60 : 0;
}

let _resolver: ContentResolver | null = null;

export function getResolver(): ContentResolver {
  if (!_resolver) {
    const cwd = process.cwd();
    // Try project-local content first, then monorepo content
    _resolver = createResolver({
      contentRoot: join(cwd, 'node_modules', '@decantr', 'content'),
      overridePaths: [join(cwd, 'src', 'registry-content')],
    });
  }
  return _resolver;
}

export function resetResolver(): void {
  _resolver = null;
}
