import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { runMobileSmoke } from '../lib/mobile-smoke.mjs';
import { CHROME_BINARY } from '../lib/config.mjs';

test('Puppeteer launches isolated Chrome, seeds local auth, and captures both viewports', {
  skip:
    !existsSync(CHROME_BINARY) &&
    'Local Chrome binary is unavailable; browser validation requires Chrome.',
  timeout: 30_000,
}, async () => {
  const outputDir = mkdtempSync(join(tmpdir(), 'decantr-browser-triage-'));
  let authObserved = false;
  const server = createServer((request, response) => {
    if (request.url.startsWith('/probe')) {
      if (request.url.includes('auth=true')) authObserved = true;
      response.writeHead(204);
      response.end();
      return;
    }
    response.setHeader('content-type', 'text/html');
    response.end(
      '<!doctype html><html><body><main>Local harness fixture</main><script>fetch("/probe?auth="+localStorage.getItem("decantr_authenticated"))</script></body></html>',
    );
  });
  try {
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const results = await runMobileSmoke({
      baseUrl: `http://127.0.0.1:${server.address().port}`,
      outputDir,
      routes: [{ name: 'home', path: '/' }],
      viewports: [
        { name: 'mobile', width: 375, height: 667, dpr: 2, mobile: true },
        { name: 'desktop', width: 1440, height: 900, dpr: 1, mobile: false },
      ],
    });
    assert.equal(results.length, 2);
    assert.ok(
      results.every((result) => result.ok),
      JSON.stringify(results),
    );
    assert.ok(authObserved, 'Auth-seeded navigation was not observed.');
    for (const [index, expected] of [
      [0, [750, 1334]],
      [1, [1440, 900]],
    ]) {
      const bytes = readFileSync(results[index].file);
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], expected);
    }
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    rmSync(outputDir, { recursive: true, force: true });
  }
});
