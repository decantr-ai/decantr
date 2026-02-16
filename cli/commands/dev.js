import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function run() {
  const cwd = process.cwd();
  let config = { dev: { port: 3000 } };

  try {
    const raw = await readFile(join(cwd, 'decantr.config.json'), 'utf-8');
    config = JSON.parse(raw);
  } catch (e) {
    // Use defaults
  }

  const port = config.dev?.port || 3000;
  const { startDevServer } = await import('../../tools/dev-server.js');
  startDevServer(cwd, port);
}
