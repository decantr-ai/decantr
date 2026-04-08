import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

try {
  process.loadEnvFile?.(fileURLToPath(new URL('.env.local', import.meta.url)));
} catch {
  // Root workspace tests should still run when the local env file is absent.
}

export default defineConfig({
  test: {
    environment: 'node',
  },
});
